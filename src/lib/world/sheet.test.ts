import { describe, expect, it } from "vitest";
import { chipFor, sheetRows } from "./sheet";
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
  cards: 0,
  updatedAt: 0,
  ...patch,
});

const library = (entries: LibraryEntry[]): Library => ({
  subjectId: "maths",
  themes: [],
  entries,
  resume: null,
  counts: { total: entries.length, started: 0, understood: 0, mastered: 0, needsWork: 0 },
});

describe("chipFor", () => {
  it("shows the cards waiting when there are some, with the same words as an island", () => {
    expect(chipFor(entry({ status: "understood", dueCount: 2 }))).toEqual({
      label: "2 à rafraîchir",
      tone: "due",
    });
  });

  it("otherwise gives the state of the chapter in one word", () => {
    expect(chipFor(entry({ status: "not_started" }))).toEqual({
      label: "À découvrir",
      tone: "not_started",
    });
    expect(chipFor(entry({ status: "mastered" }))).toEqual({ label: "Acquis", tone: "mastered" });
    expect(chipFor(entry({ status: "needs_reinforcement" })).label).toBe("À renforcer");
  });
});

describe("sheetRows", () => {
  const rows = sheetRows(
    library([
      entry({ key: "a", title: "A", status: "mastered" }),
      entry({ key: "b", title: "B", status: "in_progress" }),
      entry({ key: "c", title: "C", status: "not_started" }),
    ]),
    "b",
  );

  it("keeps the order of the map", () => {
    expect(rows.map((r) => r.entry.title)).toEqual(["A", "B", "C"]);
  });

  it("marks only the chapter Braise would pick up", () => {
    expect(rows.map((r) => r.resume)).toEqual([false, true, false]);
  });

  it("marks none in a world she does not suggest", () => {
    const none = sheetRows(library([entry({ key: "a" }), entry({ key: "b" })]), null);
    expect(none.some((r) => r.resume)).toBe(false);
  });
});
