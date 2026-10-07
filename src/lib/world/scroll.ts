// Scroll behaviour of the illustrated screens, kept apart from React so it can be tested.
//
// The app has one scroll container for every screen. Without help, a screen opens at whatever position
// the previous one left behind, and going back never returns to where the student was. `scrollMemory`
// remembers a position per screen; `deltaToReveal` says how far to scroll so a thing the student just
// picked is not left behind the strip pinned at the bottom.

const positions = new Map<string, number>();

export const scrollMemory = {
  get: (key: string): number | undefined => positions.get(key),
  has: (key: string): boolean => positions.has(key),
  set: (key: string, top: number): void => {
    positions.set(key, Math.max(0, Math.round(top)));
  },
  clear: (): void => positions.clear(),
};

export type Band = { top: number; bottom: number };

/** How many pixels to scroll (positive = down) so `rect` sits inside `band`: nothing if it is already
 *  fully inside with `margin` to spare, otherwise centred, or aligned to the top if it is taller than
 *  the band. Positions are viewport coordinates, as getBoundingClientRect gives them. */
export function deltaToReveal(rect: Band, band: Band, margin = 12): number {
  const room = band.bottom - band.top - 2 * margin;
  const height = rect.bottom - rect.top;
  if (height > room) return Math.round(rect.top - (band.top + margin));
  if (rect.top >= band.top + margin && rect.bottom <= band.bottom - margin) return 0;
  return Math.round((rect.top + rect.bottom) / 2 - (band.top + band.bottom) / 2);
}
