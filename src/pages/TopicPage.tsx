import { Link, useParams } from "react-router-dom";
import { findTopicBySlug, getCategory, getDomain, getTopic, topicPath } from "../data/taxonomy";
import { TOPIC_SECTIONS, TOPIC_SECTION_GROUPS } from "../data/topicSections";
import { getContent } from "../content";
import { renderSection } from "../components/content/sections";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { Card, LevelBadge, Pill, Placeholder, SectionHeading } from "../components/ui/primitives";
import { NotFound } from "./NotFound";

/**
 * THE reusable topic template. Every topic in the hub renders through this one
 * component. It walks the standard TOPIC_SECTIONS schema and renders each section
 * via the content registry — authored content where available, consistent
 * placeholders everywhere else. Adding a topic never means touching this file.
 */
export function TopicPage() {
  const { domainSlug = "", categorySlug = "", topicSlug = "" } = useParams();
  const domain = getDomain(domainSlug);
  const category = getCategory(domainSlug, categorySlug);
  const topic = getTopic(domainSlug, categorySlug, topicSlug);
  if (!domain || !category || !topic) return <NotFound />;

  const content = getContent(topicSlug) ?? {};

  return (
    <div className="mx-auto max-w-6xl">
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
                  {sections.map((s) => (
                    <section key={s.id} id={s.id}>
                      <SectionHeading id={`h-${s.id}`} note={s.note}>
                        {s.label}
                      </SectionHeading>
                      {s.component === "related" ? (
                        <RelatedTopics slugs={topic.related} />
                      ) : (
                        renderSection(s.component, content)
                      )}
                    </section>
                  ))}
                </div>
              </div>
            );
          })}
        </article>

        {/* On-page table of contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">In this topic</div>
            <nav className="thin-scroll max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pr-2 text-sm">
              {TOPIC_SECTION_GROUPS.map((group) => (
                <div key={group}>
                  <div className="mb-1 text-xs font-semibold text-slate-500">{group}</div>
                  <ul className="space-y-1">
                    {TOPIC_SECTIONS.filter((s) => s.group === group).map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="block truncate text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </div>
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
              {loc!.domain.title} · {loc!.category.title}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
