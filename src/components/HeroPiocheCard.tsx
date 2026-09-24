import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowRight, Clock3, Layers3 } from 'lucide-react';
import { BraisePioche } from '@/components/BraisePioche';
import { sfx } from '@/lib/sound';
import { getLastPiocheOpenDate, setLastPiocheOpenDate } from '@/lib/celebrations';
import { firePiocheReveal, getPiocheRevealTiming } from '@/lib/piocheTransition';

interface HeroPiocheCardProps {
  /** Fuller sentence (from `dailyPickLine()`) announced to screen readers only — folds the
   *  personalised hook, chapter and subject into one flowing sentence, even though none of that
   *  shows as its own visible line in the card (matches the photo reference: a plain 3-line
   *  stack, no 4th hook line). */
  bubbleLine: string;
  subjectName?: string;
  /** A subject-owned colour used as a small identity signal, never as the CTA colour. */
  subjectColor?: string;
  chapterTitle: string;
  /** The real chapter's own `duration` field (data.ts) — minutes, never a guessed number. */
  duration: number;
  /** Real count of FLASHCARDS tagged with this chapter's id — not a fixed session size; every
   *  chapter has its own real deck. */
  cardCount: number;
  soundOn: boolean;
  onStart: () => void;
}

// Eleventh pass — Braise's spot in the card is now a small chest (BraiseChest), built from the
// "Le Choix de Braise" mockup review: she's clipped so only her head and a pickaxe (the literal
// tool, punning on "pioche") ever cross above the chest's opening, never a full-body entrance. The
// card's own rectangular frame stays completely static, same rule as every pass since the ninth —
// only the chest and its contents move.
//
// The click fires the real audio/haptic sequence itself (sfx.chestOpen/chestOpenQuick, both new,
// each internally timed to the chest's own beats — see BraiseChest's file header) rather than a
// single whoosh at navigation time, and decides once, synchronously, whether this is the day's
// first "pioche" open (full ~900ms ceremony) or a same-day reopen (abbreviated ~420ms) — read and
// written here rather than lifted to HomeView because both the read and the write have to happen
// at the exact instant of the click, before the animation choice is made; HomeView's onStart prop
// only fires later, at the delayed navigation.
export function HeroPiocheCard({ bubbleLine, subjectName, subjectColor, chapterTitle, duration, cardCount, soundOn, onStart }: HeroPiocheCardProps) {
  const [hyped, setHyped] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [quick, setQuick] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current);
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  const unhype = () => setHyped(false);

  const handleStart = () => {
    if (launching) return;
    const firstToday = getLastPiocheOpenDate() !== new Date().toDateString();
    setLastPiocheOpenDate();
    setQuick(!firstToday);
    (firstToday ? sfx.chestOpen : sfx.chestOpenQuick)(soundOn);
    // The real navigation (onStart → openSubject) unmounts this component immediately, so it's
    // delayed just long enough for the chosen sequence to actually be seen before the screen
    // changes — the full ceremony needs ~900ms to land, the abbreviated repeat only ~420ms.
    const totalMs = firstToday ? 900 : 420;
    setLaunching(true);
    launchTimer.current = setTimeout(onStart, totalMs);
    // Fires PiocheRevealVeil's light burst timed to peak right as the view actually swaps — see
    // piocheTransition.ts for why this and launchTimer share one timing source instead of two
    // separately-guessed numbers.
    revealTimer.current = setTimeout(() => firePiocheReveal(totalMs), totalMs - getPiocheRevealTiming(totalMs).fadeInMs);
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* The frame stays immobile for as long as there's anything to read: no jitter, no idle
          drift, nothing that costs a DYS/TDAH reader attention while they're actually looking at
          the mission. The one exception is deliberate and one-way — a small scale-up exactly
          while `launching` is true, already the "committed to leaving" state, so the card leans
          into the handoff instead of just vanishing. A real cross-view shared-element morph
          (layoutId into whatever LessonView shows) isn't attempted: App.tsx's view switch is a
          plain conditional with no AnimatePresence, so the outgoing view unmounts before any
          such animation could run — wiring that in would mean restructuring the mount/unmount
          timing for every view transition in the app, not just this one. PiocheRevealVeil (see
          piocheTransition.ts) already covers the actual cut; this is a small, safe complement to
          it, not a replacement. */}
      <motion.section
        className="relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#FF6B35] p-4 shadow-[4px_4px_0px_0px_#000]"
        aria-label={`Mission du jour : ${chapterTitle}`}
        animate={{ scale: launching ? 1.025 : 1 }}
        // Same full/quick split as everything else in this ceremony (BraiseChest, the reveal
        // veil): a same-day reopen unmounts this component at 420ms, well before a 500ms scale-up
        // would finish — matching the shorter window here instead of leaving it visibly cut off.
        transition={{ duration: quick ? 0.22 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex items-center gap-3">
          <div className="relative flex h-[92px] w-[92px] flex-shrink-0 items-end justify-center">
            <span aria-hidden="true" className="absolute inset-[6px] rounded-full bg-[#FDC800]/35" />
            <BraisePioche size={88} hyped={hyped} diving={launching} quick={quick} />
          </div>
          <div className="min-w-0 flex-1">
            {/* Dark ink, not white — #FF6B35 measures 2.84:1 for white text (a hard AA
                failure), 6.25:1 for dark ink. Three real fonts: font-mono for the eyebrow
                (same as every other small-caps label app-wide), font-display for the title,
                font-sans for the stats line. */}
            <p className="font-mono text-[0.64rem] font-black uppercase tracking-[0.1em] text-[#151821]/75">
              Pioche du jour
            </p>
            <h2 className="mt-0.5 line-clamp-2 font-display text-[1.08rem] font-black leading-[1.08] text-[#151821]">{chapterTitle}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] font-bold text-[#151821]/75">
              <span aria-hidden="true" className="h-2.5 w-2.5 flex-none rounded-full border border-[#151821]" style={{ background: subjectColor ?? '#FDC800' }} />
              <span className="truncate">{subjectName ?? 'Mission'}</span>
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[#151821]/75" aria-label="Les repères de ta mission">
              <span className="flex items-center gap-1 font-mono text-[0.6rem] font-black"><Clock3 size={13} strokeWidth={3} aria-hidden="true" />{duration} MIN</span>
              <span className="flex items-center gap-1 font-mono text-[0.6rem] font-black"><Layers3 size={13} strokeWidth={3} aria-hidden="true" />{cardCount} CARTE{cardCount > 1 ? 'S' : ''}</span>
            </div>
          </div>
        </div>
        <span className="sr-only">
          {bubbleLine} Cette mission contient {cardCount} carte{cardCount > 1 ? 's' : ''}, dure environ {duration} minutes et rapporte 50 points d'Aura à sa première validation.
        </span>

        {launching && <span className="sr-only" role="status">Braise révèle ta mission.</span>}

        <div className="group relative mt-3">
          <span aria-hidden="true" className="absolute inset-0 translate-y-[2px] rounded-xl border-2 border-black bg-black" />
          <button
            onPointerEnter={() => setHyped(true)}
            onPointerDown={() => setHyped(true)}
            onPointerUp={unhype}
            onPointerLeave={unhype}
            onPointerCancel={unhype}
            onClick={handleStart}
            disabled={launching}
            className="relative flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-[#FFF8EE] px-3 py-2 font-display text-[0.92rem] font-black text-black shadow-[2px_2px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[2px] group-active:shadow-none disabled:opacity-95"
          >
            {launching ? 'OUVERTURE…' : 'COMMENCER'}
            <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </motion.section>
    </MotionConfig>
  );
}
