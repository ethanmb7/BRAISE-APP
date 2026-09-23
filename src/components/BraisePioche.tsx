import { motion, MotionConfig } from 'framer-motion';
import { BraiseEmber } from '@/components/BraiseEmber';

interface BraisePiocheProps {
  size?: number;
  /** Le doigt est sur le CTA : le paquet s'ouvre, Braise se penche. Invitation, pas récompense. */
  hyped?: boolean;
  /** Le tirage est lancé — la séquence signature, à sens unique. */
  diving?: boolean;
  /** Réouverture du jour : la même chorégraphie jouée en ~420ms au lieu de ~900ms. */
  quick?: boolean;
}

// La scène de la Pioche du Jour, rebâtie autour de la nouvelle Braise (BraiseEmber).
//
// L'image mentale : Braise est assise DERRIÈRE un petit paquet de cartes posé au sol. Au repos,
// seule sa tête dépasse — elle garde le paquet. Quand tu appuies, elle se baisse, pioche, puis
// se redresse en brandissant la carte tirée, bras levé, face visible.
//
// Déroulé (900ms plein ; QUICK comprime les mêmes temps à 420ms, jamais une animation différente) :
//   0–90ms    l'appui est reconnu : le paquet s'écrase
//   60–260ms  anticipation : Braise plonge derrière le paquet (descendre avant de monter)
//   260–640ms la carte jaillit et se retourne face visible
//   300–720ms Braise se redresse, bras levé, elle présente la carte
//   340–660ms étincelles — lumière seule, la fente ne change jamais de taille
//   640–900ms la carte fonce vers toi et passe le relais à PiocheRevealVeil
//
// Règles tenues : rien ici ne déplace le cadre de la carte ni l'ordre de lecture ; au repos, une
// seule respiration lente de 2,8s ; chaque mouvement est un accusé de réception, une anticipation
// ou une récompense — jamais de décoration.
export function BraisePioche({ size = 64, hyped, diving, quick }: BraisePiocheProps) {
  const t = quick ? 0.46 : 1;
  const s = (v: number) => size * v;
  const lean = { type: 'spring' as const, stiffness: 520, damping: 22, mass: 0.7 };

  // Paquet au repos, écarté seulement au survol/appui. L'index 1 est la carte piochée.
  const fan = [
    { rot: -14, x: -0.19, dip: -0.02 },
    { rot: 0, x: 0, dip: 0 },
    { rot: 14, x: 0.19, dip: -0.02 },
  ];

  const cardBox = {
    width: s(0.38),
    height: s(0.52),
    marginLeft: -s(0.19),
    transformOrigin: '50% 94%',
  } as const;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative select-none"
        style={{ width: size, height: size, perspective: size * 6 }}
        aria-hidden="true"
      >
        {/* Lueur de braise au sol : lumière uniquement, jamais une forme qui bouge. */}
        <motion.span
          className="absolute left-1/2 rounded-full bg-[#FFB020]/60 blur-[6px]"
          style={{ width: s(0.7), height: s(0.22), marginLeft: -s(0.35), bottom: -s(0.02) }}
          animate={diving || hyped ? { opacity: [0.5, 0.95, 0.6] } : { opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: diving || hyped ? 0.7 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Braise, derrière le paquet : au repos seules sa tête et ses flammèches dépassent. */}
        <motion.div
          className="absolute left-1/2 z-0"
          style={{ width: s(0.86), marginLeft: -s(0.43), bottom: s(0.46) }}
          animate={
            diving
              ? {
                  // plongeon (anticipation) → elle se redresse au-dessus du paquet → se pose, fière
                  y: [0, s(0.12), -s(0.3), -s(0.22)],
                  rotate: [0, 3, -6, 0],
                  scale: [1, 0.93, 1.12, 1.05],
                }
              : hyped
                ? { y: -s(0.1), rotate: -3, scale: 1.05 }
                : { y: [0, -s(0.03), 0], rotate: 0, scale: 1 }
          }
          transition={
            diving
              ? { duration: 0.72 * t, times: [0, 0.28, 0.7, 1], ease: [0.16, 1, 0.3, 1] }
              : hyped
                ? lean
                : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <BraiseEmber
            size={s(0.86)}
            mood={diving ? 'proud' : hyped ? 'eager' : 'idle'}
            presenting={diving}
          />
        </motion.div>

        {/* Le paquet. Écrasement à l'appui, resserrement pendant l'anticipation, recul au tirage. */}
        {fan.map((c, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-1/2 z-10 overflow-hidden rounded-[6px] border-[2.5px] border-[#151821] bg-[#FFF8EE] shadow-[2px_2px_0px_0px_#151821]"
            style={cardBox}
            animate={
              diving
                ? {
                    rotate: [c.rot, c.rot * 0.55, c.rot * 1.5, c.rot * 1.3],
                    x: [s(c.x), s(c.x * 0.5), s(c.x * 1.7), s(c.x * 1.5)],
                    y: [0, s(0.07), s(0.03), s(0.05)],
                    scaleY: [1, 0.88, 1.02, 1],
                    opacity: i === 1 ? [1, 1, 0.9, 0.85] : 1,
                  }
                : {
                    rotate: hyped ? c.rot * 1.3 : c.rot,
                    x: hyped ? s(c.x * 1.35) : s(c.x),
                    y: hyped ? s(c.dip) : 0,
                    scaleY: 1,
                    opacity: 1,
                  }
            }
            transition={
              diving
                ? { duration: 0.62 * t, times: [0, 0.16, 0.62, 1], ease: [0.16, 1, 0.3, 1], delay: 0.02 * i * t }
                : { ...lean, delay: 0.025 * i }
            }
          >
            <span className="absolute inset-x-[3px] top-[3px] block rounded-[2px] bg-[#FFD84B]" style={{ height: s(0.07) }} />
            <span className="absolute inset-x-[4px] bottom-[5px] block rounded-[2px] bg-[#151821]/12" style={{ height: s(0.05) }} />
            <span className="absolute inset-x-[4px] bottom-[11px] block rounded-[2px] bg-[#151821]/12" style={{ height: s(0.04) }} />
          </motion.div>
        ))}

        {/* La carte tirée : elle jaillit, se retourne face visible, puis fonce vers toi. */}
        <motion.div
          className="absolute bottom-0 left-1/2 z-20"
          style={{ ...cardBox, transformStyle: 'preserve-3d' }}
          initial={false}
          animate={
            diving
              ? {
                  opacity: [0, 1, 1, 1, 0],
                  y: [0, s(0.05), -s(0.5), -s(0.62), -s(0.72)],
                  rotate: [0, 2, 12, 7, 9],
                  rotateY: [0, 0, 180, 180, 180],
                  scale: [0.94, 0.94, 1.12, 1.05, 1.3],
                }
              : { opacity: 0, y: 0, rotate: 0, rotateY: 0, scale: 0.94 }
          }
          transition={
            diving
              ? { duration: 0.74 * t, delay: 0.1 * t, times: [0, 0.17, 0.58, 0.76, 1], ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.1 }
          }
        >
          {/* dos */}
          <span
            className="absolute inset-0 rounded-[6px] border-[2.5px] border-[#151821] bg-[#FFF8EE] shadow-[2px_2px_0px_0px_#151821]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="absolute inset-x-[3px] top-[3px] block rounded-[2px] bg-[#FFD84B]" style={{ height: s(0.07) }} />
          </span>
          {/* face — la mission, révélée : la silhouette de Braise elle-même */}
          <span
            className="absolute inset-0 flex items-center justify-center rounded-[6px] border-[2.5px] border-[#151821] bg-[#FF4500] shadow-[2px_2px_0px_0px_#151821]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <svg viewBox="0 0 100 100" width={s(0.26)} height={s(0.26)} fill="none">
              <path
                d="M16 62 C 12 42, 28 35, 32 21 C 34 13, 42 14, 44 22 C 45.5 28, 43 32, 47 33
                   C 52 22, 58 15, 62 7 C 64.5 2, 71 4, 71 11 C 71 22, 66 28, 71 33
                   C 80 39, 87 48, 87 63 C 87 81, 71 92, 51.5 92 C 32 92, 18 80, 16 62 Z"
                fill="#FFD84B"
              />
              <path
                d="M32 66 C 32 55, 41.5 48, 52.5 48 C 65 48, 75 55.5, 75 67 C 75 78, 64.5 84, 52.5 84 C 40 84, 32 77, 32 66 Z"
                fill="#FFF8EE"
              />
            </svg>
          </span>
        </motion.div>

        {/* Étincelles : lumière seule, déclenchées quand la carte quitte le paquet. */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={`spark-${i}`}
            className="absolute left-1/2 z-10 block rounded-full bg-[#FFD84B]"
            style={{
              width: s(0.075),
              height: s(0.075),
              marginLeft: -s(0.0375),
              bottom: s(0.48),
            }}
            initial={false}
            animate={
              diving
                ? {
                    opacity: [0, 1, 0],
                    x: [0, (i - 2) * s(0.19), (i - 2) * s(0.3)],
                    y: [0, -s(0.14 + (i % 2) * 0.12), -s(0.2 + (i % 2) * 0.18)],
                    scale: [0.3, 1, 0.2],
                  }
                : { opacity: 0, x: 0, y: 0, scale: 0.3 }
            }
            transition={
              diving
                ? { duration: 0.46 * t, delay: (0.3 + i * 0.015) * t, ease: 'easeOut' }
                : { duration: 0.1 }
            }
          />
        ))}
      </div>
    </MotionConfig>
  );
}
