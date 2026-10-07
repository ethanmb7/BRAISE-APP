import { useEffect } from "react";
import { FLASHCARDS } from "@/data";
import { useApp } from "@/store";
import { COURSE_REGISTRY } from "@/lib/course/registry";
import { useCourseProgress } from "@/lib/course/useCourseProgress";
import { buildPlannerInput } from "./input";
import { getDelivery } from "./delivery";
import { planNotifications } from "./model";
import { notifStore, recordOpen, savePlan } from "./store";
import { useNotifState } from "./useNotifState";

const SOURCE = {
  chapters: COURSE_REGISTRY.chapters,
  declics: COURSE_REGISTRY.declics,
  decks: COURSE_REGISTRY.decks,
};

/** Keeps Braise's reminders in step with the student: notes that the app was opened, and, whenever their
 *  choices or their progress change, makes the plan again and hands it to the phone (replacing the
 *  previous one, so a reminder for notions already revised never goes out). Mounted once, in App. */
export function useNotificationSync(): void {
  const { state, loaded } = useApp();
  const course = useCourseProgress();
  const { prefs } = useNotifState();

  useEffect(() => {
    if (loaded) notifStore.update((s) => recordOpen(s, Date.now()));
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    // A short pause, so a burst of changes (a review session) makes one plan, not twenty.
    const timer = setTimeout(async () => {
      const now = Date.now();
      const s = notifStore.get();
      const plan = planNotifications(
        buildPlannerInput({
          now,
          prefs: s.prefs,
          tone: state.user.personality,
          name: state.user.name,
          opens: s.opens,
          history: s.history,
          flashcards: FLASHCARDS,
          cardReviews: state.cardReviews,
          course,
          source: SOURCE,
        }),
      );
      const delivery = getDelivery();
      let delivered = false;
      try {
        await delivery.cancelAll();
        if (s.prefs.enabled && (await delivery.permission()) === "granted") {
          delivered = await delivery.schedule(plan);
        }
      } catch {
        delivered = false;
      }
      notifStore.update((cur) => savePlan(cur, plan, delivered, now));
    }, 1500);
    return () => clearTimeout(timer);
  }, [loaded, prefs, state.cardReviews, state.user.personality, state.user.name, course]);
}
