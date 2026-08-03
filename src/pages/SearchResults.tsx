import { Link, useSearchParams } from "react-router-dom";
import { searchTopics, topicPath } from "../data/taxonomy";
import { getContent } from "../content";
import { Card, LevelBadge } from "../components/ui/primitives";
import { ContentCompletenessBadge } from "../components/ui/ProgressBadge";

const CONTENT_KEYS = [
  "quickSummary", "detailed", "deepDive", "code", "diagrams", "animations",
  "comparison", "interviewQA", "followUps", "mcqs", "exercises", "flashcards",
  "revisionNotes", "cheatSheet", "resources", "glossary",
] as const;
const TOTAL_SECTIONS = CONTENT_KEYS.length;

function countAuthored(topicSlug: string): number {
  const c = getContent(topicSlug);
  if (!c) return 0;
  return CONTENT_KEYS.filter((k) => {
    const v = c[k];
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
  }).length;
}

export function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const hits = searchTopics(q);

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
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-300">
                    {hit.domain.title} &middot; {hit.category.title}
                  </p>
                  <ContentCompletenessBadge authored={countAuthored(hit.topic.slug)} total={TOTAL_SECTIONS} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
