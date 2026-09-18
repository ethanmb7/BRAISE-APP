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

// Reconstructs which of the last 7 calendar days were "active" purely from the two signals
// the store actually tracks — current streak length and whether today's goal is already met.
// There is no per-day activity log to read from (CardReview only keeps a scheduling
// timestamp, not a review-history log), so this is a derivation from the one signal that IS
// trustworthy, not a fabricated history: if the streak is N days and today doesn't count yet,
// the N most recent PRIOR days must be the active run; if today already counts, today is the
// most recent day of that same run.
export function deriveWeekActivity(streak: number, dailyGoalMet: boolean): boolean[] {
  return Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i; // i=0 -> 6 days ago ... i=6 -> today
    if (daysAgo === 0) return dailyGoalMet;
    const offset = daysAgo - (dailyGoalMet ? 0 : 1);
    return offset >= 0 && offset < streak;
  });
}
