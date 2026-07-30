import type { TopicContent } from "../types";

export const cacheStrategies: TopicContent = {
  quickSummary: [
    "Cache-aside (lazy loading) is the most common pattern: the application checks the cache first, and on a miss, reads from the database, then populates the cache. The cache only contains data that has actually been requested.",
    "Write-through writes to both cache and database synchronously, guaranteeing cache consistency but adding write latency. Write-behind (write-back) buffers writes in the cache and asynchronously flushes to the database, improving write performance at the risk of data loss.",
    "Read-through delegates database reads to the cache layer itself, while refresh-ahead proactively refreshes entries before they expire, reducing cache miss latency for hot keys.",
  ],
  detailed: [
    "Cache-aside (lazy loading) places the application in full control of the cache. On read: check cache, if miss then query database, store result in cache, return. On write: update database, then invalidate or update the cache. This is simple to implement and ensures only requested data occupies cache memory. The downside is that every cache miss incurs the full database latency, and there is a brief window where the cache is stale after a database write.",
    "Write-through caching writes every update to both the cache and the database before returning success to the caller. This ensures the cache is always consistent with the database. The trade-off is higher write latency (two writes on every mutation) and cache pollution: data that is written but never read still occupies cache space. Write-through works well when paired with read-through so that reads are always fast and writes keep the cache warm.",
    "Write-behind (write-back) caching writes updates to the cache immediately and returns success to the caller. A background process asynchronously flushes dirty cache entries to the database. This dramatically reduces write latency and enables write coalescing (multiple updates to the same key are merged into a single database write). The risk is data loss: if the cache node crashes before flushing, unflushed writes are lost. Use write-behind only when you can tolerate bounded data loss or have replication on the cache tier.",
    "Read-through caching is like cache-aside but the cache itself is responsible for loading data on a miss. The application always reads from the cache; on a miss, the cache fetches from the database transparently. This simplifies application code and centralizes caching logic. Libraries like Caffeine (Java) and cache managers in NestJS support this pattern natively.",
    "Refresh-ahead proactively reloads cache entries before they expire, based on a configurable threshold (e.g., refresh when 80% of TTL has elapsed). If a key is accessed within the refresh window, the cache triggers an async reload so the next access hits fresh data. This eliminates cache miss latency for frequently accessed keys. The downside is wasted refreshes for keys that expire without being accessed again.",
    "Cache warming pre-populates the cache with expected hot data before traffic arrives. This is essential after deployments, cache restarts, or failovers. Without warming, a cold cache causes a thundering herd of database queries. Warming strategies include replaying recent access logs, loading from a snapshot, or running a dedicated warming job.",
  ],
  deepDive: [
    "Write-behind with write coalescing can dramatically reduce database load. If a user updates their profile 5 times in 10 seconds, the cache holds the latest value and the background flusher writes only the final state to the database. This is particularly effective for counters, analytics events, and session data. Redis does not natively support write-behind; you implement it with a background worker that reads from a Redis Stream or sorted set of dirty keys.",
    "Refresh-ahead is implemented by tracking the insertion or last-refresh timestamp alongside each cache entry. On every read, the cache checks: if (now - lastRefresh) > (TTL * refreshAheadFactor), trigger an async reload. The current (possibly stale) value is returned immediately. This is a form of stale-while-revalidate, similar to the HTTP Cache-Control directive. The refresh-ahead factor is typically 0.7-0.9.",
    "Multi-tier caching combines strategies. A common architecture uses an L1 in-process cache (Caffeine, node-cache) with a very short TTL (seconds) fronting an L2 distributed cache (Redis) with a longer TTL (minutes). Reads check L1 first, then L2, then the database. This reduces network round-trips for extremely hot data while maintaining a shared cache for consistency across instances. Write-through to L2 and cache-aside for L1 is the typical combination.",
    "Choosing a strategy depends on your read/write ratio. Read-heavy workloads (100:1) benefit from cache-aside or read-through. Write-heavy workloads benefit from write-behind. Balanced workloads often use write-through with read-through. If latency SLAs are strict and access patterns are predictable, add refresh-ahead. Cache warming is a deployment concern, not a runtime strategy, and should be part of every production deployment pipeline.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Cache-aside pattern with Redis",
      source: `import Redis from "ioredis";

const redis = new Redis();
const TTL_SECONDS = 300; // 5 minutes

interface User {
  id: string;
  name: string;
  email: string;
}

// Cache-aside read
async function getUser(userId: string): Promise<User> {
  const cacheKey = \`user:\${userId}\`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss: read from database
  const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);

  // 3. Populate cache
  await redis.setex(cacheKey, TTL_SECONDS, JSON.stringify(user));

  return user;
}

// Cache-aside write (invalidation approach)
async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  // 1. Update database first
  await db.query("UPDATE users SET name=$1, email=$2 WHERE id=$3",
    [data.name, data.email, userId]);

  // 2. Invalidate cache (next read will re-populate)
  await redis.del(\`user:\${userId}\`);
}`,
    },
    {
      language: "typescript",
      caption: "Write-through pattern",
      source: `// Write-through: update cache and DB synchronously on every write

async function writeThrough(
  key: string,
  value: unknown,
  ttl: number
): Promise<void> {
  const serialized = JSON.stringify(value);

  // Write to both cache and DB in parallel (or sequentially for strict ordering)
  await Promise.all([
    redis.setex(\`cache:\${key}\`, ttl, serialized),
    db.query(
      "INSERT INTO kv_store (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
      [key, serialized]
    ),
  ]);
}

// Read-through companion: cache handles miss transparently
async function readThrough(key: string, ttl: number): Promise<unknown> {
  const cached = await redis.get(\`cache:\${key}\`);
  if (cached) return JSON.parse(cached);

  // Cache loads from DB itself
  const row = await db.query("SELECT value FROM kv_store WHERE key = $1", [key]);
  if (row) {
    await redis.setex(\`cache:\${key}\`, ttl, row.value);
    return JSON.parse(row.value);
  }
  return null;
}`,
    },
    {
      language: "typescript",
      caption: "Write-behind with async flush using a dirty set",
      source: `// Write-behind: write to cache immediately, flush to DB asynchronously

async function writeBehind(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);

  // 1. Write to cache immediately (caller gets fast response)
  await redis.set(\`cache:\${key}\`, serialized);

  // 2. Mark key as dirty for background flusher
  await redis.sadd("dirty_keys", key);
}

// Background flusher runs on an interval
async function flushDirtyKeys(): Promise<void> {
  // Atomically get and clear dirty keys
  const pipeline = redis.pipeline();
  pipeline.smembers("dirty_keys");
  pipeline.del("dirty_keys");
  const results = await pipeline.exec();

  const dirtyKeys = results?.[0]?.[1] as string[] | undefined;
  if (!dirtyKeys?.length) return;

  // Batch write to database (write coalescing)
  const values = await Promise.all(
    dirtyKeys.map(async (key) => {
      const val = await redis.get(\`cache:\${key}\`);
      return { key, value: val };
    })
  );

  // Batch upsert
  const placeholders = values
    .map((_, i) => \`($\${i * 2 + 1}, $\${i * 2 + 2})\`)
    .join(", ");
  const params = values.flatMap((v) => [v.key, v.value]);

  await db.query(
    \`INSERT INTO kv_store (key, value) VALUES \${placeholders}
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value\`,
    params
  );
}

// Run flusher every 5 seconds
setInterval(flushDirtyKeys, 5000);`,
    },
    {
      language: "typescript",
      caption: "Refresh-ahead pattern",
      source: `const REFRESH_AHEAD_FACTOR = 0.8; // refresh when 80% of TTL elapsed

interface CacheEntry<T> {
  value: T;
  cachedAt: number; // epoch ms
  ttlMs: number;
}

async function getWithRefreshAhead<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const raw = await redis.get(\`ra:\${key}\`);

  if (raw) {
    const entry: CacheEntry<T> = JSON.parse(raw);
    const elapsed = Date.now() - entry.cachedAt;
    const threshold = entry.ttlMs * REFRESH_AHEAD_FACTOR;

    if (elapsed > threshold) {
      // Trigger async refresh (don't await - return stale value immediately)
      refreshInBackground(key, ttlMs, loader);
    }

    return entry.value;
  }

  // Full cache miss - synchronous load
  return loadAndCache(key, ttlMs, loader);
}

async function loadAndCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const value = await loader();
  const entry: CacheEntry<T> = { value, cachedAt: Date.now(), ttlMs };
  await redis.psetex(\`ra:\${key}\`, ttlMs, JSON.stringify(entry));
  return value;
}

function refreshInBackground<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): void {
  loadAndCache(key, ttlMs, loader).catch((err) =>
    console.error(\`Refresh-ahead failed for \${key}:\`, err)
  );
}`,
    },
    {
      language: "typescript",
      caption: "Cache warming from access logs",
      source: `// Run after deployment or cache restart to pre-populate hot keys

async function warmCache(): Promise<void> {
  console.log("Starting cache warm-up...");

  // 1. Get recently accessed keys from access log
  const hotKeys = await db.query(\`
    SELECT key, COUNT(*) as hits
    FROM access_log
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY key
    ORDER BY hits DESC
    LIMIT 10000
  \`);

  // 2. Load values in parallel batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < hotKeys.length; i += BATCH_SIZE) {
    const batch = hotKeys.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ({ key }) => {
        const value = await db.query("SELECT value FROM data WHERE key = $1", [key]);
        if (value) {
          await redis.setex(\`cache:\${key}\`, TTL_SECONDS, JSON.stringify(value));
        }
      })
    );
  }

  console.log(\`Warmed \${hotKeys.length} cache entries\`);
}`,
    },
  ],
  diagrams: [
    {
      title: "Cache-Aside (Lazy Loading) Flow",
      kind: "sequence",
      caption: "Application checks cache on read. On miss, queries database and populates cache. On write, updates database and invalidates cache.",
    },
    {
      title: "Write-Through vs Write-Behind",
      kind: "flow",
      caption: "Write-through updates cache and DB synchronously. Write-behind updates cache immediately and asynchronously flushes to DB via background worker.",
    },
    {
      title: "Multi-Tier Caching Architecture",
      kind: "architecture",
      caption: "L1 in-process cache (ms TTL) -> L2 Redis (minute TTL) -> Database. Each tier reduces load on the next.",
    },
  ],
  animations: [
    {
      title: "Cache-Aside Read Flow",
      steps: [
        { label: "Application receives request", detail: "A request arrives for user profile data with userId=42." },
        { label: "Check cache", detail: "Application queries Redis for key user:42. Redis returns nil (cache miss)." },
        { label: "Query database", detail: "Application queries PostgreSQL: SELECT * FROM users WHERE id=42. Database returns the user row." },
        { label: "Populate cache", detail: "Application writes the user data to Redis with SETEX user:42 300 '{...}' (5-minute TTL)." },
        { label: "Return response", detail: "Application returns the user data to the caller. Subsequent requests for user:42 will hit the cache." },
      ],
    },
    {
      title: "Write-Behind Flush Cycle",
      steps: [
        { label: "Writes arrive", detail: "Multiple updates to key user:42 arrive over 5 seconds. Each write updates Redis immediately and adds the key to the dirty set." },
        { label: "Timer fires", detail: "The background flusher wakes up on its 5-second interval and atomically reads and clears the dirty set." },
        { label: "Read latest values", detail: "The flusher reads the current value of each dirty key from Redis. Write coalescing happens naturally: only the latest value is read." },
        { label: "Batch write to database", detail: "The flusher performs a single batch UPSERT to the database with all dirty key-value pairs." },
        { label: "Cycle repeats", detail: "The dirty set starts accumulating new keys for the next flush cycle. If the flusher crashes, dirty keys may be lost." },
      ],
    },
  ],
  comparison: {
    columns: ["Strategy", "Read Latency", "Write Latency", "Consistency", "Complexity", "Best For"],
    rows: [
      ["Cache-Aside", "Miss: high, Hit: low", "Low (DB only)", "Eventually consistent", "Low", "General purpose, read-heavy"],
      ["Write-Through", "Always low (cache hit)", "High (cache + DB)", "Strong", "Medium", "Read-heavy with consistency needs"],
      ["Write-Behind", "Always low (cache hit)", "Very low (cache only)", "Weak (risk of data loss)", "High", "Write-heavy, loss-tolerant"],
      ["Read-Through", "Miss: high, Hit: low", "N/A (pair with write strategy)", "Eventually consistent", "Medium", "Simplifying app code"],
      ["Refresh-Ahead", "Consistently low for hot keys", "N/A (pair with write strategy)", "Eventually consistent", "Medium", "Latency-sensitive hot keys"],
      ["Cache Warming", "Low after warmup", "N/A", "As fresh as warm-up time", "Low", "Post-deployment cold cache"],
    ],
  },
  interviewQA: [
    {
      q: "What is cache-aside and why is it the most common caching pattern?",
      a: "Cache-aside puts the application in control: on read, check cache first, on miss load from DB and populate cache. On write, update DB then invalidate cache. It is the most common because it is simple to implement, works with any database, and only caches data that is actually requested (no cache pollution). The application has full visibility into cache behavior. The downside is that every cache miss pays full DB latency, and there is a brief inconsistency window between DB write and cache invalidation.",
      followUps: [
        "What happens if the cache invalidation fails after the DB write succeeds?",
        "How would you handle a cache miss thundering herd?",
      ],
    },
    {
      q: "When would you choose write-behind over write-through?",
      a: "Choose write-behind when write throughput matters more than consistency. Write-behind returns immediately after writing to cache, so the caller sees sub-millisecond write latency. The DB is updated asynchronously, which also enables write coalescing: 10 updates to the same key become 1 DB write. Use it for analytics counters, session updates, user activity tracking, or any data where losing a few seconds of writes on cache crash is acceptable. Never use it for financial transactions or data where loss is unacceptable.",
      followUps: [
        "How do you handle write-behind failures during the async flush?",
        "Can you implement write-behind with Redis Streams?",
      ],
    },
    {
      q: "Explain refresh-ahead and when it provides value.",
      a: "Refresh-ahead proactively reloads cache entries before they expire. When a read hits a key that has consumed more than, say, 80% of its TTL, the cache triggers an async background reload and returns the current (slightly stale) value immediately. The next read gets fresh data without a cache miss. It provides value for hot keys with strict latency SLAs: you eliminate the periodic spike where a key expires and the first reader pays full DB latency. It wastes resources on keys that expire without being re-accessed.",
    },
    {
      q: "How do you handle cache warming after a deployment?",
      a: "Three strategies: (1) Replay recent access logs to identify hot keys, load their values from the DB in batches, and populate the cache before routing traffic. (2) If the cache supports snapshots (Redis RDB/AOF), restore from a recent snapshot. (3) Use a canary deployment where a single instance takes traffic first, warming the shared cache before the full fleet rolls out. The key is to do this before the old cache is evicted and the new instances start serving requests, otherwise you get a thundering herd on the database.",
    },
  ],
  mcqs: [
    {
      q: "In cache-aside, when does the cache get populated?",
      options: [
        "On every database write",
        "On a cache miss during a read",
        "Periodically by a background job",
        "On application startup",
      ],
      answerIndex: 1,
      explanation: "Cache-aside is also called lazy loading because the cache is only populated when a read request results in a cache miss. The application loads from the database and then stores the result in the cache.",
    },
    {
      q: "What is the primary risk of write-behind caching?",
      options: [
        "Higher read latency due to cache misses",
        "Data loss if the cache node crashes before flushing to the database",
        "Cache pollution from unused keys",
        "Increased database write load",
      ],
      answerIndex: 1,
      explanation: "Write-behind buffers writes in the cache and flushes asynchronously. If the cache crashes before the flush completes, all unflushed writes are lost. This is the fundamental trade-off: lower write latency at the cost of durability.",
    },
    {
      q: "Which caching strategy is best paired with write-through to avoid cache pollution?",
      options: [
        "Write-behind",
        "Cache warming",
        "Read-through with TTL-based eviction",
        "Refresh-ahead",
      ],
      answerIndex: 2,
      explanation: "Write-through writes every update to the cache, which can fill it with rarely-read data. Pairing it with TTL-based eviction ensures unused entries expire. Read-through ensures the cache is also populated on reads, making the combination a fully transparent caching layer.",
    },
    {
      q: "What is write coalescing in write-behind caching?",
      options: [
        "Merging multiple sequential writes to the same key into a single database write",
        "Batching writes to different keys into a single database transaction",
        "Compressing cached values to save memory",
        "Combining read and write operations into a single cache call",
      ],
      answerIndex: 0,
      explanation: "When the same key is updated multiple times between flush intervals, the flusher only writes the latest value to the database. This naturally reduces database write load without any extra logic.",
    },
  ],
  flashcards: [
    { front: "What is cache-aside (lazy loading)?", back: "App checks cache on read. On miss, loads from DB, populates cache. On write, updates DB and invalidates cache. Only requested data is cached." },
    { front: "Write-through vs write-behind?", back: "Write-through: sync write to cache + DB (consistent but slow writes). Write-behind: async write to cache only, background flush to DB (fast writes but risk of data loss)." },
    { front: "What is read-through?", back: "The cache itself loads from the DB on a miss, transparently. The application always reads from the cache and never talks to the DB directly for reads." },
    { front: "What is refresh-ahead?", back: "Proactively reload cache entries before TTL expires (e.g., at 80% of TTL). Returns current value immediately, triggers async reload. Eliminates miss latency for hot keys." },
    { front: "What is cache warming?", back: "Pre-populating the cache with hot data before traffic hits (after deploy, restart, failover). Prevents thundering herd on a cold cache." },
    { front: "What is write coalescing?", back: "A benefit of write-behind: multiple updates to the same key between flush intervals are merged into a single DB write, reducing DB load." },
    { front: "When is write-behind dangerous?", back: "When data loss is unacceptable (financial transactions). Cache crash before flush = lost writes. Only use for loss-tolerant data like analytics or sessions." },
    { front: "Multi-tier caching pattern?", back: "L1 in-process (ms TTL) -> L2 distributed Redis (minute TTL) -> Database. Reduces network hops for ultra-hot data." },
  ],
  revisionNotes: [
    "Cache-aside: app controls cache, lazy load on miss, invalidate on write. Most common pattern.",
    "Write-through: both cache and DB updated on write. Strong consistency, higher write latency.",
    "Write-behind: cache updated immediately, DB updated async. Fastest writes, risk of data loss.",
    "Read-through: cache loads from DB transparently on miss. Simplifies app code.",
    "Refresh-ahead: async reload before TTL expires. Eliminates miss spikes for hot keys.",
    "Cache warming: pre-populate after deploy/restart. Critical for avoiding cold-cache stampede.",
    "Strategy choice depends on read/write ratio, consistency requirements, and latency SLAs.",
    "Multi-tier (L1 + L2) reduces network round-trips for the hottest data.",
    "Write coalescing in write-behind reduces DB writes when the same key is updated repeatedly.",
  ],
  cheatSheet: [
    "Cache-aside = lazy load on miss + invalidate on write. Default choice.",
    "Write-through = sync write to cache + DB. Use when cache must always be fresh.",
    "Write-behind = async flush. Use for counters, analytics, sessions. Never for money.",
    "Read-through = cache loads from DB on miss. Pair with write-through for full transparency.",
    "Refresh-ahead factor = 0.7-0.8 of TTL. Only benefits hot keys.",
    "Warm cache before rolling deploy. Replay access logs or restore from snapshot.",
    "L1 (in-process, ms TTL) + L2 (Redis, min TTL) = multi-tier.",
    "Write coalescing: N writes to same key = 1 DB write. Free win with write-behind.",
  ],
  resources: [
    { label: "AWS ElastiCache Caching Strategies", kind: "docs", note: "Official AWS documentation covering lazy loading, write-through, and TTL strategies with ElastiCache." },
    { label: "Designing Data-Intensive Applications by Martin Kleppmann", kind: "book", note: "Chapter 5 covers replication and caching. Essential reading on consistency trade-offs." },
    { label: "Redis Documentation on Persistence", kind: "docs", note: "Understanding RDB and AOF is critical for write-behind durability guarantees." },
    { label: "Caching at Scale with Spring by Netflix", kind: "video", note: "Netflix's EVCache architecture and multi-tier caching strategy." },
    { label: "Facebook's Scaling Memcache paper (NSDI 2013)", kind: "paper", note: "Covers cache-aside at Facebook scale, including lease-based thundering herd prevention." },
    { label: "node-cache-manager", kind: "repo", note: "Multi-tier caching library for Node.js supporting in-memory, Redis, and custom stores." },
  ],
  glossary: [
    { term: "Cache-Aside", definition: "A caching pattern where the application manages the cache: checking it on reads, populating it on misses, and invalidating it on writes." },
    { term: "Write-Through", definition: "A caching pattern where every write is applied to both the cache and the database synchronously before returning to the caller." },
    { term: "Write-Behind (Write-Back)", definition: "A caching pattern where writes go to the cache only, and a background process asynchronously flushes changes to the database." },
    { term: "Read-Through", definition: "A caching pattern where the cache itself loads data from the database on a miss, transparently to the application." },
    { term: "Refresh-Ahead", definition: "A proactive caching strategy that reloads entries before their TTL expires, triggered when a read hits a key past a configurable age threshold." },
    { term: "Cache Warming", definition: "Pre-populating a cache with expected hot data before live traffic arrives, typically after deployments or restarts." },
    { term: "Write Coalescing", definition: "The merging of multiple writes to the same cache key into a single database write during the async flush cycle of write-behind caching." },
    { term: "Cache Pollution", definition: "When infrequently accessed data occupies cache space, reducing hit rates for actually hot data." },
    { term: "Stale-While-Revalidate", definition: "A pattern (from HTTP caching) where a stale cached value is served immediately while a fresh value is fetched in the background." },
  ],
};
