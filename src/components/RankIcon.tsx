// The rank ladder was still five platform emoji (🥉🥈🥇💎👑) — the one piece of iconography on
// "Ton Aura" that hadn't had the SubjectIcon.tsx treatment, despite being the single most-repeated
// glyph on the page (the Hero medal, up to 5 rank-rail nodes, the rank-up celebration). Same
// construction as SubjectIcon: flat colour fill, #151821 stroke, a couple of light strokes for
// shine. The three medal tiers keep one shared silhouette (a ribboned coin) and differ only by
// colour, exactly like the real medal emoji they replace; Platine and Légende break into their
// own shapes (a cut gem, a jewelled crown) since "beyond medals" is the whole point of those two
// tiers — the same medal → gem → crown escalation competitive games use for their own rank ladders.
interface RankIconProps {
  rankId: string;
  color: string;
  size?: number;
  /** Locked nodes on the rail render a padlock instead of the rank's own shape — the shape is a
   *  reward you haven't opened yet, not something to preview worn-down or greyed out. */
  locked?: boolean;
}

const INK = '#151821';

// A plain JS mix instead of CSS color-mix() — color-mix() has no fallback path on an SVG
// presentation attribute (unlike a CSS property, a `fill="..."` attribute can't fall back to
// an earlier valid declaration), so on a browser without support it would silently render solid
// black instead of a darkened tint. Computing the same 75% colour / 25% black mix in JS works
// identically everywhere, no feature support required.
function darken(hex: string, amount: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  const r = Math.round(((num >> 16) & 255) * (1 - amount));
  const g = Math.round(((num >> 8) & 255) * (1 - amount));
  const b = Math.round((num & 255) * (1 - amount));
  return `rgb(${r}, ${g}, ${b})`;
}

export function RankIcon({ rankId, color, size = 20, locked = false }: RankIconProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  if (locked) {
    return (
      <svg {...common}>
        <rect x="6" y="11" width="12" height="9" rx="2.2" fill="#c7cbd4" stroke={INK} strokeWidth="1.6" />
        <path d="M8.3 11 L8.3 7.6 A3.7 3.7 0 0 1 15.7 7.6 L15.7 11" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="15.2" r="1.3" fill={INK} />
      </svg>
    );
  }

  switch (rankId) {
    case 'bronze':
    case 'argent':
    case 'or': {
      const ribbon = darken(color, 0.25);
      return (
        <svg {...common}>
          <path d="M7.5 2 L10.5 2 L10.5 12.5 L7.5 15 Z" fill={ribbon} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M13.5 2 L16.5 2 L16.5 15 L13.5 12.5 Z" fill={ribbon} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="12" cy="15" r="7" fill={color} stroke={INK} strokeWidth="1.8" />
          <path
            d="M12 11.8 L12.76 13.95 L15.04 14.01 L13.24 15.4 L13.88 17.59 L12 16.3 L10.12 17.59 L10.76 15.4 L8.96 14.01 L11.24 13.95 Z"
            fill="#fff"
            opacity="0.92"
          />
          <ellipse cx="9.4" cy="12.5" rx="1.7" ry="0.95" fill="#fff" opacity="0.45" transform="rotate(-35 9.4 12.5)" />
        </svg>
      );
    }
    case 'platine':
      return (
        <svg {...common}>
          <path d="M6 9 L9 4 L15 4 L18 9 L12 20.5 Z" fill={color} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M6 9 L18 9 M9 4 L12 9 M15 4 L12 9 M12 9 L12 20.5" stroke={INK} strokeWidth="1" opacity="0.55" strokeLinecap="round" />
          <path d="M9.3 4.6 L7.4 8.7" stroke="#fff" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
        </svg>
      );
    case 'legende':
      return (
        <svg {...common}>
          <path
            d="M4.5 18 L3 8.5 L7.5 12.5 L12 5 L16.5 12.5 L21 8.5 L19.5 18 Z"
            fill={color}
            stroke={INK}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect x="4.3" y="18" width="15.4" height="2.6" rx="0.8" fill={color} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="3" cy="8.5" r="1.5" fill="#fff" stroke={INK} strokeWidth="1.1" />
          <circle cx="12" cy="5" r="1.6" fill="#fff" stroke={INK} strokeWidth="1.1" />
          <circle cx="21" cy="8.5" r="1.5" fill="#fff" stroke={INK} strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}
