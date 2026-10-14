import { describe, expect, it } from "vitest";
import type { Library, LibraryEntry } from "@/lib/catalog/catalog";
import { countWarmth, embersOf, moundPlaces, moundRows, warmthOf } from "./brasier";

const entry = (over: Partial<LibraryEntry>): LibraryEntry => ({
  key: "k",
  source: "course",
  subjectId: "maths",
  chapterId: "c",
  title: "t",
  levelLabel: "2nde",
  minutes: 3,
  status: "not_started",
  dots: [],
  dueCount: 0,
  cards: 4,
  updatedAt: 0,
  ...over,
});

const lib = (subjectId: string, entries: LibraryEntry[]): Library =>
  ({ subjectId, entries, resume: null }) as unknown as Library;

describe("warmthOf", () => {
  it("gives no ember to what has not been touched", () => {
    expect(warmthOf(entry({ status: "not_started" }))).toBeNull();
  });
  it("smoulders when cards are due or the point mixes up, whatever else is true", () => {
    expect(warmthOf(entry({ status: "mastered", dueCount: 2 }))).toBe("couve");
    expect(warmthOf(entry({ status: "needs_reinforcement" }))).toBe("couve");
  });
  it("is hot when remembered days later and nothing is due, warm otherwise", () => {
    expect(warmthOf(entry({ status: "mastered" }))).toBe("hot");
    expect(warmthOf(entry({ status: "understood" }))).toBe("warm");
    expect(warmthOf(entry({ status: "in_progress" }))).toBe("warm");
  });
});

describe("embersOf", () => {
  const libs = [
    lib("maths", [
      entry({ key: "a", status: "mastered" }),
      entry({ key: "b", status: "understood", dueCount: 1 }),
      entry({ key: "c", status: "not_started" }),
    ]),
    lib("svt", [entry({ key: "d", status: "understood" })]),
  ];
  it("lists only touched chapters, hottest first", () => {
    const embers = embersOf(libs);
    expect(embers.map((e) => e.key)).toEqual(["a", "d", "b"]);
    expect(countWarmth(embers)).toEqual({ hot: 1, warm: 1, couve: 1 });
  });
  it("is empty for a student who has touched nothing", () => {
    expect(embersOf([lib("maths", [entry({ status: "not_started" })])])).toEqual([]);
  });
});

describe("moundPlaces", () => {
  it("places every ember once, none on another, none outside the width", () => {
    for (const n of [1, 5, 9, 14, 26, 30]) {
      const places = moundPlaces(n);
      expect(places).toHaveLength(n);
      expect(new Set(places.map((p) => `${p.x},${p.y}`)).size).toBe(n);
      for (const p of places) {
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(300);
      }
    }
  });
  it("puts the first (hottest) embers at the heart, at the bottom", () => {
    const [first] = moundPlaces(14);
    expect(Math.abs(first.x - 150)).toBeLessThan(14);
    expect(first.y).toBe(112);
  });
  it("makes a heap, not a line: a few embers already stack, and thirty stay within five rows", () => {
    expect(moundRows(1)).toBe(1);
    expect(moundRows(8)).toBeGreaterThan(1);
    for (let n = 1; n <= 30; n++) {
      const rows = moundRows(n);
      expect(rows).toBeLessThanOrEqual(5);
      expect(new Set(moundPlaces(n).map((p) => p.y)).size).toBe(rows);
    }
  });
  it("stays inside the fire pit with thirty embers", () => {
    const xs = moundPlaces(30).map((p) => p.x);
    expect(Math.min(...xs)).toBeGreaterThan(11.5);
    expect(Math.max(...xs)).toBeLessThan(300 - 11.5);
  });
});
