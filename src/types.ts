export type ViewId =
  | 'onboarding'
  | 'home'
  | 'revisions'
  | 'progres'
  | 'subject'
  | 'lesson'
  | 'complete'
  | 'share'
  | 'profile'
  | 'settings';

export type TabId = 'home' | 'revisions' | 'progres' | 'profile';

export type Level = {
  id: string;
  label: string;
  group: string;
};

export type Subject = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  chapters: Chapter[];
};

export type Chapter = {
  id: string;
  title: string;
  status: 'done' | 'current' | 'locked';
  mastery: number;
  reinforce?: boolean;
  skip?: boolean;
  duration: number;
};

export type StorySlide = {
  emoji: string;
  text: string;
  bg: string;
  duration: number;
};

export type LessonIntro = {
  hook: string;
  cheatCode: string;
  piege: string;
};

export type QuizQuestion = {
  type: 'mcq' | 'vf';
  q: string;
  options?: string[];
  answer: number;
  explain: string;
};

export type Flashcard = {
  id: string;
  q: string;
  a: string;
  wrongA: string;
  subject: string;
  topic: string;
  level: 'easy' | 'medium' | 'hard';
};

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  cond: string;
};

export type ChatMessage = { role: 'user' | 'model'; text: string };

export type Confidence = 'not-sure' | 'doubt' | 'sure';

export type CardReview = {
  repetitions: number;
  interval: number;
  ease: number;
  nextReviewAt: number;
  lastConfidence: Confidence;
};

export type Personality = 'chill' | 'savage';

export type AgeGroup = 'college' | 'lycee';

export type UserProfile = {
  name: string;
  level: string;
  levelLabel: string;
  goal: string;
  subjects: string[];
  avatar: string;
  personality: Personality;
};

export type AppState = {
  view: ViewId;
  tab: TabId;
  user: UserProfile;
  streak: number;
  xp: number;
  bestCombo: number;
  freezes: number;
  freezeArmed: boolean;
  dailyGoalMet: boolean;
  darkMode: boolean;
  dyslexiaMode: boolean;
  soundOn: boolean;
  currentSubjectId: string | null;
  currentChapterId: string | null;
  lastSubjectId: string | null;
  lastChapterId: string | null;
  currentLessonMode: 'vocal' | 'echanger';
  completedChapters: string[];
  chatBridgeMessage: string | null;
  cardReviews: Record<string, CardReview>;
  sessionDate: string;
  sessionCardsReviewed: number;
  sessionChaptersDone: number;
};
