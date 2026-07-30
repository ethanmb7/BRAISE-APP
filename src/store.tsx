import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { ViewId, TabId, UserProfile, AppState, Confidence, CardReview } from '@/types';
import { DEFAULT_USER, FLASHCARDS } from '@/data';
import { sfx } from '@/lib/sound';
import { loadProgress, saveProgress, saveCardReview } from '@/lib/persist';

type Ctx = {
  state: AppState;
  loaded: boolean;
  setView: (v: ViewId) => void;
  setTab: (t: TabId) => void;
  setUser: (u: UserProfile) => void;
  addXp: (n: number) => void;
  setStreak: (n: number) => void;
  setFreezes: (n: number) => void;
  toggleFreeze: () => void;
  setDailyGoalMet: (v: boolean) => void;
  toggleDark: () => void;
  toggleDyslexia: () => void;
  toggleSound: () => void;
  openSubject: (subjectId: string, chapterId?: string) => void;
  openLesson: (subjectId: string, chapterId: string, mode?: 'vocal' | 'echanger') => void;
  completeChapter: (chapterId: string) => void;
  reviewCard: (cardId: string, confidence: Confidence) => void;
  getDueCards: () => string[];
  goBack: () => void;
  bridgeToChat: (subjectId: string, chapterId: string, bridgeMessage: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_GOAL_TARGET = 10;

export function computeGoalPct(s: AppState): number {
  const activity = s.sessionCardsReviewed + s.sessionChaptersDone * 3;
  return Math.min(100, Math.round((activity / DAILY_GOAL_TARGET) * 100));
}

function sm2(review: CardReview | undefined, confidence: Confidence): CardReview {
  const now = Date.now();
  const quality = confidence === 'sure' ? 5 : confidence === 'doubt' ? 3 : 1;

  let { repetitions, interval, ease } = review
    ? { repetitions: review.repetitions, interval: review.interval, ease: review.ease }
    : { repetitions: 0, interval: 0, ease: 2.5 };

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.round(interval * ease);
  }

  return {
    repetitions,
    interval,
    ease,
    nextReviewAt: now + interval * DAY_MS,
    lastConfidence: confidence,
  };
}

function ensureSession(s: AppState): Partial<AppState> {
  const today = new Date().toDateString();
  if (s.sessionDate !== today) {
    return { sessionDate: today, sessionCardsReviewed: 0, sessionChaptersDone: 0, dailyGoalMet: false };
  }
  return {};
}

const INITIAL: AppState = {
  view: 'onboarding',
  tab: 'home',
  user: DEFAULT_USER,
  streak: 5,
  xp: 340,
  freezes: 2,
  freezeArmed: false,
  dailyGoalMet: false,
  darkMode: false,
  dyslexiaMode: false,
  soundOn: true,
  currentSubjectId: null,
  currentChapterId: null,
  currentLessonMode: 'vocal' as const,
  completedChapters: [],
  chatBridgeMessage: null,
  cardReviews: {},
  sessionDate: new Date().toDateString(),
  sessionCardsReviewed: 0,
  sessionChaptersDone: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadProgress();
      if (cancelled) return;
      if (saved) {
        setState((s) => ({
          ...s,
          ...saved,
          ...ensureSession({ ...s, ...saved }),
          view: 'home',
        }));
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress(state);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, loaded]);

  const setView = useCallback((v: ViewId) => {
    setState((s) => ({ ...s, ...ensureSession(s), view: v }));
  }, []);

  const setTab = useCallback((t: TabId) => {
    setState((s) => ({ ...s, ...ensureSession(s), tab: t, view: t }));
  }, []);

  const setUser = useCallback((u: UserProfile) => {
    setState((s) => ({ ...s, ...ensureSession(s), user: u }));
  }, []);

  const addXp = useCallback((n: number) => {
    setState((s) => ({ ...s, ...ensureSession(s), xp: s.xp + n }));
  }, []);

  const setStreak = useCallback((n: number) => {
    setState((s) => ({ ...s, ...ensureSession(s), streak: n }));
  }, []);

  const setFreezes = useCallback((n: number) => {
    setState((s) => ({ ...s, ...ensureSession(s), freezes: n }));
  }, []);

  const toggleFreeze = useCallback(() => {
    setState((s) => {
      if (!s.freezeArmed && s.freezes <= 0) return s;
      return {
        ...s,
        ...ensureSession(s),
        freezeArmed: !s.freezeArmed,
        freezes: !s.freezeArmed ? s.freezes - 1 : s.freezes + 1,
      };
    });
  }, []);

  const setDailyGoalMet = useCallback((v: boolean) => {
    setState((s) => ({ ...s, ...ensureSession(s), dailyGoalMet: v }));
  }, []);

  const toggleDark = useCallback(() => {
    setState((s) => ({ ...s, ...ensureSession(s), darkMode: !s.darkMode }));
  }, []);

  const toggleDyslexia = useCallback(() => {
    setState((s) => ({ ...s, ...ensureSession(s), dyslexiaMode: !s.dyslexiaMode }));
  }, []);

  const toggleSound = useCallback(() => {
    setState((s) => {
      const next = !s.soundOn;
      if (next) sfx.tap(true);
      return { ...s, ...ensureSession(s), soundOn: next };
    });
  }, []);

  const openSubject = useCallback((subjectId: string, chapterId?: string) => {
    setState((s) => ({
      ...s,
      ...ensureSession(s),
      view: 'subject',
      currentSubjectId: subjectId,
      currentChapterId: chapterId ?? null,
    }));
  }, []);

  const openLesson = useCallback(
    (subjectId: string, chapterId: string, mode?: 'vocal' | 'echanger') => {
      setState((s) => ({
        ...s,
        ...ensureSession(s),
        view: 'lesson',
        currentSubjectId: subjectId,
        currentChapterId: chapterId,
        currentLessonMode: mode ?? 'vocal',
        chatBridgeMessage: null,
      }));
    },
    []
  );

  const bridgeToChat = useCallback((subjectId: string, chapterId: string, bridgeMessage: string) => {
    setState((s) => ({
      ...s,
      ...ensureSession(s),
      view: 'lesson',
      currentSubjectId: subjectId,
      currentChapterId: chapterId,
      currentLessonMode: 'echanger',
      chatBridgeMessage: bridgeMessage,
    }));
  }, []);

  const completeChapter = useCallback((chapterId: string) => {
    setState((s) => {
      const already = s.completedChapters.includes(chapterId);
      const sessionChaptersDone = already ? s.sessionChaptersDone : s.sessionChaptersDone + 1;
      const activity = s.sessionCardsReviewed + sessionChaptersDone * 3;
      return {
        ...s,
        ...ensureSession(s),
        completedChapters: already ? s.completedChapters : [...s.completedChapters, chapterId],
        sessionChaptersDone,
        xp: already ? s.xp : s.xp + 50,
        dailyGoalMet: activity >= DAILY_GOAL_TARGET,
      };
    });
  }, []);

  const reviewCard = useCallback((cardId: string, confidence: Confidence) => {
    setState((s) => {
      const prev = s.cardReviews[cardId];
      const updated = sm2(prev, confidence);
      const sessionCardsReviewed = s.sessionCardsReviewed + 1;
      const xpGain = confidence === 'sure' ? 15 : confidence === 'doubt' ? 8 : 3;
      const activity = sessionCardsReviewed + s.sessionChaptersDone * 3;
      void saveCardReview(cardId, updated);
      return {
        ...s,
        ...ensureSession(s),
        cardReviews: { ...s.cardReviews, [cardId]: updated },
        sessionCardsReviewed,
        xp: s.xp + xpGain,
        dailyGoalMet: activity >= DAILY_GOAL_TARGET,
      };
    });
  }, []);

  const getDueCards = useCallback((): string[] => {
    const now = Date.now();
    return FLASHCARDS.filter((c) => {
      const r = state.cardReviews[c.id];
      if (!r) return true;
      return r.nextReviewAt <= now;
    }).map((c) => c.id);
  }, [state.cardReviews]);

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.view === 'lesson' || s.view === 'complete') return { ...s, view: 'subject' };
      if (s.view === 'subject' || s.view === 'settings' || s.view === 'share')
        return { ...s, view: s.tab };
      return s;
    });
  }, []);

  return (
    <AppCtx.Provider
      value={{
        state,
        loaded,
        setView,
        setTab,
        setUser,
        addXp,
        setStreak,
        setFreezes,
        toggleFreeze,
        setDailyGoalMet,
        toggleDark,
        toggleDyslexia,
        toggleSound,
        openSubject,
        openLesson,
        bridgeToChat,
        completeChapter,
        reviewCard,
        getDueCards,
        goBack,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
