// Which subject Braise points at first, from the libraries of every subject. The same ladder as inside
// a subject (see `resumeRank`: a Déclic touched in the last two days, a review coming due, a point that
// mixes up, an older Déclic, then something new), compared across subjects; the subject the student was
// last in wins a tie, then the usual order. When the student said something matters soon in a subject (see
// soon.ts), Braise leans on that subject first, if it has anything to offer.
import { resumeRank, type Library, type Resume } from "@/lib/catalog/catalog";

export type GlobalResume = { subjectId: string; resume: Resume };

export function pickGlobalResume(
  libraries: Library[],
  lastSubjectId: string | null,
  focusSubjectId: string | null = null,
): GlobalResume | null {
  const focused = libraries.find((lib) => lib.subjectId === focusSubjectId);
  if (focused?.resume) return { subjectId: focused.subjectId, resume: focused.resume };
  let best: GlobalResume | null = null;
  for (const lib of libraries) {
    if (!lib.resume) continue;
    const candidate: GlobalResume = { subjectId: lib.subjectId, resume: lib.resume };
    if (!best) {
      best = candidate;
      continue;
    }
    const a = resumeRank(candidate.resume);
    const b = resumeRank(best.resume);
    if (
      a < b ||
      (a === b && candidate.subjectId === lastSubjectId && best.subjectId !== lastSubjectId)
    ) {
      best = candidate;
    }
  }
  return best;
}

/** Cards waiting for a refresh across a whole subject: what the pastille on a world counts. */
export function dueInLibrary(library: Library): number {
  return library.entries.reduce((sum, e) => sum + e.dueCount, 0);
}

/** The verb for a suggestion. It says what really happens: the chapter opens. "Réviser" is not used: it
 *  is the name of a tab, where the cards are swiped (one word, one meaning). */
export function verbFor({ entry, reason }: Resume): string {
  if (reason === "resume") return "Reprendre";
  if (reason === "reinforce") return "Renforcer";
  if (reason === "review") return "Retrouver";
  return entry.status === "not_started" ? "Commencer" : "Continuer";
}
