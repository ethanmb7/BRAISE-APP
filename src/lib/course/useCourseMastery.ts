import { useMemo } from "react";
import { COURSE_REGISTRY } from "./registry";
import { courseMastery, type CourseMastery } from "./mastery";
import { useCourseProgress } from "./useCourseProgress";

const SOURCE = {
  chapters: COURSE_REGISTRY.chapters,
  declics: COURSE_REGISTRY.declics,
  decks: COURSE_REGISTRY.decks,
};

/** The course cards as Aura reads cards, re-computed when the course progress changes. */
export function useCourseMastery(): CourseMastery {
  const progress = useCourseProgress();
  return useMemo(() => courseMastery(SOURCE, progress), [progress]);
}
