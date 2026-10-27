import { Fragment, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SUBJECTS, SUBJECT_SHORT_NAMES } from "@/data";
import { fireMicroConfetti } from "@/lib/confetti";
import { checkTile, clozePieces, clozeTiles, type ClozeCard } from "@/lib/cloze";
import { sfx } from "@/lib/sound";

/** "Complète la règle": the first step of a chapter tried before any lesson. A sentence with holes, tiles
 *  to put in them one after the other. A wrong tile goes back and says why (never a buzz); "Je sais plus"
 *  shows the sentence and counts as "pas sûr". Nothing is typed. */
export function ClozeStep({
  card,
  soundOn,
  onDone,
  onQuit,
}: {
  card: ClozeCard;
  soundOn: boolean;
  /** `sure`: the sentence was found again without a wrong tile and without "Je sais plus". */
  onDone: (sure: boolean) => void;
  onQuit: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const pieces = useMemo(() => clozePieces(card), [card]);
  const tiles = useMemo(() => clozeTiles(card), [card]);
  const subject = SUBJECTS.find((s) => s.chapters.some((c) => c.id === card.chapterId));
  const chapter = subject?.chapters.find((c) => c.id === card.chapterId);
  const [filled, setFilled] = useState(0);
  const [nope, setNope] = useState<{ tile: string; n: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const [line, setLine] = useState("Sans regarder : complète la règle.");
  const done = filled >= card.answers.length;
  const sure = mistakes === 0 && !gaveUp;

  const finish = (ok: boolean) => {
    setLine(ok ? "Voilà. Retrouvée toute seule." : "Voilà la règle. On la rallume demain.");
    if (ok) {
      sfx.correct(soundOn);
      if (!reducedMotion) fireMicroConfetti(0.5, 0.55, false);
    }
  };

  const pick = (tile: string) => {
    if (done) return;
    const result = checkTile(card, filled, tile);
    if (result.ok) {
      sfx.tap(soundOn);
      const next = filled + 1;
      setFilled(next);
      setNope(null);
      if (next >= card.answers.length) finish(mistakes === 0);
      else setLine("Oui. La suite ?");
    } else {
      sfx.soft(soundOn);
      setMistakes((m) => m + 1);
      setNope((p) => ({ tile, n: (p?.n ?? 0) + 1 }));
      setLine(result.reason);
    }
  };

  const giveUp = () => {
    if (done) return;
    sfx.soft(soundOn);
    setGaveUp(true);
    setFilled(card.answers.length);
    finish(false);
  };

  const usedAnswers = new Set(card.answers.slice(0, filled));
  const mood = done ? (sure ? "cool" : "happy") : mistakes > 0 ? "hesitant" : "happy";

  return (
    <div className="cz">
      <div className="flash-stage" aria-hidden="true">
        <div
          className="flash-stage-layer"
          style={{ "--subject-color": subject?.color || "var(--neo-blue)" } as React.CSSProperties}
        />
        <div className="flash-stage-dots" />
      </div>
      <div className="rev-top-row">
        <span className="cz-kick">Sans regarder</span>
        <span className="cz-spacer" />
        <button className="rev-icon-btn" onClick={onQuit} aria-label="Quitter la série">
          <X size={16} strokeWidth={3} />
        </button>
      </div>
      <div className="cz-body">
        <div className="cz-braise">
          <BraiseMascot size={60} mood={mood} />
          <p className="cz-bubble" role="status" aria-live="polite">
            {line}
          </p>
        </div>
        <div className="cz-card">
          <span className="cz-cap">
            {subject ? (SUBJECT_SHORT_NAMES[subject.id] ?? subject.name) : ""}
            {chapter ? ` · ${chapter.title}` : ""}
          </span>
          <p className="cz-sentence">
            {pieces.map((piece, i) => (
              <Fragment key={i}>
                {piece}
                {i < card.answers.length && (
                  <span
                    className={`cz-slot${i < filled ? " is-filled" : ""}${i === filled && !done ? " is-next" : ""}`}
                  >
                    {i < filled ? (
                      card.answers[i]
                    ) : (
                      <span aria-label={`trou ${i + 1}`} className="cz-blank">
                        …
                      </span>
                    )}
                  </span>
                )}
              </Fragment>
            ))}
          </p>
        </div>
        <div className="cz-tray" role="group" aria-label="Les mots à placer">
          {tiles.map((tile) => {
            const used = usedAnswers.has(tile);
            return (
              <button
                key={`${tile}-${nope?.tile === tile ? nope.n : 0}`}
                type="button"
                className={`cz-tile${nope?.tile === tile ? " is-nope" : ""}`}
                disabled={used || done}
                onClick={() => pick(tile)}
              >
                {tile}
              </button>
            );
          })}
        </div>
        <div className="cz-actions">
          {done ? (
            <button type="button" className="cz-go" onClick={() => onDone(sure)}>
              Suite
            </button>
          ) : (
            <button type="button" className="cz-idk" onClick={giveUp}>
              Je sais plus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
