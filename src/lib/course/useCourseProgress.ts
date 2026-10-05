import { useSyncExternalStore } from "react";
import { courseProgressStore, emptyCourseProgress } from "./progressStore";
import type { CourseProgress } from "./types";

// What the server (and the first render before hydration) sees: nothing saved yet.
const SERVER_SNAPSHOT = emptyCourseProgress();

/** Course progress, re-rendering the component whenever it changes. */
export function useCourseProgress(): CourseProgress {
  return useSyncExternalStore(
    courseProgressStore.subscribe,
    courseProgressStore.get,
    () => SERVER_SNAPSHOT,
  );
}
