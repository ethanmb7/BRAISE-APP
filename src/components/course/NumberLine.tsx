import type { NumberLineVisual } from "@/lib/course/types";

const W = 320;
const PAD = 20;
const AXIS_Y = 46;
const MAX_LABELS = 14;

// Negative numbers are written with the en dash the course texts use, decimals with a comma.
const fmt = (n: number) =>
  String(Number(n.toFixed(6)))
    .replace("-", "–")
    .replace(".", ",");

// A graduated line drawn from data (see NumberLineVisual in lib/course/types.ts): ticks, points,
// highlighted marks and an optional bound. It scales with its container. The picture is one labelled
// image for a screen reader; what it shows is said in the author's ariaLabel.
export function NumberLine({ visual }: { visual: NumberLineVisual }) {
  const step = visual.step ?? 1;
  const span = visual.max - visual.min;
  const count = Math.round(span / step);
  const x = (v: number) => PAD + ((v - visual.min) / span) * (W - 2 * PAD);
  const marked = new Set((visual.marks ?? []).map((m) => Number(m.toFixed(6))));
  const pointed = new Set((visual.points ?? []).map((p) => Number(p.value.toFixed(6))));
  // Label every tick when they fit, otherwise every few; a point or a mark is always labelled.
  const every = Math.max(1, Math.ceil((count + 1) / MAX_LABELS));

  return (
    <svg
      className="course-line"
      viewBox={`0 0 ${W} 82`}
      role="img"
      aria-label={visual.ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <line className="course-line-axis" x1={PAD - 10} x2={W - PAD + 10} y1={AXIS_Y} y2={AXIS_Y} />
      {Array.from({ length: count + 1 }, (_, i) => {
        const v = Number((visual.min + i * step).toFixed(6));
        const isMark = marked.has(v);
        const labelled = i % every === 0 || isMark || pointed.has(v);
        return (
          <g key={i} aria-hidden="true">
            <line
              className={isMark ? "course-line-tick course-line-tick--mark" : "course-line-tick"}
              x1={x(v)}
              x2={x(v)}
              y1={AXIS_Y - 6}
              y2={AXIS_Y + 6}
            />
            {isMark && <circle className="course-line-mark" cx={x(v)} cy={AXIS_Y} r={5.5} />}
            {labelled && (
              <text className="course-line-label" x={x(v)} y={AXIS_Y + 24} textAnchor="middle">
                {fmt(v)}
              </text>
            )}
          </g>
        );
      })}
      {visual.bound !== undefined && (
        <line
          className="course-line-bound"
          aria-hidden="true"
          x1={x(visual.bound)}
          x2={x(visual.bound)}
          y1={AXIS_Y - 30}
          y2={AXIS_Y + 8}
        />
      )}
      {(visual.points ?? []).map((p, i) => (
        <g key={i} aria-hidden="true">
          <circle className="course-line-point" cx={x(p.value)} cy={AXIS_Y} r={7} />
          {p.label && (
            <text
              className="course-line-point-label"
              x={x(p.value)}
              y={AXIS_Y - 14}
              textAnchor="middle"
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
