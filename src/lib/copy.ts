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
    keepMoment: L("Garder ce moment", "Immortaliser ça"),
  },

  /** A subject's library: what Braise says in the strip under the map, at the one course it points at. */
  library: {
    resumeSays: {
      resume: L(
        "On reprend là où tu t'étais arrêté ?",
        "Tu t'es arrêté en plein vol. On y retourne.",
      ),
      reinforce: L(
        "Deux ou trois points se mélangent encore. On les démêle ensemble ?",
        "Deux ou trois trucs t'ont résisté. Revanche ?",
      ),
      next: L(
        "Celui-là, je le sens bien pour toi.",
        "J'ai choisi. Ne discute pas (enfin, si, mais clique).",
      ),
    } as Record<string, Lines>,
    reviewSays: (n: number) =>
      L(
        `${n} truc${plural(n)} à rallumer, quand tu veux.`,
        `${n} truc${plural(n)} à remettre en place. Je t'attends.`,
      ),
    allSet: L(
      "Tout est dans la poche ici. Tu peux souffler, ou rejouer pour le plaisir.",
      "Tout est dans la poche. Je n'ai plus rien à redire. Étonnant.",
    ),
    moreComing: L("D'autres cours arrivent bientôt.", "D'autres cours arrivent. Patience."),
  },

  /** "Ton brasier" (between the Pioche and "Tes mondes"): the student's notions are embers; they smoulder
   *  ("couvent") when they start to fade, and a short session relights them. Never "éteint", never a number. */
  brasier: {
    title: L("Ton brasier", "Ton brasier, version braise"),
    rallumer: L("Rallumer · 2 min", "Rallume · 2 min"),
    couve: L("Ça couve par endroits.", "Ça couve. Un coup de souffle ?"),
    warm: L("Tout est au chaud.", "Tout est au chaud. Bravo, j'ai rien à dire."),
    lit: L("Ton feu est allumé. À demain.", "Feu allumé. Reviens demain."),
    litBonus: L(
      `Ton feu est allumé, +${XP_REWARDS.DAILY_CHEST} XP. À demain.`,
      `Feu allumé, +${XP_REWARDS.DAILY_CHEST} XP. Reviens demain.`,
    ),
    empty: L(
      "Ton feu attend sa première braise : fais un Déclic.",
      "Pas une braise. Un Déclic pour commencer ?",
    ),
  },

  /** "Un truc important bientôt ?": said to a friend, never as a deadline. No countdown, no urgency. */
  soon: {
    title: L("Un truc important bientôt ?", "Un truc qui compte arrive ?"),
    ask: (subject: string) =>
      L(
        `Un contrôle, un oral en ${subject} ? Dis-moi quand, je m'en occupe.`,
        `Un contrôle, un oral en ${subject} ? Dis-moi quand. Je m'en occupe.`,
      ),
    set: (subject: string) =>
      L(`On prépare ${subject} ensemble.`, `${subject}, on s'y met ensemble. Sans panique.`),
    clear: L("Plus besoin", "Laisse tomber"),
  },

  /** Braise asks to come and see the student now and then (see NOTIFICATIONS.md). The reminders' own texts
   *  are in lib/notifications/copy.ts; these are the screens around them. */
  notif: {
    inviteTitle: L("Je peux passer te voir ?", "Je peux passer, ou je reste dans mon coin ?"),
    inviteBody: L(
      "Une petite notif, au moment que tu choisis. Jamais la nuit, jamais plus d'une par jour.",
      "Une notif, pas dix. À l'heure que tu choisis, jamais la nuit, jamais plus d'une par jour.",
    ),
    inviteYes: L("Oui, choisir mon moment", "Ok, je choisis l'heure"),
    inviteNo: L("Pas maintenant", "Plus tard"),
    brakeTitle: L("Je me suis faite discrète.", "Je me suis calmée."),
    brakeBody: L(
      "Mes messages sont restés sans réponse, alors j'ai arrêté. Tu veux que je revienne, moins souvent ?",
      "Trois messages sans réponse : message reçu. Je reviens si tu veux, mais moins souvent ?",
    ),
    brakeYes: L("Oui, moins souvent", "Ok, mais plus rare"),
    brakeNo: L("Non merci", "Non, laisse-moi tranquille"),
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
