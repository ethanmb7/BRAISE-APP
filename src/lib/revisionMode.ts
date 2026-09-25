export type RevisionMode = "mix" | "express";

const REVISION_MODE_KEY = "braise_revision_mode";
export const REVISION_SNAPSHOT_KEY = "sapie_rev_session";

export const REVISION_MODE_SIZE: Record<RevisionMode, number> = {
  mix: 15,
  express: 5,
};

export function selectRevisionMode(mode: RevisionMode) {
  try {
    sessionStorage.setItem(REVISION_MODE_KEY, mode);
    sessionStorage.removeItem(REVISION_SNAPSHOT_KEY);
  } catch {
    // The game still opens with the default mix if storage is unavailable.
  }
}

export function getRevisionMode(): RevisionMode {
  try {
    return sessionStorage.getItem(REVISION_MODE_KEY) === "express" ? "express" : "mix";
  } catch {
    return "mix";
  }
}
