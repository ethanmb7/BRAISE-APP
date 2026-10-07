// Which subject Braise points at first, from the libraries of every subject. The same ladder as inside
// a subject (something started, a point that mixes up, a review coming due, then something new),
// compared across subjects; the subject the student was last in wins a tie, then the usual order.
import type { Library, Resume, ResumeReason } from "@/lib/catalog/catalog";

const RANK: Record<ResumeReason, number> = { resume: 0, reinforce: 1, review: 2, next: 3 };

export type GlobalResume = { subjectId: string; resume: Resume };

export function pickGlobalResume(
  libraries: Library[],
  lastSubjectId: string | null,
): GlobalResume | null {
  let best: GlobalResume | null = null;
  for (const lib of libraries) {
    if (!lib.resume) continue;
    const candidate: GlobalResume = { subjectId: lib.subjectId, resume: lib.resume };
    if (!best) {
      best = candidate;
      continue;
    }
    const a = RANK[candidate.resume.reason];
    const b = RANK[best.resume.reason];
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

/** The verb on the button for a suggestion. */
export function verbFor({ entry, reason }: Resume): string {
  if (reason === "resume") return "Reprendre";
  if (reason === "reinforce") return "Renforcer";
  if (reason === "review") return "Réviser";
  return entry.status === "not_started" ? "Commencer" : "Continuer";
}
