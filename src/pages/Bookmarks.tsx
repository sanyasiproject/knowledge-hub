import { Link } from "react-router-dom";
import { useBookmarks } from "../hooks/useBookmarks";
import { findTopicBySlug, topicPath } from "../data/taxonomy";
import { Card, LevelBadge } from "../components/ui/primitives";
import { ProgressBadge } from "../components/ui/ProgressBadge";

export function Bookmarks() {
  const { bookmarks, toggleBookmark } = useBookmarks();

  const resolved = bookmarks
    .map((slug) => ({ slug, loc: findTopicBySlug(slug) }))
    .filter((b) => b.loc != null) as { slug: string; loc: NonNullable<ReturnType<typeof findTopicBySlug>> }[];

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bookmarks</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {resolved.length === 0
            ? "You haven't bookmarked any topics yet. Tap the star icon on any topic page to save it here."
            : `${resolved.length} bookmarked ${resolved.length === 1 ? "topic" : "topics"}`}
        </p>
      </header>

      {resolved.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <div className="mb-2 text-3xl">&#9734;</div>
          <p>Your bookmarked topics will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resolved.map((b) => (
            <div key={b.slug} className="flex items-start gap-2">
              <Link to={topicPath(b.loc)} className="min-w-0 flex-1">
                <Card hover>
                  <div className="flex items-center gap-2">
                    <ProgressBadge topicSlug={b.slug} />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{b.loc.topic.title}</h3>
                    <div className="ml-auto">
                      <LevelBadge level={b.loc.topic.level} />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{b.loc.topic.summary}</p>
                  <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-300">
                    {b.loc.domain.title} &middot; {b.loc.category.title}
                  </p>
                </Card>
              </Link>
              <button
                onClick={() => toggleBookmark(b.slug)}
                className="mt-2 rounded-lg p-2 text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Remove bookmark"
              >
                &#9733;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
