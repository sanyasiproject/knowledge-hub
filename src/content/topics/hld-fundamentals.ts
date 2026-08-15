import type { TopicContent } from "../types";

export const hldFundamentals: TopicContent = {
  quickSummary: [
    "High-Level Design (HLD) defines the major components of a system, their responsibilities, and how they interact -- without specifying implementation details like code structure or algorithms.",
    "Modern web architecture is a layered stack: an edge layer (DNS, CDN, WAF), a gateway layer (load balancer, API gateway), a stateless application tier, a caching layer (Redis), a data layer (relational, NoSQL, search, object storage), and an async backbone (Kafka, workers, schedulers) -- all wrapped in observability.",
    "Data flow design traces how requests and data move through the system, covering synchronous API calls, asynchronous event pipelines, and data transformation stages.",
    "Non-Functional Requirements (NFRs) like scalability, availability, latency, and security shape architectural decisions and must be quantified early -- they determine which components you actually need.",
  ],
  detailed: [
    `## Component Design

Component design is the process of decomposing a system into its major building blocks and defining their responsibilities.

**Core components in most systems:**
- **Edge layer** -- DNS, CDN, and WAF sit between users and your infrastructure.
- **Gateway layer** -- load balancers and API gateways route, authenticate, and rate-limit traffic.
- **Application services** -- stateless services containing business logic; may be monolithic or decomposed into microservices.
- **Caches** -- in-memory stores (Redis, Memcached) for reducing database load and improving latency.
- **Data stores** -- relational databases (PostgreSQL, MySQL), NoSQL (MongoDB, DynamoDB, Cassandra), search engines (Elasticsearch), object storage (S3).
- **Message queues / event streams** -- asynchronous communication (Kafka, SQS, RabbitMQ) for decoupling, buffering, and fan-out.
- **Supporting services** -- notifications, analytics pipelines, and the observability stack (metrics, logs, traces).

**Design principles:**
- **Single Responsibility** -- each component does one thing well. Avoid "god services" that handle everything.
- **Loose coupling** -- components interact through well-defined interfaces. Changing one component's internals should not require changes in others.
- **High cohesion** -- related functionality lives together. If two operations always change together, they belong in the same component.
- **Separation of reads and writes** -- for high-traffic systems, separate read and write paths (CQRS) to optimize each independently.

Key insight: Every box in an architecture diagram exists to solve a specific problem -- latency, load, decoupling, durability, or search. If you cannot name the problem a component solves, remove it.`,

    `## The Canonical Modern Web Architecture

Almost every large-scale web system converges on the same layered architecture, and mastering it gives you a reusable template for any HLD problem. The layers, from user to disk: **Edge** (DNS, CDN, WAF) -> **Gateway** (load balancer, API gateway) -> **Application** (stateless services, realtime service) -> **Caching** (Redis) -> **Data** (relational, NoSQL, search, object storage) -> **Async** (Kafka, workers, schedulers) -> **Supporting** (notifications, analytics, observability).

**A running example we will trace through every layer -- loading a product page on an e-commerce site:**

1. The browser resolves \`shop.example.com\` via **DNS** and connects to the nearest **CDN** edge node.
2. The CDN serves images, JS, and CSS from edge cache; the dynamic \`GET /products/42\` API call passes through the **WAF** to the origin.
3. A **load balancer** picks a healthy app server; the **API gateway** validates the user's JWT and checks rate limits.
4. A stateless **product service** checks **Redis** for \`product:42\`. On a hit (typically 90-99% for hot catalog data) it returns in ~1ms; on a miss it queries a **Postgres read replica**, caches the result with a TTL, and returns it.
5. Asynchronously, the service emits a \`ProductViewed\` event to **Kafka**; a consumer updates view counters, another feeds the **analytics pipeline** and the recommendation model. None of this blocks the user's response.
6. Every hop emits **metrics, logs, and traces** so the team can see p99 latency per layer.

For example, at 10,000 page views/sec with a 95% CDN hit rate for static assets and a 98% Redis hit rate for product data, the database sees only ~200 queries/sec -- a load a single Postgres replica handles trivially. That arithmetic is the whole point of the layered design.

Key insight: Each layer exists to absorb traffic so the layer below it sees less. CDN absorbs static reads, cache absorbs hot dynamic reads, replicas absorb remaining reads, and queues absorb write bursts. The database at the bottom should see only the traffic nothing above it could handle.`,

    `## Edge Layer: DNS, CDN, and WAF

The edge layer is the first infrastructure a request touches, and its job is to answer as many requests as possible before they ever reach your servers.

- **DNS** (Route 53, Cloudflare DNS) resolves your domain to IP addresses. Beyond simple resolution, DNS enables **geo-routing** (send EU users to EU servers), **weighted routing** (canary releases), and **failover** (health-checked records that stop resolving to a dead region).
- **CDN** (CloudFront, Cloudflare, Akamai, Fastly) caches content at hundreds of edge locations near users. Static assets (images, JS, CSS, video) are the obvious wins, but CDNs also cache **API responses** with short TTLs and terminate TLS close to the user, cutting connection setup latency.
- **WAF** (Web Application Firewall) inspects traffic at the edge for SQL injection, XSS, bots, and volumetric DDoS -- filtering attacks before they consume origin capacity.

For example, a news site during a breaking story can serve 99%+ of article-page traffic straight from CDN cache with a 30-second TTL, so a 100x traffic spike barely registers at the origin.

In practice: latency to the user is dominated by physical distance and connection setup. A CDN edge 20ms away beats an origin 200ms away no matter how fast your backend is -- which is why the edge layer is the cheapest latency win in any design.

Common mistake: treating the CDN as "just for images." Cacheable GET APIs (product catalogs, public profiles, search suggestions) belong behind the CDN too, with cache keys and TTLs designed deliberately.`,

    `## Gateway Layer: Load Balancers and API Gateways

The gateway layer is the front door of your own infrastructure: it spreads traffic across servers and enforces cross-cutting policy in one place.

**Load balancers** distribute requests across healthy application instances:
- **L4 (transport)** balancers (AWS NLB, HAProxy in TCP mode) route by IP/port -- extremely fast, protocol-agnostic, used for raw TCP/TLS passthrough and very high throughput.
- **L7 (application)** balancers (Nginx, HAProxy, Envoy, AWS ALB) understand HTTP -- they route by path/host/header, terminate TLS, retry failed requests, and enable weighted or canary routing.
- Algorithms: **round-robin** (default), **least-connections** (better for uneven request costs), **consistent hashing** (sticky routing for caches and WebSockets).
- Health checks eject unhealthy instances automatically -- this is the primary mechanism behind high availability at the app tier.

**API gateways** (Kong, Zuul, Apigee, AWS API Gateway, or Envoy configured as an edge proxy) sit logically behind the load balancer and handle:
- **Authentication/authorization** -- JWT validation, API keys, OAuth introspection -- so individual services never re-implement auth.
- **Rate limiting and quotas** per user, per API key, or per IP (typically token-bucket backed by Redis).
- **Routing and versioning** -- map \`/v1/orders\` to the orders service; translate REST to gRPC internally.
- **Response aggregation** -- the Backend-for-Frontend (BFF) pattern composes several service calls into one client response.

Warning: the gateway is a single logical choke point. It must itself be horizontally scaled and redundant, and it must fail fast -- an overloaded gateway that queues requests turns a partial outage into a total one.`,

    `## Application Tier: Stateless Services and Realtime

The application tier holds business logic, and the single most important property it must have is statelessness. A stateless service keeps no per-user state in process memory -- sessions live in Redis, files in S3, data in databases -- so any instance can serve any request. This is what makes horizontal scaling and rolling deploys trivial: add instances behind the load balancer and traffic just spreads.

- **Session state** goes in Redis (or a signed JWT carried by the client), never in server memory.
- **Sticky sessions** (routing a user to the same instance) are a smell -- they break autoscaling and make deploys risky. Use them only where the protocol demands it.
- Services scale on CPU/latency metrics via autoscaling groups or Kubernetes HPA.

**Realtime is the exception that needs its own service.** Long-lived connections (chat, live dashboards, notifications) do not fit the stateless request/response model:
- **WebSockets** -- full-duplex, persistent connections. A dedicated WebSocket service holds connections, with a **connection registry** (in Redis) mapping userId -> server instance so other services can push to the right node, and Redis Pub/Sub or Kafka to fan messages out across WebSocket servers.
- **Server-Sent Events (SSE)** -- one-directional server push over plain HTTP. Simpler than WebSockets and sufficient for feeds, notifications, and progress updates.
- **Long polling** -- the fallback when neither is available; higher latency and connection churn.

Real-world example: Slack runs a fleet of dedicated "gateway" servers holding millions of WebSocket connections, entirely separate from the stateless API servers that handle message sends -- because connection-holding and request-handling scale on completely different axes (memory/file descriptors vs. CPU).`,

    `## Caching Layer: Redis and Memcached

The cache layer exists because memory is roughly 100x faster than disk and 10-100x cheaper per query than a database at scale. A cache hit costs ~0.5ms over the network; the same query against Postgres costs 5-50ms and consumes connection and CPU budget you cannot easily scale.

- **Redis** is the default choice: rich data structures (strings, hashes, sorted sets for leaderboards, sets, streams), optional persistence, replication, and clustering. It doubles as a session store, rate-limiter backend, distributed lock manager, and Pub/Sub bus.
- **Memcached** is simpler -- pure key-value, multi-threaded, slightly better raw throughput for plain string caching -- but has no persistence, no data structures, and no replication. Choose it only for straightforward look-aside caching at very high volume.

**What to cache:** hot database query results, rendered fragments, session data, computed aggregates (follower counts), and anything read thousands of times per write.

**The numbers that matter:**
- **Hit ratio** -- the fraction of reads served from cache. Going from 90% to 99% hit ratio cuts database read load by 10x, so hit ratio is a first-class design metric, not an afterthought.
- **TTL** -- your staleness budget. A 60s TTL means data can be up to 60s stale; pick TTLs per data class, not one global value.

For example, a product page cached with a 5-minute TTL at a 98% hit ratio turns 10,000 reads/sec into 200 database queries/sec -- and if the price changes, an event-driven invalidation deletes the key immediately rather than waiting out the TTL.

Common mistake: ignoring the **hot key** problem. If one key (a celebrity's profile, a viral post) receives a large share of all traffic, the single cache shard owning it saturates. Mitigations: replicate the hot key across shards with key suffixes, add a small in-process L1 cache, or serve it from the CDN.

Warning: also plan for **cache stampede** -- when a popular key expires, thousands of concurrent misses hit the database at once. Use lock-and-recompute (only one request regenerates), stale-while-revalidate, or jittered TTLs.`,

    `## Data Layer: Relational, NoSQL, Search, and Object Storage

The data layer is where you choose storage engines by access pattern, and real systems almost always run several side by side (polyglot persistence).

**Relational (PostgreSQL, MySQL):** the default for core business data -- orders, users, payments. ACID transactions, joins, constraints, and a mature ecosystem. Scaled first with **read replicas**: the primary handles writes and streams its **write-ahead log (WAL)** to replicas that serve reads. Replication is asynchronous by default, so replicas lag by milliseconds to seconds -- reads may be slightly stale (**replication lag** is a consistency decision, not a bug).

**NoSQL:**
- **MongoDB** (document) -- flexible JSON-like documents, good for nested, evolving schemas.
- **Cassandra** (wide-column) -- masterless, linearly scalable writes across nodes and regions; ideal for time-series, activity feeds, and write-heavy telemetry. Queries must match the partition-key design.
- **DynamoDB** (managed key-value/document) -- single-digit-millisecond lookups at any scale with zero operations burden; you pay by throughput and must design keys around access patterns up front.

**Search (Elasticsearch / OpenSearch):** databases are terrible at full-text search, relevance ranking, fuzzy matching, and faceted filtering; Elasticsearch's inverted indexes are built for exactly that. It is a **derived store** -- data is synced into it from the source-of-truth database (usually via Kafka/CDC), never written to it as the primary copy.

**Object storage (S3, GCS, Azure Blob):** images, videos, backups, data-lake files. Effectively infinite capacity, 11-nines durability, dirt cheap -- but high latency and no queries. The universal pattern: store the blob in S3, store its metadata and URL in the database, and serve the blob to users via the CDN.

Key insight: keep exactly one **source of truth** per piece of data. Caches, search indexes, and analytics stores are derived views that can be rebuilt; the moment two stores both claim to be authoritative, you have a consistency bug waiting to happen.

For example, an Instagram-style app stores post metadata in Postgres, the media files in S3 (served via CDN), the feed timeline in Cassandra, and captions in Elasticsearch for search -- four stores, one logical "post."`,

    `## Async Backbone: Kafka, Queues, Workers, and Schedulers

Asynchronous processing is how systems stay fast and resilient: anything the user does not need in the response should leave the request path.

**Messaging technologies:**
- **Kafka** -- a durable, partitioned, replayable **log**. Producers append events; consumer groups read independently at their own pace, and events are retained (days or forever), so new consumers can replay history. The backbone for event-driven architecture, CDC pipelines, and analytics ingestion at millions of events/sec.
- **RabbitMQ** -- a classic broker with rich routing (exchanges, bindings, priorities, per-message ack). Better for task queues and complex routing; lower throughput ceiling than Kafka.
- **SQS** -- fully managed, at-least-once, effectively infinite queue with dead-letter queues built in. The pragmatic choice on AWS when you need task distribution without operating a broker.

**Workers and consumers** pull from queues and do the slow work: sending emails, resizing images, generating PDFs, updating search indexes, recalculating aggregates. They scale horizontally on **queue depth** -- if the backlog grows, add workers.

**Schedulers** (cron services, Airflow, Temporal, cloud schedulers) trigger recurring and time-based work: nightly reports, data compaction, retention cleanup, retry sweeps.

**The rules of async:**
- Consumers must be **idempotent** -- at-least-once delivery means duplicates will happen; use idempotency keys or dedup tables.
- Design **fan-out** explicitly: one \`OrderPlaced\` event feeding inventory, email, analytics, and fraud consumers is the decoupling win -- the producer never knows or cares how many consumers exist.
- Handle **backpressure**: queues absorb bursts, but if producers outrun consumers indefinitely you need throttling, load shedding, or more consumers.
- Route poison messages to a **dead-letter queue** after N failed attempts so one bad message cannot block the partition.

Real-world example: when you place an Amazon order, the synchronous path only validates and persists the order. Payment capture, warehouse allocation, confirmation email, and recommendation updates all flow through events -- which is why the "Place order" button responds in 200ms even though fulfilling the order takes many systems and many seconds.`,

    `## Supporting Services: Observability, Notifications, and Analytics

Supporting services are what separate a diagram that looks right from a system you can actually operate.

**Observability -- the three pillars:**
- **Metrics** (Prometheus + Grafana, Datadog): numeric time series -- request rate, error rate, latency percentiles (p50/p95/p99), queue depth, cache hit ratio. Cheap to store, ideal for dashboards and alerts.
- **Logs** (ELK stack -- Elasticsearch/Logstash/Kibana -- or Loki): structured, searchable event records for debugging specific failures.
- **Traces** (Jaeger, Zipkin, OpenTelemetry): follow one request across every service hop via a propagated **correlation/trace ID**, showing exactly where the latency budget went.

Key insight: alert on p99 latency and error rate, not averages. An average of 50ms can hide a p99 of 4 seconds, and your unhappiest 1% of users are usually your heaviest users.

**Notification service:** a dedicated service that fans a single logical event out to push (APNs/FCM), email (SES, SendGrid), and SMS (Twilio) -- handling templates, user channel preferences, rate limiting ("max 2 marketing pushes/day"), retries, and delivery tracking. Centralizing this prevents every team from re-building half of it.

**Analytics pipeline:** clickstream and business events flow from Kafka into a warehouse (Snowflake, BigQuery, Redshift) or lake (S3 + Spark), deliberately **separated from the operational path** -- an analyst's 10-minute scan query must never compete with production transactions. This is the OLTP vs. OLAP split.

In practice: observability is not optional garnish in an interview. Saying "every service exports metrics to Prometheus, and a trace ID from the gateway follows the request through Kafka consumers" signals you have operated real systems, not just drawn them.`,

    `## Data Flow Design

Data flow diagrams trace how requests and data move through the system, and separating the read path from the write path is the single most useful lens.

**Synchronous request flow (typical web API):**
\`\`\`
Client -> DNS -> CDN -> WAF -> Load Balancer -> API Gateway -> Service -> Cache (hit?) -> DB replica
                                                                       <- Response
\`\`\`

**Asynchronous event flow:**
\`\`\`
Service -> Kafka -> Consumer workers -> DB / Search index / Notification service
                 -> Analytics pipeline -> Data Warehouse
\`\`\`

**Key considerations:**
- **Read path vs. write path** -- reads flow through CDN, cache, and read replicas; writes go to the primary database and then propagate outward (cache invalidation, replication, events).
- **Data transformation** -- where does raw data become the format consumers need? ETL pipelines, materialized views, or application-layer mapping.
- **Fan-out** -- one event may trigger multiple downstream processes (notification, analytics, audit log, search reindex). Design for this explicitly.
- **Backpressure** -- when producers generate data faster than consumers can process, the system needs buffering (queues), throttling, or load shedding strategies.

**Diagramming tips:**
- Show the happy path first, then add failure paths.
- Label arrows with protocol (HTTP, gRPC, TCP) and data format (JSON, Protobuf, Avro).
- Indicate synchronous vs. asynchronous communication visually (solid vs. dashed arrows).
- Mark data stores with their type (SQL, NoSQL, cache, blob).`,

    `## API Contracts

API contracts define how components communicate. Well-designed contracts enable independent development and deployment.

**REST API design:**
- Use resource-oriented URLs (\`/orders/{id}\`, not \`/getOrder\`).
- Use HTTP methods semantically (GET for reads, POST for creation, PUT/PATCH for updates, DELETE for removal).
- Version APIs (\`/v1/orders\`) to allow non-breaking evolution.
- Define clear error responses with status codes, error codes, and human-readable messages.

**gRPC / Protocol Buffers:**
- Strongly typed contracts defined in \`.proto\` files.
- Binary serialization for lower latency and bandwidth.
- Streaming support (server-streaming, client-streaming, bidirectional).
- Better suited for internal service-to-service communication than public APIs.

**Event contracts:**
- Define event schemas (CloudEvents, Avro, JSON Schema) with versioning.
- Include metadata: event type, source, timestamp, correlation ID.
- Schema registry (Confluent Schema Registry) enforces compatibility.

**Contract best practices:**
- Design APIs from the consumer's perspective, not the producer's data model.
- Use pagination for list endpoints (cursor-based preferred over offset-based for large datasets).
- Include idempotency keys for write operations.
- Document contracts with OpenAPI (REST) or protobuf definitions (gRPC).`,

    `## Non-Functional Requirements (NFRs)

NFRs constrain the design space and must be quantified early. Vague requirements like "the system should be fast" are useless.

**Key NFRs and how to quantify them:**

| NFR | Question to ask | Example target |
|-----|----------------|----------------|
| Latency | p50, p95, p99 response time? | p99 < 200ms for reads |
| Throughput | Peak QPS? Growth rate? | 10K reads/sec, 1K writes/sec |
| Availability | Uptime target? | 99.99% (52 min downtime/year) |
| Durability | Data loss tolerance? | Zero data loss (RPO = 0) |
| Scalability | 10x traffic in 2 years? | Horizontal scaling without redesign |
| Consistency | Strong or eventual? | Eventual for reads, strong for writes |
| Security | Auth, encryption, compliance? | TLS everywhere, SOC 2 compliance |

**How NFRs shape design:**
- **High availability** -> multi-region deployment, redundant components, health checks, automatic failover.
- **Low latency** -> caching layers, CDN, read replicas, denormalized data, edge computing.
- **High throughput** -> horizontal scaling, async processing, batch operations, connection pooling.
- **Strong consistency** -> consensus protocols (Raft, Paxos), single-leader replication, serializable transactions.
- **Durability** -> WAL, replication factor >= 3, cross-region backups, point-in-time recovery.`,

    `## Putting It Together: HLD Process

**Step-by-step approach:**

1. **Clarify requirements** -- functional (what the system does) and non-functional (how well it does it). Ask questions until NFRs are quantified.

2. **Identify core entities and operations** -- what are the main data objects? What are the key operations (CRUD, search, aggregate, stream)?

3. **Define the API** -- design the external-facing API contracts. This forces you to think about the system from the user's perspective.

4. **Draw the component diagram** -- place major components (services, databases, caches, queues, CDN) and show how data flows between them.

5. **Choose data stores** -- select databases based on access patterns, consistency needs, and scale requirements. Justify each choice.

6. **Design for scale** -- identify bottlenecks and show how the system scales (horizontal scaling, sharding, caching, async processing).

7. **Address failure modes** -- what happens when each component fails? Show redundancy, failover, retries, and circuit breakers.

8. **Walk through key scenarios** -- trace a few critical user journeys through the system to validate the design handles them correctly.

**Common pitfalls:**
- Jumping to component design without clarifying requirements.
- Over-engineering for scale the system will never reach.
- Ignoring failure modes and assuming 100% availability of every component.
- Designing the data model before understanding access patterns.
- Not quantifying NFRs, leading to vague, unvalidatable designs.`,
  ],
  deepDive: [
    `## Choosing Components from Requirements

Component selection is a derivation from quantified requirements, not a menu of favorite technologies. Three questions drive most of the architecture:

**1. Read-heavy or write-heavy?**
- **Read-heavy** (100:1 or more -- catalogs, feeds, content sites): invest in the read path. CDN for cacheable responses, aggressive Redis caching with high target hit ratios, Postgres read replicas, denormalized/materialized views. The write path can stay simple.
- **Write-heavy** (telemetry, IoT, chat, logging): caching barely helps. Invest in ingestion -- Kafka to buffer bursts, LSM-tree stores like Cassandra that turn random writes into sequential appends, batching, and partitioning by a well-distributed key.
- **Mixed with contention** (ticketing, flash sales, inventory): the hard case. You need queues to serialize contended writes, careful locking or optimistic concurrency, and honest conversations about what happens when two users want the last seat.

**2. What is the latency budget?**
Take the p99 target and spend it hop by hop. If p99 must be 200ms and the user is 80ms of RTT away, your backend has ~120ms: gateway (~5ms) + service (~10ms) + cache (~1ms) or DB (~10-50ms). This arithmetic tells you immediately whether you need a CDN (distance dominates), a cache (DB dominates), or async work moved off-path (business logic dominates).

**3. Strong or eventual consistency -- per data class, not per system?**
- Money, inventory, auth state: strong consistency -- single-writer relational DB, transactions, read-your-writes.
- View counts, likes, feeds, analytics: eventual is fine -- caches, replicas, async aggregation.

For example, "design a URL shortener" quantifies to ~100:1 read-heavy, sub-50ms redirect latency, eventual consistency acceptable -- which derives: cache redirects in Redis and at the CDN, key-value store for mappings, async click analytics through Kafka. The architecture falls out of the numbers.

Common mistake: choosing technology before workload. "We'll use Kafka and Cassandra" is meaningless until you can say what QPS, what read/write ratio, and what consistency each data class needs.`,

    `## The Scaling Evolution: One Server to Planet Scale

Every large architecture is a single server that broke repeatedly, and knowing what breaks at each order of magnitude tells you exactly when each component earns its place.

**~1K users -- one box.** App and Postgres on a single server. Nothing is wrong with this; most systems should start here.

**~10K users -- separate and cache.** The DB competes with the app for CPU/RAM: move Postgres to its own machine. Repeated identical queries dominate: add Redis. Static assets waste app bandwidth: put a CDN in front.

**~100K users -- go horizontal.** One app server saturates and is a single point of failure: add a load balancer and multiple app instances. This forces **statelessness** -- sessions move to Redis. The DB read load grows: add **read replicas** and accept replication lag.

**~1M users -- decouple writes and split hot paths.** Synchronous work (emails, image processing, index updates) makes requests slow and fragile: introduce Kafka/SQS and worker fleets. Full-text search queries crush Postgres: sync data into Elasticsearch. Media bloats the DB: move blobs to S3 + CDN. The monolith's deploy-everything-together pain may justify splitting the busiest services out.

**~10M users -- shard and specialize.** The write primary becomes the bottleneck no replica can fix: **shard** the relational data or move write-heavy tables to Cassandra/DynamoDB. Hot keys emerge in the cache: replicate them. Cross-shard queries and transactions get redesigned as denormalized views and sagas.

**~100M+ users -- multi-region.** A single region is now both a latency floor (speed of light) and an availability ceiling: deploy to multiple regions with geo-DNS, replicate data cross-region, and confront the consistency trade-offs directly (active-passive vs. active-active, conflict resolution).

Key insight: the order rarely changes -- cache before replicas, replicas before sharding, queues before microservices, and sharding only when a beefy primary plus replicas truly cannot cope. Each step is 10x more operational complexity than the previous, so take it only when forced.

Warning: skipping steps is how startups die of complexity. A team of five running sharded multi-region Cassandra for 10K users is paying planet-scale operational tax on village-scale traffic.`,

    `## Common HLD Mistakes

Most failed system designs fail the same few ways, and reviewing this list before finalizing any design catches the majority of problems.

**Requirements and estimation mistakes:**
- **Designing before quantifying.** Without QPS, storage, and latency numbers, every component choice is unjustifiable. Ten minutes of arithmetic ("500M DAU x 2 posts = ~12K writes/sec") changes the entire design.
- **Over-engineering.** Sharded databases and 15 microservices for a system whose numbers fit one Postgres with a replica. State the simple answer first, then say what would trigger each escalation.
- **Uniform-traffic assumptions.** Real traffic is skewed: 1% of keys take 90% of reads (hot keys), and peak is 3-10x average. Design for the skew and the peak, not the mean.

**Architecture mistakes:**
- **Hidden single points of failure.** One Redis node, one Kafka broker, one NAT gateway, one API gateway instance. Walk the diagram asking "what if THIS box dies?" for every box.
- **Ignoring the write path of caches.** Everyone draws the cache read; few explain invalidation, stampede protection, or what happens when cache and DB disagree.
- **Synchronous chains.** Service A calls B calls C calls D synchronously: availability multiplies down (0.99^4 ≈ 0.96) and latency adds up. Break chains with events wherever the response does not need the result.
- **Two sources of truth.** Writing "to the cache and the DB" or "to Postgres and Elasticsearch" as parallel primaries. One owner per datum; everything else is derived and rebuildable.

**Operational mistakes:**
- **No observability story.** A design with no metrics, alerts, or trace propagation cannot be operated or debugged.
- **No degradation plan.** What does the product do when recommendations, search, or the cache is down? "Serve the default list / stale data" beats "the page errors."
- **Unbounded queues and retries.** Retries without backoff and jitter create retry storms; queues without consumer scaling or dead-letter handling melt down silently until they fail loudly.

In practice: the strongest habit is the failure walk-through -- after drawing the architecture, kill each component out loud and narrate the blast radius and recovery. It converts a static diagram into a defensible design.`,

    `## Distributed Caching Strategies

**Caching** is deceptively simple at a single-node level but becomes a *critical architectural concern* at scale. There are several **cache topology** options, each with distinct trade-offs:

- **Local in-process cache** (e.g., \`Map\` or \`LRU\` in application memory): *Zero network overhead*, but each instance has its own copy, leading to **inconsistency** across nodes and **wasted memory**. Best for *immutable* or *rarely changing* reference data.
- **Distributed cache** (e.g., \`Redis Cluster\`, \`Memcached\`): A shared cache layer all instances talk to. Provides **consistency** across nodes but adds *network latency* (~0.5-1ms per call). Supports **eviction policies** like \`LRU\`, \`LFU\`, and \`TTL\`-based expiry.
- **Two-tier cache**: Combine a *local L1 cache* (short TTL, small size) with a *distributed L2 cache* (longer TTL, larger). Reads check L1 first, then L2, then the database. This **minimizes network calls** while maintaining reasonable consistency.

**Cache invalidation** remains one of the hardest problems. The three main strategies are:
- **TTL-based expiry**: Simple but allows **stale reads** up to the TTL duration. Good for data where *staleness is tolerable* (product catalog, user profiles).
- **Event-driven invalidation**: Publish a \`cache.invalidate\` event when data changes. More complex but ensures **near-real-time freshness**. Requires a *reliable event bus*.
- **Write-through with versioning**: Every write updates both the cache and the database. Use a **version counter** or **timestamp** to detect and resolve conflicts.`,

    `## Database Sharding and Partitioning

When a *single database instance* cannot handle the required **throughput** or **storage**, you must distribute data across multiple nodes. This is **sharding** (horizontal partitioning).

**Sharding strategies:**
- **Range-based sharding**: Partition by a range of a key (e.g., users A-M on shard 1, N-Z on shard 2). *Simple to implement* but prone to **hotspots** if data distribution is uneven.
- **Hash-based sharding**: Apply a \`hash(key) % num_shards\` function. Provides **uniform distribution** but makes *range queries across shards* expensive. **Consistent hashing** (used by DynamoDB, Cassandra) minimizes data movement when adding/removing nodes.
- **Directory-based sharding**: A lookup service maps keys to shards. *Most flexible* but the directory becomes a **single point of failure** and a potential *bottleneck*.

**Cross-shard challenges:**
- **Joins**: Cannot efficiently join data across shards. Denormalize data or perform *application-level joins*.
- **Transactions**: Distributed transactions (2PC) are *slow and complex*. Prefer **saga patterns** or design schemas to keep related data on the same shard.
- **Rebalancing**: Adding shards requires **data migration**. Consistent hashing minimizes this; range-based may require *splitting and moving entire ranges*.
- **Global secondary indexes**: Either maintain a *local index per shard* (scatter-gather queries) or a **global index** (write amplification). Neither is free.`,

    `## Event-Driven Architecture (EDA)

**Event-driven architecture** decouples producers from consumers by communicating through *events* rather than direct API calls. This enables **independent scaling**, **fault isolation**, and **temporal decoupling**.

**Core patterns:**
- **Event notification**: A service publishes a *lightweight event* (e.g., \`OrderPlaced { orderId }\`). Consumers react by fetching details themselves. **Low coupling** but adds *chattiness*.
- **Event-carried state transfer**: Events carry the *full payload* (e.g., \`OrderPlaced { orderId, items, total, customer }\`). Consumers have all data locally. **Reduces calls** but increases *event size* and coupling to the schema.
- **Event sourcing**: Store the *sequence of events* as the source of truth rather than current state. Current state is derived by **replaying events**. Enables *audit trails*, *temporal queries*, and *debugging*. Adds complexity for read models (use **CQRS**).

**Technology choices:**
- \`Apache Kafka\`: **Durable, ordered, replayable** log. Best for high-throughput event streaming. Supports \`consumer groups\` for parallel processing.
- \`Amazon SQS\`: **Managed queue** with at-least-once delivery. Simpler to operate, no ordering guarantees (unless using FIFO queues). Good for *task distribution*.
- \`RabbitMQ\`: **Flexible routing** with exchanges and bindings. Supports *complex routing topologies*. Lower throughput than Kafka but richer messaging semantics.

**Idempotency** is *critical* in EDA: consumers must handle **duplicate events** gracefully using idempotency keys or deduplication logic.`,

    `## Service Mesh and API Gateway Patterns

As the number of **microservices** grows, managing *service-to-service communication* becomes a significant challenge. Two architectural patterns address this:

**API Gateway** sits at the *edge* and handles **north-south traffic** (client-to-service). Responsibilities include:
- **Request routing** and protocol translation (REST to gRPC)
- **Authentication and authorization** (JWT validation, API key checks)
- **Rate limiting** and *throttling* per client
- **Response aggregation** (BFF -- Backend for Frontend pattern)
- **SSL termination** and *request/response transformation*

Popular implementations: \`Kong\`, \`AWS API Gateway\`, \`Envoy\` (as edge proxy).

**Service Mesh** handles **east-west traffic** (service-to-service) using a *sidecar proxy* deployed alongside each service. The mesh provides:
- **Mutual TLS** (mTLS) for *encrypted, authenticated* inter-service communication
- **Traffic management**: canary deployments, A/B routing, circuit breaking, retries with *exponential backoff*
- **Observability**: distributed tracing, metrics collection, access logging -- *without code changes*
- **Policy enforcement**: rate limits, access control between services

Popular implementations: \`Istio\` (with Envoy sidecars), \`Linkerd\`, \`AWS App Mesh\`.

The **trade-off**: a service mesh adds *operational complexity* and *resource overhead* (each sidecar consumes CPU/memory). For fewer than ~10 services, the overhead may not be justified. For large-scale microservice deployments, it becomes *essential infrastructure*.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Cache-aside pattern with TTL and error handling",
      source: `import Redis from 'ioredis';

const redis = new Redis({ host: 'cache.internal', port: 6379 });
const DEFAULT_TTL = 300; // 5 minutes

interface CacheOptions {
  ttl?: number;       // seconds
  prefix?: string;
}

/**
 * Cache-aside (lazy-loading) wrapper.
 * Checks cache first; on miss, calls the loader,
 * stores the result, and returns it.
 */
async function cacheAside<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, prefix = 'app' } = options;
  const cacheKey = \`\${prefix}:\${key}\`;

  // 1. Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    // Cache failure should NOT block the request
    console.warn(\`Cache read failed for \${cacheKey}:\`, err);
  }

  // 2. Cache miss -- load from source
  const data = await loader();

  // 3. Store in cache (fire-and-forget)
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  } catch (err) {
    console.warn(\`Cache write failed for \${cacheKey}:\`, err);
  }

  return data;
}

// Usage example
async function getUserProfile(userId: string) {
  return cacheAside(
    \`user:\${userId}\`,
    () => db.query('SELECT * FROM users WHERE id = $1', [userId]),
    { ttl: 600, prefix: 'profiles' }
  );
}`,
    },
    {
      language: "typescript",
      caption: "Circuit breaker pattern for downstream service calls",
      source: `enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing -- reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

interface CircuitBreakerConfig {
  failureThreshold: number;   // failures before opening
  recoveryTimeout: number;    // ms before trying half-open
  successThreshold: number;   // successes in half-open to close
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if recovery timeout has elapsed
      if (Date.now() - this.lastFailureTime >= this.config.recoveryTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log(\`[CircuitBreaker:\${this.name}] HALF_OPEN -- testing\`);
      } else {
        throw new Error(\`Circuit \${this.name} is OPEN -- request rejected\`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        console.log(\`[CircuitBreaker:\${this.name}] CLOSED -- recovered\`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log(\`[CircuitBreaker:\${this.name}] OPEN -- too many failures\`);
    }
  }
}

// Usage
const paymentBreaker = new CircuitBreaker('payment-service', {
  failureThreshold: 5,
  recoveryTimeout: 30_000,  // 30 seconds
  successThreshold: 3
});

async function processPayment(orderId: string, amount: number) {
  return paymentBreaker.execute(() =>
    fetch('https://payment.internal/charge', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount })
    }).then(r => {
      if (!r.ok) throw new Error(\`Payment failed: \${r.status}\`);
      return r.json();
    })
  );
}`,
    },
    {
      language: "typescript",
      caption: "Simple token-bucket rate limiter middleware (Express)",
      source: `import { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxTokens: number,    // bucket capacity
    private readonly refillRate: number,    // tokens per second
    private readonly keyExtractor: (req: Request) => string = (req) =>
      req.ip ?? 'unknown'
  ) {}

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.keyExtractor(req);
      const now = Date.now();
      let bucket = this.buckets.get(key);

      if (!bucket) {
        bucket = { tokens: this.maxTokens, lastRefill: now };
        this.buckets.set(key, bucket);
      }

      // Refill tokens based on elapsed time
      const elapsed = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(
        this.maxTokens,
        bucket.tokens + elapsed * this.refillRate
      );
      bucket.lastRefill = now;

      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
        next();
      } else {
        const retryAfter = Math.ceil((1 - bucket.tokens) / this.refillRate);
        res.setHeader('Retry-After', retryAfter);
        res.status(429).json({
          error: 'Too Many Requests',
          retryAfter
        });
      }
    };
  }
}

// Usage: 100 requests max, refill 10/sec per IP
const limiter = new TokenBucketRateLimiter(100, 10);
app.use('/api/', limiter.middleware());`,
    },
  ],
  diagrams: [
    {
      title: "Canonical Modern Web Architecture",
      kind: "architecture",
      caption:
        "The full component landscape of a modern large-scale web system: edge, gateway, stateless application tier, cache, async backbone, polyglot data layer, and supporting services. Numbered edges (1-8) trace a single primary read request from client to database; unnumbered edges are parallel routes or background work. Dashed arrows indicate telemetry to observability.",
      mermaid: `graph TB
    Client["Client<br/>Web / Mobile"]

    subgraph EdgeLayer["Edge Layer"]
        DNS["DNS<br/>Route 53 / Cloudflare"]
        CDN["CDN<br/>CloudFront / Akamai"]
        WAF["WAF<br/>DDoS + Attack Filtering"]
    end

    subgraph GatewayLayer["Gateway Layer"]
        LB["Load Balancer<br/>ALB / Nginx / Envoy"]
        GW["API Gateway<br/>Auth + Rate Limiting + Routing"]
    end

    subgraph AppLayer["Application Layer - stateless"]
        SVCA["Service A<br/>e.g. Product"]
        SVCB["Service B<br/>e.g. Order"]
        WSS["WebSocket Service<br/>realtime push"]
    end

    subgraph CacheLayer["Caching Layer"]
        REDIS["Redis Cluster<br/>cache + sessions + locks"]
    end

    subgraph AsyncLayer["Async Backbone"]
        KAFKA["Kafka<br/>event log"]
        WRK["Consumers / Workers<br/>email, resize, reindex"]
        SCHED["Scheduler<br/>cron / Temporal"]
    end

    subgraph DataLayer["Data Layer"]
        PG["Postgres Primary<br/>writes"]
        PGR["Read Replicas<br/>reads"]
        CAS["Cassandra<br/>write-heavy NoSQL"]
        ES["Elasticsearch<br/>full-text search"]
        S3["S3 Object Storage<br/>media + backups"]
    end

    subgraph Supporting["Supporting Services"]
        NOTIF["Notification Service<br/>push / email / SMS"]
        ANA["Analytics Pipeline<br/>warehouse / lake"]
        OBS["Observability<br/>Prometheus + ELK + Jaeger"]
    end

    Client -->|"1. resolve domain"| DNS
    DNS -->|"2. route to edge"| CDN
    CDN -->|"3. cache miss"| WAF
    WAF -->|"4. filtered traffic"| LB
    LB -->|"5. forward"| GW
    GW -->|"6. route request"| SVCA
    GW --> SVCB
    GW --> WSS

    SVCA -->|"7. check cache"| REDIS
    SVCB --> REDIS
    SVCA -->|"8. cache miss: read"| PGR
    SVCB --> PG
    PG --> PGR
    SVCB --> CAS
    SVCA --> ES
    SVCA --> S3
    CDN --> S3

    SVCB --> KAFKA
    SCHED --> WRK
    KAFKA --> WRK
    KAFKA --> ANA
    WRK --> PG
    WRK --> ES
    WRK --> NOTIF
    NOTIF --> WSS

    SVCA -.-> OBS
    SVCB -.-> OBS
    WRK -.-> OBS
    GW -.-> OBS`,
    },
    {
      title: "CAP Theorem Trade-offs",
      kind: "mindmap",
      caption: "CAP theorem properties and how distributed databases make trade-offs.",
      mermaid: `mindmap
  root((CAP Theorem))
    Consistency
      All nodes same data
      Linearizability
      Examples: HBase Zookeeper
    Availability
      Every request responds
      May return stale data
      Examples: Cassandra CouchDB
    Partition Tolerance
      Handles network splits
      Required in practice
    CP Systems
      Sacrifice availability
    AP Systems
      Sacrifice consistency`,
    },
    {
      title: "Cache-Aside Read Pattern",
      kind: "flow",
      caption: "Cache-aside pattern for handling reads in a high-traffic system.",
      mermaid: `flowchart TD
    A[Client Read Request] --> B[Check Cache]
    B --> C{Cache hit?}
    C -- Yes --> D[Return cached data]
    C -- No --> E[Query Database]
    E --> F[Store in Cache with TTL]
    F --> G[Return data to client]
    H[Write Request] --> I[Update Database]
    I --> J[Invalidate or update cache entry]`,
    },
    {
      title: "System Design Interview Process",
      kind: "flow",
      caption: "Step-by-step approach for tackling a high-level system design problem.",
      mermaid: `flowchart TD
    A[Clarify Requirements] --> B[Estimate Scale QPS Storage]
    B --> C[Define APIs]
    C --> D[Data Model and Storage Choice]
    D --> E[High-Level Architecture]
    E --> F[Deep Dive into Components]
    F --> G{Bottlenecks found?}
    G -- Yes --> H[Add Caching Layer]
    H --> I[Add Sharding or Replication]
    I --> J[Add CDN and Load Balancing]
    J --> G
    G -- No --> K[Finalize Architecture]`,
    },
  ],
  animations: [
    {
      title: "The first ten minutes",
      steps: [
        {
          label: "Functional requirements",
          detail: "Agree the three or four core features. Scope aggressively and say what's out.",
        },
        {
          label: "Non-functional",
          detail: "Scale, latency, consistency, availability. These decide the architecture; the features don't.",
        },
        {
          label: "Estimate",
          detail: "DAU → requests/sec → peak → storage per year. Round to powers of ten.",
        },
        {
          label: "Draw the conclusion",
          detail: "'That's ~300 GB/year and 500 req/s peak, so this fits one database with a read replica — I won't shard.'",
        },
        {
          label: "API sketch",
          detail: "A handful of endpoints. This forces precision about what the system does.",
        },
        {
          label: "Now draw",
          detail: "Only now does the box diagram mean anything, because every box is justified by something above.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Monolith", "Microservices", "Serverless"],
    rows: [
      ["**Deployment**", "Single deployable unit", "Independent per-service deployment", "Per-function deployment"],
      ["**Scaling**", "Scale entire application vertically/horizontally", "Scale individual services independently", "Auto-scales per invocation, zero to infinity"],
      ["**Complexity**", "Low initial, grows with codebase size", "High operational overhead from day one", "Low operational, high architectural complexity"],
      ["**Latency**", "In-process calls (*lowest*)", "Network calls between services (~1-10ms)", "Cold starts possible (~100ms-2s)"],
      ["**Team Structure**", "Entire team works on one codebase", "Small teams own individual services", "Functions may lack clear ownership"],
      ["**Data Management**", "Single shared database", "Database per service (*data isolation*)", "Typically stateless, external state stores"],
      ["**Debugging**", "Simple stack traces, single process", "Requires *distributed tracing* (Jaeger, Zipkin)", "Requires cloud-specific logging and tracing"],
      ["**Infrastructure Needs**", "One LB, one DB, minimal moving parts", "API gateway, service discovery, mesh, per-service stores", "Managed gateway, queues, and stores from the cloud provider"],
      ["**Best For**", "Small teams, early-stage products, well-understood domains", "Large orgs, independent scaling needs, polyglot tech", "Event-driven workloads, variable traffic, rapid prototyping"],
    ],
  },
  exercises: [
    "**Design a URL Shortener**: Define the HLD for a service that creates short URLs and redirects users. Address: *key generation* (base62 vs. MD5), read vs. write ratio (~100:1), **caching strategy** for hot URLs, database choice for `billions of records`, and how to handle `analytics tracking` for click counts.",
    "**Design a Notification System**: Architect a system that sends **push notifications**, *emails*, and *SMS* at scale. Consider: `message queue` for decoupling, priority levels, template management, **delivery guarantees** (at-least-once), rate limiting per user, and handling *device token management*.",
    "**Design a File Storage Service** (like Dropbox): Define components for *file upload/download*, **chunked uploads** for large files, `deduplication` using content hashing, metadata storage vs. blob storage separation, **sync conflict resolution**, and sharing/permission management.",
    "**Design a Real-Time Chat System**: Cover *WebSocket* vs. **SSE** vs. long polling, message storage (hot vs. cold), **presence tracking** (online/offline/typing), group chat fan-out, `end-to-end encryption` considerations, and message delivery status (*sent/delivered/read*).",
    "**Estimate and Design for Scale**: Given a social media app with *500M DAU*, each user posts 2 times/day and reads 100 posts/day: Calculate **write QPS**, read QPS, daily storage growth, and `cache memory` needed. Then sketch the HLD that handles these numbers.",
  ],
  cheatSheet: [
    "**HLD Process**: Requirements -> Estimation -> Components -> Data Flow -> Data Stores -> Scale -> Failures -> Walkthrough",
    "**Canonical stack (user to disk)**: DNS -> CDN -> WAF -> Load Balancer -> API Gateway -> Stateless Services -> Redis -> DB primary + replicas / NoSQL / Elasticsearch / S3, with Kafka + workers off the request path",
    "**QPS Formula**: `DAU x actions_per_user / 86400` -- multiply by 2-5x for **peak QPS**",
    "**Cache sizing (80/20 rule)**: Cache *20% of daily unique requests* to serve **80% of traffic**",
    "**Availability math**: 99.9% = 8.7h/year, 99.99% = 52min/year, 99.999% = 5.2min/year",
    "**Latency ladder**: L1 cache ~1ns, RAM ~100ns, Redis over network ~0.5ms, SSD DB query ~5-50ms, cross-region round trip ~100-150ms",
    "**Caching strategies**: *Cache-aside* (app controls), *Write-through* (sync write to both), *Write-behind* (async flush to DB)",
    "**Database selection**: SQL for *ACID, joins, complex queries*; NoSQL for **high write throughput, flexible schema, key-value access**; Elasticsearch for *full-text search*; S3 for **blobs**",
    "**Scaling order**: Cache -> Read replicas -> Async queues -> Sharding -> Multi-region. Each step is ~10x operational complexity; take it only when forced",
    "**Failure handling**: Redundancy + Health checks + **Circuit breakers** + Retries with `exponential backoff` + Graceful degradation",
  ],
  revisionNotes: [
    "**Always start with requirements**: Clarify *functional* (what) and *non-functional* (how well) requirements before touching architecture. Quantify NFRs with specific numbers.",
    "**Back-of-envelope estimation** grounds decisions: Calculate *QPS*, storage, bandwidth, and cache needs. These numbers determine whether you need 1 server or 1000.",
    "**Know the canonical architecture cold**: edge (DNS/CDN/WAF) -> gateway (LB/API gateway) -> stateless services -> Redis -> polyglot data layer (SQL + NoSQL + search + object storage) -> Kafka + workers -> observability. Every HLD answer is a subset of this template with each box justified.",
    "**Each layer shields the one below**: CDN absorbs static reads, cache absorbs hot reads, replicas absorb remaining reads, queues absorb write bursts -- the database should see only what nothing above it could handle.",
    "**Component design** follows SRP: Each component (API gateway, services, databases, caches, queues) has a *single clear responsibility* with well-defined interfaces.",
    "**Data flow** is the backbone: Trace how requests move from client through each component. Separate *read paths* (cache-heavy) from **write paths** (consistency-focused).",
    "**Choose databases by access pattern**, not by popularity: SQL for transactions and complex queries, NoSQL for key-value lookups and horizontal scaling, search engines for full-text search, object storage for blobs. Keep exactly *one source of truth* per datum.",
    "**Design for failure**: Every component *will* fail. Add redundancy, health checks, circuit breakers, retries with backoff, and **graceful degradation** for non-critical features.",
    "**Caching is critical** for read-heavy systems: Understand *cache-aside* vs. *write-through* vs. *write-behind*, and always have a **cache invalidation strategy** (TTL, event-driven, or versioned) plus answers for *hot keys* and *cache stampede*.",
    "**Move slow work off the request path**: anything the user does not need in the response (emails, reindexing, analytics) belongs in Kafka/SQS with idempotent workers.",
  ],
  interviewQA: [
    {
      q: "How do you approach a high-level system design problem?",
      a: "Start by clarifying requirements: functional (features, use cases) and non-functional (latency, throughput, availability, consistency). Quantify NFRs with specific numbers. Then identify core entities and design the API from the user's perspective. Draw a component diagram showing services, data stores, caches, and queues with data flow arrows. Choose data stores based on access patterns. Design for scale by identifying bottlenecks. Finally, address failure modes and walk through key scenarios to validate the design.",
    },
    {
      q: "Walk me through what happens when a user loads a product page on a large e-commerce site.",
      a: "DNS resolves the domain, and static assets (images, JS, CSS) come from the nearest CDN edge -- often 95%+ of bytes never reach the origin. The dynamic API call passes the WAF, hits a load balancer that picks a healthy app instance, and the API gateway validates the JWT and applies rate limits. The stateless product service checks Redis; at a ~98% hit ratio most requests return in about a millisecond, and misses fall through to a Postgres read replica, repopulate the cache with a TTL, and return. Asynchronously the service emits a ProductViewed event to Kafka for view counters, analytics, and recommendations -- none of which blocks the response. Every hop exports metrics and propagates a trace ID. The takeaway to state explicitly: each layer absorbs traffic so at 10K page views/sec the database might see only ~200 queries/sec.",
    },
    {
      q: "How do you decide between a SQL and NoSQL database in an HLD?",
      a: "Consider access patterns, consistency needs, and scale. SQL databases excel when you need strong consistency, complex queries with joins, ACID transactions, and a well-defined schema. NoSQL is better for high write throughput, flexible schemas, horizontal scaling, and access patterns that are key-value, document, or wide-column oriented. For example, use PostgreSQL for an order management system needing transactions, but DynamoDB for a session store needing low-latency key lookups at massive scale. In practice large systems are polyglot: Postgres for core records, Cassandra or DynamoDB for write-heavy data, Elasticsearch for search, S3 for blobs -- with exactly one source of truth per piece of data.",
    },
    {
      q: "When would you introduce Kafka into a design, and what problems does it create?",
      a: "Introduce Kafka when you need to decouple producers from consumers, absorb write bursts, fan one event out to many independent consumers (order placed -> inventory, email, analytics, fraud), or feed streaming/analytics pipelines -- generally once synchronous processing makes requests slow or fragile. It creates real costs: consumers see at-least-once delivery so they must be idempotent; ordering is only guaranteed per partition, so the partition key must match your ordering needs; the pipeline is eventually consistent, so downstream views lag; and you must handle poison messages with dead-letter queues and monitor consumer lag. If you only need simple task distribution without replay or fan-out, a managed queue like SQS is operationally cheaper.",
    },
    {
      q: "What is the difference between a load balancer and an API gateway?",
      a: "A load balancer solves traffic distribution: it spreads requests across healthy instances (L4 by IP/port for raw speed, L7 by HTTP path/host for smart routing), runs health checks, and terminates TLS -- examples are Nginx, HAProxy, Envoy, and AWS ALB/NLB. An API gateway solves API management: authentication and JWT validation, per-client rate limiting and quotas, request routing and versioning, protocol translation, and response aggregation (BFF) -- examples are Kong, Zuul, and cloud API gateways. In practice they are complementary and layered: LB in front for distribution, gateway behind it for policy. Both must themselves be horizontally scaled, since a single gateway instance is a single point of failure at the front door.",
    },
    {
      q: "What role does caching play in high-level design?",
      a: "Caching reduces database load and improves read latency by storing frequently accessed data in memory (Redis, Memcached). In HLD, consider cache-aside (application checks cache before database), write-through (writes update cache and database), and write-behind (writes update cache, async flush to database). Key decisions: what to cache (hot data), TTL strategy, cache invalidation approach, and cache size. Hit ratio is the metric that matters -- going from 90% to 99% cuts database reads 10x. Also address the failure modes: hot keys (replicate the key or add an L1 cache) and cache stampede (lock-and-recompute or jittered TTLs). Caching introduces eventual consistency -- the cache may serve stale data until invalidated or expired.",
    },
    {
      q: "How do you design for high availability in a system?",
      a: "Deploy across multiple availability zones or regions. Use load balancers to distribute traffic and detect unhealthy instances. Replicate databases with automatic failover (primary-replica). Use redundant message queues and caches. Implement health checks and circuit breakers. Design for graceful degradation -- if a non-critical service fails, the core functionality continues. Beware synchronous call chains: four services at 99% each multiply to roughly 96% availability, so break chains with async events where possible. Define an availability target (e.g., 99.99%) and calculate the error budget to guide design decisions.",
    },
  ],
  followUps: [
    "Where does your design break first as traffic grows tenfold?",
    "What did you deliberately leave out, and why?",
    "How do you decide what to scope out in the first five minutes?",
    "Pick any box in your diagram: what happens to users when it dies, and how does the system recover?",
    "Which parts of your design are eventually consistent, and how stale can each get before the product breaks?",
  ],
  mcqs: [
    {
      q: "What is the first step in a high-level system design?",
      options: [
        "Drawing the component architecture diagram",
        "Choosing the database technology",
        "Clarifying functional and non-functional requirements",
        "Designing the API endpoints",
      ],
      answerIndex: 2,
      explanation:
        "Requirements clarification must come first. Without understanding what the system does (functional) and how well it must do it (NFRs like latency, throughput, availability), component and technology choices cannot be justified.",
    },
    {
      q: "Which caching strategy has the application check the cache before querying the database?",
      options: [
        "Write-through caching",
        "Write-behind caching",
        "Cache-aside (lazy loading)",
        "Read-through caching",
      ],
      answerIndex: 2,
      explanation:
        "Cache-aside: the application first checks the cache. On a miss, it queries the database, stores the result in the cache, and returns it. The application controls both reads and writes to the cache explicitly.",
    },
    {
      q: "What does 99.99% availability mean in terms of annual downtime?",
      options: [
        "Approximately 8.7 hours per year",
        "Approximately 52 minutes per year",
        "Approximately 5.2 minutes per year",
        "Approximately 8.7 minutes per year",
      ],
      answerIndex: 1,
      explanation:
        "99.99% availability allows 0.01% downtime. In a year (525,600 minutes), that is approximately 52.6 minutes of total downtime. This is often called 'four nines' availability.",
    },
    {
      q: "Why is cursor-based pagination preferred over offset-based for large datasets?",
      options: [
        "Cursor-based pagination uses less memory on the client",
        "Offset-based pagination becomes slow on large datasets because the database must scan and skip rows",
        "Cursor-based pagination does not require a database index",
        "Offset-based pagination cannot handle concurrent inserts",
      ],
      answerIndex: 1,
      explanation:
        "Offset-based pagination (LIMIT/OFFSET) requires the database to scan and discard all rows before the offset, becoming increasingly slow as the offset grows. Cursor-based pagination uses an indexed column value as the starting point, maintaining consistent performance regardless of position in the dataset.",
    },
  ],
  flashcards: [
    {
      front: "What are the key NFRs to quantify in an HLD?",
      back: "Latency (p50/p95/p99), throughput (peak QPS), availability (nines), durability (RPO/RTO), scalability (growth factor), consistency model, and security/compliance requirements. Always ask for specific numbers.",
    },
    {
      front: "Layers of the canonical modern web architecture (user to disk)",
      back: "Edge (DNS, CDN, WAF) -> Gateway (load balancer, API gateway) -> Stateless application services + realtime service -> Cache (Redis) -> Data (SQL primary + replicas, NoSQL, Elasticsearch, S3) -> Async (Kafka, workers, schedulers) -> Supporting (notifications, analytics, observability).",
    },
    {
      front: "Load balancer vs. API gateway",
      back: "Load balancer distributes traffic across healthy instances (L4 by IP/port, L7 by HTTP; Nginx, HAProxy, Envoy, ALB/NLB). API gateway manages APIs: auth, rate limiting, routing/versioning, protocol translation, response aggregation (Kong, Zuul, cloud gateways). Layered together: LB for distribution, gateway for policy.",
    },
    {
      front: "Cache-aside vs. Write-through vs. Write-behind",
      back: "Cache-aside: app checks cache, on miss reads DB and populates cache. Write-through: writes go to cache AND DB synchronously. Write-behind: writes go to cache, async flush to DB later (risk of data loss). Each has different consistency and performance trade-offs.",
    },
    {
      front: "Hot key problem and mitigations",
      back: "One cache key (celebrity profile, viral post) gets a disproportionate share of traffic and saturates its cache shard. Mitigations: replicate the key across shards with suffixes, add a small in-process L1 cache, or push it to the CDN.",
    },
    {
      front: "What is backpressure?",
      back: "When producers generate data faster than consumers can process it. Solutions: buffering (queues), throttling (rate limiting producers), load shedding (dropping low-priority requests), and scaling consumers horizontally.",
    },
    {
      front: "Kafka vs. RabbitMQ vs. SQS",
      back: "Kafka: durable partitioned replayable log, consumer groups, highest throughput -- event streaming and fan-out. RabbitMQ: rich routing (exchanges/bindings), per-message acks -- task queues with complex routing. SQS: fully managed, at-least-once, DLQs built in -- simple task distribution on AWS with zero ops.",
    },
    {
      front: "REST API versioning approaches",
      back: "URL path (/v1/orders) -- most common, explicit. Header (Accept: application/vnd.api.v1+json) -- cleaner URLs but less discoverable. Query param (?version=1) -- easy but clutters URLs. URL path is preferred for simplicity.",
    },
    {
      front: "Four nines (99.99%) availability",
      back: "Approximately 52 minutes of downtime per year, or about 4.3 minutes per month. Requires multi-AZ deployment, redundant components, automated failover, and health checking. Each additional nine is exponentially harder to achieve.",
    },
    {
      front: "CQRS in HLD",
      back: "Command Query Responsibility Segregation separates read and write paths. Writes go to a primary store optimized for consistency. Reads go to denormalized read models optimized for query performance. Connected via events. Adds complexity but enables independent scaling.",
    },
    {
      front: "The scaling order (and why it matters)",
      back: "Cache -> read replicas -> async queues/workers -> sharding -> multi-region. Each step adds roughly 10x operational complexity, so take it only when the previous step can no longer cope. Skipping ahead means paying planet-scale ops tax on small-scale traffic.",
    },
    {
      front: "Common HLD pitfalls",
      back: "1. Skipping requirements clarification. 2. Over-engineering for unrealistic scale. 3. Ignoring failure modes and hidden SPOFs. 4. Designing data models before understanding access patterns. 5. Two sources of truth for the same data. 6. Not quantifying NFRs with specific numbers.",
    },
  ],
  resources: [
    {
      label: "System Design Interview — Alex Xu", url: "https://bytebytego.com/",
      kind: "book",
    },
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "High-Level Design (HLD)",
      definition:
        "An architectural blueprint defining major system components, their responsibilities, interactions, data flow, and key technology choices without specifying implementation details.",
    },
    {
      term: "Non-Functional Requirement (NFR)",
      definition:
        "A system quality attribute (latency, availability, scalability, security) that constrains how the system performs rather than what it does.",
    },
    {
      term: "API Gateway",
      definition:
        "An entry point for client requests that handles routing, authentication, rate limiting, SSL termination, and request/response transformation before forwarding to backend services. Examples: Kong, Zuul, AWS API Gateway.",
    },
    {
      term: "CDN (Content Delivery Network)",
      definition:
        "A geographically distributed network of servers that caches content close to users, reducing latency for static assets and cacheable API responses. Examples: CloudFront, Cloudflare, Akamai.",
    },
    {
      term: "WAF (Web Application Firewall)",
      definition:
        "An edge component that inspects HTTP traffic and filters attacks -- SQL injection, XSS, bots, volumetric DDoS -- before they reach and consume origin capacity.",
    },
    {
      term: "Read replica",
      definition:
        "A copy of the primary database kept up to date via replication (typically by streaming the WAL) and used to serve read traffic. Replication is usually asynchronous, so replicas may lag the primary by milliseconds to seconds.",
    },
    {
      term: "Write-ahead log (WAL)",
      definition:
        "An append-only log in which a database records every change before applying it to data files, guaranteeing durability and crash recovery. Also the stream that feeds replication and change-data-capture pipelines.",
    },
    {
      term: "Fan-out",
      definition:
        "One event or write triggering multiple independent downstream actions -- e.g., an OrderPlaced event consumed by inventory, email, analytics, and fraud services. Message logs like Kafka make fan-out cheap because consumers read independently.",
    },
    {
      term: "Hot key",
      definition:
        "A single cache or database key receiving a disproportionate share of traffic (a celebrity profile, a viral post), saturating the one shard that owns it. Mitigated by key replication, local L1 caches, or CDN offload.",
    },
    {
      term: "Cache stampede",
      definition:
        "A surge of simultaneous cache misses -- typically when a popular key expires -- that floods the database with duplicate queries. Prevented with lock-and-recompute, stale-while-revalidate, or jittered TTLs.",
    },
    {
      term: "Object storage",
      definition:
        "A flat, HTTP-addressed store for immutable blobs (images, video, backups) offering effectively unlimited capacity and very high durability at low cost, but high latency and no queries. Examples: S3, GCS, Azure Blob.",
    },
    {
      term: "Dead-letter queue (DLQ)",
      definition:
        "A holding queue for messages that repeatedly fail processing, keeping poison messages from blocking a queue or partition while preserving them for inspection and replay.",
    },
    {
      term: "Backpressure",
      definition:
        "A condition where producers generate data faster than consumers can process it, requiring buffering, throttling, or load shedding to prevent system overload.",
    },
    {
      term: "RPO (Recovery Point Objective)",
      definition:
        "The maximum acceptable amount of data loss measured in time. RPO = 0 means no data loss is acceptable; RPO = 1 hour means up to one hour of data can be lost.",
    },
    {
      term: "RTO (Recovery Time Objective)",
      definition:
        "The maximum acceptable time to restore service after a failure. RTO = 5 minutes means the system must be back online within 5 minutes of an outage.",
    },
  ],
};
