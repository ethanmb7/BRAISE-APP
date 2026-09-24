import { getRankInfo } from '@/lib/aura';
import { RankIcon } from '@/components/RankIcon';
import { AvatarGlyph } from '@/components/AvatarGlyph';

interface HeaderHUDProps {
  name: string;
  avatar: string;
  streak: number;
  xp: number;
  /** Braise's own word above the student's name (headerGreeting in braiseVoice.ts) — never a
   *  hardcoded "Bonjour", which reads like a bank app on the one bar shown on every visit. */
  greeting: string;
  onAvatarClick: () => void;
  onAuraClick: () => void;
}

/** Identity bar, not a dashboard: learning actions live below or in their dedicated tab. */
export function HeaderHUD({
  name,
  avatar,
  streak,
  xp,
  greeting,
  onAvatarClick,
  onAuraClick,
}: HeaderHUDProps) {
  const rank = getRankInfo(xp).current;

  return (
    <header className="home-header" aria-label="Ton profil et ton rythme">
      <button type="button" onClick={onAvatarClick} className="home-header-identity" aria-label="Ouvrir ton profil">
        <span className="home-header-avatar" aria-hidden="true">
          <AvatarGlyph id={avatar} rankId={rank.id} size={30} />
        </span>
        <span className="home-header-copy"><small>{greeting}</small><b>{name}</b></span>
      </button>

      <span className="home-header-streak" aria-label={`${streak} jour${streak > 1 ? 's' : ''} de suite`}>
        <span aria-hidden="true">🔥</span>{streak}
      </span>

      <button type="button" onClick={onAuraClick} className="home-header-aura" aria-label={`Ouvrir Ton Aura — ${xp} points, rang ${rank.name}`}>
        <span aria-hidden="true" style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}>
          <RankIcon rankId={rank.id} color="#fff" size={15} />
        </span>
        <b>{xp}</b>
      </button>
    </header>
  );
}
