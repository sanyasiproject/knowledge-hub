/**
 * Replace a topic's convertible code blocks with new authored ones.
 *
 * Many topics carried the same lesson twice — once in Java, once in C++ — so a
 * naive 1:1 conversion would produce two near-identical TypeScript blocks. This
 * replaces ALL convertible blocks in a topic with the supplied set (usually
 * fewer, merged), while leaving non-program blocks (bash, sql, yaml, json,
 * dockerfile…) exactly where they are.
 *
 * Usage:  node scripts/apply-code.mjs <dataFile.mjs>
 * Data file default-exports { [slug]: [{ language, caption, source }, ...] }.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TOPICS_DIR = path.resolve("src/content/topics");

/**
 * Only these get replaced. Everything else — config/query syntax, existing
 * TypeScript/JavaScript, and languages chosen deliberately to teach themselves
 * (Haskell for monads, Rust for ownership, Go for goroutines) — is preserved
 * exactly as it is. Listing what to REPLACE rather than what to keep means a
 * language I forgot about survives instead of being silently deleted.
 */
const FOREIGN = new Set([
  "cpp", "c++", "java", "c", "csharp", "c#", "kotlin", "ruby", "node.js",
]);

const isConvertible = (lang) => FOREIGN.has((lang || "").toLowerCase());

/** Emit a source string as a TS template literal, escaping what would break it. */
function templateLiteral(source) {
  return "`" + source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
}

function renderBlock(b, indent = "    ") {
  const inner = indent + "  ";
  const parts = [`${inner}language: ${JSON.stringify(b.language)},`];
  if (b.caption) parts.push(`${inner}caption: ${JSON.stringify(b.caption)},`);
  parts.push(`${inner}source: ${templateLiteral(b.source)},`);
  return `${indent}{\n${parts.join("\n")}\n${indent}},`;
}

/** Locate the `code:` array in the file and return its [start, end) offsets. */
function findCodeArray(src) {
  const m = /^  code: \[$/m.exec(src);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  // Walk forward to the matching closing "  ]," at top level, skipping strings.
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    i++;
  }
  // Include the trailing comma after the closing bracket.
  if (src[i] === ",") i++;
  return { start, end: i };
}

const data = (await import(pathToFileURL(path.resolve(process.argv[2])).href)).default;

let written = 0;
const problems = [];

for (const [slug, newBlocks] of Object.entries(data)) {
  const file = path.join(TOPICS_DIR, `${slug}.ts`);
  if (!fs.existsSync(file)) {
    problems.push(`${slug}: no content file`);
    continue;
  }
  const src = fs.readFileSync(file, "utf8");
  const span = findCodeArray(src);
  if (!span) {
    problems.push(`${slug}: could not locate the code array`);
    continue;
  }

  // Re-read the existing blocks so non-program ones survive untouched.
  const modPath = path.resolve("node_modules/.cache/content-check/content/topics", `${slug}.js`);
  let existing = [];
  if (fs.existsSync(modPath)) {
    const mod = await import(pathToFileURL(modPath).href);
    const content = mod.default ?? Object.values(mod)[0];
    existing = content?.code ?? [];
  }
  const kept = existing.filter((b) => !isConvertible(b.language));

  const merged = [...newBlocks, ...kept];
  const body = merged.map((b) => renderBlock(b)).join("\n");
  const replacement = `  code: [\n${body}\n  ],`;

  fs.writeFileSync(file, src.slice(0, span.start) + replacement + src.slice(span.end));
  written++;
}

console.log(`applied: ${written} topic(s)`);
if (problems.length) {
  console.error("problems:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
