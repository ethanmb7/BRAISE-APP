import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';
import { LevelSheet } from '@/components/LevelSheet';
import { HeaderHUD } from '@/components/HeaderHUD';
import { HeroPiocheCard } from '@/components/HeroPiocheCard';
import { PriorityExams } from '@/components/PriorityExams';
import { DecksGrid } from '@/components/DecksGrid';
import { SUBJECTS } from '@/data';
import { dailyPickLine, getAgeGroup } from '@/lib/braiseVoice';
import type { Level, Subject, Chapter } from '@/types';

// Same choreography language as Ton Aura: a calm stagger fade for each block.
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
};

export function HomeView() {
  const { state, setTab, setView, openSubject, setUser, toggleFreeze, getDueCards } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bump, setBump] = useState<'streak' | 'xp' | null>(null);
  const prevGoalMet = useRef(state.dailyGoalMet);

  useEffect(() => {
    if (state.dailyGoalMet && !prevGoalMet.current) {
      fireConfetti();
    }
    prevGoalMet.current = state.dailyGoalMet;
  }, [state.dailyGoalMet]);

  const dueCount = getDueCards().length;

  const fireStreak = () => {
    sfx.streak(state.soundOn);
    setBump('streak');
    setTimeout(() => setBump(null), 300);
  };

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
    setSheetOpen(false);
  };

  const lastSubject = state.lastSubjectId ? SUBJECTS.find((s) => s.id === state.lastSubjectId) : null;
  const lastChapter = lastSubject?.chapters.find((c) => c.id === state.lastChapterId);
  const fallbackSubject = SUBJECTS.find((s) => s.chapters.some((c) => c.status === 'current'));
  const fallbackChapter = fallbackSubject?.chapters.find((c) => c.status === 'current');
  const currentSubject = lastSubject && lastChapter ? lastSubject : fallbackSubject;
  const currentChapter = lastSubject && lastChapter ? lastChapter : fallbackChapter;

  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const bubbleLine =
    currentSubject && currentChapter
      ? dailyPickLine(voiceCtx, currentSubject.name, currentChapter.title)
      : `Série de ${state.streak} jours. On lâche rien !`;

  // "Chapitres prioritaires" — every subject's in-progress chapter, ranked by real mastery
  // (lowest first). No exam-date field exists anywhere in the data model, so this deliberately
  // isn't a fabricated "DS dans 2 jours" countdown — mastery % and the reinforce flag are the
  // real signals already tracked per chapter.
  const priorityChapters: { subject: Subject; chapter: Chapter }[] = SUBJECTS.map((s) => {
    const chapter = s.chapters.find((c) => c.status === 'current');
    return chapter ? { subject: s, chapter } : null;
  })
    .filter((x): x is { subject: Subject; chapter: Chapter } => x !== null)
    .sort((a, b) => a.chapter.mastery - b.chapter.mastery);

  const priorityItems = priorityChapters.map(({ subject, chapter }) => ({
    id: chapter.id,
    title: chapter.title,
    subjectName: subject.name,
    subjectEmoji: subject.emoji,
    subjectColor: subject.color,
    mastery: chapter.mastery,
    reinforce: !!chapter.reinforce,
  }));

  const decks = SUBJECTS.map((s) => {
    const doneCount = s.chapters.filter((c) => c.status === 'done').length;
    const pct = Math.round((doneCount / s.chapters.length) * 100);
    return {
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      color: s.color,
      pct,
      reinforce: s.chapters.some((c) => c.status === 'current' && c.reinforce),
    };
  });

  const goToChapter = (subjectId: string, chapterId?: string) => {
    sfx.tap(state.soundOn);
    openSubject(subjectId, chapterId);
  };

  return (
    <>
      <div className="view is-active" style={{ paddingTop: 16 }}>
        {!state.user.level && (
          <div className="setup-banner">Configure ton niveau pour des leçons sur mesure.</div>
        )}

        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.div variants={staggerItem}>
            <HeaderHUD
              avatar={state.user.avatar}
              streak={state.streak}
              xp={state.xp}
              freezes={state.freezes}
              freezeArmed={state.freezeArmed}
              streakBumped={bump === 'streak'}
              hasAlert={dueCount > 0}
              onAvatarClick={() => setView('profile')}
              onStreakClick={fireStreak}
              onAuraClick={() => {
                sfx.tap(state.soundOn);
                setTab('progres');
              }}
              onFreezeClick={() => {
                sfx.tap(state.soundOn);
                toggleFreeze();
              }}
              onBellClick={() => {
                sfx.tap(state.soundOn);
                setTab('revisions');
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="mt-4">
            <HeroPiocheCard
              bubbleLine={bubbleLine}
              subjectName={currentSubject?.name}
              subjectColor={currentSubject?.color}
              subjectEmoji={currentSubject?.emoji}
              needsReinforce={!!currentChapter?.reinforce}
              chapterTitle={currentChapter?.title ?? 'Leçon du jour'}
              durationMin={currentChapter?.duration}
              onStart={() => {
                sfx.whoosh(state.soundOn);
                if (currentSubject && currentChapter) openSubject(currentSubject.id, currentChapter.id);
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="mb-2 mt-5 font-display text-base font-extrabold text-[var(--ink)]">
            Chapitres prioritaires
          </motion.div>
          <motion.div variants={staggerItem}>
            <PriorityExams
              items={priorityItems}
              onSelect={(chapterId) => {
                const found = priorityChapters.find((p) => p.chapter.id === chapterId);
                if (found) goToChapter(found.subject.id, found.chapter.id);
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="mb-2 mt-5 font-display text-base font-extrabold text-[var(--ink)]">
            Tes decks
          </motion.div>
          <motion.div variants={staggerItem}>
            <DecksGrid decks={decks} onSelect={(id) => goToChapter(id)} />
          </motion.div>

          <motion.div variants={staggerItem} className="mt-4 text-center">
            <button
              onClick={() => setView('settings')}
              className="inline-flex items-center gap-1.5 text-[0.8rem] text-[var(--ink-soft)]"
            >
              <ChevronRight size={14} /> Paramètres
            </button>
          </motion.div>
        </motion.div>
      </div>

      <LevelSheet open={sheetOpen} current={state.user.level} onSelect={handleLevel} onClose={() => setSheetOpen(false)} />
    </>
  );
}
