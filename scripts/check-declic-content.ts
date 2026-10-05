// Validates every notion file in src/content/declic/ — run this after writing or editing one,
// and it runs automatically before every build (see package.json's "prebuild"). Run directly
// with Node (no build step): Node's native TypeScript support strips this file's types at
// runtime, same reasoning as declicParser.ts's own plain-field DeclicParseError.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDeclicScript, DeclicParseError } from "../src/lib/declicParser.ts";

const DIR = join(import.meta.dirname, "..", "src", "content", "declic");

const files = readdirSync(DIR).filter((f) => f.endsWith(".txt"));
let failed = 0;
const seenChapterIds = new Map<string, string>();

for (const file of files) {
  const raw = readFileSync(join(DIR, file), "utf8");
  try {
    const script = parseDeclicScript(raw, file);
    const dupe = seenChapterIds.get(script.chapterId);
    if (dupe) {
      console.error(`✗ ${file} : le chapitre "${script.chapterId}" est déjà utilisé par ${dupe}`);
      failed++;
      continue;
    }
    seenChapterIds.set(script.chapterId, file);
    const cardCount = script.cards.length;
    console.log(
      `✓ ${file} — notion "${script.chapterId}", ${cardCount} carte${cardCount > 1 ? "s" : ""}`,
    );
  } catch (e) {
    failed++;
    if (e instanceof DeclicParseError) {
      console.error(`✗ ${e.message}`);
    } else {
      console.error(`✗ ${file} :`, e instanceof Error ? e.message : e);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} fichier${failed > 1 ? "s" : ""} à corriger.`);
  process.exitCode = 1;
} else {
  console.log(
    `\nTout est bon : ${files.length} notion${files.length > 1 ? "s" : ""} valide${files.length > 1 ? "s" : ""}.`,
  );
}
