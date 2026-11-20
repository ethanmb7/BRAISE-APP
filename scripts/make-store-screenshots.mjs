// Les captures d'écran des fiches App Store et Google Play, prises dans la vraie app.
//
//   npm run dev                       # dans un terminal
//   node scripts/make-store-screenshots.mjs
//
// Pourquoi un script et pas des captures à la main : les deux stores imposent des tailles exactes
// (Apple refuse un pixel de travers), il en faut une série par langue et par appareil, et il
// faudra les refaire à chaque fois qu'un écran change. Celui-ci pose un faux profil cohérent —
// une élève de seconde au bout de quelques jours, pas un compte vide ni un compte de triche —
// et photographie les six écrans qui racontent l'app.
//
// Taille : 430 × 932 points × 3 = 1290 × 2796 px, l'écran des iPhone Pro Max récents, accepté
// par App Store Connect comme format 6,9 pouces. Play accepte la même image.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9337;
const OUT = "store/captures";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Le profil montré sur les captures. Rien d'inventé côté contenu : ce sont de vrais chapitres de
// l'app, avec une progression plausible (quelques jours, un rang Argent tout juste atteint).
const PROFILE = {
  // Sous les 400 XP du rang Argent, à dessein : au-delà, Braise prend les couleurs argentées
  // (bleu) de son rang, et l'app ne ressemble plus à son icône. Les captures montrent la Braise
  // orange que la fiche promet.
  xp: 320,
  streak: 4,
  freezes: 2,
  onboardingCompleted: true,
  dailyGoalMet: false,
  darkMode: false,
  soundOn: false,
  hapticsOn: false,
  completedChapters: ["h3", "f2", "m2"],
  user: {
    name: "Léa",
    level: "2nde",
    levelLabel: "2nde",
    personality: "savage",
    goal: "regulier",
    avatar: "eclair",
  },
};

const SCREENS = [
  ["01-aujourdhui", { view: "home", tab: "home" }, null],
  [
    "02-declic",
    { view: "lesson", tab: "home", currentSubjectId: "histoire-geo", currentChapterId: "h3" },
    // On avance jusqu'à la révélation : c'est le moment qui donne son nom au Déclic, et la
    // carte où l'idée occupe tout l'écran. La première carte est une mise en situation qu'on
    // lit, la deuxième une question dont les réponses sont tout en bas — ni l'une ni l'autre ne
    // montre ce que l'app fait de mieux.
    `(async () => {
       const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
       for (let i = 0; i < 8; i++) {
         if (document.querySelector(".declic-stage--reveal")) return true;
         const tile = document.querySelector(".declic-tile:not([disabled])");
         const cta = document.querySelector(".declic-cta:not([disabled])");
         (tile ?? cta)?.click();
         await sleep(900);
       }
       return false;
     })()`,
  ],
  ["03-reviser", { view: "revisions", tab: "revisions" }, null],
  ["04-aura", { view: "progres", tab: "progres" }, null],
  ["05-matieres", { view: "subject", tab: "home", currentSubjectId: "maths" }, null],
  ["06-moi", { view: "profile", tab: "profile" }, null],
];

async function launch() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), "braise-shots-"))}`,
      "--no-first-run",
      "--hide-scrollbars",
      "--force-device-scale-factor=3",
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
      /* Chrome démarre encore */
    }
    await sleep(250);
  }
  if (!wsUrl) throw new Error(`Chrome n'a pas démarré (${CHROME}). CHROME=/chemin pour en viser un autre.`);

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
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) {
      throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300));
    }
    return r.result.result.value;
  };

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    mobile: true,
  });

  return {
    ev,
    async open(path) {
      await send("Page.navigate", { url: BASE + path });
      await sleep(6000);
    },
    async seed(extra) {
      await ev(
        `(() => {
          const s = JSON.parse(localStorage.getItem("sapie_progress") ?? "{}");
          Object.assign(s, ${JSON.stringify(PROFILE)}, ${JSON.stringify(extra)});
          localStorage.setItem("sapie_progress", JSON.stringify(s));
          // Les fêtes de rang et de badge sont déjà vues : une capture ne doit pas s'ouvrir sur
          // un confetti plein écran. Les valeurs sont stockées telles que l'app les relit —
          // le rang en texte brut (pas en JSON : une première version a écrit "bronze" avec ses
          // guillemets, la comparaison échouait et les six captures sont sorties recouvertes du
          // bandeau NOUVEAU RANG).
          localStorage.setItem("sapie_seen_rank", "bronze");
          localStorage.setItem("sapie_seen_badges", JSON.stringify(["b1", "b2", "b3", "b4", "b5", "b6"]));
        })()`,
      );
      await send("Page.reload");
      await sleep(4500);
    },
    async shot(name) {
      const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      writeFileSync(join(OUT, `${name}.png`), Buffer.from(r.result.data, "base64"));
      console.log("  ", `${OUT}/${name}.png`);
    },
    close() {
      ws.close();
      chrome.kill();
    },
  };
}

mkdirSync(OUT, { recursive: true });
const app = await launch();
try {
  // `?demo` met de côté une vraie progression s'il y en a une, puis la rend : les captures ne
  // détruisent jamais les données de la personne qui lance le script.
  await app.open("/?demo");
  for (const [name, state, action] of SCREENS) {
    await app.seed(state);
    if (action) {
      await app.ev(action);
      await sleep(1200);
    }
    await app.shot(name);
  }
  await app.open("/?demo=off");
} finally {
  app.close();
}
console.log("\nCaptures prêtes dans", OUT, "— 1290 × 2796, format 6,9 pouces.");
