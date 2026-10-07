import { useSyncExternalStore } from "react";
import { emptyNotifState, notifStore, type NotifState } from "./store";

const SERVER_SNAPSHOT = emptyNotifState();

/** The reminders' state, re-rendering the component whenever it changes. */
export function useNotifState(): NotifState {
  return useSyncExternalStore(notifStore.subscribe, notifStore.get, () => SERVER_SNAPSHOT);
}
