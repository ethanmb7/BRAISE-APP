import { MathText } from "@/components/course/MathText";
import type { BoxNode, NestedBoxesVisual } from "@/lib/course/types";

// A set diagram made of boxes inside boxes: what "ℕ ⊂ ℤ" looks like. Drawn from data (see Visual in
// lib/course/types.ts), so the next chapter's picture is a JSON tree, not a new component. The
// shape cannot be read from the picture, so the whole thing is one labelled image for a screen
// reader, written by the author.
export function NestedBoxes({ visual }: { visual: NestedBoxesVisual }) {
  return (
    <div className="course-boxes" role="img" aria-label={visual.ariaLabel}>
      {visual.boxes.map((box, i) => (
        <Box key={i} node={box} depth={0} />
      ))}
    </div>
  );
}

function Box({ node, depth }: { node: BoxNode; depth: number }) {
  return (
    <div className={`course-box course-box--depth-${depth % 3}`} aria-hidden="true">
      <span className="course-box-label">
        <MathText text={node.label} />
      </span>
      {node.children && node.children.length > 0 && (
        <div className="course-box-children">
          {node.children.map((child, i) => (
            <Box key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
