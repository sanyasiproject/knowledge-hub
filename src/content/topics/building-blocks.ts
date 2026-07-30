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
};
