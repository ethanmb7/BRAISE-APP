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
