import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SubjectIcon } from "@/components/SubjectIcon";
import type { HubWorld } from "@/components/world/Hub";

/** The way into the courses from Aujourd'hui: Braise, one small world per subject, and a clear button.
 *  It replaces a link that was 64 px wide, so a new student sees where to learn without looking for it.
 *  Each world opens its subject; the button opens "Où on va ?". */
export function WorldsTeaser({
  worlds,
  says,
  onOpenAll,
  onOpenSubject,
}: {
  worlds: HubWorld[];
  says: string;
  onOpenAll: () => void;
  onOpenSubject: (id: string) => void;
}) {
  return (
    <section className="teaser" aria-label="Tes cours">
      <div className="teaser-top">
        <span className="teaser-braise" aria-hidden="true">
          <BraiseMascot size={52} mood="eager" />
        </span>
        <p className="teaser-says">{says}</p>
      </div>
      <div className="teaser-row" role="group" aria-label="Les matières">
        {worlds.map((w) => (
          <motion.button
            key={w.id}
            type="button"
            className="teaser-world"
            style={{ ["--subject" as string]: w.color } as CSSProperties}
            onClick={() => onOpenSubject(w.id)}
            aria-label={`${w.name}${w.due > 0 ? `, ${w.due} notion${w.due > 1 ? "s" : ""} à rafraîchir` : ""}`}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <SubjectIcon subjectId={w.id} color={w.color} size={24} />
            {w.due > 0 && <i className="teaser-due" aria-hidden="true" />}
          </motion.button>
        ))}
      </div>
      <button type="button" className="teaser-cta" onClick={onOpenAll}>
        Où on va ? <ArrowRight size={18} strokeWidth={3} />
      </button>
    </section>
  );
}
