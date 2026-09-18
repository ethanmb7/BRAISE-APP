// Subject badges on the deck grid were raw platform emoji (📐📖🌍🔬⚗️🇬🇧) — the one spot on the
// page still using unstyled system glyphs while the HUD and mascot are hand-drawn. Emoji also
// render differently per OS (Apple/Google/Windows glyphs don't match), so the same card looked
// inconsistent depending on the device. Same badge circle, same black-outline construction as
// everywhere else — only the glyph itself changes, filled with the subject's own brand color so
// it echoes the card face it sits on.
interface SubjectIconProps {
  subjectId: string;
  color: string;
  size?: number;
}

export function SubjectIcon({ subjectId, color, size = 20 }: SubjectIconProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  switch (subjectId) {
    case 'maths':
      return (
        <svg {...common}>
          <path d="M4 18 L4 6 L18 18 Z" fill={color} stroke="#151821" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M6 15 L8 15 M6 12 L8 12 M6 9 L8 9" stroke="#151821" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case 'francais':
      return (
        <svg {...common}>
          <path
            d="M12 6 C9 4.5 6 4.5 4 5.5 L4 17.5 C6 16.5 9 16.5 12 18 C15 16.5 18 16.5 20 17.5 L20 5.5 C18 4.5 15 4.5 12 6 Z"
            fill={color}
            stroke="#151821"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 6 L12 18" stroke="#151821" strokeWidth="1.4" />
          <path d="M6 8.5 L9.5 8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <path d="M14.5 8 L18 8.5" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </svg>
      );
    case 'histoire-geo':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" fill={color} stroke="#151821" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="3.2" ry="8" fill="none" stroke="#151821" strokeWidth="1.1" />
          <path d="M4 12 L20 12" stroke="#151821" strokeWidth="1.1" />
          <path d="M5.2 8 C9 9.5 15 9.5 18.8 8" fill="none" stroke="#151821" strokeWidth="0.9" />
          <path d="M5.2 16 C9 14.5 15 14.5 18.8 16" fill="none" stroke="#151821" strokeWidth="0.9" />
        </svg>
      );
    case 'svt':
      return (
        <svg {...common}>
          <path d="M12 4 C18 6 19 13 12 20 C5 13 6 6 12 4 Z" fill={color} stroke="#151821" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 6 L12 18" stroke="#151821" strokeWidth="1.1" />
          <path d="M12 9 L15 8.5 M12 13 L9 12.5" stroke="#151821" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
      );
    case 'physique':
      return (
        <svg {...common}>
          <path
            d="M10 3 L10 8 L5 18 C4.3 19.4 5.3 21 7 21 L17 21 C18.7 21 19.7 19.4 19 18 L14 8 L14 3 Z"
            fill={color}
            stroke="#151821"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9 3 L15 3" stroke="#151821" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7.5 15 L16.5 15" stroke="#151821" strokeWidth="1" opacity="0.6" />
          <circle cx="12" cy="17.5" r="1" fill="#fff" opacity="0.8" />
        </svg>
      );
    case 'anglais':
      return (
        <svg {...common}>
          <path
            d="M4 6 C4 4.9 4.9 4 6 4 L18 4 C19.1 4 20 4.9 20 6 L20 14 C20 15.1 19.1 16 18 16 L9 16 L5 20 L5 16 L6 16 C4.9 16 4 15.1 4 14 Z"
            fill={color}
            stroke="#151821"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <text x="12" y="12.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#151821" fontFamily="sans-serif">
            Aa
          </text>
        </svg>
      );
    default:
      return null;
  }
}
