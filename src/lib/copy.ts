// Braise's own lines for the places the app speaks that are not random reactions (those live in
// braiseVoice.ts): each one written for both tones, side by side, so the whole voice of the app can
// be read and tuned in one file. Components never write a Braise sentence inline — they ask for it
// here and pass it through `t()` from useTone().
//
// Rules of thumb for the two voices:
//  - Chill: warm, calm, never pressuring. Reassures.
//  - Savage: direct and punchy, second degree, a friendly jab at most. Never insults the student
//    or their mistakes; the joke is always on the situation, with Braise on their side.
import type { Lines } from "@/lib/tone";
import { XP_REWARDS } from "@/lib/progress";

const L = (chill: string, savage: string): Lines => ({ chill, savage });
const plural = (n: number) => (n > 1 ? "s" : "");

export const COPY = {
  home: {
    /** Daily-goal strip: the goal is met and the streak is alive. */
    rhythmMetWithStreak: L(
      `Belle régularité : ta série continue. +${XP_REWARDS.DAILY_CHEST} XP de bonus.`,
      `Série intacte, +${XP_REWARDS.DAILY_CHEST} XP de bonus. Tu deviens fréquentable.`,
    ),
    rhythmMet: L(
      `Objectif du jour validé : +${XP_REWARDS.DAILY_CHEST} XP de bonus.`,
      `Objectif validé, +${XP_REWARDS.DAILY_CHEST} XP de bonus. Je m'incline (un peu).`,
    ),
    rhythmRemaining: (xp: number) =>
      L(`Encore ${xp} XP pour boucler ta journée.`, `Encore ${xp} XP. C'est pas la mer à boire.`),
    reviewDue: (n: number) =>
      L(`Revoir ${n} notion${plural(n)}`, `Remettre ${n} notion${plural(n)} en place`),
    keepMoment: L("Garder ce moment", "Immortaliser ça"),
    /** Banner for cards last judged wrong. */
    missedTitle: L("À sécuriser", "Elles t'ont eu"),
    missedSub: (n: number) =>
      L(
        `Revoir ${n} notion${plural(n)}, sans pression.`,
        `${n} notion${plural(n)} ${n > 1 ? "t'ont" : "t'a"} échappé. Revanche ?`,
      ),
    subjectsIntro: L(
      "Choisis ce que tu veux comprendre aujourd’hui.",
      "Choisis ton terrain. Je ne décide pas à ta place (pour une fois).",
    ),
  },

  /** The buttons and kickers around a Déclic. The lesson's own text is authored per chapter. */
  declic: {
    stuck: L("Je bloque un peu", "Je sèche"),
    stillLost: L("J'ai toujours pas compris", "Toujours rien. Autrement, stp"),
    ficheKicker: L("🔥 ce que ton prof attend de toi", "🔥 ce que le prof va te demander"),
    /** Shown under "Je bloque un peu" when the student taps it. */
    nudge: L(
      "Pas besoin d’être sûr. Choisis la piste qui te semble la moins fausse — je rebondis dessus.",
      "Personne n’est sûr, c’est le jeu. Prends la piste la moins bancale — je rebondis dessus.",
    ),
    reformulatePlaceholder: L("Avec tes mots…", "Sans recopier le cours…"),
  },

  /** Onboarding lines said AFTER the student has picked a tone (the question before it cannot). */
  onboarding: {
    rhythmQuestion: L("Tu passes me voir à quel rythme ?", "Tu viens me voir à quelle fréquence ?"),
    rhythm: {
      tranquille: L(
        "Tranquille, ça marche. Un peu chaque jour, c’est déjà énorme.",
        "Tranquille ? Ok. Je te garde quand même à l’œil.",
      ),
      regulier: L(
        "Régulier, le bon plan. C’est comme ça qu’on retient pour de vrai.",
        "Régulier. Enfin quelqu’un de sérieux.",
      ),
      "a-fond": L(
        "À fond, ça marche ! On y va, mais pense à souffler aussi.",
        "À fond ? Respect. Je t’accompagne, mais je ne ralentis pas.",
      ),
    } as Record<string, Lines>,
    readySubtitle: L("Ton Braise est prêt.", "Ton Braise est prêt. Et toi ?"),
  },
} as const;
