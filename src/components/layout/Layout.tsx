import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { allTopics, hubStats, searchTopics, topicPath } from "../../data/taxonomy";
import type { SearchHit } from "../../data/taxonomy";
import { LevelBadge } from "../ui/primitives";

/**
 * Theme state, held in memory only.
 *
 * The app deliberately persists nothing to the browser, so the toggle applies
 * for the session and each load starts from the OS preference.
 */
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

/* ------------------------------------------------------------------ */
/* Cmd+K Search Modal                                                  */
/* ------------------------------------------------------------------ */

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  const handleChange = useCallback((value: string) => {
    setQ(value);
    setSelectedIdx(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(searchTopics(value, 15));
    }, 200);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const navigateToResult = useCallback(
    (hit: SearchHit) => {
      navigate(topicPath(hit));
      onClose();
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        navigateToResult(results[selectedIdx]);
      }
    },
    [results, selectedIdx, onClose, navigateToResult]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Search input */}
        <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-700">
          <span className="text-slate-400">&#x2315;</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search topics..."
            className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-slate-400 dark:text-white"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="thin-scroll max-h-80 overflow-y-auto p-2">
          {q.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No topics found.</div>
          )}
          {results.map((hit, i) => (
            <button
              key={`${hit.domain.slug}-${hit.category.slug}-${hit.topic.slug}`}
              onClick={() => navigateToResult(hit)}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                i === selectedIdx
                  ? "bg-brand-50 dark:bg-brand-900/30"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900 dark:text-white">{hit.topic.title}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {hit.domain.title} &middot; {hit.category.title}
                </div>
              </div>
              <LevelBadge level={hit.topic.level} />
            </button>
          ))}
          {!q.trim() && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              Start typing to search topics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 max-w-lg items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
    >
      <span>&#x2315;</span>
      <span className="flex-1 text-left">Search topics...</span>
      <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs dark:border-slate-700 sm:inline">
        &#x2318;K
      </kbd>
    </button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const stats = hubStats();
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <button
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          &#x2630;
        </button>
        <Link to="/" className="flex items-center gap-2 font-extrabold">
          <span className="text-xl">&#x1F9ED;</span>
          <span className="hidden sm:inline text-slate-900 dark:text-white">SE Knowledge Hub</span>
        </Link>
        <div className="mx-2 flex-1">
          <SearchTrigger onClick={() => setSearchOpen(true)} />
        </div>
        <Link
          to="/interview"
          className="hidden rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30 sm:inline-block"
          title="Interview Prep — last-minute revision"
        >
          Interview
        </Link>
        <Link
          to="/paths"
          className="hidden rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:inline-block"
          title="Learning Paths"
        >
          Paths
        </Link>
        <button
          onClick={() => {
            const topics = allTopics();
            if (topics.length > 0) {
              const pick = topics[Math.floor(Math.random() * topics.length)];
              navigate(topicPath(pick));
            }
          }}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Random topic"
          title="Random topic"
        >
          &#x1F3B2;
        </button>
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="mx-auto flex max-w-[110rem]">
        {/* Sidebar -- desktop */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block">
          <Sidebar />
          <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-400 dark:border-slate-800">
            {stats.domains} domains &middot; {stats.categories} categories &middot; {stats.topics} topics
          </div>
        </aside>

        {/* Sidebar -- mobile drawer with slide animation */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside
            className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl dark:bg-slate-950 transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>

      {/* Cmd+K Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
