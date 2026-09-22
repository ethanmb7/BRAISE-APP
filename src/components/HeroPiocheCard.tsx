import { Play, Clock, Layers } from 'lucide-react';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { BraiseMascot } from '@/components/BraiseMascot';

interface HeroPiocheCardProps {
  /** Short, visible hookline (from `dailyHookLine()`) — carries the real personality/age tone;
   *  now a caption under the title rather than the top label, so the real Braise voice survives
   *  the redesign instead of being displaced by the static "PIOCHE DU JOUR" section tag. */
  hookLine: string;
  /** Fuller sentence (from `dailyPickLine()`) announced to screen readers only — folds the
   *  hookline, chapter and subject into one flowing sentence instead of three separate DOM
   *  fragments read one after another. */
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

// Sixth pass — rebuilt around a reference the user supplied directly (first a photo, then the
// actual component source that produced it), redone on real data rather than copied verbatim:
// - The reference's STATS array was hardcoded — "2 min · 10 cartes · +50 XP" for every session,
//   every chapter. Neither "10 cartes" nor "+50 XP" exists in this app's data model as a
//   constant: every chapter has its own real flashcard count (FLASHCARDS filtered by chapterId),
//   and there is no fixed per-session XP reward (base 15/card in Réviser, doubled by the joker —
//   never a flat number promised before answering a single card). Real duration + real card
//   count stay, styled as the reference's bordered white pills; the XP stat is dropped rather
//   than invented.
// - Title/subtitle: the reference used static marketing copy ("Ta session express" / "Révise
//   maintenant, gagne le jackpot XP.") for every single chapter. Kept the real chapterTitle as
//   the headline instead — it already tells you exactly what you're about to study, which a
//   generic line can't — with the real personalised hookLine (dailyHookLine, personality+age
//   aware) as the caption under it, not discarded for generic copy.
// - Card background moved from flat indigo (#5865F2) to the app's own real orange —
//   color-mix(neo-orange 80%, #000), the exact same darken-by-20% already used on .profile-tag
//   elsewhere: white text on raw --neo-orange measures 3.44:1 (a real AA failure at normal size),
//   this same fix clears it to 5.1:1.
// - The floating mascot is back (the reference brought it back too, large, overlapping the top
//   edge) but as the real BraiseMascot component — not a new invented character — so it already
//   carries the account's real rank colour/decoration (the same crown/gem/wing accents Profil
//   and the rank-up celebration use), rather than a flat orange placeholder flame.
export function HeroPiocheCard({
  hookLine,
  bubbleLine,
  subjectName,
  chapterTitle,
  duration,
  cardCount,
  onStart,
}: HeroPiocheCardProps) {
  const handleStart = () => {
    if ('vibrate' in navigator) navigator.vibrate(12);
    onStart();
  };

  return (
    <div className="relative overflow-visible rounded-2xl border-[2.5px] border-black bg-[color-mix(in_srgb,var(--neo-orange)_80%,#000)] p-4 shadow-[3px_3px_0px_0px_#000]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-6 h-24 w-24 rounded-full bg-[#FDC800]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0) 20px)' }}
      />

      <div className="relative flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#151821] px-2.5 py-1 font-display text-[0.68rem] font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#000]">
          <StreakFlameIcon size={12} />
          Pioche du jour
        </span>
        <div className="-mr-1 -mt-3 h-[70px] w-[70px] flex-shrink-0">
          <BraiseMascot size={70} mood="proud" />
        </div>
      </div>

      <div className="relative mt-2 max-w-[82%]">
        <h2 className="truncate font-display text-lg font-black leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          {chapterTitle}
        </h2>
        <p className="mt-0.5 truncate text-xs font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          {hookLine}
        </p>
      </div>
      <span className="sr-only">{bubbleLine}</span>

      <div className="relative mt-2.5 flex flex-wrap items-center gap-1.5">
        {subjectName && (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border-[2.5px] border-black bg-white px-2.5 py-1 text-[0.72rem] font-black text-black shadow-[2px_2px_0px_0px_#000]">
            {subjectName}
          </span>
        )}
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border-[2.5px] border-black bg-white px-2.5 py-1 text-[0.72rem] font-black text-black shadow-[2px_2px_0px_0px_#000]">
          <Clock size={13} className="text-[color-mix(in_srgb,var(--neo-orange)_80%,#000)]" />
          {duration} min
        </span>
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border-[2.5px] border-black bg-white px-2.5 py-1 text-[0.72rem] font-black text-black shadow-[2px_2px_0px_0px_#000]">
          <Layers size={13} className="text-[color-mix(in_srgb,var(--neo-orange)_80%,#000)]" />
          {cardCount} carte{cardCount > 1 ? 's' : ''}
        </span>
      </div>

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
