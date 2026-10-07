import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { GLOSSARY, termById, type TermId } from "@/lib/glossary";

/** The sheet that explains one word (or all of them, with no `term`). Closes on its backdrop, on its
 *  button and on Escape. */
export function GlossarySheet({ term, onClose }: { term?: TermId; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const terms = term ? [termById(term)] : GLOSSARY;
  return (
    <>
      <div className="ui-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        className="ui-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={term ? termById(term).label : "Le lexique de Braise"}
      >
        <header className="ui-sheet-head">
          <span aria-hidden="true">
            <BraiseMascot size={44} mood="happy" />
          </span>
          <h2>{term ? "Braise t’explique" : "Le lexique de Braise"}</h2>
          <button type="button" className="ui-sheet-close" onClick={onClose} aria-label="Fermer">
            <X size={20} strokeWidth={3} />
          </button>
        </header>
        <dl className="ui-terms">
          {terms.map((t) => (
            <div key={t.id} className="ui-term">
              <dt>{t.label}</dt>
              <dd>{term ? t.long : t.short}</dd>
              {!term && <dd className="ui-term-long">{t.long}</dd>}
            </div>
          ))}
        </dl>
        <button type="button" className="ui-primary" onClick={onClose}>
          Compris
        </button>
      </section>
    </>
  );
}

/** A small "?" that opens the sheet for one word, 44 px to press and quiet to look at. */
export function GlossaryButton({ term, label }: { term: TermId; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="ui-help"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={label ?? `C’est quoi : ${termById(term).label} ?`}
      >
        <HelpCircle size={18} strokeWidth={2.8} />
      </button>
      {open && <GlossarySheet term={term} onClose={() => setOpen(false)} />}
    </>
  );
}
