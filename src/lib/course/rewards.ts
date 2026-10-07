// The points a course Déclic pays. A Déclic is one micro-lesson, the size of one older chapter, so it pays
// what a chapter pays; it pays once, the first time it is finished, and a replay pays nothing (as with an
// older chapter). Kept here, apart from the screen, so the rule is tested.
import { XP_REWARDS } from "@/lib/progress";
import type { DeclicProgress } from "./types";

export function completionXp(before: DeclicProgress | undefined): number {
  return before?.completionStatus === "completed" ? 0 : XP_REWARDS.CHAPTER_COMPLETE;
}
