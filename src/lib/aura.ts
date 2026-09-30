import { SUBJECTS, FLASHCARDS } from "@/data";
import { MASTERED_AT_REPETITIONS } from "@/lib/progress";
import type { CardReview } from "@/types";

export type Rank = {
  id: string;
  name: string;
  emoji: string;
  min: number;
  colorFrom: string;
  colorTo: string;
};

// Thresholds are still reachable within a handful of real sessions for Bronze->Argent on
// purpose (see XP_REWARDS in lib/progress.ts for the per-action amounts they're pacing
// against), so the very first rank-up lands fast; the curve stretches out after that so
// Légende stays a genuine long-term target.
export const RANKS: Rank[] = [
  // Same fix as Argent below, applied to the rank every single new user starts on and sees the
  // most: bronze used to be a pale, desaturated tan (#e8b088) that read as washed-out next to the
  // app's own saturated signature orange everywhere else. A real copper — closer to the actual
  // metal — keeps the "bronze, not orange" read through hue rather than through desaturation.
  { id: "bronze", name: "Bronze", emoji: "🥉", min: 0, colorFrom: "#CD7F32", colorTo: "#8a4a26" },
  // Argent used to be a near-neutral grey-blue (#dbe4f0/#7c8fa8) — the only one of the 5 ranks
  // without a real saturated hue, which read as flat next to bronze/or/platine/légende and landed
  // worst on exactly the first rank-up most new users ever see. A vivid "chrome blue" keeps the
  // cool/metallic read of silver through hue and shine rather than through desaturation.
  { id: "argent", name: "Argent", emoji: "🥈", min: 500, colorFrom: "#8ecfff", colorTo: "#3373d6" },
  { id: "or", name: "Or", emoji: "🥇", min: 1500, colorFrom: "#ffe08a", colorTo: "#e8a317" },
  {
    id: "platine",
    name: "Platine",
    emoji: "💎",
    min: 3500,
    colorFrom: "#b9f3ea",
    colorTo: "#7c3aed",
  },
  {
    id: "legende",
    name: "Légende",
    emoji: "👑",
    min: 7000,
    colorFrom: "#ffb199",
    colorTo: "#ff6f59",
  },
];

export function getRankInfo(xp: number): {
  current: Rank;
  next: Rank | null;
  idx: number;
  pct: number;
} {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) idx = i;
  }
  const current = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const pct = next
    ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, idx, pct };
}

export type SubjectMastery = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  masteredCount: number;
  totalCount: number;
  started: boolean;
};

// Used to return a percentage of *reviewed* cards mastered — which quietly rewarded only ever
// reviewing the easy cards you already knew (one card, mastered once, read as "100%"). Absolute
// counts against the subject's real total ("3/6 cartes") can't be inflated that way and give
// the card-stack visual something concrete to fan out, not an abstract fill percentage.
export function computeSubjectMastery(cardReviews: Record<string, CardReview>): SubjectMastery[] {
  return SUBJECTS.map((s) => {
    const subjectCardIds = FLASHCARDS.filter((c) => c.subject === s.id).map((c) => c.id);
    const reviewed = subjectCardIds.filter((id) => cardReviews[id]);
    const mastered = subjectCardIds.filter(
      (id) => cardReviews[id] && cardReviews[id].repetitions >= MASTERED_AT_REPETITIONS,
    );
    const started = reviewed.length > 0;
    return {
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      color: s.color,
      masteredCount: mastered.length,
      totalCount: subjectCardIds.length,
      started,
    };
  });
}

// Total mastered cards across every subject — used by the share card as a fallback stat when
// the streak is 0 (see ShareAuraModal): a "0 JOURS" chip on a card meant to be shared is a bad
// look, this is a real number to show instead, never fabricated.
export function countMasteredCards(cardReviews: Record<string, CardReview>): number {
  return Object.values(cardReviews).filter((r) => r.repetitions >= MASTERED_AT_REPETITIONS).length;
}

export type BraiseInsight =
  | { kind: "struggling"; topic: string; subjectName: string; repetitions: number }
  | {
      kind: "strong-subject";
      subjectName: string;
      subjectEmoji: string;
      masteredCount: number;
      totalCount: number;
    };

// "Attempted at least twice and still not confident" — one pass isn't friction, it's just the
// first time you've seen it. Two-plus real attempts without landing on "sûre" is a genuine
// pattern, not noise.
const STRUGGLE_MIN_REPETITIONS = 2;
// A subject needs a real deck size before "half mastered" means anything — mastering 1/1 card
// isn't a signal worth naming.
const STRONG_SUBJECT_MIN_CARDS = 3;
const STRONG_SUBJECT_MIN_RATIO = 0.5;

// "Ce que Braise a remarqué" (Aura) — one real, specific observation mined from the student's own
// review history (Réviser's actual SM-2 state: repetitions, lastConfidence), never a templated
// line with invented numbers. Struggling takes priority over a strength: noticing real friction
// and offering to help is closer to what a pote would actually open with than a compliment.
// Returns null — rendered as nothing, not a placeholder nudge — when there isn't yet enough real
// signal to say anything true and specific (a brand-new account, too few reviews). No third
// "reviews better in the evening"-style insight exists here on purpose: AppState has no per-review
// timestamp history, only cardReviews' current SM-2 snapshot and a single `nextReviewAt`, so a
// time-of-day claim would have to be invented rather than computed.
export function computeBraiseInsight(
  cardReviews: Record<string, CardReview>,
): BraiseInsight | null {
  let worst: { topic: string; subjectName: string; repetitions: number } | null = null;
  for (const card of FLASHCARDS) {
    const review = cardReviews[card.id];
    if (
      !review ||
      review.lastConfidence === "sure" ||
      review.repetitions < STRUGGLE_MIN_REPETITIONS
    )
      continue;
    if (!worst || review.repetitions > worst.repetitions) {
      const subjectName = SUBJECTS.find((s) => s.id === card.subject)?.name ?? card.subject;
      worst = { topic: card.topic, subjectName, repetitions: review.repetitions };
    }
  }
  if (worst) return { kind: "struggling", ...worst };

  let best: SubjectMastery | null = null;
  let bestRatio = 0;
  for (const s of computeSubjectMastery(cardReviews)) {
    if (s.totalCount < STRONG_SUBJECT_MIN_CARDS) continue;
    const ratio = s.masteredCount / s.totalCount;
    if (ratio >= STRONG_SUBJECT_MIN_RATIO && ratio > bestRatio) {
      best = s;
      bestRatio = ratio;
    }
  }
  if (best) {
    return {
      kind: "strong-subject",
      subjectName: best.name,
      subjectEmoji: best.emoji,
      masteredCount: best.masteredCount,
      totalCount: best.totalCount,
    };
  }

  return null;
}

// Once Légende (the top rank) is reached, RankRail's own "X XP jusqu'à Y" caption runs out of
// anything to say — "Rang maximum atteint" is honest but it's a dead end on the one part of the
// page whose entire job is showing there's always something more to reach. Streak and mastered-
// cards both keep growing long after XP caps out, so a milestone track built on those two axes
// never runs out either: each step is a plain arithmetic sequence, not hand-authored content, so
// it keeps producing a real next target for a user at any level without new tiers being written
// by hand. Purely "you, past where you were" — never a comparison between students (see the
// no-leaderboard rule).
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 150, 200, 300, 365];
const STREAK_MILESTONE_TAIL_STEP = 100;
const MASTERY_MILESTONES = [10, 25, 50, 100, 200, 350, 500];
const MASTERY_MILESTONE_TAIL_STEP = 250;

function nextInSequence(
  value: number,
  steps: number[],
  tailStep: number,
): { prev: number; next: number } {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] > value) return { prev: i === 0 ? 0 : steps[i - 1], next: steps[i] };
  }
  const last = steps[steps.length - 1];
  const over = value - last;
  const next = last + (Math.floor(over / tailStep) + 1) * tailStep;
  return { prev: next - tailStep, next };
}

export type NextMilestone = {
  kind: "streak" | "mastery";
  target: number;
  remaining: number;
  pct: number;
};

// Picks whichever axis (série ou cartes maîtrisées) is proportionally closer to its own next
// step — comparable as "% of the way there" even though their units differ (days vs. cards), so
// the one that's honestly nearest is the one worth naming. A tie in that percentage (most often
// both axes sitting at their very first rung, 0%) falls back to whichever axis has already
// cleared more ground overall (`prev`, its last passed milestone) — a fresh streak of 0 and 500
// already-mastered cards both read as "0% of the way to the next step", but they are not
// remotely the same situation, and the higher-prev axis is the one that's actually been earned.
export function computeNextMilestone(streak: number, masteredCards: number): NextMilestone {
  const s = nextInSequence(streak, STREAK_MILESTONES, STREAK_MILESTONE_TAIL_STEP);
  const m = nextInSequence(masteredCards, MASTERY_MILESTONES, MASTERY_MILESTONE_TAIL_STEP);
  const sPct = s.next > s.prev ? ((streak - s.prev) / (s.next - s.prev)) * 100 : 0;
  const mPct = m.next > m.prev ? ((masteredCards - m.prev) / (m.next - m.prev)) * 100 : 0;
  const streakWins = sPct !== mPct ? sPct > mPct : s.prev >= m.prev;
  return streakWins
    ? { kind: "streak", target: s.next, remaining: s.next - streak, pct: sPct }
    : { kind: "mastery", target: m.next, remaining: m.next - masteredCards, pct: mPct };
}
