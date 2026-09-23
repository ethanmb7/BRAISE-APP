import { Layers } from 'lucide-react';
import { getRankInfo } from '@/lib/aura';
import { RankIcon } from '@/components/RankIcon';
import { SnowflakeIcon } from '@/components/SnowflakeIcon';

interface HeaderHUDProps {
  avatar: string;
  streak: number;
  xp: number;
  freezes: number;
  freezeArmed: boolean;
  streakBumped: boolean;
  freezeBumped: boolean;
  dueCount: number;
  onAvatarClick: () => void;
  onStreakClick: () => void;
  onAuraClick: () => void;
  onFreezeClick: () => void;
  onReviewClick: () => void;
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <defs>
        <linearGradient id="ritualFlameGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEF70" />
          <stop offset="52%" stopColor="#FF9D00" />
          <stop offset="100%" stopColor="#FF4D00" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.4c2.7 3.5 6 4.9 6 9.4a6 6 0 0 1-12 0c0-2.4 1-3.7 2.2-5.3C9.2 3.9 10.1 3.4 12 1.4Z"
        fill="url(#ritualFlameGradient)"
        stroke="#151821"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M12 9.2c1.1 1.5 2 2.1 2 3.8a2 2 0 0 1-4 0c0-1.1.5-1.6 1-2.3.3-.4.6-.9 1-1.5Z" fill="#FFF9D6" />
    </svg>
  );
}

/**
 * The home header is deliberately a "ritual bar", not an inventory of counters. The student
 * arrives to do one thing (their mission), so the bar answers only three quiet questions:
 * "where am I in my rhythm?", "is my streak protected?", and "what have I built?".
 *
 * A freeze is named "Joker de série" in the interface. The mechanic is still the existing
 * freeze underneath: arming it protects the upcoming missed day; it never pretends to rewrite a
 * day that has already passed. That distinction matters for trust, while "joker" is much easier
 * for an adolescent to understand than a bare snowflake counter.
 */
export function HeaderHUD({
  avatar,
  streak,
  xp,
  freezes,
  freezeArmed,
  streakBumped,
  freezeBumped,
  dueCount,
  onAvatarClick,
  onStreakClick,
  onAuraClick,
  onFreezeClick,
  onReviewClick,
}: HeaderHUDProps) {
  const rank = getRankInfo(xp).current;
  const rhythmTitle = streak > 0 ? `${streak} jour${streak > 1 ? 's' : ''} de suite` : "Ta première étincelle";
  const rhythmSub = freezeArmed
    ? 'Joker prêt pour ce soir'
    : streak > 0
      ? 'Ta flamme est au chaud'
      : 'Ta mission t’attend';
  const jokerLabel = freezeArmed
    ? 'Joker de série activé'
    : freezes > 0
      ? `${freezes} joker${freezes > 1 ? 's' : ''} de série`
      : 'Plus de joker de série';

  return (
    <header className="home-ritual-bar" aria-label="Ton rituel Braise">
      <div className="home-ritual-main">
        <button type="button" onClick={onAvatarClick} className="ritual-avatar" aria-label={`Ouvrir ton profil — rang ${rank.name}`}>
          <span className="ritual-avatar-face" aria-hidden="true">{avatar}</span>
          <span className="ritual-rank-pin" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
            <RankIcon rankId={rank.id} color="#fff" size={13} />
          </span>
        </button>

        <button
          type="button"
          onClick={onStreakClick}
          className={`ritual-rhythm ${streakBumped ? 'is-bumping' : ''}`}
          aria-label={`${rhythmTitle}. ${rhythmSub}`}
        >
          <span className="ritual-flame" aria-hidden="true"><FlameIcon /></span>
          <span className="ritual-rhythm-copy">
            <span className="ritual-eyebrow">Ton rythme</span>
            <strong>{rhythmTitle}</strong>
            <span>{rhythmSub}</span>
          </span>
        </button>

        <button type="button" onClick={onAuraClick} className="ritual-aura" aria-label={`${xp} points d'Aura — voir Ton Aura`}>
          <span className="ritual-aura-medal" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
            <RankIcon rankId={rank.id} color="#fff" size={18} />
          </span>
          <span className="ritual-aura-copy"><b>{xp}</b><small>Aura</small></span>
        </button>
      </div>

      <div className="home-ritual-tools">
        <button
          type="button"
          onClick={onFreezeClick}
          aria-pressed={freezeArmed}
          aria-label={freezeArmed ? 'Désactiver ton joker de série' : `${jokerLabel}. Activer pour protéger ta série ce soir`}
          className={`ritual-tool ritual-joker ${freezeArmed ? 'is-armed' : ''} ${freezeBumped ? 'is-bumping' : ''}`}
        >
          <span className="ritual-tool-icon" aria-hidden="true"><SnowflakeIcon /></span>
          <span className="ritual-tool-copy">
            <b>{freezeArmed ? 'Joker prêt' : 'Joker de série'}</b>
            <small>{freezeArmed ? 'Protège ta flamme ce soir' : freezes > 0 ? `${freezes} disponible${freezes > 1 ? 's' : ''}` : 'À gagner bientôt'}</small>
          </span>
          <span className="ritual-tool-action" aria-hidden="true">{freezeArmed ? 'ON' : freezes > 0 ? '＋' : '—'}</span>
        </button>

        <button type="button" onClick={onReviewClick} className="ritual-tool ritual-review" aria-label={dueCount > 0 ? `${dueCount} cartes à réviser` : 'Ouvrir Réviser'}>
          <span className="ritual-tool-icon" aria-hidden="true"><Layers size={18} strokeWidth={2.8} /></span>
          <span className="ritual-tool-copy">
            <b>{dueCount > 0 ? `${dueCount} à sécuriser` : 'Révision libre'}</b>
            <small>{dueCount > 0 ? 'À retrouver aujourd’hui' : 'Grille les intox de Braise'}</small>
          </span>
          {dueCount > 0 && <span className="ritual-due-dot" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
