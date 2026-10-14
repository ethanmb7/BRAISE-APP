import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { SubjectIcon } from "@/components/SubjectIcon";
import type { HubWorld } from "@/components/world/Hub";

/** The six subjects as discs, pinned under the top bar of an archipelago: the way to change subject
 *  without going back anywhere. The one you are in is filled and ringed; a pastille marks the others that
 *  have notions waiting. The same discs, in the same order, as the worlds of Aujourd'hui. */
export function SubjectStrip({
  worlds,
  currentId,
  onSelect,
}: {
  worlds: HubWorld[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="strip" aria-label="Les matières">
      {worlds.map((w) => {
        const current = w.id === currentId;
        return (
          <motion.button
            key={w.id}
            type="button"
            className={`strip-disc${current ? " is-current" : ""}`}
            style={{ ["--subject" as string]: w.color } as CSSProperties}
            onClick={() => !current && onSelect(w.id)}
            aria-current={current ? "page" : undefined}
            aria-label={`${w.name}${w.due > 0 ? `, ${w.due} notion${w.due > 1 ? "s" : ""} à rafraîchir` : ""}`}
            whileTap={current ? undefined : { scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <SubjectIcon subjectId={w.id} color={w.color} size={24} />
            {w.due > 0 && !current && <i className="strip-due" aria-hidden="true" />}
          </motion.button>
        );
      })}
    </nav>
  );
}
