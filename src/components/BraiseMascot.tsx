type Mood = 'happy' | 'hesitant' | 'proud' | 'sleepy' | 'cool' | 'frozen';

type Props = { size?: number; className?: string; mood?: Mood };

const MOOD_CLASS: Record<Mood, string> = {
  happy: 'mood-happy',
  hesitant: 'mood-hesitant',
  proud: 'mood-proud',
  sleepy: 'mood-sleepy',
  cool: 'mood-proud',
  frozen: 'mood-frozen',
};

export function BraiseMascot({ size = 80, className = '', mood = 'happy' }: Props) {
  const moodClass = MOOD_CLASS[mood];
  const hideEyes = mood === 'cool';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`braise-mascot ${moodClass} ${mood === 'frozen' ? 'mood-frozen-tint' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Braise, la mascotte"
    >
      {/* Outer flame */}
      <path
        className="flame-outer"
        d="M50 6 C 60 24, 72 30, 72 52 C 72 70, 62 82, 50 82 C 38 82, 28 70, 28 52 C 28 34, 40 30, 44 18 C 46 12, 48 8, 50 6 Z"
        fill="#F97316"
      />
      {/* Middle flame */}
      <path
        className="flame-middle"
        d="M50 22 C 56 34, 64 38, 64 54 C 64 66, 58 74, 50 74 C 42 74, 36 66, 36 54 C 36 42, 44 38, 46 30 C 47 26, 49 24, 50 22 Z"
        fill="#FFC24B"
      />
      {/* Inner flame */}
      <path
        className="flame-inner"
        d="M50 38 C 54 46, 58 48, 58 58 C 58 64, 54 68, 50 68 C 46 68, 42 64, 42 58 C 42 50, 48 48, 48 42 C 49 40, 49 39, 50 38 Z"
        fill="#FFE08A"
      />
      {/* Eyes */}
      {!hideEyes && (
        <g className="braise-eyes">
          <circle cx="42" cy="54" r="3.2" fill="#16213A" />
          <circle cx="58" cy="54" r="3.2" fill="#16213A" />
          <circle cx="43" cy="53" r="1" fill="#fff" />
          <circle cx="59" cy="53" r="1" fill="#fff" />
        </g>
      )}
      {/* Smile */}
      <path
        className="braise-smile"
        d="M44 62 Q 50 67, 56 62"
        stroke="#16213A"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cheeks */}
      <circle cx="38" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />
      <circle cx="62" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />

      {/* Sunglasses — success mood */}
      {mood === 'cool' && (
        <g className="braise-sunglasses">
          <rect x="34.5" y="49.5" width="12" height="8" rx="4" fill="#16213A" />
          <rect x="53.5" y="49.5" width="12" height="8" rx="4" fill="#16213A" />
          <rect x="46.5" y="52" width="7" height="2" fill="#16213A" />
          <path d="M33 51 L 28 49" stroke="#16213A" strokeWidth="2" strokeLinecap="round" />
          <path d="M67 51 L 72 49" stroke="#16213A" strokeWidth="2" strokeLinecap="round" />
          <rect x="37" y="51.5" width="4" height="2.5" rx="1" fill="#fff" opacity="0.5" />
          <rect x="56" y="51.5" width="4" height="2.5" rx="1" fill="#fff" opacity="0.5" />
        </g>
      )}

      {/* Ice cube — streak freeze active */}
      {mood === 'frozen' && (
        <g className="braise-ice">
          <path
            d="M28 34 C 20 40, 20 66, 28 80 C 38 88, 62 88, 72 80 C 80 66, 80 40, 72 34 C 62 26, 38 26, 28 34 Z"
            fill="#BEE7F5"
            opacity="0.55"
          />
          <path d="M34 40 L 40 46 M60 40 L 66 46 M40 70 L 46 76" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <path d="M25 62 L 33 58 L 30 68 Z" fill="#DFF4FB" stroke="#fff" strokeWidth="0.6" />
          <path d="M75 58 L 67 54 L 70 64 Z" fill="#DFF4FB" stroke="#fff" strokeWidth="0.6" />
        </g>
      )}
    </svg>
  );
}

export function SapiLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4 C 24 11, 29 13, 29 22 C 29 29, 25 33, 20 33 C 15 33, 11 29, 11 22 C 11 15, 16 13, 18 8 C 19 6, 19 5, 20 4 Z"
        fill="#FF6F59"
      />
      <path
        d="M20 11 C 23 16, 26 17, 26 23 C 26 27, 23 30, 20 30 C 17 30, 14 27, 14 23 C 14 19, 17 17, 18 14 C 19 12, 19 11, 20 11 Z"
        fill="#FFC24B"
      />
      <circle cx="17" cy="22" r="1.5" fill="#16213A" />
      <circle cx="23" cy="22" r="1.5" fill="#16213A" />
      <path d="M18 26 Q 20 28, 22 26" stroke="#16213A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
