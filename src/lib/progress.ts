import type { AppState, CardReview, Chapter, Confidence, TabId, ViewId } from "@/types";
import { SUBJECTS } from "@/data";

// Pure progress logic — daily goal, chapter unlocking, badges, the day boundary (streak), spaced
// repetition and view restoration. No React here: AppProvider in store.tsx wires these into state,
// and tests can exercise them directly.

const DAY_MS = 24 * 60 * 60 * 1000;
const GOAL_TARGETS: Record<string, number> = {
  tranquille: 6,
  regulier: 10,
  "a-fond": 18,
  // Labels saved by the old onboarding, kept so existing students keep the same daily target.
  "15 min/jour": 6,
  "30 min/jour": 10,
  "1 heure/jour": 18,
};
const DEFAULT_GOAL_TARGET = 10;

export function goalTarget(s: AppState): number {
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
 */
export function resolveChapters(chapters: Chapter[], completedChapters: string[]): Chapter[] {
  const firstOpenIndex = chapters.findIndex((c) => !completedChapters.includes(c.id));
  return chapters.map((c, i) => {
    if (completedChapters.includes(c.id)) return { ...c, status: "done", mastery: 100 };
    if (i === firstOpenIndex) return { ...c, status: "current", mastery: 0 };
    return { ...c, status: "locked", mastery: 0 };
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
  s: Pick<AppState, "streak" | "xp" | "everUsedFreeze" | "completedChapters">,
): Record<string, boolean> {
  const chaptersDone = countDoneChapters(s.completedChapters);
  return {
    b1: s.streak >= 3,
    b2: s.xp >= 100,
    b3: chaptersDone >= 1,
    // Was `freezeArmed || freezes < 2` — both live, both flip back to false the moment a freeze
    // gets disarmed or refunded (see ensureSession), so un-arming made an already-earned badge
    // vanish and re-arming later re-triggered the same "unlocked!" celebration for it. This field
    // only ever goes true once, at the one real moment a freeze actually absorbed a missed day.
    b4: s.everUsedFreeze,
    b5: s.streak >= 7,
    b6: s.xp >= 1000,
  };
}

/** A reload used to always land back on 'home', even mid-lesson, because the saved view was never
 *  validated against real content — restoring a stale/renamed subject or chapter id blindly would
 *  hand LessonView/SubjectView an id that resolves to nothing, and both just render null: a blank
 *  screen forever, worse than the reset it replaces. Only 'lesson'/'subject' need this check —
 *  every other resumable view is self-contained and doesn't reference content by id. */
export function resolveRestoredView(saved: Partial<AppState>): ViewId {
  // A reload mid-onboarding restarts it rather than dropping a half-set-up student on Home.
  if (saved.onboardingCompleted === false) return "onboarding";
  const view = saved.view;
  if (view === "lesson" || view === "subject") {
    const subject = SUBJECTS.find((s) => s.id === saved.currentSubjectId);
    if (!subject) return "home";
    if (view === "lesson" && !subject.chapters.find((c) => c.id === saved.currentChapterId))
      return "home";
    return view;
  }
  if (
    view === "subjects" ||
    view === "revisions" ||
    view === "progres" ||
    view === "profile" ||
    view === "settings"
  )
    return view;
  return "home";
}

// `tab` drives the bottom nav highlight independently of `view` (SubjectView/SettingsView both
// use it to know which tab "back" returns to — see goBack below), so it needs restoring too, not
// just `view` — otherwise resuming into e.g. Revisions would show the right screen with the wrong
// tab lit up, and a subsequent "back" from Subject/Settings would return to the wrong place.
const TAB_IDS: readonly TabId[] = ["home", "subjects", "revisions", "progres", "profile"];
const isTab = (v: string | undefined): v is TabId => TAB_IDS.includes(v as TabId);

// Aura ('progres') is its own tab again — it used to be folded into Moi, and this used to send
// it there, lighting up the wrong tab after a reload on Aura.
export function resolveRestoredTab(view: ViewId, savedTab: TabId | undefined): TabId {
  if (isTab(view)) return view;
  if (isTab(savedTab)) return savedTab;
  return "home";
}

// A card counts as mastered once it's cleared the SM-2 learning phase (recalled correctly at
// least twice in a row) — the one signal the whole XP economy and Aura's mastery display both
// key off, so a review's real value and its "acquise" badge always agree with each other.
export const MASTERED_AT_REPETITIONS = 2;

// The one place every XP amount in the app is defined — everywhere else imports these instead
// of writing its own number, so there is exactly one number to change if the economy is ever
// retuned, and no risk of two call sites silently drifting apart (see git history: the "Super
// Braise" bonus in RevisionsView used to hardcode its own copy of the base reward). Reviewing a
// card you're still learning pays full price; reviewing one you've already mastered pays half —
// real, but not worth restarting a session over, so replaying known cards for repeated full XP
// stops being profitable without a hard cap or cooldown getting in a genuine study session's way.
export const XP_REWARDS = {
  REVIEW_LEARNING: 10,
  REVIEW_MASTERED: 5,
  CHAPTER_COMPLETE: 50,
} as const;

export function sm2(review: CardReview | undefined, confidence: Confidence): CardReview {
  const now = Date.now();
  const quality = confidence === "sure" ? 5 : 1;

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
  if (s.sessionDate === today) return {};

  const reset = {
    sessionDate: today,
    sessionCardsReviewed: 0,
    sessionChaptersDone: 0,
    dailyGoalMet: false,
  };

  // `sessionDate` is a fresh install's own toDateString() (see INITIAL) or a real prior day —
  // never truly unparseable, but a defensive fallback for a corrupted/pre-migration localStorage
  // value costs nothing and avoids NaN ever reaching `streak`.
  const lastActive = new Date(s.sessionDate);
  if (Number.isNaN(lastActive.getTime())) return reset;

  const daysSinceLastActive = Math.round(
    (new Date(today).getTime() - lastActive.getTime()) / DAY_MS,
  );

  // Exactly one calendar day since the last real session: the normal nightly boundary every
  // returning student crosses. Anything wider (2+ days with zero activity) is a real gap a single
  // freeze was never meant to cover — the streak breaks regardless of freezeArmed, same as
  // Duolingo's own freeze only ever protecting one missed day, not an open-ended absence.
  if (daysSinceLastActive !== 1) {
    return { ...reset, streak: 0, freezeArmed: false };
  }

  if (s.dailyGoalMet) {
    // Met the goal yesterday. A freeze armed defensively for a day that turned out fine was
    // never actually spent — hand it back instead of quietly keeping it consumed.
    return s.freezeArmed
      ? { ...reset, streak: s.streak + 1, freezeArmed: false, freezes: s.freezes + 1 }
      : { ...reset, streak: s.streak + 1 };
  }

  if (s.freezeArmed) {
    // The miss it was armed for — the freeze just genuinely did its job. Streak survives; the
    // freeze itself was already spent the moment it was armed (see toggleFreeze), so only the
    // armed flag needs clearing here. `everUsedFreeze` flips once, permanently: this is the one
    // real "Gel utilisé" moment, never just arming/disarming one experimentally.
    return { ...reset, freezeArmed: false, everUsedFreeze: true };
  }

  return { ...reset, streak: 0 };
}
