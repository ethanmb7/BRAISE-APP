// The dashed orbit of "Où on va ?" is drawn through the real centres of the worlds, measured on the
// screen, so it passes through them whatever the phone or the text size moved. Pure, so the fitting is
// tested without a screen.
export type Pt = { x: number; y: number };
export type Orbit = { cx: number; cy: number; rx: number; ry: number };

/** The ellipse centred on the sun that the worlds sit on. Least squares on x²/rx² + y²/ry² = 1, which is
 *  linear in 1/rx² and 1/ry²; a circle through their mean distance when that has no ellipse to give
 *  (one world, or all of them in a line with the sun). */
export function fitOrbit(sun: Pt, worlds: Pt[]): Orbit | null {
  if (worlds.length === 0) return null;
  const d = worlds.map((w) => ({ dx: w.x - sun.x, dy: w.y - sun.y }));
  const circle = (): Orbit => {
    const r = d.reduce((sum, p) => sum + Math.hypot(p.dx, p.dy), 0) / d.length;
    return { cx: sun.x, cy: sun.y, rx: r, ry: r };
  };

  let s40 = 0;
  let s22 = 0;
  let s04 = 0;
  let s20 = 0;
  let s02 = 0;
  for (const { dx, dy } of d) {
    s40 += dx ** 4;
    s22 += dx ** 2 * dy ** 2;
    s04 += dy ** 4;
    s20 += dx ** 2;
    s02 += dy ** 2;
  }
  const det = s40 * s04 - s22 * s22;
  if (Math.abs(det) < 1e-6) return circle();
  const a = (s20 * s04 - s22 * s02) / det;
  const b = (s40 * s02 - s22 * s20) / det;
  if (!(a > 0) || !(b > 0)) return circle();
  return { cx: sun.x, cy: sun.y, rx: 1 / Math.sqrt(a), ry: 1 / Math.sqrt(b) };
}
