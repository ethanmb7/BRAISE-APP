import { describe, it, expect } from "vitest";
import { parseDeclicScript, DeclicParseError } from "@/lib/declicParser";

const VALID = `NOTION: x1
CARTE_REVISION: fc1
ACCROCHE: Une question ?

SITUATION
Le décor.

CHOIX
Quelle est la bonne ?
- Mauvaise => Réaction un.
~ Une autre façon de l'expliquer.
- [correct] Bonne => Réaction deux.

REFORMULATION
Explique avec tes mots.

DECLIC
Voilà.

FICHE: Le titre
RETENIR
Ceci.
PIEGE
Cela.
`;

function parseError(text: string): string {
  try {
    parseDeclicScript(text, "t.txt");
  } catch (e) {
    expect(e).toBeInstanceOf(DeclicParseError);
    return (e as Error).message;
  }
  throw new Error("expected the parser to reject this script");
}

describe("parseDeclicScript", () => {
  it("reads the header fields and every card in order", () => {
    const script = parseDeclicScript(VALID, "t.txt");
    expect(script.chapterId).toBe("x1");
    expect(script.reviewCardId).toBe("fc1");
    expect(script.hook).toBe("Une question ?");
    expect(script.cards.map((c) => c.kind)).toEqual([
      "situation",
      "choice",
      "reformulation",
      "declic",
      "fiche",
    ]);
  });

  it("marks exactly one option correct and keeps the alternative explanation on its own option", () => {
    const choice = parseDeclicScript(VALID, "t.txt").cards[1];
    if (choice.kind !== "choice") throw new Error("expected a choice card");
    expect(choice.options.map((o) => o.id)).toEqual(["mauvaise", "bonne"]);
    expect(choice.options.filter((o) => o.correct)).toHaveLength(1);
    expect(choice.options[0].altExplanation).toBe("Une autre façon de l'expliquer.");
    expect(choice.options[1].altExplanation).toBeUndefined();
    expect(choice.options[0].reaction).toBe("Réaction un.");
  });

  it("makes the PIEGE block optional", () => {
    const withoutPiege = VALID.replace("PIEGE\nCela.\n", "");
    const fiche = parseDeclicScript(withoutPiege, "t.txt").cards.at(-1);
    expect(fiche?.kind).toBe("fiche");
    if (fiche?.kind === "fiche") expect(fiche.piege).toBeUndefined();
  });

  it("joins a wrapped paragraph with single spaces", () => {
    const wrapped = VALID.replace("Le décor.", "Le décor,\nsur deux lignes.");
    const situation = parseDeclicScript(wrapped, "t.txt").cards[0];
    if (situation.kind !== "situation") throw new Error("expected a situation card");
    expect(situation.text).toBe("Le décor, sur deux lignes.");
  });

  it("ignores a # comment line placed between two cards", () => {
    const commented = VALID.replace("\nCHOIX\n", "\n# note pour l'auteur\nCHOIX\n");
    expect(parseDeclicScript(commented, "t.txt").cards.map((c) => c.kind)).toEqual([
      "situation",
      "choice",
      "reformulation",
      "declic",
      "fiche",
    ]);
  });

  it("attaches a timeline to the card that follows it", () => {
    const withTimeline = VALID.replace(
      "SITUATION\nLe décor.",
      "VISUEL: timeline\n- 1789: Prise de la Bastille\n- 1793: Exécution de Louis XVI\n\nSITUATION\nLe décor.",
    );
    const situation = parseDeclicScript(withTimeline, "t.txt").cards[0];
    if (situation.kind !== "situation") throw new Error("expected a situation card");
    expect(situation.visual?.events).toEqual([
      { year: 1789, label: "Prise de la Bastille" },
      { year: 1793, label: "Exécution de Louis XVI" },
    ]);
  });

  it("gives two options with the same label distinct ids", () => {
    const dup = VALID.replace("- Mauvaise =>", "- Bonne =>");
    const choice = parseDeclicScript(dup, "t.txt").cards[1];
    if (choice.kind !== "choice") throw new Error("expected a choice card");
    expect(new Set(choice.options.map((o) => o.id)).size).toBe(2);
  });

  describe("rejects what would ship a broken lesson", () => {
    it("a file that does not start with NOTION", () => {
      expect(parseError(VALID.replace("NOTION: x1\n", ""))).toMatch(/NOTION/);
    });

    it("a choice with no correct answer", () => {
      expect(parseError(VALID.replace("[correct] ", ""))).toMatch(/exactement une/);
    });

    it("a choice with two correct answers", () => {
      expect(parseError(VALID.replace("- Mauvaise", "- [correct] Mauvaise"))).toMatch(
        /exactement une/,
      );
    });

    it("a choice with a single option", () => {
      const single = VALID.replace(
        "- Mauvaise => Réaction un.\n~ Une autre façon de l'expliquer.\n",
        "",
      );
      expect(parseError(single)).toMatch(/au moins 2 options/);
    });

    it("an option with no reaction after =>", () => {
      expect(parseError(VALID.replace("- Mauvaise => Réaction un.", "- Mauvaise =>"))).toMatch(
        /au moins 2 options/,
      );
    });

    it("a file that does not end on a FICHE", () => {
      const noFiche = VALID.slice(0, VALID.indexOf("FICHE:"));
      expect(parseError(noFiche)).toMatch(/FICHE/);
    });

    it("a file with no REFORMULATION", () => {
      expect(parseError(VALID.replace("REFORMULATION\nExplique avec tes mots.\n\n", ""))).toMatch(
        /REFORMULATION/,
      );
    });

    it("a file with no DECLIC", () => {
      expect(parseError(VALID.replace("DECLIC\nVoilà.\n\n", ""))).toMatch(/DECLIC/);
    });

    it("an unknown keyword, with the line number in the message", () => {
      const msg = parseError(VALID.replace("DECLIC\nVoilà.", "PAUSE\nVoilà."));
      expect(msg).toMatch(/mot-clé inconnu/);
      expect(msg).toMatch(/t\.txt:\d+/);
    });

    it("a FICHE with no RETENIR", () => {
      expect(parseError(VALID.replace("RETENIR\nCeci.\n", ""))).toMatch(/RETENIR/);
    });
  });
});
