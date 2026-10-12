// A lived-in student for showing the app: three weeks in, a few chapters done in Maths, Français,
// SVT and Histoire-Géo, cards in every state of the spaced repetition, one Déclic finished and one
// started, and the kind of trouble that makes Réviser slip a Déclic card in. It is built from the real
// content (the flashcards and the course registry) and from "now", so it never describes a card or a
// Déclic that does not exist and its due dates are always relative to the day it is loaded.
import { FLASHCARDS } from "@/data";
import { PROGRESS_KEY, CARDS_KEY } from "@/lib/persist";
import { COURSE_PROGRESS_KEY } from "@/lib/course/progressStore";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import { emptyDeclicProgress } from "@/lib/course/engine";
import { computeUnlockedBadges } from "@/lib/progress";
import { getRankInfo } from "@/lib/aura";
import { SEEN_RANK_KEY, SEEN_BADGES_KEY } from "@/lib/celebrations";
import type {
  CourseProgress,
  DeclicProgress,
  MisconceptionCount,
  ReviewCardState,
} from "@/lib/course/types";
import type { CardReview } from "@/types";

const DAY = 86_400_000;

export const DEMO_NAME = "Léa";
/** Réviser's first-run explanations: a presentation should not open on them. */
export const REVISER_TUTORIAL_KEY = "sapie_rev_tutorial_seen";
export const REVISER_JOKER_KEY = "sapie_joker_seen";

/** The chapters the demo student has finished. */
const DONE_CHAPTERS = ["m1", "m2", "m3", "f1", "f2", "s1", "h1"];
const XP = 1500; // rank Or (from 1200); Platine starts at 2800

/** The state of the i-th card of the deck: mostly remembered, some due today, a few that keep
 *  slipping, the rest waiting for their day. A fixed pattern, so the demo is the same every time. */
function reviewOf(i: number, now: number): CardReview {
  const slot = i % 8;
  if (slot <= 3) {
    return {
      repetitions: 3 + (i % 2),
      interval: 8 + (i % 5) * 2,
      ease: 2.5 + (i % 3) * 0.1,
      nextReviewAt: now + (3 + (i % 7)) * DAY,
      lastConfidence: "sure",
    };
  }
  if (slot <= 5) {
    return {
      repetitions: 1,
      interval: 1,
      ease: 2.4,
      nextReviewAt: now - DAY,
      lastConfidence: "sure",
    };
  }
  if (slot === 6) {
    return {
      repetitions: 0,
      interval: 1,
      ease: 2.1,
      nextReviewAt: now - DAY,
      lastConfidence: "not-sure",
    };
  }
  return {
    repetitions: 2,
    interval: 4,
    ease: 2.5,
    nextReviewAt: now + 3 * DAY,
    lastConfidence: "sure",
  };
}

function cardReviews(now: number): Record<string, CardReview> {
  const out: Record<string, CardReview> = {};
  FLASHCARDS.filter((c) => DONE_CHAPTERS.includes(c.chapterId)).forEach((card, i) => {
    out[card.id] = reviewOf(i, now);
  });
  return out;
}

/** The first Déclic of the course finished (with two ideas that did not stick), the second one started. */
function courseProgress(now: number): CourseProgress {
  const declics: Record<string, DeclicProgress> = {};
  const reviewCards: Record<string, ReviewCardState> = {};
  const misconceptions: Record<string, MisconceptionCount> = {};

  const first = COURSE_REGISTRY.declics.get("M2-ARI-D01");
  if (first) {
    declics[first.id] = {
      ...emptyDeclicProgress(first, now - 6 * DAY),
      completionStatus: "completed",
      understandingStatus: "understood",
      completedAt: now - 5 * DAY,
      updatedAt: now - 5 * DAY,
    };
    const deck = COURSE_REGISTRY.decks.get(first.deckId);
    const cards = deck?.cards ?? [];
    const tricky = cards.filter((c) => c.misconceptionId).slice(0, 2);
    cards.slice(0, 3).forEach((card, i) => {
      const missed = tricky.some((t) => t.id === card.id) || i === 1;
      reviewCards[card.id] = {
        cardId: card.id,
        declicId: first.id,
        chapterId: first.chapterId,
        concept: card.concept ?? "",
        timesPresented: 2,
        successCount: missed ? 0 : 2,
        errorCount: missed ? 1 : 0,
        consecutiveDeferredSuccesses: 0,
        lastPresentedAt: now - 3 * DAY,
        lastResult: missed ? "incorrect" : "correct",
        revengePending: missed,
        review: missed
          ? {
              repetitions: 0,
              interval: 1,
              ease: 2.1,
              nextReviewAt: now - DAY,
              lastConfidence: "not-sure",
            }
          : {
              repetitions: 2,
              interval: 4,
              ease: 2.5,
              nextReviewAt: now + 2 * DAY,
              lastConfidence: "sure",
            },
      };
    });
    for (const card of tricky) {
      if (card.misconceptionId) {
        misconceptions[card.misconceptionId] = { count: 2, lastAt: now - 5 * DAY };
      }
    }
  }

  const second = COURSE_REGISTRY.declics.get("M2-ARI-D02");
  if (second) {
    declics[second.id] = {
      ...emptyDeclicProgress(second, now - 3_600_000),
      completionStatus: "in_progress",
      currentCardId: second.cards[Math.min(4, second.cards.length - 1)]?.id ?? null,
    };
  }

  return { version: 1, declics, reviewCards, misconceptions };
}

/** Everything the demo writes, as the strings the app keeps in storage (see BACKUP_KEYS and the
 *  Réviser first-run flags). Keys that are not here are cleared while the demo is on, so the student's
 *  own notifications settings and first-run flags do not leak into it. */
export function buildDemoData(now: number): Record<string, string> {
  const progress = {
    xp: XP,
    streak: 6,
    bestCombo: 11,
    freezes: 1,
    freezeArmed: false,
    everUsedFreeze: true,
    onboardingCompleted: true,
    dailyGoalMet: false,
    darkMode: false,
    dyslexiaMode: false,
    textSize: "normal",
    soundOn: false,
    user: {
      name: DEMO_NAME,
      level: "seconde",
      levelLabel: "Seconde",
      goal: "regulier",
      subjects: ["maths", "francais", "svt"],
      avatar: "flambe",
      personality: "chill",
      joinedAt: now - 21 * DAY,
    },
    completedChapters: DONE_CHAPTERS,
    lastSubjectId: "maths",
    lastChapterId: "m4",
    sessionDate: new Date(now).toDateString(),
    sessionXpEarned: 20,
    view: "home",
    tab: "home",
    currentSubjectId: null,
    currentChapterId: null,
  };

  // No celebration should replay on load: the rank and the badges are already "seen".
  const unlocked = Object.entries(
    computeUnlockedBadges({
      streak: progress.streak,
      xp: progress.xp,
      completedChapters: progress.completedChapters,
      everUsedFreeze: progress.everUsedFreeze,
    }),
  )
    .filter(([, isUnlocked]) => isUnlocked)
    .map(([id]) => id);

  return {
    [PROGRESS_KEY]: JSON.stringify(progress),
    [CARDS_KEY]: JSON.stringify(cardReviews(now)),
    [COURSE_PROGRESS_KEY]: JSON.stringify(courseProgress(now)),
    [SEEN_RANK_KEY]: getRankInfo(XP).current.id,
    [SEEN_BADGES_KEY]: JSON.stringify(unlocked),
    [REVISER_TUTORIAL_KEY]: "1",
    [REVISER_JOKER_KEY]: "1",
  };
}
