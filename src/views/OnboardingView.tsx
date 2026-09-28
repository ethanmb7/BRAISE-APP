import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, MessageCircle, Smartphone } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';
import { LEVELS } from '@/data';
import type { Level, Personality } from '@/types';

type Mood = 'happy' | 'proud' | 'cool' | 'eager';

const STEPS = ['welcome', 'name', 'level', 'tone', 'rhythm', 'consent', 'ready'] as const;
type StepId = (typeof STEPS)[number];
// Steps that show the progress bar: every question, not the two "hero" moments around them.
const QUESTION_COUNT = STEPS.length - 1;

const LEVEL_INFO: Record<string, { tag: string; reaction: string }> = {
  '2nde': { tag: 'Nouveau lycée', reaction: 'La 2nde, nouveau rythme. On pose de bonnes bases ensemble.' },
  '1ere': { tag: 'Bac de français', reaction: 'La 1ère, avec le bac de français au bout. On va s’organiser.' },
  term: { tag: 'Année du bac', reaction: 'Terminale, l’année du bac. On va gérer ça ensemble.' },
};

const TONES: { id: Personality; title: string; desc: string; sample: string; mood: Mood }[] = [
  {
    id: 'chill',
    title: 'Pote Chill',
    desc: 'Doux, rassurant, zéro pression.',
    sample: 'Pas de stress. On reprend ça tranquille, une étape à la fois.',
    mood: 'happy',
  },
  {
    id: 'savage',
    title: 'Coach Savage',
    desc: 'Direct, énergique, second degré.',
    sample: 'Ce piège-là attrape tout le monde. Pas toi, cette fois.',
    mood: 'cool',
  },
];

const RHYTHMS = [
  { id: 'tranquille', title: 'Tranquille', desc: 'Un peu chaque jour, sans prise de tête.', flames: 1, reaction: 'Tranquille, ça marche. Un peu chaque jour, c’est déjà énorme.' },
  { id: 'regulier', title: 'Régulier', desc: 'Le bon rythme pour progresser.', flames: 2, reaction: 'Régulier, le bon plan. C’est comme ça qu’on retient pour de vrai.' },
  { id: 'a-fond', title: 'À fond', desc: 'Pour les périodes de contrôles.', flames: 3, reaction: 'À fond ! Je te préviens, je vais te suivre de près.' },
];

const SPRING = { type: 'spring', stiffness: 380, damping: 32 } as const;

// Onboarding as a first conversation with Braise, not a form: one question per screen, Braise
// stays on stage the whole time (it morphs from the welcome hero into the speaker's seat instead of
// being redrawn), types its lines, and reacts to every answer — the tone choice literally switches
// how it talks. Ends on a "pass" that reflects the student's answers back before the app opens.
export function OnboardingView() {
  const { state, completeOnboarding } = useApp();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  // Braise's reply to the answer just given on this screen — cleared on every screen change.
  const [reaction, setReaction] = useState<{ text: string; mood: Mood } | null>(null);

  const stepId: StepId = STEPS[step];
  const hero = stepId === 'welcome' || stepId === 'ready';
  const trimmedName = name.trim();
  const tone = TONES.find((t) => t.id === personality);
  const rhythm = RHYTHMS.find((r) => r.id === goal);

  const canContinue: Record<StepId, boolean> = {
    welcome: true,
    name: trimmedName.length > 0,
    level: level !== null,
    tone: personality !== null,
    rhythm: goal !== null,
    consent,
    ready: true,
  };

  const question: Record<StepId, { text: string; mood: Mood }> = {
    welcome: { text: '', mood: 'happy' },
    name: { text: 'Comment je t’appelle ?', mood: 'eager' },
    level: { text: `Enchanté, ${trimmedName} ! T’es en quelle classe ?`, mood: 'happy' },
    tone: { text: 'Et tu me préfères comment ? Touche pour m’entendre.', mood: 'eager' },
    rhythm: { text: 'Tu passes me voir à quel rythme ?', mood: 'happy' },
    consent: { text: 'Dernière chose avant d’y aller.', mood: 'proud' },
    ready: { text: '', mood: 'proud' },
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
    if (stepId === 'ready') return finish();
    if (STEPS[step + 1] === 'ready') sfx.complete(state.soundOn);
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
    if (stepId === 'ready' && !reducedMotion) fireConfetti();
  }, [stepId, reducedMotion]);

  const ctaLabel: Record<StepId, string> = {
    welcome: 'On y va !',
    name: 'Continuer',
    level: 'Continuer',
    tone: 'Continuer',
    rhythm: 'Continuer',
    consent: 'Valider',
    ready: 'C’est parti !',
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className={`onb onb--${stepId}`}>
          {!hero && (
            <header className="onb-top">
              <button type="button" className="onb-back" onClick={back} aria-label="Retour">
                <ArrowLeft size={20} strokeWidth={2.6} />
              </button>
              <div
                className="onb-progress"
                role="progressbar"
                aria-label="Progression"
                aria-valuemin={1}
                aria-valuemax={QUESTION_COUNT - 1}
                aria-valuenow={step}
              >
                <motion.span
                  initial={false}
                  animate={{ width: `${(step / QUESTION_COUNT) * 100}%` }}
                  transition={SPRING}
                />
              </div>
            </header>
          )}

          <div className={`onb-scene ${hero ? 'is-hero' : ''}`}>
            {/* One persistent element across every screen: `layout` animates it between the big
                welcome stage and the small speaker seat instead of unmounting and redrawing. */}
            <motion.div layout transition={SPRING} className="onb-avatar">
              <motion.div layout transition={SPRING} className="onb-avatar-inner">
                <BraiseMascot size={hero ? 132 : 50} mood={line.mood} />
              </motion.div>
            </motion.div>

            {stepId === 'welcome' && (
              <HeroCopy title="Salut, moi c’est Braise." subtitle="Tes cours, expliqués comme par un pote." />
            )}
            {stepId === 'ready' && <HeroCopy title={`Bienvenue, ${trimmedName} !`} subtitle="Ton Braise est prêt." />}
            {!hero && <Bubble key={line.text} text={line.text} />}
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={step}
              className="onb-body"
              initial={{ opacity: 0, x: 32 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 * direction }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {stepId === 'name' && (
                <input
                  className="onb-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') next();
                  }}
                  placeholder="Ton prénom"
                  aria-label="Ton prénom"
                  maxLength={24}
                  autoComplete="given-name"
                  autoFocus
                />
              )}

              {stepId === 'level' && (
                <div className="onb-stack">
                  {LEVELS.map((l) => (
                    <Tile
                      key={l.id}
                      selected={level?.id === l.id}
                      className="onb-tile--row"
                      onSelect={() => {
                        tap();
                        setLevel(l);
                        setReaction({ text: LEVEL_INFO[l.id]?.reaction ?? 'Noté !', mood: 'proud' });
                      }}
                    >
                      <b>{l.label}</b>
                      <small>{LEVEL_INFO[l.id]?.tag}</small>
                    </Tile>
                  ))}
                </div>
              )}

              {stepId === 'tone' && (
                <div className="onb-stack">
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
                  <p className="onb-hint">Tu pourras changer ça quand tu veux, dans Moi.</p>
                </div>
              )}

              {stepId === 'rhythm' && (
                <div className="onb-stack">
                  {RHYTHMS.map((r) => (
                    <Tile
                      key={r.id}
                      selected={goal === r.id}
                      className="onb-tile--row onb-tile--rhythm"
                      onSelect={() => {
                        tap();
                        setGoal(r.id);
                        setReaction({ text: r.reaction, mood: r.id === 'a-fond' ? 'cool' : 'happy' });
                      }}
                    >
                      <span>
                        <b>{r.title}</b>
                        <small>{r.desc}</small>
                      </span>
                      <span className="onb-flames" aria-label={`Intensité ${r.flames} sur 3`}>
                        {[1, 2, 3].map((i) => (
                          <span key={i} className={i <= r.flames ? 'is-lit' : ''}>
                            <StreakFlameIcon size={18} />
                          </span>
                        ))}
                      </span>
                    </Tile>
                  ))}
                </div>
              )}

              {stepId === 'consent' && (
                <>
                  {/* Must stay literally true: when accounts/cloud sync land, the first line changes. */}
                  <div className="onb-info">
                    <p>
                      <Smartphone size={20} aria-hidden="true" />
                      <span>Ta progression est enregistrée sur cet appareil.</span>
                    </p>
                    <p>
                      <MessageCircle size={20} aria-hidden="true" />
                      <span>
                        Quand tu me parles, tes messages passent par un service d’IA pour que je puisse te
                        répondre. Évite d’y mettre des infos perso.
                      </span>
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    role="checkbox"
                    aria-checked={consent}
                    className={`onb-check ${consent ? 'is-checked' : ''}`}
                    whileTap={{ x: 2, y: 2 }}
                    onClick={() => {
                      tap();
                      setConsent((c) => !c);
                      setReaction(consent ? null : { text: 'Merci. On y va ?', mood: 'happy' });
                    }}
                  >
                    <span className="onb-check-box" aria-hidden="true">
                      <AnimatePresence>
                        {consent && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING}>
                            <Check size={16} strokeWidth={3.5} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    C’est bon pour moi
                  </motion.button>
                </>
              )}

              {stepId === 'ready' && level && tone && rhythm && (
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

function HeroCopy({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      className="onb-hero-copy"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </motion.div>
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
      style={{ transformOrigin: 'bottom left' }}
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
      className={`onb-tile ${className ?? ''} ${selected ? 'is-selected' : ''}`}
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
