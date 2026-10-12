import { describe, it, expect } from "vitest";
import { resetEverything, resetRequest } from "./reset";
import { applyStartupRequests, withoutStartupParams } from "./startup";
import { DEMO_FLAG_KEY, DEMO_STASH_KEY, enterDemo, isDemo } from "./demo/demo";

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const NOW = Date.UTC(2026, 9, 12, 10, 0, 0);

describe("resetEverything", () => {
  it("erases what the app keeps and nothing else", () => {
    const s = fakeStorage({
      sapie_progress: "1",
      sapie_card_reviews: "2",
      sapie_course_progress: "3",
      braise_notifications: "4",
      braise_tip_glossary: "1",
      braise_demo: "1",
      braise_demo_stash: "{}",
      sapie_device_id: "keep-me",
      sapie_device_secret: "keep-me-too",
      "sb-something-auth-token": "other",
      unrelated: "keep",
    });
    expect(resetEverything(s)).toBe(7);
    expect([...s.map.keys()].sort()).toEqual([
      "sapie_device_id",
      "sapie_device_secret",
      "sb-something-auth-token",
      "unrelated",
    ]);
  });

  it("does nothing on an empty device", () => {
    expect(resetEverything(fakeStorage())).toBe(0);
  });
});

describe("the address at startup", () => {
  it("reads ?reset", () => {
    expect(resetRequest("")).toBe(false);
    expect(resetRequest("?demo")).toBe(false);
    expect(resetRequest("?reset")).toBe(true);
    expect(resetRequest("?a=1&reset=1")).toBe(true);
  });

  it("does nothing, and says so, when the address asks for nothing", () => {
    const s = fakeStorage({ sapie_progress: "keep" });
    expect(applyStartupRequests("https://x.test/", s, NOW)).toBeNull();
    expect(s.getItem("sapie_progress")).toBe("keep");
  });

  it("erases on ?reset and goes back to the same address without it", () => {
    const s = fakeStorage({ sapie_progress: "x", braise_notifications: "y", unrelated: "keep" });
    expect(applyStartupRequests("https://x.test/a?b=2&reset=1#c", s, NOW)).toBe("/a?b=2#c");
    expect(s.getItem("sapie_progress")).toBeNull();
    expect(s.getItem("braise_notifications")).toBeNull();
    expect(s.getItem("unrelated")).toBe("keep");
  });

  it("starts the demo on ?demo and leaves it on ?demo=off, giving back the student's own data", () => {
    const s = fakeStorage({ sapie_progress: '{"xp":42,"user":{"name":"Sam"}}' });
    expect(applyStartupRequests("https://x.test/?demo", s, NOW)).toBe("/");
    expect(isDemo(s)).toBe(true);
    expect(applyStartupRequests("https://x.test/?demo=off", s, NOW)).toBe("/");
    expect(isDemo(s)).toBe(false);
    expect(s.getItem("sapie_progress")).toBe('{"xp":42,"user":{"name":"Sam"}}');
  });

  it("erases first, then shows the demo, when asked for both", () => {
    const s = fakeStorage({ sapie_progress: "old" });
    expect(applyStartupRequests("https://x.test/?reset&demo", s, NOW)).toBe("/");
    expect(isDemo(s)).toBe(true);
    expect(JSON.parse(s.getItem("sapie_progress")!).user.name).toBe("Léa");
  });

  it("a reset during the demo erases the demo and what it set aside", () => {
    const s = fakeStorage({ sapie_progress: "mine" });
    enterDemo(s, NOW);
    applyStartupRequests("https://x.test/?reset", s, NOW);
    expect(s.getItem(DEMO_FLAG_KEY)).toBeNull();
    expect(s.getItem(DEMO_STASH_KEY)).toBeNull();
    expect(s.getItem("sapie_progress")).toBeNull();
  });

  it("drops only the startup parameters from an address", () => {
    expect(withoutStartupParams("https://x.test/?demo")).toBe("/");
    expect(withoutStartupParams("https://x.test/a/?demo=1&b=2&reset#c")).toBe("/a/?b=2#c");
  });
});
