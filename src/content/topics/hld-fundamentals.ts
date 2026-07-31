import type { TopicContent } from "../types";

export const hldFundamentals: TopicContent = {
  quickSummary: [
    "High-Level Design (HLD) defines the major components of a system, their responsibilities, and how they interact -- without specifying implementation details like code structure or algorithms.",
    "Component design involves identifying services, databases, caches, queues, and external integrations, then defining clear boundaries and responsibilities for each.",
    "Data flow design traces how requests and data move through the system, covering synchronous API calls, asynchronous event pipelines, and data transformation stages.",
    "Non-Functional Requirements (NFRs) like scalability, availability, latency, and security shape architectural decisions and must be quantified early in the design process.",
  ],
  detailed: [
    `## Component Design

Component design is the process of decomposing a system into its major building blocks and defining their responsibilities.

**Core components in most systems:**
- **API Gateway / Load Balancer** -- entry point for client requests; handles routing, rate limiting, authentication, SSL termination.
- **Application services** -- contain business logic; may be monolithic or decomposed into microservices.
- **Data stores** -- relational databases (PostgreSQL, MySQL), NoSQL (MongoDB, DynamoDB, Cassandra), search engines (Elasticsearch).
- **Caches** -- in-memory stores (Redis, Memcached) for reducing database load and improving latency.
- **Message queues / Event streams** -- asynchronous communication (Kafka, SQS, RabbitMQ) for decoupling and buffering.
- **CDN** -- edge caching for static assets and API responses close to users.
- **External integrations** -- third-party APIs, payment gateways, notification services.

**Design principles:**
- **Single Responsibility** -- each component does one thing well. Avoid "god services" that handle everything.
- **Loose coupling** -- components interact through well-defined interfaces. Changing one component's internals should not require changes in others.
- **High cohesion** -- related functionality lives together. If two operations always change together, they belong in the same component.
- **Separation of reads and writes** -- for high-traffic systems, separate read and write paths (CQRS) to optimize each independently.`,

    `## Data Flow Design

Data flow diagrams trace how requests and data move through the system.

**Synchronous request flow (typical web API):**
\`\`\`
Client -> CDN -> Load Balancer -> API Gateway -> Application Service -> Cache (hit?) -> Database
                                                                    <- Response
\`\`\`

**Asynchronous event flow:**
\`\`\`
Producer Service -> Message Queue -> Consumer Service -> Database
                                  -> Analytics Pipeline -> Data Warehouse
\`\`\`

**Key considerations:**
- **Read path vs. write path** -- reads often go through caches and read replicas; writes go to the primary database.
- **Data transformation** -- where does raw data become the format consumers need? ETL pipelines, materialized views, or application-layer mapping.
- **Fan-out** -- one event may trigger multiple downstream processes (notification, analytics, audit log). Design for this explicitly.
- **Backpressure** -- when producers generate data faster than consumers can process, the system needs buffering (queues), throttling, or load shedding strategies.

**Diagramming tips:**
- Show the happy path first, then add failure paths.
- Label arrows with protocol (HTTP, gRPC, TCP) and data format (JSON, Protobuf, Avro).
- Indicate synchronous vs. asynchronous communication visually.
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
      title: "Typical Web Application HLD Architecture",
      kind: "architecture",
      caption: "A standard high-level architecture showing clients, CDN, load balancer, application tier, caching, database, and async processing layers.",
      mermaid: `graph TB
    subgraph Clients
        WEB[Web Browser]
        MOB[Mobile App]
    end

    CDN[CDN / Edge Cache]
    LB[Load Balancer]

    subgraph Application Tier
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server N]
    end

    CACHE[(Redis Cache)]

    subgraph Data Stores
        PRIMARY[(Primary DB\nPostgreSQL)]
        REPLICA[(Read Replica)]
        BLOB[(Blob Storage\nS3)]
    end

    MQ[Message Queue\nKafka / SQS]

    subgraph Async Workers
        W1[Worker 1]
        W2[Worker 2]
    end

    NOTIFY[Notification\nService]

    WEB --> CDN --> LB
    MOB --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    API1 --> CACHE
    API2 --> CACHE
    CACHE --> PRIMARY
    API1 --> PRIMARY
    API2 --> REPLICA
    API3 --> BLOB
    API1 --> MQ
    MQ --> W1
    MQ --> W2
    W1 --> PRIMARY
    W2 --> NOTIFY`,
    },
    {
      title: "Request Flow Through System Components",
      kind: "sequence",
      caption: "Sequence diagram showing a typical read request path with cache-aside pattern, including cache miss and database fallback.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant LB as Load Balancer
    participant API as API Server
    participant Cache as Redis Cache
    participant DB as PostgreSQL

    C->>LB: GET /api/products/123
    LB->>API: Forward request
    API->>Cache: GET product:123
    alt Cache Hit
        Cache-->>API: Product data (cached)
        API-->>LB: 200 OK (from cache)
    else Cache Miss
        Cache-->>API: null
        API->>DB: SELECT * FROM products WHERE id=123
        DB-->>API: Product row
        API->>Cache: SETEX product:123 300 {data}
        Cache-->>API: OK
        API-->>LB: 200 OK (from DB)
    end
    LB-->>C: Response`,
    },
    {
      title: "Circuit Breaker State Machine",
      kind: "state",
      caption: "State transitions for a circuit breaker protecting downstream service calls.",
      mermaid: `stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Failure count >= threshold
    Open --> HalfOpen: Recovery timeout elapsed
    HalfOpen --> Closed: Success count >= threshold
    HalfOpen --> Open: Any failure
    Closed --> Closed: Success (reset counter)

    note right of Closed
        Normal operation.
        Requests pass through.
        Track failure count.
    end note

    note right of Open
        Requests rejected immediately.
        Wait for recovery timeout.
    end note

    note right of HalfOpen
        Allow limited test requests.
        Success closes circuit.
        Failure re-opens it.
    end note`,
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
    "**QPS Formula**: `DAU x actions_per_user / 86400` -- multiply by 2-5x for **peak QPS**",
    "**Cache sizing (80/20 rule)**: Cache *20% of daily unique requests* to serve **80% of traffic**",
    "**Availability math**: 99.9% = 8.7h/year, 99.99% = 52min/year, 99.999% = 5.2min/year",
    "**Caching strategies**: *Cache-aside* (app controls), *Write-through* (sync write to both), *Write-behind* (async flush to DB)",
    "**Database selection**: SQL for *ACID, joins, complex queries*; NoSQL for **high write throughput, flexible schema, key-value access**",
    "**Scaling patterns**: Vertical (bigger machine) -> Horizontal (more machines) -> Sharding (split data) -> **CQRS** (split read/write)",
    "**Failure handling**: Redundancy + Health checks + **Circuit breakers** + Retries with `exponential backoff` + Graceful degradation",
  ],
  revisionNotes: [
    "**Always start with requirements**: Clarify *functional* (what) and *non-functional* (how well) requirements before touching architecture. Quantify NFRs with specific numbers.",
    "**Back-of-envelope estimation** grounds decisions: Calculate *QPS*, storage, bandwidth, and cache needs. These numbers determine whether you need 1 server or 1000.",
    "**Component design** follows SRP: Each component (API gateway, services, databases, caches, queues) has a *single clear responsibility* with well-defined interfaces.",
    "**Data flow** is the backbone: Trace how requests move from client through each component. Separate *read paths* (cache-heavy) from **write paths** (consistency-focused).",
    "**Choose databases by access pattern**, not by popularity: SQL for transactions and complex queries, NoSQL for key-value lookups and horizontal scaling, search engines for full-text search.",
    "**Design for failure**: Every component *will* fail. Add redundancy, health checks, circuit breakers, retries with backoff, and **graceful degradation** for non-critical features.",
    "**Caching is critical** for read-heavy systems: Understand *cache-aside* vs. *write-through* vs. *write-behind*, and always have a **cache invalidation strategy** (TTL, event-driven, or versioned).",
  ],
  interviewQA: [
    {
      q: "How do you approach a high-level system design problem?",
      a: "Start by clarifying requirements: functional (features, use cases) and non-functional (latency, throughput, availability, consistency). Quantify NFRs with specific numbers. Then identify core entities and design the API from the user's perspective. Draw a component diagram showing services, data stores, caches, and queues with data flow arrows. Choose data stores based on access patterns. Design for scale by identifying bottlenecks. Finally, address failure modes and walk through key scenarios to validate the design.",
    },
    {
      q: "How do you decide between a SQL and NoSQL database in an HLD?",
      a: "Consider access patterns, consistency needs, and scale. SQL databases excel when you need strong consistency, complex queries with joins, ACID transactions, and a well-defined schema. NoSQL is better for high write throughput, flexible schemas, horizontal scaling, and access patterns that are key-value, document, or wide-column oriented. For example, use PostgreSQL for an order management system needing transactions, but DynamoDB for a session store needing low-latency key lookups at massive scale.",
    },
    {
      q: "What role does caching play in high-level design?",
      a: "Caching reduces database load and improves read latency by storing frequently accessed data in memory (Redis, Memcached). In HLD, consider cache-aside (application checks cache before database), write-through (writes update cache and database), and write-behind (writes update cache, async flush to database). Key decisions: what to cache (hot data), TTL strategy, cache invalidation approach, and cache size. Caching introduces eventual consistency -- the cache may serve stale data until invalidated or expired.",
    },
    {
      q: "How do you design for high availability in a system?",
      a: "Deploy across multiple availability zones or regions. Use load balancers to distribute traffic and detect unhealthy instances. Replicate databases with automatic failover (primary-replica). Use redundant message queues and caches. Implement health checks and circuit breakers. Design for graceful degradation -- if a non-critical service fails, the core functionality continues. Define an availability target (e.g., 99.99%) and calculate the error budget to guide design decisions.",
    },
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
      front: "Cache-aside vs. Write-through vs. Write-behind",
      back: "Cache-aside: app checks cache, on miss reads DB and populates cache. Write-through: writes go to cache AND DB synchronously. Write-behind: writes go to cache, async flush to DB later (risk of data loss). Each has different consistency and performance trade-offs.",
    },
    {
      front: "What is backpressure?",
      back: "When producers generate data faster than consumers can process it. Solutions: buffering (queues), throttling (rate limiting producers), load shedding (dropping low-priority requests), and scaling consumers horizontally.",
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
      front: "Common HLD pitfalls",
      back: "1. Skipping requirements clarification. 2. Over-engineering for unrealistic scale. 3. Ignoring failure modes. 4. Designing data models before understanding access patterns. 5. Not quantifying NFRs with specific numbers.",
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
        "An entry point for client requests that handles routing, authentication, rate limiting, SSL termination, and request/response transformation before forwarding to backend services.",
    },
    {
      term: "CDN (Content Delivery Network)",
      definition:
        "A geographically distributed network of servers that caches content close to users, reducing latency for static assets and cacheable API responses.",
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
