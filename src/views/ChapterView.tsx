import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { CoursePlayer } from "@/components/course/CoursePlayer";
import { CoursePresentation } from "@/components/course/CoursePresentation";
import { ReviewPlayer } from "@/components/course/ReviewPlayer";
import { StatusChip } from "@/components/course/StatusChip";
import { MathText } from "@/components/course/MathText";
import { displayStatus } from "@/lib/course/engine";
import { courseSlides } from "@/lib/course/slides";
import { daysUntil, dueCards, soonestDue } from "@/lib/course/review";
import { declicsOfChapter, getDeck } from "@/lib/course/registry";
import { coverageReport } from "@/lib/course/validate";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import type { ChapterDef } from "@/lib/course/types";

type Active =
  | { kind: "declic"; id: string }
  | { kind: "cours"; id: string }
  | { kind: "deck"; id: string }
  | null;

const LEVEL_LABEL: Record<ChapterDef["level"], string> = {
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
};

const COVERAGE_LABEL = {
  full: "couvert en entier",
  introduced: "introduit",
  introduced_and_practised: "introduit et pratiqué",
} as const;

/** A chapter of the official programme: its Déclics, each with where the student stands, then the
 *  review deck. Built from the chapter's data; a new Déclic shows up here by being added to it. */
export function ChapterView({ chapter }: { chapter: ChapterDef }) {
  const { state, goBack } = useApp();
  const progress = useCourseProgress();
  const [active, setActive] = useState<Active>(null);
  const declics = declicsOfChapter(chapter);
  const now = Date.now();

  if (active?.kind === "declic") {
    const def = declics.find((d) => d.id === active.id);
    const deck = def ? getDeck(def.deckId) : undefined;
    if (def && deck) {
      return (
        <div>
          <TopBar title={def.title} onBack={() => setActive(null)} />
          <div className="view is-active">
            <CoursePlayer
              def={def}
              deck={deck}
              soundOn={state.soundOn}
              onExit={() => setActive(null)}
            />
          </div>
        </div>
      );
    }
  }

  if (active?.kind === "cours") {
    const def = declics.find((d) => d.id === active.id);
    if (def) {
      return (
        <div>
          <TopBar title={def.title} onBack={() => setActive(null)} />
          <div className="view is-active">
            <CoursePresentation
              def={def}
              soundOn={state.soundOn}
              onStart={() => setActive({ kind: "declic", id: def.id })}
            />
          </div>
        </div>
      );
    }
  }

  if (active?.kind === "deck") {
    const deck = getDeck(active.id);
    const def = declics.find((d) => d.deckId === active.id);
    if (deck && def) {
      return (
        <div>
          <TopBar title={deck.title} onBack={() => setActive(null)} />
          <div className="view is-active">
            <ReviewPlayer
              def={def}
              deck={deck}
              cards={deck.cards}
              heading="Révision"
              soundOn={state.soundOn}
              onDone={() => setActive(null)}
            />
          </div>
        </div>
      );
    }
  }

  const report = coverageReport(chapter, declics);

  return (
    <div>
      <TopBar title={chapter.title} onBack={goBack} />
      <div className="view is-active course-chapter">
        <header className="course-chapter-head">
          <span className="course-chapter-kicker">
            {LEVEL_LABEL[chapter.level]} · Programme officiel
          </span>
          <h1>{chapter.title}</h1>
          <p>
            <MathText
              text={`${chapter.source.bulletin} · ${chapter.source.path.slice(-2).join(" › ")}`}
            />
          </p>
        </header>

        <section aria-label="Les Déclics du chapitre" className="course-list">
          {declics.map((def) => {
            const saved = progress.declics[def.id];
            const status = displayStatus(saved);
            const minutes = Math.max(
              1,
              Math.round((def.targetDurationSec[0] + def.targetDurationSec[1]) / 2 / 60),
            );
            const verb =
              status === "not_started"
                ? "Commencer"
                : saved?.completionStatus === "completed"
                  ? "Rejouer"
                  : "Reprendre";
            return (
              <article key={def.id} className="course-item">
                <span className="course-item-num" aria-hidden="true">
                  {def.order}
                </span>
                <div className="course-item-body">
                  <div className="course-item-top">
                    <span className="course-item-kicker">
                      Déclic {String(def.order).padStart(2, "0")}
                    </span>
                    <StatusChip status={status} />
                  </div>
                  <h2>
                    <MathText text={def.title} />
                  </h2>
                  <p className="course-item-meta">
                    ~{minutes} min · <MathText text={def.objective} />
                  </p>
                  {status === "needs_reinforcement" && (
                    <p className="course-item-note">
                      Quelques points se mélangent encore : la révision de ce Déclic va t’aider.
                    </p>
                  )}
                  <button
                    type="button"
                    className="declic-cta course-item-cta"
                    onClick={() => {
                      sfx.tap(state.soundOn);
                      setActive({ kind: "declic", id: def.id });
                    }}
                  >
                    {verb} <ArrowRight size={18} />
                  </button>
                  {courseSlides(def).length > 0 && (
                    <button
                      type="button"
                      className="declic-link course-item-link"
                      onClick={() => {
                        sfx.tap(state.soundOn);
                        setActive({ kind: "cours", id: def.id });
                      }}
                    >
                      Voir le cours
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {declics.map((def) => {
          const deck = getDeck(def.deckId);
          if (!deck) return null;
          const due = dueCards(deck, progress.reviewCards, now).length;
          const soonest = soonestDue(deck, progress.reviewCards);
          const seen = deck.cards.filter((c) => progress.reviewCards[c.id]).length;
          const mastered = progress.declics[def.id]?.masteryStatus === "mastered";
          return (
            <section key={deck.id} className="course-item course-item--deck">
              <span className="course-item-num" aria-hidden="true">
                <BookOpen size={20} />
              </span>
              <div className="course-item-body">
                <div className="course-item-top">
                  <span className="course-item-kicker">
                    Révision · Déclic {String(def.order).padStart(2, "0")}
                  </span>
                  {mastered && <StatusChip status="mastered" />}
                </div>
                <h2>
                  <MathText text={deck.title} />
                </h2>
                <p className="course-item-meta">
                  {deck.cards.length} cartes Carré / Intox ·{" "}
                  {seen === 0
                    ? "pas encore commencées"
                    : due > 0
                      ? `${due} à revoir`
                      : soonest
                        ? `prochaine révision dans ${daysUntil(soonest, now)} jour${daysUntil(soonest, now) > 1 ? "s" : ""}`
                        : "à jour"}
                </p>
                <button
                  type="button"
                  className="declic-cta course-item-cta"
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    setActive({ kind: "deck", id: deck.id });
                  }}
                >
                  Réviser <ArrowRight size={18} />
                </button>
              </div>
            </section>
          );
        })}

        <details className="course-coverage">
          <summary>Ce que couvre ce chapitre du programme officiel</summary>
          <ul>
            {report.map((r) => (
              <li key={r.mappingId}>
                <MathText text={r.requirement} />
                <small>
                  {r.mappingId} ·{" "}
                  {r.coveredBy.length === 0
                    ? "pas encore couvert"
                    : r.coveredBy
                        .map((c) => `${c.declicId} (${COVERAGE_LABEL[c.coverage]})`)
                        .join(", ")}
                </small>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
