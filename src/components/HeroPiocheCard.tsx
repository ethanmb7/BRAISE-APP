import { Play } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';

interface HeroPiocheCardProps {
  /** Fuller sentence (from `dailyPickLine()`) announced to screen readers only — folds the
   *  personalised hook, chapter and subject into one flowing sentence for anyone using a screen
   *  reader, even though (per the photo reference below) none of that shows as its own visible
   *  line anymore. */
  bubbleLine: string;
  subjectName?: string;
  chapterTitle: string;
  /** The real chapter's own `duration` field (data.ts) — minutes, never a guessed number. */
  duration: number;
  /** Real count of FLASHCARDS tagged with this chapter's id — not a fixed session size; every
   *  chapter has its own real deck. */
  cardCount: number;
  onStart: () => void;
}

// Seventh pass — the sixth pass matched a component the user pasted, not the photo they'd sent
// first; told directly "analyse bien la photo, ce n'est pas la même chose" and it's a real,
// specific gap, not a nuance: that source built a different card (giant mascot floating outside
// the top-right corner, bordered pill stats, an eyebrow badge). The photo itself shows a plainer,
// calmer card — mascot small and inline at the LEFT of the text block, eyebrow and the
// duration/cards line both bare white text (no pill chrome at all), the sun a quiet sliver
// clipped by the card's own corner rather than a large disc sitting on top of it. Matched that
// directly this time. Two real-data swaps stay from the previous pass, for the same reasons as
// before: the chapter's own real `duration`/flashcard count instead of a fixed "10 cartes · +50
// XP" (neither number exists anywhere in this app — every chapter has its own deck, and there's
// no flat per-session XP reward), and the real chapterTitle instead of a generic "Ta session
// express" repeated for every chapter. The personalised hookLine that lived here in the last pass
// is gone from view to match the photo's plainer 3-line stack — still reachable via bubbleLine,
// just not rendered — since the photo genuinely doesn't have a 4th line.
export function HeroPiocheCard({ bubbleLine, subjectName, chapterTitle, duration, cardCount, onStart }: HeroPiocheCardProps) {
  const handleStart = () => {
    if ('vibrate' in navigator) navigator.vibrate(12);
    onStart();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-black bg-[color-mix(in_srgb,var(--neo-orange)_80%,#000)] p-4 shadow-[3px_3px_0px_0px_#000]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#FDC800]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0) 20px)' }}
      />

      <div className="relative flex items-center gap-3">
        <div className="h-14 w-14 flex-shrink-0">
          <BraiseMascot size={56} mood="happy" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-black uppercase tracking-wide text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
            Pioche du jour
          </p>
          <h2 className="truncate font-display text-lg font-black leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
            {chapterTitle}
          </h2>
          {/* Full-opacity white, not white/90: this exact card background already measured
              white/90 at 4.40:1 here — under the 4.5:1 floor for normal text, the same class of
              failure this component's own history already found once on white/75. */}
          <p className="mt-1 truncate text-[0.78rem] font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
            {duration} min · {cardCount} carte{cardCount > 1 ? 's' : ''}
            {subjectName ? ` · ${subjectName}` : ''}
          </p>
        </div>
      </div>
      <span className="sr-only">{bubbleLine}</span>

      <div className="tw-cta-pulse relative mt-3">
        <button
          onClick={handleStart}
          className="tw-shimmer flex w-full items-center justify-center gap-1.5 rounded-full border-[2.5px] border-black bg-white px-3.5 py-3 font-display text-sm font-black text-black shadow-[3px_3px_0px_0px_#000] transition-all active:translate-y-1 active:scale-95 active:shadow-none"
        >
          <Play size={15} />
          GO !
        </button>
      </div>
    </div>
  );
}
