import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { BraiseMascot } from "@/components/BraiseMascot";
import { useApp } from "@/store";
import { sfx } from "@/lib/sound";
import { getAgeGroup, recapCardsLine, recapComboLine, recapTrophyLine } from "@/lib/braiseVoice";
import { useCountUp } from "@/lib/useCountUp";

type Slide =
  | { key: "cards"; bg: "ink"; title: string; sub: string }
  | { key: "combo"; bg: "orange"; title: string; sub: string }
  | { key: "xp"; bg: "mint"; xpTarget: number }
  | { key: "cta"; bg: "paper" };

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
  theme = null,
  onReviewNotion,
  onRestart,
  onGoHome,
}: {
  reviewed: number;
  wrongCount: number;
  maxCombo: number;
  xpEarned: number;
  /** The series was one chapter tried before any lesson: what came back is told, not what was missed. */
  theme?: { title: string } | null;
  /** After a series of one chapter where something slipped: the lesson, the one thing to do next. */
  onReviewNotion?: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}) {
  const { state } = useApp();
  // Same tone system every other Braise line in the app already uses — this screen was the one
  // real gap found auditing where it should apply but didn't (see the comment on recapCardsLine
  // in braiseVoice.ts).
  const voiceCtx = useMemo(
    () => ({ personality: state.user.personality, age: getAgeGroup(state.user.level) }),
    [state.user.personality, state.user.level],
  );
  const generalTrophy = useMemo(() => recapTrophyLine(voiceCtx), [voiceCtx]);
  // "Dans la poche" is a status earned over several days (see statusLabels), so a series that only
  // tried a chapter once never claims it: it says what happens next.
  const trophy = theme
    ? wrongCount === 0
      ? {
          title: "REVENU SANS AIDE.",
          sub: "Reviens demain : c’est en le retrouvant à des jours différents que ça passe dans la poche.",
        }
      : {
          title: "ON Y REVIENT.",
          sub: "Ce qui a glissé revient demain, au bon moment.",
        }
    : generalTrophy;

  // What came back without help; the rest is "à rallumer", never a count of mistakes.
  const retrieved = Math.max(0, reviewed - wrongCount);

  const slides: Slide[] = [
    {
      key: "cards",
      bg: "ink",
      // What was done, never a count of mistakes: that is a mark, and Braise's line below reacts to
      // the session in her own words.
      title: theme
        ? retrieved > 0
          ? `${retrieved} RETROUVÉE${retrieved > 1 ? "S" : ""}.`
          : "PAS ENCORE."
        : `${reviewed} CARTE${reviewed > 1 ? "S" : ""}.`,
      sub: theme
        ? wrongCount === 0
          ? "Tout est revenu sans aide. Il reste à le garder."
          : "Les autres, on les rallume ensemble."
        : recapCardsLine(voiceCtx, wrongCount),
    },
    ...(maxCombo >= 2
      ? ([
          {
            key: "combo",
            bg: "orange",
            title: `COMBO ×${maxCombo}`,
            sub: recapComboLine(voiceCtx, maxCombo),
          },
        ] as Slide[])
      : []),
    { key: "xp", bg: "mint", xpTarget: xpEarned },
    { key: "cta", bg: "paper" },
  ];

  const [i, setI] = useState(0);
  const slide = slides[i];
  const isLast = i === slides.length - 1;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
          <div key={s.key} className={`recap-seg ${idx < i ? "done" : idx === i ? "active" : ""}`}>
            <span
              className="fill"
              style={
                idx === i && !isLast
                  ? ({ "--dur": `${DURATIONS[s.key] ?? 2000}ms` } as React.CSSProperties)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
      {!isLast && <BraiseMascot size={44} mood="cool" className="recap-avatar" />}

      {!isLast && <div className="recap-taps" onClick={skipToEnd} />}
      {!isLast && <div className="recap-tap-hint">Touche l&apos;écran pour passer</div>}

      <div className="recap-slide">
        {slide.key === "xp" ? <XpCount target={slide.xpTarget} /> : null}
        {slide.key === "cards" || slide.key === "combo" ? (
          <>
            <div className="recap-title">{slide.title}</div>
            <div className="recap-sub">{slide.sub}</div>
          </>
        ) : null}
        {slide.key === "cta" ? (
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
            </div>
            {theme && wrongCount > 0 && onReviewNotion ? (
              <>
                <button className="btn-block recap-btn" onClick={onReviewNotion}>
                  Revoir la notion
                </button>
                <button type="button" className="recap-link" onClick={onRestart}>
                  Enchaîner une autre série
                </button>
              </>
            ) : (
              <button className="btn-block recap-btn" onClick={onRestart}>
                Enchaîner une autre série
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function XpCount({ target }: { target: number }) {
  // Same rAF-based counter every other reward number in the app uses (Aura, Profil, the header
  // XP badge) — this used to be its own separate setInterval implementation, functionally
  // similar but a second copy of logic that already existed once.
  const n = useCountUp(target, 700);
  return (
    <>
      <div className="recap-xp">+{n}</div>
      <div className="recap-sub">XP GAGNÉS</div>
    </>
  );
}
