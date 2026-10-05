import { describe, it, expect } from "vitest";
import {
  BACKUP_KEYS,
  createBackupCode,
  parseBackupCode,
  applyBackup,
  type ParsedBackup,
} from "@/lib/backup";
import { PROGRESS_KEY, CARDS_KEY } from "@/lib/persist";
import { DECLIC_MEMORY_KEY } from "@/lib/declic";
import { SEEN_RANK_KEY } from "@/lib/celebrations";

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const PROGRESS = JSON.stringify({ xp: 1175, streak: 4, user: { name: "Ethan" } });
const CARDS = JSON.stringify({ fc1: { repetitions: 2, interval: 6, ease: 2.5 } });

function valid(result: ParsedBackup) {
  if (!result.ok) throw new Error(`expected a valid backup, got: ${result.reason}`);
  return result;
}

describe("backup code", () => {
  it("round-trips every backed-up key exactly", async () => {
    const source = fakeStorage({
      [PROGRESS_KEY]: PROGRESS,
      [CARDS_KEY]: CARDS,
      [DECLIC_MEMORY_KEY]: JSON.stringify({ m1: { reformulation: "à moi", at: 1 } }),
      [SEEN_RANK_KEY]: "argent",
    });
    const code = await createBackupCode(source, new Date("2026-10-05T10:00:00Z"));
    const parsed = valid(await parseBackupCode(code));

    for (const key of BACKUP_KEYS) {
      expect(parsed.data[key], key).toBe(source.getItem(key) ?? undefined);
    }
    expect(parsed.summary).toEqual({
      xp: 1175,
      streak: 4,
      name: "Ethan",
      at: "2026-10-05T10:00:00.000Z",
    });
  });

  it("starts with a recognisable prefix and stays small enough to paste", async () => {
    const code = await createBackupCode(
      fakeStorage({ [PROGRESS_KEY]: PROGRESS, [CARDS_KEY]: CARDS }),
    );
    expect(code.startsWith("BRAISE1:")).toBe(true);
    expect(code).toMatch(/^BRAISE1:[A-Za-z0-9_-]+$/);
    expect(code.length).toBeLessThan(2000);
  });

  it("refuses to back up a device that has no progress yet", async () => {
    await expect(createBackupCode(fakeStorage())).rejects.toThrow(/Rien à sauvegarder/);
  });

  it("tolerates the spaces and line breaks a messaging app adds", async () => {
    const code = await createBackupCode(fakeStorage({ [PROGRESS_KEY]: PROGRESS }));
    const wrapped = `  ${code.slice(0, 20)}\n${code.slice(20, 40)} \r\n${code.slice(40)}  `;
    expect(valid(await parseBackupCode(wrapped)).summary.xp).toBe(1175);
  });

  describe("rejects a code that is not a usable backup", () => {
    it("text that is not a BRAISE code", async () => {
      const r = await parseBackupCode("bonjour tout le monde");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/ne ressemble pas/);
    });

    it("a code cut short when it was copied", async () => {
      const code = await createBackupCode(
        fakeStorage({ [PROGRESS_KEY]: PROGRESS, [CARDS_KEY]: CARDS }),
      );
      const r = await parseBackupCode(code.slice(0, code.length - 15));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/incomplet/);
    });

    it("a backup with no readable progress", async () => {
      const code = await createBackupCode(fakeStorage({ [PROGRESS_KEY]: "{not json" }));
      const r = await parseBackupCode(code);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/progression/);
    });

    it("a backup whose cards are not an object", async () => {
      const code = await createBackupCode(
        fakeStorage({ [PROGRESS_KEY]: PROGRESS, [CARDS_KEY]: "[1,2]" }),
      );
      const r = await parseBackupCode(code);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/cartes/);
    });

    it("a payload that decompresses to far more than any real save", async () => {
      const huge = JSON.stringify({
        v: 1,
        at: "",
        data: { [PROGRESS_KEY]: PROGRESS, [DECLIC_MEMORY_KEY]: "x".repeat(700_000) },
      });
      const stream = new Blob([huge]).stream().pipeThrough(new CompressionStream("gzip"));
      const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      let binary = "";
      for (const b of bytes) binary += String.fromCharCode(b);
      const code =
        "BRAISE1:" + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      expect((await parseBackupCode(code)).ok).toBe(false);
    });
  });

  it("only ever carries the whitelisted keys, so a pasted code cannot plant others", async () => {
    const payload = {
      v: 1,
      at: "2026-10-05T10:00:00.000Z",
      data: { [PROGRESS_KEY]: PROGRESS, sapie_device_secret: "stolen", anything_else: "x" },
    };
    const stream = new Blob([JSON.stringify(payload)])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const code =
      "BRAISE1:" + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const parsed = valid(await parseBackupCode(code));
    expect(Object.keys(parsed.data)).toEqual([PROGRESS_KEY]);

    const target = fakeStorage({ sapie_device_secret: "mine" });
    applyBackup(parsed.data, target);
    expect(target.getItem("sapie_device_secret")).toBe("mine");
    expect(target.getItem("anything_else")).toBeNull();
  });
});

describe("applyBackup", () => {
  it("replaces rather than merges: keys missing from the backup are cleared", () => {
    const target = fakeStorage({
      [PROGRESS_KEY]: JSON.stringify({ xp: 5, user: {} }),
      [CARDS_KEY]: CARDS,
      [SEEN_RANK_KEY]: "or",
    });
    applyBackup({ [PROGRESS_KEY]: PROGRESS }, target);
    expect(target.getItem(PROGRESS_KEY)).toBe(PROGRESS);
    expect(target.getItem(CARDS_KEY)).toBeNull();
    expect(target.getItem(SEEN_RANK_KEY)).toBeNull();
  });

  it("leaves the device identity untouched", () => {
    const target = fakeStorage({ sapie_device_id: "abc", sapie_device_secret: "def" });
    applyBackup({ [PROGRESS_KEY]: PROGRESS }, target);
    expect(target.getItem("sapie_device_id")).toBe("abc");
    expect(target.getItem("sapie_device_secret")).toBe("def");
  });
});
