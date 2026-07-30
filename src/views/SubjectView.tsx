import { Check, Lock, Play, Download, AlertCircle, SkipForward } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { SUBJECTS } from '@/data';

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
        <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden', marginBottom: 20 }}>
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

        {/* Chapters */}
        <div className="chapters">
          {subject.chapters.map((c, i) => {
            const isLocked = c.status === 'locked';
            const isDone = c.status === 'done';
            const isCurrent = c.status === 'current';
            return (
              <button
                key={c.id}
                className={`chapter ${c.status} ${c.reinforce ? 'reinforce' : ''} ${c.skip ? 'skip' : ''}`}
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  sfx.tap(state.soundOn);
                  openLesson(subject.id, c.id, 'vocal');
                }}
              >
                <div className="cnum">
                  {isDone ? (
                    <Check size={14} />
                  ) : isLocked ? (
                    <Lock size={12} />
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="ctext" style={{ flex: 1 }}>
                  <b>{c.title}</b>
                  {isCurrent && <span>À faire · {c.mastery}% commencé</span>}
                  {isDone && <span>Terminé · {c.mastery}% de maîtrise</span>}
                  {isLocked && <span>Débloque après le chapitre précédent</span>}
                  {c.reinforce && (
                    <span className="chap-tag reinf">
                      <AlertCircle size={9} style={{ display: 'inline' }} /> À renforcer
                    </span>
                  )}
                  {c.skip && (
                    <span className="chap-tag skip">
                      <SkipForward size={9} style={{ display: 'inline' }} /> Passage rapide
                    </span>
                  )}
                </div>
                {!isLocked && (
                  <span className="chap-mastery">{c.mastery}%</span>
                )}
                {isCurrent && (
                  <div className="dl-btn">
                    <Play size={12} />
                  </div>
                )}
                {isDone && (
                  <div className="dl-btn is-done">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Download hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, color: 'var(--ink-soft)', fontSize: '0.78rem' }}>
          <Download size={14} />
          Télécharge les leçons pour réviser hors-ligne
        </div>
      </div>
    </div>
  );
}
