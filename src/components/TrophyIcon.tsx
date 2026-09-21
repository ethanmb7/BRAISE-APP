// The share button's trophy was still a raw lucide-react icon (a thin stroke-only line, no
// fill, no black outline) — the one piece of content iconography on the page's most-seen
// button that never got the RankIcon/BadgeIcon treatment. Same construction as that family:
// flat fill, #151821 stroke, a light highlight line for shine. The handles are stroke-only
// (no fill) rather than a closed ring shape — thin loops read cleaner at 18-20px that way than
// a filled ring would.
const INK = '#151821';

export function TrophyIcon({ color = '#ffd166', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.8 5 C3.7 4.6 1.8 7 3 9.5 C3.9 11.3 5.8 11.6 7.3 10.5"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.2 5 C20.3 4.6 22.2 7 21 9.5 C20.1 11.3 18.2 11.6 16.7 10.5"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.5 4 L17.5 4 L16.8 10.8 C16.4 13.6 14.5 15.3 12 15.3 C9.5 15.3 7.6 13.6 7.2 10.8 Z"
        fill={color}
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10.3 15.2 L13.7 15.2 L13.7 17.3 L16 17.3 L16 19.3 L8 19.3 L8 17.3 L10.3 17.3 Z"
        fill={color}
        stroke={INK}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8.7 5.6 L9.6 9.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
