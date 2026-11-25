import { describe, expect, it } from "vitest";

import { splitRichText } from "./RichText";

/** The highlighted runs of a text, in order — what the student's eye is sent to. */
function marks(text: string): string[] {
  return splitRichText(text)
    .filter((p) => p.startsWith("==") && p.endsWith("=="))
    .map((p) => p.slice(2, -2));
}

describe("splitRichText", () => {
  it("surligne un nombre clé", () => {
    expect(marks("Le reste vaut ==0==, donc multiple.")).toEqual(["0"]);
  });

  it("surligne plusieurs passages d'une même carte", () => {
    expect(marks("==0== puis ==k × b==")).toEqual(["0", "k × b"]);
  });

  // Une égalité surlignée est le cas normal en maths : « a = kb » est justement ce que l'œil doit
  // attraper. Une règle qui s'arrêtait au premier « = » laissait la marque ouverte et peignait le
  // paragraphe suivant (vu sur la carte finale de M2-ARI-D07).
  it("surligne une égalité, signe = compris", () => {
    expect(marks("Le test : ==si r = 0 alors « multiple »==.")).toEqual([
      "si r = 0 alors « multiple »",
    ]);
  });

  it("ne déborde pas sur le texte qui suit une égalité surlignée", () => {
    const text = "==si r = 0 alors « oui »==.\n⚠️ Piège : le grand est le multiple.";
    expect(marks(text)).toEqual(["si r = 0 alors « oui »"]);
    expect(splitRichText(text).join("").replace(/==/g, "")).toBe(
      "si r = 0 alors « oui ».\n⚠️ Piège : le grand est le multiple.",
    );
  });

  it("laisse le texte brut quand une marque n'est pas refermée", () => {
    expect(marks("Reste ==0 sans fin")).toEqual([]);
    expect(splitRichText("Reste ==0 sans fin")).toEqual(["Reste ==0 sans fin"]);
  });

  it("sépare l'emphase et les maths des mots qui les entourent", () => {
    expect(splitRichText("Un **multiple** de $b$")).toEqual(["Un ", "**multiple**", " de ", "$b$"]);
  });
});
