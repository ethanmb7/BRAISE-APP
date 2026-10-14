// Measures the real text contrast of the running app: every visible piece of text on the main screens
// and through a Déclic, in light and in dark mode, against WCAG 2.1 AA (4.5:1, or 3:1 for large text).
// It looks at what is drawn, so it catches what contrast.test.ts cannot: a colour that comes out
// wrong only once a token is resolved in dark mode, or on a tinted surface.
//
//   npm run dev                      # in one terminal
//   npm run audit:contrast           # in another (needs Google Chrome; CHROME=/path to use another)
//
// Exits 1 if something fails. The few "known" entries below are readings the script cannot get right
// (a label whose background is a sibling element behind it, an icon whose colour is a `fill`).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;

// Selector fragments (as the script prints them) that are false readings, with why.
const KNOWN = [
  [".fc-watermark", "decorative watermark behind a card"],
  [".aura-sparkle", "decorative sparkle"],
  [".seg-opt", "the label sits on a white thumb that is a separate element behind it"],
  [".braise-tab-label", "the label sits on the orange puck, a separate element behind it"],
  ["text < svg", "an icon glyph: its colour is the SVG's own fill, not `color`"],
];
const EMOJI_ONLY = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}✦·\s]+$/u;

const SCREENS = [
  ["home", { view: "home", tab: "home" }],
  ["hub", { view: "subjects", tab: "subjects" }],
  // the chapters of the world Braise suggests, opened by touching it
  [
    "hub, volet",
    { view: "subjects", tab: "subjects" },
    `document.querySelector(".planet.is-suggested")?.click()`,
  ],
  ["revisions", { view: "revisions", tab: "revisions" }],
  ["aura", { view: "progres", tab: "progres" }],
  ["moi", { view: "profile", tab: "profile" }],
  ["settings", { view: "settings", tab: "profile" }],
  ["matiere", { view: "subject", tab: "subjects", currentSubjectId: "maths" }],
];
const DECLICS = [
  [
    "declic",
    {
      view: "lesson",
      tab: "subjects",
      currentSubjectId: "histoire-geo",
      currentChapterId: "h3",
      completedChapters: [],
    },
  ],
  [
    "cours",
    { view: "lesson", tab: "subjects", currentSubjectId: "maths", currentChapterId: "M2-ARI" },
  ],
];

const PAGE_AUDIT = `(() => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const parse = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (t, b) => { const a = t[3] + b[3] * (1 - t[3]); if (!a) return [0,0,0,0]; return [0,1,2].map((i) => (t[i]*t[3] + b[i]*b[3]*(1-t[3]))/a).concat([a]); };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const L = (c) => 0.2126*lin(c[0]) + 0.7152*lin(c[1]) + 0.0722*lin(c[2]);
  const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
  const stops = (img) => (img.match(/(rgba?\\([^)]*\\)|color\\([^)]*\\)|#[0-9a-f]{3,8})/gi) || []).map(parse);
  const cls = (e) => e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : "");
  const out = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode()); ) {
    const text = n.nodeValue.replace(/\\s+/g, " ").trim(); if (!text) continue;
    const el = n.parentElement; if (!el || el.closest("script,style")) continue;
    const range = document.createRange(); range.selectNodeContents(n); const rect = range.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || cs.clipPath !== "none") continue;
    if (el.closest("button:disabled, [disabled], [aria-disabled='true']")) continue;
    let opacity = 1, hidden = false;
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const s = getComputedStyle(p); opacity *= parseFloat(s.opacity); if (s.display === "none") hidden = true; }
    if (hidden || opacity < 0.05) continue;
    const layers = []; let gradient = null, opaque = false;
    for (let p = el; p && !opaque; p = p.parentElement) {
      const s = getComputedStyle(p); const bg = parse(s.backgroundColor);
      if (s.backgroundImage !== "none" && !/url\\(/.test(s.backgroundImage) && !gradient) gradient = stops(s.backgroundImage);
      if (bg[3] > 0) { layers.push(bg); if (bg[3] >= 0.99) opaque = true; }
    }
    if (!opaque) layers.push([255, 255, 255, 1]);
    let base = layers[layers.length - 1]; for (let i = layers.length - 2; i >= 0; i--) base = over(layers[i], base);
    const backs = gradient && gradient.length ? gradient.map((g) => over(g, base)) : [base];
    let fg = parse(cs.color); fg = [fg[0], fg[1], fg[2], fg[3] * opacity];
    let worst = 99; for (const b of backs) worst = Math.min(worst, ratio(over(fg, b), b));
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    if (worst >= need) continue;
    const sel = cls(el) + (el.parentElement ? " < " + cls(el.parentElement) : "");
    const key = sel + "|" + cs.color; if (seen.has(key)) continue; seen.add(key);
    out.push({ sel, text, ratio: +worst.toFixed(2), need, size: +size.toFixed(1), fg: cs.color });
  }
  return out;
})()`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), "braise-audit-"))}`,
      "--no-first-run",
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let wsUrl;
  for (let i = 0; i < 80 && !wsUrl; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      wsUrl = tabs.find((t) => t.type === "page")?.webSocketDebuggerUrl;
    } catch {
      /* Chrome is still starting */
    }
    await sleep(250);
  }
  if (!wsUrl) throw new Error(`Could not start Chrome (${CHROME}). Set CHROME=/path/to/chrome.`);
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d);
      pending.delete(d.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const n = ++id;
      pending.set(n, res);
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.result?.exceptionDetails)
      throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    return r.result.result.value;
  };
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const patch = (p) =>
    ev(
      `(() => { const s = JSON.parse(localStorage.getItem("sapie_progress")); Object.assign(s, ${JSON.stringify(p)}); localStorage.setItem("sapie_progress", JSON.stringify(s)); })()`,
    );
  return {
    ev,
    async open(path) {
      await send("Page.navigate", { url: BASE + path });
      await sleep(7000);
    },
    async load(p) {
      await patch({ darkMode: false, soundOn: false, hapticsOn: false, ...p });
      await send("Page.reload");
      await sleep(4500);
    },
    close() {
      ws.close();
      chrome.kill();
    },
  };
}

const next = `(() => {
  const tile = document.querySelector(".declic-tile:not([disabled])");
  if (tile) { tile.click(); return true; }
  const b = document.querySelector(".declic-stage .declic-cta:not([disabled])") || document.querySelector(".course-item-cta");
  if (b) { b.click(); return true; }
  return false;
})()`;

const found = [];
const app = await launch();
try {
  await app.open("/?demo");
  for (const dark of [false, true]) {
    const theme = dark ? "sombre" : "clair";
    for (const [name, state, action] of SCREENS) {
      await app.load({ ...state, darkMode: dark });
      if (action) {
        await app.ev(action);
        await sleep(700);
      }
      for (const f of await app.ev(PAGE_AUDIT)) found.push({ where: `${name} (${theme})`, ...f });
    }
    for (const [name, state] of DECLICS) {
      await app.load({ ...state, darkMode: dark });
      for (let step = 0; step < 14; step++) {
        for (const f of await app.ev(PAGE_AUDIT))
          found.push({ where: `${name} #${step} (${theme})`, ...f });
        if (!(await app.ev(next))) break;
        await sleep(900);
      }
    }
  }
} finally {
  app.close();
}

const real = [];
const known = new Map();
for (const f of found) {
  const why = EMOJI_ONLY.test(f.text)
    ? "emoji or ornament"
    : KNOWN.find(([part]) => f.sel.includes(part))?.[1];
  if (why) known.set(why, (known.get(why) ?? 0) + 1);
  else real.push(f);
}
const groups = new Map();
for (const f of real) {
  const key = `${f.sel}|${f.fg}`;
  const g = groups.get(key) ?? { ...f, where: new Set() };
  g.where.add(f.where.replace(/ #\d+/, ""));
  groups.set(key, g);
}
for (const g of [...groups.values()].sort((a, b) => a.ratio - b.ratio)) {
  console.log(
    `${g.ratio}:1 (needs ${g.need}) ${g.size}px  ${g.sel}  ${g.fg}  "${g.text.slice(0, 36)}"  [${[...g.where].join(", ")}]`,
  );
}
console.log(
  groups.size === 0
    ? "Contrast: nothing below AA."
    : `\nContrast: ${groups.size} reading(s) below AA.`,
);
if (known.size) console.log(`(Ignored as known false readings: ${[...known.keys()].join("; ")}.)`);
process.exit(groups.size === 0 ? 0 : 1);
