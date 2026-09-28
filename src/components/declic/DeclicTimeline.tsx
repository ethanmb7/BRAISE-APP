import { motion } from "framer-motion";
import type { DeclicVisual } from "@/lib/declic";

// The subject-specific half of a Déclic card (see DeclicVisual in lib/declic.ts): history's own
// shape for "these two things are far apart" is a timeline. Same bevel/border grammar as the
// rest of the app, new composition only. Cards are atomic in this version of Déclic (one card,
// one beat), so every point pops in together, staggered slightly for feel rather than synced to
// text revealing over multiple taps.
export function DeclicTimeline({ visual }: { visual: DeclicVisual }) {
  const years = visual.events.map((e) => e.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const span = Math.max(1, max - min);
  const pct = (year: number) => `${((year - min) / span) * 84 + 8}%`;

  return (
    <div className="declic-timeline" aria-hidden="true">
      <div className="declic-timeline-track" />
      {visual.events.map((e, i) => (
        <motion.div
          key={e.year}
          className="declic-timeline-point"
          style={{ left: pct(e.year) }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.15 + i * 0.2 }}
        >
          <span className="declic-timeline-dot" />
          <span className="declic-timeline-year">{e.year}</span>
          <span className="declic-timeline-label">{e.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
