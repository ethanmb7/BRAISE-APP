import { RichText } from "@/components/RichText";
import { toRichMath } from "@/lib/course/mathSymbols";

// Course content is written with the plain Unicode symbols a teacher types (ℕ ℤ ∈ ∉ ⊂). They are
// drawn through KaTeX — the renderer the flashcards already use — so a blackboard-bold N looks the
// same on every phone, a screen reader gets the MathML, and richer expressions (written with $…$)
// work the day a chapter needs them, with no second renderer.
export function MathText({ text }: { text: string }) {
  return <RichText text={toRichMath(text)} />;
}
