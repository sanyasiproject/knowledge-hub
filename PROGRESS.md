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

## Session 5 — Algorithm Practice: every topic now has a question bank

The Practice section (`src/practice/`) mirrors the Algorithms taxonomy as a pure
problem-solving surface: no theory, only problems. Each `topics/<slug>.ts` file
exports one `TopicPractice` whose questions each carry a full statement with
worked examples and constraints, a C++ solution, an explanation of why it works,
and a link to the original problem.

Coverage went from 50/147 topics to **147/147 — 1,790 questions**.

| Category | Topics | Questions |
|---|---|---|
| `interview-patterns` | 8 | 129 |
| `searching-sorting` | 7 | 119 |
| `problem-patterns` | 8 | 129 |
| `graph-algorithms` | 17 | 266 |
| `flows-matching` | 4 | 56 |
| `tree-algorithms` | 8 | 84 |
| `dynamic-programming` | 28 | 298 |
| `range-queries` | 16 | 168 |
| `string-algorithms` | 18 | 196 |
| `math-number-theory` | 18 | 191 |
| `combinatorics-counting` | 5 | 48 |
| `game-theory-probability` | 4 | 44 |
| `geometry` | 6 | 62 |
| **Total** | **147** | **1,790** |

### How the 97 new banks were authored

Fanned out one agent per topic across seven category-scoped workflow runs, each
agent working from the same spec: read `src/practice/types.ts` plus
`dp-fundamentals.ts` and `dijkstra.ts` as style references, grep its own
taxonomy line for the title/useCase, then author and typecheck a single file.
Agents were forbidden from touching anything but their own file; the whole tree
was verified centrally after each wave with `npx tsc -b`, `npm run check` and
`npm run build`.

Standards the agents held to, which are worth keeping for future banks:

- **Examples are executed, not eyeballed.** Most agents extracted their C++,
  compiled it with `g++ -std=c++17`, ran every stated example, and several
  stress-tested against a brute force over hundreds to tens of thousands of
  random cases. That caught real bugs — the popular range-assign formulation of
  CF 343D (Water Tree) passes the official sample and fails on random input; a
  VLATTICE example was off by a wide margin on first draft.
- **No invented problems, no guessed URLs.** Where an agent could not verify a
  link (most often a restructured GeeksforGeeks slug) the optional `link` field
  was omitted rather than filled with a plausible guess.
- **Thin patterns are admitted, not padded.** `boyer-moore`, `merge-sort-tree`,
  `segmented-sieve` and `spf-mobius` have few problems where the pattern is the
  *intended* solution; those banks say so in the explanations and name the
  faster real-world alternative instead of pretending otherwise.

### Practice UI

Three controls were added on top of the banks:

- **Interview-frequency filter** on `/practice` (Very High / High / Medium / Low,
  with counts), because with 147 topics "what do I study first" matters more
  than browsing. Category headings recount against the filtered set. It is
  multi-select: pills toggle independently and combine as OR, an empty selection
  means no filter, and *All* clears. The difficulty filter on a topic page works
  the same way.
- **Collapsing.** Each category on the hub and each question on a topic page
  toggles individually, plus bulk *Expand all* / *Collapse all*. On a topic page
  a statement and its solution collapse independently, so *Hide all solutions*
  gives you a clean attempt-first list without losing the statements.
- **Source labels.** `src/practice/sources.ts` maps a problem link to its judge
  (LeetCode, CSES, Codeforces, GeeksforGeeks, SPOJ, AtCoder, POJ, Library
  Checker, UVa, CP-Algorithms; unknown hosts fall back to the bare hostname).
  Every "Solve it yourself" link carries a coloured source badge and a hover
  title naming the exact destination host, and each topic header summarises
  which judges its bank draws on.

State is in-memory only — no `localStorage`, per the storage ban the checker
enforces.

### Known rough edges

- Some conceptual overlap between neighbouring banks is deliberate (LC 315 in
  both `fenwick-tree-1d` and `inversion-count-bit`; border/period problems in
  both `lps-array` and `z-function`, solved two different ways). Worth a pass if
  strict disjointness is ever wanted.
- A handful of linked problems are LeetCode premium (LC 469, LC 1245, LC 1522):
  slugs are correct but the pages need a subscription.
- `spf-mobius` spells the function "Moebius" throughout to stay ASCII, while the
  taxonomy title uses "Möbius".
- C++ portability: every bank now uses `std::gcd` from `<numeric>`. GNU `__gcd`
  was swept out of `inclusion-exclusion`, `linear-diophantine`, `eulers-totient`
  and `miller-rabin` because it does not compile against macOS libc++.

Verified with `npx tsc -b` (clean), `npm run check` (passes), `npx oxlint`
(clean) and `npm run build` (succeeds).

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
2. The Practice section is complete (147/147 topics). Remaining work there is
   quality, not coverage: see "Known rough edges" under Session 5.
3. Fill `followUps` for the 148 topics lacking them; the checker lists them.
4. Then `resources`, then `animations`.
5. `service-models.ts` remains the reference for a fully-populated topic file.
