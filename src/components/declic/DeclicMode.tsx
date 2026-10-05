import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { sfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { recordDeclicMemory, type DeclicScript } from "@/lib/declic";
import { DeclicTimeline } from "@/components/declic/DeclicTimeline";
import { DeclicVisualScene } from "@/components/declic/DeclicVisualScene";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";

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
  // Braise's own lines follow the student's tone; explanations and the fiche stay as written.
  const { t, authored } = useTone();
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [reformulation, setReformulation] = useState("");

  const card = script.cards[index];
  const pickedOption =
    card.kind === "choice" ? card.options.find((o) => o.id === pickedId) : undefined;
  const progress = ((index + 1) / script.cards.length) * 100;
  const beat =
    card.kind === "situation"
      ? "Capte"
      : card.kind === "choice"
        ? "Tente"
        : card.kind === "reveal"
          ? "Déclic"
          : card.kind === "reformulation"
            ? "À toi"
            : card.kind === "fiche"
              ? "Retiens"
              : "Validé";

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
    setShowAlt(false);
    setShowNudge(false);
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

  const explainDifferently = () => {
    sfx.tap(soundOn);
    setShowAlt(true);
  };

  const submitReformulation = () => {
    if (!reformulation.trim()) return;
    sfx.tap(soundOn);
    recordDeclicMemory(script.chapterId, { reformulation: reformulation.trim(), at: Date.now() });
    setIndex((i) => i + 1);
  };

  // A screen-reader or keyboard user needs focus to actually move to each new card — without
  // this, focus stays on the "Suite" button that just unmounted (or falls back to <body>), so
  // every beat after the first goes unannounced and Tab has to be walked from the top of the
  // page again. tabIndex={-1} makes the card itself a valid, non-tab-stoppable focus target; the
  // reformulation card skips this and keeps its textarea's own autoFocus instead, so focus lands
  // on the actual input rather than fighting it for the container.
  const focusStep = (el: HTMLElement | null) => el?.focus();

  return (
    <div className={`declic-stage declic-stage--${card.kind}`}>
      <div className="declic-hud">
        <div className="declic-hud-copy">
          <span className="declic-hud-brand">
            <Sparkles size={13} /> Le Déclic
          </span>
          <b>{beat}</b>
        </div>
        <span className="declic-hud-count">
          {index + 1}/{script.cards.length}
        </span>
        <div
          className="declic-hud-track"
          role="progressbar"
          aria-label="Progression de la notion"
          aria-valuemin={1}
          aria-valuemax={script.cards.length}
          aria-valuenow={index + 1}
        >
          <motion.span
            animate={{ width: `${progress}%` }}
            transition={
              reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28 }
            }
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        {card.kind === "situation" && (
          <motion.div
            key={index}
            className="declic-step"
            ref={focusStep}
            tabIndex={-1}
            {...cardMotion}
          >
            <DeclicAsk mood="happy" scene="story">
              {authored(card.text, card.variants)}
            </DeclicAsk>
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
            ref={focusStep}
            tabIndex={-1}
            {...cardMotion}
          >
            <DeclicAsk
              scene="question"
              mood={!pickedOption ? "eager" : pickedOption.correct ? "proud" : "hesitant"}
              bump={!pickedOption ? undefined : pickedOption.correct ? "correct" : "wrong"}
            >
              {authored(card.prompt, card.variants)}
            </DeclicAsk>
            <DeclicVisualScene
              chapterId={script.chapterId}
              cardIndex={index}
              pickedId={pickedId}
              correct={pickedOption?.correct}
            />
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
            {!pickedId && (
              <button
                type="button"
                className="declic-nudge-trigger"
                onClick={() => {
                  sfx.tap(soundOn);
                  setShowNudge((visible) => !visible);
                }}
              >
                <HelpCircle size={16} /> {t(COPY.declic.stuck)}
              </button>
            )}
            {showNudge && !pickedId && (
              <motion.p
                className="declic-nudge"
                aria-live="polite"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {t(COPY.declic.nudge)}
              </motion.p>
            )}
            {pickedOption && (
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
                    <p className="declic-bubble declic-bubble--reaction" aria-live="polite">
                      {authored(pickedOption.reaction, pickedOption.variants)}
                    </p>
                    {showAlt && pickedOption.altExplanation && (
                      <p className="declic-bubble declic-bubble--alt" aria-live="polite">
                        {pickedOption.altExplanation}
                      </p>
                    )}
                    <div className="declic-step-actions">
                      {!showAlt && !pickedOption.correct && pickedOption.altExplanation && (
                        <button type="button" className="declic-link" onClick={explainDifferently}>
                          {t(COPY.declic.stillLost)}
                        </button>
                      )}
                      <button type="button" className="declic-cta" onClick={advance}>
                        Suite <ArrowRight size={18} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {card.kind === "reveal" && (
          <motion.div
            key={index}
            className="declic-step"
            ref={focusStep}
            tabIndex={-1}
            {...cardMotion}
          >
            <DeclicAsk mood="proud" scene="reveal">
              <span className="declic-reveal-kicker">{card.kicker}</span>
              {authored(card.text, card.variants)}
            </DeclicAsk>
            {card.visual?.kind === "timeline" && <DeclicTimeline visual={card.visual} />}
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "reformulation" && (
          <motion.div key={index} className="declic-step" {...cardMotion}>
            <DeclicAsk mood="eager" scene="reformulate">
              {authored(card.prompt, card.variants)}
            </DeclicAsk>
            <textarea
              className="declic-textarea"
              value={reformulation}
              onChange={(e) => setReformulation(e.target.value)}
              placeholder={t(COPY.declic.reformulatePlaceholder)}
              aria-label={card.prompt}
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
            ref={focusStep}
            tabIndex={-1}
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
            <p className="declic-moment-line">{authored(card.line, card.variants)}</p>
            <button type="button" className="declic-cta" onClick={advance}>
              Suite <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {card.kind === "fiche" && (
          <motion.div
            key={index}
            className="declic-fiche"
            ref={focusStep}
            tabIndex={-1}
            {...cardMotion}
          >
            <span className="declic-fiche-kicker">{t(COPY.declic.ficheKicker)}</span>
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
  scene,
  children,
}: {
  mood: Mood;
  /** A one-shot physical reaction — a headshake on a miss, a little nod on a hit — played once
   *  when this prop first appears (see the `key`: it forces a fresh mount, which is what makes
   *  an `initial` → `animate` transition actually run instead of snapping straight to rest). */
  bump?: "correct" | "wrong";
  scene: "story" | "question" | "reveal" | "reformulate";
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const mascotMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : bump === "wrong"
      ? { initial: { rotate: 0, x: 0 }, animate: { rotate: [0, -8, 7, -4, 0], x: [0, -2, 2, 0] } }
      : bump === "correct"
        ? { initial: { y: 0, scale: 1 }, animate: { y: [0, -13, 0], scale: [1, 1.08, 1] } }
        : { initial: { opacity: 0, y: 14, rotate: -3 }, animate: { opacity: 1, y: 0, rotate: 0 } };
  return (
    <div className={`declic-ask declic-ask--${scene}`}>
      <motion.div
        key={`${scene}-${bump ?? mood}`}
        className="declic-actor"
        {...mascotMotion}
        transition={
          bump
            ? { duration: 0.48, ease: "easeOut" }
            : { type: "spring", stiffness: 360, damping: 22 }
        }
      >
        <span className="declic-actor-shadow" aria-hidden="true" />
        <BraiseMascot
          size={scene === "reveal" ? 126 : 112}
          mood={mood}
          pose={scene === "question" ? "focus" : scene === "reveal" ? "victory" : "idle"}
        />
        <span className="declic-actor-tag">BRAISE</span>
      </motion.div>
      <h2 className="declic-bubble">
        <span>{children}</span>
      </h2>
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
