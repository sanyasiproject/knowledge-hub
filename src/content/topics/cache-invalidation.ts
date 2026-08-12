import type { TopicContent } from "../types";

export const cacheInvalidation: TopicContent = {
  quickSummary: [
    "Cache invalidation is one of the two hard problems in computer science. The core challenge is ensuring cached data does not serve stale results while minimizing unnecessary cache misses.",
    "TTL-based invalidation is the simplest approach: every cache entry expires after a fixed duration. Event-driven invalidation actively removes or updates cache entries when the underlying data changes.",
    "Cache stampede (thundering herd) occurs when a popular cache entry expires and many concurrent requests simultaneously query the database. Solutions include locking, probabilistic early expiration, and stale-while-revalidate.",
  ],
  detailed: [
    "TTL-based invalidation assigns a time-to-live to every cache entry. After the TTL elapses, the entry is evicted (or marked stale). This is the simplest invalidation strategy and requires no coordination between writers and the cache. The trade-off is a guaranteed staleness window equal to the TTL: data updated in the database will not be reflected in the cache until the TTL expires. Short TTLs reduce staleness but increase cache miss rates and database load.",
    "Event-driven invalidation uses database change events (CDC, triggers, application-level events) to invalidate or update cache entries immediately when data changes. This eliminates the staleness window of TTL-based approaches. Common implementations include publishing invalidation messages to a message bus (Kafka, Redis Pub/Sub) that cache clients subscribe to, or using database triggers that call a cache invalidation API. The complexity is higher: you need reliable event delivery and must handle out-of-order or duplicate events.",
    "Versioned keys append a version number or hash to the cache key (e.g., product:42:v7). When data changes, the version is incremented and the application reads with the new key. The old key is never explicitly deleted; it simply expires via TTL. This avoids race conditions between writers and readers and is popular in CDN caching where explicit invalidation is expensive or slow.",
    "Cache stampede (also called thundering herd) happens when a hot cache key expires and N concurrent requests all see a cache miss simultaneously, all query the database, and all write back to the cache. The database experiences N times the normal load for that key. This can cascade into a full outage if the key is popular enough.",
    "The dog-pile effect is a specific form of cache stampede where a computationally expensive cache value (e.g., an aggregation query that takes 5 seconds) expires and multiple requests all start the expensive computation simultaneously. The database or compute layer is overwhelmed not just by the number of queries but by the cost of each query.",
    "Probabilistic early expiration (PER) is an elegant solution to cache stampede. Each cache read independently decides whether to trigger a refresh based on a probability that increases as the TTL approaches expiration. The formula is: should_refresh = (now - cachedAt) + beta * log(random()) >= ttl. With proper tuning, exactly one request triggers the refresh before the entry expires, and all others continue serving the cached value.",
  ],
  deepDive: [
    "Locking-based stampede prevention uses a distributed lock (Redis SETNX) so that only one request can recompute a missing cache entry at a time. All other requests either wait for the lock holder to finish (blocking) or return a stale value (non-blocking / stale-while-revalidate). The blocking approach is simpler but adds latency; the non-blocking approach requires keeping a stale copy available past the TTL.",
    "The XFetch algorithm (Vattani, Chierichetti, and Lowenstein, 2015) formalizes probabilistic early expiration. It stores the computation time (delta) alongside the cached value and uses the formula: should_recompute = (delta * beta * log(random())) >= (expiry - now). The beta parameter controls aggressiveness: beta=1 gives optimal stampede prevention under most workloads. Higher beta values refresh earlier (fewer stampedes but more redundant recomputes).",
    "Cache invalidation in microservices is especially hard because data ownership is distributed. Service A owns the user data and updates the database, but Service B caches user data locally. Options: (1) Service A publishes UserUpdated events to Kafka; Service B subscribes and invalidates its cache. (2) Service B uses short TTLs and accepts staleness. (3) A shared cache (Redis) is used by both services, and Service A invalidates on write. Option 1 is the most correct but requires event infrastructure and idempotent consumers.",
    "CDN invalidation has unique constraints. CDNs cache at edge nodes worldwide, and purging a key from all edges takes seconds to minutes. Versioned URLs (asset-v42.js) are preferred over explicit purges because they take effect immediately: the new URL is a cache miss at every edge, guaranteeing fresh content. For HTML or API responses that cannot have versioned URLs, use surrogate keys (tags) to group related cache entries and purge by tag.",
  ],
  code: [
    {
      language: "typescript",
      caption: "TTL-based invalidation with Redis",
      source: `import Redis from "ioredis";

const redis = new Redis();

// Simple TTL-based caching
async function getCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const value = await loader();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
  return value;
}

// Usage: different TTLs for different data volatility
const user = await getCached("user:42", 300, () => db.getUser(42));        // 5 min
const config = await getCached("app:config", 3600, () => db.getConfig());  // 1 hour
const prices = await getCached("prices:btc", 10, () => api.getBTCPrice()); // 10 sec`,
    },
    {
      language: "typescript",
      caption: "Event-driven invalidation via Redis Pub/Sub",
      source: `import Redis from "ioredis";

const publisher = new Redis();
const subscriber = new Redis();
const cache = new Redis();

// === Publisher side (data owner service) ===
async function updateProduct(productId: string, data: ProductUpdate): Promise<void> {
  // 1. Update database
  await db.query("UPDATE products SET name=$1, price=$2 WHERE id=$3",
    [data.name, data.price, productId]);

  // 2. Publish invalidation event
  await publisher.publish("cache:invalidate", JSON.stringify({
    type: "product",
    id: productId,
    timestamp: Date.now(),
  }));
}

// === Subscriber side (caching service) ===
subscriber.subscribe("cache:invalidate");

subscriber.on("message", async (channel, message) => {
  const event = JSON.parse(message);

  if (event.type === "product") {
    // Invalidate the specific cache entry
    await cache.del(\`product:\${event.id}\`);

    // Also invalidate derived cache entries (product listings, search results)
    const relatedKeys = await cache.keys(\`listing:*:product:\${event.id}\`);
    if (relatedKeys.length > 0) {
      await cache.del(...relatedKeys);
    }
  }
});`,
    },
    {
      language: "typescript",
      caption: "Versioned cache keys",
      source: `// Version is stored in a fast, always-available store (Redis or in-memory)
// When data changes, version is incremented. Old keys expire naturally via TTL.

async function getVersionedCache<T>(
  entity: string,
  id: string,
  ttl: number,
  loader: () => Promise<T>
): Promise<T> {
  // Get current version (cheap: small value, heavily cached)
  const version = await redis.get(\`version:\${entity}:\${id}\`) ?? "1";
  const cacheKey = \`\${entity}:\${id}:v\${version}\`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const value = await loader();
  await redis.setex(cacheKey, ttl, JSON.stringify(value));
  return value;
}

async function invalidateVersioned(entity: string, id: string): Promise<void> {
  // Simply increment the version. Old key expires via TTL.
  await redis.incr(\`version:\${entity}:\${id}\`);
  // No explicit deletion needed. No race condition possible:
  // readers that got the old version before incr will cache under old key (harmless).
  // readers after incr will use the new key and load fresh data.
}

// Usage
const product = await getVersionedCache("product", "42", 600, () => db.getProduct(42));
await invalidateVersioned("product", "42"); // next read gets fresh data`,
    },
    {
      language: "typescript",
      caption: "Cache stampede prevention with distributed lock",
      source: `// Only one request recomputes the cache value; others wait or get stale data

async function getWithLock<T>(
  key: string,
  ttl: number,
  lockTtl: number,
  loader: () => Promise<T>
): Promise<T> {
  // 1. Try the cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // 2. Try to acquire lock
  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, "1", "EX", lockTtl, "NX");

  if (acquired) {
    try {
      // 3a. Lock holder: load from DB and populate cache
      const value = await loader();
      await redis.setex(key, ttl, JSON.stringify(value));
      return value;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // 3b. Non-holder: wait briefly and retry (or return stale value)
    await sleep(50);
    const retryResult = await redis.get(key);
    if (retryResult) return JSON.parse(retryResult);

    // Still no data: fall through to direct load (safety net)
    return loader();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
    },
    {
      language: "typescript",
      caption: "Probabilistic early expiration (XFetch algorithm)",
      source: `// Prevents stampede by probabilistically refreshing before TTL expires
// Based on: "Optimal Probabilistic Cache Stampede Prevention" (Vattani et al.)

interface XFetchEntry<T> {
  value: T;
  delta: number;  // computation time in ms
  expiry: number; // absolute expiry timestamp in ms
}

async function xfetch<T>(
  key: string,
  ttlMs: number,
  beta: number,  // typically 1.0
  loader: () => Promise<T>
): Promise<T> {
  const raw = await redis.get(\`xf:\${key}\`);

  if (raw) {
    const entry: XFetchEntry<T> = JSON.parse(raw);
    const now = Date.now();

    // XFetch recomputation decision
    const gap = entry.delta * beta * Math.log(Math.random());
    const shouldRecompute = (now - gap) >= entry.expiry;

    if (!shouldRecompute) {
      return entry.value;
    }
    // Fall through to recompute (this request "won" the probabilistic lottery)
  }

  // Compute value and measure duration
  const start = Date.now();
  const value = await loader();
  const delta = Date.now() - start;

  const entry: XFetchEntry<T> = {
    value,
    delta,
    expiry: Date.now() + ttlMs,
  };

  // Store with extra TTL buffer so stale reads are possible during recompute
  await redis.psetex(\`xf:\${key}\`, ttlMs + 30000, JSON.stringify(entry));

  return value;
}

// Usage
const topProducts = await xfetch(
  "top-products",
  60000,   // 60 second TTL
  1.0,     // beta = 1 (optimal for most workloads)
  () => db.query("SELECT * FROM products ORDER BY sales DESC LIMIT 100")
);`,
    },
  ],
  diagrams: [
    {
      title: "Cache Stampede Sequence",
      kind: "sequence",
      caption: "Hot key expires; all concurrent requests miss cache simultaneously and hammer the database.",
      mermaid: `sequenceDiagram
    participant R1 as Request 1
    participant R2 as Request 2
    participant R3 as Request 3
    participant Cache
    participant DB
    Note over Cache: hot-key TTL expires
    R1->>Cache: GET hot-key
    R2->>Cache: GET hot-key
    R3->>Cache: GET hot-key
    Cache-->>R1: MISS
    Cache-->>R2: MISS
    Cache-->>R3: MISS
    R1->>DB: SELECT expensive query
    R2->>DB: SELECT expensive query
    R3->>DB: SELECT expensive query
    Note over DB: overloaded - all three queries fire simultaneously`,
    },
    {
      title: "Event-Driven Invalidation Architecture",
      kind: "architecture",
      caption: "Data service writes to DB and publishes invalidation events; cache service subscribes and deletes stale entries.",
      mermaid: `graph TD
    DataService["Data Service"]
    DB["Primary Database"]
    EventBus["Event Bus - Kafka or Redis Pub/Sub"]
    CacheService["Cache Invalidation Service"]
    Cache["Redis Cache"]
    DataService --> DB
    DataService --> EventBus
    EventBus --> CacheService
    CacheService -->|DEL stale key| Cache`,
    },
    {
      title: "Invalidation Strategy Selection Flow",
      kind: "flow",
      caption: "Decision tree for choosing the right cache invalidation strategy based on consistency and performance requirements.",
      mermaid: `flowchart TD
    A([Choose invalidation strategy]) --> B{Strong consistency required?}
    B -->|Yes| C[Write-through - update cache and DB together]
    B -->|No| D{Can tolerate stale reads?}
    D -->|Yes| E[TTL-based expiry]
    D -->|No| F{Event bus available?}
    F -->|Yes| G[Event-driven invalidation]
    F -->|No| H[Cache-aside with DEL on write]
    C --> I{High write volume?}
    I -->|Yes| J[Write-behind with async flush]
    I -->|No| K([Done])`,
    },
    {
      title: "Cache Entry Lifecycle State",
      kind: "state",
      caption: "States a cache entry passes through from creation to eviction or explicit deletion.",
      mermaid: `stateDiagram-v2
    [*] --> Fresh : SET key value EX ttl
    Fresh --> Stale : TTL expires
    Fresh --> Deleted : explicit DEL on write
    Stale --> Fresh : background refresh
    Stale --> Missing : evicted by LRU
    Deleted --> [*]
    Missing --> Fresh : cache miss triggers reload
    Missing --> [*] : key not reloaded`,
    },
  ],
  animations: [
    {
      title: "Cache Stampede and Lock-Based Prevention",
      steps: [
        { label: "Popular key expires", detail: "Cache key top-products with 1000 requests/second expires at T=0." },
        { label: "100 concurrent requests miss", detail: "Within 100ms, 100 requests check the cache and all see a miss." },
        { label: "Without lock: 100 DB queries", detail: "All 100 requests query the database simultaneously. DB CPU spikes to 100%. Response times increase from 5ms to 2000ms." },
        { label: "With lock: 1 DB query", detail: "First request acquires the lock and queries the DB. Other 99 requests see the lock and wait (50ms retry loop)." },
        { label: "Lock holder populates cache", detail: "The DB query completes in 50ms. The lock holder writes the result to the cache and releases the lock." },
        { label: "Waiting requests hit cache", detail: "The 99 waiting requests retry and find the freshly populated cache entry. Total wall-clock time: ~100ms instead of ~2000ms." },
      ],
    },
    {
      title: "XFetch Probabilistic Early Expiration",
      steps: [
        { label: "Entry cached with metadata", detail: "Value stored with delta (computation time = 200ms), expiry timestamp, and beta = 1.0." },
        { label: "Early reads: no refresh", detail: "At 20% of TTL, the probability of refresh is near zero. All reads return the cached value." },
        { label: "Approaching expiry: probability increases", detail: "At 90% of TTL, the refresh probability is high. One of the next few requests will trigger a refresh." },
        { label: "One request refreshes", detail: "Request #47 computes (now - delta * beta * log(rand)) >= expiry as true. It recomputes the value." },
        { label: "Cache updated before expiry", detail: "The value is refreshed 2 seconds before TTL expires. All other concurrent requests continue serving the old value." },
        { label: "No stampede", detail: "The key never actually expires. The transition from old to new value is seamless with no cache miss spike." },
      ],
    },
  ],
  comparison: {
    columns: ["Strategy", "Staleness Window", "Complexity", "Coordination Required", "Best For"],
    rows: [
      ["TTL-based", "0 to TTL duration", "Very low", "None", "General purpose, acceptable staleness"],
      ["Event-driven", "Near zero (event latency)", "High", "Message bus / pub-sub", "Consistency-critical data"],
      ["Versioned keys", "Near zero", "Medium", "Version counter store", "CDN, immutable deployments"],
      ["Lock-based stampede prevention", "N/A (prevents stampede)", "Medium", "Distributed lock", "Hot keys with expensive recomputation"],
      ["Probabilistic early expiration", "N/A (prevents stampede)", "Medium", "None (stateless)", "Hot keys, no coordination needed"],
      ["Stale-while-revalidate", "Bounded by revalidation time", "Low", "None", "Latency-sensitive with tolerance for brief staleness"],
    ],
  },
  interviewQA: [
    {
      q: "Why is cache invalidation considered one of the hardest problems in computer science?",
      a: "Because determining when cached data is stale requires knowledge of all possible data mutations, which may originate from multiple services, direct database edits, batch jobs, or external systems. Even with perfect invalidation logic, race conditions between concurrent reads and writes can serve stale data. Distributed systems add network partitions and message ordering issues. The fundamental tension is between performance (serving from cache) and correctness (serving fresh data). Every solution is a trade-off between staleness, complexity, and performance.",
      followUps: [
        "Can you have zero-staleness caching?",
        "How does this differ in a single-service vs microservices architecture?",
      ],
    },
    {
      q: "Explain the cache stampede problem and three ways to prevent it.",
      a: "Cache stampede occurs when a popular key expires and many concurrent requests all miss the cache simultaneously, overwhelming the database. Three solutions: (1) Locking: use a distributed lock so only one request recomputes the value while others wait or get a stale copy. (2) Probabilistic early expiration: each read independently decides whether to trigger a refresh based on a probability that increases near expiry, ensuring one request refreshes before the key actually expires. (3) Stale-while-revalidate: serve the expired value while one request refreshes it in the background, requiring storage of values past their TTL.",
      followUps: [
        "What happens if the lock holder crashes?",
        "How do you tune the beta parameter in XFetch?",
      ],
    },
    {
      q: "How do versioned cache keys work and what problem do they solve?",
      a: "Instead of explicitly deleting cache entries, you append a version to the key (product:42:v7). When data changes, increment the version. The new key is a guaranteed cache miss that loads fresh data; the old key is never deleted but expires via TTL. This solves race conditions: there is no window where a stale write from a slow reader can overwrite a fresh cache entry, because old and new readers use different keys. It is especially useful for CDN caching where explicit purge propagation is slow and unreliable.",
    },
    {
      q: "What is the difference between cache stampede and dog-pile effect?",
      a: "They are closely related. Cache stampede is the general problem: a hot key expires and many requests flood the backend. The dog-pile effect specifically refers to when the recomputation is expensive (e.g., a 5-second aggregation query). Multiple concurrent requests all start the expensive computation, compounding the load. The distinction matters because cheap queries under stampede may cause brief latency spikes, while expensive queries under dog-pile can cause cascading failures.",
    },
  ],
  followUps: [
    "Describe the race where a reader repopulates a stale value after an invalidation.",
    "Why is TTL-plus-invalidation better than either alone?",
    "How do versioned cache keys sidestep invalidation entirely?",
    "What's the worst failure mode: stale data, or a missed invalidation path?",
  ],
  mcqs: [
    {
      q: "What is the primary advantage of versioned cache keys over explicit cache deletion?",
      options: [
        "Lower storage costs",
        "Elimination of race conditions between readers and writers",
        "Faster cache reads",
        "Reduced network traffic",
      ],
      answerIndex: 1,
      explanation: "With explicit deletion, a slow reader might re-cache stale data after the invalidation. Versioned keys avoid this because the old and new readers use different keys, making it impossible for a stale write to overwrite fresh data.",
    },
    {
      q: "In the XFetch algorithm, what does the beta parameter control?",
      options: [
        "The TTL duration",
        "The maximum number of concurrent refreshes",
        "How aggressively the cache refreshes before expiry",
        "The size of the cached value",
      ],
      answerIndex: 2,
      explanation: "Higher beta values cause the probabilistic refresh to trigger earlier relative to the TTL. Beta=1 is optimal for most workloads. Higher values reduce stampede risk but increase redundant recomputation.",
    },
    {
      q: "Which invalidation approach has the smallest staleness window?",
      options: [
        "TTL-based with 60-second TTL",
        "Event-driven via Kafka with 100ms delivery latency",
        "Polling the database every 5 seconds",
        "Cache warming on deployment",
      ],
      answerIndex: 1,
      explanation: "Event-driven invalidation processes changes as they happen, with staleness limited only by event delivery latency (typically milliseconds). TTL-based and polling approaches have staleness windows measured in seconds to minutes.",
    },
    {
      q: "In lock-based stampede prevention, what happens if the lock holder crashes?",
      options: [
        "All waiting requests are permanently blocked",
        "The lock TTL expires and another request acquires the lock",
        "The cache automatically recomputes the value",
        "The database receives a flood of queries",
      ],
      answerIndex: 1,
      explanation: "The distributed lock has its own TTL (lockTtl). If the holder crashes, the lock expires after lockTtl seconds and another request acquires it. This is why the lock TTL should be set to a value slightly longer than the expected recomputation time.",
    },
  ],
  flashcards: [
    { front: "What is TTL-based cache invalidation?", back: "Every cache entry has a time-to-live. After TTL expires, entry is evicted. Simple but creates a guaranteed staleness window equal to TTL." },
    { front: "What is event-driven cache invalidation?", back: "Data changes trigger invalidation events (via Kafka, Redis Pub/Sub). Cache entries are removed immediately when source data changes. Near-zero staleness." },
    { front: "What are versioned cache keys?", back: "Append version to key (user:42:v7). On data change, increment version. Old key expires via TTL. Eliminates race conditions between readers and writers." },
    { front: "What is cache stampede?", back: "Hot key expires, N concurrent requests all miss cache and query DB simultaneously. Can overwhelm the database." },
    { front: "What is the dog-pile effect?", back: "A form of cache stampede where the recomputation is expensive. Multiple concurrent expensive queries compound the load, risking cascading failures." },
    { front: "What is probabilistic early expiration?", back: "Each read probabilistically decides to refresh before TTL expires. Probability increases near expiry. One request refreshes, preventing stampede. No coordination needed." },
    { front: "XFetch formula?", back: "should_recompute = (now - delta * beta * log(random())) >= expiry. delta = computation time, beta = aggressiveness (usually 1.0)." },
    { front: "Stale-while-revalidate?", back: "Serve expired cached value immediately while one request refreshes in the background. Eliminates miss latency at the cost of briefly stale data." },
  ],
  revisionNotes: [
    "TTL-based: simplest, guaranteed staleness window = TTL. No coordination needed.",
    "Event-driven: near-zero staleness but requires message bus and reliable delivery.",
    "Versioned keys: no race conditions, old keys expire naturally. Great for CDN.",
    "Cache stampede: hot key expires, N requests hit DB. Prevent with locking or probabilistic early expiration.",
    "Dog-pile: stampede + expensive recomputation. Even more dangerous than simple stampede.",
    "XFetch: probabilistic, stateless stampede prevention. beta=1 is optimal. Stores delta (computation time) with cached value.",
    "Lock-based: SETNX lock, one recomputes, others wait. Lock TTL prevents deadlock on crash.",
    "Stale-while-revalidate: serve stale, refresh async. Requires storing values past TTL.",
    "CDN invalidation: prefer versioned URLs over explicit purges. Use surrogate keys for grouping.",
  ],
  cheatSheet: [
    "TTL: SETEX key ttl value. Simple but stale.",
    "Event-driven: publish on write, subscribe to invalidate. Near-zero staleness.",
    "Versioned: key:v{N}. INCR version on write. Old keys expire via TTL.",
    "Stampede lock: SET lock:key 1 EX lockTtl NX. Winner recomputes, losers wait.",
    "XFetch: store {value, delta, expiry}. Refresh when (now - delta*beta*ln(rand)) >= expiry.",
    "Dog-pile: like stampede but expensive. Lock-based prevention is critical.",
    "Stale-while-revalidate: store with TTL + buffer. Serve stale, refresh async.",
    "CDN: versioned URLs > explicit purge. Surrogate keys for batch invalidation.",
  ],
  resources: [
    { label: "Optimal Probabilistic Cache Stampede Prevention (Vattani et al.)", kind: "paper", note: "The original XFetch paper formalizing probabilistic early expiration." },
    { label: "Scaling Memcache at Facebook (NSDI 2013)", kind: "paper", note: "Covers lease-based invalidation and thundering herd prevention at Facebook scale." },
    { label: "Redis Documentation: Distributed Locks (Redlock)", kind: "docs", note: "Official Redis guide on implementing distributed locks for stampede prevention." },
    { label: "Designing Data-Intensive Applications by Martin Kleppmann", kind: "book", note: "Chapters on caching, consistency, and the fundamental trade-offs in distributed data systems." },
    { label: "HTTP Caching (MDN Web Docs)", kind: "docs", note: "Covers Cache-Control directives including stale-while-revalidate and stale-if-error." },
    { label: "Varnish Cache: Surrogate Keys", kind: "article", note: "How CDNs use surrogate keys (tags) for efficient group invalidation." },
  ],
  glossary: [
    { term: "TTL (Time to Live)", definition: "The duration a cache entry is considered valid. After TTL expires, the entry is evicted or marked stale." },
    { term: "Cache Stampede", definition: "A surge of concurrent cache misses for the same key, causing a flood of database queries when a popular entry expires." },
    { term: "Thundering Herd", definition: "Synonym for cache stampede. Many requests simultaneously rushing to the backend when a shared resource becomes unavailable." },
    { term: "Dog-Pile Effect", definition: "A form of cache stampede where the recomputation is expensive, amplifying the impact of concurrent misses." },
    { term: "Probabilistic Early Expiration", definition: "A stampede prevention technique where each read independently decides whether to trigger an early refresh based on increasing probability near TTL expiry." },
    { term: "XFetch", definition: "An algorithm for optimal probabilistic cache stampede prevention that uses computation time (delta) and a tunable aggressiveness parameter (beta)." },
    { term: "Stale-While-Revalidate", definition: "A pattern where an expired cache entry is served immediately while a background refresh fetches updated data." },
    { term: "Versioned Cache Key", definition: "A cache key that includes a version number, incremented on data change. Eliminates race conditions by ensuring old and new readers use different keys." },
    { term: "Surrogate Key", definition: "A tag assigned to cached objects (especially in CDNs) enabling batch invalidation of all objects sharing the same tag." },
    { term: "Cache-Control", definition: "An HTTP header that controls caching behavior, including max-age (TTL), stale-while-revalidate, no-cache, and no-store directives." },
  ],

  exercises: [
    "You run an e-commerce site where **product prices** change 50 times/day across 100,000 products. Design a cache invalidation strategy that keeps the product listing page fresh within *5 seconds* of a price change. Compare three approaches: *TTL-based* (5-second TTL), *event-driven* (Kafka-based invalidation), and *versioned keys*. For each, calculate the approximate **cache hit rate** and the load on your database.",
    "Implement the **XFetch algorithm** (probabilistic early expiration) in C++ using `std::unordered_map` as the cache, `std::chrono` for timestamps, and `std::mt19937` for random number generation. Store `{value, delta, expiry}` per entry. Simulate 1,000 concurrent reads on a hot key approaching TTL expiry and verify that exactly *one* reader triggers the refresh. Tune the `beta` parameter and observe the effect.",
    "A **cache stampede** is crashing your database every time a popular product's cache entry expires. You have Redis available. Implement *two* solutions: (1) a **distributed lock** using `SET key NX EX` where only one request recomputes, and (2) a **stale-while-revalidate** pattern where expired entries are served while one request refreshes in the background. What happens if the lock holder crashes in solution 1?",
    "In a **microservices architecture**, Service A owns user data and Service B caches user profiles locally. When Service A updates a user's email, Service B's cache becomes stale. Design an *event-driven invalidation pipeline* using Kafka: define the event schema, the producer logic in Service A, the consumer logic in Service B, and explain how you handle **out-of-order events** and **duplicate deliveries**.",
    "Your CDN caches API responses for a news site. Breaking news articles must appear within *10 seconds*, but CDN purge propagation takes *30 seconds* across all edge nodes. Propose a solution using **versioned URLs** or **surrogate keys** that guarantees freshness without waiting for purge propagation. How does `Cache-Control: stale-while-revalidate` fit into this design?"
  ],
};
