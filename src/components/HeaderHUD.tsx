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

/** A quiet ritual bar: the mission remains the single dominant action on Home. */
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
  const streakLabel = streak > 0 ? `${streak} jour${streak > 1 ? 's' : ''} de suite` : 'Première étincelle';
  const jokerDetail = freezeArmed
    ? 'Ta série est protégée'
    : freezes > 0
      ? `${freezes} joker${freezes > 1 ? 's' : ''} en réserve`
      : 'À gagner bientôt';

  return (
    <header className="mission-topbar" aria-label="Ton rituel du jour">
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

      <div className="mission-rhythm" aria-label={streakLabel}>
        <span className="mission-rhythm-flame" aria-hidden="true">🔥</span>
        <span><b>{streakLabel}</b><small>{streak > 0 ? 'Ta flamme avance avec toi.' : 'On l’allume aujourd’hui ?'}</small></span>
      </div>

      <div className="mission-tools" aria-label="Tes outils">
        <button
          type="button"
          onClick={onFreezeClick}
          aria-pressed={freezeArmed}
          aria-label={freezeArmed ? 'Désactiver ton joker de série' : `${jokerDetail}. Activer ton joker de série`}
          className={`mission-tool-button mission-freeze-button ${freezeArmed ? 'is-armed' : ''} ${freezeBumped ? 'is-bumping' : ''}`}
        >
          <span className="mission-tool-icon" aria-hidden="true"><Snowflake size={18} strokeWidth={2.8} /></span>
          <span className="mission-tool-copy"><b>{freezeArmed ? 'Joker prêt' : 'Joker de série'}</b><small>{jokerDetail}</small></span>
          <span className="mission-tool-end" aria-hidden="true">{freezeArmed ? 'ON' : freezes > 0 ? '＋' : '—'}</span>
        </button>

        <button type="button" onClick={onReviewClick} className="mission-tool-button mission-review-button" aria-label={dueCount > 0 ? `Réviser ${dueCount} cartes` : 'Ouvrir Réviser'}>
          <span className="mission-tool-icon" aria-hidden="true"><Layers size={18} strokeWidth={2.8} /></span>
          <span className="mission-tool-copy"><b>{dueCount > 0 ? `${dueCount} à revoir` : 'Révision libre'}</b><small>{dueCount > 0 ? 'À sécuriser maintenant' : 'Grille les intox'}</small></span>
          <ArrowUpRight className="mission-tool-arrow" size={16} strokeWidth={2.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
