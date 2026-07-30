import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Clock, Zap, Brain, Target } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { LevelSheet } from '@/components/LevelSheet';
import { SUBJECTS } from '@/data';
import type { Level } from '@/types';

type Vibe = 'all' | 'chrono' | 'boss' | 'quiz';

const VIBES: { id: Vibe; label: string; icon: typeof Zap }[] = [
  { id: 'all', label: 'Tout', icon: Target },
  { id: 'chrono', label: '5 min chrono', icon: Zap },
  { id: 'boss', label: 'Mode Boss', icon: Brain },
  { id: 'quiz', label: 'Quiz Express', icon: Target },
];

export function MatieresView() {
  const { state, openSubject, setUser } = useApp();
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [vibe, setVibe] = useState<Vibe>('all');

  const handleLevel = (l: Level) => {
    sfx.tap(state.soundOn);
    setUser({ ...state.user, level: l.id, levelLabel: l.label });
    setSheetOpen(false);
  };

  const filtered = SUBJECTS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="view is-active matieres-view">
      <button className="curriculum-tag" onClick={() => setSheetOpen(true)}>
        Programme : <b>{state.user.levelLabel}</b>
        <ChevronDown size={14} />
      </button>

      <h1 style={{ fontSize: '1.4rem', marginBottom: 14 }}>Mes matières</h1>

      <div className="search-bar">
        <Search size={16} color="var(--ink-soft)" />
        <input
          type="text"
          placeholder="Rechercher une matière..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Quick vibe filters */}
      <div className="vibe-row">
        {VIBES.map((v) => {
          const Icon = v.icon;
          const active = vibe === v.id;
          return (
            <button
              key={v.id}
              className={`vibe-chip ${active ? 'is-active' : ''}`}
              onClick={() => {
                sfx.tap(state.soundOn);
                setVibe(v.id);
              }}
            >
              <Icon size={14} />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Vibrant subject cards */}
      <div className="subject-grid">
        {filtered.map((s) => {
          const doneCount = s.chapters.filter((c) => c.status === 'done').length;
          const pct = Math.round((doneCount / s.chapters.length) * 100);
          const current = s.chapters.find((c) => c.status === 'current');
          const circumference = 2 * Math.PI * 18;
          const dash = (pct / 100) * circumference;
          return (
            <button
              key={s.id}
              className="vibe-card"
              style={{ '--card-color': s.color } as React.CSSProperties}
              onClick={() => {
                sfx.tap(state.soundOn);
                openSubject(s.id);
              }}
            >
              <div className="vibe-card-top">
                <div className="vibe-card-emoji">{s.emoji}</div>
                <div className="mini-ring">
                  <svg viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="var(--line)" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="18" fill="none"
                      stroke={s.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${circumference}`}
                      transform="rotate(-90 20 20)"
                    />
                  </svg>
                  <span className="mini-ring-pct">{pct}%</span>
                </div>
              </div>
              <h4>{s.name}</h4>
              <div className="vibe-card-chapter">
                {current ? (
                  <>
                    <span className="vibe-chapter-title">{current.title}</span>
                    <span className="vibe-chapter-time">
                      <Clock size={11} /> {current.duration} min
                    </span>
                  </>
                ) : (
                  <span className="vibe-chapter-title">Programme terminé</span>
                )}
              </div>
              <div className="vibe-card-arrow">
                <ChevronRight size={16} />
              </div>
            </button>
          );
        })}
      </div>

      <LevelSheet
        open={sheetOpen}
        current={state.user.level}
        onSelect={handleLevel}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
