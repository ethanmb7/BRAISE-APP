import { Check, Flame, Sparkles } from "lucide-react";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";

interface TodayStripProps {
  /** Number of consecutive days completed before today. The detailed count remains available in
   * the HUD; this quieter block only uses it to make the daily rhythm feel personal. */
  streak: number;
  dailyGoalMet: boolean;
  /** Real XP remaining to hit today's goal — same unit as the header badge. */
  remaining: number;
  goalPct: number;
  /** Notions waiting for a refresh (the same number as the card under the strip). */
  dueCount: number;
  onShare: () => void;
}

/**
 * A deliberately quiet companion to the Pioche, not a second dashboard card. The old component
 * repeated the HUD's streak and freeze controls, a seven-day calendar, an urgency state and a
 * second large CTA. That made the student decide between two competing "main" areas immediately
 * after landing on Accueil. This strip now has one job: situate today's mission and, only once
 * the daily goal is complete, offer the next real action.
 */
export function TodayStrip({
  streak,
  dailyGoalMet,
  remaining,
  goalPct,
  dueCount,
  onShare,
}: TodayStripProps) {
  const { t } = useTone();
  const goalMet = dailyGoalMet || remaining === 0;
  const allDone = goalMet && dueCount === 0;
  const progressLabel = goalMet ? "Objectif du jour validé" : `${goalPct}% de ton objectif du jour`;
  const rhythmLine = t(
    goalMet
      ? streak > 0
        ? COPY.home.rhythmMetWithStreak
        : COPY.home.rhythmMet
      : COPY.home.rhythmRemaining(remaining),
  );

  return (
    <section
      aria-label="Ton rythme du jour"
      className="rounded-2xl border-[2.5px] border-[var(--neo-ink)] bg-[var(--paper)] px-3.5 py-2 shadow-[3px_3px_0_var(--neo-ink)]"
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          {goalMet ? (
            <Check size={20} strokeWidth={3} className="text-emerald-600" />
          ) : (
            <Flame size={20} fill="#FF6B35" color="#151821" strokeWidth={2.5} />
          )}
        </span>
        <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-[var(--ink)]">
          {rhythmLine}
        </p>
        {goalMet && (
          <span className="flex-shrink-0 text-xs font-black text-[var(--ink-soft)]">Validé</span>
        )}
      </div>

      {!goalMet && (
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full border-2 border-[var(--neo-ink)] bg-white"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={goalPct}
        >
          <div
            className="h-full rounded-full bg-[#FF6B35] transition-[width] duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      )}

      {allDone && (
        <button
          type="button"
          onClick={onShare}
          className="mt-2.5 inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black text-black shadow-[2px_2px_0px_0px_#000] transition-transform active:translate-y-[2px] active:shadow-none"
        >
          <Sparkles size={15} />
          {t(COPY.home.keepMoment)}
        </button>
      )}
    </section>
  );
}
