import { describe, it, expect } from "vitest";
import { FLASHCARDS } from "@/data";
import { emptyDeclicProgress } from "@/lib/course/engine";
import { emptyCourseProgress } from "@/lib/course/progressStore";
import { getDeclic } from "@/lib/course/registry";
import type { CourseProgress, DeclicProgress } from "@/lib/course/types";
import type { CardReview } from "@/types";
import {
  buildLibrary,
  FRESH_MS,
  LEGACY_THEME_ID,
  pickResume,
  type LibraryEntry,
  type LibraryState,
} from "./catalog";

const NOW = Date.UTC(2026, 9, 6, 10, 0, 0);
const DAY = 86_400_000;

const fresh = (): LibraryState => ({
  completedChapters: [],
  cardReviews: {},
  course: emptyCourseProgress(),
  now: NOW,
});

const declicProgress = (id: string, patch: Partial<DeclicProgress>): CourseProgress["declics"] => ({
  [id]: { ...emptyDeclicProgress(getDeclic(id)!, NOW), ...patch },
});

const review = (patch: Partial<CardReview> = {}): CardReview => ({
  repetitions: 1,
  interval: 1,
  ease: 2.5,
  nextReviewAt: NOW + DAY,
  lastConfidence: "sure",
  ...patch,
});

const entry = (patch: Partial<LibraryEntry>): LibraryEntry => ({
  key: "legacy:x",
  source: "legacy",
  subjectId: "maths",
  chapterId: "x",
  title: "X",
  levelLabel: "2nde",
  minutes: 3,
  status: "not_started",
  dots: ["empty"],
  dueCount: 0,
  cards: 0,
  updatedAt: 0,
  ...patch,
});

describe("buildLibrary", () => {
  it("puts the official chapters under their programme theme, then the older ones", () => {
    const lib = buildLibrary("maths", fresh())!;
    expect(lib.themes.map((t) => t.official)).toEqual([true, false]);
    expect(lib.themes[0].label).toBe("Nombres et calculs, algèbre");
    expect(lib.themes[0].entries.map((e) => e.key)).toEqual(["course:M2-ARI"]);
    expect(lib.themes[1].id).toBe(LEGACY_THEME_ID);
    expect(lib.themes[1].entries.map((e) => e.chapterId)).toEqual(["m1", "m2", "m3", "m4", "m5"]);
    expect(lib.counts).toMatchObject({ total: 6, started: 0, mastered: 0 });
  });

  it("shows only the older chapters for a subject with no official course yet", () => {
    const lib = buildLibrary("francais", fresh())!;
    expect(lib.themes).toHaveLength(1);
    expect(lib.themes[0].official).toBe(false);
    expect(lib.entries).toHaveLength(4);
  });

  it("returns null for an unknown subject", () => {
    expect(buildLibrary("latin", fresh())).toBeNull();
  });

  it("gives a course card the hook of its chapter and one dot per Déclic", () => {
    const lib = buildLibrary("maths", fresh())!;
    const course = lib.entries.find((e) => e.source === "course")!;
    expect(course.hook).toBe("24 parts, 5 potes : ça tombe pile ?");
    expect(course.dots).toEqual(["empty", "empty", "empty"]);
    expect(course.levelLabel).toBe("Seconde");
    expect(course.minutes).toBeGreaterThan(0);
  });

  it("derives a course card's dots and status from the Déclic progress", () => {
    const state = fresh();
    state.course = {
      ...state.course,
      declics: {
        ...declicProgress("M2-ARI-D01", {
          completionStatus: "completed",
          understandingStatus: "understood",
          masteryStatus: "mastered",
        }),
        ...declicProgress("M2-ARI-D02", { completionStatus: "in_progress" }),
      },
    };
    const course = buildLibrary("maths", state)!.entries.find((e) => e.source === "course")!;
    expect(course.dots).toEqual(["gold", "half", "empty"]);
    expect(course.status).toBe("in_progress");
  });

  it("marks a Déclic that needs reinforcement with a warning dot", () => {
    const state = fresh();
    state.course = {
      ...state.course,
      declics: declicProgress("M2-ARI-D01", {
        completionStatus: "completed",
        understandingStatus: "needs_reinforcement",
      }),
    };
    const course = buildLibrary("maths", state)!.entries.find((e) => e.source === "course")!;
    expect(course.dots[0]).toBe("warn");
    expect(course.status).toBe("needs_reinforcement");
  });

  it("reads an older chapter's state from the chapter and its cards", () => {
    const cards = FLASHCARDS.filter((c) => c.chapterId === "m1");
    expect(cards.length).toBeGreaterThan(0);
    const pick = (state: LibraryState) =>
      buildLibrary("maths", state)!.entries.find((e) => e.chapterId === "m1")!;

    expect(pick(fresh()).status).toBe("not_started");

    const done = { ...fresh(), completedChapters: ["m1"] };
    expect(pick(done).status).toBe("discovered");
    expect(pick(done).dots[0]).toBe("full");

    const seen = {
      ...done,
      cardReviews: { [cards[0].id]: review() },
    };
    expect(pick(seen).status).toBe("understood");

    const weak = {
      ...done,
      cardReviews: { [cards[0].id]: review({ lastConfidence: "not-sure" }) },
    };
    expect(pick(weak).status).toBe("needs_reinforcement");
    expect(pick(weak).dots[1]).toBe("warn");

    const all = {
      ...done,
      cardReviews: Object.fromEntries(
        cards.map((c) => [c.id, review({ repetitions: 2 })] as const),
      ),
    };
    expect(pick(all).status).toBe("mastered");
    expect(
      pick(all)
        .dots.slice(1)
        .every((d) => d === "gold"),
    ).toBe(true);
  });

  it("counts only the cards already seen whose review date has come", () => {
    const cards = FLASHCARDS.filter((c) => c.chapterId === "m1");
    const state: LibraryState = {
      ...fresh(),
      completedChapters: ["m1"],
      cardReviews: {
        [cards[0].id]: review({ nextReviewAt: NOW - DAY }),
        [cards[1].id]: review({ nextReviewAt: NOW + DAY }),
      },
    };
    const m1 = buildLibrary("maths", state)!.entries.find((e) => e.chapterId === "m1")!;
    expect(m1.dueCount).toBe(1);
  });

  it("suggests the first older chapter on a fresh install, and the next one after it", () => {
    expect(buildLibrary("maths", fresh())!.resume).toMatchObject({
      reason: "next",
      entry: { key: "legacy:m1" },
    });
    const after = { ...fresh(), completedChapters: ["m1"] };
    const resume = buildLibrary("maths", after)!.resume!;
    expect(resume.reason).toBe("next");
    expect(resume.entry.key).toBe("legacy:m2");
  });
});

describe("pickResume", () => {
  const touched = (ago: number) => NOW - ago;

  it("starts with a Déclic touched in the last two days, the most recent first", () => {
    const resume = pickResume(
      [
        entry({ key: "a", status: "in_progress", updatedAt: touched(DAY) }),
        entry({ key: "b", status: "in_progress", updatedAt: touched(2 * 60 * 60 * 1000) }),
        entry({ key: "c", status: "understood", dueCount: 4 }),
      ],
      null,
      NOW,
    );
    expect(resume).toMatchObject({ reason: "resume", fresh: true, entry: { key: "b" } });
  });

  it("puts a review that has come due before a point that mixes up, and both before an old Déclic", () => {
    const entries = [
      entry({ key: "old", status: "in_progress", updatedAt: touched(5 * DAY) }),
      entry({ key: "mix", status: "needs_reinforcement" }),
      entry({ key: "due", status: "understood", dueCount: 2 }),
      entry({ key: "new", status: "not_started" }),
    ];
    expect(pickResume(entries, "legacy:new", NOW)).toMatchObject({
      reason: "review",
      entry: { key: "due" },
    });
    expect(
      pickResume(
        entries.filter((e) => e.key !== "due"),
        "legacy:new",
        NOW,
      ),
    ).toMatchObject({ reason: "reinforce", entry: { key: "mix" } });
    expect(
      pickResume(
        entries.filter((e) => e.key === "old" || e.key === "new"),
        "legacy:new",
        NOW,
      ),
    ).toMatchObject({ reason: "resume", fresh: false, entry: { key: "old" } });
    expect(
      pickResume(
        entries.filter((e) => e.key === "new"),
        "legacy:new",
        NOW,
      ),
    ).toMatchObject({ reason: "next" });
  });

  it("calls a Déclic fresh for just under two days, and not after", () => {
    const at = (ago: number) =>
      pickResume([entry({ key: "a", status: "in_progress", updatedAt: touched(ago) })], null, NOW);
    expect(at(FRESH_MS - 1)).toMatchObject({ fresh: true });
    expect(at(FRESH_MS)).toMatchObject({ fresh: false });
  });

  it("never calls an older chapter fresh: it has no date, so it is only an open Déclic", () => {
    expect(
      pickResume([entry({ key: "a", status: "in_progress", updatedAt: 0 })], null, NOW),
    ).toMatchObject({ reason: "resume", fresh: false });
  });

  it("is null when everything is remembered for good", () => {
    expect(pickResume([entry({ status: "mastered" })], null, NOW)).toBeNull();
  });
});
