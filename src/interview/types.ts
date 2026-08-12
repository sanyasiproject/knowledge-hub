/**
 * The Interview Prep model.
 *
 * This is deliberately a SEPARATE content set from `src/content` (the topic
 * pages). Topic content teaches a subject properly, from first principles, over
 * hours. This content is built for the opposite situation: the interview is in
 * 4 hours, or tomorrow, and you need the highest-value material per minute read.
 *
 * The shapes below encode what actually gets asked, rather than what is true:
 *
 * - `QA.why`    — what the interviewer is really testing. Knowing this lets you
 *                 answer the question behind the question.
 * - `QA.trap`   — the confident-sounding wrong answer most candidates give.
 * - `Decision`  — "X vs Y, and why you'd pick each". The single highest-yield
 *                 question shape in senior software and AI interviews.
 * - `Sheet`     — one-line facts for the final skim, not prose.
 *
 * An `Area` is a body of knowledge (React, RAG, Databases). A `Track` is a
 * time budget (4 hours / 1 day / 2 days) that selects across areas.
 */

/** How deep the question goes. Tracks use this to fit a time budget. */
export type Depth = "Core" | "Intermediate" | "Advanced";

/** Which broad interview stream an area belongs to. */
export type Stream =
  | "Language & Runtime"
  | "CS Core"
  | "Backend & Data"
  | "System Design"
  | "AI Engineering"
  | "Platform & Delivery"
  | "Behavioral";

/** A single interview question with a model answer. */
export interface QA {
  /** Stable id, unique within its area. Used for progress + deep links. */
  id: string;
  q: string;
  /** The model answer — written to be spoken in 60–120 seconds. */
  a: string;
  /** What the interviewer is actually probing for. */
  why?: string;
  /** The common wrong answer, and why it's wrong. */
  trap?: string;
  /** Where the interviewer goes next if you answer well. */
  followUps?: string[];
  depth: Depth;
  tags?: string[];
  /** Slug of a hub topic that covers this properly, for post-interview depth. */
  topic?: string;
}

/**
 * A "why choose X over Y" comparison — the highest-yield interview shape.
 * Rendered as a decision table, and printed on the one-pager.
 */
export interface Decision {
  /** e.g. "SQL vs NoSQL" */
  title: string;
  /** The two (or more) options being weighed. */
  options: {
    name: string;
    /** When this is the right call. */
    pick: string[];
    /** What it costs you. */
    cost: string[];
  }[];
  /** The one-sentence answer to give if you only have 15 seconds. */
  verdict: string;
  topic?: string;
}

/** A block of one-line facts for the final skim. */
export interface Sheet {
  title: string;
  /** Terse, single-line, scannable. Not prose. */
  points: string[];
}

/** A number worth having memorized (latency, limits, orders of magnitude). */
export interface NumberFact {
  label: string;
  value: string;
  note?: string;
}

/** A body of knowledge with everything needed to revise it cold. */
export interface Area {
  slug: string;
  title: string;
  icon: string;
  stream: Stream;
  /** One line: what this area covers and who gets asked it. */
  blurb: string;
  /**
   * The irreducible minimum. If you read nothing else in this area, read this.
   * Tracks with the tightest budgets pull only these.
   */
  mustKnow: string[];
  sheets: Sheet[];
  decisions: Decision[];
  qa: QA[];
  /** Mistakes that lose offers — stated as "don't say X, say Y". */
  pitfalls?: string[];
  numbers?: NumberFact[];
  /** Hub topic slugs that go deeper, for after the interview. */
  relatedTopics?: string[];
}

/** One study block inside a time-budgeted track. */
export interface TrackBlock {
  areaSlug: string;
  minutes: number;
  /** Which slice of the area to read in this block. */
  scope: "must-know" | "sheets" | "decisions" | "core-qa" | "all-qa" | "pitfalls";
  /** Why this block earns its slot in a tight budget. */
  rationale?: string;
}

/** A revision plan sized to the time you actually have. */
export interface Track {
  slug: string;
  title: string;
  icon: string;
  /** Total budget in minutes — must equal the sum of its blocks. */
  minutes: number;
  blurb: string;
  /** Who this track is for. */
  audience: string;
  blocks: TrackBlock[];
}

export type AreaMap = Record<string, Area>;
