import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Play } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';

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

// Eighth pass — full motion rebuild (framer-motion), not just a restyle. Design brief: the card
// reads as the top of a real deck (two rotated "sleeves" peeking out behind it, matching the
// app's own hard-edged-shadow language — a 0-blur box-shadow already *is* a card peeking out from
// behind, so the press physics below just animate that shadow directly rather than duplicating it
// as a separate DOM "base" layer). It breathes at rest, compresses hard on press, and springs back
// with an arcade "card ejected" overshoot on release, with Braise reacting to the press itself
// (mood swaps eager → proud — reusing the existing mood, not inventing a hover-only one) rather
// than sitting beside the mechanic as a static illustration.
//
// The button keeps its own proven base+face bevel exactly as before (untouched, no regression
// risk) — the pressed state below is lifted from that button's pointer events and layered on top
// as an *additional*, complementary reaction on the card as a whole, not a replacement for it.
//
// MotionConfig reducedMotion="user" wraps the whole thing: this is the one other place in the app
// (besides RevisionsView) with continuous/spring motion, and prefers-reduced-motion should turn
// all of it off the same way it already does there.
const SPARK_CLIP = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

// A quick directional whoosh (mostly up/out, ~0.5s), not RankUpCelebration's 360° radial burst —
// that one reads as "a big achievement just happened", this one has to read as "a card just left
// the deck". Kept local and small rather than importing/generalising that component: the two are
// different enough in shape and duration that sharing one would mean threading extra options
// through a component whose only other caller has nothing to do with this screen.
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

export function HeroPiocheCard({ bubbleLine, subjectName, chapterTitle, duration, cardCount, onStart }: HeroPiocheCardProps) {
  const [pressed, setPressed] = useState(false);
  const [launching, setLaunching] = useState(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    if (launchTimer.current) clearTimeout(launchTimer.current);
  }, []);

  const release = () => setPressed(false);

  const handleStart = () => {
    if (launching) return;
    if ('vibrate' in navigator) navigator.vibrate(12);
    // The real navigation (onStart → openSubject) unmounts this component immediately, so it's
    // delayed just long enough for the eject spring + spark burst to actually be seen — the
    // satisfaction has to land before the screen changes, not get cut off by it.
    setLaunching(true);
    launchTimer.current = setTimeout(onStart, 260);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative pb-2 pr-1.5">
        {/* Deck sleeves — same hard black border/no-blur language as every other card in the app,
            just rotated and stacked. A slow, tiny independent sway keeps the pile itself feeling
            alive even when nothing is being pressed. */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-[2.5px] border-black bg-[#C94E1D]"
          style={{ originX: 0.15, originY: 0.92 }}
          animate={{ rotate: [-5, -3.5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border-[2.5px] border-black bg-[#FDC800]"
          style={{ originX: 0.85, originY: 0.92 }}
          animate={{ rotate: [4, 2.5, 4] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* The main face. At rest it breathes (a slow, near-imperceptible float) — a live-vs-inert
            tell distinct from the press feedback. On press it compresses hard and fast; on release
            it springs back past rest before settling (stiffness/damping tuned for a real "card
            ejected" overshoot, not a soft ease). The box-shadow going from the card's normal 3px
            offset to flat 0 on press IS the "sinking onto the base" read — no separate base layer
            needed since a 0-blur shadow already renders as a solid card-shaped shape behind it. */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[#FF6B35] p-4"
          animate={
            pressed
              ? { y: 3, scale: 0.97, boxShadow: '0px 0px 0px 0px #000' }
              : { y: [0, -3, 0], scale: 1, boxShadow: '3px 3px 0px 0px #000' }
          }
          transition={
            pressed
              ? { duration: 0.09, ease: 'easeOut' }
              : {
                  y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
                  scale: { type: 'spring', stiffness: 500, damping: 15 },
                  boxShadow: { type: 'spring', stiffness: 500, damping: 15 },
                }
          }
        >
          {/* Intermittent heat glow near the sun sliver — breathes on its own loop, independent of
              press, so the card never reads as fully static even between breaths. */}
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
            {/* Braise reacts to the press itself — tilts and grows toward the button, mood swaps
                to `proud` (its existing bigger-bounce mood) only while pressed, as if she's the
                one pushing the card out of the deck. Reverts the instant the finger lifts. */}
            <motion.div
              className="h-14 w-14 flex-shrink-0"
              animate={{ rotate: pressed ? -12 : 0, scale: pressed ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <BraiseMascot size={56} mood={pressed ? 'proud' : 'eager'} />
            </motion.div>
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

          {/* Base+face bevel — untouched from the last pass, still the same mechanic
              SubjectDecks/HeaderHUD use everywhere else on Accueil. `pressed` is lifted from these
              pointer events purely to drive the card-level reactions above; the button's own press
              feedback still works exactly as it did before this rebuild. */}
          <div className="tw-cta-pulse group relative mt-3">
            <span aria-hidden="true" className="absolute inset-0 translate-y-[3px] rounded-full border-[2.5px] border-black bg-black" />
            <button
              onPointerDown={() => setPressed(true)}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
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
        </motion.div>
      </div>
    </MotionConfig>
  );
}
