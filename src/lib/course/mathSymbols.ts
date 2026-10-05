// Course content is written with the plain Unicode symbols a teacher types (ℕ ℤ ∈ ∉ ⊂). They are
// drawn through KaTeX by the MathText component; this file turns them into the `$…$` markup its
// renderer understands.
const SYMBOLS: Record<string, string> = {
  ℕ: "\\mathbb{N}",
  ℤ: "\\mathbb{Z}",
  ℚ: "\\mathbb{Q}",
  ℝ: "\\mathbb{R}",
  "∈": "\\in",
  "∉": "\\notin",
  "⊂": "\\subset",
  "⊄": "\\not\\subset",
  "∪": "\\cup",
  "∩": "\\cap",
};

const SYMBOL_PATTERN = new RegExp(`[${Object.keys(SYMBOLS).join("")}]`, "g");

/** Wraps each math symbol in `$…$` so RichText draws it with KaTeX; leaves existing `$…$` alone. */
export function toRichMath(text: string): string {
  return text
    .split(/(\$[^$]+\$)/g)
    .map((part) =>
      part.startsWith("$") && part.endsWith("$") && part.length > 1
        ? part
        : part.replace(SYMBOL_PATTERN, (s) => `$${SYMBOLS[s]}$`),
    )
    .join("");
}
