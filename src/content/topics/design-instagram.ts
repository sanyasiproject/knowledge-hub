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
    "## Requirements and Scale Estimation\n\nInstagram must support core features: photo/video upload with filters, stories (24h ephemeral media), a personalized home feed, explore/discovery, direct messaging, likes, comments, and follow/unfollow. Non-functional requirements include sub-200ms feed load time, 99.99% availability, eventual consistency (a post appearing a few seconds late is acceptable), and global reach with low latency across continents. Scale estimation: with 2B MAU and ~500M DAU, assume 10 feed views per user per day yielding 5B feed reads/day (~58K read QPS). Photo uploads: 100M/day (~1,150 uploads/sec). Average photo size after compression is ~200KB, so daily ingestion is ~20TB of raw photo data, plus 3x for resized variants (~60TB/day). Stories: 500M/day at ~500KB average = ~250TB/day, but with 24h TTL the steady-state storage is bounded. The read-to-write ratio is roughly 100:1, making caching critical.",
    "## Photo Upload Pipeline and Storage Architecture\n\nWhen a user uploads a photo, the client sends the image to an upload service behind a load balancer. The upload service assigns a globally unique photo ID (Snowflake-style: timestamp + datacenter + sequence), writes the original to a temporary staging bucket, and enqueues a processing job. The media processing pipeline runs asynchronously: it applies the selected filter, resizes the image into multiple resolutions (150px thumbnail, 640px feed, 1080px full), strips EXIF metadata for privacy, and writes all variants to the permanent object store (S3 or equivalent). Metadata (photo ID, owner, caption, hashtags, dimensions, creation time, storage keys) is written to a sharded MySQL or PostgreSQL database. Consistent hashing maps photo IDs to storage shards, ensuring balanced distribution and minimal data movement when shards are added or removed. A CDN (CloudFront, Akamai) caches photos at edge locations worldwide; cache hit rates exceed 95% for popular content. Failure handling: if processing fails, the job is retried from the staging bucket with exponential backoff; idempotency keys prevent duplicate posts.",
    "## Feed Generation: Hybrid Fan-Out with Ranking\n\nThe home feed combines a push and pull model. When a regular user (fewer than ~10K followers) publishes a post, a fan-out service reads their follower list from the social graph and inserts the post ID into each follower's feed cache (a Redis sorted set scored by timestamp). For celebrity accounts (more than 10K followers), no fan-out occurs at write time. At read time, the feed service retrieves the precomputed feed from Redis, then fetches recent posts from any followed celebrity accounts, merges the two lists, and applies a ranking model. The ranking model considers recency (exponential time decay), engagement signals (like/comment/save velocity in the first hour), relationship strength (how often the viewer interacts with the author via likes, DMs, profile visits), and content-type affinity (users who engage more with Reels see more video). The ranker produces a final score for each candidate and returns the top 50 for the first page. Cursor-based pagination allows infinite scrolling without duplicates. The entire read path targets a p99 latency under 200ms, achieved through aggressive caching and pre-ranking.",
    "## Social Graph, Stories, and Explore\n\nThe social graph (who follows whom) is stored in a dedicated graph service backed by a sharded adjacency list (MySQL or TAO-style graph store). Each edge stores followerId, followeeId, and timestamp. The graph supports two fast queries: 'who does user X follow' (used for feed fan-out on read and suggestions) and 'who follows user X' (used for fan-out on write and follower counts). Both directions are indexed. Stories are stored separately from posts: each story has a TTL of 24 hours and is kept in a time-partitioned store. When a user opens the stories tray, the client fetches the list of followed users who have unexpired stories (a Redis set per user, entries auto-expire via TTL). Story media is served from the CDN with aggressive caching since stories are hot content viewed by many users in a short window. The Explore page uses a recommendation engine that combines collaborative filtering (users who liked similar posts), content embeddings (CNN-extracted feature vectors from images), engagement velocity (posts gaining likes rapidly), and diversity constraints (avoid showing too many posts from one category). The Explore service precomputes candidate pools periodically and re-ranks them in real time per user request.",
    "## Reliability, Consistency, and Operational Concerns\n\nInstagram favors availability over strict consistency (AP in CAP terms). A new post may take a few seconds to appear in all followers' feeds, and like counts are eventually consistent. Data is replicated across multiple datacenters with asynchronous replication; in the rare event of a datacenter failure, traffic is rerouted to surviving regions. The photo pipeline uses idempotent operations: re-processing an upload produces the same output, so retries are safe. Rate limiting protects against spam and abuse: per-user upload limits (e.g., 100 photos/day), per-IP request limits, and per-account API rate limits. Monitoring tracks key metrics: upload success rate, feed load p50/p99 latency, CDN cache hit ratio, fan-out lag, and storage growth rate. Capacity planning uses the daily ingestion rate (~60TB photos, ~250TB stories) to project storage needs and trigger shard splits or new node provisioning. Database schema changes are performed online using tools like pt-online-schema-change or gh-ost to avoid downtime on tables with billions of rows.",
  ],
  deepDive: [
    "Consistent hashing is fundamental to Instagram's storage layer. Rather than using simple modular hashing (photoId % N), which would require rehashing nearly all keys when a node is added or removed, consistent hashing maps both photo IDs and storage nodes onto a virtual ring. Each physical node is assigned multiple virtual nodes (typically 100-200) to ensure even distribution. When a photo needs to be stored, its hash is computed and the ring is traversed clockwise to find the first virtual node; the physical node owning that virtual node stores the photo. When a node fails, only the keys mapped to that node are redistributed to the next node on the ring, affecting roughly 1/N of the data. Instagram uses this for both its object storage distribution and its database sharding, with shard-aware routing in the application layer. The virtual node count is tuned to balance load variance against routing table size: too few virtual nodes cause hotspots, too many increase memory usage in the routing table. In practice, with 200 virtual nodes per physical node and a good hash function (MurmurHash3 or xxHash), the load imbalance is under 5%.",
    "Feed ranking at Instagram's scale requires a multi-stage pipeline to keep latency low while evaluating thousands of candidate posts. The first stage is candidate generation: the precomputed feed (from fan-out on write) plus celebrity posts (fetched on read) yield a raw candidate set of ~500 posts. The second stage is a lightweight pre-ranker that applies a simple linear model to reduce the set to ~150 candidates, filtering out low-quality or duplicate content. The third stage is the heavy ranker: a deep neural network (typically a multi-task model predicting probability of like, comment, save, and share) scores each candidate. Feature inputs include user-post interaction history, post age, author engagement rate, image embedding similarity to the user's interest profile, and time-of-day patterns. The final stage applies business rules: diversity constraints (no more than 2 consecutive posts from the same author), freshness guarantees (at least 30% of feed items should be from the last 6 hours), and ads interleaving. The entire pipeline runs in under 100ms by pre-computing features in a feature store (Redis + Flink) and serving the model via a low-latency inference service (TensorFlow Serving or equivalent).",
    "The stories infrastructure presents unique challenges compared to the permanent photo graph. Stories have a strict 24-hour TTL, which means the storage system must efficiently expire and garbage-collect billions of objects daily. Instagram uses a time-partitioned storage scheme: stories created in each hour are stored in a dedicated partition, and entire partitions are dropped after 25 hours (the extra hour provides a buffer). The stories tray (the row of circles at the top of the app) must load in under 100ms, which requires knowing which of the user's followed accounts have active stories without scanning all of them. This is solved with a Redis-backed presence set: when a user posts a story, their user ID is added to a set with a 24h TTL. When loading the tray, the app intersects the viewer's following list with the presence set. Story viewing order is ranked by relationship strength and recency. Stories also support interactive elements (polls, questions, quizzes) which require real-time aggregation of responses; these are handled by a separate real-time counting service using Redis HyperLogLog for unique viewer counts and sorted sets for poll tallies.",
    "Instagram's Explore and Discovery system must recommend posts from accounts a user does not follow, which is fundamentally different from the home feed. The system operates on an item-to-item collaborative filtering model combined with content understanding. First, a set of seed accounts is identified: accounts similar to those the user already follows (based on co-follow patterns and interaction overlap). Posts from these seed accounts, plus posts with high engagement velocity (viral content), form the candidate pool of ~10K posts per user, refreshed every few hours. At request time, a real-time ranker scores each candidate using the same multi-task neural network as the feed ranker, but with additional features like topic diversity (the user should see posts from multiple interest categories), content novelty (avoid showing the same viral post repeatedly), and safety signals (demoting borderline content). Image understanding is powered by a CNN (ResNet or EfficientNet) that extracts a 2048-dimensional embedding vector for each photo; similar images cluster together in embedding space, enabling visual similarity recommendations. Hashtag co-occurrence graphs provide additional topic signals. The Explore page is one of Instagram's most computationally expensive features, requiring a dedicated cluster of GPU-equipped inference servers.",
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
        "End-to-end architecture showing the photo upload pipeline, feed generation, and content serving paths.",
      mermaid: `graph LR
    Client[Mobile Client]
    LB[Load Balancer]
    UploadSvc[Upload Service]
    MediaProc[Media Processing]
    ObjStore[Object Storage S3]
    CDN[CDN Edge Nodes]
    FeedSvc[Feed Service]
    FanOut[Fan-Out Service]
    RedisCache[Redis Feed Cache]
    Ranker[Ranking Service]
    PostDB[(Post Database)]
    GraphDB[(Social Graph DB)]
    ExploreSvc[Explore Service]
    MLInference[ML Inference]

    Client -->|upload| LB
    LB --> UploadSvc
    UploadSvc --> MediaProc
    MediaProc --> ObjStore
    ObjStore --> CDN
    UploadSvc --> PostDB
    UploadSvc --> FanOut
    FanOut --> GraphDB
    FanOut --> RedisCache

    Client -->|read feed| LB
    LB --> FeedSvc
    FeedSvc --> RedisCache
    FeedSvc --> Ranker
    Ranker --> MLInference
    FeedSvc --> CDN

    Client -->|explore| LB
    LB --> ExploreSvc
    ExploreSvc --> MLInference
    ExploreSvc --> PostDB`,
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
    "Storage math: 100M photos/day x 200KB x 4 variants = ~80TB/day. 500M stories x 500KB = ~250TB/day (steady-state bounded by 24h TTL).",
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
  ],
  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters on partitioning, replication, and stream processing are directly applicable to Instagram's architecture.",
    },
    {
      label: "Instagram Engineering Blog: Scaling Instagram Infrastructure",
      kind: "article",
      note: "First-party engineering posts covering Django migration, Cassandra usage, and feed delivery at scale.",
    },
    {
      label: "System Design Interview by Alex Xu (Volume 1, Chapter 11: Design a News Feed System)",
      kind: "book",
      note: "Covers the fan-out on write vs read trade-off with detailed calculations and diagrams applicable to Instagram's feed.",
    },
    {
      label: "Meta Engineering: TAO - The Power of the Graph (USENIX ATC 2013)",
      kind: "paper",
      note: "Describes the graph storage system (TAO) used at Meta for the social graph, directly relevant to Instagram's follow relationships.",
    },
    {
      label: "Consistent Hashing and Random Trees (Karger et al., 1997)",
      kind: "paper",
      note: "The foundational paper on consistent hashing, essential reading for understanding Instagram's storage distribution strategy.",
    },
  ],
};
