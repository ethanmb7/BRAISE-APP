import { useState, useRef, useCallback } from 'react';
import { RotateCcw, Check, AlertCircle, HelpCircle, Zap } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { BraiseMascot } from '@/components/BraiseMascot';
import { FLASHCARDS, SUBJECTS } from '@/data';
import type { Flashcard, Confidence } from '@/types';

type Mode = 'flashcards' | 'test';

export function RevisionsView() {
  const { state, reviewCard, getDueCards } = useApp();
  const [mode, setMode] = useState<Mode>('flashcards');
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'due'>('due');

  const dueIds = new Set(getDueCards());
  const cards = FLASHCARDS.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'due') return dueIds.has(c.id);
    return c.level === filter;
  });

  const dueCount = dueIds.size;

  return (
    <div className="view is-active">
        <h1 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Révisions</h1>

        <div className="ai-note">
          {dueCount > 0
            ? `${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser aujourd'hui. Braise a calculé les intervalles optimaux pour ta mémoire.`
            : 'Aucune carte à réviser pour aujourd\u2019hui. Reviens demain ou explore toutes les cartes.'}
        </div>

        <div className="rev-modes">
          <button
            className={`rev-mode-btn ${mode === 'flashcards' ? 'is-on' : ''}`}
            onClick={() => {
              sfx.tap(state.soundOn);
              setMode('flashcards');
            }}
          >
            Flashcards
          </button>
          <button
            className={`rev-mode-btn ${mode === 'test' ? 'is-on' : ''}`}
            onClick={() => {
              sfx.tap(state.soundOn);
              setMode('test');
            }}
          >
            Test rapide
          </button>
        </div>

        <div className="rev-filters">
          {(['due', 'all', 'easy', 'medium', 'hard'] as const).map((f) => (
            <button
              key={f}
              className={`rev-filter ${filter === f ? 'is-on' : ''}`}
              onClick={() => {
                sfx.tap(state.soundOn);
                setFilter(f);
              }}
            >
              {f === 'due' ? `À réviser (${dueCount})` : f === 'all' ? 'Toutes' : f === 'easy' ? 'Facile' : f === 'medium' ? 'Moyen' : 'Difficile'}
            </button>
          ))}
        </div>

        {mode === 'flashcards' ? (
          <Flashcards cards={cards} soundOn={state.soundOn} onReview={reviewCard} />
        ) : (
          <TestMode cards={cards} soundOn={state.soundOn} onReview={reviewCard} />
        )}
      </div>
  );
}

function Flashcards({ cards, soundOn, onReview }: { cards: Flashcard[]; soundOn: boolean; onReview: (id: string, c: Confidence) => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState<'know' | 'again' | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const startX = useRef(0);

  if (cards.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Aucune carte pour ce filtre.</p>;
  }

  if (index >= cards.length) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: '1.2rem' }}>Session terminée !</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 6 }}>
          {reviewed} cartes révisées
        </p>
        <button
          className="btn-block blue"
          style={{ marginTop: 20 }}
          onClick={() => {
            setIndex(0);
            setReviewed(0);
            setFlipped(false);
            setConfidence(null);
          }}
        >
          Recommencer
        </button>
      </div>
    );
  }

  const card = cards[index];

  const onPointerDown = (e: React.PointerEvent) => {
    if (flipped) return;
    startX.current = e.clientX;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const threshold = 90;
    if (dragX > threshold) {
      flyOut('know', 'sure');
    } else if (dragX < -threshold) {
      flyOut('again', 'not-sure');
    } else {
      setDragX(0);
    }
  }, [dragging, dragX]);

  const flyOut = (dir: 'know' | 'again', conf: Confidence) => {
    setFlying(dir);
    sfx.whoosh(soundOn);
    onReview(card.id, conf);
    setTimeout(() => {
      setFlying(null);
      setDragX(0);
      setFlipped(false);
      setConfidence(null);
      setIndex((i) => i + 1);
      setReviewed((r) => r + 1);
    }, 350);
  };

  const flip = () => {
    if (dragging) return;
    sfx.flip(soundOn);
    setFlipped((f) => !f);
  };

  const handleConfidence = (level: Confidence) => {
    sfx.tap(soundOn);
    setConfidence(level);
    setTimeout(() => flyOut(level === 'sure' ? 'know' : 'again', level), 200);
  };

  const rotate = Math.max(-12, Math.min(12, dragX / 12));
  const opacity = 1 - Math.min(1, Math.abs(dragX) / 200);

  return (
    <>
      <div className="rev-progress">
        {index + 1} / {cards.length}
      </div>
      <div className="flash-stack">
        <div
          className={`flashcard ${flipped ? 'flipped' : ''} ${dragging ? 'dragging' : ''} ${
            flying ? 'fly-out' : !dragging && dragX === 0 ? 'snap-back' : ''
          }`}
          style={{
            transform: flying
              ? `translateX(${flying === 'know' ? 400 : -400}px) rotate(${flying === 'know' ? 20 : -20}deg)`
              : `translateX(${dragX}px) rotate(${rotate}deg)`,
            opacity: flying ? 0 : opacity,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={flip}
        >
          {dragX > 30 && (
            <span className="swipe-tag know" style={{ opacity: Math.min(1, dragX / 90) }}>
              Je sais
            </span>
          )}
          {dragX < -30 && (
            <span className="swipe-tag again" style={{ opacity: Math.min(1, -dragX / 90) }}>
              À revoir
            </span>
          )}
          <div className="ftag">
            {SUBJECTS.find((s) => s.id === card.subject)?.emoji} {card.topic} · {card.level}
          </div>
          <div className="fq">{card.q}</div>
          <div className="fhint">{flipped ? 'Choisis ta certitude en bas' : 'Touche pour retourner'}</div>
          <div className="fa">{card.a}</div>
        </div>
      </div>

      {/* Confidence buttons (shown when flipped) */}
      {flipped && !flying && (
        <div className="confidence-row">
          <button className="conf-btn not-sure" onClick={() => handleConfidence('not-sure')}>
            <AlertCircle size={16} />
            Pas sûr
          </button>
          <button className="conf-btn doubt" onClick={() => handleConfidence('doubt')}>
            <HelpCircle size={16} />
            Un doute
          </button>
          <button className="conf-btn sure" onClick={() => handleConfidence('sure')}>
            <Check size={16} />
            Sûr !
          </button>
        </div>
      )}

      {/* Action buttons (shown when not flipped) */}
      {!flipped && !flying && (
        <div className="rev-actions">
          <button className="rev-btn again" onClick={() => flyOut('again', 'not-sure')}>
            <RotateCcw size={18} />
            À revoir
          </button>
          <button className="rev-btn know" onClick={() => flyOut('know', 'sure')}>
            <Check size={18} />
            Je sais
          </button>
        </div>
      )}
    </>
  );
}

function TestMode({ cards, soundOn, onReview }: { cards: Flashcard[]; soundOn: boolean; onReview: (id: string, c: Confidence) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (cards.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Aucune carte pour ce filtre.</p>;
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎯</div>
        <h2 style={{ fontSize: '1.2rem' }}>Test terminé !</h2>
        <p style={{ fontSize: '1.6rem', fontFamily: '"Baloo 2"', color: 'var(--blue)', margin: '10px 0' }}>
          {score}/{cards.length}
        </p>
        <button
          className="btn-block blue"
          style={{ marginTop: 10 }}
          onClick={() => {
            setIndex(0);
            setScore(0);
            setDone(false);
            setSelected(null);
            setFeedback(null);
          }}
        >
          Refaire
        </button>
      </div>
    );
  }

  const card = cards[index];

  const handleFlip = (correct: boolean) => {
    if (selected !== null) return;
    if (correct) {
      sfx.correct(soundOn);
      setScore((s) => s + 1);
      setFeedback('ok');
      onReview(card.id, 'sure');
    } else {
      sfx.wrong(soundOn);
      setFeedback('ko');
      onReview(card.id, 'not-sure');
    }
    setSelected(correct ? 1 : 0);
    setTimeout(() => {
      if (index + 1 >= cards.length) setDone(true);
      else {
        setIndex((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1500);
  };

  return (
    <div className="lquiz">
      <div className="rev-progress" style={{ marginBottom: 12 }}>
        Question {index + 1} / {cards.length}
      </div>
      <div className="lquiz-q">{card.q}</div>
      <div className="lquiz-opts">
        <button
          className={`lquiz-opt ${selected !== null && selected === 1 ? 'correct' : ''} ${
            selected !== null && selected === 0 ? 'wrong' : ''
          }`}
          onClick={() => handleFlip(true)}
          disabled={selected !== null}
        >
          <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
          Je sais
        </button>
        <button
          className={`lquiz-opt ${selected !== null && selected === 0 ? 'wrong' : ''}`}
          onClick={() => handleFlip(false)}
          disabled={selected !== null}
        >
          <RotateCcw size={14} style={{ display: 'inline', marginRight: 6 }} />
          Je ne sais pas
        </button>
      </div>
      <div className={`lquiz-fb ${feedback ?? ''}`}>
        {feedback === 'ok' && '✓ Bien vu !'}
        {feedback === 'ko' && 'Pas de panique ! C\'est un piège classique.'}
      </div>
      {selected === 0 && (
        <div className="braise-quiz-help">
          <BraiseMascot size={36} mood="hesitant" />
          <div>
            <b>Pas de panique !</b>
            <span>{card.a}</span>
          </div>
        </div>
      )}
    </div>
  );
}
