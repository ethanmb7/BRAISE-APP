import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync(new URL("../../world.css", import.meta.url), "utf8");

function ruleOf(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start, `${selector} should have a rule`).toBeGreaterThan(-1);
  // Comments are not rules: the explanation next to a fix mentions the very words we look for.
  return css.slice(start, css.indexOf("}", start)).replace(/\/\*[\s\S]*?\*\//g, "");
}

// The islands and the worlds are pressable buttons animated by framer-motion, which writes its own
// `transform` on them while they are pressed. If the stylesheet also moved them with a transform, the
// press would replace it and the button would jump (it did, when they were centred that way).
describe("world.css: the pressable places", () => {
  it.each([".isl", ".planet"])("%s is not moved with a transform", (selector) => {
    expect(ruleOf(selector)).not.toMatch(/transform\s*:/);
  });
});

// Anything written is laid out in the flow, inside the box of the thing it names. A position taken from
// the screen's width, and a name placed at it, is how a name ended up over another world on a small
// phone or with a bigger text size. Only pictures and decoration may be placed that way.
describe("world.css: written things stay in the flow", () => {
  it.each([
    ".planet",
    ".planet-meta",
    ".planet-label",
    ".planet-tag",
    ".isl",
    ".isl-slot",
    ".isl-label",
    ".isl-label b",
    ".isl-tag",
    ".wd-soon",
    ".dock-says",
    ".state-key",
    ".state-key li",
    ".sheet-head",
    ".sheet-title",
    ".sheet-says",
    ".sheet-list",
    ".sheet-row",
    ".sheet-text",
    ".sheet-all",
    ".planet-tag",
    ".info-note",
    ".hub-legend",
  ])("%s is not absolutely positioned", (selector) => {
    expect(ruleOf(selector)).not.toMatch(/position\s*:\s*absolute/);
  });

  it("has no scene-unit arithmetic left", () => {
    expect(css).not.toMatch(/var\(--u\)/);
  });

  it("sizes the pictures from the width of the screen with a floor and a ceiling", () => {
    for (const selector of [".planet-ball", ".isl-stage"]) {
      expect(ruleOf(selector)).toMatch(/clamp\([^)]*cqw/);
    }
  });
});
