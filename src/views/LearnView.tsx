import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { BookOpenText, CalendarDays, Clock3, Search, Sparkles, X } from "lucide-react";
import { SUBJECTS } from "@/data";
import { resolveChapters, useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { SubjectIcon } from "@/components/SubjectIcon";
import { BraiseMascot } from "@/components/BraiseMascot";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export function LearnView() {
  const { state, openSubject, openLesson, setTab } = useApp();
  const [query, setQuery] = useState("");
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [examSubjectId, setExamSubjectId] = useState(state.user.subjects[0] ?? SUBJECTS[0].id);

  const subjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return SUBJECTS.map((subject) => {
      const chapters = resolveChapters(subject.chapters, state.completedChapters);
      const current = chapters.find((chapter) => chapter.status === "current");
      const done = chapters.filter((chapter) => chapter.status === "done").length;
      return { subject, chapters, current, done };
    }).filter(({ subject, chapters }) => {
      if (!normalizedQuery) return true;
      return [subject.name, ...chapters.map((chapter) => chapter.title)].some((label) =>
        label.toLocaleLowerCase("fr").includes(normalizedQuery),
      );
    });
  }, [query, state.completedChapters]);

  const lastSubject = SUBJECTS.find((subject) => subject.id === state.lastSubjectId);
  const lastChapter = lastSubject?.chapters.find((chapter) => chapter.id === state.lastChapterId);
  const missedCount = Object.values(state.cardReviews).filter(
    (review) => review.lastConfidence === "not-sure",
  ).length;

  const startExamSession = () => {
    const subject = SUBJECTS.find((item) => item.id === examSubjectId);
    if (!subject) return;
    const current = resolveChapters(subject.chapters, state.completedChapters).find(
      (chapter) => chapter.status === "current",
    );
    if (!current) return;
    sfx.tap(state.soundOn);
    openLesson(subject.id, current.id);
  };

  return (
    <motion.main
      className="view is-active learn-view"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.header className="learn-heading" variants={item}>
        <div>
          <span className="learn-eyebrow">Ton espace pour comprendre</span>
          <h1>Qu'est-ce qu'on débloque ?</h1>
          <p>Choisis une notion. Braise change d'explication jusqu'à ce que ça clique.</p>
        </div>
        <div className="learn-heading-mascot" aria-hidden="true">
          <BraiseMascot size={62} mood="happy" />
        </div>
      </motion.header>

      <motion.label className="learn-search" variants={item}>
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Rechercher une matière ou un chapitre</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Une notion, un chapitre, une matière..."
        />
      </motion.label>

      {lastSubject && lastChapter && !query && (
        <motion.section
          className="learn-resume"
          variants={item}
          aria-labelledby="learn-resume-title"
        >
          <div className="learn-resume-icon" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div className="learn-resume-copy">
            <span>Reprendre là où tu étais</span>
            <h2 id="learn-resume-title">{lastChapter.title}</h2>
            <p>
              {lastSubject.name} · {lastChapter.duration} min
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sfx.tap(state.soundOn);
              openLesson(lastSubject.id, lastChapter.id);
            }}
            aria-label={`Reprendre ${lastChapter.title}`}
          >
            Continuer
          </button>
        </motion.section>
      )}

      {!query && (
        <motion.div className="learn-tools" variants={item} aria-label="Outils d'apprentissage">
          <button type="button" onClick={() => setTab("revisions")}>
            <span className="learn-tool-icon is-mistake">
              <Sparkles size={19} />
            </span>
            <span>
              <b>Revoir mes erreurs</b>
              <small>{missedCount ? `${missedCount} à retravailler` : "Tout est à jour"}</small>
            </span>
          </button>
          <button
            type="button"
            aria-expanded={plannerOpen}
            onClick={() => {
              sfx.tap(state.soundOn);
              setPlannerOpen(true);
            }}
          >
            <span className="learn-tool-icon is-exam">
              <Clock3 size={19} />
            </span>
            <span>
              <b>Préparer un contrôle</b>
              <small>Créer une session ciblée</small>
            </span>
          </button>
        </motion.div>
      )}

      {plannerOpen && !query && (
        <motion.section
          className="learn-planner"
          variants={item}
          initial="hidden"
          animate="show"
          aria-labelledby="planner-title"
        >
          <div className="learn-planner-head">
            <span className="learn-tool-icon is-exam" aria-hidden="true">
              <CalendarDays size={19} />
            </span>
            <div>
              <span>Session ciblée</span>
              <h2 id="planner-title">Préparer un contrôle</h2>
            </div>
            <button type="button" onClick={() => setPlannerOpen(false)} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
          <label>
            <span>Matière</span>
            <select
              value={examSubjectId}
              onChange={(event) => setExamSubjectId(event.target.value)}
            >
              {SUBJECTS.filter(
                (subject) =>
                  !state.user.subjects.length || state.user.subjects.includes(subject.id),
              ).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <p>
            Braise commence par la prochaine notion de cette matière, sans chrono imposé. Tu peux
            t'arrêter après chaque étape.
          </p>
          <button type="button" className="learn-planner-start" onClick={startExamSession}>
            Commencer ma session
          </button>
        </motion.section>
      )}

      <motion.section
        className="learn-subjects"
        variants={item}
        aria-labelledby="learn-subjects-title"
      >
        <div className="learn-section-title">
          <div>
            <span>{query ? "Résultats" : "Explorer"}</span>
            <h2 id="learn-subjects-title">Tes matières</h2>
          </div>
          <BookOpenText size={22} aria-hidden="true" />
        </div>

        {subjects.length ? (
          <div className="learn-subject-grid">
            {subjects.map(({ subject, chapters, current, done }) => {
              const progress = Math.round((done / chapters.length) * 100);
              return (
                <button
                  type="button"
                  key={subject.id}
                  className="learn-subject-card"
                  style={
                    {
                      "--subject-color": subject.color,
                      "--subject-bg": subject.bg,
                    } as CSSProperties
                  }
                  onClick={() => {
                    sfx.tap(state.soundOn);
                    openSubject(subject.id, current?.id);
                  }}
                >
                  <span className="learn-subject-icon" aria-hidden="true">
                    <SubjectIcon subjectId={subject.id} color={subject.color} size={28} />
                  </span>
                  <span className="learn-subject-copy">
                    <b>{subject.name}</b>
                    <small>{current ? `À voir · ${current.title}` : "Parcours terminé"}</small>
                    <span
                      className="learn-progress"
                      aria-label={`${progress}% du parcours terminé`}
                    >
                      <i style={{ width: `${progress}%` }} />
                    </span>
                  </span>
                  <span className="learn-subject-count">
                    {done}/{chapters.length}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="learn-empty">
            <BraiseMascot size={46} mood="hesitant" />
            <b>Je n'ai rien trouvé</b>
            <p>Essaie le nom d'une matière ou d'un chapitre.</p>
          </div>
        )}
      </motion.section>
    </motion.main>
  );
}
