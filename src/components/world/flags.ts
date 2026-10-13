import type { LibraryEntry } from "@/lib/catalog/catalog";

// What the flag on an island says, in one colour: gold is remembered for good, blue understood, pale
// seen, coral a point that mixes up. No flag at all on an island not visited yet.
export const FLAG: Partial<Record<LibraryEntry["status"], string>> = {
  mastered: "#f6b21b",
  understood: "#3b82f6",
  discovered: "#bfd7fd",
  in_progress: "#bfd7fd",
  needs_reinforcement: "#ff6f59",
};
