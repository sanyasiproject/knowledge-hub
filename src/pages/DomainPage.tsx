import { Link, useParams } from "react-router-dom";
import { getDomain } from "../data/taxonomy";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge, StatusBadge } from "../components/ui/primitives";
import { NotFound } from "./NotFound";
import { ComingSoon } from "./ComingSoon";

export function DomainPage() {
  const { domainSlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  if (!domain) return <NotFound />;

  if (domain.status === "coming-soon" || domain.categories.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={[{ label: domain.title }]} />
        <ComingSoon title={domain.title} summary={domain.summary} icon={domain.icon} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs items={[{ label: domain.title }]} />

      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{domain.icon}</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{domain.title}</h1>
          <StatusBadge status={domain.status} />
        </div>
        <p className="max-w-3xl text-slate-600 dark:text-slate-300">{domain.summary}</p>
      </header>

      <div className="space-y-8">
        {domain.categories.map((c) => (
          <section key={c.slug}>
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{c.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{c.summary}</p>
              </div>
              <Link
                to={`/domain/${domain.slug}/${c.slug}`}
                className="shrink-0 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                Category overview →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.topics.map((t) => (
                <Link key={t.slug} to={`/topic/${domain.slug}/${c.slug}/${t.slug}`}>
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
        ))}
      </div>
    </div>
  );
}
