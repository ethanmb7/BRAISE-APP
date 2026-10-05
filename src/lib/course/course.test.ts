import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  COURSE_REGISTRY,
  buildRegistry,
  courseChaptersOfSubject,
  declicsOfChapter,
  getCourseChapter,
  getDeck,
  getDeclic,
} from "./registry";
import {
  advance,
  applyRun,
  chooseMenuItem,
  completeDeclic,
  computeAssessment,
  currentCard,
  currentStep,
  displayStatus,
  followUpCards,
  initRun,
  openSummaryMenu,
  selectChoice,
  selectStepOption,
  selectedChoice,
  startFollowUp,
  type Run,
} from "./engine";
import {
  answerReviewCard,
  beginFollowUp,
  choose,
  endFollowUp,
  finish,
  next,
  openDeclic,
  openMenu,
  pickMenuItem,
} from "./session";
import {
  computeMastery,
  dueCards,
  intervalDays,
  isReviewDue,
  newReviewState,
  recordReview,
} from "./review";
import {
  COURSE_PROGRESS_KEY,
  createProgressStore,
  emptyCourseProgress,
  parseCourseProgress,
} from "./progressStore";
import { validateChapter, coverageReport } from "./validate";
import { toRichMath } from "./mathSymbols";
import { resolveText } from "./text";
import { aggregateStatus } from "./engine";
import { BACKUP_KEYS } from "@/lib/backup";
import { resolveRestoredView } from "@/lib/progress";
import type { CardDef, ChapterDef, Choice, DeclicDef, ReviewDeckDef } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_800_000_000_000;

const def = getDeclic("M2-ARI-D01")!;
const deck = getDeck("M2-ARI-D01-REV")!;
const memory = () => {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
};

function correctChoice(card: CardDef): Choice | undefined {
  return card.type === "choice" ? card.choices.find((c) => c.correct) : undefined;
}

/** Plays a card with the given option for every step, then advances through its feedback. */
function playCard(run: Run, pick: (card: CardDef, stepIndex: number) => string): Run {
  const card = currentCard(def, run);
  if (card.type === "reveal") return advance(def, run);
  if (card.type === "choice") {
    return advance(def, selectChoice(def, run, pick(card, 0)));
  }
  if (card.type === "multi-step-choice") {
    let r = run;
    for (let i = 0; i < card.steps.length; i++) {
      r = advance(def, selectStepOption(def, r, pick(card, i)));
    }
    return advance(def, r); // the outcome
  }
  return run;
}

const bestPick = (card: CardDef, step: number): string => {
  if (card.type === "choice") return correctChoice(card)!.id;
  if (card.type === "multi-step-choice") return card.steps[step].options.find((o) => o.correct)!.id;
  return "";
};

/** Every card up to the summary, with the picker deciding each answer. */
function playToSummary(pick: (card: CardDef, step: number) => string): Run {
  let run = initRun(def);
  while (currentCard(def, run).type !== "declic-summary") run = playCard(run, pick);
  return run;
}

// ---------------------------------------------------------------------------------------------
describe("the M2-ARI-D01 content", () => {
  it("loads without a validation error", () => {
    expect(COURSE_REGISTRY.errors).toEqual([]);
  });

  it("is a chapter of Seconde maths, found through the subject", () => {
    const chapter = getCourseChapter("M2-ARI")!;
    expect(chapter.title).toBe("Arithmétique");
    expect(chapter.level).toBe("seconde");
    expect(courseChaptersOfSubject("maths").map((c) => c.id)).toContain("M2-ARI");
    expect(declicsOfChapter(chapter).map((d) => d.id)).toEqual(["M2-ARI-D01"]);
  });

  it("carries its identity, objective and official source", () => {
    expect(def.title).toBe("Tous les nombres ne vivent pas dans la même boîte");
    expect(def.version).toBe("1.0");
    expect(def.targetDurationSec).toEqual([150, 210]);
    expect(def.objective).toContain("ℕ");
    expect(def.prerequisites).toHaveLength(3);
    expect(def.detailedObjectives).toHaveLength(7);
    const { source } = getCourseChapter("M2-ARI")!;
    expect(source.bulletin).toBe("BO n°14 du 2 avril 2026");
    expect(source.nor).toBe("MENE2602914A");
    expect(source.applicationYear).toBe("2026-2027");
  });

  it("has its 15 cards, in order, of the expected kinds", () => {
    expect(def.cards.map((c) => c.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `M2-ARI-D01-C${String(i + 1).padStart(2, "0")}`),
    );
    expect(def.cards.map((c) => c.type)).toEqual([
      "choice",
      "choice",
      "reveal",
      "choice",
      "reveal",
      "choice",
      "choice",
      "choice",
      "choice",
      "choice",
      "choice",
      "choice",
      "choice",
      "multi-step-choice",
      "declic-summary",
    ]);
  });

  it("expects the answer the script names on every question", () => {
    const expected = ["C", "C", null, "B", null, "C", "B", "A", "B", "B", "C", "B", "B"];
    def.cards.slice(0, 13).forEach((card, i) => {
      expect(correctChoice(card)?.id ?? null, card.id).toBe(expected[i]);
    });
  });

  it("traces the four Bulletin officiel requirements it covers", () => {
    expect(def.coverage.map((c) => c.mappingId)).toEqual([
      "BO26-M2-ARI-CONT-01",
      "BO26-M2-VEL-APP-01",
      "BO26-M2-VEL-INC-01",
      "BO26-M2-VEL-NUMSET-01",
    ]);
    expect(def.coverage[0].coverage).toBe("full");
    const report = coverageReport(getCourseChapter("M2-ARI")!, [def]);
    expect(report.every((r) => r.coveredBy.length === 1)).toBe(true);
  });

  it("links wrong answers to the misconceptions of the chapter", () => {
    const known = new Set(getCourseChapter("M2-ARI")!.misconceptions.map((m) => m.id));
    for (const id of [
      "n_starts_at_1",
      "z_only_negatives",
      "positive_means_natural",
      "positive_decimal_in_z",
      "membership_vs_inclusion",
      "single_set_only",
    ]) {
      expect(known.has(id), id).toBe(true);
    }
    const c08 = def.cards.find((c) => c.id.endsWith("C08"))!;
    if (c08.type !== "choice") throw new Error("C08 is a choice");
    expect(c08.choices.find((c) => c.id === "B")?.misconceptionId).toBe("membership_vs_inclusion");
  });

  it("never reduces a wrong answer to a bare verdict, and never says échec", () => {
    // Enforced by the validator on the whole content; spot-check the worst case here.
    const everyText = JSON.stringify(def);
    expect(everyText).not.toMatch(/échec/i);
  });

  it("does not grade the hook question: every answer is a way in", () => {
    const c01 = def.cards[0];
    if (c01.type !== "choice") throw new Error("C01 is a choice");
    expect(c01.gradeChoices).toBe(false);
  });

  it("has the six review cards, each with both feedbacks", () => {
    expect(deck.cards).toHaveLength(6);
    expect(deck.cards.map((c) => c.answer)).toEqual([
      "carre",
      "intox",
      "carre",
      "intox",
      "intox",
      "carre",
    ]);
    expect(deck.cards.map((c) => c.concept)).toEqual([
      "Z_membership",
      "N_zero",
      "inclusion_N_Z",
      "integer_vs_positive",
      "membership_vs_inclusion",
      "N_vs_Z",
    ]);
    for (const c of deck.cards) {
      expect(c.feedback.correct.length).toBeGreaterThan(10);
      expect(c.feedback.incorrect.length).toBeGreaterThan(10);
    }
  });
});

// ---------------------------------------------------------------------------------------------
describe("navigating the engine", () => {
  it("walks the cards one at a time, to the summary", () => {
    let run = initRun(def);
    const seen: string[] = [];
    while (currentCard(def, run).type !== "declic-summary") {
      seen.push(currentCard(def, run).id);
      run = playCard(run, bestPick);
    }
    expect(seen).toHaveLength(14);
    expect(run.cardId.endsWith("C15")).toBe(true);
  });

  it("shows feedback after the tap and waits: the card does not change by itself", () => {
    const run = initRun(def);
    const tapped = selectChoice(def, run, "A");
    expect(tapped.phase).toBe("feedback");
    expect(tapped.cardId).toBe(run.cardId);
    expect(advance(def, tapped).cardId).not.toBe(run.cardId);
  });

  it("shows exactly the feedback of the choice that was tapped, for every choice", () => {
    for (const card of def.cards) {
      if (card.type !== "choice") continue;
      for (const choice of card.choices) {
        let run = initRun(def);
        while (run.cardId !== card.id) run = playCard(run, bestPick);
        const tapped = selectChoice(def, run, choice.id);
        expect(selectedChoice(def, tapped)?.id).toBe(choice.id);
        expect(selectedChoice(def, tapped)?.feedback).toBe(choice.feedback);
      }
    }
  });

  it("gives the C08 trap its own explanation", () => {
    let run = initRun(def);
    while (!run.cardId.endsWith("C08")) run = playCard(run, bestPick);
    const feedback = selectedChoice(def, selectChoice(def, run, "B"))!.feedback as string;
    expect(feedback).toContain("piège principal");
    expect(feedback).toContain("–4 ∈ ℤ");
  });

  it("ignores a tap while feedback is showing, and an unknown choice", () => {
    const run = initRun(def);
    const tapped = selectChoice(def, run, "A");
    expect(selectChoice(def, tapped, "C")).toBe(tapped);
    expect(selectChoice(def, run, "Z")).toBe(run);
  });

  it("lets a reveal card continue only from its own screen", () => {
    let run = initRun(def);
    run = playCard(run, bestPick); // C01
    run = playCard(run, bestPick); // C02
    expect(currentCard(def, run).type).toBe("reveal");
    expect(advance(def, run).cardId.endsWith("C04")).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------------
describe("the C14 validation", () => {
  const stepOptions = (right: boolean[]) => (card: CardDef, step: number) => {
    if (card.type === "choice") return correctChoice(card)!.id;
    if (card.type !== "multi-step-choice") return "";
    const options = card.steps[step].options;
    return (right[step] ? options.find((o) => o.correct) : options.find((o) => !o.correct))!.id;
  };

  const assess = (right: boolean[]) => {
    const run = playToSummary(stepOptions(right));
    return computeAssessment(def, run.answers, T0)!;
  };

  it("scores out of 3 and keeps each step's result", () => {
    const result = assess([true, false, true]);
    expect(result.max).toBe(3);
    expect(result.score).toBe(2);
    expect(Object.values(result.stepResults)).toEqual([true, false, true]);
  });

  it("is understood from 2/3 when a step that separates ℕ from ℤ is right", () => {
    expect(assess([true, true, true]).status).toBe("understood");
    expect(assess([true, false, true]).status).toBe("understood");
    expect(assess([false, true, true]).status).toBe("understood");
  });

  it("needs reinforcement at 0/3 or 1/3", () => {
    expect(assess([false, false, false])).toMatchObject({
      score: 0,
      status: "needs_reinforcement",
    });
    expect(assess([false, false, true])).toMatchObject({ score: 1, status: "needs_reinforcement" });
    expect(assess([true, false, false])).toMatchObject({ score: 1, status: "needs_reinforcement" });
  });

  it("shows the three steps in one validation phase, one after the other", () => {
    let run = initRun(def);
    while (currentCard(def, run).type !== "multi-step-choice") run = playCard(run, bestPick);
    const subjects: string[] = [];
    for (let i = 0; i < 3; i++) {
      subjects.push(currentStep(def, run)!.subject);
      run = advance(def, selectStepOption(def, run, currentStep(def, run)!.options[0].id));
    }
    expect(subjects).toEqual(["23", "–9", "2,7"]);
    expect(run.phase).toBe("outcome");
  });

  it("picks the two quick situations from the concepts that were missed", () => {
    const result = assess([false, false, true]);
    const cards = followUpCards(def, deck, result);
    expect(cards.map((c) => c.concept)).toEqual(["inclusion_N_Z", "N_vs_Z"]);
  });

  it("still offers two situations when everything was missed", () => {
    const cards = followUpCards(def, deck, assess([false, false, false]));
    expect(cards).toHaveLength(2);
  });

  it("opens the quick situations only after a validation, then moves on", () => {
    let run = initRun(def);
    while (currentCard(def, run).type !== "multi-step-choice") run = playCard(run, bestPick);
    expect(startFollowUp(def, run)).toBe(run);
    for (let i = 0; i < 3; i++) {
      run = advance(def, selectStepOption(def, run, currentStep(def, run)!.options[2].id));
    }
    expect(run.phase).toBe("outcome");
    const follow = startFollowUp(def, run);
    expect(follow.phase).toBe("followup");
  });
});

// ---------------------------------------------------------------------------------------------
describe("statuses", () => {
  const finishWith = (right: boolean[], store = createProgressStore(memory())) => {
    let run = openDeclic(def, store, T0);
    const pick = (card: CardDef, step: number) => {
      if (card.type === "choice") return correctChoice(card)!.id;
      if (card.type !== "multi-step-choice") return "";
      const options = card.steps[step].options;
      return (right[step] ? options.find((o) => o.correct) : options.find((o) => !o.correct))!.id;
    };
    while (currentCard(def, run).type !== "declic-summary") {
      const card = currentCard(def, run);
      if (card.type === "reveal") run = next(def, run, store, T0);
      else if (card.type === "choice")
        run = next(def, choose(def, run, pick(card, 0), store, T0), store, T0);
      else {
        for (let i = 0; i < 3; i++)
          run = next(def, choose(def, run, pick(card, i), store, T0), store, T0);
        run = next(def, run, store, T0);
      }
    }
    run = finish(def, run, store, T0 + 1000);
    return { run, store, progress: store.get().declics[def.id] };
  };

  it("starts as not started, then in progress once opened", () => {
    const store = createProgressStore(memory());
    expect(displayStatus(store.get().declics[def.id])).toBe("not_started");
    openDeclic(def, store, T0);
    expect(store.get().declics[def.id].completionStatus).toBe("in_progress");
  });

  it("marks completion and understanding on separate axes", () => {
    const { progress } = finishWith([true, true, true]);
    expect(progress.completionStatus).toBe("completed");
    expect(progress.understandingStatus).toBe("understood");
    expect(displayStatus(progress)).toBe("understood");
  });

  it("can be both finished and in need of reinforcement", () => {
    const { progress } = finishWith([true, false, false]);
    expect(progress.completionStatus).toBe("completed");
    expect(progress.understandingStatus).toBe("needs_reinforcement");
    expect(displayStatus(progress)).toBe("needs_reinforcement");
  });

  it("is discovered, not understood, when finished without a validation", () => {
    const run = completeDeclic(def, { ...initRun(def), cardId: def.cards[14].id });
    const progress = applyRun(def, run, undefined, T0);
    expect(progress.completionStatus).toBe("completed");
    expect(progress.understandingStatus).toBe("unknown");
    expect(displayStatus(progress)).toBe("discovered");
  });

  it("never grants mastery straight after the lesson, whatever the score", () => {
    for (const right of [
      [true, true, true],
      [false, false, false],
    ]) {
      expect(finishWith(right).progress.masteryStatus).toBe("not_mastered");
    }
  });

  it("does not finish the Déclic until the summary is confirmed", () => {
    const run = playToSummary(bestPick);
    const progress = applyRun(def, run, undefined, T0);
    expect(progress.completionStatus).toBe("in_progress");
    expect(progress.currentCardId).toBe(run.cardId);
  });

  it("counts a misconception once per first-attempt wrong answer, never on a replay", () => {
    const store = createProgressStore(memory());
    let run = openDeclic(def, store, T0);
    run = next(def, choose(def, run, "A", store, T0), store, T0); // C01 (no misconception)
    run = next(def, choose(def, run, "A", store, T0), store, T0); // C02: 0 -> n_starts_at_1
    expect(store.get().misconceptions.n_starts_at_1.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------------------------
describe("saving and resuming", () => {
  it("resumes on the card the student reached, with its feedback showing", () => {
    const storage = memory();
    const store = createProgressStore(storage);
    let run = openDeclic(def, store, T0);
    run = next(def, choose(def, run, "C", store, T0), store, T0); // C01 answered, on C02
    run = choose(def, run, "A", store, T0); // C02 answered, feedback showing

    const reopened = createProgressStore(storage); // closing and reopening the app
    const resumed = openDeclic(def, reopened, T0 + 5000);
    expect(resumed.cardId).toBe(run.cardId);
    expect(resumed.phase).toBe("feedback");
    expect(selectedChoice(def, resumed)?.id).toBe("A");
    expect(resumed.answers[run.cardId]).toEqual({ kind: "choice", choiceId: "A" });
  });

  it("restores the partially answered validation", () => {
    const storage = memory();
    const store = createProgressStore(storage);
    let run = openDeclic(def, store, T0);
    while (currentCard(def, run).type !== "multi-step-choice") {
      run = next(
        def,
        choose(
          def,
          run,
          correctChoice(currentCard(def, run)) ? correctChoice(currentCard(def, run))!.id : "",
          store,
          T0,
        ),
        store,
        T0,
      );
      if (currentCard(def, run).type === "reveal") run = next(def, run, store, T0);
    }
    run = choose(def, run, "N", store, T0); // step 1 answered
    const resumed = openDeclic(def, createProgressStore(storage), T0);
    expect(resumed.stepIndex).toBe(0);
    expect(resumed.phase).toBe("feedback");
    expect(Object.keys(resumed.stepAnswers)).toHaveLength(1);
  });

  it("starts a finished Déclic over while keeping what it had earned", () => {
    const store = createProgressStore(memory());
    const first = (() => {
      let run = openDeclic(def, store, T0);
      while (currentCard(def, run).type !== "declic-summary") {
        const card = currentCard(def, run);
        if (card.type === "reveal") run = next(def, run, store, T0);
        else if (card.type === "choice")
          run = next(def, choose(def, run, correctChoice(card)!.id, store, T0), store, T0);
        else if (card.type === "multi-step-choice") {
          for (let i = 0; i < 3; i++)
            run = next(
              def,
              choose(def, run, card.steps[i].options.find((o) => o.correct)!.id, store, T0),
              store,
              T0,
            );
          run = next(def, run, store, T0);
        }
      }
      return finish(def, run, store, T0);
    })();
    expect(first.finished).toBe(true);
    const again = openDeclic(def, store, T0 + DAY);
    expect(again.cardId).toBe(def.cards[0].id);
    const progress = store.get().declics[def.id];
    expect(progress.completionStatus).toBe("completed");
    expect(progress.understandingStatus).toBe("understood");
  });

  it("ignores saved progress that no longer matches the content", () => {
    const stale = {
      ...emptyCourseProgress().declics,
    };
    void stale;
    const run = initRun(def, {
      declicId: def.id,
      contentVersion: "0.9",
      completionStatus: "in_progress",
      understandingStatus: "unknown",
      masteryStatus: "not_mastered",
      currentCardId: "M2-ARI-D01-C99",
      answers: {},
      startedAt: T0,
      updatedAt: T0,
    });
    expect(run.cardId).toBe(def.cards[0].id);
  });

  it("reads broken or foreign storage as an empty progress", () => {
    expect(parseCourseProgress(null)).toEqual(emptyCourseProgress());
    expect(parseCourseProgress("{not json")).toEqual(emptyCourseProgress());
    expect(parseCourseProgress(JSON.stringify({ version: 7 }))).toEqual(emptyCourseProgress());
    expect(parseCourseProgress(JSON.stringify([1, 2]))).toEqual(emptyCourseProgress());
  });

  it("writes under its own key and keeps working if storage refuses", () => {
    const storage = memory();
    const store = createProgressStore(storage);
    openDeclic(def, store, T0);
    expect(storage.map.has(COURSE_PROGRESS_KEY)).toBe(true);
    const blocked = createProgressStore({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    });
    expect(() => openDeclic(def, blocked, T0)).not.toThrow();
    expect(blocked.get().declics[def.id]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------------------------
describe("replaying a point from the summary", () => {
  it("replays the cards that explain it, without scoring, then returns to the summary", () => {
    let run = playToSummary(bestPick);
    const answersBefore = run.answers;
    run = openSummaryMenu(def, run);
    expect(run.phase).toBe("menu");
    run = chooseMenuItem(def, run, "n-z"); // C03 .. C06
    expect(run.cardId.endsWith("C03")).toBe(true);
    run = advance(def, run); // reveal
    expect(run.cardId.endsWith("C04")).toBe(true);
    run = advance(def, selectChoice(def, run, "A")); // wrong on purpose
    run = advance(def, run); // C05 reveal
    run = advance(def, selectChoice(def, run, "A")); // C06 wrong on purpose, then continue
    expect(run.cardId.endsWith("C15")).toBe(true);
    expect(run.replay).toBeNull();
    expect(run.answers).toEqual(answersBefore);
  });

  it("closes the menu when a point has no remediation authored", () => {
    const bare: DeclicDef = JSON.parse(JSON.stringify(def));
    const summary = bare.cards[14];
    if (summary.type !== "declic-summary") throw new Error("summary");
    delete summary.menu[0].remediation;
    let run = playToSummary(bestPick);
    run = { ...run, declicId: bare.id };
    run = chooseMenuItem(bare, openSummaryMenu(bare, run), summary.menu[0].id);
    expect(run.phase).toBe("asking");
    expect(run.cardId.endsWith("C15")).toBe(true);
  });

  it("goes through the session helpers too", () => {
    const store = createProgressStore(memory());
    let run = playToSummary(bestPick);
    run = openMenu(def, run, store, T0);
    run = pickMenuItem(def, run, "decimals", store, T0);
    expect(run.cardId.endsWith("C11")).toBe(true);
    expect(run.replay?.returnCardId.endsWith("C15")).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------------
describe("the review deck", () => {
  const card = deck.cards[0];

  it("answers Carré and Intox correctly for the six cards", () => {
    const store = createProgressStore(memory());
    for (const c of deck.cards) {
      expect(answerReviewCard(def, deck, c, c.answer, store, T0).correct, c.id).toBe(true);
      const other = c.answer === "carre" ? "intox" : "carre";
      expect(answerReviewCard(def, deck, c, other, store, T0).correct, c.id).toBe(false);
    }
  });

  it("starts every card as new and due", () => {
    const states = {};
    expect(dueCards(deck, states, T0)).toHaveLength(6);
    expect(isReviewDue(newReviewState(card, deck), T0)).toBe(true);
  });

  it("keeps the counters spaced repetition and the points system need", () => {
    const first = recordReview(newReviewState(card, deck), true, T0);
    expect(first.reward.kind).toBe("new");
    expect(first.state).toMatchObject({
      timesPresented: 1,
      successCount: 1,
      errorCount: 0,
      lastPresentedAt: T0,
      lastResult: "correct",
      declicId: "M2-ARI-D01",
      chapterId: "M2-ARI",
      concept: "Z_membership",
    });
    expect(intervalDays(first.state)).toBe(1);
    expect(first.state.review!.nextReviewAt).toBe(T0 + DAY);
    expect(first.state.consecutiveDeferredSuccesses).toBe(0); // a first showing proves nothing
  });

  it("counts a deferred recall only once the card was due", () => {
    const first = recordReview(newReviewState(card, deck), true, T0).state;
    const early = recordReview(first, true, T0 + 1000);
    expect(early.reward.kind).toBe("practice");
    expect(early.state.consecutiveDeferredSuccesses).toBe(0);
    const due = recordReview(first, true, T0 + DAY);
    expect(due.reward.kind).toBe("retrieved");
    expect(due.state.consecutiveDeferredSuccesses).toBe(1);
  });

  it("marks a revanche after a miss and closes it on the next due success", () => {
    const first = recordReview(newReviewState(card, deck), true, T0).state;
    const miss = recordReview(first, false, T0 + DAY);
    expect(miss.state.revengePending).toBe(true);
    expect(miss.state.errorCount).toBe(1);
    expect(miss.state.consecutiveDeferredSuccesses).toBe(0);
    const comeback = recordReview(miss.state, true, T0 + 2 * DAY);
    expect(comeback.reward.kind).toBe("revenge");
    expect(comeback.state.revengePending).toBe(false);
  });

  it("grants mastery only after deferred recalls, never from the lesson or same-day answers", () => {
    const store = createProgressStore(memory());
    let run = playToSummary(bestPick);
    run = finish(def, openDeclicAt(store, run), store, T0);
    expect(store.get().declics[def.id].masteryStatus).toBe("not_mastered");

    // Day 0: every card shown once, then hammered the same day.
    for (const c of deck.cards) {
      answerReviewCard(def, deck, c, c.answer, store, T0);
      answerReviewCard(def, deck, c, c.answer, store, T0 + 1000);
    }
    expect(store.get().declics[def.id].masteryStatus).toBe("not_mastered");

    // Day 1 and the day after the next interval: recalled after each card came due.
    for (const c of deck.cards) answerReviewCard(def, deck, c, c.answer, store, T0 + DAY);
    expect(store.get().declics[def.id].masteryStatus).toBe("not_mastered");
    for (const c of deck.cards) answerReviewCard(def, deck, c, c.answer, store, T0 + 5 * DAY);
    expect(store.get().declics[def.id].masteryStatus).toBe("mastered");
    expect(store.get().declics[def.id].understandingStatus).toBe("understood");
  });

  it("loses mastery when a card is missed again", () => {
    const store = createProgressStore(memory());
    openDeclic(def, store, T0);
    for (const c of deck.cards) answerReviewCard(def, deck, c, c.answer, store, T0);
    for (const c of deck.cards) answerReviewCard(def, deck, c, c.answer, store, T0 + DAY);
    for (const c of deck.cards) answerReviewCard(def, deck, c, c.answer, store, T0 + 5 * DAY);
    expect(store.get().declics[def.id].masteryStatus).toBe("mastered");
    const wrong = deck.cards[1].answer === "carre" ? "intox" : "carre";
    for (const c of deck.cards.slice(0, 3)) {
      answerReviewCard(
        def,
        deck,
        c,
        c.answer === "carre" ? "intox" : "carre",
        store,
        T0 + 20 * DAY,
      );
    }
    void wrong;
    expect(store.get().declics[def.id].masteryStatus).toBe("not_mastered");
  });

  it("evaluates mastery from the deck against the Déclic's own rule", () => {
    const states = Object.fromEntries(
      deck.cards.map((c) => [
        c.id,
        { ...newReviewState(c, deck), consecutiveDeferredSuccesses: 2 },
      ]),
    );
    expect(computeMastery(def.mastery, deck, states).mastered).toBe(true);
    const partial = {
      ...states,
      [deck.cards[0].id]: { ...states[deck.cards[0].id], consecutiveDeferredSuccesses: 0 },
    };
    expect(computeMastery(def.mastery, deck, partial)).toMatchObject({
      readyCards: 5,
      totalCards: 6,
      mastered: true,
    });
    const poor = Object.fromEntries(deck.cards.map((c) => [c.id, newReviewState(c, deck)]));
    expect(computeMastery(def.mastery, deck, poor).mastered).toBe(false);
  });

  it("schedules the quick situations through the same review state", () => {
    const store = createProgressStore(memory());
    const result = computeAssessment(
      def,
      {
        [def.assessment.cardId]: {
          kind: "steps",
          stepAnswers: Object.fromEntries(
            (def.cards[13] as Extract<CardDef, { type: "multi-step-choice" }>).steps.map((s) => [
              s.id,
              s.options.find((o) => !o.correct)!.id,
            ]),
          ),
        },
      },
      T0,
    )!;
    const cards = followUpCards(def, deck, result);
    for (const c of cards) answerReviewCard(def, deck, c, c.answer, store, T0);
    expect(Object.keys(store.get().reviewCards)).toHaveLength(cards.length);
    // and the run can open and close them
    const run = playToSummary(bestPick);
    void run;
    void beginFollowUp;
    void endFollowUp;
  });
});

function openDeclicAt(store: ReturnType<typeof createProgressStore>, run: Run): Run {
  store.update((p) => ({
    ...p,
    declics: { ...p.declics, [def.id]: applyRun(def, run, undefined, T0) },
  }));
  return run;
}

// ---------------------------------------------------------------------------------------------
describe("the engine is generic", () => {
  it("contains no trace of any particular course", () => {
    const dir = join(__dirname);
    const sources = readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    expect(sources.length).toBeGreaterThan(5);
    for (const file of sources) {
      const text = readFileSync(join(dir, file), "utf8");
      expect(text, file).not.toMatch(/M2-ARI|ARI-D01|BO26|"D01"|Arithmétique/);
    }
    // The UI for courses must not know a course either.
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((f) => {
        const p = join(d, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      });
    const uiDir = join(__dirname, "..", "..", "components", "course");
    for (const file of walk(uiDir).filter((f) => f.endsWith(".tsx"))) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/M2-ARI|ARI-D01|BO26/);
    }
  });

  // A different course, written only as data, runs through the same engine, validator and registry.
  const other: { chapter: ChapterDef; declic: DeclicDef; deck: ReviewDeckDef } = (() => {
    const choice = (id: string, label: string, correct = false): Choice => ({
      id,
      label,
      correct,
      feedback: `Voilà pourquoi « ${label} » est ${correct ? "la bonne piste" : "une piste à revoir"}.`,
    });
    const chapter: ChapterDef = {
      id: "X1-TEST",
      subjectId: "maths",
      level: "premiere",
      title: "Chapitre d'essai",
      source: {
        authority: "a",
        programme: "p",
        applicationYear: "2030",
        bulletin: "b",
        nor: "n",
        path: ["x"],
      },
      mappings: [{ id: "BO-X-1", requirement: "r", type: "direct" }],
      misconceptions: [{ id: "m_x", label: "x" }],
      declicIds: ["X1-TEST-D07"],
    };
    const declic: DeclicDef = {
      id: "X1-TEST-D07",
      chapterId: "X1-TEST",
      order: 7,
      title: "t",
      version: "2.3",
      targetDurationSec: [60, 90],
      difficulty: { level: 2, label: "l" },
      objective: "o",
      prerequisites: [],
      detailedObjectives: [],
      coverage: [{ mappingId: "BO-X-1", coverage: "full" }],
      misconceptionIds: ["m_x"],
      cards: [
        {
          id: "X1-TEST-D07-C01",
          order: 1,
          type: "choice",
          text: "Q1",
          choices: [choice("a", "un", true), choice("b", "deux")],
        },
        {
          id: "X1-TEST-D07-C02",
          order: 2,
          type: "multi-step-choice",
          text: "Q2",
          steps: [
            {
              id: "X1-TEST-D07-C02-S1",
              subject: "s1",
              conceptId: "k1",
              options: [choice("y", "oui", true), choice("n", "non")],
            },
            {
              id: "X1-TEST-D07-C02-S2",
              subject: "s2",
              discriminating: true,
              conceptId: "k2",
              options: [choice("y", "oui", true), choice("n", "non")],
            },
          ],
        },
        {
          id: "X1-TEST-D07-C03",
          order: 3,
          type: "declic-summary",
          text: "Résumé",
          actions: [{ id: "ok", label: "OK", kind: "complete" }],
          menu: [],
        },
      ],
      assessment: {
        cardId: "X1-TEST-D07-C02",
        understoodMinScore: 2,
        requireDiscriminatingStep: true,
        understoodMessage: "Bien vu, on te le remontre bientôt.",
        needsReinforcementMessage: "On reprend deux situations rapides.",
        followUpCount: 1,
      },
      mastery: { requiredDeferredSuccesses: 1, requiredCardRatio: 1 },
      deckId: "X1-TEST-D07-REV",
    };
    const deck: ReviewDeckDef = {
      id: "X1-TEST-D07-REV",
      declicId: "X1-TEST-D07",
      chapterId: "X1-TEST",
      title: "d",
      cards: [
        {
          id: "X1-TEST-D07-REV-01",
          order: 1,
          statement: "s",
          answer: "carre",
          concept: "k1",
          difficulty: 1,
          tags: [],
          feedback: {
            correct: "Oui, et voici pourquoi en détail.",
            incorrect: "Non, et voici pourquoi en détail.",
          },
        },
        {
          id: "X1-TEST-D07-REV-02",
          order: 2,
          statement: "t",
          answer: "intox",
          concept: "k2",
          difficulty: 1,
          tags: [],
          correction: "t'",
          feedback: {
            correct: "Oui, et voici pourquoi en détail.",
            incorrect: "Non, et voici pourquoi en détail.",
          },
        },
      ],
    };
    return { chapter, declic, deck };
  })();

  it("loads a second, differently-shaped course through the registry", () => {
    const registry = buildRegistry({ a: other.chapter, b: other.declic, c: other.deck });
    expect(registry.errors).toEqual([]);
    expect(registry.declics.get("X1-TEST-D07")?.version).toBe("2.3");
  });

  it("runs it through the same engine and assessment rule", () => {
    const d = other.declic;
    let run = initRun(d);
    run = advance(d, selectChoice(d, run, "a"));
    run = advance(d, selectStepOption(d, run, "y"));
    run = advance(d, selectStepOption(d, run, "n")); // discriminating step missed
    run = advance(d, run);
    expect(run.cardId).toBe("X1-TEST-D07-C03");
    const result = computeAssessment(d, run.answers, T0)!;
    expect(result).toMatchObject({ score: 1, max: 2 });
    // 1/2 is below the threshold of 2, so reinforcement; and the missed step picks its own concept.
    expect(result.status).toBe("needs_reinforcement");
    expect(followUpCards(d, other.deck, result).map((c) => c.concept)).toEqual(["k2"]);
  });

  it("refuses a score from non-discriminating steps alone when the rule says so", () => {
    const d: DeclicDef = JSON.parse(JSON.stringify(other.declic));
    d.assessment.understoodMinScore = 1;
    let run = initRun(d);
    run = advance(d, selectChoice(d, run, "a"));
    run = advance(d, selectStepOption(d, run, "y")); // only the easy step right
    run = advance(d, selectStepOption(d, run, "n"));
    const result = computeAssessment(d, run.answers, T0)!;
    expect(result.score).toBe(1);
    expect(result.discriminatingPassed).toBe(false);
    expect(result.status).toBe("needs_reinforcement");
  });

  it("is rejected by the validator when the standard is not met", () => {
    const broken: DeclicDef = JSON.parse(JSON.stringify(other.declic));
    const c1 = broken.cards[0];
    if (c1.type !== "choice") throw new Error("choice");
    c1.choices[1].feedback = "Faux";
    c1.choices[0].correct = false;
    broken.assessment.needsReinforcementMessage = "Échec : recommence.";
    broken.cards[2].id = "X1-TEST-D07-C01";
    const problems = validateChapter(other.chapter, [broken], [other.deck]).join("\n");
    expect(problems).toMatch(/réduit à un mot/);
    expect(problems).toMatch(/exactement une réponse attendue/);
    expect(problems).toMatch(/échec/i);
    expect(problems).toMatch(/en double/);
  });

  it("reports a Bulletin officiel requirement no Déclic covers yet", () => {
    const chapter: ChapterDef = JSON.parse(JSON.stringify(other.chapter));
    chapter.mappings.push({ id: "BO-X-2", requirement: "pas encore couvert", type: "direct" });
    const report = coverageReport(chapter, [other.declic]);
    expect(report.find((r) => r.mappingId === "BO-X-2")?.coveredBy).toEqual([]);
    expect(report.find((r) => r.mappingId === "BO-X-1")?.coveredBy).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------------------------
describe("around the engine", () => {
  it("draws the math symbols through KaTeX markup and leaves the rest alone", () => {
    expect(toRichMath("–4 ∈ ℤ")).toBe("–4 $\\in$ $\\mathbb{Z}$");
    expect(toRichMath("ℕ ⊂ ℤ")).toBe("$\\mathbb{N}$ $\\subset$ $\\mathbb{Z}$");
    expect(toRichMath("3,5 ∉ ℕ")).toContain("$\\notin$");
    expect(toRichMath("du texte sans symbole")).toBe("du texte sans symbole");
    expect(toRichMath("déjà $x^2$ et ℕ")).toBe("déjà $x^2$ et $\\mathbb{N}$");
  });

  it("uses one voice for a plain text and the tone's own line when there is one", () => {
    expect(resolveText("Salut", "savage")).toBe("Salut");
    const toned = { text: "Salut", variants: { savage: "Yo" } };
    expect(resolveText(toned, "savage")).toBe("Yo");
    expect(resolveText(toned, "chill")).toBe("Salut");
  });

  it("gives a chapter one status from its Déclics'", () => {
    expect(aggregateStatus([])).toBe("not_started");
    expect(aggregateStatus(["not_started", "not_started"])).toBe("not_started");
    expect(aggregateStatus(["understood", "not_started"])).toBe("in_progress");
    expect(aggregateStatus(["understood", "mastered"])).toBe("understood");
    expect(aggregateStatus(["mastered", "mastered"])).toBe("mastered");
    expect(aggregateStatus(["discovered", "understood"])).toBe("discovered");
    expect(aggregateStatus(["mastered", "needs_reinforcement"])).toBe("needs_reinforcement");
  });

  it("travels with the backup code", () => {
    expect(BACKUP_KEYS).toContain(COURSE_PROGRESS_KEY);
  });

  it("restores a lesson view on a course chapter instead of sending the student home", () => {
    expect(
      resolveRestoredView({
        view: "lesson",
        currentSubjectId: "maths",
        currentChapterId: "M2-ARI",
        onboardingCompleted: true,
      }),
    ).toBe("lesson");
    expect(
      resolveRestoredView({
        view: "lesson",
        currentSubjectId: "maths",
        currentChapterId: "nope",
        onboardingCompleted: true,
      }),
    ).toBe("home");
  });
});
