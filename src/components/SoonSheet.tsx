import { useEffect } from "react";
import { X } from "lucide-react";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { SOON_CHOICES } from "@/lib/world/soon";

/** "Un truc important bientôt ?": three taps and Braise leans on this subject until it has passed. No
 *  calendar to fill in, no countdown anywhere: the answer only decides what she puts forward. */
export function SoonSheet({
  subjectName,
  active,
  onChoose,
  onClear,
  onClose,
}: {
  subjectName: string;
  /** Something is already planned for this subject. */
  active: boolean;
  onChoose: (days: number) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { t } = useTone();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="ui-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        className="ui-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${t(COPY.soon.title)} ${subjectName}`}
      >
        <header className="ui-sheet-head">
          <span aria-hidden="true">
            <StreakFlameIcon size={34} />
          </span>
          <h2>{t(COPY.soon.title)}</h2>
          <button type="button" className="ui-sheet-close" onClick={onClose} aria-label="Fermer">
            <X size={20} strokeWidth={3} />
          </button>
        </header>
        <p className="soon-says">
          {t(
            active
              ? COPY.soon.set(subjectName.toLowerCase())
              : COPY.soon.ask(subjectName.toLowerCase()),
          )}
        </p>
        <div className="soon-choices">
          {SOON_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="soon-choice"
              onClick={() => onChoose(choice.days)}
            >
              {choice.label}
            </button>
          ))}
        </div>
        {active && (
          <button type="button" className="nt-link" onClick={onClear}>
            {t(COPY.soon.clear)}
          </button>
        )}
      </section>
    </>
  );
}
