import { useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { StreakFlameIcon } from "@/components/StreakFlameIcon";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { fireConfetti } from "@/lib/confetti";
import { CONTENT_LEVEL_NOTE, LEVELS } from "@/data";
import { COPY } from "@/lib/copy";
import { DEFAULT_TONE, pickLine } from "@/lib/tone";
import type { Level, Personality } from "@/types";

type Mood = "happy" | "proud" | "cool" | "eager";

// No consent step: nothing leaves the device (no account, no server, no AI), so there is nothing
// to consent to. Bring it back when a backend does.
const STEPS = ["welcome", "name", "level", "tone", "rhythm", "ready"] as const;
type StepId = (typeof STEPS)[number];
// Steps that show the progress bar: every question, not the two "hero" moments around them.
const QUESTION_COUNT = STEPS.length - 1;

const LEVEL_INFO: Record<string, { tag: string; icon: string; reaction: string }> = {
  "2nde": {
    tag: "Nouveau lycée",
    icon: "🌱",
    reaction: "2nde, nouveau rythme. On pose de bonnes bases ensemble.",
  },
  "1ere": {
    tag: "Bac de français",
    icon: "✍️",
    reaction: "1ère, bac de français au bout. Pour l’instant : les bases de 2nde.",
  },
  term: {
    tag: "Année du bac",
    icon: "🎓",
    reaction: "Terminale, année du bac. Pour l’instant : les bases de 2nde.",
  },
};

const TONES: { id: Personality; title: string; desc: string; sample: string; mood: Mood }[] = [
  {
    id: "chill",
    title: "Pote Chill",
    desc: "Doux, rassurant, zéro pression.",
    sample: "Pas de stress. On reprend ça tranquille, une étape à la fois.",
    mood: "happy",
  },
  {
    id: "savage",
    title: "Coach énergie",
    desc: "Direct, énergique, second degré.",
    sample: "Ce piège-là attrape tout le monde. Pas toi, cette fois.",
    mood: "cool",
  },
];

const RHYTHMS = [
  {
    id: "tranquille",
    title: "Tranquille",
    desc: "Un peu chaque jour, sans prise de tête.",
    flames: 1,
  },
  {
    id: "regulier",
    title: "Régulier",
    desc: "Le bon rythme pour progresser.",
    flames: 2,
  },
  {
    id: "a-fond",
    title: "À fond",
    desc: "Pour les périodes de contrôles.",
    flames: 3,
  },
];

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

// What the app is, said in its own words, on the very first screen. Three real things it does —
// no promise, no number it cannot keep.
const PITCH: { icon: string; title: string; line: string }[] = [
  { icon: "🔥", title: "Le Déclic", line: "Une notion expliquée comme un pote te l’expliquerait." },
  { icon: "🃏", title: "Carré ou Intox", line: "Tu tranches, je te dis pourquoi. Sans note." },
  {
    icon: "⏱️",
    title: "2 minutes",
    line: "Assez pour que ça reste. Pas assez pour que ça saoule.",
  },
];

// Onboarding as a first conversation with Braise, not a form: one question per screen, Braise types
// its lines and reacts to every answer — the tone choice literally switches how it talks. Ends on a
// "pass" that reflects the student's answers back before the app opens.
//
// Everything that frames the conversation sits at the SAME place on all six screens: the step pips,
// Braise in its seat with the bubble, the answers, the button. Braise used to morph between a 200px
// welcome hero, a 128px centred seat on the name screen and a 60px one elsewhere, and two screens
// re-centred themselves vertically — so the one thing a student follows, the line being said and
// what to tap under it, moved on every step. The screens still change colour at the two ends; the
// furniture does not move.
export function OnboardingView() {
  const { state, completeOnboarding } = useApp();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  // Braise's reply to the answer just given on this screen — cleared on every screen change.
  const [reaction, setReaction] = useState<{ text: string; mood: Mood } | null>(null);

  const stepId: StepId = STEPS[step];
  const trimmedName = name.trim();
  const tone = TONES.find((t) => t.id === personality);
  // Until a tone is picked the app speaks Chill; every later line follows the student's choice.
  const voiceTone = personality ?? DEFAULT_TONE;
  const rhythm = RHYTHMS.find((r) => r.id === goal);

  const canContinue: Record<StepId, boolean> = {
    welcome: true,
    name: trimmedName.length > 0,
    level: level !== null,
    tone: personality !== null,
    rhythm: goal !== null,
    ready: true,
  };

  const question: Record<StepId, { text: string; mood: Mood }> = {
    welcome: {
      text: "Salut, moi c’est Braise. Tes cours, expliqués comme par un pote.",
      mood: "happy",
    },
    name: { text: "Comment je t’appelle ?", mood: "eager" },
    level: { text: `Enchanté, ${trimmedName} ! T’es en quelle classe ?`, mood: "happy" },
    tone: { text: "Et tu me préfères comment ? Touche pour m’entendre.", mood: "eager" },
    // Said after the tone was picked, so it is already in that tone.
    rhythm: { text: pickLine(voiceTone, COPY.onboarding.rhythmQuestion), mood: "happy" },
    ready: {
      text: `Bienvenue, ${trimmedName}\u00a0! ${pickLine(voiceTone, COPY.onboarding.readySubtitle)}`,
      mood: "proud",
    },
  };
  const line = reaction ?? question[stepId];

  const tap = () => sfx.tap(state.soundOn);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setReaction(null);
    setStep(next);
  };

  const next = () => {
    if (!canContinue[stepId]) return;
    if (stepId === "ready") return finish();
    if (STEPS[step + 1] === "ready") sfx.complete(state.soundOn);
    else sfx.whoosh(state.soundOn);
    goTo(step + 1);
  };

  const back = () => {
    tap();
    goTo(step - 1);
  };

  const finish = () => {
    if (!level || !personality || !goal) return;
    tap();
    completeOnboarding({
      ...state.user,
      name: trimmedName,
      level: level.id,
      levelLabel: level.label,
      // No subject question any more: an empty list means "no preference", and Moi still lets
      // the student pick later. Pre-filling defaults here would be a preference they never gave.
      subjects: [],
      personality,
      goal,
      joinedAt: Date.now(),
    });
  };

  useEffect(() => {
    if (stepId === "ready" && !reducedMotion) fireConfetti();
  }, [stepId, reducedMotion]);

  const ctaLabel: Record<StepId, string> = {
    welcome: "On y va !",
    name: "Continuer",
    level: "Continuer",
    tone: "Continuer",
    rhythm: "Continuer",
    ready: "C’est parti !",
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className={`onb onb--${stepId}`}>
          <header className="onb-top">
            {/* Kept in place, not removed, on the first screen: taking it out would shift the pips
                and everything under them sideways on the very next step. */}
            <button
              type="button"
              className="onb-back"
              onClick={back}
              aria-label="Retour"
              disabled={step === 0}
            >
              <ArrowLeft size={20} strokeWidth={2.6} />
            </button>
            <div
              className="onb-pips"
              role="progressbar"
              aria-label="Progression"
              aria-valuemin={0}
              aria-valuemax={QUESTION_COUNT}
              aria-valuenow={step}
            >
              {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                <span key={i} className={i < step ? "is-done" : ""} aria-hidden="true" />
              ))}
            </div>
          </header>

          {/* Braise's seat: same size, same corner, on every screen. Only what it says changes —
              and it pops once when it reacts to an answer. */}
          <div className="onb-scene">
            <motion.div
              className="onb-avatar"
              animate={reaction ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.34 }}
            >
              <BraiseMascot size={62} mood={line.mood} />
            </motion.div>
            <Bubble key={line.text} text={line.text} />
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={step}
              className={`onb-body onb-body--${stepId}`}
              initial={{ opacity: 0, x: 32 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 * direction }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {stepId === "welcome" && (
                <ul className="onb-pitch">
                  {PITCH.map((p, i) => (
                    <motion.li
                      key={p.title}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 + i * 0.09 }}
                    >
                      <span className="onb-pitch-icon" aria-hidden="true">
                        {p.icon}
                      </span>
                      <span>
                        <b>{p.title}</b>
                        <small>{p.line}</small>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}

              {stepId === "name" && (
                <input
                  className="onb-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") next();
                  }}
                  placeholder="Ton prénom"
                  aria-label="Ton prénom"
                  maxLength={24}
                  autoComplete="given-name"
                  autoFocus
                />
              )}
              {/* Said where it is asked, not only on the last screen: a first name is the one
                  personal thing the app ever requests, and a student handed a stranger's phone in a
                  test deserves the answer at that moment. Must stay literally true. */}
              {stepId === "name" && (
                <p className="onb-hint">
                  Juste pour savoir comment t’appeler. Ça reste sur ton téléphone.
                </p>
              )}

              {stepId === "level" && (
                <>
                  <div className="onb-stack onb-stack--fill">
                    {LEVELS.map((l) => (
                      <Tile
                        key={l.id}
                        selected={level?.id === l.id}
                        className="onb-tile--row"
                        onSelect={() => {
                          tap();
                          setLevel(l);
                          setReaction({
                            text: LEVEL_INFO[l.id]?.reaction ?? "Noté !",
                            mood: "proud",
                          });
                        }}
                      >
                        <span>
                          <b>{l.label}</b>
                          <small>{LEVEL_INFO[l.id]?.tag}</small>
                        </span>
                        <span className="onb-tile-icon" aria-hidden="true">
                          {LEVEL_INFO[l.id]?.icon}
                        </span>
                      </Tile>
                    ))}
                  </div>
                  <p className="onb-hint">{CONTENT_LEVEL_NOTE}</p>
                </>
              )}

              {stepId === "tone" && (
                <>
                  <div className="onb-stack onb-stack--fill">
                    {TONES.map((t) => (
                      <Tile
                        key={t.id}
                        selected={personality === t.id}
                        className="onb-tile--row onb-tile--tone"
                        onSelect={() => {
                          tap();
                          setPersonality(t.id);
                          setReaction({ text: t.sample, mood: t.mood });
                        }}
                      >
                        <span className="onb-tone-face" aria-hidden="true">
                          <BraiseMascot size={44} mood={t.mood} />
                        </span>
                        <span>
                          <b>{t.title}</b>
                          <small>{t.desc}</small>
                        </span>
                      </Tile>
                    ))}
                  </div>
                  <p className="onb-hint">Tu pourras changer ça quand tu veux, dans Moi.</p>
                </>
              )}

              {stepId === "rhythm" && (
                <div className="onb-stack onb-stack--fill">
                  {RHYTHMS.map((r) => (
                    <Tile
                      key={r.id}
                      selected={goal === r.id}
                      className="onb-tile--row onb-tile--rhythm"
                      onSelect={() => {
                        tap();
                        setGoal(r.id);
                        setReaction({
                          text: pickLine(voiceTone, COPY.onboarding.rhythm[r.id]),
                          mood: r.id === "a-fond" ? "cool" : "happy",
                        });
                      }}
                    >
                      <span>
                        <b>{r.title}</b>
                        <small>{r.desc}</small>
                      </span>
                      <span className="onb-flames" aria-label={`Intensité ${r.flames} sur 3`}>
                        {[1, 2, 3].map((i) => (
                          <span key={i} className={i <= r.flames ? "is-lit" : ""}>
                            <StreakFlameIcon size={18} />
                          </span>
                        ))}
                      </span>
                    </Tile>
                  ))}
                </div>
              )}

              {stepId === "ready" && level && tone && rhythm && (
                <motion.div
                  className="onb-pass"
                  initial={{ opacity: 0, y: 60, rotate: -4 }}
                  animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                  transition={{ ...SPRING, delay: 0.15 }}
                >
                  <span className="onb-pass-kicker">Ton pass Braise</span>
                  <dl>
                    <div>
                      <dt>Prénom</dt>
                      <dd>{trimmedName}</dd>
                    </div>
                    <div>
                      <dt>Classe</dt>
                      <dd>{level.label}</dd>
                    </div>
                    <div>
                      <dt>Ton de Braise</dt>
                      <dd>{tone.title}</dd>
                    </div>
                    <div>
                      <dt>Rythme</dt>
                      <dd>{rhythm.title}</dd>
                    </div>
                  </dl>
                </motion.div>
              )}
            </motion.section>
          </AnimatePresence>

          <footer className="onb-footer">
            {stepId === "ready" && (
              // In the footer, not the page: a long first name makes the title wrap and pushes
              // everything down, and a note in the page flow ended up hidden under this button.
              // Must stay literally true: when accounts or cloud sync land, this line changes.
              <p className="onb-hint onb-footnote">
                Ta progression reste sur cet appareil. Tu pourras la sauvegarder dans Moi.
              </p>
            )}
            <motion.button
              type="button"
              className="onb-cta"
              onClick={next}
              disabled={!canContinue[stepId]}
              whileTap={canContinue[stepId] ? { x: 3, y: 3 } : undefined}
            >
              {ctaLabel[stepId]}
            </motion.button>
          </footer>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

// Braise "types" its line, like a message arriving. The full text sits invisibly underneath so the
// bubble takes its final size at once (no layout jump while typing), and screen readers get the
// whole sentence immediately through the sr-only copy. Keyed by text in the parent, so every new
// line starts from zero without resetting state inside an effect.
function Bubble({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (count >= text.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 18);
    return () => clearTimeout(t);
  }, [count, text.length]);

  return (
    <motion.h2
      className="onb-bubble"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING}
      style={{ transformOrigin: "bottom left" }}
    >
      <span className="onb-bubble-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="onb-bubble-live" aria-hidden="true">
        {text.slice(0, count)}
      </span>
      <span className="sr-only" aria-live="polite">
        {text}
      </span>
    </motion.h2>
  );
}

function Tile({
  selected,
  className,
  onSelect,
  children,
}: {
  selected: boolean;
  className?: string;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      className={`onb-tile ${className ?? ""} ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
      whileTap={{ x: 2, y: 2 }}
      animate={selected ? { scale: [1, 1.035, 1] } : { scale: 1 }}
      transition={{ duration: 0.28 }}
    >
      {children}
    </motion.button>
  );
}
