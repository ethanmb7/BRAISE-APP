import type { Level, Subject, Flashcard, Badge, UserProfile } from './types';

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
    color: '#2F5FE3',
    bg: '#EAF1FF',
    chapters: [
      { id: 'm1', title: 'Les fractions', status: 'done', mastery: 92, duration: 3 },
      { id: 'm2', title: 'Théorème de Pythagore', status: 'done', mastery: 78, duration: 4 },
      { id: 'm3', title: 'Les équations', status: 'current', mastery: 35, reinforce: true, duration: 3 },
      { id: 'm4', title: 'Fonctions affines', status: 'locked', mastery: 0, duration: 5 },
      { id: 'm5', title: 'Statistiques', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'francais',
    name: 'Français',
    emoji: '📖',
    color: '#FF6F59',
    bg: '#FFE8E4',
    chapters: [
      { id: 'f1', title: 'Le roman et le récit', status: 'done', mastery: 88, duration: 5 },
      { id: 'f2', title: 'La poésie', status: 'current', mastery: 45, duration: 3 },
      { id: 'f3', title: 'Le théâtre', status: 'locked', mastery: 0, duration: 4 },
      { id: 'f4', title: 'L\'argumentation', status: 'locked', mastery: 0, duration: 5 },
    ],
  },
  {
    id: 'histoire-geo',
    name: 'Histoire-Géo',
    emoji: '🌍',
    color: '#2FBE9F',
    bg: '#E0F7F1',
    chapters: [
      { id: 'h1', title: 'La Révolution française', status: 'done', mastery: 84, duration: 4 },
      { id: 'h2', title: 'L\'Empire et Napoléon', status: 'current', mastery: 30, duration: 5 },
      { id: 'h3', title: 'Les régimes politiques', status: 'locked', mastery: 0, duration: 3 },
      { id: 'h4', title: 'La mondialisation', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'svt',
    name: 'SVT',
    emoji: '🔬',
    color: '#8B6BE0',
    bg: '#EFE8FB',
    chapters: [
      { id: 's1', title: 'La respiration', status: 'done', mastery: 90, duration: 3 },
      { id: 's2', title: 'La digestion', status: 'done', mastery: 72, duration: 4 },
      { id: 's3', title: 'La génétique', status: 'current', mastery: 20, skip: true, duration: 5 },
      { id: 's4', title: 'L\'écosystème', status: 'locked', mastery: 0, duration: 3 },
    ],
  },
  {
    id: 'physique',
    name: 'Physique-Chimie',
    emoji: '⚗️',
    color: '#FFC24B',
    bg: '#FFF4D9',
    chapters: [
      { id: 'p1', title: 'L\'atome et la matière', status: 'done', mastery: 85, duration: 4 },
      { id: 'p2', title: 'Les réactions chimiques', status: 'current', mastery: 40, reinforce: true, duration: 5 },
      { id: 'p3', title: 'L\'électricité', status: 'locked', mastery: 0, duration: 3 },
      { id: 'p4', title: 'L\'énergie', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
  {
    id: 'anglais',
    name: 'Anglais',
    emoji: '🇬🇧',
    color: '#2F5FE3',
    bg: '#EAF1FF',
    chapters: [
      { id: 'a1', title: 'Present simple', status: 'done', mastery: 95, duration: 3 },
      { id: 'a2', title: 'Past simple', status: 'done', mastery: 80, duration: 3 },
      { id: 'a3', title: 'Present perfect', status: 'current', mastery: 25, duration: 4 },
      { id: 'a4', title: 'Modals & advice', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
];

export const FLASHCARDS: Flashcard[] = [
  { id: 'fc1', q: 'Comment calcule-t-on l\'hypoténuse d\'un triangle rectangle ?', a: 'Avec le théorème de Pythagore : le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés. a² + b² = c²', subject: 'maths', topic: 'Pythagore', level: 'medium' },
  { id: 'fc2', q: 'Qu\'est-ce qu\'une fraction irréductible ?', a: 'Une fraction qu\'on ne peut plus simplifier : le numérateur et le dénominateur n\'ont plus de diviseur commun (autre que 1).', subject: 'maths', topic: 'Fractions', level: 'easy' },
  { id: 'fc3', q: 'Comment résoudre l\'équation 2x + 3 = 11 ?', a: 'On isole x : 2x = 11 - 3 = 8, donc x = 8 ÷ 2 = 4.', subject: 'maths', topic: 'Équations', level: 'medium' },
  { id: 'fc4', q: 'Qu\'est-ce qu\'un vers en poésie ?', a: 'Une ligne de poème. Un alexandrin a 12 syllabes, un décasyllabe en a 10.', subject: 'francais', topic: 'Poésie', level: 'easy' },
  { id: 'fc5', q: 'Quelle est la date de prise de la Bastille ?', a: 'Le 14 juillet 1789, événement symbolique du début de la Révolution française.', subject: 'histoire-geo', topic: 'Révolution', level: 'easy' },
  { id: 'fc6', q: 'Qu\'est-ce que la photosynthèse ?', a: 'Le processus par lequel les plantes fabriquent leur nourriture (glucose) à partir de lumière, d\'eau et de CO₂.', subject: 'svt', topic: 'Plantes', level: 'medium' },
  { id: 'fc7', q: 'Qu\'est-ce qu\'un atome ?', a: 'La plus petite particule de matière. Il est composé d\'un noyau (protons + neutrons) et d\'électrons qui gravitent autour.', subject: 'physique', topic: 'Atome', level: 'easy' },
  { id: 'fc8', q: 'Quand utilise-t-on le present perfect en anglais ?', a: 'Pour une action passée qui a un lien avec le présent : "I have lost my keys" (je les ai perdues et je les cherche encore).', subject: 'anglais', topic: 'Present perfect', level: 'hard' },
];

export const BADGES: Badge[] = [
  { id: 'b1', emoji: '🔥', name: '3 jours', cond: 'Série de 3', unlocked: true },
  { id: 'b2', emoji: '⚡', name: '100 XP', cond: '100 XP gagnés', unlocked: true },
  { id: 'b3', emoji: '📚', name: 'Premier chapitre', cond: '1 chapitre fini', unlocked: true },
  { id: 'b4', emoji: '🧊', name: 'Gel utilisé', cond: 'Utiliser un gel', unlocked: false },
  { id: 'b5', emoji: '🌟', name: '7 jours', cond: 'Série de 7', unlocked: false },
  { id: 'b6', emoji: '🏆', name: '1000 XP', cond: '1000 XP gagnés', unlocked: false },
];

export const DEFAULT_USER: UserProfile = {
  name: 'Alex',
  level: '3e',
  levelLabel: '3ème',
  goal: '30 min/jour',
  subjects: ['maths', 'francais', 'histoire-geo', 'svt'],
  avatar: '🦊',
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
      { type: 'vf', q: 'Dans une équation, on peut faire ce qu\'on veut d\'un côté sans toucher l\'autre.', answer: 1, explain: 'Faux ! L\'équation est une balance : toute opération d\'un côté doit être reproduite de l\'autre.' },
      { type: 'mcq', q: 'Résous : 3x = 21', options: ['x = 7', 'x = 18', 'x = 24'], answer: 0, explain: 'On divise les deux côtés par 3 : x = 21 ÷ 3 = 7.' },
    ],
  },
};

export const AUDIO_TRANSCRIPTS: Record<string, string> = {
  m3: 'Salut, c\'est Braise ! Aujourd\'hui on parle des équations. Imagine une balance en équilibre. Des deux côtés de la balance, tu as le même poids. C\'est ça, une équation : deux expressions égales. Le but du jeu, c\'est de trouver la valeur de x. Pour ça, tu isoles x d\'un côté. Par exemple, 2x plus 3 égale 11. Tu enlèves 3 des deux côtés, il reste 2x égale 8. Tu divises par 2, et bam : x égale 4. La règle d\'or : ce que tu fais d\'un côté, tu le fais de l\'autre. Toujours. Allez, t\'as compris le principe, maintenant c\'est à toi de jouer !',
};

export const PEER_CHAT_SEED: Record<string, { from: 'braise' | 'me'; text: string }[]> = {
  m3: [
    { from: 'braise', text: 'Hey ! T\'as vu les stories sur les équations ? C\'est clair ou tu veux que je t\'explique un truc ?' },
  ],
};
