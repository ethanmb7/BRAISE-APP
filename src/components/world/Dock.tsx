import { ArrowRight, X } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { Dots } from "@/components/library/Dots";
import { StatusChip } from "@/components/course/StatusChip";
import { MathText } from "@/components/course/MathText";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { verbFor } from "@/lib/world/resume";
import type { LibraryEntry, Resume } from "@/lib/catalog/catalog";

const startVerb = (entry: LibraryEntry) =>
  entry.status === "not_started"
    ? "Commencer"
    : entry.status === "mastered"
      ? "Rejouer"
      : "Reprendre";

/** The strip pinned to the bottom of an archipelago. By default it is Braise's suggestion with the one
 *  button to press; once an island is picked it becomes that course's sheet, with what to do. */
export function Dock({
  resume,
  selected,
  onOpen,
  onClose,
}: {
  resume: Resume | null;
  selected: LibraryEntry | null;
  onOpen: (entry: LibraryEntry) => void;
  onClose: () => void;
}) {
  const { t } = useTone();

  if (selected) {
    return (
      <section className="dock dock--sheet" aria-label={selected.title} aria-live="polite">
        <div className="dock-top">
          <StatusChip status={selected.status} />
          <Dots dots={selected.dots} source={selected.source} />
          {selected.dueCount > 0 && (
            <span className="dock-due">{selected.dueCount} à rafraîchir</span>
          )}
          <button type="button" className="dock-close" onClick={onClose} aria-label="Fermer">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        <b className="dock-title">
          <MathText text={selected.hook ?? selected.title} />
        </b>
        <span className="dock-name">
          {selected.hook ? `${selected.title} · ` : ""}
          {selected.levelLabel} · {selected.minutes} min
        </span>
        <button type="button" className="dock-cta" onClick={() => onOpen(selected)}>
          {startVerb(selected)} <ArrowRight size={18} strokeWidth={3} />
        </button>
      </section>
    );
  }

  if (!resume) {
    return (
      <section className="dock" aria-label="Braise">
        <span className="dock-braise" aria-hidden="true">
          <BraiseMascot size={46} mood="proud" />
        </span>
        <p className="dock-says">{t(COPY.library.allSet)}</p>
      </section>
    );
  }

  const { entry, reason } = resume;
  const says =
    reason === "review"
      ? t(COPY.library.reviewSays(entry.dueCount))
      : t(COPY.library.resumeSays[reason]);
  return (
    <section className="dock" aria-label="Braise te suggère" aria-live="polite">
      <span className="dock-braise" aria-hidden="true">
        <BraiseMascot size={46} mood={reason === "next" ? "eager" : "happy"} />
      </span>
      <div className="dock-main">
        <p className="dock-says">{says}</p>
        <button type="button" className="dock-cta" onClick={() => onOpen(entry)}>
          <span>
            {verbFor(resume)} <small>{entry.title}</small>
          </span>
          <ArrowRight size={18} strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}
