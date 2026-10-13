import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CUES, setHaptics, sfx, type Cue } from "@/lib/sound";

const cues = Object.entries(CUES) as [string, Cue][];
const buzzOf = (cue: Cue) => (typeof cue.haptic === "number" ? [cue.haptic] : cue.haptic);
// A pattern alternates buzz, pause, buzz...: the buzz time is the even positions.
const buzzTime = (cue: Cue) =>
  buzzOf(cue).reduce((sum, ms, i) => (i % 2 === 0 ? sum + ms : sum), 0);
const length = (cue: Cue) => buzzOf(cue).reduce((sum, ms) => sum + ms, 0);

describe("every cue stays small", () => {
  it.each(cues)("%s: notes are audible, short and not loud", (_name, cue) => {
    expect(cue.tones.length).toBeGreaterThan(0);
    for (const tone of cue.tones) {
      expect(tone.f).toBeGreaterThanOrEqual(80);
      expect(tone.f).toBeLessThanOrEqual(3000);
      expect(tone.d).toBeLessThanOrEqual(0.6);
      expect((tone.delay ?? 0) + tone.d).toBeLessThanOrEqual(1.2);
      expect(tone.v ?? 0.18).toBeLessThanOrEqual(0.2);
    }
  });

  it.each(cues)("%s: the buzz is brief and never a long rumble", (_name, cue) => {
    expect(buzzTime(cue)).toBeLessThanOrEqual(80);
    expect(length(cue)).toBeLessThanOrEqual(1000);
  });
});

describe("the sound of a conversation is never harsh", () => {
  it("a Déclic never buzzes: its cues use no sawtooth", () => {
    for (const name of ["soft", "reveal", "declic", "xp", "correct"] as const) {
      const cue: Cue = CUES[name];
      expect(cue.tones.some((t) => t.t === "sawtooth")).toBe(false);
    }
  });

  it("the soft cue is gentler than the verdict it replaces in a Déclic", () => {
    const soft = CUES.soft;
    const wrong = CUES.wrong;
    expect(Math.max(...soft.tones.map((t) => t.v ?? 0.18))).toBeLessThan(0.18);
    expect(buzzTime(soft)).toBeLessThan(buzzTime(wrong));
    expect(buzzOf(soft).length).toBe(1);
    // It falls, like a "hm", instead of jumping.
    expect(soft.tones[1].f).toBeLessThan(soft.tones[0].f);
  });

  it("the Déclic signature is its own: no other cue has its click", () => {
    const click = (cue: Cue) =>
      cue.tones.some((t) => t.t === "square" && t.d <= 0.03 && t.f > 1500);
    expect(click(CUES.declic)).toBe(true);
    for (const [name, cue] of cues) if (name !== "declic") expect(click(cue)).toBe(false);
  });

  it("the players of a Déclic and of a course never play the verdict buzz", () => {
    const SRC = new URL("../", import.meta.url).pathname;
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? files(path) : path.endsWith(".tsx") ? [path] : [];
      });
    const bad: string[] = [];
    for (const dir of ["components/declic", "components/course"]) {
      for (const path of files(join(SRC, dir))) {
        const code = readFileSync(path, "utf8");
        if (/sfx\.wrong|sfx\[[^\]]*"wrong"/.test(code)) bad.push(path.replace(SRC, ""));
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("the buzz is the student's to switch off", () => {
  const vibrate = vi.fn();
  beforeEach(() => {
    vibrate.mockClear();
    vi.stubGlobal("navigator", { vibrate });
  });
  afterEach(() => {
    setHaptics(true);
    vi.unstubAllGlobals();
  });

  it("buzzes by default, with the sound switched off (the two are independent)", () => {
    setHaptics(true);
    sfx.tap(false);
    expect(vibrate).toHaveBeenCalledWith(CUES.tap.haptic);
  });

  it("does not buzz once it is switched off, whatever the cue", () => {
    setHaptics(false);
    for (const name of Object.keys(CUES) as (keyof typeof CUES)[]) sfx[name](true);
    sfx.whoosh(true);
    expect(vibrate).not.toHaveBeenCalled();
  });
});
