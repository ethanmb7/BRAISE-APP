import { MathText } from "@/components/course/MathText";
import type { GroupsVisual } from "@/lib/course/types";

// Items cut into complete groups, then what is left over (dashed): what "23 = 4 × 5 + 3" or "7 is
// three pairs and one on its own" looks like, or 24 slices shared among 5 people. Drawn from data
// (see GroupsVisual in lib/course/types.ts); the numbers are the author's, so nothing is counted
// for the student here.
export function Groups({ visual }: { visual: GroupsVisual }) {
  // Shared among N: N groups of the same size. Cut by size: as many complete groups as fit.
  const shared = visual.shareAmong !== undefined;
  const size = shared
    ? Math.floor(visual.total / (visual.shareAmong ?? 1))
    : (visual.groupSize ?? 1);
  const complete = shared ? (visual.shareAmong ?? 0) : Math.floor(visual.total / size);
  const rest = visual.total - complete * size;
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
          {items(size)}
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
