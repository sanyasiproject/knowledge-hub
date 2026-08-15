import type { Frequency, Level, Status } from "../../data/schema";
import type { ReactNode } from "react";

/** Small utility to join class names. */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const LEVEL_STYLES: Record<Level, string> = {
  Beginner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Intermediate: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  Advanced: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Expert: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "Advanced Concepts": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", LEVEL_STYLES[level])}>
      {level}
    </span>
  );
}

const FREQUENCY_STYLES: Record<Frequency, { cls: string; dots: number }> = {
  "Very High": { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", dots: 3 },
  High: { cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", dots: 2 },
  Medium: { cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", dots: 1 },
  Low: { cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", dots: 0 },
};

/**
 * How often the topic is asked. Rendered with filled dots so the ranking is
 * readable at a glance without parsing the words.
 */
export function FrequencyBadge({ frequency }: { frequency?: Frequency }) {
  if (!frequency) return null;
  const { cls, dots } = FREQUENCY_STYLES[frequency];
  return (
    <span
      className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}
      title={`${frequency} interview frequency`}
    >
      <span aria-hidden className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cx("h-1.5 w-1.5 rounded-full", i < dots ? "bg-current" : "bg-current opacity-25")}
          />
        ))}
      </span>
      {frequency}
    </span>
  );
}

export function StatusBadge({ status }: { status?: Status }) {
  if (!status || status === "available") return null;
  const label = status === "coming-soon" ? "Coming Soon" : "In Progress";
  const cls =
    status === "coming-soon"
      ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  return <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", cls)}>{label}</span>;
}

export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        hover && "transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A dashed placeholder used wherever authored content hasn't landed yet. */
export function Placeholder({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <span aria-hidden>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

export function SectionHeading({ id, children, note }: { id?: string; children: ReactNode; note?: string }) {
  return (
    <div className="mb-3">
      <h2 id={id} className="scroll-mt-24 text-xl font-bold text-slate-900 dark:text-white">
        {children}
      </h2>
      {note && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{note}</p>}
    </div>
  );
}
