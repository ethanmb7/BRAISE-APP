import { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
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
  const { state, openSubject, openLesson } = useApp();

  const subjects = useMemo(() => {
    const chosenSubjects = new Set(state.user.subjects);

    return SUBJECTS.map((subject) => {
      const chapters = resolveChapters(subject.chapters, state.completedChapters);
      const current = chapters.find((chapter) => chapter.status === "current");
      return { subject, current, isChosen: chosenSubjects.has(subject.id) };
    }).sort((a, b) => Number(b.isChosen) - Number(a.isChosen));
  }, [state.completedChapters, state.user.subjects]);

  const lastSubject = SUBJECTS.find((subject) => subject.id === state.lastSubjectId);
  const lastChapter = lastSubject
    ? resolveChapters(lastSubject.chapters, state.completedChapters).find(
        (chapter) => chapter.id === state.lastChapterId && chapter.status !== "done",
      )
    : undefined;

  return (
    <motion.main
      className="view is-active learn-view"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.header className="learn-play-hero" variants={item}>
        <div className="learn-play-copy">
          <span>Braise est chaud</span>
          <h1>Tu veux capter quoi&nbsp;?</h1>
          <p>Choisis ton terrain. On démonte le truc ensemble, tranquille.</p>
        </div>
        <div className="learn-play-mascot" aria-hidden="true">
          <BraiseMascot size={86} mood="happy" />
        </div>
      </motion.header>

      {lastSubject && lastChapter && (
        <motion.button
          type="button"
          className="learn-quick-resume"
          variants={item}
          onClick={() => {
            sfx.tap(state.soundOn);
            openLesson(lastSubject.id, lastChapter.id);
          }}
          aria-label={`Reprendre ${lastChapter.title}`}
        >
          <span className="learn-quick-resume-icon" aria-hidden="true">
            <Sparkles size={20} />
          </span>
          <span className="learn-quick-resume-copy">
            <small>On reprend&nbsp;?</small>
            <b>{lastChapter.title}</b>
          </span>
          <span className="learn-quick-resume-go" aria-hidden="true">
            Go
            <ArrowUpRight size={16} />
          </span>
        </motion.button>
      )}

      <motion.section className="learn-terrain" variants={item} aria-labelledby="learn-title">
        <div className="learn-terrain-head">
          <h2 id="learn-title">Choisis ton terrain</h2>
          <p>Tu touches, on y va.</p>
        </div>

        <div className="learn-terrain-grid">
          {subjects.map(({ subject, current, isChosen }) => (
            <button
              type="button"
              key={subject.id}
              className="learn-terrain-card"
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
              aria-label={`Ouvrir ${subject.name}${current ? `, ${current.title}` : ""}`}
            >
              {isChosen && <span className="learn-terrain-tag">Pour toi</span>}
              <span className="learn-terrain-icon" aria-hidden="true">
                <SubjectIcon subjectId={subject.id} color={subject.color} size={30} />
              </span>
              <b>{subject.name}</b>
              <small>{current?.title ?? "Tout est bouclé 🔥"}</small>
              <ArrowUpRight className="learn-terrain-arrow" size={19} aria-hidden="true" />
            </button>
          ))}
        </div>
      </motion.section>
    </motion.main>
  );
}
