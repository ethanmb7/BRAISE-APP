import { ArrowRight, Clock, Flame, X } from "lucide-react";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { Dots } from "@/components/library/Dots";
import { MathText } from "@/components/course/MathText";
import { COPY } from "@/lib/copy";
import { STATUS_LABEL } from "@/lib/course/statusLabels";
import { useTone } from "@/lib/useTone";
import { verbFor } from "@/lib/world/resume";
import { Emblem } from "@/components/world/Emblem";
import type { EmblemKind } from "@/lib/world/emblems";
import type { LibraryEntry, Resume } from "@/lib/catalog/catalog";

const startVerb = (entry: LibraryEntry) =>
  entry.status === "not_started"
    ? "Commencer"
    : entry.status === "mastered"
      ? "Rejouer"
      : "Reprendre";

/** The card pinned to the bottom of an archipelago. By default it is Braise's suggestion as a collector card:
 *  the island's own picture, the verb, the name of the chapter and one round button (no sentence: the map
 *  already carries Braise); once an island is picked it becomes that course's sheet, with what to do. */
export function Dock({
  resume,
  selected,
  onOpen,
  onClose,
  emblemOf,
}: {
  resume: Resume | null;
  selected: LibraryEntry | null;
  onOpen: (entry: LibraryEntry) => void;
  onClose: () => void;
  /** The picture of an island, so the card shows the same one as the map. */
  emblemOf: (entry: LibraryEntry) => EmblemKind;
}) {
  const { t } = useTone();

  if (selected) {
    const verb = startVerb(selected);
    const started = selected.status !== "not_started";
    return (
      <section
        className="dock dock--card dock--sheet"
        aria-label={`${selected.title}, ${STATUS_LABEL[selected.status]}`}
        aria-live="polite"
      >
        <button type="button" className="dock-close" onClick={onClose} aria-label="Fermer">
          <X size={18} strokeWidth={3} aria-hidden="true" />
        </button>
        <div className="dock-row">
          <span className="dock-card-art" aria-hidden="true">
            <svg viewBox="0 0 80 80">
              <Emblem kind={emblemOf(selected)} size={72} x={4} y={4} />
            </svg>
          </span>
          <span className="dock-card-text">
            {(selected.hook || selected.dueCount > 0) && (
              <span className="dock-kicker">
                {selected.hook && <span>{selected.title}</span>}
                {selected.dueCount > 0 && (
                  <span className="dock-due">
                    <Flame size={14} strokeWidth={2.6} aria-hidden="true" />
                    {selected.dueCount} à rallumer
                  </span>
                )}
              </span>
            )}
            <b>
              <MathText text={selected.hook ?? selected.title} />
            </b>
            {started && <Dots dots={selected.dots} source={selected.source} />}
          </span>
        </div>
        <button
          type="button"
          className={`dock-go${selected.status === "mastered" ? " dock-go--calm" : ""}`}
          onClick={() => onOpen(selected)}
        >
          <span>{verb}</span>
          <em>
            <Clock size={14} strokeWidth={2.8} aria-hidden="true" />
            {selected.minutes} min
          </em>
        </button>
      </section>
    );
  }

  if (!resume) {
    return (
      <section className="dock" aria-label="Braise">
        <span className="dock-braise" aria-hidden="true">
          <StreakFlameIcon size={34} />
        </span>
        <p className="dock-says">{t(COPY.library.allSet)}</p>
      </section>
    );
  }

  const { entry } = resume;
  const verb = verbFor(resume);
  return (
    <section className="dock dock--card" aria-label="Braise te suggère" aria-live="polite">
      <span className="dock-card-art" aria-hidden="true">
        <svg viewBox="0 0 80 80">
          <Emblem kind={emblemOf(entry)} size={72} x={4} y={4} />
        </svg>
      </span>
      <span className="dock-card-text">
        <small>{verb}</small>
        <b>{entry.title}</b>
      </span>
      <button
        type="button"
        className="dock-card-go"
        onClick={() => onOpen(entry)}
        aria-label={`${verb} ${entry.title}`}
      >
        <ArrowRight size={22} strokeWidth={3.2} aria-hidden="true" />
      </button>
    </section>
  );
}
