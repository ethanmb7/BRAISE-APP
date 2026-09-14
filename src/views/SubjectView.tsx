import { Check, Lock, AlertCircle, SkipForward } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { BraiseMascot } from '@/components/BraiseMascot';
import { SUBJECTS } from '@/data';

const POSITIONS = ['pos-center', 'pos-right', 'pos-center', 'pos-left'];

export function SubjectView() {
  const { state, goBack, openLesson } = useApp();
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);

  if (!subject) return null;

  const doneCount = subject.chapters.filter((c) => c.status === 'done').length;
  const pct = Math.round((doneCount / subject.chapters.length) * 100);

  return (
    <div>
      <TopBar
        title={`${subject.emoji} ${subject.name}`}
        onBack={goBack}
        right={<span style={{ fontFamily: '"IBM Plex Mono"', fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{pct}%</span>}
      />
      <div className="view is-active">
        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: subject.color,
              borderRadius: 999,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* Skill tree path */}
        <div className="skill-path">
          <div className="skill-path-line" />
          {subject.chapters.map((c, i) => {
            const isLocked = c.status === 'locked';
            const isDone = c.status === 'done';
            const isCurrent = c.status === 'current';
            const pos = POSITIONS[i % POSITIONS.length];
            return (
              <div className={`skill-node-row ${pos}`} key={c.id}>
                <div className="skill-node-wrap">
                  <button
                    className={`skill-node ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''}`}
                    style={{ '--subject-color': subject.color } as React.CSSProperties}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      sfx.tap(state.soundOn);
                      openLesson(subject.id, c.id, 'echanger');
                    }}
                  >
                    {isDone ? <Check size={20} /> : isLocked ? <Lock size={16} /> : i + 1}
                  </button>
                  {isCurrent && (
                    <div className="skill-node-mascot">
                      <BraiseMascot size={30} mood="happy" />
                    </div>
                  )}
                  <div className="skill-node-label">
                    <b>{c.title}</b>
                    <span>
                      {isDone ? `${c.mastery}% de maîtrise` : isLocked ? `${c.duration} min · verrouillé` : `${c.duration} min`}
                    </span>
                    {c.reinforce && (
                      <span className="skill-node-tag reinf">
                        <AlertCircle size={9} style={{ display: 'inline', marginRight: 2 }} />À renforcer
                      </span>
                    )}
                    {c.skip && (
                      <span className="skill-node-tag skip">
                        <SkipForward size={9} style={{ display: 'inline', marginRight: 2 }} />Passage rapide
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
