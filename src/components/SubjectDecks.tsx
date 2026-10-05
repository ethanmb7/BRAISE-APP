import { motion } from "framer-motion";
import { ArrowUpRight, Check, Clock3 } from "lucide-react";
import { SubjectIcon } from "./SubjectIcon";

export interface SubjectDeckItem {
  id: string;
  name: string;
  color: string;
  pct: number;
  /** Position (1-indexed) of the subject's current chapter in its own sequence — "Niv. 3" reads
   *  as "3rd chapter in", not a fabricated stat: no separate per-subject level field exists. */
  level: number;
  /** The current chapter's own title (leading article stripped for brevity) — real data, one
   *  short segment. Never truncated with an ellipsis: it wraps instead if it doesn't fit. */
  chapterLabel: string;
  chapterCount: number;
  doneCount: number;
  duration: number | null;
  isDailyPick?: boolean;
}

interface SubjectDecksProps {
  items: SubjectDeckItem[];
  onSelect: (id: string) => void;
}

// Full-saturation card face (not a pastel tint) to match the HUD's own vividness. Title and
// chapter label use pure #000, not text-slate-900 or --neo-ink — both measured a hair too light
// and drop francais/anglais below 4.5:1 AA on their own saturated backgrounds; #000 clears every
// subject at >=4.7:1. Same bevel base/face press mechanic as HeaderHUD, but the face's own press
// is a real spring now (was a flat `transition-transform` CSS press) — this is the single most
// frequent tap in the whole app (choosing a subject, every session) and it was the one surface
// with zero physical weight next to Réviser's spring-driven cards and the Pioche du jour's chest.
// Sound+haptic were already real here (goToChapter → sfx.tap, which fires haptic(8) unconditionally
// even with sound off) — only the press *feel* itself was missing, not the feedback loop. The
// bottom row is normal flow, never absolutely positioned, so nothing can ever overlap.
export function SubjectDecks({ items, onSelect }: SubjectDecksProps) {
  return (
    <div className="subject-deck-grid">
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="subject-deck group"
          aria-label={`${item.name}, ${item.chapterLabel}${item.isDailyPick ? ", matière de ta mission du jour" : ""}`}
          style={{ "--subject-color": item.color, "--deck-index": index } as React.CSSProperties}
        >
          <span aria-hidden="true" className="subject-deck-sheet subject-deck-sheet-back" />
          <span aria-hidden="true" className="subject-deck-sheet subject-deck-sheet-middle" />
          <motion.span
            className="subject-deck-face"
            whileTap={{ x: 3, y: 4, rotate: 0, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <div className="subject-deck-topline">
              <span className="subject-deck-icon">
                <SubjectIcon subjectId={item.id} color={item.color} size={25} />
              </span>
              <span className="subject-deck-level">
                {item.pct === 100 ? <Check size={13} strokeWidth={3} /> : `0${item.level}`}
              </span>
            </div>

            <div className="subject-deck-copy">
              <span className="subject-deck-kicker">
                {item.pct === 100 ? "Deck terminé" : "Prochain cours"}
              </span>
              <b>{item.name}</b>
              <span className="subject-deck-chapter">{item.chapterLabel}</span>
            </div>

            <div className="subject-deck-footer">
              <div className="subject-deck-progress-row">
                <div className="subject-deck-progress" aria-hidden="true">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.55, delay: 0.06 * index, ease: "easeOut" }}
                  />
                </div>
                <b>
                  {item.doneCount}/{item.chapterCount}
                </b>
              </div>
              <div className="subject-deck-action">
                <span>
                  {item.duration !== null && <Clock3 size={13} aria-hidden="true" />}
                  {item.duration !== null ? `${item.duration} min` : "Revoir"}
                </span>
                <span className="subject-deck-arrow" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={3} />
                </span>
              </div>
            </div>
          </motion.span>
        </button>
      ))}
    </div>
  );
}
