/**
 * A small bar showing how many of the 17 standard sections are authored.
 */
export function ContentCompletenessBadge({ authored, total }: { authored: number; total: number }) {
  const pct = total > 0 ? (authored / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-slate-400">{authored}/{total}</span>
    </div>
  );
}
