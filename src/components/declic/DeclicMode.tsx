import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { sfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { recordDeclicMemory, type DeclicScript } from "@/lib/declic";
import { DeclicTimeline } from "@/components/declic/DeclicTimeline";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

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
  const [reformulation, setReformulation] = useState("");

  const card = script.cards[index];

  const advance = () => {
    sfx.tap(soundOn);
    setPickedId(null);
    setIndex((i) => i + 1);
  };

  const pick = (optionId: string, correct: boolean | undefined) => {
    if (pickedId) return;
    sfx[correct ? "correct" : "wrong"](soundOn);
    setPickedId(optionId);
  };

  const submitReformulation = () => {
    if (!reformulation.trim()) return;
    sfx.tap(soundOn);
    recordDeclicMemory(script.chapterId, { reformulation: reformulation.trim(), at: Date.now() });
    setIndex((i) => i + 1);
  };

  return (
    <div className="declic-stage">
      <AnimatePresence mode="wait">
        {card.kind === "situation" && (
          <motion.div
            key={index}
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="happy">{card.text}</DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "choice" && (
          <motion.div
            key={index}
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="eager">{card.prompt}</DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            {!pickedId ? (
              <div className="declic-choices">
                {card.options.map((o) => (
                  <DeclicTile
                    key={o.id}
                    label={o.label}
                    state="idle"
                    onClick={() => pick(o.id, o.correct)}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="declic-choices">
                  {card.options.map((o) => (
                    <DeclicTile
                      key={o.id}
                      label={o.label}
                      state={o.id === pickedId ? (o.correct ? "correct" : "wrong") : "idle"}
                      onClick={() => {}}
                      disabled
                    />
                  ))}
                </div>
                <p className="declic-bubble declic-bubble--reaction">
                  {card.options.find((o) => o.id === pickedId)?.reaction}
                </p>
                <button type="button" className="declic-cta" onClick={advance}>
                  Suite <ArrowRight size={18} />
                </button>
              </>
            )}
          </motion.div>
        )}

        {card.kind === "reveal" && (
          <motion.div
            key={index}
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <span className="declic-reveal-kicker">{card.kicker}</span>
            <DeclicAsk mood="proud">{card.text}</DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "reformulation" && (
          <motion.div
            key={index}
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
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
  children,
}: {
  mood: "happy" | "eager" | "hesitant" | "cool" | "proud";
  children: string;
}) {
  return (
    <div className="declic-ask">
      <BraiseMascot size={64} mood={mood} />
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
