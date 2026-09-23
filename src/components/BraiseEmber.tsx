import { useApp } from '@/store';
import { getRankInfo } from '@/lib/aura';
import { BraiseCharacter } from './BraiseCharacter';

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
  rankId?: string;
};

export function BraiseEmber({ size = 72, mood = 'idle', className = '', presenting, rankId }: Props) {
  const { state } = useApp();
  const currentRankId = rankId ?? getRankInfo(state.xp).current.id;
  return (
    <BraiseCharacter
      size={size}
      rankId={currentRankId}
      expression={mood === 'idle' ? 'happy' : mood}
      presenting={presenting}
      className={className}
    />
  );
}
