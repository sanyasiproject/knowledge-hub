import { Link } from "react-router-dom";
import { domainsByGroup, hubStats } from "../data/taxonomy";
import { StatusBadge } from "../components/ui/primitives";
import { interviewStats } from "../interview";
import { TRACKS } from "../interview/tracks";

/* ---- Group accent colours -------------------------------------------------------- */
const GROUP_ACCENT: Record<string, { border: string; bg: string; icon: string }> = {
  "Foundations":               { border: "#6366f1", bg: "rgba(99,102,241,0.08)",  icon: "🧱" },
  "Languages & Paradigms":     { border: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  icon: "⚙️" },
  "Craftsmanship":             { border: "#10b981", bg: "rgba(16,185,129,0.08)",  icon: "✦"  },
  "Data & Storage":            { border: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: "🗄️" },
  "Backend & Distributed":     { border: "#ef4444", bg: "rgba(239,68,68,0.08)",  icon: "🔗" },
  "Cloud & Infrastructure":    { border: "#3b82f6", bg: "rgba(59,130,246,0.08)", icon: "☁️" },
  "Operations & Reliability":  { border: "#8b5cf6", bg: "rgba(139,92,246,0.08)", icon: "📡" },
  "Architecture & Design":     { border: "#f97316", bg: "rgba(249,115,22,0.08)", icon: "🏛️" },
  "AI Engineering":            { border: "#06b6d4", bg: "rgba(6,182,212,0.08)",  icon: "🤖" },
  "Career":                    { border: "#ec4899", bg: "rgba(236,72,153,0.08)", icon: "🎯" },
};

const FEATURED_TOPICS = [
  { slug: "computer-science-fundamentals/computation-and-complexity/big-o-notation",    label: "Big-O Notation",       level: "Beginner"     },
  { slug: "data-structures/hashing-and-graphs/hash-tables",                            label: "Hash Tables",          level: "Intermediate" },
  { slug: "backend-distributed/distributed-systems/cap-theorem",                       label: "CAP Theorem",          level: "Intermediate" },
  { slug: "architecture-design/high-level-design/system-design-framework",             label: "System Design",        level: "Advanced"     },
  { slug: "ai-engineering/llm-engineering/llm-fundamentals",                           label: "LLM Fundamentals",     level: "Intermediate" },
  { slug: "cloud-infrastructure/kubernetes/k8s-architecture",                          label: "Kubernetes",           level: "Intermediate" },
];

const LEVEL_CHIP: Record<string, string> = {
  Beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Intermediate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Advanced:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function Home() {
  const groups = domainsByGroup();
  const stats = hubStats();
  const interviewCounts = interviewStats();

  return (
    <>
      {/* ── Custom styles ─────────────────────────────────────────────────── */}
      <style>{`
        .hero-glow {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(51,102,255,0.22) 0%, transparent 70%);
        }
        .hero-dots {
          background-image: radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .dark .hero-dots {
          background-image: radial-gradient(circle, rgba(99,102,241,0.28) 1px, transparent 1px);
        }
        .brand-text {
          background: linear-gradient(135deg, #3366ff 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .domain-card { transition: border-color .18s, box-shadow .18s, transform .18s; }
        .domain-card:hover { transform: translateY(-2px); }
        .topic-chip { transition: background .15s, box-shadow .15s; }
        .topic-chip:hover { box-shadow: 0 2px 8px rgba(51,102,255,0.18); }
        @media (prefers-reduced-motion: reduce) {
          .stat-card:hover, .domain-card:hover, .topic-chip:hover { transform: none; }
        }
        .group-rule {
          background: linear-gradient(90deg, var(--grp-color) 0%, transparent 60%);
          height: 2px;
          border-radius: 2px;
        }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-12 pb-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {/* Dot grid + radial glow layers */}
          <div className="hero-dots absolute inset-0 opacity-60" aria-hidden />
          <div className="hero-glow absolute inset-0" aria-hidden />

          <div className="relative z-10 px-8 py-14 sm:px-14 sm:py-16">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Software Engineering Knowledge Hub
            </div>

            {/* Headline */}
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.4rem]">
              Master every layer of{" "}
              <span className="brand-text">software engineering</span>,
              one topic at a time.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {stats.domains} domains · {stats.categories} categories · {stats.topics}+ topics — each with
              explanations, diagrams, code, interview Q&amp;A, and revision aids.
              From Big-O to distributed consensus, all in one structured place.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/domain/computer-science-fundamentals"
                className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-700 hover:shadow-brand-500/40 active:scale-95"
              >
                Start with Fundamentals →
              </Link>
              <Link
                to="/topic/computer-science-fundamentals/computation-and-complexity/big-o-notation"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                See a sample topic
              </Link>
            </div>

            {/* Featured topic chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="self-center text-xs font-semibold uppercase tracking-wider text-slate-400">Popular:</span>
              {FEATURED_TOPICS.map((t) => (
                <Link
                  key={t.slug}
                  to={`/topic/${t.slug}`}
                  className="topic-chip inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                >
                  {t.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${LEVEL_CHIP[t.level] ?? ""}`}>
                    {t.level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats strip ────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "🗂️", value: stats.domains,    label: "Domains",    sub: "broad knowledge areas" },
            { icon: "📂", value: stats.categories, label: "Categories", sub: "focused topic clusters" },
            { icon: "📄", value: `${stats.topics}+`, label: "Topics",  sub: "individual concept pages" },
            { icon: "🔖", value: "17",              label: "Sections",  sub: "per topic, structured" },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              style={{ transition: "transform .18s" }}
            >
              <div className="mb-2 text-2xl" aria-hidden>{s.icon}</div>
              <div className="text-3xl font-extrabold tabular-nums text-brand-600 dark:text-brand-300">{s.value}</div>
              <div className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{s.label}</div>
              <div className="mt-0.5 text-xs text-slate-400">{s.sub}</div>
            </div>
          ))}
        </section>

        {/* ── Interview Prep ─────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 dark:border-brand-800/40 dark:from-brand-900/20 dark:to-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span aria-hidden className="text-xl">🎯</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interview Prep</h2>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                  Cram
                </span>
              </div>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Interview soon and no time to read the hub? {interviewCounts.questions} model answers,{" "}
                {interviewCounts.decisions} "why X over Y" decision tables, and the traps that lose
                offers — organised into revision plans sized to the time you actually have.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRACKS.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/interview/track/${t.slug}`}
                    className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:border-brand-400 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-200"
                  >
                    {t.icon} {t.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/interview"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Open Interview Prep →
            </Link>
          </div>
        </section>

        {/* ── What you get strip ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
          <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Every topic includes</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: "📖", title: "Learn",      items: ["Quick Summary", "Detailed Explanation", "Deep Dive", "Code & Examples"] },
              { icon: "🗺️", title: "Visualize",  items: ["Architecture Diagrams", "Flow Diagrams", "Sequence Diagrams", "State Diagrams"] },
              { icon: "🎯", title: "Practice",   items: ["Interview Q&A", "Follow-up Questions", "MCQs", "Flashcards"] },
              { icon: "📋", title: "Reference",  items: ["Revision Notes", "Cheat Sheet", "Resources", "Related Topics"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="mb-2 flex items-center gap-2">
                  <span aria-hidden>{col.icon}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{col.title}</span>
                </div>
                <ul className="space-y-1">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="h-1 w-1 rounded-full bg-brand-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Domains by group ───────────────────────────────────────────────── */}
        {groups.map((g) => {
          const accent = GROUP_ACCENT[g.group] ?? { border: "#3366ff", bg: "rgba(51,102,255,0.06)", icon: "◆" };
          return (
            <section key={g.group}>
              {/* Group header */}
              <div className="mb-5 flex items-center gap-3">
                <span className="text-base" aria-hidden>{accent.icon}</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{g.group}</h2>
                <div
                  className="group-rule flex-1"
                  style={{ "--grp-color": accent.border } as React.CSSProperties}
                />
                <span className="text-xs text-slate-400">{g.domains.length} domain{g.domains.length > 1 ? "s" : ""}</span>
              </div>

              {/* Domain cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.domains.map((d) => {
                  const totalTopics = d.categories.reduce((n, c) => n + c.topics.length, 0);
                  return (
                    <Link key={d.slug} to={`/domain/${d.slug}`}>
                      <div
                        className="domain-card h-full rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900"
                        style={{
                          borderColor: accent.border + "55",
                          borderLeftWidth: "3px",
                          borderLeftColor: accent.border,
                        }}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                              style={{ background: accent.bg }}
                              aria-hidden
                            >
                              {d.icon}
                            </span>
                            <h3 className="font-bold leading-tight text-slate-900 dark:text-white">{d.title}</h3>
                          </div>
                          <StatusBadge status={d.status} />
                        </div>

                        {/* Summary */}
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{d.summary}</p>

                        {/* Footer */}
                        {d.categories.length > 0 && (
                          <div className="mt-4 flex items-center justify-between border-t pt-3 dark:border-slate-800"
                               style={{ borderColor: accent.border + "33" }}>
                            <span className="text-xs font-medium" style={{ color: accent.border }}>
                              {d.categories.length} categories · {totalTopics} topics
                            </span>
                            <span className="text-xs font-semibold" style={{ color: accent.border }}>
                              Explore →
                            </span>
                          </div>
                        )}

                        {/* Category preview chips */}
                        {d.categories.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {d.categories.slice(0, 3).map((c) => (
                              <span
                                key={c.slug}
                                className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                                style={{ background: accent.bg, color: accent.border }}
                              >
                                {c.title}
                              </span>
                            ))}
                            {d.categories.length > 3 && (
                              <span className="rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                +{d.categories.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Footer nudge ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-indigo-50 p-8 text-center dark:border-brand-800/40 dark:from-brand-900/20 dark:to-indigo-900/10">
          <div className="mb-2 text-2xl">🚀</div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Ready to go deep?</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Pick any topic from the sidebar or search — every page has the full structured learning flow.
          </p>
          <Link
            to="/domain/computer-science-fundamentals"
            className="mt-5 inline-block rounded-xl bg-brand-600 px-7 py-3 font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
          >
            Begin with CS Fundamentals →
          </Link>
        </section>
      </div>
    </>
  );
}
