import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { findTopicBySlug, getCategory, getDomain, getTopic, topicPath } from "../data/taxonomy";
import { TOPIC_SECTIONS, TOPIC_SECTION_GROUPS } from "../data/topicSections";
import { getContent } from "../content";
import { renderSection } from "../components/content/sections";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge, Pill, Placeholder } from "../components/ui/primitives";
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
        className="h-full bg-brand-500 transition-[width] duration-150"
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
        // Find the first visible section
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the one closest to the top
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
/* TopicPage                                                           */
/* ------------------------------------------------------------------ */

export function TopicPage() {
  const { domainSlug = "", categorySlug = "", topicSlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  const category = getCategory(domainSlug, categorySlug);
  const topic = getTopic(domainSlug, categorySlug, topicSlug);
  if (!domain || !category || !topic) return <NotFound />;

  const content = getContent(topicSlug) ?? {};

  const sectionIds = TOPIC_SECTIONS.map((s) => s.id);
  const activeId = useScrollSpy(sectionIds);

  // Collapsible sections state — all expanded by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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

      <div className="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-8">
        <article className="min-w-0">
          {/* Header */}
          <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <LevelBadge level={topic.level} />
              {topic.tags?.map((t) => (
                <Pill key={t}>#{t}</Pill>
              ))}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">{topic.title}</h1>
            <p className="mt-2 max-w-3xl text-lg text-slate-600 dark:text-slate-300">{topic.summary}</p>
          </header>

          {/* Sections grouped by Learn / Visualize / Practice / Reference */}
          {TOPIC_SECTION_GROUPS.map((group) => {
            const sections = TOPIC_SECTIONS.filter((s) => s.group === group);
            return (
              <div key={group} className="mb-12">
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500">{group}</h2>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-8">
                  {sections.map((s) => {
                    const isCollapsed = !!collapsed[s.id];
                    return (
                      <section key={s.id} id={s.id}>
                        <div className="group/heading mb-3 flex items-center">
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
                              <h2 id={`h-${s.id}`} className="scroll-mt-24 text-xl font-bold text-slate-900 dark:text-white">
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
                              renderSection(s.component, content)
                            )}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </article>

        {/* On-page table of contents with scroll spy */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">In this topic</div>
            <nav className="thin-scroll max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pr-2 text-sm">
              {TOPIC_SECTION_GROUPS.map((group) => (
                <div key={group}>
                  <div className="mb-1 text-xs font-semibold text-slate-500">{group}</div>
                  <ul className="space-y-1">
                    {TOPIC_SECTIONS.filter((s) => s.group === group).map((s) => {
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
  if (!resolved.length)
    return <Placeholder icon="🔗" title="Related Topics">Cross-links to related topics across the hub will appear here.</Placeholder>;
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
