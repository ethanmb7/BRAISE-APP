import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The rules of the voice, kept as a test because they are easy to break one line at a time: Braise teases
// the trap, never the person (PRODUCT_VISION.md, "Coach énergie"), never guilts, and the app is called
// BRAISE. The notifications have their own, stricter check (lib/notifications/copy.ts).

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "courses" ? [] : walk(path);
    return /\.(tsx?|txt)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });

const code = (path: string) =>
  readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");

describe("the voice", () => {
  const files = walk("src");

  it("never teases the person's ability or predicts their failure", () => {
    const BAD =
      /pas si nul|couru d'avance|mérites? pas|aurait pleuré|fait mal au cœur|comme un débutant|sans forcer|un neurone qui bosse/i;
    const hits = files.filter((f) => BAD.test(code(f)));
    expect(hits).toEqual([]);
  });

  it("never gives the student a mark: no precision percentage, no count of mistakes", () => {
    const BAD = /Précision|ERREUR\$\{|\{precision\}/;
    const hits = files.filter((f) => BAD.test(code(f)));
    expect(hits).toEqual([]);
  });

  it("calls the app BRAISE, not by its old name", () => {
    const hits = files.filter((f) => /\bSAPIE\b/.test(code(f).replace(/sapie_\w+/g, "")));
    expect(hits).toEqual([]);
  });

  it("has no leaderboard or ranking between students in what the student reads", () => {
    const hits = files.filter((f) =>
      /leaderboard|top \d+ ?%|classement (des|de la|entre) /i.test(code(f)),
    );
    // The glossary may say there is none ("Aucun classement entre élèves").
    expect(hits.filter((f) => !f.endsWith("glossary.ts"))).toEqual([]);
  });
});
