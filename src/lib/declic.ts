// "Le Déclic" — BRAISE's real learning method (see PRODUCT_VISION.md, section 4). Each script
// below is a fully authored, validated conversation for one notion: the AI is not asked to
// improvise the diagnostic, the explanations or the verification questions — see the vision
// doc's own "reste à trancher" note on why that stays a human-authored decision for now.

export type DeclicChoice = { id: string; label: string };

// A subject-appropriate widget for the explanation step — the actual place a notion's own
// discipline should shape the interface (see PRODUCT_VISION.md discussion on per-subject
// design): a shared conversational shell, but the explanation itself can be a timeline, a
// diagram, a number line... whatever the notion needs, added here as new variants.
export type DeclicVisual = {
  kind: "timeline";
  /** `revealAtStep` is the 0-based index into the explanation's `steps` at which this event
   *  becomes visible — the timeline builds up in sync with what Braise is saying. */
  events: { year: number; label: string; revealAtStep: number }[];
};

export type DeclicExplanation = {
  /** What the explanation is framed as reacting to — shown nowhere, just for authors. */
  title: string;
  /** Each string is one beat, revealed one at a time. */
  steps: string[];
  /** The check-in after the explanation ("ça te parle ?"). */
  checkIn: string;
  /** Optional subject-specific widget shown alongside the text beats. */
  visual?: DeclicVisual;
};

export type DeclicScript = {
  chapterId: string;
  essayer: { question: string; choices: DeclicChoice[]; correctId: string };
  diagnostic: { prompt: string; reasons: { id: string; label: string; explanationId: string }[] };
  /** Keyed by explanationId — `diagnostic.reasons` points into this map. */
  explanations: Record<string, DeclicExplanation>;
  declicLine: string;
  reformulationPrompt: string;
  verification: { question: string; choices: DeclicChoice[]; correctId: string };
  abstraction: {
    question: string;
    choices: DeclicChoice[];
    correctId: string;
    explain: string;
  };
};

// The vision doc's own worked example, word for word: 1/2 = 2/4, the pizza, the reformulation,
// the 3/6 check, the 4/10 simplification. First (and only) notion built end to end on purpose —
// PRODUCT_VISION.md section 10 asks for one real notion validated before generalising, not a
// method half-built across the whole curriculum.
export const DECLIC_SCRIPTS: Record<string, DeclicScript> = {
  m1: {
    chapterId: "m1",
    essayer: {
      question: "1/2 et 2/4, c'est la même quantité ?",
      choices: [
        { id: "oui", label: "Oui, c'est pareil" },
        { id: "non", label: "Non, c'est différent" },
      ],
      correctId: "oui",
    },
    diagnostic: {
      prompt: "Pourquoi tu penses que c'est différent ?",
      reasons: [
        {
          id: "taille",
          label: "Parce que 2 et 4 sont plus grands que 1 et 2",
          explanationId: "pizza-taille",
        },
        { id: "sais-pas", label: "Je sais pas trop", explanationId: "pizza-defaut" },
      ],
    },
    explanations: {
      "pizza-taille": {
        title: "confusion taille des nombres / taille de la quantité",
        steps: [
          "OK, je vois le truc. Imagine deux pizzas identiques.",
          "La première, tu la coupes en 2 parts égales, et t'en manges 1.",
          "La deuxième, tu la coupes en 4 parts égales, et t'en manges 2.",
          "Dans laquelle t'as mangé le plus ?",
        ],
        checkIn: "Alors, ça te parle ?",
      },
      "pizza-defaut": {
        title: "premier passage, pas de diagnostic précis",
        steps: [
          "Pas de souci, on regarde ça ensemble. Imagine deux pizzas identiques.",
          "La première, tu la coupes en 2 parts égales, et t'en manges 1.",
          "La deuxième, tu la coupes en 4 parts égales, et t'en manges 2.",
          "Dans laquelle t'as mangé le plus ?",
        ],
        checkIn: "Ça te parle plus comme ça ?",
      },
    },
    declicLine: "Voilà. Maintenant t'as capté.",
    reformulationPrompt: "Vas-y, explique-moi maintenant pourquoi 1/2 = 2/4, avec tes mots.",
    verification: {
      question: "Et maintenant : 3/6 et 1/2, même quantité ou pas ?",
      choices: [
        { id: "oui", label: "Oui, même quantité" },
        { id: "non", label: "Non, différent" },
      ],
      correctId: "oui",
    },
    abstraction: {
      question: "Simplifie 4/10 le plus possible.",
      choices: [
        { id: "2-5", label: "2/5" },
        { id: "2-10", label: "2/10" },
        { id: "1-5", label: "1/5" },
      ],
      correctId: "2-5",
      explain: "4/10 : tu divises le haut ET le bas par 2 → 2/5. On ne peut plus simplifier.",
    },
  },

  // Second notion, deliberately in a very different subject, to test whether the Déclic shell
  // needs to change per matière or just the explanation widget does — here, a timeline instead
  // of an illustrated reveal. Built from the misconception already documented in this chapter's
  // own AUDIO_TRANSCRIPTS/STORIES content (confusing 1789 and 1793), not invented from scratch.
  h1: {
    chapterId: "h1",
    essayer: {
      question: "La prise de la Bastille et l'exécution de Louis XVI, c'est la même année ?",
      choices: [
        { id: "oui", label: "Oui, la même année" },
        { id: "non", label: "Non, des années différentes" },
      ],
      correctId: "non",
    },
    diagnostic: {
      prompt: "Pourquoi tu penses que c'est la même année ?",
      reasons: [
        {
          id: "meme-evenement",
          label: "Pour moi la Révolution, c'est un seul grand moment",
          explanationId: "timeline-meme-evenement",
        },
        { id: "sais-pas", label: "Je sais pas trop", explanationId: "timeline-defaut" },
      ],
    },
    explanations: {
      "timeline-meme-evenement": {
        title: "confusion : la Révolution vécue comme un instant unique",
        steps: [
          "Je vois l'idée : « la Révolution », ça sonne comme un seul grand moment.",
          "Mais remontons les deux dates ensemble, sur une ligne du temps.",
          "Le 14 juillet 1789, le peuple de Paris prend la Bastille : premier point.",
          "Louis XVI, lui, est exécuté bien plus tard : en 1793. Regarde l'écart.",
        ],
        checkIn: "Ça te parle, l'écart entre les deux ?",
        visual: {
          kind: "timeline",
          events: [
            { year: 1789, label: "Prise de la Bastille", revealAtStep: 2 },
            { year: 1793, label: "Exécution de Louis XVI", revealAtStep: 3 },
          ],
        },
      },
      "timeline-defaut": {
        title: "premier passage, pas de diagnostic précis",
        steps: [
          "Pas de souci, on pose les deux dates ensemble sur une ligne du temps.",
          "Le 14 juillet 1789, le peuple de Paris prend la Bastille : premier point.",
          "Louis XVI, lui, est exécuté bien plus tard : en 1793. Regarde l'écart.",
        ],
        checkIn: "Ça te parle mieux comme ça ?",
        visual: {
          kind: "timeline",
          events: [
            { year: 1789, label: "Prise de la Bastille", revealAtStep: 1 },
            { year: 1793, label: "Exécution de Louis XVI", revealAtStep: 2 },
          ],
        },
      },
    },
    declicLine: "Voilà. Quatre ans séparent ces deux moments.",
    reformulationPrompt:
      "Explique-moi avec tes mots pourquoi ces deux dates ne sont pas la même année.",
    verification: {
      question:
        "La Déclaration des droits de l'homme (août 1789) : avant ou après la prise de la Bastille ?",
      choices: [
        { id: "apres", label: "Après" },
        { id: "avant", label: "Avant" },
      ],
      correctId: "apres",
    },
    abstraction: {
      question: "Parmi ces trois événements, lequel arrive en dernier ?",
      choices: [
        { id: "bastille", label: "Prise de la Bastille" },
        { id: "declaration", label: "Déclaration des droits de l'homme" },
        { id: "execution", label: "Exécution de Louis XVI" },
      ],
      correctId: "execution",
      explain:
        "La Bastille (juillet 1789) et la Déclaration (août 1789) sont la même année. L'exécution de Louis XVI arrive 4 ans plus tard, en 1793.",
    },
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
  explanationId: string;
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
