import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BraiseMascot } from '@/components/BraiseMascot';

const SPARK_CLIP = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

interface BraiseInteractiveMascotProps {
  size?: number;
  /** True while a finger/cursor is on the GO button — the "come look at this" reaction: `cool`
   *  (already renders sunglasses + a bigger bounce, nothing new needed in BraiseMascot) plus a
   *  joyful hop. */
  hyped: boolean;
  /** True for the short window between the click and the real navigation — Braise dives toward
   *  the button and disappears, instead of the screen just cutting away under her. */
  diving: boolean;
}

// Braise's signature move for this card: instead of sitting beside the button as static
// decoration, she periodically leans over and "tries" it herself — a wordless nudge ("go on, tap
// it") every ~4.6s whenever nothing else is already happening. Duolingo's Duo does the same job by
// tugging at buttons/chests; this is Braise's version, built entirely on moods the mascot already
// has (`cool` = sunglasses + big bounce, `proud` = flame surge) rather than new SVG states just
// for this one card.
//
// Only this component and its sparks move — the card's own rectangular frame around it stays
// completely static (see HeroPiocheCard), so all the "life" reads as Braise acting on a fixed
// object, not the object itself wobbling.
export function BraiseInteractiveMascot({ size = 56, hyped, diving }: BraiseInteractiveMascotProps) {
  const [poking, setPoking] = useState(false);
  const pokeInterval = useRef<ReturnType<typeof setInterval>>();
  const pokeTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (hyped || diving) {
      setPoking(false);
      return;
    }
    pokeInterval.current = setInterval(() => {
      setPoking(true);
      pokeTimeout.current = setTimeout(() => setPoking(false), 850);
    }, 4600);
    return () => {
      clearInterval(pokeInterval.current);
      clearTimeout(pokeTimeout.current);
    };
  }, [hyped, diving]);

  useEffect(
    () => () => {
      clearInterval(pokeInterval.current);
      clearTimeout(pokeTimeout.current);
    },
    []
  );

  const state = diving ? 'diving' : hyped ? 'hyped' : poking ? 'poking' : 'idle';
  const mood = diving ? 'proud' : hyped ? 'cool' : 'eager';

  // Hand-tuned offsets toward the button below/right of the mascot's fixed anchor spot — this
  // card always has the same relative layout (mascot top-left, button spanning the width below),
  // so a fixed lean/dive direction reads correctly without measuring positions at runtime.
  const targets = {
    idle: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
    poking: { x: 13, y: 19, rotate: -18, scale: 1.05, opacity: 1 },
    hyped: { x: -2, y: -9, rotate: 8, scale: 1.2, opacity: 1 },
    diving: { x: 36, y: 60, rotate: 20, scale: 0.12, opacity: 0 },
  } as const;

  return (
    <div className="relative h-14 w-14 flex-shrink-0">
      <motion.div
        className="absolute inset-0"
        animate={targets[state]}
        transition={
          state === 'diving'
            ? {
                x: { type: 'spring', stiffness: 400, damping: 15 },
                y: { type: 'spring', stiffness: 400, damping: 15 },
                rotate: { type: 'spring', stiffness: 400, damping: 15 },
                scale: { type: 'spring', stiffness: 400, damping: 15 },
                opacity: { duration: 0.2, ease: 'easeIn', delay: 0.1 },
              }
            : { type: 'spring', stiffness: 400, damping: 15 }
        }
      >
        <BraiseMascot size={size} mood={mood} />
      </motion.div>

      {/* A few sparks toward the button on each poke attempt ("elle lance des petites étincelles
          vers la carte pour l'allumer"), a bigger burst covering the dive. */}
      <AnimatePresence>
        {poking && <PokeSparks key="poke" count={3} reach={22} />}
        {diving && <PokeSparks key="dive" count={6} reach={38} />}
      </AnimatePresence>
    </div>
  );
}

function PokeSparks({ count, reach }: { count: number; reach: number }) {
  const sparks = Array.from({ length: count }).map((_, i) => {
    const spread = (i - (count - 1) / 2) * 10;
    return { x: reach + spread * 0.6, y: reach * 0.7 + Math.abs(spread) * 0.3, delay: i * 0.03 };
  });
  return (
    <>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 block h-2 w-2"
          style={{ background: i % 2 === 0 ? '#FDC800' : '#fff', clipPath: SPARK_CLIP }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.3, 1, 0.4], rotate: 80 }}
          transition={{ duration: 0.45, delay: s.delay, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}
