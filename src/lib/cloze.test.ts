import { describe, expect, it } from "vitest";
import { SUBJECTS } from "@/data";
import {
  CLOZE_CARDS,
  SLOT,
  checkTile,
  clozeForChapter,
  clozePieces,
  clozeTiles,
} from "@/lib/cloze";

const chapterIds = new Set(SUBJECTS.flatMap((s) => s.chapters.map((c) => c.id)));

describe("the sentences with holes", () => {
  it("each belongs to a real chapter, with a unique id", () => {
    expect(new Set(CLOZE_CARDS.map((c) => c.id)).size).toBe(CLOZE_CARDS.length);
    for (const c of CLOZE_CARDS) expect(chapterIds.has(c.chapterId)).toBe(true);
  });

  it("each has as many answers as holes, all different", () => {
    for (const c of CLOZE_CARDS) {
      expect(clozePieces(c).length - 1, c.id).toBe(c.answers.length);
      expect(new Set(c.answers).size, c.id).toBe(c.answers.length);
      expect(c.text.includes(SLOT), c.id).toBe(true);
    }
  });

  it("each wrong tile has a reason, and never repeats an answer", () => {
    for (const c of CLOZE_CARDS) {
      expect(Object.keys(c.distractors).length, c.id).toBeGreaterThanOrEqual(2);
      for (const [tile, reason] of Object.entries(c.distractors)) {
        expect(c.answers.includes(tile), `${c.id} ${tile}`).toBe(false);
        expect(reason.trim().length, `${c.id} ${tile}`).toBeGreaterThan(8);
      }
    }
  });

  it("gives every chapter that has cards in Réviser a sentence", () => {
    expect(clozeForChapter("m1")?.id).toBe("cz-m1");
    expect(clozeForChapter("no-such-chapter")).toBeUndefined();
  });
});

describe("tiles", () => {
  it("are the answers and the wrong tiles, each once", () => {
    for (const c of CLOZE_CARDS) {
      const tiles = clozeTiles(c);
      expect(new Set(tiles).size, c.id).toBe(tiles.length);
      expect(tiles.length, c.id).toBe(c.answers.length + Object.keys(c.distractors).length);
      for (const a of c.answers) expect(tiles).toContain(a);
    }
  });

  it("accept the right word in the next hole, in order", () => {
    const c = clozeForChapter("m1")!;
    expect(checkTile(c, 0, "le haut")).toEqual({ ok: true });
    expect(checkTile(c, 1, "le bas")).toEqual({ ok: true });
    expect(checkTile(c, 2, "le même nombre")).toEqual({ ok: true });
  });

  it("refuse a wrong tile with its reason, and a right word in the wrong place with another", () => {
    const c = clozeForChapter("m1")!;
    const wrong = checkTile(c, 0, "seulement le haut");
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.reason).toMatch(/un côté/);
    const early = checkTile(c, 0, "le bas");
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.reason).toMatch(/pas à cet endroit/);
  });
});
