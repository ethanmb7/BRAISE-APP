import { motion, useReducedMotion } from "framer-motion";

const INK = "#151821";

type Props = { chapterId: string; cardIndex: number; pickedId: string | null; correct?: boolean };

const LABELS: Record<string, string> = {
  m1: "Même quantité",
  f1: "Qui raconte ?",
  h1: "Remets le temps",
  s1: "Sous le capot",
  p1: "Zoom x1000",
  a1: "Le réflexe",
};

// One small custom scene per subject: it stays in a fixed frame and only reacts to real answers.
export function DeclicVisualScene({ chapterId, cardIndex, pickedId, correct }: Props) {
  const reduced = useReducedMotion();
  const label = LABELS[chapterId];
  if (!label) return null;
  const hit = !!pickedId && !!correct;
  const pulse = reduced ? {} : { scale: [1, 1.06, 1] };
  return (
    <div
      className={`declic-visual declic-visual--${chapterId} ${pickedId ? "is-answered" : ""} ${hit ? "is-hit" : ""}`}
      aria-hidden="true"
    >
      <span className="declic-visual-label">{label}</span>
      <motion.svg
        key={`${cardIndex}-${hit}`}
        viewBox="0 0 200 90"
        className="declic-visual-svg"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {chapterId === "m1" && (
          <g stroke={INK} strokeWidth="3">
            <motion.circle cx="60" cy="45" r="32" fill="#FFC400" animate={hit ? pulse : {}} />
            <path d="M60 13 V77" />
            <motion.circle cx="140" cy="45" r="32" fill="#FFC400" animate={hit ? pulse : {}} />
            <path d="M140 13 V77 M108 45 H172" />
          </g>
        )}
        {chapterId === "f1" && (
          <g stroke={INK} strokeWidth="3">
            <rect x="20" y="22" width="70" height="50" rx="8" fill="#FFF2D8" />
            <path d="M32 38 H78 M32 50 H70 M32 62 H60" />
            <motion.path
              d="M120 30 h60 v34 h-36 l-12 10 v-10 h-12 z"
              fill={hit ? "#3FBF87" : "#FFFFFF"}
              animate={hit ? pulse : {}}
            />
          </g>
        )}
        {chapterId === "h1" && (
          <g stroke={INK} strokeWidth="3" fontFamily="Baloo 2" fontWeight={800} fontSize="16">
            <path d="M20 60 H180" />
            <rect x="34" y="28" width="52" height="24" rx="6" fill="#FF4500" />
            <rect x="114" y="28" width="52" height="24" rx="6" fill={hit ? "#3FBF87" : "#3373D6"} />
            <text x="60" y="46" textAnchor="middle" fill="#fff" stroke="none">
              1789
            </text>
            <text x="140" y="46" textAnchor="middle" fill="#fff" stroke="none">
              1793
            </text>
          </g>
        )}
        {chapterId === "s1" && (
          <g stroke={INK} strokeWidth="3">
            <path d="M100 10 V40" />
            <motion.ellipse
              cx="72"
              cy="55"
              rx="24"
              ry="28"
              fill="#FF8FA3"
              animate={reduced ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <motion.ellipse
              cx="128"
              cy="55"
              rx="24"
              ry="28"
              fill="#FF8FA3"
              animate={reduced ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <text
              x="100"
              y="86"
              textAnchor="middle"
              fontSize="12"
              stroke="none"
              fill={INK}
              fontWeight={800}
            >
              O₂
            </text>
          </g>
        )}
        {chapterId === "p1" && (
          <g stroke={INK} strokeWidth="3">
            <ellipse cx="100" cy="45" rx="70" ry="22" fill="none" />
            <ellipse cx="100" cy="45" rx="22" ry="38" fill="none" />
            <circle cx="100" cy="45" r="11" fill={hit ? "#3FBF87" : "#FF4500"} />
            <motion.circle
              cx="170"
              cy="45"
              r="5"
              fill="#3373D6"
              initial={{ x: 0 }}
              animate={reduced ? { x: 0 } : { x: [0, -140, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        )}
        {chapterId === "a1" && (
          <g stroke={INK} strokeWidth="3" fontFamily="Archivo Black" fontSize="20">
            <rect x="24" y="25" width="62" height="40" rx="8" fill="#3373D6" />
            <rect x="104" y="25" width="76" height="40" rx="8" fill={hit ? "#3FBF87" : "#FFC400"} />
            <text x="55" y="52" textAnchor="middle" fill="#fff" stroke="none">
              HE
            </text>
            <text x="142" y="52" textAnchor="middle" fill={INK} stroke="none">
              PLAYS
            </text>
          </g>
        )}
      </motion.svg>
    </div>
  );
}
