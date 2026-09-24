import { Check, Lock, AlertCircle, SkipForward } from 'lucide-react';
import { useApp, resolveChapters } from '@/store';
import { sfx } from '@/lib/sound';
import { TopBar } from '@/components/TopBar';
import { BraiseMascot } from '@/components/BraiseMascot';
import { SubjectIcon } from '@/components/SubjectIcon';
import { SUBJECTS, STORIES } from '@/data';

const ROW_JUSTIFY: Record<string, string> = {
  center: 'justify-center',
  right: 'justify-end pr-[10%]',
  left: 'justify-start pl-[10%]',
};
const POSITIONS = ['center', 'right', 'center', 'left'];

// Every tap from Home lands here — this was still the pre-redesign soft/pastel skill path
// (thin grey border, pale circles) while everything upstream had moved to the neobrutalist
// system: hard black borders, flat saturated fills, pure-black text/icons on colour (verified
// safe at >=4.7:1 across all 6 subject hues, same finding as SubjectDecks). The zigzag path
// structure itself was already good — a real Duolingo-style route, not a flat list — so only
// the visual skin changes here, not the layout.
export function SubjectView() {
  const { state, goBack, openLesson } = useApp();
  const subject = SUBJECTS.find((s) => s.id === state.currentSubjectId);

  if (!subject) return null;

  const chapters = resolveChapters(subject.chapters, state.completedChapters, state.struggledChapters);
  const doneCount = chapters.filter((c) => c.status === 'done').length;
  const pct = Math.round((doneCount / chapters.length) * 100);

  return (
    <div>
      <TopBar
        title={
          <span className="inline-flex items-center gap-1.5">
            <SubjectIcon subjectId={subject.id} color={subject.color} size={18} />
            {subject.name}
          </span>
        }
        onBack={goBack}
        right={<span className="font-mono text-xs font-bold text-[var(--ink-soft)]">{pct}%</span>}
      />
      <div className="view is-active">
        <div className="mb-5 h-3 overflow-hidden rounded-full border-2 border-black bg-black/80">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: subject.color }}
          />
        </div>

        <div className="relative px-1 pb-3 pt-3">
          <div
            aria-hidden="true"
            className="absolute bottom-10 left-1/2 top-8 w-[3px] -translate-x-1/2"
            style={{
              background:
                'repeating-linear-gradient(to bottom, rgba(22,33,58,0.22) 0 8px, transparent 8px 16px)',
            }}
          />

          {chapters.map((c, i) => {
            const isLocked = c.status === 'locked';
            const isDone = c.status === 'done';
            const isCurrent = c.status === 'current';
            const pos = POSITIONS[i % POSITIONS.length];

            const node = (
              <button
                className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-[2.5px] border-black text-lg font-black transition-transform active:scale-90 disabled:cursor-default"
                style={{
                  background: isLocked ? undefined : subject.color,
                  boxShadow: isLocked ? undefined : '3px 3px 0px 0px #000',
                }}
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  sfx.tap(state.soundOn);
                  // Open the real narrated lesson (slides + quiz) when one exists for this
                  // chapter, chat otherwise — previously always forced 'echanger', so even a
                  // chapter with a full scripted story opened straight into open-ended AI chat,
                  // with the actual lesson buried one tap away behind the "Vocal Animé" toggle.
                  openLesson(subject.id, c.id, STORIES[c.id] ? 'vocal' : 'echanger');
                }}
              >
                {isDone ? (
                  <Check size={24} className="text-black" strokeWidth={3} />
                ) : isLocked ? (
                  <Lock size={18} className="text-black/35" />
                ) : (
                  <span className="text-black">{i + 1}</span>
                )}
              </button>
            );

            return (
              <div key={c.id} className={`relative z-10 mb-8 flex ${ROW_JUSTIFY[pos]}`}>
                <div className="relative flex flex-col items-center gap-2">
                  {isCurrent ? <div className="tw-cta-pulse">{node}</div> : node}

                  {isCurrent && (
                    <div className="pointer-events-none absolute -right-3 -top-5 z-20">
                      <BraiseMascot size={34} mood="happy" />
                    </div>
                  )}

                  <div className="flex max-w-[9.5rem] flex-col items-center gap-1 text-center">
                    <b className="block font-display text-sm font-black leading-tight text-[var(--ink)]">{c.title}</b>
                    <span className="block text-xs font-semibold text-[var(--ink-soft)]">
                      {isDone ? `${c.mastery}% de maîtrise` : isLocked ? `${c.duration} min · verrouillé` : `${c.duration} min`}
                    </span>
                    {c.reinforce && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-black bg-sapie-coral px-2 py-0.5 text-[0.65rem] font-extrabold uppercase text-white">
                        <AlertCircle size={10} /> À renforcer
                      </span>
                    )}
                    {c.skip && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-black bg-emerald-400 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase text-black">
                        <SkipForward size={10} /> Passage rapide
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
