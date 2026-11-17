// Les mots que l'élève choisit — le ton de Braise, le rythme — sont posés UNE fois dans data.ts.
// L'onboarding pose la question, la page Moi la rouvre : quand les deux listes vivaient chacune
// dans son fichier, elles ont divergé sans que rien ne le signale. Un élève choisissait « Coach
// énergie » à l'ouverture et retrouvait « Cash » coché dans Moi, pour le même réglage.
//
// Ce test ne vérifie pas un rendu : il vérifie qu'aucun autre fichier ne RÉÉCRIT ces mots. C'est
// la seule façon d'empêcher la dérive de revenir, parce qu'elle revient par copier-coller, pas
// par un bug.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { GOALS, TONES } from "@/data";

const SRC = join(__dirname, "..");
const DATA = join(SRC, "data.ts");

function sourceFiles(): string[] {
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      if (statSync(p).isDirectory()) return walk(p);
      return /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : [];
    });
  return walk(SRC).filter((p) => p !== DATA);
}

describe("les tons et les rythmes n'existent qu'à un seul endroit", () => {
  it("couvre les deux tons et les trois rythmes", () => {
    expect(TONES.map((t) => t.id)).toEqual(["chill", "savage"]);
    expect(GOALS.map((g) => g.id)).toEqual(["tranquille", "regulier", "a-fond"]);
  });

  it("donne à chaque ton un nom, une description et une phrase dite dans ce ton", () => {
    for (const t of TONES) {
      expect(t.title.trim(), t.id).not.toBe("");
      expect(t.desc.trim(), t.id).not.toBe("");
      expect(t.sample.trim(), t.id).not.toBe("");
      expect(t.emoji.trim(), t.id).not.toBe("");
    }
  });

  // Le rythme fixe l'objectif quotidien : l'élève doit pouvoir lire à quoi il s'engage, donc
  // chaque rythme porte une description — c'est elle que l'onboarding affiche sous le contrôle.
  it("donne à chaque rythme une description et une intensité", () => {
    for (const g of GOALS) {
      expect(g.desc.trim(), g.id).not.toBe("");
      expect(g.flames, g.id).toBeGreaterThanOrEqual(1);
      expect(g.flames, g.id).toBeLessThanOrEqual(3);
    }
    expect(GOALS.map((g) => g.flames)).toEqual([1, 2, 3]);
  });

  it("n'est réécrit dans aucun autre fichier", () => {
    const labels = [...TONES.map((t) => t.title), ...GOALS.map((g) => g.title)];
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(20);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const label of labels) {
        expect(text.includes(`"${label}"`), `${file} réécrit « ${label} »`).toBe(false);
      }
    }
  });

  // Les anciens noms courts de la page Moi. S'ils reviennent, c'est que quelqu'un a redonné un
  // deuxième nom à un ton — exactement la dérive qu'on vient de réparer.
  it("ne laisse revenir aucun ancien nom de ton", () => {
    for (const file of sourceFiles()) {
      const text = readFileSync(file, "utf8");
      expect(text.includes('title: "Chill"'), file).toBe(false);
      expect(text.includes('title: "Cash"'), file).toBe(false);
    }
  });
});
