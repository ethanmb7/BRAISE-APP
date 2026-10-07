import { describe, it, expect } from "vitest";
import { FLASHCARDS } from "@/data";
import { emptyDeclicProgress } from "@/lib/course/engine";
import { emptyCourseProgress } from "@/lib/course/progressStore";
import { getDeclic } from "@/lib/course/registry";
import type { CourseProgress, DeclicProgress } from "@/lib/course/types";
import type { CardReview } from "@/types";
import {
  buildLibrary,
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
    expect(course.dots).toEqual(["empty", "empty"]);
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
    expect(course.dots).toEqual(["gold", "half"]);
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
  it("prefers what is in progress, the most recent first", () => {
    const resume = pickResume(
      [
        entry({ key: "a", status: "in_progress", updatedAt: 1 }),
        entry({ key: "b", status: "in_progress", updatedAt: 5 }),
        entry({ key: "c", status: "needs_reinforcement" }),
      ],
      null,
    );
    expect(resume).toMatchObject({ reason: "resume", entry: { key: "b" } });
  });

  it("then a point that mixes up, then a due review, then the suggestion", () => {
    const entries = [
      entry({ key: "a", status: "understood", dueCount: 2 }),
      entry({ key: "b", status: "needs_reinforcement" }),
      entry({ key: "c", status: "not_started" }),
    ];
    expect(pickResume(entries, "legacy:c")).toMatchObject({ reason: "reinforce" });
    expect(
      pickResume(
        entries.filter((e) => e.key !== "b"),
        "c",
      ),
    ).toMatchObject({
      reason: "review",
      entry: { key: "a" },
    });
    expect(
      pickResume(
        entries.filter((e) => e.key === "c"),
        "c",
      ),
    ).toMatchObject({
      reason: "next",
    });
  });

  it("is null when everything is remembered for good", () => {
    expect(pickResume([entry({ status: "mastered" })], null)).toBeNull();
  });
});
