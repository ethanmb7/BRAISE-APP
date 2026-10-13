// The dotted trail between the islands of a map. Pure (the points are measured on the screen by the
// component), so the curve is tested without one.
export type Pt = { x: number; y: number };

/** A smooth path through the points in order: between two islands it leaves and arrives vertically,
 *  an S that follows the zigzag of the map. Empty for fewer than two points. */
export function trailPath(points: Pt[]): string {
  if (points.length < 2) return "";
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const mid = (a.y + b.y) / 2;
    d += ` C${f(a.x)} ${f(mid)} ${f(b.x)} ${f(mid)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}
