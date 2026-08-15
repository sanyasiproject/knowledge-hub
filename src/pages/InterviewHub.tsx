import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { areaStats, areasByStream, interviewStats, searchQA } from "../interview";
import { TRACKS, resolvedBlocks, trackMinutes } from "../interview/tracks";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, Pill } from "../components/ui/primitives";
import { Inline } from "../components/content/RichText";
import { usePageTitle } from "../hooks/usePageTitle";

function formatBudget(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return h >= 8 ? `${Math.round(h / 8)} day${h >= 16 ? "s" : ""}` : `${h} hours`;
}

export function InterviewHub() {
  usePageTitle("Interview Prep");
  const stats = useMemo(() => interviewStats(), []);
  const groups = useMemo(() => areasByStream(), []);
  const [query, setQuery] = useState("");

  const results = useMemo(() => (query.trim() ? searchQA(query, 30) : []), [query]);

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs items={[{ label: "Interview Prep" }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          🎯 Interview Prep
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
          The last-minute destination. Everything here is written for the case where the interview is
          soon and you cannot read the whole hub — model answers, "why X over Y" decision tables, and
          the traps that lose offers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{stats.questions} questions</Pill>
          <Pill>{stats.decisions} decision tables</Pill>
          <Pill>{stats.sheetPoints} revision points</Pill>
          <Pill>{stats.areas} areas</Pill>
        </div>
      </header>

      {/* ---- Search across the whole bank ---- */}
      <section className="mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search every question — e.g. 'closure', 'index', 'RAG vs fine-tuning'..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {query.trim() && (
          <div className="mt-3 space-y-2">
            {results.length === 0 && (
              <p className="px-1 py-4 text-sm text-slate-500 dark:text-slate-400">
                No questions match "{query}".
              </p>
            )}
            {results.map((hit) => (
              <Link
                key={`${hit.area.slug}-${hit.qa.id}`}
                to={`/interview/area/${hit.area.slug}#${hit.qa.id}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <div className="font-medium text-slate-900 dark:text-white"><Inline text={hit.qa.q} /></div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {hit.area.icon} {hit.area.title} &middot; {hit.qa.depth}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---- Tracks: pick by time available ---- */}
      <section className="mb-12">
        <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          How much time do you have?
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Each track is an ordered checklist. Blocks are ranked so that if you run out of time, what
          you skipped was the least valuable thing left.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {TRACKS.map((track) => {
            const blocks = resolvedBlocks(track);
            const mins = trackMinutes(track);
            return (
              <Link key={track.slug} to={`/interview/track/${track.slug}`} className="block">
                <Card hover className="h-full">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none" aria-hidden>
                      {track.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{track.title}</h3>
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-300">
                          {formatBudget(mins)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{track.blurb}</p>
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                        {blocks.length} blocks &middot; {track.audience}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- Areas by stream ---- */}
      <section>
        <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Browse by area</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Every area has must-know bullets, revision sheets, decision tables, a question bank, and a
          printable one-pager.
        </p>
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.stream}>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {g.stream}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.areas.map((area) => {
                  const s = areaStats(area);
                  return (
                    <Link key={area.slug} to={`/interview/area/${area.slug}`} className="block">
                      <Card hover className="h-full">
                        <div className="flex items-start gap-3">
                          <span className="text-xl leading-none" aria-hidden>
                            {area.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {area.title}
                            </h3>
                            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                              <Inline text={area.blurb} />
                            </p>
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                              {s.questions} Q&middot;A &middot; {s.decisions} decisions &middot; ~
                              {s.minutes} min
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
