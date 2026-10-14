import type { DisplayStatus } from "./engine";

// One word per state, in the words of the app, not of a report card. "Vu", "Capté" and "Dans la poche"
// are different claims on purpose: finishing the lesson, understanding it (the validation), and
// remembering it days later (the review deck). Keep them three distinct claims if the words change.
export const STATUS_LABEL: Record<DisplayStatus, string> = {
  not_started: "À découvrir",
  in_progress: "En route",
  discovered: "Vu",
  understood: "Capté",
  needs_reinforcement: "Fragile",
  mastered: "Dans la poche",
};
