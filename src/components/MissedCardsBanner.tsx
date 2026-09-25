import { X, ShieldCheck } from "lucide-react";

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

// These are not "failures" to be paid back. The same real `not-sure` cards are now framed as
// notions that can be secured calmly, so the optional review path remains supportive rather
// than competing with, or emotionally punishing, the daily mission.
export function MissedCardsBanner({ count, onOpen, onDismiss }: MissedCardsBannerProps) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black bg-black"
      />
      <div className="relative flex w-full items-center gap-3 rounded-2xl border-[2.5px] border-black bg-[#FFE08A] p-4 shadow-[3px_3px_0px_0px_#000] transition-transform duration-100 active:translate-y-[3px] active:shadow-none">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Masquer les notions à sécuriser"
          className="flex-shrink-0 rounded-full p-1 transition-transform active:scale-90"
        >
          <X size={22} strokeWidth={3} className="text-[#151821]" />
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={22} strokeWidth={2.5} className="flex-shrink-0 text-[#151821]" />
            <span>
              <b className="block font-display text-lg font-black leading-tight text-[#151821]">
                À sécuriser
              </b>
              <span className="text-sm font-bold text-[#151821]/75">
                Revoir {count} notion{count > 1 ? "s" : ""}, sans pression.
              </span>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
