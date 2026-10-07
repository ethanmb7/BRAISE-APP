// Where things sit in the two illustrated scenes. Positions are in scene units: a scene is 390 units
// wide whatever the screen, and the components turn units into real sizes with container units, so the
// same drawing fits a small phone and a wide one. Pure, so it is tested without a screen.
export const SCENE_W = 390;

export type Slot = { x: number; y: number; size: number };

/** The centre of the "Où on va ?" scene, where Braise stands. */
export const HUB_CENTER = { x: 195, y: 232 };
export const HUB_HEIGHT = 500;

// Two rings around Braise. A subject keeps the same place from one visit to the next (a place you
// can find with your eyes closed), so the slot follows the subject's order, not its state.
const HUB_SLOTS: { r: number; a: number }[] = [
  { r: 126, a: 90 },
  { r: 120, a: 212 },
  { r: 172, a: -90 },
  { r: 120, a: 328 },
  { r: 158, a: 38 },
  { r: 158, a: 142 },
];

/** More subjects than places on the rings: the screen falls back to a plain grid. */
export const HUB_CAPACITY = HUB_SLOTS.length;

export function hubSlots(count: number, suggestedIndex: number | null): Slot[] {
  return HUB_SLOTS.slice(0, count).map(({ r, a }, i) => ({
    x: HUB_CENTER.x + r * Math.cos((a * Math.PI) / 180),
    y: HUB_CENTER.y + r * Math.sin((a * Math.PI) / 180),
    size: i === suggestedIndex ? 96 : 72,
  }));
}

export type IslandSlot = { x: number; y: number; w: number };

const ROW = 122;
const FIRST_Y = 124;
const JITTER = [0, -8, 6, -4, 8, -6];

/** Islands zigzag down the scene, left then right, a little off the grid so it reads as a place and
 *  not as a table. `w` is the island's width; the suggested one is drawn larger by the component. */
export function islandSlots(count: number): IslandSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    x: (i % 2 === 0 ? 108 : 272) + JITTER[i % JITTER.length],
    y: FIRST_Y + i * ROW,
    w: 138,
  }));
}

/** Height of the archipelago scene: the header, every island with its label, then the sea. */
export function archipelagoHeight(count: number): number {
  return FIRST_Y + Math.max(0, count - 1) * ROW + 330;
}
