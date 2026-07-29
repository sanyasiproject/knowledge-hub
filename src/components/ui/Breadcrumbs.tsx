import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
      <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-300">
        Home
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-slate-300 dark:text-slate-600">/</span>
          {c.to ? (
            <Link to={c.to} className="hover:text-brand-600 dark:hover:text-brand-300">
              {c.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-200">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
