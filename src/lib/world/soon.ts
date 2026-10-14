// "Un truc important bientôt ?": the student tells Braise, in one tap, that something matters soon in a
// subject (a test, an oral). Braise then leans on that subject (the Pioche picks from it, Réviser draws
// more of its cards) until the day has passed. Nothing is shown as a countdown and nothing is urgent: the
// date only decides what Braise puts forward. Kept on the device, like the rest of the progress.

const DAY_MS = 24 * 60 * 60 * 1000;

export type SoonChoice = { id: "demain" | "semaine" | "prochaine"; label: string; days: number };

/** Three taps, no calendar: the exact day does not matter for what Braise does with it. */
export const SOON_CHOICES: SoonChoice[] = [
  { id: "demain", label: "Demain", days: 1 },
  { id: "semaine", label: "Cette semaine", days: 4 },
  { id: "prochaine", label: "La semaine prochaine", days: 10 },
];

/** subject id -> the moment the thing happens. */
export type SoonBy = Record<string, number>;

/** What still counts: a day after it happened it is forgotten, so nothing lingers and nobody has to clear it. */
export function activeSoon(soonBy: SoonBy | undefined, now: number): SoonBy {
  const active: SoonBy = {};
  for (const [subjectId, at] of Object.entries(soonBy ?? {})) {
    if (at + DAY_MS > now) active[subjectId] = at;
  }
  return active;
}

/** The subject whose date comes first, if any: the one Braise leans on. */
export function focusSubjectId(soonBy: SoonBy | undefined, now: number): string | null {
  const entries = Object.entries(activeSoon(soonBy, now));
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

export function soonAt(choice: SoonChoice, now: number): number {
  return now + choice.days * DAY_MS;
}
