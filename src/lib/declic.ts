// "Le Déclic" — BRAISE's learning method (PRODUCT_VISION.md, section 4): "Situation → Choix →
// Réaction → Déclic". A notion is a chain of tiny cards, never a page of course text — the
// question comes before the explanation, not after it, and each card asks for one tap (or, for
// the closing reformulation, one short sentence) before the next beat appears. Content is fully
// authored and validated ahead of time, same reasoning as before: an AI improvising the situations
// live risks a wrong or misleading one reaching a student with nobody checking it first.
//
// The scripts themselves are NOT written here any more — they live as plain-text ".txt" files in
// src/content/declic/, in a format a non-developer (a teacher, a psychologist) can write without
// touching this file. See src/content/declic/README.md for the format, src/lib/declicParser.ts
// for the parser, and `npm run declic:check` to validate every file before it ships.
import { parseDeclicScript } from "@/lib/declicParser";

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
  /** A genuinely different angle on the same idea, offered only if the student taps "j'ai
   *  toujours pas compris" after this reaction — never the same explanation said more slowly. */
  altExplanation?: string;
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
  | { kind: "declic"; line: string }
  /** "Ce que ton prof attend de toi" — the bridge from "j'ai compris" to "je sais l'écrire au
   *  contrôle". Always the last card: BRAISE stays serious about the bac even while the way there
   *  is anti-scolaire. */
  | { kind: "fiche"; title: string; retenir: string; piege?: string };

export type DeclicScript = {
  chapterId: string;
  cards: DeclicCard[];
  /** The FLASHCARDS id that resurfaces this same notion in Réviser's own spaced-repetition
   *  schedule after the Déclic — see PRODUCT_VISION.md's "consolidation différée, sur le même
   *  moteur que Réviser". Optional only because content authored before this existed doesn't
   *  have one yet; every ".declic" file should set CARTE_REVISION. */
  reviewCardId?: string;
  /** The non-scolaire hook shown on the chapter path instead of the chapter's real name (e.g.
   *  "Pourquoi ton argent perd de la valeur ?" instead of "Inflation") — SubjectView shows this
   *  in place of the chapter title for any chapter that has a Déclic script, real name kept as a
   *  small caption underneath. Optional for the same reason as reviewCardId: older content
   *  written before this existed doesn't have one yet. */
  hook?: string;
};

// Eagerly loaded as raw text at build time — every ".txt" file here becomes one entry, keyed by
// its own NOTION id. A single broken file is logged and skipped rather than crashing every other
// notion; `npm run declic:check` is what should catch that before it ever reaches this point.
const files = import.meta.glob("../content/declic/*.txt", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const DECLIC_SCRIPTS: Record<string, DeclicScript> = {};
for (const [path, raw] of Object.entries(files)) {
  const name = path.split("/").pop() ?? path;
  try {
    const script = parseDeclicScript(raw, name);
    DECLIC_SCRIPTS[script.chapterId] = script;
  } catch (e) {
    console.error(`[declic] ${name} ignoré :`, e instanceof Error ? e.message : e);
  }
}

export function hasDeclicScript(chapterId: string): boolean {
  return chapterId in DECLIC_SCRIPTS;
}

// The Déclic memory (PRODUCT_VISION.md, "La mémoire du Déclic"): what actually worked for this
// student on this notion, so a later mix-up can point back to it instead of starting cold.
// localStorage, like every other local-only record in this app — same reasoning as
// lib/celebrations.ts, not routed through the account-sync model in lib/persist.ts because this
// is per-notion history, not account progress.
export const DECLIC_MEMORY_KEY = "sapie_declic_memory";

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
