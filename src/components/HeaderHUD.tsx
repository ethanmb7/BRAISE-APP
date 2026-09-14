import { Bell } from 'lucide-react';

interface HeaderHUDProps {
  avatar: string;
  streak: number;
  xp: number;
  freezes: number;
  freezeArmed: boolean;
  streakBumped: boolean;
  /** Real signal, not a fabricated alert count — true when there's actually something due. */
  hasAlert: boolean;
  onAvatarClick: () => void;
  onStreakClick: () => void;
  onAuraClick: () => void;
  onFreezeClick: () => void;
  onBellClick: () => void;
}

// A single flying line, no enclosing container: avatar, three identical pills, bell. The brief's
// own example value for pill 1 ("2") is the real freeze count, not the cards-due count — so
// that's what it shows; freeze also happens to be the app's only interactive entry point for
// arming a streak freeze, so this keeps the header at exactly three pills without silently
// dropping a real feature. Cards-due still surfaces honestly, just one level down (the bell's
// alert dot, and the hero card's own sub-text).
export function HeaderHUD({
  avatar,
  streak,
  xp,
  freezes,
  freezeArmed,
  streakBumped,
  hasAlert,
  onAvatarClick,
  onStreakClick,
  onAuraClick,
  onFreezeClick,
  onBellClick,
}: HeaderHUDProps) {
  const pillBase = 'flex items-center gap-1.5 rounded-full bg-gray-100/90 px-3 py-2 text-xs font-bold transition-transform active:scale-95 dark:bg-white/10';

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={onAvatarClick}
        aria-label="Ton profil"
        className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border border-black bg-[var(--paper)] text-lg transition-transform active:scale-90"
      >
        <span>{avatar}</span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-2">
        <button
          onClick={onFreezeClick}
          aria-label={`${freezes} gels de série`}
          className={`${pillBase} ${freezeArmed ? 'text-sapie-neo-orange' : 'text-[var(--ink)]'}`}
        >
          <span aria-hidden="true">❄️</span>
          <span>{freezes}</span>
        </button>
        <button
          onClick={onStreakClick}
          aria-label={`${streak} jours de série`}
          className={`${pillBase} text-sapie-neo-orange ${streakBumped ? 'tw-bump' : ''}`}
        >
          <span aria-hidden="true">🔥</span>
          <span>{streak}</span>
        </button>
        <button onClick={onAuraClick} aria-label={`${xp} points d'Aura — voir Ton Aura`} className={`${pillBase} text-[var(--ink)]`}>
          <span aria-hidden="true">🪙</span>
          <span>{xp}</span>
        </button>
      </div>

      <button
        onClick={onBellClick}
        aria-label={hasAlert ? 'Tu as des cartes à réviser' : 'Notifications'}
        className="relative flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border border-black bg-[var(--paper)] transition-transform active:scale-90"
      >
        <Bell size={16} className="text-[var(--ink)]" />
        {hasAlert && (
          <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--paper)] bg-red-500" />
        )}
      </button>
    </div>
  );
}
