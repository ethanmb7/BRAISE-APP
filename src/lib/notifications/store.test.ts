import { describe, it, expect } from "vitest";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import { emptyCourseProgress } from "@/lib/course/progressStore";
import { emptyDeclicProgress } from "@/lib/course/engine";
import { FLASHCARDS } from "@/data";
import { DEFAULT_PREFS, planNotifications } from "./model";
import { buildPlannerInput } from "./input";
import {
  INVITE_PAUSE,
  MAX_INVITES,
  NOTIF_KEY,
  answerBrake,
  createNotifStore,
  dismissInvite,
  emptyNotifState,
  parseNotifState,
  recordOpen,
  savePlan,
  setPrefs,
  shouldInvite,
} from "./store";

const NOW = new Date(2026, 9, 7, 10, 0, 0).getTime();
const DAY = 86_400_000;
const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};
const plan = (at: number) => [
  {
    id: `rappel-${at}`,
    at,
    kind: "rappel" as const,
    title: "Braise",
    body: "x",
    target: { view: "revisions" as const },
  },
];

describe("the reminders' state", () => {
  it("counts a reload as the same opening", () => {
    let s = recordOpen(emptyNotifState(), NOW);
    s = recordOpen(s, NOW + 2 * 60_000);
    expect(s.opens).toHaveLength(1);
    s = recordOpen(s, NOW + DAY);
    expect(s.opens).toHaveLength(2);
  });

  it("files a passed message as delivered only if the plan was really handed to the phone", () => {
    const web = savePlan(
      savePlan(emptyNotifState(), plan(NOW - DAY), false, NOW - 2 * DAY),
      [],
      false,
      NOW,
    );
    expect(web.history).toEqual([]);

    const phone = savePlan(
      savePlan(emptyNotifState(), plan(NOW - DAY), true, NOW - 2 * DAY),
      [],
      true,
      NOW,
    );
    expect(phone.history).toHaveLength(1);
    // The same message is not filed twice.
    expect(savePlan(phone, [], true, NOW + DAY).history).toHaveLength(1);
  });

  it("starts the count again when the student answers the brake", () => {
    const braked = {
      ...emptyNotifState(),
      history: [
        { id: "a", at: 1 },
        { id: "b", at: 2 },
        { id: "c", at: 3 },
      ],
    };
    const back = answerBrake(
      setPrefs(braked, { ...DEFAULT_PREFS, enabled: true, frequency: "souvent" }),
      true,
    );
    expect(back.history).toEqual([]);
    expect(back.prefs.enabled).toBe(true);
    expect(back.prefs.frequency).toBe("rare");
    const away = answerBrake(setPrefs(braked, { ...DEFAULT_PREFS, enabled: true }), false);
    expect(away.prefs.enabled).toBe(false);
    expect(away.history).toEqual([]);
  });
});

describe("the invitation", () => {
  it("is for someone who has had a taste, and has not agreed", () => {
    const s = emptyNotifState();
    expect(shouldInvite(s, false, NOW)).toBe(false);
    expect(shouldInvite(s, true, NOW)).toBe(true);
    expect(shouldInvite(setPrefs(s, { ...DEFAULT_PREFS, enabled: true }), true, NOW)).toBe(false);
  });

  it("waits two weeks after a 'not now', and stops asking after two", () => {
    let s = dismissInvite(emptyNotifState(), NOW);
    expect(shouldInvite(s, true, NOW + DAY)).toBe(false);
    expect(shouldInvite(s, true, NOW + INVITE_PAUSE)).toBe(true);
    for (let i = 1; i < MAX_INVITES; i++) s = dismissInvite(s, NOW + INVITE_PAUSE);
    expect(shouldInvite(s, true, NOW + 10 * INVITE_PAUSE)).toBe(false);
  });
});

describe("storage", () => {
  it("brings back what was saved, and survives garbage", () => {
    const storage = memory();
    const store = createNotifStore(storage);
    store.update((s) =>
      setPrefs(s, { ...DEFAULT_PREFS, enabled: true, moment: "evening", time: "20:30" }),
    );
    expect(createNotifStore(storage).get().prefs).toMatchObject({
      enabled: true,
      moment: "evening",
    });
    storage.setItem(NOTIF_KEY, "{not json");
    expect(createNotifStore(storage).get()).toEqual(emptyNotifState());
    expect(parseNotifState(JSON.stringify({ version: 2 }))).toEqual(emptyNotifState());
  });

  it("does not write when nothing changed", () => {
    let writes = 0;
    const store = createNotifStore({ getItem: () => null, setItem: () => void writes++ });
    store.update((s) => s);
    expect(writes).toBe(0);
  });
});

describe("buildPlannerInput", () => {
  const source = {
    chapters: COURSE_REGISTRY.chapters,
    declics: COURSE_REGISTRY.declics,
    decks: COURSE_REGISTRY.decks,
  };
  const base = {
    now: NOW,
    prefs: { ...DEFAULT_PREFS, enabled: true },
    tone: "chill" as const,
    name: "Léa",
    opens: [NOW - 5 * DAY],
    history: [],
    flashcards: FLASHCARDS,
    cardReviews: {},
    source,
  };

  it("lists the notions that have a date, from both methods", () => {
    const deck = COURSE_REGISTRY.decks.get("M2-ARI-D02-REV")!;
    const course = {
      ...emptyCourseProgress(),
      reviewCards: {
        [deck.cards[0].id]: {
          cardId: deck.cards[0].id,
          declicId: "M2-ARI-D02",
          chapterId: "M2-ARI",
          concept: "c",
          timesPresented: 1,
          successCount: 1,
          errorCount: 0,
          consecutiveDeferredSuccesses: 0,
          lastPresentedAt: NOW - 2 * DAY,
          lastResult: "correct" as const,
          revengePending: false,
          review: {
            repetitions: 1,
            interval: 1,
            ease: 2.5,
            nextReviewAt: NOW - DAY,
            lastConfidence: "sure" as const,
          },
        },
      },
    };
    const cardReviews = {
      [FLASHCARDS[0].id]: {
        repetitions: 1,
        interval: 1,
        ease: 2.5,
        nextReviewAt: NOW - DAY,
        lastConfidence: "sure" as const,
      },
    };
    const input = buildPlannerInput({ ...base, course, cardReviews });
    expect(input.due).toHaveLength(2);
    expect(input.due.map((d) => d.label).sort()).toEqual(
      [FLASHCARDS[0].topic, "Ça tombe pile"].sort(),
    );
  });

  it("finds a finished Déclic whose cards were not seen, and plans its follow-up by name", () => {
    const def = COURSE_REGISTRY.declics.get("M2-ARI-D02")!;
    const course = {
      ...emptyCourseProgress(),
      declics: {
        [def.id]: {
          ...emptyDeclicProgress(def, NOW),
          completionStatus: "completed" as const,
          completedAt: NOW - 60_000,
        },
      },
    };
    const input = buildPlannerInput({ ...base, course, opens: [NOW - 60_000] });
    expect(input.declics).toHaveLength(1);
    expect(input.declics[0]).toMatchObject({
      id: def.id,
      reviewed: false,
      chapterId: "M2-ARI",
      subjectId: "maths",
    });
    const planned = planNotifications(input);
    expect(planned[0].kind).toBe("declic-suite");
    expect(planned[0].body).toContain(def.title);
  });
});
