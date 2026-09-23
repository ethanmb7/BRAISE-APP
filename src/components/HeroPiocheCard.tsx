import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { BraiseChest } from '@/components/BraiseChest';
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
export function HeroPiocheCard({ bubbleLine, subjectName, chapterTitle, duration, cardCount, soundOn, onStart }: HeroPiocheCardProps) {
  const [hyped, setHyped] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [quick, setQuick] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout>>();
  const revealTimer = useRef<ReturnType<typeof setTimeout>>();

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
        className="relative overflow-hidden rounded-2xl border-[3px] border-black bg-[#FF6B35] p-5 shadow-[6px_6px_0px_0px_#000]"
        aria-label={`Mission du jour : ${chapterTitle}`}
        animate={{ scale: launching ? 1.025 : 1 }}
        // Same full/quick split as everything else in this ceremony (BraiseChest, the reveal
        // veil): a same-day reopen unmounts this component at 420ms, well before a 500ms scale-up
        // would finish — matching the shorter window here instead of leaving it visibly cut off.
        transition={{ duration: quick ? 0.22 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Intermittent heat glow near the sun sliver — a light effect, not the frame moving, so
            it stays even though the card itself is static. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
          style={{ background: 'radial-gradient(circle, #FFE9A8 0%, rgba(255,233,168,0) 70%)' }}
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#FDC800]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0) 20px)' }}
        />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center">
            {/* One slow aura makes the chest feel warm and rare at rest. It wakes up only when
                the player reaches for the button; the frame and reading order never move. */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-[5px] rounded-full bg-[#FDC800]/40 blur-md"
              animate={hyped || launching ? { scale: [0.9, 1.22, 0.9], opacity: [0.25, 0.85, 0.25] } : { scale: [0.96, 1.06, 0.96], opacity: [0.22, 0.4, 0.22] }}
              transition={{ duration: hyped || launching ? 0.72 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <BraiseChest size={64} hyped={hyped} diving={launching} quick={quick} />
          </div>
          <div className="min-w-0 flex-1">
            {/* Dark ink, not white — #FF6B35 measures 2.84:1 for white text (a hard AA
                failure), 6.25:1 for dark ink. Three real fonts: font-mono for the eyebrow
                (same as every other small-caps label app-wide), font-display for the title,
                font-sans for the stats line. */}
            <p className="flex items-center gap-1 font-mono text-[0.67rem] font-black uppercase tracking-wide text-[#151821]">
              <Sparkles size={12} strokeWidth={3} /> Ta mission du jour
            </p>
            <h2 className="truncate font-display text-xl font-black leading-tight text-[#151821]">{chapterTitle}</h2>
            {/* "3 min · Histoire-Géo · 1 notion à débloquer" — duration first (the promise: this
                is short), subject second, then the real card count relabelled as "notion(s)":
                each flashcard already is one discrete, testable concept, so this isn't a new
                number invented for the label, just the same cardCount already reaching screen
                readers below, finally shown. No visible "Express" badge next to a number that
                already says "3 min" — that was saying the same thing twice. */}
            <p className="mt-1 font-sans text-[0.78rem] font-semibold leading-snug text-[#151821]">
              {duration} min{subjectName ? ` · ${subjectName}` : ''} · {cardCount} notion{cardCount > 1 ? 's' : ''} à débloquer
            </p>
          </div>
        </div>
        <span className="sr-only">
          {bubbleLine} Cette mission contient {cardCount} carte{cardCount > 1 ? 's' : ''}.
        </span>

        {/* Base+face bevel — untouched, the same mechanic SubjectDecks/HeaderHUD use everywhere
            else on Accueil. Pointer events here drive `hyped` on the chest (hover for a mouse,
            pointerdown for a touch — the only reliable "finger's on it" signal on mobile). */}
        <div className="tw-cta-pulse group relative mt-5">
          <span aria-hidden="true" className="absolute inset-0 translate-y-[3px] rounded-full border-[2.5px] border-black bg-black" />
          <button
            onPointerEnter={() => setHyped(true)}
            onPointerDown={() => setHyped(true)}
            onPointerUp={unhype}
            onPointerLeave={unhype}
            onPointerCancel={unhype}
            onClick={handleStart}
            disabled={launching}
            className="tw-shimmer relative flex w-full items-center justify-center gap-1.5 rounded-full border-[2.5px] border-black bg-white px-3.5 py-3.5 font-display text-base font-black text-black shadow-[3px_3px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none disabled:opacity-95"
          >
            <Play size={17} fill="currentColor" />
            JE PIOCHE !
          </button>
        </div>
      </motion.section>
    </MotionConfig>
  );
}
