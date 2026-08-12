/**
 * Insert a top-level section into authored topic-content files.
 *
 * Content files are large (many are 40 KB+), so rewriting one wholesale to add
 * a single section is wasteful and risks clobbering existing content. This
 * inserts the new key in the canonical position — matching the order in
 * `TopicContent` — and refuses to touch a file that already has that key.
 *
 * Usage:  node scripts/add-section.mjs <sectionName> <dataFile.mjs>
 * where the data file default-exports { [topicSlug]: <value> }.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , sectionName, dataFile] = process.argv;
if (!sectionName || !dataFile) {
  console.error("usage: node scripts/add-section.mjs <sectionName> <dataFile.mjs>");
  process.exit(1);
}

const TOPICS_DIR = path.resolve("src/content/topics");

/** Canonical key order from `TopicContent` — we insert before the first key that follows. */
const KEY_ORDER = [
  "quickSummary",
  "detailed",
  "deepDive",
  "code",
  "diagrams",
  "animations",
  "comparison",
  "interviewQA",
  "followUps",
  "mcqs",
  "exercises",
  "flashcards",
  "revisionNotes",
  "cheatSheet",
  "resources",
  "glossary",
];

const data = (await import(pathToFileURL(path.resolve(dataFile)).href)).default;

/**
 * Offsets of real top-level keys, ignoring anything inside a string.
 *
 * Content files embed YAML and JSON in template literals, and those happily
 * contain lines like `  resources:` at two-space indent. A naive
 * `/^  resources:/m` match hits those and silently skips the file, so we scan
 * with string-awareness instead.
 */
function topLevelKeyOffsets(src) {
  const offsets = new Map();
  let i = 0;
  let atLineStart = true;
  let lineStart = 0;
  while (i < src.length) {
    const ch = src[i];
    // Skip over string literals of every flavour.
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === quote) { i++; break; }
        i++;
      }
      atLineStart = false;
      continue;
    }
    if (ch === "\n") {
      atLineStart = true;
      lineStart = i + 1;
      i++;
      continue;
    }
    if (atLineStart) {
      const m = /^ {2}([A-Za-z_$][\w$]*):/.exec(src.slice(lineStart, lineStart + 80));
      if (m && i === lineStart + 2) {
        if (!offsets.has(m[1])) offsets.set(m[1], lineStart);
      }
      atLineStart = false;
    }
    i++;
  }
  return offsets;
}

/** Serialise a value as TS source at the given indent. */
function render(value, indent = "  ") {
  const inner = indent + "  ";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => inner + render(v, inner));
    return `[\n${items.join(",\n")},\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([k, v]) => `${inner}${k}: ${render(v, inner)}`);
    return `{\n${entries.join(",\n")},\n${indent}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

let written = 0;
let skipped = 0;
const problems = [];

for (const [slug, value] of Object.entries(data)) {
  const file = path.join(TOPICS_DIR, `${slug}.ts`);
  if (!fs.existsSync(file)) {
    problems.push(`${slug}: no content file`);
    continue;
  }
  const src = fs.readFileSync(file, "utf8");
  const keys = topLevelKeyOffsets(src);

  if (keys.has(sectionName)) {
    skipped++;
    continue;
  }

  // Insert before the first canonical key that should follow this one.
  const after = KEY_ORDER.slice(KEY_ORDER.indexOf(sectionName) + 1);
  let insertAt = -1;
  for (const key of after) {
    if (keys.has(key)) {
      insertAt = keys.get(key);
      break;
    }
  }
  if (insertAt < 0) {
    // Nothing follows this key in the canonical order (or those keys are
    // absent) — append just before the object's closing brace instead.
    const close = src.lastIndexOf("\n};");
    if (close < 0) {
      problems.push(`${slug}: no anchor key and no closing brace found`);
      continue;
    }
    insertAt = close + 1;
  }

  const block = `  ${sectionName}: ${render(value)},\n`;
  fs.writeFileSync(file, src.slice(0, insertAt) + block + src.slice(insertAt));
  written++;
}

console.log(`${sectionName}: wrote ${written}, skipped ${skipped} (already present)`);
if (problems.length) {
  console.error("problems:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
