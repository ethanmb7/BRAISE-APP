import { ArrowRight, X } from "lucide-react";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { Dots } from "@/components/library/Dots";
import { StatusChip } from "@/components/course/StatusChip";
import { MathText } from "@/components/course/MathText";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { verbFor } from "@/lib/world/resume";
import { useDockVariant } from "@/lib/world/dockVariant";
import { Emblem } from "@/components/world/Emblem";
import { emblemFor } from "@/lib/world/emblems";
import type { LibraryEntry, Resume } from "@/lib/catalog/catalog";

const startVerb = (entry: LibraryEntry) =>
  entry.status === "not_started"
    ? "Commencer"
    : entry.status === "mastered"
      ? "Rejouer"
      : "Reprendre";

/** The strip pinned to the bottom of an archipelago. By default it is Braise's suggestion with the one
 *  button to press (her flame, not a second Braise: she is already on the suggested island); once an island is picked it becomes that course's sheet, with what to do. */
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
  const variant = useDockVariant();

  if (selected) {
    return (
      <section className="dock dock--sheet" aria-label={selected.title} aria-live="polite">
        <div className="dock-top">
          <StatusChip status={selected.status} />
          <Dots dots={selected.dots} source={selected.source} />
          {selected.dueCount > 0 && (
            <span className="dock-due">{selected.dueCount} à rallumer</span>
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
          <StreakFlameIcon size={34} />
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
  const verb = verbFor(resume);

  // The suggested island carries its own tag on the map: nothing sits at the bottom.
  if (variant === "e") return null;

  if (variant === "b") {
    return (
      <section className="dock dock--bubble" aria-label="Braise te suggère" aria-live="polite">
        <p className="dock-says">{says}</p>
        <button type="button" className="dock-pill" onClick={() => onOpen(entry)}>
          {verb} <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (variant === "c") {
    return (
      <section className="dock dock--bar" aria-label="Braise te suggère" aria-live="polite">
        <span className="dock-bar-title">
          <b>{entry.title}</b>
          <small>{entry.minutes} min</small>
        </span>
        <button type="button" className="dock-pill" onClick={() => onOpen(entry)}>
          {verb} <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (variant === "d") {
    return (
      <section className="dock dock--card" aria-label="Braise te suggère" aria-live="polite">
        <span className="dock-card-art" aria-hidden="true">
          <svg viewBox="0 0 80 80">
            <Emblem kind={emblemFor(entry.chapterId, 0)} size={72} x={4} y={4} />
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

  return (
    <section className="dock" aria-label="Braise te suggère" aria-live="polite">
      <span className="dock-braise" aria-hidden="true">
        <StreakFlameIcon size={34} />
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
