import { X, ChevronRight, ShieldCheck } from "lucide-react";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";

/** The one place Aujourd'hui says that notions are waiting for a refresh, and the way to Réviser. Its
 *  number is the sum of the pastilles on the worlds under it, so the page never gives two. It is an
 *  invitation, not an alarm: it can be hidden, and it comes back only when more are waiting than when it
 *  was hidden (the call site keeps that count). */
export function DueCard({
  count,
  onOpen,
  onDismiss,
}: {
  count: number;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTone();
  return (
    <section
      aria-label="À rallumer"
      className="flex w-full items-center gap-1 rounded-2xl border-[2.5px] border-black bg-[#FFE08A] py-1.5 pl-4 pr-1 shadow-[3px_3px_0px_0px_#000]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-11 flex-1 items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2.5">
          <ShieldCheck size={22} strokeWidth={2.5} className="flex-shrink-0 text-[#151821]" />
          <span>
            <b className="block font-display text-lg font-black leading-tight text-[#151821]">
              {t(COPY.home.dueTitle)}
            </b>
            <span className="text-sm font-bold text-[#151821]/75">
              {t(COPY.home.dueSub(count))}
            </span>
          </span>
        </span>
        <ChevronRight size={22} className="flex-shrink-0 text-[#151821]" />
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Masquer ce qui est à rallumer"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      >
        <X size={20} strokeWidth={3} className="text-[#151821]" />
      </button>
    </section>
  );
}
