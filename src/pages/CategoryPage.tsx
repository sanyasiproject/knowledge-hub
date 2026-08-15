import { Link, useParams } from "react-router-dom";
import { getCategory, getDomain } from "../data/taxonomy";
import { CATEGORY_STRUCTURE } from "../data/categoryStructure";
import type { Level, Topic } from "../data/schema";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, FrequencyBadge, LevelBadge } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";
import { NotFound } from "./NotFound";

const LEVEL_ORDER: Level[] = ["Beginner", "Intermediate", "Advanced", "Advanced Concepts", "Expert"];

/**
 * Groups a category's topics by level, preserving the authored order within
 * each tier. A category that spans core → advanced then reads as one list with
 * the ladder visible, rather than being split across separate categories.
 */
function levelGroups(topics: Topic[]): [Level, Topic[]][] {
  const byLevel = new Map<Level, Topic[]>();
  for (const t of topics) {
    if (!byLevel.has(t.level)) byLevel.set(t.level, []);
    byLevel.get(t.level)!.push(t);
  }
  return LEVEL_ORDER.filter((l) => byLevel.has(l)).map((l) => [l, byLevel.get(l)!]);
}

/**
 * The category overview. Renders the STANDARD CATEGORY STRUCTURE identically
 * for every category (from data/categoryStructure.ts), then lists the topics.
 * Topics are the entry points that carry the full learning template.
 */
export function CategoryPage() {
  const { domainSlug = "", categorySlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  const category = getCategory(domainSlug, categorySlug);
  usePageTitle(category?.title, category?.summary);
  if (!domain || !category) return <NotFound />;

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs
        items={[{ label: domain.title, to: `/domain/${domain.slug}` }, { label: category.title }]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{category.title}</h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">{category.summary}</p>
      </header>

      {/* Topics, grouped by level so the progression is visible in place */}
      <section className="mb-10">
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Topics in this category
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {category.topics.length} topics, ordered so each builds on the one before. Every entry says
          what it is for, so you can pick the right tool without opening them all.
          {category.topics.some((t) => t.frequency) && (
            <> The frequency badge shows how often it comes up in interviews — start with the busiest.</>
          )}
        </p>

        {levelGroups(category.topics).map(([level, topics]) => (
          <div key={level} className="mb-6">
            {/* Only label the tier when a category actually spans more than one */}
            {levelGroups(category.topics).length > 1 && (
              <div className="mb-3 flex items-center gap-3">
                <LevelBadge level={level} />
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((t) => (
                <Link key={t.slug} to={`/topic/${domain.slug}/${category.slug}/${t.slug}`}>
                  <Card hover className="flex h-full flex-col">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{t.title}</h3>
                      <div className="ml-auto flex items-center gap-1.5">
                        <FrequencyBadge frequency={t.frequency} />
                        <LevelBadge level={t.level} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.summary}</p>
                    {t.useCase && (
                      <p className="mt-2 border-l-2 border-brand-300 pl-2 text-xs leading-relaxed text-slate-500 dark:border-brand-700 dark:text-slate-400">
                        <span className="font-semibold text-brand-600 dark:text-brand-300">Use it for: </span>
                        {t.useCase}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Standard category structure */}
      <section>
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Category structure</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Every category in the hub follows this same structure — so once you know one, you know them all.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORY_STRUCTURE.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.label}</span>
                      <span className="text-slate-500 dark:text-slate-400"> — {item.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
