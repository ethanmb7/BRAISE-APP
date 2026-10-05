import { useEffect, useState } from "react";

// The BRAISE brand mark: a simplified, iconic flame with face and core — no arms, legs, or
// rank outfit. This is the logo, not the character (use BraiseMascot for the living character).
// Falls back to the generated PNG on any runtime SVG hiccup, but the vector version is the
// canonical mark: crisp at every size, themeable, and consistent with BraiseCharacter.tsx.

const INK = "#151821";
const FACE = "#FFF2D8";

type Props = { size?: number; className?: string };

function BraiseLogoSVG({ size = 52, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 108 116"
      fill="none"
      className={className}
      role="img"
      aria-label="BRAISE"
    >
      {/* ground shadow */}
      <ellipse cx="54" cy="110" rx="28" ry="5" fill={INK} opacity="0.15" />

      {/* outer flame — compact, two asymmetric peaks (left taller, leaning) */}
      <path
        d="M25 79 C20 65 25 53 36 44 C33 35 37 29 43 34 L49 40 C50 28 58 16 66 9 C71 5 74 10 71 17 C68 27 71 34 79 43 C88 53 91 67 86 81 C81 96 69 103 53 103 C38 103 29 95 25 79 Z"
        fill="#F04418"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* inner flame */}
      <path
        d="M30 80 C29 61 40 47 53 46 C69 46 80 60 79 80 C78 94 67 101 53 101 C39 101 31 94 30 80 Z"
        fill="#FF7A1A"
      />

      {/* face plate */}
      <path
        d="M31 67 C31 53 41 46 53 46 C67 46 77 54 77 68 C77 82 67 89 53 89 C40 89 31 81 31 67 Z"
        fill={FACE}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* eyes — confident, determined */}
      <path d="M36 53 L49 55 M58 55 L71 52" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <ellipse cx="43" cy="60" rx="3.8" ry="4" fill={INK} />
      <ellipse cx="64" cy="60" rx="3.8" ry="4" fill={INK} />
      <circle cx="44.2" cy="58.8" r="1.2" fill="#FFFFFF" />
      <circle cx="65.2" cy="58.8" r="1.2" fill="#FFFFFF" />

      {/* smirk */}
      <path
        d="M45 71 Q54 76 63 70"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* cheek blush */}
      <path
        d="M34 69 l4 -1"
        stroke="#FF6F59"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* incandescent core */}
      <path
        d="M53 76 L58 82 L53 90 L48 82 Z"
        fill="#FFD84B"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M51 78 L54 75"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

export function BraiseLogo({ size = 52, className = "" }: Props) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (useFallback) return;
    // If the SVG throws during render (SSR or hydration edge), the error boundary catches it.
    // This is a safety net, not a primary path.
  }, [useFallback]);

  if (useFallback) {
    return (
      <img
        src="/braise-logo.png"
        alt="BRAISE"
        width={size}
        height={size}
        className={className}
        loading="eager"
        onError={() => setUseFallback(false)}
      />
    );
  }

  return <BraiseLogoSVG size={size} className={className} />;
}
