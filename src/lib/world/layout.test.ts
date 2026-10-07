import { describe, it, expect } from "vitest";
import { SUBJECTS } from "@/data";
import { archipelagoHeight, HUB_CAPACITY, hubSlots, islandSlots, SCENE_W } from "./layout";
import { dueInLibrary, pickGlobalResume } from "./resume";
import type { Library, LibraryEntry } from "@/lib/catalog/catalog";

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

const lib = (
  subjectId: string,
  resume: Library["resume"],
  entries: LibraryEntry[] = [],
): Library => ({
  subjectId,
  themes: [],
  entries,
  resume,
  counts: { total: entries.length, started: 0, understood: 0, mastered: 0, needsWork: 0 },
});

describe("hubSlots", () => {
  it("has a place for every subject of the app", () => {
    expect(SUBJECTS.length).toBeLessThanOrEqual(HUB_CAPACITY);
    expect(hubSlots(SUBJECTS.length, null)).toHaveLength(SUBJECTS.length);
  });

  it("keeps every world inside the scene, whatever the suggestion", () => {
    for (let s = 0; s < HUB_CAPACITY; s++) {
      for (const slot of hubSlots(HUB_CAPACITY, s)) {
        expect(slot.x - slot.size / 2).toBeGreaterThanOrEqual(0);
        expect(slot.x + slot.size / 2).toBeLessThanOrEqual(SCENE_W);
      }
    }
  });

  it("draws the suggested world larger, and only that one", () => {
    const sizes = hubSlots(6, 2).map((s) => s.size);
    expect(sizes.filter((s) => s === 96)).toHaveLength(1);
    expect(sizes[2]).toBe(96);
  });

  it("never lets two worlds overlap", () => {
    const slots = hubSlots(HUB_CAPACITY, 0);
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const d = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y);
        expect(d).toBeGreaterThan((slots[i].size + slots[j].size) / 2);
      }
    }
  });
});

describe("islandSlots", () => {
  it("zigzags downwards without leaving the scene", () => {
    const slots = islandSlots(8);
    slots.forEach((s, i) => {
      expect(s.x - s.w / 2).toBeGreaterThan(0);
      expect(s.x + s.w / 2).toBeLessThan(SCENE_W);
      if (i > 0) expect(s.y).toBeGreaterThan(slots[i - 1].y);
      if (i > 0) expect(Math.sign(s.x - 195)).not.toBe(Math.sign(slots[i - 1].x - 195));
    });
  });

  it("makes the scene tall enough for the last island and its label", () => {
    for (const n of [1, 4, 6, 12]) {
      const last = islandSlots(n)[n - 1];
      expect(archipelagoHeight(n)).toBeGreaterThanOrEqual(last.y + 200);
    }
  });
});

describe("pickGlobalResume", () => {
  const next = { entry: entry({ key: "n" }), reason: "next" as const };
  const review = { entry: entry({ key: "r", dueCount: 2 }), reason: "review" as const };
  const inProgress = {
    entry: entry({ key: "p", status: "in_progress" }),
    reason: "resume" as const,
  };

  it("prefers something started over a review, over something new", () => {
    expect(
      pickGlobalResume([lib("a", next), lib("b", review), lib("c", inProgress)], null),
    ).toMatchObject({
      subjectId: "c",
    });
    expect(pickGlobalResume([lib("a", next), lib("b", review)], null)).toMatchObject({
      subjectId: "b",
    });
  });

  it("breaks a tie with the subject the student was last in, then the usual order", () => {
    expect(pickGlobalResume([lib("a", next), lib("b", next)], "b")).toMatchObject({
      subjectId: "b",
    });
    expect(pickGlobalResume([lib("a", next), lib("b", next)], "z")).toMatchObject({
      subjectId: "a",
    });
  });

  it("is null when nothing is left to do", () => {
    expect(pickGlobalResume([lib("a", null), lib("b", null)], null)).toBeNull();
  });
});

describe("dueInLibrary", () => {
  it("adds up the cards waiting across the subject", () => {
    expect(
      dueInLibrary(lib("a", null, [entry({ dueCount: 2 }), entry({ dueCount: 1 }), entry({})])),
    ).toBe(3);
  });
});

describe("emblems", () => {
  it("gives every chapter of the app a monument, and the unlisted ones differ from their neighbours", async () => {
    const { emblemFor, NEUTRAL_KINDS } = await import("./emblems");
    for (const subject of SUBJECTS) {
      const kinds = subject.chapters.map((c, i) => emblemFor(c.id, i));
      expect(kinds.every(Boolean)).toBe(true);
      kinds.forEach((k, i) => i > 0 && expect(k).not.toBe(kinds[i - 1]));
    }
    expect(new Set(NEUTRAL_KINDS).size).toBe(NEUTRAL_KINDS.length);
  });
});
