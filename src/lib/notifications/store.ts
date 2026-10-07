// What the app remembers about Braise's reminders, on the device only: the student's choices, when the app
// was opened, what was really delivered, the plan, and how the invitation went. The same small external
// store pattern as the course progress, so React can subscribe and the tests use an in-memory storage.
import { DEFAULT_PREFS, type NotifPrefs, type PlannedNotification, type SentRecord } from "./model";

export const NOTIF_KEY = "braise_notifications";
const DAY = 86_400_000;
/** The same opening seen twice within this long (a reload) counts once. */
const SAME_OPENING = 10 * 60_000;
const MAX_OPENS = 30;
const MAX_HISTORY = 40;
/** The invitation is made at most twice, at least two weeks apart. */
export const MAX_INVITES = 2;
export const INVITE_PAUSE = 14 * DAY;

export type NotifState = {
  version: 1;
  prefs: NotifPrefs;
  opens: number[];
  /** Messages really delivered to the student's phone (not merely planned): what the brake reads. */
  history: SentRecord[];
  /** The plan as last made, for the preview of the week. */
  plan: PlannedNotification[];
  /** Whether that plan was handed to the phone, or only computed. */
  planDelivered: boolean;
  invite: { dismissals: number; lastDismissedAt: number | null };
};

export function emptyNotifState(): NotifState {
  return {
    version: 1,
    prefs: { ...DEFAULT_PREFS },
    opens: [],
    history: [],
    plan: [],
    planDelivered: false,
    invite: { dismissals: 0, lastDismissedAt: null },
  };
}

// ------------------------------------------------------------------------------------------ changes

export function recordOpen(s: NotifState, now: number): NotifState {
  const last = s.opens[s.opens.length - 1];
  if (last !== undefined && now - last < SAME_OPENING) return s;
  return { ...s, opens: [...s.opens, now].slice(-MAX_OPENS) };
}

export function setPrefs(s: NotifState, prefs: NotifPrefs): NotifState {
  return { ...s, prefs };
}

/** Keeps the new plan, and files the messages of the previous plan whose time has passed as delivered, if
 *  that plan really was handed to the phone. */
export function savePlan(
  s: NotifState,
  plan: PlannedNotification[],
  delivered: boolean,
  now: number,
): NotifState {
  const passed = s.planDelivered
    ? s.plan.filter((p) => p.at <= now).map((p) => ({ id: p.id, at: p.at }))
    : [];
  const known = new Set(s.history.map((h) => h.id + h.at));
  const history = [...s.history, ...passed.filter((p) => !known.has(p.id + p.at))].slice(
    -MAX_HISTORY,
  );
  return { ...s, history, plan, planDelivered: delivered };
}

export function dismissInvite(s: NotifState, now: number): NotifState {
  return { ...s, invite: { dismissals: s.invite.dismissals + 1, lastDismissedAt: now } };
}

/** The student's answer when Braise has gone quiet: come back less often, or stay away. Either way the
 *  count of unanswered messages starts again from nothing. */
export function answerBrake(s: NotifState, comeBack: boolean): NotifState {
  return comeBack
    ? { ...s, history: [], prefs: { ...s.prefs, enabled: true, frequency: "rare" } }
    : { ...s, history: [], prefs: { ...s.prefs, enabled: false } };
}

/** Whether to show the invitation now: only to someone who has had a taste of the app, who has not
 *  agreed, and who has not already said "not now" too often or too recently. */
export function shouldInvite(s: NotifState, hasTasted: boolean, now: number): boolean {
  if (s.prefs.enabled || !hasTasted) return false;
  if (s.invite.dismissals >= MAX_INVITES) return false;
  const last = s.invite.lastDismissedAt;
  return last === null || now - last >= INVITE_PAUSE;
}

// ------------------------------------------------------------------------------------------ storage

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function parseNotifState(raw: string | null): NotifState {
  const empty = emptyNotifState();
  if (!raw) return empty;
  try {
    const d: unknown = JSON.parse(raw);
    if (!isRecord(d) || d.version !== 1) return empty;
    const prefs = isRecord(d.prefs)
      ? { ...DEFAULT_PREFS, ...(d.prefs as Partial<NotifPrefs>) }
      : empty.prefs;
    const invite = isRecord(d.invite)
      ? {
          dismissals: Number((d.invite as Record<string, unknown>).dismissals) || 0,
          lastDismissedAt:
            typeof (d.invite as Record<string, unknown>).lastDismissedAt === "number"
              ? ((d.invite as Record<string, unknown>).lastDismissedAt as number)
              : null,
        }
      : empty.invite;
    return {
      version: 1,
      prefs,
      opens: Array.isArray(d.opens)
        ? (d.opens as unknown[]).filter((x): x is number => typeof x === "number")
        : [],
      history: Array.isArray(d.history)
        ? (d.history as SentRecord[]).filter((h) => isRecord(h) && typeof h.at === "number")
        : [],
      plan: Array.isArray(d.plan) ? (d.plan as PlannedNotification[]) : [],
      planDelivered: d.planDelivered === true,
      invite,
    };
  } catch {
    return empty;
  }
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type NotifStore = {
  get: () => NotifState;
  update: (change: (s: NotifState) => NotifState) => NotifState;
  subscribe: (listener: () => void) => () => void;
};

export function createNotifStore(storage: StorageLike | null): NotifStore {
  const read = () => {
    try {
      return parseNotifState(storage?.getItem(NOTIF_KEY) ?? null);
    } catch {
      return emptyNotifState();
    }
  };
  let cache = read();
  const listeners = new Set<() => void>();
  return {
    get: () => cache,
    update(change) {
      const next = change(cache);
      if (next === cache) return cache;
      cache = next;
      try {
        storage?.setItem(NOTIF_KEY, JSON.stringify(cache));
      } catch {
        // storage full or blocked: the choices live in memory for this visit
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

export const notifStore: NotifStore = createNotifStore(browserStorage());
