import { describe, it, expect } from "vitest";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import { emptyCourseProgress } from "@/lib/course/progressStore";
import { emptyDeclicProgress } from "@/lib/course/engine";
import { newReviewState } from "@/lib/course/review";
import type { CourseProgress, DeclicProgress, ReviewCardState } from "@/lib/course/types";
import {
  claimIsTrue,
  courseCardToFlashcard,
  findCourseCard,
  interleave,
  MAX_COURSE_CARDS,
  pickCourseCards,
  struggleScore,
} from "./courseCards";

const NOW = Date.UTC(2026, 9, 8, 10, 0, 0);
const DAY = 86_400_000;
const source = {
  chapters: COURSE_REGISTRY.chapters,
  declics: COURSE_REGISTRY.declics,
  decks: COURSE_REGISTRY.decks,
};
const D02 = COURSE_REGISTRY.declics.get("M2-ARI-D02")!;
const deck02 = COURSE_REGISTRY.decks.get(D02.deckId)!;

const started = (id: string, patch: Partial<DeclicProgress> = {}): DeclicProgress => ({
  ...emptyDeclicProgress(COURSE_REGISTRY.declics.get(id)!, NOW),
  completionStatus: "completed",
  ...patch,
});

const progressWith = (patch: Partial<CourseProgress>): CourseProgress => ({
  ...emptyCourseProgress(),
  ...patch,
});

describe("pickCourseCards", () => {
  it("brings nothing before the student has met a Déclic", () => {
    expect(pickCourseCards(source, emptyCourseProgress(), NOW)).toEqual([]);
  });

  it("brings nothing from a Déclic that went well and has no review that went wrong", () => {
    const p = progressWith({
      declics: { "M2-ARI-D02": started("M2-ARI-D02", { understandingStatus: "understood" }) },
    });
    expect(pickCourseCards(source, p, NOW)).toEqual([]);
  });

  it("brings the cards that test the wrong idea the student picked in the Déclic", () => {
    const misconceptionCards = deck02.cards.filter((c) => c.misconceptionId);
    expect(misconceptionCards.length).toBeGreaterThan(0);
    const id = misconceptionCards[0].misconceptionId!;
    const p = progressWith({
      declics: { "M2-ARI-D02": started("M2-ARI-D02", { understandingStatus: "understood" }) },
      misconceptions: { [id]: { count: 1, lastAt: NOW - DAY } },
    });
    const picked = pickCourseCards(source, p, NOW);
    expect(picked.length).toBeGreaterThan(0);
    expect(picked.every((c) => c.card.misconceptionId === id)).toBe(true);
  });

  it("brings cards of a Déclic that did not land, at most two from it, at most three in all", () => {
    const p = progressWith({
      declics: {
        "M2-ARI-D01": started("M2-ARI-D01", { understandingStatus: "needs_reinforcement" }),
        "M2-ARI-D02": started("M2-ARI-D02", { understandingStatus: "needs_reinforcement" }),
      },
    });
    const picked = pickCourseCards(source, p, NOW);
    expect(picked.length).toBeLessThanOrEqual(MAX_COURSE_CARDS);
    const perDeclic = new Map<string, number>();
    for (const c of picked) perDeclic.set(c.def.id, (perDeclic.get(c.def.id) ?? 0) + 1);
    expect([...perDeclic.values()].every((n) => n <= 2)).toBe(true);
  });

  it("puts a card missed in a review first, once it is due", () => {
    const miss = deck02.cards[3];
    const state: ReviewCardState = {
      ...newReviewState(miss, deck02),
      errorCount: 1,
      lastResult: "incorrect",
      revengePending: true,
      lastPresentedAt: NOW - 2 * DAY,
      review: {
        repetitions: 0,
        interval: 1,
        ease: 2.5,
        nextReviewAt: NOW - DAY,
        lastConfidence: "not-sure",
      },
    };
    const p = progressWith({
      declics: {
        "M2-ARI-D02": started("M2-ARI-D02", { understandingStatus: "needs_reinforcement" }),
      },
      reviewCards: { [miss.id]: state },
    });
    expect(pickCourseCards(source, p, NOW)[0].card.id).toBe(miss.id);
  });

  it("leaves a card alone until its day, even if it was missed", () => {
    const miss = deck02.cards[3];
    const state: ReviewCardState = {
      ...newReviewState(miss, deck02),
      errorCount: 1,
      revengePending: true,
      review: {
        repetitions: 0,
        interval: 1,
        ease: 2.5,
        nextReviewAt: NOW + DAY,
        lastConfidence: "not-sure",
      },
    };
    const p = progressWith({
      declics: { "M2-ARI-D02": started("M2-ARI-D02") },
      reviewCards: { [miss.id]: state },
    });
    expect(struggleScore(D02, miss, p, NOW)).toBe(0);
  });
});

describe("courseCardToFlashcard", () => {
  const candidate = (id: string) => findCourseCard(id, source)!;

  it("keeps an Intox card's false claim as what is shown, and its correction as the truth", () => {
    const intox = deck02.cards.find((c) => c.answer === "intox")!;
    const f = courseCardToFlashcard(candidate(intox.id));
    expect(f.wrongA).toBe(intox.statement);
    expect(f.a).toBe(intox.correction);
    expect(f.course?.answer).toBe("intox");
    expect(f.course?.feedbackCorrect).toBe(intox.feedback.correct);
    expect(claimIsTrue(f)).toBe(false);
  });

  it("shows a Carré card's true claim", () => {
    const carre = deck02.cards.find((c) => c.answer === "carre")!;
    const f = courseCardToFlashcard(candidate(carre.id));
    expect(f.a).toBe(carre.statement);
    expect(f.wrongA).toBe("");
    expect(claimIsTrue(f)).toBe(true);
  });

  it("points at its chapter, so the lesson can be reopened", () => {
    const f = courseCardToFlashcard(candidate(deck02.cards[0].id));
    expect(f.chapterId).toBe("M2-ARI");
    expect(f.subject).toBe("maths");
    expect(f.topic).toBe(D02.title);
    expect(f.q).toContain(D02.title);
  });

  it("finds nothing for an unknown id", () => {
    expect(findCourseCard("nope", source)).toBeUndefined();
  });
});

describe("claimIsTrue for an older card", () => {
  const old = {
    id: "x",
    q: "",
    a: "",
    wrongA: "w",
    subject: "maths",
    topic: "",
    chapterId: "m1",
    level: "easy" as const,
  };
  it("is a coin flip", () => {
    expect(claimIsTrue(old, () => 0.2)).toBe(true);
    expect(claimIsTrue(old, () => 0.8)).toBe(false);
  });
});

describe("interleave", () => {
  it("keeps every card and spreads the extra ones, never all at one end", () => {
    const deck = Array.from({ length: 12 }, (_, i) => `d${i}`);
    const out = interleave(deck, ["c0", "c1", "c2"]);
    expect(out).toHaveLength(15);
    expect(new Set(out).size).toBe(15);
    const at = ["c0", "c1", "c2"].map((c) => out.indexOf(c));
    expect(at[0]).toBeGreaterThan(0);
    expect(at[2]).toBeLessThan(14);
    expect(at[1] - at[0]).toBeGreaterThan(1);
    expect(out.filter((x) => x.startsWith("d"))).toEqual(deck);
  });

  it("changes nothing when there is nothing to add", () => {
    const deck = ["a", "b"];
    expect(interleave(deck, [])).toBe(deck);
  });
});
