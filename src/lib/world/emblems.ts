// Which monument stands on which island. Every chapter of the app has its own drawing; a chapter added
// later without one is given a neutral monument by its place, so a subject is never several copies of the
// same picture.
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
  | "windmill"
  // Français
  | "book"
  | "quill"
  | "masks"
  | "bubbles"
  // Histoire-Géographie
  | "cap"
  | "bicorne"
  | "temple"
  | "globe"
  // SVT
  | "lungs"
  | "apple"
  | "dna"
  | "sprout"
  // Physique-Chimie
  | "atom"
  | "flask"
  | "bolt"
  | "sun"
  // Anglais
  | "clock"
  | "hourglass"
  | "calendar"
  | "bulb";

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
  f1: "book",
  f2: "quill",
  f3: "masks",
  f4: "bubbles",
  h1: "cap",
  h2: "bicorne",
  h3: "temple",
  h4: "globe",
  s1: "lungs",
  s2: "apple",
  s3: "dna",
  s4: "sprout",
  p1: "atom",
  p2: "flask",
  p3: "bolt",
  p4: "sun",
  a1: "clock",
  a2: "hourglass",
  a3: "calendar",
  a4: "bulb",
};

export function emblemFor(chapterId: string, index: number): EmblemKind {
  return CHAPTER_EMBLEMS[chapterId] ?? NEUTRAL_KINDS[index % NEUTRAL_KINDS.length];
}
