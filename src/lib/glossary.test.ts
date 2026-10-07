import { describe, it, expect } from "vitest";
import { GLOSSARY, termById, type TermId } from "./glossary";

describe("glossary", () => {
  it("defines every word once, with a short line and an explanation", () => {
    const ids = GLOSSARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of GLOSSARY) {
      expect(t.label.trim(), t.id).not.toBe("");
      expect(t.short.trim().length, t.id).toBeGreaterThan(10);
      expect(t.long.length, `${t.id} long`).toBeGreaterThan(t.short.length);
    }
  });

  it("never threatens: no 'retard', 'échec' or 'punition', and no ranking between students", () => {
    for (const t of GLOSSARY) {
      const text = `${t.short} ${t.long}`.toLowerCase();
      expect(text, t.id).not.toMatch(/retard|échec|punition|perdu/);
    }
    const aura = termById("aura").long.toLowerCase();
    expect(aura).toContain("aucun classement");
  });

  it("finds a term by id", () => {
    expect(termById("declic").label).toBe("Un Déclic");
    expect(termById("nope" as TermId).id).toBe(GLOSSARY[0].id);
  });
});
