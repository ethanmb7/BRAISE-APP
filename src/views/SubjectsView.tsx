import { motion } from "framer-motion";
import { BookOpen, Layers3 } from "lucide-react";
import { SubjectDecks, type SubjectDeckItem } from "@/components/SubjectDecks";
import { BraiseMascot } from "@/components/BraiseMascot";
import { SUBJECTS } from "@/data";
import { sfx } from "@/lib/sound";
import { useApp } from "@/store";
import { resolveChapters } from "@/lib/progress";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

/** The voluntary exploration space: Home recommends; Matières lets the student choose. */
export function SubjectsView() {
  const { state, openSubject } = useApp();

  const decks: SubjectDeckItem[] = SUBJECTS.map((subject) => {
    const chapters = resolveChapters(subject.chapters, state.completedChapters);
    const doneCount = chapters.filter((chapter) => chapter.status === "done").length;
    const currentIndex = chapters.findIndex((chapter) => chapter.status === "current");
    const current = currentIndex >= 0 ? chapters[currentIndex] : null;

    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      pct: Math.round((doneCount / chapters.length) * 100),
      level: currentIndex >= 0 ? currentIndex + 1 : chapters.length,
      chapterLabel: current?.title.replace(/^(les |la |le |l')/i, "") ?? "Parcours terminé",
      chapterCount: chapters.length,
      doneCount,
      duration: current?.duration ?? null,
    };
  });

  const completed = decks.filter((deck) => deck.pct === 100).length;

  return (
    <div className="view is-active subjects-view">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.header variants={item} className="subjects-heading subjects-collector-heading">
          <div className="subjects-heading-copy">
            <p><Layers3 size={13} aria-hidden="true" /> Collection de cours</p>
            <h1>Choisis ton deck.</h1>
            <span>Une matière, un cours rapide, un vrai déclic.</span>
          </div>
          <div className="subjects-braise" aria-hidden="true">
            <span className="subjects-braise-bubble">Tu prends quoi ?</span>
            <BraiseMascot size={76} mood="eager" />
          </div>
        </motion.header>

        <motion.div
          variants={item}
          className="subjects-summary"
          aria-label={`${SUBJECTS.length} matières, ${completed} terminées`}
        >
          <span><BookOpen size={16} aria-hidden="true" /><b>{SUBJECTS.length}</b> decks</span>
          <span><b>{completed}/{SUBJECTS.length}</b> terminés</span>
        </motion.div>

        <motion.div variants={item} className="subjects-decks-zone">
          <SubjectDecks
            items={decks}
            onSelect={(id) => {
              sfx.tap(state.soundOn);
              const deck = decks.find((entry) => entry.id === id);
              const subject = SUBJECTS.find((entry) => entry.id === id);
              const chapter =
                subject && deck
                  ? resolveChapters(subject.chapters, state.completedChapters).find(
                      (entry) => entry.status === "current",
                    )
                  : null;
              openSubject(id, chapter?.id);
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
