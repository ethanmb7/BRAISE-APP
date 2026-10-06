import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { MathText } from "@/components/course/MathText";
import { VisualView } from "@/components/course/VisualView";
import { sfx } from "@/lib/sound";
import { useTone } from "@/lib/useTone";
import { courseSlides, type Slide, type SlideKind } from "@/lib/course/slides";
import { resolveText } from "@/lib/course/text";
import type { DeclicDef, Text } from "@/lib/course/types";

const KIND_LABEL: Record<SlideKind, string> = {
  explain: "Je te montre",
  example: "Exemple",
  trap: "Le piège",
  recap: "À garder",
};

const SWIPE_DISTANCE = 60;
const SWIPE_SPEED = 400;

/** The course of a Déclic as a visual presentation: one idea per slide, big pictures, swipe or tap to
 *  go on. It is built from the Déclic (see lib/course/slides.ts); reading gives no points. The last
 *  slide leads to the Déclic itself, where the same ideas are put to work. */
export function CoursePresentation({
  def,
  soundOn,
  onStart,
}: {
  def: DeclicDef;
  soundOn: boolean;
  /** Leave the presentation for the Déclic. */
  onStart: () => void;
}) {
  const reduced = useReducedMotion();
  const { personality } = useTone();
  const say = (text: Text) => resolveText(text, personality);
  const slides = useMemo(() => courseSlides(def), [def]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const deck = useRef<HTMLDivElement>(null);

  const go = (to: number) => {
    const next = Math.min(slides.length - 1, Math.max(0, to));
    if (next === index) return;
    sfx.tap(soundOn);
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  // Arrow keys go through the slides; focus lands on the deck so a keyboard user starts there.
  useEffect(() => {
    deck.current?.focus({ preventScroll: true });
  }, []);

  if (slides.length === 0) {
    return (
      <div className="course-deck">
        <p className="course-deck-empty">Ce Déclic n’a pas encore de cours à lire.</p>
        <button type="button" className="declic-cta" onClick={onStart}>
          Faire le Déclic <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  const slide = slides[index];
  const last = index === slides.length - 1;
  const variants = reduced
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({ opacity: 0, x: 70 * d, scale: 0.96 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (d: number) => ({ opacity: 0, x: -70 * d, scale: 0.96 }),
      };

  return (
    <div
      className="course-deck"
      ref={deck}
      tabIndex={0}
      aria-roledescription="présentation"
      aria-label={`Cours : ${def.title}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="course-deck-bar">
        <span>Cours · Déclic {String(def.order).padStart(2, "0")}</span>
        <span aria-live="polite">
          {index + 1} / {slides.length}
        </span>
      </div>

      <div className="course-deck-stage">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={slide.cardId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            drag={reduced ? false : "x"}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_SPEED) go(index + 1);
              else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_SPEED)
                go(index - 1);
            }}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${index + 1} sur ${slides.length}`}
          >
            <SlideCard slide={slide} say={say} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="course-deck-dots" role="group" aria-label="Aller à une diapositive">
        {slides.map((s, i) => (
          <button
            key={s.cardId}
            type="button"
            className="course-deck-dot"
            aria-label={`Diapositive ${i + 1} : ${KIND_LABEL[s.kind]}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>

      <div className="course-deck-nav">
        <button
          type="button"
          className="course-deck-arrow"
          aria-label="Diapositive précédente"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <ChevronLeft size={22} strokeWidth={3} />
        </button>
        {last ? (
          <button type="button" className="declic-cta course-deck-cta" onClick={onStart}>
            Passer aux questions <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="declic-cta course-deck-cta"
            onClick={() => go(index + 1)}
          >
            Suivant <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

/** The summary, one point per line: a short first line is its heading, a line that starts with a
 *  warning sign (the control trap) is set apart. */
function Recap({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim());
  const heading = lines.length > 1 && lines[0].length <= 30 ? lines[0] : null;
  const points = heading ? lines.slice(1) : lines;
  return (
    <>
      {heading && (
        <p className="course-slide-text course-slide-heading">
          <MathText text={heading} />
        </p>
      )}
      <ul className="course-slide-points">
        {points.map((line, i) => (
          <li
            key={i}
            className={
              line.startsWith("⚠️")
                ? "course-slide-point course-slide-point--warn"
                : "course-slide-point"
            }
          >
            <MathText text={line} />
          </li>
        ))}
      </ul>
    </>
  );
}

function SlideCard({ slide, say }: { slide: Slide; say: (t: Text) => string }) {
  return (
    <article className={`course-slide course-slide--${slide.kind}`}>
      <header className="course-slide-head">
        <span className="course-slide-tag">{KIND_LABEL[slide.kind]}</span>
        <BraiseMascot
          size={46}
          mood={slide.kind === "trap" ? "hesitant" : slide.kind === "recap" ? "proud" : "happy"}
        />
      </header>

      {slide.kind === "recap" ? (
        <Recap text={say(slide.text)} />
      ) : (
        <p className="course-slide-text">
          <MathText text={say(slide.text)} />
        </p>
      )}

      {slide.visual && (
        <div className="course-visual">
          <VisualView visual={slide.visual} />
        </div>
      )}

      {slide.answer && (
        <div className="course-slide-answer">
          <span className="course-slide-answer-label">
            {slide.kind === "trap" ? "Ce qu’il faut voir" : "Réponse"}
          </span>
          <b>
            <MathText text={slide.answer.label} />
          </b>
          <p>
            <MathText text={say(slide.answer.because)} />
          </p>
        </div>
      )}
    </article>
  );
}
