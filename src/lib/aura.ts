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

export type BadgeHint = { badgeId: string; label: string };

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
  const numeric: { badgeId: string; frac: number; label: string }[] = [];
  if (!unlocked.b1) {
    const remaining = Math.max(1, 3 - s.streak);
    numeric.push({ badgeId: 'b1', frac: remaining / 3, label: `Encore ${remaining} jour${remaining > 1 ? 's' : ''} → ${cond('b1')}` });
  }
  if (!unlocked.b5) {
    const remaining = Math.max(1, 7 - s.streak);
    numeric.push({ badgeId: 'b5', frac: remaining / 7, label: `Encore ${remaining} jour${remaining > 1 ? 's' : ''} → ${cond('b5')}` });
  }
  if (!unlocked.b2) {
    const remaining = Math.max(1, 100 - s.xp);
    numeric.push({ badgeId: 'b2', frac: remaining / 100, label: `Encore ${remaining} XP → ${cond('b2')}` });
  }
  if (!unlocked.b6) {
    const remaining = Math.max(1, 1000 - s.xp);
    numeric.push({ badgeId: 'b6', frac: remaining / 1000, label: `Encore ${remaining} XP → ${cond('b6')}` });
  }
  if (numeric.length > 0) {
    numeric.sort((a, b) => a.frac - b.frac);
    return { badgeId: numeric[0].badgeId, label: numeric[0].label };
  }
  if (!unlocked.b3) return { badgeId: 'b3', label: cond('b3') };
  if (!unlocked.b4) return { badgeId: 'b4', label: cond('b4') };
  return null;
}
