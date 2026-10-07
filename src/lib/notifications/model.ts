// The model of Braise's reminders (see NOTIFICATIONS.md): what she sends, when, and what she never does.
// Pure: it takes the state of the student and the clock, and returns a plan. Nothing here knows about the
// screen or about how a notification is delivered, so every rule is tested.
import type { Personality } from "@/types";
import { renderNotification } from "./copy";

export const DAY = 86_400_000;
const HOUR = 3_600_000;

// ------------------------------------------------------------------------------------------ choices

export type MomentId = "after-school" | "evening" | "morning";
export type Frequency = "rare" | "normal" | "souvent";

export const MOMENTS: Record<MomentId, { label: string; hint: string; time: string }> = {
  "after-school": { label: "Après les cours", hint: "vers 17 h 30", time: "17:30" },
  evening: { label: "Le soir", hint: "vers 20 h 30", time: "20:30" },
  morning: { label: "Dans le bus", hint: "vers 7 h 40", time: "07:40" },
};

/** The most Braise sends in a week, and the least time between two. */
export const FREQUENCIES: Record<
  Frequency,
  { label: string; hint: string; perWeek: number; gapDays: number }
> = {
  rare: { label: "Tranquille", hint: "2 par semaine au plus", perWeek: 2, gapDays: 4 },
  normal: { label: "Régulier", hint: "4 par semaine au plus", perWeek: 4, gapDays: 2 },
  souvent: { label: "À fond", hint: "1 par jour au plus", perWeek: 7, gapDays: 1 },
};

/** The rhythm the student chose at the start ("tranquille", "regulier", "a-fond") sets the starting one. */
export function frequencyFromGoal(goal: string | undefined): Frequency {
  if (goal === "a-fond") return "souvent";
  if (goal === "tranquille") return "rare";
  return "normal";
}

export type NotifPrefs = {
  enabled: boolean;
  moment: MomentId | "custom";
  /** "HH:MM", local time; used as it is for "custom", otherwise the moment's own. */
  time: string;
  frequency: Frequency;
};

export const DEFAULT_PREFS: NotifPrefs = {
  enabled: false,
  moment: "after-school",
  time: MOMENTS["after-school"].time,
  frequency: "normal",
};

// ------------------------------------------------------------------------------------------ the rules

/** Braise never knocks before 7:00 or after 21:30, whatever the student picks. */
export const EARLIEST_MINUTES = 7 * 60;
export const LATEST_MINUTES = 21 * 60 + 30;

/** After this many messages in a row that got no answer, she stops (and asks, next time). */
export const MAX_UNANSWERED = 3;
/** A message is answered if the app is opened within this long after it. */
const ANSWER_WINDOW = DAY;
/** Not worth a message for fewer notions than this. */
export const MIN_DUE = 2;
/** The messages are planned this far ahead. */
export const HORIZON_DAYS = 14;
const COMEBACK_AFTER_DAYS = 3;
const COMEBACK_AGAIN_AFTER_DAYS = 10;
/** A Déclic's follow-up comes the day after, within this long. */
const FOLLOW_UP_AFTER = 18 * HOUR;
const FOLLOW_UP_WITHIN = 4 * DAY;

export function parseTime(time: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return 17 * 60 + 30;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** The minute of the day Braise comes at, kept inside the quiet hours. */
export function momentMinutes(prefs: NotifPrefs): number {
  const raw =
    prefs.moment === "custom" ? parseTime(prefs.time) : parseTime(MOMENTS[prefs.moment].time);
  return Math.min(LATEST_MINUTES, Math.max(EARLIEST_MINUTES, raw));
}

// ------------------------------------------------------------------------------------------ the plan

export type NotifKind = "rappel" | "declic-suite" | "retrouvailles";

/** Where a tap on the notification leads. */
export type NotifTarget =
  { view: "revisions" } | { view: "chapter"; chapterId: string; subjectId: string };

export type PlannedNotification = {
  id: string;
  at: number;
  kind: NotifKind;
  title: string;
  body: string;
  target: NotifTarget;
};

/** A notion that has a date to come back to. */
export type DueItem = { at: number; label: string; subjectId: string };

/** A Déclic the student has finished, and whether its cards have been seen since. */
export type DeclicDone = {
  id: string;
  title: string;
  chapterId: string;
  subjectId: string;
  completedAt: number;
  cardCount: number;
  reviewed: boolean;
};

/** A message that was really delivered, with when. */
export type SentRecord = { id: string; at: number };

export type PlannerInput = {
  now: number;
  prefs: NotifPrefs;
  tone: Personality;
  name: string;
  /** The last time the app was opened, and a short list of earlier openings. */
  opens: number[];
  due: DueItem[];
  declics: DeclicDone[];
  /** Messages that were really delivered (not merely planned), oldest first. */
  history: SentRecord[];
};

/** How many of the latest delivered messages in a row got no answer. Those from the last 24 hours have
 *  not had their chance yet and do not count. */
export function trailingUnanswered(history: SentRecord[], opens: number[], now: number): number {
  const judged = history.filter((h) => h.at <= now - ANSWER_WINDOW).sort((a, b) => b.at - a.at);
  let count = 0;
  for (const h of judged) {
    const answered = opens.some((o) => o > h.at && o <= h.at + ANSWER_WINDOW);
    if (answered) break;
    count++;
  }
  return count;
}

/** True when Braise has spoken three times in a row without an answer: she stops until asked again. */
export function isBraked(history: SentRecord[], opens: number[], now: number): boolean {
  return trailingUnanswered(history, opens, now) >= MAX_UNANSWERED;
}

export function minutesFor(count: number): number {
  return count <= 3 ? 1 : count <= 8 ? 2 : 3;
}

const dayKey = (t: number): string => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function slotAt(now: number, dayOffset: number, minutes: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setMinutes(minutes);
  return d.getTime();
}

/** The messages Braise would send over the next days, in order. Empty if the student has not agreed, or
 *  if she has been braked. Each slot is one day at the student's moment; a slot gets at most one message. */
export function planNotifications(
  input: PlannerInput,
  horizonDays = HORIZON_DAYS,
): PlannedNotification[] {
  const { now, prefs, history, opens } = input;
  if (!prefs.enabled) return [];
  if (isBraked(history, opens, now)) return [];

  const rule = FREQUENCIES[prefs.frequency];
  const minutes = momentMinutes(prefs);
  const lastOpen = opens.length > 0 ? Math.max(...opens) : now;
  // Messages that go out before the student could possibly answer count against the same budget: the
  // plan assumes the app is not opened in between, because if it is, the plan is made again.
  let budget = MAX_UNANSWERED - trailingUnanswered(history, opens, now);

  const out: PlannedNotification[] = [];
  const followedUp = new Set<string>();
  let comebacks = 0;
  const sent = (): number[] => [...history.map((h) => h.at), ...out.map((o) => o.at)];

  for (let i = 0; i < horizonDays && budget > 0; i++) {
    const at = slotAt(now, i, minutes);
    if (at <= now + 30 * 60_000) continue;
    // A student who already came today needs no message today. If they keep coming, the plan is made
    // again each time and nothing is ever sent: Braise only speaks to someone who is not there.
    if (dayKey(at) === dayKey(lastOpen)) continue;

    // The gap and the weekly limit, counted over everything sent or planned so far.
    const before = sent();
    const last = before.length > 0 ? Math.max(...before) : -Infinity;
    if (at - last < rule.gapDays * DAY - 2 * HOUR) continue;
    if (before.filter((t) => t > at - 7 * DAY && t < at).length >= rule.perWeek) continue;

    const common = { tone: input.tone, name: input.name, seed: Math.floor(at / DAY) };
    let planned: PlannedNotification | null = null;

    // 1. The day after a Déclic: the promise Braise made at its end.
    const follow = input.declics.find(
      (d) =>
        !d.reviewed &&
        !followedUp.has(d.id) &&
        at >= d.completedAt + FOLLOW_UP_AFTER &&
        at <= d.completedAt + FOLLOW_UP_WITHIN,
    );
    if (follow) {
      followedUp.add(follow.id);
      const count = Math.min(3, Math.max(1, follow.cardCount));
      planned = {
        id: `declic-suite-${follow.id}`,
        at,
        kind: "declic-suite",
        ...renderNotification({
          ...common,
          kind: "declic-suite",
          count,
          minutes: minutesFor(count),
          declic: follow.title,
        }),
        target: { view: "chapter", chapterId: follow.chapterId, subjectId: follow.subjectId },
      };
    }

    // 2. A warm word after a few days away, then a second much later, then silence.
    if (!planned) {
      const away = (at - lastOpen) / DAY;
      const firstDue = comebacks === 0 && away >= COMEBACK_AFTER_DAYS;
      const secondDue = comebacks === 1 && away >= COMEBACK_AGAIN_AFTER_DAYS;
      if (firstDue || secondDue) {
        planned = {
          id: `retrouvailles-${dayKey(at)}`,
          at,
          kind: "retrouvailles",
          ...renderNotification({
            ...common,
            kind: "retrouvailles",
            count: 0,
            minutes: 2,
            step: comebacks,
          }),
          target: { view: "revisions" },
        };
        comebacks++;
      }
    }

    // 3. Notions to refresh, when there are enough of them by then.
    if (!planned) {
      const due = input.due.filter((d) => d.at <= at).sort((a, b) => a.at - b.at);
      if (due.length >= MIN_DUE) {
        planned = {
          id: `rappel-${dayKey(at)}`,
          at,
          kind: "rappel",
          ...renderNotification({
            ...common,
            kind: "rappel",
            count: due.length,
            minutes: minutesFor(due.length),
            topic: due[0].label,
          }),
          target: { view: "revisions" },
        };
      }
    }

    if (planned) {
      out.push(planned);
      budget--;
    }
  }
  return out;
}
