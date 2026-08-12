/**
 * Inventory of code blocks that still need converting to TypeScript.
 *
 * `KEEP_NATIVE` lists topics where the source language is load-bearing — the
 * example demonstrates pointers, syscalls, manual memory, real threads, or a
 * deliberate cross-language comparison. Rewriting those in TypeScript would
 * make the content wrong rather than merely different, so they are excluded by
 * design and the exclusion is asserted, not assumed.
 *
 * Usage:
 *   node scripts/code-inventory.mjs            # summary
 *   node scripts/code-inventory.mjs --list     # remaining topic slugs
 *   node scripts/code-inventory.mjs <slug>     # dump one topic's blocks
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT = path.resolve("node_modules/.cache/content-check");
const { allTopics } = await import(pathToFileURL(path.join(OUT, "data/taxonomy/index.js")).href);
const { CONTENT } = await import(pathToFileURL(path.join(OUT, "content/index.js")).href);

/** Topics whose examples must stay in their original language, and why. */
export const KEEP_NATIVE = {
  "cpu-architecture": "pipelines, registers, cache lines — no JS equivalent",
  "memory-hierarchy": "cache locality and false sharing need real memory layout",
  "memory-allocation": "malloc/free and fragmentation are not expressible in JS",
  "virtual-memory": "page tables and mmap are syscall-level",
  "processes-vs-threads": "fork() and pthreads have no JS counterpart",
  "cpu-scheduling": "scheduler behaviour needs real OS threads",
  "context-switching": "register save/restore is machine-level",
  "file-systems": "inodes and file syscalls are OS-level",
  "synchronization-primitives": "mutexes, semaphores, condition variables need real threads",
  "memory-models": "memory ordering and barriers require a language that exposes them",
  "locks-and-atomics": "atomics and CAS need shared-memory threading",
  "lock-free-programming": "ABA and CAS loops need real atomics",
  "deadlocks": "requires two genuinely concurrent threads holding locks",
  "compilers-interpreters": "lexer/parser shown at the level a compiler actually works",
  "virtual-machines": "bytecode interpretation shown close to the metal",
  "paradigms-overview": "deliberately contrasts several languages — that is the point",
  "compilation-vs-interpretation": "the C-vs-JS contrast IS the lesson",
};

/** Languages that are configuration or query syntax, not a program. */
const NON_PROGRAM = new Set([
  "bash", "sql", "yaml", "json", "dockerfile", "hcl", "cypher", "graphql",
  "promql", "nginx", "rego", "puppet", "protobuf", "http", "bicep", "text",
  "redis", "groovy", "lua",
]);

/** Already in the JS family — nothing to do. */
const JS_FAMILY = new Set(["typescript", "javascript", "ts", "js", "tsx", "jsx"]);

/**
 * Languages chosen deliberately rather than by accident.
 *
 * Haskell/Rust/Go/etc. teach themselves — the language IS the subject.
 * Python is the honest language for ML training topics: scikit-learn, numpy,
 * and PEFT have no TypeScript equivalent, so a training loop written in TS
 * would be as misleading as one written in C++.
 */
const INTENTIONAL = new Set([
  "haskell", "rust", "go", "erlang", "clojure", "prolog", "scala", "python",
]);

export function pending() {
  const rows = [];
  for (const { topic, domain } of allTopics()) {
    if (KEEP_NATIVE[topic.slug]) continue;
    const blocks = CONTENT[topic.slug]?.code ?? [];
    blocks.forEach((b, i) => {
      const lang = (b.language || "").toLowerCase();
      if (JS_FAMILY.has(lang) || NON_PROGRAM.has(lang) || INTENTIONAL.has(lang)) return;
      rows.push({
        slug: topic.slug,
        group: domain.group,
        index: i,
        language: b.language,
        caption: b.caption ?? "",
        lines: b.source.split("\n").length,
        chars: b.source.length,
      });
    });
  }
  return rows;
}

const arg = process.argv[2];

if (arg && !arg.startsWith("--")) {
  const blocks = CONTENT[arg]?.code ?? [];
  console.log(`=== ${arg} — ${blocks.length} block(s) ===`);
  blocks.forEach((b, i) => {
    console.log(`\n--- [${i}] language=${b.language} caption=${JSON.stringify(b.caption ?? "")}`);
    console.log(b.source);
  });
} else {
  const rows = pending();
  const byGroup = {};
  const byLang = {};
  const topics = new Set();
  for (const r of rows) {
    byGroup[r.group] = (byGroup[r.group] || 0) + 1;
    byLang[r.language] = (byLang[r.language] || 0) + 1;
    topics.add(r.slug);
  }
  console.log(`Blocks still to convert: ${rows.length}  across ${topics.size} topics`);
  console.log(`Total lines: ${rows.reduce((n, r) => n + r.lines, 0)}`);
  console.log(`\nBy language:`);
  Object.entries(byLang).sort((a, b) => b[1] - a[1]).forEach(([l, n]) => console.log(`  ${String(n).padStart(4)}  ${l}`));
  console.log(`\nBy domain group:`);
  Object.entries(byGroup).sort((a, b) => b[1] - a[1]).forEach(([g, n]) => console.log(`  ${String(n).padStart(4)}  ${g}`));
  console.log(`\nExcluded by design: ${Object.keys(KEEP_NATIVE).length} topics (see KEEP_NATIVE)`);
  if (arg === "--list") {
    console.log(`\nRemaining topics:\n${[...topics].join(" ")}`);
  }
}
