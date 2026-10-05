import type { ReactNode } from "react";

// The app's own tactile button (see HeaderHUD's BeveledButton and Home's "Je pioche !"):
// a darker base underneath, a face with the 2.5px border and hard shadow that presses down
// 3px onto it. `round` makes the joker's circle; `compact` is the lighter post-verdict pill.
export function BevelButton({
  children,
  onClick,
  label,
  base,
  face,
  badge,
  badgeTone = "hot",
  round = false,
  compact = false,
  pressed,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  base: string;
  face: string;
  badge?: string;
  badgeTone?: "hot" | "muted";
  round?: boolean;
  compact?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  const radius = round ? "rounded-full" : "rounded-[22px]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`group relative block min-w-0 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 translate-y-[4px] ${radius} border-[2.5px] border-black ${base}`}
      />
      <span
        // Mouse-only lift (the `[@media(hover:hover)]` guard is what keeps this from sticking
        // after a tap on touch devices, where Tailwind's plain `hover:` would otherwise latch
        // on until the next unrelated tap) — this is also a web app, reached from a laptop via
        // the keyboard shortcuts, and until now nothing told a mouse it was over a button
        // before the click landed. Rises toward the cursor, the mirror of the press-down.
        className={`relative flex h-[58px] items-center justify-center gap-2 ${radius} border-[2.5px] border-black px-3 font-display font-black uppercase tracking-wide shadow-[4px_4px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.5)] transition-transform duration-100 [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:shadow-[5px_5px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.5)] group-active:translate-y-[4px] group-active:scale-[0.97] group-active:shadow-none ${
          compact ? "text-[0.82rem] normal-case tracking-normal" : "text-[1.02rem]"
        } ${face}`}
      >
        {children}
      </span>
      {badge && (
        <span
          aria-hidden="true"
          className={`absolute -top-2.5 right-2 rounded-md border-2 border-black px-1.5 py-0.5 font-display text-[0.62rem] font-black shadow-[2px_2px_0_#000] ${
            badgeTone === "hot" ? "bg-[var(--sun)] text-black" : "bg-white text-black/60"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
