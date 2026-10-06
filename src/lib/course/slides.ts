// The course of a Déclic as a deck of slides, built from the Déclic itself: no second text to
// write or to keep in step with it. What Braise explains becomes an explanation slide; a worked
// example (the "together" cards) and a trap (the "trap" cards) become slides that show the question
// with its answer and why; the summary is the last slide. The questions the student answers alone
// are not slides: they are what the Déclic is for.
//
// Pure and generic, like the rest of this folder: it knows what a card IS, never what a card says.
import { choiceContent } from "./variants";
import type { DeclicDef, Text, Visual } from "./types";

export type SlideKind = "explain" | "example" | "trap" | "recap";

export type Slide = {
  /** The card the slide comes from. */
  cardId: string;
  kind: SlideKind;
  /** An explanation or the summary; for an example or a trap, the question. */
  text: Text;
  visual?: Visual;
  /** For an example or a trap: the expected answer and why it is the one. */
  answer?: { label: string; because: Text };
};

export function courseSlides(def: DeclicDef): Slide[] {
  const slides: Slide[] = [];
  for (const card of def.cards) {
    switch (card.type) {
      case "reveal":
        slides.push({ cardId: card.id, kind: "explain", text: card.text, visual: card.visual });
        break;
      case "choice": {
        if (card.beat !== "together" && card.beat !== "trap") break;
        // The first version of the question: the slide shows the answer, so a picture that waits for
        // the student's answer in the Déclic can be shown here.
        const content = choiceContent(card);
        const right = content.choices.find((c) => c.correct);
        if (!right) break;
        slides.push({
          cardId: card.id,
          kind: card.beat === "trap" ? "trap" : "example",
          text: content.text,
          visual: content.visual,
          answer: { label: right.label, because: right.feedback },
        });
        break;
      }
      case "declic-summary":
        slides.push({ cardId: card.id, kind: "recap", text: card.text });
        break;
      case "multi-step-choice":
        break;
    }
  }
  return slides;
}
