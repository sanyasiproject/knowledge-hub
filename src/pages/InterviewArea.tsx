import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { areaStats, getArea, sortedQA } from "../interview";
import type { Decision, Depth, QA } from "../interview/types";
import { findTopicBySlug, topicPath } from "../data/taxonomy";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, Pill, cx } from "../components/ui/primitives";
import { Inline } from "../components/content/RichText";
import { NotFound } from "./NotFound";

const DEPTHS: Depth[] = ["Core", "Intermediate", "Advanced"];

const DEPTH_STYLE: Record<Depth, string> = {
  Core: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Intermediate: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  Advanced: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function DepthBadge({ depth }: { depth: Depth }) {
  return (
    <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-semibold", DEPTH_STYLE[depth])}>
      {depth}
    </span>
  );
}

/** Cross-link into the full hub topic, when the question maps to one. */
function TopicLink({ slug }: { slug?: string }) {
  if (!slug) return null;
  const loc = findTopicBySlug(slug);
  if (!loc) return null;
  return (
    <Link
      to={topicPath(loc)}
      className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
    >
      Go deeper: {loc.topic.title} →
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Decision table — the "why X over Y" renderer                        */
/* ------------------------------------------------------------------ */

function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <Card className="break-inside-avoid">
      <h3 className="font-bold text-slate-900 dark:text-white">{decision.title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {decision.options.map((opt) => (
          <div
            key={opt.name}
            className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="mb-1.5 font-semibold text-slate-800 dark:text-slate-100">{opt.name}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Pick when
            </div>
            <ul className="mb-2 mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-600 dark:text-slate-300">
              {opt.pick.map((p, i) => (
                <li key={i}><Inline text={p} /></li>
              ))}
            </ul>
            <div className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Costs you
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-600 dark:text-slate-300">
              {opt.cost.map((c, i) => (
                <li key={i}><Inline text={c} /></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
        <span className="font-bold">15-second answer: </span>
        <Inline text={decision.verdict} />
      </div>
      <div className="mt-2">
        <TopicLink slug={decision.topic} />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Q&A card                                                            */
/* ------------------------------------------------------------------ */

function QACard({ item }: { item: QA }) {
  const [open, setOpen] = useState(false);

  // Deep links from search (#qa-id) should land expanded.
  useEffect(() => {
    if (window.location.hash.slice(1) === item.id) {
      setOpen(true);
      document.getElementById(item.id)?.scrollIntoView({ block: "start" });
    }
  }, [item.id]);

  return (
    <div
      id={item.id}
      className="scroll-mt-24 rounded-xl border border-slate-200 bg-white transition dark:border-slate-800 dark:bg-slate-900 print:break-inside-avoid"
    >
      <div className="flex items-start gap-2 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <DepthBadge depth={item.depth} />
            {item.tags?.slice(0, 3).map((t) => (
              <span key={t} className="text-[11px] text-slate-400 dark:text-slate-500">
                #{t}
              </span>
            ))}
          </div>
          <div className="mt-1 font-semibold text-slate-900 dark:text-white"><Inline text={item.q} /></div>
        </button>
        <span className="mt-1 shrink-0 text-slate-400 print:hidden">{open ? "▾" : "▸"}</span>
      </div>

      <div className={cx("px-4 pb-4", !open && "hidden print:block")}>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"><Inline text={item.a} /></p>

        {item.why && (
          <div className="mt-3 rounded-lg border-l-4 border-brand-400 bg-brand-50/60 px-3 py-2 dark:bg-brand-900/20">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              What they're really testing
            </div>
            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300"><Inline text={item.why} /></p>
          </div>
        )}

        {item.trap && (
          <div className="mt-2 rounded-lg border-l-4 border-amber-400 bg-amber-50/60 px-3 py-2 dark:bg-amber-900/20">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Common trap
            </div>
            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300"><Inline text={item.trap} /></p>
          </div>
        )}

        {item.followUps && item.followUps.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Where they go next
            </div>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-600 dark:text-slate-300">
              {item.followUps.map((f, i) => (
                <li key={i}><Inline text={f} /></li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3">
          <TopicLink slug={item.topic} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type View = "revise" | "qa" | "one-pager";

export function InterviewArea() {
  const { areaSlug } = useParams();
  const area = areaSlug ? getArea(areaSlug) : undefined;

  const [view, setView] = useState<View>("revise");
  const [depthFilter, setDepthFilter] = useState<Depth | "all">("all");

  const ordered = useMemo(() => (area ? sortedQA(area) : []), [area]);

  // Land on the Q&A view when arriving from a search deep link.
  useEffect(() => {
    if (window.location.hash) setView("qa");
  }, []);

  if (!area) return <NotFound />;

  const stats = areaStats(area);

  const visibleQA =
    depthFilter === "all" ? ordered : ordered.filter((q) => q.depth === depthFilter);

  const onePager = view === "one-pager";

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[{ label: "Interview Prep", to: "/interview" }, { label: area.title }]}
      />

      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900 dark:text-white">
          <span aria-hidden>{area.icon}</span> {area.title}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300"><Inline text={area.blurb} /></p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Pill>{stats.questions} questions</Pill>
          <Pill>{stats.decisions} decisions</Pill>
          <Pill>~{stats.minutes} min</Pill>
        </div>
      </header>

      {/* ---- View switcher + print ---- */}
      <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
        {(
          [
            ["revise", "Revise"],
            ["qa", `Q&A (${area.qa.length})`],
            ["one-pager", "One-pager"],
          ] as [View, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              view === id
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => window.print()}
          className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300"
        >
          🖨️ Print / PDF
        </button>
      </div>

      {/* ================= REVISE + ONE-PAGER ================= */}
      {(view === "revise" || onePager) && (
        <div className={cx("space-y-8", onePager && "one-pager space-y-5 text-[13px]")}>
          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              Must know — if you read nothing else
            </h2>
            <ol className="list-decimal space-y-1.5 rounded-xl border border-slate-200 bg-white p-5 pl-8 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {area.mustKnow.map((m, i) => (
                <li key={i}><Inline text={m} /></li>
              ))}
            </ol>
          </section>

          {area.numbers && area.numbers.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                Numbers worth memorising
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <tbody>
                    {area.numbers.map((n, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                        <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">
                          {n.label}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 font-mono font-semibold text-brand-700 dark:text-brand-300">
                          {n.value}
                        </td>
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400"><Inline text={n.note ?? ""} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Revision sheets</h2>
            <div className={cx("grid gap-4", !onePager && "sm:grid-cols-2")}>
              {area.sheets.map((sheet) => (
                <Card key={sheet.title} className="break-inside-avoid">
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{sheet.title}</h3>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
                    {sheet.points.map((p, i) => (
                      <li key={i}><Inline text={p} /></li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Why X over Y — decision tables
            </h2>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              The highest-yield question shape in senior interviews. Know the verdict line for each.
            </p>
            <div className="space-y-4">
              {area.decisions.map((d) => (
                <DecisionCard key={d.title} decision={d} />
              ))}
            </div>
          </section>

          {area.pitfalls && area.pitfalls.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                Pitfalls — don't say this
              </h2>
              <ul className="list-disc space-y-1.5 rounded-xl border-l-4 border-amber-400 bg-amber-50/60 py-4 pl-9 pr-5 text-sm text-slate-700 dark:bg-amber-900/20 dark:text-slate-300">
                {area.pitfalls.map((p, i) => (
                  <li key={i}><Inline text={p} /></li>
                ))}
              </ul>
            </section>
          )}

          {/* In the one-pager, questions print compactly with answers open. */}
          {onePager && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                Question bank ({area.qa.length})
              </h2>
              <div className="space-y-2">
                {ordered.map((item) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white"><Inline text={item.q} /></div>
                    <p className="mt-1 text-slate-700 dark:text-slate-300"><Inline text={item.a} /></p>
                    {item.trap && (
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Trap: </span>
                        <Inline text={item.trap} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ================= Q&A ================= */}
      {view === "qa" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
            {(["all", ...DEPTHS] as (Depth | "all")[]).map((d) => (
              <button
                key={d}
                onClick={() => setDepthFilter(d)}
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  depthFilter === d
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {d === "all" ? `All (${area.qa.length})` : `${d} (${area.qa.filter((q) => q.depth === d).length})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleQA.map((item) => (
              <QACard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ---- Deeper reading ---- */}
      {area.relatedTopics && area.relatedTopics.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800 print:hidden">
          <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            After the interview — go deeper
          </h2>
          <div className="flex flex-wrap gap-2">
            {area.relatedTopics.map((slug) => {
              const loc = findTopicBySlug(slug);
              if (!loc) return null;
              return (
                <Link
                  key={slug}
                  to={topicPath(loc)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-brand-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-900/40"
                >
                  {loc.topic.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
