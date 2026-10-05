import { describe, it, expect } from "vitest";
import { pickLine, toned, DEFAULT_TONE, type Lines } from "@/lib/tone";
import { COPY } from "@/lib/copy";
import type { Personality } from "@/types";

const lines: Lines = { chill: "calme", savage: "direct" };

describe("pickLine", () => {
  it("returns the line written for the tone", () => {
    expect(pickLine("chill", lines)).toBe("calme");
    expect(pickLine("savage", lines)).toBe("direct");
  });

  it("falls back to the default tone for a value it does not know", () => {
    expect(pickLine("inconnu" as Personality, lines)).toBe(lines[DEFAULT_TONE]);
  });
});

describe("toned", () => {
  it("uses the override for the tone, else the base text", () => {
    expect(toned("base", { savage: "piquant" }, "savage")).toBe("piquant");
    expect(toned("base", { savage: "piquant" }, "chill")).toBe("base");
    expect(toned("base", undefined, "savage")).toBe("base");
  });
});

// Every line in COPY, with the functions called on a singular and a plural example.
function collect(node: unknown, path: string, out: { path: string; lines: Lines }[]) {
  if (typeof node === "function") {
    for (const n of [1, 5]) collect((node as (n: number) => unknown)(n), `${path}(${n})`, out);
  } else if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj.chill === "string" && typeof obj.savage === "string") {
      out.push({ path, lines: obj as Lines });
    } else {
      for (const [key, value] of Object.entries(obj)) collect(value, `${path}.${key}`, out);
    }
  }
}

describe("COPY", () => {
  const all: { path: string; lines: Lines }[] = [];
  collect(COPY, "COPY", all);

  it("finds the lines it is supposed to check", () => {
    expect(all.length).toBeGreaterThan(20);
  });

  it("writes every line in both tones, and the two are actually different", () => {
    for (const { path, lines: l } of all) {
      expect(l.chill.trim(), `${path} chill`).not.toBe("");
      expect(l.savage.trim(), `${path} savage`).not.toBe("");
      expect(l.savage, `${path}: savage is a copy of chill`).not.toBe(l.chill);
    }
  });

  it("keeps the same numbers in both tones of a line that carries one", () => {
    for (const { path, lines: l } of all) {
      const digits = (s: string) => (s.match(/\d+/g) ?? []).join(",");
      expect(digits(l.savage), `${path}: the numbers differ between tones`).toBe(digits(l.chill));
    }
  });
});
