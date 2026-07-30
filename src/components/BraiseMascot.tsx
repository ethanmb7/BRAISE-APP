type Mood = 'happy' | 'hesitant' | 'proud' | 'sleepy';

type Props = { size?: number; className?: string; mood?: Mood };

const MOOD_CLASS: Record<Mood, string> = {
  happy: 'mood-happy',
  hesitant: 'mood-hesitant',
  proud: 'mood-proud',
  sleepy: 'mood-sleepy',
};

export function BraiseMascot({ size = 80, className = '', mood = 'happy' }: Props) {
  const moodClass = MOOD_CLASS[mood];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`braise-mascot ${moodClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Braise, la mascotte"
    >
      {/* Outer flame */}
      <path
        className="flame-outer"
        d="M50 6 C 60 24, 72 30, 72 52 C 72 70, 62 82, 50 82 C 38 82, 28 70, 28 52 C 28 34, 40 30, 44 18 C 46 12, 48 8, 50 6 Z"
        fill="#FF6F59"
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
      <g className="braise-eyes">
        <circle cx="42" cy="54" r="3.2" fill="#16213A" />
        <circle cx="58" cy="54" r="3.2" fill="#16213A" />
        <circle cx="43" cy="53" r="1" fill="#fff" />
        <circle cx="59" cy="53" r="1" fill="#fff" />
      </g>
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
