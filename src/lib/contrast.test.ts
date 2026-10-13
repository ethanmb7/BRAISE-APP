import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { contrastRatio, mixHex } from "@/lib/contrast";

// The tokens are read from braise.css itself, not copied here: a copy goes stale (it once did, and
// kept checking a background the app no longer has). What a test can't see is the colour a CSS
// `color-mix()` resolves to, so the formula is read too and resolved with `mixHex`.
const SRC = new URL("../", import.meta.url).pathname;
const css = readFileSync(join(SRC, "braise.css"), "utf8");

const block = (selector: RegExp) => {
  const m = css.match(selector);
  if (!m) throw new Error(`block not found: ${selector}`);
  return m[1];
};
const root = block(/^:root\s*\{([\s\S]*?)^\}/m);
const dark = block(/^\.dark\s*\{([\s\S]*?)^\}/m);
const token = (scope: string, name: string) => {
  const m = scope.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`token not found: --${name}`);
  // `contrastRatio` reads six-digit hex: #fff becomes #ffffff.
  const value = m[1].trim();
  return /^#[0-9a-f]{3}$/i.test(value)
    ? "#" + [...value.slice(1)].map((c) => c + c).join("")
    : value;
};

/** `color-mix(in srgb, var(--a) 70%, var(--b) 30%)` or `..., #000)` → the resolved hex. */
function resolveMix(formula: string, vars: Record<string, string>): string {
  const m = formula.match(/^color-mix\(in srgb,\s*(\S+(?:\(--[\w-]+\))?)\s+(\d+)%,\s*(.+)\)$/);
  if (!m) throw new Error(`not a two-colour mix: ${formula}`);
  const pick = (part: string) => {
    const v = part.trim().match(/^var\(--([\w-]+)\)/);
    return v ? vars[v[1]] : part.trim().split(/\s+/)[0];
  };
  return mixHex(pick(m[1]), pick(m[3]), Number(m[2]));
}

const NEO_ORANGE = token(root, "neo-orange");
const NEO_INK = token(root, "neo-ink");
const LIGHT = { bg: token(root, "bg"), paper: token(root, "paper"), ink: token(root, "ink") };
const DARK = { bg: token(dark, "bg"), paper: token(dark, "paper"), ink: token(dark, "ink") };

const ON_ORANGE = token(root, "on-orange");
const orangeFill = resolveMix(token(root, "orange-fill"), { "neo-orange": NEO_ORANGE });
const orangeTextLight = resolveMix(token(root, "orange-text"), {
  "neo-orange": NEO_ORANGE,
  ink: LIGHT.ink,
});
const orangeTextDark = resolveMix(token(dark, "orange-text"), {
  "neo-orange": NEO_ORANGE,
  ink: DARK.ink,
});

// The soft orange glow behind a page header (a 9% wash of the orange over the page).
const GLOW = mixHex(NEO_ORANGE, LIGHT.bg, 9);
const AA = 4.5;

describe("the signature orange, and why words never use it plain", () => {
  it("the vivid orange is below the 4.5:1 floor with white and on the page (so it can't carry small words)", () => {
    expect(contrastRatio(NEO_ORANGE, "#ffffff")).toBeLessThan(AA);
    expect(contrastRatio(NEO_ORANGE, LIGHT.bg)).toBeLessThan(AA);
  });

  it("dark ink on the vivid orange passes (the Pioche card)", () => {
    expect(contrastRatio(NEO_INK, NEO_ORANGE)).toBeGreaterThanOrEqual(AA);
  });

  it("--orange-fill with its label --on-orange passes (whichever pair the app picks)", () => {
    expect(contrastRatio(ON_ORANGE, orangeFill)).toBeGreaterThanOrEqual(AA);
  });

  it("--orange-text: orange words pass on every light surface they sit on", () => {
    for (const surface of [LIGHT.bg, LIGHT.paper, GLOW]) {
      expect(contrastRatio(orangeTextLight, surface)).toBeGreaterThanOrEqual(AA);
    }
  });

  it("--orange-text: and on every dark surface (it is re-declared under .dark, where --ink is light)", () => {
    for (const surface of [DARK.bg, DARK.paper]) {
      expect(contrastRatio(orangeTextDark, surface)).toBeGreaterThanOrEqual(AA);
    }
    // Resolved against the wrong ink it would be the light-mode colour on a dark page.
    expect(orangeTextDark).not.toBe(orangeTextLight);
  });
});

// Guards on the source, so a future rule can't bring the problem back unnoticed.
function files(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path, ext) : path.endsWith(ext) ? [path] : [];
  });
}

describe("no rule puts small words on the plain vivid orange", () => {
  const rules: { file: string; selector: string; body: string }[] = [];
  for (const path of files(SRC, ".css")) {
    const text = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      rules.push({
        file: path.replace(SRC, ""),
        selector: m[1].trim().replace(/\s+/g, " "),
        body: m[2],
      });
    }
  }

  it("a plain orange fill never carries a white or paper label", () => {
    // A 26px badge with a pencil in it is a graphic, held to 3:1 (3.4:1 here), not a label.
    const graphics = [".profile-hero-edit-badge"];
    const bad = rules
      .filter((r) => !graphics.includes(r.selector))
      .filter((r) => /background(?:-color)?:\s*var\(--neo-orange\)\s*;/.test(r.body))
      .filter((r) => /(?:^|[\s;])color:\s*(?:#fff(?:fff)?|white|var\(--paper\))\s*;/.test(r.body))
      .map((r) => `${r.file}: ${r.selector}`);
    expect(bad).toEqual([]);
  });

  it("plain orange is only a text colour for icons and big figures", () => {
    // An icon or a 2.6rem score is held to 3:1, not 4.5:1; a kicker or a label is not.
    const allowed = new Set([".share-modal-title-icon", ".settings-row-icon", ".big-score"]);
    const bad = rules
      .filter((r) => /(?:^|[\s;])color:\s*var\(--neo-orange\)\s*;/.test(r.body))
      .filter((r) => ![...allowed].some((a) => r.selector.includes(a)))
      .map((r) => `${r.file}: ${r.selector}`);
    expect(bad).toEqual([]);
  });

  it("a Tailwind plain-orange button never carries a white or paper label", () => {
    const bad: string[] = [];
    for (const path of files(SRC, ".tsx")) {
      const code = readFileSync(path, "utf8");
      for (const m of code.matchAll(/bg-sapie-neo-orange[^`"']{0,260}/g)) {
        if (/text-white|text-sapie-paper/.test(m[0])) bad.push(path.replace(SRC, ""));
      }
    }
    expect(bad).toEqual([]);
  });
});
