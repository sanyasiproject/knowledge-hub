import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AREA_MAP } from "../interview";
import { SCOPE_LABEL, getTrack, resolvedBlocks, trackMinutes } from "../interview/tracks";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Pill } from "../components/ui/primitives";
import { NotFound } from "./NotFound";
import { usePageTitle } from "../hooks/usePageTitle";

function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

/**
 * Running clock: how far into the plan each block starts. During a real cram
 * this is the number that matters — "am I behind?" — more than block length.
 */
function cumulative(minutes: number[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const m of minutes) {
    out.push(sum);
    sum += m;
  }
  return out;
}

export function InterviewTrack() {
  const { trackSlug } = useParams();
  const track = trackSlug ? getTrack(trackSlug) : undefined;
  usePageTitle(track?.title);

  const blocks = useMemo(() => (track ? resolvedBlocks(track) : []), [track]);
  const offsets = useMemo(() => cumulative(blocks.map((b) => b.minutes)), [blocks]);

  if (!track) return <NotFound />;

  const total = trackMinutes(track);
  const missing = track.blocks.length - blocks.length;

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[{ label: "Interview Prep", to: "/interview" }, { label: track.title }]}
      />

      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900 dark:text-white">
          <span aria-hidden>{track.icon}</span> {track.title}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{track.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill>{formatMinutes(total)} total</Pill>
          <Pill>{blocks.length} blocks</Pill>
          <Pill>{track.audience}</Pill>
        </div>
      </header>

      {/* ---- The plan ---- */}
      <ol className="space-y-3">
        {blocks.map((block, i) => {
          const area = AREA_MAP[block.areaSlug];
          return (
            <li
              key={`${track.slug}:${i}`}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                    +{formatMinutes(offsets[i])}
                  </span>
                  <Link
                    to={`/interview/area/${area.slug}`}
                    className="font-semibold text-slate-900 hover:underline dark:text-white"
                  >
                    {area.icon} {area.title}
                  </Link>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {SCOPE_LABEL[block.scope]}
                  </span>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                    {formatMinutes(block.minutes)}
                  </span>
                </div>
                {block.rationale && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.rationale}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {missing > 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {missing} more {missing === 1 ? "block is" : "blocks are"} planned for this track but their
          areas aren't authored yet — they'll appear here automatically once they land.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 print:hidden">
        <Link
          to="/interview"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
        >
          ← All tracks
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300"
        >
          🖨️ Print plan
        </button>
      </div>
    </div>
  );
}
