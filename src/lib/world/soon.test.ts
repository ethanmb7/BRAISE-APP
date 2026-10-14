import { describe, expect, it } from "vitest";
import { SOON_CHOICES, activeSoon, focusSubjectId, soonAt } from "./soon";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

describe("soon", () => {
  it("offers three taps, from tomorrow to next week", () => {
    expect(SOON_CHOICES.map((c) => c.days)).toEqual([1, 4, 10]);
    expect(soonAt(SOON_CHOICES[0], NOW)).toBe(NOW + DAY);
  });

  it("forgets a date a day after it has passed, so nothing lingers", () => {
    const soonBy = { maths: NOW - 2 * DAY, svt: NOW - DAY / 2, anglais: NOW + DAY };
    expect(Object.keys(activeSoon(soonBy, NOW)).sort()).toEqual(["anglais", "svt"]);
  });

  it("leans on the subject whose date comes first", () => {
    expect(focusSubjectId({ maths: NOW + 5 * DAY, svt: NOW + 2 * DAY }, NOW)).toBe("svt");
  });

  it("leans on nothing when nothing is coming", () => {
    expect(focusSubjectId({}, NOW)).toBeNull();
    expect(focusSubjectId(undefined, NOW)).toBeNull();
    expect(focusSubjectId({ maths: NOW - 3 * DAY }, NOW)).toBeNull();
  });
});
