import { Link, useParams } from "react-router-dom";
import { getLearningPath } from "../data/learningPaths";
import { findTopicBySlug, topicPath } from "../data/taxonomy";
import { useProgress } from "../hooks/useProgress";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge } from "../components/ui/primitives";
import { NotFound } from "./NotFound";

export function LearningPathDetail() {
  const { pathSlug = "" } = useParams();
  const path = getLearningPath(pathSlug);
  const { isRead } = useProgress();

  if (!path) return <NotFound />;

  const resolvedTopics = path.topics
    .map((slug) => ({ slug, loc: findTopicBySlug(slug) }))
    .filter((t) => t.loc != null) as { slug: string; loc: NonNullable<ReturnType<typeof findTopicBySlug>> }[];

  const readCount = resolvedTopics.filter((t) => isRead(t.slug)).length;
  const nextUnread = resolvedTopics.find((t) => !isRead(t.slug));
  const pct = resolvedTopics.length > 0 ? Math.round((readCount / resolvedTopics.length) * 100) : 0;

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

        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums text-slate-500">
            {readCount}/{resolvedTopics.length} completed
          </span>
        </div>

        {nextUnread && (
          <Link
            to={topicPath(nextUnread.loc)}
            className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
          >
            Continue: {nextUnread.loc.topic.title} →
          </Link>
        )}
        {!nextUnread && resolvedTopics.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <svg className="h-4 w-4" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
            Path completed!
          </div>
        )}
      </header>

      {/* Topic list */}
      <ol className="space-y-2">
        {resolvedTopics.map((t, i) => {
          const read = isRead(t.slug);
          return (
            <li key={t.slug}>
              <Link to={topicPath(t.loc)}>
                <Card hover>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        read
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {read ? (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
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
