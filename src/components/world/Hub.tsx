import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BraiseMascot } from "@/components/BraiseMascot";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { SubjectIcon } from "@/components/SubjectIcon";
import { hubPlaces } from "@/lib/world/layout";
import { fitOrbit, type Orbit } from "@/lib/world/orbit";
import { deltaToReveal } from "@/lib/world/scroll";

/** How many worlds the dashed orbit goes through: the hexagon. The corners (a seventh world and more)
 *  sit outside it. */
const ORBIT_WORLDS = 6;

export type HubWorld = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Cards waiting for a refresh in this world. */
  due: number;
  /** Set on the one world Braise suggests: what she would do there, said as a verb and a chapter. */
  suggestion?: { verb: string; chapter: string };
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
  still,
  onSelect,
}: {
  world: HubWorld;
  index: number;
  place: { col: number; row: number };
  /** No entrance, for those who ask for less motion. */
  still: boolean;
  onSelect: (id: string) => void;
}) {
  const { suggestion } = world;
  return (
    <motion.button
      type="button"
      className={`planet${suggestion ? " is-suggested" : ""}`}
      data-world={world.id}
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
      aria-label={`${world.name}${world.due > 0 ? `, ${world.due} à rallumer` : ""}${suggestion ? `, Braise te conseille : ${suggestion.verb.toLowerCase()} ${suggestion.chapter}` : ""}`}
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
        {suggestion && (
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
        {suggestion && <span className="planet-tag">{suggestion.verb} →</span>}
      </span>
    </motion.button>
  );
}

/** The worlds as a small solar system, on Aujourd'hui: the subjects go around the sun (a hexagon of places,
 *  then the corners, see `hubPlaces`) on a dashed orbit that passes through the first six. A world is the
 *  button: touching it opens its archipelago. The one Braise suggests is bigger, ringed, has a moon, and
 *  carries the verb she would use ("Reprendre →"). A pastille counts what waits for a refresh. Built in
 *  the flow (a grid whose cells hold a world and its name), so no phone size or text size can lay a name
 *  over another world: the orbit is drawn afterwards, through where the worlds actually ended up. */
export function Hub({
  worlds,
  braiseMood,
  compact = false,
  onSelect,
}: {
  worlds: HubWorld[];
  braiseMood: "happy" | "eager" | "proud" | "hesitant";
  /** The small version on Aujourd'hui: smaller worlds, and the sun is a flame (Braise is already in the
   *  Pioche card: one Braise per screen), and the screen does not scroll by itself. */
  compact?: boolean;
  onSelect: (id: string) => void;
}) {
  const places = hubPlaces(worlds.length);
  const stage = useRef<HTMLDivElement>(null);
  const [orbit, setOrbit] = useState<(Orbit & { w: number; h: number }) | null>(null);
  const reduced = useReducedMotion() ?? false;
  const suggestedId = worlds.find((w) => w.suggestion)?.id ?? null;

  // On a short phone the suggested world can be under the tab bar: bring it into view once, on arrival.
  useEffect(() => {
    if (!suggestedId || compact) return;
    const frame = requestAnimationFrame(() => {
      const scroller = document.querySelector<HTMLElement>(".app-content");
      const target = stage.current?.querySelector<HTMLElement>(".planet.is-suggested");
      if (!scroller || !target) return;
      const bar = document.querySelector<HTMLElement>(".braise-tabbar");
      const bottom = bar ? bar.getBoundingClientRect().top : window.innerHeight;
      const delta = deltaToReveal(target.getBoundingClientRect(), { top: 0, bottom });
      if (delta > 0) scroller.scrollBy({ top: delta, behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
    // Once per suggested world, not whenever the screen re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedId]);

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
      const balls = [...el.querySelectorAll(".planet-ball")]
        .slice(0, ORBIT_WORLDS)
        .map((b) => centre(b.getBoundingClientRect()));
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
    <div className={`hub${compact ? " hub--compact" : ""}`}>
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
        <div className="hub-center" aria-hidden="true">
          <i className="hub-rays" />
          <span className="hub-sun" />
          {compact ? (
            <span className="hub-flame">
              <StreakFlameIcon size={44} />
            </span>
          ) : (
            <span className="hub-braise">
              <BraiseMascot size={104} mood={braiseMood} />
            </span>
          )}
        </div>
        {worlds.map((w, i) => (
          <Planet
            key={w.id}
            world={w}
            index={i}
            place={places[i]}
            still={reduced}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
