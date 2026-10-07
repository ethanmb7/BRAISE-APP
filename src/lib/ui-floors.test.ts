import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

// BRAISE's floors (see DESIGN_RULES.md): no text below 11.2 px (0.7 rem). A teenager reads this on a phone,
// in a bus; the small capital labels are part of the style, but they stay legible.
const FLOOR = 0.7;
const SRC = new URL("../", import.meta.url).pathname;

function files(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path, ext) : path.endsWith(ext) ? [path] : [];
  });
}

describe("text size floor", () => {
  it("has no font-size below 0.7rem in the stylesheets", () => {
    const bad: string[] = [];
    for (const path of files(SRC, ".css")) {
      const css = readFileSync(path, "utf8");
      for (const m of css.matchAll(/font(?:-size)?:[^;{}]*?(?:^|\s)(\d*\.\d+)rem/g)) {
        if (parseFloat(m[1]) < FLOOR) bad.push(`${path.replace(SRC, "")}: ${m[0].trim()}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("has no tiny Tailwind text size in the components", () => {
    const bad: string[] = [];
    for (const path of files(SRC, ".tsx")) {
      const code = readFileSync(path, "utf8");
      for (const m of code.matchAll(/text-\[(\d*\.\d+)rem\]/g)) {
        if (parseFloat(m[1]) < FLOOR) bad.push(`${path.replace(SRC, "")}: ${m[0]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
