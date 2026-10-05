import type { DisplayStatus } from "./engine";

// One word per state. "Vu", "Compris" and "Acquis" are different claims on purpose: finishing the
// lesson, understanding it (the validation), and remembering it days later (the review deck).
export const STATUS_LABEL: Record<DisplayStatus, string> = {
  not_started: "À découvrir",
  in_progress: "En cours",
  discovered: "Vu",
  understood: "Compris",
  needs_reinforcement: "À renforcer",
  mastered: "Acquis",
};
