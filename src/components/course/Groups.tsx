import { motion, useReducedMotion } from "framer-motion";
import { MathText } from "@/components/course/MathText";
import type { GroupsVisual } from "@/lib/course/types";

// Items cut into complete groups, then what is left over (dashed): what "23 = 4 × 5 + 3" or "7 is
// three pairs and one on its own" looks like, or 24 slices shared among 5 people. Drawn from data
// (see GroupsVisual in lib/course/types.ts); the numbers are the author's, so nothing is counted
// for the student here. The groups pop in one after the other and what is left over comes last,
// with a small wobble: that is where the eye should land.
export function Groups({ visual }: { visual: GroupsVisual }) {
  const reduced = useReducedMotion();
  // Shared among N: N groups of the same size. Cut by size: as many complete groups as fit.
  const shared = visual.shareAmong !== undefined;
  const size = shared
    ? Math.floor(visual.total / (visual.shareAmong ?? 1))
    : (visual.groupSize ?? 1);
  const complete = shared ? (visual.shareAmong ?? 0) : Math.floor(visual.total / size);
  const rest = visual.total - complete * size;

  const items = (n: number) => (
    <span className="course-group-items">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="course-group-item">
          {visual.item ? <MathText text={visual.item} /> : "●"}
        </span>
      ))}
    </span>
  );
  const pop = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, scale: 0.7, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { type: "spring" as const, stiffness: 380, damping: 22, delay: 0.07 * i },
        };

  return (
    <div className="course-groups" role="img" aria-label={visual.ariaLabel}>
      {Array.from({ length: complete }, (_, g) => (
        <motion.div key={g} className="course-group" aria-hidden="true" {...pop(g)}>
          {shared && visual.recipient && (
            <span className="course-group-who">{visual.recipient}</span>
          )}
          {items(size)}
        </motion.div>
      ))}
      {rest > 0 && (
        <motion.div
          className="course-group course-group--rest"
          aria-hidden="true"
          {...pop(complete + 2)}
        >
          {visual.restLabel && <span className="course-group-tag">{visual.restLabel}</span>}
          {items(rest)}
        </motion.div>
      )}
    </div>
  );
}
