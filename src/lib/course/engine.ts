// The Déclic engine: a pure state machine over a DeclicDef. It knows what a card IS (choice, reveal,
// multi-step, summary) and how a student moves through them — never what any particular card says.
// There is no id, label or number of any real course in this file; a test enforces it.
//
// Everything here is immutable and side-effect free. Persistence lives in session.ts, rendering in
// components/course/. A run can be rebuilt from saved progress, which is how closing and reopening
// the app lands on the same card.
import type {
  AssessmentResult,
  CardAnswer,
  CardDef,
  Choice,
  DeclicDef,
  DeclicProgress,
  MultiStepCard,
  ReviewCardDef,
  ReviewDeckDef,
  Step,
  SummaryCard,
  SummaryMenuItem,
} from "./types";

/** "asking": waiting for the student. "feedback": the answer is in, its feedback is showing and
 *  the student reads it at their own pace. "outcome": the validation's result. "followup": quick
 *  review situations offered after a reinforcement outcome. "menu": the summary's list of points. */
export type Phase = "asking" | "feedback" | "outcome" | "followup" | "menu";

export type Run = {
  declicId: string;
  cardId: string;
  phase: Phase;
  /** Choice card: the choice tapped. */
  selectedChoiceId: string | null;
  /** Multi-step card: which step is showing, and what was answered so far on this card. */
  stepIndex: number;
  stepAnswers: Record<string, string>;
  /** First-attempt answers by card id. This is what progress is built from. */
  answers: Record<string, CardAnswer>;
  /** While replaying earlier cards from the summary: where the replay stops and where it returns.
   *  Replays are for understanding, not for scoring, so they never write to `answers`. */
  replay: { toCardId: string; returnCardId: string } | null;
  /** The student confirmed the summary: the Déclic is finished. */
  finished: boolean;
};

// ---------------------------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------------------------

export function cardIndex(def: DeclicDef, cardId: string): number {
  return def.cards.findIndex((c) => c.id === cardId);
}

export function currentCard(def: DeclicDef, run: Run): CardDef {
  return def.cards[Math.max(0, cardIndex(def, run.cardId))];
}

export function currentStep(def: DeclicDef, run: Run): Step | undefined {
  const card = currentCard(def, run);
  return card.type === "multi-step-choice" ? card.steps[run.stepIndex] : undefined;
}

/** The choice the student tapped on the current card or step, if any. */
export function selectedChoice(def: DeclicDef, run: Run): Choice | undefined {
  const card = currentCard(def, run);
  if (card.type === "choice") return card.choices.find((c) => c.id === run.selectedChoiceId);
  if (card.type === "multi-step-choice") {
    const step = card.steps[run.stepIndex];
    const optionId = step ? run.stepAnswers[step.id] : undefined;
    return step?.options.find((o) => o.id === optionId);
  }
  return undefined;
}

/** How far through the Déclic the student is, 0..1, for the progress bar. */
export function progressRatio(def: DeclicDef, run: Run): number {
  const i = cardIndex(def, run.cardId);
  const settled = run.phase === "asking" ? 0 : 0.5;
  return Math.min(1, (i + settled + 0.5) / def.cards.length);
}

// ---------------------------------------------------------------------------------------------
// Starting and resuming
// ---------------------------------------------------------------------------------------------

function freshRun(def: DeclicDef): Run {
  return {
    declicId: def.id,
    cardId: def.cards[0].id,
    phase: "asking",
    selectedChoiceId: null,
    stepIndex: 0,
    stepAnswers: {},
    answers: {},
    replay: null,
    finished: false,
  };
}

/** Keeps only the saved answers that still mean something in the current content. A correction or
 *  a new version can remove or renumber a choice; an answer pointing at a choice that no longer
 *  exists must read as "not answered", or the card would wait for a tap it will never accept. */
function sanitizeAnswers(
  def: DeclicDef,
  saved: Record<string, CardAnswer>,
): Record<string, CardAnswer> {
  const kept: Record<string, CardAnswer> = {};
  for (const [cardId, answer] of Object.entries(saved)) {
    const card = def.cards.find((c) => c.id === cardId);
    if (!card) continue;
    if (card.type === "choice" && answer.kind === "choice") {
      if (card.choices.some((c) => c.id === answer.choiceId)) kept[cardId] = answer;
    } else if (card.type === "multi-step-choice" && answer.kind === "steps") {
      const stepAnswers = Object.fromEntries(
        Object.entries(answer.stepAnswers).filter(([stepId, optionId]) =>
          card.steps.find((s) => s.id === stepId)?.options.some((o) => o.id === optionId),
        ),
      );
      if (Object.keys(stepAnswers).length > 0) kept[cardId] = { kind: "steps", stepAnswers };
    } else if (card.type === "declic-summary" && answer.kind === "summary") {
      kept[cardId] = answer;
    }
  }
  return kept;
}

/** A run for this Déclic: resumed where saved progress says the student stopped, or from the first
 *  card (a finished Déclic starts over, keeping its statuses until a new validation replaces them).
 *  Saved progress that no longer matches the content is ignored rather than trusted. */
export function initRun(def: DeclicDef, saved?: DeclicProgress | null): Run {
  const run = freshRun(def);
  if (!saved || saved.completionStatus === "completed" || !saved.currentCardId) return run;
  const card = def.cards.find((c) => c.id === saved.currentCardId);
  if (!card) return run;

  const answers = sanitizeAnswers(def, saved.answers);
  const resumed: Run = { ...run, cardId: card.id, answers };
  const answer = answers[card.id];

  if (card.type === "choice" && answer?.kind === "choice") {
    return { ...resumed, phase: "feedback", selectedChoiceId: answer.choiceId };
  }
  if (card.type === "multi-step-choice" && answer?.kind === "steps") {
    const answered = card.steps.filter((s) => answer.stepAnswers[s.id] !== undefined);
    if (answered.length >= card.steps.length) {
      return {
        ...resumed,
        phase: "outcome",
        stepIndex: card.steps.length - 1,
        stepAnswers: answer.stepAnswers,
      };
    }
    // Show the feedback of the last answered step; "continue" then moves on.
    return {
      ...resumed,
      phase: answered.length > 0 ? "feedback" : "asking",
      stepIndex: Math.max(0, answered.length - 1),
      stepAnswers: answer.stepAnswers,
    };
  }
  return resumed;
}

// ---------------------------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------------------------

function goTo(def: DeclicDef, run: Run, cardId: string): Run {
  const card = def.cards.find((c) => c.id === cardId);
  if (!card) return run;
  return { ...run, cardId, phase: "asking", selectedChoiceId: null, stepIndex: 0, stepAnswers: {} };
}

function nextCardId(def: DeclicDef, run: Run): string | null {
  const i = cardIndex(def, run.cardId);
  return i >= 0 && i + 1 < def.cards.length ? def.cards[i + 1].id : null;
}

/** Leaving the current card: either on to the next one, or back to the summary when a replay ends. */
function leaveCard(def: DeclicDef, run: Run): Run {
  if (run.replay && run.cardId === run.replay.toCardId) {
    return goTo(def, { ...run, replay: null }, run.replay.returnCardId);
  }
  const next = nextCardId(def, run);
  return next ? goTo(def, run, next) : run;
}

/** Tap a choice on a choice card. The feedback for exactly that choice is then showing. */
export function selectChoice(def: DeclicDef, run: Run, choiceId: string): Run {
  const card = currentCard(def, run);
  if (card.type !== "choice" || run.phase !== "asking") return run;
  if (!card.choices.some((c) => c.id === choiceId)) return run;
  const answers = run.replay
    ? run.answers
    : { ...run.answers, [card.id]: { kind: "choice" as const, choiceId } };
  return { ...run, phase: "feedback", selectedChoiceId: choiceId, answers };
}

/** Tap an option on the current step of a multi-step card. */
export function selectStepOption(def: DeclicDef, run: Run, optionId: string): Run {
  const card = currentCard(def, run);
  if (card.type !== "multi-step-choice" || run.phase !== "asking") return run;
  const step = card.steps[run.stepIndex];
  if (!step || !step.options.some((o) => o.id === optionId)) return run;
  const stepAnswers = { ...run.stepAnswers, [step.id]: optionId };
  const answers = run.replay
    ? run.answers
    : { ...run.answers, [card.id]: { kind: "steps" as const, stepAnswers } };
  return { ...run, phase: "feedback", stepAnswers, answers };
}

/** The "continue" button: after a feedback or a reveal, on to whatever comes next. */
export function advance(def: DeclicDef, run: Run): Run {
  const card = currentCard(def, run);
  switch (card.type) {
    case "reveal":
      return run.phase === "asking" ? leaveCard(def, run) : run;
    case "choice":
      return run.phase === "feedback" ? leaveCard(def, run) : run;
    case "multi-step-choice":
      if (run.phase === "feedback") {
        return run.stepIndex + 1 < card.steps.length
          ? { ...run, phase: "asking", stepIndex: run.stepIndex + 1 }
          : { ...run, phase: "outcome" };
      }
      return run.phase === "outcome" ? leaveCard(def, run) : run;
    case "declic-summary":
      return run;
  }
}

/** From a reinforcement outcome: open the quick situations. */
export function startFollowUp(def: DeclicDef, run: Run): Run {
  const card = currentCard(def, run);
  return card.type === "multi-step-choice" && run.phase === "outcome"
    ? { ...run, phase: "followup" }
    : run;
}

/** The quick situations are done (or skipped): on to the next card. */
export function finishFollowUp(def: DeclicDef, run: Run): Run {
  return run.phase === "followup" ? leaveCard(def, { ...run, phase: "outcome" }) : run;
}

function summaryCard(def: DeclicDef, run: Run): SummaryCard | undefined {
  const card = currentCard(def, run);
  return card.type === "declic-summary" ? card : undefined;
}

/** "J'ai capté": the Déclic is finished. */
export function completeDeclic(def: DeclicDef, run: Run): Run {
  const card = summaryCard(def, run);
  if (!card || run.phase === "menu") return run;
  const answers = { ...run.answers, [card.id]: { kind: "summary" as const, actionId: "complete" } };
  return { ...run, finished: true, answers };
}

/** "Revoir le point qui me piège": show the list of points. */
export function openSummaryMenu(def: DeclicDef, run: Run): Run {
  return summaryCard(def, run) && run.phase === "asking" ? { ...run, phase: "menu" } : run;
}

export function closeSummaryMenu(def: DeclicDef, run: Run): Run {
  return summaryCard(def, run) && run.phase === "menu" ? { ...run, phase: "asking" } : run;
}

/** Pick a point from the menu: replay the cards that explain it, then land back on the summary. A
 *  point with no remediation authored yet just closes the menu. */
export function chooseMenuItem(def: DeclicDef, run: Run, itemId: string): Run {
  const card = summaryCard(def, run);
  if (!card || run.phase !== "menu") return run;
  const item: SummaryMenuItem | undefined = card.menu.find((m) => m.id === itemId);
  const remediation = item?.remediation;
  if (!remediation) return { ...run, phase: "asking" };
  const target = goTo(def, run, remediation.fromCardId);
  return target === run
    ? { ...run, phase: "asking" }
    : { ...target, replay: { toCardId: remediation.toCardId, returnCardId: card.id } };
}

// ---------------------------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------------------------

function assessedCard(def: DeclicDef): MultiStepCard | undefined {
  const card = def.cards.find((c) => c.id === def.assessment.cardId);
  return card?.type === "multi-step-choice" ? card : undefined;
}

/** The result of the validation, once every step of it has been answered; null before. */
export function computeAssessment(
  def: DeclicDef,
  answers: Record<string, CardAnswer>,
  now: number,
): AssessmentResult | null {
  const card = assessedCard(def);
  const answer = answers[def.assessment.cardId];
  if (!card || answer?.kind !== "steps") return null;
  if (card.steps.some((s) => answer.stepAnswers[s.id] === undefined)) return null;

  const stepResults: Record<string, boolean> = {};
  let score = 0;
  let discriminatingPassed = false;
  for (const step of card.steps) {
    const option = step.options.find((o) => o.id === answer.stepAnswers[step.id]);
    const points = option ? (option.score ?? (option.correct ? 1 : 0)) : 0;
    const right = !!option?.correct;
    stepResults[step.id] = right;
    score += points;
    if (right && step.discriminating) discriminatingPassed = true;
  }

  const a = def.assessment;
  const understood =
    score >= a.understoodMinScore && (!a.requireDiscriminatingStep || discriminatingPassed);
  return {
    score,
    max: card.steps.length,
    stepResults,
    discriminatingPassed,
    status: understood ? "understood" : "needs_reinforcement",
    at: now,
  };
}

/** The review cards to offer after a reinforcement outcome: the ones testing the concepts of the
 *  steps that were missed, in the order the steps come, then the easiest remaining ones. */
export function followUpCards(
  def: DeclicDef,
  deck: ReviewDeckDef,
  result: AssessmentResult,
): ReviewCardDef[] {
  const card = assessedCard(def);
  if (!card) return [];
  const picked: ReviewCardDef[] = [];
  const add = (c: ReviewCardDef | undefined) => {
    if (c && !picked.some((p) => p.id === c.id) && picked.length < def.assessment.followUpCount) {
      picked.push(c);
    }
  };
  for (const step of card.steps) {
    if (result.stepResults[step.id] || !step.conceptId) continue;
    add(deck.cards.find((c) => c.concept === step.conceptId));
  }
  const easiest = [...deck.cards].sort((a, b) => a.difficulty - b.difficulty || a.order - b.order);
  for (const c of easiest) add(c);
  return picked;
}

// ---------------------------------------------------------------------------------------------
// From a run to saved progress
// ---------------------------------------------------------------------------------------------

export function emptyDeclicProgress(def: DeclicDef, now: number): DeclicProgress {
  return {
    declicId: def.id,
    contentVersion: def.version,
    completionStatus: "not_started",
    understandingStatus: "unknown",
    masteryStatus: "not_mastered",
    currentCardId: null,
    answers: {},
    startedAt: now,
    updatedAt: now,
  };
}

/** Folds a run into the saved progress of its Déclic. Understanding follows the latest
 *  validation, completion is one-way, and mastery is never touched here: only deferred recalls in
 *  the review deck can grant it (see review.ts). */
export function applyRun(
  def: DeclicDef,
  run: Run,
  prev: DeclicProgress | undefined,
  now: number,
): DeclicProgress {
  const base = prev ?? emptyDeclicProgress(def, now);
  const assessment = computeAssessment(def, run.answers, now);
  const sameResult =
    assessment &&
    base.assessment &&
    base.assessment.score === assessment.score &&
    JSON.stringify(base.assessment.stepResults) === JSON.stringify(assessment.stepResults);
  const keptAssessment = sameResult ? base.assessment : (assessment ?? base.assessment);

  let understandingStatus = base.understandingStatus;
  if (assessment && base.masteryStatus !== "mastered") understandingStatus = assessment.status;

  const completed = run.finished || base.completionStatus === "completed";
  return {
    ...base,
    contentVersion: def.version,
    completionStatus: completed ? "completed" : "in_progress",
    understandingStatus,
    currentCardId: run.finished ? null : run.cardId,
    answers: run.answers,
    ...(keptAssessment ? { assessment: keptAssessment } : {}),
    ...(run.finished && base.completionStatus !== "completed" ? { completedAt: now } : {}),
    updatedAt: now,
  };
}

/** One word for where a Déclic stands, from its three independent statuses. */
export type DisplayStatus =
  "not_started" | "in_progress" | "discovered" | "understood" | "needs_reinforcement" | "mastered";

export function displayStatus(progress: DeclicProgress | undefined): DisplayStatus {
  if (!progress || progress.completionStatus === "not_started") return "not_started";
  if (progress.masteryStatus === "mastered") return "mastered";
  if (progress.completionStatus === "in_progress") return "in_progress";
  if (progress.understandingStatus === "needs_reinforcement") return "needs_reinforcement";
  if (progress.understandingStatus === "understood") return "understood";
  return "discovered";
}

/** One status for a whole chapter, from its Déclics': it is only as far along as its least advanced
 *  Déclic, except that a Déclic needing reinforcement is worth flagging whatever the others say. */
export function aggregateStatus(statuses: DisplayStatus[]): DisplayStatus {
  if (statuses.length === 0) return "not_started";
  if (statuses.every((s) => s === "mastered")) return "mastered";
  if (statuses.some((s) => s === "needs_reinforcement")) return "needs_reinforcement";
  if (statuses.every((s) => s === "understood" || s === "mastered")) return "understood";
  if (statuses.every((s) => s === "discovered" || s === "understood" || s === "mastered")) {
    return "discovered";
  }
  return statuses.some((s) => s !== "not_started") ? "in_progress" : "not_started";
}
