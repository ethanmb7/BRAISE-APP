import { Settings, ChevronRight, Check } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { BADGES, SUBJECTS } from '@/data';
import type { Personality } from '@/types';

const PERSONAS: { id: Personality; emoji: string; title: string; sub: string }[] = [
  { id: 'chill', emoji: '☕', title: 'Pote Chill', sub: 'Encourageant, doux, zéro pression.' },
  { id: 'savage', emoji: '⚡', title: 'Coach Savage', sub: 'Second degré, piques amicales assumées.' },
];

export function ProfileView() {
  const { state, setView, setPersonality } = useApp();

  const subjectsCount = state.user.subjects.length;
  const chaptersDone = SUBJECTS.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.status === 'done').length,
    0
  );

  const badgeUnlocked: Record<string, boolean> = {
    b1: state.streak >= 3,
    b2: state.xp >= 100,
    b3: chaptersDone >= 1,
    b4: state.freezeArmed || state.freezes < 2,
    b5: state.streak >= 7,
    b6: state.xp >= 1000,
  };

  return (
    <div>
      <TopBar title="Profil" onBack={() => setView(state.tab)} />
      <div className="view is-active">
        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--paper)',
              border: '2.5px solid var(--neo-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '2.2rem',
            }}
          >
            {state.user.avatar}
          </div>
          <h2 style={{ fontSize: '1.3rem' }}>{state.user.name}</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
            {state.user.levelLabel} · {state.user.goal}
          </p>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="pstat">
            <b>{state.streak}</b>
            <span>jours 🔥</span>
          </div>
          <div className="pstat">
            <b>{state.xp}</b>
            <span>XP ⭐</span>
          </div>
          <div className="pstat">
            <b>{chaptersDone}</b>
            <span>chapitres</span>
          </div>
        </div>

        {/* Personality */}
        <div className="section-title">Personnalité de Braise</div>
        <div className="persona-grid">
          {PERSONAS.map((p) => {
            const active = state.user.personality === p.id;
            return (
              <button
                key={p.id}
                className={`persona-card ${active ? 'is-active' : ''}`}
                onClick={() => {
                  sfx.tap(state.soundOn);
                  setPersonality(p.id);
                }}
              >
                {active && (
                  <span className="persona-check">
                    <Check size={11} />
                  </span>
                )}
                <span className="persona-emoji">{p.emoji}</span>
                <b>{p.title}</b>
                <span className="persona-sub">{p.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Badges */}
        <div className="section-title">Mes badges</div>
        <div className="badges">
          {BADGES.map((b) => {
            const unlocked = badgeUnlocked[b.id];
            return (
            <div className={`badge ${unlocked ? '' : 'locked'}`} key={b.id}>
              <div className="ring" style={unlocked ? { background: '#eff3ff' } : {}}>
                {b.emoji}
              </div>
              <span>{b.name}</span>
              <span className="cond">{b.cond}</span>
            </div>
            );
          })}
        </div>

        {/* Subjects */}
        <div className="section-title" style={{ marginTop: 20 }}>
          Mes matières ({subjectsCount})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {state.user.subjects.map((id) => {
            const s = SUBJECTS.find((x) => x.id === id);
            if (!s) return null;
            return (
              <span
                key={id}
                style={{
                  background: 'var(--paper)',
                  border: '1.5px solid var(--neo-ink)',
                  borderRadius: 999,
                  padding: '8px 13px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {s.emoji} {s.name}
              </span>
            );
          })}
        </div>

        {/* Settings link */}
        <button
          className="settings-row"
          style={{
            width: '100%',
            background: 'var(--paper)',
            borderRadius: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            border: '2px solid var(--neo-ink)',
            color: 'var(--ink)',
            fontSize: '0.9rem',
          }}
          onClick={() => {
            sfx.tap(state.soundOn);
            setView('settings');
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={18} color="var(--ink-soft)" />
            Paramètres
          </span>
          <ChevronRight size={18} color="var(--ink-soft)" />
        </button>
      </div>
    </div>
  );
}
