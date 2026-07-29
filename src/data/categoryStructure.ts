/**
 * The STANDARD CATEGORY STRUCTURE.
 *
 * Per the master spec, every major category follows the same structure. This
 * file is the single source of truth for that structure — the category
 * overview page renders these groups identically for every category, so the
 * platform is perfectly consistent and predictable to navigate.
 */

export interface CategoryStructureItem {
  id: string;
  label: string;
  /** Short note describing what belongs in this part of a category. */
  note: string;
}

export interface CategoryStructureGroup {
  id: string;
  label: string;
  items: CategoryStructureItem[];
}

export const CATEGORY_STRUCTURE: CategoryStructureGroup[] = [
  {
    id: "orientation",
    label: "Orientation",
    items: [
      { id: "overview", label: "Overview", note: "What this category is and why it matters." },
      { id: "roadmap", label: "Roadmap", note: "A guided path from zero to expert." },
      { id: "prerequisites", label: "Prerequisites", note: "What you should know first." },
    ],
  },
  {
    id: "learning-path",
    label: "Learning Path",
    items: [
      { id: "fundamentals", label: "Fundamentals", note: "Core beginner concepts." },
      { id: "intermediate", label: "Intermediate", note: "Practical engineering concepts." },
      { id: "advanced", label: "Advanced", note: "Production-level engineering." },
      { id: "expert", label: "Expert", note: "Implementation-level mastery." },
      { id: "advanced-concepts", label: "Advanced Concepts", note: "Internal algorithms, trade-offs, research." },
    ],
  },
  {
    id: "under-the-hood",
    label: "Under the Hood",
    items: [
      { id: "internal-working", label: "Internal Working", note: "How it actually works inside." },
      { id: "architecture", label: "Architecture", note: "Structural and design view." },
      { id: "production-concepts", label: "Production Concepts", note: "Running it for real." },
    ],
  },
  {
    id: "engineering-quality",
    label: "Engineering Quality",
    items: [
      { id: "best-practices", label: "Best Practices", note: "How experts do it." },
      { id: "common-mistakes", label: "Common Mistakes", note: "Pitfalls and anti-patterns." },
      { id: "optimization", label: "Optimization", note: "Doing more with less." },
      { id: "performance", label: "Performance", note: "Latency, throughput, resource use." },
      { id: "debugging", label: "Debugging", note: "Diagnosing and fixing issues." },
      { id: "security", label: "Security Considerations", note: "Where applicable." },
    ],
  },
  {
    id: "applied",
    label: "Applied Knowledge",
    items: [
      { id: "real-world-examples", label: "Real-world Examples", note: "How it shows up in industry." },
      { id: "case-studies", label: "Case Studies", note: "Deep dives into real systems." },
      { id: "comparison-tables", label: "Comparison Tables", note: "Side-by-side trade-offs." },
      { id: "faqs", label: "FAQs", note: "Frequently asked questions." },
    ],
  },
  {
    id: "interview",
    label: "Interview Preparation",
    items: [
      { id: "interview-questions", label: "Interview Questions", note: "Commonly asked questions." },
      { id: "interview-answers", label: "Interview Answers", note: "Model answers with reasoning." },
      { id: "follow-up-questions", label: "Follow-up Questions", note: "How interviewers dig deeper." },
      { id: "mcqs", label: "MCQs", note: "Self-test multiple choice questions." },
    ],
  },
  {
    id: "revision",
    label: "Revision & Reference",
    items: [
      { id: "revision-notes", label: "Revision Notes", note: "Condensed for the day before." },
      { id: "cheat-sheet", label: "Cheat Sheet", note: "The one-pager." },
      { id: "glossary", label: "Glossary", note: "Key terms defined." },
    ],
  },
  {
    id: "resources",
    label: "Resources & Beyond",
    items: [
      { id: "resources", label: "Resources", note: "Curated learning material." },
      { id: "books", label: "Books", note: "The definitive texts." },
      { id: "research-papers", label: "Research Papers", note: "Primary sources." },
      { id: "official-docs", label: "Official Documentation", note: "Authoritative references." },
      { id: "related-topics", label: "Related Topics", note: "Where to branch next." },
      { id: "future-learning", label: "Future Learning", note: "What comes after mastery." },
    ],
  },
];
