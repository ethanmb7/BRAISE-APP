import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { Dots } from "@/components/library/Dots";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import type { Resume } from "@/lib/catalog/catalog";
import { verbFor } from "@/lib/world/resume";
import type { Subject } from "@/types";

/** The one thing Braise points at in a subject: something to pick up, a point to firm up, a review
 *  that is coming due, or the next course. Same idea as the Home card, so Matières stays the place
 *  where the student chooses freely while this says where to start if they would rather not. */
export function ResumeBanner({
  subject,
  resume,
  onOpen,
}: {
  subject: Subject;
  resume: Resume;
  onOpen: () => void;
}) {
  const { t } = useTone();
  const { entry, reason } = resume;
  const says =
    reason === "review"
      ? t(COPY.library.reviewSays(entry.dueCount))
      : t(COPY.library.resumeSays[reason]);
  const verb = verbFor(resume);

  return (
    <motion.button
      type="button"
      className="lib-resume"
      style={{ ["--subject" as string]: subject.color } as CSSProperties}
      onClick={onOpen}
      whileTap={{ y: 3, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      aria-label={`${t(COPY.library.resumeKicker[reason])} : ${entry.hook ?? entry.title}. ${verb}`}
    >
      <span className="lib-resume-kicker">{t(COPY.library.resumeKicker[reason])}</span>
      <span className="lib-resume-body">
        <span className="lib-resume-braise" aria-hidden="true">
          <BraiseMascot size={58} mood={reason === "next" ? "eager" : "happy"} />
        </span>
        <span className="lib-resume-text">
          <span className="lib-resume-says">{says}</span>
          <b className="lib-resume-title">{entry.hook ?? entry.title}</b>
          {entry.hook && <span className="lib-resume-name">{entry.title}</span>}
          <span className="lib-resume-meta">
            <Dots dots={entry.dots} source={entry.source} />
            <span>~{entry.minutes} min</span>
          </span>
        </span>
        <span className="lib-resume-play" aria-hidden="true">
          <Play size={22} className="translate-x-[1px] fill-current" />
        </span>
      </span>
    </motion.button>
  );
}
