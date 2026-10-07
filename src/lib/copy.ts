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
        `${n} notion${plural(n)} à rafraîchir, quand tu veux.`,
        `${n} notion${plural(n)} à remettre en place. Allez, vite fait.`,
      ),
    allSet: L(
      "Tout est acquis ici. Tu peux souffler, ou rejouer pour le plaisir.",
      "Tout est acquis. Je n'ai plus rien à te reprocher. Étrange.",
    ),
  },

  /** "Où on va ?": what Braise says under the worlds, from what she would suggest. */
  world: {
    title: L("Où on va ?", "Alors, on va où ?"),
    kicker: L("Choisis ton monde", "Choisis ton terrain"),
    saysResume: L(
      "Où tu veux. Moi, je reprendrais là où tu en étais.",
      "Où tu veux. Moi, je finirais ce que tu as commencé.",
    ),
    saysReinforce: L(
      "Où tu veux. Moi, je commencerais par ce qui se mélange encore.",
      "Où tu veux. Moi, je m'occuperais de ce qui te résiste.",
    ),
    saysReview: (n: number) =>
      L(
        `Où tu veux. ${n} notion${plural(n)} à rafraîchir, si ça te dit.`,
        `Où tu veux. ${n} notion${plural(n)} à remettre en place, si tu as le cran.`,
      ),
    saysNext: L(
      "Où tu veux. Moi, j'essaierais quelque chose de nouveau.",
      "Où tu veux. Moi, j'attaquerais du neuf.",
    ),
    teaserNew: L(
      "Six matières, toutes ouvertes. Choisis celle qui te fait envie.",
      "Six matières, aucune verrouillée. Même toi, tu en trouveras une qui te plaît.",
    ),
    teaserDue: (n: number) =>
      L(
        `${n} notion${plural(n)} à rafraîchir. Choisis où tu veux aller.`,
        `${n} notion${plural(n)} à remettre en place. Mais choisis où tu veux aller.`,
      ),
    teaserBack: L(
      "Tes cours sont là. Reprends où tu veux.",
      "Tes cours t'attendent. Ils sont patients, eux.",
    ),
    saysAllSet: L(
      "Tout est au point. Choisis ce qui te fait envie.",
      "Tout est au point. Rien à te reprocher, c'est louche.",
    ),
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
