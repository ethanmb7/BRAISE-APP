export type BraiseRankId = "bronze" | "argent" | "or" | "platine" | "legende";

// Braise's per-rank palette and silhouette — shared by the SVG character and the canvas
// share card, so both always draw the same Braise.
export const BRAISE_RANK_COLORS: Record<BraiseRankId, [string, string, string]> = {
  bronze: ["#F04418", "#FF7A1A", "#FFD84B"],
  argent: ["#1859A9", "#3B91E8", "#BDEBFF"],
  or: ["#A63D11", "#F08A16", "#FFE06B"],
  platine: ["#482080", "#7655D8", "#52E2DD"],
  legende: ["#861C42", "#F04418", "#FFD84B"],
};

// The two asymmetric tips are Braise's fixed signature. Width, stance and edge language mature.
export const BRAISE_BODY_PATHS: Record<BraiseRankId, string> = {
  bronze:
    "M25 79 C20 65 25 53 36 44 C33 35 37 29 43 34 L49 40 C50 28 58 16 66 9 C71 5 74 10 71 17 C68 27 71 34 79 43 C88 53 91 67 86 81 C81 96 69 103 53 103 C38 103 29 95 25 79 Z",
  argent:
    "M24 81 C19 64 26 51 36 41 L35 27 L47 36 C49 24 56 11 64 5 C69 1 74 5 71 14 C69 25 72 33 80 41 C90 52 92 67 87 82 C82 98 68 106 52 106 C36 106 27 96 24 81 Z",
  or: "M17 82 C14 64 24 49 36 41 L31 27 L45 35 C47 22 56 10 65 5 C71 2 76 7 72 16 C70 25 75 33 84 42 C95 53 98 68 92 84 C86 101 70 108 52 108 C33 108 20 99 17 82 Z",
  platine:
    "M15 84 L20 60 L34 44 L31 27 L45 35 L51 15 L59 31 L74 9 L70 38 L87 48 L95 70 L89 89 L70 108 L43 109 L23 98 Z",
  legende:
    "M10 87 C8 66 20 49 34 40 L30 22 L44 32 L51 7 L59 29 L75 14 L70 39 C90 45 101 64 97 86 C93 106 74 114 52 113 C29 113 13 105 10 87 Z",
};
