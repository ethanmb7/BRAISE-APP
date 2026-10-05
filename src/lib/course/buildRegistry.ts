// Builds the course registry from raw file contents. Pure and free of any bundler feature, so the
// same code runs in the app, in the tests and in `npm run course:check` under plain Node.
import { validateChapter } from "./validate.ts";
import type { ChapterDef, DeclicDef, ReviewDeckDef } from "./types.ts";

export type CourseRegistry = {
  chapters: ChapterDef[];
  declics: Map<string, DeclicDef>;
  decks: Map<string, ReviewDeckDef>;
  /** Chapters that failed validation are left out (and listed here) instead of reaching a student
   *  half-broken. `npm run course:check` and the tests fail on a non-empty list. */
  errors: string[];
};

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Builds the registry from raw file contents; tests feed it their own content too. */
export function buildRegistry(files: Record<string, unknown>): CourseRegistry {
  const chapters: ChapterDef[] = [];
  const allDeclics: DeclicDef[] = [];
  const allDecks: ReviewDeckDef[] = [];
  const errors: string[] = [];

  for (const [path, data] of Object.entries(files)) {
    if (!isObject(data)) errors.push(`${path}: le fichier n'est pas un objet JSON`);
    else if ("declicIds" in data) chapters.push(data as unknown as ChapterDef);
    else if ("assessment" in data) allDeclics.push(data as unknown as DeclicDef);
    else if ("declicId" in data && "cards" in data) allDecks.push(data as unknown as ReviewDeckDef);
    else errors.push(`${path}: fichier de cours non reconnu (ni chapitre, ni Déclic, ni deck)`);
  }

  const valid: ChapterDef[] = [];
  const declics = new Map<string, DeclicDef>();
  const decks = new Map<string, ReviewDeckDef>();
  for (const chapter of chapters) {
    const mine = allDeclics.filter((d) => d.chapterId === chapter.id);
    const myDecks = allDecks.filter((d) => d.chapterId === chapter.id);
    const problems = validateChapter(chapter, mine, myDecks);
    if (problems.length > 0) {
      errors.push(...problems.map((p) => `[${chapter.id}] ${p}`));
      continue;
    }
    valid.push(chapter);
    for (const d of mine) declics.set(d.id, d);
    for (const d of myDecks) decks.set(d.id, d);
  }
  for (const d of allDeclics) {
    if (!chapters.some((c) => c.id === d.chapterId)) {
      errors.push(`${d.id}: chapitre "${d.chapterId}" introuvable`);
    }
  }

  const byOrder = (a: ChapterDef, b: ChapterDef) => a.id.localeCompare(b.id);
  return { chapters: valid.sort(byOrder), declics, decks, errors };
}
