import { SubjectIcon } from "@/components/SubjectIcon";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";

/** The space between the Pioche and "Tes mondes": the student says a test is coming, and Braise prepares
 *  it with them. Nothing planned: one line and one button. Something planned: the subject, a button that
 *  opens it, and a way to drop it. No date, no countdown. */
export function PrepareCard({
  subject,
  onAsk,
  onPrepare,
  onClear,
}: {
  subject: { id: string; name: string; color: string } | null;
  onAsk: () => void;
  onPrepare: () => void;
  onClear: () => void;
}) {
  const { t } = useTone();
  return (
    <section className="prep" aria-label="Préparer un contrôle">
      <div className="prep-row">
        {subject && (
          <span className="prep-disc" style={{ background: subject.color }} aria-hidden="true">
            <SubjectIcon subjectId={subject.id} color={subject.color} size={22} />
          </span>
        )}
        <div className="prep-text">
          <b>{subject ? t(COPY.prepare.set(subject.name)) : t(COPY.prepare.title)}</b>
          {!subject && <span>{t(COPY.prepare.ask)}</span>}
        </div>
        <button type="button" className="prep-btn" onClick={subject ? onPrepare : onAsk}>
          {t(subject ? COPY.prepare.go : COPY.prepare.start)}
        </button>
      </div>
      {subject && (
        <button type="button" className="prep-clear" onClick={onClear}>
          {t(COPY.prepare.clear)}
        </button>
      )}
    </section>
  );
}
