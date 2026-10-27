import { describe, expect, it } from "vitest";
import { FLASHCARDS } from "@/data";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import {
  THEME_SESSION_SIZE,
  clearThemeRequest,
  peekThemeRequest,
  requestTheme,
  themeDeck,
} from "@/lib/revision/themeSession";

const source = {
  chapters: COURSE_REGISTRY.chapters,
  declics: COURSE_REGISTRY.declics,
  decks: COURSE_REGISTRY.decks,
};

describe("themeDeck", () => {
  it("takes only the cards of the chosen chapter from the older deck", () => {
    const chapterId = FLASHCARDS[0].chapterId;
    const deck = themeDeck(chapterId, source);
    expect(deck.length).toBeGreaterThan(0);
    expect(deck.every((c) => c.chapterId === chapterId)).toBe(true);
    expect(deck.length).toBeLessThanOrEqual(THEME_SESSION_SIZE);
  });

  it("takes the review deck of a chapter of the programme, as cards that remember where they live", () => {
    const chapter = COURSE_REGISTRY.chapters[0];
    const deck = themeDeck(chapter.id, source);
    expect(deck.length).toBeGreaterThan(0);
    expect(deck.every((c) => c.course && c.chapterId === chapter.id)).toBe(true);
  });

  it("never repeats a card, and never goes past the size of a series", () => {
    const chapter = COURSE_REGISTRY.chapters[0];
    const deck = themeDeck(chapter.id, source, Math.random, FLASHCARDS, 3);
    expect(deck.length).toBeLessThanOrEqual(3);
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
  });

  it("starts with the easy cards and ends with the hard ones", () => {
    const chapter = COURSE_REGISTRY.chapters[0];
    const order = { easy: 0, medium: 1, hard: 2 } as const;
    const levels = themeDeck(chapter.id, source).map((c) => order[c.level]);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });

  it("gives nothing for a chapter that has no card", () => {
    expect(themeDeck("no-such-chapter", source)).toEqual([]);
  });
});

describe("the request from the map", () => {
  it("is kept until it is cleared, so a second read finds it too", () => {
    clearThemeRequest();
    expect(peekThemeRequest()).toBeNull();
    requestTheme({ subjectId: "maths", chapterId: "m1", title: "Fractions" });
    expect(peekThemeRequest()?.chapterId).toBe("m1");
    expect(peekThemeRequest()?.chapterId).toBe("m1");
    clearThemeRequest();
    expect(peekThemeRequest()).toBeNull();
  });
});
