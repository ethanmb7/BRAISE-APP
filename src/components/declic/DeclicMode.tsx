import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { sfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { recordDeclicMemory, type DeclicScript } from "@/lib/declic";
import { DeclicTimeline } from "@/components/declic/DeclicTimeline";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
// A little bouncier than SPRING and paired with a bigger exit throw — cards should feel like
// they're being popped in and tossed away, not just cross-fading.
const CARD_SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;
// How long the "Braise réfléchit…" beat holds before a choice's reaction appears — long enough
// to read as a real pause, short enough to never feel like waiting on the app.
const THINK_MS = 550;

type Mood = "happy" | "eager" | "hesitant" | "cool" | "proud";

// "Le Déclic" — BRAISE's learning loop (PRODUCT_VISION.md, section 4): situation → choix →
// réaction → déclic. A notion is a chain of small cards — never more than one tap or one short
// sentence between beats — instead of a page of course text with a quiz bolted on at the end.
// Own visual identity on purpose: a violet stage instead of Réviser's swipe cards or the old
// slide deck, so a Déclic moment is never mistaken for a drill.
export function DeclicMode({
  script,
  soundOn,
  onComplete,
}: {
  script: DeclicScript;
  soundOn: boolean;
  onComplete: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [reformulation, setReformulation] = useState("");

  const card = script.cards[index];

  // Physical, not just a fade: a card pops in with a little overshoot and gets tossed up and
  // away on the way out, rather than cross-fading into the next one.
  const cardMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 26, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -38, rotate: -2, scale: 0.95 },
        transition: CARD_SPRING,
      };

  const advance = () => {
    sfx.tap(soundOn);
    setPickedId(null);
    setIndex((i) => i + 1);
  };

  const pick = (optionId: string, correct: boolean | undefined) => {
    if (pickedId) return;
    sfx[correct ? "correct" : "wrong"](soundOn);
    setPickedId(optionId);
    // The tile itself colours in immediately (that's the tap's own feedback) — only Braise's
    // reply waits a beat, like an actual reply would.
    if (reducedMotion) return;
    setThinking(true);
    setTimeout(() => setThinking(false), THINK_MS);
  };

  const submitReformulation = () => {
    if (!reformulation.trim()) return;
    sfx.tap(soundOn);
    recordDeclicMemory(script.chapterId, { reformulation: reformulation.trim(), at: Date.now() });
    setIndex((i) => i + 1);
  };

  return (
    <div className="declic-stage">
      {card.kind !== "declic" && card.kind !== "fiche" && (
        <div
          className="declic-progress"
          role="progressbar"
          aria-label="Progression de la notion"
          aria-valuemin={1}
          aria-valuemax={script.cards.length}
          aria-valuenow={index + 1}
        >
          {script.cards.map((c, i) => (
            <span key={i} className={i <= index ? "is-lit" : ""}>
              <StreakFlameIcon size={14} />
            </span>
          ))}
        </div>
      )}
      <AnimatePresence mode="wait">
        {card.kind === "situation" && (
          <motion.div key={index} className="declic-step" {...cardMotion}>
            <DeclicAsk mood="happy">{card.text}</DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "choice" && (
          <motion.div key={index} className="declic-step" {...cardMotion}>
            <DeclicAsk
              mood={
                !pickedId
                  ? "eager"
                  : card.options.find((o) => o.id === pickedId)?.correct
                    ? "proud"
                    : "hesitant"
              }
              bump={
                !pickedId
                  ? undefined
                  : card.options.find((o) => o.id === pickedId)?.correct
                    ? "correct"
                    : "wrong"
              }
            >
              {card.prompt}
            </DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <div className="declic-choices">
              {card.options.map((o) => (
                <DeclicTile
                  key={o.id}
                  label={o.label}
                  state={
                    !pickedId
                      ? "idle"
                      : o.id === pickedId
                        ? o.correct
                          ? "correct"
                          : "wrong"
                        : "idle"
                  }
                  onClick={() => pick(o.id, o.correct)}
                  disabled={!!pickedId}
                />
              ))}
            </div>
            {pickedId && (
              <>
                {thinking ? (
                  <p className="declic-bubble declic-bubble--reaction" aria-live="polite">
                    <span className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="declic-bubble declic-bubble--reaction">
                      {card.options.find((o) => o.id === pickedId)?.reaction}
                    </p>
                    <button type="button" className="declic-cta" onClick={advance}>
                      Suite <ArrowRight size={18} />
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {card.kind === "reveal" && (
          <motion.div key={index} className="declic-step" {...cardMotion}>
            <span className="declic-reveal-kicker">{card.kicker}</span>
            <DeclicAsk mood="proud">{card.text}</DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "reformulation" && (
          <motion.div key={index} className="declic-step" {...cardMotion}>
            <DeclicAsk mood="eager">{card.prompt}</DeclicAsk>
            <textarea
              className="declic-textarea"
              value={reformulation}
              onChange={(e) => setReformulation(e.target.value)}
              placeholder="Avec tes mots…"
              rows={3}
              autoFocus
            />
            <button
              type="button"
              className="declic-cta"
              onClick={submitReformulation}
              disabled={!reformulation.trim()}
            >
              Valider <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "declic" && (
          <motion.div
            key={index}
            className="declic-moment"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING}
            onAnimationComplete={() => {
              sfx.complete(soundOn);
              if (!reducedMotion) fireConfetti();
            }}
          >
            <motion.div
              className="declic-moment-flame"
              animate={reducedMotion ? {} : { rotate: [-4, 4, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <BraiseMascot size={104} mood="proud" />
            </motion.div>
            <span className="declic-moment-kicker">🔥 déclic</span>
            <p className="declic-moment-line">{card.line}</p>
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "fiche" && (
          <motion.div key={index} className="declic-fiche" {...cardMotion}>
            <span className="declic-fiche-kicker">🔥 ce que ton prof attend de toi</span>
            <h2 className="declic-fiche-title">{card.title}</h2>
            <div className="declic-fiche-section is-retenir">
              <span className="declic-fiche-label">À retenir</span>
              <p className="declic-fiche-text">{card.retenir}</p>
            </div>
            {card.piege && (
              <div className="declic-fiche-section is-piege">
                <span className="declic-fiche-label">Piège</span>
                <p className="declic-fiche-text">{card.piege}</p>
              </div>
            )}
            <button
              type="button"
              className="declic-cta"
              onClick={() => {
                sfx.tap(soundOn);
                onComplete();
              }}
            >
              Terminer <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeclicAsk({
  mood,
  bump,
  children,
}: {
  mood: Mood;
  /** A one-shot physical reaction — a headshake on a miss, a little nod on a hit — played once
   *  when this prop first appears (see the `key`: it forces a fresh mount, which is what makes
   *  an `initial` → `animate` transition actually run instead of snapping straight to rest). */
  bump?: "correct" | "wrong";
  children: ReactNode;
}) {
  return (
    <div className="declic-ask">
      {bump ? (
        <motion.div
          key={bump}
          initial={{ rotate: 0, y: 0 }}
          animate={bump === "wrong" ? { rotate: [0, -10, 9, -6, 4, 0] } : { y: [0, -10, 0] }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <BraiseMascot size={64} mood={mood} />
        </motion.div>
      ) : (
        <BraiseMascot size={64} mood={mood} />
      )}
      <h2 className="declic-bubble">{children}</h2>
    </div>
  );
}

function DeclicTile({
  label,
  state,
  onClick,
  disabled,
}: {
  label: string;
  state: "idle" | "correct" | "wrong";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      className={`declic-tile is-${state}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { x: 2, y: 2 } : undefined}
    >
      {label}
    </motion.button>
  );
}
