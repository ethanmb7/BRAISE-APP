// Backup by code: a student's progress lives only on their device (there is no account and, until
// a Supabase project is wired up, no cloud copy either), so a new phone, a cleared browser or a
// reinstall would otherwise start from zero. The code is the progress itself — compressed and made
// copy-pastable — so it can be sent to oneself in any messaging app. Nothing leaves the device and
// nothing is collected.
import { PROGRESS_KEY, CARDS_KEY } from "@/lib/persist";
import { DECLIC_MEMORY_KEY } from "@/lib/declic";
import {
  SEEN_RANK_KEY,
  SEEN_BADGES_KEY,
  BADGE_UNLOCKED_AT_KEY,
  INTOX_DISMISSED_COUNT_KEY,
} from "@/lib/celebrations";

// Only these keys are ever read or written. The "seen" flags are included so a restore doesn't
// replay every rank-up and badge celebration the student already had. The device id and secret
// are deliberately not: they identify this device, not the student's progress.
export const BACKUP_KEYS = [
  PROGRESS_KEY,
  CARDS_KEY,
  DECLIC_MEMORY_KEY,
  SEEN_RANK_KEY,
  SEEN_BADGES_KEY,
  BADGE_UNLOCKED_AT_KEY,
  INTOX_DISMISSED_COUNT_KEY,
] as const;

const PREFIX = "BRAISE1:";
const MAX_DECODED_BYTES = 512 * 1024; // real progress is a few KB; this only stops a hostile code

type Payload = { v: 1; at: string; data: Record<string, string> };

export type BackupSummary = { xp: number; streak: number; name: string; at: string };
export type ParsedBackup =
  | { ok: true; data: Record<string, string>; summary: BackupSummary }
  | { ok: false; reason: string };

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function gzip(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new Error("too large");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(all);
}

export async function createBackupCode(
  storage: ReadableStorage = localStorage,
  now: Date = new Date(),
): Promise<string> {
  const data: Record<string, string> = {};
  for (const key of BACKUP_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) data[key] = value;
  }
  if (!data[PROGRESS_KEY]) throw new Error("Rien à sauvegarder pour l’instant.");
  const payload: Payload = { v: 1, at: now.toISOString(), data };
  return PREFIX + toBase64Url(await gzip(JSON.stringify(payload)));
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export async function parseBackupCode(code: string): Promise<ParsedBackup> {
  // Messaging apps wrap long lines and add spaces; none of that is part of the code.
  const compact = code.replace(/\s+/g, "");
  if (!compact.startsWith(PREFIX)) {
    return { ok: false, reason: "Ce code ne ressemble pas à une sauvegarde BRAISE." };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await gunzip(fromBase64Url(compact.slice(PREFIX.length))));
  } catch {
    return { ok: false, reason: "Code incomplet ou abîmé. Vérifie que tu l’as copié en entier." };
  }

  if (!isRecord(payload) || payload.v !== 1 || !isRecord(payload.data)) {
    return { ok: false, reason: "Cette sauvegarde vient d’une version que je ne reconnais pas." };
  }

  // Whitelist: a pasted code can never write a key outside BACKUP_KEYS.
  const data: Record<string, string> = {};
  for (const key of BACKUP_KEYS) {
    const value = payload.data[key];
    if (typeof value === "string") data[key] = value;
  }

  let progress: unknown;
  try {
    progress = JSON.parse(data[PROGRESS_KEY] ?? "");
  } catch {
    progress = null;
  }
  if (!isRecord(progress) || typeof progress.xp !== "number" || !isRecord(progress.user)) {
    return { ok: false, reason: "Cette sauvegarde ne contient pas de progression lisible." };
  }
  if (data[CARDS_KEY] !== undefined) {
    try {
      if (!isRecord(JSON.parse(data[CARDS_KEY]))) throw new Error("not an object");
    } catch {
      return { ok: false, reason: "Les cartes de cette sauvegarde sont illisibles." };
    }
  }

  return {
    ok: true,
    data,
    summary: {
      xp: progress.xp,
      streak: typeof progress.streak === "number" ? progress.streak : 0,
      name: typeof progress.user.name === "string" ? progress.user.name : "",
      at: typeof payload.at === "string" ? payload.at : "",
    },
  };
}

// Replaces rather than merges: a key absent from the backup is cleared, so the device ends up in
// exactly the state that was saved instead of a mix of two students' histories.
export function applyBackup(
  data: Record<string, string>,
  storage: WritableStorage = localStorage,
): void {
  for (const key of BACKUP_KEYS) {
    if (key in data) storage.setItem(key, data[key]);
    else storage.removeItem(key);
  }
}
