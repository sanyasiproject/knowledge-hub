/**
 * The STANDARD TOPIC PAGE section schema.
 *
 * Every topic renders through the single reusable `TopicPage` template. The
 * template walks this list and renders each section with the right presentation
 * component. Sections a topic hasn't authored yet appear as consistent, clearly
 * labelled placeholders — so the full learning surface is visible everywhere.
 *
 * `component` maps to a renderer registered in components/content/registry.tsx.
 */

export type ContentComponentKind =
  | "quick-summary"
  | "detailed-explanation"
  | "deep-dive"
  | "diagram"
  | "animation"
  | "comparison-table"
  | "code"
  | "interview-qa"
  | "follow-ups"
  | "mcq"
  | "flashcards"
  | "exercises"
  | "revision-notes"
  | "cheat-sheet"
  | "resources"
  | "glossary"
  | "related";

export interface TopicSectionDef {
  id: string;
  label: string;
  component: ContentComponentKind;
  /** Grouping used for the on-page "In this topic" table of contents. */
  group: "Learn" | "Visualize" | "Practice" | "Reference";
  /** Short description shown under the heading and in placeholders. */
  note: string;
}

export const TOPIC_SECTIONS: TopicSectionDef[] = [
  // ---- Learn ----
  { id: "quick-summary", label: "Quick Summary", component: "quick-summary", group: "Learn", note: "A 2-minute revision of the core idea." },
  { id: "detailed-explanation", label: "Detailed Explanation", component: "detailed-explanation", group: "Learn", note: "The concept explained properly, from first principles." },
  { id: "deep-dive", label: "Deep Technical Explanation", component: "deep-dive", group: "Learn", note: "Internals, edge cases, and trade-offs for mastery." },
  { id: "code", label: "Code & Examples", component: "code", group: "Learn", note: "Runnable snippets and reference implementations." },

  // ---- Visualize ----
  { id: "diagrams", label: "Diagrams", component: "diagram", group: "Visualize", note: "Architecture, flow, sequence, and state diagrams." },
  { id: "animations", label: "Animations", component: "animation", group: "Visualize", note: "Step-by-step animated walkthroughs of the mechanism." },
  { id: "comparison", label: "Comparison Table", component: "comparison-table", group: "Visualize", note: "Side-by-side trade-offs against alternatives." },

  // ---- Practice ----
  { id: "interview-qa", label: "Interview Questions & Answers", component: "interview-qa", group: "Practice", note: "Common questions with model answers." },
  { id: "follow-ups", label: "Follow-up & Tricky Questions", component: "follow-ups", group: "Practice", note: "How interviewers dig deeper, and frequently-confused points." },
  { id: "mcqs", label: "MCQs", component: "mcq", group: "Practice", note: "Self-test multiple-choice questions." },
  { id: "exercises", label: "Exercises & Scenarios", component: "exercises", group: "Practice", note: "Practical, scenario-based, and debugging exercises." },
  { id: "flashcards", label: "Flashcards", component: "flashcards", group: "Practice", note: "Active-recall cards for spaced repetition." },

  // ---- Reference ----
  { id: "revision-notes", label: "Revision Notes", component: "revision-notes", group: "Reference", note: "Condensed notes for the day before an interview." },
  { id: "cheat-sheet", label: "Cheat Sheet", component: "cheat-sheet", group: "Reference", note: "The one-page quick reference." },
  { id: "resources", label: "Resources", component: "resources", group: "Reference", note: "Docs, books, papers, talks, and open-source references." },
  { id: "glossary", label: "Glossary", component: "glossary", group: "Reference", note: "Key terms for this topic, defined." },
  { id: "related", label: "Related Topics", component: "related", group: "Reference", note: "Where to go next across the hub." },
];

export const TOPIC_SECTION_GROUPS = ["Learn", "Visualize", "Practice", "Reference"] as const;
