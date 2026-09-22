import { X, ChevronRight } from 'lucide-react';

interface MissedCardsBannerProps {
  /** Real count of FLASHCARDS whose last review was judged wrong (cardReviews[id].lastConfidence
   *  === 'not-sure' — the same value RevisionsView's swipe-judge writes on an incorrect verdict).
   *  Never fabricated, never shown at all when 0 — see the conditional render at the call site. */
  count: number;
  onOpen: () => void;
  /** Dismisses the banner for the current count — it stays gone even after a reload (the call
   *  site persists this), but comes back the moment a NEW card gets missed and the real count
   *  climbs past what was dismissed. Never a permanent "never show again": that would hide a
   *  real, still-true fact about cards you haven't fixed. */
  onDismiss: () => void;
}

// "INTOX" — the same word the judge mechanic itself already trades in (accepting/rejecting a
// statement as true or false); a card you got wrong is one you fell for, not just "an error".
// Red, not amber/orange like the rest of Accueil's cards: this is the one card on the page
// whose whole job is to flag something that went wrong, so it earns the one non-brand colour.
//
// Two sibling buttons, not a button nested inside a button (invalid HTML, and the two actions
// are genuinely different: dismiss vs. open) — the X has its own real dismiss action now
// instead of being decorative chrome inside the "open" button's hit area.
export function MissedCardsBanner({ count, onOpen, onDismiss }: MissedCardsBannerProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border-[2.5px] border-black bg-red-600 p-4 shadow-[3px_3px_0px_0px_#000]">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Ignorer Mes INTOX"
        className="flex-shrink-0 rounded-full p-1 transition-transform active:scale-90"
      >
        <X size={22} strokeWidth={3} className="text-white" />
      </button>
      <button type="button" onClick={onOpen} className="flex flex-1 items-center justify-between gap-2 text-left">
        <div>
          <b className="block font-display text-lg font-black leading-tight text-white">Mes INTOX</b>
          <span className="text-sm font-bold text-white">
            {count} carte{count > 1 ? 's' : ''} ratée{count > 1 ? 's' : ''} à rattraper
          </span>
        </div>
        <ChevronRight size={22} className="flex-shrink-0 text-white" />
      </button>
    </div>
  );
}
