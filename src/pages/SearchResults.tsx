import { Link, useSearchParams } from "react-router-dom";
import { searchTopics, topicPath } from "../data/taxonomy";
import { Card, LevelBadge } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";

export function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const hits = searchTopics(q);
  usePageTitle(q ? `Search: ${q}` : "Search");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        Search results for “{q}”
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {hits.length} {hits.length === 1 ? "topic" : "topics"} found
      </p>

      {hits.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
          No topics matched. Try a broader term like “cache”, “tcp”, or “design pattern”.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {hits.map((hit) => (
            <Link key={topicPath(hit)} to={topicPath(hit)}>
              <Card hover>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{hit.topic.title}</h3>
                  <div className="ml-auto">
                    <LevelBadge level={hit.topic.level} />
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hit.topic.summary}</p>
                <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-300">
                  {hit.domain.title} &middot; {hit.category.title}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
