import { useState } from 'react';
import { Flame, Star, Snowflake, Play, ChevronRight, Headphones, MessageCircle } from 'lucide-react';
import { useApp, computeGoalPct } from '@/store';
import { sfx } from '@/lib/sound';
import { BraiseMascot } from '@/components/BraiseMascot';
import { LevelSheet } from '@/components/LevelSheet';
import { SUBJECTS } from '@/data';
import type { Level } from '@/types';

export function HomeView() {
  const { state, setTab, setView, openSubject, setUser, toggleFreeze, getDueCards } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bump, setBump] = useState<'streak' | 'xp' | null>(null);

  const dueCount = getDueCards().length;

  const goalPct = state.dailyGoalMet ? 100 : computeGoalPct(state);
  const circumference = 2 * Math.PI * 68;
  const dash = (goalPct / 100) * circumference;

  const fireStreak = () => {
    sfx.streak(state.soundOn);
    setBump('streak');
    setTimeout(() => setBump(null), 300);
  };

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
    setSheetOpen(false);
  };

  const currentSubject = SUBJECTS.find((s) => s.id === 'maths');
  const currentChapter = currentSubject?.chapters.find((c) => c.status === 'current');

  return (
    <>
    <div className="view is-active" style={{ paddingTop: 16 }}>
        {!state.user.level && (
          <div className="setup-banner">
            Configure ton niveau pour des leçons sur mesure.
          </div>
        )}

        {/* Braise hero nudge — dynamic personalized speech bubble */}
        <div className="braise-hero">
          <div className="braise-hero-mascot">
            <BraiseMascot size={56} mood="happy" className="flame-hero" />
          </div>
          <div className="braise-hero-bubble">
            <p>
              Salut {state.user.name} ! Série de {state.streak} jour{state.streak > 1 ? 's' : ''}.
              {dueCount > 0
                ? ` Prêt pour ${dueCount} min de révision ?`
                : currentChapter
                  ? ` Prêt pour 3 min de ${currentSubject?.name} ?`
                  : ' Choisis une matière pour commencer !'}
            </p>
          </div>
          <button className="avatar" onClick={() => setView('profile')}>
            <span style={{ fontSize: '1.2rem' }}>{state.user.avatar}</span>
          </button>
        </div>

        {/* Progress ring */}
        <div className="ring-wrap">
          <div className="ring-center">
            <svg className="ring-svg" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" fill="none" stroke="var(--line)" strokeWidth="10" />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="var(--blue)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="ring-label">
              <b>{goalPct}%</b>
              <span>objectif du jour</span>
            </div>
          </div>
          <div className="ring-chips">
            <button className={`ring-chip c-streak ${bump === 'streak' ? 'bump' : ''}`} onClick={fireStreak}>
              <Flame size={14} /> {state.streak} jours
            </button>
            <span className={`ring-chip c-xp ${bump === 'xp' ? 'bump' : ''}`}>
              <Star size={14} /> {state.xp} XP
            </span>
          </div>
        </div>

        {/* Freeze */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <button
            className={`freeze-chip ${state.freezeArmed ? 'is-armed' : ''}`}
            onClick={() => {
              sfx.tap(state.soundOn);
              toggleFreeze();
            }}
          >
            <Snowflake size={14} /> Gel de série {state.freezeArmed ? 'activé' : `(${state.freezes})`}
          </button>
        </div>

        {/* Primary CTA */}
        <div className="primary-cta">
          <div className="pc-tag">Reprends où tu t'es arrêté</div>
          <h2>{currentChapter?.title ?? 'Leçon du jour'}</h2>
          <p>{currentSubject?.name} · 2 formats disponibles</p>
          <button
            onClick={() => {
              sfx.whoosh(state.soundOn);
              if (currentSubject && currentChapter) openSubject(currentSubject.id, currentChapter.id);
            }}
          >
            <Play size={16} style={{ display: 'inline', marginRight: 6 }} />
            Continuer la leçon
          </button>
        </div>

        {/* Quick access */}
        <div className="section-title" style={{ marginTop: 0 }}>
          Accès rapide
        </div>
        <div className="quick-row">
          <button className="quick-chip" onClick={() => setTab('revisions')}>
            <span className="qc-ic" style={{ background: 'rgba(47,95,227,0.12)' }}>
              <Headphones size={14} color="#2F5FE3" />
            </span>
            <div>
              <div className="qc-tag">Vocal</div>
              <div className="qc-title">Animé</div>
            </div>
          </button>
          <button className="quick-chip" onClick={() => setTab('revisions')}>
            <span className="qc-ic" style={{ background: 'rgba(255,111,89,0.12)' }}>
              <MessageCircle size={14} color="#FF6F59" />
            </span>
            <div>
              <div className="qc-tag">Échanger</div>
              <div className="qc-title">Chat</div>
            </div>
          </button>
        </div>

        {/* Nudge */}
        <div className="nudge">
          <BraiseMascot size={30} mood="happy" />
          <div style={{ flex: 1 }}>
            <b>{dueCount > 0 ? `Tu as ${dueCount} flashcard${dueCount > 1 ? 's' : ''} à réviser` : 'Aucune carte à réviser aujourd\u2019hui'}</b>
            <span>Répétition espacée · Braise calcule pour toi</span>
          </div>
          <button onClick={() => setTab('revisions')}>
            Y aller <ChevronRight size={12} style={{ display: 'inline' }} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => setView('settings')}
            style={{ color: 'var(--ink-soft)', fontSize: '0.8rem', display: 'inline-flex', gap: 6, alignItems: 'center' }}
          >
            <ChevronRight size={14} /> Paramètres
          </button>
        </div>
      </div>

      <LevelSheet
        open={sheetOpen}
        current={state.user.level}
        onSelect={handleLevel}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
