import { Check, Play } from 'lucide-react';
import { computeGoalPct, remainingToGoal, computeUnlockedBadges } from '@/store';
import { getRankInfo, nextBadgeHint, badgeProgressPct } from '@/lib/aura';
import { BadgeIcon } from '@/components/BadgeIcon';
import { RankIcon } from '@/components/RankIcon';
import { TrophyIcon } from '@/components/TrophyIcon';
import { BraiseMascot } from '@/components/BraiseMascot';
import type { AppState } from '@/types';

// "Missions du moment" — the actionable heart of the new Profil: the three things a student can
// actually move today (daily goal, next rank, next badge), each with its REAL progress, never a
// template. One honest action moves all three at once (revising), so every mission's GO button
// goes to the same place — no fake choices. A finished mission swaps its GO for a mint "OK"
// pill: the reward is having done it, not another button that does nothing new.
export function MissionsBoard({ state, onGo }: { state: AppState; onGo: () => void }) {
  const rankInfo = getRankInfo(state.xp);
  const targetRank = rankInfo.next ?? rankInfo.current;
  const badgeUnlocked = computeUnlockedBadges(state);
  const hint = nextBadgeHint({ streak: state.streak, xp: state.xp }, badgeUnlocked);

  const missions = [
    {
      id: 'goal',
      medal: <BraiseMascot size={22} mood={state.dailyGoalMet ? 'proud' : 'happy'} />,
      medalBg: 'color-mix(in srgb, #ff4500 14%, #fff)',
      title: 'Braise du jour',
      sub: state.dailyGoalMet ? 'Objectif validé, respect !' : `Plus que ${remainingToGoal(state)} pour valider ta Braise`,
      pct: computeGoalPct(state),
      fill: 'var(--neo-orange)',
      done: state.dailyGoalMet,
    },
    {
      id: 'rank',
      medal: <RankIcon rankId={targetRank.id} color={targetRank.colorFrom} size={20} />,
      medalBg: `color-mix(in srgb, ${targetRank.colorFrom} 30%, #fff)`,
      title: rankInfo.next ? `Passe au rang ${rankInfo.next.name}` : 'Rang maximum atteint',
      sub: rankInfo.next ? `${rankInfo.next.min - state.xp} XP restants` : 'Tu es au sommet 👑',
      pct: rankInfo.next ? rankInfo.pct : 100,
      fill: `linear-gradient(90deg, ${targetRank.colorFrom}, ${targetRank.colorTo})`,
      done: !rankInfo.next,
    },
    {
      id: 'badge',
      medal: hint ? <BadgeIcon badgeId={hint.badgeId} size={20} /> : <TrophyIcon size={19} />,
      medalBg: '#ffd166',
      title: hint ? 'Débloque ton prochain badge' : 'Tous tes badges sont débloqués',
      sub: hint ? hint.label : 'Collection complète 🏆',
      pct: hint ? badgeProgressPct(hint.badgeId, { streak: state.streak, xp: state.xp }) ?? 0 : 100,
      fill: 'var(--sun)',
      done: !hint,
    },
  ];

  return (
    <div className="mission-board">
      <span className="mastery-tab">Missions du moment</span>
      {missions.map((m) => (
        <div className="mission-row" key={m.id}>
          <span className="mission-medal" style={{ background: m.medalBg }}>
            {m.medal}
          </span>
          <div className="mission-main">
            <p className="mission-title">{m.title}</p>
            <p className="mission-sub">{m.sub}</p>
            <div
              className="mission-track"
              role="progressbar"
              aria-valuenow={m.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={m.title}
            >
              <div className="mission-fill" style={{ width: `${m.pct}%`, background: m.fill }} />
            </div>
          </div>
          {m.done ? (
            <span className="mission-done">
              <Check size={13} /> OK
            </span>
          ) : (
            <button type="button" className="mission-go" onClick={onGo} aria-label="Réviser pour avancer cette mission">
              <Play size={11} /> GO
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
