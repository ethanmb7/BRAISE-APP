import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

// A few sparkles scattered in the sky: where and how big. They stay still: at rest only the worlds'
// slow drift and the moon of the suggested world move (see world.css).
const STARS: { x: number; y: number; s: number }[] = [
  { x: 6, y: 5, s: 14 },
  { x: 90, y: 9, s: 10 },
  { x: 95, y: 44, s: 12 },
  { x: 3, y: 52, s: 9 },
  { x: 88, y: 90, s: 14 },
  { x: 10, y: 94, s: 10 },
];

function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <svg
      className="hub-star"
      viewBox="-12 -12 24 24"
      style={{ left: `${x}%`, top: `${y}%`, width: s }}
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
  pointed,
  still,
  onSelect,
}: {
  world: HubWorld;
  index: number;
  place: { col: number; row: number };
  /** Braise has just pointed at this world: a ring says so for a moment. */
  pointed: boolean;
  /** No entrance, for those who ask for less motion. */
  still: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      type="button"
      className={`planet${world.suggested ? " is-suggested" : ""}${pointed ? " is-pointed" : ""}`}
      data-edge={place.row === 1 ? "top" : undefined}
      style={
        {
          ["--subject" as string]: world.color,
          ["--col" as string]: place.col,
          ["--row" as string]: place.row,
          ["--i" as string]: index,
        } as CSSProperties
      }
      onClick={() => onSelect(world.id)}
      aria-label={`${world.name}${world.due > 0 ? `, ${world.due} notion${world.due > 1 ? "s" : ""} à rafraîchir` : ""}${world.suggested ? ", suggéré par Braise" : ""}`}
      // The worlds arrive one after the other, once; a press then sinks them a little.
      initial={still ? false : { opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 380,
          damping: 24,
          delay: still ? 0 : index * 0.06,
        },
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
    >
      <span className="planet-ball">
        {world.suggested && (
          <>
            <i className="planet-halo" />
            <i className="planet-moon" />
            {pointed && <i className="planet-ping" />}
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
 *  for a refresh. Braise answers a touch: she hops and points at the world she suggests (it is ringed
 *  for a moment, and brought into view if it was off screen). Built in the flow (a grid whose cells hold
 *  a world and its name), so no phone size or text size can lay a name over another world: the orbit is
 *  drawn afterwards, through where the worlds actually ended up. */
export function Hub({
  worlds,
  braiseMood,
  onSelect,
  onBraise,
}: {
  worlds: HubWorld[];
  braiseMood: "happy" | "eager" | "proud" | "hesitant";
  onSelect: (id: string) => void;
  /** Braise was pressed (the screen plays the sound). */
  onBraise: () => void;
}) {
  const places = hubPlaces(worlds.length);
  const stage = useRef<HTMLDivElement>(null);
  const [orbit, setOrbit] = useState<(Orbit & { w: number; h: number }) | null>(null);
  const reduced = useReducedMotion() ?? false;
  const [hop, setHop] = useState(0);
  const [pointed, setPointed] = useState(false);
  const suggested = worlds.find((w) => w.suggested);

  useEffect(() => {
    if (!pointed) return;
    const timer = window.setTimeout(() => setPointed(false), 1400);
    return () => window.clearTimeout(timer);
  }, [pointed, hop]);

  const point = () => {
    onBraise();
    setHop((h) => h + 1);
    const target = stage.current?.querySelector<HTMLElement>(".planet.is-suggested");
    if (!target) return;
    target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    setPointed(true);
  };

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
        <div className="hub-center">
          <i className="hub-rays" aria-hidden="true" />
          <span className="hub-sun" aria-hidden="true" />
          <button
            type="button"
            className="hub-braise"
            onClick={point}
            aria-label={suggested ? `Braise te montre ${suggested.name}` : "Braise"}
          >
            <motion.span
              key={hop}
              className="hub-braise-hop"
              initial={hop === 0 || reduced ? false : { y: 0, rotate: 0 }}
              animate={hop === 0 || reduced ? undefined : { y: [0, -14, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BraiseMascot size={104} mood={braiseMood} />
            </motion.span>
          </button>
        </div>
        {worlds.map((w, i) => (
          <Planet
            key={w.id}
            world={w}
            index={i}
            place={places[i]}
            pointed={pointed && w.suggested}
            still={reduced}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
