// Validates all the course content (src/content/courses/**/*.json) and prints which parts of the
// official programme each Déclic covers. Run it after adding or editing a chapter, a Déclic or a
// deck; it also runs before every build (see package.json's "prebuild"). Plain Node, no build step.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildRegistry } from "../src/lib/course/buildRegistry.ts";
import { coverageReport } from "../src/lib/course/validate.ts";

const ROOT = join(import.meta.dirname, "..", "src", "content", "courses");

function jsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return jsonFiles(path);
    return name.endsWith(".json") ? [path] : [];
  });
}

const files: Record<string, unknown> = {};
let broken = 0;
for (const path of jsonFiles(ROOT)) {
  const name = path.slice(ROOT.length + 1);
  try {
    files[name] = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`✗ ${name} : JSON illisible — ${e instanceof Error ? e.message : e}`);
    broken++;
  }
}

const registry = buildRegistry(files);
for (const message of registry.errors) {
  console.error(`✗ ${message}`);
  broken++;
}

for (const chapter of registry.chapters) {
  const declics = chapter.declicIds.map((id) => registry.declics.get(id)!);
  console.log(
    `✓ ${chapter.id} — ${chapter.title} (${declics.length} Déclic${declics.length > 1 ? "s" : ""})`,
  );
  for (const d of declics) {
    const deck = registry.decks.get(d.deckId)!;
    console.log(
      `    ${d.id} v${d.version} — ${d.cards.length} cartes, deck ${deck.id} (${deck.cards.length} cartes)`,
    );
  }
  for (const row of coverageReport(chapter, declics)) {
    const by =
      row.coveredBy.map((c) => `${c.declicId}: ${c.coverage}`).join(", ") || "pas encore couvert";
    console.log(`    ${row.mappingId} — ${by}`);
  }
}

if (broken > 0) {
  console.error(`\n${broken} problème${broken > 1 ? "s" : ""} à corriger.`);
  process.exitCode = 1;
} else {
  console.log(
    `\nTout est bon : ${registry.chapters.length} chapitre${registry.chapters.length > 1 ? "s" : ""} de cours valide${registry.chapters.length > 1 ? "s" : ""}.`,
  );
}
