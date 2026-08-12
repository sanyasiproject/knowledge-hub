import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { domainsByGroup } from "../../data/taxonomy";
import { StatusBadge, cx } from "../ui/primitives";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useMemo(() => domainsByGroup(), []);
  const location = useLocation();

  // Auto-expand the group containing the active domain.
  const activeDomainSlug = location.pathname.split("/")[2];

  return (
    <nav className="thin-scroll h-full overflow-y-auto px-3 py-4">
      {/* Pinned above the taxonomy: this is the destination when time is short. */}
      <NavLink
        to="/interview"
        onClick={onNavigate}
        className={({ isActive }) =>
          cx(
            "mb-4 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm font-semibold transition",
            isActive
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
              : "border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-800 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
          )
        }
      >
        <span aria-hidden className="text-base leading-none">🎯</span>
        <span className="flex-1">Interview Prep</span>
        <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
          Cram
        </span>
      </NavLink>

      <div className="space-y-4">
        {groups.map((g) => (
          <SidebarGroup
            key={g.group}
            label={g.group}
            domains={g.domains}
            activeDomainSlug={activeDomainSlug}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function SidebarGroup({
  label,
  domains,
  activeDomainSlug,
  onNavigate,
}: {
  label: string;
  domains: ReturnType<typeof domainsByGroup>[number]["domains"];
  activeDomainSlug?: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </div>
      <ul className="space-y-0.5">
        {domains.map((d) => (
          <SidebarDomain key={d.slug} domain={d} defaultOpen={d.slug === activeDomainSlug} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  );
}

function SidebarDomain({
  domain,
  defaultOpen,
  onNavigate,
}: {
  domain: ReturnType<typeof domainsByGroup>[number]["domains"][number];
  defaultOpen: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasCategories = domain.categories.length > 0;

  return (
    <li>
      <div className="flex items-center">
        <NavLink
          to={`/domain/${domain.slug}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              "flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium",
              isActive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )
          }
        >
          <span aria-hidden className="text-base leading-none">{domain.icon}</span>
          <span className="flex-1 truncate">{domain.title}</span>
          <StatusBadge status={domain.status} />
        </NavLink>
        {hasCategories && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            className="px-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {open ? "▾" : "▸"}
          </button>
        )}
      </div>

      {open && hasCategories && (
        <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-800">
          {domain.categories.map((c) => (
            <li key={c.slug}>
              <NavLink
                to={`/domain/${domain.slug}/${c.slug}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    "block rounded-md px-2 py-1 text-sm",
                    isActive
                      ? "font-medium text-brand-700 dark:text-brand-300"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )
                }
              >
                {c.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
