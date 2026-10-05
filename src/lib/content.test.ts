import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  SUBJECTS,
  FLASHCARDS,
  LEVELS,
  CONTENT_LEVEL_ID,
  CONTENT_LEVEL_NOTE,
  FIRST_CHAPTER_ID,
} from "@/data";
import { DECLIC_SCRIPTS } from "@/lib/declic";

// Guard rails on the authored content, not on code: every one of these is a way adding or editing
// a chapter could silently ship a hole (a chapter with no lesson, a review card pointing nowhere,
// an answer tile too long for a phone). `npm run declic:check` validates the format of each
// lesson file on its own; these check the lessons and the card deck against each other.
const CHAPTERS = SUBJECTS.flatMap((s) => s.chapters.map((c) => ({ ...c, subjectId: s.id })));
const MIN_CARDS_PER_CHAPTER = 4;
const MAX_DECLIC_CARDS = 12; // src/content/declic/README.md: "8 à 12 cartes, jamais plus"
const MAX_TILE_CHARS = 60; // existing lessons top out around 50; longer wraps badly on a phone

describe("Déclic lessons", () => {
  it("loads every .txt file — a file that failed to parse is skipped silently at runtime", () => {
    const files = readdirSync(join(__dirname, "..", "content", "declic")).filter((f) =>
      f.endsWith(".txt"),
    );
    expect(Object.keys(DECLIC_SCRIPTS)).toHaveLength(files.length);
  });

  it("gives every chapter its lesson, and every lesson a chapter", () => {
    const chapterIds = CHAPTERS.map((c) => c.id).sort();
    expect(Object.keys(DECLIC_SCRIPTS).sort()).toEqual(chapterIds);
  });

  it("opens with a situation, ends on a fiche, and stays within 8 to 12 cards", () => {
    for (const script of Object.values(DECLIC_SCRIPTS)) {
      expect(script.cards[0].kind, script.chapterId).toBe("situation");
      expect(script.cards.at(-1)?.kind, script.chapterId).toBe("fiche");
      expect(script.cards.length, script.chapterId).toBeGreaterThanOrEqual(8);
      expect(script.cards.length, script.chapterId).toBeLessThanOrEqual(MAX_DECLIC_CARDS);
    }
  });

  it("has a hook for the chapter path and a review card that drills the same chapter", () => {
    for (const script of Object.values(DECLIC_SCRIPTS)) {
      expect(script.hook, `${script.chapterId} hook`).toBeTruthy();
      const card = FLASHCARDS.find((c) => c.id === script.reviewCardId);
      expect(card, `${script.chapterId} review card ${script.reviewCardId}`).toBeDefined();
      expect(card?.chapterId, script.chapterId).toBe(script.chapterId);
    }
  });

  it("keeps every answer tile short enough for a phone", () => {
    for (const script of Object.values(DECLIC_SCRIPTS)) {
      for (const card of script.cards) {
        if (card.kind !== "choice") continue;
        for (const option of card.options) {
          expect(option.label.length, `${script.chapterId}: ${option.label}`).toBeLessThanOrEqual(
            MAX_TILE_CHARS,
          );
        }
      }
    }
  });
});

describe("Flashcards", () => {
  it("has unique ids", () => {
    const ids = FLASHCARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it(`gives every chapter at least ${MIN_CARDS_PER_CHAPTER} cards, so spaced repetition has a deck`, () => {
    for (const chapter of CHAPTERS) {
      const count = FLASHCARDS.filter((c) => c.chapterId === chapter.id).length;
      expect(count, `${chapter.id} ${chapter.title}`).toBeGreaterThanOrEqual(MIN_CARDS_PER_CHAPTER);
    }
  });

  it("files every card under a real chapter of the right subject", () => {
    const subjectOf = new Map(CHAPTERS.map((c) => [c.id, c.subjectId]));
    for (const card of FLASHCARDS) {
      expect(subjectOf.has(card.chapterId), `${card.id} → ${card.chapterId}`).toBe(true);
      expect(card.subject, card.id).toBe(subjectOf.get(card.chapterId));
    }
  });

  it("has a wrong answer that differs from the right one, for the swipe-and-judge game", () => {
    for (const card of FLASHCARDS) {
      expect(card.wrongA.trim(), card.id).not.toBe("");
      expect(card.wrongA, card.id).not.toBe(card.a);
    }
  });

  it("closes every math, highlight and bold marker it opens", () => {
    for (const card of FLASHCARDS) {
      for (const field of [card.q, card.a, card.wrongA]) {
        expect((field.match(/\$/g) ?? []).length % 2, `${card.id} $`).toBe(0);
        expect((field.match(/==/g) ?? []).length % 2, `${card.id} ==`).toBe(0);
        expect((field.match(/\*\*/g) ?? []).length % 2, `${card.id} **`).toBe(0);
      }
    }
  });
});

describe("Content level", () => {
  it("names a level that exists, and says so in the note shown on the level screens", () => {
    const level = LEVELS.find((l) => l.id === CONTENT_LEVEL_ID);
    expect(level).toBeDefined();
    expect(CONTENT_LEVEL_NOTE).toContain(level!.label);
  });
});

describe("First chapter", () => {
  it("is a real chapter that has a Déclic, for a new student's first Pioche", () => {
    const chapter = CHAPTERS.find((c) => c.id === FIRST_CHAPTER_ID);
    expect(chapter).toBeDefined();
    expect(DECLIC_SCRIPTS[FIRST_CHAPTER_ID]).toBeDefined();
  });
});
