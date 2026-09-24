import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { SubjectDecks } from '@/components/SubjectDecks';
import { SUBJECTS } from '@/data';
import { sfx } from '@/lib/sound';
import { buildSubjectDecks, type SubjectDeck, useApp } from '@/store';

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

  const decks: SubjectDeck[] = buildSubjectDecks(state.completedChapters);

  const completed = decks.filter((deck) => deck.pct === 100).length;

  return (
    <div className="view is-active subjects-view">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.header variants={item} className="subjects-heading">
          <span className="subjects-heading-icon" aria-hidden="true"><BookOpen size={22} strokeWidth={2.7} /></span>
          <div>
            <p>Sans pression</p>
            <h1>Tes matières</h1>
            <span>Choisis ce que tu veux comprendre aujourd’hui.</span>
          </div>
        </motion.header>

        <motion.div variants={item} className="subjects-summary" aria-label={`${SUBJECTS.length} matières, ${completed} terminées`}>
          <span><BookOpen size={16} aria-hidden="true" /><b>{SUBJECTS.length}</b> matières</span>
          <span><CheckCircle2 size={16} aria-hidden="true" /><b>{completed}</b> terminée{completed > 1 ? 's' : ''}</span>
        </motion.div>

        <motion.div variants={item} className="mt-5">
          <SubjectDecks
            items={decks}
            onSelect={(id) => {
              sfx.tap(state.soundOn);
              const deck = decks.find((entry) => entry.id === id);
              openSubject(id, deck?.currentChapterId);
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
