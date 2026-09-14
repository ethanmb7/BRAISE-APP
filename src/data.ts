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
    color: '#3B82F6',
    bg: '#EFF6FF',
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
    color: '#8B5CF6',
    bg: '#F5F3FF',
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
    color: '#F59E0B',
    bg: '#FFFBEB',
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
    color: '#10B981',
    bg: '#ECFDF5',
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
    color: '#06B6D4',
    bg: '#ECFEFF',
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
    color: '#6366F1',
    bg: '#EEF2FF',
    chapters: [
      { id: 'a1', title: 'Present simple', status: 'done', mastery: 95, duration: 3 },
      { id: 'a2', title: 'Past simple', status: 'done', mastery: 80, duration: 3 },
      { id: 'a3', title: 'Present perfect', status: 'current', mastery: 25, duration: 4 },
      { id: 'a4', title: 'Modals & advice', status: 'locked', mastery: 0, duration: 4 },
    ],
  },
];

export const FLASHCARDS: Flashcard[] = [
  { id: 'fc1', q: 'Comment calcule-t-on l\'hypoténuse d\'un triangle rectangle ?', a: 'Avec le théorème de **Pythagore** : le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés, soit $a^2 + b^2 = c^2$.', wrongA: 'En additionnant directement les deux côtés : $a + b = c$.', subject: 'maths', topic: 'Pythagore', level: 'medium' },
  { id: 'fc2', q: 'Qu\'est-ce qu\'une fraction irréductible ?', a: 'Une fraction qu\'on ne peut plus simplifier : le numérateur et le dénominateur n\'ont plus de ==diviseur commun== (autre que 1).', wrongA: 'Une fraction dont le numérateur est plus grand que le dénominateur.', subject: 'maths', topic: 'Fractions', level: 'easy' },
  { id: 'fc3', q: 'Comment résoudre l\'équation $2x + 3 = 11$ ?', a: 'On **isole x** : $2x = 11 - 3 = 8$, donc $x = 8 \\div 2 = 4$.', wrongA: 'On isole x : $2x = 11 - 3 = 8$, donc $x = 8$.', subject: 'maths', topic: 'Équations', level: 'medium' },
  { id: 'fc4', q: 'Qu\'est-ce qu\'un vers en poésie ?', a: 'Une ligne de poème. Un alexandrin a ==12 syllabes==, un décasyllabe en a ==10==.', wrongA: 'Un vers, c\'est une strophe entière composée de plusieurs lignes.', subject: 'francais', topic: 'Poésie', level: 'easy' },
  { id: 'fc5', q: 'Quelle est la date de prise de la Bastille ?', a: 'Le ==14 juillet 1789==, événement symbolique du début de la **Révolution française**.', wrongA: 'Le 14 juillet 1792, date de la proclamation de la République.', subject: 'histoire-geo', topic: 'Révolution', level: 'easy' },
  { id: 'fc6', q: 'Qu\'est-ce que la photosynthèse ?', a: 'Le processus par lequel les plantes fabriquent leur nourriture (**glucose**) à partir de lumière, d\'eau et de CO₂.', wrongA: 'Le processus par lequel les plantes respirent la nuit en absorbant de l\'oxygène.', subject: 'svt', topic: 'Plantes', level: 'medium' },
  { id: 'fc7', q: 'Sujet : L\'atome', a: 'La ==plus petite particule== de matière. Il est composé d\'un **noyau** (protons + neutrons) et d\'électrons qui gravitent autour.', wrongA: 'La ==plus petite particule== de matière, et elle ==ne peut plus être divisée== en rien de plus petit.', subject: 'physique', topic: 'Atome', level: 'easy' },
  { id: 'fc8', q: 'Quand utilise-t-on le present perfect en anglais ?', a: 'Pour une action passée qui a un ==lien avec le présent== : "I have lost my keys" (je les ai perdues et je les cherche encore).', wrongA: 'Pour une action complètement terminée et sans lien avec le présent, comme le simple past.', subject: 'anglais', topic: 'Present perfect', level: 'hard' },
];

export const BADGES: Badge[] = [
  { id: 'b1', emoji: '🔥', name: '3 jours', cond: 'Série de 3' },
  { id: 'b2', emoji: '⚡', name: '100 XP', cond: '100 XP gagnés' },
  { id: 'b3', emoji: '📚', name: 'Premier chapitre', cond: '1 chapitre fini' },
  { id: 'b4', emoji: '🧊', name: 'Gel utilisé', cond: 'Utiliser un gel' },
  { id: 'b5', emoji: '🌟', name: '7 jours', cond: 'Série de 7' },
  { id: 'b6', emoji: '🏆', name: '1000 XP', cond: '1000 XP gagnés' },
];

export const DEFAULT_USER: UserProfile = {
  name: 'Alex',
  level: '3e',
  levelLabel: '3ème',
  goal: '30 min/jour',
  subjects: ['maths', 'francais', 'histoire-geo', 'svt'],
  avatar: '🦊',
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
      { type: 'vf', q: 'Dans une équation, on peut faire ce qu\'on veut d\'un côté sans toucher l\'autre.', answer: 1, explain: 'Faux ! L\'équation est une balance : toute opération d\'un côté doit être reproduite de l\'autre.' },
      { type: 'mcq', q: 'Résous : 3x = 21', options: ['x = 7', 'x = 18', 'x = 24'], answer: 0, explain: 'On divise les deux côtés par 3 : x = 21 ÷ 3 = 7.' },
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
};
