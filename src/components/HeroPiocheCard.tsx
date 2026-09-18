import { Play } from 'lucide-react';

interface HeroPiocheCardProps {
  /** Short, visible hookline (from `dailyHookLine()`) — carries the real personality/age tone;
   *  never repeats chapterTitle/subjectName since those already have their own slots below. */
  hookLine: string;
  /** Fuller sentence (from `dailyPickLine()`) announced to screen readers only — folds the
   *  hookline, chapter and subject into one flowing sentence instead of three separate DOM
   *  fragments read one after another. */
  bubbleLine: string;
  subjectName?: string;
  chapterTitle: string;
  onStart: () => void;
}

// Fifth pass on the validated base (indigo card, amber CTA, top-right mascot):
//
// - The blurred glow behind the mascot (two soft radial layers) got flagged twice now as a
//   smudge against the page's light grey background, even after being shrunk to the mascot's
//   own footprint — a blur-based glow on a light backdrop just doesn't read as "light source"
//   the way it does on a dark card. Dropped entirely. The vector `drop-shadow` filter that
//   replaced it got dropped too — its offset silhouette traced the flame's own teardrop shape,
//   reading as an unwanted dark halo rather than depth. The mascot's own 2.5px SVG stroke is
//   the only outline now; it floats and breaks out over the card's top border on its own.
// - Card keeps its flat, uniform #5865F2 (a dark gradient there was a separate bug fixed a few
//   passes ago) — "gloss" is a thin inset highlight layered into the box-shadow, not a bg change.
// - Every animated layer (CTA idle pulse, mascot hover react) lives on its own wrapper element,
//   never stacked with Tailwind's `active:`/`group-hover:` transform utilities on the SAME
//   node — that conflict (a CSS `animation` silently overwriting a utility's `transform` every
//   frame) already bit the mascot once this session.
// - Trimmed to essentials: the reinforce tag, the XP capsule and the "Fast Session" pill all
//   competed for attention with the one thing that matters — starting. "Je pioche !" keeps the
//   real draw mechanic (HomeView seeds a daily pick) in three words instead of four.
// - Hierarchy between the hookline and the title comes from weight (font-semibold vs
//   font-black), not opacity: white text on #5865F2 already sits at 4.61:1, the floor for normal
//   text — dropping the hookline to white/75 measured at 3.32:1, a real AA failure, not a
//   stylistic nuance. Full-opacity white stays the only safe choice on this background.
// - The top sheen is a hard-stopped gradient (0 to transparent by 20px), not a soft half-card
//   wash — it reads as a beveled edge catching light without reaching down into the padding box
//   where the text sits, so it can't erode the contrast margin that's already tight.
export function HeroPiocheCard({
  hookLine,
  bubbleLine,
  subjectName,
  chapterTitle,
  onStart,
}: HeroPiocheCardProps) {
  const handleStart = () => {
    if ('vibrate' in navigator) navigator.vibrate(12);
    onStart();
  };

  return (
    <div className="group relative overflow-visible rounded-2xl border-[2.5px] border-black bg-[#5865F2] p-4 shadow-[3px_3px_0px_0px_#000]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0) 20px)' }}
      />
      <div className="tw-float-pop pointer-events-none absolute -right-2 -top-3 z-20 h-20 w-20">
        <div className="h-full w-full -rotate-6 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
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
            <ellipse cx="41" cy="30" rx="5" ry="8" fill="#fff" opacity="0.35" transform="rotate(-18 41 30)" />
          </svg>
        </div>
      </div>

      <div className="max-w-[76%]">
        <p className="mb-0.5 truncate text-xs font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          {hookLine}
        </p>
        <h2 className="truncate font-display text-lg font-black leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          {chapterTitle}
        </h2>
      </div>
      <span className="sr-only">{bubbleLine}</span>

      {subjectName && (
        <div className="mb-1 mt-1">
          <span className="whitespace-nowrap rounded-full border border-white/30 bg-black/15 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
            🔥 {subjectName}
          </span>
        </div>
      )}

      <div className="tw-cta-pulse">
        <button
          onClick={handleStart}
          className="tw-shimmer flex w-full items-center justify-center gap-1.5 rounded-full border-[2.5px] border-black bg-gradient-to-b from-[#FFE066] to-[#FDC800] px-3.5 py-3 font-display text-sm font-black text-black shadow-[3px_3px_0px_0px_#000] transition-all active:translate-y-1 active:scale-95 active:shadow-none"
        >
          <Play size={15} />
          Je pioche !
        </button>
      </div>
    </div>
  );
}
