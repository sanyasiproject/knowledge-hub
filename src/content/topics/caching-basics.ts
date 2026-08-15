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
    "## Distributed Caching\nWhen a single cache node is not enough, distributed caches like Redis Cluster or Memcached spread data across multiple nodes. Consistent hashing maps keys to nodes so that adding or removing a node only redistributes a small fraction of keys rather than reshuffling everything. Cache coherence across nodes is a challenge — strategies include publish/subscribe invalidation (a write to any node broadcasts an invalidation message), versioned keys, and short TTLs. In multi-region setups, replication lag can cause stale reads; teams mitigate this with local read replicas, \`WAIT\` commands for synchronous replication on critical writes, or by routing reads for recently-written keys to the primary.",
  ],
  code: [
    {
      language: "redis",
      caption: "Basic Redis caching commands: SET, GET, EX (expiry), and DEL",
      source: `SET user:42 '{"name":"Alice","plan":"pro"}' EX 3600
GET user:42
# → '{"name":"Alice","plan":"pro"}'

DEL user:42
# Remove the key explicitly

MGET user:42 user:43
# Batch-fetch multiple keys in one round-trip

TTL user:42
# Check remaining time-to-live in seconds`,
    },
    {
      language: "cpp",
      caption: "LRU cache — automatic in-process caching",
      source: `#include <unordered_map>
#include <list>
#include <optional>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

// Simple LRU cache with configurable max size
template <typename Key, typename Value>
class LRUCache {
public:
    explicit LRUCache(size_t max_size) : max_size_(max_size) {}

    std::optional<Value> get(const Key& key) {
        auto it = map_.find(key);
        if (it == map_.end()) {
            ++misses_;
            return std::nullopt;   // cache miss
        }
        ++hits_;
        // Move accessed entry to front (most recent)
        order_.splice(order_.begin(), order_, it->second);
        return it->second->second;
    }

    void put(const Key& key, const Value& value) {
        auto it = map_.find(key);
        if (it != map_.end()) {
            it->second->second = value;
            order_.splice(order_.begin(), order_, it->second);
            return;
        }
        if (order_.size() >= max_size_) {
            // Evict least recently used
            map_.erase(order_.back().first);
            order_.pop_back();
        }
        order_.emplace_front(key, value);
        map_[key] = order_.begin();
    }

    void print_stats() const {
        std::cout << "hits=" << hits_ << " misses=" << misses_
                  << " size=" << order_.size() << "\\n";
    }

private:
    size_t max_size_;
    size_t hits_ = 0, misses_ = 0;
    std::list<std::pair<Key, Value>> order_;
    std::unordered_map<Key, typename std::list<std::pair<Key, Value>>::iterator> map_;
};

// Simulated expensive DB lookup with LRU caching
struct User { int id; std::string name; };

LRUCache<int, User> user_cache(128);

User get_user(int user_id) {
    auto cached = user_cache.get(user_id);
    if (cached) return *cached;   // cache hit

    // Cache miss: simulate expensive lookup
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    User user{user_id, "User " + std::to_string(user_id)};
    user_cache.put(user_id, user);
    return user;
}

// First call: slow (cache miss)
// get_user(42);
// Second call: instant (cache hit)
// get_user(42);
// user_cache.print_stats();  // hits=1 misses=1 size=1`,
    },
    {
      language: "typescript",
      caption: "Cache-aside pattern with Redis in Node.js / TypeScript",
      source: `import Redis from "ioredis";

const redis = new Redis();
const CACHE_TTL = 3600; // 1 hour

async function getUser(userId: string): Promise<User> {
  const cacheKey = \\\`user:\\\${userId}\\\`;

  // 1. Try the cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss — fetch from the database
  const user = await db.users.findById(userId);

  // 3. Populate the cache for next time
  await redis.set(cacheKey, JSON.stringify(user), "EX", CACHE_TTL);

  return user;
}

async function updateUser(userId: string, data: Partial<User>) {
  await db.users.update(userId, data);
  // Invalidate the cached entry so the next read gets fresh data
  await redis.del(\\\`user:\\\${userId}\\\`);
}`,
    },
  ],
  comparison: {
    columns: ["Strategy", "How it works", "Consistency", "Write latency", "Best for"],
    rows: [
      ["Cache-Aside", "App checks cache; on miss loads from DB and populates cache", "Eventually consistent — stale until TTL or invalidation", "N/A (reads only)", "Read-heavy workloads with infrequent writes"],
      ["Write-Through", "App writes to cache; cache synchronously writes to DB", "Strong — cache and DB always in sync", "Higher (two writes on every update)", "Data that must be consistent and is read soon after writing"],
      ["Write-Back (Write-Behind)", "App writes to cache; cache asynchronously flushes to DB", "Eventual — risk of data loss if cache crashes before flush", "Low (only cache write is synchronous)", "Write-heavy workloads where some data loss is tolerable"],
      ["Read-Through", "Cache itself fetches from DB on a miss (transparent to app)", "Eventually consistent — similar to cache-aside", "N/A (reads only)", "Simplifying app code; works well paired with write-through"],
      ["Write-Around", "App writes directly to DB, skipping the cache", "Consistent in DB; cache may be stale until TTL expires", "Low (single DB write)", "Data that is written once and rarely re-read"],
    ],
  },
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
    {
      title: "Cache-Aside Data Flow",
      kind: "sequence",
      caption: "App checks cache on every read, falls back to DB on miss, then populates the cache for future requests.",
      mermaid: `sequenceDiagram
    participant App
    participant Cache
    participant DB
    App->>Cache: GET key
    Cache-->>App: HIT - return cached value
    App->>Cache: GET missing-key
    Cache-->>App: MISS
    App->>DB: query source of truth
    DB-->>App: data
    App->>Cache: SET missing-key data EX ttl
    App-->>App: serve response`,
    },
    {
      title: "Cache Hit vs Miss Flow",
      kind: "flow",
      caption: "Decision path on every read request showing the cache hit path and the more expensive cache miss path.",
      mermaid: `flowchart TD
    A([Read request]) --> B{Cache hit?}
    B -->|Yes| C([Return cached data - fast])
    B -->|No| D[Query database]
    D --> E[Store result in cache with TTL]
    E --> F([Return data to caller])`,
    },
    {
      title: "Cache Topology Options",
      kind: "architecture",
      caption: "Three common cache deployment topologies: local in-process, remote centralized, and multi-tier.",
      mermaid: `graph TD
    AppA["App Instance A"]
    AppB["App Instance B"]
    L1A["Local Cache A - in-process"]
    L1B["Local Cache B - in-process"]
    Redis["Redis - shared remote cache"]
    DB["Database"]
    AppA --> L1A
    AppB --> L1B
    L1A -->|miss| Redis
    L1B -->|miss| Redis
    Redis -->|miss| DB`,
    },
    {
      title: "Cache Eviction Policy Comparison",
      kind: "mindmap",
      caption: "Common cache eviction policies and the access patterns they are best suited for.",
      mermaid: `mindmap
  root((Eviction Policies))
    LRU
      Evicts least recently used
      Best for recency-skewed access
    LFU
      Evicts least frequently used
      Best for frequency-skewed access
    TTL
      Expires after fixed time
      Best for time-sensitive data
    FIFO
      Evicts oldest inserted entry
      Simple but ignores access patterns
    Random
      Evicts random entry
      Low overhead approximation`,
    },
  ],
  interviewQA: [
    {
      q: "What is cache invalidation and why is it hard?",
      a: "It's the process of removing or updating cached entries when the underlying data changes. It's hard because the cache and source of truth can drift, and knowing exactly when and what to invalidate across a distributed system is error-prone.",
      followUps: ["What is a TTL and how does it help?", "How would you prevent a cache stampede?"],
    },
  ],
  followUps: [
    "How does consistent hashing help when scaling a distributed cache like Redis Cluster?",
    "What are the trade-offs between TTL-based expiration and explicit cache invalidation?",
    "How would you handle a cache stampede (thundering herd) in a high-traffic system?",
    "When would you choose a local in-process cache (e.g., \`lru_cache\`) over a remote cache (e.g., Redis)?",
    "How do CDNs fit into the overall caching architecture of a web application?",
  ],
  mcqs: [
    {
      q: "In a cache-aside pattern, who is responsible for loading data into the cache on a miss?",
      options: ["The database", "The application code", "The cache automatically", "The load balancer"],
      answerIndex: 1,
      explanation: "In cache-aside, the application checks the cache, and on a miss loads from the store and populates the cache itself.",
    },
  ],
  exercises: [
    "**Cache sizing**: Your API serves 10,000 unique users per hour. Each user object is 2 KB. If 80% of requests hit the same 20% of users, estimate the minimum cache size needed for a 90% hit ratio and choose an eviction policy.",
    "**Invalidation design**: You have a product catalog cached in Redis with a 10-minute TTL. A price update must be visible within 5 seconds. Design an invalidation strategy that does not require flushing the entire cache.",
    "**Stampede prevention**: During a flash sale, a popular product's cache entry expires and 5,000 concurrent requests hit the database simultaneously. Implement a solution using either request coalescing or a cache lock pattern.",
    "**Multi-layer caching**: Design a two-layer cache (in-process L1 + Redis L2) for a microservice. Define the flow for reads, writes, and invalidation. What happens when L1 and L2 disagree?",
    "**Cache warming**: Your application restarts and the cache is cold. Design a warm-up strategy that pre-populates the cache without overwhelming the database. Consider rate limiting and priority ordering.",
  ],
  flashcards: [
    { front: "What is a **cache hit**?", back: "When the requested data is found in the cache, avoiding a trip to the slower origin store." },
    { front: "What is a **cache stampede** (thundering herd)?", back: "When many clients simultaneously experience a cache miss for the same key and all hit the origin at once, potentially overwhelming it." },
    { front: "Name three common eviction policies.", back: "**LRU** (Least Recently Used), **LFU** (Least Frequently Used), and **FIFO** (First In, First Out). LRU is the most widely used default." },
    { front: "What is the difference between **write-through** and **write-back**?", back: "Write-through updates cache and store synchronously (consistent, slower). Write-back updates the cache first and flushes to the store asynchronously (faster, risk of data loss)." },
    { front: "What does **TTL** control?", back: "Time To Live — the maximum age of a cached entry before it expires and must be re-fetched from the origin." },
    { front: "What is **consistent hashing**?", back: "A technique for distributing keys across cache nodes so that adding/removing a node only remaps a small fraction of keys, minimizing cache misses during scaling." },
    { front: "What is the **cache-aside** (lazy loading) pattern?", back: "The application checks the cache first; on a miss it fetches from the database, stores the result in the cache, and returns it. The cache is only populated on demand." },
    { front: "Why add **jitter** to TTLs?", back: "To prevent many keys from expiring at the exact same time, which would cause a burst of cache misses and load on the origin (a form of stampede)." },
  ],
  revisionNotes: [
    "Cache = fast copy of expensive data, stored closer to the consumer.",
    "Trade-off triangle: speed vs freshness vs memory — you can optimize for two at the cost of the third.",
    "Eviction: LRU is the default choice; LFU works better for frequency-skewed access patterns.",
    "Write policies: write-through (consistent), write-back (fast), cache-aside (flexible), read-through (transparent).",
    "Watch for stampedes (use locks or request coalescing) and stale reads (use TTL + explicit invalidation).",
    "Add jitter to TTLs to prevent synchronized expiration across keys.",
    "Distributed caches use consistent hashing to minimize key redistribution when nodes are added or removed.",
    "Monitor hit ratio, miss penalty, and eviction rate — a hit ratio below 80% often means the cache is misconfigured or undersized.",
  ],
  cheatSheet: [
    "\`SET key value EX seconds\` — store a value with expiry in Redis.",
    "\`GET key\` — retrieve; returns \`nil\` on miss.",
    "\`DEL key\` — explicit invalidation; use after writes to the source of truth.",
    "\`MGET key1 key2 ...\` — batch reads to reduce round-trips.",
    "Cache-aside pattern: **read → miss → fetch from DB → SET in cache → return**.",
    "Always set a TTL — unbounded caches grow until they cause OOM.",
    "Use \`SETNX\` (set-if-not-exists) for distributed cache locks to prevent stampedes.",
    "Pitfall: caching \`null\` results prevents repeated DB lookups for non-existent keys (negative caching).",
  ],
  resources: [
    { label: "Caching best practices — AWS Whitepaper", kind: "docs" },
    { label: "Designing Data-Intensive Applications, Ch. 5 (Replication) & Ch. 6 (Partitioning) — Martin Kleppmann", url: "https://dataintensive.net/", kind: "book" },
    { label: "Redis documentation — Commands and data types", url: "https://redis.io/docs/latest/", kind: "docs" },
    { label: "A Hitchhiker's Guide to Caching Patterns — Hazelcast Blog", kind: "article" },
    { label: "Consistent Hashing: Algorithmic Tradeoffs — Vimeo engineering blog", kind: "article" },
  ],
  glossary: [
    { term: "Hit ratio", definition: "The fraction of requests served from the cache rather than the origin." },
    { term: "TTL", definition: "Time to live — how long a cached entry is considered valid before expiring." },
    { term: "Eviction", definition: "Removing entries from a full cache to make room, guided by a policy like LRU." },
  ],
};
