// The building blocks every Déclic player is made of: Braise speaking in a bubble, and a big
// tappable answer. Shared by the older script player (DeclicMode) and the course player
// (components/course/CoursePlayer), so both look and move like the same BRAISE.
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BraiseMascot } from "@/components/BraiseMascot";

export type Mood = "happy" | "eager" | "hesitant" | "cool" | "proud";

export function DeclicAsk({
  mood,
  bump,
  scene,
  bubbleClassName,
  children,
}: {
  mood: Mood;
  /** A one-shot physical reaction — a headshake on a miss, a little nod on a hit — played once
   *  when this prop first appears (see the `key`: it forces a fresh mount, which is what makes
   *  an `initial` → `animate` transition actually run instead of snapping straight to rest). */
  bump?: "correct" | "wrong";
  scene: "story" | "question" | "reveal" | "reformulate";
  /** Extra class on the bubble, e.g. to keep a text's own line breaks. */
  bubbleClassName?: string;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const mascotMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : bump === "wrong"
      ? { initial: { rotate: 0, x: 0 }, animate: { rotate: [0, -8, 7, -4, 0], x: [0, -2, 2, 0] } }
      : bump === "correct"
        ? { initial: { y: 0, scale: 1 }, animate: { y: [0, -13, 0], scale: [1, 1.08, 1] } }
        : { initial: { opacity: 0, y: 14, rotate: -3 }, animate: { opacity: 1, y: 0, rotate: 0 } };
  return (
    <div className={`declic-ask declic-ask--${scene}`}>
      <motion.div
        key={`${scene}-${bump ?? mood}`}
        className="declic-actor"
        {...mascotMotion}
        transition={
          bump
            ? { duration: 0.48, ease: "easeOut" }
            : { type: "spring", stiffness: 360, damping: 22 }
        }
      >
        <span className="declic-actor-shadow" aria-hidden="true" />
        <BraiseMascot
          size={scene === "reveal" ? 126 : 112}
          mood={mood}
          pose={scene === "question" ? "focus" : scene === "reveal" ? "victory" : "idle"}
        />
        <span className="declic-actor-tag">BRAISE</span>
      </motion.div>
      <h2 className={`declic-bubble ${bubbleClassName ?? ""}`}>
        <span>{children}</span>
      </h2>
    </div>
  );
}

export function DeclicTile({
  label,
  state,
  onClick,
  disabled,
  className,
  ariaLabel,
}: {
  label: ReactNode;
  state: "idle" | "correct" | "wrong";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  /** For a tile whose content is a picture or a symbol a screen reader cannot read. */
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      className={`declic-tile is-${state} ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={!disabled ? { x: 2, y: 2 } : undefined}
    >
      {label}
    </motion.button>
  );
}
