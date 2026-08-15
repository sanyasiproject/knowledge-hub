/**
 * Core knowledge model for the Software Engineering Knowledge Hub.
 *
 * The entire platform is data-driven. Adding a new domain, category, or topic
 * never requires touching a page component — you add an entry to `taxonomy.ts`
 * and the navigation, routing, overview pages, and topic template all update.
 *
 * Hierarchy:   Domain  ->  Category  ->  Topic
 * Every Topic renders through ONE reusable template (TopicPage) using the
 * standard section schema defined in `topicSections.ts`.
 */

/** A learning-depth band. Every topic belongs to exactly one. */
export type Level =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Advanced Concepts";

/** Status lets us ship the IA before all content exists. */
export type Status = "available" | "in-progress" | "coming-soon";

/** How likely this topic is to show up in an interview or contest round. */
export type Frequency = "Very High" | "High" | "Medium" | "Low";

/** A single topic — the leaf of the hierarchy and the unit that gets a page. */
export interface Topic {
  slug: string;
  title: string;
  /** One-line hook shown in cards and search results. */
  summary: string;
  level: Level;
  status?: Status;
  /**
   * "Reach for this when…" — the concrete problems this topic solves. Shown on
   * category listings so a reader can pick the right tool without opening
   * every page.
   */
  useCase?: string;
  /**
   * How often this comes up in interviews and contests — a prioritisation
   * signal when revision time is short, not a measure of importance.
   */
  frequency?: Frequency;
  /** Slugs of related topics (cross-links). "topicSlug" resolved globally. */
  related?: string[];
  /** Free-form tags to power search + filtering. */
  tags?: string[];
  /**
   * Which standard topic sections carry authored content for this topic.
   * Absent sections still render as clearly-labelled placeholders so the
   * structure is visible and consistent everywhere.
   */
  contentReady?: string[];
}

/** A category groups topics and always follows the standard category structure. */
export interface Category {
  slug: string;
  title: string;
  summary: string;
  icon?: string;
  status?: Status;
  topics: Topic[];
}

/** A top-level domain — the entries in the primary navigation. */
export interface Domain {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  /** Broad grouping used to cluster domains in the mega-nav / home page. */
  group: DomainGroup;
  status?: Status;
  categories: Category[];
}

export type DomainGroup =
  | "Foundations"
  | "Languages & Paradigms"
  | "Craftsmanship"
  | "Data & Storage"
  | "Backend & Distributed"
  | "Cloud & Infrastructure"
  | "Operations & Reliability"
  | "Architecture & Design"
  | "AI Engineering"
  | "Career";

export const DOMAIN_GROUP_ORDER: DomainGroup[] = [
  "Foundations",
  "Languages & Paradigms",
  "Craftsmanship",
  "Data & Storage",
  "Backend & Distributed",
  "Cloud & Infrastructure",
  "Operations & Reliability",
  "Architecture & Design",
  "AI Engineering",
  "Career",
];
