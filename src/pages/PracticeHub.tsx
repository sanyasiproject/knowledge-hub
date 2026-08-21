import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getDomain } from "../data/taxonomy";
import { hasPractice } from "../practice";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, FrequencyBadge, Pill } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";

/**
 * Algorithm Practice hub — the Algorithms taxonomy re-rendered as a pure
 * problem-solving surface. No theory here: every topic links to a bank of
 * questions (statement → C++ solution → explanation → original link).
 */
export function PracticeHub() {
  usePageTitle("Algorithm Practice");
  const domain = useMemo(() => getDomain("algorithms"), []);

  const stats = useMemo(() => {
    if (!domain) return { topics: 0, ready: 0 };
    const all = domain.categories.flatMap((c) => c.topics);
    return { topics: all.length, ready: all.filter((t) => hasPractice(t.slug)).length };
  }, [domain]);

  if (!domain) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs items={[{ label: "Algorithm Practice" }]} />

      <header className="mb-8">
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

      <div className="space-y-10">
        {domain.categories.map((cat) => {
          const ready = cat.topics.filter((t) => hasPractice(t.slug)).length;
          return (
            <section key={cat.slug}>
              <div className="mb-1 flex items-baseline gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{cat.title}</h2>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {ready}/{cat.topics.length} banks ready
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{cat.summary}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {cat.topics.map((topic) => {
                  const ready = hasPractice(topic.slug);
                  const card = (
                    <Card hover={ready} className={`h-full ${ready ? "" : "opacity-60"}`}>
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
                            {!ready && (
                              <span className="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                Questions coming soon
                              </span>
                            )}
                          </div>
                        </div>
                        {ready && (
                          <span aria-hidden className="text-slate-300 dark:text-slate-600">
                            →
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                  return ready ? (
                    <Link key={topic.slug} to={`/practice/${topic.slug}`} className="block">
                      {card}
                    </Link>
                  ) : (
                    <div key={topic.slug}>{card}</div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
