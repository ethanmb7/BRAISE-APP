import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { getRankInfo } from '@/lib/aura';

interface HeaderHUDProps {
  avatar: string;
  streak: number;
  xp: number;
  freezes: number;
  freezeArmed: boolean;
  streakBumped: boolean;
  freezeBumped: boolean;
  /** Real count of cards due today (from the app's own spaced-repetition scheduling) — shown as
   *  a number, not a vague dot: a "3" gives an actionable signal, a dot only gives anxiety. */
  dueCount: number;
  onAvatarClick: () => void;
  onStreakClick: () => void;
  onAuraClick: () => void;
  onFreezeClick: () => void;
  onBellClick: () => void;
}

// Structural rebuild, not another value pass on the same oval pill: every button is now two
// stacked layers — a darker "base" of the same hue sitting `translate-y` below, and a lighter
// gradient "face" on top that carries the content. Pressing the button doesn't just drop its
// flat hard-shadow (the old trick); the face itself slides down and visually merges into the
// base, the same mechanic real chunky mobile-game buttons (Clash Royale, Brawl Stars) use. The
// icon sits in its own small dark "socket" cut into the face — set into the button rather than
// floating above it — so nothing reads as a decal stuck on top of a flat shape anymore.
function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <defs>
        <linearGradient id="hudFlameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEB3B" />
          <stop offset="48%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF5A00" />
        </linearGradient>
      </defs>
      {/* Scaled up ~22% around its own center — same artwork as before, but at 17x17 the
          flame's natural bounding box read noticeably smaller than the bolt/crystal's, which
          span closer to the viewBox's full extent. */}
      <g transform="translate(12 12) scale(1.22) translate(-12 -12)">
        <path
          d="M12 1.4c2.7 3.5 6 4.9 6 9.4a6 6 0 0 1-12 0c0-2.4 1-3.7 2.2-5.3C9.2 3.9 10.1 3.4 12 1.4z"
          fill="url(#hudFlameGrad)"
          stroke="#151821"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 9.2c1.1 1.5 2 2.1 2 3.8a2 2 0 0 1-4 0c0-1.1.5-1.6 1-2.3.3-.4.6-.9 1-1.5z"
          fill="#FFF6D0"
          opacity="0.9"
        />
        <circle cx="10.1" cy="12.6" r="0.85" fill="#151821" />
        <circle cx="13.5" cy="12.6" r="0.85" fill="#151821" />
        <circle cx="10.4" cy="12.2" r="0.28" fill="#fff" />
        <circle cx="13.8" cy="12.2" r="0.28" fill="#fff" />
        <path d="M10.6 14.6q1.2 1.2 2.4 0" stroke="#151821" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        {/* Micro-reflet: glint on the flame's upper-right shoulder. */}
        <path d="M12.8 3 15.8 8" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />
      </g>
    </svg>
  );
}

// Was a cut-gem/diamond — read as generic "currency" rather than "streak protection", the one
// HUD icon with no self-evident meaning (flame/streak and bolt/XP are near-universal gamification
// codes; a gem icon isn't). A snowflake is the actual standard convention for a "streak freeze"
// (the mechanic this app itself calls "un gel" — same word, same icon Duolingo uses for the same
// mechanic), so swapping the icon fixes the comprehension gap without adding any label text —
// every other HUD pill stays icon-plus-number only, this one now matches that pattern honestly.
function SnowflakeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <defs>
        <linearGradient id="hudSnowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0FDFF" />
          <stop offset="50%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <g strokeLinecap="round">
        <line x1="12" y1="2.8" x2="12" y2="21.2" stroke="#151821" strokeWidth="2.6" />
        <line x1="4" y1="7.3" x2="20" y2="16.7" stroke="#151821" strokeWidth="2.6" />
        <line x1="20" y1="7.3" x2="4" y2="16.7" stroke="#151821" strokeWidth="2.6" />
        <line x1="12" y1="2.8" x2="12" y2="21.2" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="4" y1="7.3" x2="20" y2="16.7" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="20" y1="7.3" x2="4" y2="16.7" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="10.4" y1="5.6" x2="13.6" y2="5.6" stroke="#151821" strokeWidth="1.4" />
        <line x1="10.4" y1="18.4" x2="13.6" y2="18.4" stroke="#151821" strokeWidth="1.4" />
        <line x1="6.7" y1="9.1" x2="8.9" y2="7.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="15.1" y1="16.1" x2="17.3" y2="14.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="17.3" y1="9.1" x2="15.1" y2="7.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="8.9" y1="16.1" x2="6.7" y2="14.9" stroke="#151821" strokeWidth="1.4" />
      </g>
      <circle cx="12" cy="12" r="2.3" fill="url(#hudSnowGrad)" stroke="#151821" strokeWidth="1.2" />
      <path d="M13 4.5 15.6 9" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <defs>
        <linearGradient id="hudBoltGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="45%" stopColor="#FFC700" />
          <stop offset="100%" stopColor="#E88A00" />
        </linearGradient>
      </defs>
      <path
        d="M13 1.4 3.2 14.2h6.3l-1.1 8.6L19.3 8.7h-6.5l1.3-7.3Z"
        fill="url(#hudBoltGrad)"
        stroke="#151821"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 1.4 8.9 9.9l3.7-1" stroke="#151821" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Micro-reflet: glint along the bolt's upper-right edge. */}
      <path d="M13.7 2.2 17.6 7.6" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />
      <circle cx="15.4" cy="5.4" r="0.75" fill="#fff" opacity="0.9" />
    </svg>
  );
}

interface Metric {
  key: string;
  icon: ReactNode;
  value: number;
  base: string;
  face: string;
  text: string;
  socket: string;
  label: string;
  onClick: () => void;
  bump?: boolean;
}

// The bevel: one `<span>` for the darker base (peeks out 3px below at rest), one for the
// gradient face (holds the icon socket + number, slides down onto the base on press). Both use
// the exact same border/radius so the base never shows at the sides, only underneath.
function BeveledButton({
  onClick,
  label,
  base,
  face,
  text,
  socket,
  icon,
  value,
  bump,
}: {
  onClick: () => void;
  label: string;
  base: string;
  face: string;
  text: string;
  socket: string;
  icon: ReactNode;
  value: number;
  bump?: boolean;
}) {
  return (
    <button onClick={onClick} aria-label={label} className={`group relative block ${bump ? 'tw-bump' : ''}`}>
      <span aria-hidden="true" className={`absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black ${base}`} />
      <span
        className={`relative flex h-12 items-center gap-1 rounded-2xl border-[2.5px] border-black ${face} py-1 pl-1 pr-2 text-lg font-black ${text} shadow-[3px_3px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none`}
      >
        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-black/40 ${socket}`}>
          {icon}
        </span>
        {value}
      </span>
    </button>
  );
}

function AnchorButton({
  onClick,
  label,
  children,
  baseGradient,
  cornerBadge,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  /** [from, to] hex pair — tints the bevel base instead of the default flat black/20. */
  baseGradient?: [string, string];
  cornerBadge?: ReactNode;
}) {
  return (
    <button onClick={onClick} aria-label={label} className="group relative block flex-shrink-0">
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black bg-black/20"
        style={baseGradient ? { background: `linear-gradient(135deg, ${baseGradient[0]}, ${baseGradient[1]})` } : undefined}
      />
      {/* h-12/w-12 (48px), not h-11/w-11 (44px, Apple's bare minimum): avatar and bell are two of
          the most-tapped controls in the HUD, and 44px sat right at the floor while every other
          button in this app is deliberately oversized. 48px also clears Android's 48dp guideline,
          which 44px didn't. */}
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-[2.5px] border-black bg-white text-xl shadow-[3px_3px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none">
        {children}
      </span>
      {cornerBadge}
    </button>
  );
}

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
  onBellClick,
}: HeaderHUDProps) {
  const rank = getRankInfo(xp).current;
  const metrics: Metric[] = [
    {
      key: 'freeze',
      icon: <SnowflakeIcon />,
      value: freezes,
      base: 'bg-cyan-950',
      face: freezeArmed ? 'bg-amber-400' : 'bg-cyan-400',
      text: 'text-black',
      socket: 'bg-black/15',
      label: `${freezes} gels de série`,
      onClick: onFreezeClick,
      bump: freezeBumped,
    },
    {
      key: 'streak',
      icon: <FlameIcon />,
      value: streak,
      base: 'bg-red-800',
      face: 'bg-red-600',
      text: 'text-white font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
      socket: 'bg-black/15',
      label: `${streak} jours de série`,
      onClick: onStreakClick,
      bump: streakBumped,
    },
    {
      key: 'xp',
      icon: <BoltIcon />,
      value: xp,
      base: 'bg-amber-700',
      face: 'bg-gradient-to-b from-amber-300 to-amber-400',
      text: 'text-black',
      socket: 'bg-black/10',
      label: `${xp} points d'Aura — voir Ton Aura`,
      onClick: onAuraClick,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-1.5">
      <AnchorButton
        onClick={onAvatarClick}
        label={`Ton profil — rang ${rank.name}`}
        baseGradient={[rank.colorFrom, rank.colorTo]}
        cornerBadge={
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white text-[0.62rem] leading-none shadow-[0_0_0_1px_#000]"
            style={{ background: `linear-gradient(135deg, ${rank.colorFrom}, ${rank.colorTo})` }}
          >
            {rank.emoji}
          </span>
        }
      >
        <span>{avatar}</span>
      </AnchorButton>

      <div className="flex flex-1 items-center justify-center gap-1.5">
        {metrics.map((m) => (
          <BeveledButton
            key={m.key}
            onClick={m.onClick}
            label={m.label}
            base={m.base}
            face={m.face}
            text={m.text}
            socket={m.socket}
            icon={m.icon}
            value={m.value}
            bump={m.bump}
          />
        ))}
      </div>

      <AnchorButton
        onClick={onBellClick}
        label={dueCount > 0 ? `${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser` : 'Notifications'}
      >
        <Bell size={18} className="text-[var(--neo-ink)]" />
        {dueCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[0.62rem] font-black leading-none text-white">
            {dueCount > 9 ? '9+' : dueCount}
          </span>
        )}
      </AnchorButton>
    </div>
  );
}
