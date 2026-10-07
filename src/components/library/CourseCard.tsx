import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Dots } from "@/components/library/Dots";
import { StatusChip } from "@/components/course/StatusChip";
import { SubjectIcon } from "@/components/SubjectIcon";
import { STATUS_LABEL } from "@/lib/course/statusLabels";
import type { LibraryEntry } from "@/lib/catalog/catalog";

/** A course as a collector card: the subject's colour on top, the hook as the name, the real chapter
 *  title small underneath, one pastille per step, and where the student stands. A course remembered
 *  for good turns gold; one that mixes up is warmed with coral. Never locked, never a grade. */
export function CourseCard({
  entry,
  color,
  onOpen,
  wide = false,
}: {
  entry: LibraryEntry;
  color: string;
  onOpen: () => void;
  /** The last card of an odd row spans both columns instead of leaving a hole. */
  wide?: boolean;
}) {
  const label = [
    entry.hook,
    entry.title,
    STATUS_LABEL[entry.status],
    `${entry.minutes} minutes`,
    entry.dueCount > 0 ? `${entry.dueCount} à revoir` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      className={`lib-card lib-card--${entry.status}${wide ? " lib-card--wide" : ""}`}
      style={{ ["--subject" as string]: color } as CSSProperties}
      onClick={onOpen}
      aria-label={label}
    >
      <span className="lib-card-base" aria-hidden="true" />
      <motion.span
        className="lib-card-face"
        whileTap={{ y: 3, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        <span className="lib-card-band">
          <span className="lib-card-icon" aria-hidden="true">
            <SubjectIcon subjectId={entry.subjectId} color={color} size={22} />
          </span>
          <StatusChip status={entry.status} />
        </span>
        <span className="lib-card-body">
          <b className="lib-card-title">{entry.hook ?? entry.title}</b>
          {entry.hook && <span className="lib-card-name">{entry.title}</span>}
        </span>
        <Dots dots={entry.dots} source={entry.source} />
        <span className="lib-card-foot">
          <span>
            {entry.levelLabel} · {entry.minutes} min
          </span>
          {entry.dueCount > 0 && <span className="lib-card-due">{entry.dueCount} à revoir</span>}
        </span>
      </motion.span>
    </button>
  );
}
