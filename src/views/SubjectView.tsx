import { Check, Lock, AlertCircle, SkipForward, Clock3, ArrowRight } from "lucide-react";
import { useApp } from "@/store";
import { resolveChapters } from "@/lib/progress";
import { sfx } from "@/lib/sound";
import { TopBar } from "@/components/TopBar";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SUBJECTS, STORIES } from "@/data";
import { SubjectIcon } from "@/components/SubjectIcon";

// Every tap from Home lands here — this was still the pre-redesign soft/pastel skill path
// (thin grey border, pale circles) while everything upstream had moved to the neobrutalist
// system: hard black borders, flat saturated fills, pure-black text/icons on colour (verified
// safe at >=4.7:1 across all 6 subject hues, same finding as SubjectDecks). The zigzag path
// structure itself was already good — a real Duolingo-style route, not a flat list — so only
// the visual skin changes here, not the layout.
export function SubjectView() {
  const { state, goBack, openLesson } = useApp();
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);

  if (!subject) return null;

  const chapters = resolveChapters(subject.chapters, state.completedChapters);
  const doneCount = chapters.filter((c) => c.status === "done").length;
  const pct = Math.round((doneCount / chapters.length) * 100);

  const currentChapter = chapters.find((chapter) => chapter.status === "current");

  return (
    <div className="subject-path-page" style={{ "--subject-color": subject.color } as React.CSSProperties}>
      <TopBar
        title={subject.name}
        onBack={goBack}
        right={<span className="subject-top-progress">{doneCount}/{chapters.length}</span>}
      />
      <div className="view is-active subject-path-view">
        <section className="subject-path-hero">
          <div className="subject-path-icon">
            <SubjectIcon subjectId={subject.id} color={subject.color} size={34} />
          </div>
          <div className="subject-path-hero-copy">
            <span>Deck {subject.name}</span>
            <h2>{currentChapter ? currentChapter.title : "Parcours terminé"}</h2>
            <p>{currentChapter ? `${currentChapter.duration} min pour avancer` : "Tu as bouclé tous les cours."}</p>
          </div>
          <BraiseMascot size={70} mood={currentChapter ? "eager" : "proud"} />
          <div className="subject-path-meter" aria-label={`${pct}% du parcours terminé`}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </section>

        <div className="subject-path-section-title">
          <span>Ton parcours</span>
          <b>{doneCount}/{chapters.length} cours</b>
        </div>

        <div className="subject-path-list">
          <div aria-hidden="true" className="subject-path-rail" />

          {chapters.map((c, i) => {
            const isLocked = c.status === "locked";
            const isDone = c.status === "done";
            const isCurrent = c.status === "current";
            return (
              <button
                key={c.id}
                className={`subject-course-card ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  sfx.tap(state.soundOn);
                  openLesson(subject.id, c.id, STORIES[c.id] ? "vocal" : "echanger");
                }}
              >
                <span className="subject-course-number">
                  {isDone ? <Check size={20} strokeWidth={3} /> : isLocked ? <Lock size={16} /> : i + 1}
                </span>
                <span className="subject-course-copy">
                  <span className="subject-course-state">
                    {isDone ? "Terminé" : isCurrent ? "À faire maintenant" : "À débloquer"}
                  </span>
                  <b>{c.title}</b>
                  <span className="subject-course-meta">
                    <Clock3 size={13} aria-hidden="true" /> {c.duration} min
                    {isDone && <> · {c.mastery}% maîtrisé</>}
                  </span>
                    {c.reinforce && (
                      <span className="subject-course-flag is-reinforce">
                        <AlertCircle size={10} /> À renforcer
                      </span>
                    )}
                    {c.skip && (
                      <span className="subject-course-flag is-skip">
                        <SkipForward size={10} /> Passage rapide
                      </span>
                    )}
                </span>
                {!isLocked && <span className="subject-course-arrow"><ArrowRight size={18} strokeWidth={3} /></span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
