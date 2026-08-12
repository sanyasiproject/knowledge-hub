/**
 * Time-budgeted revision tracks.
 *
 * The organising question is not "what should I learn?" but "the interview is
 * in N hours — what do I read, in what order, and what do I skip?"
 *
 * Every block names a scope so the reading is bounded: at 30 minutes you get
 * `must-know` bullets only; at two days you get the full question bank.
 * Blocks are ordered so that if you run out of time, what you dropped was
 * genuinely the least valuable thing left.
 */

import type { Track, TrackBlock } from "./types";
import { AREA_MAP } from "./index";

export const TRACKS: Track[] = [
  {
    slug: "final-30",
    title: "Final 30 Minutes",
    icon: "🚨",
    minutes: 30,
    blurb:
      "You are in the lobby. Skim only the irreducible facts — the ones whose absence is immediately obvious to an interviewer.",
    audience: "Anyone, immediately before the call.",
    blocks: [
      { areaSlug: "javascript", minutes: 4, scope: "must-know", rationale: "Event loop and closures come up in some form in almost every JS screen." },
      { areaSlug: "dsa", minutes: 5, scope: "must-know", rationale: "Complexity vocabulary you must not fumble." },
      { areaSlug: "databases", minutes: 4, scope: "must-know", rationale: "Indexes, transactions, N+1 — cheap to recall, expensive to miss." },
      { areaSlug: "system-design", minutes: 6, scope: "must-know", rationale: "The framework to fall back on when the question is open-ended." },
      { areaSlug: "llm-transformers", minutes: 5, scope: "must-know", rationale: "Attention, context window, and why hallucination happens." },
      { areaSlug: "rag", minutes: 3, scope: "must-know", rationale: "The single most-asked applied-AI topic." },
      { areaSlug: "behavioral", minutes: 3, scope: "must-know", rationale: "Have STAR and your two strongest stories loaded." },
    ],
  },

  {
    slug: "crash-4h",
    title: "4-Hour Crash",
    icon: "⚡",
    minutes: 240,
    blurb:
      "One focused evening. Must-knows plus the decision tables — because 'why X over Y' is the question shape that dominates real interviews.",
    audience: "Interview tomorrow morning, and you have tonight.",
    blocks: [
      { areaSlug: "dsa", minutes: 25, scope: "core-qa", rationale: "Complexity and the core patterns; skip the exotic structures." },
      { areaSlug: "javascript", minutes: 25, scope: "core-qa" },
      { areaSlug: "databases", minutes: 25, scope: "core-qa", rationale: "Indexing and transactions carry most of the weight." },
      { areaSlug: "api-design", minutes: 15, scope: "decisions", rationale: "REST vs GraphQL vs gRPC is nearly guaranteed." },
      { areaSlug: "system-design", minutes: 35, scope: "core-qa", rationale: "The framework plus caching, scaling, and consistency." },
      { areaSlug: "caching-messaging", minutes: 15, scope: "decisions" },
      { areaSlug: "os-concurrency", minutes: 15, scope: "must-know" },
      { areaSlug: "llm-transformers", minutes: 25, scope: "core-qa" },
      { areaSlug: "rag", minutes: 25, scope: "core-qa", rationale: "Chunking, retrieval, and RAG-vs-fine-tuning." },
      { areaSlug: "agents-mcp", minutes: 15, scope: "must-know" },
      { areaSlug: "behavioral", minutes: 20, scope: "core-qa", rationale: "Write your stories down; do not improvise them live." },
    ],
  },

  {
    slug: "one-day",
    title: "1-Day Plan",
    icon: "📅",
    minutes: 480,
    blurb:
      "A full day, structured in four sessions. Complete coverage of the high-frequency material with the decision tables and pitfalls for each area.",
    audience: "Interview tomorrow, and today is clear.",
    blocks: [
      { areaSlug: "dsa", minutes: 45, scope: "all-qa" },
      { areaSlug: "javascript", minutes: 35, scope: "all-qa" },
      { areaSlug: "typescript", minutes: 20, scope: "core-qa" },
      { areaSlug: "react", minutes: 35, scope: "core-qa" },
      { areaSlug: "nodejs", minutes: 25, scope: "core-qa" },
      { areaSlug: "python", minutes: 25, scope: "core-qa" },
      { areaSlug: "oop-design", minutes: 30, scope: "core-qa" },
      { areaSlug: "databases", minutes: 40, scope: "all-qa" },
      { areaSlug: "api-design", minutes: 25, scope: "core-qa" },
      { areaSlug: "caching-messaging", minutes: 25, scope: "core-qa" },
      { areaSlug: "os-concurrency", minutes: 25, scope: "core-qa" },
      { areaSlug: "networking", minutes: 20, scope: "core-qa" },
      { areaSlug: "system-design", minutes: 45, scope: "all-qa" },
      { areaSlug: "ml-foundations", minutes: 25, scope: "core-qa" },
      { areaSlug: "llm-transformers", minutes: 30, scope: "all-qa" },
      { areaSlug: "rag", minutes: 30, scope: "all-qa" },
      { areaSlug: "behavioral", minutes: 20, scope: "all-qa" },
    ],
  },

  {
    slug: "two-day",
    title: "2-Day Deep Revision",
    icon: "🗓️",
    minutes: 960,
    blurb:
      "Everything, at a pace that lets it stick. Day one is language, CS core, and data; day two is design, AI engineering, delivery, and behavioral.",
    audience: "Two clear days before an important loop.",
    blocks: [
      // ---- Day 1: language, CS core, data ----
      { areaSlug: "dsa", minutes: 70, scope: "all-qa" },
      { areaSlug: "javascript", minutes: 45, scope: "all-qa" },
      { areaSlug: "typescript", minutes: 35, scope: "all-qa" },
      { areaSlug: "react", minutes: 50, scope: "all-qa" },
      { areaSlug: "nodejs", minutes: 40, scope: "all-qa" },
      { areaSlug: "python", minutes: 40, scope: "all-qa" },
      { areaSlug: "oop-design", minutes: 45, scope: "all-qa" },
      { areaSlug: "os-concurrency", minutes: 40, scope: "all-qa" },
      { areaSlug: "networking", minutes: 35, scope: "all-qa" },
      { areaSlug: "databases", minutes: 60, scope: "all-qa" },
      // ---- Day 2: design, AI, delivery, behavioral ----
      { areaSlug: "api-design", minutes: 35, scope: "all-qa" },
      { areaSlug: "caching-messaging", minutes: 40, scope: "all-qa" },
      { areaSlug: "security", minutes: 35, scope: "all-qa" },
      { areaSlug: "system-design", minutes: 75, scope: "all-qa" },
      { areaSlug: "ml-foundations", minutes: 45, scope: "all-qa" },
      { areaSlug: "llm-transformers", minutes: 50, scope: "all-qa" },
      { areaSlug: "rag", minutes: 50, scope: "all-qa" },
      { areaSlug: "agents-mcp", minutes: 40, scope: "all-qa" },
      { areaSlug: "llmops-evals", minutes: 40, scope: "all-qa" },
      { areaSlug: "testing-devops", minutes: 65, scope: "all-qa" },
      { areaSlug: "behavioral", minutes: 40, scope: "all-qa" },
    ],
  },
];

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

/**
 * Blocks whose area actually exists in the registry.
 *
 * Tracks are authored against the full planned area list, so this keeps a
 * track renderable while an area is still being written rather than crashing
 * the page on a missing slug.
 */
export function resolvedBlocks(track: Track): TrackBlock[] {
  return track.blocks.filter((b) => AREA_MAP[b.areaSlug]);
}

/** Real budget of a track, counting only blocks whose area exists. */
export function trackMinutes(track: Track): number {
  return resolvedBlocks(track).reduce((n, b) => n + b.minutes, 0);
}

export const SCOPE_LABEL: Record<TrackBlock["scope"], string> = {
  "must-know": "Must-know bullets only",
  sheets: "Revision sheets",
  decisions: "Decision tables (X vs Y)",
  "core-qa": "Core questions",
  "all-qa": "Full question bank",
  pitfalls: "Pitfalls",
};
