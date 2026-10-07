import type { ReactNode } from "react";

// The little monument standing on each island. Hand-drawn in the same grammar as the rest of BRAISE:
// a thick ink outline, flat fills, white and the sun yellow for the colour. Chapters that have their
// own drawing use it; the others get one of the neutral monuments, so a whole subject is never six
// copies of the same picture.
const INK = "#151821";
const WHITE = "#ffffff";
const SUN = "#ffd84b";
const SW = 4;

import type { EmblemKind } from "@/lib/world/emblems";

function shapes(kind: EmblemKind): ReactNode {
  switch (kind) {
    case "nombres":
      return (
        <>
          <rect x="8" y="42" width="46" height="46" rx="10" fill={WHITE} />
          <text
            x="31"
            y="78"
            textAnchor="middle"
            fontFamily="Archivo Black"
            fontSize="38"
            fill={INK}
            stroke="none"
          >
            7
          </text>
          <g transform="rotate(9 67 35)">
            <rect x="44" y="12" width="46" height="46" rx="10" fill={SUN} />
            <text
              x="67"
              y="48"
              textAnchor="middle"
              fontFamily="Archivo Black"
              fontSize="38"
              fill={INK}
              stroke="none"
            >
              3
            </text>
          </g>
        </>
      );
    case "geometrie":
      return (
        <>
          <circle cx="64" cy="42" r="24" fill={SUN} />
          <polygon points="12,86 88,86 12,22" fill={WHITE} />
          <path d="M12 72 H26 V86" strokeWidth={SW - 1} />
        </>
      );
    case "fonctions":
      return (
        <>
          <path d="M14 10 V88 H92" />
          <path d="M20 82 Q52 -18 84 82" strokeWidth={SW + 3} />
          <path d="M20 82 Q52 -18 84 82" strokeWidth={SW} stroke={WHITE} />
          <circle cx="52" cy="31" r="8" fill={SUN} />
        </>
      );
    case "stats":
      return (
        <>
          <rect x="12" y="54" width="18" height="34" rx="4" fill={WHITE} />
          <rect x="36" y="30" width="18" height="58" rx="4" fill={SUN} />
          <rect x="60" y="44" width="18" height="44" rx="4" fill={WHITE} />
          <circle cx="86" cy="24" r="8" fill={SUN} />
          <path d="M8 88 H94" />
        </>
      );
    case "fractions":
      return (
        <>
          <circle cx="50" cy="54" r="36" fill={SUN} />
          <path d="M50 54 L50 18 A36 36 0 0 1 75.5 28.5 Z" fill={WHITE} />
          <path
            d="M50 54 L86 54 M50 54 L75.5 79.5 M50 54 L50 90 M50 54 L24.5 79.5 M50 54 L14 54 M50 54 L24.5 28.5"
            strokeWidth={3}
          />
        </>
      );
    case "equations":
      return (
        <>
          <path d="M50 88 V24 M32 88 H68" />
          <path d="M18 30 H82" />
          <path d="M18 30 L6 58 H30 Z" fill={WHITE} />
          <path d="M82 30 L70 58 H94 Z" fill={SUN} />
          <circle cx="50" cy="22" r="6" fill={WHITE} />
        </>
      );
    case "affine":
      return (
        <>
          <path d="M14 10 V88 H92" />
          <path d="M20 80 L84 22" strokeWidth={SW + 3} />
          <path d="M20 80 L84 22" strokeWidth={SW} stroke={WHITE} />
          <circle cx="20" cy="80" r="7" fill={SUN} />
          <circle cx="84" cy="22" r="7" fill={SUN} />
        </>
      );
    case "hill":
      return (
        <>
          <path d="M6 88 Q50 20 94 88 Z" fill={WHITE} />
          <path d="M50 46 V10" />
          <path d="M50 10 L76 20 L50 30 Z" fill={SUN} />
        </>
      );
    case "tower":
      return (
        <>
          <path d="M24 90 V36 H76 V90 Z" fill={WHITE} />
          <path d="M20 36 V18 H34 V28 H44 V18 H56 V28 H66 V18 H80 V36 Z" fill={SUN} />
          <path d="M42 90 V66 Q50 54 58 66 V90" fill={INK} />
        </>
      );
    case "tent":
      return (
        <>
          <path d="M8 88 L50 14 L92 88 Z" fill={SUN} />
          <path d="M50 14 L36 88 H64 Z" fill={WHITE} />
          <path d="M50 14 V6" />
        </>
      );
    case "tree":
      return (
        <>
          <path d="M44 90 V58 H56 V90 Z" fill={WHITE} />
          <circle cx="50" cy="38" r="28" fill={SUN} />
          <circle cx="38" cy="30" r="5" fill={WHITE} stroke="none" />
        </>
      );
    case "lighthouse":
      return (
        <>
          <path d="M34 90 L40 26 H60 L66 90 Z" fill={WHITE} />
          <path d="M37 62 H63 L65 74 H35 Z M39 40 H61 L62 50 H38 Z" fill={SUN} />
          <rect x="36" y="14" width="28" height="12" rx="3" fill={SUN} />
          <path d="M50 14 V6" />
        </>
      );
    case "windmill":
      return (
        <>
          <path d="M38 90 L44 44 H56 L62 90 Z" fill={WHITE} />
          <g transform="rotate(20 50 40)">
            <path
              d="M50 40 L46 6 H54 Z M50 40 L84 36 L86 44 Z M50 40 L54 74 H46 Z M50 40 L16 44 L14 36 Z"
              fill={SUN}
            />
          </g>
          <circle cx="50" cy="40" r="6" fill={WHITE} />
        </>
      );
  }
}

/** A monument. As a nested drawing it can stand inside an island's own drawing (give it x, y and size)
 *  or on its own. */
export function Emblem({
  kind,
  size,
  x,
  y,
  opacity,
}: {
  kind: EmblemKind;
  size: number;
  x?: number;
  y?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      x={x}
      y={y}
      fill="none"
      stroke={INK}
      strokeWidth={SW}
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity={opacity}
      aria-hidden="true"
    >
      {shapes(kind)}
    </svg>
  );
}
