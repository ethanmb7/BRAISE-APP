// How a planned reminder reaches the student. Two ways, and the app knows only this interface:
//
//  - on the web, the browser's Notification API. It can show a notification now (so the student can try
//    one), but a page that is closed cannot schedule one for later: nothing is planned ahead.
//  - on a phone, the local notifications of the native shell. They are scheduled on the device, with no
//    server. The shell registers its implementation once at start with `setNativeDelivery`; this file
//    does not import any native library, so the web build stays as it is.
//
// The native implementation is NOT written or tested yet: it needs the native shell (see NOTIFICATIONS.md).
import type { PlannedNotification } from "./model";

export type Permission = "granted" | "denied" | "default" | "unsupported";

export interface Delivery {
  /** "native": scheduled on the phone. "web": only shown now. "none": nothing can be shown. */
  readonly kind: "native" | "web" | "none";
  permission(): Promise<Permission>;
  request(): Promise<Permission>;
  /** Hands the whole plan to the system, replacing what was there. Returns whether it was really
   *  scheduled (false when it cannot be, as on the web). */
  schedule(plan: PlannedNotification[]): Promise<boolean>;
  cancelAll(): Promise<void>;
  /** Shows one notification right now, to let the student try. Returns whether it could be shown. */
  showNow(title: string, body: string): Promise<boolean>;
}

const webDelivery: Delivery = {
  kind: "web",
  async permission() {
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission;
  },
  async request() {
    if (typeof Notification === "undefined") return "unsupported";
    try {
      return await Notification.requestPermission();
    } catch {
      return "denied";
    }
  },
  async schedule() {
    return false;
  },
  async cancelAll() {
    /* nothing was scheduled */
  },
  async showNow(title, body) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
    try {
      new Notification(title, { body, tag: "braise-test", icon: "/favicon.png" });
      return true;
    } catch {
      return false;
    }
  },
};

let native: Delivery | null = null;

/** Called once by the native shell, with an implementation on top of its local notifications. */
export function setNativeDelivery(delivery: Delivery | null): void {
  native = delivery;
}

export function getDelivery(): Delivery {
  return native ?? webDelivery;
}
