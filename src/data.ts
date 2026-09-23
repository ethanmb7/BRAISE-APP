import type { Level, Subject, Flashcard, Badge, UserProfile } from './types';

// Chapter `status`/`mastery` below are only the fresh-install baseline (chapter 0 of each
// subject open at 0%, the rest locked) — same logic as `INITIAL.streak/xp = 0` in store.tsx: a
// real new user hasn't done anything yet, so nothing here claims otherwise. Real progression is
// computed at render time by `resolveChapters()` in store.tsx from the device's actual
// `completedChapters`, which is what both HomeView and SubjectView now read.

export const LEVELS: Level[] = [
  { id: '6e', label: '6ème', group: 'Collège' },
  { id: '5e', label: '5ème', group: 'Collège' },
  { id: '4e', label: '4ème', group: 'Collège' },
  { id: '3e', label: '3ème', group: 'Collège' },
  { id: '2nde', label: '2nde', group: 'Lycée' },
  { id: '1ere', label: '1ère', group: 'Lycée' },
  { id: 'term', label: 'Terminale', group: 'Lycée' },
];

export const SUBJECTS: Subject[] = [
  {
    id: 'maths',
    name: 'Mathématiques',
    emoji: '📐',
    color: '#3B82F6',
    bg: '#EFF6FF',
    chapters: [
      { id: 'm1', title: 'Les fractions', status: 'current', mastery: 0, duration: 3 },
      { id: 'm2', title: 'Théorème de Pythagore', status: 'locked', mastery: 0, duration: 4 },
      { id: 'm3', title: 'Les équations', status: 'locked', mastery: 0, reinforce: true, duration: 3 },
      { id: 'm4', title: 'Fonctions affines', status: 'locked', mastery: 0, duration: 5 },
      { id: 'm5', title: 'Statistiques', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'francais',
    name: 'Français',
    emoji: '📖',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    chapters: [
      { id: 'f1', title: 'Le roman et le récit', status: 'current', mastery: 0, duration: 5 },
      { id: 'f2', title: 'La poésie', status: 'locked', mastery: 0, duration: 3 },
      { id: 'f3', title: 'Le théâtre', status: 'locked', mastery: 0, duration: 4 },
      { id: 'f4', title: 'L\'argumentation', status: 'locked', mastery: 0, duration: 5 },
    ],
  },
  {
    id: 'histoire-geo',
    name: 'Histoire-Géo',
    emoji: '🌍',
    color: '#F59E0B',
    bg: '#FFFBEB',
    chapters: [
      { id: 'h1', title: 'La Révolution française', status: 'current', mastery: 0, duration: 4 },
      { id: 'h2', title: 'L\'Empire et Napoléon', status: 'locked', mastery: 0, duration: 5 },
      { id: 'h3', title: 'Les régimes politiques', status: 'locked', mastery: 0, duration: 3 },
      { id: 'h4', title: 'La mondialisation', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'svt',
    name: 'SVT',
    emoji: '🔬',
    color: '#10B981',
    bg: '#ECFDF5',
    chapters: [
      { id: 's1', title: 'La respiration', status: 'current', mastery: 0, duration: 3 },
      { id: 's2', title: 'La digestion', status: 'locked', mastery: 0, duration: 4 },
      { id: 's3', title: 'La génétique', status: 'locked', mastery: 0, skip: true, duration: 5 },
      { id: 's4', title: 'L\'écosystème', status: 'locked', mastery: 0, duration: 3 },
    ],
  },
  {
    id: 'physique',
    name: 'Physique-Chimie',
    emoji: '⚗️',
    color: '#06B6D4',
    bg: '#ECFEFF',
    chapters: [
      { id: 'p1', title: 'L\'atome et la matière', status: 'current', mastery: 0, duration: 4 },
      { id: 'p2', title: 'Les réactions chimiques', status: 'locked', mastery: 0, reinforce: true, duration: 5 },
      { id: 'p3', title: 'L\'électricité', status: 'locked', mastery: 0, duration: 3 },
      { id: 'p4', title: 'L\'énergie', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'anglais',
    name: 'Anglais',
    emoji: '🇬🇧',
    color: '#6366F1',
    bg: '#EEF2FF',
    chapters: [
      // duration = story slides (~22s) + checkpoint/quiz (~4 questions, ~20s each) + real card
      // review (5 real cards tagged chapterId 'a1' below, ~25s each) ≈ 220s, rounded to 4 min —
      // was 3 with only 1 real card behind it (Pioche du jour showed "3 min · 1 carte", a mismatch
      // between the two numbers). Recalculate this if fc25/fc27-30 below ever change.
      { id: 'a1', title: 'Present simple', status: 'current', mastery: 0, duration: 4 },
      { id: 'a2', title: 'Past simple', status: 'locked', mastery: 0, duration: 3 },
      { id: 'a3', title: 'Present perfect', status: 'locked', mastery: 0, duration: 4 },
      { id: 'a4', title: 'Modals & advice', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
];

export const FLASHCARDS: Flashcard[] = [
  { id: 'fc1', q: 'Comment calcule-t-on l\'hypoténuse d\'un triangle rectangle ?', a: 'Avec le théorème de **Pythagore** : le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés, soit $a^2 + b^2 = c^2$.', wrongA: 'En additionnant directement les deux côtés : $a + b = c$.', subject: 'maths', topic: 'Pythagore', chapterId: 'm2', level: 'medium' },
  { id: 'fc2', q: 'Qu\'est-ce qu\'une fraction irréductible ?', a: 'Une fraction qu\'on ne peut plus simplifier : le numérateur et le dénominateur n\'ont plus de ==diviseur commun== (autre que 1).', wrongA: 'Une fraction dont le numérateur est plus grand que le dénominateur.', subject: 'maths', topic: 'Fractions', chapterId: 'm1', level: 'easy' },
  { id: 'fc3', q: 'Comment résoudre l\'équation $2x + 3 = 11$ ?', a: 'On **isole x** : $2x = 11 - 3 = 8$, donc $x = 8 \\div 2 = 4$.', wrongA: 'On isole x : $2x = 11 - 3 = 8$, donc $x = 8$.', subject: 'maths', topic: 'Équations', chapterId: 'm3', level: 'medium' },
  { id: 'fc4', q: 'Qu\'est-ce qu\'un vers en poésie ?', a: 'Une ligne de poème. Un alexandrin a ==12 syllabes==, un décasyllabe en a ==10==.', wrongA: 'Un vers, c\'est une strophe entière composée de plusieurs lignes.', subject: 'francais', topic: 'Poésie', chapterId: 'f2', level: 'easy' },
  { id: 'fc5', q: 'Quelle est la date de prise de la Bastille ?', a: 'Le ==14 juillet 1789==, événement symbolique du début de la **Révolution française**.', wrongA: 'Le 14 juillet 1792, date de la proclamation de la République.', subject: 'histoire-geo', topic: 'Révolution', chapterId: 'h1', level: 'easy' },
  { id: 'fc6', q: 'Qu\'est-ce que la photosynthèse ?', a: 'Le processus par lequel les plantes fabriquent leur nourriture (**glucose**) à partir de lumière, d\'eau et de CO₂.', wrongA: 'Le processus par lequel les plantes respirent la nuit en absorbant de l\'oxygène.', subject: 'svt', topic: 'Plantes', chapterId: 's4', level: 'medium' },
  { id: 'fc7', q: 'Sujet : L\'atome', a: 'La ==plus petite particule== de matière. Il est composé d\'un **noyau** (protons + neutrons) et d\'électrons qui gravitent autour.', wrongA: 'La ==plus petite particule== de matière, et elle ==ne peut plus être divisée== en rien de plus petit.', subject: 'physique', topic: 'Atome', chapterId: 'p1', level: 'easy' },
  { id: 'fc8', q: 'Quand utilise-t-on le present perfect en anglais ?', a: 'Pour une action passée qui a un ==lien avec le présent== : "I have lost my keys" (je les ai perdues et je les cherche encore).', wrongA: 'Pour une action complètement terminée et sans lien avec le présent, comme le simple past.', subject: 'anglais', topic: 'Present perfect', chapterId: 'a3', level: 'hard' },
  { id: 'fc9', q: 'Comment calcule-t-on l\'image d\'un nombre par une fonction affine $f(x) = ax + b$ ?', a: 'On **remplace x** par la valeur donnée et on calcule : pour $f(x) = 2x + 3$, $f(5) = 2 \\times 5 + 3 = 13$.', wrongA: 'On remplace x par la valeur donnée, mais on n\'ajoute pas le $b$ au résultat.', subject: 'maths', topic: 'Fonctions affines', chapterId: 'm4', level: 'medium' },
  { id: 'fc10', q: 'Comment calcule-t-on la moyenne d\'une série de valeurs ?', a: 'On **additionne** toutes les valeurs puis on ==divise par le nombre de valeurs==.', wrongA: 'On prend simplement la valeur du milieu de la série.', subject: 'maths', topic: 'Statistiques', chapterId: 'm5', level: 'easy' },
  { id: 'fc11', q: 'Qu\'est-ce que la médiane d\'une série de valeurs ?', a: 'La ==valeur du milieu== quand on range toute la série dans l\'ordre croissant.', wrongA: 'La moyenne entre la plus petite et la plus grande valeur de la série.', subject: 'maths', topic: 'Statistiques', chapterId: 'm5', level: 'medium' },
  { id: 'fc12', q: 'Qu\'est-ce que le narrateur d\'un récit ?', a: 'La **voix qui raconte** l\'histoire — ==presque toujours différente== de l\'auteur qui l\'a écrite.', wrongA: 'L\'auteur du livre en personne, qui s\'adresse directement au lecteur.', subject: 'francais', topic: 'Roman et récit', chapterId: 'f1', level: 'easy' },
  { id: 'fc13', q: 'Que sont les didascalies dans une pièce de théâtre ?', a: 'Les indications de mise en scène, ==écrites en italique==, **jamais dites à voix haute** par les acteurs.', wrongA: 'Les répliques que les acteurs prononcent réellement sur scène.', subject: 'francais', topic: 'Théâtre', chapterId: 'f3', level: 'medium' },
  { id: 'fc14', q: 'Dans un texte argumentatif, que doit-on toujours associer à un argument ?', a: 'Un **exemple concret** qui l\'illustre : un argument seul, sans preuve, convainc beaucoup moins.', wrongA: 'Rien de particulier, un bon argument suffit toujours à lui seul.', subject: 'francais', topic: 'Argumentation', chapterId: 'f4', level: 'medium' },
  { id: 'fc15', q: 'Que crée Napoléon en 1804, encore utilisé en partie aujourd\'hui ?', a: 'Le **Code civil**, qui organise notamment le droit des personnes et des biens en France.', wrongA: 'La Déclaration des droits de l\'homme, qui date en réalité de 1789.', subject: 'histoire-geo', topic: 'Napoléon', chapterId: 'h2', level: 'medium' },
  { id: 'fc16', q: 'Comment le pouvoir se transmet-il dans une monarchie ?', a: 'Par ==hérédité==, au sein d\'une **même famille**, de génération en génération.', wrongA: 'Par élection populaire organisée tous les cinq ans.', subject: 'histoire-geo', topic: 'Régimes politiques', chapterId: 'h3', level: 'easy' },
  { id: 'fc17', q: 'Que désigne le terme "mondialisation" ?', a: 'La **mise en réseau des échanges** — biens, capitaux, informations — à ==l\'échelle mondiale==.', wrongA: 'Un simple accord commercial entre deux pays voisins.', subject: 'histoire-geo', topic: 'Mondialisation', chapterId: 'h4', level: 'medium' },
  { id: 'fc18', q: 'Où se déroule surtout l\'absorption des nutriments dans le corps ?', a: 'Dans l\'**intestin grêle**, où les nutriments digérés passent dans le sang.', wrongA: 'Dans l\'estomac, où la digestion se termine entièrement.', subject: 'svt', topic: 'Digestion', chapterId: 's2', level: 'medium' },
  { id: 'fc19', q: 'Qu\'est-ce qu\'un allèle ?', a: 'Une des ==deux versions== d\'un même gène, une **héritée de chaque parent**.', wrongA: 'Un organe responsable à lui seul de la transmission des caractères physiques.', subject: 'svt', topic: 'Génétique', chapterId: 's3', level: 'medium' },
  { id: 'fc20', q: 'Quels gaz sont échangés lors de la respiration ?', a: 'Le **dioxygène (O₂)** est inspiré, le ==dioxyde de carbone (CO₂)== est expiré.', wrongA: 'L\'azote est inspiré et l\'oxygène est expiré.', subject: 'svt', topic: 'Respiration', chapterId: 's1', level: 'easy' },
  { id: 'fc21', q: 'Que dit la loi de conservation de la matière dans une réaction chimique ?', a: 'La ==masse totale ne change jamais== : les réactifs se transforment en produits, sans aucune perte de matière.', wrongA: 'La masse totale peut diminuer si la réaction dégage de la chaleur.', subject: 'physique', topic: 'Réactions chimiques', chapterId: 'p2', level: 'medium' },
  { id: 'fc22', q: 'Que dit la loi d\'Ohm ?', a: '$U = R \\times I$ : la **tension** est égale à la ==résistance multipliée par l\'intensité==.', wrongA: '$U = R + I$ : la tension est égale à la résistance plus l\'intensité.', subject: 'physique', topic: 'Électricité', chapterId: 'p3', level: 'medium' },
  { id: 'fc23', q: 'Que devient l\'énergie lors d\'une transformation ?', a: 'Elle ==se transforme== en une autre forme (thermique, cinétique...) — elle **ne disparaît jamais**.', wrongA: 'Elle disparaît petit à petit à chaque transformation.', subject: 'physique', topic: 'Énergie', chapterId: 'p4', level: 'easy' },
  { id: 'fc24', q: 'Comment conjugue-t-on un verbe régulier au past simple en anglais ?', a: 'On ajoute **-ED** à la fin du verbe : "play" devient =="played"==.', wrongA: 'On ajoute -ING à la fin du verbe : "play" devient "playing".', subject: 'anglais', topic: 'Past simple', chapterId: 'a2', level: 'easy' },
  { id: 'fc25', q: 'Quelle terminaison ajoute-t-on au verbe à la 3e personne du singulier au present simple ?', a: 'Un **S** : =="she likes"==, "he plays".', wrongA: 'Un ED : "she liked", "he played".', subject: 'anglais', topic: 'Present simple', chapterId: 'a1', level: 'easy' },
  { id: 'fc26', q: 'Quelle est la différence entre "must" et "should" en anglais ?', a: '"**Must**" exprime une ==obligation forte==, "should" n\'est qu\'un simple conseil.', wrongA: 'Les deux expriment exactement le même niveau d\'obligation.', subject: 'anglais', topic: 'Modals', chapterId: 'a4', level: 'medium' },
  // fc27-fc30: real additional Present simple cards (chapterId 'a1') — was a single card (fc25)
  // while its chapter's duration claimed 3 min, a mismatch Pioche du jour displayed honestly
  // ("3 min · 1 carte") but that read as broken. See the duration comment on chapter 'a1' above.
  { id: 'fc27', q: 'Comment forme-t-on la négation au present simple avec "she/he/it" ?', a: 'Avec **doesn\'t** + verbe de base : "She doesn\'t like coffee" — jamais de S sur le verbe après doesn\'t.', wrongA: 'Avec don\'t + verbe de base, comme pour tous les autres sujets : "She don\'t like coffee".', subject: 'anglais', topic: 'Present simple', chapterId: 'a1', level: 'medium' },
  { id: 'fc28', q: 'Comment pose-t-on une question au present simple avec "you" ?', a: 'On commence par **Do** : "Do you like pizza?" — le verbe reste à sa forme de base.', wrongA: 'On inverse juste le sujet et le verbe, comme en français : "Like you pizza?".', subject: 'anglais', topic: 'Present simple', chapterId: 'a1', level: 'easy' },
  { id: 'fc29', q: 'Où placer un adverbe de fréquence comme "always" ou "never" au present simple ?', a: '==Avant le verbe principal==, mais après "to be" : "She always arrives on time", "She is never late".', wrongA: 'Toujours en fin de phrase, après le verbe : "She arrives always on time".', subject: 'anglais', topic: 'Present simple', chapterId: 'a1', level: 'medium' },
  { id: 'fc30', q: 'Comment conjugue-t-on "study" à la 3e personne du singulier au present simple ?', a: 'Le Y devient IE avant le S : =="she studies"==, jamais "she studys".', wrongA: 'On ajoute juste un S à la fin, comme les autres verbes : "she studys".', subject: 'anglais', topic: 'Present simple', chapterId: 'a1', level: 'hard' },
];

export const BADGES: Badge[] = [
  { id: 'b1', emoji: '🔥', name: '3 jours', cond: 'Série de 3' },
  { id: 'b2', emoji: '⚡', name: '100 XP', cond: '100 XP gagnés' },
  { id: 'b3', emoji: '📚', name: 'Premier chapitre', cond: '1 chapitre fini' },
  { id: 'b4', emoji: '🧊', name: 'Gel utilisé', cond: 'Utiliser un gel' },
  { id: 'b5', emoji: '🌟', name: '7 jours', cond: 'Série de 7' },
  { id: 'b6', emoji: '🏆', name: '1000 XP', cond: '1000 XP gagnés' },
];

// Shared between onboarding (first pick) and Profil (change it later) — one source so the two
// pickers can never drift apart. Les Flambés : 6 esprits de flamme à vibe d'ado, gratuits dès le
// départ (un nouveau compte est rang Bronze). Les 3 derniers sont de vraies récompenses de rang,
// dans la même logique "débloqué par palier" que les badges/médailles. Le champ `emoji` est
// historique (c'était un emoji) ; il porte désormais un slug stable ('fleme', 'crane'…), clé vers
// le SVG vectoriel dessiné dans AvatarGlyph.tsx. Aucun emoji système n'est plus affiché.
export type AvatarOption = { emoji: string; minRankId?: string };
export const AVATARS: AvatarOption[] = [
  { emoji: 'fleme' },
  { emoji: 'crane' },
  { emoji: 'bucheuse' },
  { emoji: 'casque' },
  { emoji: 'masque' },
  { emoji: 'eclair' },
  { emoji: 'fuse', minRankId: 'or' },
  { emoji: 'glace', minRankId: 'platine' },
  { emoji: 'phenix', minRankId: 'legende' },
];

export const DEFAULT_USER: UserProfile = {
  name: 'Alex',
  level: '3e',
  levelLabel: '3ème',
  goal: '30 min/jour',
  subjects: ['maths', 'francais', 'histoire-geo', 'svt'],
  avatar: 'fleme',
  personality: 'chill',
};

export const STORIES: Record<string, { slides: import('./types').StorySlide[]; quiz: import('./types').QuizQuestion[]; checkpoint?: import('./types').QuizQuestion[] }> = {
  m3: {
    slides: [
      { emoji: '⚖️', text: 'Une équation, c\'est comme une balance en équilibre.', bg: 'linear-gradient(160deg,#2F5FE3,#13214f)', duration: 5000 },
      { emoji: '📦', text: 'Des deux côtés, il y a la même valeur. Si tu changes un côté, tu dois changer l\'autre aussi.', bg: 'linear-gradient(160deg,#1E48C4,#2F5FE3)', duration: 6000 },
      { emoji: '➡️', text: 'Le but : isoler le x d\'un côté pour trouver sa valeur.', bg: 'linear-gradient(160deg,#13214f,#1E48C4)', duration: 5000 },
      { emoji: '✨', text: '2x + 3 = 11 → 2x = 8 → x = 4. Trop facile !', bg: 'linear-gradient(160deg,#2F5FE3,#1E48C4)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Dans une équation, les deux côtés ont toujours la même valeur.', answer: 1, explain: 'Vrai ! C\'est exactement ça : l\'équation est une égalité, comme une balance en équilibre.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Résous : x + 5 = 12', options: ['x = 7', 'x = 17', 'x = 60'], answer: 0, explain: 'On soustrait 5 des deux côtés : x = 12 - 5 = 7.' },
      { type: 'vf', q: 'Dans une équation, on peut faire ce qu\'on veut d\'un côté sans toucher l\'autre.', answer: 0, explain: 'Faux ! L\'équation est une balance : toute opération d\'un côté doit être reproduite de l\'autre.' },
      { type: 'mcq', q: 'Résous : 3x = 21', options: ['x = 7', 'x = 18', 'x = 24'], answer: 0, explain: 'On divise les deux côtés par 3 : x = 21 ÷ 3 = 7.' },
    ],
  },
  m1: {
    slides: [
      { emoji: '🍕', text: 'Une fraction, c\'est une part d\'un tout coupé en morceaux égaux.', bg: 'linear-gradient(160deg,#2F5FE3,#13214f)', duration: 5000 },
      { emoji: '🔢', text: 'En haut (numérateur) : combien de parts tu prends. En bas (dénominateur) : le nombre total de parts égales.', bg: 'linear-gradient(160deg,#1E48C4,#2F5FE3)', duration: 6000 },
      { emoji: '✂️', text: 'Pour simplifier, tu divises le haut ET le bas par le même nombre.', bg: 'linear-gradient(160deg,#13214f,#1E48C4)', duration: 5000 },
      { emoji: '✨', text: '6/8 → tu divises par 2 → 3/4. Même valeur, écriture plus simple !', bg: 'linear-gradient(160deg,#2F5FE3,#1E48C4)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Pour simplifier une fraction, on peut diviser seulement le numérateur.', answer: 0, explain: 'Faux ! Il faut diviser le numérateur ET le dénominateur par le même nombre, sinon la valeur change.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Simplifie 4/8.', options: ['1/2', '2/4', '4/4'], answer: 0, explain: '4/8 : tu divises le haut et le bas par 4 → 1/2.' },
      { type: 'vf', q: 'Pour additionner deux fractions, il faut le même dénominateur.', answer: 1, explain: 'Vrai ! Sans dénominateur commun, on ne peut pas additionner directement les numérateurs.' },
      { type: 'mcq', q: 'Combien vaut 1/2 + 1/4 ?', options: ['3/4', '2/6', '1/6'], answer: 0, explain: 'On transforme 1/2 en 2/4 : 2/4 + 1/4 = 3/4.' },
    ],
  },
  m2: {
    slides: [
      { emoji: '📐', text: 'Dans un triangle RECTANGLE, il existe une relation magique entre les 3 côtés.', bg: 'linear-gradient(160deg,#2F5FE3,#13214f)', duration: 5000 },
      { emoji: '📏', text: 'L\'hypoténuse, c\'est le côté le plus long, toujours en face de l\'angle droit.', bg: 'linear-gradient(160deg,#1E48C4,#2F5FE3)', duration: 6000 },
      { emoji: '🧮', text: 'La règle : a² + b² = c², où c est l\'hypoténuse.', bg: 'linear-gradient(160deg,#13214f,#1E48C4)', duration: 5000 },
      { emoji: '✅', text: 'Triangle 3-4-5 ? 3² + 4² = 9 + 16 = 25 = 5². Ça marche à tous les coups !', bg: 'linear-gradient(160deg,#2F5FE3,#1E48C4)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Le théorème de Pythagore ne fonctionne que sur un triangle rectangle.', answer: 1, explain: 'Vrai ! Sans angle droit, la formule a² + b² = c² ne s\'applique pas.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Un triangle rectangle a des côtés de 6 et 8. Quelle est l\'hypoténuse ?', options: ['10', '14', '48'], answer: 0, explain: '6² + 8² = 36 + 64 = 100, et √100 = 10.' },
      { type: 'vf', q: 'L\'hypoténuse est toujours le côté le plus court du triangle.', answer: 0, explain: 'Faux ! L\'hypoténuse est au contraire le côté le plus long.' },
      { type: 'mcq', q: 'Un triangle rectangle a une hypoténuse de 5 et un côté de 3. Quel est l\'autre côté ?', options: ['4', '2', '8'], answer: 0, explain: 'c² - a² = b² : 5² - 3² = 25 - 9 = 16, et √16 = 4.' },
    ],
  },
  m4: {
    slides: [
      { emoji: '📈', text: 'Une fonction affine s\'écrit f(x) = ax + b.', bg: 'linear-gradient(160deg,#2F5FE3,#13214f)', duration: 5000 },
      { emoji: '📊', text: '\'a\', c\'est la pente : plus elle est grande, plus la droite monte vite.', bg: 'linear-gradient(160deg,#1E48C4,#2F5FE3)', duration: 6000 },
      { emoji: '🎯', text: '\'b\', c\'est l\'ordonnée à l\'origine : la valeur de f(x) quand x = 0.', bg: 'linear-gradient(160deg,#13214f,#1E48C4)', duration: 5000 },
      { emoji: '🚕', text: 'Un taxi facture 2€ de prise en charge + 1€ par km : f(x) = 1x + 2. Une fonction affine, tout simplement !', bg: 'linear-gradient(160deg,#2F5FE3,#1E48C4)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Dans f(x) = ax + b, \'b\' représente la pente de la droite.', answer: 0, explain: 'Faux ! \'a\' est la pente, \'b\' est l\'ordonnée à l\'origine (la valeur de départ).' },
    ],
    quiz: [
      { type: 'mcq', q: 'Pour f(x) = 3x + 2, combien vaut f(4) ?', options: ['14', '9', '12'], answer: 0, explain: 'f(4) = 3×4 + 2 = 12 + 2 = 14.' },
      { type: 'vf', q: 'Dans une fonction affine, \'a\' est la pente de la droite.', answer: 1, explain: 'Vrai ! \'a\' indique à quelle vitesse la droite monte ou descend.' },
      { type: 'mcq', q: 'Quelle est l\'ordonnée à l\'origine de f(x) = 5x - 3 ?', options: ['-3', '5', '3'], answer: 0, explain: 'L\'ordonnée à l\'origine est la valeur de f(0), ici -3.' },
    ],
  },
  m5: {
    slides: [
      { emoji: '📊', text: 'Les statistiques, c\'est résumer une série de valeurs en quelques nombres clés.', bg: 'linear-gradient(160deg,#2F5FE3,#13214f)', duration: 5000 },
      { emoji: '➕', text: 'La moyenne : tu additionnes toutes les valeurs, puis tu divises par leur nombre.', bg: 'linear-gradient(160deg,#1E48C4,#2F5FE3)', duration: 6000 },
      { emoji: '🎯', text: 'La médiane : tu ranges les valeurs dans l\'ordre, c\'est celle du milieu.', bg: 'linear-gradient(160deg,#13214f,#1E48C4)', duration: 5000 },
      { emoji: '⚠️', text: 'Une valeur extrême fausse la moyenne, mais pas la médiane !', bg: 'linear-gradient(160deg,#2F5FE3,#1E48C4)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La médiane est toujours égale à la moyenne.', answer: 0, explain: 'Faux ! Elles sont parfois proches, mais une valeur extrême peut les rendre très différentes.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quelle est la moyenne de 4, 6 et 8 ?', options: ['6', '8', '4'], answer: 0, explain: '(4 + 6 + 8) / 3 = 18 / 3 = 6.' },
      { type: 'vf', q: 'Une valeur extrême fausse la moyenne plus que la médiane.', answer: 1, explain: 'Vrai ! La moyenne prend en compte toutes les valeurs, une valeur extrême la tire fortement.' },
      { type: 'mcq', q: 'Quelle est la médiane de 2, 3, 9 ?', options: ['3', '9', '2'], answer: 0, explain: 'Rangées dans l\'ordre (2, 3, 9), la valeur du milieu est 3.' },
    ],
  },
  f1: {
    slides: [
      { emoji: '📖', text: 'Un récit raconte une histoire : il a un narrateur, des personnages et une intrigue.', bg: 'linear-gradient(160deg,#7C3AED,#2E1065)', duration: 5000 },
      { emoji: '🎙️', text: 'Le narrateur n\'est PAS l\'auteur : ce sont presque toujours deux personnes différentes.', bg: 'linear-gradient(160deg,#5B21B6,#7C3AED)', duration: 6000 },
      { emoji: '⏳', text: 'Le récit se raconte souvent au passé : imparfait pour le décor, passé simple pour les actions.', bg: 'linear-gradient(160deg,#2E1065,#5B21B6)', duration: 6000 },
      { emoji: '🎬', text: 'Tu binges une série et tu devines la suite ? T\'as déjà le réflexe du roman !', bg: 'linear-gradient(160deg,#7C3AED,#5B21B6)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'L\'auteur et le narrateur d\'un roman sont toujours la même personne.', answer: 0, explain: 'Faux ! Le narrateur est une voix créée par l\'auteur pour raconter l\'histoire, ce n\'est presque jamais l\'auteur lui-même.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Comment s\'appelle celui qui raconte l\'histoire dans un récit ?', options: ['Le narrateur', 'L\'auteur', 'Le lecteur'], answer: 0, explain: 'Le narrateur est la voix qui raconte, créée par l\'auteur — pas l\'auteur en personne.' },
      { type: 'vf', q: 'L\'imparfait sert souvent à décrire le décor ou une action qui dure.', answer: 1, explain: 'Vrai ! Le passé simple, lui, marque plutôt les actions précises et ponctuelles.' },
      { type: 'mcq', q: 'Qu\'est-ce que l\'intrigue d\'un récit ?', options: ['L\'enchaînement des événements de l\'histoire', 'Le nom de l\'auteur', 'Le lieu où se passe l\'histoire'], answer: 0, explain: 'L\'intrigue, c\'est le fil des événements : ce qui se passe, dans quel ordre, et pourquoi.' },
    ],
  },
  f2: {
    slides: [
      { emoji: '✍️', text: 'Un vers, c\'est une ligne de poème. Plusieurs vers forment une strophe.', bg: 'linear-gradient(160deg,#7C3AED,#2E1065)', duration: 5000 },
      { emoji: '🔢', text: 'On compte les syllabes : un alexandrin a 12 syllabes, un décasyllabe en a 10.', bg: 'linear-gradient(160deg,#5B21B6,#7C3AED)', duration: 6000 },
      { emoji: '🔤', text: 'Le \'e\' muet en fin de vers compte dans le décompte s\'il est suivi d\'une consonne !', bg: 'linear-gradient(160deg,#2E1065,#5B21B6)', duration: 6000 },
      { emoji: '🎵', text: 'Les rimes relient les sons à la fin des vers : elles donnent sa musique au poème.', bg: 'linear-gradient(160deg,#7C3AED,#5B21B6)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Un alexandrin compte 10 syllabes.', answer: 0, explain: 'Faux ! L\'alexandrin compte 12 syllabes — c\'est le décasyllabe qui en compte 10.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Combien de syllabes compte un alexandrin ?', options: ['12', '10', '8'], answer: 0, explain: 'L\'alexandrin, le vers classique par excellence, compte 12 syllabes.' },
      { type: 'vf', q: 'Un vers, c\'est une strophe entière composée de plusieurs lignes.', answer: 0, explain: 'Faux ! Un vers est une seule ligne de poème ; une strophe regroupe plusieurs vers.' },
      { type: 'mcq', q: 'Comment appelle-t-on le son qui se répète à la fin de deux vers ?', options: ['Une rime', 'Une strophe', 'Une syllabe'], answer: 0, explain: 'La rime, c\'est justement cette répétition de son en fin de vers.' },
    ],
  },
  f3: {
    slides: [
      { emoji: '🎭', text: 'Au théâtre, le texte est fait pour être joué, pas juste lu.', bg: 'linear-gradient(160deg,#7C3AED,#2E1065)', duration: 5000 },
      { emoji: '📝', text: 'Les didascalies (en italique) indiquent la mise en scène : gestes, décor, ton.', bg: 'linear-gradient(160deg,#5B21B6,#7C3AED)', duration: 6000 },
      { emoji: '💬', text: 'Les répliques, c\'est ce que les personnages disent réellement à voix haute.', bg: 'linear-gradient(160deg,#2E1065,#5B21B6)', duration: 5000 },
      { emoji: '🎭', text: 'Comédie ou tragédie ? Deux genres, deux façons de faire réagir le public.', bg: 'linear-gradient(160deg,#7C3AED,#5B21B6)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Les didascalies sont dites à voix haute par les acteurs.', answer: 0, explain: 'Faux ! Les didascalies sont juste lues par les acteurs et le metteur en scène, jamais prononcées sur scène.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Comment appelle-t-on les indications de mise en scène écrites en italique ?', options: ['Les didascalies', 'Les répliques', 'Les rimes'], answer: 0, explain: 'Les didascalies donnent des indications de jeu, de décor ou de ton — elles ne sont jamais jouées.' },
      { type: 'vf', q: 'Une réplique est une phrase prononcée par un personnage.', answer: 1, explain: 'Vrai ! La réplique, c\'est le texte que le personnage dit réellement sur scène.' },
      { type: 'mcq', q: 'Qu\'est-ce qui distingue une comédie d\'une tragédie ?', options: ['Le ton et l\'issue de l\'histoire (drôle ou dramatique)', 'Le nombre d\'acteurs sur scène', 'La longueur de la pièce'], answer: 0, explain: 'La comédie vise à faire rire avec souvent une fin heureuse, la tragédie est dramatique et finit mal.' },
    ],
  },
  f4: {
    slides: [
      { emoji: '🎯', text: 'Argumenter, c\'est défendre une idée avec de bonnes raisons.', bg: 'linear-gradient(160deg,#7C3AED,#2E1065)', duration: 5000 },
      { emoji: '💡', text: 'La thèse, c\'est ton avis. L\'argument, c\'est pourquoi tu penses ça.', bg: 'linear-gradient(160deg,#5B21B6,#7C3AED)', duration: 6000 },
      { emoji: '📌', text: 'L\'exemple, c\'est la preuve concrète qui illustre ton argument.', bg: 'linear-gradient(160deg,#2E1065,#5B21B6)', duration: 5000 },
      { emoji: '🔗', text: 'Thèse → Argument → Exemple, toujours dans cet ordre, jamais un exemple seul.', bg: 'linear-gradient(160deg,#7C3AED,#5B21B6)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Un exemple seul, sans argument derrière, suffit à convaincre.', answer: 0, explain: 'Faux ! Un exemple sans argument ne prouve rien : il doit toujours illustrer une idée déjà expliquée.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Qu\'est-ce que la thèse dans un texte argumentatif ?', options: ['L\'avis défendu par l\'auteur', 'Un exemple concret', 'Le titre du texte'], answer: 0, explain: 'La thèse, c\'est l\'opinion que l\'auteur cherche à défendre tout au long du texte.' },
      { type: 'vf', q: 'Un argument doit toujours être accompagné d\'un exemple.', answer: 1, explain: 'Vrai ! L\'exemple rend l\'argument concret et donc plus convaincant.' },
      { type: 'mcq', q: 'Convaincre tes parents de reculer l\'heure du couvre-feu, c\'est un exercice de...', options: ['Argumentation', 'Narration', 'Description'], answer: 0, explain: 'Défendre une position avec des raisons, c\'est exactement de l\'argumentation.' },
    ],
  },
  h1: {
    slides: [
      { emoji: '🏰', text: 'En 1789, la France traverse une crise financière et sociale profonde.', bg: 'linear-gradient(160deg,#D97706,#78350F)', duration: 5000 },
      { emoji: '⚔️', text: 'Le 14 juillet 1789, le peuple de Paris prend la Bastille, symbole de l\'autorité royale.', bg: 'linear-gradient(160deg,#B45309,#D97706)', duration: 6000 },
      { emoji: '📜', text: 'En août 1789, la Déclaration des droits de l\'homme proclame liberté et égalité.', bg: 'linear-gradient(160deg,#78350F,#B45309)', duration: 6000 },
      { emoji: '👑', text: 'En 1793, quatre ans plus tard, le roi Louis XVI est exécuté — un événement bien distinct !', bg: 'linear-gradient(160deg,#D97706,#B45309)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La prise de la Bastille et l\'exécution de Louis XVI ont eu lieu la même année.', answer: 0, explain: 'Faux ! La Bastille tombe en 1789, Louis XVI est exécuté en 1793 — 4 ans plus tard.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quelle est la date de la prise de la Bastille ?', options: ['Le 14 juillet 1789', 'Le 14 juillet 1792', 'Le 4 août 1789'], answer: 0, explain: 'Le 14 juillet 1789, événement symbolique du début de la Révolution française.' },
      { type: 'vf', q: 'La Déclaration des droits de l\'homme est proclamée en 1789.', answer: 1, explain: 'Vrai ! Elle est adoptée en août 1789, peu après la prise de la Bastille.' },
      { type: 'mcq', q: 'Quel roi est exécuté en 1793 ?', options: ['Louis XVI', 'Napoléon', 'Louis XIV'], answer: 0, explain: 'Louis XVI est exécuté en 1793, plusieurs années après le début de la Révolution.' },
    ],
  },
  h2: {
    slides: [
      { emoji: '⚔️', text: 'Napoléon Bonaparte est un général qui s\'impose après la Révolution.', bg: 'linear-gradient(160deg,#D97706,#78350F)', duration: 5000 },
      { emoji: '👑', text: 'En 1804, il se fait sacrer Empereur des Français.', bg: 'linear-gradient(160deg,#B45309,#D97706)', duration: 5000 },
      { emoji: '📚', text: 'Il crée le Code civil, qui organise encore aujourd\'hui une partie du droit français.', bg: 'linear-gradient(160deg,#78350F,#B45309)', duration: 6000 },
      { emoji: '🤔', text: 'Empereur après une révolution anti-rois ? Contradiction... mais Napoléon garde certaines idées de 1789.', bg: 'linear-gradient(160deg,#D97706,#B45309)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Napoléon a annulé toutes les idées de la Révolution française une fois au pouvoir.', answer: 0, explain: 'Faux ! Il garde et verrouille certaines idées de la Révolution, comme l\'égalité devant la loi dans le Code civil.' },
    ],
    quiz: [
      { type: 'mcq', q: 'En quelle année Napoléon se fait-il sacrer Empereur ?', options: ['1804', '1789', '1793'], answer: 0, explain: 'Napoléon se fait sacrer Empereur des Français en 1804.' },
      { type: 'vf', q: 'Le Code civil a été créé sous Napoléon.', answer: 1, explain: 'Vrai ! Le Code civil, aussi appelé Code Napoléon, organise encore une partie du droit français aujourd\'hui.' },
      { type: 'mcq', q: 'Napoléon était, avant de devenir Empereur...', options: ['Un général de l\'armée', 'Un roi héréditaire', 'Un prêtre'], answer: 0, explain: 'Napoléon s\'est d\'abord imposé comme général avant de devenir Empereur en 1804.' },
    ],
  },
  h3: {
    slides: [
      { emoji: '🏛️', text: 'Un régime politique, ce sont les règles du jeu pour diriger un pays.', bg: 'linear-gradient(160deg,#D97706,#78350F)', duration: 5000 },
      { emoji: '🗳️', text: 'La république : le pouvoir vient d\'élections, pas de l\'hérédité.', bg: 'linear-gradient(160deg,#B45309,#D97706)', duration: 5000 },
      { emoji: '👑', text: 'La monarchie : le pouvoir se transmet de génération en génération dans une même famille.', bg: 'linear-gradient(160deg,#78350F,#B45309)', duration: 6000 },
      { emoji: '⚠️', text: 'La dictature : un pouvoir sans contre-pouvoir ni liberté de contestation réelle.', bg: 'linear-gradient(160deg,#D97706,#B45309)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Une élection suffit à elle seule à garantir une démocratie.', answer: 0, explain: 'Faux ! Il faut aussi la liberté de contester le pouvoir, une presse libre et des contre-pouvoirs réels.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Dans une monarchie, comment le pouvoir se transmet-il ?', options: ['Par hérédité, au sein d\'une même famille', 'Par élection populaire', 'Par tirage au sort'], answer: 0, explain: 'La monarchie transmet le pouvoir de génération en génération dans une même famille.' },
      { type: 'vf', q: 'Dans une dictature, il existe une vraie liberté de contester le pouvoir en place.', answer: 0, explain: 'Faux ! La dictature se caractérise justement par l\'absence de contre-pouvoirs et de liberté de contestation.' },
      { type: 'mcq', q: 'Comment le pouvoir est-il attribué dans une république ?', options: ['Par élection', 'Par hérédité', 'Par la force uniquement'], answer: 0, explain: 'Dans une république, les dirigeants sont désignés par le vote des citoyens.' },
    ],
  },
  h4: {
    slides: [
      { emoji: '👟', text: 'Tes sneakers, fabriquées en Asie et vendues en France : bienvenue dans la mondialisation.', bg: 'linear-gradient(160deg,#D97706,#78350F)', duration: 6000 },
      { emoji: '🌍', text: 'La mondialisation, c\'est la mise en réseau des échanges à l\'échelle mondiale : biens, capitaux, informations.', bg: 'linear-gradient(160deg,#B45309,#D97706)', duration: 6000 },
      { emoji: '🚢', text: 'Des marchandises traversent la planète chaque jour grâce au commerce international.', bg: 'linear-gradient(160deg,#78350F,#B45309)', duration: 5000 },
      { emoji: '⚖️', text: 'Mais attention : la mondialisation crée aussi des inégalités entre pays et territoires.', bg: 'linear-gradient(160deg,#D97706,#B45309)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La mondialisation profite exactement de la même façon à tous les pays du monde.', answer: 0, explain: 'Faux ! Elle crée aussi des inégalités : certains territoires en profitent bien plus que d\'autres.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Que désigne le terme \'mondialisation\' ?', options: ['La mise en réseau des échanges à l\'échelle mondiale', 'Un régime politique', 'Une guerre entre pays'], answer: 0, explain: 'La mondialisation, c\'est l\'intensification des échanges de biens, de capitaux et d\'informations dans le monde entier.' },
      { type: 'vf', q: 'La mondialisation ne concerne que les échanges de marchandises.', answer: 0, explain: 'Faux ! Elle concerne aussi les flux financiers et la circulation des informations, pas seulement les biens.' },
      { type: 'mcq', q: 'Quel est un effet négatif possible de la mondialisation ?', options: ['Des inégalités entre territoires', 'Une baisse du commerce mondial', 'La disparition des échanges internationaux'], answer: 0, explain: 'La mondialisation profite plus à certains territoires qu\'à d\'autres, créant des inégalités.' },
    ],
  },
  s1: {
    slides: [
      { emoji: '🏃', text: 'Pourquoi es-tu essoufflé après un sprint ? Ton corps réclame plus d\'oxygène.', bg: 'linear-gradient(160deg,#059669,#064E3B)', duration: 5000 },
      { emoji: '🫁', text: 'La respiration, c\'est l\'échange de gaz entre l\'air et le sang : O₂ inspiré, CO₂ expiré.', bg: 'linear-gradient(160deg,#047857,#059669)', duration: 6000 },
      { emoji: '🎈', text: 'Cet échange se fait dans les alvéoles pulmonaires, au fond des poumons.', bg: 'linear-gradient(160deg,#064E3B,#047857)', duration: 5000 },
      { emoji: '⚡', text: 'Plus tu bouges, plus tes muscles ont besoin d\'O₂, plus tu respires vite !', bg: 'linear-gradient(160deg,#059669,#047857)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La respiration consiste à transformer les aliments en énergie.', answer: 0, explain: 'Faux ! Ça, c\'est la digestion. La respiration, c\'est l\'échange de gaz — O₂ inspiré, CO₂ expiré.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quel gaz est inspiré lors de la respiration ?', options: ['Le dioxygène (O₂)', 'Le dioxyde de carbone (CO₂)', 'L\'azote'], answer: 0, explain: 'On inspire du dioxygène (O₂), utilisé par les cellules, et on expire du dioxyde de carbone (CO₂).' },
      { type: 'vf', q: 'L\'échange de gaz respiratoire a lieu dans les alvéoles pulmonaires.', answer: 1, explain: 'Vrai ! C\'est au niveau des alvéoles, au fond des poumons, que l\'O₂ passe dans le sang.' },
      { type: 'mcq', q: 'Pourquoi respires-tu plus vite pendant un effort ?', options: ['Les muscles ont besoin de plus de dioxygène', 'Le corps produit moins de CO₂', 'Les poumons rétrécissent'], answer: 0, explain: 'L\'effort augmente les besoins en O₂ des muscles, donc la fréquence respiratoire augmente pour en fournir plus.' },
    ],
  },
  s2: {
    slides: [
      { emoji: '🌯', text: 'Ton kebab de midi devient de l\'énergie pour réviser ce soir ? Merci la digestion.', bg: 'linear-gradient(160deg,#059669,#064E3B)', duration: 6000 },
      { emoji: '🦷', text: 'La digestion commence dans la bouche, se poursuit dans l\'estomac, puis dans l\'intestin.', bg: 'linear-gradient(160deg,#047857,#059669)', duration: 6000 },
      { emoji: '🔬', text: 'Les aliments sont transformés en nutriments, des molécules assez petites pour passer dans le sang.', bg: 'linear-gradient(160deg,#064E3B,#047857)', duration: 6000 },
      { emoji: '🩸', text: 'C\'est surtout dans l\'intestin grêle que les nutriments passent réellement dans le sang.', bg: 'linear-gradient(160deg,#059669,#047857)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La digestion se termine entièrement dans l\'estomac.', answer: 0, explain: 'Faux ! Elle continue surtout dans l\'intestin grêle, où les nutriments sont absorbés vers le sang.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Que deviennent les aliments après la digestion ?', options: ['Des nutriments absorbés par le sang', 'De l\'eau uniquement', 'Des gaz respiratoires'], answer: 0, explain: 'La digestion transforme les aliments en nutriments (glucose, acides aminés...) que le sang peut absorber.' },
      { type: 'vf', q: 'L\'intestin grêle joue un rôle clé dans l\'absorption des nutriments.', answer: 1, explain: 'Vrai ! C\'est surtout au niveau de l\'intestin grêle que les nutriments passent dans le sang.' },
      { type: 'mcq', q: 'Où commence la digestion ?', options: ['Dans la bouche', 'Dans l\'intestin grêle', 'Dans les poumons'], answer: 0, explain: 'La digestion commence dès la bouche, avec la mastication et la salive.' },
    ],
  },
  s3: {
    slides: [
      { emoji: '👀', text: 'Pourquoi as-tu les yeux de ta mère et le nez de ton père ? La génétique a la réponse.', bg: 'linear-gradient(160deg,#059669,#064E3B)', duration: 6000 },
      { emoji: '🧬', text: 'Un gène existe en 2 exemplaires, appelés allèles : un venant de chaque parent.', bg: 'linear-gradient(160deg,#047857,#059669)', duration: 6000 },
      { emoji: '🔑', text: 'Quand un allèle est dominant, c\'est lui qui s\'exprime visiblement, même si l\'autre est présent.', bg: 'linear-gradient(160deg,#064E3B,#047857)', duration: 6000 },
      { emoji: '🤫', text: 'Un caractère vient toujours des DEUX parents, même si un seul allèle se voit à l\'extérieur.', bg: 'linear-gradient(160deg,#059669,#047857)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Un caractère physique vient toujours d\'un seul parent.', answer: 0, explain: 'Faux ! Les deux allèles, un de chaque parent, jouent un rôle — même si un seul s\'exprime visiblement.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Comment s\'appellent les deux exemplaires d\'un même gène ?', options: ['Les allèles', 'Les chromosomes', 'Les cellules'], answer: 0, explain: 'Chaque gène existe en deux exemplaires appelés allèles, un hérité de chaque parent.' },
      { type: 'vf', q: 'Un allèle dominant s\'exprime même en présence d\'un allèle récessif.', answer: 1, explain: 'Vrai ! L\'allèle dominant masque l\'expression visible de l\'allèle récessif.' },
      { type: 'mcq', q: 'D\'où viennent les deux allèles d\'un gène ?', options: ['Un de chaque parent', 'Uniquement de la mère', 'Uniquement du père'], answer: 0, explain: 'Chaque parent transmet un allèle : l\'enfant en reçoit donc un de sa mère et un de son père.' },
    ],
  },
  s4: {
    slides: [
      { emoji: '🌲', text: 'Une forêt, c\'est comme un groupe d\'amis : chacun dépend des autres pour survivre.', bg: 'linear-gradient(160deg,#059669,#064E3B)', duration: 6000 },
      { emoji: '🔗', text: 'Un écosystème, ce sont les êtres vivants + leur milieu + leurs interactions.', bg: 'linear-gradient(160deg,#047857,#059669)', duration: 6000 },
      { emoji: '🍃', text: 'La chaîne alimentaire relie les êtres vivants : qui mange qui, dans quel ordre.', bg: 'linear-gradient(160deg,#064E3B,#047857)', duration: 5000 },
      { emoji: '🔄', text: 'Un écosystème évolue sans cesse, surtout si un seul élément vient à disparaître.', bg: 'linear-gradient(160deg,#059669,#047857)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Un écosystème reste toujours identique dans le temps, sans jamais changer.', answer: 0, explain: 'Faux ! Un écosystème évolue en permanence, surtout si un élément (une espèce, une ressource) disparaît.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Qu\'est-ce qu\'un écosystème ?', options: ['Les êtres vivants, leur milieu et leurs interactions', 'Uniquement les animaux d\'un lieu', 'Uniquement le climat d\'une région'], answer: 0, explain: 'Un écosystème regroupe les êtres vivants, leur environnement, et toutes leurs interactions.' },
      { type: 'vf', q: 'La chaîne alimentaire décrit qui mange qui dans un écosystème.', answer: 1, explain: 'Vrai ! Elle relie les espèces entre elles selon leurs relations d\'alimentation.' },
      { type: 'mcq', q: 'Que se passe-t-il si une espèce disparaît d\'un écosystème ?', options: ['L\'écosystème peut évoluer et se déséquilibrer', 'Rien ne change jamais', 'Toutes les autres espèces disparaissent aussitôt'], answer: 0, explain: 'La disparition d\'une espèce peut déséquilibrer les interactions et faire évoluer tout l\'écosystème.' },
    ],
  },
  p1: {
    slides: [
      { emoji: '📱', text: 'Ton téléphone, la table, l\'air : tout est fait des mêmes briques minuscules, les atomes.', bg: 'linear-gradient(160deg,#0891B2,#164E63)', duration: 6000 },
      { emoji: '⚛️', text: 'Un atome a un noyau (protons + neutrons) et des électrons qui gravitent autour.', bg: 'linear-gradient(160deg,#0E7490,#0891B2)', duration: 6000 },
      { emoji: '🕳️', text: 'Un atome, c\'est surtout du vide : le noyau est minuscule comparé à l\'espace autour.', bg: 'linear-gradient(160deg,#164E63,#0E7490)', duration: 6000 },
      { emoji: '⚖️', text: 'Un atome est électriquement neutre : autant de charges positives que négatives.', bg: 'linear-gradient(160deg,#0891B2,#0E7490)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Un atome est plein, comme une bille sans espace vide à l\'intérieur.', answer: 0, explain: 'Faux ! Un atome est surtout constitué de vide, avec un tout petit noyau au centre.' },
    ],
    quiz: [
      { type: 'mcq', q: 'De quoi est composé le noyau d\'un atome ?', options: ['De protons et de neutrons', 'Uniquement d\'électrons', 'D\'eau et d\'air'], answer: 0, explain: 'Le noyau regroupe les protons et les neutrons, au centre de l\'atome.' },
      { type: 'vf', q: 'Un atome est électriquement neutre.', answer: 1, explain: 'Vrai ! Le nombre de charges positives (protons) équilibre exactement le nombre de charges négatives (électrons).' },
      { type: 'mcq', q: 'Où se trouvent les électrons dans un atome ?', options: ['Ils gravitent autour du noyau', 'Dans le noyau, avec les protons', 'Ils n\'existent pas dans un atome'], answer: 0, explain: 'Les électrons gravitent autour du noyau, dans l\'espace presque vide de l\'atome.' },
    ],
  },
  p2: {
    slides: [
      { emoji: '🎆', text: 'Un feu d\'artifice, c\'est de la chimie qui explose littéralement sous tes yeux.', bg: 'linear-gradient(160deg,#0891B2,#164E63)', duration: 5000 },
      { emoji: '🔄', text: 'Une réaction chimique transforme des réactifs en produits différents.', bg: 'linear-gradient(160deg,#0E7490,#0891B2)', duration: 5000 },
      { emoji: '⚖️', text: 'La masse totale ne change jamais : c\'est la conservation de la matière.', bg: 'linear-gradient(160deg,#164E63,#0E7490)', duration: 6000 },
      { emoji: '🧮', text: 'Il faut équilibrer l\'équation : même nombre d\'atomes de chaque côté !', bg: 'linear-gradient(160deg,#0891B2,#0E7490)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Dans une réaction chimique, la masse totale peut disparaître.', answer: 0, explain: 'Faux ! La masse totale se conserve toujours — rien ne se crée ni ne disparaît, tout se transforme.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Comment s\'appellent les substances de départ dans une réaction chimique ?', options: ['Les réactifs', 'Les produits', 'Les atomes'], answer: 0, explain: 'Les réactifs sont les substances de départ, transformées en produits à la fin de la réaction.' },
      { type: 'vf', q: 'La masse totale se conserve pendant une réaction chimique.', answer: 1, explain: 'Vrai ! C\'est la loi de conservation de la matière : rien ne se perd, tout se transforme.' },
      { type: 'mcq', q: 'Pourquoi doit-on équilibrer une équation chimique ?', options: ['Pour avoir le même nombre d\'atomes de chaque côté', 'Pour que la réaction aille plus vite', 'Pour changer la couleur du produit'], answer: 0, explain: 'Équilibrer l\'équation garantit qu\'aucun atome n\'apparaît ou ne disparaît pendant la réaction.' },
    ],
  },
  p3: {
    slides: [
      { emoji: '🔌', text: 'Ton chargeur qui charge ton téléphone, c\'est des électrons qui filent dans un circuit.', bg: 'linear-gradient(160deg,#0891B2,#164E63)', duration: 6000 },
      { emoji: '⚡', text: 'La tension (en Volts) pousse les électrons ; l\'intensité (en Ampères) mesure leur débit.', bg: 'linear-gradient(160deg,#0E7490,#0891B2)', duration: 6000 },
      { emoji: '🧮', text: 'La loi d\'Ohm relie les trois : U = R × I (tension = résistance × intensité).', bg: 'linear-gradient(160deg,#164E63,#0E7490)', duration: 6000 },
      { emoji: '🚫', text: 'Attention à ne pas confondre tension et intensité : ce ne sont pas la même grandeur !', bg: 'linear-gradient(160deg,#0891B2,#0E7490)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'La tension et l\'intensité sont deux noms différents pour la même grandeur électrique.', answer: 0, explain: 'Faux ! Ce sont deux grandeurs différentes : la tension se mesure en Volts, l\'intensité en Ampères.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quelle est l\'unité de la tension électrique ?', options: ['Le Volt', 'L\'Ampère', 'Le Watt'], answer: 0, explain: 'La tension se mesure en Volts (V), l\'intensité en Ampères (A).' },
      { type: 'vf', q: 'La loi d\'Ohm s\'écrit U = R × I.', answer: 1, explain: 'Vrai ! U (tension) est égale à R (résistance) multipliée par I (intensité).' },
      { type: 'mcq', q: 'Que mesure l\'intensité électrique ?', options: ['Le débit d\'électrons dans le circuit', 'La couleur du courant', 'La longueur du fil'], answer: 0, explain: 'L\'intensité mesure le débit d\'électrons qui circulent dans le circuit, en Ampères.' },
    ],
  },
  p4: {
    slides: [
      { emoji: '🔋', text: 'Rien ne se crée, rien ne se perd. Ton énergie du matin devient ta fatigue du soir.', bg: 'linear-gradient(160deg,#0891B2,#164E63)', duration: 6000 },
      { emoji: '🔄', text: 'L\'énergie ne disparaît jamais : elle se TRANSFORME d\'une forme à une autre.', bg: 'linear-gradient(160deg,#0E7490,#0891B2)', duration: 6000 },
      { emoji: '🏃', text: 'Énergie cinétique (mouvement), thermique (chaleur), électrique... tout se convertit.', bg: 'linear-gradient(160deg,#164E63,#0E7490)', duration: 6000 },
      { emoji: '💡', text: 'Une ampoule transforme l\'énergie électrique en lumière ET en chaleur.', bg: 'linear-gradient(160deg,#0891B2,#0E7490)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'L\'énergie peut totalement disparaître au cours d\'une transformation.', answer: 0, explain: 'Faux ! L\'énergie ne disparaît jamais, elle se transforme seulement en une autre forme.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Que devient l\'énergie au cours d\'une transformation ?', options: ['Elle se transforme en une autre forme', 'Elle disparaît totalement', 'Elle se multiplie sans limite'], answer: 0, explain: 'L\'énergie ne se crée ni ne se perd : elle se transforme seulement d\'une forme à une autre.' },
      { type: 'vf', q: 'Une ampoule transforme uniquement de l\'énergie électrique en lumière, sans aucune perte.', answer: 0, explain: 'Faux ! Une partie de l\'énergie électrique se transforme aussi en chaleur, ce n\'est pas une conversion parfaite.' },
      { type: 'mcq', q: 'Quel type d\'énergie est lié au mouvement d\'un objet ?', options: ['L\'énergie cinétique', 'L\'énergie thermique', 'L\'énergie chimique'], answer: 0, explain: 'L\'énergie cinétique est précisément l\'énergie liée au mouvement d\'un objet.' },
    ],
  },
  a1: {
    slides: [
      { emoji: '☀️', text: 'Le present simple sert à parler d\'habitudes et de vérités générales.', bg: 'linear-gradient(160deg,#4F46E5,#1E1B4B)', duration: 5000 },
      { emoji: '✍️', text: 'I / you / we / they + verbe de base. He / she / it + verbe + S.', bg: 'linear-gradient(160deg,#4338CA,#4F46E5)', duration: 6000 },
      { emoji: '⚠️', text: '\'She like\' n\'existe pas : à la 3e personne du singulier, le S est obligatoire.', bg: 'linear-gradient(160deg,#1E1B4B,#4338CA)', duration: 6000 },
      { emoji: '🗣️', text: '\'She likes music\', \'They play football\' : des habitudes, encore et encore.', bg: 'linear-gradient(160deg,#4F46E5,#4338CA)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'À la 3e personne du singulier (he/she/it), on ajoute un S au verbe au present simple.', answer: 1, explain: 'Vrai ! \'She likes\', \'He plays\' — c\'est LE réflexe à avoir à cette personne.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quelle phrase est correcte ?', options: ['She likes music.', 'She like music.', 'She liking music.'], answer: 0, explain: 'À la 3e personne du singulier, on ajoute toujours un S : \'she likes\'.' },
      { type: 'vf', q: 'Le present simple sert à décrire une action en train de se passer maintenant.', answer: 0, explain: 'Faux ! Ça, c\'est le present continuous. Le present simple décrit des habitudes et des vérités générales.' },
      { type: 'mcq', q: 'Complète : \'They ___ football every Saturday.\'', options: ['play', 'plays', 'played'], answer: 0, explain: 'Avec \'they\' (pluriel), pas de S : \'they play\'.' },
    ],
  },
  a2: {
    slides: [
      { emoji: '🎮', text: 'Raconter ce que t\'as fait ce week-end en anglais ? Past simple, direct.', bg: 'linear-gradient(160deg,#4F46E5,#1E1B4B)', duration: 5000 },
      { emoji: '➕', text: 'Verbes réguliers : on ajoute -ED. \'Play\' devient \'played\'.', bg: 'linear-gradient(160deg,#4338CA,#4F46E5)', duration: 5000 },
      { emoji: '🔀', text: 'Verbes irréguliers : à apprendre par cœur. \'Go\' devient \'went\', pas \'goed\' !', bg: 'linear-gradient(160deg,#1E1B4B,#4338CA)', duration: 6000 },
      { emoji: '📅', text: 'Le past simple s\'utilise pour une action terminée, à un moment précis du passé.', bg: 'linear-gradient(160deg,#4F46E5,#4338CA)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Tous les verbes anglais prennent -ED au past simple.', answer: 0, explain: 'Faux ! Les verbes réguliers prennent -ED, mais les verbes irréguliers ont une forme à apprendre par cœur.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quel est le past simple de \'go\' ?', options: ['went', 'goed', 'gone'], answer: 0, explain: '\'Go\' est un verbe irrégulier : son past simple est \'went\', pas \'goed\'.' },
      { type: 'vf', q: 'Le past simple s\'utilise pour une action encore en cours aujourd\'hui.', answer: 0, explain: 'Faux ! Le past simple décrit une action terminée, à un moment précis et achevé du passé.' },
      { type: 'mcq', q: 'Quel est le past simple de \'play\' (verbe régulier) ?', options: ['played', 'play', 'playing'], answer: 0, explain: 'Les verbes réguliers prennent -ED au past simple : \'play\' devient \'played\'.' },
    ],
  },
  a3: {
    slides: [
      { emoji: '🔑', text: '\'I have lost my keys\' : tu les as perdues et tu les cherches encore, là, maintenant.', bg: 'linear-gradient(160deg,#4F46E5,#1E1B4B)', duration: 6000 },
      { emoji: '🏗️', text: 'Formation : HAVE ou HAS + participe passé du verbe.', bg: 'linear-gradient(160deg,#4338CA,#4F46E5)', duration: 5000 },
      { emoji: '🔗', text: 'On l\'utilise pour une action passée qui a un LIEN avec le présent.', bg: 'linear-gradient(160deg,#1E1B4B,#4338CA)', duration: 5000 },
      { emoji: '🚫', text: 'Avec une date précise (\'yesterday\'), c\'est le past simple qu\'il faut, pas le present perfect !', bg: 'linear-gradient(160deg,#4F46E5,#4338CA)', duration: 6000 },
    ],
    checkpoint: [
      { type: 'vf', q: 'Le present perfect se forme avec HAVE/HAS suivi du participe passé.', answer: 1, explain: 'Vrai ! \'I have lost\', \'She has finished\' — toujours HAVE ou HAS + participe passé.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Comment se forme le present perfect ?', options: ['HAVE/HAS + participe passé', 'BE + verbe + ING', 'Verbe + ED uniquement'], answer: 0, explain: 'Le present perfect se forme toujours avec HAVE ou HAS suivi du participe passé du verbe.' },
      { type: 'vf', q: 'On utilise le present perfect avec une date précise comme \'yesterday\'.', answer: 0, explain: 'Faux ! Avec une date précise comme \'yesterday\', on utilise le past simple, pas le present perfect.' },
      { type: 'mcq', q: 'Pourquoi utilise-t-on le present perfect pour \'I have lost my keys\' ?', options: ['Parce que l\'action passée a un lien avec le présent (je les cherche encore)', 'Parce que c\'est une habitude', 'Parce que l\'action se passe dans le futur'], answer: 0, explain: 'Le present perfect marque un lien direct avec le présent : les clés sont toujours perdues maintenant.' },
    ],
  },
  a4: {
    slides: [
      { emoji: '🗣️', text: 'Donner un conseil à ton pote sans sonner comme sa mère ? \'Should\' fait le taf.', bg: 'linear-gradient(160deg,#4F46E5,#1E1B4B)', duration: 6000 },
      { emoji: '💡', text: 'SHOULD = un conseil. \'You should sleep more\' : c\'est juste une suggestion.', bg: 'linear-gradient(160deg,#4338CA,#4F46E5)', duration: 6000 },
      { emoji: '🚨', text: 'MUST = une obligation forte. \'You must wear a seatbelt\' : pas le choix.', bg: 'linear-gradient(160deg,#1E1B4B,#4338CA)', duration: 6000 },
      { emoji: '🎯', text: 'CAN / COULD = une capacité ou une permission. \'You can go now\'.', bg: 'linear-gradient(160deg,#4F46E5,#4338CA)', duration: 5000 },
    ],
    checkpoint: [
      { type: 'vf', q: '\'Must\' et \'should\' expriment exactement le même niveau d\'obligation.', answer: 0, explain: 'Faux ! \'Must\' exprime une obligation forte, \'should\' n\'est qu\'un conseil — le niveau de pression est différent.' },
    ],
    quiz: [
      { type: 'mcq', q: 'Quel modal utilise-t-on pour donner un simple conseil ?', options: ['Should', 'Must', 'Can'], answer: 0, explain: '\'Should\' exprime un conseil, une suggestion — pas une obligation stricte comme \'must\'.' },
      { type: 'vf', q: '\'Can\' peut exprimer une capacité ou une permission.', answer: 1, explain: 'Vrai ! \'I can swim\' (capacité) ou \'You can go\' (permission) — \'can\' a ces deux usages.' },
      { type: 'mcq', q: 'Quelle phrase exprime une obligation forte ?', options: ['You must wear a seatbelt.', 'You should wear a seatbelt.', 'You could wear a seatbelt.'], answer: 0, explain: '\'Must\' exprime une obligation forte, presque une règle incontournable, contrairement à \'should\' ou \'could\'.' },
    ],
  },
};

export const LESSON_INTRO: Record<string, import('./types').LessonIntro> = {
  m1: {
    hook: 'Partager une pizza entre potes sans embrouille ? C\'est déjà des fractions.',
    cheatCode: 'Numérateur en haut, dénominateur en bas. Pour simplifier, tu divises les deux par le même nombre.',
    piege: 'Additionner les dénominateurs entre eux. Non ! On met au même dénominateur avant d\'additionner.',
  },
  m2: {
    hook: 'Ton prof veut savoir si l\'angle d\'un mur est droit sans équerre géante ? Pythagore répond.',
    cheatCode: 'Dans un triangle rectangle : a² + b² = c² (c = l\'hypoténuse, le côté le plus long).',
    piege: 'Utiliser Pythagore sur un triangle qui n\'est pas rectangle. Vérifie toujours l\'angle droit avant.',
  },
  m3: {
    hook: 'Trouver combien de V-Bucks il te manque sans compter à la main ? Une équation fait le calcul pour toi.',
    cheatCode: 'Une équation, c\'est une balance : ce que tu fais d\'un côté, tu le fais de l\'autre. Toujours.',
    piege: 'Changer un côté sans toucher l\'autre. La balance bascule et ta réponse est fausse.',
  },
  m4: {
    hook: 'Calculer le prix d\'une commande livraison selon le nombre d\'articles ? Fonction affine direct.',
    cheatCode: 'f(x) = ax + b. "a" c\'est la pente, "b" le point de départ (quand x = 0).',
    piege: 'Confondre "a" et "b". Le "b" c\'est l\'ordonnée à l\'origine, pas la pente.',
  },
  m5: {
    hook: 'Savoir quel jeu la classe préfère sans demander à chacun ? Les stats font le tri.',
    cheatCode: 'Moyenne = somme des valeurs ÷ nombre de valeurs. La médiane, c\'est la valeur du milieu triée.',
    piege: 'Confondre moyenne et médiane. Une valeur extrême fausse la moyenne, pas la médiane.',
  },
  f1: {
    hook: 'Tu binges une série et tu devines la suite ? T\'as déjà le réflexe du roman.',
    cheatCode: 'Un récit = narrateur + personnages + intrigue. Repère qui raconte et à quel temps.',
    piege: 'Confondre l\'auteur et le narrateur. Ce sont presque toujours deux personnes différentes.',
  },
  f2: {
    hook: 'La poésie c\'est 3 points gratos au contrôle, viens on plie ça !',
    cheatCode: 'Un alexandrin = 12 syllabes, un décasyllabe = 10. Compte les syllabes, pas les mots.',
    piege: 'Oublier le "e" muet en fin de vers avant une consonne : il compte dans le décompte des syllabes.',
  },
  f3: {
    hook: 'Une scène de dispute filmée façon TikTok ? Au théâtre, ça s\'appelle une réplique.',
    cheatCode: 'Didascalies = indications de mise en scène (en italique). Répliques = ce que disent les personnages.',
    piege: 'Croire que les didascalies sont dites à voix haute par les acteurs. Elles sont juste lues, pas jouées.',
  },
  f4: {
    hook: 'Convaincre tes parents de reculer l\'heure du couvre-feu ? C\'est de l\'argumentation pure.',
    cheatCode: 'Thèse = ton avis. Argument = pourquoi. Exemple = la preuve concrète. Les 3 dans l\'ordre.',
    piege: 'Donner un exemple sans argument derrière. Un exemple seul ne prouve rien.',
  },
  h1: {
    hook: 'Une bande de citoyens qui gerbent leur roi ? C\'est le season finale de 1789.',
    cheatCode: 'Prise de la Bastille (14 juillet 1789) = début. Déclaration des droits de l\'homme = août 1789.',
    piege: 'Confondre la prise de la Bastille avec l\'exécution de Louis XVI (1793, 4 ans plus tard).',
  },
  h2: {
    hook: 'Un mec devient empereur juste après une révolution anti-rois ? Contradiction ? Bienvenue chez Napoléon.',
    cheatCode: 'Napoléon = général devenu empereur en 1804. Il garde certaines idées de la Révolution (Code civil).',
    piege: 'Croire que Napoléon a annulé toute la Révolution. Il en garde une bonne partie, il la verrouille.',
  },
  h3: {
    hook: 'République, monarchie, dictature... c\'est juste des règles du jeu différentes pour diriger un pays.',
    cheatCode: 'République = pouvoir élu. Monarchie = pouvoir héréditaire. Dictature = pouvoir sans contre-pouvoir.',
    piege: 'Croire qu\'une élection suffit à faire une démocratie. Il faut aussi la liberté de la contester.',
  },
  h4: {
    hook: 'Tes sneakers fabriquées en Asie et vendues en France ? Bienvenue dans la mondialisation.',
    cheatCode: 'Mondialisation = mise en réseau des échanges (biens, capitaux, infos) à l\'échelle mondiale.',
    piege: 'Croire que la mondialisation profite pareil à tout le monde. Elle crée aussi des inégalités.',
  },
  s1: {
    hook: 'Pourquoi t\'es essoufflé après un sprint ? Ton corps réclame plus d\'oxygène.',
    cheatCode: 'Respiration = O₂ inspiré, CO₂ expiré. Les poumons échangent ces gaz avec le sang.',
    piege: 'Confondre respiration et digestion. La respiration, c\'est l\'échange de gaz, pas la nourriture.',
  },
  s2: {
    hook: 'Ton kebab de midi devient de l\'énergie pour réviser ce soir ? Merci la digestion.',
    cheatCode: 'La digestion transforme les aliments en nutriments absorbés par l\'intestin grêle vers le sang.',
    piege: 'Croire que la digestion se fait que dans l\'estomac. Ça continue surtout dans l\'intestin.',
  },
  s3: {
    hook: 'Pourquoi t\'as les yeux de ta mère et le nez de ton père ? La génétique a la réponse.',
    cheatCode: 'Un gène vient en 2 exemplaires (allèles), un de chaque parent. Le dominant s\'exprime en premier.',
    piege: 'Croire qu\'un caractère vient d\'un seul parent. Les deux allèles jouent, même si un seul se voit.',
  },
  s4: {
    hook: 'Une forêt, c\'est un peu comme un groupe d\'amis : chacun dépend des autres pour survivre.',
    cheatCode: 'Écosystème = êtres vivants + milieu + leurs interactions (chaînes alimentaires, ressources).',
    piege: 'Penser qu\'un écosystème ne change jamais. Il évolue sans cesse, surtout si un élément disparaît.',
  },
  p1: {
    hook: 'Ton téléphone, la table, l\'air : tout est fait des mêmes briques minuscules.',
    cheatCode: 'Atome = noyau (protons + neutrons) + électrons qui tournent autour. Il est électriquement neutre.',
    piege: 'Croire qu\'un atome, c\'est plein comme une bille. C\'est surtout du vide autour du noyau.',
  },
  p2: {
    hook: 'Un feu d\'artifice, c\'est de la chimie qui explose littéralement sous tes yeux.',
    cheatCode: 'Réactifs → Produits. La masse totale ne change jamais (conservation de la matière).',
    piege: 'Oublier d\'équilibrer l\'équation chimique. Il doit y avoir le même nombre d\'atomes de chaque côté.',
  },
  p3: {
    hook: 'Ton chargeur qui charge ton tel, c\'est des électrons qui filent dans un circuit.',
    cheatCode: 'U = R × I (tension = résistance × intensité). C\'est la loi d\'Ohm, retiens juste ces 3 lettres.',
    piege: 'Confondre tension (Volts) et intensité (Ampères). Ce ne sont pas la même grandeur.',
  },
  p4: {
    hook: 'Rien ne se crée, rien ne se perd. Ton énergie du matin devient ta fatigue du soir.',
    cheatCode: 'L\'énergie se transforme (électrique, mécanique, thermique...) mais ne disparaît jamais.',
    piege: 'Croire que l\'énergie se "consomme" et disparaît. Elle se transforme juste en autre chose.',
  },
  a1: {
    hook: 'Décrire ta routine du matin en anglais sans te planter ? Present simple à la rescousse.',
    cheatCode: 'I/you/we/they + verbe. He/she/it + verbe + S. "She likes" pas "she like".',
    piege: 'Oublier le S à la 3e personne du singulier. C\'est LE piège classique du present simple.',
  },
  a2: {
    hook: 'Raconter ce que t\'as fait ce week-end en anglais ? Past simple, direct.',
    cheatCode: 'Verbes réguliers + ED (played). Verbes irréguliers à apprendre par cœur (go → went).',
    piege: 'Ajouter ED à un verbe irrégulier. "Goed" n\'existe pas, c\'est "went".',
  },
  a3: {
    hook: '"I have lost my keys" : tu les as perdues et tu les cherches encore là maintenant.',
    cheatCode: 'HAVE/HAS + participe passé. Utilisé quand le passé a un lien direct avec le présent.',
    piege: 'Utiliser le present perfect pour une date précise ("yesterday"). Là, c\'est le past simple qu\'il faut.',
  },
  a4: {
    hook: 'Donner un conseil à ton pote sans sonner comme sa mère ? "Should" fait le taf.',
    cheatCode: 'Should = conseil. Must = obligation forte. Can/could = capacité ou permission.',
    piege: 'Confondre "must" (obligatoire) et "should" (juste un conseil). Le niveau de pression n\'est pas le même.',
  },
};

export const AUDIO_TRANSCRIPTS: Record<string, string> = {
  m3: 'Salut, c\'est Braise ! Aujourd\'hui on parle des équations. Imagine une balance en équilibre. Des deux côtés de la balance, tu as le même poids. C\'est ça, une équation : deux expressions égales. Le but du jeu, c\'est de trouver la valeur de x. Pour ça, tu isoles x d\'un côté. Par exemple, 2x plus 3 égale 11. Tu enlèves 3 des deux côtés, il reste 2x égale 8. Tu divises par 2, et bam : x égale 4. La règle d\'or : ce que tu fais d\'un côté, tu le fais de l\'autre. Toujours. Allez, t\'as compris le principe, maintenant c\'est à toi de jouer !',
  m1: 'Salut, c\'est Braise ! Aujourd\'hui, les fractions. Imagine une pizza coupée en parts égales. Le dénominateur, c\'est le nombre total de parts, le numérateur, c\'est combien de parts tu prends. 3/4, c\'est 3 parts sur 4. Pour simplifier une fraction, tu divises le numérateur et le dénominateur par le même nombre : 6/8 divisé par 2 des deux côtés, ça donne 3/4, exactement la même quantité, juste écrite plus simplement. Le piège classique : additionner deux fractions sans les mettre au même dénominateur avant. Toujours vérifier que le bas est identique avant d\'additionner le haut. Allez, à toi de jouer !',
  m2: 'Salut, c\'est Braise ! Le théorème de Pythagore, c\'est LA règle à connaître pour les triangles rectangles. Dans un triangle avec un angle droit, le côté le plus long, en face de cet angle droit, s\'appelle l\'hypoténuse. La règle : le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés, donc a² plus b² égale c². Par exemple, avec des côtés de 3 et 4 : 3² plus 4² égale 9 plus 16, soit 25, et la racine carrée de 25, c\'est 5. Cette hypoténuse vaut donc 5. Le piège : vérifier d\'abord que le triangle a bien un angle droit, sinon la formule ne marche pas du tout. À toi de calculer maintenant !',
  m4: 'Salut, c\'est Braise ! Les fonctions affines, ça s\'écrit f(x) égale a x plus b. Le \'a\', c\'est la pente : il te dit à quelle vitesse la droite monte ou descend. Le \'b\', c\'est l\'ordonnée à l\'origine, la valeur de départ, quand x vaut 0. Imagine un taxi qui facture 2 euros de prise en charge, puis 1 euro par kilomètre parcouru : la formule, c\'est f(x) égale 1 fois x, plus 2. C\'est une fonction affine toute simple. Le piège classique, c\'est de confondre \'a\' et \'b\' : rappelle-toi, \'a\' bouge avec x, \'b\' est fixe. Allez, à toi de calculer quelques valeurs !',
  m5: 'Salut, c\'est Braise ! Les statistiques, ça sert à résumer plein de valeurs en quelques nombres. La moyenne, tu la connais : tu additionnes tout, puis tu divises par le nombre de valeurs. La médiane, c\'est différent : tu ranges toutes les valeurs dans l\'ordre, et tu prends celle qui est exactement au milieu. Le piège à connaître : si une valeur est beaucoup trop grande ou trop petite par rapport aux autres, elle fausse complètement la moyenne, alors que la médiane, elle, ne bouge presque pas. C\'est pour ça qu\'en vrai, les journalistes préfèrent souvent parler de salaire médian plutôt que de salaire moyen. À toi de t\'entraîner !',
  f1: 'Salut, c\'est Braise ! Le roman et le récit, c\'est la base de toute histoire. Trois ingrédients : un narrateur, qui raconte ; des personnages, qui vivent l\'histoire ; et une intrigue, l\'enchaînement des événements. Attention au piège classique : le narrateur n\'est presque jamais l\'auteur lui-même, c\'est une voix inventée pour raconter. Niveau temps, le récit utilise souvent l\'imparfait pour poser le décor, et le passé simple pour les actions précises qui font avancer l\'histoire. Tu vois, si tu binges une série et que tu devines déjà la suite, c\'est que t\'as capté le réflexe du roman : suivre les personnages et anticiper l\'intrigue. À toi de jouer !',
  f2: 'Salut, c\'est Braise ! La poésie, c\'est trois points gratos au contrôle si tu connais le vocabulaire. Un vers, c\'est une seule ligne de poème. Plusieurs vers regroupés forment une strophe. Pour compter les syllabes : l\'alexandrin en a 12, le décasyllabe en a 10. Piège classique : le \'e\' muet à la fin d\'un mot compte dans le décompte des syllabes s\'il est suivi d\'une consonne. Et les rimes, ce sont les sons qui se répètent à la fin des vers, elles donnent sa musique au texte. Allez, compte quelques syllabes pour t\'entraîner !',
  f3: 'Salut, c\'est Braise ! Une scène de dispute filmée façon TikTok ? Au théâtre, ça s\'appelle une réplique. Le théâtre, c\'est un texte fait pour être joué. Deux éléments à distinguer absolument : les didascalies, écrites en italique, qui indiquent la mise en scène — gestes, décor, ton — et qui ne sont jamais prononcées sur scène ; et les répliques, le texte que les personnages disent vraiment à voix haute. Le piège classique, c\'est de croire que les didascalies sont dites par les acteurs : non, elles sont juste lues pour comprendre comment jouer la scène. Et question genre, la comédie fait rire, la tragédie est dramatique. À toi de repérer la différence !',
  f4: 'Salut, c\'est Braise ! Convaincre tes parents de reculer l\'heure du couvre-feu, c\'est de l\'argumentation pure. La méthode tient en trois étapes, toujours dans le même ordre. D\'abord la thèse : ton avis, ce que tu défends. Ensuite l\'argument : la raison pour laquelle tu penses ça. Enfin l\'exemple : la preuve concrète qui illustre ton argument. Le piège classique, c\'est de donner un exemple tout seul, sans argument derrière : un exemple isolé ne prouve rien du tout, il doit toujours venir illustrer une idée déjà posée. Thèse, argument, exemple : à toi de construire ton raisonnement !',
  h1: 'Salut, c\'est Braise ! Une bande de citoyens qui renversent leur roi ? C\'est le grand final de 1789. La France est alors en pleine crise financière et sociale. Le 14 juillet 1789, le peuple de Paris prend la Bastille, symbole de l\'autorité royale : c\'est le début officiel de la Révolution française. Quelques semaines plus tard, en août 1789, la Déclaration des droits de l\'homme proclame liberté et égalité pour tous. Attention au piège classique : ne confonds pas la prise de la Bastille avec l\'exécution du roi Louis XVI, qui a lieu en 1793, soit quatre ans plus tard. Deux dates, deux événements bien distincts. À toi de retenir tout ça !',
  h2: 'Salut, c\'est Braise ! Un mec devient empereur juste après une révolution anti-rois ? Contradiction, non ? Bienvenue chez Napoléon. Napoléon Bonaparte est d\'abord un général qui s\'impose progressivement après la Révolution française. En 1804, il se fait sacrer Empereur des Français. Mais attention, il ne jette pas tout à la poubelle : il garde et verrouille certaines idées de la Révolution, notamment avec le Code civil, un texte qui organise le droit et qui influence encore la France aujourd\'hui. Le piège à éviter : croire que Napoléon a annulé toute la Révolution — en réalité, il en garde une bonne partie, tout en concentrant le pouvoir entre ses mains. À toi de retenir l\'essentiel !',
  h3: 'Salut, c\'est Braise ! République, monarchie, dictature... ce sont juste des règles du jeu différentes pour diriger un pays. Dans une république, le pouvoir vient d\'élections : les citoyens votent pour désigner leurs dirigeants. Dans une monarchie, le pouvoir se transmet par hérédité, au sein d\'une même famille, de génération en génération. Et dans une dictature, le pouvoir n\'a aucun contre-pouvoir réel : pas de liberté de contester, pas de médias vraiment libres. Le piège classique, c\'est de croire qu\'une simple élection suffit à faire une démocratie : il faut aussi la liberté de la contester après. À toi de faire la différence entre ces régimes !',
  h4: 'Salut, c\'est Braise ! Tes sneakers fabriquées en Asie et vendues en France ? Bienvenue dans la mondialisation. La mondialisation, c\'est la mise en réseau des échanges à l\'échelle mondiale : les biens, comme les vêtements ou l\'électronique, mais aussi les capitaux et les informations qui circulent d\'un bout à l\'autre de la planète en quelques secondes. Chaque jour, des cargos transportent des marchandises entre les continents grâce au commerce international. Le piège à éviter : croire que ça profite pareil à tout le monde. En réalité, la mondialisation crée aussi des inégalités entre les territoires, certains en profitant bien plus que d\'autres. À toi d\'explorer ces échanges mondiaux !',
  s1: 'Salut, c\'est Braise ! Pourquoi t\'es essoufflé après un sprint ? Ton corps réclame plus d\'oxygène. La respiration, c\'est l\'échange de gaz entre l\'air que tu respires et ton sang : tu inspires du dioxygène, ou O₂, et tu expires du dioxyde de carbone, le CO₂. Cet échange se passe précisément dans les alvéoles pulmonaires, tout au fond de tes poumons, là où l\'air entre en contact direct avec les vaisseaux sanguins. Le piège classique, c\'est de confondre respiration et digestion : la respiration, c\'est l\'échange de gaz, pas la transformation de la nourriture. Plus tu bouges, plus tes muscles réclament de l\'oxygène, et plus ta respiration s\'accélère. À toi de retenir le mécanisme !',
  s2: 'Salut, c\'est Braise ! Ton kebab de midi devient de l\'énergie pour réviser ce soir ? Merci la digestion. Tout commence dans la bouche, où les aliments sont mâchés et mélangés à la salive. Ça continue dans l\'estomac, puis surtout dans l\'intestin grêle, où les aliments transformés en nutriments passent enfin dans le sang pour nourrir tout ton corps. Le piège classique, c\'est de croire que tout se joue dans l\'estomac : en réalité, la majorité de l\'absorption des nutriments se fait plus loin, dans l\'intestin grêle. Sans cette étape, impossible de transformer ton repas en énergie utilisable. À toi de retracer le chemin des aliments !',
  s3: 'Salut, c\'est Braise ! Pourquoi t\'as les yeux de ta mère et le nez de ton père ? La génétique a la réponse. Chaque gène vient en deux exemplaires, appelés allèles : un allèle transmis par ta mère, un autre transmis par ton père. Quand un allèle est dominant, c\'est lui qui s\'exprime visiblement, même si l\'autre allèle, dit récessif, est bien présent mais reste caché. Le piège classique, c\'est de croire qu\'un caractère vient d\'un seul parent : en réalité, les deux allèles jouent un rôle dans ton patrimoine génétique, même si un seul se voit de l\'extérieur. À toi d\'explorer l\'hérédité !',
  s4: 'Salut, c\'est Braise ! Une forêt, c\'est un peu comme un groupe d\'amis : chacun dépend des autres pour survivre. Un écosystème, c\'est exactement ça : les êtres vivants d\'un lieu, leur milieu, et toutes les interactions entre eux, comme les chaînes alimentaires qui relient qui mange qui. Le piège classique, c\'est de penser qu\'un écosystème reste figé pour toujours : en réalité, il évolue sans cesse, et encore plus vite si un seul élément, une espèce ou une ressource, vient à disparaître. Tout est connecté, un peu comme dans un vrai groupe d\'amis. À toi d\'explorer ces équilibres fragiles !',
  p1: 'Salut, c\'est Braise ! Ton téléphone, la table, l\'air que tu respires : tout est fait des mêmes briques minuscules, les atomes. Chaque atome a un noyau, composé de protons et de neutrons, et des électrons qui gravitent tout autour, un peu comme des planètes autour d\'un soleil. Le piège classique, c\'est de croire qu\'un atome est plein comme une bille : en réalité, c\'est surtout du vide, avec un tout petit noyau au centre. Et détail important, un atome est électriquement neutre : il a exactement autant de charges positives que de charges négatives. À toi d\'explorer l\'infiniment petit !',
  p2: 'Salut, c\'est Braise ! Un feu d\'artifice, c\'est de la chimie qui explose littéralement sous tes yeux. Une réaction chimique transforme des réactifs, les substances de départ, en produits différents. Mais attention, la masse totale ne change jamais : rien ne se crée, rien ne disparaît vraiment, tout se transforme, c\'est la conservation de la matière. Le piège classique en exercice, c\'est d\'oublier d\'équilibrer l\'équation chimique : il doit toujours y avoir exactement le même nombre d\'atomes de chaque côté de la flèche. À toi d\'équilibrer tes premières équations !',
  p3: 'Salut, c\'est Braise ! Ton chargeur qui recharge ton téléphone, c\'est en fait des électrons qui filent à toute vitesse dans un circuit électrique. La tension, mesurée en Volts, c\'est ce qui pousse ces électrons à circuler. L\'intensité, mesurée en Ampères, c\'est le débit de ces électrons, un peu comme le débit d\'eau dans un tuyau. Ces deux grandeurs sont reliées par la loi d\'Ohm : U égale R fois I, la tension égale la résistance multipliée par l\'intensité. Le piège classique, c\'est de confondre tension et intensité : ce sont deux grandeurs bien différentes, retiens juste ces trois lettres, U, R, I. À toi de calculer !',
  p4: 'Salut, c\'est Braise ! Rien ne se crée, rien ne se perd : ton énergie du matin devient littéralement ta fatigue du soir. L\'énergie ne disparaît jamais, elle se transforme seulement d\'une forme à une autre : énergie cinétique quand tu bouges, énergie thermique quand ça chauffe, énergie électrique dans tes appareils. Prends une ampoule : elle transforme l\'énergie électrique en lumière, mais aussi en chaleur, ce n\'est jamais une conversion parfaite. Le piège classique, c\'est de croire que l\'énergie se consomme et disparaît : en réalité, elle se transforme juste en autre chose, parfois en chaleur qu\'on ne voit pas. À toi de repérer ces transformations !',
  a1: 'Salut, c\'est Braise ! Décrire ta routine du matin en anglais sans te planter ? Present simple à la rescousse. La règle est simple : avec I, you, we, they, tu utilises le verbe tout simple, sans rien ajouter. Mais avec he, she ou it, tu dois ajouter un S à la fin du verbe : \'she likes\', \'he plays\'. Le piège numéro un, LE piège classique du present simple, c\'est d\'oublier ce S à la troisième personne du singulier. \'She like\' n\'existe pas en anglais correct, c\'est toujours \'she likes\'. Ce temps sert à parler d\'habitudes et de vérités générales, pas d\'une action en cours. À toi de conjuguer !',
  a2: 'Salut, c\'est Braise ! Raconter ce que t\'as fait ce week-end en anglais ? Past simple, direct. Pour les verbes réguliers, c\'est facile : tu ajoutes -ED à la fin, \'play\' devient \'played\'. Mais attention, les verbes irréguliers, eux, changent complètement de forme et il faut les apprendre par cœur : \'go\' devient \'went\', jamais \'goed\', ce mot n\'existe pas. Le piège classique, justement, c\'est d\'ajouter -ED à un verbe irrégulier par réflexe. Le past simple s\'utilise pour une action terminée, à un moment précis et achevé du passé, pas pour quelque chose qui continue aujourd\'hui. À toi de conjuguer tes verbes !',
  a3: 'Salut, c\'est Braise ! \'I have lost my keys\' : tu les as perdues et tu les cherches encore, là, maintenant. C\'est exactement à ça que sert le present perfect. Il se forme avec HAVE ou HAS, suivi du participe passé du verbe. On l\'utilise quand une action passée a un lien direct avec le présent, contrairement au past simple qui parle d\'une action complètement terminée et coupée du présent. Le piège classique, c\'est d\'utiliser le present perfect avec une date précise comme \'yesterday\' : dans ce cas-là, c\'est le past simple qu\'il faut utiliser, pas le present perfect. À toi de repérer le bon contexte !',
  a4: 'Salut, c\'est Braise ! Donner un conseil à ton pote sans sonner comme sa mère ? \'Should\' fait le taf. \'You should sleep more\', c\'est juste une suggestion amicale, pas un ordre. \'Must\', lui, exprime une obligation beaucoup plus forte : \'you must wear a seatbelt\', là, t\'as vraiment pas le choix. Et \'can\' ou \'could\' expriment une capacité ou une permission, comme \'you can go now\'. Le piège classique, c\'est de confondre \'must\', l\'obligation stricte, et \'should\', le simple conseil : le niveau de pression n\'est vraiment pas le même. À toi de choisir le bon modal !',
};
