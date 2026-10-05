// The course service's data model. Everything a Déclic needs — its cards, every feedback, the
// assessment rule, the curriculum it covers, its review deck — is DATA described by these types, and
// the engine, the validator and the UI only ever read them. Adding the next Déclic means adding a
// JSON file under src/content/courses/, not touching code.
//
//   Chapter            one chapter of the official programme (a Seconde maths chapter, say)
//     ├─ source + mappings      the Bulletin officiel it answers, as traceable internal ids
//     ├─ misconceptions         the wrong mental models this chapter watches for
//     ├─ Declic                 one micro-lesson: an ordered list of Cards
//     │    ├─ Card              choice | reveal | multi-step-choice | declic-summary (| future kinds)
//     │    │    └─ Choice       label, expected/score, feedback, misconceptionId, visual, action
//     │    ├─ assessment        how the validation card turns into "understood" or not
//     │    └─ mastery           how deferred recalls turn "understood" into "mastered"
//     └─ ReviewDeck             Carré / Intox cards, ready for spaced repetition
//
// Not to be confused with the older .txt Déclics (src/lib/declic.ts), which are linear scripts with
// no ids, no assessment and no progress model. They keep working until their chapters are migrated
// to this format; see src/content/courses/README.md.
import type { ToneVariants } from "@/lib/tone";
import type { CardReview } from "@/types";

/** A piece of Braise's text. A bare string is the one voice for both tones; the object form lets a
 *  line carry a Savage version later (`@savage` in the older format) without changing the model. */
export type Text = string | { text: string; variants?: ToneVariants };

// ---------------------------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------------------------

export type CurriculumSource = {
  authority: string;
  programme: string;
  /** School year the programme applies from, e.g. "2026-2027". */
  applicationYear: string;
  bulletin: string;
  nor: string;
  /** Path through the programme, outermost first. */
  path: string[];
};

/** One requirement of the official programme, with the internal id that traces it. */
export type CurriculumMapping = {
  id: string;
  requirement: string;
  /** "direct": the chapter's own content. "transversal": a skill used across chapters. */
  type: "direct" | "transversal";
};

/** How completely a Déclic answers a mapping. */
export type CoverageLevel = "full" | "introduced" | "introduced_and_practised";

export type DeclicCoverage = { mappingId: string; coverage: CoverageLevel };

export type Misconception = { id: string; label: string };

export type ChapterDef = {
  id: string;
  /** Id of the subject in src/data.ts this chapter hangs under ("maths"). */
  subjectId: string;
  level: "seconde" | "premiere" | "terminale";
  title: string;
  source: CurriculumSource;
  mappings: CurriculumMapping[];
  misconceptions: Misconception[];
  /** Déclic ids, in teaching order. */
  declicIds: string[];
};

// ---------------------------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------------------------

/** An illustration. It can sit on a card or on one choice. The union is where each new picture is
 *  added; every kind is drawn from the parameters below, so the next chapter's picture is data, not
 *  a new component. A picture cannot be read from its shape, so each one carries the sentence a
 *  screen reader says in its place. */
export type Visual = NestedBoxesVisual | NumberLineVisual | GroupsVisual;

/** Sets inside sets: what "ℕ ⊂ ℤ" looks like. */
export type NestedBoxesVisual = {
  kind: "nested-boxes";
  ariaLabel: string;
  /** Top-level boxes, side by side; each may contain boxes. */
  boxes: BoxNode[];
};
export type BoxNode = { label: string; children?: BoxNode[] };

/** A graduated line with some points, some highlighted marks (multiples, say) and an optional bound. */
export type NumberLineVisual = {
  kind: "number-line";
  ariaLabel: string;
  min: number;
  max: number;
  /** Distance between two ticks; 1 by default. */
  step?: number;
  /** Points to place, with an optional label above them. */
  points?: { value: number; label?: string }[];
  /** Ticks drawn as highlighted, e.g. the multiples of a number. */
  marks?: number[];
  /** A limit drawn as a vertical bar, e.g. "never go above". */
  bound?: number;
};

/** `total` items cut into groups of `groupSize`: the complete groups, then what is left over. With
 *  a group size of 2 it is pairs and the one without a partner. */
export type GroupsVisual = {
  kind: "groups";
  ariaLabel: string;
  total: number;
  groupSize: number;
  /** What each item looks like (an emoji, a letter); a dot by default. */
  item?: string;
};

export type Choice = {
  id: string;
  label: string;
  /** Machine-readable value, when the label is not it. */
  value?: string | number;
  /** The expected answer. A card has exactly one, even when it does not announce it. */
  correct?: boolean;
  /** Points toward an assessment when it is not simply 0 or 1. */
  score?: number;
  /** Shown right after the tap, specific to this choice. Never a bare "Faux". */
  feedback: Text;
  /** The wrong mental model this answer points at, so reviews can adapt later. */
  misconceptionId?: string;
  visual?: Visual;
};

type CardBase = {
  id: string;
  order: number;
  /** What this card is for, in teacher's words. Never shown to the student. */
  objective?: string;
  /** A picture shown with the card's text (a choice may carry its own, see Choice.visual). */
  visual?: Visual;
  metadata?: Record<string, unknown>;
};

/** Another version of a question: other numbers and another situation, the same objective. The
 *  card's own `text` and `choices` are the first version (id "v1"); `variants` are the others. */
export type ChoiceVariant = {
  id: string;
  text: Text;
  choices: Choice[];
  visual?: Visual;
};

export type ChoiceCard = CardBase & {
  type: "choice";
  text: Text;
  choices: Choice[];
  /** Other versions of this question, played on a replay so a second pass is not the same
   *  questions. Each is complete: its own text, choices and feedbacks. */
  variants?: ChoiceVariant[];
  /** Label of the button that continues after the feedback. */
  continueLabel?: string;
  /** When false, no choice is marked as a miss: a hook question whose every answer is a way in. */
  gradeChoices?: boolean;
};

export type RevealCard = CardBase & {
  type: "reveal";
  text: Text;
  continueLabel: string;
};

export type Step = {
  id: string;
  /** What the step shows big ("23", "–9", "2,7"). */
  subject: string;
  options: Choice[];
  /** Whether getting it right actually separates the notions being taught (e.g. ℕ from ℤ). */
  discriminating?: boolean;
  /** The review-deck concept this step tests, to pick follow-up cards for a missed one. */
  conceptId?: string;
  /** A picture shown with the step's subject. */
  visual?: Visual;
  /** The cards to go back to when this step is missed, before trying the validation again. */
  remediation?: Remediation;
};

/** Another full set of steps for the validation: same objectives, same number of steps, other data.
 *  The step at a given position tests the same objective in every version, so a variant step that
 *  gives no `conceptId` or `remediation` takes those of the base step at its position. It must mark
 *  its own `discriminating` step, since each version is graded by the same rule. */
export type StepsVariant = {
  id: string;
  text?: Text;
  steps: Step[];
};

export type MultiStepCard = CardBase & {
  type: "multi-step-choice";
  text: Text;
  steps: Step[];
  /** "each": the feedback shows after every step. "after-all": all the answers are collected first,
   *  then the corrections are shown together, so one correction cannot give the next answer away.
   *  The validation card should use "after-all". */
  feedbackTiming?: "each" | "after-all";
  /** Other sets of steps, played on a retry or a replay. The card's own steps are "v1". */
  variants?: StepsVariant[];
};

export type SummaryAction = {
  id: string;
  label: string;
  /** "complete" ends the Déclic. "menu" opens the list of points to go back to. */
  kind: "complete" | "menu";
};

/** Replay a stretch of earlier cards, then come back to where the student was. */
export type Remediation = { type: "replay"; fromCardId: string; toCardId: string };

export type SummaryMenuItem = {
  id: string;
  label: string;
  /** Absent until a remediation is authored for this point. */
  remediation?: Remediation;
};

export type SummaryCard = CardBase & {
  type: "declic-summary";
  text: Text;
  actions: SummaryAction[];
  menu: SummaryMenuItem[];
};

export type CardDef = ChoiceCard | RevealCard | MultiStepCard | SummaryCard;
export type CardType = CardDef["type"];

// ---------------------------------------------------------------------------------------------
// Assessment and mastery
// ---------------------------------------------------------------------------------------------

export type AssessmentDef = {
  /** The multi-step card that is the validation. */
  cardId: string;
  /** Understood needs at least this score... */
  understoodMinScore: number;
  /** ...AND, when true, at least one `discriminating` step right, so the score cannot come from the
   *  steps that do not separate the notions being taught. */
  requireDiscriminatingStep: boolean;
  understoodMessage: string;
  needsReinforcementMessage: string;
  /** How many quick review situations are offered after a reinforcement outcome. */
  followUpCount: number;
};

export type MasteryDef = {
  /** Consecutive correct recalls, each given after its card came due, that a card needs. */
  requiredDeferredSuccesses: number;
  /** Share of the deck's cards that must reach that, between 0 and 1. */
  requiredCardRatio: number;
};

export type DeclicDef = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  version: string;
  targetDurationSec: [number, number];
  difficulty: { level: number; label: string };
  objective: string;
  prerequisites: string[];
  /** What the student must be able to do at the end, one item each. */
  detailedObjectives: string[];
  coverage: DeclicCoverage[];
  misconceptionIds: string[];
  cards: CardDef[];
  assessment: AssessmentDef;
  mastery: MasteryDef;
  deckId: string;
};

// ---------------------------------------------------------------------------------------------
// Review deck
// ---------------------------------------------------------------------------------------------

export type ReviewAnswer = "carre" | "intox";

export type ReviewCardDef = {
  id: string;
  order: number;
  /** The claim shown on the card. */
  statement: string;
  answer: ReviewAnswer;
  /** What this card tests; also what the assessment's steps point at. */
  concept: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  feedback: { correct: string; incorrect: string };
  /** For an Intox card, the true version of the claim. */
  correction?: string;
  misconceptionId?: string;
};

export type ReviewDeckDef = {
  id: string;
  declicId: string;
  chapterId: string;
  title: string;
  cards: ReviewCardDef[];
};

// ---------------------------------------------------------------------------------------------
// Progress (local to the device)
// ---------------------------------------------------------------------------------------------

/** Three independent questions, so a Déclic can be finished AND need reinforcement. */
export type CompletionStatus = "not_started" | "in_progress" | "completed";
export type UnderstandingStatus = "unknown" | "understood" | "needs_reinforcement";
/** Only the review deck can set this: it cannot be earned straight after the lesson. */
export type MasteryStatus = "not_mastered" | "mastered";

export type CardAnswer =
  | { kind: "choice"; choiceId: string; variantId?: string }
  | { kind: "steps"; stepAnswers: Record<string, string>; variantId?: string }
  | { kind: "summary"; actionId: string };

export type AssessmentResult = {
  score: number;
  max: number;
  /** Step id → whether it was right. */
  stepResults: Record<string, boolean>;
  discriminatingPassed: boolean;
  status: Exclude<UnderstandingStatus, "unknown">;
  at: number;
};

/** One go at the validation. A go on a version of the validation the student has not seen before is
 *  evidence of understanding; a recycled one is practice and changes no status. */
export type AssessmentAttempt = AssessmentResult & {
  variantId: string;
  kind: "evidence" | "practice";
};

export type DeclicProgress = {
  declicId: string;
  contentVersion: string;
  completionStatus: CompletionStatus;
  understandingStatus: UnderstandingStatus;
  masteryStatus: MasteryStatus;
  /** The card the student is on, so closing the app and coming back resumes there. */
  currentCardId: string | null;
  /** Card id → what was answered. Only first-attempt answers; replays are not recorded. */
  answers: Record<string, CardAnswer>;
  /** The latest go that counted as evidence; it is what understanding follows. */
  assessment?: AssessmentResult;
  /** Every go at the validation, in order, so a retry is recorded apart from the first. */
  attempts?: AssessmentAttempt[];
  /** How many times the Déclic has been started over after being finished; picks the version of a
   *  question to play, so a replay brings other questions. 0 the first time. */
  runIndex?: number;
  /** Which go at the validation the student is on (an index into `attempts`). */
  assessmentAttempt?: number;
  startedAt: number;
  completedAt?: number;
  updatedAt: number;
};

/** Everything the spaced-repetition scheduler needs about one review card. */
export type ReviewCardState = {
  cardId: string;
  declicId: string;
  chapterId: string;
  concept: string;
  timesPresented: number;
  successCount: number;
  errorCount: number;
  /** Correct recalls in a row, each after the card was due; any error resets it to 0. */
  consecutiveDeferredSuccesses: number;
  lastPresentedAt: number | null;
  lastResult: "correct" | "incorrect" | null;
  /** The SM-2 schedule, shared with the main Réviser: repetitions, interval in days, ease and
   *  next due date. Absent until the first time the card is shown. */
  review?: CardReview;
  /** A missed card waiting for its comeback: the next correct recall after it is a "revanche". */
  revengePending: boolean;
};

export type MisconceptionCount = { count: number; lastAt: number };

export type CourseProgress = {
  version: 1;
  declics: Record<string, DeclicProgress>;
  reviewCards: Record<string, ReviewCardState>;
  misconceptions: Record<string, MisconceptionCount>;
};
