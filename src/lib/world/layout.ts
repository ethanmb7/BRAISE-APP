// Where things sit in the two illustrated scenes. Both are built in the page's flow, never at drawn
// coordinates: the names live in the same boxes as the pictures, so a narrower phone or a bigger text
// size pushes things apart instead of laying one over another. What is left to decide is only which
// box each thing goes in, which is pure and tested without a screen.

/** The most worlds the "Où on va ?" screen holds (three above Braise, three below). More subjects than
 *  that and the screen falls back to a plain grid. */
export const HUB_CAPACITY = 6;

export type HubPlace = { col: 1 | 2 | 3; row: 1 | 2 | 3 | 4 };

// The sun fills the middle column of the two middle rows. The worlds go around it, like a hexagon:
const TOP: HubPlace = { col: 2, row: 1 };
const UPPER_RIGHT: HubPlace = { col: 3, row: 2 };
const LOWER_RIGHT: HubPlace = { col: 3, row: 3 };
const BOTTOM: HubPlace = { col: 2, row: 4 };
const LOWER_LEFT: HubPlace = { col: 1, row: 3 };
const UPPER_LEFT: HubPlace = { col: 1, row: 2 };

const HUB_PLACES: Record<number, HubPlace[]> = {
  1: [TOP],
  2: [UPPER_LEFT, LOWER_RIGHT],
  3: [TOP, LOWER_RIGHT, LOWER_LEFT],
  4: [UPPER_LEFT, UPPER_RIGHT, LOWER_RIGHT, LOWER_LEFT],
  5: [TOP, UPPER_RIGHT, LOWER_RIGHT, LOWER_LEFT, UPPER_LEFT],
  6: [TOP, UPPER_RIGHT, LOWER_RIGHT, BOTTOM, LOWER_LEFT, UPPER_LEFT],
};

/** Where each world goes around the sun, in the subject's order (a subject keeps its place from one visit
 *  to the next, whatever its state). Clockwise from the top. */
export function hubPlaces(count: number): HubPlace[] {
  return HUB_PLACES[Math.min(Math.max(count, 0), HUB_CAPACITY)] ?? [];
}

export type IslandCell = { column: 1 | 2; row: number; span: 2 };

/** Where an island goes in the two-column path of a subject. Each island takes two grid rows and
 *  they alternate left and right, shifted by one row: neighbours share some height (so the path
 *  zigzags and stays short) but never a column, and two in the same column never share a row. */
export function islandCell(index: number): IslandCell {
  return { column: index % 2 === 0 ? 1 : 2, row: index + 1, span: 2 };
}
