import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type PanInfo, type MotionValue } from 'framer-motion';
import { Flag, Check, X, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti, fireMicroConfetti } from '@/lib/confetti';
import { speak, stopSpeaking } from '@/lib/speech';
import { BraiseRecap } from '@/components/BraiseRecap';
import { CardStack, QuestionCard, AnswerCard } from '@/components/RevisionCards';
import { getAgeGroup, judgePrompt, quizCorrect, quizWrong } from '@/lib/braiseVoice';
import { reportCard } from '@/lib/reports';
import { FLASHCARDS, SUBJECTS } from '@/data';
import type { Flashcard, Confidence } from '@/types';

// Plain direct localStorage key, deliberately outside the app's main progress-sync system
// (src/lib/persist.ts) — that store is a typed, debounced model of account progress (XP,
// streak, completed chapters...), and this is a single one-way "has this device ever seen the
// tutorial" flag with no need to round-trip through that machinery.
const TUTORIAL_SEEN_KEY = 'sapie_rev_tutorial_seen';

// A daily session is a sprint, not the whole library: ~15 cards, mixed. The deck used to
// serve every due card (26 on a fresh install) with no cap at all.
const SESSION_SIZE = 15;

// In-progress session snapshot so "Revoir la notion" (which leaves for the chapter's chat)
// comes back to the NEXT card with the streak, joker charge and totals intact, instead of
// remounting a brand-new deck at 1/15. sessionStorage, not localStorage: a session is a
// single sitting, it has no business surviving the tab.
const SESSION_SNAPSHOT_KEY = 'sapie_rev_session';
const SESSION_SNAPSHOT_TTL = 30 * 60 * 1000;
type SessionSnapshot = {
  cardIds: string[];
  index: number;
  combo: number;
  maxCombo: number;
  xpEarned: number;
  reviewed: number;
  wrongCount: number;
  jokerCharge: number;
  at: number;
};
function readSnapshot(): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as SessionSnapshot;
    if (Date.now() - snap.at > SESSION_SNAPSHOT_TTL) return null;
    return snap;
  } catch {
    return null;
  }
}
function writeSnapshot(snap: SessionSnapshot | null) {
  try {
    if (snap) sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(snap));
    else sessionStorage.removeItem(SESSION_SNAPSHOT_KEY);
  } catch {
    // ignore quota/availability errors, same defensive pattern as lib/persist.ts
  }
}

// The joker (×2) has to be earned, not free: available on every card at no cost it strictly
// dominated CARRÉ (a rational player never pressed CARRÉ again). It charges with the combo —
// two correct in a row lights it up, using it spends the charge, a miss empties it. Scarcity,
// never a penalty: no negative XP for a teenager.
const JOKER_CHARGE_NEEDED = 2;

// Compact subject tag in the header pill ("⚗️ PHYSIQUE · ÉNERGIE"), not the full display name
// — the pill has to stay one line next to the report/quit buttons.
const SUBJECT_SHORT: Record<string, string> = {
  maths: 'Maths',
  francais: 'Français',
  'histoire-geo': 'Histoire-Géo',
  svt: 'SVT',
  physique: 'Physique',
  anglais: 'Anglais',
};


export function RevisionsView() {
  const { state, reviewCard, getDueCards } = useApp();
  // Bumped on "Enchaîner une autre série" to force a fresh draw below AND, via `key` on
  // SwipeDeck, a full remount — that second part matters as much as the reshuffle: a manual
  // reset of only some state fields could leave a verdict from the previous session showing on
  // the new first card. A remount can't leave anything half-reset.
  const [sessionKey, setSessionKey] = useState(0);

  // A fresh, in-progress snapshot (coming back from "Revoir la notion") resumes that exact
  // deck; otherwise a new draw. Read once per session key, so a restart always re-draws.
  const resume = useMemo(() => (sessionKey === 0 ? readSnapshot() : null), [sessionKey]);

  // One session = SESSION_SIZE cards, drawn once (re-drawn on restart via `sessionKey`) so
  // reviewing a card mid-session can't shift the deck under a running index. Priority, then
  // shuffle: due cards first (spaced repetition), then the subjects the student picked in
  // onboarding (weighted, not exclusive — the Home screen still shows all six decks, and an
  // exclusive filter would make the two screens disagree), then a difficulty nudge by age
  // group. Cards carry a difficulty, not a school grade, so this is the honest limit of
  // "adapted to their level" until the content has a grades field.
  const cards = useMemo(() => {
    if (resume) {
      const byId = new Map(FLASHCARDS.map((c) => [c.id, c]));
      const restored = resume.cardIds.map((id) => byId.get(id)).filter((c): c is Flashcard => !!c);
      if (restored.length === resume.cardIds.length) return restored;
    }
    const dueIds = new Set(getDueCards());
    const chosen = new Set(state.user.subjects);
    const age = getAgeGroup(state.user.level);
    const priority = (c: Flashcard) => {
      let p = Math.random();
      if (dueIds.has(c.id)) p += 2;
      if (chosen.has(c.subject)) p += 0.7;
      if (age === 'college' ? c.level === 'easy' : c.level === 'hard') p += 0.3;
      return p;
    };
    const picked = [...FLASHCARDS]
      .map((c) => ({ c, p: priority(c) }))
      .sort((a, b) => b.p - a.p)
      .slice(0, SESSION_SIZE)
      .map(({ c }) => c);
    for (let i = picked.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picked[i], picked[j]] = [picked[j], picked[i]];
    }
    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, resume]);

  return (
    <div className="view is-active rev-view">
      <SwipeDeck
        key={sessionKey}
        cards={cards}
        resume={resume && resume.cardIds.length === cards.length ? resume : null}
        soundOn={state.soundOn}
        onReview={reviewCard}
        onRestartSession={() => {
          writeSnapshot(null);
          setSessionKey((k) => k + 1);
        }}
      />
    </div>
  );
}

type Verdict = 'accept' | 'reject';
type FlyDir = 'left' | 'right' | 'up';

function SwipeDeck({
  cards,
  resume,
  soundOn,
  onReview,
  onRestartSession,
}: {
  cards: Flashcard[];
  resume: SessionSnapshot | null;
  soundOn: boolean;
  onReview: (id: string, c: Confidence) => void;
  onRestartSession: () => void;
}) {
  const { state, addXp, updateBestCombo, setTab, bridgeToChat } = useApp();
  const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
  const [index, setIndex] = useState(resume?.index ?? 0);
  const [isTrueAnswer, setIsTrueAnswer] = useState(true);
  const [judged, setJudged] = useState(false);
  // The verdict itself, the instant it lands — colours the card's fly-out border later, when
  // `flying` turns truthy on "next".
  const [judgedMode, setJudgedMode] = useState<Verdict | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [flying, setFlying] = useState(false);
  const [flyDir, setFlyDir] = useState<FlyDir>('right');
  // Verdict feedback: emoji tag, Braise's line, and the XP won (0 on a miss) — rendered
  // inside the answer card (verdict bar on top, Braise's line as footer).
  const [feedback, setFeedback] = useState<{ tag: string; text: string; xp: number } | null>(null);
  // Picked once per card (in the index effect), not in render — byCombo() draws at random,
  // so reading it during render would reshuffle the wording on every re-render mid-card.
  const [prompt, setPrompt] = useState('');
  const [combo, setCombo] = useState(resume?.combo ?? 0);
  const [maxCombo, setMaxCombo] = useState(resume?.maxCombo ?? 0);
  const [xpEarned, setXpEarned] = useState(resume?.xpEarned ?? 0);
  const [reviewed, setReviewed] = useState(resume?.reviewed ?? 0);
  const [wrongCount, setWrongCount] = useState(resume?.wrongCount ?? 0);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(true);
  const [reported, setReported] = useState(false);
  // Joker: `jokerCharge` counts consecutive correct answers toward JOKER_CHARGE_NEEDED;
  // `armed` is the player's "sûr de moi" declaration for THIS card, applied to whichever
  // verdict they give next (INTOX or CARRÉ — it used to be accept-only, so you could never
  // bet on catching a lie).
  const [jokerCharge, setJokerCharge] = useState(resume?.jokerCharge ?? 0);
  const [armed, setArmed] = useState(false);
  const jokerReady = jokerCharge >= JOKER_CHARGE_NEEDED;
  // First-card-only swipe tutorial. Dismissed permanently the moment the player does anything
  // — starts a drag or taps a verdict button. Seeded from localStorage (lazy initializer, read
  // exactly once per mount) so a returning player never sees it again once they've dismissed
  // it a single time in their life.
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // The drag previews the button it's about to press: as the card leans right, CARRÉ lifts
  // (scale) and INTOX does the same on the left — the same idea as the swipe preview on the
  // big dating/learning apps, and it keeps the verdict words off the cards while dragging.
  const acceptLift = useTransform(x, [20, 110], [1, 1.08]);
  const rejectLift = useTransform(x, [-110, -20], [1.08, 1]);

  useEffect(() => {
    setIsTrueAnswer(Math.random() < 0.5);
    setTyping(true);
    setReported(false);
    setArmed(false);
    setPrompt(judgePrompt(voiceCtx));
    const t = setTimeout(() => setTyping(false), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (cards.length > 0 && index === cards.length) fireConfetti();
  }, [index, cards.length]);

  // Keep the resumable snapshot current while the session is live; drop it the moment the
  // deck is finished so a later visit to Réviser starts a genuinely new session.
  useEffect(() => {
    if (cards.length === 0) return;
    if (index >= cards.length) {
      writeSnapshot(null);
      return;
    }
    writeSnapshot({
      cardIds: cards.map((c) => c.id),
      index,
      combo,
      maxCombo,
      xpEarned,
      reviewed,
      wrongCount,
      jokerCharge,
      at: Date.now(),
    });
  }, [cards, index, combo, maxCombo, xpEarned, reviewed, wrongCount, jokerCharge]);

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
        onRestart={onRestartSession}
        onGoHome={() => setTab('home')}
      />
    );
  }

  const card = cards[index];
  const subject = SUBJECTS.find((s) => s.id === card.subject);
  const shownAnswer = isTrueAnswer ? card.a : card.wrongA;

  const toggleArm = () => {
    if (judged || typing || !jokerReady) return;
    sfx.flip(soundOn);
    setTutorialDismissed(true);
    setArmed((a) => !a);
  };

  const judge = (mode: Verdict) => {
    if (judged || typing) return;
    setTutorialDismissed(true);
    const useSuper = armed && jokerReady;
    const acceptedAsTrue = mode === 'accept';
    const correctJudgment = acceptedAsTrue === isTrueAnswer;
    setJudged(true);
    setJudgedMode(mode);
    setWasCorrect(correctJudgment);
    setArmed(false);
    if (correctJudgment) {
      sfx.correct(soundOn);
      const base = 15;
      // Doubling, not a flat top-up: reviewCard() below already grants the base amount for a
      // 'sure' review, so adding that same base again here as a bonus makes the total exactly
      // 2x rather than base+5.
      const bonus = useSuper ? base : 0;
      if (bonus > 0) addXp(bonus);
      const total = base + bonus;
      setXpEarned((v) => v + total);
      setFeedback({ tag: useSuper ? '⚡ SUPER BRAISE' : "💯 C'EST CARRÉ", text: quizCorrect(voiceCtx), xp: total });
      // Immediate, physical: a small burst fires from the side of the dock that was pressed
      // (INTOX left / CARRÉ right), the whole stack shivers, the result strip pops in.
      fireMicroConfetti(mode === 'accept' ? 0.76 : 0.24, 0.9, useSuper);
      // Spending the joker empties its charge; otherwise a correct answer charges it.
      setJokerCharge((c) => (useSuper ? 0 : Math.min(JOKER_CHARGE_NEEDED, c + 1)));
      setCombo((c) => {
        const next = c + 1;
        setMaxCombo((m) => Math.max(m, next));
        // A landed Super Braise is the single biggest win the app has — it gets its own
        // sharper double-pulse haptic regardless of streak length, distinct from the single
        // buzz a hot combo gives on its own.
        if (useSuper && navigator.vibrate) navigator.vibrate([30, 40, 60]);
        else if (next >= 3 && navigator.vibrate) navigator.vibrate(40);
        return next;
      });
    } else {
      sfx.wrong(soundOn);
      setWrongCount((w) => w + 1);
      setFeedback(
        isTrueAnswer
          ? { tag: '🙈 AÏE', text: 'Le piège était là, celle-là était pourtant bonne.', xp: 0 }
          : { tag: '💀 GRILLÉ', text: quizWrong(voiceCtx, card.topic), xp: 0 }
      );
      setCombo(0);
      setJokerCharge(0);
    }
    onReview(card.id, correctJudgment ? 'sure' : 'not-sure');
    // No auto-advance, on purpose. The dock is pinned in one place, so a timer that swapped
    // "Suivant" for INTOX/CARRÉ under a thumb already reaching for it would turn that tap
    // into a verdict on the next card. The student always moves on themselves: "Suivant",
    // a tap on the card, or a swipe in any direction — the way Duolingo's CONTINUE works.
  };

  // Single entry point for leaving the current card — tap, "Suivant", and a post-verdict
  // swipe all land here.
  const advance = (dir: FlyDir) => {
    setFlyDir(dir);
    setFlying(true);
  };

  const onAdvanceComplete = () => {
    if (!flying) return;
    x.set(0);
    y.set(0);
    setFlying(false);
    setJudged(false);
    setJudgedMode(null);
    setFeedback(null);
    setIndex((i) => i + 1);
    setReviewed((r) => r + 1);
  };

  const skipToNext = () => {
    if (!judged || flying) return;
    advance('right');
  };

  // "Revoir la notion": drops the student into the chapter's chat with Braise, first person,
  // same voice as the lesson's own "explique-moi le piège" bridge — not a link to a syllabus.
  const reviewNotion = () => {
    sfx.tap(soundOn);
    // This card is done — the snapshot points at the NEXT one, so coming back from the chat
    // lands on a fresh card with everything else (streak, joker, totals) exactly as left.
    writeSnapshot({
      cardIds: cards.map((c) => c.id),
      index: index + 1,
      combo,
      maxCombo,
      xpEarned,
      reviewed: reviewed + 1,
      wrongCount,
      jokerCharge,
      at: Date.now(),
    });
    const ask = wasCorrect
      ? `Tu peux m'en dire un peu plus sur ${card.topic} ? Je veux être sûr de bien capter.`
      : `Je viens de me planter sur « ${card.q} ». Tu peux me réexpliquer ${card.topic}, vite fait ?`;
    bridgeToChat(card.subject, card.chapterId, ask, 'revisions');
  };

  const progressPct = ((index + (judged ? 1 : 0.5)) / cards.length) * 100;
  // Held off until typing finishes so the hint doesn't compete with the answer bubble's own
  // entrance, and dropped the instant the first card is judged or flying away, whichever
  // comes first.
  const showTutorial = index === 0 && !typing && !judged && !flying && !tutorialDismissed;

  return (
    <>
      <div className="flash-stack">
        {/* Header: count · progress · combo (slot always reserved so the bar never jumps
            when a streak starts or breaks) · report · quit. Report lives up here now, styled
            as a sibling of the quit button, off the card's reading area. */}
        <div className="rev-top-row">
          <span className="rev-count">{index + 1}/{cards.length}</span>
          <div className="rev-progress-track">
            <div className="rev-progress-bar">
              <span style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <span className="rev-combo-slot" aria-live="polite">
            {combo >= 1 && (
              <span key={combo} className={`rev-combo rev-combo-shake ${combo >= 3 ? 'is-hot' : ''}`}>
                🔥 ×{combo}
              </span>
            )}
          </span>
          <button
            className={`rev-icon-btn ${reported ? 'is-reported' : ''}`}
            onClick={() => {
              if (reported) return;
              sfx.tap(soundOn);
              setReported(true);
              reportCard(card.id, card.q);
            }}
            aria-label={reported ? 'Signalé, merci' : 'Signaler un problème sur cette carte'}
          >
            {reported ? <Check size={15} strokeWidth={3} /> : <Flag size={15} strokeWidth={2.5} />}
          </button>
          <button
            className="rev-icon-btn"
            onClick={() => {
              sfx.tap(soundOn);
              writeSnapshot(null);
              setTab('home');
            }}
            aria-label="Quitter la série"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
        <SwipeCard
          key={card.id}
          x={x}
          y={y}
          judged={judged}
          judgedMode={judgedMode}
          typing={typing}
          flying={flying}
          flyDir={flyDir}
          subjectColor={subject?.color}
          onDragJudge={judge}
          onDragArm={toggleArm}
          onDragNext={(dir) => advance(dir)}
          onFlyComplete={onAdvanceComplete}
          onDragStart={() => setTutorialDismissed(true)}
          onTap={judged ? skipToNext : undefined}
        >
          <div className="fc-scroll">
            {/* Subject pill sits directly under the header — it's context, it belongs with
                the header, not floating mid-card above the thread. */}
            <div className="ftag-row">
              <span className="subject-tag" style={{ '--tag-color': subject?.color } as React.CSSProperties}>
                {subject?.emoji} {SUBJECT_SHORT[card.subject] ?? subject?.name} · {card.topic}
              </span>
            </div>
            {/* The centre of the screen: question, claim, then the result strip once judged —
                one column, centred both ways, `layout` so the stack re-flows smoothly as the
                correction unfolds and the result strip slots in. On a win it shivers once. */}
            <motion.div
              className="flex w-full flex-1 flex-col"
              layout
              animate={judged && wasCorrect ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
            >
              <CardStack>
                <QuestionCard question={card.q} emoji={subject?.emoji ?? '📚'} color={subject?.color ?? 'var(--sun)'} />
                <AnimatePresence mode="wait" initial={false}>
                  <AnswerCard
                    key={typing ? 'typing' : 'claim'}
                    typing={typing}
                    claim={shownAnswer}
                    truth={card.a}
                    wasLie={!isTrueAnswer}
                    judged={judged}
                    verdict={judged ? (wasCorrect ? 'win' : 'miss') : null}
                    prompt={prompt}
                    tutorial={showTutorial}
                    result={
                      judged && feedback
                        ? {
                            verdict: wasCorrect ? 'win' : 'miss',
                            tag: feedback.tag,
                            text: feedback.text,
                            xp: feedback.xp,
                            combo,
                            speaking,
                            onListen: () => handleListen(card.a),
                          }
                        : undefined
                    }
                  />
                </AnimatePresence>
              </CardStack>
            </motion.div>
          </div>
        </SwipeCard>

        {/* The dock is a sibling of the card, not a child: it's pinned to the bottom of the
            screen (safe-area aware) and never moves — not with the card's drag, not with the
            card flying off, not with how long the text above it is. The thumb learns one
            position. It swaps between two states in place: verdicts before, "Revoir la
            notion" + "Suivant" after. */}
        <div className="rev-dock">
          <AnimatePresence mode="wait" initial={false}>
            {!judged ? (
              <motion.div
                key="verdict"
                className="rev-dock-inner"
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.14, ease: 'easeIn' }}
              >
                <div className="rev-actions">
                  <motion.div className="flex-1" style={{ scale: rejectLift }}>
                    <BevelButton
                      className="w-full"
                      base="bg-[var(--coral-2)]"
                      face="bg-[var(--coral)] text-white"
                      onClick={() => judge('reject')}
                      label="Intox — c'est faux"
                      badge={armed ? '+30' : '+15'}
                    >
                      <X size={20} strokeWidth={3.2} />
                      <span>Intox</span>
                    </BevelButton>
                  </motion.div>
                  <BevelButton
                    className="w-[62px]"
                    round
                    base={armed ? 'bg-black' : jokerReady ? 'bg-[var(--sun-ink)]' : 'bg-black/30'}
                    face={
                      armed
                        ? 'bg-black text-[var(--sun)]'
                        : jokerReady
                          ? 'bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black'
                          : 'bg-[var(--paper)] text-black/40 border-dashed'
                    }
                    onClick={toggleArm}
                    pressed={armed}
                    label={
                      jokerReady
                        ? armed
                          ? 'Joker armé : ×2 sur ta prochaine réponse'
                          : 'Joker — double les points de ta prochaine réponse'
                        : `Joker — se charge avec ${JOKER_CHARGE_NEEDED} bonnes réponses d'affilée`
                    }
                    badge={jokerReady ? '×2' : `${jokerCharge}/${JOKER_CHARGE_NEEDED}`}
                    badgeTone={jokerReady ? 'hot' : 'muted'}
                  >
                    <Zap size={22} strokeWidth={2.6} />
                  </BevelButton>
                  <motion.div className="flex-1" style={{ scale: acceptLift }}>
                    <BevelButton
                      className="w-full"
                      base="bg-[var(--mint-text)]"
                      face="bg-[var(--mint)] text-black"
                      onClick={() => judge('accept')}
                      label="Carré — c'est vrai"
                      badge={armed ? '+30' : '+15'}
                    >
                      <Check size={20} strokeWidth={3.2} />
                      <span>Carré</span>
                    </BevelButton>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="next"
                className="rev-dock-inner"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, delay: 0.2 }}
              >
                <div className="rev-actions">
                  <BevelButton
                    className="flex-[1.15]"
                    base="bg-black/60"
                    face="bg-[var(--paper)] text-black"
                    onClick={reviewNotion}
                    label="Revoir la notion"
                    compact
                  >
                    <BookOpen size={17} strokeWidth={2.6} />
                    <span>Revoir la notion</span>
                  </BevelButton>
                  <BevelButton
                    className="flex-1"
                    base="bg-[#b98a00]"
                    face="bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black"
                    onClick={skipToNext}
                    label="Carte suivante"
                  >
                    <span>Suivant</span>
                    <ArrowRight size={20} strokeWidth={3.2} />
                  </BevelButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// The app's own tactile button (see HeaderHUD's BeveledButton and Home's "Je pioche !"):
// a darker base underneath, a face with the 2.5px border and hard shadow that presses down
// 3px onto it. `round` makes the joker's circle; `compact` is the lighter post-verdict pill.
function BevelButton({
  children,
  onClick,
  label,
  base,
  face,
  badge,
  badgeTone = 'hot',
  round = false,
  compact = false,
  pressed,
  className = '',
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  base: string;
  face: string;
  badge?: string;
  badgeTone?: 'hot' | 'muted';
  round?: boolean;
  compact?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  const radius = round ? 'rounded-full' : 'rounded-2xl';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`group relative block min-w-0 ${className}`}
    >
      <span aria-hidden="true" className={`absolute inset-0 translate-y-[4px] ${radius} border-[2.5px] border-black ${base}`} />
      <span
        className={`relative flex h-[58px] items-center justify-center gap-2 ${radius} border-[2.5px] border-black px-3 font-display font-black uppercase tracking-wide shadow-[4px_4px_0_#000] transition-transform duration-100 group-active:translate-y-[4px] group-active:shadow-none ${
          compact ? 'text-[0.82rem] normal-case tracking-normal' : 'text-[1.02rem]'
        } ${face}`}
      >
        {children}
      </span>
      {badge && (
        <span
          aria-hidden="true"
          className={`absolute -top-2.5 right-2 rounded-md border-2 border-black px-1.5 py-0.5 font-display text-[0.62rem] font-black shadow-[2px_2px_0_#000] ${
            badgeTone === 'hot' ? 'bg-[var(--sun)] text-black' : 'bg-white text-black/60'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SwipeCard({
  x,
  y,
  judged,
  judgedMode,
  typing,
  flying,
  flyDir,
  subjectColor,
  onDragJudge,
  onDragArm,
  onDragNext,
  onFlyComplete,
  onDragStart,
  onTap,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  judged: boolean;
  judgedMode: Verdict | null;
  typing: boolean;
  flying: boolean;
  flyDir: FlyDir;
  subjectColor?: string;
  onDragJudge: (mode: Verdict) => void;
  onDragArm: () => void;
  onDragNext: (dir: FlyDir) => void;
  onFlyComplete: () => void;
  onDragStart?: () => void;
  onTap?: () => void;
  children: React.ReactNode;
}) {
  // Tilt is a pure function of the current horizontal drag offset, nothing else — rotate is
  // fully derived from x, so whenever x is animated back to 0 rotate follows it to exactly 0
  // automatically, with nothing separate left to reset or go stale.
  const rotate = useTransform(x, [-200, 200], [-16, 16]);

  // Border tints green/red as the drag leans toward accept/reject, fully saturated well
  // before the 90px release threshold so the color itself previews the outcome.
  const borderColor = useTransform(x, [-140, 0, 140], ['#E8564B', '#000000', '#0F9E6E']);
  // Full-card color wash layered on top of the content (see .fc-swipe-wash) — the border tint
  // alone reads as a thin accent; this makes the whole stage visibly lean red/green as you
  // drag. Together with the dock button lifting (SwipeDeck), that's the whole drag preview:
  // nothing is written over the cards while the student is moving them.
  const washColor = useTransform(
    x,
    [-140, 0, 140],
    ['rgba(232, 86, 75, 0.28)', 'rgba(0, 0, 0, 0)', 'rgba(15, 158, 110, 0.28)']
  );

  const springBack = () => {
    // Released without crossing a threshold. With dragMomentum off and no dragConstraints,
    // framer freezes x/y wherever the finger lifted — forcing the spring back explicitly is
    // what keeps an aborted swipe from leaving the card stuck off-center and tilted.
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
    animate(y, 0, { type: 'spring', stiffness: 420, damping: 32 });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    // Release threshold: 90px covers a comfortable thumb flick without being so short that
    // a small readjustment mid-read accidentally commits a verdict.
    const vertical = offset.y < -90 && Math.abs(offset.y) > Math.abs(offset.x);
    if (judged) {
      // After the verdict the swipe never blocks: any direction past the threshold moves on,
      // flying the card out the way it was thrown.
      if (vertical) onDragNext('up');
      else if (offset.x > 90) onDragNext('right');
      else if (offset.x < -90) onDragNext('left');
      else springBack();
      return;
    }
    if (vertical) {
      // Up = arm the joker for this card (a declaration, not a verdict), then settle back.
      onDragArm();
      springBack();
    } else if (offset.x > 90) {
      onDragJudge('accept');
    } else if (offset.x < -90) {
      onDragJudge('reject');
    } else {
      springBack();
    }
  };

  // Verdict lock: once a direction is committed, the card animates to a fixed off-screen
  // target rather than continuing on drag momentum — the outcome (and its color) needs to
  // be deterministic, not dependent on exactly how hard the release throw was.
  const verdictColor = judgedMode === 'accept' ? '#0F9E6E' : judgedMode === 'reject' ? '#E8564B' : '#000000';
  const target = !flying
    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, borderColor: '#000000' }
    : flyDir === 'up'
      ? { x: 0, y: -700, rotate: 0, scale: 1, opacity: 0, borderColor: verdictColor }
      : flyDir === 'left'
        ? { x: -480, y: -30, rotate: -22, scale: 1, opacity: 0, borderColor: verdictColor }
        : { x: 480, y: -30, rotate: 22, scale: 1, opacity: 0, borderColor: verdictColor };

  return (
    <motion.div
      className={`flashcard ${judged ? 'is-judged' : ''}`}
      style={{
        x,
        y,
        rotate,
        borderColor,
        '--subject-color': subjectColor || 'var(--neo-orange)',
      } as any}
      // Draggable before AND after the verdict — post-verdict drags advance instead of judging
      // (see handleDragEnd). Only the typing beat is off-limits.
      drag={!typing && !flying}
      // 0.55 = the physical "resistance": at 1 the card would track the finger 1:1 with no
      // give, at 0 it wouldn't move past the origin at all.
      dragElastic={0.55}
      // Momentum is off deliberately — release-throw physics are replaced by the fixed
      // `target` animation above once a verdict is locked.
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      // Each new card mounts fresh (key={card.id}), so this initial state is what makes it
      // arrive with a soft pop rather than snapping straight to rest.
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
      {children}
    </motion.div>
  );
}
