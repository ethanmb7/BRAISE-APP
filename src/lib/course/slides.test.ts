import { describe, it, expect } from "vitest";
import { getDeclic } from "./registry";
import { courseSlides } from "./slides";
import type { ChoiceCard, DeclicDef, Text } from "./types";

const plain = (t: Text) => (typeof t === "string" ? t : t.text);

describe("the course of a Déclic as slides", () => {
  const pilot = getDeclic("M2-ARI-D02")!;

  it("turns what Braise explains, the worked examples, the traps and the summary into slides", () => {
    const slides = courseSlides(pilot);
    expect(slides.map((s) => [s.cardId.slice(-3), s.kind])).toEqual([
      ["C01", "explain"],
      ["C04", "explain"],
      ["C05", "example"],
      ["C07", "trap"],
      ["C08", "explain"],
      ["C10", "explain"],
      ["C11", "example"],
      ["C13", "trap"],
      ["C16", "recap"],
    ]);
  });

  it("leaves out the questions the student answers alone and the validation", () => {
    const ids = new Set(courseSlides(pilot).map((s) => s.cardId));
    for (const card of pilot.cards) {
      if (card.type === "multi-step-choice") expect(ids.has(card.id), card.id).toBe(false);
      if (card.type === "choice" && (card.beat === "you" || card.beat === undefined)) {
        expect(ids.has(card.id), card.id).toBe(false);
      }
    }
  });

  it("shows the expected answer and why, for an example or a trap", () => {
    const slides = courseSlides(pilot).filter((s) => s.answer);
    expect(slides).toHaveLength(4);
    for (const slide of slides) {
      const card = pilot.cards.find((c) => c.id === slide.cardId) as ChoiceCard;
      const right = card.choices.find((c) => c.correct)!;
      expect(slide.answer!.label).toBe(right.label);
      expect(plain(slide.answer!.because)).toBe(plain(right.feedback));
    }
  });

  it("keeps the pictures of the explanations", () => {
    const withPicture = courseSlides(pilot).filter((s) => s.visual);
    expect(withPicture.map((s) => s.visual!.kind)).toEqual(["groups", "number-line"]);
  });

  it("works for a Déclic written before the rhythm existed: explanations and the summary", () => {
    const slides = courseSlides(getDeclic("M2-ARI-D01")!);
    expect(slides.map((s) => s.kind)).toEqual(["explain", "explain", "recap"]);
  });

  it("gives an empty deck to a Déclic with nothing to show", () => {
    const bare: DeclicDef = JSON.parse(JSON.stringify(pilot));
    bare.cards = bare.cards.filter((c) => c.type === "multi-step-choice");
    expect(courseSlides(bare)).toEqual([]);
  });
});
