import type { TopicContent } from "../types";

export const designUrlShortener: TopicContent = {
  quickSummary: [
    "A URL shortener maps a long URL to a short key (e.g., bit.ly/abc123), stores the mapping, and redirects users who visit the short URL. The core challenge is generating unique, compact short keys at scale.",
    "Base62 encoding (a-z, A-Z, 0-9) converts a numeric ID into a compact string. A 7-character base62 key provides 62^7 = ~3.5 trillion unique URLs, sufficient for most use cases.",
    "Key generation strategies include: auto-incrementing ID + base62, pre-generated key service (KGS), random generation with collision checking, or hash-based (MD5/SHA256 truncation). Each has trade-offs in uniqueness, predictability, and distributed scalability.",
    "The read path (redirect) must be extremely fast. Use a cache (Redis) in front of the database to serve popular short URLs with sub-millisecond latency. Use 301 (permanent) or 302 (temporary) redirects based on whether you need analytics.",
  ],
  detailed: [
    "## Requirements and Estimation\n\nFunctional: create short URL from long URL, redirect short URL to long URL, optional custom aliases, optional expiration, click analytics. Non-functional: low latency redirects (<100ms), high availability (redirects must never fail), eventual consistency is acceptable for analytics. Scale: assume 100M new URLs/month = ~40 URLs/second write, 100:1 read-to-write ratio = 4000 redirects/second. Storage: 100M URLs/month x 12 months x 5 years x 500 bytes = ~300GB. Cache: 20% of daily reads, ~4000 QPS x 86400 / 5 x 500B = ~35GB fits in one Redis node.",
    "## Key Generation Approaches\n\n**Auto-increment + Base62**: use a global counter, convert each number to base62. Simple but creates a single point of failure and keys are predictable (sequential). Mitigate with multiple counter ranges (server 1 gets odd numbers, server 2 gets even). **Pre-generated Key Service (KGS)**: a service pre-generates random keys and stores them in a database with two tables: unused_keys and used_keys. When a new URL is created, take a key from unused_keys and move it to used_keys. The KGS can pre-load keys into memory for fast allocation. If a KGS server dies, those in-memory keys are lost (acceptable since the key space is huge). **Hash-based**: compute MD5 or SHA256 of the long URL, take the first 7 characters. Collisions are possible; check the database and rehash or append a counter. **Random**: generate a random 7-character base62 string, check for collision, retry. Collision probability is low with 3.5 trillion possible keys but increases over time.",
    "## System Architecture\n\n**Write path**: Client sends long URL to the API server. API server calls the Key Generation Service to get a unique short key. The mapping (shortKey -> longURL, createdAt, expiresAt, userId) is stored in a database (NoSQL like DynamoDB for simple key-value lookups, or PostgreSQL). The short URL is returned. **Read path**: User visits short.url/abc123. The API server checks Redis cache for the key. Cache hit: redirect immediately. Cache miss: query database, populate cache, redirect. Use an LRU eviction policy. **Analytics**: on each redirect, publish a click event (timestamp, short key, referrer, user agent, IP) to Kafka. A separate analytics service consumes events and aggregates them into a data warehouse. This keeps the redirect path fast by offloading analytics to an async pipeline.",
    "## 301 vs 302 Redirects\n\nHTTP 301 (Moved Permanently) tells the browser to cache the redirect and never hit the server again for that URL. Reduces server load but prevents click tracking since subsequent visits go directly to the destination. HTTP 302 (Found/Temporary) tells the browser to check with the server every time, enabling click analytics but increasing server load. Most URL shorteners use 302 because analytics (click counts, geographic distribution, referrer tracking) are a core feature. If analytics are not needed and you want to minimize load, use 301.",
    "## Scaling and Reliability\n\n**Database scaling**: partition by the first character(s) of the short key for even distribution. With base62, you can have 62 partitions. **Cache scaling**: use a Redis cluster with consistent hashing. Hot keys (viral URLs) might need special handling (local caching on app servers). **Rate limiting**: prevent abuse by limiting URL creation per user/IP. **Expiration**: a background job periodically scans for expired URLs and removes them, returning keys to the pool. **Custom aliases**: check the database for uniqueness before accepting. Store in the same table with a flag. **High availability**: replicate the database (primary-replica), run multiple app servers behind a load balancer, and ensure the KGS has standby instances.",
  ],
  interviewQA: [
    {
      q: "Why is base62 used instead of base64 for URL shortening?",
      a: "Base62 uses a-z, A-Z, and 0-9, which are all URL-safe characters. Base64 includes '+' and '/' which have special meanings in URLs and would need percent-encoding, making the short URL longer and less clean. Base62 avoids this while still providing a large key space: 62^7 = ~3.5 trillion unique keys. Some implementations use base58, further removing visually ambiguous characters (0, O, I, l) to prevent user confusion.",
    },
    {
      q: "How would you handle the case where two users shorten the same long URL?",
      a: "Two approaches: (1) Give each request a unique short URL. This is simpler, avoids looking up existing URLs, and lets each user have their own analytics. The trade-off is slightly more storage. (2) Return the same short URL for identical long URLs. This requires a secondary index on the long URL to check for existence, adding read latency on writes. Most real-world shorteners (bit.ly, TinyURL) use approach 1 because analytics per link are a core feature, and storage is cheap.",
    },
    {
      q: "How does the Key Generation Service (KGS) work in a distributed environment?",
      a: "The KGS pre-generates millions of random 7-character keys and stores them in a database with two tables: unused_keys and used_keys. Multiple KGS servers each load a batch of keys (e.g., 10,000) into memory from unused_keys using a SELECT-and-DELETE transaction. Each server hands out keys from its in-memory batch without database calls. When the batch is exhausted, it loads another batch. If a KGS server crashes, those in-memory keys are wasted but the key space is so large this is negligible. Concurrency between KGS servers is handled at the database level (each batch is exclusively claimed).",
    },
    {
      q: "How would you add click analytics without slowing down redirects?",
      a: "Use an async pipeline. On each redirect, the app server publishes a lightweight click event (shortKey, timestamp, IP, user-agent, referrer) to Kafka. The redirect returns immediately without waiting for the event to be processed. A separate analytics consumer reads from Kafka, enriches events (geo-lookup from IP, device parsing from user-agent), and writes aggregated data to a data warehouse or time-series database. Users query analytics through a separate API that reads from the warehouse. This decouples the latency-critical redirect from the data-intensive analytics processing.",
    },
  ],
  mcqs: [
    {
      q: "How many unique URLs can a 7-character base62 key represent?",
      options: [
        "~7 million",
        "~280 million",
        "~3.5 trillion",
        "~1 quadrillion",
      ],
      answerIndex: 2,
      explanation:
        "62^7 = 3,521,614,606,208, which is approximately 3.5 trillion. This is more than sufficient for virtually any URL shortening use case.",
    },
    {
      q: "Which HTTP redirect status code should a URL shortener use if click analytics are important?",
      options: [
        "301 Moved Permanently",
        "302 Found",
        "304 Not Modified",
        "307 Temporary Redirect",
      ],
      answerIndex: 1,
      explanation:
        "302 causes the browser to contact the server on every visit, allowing click tracking. 301 tells the browser to cache the redirect and skip the server on future visits, preventing analytics.",
    },
    {
      q: "What is the primary advantage of a Key Generation Service (KGS) over hash-based key generation?",
      options: [
        "KGS produces shorter keys",
        "KGS guarantees uniqueness without collision checking",
        "KGS is faster to compute",
        "KGS works only with SQL databases",
      ],
      answerIndex: 1,
      explanation:
        "KGS pre-generates unique keys, so there is no possibility of collision at the time of URL creation. Hash-based approaches can produce collisions when two different URLs hash to the same key prefix.",
    },
    {
      q: "Why partition the URL database by the first character of the short key?",
      options: [
        "It ensures alphabetical ordering of URLs",
        "Base62 characters distribute roughly evenly, giving balanced partitions",
        "It enables faster hash computation",
        "It is required by NoSQL databases",
      ],
      answerIndex: 1,
      explanation:
        "If keys are generated randomly, each base62 character appears with roughly equal probability. Partitioning by the first character gives ~62 partitions with approximately equal data, enabling horizontal scaling.",
    },
  ],
  flashcards: [
    {
      front: "What is base62 encoding?",
      back: "An encoding using 62 characters: a-z (26), A-Z (26), 0-9 (10). Used in URL shorteners because all characters are URL-safe. A 7-character base62 string encodes ~3.5 trillion unique values.",
    },
    {
      front: "What are the key generation strategies for URL shorteners?",
      back: "1. Auto-increment ID + base62 conversion. 2. Pre-generated Key Service (KGS) with unused/used key tables. 3. Hash-based (MD5/SHA256 truncated to 7 chars, collision check). 4. Random generation with collision check. KGS is most commonly recommended.",
    },
    {
      front: "What is the difference between 301 and 302 redirects?",
      back: "301 (Permanent): browser caches the redirect and never contacts the server again. Reduces load but prevents analytics. 302 (Temporary): browser contacts the server every time, enabling click tracking. Most shorteners use 302.",
    },
    {
      front: "How do you handle URL shortener analytics at scale?",
      back: "Async pipeline: on redirect, publish click event to Kafka (shortKey, timestamp, IP, user-agent, referrer). A separate consumer enriches and aggregates events into a data warehouse. Redirect returns immediately, analytics are eventually consistent.",
    },
    {
      front: "How much storage does a URL shortener need for 5 years?",
      back: "At 100M URLs/month: 100M x 12 x 5 = 6B URLs. At ~500 bytes per record (short key + long URL + metadata): 6B x 500B = ~3TB. Easily handled by a sharded database or a distributed key-value store.",
    },
    {
      front: "What is a Key Generation Service (KGS)?",
      back: "A dedicated service that pre-generates random unique short keys. Keys are stored in unused_keys table. KGS servers load batches into memory and hand them out without DB calls. Used keys move to used_keys table. Guarantees uniqueness without collision checking at write time.",
    },
    {
      front: "How do you handle custom aliases in a URL shortener?",
      back: "Check if the alias already exists in the database. If available, store it like any other short key with a custom flag. If taken, return an error. Custom aliases should be validated: allowed characters, length limits, not on a blocked list. They are stored in the same table as generated keys.",
    },
  ],
  deepDive: [
    "**Understanding Base62 Encoding and Key Space Trade-offs**\n\nAt the heart of every URL shortener lies the *key generation mechanism*, and **base62 encoding** is the most widely adopted approach. Base62 maps integers to a compact alphanumeric representation using the character set `a-z`, `A-Z`, `0-9`. The encoding works by repeatedly dividing the number by 62 and mapping each remainder to a character. A **7-character key** yields `62^7 ≈ 3.5 trillion` unique combinations, while a **6-character key** gives `62^6 ≈ 56.8 billion`. The choice of key length is a *capacity planning decision*: shorter keys are more user-friendly but exhaust sooner. In practice, systems like **bit.ly** use 7 characters, providing decades of runway at high throughput. An important subtlety is **key predictability** — if you use a sequential counter fed into base62, an attacker can enumerate all URLs by incrementing the counter. Mitigations include *salting the counter*, using a **bijective shuffle** (e.g., Knuth multiplicative hashing), or switching to a **pre-generated key service (KGS)** that emits random keys.",
    "**Database Design and Caching Strategy**\n\nThe URL mapping store must handle two distinct workloads: *low-latency reads* (redirects) and *moderate-throughput writes* (URL creation). A **NoSQL key-value store** like DynamoDB or MongoDB is a natural fit because the access pattern is a simple `GET(shortKey) → longURL` lookup with no complex joins. The schema is straightforward: `{ shortKey: string, longURL: string, createdAt: Date, expiresAt?: Date, userId?: string, clickCount?: number }`. For the **caching layer**, Redis sits in front of the database using an **LRU eviction policy**. The *cache-aside* pattern is standard: on a read miss, fetch from the database, populate the cache, then redirect. A critical concern is **cache stampede** on popular URLs — when a hot key expires, thousands of concurrent requests hit the database simultaneously. Solutions include *probabilistic early expiration* (refresh the cache slightly before TTL), **request coalescing** (only one request fetches from DB while others wait), or using a *lock-based approach* with `SETNX` in Redis. Cache sizing follows the **80/20 rule**: caching 20% of daily traffic typically covers 80% of requests.",
    "**Distributed Key Generation and Consistency**\n\nIn a *multi-datacenter deployment*, key uniqueness becomes a distributed systems problem. The **KGS approach** handles this elegantly: a central service pre-generates millions of random keys and stores them in an `unused_keys` table. Each application server requests a **batch** (e.g., 10,000 keys) via an atomic `SELECT ... FOR UPDATE` followed by a `DELETE`, moving those keys to a `used_keys` table. Servers hand out keys from their in-memory batch with *zero database calls per URL creation*. If a server crashes, those in-memory keys are lost — an acceptable trade-off given the enormous key space. An alternative is **range-based allocation**: assign each server a non-overlapping ID range (server 1 gets 1-1M, server 2 gets 1M-2M, etc.) managed by a **ZooKeeper** or **etcd** coordinator. Each server independently converts its allocated IDs to base62 without any cross-server coordination. For **global consistency**, the redirect path only requires *read-after-write consistency* within the same datacenter where the URL was created. Cross-datacenter replication can be **asynchronous** with a small window where a newly created URL is not yet available in other regions — mitigated by routing the first redirect to the creation datacenter using a hint in the short key prefix.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Node.js/Express URL Shortener with MongoDB — complete API with create and redirect endpoints",
      source: `const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");

// --- MongoDB Schema ---
const urlSchema = new mongoose.Schema({
  shortKey: { type: String, required: true, unique: true, index: true },
  longURL: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  clickCount: { type: Number, default: 0 },
});

const URLModel = mongoose.model("URL", urlSchema);

// --- Base62 Encoding ---
const BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function toBase62(num) {
  if (num === 0) return BASE62_CHARS[0];
  let result = "";
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

// --- Generate a unique 7-character short key ---
async function generateShortKey() {
  // Use a random 48-bit integer and encode to base62
  const randomBytes = crypto.randomBytes(6);
  const num = randomBytes.readUIntBE(0, 6);
  const key = toBase62(num).padStart(7, "a").slice(0, 7);

  // Check for collision
  const existing = await URLModel.findOne({ shortKey: key });
  if (existing) return generateShortKey(); // retry on collision
  return key;
}

// --- Express App ---
const app = express();
app.use(express.json());

// POST /api/shorten — Create a short URL
app.post("/api/shorten", async (req, res) => {
  try {
    const { longURL, expiresAt } = req.body;
    if (!longURL) return res.status(400).json({ error: "longURL is required" });

    const shortKey = await generateShortKey();
    const doc = await URLModel.create({ shortKey, longURL, expiresAt });

    res.status(201).json({
      shortURL: \`https://short.url/\${doc.shortKey}\`,
      shortKey: doc.shortKey,
      longURL: doc.longURL,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:shortKey — Redirect to the original URL
app.get("/:shortKey", async (req, res) => {
  try {
    const doc = await URLModel.findOneAndUpdate(
      { shortKey: req.params.shortKey },
      { $inc: { clickCount: 1 } }  // increment analytics counter
    );
    if (!doc) return res.status(404).json({ error: "Short URL not found" });
    if (doc.expiresAt && doc.expiresAt < new Date()) {
      return res.status(410).json({ error: "Short URL has expired" });
    }
    // 302 redirect to enable click tracking
    res.redirect(302, doc.longURL);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Start ---
mongoose.connect("mongodb://localhost:27017/urlshortener").then(() => {
  app.listen(3000, () => console.log("URL shortener running on port 3000"));
});`,
    },
    {
      language: "cpp",
      caption: "C++ Base62 Encoding and Decoding — efficient conversion between numeric IDs and short keys",
      source: `#include <string>
#include <algorithm>
#include <stdexcept>
#include <cstdint>

// Base62 character set: a-z, A-Z, 0-9
static const std::string BASE62_CHARS =
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789";

// Encode a 64-bit unsigned integer to a base62 string
std::string toBase62(uint64_t num) {
    if (num == 0) return std::string(1, BASE62_CHARS[0]);

    std::string result;
    result.reserve(11);  // max 11 chars for uint64_t in base62

    while (num > 0) {
        result += BASE62_CHARS[num % 62];
        num /= 62;
    }

    // Digits are produced in reverse order
    std::reverse(result.begin(), result.end());
    return result;
}

// Decode a base62 string back to a 64-bit unsigned integer
uint64_t fromBase62(const std::string& encoded) {
    uint64_t result = 0;

    for (char c : encoded) {
        size_t pos = BASE62_CHARS.find(c);
        if (pos == std::string::npos) {
            throw std::invalid_argument("Invalid base62 character: " + std::string(1, c));
        }
        // Check for overflow before multiplication
        if (result > (UINT64_MAX - pos) / 62) {
            throw std::overflow_error("Base62 value exceeds uint64_t range");
        }
        result = result * 62 + pos;
    }

    return result;
}

// Pad the base62 string to a fixed length (e.g., 7 characters)
std::string toBase62Padded(uint64_t num, size_t width = 7) {
    std::string encoded = toBase62(num);
    if (encoded.size() < width) {
        // Pad with 'a' (represents 0) on the left
        encoded.insert(0, width - encoded.size(), BASE62_CHARS[0]);
    }
    return encoded.substr(0, width);
}

// Example usage:
// toBase62(123456789)       -> "8m0Kx"
// fromBase62("8m0Kx")       -> 123456789
// toBase62Padded(123456789) -> "aa8m0Kx"`,
    },
    {
      language: "javascript",
      caption: "Redis Cache Layer for URL Shortener — cache-aside pattern with stampede protection",
      source: `const Redis = require("ioredis");
const redis = new Redis({ host: "localhost", port: 6379 });

const CACHE_TTL = 3600; // 1 hour in seconds
const LOCK_TTL = 5;     // lock expiry for stampede protection

/**
 * Resolve a short key to a long URL with Redis cache-aside pattern.
 * Includes cache stampede protection using SETNX-based locking.
 */
async function resolveURL(shortKey, dbLookup) {
  // Step 1: Check the cache
  const cached = await redis.get(\`url:\${shortKey}\`);
  if (cached) {
    return cached;  // Cache hit — fast path
  }

  // Step 2: Cache miss — acquire a lock to prevent stampede
  const lockKey = \`lock:url:\${shortKey}\`;
  const acquired = await redis.set(lockKey, "1", "EX", LOCK_TTL, "NX");

  if (!acquired) {
    // Another request is fetching — wait briefly and retry
    await new Promise((r) => setTimeout(r, 50));
    return resolveURL(shortKey, dbLookup);
  }

  try {
    // Step 3: Fetch from database
    const longURL = await dbLookup(shortKey);
    if (!longURL) return null;

    // Step 4: Populate cache with TTL
    await redis.setex(\`url:\${shortKey}\`, CACHE_TTL, longURL);
    return longURL;
  } finally {
    // Release the lock
    await redis.del(lockKey);
  }
}

// Usage in Express route:
// app.get("/:shortKey", async (req, res) => {
//   const longURL = await resolveURL(req.params.shortKey, (key) =>
//     URLModel.findOne({ shortKey: key }).then((doc) => doc?.longURL)
//   );
//   if (!longURL) return res.status(404).send("Not found");
//   res.redirect(302, longURL);
// });`,
    },
  ],
  diagrams: [
    {
      title: "URL Shortener System Architecture",
      kind: "architecture",
      caption: "Write path handles URL creation via KGS. Read path serves redirects through a Redis cache with DB fallback. Analytics events are published asynchronously to Kafka.",
      mermaid: `graph TB
    CLIENT["Client or Browser"]
    LB["Load Balancer"]
    API["API Servers"]
    KGS["Key Generation Service"]
    REDIS["Redis Cache - LRU"]
    DB["MongoDB - URL Mappings"]
    KAFKA["Kafka - Click Events"]
    ANALYTICS["Analytics Consumer"]
    DW["Data Warehouse"]
    CLIENT --> LB
    LB --> API
    API -->|get unique key| KGS
    KGS -->|batch allocate| DB
    API -->|store mapping| DB
    API -->|cache lookup| REDIS
    REDIS -.->|cache miss| DB
    API -->|publish click event| KAFKA
    KAFKA --> ANALYTICS
    ANALYTICS --> DW`,
    },
    {
      title: "URL Redirect Read Path",
      kind: "sequence",
      caption: "On redirect request, the API checks Redis first. On cache miss it queries MongoDB, populates the cache, issues a 302 redirect, and publishes a click event asynchronously.",
      mermaid: `sequenceDiagram
    participant User
    participant API as API Server
    participant Cache as Redis Cache
    participant DB as MongoDB
    participant MQ as Kafka
    User->>API: GET /abc123
    API->>Cache: GET url:abc123
    Cache-->>API: cache miss
    API->>DB: find shortKey abc123
    DB-->>API: longURL
    API->>Cache: SETEX url:abc123 longURL TTL
    API-->>User: 302 Redirect to longURL
    API->>MQ: publish click event async`,
    },
    {
      title: "Key Generation Strategies",
      kind: "flow",
      caption: "Decision tree for choosing a key generation approach based on uniqueness guarantees and deployment environment.",
      mermaid: `flowchart TD
    A[Need a short key] --> B{Multi-server environment?}
    B -->|Yes| C[Key Generation Service - KGS]
    B -->|No| D{Predictability acceptable?}
    C --> E[Pre-generate keys in batches]
    E --> F[Each server pulls batch of keys]
    D -->|Yes| G[Auto-increment ID plus Base62 encode]
    D -->|No| H[Random Base62 with DB uniqueness check]
    H --> I{Collision?}
    I -->|Yes| H
    I -->|No| J[Key assigned]
    G --> J
    F --> J`,
    },
    {
      title: "URL Shortener Data Flow Network",
      kind: "network",
      caption: "Network of components showing write and read data flows across client, servers, cache, storage, and analytics.",
      mermaid: `graph LR
    C["Client"]
    LB["Load Balancer"]
    API1["API Server 1"]
    API2["API Server 2"]
    REDIS["Redis Cache"]
    MONGO["MongoDB"]
    KGS["Key Gen Service"]
    KAFKA["Kafka"]
    DW["Data Warehouse"]
    C --> LB
    LB --> API1
    LB --> API2
    API1 --> REDIS
    API2 --> REDIS
    REDIS --> MONGO
    API1 --> KGS
    API2 --> KGS
    KGS --> MONGO
    API1 --> KAFKA
    KAFKA --> DW`,
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Auto-Increment + Base62",
      "Pre-Generated KGS",
      "Hash-Based (MD5/SHA256)",
      "Random + Collision Check",
    ],
    rows: [
      [
        "**Uniqueness**",
        "Guaranteed (sequential IDs)",
        "Guaranteed (pre-allocated)",
        "Not guaranteed (collisions possible)",
        "Not guaranteed (collisions possible)",
      ],
      [
        "**Predictability**",
        "*High* — keys are sequential",
        "*Low* — keys are random",
        "*Low* — hash output is random",
        "*Low* — fully random",
      ],
      [
        "**Write Latency**",
        "Low (counter increment)",
        "Very low (in-memory batch)",
        "Medium (hash + collision check)",
        "Medium (generate + collision check)",
      ],
      [
        "**Distributed Scalability**",
        "Hard — counter is a bottleneck",
        "Excellent — batch allocation",
        "Good — stateless computation",
        "Good — stateless generation",
      ],
      [
        "**Complexity**",
        "Simple",
        "Moderate (KGS infrastructure)",
        "Simple",
        "Simple",
      ],
      [
        "**Failure Mode**",
        "Counter server crash = no writes",
        "Server crash = lost batch (acceptable)",
        "Collision storm under high load",
        "Collision probability grows over time",
      ],
    ],
  },
  exercises: [
    "**Design a Rate Limiter for URL Creation**: Implement a *token bucket* or *sliding window* rate limiter that restricts each user to **100 URL creations per hour**. Consider how to handle unauthenticated users (rate limit by IP) vs. authenticated users (rate limit by `userId`). Store rate limit counters in **Redis** using `INCR` and `EXPIRE`.",
    "**Implement URL Expiration with Lazy + Active Deletion**: Design a system where URLs can have an optional `expiresAt` field. Implement *lazy deletion* (check expiry on read and return 410 Gone) combined with *active deletion* (a background cron job that scans for expired URLs every hour and reclaims their keys back to the KGS `unused_keys` pool). Estimate the throughput of the cleanup job.",
    "**Build a Custom Alias Feature with Validation**: Extend the URL shortener to support **custom aliases** (e.g., `short.url/my-brand`). Implement validation rules: minimum 3 characters, maximum 30 characters, only `a-z`, `0-9`, and hyphens allowed, must not start/end with a hyphen, must not collide with reserved words (`api`, `admin`, `health`, `static`). Handle the race condition where two users request the same alias simultaneously.",
    "**Design the Analytics Dashboard Backend**: Build the backend for a URL analytics dashboard that shows: *total clicks*, *unique visitors* (by IP), *clicks over time* (hourly/daily/weekly), *top referrers*, *geographic distribution* (from IP geolocation), and *device breakdown* (from User-Agent parsing). Use **Kafka** for event ingestion and a **time-series database** (e.g., TimescaleDB) for storage. Design the API endpoints and consider query performance at scale.",
    "**Multi-Region Deployment Strategy**: Design a URL shortener that operates across **3 geographic regions** (US, EU, Asia). Address: (1) How to partition the key space so no two regions generate the same key, (2) How to replicate URL mappings so a URL created in the US can be resolved in Asia with *<50ms added latency*, (3) How to handle the *consistency window* during replication, and (4) How to route users to the nearest region using **GeoDNS**.",
  ],
  cheatSheet: [
    "**Key space**: `62^7 ≈ 3.5 trillion` unique keys with 7-character base62 encoding. At 100M URLs/month, this lasts **~2,900 years** — key exhaustion is *never* the bottleneck.",
    "**Storage estimate**: `100M URLs/month × 12 × 5 years × 500 bytes ≈ 3TB`. Use **range-based sharding** on the short key's first character for ~62 even partitions.",
    "**Cache sizing**: Apply the **80/20 rule** — cache 20% of daily URLs. At 4,000 QPS redirects, that is `4000 × 86400 × 0.2 × 500B ≈ 35GB`, fitting in a single **Redis** node.",
    "**Redirect choice**: Use `302 Found` for **analytics** (browser hits server every time). Use `301 Moved Permanently` to **reduce load** (browser caches redirect). Most shorteners use *302*.",
    "**KGS batch size**: Each app server pre-loads **10,000 keys** into memory. At 40 writes/sec per server, a batch lasts ~4 minutes. Lost keys on crash are negligible vs. 3.5T total key space.",
    "**Read-to-write ratio**: Typically **100:1** or higher. The system is *read-heavy*, so optimize the redirect path first: Redis cache → DB fallback → 302 redirect. Writes can tolerate higher latency.",
  ],
  revisionNotes: [
    "A URL shortener is fundamentally a **key-value mapping service** with a *write-light, read-heavy* workload. The three core decisions are: **key generation strategy** (KGS recommended for distributed systems), **storage engine** (NoSQL for simple lookups), and **caching layer** (Redis with LRU eviction). Always clarify the **redirect type** (301 vs. 302) based on analytics requirements.",
    "**Capacity estimation** is a critical part of the interview answer. Memorize the key numbers: `62^7 = 3.5T keys`, `100M URLs/month` as a reasonable scale, `100:1 read-to-write ratio = 4,000 QPS redirects`, `~3TB storage for 5 years`, `~35GB cache for 20% of daily traffic`. These demonstrate quantitative thinking.",
    "The **KGS pattern** is the preferred key generation approach in interviews. It *eliminates collision checking at write time*, works seamlessly in distributed environments via batch allocation, and tolerates server failures gracefully. Mention the `unused_keys` / `used_keys` table split and the atomic batch claim operation.",
    "For the **analytics pipeline**, always describe an *asynchronous design*: redirect returns immediately, click event is published to **Kafka**, consumed by a separate service, and aggregated into a **data warehouse**. This *decouples latency-critical redirects from data-intensive analytics*. Never block the redirect on analytics writes.",
    "**Common follow-up topics** to prepare: custom aliases (uniqueness check + reserved word blocklist), URL expiration (lazy + active deletion), rate limiting (token bucket per user/IP in Redis), abuse prevention (blocklist of malicious destinations, link preview/scanning), and **multi-region deployment** (key partitioning by region prefix, GeoDNS routing, async cross-region replication).",
  ],
  glossary: [
    {
      term: "Base62 Encoding",
      definition:
        "An encoding scheme using 62 alphanumeric characters (a-z, A-Z, 0-9) to represent numbers compactly. URL-safe without requiring percent-encoding.",
    },
    {
      term: "Key Generation Service (KGS)",
      definition:
        "A dedicated service that pre-generates unique short keys in advance, storing them for fast allocation when new URLs are created. Eliminates collision concerns.",
    },
    {
      term: "301 Redirect",
      definition:
        "HTTP status indicating a permanent redirect. Browsers cache this and do not contact the original URL again, reducing server load but preventing click tracking.",
    },
    {
      term: "302 Redirect",
      definition:
        "HTTP status indicating a temporary redirect. Browsers contact the server on every request, enabling analytics but increasing server load.",
    },
    {
      term: "Short Key",
      definition:
        "The unique identifier in a shortened URL (the 'abc123' in short.url/abc123). Typically 6-8 characters using base62 encoding.",
    },
    {
      term: "Click Analytics",
      definition:
        "Tracking and aggregating data about redirect events: total clicks, unique visitors, geographic distribution, referrers, devices, and time-series trends.",
    },
    {
      term: "Cache Stampede",
      definition:
        "When a popular cache entry expires and many simultaneous requests hit the database. Mitigated with locking, probabilistic early refresh, or background refresh.",
    },
  ],
};
