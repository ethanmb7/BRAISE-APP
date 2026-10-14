import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { MathText } from "@/components/course/MathText";
import type { SheetRow } from "@/lib/world/sheet";

function Flame() {
  return (
    <svg className="sheet-flame" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21c-5 0-8-3.3-8-7.3 0-3 1.7-4.8 3.3-6.4C9 5.6 10.4 4.4 10.7 2c3.7 2.1 7.3 5.7 7.3 10.2C18 17.7 15.5 21 12 21z"
        fill="#ff4500"
        stroke="#151821"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** The chapters of one world, opened by touching it on "Où on va ?": a line per chapter (its name, its
 *  hook, one word for where the student stands), and the line launches the chapter: two taps from the
 *  worlds. The world Braise suggests opens with her line, and the chapter she would pick up carries her
 *  flame. A key, Échap or a touch outside closes it; the tab bar stays below, the page behind is dimmed
 *  and out of reach while it is open. It lives in the app shell (a portal), so it sits above the tab bar
 *  on a phone and stays inside the phone-sized frame on a wide screen. */
export function WorldSheet({
  name,
  subjectId,
  color,
  due,
  says,
  rows,
  onOpenChapter,
  onOpenAll,
  onClose,
}: {
  name: string;
  subjectId: string;
  color: string;
  /** Cards waiting in the whole world. */
  due: number;
  /** Braise's line, only for the world she suggests. */
  says: string | null;
  rows: SheetRow[];
  onOpenChapter: (row: SheetRow) => void;
  onOpenAll: () => void;
  onClose: () => void;
}) {
  const sheet = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<{ shell: HTMLElement; bottom: number; room: number } | null>(
    null,
  );

  // Sits just above the tab bar, and never taller than the room between it and the top of the screen.
  useLayoutEffect(() => {
    const shell = document.querySelector<HTMLElement>(".app-shell");
    if (!shell) return;
    const measure = () => {
      const box = shell.getBoundingClientRect();
      const bar = shell.querySelector<HTMLElement>(".braise-tabbar")?.getBoundingClientRect();
      const bottom = bar ? box.bottom - bar.top + 8 : 12;
      setFrame({ shell, bottom, room: box.height - bottom - 56 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Focus goes into the sheet once it is there (it appears after being measured), and back to the world
  // that opened it. The world is looked up, not remembered from the focus: Safari does not focus a button
  // that was touched.
  useEffect(() => {
    if (frame) sheet.current?.focus();
  }, [frame]);
  useEffect(
    () => () => {
      document.querySelector<HTMLElement>(`.planet[data-world="${subjectId}"]`)?.focus();
    },
    [subjectId],
  );

  // Échap closes it wherever the focus is (a touch can leave it on the world that opened the sheet).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab" || !sheet.current) return;
    const items = [...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first || document.activeElement === sheet.current)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!frame) return null;
  return createPortal(
    <>
      <div className="world-veil" onClick={onClose} aria-hidden="true" />
      <section
        ref={sheet}
        className="world-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={name}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={
          {
            ["--subject" as string]: color,
            bottom: frame.bottom,
            maxHeight: frame.room,
          } as CSSProperties
        }
      >
        <div className="sheet-top">
          <span className="sheet-dot" aria-hidden="true">
            <SubjectIcon subjectId={subjectId} color={color} size={24} />
          </span>
          <div className="sheet-head">
            <h2 className="sheet-title">{name}</h2>
            {due > 0 && <span className="isl-tag isl-tag--due sheet-due">{due} à rafraîchir</span>}
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Fermer">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        {says && (
          <p className="sheet-says">
            <Flame />
            <span>{says}</span>
          </p>
        )}
        <ul className="sheet-list">
          {rows.map((row) => (
            <li key={row.entry.key}>
              <button
                type="button"
                className={`sheet-row${row.resume ? " is-resume" : ""}`}
                onClick={() => onOpenChapter(row)}
                aria-label={`${row.entry.title}, ${row.chip.label}${row.resume ? ", celui que Braise reprendrait" : ""}`}
              >
                {row.resume && <Flame />}
                <span className="sheet-text">
                  <b>{row.entry.title}</b>
                  {row.entry.hook && (
                    <small>
                      <MathText text={row.entry.hook} />
                    </small>
                  )}
                </span>
                <i className={`isl-tag isl-tag--${row.chip.tone}`}>{row.chip.label}</i>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="sheet-all" onClick={onOpenAll}>
          Voir tout l’archipel
        </button>
      </section>
    </>,
    frame.shell,
  );
}
