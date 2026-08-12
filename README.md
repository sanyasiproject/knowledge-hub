# 🧭 Software Engineering Knowledge Hub

A single destination for software engineers to **learn, visualize, revise, and prepare** — every SE topic organized into a deep, consistent hierarchy and presented with the best learning formats.

This is **not** a blog, an LMS, a docs site, or a roadmap. It is a structured knowledge platform. This repository contains the **complete information architecture** and a **reusable, data-driven rendering system** — the foundation the spec asks to be built before content is written at scale.

## What's built (Phase 1 — Architecture)

Per the master spec's output requirements, this phase delivers:

1. ✅ **Complete information architecture** — 59 domains, 85 categories, 298 topics
2. ✅ **Navigation hierarchy** — collapsible sidebar + search, grouped by domain group
3. ✅ **Category hierarchy** — every domain → categories → topics
4. ✅ **Topic hierarchy** — every topic is a leaf with a full page
5. ✅ **Reusable page template** — one `TopicPage` renders every topic
6. ✅ **Reusable UI components** — one presentation component per format

Content is authored incrementally on top of this structure without ever changing layout.

## Tech stack

- **Vite + React + TypeScript** — fast, typed, future-proof
- **React Router** — clean URLs (`/domain/...`, `/topic/...`), search-friendly
- **Tailwind CSS** — consistent design system, light/dark mode

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # content consistency checks
npm run build    # type-check + content check + production build
```

## How it's organized

The platform is **100% data-driven**. The hierarchy lives in typed data; pages just render it.

```
src/
├── data/
│   ├── schema.ts              # Types: Domain → Category → Topic; Level, Status, groups
│   ├── categoryStructure.ts   # THE standard category structure (every category is identical)
│   ├── topicSections.ts       # THE standard topic-page section schema (Learn/Visualize/Practice/Reference)
│   └── taxonomy/              # The full information architecture, split by domain group
│       ├── foundations.ts       languages.ts           craftsmanship.ts
│       ├── dataStorage.ts       backendDistributed.ts  cloudInfra.ts
│       ├── opsReliability.ts    architecture.ts        aiEngineering.ts
│       ├── career.ts
│       └── index.ts           # Combines all + lookup/search/stats helpers
├── content/
│   ├── types.ts               # Authored-content model (per section)
│   ├── index.ts               # Registry: topic slug → content
│   └── topics/                # Authored content, one file per topic
├── components/
│   ├── layout/                # Layout shell, Sidebar (nav), top bar (search + theme)
│   ├── ui/                    # Primitives: Card, badges, Placeholder, Breadcrumbs
│   └── content/sections.tsx   # One renderer per presentation format (+ placeholders)
└── pages/
    ├── Home.tsx  DomainPage.tsx  CategoryPage.tsx
    ├── TopicPage.tsx          # ⭐ The single reusable topic template
    └── SearchResults.tsx  ComingSoon.tsx  NotFound.tsx
```

## The two schemas that keep everything consistent

- **`categoryStructure.ts`** — every category page renders the *same* structure
  (Overview, Roadmap, Prerequisites, Fundamentals → Expert → Advanced Concepts,
  Internal Working, Architecture, Best Practices, Interview, Revision, Resources, …).
- **`topicSections.ts`** — every topic page renders the *same* sections, grouped into
  **Learn** (summary, explanation, deep dive, code), **Visualize** (diagrams, animations,
  comparison tables), **Practice** (interview Q&A, follow-ups, MCQs, exercises, flashcards),
  and **Reference** (revision notes, cheat sheet, resources, glossary, related topics).

Every section renders authored content when present, or a **clean, labelled placeholder**
otherwise — so the full learning surface is visible everywhere from day one.

## Presentation formats supported (reusable components)

Text (quick summary / detailed / deep dive), code blocks, diagram slots (architecture,
flow, sequence, state, mindmap, network — SVG/Mermaid/image ready), **interactive
step-through animations**, comparison tables, **interactive MCQs** (with instant grading),
**flip flashcards**, collapsible interview Q&A with follow-ups, exercises, revision notes,
cheat sheets, curated resources, glossaries, and cross-linked related topics.

## How to expand (the whole point)

**Add a topic** → add one entry to the relevant `taxonomy/*.ts` file. Navigation, routing,
overview pages, and the topic template update automatically.

**Author content for a topic** → create `src/content/topics/<slug>.ts`, fill any subset of
sections, and register it in `src/content/index.ts`. No component changes needed.

**Add a whole domain** → add a `Domain` object to a taxonomy file (or a new file wired into
`taxonomy/index.ts`).

### Sample fully-authored topics (to see the template with real content)

- `computer-science-fundamentals / computation-and-complexity / big-o-notation`
- `operating-systems / processes-and-threads / processes-vs-threads`
- `caching / caching-fundamentals / caching-basics` (includes an interactive animation)

## Interview Prep — the last-minute layer

`/interview` is a **separate content set** from the topic pages, built for the
opposite situation: the interview is in a few hours and you cannot read the hub.

- **21 areas**, weighted to software engineering and AI engineering, each with
  must-know bullets, revision sheets, **decision tables** ("why X over Y"), a
  question bank with model answers, pitfalls, and numbers worth memorising.
- **301 questions**, each carrying what the interviewer is *actually testing*
  and the confident-sounding wrong answer most candidates give.
- **4 time-budgeted tracks** — Final 30 Minutes, 4-Hour Crash, 1-Day, 2-Day —
  each an ordered checklist with a running clock showing how far into the plan
  each block starts.
- Every area has a **printable one-pager** view for revising on paper.
- Questions cross-link back into the full hub topic for depth afterwards.

```
src/interview/
├── types.ts       # Area, QA, Decision, Sheet, Track
├── index.ts       # Registry + search + stats
├── tracks.ts      # Time-budgeted revision plans
└── areas/         # One file per area
```

Add an area: create `areas/<slug>.ts`, add one import and one entry in
`index.ts`. Nav, search, stats, and the print view pick it up automatically.

## No client-side storage

The app persists **nothing** in the browser — no `localStorage`, `sessionStorage`,
cookies, or IndexedDB. Nothing about your reading is recorded anywhere. The theme
toggle applies for the session only and each load starts from your OS preference.

`npm run check` enforces this: any use of a browser-storage API in application
code fails the build. (Content files discuss these APIs as teaching material and
are excluded.)

## Consistency checking

```bash
npm run check      # also runs as part of npm run build
```

Type-checking proves the *shapes* are right; `scripts/check-content.mjs` proves
the *cross-references* are — topics without content, content unreachable from
the taxonomy, broken `related` slugs, tracks naming a non-existent area,
duplicate ids, out-of-range MCQ answers, ragged comparison tables.

## Roadmap

- **Phase 1 (done):** Information architecture + reusable rendering system.
- **Phase 2 (done):** Content authored across all 298 topics.
- **Phase 3 (done):** Interview Prep section with time-budgeted revision tracks.
- **Phase 4:** Fill the remaining `followUps` (148 topics), `resources` (89),
  and `animations` (122) — `npm run check` lists them as warnings.
- **Later:** Richer diagrams and animations across the remaining topics.
