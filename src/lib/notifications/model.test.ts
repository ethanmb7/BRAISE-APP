import { describe, it, expect } from "vitest";
import {
  DAY,
  DEFAULT_PREFS,
  EARLIEST_MINUTES,
  FREQUENCIES,
  LATEST_MINUTES,
  MAX_UNANSWERED,
  MOMENTS,
  frequencyFromGoal,
  isBraked,
  minutesFor,
  momentMinutes,
  planNotifications,
  trailingUnanswered,
  type DeclicDone,
  type DueItem,
  type NotifPrefs,
  type PlannerInput,
  type SentRecord,
} from "./model";
import { NEVER, POOLS, placeholdersOf, renderNotification } from "./copy";

// A Wednesday at 10:00 local time.
const NOW = new Date(2026, 9, 7, 10, 0, 0).getTime();
const HOUR = 3_600_000;
const on: NotifPrefs = { ...DEFAULT_PREFS, enabled: true };

const due = (n: number, at = NOW - DAY): DueItem[] =>
  Array.from({ length: n }, (_, i) => ({ at: at + i, label: "Pythagore", subjectId: "maths" }));

const input = (patch: Partial<PlannerInput> = {}): PlannerInput => ({
  now: NOW,
  prefs: on,
  tone: "chill",
  name: "Léa",
  opens: [NOW - HOUR],
  due: [],
  declics: [],
  history: [],
  ...patch,
});

const hourOf = (t: number) => new Date(t).getHours() * 60 + new Date(t).getMinutes();
const dayOf = (t: number) => new Date(t).toDateString();

describe("choices", () => {
  it("starts from the rhythm chosen at the onboarding", () => {
    expect(frequencyFromGoal("tranquille")).toBe("rare");
    expect(frequencyFromGoal("regulier")).toBe("normal");
    expect(frequencyFromGoal("a-fond")).toBe("souvent");
    expect(frequencyFromGoal(undefined)).toBe("normal");
  });

  it("keeps the moment inside the quiet hours, whatever is typed", () => {
    expect(momentMinutes({ ...on, moment: "custom", time: "03:00" })).toBe(EARLIEST_MINUTES);
    expect(momentMinutes({ ...on, moment: "custom", time: "23:45" })).toBe(LATEST_MINUTES);
    expect(momentMinutes({ ...on, moment: "custom", time: "18:15" })).toBe(18 * 60 + 15);
    expect(momentMinutes({ ...on, moment: "evening" })).toBe(20 * 60 + 30);
  });

  it("says how long a few cards take", () => {
    expect([1, 3, 4, 8, 9, 15].map(minutesFor)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe("planNotifications", () => {
  it("says nothing until the student has agreed", () => {
    expect(planNotifications(input({ prefs: { ...on, enabled: false }, due: due(6) }))).toEqual([]);
  });

  it("sends no reminder for a single notion, nor for none", () => {
    for (const n of [0, 1]) {
      const plan = planNotifications(input({ due: due(n), opens: [NOW - 5 * 60 * 60_000] }));
      expect(plan.filter((p) => p.kind === "rappel")).toEqual([]);
    }
  });

  it("invites to refresh notions once there are enough, at the student's moment", () => {
    const plan = planNotifications(input({ due: due(4) }));
    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0].kind).toBe("rappel");
    expect(hourOf(plan[0].at)).toBe(17 * 60 + 30);
    expect(plan[0].at).toBeGreaterThan(NOW);
    expect(plan[0].body).toMatch(/4|Pythagore/);
    expect(plan[0].target).toEqual({ view: "revisions" });
  });

  it("never knocks in the night, never twice in a day, and keeps the gap the student chose", () => {
    for (const frequency of ["rare", "normal", "souvent"] as const) {
      for (const moment of ["after-school", "evening", "morning"] as const) {
        const plan = planNotifications(
          input({ prefs: { ...on, frequency, moment }, due: due(30), opens: [NOW - 5 * DAY] }),
        );
        const gap = FREQUENCIES[frequency].gapDays * DAY - 2 * HOUR;
        plan.forEach((p, i) => {
          expect(hourOf(p.at)).toBeGreaterThanOrEqual(EARLIEST_MINUTES);
          expect(hourOf(p.at)).toBeLessThanOrEqual(LATEST_MINUTES);
          if (i > 0) {
            expect(dayOf(p.at)).not.toBe(dayOf(plan[i - 1].at));
            expect(p.at - plan[i - 1].at).toBeGreaterThanOrEqual(gap);
          }
        });
      }
    }
  });

  it("respects the weekly limit of each rhythm", () => {
    for (const frequency of ["rare", "normal", "souvent"] as const) {
      const plan = planNotifications(input({ prefs: { ...on, frequency }, due: due(30) }));
      for (const p of plan) {
        const week = plan.filter((q) => q.at > p.at - 7 * DAY && q.at <= p.at).length;
        expect(week).toBeLessThanOrEqual(FREQUENCIES[frequency].perWeek);
      }
    }
  });

  it("stops after three messages that cannot have been answered yet, since the app may stay closed", () => {
    const plan = planNotifications(input({ prefs: { ...on, frequency: "souvent" }, due: due(30) }));
    expect(plan.length).toBeLessThanOrEqual(MAX_UNANSWERED);
  });

  it("follows a Déclic the next day, once, naming it", () => {
    const declics: DeclicDone[] = [
      {
        id: "D02",
        title: "Ça tombe pile",
        chapterId: "M2-ARI",
        subjectId: "maths",
        completedAt: NOW - HOUR,
        cardCount: 8,
        reviewed: false,
      },
    ];
    const plan = planNotifications(input({ declics }));
    expect(plan.filter((p) => p.kind === "declic-suite")).toHaveLength(1);
    expect(plan[0].kind).toBe("declic-suite");
    expect(plan[0].body).toContain("Ça tombe pile");
    expect(plan[0].body).toContain("3 cartes");
    expect(plan[0].target).toEqual({ view: "chapter", chapterId: "M2-ARI", subjectId: "maths" });
    expect(plan[0].at - declics[0].completedAt).toBeGreaterThanOrEqual(18 * HOUR);
  });

  it("does not follow a Déclic whose cards were already seen", () => {
    const declics: DeclicDone[] = [
      {
        id: "D02",
        title: "Ça tombe pile",
        chapterId: "M2-ARI",
        subjectId: "maths",
        completedAt: NOW - HOUR,
        cardCount: 8,
        reviewed: true,
      },
    ];
    expect(planNotifications(input({ declics })).filter((p) => p.kind === "declic-suite")).toEqual(
      [],
    );
  });

  it("sends a warm word after a few days away, then one much later, then nothing more", () => {
    const plan = planNotifications(input({ opens: [NOW - 4 * DAY] }));
    const kinds = plan.map((p) => p.kind);
    expect(kinds[0]).toBe("retrouvailles");
    expect(kinds.filter((k) => k === "retrouvailles").length).toBeLessThanOrEqual(2);
    const second = plan.filter((p) => p.kind === "retrouvailles")[1];
    if (second) expect((second.at - (NOW - 4 * DAY)) / DAY).toBeGreaterThanOrEqual(10);
  });

  it("says nothing on the day the student already came, and no word of comeback before three days", () => {
    const plan = planNotifications(input({ opens: [NOW - HOUR], due: due(6) }));
    expect(plan.every((p) => dayOf(p.at) !== dayOf(NOW))).toBe(true);
    for (const p of plan.filter((q) => q.kind === "retrouvailles")) {
      expect((p.at - (NOW - HOUR)) / DAY).toBeGreaterThanOrEqual(3);
    }
  });

  it("never plans a reminder for the very day the student came, even with notions due", () => {
    const plan = planNotifications(input({ opens: [NOW - 2 * HOUR], due: due(9) }));
    expect(plan[0].at).toBeGreaterThan(new Date(2026, 9, 7, 23, 59).getTime());
  });

  it("gives the Déclic's follow-up priority over a plain reminder on the same day", () => {
    const declics: DeclicDone[] = [
      {
        id: "D02",
        title: "Ça tombe pile",
        chapterId: "M2-ARI",
        subjectId: "maths",
        completedAt: NOW - HOUR,
        cardCount: 8,
        reviewed: false,
      },
    ];
    const plan = planNotifications(input({ declics, due: due(5) }));
    expect(plan[0].kind).toBe("declic-suite");
  });
});

describe("the brake", () => {
  const sent = (daysAgo: number): SentRecord => ({ id: `r${daysAgo}`, at: NOW - daysAgo * DAY });

  it("counts the messages in a row that got no answer", () => {
    const history = [sent(8), sent(6), sent(4)];
    expect(trailingUnanswered(history, [], NOW)).toBe(3);
    // The student opened the app the day after the middle one: only the last one is unanswered.
    expect(trailingUnanswered(history, [NOW - 6 * DAY + 2 * HOUR], NOW)).toBe(1);
  });

  it("gives a message from the last 24 hours its chance before judging it", () => {
    expect(trailingUnanswered([{ id: "x", at: NOW - 3 * HOUR }], [], NOW)).toBe(0);
  });

  it("stops planning after three unanswered messages", () => {
    const history = [sent(8), sent(6), sent(4)];
    expect(isBraked(history, [], NOW)).toBe(true);
    expect(planNotifications(input({ history, opens: [NOW - 9 * DAY], due: due(9) }))).toEqual([]);
  });

  it("plans less when some of the budget is already used", () => {
    const history = [sent(8), sent(6)];
    const plan = planNotifications(input({ history, opens: [NOW - 9 * DAY], due: due(9) }));
    expect(plan.length).toBeLessThanOrEqual(1);
  });
});

describe("the words", () => {
  const tones = ["chill", "savage"] as const;

  it("never presses, counts the days away or blames, in any template", () => {
    for (const [key, pools] of Object.entries(POOLS)) {
      for (const tone of tones) {
        for (const t of pools[tone]) expect(t, `${key}/${tone}: ${t}`).not.toMatch(NEVER);
      }
    }
  });

  it("says the same facts in both tones, template by template", () => {
    for (const [key, pools] of Object.entries(POOLS)) {
      expect(pools.chill.length, key).toBe(pools.savage.length);
      pools.chill.forEach((t, i) => {
        expect(placeholdersOf(pools.savage[i]), `${key}[${i}]`).toEqual(placeholdersOf(t));
      });
    }
  });

  it("fills every placeholder, for every day of the rotation", () => {
    for (const tone of tones) {
      for (let seed = 0; seed < 6; seed++) {
        const r = renderNotification({
          kind: "rappel",
          tone,
          name: "Léa",
          seed,
          count: 4,
          minutes: 2,
          topic: "Pythagore",
        });
        expect(r.body).not.toMatch(/[{}]/);
        expect(r.title).toBe("Braise");
        const d = renderNotification({
          kind: "declic-suite",
          tone,
          name: "Léa",
          seed,
          count: 1,
          minutes: 1,
          declic: "Ça tombe pile",
        });
        expect(d.body).toContain("1 carte");
        expect(d.body).not.toContain("1 cartes");
        expect(d.body).not.toMatch(/[{}]/);
      }
    }
  });

  it("uses the name, or a friendly 'toi' if there is none", () => {
    const r = renderNotification({
      kind: "retrouvailles",
      tone: "chill",
      name: "  ",
      seed: 0,
      count: 0,
      minutes: 2,
      step: 1,
    });
    expect(r.body).toContain("toi");
  });

  it("keeps its moments in the list the student can pick from", () => {
    expect(Object.keys(MOMENTS)).toEqual(["after-school", "evening", "morning"]);
  });
});
