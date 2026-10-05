// "Le Déclic" — BRAISE's learning method (PRODUCT_VISION.md, section 4): "Situation → Choix →
// Réaction → Déclic". A notion is a chain of tiny cards, never a page of course text — the
// question comes before the explanation, not after it, and each card asks for one tap (or, for
// the closing reformulation, one short sentence) before the next beat appears. Content is fully
// authored and validated ahead of time, same reasoning as before: an AI improvising the situations
// live risks a wrong or misleading one reaching a student with nobody checking it first.

export type DeclicVisual = {
  kind: "timeline";
  events: { year: number; label: string }[];
};

export type DeclicChoiceOption = {
  id: string;
  label: string;
  correct?: boolean;
  /** What Braise says back the instant this option is tapped — never a bare "faux". */
  reaction: string;
};

export type DeclicCard =
  /** Braise sets the scene. One line, then "Suite". */
  | { kind: "situation"; text: string; visual?: DeclicVisual }
  /** The student takes a position before anything is explained — the question opens the notion,
   *  it doesn't close it. */
  | { kind: "choice"; prompt: string; options: DeclicChoiceOption[]; visual?: DeclicVisual }
  /** The name/definition/rule, shown only once the student has already built the idea. */
  | { kind: "reveal"; kicker: string; text: string; visual?: DeclicVisual }
  /** Explaining it back, in the student's own words — the one part of the old method kept
   *  deliberately: retrieval in your own words is real evidence of understanding, a tap isn't. */
  | { kind: "reformulation"; prompt: string }
  /** The payoff. Full-bleed, same theatrical weight regardless of which notion led here. */
  | { kind: "declic"; line: string };

export type DeclicScript = {
  chapterId: string;
  cards: DeclicCard[];
};

export const DECLIC_SCRIPTS: Record<string, DeclicScript> = {
  m1: {
    chapterId: "m1",
    cards: [
      { kind: "situation", text: "Imagine une pizza coupée en 2 parts égales. Tu manges 1 part." },
      {
        kind: "choice",
        prompt:
          "Une deuxième pizza identique est coupée en 4 parts égales. Combien de parts tu dois manger pour avoir mangé exactement pareil que la première fois ?",
        options: [
          {
            id: "1",
            label: "1 part",
            reaction: "Pas tout à fait : sur 4 parts, 1 seule c'est moins que sur 2.",
          },
          {
            id: "2",
            label: "2 parts",
            correct: true,
            reaction: "Exactement ! 2 parts sur 4, c'est la même quantité qu'1 part sur 2.",
          },
          {
            id: "3",
            label: "3 parts",
            reaction: "Ça ferait plus que la première fois — regarde encore les parts.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Autrement dit : 1/2 et 2/4, c'est la même quantité — juste coupée différemment.",
      },
      {
        kind: "choice",
        prompt: "Et 3/6, tu penses que c'est aussi la même quantité que 1/2 ?",
        options: [
          {
            id: "oui",
            label: "Oui, pareil",
            correct: true,
            reaction: "Exact ! 6 parts, tu en manges 3 — toujours la moitié.",
          },
          {
            id: "non",
            label: "Non, différent",
            reaction: "Recompte : sur 6 parts égales, la moitié, c'est 3.",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 Fractions équivalentes",
        text: "1/2, 2/4, 3/6… ce sont des fractions équivalentes : la même quantité, écrite avec des nombres différents.",
      },
      {
        kind: "choice",
        prompt: "À ton tour : simplifie 4/10 le plus possible.",
        options: [
          {
            id: "2-5",
            label: "2/5",
            correct: true,
            reaction: "Voilà. Tu divises le haut ET le bas par 2 — on ne peut plus simplifier.",
          },
          {
            id: "2-10",
            label: "2/10",
            reaction: "Tu n'as divisé que le haut — fais pareil en bas.",
          },
          { id: "1-5", label: "1/5", reaction: "Presque : tu as divisé par 4, pas par 2." },
        ],
      },
      { kind: "reformulation", prompt: "Explique à un pote, avec tes mots, pourquoi 1/2 = 2/4." },
      { kind: "declic", line: "Voilà. Maintenant t'as capté les fractions équivalentes." },
    ],
  },

  // Second notion, deliberately in a very different subject — same card chain, no bespoke
  // screen: only this one card's visual (a timeline instead of nothing) changes per subject.
  h1: {
    chapterId: "h1",
    cards: [
      {
        kind: "situation",
        text: "14 juillet 1789 : le peuple de Paris prend la Bastille. C'est le début de la Révolution.",
      },
      {
        kind: "choice",
        prompt: "À ton avis, le roi Louis XVI est exécuté…",
        options: [
          {
            id: "meme-annee",
            label: "La même année, en 1789",
            reaction:
              "Pas si vite : entre la prise de la Bastille et l'exécution du roi, il se passe bien plus de temps que ça.",
          },
          {
            id: "plus-tard",
            label: "Plusieurs années plus tard",
            correct: true,
            reaction: "Exact ! Quatre ans plus tard, en 1793.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Entre les deux, beaucoup de choses changent : dès août 1789, la Déclaration des droits de l'homme proclame liberté et égalité.",
      },
      {
        kind: "choice",
        prompt: "La Déclaration des droits de l'homme arrive…",
        options: [
          {
            id: "avant",
            label: "Avant la Bastille",
            reaction: "Non — la Bastille tombe en premier, en juillet.",
          },
          {
            id: "meme-annee",
            label: "Juste après la Bastille, la même année",
            correct: true,
            reaction: "Exact ! Un mois plus tard, toujours en 1789.",
          },
          {
            id: "apres-execution",
            label: "Après l'exécution du roi",
            reaction: "Non, c'est même le contraire : elle arrive bien avant, dès 1789.",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 1789 ≠ 1793",
        text: "La prise de la Bastille (1789) et l'exécution de Louis XVI (1793) sont deux événements bien distincts, séparés de 4 ans.",
        visual: {
          kind: "timeline",
          events: [
            { year: 1789, label: "Prise de la Bastille" },
            { year: 1793, label: "Exécution de Louis XVI" },
          ],
        },
      },
      {
        kind: "choice",
        prompt: "Parmi ces trois événements, lequel arrive en dernier ?",
        options: [
          {
            id: "bastille",
            label: "Prise de la Bastille",
            reaction: "Non, celui-là ouvre la liste, en 1789.",
          },
          {
            id: "declaration",
            label: "Déclaration des droits de l'homme",
            reaction: "Non, elle arrive dès 1789, juste après la Bastille.",
          },
          {
            id: "execution",
            label: "Exécution de Louis XVI",
            correct: true,
            reaction: "Exact. 1793 — le dernier des trois, et de loin.",
          },
        ],
      },
      {
        kind: "reformulation",
        prompt: "Explique avec tes mots pourquoi on ne doit pas confondre ces deux dates.",
      },
      { kind: "declic", line: "Voilà. Maintenant tu as la vraie chronologie en tête." },
    ],
  },

  // Four more subjects, same card chain, no bespoke screen — each built from the misconception
  // already documented in that chapter's own existing checkpoint (STORIES in data.ts), not
  // invented from scratch.
  f1: {
    chapterId: "f1",
    cards: [
      {
        kind: "situation",
        text: "Tu lis un roman écrit à la première personne : « Je marchais dans la rue… »",
      },
      {
        kind: "choice",
        prompt: "À ton avis, qui parle ? L'auteur du livre, ou quelqu'un d'autre ?",
        options: [
          {
            id: "auteur",
            label: "L'auteur lui-même",
            reaction:
              "C'est le piège classique ! Regarde ce qui se passe si le narrateur est un tueur en série…",
          },
          {
            id: "narrateur",
            label: "Un personnage inventé, le narrateur",
            correct: true,
            reaction:
              "Exactement ! Le narrateur est une voix créée par l'auteur, presque jamais l'auteur en personne.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Un exemple concret : dans un roman policier, le narrateur peut être un meurtrier. L'auteur, lui, n'en est pas un.",
      },
      {
        kind: "choice",
        prompt: "Donc l'auteur et le narrateur, c'est…",
        options: [
          {
            id: "meme",
            label: "Toujours la même personne",
            reaction: "Presque jamais, en fait — ce sont deux rôles différents.",
          },
          {
            id: "deux",
            label: "Presque toujours deux personnes différentes",
            correct: true,
            reaction: "Voilà. Le narrateur, c'est un costume que l'auteur enfile pour raconter.",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 Narrateur ≠ Auteur",
        text: "Le narrateur est la voix qui raconte l'histoire ; l'auteur est la personne réelle qui a écrit le livre. Ce sont presque toujours deux personnes différentes.",
      },
      {
        kind: "choice",
        prompt: "Tu binges une série et tu devines déjà la suite. Ça veut dire que tu as capté…",
        options: [
          {
            id: "reflexe",
            label: "Le réflexe du roman : anticiper l'intrigue",
            correct: true,
            reaction:
              "Exact ! Suivre les personnages et deviner la suite, c'est déjà lire comme un pro.",
          },
          {
            id: "rien",
            label: "Rien de spécial",
            reaction: "Si ! C'est même tout l'art du récit.",
          },
        ],
      },
      {
        kind: "reformulation",
        prompt: "Explique avec tes mots pourquoi l'auteur n'est presque jamais le narrateur.",
      },
      { kind: "declic", line: "Voilà. Tu ne confondras plus narrateur et auteur." },
    ],
  },

  s1: {
    chapterId: "s1",
    cards: [
      { kind: "situation", text: "Tu sprintes 100 mètres. Juste après, t'es à bout de souffle." },
      {
        kind: "choice",
        prompt: "Ton corps réclame quoi, en urgence, à ce moment-là ?",
        options: [
          {
            id: "nourriture",
            label: "Plus de nourriture",
            reaction:
              "Pas dans l'immédiat — ce dont tes muscles manquent là, tout de suite, c'est autre chose.",
          },
          {
            id: "oxygene",
            label: "Plus d'oxygène",
            correct: true,
            reaction: "Exact ! Tes muscles réclament de l'O₂ pour continuer à fonctionner.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Cet échange — l'oxygène qui entre, le CO₂ qui sort — se passe tout au fond de tes poumons, dans les alvéoles.",
      },
      {
        kind: "choice",
        prompt: "Donc respirer, c'est la même chose que digérer un repas ?",
        options: [
          {
            id: "oui",
            label: "Oui, c'est pareil",
            reaction:
              "Non — digérer transforme les aliments en énergie. Respirer, c'est un échange de gaz.",
          },
          {
            id: "non",
            label: "Non, ce sont deux choses différentes",
            correct: true,
            reaction: "Exact ! Deux fonctions du corps bien distinctes.",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 Respirer = échanger des gaz",
        text: "La respiration, c'est l'échange de gaz entre l'air et le sang : O₂ inspiré, CO₂ expiré. Rien à voir avec la digestion des aliments.",
      },
      {
        kind: "choice",
        prompt:
          "Plus tu bouges, plus tes muscles ont besoin d'O₂. Donc plus tu cours vite, plus tu respires…",
        options: [
          {
            id: "vite",
            label: "Vite",
            correct: true,
            reaction:
              "Exact ! Plus d'effort, plus d'O₂ nécessaire, donc une respiration plus rapide.",
          },
          {
            id: "lentement",
            label: "Lentement",
            reaction: "À l'inverse : l'effort accélère la respiration.",
          },
        ],
      },
      {
        kind: "reformulation",
        prompt: "Explique avec tes mots pourquoi respirer et digérer, ce n'est pas la même chose.",
      },
      { kind: "declic", line: "Voilà. Tu ne confonds plus respiration et digestion." },
    ],
  },

  p1: {
    chapterId: "p1",
    cards: [
      {
        kind: "situation",
        text: "Ton téléphone, la table, l'air que tu respires… tout est fait des mêmes briques minuscules : les atomes.",
      },
      {
        kind: "choice",
        prompt: "Tu imagines un atome comment ?",
        options: [
          {
            id: "plein",
            label: "Plein, comme une bille",
            reaction:
              "C'est l'intuition la plus courante — mais regarde ce qu'il y a vraiment dedans…",
          },
          {
            id: "vide",
            label: "Surtout du vide, avec un petit noyau au centre",
            correct: true,
            reaction: "Exact ! Le noyau est minuscule comparé à l'espace immense autour de lui.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Autour du noyau (protons + neutrons), des électrons gravitent, loin, dans cet immense vide.",
      },
      {
        kind: "choice",
        prompt: "Un atome a-t-il une charge électrique, globalement ?",
        options: [
          {
            id: "positive",
            label: "Oui, positive",
            reaction: "Presque : il y a des charges positives, mais elles sont compensées.",
          },
          {
            id: "negative",
            label: "Oui, négative",
            reaction: "Presque : il y a des charges négatives, mais elles sont compensées.",
          },
          {
            id: "neutre",
            label: "Non, il est neutre",
            correct: true,
            reaction: "Exact ! Autant de charges positives (protons) que négatives (électrons).",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 L'atome est surtout du vide",
        text: "Un atome, c'est un tout petit noyau entouré d'un immense espace vide où circulent les électrons — pas une bille pleine.",
      },
      {
        kind: "choice",
        prompt: "Si un atome faisait la taille d'un stade de foot, où serait le noyau ?",
        options: [
          {
            id: "balle",
            label: "Une balle de tennis posée au milieu du terrain",
            correct: true,
            reaction:
              "Exact ! C'est à peu près cette proportion-là entre le noyau et l'atome entier.",
          },
          {
            id: "stade",
            label: "Il remplirait tout le stade",
            reaction: "Non — c'est justement l'inverse : minuscule comparé au reste.",
          },
        ],
      },
      {
        kind: "reformulation",
        prompt: "Explique avec tes mots pourquoi un atome n'est pas « plein ».",
      },
      { kind: "declic", line: "Voilà. Tu vois l'atome autrement, maintenant." },
    ],
  },

  a1: {
    chapterId: "a1",
    cards: [
      {
        kind: "situation",
        text: "En anglais, pour parler d'une habitude : « I play football every day. »",
      },
      {
        kind: "choice",
        prompt: "Et pour dire la même chose avec « she » ?",
        options: [
          {
            id: "play",
            label: "She play football every day",
            reaction: "Presque ! Il manque un petit détail à la 3e personne du singulier…",
          },
          {
            id: "plays",
            label: "She plays football every day",
            correct: true,
            reaction: "Exact ! À la 3e personne du singulier (he/she/it), le verbe prend un S.",
          },
        ],
      },
      {
        kind: "situation",
        text: "Ce S est obligatoire : « he like », ça n'existe pas en anglais correct.",
      },
      {
        kind: "choice",
        prompt: "Donc pour « they » (ils/elles), on dit…",
        options: [
          {
            id: "likes",
            label: "They likes music",
            reaction: "Non — le S n'est que pour he/she/it, pas pour they.",
          },
          {
            id: "like",
            label: "They like music",
            correct: true,
            reaction: "Exact ! Pas de S pour I/you/we/they.",
          },
        ],
      },
      {
        kind: "reveal",
        kicker: "🔥 Le S de la 3e personne",
        text: "I/you/we/they + verbe de base. He/she/it + verbe + S. C'est LE réflexe à avoir au present simple.",
      },
      {
        kind: "choice",
        prompt: "« My brother ___ music every night. » (listen)",
        options: [
          {
            id: "listen",
            label: "listen",
            reaction: "Presque ! « Brother » se remplace par « he » — il manque le S.",
          },
          {
            id: "listens",
            label: "listens",
            correct: true,
            reaction: "Exact ! « My brother » = « he » → le S est obligatoire.",
          },
        ],
      },
      {
        kind: "reformulation",
        prompt: "Explique avec tes mots quand il faut ajouter un S au verbe.",
      },
      { kind: "declic", line: "Voilà. T'as le réflexe du S, maintenant." },
    ],
  },
};

export function hasDeclicScript(chapterId: string): boolean {
  return chapterId in DECLIC_SCRIPTS;
}

// The Déclic memory (PRODUCT_VISION.md, "La mémoire du Déclic"): what actually worked for this
// student on this notion, so a later mix-up can point back to it instead of starting cold.
// localStorage, like every other local-only record in this app — same reasoning as
// lib/celebrations.ts, not routed through the account-sync model in lib/persist.ts because this
// is per-notion history, not account progress.
const DECLIC_MEMORY_KEY = "sapie_declic_memory";

export type DeclicMemoryEntry = {
  reformulation: string;
  at: number;
};

function readMemoryMap(): Record<string, DeclicMemoryEntry> {
  try {
    const raw = localStorage.getItem(DECLIC_MEMORY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DeclicMemoryEntry>) : {};
  } catch {
    return {};
  }
}

export function getDeclicMemory(chapterId: string): DeclicMemoryEntry | null {
  return readMemoryMap()[chapterId] ?? null;
}

export function recordDeclicMemory(chapterId: string, entry: DeclicMemoryEntry): void {
  try {
    const map = readMemoryMap();
    map[chapterId] = entry;
    localStorage.setItem(DECLIC_MEMORY_KEY, JSON.stringify(map));
  } catch {
    // ignore quota/availability errors, same defensive pattern as lib/persist.ts
  }
}
