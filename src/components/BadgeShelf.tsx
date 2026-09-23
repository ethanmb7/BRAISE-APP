import { useMemo } from 'react';
import { computeUnlockedBadges } from '@/store';
import { nextBadgeHint, badgeRemainingLabel } from '@/lib/aura';
import { getBadgeUnlockedAtMap } from '@/lib/celebrations';
import { BadgeIcon } from '@/components/BadgeIcon';
import { BADGES } from '@/data';
import type { AppState } from '@/types';

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// "Parcours" — moved here from Profil (see ProfilAuraView.tsx): this is real achievement
// history, it belongs on the page whose whole job is "what have I accomplished", not on the
// identity/settings page. Same card shell as SubjectMasteryGrid's own .mastery-section (an
// eyebrow tab + content), so it reads as the same family of object as everything else on this
// page, not a visual outlier.
//
// A single record of what actually happened, oldest first, ending in a dashed "ghost" node for
// the next real closest badge (nextBadgeHint — never a fabricated "coming soon"). Badges
// unlocked before this session added real unlock-date tracking have no timestamp (never
// backdated or guessed) — they sort first and render with no date instead of a fake one.
//
// Takes the whole `state` (not narrower derived props) on purpose: every other piece of data
// this needs — which badges are unlocked, when, and what's closest next — is computed from real
// AppState fields (streak, xp, completedChapters, cardReviews) it already owns, so this stays a
// fully self-contained section a parent view can drop in without pre-computing anything for it.
export function BadgeShelf({ state }: { state: AppState }) {
  const unlockedBadges = useMemo(() => computeUnlockedBadges(state), [state]);
  const unlockedCount = useMemo(() => Object.values(unlockedBadges).filter(Boolean).length, [unlockedBadges]);
  const badgeUnlockedAt = useMemo(() => getBadgeUnlockedAtMap(), [unlockedBadges]);
  const unlockedSorted = useMemo(
    () => BADGES.filter((b) => unlockedBadges[b.id]).sort((a, b) => (badgeUnlockedAt[a.id] ?? 0) - (badgeUnlockedAt[b.id] ?? 0)),
    [unlockedBadges, badgeUnlockedAt]
  );
  const hint = useMemo(
    () => nextBadgeHint({ streak: state.streak, xp: state.xp }, unlockedBadges),
    [state.streak, state.xp, unlockedBadges]
  );

  return (
    <div className="mastery-section-wrap">
      <div className="mastery-section">
        <span className="mastery-tab">Parcours</span>
        <p className="parcours-sub">
          {unlockedCount} badge{unlockedCount > 1 ? 's' : ''} débloqué{unlockedCount > 1 ? 's' : ''} sur {BADGES.length}
        </p>
        <div className="timeline-row">
          {unlockedSorted.map((b) => (
            <div className="timeline-item" key={b.id}>
              <div className="timeline-line" aria-hidden="true" />
              <div className="timeline-dot">
                <BadgeIcon badgeId={b.id} size={14} />
              </div>
              <span className="timeline-date">{badgeUnlockedAt[b.id] ? formatShortDate(badgeUnlockedAt[b.id]) : ''}</span>
            </div>
          ))}
          {hint && (
            <div className="timeline-item">
              <div className="timeline-line" aria-hidden="true" />
              <div className="timeline-dot ghost">
                <BadgeIcon badgeId={hint.badgeId} size={14} />
              </div>
              <span className="timeline-date ghost">
                {badgeRemainingLabel(hint.badgeId, { streak: state.streak, xp: state.xp }) ?? BADGES.find((b) => b.id === hint.badgeId)?.cond}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
