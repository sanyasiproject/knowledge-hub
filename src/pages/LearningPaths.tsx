import { Link } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { useProgress } from "../hooks/useProgress";
import { Card } from "../components/ui/primitives";

export function LearningPaths() {
  const { isRead } = useProgress();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Learning Paths</h1>
        <p className="mt-2 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
          Curated sequences of topics designed to take you from basics to mastery in a specific area.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {LEARNING_PATHS.map((path) => {
          const readCount = path.topics.filter((slug) => isRead(slug)).length;
          const pct = Math.round((readCount / path.topics.length) * 100);
          return (
            <Link key={path.slug} to={`/paths/${path.slug}`}>
              <Card hover className="h-full">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{path.icon}</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{path.title}</h2>
                </div>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{path.description}</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums text-slate-500">
                    {readCount}/{path.topics.length} topics
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
