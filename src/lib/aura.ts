import { SUBJECTS, FLASHCARDS, BADGES } from '@/data';
import type { CardReview } from '@/types';

export type Rank = {
  id: string;
  name: string;
  emoji: string;
  min: number;
  colorFrom: string;
  colorTo: string;
};

// Thresholds match the base flashcard XP economy (+15/carte "sûre") — Bronze->Argent is
// reachable within a handful of real sessions on purpose, so the very first rank-up lands
// fast; the curve stretches out after that so Légende stays a genuine long-term target.
export const RANKS: Rank[] = [
  { id: 'bronze', name: 'Bronze', emoji: '🥉', min: 0, colorFrom: '#e8b088', colorTo: '#8a4a26' },
  // Argent used to be a near-neutral grey-blue (#dbe4f0/#7c8fa8) — the only one of the 5 ranks
  // without a real saturated hue, which read as flat next to bronze/or/platine/légende and landed
  // worst on exactly the first rank-up most new users ever see. A vivid "chrome blue" keeps the
  // cool/metallic read of silver through hue and shine rather than through desaturation.
  { id: 'argent', name: 'Argent', emoji: '🥈', min: 500, colorFrom: '#8ecfff', colorTo: '#3373d6' },
  { id: 'or', name: 'Or', emoji: '🥇', min: 1500, colorFrom: '#ffe08a', colorTo: '#e8a317' },
  { id: 'platine', name: 'Platine', emoji: '💎', min: 3500, colorFrom: '#b9f3ea', colorTo: '#7c3aed' },
  { id: 'legende', name: 'Légende', emoji: '👑', min: 7000, colorFrom: '#ffb199', colorTo: '#ff6f59' },
];

export function getRankInfo(xp: number): { current: Rank; next: Rank | null; idx: number; pct: number } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) idx = i;
  }
  const current = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const pct = next ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100)) : 100;
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

// A card only counts as "acquise" once it's cleared the SM-2 learning phase (recalled
// correctly at least twice in a row), not merely seen once — repetitions=1 just means "shown",
// not "known". Subjects with zero reviewed cards are flagged `started: false` rather than
// given a 0% score: "0%" reads as "tried and failed", "pas commencé" reads as what's actually
// true — the player hasn't touched that subject in Réviser yet.
const MASTERED_AT_REPETITIONS = 2;

// Used to return a percentage of *reviewed* cards mastered — which quietly rewarded only ever
// reviewing the easy cards you already knew (one card, mastered once, read as "100%"). Absolute
// counts against the subject's real total ("3/6 cartes") can't be inflated that way and give
// the card-stack visual something concrete to fan out, not an abstract fill percentage.
export function computeSubjectMastery(cardReviews: Record<string, CardReview>): SubjectMastery[] {
  return SUBJECTS.map((s) => {
    const subjectCardIds = FLASHCARDS.filter((c) => c.subject === s.id).map((c) => c.id);
    const reviewed = subjectCardIds.filter((id) => cardReviews[id]);
    const mastered = subjectCardIds.filter((id) => cardReviews[id] && cardReviews[id].repetitions >= MASTERED_AT_REPETITIONS);
    const started = reviewed.length > 0;
    return { id: s.id, name: s.name, emoji: s.emoji, color: s.color, masteredCount: mastered.length, totalCount: subjectCardIds.length, started };
  });
}

// Total mastered cards across every subject — used by the share card as a fallback stat when
// the streak is 0 (see ShareAuraModal): a "0 JOURS" chip on a card meant to be shared is a bad
// look, this is a real number to show instead, never fabricated.
export function countMasteredCards(cardReviews: Record<string, CardReview>): number {
  return Object.values(cardReviews).filter((r) => r.repetitions >= MASTERED_AT_REPETITIONS).length;
}

export type BraiseInsight =
  | { kind: 'struggling'; topic: string; subjectName: string; repetitions: number }
  | { kind: 'strong-subject'; subjectName: string; subjectEmoji: string; masteredCount: number; totalCount: number };

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
export function computeBraiseInsight(cardReviews: Record<string, CardReview>): BraiseInsight | null {
  let worst: { topic: string; subjectName: string; repetitions: number } | null = null;
  for (const card of FLASHCARDS) {
    const review = cardReviews[card.id];
    if (!review || review.lastConfidence === 'sure' || review.repetitions < STRUGGLE_MIN_REPETITIONS) continue;
    if (!worst || review.repetitions > worst.repetitions) {
      const subjectName = SUBJECTS.find((s) => s.id === card.subject)?.name ?? card.subject;
      worst = { topic: card.topic, subjectName, repetitions: review.repetitions };
    }
  }
  if (worst) return { kind: 'struggling', ...worst };

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
    return { kind: 'strong-subject', subjectName: best.name, subjectEmoji: best.emoji, masteredCount: best.masteredCount, totalCount: best.totalCount };
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

function nextInSequence(value: number, steps: number[], tailStep: number): { prev: number; next: number } {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] > value) return { prev: i === 0 ? 0 : steps[i - 1], next: steps[i] };
  }
  const last = steps[steps.length - 1];
  const over = value - last;
  const next = last + (Math.floor(over / tailStep) + 1) * tailStep;
  return { prev: next - tailStep, next };
}

export type NextMilestone = {
  kind: 'streak' | 'mastery';
  target: number;
  remaining: number;
  pct: number;
};

// Picks whichever axis (série ou cartes maîtrisées) is proportionally closer to its own next
// step — the same fairness rule nextBadgeHint already uses to compare streak-days against XP:
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
    ? { kind: 'streak', target: s.next, remaining: s.next - streak, pct: sPct }
    : { kind: 'mastery', target: m.next, remaining: m.next - masteredCards, pct: mPct };
}

export type BadgeHint = { badgeId: string; label: string };

// The 4 numeric badges' real thresholds, in the order nextBadgeHint has always checked them —
// shared by nextBadgeHint (which badge to feature) and badgeRemainingLabel (what to print on any
// one locked badge's own tile), so the two can never quote different numbers for the same badge.
const BADGE_THRESHOLDS: Record<string, { kind: 'streak' | 'xp'; value: number }> = {
  b1: { kind: 'streak', value: 3 },
  b5: { kind: 'streak', value: 7 },
  b2: { kind: 'xp', value: 100 },
  b6: { kind: 'xp', value: 1000 },
};
const NUMERIC_BADGE_IDS = ['b1', 'b5', 'b2', 'b6'];

// "Encore 4 jours" / "Encore 850 XP" for one specific numeric badge — null for b3/b4, which have
// no partial progress to report honestly. Used on each locked badge tile in Profil, not just the
// single closest one nextBadgeHint picks for the Aura bridge.
export function badgeRemainingLabel(badgeId: string, s: { streak: number; xp: number }): string | null {
  const t = BADGE_THRESHOLDS[badgeId];
  if (!t) return null;
  const current = t.kind === 'streak' ? s.streak : s.xp;
  const remaining = Math.max(1, t.value - current);
  return t.kind === 'streak' ? `Encore ${remaining} jour${remaining > 1 ? 's' : ''}` : `Encore ${remaining} XP`;
}

// Picks the single locked badge that's honestly closest to unlocking, so the badge bridge gives
// a reason to act now instead of just a static count. Streak/XP thresholds are comparable as "%
// of the way there" even though their units differ (days vs. XP), which lets a 2-day gap and a
// 300 XP gap be ranked fairly against each other. b3 ("finis un chapitre") and b4 ("utilise un
// gel") have no partial progress to report — surfaced only once no numeric badge is left locked,
// and never with a fabricated remaining amount.
export function nextBadgeHint(
  s: { streak: number; xp: number },
  unlocked: Record<string, boolean>
): BadgeHint | null {
  const cond = (id: string) => BADGES.find((b) => b.id === id)?.cond ?? '';
  const numeric = NUMERIC_BADGE_IDS.filter((id) => !unlocked[id]).map((id) => {
    const t = BADGE_THRESHOLDS[id];
    const current = t.kind === 'streak' ? s.streak : s.xp;
    const remaining = Math.max(1, t.value - current);
    return { badgeId: id, frac: remaining / t.value, label: `${badgeRemainingLabel(id, s)} → ${cond(id)}` };
  });
  if (numeric.length > 0) {
    numeric.sort((a, b) => a.frac - b.frac);
    return { badgeId: numeric[0].badgeId, label: numeric[0].label };
  }
  if (!unlocked.b3) return { badgeId: 'b3', label: cond('b3') };
  if (!unlocked.b4) return { badgeId: 'b4', label: cond('b4') };
  return null;
}
