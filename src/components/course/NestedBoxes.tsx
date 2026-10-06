import { motion, useReducedMotion } from "framer-motion";
import { MathText } from "@/components/course/MathText";
import type { BoxNode, NestedBoxesVisual } from "@/lib/course/types";

// A set diagram made of boxes inside boxes: what "ℕ ⊂ ℤ" looks like. Drawn from data (see Visual in
// lib/course/types.ts), so the next chapter's picture is a JSON tree, not a new component. The
// shape cannot be read from the picture, so the whole thing is one labelled image for a screen
// reader, written by the author. The outer box appears first, then what it contains.
export function NestedBoxes({ visual }: { visual: NestedBoxesVisual }) {
  return (
    <div className="course-boxes" role="img" aria-label={visual.ariaLabel}>
      {visual.boxes.map((box, i) => (
        <Box key={i} node={box} depth={0} index={i} />
      ))}
    </div>
  );
}

function Box({ node, depth, index }: { node: BoxNode; depth: number; index: number }) {
  const reduced = useReducedMotion();
  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        transition: {
          type: "spring" as const,
          stiffness: 340,
          damping: 24,
          delay: 0.14 * depth + 0.06 * index,
        },
      };
  return (
    <motion.div
      className={`course-box course-box--depth-${depth % 3}`}
      aria-hidden="true"
      {...motionProps}
    >
      <span className="course-box-label">
        <MathText text={node.label} />
      </span>
      {node.children && node.children.length > 0 && (
        <div className="course-box-children">
          {node.children.map((child, i) => (
            <Box key={i} node={child} depth={depth + 1} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
