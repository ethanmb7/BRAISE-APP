// Extracted from HeaderHUD.tsx (where it lived as a local, unexported function) so TodayStrip's
// new freeze badge can reuse the same real icon instead of a second copy — the actual streak-
// freeze convention this app already uses (Duolingo calls the same mechanic the same thing).
export function SnowflakeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="hudSnowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0FDFF" />
          <stop offset="50%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <g strokeLinecap="round">
        <line x1="12" y1="2.8" x2="12" y2="21.2" stroke="#151821" strokeWidth="2.6" />
        <line x1="4" y1="7.3" x2="20" y2="16.7" stroke="#151821" strokeWidth="2.6" />
        <line x1="20" y1="7.3" x2="4" y2="16.7" stroke="#151821" strokeWidth="2.6" />
        <line x1="12" y1="2.8" x2="12" y2="21.2" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="4" y1="7.3" x2="20" y2="16.7" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="20" y1="7.3" x2="4" y2="16.7" stroke="url(#hudSnowGrad)" strokeWidth="1.4" />
        <line x1="10.4" y1="5.6" x2="13.6" y2="5.6" stroke="#151821" strokeWidth="1.4" />
        <line x1="10.4" y1="18.4" x2="13.6" y2="18.4" stroke="#151821" strokeWidth="1.4" />
        <line x1="6.7" y1="9.1" x2="8.9" y2="7.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="15.1" y1="16.1" x2="17.3" y2="14.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="17.3" y1="9.1" x2="15.1" y2="7.9" stroke="#151821" strokeWidth="1.4" />
        <line x1="8.9" y1="16.1" x2="6.7" y2="14.9" stroke="#151821" strokeWidth="1.4" />
      </g>
      <circle cx="12" cy="12" r="2.3" fill="url(#hudSnowGrad)" stroke="#151821" strokeWidth="1.2" />
      <path d="M13 4.5 15.6 9" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}
