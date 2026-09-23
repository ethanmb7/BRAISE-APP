import { ArrowUpRight, Layers, Snowflake } from 'lucide-react';
import { getRankInfo } from '@/lib/aura';
import { RankIcon } from '@/components/RankIcon';

interface HeaderHUDProps {
  name: string;
  avatar: string;
  streak: number;
  xp: number;
  freezes: number;
  freezeArmed: boolean;
  freezeBumped: boolean;
  dueCount: number;
  onAvatarClick: () => void;
  onAuraClick: () => void;
  onFreezeClick: () => void;
  onReviewClick: () => void;
}

function FlameMark() {
  return (
    <svg viewBox="0 0 28 32" width="25" height="29" aria-hidden="true">
      <path d="M14 1.5C17.4 6.1 24.2 9 24.2 16.7a10.2 10.2 0 1 1-20.4 0c0-4 1.6-6.4 4.1-9.3C9.4 5.5 11 4.1 14 1.5Z" fill="#FF5B16" stroke="#151821" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 12c1.8 2.1 3.2 3.2 3.2 5.7a3.2 3.2 0 0 1-6.4 0c0-1.4.6-2.1 1.4-3.1.4-.6 1-1.4 1.8-2.6Z" fill="#FFE36E" />
    </svg>
  );
}

/**
 * Home is not a dashboard: it is the entrance to today's mission. This header therefore keeps
 * metrics as information, and reserves every button for a real destination or a real action:
 * profile, Aura, protect the streak, or review due cards. Nothing decorative is clickable.
 */
export function HeaderHUD({
  name,
  avatar,
  streak,
  xp,
  freezes,
  freezeArmed,
  freezeBumped,
  dueCount,
  onAvatarClick,
  onAuraClick,
  onFreezeClick,
  onReviewClick,
}: HeaderHUDProps) {
  const rank = getRankInfo(xp).current;
  const streakLabel = streak > 0 ? `${streak} jour${streak > 1 ? 's' : ''} de suite` : 'Première flamme';
  const gelDetail = freezeArmed
    ? 'Ta série est protégée'
    : freezes > 0
      ? `${freezes} gel${freezes > 1 ? 's' : ''} en réserve`
      : 'Aucun gel en réserve';

  return (
    <header className="mission-topbar" aria-label="Accueil Braise">
      <div className="mission-topbar-head">
        <button type="button" onClick={onAvatarClick} className="mission-profile-button" aria-label="Ouvrir ton profil">
          <span className="mission-profile-avatar" aria-hidden="true">{avatar}</span>
          <span className="mission-profile-rank" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
            <RankIcon rankId={rank.id} color="#fff" size={12} />
          </span>
        </button>

        <div className="mission-welcome">
          <p>Salut {name}</p>
          <span>Ta mission est prête.</span>
        </div>

        <button type="button" onClick={onAuraClick} className="mission-aura-button" aria-label={`Ouvrir Ton Aura — ${xp} points, rang ${rank.name}`}>
          <span className="mission-aura-medal" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
            <RankIcon rankId={rank.id} color="#fff" size={17} />
          </span>
          <span><b>{xp}</b><small>Aura</small></span>
        </button>
      </div>

      <div className="mission-tools" aria-label="Ton rythme et tes outils">
        <div className="mission-streak" aria-label={streakLabel}>
          <span className="mission-streak-flame" aria-hidden="true"><FlameMark /></span>
          <span><b>{streakLabel}</b><small>{streak > 0 ? 'Ton rythme avance.' : 'On l’allume aujourd’hui ?'}</small></span>
        </div>

        <button
          type="button"
          onClick={onFreezeClick}
          aria-pressed={freezeArmed}
          aria-label={freezeArmed ? 'Désactiver le gel de série' : `${gelDetail}. Activer le gel de série`}
          className={`mission-tool-button mission-freeze-button ${freezeArmed ? 'is-armed' : ''} ${freezeBumped ? 'is-bumping' : ''}`}
        >
          <span className="mission-tool-icon" aria-hidden="true"><Snowflake size={18} strokeWidth={2.8} /></span>
          <span className="mission-tool-copy"><b>{freezeArmed ? 'Gel activé' : 'Gel de série'}</b><small>{gelDetail}</small></span>
          <span className="mission-tool-end" aria-hidden="true">{freezeArmed ? 'ON' : freezes > 0 ? '＋' : '—'}</span>
        </button>

        <button type="button" onClick={onReviewClick} className="mission-tool-button mission-review-button" aria-label={dueCount > 0 ? `Réviser ${dueCount} cartes` : 'Ouvrir Réviser'}>
          <span className="mission-tool-icon" aria-hidden="true"><Layers size={18} strokeWidth={2.8} /></span>
          <span className="mission-tool-copy"><b>{dueCount > 0 ? `${dueCount} à revoir` : 'Réviser'}</b><small>{dueCount > 0 ? 'À sécuriser maintenant' : 'Défie Braise'}</small></span>
          <ArrowUpRight className="mission-tool-arrow" size={16} strokeWidth={2.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
