import { StreakFlameIcon } from '@/components/StreakFlameIcon';

// The 6 achievement badges (data.ts) were raw platform emoji (🔥⚡📚🧊🌟🏆) in a page that's now
// the direct landing spot for Aura's own badge bridge — showing a custom gold medal on one screen
// and system emoji on the next would have undercut the whole point of this pass. Same flat-fill
// + #151821-stroke language as SubjectIcon/RankIcon, sized for the badge grid's own ring instead
// of a gradient HUD bevel (that's a different chrome, HeaderHUD's job, not this one's).
const INK = '#151821';

export function BadgeIcon({ badgeId, size = 26 }: { badgeId: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  switch (badgeId) {
    // Same streak signal as everywhere else in the app — a 3-day streak and a 7-day streak are
    // the same kind of accomplishment at two sizes, not two different concepts.
    case 'b1':
    case 'b5':
      return <StreakFlameIcon size={size} />;
    case 'b2':
    case 'b6':
      return (
        <svg {...common}>
          <path
            d="M13 1.5 3.5 13.8h6.2l-1 8.7L19.5 9h-6.4l1.2-7.5Z"
            fill="#ffc700"
            stroke={INK}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M13.4 3 9.6 10.2l3.4-0.9" stroke={INK} strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
          {badgeId === 'b6' && (
            <>
              <path d="M4 4 L5.4 5.4 M4 5.4 L5.4 4" stroke="#ffc700" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M19.5 17.5 L21 19 M19.5 19 L21 17.5" stroke="#ffc700" strokeWidth="1.3" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case 'b3':
      return (
        <svg {...common}>
          <path
            d="M12 6.5 C10.3 5 7.7 4.7 5 5.6 L5 18.1 C7.7 17.2 10.3 17.5 12 19 C13.7 17.5 16.3 17.2 19 18.1 L19 5.6 C16.3 4.7 13.7 5 12 6.5 Z"
            fill="#818cf8"
            stroke={INK}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M12 6.5 L12 19" stroke={INK} strokeWidth="1.2" />
          <path d="M6.5 8.3 L9.8 7.8" stroke="#fff" strokeWidth="0.9" opacity="0.7" strokeLinecap="round" />
          <path d="M14.2 7.8 L17.5 8.3" stroke="#fff" strokeWidth="0.9" opacity="0.7" strokeLinecap="round" />
        </svg>
      );
    case 'b4':
      return (
        <svg {...common}>
          <g strokeLinecap="round">
            <line x1="12" y1="3" x2="12" y2="21" stroke={INK} strokeWidth="2.2" />
            <line x1="5" y1="7.5" x2="19" y2="16.5" stroke={INK} strokeWidth="2.2" />
            <line x1="19" y1="7.5" x2="5" y2="16.5" stroke={INK} strokeWidth="2.2" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="#7dd3fc" strokeWidth="1.1" />
            <line x1="5" y1="7.5" x2="19" y2="16.5" stroke="#7dd3fc" strokeWidth="1.1" />
            <line x1="19" y1="7.5" x2="5" y2="16.5" stroke="#7dd3fc" strokeWidth="1.1" />
          </g>
          <circle cx="12" cy="12" r="2.4" fill="#7dd3fc" stroke={INK} strokeWidth="1.3" />
        </svg>
      );
    default:
      return null;
  }
}
