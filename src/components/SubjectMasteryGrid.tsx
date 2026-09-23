import { memo, type CSSProperties } from 'react';
import { SubjectIcon } from '@/components/SubjectIcon';
import type { SubjectMastery } from '@/lib/aura';

// Extracted from ProfilAuraView so Profil's own stats section can render the exact same
// per-subject visualization (one source — the two screens can never drift apart).
// A fanned stack of 4 abstract card-slots, filled left-to-right by real mastered/total
// progress — the one version of "how am I doing in this subject" that isn't borrowed from
// another app's gauge/bar/radar language, because cards are literally what this app's own
// mechanic already is. Fixed at 4 slots regardless of a subject's real card count — the real
// grounding lives in the count underneath ("3/6 cartes"), never a percentage, which could be
// inflated by only ever reviewing the one easy card.
export const SubjectMasteryGrid = memo(function SubjectMasteryGrid({
  subjects,
  onSelect,
}: {
  subjects: SubjectMastery[];
  onSelect: (id: string) => void;
}) {
  // Same subject the Accueil grid uses, kept in one place so every screen shortens it identically.
  const SHORT_SUBJECT_NAME: Record<string, string> = { maths: 'Maths' };
  return (
    <div className="mastery-section-wrap">
      <div className="mastery-section">
        <span className="mastery-tab">Maîtrise par matière</span>
        <div className="mastery-grid" role="list">
          {subjects.map((s) => {
            const filled = s.totalCount > 0 ? Math.round((s.masteredCount / s.totalCount) * 4) : 0;
            return (
              <button
                key={s.id}
                type="button"
                className="mastery-tile"
                role="listitem"
                onClick={() => onSelect(s.id)}
                aria-label={`${s.name} : ${s.masteredCount} carte${s.masteredCount > 1 ? 's' : ''} maîtrisée${s.masteredCount > 1 ? 's' : ''} sur ${s.totalCount} — réviser cette matière`}
              >
                <span className="mastery-stack">
                  {[0, 1, 2, 3].map((i) => {
                    const isFilled = i < filled;
                    return (
                      <span
                        key={i}
                        className={`mastery-card ${isFilled ? 'is-filled' : 'is-empty'}`}
                        style={isFilled ? ({ background: s.color } as CSSProperties) : undefined}
                      >
                        {i === 3 && (
                          <SubjectIcon subjectId={s.id} color={isFilled ? '#fff' : 'rgba(21,24,33,0.35)'} size={16} />
                        )}
                      </span>
                    );
                  })}
                </span>
                <span className="mastery-name">{SHORT_SUBJECT_NAME[s.id] ?? s.name}</span>
                <span className="mastery-count">
                  {s.masteredCount}/{s.totalCount} cartes
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
