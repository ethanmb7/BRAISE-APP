import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BraiseMascot } from './BraiseMascot';
import { RankIcon } from './RankIcon';
import { RANKS, type Rank } from '@/lib/aura';
import { sfx } from '@/lib/sound';

interface RankUpCelebrationProps {
  fromRank: Rank;
  toRank: Rank;
  xp: number;
  message: string;
  /** "cool" (sunglasses) for the Coach Savage tone, "proud" for Pote Chill — matches whichever
   *  voice tone actually generated `message`, instead of a fixed expression for every tone. */
  mood?: 'proud' | 'cool';
  /** Collège gets the full bouncy/sparkly treatment; lycée keeps the same beats (still a real
   *  celebration) but toned down — the copy already splits tone by age ("Le bac recule encore
   *  d'un pas" reads nothing like a collège line), the animation never did. */
  ageGroup?: 'college' | 'lycee';
  soundOn: boolean;
  onDismiss: () => void;
  onShare: () => void;
}

// A dedicated screen, not an overlay on top of whatever was showing — the same choice every
// top-tier "evolution" moment makes (a Pokémon evolution, a Duolingo league promotion, a Clash
// Royale card upgrade): none of them dim the previous screen and pop a card on it, they cut to a
// stage that belongs to the moment alone, with its own background, so there's nothing competing
// with it. The backdrop is the new rank's own colour grounded into the app's dark ink (never the
// raw rank colour alone — Argent's pale blue-grey would leave white text with poor contrast at
// the top of the gradient), so text stays safely legible on every one of the 5 tiers without
// hand-tuning each one. Every shape (rays, burst, sparkles, rail) is flat and hard-edged —
// polygons and solid fills with black strokes, never a blurred glow — to stay in the app's own
// neobrutalist language instead of importing a foreign effect.
export function RankUpCelebration({
  fromRank,
  toRank,
  xp,
  message,
  mood = 'proud',
  ageGroup = 'college',
  soundOn,
  onDismiss,
  onShare,
}: RankUpCelebrationProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'focus' | 'charge' | 'impact' | 'reveal'>(() => reduceMotion ? 'reveal' : 'focus');
  const morphed = phase === 'impact' || phase === 'reveal';
  const teen = ageGroup === 'lycee';
  const next = RANKS[RANKS.findIndex((r) => r.id === toRank.id) + 1] ?? null;
  // "Passer" used to be tappable from the very first frame — a fast tap could close the screen
  // before the transformation even started, skipping the whole moment this component exists to
  // deliver. It now only becomes real (visible and clickable, not just present) once the core
  // reveal has landed, matching how top apps hold a beat before offering the exit.
  const [canSkip, setCanSkip] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<number[]>([]);

  const clearTimeline = () => {
    timelineRef.current.forEach(window.clearTimeout);
    timelineRef.current = [];
  };

  const finishReveal = () => {
    if (phase !== 'reveal') {
      clearTimeline();
      setPhase('reveal');
      setCanSkip(true);
    }
  };

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    finishReveal();
  };

  // The rank rail and the "Continuer"/"Partager" buttons are the one part of this screen that
  // must never be pushed off-screen — on a short or budget-Android viewport (360×640 is common,
  // not an edge case), fitting everything without scrolling means the mascot/badge/message block
  // has to shrink first, since it's the only piece here without a real floor.
  const [viewportH, setViewportH] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const compact = viewportH < 700;
  const mascotSize = compact ? Math.max(142, Math.round(viewportH * 0.235)) : 190;

  useEffect(() => {
    if (reduceMotion) return;
    timelineRef.current = [
      window.setTimeout(() => setPhase('charge'), 350),
      window.setTimeout(() => setPhase('impact'), 950),
      window.setTimeout(() => setPhase('reveal'), 1800),
    ];
    return clearTimeline;
  }, [reduceMotion]);

  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), reduceMotion ? 120 : 2000);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    if (phase === 'charge') sfx.rankCharge(soundOn);
    if (phase === 'impact') sfx.rankImpact(soundOn);
    if (phase === 'reveal') sfx.rankReveal(soundOn);
  }, [phase, reduceMotion, soundOn]);

  // A real dialog, not a passive announcement: `role="status"` is a live region for things like
  // toasts, not an interactive screen — a screen reader had no reason to think this was something
  // to act on. Escape now closes it and the primary button takes focus on mount, so a keyboard or
  // screen-reader user isn't stranded here with no way out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
      if ((e.key === 'Enter' || e.key === ' ') && phase !== 'reveal') {
        e.preventDefault();
        e.stopPropagation();
        finishReveal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === 'reveal') continueRef.current?.focus();
  }, [phase]);

  return (
    <div
      // Never scrollable, on purpose: this is a single fixed "stage", not a page — content is
      // sized and centered to fit the exact app-shell box it's pinned to, and anything decorative
      // (the burst, sparkles, sunburst rays) that visually overhangs its content box is meant to
      // fade off the edge of the screen rather than stretch it, the same way a poster doesn't grow
      // to fit its own glow.
      className={`rank-up-stage is-${phase} absolute inset-0 z-[80] flex flex-col overflow-hidden`}
      style={{ '--rank-from': toRank.colorFrom, '--rank-to': toRank.colorTo } as CSSProperties}
      onClick={handleStageClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Nouveau rang débloqué : ${toRank.name}`}
    >
      {/* Clipped to the dialog's own bounds, not the content it decorates: the rays keep
          rotating and their axis-aligned box swells past 460px at a diagonal angle — left
          unclipped inside the centered content column, that swell was inflating the whole
          page's scrollable height, forcing a scrollbar to reach the "Continuer" button even
          though the real content already fit the screen. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <SunburstRays colorFrom={toRank.colorFrom} colorTo={toRank.colorTo} />
      </div>

      <div className="relative z-20 flex items-center justify-between px-4 pt-4">
        {/* Plain label, not a button lookalike — no border/shadow, so it doesn't compete with
            "Passer" for the eye the way two identically-styled pills did before. A translucent
            black scrim (not white) on purpose: a white overlay only darkens white text's contrast
            when the background is already dark — against Argent's new vivid blue it composited
            down to 3.7:1 and failed WCAG AA. Black always darkens what's behind it, so contrast
            against white text can only improve, on every one of the 5 rank colours. */}
        <span className="rank-up-kicker border-[2.5px] border-sapie-neo-ink bg-sapie-sun px-3 py-1 text-[0.7rem] font-black uppercase text-sapie-neo-ink shadow-[3px_3px_0_var(--color-sapie-neo-ink)]">
          Nouveau rang
        </span>
        <button type="button"
          onClick={onDismiss}
          disabled={!canSkip}
          aria-hidden={!canSkip}
          tabIndex={canSkip ? 0 : -1}
          className="h-auto rounded-lg border-2 border-sapie-neo-ink bg-sapie-paper px-3 py-1 text-[0.7rem] font-black text-sapie-neo-ink shadow-[2px_2px_0_var(--color-sapie-neo-ink)] transition-opacity duration-300 hover:bg-sapie-paper"
          style={{ opacity: canSkip ? 1 : 0, pointerEvents: canSkip ? 'auto' : 'none' }}
        >
          Passer ✕
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-2">
        <motion.div
          animate={phase === 'impact' && !reduceMotion ? (teen ? { x: [0, -3, 3, 0] } : { x: [0, -6, 6, -3, 3, 0] }) : { x: 0 }}
          transition={{ duration: teen ? 0.28 : 0.38 }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 0.72, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="rank-up-character-zone relative flex min-h-[180px] items-end justify-center sm:min-h-[220px]"
          >
            {!reduceMotion && <CoreCharge active={phase === 'charge'} color={toRank.colorTo} />}
            {!reduceMotion && <ImpactBurst show={phase === 'impact'} />}
            {!reduceMotion && <Sparkles show={phase === 'impact'} count={teen ? 8 : 12} colorA={toRank.colorFrom} colorB={toRank.colorTo} />}

            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={morphed ? toRank.id : fromRank.id}
                initial={morphed && !reduceMotion ? { opacity: 0, scaleX: 0.72, scaleY: 1.3, y: -12 } : false}
                animate={phase === 'charge' && !reduceMotion
                  ? { opacity: 1, scaleX: [1, 1.03, 0.98, 1.12], scaleY: [1, 0.97, 1.04, 0.82], y: [0, 2, -1, 12], rotate: [0, -1, 1, 0] }
                  : morphed && !reduceMotion
                    ? { opacity: 1, scaleX: teen ? [0.8, 1.06, 1] : [0.74, 1.12, 0.96, 1], scaleY: teen ? [1.2, 0.96, 1] : [1.32, 0.9, 1.04, 1], y: [12, -18, 5, 0], rotate: [3, -2, 1, 0] }
                    : { opacity: 1, scaleX: 1, scaleY: 1, y: 0, rotate: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scaleX: 1.2, scaleY: 0.68, y: 12, transition: { duration: 0.2, ease: 'easeIn' } }}
                transition={phase === 'charge'
                  ? { duration: 0.5, times: [0, 0.35, 0.68, 1], ease: 'easeInOut' }
                  : morphed && !reduceMotion
                     ? { duration: teen ? 0.56 : 0.68, times: teen ? [0, 0.55, 1] : [0, 0.42, 0.72, 1], ease: 'easeOut' }
                    : { type: 'spring', stiffness: 310, damping: 15 }}
                className="relative z-10"
              >
                 <div className={phase === 'charge' ? 'rank-up-braise is-charging' : morphed ? 'rank-up-braise is-evolved' : 'rank-up-braise'}>
                   <BraiseMascot
                     size={mascotSize}
                      mood={phase === 'charge' ? 'charging' : morphed ? mood : 'eager'}
                      pose={phase === 'focus' ? 'focus' : phase === 'charge' ? 'charge' : phase === 'impact' ? 'land' : 'victory'}
                     rankId={morphed ? toRank.id : fromRank.id}
                   />
                 </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {(phase === 'focus' || phase === 'charge') && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15 }}
                className="rank-up-transform-label"
              >
                {phase === 'focus' ? `${fromRank.name.toUpperCase()} → ${toRank.name.toUpperCase()}` : 'ÇA CHAUFFE…'}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.7 }}
            animate={phase === 'reveal' ? { y: 0, opacity: 1, scale: teen ? 1 : [1.16, 0.97, 1], rotate: teen ? 0 : [-2, 1, 0] } : { y: -18, opacity: 0, scale: 0.72 }}
            transition={reduceMotion
              ? { duration: 0.01 }
              : phase === 'reveal' && !teen
                ? { duration: 0.34, ease: 'easeOut' }
                : { type: 'spring', stiffness: 330, damping: 17 }}
            className={`rank-up-rank-stamp relative z-10 flex -rotate-2 items-center gap-1.5 border-[3px] border-sapie-neo-ink px-5 py-1 font-black uppercase text-sapie-neo-ink shadow-[5px_5px_0_var(--color-sapie-neo-ink)] ${compact ? 'mt-0 text-2xl' : 'mt-1 text-3xl'}`}
            style={{ background: toRank.colorFrom }}
          >
            {/* White fill, not the rank's own colour — the pill's background already IS that
                colour, so a same-colour icon would vanish into it. White reads as an embossed
                medallion on top instead. */}
            <RankIcon rankId={toRank.id} color="#fff" size={20} />
            {toRank.name.toUpperCase()}
          </motion.div>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={phase === 'reveal' ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.12, duration: reduceMotion ? 0.01 : 0.28 }}
            className={`relative z-10 max-w-[320px] text-center font-display font-black text-sapie-neo-ink ${compact ? 'mt-3 text-base' : 'mt-4 text-lg'}`}
          >
            {message}
          </motion.p>

          {/* Same "distance to the next reward" hook as "Ton Aura" (ProfilAuraView's RankRail
              caption) — proven there to create anticipation better than a cumulative total. The
              single highest-attention screen in the app was the one place that cut straight to
              a dead end instead of pointing forward. */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'reveal' ? 1 : 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? 0.01 : 0.25 }}
            className="relative z-10 mt-1.5 text-center text-xs font-bold text-sapie-neo-ink/70"
          >
            {next ? (
              <>
                <span className="text-sapie-neo-ink">{next.min - xp} XP</span> jusqu'à {next.name}
              </>
            ) : (
              'Rang maximum atteint 👑'
            )}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={phase === 'reveal' ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ delay: reduceMotion ? 0 : 0.28, duration: reduceMotion ? 0.01 : 0.32 }}
        className={`px-6 ${compact ? 'pb-2' : 'pb-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={compact ? '-mb-2' : undefined}>
          <RankJourney currentRankId={toRank.id} accent={toRank.colorFrom} revealed={phase === 'reveal'} />
        </div>

        <div className={`flex gap-3 ${compact ? 'mt-2' : 'mt-4'}`}>
          {/* Sharing was previously absent from the one moment in the whole app with the most
              reason to be shared — a peak-emotion beat is exactly when a student is likeliest to
              post it. Secondary/outlined so it never competes with "Continuer" as the default action. */}
          <button type="button" onClick={onShare} className="group relative h-auto flex-1 p-0 hover:bg-transparent">
            <span aria-hidden="true" className="absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black bg-black/60" />
             <span className={`relative flex items-center justify-center gap-1.5 rounded-2xl border-[2.5px] border-sapie-neo-ink bg-sapie-paper px-4 font-display text-base font-black text-sapie-neo-ink shadow-[3px_3px_0_var(--color-sapie-neo-ink)] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none ${compact ? 'py-2' : 'py-3'}`}>
              Partager
            </span>
          </button>
          <button type="button" ref={continueRef} onClick={onDismiss} className="group relative h-auto flex-[1.4] p-0 hover:bg-transparent">
            <span aria-hidden="true" className="absolute inset-0 translate-y-[3px] rounded-2xl border-[2.5px] border-black bg-black/60" />
             <span className={`relative flex items-center justify-center rounded-2xl border-[2.5px] border-sapie-neo-ink bg-sapie-neo-orange px-4 font-display text-base font-black text-sapie-paper shadow-[3px_3px_0_var(--color-sapie-neo-ink)] transition-transform duration-100 group-active:translate-y-[3px] group-active:shadow-none ${compact ? 'py-2' : 'py-3'}`}>
              Continuer
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CoreCharge({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" aria-hidden="true">
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute h-20 w-20 rounded-full border-[4px] border-black"
          style={{ background: color }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={active ? { scale: [0.3, 1.05 + ring * 0.35], opacity: [0, 0.72, 0] } : { scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.48, delay: ring * 0.08, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Same ladder as "Ton Aura" (same CSS classes, same pulsing current node) — reused rather than
// redrawn, so the celebration and the profile page agree on what the journey looks like instead
// of inventing a second visual language for the same 5 ranks.
function RankJourney({ currentRankId, accent, revealed }: { currentRankId: string; accent: string; revealed: boolean }) {
  const currentIdx = RANKS.findIndex((r) => r.id === currentRankId);
  return (
    <div className="rank-rail" role="list" aria-label="Les 5 rangs">
      <div className="rank-rail-track">
        <div className="rank-rail-line">
          <motion.div
            className="rank-rail-line-fill"
            initial={false}
            animate={{ width: revealed ? `${(currentIdx / (RANKS.length - 1)) * 100}%` : `${(Math.max(0, currentIdx - 1) / (RANKS.length - 1)) * 100}%` }}
            transition={{ delay: 0.08, duration: 0.46, ease: 'easeOut' }}
          />
        </div>
        {RANKS.map((r, idx) => {
          const tier: 'done' | 'current' | 'locked' = idx === currentIdx ? 'current' : idx < currentIdx ? 'done' : 'locked';
          return (
            <motion.div
              key={r.id}
              className={`rank-rail-node is-${tier}`}
              style={tier === 'current' ? ({ '--rank-accent': accent } as CSSProperties) : undefined}
              role="listitem"
              aria-label={`${r.name}${tier === 'done' ? ', débloqué' : tier === 'locked' ? ', verrouillé' : ', rang actuel'}`}
              animate={idx === currentIdx && revealed ? { scale: [0.82, 1.2, 1] } : { scale: 1 }}
              transition={{ delay: 0.12, duration: 0.42, ease: 'easeOut' }}
            >
              <RankIcon rankId={r.id} color={r.colorFrom} locked={tier === 'locked'} size={tier === 'current' ? 24 : 20} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// A pinwheel of flat triangular rays behind Braise, slowly rotating for as long as the screen is
// up — the "hero spotlight" every evolution/promotion moment in top apps uses, built from solid
// polygons with a gradient fade (transparent at the hub, coloured at the tip) rather than a blur
// filter, so the edges stay crisp like the rest of the app.
function SunburstRays({ colorFrom, colorTo }: { colorFrom: string; colorTo: string }) {
  const rayCount = 16;
  const gradId = `rayGrad-${colorFrom.replace('#', '')}`;
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="pointer-events-none absolute left-1/2 top-[40%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 0.36, rotate: 18 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={colorTo} stopOpacity="0" />
          <stop offset="100%" stopColor={colorFrom} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {Array.from({ length: rayCount }).map((_, i) => (
        <polygon
          key={i}
          points="200,200 212,4 188,4"
          fill={`url(#${gradId})`}
          transform={`rotate(${(360 / rayCount) * i} 200 200)`}
        />
      ))}
    </motion.svg>
  );
}

// A sharp 8-point star (not a soft circular glow) flashes once right as Braise's colours swap —
// the classic trick that sells an instant swap as a "transformation": the burst hides the cut.
function ImpactBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1.5, 2], opacity: [0, 1, 0] }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <polygon points={starPoints(200, 200, 8, 190, 85)} fill="#fff" stroke="#151821" strokeWidth="4" />
    </motion.svg>
  );
}

// Small flat 5-point star "sparkles" (CSS clip-path, no images) flying outward from Braise and
// fading — a cheap, GPU-friendly particle effect that reads as "magic" without a single blurred
// pixel, matching the two colours the mascot is transforming into.
function Sparkles({ show, count = 12, colorA, colorB }: { show: boolean; count?: number; colorA: string; colorB: string }) {
  if (!show) return null;
  const star5 =
    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const dist = 95 + (i % 3) * 26;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 block h-3.5 w-3.5"
            style={{ background: i % 2 === 0 ? colorA : colorB, clipPath: star5 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{ x, y, opacity: [0, 1, 0], scale: [0.3, 1, 0.5], rotate: 100 }}
            transition={{ duration: 0.9, delay: i * 0.02, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
}

function starPoints(cx: number, cy: number, spikes: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  const step = Math.PI / spikes;
  let angle = -Math.PI / 2;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
    angle += step;
  }
  return pts.join(' ');
}
