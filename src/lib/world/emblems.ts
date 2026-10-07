// Which monument stands on which island. Chapters drawn by hand have their own; the others are given a
// neutral one by their place, so a whole subject is never several copies of the same picture.
export type EmblemKind =
  | "nombres"
  | "geometrie"
  | "fonctions"
  | "stats"
  | "fractions"
  | "equations"
  | "affine"
  | "hill"
  | "tower"
  | "tent"
  | "tree"
  | "lighthouse"
  | "windmill";

/** Monuments for the chapters that are not drawn by hand yet, picked by the island's place. */
export const NEUTRAL_KINDS: EmblemKind[] = [
  "hill",
  "tower",
  "tent",
  "tree",
  "lighthouse",
  "windmill",
];

/** Chapters drawn by hand. Anything else is given a neutral monument. */
export const CHAPTER_EMBLEMS: Record<string, EmblemKind> = {
  "M2-ARI": "nombres",
  m1: "fractions",
  m2: "geometrie",
  m3: "equations",
  m4: "affine",
  m5: "stats",
};

export function emblemFor(chapterId: string, index: number): EmblemKind {
  return CHAPTER_EMBLEMS[chapterId] ?? NEUTRAL_KINDS[index % NEUTRAL_KINDS.length];
}
