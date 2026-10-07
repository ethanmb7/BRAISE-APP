import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SubjectIcon } from "@/components/SubjectIcon";
import { HUB_HEIGHT, hubSlots } from "@/lib/world/layout";

export type HubWorld = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Cards waiting for a refresh in this world. */
  due: number;
  suggested: boolean;
};

/** "Où on va ?": Braise in the middle, one world per subject around her. A world is a button into that
 *  subject; the one Braise suggests is bigger and ringed, a pastille counts what waits for a refresh. */
export function Hub({
  worlds,
  braiseMood,
  onSelect,
}: {
  worlds: HubWorld[];
  braiseMood: "happy" | "eager" | "proud" | "hesitant";
  onSelect: (id: string) => void;
}) {
  const suggestedIndex = worlds.findIndex((w) => w.suggested);
  const slots = hubSlots(worlds.length, suggestedIndex >= 0 ? suggestedIndex : null);

  return (
    <div className="hub">
      <div className="hub-inner" style={{ ["--h" as string]: HUB_HEIGHT } as CSSProperties}>
        <i className="hub-ring" style={{ ["--d" as string]: 244 } as CSSProperties} />
        <i className="hub-ring" style={{ ["--d" as string]: 344 } as CSSProperties} />
        <span className="hub-sun" aria-hidden="true" />
        <span className="hub-braise" aria-hidden="true">
          <BraiseMascot size={104} mood={braiseMood} />
        </span>
        {worlds.map((w, i) => (
          <motion.button
            key={w.id}
            type="button"
            className={`planet${w.suggested ? " is-suggested" : ""}`}
            style={
              {
                ["--x" as string]: slots[i].x,
                ["--y" as string]: slots[i].y,
                ["--s" as string]: slots[i].size,
                ["--subject" as string]: w.color,
              } as CSSProperties
            }
            onClick={() => onSelect(w.id)}
            aria-label={`${w.name}${w.due > 0 ? `, ${w.due} notion${w.due > 1 ? "s" : ""} à rafraîchir` : ""}${w.suggested ? ", suggéré par Braise" : ""}`}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <span className="planet-ball">
              {w.suggested && <i className="planet-halo" />}
              <span className="planet-badge">
                <SubjectIcon subjectId={w.id} color={w.color} size={40} />
              </span>
              {w.due > 0 && <span className="planet-due">{w.due}</span>}
            </span>
            <span className="planet-label">{w.shortName}</span>
            {w.suggested && <span className="planet-tag">Braise te suggère</span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
