import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from "framer-motion";
import { Volume2, Check, RotateCcw } from "lucide-react";
import { RichText } from "@/components/RichText";

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
  "w-full rounded-[28px] border-[2.5px] border-black bg-[var(--rev-paper)] shadow-[6px_6px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.7)]";

// A real highlighter stroke, not a box: the bottom 45% of the line is painted yellow behind
// the words (a gradient with a hard stop, see .rev-marker), text stays ink, and it flows
// across a line break as one continuous fluid block — never chopped word by word.
const HIGHLIGHT = "rev-marker font-black text-black";
const STRONG =
  "font-black text-black underline decoration-[3px] underline-offset-[3px] decoration-black";

const SPRING = { type: "spring", stiffness: 520, damping: 26 } as const;

/** Centred column for the cards (`my-auto`: a card taller than the viewport scrolls from its
 *  top instead of being clipped, which `justify-center` on the parent would do). */
export function CardStack({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-[1] mx-auto my-auto flex w-full max-w-md flex-col items-center gap-4">
      {children}
    </div>
  );
}

export function QuestionCard({
  question,
  emoji,
  color,
  subjectLabel,
  topic,
  alreadyMastered,
  blind = false,
}: {
  question: string;
  emoji: string;
  color: string;
  /** Folded into this card's own header — no separate pill floating above it anymore. */
  subjectLabel: string;
  topic: string;
  /** Whether this exact card already cleared the SM-2 learning phase — shown as a quiet chip so
   *  a card that is already known has a visible reason
   *  instead of just being a smaller number with no explanation the moment it's judged. */
  alreadyMastered?: boolean;
  /** A chapter tried before any lesson: the series says so, once, on its cards. */
  blind?: boolean;
}) {
  return (
    <motion.div
      className={`${CARD} rev-question-card px-5 py-4 text-left`}
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
          {subjectLabel}{" "}
          <span className="text-black/60" aria-hidden="true">
            ·
          </span>{" "}
          {topic}
        </span>
        {(blind || alreadyMastered) && (
          <span className="ml-auto flex flex-shrink-0 flex-col items-end gap-1">
            {blind && (
              <span className="rounded-full border-[1.5px] border-black bg-white px-2 py-0.5 font-mono text-[0.7rem] font-bold uppercase tracking-wide text-black">
                Sans regarder
              </span>
            )}
            {alreadyMastered && !blind && (
              <span className="rounded-full border-[1.5px] border-black/20 bg-black/[0.05] px-2 py-0.5 font-mono text-[0.7rem] font-bold uppercase tracking-wide text-black/70">
                En poche
              </span>
            )}
          </span>
        )}
      </div>
      <p className="mt-3 font-sans text-[1.2rem] font-bold leading-snug text-black">
        <RichText text={question} markClass={HIGHLIGHT} strongClass={STRONG} />
      </p>
    </motion.div>
  );
}

type Verdict = "win" | "miss" | "unsure" | null;

export type ResultProps = {
  verdict: Exclude<Verdict, null>;
  tag: string;
  text: string;
  xp: number;
  /** Why this card paid what it paid ("Retrouvée !", "Revanche !"…), named on the verdict so the
   *  number is never a mystery. Absent on a miss. */
  reason?: string;
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
    verdict === "win"
      ? "border-[var(--mint-text)] shadow-[6px_6px_0_var(--mint-text),inset_0_1.5px_0_rgba(255,255,255,0.7)]"
      : verdict === "miss" || verdict === "unsure"
        ? "border-[var(--coral-2)] shadow-[6px_6px_0_var(--coral-2),inset_0_1.5px_0_rgba(255,255,255,0.7)]"
        : "";

  // Imperative controls, not a declarative `animate` object: the entrance (on mount) and the
  // verdict "punch" (once, exactly when `judged` flips true) are two different events on the
  // same element, and a plain `animate` prop would either replay the punch on every unrelated
  // re-render (speaking toggling, combo changing) or never fire it at all. Hooks run
  // unconditionally, before the `typing` early return, so this stays legal regardless of which
  // branch below actually renders.
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const wasJudged = useRef(judged);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, scaleY: 1, scale: 1, transition: SPRING });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (judged && !wasJudged.current && !reduced) {
      // The verdict lands: a quick physical punch, distinct from the border/shadow colour
      // fade — a win or a miss should feel like something hit the card, not just recoloured it.
      controls.start({
        scale: [1, 0.965, 1.02, 1],
        transition: { duration: 0.34, ease: "easeOut" },
      });
    }
    wasJudged.current = judged;
  }, [judged, controls, reduced]);

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

  // A long real answer (measured: the longest in data.ts, Pythagoras' theorem, overflowed the
  // card's reserved space by 23px on a 375×812 screen with nothing else even competing for
  // room — worse on a shorter phone) stepping down a size class is the single biggest lever on
  // that overflow: this one paragraph was close to a fifth of the card's total height on the
  // measured worst case. 90 characters is roughly "this is running past two short lines."
  const claimIsLong = claim.length > 90;

  return (
    <motion.div
      className={`${judged ? "rev-answer-compact" : CARD} relative ${judged ? "" : "px-5 py-5"} text-left transition-[border-color,box-shadow] duration-300 ${judged ? "" : verdictClass}`}
      initial={{ opacity: 0, y: -14, scaleY: 0.94, scale: 1 }}
      animate={controls}
      style={{ transformOrigin: "top center" }}
    >
      {/* Verdict bar: a reserved header slot INSIDE the card — never a sticker over the
          neighbouring card. Chips: the verdict, the XP won. */}
      {judged && result && <VerdictBar {...result} />}

      {judged ? (
        <div className="rev-answer-body">
          {wasLie && <span className="rev-truth-label">En vrai</span>}
          <p className="font-sans font-bold text-sapie-neo-ink">
            <RichText text={truth} markClass={HIGHLIGHT} strongClass={STRONG} />
          </p>
        </div>
      ) : (
        <p
          className={`font-sans font-bold text-black ${claimIsLong ? "text-[1.1rem] leading-tight" : "text-[1.3rem] leading-snug"}`}
        >
          <RichText text={claim} markClass={HIGHLIGHT} strongClass={STRONG} />
        </p>
      )}

      {/* `wait`: the three footer states are very different heights (a short pill vs. a full
          avatar+text+button row) — letting the entering one lay out while the exiting one is
          still in flow would jump the card's height, and `popLayout` (the usual fix for that)
          needs every child to forward a ref, which plain function components returning a
          motion.div don't do for free. `wait` sidesteps that: the exiting state fully finishes
          before the next one starts, guaranteeing they're never both in flow at once. Every
          other beat in this verdict moment is choreographed (the strike, the truth unfolding,
          the chips popping in) — this swap used to be the one hard cut in the sequence: the
          dare badge just vanished the instant `judged` flipped, because a plain ternary has no
          exit to play. Now all three states get one. */}
      <AnimatePresence mode="wait" initial={false}>
        {judged ? null : tutorial ? (
          <TutorialHint key="tutorial" />
        ) : (
          <DareBadge key="dare" prompt={prompt} color={subjectColor} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** First-card gesture hint, in the same footer slot the prompt uses — not a floating band
 *  over the card. The hand sways between the two directions. */
function TutorialHint() {
  return (
    <motion.div
      className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-black/15 pt-3"
      aria-hidden="true"
      exit={{ opacity: 0, y: -4, transition: { duration: 0.16 } }}
    >
      <span className="rounded-xl border-2 border-black bg-[var(--coral)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_#000]">
        ← Intox
      </span>
      <motion.span
        className="text-2xl leading-none"
        animate={{ x: [-14, 14, -14], rotate: [-8, 8, -8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ✋
      </motion.span>
      <span className="rounded-xl border-2 border-black bg-[var(--mint)] px-2.5 py-1 font-display text-[0.72rem] font-black uppercase tracking-wide text-black shadow-[2px_2px_0_#000]">
        Carré →
      </span>
    </motion.div>
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
      // `items-start`, not `items-center`: the longer prompt variants wrap to two lines at
      // narrow widths, and a centred emoji floats disconnected in the gap between both lines
      // once that happens. Top-aligned reads correctly whether it wraps or not — on a single
      // line it sits exactly where centring would have put it anyway.
      className="mt-5 inline-flex items-start gap-2 rounded-xl border-[2.5px] border-black px-3 py-2 shadow-[3px_3px_0_#000,inset_0_1px_0_rgba(255,255,255,0.5)]"
      style={{ background: color }}
      initial={{ opacity: 0, scale: 0.6, y: -6 }}
      animate={{ opacity: 1, scale: [0.6, 1.12, 1], y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -4, transition: { duration: 0.16 } }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <span aria-hidden="true" className="mt-0.5 text-base leading-none">
        👀
      </span>
      <p className="font-display text-[0.84rem] font-bold leading-snug text-black">{prompt}</p>
    </motion.div>
  );
}

/** Verdict and reward remain separate from Braise's personal reaction. */
function VerdictBar({ verdict, xp, reason, speaking, onListen }: ResultProps) {
  const reduced = useReducedMotion();
  const win = verdict === "win";
  const unsure = verdict === "unsure";
  return (
    <div
      className={`rev-result-heading ${win ? "is-win" : unsure ? "is-unsure" : "is-miss"}`}
      role="status"
    >
      <div className="rev-result-status">
        <motion.span
          className="rev-result-symbol"
          aria-hidden="true"
          initial={reduced ? false : { scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          {win ? <Check size={19} strokeWidth={3} /> : <RotateCcw size={18} strokeWidth={2.6} />}
        </motion.span>
        <span>{win ? "Bien vu !" : unsure ? "Pas grave" : "À retenir"}</span>
      </div>
      <div className="rev-result-tools">
        {xp > 0 && (
          <span className="rev-result-xp">
            +{xp} XP{reason ? ` · ${reason}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={onListen}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={speaking ? "Lecture en cours" : "Écouter la bonne réponse"}
          title="Écouter la bonne réponse"
          aria-pressed={speaking}
          className="rev-feedback-listen"
        >
          <Volume2 size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
