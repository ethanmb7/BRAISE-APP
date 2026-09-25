import { useApp } from '@/store';
import { getRankInfo } from '@/lib/aura';
import { BraiseCharacter, BRAISE_RANK_COLORS, type BraiseExpression } from './BraiseCharacter';

// `eager` is new: a beckoning side-to-side rock, not `proud`'s big vertical bounce. `proud` is
// the right tense for "you just did something" (a rank-up, a badge) — wrong tense for a card
// whose whole job is inviting you to start something you haven't done yet. Built for the daily
// pioche card specifically, real enough elsewhere to keep as a real mood, not a one-off hack.
type Mood = 'happy' | 'hesitant' | 'proud' | 'sleepy' | 'cool' | 'frozen' | 'eager';

type Props = { size?: number; className?: string; mood?: Mood; rankId?: string };

const MOOD_CLASS: Record<Mood, string> = {
  happy: 'mood-happy',
  hesitant: 'mood-hesitant',
  proud: 'mood-proud',
  sleepy: 'mood-sleepy',
  cool: 'mood-proud',
  frozen: 'mood-frozen',
  eager: 'mood-eager',
};

// Per-rank flame palette, [outer, middle, inner] — reusing hex values already established
// elsewhere in the app rather than inventing a disconnected set: bronze is the original brand
// default (#FF4500 etc.), platine's icy cyan echoes the same family as the streak-freeze
// snowflake, légende's inner gold matches bronze's own tip and the coral already used for
// badges. Optional and defaults to bronze, so every existing call site (onboarding,
// SubjectView, TodayStrip) renders exactly as before — only the rank-up celebration passes this.
export const RANK_FLAME_COLORS: Record<string, [string, string, string]> = {
  ...BRAISE_RANK_COLORS,
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
  return <BraiseCharacter size={size} rankId={effectiveRankId} expression={mood as BraiseExpression} className={`${MOOD_CLASS[mood]} ${className}`} />;
}
