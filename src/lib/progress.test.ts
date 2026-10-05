import { describe, it, expect } from "vitest";
import {
  chapterMastery,
  computeGoalPct,
  ensureSession,
  goalTarget,
  MASTERED_AT_REPETITIONS,
  remainingToGoal,
  resolveChapters,
  reviewReward,
  sm2,
  XP_REWARDS,
  resolveRestoredTab,
  resolveRestoredView,
} from "@/lib/progress";
import { DEFAULT_USER, FLASHCARDS, SUBJECTS } from "@/data";
import type { AppState, CardReview } from "@/types";

const isMastered = (r: CardReview) => r.repetitions >= MASTERED_AT_REPETITIONS;

const review = (repetitions: number, lastConfidence: CardReview["lastConfidence"]): CardReview => ({
  repetitions,
  interval: 1,
  ease: 2.5,
  nextReviewAt: 0,
  lastConfidence,
});

// A full, minimal-but-valid AppState so each test only has to override the handful of fields
// its own case actually cares about — the rest never matters to ensureSession's own branching.
function baseState(overrides: Partial<AppState>): AppState {
  return {
    view: "home",
    tab: "home",
    user: DEFAULT_USER,
    streak: 0,
    xp: 0,
    bestCombo: 0,
    freezes: 2,
    freezeArmed: false,
    everUsedFreeze: false,
    onboardingCompleted: true,
    dailyGoalMet: false,
    darkMode: false,
    dyslexiaMode: false,
    textSize: "normal",
    soundOn: true,
    currentSubjectId: null,
    currentChapterId: null,
    lastSubjectId: null,
    lastChapterId: null,
    completedChapters: [],
    lessonReturnTo: null,
    lastCompletion: null,
    cardReviews: {},
    sessionDate: new Date().toDateString(),
    sessionXpEarned: 30,
    ...overrides,
  };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toDateString();

describe("ensureSession", () => {
  it("does nothing within the same real day", () => {
    const s = baseState({ sessionDate: new Date().toDateString(), streak: 4 });
    expect(ensureSession(s)).toEqual({});
  });

  it("increments the streak when yesterday's goal was met", () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: true, streak: 4 });
    const result = ensureSession(s);
    expect(result.streak).toBe(5);
    expect(result.sessionXpEarned).toBe(0);
    expect(result.dailyGoalMet).toBe(false);
  });

  it("resets the streak when yesterday's goal was missed with no freeze armed", () => {
    const s = baseState({
      sessionDate: daysAgo(1),
      dailyGoalMet: false,
      freezeArmed: false,
      streak: 6,
    });
    expect(ensureSession(s).streak).toBe(0);
  });

  it("preserves the streak when a freeze was armed to cover a missed day, consumes it, and marks it as ever used", () => {
    const s = baseState({
      sessionDate: daysAgo(1),
      dailyGoalMet: false,
      freezeArmed: true,
      freezes: 1,
      streak: 6,
      everUsedFreeze: false,
    });
    const result = ensureSession(s);
    expect(result.streak).toBeUndefined(); // untouched -> stays 6 in the real reducer merge
    expect(result.freezeArmed).toBe(false);
    expect(result.freezes).toBeUndefined(); // already decremented when the freeze was armed
    expect(result.everUsedFreeze).toBe(true); // the one real "Gel utilisé" moment for badge b4
  });

  it("does not mark a freeze as used just because it was armed and then refunded unneeded", () => {
    const s = baseState({
      sessionDate: daysAgo(1),
      dailyGoalMet: true,
      freezeArmed: true,
      freezes: 1,
      streak: 6,
      everUsedFreeze: false,
    });
    expect(ensureSession(s).everUsedFreeze).toBeUndefined();
  });

  it("refunds a freeze that was armed defensively but never needed", () => {
    const s = baseState({
      sessionDate: daysAgo(1),
      dailyGoalMet: true,
      freezeArmed: true,
      freezes: 1,
      streak: 6,
    });
    const result = ensureSession(s);
    expect(result.streak).toBe(7);
    expect(result.freezeArmed).toBe(false);
    expect(result.freezes).toBe(2);
  });

  it("breaks the streak on a real multi-day gap even with a freeze armed", () => {
    const s = baseState({
      sessionDate: daysAgo(3),
      dailyGoalMet: true,
      freezeArmed: true,
      freezes: 1,
      streak: 9,
    });
    const result = ensureSession(s);
    expect(result.streak).toBe(0);
    expect(result.freezeArmed).toBe(false);
  });

  it("never lets a corrupted sessionDate reach streak as NaN", () => {
    const s = baseState({ sessionDate: "not-a-real-date", streak: 3 });
    const result = ensureSession(s);
    expect(Number.isNaN(result.streak)).toBe(false);
    expect(result.sessionXpEarned).toBe(0);
  });
});

describe("resolveRestoredView", () => {
  it("sends a student who reloaded mid-onboarding back to onboarding", () => {
    expect(resolveRestoredView({ onboardingCompleted: false, view: "home" })).toBe("onboarding");
  });

  it("never sends a student who finished onboarding back through it", () => {
    expect(resolveRestoredView({ onboardingCompleted: true, view: "onboarding" })).toBe("home");
    expect(resolveRestoredView({ onboardingCompleted: true, view: "revisions" })).toBe("revisions");
  });
});

describe("resolveRestoredTab", () => {
  it("keeps Aura's own tab lit after a reload on Aura", () => {
    expect(resolveRestoredTab("progres", undefined)).toBe("progres");
  });

  it("falls back to the saved tab for views that aren't tabs themselves", () => {
    expect(resolveRestoredTab("settings", "progres")).toBe("progres");
    expect(resolveRestoredTab("lesson", "revisions")).toBe("revisions");
    expect(resolveRestoredTab("lesson", undefined)).toBe("home");
  });
});

describe("resolveChapters", () => {
  const maths = SUBJECTS[0].chapters;

  it("suggests the first unfinished chapter and leaves the rest open", () => {
    const resolved = resolveChapters(maths, []);
    expect(resolved.map((c) => c.status)).toEqual(["current", "open", "open", "open", "open"]);
  });

  it("marks finished chapters done and moves the suggestion to the next one", () => {
    const resolved = resolveChapters(maths, [maths[0].id, maths[1].id]);
    expect(resolved.map((c) => c.status)).toEqual(["done", "done", "current", "open", "open"]);
  });

  it("never locks a chapter, even when finished out of order", () => {
    const resolved = resolveChapters(maths, [maths[3].id]);
    expect(resolved.map((c) => c.status)).toEqual(["current", "open", "open", "done", "open"]);
  });
});

describe("sm2 spacing", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const t0 = 1_000_000_000_000;

  it("starts a new card at one repetition, due the next day", () => {
    const r = sm2(undefined, "sure", t0);
    expect(r.repetitions).toBe(1);
    expect(r.interval).toBe(1);
    expect(r.nextReviewAt).toBe(t0 + DAY);
  });

  it("gives no repetition credit for a correct answer before the card is due", () => {
    const first = sm2(undefined, "sure", t0);
    const sameDay = sm2(first, "sure", t0 + 60 * 60 * 1000);
    expect(sameDay.repetitions).toBe(1);
    expect(sameDay.nextReviewAt).toBe(first.nextReviewAt);
    expect(isMastered(sameDay)).toBe(false);
  });

  it("advances once the card is due, and only then reaches mastery", () => {
    const first = sm2(undefined, "sure", t0);
    const nextDay = sm2(first, "sure", t0 + DAY);
    expect(nextDay.repetitions).toBe(2);
    expect(nextDay.interval).toBe(3);
    expect(isMastered(nextDay)).toBe(true);
  });

  it("still resets a card answered wrong before it was due", () => {
    const second = sm2(sm2(undefined, "sure", t0), "sure", t0 + DAY);
    const forgotten = sm2(second, "not-sure", t0 + DAY + 1000);
    expect(forgotten.repetitions).toBe(0);
    expect(forgotten.interval).toBe(1);
  });

  it("answering the same card many times in one sitting never masters it", () => {
    let r = sm2(undefined, "sure", t0);
    for (let i = 1; i <= 10; i++) r = sm2(r, "sure", t0 + i * 60 * 1000);
    expect(r.repetitions).toBe(1);
    expect(isMastered(r)).toBe(false);
  });
});

describe("reviewReward", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const t0 = 1_000_000_000_000;

  it("pays full price for a new card and for one that is due", () => {
    expect(reviewReward(undefined, t0)).toBe(XP_REWARDS.REVIEW_LEARNING);
    const first = sm2(undefined, "sure", t0);
    expect(reviewReward(first, t0 + DAY)).toBe(XP_REWARDS.REVIEW_LEARNING);
  });

  it("pays half price for a card answered again before it is due", () => {
    const first = sm2(undefined, "sure", t0);
    expect(reviewReward(first, t0 + 1000)).toBe(XP_REWARDS.REVIEW_MASTERED);
  });

  it("pays half price for a card already mastered, even when due", () => {
    const mastered = sm2(sm2(undefined, "sure", t0), "sure", t0 + DAY);
    expect(reviewReward(mastered, t0 + 10 * DAY)).toBe(XP_REWARDS.REVIEW_MASTERED);
  });
});

describe("chapterMastery", () => {
  const m1Total = FLASHCARDS.filter((c) => c.chapterId === "m1").length;
  const m1Card = FLASHCARDS.find((c) => c.chapterId === "m1")!;

  it("knows nothing before any review, and counts only that chapter's own cards", () => {
    expect(chapterMastery("m1", {})).toEqual({ total: m1Total, mastered: 0, weak: 0 });
  });

  it("counts a card as mastered only once it has cleared the learning phase", () => {
    const justShown = { [m1Card.id]: review(MASTERED_AT_REPETITIONS - 1, "sure") };
    const cleared = { [m1Card.id]: review(MASTERED_AT_REPETITIONS, "sure") };
    expect(chapterMastery("m1", justShown).mastered).toBe(0);
    expect(chapterMastery("m1", cleared).mastered).toBe(1);
  });

  it("flags a card last judged wrong as a weak spot", () => {
    const missed = { [m1Card.id]: review(0, "not-sure") };
    expect(chapterMastery("m1", missed)).toEqual({ total: m1Total, mastered: 0, weak: 1 });
  });

  it("ignores reviews of cards from other chapters", () => {
    const other = FLASHCARDS.find((c) => c.chapterId !== "m1")!;
    expect(chapterMastery("m1", { [other.id]: review(5, "sure") }).mastered).toBe(0);
  });
});

describe("daily goal (measured in real XP)", () => {
  const user = { ...DEFAULT_USER, goal: "regulier" };

  it("reads its target in XP and reports progress against it", () => {
    const s = baseState({ user, sessionXpEarned: 45 });
    expect(goalTarget(s)).toBe(100);
    expect(computeGoalPct(s)).toBe(45);
    expect(remainingToGoal(s)).toBe(55);
  });

  it("caps at 100% and never reports a negative remainder", () => {
    const s = baseState({ user, sessionXpEarned: 250 });
    expect(computeGoalPct(s)).toBe(100);
    expect(remainingToGoal(s)).toBe(0);
  });
});
