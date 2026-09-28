import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { sfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { recordDeclicMemory, type DeclicScript } from "@/lib/declic";
import { DeclicTimeline } from "@/components/declic/DeclicTimeline";

type Step =
  | "essayer"
  | "diagnostic"
  | "explication"
  | "declic"
  | "reformulation"
  | "verification"
  | "abstraction";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

// "Le Déclic" — BRAISE's learning loop (PRODUCT_VISION.md, section 4), replacing the old
// Vocal Animé + end-quiz combo for any chapter with an authored script. Its own visual identity
// on purpose: a warm indigo stage instead of Réviser's swipe cards or the old slide deck, so a
// Déclic moment is never mistaken for a drill. Grammar stays the app's own (thick black borders,
// hard shadows, Baloo 2 headers) — only the composition and pacing are new.
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
  const [step, setStep] = useState<Step>("essayer");
  const [explanationId, setExplanationId] = useState<string | null>(null);
  const [explainIdx, setExplainIdx] = useState(0);
  const [reformulation, setReformulation] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pressedOnce, setPressedOnce] = useState(false);

  const explanation = explanationId ? script.explanations[explanationId] : null;

  const choose = (id: string) => {
    sfx.tap(soundOn);
    setPickedId(id);
  };

  const answerEssayer = (id: string) => {
    choose(id);
    if (id === script.essayer.correctId) {
      sfx.correct(soundOn);
      setTimeout(() => {
        setPickedId(null);
        setStep("reformulation");
      }, 500);
    } else {
      sfx.wrong(soundOn);
      setTimeout(() => {
        setPickedId(null);
        setStep("diagnostic");
      }, 500);
    }
  };

  const pickReason = (id: string) => {
    const reason = script.diagnostic.reasons.find((r) => r.id === id);
    if (!reason) return;
    sfx.tap(soundOn);
    setExplanationId(reason.explanationId);
    setExplainIdx(0);
    setStep("explication");
  };

  const nextExplainBeat = () => {
    if (!explanation) return;
    sfx.tap(soundOn);
    if (explainIdx < explanation.steps.length - 1) {
      setExplainIdx((i) => i + 1);
    } else {
      setStep("declic");
      sfx.complete(soundOn);
      if (!reducedMotion) fireConfetti();
    }
  };

  const notYet = () => {
    // One retry beat, not an unbounded loop: PRODUCT_VISION.md's escalation (texte → dessin →
    // exemple → manipulation) needs more than one authored explanation per reason to do fully;
    // for this one validated notion, a second, more explicit pass is what's authored so far.
    sfx.tap(soundOn);
    setStep("declic");
    sfx.complete(soundOn);
    if (!reducedMotion) fireConfetti();
  };

  const submitReformulation = () => {
    if (!reformulation.trim()) return;
    sfx.tap(soundOn);
    recordDeclicMemory(script.chapterId, {
      explanationId: explanationId ?? "direct",
      reformulation: reformulation.trim(),
      at: Date.now(),
    });
    setPickedId(null);
    setStep("verification");
  };

  const answerVerification = (id: string) => {
    choose(id);
    if (id === script.verification.correctId) {
      sfx.correct(soundOn);
      setTimeout(() => {
        setPickedId(null);
        setStep("abstraction");
      }, 500);
    } else {
      // A miss here reopens the diagnostic instead of repeating the same explanation —
      // PRODUCT_VISION.md, étape 6 : "un échec à cette étape rouvre le diagnostic".
      sfx.wrong(soundOn);
      setTimeout(() => {
        setPickedId(null);
        setPressedOnce(true);
        setStep("diagnostic");
      }, 500);
    }
  };

  const answerAbstraction = (id: string) => {
    choose(id);
    sfx[id === script.abstraction.correctId ? "correct" : "wrong"](soundOn);
  };

  return (
    <div className="declic-stage">
      <AnimatePresence mode="wait">
        {step === "essayer" && (
          <motion.div
            key="essayer"
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="eager">{script.essayer.question}</DeclicAsk>
            <div className="declic-choices">
              {script.essayer.choices.map((c) => (
                <DeclicTile
                  key={c.id}
                  label={c.label}
                  state={
                    pickedId === c.id
                      ? c.id === script.essayer.correctId
                        ? "correct"
                        : "wrong"
                      : "idle"
                  }
                  onClick={() => answerEssayer(c.id)}
                  disabled={pickedId !== null}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "diagnostic" && (
          <motion.div
            key="diagnostic"
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="hesitant">
              {pressedOnce
                ? "On refait le point. " + script.diagnostic.prompt
                : script.diagnostic.prompt}
            </DeclicAsk>
            <div className="declic-choices declic-choices--stack">
              {script.diagnostic.reasons.map((r) => (
                <DeclicTile
                  key={r.id}
                  label={r.label}
                  state="idle"
                  onClick={() => pickReason(r.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "explication" && explanation && (
          <motion.div
            key={`explication-${explainIdx}`}
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="happy">{explanation.steps[explainIdx]}</DeclicAsk>
            {explanation.visual?.kind === "timeline" && (
              <DeclicTimeline visual={explanation.visual} step={explainIdx} />
            )}
            {explainIdx < explanation.steps.length - 1 ? (
              <button type="button" className="declic-cta" onClick={nextExplainBeat}>
                Suite <ArrowRight size={18} />
              </button>
            ) : (
              <div className="declic-choices">
                <DeclicTile
                  label={explanation.checkIn + " Oui !"}
                  state="idle"
                  onClick={nextExplainBeat}
                />
                <DeclicTile label="Pas encore" state="idle" onClick={notYet} />
              </div>
            )}
          </motion.div>
        )}

        {step === "declic" && (
          <motion.div
            key="declic"
            className="declic-moment"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING}
          >
            <motion.div
              className="declic-moment-flame"
              animate={reducedMotion ? {} : { rotate: [-4, 4, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <BraiseMascot size={104} mood="proud" />
            </motion.div>
            <span className="declic-moment-kicker">🔥 déclic</span>
            <p className="declic-moment-line">{script.declicLine}</p>
            <button
              type="button"
              className="declic-cta"
              onClick={() => {
                sfx.tap(soundOn);
                setStep("reformulation");
              }}
            >
              Continuer <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === "reformulation" && (
          <motion.div
            key="reformulation"
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="eager">{script.reformulationPrompt}</DeclicAsk>
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

        {step === "verification" && (
          <motion.div
            key="verification"
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="cool">{script.verification.question}</DeclicAsk>
            <div className="declic-choices">
              {script.verification.choices.map((c) => (
                <DeclicTile
                  key={c.id}
                  label={c.label}
                  state={
                    pickedId === c.id
                      ? c.id === script.verification.correctId
                        ? "correct"
                        : "wrong"
                      : "idle"
                  }
                  onClick={() => answerVerification(c.id)}
                  disabled={pickedId !== null}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "abstraction" && (
          <motion.div
            key="abstraction"
            className="declic-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={SPRING}
          >
            <DeclicAsk mood="proud">{script.abstraction.question}</DeclicAsk>
            <div className="declic-choices declic-choices--row">
              {script.abstraction.choices.map((c) => (
                <DeclicTile
                  key={c.id}
                  label={c.label}
                  state={
                    pickedId === c.id
                      ? c.id === script.abstraction.correctId
                        ? "correct"
                        : "wrong"
                      : "idle"
                  }
                  onClick={() => answerAbstraction(c.id)}
                  disabled={pickedId !== null}
                />
              ))}
            </div>
            {pickedId && (
              <>
                <p className="declic-explain">{script.abstraction.explain}</p>
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
              </>
            )}
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
