import { describe, it, expect } from "vitest";
import { FLASHCARDS } from "@/data";
import { MASTERED_AT_REPETITIONS } from "@/lib/progress";
import {
  computeBraiseInsight,
  computeSubjectMastery,
  countMasteredCards,
  countSubjectsSeen,
} from "@/lib/aura";
import { COURSE_REGISTRY } from "./registry";
import { emptyCourseProgress } from "./progressStore";
import { emptyDeclicProgress } from "./engine";
import { completionXp } from "./rewards";
import { courseMastery, NO_COURSE_MASTERY } from "./mastery";
import type { CardReview } from "@/types";

const source = {
  chapters: COURSE_REGISTRY.chapters,
  declics: COURSE_REGISTRY.declics,
  decks: COURSE_REGISTRY.decks,
};
const NOW = Date.UTC(2026, 9, 8);
const deckCards = [...COURSE_REGISTRY.decks.values()].flatMap((d) => d.cards);
const review = (patch: Partial<CardReview> = {}): CardReview => ({
  repetitions: 0,
  interval: 1,
  ease: 2.5,
  nextReviewAt: NOW,
  lastConfidence: "sure",
  ...patch,
});
const progressWith = (cardId: string, r: CardReview) => ({
  ...emptyCourseProgress(),
  reviewCards: {
    [cardId]: {
      cardId,
      declicId: "M2-ARI-D02",
      chapterId: "M2-ARI",
      concept: "c",
      timesPresented: 1,
      successCount: 1,
      errorCount: 0,
      consecutiveDeferredSuccesses: 0,
      lastPresentedAt: NOW,
      lastResult: "correct" as const,
      revengePending: false,
      review: r,
    },
  },
});

describe("courseMastery", () => {
  it("lists every card of the course decks, under its subject and its Déclic", () => {
    const m = courseMastery(source, emptyCourseProgress());
    expect(m.cards).toHaveLength(deckCards.length);
    expect(m.cards.every((c) => c.subject === "maths")).toBe(true);
    expect(m.cards.some((c) => c.topic === "Ça tombe pile")).toBe(true);
    expect(m.reviews).toEqual({});
  });

  it("keeps the schedule of the cards the student has met", () => {
    const id = deckCards[0].id;
    const m = courseMastery(source, progressWith(id, review({ repetitions: 2 })));
    expect(m.reviews[id].repetitions).toBe(2);
  });
});

describe("Aura counts both methods", () => {
  const id = deckCards[0].id;
  const mastered = courseMastery(
    source,
    progressWith(id, review({ repetitions: MASTERED_AT_REPETITIONS })),
  );

  it("changes nothing for a student without course cards", () => {
    expect(computeSubjectMastery({}, NO_COURSE_MASTERY)).toEqual(computeSubjectMastery({}));
    expect(countMasteredCards({}, NO_COURSE_MASTERY)).toBe(0);
  });

  it("adds the course cards to the subject's total, and the mastered ones to its count", () => {
    const legacyMaths = FLASHCARDS.filter((c) => c.subject === "maths").length;
    const before = computeSubjectMastery({}).find((s) => s.id === "maths")!;
    const after = computeSubjectMastery({}, mastered).find((s) => s.id === "maths")!;
    expect(before.totalCount).toBe(legacyMaths);
    expect(after.totalCount).toBe(legacyMaths + deckCards.length);
    expect(after.masteredCount).toBe(1);
    expect(after.started).toBe(true);
    // the other subjects are untouched
    expect(computeSubjectMastery({}, mastered).find((s) => s.id === "francais")!.totalCount).toBe(
      computeSubjectMastery({}).find((s) => s.id === "francais")!.totalCount,
    );
  });

  it("counts a mastered course card among the mastered cards, once", () => {
    const legacy = { [FLASHCARDS[0].id]: review({ repetitions: MASTERED_AT_REPETITIONS }) };
    expect(countMasteredCards(legacy, mastered)).toBe(2);
  });

  it("counts a subject as seen when only a course card was reviewed", () => {
    expect(countSubjectsSeen({}, mastered)).toBe(1);
    expect(countSubjectsSeen({}, NO_COURSE_MASTERY)).toBe(0);
    expect(
      countSubjectsSeen(
        { [FLASHCARDS.find((c) => c.subject === "francais")!.id]: review() },
        mastered,
      ),
    ).toBe(2);
  });

  it("notices a course card that keeps resisting", () => {
    const resisting = courseMastery(
      source,
      progressWith(id, review({ repetitions: 4, lastConfidence: "not-sure" })),
    );
    const insight = computeBraiseInsight({}, resisting);
    expect(insight).toMatchObject({ kind: "struggling", subjectName: "Mathématiques" });
  });
});

describe("completionXp", () => {
  const def = COURSE_REGISTRY.declics.get("M2-ARI-D02")!;
  it("pays what a chapter pays, the first time", () => {
    expect(completionXp(undefined)).toBe(50);
    expect(completionXp(emptyDeclicProgress(def, NOW))).toBe(50);
    expect(
      completionXp({ ...emptyDeclicProgress(def, NOW), completionStatus: "in_progress" }),
    ).toBe(50);
  });
  it("pays nothing for a replay", () => {
    expect(completionXp({ ...emptyDeclicProgress(def, NOW), completionStatus: "completed" })).toBe(
      0,
    );
  });
});
