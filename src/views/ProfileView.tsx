import { Flame, Star, BookOpen, Settings, ChevronRight } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { BADGES, SUBJECTS } from '@/data';

export function ProfileView() {
  const { state, setView, setUser } = useApp();

  const subjectsCount = state.user.subjects.length;
  const chaptersDone = SUBJECTS.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.status === 'done').length,
    0
  );

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

        {/* Badges */}
        <div className="section-title">Mes badges</div>
        <div className="badges">
          {BADGES.map((b) => (
            <div className={`badge ${b.unlocked ? '' : 'locked'}`} key={b.id}>
              <div className="ring" style={b.unlocked ? { background: 'var(--blue-pale)' } : {}}>
                {b.emoji}
              </div>
              <span>{b.name}</span>
              <span className="cond">{b.cond}</span>
            </div>
          ))}
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
            border: 'none',
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
