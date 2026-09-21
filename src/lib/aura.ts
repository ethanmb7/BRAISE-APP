import { SUBJECTS, FLASHCARDS } from '@/data';
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
