import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { SUBJECTS, SUBJECT_SHORT_NAMES } from "@/data";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { SOON_CHOICES } from "@/lib/world/soon";

/** Two taps: which subject, then when (tomorrow, this week, next week). No calendar to fill in. */
export function PrepareSheet({
  onChoose,
  onClose,
}: {
  onChoose: (subjectId: string, days: number) => void;
  onClose: () => void;
}) {
  const { t } = useTone();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  return (
    <>
      <div className="ui-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        className="ui-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t(COPY.prepare.title)}
      >
        <header className="ui-sheet-head">
          <h2>{subject ? t(COPY.prepare.when(subject.name)) : t(COPY.prepare.which)}</h2>
          <button type="button" className="ui-sheet-close" onClick={onClose} aria-label="Fermer">
            <X size={20} strokeWidth={3} />
          </button>
        </header>
        {!subject ? (
          <div className="prep-subjects">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="prep-subject"
                onClick={() => setSubjectId(s.id)}
              >
                <span className="prep-disc" style={{ background: s.color }} aria-hidden="true">
                  <SubjectIcon subjectId={s.id} color={s.color} size={22} />
                </span>
                {SUBJECT_SHORT_NAMES[s.id] ?? s.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="soon-choices">
            {SOON_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="soon-choice"
                onClick={() => onChoose(subject.id, choice.days)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
