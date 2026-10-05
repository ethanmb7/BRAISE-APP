// The engine plus its persistence: every student action is applied to the run AND saved, so closing
// the app at any card resumes there. The functions take the progress store as an argument, which is
// how the tests run them against an in-memory storage.
import {
  advance,
  applyRun,
  chooseMenuItem,
  closeSummaryMenu,
  completeDeclic,
  currentCard,
  finishFollowUp,
  initRun,
  openSummaryMenu,
  selectChoice,
  selectedChoice,
  selectStepOption,
  startFollowUp,
  type Run,
} from "./engine";
import { applyMastery, computeMastery, isCorrect, newReviewState, recordReview } from "./review";
import type { ProgressStore } from "./progressStore";
import type {
  CourseProgress,
  DeclicDef,
  ReviewAnswer,
  ReviewCardDef,
  ReviewDeckDef,
} from "./types";
import type { RewardKind } from "@/lib/progress";

function withDeclic(p: CourseProgress, def: DeclicDef, run: Run, now: number): CourseProgress {
  return { ...p, declics: { ...p.declics, [def.id]: applyRun(def, run, p.declics[def.id], now) } };
}

function withMisconception(p: CourseProgress, id: string, now: number): CourseProgress {
  const seen = p.misconceptions[id];
  return {
    ...p,
    misconceptions: { ...p.misconceptions, [id]: { count: (seen?.count ?? 0) + 1, lastAt: now } },
  };
}

function commit(def: DeclicDef, run: Run, store: ProgressStore, now: number): Run {
  store.update((p) => withDeclic(p, def, run, now));
  return run;
}

/** Opens a Déclic: resumes it where the student stopped, or starts it, and records that it has begun. */
export function openDeclic(def: DeclicDef, store: ProgressStore, now = Date.now()): Run {
  const run = initRun(def, store.get().declics[def.id]);
  return commit(def, run, store, now);
}

/** Taps a choice (or a step's option) and saves it. A wrong mental model the choice points at is
 *  counted, once, so reviews can adapt later; replays never count. */
export function choose(
  def: DeclicDef,
  run: Run,
  optionId: string,
  store: ProgressStore,
  now = Date.now(),
): Run {
  const card = currentCard(def, run);
  const next =
    card.type === "multi-step-choice"
      ? selectStepOption(def, run, optionId)
      : selectChoice(def, run, optionId);
  if (next === run) return run;
  const misconceptionId = selectedChoice(def, next)?.misconceptionId;
  if (misconceptionId && !run.replay)
    store.update((p) => withMisconception(p, misconceptionId, now));
  return commit(def, next, store, now);
}

export function next(def: DeclicDef, run: Run, store: ProgressStore, now = Date.now()): Run {
  return commit(def, advance(def, run), store, now);
}

export function openMenu(def: DeclicDef, run: Run, store: ProgressStore, now = Date.now()): Run {
  return commit(def, openSummaryMenu(def, run), store, now);
}

export function closeMenu(def: DeclicDef, run: Run, store: ProgressStore, now = Date.now()): Run {
  return commit(def, closeSummaryMenu(def, run), store, now);
}

export function pickMenuItem(
  def: DeclicDef,
  run: Run,
  itemId: string,
  store: ProgressStore,
  now = Date.now(),
): Run {
  return commit(def, chooseMenuItem(def, run, itemId), store, now);
}

export function beginFollowUp(
  def: DeclicDef,
  run: Run,
  store: ProgressStore,
  now = Date.now(),
): Run {
  return commit(def, startFollowUp(def, run), store, now);
}

export function endFollowUp(def: DeclicDef, run: Run, store: ProgressStore, now = Date.now()): Run {
  return commit(def, finishFollowUp(def, run), store, now);
}

export function finish(def: DeclicDef, run: Run, store: ProgressStore, now = Date.now()): Run {
  return commit(def, completeDeclic(def, run), store, now);
}

/** One answer on a review card: saved with its schedule, and the Déclic's mastery re-evaluated from
 *  the whole deck. Returns what the answer was worth in points; granting them is the caller's call. */
export function answerReviewCard(
  def: DeclicDef,
  deck: ReviewDeckDef,
  card: ReviewCardDef,
  given: ReviewAnswer,
  store: ProgressStore,
  now = Date.now(),
): { correct: boolean; reward: { xp: number; kind: RewardKind } } {
  const correct = isCorrect(card, given);
  let reward = { xp: 0, kind: "new" as RewardKind };
  store.update((p) => {
    const previous = p.reviewCards[card.id] ?? newReviewState(card, deck);
    const recorded = recordReview(previous, correct, now);
    reward = recorded.reward;
    const reviewCards = { ...p.reviewCards, [card.id]: recorded.state };
    let progress: CourseProgress = { ...p, reviewCards };
    if (!correct && card.misconceptionId)
      progress = withMisconception(progress, card.misconceptionId, now);
    const declic = progress.declics[def.id];
    if (declic) {
      const { mastered } = computeMastery(def.mastery, deck, reviewCards);
      progress = {
        ...progress,
        declics: { ...progress.declics, [def.id]: applyMastery(declic, mastered) },
      };
    }
    return progress;
  });
  return { correct, reward };
}
