import type { TopicContent } from "../types";

export const designPastebin: TopicContent = {
  quickSummary: [
    "Pastebin is a content-sharing service where users create text pastes with unique short URLs — the system is heavily read-biased (5:1 read-to-write ratio) with millions of pastes, making caching and CDN strategies critical for performance.",
    "Unique URL generation uses either a Key Generation Service (KGS) that pre-generates base62 keys in bulk, or on-demand base62 encoding of auto-increment IDs — KGS avoids hot-path contention while on-demand encoding is simpler but creates a single-writer bottleneck.",
    "Paste expiration requires a background cleanup service with TTL-based deletion — active expiration scans are expensive, so lazy expiration (check TTL on read, delete if expired) combined with periodic batch cleanup is the practical approach.",
    "Access control (public, unlisted, private) maps to different URL resolution paths: public pastes are indexed and cached aggressively, unlisted pastes have unguessable URLs but no authentication, and private pastes require user authentication and are never cached in shared CDN layers.",
    "Abuse prevention combines rate limiting (token bucket per IP and per user), content scanning for malware/phishing patterns, CAPTCHA on creation, and size limits per paste (typically 512KB-10MB) to prevent the service from being used as a free file host or malware distribution platform.",
  ],
  detailed: [
    "## Core Architecture and Data Model\nPastebin's data model is simple: each paste has a unique key (8-character alphanumeric string), content (text blob), metadata (creation time, expiration, visibility, language for syntax highlighting, author), and access statistics. The content itself should be stored separately from metadata because reads often need only metadata (for listings) while content is large and fetched on demand. A typical deployment uses a relational database (PostgreSQL) for metadata and an object store (S3) or distributed file system for content blobs. The metadata table is small — millions of rows at ~200 bytes each is under 1 GB — making it easy to cache entirely in Redis. Content blobs average 5-10 KB but can be up to 10 MB, so they benefit from CDN caching for popular pastes. The write path creates metadata in the database and uploads content to the object store in a single transaction-like operation, using the pre-generated key as the object key. Read path first checks Redis for metadata (cache hit rate >95% for recent pastes), then fetches content from CDN/object store.",

    "## URL Generation and Key Management\nThe unique URL is the identity of a paste, and generating collision-free, unguessable, short keys at scale is a core design decision. A Key Generation Service (KGS) pre-generates millions of random base62 keys (a-z, A-Z, 0-9) and stores them in a database with two tables: unused_keys and used_keys. When a paste is created, the application server requests a batch of keys (e.g., 1000) from KGS, caches them in memory, and assigns one per paste. This approach eliminates contention on key generation during paste creation — the hot path is just popping from a local in-memory list. The alternative is encoding an auto-increment ID to base62: ID 1000000 becomes 'q0U8' in base62. This is simpler but creates a sequential, guessable pattern and requires a centralized ID generator. With 8 characters of base62, you get 62^8 = 218 trillion possible keys — more than enough for any paste service. Key uniqueness is guaranteed by the KGS database constraint, and pre-generation means key creation is off the critical path.",

    "## Expiration, Cleanup, and Storage Management\nPastes can have explicit expiration times (10 minutes, 1 hour, 1 day, 1 week, 1 month, never) or be set to never expire. The expiration system must handle both efficiently. Lazy expiration checks the expiration timestamp on every read — if expired, return 404 and queue for deletion. This handles the common case with zero background cost. Active expiration runs as a periodic batch job (every 5-10 minutes) that queries for expired pastes and deletes them from both the metadata store and the content store. Using a TTL index in the database (or Redis EXPIREAT for cached entries) makes this query efficient. Storage management is important because 'never expire' pastes accumulate indefinitely — a monthly cleanup of pastes with zero reads in the last 6 months (and no explicit 'never expire' flag from paid users) prevents unbounded growth. Compression of stored content (gzip/zstd) typically achieves 3-5x reduction for text, significantly reducing storage costs. At 1 million new pastes per day averaging 10 KB each, raw storage is 10 GB/day or 3.6 TB/year — manageable but worth compressing.",

    "## Caching Strategy and Read Optimization\nWith a 5:1 read-to-write ratio and Zipf-distributed access (a small fraction of pastes get the majority of reads), multi-layer caching is essential. Layer 1 is a CDN (CloudFront/Cloudflare) that caches rendered paste pages at edge locations — popular pastes are served without hitting the origin at all. Layer 2 is an application-level Redis cache storing paste metadata and content for recent and popular pastes, with LRU eviction. Layer 3 is the database and object store as the source of truth. Cache invalidation is simple because pastes are immutable after creation — they can be cached indefinitely until expiration. For syntax-highlighted content, pre-rendering the highlighted HTML on write and caching the rendered version avoids re-highlighting on every read. The cache key includes the paste key and the requested format (raw, highlighted, embedded), so different views are cached independently. Cache warming can be done by pre-populating the cache for pastes linked from high-traffic sources (detected via referrer headers).",

    "## Abuse Prevention and Rate Limiting\nPastebin services are attractive targets for abuse: malware distribution, phishing page hosting, credential dumps, and spam. Rate limiting is the first defense — a token bucket rate limiter per IP address (e.g., 10 pastes per minute for anonymous users, 30 for authenticated users) prevents automated bulk creation. Content scanning runs asynchronously after paste creation: a pipeline checks for known malware signatures, phishing patterns (login forms, credential harvesting), PII patterns (credit card numbers, SSNs), and spam indicators. Flagged pastes are quarantined (hidden from public listings, warning page shown on access) and queued for human review. CAPTCHA on paste creation reduces automated abuse. Size limits (e.g., 512 KB for anonymous, 10 MB for paid users) prevent the service from being used as a file host. IP reputation scoring (using services like Project Honey Pot or internal abuse databases) can preemptively block or challenge users from known-bad IP ranges. For private/unlisted pastes, the unguessable URL provides security-through-obscurity, but sensitive content should additionally require authentication.",
  ],
  deepDive: [
    "The Key Generation Service (KGS) design has subtleties around failure handling and key recycling. If an application server crashes after receiving a batch of keys but before using them all, those keys are lost — they are marked as used in the KGS but were never actually assigned to pastes. This key leakage is generally acceptable because the key space (62^8 = 218 trillion) is so vast that losing a few million keys is negligible. However, if you want to recover leaked keys, a reconciliation job can periodically cross-reference the used_keys table with actual paste metadata and reclaim keys that were issued but never materialized as pastes. The KGS itself must be highly available — if it goes down, paste creation stops. Running KGS as a replicated service with leader election (using etcd or ZooKeeper) and each replica pre-loading a non-overlapping range of keys ensures both availability and uniqueness. An even simpler approach is to partition the key space by server ID: server 1 generates keys starting with 'a', server 2 with 'b', etc., eliminating coordination entirely.",

    "Syntax highlighting at scale is a compute-intensive operation that must be carefully managed. Highlighting a 500 KB paste with a complex grammar (like C++ or Rust) can take 50-100ms of CPU time. If done synchronously on read, a burst of traffic to a large paste can exhaust CPU. The solution is pre-rendering: when a paste is created, the highlighting job runs asynchronously and stores the rendered HTML alongside the raw content. The raw content is served immediately, and the highlighted version becomes available shortly after (typically within seconds). For pastes in unsupported languages or where auto-detection fails, a fallback to plain text with line numbers is used. The highlighting engine (like Tree-sitter or Pygments) runs in a separate worker pool with CPU limits to prevent a single large paste from starving other requests. Language auto-detection uses heuristics: file extension hints in the paste title, shebang lines, keyword frequency analysis, and machine learning classifiers trained on labeled code samples.",

    "Scaling Pastebin to handle viral content requires thinking about thundering herd problems. When a paste is shared on social media and suddenly receives millions of views, the first request after cache expiration triggers a cache miss, and hundreds of concurrent requests hit the origin simultaneously. The solution is request coalescing (also called dog-piling prevention): when a cache miss occurs, only one request is sent to the origin, and all other concurrent requests for the same key wait for that single fetch to complete and populate the cache. This can be implemented with a distributed lock per paste key in Redis — the first request acquires the lock and fetches, others wait on the lock. Additionally, stale-while-revalidate allows serving slightly stale cached content while the refresh happens in the background, eliminating user-visible latency spikes entirely. CDN-level protections include origin shielding (consolidating cache misses through a single upstream cache before hitting the origin) and rate limiting on cache miss paths.",

    "An interesting design consideration is paste analytics and view counting at scale. Naively incrementing a database counter on every view creates a write-heavy hotspot for popular pastes. Instead, view counts are accumulated in an in-memory counter (per application server) and flushed to the database in batches every 30-60 seconds. This reduces database write load by 100-1000x for popular pastes. For real-time analytics (views per minute, referrer tracking, geographic distribution), events are pushed to a Kafka topic and processed by a streaming pipeline (Flink/Spark Streaming) that computes aggregates and stores them in a time-series database (InfluxDB or TimescaleDB). This architecture decouples the read-heavy critical path from analytics processing, ensuring that a spike in views does not impact paste serving latency.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Base62 encoding for short URL generation",
      source: `#include <string>
#include <cstdint>
#include <algorithm>
#include <random>

class Base62Encoder {
    static constexpr char CHARSET[] =
        "0123456789"
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static constexpr int BASE = 62;

public:
    // Encode a numeric ID to base62 string
    static std::string encode(uint64_t id) {
        if (id == 0) return "0";
        std::string result;
        while (id > 0) {
            result += CHARSET[id % BASE];
            id /= BASE;
        }
        std::reverse(result.begin(), result.end());
        return result;
    }

    // Decode base62 string back to numeric ID
    static uint64_t decode(const std::string& s) {
        uint64_t result = 0;
        for (char c : s) {
            result *= BASE;
            if (c >= '0' && c <= '9')      result += c - '0';
            else if (c >= 'a' && c <= 'z') result += c - 'a' + 10;
            else if (c >= 'A' && c <= 'Z') result += c - 'A' + 36;
        }
        return result;
    }

    // Generate a random 8-char base62 key (for KGS)
    static std::string generate_random_key(int length = 8) {
        static thread_local std::mt19937_64 rng(
            std::random_device{}()
        );
        std::uniform_int_distribution<int> dist(0, BASE - 1);
        std::string key(length, '0');
        for (int i = 0; i < length; ++i) {
            key[i] = CHARSET[dist(rng)];
        }
        return key;
    }
};

// Usage:
// Base62Encoder::encode(1000000)     => "4c92"
// Base62Encoder::decode("4c92")      => 1000000
// Base62Encoder::generate_random_key() => "xK9mQ2pL" (random)`
    },
    {
      language: "cpp",
      caption: "LRU cache for paste metadata with TTL support",
      source: `#include <unordered_map>
#include <list>
#include <string>
#include <chrono>
#include <optional>
#include <mutex>

struct PasteMetadata {
    std::string key;
    std::string author;
    std::string language;
    int64_t created_at;
    int64_t expires_at;   // 0 = never
    enum Visibility { PUBLIC, UNLISTED, PRIVATE } visibility;
    size_t content_size;
};

class LRUCache {
    struct Entry {
        PasteMetadata data;
        std::chrono::steady_clock::time_point cached_at;
    };

    size_t capacity_;
    std::chrono::seconds ttl_;
    std::list<std::string> order_;  // Front = most recent
    std::unordered_map<std::string,
        std::pair<Entry, std::list<std::string>::iterator>> map_;
    std::mutex mu_;

public:
    LRUCache(size_t capacity, int ttl_seconds = 300)
        : capacity_(capacity),
          ttl_(ttl_seconds) {}

    void put(const std::string& key, const PasteMetadata& meta) {
        std::lock_guard<std::mutex> lk(mu_);
        auto it = map_.find(key);
        if (it != map_.end()) {
            order_.erase(it->second.second);
        }
        order_.push_front(key);
        map_[key] = {
            {meta, std::chrono::steady_clock::now()},
            order_.begin()
        };
        // Evict if over capacity
        while (map_.size() > capacity_) {
            auto last = order_.back();
            map_.erase(last);
            order_.pop_back();
        }
    }

    std::optional<PasteMetadata> get(const std::string& key) {
        std::lock_guard<std::mutex> lk(mu_);
        auto it = map_.find(key);
        if (it == map_.end()) return std::nullopt;

        auto& entry = it->second.first;
        auto age = std::chrono::steady_clock::now() - entry.cached_at;
        if (age > ttl_) {
            // Cache entry expired
            order_.erase(it->second.second);
            map_.erase(it);
            return std::nullopt;
        }

        // Check if paste itself has expired
        if (entry.data.expires_at > 0) {
            auto now_epoch = std::chrono::duration_cast<
                std::chrono::seconds>(
                std::chrono::system_clock::now().time_since_epoch()
            ).count();
            if (now_epoch > entry.data.expires_at) {
                order_.erase(it->second.second);
                map_.erase(it);
                return std::nullopt; // Paste expired
            }
        }

        // Move to front (most recently used)
        order_.erase(it->second.second);
        order_.push_front(key);
        it->second.second = order_.begin();
        return entry.data;
    }
};`
    },
    {
      language: "cpp",
      caption: "Token bucket rate limiter for abuse prevention",
      source: `#include <unordered_map>
#include <chrono>
#include <mutex>
#include <string>

class TokenBucketRateLimiter {
    struct Bucket {
        double tokens;
        std::chrono::steady_clock::time_point last_refill;
    };

    double max_tokens_;      // Bucket capacity
    double refill_rate_;     // Tokens per second
    std::unordered_map<std::string, Bucket> buckets_;
    std::mutex mu_;

    void refill(Bucket& bucket) {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(
            now - bucket.last_refill
        ).count();
        bucket.tokens = std::min(
            max_tokens_,
            bucket.tokens + elapsed * refill_rate_
        );
        bucket.last_refill = now;
    }

public:
    // max_tokens: burst capacity, refill_rate: sustained rate
    TokenBucketRateLimiter(double max_tokens, double refill_rate)
        : max_tokens_(max_tokens), refill_rate_(refill_rate) {}

    // Returns true if request is allowed, false if rate-limited
    bool allow(const std::string& client_id, double cost = 1.0) {
        std::lock_guard<std::mutex> lk(mu_);
        auto& bucket = buckets_[client_id];
        if (bucket.tokens == 0 && bucket.last_refill ==
            std::chrono::steady_clock::time_point{}) {
            // New client — initialize bucket
            bucket.tokens = max_tokens_;
            bucket.last_refill = std::chrono::steady_clock::now();
        }
        refill(bucket);
        if (bucket.tokens >= cost) {
            bucket.tokens -= cost;
            return true;
        }
        return false; // Rate limited — return 429
    }

    // Cleanup stale buckets (call periodically)
    void cleanup(std::chrono::seconds max_idle = std::chrono::seconds(3600)) {
        std::lock_guard<std::mutex> lk(mu_);
        auto now = std::chrono::steady_clock::now();
        for (auto it = buckets_.begin(); it != buckets_.end();) {
            if (now - it->second.last_refill > max_idle)
                it = buckets_.erase(it);
            else
                ++it;
        }
    }
};

// Usage:
// TokenBucketRateLimiter limiter(10, 0.167); // 10 burst, ~10/min sustained
// if (!limiter.allow(client_ip)) {
//     return HTTP_429_TOO_MANY_REQUESTS;
// }`
    },
  ],
  diagrams: [
    {
      title: "Pastebin High-Level Architecture",
      kind: "architecture",
      caption: "System architecture showing the read and write paths through load balancer, application servers, cache, and storage layers.",
      mermaid: `graph TD
    CLIENT["Client Browser"] --> LB["Load Balancer"]
    LB --> APP1["App Server 1"]
    LB --> APP2["App Server 2"]
    LB --> APPN["App Server N"]
    APP1 --> REDIS["Redis Cache"]
    APP2 --> REDIS
    APPN --> REDIS
    APP1 --> KGS["Key Generation Service"]
    APP1 --> DB["PostgreSQL Metadata"]
    APP2 --> DB
    APPN --> DB
    APP1 --> S3["S3 Content Store"]
    APP2 --> S3
    APPN --> S3
    S3 --> CDN["CDN Edge Nodes"]
    CDN --> CLIENT`
    },
    {
      title: "Paste Creation Flow",
      kind: "sequence",
      caption: "Sequence diagram for creating a new paste with key assignment, content storage, and cache population.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant A as App Server
    participant K as Key Gen Service
    participant D as PostgreSQL
    participant S as S3 Store
    participant R as Redis Cache

    C->>A: POST /api/paste (content, settings)
    A->>A: Rate limit check
    A->>K: Get next available key
    K-->>A: Key "xK9mQ2pL"
    A->>S: Store content blob
    S-->>A: Upload OK
    A->>D: Insert paste metadata
    D-->>A: Insert OK
    A->>R: Cache metadata + content
    R-->>A: Cached
    A-->>C: 201 Created {url: /xK9mQ2pL}`
    },
    {
      title: "Paste Read and Expiration Flow",
      kind: "flow",
      caption: "Read path with lazy expiration check, multi-layer cache lookup, and fallback to origin storage.",
      mermaid: `flowchart TD
    REQ["GET /paste/xK9mQ2pL"] --> CDN{"CDN Cache Hit?"}
    CDN -->|"Hit"| SERVE["Serve Cached Content"]
    CDN -->|"Miss"| REDIS{"Redis Cache Hit?"}
    REDIS -->|"Hit"| EXPIRED1{"Paste Expired?"}
    EXPIRED1 -->|"No"| RENDER["Render + Serve"]
    EXPIRED1 -->|"Yes"| NOTFOUND["Return 404"]
    REDIS -->|"Miss"| DB["Query PostgreSQL"]
    DB --> FOUND{"Found?"}
    FOUND -->|"No"| NOTFOUND
    FOUND -->|"Yes"| EXPIRED2{"Paste Expired?"}
    EXPIRED2 -->|"Yes"| DELETE["Queue for Deletion"]
    DELETE --> NOTFOUND
    EXPIRED2 -->|"No"| FETCH["Fetch from S3"]
    FETCH --> CACHE["Populate Redis + CDN"]
    CACHE --> RENDER`
    },
    {
      title: "Expiration Cleanup Pipeline",
      kind: "flow",
      caption: "Background cleanup service combining lazy expiration on reads with periodic batch deletion of expired pastes.",
      mermaid: `flowchart TD
    CRON["Cleanup Cron Every 5min"] --> QUERY["Query expired pastes batch"]
    QUERY --> BATCH["Get batch of 1000 expired IDs"]
    BATCH --> DELS3["Delete from S3"]
    BATCH --> DELDB["Delete from PostgreSQL"]
    BATCH --> DELCACHE["Invalidate Redis Cache"]
    DELS3 --> LOG["Log deletion metrics"]
    DELDB --> LOG
    DELCACHE --> LOG
    LOG --> MORE{"More expired?"}
    MORE -->|"Yes"| BATCH
    MORE -->|"No"| DONE["Sleep until next run"]`
    },
  ],
  interviewQA: [
    {
      q: "How would you design a system like Pastebin that handles millions of pastes with a read-heavy workload?",
      a: "The key insight is that pastes are immutable after creation, making them ideal for aggressive caching. I would separate metadata (small, structured) from content (large, blob) — metadata in PostgreSQL with a Redis cache layer, content in S3 with CDN edge caching. For URL generation, a Key Generation Service pre-generates batches of random base62 keys and distributes them to application servers, keeping key creation off the hot path. The read path checks CDN first, then Redis, then database/S3 — with a 5:1 read-to-write ratio and Zipf distribution (popular pastes get most traffic), I would expect a 95%+ cache hit rate at the Redis layer. Application servers are stateless and horizontally scalable behind a load balancer. Write path is simple: get a key, store content in S3, insert metadata in PostgreSQL, and populate the cache. Expiration uses lazy checking on read plus periodic batch cleanup.",
      followUps: [
        "How would you handle a paste that suddenly goes viral on social media?",
        "What is the trade-off between pre-generating keys and encoding auto-increment IDs?",
      ],
    },
    {
      q: "How do you generate unique, short, unguessable URLs for pastes?",
      a: "I would use a Key Generation Service (KGS) that pre-generates random 8-character base62 keys in batches. The KGS maintains two tables: unused_keys and used_keys, with a unique constraint preventing duplicates. Application servers request batches of keys (e.g., 1000 at a time) from KGS and cache them in memory, so paste creation just pops from the local batch — O(1) with no network call. With 8 characters of base62 (62^8 = 218 trillion possible keys), the collision probability for random generation is negligible. The alternative — encoding sequential auto-increment IDs to base62 — is simpler but produces guessable, sequential URLs, which is a privacy concern for unlisted pastes. KGS provides unguessability by using cryptographically random key generation. If a server crashes with unused keys, those keys are lost (marked as used but never assigned to pastes), which is acceptable given the enormous key space.",
      followUps: [
        "How would you make the KGS highly available?",
        "What happens if two KGS instances generate the same key?",
      ],
    },
    {
      q: "How would you implement paste expiration efficiently?",
      a: "A dual approach: lazy expiration plus active cleanup. Lazy expiration checks the expires_at timestamp on every read — if the current time exceeds the expiration, return 404 and queue the paste for async deletion. This handles the common case (expired paste accessed) with zero background cost and ensures no expired paste is ever served. Active cleanup is a periodic background job (every 5-10 minutes) that queries the database for pastes where expires_at < NOW(), processes them in batches of 1000, and deletes from S3, PostgreSQL, and Redis. The database query is efficient if expires_at is indexed. For Redis-cached entries, I would use Redis EXPIREAT to automatically evict cached metadata at the paste's expiration time, so the cache self-cleans. For 'never expire' pastes from free users, a separate policy might archive pastes with zero views in the last 6 months to cold storage, keeping hot storage manageable.",
      followUps: [
        "How does this approach scale with billions of expired pastes?",
        "What if the cleanup job is slower than the rate of paste expiration?",
      ],
    },
    {
      q: "How would you prevent abuse of the Pastebin service?",
      a: "Abuse prevention is multi-layered. First, rate limiting with a token bucket per IP address: anonymous users get 10 paste creations per minute, authenticated users get 30. This prevents automated bulk creation. Second, content scanning runs asynchronously after creation — a pipeline checks for malware signatures, phishing patterns (HTML with login forms), PII patterns (credit card regexes, SSN formats), and known spam content hashes. Flagged pastes are quarantined: they remain accessible but display a warning interstitial and are excluded from public listings. Third, size limits (512 KB anonymous, 10 MB paid) prevent abuse as a file hosting service. Fourth, IP reputation scoring using external threat intelligence feeds preemptively challenges or blocks known-bad IPs. Fifth, CAPTCHA on paste creation for anonymous users reduces bot-driven abuse. The key trade-off is between user friction and abuse prevention — requiring authentication for paste creation would eliminate most abuse but also most casual usage.",
      followUps: [
        "How do you handle legitimate pastes that are false-positived by content scanning?",
        "Should content scanning happen synchronously or asynchronously?",
      ],
    },
    {
      q: "How would you handle syntax highlighting for pastes in hundreds of programming languages?",
      a: "Syntax highlighting is CPU-intensive (50-100ms for large pastes with complex grammars), so it must be decoupled from the read path. On paste creation, the system detects the language (from user selection, file extension hints, or auto-detection using heuristics and ML classifiers) and queues a highlight job. A worker pool processes these jobs using a grammar-based highlighter (like Tree-sitter), producing HTML with CSS classes for tokens. The highlighted HTML is stored alongside the raw content in S3, keyed by paste_key + format. On read, the highlighted version is served if available; otherwise, the raw text with line numbers is served as a fallback. The worker pool has CPU limits per job to prevent a single huge paste from starving others. For languages where auto-detection fails, the system defaults to plain text. Cache headers are set aggressively since both raw and highlighted versions are immutable.",
      followUps: [
        "How would you support real-time syntax highlighting as the user types?",
        "What is the storage overhead of keeping both raw and highlighted versions?",
      ],
    },
  ],
  mcqs: [
    {
      q: "What is the primary advantage of a Key Generation Service (KGS) over encoding auto-increment IDs for paste URLs?",
      options: [
        "KGS produces shorter URLs",
        "KGS keys are random and unguessable, while auto-increment IDs are sequential and predictable",
        "KGS is faster than auto-increment",
        "KGS uses less storage",
      ],
      answerIndex: 1,
      explanation: "Auto-increment IDs encoded in base62 produce sequential, predictable URLs (e.g., 4c92, 4c93, 4c94). KGS generates cryptographically random keys, making URLs unguessable — critical for unlisted pastes where the URL is the only access control.",
    },
    {
      q: "Why does lazy expiration (checking on read) work well for Pastebin?",
      options: [
        "Most expired pastes are never accessed again, so lazy checking avoids unnecessary deletion work",
        "Lazy expiration is faster than active expiration",
        "Lazy expiration saves database space",
        "Lazy expiration prevents data loss",
      ],
      answerIndex: 0,
      explanation: "The vast majority of expired pastes are never accessed again — they were created for temporary sharing and forgotten. Lazy expiration ensures no expired paste is ever served (checked on every read) while avoiding the cost of actively scanning and deleting pastes that nobody will ever request.",
    },
    {
      q: "With a 5:1 read-to-write ratio and Zipf-distributed access, what cache hit rate can a well-sized Redis cache typically achieve for Pastebin?",
      options: [
        "50-60%",
        "70-80%",
        "85-90%",
        "95%+",
      ],
      answerIndex: 3,
      explanation: "Zipf distribution means a small number of pastes receive the vast majority of reads. Since pastes are immutable (no cache invalidation needed) and recent pastes are cached on write, a properly sized Redis cache achieves 95%+ hit rates, with most misses being for old, rarely accessed pastes.",
    },
    {
      q: "How many possible unique 8-character base62 keys can be generated?",
      options: [
        "About 2 billion (2 * 10^9)",
        "About 218 trillion (2.18 * 10^14)",
        "About 1 million (10^6)",
        "About 16 million (1.6 * 10^7)",
      ],
      answerIndex: 1,
      explanation: "62^8 = 218,340,105,584,896, approximately 218 trillion. This enormous key space means even with millions of pastes created daily, key exhaustion is not a concern, and random collision probability is negligible.",
    },
  ],
  flashcards: [
    { front: "What is the role of KGS in Pastebin?", back: "Key Generation Service pre-generates random base62 keys in bulk, distributes batches to app servers, and tracks used/unused keys. Keeps key creation off the critical write path. App servers pop keys from a local in-memory batch — O(1) with no network call." },
    { front: "How does lazy expiration work?", back: "On every read, check if expires_at < current_time. If expired, return 404 and queue for async deletion. Avoids background scanning costs for the majority of expired pastes that are never accessed again." },
    { front: "Why separate metadata from content storage?", back: "Metadata is small (~200 bytes) and structured — fits in PostgreSQL/Redis for fast lookups and listings. Content is large (up to 10MB) and blob-like — fits in S3 with CDN caching. Different access patterns benefit from different storage systems." },
    { front: "What is the read:write ratio for Pastebin and why does it matter?", back: "Approximately 5:1 (reads heavily dominate). This means caching is highly effective — invest in multi-layer caching (CDN + Redis) rather than write optimization. Immutable pastes make cache invalidation trivial." },
    { front: "How does base62 encoding work?", back: "Uses 62 characters (0-9, a-z, A-Z) as digits. Divide the number by 62 repeatedly, using remainders as digit indices. 62^8 = 218 trillion possible 8-character keys. Decode by multiplying each character's value by 62^position." },
    { front: "What is request coalescing and why is it important?", back: "When a cache miss occurs, only one request fetches from origin while concurrent requests for the same key wait. Prevents thundering herd when a popular paste's cache entry expires and thousands of requests hit origin simultaneously." },
    { front: "How is abuse prevented in Pastebin?", back: "Multi-layered: token bucket rate limiting per IP, async content scanning for malware/phishing/PII, CAPTCHA on creation, size limits, IP reputation scoring. Flagged pastes are quarantined with warning interstitials, not immediately deleted." },
    { front: "What is the storage estimate for Pastebin at 1M pastes/day?", back: "At 10 KB average content size: 10 GB/day raw, ~3 GB/day compressed (3-5x with gzip/zstd). ~3.6 TB/year raw, ~1 TB/year compressed. Metadata: 1M rows * 200 bytes = 200 MB/day." },
  ],
  exercises: [
    "Design the database schema for Pastebin including tables for pastes (metadata), paste content references, users, and API keys. Include indexes for efficient querying by key, user, creation time, and expiration time. Consider partitioning strategies for the pastes table.",
    "Implement a KGS that generates unique 8-character base62 keys with the following constraints: must support 1000 key requests per second, must guarantee uniqueness across multiple KGS instances, and must handle instance failures gracefully. Design the key distribution and recovery protocols.",
    "Build a CDN cache invalidation system for pastes that supports: immediate invalidation when a paste is deleted by the author, automatic expiration based on paste TTL, and cache warming for pastes that are trending (detected via view count spikes). Consider consistency trade-offs.",
    "Design the abuse detection pipeline for Pastebin. Define the scanning rules for malware, phishing, PII, and spam. Specify the quarantine workflow, appeal process, and false positive handling. Include metrics for monitoring detection accuracy and latency.",
    "Create a load testing plan for Pastebin that simulates: normal traffic (5:1 read-to-write ratio, Zipf distribution), viral paste scenario (single paste receiving 100K requests per second), and abuse scenario (bot creating 10K pastes per minute from rotating IPs). Define success criteria for each scenario.",
  ],
  revisionNotes: [
    "Pastebin is read-heavy (5:1 ratio) with immutable content — ideal for aggressive multi-layer caching (CDN + Redis + S3 origin). Expect 95%+ cache hit rate.",
    "KGS pre-generates random base62 keys in batches. App servers cache key batches in memory — paste creation pops a key in O(1). Key space: 62^8 = 218 trillion.",
    "Separate metadata (PostgreSQL, ~200 bytes/paste) from content (S3, up to 10 MB/paste). Different access patterns, different storage systems.",
    "Lazy expiration: check expires_at on every read, return 404 if expired. Active cleanup: batch delete every 5-10 minutes via indexed query on expires_at.",
    "Request coalescing prevents thundering herd on cache miss — only one fetch to origin, concurrent requests wait for it. Use distributed lock per paste key.",
    "Abuse prevention layers: token bucket rate limiting (10/min anon, 30/min auth), async content scanning, CAPTCHA, size limits, IP reputation.",
    "Syntax highlighting is CPU-intensive — pre-render on write, store highlighted HTML alongside raw content. Fallback to plain text if highlighting fails.",
    "Storage estimate: 1M pastes/day * 10 KB avg = 10 GB/day raw. Compression (gzip/zstd) achieves 3-5x reduction. ~1 TB/year compressed.",
    "View counting at scale: accumulate in-memory counters per app server, flush to DB every 30-60 seconds. Real-time analytics via Kafka + streaming pipeline.",
    "Access control: public pastes cached everywhere, unlisted pastes have unguessable URLs (no auth required), private pastes require authentication and skip shared caches.",
  ],
  cheatSheet: [
    "Base62 key space: 62^8 = 218 trillion possible 8-character keys",
    "KGS batch size: ~1000 keys per app server request, replenish when 20% remaining",
    "Cache layers: CDN (edge) → Redis (app-level) → PostgreSQL + S3 (origin)",
    "Expiration: lazy check on read + batch cleanup every 5 minutes with indexed query",
    "Rate limits: 10 pastes/min anonymous, 30/min authenticated (token bucket)",
    "Content size limits: 512 KB anonymous, 10 MB paid users",
    "Storage: ~10 GB/day at 1M pastes/day, ~1 TB/year compressed",
    "Read path: CDN → Redis → DB → S3, populate cache on miss",
    "Write path: rate limit → get key from KGS → store S3 → insert DB → cache Redis",
    "Thundering herd: request coalescing with distributed lock per paste key",
  ],
  glossary: [
    { term: "Key Generation Service (KGS)", definition: "A dedicated service that pre-generates unique, random short keys in bulk and distributes them to application servers, keeping key creation off the critical paste-creation path." },
    { term: "Base62 Encoding", definition: "An encoding scheme using 62 characters (0-9, a-z, A-Z) to represent numbers compactly. An 8-character base62 string can represent up to 218 trillion unique values." },
    { term: "Lazy Expiration", definition: "A strategy where expired items are not proactively deleted but instead detected and removed when accessed. Efficient when most expired items are never accessed again." },
    { term: "Request Coalescing", definition: "A technique where multiple concurrent cache misses for the same key result in a single origin fetch, with all waiting requests served from the same response. Prevents thundering herd problems." },
    { term: "Token Bucket Rate Limiter", definition: "A rate-limiting algorithm where tokens are added to a bucket at a fixed rate, and each request consumes a token. When the bucket is empty, requests are rejected. The bucket capacity allows controlled bursts." },
    { term: "Unlisted Paste", definition: "A paste accessible only via its direct URL — not indexed in search or public listings. Security depends on the unguessability of the URL (random base62 key), not authentication." },
    { term: "Thundering Herd", definition: "A scenario where many concurrent requests simultaneously discover a cache miss and all attempt to fetch from the origin, potentially overwhelming the backend. Solved by request coalescing." },
  ],
  comparison: {
    columns: ["Aspect", "KGS (Pre-generated Keys)", "Auto-increment + Base62", "UUID/GUID", "Hash-based (MD5/SHA)"],
    rows: [
      ["Key Length", "Fixed (e.g., 8 chars)", "Variable (grows with ID)", "36 chars (with dashes)", "32+ chars (hex)"],
      ["Guessability", "Random, unguessable", "Sequential, predictable", "Random, unguessable", "Deterministic from content"],
      ["Uniqueness", "Guaranteed by DB constraint", "Guaranteed by auto-increment", "Statistically unique", "Collision possible"],
      ["Performance", "O(1) from local batch cache", "O(1) but centralized bottleneck", "O(1) generation", "O(n) hash computation on content"],
      ["Scalability", "Horizontal (partition key ranges)", "Single writer bottleneck", "Fully distributed", "Fully distributed"],
      ["URL Friendliness", "Short, URL-safe", "Short, URL-safe", "Long, ugly", "Long, ugly"],
    ],
  },
  followUps: [
    "How would you add real-time collaborative editing to Pastebin (like a shared scratchpad)?",
    "How would you implement paste forking — creating a new paste based on an existing one with edit history?",
    "How would you design a Pastebin API with OAuth authentication and usage-based billing?",
    "How would you add end-to-end encryption so even the server cannot read paste content?",
    "How would you implement paste search — full-text search across millions of public pastes?",
    "How would you design a self-hosted Pastebin alternative for enterprise use with LDAP integration?",
  ],
  resources: [
    { label: "Designing Data-Intensive Applications (Kleppmann)", kind: "book", note: "Chapters on caching, storage engines, and distributed systems provide the foundational patterns used in Pastebin design." },
    { label: "System Design Interview (Alex Xu) - Chapter on URL Shortener", kind: "book", note: "The URL shortener chapter covers key generation, base62 encoding, and caching strategies directly applicable to Pastebin." },
    { label: "GitHub Gist Architecture", kind: "article", note: "GitHub's paste-like service provides real-world insights into content storage, versioning, and API design at scale." },
    { label: "Caching at Scale with Redis (Redis University)", kind: "video", note: "Covers LRU eviction, TTL-based expiration, and cache-aside patterns essential for Pastebin's read-heavy workload." },
    { label: "dpaste / Hastebin (Open Source)", kind: "repo", note: "Open-source paste services demonstrating practical implementation of URL generation, syntax highlighting, and expiration." },
  ],
};
