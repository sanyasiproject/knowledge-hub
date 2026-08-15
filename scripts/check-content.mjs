/**
 * Content consistency checker.
 *
 * Type-checking proves the SHAPES are right; this proves the CROSS-REFERENCES
 * are. Those are the failures that type-checking cannot catch and that only
 * show up as a broken link or a silently-missing section in the UI:
 *
 *   - a topic in the taxonomy with no authored content (renders as placeholders)
 *   - authored content not reachable from any taxonomy category (dead file)
 *   - a `related` / `relatedTopics` / `topic` slug that doesn't resolve
 *   - an interview track block naming an area that doesn't exist
 *   - duplicate ids, out-of-range MCQ answers, ragged comparison tables
 *
 * Run with `npm run check`. Exits non-zero on any error.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "node_modules", ".cache", "content-check");

/* ---------- transpile TS → ESM so we can import the real data ---------- */

function build(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      build(full);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
      const js = ts
        .transpileModule(fs.readFileSync(full, "utf8"), {
          compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        })
        .outputText // relative specifiers need explicit extensions under node ESM
        .replace(/from\s+"(\.[^"]*)"/g, (_, s) => `from "${s}.js"`)
        .replace(/from\s+'(\.[^']*)'/g, (_, s) => `from '${s}.js'`);
      const out = path.join(OUT, path.relative(SRC, full)).replace(/\.ts$/, ".js");
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, js);
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
build(SRC);

const load = (rel) => import(pathToFileURL(path.join(OUT, rel)).href);

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const { allTopics, findTopicBySlug } = await load("data/taxonomy/index.js");
const { AREAS, AREA_MAP } = await load("interview/index.js");
const { TRACKS } = await load("interview/tracks.js");
const { INTERVIEW_META, TRACK_LINKS } = await load("interview/meta.js");

/*
 * The app loads content lazily via import.meta.glob (filename = slug), so
 * there is no static registry to import. Rebuild the same slug → content map
 * here from the files themselves — each topic file has exactly one export.
 */
const CONTENT = {};
for (const f of fs.readdirSync(path.join(OUT, "content/topics")).sort()) {
  if (!f.endsWith(".js")) continue;
  const mod = await load(`content/topics/${f}`);
  const values = Object.values(mod);
  if (values.length !== 1) {
    errors.push(`content/topics/${f} must have exactly one export (has ${values.length})`);
  }
  CONTENT[f.replace(/\.js$/, "")] = values[0] ?? {};
}

/* ---------- taxonomy ↔ content ---------- */

const topics = allTopics();
const topicSlugs = new Set(topics.map((t) => t.topic.slug));

for (const slug of topicSlugs) {
  if (!CONTENT[slug]) err(`taxonomy topic "${slug}" has no authored content`);
}
for (const slug of Object.keys(CONTENT)) {
  if (!topicSlugs.has(slug)) {
    err(`content "${slug}" is not reachable from any taxonomy category (dead file)`);
  }
}

const dupes = topics.map((t) => t.topic.slug).filter((s, i, a) => a.indexOf(s) !== i);
for (const d of new Set(dupes)) err(`duplicate topic slug in taxonomy: "${d}"`);

/* ---------- cross-links inside topic content ---------- */

for (const { topic } of topics) {
  for (const rel of topic.related ?? []) {
    if (!findTopicBySlug(rel)) err(`topic "${topic.slug}" links to unknown related topic "${rel}"`);
  }
}

/* ---------- authored content sanity ---------- */

for (const [slug, c] of Object.entries(CONTENT)) {
  (c.mcqs ?? []).forEach((m, i) => {
    if (!Array.isArray(m.options) || m.options.length < 2) {
      err(`${slug}: mcqs[${i}] needs at least 2 options`);
    } else if (typeof m.answerIndex !== "number" || m.answerIndex < 0 || m.answerIndex >= m.options.length) {
      err(`${slug}: mcqs[${i}] answerIndex ${m.answerIndex} is out of range`);
    }
    if (!m.explanation) warn(`${slug}: mcqs[${i}] has no explanation`);
  });

  if (c.comparison) {
    const width = c.comparison.columns.length;
    (c.comparison.rows ?? []).forEach((row, i) => {
      if (row.length !== width) {
        err(`${slug}: comparison row ${i} has ${row.length} cells, expected ${width}`);
      }
    });
  }

  (c.diagrams ?? []).forEach((d, i) => {
    if (!d.mermaid) warn(`${slug}: diagrams[${i}] ("${d.title}") has no mermaid source`);
  });

  (c.resources ?? []).forEach((r, i) => {
    if (r.url && !/^https:\/\/[^\s"]+$/.test(r.url)) {
      err(`${slug}: resources[${i}] ("${r.label}") has a malformed url: ${r.url}`);
    }
  });

  for (const section of ["followUps", "resources", "animations"]) {
    if (!c[section] || c[section].length === 0) warn(`${slug}: no ${section}`);
  }
}

/* ---------- interview section ---------- */

const areaSlugs = new Set(AREAS.map((a) => a.slug));

for (const area of AREAS) {
  const ids = area.qa.map((q) => q.id);
  for (const d of new Set(ids.filter((s, i, a) => a.indexOf(s) !== i))) {
    err(`interview area "${area.slug}": duplicate question id "${d}"`);
  }
  if (area.qa.length === 0) err(`interview area "${area.slug}" has no questions`);
  if (area.mustKnow.length === 0) err(`interview area "${area.slug}" has no mustKnow bullets`);

  for (const q of area.qa) {
    if (q.topic && !findTopicBySlug(q.topic)) {
      err(`interview ${area.slug}:${q.id} links to unknown hub topic "${q.topic}"`);
    }
  }
  for (const d of area.decisions) {
    if (d.topic && !findTopicBySlug(d.topic)) {
      err(`interview ${area.slug} decision "${d.title}" links to unknown hub topic "${d.topic}"`);
    }
    if (d.options.length < 2) err(`interview ${area.slug} decision "${d.title}" needs 2+ options`);
  }
  for (const rel of area.relatedTopics ?? []) {
    if (!findTopicBySlug(rel)) {
      err(`interview area "${area.slug}" relatedTopics has unknown topic "${rel}"`);
    }
  }
}

for (const track of TRACKS) {
  for (const b of track.blocks) {
    if (!areaSlugs.has(b.areaSlug)) {
      err(`track "${track.slug}" references unknown area "${b.areaSlug}"`);
    }
  }
  const sum = track.blocks.filter((b) => AREA_MAP[b.areaSlug]).reduce((n, b) => n + b.minutes, 0);
  // Blocks are authored to a budget; drifting far from it makes the plan dishonest.
  if (Math.abs(sum - track.minutes) > track.minutes * 0.15) {
    warn(`track "${track.slug}": blocks total ${sum} min but budget says ${track.minutes} min`);
  }
}

/* ---------- home-page interview meta must match the real data ---------- */

{
  const qaCount = AREAS.reduce((n, a) => n + a.qa.length, 0);
  const decisionCount = AREAS.reduce((n, a) => n + a.decisions.length, 0);
  if (INTERVIEW_META.areas !== AREAS.length)
    err(`interview/meta.ts: areas is ${INTERVIEW_META.areas}, actual ${AREAS.length}`);
  if (INTERVIEW_META.questions !== qaCount)
    err(`interview/meta.ts: questions is ${INTERVIEW_META.questions}, actual ${qaCount}`);
  if (INTERVIEW_META.decisions !== decisionCount)
    err(`interview/meta.ts: decisions is ${INTERVIEW_META.decisions}, actual ${decisionCount}`);
  for (const link of TRACK_LINKS) {
    const track = TRACKS.find((t) => t.slug === link.slug);
    if (!track) err(`interview/meta.ts: TRACK_LINKS names unknown track "${link.slug}"`);
    else if (track.title !== link.title || track.icon !== link.icon)
      err(`interview/meta.ts: TRACK_LINKS entry for "${link.slug}" is out of sync with tracks.ts`);
  }
  if (TRACK_LINKS.length !== TRACKS.length)
    err(`interview/meta.ts: TRACK_LINKS has ${TRACK_LINKS.length} tracks, actual ${TRACKS.length}`);
}

/* ---------- no browser storage ---------- */

/*
 * This app deliberately persists nothing in the browser — no localStorage,
 * sessionStorage, cookies, or IndexedDB. Content files discuss these APIs as
 * teaching material, so only application code is checked.
 */
const STORAGE_API = /\b(localStorage|sessionStorage|indexedDB)\b|document\.cookie/;

function scanForStorage(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(SRC, full);
    // Authored prose legitimately mentions these APIs, and one module exists
    // purely to DELETE data written by earlier versions.
    if (rel.startsWith("content/topics") || rel.startsWith("interview/areas")) continue;
    if (rel === "purgeLegacyStorage.ts") continue;
    if (entry.isDirectory()) {
      scanForStorage(full);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    const src = fs.readFileSync(full, "utf8");
    src.split("\n").forEach((line, i) => {
      if (STORAGE_API.test(line)) {
        err(`src/${rel}:${i + 1} uses browser storage — this app persists nothing client-side`);
      }
    });
  }
}

scanForStorage(SRC);

/* ---------- report ---------- */

const qaTotal = AREAS.reduce((n, a) => n + a.qa.length, 0);
const decisionTotal = AREAS.reduce((n, a) => n + a.decisions.length, 0);

console.log(`Topics:           ${topics.length}`);
console.log(`Content files:    ${Object.keys(CONTENT).length}`);
console.log(`Interview areas:  ${AREAS.length}`);
console.log(`Interview Q&A:    ${qaTotal}`);
console.log(`Decision tables:  ${decisionTotal}`);
console.log(`Tracks:           ${TRACKS.length}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) (non-blocking):`);
  const shown = warnings.slice(0, 15);
  for (const w of shown) console.log(`  - ${w}`);
  if (warnings.length > shown.length) console.log(`  ... and ${warnings.length - shown.length} more`);
}

if (errors.length) {
  console.error(`\n${errors.length} ERROR(S):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\n✓ content checks passed");
