// In-progress session snapshot so "Revoir la notion" (which leaves for the chapter's chat)
// comes back to the NEXT card with the streak, joker charge and totals intact, instead of
// remounting a brand-new deck at 1/15. sessionStorage, not localStorage: a session is a
// single sitting, it has no business surviving the tab.
const SESSION_SNAPSHOT_KEY = "sapie_rev_session";
const SESSION_SNAPSHOT_TTL = 30 * 60 * 1000;
export type SessionSnapshot = {
  cardIds: string[];
  index: number;
  combo: number;
  maxCombo: number;
  xpEarned: number;
  reviewed: number;
  wrongCount: number;
  jokerCharge: number;
  at: number;
};
export function readSnapshot(): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnapshot;
    if (Date.now() - snap.at > SESSION_SNAPSHOT_TTL) return null;
    return snap;
  } catch {
    return null;
  }
}
export function writeSnapshot(snap: SessionSnapshot | null) {
  try {
    if (snap) sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(snap));
    else sessionStorage.removeItem(SESSION_SNAPSHOT_KEY);
  } catch {
    // ignore quota/availability errors, same defensive pattern as lib/persist.ts
  }
}
