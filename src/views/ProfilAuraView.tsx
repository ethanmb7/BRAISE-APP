import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Trophy, WifiOff } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import { BraiseMascot } from '@/components/BraiseMascot';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { getRankInfo, RANKS, type Rank } from '@/lib/aura';
import { FLASHCARDS } from '@/data';

// Diameter of the hero ring frame — the single largest element on the page, on purpose.
const HERO_SIZE = 180;

// Staggered entrance — each direct child of the HUD fades/lifts in shortly after the previous
// one, rather than the whole screen appearing as one flat block.
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
};
// The Hero gets its own, bigger entrance — a spring pop instead of a calm fade, so the one
// element meant to land in under half a second actually feels like an arrival, not a fade-up.
const heroPop = {
  hidden: { opacity: 0, scale: 0.72, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } as const },
};
// A punchier, spring-driven pop reserved for the pride stats — a toy/HUD counter feel rather
// than the calm premium reveal used for the season-pass rail.
const popItem = {
  hidden: { opacity: 0, y: 10, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 20 } as const },
};

// Counts a displayed number up to its target over `duration`ms using a single rAF loop —
// cheap, touches nothing but a text node, cancels cleanly on unmount or if the target changes
// mid-flight. Every reward number on this screen uses it so a change reads as a small win
// instead of a silent text swap.
function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  useEffect(() => {
    const from = valueRef.current;
    if (from === target) return;
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return value;
}

export function ProfilAuraView() {
  const { state, loaded } = useApp();
  const isOnline = useOnlineStatus();
  const [shareOpen, setShareOpen] = useState(false);
  const { current, next, pct } = getRankInfo(state.xp);

  const stats = useMemo(() => {
    const reviewedIds = Object.keys(state.cardReviews);
    const subjectsSeen = new Set(
      reviewedIds.map((id) => FLASHCARDS.find((c) => c.id === id)?.subject).filter(Boolean)
    );
    const sureCount = reviewedIds.filter((id) => state.cardReviews[id].lastConfidence === 'sure').length;
    const precision = reviewedIds.length > 0 ? Math.round((sureCount / reviewedIds.length) * 100) : 0;
    return { subjectsCount: subjectsSeen.size, precision };
  }, [state.cardReviews]);

  const handleShareOpen = useCallback(() => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setShareOpen(true);
  }, [state.soundOn]);

  const handleShareClose = useCallback(() => setShareOpen(false), []);

  if (!loaded) {
    return <ProfilAuraSkeleton />;
  }

  return (
    <div className="view is-active aura-view aura-hud">
      <h1 className="aura-view-title">Ton Aura</h1>

      {!isOnline && (
        <div className="aura-offline-banner" role="status">
          <WifiOff size={14} />
          Hors-ligne · tes données restent sauvegardées sur cet appareil
        </div>
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        {/* Pillar 1 — Ancrage émotionnel : identité pure, zéro chiffre de progression. */}
        <motion.div variants={heroPop}>
          <AuraHeroScene rank={current} streak={state.streak} freezes={state.freezes} />
        </motion.div>

        {/* Pillar 2 — Contrat de rétention : tout le calcul de progression vit ici, et
            uniquement les métriques qui nourrissent la fierté ou l'envie de revenir. */}
        <motion.div variants={staggerItem}>
          <NextRankCallout next={next} xp={state.xp} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <RankRail currentRankId={current.id} rank={current} pct={pct} />
        </motion.div>
        <motion.div variants={popItem}>
          <PrideStats bestCombo={state.bestCombo} precision={stats.precision} />
        </motion.div>

        {/* Pillar 3 — Le Flex social : l'action de fin de scène. */}
        <motion.div variants={staggerItem}>
          <button className="aura-share-cta" onClick={handleShareOpen}>
            <span className="aura-share-icon" aria-hidden="true">
              <Trophy size={18} />
            </span>
            Partager mon Aura
          </button>
        </motion.div>
      </motion.div>

      {shareOpen && (
        <ShareAuraModal
          rank={current}
          streak={state.streak}
          xp={state.xp}
          subjectsCount={stats.subjectsCount}
          onClose={handleShareClose}
        />
      )}
    </div>
  );
}

// The Hero scene: a double-ring medallion (black structural border + rank-tinted inner ring)
// framing the mascot, with two corner badges — streak (top-left, the emotional/urgency signal)
// and rank (bottom-right, the status signal) — and the rank name as the single line of text
// beneath it. Deliberately carries no XP numbers at all: this scene answers "who am I right
// now", not "how far have I come" — that question belongs entirely to the season pass below.
// The ring's fill is always 100% of its own colour, never a fractional progress arc, so it
// reads as a solid badge of identity instead of a bar that looks "unfinished" early in a rank.
const AuraHeroScene = memo(function AuraHeroScene({
  rank,
  streak,
  freezes,
}: {
  rank: Rank;
  streak: number;
  freezes: number;
}) {
  const animatedStreak = useCountUp(streak);
  const freezeDanger = freezes === 0;
  return (
    <div className="aura-hero">
      <div className="aura-ring-frame" style={{ width: HERO_SIZE, height: HERO_SIZE }}>
        <div className="aura-ring-inner" style={{ borderColor: rank.colorFrom }}>
          <div className="aura-hero-avatar">
            {rank.id === 'legende' && <span className="aura-crown">👑</span>}
            {rank.id === 'or' && (
              <>
                <span className="aura-sparkle s1">✦</span>
                <span className="aura-sparkle s2">✦</span>
                <span className="aura-sparkle s3">✦</span>
              </>
            )}
            <BraiseMascot size={88} mood="cool" />
          </div>
        </div>
        <div
          className={`aura-streak-badge ${freezeDanger ? 'is-danger' : ''}`}
          aria-label={`${streak} jour${streak > 1 ? 's' : ''} de suite${freezeDanger ? ' · série à risque' : ''}`}
        >
          <span className="aura-streak-flame" aria-hidden="true">
            🔥
          </span>
          <span className="aura-streak-count" aria-hidden="true">
            {animatedStreak}
          </span>
          <span className="aura-streak-pips" aria-hidden="true">
            {[0, 1].map((i) => (
              <span key={i} className={`aura-streak-pip ${i < freezes ? 'is-filled' : ''}`} />
            ))}
          </span>
        </div>
        <div className="aura-hero-medal" aria-hidden="true">
          {rank.emoji}
        </div>
      </div>
      <span className="aura-hero-rankname">{rank.name.toUpperCase()}</span>
    </div>
  );
});

// The season-pass headline: the single next reward, framed as a short distance rather than a
// cumulative total — "1 556 XP jusqu'à Légende" creates anticipation the way "5444 / 7000"
// never did, and it's the one place on the page progression math actually lives.
const NextRankCallout = memo(function NextRankCallout({ next, xp }: { next: Rank | null; xp: number }) {
  return (
    <div className="season-eyebrow">
      {next ? (
        <>
          <span className="season-eyebrow-amount">{next.min - xp} XP</span>
          <span className="season-eyebrow-rest"> jusqu'à {next.name}</span>
        </>
      ) : (
        <span className="season-eyebrow-amount">Rang maximum atteint</span>
      )}
    </div>
  );
});

// Every rank visible at once on a single always-on progress rail, season-pass style. Nothing
// is hidden behind a tap, a swipe, or an expand — the entire ladder is legible in one glance.
const RankRail = memo(function RankRail({
  currentRankId,
  rank,
  pct,
}: {
  currentRankId: string;
  rank: Rank;
  pct: number;
}) {
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  const overallPct = ((currentIdx + pct / 100) / (RANKS.length - 1)) * 100;
  return (
    <div className="rank-rail" role="list" aria-label="Les 5 rangs">
      <div className="rank-rail-track">
        <div className="rank-rail-line">
          <div className="rank-rail-line-fill" style={{ width: `${overallPct}%` }} />
        </div>
        {RANKS.map((r, idx) => {
          const tier: 'done' | 'current' | 'locked' = idx === currentIdx ? 'current' : idx < currentIdx ? 'done' : 'locked';
          return (
            <div
              key={r.id}
              className={`rank-rail-node is-${tier}`}
              style={tier === 'current' ? ({ '--rank-accent': rank.colorFrom } as CSSProperties) : undefined}
              role="listitem"
              aria-label={`${r.name}, ${r.min} XP${tier === 'done' ? ', débloqué' : tier === 'locked' ? ', verrouillé' : ', rang actuel'}`}
            >
              {tier === 'locked' ? '🔒' : r.emoji}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Only two stats survive the cull: best combo and accuracy — both are pure mastery/pride
// signals tied to what the player actually does in a review session. Streak moved into the
// Hero (it's an emotional/urgency signal, not a mastery one) and the 7-day heatmap is gone
// entirely — the streak number already says "how consistent am I" more directly than a row of
// dots ever did, so keeping both was redundant, not reinforcing.
const PrideStats = memo(function PrideStats({ bestCombo, precision }: { bestCombo: number; precision: number }) {
  const animCombo = useCountUp(bestCombo);
  const animPrecision = useCountUp(precision);
  return (
    <div className="pride-stats" role="list">
      <div className="pride-stat" role="listitem" aria-label={`Combo maximum : ${bestCombo}`}>
        <span className="pride-stat-icon" aria-hidden="true">
          ⚡
        </span>
        <span className="pride-stat-text" aria-hidden="true">
          <span className="pride-stat-value">×{animCombo}</span>
          <span className="pride-stat-label">Combo max</span>
        </span>
      </div>
      <div className="pride-stat" role="listitem" aria-label={`Précision globale : ${precision}%`}>
        <span className="pride-stat-icon" aria-hidden="true">
          🎯
        </span>
        <span className="pride-stat-text" aria-hidden="true">
          <span className="pride-stat-value">{animPrecision}%</span>
          <span className="pride-stat-label">Précision</span>
        </span>
      </div>
    </div>
  );
});

function Skeleton({ width, height, radius = 8, style }: { width: string | number; height: string | number; radius?: number; style?: CSSProperties }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius, ...style }} />;
}

function SkeletonRow({ children }: { children: ReactNode }) {
  return <div className="skeleton-row">{children}</div>;
}

function ProfilAuraSkeleton() {
  return (
    <div className="view is-active aura-view aura-hud" aria-busy="true" aria-label="Chargement de ton Aura">
      <h1 className="aura-view-title">Ton Aura</h1>

      <div className="aura-hero">
        <Skeleton width={HERO_SIZE} height={HERO_SIZE} radius={999} style={{ marginBottom: 10 }} />
        <Skeleton width={110} height={22} radius={999} />
      </div>

      <Skeleton width={180} height={18} radius={999} style={{ margin: '18px auto 12px' }} />
      <Skeleton width="100%" height={44} radius={999} style={{ marginBottom: 16 }} />

      <SkeletonRow>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={62} radius={14} style={{ flex: 1 }} />
        ))}
      </SkeletonRow>

      <Skeleton width="100%" height={54} radius={999} style={{ marginTop: 16 }} />
    </div>
  );
}
