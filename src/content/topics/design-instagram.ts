import type { TopicContent } from "../types";

export const designInstagram: TopicContent = {
  quickSummary: [
    "Instagram serves ~2B monthly active users, handling ~100M photo uploads/day and ~500M stories/day. The core challenge is building a photo-sharing platform that can ingest, process, store, and serve billions of media assets with sub-second latency worldwide.",
    "Photos follow a write-once-read-many pattern: each upload is resized into multiple resolutions (thumbnail 150px, feed 640px, full 1080px), stored in object storage (S3), and served via a global CDN. Consistent hashing distributes media across storage nodes to ensure balanced load and minimal reshuffling when nodes join or leave.",
    "The home feed uses a hybrid fan-out strategy: fan-out on write for users with fewer than ~10K followers (pre-computing feeds in Redis sorted sets), and fan-out on read for celebrity accounts to avoid writing to millions of feed caches per post. A ranking model scores candidate posts by recency, engagement, and relationship affinity.",
    "Stories are ephemeral (24-hour TTL) and stored separately from the permanent photo graph. They are distributed via a push model to close friends and followers, with aggressive CDN caching since each story is viewed by many users within a short window.",
    "The Explore/Discovery service uses collaborative filtering and content-based signals (image embeddings from CNNs, engagement velocity, hashtag co-occurrence) to recommend posts from accounts a user does not follow, driving ~50% of new account discovery.",
  ],
  detailed: [
    "## Requirements: What You Are Actually Building\n\nInstagram is a read-heavy, media-heavy social platform, and every design decision follows from that. Functional requirements: photo/video upload with filters, stories (24h ephemeral media), a personalized home feed, explore/discovery, direct messaging, likes, comments, follow/unfollow, and search over users and hashtags. Non-functional requirements: sub-200ms p99 feed load, 99.99% availability, eventual consistency (a post appearing in followers' feeds a few seconds late is acceptable — a lost photo is not), durability of media (11 nines via object storage), and global low latency.\n\nKey insight: the read-to-write ratio is roughly 100:1, so the system is designed around caching and precomputation — you pay extra work at write time (fan-out, renditions) to make reads nearly free.\n\nCommon mistake: jumping straight to the feed algorithm without pinning down NFRs. Interviewers want to hear that media durability is non-negotiable while feed freshness is negotiable; that asymmetry justifies the async architecture.",
    "## Capacity Estimation: Do the Arithmetic Out Loud\n\nAlways derive QPS, storage, and bandwidth from a small set of stated assumptions — the numbers below are the ones the rest of this design references.\n\n- **Users:** 2B MAU, 500M DAU.\n- **Write QPS:** 100M photo uploads/day / 86,400 s ≈ **1,160 uploads/sec average**; assume a 3x peak factor → **~3,500 uploads/sec peak**. Likes/comments add ~10x that in tiny metadata writes.\n- **Read QPS:** 500M DAU × 10 feed loads/day = 5B feed reads/day ≈ **58K feed QPS average, ~175K peak**. Each feed page also triggers 10-20 CDN media fetches.\n- **Storage per photo:** ~2MB original + renditions (1080px ~500KB, 640px ~300KB, 150px thumbnail ~20KB) ≈ **~3MB total per photo**.\n- **Storage growth:** 100M/day × 3MB = **~300TB/day ≈ 110PB/year** of new media. With erasure coding (1.5x overhead) that is ~165PB/year raw; with naive 3x replication it would be 330PB/year — which is why large object stores use erasure coding.\n- **Metadata:** ~1KB per post × 100M/day ≈ 100GB/day — trivially small next to media, which is why metadata and blobs live in different systems.\n- **Egress bandwidth:** 500M DAU × 20 photos viewed × ~300KB rendition ≈ 3PB/day ≈ **~280Gbps average, ~800Gbps peak**. At a 95% CDN hit rate, origin (S3) egress drops to ~15-40Gbps — the CDN is what makes the bandwidth bill and the origin load survivable.\n- **Cache sizing (80/20 rule):** 20% of content serves ~80% of reads. Feed cache: 500M active users × 800 post IDs × ~60B per Redis sorted-set entry ≈ **~24TB**, sharded across ~100 Redis nodes at 256GB each. Hot metadata cache: 20% of a day's posts × 1KB ≈ 20GB — fits in a handful of nodes.\n\nIn practice: interviewers care less about the exact numbers than that your arithmetic is visible and your conclusions follow from it — 'media dwarfs metadata, reads dwarf writes, therefore object store + CDN + precomputed feeds.'",
    "## Component Choices: Name Real Technology and Say Why\n\nEach component maps to a concrete, defensible technology choice. **PostgreSQL (sharded by user ID)** stores users, follows, and post metadata: relational integrity for the social graph, secondary indexes for lookups, and mature online-schema-change tooling. **Cassandra** stores feed timelines and activity streams: it is write-optimized (LSM trees), partitions naturally by user ID, and tolerates the eventual consistency the feed already accepts — a perfect fit for billions of small time-ordered writes from fan-out. **S3** holds originals and renditions: 11-nines durability, effectively infinite capacity, and presigned URLs let clients upload directly without proxying bytes through app servers. **Redis Cluster** holds precomputed feeds as sorted sets (ZADD/ZREVRANGE give O(log N) inserts and fast top-K reads) plus sessions and hot metadata. **Kafka** is the async backbone: an upload emits one durable post-created event that independently drives media processing, fan-out, notifications, and search indexing — consumers can lag or replay without affecting the upload path. **Elasticsearch** powers hashtag/user search with inverted indexes and prefix (edge n-gram) matching for typeahead. **CloudFront/Akamai** serve all media from the edge. **Envoy/ALB + an API gateway** terminate TLS and enforce auth (OAuth2/JWT) and per-user rate limits before traffic reaches services.\n\nKey insight: the pattern to articulate is polyglot persistence — each store is chosen for its access pattern (relational graph → Postgres, append-heavy timelines → Cassandra, blobs → S3, top-K reads → Redis, full-text → Elasticsearch), not one database stretched to do everything.",
    "## Photo Upload Pipeline: One Photo, End to End\n\nTrace a single upload — user posts a 2MB beach photo — and every layer of the write path shows up in order. (1) The client calls POST /v1/media/uploads through the load balancer and API gateway (auth + rate-limit check); the upload service generates a Snowflake-style photo ID (41-bit timestamp + shard + sequence) and returns a presigned S3 URL. (2) The client PUTs the 2MB original directly to S3 — app servers never touch the bytes. (3) The client confirms; the upload service writes the metadata row (photo ID, owner, caption, hashtags, storage key, state=PROCESSING) to sharded Postgres and publishes a post-created event to Kafka. Total synchronous work: one ID, one DB row, one Kafka publish — a few milliseconds. (4) Media workers consume the event: resize into 1080px/640px/150px renditions, strip EXIF for privacy, run moderation checks, write renditions to S3 under content-hashed keys, and flip the row to READY. (5) Fan-out workers consume the same event, read the follower list from the graph service, and ZADD the post ID into each active follower's Redis feed (persisting to Cassandra as the durable copy). (6) Notification workers send pushes to close friends. The first follower to view the photo pulls the 640px rendition through the CDN (pull-through cache miss → S3 → cached at the edge for everyone nearby).\n\nCommon mistake: routing image bytes through the API servers. At 3,500 uploads/sec × 2MB that is ~7GB/s of pointless proxy traffic; presigned direct-to-S3 upload removes it entirely.\n\nWarning: every async step must be idempotent (keyed by photo ID) — Kafka is at-least-once, so workers will occasionally see the same event twice.",
    "## Feed Read Path: One Feed Load, End to End\n\nTrace a feed load the same way — a user opens the app and the response must be back in under 200ms. (1) GET /v1/feed?cursor=... hits the gateway (auth, rate limit) and lands on the feed service. (2) The feed service issues ZREVRANGE feed:{userId} against Redis — one O(log N + K) read returning ~500 precomputed post IDs (~5ms). On a cache miss (evicted or new device region) it rebuilds from the Cassandra timeline table. (3) In parallel it asks the graph service which followed accounts are celebrities (typically under 20) and fetches their recent post IDs directly — this is the fan-out-on-read half of the hybrid. (4) Merged candidates (~500) go to the ranking service, which scores them with a multi-task DNN using precomputed features from the feature store (~50ms budget). (5) The top 50 post IDs are hydrated from the hot-metadata cache (fallback: Postgres) into full objects with CDN URLs. (6) The response returns IDs, captions, counts, and rendition URLs — never bytes; the client fetches images from the CDN as the user scrolls. Latency budget: gateway 5ms + Redis 5ms + celebrity fetch 15ms + ranking 50ms + hydration 20ms + serialization/network ≈ **p99 under 200ms**.\n\nKey insight: the feed API is a metadata service. Separating the control plane (IDs and URLs from the feed service) from the data plane (bytes from the CDN) is what lets each scale independently.",
    "## Social Graph, Stories, and Explore\n\nThe social graph (who follows whom) is stored in a dedicated graph service backed by a sharded adjacency list (Postgres or a TAO-style graph store). Each edge stores followerId, followeeId, and timestamp. The graph supports two fast queries: 'who does user X follow' (used for feed fan-out on read and suggestions) and 'who follows user X' (used for fan-out on write and follower counts) — both directions indexed, which effectively means writing each edge twice. Stories are stored separately from posts: each story has a TTL of 24 hours and is kept in a time-partitioned store (hourly partitions dropped wholesale after 25 hours). When a user opens the stories tray, the client fetches the list of followed users who have unexpired stories via a Redis presence set with TTL — intersect the following list with the set instead of scanning everyone. Story media is served from the CDN with aggressive caching since stories are hot content viewed by many users in a short window. The Explore page uses a recommendation engine combining collaborative filtering (users who liked similar posts), content embeddings (CNN-extracted feature vectors), engagement velocity, and diversity constraints; candidate pools are precomputed offline and re-ranked in real time per request.\n\nFor example, when a user with 800 followers posts a story, one S3 write plus one SADD into the presence set is all that happens synchronously — the 800 followers discover it lazily when they open the tray.",
    "## Reliability, Consistency, and Operational Concerns\n\nInstagram favors availability over strict consistency (AP in CAP terms). A new post may take a few seconds to appear in all followers' feeds, and like counts are eventually consistent; only the user's own actions must read-your-writes (route the author's reads to the primary or patch their feed locally). Data is replicated across multiple regions with asynchronous replication; on a regional failure, traffic reroutes to surviving regions and Kafka consumers replay from committed offsets. The photo pipeline is idempotent end to end: reprocessing an upload produces identical renditions under the same content-hashed keys, so retries with exponential backoff are always safe. Rate limiting protects against abuse: per-user upload caps, per-IP limits, and per-token API quotas enforced at the gateway. Monitoring tracks upload success rate, feed p50/p99, CDN hit ratio, Kafka consumer lag (fan-out lag is the user-visible 'my post isn't showing' metric), and storage growth against the ~300TB/day projection to trigger shard splits ahead of need. Schema changes on billion-row tables run online via gh-ost or pt-online-schema-change.\n\nIn practice: the single most-watched dashboard is Kafka consumer lag per group — it is the earliest signal that fan-out, media processing, or notifications are falling behind user expectations.",
  ],
  deepDive: [
    "Fan-out on write versus fan-out on read is the central trade-off of this design, and the numbers decide it. Fan-out on write for an average user (200 followers) costs 200 Redis ZADDs per post — at 1,160 posts/sec that is ~230K cache writes/sec, cheap and easily sharded, and it buys a single-read feed load. The same strategy for a 50M-follower celebrity costs 50M writes per post; at 100K writes/sec of fan-out throughput that is over 8 minutes of lag and ~3TB of duplicated post-ID entries for one photo. Pure fan-out on read flips the cost: a user following 500 accounts would trigger 500 timeline fetches plus a merge on every feed load — hundreds of milliseconds at 58K QPS. The hybrid takes the cheap side of each: push for authors under ~10K followers (over 99.9% of accounts), pull at read time for the handful of celebrities a user follows (typically under 20 extra fetches, ~15ms in parallel).\n\nKey insight: the ~10K threshold is not magic — it is the point where fan-out latency (followers / fan-out throughput) exceeds the freshness SLO. State the formula, not just the number.\n\nCommon mistake: forgetting the transition case. When an account crosses the threshold mid-flight, keep double-writing briefly (push and pull both work — duplicates are deduped at merge), then stop the push side; going the other way, backfill the celebrity's recent posts into follower feeds lazily.\n\nIn practice: fan-out also skips followers inactive for 30+ days (often 40-50% of edges) and rebuilds their feed from Cassandra on their next visit — a huge write saving for zero user-visible cost.",
    "The media storage strategy rests on three decisions: presigned direct uploads, immutable content-addressed renditions, and a CDN that never needs invalidation. Uploads: the API returns a short-lived presigned S3 URL so the client PUTs bytes straight to object storage — app servers handle only metadata, and a 2MB × 3,500/sec peak (~7GB/s) of image traffic never touches them; multipart upload handles videos and flaky mobile networks with resumable parts. Renditions: workers generate each size once (1080/640/150px, WebP/AVIF where the client supports it) and store it under a key derived from the content hash plus rendition name, e.g. media/ab/cd/abcd1234.../640.webp. Because keys are content-addressed, the same URL can never serve two different images — so CDN objects are immutable and get Cache-Control: public, max-age=31536000, immutable. 'Invalidation' is therefore not cache purging but pointer swapping: an edit produces new keys and updates the metadata row; the old objects age out. The only true purges are takedowns (DMCA, moderation), handled by the CDN's purge-by-URL API plus a 404 at origin.\n\nKey insight: immutable, content-hashed media keys convert the hardest CDN problem (invalidation) into a metadata update — this is the single highest-leverage trick in media serving.\n\nWarning: presigned URLs must be scoped (single key, content-length-range, short expiry) and the metadata row must only flip to READY after the service verifies the object exists and passes moderation — otherwise clients can publish unscanned bytes.",
    "Consistent hashing is fundamental to Instagram's storage layer. Rather than using simple modular hashing (photoId % N), which would require rehashing nearly all keys when a node is added or removed, consistent hashing maps both photo IDs and storage nodes onto a virtual ring. Each physical node is assigned multiple virtual nodes (typically 100-200) to ensure even distribution. When a photo needs to be stored, its hash is computed and the ring is traversed clockwise to find the first virtual node; the physical node owning that virtual node stores the photo. When a node fails, only the keys mapped to that node are redistributed to the next node on the ring, affecting roughly 1/N of the data. Instagram uses this for both its object storage distribution and its database sharding, with shard-aware routing in the application layer. The virtual node count is tuned to balance load variance against routing table size: too few virtual nodes cause hotspots, too many increase memory usage in the routing table. In practice, with 200 virtual nodes per physical node and a good hash function (MurmurHash3 or xxHash), the load imbalance is under 5%.",
    "Feed ranking at Instagram's scale requires a multi-stage pipeline to keep latency low while evaluating thousands of candidate posts. The first stage is candidate generation: the precomputed feed (from fan-out on write) plus celebrity posts (fetched on read) yield a raw candidate set of ~500 posts. The second stage is a lightweight pre-ranker that applies a simple linear model to reduce the set to ~150 candidates, filtering out low-quality or duplicate content. The third stage is the heavy ranker: a deep neural network (typically a multi-task model predicting probability of like, comment, save, and share) scores each candidate. Feature inputs include user-post interaction history, post age, author engagement rate, image embedding similarity to the user's interest profile, and time-of-day patterns. The final stage applies business rules: diversity constraints (no more than 2 consecutive posts from the same author), freshness guarantees (at least 30% of feed items should be from the last 6 hours), and ads interleaving. The entire pipeline runs in under 100ms by pre-computing features in a feature store (Redis + Flink) and serving the model via a low-latency inference service (TensorFlow Serving or equivalent).",
    "The stories infrastructure presents unique challenges compared to the permanent photo graph. Stories have a strict 24-hour TTL, which means the storage system must efficiently expire and garbage-collect billions of objects daily. Instagram uses a time-partitioned storage scheme: stories created in each hour are stored in a dedicated partition, and entire partitions are dropped after 25 hours (the extra hour provides a buffer). The stories tray (the row of circles at the top of the app) must load in under 100ms, which requires knowing which of the user's followed accounts have active stories without scanning all of them. This is solved with a Redis-backed presence set: when a user posts a story, their user ID is added to a set with a 24h TTL. When loading the tray, the app intersects the viewer's following list with the presence set. Story viewing order is ranked by relationship strength and recency. Stories also support interactive elements (polls, questions, quizzes) which require real-time aggregation of responses; these are handled by a separate real-time counting service using Redis HyperLogLog for unique viewer counts and sorted sets for poll tallies.",
    "Instagram's Explore and Discovery system must recommend posts from accounts a user does not follow, which is fundamentally different from the home feed. The system operates on an item-to-item collaborative filtering model combined with content understanding. First, a set of seed accounts is identified: accounts similar to those the user already follows (based on co-follow patterns and interaction overlap). Posts from these seed accounts, plus posts with high engagement velocity (viral content), form the candidate pool of ~10K posts per user, refreshed every few hours. At request time, a real-time ranker scores each candidate using the same multi-task neural network as the feed ranker, but with additional features like topic diversity (the user should see posts from multiple interest categories), content novelty (avoid showing the same viral post repeatedly), and safety signals (demoting borderline content). Image understanding is powered by a CNN (ResNet or EfficientNet) that extracts a 2048-dimensional embedding vector for each photo; similar images cluster together in embedding space, enabling visual similarity recommendations. Hashtag co-occurrence graphs provide additional topic signals. The Explore page is one of Instagram's most computationally expensive features, requiring a dedicated cluster of GPU-equipped inference servers.",
    "Hot partitions are the classic failure mode of storing feeds and activity in Cassandra, and interviewers probe for it. The natural schema — PRIMARY KEY ((user_id), created_at DESC) — puts each user's whole timeline on one partition. Two things break it: unbounded growth (a 5-year-old active account accumulates hundreds of thousands of rows, and Cassandra partitions degrade badly past ~100MB) and celebrity-adjacent hotspots (an activity table keyed by post_id melts when one post gets 10M likes in an hour, because every write and read hammers the same replica set). The fixes are mechanical once you know them. First, bucket the partition key by time: PRIMARY KEY ((user_id, day_bucket), created_at DESC) caps partition size and lets reads walk buckets newest-first until the page fills. Second, for genuinely hot keys, add a salt: key by (post_id, shard) with shard = hash(actor) % 16, spreading one logical partition across 16 physical ones; readers fan in across the 16 shards, which is fine because hot keys are read through a cache anyway. Third, absorb like/view counters in Redis and flush aggregated deltas to Cassandra every few seconds instead of writing per-event.\n\nReal-world example: Discord's messages table went through exactly this evolution — channel_id alone created giant hot partitions, and they moved to (channel_id, bucket) with time buckets to bound partition size.\n\nCommon mistake: proposing 'just add more nodes.' A hot partition lives on one replica set regardless of cluster size; only changing the key shape (buckets, salts) or absorbing writes upstream (cache, batching) actually spreads the load.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Consistent hashing ring for distributing photos across storage nodes. Uses virtual nodes (vnodes) to ensure balanced load. MurmurHash maps both node identifiers and photo IDs onto a 32-bit ring.",
      source: `#include <map>
#include <string>
#include <vector>
#include <functional>
#include <cstdint>
#include <sstream>

// MurmurHash3 finalizer for 32-bit keys
uint32_t murmur_hash(const std::string& key) {
    uint32_t h = 0;
    for (char c : key) {
        h ^= static_cast<uint32_t>(c);
        h *= 0x5bd1e995;
        h ^= h >> 15;
    }
    return h;
}

class ConsistentHashRing {
    int vnodes_per_node_;
    std::map<uint32_t, std::string> ring_;  // hash -> physical node ID

public:
    explicit ConsistentHashRing(int vnodes_per_node = 200)
        : vnodes_per_node_(vnodes_per_node) {}

    void add_node(const std::string& node_id) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            std::string vnode_key = node_id + "#vnode" + std::to_string(i);
            uint32_t hash = murmur_hash(vnode_key);
            ring_[hash] = node_id;
        }
    }

    void remove_node(const std::string& node_id) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            std::string vnode_key = node_id + "#vnode" + std::to_string(i);
            uint32_t hash = murmur_hash(vnode_key);
            ring_.erase(hash);
        }
    }

    // Find the storage node responsible for a given photo ID
    std::string get_node(const std::string& photo_id) const {
        if (ring_.empty()) return "";
        uint32_t hash = murmur_hash(photo_id);
        // Walk clockwise: find first node with hash >= photo hash
        auto it = ring_.lower_bound(hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // wrap around the ring
        }
        return it->second;
    }

    // Returns the set of photo IDs (from a sample) that would move
    // if a new node is added -- useful for rebalancing estimation
    size_t estimate_rebalance(const std::vector<std::string>& sample_keys,
                              const std::string& new_node) const {
        ConsistentHashRing with_new = *this;
        with_new.add_node(new_node);
        size_t moved = 0;
        for (const auto& key : sample_keys) {
            if (get_node(key) != with_new.get_node(key)) ++moved;
        }
        return moved;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Fan-out on write service: when a user publishes a post, push the post ID into each follower's precomputed feed cache. Celebrity accounts (10K+ followers) are skipped and handled via fan-out on read.",
      source: `#include <string>
#include <vector>
#include <queue>
#include <unordered_set>
#include <cstdint>
#include <functional>

struct Post {
    std::string post_id;
    std::string author_id;
    uint64_t    timestamp_ms;
    std::string media_url;
};

// Simulated external service interfaces
struct SocialGraphService {
    // Returns follower IDs for a given user
    std::vector<std::string> get_followers(const std::string& user_id) const;
    size_t get_follower_count(const std::string& user_id) const;
};

struct FeedCacheService {
    // Insert post_id into user's feed sorted set with given score
    void insert_feed_entry(const std::string& user_id,
                           const std::string& post_id,
                           double score);
    // Trim feed to max_size most recent entries
    void trim_feed(const std::string& user_id, size_t max_size);
};

struct ActiveUserService {
    // Check if user has been active in last N days
    bool is_recently_active(const std::string& user_id, int days) const;
};

static constexpr size_t CELEBRITY_THRESHOLD = 10'000;
static constexpr size_t MAX_FEED_SIZE = 800;
static constexpr int    ACTIVE_WINDOW_DAYS = 7;
static constexpr size_t BATCH_SIZE = 500;

class FanOutService {
    SocialGraphService  graph_;
    FeedCacheService    cache_;
    ActiveUserService   active_;

public:
    struct FanOutResult {
        size_t followers_pushed;
        size_t followers_skipped_inactive;
        bool   is_celebrity;
    };

    FanOutResult fan_out_on_write(const Post& post) {
        FanOutResult result{0, 0, false};

        size_t follower_count = graph_.get_follower_count(post.author_id);

        // Celebrity: skip fan-out, feed will be assembled on read
        if (follower_count >= CELEBRITY_THRESHOLD) {
            result.is_celebrity = true;
            return result;
        }

        std::vector<std::string> followers =
            graph_.get_followers(post.author_id);

        double score = static_cast<double>(post.timestamp_ms);

        // Process in batches to avoid overwhelming the cache service
        for (size_t i = 0; i < followers.size(); i += BATCH_SIZE) {
            size_t end = std::min(i + BATCH_SIZE, followers.size());
            for (size_t j = i; j < end; ++j) {
                const auto& fid = followers[j];

                // Optimization: skip inactive users to reduce wasted writes
                if (!active_.is_recently_active(fid, ACTIVE_WINDOW_DAYS)) {
                    ++result.followers_skipped_inactive;
                    continue;
                }

                cache_.insert_feed_entry(fid, post.post_id, score);
                cache_.trim_feed(fid, MAX_FEED_SIZE);
                ++result.followers_pushed;
            }
        }
        return result;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Bloom filter for deduplicating posts in the Explore feed. Prevents showing the same post to a user multiple times across sessions. Uses double hashing for k hash functions.",
      source: `#include <vector>
#include <string>
#include <cstdint>
#include <cmath>

class BloomFilter {
    std::vector<bool> bits_;
    size_t num_hashes_;
    size_t size_;

    // FNV-1a hash
    uint64_t fnv1a(const std::string& key) const {
        uint64_t h = 14695981039346656037ULL;
        for (char c : key) {
            h ^= static_cast<uint64_t>(c);
            h *= 1099511628211ULL;
        }
        return h;
    }

    // Double hashing: h(i) = h1 + i * h2
    uint64_t nth_hash(uint64_t h1, uint64_t h2, size_t i) const {
        return (h1 + i * h2) % size_;
    }

public:
    // expected_items: how many items will be inserted
    // false_positive_rate: desired FP rate (e.g., 0.01 for 1%)
    BloomFilter(size_t expected_items, double false_positive_rate) {
        // Optimal size: m = -n * ln(p) / (ln(2))^2
        size_ = static_cast<size_t>(
            -static_cast<double>(expected_items) *
            std::log(false_positive_rate) / (std::log(2.0) * std::log(2.0))
        );
        // Optimal hash count: k = (m/n) * ln(2)
        num_hashes_ = static_cast<size_t>(
            (static_cast<double>(size_) / expected_items) * std::log(2.0)
        );
        if (num_hashes_ < 1) num_hashes_ = 1;
        bits_.resize(size_, false);
    }

    void insert(const std::string& item) {
        uint64_t h1 = fnv1a(item);
        uint64_t h2 = fnv1a(item + "\\0salt");
        for (size_t i = 0; i < num_hashes_; ++i) {
            bits_[nth_hash(h1, h2, i)] = true;
        }
    }

    bool possibly_contains(const std::string& item) const {
        uint64_t h1 = fnv1a(item);
        uint64_t h2 = fnv1a(item + "\\0salt");
        for (size_t i = 0; i < num_hashes_; ++i) {
            if (!bits_[nth_hash(h1, h2, i)]) return false;
        }
        return true;
    }

    // For Explore feed: check if user has already seen this post
    // Key format: "userId:postId"
    bool has_user_seen_post(const std::string& user_id,
                            const std::string& post_id) const {
        return possibly_contains(user_id + ":" + post_id);
    }

    void mark_user_seen_post(const std::string& user_id,
                             const std::string& post_id) {
        insert(user_id + ":" + post_id);
    }

    double estimated_false_positive_rate() const {
        size_t bits_set = 0;
        for (bool b : bits_) if (b) ++bits_set;
        double fill_ratio = static_cast<double>(bits_set) / size_;
        return std::pow(fill_ratio, static_cast<double>(num_hashes_));
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Instagram High-Level Architecture",
      kind: "architecture",
      caption:
        "Layered end-to-end architecture. Edges numbered U1-U6 trace the photo upload hot path (client to S3 via presigned URL, metadata write, event emit); edges numbered R1-R9 trace the feed read hot path (Redis feed cache with Cassandra fallback, ranking, media from the CDN). Shared hops carry both labels; async fan-out and processing edges are unnumbered.",
      mermaid: `graph TB
    subgraph ClientsLayer["Clients"]
        MobileApp["Mobile App<br/>iOS / Android"]
        WebApp["Web Client"]
    end

    subgraph EdgeLayer["Edge"]
        CDN["CDN for Media<br/>CloudFront / Akamai"]
    end

    subgraph GatewayLayer["Gateway"]
        LB["Load Balancer<br/>L7, e.g. Envoy / ALB"]
        APIGW["API Gateway<br/>AuthN + Rate Limiting"]
    end

    subgraph ServicesLayer["Services"]
        UploadSvc["Upload Service<br/>presigned URLs, dedup"]
        FeedSvc["Feed Service<br/>merge + paginate"]
        UserSvc["User / Graph Service<br/>follows, profiles"]
        NotifSvc["Notification Service<br/>APNs / FCM push"]
        SearchSvc["Search Service<br/>hashtags, users"]
    end

    subgraph CacheLayer["Cache"]
        FeedCache["Redis Cluster<br/>Feed Cache: sorted sets"]
        SessionCache["Redis<br/>Sessions + Hot Metadata"]
    end

    subgraph AsyncLayer["Async"]
        Kafka["Kafka<br/>post-created / media-uploaded events"]
        FanoutWorkers["Fan-out Workers<br/>push post IDs to follower feeds"]
        MediaWorkers["Media Processing Workers<br/>resize, thumbnail, transcode, EXIF strip"]
    end

    subgraph DataLayer["Data"]
        Postgres["PostgreSQL, sharded<br/>Users + Post Metadata"]
        Cassandra["Cassandra<br/>Feed + Activity Timelines"]
        S3["S3 Object Storage<br/>Originals + Renditions"]
        ES["Elasticsearch<br/>Hashtag + User Search Index"]
    end

    subgraph MLLayer["ML"]
        Ranker["Feed Ranking Service<br/>multi-task DNN inference"]
        ExploreML["Explore / Discovery<br/>embeddings + CF candidates"]
    end

    MobileApp -->|"U1. upload: request presigned URL"| LB
    WebApp -->|"R1. GET /v1/feed"| LB
    LB -->|"U2 / R2. route"| APIGW
    APIGW -->|"U3. presign + create post"| UploadSvc
    APIGW -->|"R3. authenticated read"| FeedSvc
    APIGW --> UserSvc
    APIGW --> SearchSvc
    MobileApp -->|"U4. upload: PUT original bytes"| S3
    UploadSvc -->|"U5. write metadata"| Postgres
    UploadSvc -->|"U6. emit post-created"| Kafka
    Kafka --> MediaWorkers
    Kafka --> FanoutWorkers
    Kafka --> NotifSvc
    Kafka -->|"index posts + hashtags"| ES
    MediaWorkers -->|"write renditions"| S3
    FanoutWorkers -->|"read follower lists"| UserSvc
    FanoutWorkers -->|"ZADD post IDs"| FeedCache
    FanoutWorkers -->|"persist timeline"| Cassandra
    FeedSvc -->|"R4. read: precomputed feed"| FeedCache
    FeedSvc -->|"R5. cache-miss rebuild"| Cassandra
    FeedSvc -->|"R6. hydrate post metadata"| Postgres
    FeedSvc -->|"R7. score candidates"| Ranker
    UserSvc --> Postgres
    UserSvc --> SessionCache
    SearchSvc --> ES
    ExploreML --> ES
    ExploreML --> Ranker
    CDN -->|"R9. pull-through on miss"| S3
    MobileApp -->|"R8. fetch media renditions"| CDN`,
    },
    {
      title: "Photo Upload and Processing Flow",
      kind: "flow",
      caption:
        "Detailed flow from photo capture to CDN availability, including filter application, resizing, and metadata extraction.",
      mermaid: `flowchart TD
    A[User captures photo] --> B[Apply filter on client]
    B --> C[Upload to Upload Service]
    C --> D{Validate image}
    D -->|Invalid| E[Return error to client]
    D -->|Valid| F[Generate unique photo ID]
    F --> G[Write original to staging bucket]
    G --> H[Enqueue processing job]
    H --> I[Resize: 150px thumbnail]
    H --> J[Resize: 640px feed]
    H --> K[Resize: 1080px full]
    I --> L[Strip EXIF metadata]
    J --> L
    K --> L
    L --> M[Write variants to permanent S3]
    M --> N[Write metadata to PostDB]
    N --> O[Trigger fan-out service]
    O --> P[Invalidate CDN cache]
    P --> Q[Return success to client]`,
    },
    {
      title: "Feed Read Path Sequence",
      kind: "sequence",
      caption:
        "Sequence diagram showing how a feed request is assembled from precomputed cache, celebrity posts, and ranking.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant FS as Feed Service
    participant RC as Redis Cache
    participant GS as Graph Service
    participant PS as Post Service
    participant RK as Ranker

    C->>FS: GET /feed?cursor=abc
    FS->>RC: ZREVRANGEBYSCORE feed:userId
    RC-->>FS: precomputed post IDs
    FS->>GS: get followed celebrities
    GS-->>FS: celebrity user IDs
    FS->>PS: fetch recent posts from celebrities
    PS-->>FS: celebrity posts
    FS->>FS: merge precomputed + celebrity posts
    FS->>RK: rank candidates with features
    RK-->>FS: scored and sorted posts
    FS->>PS: fetch full post objects for top 50
    PS-->>FS: post details with media URLs
    FS-->>C: feed response with next cursor`,
    },
    {
      title: "Explore Discovery Pipeline",
      kind: "flow",
      caption:
        "Multi-stage pipeline for the Explore tab: candidate generation, pre-ranking, heavy ranking, and business rule application.",
      mermaid: `flowchart TD
    A[User opens Explore] --> B[Fetch user interest profile]
    B --> C[Candidate Generation]
    C --> D[Seed accounts: co-follow graph]
    C --> E[Trending: high engagement velocity]
    C --> F[Visual similarity: CNN embeddings]
    D --> G[Candidate pool: 10K posts]
    E --> G
    F --> G
    G --> H[Pre-ranker: linear model]
    H --> I[150 candidates]
    I --> J[Heavy ranker: deep neural network]
    J --> K[50 scored candidates]
    K --> L{Apply business rules}
    L --> M[Diversity: max 2 per author]
    L --> N[Safety: demote borderline]
    L --> O[Dedup: bloom filter check]
    M --> P[Final 30 posts]
    N --> P
    O --> P
    P --> Q[Return to client]`,
    },
  ],
  interviewQA: [
    {
      q: "How would you design the photo upload pipeline to handle 100M uploads per day?",
      a: "The pipeline is split into synchronous and asynchronous phases. Synchronously, the upload service validates the image, generates a unique ID (Snowflake-style with timestamp, datacenter, and sequence bits), writes the original to a staging bucket in object storage, and returns a success response to the client. Asynchronously, a processing queue (Kafka or SQS) triggers workers that apply filters, resize the image into three variants (150px, 640px, 1080px), strip EXIF metadata, and write the variants to permanent S3. At 100M uploads/day (~1,150/sec), the processing workers are horizontally scaled based on queue depth. Idempotency keys tied to the photo ID ensure that retries do not create duplicate posts. Once processing completes, the metadata record in the post database is marked as 'ready' and the fan-out service is triggered.",
      followUps: [
        "How would you handle a processing worker crash mid-resize?",
        "What happens if S3 is temporarily unavailable during the write?",
        "How do you prevent the same photo from being uploaded twice by accident?",
      ],
    },
    {
      q: "Why use a hybrid fan-out model instead of pure push or pure pull?",
      a: "Pure fan-out on write is prohibitively expensive for celebrity accounts. A user with 50M followers would trigger 50M Redis writes per post, consuming enormous bandwidth and causing fan-out latency of minutes. Pure fan-out on read makes every feed load slow: fetching and merging posts from 500 followed accounts at read time adds hundreds of milliseconds, and the merge compute scales linearly with the number of accounts followed. The hybrid approach uses fan-out on write for regular users (under ~10K followers), giving them instant precomputed feeds, and fan-out on read only for celebrity posts. At read time, the feed service merges the precomputed feed with a small number of celebrity post fetches (typically under 20 accounts), keeping latency under 200ms. The 10K threshold is tunable based on system capacity and observed fan-out latency.",
      followUps: [
        "How would you determine the optimal threshold between push and pull?",
        "What if a user suddenly goes viral and crosses the threshold?",
      ],
    },
    {
      q: "How does the CDN strategy work for Instagram's media serving?",
      a: "Instagram serves all media (photos, videos, stories) through a global CDN with edge nodes in hundreds of locations. When a photo is uploaded and processed, the CDN does not pre-populate; instead, it uses a pull-through cache model. The first request for a photo at an edge node triggers a cache miss, and the edge fetches the photo from the origin (S3), caches it, and serves it. Subsequent requests at that edge are served from cache. Cache hit rates exceed 95% because most photo views happen within hours of upload and are geographically clustered (a user's followers tend to be in similar regions). Hot content (viral posts, celebrity stories) gets replicated across many edges quickly through organic request patterns. TTLs are set long (days to weeks) since photos are immutable once processed. For stories (24h TTL), the CDN respects cache-control headers and evicts expired content. Cache invalidation is rare since photos are write-once, but when needed (e.g., DMCA takedown), the CDN supports purge-by-URL APIs.",
      followUps: [
        "How would you handle a thundering herd problem for a viral post?",
        "What is the cost trade-off between CDN bandwidth and origin storage?",
      ],
    },
    {
      q: "How would you design the stories feature to handle 500M stories per day?",
      a: "Stories are stored in a time-partitioned object store: each hourly partition contains all stories created in that hour. A background garbage collector drops entire partitions after 25 hours (24h TTL + 1h buffer), making cleanup extremely efficient compared to per-item deletion. When a user posts a story, their user ID is added to a Redis set with a 24h TTL, acting as a presence indicator. Loading the stories tray requires intersecting the viewer's following list with this presence set, yielding only the accounts with active stories. The tray is ordered by relationship strength (interaction frequency) and recency. Story media is served through the CDN with aggressive caching since stories are hot content viewed by many followers within a short window. For interactive story elements (polls, questions), a real-time aggregation service uses Redis counters and HyperLogLog for unique viewer counts. The stories infrastructure is separate from the main post graph to avoid polluting the permanent storage with ephemeral data.",
      followUps: [
        "How would you handle a user viewing stories across multiple devices?",
        "What data structure tracks which stories a user has already viewed?",
      ],
    },
    {
      q: "How does the Explore page recommendation engine work at scale?",
      a: "The Explore engine operates in two phases: offline candidate generation and online ranking. Offline, a batch pipeline runs every few hours to build candidate pools per user interest cluster. It uses collaborative filtering (users who liked similar posts tend to like the same new posts), content embeddings from a CNN (ResNet-50 producing 2048-dimensional vectors per image), and hashtag co-occurrence graphs. Each user is mapped to an interest cluster, and the candidate pool for that cluster contains ~10K posts. Online, when a user opens Explore, the service fetches their cluster's candidate pool, runs a lightweight pre-ranker to reduce to ~150 candidates, then applies a heavy ranker (a multi-task deep neural network predicting like, comment, save, and share probabilities). Business rules enforce diversity (max 2 posts from one author), safety (demote borderline content), and freshness (boost recent posts). A Bloom filter per user tracks seen posts to avoid repetition. The entire pipeline runs on dedicated GPU inference servers and targets p99 latency under 300ms.",
      followUps: [
        "How do you cold-start recommendations for a brand new user?",
        "How do you balance exploration vs exploitation in the ranking?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for Instagram. What numbers matter and what do they imply?",
      a: "Start from stated assumptions: 2B MAU, 500M DAU, 100M photo uploads/day, 10 feed loads per DAU per day. Write QPS: 100M / 86,400 ≈ 1,160 uploads/sec average, ~3,500/sec at a 3x peak. Read QPS: 5B feed reads/day ≈ 58K/sec average, ~175K peak — a ~100:1 read-to-write ratio. Storage: ~2MB original + ~1MB of renditions ≈ 3MB/photo → 300TB/day ≈ 110PB/year of new media, versus only ~100GB/day of metadata — which implies blobs in S3 with erasure coding and metadata in a sharded relational DB, never the reverse. Egress: 500M DAU × 20 views × 300KB ≈ 3PB/day ≈ 280Gbps average; at 95% CDN hit rate origin egress collapses to tens of Gbps, so the CDN is a load-bearing component, not an optimization. Cache: 500M users × 800 feed entries × ~60B ≈ 24TB of Redis, ~100 nodes. Each number should end in a design conclusion: reads dominate → precompute feeds; media dominates → separate control plane (metadata API) from data plane (CDN bytes).",
      followUps: [
        "How would the numbers change if video (Reels) became 50% of uploads?",
        "At what DAU would the Redis feed cache stop being cost-effective?",
      ],
    },
    {
      q: "You store feed timelines in Cassandra. How do you avoid hot partitions?",
      a: "Three techniques, applied in order of leverage. First, bound partition size with time buckets: instead of PRIMARY KEY ((user_id), created_at), use ((user_id, day_bucket), created_at DESC) so no partition grows past Cassandra's ~100MB comfort zone; reads walk buckets newest-first until the page fills. Second, salt genuinely hot keys: an activity partition keyed by post_id melts when one post receives 10M likes in an hour, so key by (post_id, hash(actor) % 16) to spread one logical partition across 16 physical ones and fan in on read — acceptable because hot data is served through a cache anyway. Third, absorb high-frequency counters upstream: increment like/view counts in Redis and flush aggregated deltas to Cassandra periodically rather than writing per event. The non-answer to call out explicitly: adding nodes does not help, because a single partition maps to one replica set no matter how large the cluster is — only reshaping the key or absorbing writes upstream spreads the load.",
      followUps: [
        "How do you pick the bucket granularity (hour vs day vs week)?",
        "What are the read-path costs of salting, and when are they unacceptable?",
      ],
    },
    {
      q: "Why do clients upload photos via presigned URLs instead of through your API servers?",
      a: "Bandwidth and blast radius. At ~3,500 uploads/sec peak × 2MB, proxying bytes through API servers means ~7GB/s of traffic that adds zero value — every byte would be read from a socket and written straight to S3, burning NIC capacity, memory buffers, and connection slots that should serve metadata requests. With presigned URLs the API only authenticates the user, generates a photo ID, and signs a short-lived, tightly scoped URL (single object key, content-length-range limit, minutes-long expiry); the client PUTs directly to S3, which is built for exactly this ingest. Failure isolation improves too: a spike in upload volume or a large-video surge cannot saturate the API tier. Two safeguards are mandatory: the metadata row starts in a PROCESSING state and only flips to READY after the service verifies the object exists, matches the expected size/type, and passes moderation — so a client cannot publish arbitrary bytes; and multipart presigned uploads give mobile clients resumability on flaky networks.",
      followUps: [
        "How do you clean up orphaned objects when a client uploads but never confirms?",
        "How would you rate-limit presigned URL issuance to prevent storage abuse?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Instagram uses consistent hashing with virtual nodes for photo storage distribution. What is the primary benefit of virtual nodes?",
      options: [
        "They reduce the total number of physical storage servers needed",
        "They ensure more uniform distribution of data across physical nodes",
        "They enable faster photo uploads by parallelizing writes",
        "They reduce network latency between storage servers",
      ],
      answerIndex: 1,
      explanation:
        "Virtual nodes (vnodes) map each physical node to multiple positions on the hash ring. Without vnodes, a small number of physical nodes would be unevenly distributed on the ring, causing hotspots. With 100-200 vnodes per node, the load variance drops below 5%, ensuring balanced data distribution.",
    },
    {
      q: "For Instagram's story feature with 500M stories/day and 24h TTL, which storage cleanup strategy is most efficient?",
      options: [
        "Scanning all stories and deleting those older than 24 hours individually",
        "Using time-partitioned storage and dropping entire hourly partitions after expiry",
        "Setting per-object TTLs in the object store and relying on automatic expiration",
        "Running a nightly batch job to identify and delete expired stories",
      ],
      answerIndex: 1,
      explanation:
        "Time-partitioned storage groups all stories created within the same hour into a single partition. Dropping an entire partition is an O(1) metadata operation, far more efficient than scanning and deleting billions of individual objects. Per-object TTLs in S3 are also viable but involve background deletion processes that can lag behind.",
    },
    {
      q: "In Instagram's hybrid feed model, celebrity posts are handled via fan-out on read. What happens at read time for these posts?",
      options: [
        "Celebrity posts are excluded from the feed entirely",
        "The feed service fetches recent posts from followed celebrities, merges them with the precomputed feed, and ranks the combined set",
        "Celebrity posts are pre-ranked and stored in a separate cache that is read independently",
        "The client app fetches celebrity posts directly from the CDN",
      ],
      answerIndex: 1,
      explanation:
        "At read time, the feed service reads the precomputed feed (populated by fan-out on write from regular users), then separately fetches recent posts from any celebrities the user follows. These two sets are merged and passed through the ranking model to produce the final feed. This avoids the write amplification of pushing to millions of celebrity followers.",
    },
    {
      q: "Instagram's Explore page uses a Bloom filter to track which posts a user has already seen. What is a consequence of the Bloom filter's probabilistic nature?",
      options: [
        "Some posts will never be shown to any user",
        "A post the user has not seen might be incorrectly filtered out, reducing content diversity",
        "The Bloom filter requires more memory than storing exact post IDs",
        "Posts are shown in random order due to hash collisions",
      ],
      answerIndex: 1,
      explanation:
        "Bloom filters have no false negatives but can produce false positives: a post the user has never seen might hash to all-set bits and be incorrectly marked as 'seen'. This reduces content diversity slightly. The trade-off is worthwhile because the Bloom filter uses far less memory than storing exact sets of seen post IDs (e.g., ~1.2 bytes per item at 1% FP rate vs 16+ bytes per UUID).",
    },
  ],
  flashcards: [
    {
      front: "How many photos does Instagram process per day, and what is the resulting daily storage ingestion?",
      back: "~100M photos/day. At ~200KB average compressed size, that is ~20TB/day for originals, plus ~60TB/day including the three resized variants (150px, 640px, 1080px).",
    },
    {
      front: "What is the celebrity threshold in Instagram's hybrid fan-out model?",
      back: "Typically ~10K followers. Users below this threshold have their posts pushed to all followers' feed caches (fan-out on write). Users above it are handled via fan-out on read to avoid massive write amplification.",
    },
    {
      front: "How does consistent hashing handle the addition of a new storage node?",
      back: "Only keys that fall between the new node and its predecessor on the ring are redistributed (~1/N of all keys). All other keys remain on their existing nodes. Virtual nodes ensure the redistributed load is spread evenly.",
    },
    {
      front: "How does Instagram efficiently garbage-collect expired stories?",
      back: "Stories are stored in time-partitioned buckets (one per hour). After 25 hours, the entire hourly partition is dropped in a single O(1) metadata operation, avoiding per-object deletion scans.",
    },
    {
      front: "What is the role of a Bloom filter in the Explore feed?",
      back: "It tracks which posts a user has already seen to avoid showing duplicates across sessions. It uses far less memory than storing exact post IDs (1.2 bytes/item at 1% FP rate) but may occasionally suppress an unseen post (false positive).",
    },
    {
      front: "What are the stages of Instagram's feed ranking pipeline?",
      back: "1) Candidate generation (precomputed feed + celebrity fetch, ~500 posts). 2) Pre-ranker: linear model reduces to ~150. 3) Heavy ranker: deep neural network scores by predicted engagement. 4) Business rules: diversity, freshness, ad interleaving.",
    },
    {
      front: "How does Instagram's CDN caching strategy work for photos?",
      back: "Pull-through caching: the first request at an edge triggers a cache miss and origin fetch. Subsequent requests are served from cache. Cache hit rates exceed 95% because most views occur shortly after upload and are geographically clustered.",
    },
    {
      front: "How does the Explore candidate generation work?",
      back: "Offline batch pipeline builds per-interest-cluster candidate pools of ~10K posts using collaborative filtering (co-like patterns), content CNN embeddings (2048-dim vectors), hashtag co-occurrence, and engagement velocity. Pools refresh every few hours.",
    },
    {
      front: "Derive Instagram's write and read QPS from first principles.",
      back: "Writes: 100M uploads/day / 86,400s ≈ 1,160/s average, ~3,500/s at 3x peak. Reads: 500M DAU × 10 feed loads = 5B/day ≈ 58K/s average, ~175K/s peak. Read:write ≈ 100:1, which justifies precomputed feeds and heavy caching.",
    },
    {
      front: "Why are media keys content-hashed, and what does that buy the CDN?",
      back: "Keys like media/ab/cd/{contentHash}/640.webp can never serve two different images, so CDN objects are immutable with max-age=31536000. 'Invalidation' becomes a metadata pointer swap to new keys; explicit purges are needed only for takedowns.",
    },
    {
      front: "Three fixes for a hot Cassandra partition, in order.",
      back: "1) Time-bucket the partition key ((user_id, day_bucket)) to bound size. 2) Salt hot keys: (post_id, hash(actor) % 16), fan in on read. 3) Absorb counters in Redis and flush batched deltas. Adding nodes never fixes it — one partition lives on one replica set.",
    },
    {
      front: "Why do uploads go direct to S3 via presigned URLs?",
      back: "3,500 uploads/sec × 2MB ≈ 7GB/s that would otherwise pointlessly transit API servers. The API only signs a scoped, short-lived URL and writes metadata; the row flips to READY only after the object is verified and moderated.",
    },
  ],
  exercises: [
    "Design the photo upload pipeline that handles 100M uploads/day. Draw the architecture for the synchronous upload path and asynchronous processing pipeline. Include failure handling, retry logic, and idempotency guarantees. Calculate the required number of processing workers given that each resize takes ~200ms.",
    "Implement a consistent hashing ring that supports adding and removing nodes with minimal key redistribution. Test it by simulating 1M photo IDs across 10 nodes, then adding an 11th node and measuring what percentage of keys move. Tune the virtual node count to achieve less than 5% load imbalance.",
    "Build a prototype feed service that supports both fan-out on write and fan-out on read paths. Use Redis sorted sets for precomputed feeds. Implement the merge logic that combines precomputed entries with celebrity post fetches, and add cursor-based pagination. Measure feed assembly latency for users following 500 accounts with 20 celebrities.",
    "Design the stories infrastructure: implement the time-partitioned storage scheme with hourly buckets, the Redis-based presence set for the stories tray, and the garbage collection process. Calculate the steady-state storage requirement given 500M stories/day at 500KB average with 24h TTL.",
    "Implement a multi-stage Explore ranking pipeline. Create a Bloom filter for seen-post deduplication, a mock pre-ranker using simple feature weights, and a diversity constraint engine that limits consecutive posts from the same author. Measure end-to-end latency on a candidate pool of 10K posts.",
  ],
  revisionNotes: [
    "Instagram: ~2B MAU, ~500M DAU, ~100M photo uploads/day, ~500M stories/day. Read-to-write ratio ~100:1.",
    "Photo pipeline: upload -> validate -> generate ID (Snowflake) -> stage in S3 -> async resize (150/640/1080px) -> permanent S3 -> CDN.",
    "Storage: ~60TB/day photo ingestion (including resized variants). Photos are write-once-read-many. Consistent hashing with 200 vnodes/node distributes across storage shards.",
    "Feed: hybrid fan-out. Push for users with <10K followers (Redis sorted sets). Pull for celebrities at read time. Merge + rank = final feed.",
    "Ranking pipeline: 500 candidates -> pre-ranker (linear, 150 out) -> heavy ranker (DNN, 50 out) -> business rules (diversity, freshness, ads). Target p99 < 200ms.",
    "Stories: 24h TTL, time-partitioned storage (hourly buckets dropped after 25h). Redis presence set tracks which users have active stories. Interactive elements use Redis counters.",
    "CDN: pull-through caching, 95%+ hit rate. Long TTLs for immutable photos. Purge-by-URL for takedowns.",
    "Explore: offline candidate generation (collaborative filtering + CNN embeddings + hashtag graphs), online ranking (multi-task DNN), Bloom filter dedup, diversity constraints.",
    "Social graph: sharded adjacency list. Two indexes: followerId->followees (for feed reads) and followeeId->followers (for fan-out writes).",
    "Failure handling: idempotent uploads (dedup by photo ID), retry with exponential backoff, async processing decoupled from upload response. AP system (availability over consistency).",
    "Capacity headline numbers: ~1,160 uploads/sec avg (3.5K peak), ~58K feed QPS avg (175K peak), ~3MB/photo with renditions -> ~300TB/day ~ 110PB/year media, ~280Gbps avg egress (95% from CDN), ~24TB Redis feed cache.",
    "Tech per component: Postgres (users/graph/post metadata, sharded by user), Cassandra (feed + activity timelines, time-bucketed keys), S3 (originals + renditions, erasure coded), Redis Cluster (feeds as sorted sets), Kafka (post-created events), Elasticsearch (hashtag/user search), CloudFront/Akamai (media edge).",
    "Uploads are presigned direct-to-S3: API issues scoped short-lived URL, client PUTs bytes, metadata row flips PROCESSING -> READY only after verification + moderation. Media keys are content-hashed and immutable -> CDN 'invalidation' is a metadata pointer swap; real purges only for takedowns.",
    "Cassandra hot partitions: bucket keys by time ((user_id, day_bucket)), salt hot keys (post_id, hash(actor) % 16), absorb counters in Redis with batched flush. Adding nodes does NOT fix a hot partition.",
  ],
  cheatSheet: [
    "Photo ID generation: Snowflake = 41-bit timestamp + 10-bit datacenter/worker + 12-bit sequence. ~4K IDs/ms/worker.",
    "Consistent hashing: hash(nodeId + vnodeIndex) -> ring position. 200 vnodes/node -> <5% load variance. Adding a node moves ~1/N keys.",
    "Fan-out on write: ZADD feed:{userId} {timestamp} {postId}. ZREMRANGEBYRANK to trim to 800 entries.",
    "Fan-out on read: SMEMBERS following:{userId} -> filter celebrities -> ZREVRANGE posts:{celebId} 0 20 -> merge + rank.",
    "Feed ranking features: recency (exponential decay), engagement velocity (likes/hr), relationship strength (interaction count), content affinity (type preferences), ML predicted P(engage).",
    "Stories TTL: time-partitioned storage. Partition key = floor(createTime / 1h). Drop partition when age > 25h.",
    "Bloom filter sizing: m = -n*ln(p)/ln(2)^2, k = (m/n)*ln(2). 1B items at 1% FP = ~1.2GB.",
    "CDN cache: pull-through model. Cache-Control: public, max-age=604800 for photos. Purge API for takedowns.",
    "Explore pipeline latency budget: candidate fetch 20ms + pre-rank 10ms + heavy rank 50ms + dedup/diversity 10ms + response build 10ms = ~100ms.",
    "Storage math: 100M photos/day x ~3MB (2MB original + renditions) = ~300TB/day = ~110PB/year. 500M stories x 500KB = ~250TB/day (steady-state bounded by 24h TTL).",
    "QPS math: 100M uploads / 86,400s = ~1,160/s avg, x3 peak = ~3,500/s. 500M DAU x 10 feed loads = 5B/day = ~58K/s avg, ~175K/s peak.",
    "Egress math: 500M DAU x 20 views x 300KB = ~3PB/day = ~280Gbps avg; 95% CDN hit rate -> origin egress only tens of Gbps.",
    "Redis feed cache sizing: 500M users x 800 entries x ~60B/entry = ~24TB -> ~100 nodes at 256GB.",
    "Cassandra feed schema: PRIMARY KEY ((user_id, day_bucket), created_at DESC). Hot key salt: (post_id, hash(actor) % 16). Counters: Redis INCR + periodic batched flush.",
    "Presigned upload flow: POST /media/uploads -> photo ID + scoped presigned URL (content-length-range, short expiry) -> client PUT to S3 -> confirm -> Kafka post-created -> workers write content-hashed renditions -> state READY.",
  ],
  glossary: [
    {
      term: "Fan-Out on Write",
      definition:
        "A feed distribution strategy where a new post is immediately pushed to every follower's precomputed feed cache at the time of creation. Trades higher write cost for faster read performance.",
    },
    {
      term: "Fan-Out on Read",
      definition:
        "A feed distribution strategy where the feed is assembled at read time by fetching recent posts from all followed accounts and merging them. Trades slower reads for cheaper writes, used for celebrity accounts.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A hashing technique that maps both data keys and storage nodes onto a circular ring. When nodes are added or removed, only a minimal fraction (~1/N) of keys need to be redistributed, unlike modular hashing which requires full rehashing.",
    },
    {
      term: "Virtual Node (VNode)",
      definition:
        "A technique in consistent hashing where each physical node is represented by multiple points on the hash ring. This smooths out the distribution of keys, reducing hotspots caused by uneven node placement.",
    },
    {
      term: "Bloom Filter",
      definition:
        "A probabilistic data structure that tests whether an element is a member of a set. It can return false positives but never false negatives. Used in Instagram's Explore feed to track seen posts with minimal memory.",
    },
    {
      term: "Snowflake ID",
      definition:
        "A distributed unique ID generation scheme that combines a timestamp, datacenter/worker identifier, and a sequence number into a 64-bit integer. Produces time-ordered, globally unique IDs without coordination between generators.",
    },
    {
      term: "Time-Partitioned Storage",
      definition:
        "A storage scheme where data is organized into partitions based on creation time (e.g., hourly buckets). Enables efficient bulk deletion of expired data by dropping entire partitions rather than scanning and deleting individual items.",
    },
    {
      term: "Presigned URL",
      definition:
        "A time-limited, cryptographically signed URL that grants a client direct, scoped access to an object-storage operation (e.g., PUT one specific key with a size limit). Lets clients upload media straight to S3 without proxying bytes through application servers.",
    },
    {
      term: "Rendition",
      definition:
        "A derived version of an uploaded media asset at a specific resolution or format (e.g., 150px thumbnail, 640px feed image, 1080px full, WebP/AVIF variants). Generated once by async workers and stored under immutable content-hashed keys.",
    },
    {
      term: "Hot Partition",
      definition:
        "A partition in a distributed store (e.g., Cassandra) that receives disproportionate read or write traffic or grows unboundedly, overloading its replica set. Mitigated by time-bucketing partition keys, salting hot keys across shards, and absorbing counters in a cache.",
    },
    {
      term: "Write Amplification (Fan-Out)",
      definition:
        "The multiplication of a single logical write into many physical writes — one celebrity post fanned out to 50M follower feeds is 50M cache writes. The hybrid feed model exists specifically to cap this cost.",
    },
    {
      term: "Erasure Coding",
      definition:
        "A durability technique that splits data into fragments with parity so it survives node loss at ~1.5x storage overhead instead of 3x full replication. Standard for exabyte-scale object stores holding immutable media.",
    },
  ],
  animations: [
    {
      title: "Upload and serve a photo",
      steps: [
        {
          label: "Client requests an upload URL",
          detail: "API returns a presigned URL. Image bytes never pass through your servers.",
        },
        {
          label: "Direct upload",
          detail: "Client PUTs to object storage.",
        },
        {
          label: "Notify",
          detail: "Client tells the API the upload completed; a metadata row is written.",
        },
        {
          label: "Async processing",
          detail: "A queue triggers thumbnail generation at several sizes, plus moderation checks.",
        },
        {
          label: "Serve",
          detail: "Images via CDN, keyed by immutable content hash so they cache forever.",
        },
        {
          label: "Feed",
          detail: "Metadata only — the feed returns ids and URLs; the heavy bytes come from the CDN.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Fan-Out on Write (Push)",
      "Fan-Out on Read (Pull)",
      "Hybrid (Instagram)",
    ],
    rows: [
      [
        "Write cost",
        "High: O(followers) cache writes per post",
        "Low: O(1) store the post only",
        "Medium: O(followers) for regular users, O(1) for celebrities",
      ],
      [
        "Read latency",
        "Very low: single cache read",
        "High: fetch from N followed accounts + merge",
        "Low: cache read + small number of celebrity fetches",
      ],
      [
        "Celebrity handling",
        "Extremely expensive (50M writes per post)",
        "Handled naturally (fetched on read)",
        "Celebrities use pull model only",
      ],
      [
        "Inactive user waste",
        "High: writes to feeds never read",
        "None: only computed when requested",
        "Reduced: skip inactive users during push",
      ],
      [
        "Post visibility delay",
        "Seconds to minutes (fan-out time)",
        "None (computed at read time)",
        "Seconds for regular posts, none for celebrity posts",
      ],
      [
        "Storage overhead",
        "High: every post ID stored in N feed caches",
        "Low: no precomputed feeds",
        "Moderate: precomputed feeds for active users only",
      ],
    ],
  },
  followUps: [
    "How would you add support for Instagram Reels (short-form video) to this architecture? What changes to the upload pipeline, storage, and CDN strategy would be needed?",
    "How would you design the Direct Messaging system for Instagram, including message delivery guarantees, end-to-end encryption, and media sharing within DMs?",
    "How would you handle a large-scale CDN outage where a major edge region goes offline? What failover mechanisms should be in place?",
    "How would you design the notification system that alerts users about likes, comments, follows, and story views at Instagram's scale?",
    "How would you implement a global search feature that allows users to search for accounts, hashtags, and locations in real time?",
    "How would you design an abuse detection system that identifies and removes spam accounts, fake engagement, and policy-violating content?",
    "How would you evolve the feed storage if Cassandra partition sizes for very active users started degrading read latency?",
    "How would you support editing a posted photo's caption and alt text with the CDN and immutable media keys in place?",
    "How would you run this architecture active-active across three regions, and which components need conflict resolution?",
  ],
  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing are directly applicable to Instagram's architecture.",
    },
    {
      label: "Instagram Engineering Blog: Scaling Instagram Infrastructure", url: "https://instagram-engineering.com/",
      kind: "article",
      note: "First-party engineering posts covering Django migration, Cassandra usage, and feed delivery at scale.",
    },
    {
      label: "System Design Interview by Alex Xu (Volume 1, Chapter 11: Design a News Feed System)", url: "https://bytebytego.com/",
      kind: "book",
      note: "Covers the fan-out on write vs read trade-off with detailed calculations and diagrams applicable to Instagram's feed.",
    },
    {
      label: "Meta Engineering: TAO - The Power of the Graph (USENIX ATC 2013)",
      kind: "paper",
      note: "Describes the graph storage system (TAO) used at Meta for the social graph, directly relevant to Instagram's follow relationships.",
    },
    {
      label: "Consistent Hashing and Random Trees (Karger et al., 1997)", url: "https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf",
      kind: "paper",
      note: "The foundational paper on consistent hashing, essential reading for understanding Instagram's storage distribution strategy.",
    },
  ],
};
