import { describe, expect, it } from "vitest";
import { revisionReaction } from "./braiseVoice";
describe("Braise reacts to the actual verdict", () => {
  for (const personality of ["chill", "savage"] as const) {
    const ctx = { personality, age: "lycee" as const };
    it(`${personality}: differentiates a detected bluff from a true claim`, () => {
      expect(revisionReaction(ctx, { correct: true, wasLie: true, doubled: false })).not.toEqual(
        revisionReaction(ctx, { correct: true, wasLie: false, doubled: false }),
      );
    });
    it(`${personality}: acknowledges a bluff on a miss, without false rewards`, () => {
      const line = revisionReaction(ctx, { correct: false, wasLie: true, doubled: false });
      expect(line).toMatch(/bonne|vraie/);
      expect(line).not.toMatch(/XP|neurone|nul|bac/);
    });
    it(`${personality}: mentions the joker only when actually used`, () => {
      expect(revisionReaction(ctx, { correct: true, wasLie: false, doubled: true })).toContain(
        "joker",
      );
    });
  }
});
