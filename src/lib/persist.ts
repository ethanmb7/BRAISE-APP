import type { AppState, UserProfile, CardReview, Confidence, ViewId, TabId } from "@/types";
import { supabase, supabaseConfigured, getDeviceId, getDeviceSecret } from "./supabase";

export const PROGRESS_KEY = "sapie_progress";
export const CARDS_KEY = "sapie_card_reviews";

type StoredProgress = {
  xp: number;
  streak: number;
  bestCombo: number;
  freezes: number;
  freezeArmed: boolean;
  everUsedFreeze: boolean;
  onboardingCompleted?: boolean;
  dailyGoalMet: boolean;
  darkMode: boolean;
  dyslexiaMode: boolean;
  soundOn: boolean;
  user: UserProfile;
  completedChapters: string[];
  lastSubjectId: string | null;
  lastChapterId: string | null;
  sessionDate: string;
  sessionXpEarned: number;
  // Where the device was, not just its progress — a reload used to always drop back to 'home'
  // (hardcoded in store.tsx's mount effect) even mid-lesson, because none of this was ever saved.
  // Local-only, like bestCombo/lastSubjectId/lastChapterId below: "which screen this device was
  // on" isn't progress worth syncing across devices, and device_progress has no columns for it.
  view: ViewId;
  tab: TabId;
  currentSubjectId: string | null;
  currentChapterId: string | null;
};

// Mirrors the real `device_progress` columns (supabase/migrations/20260730074908_...). That
// migration predates `bestCombo`/`lastSubjectId`/`lastChapterId` on AppState, so those three
// still have no column here — they stay localStorage-only below rather than being silently
// dropped or guessed into some other column. session_xp_earned joins them for the same reason:
// it replaced session_cards_reviewed/session_chapters_done (the goal used to weight a chapter as
// "worth 3 cards" while XP weighted it at 5x — two numbers for the same day that disagreed; see
// their own removal in this file's history), and no migration for the new column exists yet.
type DeviceProgressRow = {
  device_id: string;
  device_secret: string;
  xp: number;
  streak: number;
  freezes: number;
  freeze_armed: boolean;
  daily_goal_met: boolean;
  dark_mode: boolean;
  dyslexia_mode: boolean;
  sound_on: boolean;
  profile: UserProfile;
  completed_chapters: string[];
  session_date: string;
};

type CardReviewRow = {
  device_id: string;
  card_id: string;
  repetitions: number;
  interval: number;
  ease: number;
  next_review_at: number;
  last_confidence: Confidence;
};

function readLocalProgress(): StoredProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as StoredProgress) : null;
  } catch {
    return null;
  }
}

function readLocalCardReviews(): Record<string, CardReview> {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardReview>) : {};
  } catch {
    return {};
  }
}

function toAppState(p: StoredProgress, cardReviews: Record<string, CardReview>): Partial<AppState> {
  return {
    xp: p.xp,
    streak: p.streak,
    bestCombo: p.bestCombo ?? 0,
    freezes: p.freezes,
    freezeArmed: p.freezeArmed,
    // `?? false`: a device that saved its progress before this field existed has never had the
    // chance to earn it — never assume it's already true for an older save.
    everUsedFreeze: p.everUsedFreeze ?? false,
    // `?? true`: a save from before this field existed belongs to someone already using the app —
    // sending them back through onboarding would be wrong. Only a real `false` means "not done".
    onboardingCompleted: p.onboardingCompleted ?? true,
    dailyGoalMet: p.dailyGoalMet,
    darkMode: p.darkMode,
    dyslexiaMode: p.dyslexiaMode,
    soundOn: p.soundOn,
    user: { ...p.user, personality: p.user?.personality ?? "chill" },
    completedChapters: p.completedChapters ?? [],
    lastSubjectId: p.lastSubjectId ?? null,
    lastChapterId: p.lastChapterId ?? null,
    cardReviews,
    sessionDate: p.sessionDate ?? "",
    sessionXpEarned: p.sessionXpEarned ?? 0,
    view: p.view ?? "home",
    tab: p.tab ?? "home",
    currentSubjectId: p.currentSubjectId ?? null,
    currentChapterId: p.currentChapterId ?? null,
  };
}

// Cloud is the source of truth when it answers: tries `device_progress`/`card_reviews` first,
// and only falls back to the local copy if Supabase isn't configured, errors out, or simply has
// no row yet for this device (first run, or a project that was just wired up).
export async function loadProgress(): Promise<Partial<AppState> | null> {
  const local = readLocalProgress();
  const localCardReviews = readLocalCardReviews();

  if (supabaseConfigured && supabase) {
    try {
      const deviceId = getDeviceId();
      const [{ data: row, error: rowErr }, { data: cardRows, error: cardsErr }] = await Promise.all(
        [
          supabase.from("device_progress").select("*").eq("device_id", deviceId).maybeSingle(),
          supabase.from("card_reviews").select("*").eq("device_id", deviceId),
        ],
      );

      if (!rowErr && row) {
        const cardReviews: Record<string, CardReview> = {};
        if (!cardsErr && cardRows) {
          for (const r of cardRows as CardReviewRow[]) {
            cardReviews[r.card_id] = {
              repetitions: r.repetitions,
              interval: r.interval,
              ease: r.ease,
              nextReviewAt: r.next_review_at,
              lastConfidence: r.last_confidence,
            };
          }
        }
        const cloudRow = row as DeviceProgressRow;
        return toAppState(
          {
            xp: cloudRow.xp,
            streak: cloudRow.streak,
            // Not in device_progress yet — carry over the local cache instead of zeroing them.
            bestCombo: local?.bestCombo ?? 0,
            freezes: cloudRow.freezes,
            freezeArmed: cloudRow.freeze_armed,
            // Not in device_progress either — same reasoning as bestCombo above.
            everUsedFreeze: local?.everUsedFreeze ?? false,
            onboardingCompleted: local?.onboardingCompleted ?? true,
            dailyGoalMet: cloudRow.daily_goal_met,
            darkMode: cloudRow.dark_mode,
            dyslexiaMode: cloudRow.dyslexia_mode,
            soundOn: cloudRow.sound_on,
            user: cloudRow.profile,
            completedChapters: cloudRow.completed_chapters ?? [],
            lastSubjectId: local?.lastSubjectId ?? null,
            lastChapterId: local?.lastChapterId ?? null,
            sessionDate: cloudRow.session_date,
            // Not in device_progress either — same reasoning as bestCombo above.
            sessionXpEarned: local?.sessionXpEarned ?? 0,
            view: local?.view ?? "home",
            tab: local?.tab ?? "home",
            currentSubjectId: local?.currentSubjectId ?? null,
            currentChapterId: local?.currentChapterId ?? null,
          },
          cardReviews,
        );
      }
    } catch {
      // Network/config error — fall through to the local copy below.
    }
  }

  return local ? toAppState(local, localCardReviews) : null;
}

export async function saveProgress(state: AppState): Promise<void> {
  const row: StoredProgress = {
    xp: state.xp,
    streak: state.streak,
    bestCombo: state.bestCombo,
    freezes: state.freezes,
    freezeArmed: state.freezeArmed,
    // Local-only, like bestCombo/view/tab below — device_progress has no matching column yet.
    everUsedFreeze: state.everUsedFreeze,
    onboardingCompleted: state.onboardingCompleted,
    dailyGoalMet: state.dailyGoalMet,
    darkMode: state.darkMode,
    dyslexiaMode: state.dyslexiaMode,
    soundOn: state.soundOn,
    user: state.user,
    completedChapters: state.completedChapters,
    lastSubjectId: state.lastSubjectId,
    lastChapterId: state.lastChapterId,
    sessionDate: state.sessionDate,
    sessionXpEarned: state.sessionXpEarned,
    view: state.view,
    tab: state.tab,
    currentSubjectId: state.currentSubjectId,
    currentChapterId: state.currentChapterId,
  };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(row));
  } catch {
    /* ignore quota errors */
  }

  if (supabaseConfigured && supabase) {
    try {
      const dbRow: DeviceProgressRow = {
        device_id: getDeviceId(),
        device_secret: getDeviceSecret(),
        xp: state.xp,
        streak: state.streak,
        freezes: state.freezes,
        freeze_armed: state.freezeArmed,
        daily_goal_met: state.dailyGoalMet,
        dark_mode: state.darkMode,
        dyslexia_mode: state.dyslexiaMode,
        sound_on: state.soundOn,
        profile: state.user,
        completed_chapters: state.completedChapters,
        session_date: state.sessionDate,
      };
      await supabase.from("device_progress").upsert(dbRow);
    } catch {
      // Best-effort cloud sync — the localStorage write above already succeeded.
    }
  }
}

export async function saveCardReview(cardId: string, review: CardReview): Promise<void> {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    const cards = raw ? (JSON.parse(raw) as Record<string, CardReview>) : {};
    cards[cardId] = review;
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  } catch {
    /* ignore quota errors */
  }

  if (supabaseConfigured && supabase) {
    try {
      const row: CardReviewRow = {
        device_id: getDeviceId(),
        card_id: cardId,
        repetitions: review.repetitions,
        interval: review.interval,
        ease: review.ease,
        next_review_at: review.nextReviewAt,
        last_confidence: review.lastConfidence,
      };
      await supabase.from("card_reviews").upsert(row, { onConflict: "device_id,card_id" });
    } catch {
      // Best-effort cloud sync — the localStorage write above already succeeded.
    }
  }
}

export type { Confidence };
