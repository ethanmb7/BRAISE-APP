import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

// The islands and the worlds are pressable buttons animated by framer-motion, which writes its own
// `transform` on them while they are pressed. If the stylesheet also centred them with a transform, the
// press would replace it and the button would jump sideways (it did). They must be centred another way.
const css = readFileSync(new URL("../../world.css", import.meta.url), "utf8");

function ruleOf(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start, `${selector} should have a rule`).toBeGreaterThan(-1);
  // Comments are not rules: the explanation next to the fix mentions the word.
  return css.slice(start, css.indexOf("}", start)).replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("world.css", () => {
  it.each([".isl", ".planet"])("%s is not positioned with a transform", (selector) => {
    expect(ruleOf(selector)).not.toMatch(/transform\s*:/);
  });

  it.each([".isl", ".planet"])("%s is centred with a negative margin instead", (selector) => {
    expect(ruleOf(selector)).toMatch(/margin(-left)?\s*:[^;]*-0\.5/);
  });
});
