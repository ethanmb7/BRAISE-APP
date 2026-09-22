// Tiny localStorage bookkeeping so a rank-up or badge unlock is only celebrated once, the first
// time it becomes true — same lightweight pattern as getDeviceId()/getDeviceSecret() in
// supabase.ts, not routed through the full AppState/persist.ts pipeline since this is purely a
// "have we already shown this?" flag, not real progress data.
const SEEN_RANK_KEY = 'sapie_seen_rank';
const SEEN_BADGES_KEY = 'sapie_seen_badges';
const BADGE_UNLOCKED_AT_KEY = 'sapie_badge_unlocked_at';
const INTOX_DISMISSED_COUNT_KEY = 'sapie_intox_dismissed_count';
const LAST_PIOCHE_OPEN_KEY = 'sapie_last_pioche_open';

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

// Real unlock dates, recorded only from here on — nothing timestamps *past* unlocks, so a badge
// already earned before this existed stays dateless rather than getting a fabricated "unlocked
// today". Written once, at the same moment a badge is first detected as newly unlocked
// (useMilestoneCelebrations), never backdated or guessed.
export function getBadgeUnlockedAtMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BADGE_UNLOCKED_AT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function recordBadgeUnlockedAt(badgeId: string): void {
  try {
    const map = getBadgeUnlockedAtMap();
    if (map[badgeId]) return;
    map[badgeId] = Date.now();
    localStorage.setItem(BADGE_UNLOCKED_AT_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

// "Mes INTOX" (Accueil) dismissed at a given real missed-card count — not a permanent
// "never show again": the banner reappears the moment the real count climbs past whatever was
// dismissed, since that's a genuinely new fact (a card you hadn't missed before, missed now).
export function getIntoxDismissedCount(): number {
  try {
    const raw = localStorage.getItem(INTOX_DISMISSED_COUNT_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function setIntoxDismissedCount(count: number): void {
  try {
    localStorage.setItem(INTOX_DISMISSED_COUNT_KEY, String(count));
  } catch {
    /* ignore quota errors */
  }
}

// Real calendar date (`toDateString()`, the same idiom store.tsx already uses for "today") of the
// last time the Pioche du jour chest was actually opened — not a session flag, so it survives a
// reload. Read+written synchronously at the moment of the click (HeroPiocheCard), before the
// choreography decision is made, since the full ceremony only makes sense for the day's first
// draw — replaying it on every reopen the same day would just be noise.
export function getLastPiocheOpenDate(): string | null {
  try {
    return localStorage.getItem(LAST_PIOCHE_OPEN_KEY);
  } catch {
    return null;
  }
}

export function setLastPiocheOpenDate(): void {
  try {
    localStorage.setItem(LAST_PIOCHE_OPEN_KEY, new Date().toDateString());
  } catch {
    /* ignore quota errors */
  }
}
