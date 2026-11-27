// Joue un Déclic en entier dans la vraie app, photographie chaque carte, et mesure ce qu'un
// validateur de contenu ne peut pas voir : la mise en page sur un vrai téléphone.
//
//   npm run dev                        # dans un terminal
//   npm run declic:play M2-ARI-D07
//   npm run declic:play M2-ARI-D07 -- --width 320    # le pire écran réaliste
//
// Pourquoi ce script existe. `course:check` vérifie la structure : identifiants, ordres, une
// seule bonne réponse, feedbacks qui expliquent. Il ne sait rien de l'écran. Les deux vrais
// défauts du Déclic D07 lui ont échappé tous les deux — une bulle de treize lignes, et une ligne
// de pseudo-code coupée en deux par le retour à la ligne. Une instruction coupée en deux n'est
// plus une instruction.
//
// Et compter les caractères ne suffit pas : « si r = 0 alors « multiple » » et
// « r ← reste de a divisé par b » font exactement 27 caractères, et une seule des deux déborde.
// C'est une largeur en pixels, dans la vraie police, à la vraie taille. Donc on mesure dans le
// navigateur, avec des Range sur le texte rendu, au lieu de deviner.
//
// Le script lit les bonnes réponses dans le JSON du Déclic : il n'y a rien à lui apprendre.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9342;
const CONTENT = "src/content/courses";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- arguments

const args = process.argv.slice(2);
const declicId = args.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
// 360 px est l'écran Android courant le plus étroit ; 375 px est l'iPhone SE. On mesure sur le
// plus petit des deux par défaut : ce qui tient là tient partout.
const WIDTH = Number(flag("width", 360));
const HEIGHT = Number(flag("height", 780));

if (!declicId) {
  console.error("usage : npm run declic:play <id> [-- --width 360]");
  process.exit(1);
}

// --- le contenu

function findFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? findFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = findFiles(CONTENT).filter((f) => f.endsWith(".json"));
const declicPath = files.find((f) => JSON.parse(readFileSync(f, "utf8")).id === declicId);
if (!declicPath) {
  console.error(`Déclic "${declicId}" introuvable sous ${CONTENT}/`);
  process.exit(1);
}
const declic = JSON.parse(readFileSync(declicPath, "utf8"));
const chapter = JSON.parse(readFileSync(join(dirname(declicPath), "chapter.json"), "utf8"));

// Le contenu s'écrit avec les symboles Unicode d'un prof (ℕ ℤ ∈ ⊂) ; l'app les dessine avec
// KaTeX, et « ℕ » arrive à l'écran sous la forme d'un N en gras de tableau. Comparer le JSON au
// rendu demande donc de parler la même langue des deux côtés.
const RENDERED = { ℕ: "N", ℤ: "Z", ℚ: "Q", ℝ: "R" };
const norm = (s) =>
  s
    .replace(/[ℕℤℚℝ]/g, (c) => RENDERED[c])
    .replace(/\s+/g, " ")
    .trim();
const loose = (s) => norm(s).replace(/[^\p{L}\p{N}]/gu, "");

/** Les jeux de réponses que cette carte peut afficher : chaque version, chaque étape. */
function answerSets(card) {
  if (card?.type === "choice") {
    return [card, ...(card.variants ?? [])].map((v) => v.choices);
  }
  if (card?.type === "multi-step-choice") {
    const versions = [{ steps: card.steps }, ...(card.variants ?? [])];
    return versions.flatMap((v) => v.steps.map((s) => s.options));
  }
  return [];
}

/** Quelle tuile cliquer, en reconnaissant d'abord la version affichée à son jeu de réponses.
 *  Retourne un index, ou une raison de ne pas pouvoir jouer. */
function pick(card, shown) {
  const sets = answerSets(card);
  // La tuile affiche le libellé puis sa flèche : on compare par début de chaîne, pas à l'identique.
  const match = (opts, eq) =>
    opts.length === shown.length && opts.every((o, i) => eq(shown[i]).startsWith(eq(o.label)));
  let found = sets.filter((o) => match(o, norm));
  if (found.length !== 1) found = sets.filter((o) => match(o, loose));
  if (found.length === 0) {
    return {
      error:
        "les réponses affichées ne correspondent à aucune version du JSON — à l'écran : " +
        shown.map((l) => JSON.stringify(l)).join(", "),
    };
  }
  // Deux versions peuvent proposer les mêmes réponses — une étape de validation dont seul
  // l'énoncé change, par exemple. Ce n'est un problème que si elles n'attendent pas la même.
  const indexes = [...new Set(found.map((o) => o.findIndex((x) => x.correct)))];
  if (indexes.length > 1) {
    return {
      error: `${found.length} versions du JSON affichent ces réponses, et n'attendent pas la même`,
    };
  }
  const correct = indexes[0];
  // Une question d'accroche (`gradeChoices: false`) n'a pas de bonne réponse : tout fait avancer.
  if (correct === -1) return { index: 0 };
  return { index: correct };
}

const OUT = join("store/declic", declicId);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// --- ce qui se mesure dans la page, et nulle part ailleurs

const AUDIT = `
window.__audit = () => {
  // Une ligne d'instruction : « a ← 12 », « si r = 0 … », « sinon … ». Deux à la suite font un
  // bloc de pseudo-code — c'est ce critère de suite qui évite de prendre une phrase commençant
  // par « Pour … » pour une ligne de code.
  const INSTR = /^(?:[A-Za-zÀ-ſ]\\w*\\s*←|si\\b|sinon\\b|tant que\\b|afficher\\b|pour chaque\\b)/i;
  const out = [];

  /** Les noeuds de texte d'un élément, à plat, avec leur décalage dans le texte complet. */
  const textNodes = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let at = 0;
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      nodes.push({ node: n, start: at, end: at + n.textContent.length });
      at += n.textContent.length;
    }
    return nodes;
  };

  for (const el of document.querySelectorAll(".declic-bubble, .declic-tile")) {
    const nodes = textNodes(el);
    const full = nodes.map((n) => n.node.textContent).join("");
    const logical = full.split("\\n");
    // Les lignes d'un bloc de pseudo-code : celles qui ont une voisine instruction.
    const isInstr = logical.map((l) => INSTR.test(l.trim()) && l.trim().length > 0);
    const inBlock = isInstr.map((v, i) => v && (isInstr[i - 1] || isInstr[i + 1]));

    let at = 0;
    for (let i = 0; i < logical.length; i++) {
      const line = logical[i];
      const start = at;
      const end = at + line.length;
      at = end + 1; // le \\n
      if (!inBlock[i] || !line.trim()) continue;
      const a = nodes.find((n) => start >= n.start && start < n.end);
      const b = nodes.find((n) => end > n.start && end <= n.end) ?? nodes[nodes.length - 1];
      if (!a || !b) continue;
      const r = document.createRange();
      r.setStart(a.node, start - a.start);
      r.setEnd(b.node, Math.min(end - b.start, b.node.textContent.length));
      // Une ligne de code qui tient sur une ligne d'écran a un seul rectangle. Deux = coupée.
      const rects = [...r.getClientRects()].filter((x) => x.width > 0.5);
      if (rects.length > 1) {
        out.push({ kind: "pseudo-code coupé", line: line.trim(), rects: rects.length });
      }
    }
  }

  // Du texte rogné par sa propre boîte.
  for (const el of document.querySelectorAll(".declic-bubble, .declic-tile")) {
    if (el.scrollHeight > el.clientHeight + 1) {
      out.push({ kind: "texte rogné", line: el.textContent.trim().slice(0, 60) });
    }
  }

  // Le geste doit rester sous le pouce, pas sous la ligne de flottaison.
  for (const el of document.querySelectorAll(".declic-cta, .declic-tile")) {
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight + 1) {
      out.push({ kind: "hors écran", line: el.textContent.trim().slice(0, 40), bas: Math.round(r.bottom) });
    }
  }

  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    out.push({ kind: "débordement horizontal", line: String(document.documentElement.scrollWidth) + " px" });
  }
  return out;
};
true
`;

// --- Chrome

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "braise-play-"))}`,
    "--no-first-run",
    "--hide-scrollbars",
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
if (!wsUrl) {
  console.error(`Chrome n'a pas démarré (${CHROME}). CHROME=/chemin pour en viser un autre.`);
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let msgId = 0;
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
    const n = ++msgId;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.result?.exceptionDetails) {
    throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  }
  return r.result.result.value;
};
/** Attend qu'une expression soit vraie dans la page. Un délai fixe ne marche pas : après une
 *  modification de contenu, Vite recompile et le premier chargement prend plusieurs secondes de
 *  plus — trois exécutions sur quatre sont tombées là-dessus. */
const waitFor = async (expression, label, timeoutMs = 25000) => {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (await ev(`!!(${expression})`)) return true;
    await sleep(300);
  }
  throw new Error(`délai dépassé en attendant : ${label}`);
};

const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(r.result.data, "base64"));
  return file;
};

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 2,
  mobile: true,
});

const findings = [];
const sheet = [];

try {
  // `?demo` met de côté une vraie progression s'il y en a une : jouer un Déclic ici ne doit
  // jamais effacer celle de la personne qui lance le script.
  await send("Page.navigate", { url: `${BASE}/?demo` });
  await waitFor(`document.querySelector(".app-shell")`, "le démarrage de l'app");
  await ev(`(() => {
    localStorage.removeItem("sapie_course_progress");
    const s = JSON.parse(localStorage.getItem("sapie_progress") ?? "{}");
    Object.assign(s, {
      xp: 320, streak: 4, onboardingCompleted: true, darkMode: false,
      soundOn: false, hapticsOn: false, view: "lesson", tab: "home",
      currentSubjectId: ${JSON.stringify(chapter.subjectId)},
      currentChapterId: ${JSON.stringify(chapter.id)},
      user: { name: "Léa", level: "2nde", levelLabel: "2nde", personality: "chill", goal: "regulier", avatar: "eclair" },
    });
    localStorage.setItem("sapie_progress", JSON.stringify(s));
    localStorage.setItem("sapie_seen_rank", "bronze");
  })()`);
  await send("Page.reload");
  await waitFor(
    `document.querySelectorAll(".course-item").length > 0`,
    "la liste des Déclics du chapitre",
  );

  const num = String(declic.order).padStart(2, "0");
  const opened = await ev(`(() => {
    const d = [...document.querySelectorAll(".course-item")]
      .find((e) => e.textContent.includes("Déclic ${num}") && !/Révision/.test(e.textContent));
    if (!d) return false;
    d.querySelector(".course-item-cta").click();
    return true;
  })()`);
  if (!opened) throw new Error(`Déclic ${num} introuvable dans la page du chapitre`);
  await waitFor(`document.querySelector(".declic-stage")`, "la première carte du Déclic");
  // Le bandeau d'astuce recouvre la carte au premier lancement.
  await ev(`(() => {
    const b = [...document.querySelectorAll("button")].find((e) => e.textContent.trim() === "OK");
    if (b) b.click();
  })()`);
  await sleep(1200);
  await ev(AUDIT);

  const total = declic.cards.length;
  let guard = 0;
  let lastIndex = -1;
  let shotsOnCard = 0;

  while (guard++ < total * 8) {
    await sleep(500);
    const state = await ev(`(() => {
      const counter = [...document.querySelectorAll("*")]
        .map((e) => (e.children.length === 0 ? e.textContent : ""))
        .find((t) => /^\\s*\\d+\\/\\d+\\s*$/.test(t || ""));
      const tiles = [...document.querySelectorAll(".declic-tile")];
      // KaTeX écrit deux fois chaque formule : une version MathML pour les lecteurs d'écran, une
      // version visible. textContent les concatène, donc on retire la première avant de lire.
      const seen = (el) => {
        const c = el.cloneNode(true);
        c.querySelectorAll(".katex-mathml").forEach((m) => m.remove());
        return c.textContent.replace(/\\s+/g, " ").trim();
      };
      return {
        index: counter ? Number(counter.trim().split("/")[0]) - 1 : -1,
        labels: tiles.map(seen),
        answered: tiles.some((e) => /Réponse attendue|Ta réponse/.test(e.textContent)),
        cta: document.querySelector(".declic-cta:not([disabled])")?.textContent.trim() ?? null,
        inDeclic: !!document.querySelector(".declic-stage"),
      };
    })()`);

    if (!state.inDeclic) break; // le Déclic est terminé, l'app est revenue au chapitre

    if (state.index !== lastIndex) {
      lastIndex = state.index;
      shotsOnCard = 0;
    }
    const card = declic.cards[state.index] ?? null;
    const name = `${String(state.index + 1).padStart(2, "0")}-${card?.type ?? "?"}${
      shotsOnCard === 0 ? "" : `-${shotsOnCard + 1}`
    }`;

    const problems = await ev("__audit()");
    for (const p of problems) findings.push({ carte: card?.id ?? "?", ecran: name, ...p });
    sheet.push({ file: await shot(name), name, card: card?.id ?? "?", problems: problems.length });
    shotsOnCard++;

    if (state.labels.length && !state.answered) {
      const chosen = pick(card, state.labels);
      if (chosen.error) {
        findings.push({
          carte: card?.id ?? "?",
          ecran: name,
          kind: "injouable",
          line: chosen.error,
        });
        break;
      }
      await ev(`document.querySelectorAll(".declic-tile")[${chosen.index}].click()`);
      await sleep(1100);
      continue;
    }

    if (state.cta) {
      await ev(`document.querySelector(".declic-cta:not([disabled])").click()`);
      await sleep(1100);
      continue;
    }
    await sleep(600);
  }

  await send("Page.navigate", { url: `${BASE}/?demo=off` });
  await sleep(2500);
} finally {
  ws.close();
  chrome.kill();
}

// --- la planche-contact

if (sheet.length === 0) {
  console.error(
    "Aucun écran joué : l'app n'a pas atteint le Déclic. Le serveur de dev tourne-t-il " +
      `sur ${BASE} ?`,
  );
  process.exit(1);
}

const COLS = 5;
const CELL_W = 260;
const CAPTION = 26;
const GAP = 12;

const scaled = await Promise.all(
  sheet.map(async (s) => ({
    ...s,
    buf: await sharp(s.file).resize({ width: CELL_W }).toBuffer(),
    h: (await sharp(s.file).resize({ width: CELL_W }).metadata()).height,
  })),
);
const cellH = Math.max(...scaled.map((s) => s.h)) + CAPTION;
const rows = Math.ceil(scaled.length / COLS);
const sheetW = COLS * CELL_W + (COLS + 1) * GAP;
const sheetH = rows * cellH + (rows + 1) * GAP;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const captions = scaled
  .map((s, i) => {
    const x = GAP + (i % COLS) * (CELL_W + GAP);
    const y = GAP + Math.floor(i / COLS) * (cellH + GAP) + s.h + 17;
    const fill = s.problems ? "#ff4500" : "#8a8f9c";
    return `<text x="${x}" y="${y}" fill="${fill}" font-family="monospace" font-size="12">${esc(
      `${s.name}${s.problems ? `  ⚠ ${s.problems}` : ""}`,
    )}</text>`;
  })
  .join("");

await sharp({
  create: { width: sheetW, height: sheetH, channels: 3, background: "#151821" },
})
  .composite([
    ...scaled.map((s, i) => ({
      input: s.buf,
      left: GAP + (i % COLS) * (CELL_W + GAP),
      top: GAP + Math.floor(i / COLS) * (cellH + GAP),
    })),
    {
      input: Buffer.from(
        `<svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">${captions}</svg>`,
      ),
      left: 0,
      top: 0,
    },
  ])
  .png()
  .toFile(join(OUT, "planche.png"));

// --- le rapport

const report = [
  `# ${declic.id} — ${declic.title}`,
  "",
  `${sheet.length} écrans joués à ${WIDTH} × ${HEIGHT}, ${declic.cards.length} cartes.`,
  "",
];
if (findings.length === 0) {
  report.push("Aucun problème de mise en page.");
} else {
  report.push(`## ${findings.length} problème(s)`, "");
  for (const f of findings) {
    report.push(`- **${f.kind}** — ${f.carte} (${f.ecran}) : ${f.line}`);
  }
}
writeFileSync(join(OUT, "rapport.md"), report.join("\n") + "\n");

console.log(`\n${sheet.length} écrans → ${OUT}/planche.png`);
if (findings.length === 0) {
  console.log("Mise en page : rien à signaler.");
} else {
  console.log(`\n${findings.length} problème(s) de mise en page :`);
  for (const f of findings) console.log(`  ${f.kind} — ${f.carte} : ${f.line}`);
  process.exitCode = 1;
}
console.log(`Rapport : ${OUT}/rapport.md`);
