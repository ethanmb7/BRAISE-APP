import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { onPiocheReveal, getPiocheRevealTiming } from '@/lib/piocheTransition';

// The one real gap left in the "Je pioche" moment: BraiseChest's own opening ceremony (squash,
// lid pop, her rise, the eye-flash) is carefully choreographed, but the screen swap right after
// it — HomeView unmounting, LessonView mounting — was a flat hard cut with zero visual
// continuity, the exact "moment after the click" both the product review and the parallel Codex
// pass independently flagged as the next thing worth doing. A brief warm light-burst veil,
// timed to land exactly on that cut and fade back out just after, turns the hard cut into what
// reads as "Braise's own light carries you into the mission" instead of a jump-cut.
//
// Lives at the App.tsx level, outside the view switch, specifically so it survives the unmount
// that triggers it — a veil owned by HeroPiocheCard itself would disappear at the exact moment
// it's supposed to be covering. Triggered only by HeroPiocheCard's own pioche-open flow (see
// piocheTransition.ts) — not a generic "every navigation fades" mechanism, so no other screen
// transition in the app has to reason about this.
//
// Colours match BraiseChest's own hit-flash (#FFF8EE) and the card's own frame (#FF6B35), not a
// new palette invented for this one moment. Only opacity ever animates — under
// prefers-reduced-motion, browsers already treat a plain cross-fade as acceptable motion, so no
// special-casing is needed the way BraiseChest's own transform-heavy beats would require.
export function PiocheRevealVeil() {
  const [active, setActive] = useState(false);
  const [durations, setDurations] = useState({ fadeInMs: 0, holdMs: 0, fadeOutMs: 0, veilTotalMs: 0 });
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const unsubscribe = onPiocheReveal((totalMs) => {
      const timing = getPiocheRevealTiming(totalMs);
      setDurations(timing);
      setActive(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setActive(false), timing.veilTotalMs);
    });
    return () => {
      unsubscribe();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const { fadeInMs, holdMs, veilTotalMs } = durations;

  return (
    <motion.div
      aria-hidden="true"
      className="pioche-reveal-veil"
      initial={false}
      animate={active ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
      transition={
        active && veilTotalMs > 0
          ? { duration: veilTotalMs / 1000, times: [0, fadeInMs / veilTotalMs, (fadeInMs + holdMs) / veilTotalMs, 1], ease: 'easeOut' }
          : { duration: 0.12 }
      }
    />
  );
}
