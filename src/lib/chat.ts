import type { ChatMessage } from '@/types';
import { toneSystemPrompt, type VoiceCtx } from '@/lib/braiseVoice';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
const MISTRAL_MODEL = 'mistral-small-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const SYSTEM_PROMPT = `Tu es Braise, la mascotte de BRAISE, une app de révision pour les ados de 11 à 18 ans.
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

export async function sendChatMessage(
  messages: ChatMessage[],
  _chapterId: string | null,
  subject: string | null,
  voiceCtx?: VoiceCtx,
  extraContext?: string
): Promise<{ text: string } | { error: string }> {
  if (!MISTRAL_API_KEY) {
    return { error: 'Oups, il manque la clé API. Vérifie le fichier .env' };
  }

  const toneLine = voiceCtx ? `\n\n${toneSystemPrompt(voiceCtx)}` : '';
  const contextLine = extraContext ? `\n\n${extraContext}` : '';

  const apiMessages = [
    {
      role: 'system' as const,
      content: `${SYSTEM_PROMPT}\n\nContexte : ${subject ? `Matière : ${subject}.` : ''} L'élève pose une question sur un cours ou un piège d'examen.${toneLine}${contextLine}`,
    },
    ...messages.map((m) => ({
      role: m.role === 'model' ? ('assistant' as const) : m.role,
      content: m.text,
    })),
  ];

  try {
    const res = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
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

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    if (typeof text !== 'string') {
      return { error: 'Oups, réponse bizarre de l\'API' };
    }

    return { text: text.trim() };
  } catch {
    return { error: 'Oups, connexion impossible. Check ton réseau.' };
  }
}
