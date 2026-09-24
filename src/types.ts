export type ViewId =
  | 'onboarding'
  | 'home'
  | 'subjects'
  | 'revisions'
  | 'progres'
  | 'subject'
  | 'lesson'
  | 'complete'
  | 'share'
  | 'profile'
  | 'settings';

/** `progres` remains accepted for migration/back-navigation from pre-Matières installs. */
export type TabId = 'home' | 'subjects' | 'revisions' | 'profile' | 'progres';

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
  /** Chapter this card drills, so "Revoir la notion" can open the exact lesson. */
  chapterId: string;
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
  /** Real timestamp set once, at the end of onboarding — undefined for any account that existed
   *  before this field did, since a guessed backdated value would be a fabricated one. */
  joinedAt?: number;
};

/** Outcome of the chapter that just opened the completion screen. It is intentionally transient:
 * it explains this celebration, while durable progress remains in `completedChapters`. */
export type ChapterCompletion = {
  chapterId: string;
  wasNewCompletion: boolean;
  xpGained: number;
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
  /** Where "back" from a lesson should land when it wasn't reached through a subject (e.g.
   *  "Revoir la notion" mid-session on Réviser). In-memory only, never persisted. */
  lessonReturnTo: ViewId | null;
  /** In-memory handoff from LessonView to CompleteView; never restored after a reload. */
  lastCompletion: ChapterCompletion | null;
  cardReviews: Record<string, CardReview>;
  sessionDate: string;
  sessionCardsReviewed: number;
  sessionChaptersDone: number;
};
