// Turns the app's state into what the planner reads. Pure: the cards, the course content and the progress
// are passed in, so it is tested with the real content.
import type { CourseSource } from "@/lib/revision/courseCards";
import type { CourseProgress } from "@/lib/course/types";
import type { CardReview, Flashcard, Personality } from "@/types";
import type { DeclicDone, DueItem, NotifPrefs, PlannerInput, SentRecord } from "./model";

export function buildPlannerInput(args: {
  now: number;
  prefs: NotifPrefs;
  tone: Personality;
  name: string;
  opens: number[];
  history: SentRecord[];
  flashcards: Flashcard[];
  cardReviews: Record<string, CardReview>;
  course: CourseProgress;
  source: CourseSource;
}): PlannerInput {
  const due: DueItem[] = [];

  // The older deck: a card with a schedule comes back on its date.
  for (const card of args.flashcards) {
    const r = args.cardReviews[card.id];
    if (r) due.push({ at: r.nextReviewAt, label: card.topic, subjectId: card.subject });
  }

  const declics: DeclicDone[] = [];
  for (const chapter of args.source.chapters) {
    for (const declicId of chapter.declicIds) {
      const def = args.source.declics.get(declicId);
      const deck = def ? args.source.decks.get(def.deckId) : undefined;
      if (!def || !deck) continue;
      // The course decks: a card that has been shown comes back on its date.
      for (const card of deck.cards) {
        const review = args.course.reviewCards[card.id]?.review;
        if (review)
          due.push({ at: review.nextReviewAt, label: def.title, subjectId: chapter.subjectId });
      }
      // A finished Déclic whose cards have not been seen yet gets its follow-up.
      const progress = args.course.declics[def.id];
      if (progress?.completionStatus === "completed" && progress.completedAt) {
        declics.push({
          id: def.id,
          title: def.title,
          chapterId: chapter.id,
          subjectId: chapter.subjectId,
          completedAt: progress.completedAt,
          cardCount: deck.cards.length,
          reviewed: deck.cards.some((c) => !!args.course.reviewCards[c.id]),
        });
      }
    }
  }

  return {
    now: args.now,
    prefs: args.prefs,
    tone: args.tone,
    name: args.name,
    opens: args.opens,
    due,
    declics,
    history: args.history,
  };
}
