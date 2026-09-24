import { ArrowRight, Sparkles } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';
import { todayRhythmLine, type VoiceCtx } from '@/lib/braiseVoice';

interface TodayStripProps {
  /** Number of consecutive days completed before today. The detailed count remains available in
   * the HUD; this quieter block only uses it to make the daily rhythm feel personal. */
  streak: number;
  dailyGoalMet: boolean;
  /** Real card-equivalent activity remaining, derived from the same formula as the goal gauge. */
  remaining: number;
  goalPct: number;
  /** Real spaced-repetition cards currently due. */
  dueCount: number;
  /** Real freezes left in the bank (store.tsx) — 0 with an active streak is the one real "act
   *  today or the streak breaks tonight" state worth a heads-up (never a threat, see
   *  todayRhythmLine's own comment). */
  freezes: number;
  /** Real prior activity (xp or completedChapters) on this device — the only way to tell a
   *  genuine first-ever visit (streak 0, nothing to restart) from a real gap since the last
   *  session (streak 0, but there IS a history to pick back up). */
  hasPriorActivity: boolean;
  voiceCtx: VoiceCtx;
  onContinue: () => void;
  onShare: () => void;
}

/**
 * A deliberately quiet companion to the Pioche, not a second dashboard card. The old component
 * repeated the HUD's streak and freeze controls, a seven-day calendar, an urgency state and a
 * second large CTA. That made the student decide between two competing "main" areas immediately
 * after landing on Accueil. This strip now has one job: situate today's mission and, only once
 * the daily goal is complete, offer the next real action.
 *
 * Braise's own face used to be absent from all of Aujourd'hui — HeroPiocheCard shows the chest,
 * not the mascot, and the flame/check badge here was a generic Lucide glyph with no personality.
 * This is now the one spot on the screen seen every single day where Braise's mood reacts to
 * what's actually true right now, the same "resting, not disappointed" / "heads-up, not a threat"
 * principles already established in ProfilAuraView/ProfileView, just finally reaching Home too.
 */
export function TodayStrip({
  streak,
  dailyGoalMet,
  remaining,
  goalPct,
  dueCount,
  freezes,
  hasPriorActivity,
  voiceCtx,
  onContinue,
  onShare,
}: TodayStripProps) {
  const goalMet = dailyGoalMet || remaining === 0;
  const allDone = goalMet && dueCount === 0;
  const progressLabel = goalMet ? 'Objectif du jour validé' : `${goalPct}% de ton objectif du jour`;

  // Highest-priority real signal first — see todayRhythmLine's own comment for why each one
  // exists and why the order matters (a freeze about to be spent matters more today than a
  // generic progress count, but never more than the goal already being real and done).
  const { kind, mood } = goalMet
    ? streak > 0
      ? { kind: 'goal-met-streak' as const, mood: 'proud' as const }
      : { kind: 'goal-met-fresh' as const, mood: 'proud' as const }
    : streak > 0 && freezes === 0
      ? { kind: 'freeze-danger' as const, mood: 'hesitant' as const }
      : streak === 0 && hasPriorActivity
        ? { kind: 'returning' as const, mood: 'sleepy' as const }
        : { kind: 'progressing' as const, mood: 'eager' as const };
  const rhythmLine = todayRhythmLine(voiceCtx, kind, remaining);

  return (
    <section aria-label="Ton rythme du jour" className="rounded-2xl border-2 border-black/15 bg-black/[0.035] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black ${
            goalMet ? 'bg-emerald-300' : 'bg-[#FFE08A]'
          }`}
        >
          <BraiseMascot size={26} mood={mood} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[0.64rem] font-black uppercase tracking-wide text-black/55">Ton rythme du jour</p>
            <span className="flex-shrink-0 text-xs font-black text-black/70">{goalMet ? 'Validé' : `${goalPct}%`}</span>
          </div>
          <p className="mt-0.5 text-sm font-bold leading-snug text-[#151821]">{rhythmLine}</p>

          {!goalMet && (
            <div
              className="mt-2.5 h-2 overflow-hidden rounded-full border border-black/25 bg-white"
              role="progressbar"
              aria-label={progressLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={goalPct}
            >
              <div className="h-full rounded-full bg-[#FF6B35] transition-[width] duration-500" style={{ width: `${goalPct}%` }} />
            </div>
          )}

          {goalMet && dueCount > 0 && (
            <button
              type="button"
              onClick={onContinue}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black text-black shadow-[2px_2px_0px_0px_#000] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <Sparkles size={15} />
              Revoir {dueCount} notion{dueCount > 1 ? 's' : ''}
              <ArrowRight size={15} />
            </button>
          )}

          {allDone && (
            <button
              type="button"
              onClick={onShare}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black text-black shadow-[2px_2px_0px_0px_#000] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <Sparkles size={15} />
              Garder ce moment
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
