import { useState } from 'react';
import { Check } from 'lucide-react';
import { BraiseMascot, SapiLogo } from '@/components/BraiseMascot';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { LEVELS, SUBJECTS } from '@/data';
import type { Level } from '@/types';

const AVATARS = ['🦊', '🐼', '🦉', '🐱', '🚀', '⭐'];
const GOALS = ['15 min/jour', '30 min/jour', '1 heure/jour'];

export function OnboardingView() {
  const { state, setUser, setView } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('🦊');
  const [consent, setConsent] = useState(false);

  const total = 4;
  const next = () => {
    sfx.whoosh(state.soundOn);
    if (step < total - 1) setStep(step + 1);
    else finish();
  };
  const prev = () => {
    sfx.tap(state.soundOn);
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    sfx.complete(state.soundOn);
    setUser({
      name: name || 'Alex',
      level: level?.id ?? '3e',
      levelLabel: level?.label ?? '3ème',
      goal,
      subjects,
      avatar,
    });
    setView('home');
  };

  const toggleSubject = (id: string) => {
    sfx.tap(state.soundOn);
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const canNext =
    step === 0 ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && level !== null) ||
    (step === 3 && subjects.length > 0 && goal !== '' && consent);

  return (
    <div className="app-content">
      {/* Step 0 — Welcome */}
      <div className={`ob-step ob-welcome ${step === 0 ? 'is-active' : ''}`}>
        <SapiLogo size={52} />
        <h1>Bienvenue sur SAPIE</h1>
        <p>Réviser comme un pote t'explique le cours. Sans pression, juste la motivation.</p>
        <BraiseMascot size={74} className="flame-hero" mood="happy" />
        <button className="btn-block" onClick={next}>
          C'est parti !
        </button>
      </div>

      {/* Step 1 — Name + Avatar */}
      <div className={`ob-step ${step === 1 ? 'is-active' : ''}`}>
        <div className="dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <h2>Comment tu t'appelles ?</h2>
        <p className="sub">Braise a besoin d'un prénom pour te parler comme un vrai pote.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom"
          style={{
            background: 'var(--paper)',
            border: '2px solid var(--line)',
            borderRadius: 14,
            padding: '15px 16px',
            fontSize: '0.95rem',
            marginBottom: 16,
            color: 'var(--ink)',
          }}
          autoFocus
        />
        <div className="level-group-label" style={{ marginBottom: 8 }}>
          Choisis ton avatar
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'auto' }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => {
                sfx.tap(state.soundOn);
                setAvatar(a);
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                fontSize: '1.3rem',
                background: avatar === a ? 'var(--blue-pale)' : 'var(--paper)',
                border: `2px solid ${avatar === a ? 'var(--blue)' : 'var(--line)'}`,
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <button className="btn-block blue" onClick={next} disabled={!canNext}>
          Continuer
        </button>
      </div>

      {/* Step 2 — Level */}
      <div className={`ob-step ${step === 2 ? 'is-active' : ''}`}>
        <div className="dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <h2>Quel est ton niveau ?</h2>
        <p className="sub">On adapte les leçons à ton programme.</p>
        <div style={{ marginBottom: 'auto' }}>
          {['Collège', 'Lycée'].map((g) => (
            <div key={g} style={{ marginBottom: 14 }}>
              <div className="level-group-label">{g}</div>
              <div className="level-list">
                {LEVELS.filter((l) => l.group === g).map((l) => (
                  <button
                    key={l.id}
                    className={`level-item ${level?.id === l.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      sfx.tap(state.soundOn);
                      setLevel(l);
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-block"
            style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 0 }}
            onClick={prev}
          >
            Retour
          </button>
          <button className="btn-block blue" style={{ marginTop: 0 }} onClick={next} disabled={!canNext}>
            Continuer
          </button>
        </div>
      </div>

      {/* Step 3 — Subjects + Goal + Consent + Meet Braise */}
      <div className={`ob-step meet-braise ${step === 3 ? 'is-active' : ''}`}>
        <div className="dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <BraiseMascot size={72} mood="proud" />
        <h2>Salut, moi c'est Braise !</h2>
        <p className="sub">
          Je suis ton pote de classe. Choisis tes matières et ton objectif, et on y va !
        </p>

        <div className="subject-chips" style={{ marginTop: 4 }}>
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              className={`schip ${subjects.includes(s.id) ? 'is-selected' : ''}`}
              onClick={() => toggleSubject(s.id)}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        <div className="chip-grid" style={{ marginTop: 14 }}>
          {GOALS.map((g) => (
            <button
              key={g}
              className={`chip ${goal === g ? 'is-selected' : ''}`}
              onClick={() => {
                sfx.tap(state.soundOn);
                setGoal(g);
              }}
            >
              {g}
              <span className="chk">{goal === g && <Check size={14} />}</span>
            </button>
          ))}
        </div>

        <label className="consent-row" style={{ marginTop: 'auto', marginBottom: 14 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            J'accepte que mes données de progression soient utilisées pour personnaliser mon
            apprentissage.{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              En savoir plus
            </a>
          </span>
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-block"
            style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 0 }}
            onClick={prev}
          >
            Retour
          </button>
          <button className="btn-block blue" style={{ marginTop: 0 }} onClick={finish} disabled={!canNext}>
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
