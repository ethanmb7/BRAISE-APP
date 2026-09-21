import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { RichText } from '@/components/RichText';
import { BraiseMascot } from '@/components/BraiseMascot';

// The centre of the Réviser screen: "Tactile 3D" neo-brutalism — opaque paper cards, generous
// rounding, a hard extruded shadow (the same construction as every button in the app) — with
// the glass treatment reserved for the screen's chrome (header pills, tab dock) so a formula
// or a fine print never has to fight a blurred surface for contrast. Baloo 2 stays the voice
// (buttons, badges, Braise's own lines, the amorce sticker); IBM Plex Sans carries the actual
// content — the question, the claim, the truth — because that's the text a science or maths
// card lives or dies on for legibility.

// --rev-paper, not --paper: this screen's own atmosphere is the per-subject colour behind the
// cards, decoupled from the app's light/dark toggle (see index.css) — --paper repoints to a
// near-black navy under .dark, which would leave this card's hardcoded-black text sitting on a
// near-black card.
const CARD =
  'w-full rounded-[28px] border-[2.5px] border-black bg-[var(--rev-paper)] shadow-[6px_6px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.7)]';

// A real highlighter stroke, not a box: the bottom 45% of the line is painted yellow behind
// the words (a gradient with a hard stop, see .rev-marker), text stays ink, and it flows
// across a line break as one continuous fluid block — never chopped word by word.
const HIGHLIGHT = 'rev-marker font-black text-black';
const STRONG = 'font-black text-black underline decoration-[3px] underline-offset-[3px] decoration-black';

const SPRING = { type: 'spring', stiffness: 520, damping: 26 } as const;

/** Centred column for the cards (`my-auto`: a card taller than the viewport scrolls from its
 *  top instead of being clipped, which `justify-center` on the parent would do). */
export function CardStack({ children }: { children: ReactNode }) {
  return <div className="relative z-[1] mx-auto my-auto flex w-full max-w-md flex-col items-center gap-4">{children}</div>;
}

export function QuestionCard({
  question,
  emoji,
  color,
  subjectLabel,
  topic,
}: {
  question: string;
  emoji: string;
  color: string;
  /** Folded into this card's own header — no separate pill floating above it anymore. */
  subjectLabel: string;
  topic: string;
}) {
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
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black text-base shadow-[2px_2px_0_#000,inset_0_1px_0_rgba(255,255,255,0.5)]"
          style={{ background: color }}
          aria-hidden="true"
        >
          {emoji}
        </span>
        <span className="font-display text-[0.92rem] font-extrabold leading-tight text-black">
          {subjectLabel} <span className="text-black/40">·</span> {topic}
        </span>
      </div>
      <p className="mt-3 font-sans text-[1.2rem] font-bold leading-snug text-black">
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
  subjectColor,
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
  /** Braise's dare — "am I bluffing or not?" — shown as this card's footer until a verdict
   *  lands. This is a bluff-calling game, not a quiz: the prompt is Braise daring the player to
   *  catch him out, not a neutral instruction, so it gets the same treatment as every other
   *  badge in the game (subject colour, border, hard shadow) rather than reading as a caption. */
  prompt: string;
  /** Same colour as this card's own subject tile, so the dare badge reads as part of the same
   *  object instead of a disconnected grey caption. */
  subjectColor: string;
  /** First card ever: the footer slot shows the swipe gesture instead of the prompt. */
  tutorial?: boolean;
  /** Once judged: the result strip rendered as this card's footer. */
  result?: ResultProps;
}) {
  // The verdict lands on the card itself: border + shadow take the colour.
  const verdictClass =
    verdict === 'win'
      ? 'border-[var(--mint-text)] shadow-[6px_6px_0_var(--mint-text),inset_0_1.5px_0_rgba(255,255,255,0.7)]'
      : verdict === 'miss'
        ? 'border-[var(--coral-2)] shadow-[6px_6px_0_var(--coral-2),inset_0_1.5px_0_rgba(255,255,255,0.7)]'
        : '';

  // Imperative controls, not a declarative `animate` object: the entrance (on mount) and the
  // verdict "punch" (once, exactly when `judged` flips true) are two different events on the
  // same element, and a plain `animate` prop would either replay the punch on every unrelated
  // re-render (speaking toggling, combo changing) or never fire it at all. Hooks run
  // unconditionally, before the `typing` early return, so this stays legal regardless of which
  // branch below actually renders.
  const controls = useAnimationControls();
  const wasJudged = useRef(judged);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, scaleY: 1, scale: 1, transition: SPRING });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (judged && !wasJudged.current) {
      // The verdict lands: a quick physical punch, distinct from the border/shadow colour
      // fade — a win or a miss should feel like something hit the card, not just recoloured it.
      controls.start({ scale: [1, 0.965, 1.02, 1], transition: { duration: 0.34, ease: 'easeOut' } });
    }
    wasJudged.current = judged;
  }, [judged, controls]);

  if (typing) {
    // A compact chat bubble, not a full-width card standing in for one — this used to be the
    // exact size and shape of the answer card it precedes, which read as an oversized empty
    // box for three dots. `self-start` + content-width (no `w-full`) is what makes it a real
    // "typing…" indicator, the iMessage/WhatsApp convention: small, to the left, gone in
    // 450ms, not a placeholder pretending to be the eventual message.
    return (
      <motion.div
        className="flex items-center gap-1.5 self-start rounded-full border-[2.5px] border-black bg-[var(--rev-paper)] px-4 py-3 shadow-[3px_3px_0_#000,inset_0_1px_0_rgba(255,255,255,0.7)]"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={SPRING}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-black"
            animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${CARD} relative px-5 py-5 text-left transition-[border-color,box-shadow] duration-300 ${verdictClass}`}
      initial={{ opacity: 0, y: -14, scaleY: 0.94, scale: 1 }}
      animate={controls}
      style={{ transformOrigin: 'top center' }}
    >
      {/* Verdict bar: a reserved header slot INSIDE the card — never a sticker over the
          neighbouring card. Chips: the verdict, the XP won, the streak from ×2. */}
      {judged && result && <VerdictBar {...result} />}

      {judged && wasLie ? (
        <>
          {/* The trap, crossed out elegantly — a single stroke drawing itself left to right
              (not a static text-decoration snapping on), then the truth unfolds right under
              it once the strike lands. Single line + truncate: the trap is the thing to
              forget, it doesn't need room to wrap. A hair of rotation, tapered ends (mask) and
              a tiny overshoot in the easing keep it reading as a felt-tip stroke rather than a
              ruler-drawn vector line — the same "hand-made" imperfection as the tilted cards. */}
          <div className="relative inline-block max-w-full">
            <p className="truncate font-sans text-[0.98rem] font-semibold text-black/40">
              <RichText text={claim} markClass="bg-transparent font-semibold" strongClass="font-semibold" />
            </p>
            <motion.span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[3px] w-full bg-[var(--coral-2)]"
              style={{
                originX: 0,
                rotate: -1.2,
                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.16, ease: [0.34, 1.35, 0.64, 1] }}
            />
          </div>
          {/* …and the truth unfolding right under it, timed to start once the strike lands. */}
          <motion.div
            className="mt-3 border-t-2 border-dashed border-black/20 pt-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ height: { type: 'spring', stiffness: 320, damping: 30, delay: 0.36 }, opacity: { duration: 0.3, delay: 0.42 } }}
            style={{ overflow: 'hidden' }}
          >
            <span className="inline-block rounded-md bg-black px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white">
              En vrai
            </span>
            <p className="mt-2 font-sans text-[1.3rem] font-bold leading-snug text-black">
              <RichText text={truth} markClass={HIGHLIGHT} strongClass={STRONG} />
            </p>
          </motion.div>
        </>
      ) : (
        <p className="font-sans text-[1.3rem] font-bold leading-snug text-black">
          <RichText text={claim} markClass={HIGHLIGHT} strongClass={STRONG} />
        </p>
      )}

      {judged && result ? (
        <ResultStrip {...result} />
      ) : tutorial ? (
        <TutorialHint />
      ) : (
        <DareBadge prompt={prompt} color={subjectColor} />
      )}
    </motion.div>
  );
}

/** First-card gesture hint, in the same footer slot the prompt uses — not a floating band
 *  over the card. The hand sways between the two directions. */
function TutorialHint() {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-black/15 pt-3" aria-hidden="true">
      <span className="rounded-xl border-2 border-black bg-[var(--coral)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_#000]">
        ← Intox
      </span>
      <motion.span
        className="text-2xl leading-none"
        animate={{ x: [-14, 14, -14], rotate: [-8, 8, -8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✋
      </motion.span>
      <span className="rounded-xl border-2 border-black bg-[var(--mint)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-black shadow-[2px_2px_0_#000]">
        Carré →
      </span>
    </div>
  );
}

/** Braise's dare, as a real badge — this is a bluff-calling game (Intox ou Carré), not a
 *  quiz, so the prompt is a taunt from the character, not a neutral instruction, and gets the
 *  same construction every other badge in the game gets: a colour, a border, a hard shadow,
 *  a spring pop on arrival. The subject's own colour (the same one on this card's icon tile)
 *  ties it back to the card as one object instead of a disconnected grey caption — black text
 *  throughout (every subject colour here is ≥4.5:1 against black, checked against the palette
 *  in data.ts; several fail white). 👀 leads instead of a generic "challenge" glyph (⚡/🎯):
 *  the game is "is he lying", not "beat the clock" — the icon should read as suspicion, not
 *  generic game energy, and it has to say that on both the chill and savage voice. */
function DareBadge({ prompt, color }: { prompt: string; color: string }) {
  return (
    <motion.div
      className="mt-5 inline-flex items-center gap-2 rounded-xl border-[2.5px] border-black px-3 py-2 shadow-[3px_3px_0_#000,inset_0_1px_0_rgba(255,255,255,0.5)]"
      style={{ background: color }}
      initial={{ opacity: 0, scale: 0.6, y: -6 }}
      animate={{ opacity: 1, scale: [0.6, 1.12, 1], y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <span aria-hidden="true" className="text-base leading-none">
        👀
      </span>
      <p className="font-display text-[0.86rem] font-bold leading-snug text-black">{prompt}</p>
    </motion.div>
  );
}

/** The verdict as a row of chips at the top of the card, in its own slot. Each chip is the
 *  app's sticker (border + hard shadow + a glossy inner edge); they pop in one after another
 *  with spring overshoot, like a real reward landing rather than a UI element fading in. */
function VerdictBar({ verdict, tag, xp, combo }: ResultProps) {
  const win = verdict === 'win';
  const chip =
    'rounded-xl border-2 border-black px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide shadow-[2px_2px_0_#000,inset_0_1px_0_rgba(255,255,255,0.55)]';
  const pop = (delay: number) => ({
    initial: { opacity: 0, scale: 0.5, y: -6 },
    animate: { opacity: 1, scale: [0.5, 1.15, 1], y: 0 },
    transition: { duration: 0.4, delay },
  });
  return (
    // Two deliberate rows, not one row that overflows into a second — `ml-auto` inside a
    // `flex-wrap` row used to push the streak chip onto its own line ONLY at narrow widths,
    // landing it stranded at the far right with a big gap to its left, never centred or
    // designed for. Giving it its own row unconditionally (whenever it's shown) makes that the
    // one and only layout, at every width, instead of an accident of how much the first row
    // happened to fit.
    <div className="mb-3 border-b-2 border-dashed border-black/15 pb-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <motion.span className={`${chip} ${win ? 'bg-[var(--mint)] text-black' : 'bg-[var(--coral-2)] text-white'}`} {...pop(0.08)}>
          {tag}
        </motion.span>
        {xp > 0 && <XpChip xp={xp} chip={chip} />}
      </div>
      {win && combo >= 2 && (
        <div className="mt-2 flex justify-end">
          <motion.span className={`${chip} ${combo >= 3 ? 'bg-[var(--neo-orange)] text-white' : 'bg-white text-black'}`} {...pop(0.34)}>
            🔥 {combo >= 3 ? `En chauffant ×${combo}` : `×${combo}`}
          </motion.span>
        </div>
      )}
    </div>
  );
}

/** The XP chip as an actual token, not a label: pops in with spring overshoot, then a diagonal
 *  shine sweeps across it once — the same beat a coin or a loot drop gets in the games this
 *  screen is competing with for a teenager's attention. */
function XpChip({ xp, chip }: { xp: number; chip: string }) {
  return (
    <motion.span
      className={`${chip} relative overflow-hidden bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black`}
      initial={{ opacity: 0, scale: 0.5, y: -6 }}
      animate={{ opacity: 1, scale: [0.5, 1.15, 1], y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
    >
      +{xp} XP
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        initial={{ x: '-40%' }}
        animate={{ x: '280%' }}
        transition={{ duration: 0.65, delay: 0.55, ease: 'easeOut' }}
      />
    </motion.span>
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
        {/* This is Braise's own line — chat-message construction (avatar beside text), reusing
            space this footer already reserves rather than adding a new one: this is the only
            place all session Braise actually shows a face reacting to the verdict, instead of
            colour and text carrying the whole feeling alone. */}
        <BraiseMascot size={30} mood={verdict === 'win' ? 'happy' : 'hesitant'} className="flex-shrink-0" />
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
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0_#000] transition-transform active:translate-y-[2px] active:shadow-none ${
            speaking ? 'bg-[var(--sun)] text-black' : 'bg-white text-black'
          }`}
        >
          <Volume2 size={17} strokeWidth={2.4} />
        </button>
      </div>
    </motion.div>
  );
}
