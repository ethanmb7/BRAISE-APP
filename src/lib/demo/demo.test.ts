import { describe, it, expect } from "vitest";
import { FLASHCARDS } from "@/data";
import { createBackupCode, parseBackupCode } from "@/lib/backup";
import { NOTIF_KEY } from "@/lib/notifications/store";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import { pickCourseCards } from "@/lib/revision/courseCards";
import { getRankInfo } from "@/lib/aura";
import { CARDS_KEY, PROGRESS_KEY } from "@/lib/persist";
import { COURSE_PROGRESS_KEY } from "@/lib/course/progressStore";
import { SEEN_BADGES_KEY, SEEN_RANK_KEY } from "@/lib/celebrations";
import type { CourseProgress } from "@/lib/course/types";
import type { CardReview } from "@/types";
import {
  applyDemoRequest,
  DEMO_FLAG_KEY,
  DEMO_KEYS,
  DEMO_STASH_KEY,
  demoRequest,
  enterDemo,
  isDemo,
  leaveDemo,
  withoutDemoParam,
} from "./demo";
import { buildDemoData, REVISER_TUTORIAL_KEY } from "./profile";

const NOW = Date.UTC(2026, 9, 12, 10, 0, 0);

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe("the demo profile", () => {
  const data = buildDemoData(NOW);
  const progress = JSON.parse(data[PROGRESS_KEY]);
  const reviews = JSON.parse(data[CARDS_KEY]) as Record<string, CardReview>;
  const course = JSON.parse(data[COURSE_PROGRESS_KEY]) as CourseProgress;

  it("is a student the backup reader accepts", async () => {
    const store = fakeStorage(data);
    const parsed = await parseBackupCode(await createBackupCode(store));
    expect(parsed.ok).toBe(true);
    expect(progress.user.name).toBe("Léa");
    expect(getRankInfo(progress.xp).current.id).toBe("or");
  });

  it("only mentions flashcards that exist, in every state of the repetition", () => {
    const ids = new Set(FLASHCARDS.map((c) => c.id));
    const list = Object.entries(reviews);
    expect(list.length).toBeGreaterThan(20);
    expect(list.every(([id]) => ids.has(id))).toBe(true);
    expect(list.filter(([, r]) => r.repetitions >= 2).length).toBeGreaterThan(5);
    expect(list.filter(([, r]) => r.nextReviewAt <= NOW).length).toBeGreaterThan(5);
    expect(list.filter(([, r]) => r.lastConfidence === "not-sure").length).toBeGreaterThan(0);
  });

  it("only mentions Déclics and cards of the real course", () => {
    for (const [id, d] of Object.entries(course.declics)) {
      const def = COURSE_REGISTRY.declics.get(id);
      expect(def, id).toBeDefined();
      if (d.currentCardId) expect(def!.cards.some((c) => c.id === d.currentCardId)).toBe(true);
    }
    const states = Object.values(course.reviewCards);
    expect(states.length).toBeGreaterThan(0);
    for (const state of states) {
      const def = COURSE_REGISTRY.declics.get(state.declicId);
      const deck = def && COURSE_REGISTRY.decks.get(def.deckId);
      expect(deck?.cards.some((c) => c.id === state.cardId)).toBe(true);
    }
  });

  it("makes Réviser slip a few Déclic cards in, so the link between the methods shows", () => {
    const source = {
      chapters: COURSE_REGISTRY.chapters,
      declics: COURSE_REGISTRY.declics,
      decks: COURSE_REGISTRY.decks,
    };
    const picked = pickCourseCards(source, course, NOW);
    expect(picked.length).toBeGreaterThanOrEqual(1);
    expect(picked.length).toBeLessThanOrEqual(3);
  });

  it("starts with no celebration to replay and no first-run explanation in the way", () => {
    expect(data[SEEN_RANK_KEY]).toBe("or");
    expect(JSON.parse(data[SEEN_BADGES_KEY]).length).toBeGreaterThan(0);
    expect(data[REVISER_TUTORIAL_KEY]).toBe("1");
  });

  it("is the same for the same day", () => {
    expect(buildDemoData(NOW)).toEqual(data);
  });
});

describe("entering and leaving the demo", () => {
  const real = {
    [PROGRESS_KEY]: '{"xp":42,"user":{"name":"Sam"}}',
    [NOTIF_KEY]: '{"prefs":{"enabled":true}}',
  };

  it("sets the student's own data aside and shows the demo", () => {
    const s = fakeStorage(real);
    enterDemo(s, NOW);
    expect(isDemo(s)).toBe(true);
    expect(JSON.parse(s.getItem(PROGRESS_KEY)!).user.name).toBe("Léa");
    expect(s.getItem(NOTIF_KEY)).toBeNull();
    expect(s.getItem(DEMO_STASH_KEY)).not.toBeNull();
  });

  it("gives everything back exactly as it was, absent keys included", () => {
    const s = fakeStorage(real);
    enterDemo(s, NOW);
    leaveDemo(s);
    expect(isDemo(s)).toBe(false);
    expect(s.getItem(PROGRESS_KEY)).toBe(real[PROGRESS_KEY]);
    expect(s.getItem(NOTIF_KEY)).toBe(real[NOTIF_KEY]);
    expect(s.getItem(CARDS_KEY)).toBeNull();
    expect(s.getItem(DEMO_STASH_KEY)).toBeNull();
    expect([...s.map.keys()].sort()).toEqual(Object.keys(real).sort());
  });

  it("does not overwrite the set-aside data when the demo is started over", () => {
    const s = fakeStorage(real);
    enterDemo(s, NOW);
    enterDemo(s, NOW + 86_400_000);
    leaveDemo(s);
    expect(s.getItem(PROGRESS_KEY)).toBe(real[PROGRESS_KEY]);
  });

  it("leaves an empty device empty", () => {
    const s = fakeStorage();
    enterDemo(s, NOW);
    leaveDemo(s);
    expect(s.map.size).toBe(0);
  });

  it("touches nothing outside its own keys", () => {
    const s = fakeStorage({ unrelated: "keep", sapie_device_id: "abc" });
    enterDemo(s, NOW);
    expect(s.getItem("unrelated")).toBe("keep");
    expect(s.getItem("sapie_device_id")).toBe("abc");
    leaveDemo(s);
    expect(s.getItem("unrelated")).toBe("keep");
    expect(DEMO_KEYS).not.toContain("sapie_device_id");
    expect(s.getItem(DEMO_FLAG_KEY)).toBeNull();
  });
});

describe("the address", () => {
  it("reads ?demo as in and ?demo=off as out", () => {
    expect(demoRequest("")).toBeNull();
    expect(demoRequest("?x=1")).toBeNull();
    expect(demoRequest("?demo")).toBe("enter");
    expect(demoRequest("?demo=1")).toBe("enter");
    expect(demoRequest("?demo=off")).toBe("leave");
    expect(demoRequest("?demo=OFF")).toBe("leave");
  });

  it("only reports a change when the stored data changed", () => {
    const s = fakeStorage(),
      later = NOW + 1;
    expect(applyDemoRequest("", s, NOW)).toBe(false);
    expect(applyDemoRequest("?demo=off", s, NOW)).toBe(false); // not in the demo: nothing to leave
    expect(applyDemoRequest("?demo", s, NOW)).toBe(true);
    expect(isDemo(s)).toBe(true);
    expect(applyDemoRequest("?demo=off", s, later)).toBe(true);
    expect(isDemo(s)).toBe(false);
  });

  it("drops the parameter and keeps the rest of the address", () => {
    expect(withoutDemoParam("https://x.test/?demo")).toBe("/");
    expect(withoutDemoParam("https://x.test/a/?demo=1&b=2#c")).toBe("/a/?b=2#c");
  });
});
