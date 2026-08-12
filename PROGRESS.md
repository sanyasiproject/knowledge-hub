# Knowledge Hub Progress

## Current state (verified by `npm run check`)

| | Count |
|---|---|
| Domains | 59 |
| Categories | 85 |
| Topics | 298 |
| Authored content files | 298 (100% coverage) |
| Interview areas | 21 |
| Interview Q&A | 301 |
| Decision tables ("why X over Y") | 79 |
| Revision tracks | 4 |

Run `npm run check` for live numbers — it is also wired into `npm run build`.

---

## Session 3 — Interview Prep section + consistency fixes

### Added: the Interview Prep section (`src/interview/`)

A separate content set from `src/content` (the topic pages), built for the
opposite situation: the interview is in a few hours and you cannot read the hub.

- `types.ts` — `Area`, `QA`, `Decision`, `Sheet`, `Track`. The shapes encode what
  gets *asked*: `QA.why` (what the interviewer is testing), `QA.trap` (the
  confident wrong answer), and `Decision` (X vs Y, and when to pick each).
- `areas/*.ts` — 21 areas across 7 streams, weighted to software engineering and
  AI engineering.
- `tracks.ts` — four time-budgeted plans: Final 30 Minutes, 4-Hour Crash,
  1-Day, 2-Day. Each is an ordered checklist with a running clock.
- Pages: `/interview`, `/interview/track/:slug`, `/interview/area/:slug`.
- Each area has three views: **Revise** (must-knows, sheets, decisions,
  pitfalls, numbers), **Q&A** (filterable by depth), and **One-pager**
  (print-optimised; `@media print` rules in `index.css`).
- Questions cross-link to the full hub topic via `QA.topic`.

### Added: `npm run check` (`scripts/check-content.mjs`)

Type-checking proves the shapes; this proves the cross-references. It catches
what `tsc` cannot: topics with no content, content unreachable from the
taxonomy, broken `related` slugs, interview tracks naming a non-existent area,
duplicate ids, out-of-range MCQ answers, and ragged comparison tables.
Wired into `npm run build`, so these can no longer regress silently.

### Removed: all client-side storage

The app now persists nothing in the browser. Deleted `useProgress`,
`useBookmarks`, and `useInterviewProgress`, along with the UI they backed:
the `/bookmarks` page and star buttons, the home progress panel, read badges,
learning-path completion bars, and the interview "mark as known" / track
checkboxes. Theme is in-memory only, defaulting to the OS preference.

`npm run check` now fails the build on any use of `localStorage`,
`sessionStorage`, `indexedDB`, or `document.cookie` in application code.

### Fixed

- **`cloud-computing` content was orphaned** — registered in
  `src/content/index.ts` but not a topic in any category, so the authored file
  was unreachable. Now a topic in `cloud-computing / cloud-fundamentals`.
- **Broken cross-link** — `big-o-notation` listed `sorting` as a related topic;
  no such topic exists (the Algorithms domain is still `coming-soon`).
  Repointed to `arrays-strings`.
- **Stale docs** — README and this file claimed 272 topics / 82 categories /
  274 entries. Actual: 298 / 85 / 298.

---

## Known gaps (surfaced as warnings by `npm run check`)

These are content-completeness gaps, not defects. The checker reports them as
warnings so they stay visible without blocking the build.

| Section | Coverage | Note |
|---|---|---|
| `followUps` | 148 / 298 | "Follow-up & Tricky Questions" — high interview value |
| `animations` | 176 / 298 | Step-through walkthroughs |
| `resources` | 209 / 298 | Docs, books, papers |

Everything else (`quickSummary`, `detailed`, `deepDive`, `code`, `diagrams`,
`comparison`, `interviewQA`, `mcqs`, `exercises`, `flashcards`, `revisionNotes`,
`cheatSheet`, `glossary`) is at or near 100%.

---

## Earlier sessions

- **Session 2 (2026-07-31)** — authored ~165 content files across all ten domain
  groups; regenerated `src/content/index.ts` to register every topic.
- **Session 1** — project scaffold (Vite + React 19 + TypeScript + Tailwind),
  taxonomy across 10 domain groups, first 107 content files.

## Where to pick up

1. `npm install && npm run check` — confirms the tree is consistent.
2. Fill `followUps` for the 148 topics lacking them; the checker lists them.
3. Then `resources`, then `animations`.
4. `service-models.ts` remains the reference for a fully-populated topic file.
