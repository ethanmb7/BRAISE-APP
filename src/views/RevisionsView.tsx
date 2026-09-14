import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionValueEvent, animate, type PanInfo, type MotionValue } from 'framer-motion';
import { Flag, Check, X, Zap, Volume2 } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';
import { speak, stopSpeaking } from '@/lib/speech';
import { BraiseRecap } from '@/components/BraiseRecap';
import { BraiseMascot } from '@/components/BraiseMascot';
import { RichText } from '@/components/RichText';
import { getAgeGroup, quizCorrect, quizWrong } from '@/lib/braiseVoice';
import { FLASHCARDS, SUBJECTS } from '@/data';
import type { Flashcard, Confidence } from '@/types';

// Plain direct localStorage key, deliberately outside the app's main progress-sync system
// (src/lib/persist.ts) — that store is a typed, debounced model of account progress (XP,
// streak, completed chapters...), and this is a single one-way "has this device ever seen the
// tutorial" flag with no need to round-trip through that machinery.
const TUTORIAL_SEEN_KEY = 'sapie_rev_tutorial_seen';

// Second gradient stop per subject — paired by analogous hue so the card reads like a
// social-feed filter wash rather than a clashing two-tone.
const SUBJECT_GRADIENT_END: Record<string, string> = {
  maths: '#8B5CF6',
  francais: '#EC4899',
  'histoire-geo': '#EF4444',
  svt: '#06B6D4',
  physique: '#3B82F6',
  anglais: '#A855F7',
};

export function RevisionsView() {
  const { state, reviewCard, getDueCards } = useApp();

  // Snapshotted + shuffled once per mount so reviewing a card mid-session (which shrinks the
  // due-set) can't shift the deck's array or its length out from under a running index, and so
  // every session mixes subjects in a fresh random order rather than the fixed curriculum
  // order the data happens to be authored in.
  //
  // No "nothing due" interstitial: due cards are prioritized when there are any, but the
  // session always starts immediately — falling back to the full deck rather than stopping to
  // ask, since spaced repetition finding nothing urgent today is not a reason to make the
  // student click through an extra screen before they can practice at all.
  const cards = useMemo(() => {
    const dueIds = new Set(getDueCards());
    const duePool = FLASHCARDS.filter((c) => dueIds.has(c.id));
    const pool = duePool.length > 0 ? duePool : FLASHCARDS;
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="view is-active rev-view">
      <SwipeDeck cards={cards} soundOn={state.soundOn} onReview={reviewCard} />
    </div>
  );
}

type JudgeMode = 'accept' | 'reject' | 'super';

function SwipeDeck({ cards, soundOn, onReview }: { cards: Flashcard[]; soundOn: boolean; onReview: (id: string, c: Confidence) => void }) {
  const { state, addXp, updateBestCombo, setTab } = useApp();
  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const [index, setIndex] = useState(0);
  const [isTrueAnswer, setIsTrueAnswer] = useState(true);
  const [judged, setJudged] = useState(false);
  // Which direction was actually judged, independent of `flying` — `flying` only turns
  // truthy later (5s auto-advance or manual skip), so the corner stamp's "claque" used to be
  // tied to that instead of to the verdict itself. That meant a button-tap judgment (x never
  // leaves 0, so the old drag-position-derived opacity stayed at 0 throughout) showed no stamp
  // at all, and a swipe-released judgment showed the stamp fading in lockstep with the card's
  // spring-back position instead of on its own fast timeline. This tracks the verdict the
  // instant it lands so the stamp can claque immediately and fade out on a fixed schedule.
  const [judgedMode, setJudgedMode] = useState<JudgeMode | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [flying, setFlying] = useState<JudgeMode | null>(null);
  const [feedbackLine, setFeedbackLine] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(true);
  const [reported, setReported] = useState(false);
  // Ephemeral center-screen celebration, separate from the small persistent .rev-combo badge
  // in the top row — this one pops in big, holds briefly, then clears itself. Number, not a
  // boolean, both so the toast can show which streak it's celebrating and so the key={} on it
  // changes on every landed combo, forcing a fresh mount (and thus a replayed pop animation)
  // even for two same-length streaks in a row.
  const [comboPopup, setComboPopup] = useState<number | null>(null);
  // First-card-only swipe tutorial (hand hint + mascot callout). Dismissed permanently the
  // moment the player does anything — starts a drag or taps a verdict button — rather than
  // only once they land a full swipe, since the goal is just to get out of the way as soon as
  // the gesture has been demonstrated. Only ever consulted while index === 0, so it never
  // needs resetting between cards.
  //
  // Seeded from localStorage (lazy initializer, so it's read exactly once per mount, not on
  // every render) so a returning player never sees it again once they've dismissed it a single
  // time in their life — replaying a "here's how this works" overlay on every session is the
  // kind of thing that reads as patronizing past the very first visit.
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragMood, setDragMood] = useState<'happy' | 'hesitant' | 'proud'>('happy');
  useMotionValueEvent(x, 'change', (latest) => {
    if (latest > 40) setDragMood('proud');
    else if (latest < -40) setDragMood('hesitant');
    else setDragMood('happy');
  });

  useEffect(() => {
    setIsTrueAnswer(Math.random() < 0.5);
    setTyping(true);
    setReported(false);
    const t = setTimeout(() => setTyping(false), 450);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (cards.length > 0 && index === cards.length) fireConfetti();
  }, [index, cards.length]);

  // Reports this session's best streak to the store's lifetime record the moment the deck
  // finishes — maxCombo itself is local, per-session state (reset on every restart), so the
  // Aura screen's "Combo Max" stat needs this one write to have anything real to show.
  useEffect(() => {
    if (cards.length > 0 && index === cards.length) updateBestCombo(maxCombo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cards.length]);

  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
  }, [index]);

  useEffect(() => stopSpeaking, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (comboPopup === null) return;
    const t = setTimeout(() => setComboPopup(null), 1100);
    return () => clearTimeout(t);
  }, [comboPopup]);

  useEffect(() => {
    if (!tutorialDismissed) return;
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
    } catch {
      // ignore quota/availability errors, same defensive pattern as lib/persist.ts
    }
  }, [tutorialDismissed]);

  const handleListen = (text: string) => {
    sfx.tap(soundOn);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  };

  if (cards.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Aucune carte pour ce filtre.</p>;
  }

  if (index >= cards.length) {
    return (
      <BraiseRecap
        reviewed={reviewed}
        wrongCount={wrongCount}
        maxCombo={maxCombo}
        xpEarned={xpEarned}
        onRestart={() => {
          setIndex(0);
          setReviewed(0);
          setCombo(0);
          setMaxCombo(0);
          setXpEarned(0);
          setWrongCount(0);
        }}
        onGoHome={() => setTab('home')}
      />
    );
  }

  const card = cards[index];
  const subject = SUBJECTS.find((s) => s.id === card.subject);
  const shownAnswer = isTrueAnswer ? card.a : card.wrongA;

  const judge = (mode: JudgeMode) => {
    if (judged || typing) return;
    setTutorialDismissed(true);
    // Available on every card now — no longer a once-per-session resource — so this just
    // reads the mode the player picked for this specific question.
    const useSuper = mode === 'super';
    const acceptedAsTrue = mode !== 'reject';
    const correctJudgment = acceptedAsTrue === isTrueAnswer;
    setJudged(true);
    setJudgedMode(mode);
    setWasCorrect(correctJudgment);
    if (correctJudgment) {
      sfx.correct(soundOn);
      const base = 15;
      // Doubling, not a flat top-up: reviewCard() below already grants the base amount for a
      // 'sure' review, so adding that same base again here as a bonus makes the total exactly
      // 2x rather than base+5.
      const bonus = useSuper ? base : 0;
      if (bonus > 0) addXp(bonus);
      const total = base + bonus;
      setXpEarned((x) => x + total);
      setFeedbackLine(`${useSuper ? '⚡ SUPER BRAISE ! ' : 'CARTON. '}${quizCorrect(voiceCtx)} (+${total} XP)`);
      setCombo((c) => {
        const next = c + 1;
        setMaxCombo((m) => Math.max(m, next));
        // A landed Super Braise is the single biggest win the app has — it gets its own
        // sharper double-pulse haptic regardless of streak length, distinct from the single
        // buzz a hot combo gives on its own.
        if (useSuper && navigator.vibrate) navigator.vibrate([30, 40, 60]);
        else if (next >= 3 && navigator.vibrate) navigator.vibrate(40);
        if (next >= 2) setComboPopup(next);
        return next;
      });
    } else {
      sfx.wrong(soundOn);
      setWrongCount((w) => w + 1);
      setFeedbackLine(isTrueAnswer ? 'AÏE. Le piège était là, celle-là était pourtant bonne.' : `GRILLÉ. ${quizWrong(voiceCtx, card.topic)}`);
      setCombo(0);
    }
    onReview(card.id, correctJudgment ? 'sure' : 'not-sure');
    advanceTimer.current = setTimeout(() => advance(mode), 5000);
  };

  // Single entry point for leaving the current card — used by both the auto-advance timeout
  // and the manual "tap to skip" path. Always clearing the pending timer here (not just at
  // the call site that happens to fire first) means a manual skip can never race a stale
  // timeout into firing a second, phantom advance on whatever card has since taken its place.
  const advance = (mode: JudgeMode) => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setFlying(mode);
  };

  const onAdvanceComplete = () => {
    if (!flying) return;
    x.set(0);
    y.set(0);
    setFlying(null);
    setJudged(false);
    setJudgedMode(null);
    setFeedbackLine('');
    setIndex((i) => i + 1);
    setReviewed((r) => r + 1);
  };

  const mood = judged ? (wasCorrect ? 'cool' : 'hesitant') : dragMood;

  const skipToNext = () => {
    if (!judged || flying) return;
    advance(wasCorrect ? 'accept' : 'reject');
  };

  const progressPct = ((index + (judged ? 1 : 0.5)) / cards.length) * 100;
  // Held off until typing finishes so the hint doesn't compete with the answer bubble's own
  // entrance, and dropped the instant the first card is judged or flying away, whichever
  // comes first.
  const showTutorial = index === 0 && !typing && !judged && !flying && !tutorialDismissed;

  return (
    <>
      <div className="flash-stack">
        <div className="rev-top-row">
          <div className="rev-progress-track">
            <div className="rev-progress-bar">
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <div className="rev-progress-mascot" style={{ left: `${progressPct}%` }}>
              <BraiseMascot
                size={22}
                mood={mood}
                className={judged ? (wasCorrect ? 'fc-mascot-burst' : 'fc-mascot-shake') : ''}
              />
              <AnimatePresence>
                {showTutorial && (
                  <motion.div
                    className="mascot-hint"
                    initial={{ opacity: 0, scale: 0.5, x: -6 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -6 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                  >
                    Vrai ou Faux ?
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {combo >= 2 && (
            <span key={combo} className={`rev-combo rev-combo-shake ${combo >= 3 ? 'is-hot' : ''}`}>
              🔥 ×{combo}
            </span>
          )}
        </div>
        {comboPopup !== null && (
          <div key={comboPopup} className={`combo-toast ${comboPopup >= 3 ? 'is-hot' : ''}`}>
            🔥 Série de {comboPopup} !
          </div>
        )}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              className="swipe-tutorial"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              aria-hidden="true"
            >
              <span className="tut-chip tut-left">← FAUX</span>
              <span className="tut-hand">✋</span>
              <span className="tut-chip tut-right">VRAI →</span>
            </motion.div>
          )}
        </AnimatePresence>
        <SwipeCard
          key={card.id}
          x={x}
          y={y}
          judged={judged}
          judgedMode={judgedMode}
          typing={typing}
          flying={flying}
          subjectColor={subject?.color}
          subjectColor2={SUBJECT_GRADIENT_END[subject?.id ?? ''] || 'var(--neo-blue)'}
          onDragJudge={(mode) => judge(mode)}
          onFlyComplete={onAdvanceComplete}
          onDragStart={() => setTutorialDismissed(true)}
          onTap={judged ? skipToNext : undefined}
        >
          <div className={`fc-scroll ${showTutorial ? 'has-tutorial' : ''}`}>
            <div className="ftag-row">
              <span className="subject-tag" style={{ '--tag-color': subject?.color } as React.CSSProperties}>
                {subject?.emoji} {subject?.name} — {card.topic}
              </span>
              <button
                className={`hint-btn ${reported ? 'is-reported' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (reported) return;
                  sfx.tap(soundOn);
                  setReported(true);
                }}
                aria-label={reported ? 'Signalé' : 'Signaler un problème'}
              >
                {reported ? <Check size={15} /> : <Flag size={15} />}
              </button>
            </div>
            <div className="fc-qa-block">
              <div className="fq-zone">
                <div className="fq-notif">
                  <span className="fq-notif-icon">{subject?.emoji}</span>
                  <div className="fq-notif-body">
                    <div className="fq-notif-title"><RichText text={card.q} /></div>
                    <div className="fq-notif-meta">Braise · à l'instant</div>
                  </div>
                </div>
              </div>
              <div className="fa-row">
                {typing ? (
                  <div className="braise-say braise-typing" aria-hidden="true">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                ) : (
                  <div className="braise-say fa-proposed">
                    <span className="braise-tail" />
                    <RichText text={shownAnswer} />
                  </div>
                )}
              </div>
              {judged && (
                <>
                  <div className="fb-line">{feedbackLine}</div>
                  <div className="reveal-line">
                    <b>La vraie réponse&nbsp;:</b> <RichText text={card.a} />
                  </div>
                  <button
                    className={`listen-link ${speaking ? 'is-speaking' : ''}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleListen(card.a);
                    }}
                  >
                    <Volume2 size={13} />
                    {speaking ? 'Lecture...' : 'Écouter la réponse'}
                  </button>
                  <div className="fhint">Touche la carte pour continuer</div>
                </>
              )}
            </div>
          </div>

          {!judged && (
            <div className="rev-actions rev-actions-embedded">
              <button
                className="rev-btn again"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); judge('reject'); }}
                aria-label="Intox"
              >
                <X size={28} />
              </button>
              <button
                className="rev-btn super"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); judge('super'); }}
                aria-label="Joker — double les points"
              >
                <Zap size={22} />
                <span className="joker-tooltip">×2</span>
              </button>
              <button
                className="rev-btn know"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); judge('accept'); }}
                aria-label="Carré"
              >
                <Check size={28} />
              </button>
            </div>
          )}
        </SwipeCard>
      </div>
    </>
  );
}

function SwipeCard({
  x,
  y,
  judged,
  judgedMode,
  typing,
  flying,
  subjectColor,
  subjectColor2,
  onDragJudge,
  onFlyComplete,
  onDragStart,
  onTap,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  judged: boolean;
  judgedMode: JudgeMode | null;
  typing: boolean;
  flying: JudgeMode | null;
  subjectColor?: string;
  subjectColor2?: string;
  onDragJudge: (mode: JudgeMode) => void;
  onFlyComplete: () => void;
  onDragStart?: () => void;
  onTap?: () => void;
  children: React.ReactNode;
}) {
  // Tilt is a pure function of the current horizontal drag offset, nothing else. An earlier
  // version blended in a velocity term (via useVelocity / an independent motion value driven
  // from onDrag) to make fast flicks tilt harder — but that broke the return-to-rest spring
  // for x/y/rotate together: releasing a drag that didn't cross the judge threshold left the
  // card permanently stuck off-center and tilted instead of springing back. Reverted to this
  // simple, provably-correct form: rotate is fully derived from x, so whenever x is animated
  // back to 0 (by the `animate` target below, on any non-judged release), rotate follows it
  // to exactly 0 automatically, with nothing separate left to reset or go stale.
  const rotate = useTransform(x, [-200, 200], [-16, 16]);

  // Stamp opacity ramps in over a drag window well short of the release threshold, so the
  // player sees the verdict coming before they've committed to it (progressive feedback,
  // not a binary flip at the last pixel).
  const knowOpacity = useTransform(x, [20, 110], [0, 1]);
  const againOpacity = useTransform(x, [-110, -20], [1, 0]);
  const superOpacity = useTransform(y, [-110, -20], [1, 0]);
  // Border tints green/red as the drag leans toward accept/reject, fully saturated well
  // before the 90px release threshold so the color itself previews the outcome.
  const borderColor = useTransform(x, [-140, 0, 140], ['#E8564B', '#000000', '#0F9E6E']);
  // Full-card color wash layered on top of the content (see .fc-swipe-wash) — the border tint
  // alone reads as a thin accent; this makes the whole card visibly lean red/green as you drag,
  // the way a Tinder-style swipe reads its verdict at a glance rather than needing a close look.
  const washColor = useTransform(
    x,
    [-140, 0, 140],
    ['rgba(232, 86, 75, 0.28)', 'rgba(0, 0, 0, 0)', 'rgba(15, 158, 110, 0.28)']
  );

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (judged) return;
    // Release threshold: 90px covers a comfortable thumb flick without being so short that
    // a small readjustment mid-read accidentally commits a verdict. Vertical (up = Super
    // Braise) is checked first and only wins when the gesture is more vertical than
    // horizontal, so a mostly-sideways swipe never gets misread as the risk-it gesture.
    const { offset } = info;
    const isSuperSwipe = offset.y < -90 && Math.abs(offset.y) > Math.abs(offset.x);
    if (isSuperSwipe) {
      onDragJudge('super');
    } else if (offset.x > 90) {
      onDragJudge('accept');
    } else if (offset.x < -90) {
      onDragJudge('reject');
    } else {
      // Released without crossing any threshold. With dragMomentum off and no
      // dragConstraints, framer just freezes x/y wherever the finger lifted — it does not
      // reliably hand control back to the `animate` prop's rest target on its own. Without
      // this, an aborted swipe (started, then let go short of the threshold) would leave the
      // card permanently stuck off-center and tilted, which is exactly the "tilt at rest"
      // bug this fixes: forcing the spring back explicitly, every time, rather than hoping
      // the declarative animation reclaims the value.
      animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
      animate(y, 0, { type: 'spring', stiffness: 420, damping: 32 });
    }
  };

  // Verdict lock: once a direction is committed, the card animates to a fixed off-screen
  // target rather than continuing on drag momentum — the outcome (and its color) needs to
  // be deterministic, not dependent on exactly how hard the release throw was.
  const target =
    flying === 'accept'
      ? { x: 480, y: -30, rotate: 22, scale: 1, opacity: 0, borderColor: '#0F9E6E' }
      : flying === 'reject'
        ? { x: -480, y: -30, rotate: -22, scale: 1, opacity: 0, borderColor: '#E8564B' }
        : flying === 'super'
          ? { x: 0, y: -700, rotate: 0, scale: 1, opacity: 0, borderColor: '#000000' }
          : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, borderColor: '#000000' };

  return (
    <motion.div
      className={`flashcard ${judged ? 'is-judged' : ''}`}
      style={{
        x,
        y,
        rotate,
        borderColor,
        '--subject-color': subjectColor || 'var(--neo-orange)',
        '--subject-color-2': subjectColor2 || 'var(--neo-blue)',
      } as any}
      drag={!judged && !typing}
      // 0.55 = the physical "resistance": at 1 the card would track the finger 1:1 with no
      // give, at 0 it wouldn't move past the origin at all. 0.55 lets it travel most of the
      // way with the finger while still feeling like it's being pulled against something,
      // rather than gliding freely.
      dragElastic={0.55}
      // Momentum is off deliberately — release-throw physics are replaced by the fixed
      // `target` animation above once a verdict is locked, so the card shouldn't also keep
      // drifting on whatever velocity the release happened to have.
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      // Each new card mounts fresh (key={card.id}), so this initial state is what makes it
      // arrive with a soft pop rather than snapping straight to rest right as the previous
      // card finishes flying away — the two halves of the transition read as one motion.
      initial={{ scale: 0.92, opacity: 0 }}
      animate={target}
      transition={
        flying
          ? { duration: 0.4, ease: [0.5, 0, 0.85, 0.35] }
          : { type: 'spring', stiffness: 420, damping: 32 }
      }
      onAnimationComplete={() => {
        if (flying) onFlyComplete();
      }}
      onClick={onTap}
    >
      <motion.div className="fc-swipe-wash" style={{ background: washColor }} aria-hidden="true" />
      {/* `judged && !flying` — the resting window between a verdict landing and the card
          actually flying off — is pinned to a hard 0 rather than left to whatever knowOpacity/
          againOpacity currently read off x. Those are only meant to track a live drag; once
          judged they have no more reason to move, but nothing was forcing them back to exactly
          0 on that specific frame, which was enough to leave a faint "VRAI"/"FAUX" ghost sitting
          over the answer bubble while the feedback text was showing. */}
      <motion.div
        className="fc-gesture-label right"
        style={{ opacity: flying === 'accept' ? 1 : judged ? 0 : knowOpacity }}
        aria-hidden="true"
      >
        VRAI
      </motion.div>
      <motion.div
        className="fc-gesture-label left"
        style={{ opacity: flying === 'reject' ? 1 : judged ? 0 : againOpacity }}
        aria-hidden="true"
      >
        FAUX
      </motion.div>
      {/* Stamp lifecycle is driven by `judgedMode`, not `flying` — `flying` only turns truthy
          5s later (auto-advance) or on manual skip, so tying the claque to it meant a button
          judgment never showed a stamp at all (x never left 0) and a swipe judgment showed it
          fading in lockstep with the card's own spring-back instead of on a fixed timeline.
          `judgedMode` fires the claque the instant the verdict lands; the `.stamped` class's
          own `stampClaqueFade` keyframe (pop in, hold, fade to 0, `forwards`-filled) then owns
          opacity outright — no inline style fighting it — so the winning stamp is reliably
          gone well before the 5s feedback window is over, clearing the way for the feedback
          text instead of lingering through it. */}
      <motion.span
        className={`swipe-tag know ${judgedMode === 'accept' ? 'stamped' : ''}`}
        style={judgedMode === 'accept' ? undefined : { opacity: judged ? 0 : knowOpacity }}
      >
        CARRÉ ✔️
      </motion.span>
      <motion.span
        className={`swipe-tag again ${judgedMode === 'reject' ? 'stamped' : ''}`}
        style={judgedMode === 'reject' ? undefined : { opacity: judged ? 0 : againOpacity }}
      >
        INTOX ✖️
      </motion.span>
      <motion.span
        className={`swipe-tag super ${judgedMode === 'super' ? 'stamped' : ''}`}
        style={judgedMode === 'super' ? undefined : { opacity: judged ? 0 : superOpacity }}
      >
        ⚡ SUPER
      </motion.span>
      {children}
    </motion.div>
  );
}
