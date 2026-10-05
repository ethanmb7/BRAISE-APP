// Local persistence of course progress. Same conventions as lib/persist.ts: localStorage, every
// read and write wrapped so a blocked or full storage never breaks a screen, nothing sent anywhere
// (BRAISE keeps progress on the student's device). It is its own key because it is its own model —
// three status dimensions per Déclic and a scheduling state per review card — and the backup code
// in lib/backup.ts carries it.
//
// A tiny external store so React can subscribe to it (see useCourseProgress) while the pure logic
// and the tests use the same object with an in-memory storage.
import type { CourseProgress } from "./types";

export const COURSE_PROGRESS_KEY = "sapie_course_progress";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function emptyCourseProgress(): CourseProgress {
  return { version: 1, declics: {}, reviewCards: {}, misconceptions: {} };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Reads what was saved, tolerating anything: no value, broken JSON, another version, a wrong
 *  shape. The worst outcome is an empty progress, never an exception. */
export function parseCourseProgress(raw: string | null): CourseProgress {
  if (!raw) return emptyCourseProgress();
  try {
    const data: unknown = JSON.parse(raw);
    if (
      isRecord(data) &&
      data.version === 1 &&
      isRecord(data.declics) &&
      isRecord(data.reviewCards) &&
      isRecord(data.misconceptions)
    ) {
      return data as unknown as CourseProgress;
    }
  } catch {
    // fall through to the empty progress
  }
  return emptyCourseProgress();
}

export type ProgressStore = {
  get: () => CourseProgress;
  update: (change: (current: CourseProgress) => CourseProgress) => CourseProgress;
  subscribe: (listener: () => void) => () => void;
};

export function createProgressStore(storage: StorageLike | null): ProgressStore {
  const read = () => {
    try {
      return parseCourseProgress(storage?.getItem(COURSE_PROGRESS_KEY) ?? null);
    } catch {
      return emptyCourseProgress();
    }
  };
  let cache = read();
  const listeners = new Set<() => void>();
  return {
    get: () => cache,
    update(change) {
      cache = change(cache);
      try {
        storage?.setItem(COURSE_PROGRESS_KEY, JSON.stringify(cache));
      } catch {
        // quota or blocked storage: progress still lives in memory for this visit
      }
      listeners.forEach((l) => l());
      return cache;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/** The app's store. Created on first import; on the server (no storage) it stays empty. */
export const courseProgressStore: ProgressStore = createProgressStore(browserStorage());
