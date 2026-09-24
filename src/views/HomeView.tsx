import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp, buildSubjectDecks, computeGoalPct, remainingToGoal, resolveChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';
import { HeaderHUD } from '@/components/HeaderHUD';
import { HeroPiocheCard } from '@/components/HeroPiocheCard';
import { MissedCardsBanner } from '@/components/MissedCardsBanner';
import { SubjectDecks } from '@/components/SubjectDecks';
import { TodayStrip } from '@/components/TodayStrip';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { SUBJECTS, FLASHCARDS } from '@/data';
import { dailyPickLine, headerGreeting, getAgeGroup } from '@/lib/braiseVoice';
import { getRankInfo, countMasteredCards, countSubjectsReviewed } from '@/lib/aura';
import { getIntoxDismissedCount, setIntoxDismissedCount } from '@/lib/celebrations';
import type { Subject, Chapter } from '@/types';

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
  const { state, setTab, setView, openSubject, openLesson, getDueCards } = useApp();
  const [shareOpen, setShareOpen] = useState(false);
  const [intoxDismissedCount, setIntoxDismissedCountState] = useState(getIntoxDismissedCount);
  const prevGoalMet = useRef(state.dailyGoalMet);

  useEffect(() => {
    if (state.dailyGoalMet && !prevGoalMet.current) {
      fireConfetti();
      // Same cue as a badge or rank unlock (useMilestoneCelebrations) — this was visual-only
      // before, the one celebratory moment in the app with no sound or haptic behind it.
      sfx.complete(state.soundOn);
    }
    prevGoalMet.current = state.dailyGoalMet;
  }, [state.dailyGoalMet]);

  const dueCount = getDueCards().length;

  // "Chapitres prioritaires" — every subject's in-progress chapter, ranked by real mastery
  // (lowest first). No exam-date field exists anywhere in the data model, so this deliberately
  // isn't a fabricated "DS dans 2 jours" countdown — mastery % and the reinforce flag are the
  // real signals already tracked per chapter.
  const priorityChapters: { subject: Subject; chapter: Chapter }[] = SUBJECTS.map((s) => {
    const chapter = resolveChapters(s.chapters, state.completedChapters).find((c) => c.status === 'current');
    return chapter ? { subject: s, chapter } : null;
  })
    .filter((x): x is { subject: Subject; chapter: Chapter } => x !== null)
    .sort((a, b) => a.chapter.mastery - b.chapter.mastery);

  // "Pioche du jour" — a real daily random draw across every subject's in-progress chapter,
  // not a "continue where you left off" shortcut: the same pool as "Chapitres prioritaires"
  // above, indexed by a hash of today's date so the pick is stable all day and changes
  // tomorrow. (The previous version just replayed state.lastSubjectId/lastChapterId, which is
  // a "continue" feature, not a draw — it's still tracked in the store for other uses, just no
  // longer what drives this card, since the product is explicitly framed as a daily draw.)
  const todaySeed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < todaySeed.length; i++) hash = (hash * 31 + todaySeed.charCodeAt(i)) >>> 0;
  const dailyPick = priorityChapters.length > 0 ? priorityChapters[hash % priorityChapters.length] : null;
  const currentSubject = dailyPick?.subject;
  const currentChapter = dailyPick?.chapter;
  // Real per-chapter deck size (FLASHCARDS filtered by chapterId) — the card used to show a
  // fixed "10 cartes" for every chapter; every chapter actually has its own real count.
  const currentChapterCardCount = currentChapter
    ? FLASHCARDS.filter((c) => c.chapterId === currentChapter.id).length
    : 0;
  // Real count of cards whose last swipe-judge verdict was wrong — reviewCard() writes
  // 'not-sure' on an incorrect judgment (RevisionsView), never anything invented here.
  const missedCardsCount = Object.values(state.cardReviews).filter((r) => r.lastConfidence === 'not-sure').length;
  // Dismissing the banner hides it at the count it was dismissed at — it reappears the moment a
  // NEW card gets missed and the real count climbs past that, not gone for good.
  const showIntoxBanner = missedCardsCount > intoxDismissedCount;
  const handleDismissIntox = () => {
    sfx.tap(state.soundOn);
    setIntoxDismissedCount(missedCardsCount);
    setIntoxDismissedCountState(missedCardsCount);
  };

  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const bubbleLine =
    currentSubject && currentChapter
      ? dailyPickLine(voiceCtx, state.user.name, currentSubject.name, currentChapter.title, currentChapter.duration)
      : `${state.user.name}, série de ${state.streak} jours. On lâche rien !`;

  // Each card's "Niv." is the current chapter's real position in the subject's own sequence
  // (no separate per-subject level field exists), and its label is that chapter's own title
  // with a leading article stripped for brevity — real data, never a generated sentence, and
  // never truncated with an ellipsis. "Maths" is the only display shortening on the subject
  // name itself (same subject, casual form) — every other name is the real one, shown in full.
  //
  // Sorted by the current chapter's own mastery, lowest first: this grid now does the job that
  // "Chapitres prioritaires" used to do as a separate carousel — same data (every subject's
  // current chapter), it was never two different things, just the same list shown twice.
  const SHORT_SUBJECT_NAME: Record<string, string> = { maths: 'Maths' };
  const subjectDecks = buildSubjectDecks(state.completedChapters).map((d) => {
    return {
      ...d,
      name: SHORT_SUBJECT_NAME[d.id] ?? d.name,
      // Same subject the hero card above already names as today's draw — surfacing it first
      // here too, instead of leaving the grid to sort purely on mastery, matters most on a
      // fresh account: a real new user's 6 decks all tie at 0% mastery (see resolveChapters),
      // so without this every card looks interchangeable and nothing says where to start.
      isDailyPick: d.id === currentSubject?.id,
    };
  }).sort((a, b) => Number(b.isDailyPick) - Number(a.isDailyPick) || a.currentMastery - b.currentMastery);

  const goToChapter = (subjectId: string, chapterId?: string) => {
    sfx.tap(state.soundOn);
    openSubject(subjectId, chapterId);
  };

  const subjectsCount = countSubjectsReviewed(state.cardReviews);
  const masteredCards = countMasteredCards(state.cardReviews);
  const rank = getRankInfo(state.xp).current;

  return (
    <>
      <div className="view is-active home-view pt-3">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4 pb-8">
          <motion.div variants={staggerItem}>
            <HeaderHUD
              name={state.user.name}
              avatar={state.user.avatar}
              streak={state.streak}
              xp={state.xp}
              greeting={headerGreeting(voiceCtx)}
              onAvatarClick={() => setView('profile')}
              onAuraClick={() => {
                sfx.tap(state.soundOn);
                setTab('progres');
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="home-mission-zone">
            <HeroPiocheCard
              bubbleLine={bubbleLine}
              subjectName={currentSubject?.name}
              subjectColor={currentSubject?.color}
              chapterTitle={currentChapter?.title ?? 'Leçon du jour'}
              duration={currentChapter?.duration ?? 0}
              cardCount={currentChapterCardCount}
              soundOn={state.soundOn}
              onStart={() => {
                if (currentSubject && currentChapter) openLesson(currentSubject.id, currentChapter.id);
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <TodayStrip
              streak={state.streak}
              dailyGoalMet={state.dailyGoalMet}
              remaining={remainingToGoal(state)}
              goalPct={computeGoalPct(state)}
              dueCount={dueCount}
              freezes={state.freezes}
              hasPriorActivity={state.xp > 0 || state.completedChapters.length > 0}
              voiceCtx={voiceCtx}
              onContinue={() => {
                sfx.tap(state.soundOn);
                setTab('revisions');
              }}
              onShare={() => {
                sfx.tap(state.soundOn);
                setShareOpen(true);
              }}
            />
          </motion.div>

          {showIntoxBanner && (
            <motion.div variants={staggerItem}>
              <MissedCardsBanner
                count={missedCardsCount}
                onOpen={() => {
                  sfx.tap(state.soundOn);
                  setTab('revisions');
                }}
                onDismiss={handleDismissIntox}
              />
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.13em] text-[var(--ink-soft)]">Accès rapide</span>
                <h2 className="font-display text-[1.15rem] font-extrabold leading-tight text-[var(--ink)]">Tes matières</h2>
              </div>
              <button type="button" onClick={() => setTab('subjects')} className="text-xs font-black text-[var(--neo-orange)]">Tout voir →</button>
            </div>
            <SubjectDecks
              items={subjectDecks.slice(0, 2)}
              onSelect={(id) => {
                const deck = subjectDecks.find((d) => d.id === id);
                goToChapter(id, deck?.currentChapterId);
              }}
            />
          </motion.div>

        </motion.div>
      </div>

      {shareOpen && (
        <ShareAuraModal
          rank={rank}
          streak={state.streak}
          xp={state.xp}
          subjectsCount={subjectsCount}
          masteredCards={masteredCards}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
