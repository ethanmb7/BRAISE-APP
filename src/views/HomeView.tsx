import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/store";
import { computeGoalPct, remainingToGoal, resolveChapters } from "@/lib/progress";
import { sfx } from "@/lib/sound";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { buildLibrary } from "@/lib/catalog/catalog";
import { dueInLibrary } from "@/lib/world/resume";
import type { HubWorld } from "@/components/world/Hub";
import { fireConfetti } from "@/lib/confetti";
import { LevelSheet } from "@/components/LevelSheet";
import { HeaderHUD } from "@/components/HeaderHUD";
import { HeroPiocheCard } from "@/components/HeroPiocheCard";
import { MissedCardsBanner } from "@/components/MissedCardsBanner";
import { WorldsTeaser } from "@/components/world/WorldsTeaser";
import { BrakeCard, MomentSheet, NotifInvite } from "@/components/notifications/Reminders";
import { useReminders } from "@/components/notifications/useReminders";
import { frequencyFromGoal, isBraked } from "@/lib/notifications/model";
import { shouldInvite } from "@/lib/notifications/store";
import { useNotifState } from "@/lib/notifications/useNotifState";
import { TodayStrip } from "@/components/TodayStrip";
import { ShareAuraModal } from "@/components/ShareAuraModal";
import { SUBJECTS, FLASHCARDS, SUBJECT_SHORT_NAMES, FIRST_CHAPTER_ID } from "@/data";
import { dailyPickLine, getAgeGroup } from "@/lib/braiseVoice";
import { getRankInfo, countMasteredCards } from "@/lib/aura";
import { getIntoxDismissedCount, setIntoxDismissedCount } from "@/lib/celebrations";
import type { Level, Subject, Chapter } from "@/types";

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
  const { state, setTab, setView, openSubject, openLesson, setUser, getDueCards } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [intoxDismissedCount, setIntoxDismissedCountState] = useState(getIntoxDismissedCount);
  const prevGoalMet = useRef(state.dailyGoalMet);

  useEffect(() => {
    if (state.dailyGoalMet && !prevGoalMet.current) {
      fireConfetti();
    }
    prevGoalMet.current = state.dailyGoalMet;
  }, [state.dailyGoalMet]);

  const dueCount = getDueCards().length;

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
    setSheetOpen(false);
  };

  // Every subject's in-progress chapter — the pool today's Pioche is drawn from. No exam-date
  // field exists anywhere in the data model, so this deliberately isn't a fabricated "DS dans
  // 2 jours" countdown. (It used to be sorted by a per-chapter `mastery` that was always 0 for
  // an in-progress chapter, so the sort never did anything.)
  const priorityChapters: { subject: Subject; chapter: Chapter }[] = SUBJECTS.map((s) => {
    const chapter = resolveChapters(s.chapters, state.completedChapters).find(
      (c) => c.status === "current",
    );
    return chapter ? { subject: s, chapter } : null;
  }).filter((x): x is { subject: Subject; chapter: Chapter } => x !== null);

  // "Pioche du jour" — a real daily random draw across every subject's in-progress chapter,
  // not a "continue where you left off" shortcut: the same pool as "Chapitres prioritaires"
  // above, indexed by a hash of today's date so the pick is stable all day and changes
  // tomorrow. (The previous version just replayed state.lastSubjectId/lastChapterId, which is
  // a "continue" feature, not a draw — it's still tracked in the store for other uses, just no
  // longer what drives this card, since the product is explicitly framed as a daily draw.)
  const todaySeed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < todaySeed.length; i++) hash = (hash * 31 + todaySeed.charCodeAt(i)) >>> 0;
  // Day zero is not a draw: a student who has done nothing yet starts on the same, well-chosen
  // chapter, instead of possibly landing on whichever subject the date hash happens to select.
  const isFirstSession =
    state.completedChapters.length === 0 && Object.keys(state.cardReviews).length === 0;
  const firstPick = isFirstSession
    ? priorityChapters.find((p) => p.chapter.id === FIRST_CHAPTER_ID)
    : undefined;
  const dailyPick =
    firstPick ??
    (priorityChapters.length > 0 ? priorityChapters[hash % priorityChapters.length] : null);
  const currentSubject = dailyPick?.subject;
  const currentChapter = dailyPick?.chapter;
  // Real per-chapter deck size (FLASHCARDS filtered by chapterId) — the card used to show a
  // fixed "10 cartes" for every chapter; every chapter actually has its own real count.
  const currentChapterCardCount = currentChapter
    ? FLASHCARDS.filter((c) => c.chapterId === currentChapter.id).length
    : 0;
  // Real count of cards whose last swipe-judge verdict was wrong — reviewCard() writes
  // 'not-sure' on an incorrect judgment (RevisionsView), never anything invented here.
  const missedCardsCount = Object.values(state.cardReviews).filter(
    (r) => r.lastConfidence === "not-sure",
  ).length;
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
      ? dailyPickLine(
          voiceCtx,
          state.user.name,
          currentSubject.name,
          currentChapter.title,
          currentChapter.duration,
        )
      : `${state.user.name}, série de ${state.streak} jours. On lâche rien !`;

  // The way into the courses: one small world per subject, with a pastille where notions are waiting for
  // a refresh. The wording follows where the student stands, never an alarm.
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  const worlds: HubWorld[] = SUBJECTS.map((s) => {
    const library = buildLibrary(s.id, {
      completedChapters: state.completedChapters,
      cardReviews: state.cardReviews,
      course: courseProgress,
      now: Date.now(),
    });
    return {
      id: s.id,
      name: s.name,
      shortName: SUBJECT_SHORT_NAMES[s.id] ?? s.name,
      color: s.color,
      due: library ? dueInLibrary(library) : 0,
      suggested: false,
    };
  });
  const dueTotal = worlds.reduce((sum, w) => sum + w.due, 0);
  const startedAny =
    state.completedChapters.length > 0 || Object.keys(state.cardReviews).length > 0;
  const teaserSays =
    dueTotal > 0
      ? t(COPY.world.teaserDue(dueTotal))
      : startedAny
        ? t(COPY.world.teaserBack)
        : t(COPY.world.teaserNew);

  // Braise asks, once the student has had a taste of the app, if she can come and see them; and when her
  // messages went unanswered three times, she says she went quiet. Never both, never twice in a row.
  const notif = useNotifState();
  const { enable } = useReminders();
  const [momentOpen, setMomentOpen] = useState(false);
  const tasted =
    state.completedChapters.length > 0 ||
    Object.keys(state.cardReviews).length >= 5 ||
    Object.values(courseProgress.declics).some((d) => d.completionStatus === "completed");
  const braked = notif.prefs.enabled && isBraked(notif.history, notif.opens, Date.now());
  const invite = !braked && shouldInvite(notif, tasted, Date.now());

  // Same derivation as ProfilAuraView's own share button — real distinct-subjects-reviewed
  // count from card review history, not a second, possibly-diverging computation.
  const subjectsCount = new Set(
    Object.keys(state.cardReviews)
      .map((id) => FLASHCARDS.find((c) => c.id === id)?.subject)
      .filter(Boolean),
  ).size;
  const masteredCards = countMasteredCards(state.cardReviews);
  const rank = getRankInfo(state.xp).current;

  return (
    <>
      <div className="view is-active home-view pt-3">
        {!state.user.level && (
          <div className="setup-banner">Configure ton niveau pour des leçons sur mesure.</div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4 pb-8"
        >
          <motion.div variants={staggerItem}>
            <HeaderHUD
              name={state.user.name}
              avatar={state.user.avatar}
              streak={state.streak}
              xp={state.xp}
              onAvatarClick={() => setView("profile")}
              onAuraClick={() => {
                sfx.tap(state.soundOn);
                setTab("progres");
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="home-mission-zone">
            <HeroPiocheCard
              bubbleLine={bubbleLine}
              subjectName={currentSubject ? SUBJECT_SHORT_NAMES[currentSubject.id] : undefined}
              subjectColor={currentSubject?.color}
              chapterTitle={currentChapter?.title ?? "Leçon du jour"}
              duration={currentChapter?.duration ?? 0}
              cardCount={currentChapterCardCount}
              soundOn={state.soundOn}
              onStart={() => {
                if (currentSubject && currentChapter)
                  openLesson(currentSubject.id, currentChapter.id);
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
              onContinue={() => {
                sfx.tap(state.soundOn);
                setTab("revisions");
              }}
              onShare={() => {
                sfx.tap(state.soundOn);
                if (navigator.vibrate) navigator.vibrate(10);
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
                  setTab("revisions");
                }}
                onDismiss={handleDismissIntox}
              />
            </motion.div>
          )}

          {(braked || invite) && (
            <motion.div variants={staggerItem}>
              {braked ? <BrakeCard /> : <NotifInvite onAccept={() => setMomentOpen(true)} />}
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="space-y-3">
            <div>
              <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.13em] text-[var(--ink-soft)]">
                Apprendre
              </span>
              <h2 className="font-display text-[1.15rem] font-extrabold leading-tight text-[var(--ink)]">
                Tes cours
              </h2>
            </div>
            <WorldsTeaser
              worlds={worlds}
              says={teaserSays}
              onOpenAll={() => {
                sfx.tap(state.soundOn);
                setTab("subjects");
              }}
              onOpenSubject={(id) => {
                sfx.tap(state.soundOn);
                openSubject(id);
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {momentOpen && (
        <MomentSheet
          initial={{ ...notif.prefs, frequency: frequencyFromGoal(state.user.goal) }}
          confirmLabel="Activer les rappels"
          onClose={() => setMomentOpen(false)}
          onConfirm={(prefs) => {
            setMomentOpen(false);
            void enable(prefs);
          }}
        />
      )}

      <LevelSheet
        open={sheetOpen}
        current={state.user.level}
        onSelect={handleLevel}
        onClose={() => setSheetOpen(false)}
      />

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
