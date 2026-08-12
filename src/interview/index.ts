/**
 * Interview Prep registry.
 *
 * Areas are registered here; tracks (in `tracks.ts`) select across them by
 * time budget. Everything downstream — nav, pages, search, print — derives
 * from this module, so adding an area means adding one import and one entry.
 */

import type { Area, AreaMap, Depth, QA, Stream } from "./types";
import { javascript } from "./areas/javascript";
import { typescript } from "./areas/typescript";
import { react } from "./areas/react";
import { nodejs } from "./areas/nodejs";
import { python } from "./areas/python";
import { dsa } from "./areas/dsa";
import { llmTransformers } from "./areas/llm-transformers";
import { rag } from "./areas/rag";
import { databases } from "./areas/databases";
import { apiDesign } from "./areas/api-design";
import { systemDesign } from "./areas/system-design";
import { agentsMcp } from "./areas/agents-mcp";
import { osConcurrency } from "./areas/os-concurrency";
import { networking } from "./areas/networking";
import { cachingMessaging } from "./areas/caching-messaging";
import { oopDesign } from "./areas/oop-design";
import { security } from "./areas/security";
import { mlFoundations } from "./areas/ml-foundations";
import { llmopsEvals } from "./areas/llmops-evals";
import { testingDevops } from "./areas/testing-devops";
import { behavioral } from "./areas/behavioral";

export const AREAS: Area[] = [
  javascript,
  typescript,
  react,
  nodejs,
  python,
  dsa,
  oopDesign,
  osConcurrency,
  networking,
  databases,
  apiDesign,
  cachingMessaging,
  security,
  systemDesign,
  mlFoundations,
  llmTransformers,
  rag,
  agentsMcp,
  llmopsEvals,
  testingDevops,
  behavioral,
];

export const AREA_MAP: AreaMap = Object.fromEntries(AREAS.map((a) => [a.slug, a]));

export function getArea(slug: string): Area | undefined {
  return AREA_MAP[slug];
}

/** Canonical stream order — drives grouping on the hub page and the sidebar. */
export const STREAM_ORDER: Stream[] = [
  "Language & Runtime",
  "CS Core",
  "Backend & Data",
  "System Design",
  "AI Engineering",
  "Platform & Delivery",
  "Behavioral",
];

export function areasByStream(): { stream: Stream; areas: Area[] }[] {
  return STREAM_ORDER.map((stream) => ({
    stream,
    areas: AREAS.filter((a) => a.stream === stream),
  })).filter((g) => g.areas.length > 0);
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export function interviewStats() {
  return {
    areas: AREAS.length,
    questions: AREAS.reduce((n, a) => n + a.qa.length, 0),
    decisions: AREAS.reduce((n, a) => n + a.decisions.length, 0),
    sheetPoints: AREAS.reduce((n, a) => n + a.sheets.reduce((m, s) => m + s.points.length, 0), 0),
    mustKnow: AREAS.reduce((n, a) => n + a.mustKnow.length, 0),
  };
}

export function areaStats(area: Area) {
  return {
    questions: area.qa.length,
    decisions: area.decisions.length,
    mustKnow: area.mustKnow.length,
    sheetPoints: area.sheets.reduce((m, s) => m + s.points.length, 0),
    /** Rough read time: must-knows and sheet lines skim fast, Q&A does not. */
    minutes: Math.max(
      3,
      Math.round(
        area.qa.length * 1.1 +
          area.decisions.length * 0.8 +
          area.sheets.reduce((m, s) => m + s.points.length, 0) * 0.15 +
          area.mustKnow.length * 0.2
      )
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Question selection                                                  */
/* ------------------------------------------------------------------ */

const DEPTH_RANK: Record<Depth, number> = { Core: 0, Intermediate: 1, Advanced: 2 };

/** Questions sorted easiest-first — the order you want when time is short. */
export function sortedQA(area: Area): QA[] {
  return [...area.qa].sort((a, b) => DEPTH_RANK[a.depth] - DEPTH_RANK[b.depth]);
}

export function qaByDepth(area: Area, depth: Depth): QA[] {
  return area.qa.filter((q) => q.depth === depth);
}

/** A globally unique key for a question — used for progress tracking. */
export function qaKey(areaSlug: string, id: string): string {
  return `${areaSlug}:${id}`;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export interface QAHit {
  area: Area;
  qa: QA;
  score: number;
}

/** Search across every question, answer, and tag in the bank. */
export function searchQA(query: string, limit = 40): QAHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const hits: QAHit[] = [];

  for (const area of AREAS) {
    for (const item of area.qa) {
      const haystack = [item.q, item.a, item.why ?? "", item.trap ?? "", ...(item.tags ?? []), area.title]
        .join(" ")
        .toLowerCase();
      const question = item.q.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (!haystack.includes(term)) {
          score = -1;
          break;
        }
        score += question.includes(term) ? 5 : 1;
      }
      if (score > 0) hits.push({ area, qa: item, score });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export type { Area, QA, Decision, Sheet, Track, TrackBlock, Depth, Stream } from "./types";
