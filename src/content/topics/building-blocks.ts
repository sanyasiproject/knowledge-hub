import type { TopicContent } from "../types";

export const buildingBlocks: TopicContent = {
  quickSummary: [
    "Load balancers distribute traffic across multiple servers to ensure no single server is overwhelmed. They operate at Layer 4 (TCP/UDP, fast but limited) or Layer 7 (HTTP, enables content-based routing). Common algorithms: round-robin, least connections, consistent hashing.",
    "Caches store frequently accessed data in fast storage (memory) to reduce latency and database load. Redis and Memcached are the most common distributed caches. Key concerns: cache invalidation, eviction policies (LRU, LFU), and cache stampede prevention.",
    "CDNs (Content Delivery Networks) serve static and cached content from edge servers geographically close to users, reducing latency and offloading origin servers. Push CDNs receive content proactively; pull CDNs fetch on first request and cache.",
    "Message queues decouple producers from consumers, enabling asynchronous processing, load leveling, and fault tolerance. Key choices: RabbitMQ (traditional broker), Kafka (distributed log), SQS (managed queue).",
  ],
  detailed: [
    "## Load Balancers\n\nLoad balancers sit between clients and servers, distributing requests to maintain performance and availability. **Layer 4 (L4)** balancers route based on IP and port, operating at the transport layer. They are fast (no payload inspection) but cannot make decisions based on request content. **Layer 7 (L7)** balancers inspect HTTP headers, URLs, and cookies, enabling content-based routing (e.g., /api/* to API servers, /static/* to CDN), sticky sessions, and SSL termination. **Algorithms**: Round-robin (simple, even distribution), Weighted round-robin (more traffic to stronger servers), Least connections (route to the server with fewest active connections), IP hash (same client always hits the same server, useful for session affinity), Consistent hashing (minimizes redistribution when servers are added/removed). Health checks detect unhealthy servers and remove them from the pool. Common tools: Nginx, HAProxy, AWS ALB/NLB.",
    "## Caches as System Components\n\nCaching appears at every layer of a system: **Browser cache** (HTTP Cache-Control headers), **CDN cache** (edge caching), **Application cache** (in-process, e.g., Caffeine), **Distributed cache** (Redis, Memcached), **Database cache** (query cache, buffer pool). In system design, 'the cache' usually means a distributed cache like Redis sitting between application servers and the database. Key design decisions: **Eviction policy** (LRU evicts least recently used, LFU evicts least frequently used, TTL expires after a fixed time). **Cache invalidation** (the hardest problem): write-through (update cache on write), write-behind (async update), cache-aside (invalidate on write, populate on read). **Cache stampede**: when a popular key expires and hundreds of requests simultaneously hit the database. Mitigate with: locking (only one request fetches), probabilistic early expiration, or background refresh.",
    "## Content Delivery Networks\n\nA CDN is a globally distributed network of edge servers that cache content close to users. **Pull CDN**: content is fetched from the origin on the first request to an edge and cached with a TTL. Subsequent requests are served from the edge. Good for frequently accessed content; cold starts have origin latency. **Push CDN**: content is proactively pushed to edges before any request. Good for large, infrequently changing files. CDNs handle: static assets (JS, CSS, images, videos), API response caching (with appropriate Cache-Control headers), and even dynamic content acceleration (optimized routes between edge and origin). Key concepts: **Origin server** (your server), **Edge server** (CDN node), **TTL** (how long content is cached), **Cache invalidation/purge** (force refresh), **Origin shield** (intermediate cache layer to protect origin). Providers: CloudFront, Cloudflare, Akamai, Fastly.",
    "## Message Queues and Event Streaming\n\nMessage queues enable asynchronous communication between services. A **producer** sends messages to a queue; a **consumer** reads and processes them independently. Benefits: decoupling (producer doesn't know about consumers), load leveling (queue absorbs traffic spikes), fault tolerance (messages persist if consumers are down), scalability (add more consumers to increase throughput). **RabbitMQ**: traditional message broker with exchanges, queues, and routing keys. Supports complex routing patterns (fanout, topic, direct). Messages are removed after acknowledgment. **Apache Kafka**: distributed commit log. Messages are appended to partitioned topics and retained for a configurable period. Consumers track their offset, enabling replay. Excellent for event streaming, log aggregation, and high-throughput pipelines. **SQS**: AWS managed queue with standard (at-least-once, best-effort ordering) and FIFO (exactly-once, strict ordering) modes. Choose based on: throughput needs (Kafka >> RabbitMQ), ordering guarantees, replay requirements, and operational complexity.",
    "## Databases as Building Blocks\n\nDifferent database types serve different access patterns. **Relational (PostgreSQL, MySQL)**: ACID transactions, joins, strong consistency. Use for structured data with relationships. **Document (MongoDB, DynamoDB)**: flexible schemas, nested objects, horizontal scaling. Use for semi-structured data, catalogs, user profiles. **Key-Value (Redis, DynamoDB)**: sub-millisecond lookups by key. Use for caching, sessions, feature flags. **Wide-Column (Cassandra, HBase)**: high write throughput, time-series data, distributed by design. **Graph (Neo4j)**: relationships are first-class. Use for social networks, recommendations, fraud detection. **Search (Elasticsearch)**: inverted index for full-text search and analytics. In system design, you often combine multiple databases: PostgreSQL for the core data model, Redis for caching, Elasticsearch for search, and Kafka + a data warehouse for analytics. This is the polyglot persistence pattern.",
  ],
  animations: [
    {
      title: "Adding components as load grows",
      steps: [
        {
          label: "One server",
          detail: "App and database on one box. Fine to a few hundred users.",
        },
        {
          label: "Split the database",
          detail: "Separate host, so they scale and fail independently.",
        },
        {
          label: "Add a load balancer",
          detail: "Multiple stateless app instances behind it. Sessions move to Redis.",
        },
        {
          label: "Add a cache",
          detail: "Hot reads served from Redis; database load drops sharply.",
        },
        {
          label: "Add a CDN",
          detail: "Static assets served at the edge, cutting both latency and origin traffic.",
        },
        {
          label: "Add a queue",
          detail: "Slow work moves off the request path, absorbing spikes and third-party slowness.",
        },
        {
          label: "Then, only if forced",
          detail: "Read replicas, then partitioning, then sharding.",
        },
      ],
    },
  ],
  interviewQA: [
    {
      q: "When would you choose a Layer 4 load balancer over a Layer 7?",
      a: "Choose L4 when you need maximum throughput and minimum latency, and you don't need to inspect request content. L4 simply forwards TCP/UDP packets based on IP and port, making it much faster. Use cases: non-HTTP protocols (database connections, game servers), internal service-to-service load balancing where content-based routing is unnecessary. Choose L7 when you need: URL-based routing (/api to one pool, /web to another), SSL termination at the load balancer, header-based routing (A/B testing by cookie), rate limiting at the LB layer, or WebSocket support with path-based routing. In practice, many architectures use both: an L4 NLB at the edge for raw performance, fronting L7 ALBs for application-level routing.",
    },
    {
      q: "How do you prevent a cache stampede?",
      a: "Three main strategies: (1) **Locking/Mutex**: when a cache miss occurs, only one request acquires a lock to fetch from the database. Others wait for the lock to release and then read the refreshed cache. Works well but adds latency for waiting requests. (2) **Probabilistic early expiration**: each request randomly decides to refresh the cache slightly before the TTL expires, spreading the refresh load. The formula involves a random factor based on remaining TTL. (3) **Background refresh**: a separate process proactively refreshes cache entries before they expire (refresh-ahead). Combine with stale-while-revalidate: serve the stale value while refreshing in the background. For critical hot keys, use a combination: background refresh as the primary mechanism, with locking as a fallback.",
    },
    {
      q: "When would you choose Kafka over RabbitMQ?",
      a: "Choose Kafka when you need: high throughput (millions of messages/second), message replay (consumers can re-read old messages), event sourcing or log-based architecture, multiple consumer groups reading the same data independently, or long-term message retention. Choose RabbitMQ when you need: complex routing patterns (topic exchanges, headers-based routing), per-message acknowledgment with redelivery, priority queues, or simpler operational overhead for moderate throughput. Kafka is better for event streaming and data pipelines; RabbitMQ is better for task queues and request-reply patterns. A common pattern is using both: Kafka for the event backbone and RabbitMQ for specific task distribution within a service.",
    },
    {
      q: "How do you decide which database type to use in a system design?",
      a: "Start with the access patterns: (1) If you need ACID transactions and joins across related entities, use relational (PostgreSQL). (2) If the schema varies per record or you need to store nested objects, use document (MongoDB). (3) If you need sub-millisecond key lookups for caching or sessions, use key-value (Redis). (4) If you have massive write throughput or time-series data, use wide-column (Cassandra). (5) If relationships are the primary query dimension (friends-of-friends, shortest path), use graph (Neo4j). (6) If you need full-text search, use a search engine (Elasticsearch). Most systems use 2-3 database types. The primary data store is usually relational, with Redis for caching and possibly Elasticsearch for search.",
    },
  ],
  followUps: [
    "Which building block would you remove first if cost mattered more than latency?",
    "What does adding a queue buy you, and what does it cost in debuggability?",
  ],
  mcqs: [
    {
      q: "Consistent hashing is primarily used in load balancing to:",
      options: [
        "Ensure all servers get exactly equal traffic",
        "Minimize redistribution of requests when servers are added or removed",
        "Encrypt traffic between the load balancer and servers",
        "Improve SSL termination performance",
      ],
      answerIndex: 1,
      explanation:
        "Consistent hashing maps both servers and requests to a hash ring. When a server is added or removed, only the requests that were mapped near it are redistributed, minimizing disruption. This is especially important for stateful services or caches.",
    },
    {
      q: "A pull CDN fetches content from the origin:",
      options: [
        "Proactively before any user requests it",
        "On the first request for that content, then caches it",
        "Only when the origin pushes an update",
        "Every time a user requests it",
      ],
      answerIndex: 1,
      explanation:
        "In a pull CDN, content is fetched from the origin on the first cache miss and then cached at the edge for subsequent requests until the TTL expires. A push CDN receives content proactively.",
    },
    {
      q: "Which eviction policy removes the item that has been accessed least recently?",
      options: ["FIFO", "LFU", "LRU", "Random"],
      answerIndex: 2,
      explanation:
        "LRU (Least Recently Used) evicts the item whose last access was the longest ago. LFU (Least Frequently Used) evicts the item with the fewest total accesses. LRU is the most commonly used cache eviction policy.",
    },
    {
      q: "In the polyglot persistence pattern, a system uses:",
      options: [
        "A single database type for all data",
        "Multiple programming languages for the backend",
        "Multiple database types, each chosen for specific access patterns",
        "Database replication across multiple regions",
      ],
      answerIndex: 2,
      explanation:
        "Polyglot persistence means using different database technologies for different data storage needs within the same system. For example, PostgreSQL for transactional data, Redis for caching, and Elasticsearch for search.",
    },
  ],
  flashcards: [
    {
      front: "What are the main load balancing algorithms?",
      back: "Round-robin: equal distribution in order. Weighted round-robin: proportional to server capacity. Least connections: route to server with fewest active connections. IP hash: same client always goes to same server. Consistent hashing: minimizes redistribution when pool changes.",
    },
    {
      front: "What is a cache stampede and how do you prevent it?",
      back: "When a popular cache key expires and many requests simultaneously hit the database. Prevention: (1) Mutex/lock so only one request fetches. (2) Probabilistic early expiration to stagger refreshes. (3) Background refresh before TTL expires. (4) Stale-while-revalidate: serve old data while refreshing.",
    },
    {
      front: "What is the difference between push and pull CDN?",
      back: "Push CDN: you proactively upload content to edge servers. Better for large, static, infrequently changing files. Pull CDN: edge fetches from origin on first request, then caches. Better for dynamic content and high-traffic sites. Pull is more common.",
    },
    {
      front: "What are the key differences between Kafka and RabbitMQ?",
      back: "Kafka: distributed log, high throughput, message replay, consumer groups, long retention. RabbitMQ: traditional broker, complex routing, per-message ack, priority queues, simpler ops. Kafka for event streaming/pipelines; RabbitMQ for task queues.",
    },
    {
      front: "What is an origin shield in a CDN?",
      back: "An intermediate cache layer between edge servers and the origin. Edge servers fetch from the shield instead of directly from origin, reducing origin load. Particularly useful when many edge locations would otherwise each independently request the same content.",
    },
    {
      front: "What is L4 vs L7 load balancing?",
      back: "L4 operates at transport layer (TCP/UDP), routing by IP and port. Fast but no content awareness. L7 operates at application layer (HTTP), can inspect headers, URLs, cookies. Enables content-based routing, SSL termination, sticky sessions.",
    },
    {
      front: "When would you use a wide-column database?",
      back: "For high write throughput, time-series data, and distributed workloads. Examples: Cassandra, HBase. Good for: IoT sensor data, activity logs, messaging at scale. Trade-off: limited query flexibility compared to relational databases.",
    },
  ],
  resources: [
    {
      label: "System Design Interview — Alex Xu",
      kind: "book",
    },
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Load Balancer",
      definition:
        "A component that distributes incoming network traffic across multiple servers to ensure availability and performance. Operates at Layer 4 (transport) or Layer 7 (application).",
    },
    {
      term: "CDN (Content Delivery Network)",
      definition:
        "A globally distributed network of edge servers that cache and serve content close to users, reducing latency and offloading traffic from origin servers.",
    },
    {
      term: "Message Queue",
      definition:
        "A middleware component that enables asynchronous communication between services by temporarily storing messages until consumers process them.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A hashing technique that minimizes key redistribution when nodes are added or removed. Keys and nodes are mapped to a hash ring; each key is assigned to the next node clockwise.",
    },
    {
      term: "Cache Eviction Policy",
      definition:
        "The algorithm that determines which items to remove from a cache when it reaches capacity. Common policies: LRU (least recently used), LFU (least frequently used), FIFO, TTL-based.",
    },
    {
      term: "Polyglot Persistence",
      definition:
        "An architectural pattern of using multiple database technologies within a single system, each chosen based on the specific data access patterns it serves best.",
    },
    {
      term: "SSL Termination",
      definition:
        "The process of decrypting TLS/SSL-encrypted traffic at the load balancer, so backend servers handle unencrypted traffic. Reduces compute load on application servers.",
    },
  ],

  deepDive: [
    "## How Load Balancers Actually Work Under the Hood\n\nLoad balancers are far more than simple traffic distributors -- they are critical **control plane components** that shape how your entire system behaves under stress. At **Layer 4**, a load balancer operates on TCP segments: it reads the destination IP and port from the packet header, selects a backend using its configured algorithm, and rewrites the packet's destination (NAT) before forwarding it. Because it never parses the payload, L4 is *extremely fast* -- measured in microseconds -- and is protocol-agnostic (HTTP, gRPC, WebSocket, database wire protocols all work transparently). At **Layer 7**, the load balancer terminates the TCP connection, fully parses the HTTP request (method, URI, headers, sometimes the body), makes a routing decision, and opens a *new* connection to the chosen backend. This gives it superpowers:\n\n- **Path-based routing**: send `/api/v2/*` to the new service, `/api/v1/*` to the legacy service\n- **Header injection**: add `X-Request-ID` for distributed tracing\n- **Rate limiting**: enforce per-client request quotas before traffic reaches your application\n- **SSL termination**: decrypt TLS at the LB so backends handle plain HTTP, reducing CPU overhead\n\nThe trade-off is latency: L7 parsing adds ~1-5ms per request. In practice, most production architectures use **both**: an L4 NLB at the edge for raw TCP performance and DDoS absorption, fronting L7 ALBs that handle application-level routing.",

    "## Cache Hierarchies and Invalidation Strategies in Depth\n\nCaching is not a single layer -- it is a **hierarchy**, and understanding where each layer sits is critical for designing low-latency systems. The hierarchy from closest to the user to closest to the data source is: *browser cache* (controlled by `Cache-Control` and `ETag` headers) -> *CDN edge cache* -> *API gateway cache* -> *application-level in-process cache* (e.g., `std::unordered_map` in C++ or Guava/Caffeine in Java) -> *distributed cache* (Redis, Memcached) -> *database buffer pool*. Each layer trades **freshness** for **speed**.\n\nThe three canonical write strategies are:\n- **Cache-aside (lazy loading)**: the application checks the cache first; on a miss, it reads from the DB and populates the cache. On writes, the application updates the DB and *invalidates* (deletes) the cache key. Simple but vulnerable to race conditions if two writers invalidate simultaneously.\n- **Write-through**: every write goes to both the cache and the DB synchronously. Guarantees consistency but adds write latency.\n- **Write-behind (write-back)**: writes go to the cache immediately; a background process asynchronously flushes to the DB. Lowest write latency but risks data loss if the cache node fails before flushing.\n\nThe hardest problem is **invalidation**. TTL-based expiration is simple but allows stale reads. Event-driven invalidation (publish a cache-bust event on every DB write) is more precise but adds infrastructure complexity. For hot keys, consider **refresh-ahead**: a background thread proactively refreshes the cache entry *before* the TTL expires, so no request ever sees a miss.",

    "## Message Queues vs. Event Streams: Choosing the Right Abstraction\n\nMessage queues and event streams solve overlapping but fundamentally different problems. A **message queue** (RabbitMQ, SQS) implements the *competing consumers* pattern: a message is delivered to **one** consumer, acknowledged, and removed. This is ideal for **task distribution** -- e.g., sending emails, processing image uploads, executing background jobs. If a consumer fails, the message is redelivered to another consumer. The queue acts as a *buffer* that absorbs traffic spikes.\n\nAn **event stream** (Kafka, Kinesis) implements the *publish-subscribe log* pattern: events are **appended** to an immutable, ordered log partitioned by key. Multiple **consumer groups** can each read the entire stream independently, at their own pace. Events are *retained* for a configurable period (days, weeks, or forever with compaction), enabling **replay** -- a new consumer can start from the beginning and rebuild its state. This is the foundation of *event sourcing* and *CQRS* architectures.\n\nKey decision factors:\n- **Do multiple independent services need the same data?** -> Event stream (each gets its own consumer group)\n- **Do you need message replay or audit trails?** -> Event stream\n- **Is ordering critical within a partition key?** -> Kafka guarantees per-partition ordering; SQS FIFO guarantees per-group ordering\n- **Do you need complex routing (fanout, topic-based)?** -> RabbitMQ excels with its exchange/binding model\n- **Is operational simplicity paramount?** -> SQS (fully managed, no clusters to maintain)",

    "## Database Internals: Storage Engines and Index Structures\n\nUnderstanding *how* databases store and retrieve data helps you make better schema and indexing decisions. The two dominant storage engine paradigms are **B-tree** and **LSM-tree**. B-tree engines (used by PostgreSQL, MySQL/InnoDB) maintain a balanced tree of pages on disk. Reads are fast (O(log n) page reads), but writes require in-place updates and potentially page splits. LSM-tree engines (used by Cassandra, RocksDB, LevelDB) write to an in-memory buffer (`memtable`), which periodically flushes to sorted immutable files (`SSTables`) on disk. Reads may need to check multiple SSTables (mitigated by Bloom filters), but writes are sequential and very fast. **Rule of thumb**: B-tree for read-heavy workloads; LSM-tree for write-heavy workloads.\n\nIndex types matter enormously:\n- **B-tree index**: the default. Great for equality and range queries (`WHERE age BETWEEN 20 AND 30`)\n- **Hash index**: O(1) lookups but no range queries. Used internally by `std::unordered_map` in C++ and by some in-memory databases\n- **Inverted index**: maps terms to document IDs. The foundation of Elasticsearch and full-text search\n- **Geospatial index** (R-tree, geohash): enables queries like `find all restaurants within 5km`\n\nIn system design interviews, always state which indexes you would create and *why*. A missing index on a high-cardinality column in a hot query path is one of the most common performance mistakes in production systems.",
  ],

  code: [
    {
      language: "cpp",
      caption: "LRU Cache implementation using a doubly linked list and hash map (O(1) get and put)",
      source: `#include <iostream>
#include <unordered_map>
#include <list>
using namespace std;

class LRUCache {
    int capacity;
    list<pair<int, int>> dll;                        // doubly linked list: (key, value)
    unordered_map<int, list<pair<int,int>>::iterator> cache; // key -> iterator into dll

public:
    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        if (cache.find(key) == cache.end()) return -1;
        // Move accessed node to front (most recently used)
        dll.splice(dll.begin(), dll, cache[key]);
        return cache[key]->second;
    }

    void put(int key, int value) {
        if (cache.find(key) != cache.end()) {
            // Update existing key
            cache[key]->second = value;
            dll.splice(dll.begin(), dll, cache[key]);
            return;
        }
        if ((int)dll.size() == capacity) {
            // Evict least recently used (back of list)
            int evictKey = dll.back().first;
            dll.pop_back();
            cache.erase(evictKey);
        }
        dll.emplace_front(key, value);
        cache[key] = dll.begin();
    }
};

int main() {
    LRUCache cache(3);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);
    cout << "Get 1: " << cache.get(1) << endl;  // 10, moves key 1 to front
    cache.put(4, 40);                             // Evicts key 2 (least recently used)
    cout << "Get 2: " << cache.get(2) << endl;   // -1 (evicted)
    cout << "Get 3: " << cache.get(3) << endl;   // 30
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Consistent hashing with virtual nodes for balanced load distribution",
      source: `#include <iostream>
#include <map>
#include <string>
#include <functional>
using namespace std;

class ConsistentHash {
    map<size_t, string> ring;   // hash -> server name
    int virtualNodes;
    hash<string> hasher;

public:
    ConsistentHash(int vnodes = 150) : virtualNodes(vnodes) {}

    void addServer(const string& server) {
        for (int i = 0; i < virtualNodes; i++) {
            size_t h = hasher(server + "#" + to_string(i));
            ring[h] = server;
        }
        cout << "Added server: " << server
             << " (" << virtualNodes << " virtual nodes)" << endl;
    }

    void removeServer(const string& server) {
        for (int i = 0; i < virtualNodes; i++) {
            size_t h = hasher(server + "#" + to_string(i));
            ring.erase(h);
        }
        cout << "Removed server: " << server << endl;
    }

    string getServer(const string& key) const {
        if (ring.empty()) return "";
        size_t h = hasher(key);
        auto it = ring.lower_bound(h);
        if (it == ring.end()) it = ring.begin();  // wrap around the ring
        return it->second;
    }
};

int main() {
    ConsistentHash ch(100);
    ch.addServer("cache-server-1");
    ch.addServer("cache-server-2");
    ch.addServer("cache-server-3");

    // Route keys to servers
    for (const auto& key : {"user:1001", "user:1002", "session:abc", "order:5678"}) {
        cout << key << " -> " << ch.getServer(key) << endl;
    }

    // Remove a server -- only keys mapped to it are redistributed
    ch.removeServer("cache-server-2");
    cout << "\\nAfter removing cache-server-2:" << endl;
    for (const auto& key : {"user:1001", "user:1002", "session:abc", "order:5678"}) {
        cout << key << " -> " << ch.getServer(key) << endl;
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Thread-safe producer-consumer queue using std::mutex and std::condition_variable",
      source: `#include <iostream>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <string>
using namespace std;

template <typename T>
class MessageQueue {
    queue<T> buffer;
    size_t maxSize;
    mutex mtx;
    condition_variable notFull;
    condition_variable notEmpty;
    bool closed = false;

public:
    MessageQueue(size_t cap) : maxSize(cap) {}

    void produce(const T& item) {
        unique_lock<mutex> lock(mtx);
        notFull.wait(lock, [&] { return buffer.size() < maxSize || closed; });
        if (closed) return;
        buffer.push(item);
        cout << "[Producer] Enqueued: " << item << " (queue size: " << buffer.size() << ")" << endl;
        notEmpty.notify_one();
    }

    bool consume(T& item) {
        unique_lock<mutex> lock(mtx);
        notEmpty.wait(lock, [&] { return !buffer.empty() || closed; });
        if (buffer.empty() && closed) return false;
        item = buffer.front();
        buffer.pop();
        notFull.notify_one();
        return true;
    }

    void close() {
        unique_lock<mutex> lock(mtx);
        closed = true;
        notFull.notify_all();
        notEmpty.notify_all();
    }
};

int main() {
    MessageQueue<string> mq(5);

    thread producer([&] {
        for (int i = 1; i <= 8; i++) {
            mq.produce("task-" + to_string(i));
            this_thread::sleep_for(chrono::milliseconds(100));
        }
        mq.close();
    });

    thread consumer([&] {
        string item;
        while (mq.consume(item)) {
            cout << "[Consumer] Processing: " << item << endl;
            this_thread::sleep_for(chrono::milliseconds(200));
        }
        cout << "[Consumer] Queue closed, exiting." << endl;
    });

    producer.join();
    consumer.join();
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Simple round-robin and least-connections load balancer simulation",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Server {
    string name;
    int activeConnections = 0;
    bool healthy = true;
};

class LoadBalancer {
    vector<Server> servers;
    int rrIndex = 0;

public:
    void addServer(const string& name) {
        servers.push_back({name, 0, true});
    }

    // Round-robin: cycle through servers in order
    Server& roundRobin() {
        int attempts = 0;
        while (attempts < (int)servers.size()) {
            Server& s = servers[rrIndex % servers.size()];
            rrIndex++;
            if (s.healthy) {
                s.activeConnections++;
                return s;
            }
            attempts++;
        }
        throw runtime_error("No healthy servers available");
    }

    // Least connections: pick the server with the fewest active connections
    Server& leastConnections() {
        Server* best = nullptr;
        for (auto& s : servers) {
            if (s.healthy && (!best || s.activeConnections < best->activeConnections)) {
                best = &s;
            }
        }
        if (!best) throw runtime_error("No healthy servers available");
        best->activeConnections++;
        return *best;
    }

    void releaseConnection(const string& name) {
        for (auto& s : servers) {
            if (s.name == name && s.activeConnections > 0) {
                s.activeConnections--;
                return;
            }
        }
    }

    void markUnhealthy(const string& name) {
        for (auto& s : servers) {
            if (s.name == name) { s.healthy = false; return; }
        }
    }

    void printStatus() const {
        for (const auto& s : servers) {
            cout << "  " << s.name << ": " << s.activeConnections
                 << " connections, " << (s.healthy ? "healthy" : "DOWN") << endl;
        }
    }
};

int main() {
    LoadBalancer lb;
    lb.addServer("web-1");
    lb.addServer("web-2");
    lb.addServer("web-3");

    cout << "--- Round Robin ---" << endl;
    for (int i = 0; i < 6; i++) {
        Server& s = lb.roundRobin();
        cout << "Request " << i+1 << " -> " << s.name << endl;
    }
    cout << endl;
    lb.printStatus();
    return 0;
}`,
    },
    {
      language: "bash",
      caption: "Infrastructure commands: Redis caching, Nginx load balancer config, and Kafka topic management",
      source: `#!/bin/bash
# === Redis Cache Operations ===
# Set a cache key with 300-second TTL
redis-cli SET "user:1001:profile" '{"name":"Alice","role":"admin"}' EX 300

# Get a cached value
redis-cli GET "user:1001:profile"

# Check TTL remaining
redis-cli TTL "user:1001:profile"

# Invalidate a cache key
redis-cli DEL "user:1001:profile"

# Monitor cache hit rate
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"


# === Nginx Load Balancer Configuration ===
cat <<'NGINX' > /etc/nginx/conf.d/load-balancer.conf
upstream backend_pool {
    least_conn;                    # Least connections algorithm
    server 10.0.1.10:8080 weight=3;  # Higher capacity server
    server 10.0.1.11:8080 weight=2;
    server 10.0.1.12:8080 weight=1;
    server 10.0.1.13:8080 backup;    # Only used when others are down
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend_pool;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Request-ID $request_id;
        proxy_next_upstream error timeout http_502 http_503;
    }
}
NGINX
nginx -t && nginx -s reload


# === Kafka Topic Management ===
# Create a topic with 12 partitions and replication factor 3
kafka-topics.sh --bootstrap-server kafka:9092 \\
  --create --topic order-events \\
  --partitions 12 --replication-factor 3

# List all topics
kafka-topics.sh --bootstrap-server kafka:9092 --list

# Describe a topic (shows partitions, replicas, ISR)
kafka-topics.sh --bootstrap-server kafka:9092 \\
  --describe --topic order-events

# Produce a test message
echo '{"orderId":"ORD-123","status":"created"}' | \\
  kafka-console-producer.sh --bootstrap-server kafka:9092 \\
  --topic order-events

# Consume from the beginning
kafka-console-consumer.sh --bootstrap-server kafka:9092 \\
  --topic order-events --from-beginning --max-messages 10`,
    },
  ],

  diagrams: [
    {
      title: "System Building Blocks Network",
      kind: "network",
      caption: "Core infrastructure components and how they interconnect: clients, load balancer, app servers, cache, DB, CDN, and message queue.",
      mermaid: `graph LR
    Client["Client"] --> CDN["CDN Edge"]
    Client --> LB["Load Balancer"]
    CDN --> LB
    LB --> App1["App Server 1"]
    LB --> App2["App Server 2"]
    App1 --> Cache["Redis Cache"]
    App2 --> Cache
    App1 --> DB["Primary DB"]
    App2 --> DB
    DB --> Replica["Read Replica"]
    App1 --> MQ["Message Queue"]
    App2 --> MQ
    MQ --> Worker["Background Worker"]`,
    },
    {
      title: "Cache-Aside Request Flow",
      kind: "sequence",
      caption: "Cache hit path returns data from Redis immediately; cache miss queries the DB and populates the cache.",
      mermaid: `sequenceDiagram
    participant App
    participant Cache
    participant DB
    App->>Cache: GET user:1001
    Cache-->>App: HIT - return cached data
    App->>Cache: GET user:1002
    Cache-->>App: MISS - null
    App->>DB: SELECT from users WHERE id=1002
    DB-->>App: row data
    App->>Cache: SET user:1002 data EX 300
    App->>DB: UPDATE users SET name=Robert WHERE id=1002
    DB-->>App: OK
    App->>Cache: DEL user:1002`,
    },
    {
      title: "Load Balancer Routing Flow",
      kind: "flow",
      caption: "L7 load balancer routes requests by URL path, skips unhealthy servers, and forwards static assets to CDN.",
      mermaid: `flowchart TD
    A([Incoming Request]) --> B{L7 route check}
    B -->|/api/*| C{Healthy server available?}
    B -->|/static/*| D[CDN Edge]
    C -->|Yes| E[Round-robin to App Server]
    C -->|No| F[Return 503 Service Unavailable]
    E --> G{Server health check}
    G -->|Healthy| H([Process request])
    G -->|Unhealthy| I[Mark server down]
    I --> C`,
    },
    {
      title: "Message Queue vs Event Stream",
      kind: "architecture",
      caption: "Queue pattern — each message consumed once by one consumer. Stream pattern — multiple consumer groups read the same log at independent offsets.",
      mermaid: `graph TD
    PQ["Producer"] --> Q["Queue - RabbitMQ or SQS"]
    Q --> C1["Consumer 1 - one message"]
    Q --> C2["Consumer 2 - different message"]
    PE["Producer"] --> T["Topic - Kafka"]
    T --> CGA["Consumer Group A - Service X"]
    T --> CGB["Consumer Group B - Analytics"]
    T --> CGC["Consumer Group C - Audit log"]`,
    },
  ],

  exercises: [
    "Design and implement an LRU cache with a configurable eviction policy (support both LRU and LFU). Write it in C++ using STL containers. Then extend it to be thread-safe using `std::shared_mutex` for concurrent read access and exclusive write access. Benchmark the difference between the locked and lock-free versions.",
    "Build a consistent hashing ring simulator. Start with basic hashing, then add virtual nodes. Measure the standard deviation of key distribution across servers with 10, 50, 100, and 200 virtual nodes. Visualize how few keys are remapped when a node is added or removed compared to simple modulo hashing.",
    "Design a URL shortening service on paper. Specify which building blocks you would use: load balancer type and algorithm, caching layer (what to cache, eviction policy, TTL), database type and schema, and CDN strategy. Justify each choice. Then estimate the storage and throughput requirements for 100M URLs with a 100:1 read-to-write ratio.",
    "Implement a dead-letter queue pattern: create a producer-consumer system where failed messages (after 3 retries with exponential backoff) are moved to a separate dead-letter queue for manual inspection. Use C++ threads and condition variables for the concurrency model.",
    "Compare write-through, write-behind, and cache-aside patterns by implementing all three in a small C++ program with an in-memory cache and a simulated database (a `std::map`). Measure latency and consistency trade-offs under concurrent reads and writes.",
  ],

  cheatSheet: [
    "**L4 vs L7 LB**: L4 = transport layer (IP+port, fast, protocol-agnostic). L7 = application layer (HTTP headers/URL, content-based routing, SSL termination). Use L4 for raw throughput, L7 for smart routing.",
    "**Cache eviction**: LRU (least recently used) -- best general-purpose. LFU (least frequently used) -- better for skewed access patterns. TTL -- simple time-based expiry. Combine LRU + TTL in practice.",
    "**Cache write strategies**: Cache-aside (app manages cache, most common). Write-through (sync write to both, consistent but slow writes). Write-behind (async flush to DB, fast but risks data loss).",
    "**Consistent hashing**: Maps servers and keys to a ring. Adding/removing a server only remaps ~1/N keys. Use 100-200 virtual nodes per server for even distribution.",
    "**CDN types**: Pull CDN (fetch on first request, cache with TTL) -- good for high-traffic dynamic content. Push CDN (proactively upload) -- good for large static files. Pull is more common.",
    "**Kafka vs RabbitMQ**: Kafka = distributed log, replay, consumer groups, high throughput. RabbitMQ = traditional broker, complex routing, per-message ack. Kafka for events, RabbitMQ for tasks.",
    "**Database selection by access pattern**: Relational (joins, ACID) -> PostgreSQL. Document (flexible schema) -> MongoDB. Key-value (sub-ms lookups) -> Redis. Wide-column (high write throughput) -> Cassandra. Graph (relationships) -> Neo4j. Search -> Elasticsearch.",
    "**Storage engines**: B-tree (PostgreSQL, MySQL) = fast reads, in-place updates. LSM-tree (Cassandra, RocksDB) = fast sequential writes, compaction overhead on reads. B-tree for read-heavy, LSM for write-heavy.",
  ],

  revisionNotes: [
    "Load balancers are the front door of your system. L4 for speed and protocol-agnostic routing, L7 for content-aware routing. Most architectures use both: L4 at the edge, L7 for application routing. Always mention health checks.",
    "Caching exists at every layer (browser, CDN, app, distributed cache, DB buffer pool). In system design, 'the cache' usually means Redis between app servers and the DB. Always discuss eviction policy (LRU), TTL, and invalidation strategy.",
    "Cache stampede is a top interview topic. Three solutions: mutex/lock (only one fetches), probabilistic early expiration (stagger refreshes), background refresh (proactive). Mention stale-while-revalidate as a bonus.",
    "CDNs are not just for static files. They handle API response caching, DDoS protection, SSL termination, and dynamic content acceleration. Origin shield reduces origin load by acting as an intermediate cache.",
    "Message queues (RabbitMQ, SQS) are for task distribution with competing consumers. Event streams (Kafka) are for pub-sub with replay and multiple consumer groups. Know when to use each and be able to justify your choice.",
    "Polyglot persistence is the norm in large systems. PostgreSQL for core data, Redis for caching, Elasticsearch for search, Kafka for event streaming. Always explain why each database type was chosen based on access patterns.",
    "Consistent hashing is essential for distributed caches and partitioned databases. Virtual nodes solve the uneven distribution problem. Key insight: adding/removing a server only affects ~1/N of the keys, unlike modulo hashing which remaps almost everything.",
    "In system design interviews, always specify your building blocks explicitly: LB type and algorithm, cache layer and eviction policy, database type and indexes, queue/stream choice. Vague answers like 'add a cache' lose points -- say 'Redis with LRU eviction and 5-minute TTL using cache-aside pattern.'",
  ],
};
