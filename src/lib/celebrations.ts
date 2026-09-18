// Tiny localStorage bookkeeping so a rank-up or badge unlock is only celebrated once, the first
// time it becomes true — same lightweight pattern as getDeviceId()/getDeviceSecret() in
// supabase.ts, not routed through the full AppState/persist.ts pipeline since this is purely a
// "have we already shown this?" flag, not real progress data.
const SEEN_RANK_KEY = 'sapie_seen_rank';
const SEEN_BADGES_KEY = 'sapie_seen_badges';

export function getSeenRank(): string | null {
  try {
    return localStorage.getItem(SEEN_RANK_KEY);
  } catch {
    return null;
  }
}

export function setSeenRank(rankId: string): void {
  try {
    localStorage.setItem(SEEN_RANK_KEY, rankId);
  } catch {
    /* ignore quota errors */
  }
}

export function getSeenBadgeIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_BADGES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// An empty array from getSeenBadgeIds() is ambiguous on its own — "never checked before" and
// "checked once, nothing unlocked yet" look identical. This disambiguates them, so the first-ever
// check can baseline silently instead of celebrating every badge a returning user already earned.
export function hasBaselinedBadges(): boolean {
  try {
    return localStorage.getItem(SEEN_BADGES_KEY) !== null;
  } catch {
    return false;
  }
}

export function setSeenBadgeIds(ids: string[]): void {
  try {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota errors */
  }
}
