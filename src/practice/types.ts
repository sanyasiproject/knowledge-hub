/**
 * Practice-question model for the Algorithm Practice section.
 *
 * The Practice section mirrors the Algorithms taxonomy (same topic slugs) but
 * holds NO theory — only problems. Each topic file exports one
 * `TopicPractice` with every well-known variation of that pattern, each as a
 * self-contained question: statement, C++ solution, explanation, and a link
 * to the original problem where one exists.
 */

export type PracticeDifficulty = "Easy" | "Medium" | "Hard";

export interface PracticeQuestion {
  /** Problem name, e.g. "Linked List Cycle II". */
  name: string;
  difficulty: PracticeDifficulty;
  /** Which variation of the pattern this exercises, e.g. "Cycle entry point". */
  variation?: string;
  /** Full problem statement — paragraphs, examples, constraints. */
  question: string[];
  /** C++ solution source. */
  code: string;
  /** Why the solution works — approach, invariants, complexity. */
  explanation: string[];
  /** Link to the original problem (LeetCode / GfG / CSES / Codeforces). */
  link?: string;
}

export interface TopicPractice {
  questions: PracticeQuestion[];
}

export type PracticeMap = Record<string, TopicPractice>;
