import { memo, useCallback, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Layers } from 'lucide-react';
import { useApp } from '@/store';
import { sfx } from '@/lib/sound';
import { useOnlineStatus } from '@/lib/useOnlineStatus';
import { useCountUp } from '@/lib/useCountUp';
import { BraiseMascot } from '@/components/BraiseMascot';
import { BraiseCharacter } from '@/components/BraiseCharacter';
import { ShareAuraModal } from '@/components/ShareAuraModal';
import { BadgeShelf } from '@/components/BadgeShelf';
import { SubjectIcon } from '@/components/SubjectIcon';
import { RankIcon } from '@/components/RankIcon';
import { StreakFlameIcon } from '@/components/StreakFlameIcon';
import { TrophyIcon } from '@/components/TrophyIcon';
import {
  getRankInfo,
  RANKS,
  computeSubjectMastery,
  countMasteredCards,
  computeBraiseInsight,
  computeNextMilestone,
  type Rank,
  type SubjectMastery,
  type BraiseInsight,
  type NextMilestone,
} from '@/lib/aura';
import { getAgeGroup, progressAdvice, strongSubjectLine } from '@/lib/braiseVoice';
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
export function ProfilAuraView() {
  const { state, loaded, openSubject, setTab, getDueCards } = useApp();
  const isOnline = useOnlineStatus();
  const [shareOpen, setShareOpen] = useState(false);
  const { current, next, pct } = getRankInfo(state.xp);
  const dueCount = getDueCards().length;

  const stats = useMemo(() => {
    const reviewedIds = Object.keys(state.cardReviews);
    const subjectsSeen = new Set(
      reviewedIds.map((id) => FLASHCARDS.find((c) => c.id === id)?.subject).filter(Boolean)
    );
    return { subjectsCount: subjectsSeen.size, masteredCards: countMasteredCards(state.cardReviews) };
  }, [state.cardReviews]);

  // Once the rank ladder is maxed, RankRail's own caption has nothing left to say — this keeps
  // it pointing forward on a different, uncapped axis instead of just announcing a dead end. See
  // computeNextMilestone in aura.ts for why streak/mastered-cards never run out the way XP does.
  const milestone = useMemo(
    () => computeNextMilestone(state.streak, stats.masteredCards),
    [state.streak, stats.masteredCards]
  );

  // "Ce que Braise a remarqué" — real observation mined from Réviser's own SM-2 state
  // (computeBraiseInsight), phrased through the existing tone system so it matches every other
  // Braise line in the app instead of inventing new copy. null (too little real history yet)
  // renders nothing — see BraiseInsightCard below.
  const insight = useMemo(() => computeBraiseInsight(state.cardReviews), [state.cardReviews]);
  const insightLine = useMemo(() => {
    if (!insight) return null;
    const voiceCtx = { personality: state.user.personality, age: getAgeGroup(state.user.level) };
    return insight.kind === 'struggling'
      ? progressAdvice(voiceCtx, insight.subjectName, insight.topic)
      : strongSubjectLine(voiceCtx, insight.subjectName, insight.masteredCount, insight.totalCount);
  }, [insight, state.user.personality, state.user.level]);

  const subjectMastery = useMemo(() => computeSubjectMastery(state.cardReviews), [state.cardReviews]);

  const handleShareOpen = useCallback(() => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setShareOpen(true);
  }, [state.soundOn]);

  const handleShareClose = useCallback(() => setShareOpen(false), []);

  // The action most worth taking on a page whose whole point is "make them want to come back" —
  // used to have zero presence here, only "Partager" did. Same sound+haptic pairing as every
  // other tap target on this page.
  const handleReviewClick = useCallback(() => {
    sfx.tap(state.soundOn);
    if (navigator.vibrate) navigator.vibrate(10);
    setTab('revisions');
  }, [state.soundOn, setTab]);

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

  if (!loaded) {
    return <ProfilAuraSkeleton />;
  }

  return (
    <div className="view is-active aura-view aura-hud">
      <h1 className="aura-view-title">Ton parcours</h1>

      {!isOnline && (
        <div className="aura-offline-banner" role="status">
          <WifiOff size={14} />
          Hors-ligne · tes données restent sauvegardées sur cet appareil
        </div>
      )}

      <motion.div className="aura-content" variants={staggerContainer} initial="hidden" animate="show">
        {/* Pillar 1 — Ancrage émotionnel : identité pure, zéro chiffre de progression. */}
        <motion.div variants={heroPop}>
          <AuraHeroScene rank={current} streak={state.streak} freezes={state.freezes} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <BraiseEvolutionLine currentRankId={current.id} />
        </motion.div>

        {/* Pillar 2 — Contrat de rétention : tout le calcul de progression vit ici, et
            uniquement les métriques qui nourrissent la fierté ou l'envie de revenir. Le "X XP
            jusqu'à Y" vit maintenant comme légende du rail lui-même — même histoire de
            progression, un seul bloc au lieu de deux qui se répétaient. */}
        <motion.div variants={staggerItem}>
          <RankRail currentRankId={current.id} rank={current} pct={pct} next={next} xp={state.xp} milestone={milestone} />
        </motion.div>

        {/* "Ce que Braise a remarqué" juste avant la grille qu'elle commente (jamais avant le rail
            de rang, qui parle d'XP — un sujet différent) : l'observation et la preuve qui la
            soutient doivent rester voisines, pas séparées par un bloc sans rapport. Ne s'affiche
            pas du tout tant qu'il n'y a pas de vraie observation à faire (voir insight/insightLine
            plus haut) plutôt qu'une relance vide. */}
        {insight && insightLine && (
          <motion.div variants={staggerItem}>
            <BraiseInsightCard insight={insight} line={insightLine} />
          </motion.div>
        )}

        {/* Extension du Pilier 2 : seule section reliée à une vraie donnée pédagogique ET
            actionnable (on tape, on révise) — ce qui justifie sa place ici. */}
        <motion.div variants={staggerItem}>
          <SubjectMasteryGrid subjects={subjectMastery} onSelect={handleSubjectSelect} />
        </motion.div>

        {/* Parcours — le journal des badges débloqués (vraies dates, jamais inventées — voir
            BadgeShelf), déplacé ici depuis Profil : c'est un historique d'accomplissement, pas
            une question d'identité. Remplace l'ancien BadgeBridge (un simple pont vers Profil) —
            il n'y a plus besoin de pont, le contenu réel vit directement ici maintenant. */}
        <motion.div variants={staggerItem}>
          <BadgeShelf state={state} />
        </motion.div>
        {/* Réviser était absent de la page dont le but entier est de donner envie de revenir —
            seul "Partager" avait une présence. C'est maintenant l'action principale (pleine,
            bruyante) ; "Partager" reste réel mais passe en secondaire (contour) — les deux
            gardent le même orange signature de l'appli, la hiérarchie se joue sur plein/contour,
            pas sur une deuxième couleur. */}
        <motion.div variants={staggerItem} className="aura-cta-stack">
          <button className="aura-review-cta" onClick={handleReviewClick}>
            <span className="aura-review-icon" aria-hidden="true">
              <Layers size={18} />
            </span>
            {dueCount > 0 ? `Réviser maintenant · ${dueCount} carte${dueCount > 1 ? 's' : ''}` : 'Réviser une carte'}
          </button>
          <button className="aura-share-cta" onClick={handleShareOpen}>
            <span className="aura-share-icon" aria-hidden="true">
              <TrophyIcon size={19} />
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
          masteredCards={stats.masteredCards}
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
      {/* A soft, slowly-breathing glow in the current rank's own colour — the same "tint the
          scene by rank" idea RankUpCelebration already uses for its full-screen background,
          just dialled down to an ambient spotlight instead of a solid backdrop. Gives the page
          a living identity tied to who you are right now (and a real payoff for ranking up:
          the glow itself gets richer through the ladder), rather than sitting on a flat page
          background like every other screen. The ring frame's own opaque white face covers the
          centre, so this only ever shows as a halo peeking around the medallion. */}
      <div
        className="aura-hero-glow"
        aria-hidden="true"
        style={{ background: `radial-gradient(circle, ${rank.colorFrom} 0%, transparent 70%)` }}
      />
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

const EVOLUTION_NAMES: Record<string, string> = {
  bronze: 'Étincelle',
  argent: 'Focus',
  or: 'Impact',
  platine: 'Maîtrise',
  legende: 'Libre',
};

const BraiseEvolutionLine = memo(function BraiseEvolutionLine({ currentRankId }: { currentRankId: string }) {
  const currentIdx = RANKS.findIndex((rank) => rank.id === currentRankId);
  return (
    <section className="braise-evolution-line" aria-label="Les évolutions de Braise">
      <div className="braise-evolution-heading">
        <span>TA BRAISE</span>
        <strong>{EVOLUTION_NAMES[currentRankId]}</strong>
      </div>
      <div className="braise-evolution-cast">
        {RANKS.map((rank, index) => {
          const unlocked = index <= currentIdx;
          const current = index === currentIdx;
          return (
            <div className={`braise-evolution-stage ${current ? 'is-current' : ''} ${unlocked ? '' : 'is-locked'}`} key={rank.id}>
              <BraiseCharacter size={current ? 58 : 46} rankId={rank.id} expression={current ? 'proud' : 'happy'} labelled={false} />
              <span>{current ? EVOLUTION_NAMES[rank.id] : rank.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

// "Ce que Braise a remarqué" — one real, specific observation (never a template with invented
// numbers, see computeBraiseInsight in aura.ts), in the same voice system every other Braise line
// in the app already uses. `hesitant` for a real weak point (the same mood the mascot already
// wears for "not sure yet" moments elsewhere) reads as genuine concern, not a scolding; `proud`
// for a real strength is the same mood the rank-up celebration uses. Never rendered when there's
// nothing true yet to say — the caller (ProfilAuraView) only mounts this when insight is non-null.
const BraiseInsightCard = memo(function BraiseInsightCard({ insight, line }: { insight: BraiseInsight; line: string }) {
  return (
    <div className="braise-insight">
      <span className="braise-insight-tab">Ce que Braise a remarqué</span>
      <div className="braise-insight-body">
        <div className="braise-insight-mascot" aria-hidden="true">
          <BraiseMascot size={44} mood={insight.kind === 'struggling' ? 'hesitant' : 'proud'} />
        </div>
        <p className="braise-insight-line">{line}</p>
      </div>
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
  milestone,
}: {
  currentRankId: string;
  rank: Rank;
  pct: number;
  next: Rank | null;
  xp: number;
  milestone: NextMilestone;
}) {
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  const overallPct = ((currentIdx + pct / 100) / (RANKS.length - 1)) * 100;
  const milestoneUnit = milestone.kind === 'streak' ? 'jour' : 'carte';
  const milestoneGoal = milestone.kind === 'streak' ? `${milestone.target} jours de série` : `${milestone.target} cartes maîtrisées`;
  return (
    <div className="rank-rail" role="list" aria-label="Les 5 rangs">
      <div className="rank-rail-caption">
        {next ? (
          <>
            <span className="rank-rail-caption-amount">{next.min - xp} XP</span>
            <span className="rank-rail-caption-rest"> jusqu'à {next.name}</span>
          </>
        ) : (
          // Le ladder de rangs est fini par design (5 paliers), mais série et cartes maîtrisées
          // continuent de grandir bien après — la légende reste "toujours quelque chose à
          // atteindre" au lieu de s'arrêter net sur "Rang maximum atteint".
          <>
            <span className="rank-rail-caption-amount">
              {milestone.remaining} {milestoneUnit}{milestone.remaining > 1 ? 's' : ''}
            </span>
            <span className="rank-rail-caption-rest"> jusqu'à {milestoneGoal}</span>
          </>
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
// Went through a ring-medallion phase (echoing the Hero) before this — visually consistent, but
// a borrowed-from-elsewhere metaphor (gauges, HUD bars, radar charts) on an app whose actual
// mechanic already has one built in: cards. A fanned stack of 4 abstract card-slots, filled
// left-to-right by real mastered/total progress, is the one version of this idea that isn't
// borrowed from another app or another game genre — it's literally what happens in Réviser.
// The label underneath is the real count ("3/6 cartes"), not a percentage: a percentage used to
// let one mastered card out of six read as "100%" just because it was the only one reviewed.
// Tapping a stack opens that subject directly — a weak subject is something to act on, not a
// static number to sit with. Fixed subject order (same as Accueil's deck grid), never sorted by
// score, so a weak subject is never singled out by position.
const SubjectMasteryGrid = memo(function SubjectMasteryGrid({
  subjects,
  onSelect,
}: {
  subjects: SubjectMastery[];
  onSelect: (id: string) => void;
}) {
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

// BadgeBridge (a teaser + a link over to Profil's own badge grid) used to live here — removed
// now that Profil no longer holds any badge content to bridge to; see BadgeShelf.tsx for the
// real thing that replaced it, rendered directly on this page.

function Skeleton({ width, height, radius = 8, style }: { width: string | number; height: string | number; radius?: number; style?: CSSProperties }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius, ...style }} />;
}

function ProfilAuraSkeleton() {
  return (
    <div className="view is-active aura-view aura-hud" aria-busy="true" aria-label="Chargement de ton parcours">
      <h1 className="aura-view-title">Ton parcours</h1>

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
