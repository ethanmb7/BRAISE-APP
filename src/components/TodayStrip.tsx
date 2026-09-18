import { Zap, Trophy } from 'lucide-react';

interface TodayStripProps {
  streak: number;
  /** From `remainingToGoal` in store.tsx — real "cards-equivalent" left to hit today's goal,
   *  same weighting as the gauge percentage. 0 once the goal is met. */
  remaining: number;
  /** From `computeGoalPct` in store.tsx. */
  goalPct: number;
  /** Real spaced-repetition due count (same value the HUD bell already shows) — used here only
   *  to give an honest "something real to do" once today's goal is already met, never a
   *  fabricated bonus tier. */
  dueCount: number;
  /** Navigates to the real Réviser tab — only rendered as a button when dueCount > 0, so it's
   *  never a dead click. */
  onContinue: () => void;
  /** Opens the real ShareAuraModal (already built, already used from Ton Aura) — shown here only
   *  when dueCount is also 0, i.e. there's genuinely nothing left to do: the moment of highest
   *  real accomplishment is a better place for the one native sharing feature than a passive
   *  "rien d'autre en attente" that used to just end the loop. */
  onShare: () => void;
}

// Amber neobrutalist card. Streak/remaining/dueCount are all real store values.
//
// "At risk" state (investor audit: the streak badge never signals urgency) — derived from two
// real signals only: today's goal not yet met, and the real current hour past 19h. 19h is a
// judgment call (evening wind-down for a collège/lycée schedule), not a hidden mechanic; past
// that hour with the goal unmet, the copy and gauge colour turn urgent. No streak-loss penalty
// is invented — the real freeze/streak rules already live in store.tsx, untouched.
//
// Post-goal state (investor audit: validating today's goal was a dead end) — once remaining
// reaches 0, if there are still real due cards (`dueCount`), a real button navigates to Réviser
// for real, unmultiplied XP per card. It's deliberately not framed as "Boost x2": there is no
// multiplier anywhere in the XP math, and a button that claims one without doing it would be a
// worse trust break than the dead end it replaces. If dueCount is also 0, no button renders —
// there's genuinely nothing left to do today.
export function TodayStrip({ streak, remaining, goalPct, dueCount, onContinue, onShare }: TodayStripProps) {
  const isEvening = new Date().getHours() >= 19;
  const atRisk = remaining > 0 && isEvening;
  const goalMet = remaining <= 0;
  // Nothing left at all today — the one state where this card's usual job (urgency copy plus a
  // gauge worth watching) is already finished. A gauge frozen at 100% doesn't tell you anything
  // new at that point, so the padding and the gauge built for "here's your progress, here's
  // what's left" become empty weight once there's genuinely nothing left to track. Every other
  // state (goal not yet met, or met but still with due cards to review) keeps the full card.
  const allDone = goalMet && dueCount === 0;

  const coaching = atRisk
    ? `⏰ Encore ${remaining} carte${remaining > 1 ? 's' : ''} ce soir pour garder ta série !`
    : remaining > 0
      ? `Plus que ${remaining} carte${remaining > 1 ? 's' : ''} pour valider ta Braise !`
      : 'Objectif du jour dans la poche ! 🎉';

  return (
    <div
      className={`relative rounded-2xl border-[2.5px] border-black bg-amber-400 shadow-[3px_3px_0px_0px_#000] ${allDone ? 'p-3' : 'p-4'}`}
    >
      <div>
        {/* text-lg, not text-base: this counter is the app's central retention lever, it
            shouldn't render smaller than a deck card's subject name or the HUD's own numbers. */}
        <b className="block font-display text-lg font-black leading-tight text-black">
          Ta série : {streak} jour{streak > 1 ? 's' : ''} ! 🔥
        </b>
        <p className="mt-1 text-sm font-bold text-black/80">{coaching}</p>
      </div>

      {!allDone && (
        <div className="mt-3 h-3.5 rounded-full border border-black bg-black/70 p-0.5">
          <div
            className={`h-full rounded-full transition-[width,background-color] duration-500 ${atRisk ? 'bg-red-400' : 'bg-emerald-400'}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
      )}

      {goalMet && dueCount > 0 && (
        <button
          onClick={onContinue}
          className="group relative mt-3 block w-full"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-y-[2px] rounded-xl border-2 border-black bg-emerald-700"
          />
          <span className="relative flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-emerald-400 px-3 py-2 text-sm font-black text-black transition-transform duration-100 group-active:translate-y-[2px]">
            <Zap size={14} className="fill-black" />
            Lancer une manche bonus · {dueCount} carte{dueCount > 1 ? 's' : ''}
          </span>
        </button>
      )}

      {allDone && (
        <button
          onClick={onShare}
          className="group relative mt-2 block w-full"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-y-[2px] rounded-xl border-2 border-black bg-black/60"
          />
          <span className="relative flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black text-black transition-transform duration-100 group-active:translate-y-[2px]">
            <Trophy size={14} />
            Partager ma série
          </span>
        </button>
      )}
    </div>
  );
}
