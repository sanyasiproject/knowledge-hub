import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { findTopicBySlug, getCategory, getDomain, getTopic, topicPath } from "../data/taxonomy";
import { TOPIC_SECTIONS, TOPIC_SECTION_GROUPS } from "../data/topicSections";
import type { TopicSectionDef } from "../data/topicSections";
import { loadContent } from "../content";
import { hasPractice } from "../practice";
import type { TopicContent } from "../content/types";
import { hasSectionContent, renderSection } from "../components/content/sections";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, FrequencyBadge, LevelBadge, Pill } from "../components/ui/primitives";
import { usePageTitle } from "../hooks/usePageTitle";
import { NotFound } from "./NotFound";

/* ------------------------------------------------------------------ */
/* Reading Progress Bar                                                */
/* ------------------------------------------------------------------ */

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Back-to-Top Button                                                  */
/* ------------------------------------------------------------------ */

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
      aria-label="Back to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll Spy Hook                                                     */
/* ------------------------------------------------------------------ */

function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

/* ------------------------------------------------------------------ */
/* Share Section Link                                                  */
/* ------------------------------------------------------------------ */

function ShareLinkButton({ sectionId }: { sectionId: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sectionId]);

  return (
    <button
      onClick={handleClick}
      className="ml-2 inline-flex items-center text-slate-400 opacity-0 transition group-hover/heading:opacity-100 hover:text-brand-500"
      aria-label="Copy link to section"
      title={copied ? "Copied!" : "Copy link to section"}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zM7.586 9.586a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Loading skeleton while the topic's content chunk downloads          */
/* ------------------------------------------------------------------ */

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Loading content">
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <div className="mb-3 h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-4 w-11/12 rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reading-time estimate                                               */
/* ------------------------------------------------------------------ */

function estimateMinutes(content: TopicContent): number {
  // Rough word count over all authored text; ~6 chars/word, 200 wpm.
  let chars = 0;
  const walk = (v: unknown) => {
    if (typeof v === "string") chars += v.length;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(content);
  return Math.max(1, Math.round(chars / 6 / 200));
}

/* ------------------------------------------------------------------ */
/* TopicPage                                                           */
/* ------------------------------------------------------------------ */

export function TopicPage() {
  const { domainSlug = "", categorySlug = "", topicSlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  const category = getCategory(domainSlug, categorySlug);
  const topic = getTopic(domainSlug, categorySlug, topicSlug);

  const [content, setContent] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setContent(null);
    loadContent(topicSlug).then((c) => {
      if (!cancelled) {
        setContent(c ?? {});
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [topicSlug]);

  usePageTitle(topic?.title, topic?.summary);

  // Reading controls: text size (zoom scales diagrams and code too) and
  // collapse/expand state applied across all visible sections at once.
  const [textSize, setTextSize] = useState<0 | 1 | 2>(1);
  const zoomFor = [0.92, 1, 1.1][textSize];

  // Only sections with authored material render — a topic without code has no
  // Code section, a behavioral topic without diagrams has no Visualize group.
  const relatedResolvable = !!topic?.related?.some((s) => findTopicBySlug(s));
  const visibleSections = useMemo<TopicSectionDef[]>(() => {
    if (!content) return [];
    return TOPIC_SECTIONS.filter((s) =>
      s.component === "related" ? relatedResolvable : hasSectionContent(s.component, content)
    );
  }, [content, relatedResolvable]);

  const sectionIds = useMemo(() => visibleSections.map((s) => s.id), [visibleSections]);
  const activeId = useScrollSpy(sectionIds);

  // Collapsible sections state — all expanded by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!domain || !category || !topic) return <NotFound />;

  const minutes = content ? estimateMinutes(content) : 0;
  const visibleGroups = TOPIC_SECTION_GROUPS.filter((g) =>
    visibleSections.some((s) => s.group === g)
  );

  return (
    <div className="mx-auto max-w-6xl">
      <ReadingProgressBar />

      <Breadcrumbs
        items={[
          { label: domain.title, to: `/domain/${domain.slug}` },
          { label: category.title, to: `/domain/${domain.slug}/${category.slug}` },
          { label: topic.title },
        ]}
      />

      <div className="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-10">
        <article className="min-w-0">
          {/* Header */}
          <header className="relative mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/60 px-6 py-7 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-brand-900/20 sm:px-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/70 blur-3xl dark:bg-brand-800/20"
              aria-hidden
            />
            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <LevelBadge level={topic.level} />
                <FrequencyBadge frequency={topic.frequency} />
                {topic.tags?.map((t) => (
                  <Pill key={t}>#{t}</Pill>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {topic.title}
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {topic.summary}
              </p>
              {!loading && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 dark:text-slate-500">
                  <span>{visibleSections.length} sections</span>
                  <span aria-hidden>·</span>
                  <span>~{minutes} min read</span>
                </div>
              )}
              {domain.slug === "algorithms" && hasPractice(topic.slug) && (
                <Link
                  to={`/practice/${topic.slug}`}
                  className="mt-4 inline-block rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  💪 Practice this topic →
                </Link>
              )}
            </div>
          </header>

          {/* Reading toolbar: jump chips per group + text size + expand/collapse */}
          {!loading && visibleSections.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              {visibleGroups.map((g) => {
                const first = visibleSections.find((s) => s.group === g);
                return (
                  <a
                    key={g}
                    href={`#${first!.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(first!.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-600"
                  >
                    {g}
                  </a>
                );
              })}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => setTextSize((s) => ((s + 1) % 3) as 0 | 1 | 2)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
                  title={`Text size: ${["compact", "comfortable", "large"][textSize]}`}
                  aria-label="Cycle text size"
                >
                  <span className="text-[10px]">A</span>
                  <span className="text-sm">A</span>
                </button>
                <button
                  onClick={() => setCollapsed(Object.fromEntries(visibleSections.map((s) => [s.id, true])))}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
                >
                  Collapse all
                </button>
                <button
                  onClick={() => setCollapsed({})}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
                >
                  Expand all
                </button>
              </div>
            </div>
          )}

          {/* Mobile "on this page" nav (the sidebar TOC is desktop-only) */}
          {!loading && visibleSections.length > 0 && (
            <details className="mb-8 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
              <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
                On this page ({visibleSections.length} sections)
              </summary>
              <ul className="mt-3 space-y-1.5">
                {visibleSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                    >
                      <span className="mr-1.5 text-xs text-slate-400">{s.group} ·</span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {loading && <ContentSkeleton />}

          {/* Sections grouped by Learn / Visualize / Practice / Reference —
              only groups that actually have authored sections appear. The
              zoom wrapper implements the text-size control (scales diagrams
              and code proportionally, unlike a font-size override). */}
          {!loading && (
          <div style={zoomFor !== 1 ? ({ zoom: zoomFor } as React.CSSProperties) : undefined}>
          {
            visibleGroups.map((group) => {
              const sections = visibleSections.filter((s) => s.group === group);
              return (
                <div key={group} className="mb-12">
                  <div className="mb-5 flex items-center gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500">{group}</h2>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-10">
                    {sections.map((s) => {
                      const isCollapsed = !!collapsed[s.id];
                      return (
                        <section key={s.id} id={s.id}>
                          <div className="group/heading mb-4 flex items-center">
                            <button
                              onClick={() => toggleSection(s.id)}
                              className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                              aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "" : "rotate-90"}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center">
                                <h2 id={`h-${s.id}`} className="scroll-mt-24 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                  {s.label}
                                </h2>
                                <ShareLinkButton sectionId={s.id} />
                              </div>
                              {s.note && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{s.note}</p>}
                            </div>
                          </div>
                          {!isCollapsed && (
                            <div className="ml-8">
                              {s.component === "related" ? (
                                <RelatedTopics slugs={topic.related} />
                              ) : (
                                content && renderSection(s.component, content)
                              )}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </div>
              );
            })
          }
          </div>
          )}
        </article>

        {/* On-page table of contents with scroll spy */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">In this topic</div>
            <nav className="thin-scroll max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pr-2 text-sm">
              {visibleGroups.map((group) => (
                <div key={group}>
                  <div className="mb-1 text-xs font-semibold text-slate-500">{group}</div>
                  <ul className="space-y-1">
                    {visibleSections.filter((s) => s.group === group).map((s) => {
                      const isActive = activeId === s.id;
                      return (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`block truncate rounded-r-sm border-l-2 pl-2 transition ${
                              isActive
                                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-300"
                                : "border-transparent text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                            }`}
                          >
                            {s.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      <BackToTop />
    </div>
  );
}

function RelatedTopics({ slugs }: { slugs?: string[] }) {
  const resolved = (slugs ?? []).map(findTopicBySlug).filter(Boolean);
  if (!resolved.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resolved.map((loc) => (
        <Link key={loc!.topic.slug} to={topicPath(loc!)}>
          <Card hover>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{loc!.topic.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {loc!.domain.title} &middot; {loc!.category.title}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
