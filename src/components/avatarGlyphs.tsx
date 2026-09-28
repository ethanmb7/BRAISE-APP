import type { ReactNode } from "react";

// The Flambés' names and drawings (see AvatarGlyph.tsx for the family's design rules).
const INK = "#151821";

type Glyph = { name: string; body: (c: string) => ReactNode; color: string };

/** La flame de base — compacte, deux épaules, pointe unique. Même silhouette pour toute la bande. */
const flame = (c: string) => (
  <path
    d="M50 10 C 64 26, 78 40, 78 60 C 78 82, 64 94, 50 94 C 36 94, 22 82, 22 60 C 22 40, 36 26, 50 10 Z"
    fill={c}
    stroke={INK}
    strokeWidth="4.5"
    strokeLinejoin="round"
  />
);

/** Yeux ronds standards, avec reflet. */
const dotEyes = (
  <>
    <ellipse cx="41" cy="55" rx="4.4" ry="4.8" fill={INK} />
    <ellipse cx="59" cy="55" rx="4.4" ry="4.8" fill={INK} />
    <circle cx="42.6" cy="53.2" r="1.5" fill="#fff" />
    <circle cx="60.6" cy="53.2" r="1.5" fill="#fff" />
  </>
);

export const GLYPHS: Record<string, Glyph> = {
  // La Flème — yeux endormis, bouche plate. Vibe chill.
  fleme: {
    name: "La Flème",
    color: "#FFD84B",
    body: (c) => (
      <>
        {flame(c)}
        {/* yeux endormis : arcs vers le bas */}
        <path
          d="M36 55 Q 41 59, 46 55"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M54 55 Q 59 59, 64 55"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="41" cy="57" r="1.6" fill={INK} />
        <circle cx="59" cy="57" r="1.6" fill={INK} />
        {/* bouche plate, blasée */}
        <path d="M44 70 H 56" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      </>
    ),
  },
  // Le Crâne — face de crâne sur la flamme. Vibe dark.
  crane: {
    name: "Le Crâne",
    color: "#7C5CFF",
    body: (c) => (
      <>
        {flame(c)}
        {/* plaque crâne */}
        <path
          d="M33 48 C 33 38, 40 34, 50 34 C 60 34, 67 38, 67 48 C 67 60, 61 72, 50 72 C 39 72, 33 60, 33 48 Z"
          fill="#FFF6E8"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* orbites */}
        <ellipse cx="42" cy="50" rx="5" ry="6" fill={INK} />
        <ellipse cx="58" cy="50" rx="5" ry="6" fill={INK} />
        {/* nez */}
        <path d="M50 56 L 47 62 L 53 62 Z" fill={INK} />
        {/* dents */}
        <path d="M40 66 H 60" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path
          d="M45 66 V 70 M 50 66 V 70 M 55 66 V 70"
          stroke={INK}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  // La Bûcheuse — lunettes, bouche déterminée. Vibe sérieuse.
  bucheuse: {
    name: "La Bûcheuse",
    color: "#FF4500",
    body: (c) => (
      <>
        {flame(c)}
        {dotEyes}
        {/* lunettes */}
        <circle cx="41" cy="55" r="8" fill="none" stroke={INK} strokeWidth="3.4" />
        <circle cx="59" cy="55" r="8" fill="none" stroke={INK} strokeWidth="3.4" />
        <path d="M49 53 H 51" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
        <path
          d="M33 54 L 27 52 M 67 54 L 73 52"
          stroke={INK}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* bouche déterminée (légère moue) */}
        <path
          d="M43 70 Q 50 67, 57 70"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  // Le Casque — casque audio. Vibe gamer.
  casque: {
    name: "Le Casque",
    color: "#3FBF87",
    body: (c) => (
      <>
        {flame(c)}
        {/* serre-tête */}
        <path
          d="M30 40 Q 50 24, 70 40"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* oreillettes */}
        <rect x="21" y="44" width="11" height="19" rx="4" fill={INK} />
        <rect x="68" y="44" width="11" height="19" rx="4" fill={INK} />
        {/* éclat vert sur l'oreillette gauche */}
        <circle cx="26.5" cy="53.5" r="2.4" fill="#3FBF87" />
        <circle cx="73.5" cy="53.5" r="2.4" fill="#3FBF87" />
        {dotEyes}
        {/* sourire confiant */}
        <path
          d="M44 67 Q 50 72, 56 67"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  // Le Masque — visière/masque noir. Vibe mystère.
  masque: {
    name: "Le Masque",
    color: "#3373D6",
    body: (c) => (
      <>
        {flame(c)}
        {/* masque couvrant les yeux */}
        <path
          d="M28 50 C 28 43, 38 41, 50 41 C 62 41, 72 43, 72 50 C 72 57, 62 59, 50 59 C 38 59, 28 57, 28 50 Z"
          fill={INK}
        />
        {/* fentes/blancs des yeux */}
        <ellipse cx="41" cy="50" rx="3.4" ry="2.2" fill="#fff" />
        <ellipse cx="59" cy="50" rx="3.4" ry="2.2" fill="#fff" />
        {/* bouche discrète */}
        <path d="M45 70 H 55" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  // L'Éclair — éclair + bouche ouverte. Vibe énergie.
  eclair: {
    name: "L'Éclair",
    color: "#FFE06B",
    body: (c) => (
      <>
        {flame(c)}
        {/* éclair qui traverse */}
        <path
          d="M55 26 L 42 50 L 50 50 L 44 70 L 62 44 L 54 44 Z"
          fill="#FF4500"
          stroke={INK}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* yeux écarquillés */}
        <ellipse cx="38" cy="56" rx="3.8" ry="4.4" fill={INK} />
        <ellipse cx="62" cy="56" rx="3.8" ry="4.4" fill={INK} />
        <circle cx="39" cy="54.5" r="1.3" fill="#fff" />
        <circle cx="63" cy="54.5" r="1.3" fill="#fff" />
        {/* bouche ouverte (hype) */}
        <ellipse cx="50" cy="69" rx="4.6" ry="3.4" fill={INK} />
      </>
    ),
  },
  // La Fuse — hublot de fusée, pointe haute. Vibe ambition. (rang Or)
  fuse: {
    name: "La Fuse",
    color: "#FFC400",
    body: (c) => (
      <>
        {/* flame pointue comme une fusée */}
        <path
          d="M50 6 C 60 22, 76 38, 76 60 C 76 82, 64 94, 50 94 C 36 94, 24 82, 24 60 C 24 38, 40 22, 50 6 Z"
          fill={c}
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* ailerons de base */}
        <path
          d="M28 84 L 20 92 L 34 90 Z"
          fill="#FF4500"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M72 84 L 80 92 L 66 90 Z"
          fill="#FF4500"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* hublot */}
        <circle cx="50" cy="52" r="11" fill="#FFF0D2" stroke={INK} strokeWidth="3.6" />
        <circle cx="46" cy="48" r="3.6" fill="#8ECFFF" />
        {/* étoiles dans les yeux (ambition) */}
        <path
          d="M38 76 L 39.5 79 L 42.5 79 L 40 81 L 41 84 L 38 82 L 35 84 L 36 81 L 33.5 79 L 36.5 79 Z"
          fill="#FF4500"
        />
        <path
          d="M62 76 L 63.5 79 L 66.5 79 L 64 81 L 65 84 L 62 82 L 59 84 L 60 81 L 57.5 79 L 60.5 79 Z"
          fill="#FF4500"
        />
      </>
    ),
  },
  // La Glace — lunettes de soleil, flame froide. Vibe cool. (rang Platine)
  glace: {
    name: "La Glace",
    color: "#8ECFFF",
    body: (c) => (
      <>
        {flame(c)}
        {/* lunettes de soleil (double verre) */}
        <rect x="30" y="49" width="16" height="12" rx="4.5" fill={INK} />
        <rect x="54" y="49" width="16" height="12" rx="4.5" fill={INK} />
        <path d="M46 54 H 54" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
        {/* reflets */}
        <path
          d="M34 52 H 40 M 58 52 H 64"
          stroke="#8ECFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* sourire en coin (smirk) */}
        <path
          d="M44 68 Q 50 66, 57 69"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  // Le Phénix — ailes + or, yeux fiers. Vibe ultime. (rang Légende)
  phenix: {
    name: "Le Phénix",
    color: "#FF4500",
    body: (c) => (
      <>
        {/* ailes dorées flanquant la flamme */}
        <path
          d="M22 58 C 6 50, 4 62, 13 68 C 4 70, 7 78, 19 78 C 14 72, 16 64, 22 58 Z"
          fill="#FFD84B"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path
          d="M78 58 C 94 50, 96 62, 87 68 C 96 70, 93 78, 81 78 C 86 72, 84 64, 78 58 Z"
          fill="#FFD84B"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        {flame(c)}
        {/* liseré or à la pointe */}
        <path
          d="M50 10 C 56 20, 62 30, 66 42"
          stroke="#FFD84B"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* yeux fiers (^ ^) */}
        <path
          d="M36 54 Q 41 49, 46 54"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M54 54 Q 59 49, 64 54"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* grand sourire fier */}
        <path
          d="M41 65 Q 50 75, 59 65"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="#FFD84B"
        />
      </>
    ),
  },
};

export function getAvatarName(id: string) {
  return GLYPHS[id]?.name ?? "Flambé";
}
