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

    // ---- Français
    case "book":
      return (
        <>
          <path d="M50 30 Q30 18 8 26 V82 Q30 74 50 86 Z" fill={WHITE} />
          <path d="M50 30 Q70 18 92 26 V82 Q70 74 50 86 Z" fill={WHITE} />
          <path d="M18 42 Q30 38 40 44 M18 56 Q30 52 40 58" strokeWidth={3} />
          <path d="M62 22 V52 L69 45 L76 52 V20 Z" fill={SUN} />
        </>
      );
    case "quill":
      return (
        <>
          <path d="M16 88 C6 46 40 12 88 10 C90 46 62 80 24 80 Z" fill={SUN} />
          <path d="M12 94 L78 24" />
          <path d="M42 64 L54 68 M52 50 L66 54 M62 38 L74 42" strokeWidth={3} />
        </>
      );
    case "masks":
      return (
        <>
          <path d="M8 20 H50 V46 Q50 72 29 74 Q8 72 8 46 Z" fill={WHITE} />
          <circle cx="21" cy="40" r="3" fill={INK} stroke="none" />
          <circle cx="37" cy="40" r="3" fill={INK} stroke="none" />
          <path d="M20 54 Q29 63 38 54" strokeWidth={3} />
          <path d="M42 38 H90 V62 Q90 88 66 90 Q42 88 42 62 Z" fill={SUN} />
          <circle cx="56" cy="54" r="3" fill={INK} stroke="none" />
          <circle cx="76" cy="54" r="3" fill={INK} stroke="none" />
          <path d="M56 75 Q66 66 76 75" strokeWidth={3} />
        </>
      );
    case "bubbles":
      return (
        <>
          <path
            d="M18 12 H54 Q64 12 64 22 V42 Q64 52 54 52 H34 L20 66 V52 H18 Q8 52 8 42 V22 Q8 12 18 12 Z"
            fill={WHITE}
          />
          <path d="M20 26 H50 M20 37 H40" strokeWidth={3} />
          <path
            d="M56 36 H82 Q92 36 92 46 V68 Q92 78 82 78 H80 V92 L64 78 H56 Q46 78 46 68 V46 Q46 36 56 36 Z"
            fill={SUN}
          />
          <path d="M69 45 V62" strokeWidth={5} />
          <circle cx="69" cy="70" r="2.5" fill={INK} />
        </>
      );

    // ---- Histoire-Géographie
    case "cap":
      return (
        <>
          <path
            d="M10 86 C8 46 26 16 52 14 C70 13 84 22 88 36 C90 46 84 54 76 54 C70 54 66 50 64 46 C64 62 74 76 92 86 Z"
            fill={SUN}
          />
          <rect x="6" y="72" width="88" height="18" rx="6" fill={WHITE} />
          <circle cx="34" cy="52" r="9" fill={WHITE} />
          <circle cx="34" cy="52" r="3.5" fill={SUN} />
        </>
      );
    case "bicorne":
      return (
        <g transform="translate(2 12) scale(0.96)">
          <path
            d="M0 74 Q2 34 20 24 Q36 12 50 30 Q64 12 80 24 Q98 34 100 74 Q74 54 50 56 Q26 54 0 74 Z"
            fill={INK}
          />
          <path d="M10 67 Q50 48 90 67" stroke={WHITE} strokeWidth={3} />
          <circle cx="50" cy="44" r="10" fill={SUN} />
          <circle cx="50" cy="44" r="4" fill={WHITE} />
        </g>
      );
    case "temple":
      return (
        <>
          <path d="M6 40 L50 12 L94 40 Z" fill={SUN} />
          <rect x="14" y="44" width="72" height="8" rx="2" fill={WHITE} />
          <rect x="20" y="52" width="12" height="28" fill={WHITE} />
          <rect x="44" y="52" width="12" height="28" fill={WHITE} />
          <rect x="68" y="52" width="12" height="28" fill={WHITE} />
          <rect x="10" y="80" width="80" height="10" rx="3" fill={WHITE} />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="50" cy="52" r="36" fill={WHITE} />
          <ellipse cx="50" cy="52" rx="15" ry="36" strokeWidth={3} />
          <path d="M14 52 H86 M19 34 H81 M19 70 H81" strokeWidth={3} />
          <circle cx="86" cy="16" r="8" fill={SUN} />
        </>
      );

    // ---- SVT
    case "lungs":
      return (
        <>
          <path d="M44 34 C24 28 10 50 10 72 C10 88 28 90 38 84 C46 80 46 70 44 34 Z" fill={SUN} />
          <path d="M56 34 C76 28 90 50 90 72 C90 88 72 90 62 84 C54 80 54 70 56 34 Z" fill={SUN} />
          <path d="M50 40 Q40 44 34 54 M50 40 Q60 44 66 54" strokeWidth={3} />
          <path d="M50 8 V42" strokeWidth={SW + 3} />
          <path d="M50 8 V42" stroke={WHITE} strokeWidth={SW} />
        </>
      );
    case "apple":
      return (
        <>
          <path
            d="M50 30 C30 14 8 30 14 58 C18 78 34 92 50 84 C66 92 82 78 86 58 C92 30 70 14 50 30 Z"
            fill={SUN}
          />
          <path d="M50 30 Q50 18 56 10" />
          <path d="M54 22 Q70 8 82 18 Q68 30 54 22 Z" fill={WHITE} />
          <path d="M26 50 Q28 42 36 38" stroke={WHITE} strokeWidth={4} />
        </>
      );
    case "dna":
      return (
        <>
          <path
            d="M72 18 H28 M28 26 H72 M28 46 H72 M72 54 H28 M72 74 H28 M28 82 H72"
            strokeWidth={3}
          />
          <path
            d="M50 8 C82 17 82 27 50 36 C18 45 18 55 50 64 C82 73 82 83 50 92"
            strokeWidth={SW + 3}
          />
          <path
            d="M50 8 C18 17 18 27 50 36 C82 45 82 55 50 64 C18 73 18 83 50 92"
            strokeWidth={SW + 3}
          />
          <path
            d="M50 8 C82 17 82 27 50 36 C18 45 18 55 50 64 C82 73 82 83 50 92"
            stroke={WHITE}
            strokeWidth={SW}
          />
          <path
            d="M50 8 C18 17 18 27 50 36 C82 45 82 55 50 64 C18 73 18 83 50 92"
            stroke={SUN}
            strokeWidth={SW}
          />
        </>
      );
    case "sprout":
      return (
        <>
          <path d="M22 90 Q50 66 78 90 Z" fill={WHITE} />
          <path d="M50 78 V44" />
          <path d="M50 60 C24 62 14 44 14 26 C38 26 50 38 50 60 Z" fill={WHITE} />
          <path d="M50 48 C76 50 88 34 88 14 C62 14 50 26 50 48 Z" fill={SUN} />
        </>
      );

    // ---- Physique-Chimie
    case "atom":
      return (
        <>
          <ellipse cx="50" cy="50" rx="42" ry="15" strokeWidth={3} />
          <ellipse cx="50" cy="50" rx="42" ry="15" strokeWidth={3} transform="rotate(60 50 50)" />
          <ellipse cx="50" cy="50" rx="42" ry="15" strokeWidth={3} transform="rotate(120 50 50)" />
          <circle cx="50" cy="50" r="10" fill={SUN} />
          <circle cx="92" cy="50" r="5" fill={WHITE} />
          <circle cx="71" cy="86" r="5" fill={WHITE} />
          <circle cx="29" cy="86" r="5" fill={WHITE} />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M42 10 V38 L16 82 Q12 92 24 92 H76 Q88 92 84 82 L58 38 V10" fill={WHITE} />
          <path d="M38 10 H62" />
          <path d="M26 66 H74 L84 82 Q88 92 76 92 H24 Q12 92 16 82 Z" fill={SUN} />
          <circle cx="40" cy="79" r="5" fill={WHITE} />
          <circle cx="60" cy="76" r="4" fill={WHITE} />
          <circle cx="50" cy="52" r="3.5" fill={WHITE} strokeWidth={3} />
        </>
      );
    case "bolt":
      return <path d="M58 6 L22 56 H46 L38 94 L80 38 H56 Z" fill={SUN} />;
    case "sun":
      return (
        <>
          <path d="M81 50 L94 50 M72 72 L81 81 M50 81 L50 94 M28 72 L19 81 M19 50 L6 50 M28 28 L19 19 M50 19 L50 6 M72 28 L81 19" />
          <circle cx="50" cy="50" r="20" fill={SUN} />
        </>
      );

    // ---- Anglais
    case "clock":
      return (
        <>
          <circle cx="24" cy="26" r="9" fill={SUN} />
          <circle cx="76" cy="26" r="9" fill={SUN} />
          <circle cx="50" cy="56" r="32" fill={WHITE} />
          <path d="M50 30 V35 M76 56 H71 M50 82 V77 M24 56 H29" strokeWidth={3} />
          <path d="M50 56 V38 M50 56 L63 63" />
          <circle cx="50" cy="56" r="3.5" fill={INK} />
        </>
      );
    case "hourglass":
      return (
        <>
          <path
            d="M26 15 C26 40 44 44 50 50 C44 56 26 60 26 85 H74 C74 60 56 56 50 50 C56 44 74 40 74 15 Z"
            fill={WHITE}
          />
          <path d="M38 24 H62 C60 30 54 36 50 38 C46 36 40 30 38 24 Z" fill={SUN} />
          <path d="M34 85 C34 70 44 62 50 60 C56 62 66 70 66 85 Z" fill={SUN} />
          <rect x="18" y="6" width="64" height="9" rx="3" fill={SUN} />
          <rect x="18" y="85" width="64" height="9" rx="3" fill={SUN} />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="12" y="20" width="76" height="68" rx="10" fill={WHITE} />
          <path d="M12 30 Q12 20 22 20 H78 Q88 20 88 30 V44 H12 Z" fill={SUN} />
          <path d="M30 12 V28 M70 12 V28" strokeWidth={6} />
          <path d="M30 12 V28 M70 12 V28" stroke={WHITE} strokeWidth={2.5} />
          <path d="M30 66 L44 78 L70 54" strokeWidth={7} />
        </>
      );
    case "bulb":
      return (
        <>
          <path
            d="M50 8 C26 8 16 28 24 46 C30 58 36 62 36 72 H64 C64 62 70 58 76 46 C84 28 74 8 50 8 Z"
            fill={SUN}
          />
          <path d="M42 54 L50 44 L58 54" strokeWidth={3} />
          <path d="M38 72 V82 Q38 86 42 86 H58 Q62 86 62 82 V72" fill={WHITE} />
          <path d="M44 93 H56" />
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
