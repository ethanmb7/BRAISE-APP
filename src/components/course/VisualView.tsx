import { Groups } from "@/components/course/Groups";
import { MathText } from "@/components/course/MathText";
import { NestedBoxes } from "@/components/course/NestedBoxes";
import { NumberLine } from "@/components/course/NumberLine";
import type { Visual } from "@/lib/course/types";

/** Draws any picture a card, a step or a choice carries, with its caption when it has one. A new
 *  kind of picture is one more case here, one more type in lib/course/types.ts and one more rule in
 *  the validator. */
export function VisualView({ visual }: { visual: Visual }) {
  const picture = (() => {
    switch (visual.kind) {
      case "nested-boxes":
        return <NestedBoxes visual={visual} />;
      case "number-line":
        return <NumberLine visual={visual} />;
      case "groups":
        return <Groups visual={visual} />;
    }
  })();
  if (!visual.caption) return picture;
  return (
    <figure className="course-figure">
      {picture}
      <figcaption className="course-figcaption">
        <MathText text={visual.caption} />
      </figcaption>
    </figure>
  );
}
