import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import { Flag, Check, X, Zap, BookOpen } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { fireConfetti, fireMicroConfetti } from "@/lib/confetti";
import { speak, stopSpeaking } from "@/lib/speech";
import { BraiseRecap } from "@/components/BraiseRecap";
import { BraiseMascot } from "@/components/BraiseMascot";
import { CardStack, QuestionCard, AnswerCard } from "@/components/RevisionCards";
import {
  getAgeGroup,
  judgePrompt,
  missedTruth,
  quizCorrect,
  quizWrong,
  verdictTag,
} from "@/lib/braiseVoice";
import { reportCard } from "@/lib/reports";
import { getRevisionMode, REVISION_MODE_SIZE, REVISION_SNAPSHOT_KEY } from "@/lib/revisionMode";
import { FLASHCARDS, SUBJECTS } from "@/data";
import type { Flashcard, Confidence } from "@/types";

// Plain direct localStorage key, deliberately outside the app's main progress-sync system
// (src/lib/persist.ts) — that store is a typed, debounced model of account progress (XP,
// streak, completed chapters...), and this is a single one-way "has this device ever seen the
// tutorial" flag with no need to round-trip through that machinery.
const TUTORIAL_SEEN_KEY = "sapie_rev_tutorial_seen";
// Same one-way "seen it once" pattern, for the joker's first-ever charge-complete explainer.
const JOKER_SEEN_KEY = "sapie_joker_seen";

// A session is a sprint, not the whole library: the Home arcade card chooses 15-card Mix or
// 5-card Express. Opening the Réviser tab directly keeps Mix as the zero-setup default.
// In-progress session snapshot so "Revoir la notion" (which leaves for the chapter's chat)
// comes back to the NEXT card with the streak, joker charge and totals intact, instead of
// remounting a brand-new deck at 1/15. sessionStorage, not localStorage: a session is a
// single sitting, it has no business surviving the tab.
const SESSION_SNAPSHOT_KEY = REVISION_SNAPSHOT_KEY;
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
  maths: "Maths",
  francais: "Français",
  "histoire-geo": "Histoire-Géo",
  svt: "SVT",
  physique: "Physique",
  anglais: "Anglais",
};

export function RevisionsView() {
  const { state, reviewCard, getDueCards } = useApp();
  const [mode] = useState(getRevisionMode);
  const sessionSize = REVISION_MODE_SIZE[mode];
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
      if (age === "college" ? c.level === "easy" : c.level === "hard") p += 0.3;
      return p;
    };
    const picked = [...FLASHCARDS]
      .map((c) => ({ c, p: priority(c) }))
      .sort((a, b) => b.p - a.p)
      .slice(0, sessionSize)
      .map(({ c }) => c);
    for (let i = picked.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picked[i], picked[j]] = [picked[j], picked[i]];
    }
    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, resume, sessionSize]);

  return (
    <div className="view is-active rev-view">
      {/* "user": follows the OS/browser prefers-reduced-motion setting, not a manual toggle —
          transform-based animations (scale/rotate/x/y: the card punch, the Suivant pulse, the
          win shiver, drag tilt, the strike-through draw) snap straight to their end state
          instead of animating; opacity crossfades (the subject-colour stage, card entrances)
          still run, since those carry real information and aren't the vestibular-triggering
          kind this setting exists for. */}
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </div>
  );
}

type Verdict = "accept" | "reject";
type FlyDir = "left" | "right" | "up";

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
  // Confetti isn't a transform MotionConfig can neuter (it's a canvas particle burst, not a
  // framer animation) — gated explicitly. The verdict is still fully communicated without it
  // (colour, chips, text), so skipping it under reduced motion loses nothing but the flourish.
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(resume?.index ?? 0);
  const [isTrueAnswer, setIsTrueAnswer] = useState(true);
  const [judged, setJudged] = useState(false);
  // The verdict itself, the instant it lands — colours the card's fly-out border later, when
  // `flying` turns truthy on "next".
  const [judgedMode, setJudgedMode] = useState<Verdict | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [flying, setFlying] = useState(false);
  const [flyDir, setFlyDir] = useState<FlyDir>("right");
  // Verdict feedback: emoji tag, Braise's line, and the XP won (0 on a miss) — rendered
  // inside the answer card (verdict bar on top, Braise's line as footer).
  const [feedback, setFeedback] = useState<{ tag: string; text: string; xp: number } | null>(null);
  // Picked once per card (in the index effect), not in render — byCombo() draws at random,
  // so reading it during render would reshuffle the wording on every re-render mid-card.
  const [prompt, setPrompt] = useState("");
  const [combo, setCombo] = useState(resume?.combo ?? 0);
  const [maxCombo, setMaxCombo] = useState(resume?.maxCombo ?? 0);
  const [xpEarned, setXpEarned] = useState(resume?.xpEarned ?? 0);
  const [reviewed, setReviewed] = useState(resume?.reviewed ?? 0);
  const [wrongCount, setWrongCount] = useState(resume?.wrongCount ?? 0);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(true);
  const [reported, setReported] = useState(false);
  // The flag swapping to a checkmark was the only feedback reporting a card ever gave — no
  // word confirming the tap actually did something. This is a one-shot toast, not a persistent
  // label (the checkmark already stays), so a plain effect tied to the click is enough — no
  // need for the joker burst's "survives a remount" trick, this button never unmounts mid-card.
  const [showReportTip, setShowReportTip] = useState(false);
  useEffect(() => {
    if (!showReportTip) return;
    const t = setTimeout(() => setShowReportTip(false), 2200);
    return () => clearTimeout(t);
  }, [showReportTip]);
  // Joker: `jokerCharge` counts consecutive correct answers toward JOKER_CHARGE_NEEDED;
  // `armed` is the player's "sûr de moi" declaration for THIS card, applied to whichever
  // verdict they give next (INTOX or CARRÉ — it used to be accept-only, so you could never
  // bet on catching a lie).
  const [jokerCharge, setJokerCharge] = useState(resume?.jokerCharge ?? 0);
  const [armed, setArmed] = useState(false);
  const jokerReady = jokerCharge >= JOKER_CHARGE_NEEDED;
  // The charge completing and `judged` flipping true happen in the very same commit (both set
  // inside judge()), which swaps the dock to its "next" state before the joker button — and
  // the burst ring on it — ever gets to render. A plain `{jokerReady && <ring/>}` would not
  // only miss that first moment, it would then wrongly replay on every later card as long as
  // the joker stays unspent (the verdict dock fully remounts each card, so a freshly-true
  // condition there looks identical to a genuinely new charge either way). This flag survives
  // that remount instead: it flips true exactly once per charge-up and clears itself shortly
  // after, so the ring fires on the very next moment the joker button is actually on screen —
  // normally the next card — and never again until the joker is spent and earned afresh.
  const [jokerJustCharged, setJokerJustCharged] = useState(false);
  // First-time-only explainer: the burst ring above tells a RETURNING player something just
  // happened; a first-time player needs the sentence too, or the button just silently changed
  // colour for no stated reason. Persisted like the swipe tutorial below — seen once, never
  // shown again on this device.
  const [jokerExplainerSeen, setJokerExplainerSeen] = useState(() => {
    try {
      return localStorage.getItem(JOKER_SEEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [showJokerExplainer, setShowJokerExplainer] = useState(false);
  const jokerWasReady = useRef(false);
  useEffect(() => {
    if (jokerReady && !jokerWasReady.current) {
      setJokerJustCharged(true);
      const t = setTimeout(() => setJokerJustCharged(false), 700);
      if (!jokerExplainerSeen) {
        setShowJokerExplainer(true);
        setJokerExplainerSeen(true);
      }
      jokerWasReady.current = jokerReady;
      return () => clearTimeout(t);
    }
    jokerWasReady.current = jokerReady;
  }, [jokerReady, jokerExplainerSeen]);
  useEffect(() => {
    if (!jokerExplainerSeen) return;
    try {
      localStorage.setItem(JOKER_SEEN_KEY, "1");
    } catch {
      // ignore quota/availability errors, same defensive pattern as lib/persist.ts
    }
  }, [jokerExplainerSeen]);
  // Only counts down once the joker button is actually back on screen (`!judged` — the dock
  // swaps away from the verdict row the instant a card is answered, same timing quirk as
  // jokerJustCharged above): a player who lingers on the previous card's feedback still gets
  // the full read, instead of a countdown that finishes before they ever see the bubble.
  useEffect(() => {
    if (!showJokerExplainer || judged) return;
    const t = setTimeout(() => setShowJokerExplainer(false), 3500);
    return () => clearTimeout(t);
  }, [showJokerExplainer, judged]);
  // First-card-only swipe tutorial. Dismissed permanently the moment the player does anything
  // — starts a drag or taps a verdict button. Seeded from localStorage (lazy initializer, read
  // exactly once per mount) so a returning player never sees it again once they've dismissed
  // it a single time in their life.
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) === "1";
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
    if (cards.length > 0 && index === cards.length && !reducedMotion) fireConfetti();
  }, [index, cards.length, reducedMotion]);

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
      localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      // ignore quota/availability errors, same defensive pattern as lib/persist.ts
    }
  }, [tutorialDismissed]);

  // This is a web app, not only a mobile wrapper — a player at a laptop reaches for arrow keys
  // by reflex, and the touch-only swipe/tap surface has no equivalent for them. Mirrors the
  // swipe semantics: ← Intox / → Carré / ↑ arme le joker before a verdict, any of the three
  // (plus Enter/Espace) advances after one, matching "any direction moves on" once judged.
  // MUST be declared before the two early returns below (empty deck / session complete) — every
  // hook in a component has to run on every render regardless of which branch returns, and
  // `index` genuinely reaches `cards.length` within a single mounted instance's lifetime (a
  // session finishing), so this isn't just a lint nitpick: an earlier version had this effect
  // AFTER those returns, and finishing a session called one fewer hook than every render before
  // it — React's "Rendered fewer hooks than expected" crash, straight to a blank white screen.
  // `judge`/`toggleArm`/`skipToNext` are defined further down (they close over `card`, which
  // only exists past both early returns) — fine for the closure itself (effects only run after
  // the full render, by which point those consts are assigned, in the branch that reaches
  // them), but onKeyDown guards on `cards`/`index` BEFORE ever touching them, so the early-return
  // renders — where those consts were never assigned at all — never try to read them either.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0 || index >= cards.length) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (judged) {
        if (
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "Enter" ||
          e.key === " "
        ) {
          e.preventDefault();
          skipToNext();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        judge("reject");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        judge("accept");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        toggleArm();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleListen = (text: string) => {
    sfx.tap(soundOn);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  };

  if (cards.length === 0) {
    // Genuinely rare (needs FLASHCARDS itself to be empty) but was a single unstyled grey line
    // with no way back — anyone who did land on it would have read it as a bug, not a designed
    // state, and had no path except the browser's own back button.
    return (
      <div className="rev-empty">
        <BraiseMascot size={72} mood="hesitant" />
        <p className="rev-empty-title">Rien à réviser pour l'instant</p>
        <p className="rev-empty-sub">
          Termine quelques cours et reviens — je te prépare un nouveau lot de cartes.
        </p>
        <button type="button" className="rev-empty-btn" onClick={() => setTab("home")}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <BraiseRecap
        reviewed={reviewed}
        wrongCount={wrongCount}
        maxCombo={maxCombo}
        xpEarned={xpEarned}
        onRestart={onRestartSession}
        onGoHome={() => setTab("home")}
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
    setShowJokerExplainer(false);
    setArmed((a) => !a);
  };

  const judge = (mode: Verdict) => {
    if (judged || typing) return;
    setTutorialDismissed(true);
    setShowJokerExplainer(false);
    const useSuper = armed && jokerReady;
    const acceptedAsTrue = mode === "accept";
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
      setFeedback({
        tag: verdictTag(voiceCtx, useSuper ? "super" : "carre"),
        text: quizCorrect(voiceCtx),
        xp: total,
      });
      // Immediate, physical: a small burst fires from the side of the dock that was pressed
      // (INTOX left / CARRÉ right), the whole stack shivers, the result strip pops in.
      if (!reducedMotion) fireMicroConfetti(mode === "accept" ? 0.76 : 0.24, 0.9, useSuper);
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
        // Layered on top of sfx.correct's own chime, not instead of it — the rest of the app
        // already has a distinct sound for exactly this moment (Home's own streak, a lesson's
        // streak) and Réviser's combo, its whole core mechanic, never called it. Same ≥3
        // threshold as the header pill's `.is-hot` — the sound and the visual agree on what
        // counts as "hot" instead of the streak being silent no matter how long it runs.
        if (next >= 3) sfx.streak(soundOn);
        return next;
      });
    } else {
      sfx.wrong(soundOn);
      setWrongCount((w) => w + 1);
      setFeedback(
        isTrueAnswer
          ? { tag: verdictTag(voiceCtx, "aie"), text: missedTruth(voiceCtx), xp: 0 }
          : { tag: verdictTag(voiceCtx, "grille"), text: quizWrong(voiceCtx, card.topic), xp: 0 },
      );
      setCombo(0);
      setJokerCharge(0);
    }
    onReview(card.id, correctJudgment ? "sure" : "not-sure");
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
    advance("right");
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
    bridgeToChat(card.subject, card.chapterId, ask, "revisions");
  };

  const progressPct = ((index + (judged ? 1 : 0.5)) / cards.length) * 100;
  // Held off until typing finishes so the hint doesn't compete with the answer bubble's own
  // entrance, and dropped the instant the first card is judged or flying away, whichever
  // comes first.
  const showTutorial = index === 0 && !typing && !judged && !flying && !tutorialDismissed;

  return (
    <>
      <div className="flash-stack">
        {/* The subject-coloured scene, decoupled from the card that remounts on every
            `card.id` — without this, the whole stage hard-cuts colour the instant a new card
            pops in. AnimatePresence with the default (overlapping) mode is the point: the
            outgoing colour fades out while the incoming one fades in, so a Maths→SVT change
            dissolves instead of jump-cutting. Sits behind .flashcard by DOM order (both are
            inset:0 with no z-index of their own; .rev-top-row/.rev-dock's explicit z-index
            already keeps the chrome above both). */}
        <div className="flash-stage" aria-hidden="true">
          <AnimatePresence>
            <motion.div
              key={subject?.id ?? "default"}
              className="flash-stage-layer"
              style={
                { "--subject-color": subject?.color || "var(--neo-blue)" } as React.CSSProperties
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </AnimatePresence>
          <div className="flash-stage-dots" />
        </div>
        {/* Header: count · progress · combo (slot always reserved so the bar never jumps
            when a streak starts or breaks) · report · quit. Report lives up here now, styled
            as a sibling of the quit button, off the card's reading area. */}
        <div className="rev-top-row">
          <span className="rev-count">
            {index + 1}/{cards.length}
          </span>
          <div className="rev-progress-track">
            {/* Persistent element (no remount key) — a spring needs a previous value to
                interpolate from, and a fresh mount would just snap to the new width instead of
                filling. The win-flash ring below only needs the class to go absent → present,
                which restarts its CSS animation on its own, no remount required either. */}
            <div className={`rev-progress-bar ${judged && wasCorrect ? "is-win-flash" : ""}`}>
              <motion.span
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              />
            </div>
          </div>
          <span className="rev-combo-slot" aria-live="polite">
            {combo >= 1 && (
              <span
                key={combo}
                className={`rev-combo rev-combo-shake ${combo >= 3 ? "is-hot" : ""}`}
              >
                🔥 ×{combo}
              </span>
            )}
          </span>
          <div className="relative">
            <AnimatePresence>
              {showReportTip && (
                <motion.div
                  className="report-tip"
                  role="status"
                  initial={{ opacity: 0, y: -6, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 480, damping: 30 }}
                >
                  Merci, on regarde ça !
                </motion.div>
              )}
            </AnimatePresence>
            <button
              className={`rev-icon-btn ${reported ? "is-reported" : ""}`}
              onClick={() => {
                if (reported) return;
                sfx.tap(soundOn);
                setReported(true);
                setShowReportTip(true);
                reportCard(card.id, card.q);
              }}
              aria-label={reported ? "Signalé, merci" : "Signaler un problème sur cette carte"}
            >
              {reported ? (
                <Check size={15} strokeWidth={3} />
              ) : (
                <Flag size={15} strokeWidth={2.5} />
              )}
            </button>
          </div>
          <button
            className="rev-icon-btn"
            onClick={() => {
              sfx.tap(soundOn);
              writeSnapshot(null);
              setTab("home");
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
          onDragJudge={judge}
          onDragArm={toggleArm}
          onDragNext={(dir) => advance(dir)}
          onFlyComplete={onAdvanceComplete}
          onDragStart={() => setTutorialDismissed(true)}
          onTap={judged ? skipToNext : undefined}
        >
          <div className="fc-scroll">
            {/* A giant watermark of the subject's own emoji, faint behind the cards — fills
                the vertical space between header and dock with texture instead of empty
                colour, without competing with the cards sitting on top of it (z-index below
                CardStack, which stakes its own stacking context). */}
            <span className="fc-watermark" aria-hidden="true">
              {subject?.emoji ?? "📚"}
            </span>
            {/* The centre of the screen: question, claim, then the result strip once judged —
                one column, centred both ways, `layout` so the stack re-flows smoothly as the
                correction unfolds and the result strip slots in. On a win it shivers once. */}
            <motion.div
              className="relative flex w-full flex-1 flex-col"
              layout
              animate={judged && wasCorrect ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <CardStack>
                <QuestionCard
                  question={card.q}
                  emoji={subject?.emoji ?? "📚"}
                  color={subject?.color ?? "var(--sun)"}
                  subjectLabel={SUBJECT_SHORT[card.subject] ?? subject?.name ?? ""}
                  topic={card.topic}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <AnswerCard
                    key={typing ? "typing" : "claim"}
                    typing={typing}
                    claim={shownAnswer}
                    truth={card.a}
                    wasLie={!isTrueAnswer}
                    judged={judged}
                    verdict={judged ? (wasCorrect ? "win" : "miss") : null}
                    prompt={prompt}
                    subjectColor={subject?.color ?? "var(--sun)"}
                    tutorial={showTutorial}
                    result={
                      judged && feedback
                        ? {
                            verdict: wasCorrect ? "win" : "miss",
                            tag: feedback.tag,
                            text: feedback.text,
                            xp: feedback.xp,
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
                transition={{ duration: 0.14, ease: "easeIn" }}
              >
                <div className="rev-actions">
                  <motion.div className="flex-1" style={{ scale: rejectLift }}>
                    <BevelButton
                      className="w-full"
                      base="bg-[var(--coral-2)]"
                      face="bg-[var(--coral)] text-white"
                      onClick={() => judge("reject")}
                      label="Intox — c'est faux"
                      badge={armed ? "+30" : "+15"}
                    >
                      <X size={20} strokeWidth={3.2} />
                      <span>Intox</span>
                    </BevelButton>
                  </motion.div>
                  <div className="relative flex-shrink-0">
                    {/* `jokerJustCharged`, not `jokerReady` — see where it's computed: the
                        charge completes in the same commit that swaps the dock away, so this
                        button (and this ring) don't exist yet at that instant. This flag
                        survives to the next time they do. */}
                    {jokerJustCharged && (
                      <span key="joker-burst" className="joker-burst-ring" aria-hidden="true" />
                    )}
                    <AnimatePresence>
                      {showJokerExplainer && (
                        <motion.div
                          className="joker-tip"
                          role="status"
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 480, damping: 30 }}
                        >
                          Il est prêt ! ×2 sur ta prochaine bonne réponse.
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <BevelButton
                      className="w-[62px]"
                      round
                      base={armed ? "bg-black" : jokerReady ? "bg-[var(--sun-ink)]" : "bg-black/30"}
                      face={
                        armed
                          ? "bg-black text-[var(--sun)]"
                          : jokerReady
                            ? "bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black"
                            : "bg-[var(--rev-paper)] text-black/40 border-dashed"
                      }
                      onClick={toggleArm}
                      pressed={armed}
                      label={
                        jokerReady
                          ? armed
                            ? "Joker armé : ×2 sur ta prochaine réponse"
                            : "Joker — double les points de ta prochaine réponse"
                          : `Joker — se charge avec ${JOKER_CHARGE_NEEDED} bonnes réponses d'affilée`
                      }
                      badge={jokerReady ? "×2" : `${jokerCharge}/${JOKER_CHARGE_NEEDED}`}
                      badgeTone={jokerReady ? "hot" : "muted"}
                    >
                      <Zap size={22} strokeWidth={2.6} />
                    </BevelButton>
                  </div>
                  <motion.div className="flex-1" style={{ scale: acceptLift }}>
                    <BevelButton
                      className="w-full"
                      base="bg-[var(--mint-text)]"
                      face="bg-[var(--mint)] text-black"
                      onClick={() => judge("accept")}
                      label="Carré — c'est vrai"
                      badge={armed ? "+30" : "+15"}
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
                    face="bg-[var(--rev-paper)] text-black"
                    onClick={reviewNotion}
                    label="Revoir la notion"
                    compact
                  >
                    <BookOpen size={17} strokeWidth={2.6} />
                    <span>Revoir la notion</span>
                  </BevelButton>
                  {/* A one-shot invite pulse, not a loop — the eye is still on the verdict up
                      in the card when this dock mounts; this is what pulls it back down to
                      the next action instead of leaving the player to notice the dock swapped
                      on their own. Fresh on every card (this whole block remounts per verdict
                      via the AnimatePresence key="next" above), so it fires exactly once each
                      time it's genuinely new, never on an idle re-render. */}
                  <motion.div
                    className="flex-1"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.045, 1] }}
                    transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
                  >
                    <BevelButton
                      className="w-full"
                      base="bg-[#b98a00]"
                      face="bg-gradient-to-b from-[#FFE066] to-[#FDC800] text-black"
                      onClick={skipToNext}
                      label="Carte suivante"
                    >
                      <span>Suivant</span>
                    </BevelButton>
                  </motion.div>
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
  badgeTone = "hot",
  round = false,
  compact = false,
  pressed,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  base: string;
  face: string;
  badge?: string;
  badgeTone?: "hot" | "muted";
  round?: boolean;
  compact?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  const radius = round ? "rounded-full" : "rounded-[22px]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`group relative block min-w-0 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 translate-y-[4px] ${radius} border-[2.5px] border-black ${base}`}
      />
      <span
        // Mouse-only lift (the `[@media(hover:hover)]` guard is what keeps this from sticking
        // after a tap on touch devices, where Tailwind's plain `hover:` would otherwise latch
        // on until the next unrelated tap) — this is also a web app, reached from a laptop via
        // the keyboard shortcuts, and until now nothing told a mouse it was over a button
        // before the click landed. Rises toward the cursor, the mirror of the press-down.
        className={`relative flex h-[58px] items-center justify-center gap-2 ${radius} border-[2.5px] border-black px-3 font-display font-black uppercase tracking-wide shadow-[4px_4px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.5)] transition-transform duration-100 [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:shadow-[5px_5px_0_#000,inset_0_1.5px_0_rgba(255,255,255,0.5)] group-active:translate-y-[4px] group-active:scale-[0.97] group-active:shadow-none ${
          compact ? "text-[0.82rem] normal-case tracking-normal" : "text-[1.02rem]"
        } ${face}`}
      >
        {children}
      </span>
      {badge && (
        <span
          aria-hidden="true"
          className={`absolute -top-2.5 right-2 rounded-md border-2 border-black px-1.5 py-0.5 font-display text-[0.62rem] font-black shadow-[2px_2px_0_#000] ${
            badgeTone === "hot" ? "bg-[var(--sun)] text-black" : "bg-white text-black/60"
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
  const borderColor = useTransform(x, [-140, 0, 140], ["#E8564B", "#000000", "#0F9E6E"]);
  // Full-card color wash layered on top of the content (see .fc-swipe-wash) — the border tint
  // alone reads as a thin accent; this makes the whole stage visibly lean red/green as you
  // drag. Together with the dock button lifting (SwipeDeck), that's the whole drag preview:
  // nothing is written over the cards while the student is moving them.
  const washColor = useTransform(
    x,
    [-140, 0, 140],
    ["rgba(232, 86, 75, 0.28)", "rgba(0, 0, 0, 0)", "rgba(15, 158, 110, 0.28)"],
  );

  const springBack = () => {
    // Released without crossing a threshold. With dragMomentum off and no dragConstraints,
    // framer freezes x/y wherever the finger lifted — forcing the spring back explicitly is
    // what keeps an aborted swipe from leaving the card stuck off-center and tilted.
    animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 32 });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    // Release threshold: 90px covers a comfortable thumb flick without being so short that
    // a small readjustment mid-read accidentally commits a verdict.
    const vertical = offset.y < -90 && Math.abs(offset.y) > Math.abs(offset.x);
    if (judged) {
      // After the verdict the swipe never blocks: any direction past the threshold moves on,
      // flying the card out the way it was thrown.
      if (vertical) onDragNext("up");
      else if (offset.x > 90) onDragNext("right");
      else if (offset.x < -90) onDragNext("left");
      else springBack();
      return;
    }
    if (vertical) {
      // Up = arm the joker for this card (a declaration, not a verdict), then settle back.
      onDragArm();
      springBack();
    } else if (offset.x > 90) {
      onDragJudge("accept");
    } else if (offset.x < -90) {
      onDragJudge("reject");
    } else {
      springBack();
    }
  };

  // Verdict lock: once a direction is committed, the card animates to a fixed off-screen
  // target rather than continuing on drag momentum — the outcome (and its color) needs to
  // be deterministic, not dependent on exactly how hard the release throw was.
  const verdictColor =
    judgedMode === "accept" ? "#0F9E6E" : judgedMode === "reject" ? "#E8564B" : "#000000";
  const target = !flying
    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, borderColor: "#000000" }
    : flyDir === "up"
      ? { x: 0, y: -700, rotate: 0, scale: 1, opacity: 0, borderColor: verdictColor }
      : flyDir === "left"
        ? { x: -480, y: -30, rotate: -22, scale: 1, opacity: 0, borderColor: verdictColor }
        : { x: 480, y: -30, rotate: 22, scale: 1, opacity: 0, borderColor: verdictColor };

  return (
    <motion.div
      className={`flashcard ${judged ? "is-judged" : ""}`}
      style={{ x, y, rotate, borderColor }}
      // Draggable before AND after the verdict — post-verdict drags advance instead of judging
      // (see handleDragEnd). Only the typing beat is off-limits.
      drag={!typing && !flying}
      // Commits to whichever axis the gesture starts on and holds it for the rest of that
      // drag, instead of letting x and y drift together — a swipe that starts slightly
      // diagonal used to blend the verdict tilt/colour-wash (driven by x) with the up-swipe
      // check (driven by y), reading as "mushy" rather than a clean, single-direction swipe.
      // It also means handleDragEnd's own vertical/horizontal branches see a cleaner signal:
      // whichever axis is locked stays near 0 on the other, so the two checks can't both
      // nearly-fire on the same ambiguous diagonal release.
      dragDirectionLock
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
          : { type: "spring", stiffness: 420, damping: 32 }
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
