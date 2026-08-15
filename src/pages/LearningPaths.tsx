import { Link } from "react-router-dom";
import { LEARNING_PATHS } from "../data/learningPaths";
import { Card } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";

export function LearningPaths() {
  usePageTitle("Learning Paths");
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
          return (
            <Link key={path.slug} to={`/paths/${path.slug}`}>
              <Card hover className="h-full">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{path.icon}</span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{path.title}</h2>
                </div>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{path.description}</p>
                <span className="text-xs font-medium tabular-nums text-slate-500">
                  {path.topics.length} topics
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
