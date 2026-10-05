export type ViewId =
  | "onboarding"
  | "home"
  | "subjects"
  | "revisions"
  | "progres"
  | "subject"
  | "lesson"
  | "complete"
  | "share"
  | "profile"
  | "settings";

/** `progres` remains accepted for migration/back-navigation from pre-Matières installs. */
export type TabId = "home" | "subjects" | "revisions" | "profile" | "progres";

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
  /** Fresh-install baseline only — real status comes from resolveChapters(). Mastery and the
   *  "à renforcer" signal are never stored on a chapter: they're derived from the student's real
   *  card-review history (see chapterMastery in lib/progress.ts), so they can't be hand-set to
   *  contradict what the student actually did. */
  status: "done" | "current" | "locked";
  duration: number;
};

export type StorySlide = {
  emoji: string;
  text: string;
  bg: string;
  duration: number;
};

export type QuizQuestion = {
  type: "mcq" | "vf";
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
  level: "easy" | "medium" | "hard";
};

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  cond: string;
};

export type TextSize = "normal" | "large" | "xlarge";

export type Confidence = "not-sure" | "sure";

export type CardReview = {
  repetitions: number;
  interval: number;
  ease: number;
  nextReviewAt: number;
  lastConfidence: Confidence;
};

export type Personality = "chill" | "savage";

export type AgeGroup = "college" | "lycee";

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
  /** True the moment a freeze has actually absorbed a missed day (see ensureSession in
   *  store.tsx) — never true just from arming one, and never reset back to false. The "Gel
   *  utilisé" badge reads this instead of live freeze state, which used to flip back to
   *  false the moment a freeze got disarmed or refunded, making an already-earned badge
   *  disappear and re-celebrate later. */
  everUsedFreeze: boolean;
  /** False only for a brand-new device until the onboarding flow is finished. */
  onboardingCompleted: boolean;
  dailyGoalMet: boolean;
  darkMode: boolean;
  dyslexiaMode: boolean;
  /** Root text size for the whole app (every font-size is in rem, so this scales all of it). */
  textSize: TextSize;
  soundOn: boolean;
  currentSubjectId: string | null;
  currentChapterId: string | null;
  lastSubjectId: string | null;
  lastChapterId: string | null;
  completedChapters: string[];
  /** Where "back" from a lesson should land when it wasn't reached through a subject (e.g.
   *  "Revoir la notion" mid-session on Réviser). In-memory only, never persisted. */
  lessonReturnTo: ViewId | null;
  /** In-memory handoff from LessonView to CompleteView; never restored after a reload. */
  lastCompletion: ChapterCompletion | null;
  cardReviews: Record<string, CardReview>;
  sessionDate: string;
  /** Real XP earned today (resets at the day boundary, same as everything else prefixed
   *  `session`) — the one number the daily goal is measured in, same unit the header/Aura/every
   *  other reward number already shows. Replaced separate sessionCardsReviewed/
   *  sessionChaptersDone counters that weighted a chapter as "worth 3 cards" for the goal while
   *  XP itself weighted it at 5x — two numbers for the same day's effort that didn't agree. */
  sessionXpEarned: number;
};
