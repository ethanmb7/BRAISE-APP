import { describe, it, expect } from "vitest";
import { COURSE_REGISTRY, getDeck, getDeclic } from "./registry";
import {
  advance,
  computeAssessment,
  currentSteps,
  initRun,
  retryRemediation,
  selectChoice,
  selectStepOption,
  startRetry,
  type Run,
} from "./engine";
import { choiceContent, stepsContent, variantIds } from "./variants";
import type { ChoiceCard, MultiStepCard, Text } from "./types";

// The pilot Déclic is written in the show / together / alone rhythm. These tests do not repeat the
// validator: they recompute every number a question relies on, so a typo in a later edit cannot
// make a student learn a wrong fact.
const def = getDeclic("M2-ARI-D02")!;
const deck = getDeck("M2-ARI-D02-REV")!;
const plain = (t: Text) => (typeof t === "string" ? t : t.text);
const divisors = (n: number) =>
  Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
const clock = (minutes: number) => {
  const total = 8 * 60 + minutes;
  return `${Math.floor(total / 60)} h ${String(total % 60).padStart(2, "0")}`;
};

const validation = def.cards.find((c) => c.id === def.assessment.cardId) as MultiStepCard;
const transfer = def.cards.find((c) => c.type === "choice" && c.variants) as ChoiceCard;

/** Every version of the validation, base first. */
const versions = variantIds(validation).map((id) => stepsContent(validation, id));

describe("the pilot Déclic M2-ARI-D02", () => {
  it("is valid and complete", () => {
    expect(COURSE_REGISTRY.errors).toEqual([]);
    expect(def.cards).toHaveLength(16);
    expect(deck.cards).toHaveLength(8);
  });

  it("alternates telling and doing: an explanation is always followed by a question", () => {
    def.cards.forEach((card, i) => {
      if (card.type !== "reveal") return;
      expect(def.cards[i + 1].type, card.id).not.toBe("reveal");
    });
  });

  it("uses the four beats of the rhythm", () => {
    const beats = new Set(def.cards.map((c) => c.beat).filter(Boolean));
    expect([...beats].sort()).toEqual(["show", "together", "trap", "you"]);
  });

  it("keeps the picture that would give the answer for after the answer", () => {
    const hidden = def.cards.filter(
      (c) => c.type === "choice" && c.visualTiming === "after-answer",
    );
    expect(hidden.map((c) => c.id)).toEqual(["M2-ARI-D02-C02"]);
    const card = hidden[0] as ChoiceCard;
    expect(choiceContent(card).visualTiming).toBe("after-answer");
    expect(choiceContent(card).visual).toMatchObject({ kind: "groups", shareAmong: 5, total: 24 });
  });

  it("validates with three versions of three steps, each with exactly one key step", () => {
    expect(versions).toHaveLength(3);
    for (const v of versions) {
      expect(v.steps).toHaveLength(3);
      expect(v.steps.filter((s) => s.discriminating)).toHaveLength(1);
      // each version has a question per step and the same objectives, by position
      expect(v.steps.every((s) => s.question && s.conceptId && s.remediation)).toBe(true);
      expect(v.steps.map((s) => s.conceptId)).toEqual(versions[0].steps.map((s) => s.conceptId));
    }
  });

  it("spreads the expected letter, so the pattern cannot be learnt", () => {
    const letters = versions.flatMap((v) =>
      v.steps.map((s) => s.options.find((o) => o.correct)!.id),
    );
    expect(new Set(letters).size).toBeGreaterThanOrEqual(3);
    expect(letters.filter((l) => l === "B").length).toBeLessThan(letters.length / 2);
  });

  it("recomputes every expected answer of the validation", () => {
    for (const v of versions) {
      for (const step of v.steps) {
        const q = plain(step.question!);
        const right = step.options.find((o) => o.correct)!;
        let m: RegExpMatchArray | null;
        if ((m = q.match(/^(\d+) = (\d+) × (\d+)\./))) {
          const [n, a, b] = m.slice(1).map(Number);
          expect(n, q).toBe(a * b);
          expect(right.label, q).toBe(`${n} est un multiple de ${a}.`);
        } else if ((m = q.match(/^(\d+) est-il un multiple de (\d+) \?/))) {
          const [n, d] = m.slice(1).map(Number);
          expect(n % d, q).not.toBe(0);
          expect(right.label, q).toMatch(/^Non/);
          expect(step.discriminating, q).toBe(true);
        } else if ((m = q.match(/^Combien (\d+) a-t-il de diviseurs \?/))) {
          const n = Number(m[1]);
          expect(right.label, q).toBe(String(divisors(n).length));
          expect(
            step.options.filter((o) => o.label === right.label),
            q,
          ).toHaveLength(1);
        } else {
          throw new Error(`question inconnue : ${q}`);
        }
      }
    }
  });

  it("recomputes the first meeting time of the three transfer versions", () => {
    const all = [
      choiceContent(transfer),
      ...transfer.variants!.map((v) => choiceContent(transfer, v.id)),
    ];
    expect(all).toHaveLength(3);
    for (const c of all) {
      const text = plain(c.text);
      const [a, b] = [...text.matchAll(/toutes les (\d+)/g)].map((x) => Number(x[1]));
      const right = c.choices.find((x) => x.correct)!;
      const expected = text.includes("secondes") ? `${lcm(a, b)} secondes` : clock(lcm(a, b));
      expect(right.label, text).toBe(expected);
      // the three tempting mistakes are really different from the answer
      const wrong = c.choices.filter((x) => !x.correct).map((x) => x.label);
      expect(new Set([...wrong, right.label]).size).toBe(4);
    }
  });

  it("is understood from a perfect playthrough", () => {
    let run = initRun(def);
    while (run.cardId !== validation.id) run = advance(def, playBest(run));
    run = answerAll(run, [true, true, true]);
    const result = computeAssessment(def, run.answers, 0)!;
    expect(result).toMatchObject({ score: 3, max: 3, status: "understood" });
  });

  it("sends a student who mixed up multiple and integer back to the right cards, then to another version", () => {
    let run = initRun(def);
    while (run.cardId !== validation.id) run = advance(def, playBest(run));
    run = answerAll(run, [true, false, false]); // the key step missed
    while (run.phase === "corrections") run = advance(def, run);
    expect(run.phase).toBe("outcome");
    const remediation = retryRemediation(def, run);
    expect(remediation).toEqual({
      type: "replay",
      fromCardId: "M2-ARI-D02-C02",
      toCardId: "M2-ARI-D02-C04",
    });
    run = startRetry(def, run);
    expect(run.cardId).toBe("M2-ARI-D02-C02");
    while (run.cardId !== validation.id) run = advance(def, playBest(run));
    expect(currentSteps(def, run)?.variantId).toBe("v2");
    expect(plain(currentSteps(def, run)!.steps[0].question!)).toContain("66");
  });
});

describe("the pilot deck", () => {
  it("has as many true as false statements, and a correction for each false one", () => {
    expect(deck.cards.filter((c) => c.answer === "carre")).toHaveLength(4);
    for (const c of deck.cards.filter((x) => x.answer === "intox")) {
      expect(c.correction?.trim(), c.id).toBeTruthy();
    }
  });

  it("covers every concept the validation points at", () => {
    const concepts = new Set(deck.cards.map((c) => c.concept));
    for (const v of versions)
      for (const s of v.steps) expect(concepts.has(s.conceptId!)).toBe(true);
  });
});

/** Plays the current card well: the expected choice, then on through the feedback. */
function playBest(run: Run): Run {
  const card = def.cards.find((c) => c.id === run.cardId)!;
  if (card.type === "choice") {
    const right = choiceContent(
      card,
      variantIds(card)[run.runIndex % variantIds(card).length],
    ).choices.find((c) => c.correct)!;
    return selectChoice(def, run, right.id);
  }
  return run;
}

/** Answers the three steps (true = the expected option), through to the first correction. */
function answerAll(run: Run, right: boolean[]): Run {
  let r = run;
  currentSteps(def, r)!.steps.forEach((s, i) => {
    const option = s.options.find((o) => !!o.correct === right[i])!;
    r = advance(def, selectStepOption(def, r, option.id));
  });
  return r;
}
