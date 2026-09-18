// Plain direct localStorage log, same lightweight pattern as celebrations.ts — a report is a
// one-way "flag this for later" note, not account progress, so it has no reason to round-trip
// through the typed, debounced persist.ts pipeline. This is what makes the flashcard "Signaler
// un problème" button real: before this, tapping it only flipped a local component flag that
// reset on the next card, so no report ever survived past the moment it was made.
const REPORTS_KEY = 'sapie_card_reports';

export type CardReport = { cardId: string; question: string; at: number };

export function reportCard(cardId: string, question: string): void {
  try {
    const list = getCardReports();
    if (list.some((r) => r.cardId === cardId)) return;
    list.push({ cardId, question, at: Date.now() });
    localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  } catch {
    // ignore quota/availability errors, same defensive pattern as lib/persist.ts
  }
}

export function getCardReports(): CardReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
