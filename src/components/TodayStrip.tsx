import { ArrowRight, Check, Flame, Sparkles } from 'lucide-react';

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
  onContinue: () => void;
  onShare: () => void;
}

/**
 * A deliberately quiet companion to the Pioche, not a second dashboard card. The old component
 * repeated the HUD's streak and freeze controls, a seven-day calendar, an urgency state and a
 * second large CTA. That made the student decide between two competing "main" areas immediately
 * after landing on Accueil. This strip now has one job: situate today's mission and, only once
 * the daily goal is complete, offer the next real action.
 */
export function TodayStrip({ streak, dailyGoalMet, remaining, goalPct, dueCount, onContinue, onShare }: TodayStripProps) {
  const goalMet = dailyGoalMet || remaining === 0;
  const allDone = goalMet && dueCount === 0;
  const progressLabel = goalMet ? 'Objectif du jour validé' : `${goalPct}% de ton objectif du jour`;
  const rhythmLine = goalMet
    ? streak > 0
      ? `Belle régularité : ta série continue.`
      : `Ton objectif du jour est validé.`
    : `Encore ${remaining} étape${remaining > 1 ? 's' : ''} pour boucler ta journée.`;

  return (
    <section aria-label="Ton rythme du jour" className="rounded-2xl border-2 border-black/15 bg-black/[0.035] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black ${
            goalMet ? 'bg-emerald-300' : 'bg-[#FFE08A]'
          }`}
        >
          {goalMet ? <Check size={19} strokeWidth={3} /> : <Flame size={19} fill="#FF6B35" color="#151821" strokeWidth={2.5} />}
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
