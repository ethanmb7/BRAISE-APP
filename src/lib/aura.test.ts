import { describe, it, expect } from 'vitest';
import { getRankInfo, computeSubjectMastery, RANKS } from '@/lib/aura';
import type { CardReview } from '@/types';

function review(repetitions: number): CardReview {
  return { repetitions, interval: 1, ease: 2.5, nextReviewAt: Date.now(), lastConfidence: 'sure' };
}

describe('getRankInfo', () => {
  it('starts at bronze with 0 xp', () => {
    const info = getRankInfo(0);
    expect(info.current.id).toBe('bronze');
    expect(info.idx).toBe(0);
    expect(info.next?.id).toBe('argent');
    expect(info.pct).toBe(0);
  });

  it('computes progress toward the next rank as a percentage of the gap', () => {
    // Bronze spans 0-500; halfway there is 250.
    const info = getRankInfo(250);
    expect(info.current.id).toBe('bronze');
    expect(info.pct).toBe(50);
  });

  it('lands exactly on a rank boundary as that rank, not the one before it', () => {
    const info = getRankInfo(500);
    expect(info.current.id).toBe('argent');
    expect(info.pct).toBe(0);
  });

  it('caps at the last rank with no next rank and 100% progress', () => {
    const maxRank = RANKS[RANKS.length - 1];
    const info = getRankInfo(maxRank.min);
    expect(info.current.id).toBe(maxRank.id);
    expect(info.next).toBeNull();
    expect(info.pct).toBe(100);
  });

  it('stays capped past the last rank threshold — no fabricated "beyond legend" state', () => {
    const info = getRankInfo(999999);
    expect(info.current.id).toBe(RANKS[RANKS.length - 1].id);
    expect(info.next).toBeNull();
    expect(info.pct).toBe(100);
  });
});

describe('computeSubjectMastery', () => {
  it('flags a subject with no reviewed cards as not started, never as 0%', () => {
    const rows = computeSubjectMastery({});
    const maths = rows.find((r) => r.id === 'maths')!;
    expect(maths.started).toBe(false);
    expect(maths.pct).toBe(0);
  });

  it('only counts a card as mastered once it clears the SM-2 learning phase (repetitions >= 2)', () => {
    // Real maths deck: fc1, fc2, fc3, fc9, fc10, fc11 (6 cards). Review all 6, master 3 of them.
    const rows = computeSubjectMastery({
      fc1: review(2),
      fc2: review(3),
      fc3: review(2),
      fc9: review(1), // seen, not mastered yet
      fc10: review(0),
      fc11: review(1),
    });
    const maths = rows.find((r) => r.id === 'maths')!;
    expect(maths.started).toBe(true);
    expect(maths.pct).toBe(50); // 3 of 6 mastered
  });

  it('treats a card seen once (repetitions 1) as started but not mastered', () => {
    const rows = computeSubjectMastery({ fc1: review(1) });
    const maths = rows.find((r) => r.id === 'maths')!;
    expect(maths.started).toBe(true);
    expect(maths.pct).toBe(0);
  });

  it('returns one row per subject, in SUBJECTS order, regardless of review data', () => {
    const rows = computeSubjectMastery({});
    expect(rows.map((r) => r.id)).toEqual(['maths', 'francais', 'histoire-geo', 'svt', 'physique', 'anglais']);
  });
});
