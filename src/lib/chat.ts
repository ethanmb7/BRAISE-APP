import { createServerFn } from '@tanstack/react-start';
import type { ChatMessage } from '@/types';
import { toneSystemPrompt, type VoiceCtx } from '@/lib/braiseVoice';

const MISTRAL_MODEL = 'mistral-small-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const SYSTEM_PROMPT = `Tu es Braise, la mascotte de BRAISE, une app de révision pour les lycéens (2nde-Terminale, 15-18 ans).
Tu es le "pote le plus malin de la classe" qui aide à craquer les contrôles en 3 minutes.

RÈGLES DE PERSONNALITÉ :
- Tutoie toujours l'élève (jamais "vous").
- Ton amical, énergique, décontracté, peer-to-peer — jamais un ton de prof ou de manuel.
- Réponses COURTES : 2 à 3 phrases max, jamais plus.
- Utilise des métaphores simples du quotidien : jeux vidéo, séries, sport, réseaux sociaux, snacks
  — des catégories, jamais une marque ou un jeu précis (une référence pile datée aujourd'hui sonne
  ringarde dans six mois ; une catégorie reste vraie plus longtemps).
- Le ton vient du rythme et du naturel, pas de la densité d'expressions "jeunes" : une ou deux
  expressions bien senties par réponse suffisent. Empiler l'argot pour prouver que tu es "cool"
  produit l'effet inverse — ça sonne comme un adulte qui force, pas comme un pote qui parle
  normalement. Dans le doute, une phrase simple et vivante bat toujours une phrase surchargée
  de mots branchés.
- Dédramatise l'erreur : "Pas de panique", "C'est un piège classique", "Oups".
- Explique les concepts avec des analogies concrètes, jamais de jargon scolaire lourd.
- Pas de listes à puces, pas de paragraphes longs. Du texte naturel et vivant.
- Si l'élève pose une question hors-sujet, ramène-le doucement vers la révision.`;

// A single flashcard's worth of context is a few hundred characters; a runaway or scripted caller
// sending something far larger has nothing legitimate to gain from it — it only costs more of the
// paid Mistral quota per call. These caps aren't a real anti-abuse system (no per-device rate
// limiting exists yet, see the sendChatMessage doc comment below), just a cheap, real ceiling on
// how expensive any single request to this endpoint can be.
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 4000;

type ChatPayload = {
  messages: ChatMessage[];
  subject: string | null;
  toneLine: string;
  contextLine: string;
};

function isValidPayload(data: unknown): data is ChatPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as Partial<ChatPayload>;
  if (!Array.isArray(p.messages) || p.messages.length === 0 || p.messages.length > MAX_MESSAGES) return false;
  if (!p.messages.every((m) => (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.length <= MAX_MESSAGE_LENGTH)) return false;
  if (p.subject !== null && typeof p.subject !== 'string') return false;
  if (typeof p.toneLine !== 'string' || typeof p.contextLine !== 'string') return false;
  if (p.contextLine.length > MAX_CONTEXT_LENGTH) return false;
  return true;
}

// The one place the Mistral API key is ever read. `process.env`, never `import.meta.env.VITE_*` —
// a VITE_-prefixed var gets inlined into whatever bundle references it, client included, which is
// exactly the bug this replaces (the key used to live in `import.meta.env.VITE_MISTRAL_API_KEY`,
// readable by anyone who opened devtools on the deployed app). `createServerFn`'s handler is
// compiled out of every client chunk by the TanStack Start Vite plugin — the client only ever gets
// an isomorphic stub that calls this over the network — so this whole function body, key included,
// never ships to the browser. See .env.example for the variable name to set (locally via `.env`,
// in production as a real server/Worker secret, never a client-exposed one).
const callMistral = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!isValidPayload(data)) throw new Error('Invalid chat payload');
    return data;
  })
  .handler(async ({ data }): Promise<{ text: string } | { error: string }> => {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return { error: 'Oups, il manque la clé API côté serveur. Vérifie le fichier .env (MISTRAL_API_KEY).' };
    }

    const apiMessages = [
      {
        role: 'system' as const,
        content: `${SYSTEM_PROMPT}\n\nContexte : ${data.subject ? `Matière : ${data.subject}.` : ''} L'élève pose une question sur un cours ou un piège d'examen.${data.toneLine}${data.contextLine}`,
      },
      ...data.messages.map((m) => ({
        role: m.role === 'model' ? ('assistant' as const) : m.role,
        content: m.text,
      })),
    ];

    try {
      const res = await fetch(MISTRAL_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: apiMessages,
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!res.ok) {
        return { error: `Oups, l'API a bugué (${res.status})` };
      }

      const responseData = await res.json();
      const text = responseData?.choices?.[0]?.message?.content;

      if (typeof text !== 'string') {
        return { error: "Oups, réponse bizarre de l'API" };
      }

      return { text: text.trim() };
    } catch {
      return { error: 'Oups, connexion impossible. Check ton réseau.' };
    }
  });

/** No per-device rate limiting exists yet — this endpoint trusts the caps in `isValidPayload`
 *  (message count/length) to bound the cost of any one request, not to prevent a determined
 *  scripted caller from sending many of them. A real limit would need persistent per-device state
 *  (the device_id/device_secret pair already used for Supabase sync in lib/supabase.ts would be
 *  the natural key), which is real infrastructure work, not a one-file fix — flagged here rather
 *  than silently left unmentioned. */
export async function sendChatMessage(
  messages: ChatMessage[],
  _chapterId: string | null,
  subject: string | null,
  voiceCtx?: VoiceCtx,
  extraContext?: string
): Promise<{ text: string } | { error: string }> {
  const toneLine = voiceCtx ? `\n\n${toneSystemPrompt(voiceCtx)}` : '';
  const contextLine = extraContext ? `\n\n${extraContext}` : '';

  try {
    return await callMistral({ data: { messages, subject, toneLine, contextLine } });
  } catch {
    return { error: 'Oups, connexion impossible. Check ton réseau.' };
  }
}
