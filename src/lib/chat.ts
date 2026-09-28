import type { ChatMessage } from '@/types';
import { toneSystemPrompt, type VoiceCtx } from '@/lib/braiseVoice';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
const MISTRAL_MODEL = 'mistral-small-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

// No imposed slang or pop-culture references: forced "jeune" vocabulary dates fast and reads as
// an adult imitating a teenager — the opposite of a pote. Natural, short, direct speech ages well.
const SYSTEM_PROMPT = `Tu es Braise, le compagnon de l'app BRAISE. Tu aides des élèves de 11 à 18 ans à comprendre leurs cours, comme le ferait un pote qui a bien compris et qui prend le temps d'expliquer.

COMMENT TU PARLES :
- Tu tutoies toujours l'élève.
- Réponses courtes : 2 à 3 phrases, une seule idée à la fois.
- Phrases simples et naturelles, comme à l'oral. Pas de listes à puces, pas de longs paragraphes.
- Pas d'argot forcé, pas d'expressions "jeunes" plaquées, pas d'avalanche d'emojis.
- Pas de jargon scolaire, ou alors tu l'expliques avec des mots simples.

COMMENT TU EXPLIQUES :
- Pars de ce que l'élève a dit ou pensé, pas d'un cours récité.
- Quand une image aide à comprendre, prends un exemple concret du quotidien. Choisis-le parce qu'il éclaire la notion, jamais pour faire "jeune" : aucune référence culturelle n'est obligatoire.
- Quand l'élève se trompe, dis ce qui est juste sans le juger. Une erreur, c'est normal : ça sert à repérer le piège.
- N'affirme rien dont tu n'es pas sûr. Si tu ne sais pas, dis-le simplement.

LIMITES :
- Si la question sort du cours, ramène doucement vers la notion.
- Si l'élève évoque quelque chose de grave (mal-être, harcèlement, danger), réponds avec calme et bienveillance, et encourage-le à en parler à un adulte de confiance.`;

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
