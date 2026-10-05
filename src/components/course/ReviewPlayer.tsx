import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { DeclicAsk, DeclicTile } from "@/components/declic/shared";
import { MathText } from "@/components/course/MathText";
import { sfx } from "@/lib/sound";
import { courseProgressStore } from "@/lib/course/progressStore";
import { answerReviewCard } from "@/lib/course/session";
import { daysUntil, soonestDue } from "@/lib/course/review";
import type { DeclicDef, ReviewAnswer, ReviewCardDef, ReviewDeckDef } from "@/lib/course/types";

const CARD_SPRING = { type: "spring", stiffness: 420, damping: 26 } as const;

/** Carré / Intox on a review deck's cards: Braise states a claim, the student says whether it holds.
 *  Every answer is saved with its spaced-repetition schedule (lib/course/session.ts); points are
 *  not granted yet — the economy decides that later, from the reward each answer reports. Used for
 *  the whole deck and, with two cards, for the quick situations after a validation. */
export function ReviewPlayer({
  def,
  deck,
  cards,
  heading,
  soundOn,
  onDone,
}: {
  def: DeclicDef;
  deck: ReviewDeckDef;
  cards: ReviewCardDef[];
  heading: string;
  soundOn: boolean;
  onDone: (correct: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState<ReviewAnswer | null>(null);
  const [hits, setHits] = useState(0);

  const finished = index >= cards.length;
  const card = cards[index];

  const motionProps = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 26, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -38, rotate: -2, scale: 0.95 },
        transition: CARD_SPRING,
      };

  const answer = (choice: ReviewAnswer) => {
    if (given || !card) return;
    const result = answerReviewCard(def, deck, card, choice, courseProgressStore);
    sfx[result.correct ? "correct" : "wrong"](soundOn);
    setGiven(choice);
    if (result.correct) setHits((h) => h + 1);
  };

  const next = () => {
    sfx.tap(soundOn);
    setGiven(null);
    setIndex((i) => i + 1);
  };

  if (finished) {
    const soonest = soonestDue(deck, courseProgressStore.get().reviewCards);
    const days = soonest === null ? null : daysUntil(soonest, Date.now());
    return (
      <div className="declic-stage declic-stage--declic">
        <motion.div className="declic-step" {...motionProps}>
          <DeclicAsk mood="proud" scene="reveal" bubbleClassName="course-bubble">
            <MathText
              text={`🔥 ${hits} sur ${cards.length}.\n${
                days === null || days === 0
                  ? "Ces cartes reviendront très vite."
                  : `On te les remontre dans ${days} jour${days > 1 ? "s" : ""}, pour voir ce qui est resté.`
              }`}
            />
          </DeclicAsk>
          <button type="button" className="declic-cta" onClick={() => onDone(hits)}>
            Terminer <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  const correct = given !== null && given === card.answer;
  const tileState = (value: ReviewAnswer) =>
    given === null ? "idle" : given === value ? (correct ? "correct" : "wrong") : "idle";

  return (
    <div className="declic-stage declic-stage--question">
      <div className="declic-hud">
        <div className="declic-hud-copy">
          <span className="declic-hud-brand">
            <Sparkles size={13} /> {heading}
          </span>
          <b>Carré ou Intox</b>
        </div>
        <span className="declic-hud-count">
          {index + 1}/{cards.length}
        </span>
        <div
          className="declic-hud-track"
          role="progressbar"
          aria-label="Progression de la révision"
          aria-valuemin={1}
          aria-valuemax={cards.length}
          aria-valuenow={index + 1}
        >
          <motion.span
            animate={{ width: `${((index + (given ? 1 : 0.5)) / cards.length) * 100}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={card.id} className="declic-step" {...motionProps}>
          <DeclicAsk
            scene="question"
            mood={given === null ? "eager" : correct ? "proud" : "hesitant"}
            bump={given === null ? undefined : correct ? "correct" : "wrong"}
            bubbleClassName="course-bubble"
          >
            <MathText text={card.statement} />
          </DeclicAsk>

          <div className="declic-choices course-choices course-choices--duo">
            {(
              [
                { value: "carre", label: "Carré", hint: "c’est vrai", Icon: Check },
                { value: "intox", label: "Intox", hint: "c’est faux", Icon: X },
              ] as const
            ).map(({ value, label, hint, Icon }) => (
              <DeclicTile
                key={value}
                className="course-tile course-tile--duo"
                state={tileState(value)}
                disabled={given !== null}
                ariaLabel={`${label} — ${hint}`}
                onClick={() => answer(value)}
                label={
                  <>
                    <Icon size={20} strokeWidth={3} aria-hidden="true" />
                    <span className="course-tile-label">{label}</span>
                  </>
                }
              />
            ))}
          </div>

          {given !== null && (
            <>
              <p className="declic-bubble declic-bubble--reaction course-bubble" aria-live="polite">
                <MathText text={correct ? card.feedback.correct : card.feedback.incorrect} />
              </p>
              <button type="button" className="declic-cta" onClick={next}>
                {index + 1 < cards.length ? "Carte suivante" : "Voir le bilan"}{" "}
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
