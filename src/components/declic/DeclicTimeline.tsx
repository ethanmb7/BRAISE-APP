import { motion } from "framer-motion";
import type { DeclicVisual } from "@/lib/declic";

// The subject-specific half of Déclic's explanation step (see DeclicVisual in lib/declic.ts):
// history's own shape for "these two things are far apart" is a timeline, not the pizza slices
// fractions use. Same bevel/border grammar as the rest of the app, new composition only.
export function DeclicTimeline({ visual, step }: { visual: DeclicVisual; step: number }) {
  const years = visual.events.map((e) => e.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const span = Math.max(1, max - min);
  const pct = (year: number) => `${((year - min) / span) * 84 + 8}%`;

  return (
    <div className="declic-timeline" aria-hidden="true">
      <div className="declic-timeline-track" />
      {visual.events.map((e) => {
        const visible = step >= e.revealAtStep;
        const revealingNow = step === e.revealAtStep;
        const hidden = { opacity: 0, scale: 0.4 };
        const shown = { opacity: 1, scale: 1 };
        return (
          <motion.div
            key={e.year}
            className="declic-timeline-point"
            style={{ left: pct(e.year) }}
            // Each explanation beat remounts (see DeclicMode) — only the exact step where this
            // point first appears should animate in; earlier/later beats snap straight to their
            // state so a point already shown doesn't re-pop every time the text advances.
            initial={revealingNow ? hidden : visible ? shown : hidden}
            animate={visible ? shown : hidden}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <span className="declic-timeline-dot" />
            <span className="declic-timeline-year">{e.year}</span>
            <span className="declic-timeline-label">{e.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
