import { useState } from 'react';
import { Share2, Home } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { BraiseMascot } from '@/components/BraiseMascot';

const CONFETTI = ['🎉', '⭐', '🔥', '✨', '🎊', '⭐', '🎉', '✨'];

export function CompleteView() {
  const { state, setView } = useApp();
  const [showShare, setShowShare] = useState(false);

  if (showShare) {
    return (
      <div className="app-content">
        <div className="view is-active" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Partage ta progression</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: 24 }}>
            Montre à tes potes que t'es un boss !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="share-card">
              <div className="share-card-glow" />
              <BraiseMascot size={70} mood="proud" />
              <div className="share-streak">{state.streak} jours 🔥</div>
              <div className="share-sub">Série de révision sur SAPIE</div>
              <div className="share-brand">SAPIE · l'app qui réveille les neurones</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button
              className="btn-block"
              style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 0 }}
              onClick={() => setShowShare(false)}
            >
              Retour
            </button>
            <button
              className="btn-block blue"
              style={{ marginTop: 0 }}
              onClick={() => {
                sfx.tap(state.soundOn);
                setView('home');
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
        <h2>Leçon terminée !</h2>
        <p>Tu gères, {state.user.name} ! Braise est fier de toi.</p>
        <div className="complete-xp">+50 XP</div>
        <div className="complete-stats">
          <div className="complete-stat">
            <b>3/3</b>
            <span>bonnes réponses</span>
          </div>
          <div className="complete-stat">
            <b>{state.streak} 🔥</b>
            <span>série</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-block"
            style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 0 }}
            onClick={() => {
              sfx.tap(state.soundOn);
              setShowShare(true);
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
  );
}
