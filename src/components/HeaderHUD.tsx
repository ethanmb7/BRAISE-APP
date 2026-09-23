codex/analyser-et-ameliorer-l-application-braise-pvobf9
import { ArrowUpRight, Layers, Snowflake } from 'lucide-react';
=======
import { Layers } from 'lucide-react';
main
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

codex/analyser-et-ameliorer-l-application-braise-pvobf9
function FlameMark() {
  return (
    <svg viewBox="0 0 28 32" width="25" height="29" aria-hidden="true">
      <path d="M14 1.5C17.4 6.1 24.2 9 24.2 16.7a10.2 10.2 0 1 1-20.4 0c0-4 1.6-6.4 4.1-9.3C9.4 5.5 11 4.1 14 1.5Z" fill="#FF5B16" stroke="#151821" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 12c1.8 2.1 3.2 3.2 3.2 5.7a3.2 3.2 0 0 1-6.4 0c0-1.4.6-2.1 1.4-3.1.4-.6 1-1.4 1.8-2.6Z" fill="#FFE36E" />
=======
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
main
    </svg>
  );
}

/**
codex/analyser-et-ameliorer-l-application-braise-pvobf9
 * Home is not a dashboard: it is the entrance to today's mission. This header therefore keeps
 * metrics as information, and reserves every button for a real destination or a real action:
 * profile, Aura, protect the streak, or review due cards. Nothing decorative is clickable.
=======
 * The home header is deliberately a "ritual bar", not an inventory of counters. The student
 * arrives to do one thing (their mission), so the bar answers only three quiet questions:
 * "where am I in my rhythm?", "is my streak protected?", and "what have I built?".
 *
 * A freeze is named "Joker de série" in the interface. The mechanic is still the existing
 * freeze underneath: arming it protects the upcoming missed day; it never pretends to rewrite a
 * day that has already passed. That distinction matters for trust, while "joker" is much easier
 * for an adolescent to understand than a bare snowflake counter.
main
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
codex/analyser-et-ameliorer-l-application-braise-pvobf9
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
=======
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
main
        </button>
      </div>
    </header>
  );
}
