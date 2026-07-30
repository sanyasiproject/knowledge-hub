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
