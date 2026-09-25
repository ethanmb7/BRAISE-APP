import { describe, it, expect } from 'vitest';
import { ensureSession, resolveChapters } from '@/store';
import { DEFAULT_USER } from '@/data';
import type { AppState, Chapter } from '@/types';

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
    struggledChapters: [],
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

  it('preserves the streak when a freeze was armed to cover a missed day, and consumes it', () => {
    const s = baseState({ sessionDate: daysAgo(1), dailyGoalMet: false, freezeArmed: true, freezes: 1, streak: 6 });
    const result = ensureSession(s);
    expect(result.streak).toBeUndefined(); // untouched -> stays 6 in the real reducer merge
    expect(result.freezeArmed).toBe(false);
    expect(result.freezes).toBeUndefined(); // already decremented when the freeze was armed
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

const CHAPTERS: Chapter[] = [
  { id: 'c1', title: 'Un', status: 'current', mastery: 0, duration: 3 },
  { id: 'c2', title: 'Deux', status: 'locked', mastery: 0, duration: 3 },
  { id: 'c3', title: 'Trois', status: 'locked', mastery: 0, duration: 3 },
];

describe('resolveChapters', () => {
  it('defaults reinforce to false with no struggle history', () => {
    const result = resolveChapters(CHAPTERS, []);
    expect(result.every((c) => c.reinforce === false)).toBe(true);
  });

  it('surfaces reinforce only for chapters with a real recorded struggle', () => {
    const result = resolveChapters(CHAPTERS, [], ['c2']);
    expect(result.find((c) => c.id === 'c1')?.reinforce).toBe(false);
    expect(result.find((c) => c.id === 'c2')?.reinforce).toBe(true);
    expect(result.find((c) => c.id === 'c3')?.reinforce).toBe(false);
  });

  it('never shows reinforce on a chapter already completed, even with a struggle on record', () => {
    // A real case: the student missed a question on c1, then went back and finished it anyway —
    // "done" and "still needs reinforcement" would read as contradictory with no partial-mastery
    // state to hold both at once (see resolveChapters' own comment in store.tsx).
    const result = resolveChapters(CHAPTERS, ['c1'], ['c1']);
    const c1 = result.find((c) => c.id === 'c1');
    expect(c1?.status).toBe('done');
    expect(c1?.reinforce).toBe(false);
  });
});
