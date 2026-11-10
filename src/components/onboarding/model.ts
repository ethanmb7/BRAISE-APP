// What every onboarding skin is given. The questions, the answers and the state machine live once,
// in OnboardingView; a skin only decides how the conversation LOOKS. Switch with
// `localStorage.braise_onb` = "cartes" (default) | "thread" | "pass", same way the five suggestion
// cards of a subject were tried against each other.
import type { ReactNode } from "react";

export type OnbMood = "happy" | "proud" | "cool" | "eager";

export type OnbSkin = "cartes" | "thread" | "pass";

export const ONB_SKIN_KEY = "braise_onb";

export function readSkin(): OnbSkin {
  try {
    const v = localStorage.getItem(ONB_SKIN_KEY);
    return v === "thread" || v === "pass" ? v : "cartes";
  } catch {
    return "cartes";
  }
}

/** How the app opens; see components/onboarding/BraiseIntro.tsx for what each one says. */
export type IntroVariant = "morph" | "none" | "card";

export const ONB_INTRO_KEY = "braise_intro";

export function readIntro(): IntroVariant {
  try {
    const v = localStorage.getItem(ONB_INTRO_KEY);
    return v === "none" || v === "card" ? v : "morph";
  } catch {
    return "morph";
  }
}

/** One answer the student can pick on the current screen. */
export type OnbOption = {
  id: string;
  title: string;
  desc?: string;
  /** An emoji, a mascot, the flames of a rhythm — whatever that question shows beside its label. */
  aside?: ReactNode;
  selected: boolean;
  onSelect: () => void;
};

/** A line already exchanged, for the skins that keep the conversation on screen. */
export type OnbExchange = { id: string; braise: string; student: string };

export type OnbModel = {
  stepId: string;
  /** 0-based index of the current screen, and how many of them ask something. */
  step: number;
  questionCount: number;
  /** What Braise is saying right now — its reaction to the last answer, or the question. */
  line: { text: string; mood: OnbMood };
  /** The choices of this screen; empty on the screens that ask nothing. */
  options: OnbOption[];
  /** Everything already answered, oldest first. */
  history: OnbExchange[];
  name: { value: string; onChange: (v: string) => void };
  demo: {
    claim: string;
    truth: string;
    picked: "carre" | "intox" | null;
    onPick: (side: "carre" | "intox") => void;
  };
  /** Filled fields of the pass; a field is absent until its question is answered. */
  pass: { label: string; value: string | null }[];
  canContinue: boolean;
  ctaLabel: string;
  onNext: () => void;
  onBack: () => void;
};
