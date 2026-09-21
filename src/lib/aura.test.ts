import { describe, it, expect } from 'vitest';
import { getRankInfo, computeSubjectMastery, countMasteredCards, nextBadgeHint, RANKS } from '@/lib/aura';
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
    expect(maths.masteredCount).toBe(0);
    expect(maths.totalCount).toBe(6); // real maths deck: fc1, fc2, fc3, fc9, fc10, fc11
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
    expect(maths.masteredCount).toBe(3);
    expect(maths.totalCount).toBe(6);
  });

  it('counts mastered against the subject\'s real total, not just what was reviewed — a single mastered card out of a 6-card deck is 1/6, never a fabricated 100%', () => {
    const rows = computeSubjectMastery({ fc1: review(2) });
    const maths = rows.find((r) => r.id === 'maths')!;
    expect(maths.masteredCount).toBe(1);
    expect(maths.totalCount).toBe(6);
  });

  it('treats a card seen once (repetitions 1) as started but not mastered', () => {
    const rows = computeSubjectMastery({ fc1: review(1) });
    const maths = rows.find((r) => r.id === 'maths')!;
    expect(maths.started).toBe(true);
    expect(maths.masteredCount).toBe(0);
  });

  it('returns one row per subject, in SUBJECTS order, regardless of review data', () => {
    const rows = computeSubjectMastery({});
    expect(rows.map((r) => r.id)).toEqual(['maths', 'francais', 'histoire-geo', 'svt', 'physique', 'anglais']);
  });
});

describe('countMasteredCards', () => {
  it('counts across every subject, not just one', () => {
    expect(countMasteredCards({ fc1: review(2), fc2: review(1), fc9: review(3) })).toBe(2);
  });

  it('returns 0 for no reviews', () => {
    expect(countMasteredCards({})).toBe(0);
  });
});

describe('nextBadgeHint', () => {
  it('picks the badge closest by fraction-of-threshold, not by badge order — 100 XP left on a 1000 XP badge beats 5 days left on a 7-day badge', () => {
    const unlocked = { b1: false, b2: true, b3: true, b4: true, b5: false, b6: false };
    const hint = nextBadgeHint({ streak: 2, xp: 900 }, unlocked);
    expect(hint?.badgeId).toBe('b6');
    expect(hint?.label).toBe('Encore 100 XP → 1000 XP gagnés');
  });

  it('on a fresh account, ties on fraction resolve to the first numeric badge checked (b1)', () => {
    const unlocked = { b1: false, b2: false, b3: false, b4: false, b5: false, b6: false };
    const hint = nextBadgeHint({ streak: 0, xp: 0 }, unlocked);
    expect(hint?.badgeId).toBe('b1');
    expect(hint?.label).toBe('Encore 3 jours → Série de 3');
  });

  it('falls back to a binary badge (no fabricated remaining amount) once every numeric badge is unlocked', () => {
    const unlocked = { b1: true, b2: true, b3: false, b4: true, b5: true, b6: true };
    const hint = nextBadgeHint({ streak: 30, xp: 5000 }, unlocked);
    expect(hint).toEqual({ badgeId: 'b3', label: '1 chapitre fini' });
  });

  it('returns null once every badge is unlocked', () => {
    const unlocked = { b1: true, b2: true, b3: true, b4: true, b5: true, b6: true };
    expect(nextBadgeHint({ streak: 30, xp: 5000 }, unlocked)).toBeNull();
  });
});
