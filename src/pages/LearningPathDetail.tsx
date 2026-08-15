import { Link, useParams } from "react-router-dom";
import { getLearningPath } from "../data/learningPaths";
import { findTopicBySlug, topicPath } from "../data/taxonomy";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge } from "../components/ui/primitives";
import { NotFound } from "./NotFound";
import { usePageTitle } from "../hooks/usePageTitle";

export function LearningPathDetail() {
  const { pathSlug = "" } = useParams();
  const path = getLearningPath(pathSlug);
  usePageTitle(path?.title);

  if (!path) return <NotFound />;

  const resolvedTopics = path.topics
    .map((slug) => ({ slug, loc: findTopicBySlug(slug) }))
    .filter((t) => t.loc != null) as { slug: string; loc: NonNullable<ReturnType<typeof findTopicBySlug>> }[];

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Learning Paths", to: "/paths" },
          { label: path.title },
        ]}
      />

      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-3xl" aria-hidden>{path.icon}</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{path.title}</h1>
        </div>
        <p className="mb-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">{path.description}</p>

        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {resolvedTopics.length} topics, in order.
        </div>

        {resolvedTopics.length > 0 && (
          <Link
            to={topicPath(resolvedTopics[0].loc)}
            className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
          >
            Start: {resolvedTopics[0].loc.topic.title} →
          </Link>
        )}
      </header>

      {/* Topic list */}
      <ol className="space-y-2">
        {resolvedTopics.map((t, i) => {
          return (
            <li key={t.slug}>
              <Link to={topicPath(t.loc)}>
                <Card hover>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{t.loc.topic.title}</h3>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{t.loc.topic.summary}</p>
                    </div>
                    <LevelBadge level={t.loc.topic.level} />
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
