export function ComingSoon({ title, summary, icon }: { title: string; summary: string; icon?: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 text-5xl" aria-hidden>{icon ?? "🚧"}</div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
      <span className="mt-2 inline-block rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        Coming Soon
      </span>
      <p className="mx-auto mt-4 max-w-md text-slate-500 dark:text-slate-400">{summary}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        The structure is reserved in the hierarchy — full content is on the roadmap.
      </p>
    </div>
  );
}
