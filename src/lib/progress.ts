import type { AppState, CardReview, Chapter, Confidence, TabId, ViewId } from "@/types";
import { FLASHCARDS, SUBJECTS } from "@/data";

// Pure progress logic — daily goal, chapter unlocking, badges, the day boundary (streak), spaced
// repetition and view restoration. No React here: AppProvider in store.tsx wires these into state,
// and tests can exercise them directly.

const DAY_MS = 24 * 60 * 60 * 1000;
// In real XP — the same unit as the header badge, Aura and everything else, not a separately
// invented "card-equivalent" scale. Same relative spacing as before (6:10:18), just multiplied
// by XP_REWARDS.REVIEW_LEARNING so "tranquille" still means roughly a handful of cards and
// "a-fond" still means substantially more, but the number a student sees here is now the exact
// same number that shows up on the header a moment later — no mental conversion between two
// systems that used to weight a finished chapter differently (3x a card here, 5x a card in XP).
const GOAL_TARGETS: Record<string, number> = {
  tranquille: 60,
  regulier: 100,
  "a-fond": 180,
  // Labels saved by the old onboarding, kept so existing students keep the same daily target.
  "15 min/jour": 60,
  "30 min/jour": 100,
  "1 heure/jour": 180,
};
const DEFAULT_GOAL_TARGET = 100;

export function goalTarget(s: AppState): number {
  return GOAL_TARGETS[s.user.goal] ?? DEFAULT_GOAL_TARGET;
}

export function computeGoalPct(s: AppState): number {
  return Math.min(100, Math.round((s.sessionXpEarned / goalTarget(s)) * 100));
}

/** Real XP remaining to hit today's goal — 0 once it's already met. */
export function remainingToGoal(s: AppState): number {
  return Math.max(0, goalTarget(s) - s.sessionXpEarned);
}

/** Real chapter progression, derived from `completedChapters` — the one dynamic signal the app
 *  actually tracks. `data.ts` only ships a fresh-install baseline; this recomputes status from
 *  real completion every render, so finishing a chapter moves the "suggested next" marker
 *  everywhere. Without this, `status` in data.ts never changes and every subject stays pointed
 *  at its first chapter forever — the same "static field never reflects real progress" bug the
 *  streak/XP fix addressed, just one level deeper.
 *
 *  Nothing is ever locked: the first unfinished chapter is "current" (the suggestion), every
 *  other unfinished one is "open". A student revising for tomorrow's contrôle on Pythagore, or a
 *  Terminale student who already knows fractions, must not have to grind through the chapters in
 *  front of it — and the Matières tab promises "choisis ce que tu veux comprendre".
 *
 *  Completion is the only thing this decides — how well a chapter is actually known is
 *  `chapterMastery`'s job, from real card-review history, never a number stored here.
 */
export function resolveChapters(chapters: Chapter[], completedChapters: string[]): Chapter[] {
  const firstOpenIndex = chapters.findIndex((c) => !completedChapters.includes(c.id));
  return chapters.map((c, i) => {
    if (completedChapters.includes(c.id)) return { ...c, status: "done" };
    if (i === firstOpenIndex) return { ...c, status: "current" };
    return { ...c, status: "open" };
  });
}

export type ChapterMastery = {
  /** Flashcards that drill this chapter. */
  total: number;
  /** Of those, how many cleared the SM-2 learning phase (see MASTERED_AT_REPETITIONS). */
  mastered: number;
  /** Of those, how many were last judged wrong — a real, current weak spot, not a hand-set flag. */
  weak: number;
};

/** What a student actually knows of one chapter, from their real card-review history. Used to
 *  replace a "100% de maîtrise" that just meant "finished once" (whatever the score) and an
 *  "À renforcer" badge hardcoded onto three chapters regardless of how anyone had done. */
export function chapterMastery(
  chapterId: string,
  cardReviews: Record<string, CardReview>,
): ChapterMastery {
  const cards = FLASHCARDS.filter((c) => c.chapterId === chapterId);
  let mastered = 0;
  let weak = 0;
  for (const c of cards) {
    const r = cardReviews[c.id];
    if (!r) continue;
    if (r.repetitions >= MASTERED_AT_REPETITIONS) mastered++;
    if (r.lastConfidence === "not-sure") weak++;
  }
  return { total: cards.length, mastered, weak };
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

/** A review that comes before the card is due. Spaced repetition only works if the gaps are
 *  respected: answering the same card again an hour later says nothing about whether it will be
 *  remembered next week, so it is practice, not evidence. */
export function isEarlyReview(review: CardReview | undefined, now = Date.now()): boolean {
  return !!review && now < review.nextReviewAt;
}

/** What a correct answer pays for this exact card — one rule shared by the store (what is
 *  granted) and Réviser (what the buttons promise). Full price only for a card that is new or
 *  due; half price for one already mastered, or answered again before it was due. */
export function reviewReward(review: CardReview | undefined, now = Date.now()): number {
  const mastered = !!review && review.repetitions >= MASTERED_AT_REPETITIONS;
  return mastered || isEarlyReview(review, now)
    ? XP_REWARDS.REVIEW_MASTERED
    : XP_REWARDS.REVIEW_LEARNING;
}

export function sm2(
  review: CardReview | undefined,
  confidence: Confidence,
  now = Date.now(),
): CardReview {
  const quality = confidence === "sure" ? 5 : 1;

  // A correct answer before the card is due earns no repetition credit and leaves the schedule
  // alone. Without this, answering a card correctly twice in the same sitting made it "acquise"
  // — a status that is supposed to mean "remembered on a later day". A wrong answer still
  // resets the card, early or not: forgetting is information whenever it shows up.
  if (quality >= 3 && review && isEarlyReview(review, now)) {
    return { ...review, lastConfidence: confidence };
  }

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
    sessionXpEarned: 0,
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
