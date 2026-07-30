import type { AppState, UserProfile, CardReview, Confidence } from '@/types';

const PROGRESS_KEY = 'sapie_progress';
const CARDS_KEY = 'sapie_card_reviews';

type StoredProgress = {
  xp: number;
  streak: number;
  freezes: number;
  freezeArmed: boolean;
  dailyGoalMet: boolean;
  darkMode: boolean;
  dyslexiaMode: boolean;
  soundOn: boolean;
  user: UserProfile;
  completedChapters: string[];
  sessionDate: string;
  sessionCardsReviewed: number;
  sessionChaptersDone: number;
};

export async function loadProgress(): Promise<Partial<AppState> | null> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredProgress;

    const cardReviews: Record<string, CardReview> = {};
    const cardsRaw = localStorage.getItem(CARDS_KEY);
    if (cardsRaw) {
      const cards = JSON.parse(cardsRaw) as Record<string, CardReview>;
      Object.entries(cards).forEach(([id, r]) => {
        cardReviews[id] = r;
      });
    }

    return {
      xp: p.xp,
      streak: p.streak,
      freezes: p.freezes,
      freezeArmed: p.freezeArmed,
      dailyGoalMet: p.dailyGoalMet,
      darkMode: p.darkMode,
      dyslexiaMode: p.dyslexiaMode,
      soundOn: p.soundOn,
      user: p.user,
      completedChapters: p.completedChapters ?? [],
      cardReviews,
      sessionDate: p.sessionDate ?? '',
      sessionCardsReviewed: p.sessionCardsReviewed ?? 0,
      sessionChaptersDone: p.sessionChaptersDone ?? 0,
    };
  } catch {
    return null;
  }
}

export async function saveProgress(state: AppState): Promise<void> {
  try {
    const row: StoredProgress = {
      xp: state.xp,
      streak: state.streak,
      freezes: state.freezes,
      freezeArmed: state.freezeArmed,
      dailyGoalMet: state.dailyGoalMet,
      darkMode: state.darkMode,
      dyslexiaMode: state.dyslexiaMode,
      soundOn: state.soundOn,
      user: state.user,
      completedChapters: state.completedChapters,
      sessionDate: state.sessionDate,
      sessionCardsReviewed: state.sessionCardsReviewed,
      sessionChaptersDone: state.sessionChaptersDone,
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(row));
  } catch {
    // ignore quota errors
  }
}

export async function saveCardReview(cardId: string, review: CardReview): Promise<void> {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    const cards = raw ? (JSON.parse(raw) as Record<string, CardReview>) : {};
    cards[cardId] = review;
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  } catch {
    // ignore quota errors
  }
}

export type { Confidence };
