// Fabrique les images source des icônes de l'app (iOS + Android) à partir du dessin de Braise.
//
//   node scripts/make-app-icons.mjs            → assets/ (le jeu définitif, fond retenu)
//   node scripts/make-app-icons.mjs --variants → scratch-icons/ (les fonds à comparer)
//
// Le dessin est celui de BraiseMascot (humeur « happy », rang bronze), relevé tel qu'il est rendu
// à l'écran : même chemins, mêmes couleurs, même épaisseur d'encre. Il est recopié ici à dessein —
// un script Node ne peut pas importer un composant .tsx, et une icône de store est un objet figé :
// elle ne doit pas changer parce qu'une animation a changé. Si la mascotte est redessinée un jour,
// c'est une décision, et on repasse ici exprès.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const MASCOT = `<ellipse cx="54" cy="110" rx="28" ry="5" fill="#151821" opacity="0.15"/><path d="M25 79 C20 65 25 53 36 44 C33 35 37 29 43 34 L49 40 C50 28 58 16 66 9 C71 5 74 10 71 17 C68 27 71 34 79 43 C88 53 91 67 86 81 C81 96 69 103 53 103 C38 103 29 95 25 79 Z" fill="#F04418" stroke="#151821" stroke-width="4.5" stroke-linejoin="round"/><path d="M30 80 C29 61 40 47 53 46 C69 46 80 60 79 80 C78 94 67 101 53 101 C39 101 31 94 30 80 Z" fill="#FF7A1A"/><path d="M31 67 C31 53 41 46 53 46 C67 46 77 54 77 68 C77 82 67 89 53 89 C40 89 31 81 31 67 Z" fill="#FFF2D8" stroke="#151821" stroke-width="3.2" stroke-linejoin="round"/><path d="M36 53 L49 55 M58 55 L71 52" stroke="#151821" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="43" cy="60" rx="3.8" ry="4" fill="#151821"/><ellipse cx="64" cy="60" rx="3.8" ry="4" fill="#151821"/><circle cx="44.2" cy="58.8" r="1.2" fill="#FFFFFF"/><circle cx="65.2" cy="58.8" r="1.2" fill="#FFFFFF"/><path d="M45 71 Q54 76 63 70" stroke="#151821" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M34 69 l4 -1" stroke="#FF6F59" stroke-width="3" stroke-linecap="round" opacity="0.65"/><path d="M53 76 L58 82 L53 90 L48 82 Z" fill="#FFD84B" stroke="#151821" stroke-width="2.6" stroke-linejoin="round"/><path d="M51 78 L54 75" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>`;

// La mascotte est dessinée dans une boîte de 108 × 116.
const MW = 108;
const MH = 116;

const THEMES = {
  // Le fond crème de l'app : l'orange de Braise ressort au maximum, et l'icône ne se confond
  // avec aucune autre sur un écran d'accueil (presque personne n'a d'icône crème).
  creme: { bg: "#FDF7EF", dots: "rgba(21,24,33,0.10)" },
  // L'orange signature, plein cadre : le plus visible de loin, mais le corps de Braise est
  // orange lui aussi — c'est le trait d'encre qui doit faire tout le travail.
  orange: { bg: "#FF4500", dots: "rgba(21,24,33,0.12)" },
  // Le jaune des cartes à collectionner : le plus « jeu », le plus bruyant.
  soleil: { bg: "#FFD43B", dots: "rgba(21,24,33,0.12)" },
};

/** Le motif de points du papier de l'app, pour que l'icône ait la même matière que les écrans. */
function dotGrid(size, color) {
  const step = size / 12;
  const r = Math.max(1, size / 220);
  let out = "";
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
    }
  }
  return out;
}

/** `scale` = part de la largeur occupée par la mascotte (0.62 plein cadre, 0.46 en zone sûre). */
function icon(size, theme, { scale = 0.62, background = true, dots = true } = {}) {
  const w = size * scale;
  const h = (w * MH) / MW;
  const x = (size - w) / 2;
  // Optiquement centré : la mascotte a son ombre portée tout en bas, le centre géométrique
  // la ferait paraître trop basse.
  const y = (size - h) / 2 - size * 0.015;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${background ? `<rect width="${size}" height="${size}" fill="${theme.bg}"/>` : ""}
  ${background && dots ? dotGrid(size, theme.dots) : ""}
  <g transform="translate(${x} ${y}) scale(${w / MW})">${MASCOT}</g>
</svg>`;
}

function splash(size, theme) {
  const w = size * 0.22;
  const h = (w * MH) / MW;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${theme.bg}"/>
  <g transform="translate(${(size - w) / 2} ${(size - h) / 2}) scale(${w / MW})">${MASCOT}</g>
</svg>`;
}

const png = (svg, file) =>
  sharp(Buffer.from(svg))
    .png()
    .toFile(file)
    .then(() => console.log("  ", file));

const variants = process.argv.includes("--variants");

if (variants) {
  mkdirSync("scratch-icons", { recursive: true });
  for (const [name, theme] of Object.entries(THEMES)) {
    await png(icon(512, theme), `scratch-icons/icone-${name}.png`);
  }
} else {
  const theme = THEMES[process.env.BRAISE_ICON_THEME ?? "creme"];
  mkdirSync("assets", { recursive: true });
  // icon.png : plein cadre, c'est iOS qui arrondit les coins.
  await png(icon(1024, theme), "assets/icon.png");
  // Android découpe l'icône en deux calques et peut la masquer en cercle : le dessin reste
  // dans les 66 % centraux, sinon la tête de Braise se fait rogner.
  await png(icon(1024, theme, { scale: 0.46, background: false }), "assets/icon-foreground.png");
  await png(icon(1024, theme, { scale: 0, dots: true }), "assets/icon-background.png");
  await png(splash(2732, theme), "assets/splash.png");
  await png(
    splash(2732, { bg: "#0F1830", dots: "rgba(234,241,255,0.10)" }),
    "assets/splash-dark.png",
  );
}
