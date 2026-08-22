import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDomain } from "../data/taxonomy";
import type { Frequency } from "../data/schema";
import { hasPractice } from "../practice";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, FrequencyBadge, Pill, cx } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";

/** Most-asked first, which is also the order the filter pills appear in. */
const FREQUENCIES: Frequency[] = ["Very High", "High", "Medium", "Low"];

/**
 * Algorithm Practice hub — the Algorithms taxonomy re-rendered as a pure
 * problem-solving surface. No theory here: every topic links to a bank of
 * questions (statement → C++ solution → explanation → original link).
 *
 * Two controls sit on top of it: an interview-frequency filter, because with
 * 147 topics the "what do I study first" question matters more than browsing,
 * and per-category collapsing so a filtered view stays scannable.
 */
export function PracticeHub() {
  usePageTitle("Algorithm Practice");
  const domain = useMemo(() => getDomain("algorithms"), []);

  /** Selected frequencies. Empty means "no filter", which shows everything. */
  const [freqs, setFreqs] = useState<ReadonlySet<Frequency>>(new Set());
  /** Categories explicitly collapsed by the reader; everything else is open. */
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const stats = useMemo(() => {
    if (!domain) return { topics: 0, ready: 0, freqCounts: {} as Record<Frequency, number> };
    const all = domain.categories.flatMap((c) => c.topics);
    const freqCounts = { "Very High": 0, High: 0, Medium: 0, Low: 0 } as Record<Frequency, number>;
    for (const t of all) if (t.frequency) freqCounts[t.frequency]++;
    return { topics: all.length, ready: all.filter((t) => hasPractice(t.slug)).length, freqCounts };
  }, [domain]);

  /** Categories paired with the topics surviving the frequency filter. */
  const sections = useMemo(() => {
    if (!domain) return [];
    return domain.categories
      .map((cat) => ({
        cat,
        topics:
          freqs.size === 0
            ? cat.topics
            : cat.topics.filter((t) => t.frequency && freqs.has(t.frequency)),
      }))
      .filter((s) => s.topics.length > 0);
  }, [domain, freqs]);

  if (!domain) return null;

  const allCollapsed = sections.length > 0 && sections.every((s) => collapsed.has(s.cat.slug));
  const shownTopics = sections.reduce((n, s) => n + s.topics.length, 0);

  function toggleFrequency(f: Frequency) {
    setFreqs((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  function toggleCategory(slug: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs items={[{ label: "Algorithm Practice" }]} />

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          💪 Algorithm Practice
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
          Every algorithm topic as a question bank — no theory, just problems. Each question gives
          the full statement, a C++ solution, an explanation of why it works, and a link to the
          original problem so you can submit your own attempt first.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{stats.topics} topics</Pill>
          <Pill>{stats.ready} banks ready</Pill>
          <Pill>C++ solutions</Pill>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-y border-slate-200 py-3 dark:border-slate-800">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Interview frequency
        </span>
        <button
          onClick={() => setFreqs(new Set())}
          aria-pressed={freqs.size === 0}
          title="Clear the filter and show every topic"
          className={cx(
            "rounded-full px-3 py-1 text-xs font-semibold transition",
            freqs.size === 0
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          )}
        >
          All
        </button>
        {FREQUENCIES.map((f) => {
          const on = freqs.has(f);
          return (
            <button
              key={f}
              onClick={() => toggleFrequency(f)}
              aria-pressed={on}
              title={
                on
                  ? `Remove ${f.toLowerCase()}-frequency topics from the filter`
                  : `Add ${f.toLowerCase()}-frequency topics to the filter`
              }
              className={cx(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                on
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              <span aria-hidden className="mr-1 font-bold">
                {on ? "\u2713" : "+"}
              </span>
              {f} ({stats.freqCounts[f]})
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {shownTopics} shown
          </span>
          <button
            onClick={() =>
              setCollapsed(allCollapsed ? new Set() : new Set(sections.map((s) => s.cat.slug)))
            }
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No topics match {[...freqs].join(" or ").toLowerCase()} frequency.
        </div>
      )}

      <div className="space-y-8">
        {sections.map(({ cat, topics }) => {
          const isCollapsed = collapsed.has(cat.slug);
          const ready = topics.filter((t) => hasPractice(t.slug)).length;
          return (
            <section key={cat.slug}>
              <button
                onClick={() => toggleCategory(cat.slug)}
                aria-expanded={!isCollapsed}
                className="group flex w-full items-baseline gap-2 text-left"
              >
                <span
                  aria-hidden
                  className={cx(
                    "text-slate-400 transition-transform dark:text-slate-500",
                    isCollapsed ? "" : "rotate-90"
                  )}
                >
                  ▶
                </span>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                  {cat.title}
                </h2>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {ready}/{topics.length} banks ready
                </span>
              </button>

              {!isCollapsed && (
                <>
                  <p className="mb-4 ml-6 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {cat.summary}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {topics.map((topic) => {
                      const hasBank = hasPractice(topic.slug);
                      const card = (
                        <Card hover={hasBank} className={`h-full ${hasBank ? "" : "opacity-60"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {topic.title}
                              </h3>
                              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                                {topic.useCase ?? topic.summary}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <FrequencyBadge frequency={topic.frequency} />
                                {!hasBank && (
                                  <span className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    Questions coming soon
                                  </span>
                                )}
                              </div>
                            </div>
                            {hasBank && (
                              <span aria-hidden className="text-slate-300 dark:text-slate-600">
                                →
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                      return hasBank ? (
                        <Link key={topic.slug} to={`/practice/${topic.slug}`} className="block">
                          {card}
                        </Link>
                      ) : (
                        <div key={topic.slug}>{card}</div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
