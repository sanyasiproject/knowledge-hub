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
