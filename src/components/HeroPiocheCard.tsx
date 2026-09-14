import { Play } from 'lucide-react';

interface HeroPiocheCardProps {
  /** Braise's full daily-pick sentence — kept for screen readers (sr-only) even though the
   * visible card no longer has room to show it as a full sentence; the mascot + compact meta
   * line carry the "Braise picked this for you" feeling visually instead. */
  bubbleLine: string;
  subjectName?: string;
  subjectColor?: string;
  subjectEmoji?: string;
  needsReinforce: boolean;
  chapterTitle: string;
  durationMin?: number;
  onStart: () => void;
}

// Concept A — Compact Banner. Mascot + a two-line text column share one row instead of being
// stacked as separate blocks; the full-width CTA stays the one thing every reference app
// (Duolingo, Brilliant, ELSA) never shrinks. Everything else that used to live here — the
// full sentence, the subject/reinforce badges, the mini priority-path stepper — is either
// folded into the compact meta line, or was genuinely redundant with what's already visible
// one scroll away (the priority carousel below already shows the same ranking).
export function HeroPiocheCard({
  bubbleLine,
  subjectName,
  subjectColor,
  subjectEmoji,
  needsReinforce,
  chapterTitle,
  durationMin,
  onStart,
}: HeroPiocheCardProps) {
  return (
    <div className="rounded-3xl border-2 border-black bg-white p-3 shadow-[3px_4px_0_#000] dark:bg-[var(--paper)]">
      <span className="sr-only">{bubbleLine}</span>

      <div className="mb-2.5 flex items-center gap-3">
        <div className="tw-float h-11 w-11 flex-shrink-0 drop-shadow-[2px_3px_0_#000]">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 8 C 60 25, 71 31, 71 52 C 71 69, 61 80, 50 80 C 39 80, 29 69, 29 52 C 29 35, 40 31, 44 20 C 46 14, 48 10, 50 8 Z"
              fill="#FF4500"
              stroke="#151821"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M50 24 C 55 35, 63 39, 63 53 C 63 64, 57 72, 50 72 C 43 72, 37 64, 37 53 C 37 42, 44 39, 46 32 C 47 28, 49 26, 50 24 Z"
              fill="#FF9A3D"
              stroke="#151821"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M50 39 C 53 46, 57 48, 57 57 C 57 63, 53 67, 50 67 C 47 67, 43 63, 43 57 C 43 50, 48 48, 48 43 C 49 41, 49 40, 50 39 Z"
              fill="#FFD84B"
              stroke="#151821"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="41.5" cy="54" r="4.4" fill="#151821" />
            <circle cx="58.5" cy="54" r="4.4" fill="#151821" />
            <circle cx="43" cy="52.4" r="1.5" fill="#fff" />
            <circle cx="60" cy="52.4" r="1.5" fill="#fff" />
            <path d="M42 62 Q 50 70, 58 62" stroke="#151821" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          {subjectName && (
            <p
              className="truncate font-mono text-[0.62rem] font-extrabold uppercase tracking-wide"
              style={{ color: subjectColor }}
            >
              {subjectEmoji} {subjectName}
              {durationMin != null && <span className="text-[var(--ink-soft)]"> · {durationMin} min</span>}
              {needsReinforce && <span aria-label="À renforcer"> ⚠️</span>}
            </p>
          )}
          <h2 className="truncate font-display text-lg font-extrabold leading-tight text-[var(--ink)]">
            {chapterTitle}
          </h2>
        </div>
      </div>

      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-sapie-neo-orange py-2.5 font-display text-sm font-extrabold text-white shadow-[3px_3px_0_#000] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <Play size={15} />
        Continuer la leçon {durationMin != null && `(${durationMin} min)`}
      </button>
    </div>
  );
}
