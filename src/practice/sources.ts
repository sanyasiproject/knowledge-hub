/**
 * Where a practice problem lives.
 *
 * Every `PracticeQuestion.link` points at an external judge or article, and the
 * URL alone does not say which one at a glance. This maps a link to a readable
 * source name so the UI can label it and explain on hover exactly where the
 * click goes.
 */

export interface ProblemSource {
  /** Display name, e.g. "LeetCode". */
  label: string;
  /** Bare hostname, shown in the hover title so the destination is explicit. */
  host: string;
  /** Tailwind classes for the badge. */
  cls: string;
}

const NEUTRAL = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

/** Longest-suffix match on the hostname, so subdomains resolve correctly. */
const KNOWN: { suffix: string; label: string; cls: string }[] = [
  {
    suffix: "leetcode.com",
    label: "LeetCode",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    suffix: "cses.fi",
    label: "CSES",
    cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  {
    suffix: "codeforces.com",
    label: "Codeforces",
    cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  {
    suffix: "geeksforgeeks.org",
    label: "GeeksforGeeks",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    suffix: "spoj.com",
    label: "SPOJ",
    cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  {
    suffix: "atcoder.jp",
    label: "AtCoder",
    cls: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    suffix: "poj.org",
    label: "POJ",
    cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    suffix: "judge.yosupo.jp",
    label: "Library Checker",
    cls: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  {
    suffix: "cp-algorithms.com",
    label: "CP-Algorithms",
    cls: NEUTRAL,
  },
  {
    suffix: "onlinejudge.org",
    label: "UVa",
    cls: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  },
  {
    suffix: "codechef.com",
    label: "CodeChef",
    cls: NEUTRAL,
  },
  {
    suffix: "hackerrank.com",
    label: "HackerRank",
    cls: NEUTRAL,
  },
  {
    suffix: "hackerearth.com",
    label: "HackerEarth",
    cls: NEUTRAL,
  },
  {
    suffix: "interviewbit.com",
    label: "InterviewBit",
    cls: NEUTRAL,
  },
];

/** Strip the scheme and any leading "www." to get a bare hostname. */
function hostOf(link: string): string {
  const withoutScheme = link.replace(/^[a-z]+:\/\//i, "");
  const host = withoutScheme.split(/[/?#]/)[0] ?? "";
  return host.replace(/^www\./i, "").toLowerCase();
}

/**
 * Resolve a problem link to its source. Unknown hosts fall back to the bare
 * hostname, so a new judge shows up sensibly instead of disappearing.
 */
export function problemSource(link: string): ProblemSource {
  const host = hostOf(link);
  const hit = KNOWN.find((k) => host === k.suffix || host.endsWith("." + k.suffix));
  return hit
    ? { label: hit.label, host, cls: hit.cls }
    : { label: host || "External", host, cls: NEUTRAL };
}

/** Every source present in a set of links, ordered by problem count. */
export function sourceLabels(links: (string | undefined)[]): string[] {
  const counts = new Map<string, number>();
  for (const l of links) {
    if (!l) continue;
    const { label } = problemSource(l);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label]) => label);
}
