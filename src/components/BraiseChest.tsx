import { useId } from 'react';
import { motion } from 'framer-motion';

interface BraiseChestProps {
  size?: number;
  /** True while a finger/cursor is on the GO button — the chest cracks open a sliver and her eyes
   *  appear in the gap, the same "come look" read the previous pass got from BraiseInteractiveMascot's
   *  hyped state, now expressed as the chest itself reacting instead of a mascot floating beside it. */
  hyped: boolean;
  /** True for the chest-opening sequence, right after the click. */
  diving: boolean;
  /** Abbreviated choreography for a repeat "pioche" open later the same day (see
   *  getLastPiocheOpenDate in HeroPiocheCard) — only meaningful while `diving` is true. */
  quick: boolean;
}

type Phase = 'idle' | 'trigger' | 'full' | 'quick';

// Braise doesn't stand beside the card anymore — she's inside a small chest that IS the card's
// mascot slot. Three real design decisions carried over from the mockup review (see the session's
// "Le Choix de Braise" artifact) rather than reinvented here:
//
// 1. She's clipped to a rect covering only what's above the chest's mouth (y<46 in the SVG's own
//    0-100 space) — that's the actual mechanism that keeps her hidden, not a hand-tuned position.
//    Whatever the transform numbers below do, anything below the mouth line simply never draws.
// 2. Only her head/eyes and the pickaxe she's holding ever cross that line — "elle pointe le nez",
//    not a full-body entrance. The pickaxe is the literal tool, a deliberate pun on "pioche" being
//    both the tool and this feature's name.
// 3. The chest's own rectangular card frame (HeroPiocheCard) never moves — only this component and
//    its own children do, the same "Duo acts on a static path" principle as the previous pass.
//
// New this pass, from the "how do we get this to Duolingo's level" review:
// - Three real beats get three different spring/tween characters (a fast stiff anticipation
//   squash, an overshooting lid-pop, a damped settle) instead of one config reused everywhere.
// - Every micro-motion here is visibly larger than what the numbers "should" be — at 52-56px,
//   subtlety disappears; small UI benefits from exaggeration the way a full-screen animation
//   wouldn't need.
// - A soft contact-shadow ellipse under her sells real weight instead of a flat sticker floating
//   above the opening.
// - Her rise carries a tiny horizontal sway, not a pure vertical translateY — a dead-straight path
//   always reads as mechanical.
// - `quick` swaps in a shorter, calmer version of the same beats for a same-day reopen, so the
//   full ceremony stays special instead of becoming daily wallpaper (see HeroPiocheCard).
export function BraiseChest({ size = 56, hyped, diving, quick }: BraiseChestProps) {
  const phase: Phase = diving ? (quick ? 'quick' : 'full') : hyped ? 'trigger' : 'idle';
  const isAction = phase === 'full' || phase === 'quick';
  // A clipPath id must be unique document-wide, or every instance of this component on the page
  // would resolve to whichever one happens to be first in the DOM.
  const clipId = `chestMouthClip-${useId()}`;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="100" height="46" />
          </clipPath>
        </defs>

        {/* Contact shadow — appears only while she's up, peaks while she's settled, fades with her. */}
        <motion.ellipse
          cx="50"
          cy="47.5"
          rx="15"
          ry="3.2"
          fill="#151821"
          initial={false}
          animate={
            phase === 'full'
              ? { opacity: [0, 0, 0.34, 0.34, 0] }
              : phase === 'quick'
                ? { opacity: [0, 0.3, 0] }
                : { opacity: 0 }
          }
          transition={
            phase === 'full'
              ? { duration: 0.9, times: [0, 0.33, 0.42, 0.86, 1] }
              : phase === 'quick'
                ? { duration: 0.42, delay: 0.08, times: [0, 0.55, 1] }
                : { duration: 0.15 }
          }
        />

        {/* Hit-flash at the lid gap. */}
        <motion.circle
          cx="50"
          cy="46"
          r="13"
          fill="#FFF8EE"
          initial={false}
          animate={
            phase === 'full'
              ? { opacity: [0, 1, 0], scale: [0.6, 1.8, 0.6] }
              : phase === 'quick'
                ? { opacity: [0, 1, 0], scale: [0.6, 1.5, 0.6] }
                : { opacity: 0 }
          }
          transition={
            phase === 'full'
              ? { duration: 0.16, delay: 0.2, times: [0, 0.4, 1], ease: 'easeOut' }
              : phase === 'quick'
                ? { duration: 0.1, delay: 0.04, times: [0, 0.4, 1], ease: 'easeOut' }
                : { duration: 0.1 }
          }
        />

        {/* Chest body — the only element that keeps a continuous idle loop (a restless jitter),
            plus the anticipation squash right at the start of the full sequence. Quick skips the
            squash entirely: no wind-up, straight to the pop. */}
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
          initial={false}
          animate={
            phase === 'idle'
              ? { rotate: [0, 0, -1.6, 0, 0], scaleX: 1, scaleY: 1 }
              : phase === 'full'
                ? { rotate: 0, scaleX: [1, 1.06, 0.96, 1.02, 1], scaleY: [1, 0.9, 1.06, 0.98, 1] }
                : { rotate: 0, scaleX: 1, scaleY: 1 }
          }
          transition={
            phase === 'idle'
              ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.48, 0.5, 0.52, 1] }
              : phase === 'full'
                ? { duration: 0.12, times: [0, 0.3, 0.6, 0.85, 1], ease: 'easeInOut' }
                : { duration: 0.08 }
          }
        >
          <rect x="14" y="46" width="72" height="38" rx="6" fill="#B9541E" stroke="#151821" strokeWidth="5" />
          <circle cx="26" cy="60" r="2.4" fill="#FFD84B" />
          <circle cx="74" cy="60" r="2.4" fill="#FFD84B" />
          <circle cx="26" cy="74" r="2.4" fill="#FFD84B" />
          <circle cx="74" cy="74" r="2.4" fill="#FFD84B" />

          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
            initial={false}
            animate={
              phase === 'trigger'
                ? { rotate: -16 }
                : phase === 'full'
                  ? { rotate: [-16, -100, -78, -88] }
                  : phase === 'quick'
                    ? { rotate: [-16, -90, -84] }
                    : { rotate: 0 }
            }
            transition={
              phase === 'trigger'
                ? { type: 'spring', stiffness: 500, damping: 22 }
                : phase === 'full'
                  ? { duration: 0.14, delay: 0.12, times: [0, 0.7, 0.85, 1], ease: [0.2, 0.8, 0.3, 1] }
                  : phase === 'quick'
                    ? { duration: 0.09, times: [0, 0.75, 1], ease: [0.2, 0.8, 0.3, 1] }
                    : { duration: 0.1 }
            }
          >
            <path d="M14 46 Q50 16 86 46 Z" fill="#D9691F" stroke="#151821" strokeWidth="5" />
          </motion.g>

          <rect x="44" y="43" width="12" height="15" rx="2" fill="#FFD84B" stroke="#151821" strokeWidth="3" />
          <motion.circle
            cx="46"
            cy="38"
            r="2"
            fill="#151821"
            initial={false}
            animate={{ opacity: phase === 'trigger' ? 1 : 0 }}
            transition={{ duration: isAction ? 0.06 : 0.15 }}
          />
          <motion.circle
            cx="54"
            cy="38"
            r="2"
            fill="#151821"
            initial={false}
            animate={{ opacity: phase === 'trigger' ? 1 : 0 }}
            transition={{ duration: isAction ? 0.06 : 0.15 }}
          />
        </motion.g>

        {/* Everything below the mouth line (y46) is invisible no matter what — the real "she stays
            hidden" mechanism, see the file header comment. */}
        <g clipPath={`url(#${clipId})`}>
          <motion.g
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
            initial={false}
            animate={
              phase === 'full'
                ? { opacity: [0, 1, 1, 1, 1], y: [16, 10, -26, -20, -21], x: [0, 1, -3, 1, 0], scale: [0.6, 0.4, 0.85, 0.76, 0.8] }
                : phase === 'quick'
                  ? { opacity: [0, 1, 1], y: [10, -16, -17], x: [0, -2, 0], scale: [0.55, 0.7, 0.72] }
                  : { opacity: 0, y: 16, x: 0, scale: 0.6 }
            }
            transition={
              phase === 'full'
                ? { duration: 0.34, delay: 0.3, times: [0, 0.15, 0.7, 0.85, 1], ease: [0.3, 1.15, 0.4, 1] }
                : phase === 'quick'
                  ? { duration: 0.16, delay: 0.08, times: [0, 0.75, 1], ease: [0.3, 1.1, 0.4, 1] }
                  : { duration: 0.1 }
            }
          >
            <path
              fill="#FF4500"
              d="M50 6 C 60 24, 72 30, 72 52 C 72 70, 62 82, 50 82 C 38 82, 28 70, 28 52 C 28 34, 40 30, 44 18 C 46 12, 48 8, 50 6 Z"
            />
            <path
              fill="#FF9A3D"
              d="M50 22 C 56 34, 64 38, 64 54 C 64 66, 58 74, 50 74 C 42 74, 36 66, 36 54 C 36 42, 44 38, 46 30 C 47 26, 49 24, 50 22 Z"
            />
            <motion.path
              d="M50 38 C 54 46, 58 48, 58 58 C 58 64, 54 68, 50 68 C 46 68, 42 64, 42 58 C 42 50, 48 48, 48 42 C 49 40, 49 39, 50 38 Z"
              initial={false}
              animate={
                phase === 'full'
                  ? { fill: ['#FFD84B', '#FFFCEF', '#FFD84B'] }
                  : phase === 'quick'
                    ? { fill: ['#FFD84B', '#FFFCEF', '#FFD84B'] }
                    : { fill: '#FFD84B' }
              }
              transition={
                phase === 'full'
                  ? { duration: 0.18, delay: 0.58, times: [0, 0.5, 1] }
                  : phase === 'quick'
                    ? { duration: 0.12, delay: 0.14, times: [0, 0.5, 1] }
                    : { duration: 0.1 }
              }
            />
            <circle cx="42" cy="54" r="3.2" fill="#16213A" />
            <circle cx="43" cy="53" r="1" fill="#fff" />
            <circle cx="58" cy="54" r="3.2" fill="#16213A" />
            <circle cx="59" cy="53" r="1" fill="#fff" />
            <path d="M44 62 Q 50 67, 56 62" stroke="#16213A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <circle cx="38" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />
            <circle cx="62" cy="60" r="2.4" fill="#FF6F59" opacity="0.45" />

            {/* The pickaxe — literal tool, pun on "pioche". Rises with her, same group/transform. */}
            <g transform="rotate(-18 70 45)">
              <rect x="68.5" y="26" width="3" height="34" rx="1.5" fill="#8B5A2B" stroke="#151821" strokeWidth="1.5" />
              <path
                d="M62 24 L70 18 L78 24 L74 28 L70 25 L66 28 Z"
                fill="#6B7280"
                stroke="#151821"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
