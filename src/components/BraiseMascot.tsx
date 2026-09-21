import { useApp } from '@/store';
import { getRankInfo } from '@/lib/aura';

type Mood = 'happy' | 'hesitant' | 'proud' | 'sleepy' | 'cool' | 'frozen';

type Props = { size?: number; className?: string; mood?: Mood; rankId?: string };

const MOOD_CLASS: Record<Mood, string> = {
  happy: 'mood-happy',
  hesitant: 'mood-hesitant',
  proud: 'mood-proud',
  sleepy: 'mood-sleepy',
  cool: 'mood-proud',
  frozen: 'mood-frozen',
};

// Per-rank flame palette, [outer, middle, inner] — reusing hex values already established
// elsewhere in the app rather than inventing a disconnected set: bronze is the original brand
// default (#FF4500 etc.), platine's icy cyan echoes the same family as the streak-freeze
// snowflake, légende's inner gold matches bronze's own tip and the coral already used for
// SapiLogo/badges. Optional and defaults to bronze, so every existing call site (onboarding,
// SubjectView, TodayStrip) renders exactly as before — only the rank-up celebration passes this.
export const RANK_FLAME_COLORS: Record<string, [string, string, string]> = {
  bronze: ['#FF4500', '#FF9A3D', '#FFD84B'],
  // Was a slate-grey scale (#64748B/#CBD5E1/#F1F5F9) — matches aura.ts's argent fix: a vivid
  // chrome blue instead of a desaturated grey, so the mascot and the rank's own colours agree.
  argent: ['#3373D6', '#7DD3FC', '#E0F2FE'],
  or: ['#B45309', '#F59E0B', '#FDE68A'],
  platine: ['#0E7490', '#22D3EE', '#CFFAFE'],
  legende: ['#9D174D', '#FF6F59', '#FFD84B'],
};

export function BraiseMascot({ size = 80, className = '', mood = 'happy', rankId }: Props) {
  // Real, current rank by default — every existing call site (onboarding, lessons, the profile
  // trophy, the chat drawers...) picks it up for free with no prop drilling, so "Braise looks
  // like your rank" is true everywhere at once rather than only in the one screen that remembered
  // to pass it. `useApp()` is safe unconditionally here: BraiseMascot is only ever rendered inside
  // <AppProvider>. An explicit `rankId` still overrides this — RankUpCelebration needs the OLD
  // rank for the first half-second of its own transformation, before morphing to the new one.
  const { state } = useApp();
  const effectiveRankId = rankId ?? getRankInfo(state.xp).current.id;
  const moodClass = MOOD_CLASS[mood];
  const hideEyes = mood === 'cool';
  const [outer, middle, inner] = RANK_FLAME_COLORS[effectiveRankId] ?? RANK_FLAME_COLORS.bronze;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`braise-mascot ${moodClass} ${mood === 'frozen' ? 'mood-frozen-tint' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Braise, la mascotte"
    >
      {/* Same 3-stop palette as the hero card's own flame SVG (#FF4500 = the real --neo-orange
          brand token) — this component previously used generic Tailwind orange (#F97316), so
          the one character rendered with two different colour identities depending on which
          component drew it. This is now the one source of truth for the mascot's colour. */}
      {/* Outer flame */}
      <path
        className="flame-outer"
        d="M50 6 C 60 24, 72 30, 72 52 C 72 70, 62 82, 50 82 C 38 82, 28 70, 28 52 C 28 34, 40 30, 44 18 C 46 12, 48 8, 50 6 Z"
        fill={outer}
        style={{ transition: 'fill 0.4s ease' }}
      />
      {/* Middle flame */}
      <path
        className="flame-middle"
        d="M50 22 C 56 34, 64 38, 64 54 C 64 66, 58 74, 50 74 C 42 74, 36 66, 36 54 C 36 42, 44 38, 46 30 C 47 26, 49 24, 50 22 Z"
        fill={middle}
        style={{ transition: 'fill 0.4s ease' }}
      />
      {/* Inner flame */}
      <path
        className="flame-inner"
        d="M50 38 C 54 46, 58 48, 58 58 C 58 64, 54 68, 50 68 C 46 68, 42 64, 42 58 C 42 50, 48 48, 48 42 C 49 40, 49 39, 50 38 Z"
        fill={inner}
        style={{ transition: 'fill 0.4s ease' }}
      />

      {/* Rank evolution — not just a recolour: the head itself gains a new, single feature per
          rank, each more elaborate than the last (a plain accent → a second flame lobe → faceted
          cuts → an integrated crown). Every tier keeps exactly the same flame body underneath, so
          Braise is always recognisably Braise — evolution adds, it never replaces. Deliberately
          one new feature per tier rather than stacking every previous one: this renders as small
          as 20px in some places (chat avatars), and four accents at once would just be noise at
          that size. */}
      {effectiveRankId === 'argent' && (
        <g className="braise-rank-argent">
          <path d="M50 0 L55.5 8 L50 16 L44.5 8 Z" fill="#CFE8FF" stroke="#151821" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M50 0 L50 16 M44.5 8 L55.5 8" stroke="#3373D6" strokeWidth="0.6" opacity="0.7" />
        </g>
      )}
      {effectiveRankId === 'or' && (
        <g className="braise-rank-or">
          <path
            d="M65 15 C 70.5 20.5, 75 25, 73 33 C 71 39.5, 64.5 41, 61.5 36.5 C 59 32.5, 61 28.5, 63 24.5 C 64.5 21, 64.5 18, 65 15 Z"
            fill="#FDE68A"
            stroke="#151821"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="66.5" cy="24" r="1.3" fill="#fff" opacity="0.8" />
        </g>
      )}
      {effectiveRankId === 'platine' && (
        <g className="braise-rank-platine">
          <path
            d="M33 21 L39.5 27.5 M67 21 L60.5 27.5 M29.5 39 L37 43 M70.5 39 L63 43"
            stroke="#0E7490"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path d="M50 4 L54 11 L50 18 L46 11 Z" fill="#CFFAFE" stroke="#151821" strokeWidth="1.4" strokeLinejoin="round" />
        </g>
      )}
      {effectiveRankId === 'legende' && (
        <g className="braise-rank-legende">
          <path
            d="M40 14 L43 2 L50 10 L57 2 L60 14 L58 17 L42 17 Z"
            fill="#FFD84B"
            stroke="#151821"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="2" r="1.5" fill="#FF6F59" stroke="#151821" strokeWidth="0.8" />
          <circle cx="57" cy="2" r="1.5" fill="#FF6F59" stroke="#151821" strokeWidth="0.8" />
          <circle cx="50" cy="10" r="1.7" fill="#FF6F59" stroke="#151821" strokeWidth="0.8" />
        </g>
      )}

      {/* Eyes */}
      {!hideEyes && (
        <g className="braise-eyes">
          <circle cx="42" cy="54" r="3.2" fill="#16213A" />
          <circle cx="58" cy="54" r="3.2" fill="#16213A" />
          <circle cx="43" cy="53" r="1" fill="#fff" />
          <circle cx="59" cy="53" r="1" fill="#fff" />
        </g>
      )}
      {/* Smile */}
      <path
        className="braise-smile"
        d="M44 62 Q 50 67, 56 62"
        stroke="#16213A"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cheeks */}
      <circle cx="38" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />
      <circle cx="62" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />

      {/* Sunglasses — success mood */}
      {mood === 'cool' && (
        <g className="braise-sunglasses">
          <rect x="34.5" y="49.5" width="12" height="8" rx="4" fill="#16213A" />
          <rect x="53.5" y="49.5" width="12" height="8" rx="4" fill="#16213A" />
          <rect x="46.5" y="52" width="7" height="2" fill="#16213A" />
          <path d="M33 51 L 28 49" stroke="#16213A" strokeWidth="2" strokeLinecap="round" />
          <path d="M67 51 L 72 49" stroke="#16213A" strokeWidth="2" strokeLinecap="round" />
          <rect x="37" y="51.5" width="4" height="2.5" rx="1" fill="#fff" opacity="0.5" />
          <rect x="56" y="51.5" width="4" height="2.5" rx="1" fill="#fff" opacity="0.5" />
        </g>
      )}

      {/* Ice cube — streak freeze active */}
      {mood === 'frozen' && (
        <g className="braise-ice">
          <path
            d="M28 34 C 20 40, 20 66, 28 80 C 38 88, 62 88, 72 80 C 80 66, 80 40, 72 34 C 62 26, 38 26, 28 34 Z"
            fill="#BEE7F5"
            opacity="0.55"
          />
          <path d="M34 40 L 40 46 M60 40 L 66 46 M40 70 L 46 76" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <path d="M25 62 L 33 58 L 30 68 Z" fill="#DFF4FB" stroke="#fff" strokeWidth="0.6" />
          <path d="M75 58 L 67 54 L 70 64 Z" fill="#DFF4FB" stroke="#fff" strokeWidth="0.6" />
        </g>
      )}
    </svg>
  );
}

export function SapiLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4 C 24 11, 29 13, 29 22 C 29 29, 25 33, 20 33 C 15 33, 11 29, 11 22 C 11 15, 16 13, 18 8 C 19 6, 19 5, 20 4 Z"
        fill="#FF6F59"
      />
      <path
        d="M20 11 C 23 16, 26 17, 26 23 C 26 27, 23 30, 20 30 C 17 30, 14 27, 14 23 C 14 19, 17 17, 18 14 C 19 12, 19 11, 20 11 Z"
        fill="#FFC24B"
      />
      <circle cx="17" cy="22" r="1.5" fill="#16213A" />
      <circle cx="23" cy="22" r="1.5" fill="#16213A" />
      <path d="M18 26 Q 20 28, 22 26" stroke="#16213A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
