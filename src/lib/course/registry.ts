// Loads the course content — every JSON file under src/content/courses/ — and indexes it. Adding a
// chapter, a Déclic or a deck is dropping a file in that folder; nothing here lists them by name.
//
// The three kinds of file are told apart by their shape, not their name: a chapter has `declicIds`,
// a Déclic has an `assessment`, a deck has a `declicId` and `cards` but no assessment.
import { buildRegistry, type CourseRegistry } from "./buildRegistry";
import type { ChapterDef, DeclicDef, ReviewDeckDef } from "./types";

export { buildRegistry, type CourseRegistry };

const FILES = import.meta.glob("../../content/courses/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

export const COURSE_REGISTRY: CourseRegistry = buildRegistry(FILES);

if (COURSE_REGISTRY.errors.length > 0) {
  console.error("[course] contenu ignoré :\n" + COURSE_REGISTRY.errors.join("\n"));
}

export function getCourseChapter(id: string | null | undefined): ChapterDef | undefined {
  return COURSE_REGISTRY.chapters.find((c) => c.id === id);
}

export function isCourseChapterId(id: string | null | undefined): boolean {
  return !!getCourseChapter(id);
}

export function courseChaptersOfSubject(subjectId: string): ChapterDef[] {
  return COURSE_REGISTRY.chapters.filter((c) => c.subjectId === subjectId);
}

export function getDeclic(id: string): DeclicDef | undefined {
  return COURSE_REGISTRY.declics.get(id);
}

export function declicsOfChapter(chapter: ChapterDef): DeclicDef[] {
  return chapter.declicIds
    .map((id) => COURSE_REGISTRY.declics.get(id))
    .filter((d): d is DeclicDef => !!d);
}

export function getDeck(id: string): ReviewDeckDef | undefined {
  return COURSE_REGISTRY.decks.get(id);
}
