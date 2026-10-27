// "Déjà vu en cours ? Teste-toi d'abord": the island card of a chapter can start a Réviser series made of
// that chapter's own cards, before any lesson. The method's second door (see the method sheet): try to
// find it again without help first; Braise only explains again where it did not come back.
//
// The request travels from the map to Réviser as a plain in-memory note, not as saved progress: a series
// is one sitting, and nothing about it needs to survive a reload. Everything else here is pure so it is
// tested without a screen.
import { FLASHCARDS } from "@/data";
import { courseCardToFlashcard, type CourseSource } from "@/lib/revision/courseCards";
import type { Flashcard } from "@/types";

/** A short series: the chapter's cards, never a whole library. */
export const THEME_SESSION_SIZE = 10;

export type ThemeRequest = {
  subjectId: string;
  chapterId: string;
  /** The chapter's real name, named on the first card of the series. */
  title: string;
};

let pending: ThemeRequest | null = null;

export function requestTheme(request: ThemeRequest) {
  pending = request;
}

/** Read without consuming it: React may run a state initialiser twice. */
export function peekThemeRequest(): ThemeRequest | null {
  return pending;
}

export function clearThemeRequest() {
  pending = null;
}

const LEVEL_ORDER = { easy: 0, medium: 1, hard: 2 } as const;

/** The cards of one chapter, from both content systems. Random inside each level, easy ones first: a
 *  series that starts with what the student can find again is the one they carry on with (the first card
 *  is never the hardest one). */
export function themeDeck(
  chapterId: string,
  source: CourseSource,
  random: () => number = Math.random,
  flashcards: Flashcard[] = FLASHCARDS,
  size = THEME_SESSION_SIZE,
): Flashcard[] {
  const older = flashcards.filter((c) => c.chapterId === chapterId);
  const fromCourse: Flashcard[] = [];
  for (const chapter of source.chapters) {
    if (chapter.id !== chapterId) continue;
    for (const declicId of chapter.declicIds) {
      const def = source.declics.get(declicId);
      const deck = def ? source.decks.get(def.deckId) : undefined;
      if (!def || !deck) continue;
      for (const card of deck.cards) {
        fromCourse.push(courseCardToFlashcard({ chapter, def, deck, card, score: 0 }));
      }
    }
  }
  const all = [...older, ...fromCourse];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  // A stable sort keeps the shuffle inside each level.
  return all.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]).slice(0, size);
}
