import { useState } from 'react';
import { Share2, Home } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { BraiseMascot } from '@/components/BraiseMascot';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { TopBar } from '@/components/TopBar';
import { getAgeGroup, lessonComplete } from '@/lib/braiseVoice';
import { getRankInfo, countMasteredCards, countSubjectsReviewed } from '@/lib/aura';
import { SUBJECTS } from '@/data';
import { remainingToGoal } from '@/store';

const CONFETTI = ['🎉', '⭐', '🔥', '✨', '🎊', '⭐', '🎉', '✨'];

export function CompleteView() {
  const { state, setView, goBack } = useApp();
  const [shareOpen, setShareOpen] = useState(false);
  const chapter = SUBJECTS.find((s) => s.id === state.currentSubjectId)?.chapters.find((c) => c.id === state.currentChapterId);
  const chapterTitle = chapter?.title ?? 'cette leçon';
  // A completed chapter is durable state, but the reward belongs to this exact finish. This
  // transient result prevents the celebration from promising XP or quiz scores the learner did
  // not actually earn (for example when reopening an already-completed chapter).
  const completion = state.lastCompletion?.chapterId === chapter?.id ? state.lastCompletion : null;
  const remaining = remainingToGoal(state);
  const completeLine = lessonComplete(
    { personality: state.user.personality, age: getAgeGroup(state.user.level) },
    chapterTitle
  );

  // Only set when this screen was reached from the quiz (not from Échanger, which has no score
  // to report) — real per-question outcome of this exact run, never inferred or fabricated.
  const quiz = completion?.quiz;
  const stillFragile = quiz ? quiz.total - quiz.score - quiz.rebondCount : 0;
  // Chapter bonus (+50, only on a first completion) plus whatever the quiz itself already paid
  // out question by question — the real total this run earned, not just the chapter's own cut.
  const totalXpEarned = (completion?.xpGained ?? 0) + (quiz?.xpEarned ?? 0);

  return (
    <div>
      <TopBar title={chapterTitle} onBack={goBack} />
      <div className="view is-active complete-wrap">
        <div className="confetti">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              style={{
                left: `${(i / CONFETTI.length) * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="complete-badge">
          <BraiseMascot size={50} mood="proud" />
        </div>
        <h2>Mission terminée !</h2>
        <p>{completeLine}</p>

        {/* Real per-question outcome of this run — never shown for a chapter finished from
            Échanger, which has no quiz to report. Comes before the reward on purpose: what
            actually happened this run, then what it paid. */}
        {quiz && (
          <div className="complete-run">
            <div className="complete-run-stat">
              <b>{quiz.score}</b>
              <span>direct{quiz.score > 1 ? 'es' : ''}</span>
            </div>
            {quiz.rebondCount > 0 && (
              <div className="complete-run-stat is-rebond">
                <b>{quiz.rebondCount}</b>
                <span>rattrapée{quiz.rebondCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {stillFragile > 0 && (
              <div className="complete-run-stat is-fragile">
                <b>{stillFragile}</b>
                <span>à renforcer</span>
              </div>
            )}
          </div>
        )}
        {stillFragile > 0 && (
          <p className="complete-run-note">Marqué à renforcer — tu le retrouveras dans Tes matières.</p>
        )}

        {completion?.wasNewCompletion ? (
          <div className="complete-xp">+{totalXpEarned} XP</div>
        ) : (
          <div className="complete-xp is-repeat">Chapitre déjà validé</div>
        )}
        <div className="complete-stats">
          <div className="complete-stat">
            <b>{completion?.wasNewCompletion ? '1' : '—'}</b>
            <span>{completion?.wasNewCompletion ? 'chapitre débloqué' : 'pas d’XP en double'}</span>
          </div>
          <div className="complete-stat">
            <b>{state.dailyGoalMet ? 'Objectif OK' : `${remaining} restant${remaining > 1 ? 's' : ''}`}</b>
            <span>{state.dailyGoalMet ? 'pour aujourd’hui' : 'avant ton objectif du jour'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-block"
            style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 0 }}
            onClick={() => {
              sfx.tap(state.soundOn);
              setShareOpen(true);
            }}
          >
            <Share2 size={16} style={{ display: 'inline', marginRight: 6 }} />
            Partager
          </button>
          <button
            className="btn-return"
            onClick={() => {
              sfx.tap(state.soundOn);
              setView('home');
            }}
          >
            <Home size={16} style={{ display: 'inline', marginRight: 6 }} />
            Accueil
          </button>
        </div>
      </div>

      {shareOpen && (
        <ShareAuraModal
          rank={getRankInfo(state.xp).current}
          streak={state.streak}
          xp={state.xp}
          subjectsCount={countSubjectsReviewed(state.cardReviews)}
          masteredCards={countMasteredCards(state.cardReviews)}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
