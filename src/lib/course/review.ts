// The review deck's scheduling and mastery, on top of the SM-2 the main Réviser already runs
// (`sm2` in lib/progress.ts) — not a second algorithm. A review card keeps the SM-2 schedule plus the
// counters spaced repetition and the future points system need: how often it was shown, hit and
// missed, how many recalls in a row came after it was due, and whether a comeback is pending.
import { isEarlyReview, reviewReward, sm2, type RewardKind } from "@/lib/progress";
import type {
  DeclicProgress,
  MasteryDef,
  ReviewAnswer,
  ReviewCardDef,
  ReviewCardState,
  ReviewDeckDef,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function newReviewState(card: ReviewCardDef, deck: ReviewDeckDef): ReviewCardState {
  return {
    cardId: card.id,
    declicId: deck.declicId,
    chapterId: deck.chapterId,
    concept: card.concept,
    timesPresented: 0,
    successCount: 0,
    errorCount: 0,
    consecutiveDeferredSuccesses: 0,
    lastPresentedAt: null,
    lastResult: null,
    revengePending: false,
  };
}

export function isCorrect(card: ReviewCardDef, given: ReviewAnswer): boolean {
  return card.answer === given;
}

/** Whether the card should be shown now: never shown counts as due (it is new), otherwise when its
 *  next review date has come. */
export function isReviewDue(state: ReviewCardState | undefined, now: number): boolean {
  return !state?.review || state.review.nextReviewAt <= now;
}

export function nextReviewAt(state: ReviewCardState | undefined): number | null {
  return state?.review?.nextReviewAt ?? null;
}

export function intervalDays(state: ReviewCardState | undefined): number {
  return state?.review?.interval ?? 0;
}

/** The deck's cards that are due now, in deck order. */
export function dueCards(
  deck: ReviewDeckDef,
  states: Record<string, ReviewCardState>,
  now: number,
): ReviewCardDef[] {
  return deck.cards.filter((c) => isReviewDue(states[c.id], now));
}

/** Records one answer. Returns the new state and what the answer would be worth in points — the
 *  caller decides whether to grant them; nothing here touches the XP economy. */
export function recordReview(
  state: ReviewCardState,
  correct: boolean,
  now: number,
): { state: ReviewCardState; reward: { xp: number; kind: RewardKind } } {
  const reward = reviewReward(state.review, now);
  // "Deferred" = the card existed and had come due. A first showing, or an answer given before the
  // card was due, proves nothing about remembering.
  const deferred = correct && !!state.review && !isEarlyReview(state.review, now);
  const next: ReviewCardState = {
    ...state,
    timesPresented: state.timesPresented + 1,
    successCount: state.successCount + (correct ? 1 : 0),
    errorCount: state.errorCount + (correct ? 0 : 1),
    consecutiveDeferredSuccesses: correct
      ? state.consecutiveDeferredSuccesses + (deferred ? 1 : 0)
      : 0,
    lastPresentedAt: now,
    lastResult: correct ? "correct" : "incorrect",
    review: sm2(state.review, correct ? "sure" : "not-sure", now),
    // A miss leaves a comeback pending; a correct answer once the card is due closes it.
    revengePending: correct ? (deferred ? false : state.revengePending) : true,
  };
  return { state: next, reward };
}

/** How much of the deck is solidly remembered, and whether that is enough for "mastered". */
export function computeMastery(
  rule: MasteryDef,
  deck: ReviewDeckDef,
  states: Record<string, ReviewCardState>,
): { mastered: boolean; readyCards: number; totalCards: number } {
  const totalCards = deck.cards.length;
  const readyCards = deck.cards.filter(
    (c) => (states[c.id]?.consecutiveDeferredSuccesses ?? 0) >= rule.requiredDeferredSuccesses,
  ).length;
  return {
    mastered: totalCards > 0 && readyCards / totalCards >= rule.requiredCardRatio,
    readyCards,
    totalCards,
  };
}

/** Applies the deck's verdict to a Déclic's progress. Mastery implies understanding: a student who
 *  recalls the notion across days understands it, whatever the first validation said. */
export function applyMastery(progress: DeclicProgress, mastered: boolean): DeclicProgress {
  if (mastered === (progress.masteryStatus === "mastered")) return progress;
  return mastered
    ? { ...progress, masteryStatus: "mastered", understandingStatus: "understood" }
    : { ...progress, masteryStatus: "not_mastered" };
}

/** When the soonest card of the deck comes due, for "à revoir dans N jours"; null if none scheduled. */
export function soonestDue(
  deck: ReviewDeckDef,
  states: Record<string, ReviewCardState>,
): number | null {
  const times = deck.cards
    .map((c) => nextReviewAt(states[c.id]))
    .filter((t): t is number => t !== null);
  return times.length > 0 ? Math.min(...times) : null;
}

export function daysUntil(timestamp: number, now: number): number {
  return Math.max(0, Math.ceil((timestamp - now) / DAY_MS));
}
