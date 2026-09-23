export type BraiseRankId = 'bronze' | 'argent' | 'or' | 'platine' | 'legende';
export type BraiseExpression = 'happy' | 'hesitant' | 'proud' | 'sleepy' | 'cool' | 'frozen' | 'eager';

type Props = {
  size?: number;
  rankId?: string;
  expression?: BraiseExpression;
  className?: string;
  presenting?: boolean;
  labelled?: boolean;
};

const INK = '#151821';
const FACE = '#FFF2D8';

export const BRAISE_RANK_COLORS: Record<BraiseRankId, [string, string, string]> = {
  bronze: ['#F04418', '#FF7A1A', '#FFD84B'],
  argent: ['#1859A9', '#3B91E8', '#BDEBFF'],
  or: ['#A63D11', '#F08A16', '#FFE06B'],
  platine: ['#482080', '#7655D8', '#52E2DD'],
  legende: ['#861C42', '#F04418', '#FFD84B'],
};

// The two asymmetric tips are Braise's fixed signature. Width, stance and edge language mature.
export const BRAISE_BODY_PATHS: Record<BraiseRankId, string> = {
  bronze: 'M25 79 C20 65 25 53 36 44 C33 35 37 29 43 34 L49 40 C50 28 58 16 66 9 C71 5 74 10 71 17 C68 27 71 34 79 43 C88 53 91 67 86 81 C81 96 69 103 53 103 C38 103 29 95 25 79 Z',
  argent: 'M24 81 C19 64 26 51 36 41 L35 27 L47 36 C49 24 56 11 64 5 C69 1 74 5 71 14 C69 25 72 33 80 41 C90 52 92 67 87 82 C82 98 68 106 52 106 C36 106 27 96 24 81 Z',
  or: 'M17 82 C14 64 24 49 36 41 L31 27 L45 35 C47 22 56 10 65 5 C71 2 76 7 72 16 C70 25 75 33 84 42 C95 53 98 68 92 84 C86 101 70 108 52 108 C33 108 20 99 17 82 Z',
  platine: 'M15 84 L20 60 L34 44 L31 27 L45 35 L51 15 L59 31 L74 9 L70 38 L87 48 L95 70 L89 89 L70 108 L43 109 L23 98 Z',
  legende: 'M10 87 C8 66 20 49 34 40 L30 22 L44 32 L51 7 L59 29 L75 14 L70 39 C90 45 101 64 97 86 C93 106 74 114 52 113 C29 113 13 105 10 87 Z',
};

const CORE_PATHS: Record<BraiseRankId, string> = {
  bronze: 'M53 76 L58 82 L53 90 L48 82 Z',
  argent: 'M53 72 L60 81 L53 92 L46 81 Z',
  or: 'M53 69 L62 80 L53 94 L44 80 Z',
  platine: 'M53 66 L63 79 L58 94 L48 94 L43 79 Z',
  legende: 'M53 64 L65 78 L60 96 L46 96 L41 78 Z',
};

function RankLanguage({ rankId, inner }: { rankId: BraiseRankId; inner: string }) {
  if (rankId === 'argent') {
    return <path className="braise-outfit" d="M31 48 Q53 40 77 48 L73 57 Q53 50 34 58 Z" fill={inner} stroke={INK} strokeWidth="3" strokeLinejoin="round" />;
  }
  if (rankId === 'or') {
    return (
      <g className="braise-outfit">
        <path d="M23 65 L38 55 L52 64 L68 54 L87 66 L83 81 L68 72 L62 96 L43 96 L37 72 L22 81 Z" fill="#7B2911" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M38 55 L52 64 L68 54 L62 70 L52 75 L39 69 Z" fill={inner} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    );
  }
  if (rankId === 'platine') {
    return (
      <g className="braise-outfit">
        <path d="M21 59 L36 47 L51 57 L68 44 L88 60 L79 74 L66 65 L61 96 L42 98 L35 66 L25 76 Z" fill="#32175E" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M36 47 L51 57 L68 44 L62 67 L52 73 L39 66 Z" fill={inner} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      </g>
    );
  }
  if (rankId === 'legende') {
    return (
      <g className="braise-outfit">
        <path d="M13 60 C3 73 5 98 17 108 L34 94 L26 62 Z M92 59 C104 72 103 98 91 108 L73 93 L82 61 Z" fill="#68152F" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M23 64 L38 50 L53 61 L70 49 L89 64 L82 99 L68 90 L53 105 L37 91 L20 100 Z" fill="#861C42" stroke={INK} strokeWidth="3.8" strokeLinejoin="round" />
        <path d="M37 50 L53 61 L70 49 L64 70 L53 77 L40 69 Z" fill={inner} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M37 31 Q53 13 70 31" stroke={inner} strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  return null;
}

function Face({ expression, mature }: { expression: BraiseExpression; mature: boolean }) {
  if (expression === 'cool') {
    return (
      <g className="braise-sunglasses">
        <path d="M34 56 H50 V64 H37 Q34 62 34 56 Z M57 56 H73 Q73 62 70 64 H57 Z" fill={INK} />
        <path d="M50 58 H57 M34 57 L29 54 M73 57 L78 54" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M45 72 Q54 77 63 71" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  const closed = expression === 'sleepy' || expression === 'proud';
  const eyeY = mature ? 59 : 60;
  return (
    <g>
      {mature && !closed && expression !== 'eager' && (
        <path d="M36 53 L49 55 M58 55 L71 52" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      )}
      <g className="braise-eyes">
        {closed ? (
          <>
            <path d={expression === 'proud' ? 'M36 62 L43 57 L50 62' : 'M36 59 Q43 64 50 59'} stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={expression === 'proud' ? 'M57 62 L64 57 L71 62' : 'M57 59 Q64 64 71 59'} stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : (
          <>
            <ellipse cx="43" cy={eyeY} rx={mature ? 3.6 : 4.2} ry={expression === 'eager' ? 5.5 : mature ? 3.9 : 4.7} fill={INK} />
            <ellipse cx="64" cy={eyeY} rx={mature ? 3.6 : 4.2} ry={expression === 'eager' ? 5.5 : mature ? 3.9 : 4.7} fill={INK} />
            <circle cx="44.2" cy={eyeY - 1.2} r="1.2" fill="#FFFFFF" />
            <circle cx="65.2" cy={eyeY - 1.2} r="1.2" fill="#FFFFFF" />
          </>
        )}
      </g>
      {expression === 'hesitant' ? <path d="M45 73 Q53 69 61 74" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" /> :
        expression === 'eager' ? <ellipse cx="54" cy="73" rx="5.5" ry="4.5" fill={INK} /> :
        expression === 'sleepy' ? <path d="M49 73 Q54 76 59 73" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" /> :
        mature ? <path d="M45 71 Q54 76 63 70" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" /> :
        <path d="M44 71 Q53 80 63 71" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />}
    </g>
  );
}

export function BraiseCharacter({ size = 80, rankId = 'bronze', expression = 'happy', className = '', presenting = false, labelled = true }: Props) {
  const rank = (rankId in BRAISE_RANK_COLORS ? rankId : 'bronze') as BraiseRankId;
  const [outer, middle, inner] = BRAISE_RANK_COLORS[rank];
  const rankIndex = ['bronze', 'argent', 'or', 'platine', 'legende'].indexOf(rank);
  const mature = rankIndex >= 2;
  const armUp = presenting || expression === 'proud';
  const armWidth = 5 + rankIndex * 0.35;
  const leftArm = rank === 'bronze' && !armUp ? 'M29 69 C18 67 14 60 17 53' : armUp ? 'M28 68 C18 64 13 55 16 46' : 'M27 69 C16 72 12 80 16 87';
  const rightArm = armUp ? 'M79 67 C91 61 96 50 93 39' : mature ? 'M80 69 C91 71 96 79 92 88' : 'M79 70 C90 72 94 80 91 87';
  const footLeft = rankIndex < 2 ? 33 : 27;
  const footRight = rankIndex < 2 ? 58 : 64;

  return (
    <svg width={size} height={size} viewBox="0 0 108 116" fill="none" className={`braise-mascot braise-form-${rank} mood-${expression === 'cool' ? 'proud' : expression} ${expression === 'frozen' ? 'mood-frozen-tint mood-frozen' : ''} ${className}`} role={labelled ? 'img' : undefined} aria-label={labelled ? `Braise, évolution ${rank}` : undefined} aria-hidden={labelled ? undefined : true}>
      <ellipse cx="54" cy="109" rx={27 + rankIndex * 2} ry="5" fill={INK} opacity="0.18" />
      <path d={leftArm} stroke={INK} strokeWidth={armWidth} strokeLinecap="round" />
      <path d={rightArm} stroke={INK} strokeWidth={armWidth} strokeLinecap="round" />
      <circle cx={armUp ? 93 : rank === 'bronze' ? 17 : 16} cy={armUp ? 39 : rank === 'bronze' ? 53 : 87} r="4" fill={middle} stroke={INK} strokeWidth="2.4" />
      <circle cx={armUp ? 16 : 92} cy={armUp ? 46 : 88} r="4" fill={middle} stroke={INK} strokeWidth="2.4" />

      <path className="flame-outer" d={BRAISE_BODY_PATHS[rank]} fill={outer} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      <path className="flame-middle" d={mature ? 'M26 82 C25 59 39 43 53 42 C71 41 86 58 83 82 C81 98 68 105 53 105 C37 105 28 98 26 82 Z' : 'M30 80 C29 61 40 47 53 46 C69 46 80 60 79 80 C78 94 67 101 53 101 C39 101 31 94 30 80 Z'} fill={middle} />
      <RankLanguage rankId={rank} inner={inner} />

      <path d={mature ? 'M30 67 C30 52 40 45 53 45 C68 45 78 53 78 68 C78 82 67 89 53 89 C39 89 30 81 30 67 Z' : 'M31 67 C31 53 41 46 53 46 C67 46 77 54 77 68 C77 82 67 89 53 89 C40 89 31 81 31 67 Z'} fill={FACE} stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
      <Face expression={expression} mature={mature} />
      {rank === 'bronze' && <path d="M34 69 l4 -1" stroke="#FF6F59" strokeWidth="3" strokeLinecap="round" opacity="0.65" />}

      <path className="braise-core" d={CORE_PATHS[rank]} fill={inner} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M51 78 L54 75" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

      <rect x={footLeft} y="98" width={rankIndex < 2 ? 17 : 19} height="10" rx="4.5" fill={outer} stroke={INK} strokeWidth="3.5" transform={rank === 'bronze' ? 'rotate(5 33 98)' : undefined} />
      <rect x={footRight} y="98" width={rankIndex < 2 ? 17 : 19} height="10" rx="4.5" fill={outer} stroke={INK} strokeWidth="3.5" transform={rank === 'bronze' ? 'rotate(-5 58 98)' : undefined} />

      {expression === 'frozen' && <path d="M22 42 C14 52 16 88 27 99 C40 109 72 109 84 98 C95 84 95 52 84 42 C70 31 36 31 22 42 Z" fill="#BEE7F5" opacity="0.55" stroke="#FFFFFF" strokeWidth="2" />}
    </svg>
  );
}