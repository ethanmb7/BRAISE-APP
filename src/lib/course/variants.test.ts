import { describe, it, expect } from "vitest";
import {
  advance,
  applyRun,
  computeAssessment,
  currentChoiceContent,
  currentSteps,
  followUpCards,
  initRun,
  retryRemediation,
  selectChoice,
  selectStepOption,
  selectedChoice,
  startRetry,
  type Run,
} from "./engine";
import { beginRetry, choose, finish, next, openDeclic } from "./session";
import { createProgressStore } from "./progressStore";
import { validateChapter } from "./validate";
import { BASE_VARIANT, variantAtTurn, variantIds } from "./variants";
import type {
  ChapterDef,
  Choice,
  ChoiceCard,
  DeclicDef,
  MultiStepCard,
  ReviewDeckDef,
  Step,
} from "./types";

const T0 = 1_800_000_000_000;
const ID = "Z9-TEST-D01";

const memory = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
};

const choice = (id: string, label: string, correct = false): Choice => ({
  id,
  label,
  correct,
  feedback: `Voilà pourquoi « ${label} » est ${correct ? "la bonne piste" : "une piste à revoir"}.`,
});
const options = (): Choice[] => [choice("r", "juste", true), choice("w", "pas juste")];
const step = (id: string, extra: Partial<Step> = {}): Step => ({
  id: `${ID}-C03-${id}`,
  subject: id,
  options: options(),
  ...extra,
});

/** A Déclic with a question that has a second version, a reveal, and a validation of three steps in
 *  three versions (the card's own and two variants). Its steps send the student back to the cards
 *  that explain them; the key step is the second one. */
function build(): { chapter: ChapterDef; declic: DeclicDef; deck: ReviewDeckDef } {
  const chapter: ChapterDef = {
    id: "Z9-TEST",
    subjectId: "maths",
    level: "seconde",
    title: "Chapitre d'essai",
    source: {
      authority: "a",
      programme: "p",
      applicationYear: "2030",
      bulletin: "b",
      nor: "n",
      path: ["x"],
    },
    mappings: [{ id: "BO-Z-1", requirement: "r", type: "direct" }],
    misconceptions: [{ id: "m_z", label: "z" }],
    declicIds: [ID],
  };
  const c01: ChoiceCard = {
    id: `${ID}-C01`,
    order: 1,
    type: "choice",
    text: "Version une",
    choices: options(),
    variants: [
      {
        id: "v2",
        text: "Version deux",
        choices: [
          choice("a", "autre juste", true),
          choice("b", "autre faux"),
          choice("c", "encore"),
        ],
        visual: { kind: "groups", ariaLabel: "sept points en paires", total: 7, groupSize: 2 },
      },
    ],
  };
  const c03: MultiStepCard = {
    id: `${ID}-C03`,
    order: 3,
    type: "multi-step-choice",
    text: "Valide-toi",
    feedbackTiming: "after-all",
    steps: [
      step("S1", {
        conceptId: "k1",
        remediation: { type: "replay", fromCardId: `${ID}-C01`, toCardId: `${ID}-C01` },
      }),
      step("S2", {
        conceptId: "k2",
        discriminating: true,
        remediation: { type: "replay", fromCardId: `${ID}-C01`, toCardId: `${ID}-C02` },
      }),
      step("S3", { conceptId: "k3" }),
    ],
    variants: [
      {
        id: "v2",
        steps: [step("T1"), step("T2", { discriminating: true, conceptId: "k2" }), step("T3")],
      },
      { id: "v3", steps: [step("U1"), step("U2", { discriminating: true }), step("U3")] },
    ],
  };
  const declic: DeclicDef = {
    id: ID,
    chapterId: "Z9-TEST",
    order: 1,
    title: "t",
    version: "1.0",
    targetDurationSec: [60, 90],
    difficulty: { level: 1, label: "l" },
    objective: "o",
    prerequisites: [],
    detailedObjectives: [],
    coverage: [{ mappingId: "BO-Z-1", coverage: "full" }],
    misconceptionIds: ["m_z"],
    cards: [
      c01,
      { id: `${ID}-C02`, order: 2, type: "reveal", text: "Le nom", continueLabel: "Ok" },
      c03,
      {
        id: `${ID}-C04`,
        order: 4,
        type: "declic-summary",
        text: "Résumé",
        actions: [{ id: "ok", label: "OK", kind: "complete" }],
        menu: [],
      },
    ],
    assessment: {
      cardId: `${ID}-C03`,
      understoodMinScore: 2,
      requireDiscriminatingStep: true,
      understoodMessage: "Bien vu, on te le remontre bientôt.",
      needsReinforcementMessage: "On reprend ce qui coince.",
      followUpCount: 2,
    },
    mastery: { requiredDeferredSuccesses: 1, requiredCardRatio: 1 },
    deckId: `${ID}-REV`,
  };
  const deckCard = (n: 1 | 2 | 3, concept: string): ReviewDeckDef["cards"][number] => ({
    id: `${ID}-REV-0${n}`,
    order: n,
    statement: "s",
    answer: "carre",
    concept,
    difficulty: n,
    tags: [],
    feedback: {
      correct: "Oui, et voici pourquoi en détail.",
      incorrect: "Non, et voici pourquoi en détail.",
    },
  });
  const deck: ReviewDeckDef = {
    id: `${ID}-REV`,
    declicId: ID,
    chapterId: "Z9-TEST",
    title: "d",
    cards: [deckCard(1, "k1"), deckCard(2, "k2"), deckCard(3, "k3")],
  };
  return { chapter, declic, deck };
}

const { chapter, declic: d, deck } = build();
const c01 = d.cards[0] as ChoiceCard;
const validation = d.cards[2] as MultiStepCard;

/** From the first card to the validation, answering well. */
function toValidation(run: Run): Run {
  let r = run;
  while (r.cardId !== validation.id) {
    const card = d.cards.find((c) => c.id === r.cardId)!;
    if (card.type === "choice") {
      const right = currentChoiceContent(d, r)!.choices.find((c) => c.correct)!;
      r = advance(d, selectChoice(d, r, right.id));
    } else r = advance(d, r);
  }
  return r;
}

/** Answers the three steps (true = the expected option), leaving the run on the first correction. */
function answerSteps(run: Run, right: boolean[]): Run {
  let r = run;
  const steps = currentSteps(d, r)!.steps;
  steps.forEach((s, i) => {
    const option = s.options.find((o) => !!o.correct === right[i])!;
    r = advance(d, selectStepOption(d, r, option.id));
  });
  return r;
}
const readCorrections = (run: Run): Run => {
  let r = run;
  while (r.phase === "corrections") r = advance(d, r);
  return r;
};

// ---------------------------------------------------------------------------------------------
describe("the content used here is valid", () => {
  it("passes the validator, variants and pictures included", () => {
    expect(validateChapter(chapter, [d], [deck])).toEqual([]);
  });
});

describe("versions of a question", () => {
  it("lists the card's own version first, then its variants", () => {
    expect(variantIds(c01)).toEqual([BASE_VARIANT, "v2"]);
    expect(variantIds(validation)).toEqual(["v1", "v2", "v3"]);
  });

  it("takes turns, and cycles only once every version has been seen", () => {
    expect([0, 1, 2, 3, 4].map((n) => variantAtTurn(validation, n))).toEqual([
      "v1",
      "v2",
      "v3",
      "v1",
      "v2",
    ]);
    expect(variantAtTurn(c01, 0)).toBe("v1");
    expect(variantAtTurn(c01, 1)).toBe("v2");
    expect(variantAtTurn(c01, 2)).toBe("v1");
  });

  it("plays the base version the first time", () => {
    const run = initRun(d);
    expect(currentChoiceContent(d, run)).toMatchObject({ variantId: "v1", text: "Version une" });
  });

  it("brings the next version when a finished Déclic is started over", () => {
    const store = createProgressStore(memory());
    let run = openDeclic(d, store, T0);
    run = toValidation(run);
    run = advance(d, readCorrections(answerSteps(run, [true, true, true]))); // on to the summary
    finish(d, run, store, T0);
    const again = openDeclic(d, store, T0 + 1);
    expect(again.runIndex).toBe(1);
    expect(currentChoiceContent(d, again)).toMatchObject({ variantId: "v2", text: "Version deux" });
    // The version played is saved with the answer, so it is known afterwards.
    const answered = selectChoice(d, again, "a");
    expect(answered.answers[c01.id]).toEqual({ kind: "choice", choiceId: "a", variantId: "v2" });
  });

  it("does not use a version up when the restart is only opened and left", () => {
    const store = createProgressStore(memory());
    let run = openDeclic(d, store, T0);
    run = toValidation(run);
    run = advance(d, readCorrections(answerSteps(run, [true, true, true])));
    finish(d, run, store, T0);
    expect(openDeclic(d, store, T0 + 1).runIndex).toBe(1);
    expect(openDeclic(d, store, T0 + 2).runIndex).toBe(1);
    expect(openDeclic(d, store, T0 + 3).runIndex).toBe(1);
  });

  it("saves a base-version answer exactly as before, with no version written", () => {
    const run = selectChoice(d, initRun(d), "r");
    expect(run.answers[c01.id]).toEqual({ kind: "choice", choiceId: "r" });
  });

  it("refuses a tap on a choice that belongs to another version", () => {
    const run = initRun(d);
    expect(selectChoice(d, run, "a")).toBe(run); // "a" exists only in v2
  });

  it("treats an answer saved for a version that is not the one to play as not answered", () => {
    const store = createProgressStore(memory());
    openDeclic(d, store, T0);
    store.update((p) => ({
      ...p,
      declics: {
        ...p.declics,
        [d.id]: {
          ...p.declics[d.id],
          currentCardId: c01.id,
          answers: { [c01.id]: { kind: "choice", choiceId: "a", variantId: "v2" } },
        },
      },
    }));
    const resumed = openDeclic(d, store, T0 + 1);
    expect(resumed.phase).toBe("asking"); // run 0 plays v1, not v2: that answer cannot be shown
    expect(resumed.answers[c01.id]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------------------------
describe("corrections held back until every step is answered", () => {
  it("records each answer without showing a correction, then shows them one at a time", () => {
    let run = toValidation(initRun(d));
    const first = selectStepOption(d, run, "w");
    expect(first.phase).toBe("feedback"); // the answer is in…
    run = advance(d, first);
    expect(run.phase).toBe("asking"); // …and on to the next step, no correction in between
    expect(run.stepIndex).toBe(1);
    run = advance(d, selectStepOption(d, run, "r"));
    run = advance(d, selectStepOption(d, run, "w"));
    expect(run.phase).toBe("corrections");
    expect(run.stepIndex).toBe(0);
    expect(selectedChoice(d, run)?.id).toBe("w");
    run = advance(d, run);
    expect(run.phase).toBe("corrections");
    expect(selectedChoice(d, run)?.id).toBe("r");
    run = advance(d, advance(d, run));
    expect(run.phase).toBe("outcome");
  });

  it("shows each step's own correction, whatever was answered", () => {
    const run = answerSteps(toValidation(initRun(d)), [false, true, false]);
    const shown: string[] = [];
    let r = run;
    while (r.phase === "corrections") {
      shown.push(selectedChoice(d, r)!.feedback as string);
      r = advance(d, r);
    }
    expect(shown).toHaveLength(3);
    expect(shown[0]).toContain("pas juste");
    expect(shown[1]).toContain("« juste »");
  });

  it("keeps the corrections of a card that does not ask for them showing after each step", () => {
    const eager: DeclicDef = JSON.parse(JSON.stringify(d));
    (eager.cards[2] as MultiStepCard).feedbackTiming = "each";
    let run = toValidation(initRun(eager));
    run = advance(eager, selectStepOption(eager, run, "r"));
    expect(run.phase).toBe("asking");
    run = selectStepOption(eager, run, "r");
    expect(run.phase).toBe("feedback"); // shown right away, as before
  });

  it("resumes on the corrections when every step was answered and nothing was read", () => {
    const store = createProgressStore(memory());
    let run = toValidation(openDeclic(d, store, T0));
    store.update((p) => ({
      ...p,
      declics: { ...p.declics, [d.id]: applyRun(d, run, p.declics[d.id], T0) },
    }));
    for (let i = 0; i < 3; i++) {
      run = next(d, choose(d, run, "r", store, T0), store, T0);
    }
    expect(run.phase).toBe("corrections");
    const back = openDeclic(d, createProgressStore(storageOf(store)), T0);
    expect(back.phase).toBe("corrections");
    expect(back.stepIndex).toBe(0);
  });

  it("resumes a half-answered validation on its last answered step", () => {
    const store = createProgressStore(memory());
    let run = toValidation(openDeclic(d, store, T0));
    run = next(d, choose(d, run, "r", store, T0), store, T0);
    run = choose(d, run, "w", store, T0); // second step answered, "continue" not tapped
    const back = openDeclic(d, createProgressStore(storageOf(store)), T0);
    expect(back.phase).toBe("feedback");
    expect(back.stepIndex).toBe(1);
    expect(Object.keys(back.stepAnswers)).toHaveLength(2);
  });
});

/** The storage a store was built on, to reopen it as a second app launch would. */
function storageOf(store: ReturnType<typeof createProgressStore>) {
  const raw = JSON.stringify(store.get());
  return {
    getItem: () => raw,
    setItem: () => undefined,
  };
}

// ---------------------------------------------------------------------------------------------
describe("scoring a version of the validation", () => {
  it("grades the version that was played, by its own steps", () => {
    const run = toValidation({ ...initRun(d), attemptIndex: 1 });
    expect(currentSteps(d, run)?.variantId).toBe("v2");
    const done = answerSteps(run, [true, true, false]);
    expect(done.answers[validation.id]).toMatchObject({ kind: "steps", variantId: "v2" });
    const result = computeAssessment(d, done.answers, T0)!;
    expect(result).toMatchObject({
      score: 2,
      max: 3,
      status: "understood",
      discriminatingPassed: true,
    });
    expect(Object.keys(result.stepResults)).toEqual([
      `${ID}-C03-T1`,
      `${ID}-C03-T2`,
      `${ID}-C03-T3`,
    ]);
  });

  it("finds the follow-up concepts of a missed step whichever version was played", () => {
    const run = toValidation({ ...initRun(d), attemptIndex: 1 });
    const done = answerSteps(run, [true, false, true]);
    const result = computeAssessment(d, done.answers, T0)!;
    expect(followUpCards(d, deck, result).map((c) => c.concept)).toEqual(["k2", "k1"]);
  });
});

// ---------------------------------------------------------------------------------------------
describe("going back to the example, then trying again", () => {
  /** A run sitting on the outcome of a validation answered with the given results. */
  const outcomeOf = (right: boolean[], attemptIndex = 0): Run =>
    readCorrections(answerSteps(toValidation({ ...initRun(d), attemptIndex }), right));

  it("offers nothing when the validation is understood", () => {
    expect(retryRemediation(d, outcomeOf([true, true, false]))).toBeNull();
  });

  it("offers the example behind the key step first, when it was missed", () => {
    const run = outcomeOf([false, false, false]);
    expect(run.phase).toBe("outcome");
    expect(retryRemediation(d, run)).toEqual({
      type: "replay",
      fromCardId: `${ID}-C01`,
      toCardId: `${ID}-C02`,
    });
  });

  it("offers the example behind another missed step when the key step was right", () => {
    // 1/3 with the key step right is still below the threshold of 2.
    const run = outcomeOf([false, true, false]);
    expect(retryRemediation(d, run)).toEqual({
      type: "replay",
      fromCardId: `${ID}-C01`,
      toCardId: `${ID}-C01`,
    });
  });

  it("offers nothing for a step with no example authored", () => {
    const weak = outcomeOf([true, false, false]);
    expect(retryRemediation(d, weak)).not.toBeNull(); // S2 has one
    const bare: DeclicDef = JSON.parse(JSON.stringify(d));
    for (const s of (bare.cards[2] as MultiStepCard).steps) delete s.remediation;
    expect(retryRemediation(bare, weak)).toBeNull();
  });

  it("replays the cards without scoring, then comes back to a fresh validation", () => {
    const run = outcomeOf([false, false, false]);
    const go = startRetry(d, run);
    expect(go.cardId).toBe(`${ID}-C01`);
    expect(go.replay).toEqual({ toCardId: `${ID}-C02`, returnCardId: validation.id });
    expect(go.attemptIndex).toBe(1);
    expect(go.answers[validation.id]).toBeUndefined();

    // Replaying a card does not overwrite what was answered the first time.
    const before = go.answers[c01.id];
    let r = advance(d, selectChoice(d, go, "w"));
    expect(r.answers[c01.id]).toEqual(before);
    r = advance(d, r); // the reveal
    expect(r.cardId).toBe(validation.id);
    expect(r.replay).toBeNull();
    expect(r.phase).toBe("asking");
    expect(currentSteps(d, r)?.variantId).toBe("v2"); // another version, not the same items
  });

  it("does nothing outside the outcome of a validation that needs it", () => {
    const early = toValidation(initRun(d));
    expect(startRetry(d, early)).toBe(early);
    const good = outcomeOf([true, true, true]);
    expect(startRetry(d, good)).toBe(good);
  });

  it("offers no retry once every version has been seen", () => {
    expect(retryRemediation(d, outcomeOf([false, false, false], 0))).not.toBeNull();
    expect(retryRemediation(d, outcomeOf([false, false, false], 1))).not.toBeNull();
    expect(retryRemediation(d, outcomeOf([false, false, false], 2))).toBeNull(); // v3 was the last
  });

  describe("and the history it leaves", () => {
    const play = () => {
      const store = createProgressStore(memory());
      let run = toValidation(openDeclic(d, store, T0));
      // C01 and C02 were passed through `toValidation` without saving: save them via the store.
      run = answerWith(store, run, [false, false, false]);
      return { store, run };
    };
    /** Answers the three steps through the session helpers, so each is saved. */
    function answerWith(
      store: ReturnType<typeof createProgressStore>,
      run: Run,
      right: boolean[],
    ): Run {
      let r = run;
      currentSteps(d, r)!.steps.forEach((s, i) => {
        const option = s.options.find((o) => !!o.correct === right[i])!;
        r = next(d, choose(d, r, option.id, store, T0), store, T0);
      });
      while (r.phase === "corrections") r = next(d, r, store, T0);
      return r;
    }

    it("keeps the first go apart from the second", () => {
      const { store, run } = play();
      expect(store.get().declics[d.id].attempts).toHaveLength(1);
      expect(store.get().declics[d.id].attempts?.[0]).toMatchObject({
        variantId: "v1",
        kind: "evidence",
        score: 0,
        status: "needs_reinforcement",
      });
      expect(store.get().declics[d.id].understandingStatus).toBe("needs_reinforcement");

      let r = beginRetry(d, run, store, T0);
      expect(store.get().declics[d.id].assessmentAttempt).toBe(1);
      expect(store.get().declics[d.id].attempts).toHaveLength(1); // not erased by starting over
      r = next(d, choose(d, r, "w", store, T0), store, T0);
      r = next(d, r, store, T0);
      expect(r.cardId).toBe(validation.id);
      r = answerWith(store, r, [true, true, true]);

      const progress = store.get().declics[d.id];
      expect(progress.attempts).toHaveLength(2);
      expect(progress.attempts?.[1]).toMatchObject({ variantId: "v2", kind: "evidence", score: 3 });
      expect(progress.attempts?.[0].score).toBe(0); // the first go is still there
      expect(progress.understandingStatus).toBe("understood"); // understanding follows the latest evidence
      expect(progress.assessment?.score).toBe(3);
    });

    /** From the first card of a retry or of a restart, to the validation, answering any way. */
    function toTheValidationAgain(store: ReturnType<typeof createProgressStore>, run: Run): Run {
      let r = run;
      while (r.cardId !== validation.id) {
        const card = d.cards.find((c) => c.id === r.cardId)!;
        r =
          card.type === "choice"
            ? next(d, choose(d, r, currentChoiceContent(d, r)!.choices[0].id, store, T0), store, T0)
            : next(d, r, store, T0);
      }
      return r;
    }

    it("counts a go on a version already seen as practice, changing no status", () => {
      const { store, run } = play(); // go 1, on v1: 0/3
      let r = beginRetry(d, run, store, T0);
      r = answerWith(store, toTheValidationAgain(store, r), [false, false, false]); // go 2, v2: 0/3
      r = beginRetry(d, r, store, T0);
      r = answerWith(store, toTheValidationAgain(store, r), [true, true, true]); // go 3, v3: 3/3
      expect(store.get().declics[d.id].attempts?.map((a) => a.variantId)).toEqual([
        "v1",
        "v2",
        "v3",
      ]);
      expect(store.get().declics[d.id].understandingStatus).toBe("understood");
      finish(d, next(d, r, store, T0), store, T0);

      // Started over, the fourth go is on v1 again: every version has been seen.
      const again = toTheValidationAgain(store, openDeclic(d, store, T0 + 1));
      expect(again.attemptIndex).toBe(3);
      expect(currentSteps(d, again)?.variantId).toBe("v1");
      const before = store.get().declics[d.id];
      answerWith(store, again, [false, false, false]);

      const progress = store.get().declics[d.id];
      expect(progress.attempts).toHaveLength(4);
      expect(progress.attempts?.[3]).toMatchObject({ variantId: "v1", kind: "practice", score: 0 });
      expect(progress.understandingStatus).toBe("understood"); // a practice miss undoes nothing
      expect(progress.assessment).toEqual(before.assessment);
    });

    it("resumes a retry on the next version, not on the one already played", () => {
      const { store, run } = play();
      beginRetry(d, run, store, T0);
      const back = openDeclic(d, createProgressStore(storageOf(store)), T0 + 5);
      expect(back.attemptIndex).toBe(1);
      // Walk to the validation: it plays the second version, with a blank card.
      let r = back;
      while (r.cardId !== validation.id) {
        const card = d.cards.find((c) => c.id === r.cardId)!;
        r = advance(
          d,
          card.type === "choice" && r.phase === "asking" ? selectChoice(d, r, "r") : r,
        );
      }
      expect(currentSteps(d, r)?.variantId).toBe("v2");
      expect(r.phase).toBe("asking");
      expect(r.answers[validation.id]).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------------------------
describe("the validator on versions, retries and pictures", () => {
  const clone = (): DeclicDef => JSON.parse(JSON.stringify(d));
  const problems = (x: DeclicDef) => validateChapter(chapter, [x], [deck]).join("\n");
  const val = (x: DeclicDef) => x.cards[2] as MultiStepCard;

  it("refuses a variant with the reserved id or a repeated one", () => {
    const a = clone();
    val(a).variants![0].id = "v1";
    expect(problems(a)).toMatch(/identifiant de variante en double ou réservé "v1"/);
    const b = clone();
    val(b).variants![1].id = "v2";
    expect(problems(b)).toMatch(/en double ou réservé "v2"/);
  });

  it("refuses a variant with another number of steps, so scores stay comparable", () => {
    const a = clone();
    val(a).variants![0].steps.pop();
    expect(problems(a)).toMatch(/même nombre d'étapes/);
  });

  it("refuses a version that cannot pass the rule, having no key step", () => {
    const a = clone();
    for (const s of val(a).variants![1].steps) delete s.discriminating;
    expect(problems(a)).toMatch(/aucune n'est marquée \(version "v3"\)/);
  });

  it("refuses a step id used in two versions", () => {
    const a = clone();
    val(a).variants![0].steps[0].id = val(a).steps[0].id;
    expect(problems(a)).toMatch(/étape en double/);
  });

  it("checks the answers of every version, not only the first", () => {
    const a = clone();
    val(a).variants![0].steps[0].options[0].correct = false;
    expect(problems(a)).toMatch(/exactement une réponse attendue \(trouvé 0\)/);
    const b = clone();
    (b.cards[0] as ChoiceCard).variants![0].choices[1].feedback = "Faux";
    expect(problems(b)).toMatch(/réduit à un mot/);
  });

  it("refuses a step that sends the student forward or to a card that does not exist", () => {
    const a = clone();
    val(a).steps[0].remediation = {
      type: "replay",
      fromCardId: `${ID}-C04`,
      toCardId: `${ID}-C04`,
    };
    expect(problems(a)).toMatch(/cartes précédentes/);
    const b = clone();
    val(b).steps[0].remediation = { type: "replay", fromCardId: "nope", toCardId: `${ID}-C01` };
    expect(problems(b)).toMatch(/carte inconnue/);
  });

  it("refuses a variant step whose concept the deck does not follow up", () => {
    const a = clone();
    val(a).variants![0].steps[0].conceptId = "unknown";
    expect(problems(a)).toMatch(/concept "unknown"/);
  });

  it("refuses a picture without an accessible label, anywhere it can sit", () => {
    const a = clone();
    (a.cards[0] as ChoiceCard).variants![0].visual!.ariaLabel = " ";
    expect(problems(a)).toMatch(/libellé pour les lecteurs d'écran/);
    const b = clone();
    val(b).steps[0].visual = { kind: "number-line", ariaLabel: "", min: 0, max: 5 };
    expect(problems(b)).toMatch(/libellé pour les lecteurs d'écran/);
    const c = clone();
    c.cards[1].visual = { kind: "number-line", ariaLabel: "", min: 0, max: 5 };
    expect(problems(c)).toMatch(/libellé pour les lecteurs d'écran/);
  });

  it("refuses a number line that cannot be drawn", () => {
    const line = (extra: object) => {
      const a = clone();
      a.cards[1].visual = { kind: "number-line", ariaLabel: "droite", min: 0, max: 10, ...extra };
      return problems(a);
    };
    expect(line({})).toBe("");
    expect(line({ min: 5, max: 5 })).toMatch(/min doit être inférieur à max/);
    expect(line({ step: 0 })).toMatch(/pas doit être positif/);
    expect(line({ min: -100, max: 100 })).toMatch(/graduations/);
    expect(line({ points: [{ value: 11 }] })).toMatch(/point est hors/);
    expect(line({ marks: [-1] })).toMatch(/marque est hors/);
    expect(line({ bound: 12 })).toMatch(/borne est hors/);
    expect(
      line({ min: -5, max: 5, step: 0.5, points: [{ value: -2.5 }], marks: [0, 2], bound: 3 }),
    ).toBe("");
  });

  it("refuses groups that cannot be drawn", () => {
    const groups = (extra: object) => {
      const a = clone();
      a.cards[1].visual = {
        kind: "groups",
        ariaLabel: "groupes",
        total: 7,
        groupSize: 2,
        ...extra,
      };
      return problems(a);
    };
    expect(groups({})).toBe("");
    expect(groups({ total: 0 })).toMatch(/total entier/);
    expect(groups({ total: 41 })).toMatch(/total entier/);
    expect(groups({ total: 2.5 })).toMatch(/total entier/);
    expect(groups({ groupSize: 0 })).toMatch(/taille d'un groupe/);
    expect(groups({ total: 3, groupSize: 5 })).toBe(""); // no complete group, only a rest: allowed
  });
});
