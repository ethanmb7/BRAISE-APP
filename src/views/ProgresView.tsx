import { Flame, Star, Clock, CheckCircle2, Calendar, Snowflake, Sparkles } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { SUBJECTS } from '@/data';
import { BraiseMascot } from '@/components/BraiseMascot';

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function ProgresView() {
  const { state, openSubject, toggleFreeze } = useApp();

  const totalChapters = SUBJECTS.reduce((acc, s) => acc + s.chapters.length, 0);
  const doneChapters = SUBJECTS.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.status === 'done').length,
    0
  );

  const weakItems = SUBJECTS.flatMap((s) =>
    s.chapters
      .filter((c) => c.reinforce)
      .map((c) => ({ subjectId: s.id, subjectName: s.name, chapterId: c.id, title: c.title, mastery: c.mastery }))
  );

  const today = 2;

  return (
    <div className="view is-active progres-view">
      <h1 style={{ fontSize: '1.4rem', marginBottom: 14 }}>Mon progrès</h1>

      {/* Aura SAPIE */}
      <div className="aura-card">
        <div className="aura-glow" />
        <div className="aura-content">
          <div className="aura-icon">
            <Sparkles size={22} />
          </div>
          <div className="aura-text">
            <div className="aura-label">Aura SAPIE</div>
            <div className="aura-value">{state.xp} XP</div>
          </div>
          <div className="aura-streak">
            <Flame size={20} />
            <b>{state.streak}</b>
          </div>
        </div>
      </div>

      {/* Freeze management */}
      <div className="freeze-row">
        <div className="freeze-info">
          <Snowflake size={18} color="var(--mint)" />
          <div>
            <b>Gel de série</b>
            <span>{state.freezes} gel(s) disponible(s)</span>
          </div>
        </div>
        <button
          className={`freeze-toggle ${state.freezeArmed ? 'is-armed' : ''}`}
          onClick={() => {
            sfx.tap(state.soundOn);
            toggleFreeze();
          }}
        >
          {state.freezeArmed ? 'Activé' : 'Activer'}
        </button>
      </div>

      {/* Braise advice bubble */}
      <div className="advice-bubble">
        <BraiseMascot size={52} mood="happy" />
        <div className="advice-text">
          <div className="advice-label">Conseil de Braise</div>
          <p>
            Tu progresses bien en maths ! Cette semaine, essaie de réviser la poésie
            10 minutes par jour pour bien préparer ton contrôle. Petit à petit, l'oiseau
            fait son nid.
          </p>
        </div>
      </div>

      {/* Week stats */}
      <div className="section-title">Cette semaine</div>
      <div className="stats-week">
        <div className="stat-chip">
          <b>{state.streak}</b>
          <span>jours 🔥</span>
        </div>
        <div className="stat-chip">
          <b>{state.xp}</b>
          <span>XP ⭐</span>
        </div>
        <div className="stat-chip">
          <b>{doneChapters}</b>
          <span>chapitres</span>
        </div>
      </div>

      {/* Week dots */}
      <div className="section-title">Activité</div>
      <div className="week">
        {WEEK_DAYS.map((d, i) => (
          <div className="day" key={i}>
            <span className="lbl">{d}</span>
            <div className={`dot ${i < today ? 'done' : ''} ${i === today ? 'today' : ''}`}>
              {i < today && <CheckCircle2 size={14} />}
              {i === today && '•'}
            </div>
          </div>
        ))}
      </div>

      {/* Weak points */}
      <div className="section-title">Points à renforcer</div>
      <div className="weak-list">
        {weakItems.length === 0 && (
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
            Aucun point faible détecté. Continue comme ça !
          </p>
        )}
        {weakItems.map((w) => (
          <div className="weak-item" key={w.chapterId}>
            <div className="wtext">
              <b>{w.title}</b>
              <span>{w.subjectName} · {w.mastery}% de maîtrise</span>
            </div>
            <button
              onClick={() => {
                sfx.tap(state.soundOn);
                openSubject(w.subjectId, w.chapterId);
              }}
            >
              Réviser
            </button>
          </div>
        ))}
      </div>

      {/* Homework */}
      <div className="section-title">Travaux à venir</div>
      <div className="hw-list">
        <div className="hw-item">
          <div className="hw-due">Dans 3j</div>
          <div>
            <b>DM de Maths</b>
            <span>Les équations · à rendre vendredi</span>
          </div>
        </div>
        <div className="hw-item">
          <div className="hw-due">Dans 7j</div>
          <div>
            <b>Contrôle Français</b>
            <span>La poésie · réviser les figures de style</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="section-title">Bilan</div>
      <div style={{ background: 'var(--paper)', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem' }}>Chapitres terminés</span>
          <b style={{ fontFamily: '"IBM Plex Mono"', fontSize: '0.85rem' }}>
            {doneChapters}/{totalChapters}
          </b>
        </div>
        <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(doneChapters / totalChapters) * 100}%`,
              height: '100%',
              background: 'var(--blue)',
              borderRadius: 999,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
