import { useEffect, useRef, useState } from "react";
import { Tip } from "@/components/Tip";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { DeclicAsk, DeclicTile } from "@/components/declic/shared";
import { MathText } from "@/components/course/MathText";
import { ReviewPlayer } from "@/components/course/ReviewPlayer";
import { VisualView } from "@/components/course/VisualView";
import { fireConfetti } from "@/lib/confetti";
import { sfx } from "@/lib/sound";
import { useTone } from "@/lib/useTone";
import {
  computeAssessment,
  currentCard,
  currentChoiceContent,
  currentSteps,
  followUpCards,
  progressRatio,
  retryRemediation,
  selectedChoice,
  type Run,
} from "@/lib/course/engine";
import { courseProgressStore } from "@/lib/course/progressStore";
import {
  beginFollowUp,
  beginRetry,
  choose,
  closeMenu,
  endFollowUp,
  finish,
  next,
  beginRun,
  recordOpened,
  openMenu,
  pickMenuItem,
} from "@/lib/course/session";
import { resolveText } from "@/lib/course/text";
import type { Beat, CardDef, Choice, DeclicDef, ReviewDeckDef, Text } from "@/lib/course/types";

const CARD_SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;

// The little label at the top of the screen for each kind of card.
const BEAT: Record<CardDef["type"], string> = {
  choice: "Tente",
  reveal: "Déclic",
  "multi-step-choice": "À toi",
  "declic-summary": "Retiens",
};

// …unless the author placed the card in the show / together / alone rhythm.
/** Three short answers ("ℕ", "ℤ", "Aucune") sit side by side; sentences need the full width. */
const shortOptions = (options: Choice[]) => options.every((o) => o.label.length <= 8);

const RHYTHM: Record<Beat, string> = {
  show: "Je te montre",
  together: "On le fait",
  you: "À toi",
  trap: "Le piège",
};

/** Plays one Déclic from its data. It renders whatever card the engine says is current and sends
 *  every tap back to it; no card, text or answer of any course is known here. Every action is saved
 *  as it happens, so leaving at any moment resumes on the same card. */
export function CoursePlayer({
  def,
  deck,
  soundOn,
  onExit,
}: {
  def: DeclicDef;
  deck: ReviewDeckDef;
  soundOn: boolean;
  /** The Déclic is finished: back to the chapter. */
  onExit: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { personality } = useTone();
  // Reading where the student stopped is pure; writing that the Déclic has begun happens in an effect,
  // because saving notifies the chapter list behind this screen, and that must not happen mid-render.
  const [run, setRun] = useState<Run>(() => beginRun(def, courseProgressStore));
  useEffect(() => {
    recordOpened(def, run, courseProgressStore);
    // Once, when the Déclic opens: later changes are saved by each action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const celebrated = useRef(false);

  const card = currentCard(def, run);
  const picked = selectedChoice(def, run);
  // What the card shows in the version this run plays: other numbers on a second pass or a retry.
  const content = currentChoiceContent(def, run);
  const stepsView = currentSteps(def, run);
  const step = stepsView?.steps[run.stepIndex];
  const afterAll = card.type === "multi-step-choice" && card.feedbackTiming === "after-all";
  const say = (text: Text) => resolveText(text, personality);

  // The summary is the moment the Déclic lands: one celebration, never on a replay back to it.
  useEffect(() => {
    if (card.type !== "declic-summary" || run.phase !== "asking" || celebrated.current) return;
    celebrated.current = true;
    sfx.complete(soundOn);
    if (!reducedMotion) fireConfetti();
  }, [card.type, run.phase, soundOn, reducedMotion]);

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

  // Focus follows the card, so a screen reader announces each one and Tab starts from it.
  const focusStep = (el: HTMLElement | null) => el?.focus();

  const pick = (choiceId: string, correct: boolean | undefined, graded: boolean) => {
    if (graded) sfx[correct ? "correct" : "wrong"](soundOn);
    else sfx.tap(soundOn);
    setRun(choose(def, run, choiceId, courseProgressStore));
  };
  const goNext = () => {
    sfx.tap(soundOn);
    setRun(next(def, run, courseProgressStore));
  };

  // ---- the quick situations after a validation that needs reinforcement
  const assessment =
    card.type === "multi-step-choice" ? computeAssessment(def, run.answers, 0) : null;
  if (run.phase === "followup" && assessment) {
    return (
      <ReviewPlayer
        def={def}
        deck={deck}
        cards={followUpCards(def, deck, assessment)}
        heading="Deux situations rapides"
        soundOn={soundOn}
        onDone={() => setRun(endFollowUp(def, run, courseProgressStore))}
      />
    );
  }

  const index = def.cards.findIndex((c) => c.id === card.id);
  const screen =
    run.phase === "outcome"
      ? "outcome"
      : run.phase === "menu"
        ? "menu"
        : run.phase === "corrections"
          ? "corrections"
          : "card";
  const retry = retryRemediation(def, run);
  const followUp =
    assessment && assessment.status === "needs_reinforcement"
      ? followUpCards(def, deck, assessment)
      : [];

  const tile = (choice: Choice, graded: boolean) => {
    const isPicked = picked?.id === choice.id;
    const state = !isPicked || !graded ? "idle" : choice.correct ? "correct" : "wrong";
    const mark = !isPicked ? null : graded ? (choice.correct ? "✓" : "↺") : "●";
    const status = !isPicked
      ? ""
      : graded
        ? choice.correct
          ? "Réponse attendue"
          : "Autre piste"
        : "Ta réponse";
    return (
      <DeclicTile
        key={choice.id}
        className={`course-tile ${choice.visual ? "course-tile--visual" : ""} ${isPicked && !graded ? "is-picked" : ""}`}
        state={state}
        disabled={!!picked}
        ariaLabel={
          choice.visual
            ? `${choice.id} : ${choice.visual.ariaLabel}${status ? ` (${status})` : ""}`
            : undefined
        }
        onClick={() => pick(choice.id, choice.correct, graded)}
        label={
          <>
            {choice.visual ? (
              <VisualView visual={choice.visual} />
            ) : (
              <span className="course-tile-label">
                <MathText text={choice.label} />
              </span>
            )}
            {mark && (
              <span className="course-tile-mark" aria-hidden="true">
                {mark}
              </span>
            )}
            {status && !choice.visual && <span className="sr-only">{status}</span>}
          </>
        }
      />
    );
  };

  const feedbackBlock = (choice: Choice | undefined, ctaLabel: string) =>
    choice && (
      <>
        <p className="declic-bubble declic-bubble--reaction course-bubble" aria-live="polite">
          <MathText text={say(choice.feedback)} />
        </p>
        <button type="button" className="declic-cta" onClick={goNext}>
          {ctaLabel} <ArrowRight size={18} />
        </button>
      </>
    );

  const stageKind =
    card.type === "reveal" ? "reveal" : card.type === "declic-summary" ? "declic" : "question";

  return (
    <div className={`declic-stage declic-stage--${stageKind}`}>
      <div className="declic-hud">
        <div className="declic-hud-copy">
          <span className="declic-hud-brand">
            <Sparkles size={13} /> Le Déclic
          </span>
          <b>{card.beat ? RHYTHM[card.beat] : BEAT[card.type]}</b>
        </div>
        <span className="declic-hud-count">
          {index + 1}/{def.cards.length}
        </span>
        <div
          className="declic-hud-track"
          role="progressbar"
          aria-label="Progression du Déclic"
          aria-valuemin={1}
          aria-valuemax={def.cards.length}
          aria-valuenow={index + 1}
        >
          <motion.span
            animate={{ width: `${progressRatio(def, run) * 100}%` }}
            transition={
              reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28 }
            }
          />
        </div>
      </div>

      {run.replay && (
        <p className="course-replay-note" role="status">
          {run.replay.returnCardId === def.assessment.cardId
            ? "On revoit l’exemple, puis tu retentes une autre version."
            : "Petit rappel : on repasse par là, puis on revient au résumé."}
        </p>
      )}

      <Tip id="declic">
        Un Déclic, c’est un mini-cours raconté par Braise. Tu essaies avant qu’on t’explique.
      </Tip>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${card.id}-${screen}${afterAll ? `-${run.stepIndex}` : ""}`}
          className="declic-step"
          ref={focusStep}
          tabIndex={-1}
          {...cardMotion}
        >
          {/* ---- a question with its choices */}
          {card.type === "choice" && content && screen === "card" && (
            <>
              <DeclicAsk
                scene="question"
                mood={
                  !picked
                    ? "eager"
                    : card.gradeChoices === false
                      ? "happy"
                      : picked.correct
                        ? "proud"
                        : "hesitant"
                }
                bump={
                  !picked || card.gradeChoices === false
                    ? undefined
                    : picked.correct
                      ? "correct"
                      : "wrong"
                }
                bubbleClassName="course-bubble"
              >
                <MathText text={say(content.text)} />
              </DeclicAsk>
              {content.visual && (content.visualTiming !== "after-answer" || picked) && (
                <div className="course-visual">
                  <VisualView visual={content.visual} />
                </div>
              )}
              <div
                className={`declic-choices course-choices ${content.choices.some((c) => c.visual) ? "course-choices--visual" : ""}`}
              >
                {content.choices.map((c) => tile(c, card.gradeChoices !== false))}
              </div>
              {feedbackBlock(picked, card.continueLabel ?? "Continuer")}
            </>
          )}

          {/* ---- a reveal: the name or the rule, once the idea is built */}
          {card.type === "reveal" && (
            <>
              <DeclicAsk mood="proud" scene="reveal" bubbleClassName="course-bubble">
                <MathText text={say(card.text)} />
              </DeclicAsk>
              {card.visual && (
                <div className="course-visual">
                  <VisualView visual={card.visual} />
                </div>
              )}
              <button type="button" className="declic-cta" onClick={goNext}>
                {card.continueLabel ?? "Continuer"} <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* ---- the validation: several items in a row, one score. With held-back corrections
                 the answer is only recorded, neutrally, and the corrections come after the last. */}
          {card.type === "multi-step-choice" && screen === "card" && stepsView && step && (
            <>
              <DeclicAsk
                scene="question"
                mood={
                  !picked ? "eager" : afterAll ? "happy" : picked.correct ? "proud" : "hesitant"
                }
                bump={!picked || afterAll ? undefined : picked.correct ? "correct" : "wrong"}
                bubbleClassName="course-bubble"
              >
                <MathText text={say(step.question ?? stepsView.text)} />
              </DeclicAsk>
              <div className="course-subject" aria-live="polite">
                <span className="course-subject-step">
                  Étape {run.stepIndex + 1} / {stepsView.steps.length}
                </span>
                {step.subject && <span className="course-subject-value">{step.subject}</span>}
                {step.question && (
                  <span className="course-subject-caption">
                    <MathText text={say(stepsView.text)} />
                  </span>
                )}
              </div>
              {step.visual && (
                <div className="course-visual">
                  <VisualView visual={step.visual} />
                </div>
              )}
              <div
                className={`declic-choices course-choices ${shortOptions(step.options) ? "course-choices--trio" : ""}`}
              >
                {step.options.map((o) => tile(o, !afterAll))}
              </div>
              {afterAll
                ? picked && (
                    <button type="button" className="declic-cta" onClick={goNext}>
                      {run.stepIndex + 1 < stepsView.steps.length
                        ? "Étape suivante"
                        : "Voir les corrections"}{" "}
                      <ArrowRight size={18} />
                    </button>
                  )
                : feedbackBlock(
                    picked,
                    run.stepIndex + 1 < stepsView.steps.length
                      ? "Étape suivante"
                      : "Voir mon résultat",
                  )}
            </>
          )}

          {card.type === "multi-step-choice" && screen === "corrections" && stepsView && step && (
            <>
              <DeclicAsk
                scene="question"
                mood={picked?.correct ? "proud" : "hesitant"}
                bump={!picked ? undefined : picked.correct ? "correct" : "wrong"}
                bubbleClassName="course-bubble"
              >
                <MathText text={say(step.question ?? stepsView.text)} />
              </DeclicAsk>
              <div className="course-subject" aria-live="polite">
                <span className="course-subject-step">
                  Correction {run.stepIndex + 1} / {stepsView.steps.length}
                </span>
                {step.subject && <span className="course-subject-value">{step.subject}</span>}
                {step.question && (
                  <span className="course-subject-caption">
                    <MathText text={say(stepsView.text)} />
                  </span>
                )}
              </div>
              {step.visual && (
                <div className="course-visual">
                  <VisualView visual={step.visual} />
                </div>
              )}
              <div
                className={`declic-choices course-choices ${shortOptions(step.options) ? "course-choices--trio" : ""}`}
              >
                {step.options.map((o) => tile(o, true))}
              </div>
              {feedbackBlock(
                picked,
                run.stepIndex + 1 < stepsView.steps.length
                  ? "Correction suivante"
                  : "Voir mon résultat",
              )}
            </>
          )}

          {card.type === "multi-step-choice" && screen === "outcome" && assessment && (
            <>
              <DeclicAsk
                mood={assessment.status === "understood" ? "proud" : "eager"}
                scene="reveal"
                bubbleClassName="course-bubble"
              >
                <MathText
                  text={
                    assessment.status === "understood"
                      ? def.assessment.understoodMessage
                      : def.assessment.needsReinforcementMessage
                  }
                />
              </DeclicAsk>
              <p className="course-score" role="status">
                <b>
                  {assessment.score}/{assessment.max}
                </b>{" "}
                étapes réussies
              </p>
              {retry || followUp.length > 0 ? (
                <div className="course-actions">
                  {retry && (
                    <button
                      type="button"
                      className="declic-cta"
                      onClick={() => {
                        sfx.tap(soundOn);
                        setRun(beginRetry(def, run, courseProgressStore));
                      }}
                    >
                      Revoir l’exemple, puis réessayer <ArrowRight size={18} />
                    </button>
                  )}
                  {followUp.length > 0 && (
                    <button
                      type="button"
                      className={retry ? "declic-link" : "declic-cta"}
                      onClick={() => {
                        sfx.tap(soundOn);
                        setRun(beginFollowUp(def, run, courseProgressStore));
                      }}
                    >
                      Les deux situations rapides {!retry && <ArrowRight size={18} />}
                    </button>
                  )}
                  <button type="button" className="declic-link" onClick={goNext}>
                    Passer au résumé
                  </button>
                </div>
              ) : (
                <button type="button" className="declic-cta" onClick={goNext}>
                  Continuer <ArrowRight size={18} />
                </button>
              )}
            </>
          )}

          {/* ---- the Déclic itself: what to keep, the trap, and where to go back */}
          {card.type === "declic-summary" && screen === "card" && (
            <div className="declic-fiche course-summary">
              <div className="course-summary-flame">
                <BraiseMascot size={84} mood="proud" />
              </div>
              <p className="course-summary-text">
                <MathText text={say(card.text)} />
              </p>
              <div className="course-actions">
                {card.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={action.kind === "complete" ? "declic-cta" : "declic-link"}
                    onClick={() => {
                      sfx.tap(soundOn);
                      if (action.kind === "complete") {
                        setRun(finish(def, run, courseProgressStore));
                        onExit();
                      } else setRun(openMenu(def, run, courseProgressStore));
                    }}
                  >
                    {action.label}
                    {action.kind === "complete" && <ArrowRight size={18} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {card.type === "declic-summary" && screen === "menu" && (
            <>
              <DeclicAsk mood="eager" scene="question" bubbleClassName="course-bubble">
                Qu’est-ce qui te piège encore ?
              </DeclicAsk>
              <div className="declic-choices course-choices">
                {card.menu.map((item) => (
                  <DeclicTile
                    key={item.id}
                    className="course-tile"
                    state="idle"
                    onClick={() => {
                      sfx.tap(soundOn);
                      setRun(pickMenuItem(def, run, item.id, courseProgressStore));
                    }}
                    label={
                      <span className="course-tile-label">
                        <MathText text={item.label} />
                      </span>
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                className="declic-link"
                onClick={() => setRun(closeMenu(def, run, courseProgressStore))}
              >
                Retour au résumé
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
