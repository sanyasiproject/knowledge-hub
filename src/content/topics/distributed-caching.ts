import type { TopicContent } from "../types";

export const distributedCaching: TopicContent = {
  quickSummary: [
    "Distributed caching stores frequently accessed data across multiple nodes in memory, reducing database load and improving response times — systems like Redis and Memcached serve reads in sub-millisecond latency.",
    "Consistent hashing maps keys to a ring of nodes, ensuring that adding or removing a node only remaps ~1/N of the keys — unlike modulo hashing where every key potentially moves when the node count changes.",
    "Cache coherence ensures that all nodes in a distributed cache have a consistent view of data — strategies include invalidation (delete stale entries), write-through (update cache and DB together), and TTL-based expiration.",
    "Cache stampede (thundering herd) occurs when a popular cached entry expires and many concurrent requests hit the database simultaneously — mitigated by locking, probabilistic early expiration, or stale-while-revalidate.",
  ],
  detailed: [
    `## Distributed Cache Architecture

A distributed cache spreads data across multiple nodes, each responsible for a subset of keys. Clients use a **hashing function** to determine which node holds a given key. The cache sits between the application and the database, serving as a read-through or look-aside cache.

**Look-aside (cache-aside)**: the application checks the cache first; on miss, it queries the database, writes the result to the cache, and returns it. The application manages cache population. **Read-through**: the cache itself is responsible for loading data from the database on miss — simpler application code but requires cache-level integration with the data source. **Write-through**: writes go to both the cache and database simultaneously. **Write-behind (write-back)**: writes go to the cache immediately and are asynchronously flushed to the database — lower write latency but risks data loss.`,

    `## Consistent Hashing

Traditional modulo hashing (\`node = hash(key) % N\`) is problematic: changing N (adding/removing a node) remaps almost every key. **Consistent hashing** arranges nodes on a virtual ring (hash space 0 to 2^32). Each key is hashed to a point on the ring and assigned to the next node clockwise.

When a node is added, it takes over a portion of one neighbor's range — only ~1/N of keys move. When removed, its keys move to the next node. **Virtual nodes** (vnodes) improve balance: each physical node is represented by multiple points on the ring (e.g., 150 vnodes), preventing hot spots from uneven distribution. Memcached clients use consistent hashing; Redis Cluster uses hash slots (16384 slots divided among nodes) which is a similar concept.`,

    `## Cache Invalidation Strategies

Cache invalidation is one of the two hard problems in computer science. Strategies:

**TTL (Time-To-Live)**: entries expire after a fixed duration. Simple but stale data is served until expiration. Short TTLs reduce staleness but increase cache misses and DB load.

**Event-based invalidation**: when the source data changes, an event (via pub/sub, CDC, or application logic) invalidates or updates the cached entry. Provides near-real-time consistency but requires reliable event delivery.

**Write-through invalidation**: every write to the database also updates or deletes the cache entry in the same operation. Ensures consistency but adds latency to writes and couples the write path to the cache.

**Versioned keys**: append a version number to the cache key (e.g., "user:123:v5"). On update, increment the version — old cache entries become orphans and are naturally evicted. Simple but wastes cache space.`,

    `## Cache Stampede and Mitigation

A **cache stampede** (thundering herd) occurs when a frequently accessed cache entry expires and N concurrent requests simultaneously miss the cache and hit the database. This can overwhelm the database.

Mitigations: (1) **Locking**: the first request that misses acquires a lock, loads from DB, and populates the cache; other requests wait or serve stale data. Redis's SET with NX and EX flags can implement distributed locking. (2) **Probabilistic early expiration**: each request has a small probability of refreshing the cache before the actual TTL expires, spreading refresh load. (3) **Stale-while-revalidate**: serve stale data immediately while asynchronously refreshing the cache in the background. (4) **External refresh**: a background worker refreshes popular cache entries before they expire, removing the stampede trigger entirely.`,

    `## Redis vs Memcached and Cache Topologies

**Memcached**: simple key-value cache, multi-threaded (scales vertically), no persistence, no replication, no data structures beyond strings. Clients handle sharding via consistent hashing. Best for simple caching of large datasets with straightforward access patterns.

**Redis**: rich data structures (strings, hashes, lists, sets, sorted sets, streams), single-threaded event loop (scales via clustering), optional persistence (RDB snapshots, AOF), built-in replication, Lua scripting, pub/sub. **Redis Cluster** provides automatic sharding across 16384 hash slots with master-replica failover.

**Cache topologies**: (1) **Client-side sharding**: each client independently hashes and routes — no coordination but inconsistent if clients disagree on topology. (2) **Proxy-based**: a proxy (Twemproxy, Envoy) routes requests — consistent routing but adds a network hop. (3) **Cluster mode**: the cache system itself manages sharding and replication (Redis Cluster) — built-in failover but more complex operations.`,
  ],
  interviewQA: [
    {
      q: "Explain consistent hashing and why it is preferred over modulo hashing for distributed caches.",
      a: "Modulo hashing (node = hash(key) % N) remaps nearly every key when N changes — adding one server moves ~(N-1)/N of all keys. Consistent hashing places nodes on a virtual ring; each key maps to the next clockwise node. Adding or removing a node only affects ~1/N of keys (the range the new node takes over or the dead node's range). Virtual nodes (multiple ring positions per physical node) improve balance. This minimizes cache misses during scaling events — with modulo hashing, adding a server causes a near-complete cache miss storm.",
    },
    {
      q: "How would you handle cache invalidation in a microservices architecture?",
      a: "Event-based invalidation is most appropriate. When a service updates data, it publishes a domain event (e.g., via Kafka or RabbitMQ). Consuming services that cache that data subscribe to these events and invalidate or update their cache entries. This provides near-real-time consistency without coupling services. Combine with TTL as a safety net — even if an event is lost, the cache entry eventually expires. For critical data, use write-through invalidation within the owning service. Avoid direct cache manipulation across service boundaries.",
    },
    {
      q: "What is a cache stampede and how would you prevent it in a high-traffic system?",
      a: "A cache stampede occurs when a popular key expires and hundreds of concurrent requests simultaneously miss the cache and hit the database. Prevention: (1) Use a distributed lock (Redis SETNX) so only one request loads from DB while others wait or get stale data. (2) Implement probabilistic early expiration — requests randomly refresh the cache before TTL with probability that increases as expiry approaches. (3) Use stale-while-revalidate — serve expired data immediately while refreshing asynchronously. (4) For known hot keys, use a background worker that refreshes before expiry. In practice, combine locking with stale-while-revalidate for the best balance.",
    },
    {
      q: "When would you choose Memcached over Redis?",
      a: "Choose Memcached when: you need simple key-value caching of strings or serialized objects; you want multi-threaded performance scaling on a single node; you do not need data structures, persistence, or replication; and the dataset is large enough that Memcached's more efficient memory usage per key matters. Redis is better when you need rich data structures (sorted sets for leaderboards, lists for queues), persistence, replication, pub/sub, or Lua scripting. For most modern applications, Redis is the default choice due to its versatility.",
    },
  ],
  followUps: [
    "What happens to your database the moment the cache cluster restarts?",
    "Why does consistent hashing matter here, and what do virtual nodes fix?",
    "Should the cache fail open or fail closed, and how do you decide?",
    "When is an in-process cache still the right answer despite the inconsistency?",
  ],
  mcqs: [
    {
      q: "In consistent hashing, approximately what fraction of keys are remapped when one node is added to an N-node cluster?",
      options: ["All keys", "1/N of keys", "N-1/N of keys", "1/2 of keys"],
      answerIndex: 1,
      explanation:
        "Consistent hashing remaps approximately 1/N of the keys when a node is added — only the keys in the range the new node takes over from its clockwise neighbor. This is a dramatic improvement over modulo hashing.",
    },
    {
      q: "What is a cache stampede?",
      options: [
        "When the cache runs out of memory and evicts all entries",
        "When many concurrent requests miss an expired cache entry and overwhelm the database",
        "When cache nodes fail and data is lost",
        "When cache entries are written faster than they can be replicated",
      ],
      answerIndex: 1,
      explanation:
        "A cache stampede occurs when a popular cache entry expires and many concurrent requests simultaneously miss the cache and hit the database, potentially overwhelming it.",
    },
    {
      q: "Which caching strategy writes to the database asynchronously after writing to the cache?",
      options: [
        "Write-through",
        "Write-behind (write-back)",
        "Cache-aside (look-aside)",
        "Read-through",
      ],
      answerIndex: 1,
      explanation:
        "Write-behind (write-back) caching writes to the cache immediately and asynchronously flushes changes to the database. This reduces write latency but risks data loss if the cache node fails before flushing.",
    },
    {
      q: "What is the purpose of virtual nodes (vnodes) in consistent hashing?",
      options: [
        "To reduce memory usage per node",
        "To improve key distribution balance across physical nodes",
        "To provide replication across nodes",
        "To encrypt cache data in transit",
      ],
      answerIndex: 1,
      explanation:
        "Virtual nodes map each physical node to multiple positions on the hash ring, ensuring more even key distribution. Without vnodes, nodes can be responsible for vastly different numbers of keys depending on their position.",
    },
  ],
  flashcards: [
    {
      front: "What is consistent hashing?",
      back: "A hashing technique that maps both keys and nodes to a virtual ring. Each key is served by the next clockwise node. Adding/removing a node remaps only ~1/N of keys, unlike modulo hashing which remaps nearly all.",
    },
    {
      front: "What is cache-aside (look-aside) pattern?",
      back: "The application checks the cache first. On miss, it queries the database, writes the result to the cache, and returns it. The application manages all cache population and invalidation logic.",
    },
    {
      front: "What is write-behind (write-back) caching?",
      back: "Writes go to the cache immediately; changes are asynchronously flushed to the database. Provides low write latency but risks data loss if the cache fails before flushing.",
    },
    {
      front: "How does probabilistic early expiration prevent cache stampedes?",
      back: "Each request has a small probability of refreshing the cache before the actual TTL expires. The probability increases as the entry ages. This spreads refresh load over time, preventing a burst when the TTL expires.",
    },
    {
      front: "What are Redis hash slots?",
      back: "Redis Cluster divides the key space into 16384 hash slots. Each key is mapped to a slot via CRC16(key) % 16384. Slots are distributed among master nodes, enabling automatic sharding and rebalancing.",
    },
    {
      front: "What is the difference between Redis and Memcached?",
      back: "Redis: rich data structures, single-threaded, persistence, replication, pub/sub, Lua scripting. Memcached: strings only, multi-threaded, no persistence, no replication. Redis is more versatile; Memcached is simpler and uses memory more efficiently for pure string caching.",
    },
    {
      front: "What is cache coherence in distributed caching?",
      back: "Ensuring all cache nodes have a consistent view of data. Achieved via invalidation (delete stale entries), write-through (update cache on writes), event-based updates (pub/sub on changes), or TTL-based expiration.",
    },
  ],
  deepDive: [
    `## The Mechanics of Consistent Hashing and Virtual Nodes

Consistent hashing is the **backbone** of distributed cache key routing. The algorithm projects both *cache nodes* and *data keys* onto a circular hash space (typically \`0\` to \`2^32 - 1\`). When a key is looked up, the hash function produces a position on the ring, and the key is assigned to the **first node encountered clockwise** from that position. This guarantees that adding or removing a node only disturbs approximately \`1/N\` of the key mappings — a property called *minimal disruption*. In practice, raw consistent hashing can produce **severe imbalance**: if three nodes happen to cluster together on the ring, one node may own 60% of the key space. **Virtual nodes** (vnodes) solve this by mapping each physical node to \`V\` distinct points on the ring (commonly \`V = 150\`). The standard deviation of load drops from \`O(1/sqrt(N))\` to \`O(1/sqrt(N*V))\`, making the distribution nearly uniform. Implementations like \`libketama\` (used by Memcached clients) and \`Redis Cluster\`'s 16384 hash-slot scheme both leverage this principle, though Redis takes it further by assigning *contiguous slot ranges* rather than random ring positions.`,

    `## Cache Eviction Policies and Memory Management

When a cache node reaches its **memory limit**, it must decide which entries to evict. The most common policy is **LRU (Least Recently Used)**: evict the entry that has not been accessed for the longest time. Redis implements an *approximated LRU* — rather than maintaining a true doubly-linked list of all keys, it samples \`maxmemory-samples\` random keys (default 5) and evicts the one with the oldest access timestamp. This trades perfect eviction order for \`O(1)\` per-operation cost. **LFU (Least Frequently Used)** is an alternative that evicts entries with the lowest access *count*, decayed logarithmically over time — better for workloads with a stable hot set but poor for bursty patterns. A textbook LRU cache uses a **hash map** for \`O(1)\` lookup combined with a **doubly-linked list** that moves accessed entries to the head; eviction always removes from the tail. In C++, this is commonly implemented with \`std::unordered_map\` and \`std::list\`, where the map stores iterators into the list for constant-time list manipulation. Understanding these internals is essential for diagnosing production issues like *cache churn* (eviction rate exceeding the fill rate) and *memory fragmentation* (Redis's \`jemalloc\` allocator mitigates this via size-class binning).`,

    `## Production Concerns: Replication, Failover, and Observability

Running a distributed cache in production demands more than correct hashing and eviction. **Replication** provides fault tolerance: Redis Cluster assigns each master node one or more *replicas* that asynchronously replicate the master's write stream. If a master fails, the cluster promotes a replica via a *Raft-like* consensus among the remaining masters — the failover typically completes in **1-2 seconds**, during which writes to that shard are rejected. *Split-brain* is mitigated by the \`cluster-node-timeout\` setting and the requirement for a majority of masters to agree on the failure. **Observability** is equally critical: track \`hit_rate\` (target > 95%), \`eviction_count\`, \`connected_clients\`, and \`keyspace_misses\`. A sudden drop in hit rate may indicate a *cache stampede*, a deployment that changed key formats, or a hot-key problem (one key receiving disproportionate traffic). For hot keys, solutions include **local in-process caching** (L1 cache in front of the distributed L2 cache) and **key replication** (storing hot keys on multiple shards with random suffixes like \`key:1\`, \`key:2\`). Tools like \`redis-cli --hotkeys\` (requires LFU policy) and *Prometheus exporters* provide the telemetry needed to operate caches reliably at scale.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "LRU Cache implementation in C++ using a hash map and doubly-linked list for O(1) get/put operations",
      source: `#include <unordered_map>
#include <list>
#include <stdexcept>

// **LRUCache** — O(1) get and put using a hash map + doubly-linked list.
// The *list* maintains access order (most recent at front).
// The *map* stores iterators into the list for constant-time lookup.
template <typename K, typename V>
class LRUCache {
public:
    explicit LRUCache(int capacity) : cap_(capacity) {}

    // **get**: returns the value and *promotes* the key to most-recently-used.
    V get(const K& key) {
        auto it = map_.find(key);
        if (it == map_.end()) {
            throw std::runtime_error("Key not found");
        }
        // Move accessed entry to the *front* of the list (MRU position)
        items_.splice(items_.begin(), items_, it->second);
        return it->second->second;
    }

    // **put**: inserts or updates a key-value pair.
    // If at capacity, *evicts* the **least recently used** entry (list tail).
    void put(const K& key, const V& value) {
        auto it = map_.find(key);
        if (it != map_.end()) {
            // Key exists — update value and promote to front
            it->second->second = value;
            items_.splice(items_.begin(), items_, it->second);
            return;
        }
        // Evict the *LRU entry* (back of list) if at capacity
        if (static_cast<int>(map_.size()) >= cap_) {
            auto& lru = items_.back();
            map_.erase(lru.first);
            items_.pop_back();
        }
        // Insert new entry at the front
        items_.emplace_front(key, value);
        map_[key] = items_.begin();
    }

    int size() const { return static_cast<int>(map_.size()); }

private:
    int cap_;
    // *Doubly-linked list*: front = MRU, back = LRU
    std::list<std::pair<K, V>> items_;
    // Hash map: key -> iterator into \`items_\`
    std::unordered_map<K, typename std::list<std::pair<K, V>>::iterator> map_;
};`,
    },
    {
      language: "cpp",
      caption: "Consistent Hashing ring in C++ with virtual nodes for balanced key distribution",
      source: `#include <map>
#include <string>
#include <functional>
#include <vector>
#include <sstream>
#include <stdexcept>

// **ConsistentHashRing** — maps keys to nodes using a virtual-node ring.
// Each physical node gets \`num_vnodes\` positions on the ring for *balanced distribution*.
class ConsistentHashRing {
public:
    explicit ConsistentHashRing(int num_vnodes = 150)
        : num_vnodes_(num_vnodes) {}

    // **addNode**: places \`num_vnodes_\` virtual nodes on the ring.
    void addNode(const std::string& node) {
        for (int i = 0; i < num_vnodes_; ++i) {
            // Generate a unique *virtual node key* per replica
            std::string vnode_key = node + "#vn" + std::to_string(i);
            size_t hash_val = std::hash<std::string>{}(vnode_key);
            ring_[hash_val] = node;
        }
    }

    // **removeNode**: removes all virtual nodes for a physical node.
    // Only ~\`1/N\` of keys are remapped to neighboring nodes.
    void removeNode(const std::string& node) {
        for (int i = 0; i < num_vnodes_; ++i) {
            std::string vnode_key = node + "#vn" + std::to_string(i);
            size_t hash_val = std::hash<std::string>{}(vnode_key);
            ring_.erase(hash_val);
        }
    }

    // **getNode**: returns the *clockwise-nearest* node for a given key.
    std::string getNode(const std::string& key) const {
        if (ring_.empty()) {
            throw std::runtime_error("Hash ring is empty");
        }
        size_t hash_val = std::hash<std::string>{}(key);
        // Find the first node with hash >= key's hash (*clockwise walk*)
        auto it = ring_.lower_bound(hash_val);
        if (it == ring_.end()) {
            it = ring_.begin();  // **Wrap around** the ring
        }
        return it->second;
    }

private:
    int num_vnodes_;
    // Sorted map: hash_value -> physical_node_name (the *ring*)
    std::map<size_t, std::string> ring_;
};`,
    },
    {
      language: "typescript",
      caption: "Node.js Redis caching layer with cache-aside pattern, TTL, and stampede protection via locking",
      source: `import Redis from "ioredis";

// Create a **Redis client** with connection pooling
const redis = new Redis({
  host: "redis-cluster.internal",
  port: 6379,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

// **Cache-aside** helper with *stampede protection* via distributed locking.
// On cache miss, only *one caller* loads from DB; others wait for the result.
async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  // Step 1: Check the cache
  const cached = await redis.get(key);
  if (cached !== null) {
    return JSON.parse(cached) as T;
  }

  // Step 2: Acquire a **distributed lock** to prevent *cache stampede*
  const lockKey = \`lock:\${key}\`;
  const lockAcquired = await redis.set(lockKey, "1", "EX", 10, "NX");

  if (!lockAcquired) {
    // Another process is loading — *wait and retry* from cache
    await new Promise((resolve) => setTimeout(resolve, 200));
    const retryResult = await redis.get(key);
    if (retryResult !== null) {
      return JSON.parse(retryResult) as T;
    }
    // Fallback: load from DB if lock holder failed
  }

  try {
    // Step 3: Load from the **database** (the *expensive* operation)
    const value = await loader();

    // Step 4: Populate the cache with a **TTL**
    await redis.setex(key, ttlSeconds, JSON.stringify(value));

    return value;
  } finally {
    // Step 5: Release the lock
    await redis.del(lockKey);
  }
}

// --- Usage Example ---

interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(userId: string): Promise<User> {
  return cacheAside<User>(
    \`user:\${userId}\`,       // Cache key
    300,                       // **TTL**: 5 minutes
    async () => {
      // Simulated DB query — replace with actual data source
      console.log(\`Cache MISS for user:\${userId}, loading from DB\`);
      return { id: userId, name: "Alice", email: "alice@example.com" };
    }
  );
}

// **Invalidation** helper — call when source data changes
async function invalidateUser(userId: string): Promise<void> {
  await redis.del(\`user:\${userId}\`);
  console.log(\`Invalidated cache for user:\${userId}\`);
}`,
    },
  ],

  diagrams: [
    {
      title: "Distributed Cache Cluster Architecture",
      kind: "architecture",
      mermaid: `graph TD
    Client["Client App"]
    LB["Load Balancer"]
    App1["App Server 1"]
    App2["App Server 2"]
    CacheProxy["Cache Router\nConsistent Hashing"]
    C1["Redis Node 1\nSlots 0-5460"]
    C2["Redis Node 2\nSlots 5461-10922"]
    C3["Redis Node 3\nSlots 10923-16383"]
    R1["Replica 1"]
    R2["Replica 2"]
    R3["Replica 3"]
    DB[("Primary DB\nPostgreSQL")]
    Client --> LB
    LB --> App1
    LB --> App2
    App1 --> CacheProxy
    App2 --> CacheProxy
    CacheProxy --> C1
    CacheProxy --> C2
    CacheProxy --> C3
    C1 --> R1
    C2 --> R2
    C3 --> R3
    App1 -.->|Cache Miss| DB
    App2 -.->|Cache Miss| DB`,
      caption: "Application servers route requests through a consistent-hash proxy to Redis cluster nodes, with replicas for HA and database fallback on cache miss.",
    },
    {
      title: "Cache-Aside Read Flow",
      kind: "flow",
      mermaid: `flowchart TD
    A["Application receives request"] --> B{"Key in cache?"}
    B -->|Cache HIT| C["Return cached value"]
    B -->|Cache MISS| D["Query database"]
    D --> E["Write result to cache with TTL"]
    E --> F["Return value to caller"]
    C --> G["Response sent"]
    F --> G`,
      caption: "Step-by-step cache-aside pattern: check cache first, fall back to DB on miss, populate cache, return result.",
    },
    {
      title: "Cache Stampede Prevention",
      kind: "sequence",
      mermaid: `sequenceDiagram
    participant R1 as Request 1
    participant R2 as Request 2
    participant Cache as Redis Cache
    participant Lock as Distributed Lock
    participant DB as Database
    Note over Cache: Popular key expires
    R1->>Cache: GET user:42
    R2->>Cache: GET user:42
    Cache-->>R1: MISS
    Cache-->>R2: MISS
    R1->>Lock: SET lock:user:42 NX EX 10
    Lock-->>R1: OK - lock acquired
    R2->>Lock: SET lock:user:42 NX EX 10
    Lock-->>R2: FAIL - already locked
    Note over R2: Wait and retry
    R1->>DB: SELECT user WHERE id=42
    DB-->>R1: User data
    R1->>Cache: SETEX user:42 300 data
    R1->>Lock: DEL lock:user:42
    R2->>Cache: GET user:42
    Cache-->>R2: HIT - populated by R1`,
      caption: "Distributed locking prevents stampede: only one request loads from DB while others wait and then read from the populated cache.",
    },
    {
      title: "Cache Eviction Policy Comparison",
      kind: "mindmap",
      mermaid: `mindmap
  root((Cache Eviction))
    LRU
      Evict least recently used
      Good for recency bias
      LinkedHashMap implementation
    LFU
      Evict least frequently used
      Better for Zipfian workloads
      Higher overhead
    TTL Based
      Keys expire automatically
      Time-to-live per key
      SETEX in Redis
    Write Policies
      Write-Through
        Sync write to DB
        Strong consistency
      Write-Behind
        Async flush to DB
        Lower write latency
      Write-Around
        Skip cache on write
        Avoids cache pollution`,
      caption: "Taxonomy of cache eviction and write policies, their trade-offs, and typical implementation approaches.",
    },
  ],

  animations: [
    {
      title: "A cache-aside read, and what happens on a miss storm",
      steps: [
        {
          label: "Request arrives",
          detail: "Service checks Redis for key `user:42`.",
        },
        {
          label: "Hit",
          detail: "Value returned in ~0.5 ms. The database never sees the request.",
        },
        {
          label: "Miss",
          detail: "Service queries the database (~5–50 ms), writes the result into Redis with a TTL, returns it.",
        },
        {
          label: "The key expires",
          detail: "Every concurrent request for that key now misses at the same instant.",
        },
        {
          label: "Stampede",
          detail: "Ten thousand identical queries hit a database sized for hundreds. Latency spikes, retries pile up, it falls over.",
        },
        {
          label: "Mitigated",
          detail: "Single-flight lock: one request repopulates while the rest serve the stale value or wait briefly. Jittered TTLs stop keys expiring together.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "**Redis**",
      "**Memcached**",
      "**Hazelcast**",
    ],
    rows: [
      [
        "**Data Structures**",
        "Strings, hashes, lists, sets, sorted sets, streams, bitmaps, HyperLogLog",
        "Strings only (serialized blobs)",
        "Maps, queues, sets, lists, topics, ringbuffers",
      ],
      [
        "**Threading Model**",
        "*Single-threaded* event loop (I/O threads in 6.0+)",
        "*Multi-threaded* — scales vertically on multi-core",
        "*Multi-threaded* with partitioned data",
      ],
      [
        "**Persistence**",
        "RDB snapshots + AOF append-only file",
        "None — pure in-memory cache",
        "Hot restart, persistence to disk or external DB",
      ],
      [
        "**Replication**",
        "Built-in async master-replica replication",
        "None — clients handle sharding",
        "Synchronous and async replication with configurable backups",
      ],
      [
        "**Clustering**",
        "Redis Cluster: 16384 hash slots, automatic failover",
        "Client-side consistent hashing only",
        "Built-in cluster with *automatic partition rebalancing*",
      ],
      [
        "**Eviction Policies**",
        "LRU, LFU, random, volatile-lru, volatile-ttl, noeviction",
        "LRU only",
        "LRU, LFU, random, none",
      ],
      [
        "**Scripting**",
        "Lua scripting, Redis Functions (7.0+)",
        "None",
        "Java-based *EntryProcessor* for server-side compute",
      ],
      [
        "**Pub/Sub**",
        "Built-in pub/sub and Streams",
        "None",
        "Built-in topics and reliable messaging",
      ],
      [
        "**Language**",
        "Written in *C* — lightweight, ~5MB binary",
        "Written in *C* — very lightweight",
        "Written in *Java* — runs on JVM, higher memory overhead",
      ],
      [
        "**Best For**",
        "General-purpose caching, session store, real-time analytics, leaderboards",
        "Simple high-throughput string caching with large datasets",
        "Distributed compute, embedded caching in Java apps, near-cache topologies",
      ],
    ],
  },

  exercises: [
    "**Design an LRU Cache**: Implement an LRU cache class supporting `get(key)` and `put(key, value)` operations, both in **O(1)** time. Use a *hash map* and *doubly-linked list*. Handle edge cases: updating an existing key, evicting when at capacity. Test with a capacity of 3 and a sequence of 10 operations.",
    "**Implement Consistent Hashing**: Build a consistent hash ring with support for *virtual nodes*. Write methods for `addNode(name)`, `removeNode(name)`, and `getNode(key)`. Verify that adding a 4th node to a 3-node ring remaps approximately **25%** of 10,000 test keys (not all of them). Experiment with different vnode counts (1, 10, 100, 500) and measure the **standard deviation** of key distribution.",
    "**Cache Stampede Simulation**: Write a Node.js script that simulates a cache stampede. Create a Redis-backed cache with a 5-second TTL. Launch **50 concurrent requests** for the same key after it expires. First, observe the stampede (all 50 hit the DB). Then implement a **distributed lock** with `SET key NX EX` to ensure only one request loads from the DB. Measure the DB hit count before and after the fix.",
    "**Write-Behind Cache with Failure Handling**: Implement a *write-behind* cache in Node.js where writes go to Redis immediately and are flushed to a database asynchronously in batches every 2 seconds. Handle the case where the **flush fails** (e.g., DB is down): implement a *retry queue* with exponential backoff. Ensure no data is lost if the cache node restarts (hint: use Redis `LIST` as the write buffer).",
    "**Cache Hit Rate Analysis**: Given a stream of 100,000 key accesses following a **Zipfian distribution** (s=1.0), simulate an LRU cache and an LFU cache each with capacity for 1,000 keys. Plot the *hit rate* for each policy as the cache size varies from 100 to 10,000. Explain why LFU outperforms LRU for Zipfian workloads and when LRU would be preferable.",
  ],

  cheatSheet: [
    "**Cache-aside pattern**: `if cache.get(key) miss → db.query() → cache.set(key, val, TTL)` — application manages population; simplest and most common pattern.",
    "**Consistent hashing**: keys and nodes on a ring; only **~1/N keys remap** on topology change. Use **150+ virtual nodes** per physical node for balanced distribution.",
    "**Stampede prevention**: use `SET lock_key value NX EX 10` for **distributed locking** — first request loads, others wait. Combine with *stale-while-revalidate* for zero-downtime reads.",
    "**Redis Cluster slots**: `CRC16(key) % 16384` determines the slot. Use `{hash_tag}` in keys (e.g., `user:{42}:profile`) to force related keys to the **same slot** for multi-key operations.",
    "**Eviction rule of thumb**: use *allkeys-lru* for general caching (Redis default is `noeviction`). Set `maxmemory-policy` and `maxmemory` explicitly. Monitor `evicted_keys` — high eviction means your cache is undersized.",
    "**Key TTL strategy**: short TTL (30-60s) for volatile data, long TTL (5-30min) for stable data. **Always set a TTL** — keys without TTL accumulate and cause OOM. Use `SCAN` + `TTL` to audit keyspace for missing TTLs.",
  ],

  revisionNotes: [
    "**Consistent hashing** maps keys to a ring and assigns each key to the *next clockwise node*. Virtual nodes (vnodes) improve balance. Adding a node remaps only **~1/N** keys. Redis Cluster uses a fixed 16384-slot variant.",
    "**Cache invalidation strategies**: *TTL-based* (simple, eventual consistency), *event-based* (near-real-time via pub/sub or CDC), *write-through* (consistent but higher write latency), and *versioned keys* (append version to key name, old entries become orphans).",
    "**LRU cache internals**: hash map for O(1) lookup + doubly-linked list for O(1) access-order tracking. `get` promotes to head; `put` evicts from tail. Redis uses *approximated LRU* by sampling `maxmemory-samples` random keys.",
    "**Cache stampede** happens when a hot key expires and N requests simultaneously hit the DB. Mitigate with *distributed locking* (`SETNX`), *probabilistic early expiration*, or *stale-while-revalidate*. Background refresh workers eliminate the trigger entirely.",
    "**Redis vs Memcached**: Redis offers rich data structures, persistence (RDB/AOF), replication, clustering, and scripting. Memcached is simpler, multi-threaded, and more memory-efficient for pure string caching. **Hazelcast** adds embedded Java caching, distributed compute, and synchronous replication for CP-heavy workloads.",
  ],

  resources: [
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
    },
    {
      label: "Redis documentation — clustering and eviction", url: "https://redis.io/docs/latest/",
      kind: "docs",
    },
    {
      label: "Caching at Scale With Redis — Redis Labs",
      kind: "article",
    },
  ],
  glossary: [
    {
      term: "Consistent Hashing",
      definition:
        "A hashing scheme that maps keys and nodes to a ring, minimizing key remapping when nodes are added or removed. Only ~1/N of keys move on topology changes.",
    },
    {
      term: "Cache Stampede",
      definition:
        "A failure mode where a popular cache entry expires and many concurrent requests simultaneously hit the database, potentially overwhelming it.",
    },
    {
      term: "Cache-Aside (Look-Aside)",
      definition:
        "A caching pattern where the application manages cache reads and population, querying the database on cache miss and storing the result.",
    },
    {
      term: "Write-Through Cache",
      definition:
        "A pattern where writes go to both the cache and the database simultaneously, ensuring cache consistency at the cost of write latency.",
    },
    {
      term: "Write-Behind (Write-Back) Cache",
      definition:
        "A pattern where writes go to the cache immediately and are asynchronously flushed to the database, risking data loss but reducing write latency.",
    },
    {
      term: "Virtual Node (vnode)",
      definition:
        "A technique in consistent hashing where each physical node is represented by multiple points on the hash ring, improving key distribution balance.",
    },
    {
      term: "TTL (Time-To-Live)",
      definition:
        "A duration after which a cache entry automatically expires and is evicted, forcing a fresh load from the source on the next access.",
    },
  ],
};
