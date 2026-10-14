// "Ton brasier": what the student knows is embers. A notion already touched is an ember: hot when it is
// fresh in the head, "couve" (smoulders) when it is starting to fade and a puff would bring it back. It is
// drawn from what the catalog already knows (the status of a chapter and whether its cards are due), so
// nothing is invented, and it never says "éteint" or "mort": an ember that smoulders is relit in seconds.
import type { Library, LibraryEntry } from "@/lib/catalog/catalog";

export type Warmth = "hot" | "warm" | "couve";
export type Ember = { key: string; subjectId: string; warmth: Warmth };

/** A chapter the student has not touched has no ember (nothing to relight yet). */
export function warmthOf(entry: LibraryEntry): Warmth | null {
  if (entry.status === "not_started") return null;
  if (entry.dueCount > 0 || entry.status === "needs_reinforcement") return "couve";
  if (entry.status === "mastered") return "hot";
  return "warm";
}

const ORDER: Record<Warmth, number> = { hot: 0, warm: 1, couve: 2 };

/** The embers of every subject, the hottest first (they sit at the heart of the fire). */
export function embersOf(libraries: Library[]): Ember[] {
  const embers: Ember[] = [];
  for (const lib of libraries) {
    for (const entry of lib.entries) {
      const warmth = warmthOf(entry);
      if (warmth) embers.push({ key: entry.key, subjectId: lib.subjectId, warmth });
    }
  }
  return embers.sort((a, b) => ORDER[a.warmth] - ORDER[b.warmth]);
}

export function countWarmth(embers: Ember[]): Record<Warmth, number> {
  const count: Record<Warmth, number> = { hot: 0, warm: 0, couve: 0 };
  for (const e of embers) count[e.warmth]++;
  return count;
}

export const MOUND = { width: 300, spacing: 27, rise: 22, baseY: 112, columns: 9 } as const;

/** How wide the bottom row is: a heap, not a line. A few embers make a small pyramid, many make a broad
 *  one (never wider than the fire pit). */
function baseWidth(count: number): number {
  return Math.min(MOUND.columns, Math.max(1, Math.ceil(Math.sqrt(2 * count))));
}

/** Where each ember sits in the heap: rows from the bottom, each one fewer than the one below, each filled
 *  from the middle outwards, so the hottest embers (first in the list) are at the heart and the ones that
 *  smoulder are on the edges. */
export function moundPlaces(count: number): { x: number; y: number }[] {
  const places: { x: number; y: number }[] = [];
  const base = baseWidth(count);
  let left = count;
  for (let row = 0; left > 0; row++) {
    const inRow = Math.min(left, Math.max(1, base - row));
    const xs = Array.from(
      { length: inRow },
      (_, i) => MOUND.width / 2 + (i - (inRow - 1) / 2) * MOUND.spacing,
    ).sort((a, b) => Math.abs(a - MOUND.width / 2) - Math.abs(b - MOUND.width / 2));
    for (const x of xs) places.push({ x, y: MOUND.baseY - row * MOUND.rise });
    left -= inRow;
  }
  return places;
}

/** How many rows the heap has: the card is as tall as its fire. */
export function moundRows(count: number): number {
  const base = baseWidth(count);
  let rows = 0;
  let left = count;
  while (left > 0) {
    left -= Math.max(1, base - rows);
    rows++;
  }
  return rows;
}

const KEY = "braise_quick";
/** "Rallumer · 2 min" asks Réviser for a short session (5 cards, the ones due first). It is a one-shot
 *  request kept for the tab, read when Réviser opens and cleared right after. */
export const QUICK_SIZE = 5;
export function requestQuick(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* no storage: the usual session */
  }
}
export function peekQuick(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
export function clearQuick(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
