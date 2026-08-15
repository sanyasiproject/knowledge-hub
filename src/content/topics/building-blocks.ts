import type { TopicContent } from "../types";

export const buildingBlocks: TopicContent = {
  quickSummary: [
    "Real system design is done from a catalog of well over 100 proven technologies — load balancers, caches, databases, queues, search engines, schedulers, observability stacks — and the core skill is picking the right tool for each need, not memorizing one architecture. This page is that catalog: category by category, the leading tools and how to choose between them.",
    "Load balancers distribute traffic across multiple servers to ensure no single server is overwhelmed. They operate at Layer 4 (TCP/UDP, fast but limited) or Layer 7 (HTTP, enables content-based routing). Common algorithms: round-robin, least connections, consistent hashing. Leading tools: Nginx, HAProxy, Envoy, AWS ALB/NLB.",
    "Caches store frequently accessed data in fast storage (memory) to reduce latency and database load. Redis and Memcached are the most common distributed caches; CloudFront, Cloudflare, Akamai, and Fastly cache at the edge. Key concerns: cache invalidation, eviction policies (LRU, LFU), and cache stampede prevention.",
    "Message queues and event streams decouple producers from consumers, enabling asynchronous processing, load leveling, and fault tolerance. Key choices: RabbitMQ (traditional broker), Kafka (distributed log), SQS (managed queue), Pulsar and NATS for specialized needs.",
    "Storage is polyglot: PostgreSQL/MySQL for relational data, MongoDB/DynamoDB/Cassandra for NoSQL patterns, Elasticsearch for search, S3 for objects, InfluxDB for time-series. Almost every large system combines several — each chosen for its access pattern.",
  ],
  detailed: [
    "## The Catalog Mindset: Why There Are 100+ Tools\n\nSystem design is component selection, not invention. Every mature system is assembled from a shared industry catalog: something terminates traffic, something caches, something stores durable state, something moves messages, something processes data, something watches it all. Each category has 3-6 leading technologies that dominate real production systems and interviews, and each exists because it makes a different trade-off — throughput vs. flexibility, consistency vs. availability, managed convenience vs. control.\n\nHow to use this catalog:\n- **Start from the need, not the tool.** \"I need sub-millisecond reads of hot data\" leads to Redis; \"I heard Kafka is cool\" leads to trouble.\n- **Know the default per category.** Interviewers expect a sensible first pick (PostgreSQL, Redis, Kafka, S3, Kubernetes) and a reason you would deviate.\n- **Know one alternative and when it wins.** Memcached over Redis for pure cache simplicity; RabbitMQ over Kafka for task routing.\n\nKey insight: Naming a specific tool with a specific reason (\"Redis with LRU eviction, cache-aside, 5-minute TTL\") scores far higher than a generic box labeled \"cache\".\n\nCommon mistake: Treating the catalog as a checklist and adding every category to every design. Each component adds an operational burden, a failure mode, and a consistency boundary — earn each box on the diagram.",

    "## Load Balancing & Traffic Management\n\nThe problem: one server cannot absorb all traffic, and clients need a stable entry point while backends come and go. A load balancer sits between clients and servers, spreads requests, detects unhealthy backends via health checks, and removes them from rotation.\n\nThe leading technologies:\n- **Nginx** — the default software L7 balancer and reverse proxy; battle-tested, config-file driven, also serves static content.\n- **HAProxy** — the performance benchmark for L4/L7 software balancing; extremely efficient, rich health-checking, favored at high connection counts.\n- **Envoy** — the modern cloud-native proxy: dynamic configuration via APIs (xDS), first-class gRPC/HTTP2 support, deep observability; the data plane under Istio and many API gateways.\n- **AWS ALB / NLB** — managed balancers. ALB is L7 (path/host routing, WebSockets); NLB is L4 (millions of connections, static IPs, ultra-low latency).\n- **Cloudflare** — balances and shields at the global edge, absorbing DDoS before traffic reaches your infrastructure.\n\n**L4 vs L7**: L4 routes on IP and port — microsecond-fast, protocol-agnostic, content-blind. L7 terminates the connection and parses HTTP — enabling path-based routing, header injection, SSL termination, and sticky sessions at the cost of ~1-5ms. **Algorithms**: round-robin (default), weighted round-robin (heterogeneous servers), least connections (uneven request cost), IP hash (session affinity), consistent hashing (stateful backends and caches).\n\nIn practice: production edges layer these — Cloudflare or an L4 NLB out front for raw absorption, L7 ALBs or Nginx/Envoy behind it for smart routing.\n\nHow to choose: managed cloud (ALB/NLB) unless you need portability or exotic routing; Nginx/HAProxy for self-managed simplicity; Envoy when you need dynamic config and mesh-grade telemetry.",

    "## API Gateways & Service Mesh\n\nThe problem: once you have many services, every one needs authentication, rate limiting, request routing, retries, and TLS — and duplicating that logic in each service is a maintenance disaster. Two components centralize it: an **API gateway** governs *north-south* traffic (clients to your system); a **service mesh** governs *east-west* traffic (service to service).\n\nThe leading technologies:\n- **Kong** — open-source gateway built on Nginx; plugin architecture for auth, rate limiting, transformations.\n- **Apigee** (Google) — enterprise API management: monetization, developer portals, analytics, heavy governance.\n- **AWS API Gateway** — fully managed; pairs naturally with Lambda; per-request pricing that gets expensive at very high volume.\n- **Istio** — the most featureful service mesh: Envoy sidecars plus a control plane giving mTLS, traffic splitting, retries, and telemetry without touching application code.\n- **Linkerd** — the lightweight mesh: fewer features, dramatically simpler to operate, ultra-light Rust proxies.\n\nHow to choose: every public API should sit behind a gateway — pick managed (AWS API Gateway) by default, Kong for portability/self-hosting, Apigee for enterprise API-program governance. A mesh is only justified at tens of services when mTLS-everywhere, canary traffic splitting, or uniform retries become painful to hand-roll; prefer Linkerd for simplicity, Istio for power.\n\nCommon mistake: Proposing Istio for a five-service system. A mesh adds a sidecar to every pod and a control plane to operate — below a few dozen services, a gateway plus client-side retry libraries is almost always enough.",

    "## Caching: In-Memory Stores & CDN Edge\n\nThe problem: databases are milliseconds away and expensive to scale for reads; most workloads re-read the same hot data constantly. Caches put that data in memory (or at the edge) and absorb the read load.\n\nThe leading technologies:\n- **Redis** — the default distributed cache and much more: rich data structures (hashes, sorted sets, streams), persistence, replication, Lua scripting, pub/sub. Also serves sessions, leaderboards, rate limiters, and distributed locks.\n- **Memcached** — a deliberately simple multi-threaded key-value cache. No persistence, no data structures — just very fast, memory-efficient string caching.\n- **CDN edge caches** — **CloudFront** (AWS-native), **Cloudflare** (edge network plus security), **Akamai** (largest enterprise footprint), **Fastly** (instant purge, edge compute). They cache static assets and cacheable API responses at hundreds of points of presence near users.\n\n**Cache patterns**: cache-aside (app reads cache, falls back to DB, populates on miss — the default), write-through (synchronous dual write, consistent but slower), write-behind (async flush, fast but lossy on crash), refresh-ahead (proactively renew hot keys before TTL expiry). **Eviction**: LRU is the general-purpose default; LFU for skewed access; always pair with TTLs.\n\nWarning: Cache stampede — a hot key expires and thousands of requests hit the database at once. Mitigate with a fetch mutex, probabilistic early expiration, or background refresh plus stale-while-revalidate.\n\nHow to choose: Redis unless you have a reason not to — Memcached only wins for pure ephemeral caching where its multi-threaded simplicity and lower memory overhead matter. A CDN is nearly free leverage for any user-facing system: put one in front before scaling origins.",

    "## Relational Databases\n\nThe problem: most business data is structured, interrelated, and needs correctness guarantees — orders that reference users, payments that must not double-apply. Relational databases give you ACID transactions, joins, constraints, and 50 years of query optimization.\n\nThe leading technologies:\n- **PostgreSQL** — the default answer in modern system design: strict standards compliance, JSONB for semi-structured data, full-text search, rich indexing (B-tree, GIN, BRIN, geospatial), extensions like PostGIS and TimescaleDB.\n- **MySQL** — enormous deployed base, excellent replication story, historically the web-scale workhorse (Facebook, YouTube, Uber all scaled on it).\n- **Amazon Aurora** — MySQL/Postgres-compatible with a cloud-native storage layer: 6-way replicated storage, up to 15 read replicas, fast failover — managed scaling without changing your SQL.\n- **Google Spanner / CockroachDB** — distributed SQL: horizontally scalable, strongly consistent across regions. Spanner uses TrueTime atomic clocks; CockroachDB is the open-source, run-anywhere equivalent.\n\nHow to choose: start with PostgreSQL. Choose Aurora when you are on AWS and want managed read scaling and failover. Reach for Spanner/CockroachDB only when you genuinely need multi-region writes with serializable consistency — they cost more in latency (consensus on every write) and money.\n\nKey insight: A single well-indexed PostgreSQL instance with read replicas comfortably serves the vast majority of businesses. In an interview, exhausting vertical scaling, read replicas, and caching before proposing sharding shows judgment; jumping straight to distributed SQL shows the opposite.",

    "## NoSQL Databases: Pick by Data Shape\n\nThe problem: not all data is relational, and not all workloads tolerate a single-node write master. NoSQL databases each relax something (joins, schema, strong consistency) to win something (scale, flexibility, latency). Pick by data shape and access pattern:\n\n- **Document — MongoDB**: JSON-like documents with flexible schemas and secondary indexes. Great for catalogs, user profiles, content — entities read and written as a unit.\n- **Wide-column — Cassandra / ScyllaDB**: LSM-tree, masterless, linearly scalable writes with tunable consistency. Built for write-heavy, partition-keyed workloads: activity feeds, sensor data, messaging history. ScyllaDB is the C++ rewrite delivering the same model with far lower latencies.\n- **Key-value — DynamoDB**: fully managed, single-digit-millisecond reads at any scale, pay-per-request. The catch: you must know your access patterns up front and model your table around them.\n- **Key-value in-memory — Redis**: doubles as a database for sessions, counters, and ephemeral state.\n- **Graph — Neo4j**: relationships are first-class; traversals like friends-of-friends or fraud-ring detection that would take brutal recursive SQL run naturally in Cypher.\n- **Time-series — InfluxDB / TimescaleDB**: optimized for timestamped writes, time-bucketed queries, downsampling, and retention policies — metrics, IoT, financial ticks. TimescaleDB is a Postgres extension, so you keep SQL.\n\nCommon mistake: Choosing NoSQL because \"it scales\" while your data is relational and fits on one node. You give up joins and transactions and get nothing back. NoSQL is a targeted answer to a specific access pattern, not a modernity badge.\n\nHow to choose: name the access pattern first. \"Key lookup at massive scale, known queries\" → DynamoDB. \"Write-heavy time-ordered feed\" → Cassandra. \"Flexible nested entities\" → MongoDB. \"Traverse relationships\" → Neo4j. \"Metrics over time\" → a time-series store.",

    "## Search Engines\n\nThe problem: databases answer exact-match and range queries; they cannot rank fuzzy text matches, tolerate typos, facet results, or score relevance. A `LIKE '%term%'` query cannot use a normal index and full-scans the table. Search engines solve this with an **inverted index** — a map from each term to the documents containing it.\n\nThe leading technologies:\n- **Elasticsearch** — the de-facto standard: distributed, near-real-time full-text search plus aggregations; also the backbone of the ELK logging stack.\n- **OpenSearch** — AWS's Apache-licensed fork of Elasticsearch; effectively the same design, the default on AWS.\n- **Apache Solr** — the older Lucene-based veteran; still strong in enterprise and faceted catalog search.\n- **Algolia** — search-as-a-service: instant (<10ms) results, typo tolerance, brilliant developer experience — you trade control and pay per usage.\n- **Typesense** — open-source, instant-search focused alternative to Algolia; simple to run, great for site and app search.\n\nIn practice: the search engine is always a *secondary* index, not the source of truth. The primary database owns the data; a pipeline (CDC via Debezium and Kafka, or dual writes) keeps the search index in sync, and the index is rebuildable from the source at any time.\n\nHow to choose: Elasticsearch/OpenSearch as the general-purpose default and for log analytics; Algolia or Typesense when the need is user-facing instant search and you would rather buy than operate; Solr mostly when it is already installed.",

    "## Messaging & Streaming\n\nThe problem: synchronous calls couple services — if the email provider is slow, checkout is slow. Messaging decouples producers from consumers, absorbs spikes, and survives consumer downtime. The fundamental split is **queue vs stream**: a queue delivers each message to *one* competing consumer and deletes it after acknowledgment (task distribution); a stream appends events to a durable, replayable log that *many* consumer groups read independently at their own offsets (event distribution).\n\nThe leading technologies:\n- **Apache Kafka** — the default event stream: partitioned commit log, per-partition ordering, consumer groups, replay, retention from hours to forever. Millions of messages per second.\n- **RabbitMQ** — the classic broker: exchanges and bindings give rich routing (direct, topic, fanout, headers), per-message acks, priorities, dead-letter queues. Ideal for task queues and RPC-style work distribution.\n- **AWS SQS / SNS** — managed queue and managed fanout. SQS standard is at-least-once, best-effort order; SQS FIFO adds strict ordering and dedup. SNS fans one message out to many SQS queues, Lambdas, or webhooks. Zero operations.\n- **Google Pub/Sub** — GCP's managed global messaging, autoscaling, at-least-once.\n- **Apache Pulsar** — Kafka's ambitious rival: compute/storage separation (BookKeeper), native multi-tenancy and geo-replication, both queue and stream semantics in one system.\n- **NATS** — tiny, blazing-fast cloud-native messaging for service-to-service communication; JetStream adds persistence.\n\nHow to choose: default to SQS/SNS for background jobs when managed simplicity wins; Kafka when multiple consumers need the same events, replay matters, or throughput is extreme; RabbitMQ for complex routing and per-message control; Pulsar for multi-tenant/geo-replicated platforms; NATS for lightweight internal messaging.\n\nCommon mistake: Using Kafka as a job queue. Selective acknowledgment, per-message retry, and delayed delivery are queue features — Kafka's offset model fights you on all three.",

    "## Object & File Storage\n\nThe problem: images, videos, backups, ML datasets, and logs do not belong in a database — they are large, immutable blobs that need cheap, durable, infinitely scalable storage addressed by key rather than by path on a disk.\n\nThe leading technologies:\n- **Amazon S3** — the industry standard and the API everyone else imitates: 11 nines of durability, lifecycle tiers (Standard → Infrequent Access → Glacier), versioning, event notifications, pre-signed URLs.\n- **Google Cloud Storage (GCS)** and **Azure Blob Storage** — the equivalents on the other clouds.\n- **MinIO** — S3-compatible object storage you run yourself; the standard answer for on-prem or Kubernetes-native object storage.\n- **HDFS** — the Hadoop distributed filesystem; historically the substrate for big-data processing, now largely displaced by object stores, but still common in legacy analytics estates.\n\nThe standard upload pattern: the client asks your API for a **pre-signed URL**, uploads the file directly to S3 (bypassing your servers entirely), and your API stores only the object key and metadata in the database. Downloads go through a CDN in front of the bucket.\n\nKey insight: Object storage plus CDN removes your servers from the file path entirely — your app handles kilobytes of metadata while S3 and CloudFront move the gigabytes.\n\nHow to choose: your cloud's native object store, full stop; MinIO when you must self-host. Never store blobs in the database, and never serve them from application servers.",

    "## Batch & Stream Processing\n\nThe problem: raw events and records must become aggregates, features, reports, and derived tables. Two modes: **batch** (process a bounded dataset on a schedule — high throughput, high latency) and **stream** (process events continuously as they arrive — low latency, harder semantics around time and state).\n\nThe leading technologies:\n- **Apache Spark** — the batch default: in-memory distributed compute, SQL/DataFrame APIs, MLlib; Spark Structured Streaming adds micro-batch streaming. The backbone of most data platforms (often via Databricks).\n- **Apache Flink** — the true-streaming default: event-at-a-time processing, event-time semantics with watermarks, exactly-once state, sophisticated windowing. Picks up where micro-batching falls short.\n- **Hadoop MapReduce** — the original big-data framework; disk-bound between stages and now essentially legacy, but its map/shuffle/reduce model underlies everything since.\n- **Kafka Streams** — a Java library, not a cluster: stream processing embedded in your service, state backed by Kafka itself. Perfect for transformations and joins on Kafka topics without new infrastructure.\n\nHow to choose: Spark for batch analytics and ML pipelines; Flink when per-event latency and event-time correctness matter (fraud detection, real-time aggregation); Kafka Streams for moderate-scale processing that should live inside an existing service; MapReduce only in a legacy discussion.\n\nIn practice: most companies run both modes — streaming for dashboards and alerts on fresh data, nightly batch for the authoritative numbers — and modern lakehouse architectures work to unify them.",

    "## Workflow Orchestration & Scheduling\n\nThe problem: real work is multi-step — \"charge the card, then reserve inventory, then email a receipt, and undo everything if step two fails.\" Something must run steps in order, retry failures, survive crashes mid-flow, and show humans what state everything is in.\n\nThe leading technologies:\n- **cron / Kubernetes CronJobs** — the primitive: run a command on a schedule. CronJobs add containerization, retries, and concurrency policy. No dependencies between jobs, no backfill, no UI.\n- **Apache Airflow** — the data-engineering standard: DAGs defined in Python, scheduling, backfills, retries, and a UI showing every run. Built for periodic batch pipelines.\n- **Temporal** — durable execution for application workflows: you write the workflow as ordinary code, Temporal persists every step, and a workflow can sleep for 30 days, survive worker crashes and deploys, and resume exactly where it left off. The modern answer to sagas, order fulfillment, onboarding flows, and human-in-the-loop processes.\n\nHow to choose: a single scheduled task → cron/CronJob. Scheduled *data* pipelines with dependencies and backfill → Airflow (or its younger rivals Dagster/Prefect). Long-running, must-not-lose-state *application* logic → Temporal.\n\nReal-world example: an e-commerce order flow — payment, inventory, shipping label, notification, with compensation on failure — is a saga. Hand-rolling it with queues and state flags is error-prone; as a Temporal workflow it is a single readable function with durability handled by the platform.",

    "## Coordination & Service Discovery\n\nThe problem: distributed systems need somewhere to agree — who is the leader, what is the current config, which instances are alive, who holds the lock. This demands a small, strongly consistent, highly available store built on a consensus protocol (Raft or ZAB/Paxos-family).\n\nThe leading technologies:\n- **Apache ZooKeeper** — the veteran: znode tree, ephemeral nodes for liveness, watches for change notification. Historically coordinated Kafka, HBase, and Hadoop — though Kafka has now replaced it with its own Raft implementation (KRaft).\n- **etcd** — Raft-based key-value store, best known as **Kubernetes' brain**: every object in a cluster lives in etcd. Simple gRPC/HTTP API, leases, watches.\n- **Consul** — HashiCorp's service-discovery-first tool: service registry with built-in health checking, DNS interface, KV store, and mesh features via Consul Connect.\n\nHow to choose: you rarely deploy these directly anymore — you inherit etcd with Kubernetes and get discovery from the platform (Kubernetes Services/DNS) or the mesh. Deploy Consul when you need cross-platform discovery spanning VMs and containers; keep ZooKeeper where legacy systems demand it.\n\nKey insight: These stores hold coordination *metadata* — kilobytes of leases, locks, and config — never application data. They are optimized for consistency, not throughput, and putting real data in them is a classic outage story.",

    "## Containers, Orchestration & Serverless\n\nThe problem: software must run identically across laptops and production, pack efficiently onto machines, restart when it dies, and scale with load. Containers solve packaging; orchestrators solve running fleets of them.\n\nThe leading technologies:\n- **Docker** — the container standard: image format, registry, runtime. \"Works on my machine\" becomes \"ships as an image.\"\n- **Kubernetes** — the orchestration standard: declarative desired state, self-healing, service discovery, rolling deploys, autoscaling (HPA), config/secret management. Enormous power, real operational cost.\n- **AWS ECS / Fargate** — simpler managed orchestration; Fargate removes node management entirely. The pragmatic choice for AWS shops that do not need the Kubernetes ecosystem.\n- **Serverless — AWS Lambda** (and Cloud Functions/Azure Functions) — no servers at all: event-driven functions, scale-to-zero, pay-per-invocation. Trade-offs: cold starts, execution time limits, and costs that exceed containers under sustained heavy load.\n\nHow to choose: spiky or event-driven glue (file uploaded → resize; queue message → process) → Lambda. Steady long-running services on AWS with a small team → ECS/Fargate. Large fleets, multi-cloud, or platform teams → Kubernetes.\n\nCommon mistake: Recommending Kubernetes for a three-service startup. The orchestrator should match team size and service count — Kubernetes solves problems you may not have yet, at an operational price you pay immediately.",

    "## Realtime Delivery to Clients\n\nThe problem: HTTP is request-response — the server cannot spontaneously tell a browser or phone that something happened. Chat, live dashboards, collaborative editing, and notifications all need server-initiated delivery.\n\nThe options, in escalating capability:\n- **Long polling** — the client holds a request open until data arrives or a timeout, then immediately re-requests. Works through every proxy; wasteful at scale. The compatibility fallback.\n- **Server-Sent Events (SSE)** — a one-way server-to-client stream over plain HTTP with automatic reconnection built into the browser. Perfect for feeds, tickers, live dashboards, and LLM token streaming.\n- **WebSockets** — a persistent bidirectional TCP connection. The answer for chat, multiplayer games, and collaborative editing. The cost: every connection holds server memory, and load balancers must support long-lived connections; horizontal scaling needs a pub/sub backplane (typically Redis) so a message published on one node reaches sockets on another.\n- **Push services — FCM (Firebase Cloud Messaging) and APNs (Apple Push Notification service)** — the *only* way to reach a mobile app that is not running. Your server sends to Google/Apple, which deliver to the device.\n\nHow to choose: one-way updates → SSE (simpler than you think you need). Bidirectional interaction → WebSockets. Offline mobile users → FCM/APNs, always. Ancient proxy environments → long polling.\n\nIn practice: a chat system uses all of these at once — WebSockets for online users, FCM/APNs for offline ones, and Redis pub/sub or Kafka fanning messages out across the WebSocket server fleet.",

    "## Observability: Metrics, Logs, Traces\n\nThe problem: in a distributed system you cannot attach a debugger to production. Observability is built on three pillars — **metrics** (numeric time-series: latency, error rate, saturation), **logs** (structured event records), and **traces** (one request's path across every service).\n\nThe leading technologies:\n- **Prometheus** — the metrics standard: pull-based scraping, a powerful query language (PromQL), alerting via Alertmanager. The default in Kubernetes environments.\n- **Grafana** — the dashboard layer over Prometheus and nearly everything else; its ecosystem adds Loki (logs) and Tempo (traces).\n- **Datadog** — the managed all-in-one: metrics, logs, traces, and APM in one SaaS. Superb experience, famously large bills at scale.\n- **ELK stack (Elasticsearch, Logstash, Kibana)** — the classic self-hosted log aggregation pipeline: ship, index, search, visualize.\n- **OpenTelemetry (OTel)** — the vendor-neutral instrumentation standard: one SDK emits metrics, logs, and traces to any backend. Instrument once, choose vendors later.\n- **Jaeger** — open-source distributed tracing: visualize a request's journey and find which hop burned the latency budget.\n- **Sentry** — application error tracking: exceptions grouped, deduplicated, and tied to releases and source lines.\n\nHow to choose: instrument with OpenTelemetry regardless of backend. Then Prometheus + Grafana + Loki + Jaeger if self-hosting; Datadog if buying; Sentry for error tracking either way.\n\nKey insight: In an interview, mentioning the golden signals — latency, traffic, errors, saturation — and *where you would alert* on them signals production maturity more than naming tools does.",

    "## Rate Limiting & Resilience\n\nThe problem: without protection, one abusive client or one slow dependency takes down the whole system. Two families of defense: **rate limiting** rejects excess load at the boundary; **resilience patterns** stop failures from cascading between services.\n\nRate limiting algorithms and where they run:\n- **Token bucket** — the practical default: tokens refill at a steady rate, each request spends one, bursts up to bucket size are allowed. **Leaky bucket** smooths to a constant outflow; **sliding window** counters give accurate per-window limits.\n- Implementations: **Nginx** (`limit_req`), **Envoy** (local and global rate limit filters), API gateways (Kong, AWS API Gateway have it built in), and **Redis-based distributed limiters** — atomic Lua scripts (or Redis Cell) maintaining shared counters so limits hold across all app instances.\n\nResilience patterns:\n- **Circuit breaker** — after N consecutive failures to a dependency, stop calling it (open), periodically probe (half-open), recover (closed). **Resilience4j** is the standard Java library (successor to Netflix Hystrix); Envoy and meshes do it at the proxy layer; Polly serves .NET.\n- **Timeouts and retries with exponential backoff plus jitter** — every remote call needs a deadline; retries must back off randomly or they synchronize into retry storms.\n- **Bulkheads** — partition thread pools/connections per dependency so one slow downstream cannot exhaust shared resources.\n- **Load shedding and graceful degradation** — under overload, drop low-priority work and serve cached or partial responses rather than failing everything.\n\nCommon mistake: Retrying without a circuit breaker or jitter. A struggling service receives 3x traffic from synchronized retries at the exact moment it can least afford it — retries turn a slowdown into an outage.\n\nHow to choose: rate limit at the gateway with Redis for shared state; put timeouts and jittered retries on every remote call; add circuit breakers (Resilience4j or mesh-level) on every dependency that can hurt you.",
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
  comparison: {
    columns: ["Need", "Reach for", "Leading tech", "Watch out for"],
    rows: [
      [
        "Spread traffic across servers",
        "Load balancer (L4 for speed, L7 for routing)",
        "Nginx, HAProxy, Envoy, AWS ALB/NLB, Cloudflare",
        "Health checks and connection draining; L7 adds ms of latency",
      ],
      [
        "One front door for APIs (auth, quotas, routing)",
        "API gateway; service mesh for east-west traffic",
        "Kong, Apigee, AWS API Gateway, Istio, Linkerd",
        "Gateway becomes a single point of failure; mesh is overkill under ~20 services",
      ],
      [
        "Sub-millisecond reads of hot data",
        "Distributed in-memory cache",
        "Redis, Memcached",
        "Invalidation bugs, stampedes, treating cache as source of truth",
      ],
      [
        "Serve static content near users",
        "CDN edge cache",
        "CloudFront, Cloudflare, Akamai, Fastly",
        "Stale content after deploys; purge/versioning strategy needed",
      ],
      [
        "Transactions, joins, structured data",
        "Relational database",
        "PostgreSQL, MySQL, Aurora, Spanner/CockroachDB",
        "Vertical write ceiling; distributed SQL pays consensus latency per write",
      ],
      [
        "Flexible schema or massive key-based scale",
        "NoSQL matched to data shape",
        "MongoDB, Cassandra/ScyllaDB, DynamoDB, Neo4j, InfluxDB",
        "No joins; access patterns must be known up front (especially DynamoDB)",
      ],
      [
        "Full-text search, relevance, facets",
        "Search engine as a secondary index",
        "Elasticsearch, OpenSearch, Solr, Algolia, Typesense",
        "Sync lag from the source of truth; never make it the primary store",
      ],
      [
        "Distribute tasks to one worker each",
        "Message queue",
        "RabbitMQ, AWS SQS, Google Pub/Sub",
        "At-least-once delivery means consumers must be idempotent",
      ],
      [
        "Many consumers replaying an event history",
        "Event stream (durable log)",
        "Kafka, Pulsar, Kinesis, NATS JetStream",
        "Partition-key ordering only; operational weight of a cluster",
      ],
      [
        "Store images, video, backups, big blobs",
        "Object storage plus CDN",
        "S3, GCS, Azure Blob, MinIO, HDFS",
        "Never store blobs in the DB or serve them from app servers",
      ],
      [
        "Transform large datasets or live event flows",
        "Batch or stream processing engine",
        "Spark, Flink, Kafka Streams, Hadoop MapReduce",
        "Batch is high-latency; streaming needs event-time and exactly-once care",
      ],
      [
        "Multi-step workflows with retries and state",
        "Workflow orchestrator",
        "Airflow, Temporal, cron, Kubernetes CronJobs",
        "Airflow is for data pipelines, Temporal for app logic — do not swap them",
      ],
      [
        "Leader election, locks, service discovery",
        "Strongly consistent coordination store",
        "ZooKeeper, etcd, Consul",
        "Metadata only — tiny consistent store, never application data",
      ],
      [
        "Package and run service fleets",
        "Containers plus an orchestrator, or serverless",
        "Docker, Kubernetes, ECS/Fargate, AWS Lambda",
        "Kubernetes ops cost; Lambda cold starts and duration limits",
      ],
      [
        "Push updates to connected or offline clients",
        "Realtime channel matched to direction",
        "WebSockets, SSE, long polling, FCM/APNs",
        "WebSockets need sticky routing and a Redis/Kafka fan-out backplane",
      ],
      [
        "See inside production; survive dependency failure",
        "Observability stack plus resilience patterns",
        "Prometheus, Grafana, Datadog, OpenTelemetry, Jaeger, Sentry, Resilience4j",
        "Unbounded retries without circuit breakers turn slowdowns into outages",
      ],
    ],
  },
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
    {
      q: "There are 100+ tools in the ecosystem — how do you actually pick one in an interview?",
      a: "Use a three-step frame: (1) **Name the need in workload terms** — reads vs writes per second, data size, latency budget, consistency requirement, fan-out shape. (2) **Map the need to a category, then pick the category default**: relational store → PostgreSQL, cache → Redis, event stream → Kafka, object storage → S3, orchestration → Kubernetes, metrics → Prometheus. Defaults are defensible because they are what most real companies run. (3) **Deviate only with a named reason**: 'DynamoDB instead of Postgres because access is pure key-value at millions of QPS and we want zero ops'; 'Memcached instead of Redis because we need nothing but ephemeral string caching and want multi-threaded simplicity.' Interviewers are not testing tool trivia — they are testing whether your choice traces back to a requirement. Saying 'Postgres, and here is what would make me switch' beats naming an exotic tool you cannot justify.",
    },
    {
      q: "When should you use Elasticsearch instead of SQL LIKE queries?",
      a: "Use LIKE for small tables and simple prefix matching — `LIKE 'abc%'` can use a B-tree index and is perfectly fine. Switch to Elasticsearch when you need: (1) infix/fuzzy matching — `LIKE '%term%'` cannot use a standard index and full-scans the table; (2) relevance ranking — SQL returns matches, not *best* matches; (3) linguistic analysis — stemming ('running' matches 'run'), synonyms, stop words; (4) typo tolerance and autocomplete; (5) faceted navigation with counts per category. Elasticsearch's inverted index maps each term to matching documents, making these operations fast at scale. The cost is real: a second system to operate, and a sync pipeline (CDC or dual writes) from the source-of-truth database, with eventual-consistency lag. Middle ground worth mentioning: PostgreSQL's built-in full-text search (tsvector/GIN) covers moderate needs without new infrastructure.",
    },
    {
      q: "A teammate proposes adding Kafka, Redis, and Elasticsearch to a new product with 1,000 users. How do you respond?",
      a: "Push back with the complexity-cost argument. Every component adds: an operational burden (deployment, upgrades, monitoring, on-call knowledge), a failure mode (Redis down — is the site down or just slow?), a consistency boundary (cache invalidation bugs, search index lag), and cognitive load for every future engineer. At 1,000 users, a single PostgreSQL instance handles the queries (with proper indexes), pg_trgm or tsvector covers search, and a simple jobs table or managed queue covers async work. The mature framing: name the trigger that would justify each component — 'we add Redis when p99 read latency exceeds our SLO and the top queries are cache-friendly; we add Kafka when a second consumer needs the event feed; we add Elasticsearch when search relevance becomes a product requirement.' This shows the interviewer you understand YAGNI applies to architecture, and that components are earned by measured need, not anticipated scale.",
    },
  ],
  followUps: [
    "Which building block would you remove first if cost mattered more than latency?",
    "What does adding a queue buy you, and what does it cost in debuggability?",
    "Your design uses PostgreSQL, Redis, Kafka, and Elasticsearch — what keeps all four consistent with each other, and where can they disagree?",
    "For each managed service in your design (SQS, DynamoDB, Lambda), what is the self-hosted equivalent and when would the switch be worth it?",
    "At what team size or service count does a service mesh start paying for its complexity?",
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
      front: "Kafka vs RabbitMQ",
      back: "Kafka = replayable partitioned log for event streaming at huge throughput; RabbitMQ = flexible-routing broker for task queues with per-message acks.",
    },
    {
      front: "Redis vs Memcached",
      back: "Redis = rich data structures, persistence, replication, pub/sub — the default. Memcached = simple multi-threaded string cache — pick it only for pure ephemeral caching.",
    },
    {
      front: "Queue vs event stream",
      back: "Queue (SQS, RabbitMQ): each message goes to ONE consumer and is deleted after ack — task distribution. Stream (Kafka): events persist in a log; MANY consumer groups read independently and can replay — event distribution.",
    },
    {
      front: "ZooKeeper vs etcd",
      back: "Both are strongly consistent coordination stores for locks, leader election, and config. ZooKeeper = older, ZAB protocol, legacy big-data ecosystem. etcd = Raft, simpler API, the datastore inside Kubernetes.",
    },
    {
      front: "S3 vs filesystem for user uploads",
      back: "S3: 11 nines durability, infinite scale, pre-signed direct uploads, CDN-friendly, lifecycle tiering. Filesystem: ties files to one server, breaks horizontal scaling, you own backups. Object storage wins for essentially all blob workloads.",
    },
    {
      front: "Airflow vs Temporal",
      back: "Airflow = scheduled data pipelines (DAGs, backfills, batch ETL). Temporal = durable application workflows (sagas, order flows) that survive crashes and can sleep for days mid-execution.",
    },
    {
      front: "WebSockets vs SSE vs push notifications",
      back: "WebSockets: bidirectional, for chat/games/collab. SSE: one-way server-to-client over HTTP, simpler, for feeds and dashboards. FCM/APNs: the only way to reach a mobile app that is not running.",
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
      back: "For high write throughput, time-series data, and distributed workloads. Examples: Cassandra, HBase, ScyllaDB. Good for: IoT sensor data, activity logs, messaging at scale. Trade-off: limited query flexibility compared to relational databases.",
    },
    {
      front: "What is a circuit breaker?",
      back: "A resilience pattern: after N failures to a dependency, stop calling it (open state), periodically probe (half-open), resume when healthy (closed). Prevents cascading failures and retry storms. Libraries: Resilience4j (Java), Polly (.NET); also built into Envoy/service meshes.",
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
      note: "The definitive text on storage engines, replication, and stream processing trade-offs.",
    },
    {
      label: "Apache Kafka documentation — design section", url: "https://kafka.apache.org/documentation/",
      kind: "docs",
      note: "Explains the log abstraction, partitioning, and consumer groups from first principles.",
    },
    {
      label: "Redis documentation — data types and caching patterns", url: "https://redis.io/docs/latest/",
      kind: "docs",
      note: "Authoritative reference for eviction policies, TTLs, and Redis data structures.",
    },
    {
      label: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/",
      kind: "docs",
      note: "How AWS itself frames choosing between its managed building blocks.",
    },
    {
      label: "The Google SRE Book — chapters on handling overload and cascading failures", url: "https://sre.google/sre-book/table-of-contents/",
      kind: "book",
      note: "The canonical treatment of load shedding, retries, and resilience at scale.",
    },
    {
      label: "Envoy proxy documentation — architecture overview", url: "https://www.envoyproxy.io/docs",
      kind: "docs",
      note: "The best modern explanation of L4/L7 proxying, health checking, and circuit breaking.",
    },
    {
      label: "Martin Kleppmann — 'Turning the database inside-out'",
      kind: "video",
      note: "Why event logs (Kafka) became the backbone of modern data architectures.",
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
      term: "Event Stream",
      definition:
        "A durable, append-only log of events (e.g., a Kafka topic) that multiple consumer groups read independently at their own pace, with the ability to replay history.",
    },
    {
      term: "API Gateway",
      definition:
        "A single managed entry point for client-to-system (north-south) API traffic, centralizing authentication, rate limiting, routing, and request transformation. Examples: Kong, Apigee, AWS API Gateway.",
    },
    {
      term: "Service Mesh",
      definition:
        "An infrastructure layer (typically sidecar proxies plus a control plane, e.g., Istio or Linkerd) that handles service-to-service (east-west) concerns — mTLS, retries, traffic splitting, telemetry — without application code changes.",
    },
    {
      term: "Object Storage",
      definition:
        "Flat, key-addressed storage for immutable blobs (images, video, backups) with very high durability and effectively unlimited scale. Examples: S3, GCS, Azure Blob, MinIO.",
    },
    {
      term: "Inverted Index",
      definition:
        "The core data structure of search engines: a map from each term to the list of documents containing it, enabling fast full-text search, relevance ranking, and faceting.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A resilience pattern that stops calls to a failing dependency after repeated errors (open state), probes periodically (half-open), and resumes when healthy — preventing cascading failures.",
    },
    {
      term: "Token Bucket",
      definition:
        "The most common rate-limiting algorithm: tokens accumulate at a fixed rate up to a bucket capacity; each request consumes one, allowing controlled bursts while enforcing an average rate.",
    },
    {
      term: "OpenTelemetry",
      definition:
        "The vendor-neutral standard for instrumenting applications to emit metrics, logs, and traces, decoupling instrumentation from the observability backend that stores and visualizes the data.",
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
    {
      term: "Durable Execution",
      definition:
        "A workflow model (e.g., Temporal) where every step of a long-running process is persisted, so the workflow survives crashes and deploys and resumes exactly where it left off.",
    },
  ],

  deepDive: [
    "## How Load Balancers Actually Work Under the Hood\n\nLoad balancers are far more than simple traffic distributors -- they are critical **control plane components** that shape how your entire system behaves under stress. At **Layer 4**, a load balancer operates on TCP segments: it reads the destination IP and port from the packet header, selects a backend using its configured algorithm, and rewrites the packet's destination (NAT) before forwarding it. Because it never parses the payload, L4 is *extremely fast* -- measured in microseconds -- and is protocol-agnostic (HTTP, gRPC, WebSocket, database wire protocols all work transparently). At **Layer 7**, the load balancer terminates the TCP connection, fully parses the HTTP request (method, URI, headers, sometimes the body), makes a routing decision, and opens a *new* connection to the chosen backend. This gives it superpowers:\n\n- **Path-based routing**: send `/api/v2/*` to the new service, `/api/v1/*` to the legacy service\n- **Header injection**: add `X-Request-ID` for distributed tracing\n- **Rate limiting**: enforce per-client request quotas before traffic reaches your application\n- **SSL termination**: decrypt TLS at the LB so backends handle plain HTTP, reducing CPU overhead\n\nThe trade-off is latency: L7 parsing adds ~1-5ms per request. In practice, most production architectures use **both**: an L4 NLB at the edge for raw TCP performance and DDoS absorption, fronting L7 ALBs that handle application-level routing.",

    "## Cache Hierarchies and Invalidation Strategies in Depth\n\nCaching is not a single layer -- it is a **hierarchy**, and understanding where each layer sits is critical for designing low-latency systems. The hierarchy from closest to the user to closest to the data source is: *browser cache* (controlled by `Cache-Control` and `ETag` headers) -> *CDN edge cache* -> *API gateway cache* -> *application-level in-process cache* (e.g., `std::unordered_map` in C++ or Guava/Caffeine in Java) -> *distributed cache* (Redis, Memcached) -> *database buffer pool*. Each layer trades **freshness** for **speed**.\n\nThe three canonical write strategies are:\n- **Cache-aside (lazy loading)**: the application checks the cache first; on a miss, it reads from the DB and populates the cache. On writes, the application updates the DB and *invalidates* (deletes) the cache key. Simple but vulnerable to race conditions if two writers invalidate simultaneously.\n- **Write-through**: every write goes to both the cache and the DB synchronously. Guarantees consistency but adds write latency.\n- **Write-behind (write-back)**: writes go to the cache immediately; a background process asynchronously flushes to the DB. Lowest write latency but risks data loss if the cache node fails before flushing.\n\nThe hardest problem is **invalidation**. TTL-based expiration is simple but allows stale reads. Event-driven invalidation (publish a cache-bust event on every DB write) is more precise but adds infrastructure complexity. For hot keys, consider **refresh-ahead**: a background thread proactively refreshes the cache entry *before* the TTL expires, so no request ever sees a miss.",

    "## Message Queues vs. Event Streams: Choosing the Right Abstraction\n\nMessage queues and event streams solve overlapping but fundamentally different problems. A **message queue** (RabbitMQ, SQS) implements the *competing consumers* pattern: a message is delivered to **one** consumer, acknowledged, and removed. This is ideal for **task distribution** -- e.g., sending emails, processing image uploads, executing background jobs. If a consumer fails, the message is redelivered to another consumer. The queue acts as a *buffer* that absorbs traffic spikes.\n\nAn **event stream** (Kafka, Kinesis) implements the *publish-subscribe log* pattern: events are **appended** to an immutable, ordered log partitioned by key. Multiple **consumer groups** can each read the entire stream independently, at their own pace. Events are *retained* for a configurable period (days, weeks, or forever with compaction), enabling **replay** -- a new consumer can start from the beginning and rebuild its state. This is the foundation of *event sourcing* and *CQRS* architectures.\n\nKey decision factors:\n- **Do multiple independent services need the same data?** -> Event stream (each gets its own consumer group)\n- **Do you need message replay or audit trails?** -> Event stream\n- **Is ordering critical within a partition key?** -> Kafka guarantees per-partition ordering; SQS FIFO guarantees per-group ordering\n- **Do you need complex routing (fanout, topic-based)?** -> RabbitMQ excels with its exchange/binding model\n- **Is operational simplicity paramount?** -> SQS (fully managed, no clusters to maintain)",

    "## Kafka vs RabbitMQ vs SQS: The Three-Way Decision\n\nThis is the single most common head-to-head in system design interviews, and the answer hinges on three questions. **Question 1 — how many readers?** If exactly one service should process each message (send this email, resize this image), you want queue semantics: RabbitMQ or SQS. If several services independently need every event (order-placed feeds fulfillment, analytics, and fraud detection), you want Kafka's consumer groups over one shared log. **Question 2 — do you ever need to re-read?** Kafka retains events for days or forever; a bug fixed on Tuesday can replay Monday's events. Queues delete on acknowledgment — history is gone. Replay, audit, and event sourcing all point to Kafka. **Question 3 — who operates it?** SQS is zero-ops and effectively infinitely elastic; RabbitMQ is a cluster you run (or pay Amazon MQ to run); self-managed Kafka is a serious operational commitment — which is why MSK and Confluent Cloud exist.\n\nDecision shortcuts:\n- Background jobs on AWS, no replay needed -> **SQS** (add SNS for fanout)\n- Complex routing, priorities, per-message TTLs, request-reply -> **RabbitMQ**\n- Event backbone, multiple consumers, replay, > ~100k msg/s -> **Kafka**\n\nCommon mistake: Choosing Kafka for a simple work queue. Kafka has no per-message acknowledgment (only offsets), no built-in delayed delivery, and no selective retry — a consumer that fails one message blocks its whole partition unless you build dead-letter machinery yourself. SQS gives you all three for free.",

    "## Redis vs Memcached: When the Simple Tool Wins\n\nThe default answer is Redis, so the interesting skill is knowing when Memcached is genuinely the better pick. **Redis** is single-threaded per core for command execution but offers a huge feature surface: strings, hashes, lists, sets, sorted sets, streams, geospatial indexes; optional persistence (RDB snapshots, AOF logs); replication and Redis Cluster; Lua scripting for atomic multi-step operations; pub/sub; and building blocks for rate limiters and distributed locks. **Memcached** is multi-threaded, stores only strings, has no persistence and no replication, and uses a slab allocator with very low per-key memory overhead.\n\nChoose Memcached when ALL of these hold: the workload is pure cache (loss is harmless), values are simple strings/serialized blobs, and you want maximum throughput per node with the simplest possible operational story — multi-threading lets one big Memcached node use every core, where Redis needs multiple shards.\n\nChoose Redis when ANY of these hold: you need data structures (leaderboard = sorted set, session = hash), persistence or replication, atomic operations beyond get/set, pub/sub, or you want one tool to also serve as a lightweight database.\n\nIn practice: Facebook's Memcached fleet is the famous counterexample that proves the rule — at extreme scale with a pure look-aside cache pattern, Memcached's simplicity is a feature. Nearly everyone else consolidates on Redis because one well-understood tool serving five roles beats two tools serving six.",

    "## Postgres vs MongoDB vs Cassandra vs DynamoDB: The Storage Decision\n\nFrame this decision along three axes: data shape, scale model, and operational model. **PostgreSQL** — relational, single-node writes (scaled with read replicas), the strongest consistency and query flexibility: joins, transactions, constraints, and JSONB when parts of the schema are fluid. Default until proven otherwise. **MongoDB** — document model, flexible schema, horizontal scale via sharding, multi-document transactions since 4.0 (with performance costs). Wins when entities are naturally self-contained documents read and written whole, and schema evolves fast. **Cassandra** — masterless wide-column store with LSM storage: every node accepts writes, linear scale into hundreds of nodes, tunable consistency (ONE/QUORUM/ALL). Wins for relentless write-heavy, partition-keyed workloads — feeds, telemetry, message history. The price: no joins, no ad-hoc queries; tables are designed per query. **DynamoDB** — managed key-value/document with single-digit-millisecond latency at any scale, per-request pricing, zero servers. Wins when access patterns are known, stable, and key-based; hurts when product requirements shift and your single-table design no longer matches the questions being asked.\n\nDecision shortcuts:\n- Transactions, joins, evolving ad-hoc queries -> **PostgreSQL**\n- Self-contained documents, fast-evolving schema -> **MongoDB**\n- Extreme sustained writes, time-ordered data, multi-DC -> **Cassandra**\n- Known key-based access, serverless ops, AWS -> **DynamoDB**\n\nKey insight: The question is not 'which database is best' but 'which failure mode can you live with' — Postgres runs out of vertical write headroom, Mongo tempts you into schema chaos, Cassandra locks you into your queries, DynamoDB locks you into your access patterns and your cloud.",

    "## Elasticsearch vs Database LIKE: Why Search Is a Separate System\n\nA `WHERE title LIKE '%phone%'` query cannot use a B-tree index — a B-tree indexes from the start of the string, and a leading wildcard forces a full table scan of every row. At small scale nobody notices; at millions of rows the query takes seconds and pins the database CPU. And even if it were fast, SQL gives you *matching*, not *ranking*: no relevance scores, no stemming ('running' should match 'run'), no typo tolerance, no facet counts.\n\nElasticsearch inverts the problem: at index time, each document is analyzed — tokenized, lowercased, stemmed — and each resulting term is mapped to the documents containing it (the **inverted index**). A search becomes a lookup of a few terms plus a ranking pass (BM25 scoring), returning the top results in milliseconds regardless of corpus size.\n\nWhat this costs you:\n- **A second system**: cluster sizing, shard management, version upgrades, monitoring.\n- **A sync pipeline**: the database remains the source of truth; changes flow to the index via CDC (Debezium -> Kafka -> indexer) or dual writes. There is always some lag — search is eventually consistent by construction.\n- **Rebuild discipline**: the index must be re-creatable from the source at any time, because mappings change and clusters fail.\n\nIn practice: escalate in steps. Prefix search on an indexed column -> plain `LIKE 'abc%'`. Moderate full-text needs -> PostgreSQL tsvector with a GIN index, or the pg_trgm extension for fuzzy matching — no new infrastructure. Product-grade relevance, facets, typo tolerance at scale -> Elasticsearch/OpenSearch, or buy it (Algolia/Typesense) if operating a cluster is not worth it.",

    "## S3 vs Filesystem: Why Object Storage Won\n\nStoring uploads on the application server's disk feels natural and fails immediately at scale, for a compounding list of reasons. **Scaling**: the moment you run two app servers behind a load balancer, a file written to server A is a 404 on server B. **Durability**: one disk is one failure domain; S3 replicates every object across at least three availability zones for eleven nines of durability. **Elasticity**: disks fill and must be resized; S3 has no capacity to manage at all. **Delivery**: files on an app server consume its bandwidth and worker processes; objects in S3 sit behind CloudFront and never touch your compute. **Cost**: S3 lifecycle policies migrate cold objects to Infrequent Access and Glacier tiers automatically.\n\nThe canonical upload flow: client asks your API for a **pre-signed URL** -> client uploads directly to S3 with it -> S3 fires an event (SQS/Lambda) -> your system records metadata (object key, size, owner) in the database. Your servers never handle file bytes in either direction.\n\nWhen a filesystem is still right: POSIX semantics (partial writes, appends, file locking), sub-millisecond local access (scratch space, ML training data staged locally), or shared-volume legacy software — that is what EFS/NFS-style services are for. And **HDFS** persists in legacy analytics estates where compute-data locality mattered, though cloud object storage plus decoupled compute (Spark on S3) has largely replaced it.\n\nCommon mistake: Storing images as BLOBs in the database. It bloats backups, poisons the buffer pool with cold bytes, and turns cheap CDN traffic into expensive database reads — store the object in S3 and the key in the database.",

    "## ZooKeeper vs etcd: Coordination Stores Compared\n\nBoth solve the same narrow, hard problem: a small, strongly consistent store that a distributed system can trust for leader election, locks, membership, and configuration — built on consensus (ZooKeeper's ZAB, etcd's Raft), so they keep working through minority node failures. **ZooKeeper** is the veteran: a filesystem-like tree of znodes, *ephemeral* nodes that vanish when a client's session dies (the liveness primitive), *sequential* nodes for fair queuing and election, and watches for change notification. It carried the Hadoop-era ecosystem — HBase, SolrCloud, and famously Kafka. **etcd** is the modern equivalent: a flat key-value space with leases (the ephemeral analogue), streaming watches over gRPC, and MVCC revisions — best known as the datastore inside **Kubernetes**, where every cluster object lives.\n\nHow the choice actually plays out today:\n- You inherit **etcd** by running Kubernetes; you almost never deploy it separately.\n- You keep **ZooKeeper** where legacy dependencies demand it — and that list is shrinking: Kafka's KRaft mode replaced ZooKeeper with an internal Raft quorum, removing its most famous use case.\n- You choose **Consul** when the real need is service discovery across VMs and containers, since it bundles a registry, health checks, and a DNS interface.\n\nKey insight: In an interview, the strongest move is often noting you do not need a coordination store at all — Kubernetes gives you discovery and leader election primitives, and managed services (DynamoDB conditional writes, Redis Redlock with caveats) cover simple locking. Reach for raw ZooKeeper/etcd only when you are *building* infrastructure, not using it.",

    "## When NOT to Add a Component: YAGNI as an Architecture Skill\n\nEvery box you add to the diagram is a claim that its benefit exceeds its cost, and the costs are systematically underestimated. Each new component brings: **operational surface** (deployment, upgrades, patching, monitoring, on-call runbooks), **new failure modes** (what happens when Redis is down — is the site broken or merely slower? did anyone test that path?), **consistency boundaries** (cache vs DB, search index vs source of truth — every pair can now disagree), **cognitive load** (every future engineer must understand it), and **debugging distance** (a request that once touched one process now crosses six, and the bug is in the seams).\n\nThe discipline is to name the trigger before adding the tool:\n- No cache until measured read latency or DB load breaches a target — and the top queries are actually cache-friendly.\n- No Kafka until a second consumer genuinely needs the event feed — a jobs table or SQS covers one consumer.\n- No microservices/mesh until team count, not traffic, forces service boundaries.\n- No Elasticsearch until search relevance is a product requirement Postgres full-text cannot meet.\n- No Kubernetes while ECS/Fargate or a PaaS covers your deployment needs with a fraction of the ops.\n\nReal-world example: a boring stack — one PostgreSQL instance, a monolith on a few servers behind an ALB, S3 plus CloudFront, and SQS for background jobs — comfortably serves millions of users. Companies like Basecamp and Stack Overflow famously ran enormous traffic on deliberately small architectures.\n\nIn practice: interviewers reward sequencing. Present the simple design first, then say what measurement would trigger each addition. 'Here is the v1; Redis enters when p99 exceeds 200ms; Kafka enters when analytics needs the order feed' demonstrates judgment that a fully-loaded diagram never can.",

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
      title: "Where Each Building Block Sits",
      kind: "architecture",
      caption: "The full technology catalog placed in its architectural layer: edge, gateway, application, cache, messaging, data, processing, and the observability plane watching everything. Numbered edges (1-7) follow one request from DNS resolution down to the relational database; unnumbered edges are alternate routes or background pipelines.",
      mermaid: `graph TB
    subgraph EDGE["Edge Layer"]
        CDN["Cloudflare / CloudFront<br/>CDN edge cache"]
        DNS["Route 53<br/>DNS and geo-routing"]
        NLB["AWS NLB / HAProxy<br/>L4 load balancer"]
    end
    subgraph GATEWAY["Gateway Layer"]
        ALB["Nginx / ALB / Envoy<br/>L7 load balancer"]
        APIGW["Kong / AWS API Gateway<br/>auth, rate limits, routing"]
    end
    subgraph APP["Application Layer"]
        SVC1["Order Service<br/>Kubernetes / ECS"]
        SVC2["User Service<br/>Kubernetes / ECS"]
        FN["AWS Lambda<br/>event-driven functions"]
        WS["WebSocket / SSE servers<br/>realtime delivery"]
        MESH["Istio / Linkerd<br/>service mesh sidecars"]
    end
    subgraph CACHE["Cache Layer"]
        REDIS["Redis<br/>hot data, sessions, rate limits"]
        MEMC["Memcached<br/>ephemeral object cache"]
    end
    subgraph MSG["Messaging Layer"]
        KAFKA["Kafka<br/>event stream"]
        MQ["RabbitMQ / SQS<br/>task queue"]
        PUSH["FCM / APNs<br/>mobile push"]
    end
    subgraph DATA["Data Layer"]
        PG["PostgreSQL / Aurora<br/>relational source of truth"]
        NOSQL["DynamoDB / Cassandra / MongoDB<br/>NoSQL by access pattern"]
        ES["Elasticsearch<br/>search index"]
        S3["S3 / GCS / MinIO<br/>object storage"]
        TS["InfluxDB / TimescaleDB<br/>time-series"]
    end
    subgraph PROC["Processing Layer"]
        SPARK["Spark<br/>batch analytics"]
        FLINK["Flink / Kafka Streams<br/>stream processing"]
        AIR["Airflow / Temporal<br/>workflow orchestration"]
    end
    subgraph OBS["Observability Plane"]
        PROM["Prometheus + Grafana<br/>metrics and dashboards"]
        OTEL["OpenTelemetry + Jaeger<br/>distributed tracing"]
        LOGS["ELK / Datadog<br/>log aggregation"]
    end
    DNS -->|"1. resolve + geo-route"| CDN
    CDN -->|"2. cache miss"| NLB
    NLB -->|"3. L4 forward"| ALB
    ALB -->|"4. L7 route"| APIGW
    APIGW -->|"5. authenticated request"| SVC1
    APIGW --> SVC2
    APIGW --> FN
    ALB --> WS
    MESH --- SVC1
    MESH --- SVC2
    SVC1 -->|"6. check cache"| REDIS
    SVC2 --> MEMC
    SVC1 -->|"7. cache miss: query"| PG
    SVC2 --> NOSQL
    SVC1 --> KAFKA
    SVC2 --> MQ
    KAFKA --> ES
    KAFKA --> FLINK
    FLINK --> TS
    SPARK --> S3
    AIR --> SPARK
    KAFKA --> WS
    MQ --> PUSH
    SVC1 --> S3
    SVC1 -.-> PROM
    SVC2 -.-> OTEL
    KAFKA -.-> LOGS`,
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
    "Take three product briefs — a chat app, an analytics dashboard, and a photo-sharing service — and for each, walk the full catalog (load balancing, gateway, cache, database, search, messaging, storage, processing, realtime, observability) writing one line per category: the tool you would pick and the one-sentence reason. Then mark which categories you would deliberately SKIP at launch and what metric would trigger adding them.",
  ],

  cheatSheet: [
    "**Load balancing**: spread traffic → Nginx/HAProxy self-hosted, ALB/NLB on AWS, Envoy for cloud-native. L4 for speed, L7 for routing; round-robin default, least-connections for uneven work, consistent hashing for stateful backends.",
    "**API gateway / mesh**: one front door for APIs → AWS API Gateway (managed) or Kong (portable); service-to-service mTLS and retries at scale → Linkerd (simple) or Istio (powerful), only past ~20 services.",
    "**Caching**: hot reads → Redis (default; data structures, persistence) or Memcached (pure ephemeral cache); static content near users → CloudFront/Cloudflare CDN. Cache-aside + LRU + TTL is the standard combo.",
    "**Relational DB**: structured data with transactions → PostgreSQL (default), Aurora for managed AWS scaling, Spanner/CockroachDB only for true multi-region strong consistency.",
    "**NoSQL**: documents → MongoDB; extreme writes/time-ordered → Cassandra/ScyllaDB; key-value at scale, zero ops → DynamoDB; relationships → Neo4j; metrics over time → InfluxDB/TimescaleDB.",
    "**Search**: full-text, relevance, facets → Elasticsearch/OpenSearch (self-run) or Algolia/Typesense (buy); Postgres tsvector for moderate needs; never make the search index the source of truth.",
    "**Messaging**: background jobs → SQS (managed) or RabbitMQ (routing control); event backbone with replay and many consumers → Kafka; lightweight internal messaging → NATS.",
    "**Object storage**: blobs (images, video, backups) → S3/GCS/Azure Blob, MinIO self-hosted; pre-signed URL uploads + CDN downloads; never blobs in the DB.",
    "**Processing**: batch analytics → Spark; low-latency event-time streaming → Flink; in-service stream transforms → Kafka Streams.",
    "**Workflow**: one scheduled task → cron/K8s CronJob; data pipelines with backfill → Airflow; durable multi-step app workflows (sagas) → Temporal.",
    "**Coordination**: locks, leader election, discovery → etcd (comes with Kubernetes), Consul for cross-platform discovery, ZooKeeper for legacy; metadata only, never app data.",
    "**Compute**: containers → Docker everywhere; orchestration → Kubernetes (large/platform teams) or ECS/Fargate (simpler AWS); spiky event-driven glue → Lambda.",
    "**Realtime**: bidirectional (chat, games) → WebSockets + Redis pub/sub backplane; one-way feeds → SSE; offline mobile → FCM/APNs; legacy fallback → long polling.",
    "**Observability**: instrument with OpenTelemetry; metrics → Prometheus + Grafana; logs → ELK/Loki; traces → Jaeger; errors → Sentry; buy-it-all option → Datadog.",
    "**Resilience**: rate limit at the gateway (token bucket, Redis-backed for shared state); timeouts + jittered exponential backoff on every remote call; circuit breakers (Resilience4j / Envoy) on every dependency.",
    "**L4 vs L7 LB**: L4 = transport layer (IP+port, fast, protocol-agnostic). L7 = application layer (HTTP headers/URL, content-based routing, SSL termination). Use L4 for raw throughput, L7 for smart routing.",
    "**Cache write strategies**: Cache-aside (app manages cache, most common). Write-through (sync write to both, consistent but slow writes). Write-behind (async flush to DB, fast but risks data loss).",
    "**Kafka vs RabbitMQ vs SQS**: Kafka = replayable log, many consumers, huge throughput. RabbitMQ = rich routing, per-message ack. SQS = zero-ops managed queue. Events → Kafka; tasks → SQS/RabbitMQ.",
    "**Storage engines**: B-tree (PostgreSQL, MySQL) = fast reads, in-place updates. LSM-tree (Cassandra, RocksDB) = fast sequential writes, compaction overhead on reads. B-tree for read-heavy, LSM for write-heavy.",
  ],

  revisionNotes: [
    "System design is selection from a shared catalog: every category (traffic, gateway, cache, relational, NoSQL, search, messaging, storage, processing, workflow, coordination, compute, realtime, observability, resilience) has a default tool and 2-3 alternatives. Know the default, know one alternative, know the trigger for switching.",
    "Load balancers are the front door of your system. L4 (NLB, HAProxy) for speed and protocol-agnostic routing, L7 (ALB, Nginx, Envoy) for content-aware routing. Most architectures use both: L4 at the edge, L7 for application routing. Always mention health checks.",
    "Caching exists at every layer (browser, CDN, app, distributed cache, DB buffer pool). In system design, 'the cache' usually means Redis between app servers and the DB. Always discuss eviction policy (LRU), TTL, and invalidation strategy. Redis is the default; Memcached only for pure ephemeral string caching.",
    "Cache stampede is a top interview topic. Three solutions: mutex/lock (only one fetches), probabilistic early expiration (stagger refreshes), background refresh (proactive). Mention stale-while-revalidate as a bonus.",
    "CDNs are not just for static files. They handle API response caching, DDoS protection, SSL termination, and dynamic content acceleration. Origin shield reduces origin load by acting as an intermediate cache. Providers: CloudFront, Cloudflare, Akamai, Fastly.",
    "Queue vs stream is the fundamental messaging distinction: queues (SQS, RabbitMQ) deliver each message to one competing consumer for task distribution; streams (Kafka) keep a replayable log that many consumer groups read independently. Kafka for events and pipelines, SQS/RabbitMQ for jobs. Do not use Kafka as a job queue.",
    "Storage decisions follow data shape: PostgreSQL default; MongoDB for documents; Cassandra for extreme partition-keyed writes; DynamoDB for known key-based access with zero ops; Neo4j for graph traversals; InfluxDB/TimescaleDB for time-series; Elasticsearch as a synced secondary search index; S3 for all blobs (pre-signed uploads, CDN downloads).",
    "Polyglot persistence is the norm in large systems. PostgreSQL for core data, Redis for caching, Elasticsearch for search, Kafka for event streaming, S3 for objects. Always explain why each was chosen based on access patterns — and how they stay in sync (CDC, invalidation).",
    "Consistent hashing is essential for distributed caches and partitioned databases. Virtual nodes solve the uneven distribution problem. Key insight: adding/removing a server only affects ~1/N of the keys, unlike modulo hashing which remaps almost everything.",
    "The higher-order platform picks: Kubernetes (or ECS/Fargate for simplicity, Lambda for event-driven glue) to run things; Airflow for data pipelines vs Temporal for durable app workflows; etcd/ZooKeeper/Consul only hold coordination metadata; OpenTelemetry + Prometheus/Grafana/Jaeger (or Datadog) to see inside; token-bucket rate limits and circuit breakers (Resilience4j, Envoy) to stay up when dependencies fail.",
    "Knowing when NOT to add a component is a scored skill. Each box costs operations, failure modes, consistency boundaries, and cognitive load. Present the simple design first, then name the measurable trigger for each addition ('Redis when p99 > 200ms', 'Kafka when a second consumer needs the feed').",
    "In system design interviews, always specify your building blocks explicitly: LB type and algorithm, cache layer and eviction policy, database type and indexes, queue/stream choice. Vague answers like 'add a cache' lose points -- say 'Redis with LRU eviction and 5-minute TTL using cache-aside pattern.'",
  ],
};
