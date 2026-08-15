import type { TopicContent } from "../types";

export const designTwitter: TopicContent = {
  quickSummary: [
    "Twitter handles ~500M tweets/day (~5,800 tweets/sec) with ~400M daily active users. The system is read-heavy: the read-to-write ratio is roughly 1000:1, making timeline generation the most critical path.",
    "The fan-out problem is the central design challenge: when a user with 50M followers tweets, eagerly pushing that tweet into 50M timelines (fan-out on write) is prohibitively expensive. Twitter uses a hybrid approach: fan-out on write for normal users, fan-out on read for celebrity users.",
    "Tweet storage uses a distributed key-value store (Manhattan/RocksDB) for fast point lookups by tweet ID. Tweet IDs are generated using Snowflake, a distributed 64-bit ID generator that embeds timestamp, machine ID, and sequence number for roughly chronological ordering without coordination.",
    "Trending topics are detected in real-time using probabilistic data structures like Count-Min Sketch and HyperLogLog, processing the full tweet firehose to identify hashtags and phrases with sudden frequency spikes above a rolling baseline.",
    "The system relies on Redis clusters for home timeline caching, Kafka for async fan-out and event streaming, and a search index (Earlybird, built on Lucene) for real-time tweet search with sub-second indexing latency.",
  ],
  detailed: [
    "## High-Level Architecture Overview\nTwitter's architecture is composed of several major subsystems: the Tweet Service (ingestion and storage), the Timeline Service (home and user timelines), the Social Graph Service (follow relationships), the Search Service (real-time indexing), and the Notification/Push Service. Each subsystem is independently scalable. The API gateway handles authentication, rate limiting (per-user and per-app token buckets), and routes requests to the appropriate backend service. All inter-service communication uses Thrift RPC or gRPC. A CDN layer sits in front for media (images, video) and static assets, handling billions of media requests per day. The entire stack runs across multiple data centers with active-active replication for availability.",
    "## Capacity Estimation: Do the Math First\nSizing the system up front is what turns a hand-wavy diagram into a defensible design, so derive every number out loud. Assume 250M DAU and 500M tweets/day. Write QPS: 500M / 86,400 seconds = ~5,800 tweets/sec average; apply a 3x peak factor for global events (elections, World Cup finals) and you plan for ~18,000 writes/sec. Timeline read QPS: if each DAU opens their home timeline ~10 times/day, that is 2.5B loads/day = ~29,000 QPS average and ~90,000 QPS at peak; each load hydrates ~20 tweets, so the tweet-fetch tier must serve ~1.8M lookups/sec at peak — which is why every tweet body read must be a cache hit. Storage: a tweet is 280 characters plus metadata (author ID, entities, counters) — call it ~1KB; 500M/day x 1KB = ~500GB/day of tweet text, ~180TB/year, ~540TB/year after 3x replication. Media dominates raw bytes: if 10% of tweets carry a ~200KB image, that is 50M x 200KB = ~10TB/day into S3. Fan-out write volume: 5,800 tweets/sec x ~200 average followers = ~1.2M timeline-cache inserts/sec that the async pipeline must absorb.\nKey insight: the derived ratios drive the whole architecture — ~29K timeline reads vs ~5.8K tweet writes (and roughly 1000:1 at the individual tweet-fetch level) says precompute and cache the read path, and push every expensive operation (fan-out, search indexing, counter updates) off the synchronous write path onto Kafka.\nCommon mistake: quoting QPS figures without showing the division. Interviewers specifically want to see 500M / 86,400 = ~5,800 written out — the arithmetic is the demonstration of rigor, not the final number.",
    "## Tweet Ingestion and Storage\nWhen a user posts a tweet, the Tweet Service validates the content (280-character limit, media attachments, mentions parsing), assigns a Snowflake ID, and writes to a distributed key-value store (Manhattan). Tweets are stored with their metadata: author ID, timestamp, reply-to chain, media URLs, entities (hashtags, mentions, URLs). The write path also publishes the tweet to a Kafka topic for asynchronous fan-out. Media uploads go through a separate pipeline: images are resized into multiple variants, videos are transcoded, and all assets are pushed to a CDN with edge caching. The Kafka event triggers the Fan-Out Service, which determines the tweet author's follower count and chooses the appropriate fan-out strategy.",
    "## Timeline Generation and the Fan-Out Problem\nThe home timeline is the most latency-sensitive read path. For users with fewer than ~5,000 followers, Twitter uses fan-out on write: the Fan-Out Service reads the author's follower list from the Social Graph Service and inserts the tweet ID into each follower's timeline cache in Redis. Each user's timeline is a sorted set (ZSET) in Redis, scored by tweet ID (which embeds timestamp). When a user opens their timeline, the Timeline Service reads tweet IDs from Redis and hydrates them from the Tweet Service. For celebrity users (>5,000 followers), fan-out on write would require millions of Redis inserts per tweet, so Twitter switches to fan-out on read: the tweet is not pre-distributed, and instead, at read time, the Timeline Service fetches recent tweets from followed celebrities and merges them with the pre-computed timeline. This hybrid approach caps fan-out cost while keeping p99 read latency under 200ms for most users.",
    "## Search and Trending Topics\nTwitter's search system (Earlybird) is built on top of Apache Lucene and indexes tweets within seconds of posting. The index is partitioned by time: recent tweets live in an in-memory index for fastest access, while older tweets are in on-disk segments. Queries hit all partitions in parallel, and results are merged by relevance score (a combination of recency, engagement signals, and user affinity). Trending topics are detected by a streaming pipeline that processes the entire tweet firehose through Kafka Streams. Each hashtag or phrase passes through a Count-Min Sketch for approximate frequency counting, and a trending detector compares the current rate against a rolling 24-hour baseline using exponential moving averages. A topic is flagged as trending when its current rate exceeds the baseline by a configurable multiplier (typically 3-5x), and HyperLogLog is used to estimate the number of distinct users discussing each topic to filter out bot-driven spikes.",
    "## Reliability, Caching, and Failure Handling\nTwitter operates across multiple data centers with eventual consistency for most data. Timeline caches in Redis are replicated but can tolerate staleness: if a cache node fails, the timeline is rebuilt from the tweet store and social graph on the next read (a cache miss path that takes ~50-100ms more). Rate limiting uses a distributed token bucket per user and per application. Circuit breakers protect downstream services: if the Fan-Out Service cannot reach Redis, it buffers events in Kafka and retries with exponential backoff. The system is designed to degrade gracefully: if trending detection lags, stale trends are shown; if search indexing falls behind, results are slightly delayed but never lost. Hot partitions are handled by sharding timelines and social graphs by user ID with consistent hashing, and re-sharding is performed online using virtual nodes.",
    "## End-to-End Trace: Posting a Tweet (Write Path)\nFollowing one tweet from the phone to 200 follower timelines shows exactly how every component earns its place.\n1. The client POSTs to the load balancer; the API gateway authenticates the OAuth token and checks the write rate limit (a token bucket in Redis, decremented via a Lua script).\n2. The Tweet Service validates content (280-char limit, entity parsing), obtains a 64-bit Snowflake ID, and synchronously writes the row to the tweet store — Manhattan at Twitter; in an interview, MySQL sharded by tweet ID or a Cassandra-style KV store is a perfectly good answer.\n3. Media was uploaded earlier through a separate endpoint straight to S3 and transcoded asynchronously; the tweet row stores only media URLs, never bytes.\n4. The service publishes a TweetCreated event to Kafka and returns 201 — total synchronous latency is ~50ms, and everything after this point is asynchronous.\n5. Fan-out workers consume the event, ask the social graph service (FlockDB-style adjacency store) for the follower ID list, and pipeline LPUSH + LTRIM commands into each follower's Redis timeline list — ~200 inserts for an average author, completing within 1-2 seconds.\n6. In parallel, independent Kafka consumer groups index the tweet into Elasticsearch/Earlybird, feed the Flink trends job, and fire mention/reply notifications through the WebSocket gateway.\nIn practice: the author sees their tweet instantly because the client renders it optimistically; followers see it a second or two later, and nobody notices the gap — this is the eventual consistency the async design deliberately accepts.",
    "## End-to-End Trace: Loading the Home Timeline (Read Path)\nThe home timeline read is the hottest path in the system, so every step is engineered to stay under a ~200ms p99 budget.\n1. GET /home_timeline passes the gateway (auth + read rate limit) and lands on the Timeline Service.\n2. The service issues an LRANGE on the user's Redis timeline list for the first 20 tweet IDs — ~1ms, since fan-out already precomputed the list.\n3. Celebrity merge: for each high-follower account the user follows (usually fewer than a few dozen), the service fetches that author's recent tweet IDs from a small per-author cache and performs a k-way merge with the precomputed IDs, ordering by Snowflake ID (which embeds time).\n4. Hydration: the 20 winning IDs are fetched in one MGET against the hot tweet cache (memcached); misses fall through to the tweet store. Author profiles and engagement counters are batch-fetched the same way.\n5. The response is assembled and returned — p50 well under 100ms, p99 under 200ms.\nCommon mistake: designing the read path to query the social graph and tweet store on every load. That is the cache-miss rebuild path (~200-400ms, taken only when a dormant user's timeline was evicted), not the steady-state path — conflating the two is the most frequent error in this interview.",
  ],
  deepDive: [
    "The Snowflake ID generator is critical to Twitter's ability to scale without coordination. Each Snowflake ID is a 64-bit integer composed of: 41 bits for timestamp (milliseconds since a custom epoch, giving ~69 years of IDs), 10 bits for machine/worker ID (supporting 1,024 workers), and 12 bits for a per-worker sequence number (4,096 IDs per millisecond per worker). This means a single worker can generate 4,096 unique IDs per millisecond, and the entire system can produce ~4M IDs per millisecond across all workers. The timestamp-first layout ensures IDs are roughly chronologically sorted, which is essential for efficient range queries on timelines (Redis ZRANGEBYSCORE) and for the search index's time-partitioned segments. Clock skew is handled by refusing to generate IDs if the system clock moves backward, and NTP is tightly managed across the fleet.",
    "The fan-out decision boundary of ~5,000 followers is not arbitrary. Twitter measured that with an average Redis write taking ~1ms (including network), fanning out a single tweet to 5,000 followers takes ~5 seconds of cumulative worker time, which is acceptable when amortized across a fleet of fan-out workers. Beyond this threshold, the cost grows linearly and starts impacting the fan-out pipeline's throughput for other tweets. Celebrity tweets (users with 10M+ followers) would take hours to fan out, creating unacceptable delays for all other users sharing the pipeline. The read-time merge for celebrity tweets adds ~10-20ms of latency per celebrity followed (fetching their recent tweets and merging), but since most users follow fewer than 50 celebrities, the total merge overhead stays under 100ms.\nReal-world example: this is the famous 'Justin Bieber problem.' At ~110M followers, one tweet fanned out at ~1ms per Redis write is 110M ms = ~30 hours of sequential worker time; even spread across 1,000 parallel fan-out workers it is nearly 2 minutes of pipeline saturation per tweet — and celebrity accounts tweet many times a day, so pure fan-out on write simply cannot work at that scale.\nKey insight: the hybrid is a cost equation, not a special case — fan-out on write costs O(followers) once at write time, fan-out on read costs O(followees) on every read; you pick per-author whichever side of the equation is cheaper, and the ~5,000-follower threshold is just where the curves cross for Twitter's traffic mix.\nCommon mistake: forgetting the transition case. When an account crosses the threshold, its old tweets are already materialized in follower timelines while new ones go read-path; the merge logic must handle both sources for the same author without duplicates (deduplicate by tweet ID during the k-way merge).",
    "Count-Min Sketch for trending detection works by maintaining a 2D array of counters with multiple independent hash functions. When a hashtag appears in a tweet, it is hashed by each function and the corresponding counter in each row is incremented. To query the frequency, the minimum across all rows is taken (hence 'count-min'), which provides an upper bound on the true frequency with controllable error. Twitter uses a sketch with 5 hash functions and ~1M counters per row, giving an error rate of roughly 0.001% of total stream size. The sketch is reset on a sliding window (typically 5-minute buckets), and the trending detector compares the current window's estimate against the exponential moving average of previous windows. This approach uses only ~40MB of memory to track millions of distinct hashtags in real-time, compared to the gigabytes an exact counter map would require.",
    "Real-time notifications present a distinct scalability challenge. When a user is mentioned or their tweet is liked/retweeted, a notification event is generated and routed through a dedicated Kafka topic. Connected clients maintain persistent WebSocket or long-poll connections to a Notification Gateway, which subscribes to per-user notification channels via a pub/sub system (Twitter's internal system called Nighthawk, similar to Redis pub/sub but optimized for millions of concurrent subscriptions). The gateway maintains an in-memory mapping of user ID to active connections. For users not currently connected, notifications are queued in a per-user notification inbox (stored in Manhattan) and delivered on next connection. Push notifications to mobile devices are batched and sent through APNs/FCM with deduplication to avoid notification storms when a tweet goes viral.",
    "Timeline cache design determines both read latency and the largest Redis bill in the company, so its details matter. Each user's home timeline is a Redis structure holding only tweet IDs — never tweet bodies. Twitter's classic design is a capped list per user: fan-out workers do LPUSH (newest first) followed by LTRIM 0 799, keeping exactly the most recent ~800 entries; a read is a single LRANGE. The sorted-set alternative scores entries by Snowflake ID, which buys ZRANGEBYSCORE cursor pagination and idempotent inserts (a duplicate ZADD is a no-op, useful when Kafka redelivers an event) at roughly 2x the memory of a list. Sizing: 800 entries x ~20 bytes (8-byte ID plus list overhead) = ~16KB per user; caching 250M recently active users = ~4TB of Redis, roughly 12TB if ZSETs are used — sharded by user ID with consistent hashing across ~100 primary nodes plus replicas. Only active users get cached timelines: anyone inactive for ~30 days is evicted and rebuilt on next login via the cache-miss path, which typically halves the memory footprint.\nKey insight: storing IDs instead of bodies keeps entries tiny and makes deletes cheap — a deleted tweet needs no timeline invalidation because hydration always fetches current state and simply skips missing IDs.\nCommon mistake: caching serialized tweet JSON in the timeline. At ~1KB per tweet that is 800 x 1KB x 250M = ~200TB of Redis, and every delete or edit becomes a scatter-gather invalidation across millions of lists.",
    "The search indexing pipeline is a textbook Kafka-to-Elasticsearch ingestion flow, and being able to sketch it end-to-end is a reliable differentiator. TweetCreated events land on a Kafka topic partitioned by tweet ID; a consumer group of indexer workers tokenizes each tweet (text analysis, hashtag/mention/URL extraction, language detection) and bulk-indexes documents into Elasticsearch in batches of a few thousand to amortize per-request overhead. Indices are time-based — one index per day with an alias pointing at the hot index — so the newest index lives on memory-heavy nodes while older indices roll to cheaper hardware via index lifecycle management; Twitter's Earlybird achieves the same effect with time-partitioned Lucene segments. Deletes and edits flow through the same topic as tombstone events, so the index converges without a separate reconciliation job. Because Kafka retains the log, an indexing outage delays search visibility but never loses tweets — consumers resume from their committed offset and catch up.\nIn practice: quote the freshness target — a tweet should be searchable within ~5 seconds of posting — and mention consumer-lag monitoring as the alarm that tells you the pipeline is falling behind.\nWarning: never index synchronously on the tweet-write path; coupling the 201 response to Elasticsearch availability turns every index hiccup into a site-wide posting outage.",
    "Trend detection is fundamentally a windowed streaming-count problem, which is why a stream processor like Flink (or Kafka Streams) owns it. The job consumes the full firehose, extracts hashtags and n-gram phrases, keys the stream by (term, region), and counts within 5-minute tumbling windows (or 1-minute-hop sliding windows for faster reaction). Each window's count is compared against an exponential moving average of that term's trailing 24-hour rate; a term trends when its current rate exceeds ~3-5x the baseline AND its HyperLogLog distinct-user estimate clears a floor that filters bot rings. Count-Min Sketch bounds per-window memory so millions of distinct terms fit in tens of megabytes. Regional keying gives per-country trend lists from the same job.\nKey insight: acceleration beats volume — raw counts alone would surface perennially popular tags like #love forever; a trend is defined by rate-now versus rate-expected, which is exactly what the EMA baseline encodes.\nCommon mistake: proposing a batch job over the last hour of tweets. Trends are only valuable while they are happening; a MapReduce-style hourly job surfaces them after the moment has passed, which is why the pipeline must be streaming.",
    "Rate limiting the public API is a first-class subsystem, not an afterthought, because Twitter's API serves millions of third-party apps alongside its own clients. The classic published limits are concrete anchors: 300 home-timeline reads per 15-minute window per user token, 50 tweets per 24 hours per user, plus separate per-application quotas. Enforcement is a token bucket per (user, endpoint-class) and per (app, endpoint) stored in Redis: a Lua script performs read-refill-decrement atomically in a single round trip (~0.1ms), so the check adds negligible latency at the gateway. Responses carry x-rate-limit-remaining and x-rate-limit-reset headers, and exhausted buckets return 429 with Retry-After so well-behaved clients back off. Gateways may cache bucket state locally for ~1 second to shave hot-path latency, accepting slightly over-admitting in exchange.\nCommon mistake: enforcing limits with per-gateway in-memory counters — with 100 gateway instances behind a load balancer, a client that rotates connections gets ~100x the intended quota; the bucket must live in shared storage (or use bounded-error distributed quota splitting).\nIn practice: distinguish protective limits (keep the site up under abuse) from product limits (API pricing tiers); the same token-bucket machinery serves both, but product limits are configured per API key tier while protective limits are global circuit breakers.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Snowflake ID Generator: generates globally unique, roughly time-ordered 64-bit IDs without coordination",
      source: `#include <cstdint>
#include <chrono>
#include <mutex>
#include <stdexcept>

class SnowflakeIdGenerator {
public:
    // Custom epoch: Jan 1, 2020 00:00:00 UTC
    static constexpr int64_t CUSTOM_EPOCH = 1577836800000LL;
    static constexpr int WORKER_ID_BITS = 10;
    static constexpr int SEQUENCE_BITS = 12;
    static constexpr int64_t MAX_WORKER_ID = (1LL << WORKER_ID_BITS) - 1;  // 1023
    static constexpr int64_t MAX_SEQUENCE = (1LL << SEQUENCE_BITS) - 1;    // 4095

    explicit SnowflakeIdGenerator(int64_t workerId)
        : workerId_(workerId), sequence_(0), lastTimestamp_(-1) {
        if (workerId < 0 || workerId > MAX_WORKER_ID) {
            throw std::invalid_argument("Worker ID out of range");
        }
    }

    int64_t nextId() {
        std::lock_guard<std::mutex> lock(mutex_);
        int64_t timestamp = currentTimeMs();

        if (timestamp < lastTimestamp_) {
            // Clock moved backwards - refuse to generate
            throw std::runtime_error("Clock moved backwards. Refusing to generate ID.");
        }

        if (timestamp == lastTimestamp_) {
            // Same millisecond: increment sequence
            sequence_ = (sequence_ + 1) & MAX_SEQUENCE;
            if (sequence_ == 0) {
                // Sequence exhausted in this ms - wait for next ms
                timestamp = waitNextMillis(lastTimestamp_);
            }
        } else {
            // New millisecond: reset sequence
            sequence_ = 0;
        }

        lastTimestamp_ = timestamp;

        // Compose the 64-bit ID:
        // [41 bits timestamp][10 bits worker][12 bits sequence]
        return ((timestamp - CUSTOM_EPOCH) << (WORKER_ID_BITS + SEQUENCE_BITS))
             | (workerId_ << SEQUENCE_BITS)
             | sequence_;
    }

    // Extract timestamp from a generated ID (useful for time-range queries)
    static int64_t extractTimestamp(int64_t id) {
        return (id >> (WORKER_ID_BITS + SEQUENCE_BITS)) + CUSTOM_EPOCH;
    }

private:
    int64_t currentTimeMs() {
        using namespace std::chrono;
        return duration_cast<milliseconds>(
            system_clock::now().time_since_epoch()
        ).count();
    }

    int64_t waitNextMillis(int64_t lastTs) {
        int64_t ts = currentTimeMs();
        while (ts <= lastTs) {
            ts = currentTimeMs();
        }
        return ts;
    }

    int64_t workerId_;
    int64_t sequence_;
    int64_t lastTimestamp_;
    std::mutex mutex_;
};`,
    },
    {
      language: "cpp",
      caption: "Count-Min Sketch for trending topic detection: approximate frequency counting in constant memory",
      source: `#include <cstdint>
#include <vector>
#include <string>
#include <algorithm>
#include <functional>
#include <limits>

class CountMinSketch {
public:
    // depth = number of hash functions, width = counters per row
    // Twitter-scale: depth=5, width=1'000'000 => ~40MB memory
    CountMinSketch(size_t depth, size_t width)
        : depth_(depth), width_(width),
          table_(depth, std::vector<uint32_t>(width, 0)) {}

    void increment(const std::string& key, uint32_t count = 1) {
        for (size_t i = 0; i < depth_; ++i) {
            size_t idx = hash(key, i) % width_;
            table_[i][idx] += count;
        }
    }

    // Returns the minimum count across all hash rows (upper bound on true count)
    uint32_t estimate(const std::string& key) const {
        uint32_t minCount = std::numeric_limits<uint32_t>::max();
        for (size_t i = 0; i < depth_; ++i) {
            size_t idx = hash(key, i) % width_;
            minCount = std::min(minCount, table_[i][idx]);
        }
        return minCount;
    }

    void reset() {
        for (auto& row : table_) {
            std::fill(row.begin(), row.end(), 0);
        }
    }

private:
    size_t hash(const std::string& key, size_t seed) const {
        // FNV-1a variant with seed mixing
        uint64_t h = 14695981039346656037ULL ^ (seed * 6364136223846793005ULL);
        for (char c : key) {
            h ^= static_cast<uint64_t>(c);
            h *= 1099511628211ULL;
        }
        return static_cast<size_t>(h);
    }

    size_t depth_;
    size_t width_;
    std::vector<std::vector<uint32_t>> table_;
};

// Trending detector: compares current window frequency against rolling baseline
struct TrendingDetector {
    CountMinSketch currentWindow;
    CountMinSketch baselineWindow;
    double trendThresholdMultiplier;   // e.g., 3.0x
    uint32_t minAbsoluteCount;         // minimum tweets to qualify

    TrendingDetector(size_t depth, size_t width,
                     double threshold = 3.0, uint32_t minCount = 1000)
        : currentWindow(depth, width),
          baselineWindow(depth, width),
          trendThresholdMultiplier(threshold),
          minAbsoluteCount(minCount) {}

    void recordHashtag(const std::string& hashtag) {
        currentWindow.increment(hashtag);
    }

    bool isTrending(const std::string& hashtag) const {
        uint32_t current = currentWindow.estimate(hashtag);
        uint32_t baseline = baselineWindow.estimate(hashtag);
        if (current < minAbsoluteCount) return false;
        if (baseline == 0) return current >= minAbsoluteCount;
        return static_cast<double>(current) >
               trendThresholdMultiplier * static_cast<double>(baseline);
    }

    // Called every window rotation (e.g., every 5 minutes)
    void rotateWindow() {
        baselineWindow = currentWindow;  // current becomes new baseline
        currentWindow.reset();
    }
};`,
    },
    {
      language: "cpp",
      caption: "Fan-out service: hybrid write/read strategy based on follower count threshold",
      source: `#include <cstdint>
#include <vector>
#include <string>
#include <queue>
#include <unordered_set>

// Simplified interfaces representing downstream services
struct SocialGraphService {
    virtual std::vector<int64_t> getFollowerIds(int64_t userId) = 0;
    virtual int64_t getFollowerCount(int64_t userId) = 0;
    virtual ~SocialGraphService() = default;
};

struct TimelineCacheService {
    // Insert tweet ID into a user's timeline cache (Redis ZADD)
    virtual void insertIntoTimeline(int64_t userId, int64_t tweetId,
                                     double score) = 0;
    // Trim timeline to keep only the most recent N entries
    virtual void trimTimeline(int64_t userId, size_t maxSize) = 0;
    // Mark a user as needing read-time merge for celebrity tweets
    virtual void addCelebritySource(int64_t userId, int64_t celebrityId) = 0;
    virtual ~TimelineCacheService() = default;
};

class FanOutService {
public:
    static constexpr int64_t CELEBRITY_THRESHOLD = 5000;
    static constexpr size_t MAX_TIMELINE_SIZE = 800;
    static constexpr size_t FANOUT_BATCH_SIZE = 500;

    FanOutService(SocialGraphService* socialGraph,
                  TimelineCacheService* timelineCache)
        : socialGraph_(socialGraph), timelineCache_(timelineCache) {}

    // Called asynchronously when a new tweet is published
    void onNewTweet(int64_t authorId, int64_t tweetId) {
        int64_t followerCount = socialGraph_->getFollowerCount(authorId);

        if (followerCount <= CELEBRITY_THRESHOLD) {
            // Fan-out on write: push tweet to all followers' timelines
            fanOutOnWrite(authorId, tweetId);
        } else {
            // Celebrity path: do NOT fan out. Followers will merge
            // this author's tweets at read time.
            // Register this author as a celebrity source for all followers
            // (done lazily - followers discover celebrities they follow
            // and add them to their merge list on first timeline read)
            markAsCelebrityTweet(authorId, tweetId);
        }
    }

private:
    void fanOutOnWrite(int64_t authorId, int64_t tweetId) {
        // Fetch follower list in batches to avoid memory spikes
        std::vector<int64_t> followers = socialGraph_->getFollowerIds(authorId);

        // Score is the tweet ID itself (Snowflake IDs are time-ordered)
        double score = static_cast<double>(tweetId);

        // Process in batches for pipeline-friendly Redis writes
        for (size_t i = 0; i < followers.size(); i += FANOUT_BATCH_SIZE) {
            size_t end = std::min(i + FANOUT_BATCH_SIZE, followers.size());
            for (size_t j = i; j < end; ++j) {
                timelineCache_->insertIntoTimeline(followers[j], tweetId, score);
            }
            // Trim timelines to bounded size (Redis ZREMRANGEBYRANK)
            for (size_t j = i; j < end; ++j) {
                timelineCache_->trimTimeline(followers[j], MAX_TIMELINE_SIZE);
            }
        }
    }

    void markAsCelebrityTweet(int64_t authorId, int64_t tweetId) {
        // Store in celebrity tweet index - a per-author sorted list
        // that the Timeline Service queries at read time for merge.
        // Implementation: write to a dedicated celebrity timeline cache
        // keyed by author ID (not follower ID).
        timelineCache_->insertIntoTimeline(
            authorId | (1LL << 62),  // Use high bit to separate namespace
            tweetId,
            static_cast<double>(tweetId)
        );
    }

    SocialGraphService* socialGraph_;
    TimelineCacheService* timelineCache_;
};`,
    },
  ],
  diagrams: [
    {
      title: "Twitter High-Level Architecture",
      kind: "architecture",
      caption: "Layered architecture: tweet-post path (Tweet Service -> Kafka -> fan-out workers -> Redis) numbered 1-8, and home-timeline read path (Timeline Service -> Redis -> hydrate from store) numbered R1-R5",
      mermaid: `graph TB
    subgraph ClientsL["Clients"]
        Web["Web App"]
        Mobile["Mobile Apps<br/>iOS / Android"]
    end

    subgraph EdgeL["Edge"]
        CDN["CDN<br/>media + static assets"]
    end

    subgraph GatewayL["Gateway"]
        LB["Load Balancer<br/>L4 / L7"]
        APIGW["API Gateway<br/>auth + rate limiting"]
    end

    subgraph ServicesL["Services"]
        TweetSvc["Tweet Service<br/>validate + persist"]
        TimelineSvc["Timeline Service<br/>read + merge"]
        UserSvc["User / Social Graph<br/>Service"]
        SearchSvc["Search Service"]
        NotifSvc["Notification Service"]
        TrendsSvc["Trends Service"]
    end

    subgraph CacheL["Cache Layer"]
        RedisTL["Redis Timeline Caches<br/>tweet-ID list per user"]
        HotCache["Hot Tweet Cache<br/>memcached"]
    end

    subgraph AsyncL["Async Pipeline"]
        Kafka["Kafka Firehose<br/>TweetCreated events"]
        FanOut["Fan-out Workers"]
        Flink["Streaming Compute<br/>Flink - windowed counts"]
        Indexer["Search Indexer Workers"]
    end

    subgraph DataL["Data Stores"]
        TweetDB["Tweet Store<br/>MySQL / Manhattan KV"]
        GraphDB["Social Graph Store<br/>FlockDB-style"]
        ES["Elasticsearch / Earlybird<br/>time-partitioned index"]
        S3["S3 Object Store<br/>images + video"]
    end

    subgraph RealtimeL["Realtime"]
        WS["WebSocket Gateway<br/>streaming API + push"]
    end

    Web --> CDN
    Mobile --> CDN
    CDN --> S3
    Web --> LB
    Mobile --> LB
    LB --> APIGW

    APIGW -- "1. POST /tweet" --> TweetSvc
    TweetSvc -- "2. persist tweet" --> TweetDB
    TweetSvc -- "3. store media" --> S3
    TweetSvc -- "4. publish event" --> Kafka
    Kafka -- "5. TweetCreated" --> FanOut
    FanOut -- "6. get follower IDs" --> UserSvc
    UserSvc -- "7. read follow graph" --> GraphDB
    FanOut -- "8. LPUSH + LTRIM" --> RedisTL

    APIGW -- "R1. GET /home_timeline" --> TimelineSvc
    TimelineSvc -- "R2. LRANGE tweet IDs" --> RedisTL
    TimelineSvc -- "R3. hydrate bodies" --> HotCache
    HotCache -- "R4. miss" --> TweetDB
    TimelineSvc -- "R5. celebrity merge" --> UserSvc

    Kafka --> Indexer
    Indexer --> ES
    SearchSvc --> ES
    APIGW --> SearchSvc
    Kafka --> Flink
    Flink --> TrendsSvc
    APIGW --> TrendsSvc
    Kafka --> NotifSvc
    NotifSvc --> WS
    WS --> Web
    WS --> Mobile`,
    },
    {
      title: "Tweet Fan-Out Decision Flow",
      kind: "flow",
      caption: "Hybrid fan-out strategy: write-path for normal users, read-path merge for celebrities",
      mermaid: `flowchart TD
    NewTweet["New Tweet Published"]
    GetCount["Get Author Follower Count"]
    Check{"Followers > 5000?"}
    FOW["Fan-Out on Write"]
    FOR["Fan-Out on Read"]
    GetFollowers["Fetch Follower List"]
    WriteBatch["Batch Write to Redis Timelines"]
    Trim["Trim Each Timeline to 800 Entries"]
    Done1["Followers See Tweet Immediately"]
    StoreCeleb["Store in Celebrity Tweet Index"]
    ReadTime["At Read Time: Merge Celebrity Tweets"]
    Done2["Timeline Assembled on Demand"]

    NewTweet --> GetCount
    GetCount --> Check
    Check -- No --> FOW
    Check -- Yes --> FOR
    FOW --> GetFollowers
    GetFollowers --> WriteBatch
    WriteBatch --> Trim
    Trim --> Done1
    FOR --> StoreCeleb
    StoreCeleb --> ReadTime
    ReadTime --> Done2`,
    },
    {
      title: "Tweet Posting Sequence",
      kind: "sequence",
      caption: "End-to-end flow from a user posting a tweet through fan-out and notification",
      mermaid: `sequenceDiagram
    participant User
    participant API as API Gateway
    participant Tweet as Tweet Service
    participant Store as Tweet Store
    participant K as Kafka
    participant FO as Fan-Out Service
    participant SG as Social Graph
    participant R as Redis Cache
    participant Notif as Notification Service

    User->>API: POST /tweet
    API->>Tweet: Validate and Create Tweet
    Tweet->>Store: Write Tweet with Snowflake ID
    Store-->>Tweet: Ack
    Tweet->>K: Publish TweetCreated Event
    Tweet-->>API: 201 Created
    API-->>User: Tweet Posted
    K->>FO: Consume TweetCreated
    FO->>SG: Get Follower Count
    SG-->>FO: Count
    FO->>SG: Get Follower IDs
    SG-->>FO: Follower List
    FO->>R: Batch ZADD to Follower Timelines
    R-->>FO: Ack
    K->>Notif: Consume for Mentions
    Notif->>User: Push Notification`,
    },
    {
      title: "Trending Topic Detection Pipeline",
      kind: "flow",
      caption: "Streaming pipeline from raw tweets to trending topics using Count-Min Sketch and baseline comparison",
      mermaid: `flowchart TD
    Firehose["Tweet Firehose via Kafka"]
    Extract["Extract Hashtags and Phrases"]
    CMS["Update Count-Min Sketch"]
    HLL["Update HyperLogLog per Topic"]
    Compare["Compare Current Rate vs Baseline EMA"]
    Check{"Rate > 3x Baseline AND Distinct Users > Threshold?"}
    Trending["Flag as Trending"]
    Filter["Discard - Not Trending"]
    Rank["Rank by Velocity and Volume"]
    Serve["Serve to Trending API"]
    Rotate["Rotate Window Every 5 Min"]

    Firehose --> Extract
    Extract --> CMS
    Extract --> HLL
    CMS --> Compare
    HLL --> Compare
    Compare --> Check
    Check -- Yes --> Trending
    Check -- No --> Filter
    Trending --> Rank
    Rank --> Serve
    CMS --> Rotate`,
    },
  ],
  interviewQA: [
    {
      q: "Why does Twitter use a hybrid fan-out approach instead of pure fan-out on write or pure fan-out on read?",
      a: "Pure fan-out on write fails for celebrity users. When a user with 50 million followers tweets, writing to 50 million Redis timelines would take minutes of cumulative worker time, blocking the fan-out pipeline for all other tweets. Pure fan-out on read is also problematic: if a user follows 500 accounts, assembling their timeline at read time would require 500 separate fetches and a merge sort, resulting in high latency. The hybrid approach gets the best of both: normal users (under ~5,000 followers) use fan-out on write for instant delivery with manageable cost, while celebrity tweets are merged at read time. Since most users follow only a handful of celebrities, the read-time merge overhead is small (10-20ms per celebrity). This keeps the median timeline fetch under 50ms while preventing pipeline stalls from viral accounts.",
      followUps: [
        "How would you handle a user who follows 200 celebrities? Does the read merge become too slow?",
        "What happens to a user's timeline if the fan-out service falls behind due to a traffic spike?",
        "How do you handle the transition when a user crosses the celebrity threshold?",
      ],
    },
    {
      q: "How would you design the tweet search system to index tweets in near real-time?",
      a: "The search system uses an inverted index partitioned by time. New tweets arrive via Kafka and are tokenized, analyzed for entities (hashtags, mentions, URLs), and inserted into an in-memory index segment. This in-memory segment provides sub-second search latency for the most recent tweets. Periodically (every few minutes), the in-memory segment is flushed to an on-disk segment in an immutable SSTable-like format. Queries are scattered to all time-partitioned shards in parallel and results are gathered and ranked by a scoring function that blends recency, engagement signals (retweet/like count), author authority, and query relevance. Old segments are periodically compacted and eventually aged out to cold storage. The key insight is that most search queries care about recent results, so the in-memory segment handles the hottest reads.",
      followUps: [
        "How would you handle search ranking that accounts for personalization?",
        "What consistency guarantees does the search system provide?",
      ],
    },
    {
      q: "How does Snowflake ID generation avoid coordination overhead across thousands of servers?",
      a: "Snowflake avoids coordination by partitioning the ID space using machine/worker IDs. Each of the 1,024 possible workers generates IDs independently using its local clock and a per-millisecond sequence counter. No two workers share the same worker ID, so no two workers can generate the same ID even without communication. The 41-bit timestamp component ensures rough chronological ordering, which is critical for timeline queries that use ID-based range scans. The 12-bit sequence allows each worker to produce up to 4,096 IDs per millisecond before needing to wait for the next millisecond. Worker IDs are assigned via ZooKeeper at startup to prevent duplicates. The only failure mode is clock skew: if a worker's clock jumps backward, it must refuse to generate IDs until the clock catches up, preventing duplicate timestamps from producing colliding IDs.",
      followUps: [
        "What happens if ZooKeeper is unavailable when a new worker tries to start?",
        "How would you extend Snowflake to support more than 1,024 workers?",
      ],
    },
    {
      q: "How would you handle the 'thundering herd' problem when a celebrity tweet causes millions of timeline reads?",
      a: "A celebrity tweet can cause a surge of timeline reads as followers open the app and see push notifications. The primary defense is the fan-out on read design: since the celebrity tweet is not pre-materialized in follower timelines, there is no write amplification. However, millions of concurrent reads of the celebrity's recent tweets can still overload the Tweet Service. The solution is multi-layered caching: the celebrity's recent tweets are cached at the API gateway level and in a dedicated hot-tweet cache. A request coalescing layer (also called single-flight or read-through deduplication) ensures that concurrent requests for the same tweet ID result in only one backend fetch, with all waiting requests receiving the same response. TTLs are set short (5-10 seconds) so engagement counts stay reasonably fresh. For extreme viral events, a circuit breaker degrades engagement counts to approximate values from a sampling-based counter.",
      followUps: [
        "How would you implement the request coalescing layer?",
        "What metrics would you monitor to detect a thundering herd in real-time?",
      ],
    },
    {
      q: "How would you design the notification system to handle a tweet that gets millions of likes in minutes?",
      a: "The notification system must handle extreme write amplification when a tweet goes viral. The key design principle is to decouple notification generation from delivery. Notification events (like, retweet, reply, mention) flow through a Kafka topic partitioned by the notification recipient's user ID, ensuring ordering per user. A notification aggregation service groups related events: instead of sending 10,000 individual 'X liked your tweet' notifications, it sends 'Your tweet was liked 10,000 times.' Aggregation windows are adaptive: 30 seconds during normal load, expanding to 5 minutes during viral spikes. Connected users receive real-time updates via WebSocket connections to a gateway service, while disconnected users accumulate notifications in a per-user inbox stored in a durable key-value store. Push notifications to mobile devices are rate-limited and coalesced to avoid notification fatigue, with a maximum of one push per tweet per time window regardless of engagement volume.",
      followUps: [
        "How would you handle notification preferences (mute, filter by type)?",
        "What happens if the Kafka consumer falls behind during a viral event?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for Twitter. What are the key numbers and what do they imply for the design?",
      a: "Start from 250M DAU and 500M tweets/day. Writes: 500M / 86,400s = ~5,800 tweets/sec average; with a 3x peak factor, design for ~18,000 writes/sec. Reads: at ~10 home-timeline loads per DAU per day, 2.5B loads/day = ~29,000 QPS average, ~90,000 peak; each load hydrates ~20 tweets, so the tweet-fetch tier sees ~1.8M lookups/sec at peak — implying tweet bodies must be served almost entirely from cache. Storage: ~1KB per tweet including metadata gives ~500GB/day of text (~180TB/year, ~540TB with 3x replication); media dominates at ~10TB/day if 10% of tweets carry a 200KB image. Fan-out: 5,800 tweets/sec x ~200 average followers = ~1.2M timeline-cache inserts/sec for the async pipeline. The implications: the read:write asymmetry justifies precomputing timelines (fan-out on write), the fan-out insert volume justifies an async Kafka pipeline with horizontally scalable workers, and the hydration volume justifies a dedicated hot-tweet cache in front of the store.",
      followUps: [
        "How would the numbers change if average follower count were 2,000 instead of 200?",
        "How much Redis memory do the timeline caches need, and how would you shard it?",
      ],
    },
    {
      q: "Would you use a Redis list or a sorted set for the home timeline cache? Justify the choice.",
      a: "Both work; the trade-off is memory versus operational convenience. A list is the leaner choice: fan-out does LPUSH plus LTRIM 0 799 to cap at ~800 entries, reads are a single LRANGE, and per-entry overhead is minimal (~16KB per user at 800 8-byte IDs), which matters when you multiply by 250M cached users (~4TB). A sorted set scored by Snowflake ID costs roughly 2x the memory but gives three things: idempotent inserts (a duplicate ZADD from a Kafka redelivery is a harmless no-op, whereas LPUSH would duplicate the entry), score-based cursor pagination via ZRANGEBYSCORE (stable even as new tweets arrive), and cheap ordered merges when backfilling. If the fan-out pipeline guarantees exactly-once-ish delivery and pagination uses ID cursors against the list, choose the list for cost; if redeliveries are common, the ZSET's idempotency usually pays for itself. Either way, store only tweet IDs — bodies are hydrated from a separate cache, which keeps entries tiny and makes deletes free.",
      followUps: [
        "How do you paginate deeper than the 800 cached entries?",
        "How would you deduplicate if you kept the list but Kafka redelivered events?",
      ],
    },
    {
      q: "How would you rate limit the public Twitter API across a fleet of API gateway instances?",
      a: "Use token buckets keyed by (user token, endpoint class) and (application, endpoint), stored centrally in Redis so all gateway instances see the same bucket. Each request runs a small Lua script that atomically reads the bucket, refills tokens based on elapsed time, and decrements — one round trip, ~0.1ms, no race conditions. Concrete limits mirror Twitter's published ones: 300 timeline reads per 15 minutes per user, 50 tweets per 24 hours. On exhaustion return 429 with Retry-After, and include x-rate-limit-remaining/x-rate-limit-reset headers on every response so clients can self-regulate. To shave hot-path latency, gateways can cache bucket state locally for ~1 second, accepting bounded over-admission. Shard the rate-limit Redis by key hash so it scales with traffic, and fail open (allow with logging) if the limiter itself is down — availability of the core product should not hinge on the limiter.",
      followUps: [
        "Why token bucket rather than a fixed-window counter? What is the burst behavior difference?",
        "Is failing open the right call for a write endpoint like POST /tweet?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Why does Twitter use fan-out on write only for users with fewer than ~5,000 followers?",
      options: [
        "Because users with fewer followers have simpler social graphs that are easier to traverse",
        "Because the cumulative Redis write cost scales linearly with follower count and becomes pipeline-blocking above the threshold",
        "Because small accounts produce less engaging content that needs faster delivery",
        "Because Redis sorted sets have a hard limit of 5,000 entries",
      ],
      answerIndex: 1,
      explanation: "At ~1ms per Redis write, fanning out to 5,000 followers takes about 5 seconds of worker time, which is the upper bound of acceptable cost. Beyond this, the fan-out pipeline throughput for all users degrades, and celebrity-scale accounts (millions of followers) would block the pipeline for minutes.",
    },
    {
      q: "What is the primary purpose of using a Count-Min Sketch in trending topic detection?",
      options: [
        "To store the exact frequency of every hashtag with perfect accuracy",
        "To provide approximate frequency counts in bounded memory with controllable error rate",
        "To sort hashtags by popularity using a min-heap",
        "To deduplicate tweets containing the same hashtag",
      ],
      answerIndex: 1,
      explanation: "Count-Min Sketch is a probabilistic data structure that trades perfect accuracy for dramatically reduced memory usage. With 5 hash functions and ~1M counters per row, it uses ~40MB to track millions of distinct hashtags, compared to gigabytes for exact counting. The minimum-across-rows query provides an estimate that never underestimates the true count.",
    },
    {
      q: "In Twitter's Snowflake ID scheme, why is the timestamp placed in the most significant bits?",
      options: [
        "To make the IDs compatible with UUID format",
        "To ensure IDs are roughly chronologically sorted, enabling efficient time-range queries",
        "To reduce the number of bits needed for the sequence counter",
        "To make IDs easier to read in hexadecimal format",
      ],
      answerIndex: 1,
      explanation: "Placing the timestamp in the high-order bits means that IDs generated later have numerically larger values. This allows Redis ZRANGEBYSCORE on timeline sorted sets and database range scans to efficiently retrieve tweets in chronological order without a separate timestamp index.",
    },
    {
      q: "What is the main benefit of time-partitioning the tweet search index?",
      options: [
        "It allows different encryption keys per time period",
        "It enables independent scaling of recent vs. historical search, with the hottest data in memory",
        "It reduces the total number of tweets that need to be indexed",
        "It eliminates the need for query result ranking",
      ],
      answerIndex: 1,
      explanation: "Most search queries prioritize recent tweets. By keeping the newest segment in memory, Twitter achieves sub-second search latency for the most common case. Older segments on disk serve long-tail queries. Segments can be independently compacted, aged out, or replicated based on access patterns, and the in-memory segment provides the fastest write path for real-time indexing.",
    },
  ],
  flashcards: [
    {
      front: "What is Twitter's approximate scale for tweets per day and daily active users?",
      back: "~500 million tweets per day (~5,800/sec) with ~400 million daily active users. The read-to-write ratio is approximately 1000:1.",
    },
    {
      front: "What is the fan-out threshold and why that number?",
      back: "~5,000 followers. At ~1ms per Redis write, fanning out to 5,000 followers takes ~5s of worker time. Beyond this, the cost grows linearly and blocks the shared fan-out pipeline, degrading delivery for all users.",
    },
    {
      front: "How is a Snowflake ID structured (64 bits)?",
      back: "41 bits: timestamp (ms since custom epoch, ~69 years). 10 bits: worker/machine ID (1,024 workers). 12 bits: sequence number (4,096 IDs per ms per worker). Timestamp-first ensures chronological sorting.",
    },
    {
      front: "What is Count-Min Sketch and why use it for trending topics?",
      back: "A probabilistic data structure with a 2D array of counters and multiple hash functions. Provides approximate frequency counts that never underestimate, using ~40MB to track millions of hashtags vs. gigabytes for exact counts. Ideal for streaming data with bounded memory.",
    },
    {
      front: "How does Twitter detect trending topics?",
      back: "A streaming pipeline processes the tweet firehose through Count-Min Sketch for frequency and HyperLogLog for distinct user counts. A topic trends when its current rate exceeds the rolling baseline by 3-5x and has sufficient distinct users (filtering bot spam).",
    },
    {
      front: "What happens when a Redis timeline cache node fails?",
      back: "The system degrades gracefully: on a cache miss, the Timeline Service rebuilds the user's timeline from the tweet store and social graph (adding ~50-100ms latency). The fan-out service buffers events in Kafka and retries with exponential backoff.",
    },
    {
      front: "How does Twitter handle search indexing in near real-time?",
      back: "New tweets flow via Kafka to an in-memory index segment (sub-second latency). Periodically, segments flush to disk in immutable SSTable format. Queries scatter to all time-partitioned shards in parallel and gather-merge results by relevance score.",
    },
    {
      front: "What is request coalescing and when is it used?",
      back: "When millions of users request the same celebrity tweet simultaneously, request coalescing ensures only one backend fetch occurs. All concurrent requests for the same key wait on a single in-flight request and share the result. Prevents thundering herd on the Tweet Service.",
    },
    {
      front: "Derive Twitter's write and read QPS from first principles.",
      back: "Writes: 500M tweets/day / 86,400s = ~5,800/sec avg, ~18K peak (3x factor). Reads: 250M DAU x 10 timeline loads/day = 2.5B/day = ~29K QPS avg, ~90K peak. Each load hydrates ~20 tweets => ~1.8M tweet fetches/sec at peak, so bodies must come from cache.",
    },
    {
      front: "What is the 'Justin Bieber problem' with numbers?",
      back: "Pure fan-out on write fails for mega-accounts: ~110M followers x ~1ms per Redis write = 110M ms = ~30 hours of sequential worker time per tweet (~2 min even across 1,000 workers). Solution: skip fan-out for celebrities and merge their tweets at read time.",
    },
    {
      front: "How much Redis memory do home timeline caches need?",
      back: "Store only tweet IDs: 800 entries x ~20 bytes = ~16KB/user (list). 250M active users => ~4TB (roughly 12TB with sorted sets). Shard by user ID with consistent hashing (~100 primaries + replicas); evict users inactive >30 days and rebuild on next login.",
    },
    {
      front: "What are Twitter's classic public API rate limits and how are they enforced?",
      back: "300 timeline reads / 15 min per user token; 50 tweets / 24h per user; separate per-app quotas. Enforced by token buckets in shared Redis, updated atomically via a Lua script at the API gateway; 429 + Retry-After when exhausted.",
    },
  ],
  exercises: [
    "Design the data model for the Social Graph Service. Define the storage schema for follow relationships, considering queries like 'get all followers of user X,' 'get all users that X follows,' and 'does X follow Y?' Estimate storage requirements for 400M users with an average of 500 follows each.",
    "Implement a timeline merge algorithm that combines a pre-computed Redis timeline (fan-out on write results) with recent tweets from 20 celebrity accounts the user follows. The merge must maintain chronological order, handle duplicates, and complete within a 50ms budget. Discuss how you would handle pagination.",
    "Design a rate limiting system for the Twitter API that supports per-user limits (300 requests/15min for reads, 50 tweets/24hr for writes), per-application limits, and endpoint-specific limits. The system must work across multiple API gateway instances without requiring synchronous coordination for every request.",
    "Estimate the Redis memory requirements for storing home timelines. Assume 400M DAU, each timeline stores up to 800 tweet IDs (8 bytes each), and a Redis sorted set overhead of ~100 bytes per entry. How would you shard across Redis instances? What is your replication strategy?",
    "Design the media upload pipeline for tweets with images and videos. Cover upload flow (chunked uploads for large videos), processing pipeline (image resizing to 4 variants, video transcoding to 3 quality levels), storage in object store, CDN distribution, and how the tweet references media that may still be processing when the tweet is posted.",
  ],
  revisionNotes: [
    "Twitter: ~500M tweets/day, ~400M DAU, read-to-write ratio ~1000:1. Timeline reads dominate system load.",
    "Fan-out on write for users with <5K followers (push to Redis). Fan-out on read for celebrities (merge at query time).",
    "Snowflake IDs: 41-bit timestamp + 10-bit worker + 12-bit sequence = 64-bit globally unique, time-ordered, coordination-free.",
    "Timeline cache: Redis ZSET per user, scored by tweet ID. Max 800 entries. Sharded by user ID with consistent hashing.",
    "Tweet store: Manhattan (distributed KV store). Tweets keyed by Snowflake ID. Replicated across data centers.",
    "Search: Earlybird (Lucene-based), time-partitioned index. In-memory for recent, on-disk for older. Sub-second indexing latency.",
    "Trending: Count-Min Sketch + HyperLogLog on tweet firehose. Trend = current rate > 3x baseline EMA + distinct user threshold.",
    "Notifications: Kafka per-recipient, aggregation windows (30s normal, 5min viral), WebSocket for connected, inbox for offline.",
    "Failure handling: Kafka buffering on Redis failure, circuit breakers, graceful degradation (stale trends, delayed search).",
    "CDN for all media. Images resized to 4 variants. Videos transcoded async. Tweet references media before processing completes.",
    "Capacity math: 500M/86,400 = ~5.8K writes/sec avg, ~18K peak. 250M DAU x 10 loads = ~29K timeline QPS avg, ~90K peak. ~1.8M tweet hydrations/sec peak => cache everything.",
    "Justin Bieber problem: 110M followers x 1ms/write = ~30h sequential fan-out per tweet. Celebrities bypass fan-out entirely; read-time k-way merge, dedup by tweet ID at threshold crossings.",
    "Timeline cache sizing: 800 IDs x ~20B = ~16KB/user; 250M users = ~4TB Redis (lists) or ~12TB (ZSETs). IDs only, never bodies — makes deletes free.",
    "Search pipeline: Kafka (partitioned by tweet ID) -> indexer workers -> bulk index into Elasticsearch daily indices with hot-index alias; tombstones for deletes; searchable within ~5s.",
    "Rate limiting: token bucket per (user, endpoint) in shared Redis via atomic Lua script. 300 reads/15min, 50 tweets/24h. 429 + Retry-After; never per-gateway in-memory counters.",
  ],
  cheatSheet: [
    "Scale: 500M tweets/day | 400M DAU | ~5800 tweets/sec | read:write ~1000:1",
    "Fan-out threshold: ~5K followers. Below: push to Redis. Above: merge at read time.",
    "Snowflake: 41b timestamp | 10b worker | 12b sequence | 4096 IDs/ms/worker",
    "Timeline: Redis ZSET | score=tweet ID | max 800 entries | shard by userID",
    "Tweet Store: Manhattan KV | key=snowflake ID | replicated cross-DC",
    "Search: Earlybird on Lucene | time-partitioned | in-memory hot segment | scatter-gather",
    "Trending: Count-Min Sketch (5 hashes x 1M counters ~40MB) + HyperLogLog for distinct users",
    "Event bus: Kafka for fan-out, search indexing, notifications, analytics - all async",
    "Caching layers: CDN for media, Redis for timelines, API-level cache for hot tweets",
    "Failure modes: Kafka backpressure on overload, circuit breakers, stale-but-available degradation",
    "Capacity: 500M/day / 86,400 = ~5.8K writes/s avg, ~18K peak | ~29K timeline QPS avg, ~90K peak | ~1.8M tweet fetches/s peak",
    "Fan-out volume: 5.8K tweets/s x ~200 followers = ~1.2M Redis inserts/s | Bieber: 110M followers x 1ms = ~30h => read-path",
    "Timeline Redis sizing: 800 IDs x 20B = 16KB/user | 250M users = ~4TB (lists), ~12TB (ZSETs) | IDs only, hydrate bodies separately",
    "Rate limits: 300 reads/15min, 50 tweets/24h | token bucket in shared Redis + Lua | 429 + Retry-After | fail open with logging",
    "Storage: ~1KB/tweet => 500GB/day text, ~540TB/yr with 3x replication | media ~10TB/day => S3 + CDN",
  ],
  glossary: [
    {
      term: "Fan-out on Write",
      definition: "A strategy where a new tweet is eagerly pushed into the timeline cache of every follower at write time. Low read latency but high write amplification proportional to follower count.",
    },
    {
      term: "Fan-out on Read",
      definition: "A strategy where a user's timeline is assembled at read time by fetching recent tweets from each followed account and merging them. Avoids write amplification but increases read latency.",
    },
    {
      term: "Snowflake ID",
      definition: "A 64-bit distributed ID generation scheme using timestamp, worker ID, and sequence number. Produces roughly time-ordered, globally unique IDs without coordination between workers.",
    },
    {
      term: "Count-Min Sketch",
      definition: "A probabilistic data structure for approximate frequency counting in streaming data. Uses a 2D array of counters with multiple hash functions. Estimates never undercount but may slightly overcount due to hash collisions.",
    },
    {
      term: "HyperLogLog",
      definition: "A probabilistic data structure for estimating the cardinality (count of distinct elements) of a set using logarithmic memory. Used in trending detection to count distinct users discussing a topic.",
    },
    {
      term: "Earlybird",
      definition: "Twitter's real-time search engine built on Apache Lucene. Uses time-partitioned inverted indexes with an in-memory segment for the newest tweets, enabling sub-second search indexing latency.",
    },
    {
      term: "Request Coalescing",
      definition: "A technique where multiple concurrent requests for the same resource are collapsed into a single backend fetch. All waiting callers receive the same response, preventing thundering herd on hot keys.",
    },
    {
      term: "Firehose",
      definition: "The full real-time stream of every public tweet, typically carried on Kafka. Internal consumers (search indexers, trends jobs, analytics) subscribe to it; a filtered version is exposed externally as the streaming API.",
    },
    {
      term: "Timeline Hydration",
      definition: "The second phase of a timeline read: the cache returns only tweet IDs, and the service batch-fetches the current tweet bodies, author profiles, and counters for those IDs. Keeps caches small and makes deletes/edits automatically consistent.",
    },
    {
      term: "Write Amplification",
      definition: "When one logical write triggers many physical writes — e.g., one tweet from a 200-follower account causes 200 timeline-cache inserts. Fan-out on write trades write amplification for cheap reads.",
    },
    {
      term: "Token Bucket",
      definition: "A rate-limiting algorithm where each client has a bucket that refills at a fixed rate up to a burst capacity; each request consumes a token. Allows short bursts while enforcing a long-run average rate, unlike rigid fixed-window counters.",
    },
    {
      term: "Manhattan",
      definition: "Twitter's internal distributed key-value database, used as the primary tweet store and for per-user data like notification inboxes. In interview answers, sharded MySQL or Cassandra plays the same role.",
    },
  ],
  animations: [
    {
      title: "Posting and reading a timeline",
      steps: [
        {
          label: "Tweet written",
          detail: "Stored once, keyed by tweet id, in a write-optimised store.",
        },
        {
          label: "Fan-out on write",
          detail: "Tweet id pushed to followers' timeline lists in Redis, capped at a few hundred entries.",
        },
        {
          label: "Celebrity exception",
          detail: "Above a follower threshold, skip fan-out and merge at read time.",
        },
        {
          label: "Home timeline read",
          detail: "Fetch the precomputed id list, then hydrate tweet bodies from cache.",
        },
        {
          label: "Ranking",
          detail: "Applied after retrieval — a separate concern from getting the candidate set.",
        },
        {
          label: "Search",
          detail: "A separate inverted index updated asynchronously; never query the primary store for text search.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Fan-out on Write", "Fan-out on Read", "Hybrid Approach"],
    rows: [
      [
        "Write cost per tweet",
        "O(followers) Redis writes",
        "O(1) - store tweet only",
        "O(followers) if < 5K, else O(1)",
      ],
      [
        "Read latency",
        "Low - timeline pre-computed in Redis",
        "High - must fetch and merge from N sources",
        "Low for most users, slight overhead for celebrity merge",
      ],
      [
        "Celebrity tweet handling",
        "Catastrophic - millions of writes per tweet, pipeline blocking",
        "Efficient - no write amplification",
        "Efficient - celebrities use read path only",
      ],
      [
        "Storage cost",
        "High - every tweet duplicated across follower timelines",
        "Low - single copy per tweet",
        "Moderate - duplication only for non-celebrity tweets",
      ],
      [
        "Consistency",
        "Eventual - async fan-out has delivery lag",
        "Strong - always reads latest tweets",
        "Mixed - pre-computed may lag, celebrity tweets always fresh",
      ],
      [
        "Failure impact",
        "Redis failure loses pre-computed timelines, requires rebuild",
        "Tweet store failure blocks all reads",
        "Graceful - Redis failure degrades to read-path, Kafka buffers writes",
      ],
    ],
  },
  followUps: [
    "How would you add a ranked/algorithmic timeline on top of the chronological timeline infrastructure?",
    "How would you design the direct messaging (DM) system with end-to-end encryption?",
    "How would you handle tweet deletion propagation across all caches, search indexes, and CDN?",
    "How would you design Twitter Spaces (live audio rooms) with thousands of concurrent listeners?",
    "How would you implement a content moderation pipeline that can review tweets in real-time before they appear in search and timelines?",
    "How would you extend this design to support Twitter Communities or topic-based feeds?",
    "How would you support editable tweets while keeping timelines, search, and embedded quote-tweets consistent?",
    "How would you serve like/retweet counters at 1.8M reads/sec without hot-key contention on viral tweets?",
    "How would you shard the social graph store when a single account has 100M+ followers (a single unsplittable adjacency list)?",
  ],
  resources: [
    {
      label: "How Twitter Handles 3,000 Images Per Second",
      kind: "article",
      note: "Detailed writeup of Twitter's media processing pipeline and CDN architecture",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapters on stream processing, partitioning, and replication directly applicable to Twitter's architecture",
    },
    {
      label: "Twitter's Snowflake ID Generator (GitHub)",
      kind: "repo",
      note: "Original open-source implementation of the Snowflake distributed ID generator",
    },
    {
      label: "The Infrastructure Behind Twitter: Scale (QCon Talk)",
      kind: "video",
      note: "Engineering talk covering timeline delivery, fan-out strategies, and caching architecture",
    },
    {
      label: "Earlybird: Real-Time Search at Twitter (ICDE 2012)",
      kind: "article",
      note: "Academic paper describing Twitter's real-time search indexing system built on Lucene",
    },
  ],
};
