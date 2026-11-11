import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BraiseLogo } from "@/components/BraiseLogo";
import type { IntroVariant } from "./model";
import { BraiseMascot } from "@/components/BraiseMascot";

// The first three seconds. Three ways to open, switchable with `localStorage.braise_intro`:
//
//   "morph"  (A) the brand mark unfolds into the character. The logo IS a flame and Braise IS a
//                flame, so the mark does not fade into the app, it becomes the app's narrator.
//   "none"   (B) no splash at all. The app opens straight on the first card. The fastest, most
//                respectful opening, and the one utilities use (Mathway's keypad is usable on
//                screen one).
//   "card"   (C) the brand lights the pass: the mark holds, then the empty member card rises from
//                the bottom and the screen hands it over. Sells the object before the questions.
//
// All three are off under reduced motion, where the screen simply starts where it ends.
const ORANGE = "#ff6b35";

export function BraiseIntro({ variant, onDone }: { variant: IntroVariant; onDone: () => void }) {
  const [phase, setPhase] = useState<"mark" | "become" | "gone">("mark");

  // Pas de court-circuit ici : si l'ouverture ne doit pas jouer, le parent ne monte simplement
  // pas ce composant. Appeler onDone pendant le montage revenait à pousser un changement d'état
  // dans un parent encore en train de se monter, ce que React signale à juste titre.
  useEffect(() => {
    const a = setTimeout(() => setPhase("become"), 620);
    const b = setTimeout(() => {
      setPhase("gone");
      onDone();
    }, 1750);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [onDone]);

  if (phase === "gone") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="onbi"
        style={{ background: ORANGE }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // Tapping skips it: an opening nobody can cut short is an opening that annoys on the
        // second launch.
        onClick={() => {
          setPhase("gone");
          onDone();
        }}
        aria-hidden="true"
      >
        {variant === "card" ? (
          <>
            <motion.div
              className="onbi-mark"
              initial={{ scale: 0.7, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: phase === "become" ? -70 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <BraiseLogo size={128} />
            </motion.div>
            <motion.div
              className="onbi-card"
              initial={{ y: 260, rotate: 4, opacity: 0 }}
              animate={
                phase === "become"
                  ? { y: 0, rotate: -1.4, opacity: 1 }
                  : { y: 260, rotate: 4, opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            >
              <span>Ton pass Braise</span>
              <i />
              <i />
              <i />
            </motion.div>
          </>
        ) : (
          // "morph": the mark holds, then shrinks into the seat while the character takes its
          // place — one object, two states, no cut.
          <motion.div
            className="onbi-seat"
            initial={{ scale: 1 }}
            animate={{ scale: phase === "become" ? 0.52 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <motion.span
              className="onbi-mark"
              animate={{ opacity: phase === "become" ? 0 : 1, scale: phase === "become" ? 0.8 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <BraiseLogo size={150} />
            </motion.span>
            <motion.span
              className="onbi-char"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: phase === "become" ? 1 : 0,
                scale: phase === "become" ? 1 : 0.8,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <BraiseMascot size={150} mood="happy" />
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
