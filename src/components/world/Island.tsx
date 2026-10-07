import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Emblem } from "@/components/world/Emblem";
import type { EmblemKind } from "@/lib/world/emblems";
import { STATUS_LABEL } from "@/lib/course/statusLabels";
import type { LibraryEntry } from "@/lib/catalog/catalog";
import type { IslandSlot } from "@/lib/world/layout";

const INK = "#151821";

// What the flag on an island says, in one colour: gold is remembered for good, blue understood, pale
// seen, coral a point that mixes up. No flag at all on an island not visited yet.
const FLAG: Partial<Record<LibraryEntry["status"], string>> = {
  mastered: "#f6b21b",
  understood: "#3b82f6",
  discovered: "#bfd7fd",
  in_progress: "#bfd7fd",
  needs_reinforcement: "#ff6f59",
};

function Flag({ color }: { color: string }) {
  return (
    <g>
      <path d="M22 32V-6" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M22 -6L46 3L22 12Z"
        fill={color}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Flame() {
  return (
    <path
      d="M128 34c-7-12 5-19 2-31 9 7 16 16 9 31a11 11 0 0 1-11 0z"
      fill="#ff4500"
      stroke={INK}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  );
}

function Spark({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 9}L${x + 3} ${y - 3}L${x + 9} ${y}L${x + 3} ${y + 3}L${x} ${y + 9}L${x - 3} ${y + 3}L${x - 9} ${y}L${x - 3} ${y - 3}Z`}
      fill="#ffd84b"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

/** One chapter as a small floating island: the monument on top, a flag for where the student stands,
 *  a flame where a review is waiting, the name underneath. Pressing it picks it; nothing is locked. */
export function Island({
  entry,
  emblem,
  slot,
  suggested,
  selected,
  index,
  onSelect,
}: {
  entry: LibraryEntry;
  emblem: EmblemKind;
  slot: IslandSlot;
  suggested: boolean;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const w = suggested ? Math.round(slot.w * 1.16) : slot.w;
  const flag = FLAG[entry.status];
  const unseen = entry.status === "not_started";
  const flame = entry.status === "needs_reinforcement" || entry.dueCount > 0;
  const label = [
    entry.title,
    STATUS_LABEL[entry.status],
    `${entry.minutes} minutes`,
    entry.dueCount > 0 ? `${entry.dueCount} à rafraîchir` : null,
    suggested ? "suggéré par Braise" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.button
      type="button"
      className={`isl${selected ? " is-selected" : ""}${suggested ? " is-suggested" : ""}`}
      style={
        {
          ["--x" as string]: slot.x,
          ["--y" as string]: slot.y,
          ["--w" as string]: w,
          ["--i" as string]: index,
        } as CSSProperties
      }
      data-island={entry.key}
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
    >
      <svg className="isl-art" viewBox="0 -58 170 198" aria-hidden="true">
        <ellipse cx="85" cy="128" rx="52" ry="9" fill="rgba(21,24,33,.16)" />
        <path
          d="M10 30L160 30L139 84Q85 118 31 84Z"
          fill="var(--earth)"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M38 60q10 8 20 0M92 76q10 8 20 0"
          stroke={INK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity=".55"
        />
        <ellipse cx="85" cy="30" rx="75" ry="21" fill="var(--grass)" stroke={INK} strokeWidth="4" />
        <ellipse cx="66" cy="25" rx="26" ry="6" fill="var(--grass-hi)" />
        <Emblem kind={emblem} size={76} x={47} y={-36} />
        {flag && <Flag color={flag} />}
        {flame && <Flame />}
        {entry.status === "mastered" && (
          <>
            <Spark x={146} y={0} />
            <Spark x={12} y={-30} />
          </>
        )}
        {selected && (
          <ellipse
            cx="85"
            cy="30"
            rx="84"
            ry="28"
            fill="none"
            stroke="#ff4500"
            strokeWidth="4"
            strokeDasharray="9 7"
          />
        )}
      </svg>
      <span className="isl-label">
        <b>{entry.title}</b>
        {entry.dueCount > 0 ? (
          <i className="isl-tag isl-tag--due">{entry.dueCount} à rafraîchir</i>
        ) : unseen ? (
          <i className="isl-tag">à découvrir</i>
        ) : null}
      </span>
    </motion.button>
  );
}
