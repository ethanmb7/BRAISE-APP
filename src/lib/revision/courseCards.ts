// Réviser meets the Déclics. A few cards from the course decks are slipped into a Réviser session, never
// more than a handful, and only where the student had trouble: a card that tests the exact wrong idea
// they picked during a Déclic, a card they missed in a review, or a card of a Déclic that did not land
// yet. The rest of the session is the older deck, untouched. Everything here is pure (the registry and
// the progress are passed in), so it is tested without a screen.
import { isReviewDue } from "@/lib/course/review";
import type {
  ChapterDef,
  CourseProgress,
  DeclicDef,
  ReviewCardDef,
  ReviewDeckDef,
} from "@/lib/course/types";
import type { Flashcard } from "@/types";

/** At most this many course cards in a session (of about fifteen): enough to link the two methods,
 *  too few to crowd out the deck. */
export const MAX_COURSE_CARDS = 3;
/** At most this many from one Déclic, so one hard lesson does not take the whole dose. */
const MAX_PER_DECLIC = 2;
/** A card is slipped in from this score up. A card that is merely due, with nothing that went wrong,
 *  stays in its chapter's own review. */
const THRESHOLD = 1.5;

export type CourseSource = {
  chapters: ChapterDef[];
  declics: Map<string, DeclicDef>;
  decks: Map<string, ReviewDeckDef>;
};

export type Candidate = {
  chapter: ChapterDef;
  def: DeclicDef;
  deck: ReviewDeckDef;
  card: ReviewCardDef;
  score: number;
};

/** How much a review card calls for another look, from what went wrong. Zero means nothing did. */
export function struggleScore(
  def: DeclicDef,
  card: ReviewCardDef,
  progress: CourseProgress,
  now: number,
): number {
  const lesson = progress.declics[def.id];
  if (!lesson || lesson.completionStatus === "not_started") return 0;
  const state = progress.reviewCards[card.id];
  // Spaced repetition is respected: a card answered a short while ago waits for its day.
  if (state && !isReviewDue(state, now)) return 0;

  let score = 0;
  // The Déclic showed this exact wrong idea: the card tests it.
  if (card.misconceptionId && (progress.misconceptions[card.misconceptionId]?.count ?? 0) > 0)
    score += 3;
  if (state) {
    if (state.errorCount > 0) score += 1;
    if (state.revengePending) score += 2;
  }
  // The Déclic as a whole did not land yet.
  if (lesson.understandingStatus === "needs_reinforcement") score += 1.5;
  return score;
}

export function pickCourseCards(
  source: CourseSource,
  progress: CourseProgress,
  now: number,
  max = MAX_COURSE_CARDS,
): Candidate[] {
  const all: Candidate[] = [];
  for (const chapter of source.chapters) {
    for (const declicId of chapter.declicIds) {
      const def = source.declics.get(declicId);
      const deck = def ? source.decks.get(def.deckId) : undefined;
      if (!def || !deck) continue;
      for (const card of deck.cards) {
        const score = struggleScore(def, card, progress, now);
        if (score >= THRESHOLD) all.push({ chapter, def, deck, card, score });
      }
    }
  }
  // Most in need first; among equals, the one seen longest ago (or never).
  const seenAt = (c: Candidate) => progress.reviewCards[c.card.id]?.lastPresentedAt ?? 0;
  all.sort(
    (a, b) => b.score - a.score || seenAt(a) - seenAt(b) || a.card.id.localeCompare(b.card.id),
  );

  const perDeclic = new Map<string, number>();
  const picked: Candidate[] = [];
  for (const c of all) {
    if (picked.length >= max) break;
    const n = perDeclic.get(c.def.id) ?? 0;
    if (n >= MAX_PER_DECLIC) continue;
    perDeclic.set(c.def.id, n + 1);
    picked.push(c);
  }
  return picked;
}

const LEVEL = { 1: "easy", 2: "medium", 3: "hard" } as const;

/** A course card as Réviser reads a card. The claim is shown as the Déclic wrote it (an Intox card shows
 *  its false claim, and its correction is what is revealed after), so the Déclic's own explanation
 *  always fits what is on screen. */
export function courseCardToFlashcard(c: Candidate): Flashcard {
  const intox = c.card.answer === "intox";
  return {
    id: c.card.id,
    q: `Dans « ${c.def.title} » :`,
    a: intox ? (c.card.correction ?? c.card.statement) : c.card.statement,
    wrongA: intox ? c.card.statement : "",
    subject: c.chapter.subjectId,
    topic: c.def.title,
    chapterId: c.chapter.id,
    level: LEVEL[c.card.difficulty],
    course: {
      declicId: c.def.id,
      deckId: c.deck.id,
      answer: c.card.answer,
      feedbackCorrect: c.card.feedback.correct,
      feedbackIncorrect: c.card.feedback.incorrect,
    },
  };
}

/** Finds a course card by its id, to bring back a session that was left (see the saved snapshot). */
export function findCourseCard(id: string, source: CourseSource): Candidate | undefined {
  for (const chapter of source.chapters) {
    for (const declicId of chapter.declicIds) {
      const def = source.declics.get(declicId);
      const deck = def ? source.decks.get(def.deckId) : undefined;
      const card = deck?.cards.find((c) => c.id === id);
      if (def && deck && card) return { chapter, def, deck, card, score: 0 };
    }
  }
  return undefined;
}

/** Whether the claim shown on a card is true. A course card shows its claim as written; an older card
 *  shows its true or its false version by chance. */
export function claimIsTrue(card: Flashcard, random: () => number = Math.random): boolean {
  if (card.course) return card.course.answer === "carre";
  return random() < 0.5;
}

/** Slips the course cards among the others, spread out (never all at the start or the end). */
export function interleave<T>(deck: T[], extra: T[]): T[] {
  if (extra.length === 0) return deck;
  const total = deck.length + extra.length;
  const slots = new Set(extra.map((_, i) => Math.floor(((i + 1) * total) / (extra.length + 1))));
  const out: T[] = [];
  let d = 0;
  let e = 0;
  for (let i = 0; i < total; i++) {
    if (slots.has(i) && e < extra.length) out.push(extra[e++]);
    else if (d < deck.length) out.push(deck[d++]);
    else out.push(extra[e++]);
  }
  return out;
}
