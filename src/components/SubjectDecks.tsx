import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { SubjectIcon } from './SubjectIcon';

export interface SubjectDeckItem {
  id: string;
  name: string;
  color: string;
  pct: number;
  /** Position (1-indexed) of the subject's current chapter in its own sequence — "Niv. 3" reads
   *  as "3rd chapter in", not a fabricated stat: no separate per-subject level field exists. */
  level: number;
  /** The current chapter's own title (leading article stripped for brevity) — real data, one
   *  short segment. Never truncated with an ellipsis: it wraps instead if it doesn't fit. */
  chapterLabel: string;
}

interface SubjectDecksProps {
  items: SubjectDeckItem[];
  onSelect: (id: string) => void;
}

// Full-saturation card face (not a pastel tint) to match the HUD's own vividness. Title and
// chapter label use pure #000, not text-slate-900 or --neo-ink — both measured a hair too light
// and drop francais/anglais below 4.5:1 AA on their own saturated backgrounds; #000 clears every
// subject at >=4.7:1. Same bevel base/face press mechanic as HeaderHUD, but the face's own press
// is a real spring now (was a flat `transition-transform` CSS press) — this is the single most
// frequent tap in the whole app (choosing a subject, every session) and it was the one surface
// with zero physical weight next to Réviser's spring-driven cards and the Pioche du jour's chest.
// Sound+haptic were already real here (goToChapter → sfx.tap, which fires haptic(8) unconditionally
// even with sound off) — only the press *feel* itself was missing, not the feedback loop. The
// bottom row is normal flow, never absolutely positioned, so nothing can ever overlap.
export function SubjectDecks({ items, onSelect }: SubjectDecksProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <button key={item.id} onClick={() => onSelect(item.id)} className="group relative block h-full text-left">
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black"
            style={{ background: `color-mix(in srgb, ${item.color} 70%, #000)` }}
          />
          <motion.span
            className="relative flex h-full flex-col gap-2.5 rounded-2xl border-[2.5px] border-black p-4 shadow-[3px_3px_0px_0px_#000] group-active:shadow-none"
            style={{ background: item.color }}
            whileTap={{ y: 3, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
                <SubjectIcon subjectId={item.id} color={item.color} size={22} />
              </span>
              <span className="rounded-lg border border-black bg-amber-300 px-2 py-0.5 text-xs font-black text-black shadow-[1px_1px_0px_0px_#000]">
                Niv. {item.level}
              </span>
            </div>

            <div>
              <b className="block font-display text-lg font-black leading-tight text-black">{item.name}</b>
              <span className="block text-xs font-bold leading-snug text-black">{item.chapterLabel}</span>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Fill is solid black, not `item.color` — a fill matching the card's own face
                    colour made the "done" portion camouflage into the card, so only the dark
                    unfilled track ever read as a distinct shape (the bar looked backwards at a
                    glance). Black was picked over white: it's the same black already verified
                    at >=4.7:1 against every one of the 6 subject hues (see the card-text contrast
                    check above), where a white fill would drop to ~2.15:1 on the lightest ones
                    (histoire-géo's amber) — under the 3:1 floor for a non-text UI element. */}
                <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-black bg-white/40">
                  <div className="h-full rounded-full bg-black" style={{ width: `${item.pct}%` }} />
                </div>
                {/* Labelled explicitly: this is chapters finished, not the per-chapter mastery
                    score that drives the sort order — the two numbers mean different things and
                    a bare "%" didn't say which one this was. */}
                <span className="whitespace-nowrap font-display text-xs font-black text-black">{item.pct}% fait</span>
              </div>

              <div className="flex justify-end">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] transition-transform duration-100 group-active:translate-y-[2px] group-active:shadow-none"
                >
                  <Play size={16} className="translate-x-[1px] fill-black text-black" />
                </span>
              </div>
            </div>
          </motion.span>
        </button>
      ))}
    </div>
  );
}
