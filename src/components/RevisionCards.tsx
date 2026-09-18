import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { RichText } from '@/components/RichText';

// The centre of the Réviser screen, in the app's own material: paper cards with the 2.5px
// black border and the hard offset shadow every card on Home and Ton Aura wears, Baloo 2 for
// the words, Plex Mono for the eyebrows, per-subject colour on the stage behind. The one
// thing that makes a neo-brutalist screen feel top-10 rather than dated is the system being
// held without a single exception — so nothing here is soft, blurred, or borderless.

const CARD = 'w-full rounded-2xl border-[2.5px] border-black bg-[var(--paper)] shadow-[6px_6px_0_#000]';

// A real highlighter stroke, not a box: the bottom 45% of the line is painted yellow behind
// the words (a gradient with a hard stop, see .rev-marker), text stays ink, and it flows
// across a line break as one continuous stroke — the way a marker does on paper.
const HIGHLIGHT = 'rev-marker font-black text-black';
const STRONG = 'font-black text-black underline decoration-[3px] underline-offset-[3px] decoration-black';

const SPRING = { type: 'spring', stiffness: 520, damping: 26 } as const;

/** Centred column for the cards (`my-auto`: a card taller than the viewport scrolls from its
 *  top instead of being clipped, which `justify-center` on the parent would do). */
export function CardStack({ children }: { children: ReactNode }) {
  return <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center gap-4">{children}</div>;
}

export function QuestionCard({ question, emoji, color }: { question: string; emoji: string; color: string }) {
  return (
    <motion.div
      className={`${CARD} px-5 py-4 text-left`}
      initial={{ opacity: 0, y: -18, rotate: -1.5, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={SPRING}
    >
      <div className="flex items-center gap-2.5">
        {/* The subject's own icon tile, the same construction as the deck cards on Home. */}
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 border-black text-base shadow-[2px_2px_0_#000]"
          style={{ background: color }}
          aria-hidden="true"
        >
          {emoji}
        </span>
        <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.08em] text-black/70">Braise · à l'instant</span>
      </div>
      <p className="mt-3 font-display text-lg font-bold leading-snug text-black">
        <RichText text={question} markClass={HIGHLIGHT} strongClass={STRONG} />
      </p>
    </motion.div>
  );
}

type Verdict = 'win' | 'miss' | null;

export type ResultProps = {
  verdict: Exclude<Verdict, null>;
  tag: string;
  text: string;
  xp: number;
  /** Current streak after this verdict — shown as a chip in the verdict bar from ×2. */
  combo: number;
  speaking: boolean;
  onListen: () => void;
};

export function AnswerCard({
  typing,
  claim,
  truth,
  wasLie,
  judged,
  verdict,
  prompt,
  tutorial = false,
  result,
}: {
  typing: boolean;
  /** What Braise claims — the true answer or the trap, the student can't tell. */
  claim: string;
  /** The real answer, shown only once judged and only if the claim was a trap. */
  truth: string;
  wasLie: boolean;
  judged: boolean;
  verdict: Verdict;
  /** Braise's dare ("Je dis vrai ou je raconte n'importe quoi ?"), shown as this card's
   *  footer until a verdict lands — the instruction lives with the thing it's about. */
  prompt: string;
  /** First card ever: the footer slot shows the swipe gesture instead of the prompt. */
  tutorial?: boolean;
  /** Once judged: the result strip rendered as this card's footer. */
  result?: ResultProps;
}) {
  // The verdict lands on the card itself: border + shadow take the colour, and a sticker
  // gets slapped on its corner.
  const verdictClass =
    verdict === 'win'
      ? 'border-[var(--mint-text)] shadow-[6px_6px_0_var(--mint-text)]'
      : verdict === 'miss'
        ? 'border-[var(--coral-2)] shadow-[6px_6px_0_var(--coral-2)]'
        : '';

  if (typing) {
    return (
      <motion.div
        className={`${CARD} flex items-center justify-center gap-2 px-6 py-6`}
        aria-hidden="true"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={SPRING}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-3 w-3 rounded-full border-2 border-black bg-black"
            animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${CARD} relative px-5 py-5 text-left transition-[border-color,box-shadow] duration-300 ${verdictClass}`}
      initial={{ opacity: 0, y: -14, scaleY: 0.94 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={SPRING}
      style={{ transformOrigin: 'top center' }}
    >
      {/* Verdict bar: a reserved header slot INSIDE the card — never a sticker over the
          neighbouring card. Chips: the verdict, the XP won, the streak from ×2. */}
      {judged && result && <VerdictBar {...result} />}

      {judged && wasLie ? (
        <>
          {/* The trap, struck through where it stands — small and clamped: it's the thing to
              forget, the truth below is the thing to keep. `bg-transparent` kills the
              browser's default yellow on <mark>. */}
          <p className="line-clamp-2 font-display text-[0.92rem] font-bold leading-snug text-black/45 line-through decoration-[var(--coral-2)] decoration-[2.5px]">
            <RichText text={claim} markClass="bg-transparent font-black" strongClass="font-black" />
          </p>
          {/* …and the truth unfolding right under it. */}
          <motion.div
            className="mt-3 border-t-2 border-dashed border-black/20 pt-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ height: { type: 'spring', stiffness: 320, damping: 30 }, opacity: { duration: 0.3, delay: 0.1 } }}
            style={{ overflow: 'hidden' }}
          >
            <span className="inline-block rounded-md bg-black px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white">
              En vrai
            </span>
            <p className="mt-2 font-display text-xl font-black leading-snug text-black">
              <RichText text={truth} markClass={HIGHLIGHT} strongClass={STRONG} />
            </p>
          </motion.div>
        </>
      ) : (
        <p className="font-display text-xl font-black leading-snug text-black">
          <RichText text={claim} markClass={HIGHLIGHT} strongClass={STRONG} />
        </p>
      )}

      {judged && result ? (
        <ResultStrip {...result} />
      ) : tutorial ? (
        <TutorialHint />
      ) : (
        <p className="mt-4 border-t-2 border-dashed border-black/15 pt-3 font-mono text-[0.68rem] font-bold uppercase tracking-[0.06em] text-black/60">
          {prompt}
        </p>
      )}
    </motion.div>
  );
}

/** First-card gesture hint, in the same footer slot the prompt uses — not a floating band
 *  over the card. The hand sways between the two directions. */
function TutorialHint() {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-black/15 pt-3" aria-hidden="true">
      <span className="rounded-lg border-2 border-black bg-[var(--coral)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_#000]">
        ← Intox
      </span>
      <motion.span
        className="text-2xl leading-none"
        animate={{ x: [-14, 14, -14], rotate: [-8, 8, -8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✋
      </motion.span>
      <span className="rounded-lg border-2 border-black bg-[var(--mint)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-black shadow-[2px_2px_0_#000]">
        Carré →
      </span>
    </div>
  );
}

/** The verdict as a row of chips at the top of the card, in its own slot. Each chip is the
 *  app's sticker (border + hard shadow); they pop in one after the other. */
function VerdictBar({ verdict, tag, xp, combo }: ResultProps) {
  const win = verdict === 'win';
  const chip = 'rounded-lg border-2 border-black px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide shadow-[2px_2px_0_#000]';
  const pop = (delay: number) => ({
    initial: { opacity: 0, scale: 0.5, y: -6 },
    animate: { opacity: 1, scale: [0.5, 1.12, 1], y: 0 },
    transition: { duration: 0.4, delay },
  });
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 border-b-2 border-dashed border-black/15 pb-3" aria-live="polite">
      <motion.span className={`${chip} ${win ? 'bg-[var(--mint)] text-black' : 'bg-[var(--coral-2)] text-white'}`} {...pop(0.08)}>
        {tag}
      </motion.span>
      {xp > 0 && (
        <motion.span className={`${chip} bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black`} {...pop(0.22)}>
          +{xp} XP
        </motion.span>
      )}
      {win && combo >= 2 && (
        <motion.span className={`${chip} ml-auto ${combo >= 3 ? 'bg-[var(--neo-orange)] text-white' : 'bg-white text-black'}`} {...pop(0.34)}>
          🔥 {combo >= 3 ? `En chauffant ×${combo}` : `×${combo}`}
        </motion.span>
      )}
    </div>
  );
}

/** Footer of the answer card once judged: Braise's line, with listen beside it. */
function ResultStrip({ verdict, text, speaking, onListen }: ResultProps) {
  return (
    <motion.div
      className="mt-4 border-t-2 border-dashed border-black/20 pt-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay: 0.12 }}
    >
      <div className="flex items-start gap-3">
        <p className={`flex-1 font-display text-[0.95rem] font-bold leading-snug ${verdict === 'win' ? 'text-black' : 'text-black/80'}`}>
          {text}
        </p>
        {/* Listen sits beside Braise's line, not under it — one less line on a card that is
            already the tallest on the screen when a trap gets corrected. */}
        <button
          type="button"
          onClick={onListen}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={speaking ? 'Lecture en cours' : 'Écouter la bonne réponse'}
          aria-pressed={speaking}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border-2 border-black shadow-[2px_2px_0_#000] transition-transform active:translate-y-[2px] active:shadow-none ${
            speaking ? 'bg-[var(--sun)] text-black' : 'bg-white text-black'
          }`}
        >
          <Volume2 size={17} strokeWidth={2.4} />
        </button>
      </div>
    </motion.div>
  );
}
