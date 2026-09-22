import { X, ChevronRight } from 'lucide-react';

interface MissedCardsBannerProps {
  /** Real count of FLASHCARDS whose last review was judged wrong (cardReviews[id].lastConfidence
   *  === 'not-sure' — the same value RevisionsView's swipe-judge writes on an incorrect verdict).
   *  Never fabricated, never shown at all when 0 — see the conditional render at the call site. */
  count: number;
  onOpen: () => void;
}

// "INTOX" — the same word the judge mechanic itself already trades in (accepting/rejecting a
// statement as true or false); a card you got wrong is one you fell for, not just "an error".
// Red, not amber/orange like the rest of Accueil's cards: this is the one card on the page
// whose whole job is to flag something that went wrong, so it earns the one non-brand colour.
export function MissedCardsBanner({ count, onOpen }: MissedCardsBannerProps) {
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center justify-between rounded-2xl border-[2.5px] border-black bg-red-600 p-4 text-left shadow-[3px_3px_0px_0px_#000] transition-transform active:translate-y-[2px] active:shadow-none"
    >
      <div className="flex items-center gap-3">
        <X size={22} strokeWidth={3} className="flex-shrink-0 text-white" />
        <div>
          <b className="block font-display text-lg font-black leading-tight text-white">Mes INTOX</b>
          <span className="text-sm font-bold text-white">
            {count} carte{count > 1 ? 's' : ''} ratée{count > 1 ? 's' : ''} à rattraper
          </span>
        </div>
      </div>
      <ChevronRight size={22} className="flex-shrink-0 text-white" />
    </button>
  );
}
