import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { BraiseMascot } from '@/components/BraiseMascot';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { getAgeGroup, recapCardsLine, recapComboLine, recapTrophyLine } from '@/lib/braiseVoice';

type Slide =
  | { key: 'cards'; bg: 'ink'; title: string; sub: string }
  | { key: 'combo'; bg: 'orange'; title: string; sub: string }
  | { key: 'xp'; bg: 'mint'; xpTarget: number }
  | { key: 'cta'; bg: 'paper' };

const DURATIONS: Record<string, number> = {
  cards: 2000,
  combo: 1900,
  xp: 2400,
};

export function BraiseRecap({
  reviewed,
  wrongCount,
  maxCombo,
  xpEarned,
  onRestart,
  onGoHome,
}: {
  reviewed: number;
  wrongCount: number;
  maxCombo: number;
  xpEarned: number;
  onRestart: () => void;
  onGoHome: () => void;
}) {
  const { state } = useApp();
  // Same tone system every other Braise line in the app already uses — this screen was the one
  // real gap found auditing where it should apply but didn't (see the comment on recapCardsLine
  // in braiseVoice.ts).
  const voiceCtx = useMemo(
    () => ({ personality: state.user.personality, age: getAgeGroup(state.user.level) }),
    [state.user.personality, state.user.level]
  );
  const trophy = useMemo(() => recapTrophyLine(voiceCtx), [voiceCtx]);

  const slides: Slide[] = [
    {
      key: 'cards',
      bg: 'ink',
      title: `${reviewed} CARTE${reviewed > 1 ? 'S' : ''}. ${wrongCount === 0 ? '0 ERREUR.' : `${wrongCount} ERREUR${wrongCount > 1 ? 'S' : ''}.`}`,
      sub: recapCardsLine(voiceCtx, wrongCount),
    },
    ...(maxCombo >= 2
      ? ([{
          key: 'combo',
          bg: 'orange',
          title: `COMBO ×${maxCombo}`,
          sub: recapComboLine(voiceCtx, maxCombo),
        }] as Slide[])
      : []),
    { key: 'xp', bg: 'mint', xpTarget: xpEarned },
    { key: 'cta', bg: 'paper' },
  ];

  const [i, setI] = useState(0);
  const slide = slides[i];
  const isLast = i === slides.length - 1;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const precision = reviewed > 0 ? Math.round(((reviewed - wrongCount) / reviewed) * 100) : 0;

  // The session's own payoff moment — the biggest celebration in the whole screen — played no
  // sound at all: every other "you finished something" beat in the app (a lesson, onboarding)
  // already uses sfx.complete for exactly this, Réviser's recap just never called it. Once per
  // mount only (BraiseRecap remounts fresh each session via SwipeDeck's key, so this can't
  // replay on a re-render).
  useEffect(() => {
    sfx.complete(state.soundOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLast) return;
    const dur = DURATIONS[slide.key] ?? 2000;
    timerRef.current = setTimeout(() => setI((n) => n + 1), dur);
    return () => clearTimeout(timerRef.current);
  }, [i, isLast, slide.key]);

  // A tap anywhere on the recap jumps straight to the final trophy card — the Combo/XP slides
  // are hype, not information the player needs to sit through if they've already seen it (or
  // just don't care), and forcing multiple taps through them to reach the one screen with an
  // actual next action (restart / go home) is exactly the kind of friction "ultra-rapide"
  // rules out. No left/right split needed once skipping is all-or-nothing.
  const skipToEnd = () => !isLast && setI(slides.length - 1);

  return (
    <div className={`recap-overlay bg-${slide.bg}`}>
      <div className="recap-progress">
        {slides.map((s, idx) => (
          <div key={s.key} className={`recap-seg ${idx < i ? 'done' : idx === i ? 'active' : ''}`}>
            <span
              className="fill"
              style={idx === i && !isLast ? ({ '--dur': `${DURATIONS[s.key] ?? 2000}ms` } as React.CSSProperties) : undefined}
            />
          </div>
        ))}
      </div>
      {!isLast && <BraiseMascot size={44} mood="cool" className="recap-avatar" />}

      {!isLast && <div className="recap-taps" onClick={skipToEnd} />}
      {!isLast && <div className="recap-tap-hint">Touche l&apos;écran pour passer</div>}

      <div className="recap-slide">
        {slide.key === 'xp' ? <XpCount target={slide.xpTarget} /> : null}
        {slide.key === 'cards' || slide.key === 'combo' ? (
          <>
            <div className="recap-title">{slide.title}</div>
            <div className="recap-sub">{slide.sub}</div>
          </>
        ) : null}
        {slide.key === 'cta' ? (
          <div className="recap-trophy-card">
            <button className="recap-close" onClick={onGoHome} aria-label="Retourner à l'accueil">
              <X size={18} />
            </button>
            <BraiseMascot size={104} mood="cool" className="recap-trophy-mascot" />
            <div className="recap-title on-light">{trophy.title}</div>
            <div className="recap-sub on-light">{trophy.sub}</div>
            <div className="recap-stat-row">
              <div className="recap-stat-chip">
                <span className="recap-stat-icon">⭐</span>
                <span className="recap-stat-value">+{xpEarned}</span>
                <span className="recap-stat-label">XP</span>
              </div>
              <div className="recap-stat-chip combo">
                <span className="recap-stat-icon">🔥</span>
                <span className="recap-stat-value">×{maxCombo}</span>
                <span className="recap-stat-label">Combo max</span>
              </div>
              <div className="recap-stat-chip precision">
                <span className="recap-stat-icon">🎯</span>
                <span className="recap-stat-value">{precision}%</span>
                <span className="recap-stat-label">Précision</span>
              </div>
            </div>
            <button className="btn-block recap-btn" onClick={onRestart}>
              Enchaîner une autre série
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function XpCount({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (target <= 0) return;
    const step = Math.max(1, Math.ceil(target / 24));
    const id = setInterval(() => {
      setN((v) => {
        const next = v + step;
        if (next >= target) {
          clearInterval(id);
          return target;
        }
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, [target]);
  return (
    <>
      <div className="recap-xp">+{n}</div>
      <div className="recap-sub">XP GAGNÉS</div>
    </>
  );
}
