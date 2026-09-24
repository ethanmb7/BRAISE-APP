import { describe, it, expect } from 'vitest';
import { ensureSession } from '@/store';
import { DEFAULT_USER } from '@/data';
import type { AppState } from '@/types';

// A full, minimal-but-valid AppState so each test only has to override the handful of fields
// its own case actually cares about — the rest never matters to ensureSession's own branching.
function baseState(overrides: Partial<AppState>): AppState {
  return {
    view: 'home',
    tab: 'home',
    user: DEFAULT_USER,
    streak: 0,
    xp: 0,
    bestCombo: 0,
    freezes: 2,
    freezeArmed: false,
    everUsedFreeze: false,
    dailyGoalMet: false,
    darkMode: false,
    dyslexiaMode: false,
    soundOn: true,
    currentSubjectId: null,
    currentChapterId: null,
    lastSubjectId: null,
    lastChapterId: null,
    currentLessonMode: 'vocal',
    completedChapters: [],
    chatBridgeMessage: null,
    lessonReturnTo: null,
    lastCompletion: null,
    cardReviews: {},
    sessionDate: new Date().toDateString(),
    sessionCardsReviewed: 3,
    sessionChaptersDone: 1,
    ...overrides,
  };
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toDateString();

describe('ensureSession', () => {
  it('does nothing within the same real day', () => {
    const s = baseState({ sessionDate: new Date().toDateString(), streak: 4 });
    expect(ensureSession(s)).toEqual({});
  });

  it('increments the streak when yesterday\'s goal was met', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: true, streak: 4 });
    const result = ensureSession(s);
    expect(result.streak).toBe(5);
    expect(result.sessionCardsReviewed).toBe(0);
    expect(result.sessionChaptersDone).toBe(0);
    expect(result.dailyGoalMet).toBe(false);
  });

  it('resets the streak when yesterday\'s goal was missed with no freeze armed', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: false, freezeArmed: false, streak: 6 });
    expect(ensureSession(s).streak).toBe(0);
  });

  it('preserves the streak when a freeze was armed to cover a missed day, consumes it, and marks it as ever used', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: false, freezeArmed: true, freezes: 1, streak: 6, everUsedFreeze: false });
    const result = ensureSession(s);
    expect(result.streak).toBeUndefined(); // untouched -> stays 6 in the real reducer merge
    expect(result.freezeArmed).toBe(false);
    expect(result.freezes).toBeUndefined(); // already decremented when the freeze was armed
    expect(result.everUsedFreeze).toBe(true); // the one real "Gel utilisé" moment for badge b4
  });

  it('does not mark a freeze as used just because it was armed and then refunded unneeded', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: true, freezeArmed: true, freezes: 1, streak: 6, everUsedFreeze: false });
    expect(ensureSession(s).everUsedFreeze).toBeUndefined();
  });

  it('refunds a freeze that was armed defensively but never needed', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: true, freezeArmed: true, freezes: 1, streak: 6 });
    const result = ensureSession(s);
    expect(result.streak).toBe(7);
    expect(result.freezeArmed).toBe(false);
    expect(result.freezes).toBe(2);
  });

  it('breaks the streak on a real multi-day gap even with a freeze armed', () => {
    const s = baseState({ sessionDate: daysAgo(3), dailyGoalMet: true, freezeArmed: true, freezes: 1, streak: 9 });
    const result = ensureSession(s);
    expect(result.streak).toBe(0);
    expect(result.freezeArmed).toBe(false);
  });

  it('never lets a corrupted sessionDate reach streak as NaN', () => {
    const s = baseState({ sessionDate: 'not-a-real-date', streak: 3 });
    const result = ensureSession(s);
    expect(Number.isNaN(result.streak)).toBe(false);
    expect(result.sessionCardsReviewed).toBe(0);
  });
});
