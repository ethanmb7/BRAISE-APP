import { MathText } from "@/components/course/MathText";
import type { GroupsVisual } from "@/lib/course/types";

// Items cut into complete groups, then what is left over (dashed): what "23 = 4 × 5 + 3" or "7 is
// three pairs and one on its own" looks like. Drawn from data (see GroupsVisual in
// lib/course/types.ts); the numbers are the author's, so nothing is counted for the student here.
export function Groups({ visual }: { visual: GroupsVisual }) {
  const complete = Math.floor(visual.total / visual.groupSize);
  const rest = visual.total - complete * visual.groupSize;
  const items = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <span key={i} className="course-group-item">
        {visual.item ? <MathText text={visual.item} /> : "●"}
      </span>
    ));

  return (
    <div className="course-groups" role="img" aria-label={visual.ariaLabel}>
      {Array.from({ length: complete }, (_, g) => (
        <div key={g} className="course-group" aria-hidden="true">
          {items(visual.groupSize)}
        </div>
      ))}
      {rest > 0 && (
        <div className="course-group course-group--rest" aria-hidden="true">
          {items(rest)}
        </div>
      )}
    </div>
  );
}
