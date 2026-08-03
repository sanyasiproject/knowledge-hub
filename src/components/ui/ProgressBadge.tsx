import { useProgress } from "../../hooks/useProgress";

/**
 * A small badge showing read/unread status on topic cards.
 * Renders a green checkmark for read topics, nothing for unread.
 */
export function ProgressBadge({ topicSlug }: { topicSlug: string }) {
  const { isRead } = useProgress();
  if (!isRead(topicSlug)) return null;
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
      title="Read"
    >
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6l3 3 5-5" />
      </svg>
    </span>
  );
}

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
