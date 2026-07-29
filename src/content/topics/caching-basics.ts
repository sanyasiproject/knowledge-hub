import type { TopicContent } from "../types";

export const cachingBasics: TopicContent = {
  quickSummary: [
    "A cache stores the results of expensive work close to where they're needed so repeated requests are served fast.",
    "Caching trades freshness and memory for speed — the hard part is keeping cached data from going stale.",
    "Key metrics: hit ratio (fraction served from cache), and the cost of a miss.",
  ],
  detailed: [
    "Caching exploits locality: if data was needed once, it's likely to be needed again soon (temporal locality) or data near it will be (spatial locality). By keeping a copy in a faster, smaller store, we avoid recomputing or re-fetching it.",
    "Caches appear at every layer: CPU caches, OS page cache, database buffer pools, application caches (in-memory or Redis), CDNs, and the browser. The same principles apply at every layer.",
    "Because a cache has limited size, it needs an eviction policy — LRU (least recently used) is the most common — to decide what to drop when full.",
  ],
  deepDive: [
    "The two classic failure modes: a cache stampede (many clients miss simultaneously and all hit the origin at once) and stale reads (the cache serves outdated data after the source changed). Mitigations include request coalescing, TTL jitter, and explicit invalidation.",
    "Write policies determine consistency: write-through updates cache and store together (consistent, slower writes); write-back updates the cache first and the store later (fast, risk of loss); cache-aside lets the app load and populate the cache on a miss.",
  ],
  animations: [
    {
      title: "Cache lookup: hit vs miss",
      steps: [
        { label: "Request arrives", detail: "The application needs a value for key K." },
        { label: "Check cache", detail: "Look up K in the cache first." },
        { label: "Hit", detail: "Found — return the cached value immediately (fast path)." },
        { label: "Miss", detail: "Not found — fetch from the origin (database/service)." },
        { label: "Populate", detail: "Store the fetched value in the cache with a TTL." },
        { label: "Return", detail: "Return the value; subsequent requests for K are now hits." },
      ],
    },
  ],
  diagrams: [
    { title: "Cache-aside data flow", kind: "sequence", caption: "App checks cache, falls back to DB on miss, then populates the cache." },
  ],
  interviewQA: [
    {
      q: "What is cache invalidation and why is it hard?",
      a: "It's the process of removing or updating cached entries when the underlying data changes. It's hard because the cache and source of truth can drift, and knowing exactly when and what to invalidate across a distributed system is error-prone.",
      followUps: ["What is a TTL and how does it help?", "How would you prevent a cache stampede?"],
    },
  ],
  mcqs: [
    {
      q: "In a cache-aside pattern, who is responsible for loading data into the cache on a miss?",
      options: ["The database", "The application code", "The cache automatically", "The load balancer"],
      answerIndex: 1,
      explanation: "In cache-aside, the application checks the cache, and on a miss loads from the store and populates the cache itself.",
    },
  ],
  revisionNotes: [
    "Cache = fast copy of expensive data.",
    "Trade-off: speed vs freshness vs memory.",
    "Eviction: LRU is the default choice.",
    "Write policies: through / back / aside.",
    "Watch for stampedes and stale reads.",
  ],
  resources: [
    { label: "Caching best practices — AWS Whitepaper", kind: "docs" },
    { label: "Designing Data-Intensive Applications, Ch. 1", kind: "book" },
  ],
  glossary: [
    { term: "Hit ratio", definition: "The fraction of requests served from the cache rather than the origin." },
    { term: "TTL", definition: "Time to live — how long a cached entry is considered valid before expiring." },
    { term: "Eviction", definition: "Removing entries from a full cache to make room, guided by a policy like LRU." },
  ],
};
