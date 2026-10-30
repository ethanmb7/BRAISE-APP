import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { COPY } from "@/lib/copy";
import { useTone } from "@/lib/useTone";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { buildLibrary, type Library } from "@/lib/catalog/catalog";
import { dueInLibrary, pickGlobalResume, verbFor } from "@/lib/world/resume";
import { focusSubjectId } from "@/lib/world/soon";
import { Hub, type HubWorld } from "@/components/world/Hub";
import { fireConfetti } from "@/lib/confetti";
import { LevelSheet } from "@/components/LevelSheet";
import { HeaderHUD } from "@/components/HeaderHUD";
import { HeroPiocheCard } from "@/components/HeroPiocheCard";
import { DueCard } from "@/components/DueCard";
import { BrakeCard, MomentSheet, NotifInvite } from "@/components/notifications/Reminders";
import { useReminders } from "@/components/notifications/useReminders";
import { frequencyFromGoal, isBraked } from "@/lib/notifications/model";
import { shouldInvite } from "@/lib/notifications/store";
import { useNotifState } from "@/lib/notifications/useNotifState";
import { PrepareCard } from "@/components/PrepareCard";
import { PrepareSheet } from "@/components/PrepareSheet";
import { SUBJECTS, SUBJECT_SHORT_NAMES } from "@/data";
import { getIntoxDismissedCount, setIntoxDismissedCount } from "@/lib/celebrations";
import type { Level } from "@/types";

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
  const { state, setTab, setView, openSubject, openLesson, setUser, setSoon } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prepareOpen, setPrepareOpen] = useState(false);
  const [intoxDismissedCount, setIntoxDismissedCountState] = useState(getIntoxDismissedCount);
  const prevGoalMet = useRef(state.dailyGoalMet);

  useEffect(() => {
    if (state.dailyGoalMet && !prevGoalMet.current) {
      fireConfetti();
    }
    prevGoalMet.current = state.dailyGoalMet;
  }, [state.dailyGoalMet]);

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
    setSheetOpen(false);
  };

  // The way into the courses: one small world per subject, with a pastille where notions are waiting for
  // a refresh. The wording follows where the student stands, never an alarm.
  const { t } = useTone();
  const courseProgress = useCourseProgress();
  const libraries = SUBJECTS.map((s) =>
    buildLibrary(s.id, {
      completedChapters: state.completedChapters,
      cardReviews: state.cardReviews,
      chapterOpenedAt: state.chapterOpenedAt,
      course: courseProgress,
      now: Date.now(),
    }),
  ).filter((l): l is Library => l !== null);

  // Today's mission is what Braise would point at in "Où on va ?": the same ladder, the same function,
  // so the two screens never give different advice (a Déclic touched in the last two days, a review
  // that has come due, a point that mixes up, an older Déclic, then something new). Nothing is drawn
  // at random any more; on day zero the ladder lands on the first chapter of the first subject.
  // The subject a test is coming in, if the student said so (the one whose date is first).
  const focusId = focusSubjectId(state.soonBy, Date.now());
  const prepSubject = SUBJECTS.find((s) => s.id === focusId) ?? null;
  const pick = pickGlobalResume(libraries, state.lastSubjectId, focusId);
  const currentSubject = pick ? SUBJECTS.find((s) => s.id === pick.subjectId) : undefined;
  const currentEntry = pick?.resume.entry;
  const resuming = pick?.resume.reason === "resume" && pick.resume.fresh === true;
  // Read to screen readers only, for now: why Braise points here, in the words she uses in "Où on va ?".
  const reason = pick?.resume.reason;
  const says =
    !pick || !reason
      ? t(COPY.library.allSet)
      : reason === "review"
        ? t(COPY.library.reviewSays(pick.resume.entry.dueCount))
        : t(COPY.library.resumeSays[reason]);
  const bubbleLine =
    currentSubject && currentEntry
      ? `${says} ${currentEntry.title}, ${currentSubject.name}, ${currentEntry.minutes} minutes.`
      : says;

  const worlds: HubWorld[] = SUBJECTS.map((s) => {
    const library = libraries.find((l) => l.subjectId === s.id);
    return {
      id: s.id,
      name: s.name,
      shortName: SUBJECT_SHORT_NAMES[s.id] ?? s.name,
      color: s.color,
      due: library ? dueInLibrary(library) : 0,
      suggestion:
        pick?.subjectId === s.id && pick.resume
          ? { verb: verbFor(pick.resume), chapter: pick.resume.entry.title }
          : undefined,
    };
  });
  // One number for what is waiting: the sum of the pastilles on the worlds. The card under the rhythm, the
  // caption of the worlds and the strip all say this same number, so the page never gives two.
  const dueTotal = worlds.reduce((sum, w) => sum + w.due, 0);
  // Dismissing the card hides it at the count it was dismissed at: it comes back when more notions are
  // waiting than then, not gone for good.
  const showDueCard = dueTotal > intoxDismissedCount;
  const handleDismissDue = () => {
    sfx.tap(state.soundOn);
    setIntoxDismissedCount(dueTotal);
    setIntoxDismissedCountState(dueTotal);
  };
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

  return (
    <>
      <div className="view is-active home-view pt-3">
        {!state.user.level && <div className="setup-banner">Dis-moi ton niveau, je m'adapte.</div>}

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
              chapterTitle={currentEntry?.title ?? "Ta mission du jour"}
              duration={currentEntry?.minutes ?? 0}
              cardCount={currentEntry?.cards ?? 0}
              resuming={resuming}
              soundOn={state.soundOn}
              onStart={() => {
                if (currentSubject && currentEntry)
                  openLesson(currentSubject.id, currentEntry.chapterId);
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <PrepareCard
              subject={prepSubject}
              onAsk={() => {
                sfx.tap(state.soundOn);
                setPrepareOpen(true);
              }}
              onPrepare={() => {
                sfx.tap(state.soundOn);
                if (prepSubject) openSubject(prepSubject.id);
              }}
              onClear={() => {
                sfx.tap(state.soundOn);
                if (prepSubject) setSoon(prepSubject.id, null);
              }}
            />
          </motion.div>

          {/* One secondary block at a time: Braise's request is rare and passes (it has its own cooldown),
              the due card is there almost every day: so the request takes the card's place while it is open,
              otherwise it would never be seen. */}
          {showDueCard && !(braked || invite) && (
            <motion.div variants={staggerItem}>
              <DueCard
                count={dueTotal}
                onOpen={() => {
                  sfx.tap(state.soundOn);
                  setTab("revisions");
                }}
                onDismiss={handleDismissDue}
              />
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="space-y-3">
            <div>
              <h2 className="font-display text-[1.15rem] font-extrabold leading-tight text-[var(--ink)]">
                Tes mondes
              </h2>
            </div>
            <Hub
              worlds={worlds}
              braiseMood="happy"
              compact
              onSelect={(id) => {
                sfx.tap(state.soundOn);
                openSubject(id);
              }}
            />
          </motion.div>

          {(braked || invite) && (
            <motion.div variants={staggerItem}>
              {braked ? <BrakeCard /> : <NotifInvite onAccept={() => setMomentOpen(true)} />}
            </motion.div>
          )}
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

      {prepareOpen && (
        <PrepareSheet
          onChoose={(subjectId, days) => {
            sfx.tap(state.soundOn);
            setSoon(subjectId, days);
            setPrepareOpen(false);
          }}
          onClose={() => setPrepareOpen(false)}
        />
      )}
    </>
  );
}
