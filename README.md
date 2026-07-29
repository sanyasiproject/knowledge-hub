# 🧭 Software Engineering Knowledge Hub

A single destination for software engineers to **learn, visualize, revise, and prepare** — every SE topic organized into a deep, consistent hierarchy and presented with the best learning formats.

This is **not** a blog, an LMS, a docs site, or a roadmap. It is a structured knowledge platform. This repository contains the **complete information architecture** and a **reusable, data-driven rendering system** — the foundation the spec asks to be built before content is written at scale.

## What's built (Phase 1 — Architecture)

Per the master spec's output requirements, this phase delivers:

1. ✅ **Complete information architecture** — 59 domains, 82 categories, 272+ topics
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
npm run build    # production build
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

## Roadmap

- **Phase 1 (done):** Information architecture + reusable rendering system.
- **Phase 2:** Author content across topics, domain by domain.
- **Phase 3:** Real diagrams/animations, spaced-repetition flashcards, MCQ scoring & progress.
- **Later:** Coding Interview Preparation section (reserved placeholder in nav today).
