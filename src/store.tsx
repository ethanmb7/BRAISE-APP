import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  ViewId,
  TabId,
  UserProfile,
  AppState,
  Confidence,
  Personality,
  TextSize,
} from "@/types";
import { DEFAULT_USER, FLASHCARDS } from "@/data";
import { sfx } from "@/lib/sound";
import { loadProgress, saveProgress, saveCardReview } from "@/lib/persist";
import {
  ensureSession,
  goalTarget,
  MASTERED_AT_REPETITIONS,
  resolveRestoredTab,
  resolveRestoredView,
  sm2,
  XP_REWARDS,
} from "@/lib/progress";

type Ctx = {
  state: AppState;
  loaded: boolean;
  setView: (v: ViewId) => void;
  setTab: (t: TabId) => void;
  setUser: (u: UserProfile) => void;
  completeOnboarding: (u: UserProfile) => void;
  setPersonality: (p: Personality) => void;
  addXp: (n: number) => void;
  updateBestCombo: (n: number) => void;
  setFreezes: (n: number) => void;
  toggleFreeze: () => void;
  setDailyGoalMet: (v: boolean) => void;
  toggleDark: () => void;
  toggleDyslexia: () => void;
  setTextSize: (size: TextSize) => void;
  toggleSound: () => void;
  openSubject: (subjectId: string, chapterId?: string) => void;
  openLesson: (subjectId: string, chapterId: string, returnTo?: ViewId) => void;
  completeChapter: (chapterId: string) => void;
  reviewCard: (cardId: string, confidence: Confidence) => void;
  getDueCards: () => string[];
  goBack: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

// streak/xp were 5/340 here — demo-convenience values so testing didn't start from zero every
// reload, but they shipped as the real default for a genuine first launch: a brand-new user's
// very first screen claimed a 5-day streak they never earned. Onboarding's finish() only ever
// sets `user` fields, never these, so nothing downstream cleared them. `freezes: 2` stays as a
// real welcome gift (a resource handed to you, not a fabricated record of past use), same logic
// game onboarding flows use for starting currency.
const INITIAL: AppState = {
  // Only a device with no saved progress at all ever starts from INITIAL — i.e. a genuinely new
  // student. Anyone with a save is routed by resolveRestoredView instead.
  view: "onboarding",
  tab: "home",
  user: DEFAULT_USER,
  streak: 0,
  xp: 0,
  bestCombo: 0,
  freezes: 2,
  freezeArmed: false,
  everUsedFreeze: false,
  onboardingCompleted: false,
  dailyGoalMet: false,
  darkMode: false,
  dyslexiaMode: false,
  textSize: "normal",
  soundOn: true,
  currentSubjectId: null,
  currentChapterId: null,
  lastSubjectId: null,
  lastChapterId: null,
  completedChapters: [],
  lessonReturnTo: null,
  lastCompletion: null,
  cardReviews: {},
  sessionDate: new Date().toDateString(),
  sessionXpEarned: 0,
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
        const restoredView = resolveRestoredView(saved);
        setState((s) => ({
          ...s,
          ...saved,
          ...ensureSession({ ...s, ...saved }),
          view: restoredView,
          tab: resolveRestoredTab(restoredView, saved.tab),
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

  const completeOnboarding = useCallback((u: UserProfile) => {
    setState((s) => ({
      ...s,
      ...ensureSession(s),
      user: u,
      onboardingCompleted: true,
      view: "home",
      tab: "home",
    }));
  }, []);

  const setPersonality = useCallback((p: Personality) => {
    setState((s) => ({ ...s, ...ensureSession(s), user: { ...s.user, personality: p } }));
  }, []);

  const addXp = useCallback((n: number) => {
    setState((s) => ({ ...s, ...ensureSession(s), xp: s.xp + n }));
  }, []);

  const updateBestCombo = useCallback((n: number) => {
    setState((s) =>
      n > s.bestCombo ? { ...s, ...ensureSession(s), bestCombo: n } : { ...s, ...ensureSession(s) },
    );
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

  const setTextSize = useCallback((textSize: TextSize) => {
    setState((s) => ({ ...s, ...ensureSession(s), textSize }));
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
      view: "subject",
      currentSubjectId: subjectId,
      currentChapterId: chapterId ?? null,
    }));
  }, []);

  const openLesson = useCallback((subjectId: string, chapterId: string, returnTo?: ViewId) => {
    setState((s) => ({
      ...s,
      ...ensureSession(s),
      view: "lesson",
      currentSubjectId: subjectId,
      currentChapterId: chapterId,
      lastSubjectId: subjectId,
      lastChapterId: chapterId,
      // "Revoir la notion" from a Réviser session comes back to the session, not to the
      // subject page it was never on.
      lessonReturnTo: returnTo ?? null,
    }));
  }, []);

  const completeChapter = useCallback((chapterId: string) => {
    setState((s) => {
      // Always derive the reward from today's counters. This matters if the first completion
      // happens after midnight while a previous session is still in local storage.
      const session = { ...s, ...ensureSession(s) };
      const already = session.completedChapters.includes(chapterId);
      const xpGained = already ? 0 : XP_REWARDS.CHAPTER_COMPLETE;
      const sessionXpEarned = session.sessionXpEarned + xpGained;
      return {
        ...session,
        completedChapters: already
          ? session.completedChapters
          : [...session.completedChapters, chapterId],
        sessionXpEarned,
        xp: session.xp + xpGained,
        dailyGoalMet: sessionXpEarned >= goalTarget(session),
        lastCompletion: { chapterId, wasNewCompletion: !already, xpGained },
      };
    });
  }, []);

  const reviewCard = useCallback((cardId: string, confidence: Confidence) => {
    setState((s) => {
      // `ensureSession` is intentionally first, just as it is in `completeChapter`. A card
      // reviewed just after midnight must be card 1 of *today*, never yesterday's total plus
      // one — otherwise the goal HUD and the Pioche's supporting progress can claim a false
      // daily completion. Keeping the daily accounting truthful is a product invariant, not a
      // display concern.
      const session = { ...s, ...ensureSession(s) };
      const prev = session.cardReviews[cardId];
      const updated = sm2(prev, confidence);
      // A wrong swipe-judgment (RevisionsView's only caller for 'not-sure') used to still grant
      // XP here — invisible everywhere a student could see it: the "GRILLÉ" feedback line never
      // mentioned it, and BraiseRecap's own +XP total only ever summed correct answers. The real
      // account XP (this field) and the celebratory total shown at the end of a session could
      // silently drift apart with no explanation offered.
      //
      // A correct review of a card already mastered before this attempt pays half price — see
      // XP_REWARDS' own comment for why: reviewing something you already know is real
      // consolidation and still worth something, but paying it full price is what let a student
      // farm XP by restarting a Réviser session and re-answering cards they'd long since learned.
      const wasMastered = !!prev && prev.repetitions >= MASTERED_AT_REPETITIONS;
      const xpGain =
        confidence === "sure"
          ? wasMastered
            ? XP_REWARDS.REVIEW_MASTERED
            : XP_REWARDS.REVIEW_LEARNING
          : 0;
      const sessionXpEarned = session.sessionXpEarned + xpGain;
      void saveCardReview(cardId, updated);
      return {
        ...session,
        cardReviews: { ...session.cardReviews, [cardId]: updated },
        sessionXpEarned,
        xp: session.xp + xpGain,
        dailyGoalMet: sessionXpEarned >= goalTarget(session),
      };
    });
  }, []);

  const getDueCards = useCallback((): string[] => {
    const now = Date.now();
    return FLASHCARDS.filter((c) => {
      const r = state.cardReviews[c.id];
      // An unseen card is available for discovery, but it is not "due": consolidation only
      // exists after a first attempt has created a review schedule.
      if (!r) return false;
      return r.nextReviewAt <= now;
    }).map((c) => c.id);
  }, [state.cardReviews]);

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.view === "lesson" && s.lessonReturnTo) {
        return { ...s, view: s.lessonReturnTo, lessonReturnTo: null };
      }
      if (s.view === "lesson" || s.view === "complete") return { ...s, view: "subject" };
      if (s.view === "subject" || s.view === "settings" || s.view === "share")
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
        completeOnboarding,
        setPersonality,
        addXp,
        updateBestCombo,
        setFreezes,
        toggleFreeze,
        setDailyGoalMet,
        toggleDark,
        toggleDyslexia,
        setTextSize,
        toggleSound,
        openSubject,
        openLesson,
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
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
