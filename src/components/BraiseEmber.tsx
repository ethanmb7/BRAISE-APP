import { motion, MotionConfig } from 'framer-motion';

/**
 * Braise, redessinée depuis zéro pour la Pioche du Jour.
 *
 * Ce n'est plus la flamme générique à trois lobes (BraiseMascot) : c'est une *braise* — un
 * charbon ardent trapu, posé au sol, surmonté de deux flammèches asymétriques. La silhouette est
 * pensée pour le néobrutalisme de l'app : contour noir épais et constant, une plaque-visage
 * claire encastrée dans le corps (le même principe de "face bevel" que les boutons), des couleurs
 * à plat, aucune dégradé mou. Elle reste lisible à 28px comme à 120px, et sa silhouette est
 * reconnaissable même entièrement noire.
 *
 * Moods = états réels de la carte du jour, pas une collection décorative :
 *   idle   — au repos, elle attend
 *   eager  — le doigt est sur le bouton : sourcils levés, bouche ouverte, elle se penche
 *   proud  — la carte est tirée : yeux en ^^, grand sourire
 *   sleepy — rien à faire aujourd'hui
 */
export type EmberMood = 'idle' | 'eager' | 'proud' | 'sleepy';

type Props = {
  size?: number;
  mood?: EmberMood;
  className?: string;
  /** Bras droit levé, paume ouverte : elle tient/présente quelque chose. */
  presenting?: boolean;
};

const INK = '#151821';

export function BraiseEmber({ size = 72, mood = 'idle', className = '', presenting }: Props) {
  const armUp = presenting || mood === 'proud';
  return (
    <MotionConfig reducedMotion="user">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        aria-label="Braise"
        role="img"
      >
        {/* Ombre dure au sol — ancre le personnage, même règle que les cartes de l'app. */}
        <ellipse cx="54" cy="94" rx="27" ry="5" fill={INK} opacity="0.18" />

        {/* Bras gauche */}
        <path
          d="M23 63 C 15 66, 12 72, 15 77"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bras droit — levé quand elle présente la carte */}
        <motion.path
          d={armUp ? 'M79 60 C 88 55, 92 47, 90 40' : 'M79 63 C 87 66, 90 72, 87 77'}
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          initial={false}
          animate={{ opacity: 1 }}
        />

        {/* Corps : charbon trapu + deux flammèches asymétriques */}
        <path
          d="M16 62 C 12 42, 28 35, 32 21 C 34 13, 42 14, 44 22 C 45.5 28, 43 32, 47 33
             C 52 22, 58 15, 62 7 C 64.5 2, 71 4, 71 11 C 71 22, 66 28, 71 33
             C 80 39, 87 48, 87 63 C 87 81, 71 92, 51.5 92 C 32 92, 18 80, 16 62 Z"
          fill="#FF4500"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Lisière chaude, à plat (pas de dégradé) */}
        <path
          d="M28 66 C 28 52, 39 44, 52 44 C 68 44, 79 53, 79 67 C 79 80, 67 87, 52 87 C 37 87, 28 79, 28 66 Z"
          fill="#FFB020"
        />
        {/* Plaque-visage encastrée */}
        <path
          d="M32 66 C 32 55, 41.5 48, 52.5 48 C 65 48, 75 55.5, 75 67 C 75 78, 64.5 84, 52.5 84 C 40 84, 32 77, 32 66 Z"
          fill="#FFF0D2"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Yeux */}
        {mood === 'proud' ? (
          <>
            <path d="M39 65 L44.5 60 L50 65" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M57 65 L62.5 60 L68 65" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : mood === 'sleepy' ? (
          <>
            <path d="M39 63 Q 44.5 68, 50 63" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M57 63 Q 62.5 68, 68 63" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <ellipse cx="44.5" cy="63" rx="4.6" ry={mood === 'eager' ? 5.6 : 4.8} fill={INK} />
            <ellipse cx="62.5" cy="63" rx="4.6" ry={mood === 'eager' ? 5.6 : 4.8} fill={INK} />
            <circle cx="46.2" cy="61" r="1.6" fill="#fff" />
            <circle cx="64.2" cy="61" r="1.6" fill="#fff" />
          </>
        )}

        {/* Sourcils — c'est eux qui portent l'expression, pas le corps */}
        {mood === 'eager' && (
          <>
            <path d="M39 54 L50 52" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M68 54 L57 52" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
          </>
        )}

        {/* Bouche */}
        {mood === 'eager' ? (
          <path d="M47 73 C 50 80, 58 80, 61 73 C 57 71, 51 71, 47 73 Z" fill={INK} />
        ) : mood === 'proud' ? (
          <path d="M43 72 C 48 81, 60 81, 65 72 C 58 70, 50 70, 43 72 Z" fill={INK} />
        ) : mood === 'sleepy' ? (
          <path d="M50 75 Q 54 77, 58 75" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M45 72 Q 53.5 79, 62 72" stroke={INK} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        )}

        {/* Joues */}
        <circle cx="37.5" cy="72" r="3.2" fill="#FF6F59" opacity="0.6" />
        <circle cx="69" cy="72" r="3.2" fill="#FF6F59" opacity="0.6" />

        {/* Pieds — deux galets de braise, elle est posée, pas flottante */}
        <rect x="34" y="86" width="15" height="9" rx="4.5" fill="#D93B00" stroke={INK} strokeWidth="3.5" />
        <rect x="55" y="86" width="15" height="9" rx="4.5" fill="#D93B00" stroke={INK} strokeWidth="3.5" />
      </svg>
    </MotionConfig>
  );
}
