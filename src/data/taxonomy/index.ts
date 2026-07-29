import type { Category, Domain, Topic } from "../schema";
import { DOMAIN_GROUP_ORDER } from "../schema";
import { foundations } from "./foundations";
import { languagesAndParadigms } from "./languages";
import { craftsmanship } from "./craftsmanship";
import { dataAndStorage } from "./dataStorage";
import { backendAndDistributed } from "./backendDistributed";
import { cloudAndInfra } from "./cloudInfra";
import { opsAndReliability } from "./opsReliability";
import { architectureAndDesign } from "./architecture";
import { aiEngineering } from "./aiEngineering";
import { career } from "./career";

/** The complete information architecture — the single source of truth. */
export const DOMAINS: Domain[] = [
  ...foundations,
  ...languagesAndParadigms,
  ...craftsmanship,
  ...dataAndStorage,
  ...backendAndDistributed,
  ...cloudAndInfra,
  ...opsAndReliability,
  ...architectureAndDesign,
  ...aiEngineering,
  ...career,
];

/** Domains clustered by their high-level group, in canonical order. */
export function domainsByGroup(): { group: string; domains: Domain[] }[] {
  return DOMAIN_GROUP_ORDER.map((group) => ({
    group,
    domains: DOMAINS.filter((d) => d.group === group),
  })).filter((g) => g.domains.length > 0);
}

// ---- Lookups ----

export function getDomain(domainSlug: string): Domain | undefined {
  return DOMAINS.find((d) => d.slug === domainSlug);
}

export function getCategory(domainSlug: string, categorySlug: string): Category | undefined {
  return getDomain(domainSlug)?.categories.find((c) => c.slug === categorySlug);
}

export function getTopic(
  domainSlug: string,
  categorySlug: string,
  topicSlug: string
): Topic | undefined {
  return getCategory(domainSlug, categorySlug)?.topics.find((t) => t.slug === topicSlug);
}

export interface TopicLocation {
  domain: Domain;
  category: Category;
  topic: Topic;
}

/** Every topic in the hub, flattened with its full path — powers search + cross-links. */
export function allTopics(): TopicLocation[] {
  const out: TopicLocation[] = [];
  for (const domain of DOMAINS) {
    for (const category of domain.categories) {
      for (const topic of category.topics) {
        out.push({ domain, category, topic });
      }
    }
  }
  return out;
}

/** Resolve a bare topic slug to its location (used for `related` cross-links). */
export function findTopicBySlug(topicSlug: string): TopicLocation | undefined {
  return allTopics().find((t) => t.topic.slug === topicSlug);
}

export function topicPath(loc: TopicLocation): string {
  return `/topic/${loc.domain.slug}/${loc.category.slug}/${loc.topic.slug}`;
}

// ---- Stats (for the home page) ----

export function hubStats() {
  const domains = DOMAINS.length;
  const categories = DOMAINS.reduce((n, d) => n + d.categories.length, 0);
  const topics = allTopics().length;
  return { domains, categories, topics };
}

// ---- Search ----

export interface SearchHit extends TopicLocation {
  score: number;
}

export function searchTopics(query: string, limit = 30): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const hits: SearchHit[] = [];

  for (const loc of allTopics()) {
    const haystack = [
      loc.topic.title,
      loc.topic.summary,
      loc.category.title,
      loc.domain.title,
      ...(loc.topic.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (!haystack.includes(term)) {
        score = -1;
        break;
      }
      if (loc.topic.title.toLowerCase().includes(term)) score += 5;
      else if (loc.topic.title.toLowerCase().startsWith(term)) score += 8;
      else score += 1;
    }
    if (score > 0) hits.push({ ...loc, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
