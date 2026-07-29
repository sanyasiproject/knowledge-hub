import { Link, useParams } from "react-router-dom";
import { getCategory, getDomain } from "../data/taxonomy";
import { CATEGORY_STRUCTURE } from "../data/categoryStructure";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge } from "../components/ui/primitives";
import { NotFound } from "./NotFound";

/**
 * The category overview. Renders the STANDARD CATEGORY STRUCTURE identically
 * for every category (from data/categoryStructure.ts), then lists the topics.
 * Topics are the entry points that carry the full learning template.
 */
export function CategoryPage() {
  const { domainSlug = "", categorySlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  const category = getCategory(domainSlug, categorySlug);
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

      {/* Topics */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Topics in this category</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {category.topics.map((t) => (
            <Link key={t.slug} to={`/topic/${domain.slug}/${category.slug}/${t.slug}`}>
              <Card hover className="h-full">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t.title}</h3>
                  <div className="ml-auto">
                    <LevelBadge level={t.level} />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
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
