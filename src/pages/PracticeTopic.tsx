import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findTopicBySlug, getDomain, topicPath } from "../data/taxonomy";
import { loadPractice } from "../practice";
import type { PracticeDifficulty, PracticeQuestion, TopicPractice } from "../practice/types";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Pill, cx } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";
import { NotFound } from "./NotFound";

const DIFFICULTY_STYLES: Record<PracticeDifficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Hard: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function DifficultyBadge({ difficulty }: { difficulty: PracticeDifficulty }) {
  return (
    <span
      className={cx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        DIFFICULTY_STYLES[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/** C++ code block, syntax-highlighted with shiki (lazy), plain <pre> fallback. */
function CppCode({ source }: { source: string }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const out = await codeToHtml(source, { lang: "cpp", theme: "github-dark" });
        if (!cancelled) setHtml(out);
      } catch {
        /* keep the plain fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (html) {
    return (
      <div
        className="thin-scroll overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <pre className="thin-scroll overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
      <code>{source}</code>
    </pre>
  );
}

/**
 * One practice problem. The statement is always visible; the solution starts
 * collapsed so you can attempt the problem (ideally via the original link)
 * before reading the answer.
 */
function QuestionCard({ q, index }: { q: PracticeQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      id={`q-${index + 1}`}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            #{index + 1}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{q.name}</h3>
          <DifficultyBadge difficulty={q.difficulty} />
          {q.variation && (
            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {q.variation}
            </span>
          )}
          {q.link && (
            <a
              href={q.link}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Solve it yourself ↗
            </a>
          )}
        </div>

        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {q.question.map((p, i) => (
            <p key={i} className={p.startsWith("Example") || p.startsWith("Constraints") ? "font-mono text-[13px] whitespace-pre-wrap rounded-lg bg-slate-50 p-3 dark:bg-slate-950/60" : undefined}>
              {p}
            </p>
          ))}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className={cx(
            "mt-4 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
            open
              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              : "bg-brand-600 text-white hover:bg-brand-700"
          )}
        >
          {open ? "Hide solution" : "Show solution & explanation"}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 p-5 dark:border-slate-800">
          <figure className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <figcaption className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
              <span>Solution</span>
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase">C++</span>
                <CopyButton text={q.code} />
              </div>
            </figcaption>
            <CppCode source={q.code} />
          </figure>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Why this works
            </div>
            {q.explanation.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function PracticeTopic() {
  const { topicSlug = "" } = useParams();
  const loc = useMemo(() => findTopicBySlug(topicSlug), [topicSlug]);
  const inAlgorithms = loc?.domain.slug === "algorithms";
  const [bank, setBank] = useState<TopicPractice | null | undefined>(undefined);
  const [filter, setFilter] = useState<PracticeDifficulty | "All">("All");

  usePageTitle(loc ? `${loc.topic.title} — Practice` : "Practice");

  useEffect(() => {
    let cancelled = false;
    setBank(undefined);
    loadPractice(topicSlug).then((p) => {
      if (!cancelled) setBank(p ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [topicSlug]);

  if (!loc || !inAlgorithms) return <NotFound />;

  const category = getDomain("algorithms")?.categories.find((c) =>
    c.topics.some((t) => t.slug === topicSlug)
  );
  const questions =
    bank?.questions.filter((q) => filter === "All" || q.difficulty === filter) ?? [];
  const counts = { Easy: 0, Medium: 0, Hard: 0 } as Record<PracticeDifficulty, number>;
  for (const q of bank?.questions ?? []) counts[q.difficulty]++;

  return (
    <div className="mx-auto max-w-4xl">
      <Breadcrumbs
        items={[
          { label: "Algorithm Practice", to: "/practice" },
          ...(category ? [{ label: category.title, to: "/practice" }] : []),
          { label: loc.topic.title },
        ]}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {loc.topic.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {loc.topic.useCase ?? loc.topic.summary}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {bank && <Pill>{bank.questions.length} questions</Pill>}
          {bank && (
            <Pill>
              {counts.Easy} easy · {counts.Medium} medium · {counts.Hard} hard
            </Pill>
          )}
          <Link
            to={topicPath(loc)}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            Read the theory →
          </Link>
        </div>
      </header>

      {bank === undefined && (
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900" />
        </div>
      )}

      {bank === null && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          The question bank for this topic is being written. Check back soon.
        </div>
      )}

      {bank && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={cx(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  filter === d
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                {d}
                {d !== "All" && ` (${counts[d]})`}
              </button>
            ))}
          </div>
          <div className="space-y-5">
            {questions.map((q) => (
              <QuestionCard key={q.name} q={q} index={bank.questions.indexOf(q)} />
            ))}
            {questions.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No {filter.toLowerCase()} questions in this bank.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
