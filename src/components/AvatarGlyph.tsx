import { GLYPHS } from "./avatarGlyphs";

/**
 * Les Flambés — la famille d'avatars maison de BRAISE.
 *
 * Un avatar, ici, n'est plus un emoji ni un animal de zoo : c'est un petit esprit de flamme
 * avec une vibe d'ado. Chaque Flambé vit dans le même monde que Braise (le feu, la braise,
 * l'étincelle), mais il reste TOI — le visage que tu choisis pour te représenter — jamais la
 * mascotte elle-même. Braise guide ; ton Flambé, c'est toi.
 *
 * Grammaire partagée avec Braise :
 *   – contour noir épais (#151821), couleurs à plat, aucun dégradé ;
 *   – même flame de base, yeux placés au même endroit → ils forment une bande ;
 *   – lisibles à 26px (rail, en-tête) comme à 58px (hero du Profil).
 *
 * La vibe se lit par UN accessoire net, jamais un empilement :
 *   La Flème    — yeux endormis, vibe chill/flemme
 *   Le Crâne    — face de crâne, vibe dark/réaliste
 *   La Bûcheuse — lunettes, vibe sérieuse
 *   Le Casque   — casque audio, vibe gamer
 *   Le Masque   — masque/visière, vibe mystère
 *   L'Éclair    — éclair + bouche ouverte, vibe énergie
 *   La Fuse     — hublot de fusée, vibe ambition        (rang Or)
 *   La Glace    — lunettes de soleil, vibe cool          (rang Platine)
 *   Le Phénix   — ailes + or, vibe ultime                (rang Légende)
 *
 * L'ÉVOLUTION est portée par RankMark (une marque par rang, jamais empilée) — voir plus bas.
 * L'identifiant stocké reste state.user.avatar ; la valeur est un slug stable ('fleme', 'crane'…),
 * pas un emoji système. Les anciennes clés emoji tombent sur La Flème (défaut).
 */

const INK = "#151821";

type Props = {
  /** Identifiant de l'avatar — slug stable ('fleme', 'crane', …). */
  id: string;
  size?: number;
  /** Rang actuel : ajoute la marque d'évolution correspondante. */
  rankId?: string;
  className?: string;
};

/** La marque d'évolution du rang — une seule par palier, jamais empilée. */
function RankMark({ rankId }: { rankId?: string }) {
  if (rankId === "argent") {
    return (
      <g>
        <path
          d="M30 80 C 38 88, 62 88, 70 80 L74 90 C 62 97, 38 97, 26 90 Z"
          fill="#8ECFFF"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <path d="M44 88 L56 88" stroke="#3373D6" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (rankId === "or") {
    return (
      <g>
        <path d="M80 56 L80 66" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="80" cy="70" r="5.4" fill="#FFE08A" stroke={INK} strokeWidth="3" />
      </g>
    );
  }
  if (rankId === "platine") {
    return (
      <g>
        <path
          d="M14 30 L18 22 L22 30 L18 38 Z"
          fill="#B9F3EA"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M84 36 L88 28 L92 36 L88 44 Z"
          fill="#B9F3EA"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M76 12 L79 6 L82 12 L79 18 Z"
          fill="#7C3AED"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  if (rankId === "legende") {
    return (
      <g>
        <path
          d="M28 20 L34 2 L50 14 L66 2 L72 20 L68 25 L32 25 Z"
          fill="#FFD84B"
          stroke={INK}
          strokeWidth="3.6"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="2" r="2.6" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
        <circle cx="66" cy="2" r="2.6" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
        <circle cx="50" cy="14" r="2.8" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
      </g>
    );
  }
  return null;
}

export function AvatarGlyph({ id, size = 40, rankId, className = "" }: Props) {
  const glyph = GLYPHS[id] ?? GLYPHS["fleme"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4 108 108"
      fill="none"
      className={className}
      role="img"
      aria-label={glyph.name}
    >
      {glyph.body(glyph.color)}
      <RankMark rankId={rankId} />
    </svg>
  );
}
