export type ViewId =
  | 'onboarding'
  | 'home'
  | 'matieres'
  | 'revisions'
  | 'progres'
  | 'subject'
  | 'lesson'
  | 'complete'
  | 'share'
  | 'profile'
  | 'settings';

export type TabId = 'home' | 'matieres' | 'revisions' | 'progres' | 'profile';

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
  subject: string;
  topic: string;
  level: 'easy' | 'medium' | 'hard';
};

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  cond: string;
  unlocked: boolean;
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

export type UserProfile = {
  name: string;
  level: string;
  levelLabel: string;
  goal: string;
  subjects: string[];
  avatar: string;
};

export type AppState = {
  view: ViewId;
  tab: TabId;
  user: UserProfile;
  streak: number;
  xp: number;
  freezes: number;
  freezeArmed: boolean;
  dailyGoalMet: boolean;
  darkMode: boolean;
  dyslexiaMode: boolean;
  soundOn: boolean;
  currentSubjectId: string | null;
  currentChapterId: string | null;
  currentLessonMode: 'vocal' | 'echanger';
  completedChapters: string[];
  chatBridgeMessage: string | null;
  cardReviews: Record<string, CardReview>;
  sessionDate: string;
  sessionCardsReviewed: number;
  sessionChaptersDone: number;
};
