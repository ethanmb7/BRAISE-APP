import { useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, MessageCircle, Smartphone } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';
import { LEVELS, SUBJECTS } from '@/data';
import type { Level, Personality } from '@/types';

type Mood = 'happy' | 'proud' | 'cool' | 'eager';

const RHYTHMS = [
  { id: 'tranquille', title: 'Tranquille', desc: 'Quelques cartes, sans prise de tête.' },
  { id: 'regulier', title: 'Régulier', desc: 'Le bon rythme pour progresser.' },
  { id: 'a-fond', title: 'À fond', desc: 'Pour les périodes de contrôles.' },
];

const TONES: { id: Personality; title: string; desc: string; sample: string; mood: Mood }[] = [
  {
    id: 'chill',
    title: 'Pote Chill',
    desc: 'Doux, rassurant, zéro pression.',
    sample: 'Pas de stress, on reprend ça tranquille, une étape à la fois.',
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

const STEP_COUNT = 7;

// One question per screen, asked by Braise in a speech bubble rather than as a form label: the
// first minute should feel like meeting a pote, not filling in a school registration sheet.
export function OnboardingView() {
  const { state, completeOnboarding } = useApp();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const trimmedName = name.trim();
  const canContinue = [
    true,
    trimmedName.length > 0,
    level !== null,
    subjects.length > 0,
    personality !== null,
    goal !== null,
    consent,
  ][step];

  const tap = () => sfx.tap(state.soundOn);

  const finish = () => {
    if (!level || !personality || !goal) return;
    sfx.complete(state.soundOn);
    if (!reducedMotion) fireConfetti();
    completeOnboarding({
      ...state.user,
      name: trimmedName,
      level: level.id,
      levelLabel: level.label,
      subjects,
      personality,
      goal,
      joinedAt: Date.now(),
    });
  };

  const next = () => {
    if (!canContinue) return;
    if (step === STEP_COUNT - 1) return finish();
    sfx.whoosh(state.soundOn);
    setDirection(1);
    setStep(step + 1);
  };

  const back = () => {
    tap();
    setDirection(-1);
    setStep(step - 1);
  };

  const toggleSubject = (id: string) => {
    tap();
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const isWelcome = step === 0;
  const ctaLabel = isWelcome ? 'On y va !' : step === STEP_COUNT - 1 ? "C'est parti !" : 'Continuer';

  return (
    <MotionConfig reducedMotion="user">
      <div className={`onb ${isWelcome ? 'onb--welcome' : ''}`}>
        {!isWelcome && (
          <header className="onb-top">
            <button type="button" className="onb-back" onClick={back} aria-label="Retour">
              <ArrowLeft size={20} strokeWidth={2.6} />
            </button>
            <div
              className="onb-progress"
              role="progressbar"
              aria-label="Progression de l'inscription"
              aria-valuemin={1}
              aria-valuemax={STEP_COUNT - 1}
              aria-valuenow={step}
            >
              <span style={{ width: `${(step / (STEP_COUNT - 1)) * 100}%` }} />
            </div>
          </header>
        )}

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.section
            key={step}
            className="onb-body"
            custom={direction}
            initial={{ opacity: 0, x: 28 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 * direction }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <div className="onb-welcome">
                <span className="onb-welcome-sun" aria-hidden="true" />
                {/* Braise is orange too — without its own cream stage it melts into the page. */}
                <div className="onb-welcome-stage">
                  <div className="onb-welcome-braise">
                    <BraiseMascot size={132} mood="happy" />
                  </div>
                </div>
                <h1>Salut, moi c'est Braise.</h1>
                <p>Tes cours, expliqués comme par un pote.</p>
              </div>
            )}

            {step === 1 && (
              <>
                <BraiseAsks mood="eager">Comment je t'appelle ?</BraiseAsks>
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
              </>
            )}

            {step === 2 && (
              <>
                <BraiseAsks mood="happy">Enchanté, {trimmedName} ! T'es en quelle classe ?</BraiseAsks>
                <div className="onb-stack">
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`onb-tile onb-tile--level ${level?.id === l.id ? 'is-selected' : ''}`}
                      aria-pressed={level?.id === l.id}
                      onClick={() => {
                        tap();
                        setLevel(l);
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <BraiseAsks mood="proud">Sur quoi je t'aide en priorité ?</BraiseAsks>
                <p className="onb-hint">Choisis-en autant que tu veux.</p>
                <div className="onb-grid cols-2">
                  {SUBJECTS.map((s) => {
                    const selected = subjects.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`onb-tile onb-tile--subject ${selected ? 'is-selected' : ''}`}
                        aria-pressed={selected}
                        onClick={() => toggleSubject(s.id)}
                      >
                        <span className="onb-subject-icon" style={{ background: s.color }} aria-hidden="true">
                          {s.emoji}
                        </span>
                        <span className="onb-subject-name">{s.name}</span>
                        {selected && (
                          <span className="onb-tick" aria-hidden="true">
                            <Check size={14} strokeWidth={3.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <BraiseAsks mood="cool">Tu me préfères comment ?</BraiseAsks>
                <div className="onb-stack">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`onb-tile onb-tile--tone ${personality === t.id ? 'is-selected' : ''}`}
                      aria-pressed={personality === t.id}
                      onClick={() => {
                        tap();
                        setPersonality(t.id);
                      }}
                    >
                      <span className="onb-tone-head">
                        <BraiseMascot size={48} mood={t.mood} />
                        <span>
                          <b>{t.title}</b>
                          <small>{t.desc}</small>
                        </span>
                      </span>
                      <span className="onb-tone-sample">« {t.sample} »</span>
                    </button>
                  ))}
                </div>
                <p className="onb-hint">Tu pourras changer ça quand tu veux, dans Moi.</p>
              </>
            )}

            {step === 5 && (
              <>
                <BraiseAsks mood="happy">Tu passes me voir à quel rythme ?</BraiseAsks>
                <div className="onb-stack">
                  {RHYTHMS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`onb-tile onb-tile--row ${goal === r.id ? 'is-selected' : ''}`}
                      aria-pressed={goal === r.id}
                      onClick={() => {
                        tap();
                        setGoal(r.id);
                      }}
                    >
                      <b>{r.title}</b>
                      <small>{r.desc}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <BraiseAsks mood="proud">Dernière chose avant d'y aller.</BraiseAsks>
                {/* Must stay literally true: when accounts/cloud sync land, the first line changes. */}
                <div className="onb-info">
                  <p>
                    <Smartphone size={20} aria-hidden="true" />
                    <span>Ta progression est enregistrée sur cet appareil.</span>
                  </p>
                  <p>
                    <MessageCircle size={20} aria-hidden="true" />
                    <span>
                      Quand tu me parles, tes messages passent par un service d'IA pour que je puisse te
                      répondre. Évite d'y mettre des infos perso.
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={consent}
                  className={`onb-check ${consent ? 'is-checked' : ''}`}
                  onClick={() => {
                    tap();
                    setConsent((c) => !c);
                  }}
                >
                  <span className="onb-check-box" aria-hidden="true">
                    {consent && <Check size={16} strokeWidth={3.5} />}
                  </span>
                  C'est bon pour moi
                </button>
              </>
            )}
          </motion.section>
        </AnimatePresence>

        <footer className="onb-footer">
          <button type="button" className="onb-cta" onClick={next} disabled={!canContinue}>
            {ctaLabel}
          </button>
        </footer>
      </div>
    </MotionConfig>
  );
}

function BraiseAsks({ mood, children }: { mood: Mood; children: ReactNode }) {
  return (
    <div className="onb-ask">
      <BraiseMascot size={68} mood={mood} />
      <h2 className="onb-bubble">{children}</h2>
    </div>
  );
}
