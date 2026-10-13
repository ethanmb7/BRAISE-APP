import { describe, expect, it } from "vitest";
import { trailPath } from "./trail";

describe("trailPath", () => {
  it("has nothing to draw for fewer than two islands", () => {
    expect(trailPath([])).toBe("");
    expect(trailPath([{ x: 10, y: 10 }])).toBe("");
  });

  it("goes through every island in order, leaving and arriving vertically", () => {
    const d = trailPath([
      { x: 50, y: 40 },
      { x: 200, y: 140 },
      { x: 60, y: 260 },
    ]);
    expect(d).toBe("M50 40 C50 90 200 90 200 140 C200 200 60 200 60 260");
  });

  it("rounds to a tenth of a pixel", () => {
    expect(
      trailPath([
        { x: 1.234, y: 2.345 },
        { x: 3.456, y: 4.567 },
      ]),
    ).toMatch(/^M1\.2 2\.3 C/);
  });
});
