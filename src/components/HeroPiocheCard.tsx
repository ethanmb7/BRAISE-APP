import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { BraiseChest } from '@/components/BraiseChest';
import { sfx } from '@/lib/sound';
import { getLastPiocheOpenDate, setLastPiocheOpenDate } from '@/lib/celebrations';

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

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current);
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
    setLaunching(true);
    launchTimer.current = setTimeout(onStart, firstToday ? 900 : 420);
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* The frame is intentionally motionless: this is the daily ritual's reliable anchor.
          Braise, light and the little invitation badge are the only things that get to move. */}
      <section
        className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[#FF6B35] p-4 shadow-[3px_3px_0px_0px_#000]"
        aria-label={`Mission du jour : ${chapterTitle}`}
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
            <h2 className="truncate font-display text-lg font-black leading-tight text-[#151821]">{chapterTitle}</h2>
            <p className="mt-1 truncate font-sans text-[0.78rem] font-semibold text-[#151821]">
              {subjectName ? `${subjectName} · ` : ''}{duration} min pour capter le truc
            </p>
          </div>
        </div>
        <span className="sr-only">
          {bubbleLine} Cette mission contient {cardCount} carte{cardCount > 1 ? 's' : ''}.
        </span>

        {/* Base+face bevel — untouched, the same mechanic SubjectDecks/HeaderHUD use everywhere
            else on Accueil. Pointer events here drive `hyped` on the chest (hover for a mouse,
            pointerdown for a touch — the only reliable "finger's on it" signal on mobile). */}
        <div className="tw-cta-pulse group relative mt-4">
          <span aria-hidden="true" className="absolute inset-0 translate-y-[3px] rounded-full border-[2.5px] border-black bg-black" />
          <button
            onPointerEnter={() => setHyped(true)}
            onPointerDown={() => setHyped(true)}
            onPointerUp={unhype}
            onPointerLeave={unhype}
            onPointerCancel={unhype}
            onClick={handleStart}
            disabled={launching}
            className="tw-shimmer relative flex w-full items-center justify-center gap-1.5 rounded-full border-[2.5px] border-black bg-white px-3.5 py-3 font-display text-sm font-black text-black shadow-[3px_3px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none disabled:opacity-95"
          >
            <Play size={15} fill="currentColor" />
            JE PIOCHE !
          </button>
        </div>
      </section>
    </MotionConfig>
  );
}
