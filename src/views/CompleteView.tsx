import { useState } from "react";
import { Share2, Home, CheckCircle2, RotateCcw } from "lucide-react";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { BraiseMascot } from "@/components/BraiseMascot";
import { getAgeGroup, lessonComplete } from "@/lib/braiseVoice";
import { SUBJECTS } from "@/data";
import { remainingToGoal } from "@/store";

const CONFETTI = ["🎉", "⭐", "🔥", "✨", "🎊", "⭐", "🎉", "✨"];

export function CompleteView() {
  const { state, setView } = useApp();
  const [showShare, setShowShare] = useState(false);
  const chapter = SUBJECTS.find((s) => s.id === state.currentSubjectId)?.chapters.find(
    (c) => c.id === state.currentChapterId,
  );
  const chapterTitle = chapter?.title ?? "cette leçon";
  // A completed chapter is durable state, but the reward belongs to this exact finish. This
  // transient result prevents the celebration from promising XP or quiz scores the learner did
  // not actually earn (for example when reopening an already-completed chapter).
  const completion = state.lastCompletion?.chapterId === chapter?.id ? state.lastCompletion : null;
  const remaining = remainingToGoal(state);
  const completeLine = lessonComplete(
    { personality: state.user.personality, age: getAgeGroup(state.user.level) },
    chapterTitle,
  );

  if (showShare) {
    return (
      <div className="app-content">
        <div className="view is-active" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>Partage ta progression</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginBottom: 24 }}>
            Montre à tes potes que t'es un boss !
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="share-card">
              <div className="share-card-glow" />
              <BraiseMascot size={70} mood="proud" />
              <div className="share-streak">{state.streak} jours 🔥</div>
              <div className="share-sub">Série de révision sur BRAISE</div>
              <div className="share-brand">BRAISE · tes cours expliqués autrement</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button
              className="btn-block"
              style={{ background: "var(--paper)", color: "var(--ink)", marginTop: 0 }}
              onClick={() => setShowShare(false)}
            >
              Retour
            </button>
            <button
              className="btn-block blue"
              style={{ marginTop: 0 }}
              onClick={() => {
                sfx.tap(state.soundOn);
                setView("home");
              }}
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
      <span className="complete-overline">Compréhension du jour</span>
      <h2>Tu as avancé sur {chapterTitle}</h2>
      <p>{completeLine}</p>
      <div className="complete-learning-summary">
        <div>
          <span aria-hidden="true">
            <CheckCircle2 size={19} />
          </span>
          <p>
            <b>Ce que tu viens de travailler</b>
            <small>{chapterTitle}, avec une vérification immédiate.</small>
          </p>
        </div>
        <div>
          <span aria-hidden="true">
            <RotateCcw size={19} />
          </span>
          <p>
            <b>La suite</b>
            <small>
              Cette notion reviendra dans Réviser pour vérifier qu'elle tient dans le temps.
            </small>
          </p>
        </div>
      </div>
      <div className="complete-reward-label">Et pour ton effort</div>
      {completion?.wasNewCompletion ? (
        <div className="complete-xp">+{completion.xpGained} XP</div>
      ) : (
        <div className="complete-xp is-repeat">Chapitre déjà validé</div>
      )}
      <div className="complete-stats">
        <div className="complete-stat">
          <b>{completion?.wasNewCompletion ? "1" : "—"}</b>
          <span>{completion?.wasNewCompletion ? "chapitre débloqué" : "pas d’XP en double"}</span>
        </div>
        <div className="complete-stat">
          <b>
            {state.dailyGoalMet ? "Objectif OK" : `${remaining} restant${remaining > 1 ? "s" : ""}`}
          </b>
          <span>{state.dailyGoalMet ? "pour aujourd’hui" : "avant ton objectif du jour"}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-block"
          style={{ background: "var(--paper)", color: "var(--ink)", marginTop: 0 }}
          onClick={() => {
            sfx.tap(state.soundOn);
            setShowShare(true);
          }}
        >
          <Share2 size={16} style={{ display: "inline", marginRight: 6 }} />
          Partager
        </button>
        <button
          className="btn-return"
          onClick={() => {
            sfx.tap(state.soundOn);
            setView("home");
          }}
        >
          <Home size={16} style={{ display: "inline", marginRight: 6 }} />
          Accueil
        </button>
      </div>
    </div>
  );
}
