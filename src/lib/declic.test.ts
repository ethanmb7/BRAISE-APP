import { describe, expect, it } from "vitest";
import { DECLIC_SCRIPTS, nextCardIndex } from "@/lib/declic";

// La fin d'un Déclic a planté pour de vrai : deux appuis rapprochés sur « Suite » poussaient
// l'index à 12 sur un script de 11 cartes, et l'élève recevait « Oups, un truc a planté » à la
// place de sa récompense. Ces tests tiennent la borne, pas le détail de l'animation.
describe("avancer dans un Déclic", () => {
  it("avance d'une carte", () => {
    expect(nextCardIndex(0, 11)).toBe(1);
    expect(nextCardIndex(5, 11)).toBe(6);
  });

  it("ne dépasse jamais la dernière carte, même sur plusieurs appuis", () => {
    let i = 9;
    for (let tap = 0; tap < 6; tap++) i = nextCardIndex(i, 11);
    expect(i).toBe(10);
  });

  it("tient sur un script vide ou d'une seule carte plutôt que de rendre -1", () => {
    expect(nextCardIndex(0, 1)).toBe(0);
    expect(nextCardIndex(0, 0)).toBe(0);
  });

  it("garde chaque script réel dans ses bornes, carte par carte", () => {
    for (const [chapterId, script] of Object.entries(DECLIC_SCRIPTS)) {
      let i = 0;
      // Deux appuis par carte : le tap voulu, et celui de trop.
      for (let tap = 0; tap < script.cards.length * 2; tap++) {
        i = nextCardIndex(i, script.cards.length);
        expect(script.cards[i], `${chapterId} à l'index ${i}`).toBeDefined();
      }
    }
  });
});
