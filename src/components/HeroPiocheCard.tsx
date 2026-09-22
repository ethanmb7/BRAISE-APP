import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Play } from 'lucide-react';
import { BraiseInteractiveMascot } from '@/components/BraiseInteractiveMascot';

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
  onStart: () => void;
}

// Ninth pass — Braise gets a real signature mechanic instead of just sitting next to the button.
// She now acts on the card: an idle "poke" every ~4.6s (leans toward GO, taps at it, throws a few
// sparks), a hyped reaction the instant a finger lands on the button (sunglasses, a joyful hop),
// and on click she dives toward the button and disappears before the real navigation happens. All
// of that lives in BraiseInteractiveMascot, built on moods BraiseMascot already has (`cool`,
// `proud`) rather than new SVG states.
//
// Explicit constraint this pass: the card's own rectangular frame stays completely static — no
// more card-wide breathing/press-squash motion.div (that was the previous pass's approach). Only
// Braise and her sparks move now; the frame, the deck sleeves behind it and the heat glow are
// fixed shapes, so all the "life" reads as her acting on a stable object, the way Duo acts on a
// static lesson path rather than the path itself wobbling. The GO button keeps its own separate,
// already-proven base+face bevel (untouched) for its own tap feedback — that's the button's own
// native affordance, not "the frame" moving.
export function HeroPiocheCard({ bubbleLine, subjectName, chapterTitle, duration, cardCount, onStart }: HeroPiocheCardProps) {
  const [hyped, setHyped] = useState(false);
  const [launching, setLaunching] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current);
  }, []);

  const unhype = () => setHyped(false);

  const handleStart = () => {
    if (launching) return;
    if ('vibrate' in navigator) navigator.vibrate(12);
    // The real navigation (onStart → openSubject) unmounts this component immediately, so it's
    // delayed just long enough for Braise's dive (spring settle ~250-300ms, fade finishing ~300ms)
    // to actually be seen — the satisfaction has to land before the screen changes.
    setLaunching(true);
    launchTimer.current = setTimeout(onStart, 340);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative pb-2 pr-1.5">
        {/* Deck sleeves — same hard black border/no-blur language as every other card in the app,
            just rotated and stacked. Static (no sway): the frame stays fixed this pass. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-[2.5px] border-black bg-[#C94E1D]"
          style={{ transform: 'rotate(-4deg)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-[2.5px] border-black bg-[#FDC800]"
          style={{ transform: 'rotate(3deg)' }}
        />

        {/* The main face — a plain, static card. No breathing, no press-squash: the frame itself
            never moves this pass. */}
        <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[#FF6B35] p-4 shadow-[3px_3px_0px_0px_#000]">
          {/* Intermittent heat glow near the sun sliver — a light effect, not the frame moving,
              so it stays even though the card itself is now static. */}
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
            <BraiseInteractiveMascot size={56} hyped={hyped} diving={launching} />
            <div className="min-w-0 flex-1">
              {/* Dark ink, not white — #FF6B35 measures 2.84:1 for white text (a hard AA
                  failure), 6.25:1 for dark ink. Three real fonts: font-mono for the eyebrow
                  (same as every other small-caps label app-wide), font-display for the title,
                  font-sans for the stats line. */}
              <p className="font-mono text-[0.7rem] font-black uppercase tracking-wide text-[#151821]">Pioche du jour</p>
              <h2 className="truncate font-display text-lg font-black leading-tight text-[#151821]">{chapterTitle}</h2>
              <p className="mt-1 truncate font-sans text-[0.78rem] font-semibold text-[#151821]">
                {duration} min · {cardCount} carte{cardCount > 1 ? 's' : ''}
                {subjectName ? ` · ${subjectName}` : ''}
              </p>
            </div>
          </div>
          <span className="sr-only">{bubbleLine}</span>

          {/* Base+face bevel — untouched, the same mechanic SubjectDecks/HeaderHUD use everywhere
              else on Accueil. Pointer events here drive `hyped` on Braise (hover for a mouse,
              pointerdown for a touch — the only reliable "finger's on it" signal on mobile). */}
          <div className="tw-cta-pulse group relative mt-3">
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
              <Play size={15} />
              GO !
            </button>
            <AnimatePresence>
              {launching && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <LaunchSparks />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

const SPARK_CLIP = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

// A quick directional whoosh from the button itself (mostly up/out, ~0.5s) — the point of impact
// where Braise's own dive (BraiseInteractiveMascot) lands, not a duplicate of it. Kept local and
// small rather than reusing RankUpCelebration's 360° radial Sparkles: that one reads as "a big
// achievement just happened", this one has to read as "a card just left the deck".
function LaunchSparks() {
  const sparks = [
    { x: -34, y: -46, delay: 0 },
    { x: -14, y: -58, delay: 0.02 },
    { x: 10, y: -60, delay: 0.04 },
    { x: 32, y: -48, delay: 0.02 },
    { x: -24, y: -30, delay: 0.06 },
    { x: 26, y: -28, delay: 0.06 },
    { x: 0, y: -66, delay: 0.01 },
    { x: -44, y: -18, delay: 0.08 },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 block h-2.5 w-2.5"
          style={{ background: i % 2 === 0 ? '#FDC800' : '#fff', clipPath: SPARK_CLIP }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.3, 1, 0.4], rotate: 90 }}
          transition={{ duration: 0.5, delay: s.delay, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}
