// The library of one subject: every course the student can open, from both content systems, as one
// list of the same shape. The older chapters (src/content/declic/*.txt, one Déclic and a handful of
// Réviser cards each) and the chapters of the official programme (src/content/courses/, several
// Déclics and a review deck each) are told apart in a single place, here, so the screen never has to
// know which is which.
//
// Nothing is stored: every state is derived from what the student really did (completed chapters,
// card reviews, course progress), like `chapterMastery` and `displayStatus` already are.
import { FLASHCARDS, SUBJECTS } from "@/data";
import { DECLIC_SCRIPTS } from "@/lib/declic";
import { MASTERED_AT_REPETITIONS, resolveChapters } from "@/lib/progress";
import { aggregateStatus, displayStatus, type DisplayStatus } from "@/lib/course/engine";
import { courseChaptersOfSubject, declicsOfChapter, getDeck } from "@/lib/course/registry";
import type { ChapterDef, CourseProgress } from "@/lib/course/types";
import type { CardReview } from "@/types";

/** One pastille of a course card. "warn" is a point that mixes up; "gold" is remembered for good. */
export type DotState = "empty" | "half" | "full" | "gold" | "warn";

export type EntrySource = "course" | "legacy";

export type LibraryEntry = {
  /** Unique across both systems ("course:M2-ARI", "legacy:m1"). */
  key: string;
  source: EntrySource;
  subjectId: string;
  /** What `openLesson` takes. */
  chapterId: string;
  /** The chapter's real name. */
  title: string;
  /** The non-scolaire line that leads the card when there is one; the real name then goes small. */
  hook?: string;
  /** "Seconde" for a chapter of the programme, "2nde" for the older bases. */
  levelLabel: string;
  minutes: number;
  status: DisplayStatus;
  dots: DotState[];
  /** Cards the student has already seen whose review date has come. */
  dueCount: number;
  /** Most recent activity, to resume the right thing; 0 if never touched. */
  updatedAt: number;
};

export type LibraryTheme = {
  id: string;
  label: string;
  /** A line under the label: what the theme is, from real data. */
  caption: string;
  official: boolean;
  entries: LibraryEntry[];
};

/** Why Braise points at one entry. */
export type ResumeReason = "resume" | "reinforce" | "review" | "next";

export type Resume = { entry: LibraryEntry; reason: ResumeReason };

export type LibraryCounts = {
  total: number;
  started: number;
  understood: number;
  mastered: number;
  needsWork: number;
};

export type Library = {
  subjectId: string;
  themes: LibraryTheme[];
  entries: LibraryEntry[];
  resume: Resume | null;
  counts: LibraryCounts;
};

export type LibraryState = {
  completedChapters: string[];
  cardReviews: Record<string, CardReview>;
  course: CourseProgress;
  now: number;
};

export const LEGACY_THEME_ID = "essentials";
export const LEGACY_THEME_LABEL = "Les essentiels de Braise";

const LEVEL_LABEL: Record<ChapterDef["level"], string> = {
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
};

const dueSeen = (review: CardReview | undefined, now: number): boolean =>
  !!review && review.nextReviewAt <= now;

function courseEntry(chapter: ChapterDef, state: LibraryState): LibraryEntry {
  const declics = declicsOfChapter(chapter);
  const statuses = declics.map((d) => displayStatus(state.course.declics[d.id]));
  const minutes = declics.reduce(
    (sum, d) =>
      sum + Math.max(1, Math.round((d.targetDurationSec[0] + d.targetDurationSec[1]) / 120)),
    0,
  );
  let dueCount = 0;
  for (const d of declics) {
    const deck = getDeck(d.deckId);
    if (!deck) continue;
    dueCount += deck.cards.filter((c) =>
      dueSeen(state.course.reviewCards[c.id]?.review, state.now),
    ).length;
  }
  const dots = statuses.map<DotState>((s) =>
    s === "mastered"
      ? "gold"
      : s === "understood"
        ? "full"
        : s === "needs_reinforcement"
          ? "warn"
          : s === "not_started"
            ? "empty"
            : "half",
  );
  const updatedAt = Math.max(0, ...declics.map((d) => state.course.declics[d.id]?.updatedAt ?? 0));
  return {
    key: `course:${chapter.id}`,
    source: "course",
    subjectId: chapter.subjectId,
    chapterId: chapter.id,
    title: chapter.title,
    hook: chapter.hook,
    levelLabel: LEVEL_LABEL[chapter.level],
    minutes,
    status: aggregateStatus(statuses),
    dots,
    dueCount,
    updatedAt,
  };
}

function legacyEntry(
  subjectId: string,
  chapter: { id: string; title: string; duration: number },
  done: boolean,
  state: LibraryState,
): LibraryEntry {
  const cards = FLASHCARDS.filter((c) => c.chapterId === chapter.id);
  let mastered = 0;
  let weak = 0;
  let seen = 0;
  let dueCount = 0;
  const cardDots: DotState[] = cards.map((c) => {
    const r = state.cardReviews[c.id];
    if (!r) return "empty";
    seen++;
    if (dueSeen(r, state.now)) dueCount++;
    if (r.lastConfidence === "not-sure") {
      weak++;
      return "warn";
    }
    if (r.repetitions >= MASTERED_AT_REPETITIONS) {
      mastered++;
      return "gold";
    }
    return "half";
  });

  let status: DisplayStatus = "not_started";
  if (done) {
    if (weak > 0) status = "needs_reinforcement";
    else if (cards.length > 0 && mastered === cards.length) status = "mastered";
    else if (seen > 0) status = "understood";
    else status = "discovered";
  }

  return {
    key: `legacy:${chapter.id}`,
    source: "legacy",
    subjectId,
    chapterId: chapter.id,
    title: chapter.title,
    hook: DECLIC_SCRIPTS[chapter.id]?.hook,
    levelLabel: "2nde",
    minutes: chapter.duration,
    status,
    dots: [done ? "full" : "empty", ...cardDots],
    dueCount,
    // Real chapters carry no timestamp of their own: the first one not yet done is the suggestion,
    // which `resume` takes care of, so "never touched" is the honest value here.
    updatedAt: 0,
  };
}

/** Which entry Braise points at, in order: something started and not finished, a point that mixes
 *  up, a review that has come due, then the next thing to discover. Null when everything is
 *  remembered for good. */
export function pickResume(entries: LibraryEntry[], suggestedKey: string | null): Resume | null {
  const inProgress = entries
    .filter((e) => e.status === "in_progress")
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  if (inProgress) return { entry: inProgress, reason: "resume" };

  const reinforce = entries.find((e) => e.status === "needs_reinforcement");
  if (reinforce) return { entry: reinforce, reason: "reinforce" };

  const review = entries.filter((e) => e.dueCount > 0).sort((a, b) => b.dueCount - a.dueCount)[0];
  if (review) return { entry: review, reason: "review" };

  const suggested = suggestedKey ? entries.find((e) => e.key === suggestedKey) : undefined;
  const next =
    suggested && suggested.status === "not_started"
      ? suggested
      : entries.find((e) => e.status === "not_started");
  return next ? { entry: next, reason: "next" } : null;
}

export function buildLibrary(subjectId: string, state: LibraryState): Library | null {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) return null;

  // Chapters of the official programme first, grouped by the theme the programme itself gives
  // them; then the older chapters, which are not tied to one programme theme.
  const themes: LibraryTheme[] = [];
  for (const chapter of courseChaptersOfSubject(subjectId)) {
    const label = chapter.source.path[1] ?? "Programme officiel";
    let theme = themes.find((t) => t.official && t.label === label);
    if (!theme) {
      theme = {
        id: `programme:${label}`,
        label,
        caption: "Programme officiel",
        official: true,
        entries: [],
      };
      themes.push(theme);
    }
    theme.entries.push(courseEntry(chapter, state));
  }

  const resolved = resolveChapters(subject.chapters, state.completedChapters);
  const legacy = resolved.map((c) => legacyEntry(subjectId, c, c.status === "done", state));
  if (legacy.length > 0) {
    const mins = legacy.map((e) => e.minutes);
    const lo = Math.min(...mins);
    const hi = Math.max(...mins);
    themes.push({
      id: LEGACY_THEME_ID,
      label: LEGACY_THEME_LABEL,
      caption: lo === hi ? `Un Déclic de ${lo} min chacun` : `Des Déclics de ${lo} à ${hi} min`,
      official: false,
      entries: legacy,
    });
  }

  const entries = themes.flatMap((t) => t.entries);
  const current = resolved.find((c) => c.status === "current");
  const counts: LibraryCounts = {
    total: entries.length,
    started: entries.filter((e) => e.status !== "not_started").length,
    understood: entries.filter((e) => e.status === "understood" || e.status === "mastered").length,
    mastered: entries.filter((e) => e.status === "mastered").length,
    needsWork: entries.filter((e) => e.status === "needs_reinforcement").length,
  };

  return {
    subjectId,
    themes,
    entries,
    resume: pickResume(entries, current ? `legacy:${current.id}` : null),
    counts,
  };
}
