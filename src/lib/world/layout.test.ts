import { describe, it, expect } from "vitest";
import { SUBJECTS } from "@/data";
import { HUB_CAPACITY, hubPlaces, islandCell } from "./layout";
import { fitOrbit } from "./orbit";
import { dueInLibrary, pickGlobalResume, verbFor } from "./resume";
import { deltaToReveal, scrollMemory } from "./scroll";
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

describe("hubPlaces", () => {
  it("has a place for every subject of the app", () => {
    expect(SUBJECTS.length).toBeLessThanOrEqual(HUB_CAPACITY);
    expect(hubPlaces(SUBJECTS.length)).toHaveLength(SUBJECTS.length);
  });

  it("never puts two worlds in the same place, whatever the count", () => {
    for (let n = 0; n <= HUB_CAPACITY; n++) {
      const places = hubPlaces(n);
      expect(places).toHaveLength(n);
      const keys = places.map((p) => `${p.col}/${p.row}`);
      expect(new Set(keys).size).toBe(n);
    }
  });

  it("leaves the middle of the middle rows to the sun", () => {
    for (let n = 0; n <= HUB_CAPACITY; n++) {
      for (const p of hubPlaces(n)) expect(p.col === 2 && (p.row === 2 || p.row === 3)).toBe(false);
    }
  });

  it("goes clockwise from the top with all six", () => {
    expect(hubPlaces(6).map((p) => `${p.col}/${p.row}`)).toEqual([
      "2/1",
      "3/2",
      "3/3",
      "2/4",
      "1/3",
      "1/2",
    ]);
  });

  it("holds ten worlds: the hexagon, then the four corners the sun leaves free", () => {
    expect(HUB_CAPACITY).toBe(10);
    expect(
      hubPlaces(10)
        .slice(6)
        .map((p) => `${p.col}/${p.row}`),
    ).toEqual(["1/1", "3/1", "3/4", "1/4"]);
  });

  it("keeps the hexagon where it is when more worlds come: the first six never move from seven on", () => {
    for (let n = 7; n <= HUB_CAPACITY; n++) {
      expect(hubPlaces(n).slice(0, 6)).toEqual(hubPlaces(6));
    }
    // and each extra world takes the next corner, so none of the others moves
    for (let n = 7; n < HUB_CAPACITY; n++) {
      expect(hubPlaces(n + 1).slice(0, n)).toEqual(hubPlaces(n));
    }
  });

  it("clamps to the places there are", () => {
    expect(hubPlaces(12)).toHaveLength(HUB_CAPACITY);
    expect(hubPlaces(-1)).toEqual([]);
  });
});

describe("fitOrbit", () => {
  const sun = { x: 150, y: 200 };
  const onEllipse = (rx: number, ry: number, deg: number) => ({
    x: sun.x + rx * Math.cos((deg * Math.PI) / 180),
    y: sun.y + ry * Math.sin((deg * Math.PI) / 180),
  });

  it("finds the ellipse the worlds sit on", () => {
    const worlds = [-90, -30, 30, 90, 150, 210].map((a) => onEllipse(110, 150, a));
    const o = fitOrbit(sun, worlds)!;
    expect(o.rx).toBeCloseTo(110, 3);
    expect(o.ry).toBeCloseTo(150, 3);
    expect(o.cx).toBe(150);
    expect(o.cy).toBe(200);
  });

  it("falls back to a circle for a single world, or worlds in a line with the sun", () => {
    const one = fitOrbit(sun, [{ x: 150, y: 80 }])!;
    expect(one.rx).toBeCloseTo(120, 5);
    expect(one.ry).toBeCloseTo(120, 5);
    const line = fitOrbit(sun, [
      { x: 150, y: 80 },
      { x: 150, y: 320 },
    ])!;
    expect(line.rx).toBeCloseTo(line.ry, 5);
  });

  it("has nothing to draw without a world", () => {
    expect(fitOrbit(sun, [])).toBeNull();
  });

  it("tolerates a few pixels of drift", () => {
    const worlds = [-90, -30, 30, 90, 150, 210].map((a, i) => {
      const p = onEllipse(110, 150, a);
      return { x: p.x + (i % 2 ? 3 : -3), y: p.y + (i % 3 ? -2 : 2) };
    });
    const o = fitOrbit(sun, worlds)!;
    expect(Math.abs(o.rx - 110)).toBeLessThan(8);
    expect(Math.abs(o.ry - 150)).toBeLessThan(8);
  });
});

describe("islandCell", () => {
  const cells = Array.from({ length: 12 }, (_, i) => islandCell(i));

  it("alternates left and right, starting on the left", () => {
    expect(cells.map((c) => c.column)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });

  it("zigzags: neighbours share some height but never a column", () => {
    for (let i = 1; i < cells.length; i++) {
      const a = cells[i - 1];
      const b = cells[i];
      expect(a.column).not.toBe(b.column);
      expect(b.row).toBeLessThan(a.row + a.span); // they do overlap in height
    }
  });

  it("never puts two islands of the same column on the same row", () => {
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (cells[i].column !== cells[j].column) continue;
        expect(cells[j].row).toBeGreaterThanOrEqual(cells[i].row + cells[i].span);
      }
    }
  });

  it("is read in the order it is drawn", () => {
    for (let i = 1; i < cells.length; i++) expect(cells[i].row).toBeGreaterThan(cells[i - 1].row);
  });
});

describe("pickGlobalResume", () => {
  const next = { entry: entry({ key: "n" }), reason: "next" as const };
  const review = { entry: entry({ key: "r", dueCount: 2 }), reason: "review" as const };
  const mixed = {
    entry: entry({ key: "m", status: "needs_reinforcement" }),
    reason: "reinforce" as const,
  };
  const open = {
    entry: entry({ key: "o", status: "in_progress" }),
    reason: "resume" as const,
    fresh: false,
  };
  const justNow = { ...open, entry: entry({ key: "j", status: "in_progress" }), fresh: true };

  it("follows the ladder: a Déclic touched lately, a review, a point that mixes up, an old Déclic, then something new", () => {
    const pick = (...rungs: Library["resume"][]) =>
      pickGlobalResume(
        rungs.map((r, i) => lib(String.fromCharCode(97 + i), r)),
        null,
      )?.resume.entry.key;
    expect(pick(next, open, mixed, review, justNow)).toBe("j");
    expect(pick(next, open, mixed, review)).toBe("r");
    expect(pick(next, open, mixed)).toBe("m");
    expect(pick(next, open)).toBe("o");
    expect(pick(next)).toBe("n");
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

  it("draws its own monument for every chapter that exists, none shared between two chapters", async () => {
    const { CHAPTER_EMBLEMS } = await import("./emblems");
    const chapterIds = SUBJECTS.flatMap((s) => s.chapters.map((c) => c.id));
    for (const id of chapterIds) expect(CHAPTER_EMBLEMS[id], id).toBeDefined();
    const drawn = chapterIds.map((id) => CHAPTER_EMBLEMS[id]);
    expect(new Set(drawn).size).toBe(drawn.length);
  });
});

describe("deltaToReveal", () => {
  const band = { top: 64, bottom: 600 };

  it("does nothing for what is already well inside the band", () => {
    expect(deltaToReveal({ top: 200, bottom: 420 }, band)).toBe(0);
  });

  it("scrolls down to bring up what hides behind the strip", () => {
    const delta = deltaToReveal({ top: 793, bottom: 1011 }, band);
    expect(delta).toBeGreaterThan(0);
    // After scrolling, the thing is centred in the band.
    const top = 793 - delta;
    const bottom = 1011 - delta;
    expect((top + bottom) / 2).toBeCloseTo((band.top + band.bottom) / 2, 0);
  });

  it("scrolls up to bring down what is under the top bar", () => {
    expect(deltaToReveal({ top: 10, bottom: 230 }, band)).toBeLessThan(0);
  });

  it("aligns to the top when the thing is taller than the band", () => {
    expect(deltaToReveal({ top: 300, bottom: 900 }, band)).toBe(300 - (band.top + 12));
  });
});

describe("scrollMemory", () => {
  it("remembers a position per screen and forgets nothing else", () => {
    scrollMemory.clear();
    expect(scrollMemory.has("a")).toBe(false);
    scrollMemory.set("a", 120.4);
    scrollMemory.set("b", -5);
    expect(scrollMemory.get("a")).toBe(120);
    expect(scrollMemory.get("b")).toBe(0);
    expect(scrollMemory.get("c")).toBeUndefined();
  });
});

describe("verbFor", () => {
  const e = (patch: Partial<LibraryEntry> = {}) => entry(patch);

  it("says what really happens, and never uses the name of a tab", () => {
    expect(verbFor({ entry: e(), reason: "resume", fresh: true })).toBe("Reprendre");
    expect(verbFor({ entry: e(), reason: "reinforce" })).toBe("Renforcer");
    expect(verbFor({ entry: e({ dueCount: 2 }), reason: "review" })).toBe("Retrouver");
    expect(verbFor({ entry: e({ status: "not_started" }), reason: "next" })).toBe("Commencer");
    expect(verbFor({ entry: e({ status: "understood" }), reason: "next" })).toBe("Continuer");
    for (const reason of ["resume", "reinforce", "review", "next"] as const) {
      expect(verbFor({ entry: e(), reason })).not.toBe("Réviser");
    }
  });
});
