import { Zap, Star, Clock, PartyPopper } from 'lucide-react';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { TrophyIcon } from '@/components/TrophyIcon';
import { SnowflakeIcon } from '@/components/SnowflakeIcon';

const WEEKDAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface TodayStripProps {
  streak: number;
  /** Whether today's goal is already met — the one signal that tells the week strip whether
   *  today's own cell is secured (flame + star) or still open (outline). `streak` itself is
   *  read as "consecutive days before today", matching the coaching copy below it (which always
   *  talks about today's goal as not yet banked even when streak > 0). */
  dailyGoalMet: boolean;
  /** From `remainingToGoal` in store.tsx — real "cards-equivalent" left to hit today's goal,
   *  same weighting as the gauge percentage. 0 once the goal is met. */
  remaining: number;
  /** From `computeGoalPct` in store.tsx. */
  goalPct: number;
  /** Real spaced-repetition due count (same value the HUD bell already shows) — used here only
   *  to give an honest "something real to do" once today's goal is already met, never a
   *  fabricated bonus tier. */
  dueCount: number;
  /** Real freeze count (state.freezes) — shown here too, next to the streak it protects, not
   *  just in the header HUD; both real, both the same number. */
  freezes: number;
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
export function TodayStrip({ streak, dailyGoalMet, remaining, goalPct, dueCount, freezes, onContinue, onShare }: TodayStripProps) {
  const isEvening = new Date().getHours() >= 19;
  const atRisk = remaining > 0 && isEvening;
  const goalMet = remaining <= 0;
  // Real 7-day window (Monday-first, current calendar week only — never reaches back further
  // than that, so a streak longer than "days so far this week" just runs off the start of the
  // strip instead of guessing at a previous week). `streak` counts days BEFORE today (see prop
  // doc); today's own cell reads `dailyGoalMet` directly rather than being folded into the count.
  // A reference version of this logic marked every day before today as "done" whenever streak >
  // 0, regardless of the real streak length — a streak of 1 on a Friday would show four false
  // "done" days. Kept the real count-based version instead: a day only lights up if it's
  // actually inside the real streak.
  const todayIdx = (new Date().getDay() + 6) % 7;
  const weekCells = WEEKDAY_LETTERS.map((letter, i) => {
    const offset = todayIdx - i;
    const kind = offset === 0 ? (dailyGoalMet ? 'done-today' : 'pending-today') : offset > 0 && offset <= streak ? 'done-past' : 'empty';
    return { letter, kind };
  });
  // Nothing left at all today — the one state where this card's usual job (urgency copy plus a
  // gauge worth watching) is already finished. A gauge frozen at 100% doesn't tell you anything
  // new at that point, so the padding and the gauge built for "here's your progress, here's
  // what's left" become empty weight once there's genuinely nothing left to track. Every other
  // state (goal not yet met, or met but still with due cards to review) keeps the full card.
  const allDone = goalMet && dueCount === 0;

  const coachingText = atRisk
    ? `Encore ${remaining} carte${remaining > 1 ? 's' : ''} ce soir pour garder ta série !`
    : remaining > 0
      ? `Plus que ${remaining} carte${remaining > 1 ? 's' : ''} pour valider ta Braise !`
      : 'Objectif du jour dans la poche !';

  return (
    <div className={`relative rounded-2xl border-[2.5px] border-black bg-white shadow-[3px_3px_0px_0px_#000] ${allDone ? 'p-3' : 'p-4'}`}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#FF6B35] shadow-[2px_2px_0px_0px_#000]">
              <StreakFlameIcon size={17} />
            </span>
            <div>
              {/* text-xl, not text-lg: this counter is the app's central retention lever, it
                  shouldn't render smaller than a deck card's subject name or the HUD's own
                  numbers. */}
              <b className="block font-display text-xl font-black leading-tight text-black">
                {streak} jour{streak > 1 ? 's' : ''}
              </b>
              <span className="text-xs font-bold text-black/50">de série en cours</span>
            </div>
          </div>
          {/* Real freeze count — same value the header HUD already shows, next to the streak it
              protects this time, not duplicated data. */}
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border-2 border-black bg-blue-600 px-2.5 py-1 text-sm font-black text-white shadow-[2px_2px_0px_0px_#000]">
            <SnowflakeIcon size={14} />
            {freezes}
          </span>
        </div>

        {/* One bordered box per day (letter + marker both inside), not a letter floating below
            a separate icon circle. Today's cell and any already-banked day both get a solid
            fill distinct from the plain white/grey "nothing yet" cells — green for a day already
            behind you, amber for today. White text needed real darkening to stay legible:
            emerald-500 measured 2.5:1 for white text, emerald-700 clears it at 5.5:1. */}
        {/* Height was 60px, noticeably taller than wide at real phone widths (~45px cells on a
            375px screen) — blockier than the reference's near-square cells. 46px brings it back
            close to square there. */}
        <div className="mt-3 flex justify-between gap-1">
          {weekCells.map((cell, i) => (
            <div
              key={i}
              className={`flex h-[46px] flex-1 flex-col items-center justify-between rounded-lg border-2 py-1 ${
                cell.kind === 'done-past'
                  ? 'border-black bg-emerald-700'
                  : cell.kind === 'done-today'
                    ? 'border-black bg-amber-400'
                    : cell.kind === 'pending-today'
                      ? 'border-dashed border-black/40 bg-white'
                      : 'border-black/25 bg-white'
              }`}
            >
              <span
                className={`text-[0.6rem] font-black ${
                  cell.kind === 'done-past' ? 'text-white' : cell.kind === 'done-today' ? 'text-black' : 'text-black/40'
                }`}
              >
                {cell.letter}
              </span>
              {cell.kind === 'done-past' && <StreakFlameIcon size={11} />}
              {cell.kind === 'done-today' && <Star size={11} fill="#151821" color="#151821" />}
              {(cell.kind === 'pending-today' || cell.kind === 'empty') && (
                <span className="h-1 w-1 rounded-full bg-black/25" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-black/70">
          {atRisk && <Clock size={15} className="flex-shrink-0" />}
          {!atRisk && remaining <= 0 && <PartyPopper size={15} className="flex-shrink-0" />}
          {coachingText}
        </p>
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
            <TrophyIcon size={16} />
            Partager ma série
          </span>
        </button>
      )}
    </div>
  );
}
