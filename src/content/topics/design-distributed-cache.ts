import type { TopicContent } from "../types";

export const designDistributedCache: TopicContent = {
  quickSummary: [
    "A distributed cache partitions key-value data across multiple nodes using consistent hashing, delivering sub-millisecond reads and 100K+ operations per second per node by keeping the working set in RAM.",
    "Eviction policies (LRU, LFU, TTL) control memory pressure: LRU evicts the least-recently-used entry, LFU tracks access frequency to keep hot data, and TTL auto-expires stale entries regardless of access patterns.",
    "Cache-aside (lazy loading), write-through, and write-behind are the three core integration patterns; each trades off consistency, latency, and durability differently depending on the read/write ratio of your workload.",
    "Consistent hashing with virtual nodes ensures that adding or removing a cache node only remaps ~1/N of the keys, avoiding a thundering-herd cache miss storm during cluster resizing.",
    "Hot key mitigation techniques include local in-process caches with short TTLs, key replication across multiple shards, and request coalescing (singleflight) to prevent duplicate backend fetches for the same key.",
  ],
  detailed: [
    "## Why Distribute a Cache?\n\nA single-node in-memory cache like a standalone Redis instance can serve ~100K-200K ops/sec with sub-millisecond p99 latency, but it has hard limits: memory is bounded by the host (typically 64-256 GB), and a single point of failure means a cold restart drops your entire working set. A distributed cache partitions data across N nodes, multiplying both memory capacity and throughput linearly. The trade-off is network hops (100-200 microseconds per intra-datacenter round trip) and coordination complexity for operations like invalidation. The decision to distribute should be driven by concrete capacity math: if your working set is 400 GB and a single node holds 64 GB, you need at least 7 nodes (leaving headroom for fragmentation).",
    "## Consistent Hashing and Data Placement\n\nConsistent hashing maps both keys and nodes onto a hash ring (typically using a 2^32 or 2^128 space). A key is assigned to the first node encountered clockwise on the ring from the key's hash position. Without virtual nodes, data distribution is uneven because real nodes cluster on the ring. Virtual nodes solve this by mapping each physical node to 100-200 points on the ring, smoothing the distribution to within 5-10% variance. When a node joins, it takes ownership of key ranges from its neighbors; when it leaves, its ranges are redistributed. The critical property is that only ~1/N keys are remapped, unlike modular hashing where adding a node remaps nearly every key. Redis Cluster uses 16,384 hash slots (a fixed ring) assigned to nodes, while Memcached relies on client-side consistent hashing.",
    "## Eviction Policies and Memory Management\n\nWhen memory reaches the configured limit (maxmemory in Redis), the eviction policy determines which keys to discard. LRU (Least Recently Used) evicts entries not accessed for the longest time; Redis approximates this by sampling 5 keys and evicting the oldest, avoiding the overhead of a true doubly-linked-list LRU. LFU (Least Frequently Used) tracks access frequency with a logarithmic counter plus a decay factor, keeping genuinely popular keys even if they have a brief idle period. TTL-based expiration runs independently: Redis uses a combination of lazy deletion (check on access) and periodic sampling (10 times/sec, checking 20 random keys with TTL). A common production pattern combines TTL for correctness (stale data limit) with LRU/LFU as a safety net when memory is full. Memory fragmentation is a hidden cost; Redis reports mem_fragmentation_ratio, and values above 1.5 indicate significant wasted memory that may require a restart or active defragmentation.",
    "## Cache Integration Patterns\n\nCache-aside (lazy loading) is the most common: the application checks the cache, on miss it queries the database, then populates the cache. This is simple but risks thundering herd on popular keys (N concurrent requests all miss and all hit the database). Write-through writes to both cache and database synchronously in the same request path, guaranteeing consistency but adding latency to every write (typically 2-5 ms for the cache write plus the database write). Write-behind (write-back) buffers writes in the cache and asynchronously flushes to the database in batches, reducing write latency and database load but risking data loss if the cache node crashes before the flush. Read-through is like cache-aside but the cache itself fetches from the database on a miss, simplifying application code at the cost of coupling the cache to the data source. The choice depends on your read/write ratio: cache-aside suits read-heavy workloads (90%+ reads), write-behind suits write-heavy workloads with tolerance for eventual consistency.",
    "## Replication and Fault Tolerance\n\nRedis Cluster uses asynchronous primary-replica replication: writes go to the primary, which streams them to replicas. On primary failure, a replica is promoted via a Raft-like consensus among the remaining primaries (requiring a majority). The replication lag window (typically 1-10 ms) means acknowledged writes can be lost during failover. To mitigate this, Redis supports WAIT command to block until N replicas acknowledge the write, but this adds latency. The CAP trade-off is explicit: Redis Cluster chooses availability and partition tolerance, sacrificing consistency during network partitions. For use cases requiring stronger consistency, you layer application-level safeguards like cache stampede protection, distributed locks with fencing tokens, or treating the cache as purely a performance optimization that can always be rebuilt from the source of truth.",
  ],
  deepDive: [
    "Hot keys are the silent killer of distributed cache systems. A single key receiving 50K+ requests per second (a viral tweet, a flash sale product, a global config entry) saturates the CPU of the shard owning that key, creating a bottleneck that no amount of horizontal scaling fixes because the key maps to exactly one node. The mitigation strategies form a hierarchy: first, add a local in-process cache (Caffeine, Guava) with a 1-5 second TTL to absorb repeated reads without network hops. Second, use request coalescing (Go's singleflight pattern) so that concurrent cache misses for the same key result in a single backend fetch. Third, for extreme cases, replicate the hot key to multiple shards by appending a random suffix (key_0 through key_7) and having clients randomly choose one, spreading load across 8 nodes. Each layer adds complexity: local caches create consistency windows, coalescing adds latency variance for waiters, and key replication multiplies invalidation cost.",
    "Cache stampede (thundering herd) occurs when a popular key expires and hundreds of concurrent requests simultaneously miss the cache, overwhelming the database. The standard solutions are probabilistic early recomputation (each request has a small chance of refreshing the key before it expires, proportional to remaining TTL), locking (only one request fetches the value while others wait or serve stale data), and stale-while-revalidate (serve the expired value while asynchronously refreshing). In practice, combining short-TTL stale serving with a background refresh thread works best for high-traffic keys. The math matters: if a key is accessed 10K times/sec and TTL is 60 seconds, the expected number of concurrent misses at expiration is proportional to the fetch latency times the request rate. A 50ms database query means ~500 simultaneous cache misses, which can spike database CPU from 20% to 100% in a single TTL cycle.",
    "Memory management at scale involves more than setting maxmemory. Redis uses jemalloc by default, which allocates in size classes (8, 16, 32, ... bytes), meaning a 40-byte value occupies a 48-byte allocation, wasting 20%. For small values, Redis hash ziplist encoding stores up to 128 fields in a compact, CPU-cache-friendly format that uses 10x less memory than regular hash tables. The trade-off is O(N) access within the ziplist versus O(1) for a hash table, but for N < 128 the linear scan is faster due to cache locality. At cluster scale, memory accounting must include replication buffers (output-buffer-limit for replicas can consume gigabytes during full resyncs), Lua script memory, client connection buffers (each client uses ~16 KB minimum), and key expiry metadata. A production rule of thumb is to provision 1.5x the expected data size to account for fragmentation, buffers, and overhead.",
    "Designing for failure means assuming every cache node can crash at any time and the system still functions correctly, just slower. The critical insight is that a cache is not a source of truth; it is an optimization layer. Design the system so that cache unavailability degrades to higher latency, not incorrect behavior. This means database queries must have reasonable timeouts and connection pool limits to survive a cache-down surge, read replicas can absorb some of the redirected load, and circuit breakers should trip before the database is overwhelmed. During a cache warmup after a cold start, a technique called cache warming pre-populates keys from a snapshot or from recent access logs, reducing the miss storm window from minutes to seconds. For planned maintenance, use connection draining: stop accepting new connections on the node, wait for in-flight requests to complete, then migrate its hash slots to other nodes before shutdown.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Consistent hashing ring with virtual nodes",
      source: `#include <map>
#include <string>
#include <functional>
#include <vector>
#include <stdexcept>

class ConsistentHashRing {
public:
    explicit ConsistentHashRing(int virtual_nodes = 150)
        : virtual_nodes_(virtual_nodes) {}

    void addNode(const std::string& node) {
        for (int i = 0; i < virtual_nodes_; ++i) {
            std::string vnode_key = node + "#" + std::to_string(i);
            size_t hash = std::hash<std::string>{}(vnode_key);
            ring_[hash] = node;
        }
        physical_nodes_.push_back(node);
    }

    void removeNode(const std::string& node) {
        for (int i = 0; i < virtual_nodes_; ++i) {
            std::string vnode_key = node + "#" + std::to_string(i);
            size_t hash = std::hash<std::string>{}(vnode_key);
            ring_.erase(hash);
        }
        physical_nodes_.erase(
            std::remove(physical_nodes_.begin(), physical_nodes_.end(), node),
            physical_nodes_.end());
    }

    // Find the node responsible for a given key.
    // Walks clockwise on the ring from the key's hash position.
    std::string getNode(const std::string& key) const {
        if (ring_.empty()) {
            throw std::runtime_error("Hash ring is empty");
        }
        size_t hash = std::hash<std::string>{}(key);
        auto it = ring_.lower_bound(hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // wrap around the ring
        }
        return it->second;
    }

    // Get N distinct physical nodes for replication.
    std::vector<std::string> getNodes(const std::string& key, int count) const {
        std::vector<std::string> nodes;
        if (ring_.empty()) return nodes;

        size_t hash = std::hash<std::string>{}(key);
        auto it = ring_.lower_bound(hash);

        while (nodes.size() < static_cast<size_t>(count)) {
            if (it == ring_.end()) it = ring_.begin();
            // Skip duplicates (virtual nodes of same physical node)
            if (std::find(nodes.begin(), nodes.end(), it->second) == nodes.end()) {
                nodes.push_back(it->second);
            }
            ++it;
        }
        return nodes;
    }

private:
    int virtual_nodes_;
    std::map<size_t, std::string> ring_;        // hash -> physical node
    std::vector<std::string> physical_nodes_;
};`,
    },
    {
      language: "cpp",
      caption: "Thread-safe LRU cache with O(1) get/put",
      source: `#include <unordered_map>
#include <list>
#include <mutex>
#include <optional>
#include <chrono>

template <typename K, typename V>
class LRUCache {
public:
    explicit LRUCache(size_t capacity) : capacity_(capacity) {}

    std::optional<V> get(const K& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = map_.find(key);
        if (it == map_.end()) {
            ++stats_.misses;
            return std::nullopt;
        }

        // Check TTL expiration
        auto& entry = it->second->second;
        if (entry.expiry.has_value() &&
            std::chrono::steady_clock::now() > entry.expiry.value()) {
            order_.erase(it->second);
            map_.erase(it);
            ++stats_.misses;
            return std::nullopt;
        }

        // Move to front (most recently used)
        order_.splice(order_.begin(), order_, it->second);
        ++stats_.hits;
        return entry.value;
    }

    void put(const K& key, const V& value,
             std::optional<std::chrono::seconds> ttl = std::nullopt) {
        std::lock_guard<std::mutex> lock(mutex_);

        auto expiry = ttl.has_value()
            ? std::optional(std::chrono::steady_clock::now() + ttl.value())
            : std::nullopt;

        auto it = map_.find(key);
        if (it != map_.end()) {
            // Update existing entry
            it->second->second = {value, expiry};
            order_.splice(order_.begin(), order_, it->second);
            return;
        }

        // Evict LRU entry if at capacity
        if (map_.size() >= capacity_) {
            auto last = order_.back();
            map_.erase(last.first);
            order_.pop_back();
            ++stats_.evictions;
        }

        // Insert new entry at front
        order_.emplace_front(key, CacheEntry{value, expiry});
        map_[key] = order_.begin();
    }

    struct Stats {
        uint64_t hits = 0;
        uint64_t misses = 0;
        uint64_t evictions = 0;
        double hitRate() const {
            uint64_t total = hits + misses;
            return total > 0 ? static_cast<double>(hits) / total : 0.0;
        }
    };

    Stats getStats() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return stats_;
    }

private:
    struct CacheEntry {
        V value;
        std::optional<std::chrono::steady_clock::time_point> expiry;
    };

    using ListType = std::list<std::pair<K, CacheEntry>>;

    size_t capacity_;
    ListType order_;                                        // front = MRU, back = LRU
    std::unordered_map<K, typename ListType::iterator> map_;
    mutable std::mutex mutex_;
    Stats stats_;
};`,
    },
    {
      language: "cpp",
      caption: "Distributed cache client with retry, fallback, and request coalescing",
      source: `#include <string>
#include <vector>
#include <optional>
#include <functional>
#include <unordered_map>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <thread>
#include <memory>
#include <stdexcept>

// Represents a connection to a single cache node.
struct CacheNode {
    std::string host;
    int port;
    bool healthy = true;
    // In production: connection pool, health check thread, etc.
};

class DistributedCacheClient {
public:
    DistributedCacheClient(std::vector<CacheNode> nodes,
                           int max_retries = 2,
                           std::chrono::milliseconds retry_delay = std::chrono::milliseconds(50))
        : nodes_(std::move(nodes)),
          max_retries_(max_retries),
          retry_delay_(retry_delay),
          ring_(150) {
        for (auto& node : nodes_) {
            ring_.addNode(node.host + ":" + std::to_string(node.port));
        }
    }

    // Get with retry logic, request coalescing, and fallback.
    std::optional<std::string> get(const std::string& key) {
        // Request coalescing: if another thread is already fetching
        // this key, wait for its result instead of issuing a duplicate request.
        {
            std::unique_lock<std::mutex> lock(inflight_mutex_);
            auto it = inflight_.find(key);
            if (it != inflight_.end()) {
                auto flight = it->second;
                lock.unlock();
                std::unique_lock<std::mutex> flock(flight->mutex);
                flight->cv.wait(flock, [&] { return flight->done; });
                return flight->result;
            }
            // Register this request as in-flight
            auto flight = std::make_shared<InFlight>();
            inflight_[key] = flight;
        }

        std::optional<std::string> result;
        try {
            result = getWithRetry(key);
        } catch (...) {
            // Clear in-flight and notify waiters even on failure
            completeInflight(key, std::nullopt);
            throw;
        }

        completeInflight(key, result);
        return result;
    }

    // Set with write-through to primary and optional async replication.
    bool set(const std::string& key, const std::string& value,
             std::chrono::seconds ttl = std::chrono::seconds(3600)) {
        std::string node_id = ring_.getNode(key);
        for (int attempt = 0; attempt <= max_retries_; ++attempt) {
            try {
                return sendSet(node_id, key, value, ttl);
            } catch (const std::runtime_error&) {
                if (attempt < max_retries_) {
                    std::this_thread::sleep_for(
                        retry_delay_ * (1 << attempt));  // exponential backoff
                }
            }
        }
        return false;  // all retries exhausted
    }

private:
    struct InFlight {
        std::mutex mutex;
        std::condition_variable cv;
        bool done = false;
        std::optional<std::string> result;
    };

    std::optional<std::string> getWithRetry(const std::string& key) {
        std::string primary = ring_.getNode(key);
        auto replicas = ring_.getNodes(key, 3);

        for (int attempt = 0; attempt <= max_retries_; ++attempt) {
            try {
                return sendGet(primary, key);
            } catch (const std::runtime_error&) {
                // Try a replica on failure
                for (size_t r = 1; r < replicas.size(); ++r) {
                    try {
                        return sendGet(replicas[r], key);
                    } catch (...) { continue; }
                }
                if (attempt < max_retries_) {
                    std::this_thread::sleep_for(
                        retry_delay_ * (1 << attempt));
                }
            }
        }
        return std::nullopt;  // cache miss after exhausting retries
    }

    void completeInflight(const std::string& key,
                          std::optional<std::string> result) {
        std::unique_lock<std::mutex> lock(inflight_mutex_);
        auto it = inflight_.find(key);
        if (it != inflight_.end()) {
            auto flight = it->second;
            inflight_.erase(it);
            lock.unlock();
            std::lock_guard<std::mutex> flock(flight->mutex);
            flight->result = result;
            flight->done = true;
            flight->cv.notify_all();
        }
    }

    // Stubs for actual network calls
    std::optional<std::string> sendGet(const std::string& node_id,
                                       const std::string& key) {
        // In production: send GET to the node via TCP/RESP protocol
        throw std::runtime_error("not implemented");
    }

    bool sendSet(const std::string& node_id, const std::string& key,
                 const std::string& value, std::chrono::seconds ttl) {
        throw std::runtime_error("not implemented");
    }

    std::vector<CacheNode> nodes_;
    int max_retries_;
    std::chrono::milliseconds retry_delay_;
    ConsistentHashRing ring_;

    std::mutex inflight_mutex_;
    std::unordered_map<std::string, std::shared_ptr<InFlight>> inflight_;
};`,
    },
  ],
  diagrams: [
    {
      title: "Distributed Cache Cluster Architecture",
      kind: "architecture",
      caption:
        "Clients route requests through a consistent hash ring to cache shards, each with a replica for failover. Cache misses fall through to the database.",
      mermaid: `graph LR
    Client1["Client 1"] --> LB["Load Balancer"]
    Client2["Client 2"] --> LB
    Client3["Client 3"] --> LB
    LB --> App1["App Server 1"]
    LB --> App2["App Server 2"]
    LB --> App3["App Server 3"]
    App1 --> HR["Hash Ring Router"]
    App2 --> HR
    App3 --> HR
    HR --> S1["Shard 1 Primary"]
    HR --> S2["Shard 2 Primary"]
    HR --> S3["Shard 3 Primary"]
    S1 --> R1["Shard 1 Replica"]
    S2 --> R2["Shard 2 Replica"]
    S3 --> R3["Shard 3 Replica"]
    S1 -.->|"miss"| DB["Database"]
    S2 -.->|"miss"| DB
    S3 -.->|"miss"| DB`,
    },
    {
      title: "Cache-Aside Read Flow",
      kind: "sequence",
      caption:
        "Application checks cache first; on miss, queries the database and populates the cache for subsequent reads.",
      mermaid: `sequenceDiagram
    participant App as Application
    participant Cache as Cache Node
    participant DB as Database

    App->>Cache: GET user:1234
    alt Cache Hit
        Cache-->>App: Return cached value
    else Cache Miss
        Cache-->>App: null
        App->>DB: SELECT * FROM users WHERE id=1234
        DB-->>App: User row
        App->>Cache: SET user:1234 value TTL=300s
        Cache-->>App: OK
    end`,
    },
    {
      title: "Key Eviction Decision Flow",
      kind: "flow",
      caption:
        "When memory reaches the limit, the eviction policy determines which keys are removed to make room for new entries.",
      mermaid: `flowchart TD
    NEW["New key write request"] --> CHECK{"Memory below maxmemory?"}
    CHECK -->|"Yes"| WRITE["Write key to memory"]
    CHECK -->|"No"| POLICY{"Eviction policy?"}
    POLICY -->|"LRU"| LRU["Sample 5 keys, evict least recently accessed"]
    POLICY -->|"LFU"| LFU["Sample 5 keys, evict lowest frequency counter"]
    POLICY -->|"TTL"| TTL["Evict key closest to expiration"]
    POLICY -->|"noeviction"| REJECT["Return OOM error to client"]
    LRU --> WRITE
    LFU --> WRITE
    TTL --> WRITE`,
    },
    {
      title: "Cache Failover and Replica Promotion",
      kind: "sequence",
      caption:
        "When a primary shard fails, replicas detect the failure and the cluster promotes a replica to primary via consensus.",
      mermaid: `sequenceDiagram
    participant P as Primary Shard 1
    participant R as Replica Shard 1
    participant S2 as Primary Shard 2
    participant S3 as Primary Shard 3
    participant App as Application

    Note over P: Primary crashes
    R->>R: Detect heartbeat timeout after 3s
    R->>S2: REQUEST_VOTE for slot range
    R->>S3: REQUEST_VOTE for slot range
    S2-->>R: VOTE_GRANTED
    S3-->>R: VOTE_GRANTED
    Note over R: Majority achieved - promote to primary
    R->>R: Promote self to primary
    R->>App: Notify cluster topology change
    App->>R: Redirect requests to new primary`,
    },
  ],
  animations: [
    {
      title: "Adding a node without a miss storm",
      steps: [
        {
          label: "Modulo hashing",
          detail: "`hash(key) % N`. With N = 4 keys are distributed evenly.",
        },
        {
          label: "Add a fifth node",
          detail: "N changes to 5. Almost every key now maps elsewhere — a near-total cache miss.",
        },
        {
          label: "Consistent hashing",
          detail: "Nodes and keys are placed on a ring; a key belongs to the next node clockwise.",
        },
        {
          label: "Add a node",
          detail: "Only the keys between the new node and its predecessor move — roughly 1/N of the keyspace.",
        },
        {
          label: "Virtual nodes",
          detail: "Each physical node occupies many ring positions, so load stays even and removal spreads across survivors.",
        },
        {
          label: "Still not solved",
          detail: "A single hot key remains on one node. That needs replication or a client-side cache.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Pattern",
      "Consistency",
      "Write Latency",
      "Read Latency",
      "Best For",
    ],
    rows: [
      [
        "Cache-Aside",
        "Eventual; stale reads possible until TTL expires",
        "No write overhead; cache populated on read",
        "Miss penalty: cache + DB roundtrip",
        "Read-heavy workloads with 90%+ read ratio",
      ],
      [
        "Write-Through",
        "Strong; cache always matches DB on write path",
        "Higher: synchronous write to cache + DB",
        "Fast: data always in cache after first write",
        "Data that is read shortly after being written",
      ],
      [
        "Write-Behind",
        "Eventual; async flush risks data loss on crash",
        "Lowest: only writes to cache; DB batched async",
        "Fast: data in cache immediately",
        "Write-heavy workloads tolerating eventual consistency",
      ],
      [
        "Read-Through",
        "Same as cache-aside but cache manages DB fetch",
        "No write overhead; similar to cache-aside",
        "Miss penalty handled by cache layer transparently",
        "Simplifying app code; cache as data abstraction",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How does consistent hashing work, and why is it preferred over simple modular hashing for distributed caches?",
      a: "Consistent hashing maps both keys and nodes onto a circular hash space (ring). Each key is assigned to the first node encountered clockwise from its hash position on the ring. With modular hashing (key % N), adding or removing a node remaps nearly every key because N changes, causing a massive cache miss storm. Consistent hashing limits remapping to approximately 1/N of total keys when a node changes, because only the neighbors of the affected node on the ring absorb or lose key ranges. Virtual nodes (100-200 per physical node) are essential to avoid skew, because a small number of physical nodes cluster unevenly on the ring. In production systems like Redis Cluster, the ring is simplified to 16,384 fixed hash slots that are assigned to nodes, making rebalancing a matter of moving slot ranges rather than recomputing hashes.",
      followUps: [
        "How would you handle a node failure when using consistent hashing?",
        "What happens to key distribution if you use too few virtual nodes?",
        "How does Redis Cluster differ from client-side consistent hashing in Memcached?",
      ],
    },
    {
      q: "Explain the thundering herd (cache stampede) problem and how you would mitigate it in a high-traffic system.",
      a: "Cache stampede occurs when a popular key expires and hundreds or thousands of concurrent requests simultaneously find the cache empty, all falling through to the database with the same expensive query. If the key serves 10K requests per second and the backend query takes 50ms, approximately 500 concurrent requests will hit the database in the miss window, potentially overwhelming it. There are four main mitigation strategies. First, probabilistic early recomputation: each request has a small random chance of refreshing the key before it expires, so the key is refreshed before the actual TTL deadline. Second, distributed locking: only one request acquires a lock to fetch the value while others either wait or serve a stale value. Third, stale-while-revalidate: continue serving the expired value while a single background thread refreshes it asynchronously. Fourth, request coalescing (singleflight): deduplicate in-flight requests so that concurrent misses for the same key result in a single backend fetch, with all waiters receiving the same result. In practice, combining stale-while-revalidate with request coalescing provides the best trade-off of simplicity, latency, and protection.",
      followUps: [
        "How would you implement distributed locking for cache stampede prevention?",
        "What are the downsides of serving stale data during revalidation?",
        "How does the singleflight pattern handle errors from the backend fetch?",
      ],
    },
    {
      q: "Compare LRU and LFU eviction policies. When would you choose one over the other?",
      a: "LRU (Least Recently Used) evicts the key that has not been accessed for the longest time. It is simple, has O(1) implementation with a hash map plus doubly-linked list, and works well for workloads with temporal locality where recent access predicts future access. However, LRU is vulnerable to scan pollution: a one-time batch scan of many keys can evict frequently-used hot keys because the scan keys are more recent. LFU (Least Frequently Used) tracks how often each key is accessed and evicts the least-accessed keys. Redis implements LFU with a logarithmic frequency counter (8 bits, maxing at 255) plus a decay mechanism that halves the counter based on elapsed time, preventing early popular keys from being permanently pinned. LFU is better for workloads with stable hot keys (product catalogs, user profiles) because it retains genuinely popular keys even during scan storms. The trade-off is that LFU is slower to adapt to changing access patterns because the frequency counter has inertia. Choose LRU as the default for general-purpose caching and LFU when your workload has a clear hot/cold distinction with occasional scans.",
      followUps: [
        "How does Redis approximate LRU instead of implementing a true LRU?",
        "What is the W-TinyLFU policy used by Caffeine, and why is it effective?",
        "How do you monitor eviction rates to know if your policy is working?",
      ],
    },
    {
      q: "How would you handle hot keys in a distributed cache to prevent single-node bottlenecks?",
      a: "A hot key is one that receives disproportionately high traffic, saturating the CPU or network bandwidth of the single shard that owns it. Since consistent hashing maps a key to exactly one primary node, no amount of horizontal scaling helps for that specific key. The layered mitigation strategy starts with a local in-process cache (like Caffeine in Java or a small LRU in your application) with a 1-5 second TTL, which absorbs repeated reads without any network hop. If the key is still hot beyond what local caching handles, use request coalescing so that concurrent cache misses collapse into a single backend fetch. For extreme cases like viral content, replicate the key across multiple shards by appending a random suffix (key_0 through key_7) and having clients randomly pick one, distributing load across 8 nodes. The cost is 8x the memory usage and 8x the invalidation messages when the key is updated. Another approach is to use a dedicated hot-key service that detects access patterns in real-time and automatically promotes hot keys to a broadcast cache replicated to all nodes.",
      followUps: [
        "How would you detect hot keys in real-time?",
        "What is the memory trade-off of replicating keys across shards?",
        "How does key replication interact with cache invalidation?",
      ],
    },
    {
      q: "Walk through the design of a distributed cache system that handles 1 million requests per second with sub-millisecond latency.",
      a: "Start with the math: a single Redis node handles roughly 100K-200K ops/sec, so at 1M ops/sec you need at least 10 nodes (with headroom, plan for 15-20). Each node should have 64-128 GB RAM on hardware with 25 Gbps networking and NVMe SSDs for persistence (RDB snapshots or AOF). Use consistent hashing with 16,384 hash slots distributed across shards, with one replica per shard for failover. The client library should use connection pooling (16-32 connections per node), pipelining (batch 10-50 commands per round trip to amortize network overhead), and client-side caching with server-assisted invalidation (Redis 6+ RESP3 protocol). For sub-millisecond latency, keep the cluster within a single availability zone to avoid cross-AZ hops (0.5-1ms overhead). Deploy a local sidecar proxy (like Envoy or Twemproxy) on each application host to handle connection multiplexing and health checking. Monitor p50, p99, and p999 latency separately because p999 spikes reveal garbage collection pauses or network retransmits. Capacity plan at 70% memory utilization to leave room for replication buffers and fragmentation.",
      followUps: [
        "How would you handle cross-region replication for disaster recovery?",
        "What monitoring and alerting would you set up for this cluster?",
        "How would you perform a rolling upgrade without downtime?",
      ],
    },
  ],
  mcqs: [
    {
      q: "When a node is added to a consistent hash ring with N existing nodes, approximately what fraction of keys need to be remapped?",
      options: ["All keys", "1/N of keys", "N/2 keys", "No keys"],
      answerIndex: 1,
      explanation:
        "Consistent hashing ensures that only the keys in the range between the new node and its predecessor on the ring need to move, which is approximately 1/N of the total keys. This is the primary advantage over modular hashing where all keys would need remapping.",
    },
    {
      q: "In the cache-aside pattern, what happens on a cache miss?",
      options: [
        "The cache automatically fetches from the database",
        "The application queries the database and then populates the cache",
        "The request fails with an error",
        "The cache returns a default value",
      ],
      answerIndex: 1,
      explanation:
        "In cache-aside (lazy loading), the application is responsible for the cache interaction. On a miss, the application queries the database, receives the result, writes it back to the cache, and then returns the value to the caller. The cache itself has no knowledge of the database.",
    },
    {
      q: "Which eviction policy is most resilient to scan pollution (one-time batch reads evicting hot keys)?",
      options: ["LRU", "FIFO", "LFU", "Random"],
      answerIndex: 2,
      explanation:
        "LFU tracks access frequency, so a one-time scan of many keys only increments their frequency counter once. Hot keys with high frequency counters are retained because their accumulated count far exceeds the scan keys. LRU is vulnerable because scan keys are more recent than idle-but-popular keys.",
    },
    {
      q: "What is the primary risk of the write-behind caching pattern?",
      options: [
        "Higher read latency due to synchronous writes",
        "Data loss if the cache node crashes before async flush to the database",
        "Cache and database are always inconsistent",
        "It only works with relational databases",
      ],
      answerIndex: 1,
      explanation:
        "Write-behind buffers writes in the cache and flushes them to the database asynchronously. If the cache node crashes before the buffered writes are flushed, those writes are permanently lost because they never reached the durable database. This is the fundamental durability trade-off for lower write latency.",
    },
  ],
  flashcards: [
    {
      front: "What problem do virtual nodes solve in consistent hashing?",
      back: "Virtual nodes (100-200 per physical node) spread each physical node across many points on the hash ring, preventing data skew caused by uneven distribution of a small number of real nodes. Without them, some nodes may own 3-5x more keys than others.",
    },
    {
      front: "What is the difference between lazy expiration and active expiration in Redis?",
      back: "Lazy expiration checks TTL only when a key is accessed (O(1) per access). Active expiration runs 10 times per second, sampling 20 random keys with TTL and deleting expired ones. If more than 25% are expired, it samples again immediately. The combination ensures expired keys are cleaned up even if never accessed again.",
    },
    {
      front: "What is cache stampede and the singleflight mitigation?",
      back: "Cache stampede occurs when a popular key expires and many concurrent requests all miss the cache, overloading the database. Singleflight deduplicates in-flight requests: the first request fetches the value, and all concurrent requests for the same key wait for and share that single result.",
    },
    {
      front: "How does Redis Cluster handle node failure?",
      back: "Each primary streams writes to its replicas asynchronously. When a primary fails (heartbeat timeout, typically 3 seconds), its replica requests votes from other primaries. On majority vote, the replica promotes itself to primary and takes over the failed node's hash slots.",
    },
    {
      front: "What does mem_fragmentation_ratio mean in Redis?",
      back: "It is the ratio of memory allocated by the OS (RSS) to the memory Redis believes it is using. A ratio above 1.5 indicates significant fragmentation, meaning the allocator cannot reuse freed memory efficiently. Active defragmentation or a restart can resolve this.",
    },
    {
      front: "What is the write-through caching pattern?",
      back: "Write-through writes data to both the cache and the database synchronously in the same request path. It guarantees that the cache is always consistent with the database after any write, at the cost of higher write latency (both writes must complete before the response).",
    },
    {
      front: "Why is pipelining important for cache throughput?",
      back: "Pipelining batches multiple commands into a single network round trip, amortizing the RTT (typically 100-200 microseconds intra-datacenter) across 10-50 commands. Without pipelining, each command pays the full RTT, limiting throughput to ~5K-10K ops/sec per connection regardless of server capacity.",
    },
    {
      front: "What is the ziplist optimization in Redis?",
      back: "For small hashes (up to 128 fields by default), Redis uses a compact sequential memory layout called ziplist instead of a hash table. This uses ~10x less memory and is faster for small N due to CPU cache locality, despite O(N) access versus O(1) for a hash table.",
    },
  ],
  exercises: [
    "Implement a consistent hash ring with virtual nodes and write a test that adds 3 physical nodes, inserts 10,000 keys, then removes one node and verifies that only approximately 1/3 of keys changed their assigned node.",
    "Build a thread-safe LRU cache with TTL support. Benchmark it with 4 concurrent threads doing 80% reads and 20% writes on a 10,000-entry cache, and measure hit rate, p50, and p99 latency.",
    "Simulate a cache stampede scenario: create a hot key accessed 1,000 times/sec that expires every 60 seconds. Implement and compare three mitigation strategies (distributed lock, singleflight, probabilistic early refresh) and measure the maximum concurrent database queries during the expiry window.",
    "Design and implement a write-behind cache that buffers writes and flushes them to a simulated database in batches every 100ms. Test the data loss scenario by killing the cache process with pending unflushed writes and verify which writes survive.",
    "Build a hot key detector that tracks per-key access counts over a sliding 10-second window and automatically promotes keys exceeding 1,000 accesses/sec to a local in-process cache with a 2-second TTL.",
  ],
  revisionNotes: [
    "Consistent hashing with virtual nodes: each physical node maps to 100-200 points on the ring. Adding/removing a node remaps ~1/N keys. Redis Cluster uses 16,384 fixed hash slots instead of a continuous ring.",
    "LRU eviction: O(1) with hash map + doubly-linked list. Redis approximates by sampling 5 random keys and evicting the oldest. Vulnerable to scan pollution (batch reads evicting hot keys).",
    "LFU eviction: 8-bit logarithmic frequency counter with time-based decay. Resistant to scan pollution. Better for stable hot/cold workloads. Used in Redis with the allkeys-lfu or volatile-lfu policies.",
    "Cache-aside is the default pattern: app checks cache, on miss queries DB and populates cache. Simple but vulnerable to stampede. Works best for read-heavy workloads (90%+ reads).",
    "Write-through ensures consistency but adds latency to every write. Write-behind reduces write latency but risks data loss on crash. The choice depends on your durability requirements.",
    "Cache stampede mitigations: probabilistic early recomputation, distributed locking, stale-while-revalidate, and request coalescing (singleflight). Combine stale-while-revalidate with singleflight for best results.",
    "Hot key handling: local in-process cache (1-5s TTL) absorbs repeated reads. Key replication (key_0 to key_7) spreads load across shards but multiplies invalidation cost by 8x.",
    "Redis replication is asynchronous: 1-10ms lag means writes can be lost during failover. WAIT command provides synchronous replication at the cost of latency. Redis Cluster is AP in CAP terms.",
    "Memory management: provision 1.5x expected data size for fragmentation and buffers. Monitor mem_fragmentation_ratio (alert above 1.5). Use ziplist encoding for small hashes to save 10x memory.",
    "Performance targets: single Redis node handles 100K-200K ops/sec, sub-millisecond p99 intra-AZ. Pipelining (10-50 commands per batch) amortizes network RTT. Connection pooling (16-32 connections per node) avoids connection setup overhead.",
  ],
  cheatSheet: [
    "Consistent hashing: hash(key) -> ring position -> first node clockwise. Virtual nodes smooth distribution. Adding a node remaps ~1/N keys.",
    "Redis eviction policies: noeviction, allkeys-lru, volatile-lru, allkeys-lfu, volatile-lfu, allkeys-random, volatile-random, volatile-ttl.",
    "Cache-aside: GET cache -> miss -> query DB -> SET cache. Write-through: write DB + cache synchronously. Write-behind: write cache, async flush to DB.",
    "Stampede prevention: singleflight deduplicates concurrent fetches. Stale-while-revalidate serves expired value during refresh. Lock-based: one fetcher, others wait.",
    "Hot key formula: if key gets >50K ops/sec, single shard CPU saturates. Fix: local cache, singleflight, or replicate key to N shards with random suffix.",
    "Redis Cluster: 16,384 hash slots, assigned to primaries. Each primary has 1+ replicas. Failover via Raft-like vote among primaries. Minimum 3 primaries for majority.",
    "Memory math: key overhead ~70 bytes + value size + allocator rounding. 100M small keys (100 bytes each) need ~16 GB. Provision 1.5x for fragmentation.",
    "Latency budget: intra-AZ RTT ~0.1ms, cross-AZ ~0.5-1ms, cross-region ~30-100ms. Keep cache in same AZ as app for sub-ms p99.",
    "Pipeline: batch 10-50 commands to amortize RTT. Throughput jumps from 10K to 500K+ ops/sec per connection. Trade-off: higher per-request latency for batch.",
    "Monitor: hit rate (target >95%), eviction rate, memory fragmentation, replication lag, connected clients, slow log (commands >10ms).",
  ],
  glossary: [
    {
      term: "Consistent Hashing",
      definition:
        "A hashing technique that maps both keys and nodes to a circular hash space (ring), ensuring that adding or removing a node only remaps approximately 1/N of the keys, unlike modular hashing which remaps nearly all keys.",
    },
    {
      term: "Virtual Node",
      definition:
        "A technique where each physical cache node is represented by multiple points (typically 100-200) on the consistent hash ring, ensuring even distribution of keys across nodes and preventing hotspots caused by uneven node placement.",
    },
    {
      term: "Cache Stampede",
      definition:
        "A failure scenario where a popular cached key expires and many concurrent requests simultaneously miss the cache, overwhelming the backend database with duplicate queries. Also called thundering herd.",
    },
    {
      term: "Write-Behind (Write-Back)",
      definition:
        "A caching pattern where writes are applied to the cache immediately and asynchronously flushed to the persistent store in batches, reducing write latency but risking data loss if the cache node fails before the flush completes.",
    },
    {
      term: "Singleflight (Request Coalescing)",
      definition:
        "A concurrency pattern that deduplicates in-flight requests for the same key: the first request executes the fetch, and all subsequent concurrent requests for the same key wait for and share the result of that single fetch.",
    },
    {
      term: "LFU (Least Frequently Used)",
      definition:
        "An eviction policy that removes the key with the lowest access frequency. Redis implements it with an 8-bit logarithmic counter and time-based decay to balance retention of popular keys with adaptability to changing access patterns.",
    },
    {
      term: "Hash Slot",
      definition:
        "In Redis Cluster, one of 16,384 fixed partitions of the key space. Each key maps to a slot via CRC16(key) mod 16384, and slots are assigned to primary nodes. Rebalancing moves slot ranges between nodes rather than rehashing individual keys.",
    },
  ],
  followUps: [
    "How would you design cache invalidation for a distributed cache that spans multiple data centers with 100ms cross-region latency?",
    "What monitoring and alerting strategy would you implement to detect cache performance degradation before it impacts users?",
    "How does Redis Cluster handle split-brain scenarios during network partitions, and what are the data consistency implications?",
    "Compare the memory efficiency and performance characteristics of Redis versus Memcached for a cache-only use case at 500GB scale.",
    "How would you implement a tiered caching architecture with L1 (in-process), L2 (distributed), and L3 (CDN) layers?",
    "What strategies would you use to warm a cold cache after a full cluster restart without overwhelming the database?",
  ],
  resources: [
    {
      label: "Redis Cluster Specification",
      kind: "docs",
      note: "Official documentation covering hash slots, replication, failover, and resharding in Redis Cluster.",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters 5-6 cover replication, partitioning, and consistent hashing with rigorous treatment of trade-offs.",
    },
    {
      label: "Consistent Hashing and Random Trees (Karger et al., 1997)",
      kind: "article",
      note: "The original paper introducing consistent hashing, foundational for understanding distributed cache data placement.",
    },
    {
      label: "Caching at Scale with Redis (AWS re:Invent)",
      kind: "video",
      note: "Practical talk covering eviction policies, cluster sizing, hot key mitigation, and production monitoring patterns.",
    },
    {
      label: "Caffeine - High Performance Java Caching Library",
      kind: "repo",
      note: "Reference implementation of W-TinyLFU, a near-optimal eviction policy combining frequency sketch with an admission window.",
    },
  ],
};
