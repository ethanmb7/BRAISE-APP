// The cards of the course decks, seen the way Aura and the share card see cards: an id, a subject, a topic,
// and a schedule once the student has met them. Pure: the course content and the progress are passed in.
import type { CardReview } from "@/types";
import type { CourseSource } from "@/lib/revision/courseCards";
import type { CourseProgress } from "./types";

export type MasteryCard = { id: string; subject: string; topic: string };

/** Every course review card, and the schedule of those the student has met. */
export type CourseMastery = { cards: MasteryCard[]; reviews: Record<string, CardReview> };

export const NO_COURSE_MASTERY: CourseMastery = { cards: [], reviews: {} };

export function courseMastery(source: CourseSource, progress: CourseProgress): CourseMastery {
  const cards: MasteryCard[] = [];
  const reviews: Record<string, CardReview> = {};
  for (const chapter of source.chapters) {
    for (const declicId of chapter.declicIds) {
      const def = source.declics.get(declicId);
      const deck = def ? source.decks.get(def.deckId) : undefined;
      if (!def || !deck) continue;
      for (const card of deck.cards) {
        cards.push({ id: card.id, subject: chapter.subjectId, topic: def.title });
        const review = progress.reviewCards[card.id]?.review;
        if (review) reviews[card.id] = review;
      }
    }
  }
  return { cards, reviews };
}
