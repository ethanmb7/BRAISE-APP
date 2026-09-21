// The streak flame was raw platform emoji (🔥) — the single most-seen glyph in the whole app
// (it's the daily-return signal, shown every time the Hero renders). Same construction as
// SubjectIcon/RankIcon: flat fill, #151821 stroke, a lighter inner flame for the classic two-tone
// flame read instead of a single flat blob.
export function StreakFlameIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 C14.3 5.6 17 8.2 17 12.8 C17 17.4 14.8 20.5 12 20.5 C8.6 20.5 6 17.6 6 13.4 C6 11 7.3 9.4 7.9 7.6 C8.3 9.7 9.2 10.2 9.8 9.3 C8.9 6.3 9.8 3.4 12 2 Z"
        fill="#ff4500"
        stroke="#151821"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 10.6 C13.4 12.6 14.2 14.1 14.2 16 C14.2 17.7 13.2 18.8 12 18.8 C10.5 18.8 9.5 17.7 9.5 16.1 C9.5 14.8 10.4 14 11 13 C11.3 14.1 11.9 14.3 12.2 13.5 C11.6 12 11.6 11.3 12.2 10.6 Z"
        fill="#ffd166"
        opacity="0.95"
      />
    </svg>
  );
}
