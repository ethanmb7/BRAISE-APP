import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, WifiOff } from 'lucide-react';
import { useApp, computeUnlockedBadges } from '@/store';
import { sfx } from '@/lib/sound';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import { BraiseMascot } from '@/components/BraiseMascot';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { SubjectIcon } from '@/components/SubjectIcon';
import { RankIcon } from '@/components/RankIcon';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { getRankInfo, RANKS, computeSubjectMastery, type Rank, type SubjectMastery } from '@/lib/aura';
import { FLASHCARDS, BADGES } from '@/data';

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
  const { state, loaded, openSubject, setView } = useApp();
  const isOnline = useOnlineStatus();
  const [shareOpen, setShareOpen] = useState(false);
  const { current, next, pct } = getRankInfo(state.xp);

  const stats = useMemo(() => {
    const reviewedIds = Object.keys(state.cardReviews);
    const subjectsSeen = new Set(
      reviewedIds.map((id) => FLASHCARDS.find((c) => c.id === id)?.subject).filter(Boolean)
    );
    return { subjectsCount: subjectsSeen.size };
  }, [state.cardReviews]);

  const subjectMastery = useMemo(() => computeSubjectMastery(state.cardReviews), [state.cardReviews]);
  const unlockedBadgeCount = useMemo(
    () => Object.values(computeUnlockedBadges(state)).filter(Boolean).length,
    [state]
  );

  const handleShareOpen = useCallback(() => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setShareOpen(true);
  }, [state.soundOn]);

  const handleShareClose = useCallback(() => setShareOpen(false), []);

  // Tapping a subject medallion drops straight into that deck — a weak subject becomes
  // something to act on immediately, not just a number to sit with. Same sound+haptic pairing
  // as handleShareOpen — every tap target on this page should feel the same under the thumb.
  const handleSubjectSelect = useCallback(
    (subjectId: string) => {
      sfx.tap(state.soundOn);
      if (navigator.vibrate) navigator.vibrate(10);
      openSubject(subjectId);
    },
    [state.soundOn, openSubject]
  );

  // The one bridge between this page and Profil's own badge grid — Aura never duplicates the
  // full grid, just enough of a trophy signal (a count, always true, no unlock-date needed) to
  // justify pointing there.
  const handleOpenBadges = useCallback(() => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setView('profile');
  }, [state.soundOn, setView]);

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
            uniquement les métriques qui nourrissent la fierté ou l'envie de revenir. Le "X XP
            jusqu'à Y" vit maintenant comme légende du rail lui-même — même histoire de
            progression, un seul bloc au lieu de deux qui se répétaient. */}
        <motion.div variants={staggerItem}>
          <RankRail currentRankId={current.id} rank={current} pct={pct} next={next} xp={state.xp} />
        </motion.div>

        {/* Extension du Pilier 2 : seule section reliée à une vraie donnée pédagogique ET
            actionnable (on tape, on révise) — ce qui justifie sa place ici. */}
        <motion.div variants={staggerItem}>
          <SubjectMasteryGrid subjects={subjectMastery} onSelect={handleSubjectSelect} />
        </motion.div>

        {/* Pillar 3 — Le Flex social : le pont vers Profil, puis l'action de fin de scène. */}
        <motion.div variants={staggerItem}>
          <BadgeBridge unlocked={unlockedBadgeCount} total={BADGES.length} onOpen={handleOpenBadges} />
        </motion.div>
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
            {/* Légende used to double up its crown — one floating here, one on the medal badge
                below. The medal is the single crown now; this spot keeps only the sparkle
                flourish, still reserved for Or. */}
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
            <StreakFlameIcon size={17} />
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
          <RankIcon rankId={rank.id} color={rank.colorFrom} size={24} />
        </div>
      </div>
      <span className="aura-hero-rankname">{rank.name.toUpperCase()}</span>
    </div>
  );
});

// Every rank visible at once on a single always-on progress rail, season-pass style. Nothing
// is hidden behind a tap, a swipe, or an expand — the entire ladder is legible in one glance.
// Carries its own caption now (used to be a standalone NextRankCallout block above it) — "1 556
// XP jusqu'à Légende" and the rail are the same story, so they're one component, not two.
const RankRail = memo(function RankRail({
  currentRankId,
  rank,
  pct,
  next,
  xp,
}: {
  currentRankId: string;
  rank: Rank;
  pct: number;
  next: Rank | null;
  xp: number;
}) {
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  const overallPct = ((currentIdx + pct / 100) / (RANKS.length - 1)) * 100;
  return (
    <div className="rank-rail" role="list" aria-label="Les 5 rangs">
      <div className="rank-rail-caption">
        {next ? (
          <>
            <span className="rank-rail-caption-amount">{next.min - xp} XP</span>
            <span className="rank-rail-caption-rest"> jusqu'à {next.name}</span>
          </>
        ) : (
          <span className="rank-rail-caption-amount">Rang maximum atteint</span>
        )}
      </div>
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
              <RankIcon rankId={r.id} color={r.colorFrom} locked={tier === 'locked'} size={tier === 'current' ? 24 : 20} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Same subject the Accueil grid uses, kept in one place so both screens shorten it identically.
const SHORT_SUBJECT_NAME: Record<string, string> = { maths: 'Maths' };

// Per-subject mastery — the one signal Réviser's own data (SM-2 repetitions per card) could
// already answer but nothing on the page surfaced: "où est-ce que je suis vraiment solide".
// Deliberately NOT a bulletin-scolaire row (icon + name + linear % bar) — that form reads as a
// report card no matter what copy sits next to it. Instead it reuses the page's own signature
// shape: the Hero's double-ring medallion, shrunk down and repeated once per subject, filled by
// mastery instead of by rank. Same visual family as the one moment on this page that already
// works, not a new grammar. Tapping a medallion opens that subject directly — a weak subject is
// something to act on, not a static number to sit with. Fixed subject order (same as Accueil's
// deck grid), never sorted by score, so a weak subject is never singled out by position.
const SubjectMasteryGrid = memo(function SubjectMasteryGrid({
  subjects,
  onSelect,
}: {
  subjects: SubjectMastery[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mastery-section">
      <span className="aura-section-label">Maîtrise par matière</span>
      <div className="mastery-grid" role="list">
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            className="mastery-tile"
            role="listitem"
            onClick={() => onSelect(s.id)}
            aria-label={`${s.name} : ${s.started ? `${s.pct}% maîtrisé` : 'pas encore commencé'} — réviser cette matière`}
          >
            <span className="mastery-ring-wrap">
              <span
                className={`mastery-ring ${s.started ? '' : 'is-empty'}`}
                style={{ '--ring-color': s.color, '--pct': s.pct } as CSSProperties}
              >
                <span className="mastery-ring-inner">
                  <SubjectIcon subjectId={s.id} color={s.started ? s.color : 'rgba(21,24,33,0.35)'} size={26} />
                </span>
              </span>
              {s.started && <span className="mastery-pct-badge">{s.pct}%</span>}
            </span>
            <span className="mastery-name">{SHORT_SUBJECT_NAME[s.id] ?? s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

// The one bridge between Aura and Profil's own badge grid. Deliberately just a count, never
// "ton dernier badge" — nothing in AppState timestamps when a badge unlocked, so claiming a
// "most recent" one would be a fabricated claim, not a real one. A count is honest and still a
// real trophy signal, and it primes the share moment right below it.
const BadgeBridge = memo(function BadgeBridge({
  unlocked,
  total,
  onOpen,
}: {
  unlocked: number;
  total: number;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="badge-bridge" onClick={onOpen}>
      <span className="badge-bridge-icon" aria-hidden="true">
        <RankIcon rankId="or" color="#ffd166" size={18} />
      </span>
      <span className="badge-bridge-text">
        {unlocked}/{total} badges débloqués
      </span>
      <ChevronRight size={18} className="badge-bridge-chevron" aria-hidden="true" />
    </button>
  );
});

function Skeleton({ width, height, radius = 8, style }: { width: string | number; height: string | number; radius?: number; style?: CSSProperties }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius, ...style }} />;
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

      <Skeleton width="100%" height={54} radius={999} style={{ marginTop: 16 }} />
    </div>
  );
}
