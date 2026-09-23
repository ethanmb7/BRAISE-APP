import { useMemo } from 'react';
import { computeUnlockedBadges } from '@/store';
import { badgeRemainingLabel } from '@/lib/aura';
import { getBadgeUnlockedAtMap } from '@/lib/celebrations';
import { BadgeIcon } from '@/components/BadgeIcon';
import { BADGES } from '@/data';
import type { AppState } from '@/types';

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// "Parcours" — the journal of what you've accomplished, on Ton parcours (ProfilAuraView), not
// on Profil: every badge visible at once, unlocked or not, with the real unlock date on each
// earned one and the real condition or remaining amount on each locked one
// (badgeRemainingLabel / badgeUnlockedAt — nothing fabricated). The gold medal construction
// matches BadgeIcon's own ring family.
export function BadgeShelf({ state }: { state: AppState }) {
  const unlocked = useMemo(() => computeUnlockedBadges(state), [state]);
  const unlockedCount = Object.values(unlocked).filter(Boolean).length;
  // Badges earned before real unlock-date tracking existed have no timestamp — they show
  // "Débloqué" instead of a fabricated date (same honesty rule the old timeline followed).
  // Keyed on `unlocked` on purpose: a badge earned while sitting on this page updates the map.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unlockedAt = useMemo(() => getBadgeUnlockedAtMap(), [unlocked]);

  return (
    <div className="badge-shelf">
      <div className="badge-shelf-head">
        <span className="mastery-tab">Parcours</span>
        <span className="badge-shelf-count">
          {unlockedCount}/{BADGES.length} débloqués
        </span>
      </div>
      <div className="badge-grid" role="list" aria-label="Tes badges">
        {BADGES.map((b) => {
          const isUnlocked = Boolean(unlocked[b.id]);
          return (
            <div className="badge-tile" key={b.id} role="listitem">
              <span className={`badge-medal ${isUnlocked ? '' : 'is-locked'}`}>
                <BadgeIcon badgeId={b.id} size={20} />
              </span>
              <span className={`badge-name ${isUnlocked ? '' : 'is-locked'}`}>{b.name}</span>
              <span className="badge-sub">
                {isUnlocked
                  ? unlockedAt[b.id]
                    ? formatShortDate(unlockedAt[b.id] as number)
                    : 'Débloqué'
                  : badgeRemainingLabel(b.id, { streak: state.streak, xp: state.xp }) ?? b.cond}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
