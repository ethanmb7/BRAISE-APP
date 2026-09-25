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
  CardReview,
  Personality,
  Chapter,
} from "@/types";
import { DEFAULT_USER, FLASHCARDS, SUBJECTS } from "@/data";
import { sfx } from "@/lib/sound";
import { loadProgress, saveProgress, saveCardReview } from "@/lib/persist";

type Ctx = {
  state: AppState;
  loaded: boolean;
  setView: (v: ViewId) => void;
  setTab: (t: TabId) => void;
  setUser: (u: UserProfile) => void;
  setPersonality: (p: Personality) => void;
  addXp: (n: number) => void;
  updateBestCombo: (n: number) => void;
  setFreezes: (n: number) => void;
  toggleFreeze: () => void;
  setDailyGoalMet: (v: boolean) => void;
  toggleDark: () => void;
  toggleDyslexia: () => void;
  toggleSound: () => void;
  openSubject: (subjectId: string, chapterId?: string) => void;
  openLesson: (subjectId: string, chapterId: string, mode?: "vocal" | "echanger") => void;
  completeChapter: (chapterId: string) => void;
  flagStruggle: (chapterId: string) => void;
  reviewCard: (cardId: string, confidence: Confidence) => void;
  getDueCards: () => string[];
  goBack: () => void;
  bridgeToChat: (
    subjectId: string,
    chapterId: string,
    bridgeMessage: string,
    returnTo?: ViewId,
  ) => void;
};

const AppCtx = createContext<Ctx | null>(null);

const DAY_MS = 24 * 60 * 60 * 1000;
const GOAL_TARGETS: Record<string, number> = {
  "15 min/jour": 6,
  "30 min/jour": 10,
  "1 heure/jour": 18,
};
const DEFAULT_GOAL_TARGET = 10;

function goalTarget(s: AppState): number {
  return GOAL_TARGETS[s.user.goal] ?? DEFAULT_GOAL_TARGET;
}

export function computeGoalPct(s: AppState): number {
  const activity = s.sessionCardsReviewed + s.sessionChaptersDone * 3;
  return Math.min(100, Math.round((activity / goalTarget(s)) * 100));
}

/** Remaining "card-equivalent" units to hit today's goal (cards count 1, chapters count 3 —
 *  same weighting as computeGoalPct) — real, derived from the same activity formula, never a
 *  separate guess. 0 once the goal is already met. */
export function remainingToGoal(s: AppState): number {
  const activity = s.sessionCardsReviewed + s.sessionChaptersDone * 3;
  return Math.max(0, goalTarget(s) - activity);
}

/** Real chapter progression, derived from `completedChapters` — the one dynamic signal the app
 *  actually tracks. `data.ts` only ships a fresh-install baseline (chapter 0 of each subject
 *  open, the rest locked); this recomputes status/mastery from real completion every render, so
 *  finishing a chapter anywhere actually unlocks the next one everywhere. Without this, `status`
 *  in data.ts never changes and every subject stays stuck on its first chapter forever — the
 *  same "static field never reflects real progress" bug the streak/XP fix addressed, just one
 *  level deeper. A completed chapter shows 100% (real completion, not a graded score — nothing
 *  in the data model tracks partial per-chapter mastery); anything not yet completed shows 0%,
 *  never a fabricated in-between number.
 *
 *  `reinforce` had the exact same bug: data.ts's `reinforce: true` on m3/p2 was a fresh-install
 *  baseline the UI displayed as if it were live fact, never recomputed from anything the student
 *  actually did. It's now driven by `struggledChapters` (a real miss — a wrong lesson-quiz answer
 *  or an honest "Je ne sais pas", see LessonView's `flagStruggle`) — never shown on a chapter
 *  that's already 'done', since "finished" and "still needs reinforcement" read as contradictory
 *  in the app's current binary completion model (no partial-mastery state exists yet to hold
 *  both facts at once).
 */
export function resolveChapters(chapters: Chapter[], completedChapters: string[], struggledChapters: string[] = []): Chapter[] {
  const firstOpenIndex = chapters.findIndex((c) => !completedChapters.includes(c.id));
  return chapters.map((c, i) => {
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
    if (completedChapters.includes(c.id)) return { ...c, status: "done", mastery: 100 };
    if (i === firstOpenIndex) return { ...c, status: "current", mastery: 0 };
    return { ...c, status: "locked", mastery: 0 };
=======
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
    if (completedChapters.includes(c.id)) return { ...c, status: "done", mastery: 100 };
    if (i === firstOpenIndex) return { ...c, status: "current", mastery: 0 };
    return { ...c, status: "locked", mastery: 0 };
=======
    if (completedChapters.includes(c.id)) return { ...c, status: 'done', mastery: 100, reinforce: false };
    const reinforce = struggledChapters.includes(c.id);
    if (i === firstOpenIndex) return { ...c, status: 'current', mastery: 0, reinforce };
    return { ...c, status: 'locked', mastery: 0, reinforce };
main
main
  });
}

/** Real count of finished chapters across every subject — via `resolveChapters`, not the static
 *  per-chapter `status` in data.ts (that field is only ever a fresh-install baseline now; reading
 *  it directly here would silently undercount every real user's progress). */
export function countDoneChapters(completedChapters: string[]): number {
  return SUBJECTS.reduce(
    (acc, s) =>
      acc +
      resolveChapters(s.chapters, completedChapters).filter((c) => c.status === "done").length,
    0,
  );
}

/** Single source of truth for which of the BADGES in data.ts are earned — used by ProfileView to
 *  render them and by the milestone-celebration hook to detect a fresh unlock. Previously
 *  duplicated inline in ProfileView with its own `chaptersDone`, which read the static chapter
 *  status directly and could therefore never see a real "done" chapter post-resolveChapters. */
export function computeUnlockedBadges(
  s: Pick<AppState, "streak" | "xp" | "freezeArmed" | "freezes" | "completedChapters">,
): Record<string, boolean> {
  const chaptersDone = countDoneChapters(s.completedChapters);
  return {
    b1: s.streak >= 3,
    b2: s.xp >= 100,
    b3: chaptersDone >= 1,
    b4: s.freezeArmed || s.freezes < 2,
    b5: s.streak >= 7,
    b6: s.xp >= 1000,
  };
}

/** A reload used to always land back on 'home', even mid-lesson, because the saved view was never
 *  validated against real content — restoring a stale/renamed subject or chapter id blindly would
 *  hand LessonView/SubjectView an id that resolves to nothing, and both just render null: a blank
 *  screen forever, worse than the reset it replaces. Only 'lesson'/'subject' need this check —
 *  every other resumable view is self-contained and doesn't reference content by id. */
function resolveRestoredView(saved: Partial<AppState>): ViewId {
  const view = saved.view;
  if (view === "lesson" || view === "subject") {
    const subject = SUBJECTS.find((s) => s.id === saved.currentSubjectId);
    if (!subject) return "home";
    if (view === "lesson" && !subject.chapters.find((c) => c.id === saved.currentChapterId))
      return "home";
    return view;
  }
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
main
  if (
    view === "learn" ||
    view === "revisions" ||
    view === "progres" ||
    view === "profile" ||
    view === "settings"
  )
    return view;
  return "home";
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
=======
  if (view === 'subjects' || view === 'revisions' || view === 'progres' || view === 'profile' || view === 'settings') return view;
  return 'home';
main
main
}

// `tab` drives the bottom nav highlight independently of `view` (SubjectView/SettingsView both
// use it to know which tab "back" returns to — see goBack below), so it needs restoring too, not
// just `view` — otherwise resuming into e.g. Revisions would show the right screen with the wrong
// tab lit up, and a subsequent "back" from Subject/Settings would return to the wrong place.
function resolveRestoredTab(view: ViewId, savedTab: TabId | undefined): TabId {
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
main
  if (view === "home" || view === "learn" || view === "revisions" || view === "profile")
    return view;
  // `progres` used to be a main tab. It now lives inside Moi; migrate old local saves safely.
  return (savedTab as string | undefined) === "progres" ? "profile" : (savedTab ?? "home");
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
=======
  if (view === 'home' || view === 'subjects' || view === 'revisions' || view === 'profile') return view;
  if (savedTab === 'home' || savedTab === 'subjects' || savedTab === 'revisions' || savedTab === 'profile') return savedTab;
  // `progres` used to be a tab. Old localStorage values now land on Moi, where Aura belongs.
  return view === 'progres' ? 'profile' : 'home';
main
main
}

function sm2(review: CardReview | undefined, confidence: Confidence): CardReview {
  const now = Date.now();
  const quality = confidence === "sure" ? 5 : confidence === "doubt" ? 3 : 1;

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

// The one real piece of streak logic in the whole app — everywhere else just reads `state.streak`
// as if something, somewhere, already keeps it honest. Nothing did: `setStreak` existed but had
// no caller outside this file, so the count shown on Home/Aura/Profil/the share card never
// actually moved no matter how many real days a student came back. Fixed here, at the one place
// that already detects a day boundary for every other session field, rather than adding a second,
// separately-timed check elsewhere that could drift out of sync with this one.
export function ensureSession(s: AppState): Partial<AppState> {
  const today = new Date().toDateString();
codex/analyser-l-application-pour-ameliorer-l-education-f1gxx5
  if (s.sessionDate !== today) {
    return {
      sessionDate: today,
      sessionCardsReviewed: 0,
      sessionChaptersDone: 0,
      dailyGoalMet: false,
    };
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
=======
=======
  if (s.sessionDate === today) return {};

  const reset = { sessionDate: today, sessionCardsReviewed: 0, sessionChaptersDone: 0, dailyGoalMet: false };

  // `sessionDate` is a fresh install's own toDateString() (see INITIAL) or a real prior day —
  // never truly unparseable, but a defensive fallback for a corrupted/pre-migration localStorage
  // value costs nothing and avoids NaN ever reaching `streak`.
  const lastActive = new Date(s.sessionDate);
  if (Number.isNaN(lastActive.getTime())) return reset;

  const daysSinceLastActive = Math.round((new Date(today).getTime() - lastActive.getTime()) / DAY_MS);

  // Exactly one calendar day since the last real session: the normal nightly boundary every
  // returning student crosses. Anything wider (2+ days with zero activity) is a real gap a single
  // freeze was never meant to cover — the streak breaks regardless of freezeArmed, same as
  // Duolingo's own freeze only ever protecting one missed day, not an open-ended absence.
  if (daysSinceLastActive !== 1) {
    return { ...reset, streak: 0, freezeArmed: false };
main
  }

  if (s.dailyGoalMet) {
    // Met the goal yesterday. A freeze armed defensively for a day that turned out fine was
    // never actually spent — hand it back instead of quietly keeping it consumed.
    return s.freezeArmed
      ? { ...reset, streak: s.streak + 1, freezeArmed: false, freezes: s.freezes + 1 }
      : { ...reset, streak: s.streak + 1 };
  }

  if (s.freezeArmed) {
    // The miss it was armed for. Streak survives; the freeze itself was already spent the moment
    // it was armed (see toggleFreeze), so only the armed flag needs clearing here.
    return { ...reset, freezeArmed: false };
main
  }

  return { ...reset, streak: 0 };
}

// streak/xp were 5/340 here — demo-convenience values so testing didn't start from zero every
// reload, but they shipped as the real default for a genuine first launch: a brand-new user's
// very first screen claimed a 5-day streak they never earned. Onboarding's finish() only ever
// sets `user` fields, never these, so nothing downstream cleared them. `freezes: 2` stays as a
// real welcome gift (a resource handed to you, not a fabricated record of past use), same logic
// game onboarding flows use for starting currency.
const INITIAL: AppState = {
  // Temporarily skips straight to 'home' — onboarding itself isn't being worked on right now, no
  // need to click through it on every fresh session while iterating on the rest of the app.
  // OnboardingView and its route in App.tsx are untouched; flip this back to 'onboarding' (or add
  // a real "has the user finished onboarding before" check) when it's back in scope.
  view: "home",
  tab: "home",
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
  currentLessonMode: "vocal" as const,
  completedChapters: [],
  struggledChapters: [],
  chatBridgeMessage: null,
  lessonReturnTo: null,
  lastCompletion: null,
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
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
  }, []);

  const setStreak = useCallback((n: number) => {
    setState((s) => ({ ...s, ...ensureSession(s), streak: n }));
=======
main
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
      view: "subject",
      currentSubjectId: subjectId,
      currentChapterId: chapterId ?? null,
    }));
  }, []);

  const openLesson = useCallback(
    (subjectId: string, chapterId: string, mode?: "vocal" | "echanger") => {
      setState((s) => ({
        ...s,
        ...ensureSession(s),
        view: "lesson",
        currentSubjectId: subjectId,
        currentChapterId: chapterId,
        lastSubjectId: subjectId,
        lastChapterId: chapterId,
        currentLessonMode: mode ?? "vocal",
        chatBridgeMessage: null,
      }));
    },
    [],
  );

  const bridgeToChat = useCallback(
    (subjectId: string, chapterId: string, bridgeMessage: string, returnTo?: ViewId) => {
      setState((s) => ({
        ...s,
        ...ensureSession(s),
        view: "lesson",
        currentSubjectId: subjectId,
        currentChapterId: chapterId,
        currentLessonMode: "echanger",
        chatBridgeMessage: bridgeMessage,
        // "Revoir la notion" from a Réviser session comes back to the session, not to the
        // subject page it was never on.
        lessonReturnTo: returnTo ?? null,
      }));
    },
    [],
  );

  const completeChapter = useCallback((chapterId: string) => {
    setState((s) => {
      // Always derive the reward from today's counters. This matters if the first completion
      // happens after midnight while a previous session is still in local storage.
      const session = { ...s, ...ensureSession(s) };
      const already = session.completedChapters.includes(chapterId);
      const xpGained = already ? 0 : 50;
      const sessionChaptersDone = already
        ? session.sessionChaptersDone
        : session.sessionChaptersDone + 1;
      const activity = session.sessionCardsReviewed + sessionChaptersDone * 3;
      return {
        ...session,
        completedChapters: already
          ? session.completedChapters
          : [...session.completedChapters, chapterId],
        sessionChaptersDone,
        xp: session.xp + xpGained,
        dailyGoalMet: activity >= goalTarget(session),
        lastCompletion: { chapterId, wasNewCompletion: !already, xpGained },
      };
    });
  }, []);

  // The real signal behind resolveChapters()'s dynamic `reinforce` — called from LessonView's
  // Quiz on a wrong answer or an honest "Je ne sais pas", never on a correct one. Idempotent
  // (a second miss on the same chapter is still just one entry) for the same reason
  // completeChapter's `already` guard exists: this list is a fact ("this chapter had a real
  // miss"), not a counter, so it shouldn't grow with repeats.
  const flagStruggle = useCallback((chapterId: string) => {
    setState((s) => {
      const session = { ...s, ...ensureSession(s) };
      if (session.struggledChapters.includes(chapterId)) return session;
      return { ...session, struggledChapters: [...session.struggledChapters, chapterId] };
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
      const sessionCardsReviewed = session.sessionCardsReviewed + 1;
      // A wrong swipe-judgment (RevisionsView's only caller for 'not-sure') used to still grant
      // +3 XP here — invisible everywhere a student could see it: the "GRILLÉ" feedback line
      // never mentioned it, and BraiseRecap's own +XP total only ever summed correct answers.
      // The real account XP (this field) and the celebratory total shown at the end of a
      // session could silently drift apart by 3 XP per mistake with no explanation offered.
      const xpGain = confidence === "sure" ? 15 : confidence === "doubt" ? 8 : 0;
      const activity = sessionCardsReviewed + session.sessionChaptersDone * 3;
      void saveCardReview(cardId, updated);
      return {
        ...session,
        cardReviews: { ...session.cardReviews, [cardId]: updated },
        sessionCardsReviewed,
        xp: session.xp + xpGain,
        dailyGoalMet: activity >= goalTarget(session),
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
        setPersonality,
        addXp,
        updateBestCombo,
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
        flagStruggle,
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
