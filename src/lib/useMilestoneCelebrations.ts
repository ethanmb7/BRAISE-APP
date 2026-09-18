import { useEffect, useState } from 'react';
import { computeUnlockedBadges } from '@/store';
import { getRankInfo, RANKS, type Rank } from '@/lib/aura';
import { fireConfetti } from '@/lib/confetti';
import { sfx } from '@/lib/sound';
import { BADGES } from '@/data';
import type { AppState, Badge } from '@/types';
import {
  getSeenRank,
  setSeenRank,
  getSeenBadgeIds,
  setSeenBadgeIds,
  hasBaselinedBadges,
} from '@/lib/celebrations';

export type Celebration =
  | { type: 'rank'; fromRank: Rank; toRank: Rank }
  | { type: 'badge'; badge: Badge };

// Badges stay a quick toast, auto-dismissed on a short timer. A rank-up is now a dedicated full
// screen with its own explicit "Continuer"/"Passer" buttons — this long timeout is only a safety
// net for whoever doesn't tap either (so the screen can never get permanently stuck), not the
// primary way to leave it: a deliberate full-screen moment should end on the student's own terms.
const AUTO_DISMISS_MS: Record<Celebration['type'], number> = { badge: 2200, rank: 12000 };

type CelebrationState = Pick<
  AppState,
  'streak' | 'xp' | 'freezeArmed' | 'freezes' | 'completedChapters'
>;

/** Rank-ups and badge unlocks were both real, already-computed milestones (getRankInfo,
 *  computeUnlockedBadges) that fired with zero acknowledgement anywhere in the app — a student
 *  only ever saw the change if they happened to reopen Profile. This detects a genuine new
 *  crossing (not just "is it true right now", which would also fire on every reload) by comparing
 *  against what was last seen in localStorage, and queues one celebration per new milestone so
 *  nothing gets silently skipped if two land at once. */
export function useMilestoneCelebrations(
  state: CelebrationState,
  loaded: boolean,
  soundOn: boolean
): { celebration: Celebration | null; dismiss: () => void } {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [active, setActive] = useState<Celebration | null>(null);

  useEffect(() => {
    if (!loaded) return;
    const toRank = getRankInfo(state.xp).current;
    const seenRankId = getSeenRank();
    if (seenRankId !== null && seenRankId !== toRank.id) {
      const fromRank = RANKS.find((r) => r.id === seenRankId) ?? toRank;
      setQueue((q) => [...q, { type: 'rank', fromRank, toRank }]);
    }
    setSeenRank(toRank.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, state.xp]);

  useEffect(() => {
    if (!loaded) return;
    const unlockedMap = computeUnlockedBadges(state);
    const unlockedIds = Object.entries(unlockedMap)
      .filter(([, isUnlocked]) => isUnlocked)
      .map(([id]) => id);
    if (hasBaselinedBadges()) {
      const seen = getSeenBadgeIds();
      const newlyUnlocked = unlockedIds.filter((id) => !seen.includes(id));
      newlyUnlocked.forEach((id) => {
        const badge = BADGES.find((b) => b.id === id);
        if (badge) setQueue((q) => [...q, { type: 'badge', badge }]);
      });
    }
    setSeenBadgeIds(unlockedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, state.streak, state.xp, state.freezeArmed, state.freezes, state.completedChapters]);

  // Split in two, not one combined "pop + schedule dismissal" effect: under StrictMode's dev-only
  // double-invoke (mount, cleanup, remount), a single effect guarded by `if (active) return` would
  // see `active` already set on the remount pass and bail out — but its cleanup had already
  // cancelled the dismissal timeout on the way there, so nothing would ever schedule a new one and
  // the celebration would stay stuck forever. Each of these two effects' own guard is unaffected by
  // what the other one just changed, so the double-invoke is a harmless no-op on the remount pass.
  useEffect(() => {
    if (active !== null || queue.length === 0) return;
    const [next, ...rest] = queue;
    setActive(next);
    setQueue(rest);
    if (next.type === 'rank') fireConfetti();
    sfx.complete(soundOn);
  }, [queue, active, soundOn]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(null), AUTO_DISMISS_MS[active.type]);
    return () => clearTimeout(t);
  }, [active]);

  return { celebration: active, dismiss: () => setActive(null) };
}
