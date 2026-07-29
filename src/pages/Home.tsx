import { Link } from "react-router-dom";
import { domainsByGroup, hubStats } from "../data/taxonomy";
import { Card, StatusBadge } from "../components/ui/primitives";

export function Home() {
  const groups = domainsByGroup();
  const stats = hubStats();

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-8 text-white sm:p-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-200">
          The Software Engineering Knowledge Hub
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Learn, visualize, revise, and prepare — every SE topic, one structured place.
        </h1>
        <p className="mt-4 max-w-2xl text-brand-100">
          A single destination organized as a deep hierarchy: {stats.domains} domains, {stats.categories} categories,
          and {stats.topics}+ topics — each with explanations, diagrams, animations, interview prep, and revision aids.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/domain/computer-science-fundamentals"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Start with Fundamentals →
          </Link>
          <Link
            to="/topic/computer-science-fundamentals/computation-and-complexity/big-o-notation"
            className="rounded-lg border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            See a sample topic
          </Link>
        </div>
      </section>

      {/* Stat strip */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        {[
          { k: "Domains", v: stats.domains },
          { k: "Categories", v: stats.categories },
          { k: "Topics", v: `${stats.topics}+` },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">{s.v}</div>
            <div className="text-sm text-slate-500">{s.k}</div>
          </div>
        ))}
      </section>

      {/* Domains by group */}
      {groups.map((g) => (
        <section key={g.group} className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{g.group}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.domains.map((d) => (
              <Link key={d.slug} to={`/domain/${d.slug}`}>
                <Card hover className="h-full">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl" aria-hidden>{d.icon}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white">{d.title}</h3>
                    <div className="ml-auto">
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{d.summary}</p>
                  {d.categories.length > 0 && (
                    <p className="mt-3 text-xs font-medium text-brand-600 dark:text-brand-300">
                      {d.categories.length} categories ·{" "}
                      {d.categories.reduce((n, c) => n + c.topics.length, 0)} topics
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
