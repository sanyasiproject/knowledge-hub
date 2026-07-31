/**
 * Authored-content model for topic pages.
 *
 * The taxonomy defines WHICH topics exist and WHICH sections they intend to
 * fill (`Topic.contentReady`). This module holds the actual authored content,
 * keyed by topic slug. Any section without authored content renders as a clean,
 * consistent placeholder — so the platform can ship the full structure now and
 * fill content incrementally over years without any layout changes.
 */

export interface QAItem {
  q: string;
  a: string;
  followUps?: string[];
}

export interface MCQItem {
  q: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface ComparisonTable {
  columns: string[];
  rows: string[][];
}

export interface ResourceLink {
  label: string;
  kind: "docs" | "book" | "paper" | "article" | "video" | "repo";
  note?: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface DiagramSpec {
  title: string;
  kind: "architecture" | "flow" | "sequence" | "state" | "mindmap" | "network";
  caption?: string;
  mermaid?: string;
}

export interface AnimationSpec {
  title: string;
  /** Steps rendered by the interactive step-through animation component. */
  steps: { label: string; detail: string }[];
}

export interface TopicContent {
  quickSummary?: string[];
  detailed?: string[];
  deepDive?: string[];
  code?: { language: string; caption?: string; source: string }[];
  diagrams?: DiagramSpec[];
  animations?: AnimationSpec[];
  comparison?: ComparisonTable;
  interviewQA?: QAItem[];
  followUps?: string[];
  mcqs?: MCQItem[];
  exercises?: string[];
  flashcards?: Flashcard[];
  revisionNotes?: string[];
  cheatSheet?: string[];
  resources?: ResourceLink[];
  glossary?: GlossaryEntry[];
}

export type ContentMap = Record<string, TopicContent>;
