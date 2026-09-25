import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const IGNORED_DIRECTORIES = new Set([".git", ".output", ".wrangler", "node_modules"]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
codex/analyser-l-application-pour-ameliorer-l-education-yelgdt
  ".txt",
  ".svg",
  ".toml",
  ".yaml",
  ".yml",
]);
// Also reject markers accidentally indented by an editor. Git writes them at column zero, but
// copied conflict blocks can otherwise slip through the prebuild check after being pasted into
// JSX, Markdown or a configuration file.
const CONFLICT_LINE = /^\s*(?:<{7}|={7}|>{7})(?:\s|$)/;
=======
]);
const CONFLICT_LINE = /^(?:<{7}|={7}|>{7})(?:\s|$)/;
main

async function findConflicts(directory) {
  const conflicts = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      conflicts.push(...(await findConflicts(path)));
      continue;
    }

    if (!TEXT_EXTENSIONS.has(extname(entry.name))) continue;
    const lines = (await readFile(path, "utf8")).split(/\r?\n/);
    lines.forEach((line, index) => {
      if (CONFLICT_LINE.test(line)) {
        conflicts.push(`${relative(ROOT, path)}:${index + 1}: ${line}`);
      }
    });
  }

  return conflicts;
}

const conflicts = await findConflicts(ROOT);

if (conflicts.length) {
  console.error("Des marqueurs de conflit Git ont été détectés :\n");
  console.error(conflicts.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Aucun marqueur de conflit Git détecté.");
}
