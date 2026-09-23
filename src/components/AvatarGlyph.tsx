/**
 * Les Éclats — la famille d'avatars maison de BRAISE.
 *
 * Avant : neuf emojis système (🦊 🐼 🦉 …). Un emoji ne se dessine pas, ne se décline pas, et ne
 * ressemble à rien de l'app : il change de tête selon le téléphone. Ici, chaque avatar est un
 * personnage dessiné depuis zéro, dans la même grammaire que Braise :
 *   – même contour noir épais (#151821), mêmes coins ronds, couleurs à plat, aucun dégradé ;
 *   – mêmes yeux, même placement, même sourire d'une tête à l'autre → ils forment une bande,
 *     pas neuf dessins sans rapport ;
 *   – lisibles à 26px (rail, en-tête) comme à 88px (hero du Profil).
 *
 * L'ÉVOLUTION est portée par le personnage lui-même, pas par un cadre décoratif : à chaque rang
 * franchi, l'avatar gagne UNE marque et une seule (jamais un empilement illisible à 26px) —
 *   bronze   : rien, la tête nue, c'est le point de départ
 *   argent   : une écharpe chrome
 *   or       : une boucle d'oreille dorée
 *   platine  : trois éclats facettés autour de la tête
 *   légende  : une couronne de braise
 * Chaque marque s'ajoute, la tête en dessous ne change jamais : on reste soi, on monte en grade.
 *
 * L'identifiant stocké reste la chaîne emoji d'origine (state.user.avatar) : les profils déjà
 * enregistrés en localStorage continuent de pointer sur le bon personnage, aucune migration.
 */

const INK = '#151821';

type Props = {
  /** Identifiant de l'avatar — la chaîne emoji historique, conservée comme clé stable. */
  id: string;
  size?: number;
  /** Rang actuel : ajoute la marque d'évolution correspondante. */
  rankId?: string;
  className?: string;
};

type Glyph = { name: string; body: (c: string) => React.ReactNode; color: string };

const eyes = (
  <>
    <ellipse cx="41" cy="55" rx="4.4" ry="4.8" fill={INK} />
    <ellipse cx="59" cy="55" rx="4.4" ry="4.8" fill={INK} />
    <circle cx="42.6" cy="53.2" r="1.5" fill="#fff" />
    <circle cx="60.6" cy="53.2" r="1.5" fill="#fff" />
  </>
);

const smile = <path d="M44 66 Q 50 71.5, 56 66" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />;

const cheeks = (
  <>
    <circle cx="33" cy="64" r="3" fill="#FF6F59" opacity="0.5" />
    <circle cx="67" cy="64" r="3" fill="#FF6F59" opacity="0.5" />
  </>
);

const round = (c: string) => (
  <path
    d="M20 52 C 20 32, 33 22, 50 22 C 67 22, 80 32, 80 52 C 80 72, 67 84, 50 84 C 33 84, 20 72, 20 52 Z"
    fill={c}
    stroke={INK}
    strokeWidth="4.5"
    strokeLinejoin="round"
  />
);

const GLYPHS: Record<string, Glyph> = {
  // Renard — oreilles triangulaires hautes, museau clair.
  '🦊': {
    name: 'Renard',
    color: '#FF7A2F',
    body: (c) => (
      <>
        <path d="M24 34 L20 12 L40 24 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M76 34 L80 12 L60 24 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        {round(c)}
        <path d="M37 66 C 37 60, 43 57, 50 57 C 57 57, 63 60, 63 66 C 63 74, 57 79, 50 79 C 43 79, 37 74, 37 66 Z" fill="#FFF0D2" stroke={INK} strokeWidth="3" />
        {eyes}
        <ellipse cx="50" cy="65" rx="3.2" ry="2.4" fill={INK} />
        <path d="M44 71 Q 50 76, 56 71" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        {cheeks}
      </>
    ),
  },
  // Panda — oreilles rondes sombres, taches autour des yeux.
  '🐼': {
    name: 'Panda',
    color: '#FFF6E8',
    body: (c) => (
      <>
        <circle cx="27" cy="27" r="11" fill={INK} />
        <circle cx="73" cy="27" r="11" fill={INK} />
        {round(c)}
        <ellipse cx="41" cy="55" rx="9" ry="10" fill={INK} transform="rotate(-14 41 55)" />
        <ellipse cx="59" cy="55" rx="9" ry="10" fill={INK} transform="rotate(14 59 55)" />
        <circle cx="41" cy="55" r="3.6" fill="#fff" />
        <circle cx="59" cy="55" r="3.6" fill="#fff" />
        <ellipse cx="50" cy="66" rx="3.6" ry="2.8" fill={INK} />
        <path d="M44 72 Q 50 76.5, 56 72" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  // Hibou — deux aigrettes, grands disques oculaires, bec triangulaire.
  '🦉': {
    name: 'Hibou',
    color: '#7C5CFF',
    body: (c) => (
      <>
        <path d="M28 26 L26 10 L42 20 Z" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M72 26 L74 10 L58 20 Z" fill={c} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        {round(c)}
        <circle cx="40" cy="54" r="12" fill="#FFF0D2" stroke={INK} strokeWidth="3" />
        <circle cx="60" cy="54" r="12" fill="#FFF0D2" stroke={INK} strokeWidth="3" />
        <circle cx="40" cy="54" r="4.6" fill={INK} />
        <circle cx="60" cy="54" r="4.6" fill={INK} />
        <circle cx="41.8" cy="52.2" r="1.5" fill="#fff" />
        <circle cx="61.8" cy="52.2" r="1.5" fill="#fff" />
        <path d="M50 64 L55 70 L45 70 Z" fill="#FFD84B" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      </>
    ),
  },
  // Chat — oreilles pointues, moustaches.
  '🐱': {
    name: 'Chat',
    color: '#3FBF87',
    body: (c) => (
      <>
        <path d="M26 32 L24 13 L42 25 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M74 32 L76 13 L58 25 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        {round(c)}
        {eyes}
        <path d="M46 64 L54 64 L50 68 Z" fill={INK} />
        <path d="M50 68 Q 45 73, 41 69 M50 68 Q 55 73, 59 69" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M18 58 L30 60 M18 66 L30 65 M82 58 L70 60 M82 66 L70 65" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  // Fusée — capsule, hublot, ailerons.
  '🚀': {
    name: 'Fusée',
    color: '#3373D6',
    body: (c) => (
      <>
        <path d="M26 66 L18 82 L34 78 Z" fill="#FF4500" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M74 66 L82 82 L66 78 Z" fill="#FF4500" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M50 10 C 66 26, 72 44, 72 62 C 72 76, 62 84, 50 84 C 38 84, 28 76, 28 62 C 28 44, 34 26, 50 10 Z" fill={c} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        <circle cx="50" cy="48" r="14" fill="#FFF0D2" stroke={INK} strokeWidth="3.5" />
        <circle cx="45" cy="45" r="4" fill="#8ECFFF" />
        <path d="M38 70 H 62" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      </>
    ),
  },
  // Étoile — cinq branches franches, visage centré.
  '⭐': {
    name: 'Étoile',
    color: '#FFC400',
    body: (c) => (
      <>
        <path
          d="M50 8 L62 38 L94 40 L69 60 L78 90 L50 73 L22 90 L31 60 L6 40 L38 38 Z"
          fill={c}
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <ellipse cx="42" cy="52" rx="4" ry="4.4" fill={INK} />
        <ellipse cx="58" cy="52" rx="4" ry="4.4" fill={INK} />
        <circle cx="43.4" cy="50.4" r="1.3" fill="#fff" />
        <circle cx="59.4" cy="50.4" r="1.3" fill="#fff" />
        <path d="M44 62 Q 50 67.5, 56 62" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  // Dragon — cornes recourbées, museau, narine.
  '🐉': {
    name: 'Dragon',
    color: '#21B59A',
    body: (c) => (
      <>
        <path d="M30 26 C 22 18, 20 10, 26 6 C 30 12, 36 16, 38 22 Z" fill="#FFD84B" stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M70 26 C 78 18, 80 10, 74 6 C 70 12, 64 16, 62 22 Z" fill="#FFD84B" stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
        {round(c)}
        <path d="M22 44 L14 40 M78 44 L86 40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {eyes}
        <path d="M36 66 C 36 60, 43 57, 50 57 C 57 57, 64 60, 64 66 C 64 74, 57 79, 50 79 C 43 79, 36 74, 36 66 Z" fill="#FFF0D2" stroke={INK} strokeWidth="3" />
        <circle cx="45" cy="65" r="1.9" fill={INK} />
        <circle cx="55" cy="65" r="1.9" fill={INK} />
        <path d="M43 72 Q 50 77, 57 72" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  // Lion — crinière en dents franches autour de la tête.
  '🦁': {
    name: 'Lion',
    color: '#F2A93B',
    body: (c) => (
      <>
        <path
          d="M50 6 L59 15 L71 11 L74 24 L86 29 L80 41 L88 51 L78 59 L81 72 L68 73 L62 85 L50 79 L38 85 L32 73 L19 72 L22 59 L12 51 L20 41 L14 29 L26 24 L29 11 L41 15 Z"
          fill="#C96A14"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="24" fill={c} stroke={INK} strokeWidth="4" />
        <ellipse cx="42" cy="47" rx="3.8" ry="4.2" fill={INK} />
        <ellipse cx="58" cy="47" rx="3.8" ry="4.2" fill={INK} />
        <path d="M46 57 L54 57 L50 61 Z" fill={INK} />
        <path d="M50 61 Q 45 66, 41 62 M50 61 Q 55 66, 59 62" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  // Licorne — corne torsadée, mèche de crinière.
  '🦄': {
    name: 'Licorne',
    color: '#FF7BAC',
    body: (c) => (
      <>
        <path d="M50 4 L58 26 L42 26 Z" fill="#FFD84B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M46 12 L54 14 M44 19 L56 21" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M24 32 C 16 26, 14 16, 22 12 C 24 22, 32 24, 34 30 Z" fill="#7C5CFF" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />
        {round(c)}
        {eyes}
        <ellipse cx="50" cy="66" rx="10" ry="7" fill="#FFF0D2" stroke={INK} strokeWidth="3" />
        <circle cx="46" cy="65" r="1.7" fill={INK} />
        <circle cx="54" cy="65" r="1.7" fill={INK} />
        {cheeks}
      </>
    ),
  },
};

/** La marque d'évolution du rang — une seule par palier, jamais empilée. */
function RankMark({ rankId }: { rankId?: string }) {
  if (rankId === 'argent') {
    return (
      <g>
        <path d="M30 80 C 38 88, 62 88, 70 80 L74 90 C 62 97, 38 97, 26 90 Z" fill="#8ECFFF" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M44 88 L56 88" stroke="#3373D6" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (rankId === 'or') {
    return (
      <g>
        <path d="M80 56 L80 66" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="80" cy="70" r="5.4" fill="#FFE08A" stroke={INK} strokeWidth="3" />
      </g>
    );
  }
  if (rankId === 'platine') {
    return (
      <g>
        <path d="M14 30 L18 22 L22 30 L18 38 Z" fill="#B9F3EA" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M84 36 L88 28 L92 36 L88 44 Z" fill="#B9F3EA" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M76 12 L79 6 L82 12 L79 18 Z" fill="#7C3AED" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    );
  }
  if (rankId === 'legende') {
    return (
      <g>
        <path d="M28 20 L34 2 L50 14 L66 2 L72 20 L68 25 L32 25 Z" fill="#FFD84B" stroke={INK} strokeWidth="3.6" strokeLinejoin="round" />
        <circle cx="34" cy="2" r="2.6" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
        <circle cx="66" cy="2" r="2.6" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
        <circle cx="50" cy="14" r="2.8" fill="#FF4500" stroke={INK} strokeWidth="1.6" />
      </g>
    );
  }
  return null;
}

export function getAvatarName(id: string) {
  return GLYPHS[id]?.name ?? 'Avatar';
}

export function AvatarGlyph({ id, size = 40, rankId, className = '' }: Props) {
  const glyph = GLYPHS[id] ?? GLYPHS['🦊'];
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
