import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SubjectIcon } from "@/components/SubjectIcon";
import { hubPlaces } from "@/lib/world/layout";
import { fitOrbit, type Orbit } from "@/lib/world/orbit";

export type HubWorld = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Cards waiting for a refresh in this world. */
  due: number;
  suggested: boolean;
};

// Each world a little bigger or smaller than the next, like planets (the suggested one is bigger still).
const SIZES = [1, 0.9, 1.06, 0.86, 0.98, 0.92];

// A few sparkles scattered in the sky: where, how big, when they twinkle.
const STARS: { x: number; y: number; s: number; d: number }[] = [
  { x: 6, y: 5, s: 14, d: 0 },
  { x: 90, y: 9, s: 10, d: 1.4 },
  { x: 48, y: 3, s: 8, d: 2.2 },
  { x: 95, y: 44, s: 12, d: 0.7 },
  { x: 3, y: 52, s: 9, d: 1.9 },
  { x: 88, y: 90, s: 14, d: 1.1 },
  { x: 10, y: 94, s: 10, d: 2.6 },
  { x: 52, y: 97, s: 8, d: 0.3 },
];

function Sparkle({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <svg
      className="hub-star"
      viewBox="-12 -12 24 24"
      style={{ left: `${x}%`, top: `${y}%`, width: s, animationDelay: `${d}s` }}
      aria-hidden="true"
    >
      <path
        d="M0 -10L3 -3L10 0L3 3L0 10L-3 3L-10 0L-3 -3Z"
        fill="#ffd84b"
        stroke="#151821"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Planet({
  world,
  index,
  place,
  onSelect,
}: {
  world: HubWorld;
  index: number;
  place: { col: number; row: number };
  onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      type="button"
      className={`planet${world.suggested ? " is-suggested" : ""}`}
      data-edge={place.row === 1 ? "top" : undefined}
      style={
        {
          ["--subject" as string]: world.color,
          ["--col" as string]: place.col,
          ["--row" as string]: place.row,
          ["--i" as string]: index,
          ["--k" as string]: SIZES[index % SIZES.length],
        } as CSSProperties
      }
      onClick={() => onSelect(world.id)}
      aria-label={`${world.name}${world.due > 0 ? `, ${world.due} notion${world.due > 1 ? "s" : ""} à rafraîchir` : ""}${world.suggested ? ", suggéré par Braise" : ""}`}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
    >
      <span className="planet-ball">
        {world.suggested && (
          <>
            <i className="planet-halo" />
            <i className="planet-moon" />
          </>
        )}
        <span className="planet-badge">
          <SubjectIcon subjectId={world.id} color={world.color} size={40} />
        </span>
        {world.due > 0 && <span className="planet-due">{world.due}</span>}
      </span>
      <span className="planet-meta">
        <span className="planet-label">{world.shortName}</span>
        {world.suggested && <span className="planet-tag">Braise te suggère</span>}
      </span>
    </motion.button>
  );
}

/** "Où on va ?" as a small solar system: Braise is the sun, the worlds go around her (a hexagon of
 *  places, see `hubPlaces`) on a dashed orbit that passes through all of them. A world is a button into
 *  that subject; the one Braise suggests is bigger, ringed and has a moon; a pastille counts what waits
 *  for a refresh. Built in the flow (a grid whose cells hold a world and its name), so no phone size or
 *  text size can lay a name over another world: the orbit is drawn afterwards, through where the worlds
 *  actually ended up. */
export function Hub({
  worlds,
  braiseMood,
  onSelect,
}: {
  worlds: HubWorld[];
  braiseMood: "happy" | "eager" | "proud" | "hesitant";
  onSelect: (id: string) => void;
}) {
  const places = hubPlaces(worlds.length);
  const stage = useRef<HTMLDivElement>(null);
  const [orbit, setOrbit] = useState<(Orbit & { w: number; h: number }) | null>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const sun = el.querySelector(".hub-sun")?.getBoundingClientRect();
      if (!sun || box.width === 0) return;
      const centre = (r: DOMRect) => ({
        x: r.left + r.width / 2 - box.left,
        y: r.top + r.height / 2 - box.top,
      });
      const balls = [...el.querySelectorAll(".planet-ball")].map((b) =>
        centre(b.getBoundingClientRect()),
      );
      const fit = fitOrbit(centre(sun), balls);
      setOrbit(fit ? { ...fit, w: box.width, h: box.height } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // The names change width when the fonts arrive.
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [worlds.length]);

  return (
    <div className="hub">
      <div className="hub-stage" ref={stage}>
        {STARS.map((star, i) => (
          <Sparkle key={i} {...star} />
        ))}
        {orbit && (
          <svg
            className="hub-orbits"
            width={orbit.w}
            height={orbit.h}
            viewBox={`0 0 ${orbit.w} ${orbit.h}`}
            aria-hidden="true"
          >
            <ellipse
              className="hub-orbit hub-orbit--far"
              cx={orbit.cx}
              cy={orbit.cy}
              rx={orbit.rx * 1.22}
              ry={orbit.ry * 1.18}
            />
            <ellipse
              className="hub-orbit hub-orbit--main"
              cx={orbit.cx}
              cy={orbit.cy}
              rx={orbit.rx}
              ry={orbit.ry}
            />
            <ellipse
              className="hub-orbit hub-orbit--near"
              cx={orbit.cx}
              cy={orbit.cy}
              rx={orbit.rx * 0.62}
              ry={orbit.ry * 0.6}
            />
          </svg>
        )}
        <div className="hub-center" aria-hidden="true">
          <i className="hub-rays" />
          <span className="hub-sun" />
          <span className="hub-braise">
            <BraiseMascot size={104} mood={braiseMood} />
          </span>
        </div>
        {worlds.map((w, i) => (
          <Planet key={w.id} world={w} index={i} place={places[i]} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
