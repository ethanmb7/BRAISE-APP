import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { NumberLineVisual } from "@/lib/course/types";

const W = 340;
const PAD = 28;
const MAX_LABELS = 14;
const TRACK_H = 26;

// Negative numbers are written with the real minus sign (−), decimals with a comma.
const fmt = (n: number) =>
  String(Number(n.toFixed(6)))
    .replace("-", "−")
    .replace(".", ",");
const round6 = (n: number) => Number(n.toFixed(6));

// A graduated line drawn from data (see NumberLineVisual in lib/course/types.ts): a track with its
// ticks, the negative side tinted apart from the positive one, highlighted marks, labelled points,
// an optional bound and, if asked, the jumps between the marks ("multiples of 4" as steps of 4). It
// scales with its container and appears from left to right. The picture is one labelled image for a
// screen reader; what it shows is said in the author's ariaLabel.
export function NumberLine({ visual }: { visual: NumberLineVisual }) {
  const reduced = useReducedMotion();
  const clip = useId();
  const step = visual.step ?? 1;
  const span = visual.max - visual.min;
  const count = Math.round(span / step);
  const x = (v: number) => PAD + ((v - visual.min) / span) * (W - 2 * PAD);

  const marks = [...new Set((visual.marks ?? []).map(round6))].sort((a, b) => a - b);
  const points = visual.points ?? [];
  const markSet = new Set(marks);
  const pointSet = new Set(points.map((p) => round6(p.value)));
  const hasPointLabels = points.some((p) => p.label);

  // Room above the track for jump arcs or point labels, below it for the numbers.
  const axisY = visual.jumps ? 68 : hasPointLabels ? 62 : 34;
  const height = axisY + 44;
  const trackX = PAD - 14;
  const trackW = W - 2 * PAD + 28;
  // Label every tick when they fit, otherwise every few. When marks are shown, only they (and 0
  // and the ends) are labelled, so the multiples are what stands out.
  const every = Math.max(1, Math.ceil((count + 1) / MAX_LABELS));
  const labelled = (v: number, i: number) =>
    marks.length > 0
      ? markSet.has(v) || v === 0 || i === 0 || i === count || pointSet.has(v)
      : i % every === 0 || pointSet.has(v) || v === 0;

  const zeroX = x(Math.min(Math.max(0, visual.min), visual.max));
  const hasNegatives = visual.min < 0;
  const hasPositives = visual.max > 0;

  const pop = (i: number) =>
    reduced
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: {
            type: "spring" as const,
            stiffness: 420,
            damping: 18,
            delay: 0.15 + 0.05 * i,
          },
        };
  const origin = { transformBox: "fill-box" as const, transformOrigin: "center" };

  return (
    <svg
      className="course-line"
      viewBox={`0 0 ${W} ${height}`}
      role="img"
      aria-label={visual.ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clip}>
          <rect
            x={trackX}
            y={axisY - TRACK_H / 2}
            width={trackW}
            height={TRACK_H}
            rx={TRACK_H / 2}
          />
        </clipPath>
      </defs>

      <g aria-hidden="true">
        {/* the track: paper, with the negative side in coral and the positive side in mint */}
        <rect
          className="course-line-track"
          x={trackX}
          y={axisY - TRACK_H / 2}
          width={trackW}
          height={TRACK_H}
          rx={TRACK_H / 2}
        />
        <g clipPath={`url(#${clip})`}>
          {hasNegatives && (
            <rect
              className="course-line-neg"
              x={trackX}
              y={axisY - TRACK_H / 2}
              width={zeroX - trackX}
              height={TRACK_H}
            />
          )}
          {hasPositives && (
            <rect
              className="course-line-pos"
              x={zeroX}
              y={axisY - TRACK_H / 2}
              width={trackX + trackW - zeroX}
              height={TRACK_H}
            />
          )}
        </g>
        <rect
          className="course-line-outline"
          x={trackX}
          y={axisY - TRACK_H / 2}
          width={trackW}
          height={TRACK_H}
          rx={TRACK_H / 2}
        />
        {/* the line goes on past both ends */}
        <polyline
          className="course-line-chevron"
          points={`${trackX - 3},${axisY - 7} ${trackX - 10},${axisY} ${trackX - 3},${axisY + 7}`}
        />
        <polyline
          className="course-line-chevron"
          points={`${trackX + trackW + 3},${axisY - 7} ${trackX + trackW + 10},${axisY} ${trackX + trackW + 3},${axisY + 7}`}
        />

        {Array.from({ length: count + 1 }, (_, i) => {
          const v = round6(visual.min + i * step);
          const isZero = v === 0;
          return (
            <g key={i}>
              <line
                className={isZero ? "course-line-tick course-line-tick--zero" : "course-line-tick"}
                x1={x(v)}
                x2={x(v)}
                y1={axisY - (isZero ? 9 : 5)}
                y2={axisY + (isZero ? 9 : 5)}
              />
              {labelled(v, i) && (
                <text
                  className={
                    markSet.has(v) || pointSet.has(v) || isZero
                      ? "course-line-label course-line-label--strong"
                      : "course-line-label"
                  }
                  x={x(v)}
                  y={axisY + TRACK_H / 2 + 19}
                  textAnchor="middle"
                >
                  {fmt(v)}
                </text>
              )}
            </g>
          );
        })}

        {/* the jumps between consecutive marks, drawn after the marks have appeared */}
        {visual.jumps &&
          marks.slice(1).map((m, i) => {
            const x1 = x(marks[i]);
            const x2 = x(m);
            const baseY = axisY - TRACK_H / 2 - 4;
            const rise = Math.min(34, 10 + (x2 - x1) * 0.3);
            const cx = (x1 + x2) / 2;
            const cy = baseY - rise * 2;
            const angle = Math.atan2(baseY - cy, x2 - cx);
            const head = (sign: number) =>
              `${x2 - 8 * Math.cos(angle + sign * 0.45)},${baseY - 8 * Math.sin(angle + sign * 0.45)}`;
            return (
              <g key={`jump-${i}`}>
                <motion.path
                  className="course-line-jump"
                  d={`M ${x1} ${baseY} Q ${cx} ${cy} ${x2} ${baseY}`}
                  {...(reduced
                    ? {}
                    : {
                        initial: { pathLength: 0, opacity: 0 },
                        animate: { pathLength: 1, opacity: 1 },
                        transition: { duration: 0.3, delay: 0.3 + marks.length * 0.05 + i * 0.07 },
                      })}
                />
                <motion.polyline
                  className="course-line-jump-head"
                  points={`${head(1)} ${x2},${baseY} ${head(-1)}`}
                  {...(reduced
                    ? {}
                    : {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { delay: 0.5 + marks.length * 0.05 + i * 0.07 },
                      })}
                />
                <motion.text
                  className="course-line-jump-label"
                  x={cx}
                  y={baseY - rise - 5}
                  textAnchor="middle"
                  {...(reduced
                    ? {}
                    : {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { delay: 0.45 + marks.length * 0.05 + i * 0.07 },
                      })}
                >
                  +{fmt(round6(m - marks[i]))}
                </motion.text>
              </g>
            );
          })}

        {visual.bound !== undefined && (
          <g>
            <line
              className="course-line-bound"
              x1={x(visual.bound)}
              x2={x(visual.bound)}
              y1={axisY - 30}
              y2={axisY + 14}
            />
            <polygon
              className="course-line-flag"
              points={`${x(visual.bound)},${axisY - 30} ${x(visual.bound) + 13},${axisY - 24} ${x(visual.bound)},${axisY - 18}`}
            />
          </g>
        )}

        {marks.map((m, i) => (
          <motion.circle
            key={`mark-${m}`}
            className="course-line-mark"
            cx={x(m)}
            cy={axisY}
            r={9}
            style={origin}
            {...pop(i)}
          />
        ))}

        {points.map((p, i) => {
          const label = p.label;
          const w = label ? 14 + 8.5 * label.replace("−", "-").length : 0;
          return (
            <motion.g key={`point-${i}`} style={origin} {...pop(marks.length + i)}>
              {label && (
                <>
                  <line
                    className="course-line-stem"
                    x1={x(p.value)}
                    x2={x(p.value)}
                    y1={axisY - 10}
                    y2={axisY - 22}
                  />
                  <rect
                    className="course-line-bubble"
                    x={x(p.value) - w / 2}
                    y={axisY - 46}
                    width={w}
                    height={24}
                    rx={8}
                  />
                  <text
                    className="course-line-point-label"
                    x={x(p.value)}
                    y={axisY - 29}
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </>
              )}
              <circle className="course-line-point" cx={x(p.value)} cy={axisY} r={10} />
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
