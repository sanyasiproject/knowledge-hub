import type { TopicContent } from "../types";

export const microservices: TopicContent = {
  quickSummary: [
    "Microservices architecture decomposes applications into small, independently deployable services, each owning its own data and business logic.",
    "Inter-service communication happens via synchronous (REST, gRPC) or asynchronous (message queues, event streams) mechanisms, each with distinct trade-offs.",
    "A service mesh (e.g., Istio, Linkerd) provides infrastructure-level capabilities like traffic management, observability, and mutual TLS without changing application code.",
    "Key challenges include distributed data management, network reliability, operational complexity, and ensuring end-to-end observability across dozens or hundreds of services.",
  ],
  detailed: [
    `## Service Boundaries and Decomposition

Defining the right service boundaries is the most critical design decision in a microservices architecture. A well-bounded service encapsulates a single business capability and owns its data store (Database-per-Service pattern). Boundaries are typically derived from Domain-Driven Design bounded contexts.

**Decomposition strategies:**
- **By business capability** -- align services to organizational functions (e.g., Order Management, Inventory, Payments).
- **By subdomain** -- identify core, supporting, and generic subdomains and carve services accordingly.
- **Strangler Fig pattern** -- incrementally extract services from a monolith by intercepting calls at the edge.

A service should be small enough to be owned by a single team but large enough to represent a meaningful business function. The "two-pizza team" heuristic is a useful but imperfect proxy.`,

    `## Inter-Service Communication

Communication between microservices falls into two broad categories:

**Synchronous (request-response):**
- REST over HTTP -- widely understood, tooling-rich, but chatty for complex workflows.
- gRPC -- binary protocol with strong typing via Protocol Buffers; lower latency, streaming support, but harder to debug.

**Asynchronous (event-driven):**
- Message queues (RabbitMQ, SQS) -- point-to-point delivery with guaranteed ordering within a queue.
- Event streams (Kafka, Kinesis) -- durable, replayable log; enables event sourcing and CQRS patterns.

**Key considerations:**
- Synchronous calls introduce temporal coupling; cascading failures propagate through call chains.
- Asynchronous messaging improves resilience but adds eventual consistency and idempotency requirements.
- The Saga pattern coordinates distributed transactions across services using a sequence of local transactions and compensating actions.`,

    `## Service Mesh

A service mesh is a dedicated infrastructure layer that manages service-to-service communication. It deploys a sidecar proxy (e.g., Envoy) alongside each service instance.

**Core capabilities:**
- **Traffic management** -- canary releases, A/B testing, circuit breaking, retries with jitter, rate limiting.
- **Security** -- mutual TLS (mTLS) encryption, fine-grained authorization policies, certificate rotation.
- **Observability** -- distributed tracing, metrics collection, access logging without code instrumentation.

**Popular implementations:**
- Istio -- feature-rich but operationally heavy; strong policy and security model.
- Linkerd -- lightweight, Rust-based data plane; easier to operate; focuses on simplicity.
- AWS App Mesh -- managed service mesh for AWS workloads.

A service mesh adds latency (typically 1-3 ms per hop) and operational complexity. Evaluate whether your scale justifies the investment.`,

    `## Challenges and Mitigation

**Distributed data management:**
- No cross-service joins; use API composition or CQRS read models.
- Eventual consistency requires careful UX design (e.g., optimistic UI updates).

**Network reliability:**
- Apply the circuit breaker pattern (Hystrix, Resilience4j) to prevent cascading failures.
- Implement retries with exponential backoff and jitter.
- Design for idempotency on all write endpoints.

**Operational complexity:**
- Centralized logging (ELK, Datadog) and distributed tracing (Jaeger, Zipkin) are non-negotiable.
- Container orchestration (Kubernetes) simplifies deployment but has a steep learning curve.
- Feature flags and progressive delivery reduce blast radius of deployments.

**Testing:**
- Contract testing (Pact) validates API compatibility between producer and consumer.
- Integration and end-to-end tests are expensive; invest in strong unit and contract tests.
- Use consumer-driven contracts to decouple release cycles.`,

    `## When to Use Microservices

Microservices are not universally superior to monoliths. Consider microservices when:
- The application has multiple distinct business domains with different scaling requirements.
- Multiple teams need to deploy independently and frequently.
- You need technology heterogeneity (different languages or databases for different services).

Stick with a modular monolith when:
- The team is small (fewer than 10 engineers).
- The domain is not well understood yet and boundaries are likely to shift.
- Operational maturity (CI/CD, monitoring, container orchestration) is low.

Martin Fowler's "Monolith First" advice remains sound: start simple, extract services when the pain of the monolith outweighs the complexity of distribution.`,
  ],
  interviewQA: [
    {
      q: "How do you determine the right boundaries for a microservice?",
      a: "Start with Domain-Driven Design: identify bounded contexts through event storming or domain modeling workshops with domain experts. Each bounded context is a candidate service boundary. Validate by checking that the service owns its data, can be deployed independently, and maps to a single team's ownership. Avoid splitting too finely -- a service should represent a meaningful business capability, not a single CRUD entity.",
    },
    {
      q: "What are the trade-offs between synchronous and asynchronous inter-service communication?",
      a: "Synchronous communication (REST, gRPC) is simpler to reason about and debug but creates temporal coupling -- if the downstream service is unavailable, the caller fails. Asynchronous communication (message queues, event streams) decouples services in time, improving resilience and enabling event-driven architectures, but introduces eventual consistency, requires idempotent consumers, and makes debugging harder due to non-linear execution flows. Most production systems use a mix of both.",
    },
    {
      q: "How do you handle distributed transactions across microservices?",
      a: "Avoid distributed transactions (2PC) in microservices because they create tight coupling and reduce availability. Instead, use the Saga pattern: each service performs a local transaction and publishes an event; subsequent services react to the event and perform their own local transactions. If a step fails, compensating transactions undo the previous steps. Sagas can be orchestrated (a central coordinator directs the flow) or choreographed (services react to events independently). Orchestration is easier to reason about; choreography is more loosely coupled.",
    },
    {
      q: "What is a service mesh and when would you introduce one?",
      a: "A service mesh is an infrastructure layer that handles service-to-service communication concerns -- traffic routing, load balancing, mutual TLS, retries, circuit breaking, and observability -- via sidecar proxies deployed alongside each service. Introduce one when you have a significant number of services (typically 20+), need consistent security policies across services, or require advanced traffic management (canary deployments, traffic mirroring) without modifying application code. For smaller deployments, library-based solutions (Resilience4j, Polly) may suffice with less operational overhead.",
    },
  ],
  mcqs: [
    {
      q: "Which pattern is most appropriate for handling distributed transactions in a microservices architecture?",
      options: [
        "Two-Phase Commit (2PC)",
        "Saga pattern with compensating transactions",
        "Distributed lock manager",
        "Global transaction coordinator",
      ],
      answerIndex: 1,
      explanation:
        "The Saga pattern is preferred in microservices because it avoids the tight coupling and availability issues of 2PC. Each service performs a local transaction and publishes events; compensating transactions handle rollback scenarios.",
    },
    {
      q: "What is the primary benefit of the Database-per-Service pattern?",
      options: [
        "Simplified cross-service queries",
        "Reduced storage costs through shared schemas",
        "Independent data evolution and loose coupling between services",
        "Automatic data consistency across services",
      ],
      answerIndex: 2,
      explanation:
        "Database-per-Service ensures each service can evolve its data schema independently without coordinating with other teams. The trade-off is that cross-service queries require API composition or CQRS read models.",
    },
    {
      q: "What does a service mesh sidecar proxy handle?",
      options: [
        "Business logic execution and data transformation",
        "Database connection pooling and query optimization",
        "Traffic management, mTLS, and observability at the network level",
        "Application-level caching and session management",
      ],
      answerIndex: 2,
      explanation:
        "A sidecar proxy (e.g., Envoy) intercepts all network traffic to and from a service, handling cross-cutting concerns like routing, encryption, retries, and metrics collection transparently to the application.",
    },
    {
      q: "Which communication pattern best supports temporal decoupling between services?",
      options: [
        "Synchronous REST calls with retries",
        "gRPC with bidirectional streaming",
        "Asynchronous messaging via an event broker",
        "Direct database sharing between services",
      ],
      answerIndex: 2,
      explanation:
        "Asynchronous messaging via an event broker (e.g., Kafka, RabbitMQ) decouples services in time -- the producer and consumer do not need to be available simultaneously. This improves resilience and enables event-driven architectures.",
    },
  ],
  flashcards: [
    {
      front: "What is the Strangler Fig pattern?",
      back: "An incremental migration strategy where new functionality is built as microservices while existing monolith functionality is gradually replaced. An edge layer routes requests to either the monolith or the new service based on the migration progress.",
    },
    {
      front: "What is the Circuit Breaker pattern?",
      back: "A resilience pattern that monitors failures to a downstream service. When failures exceed a threshold, the circuit 'opens' and requests fail fast without calling the downstream service, preventing cascading failures. After a timeout, the circuit enters 'half-open' state to test recovery.",
    },
    {
      front: "What is consumer-driven contract testing?",
      back: "A testing approach where the consumer of an API defines a contract specifying the interactions it expects. The provider verifies it satisfies all consumer contracts. This decouples release cycles while ensuring API compatibility. Pact is a popular framework for this.",
    },
    {
      front: "What is the Sidecar pattern?",
      back: "A deployment pattern where a helper container (sidecar) is co-deployed alongside the main application container in the same pod. The sidecar handles cross-cutting concerns like logging, monitoring, or networking (as in a service mesh) without modifying the application.",
    },
    {
      front: "Orchestration vs. Choreography in Sagas",
      back: "Orchestration uses a central coordinator that directs each participant; easier to understand and monitor but creates a single point of coupling. Choreography has each service react to events independently; more decoupled but harder to trace and debug the overall flow.",
    },
    {
      front: "What is API Composition?",
      back: "A query pattern for microservices where an API composer service calls multiple downstream services, collects their responses, and joins the data in memory. It replaces cross-service database joins that are not possible with Database-per-Service.",
    },
    {
      front: "What is the Bulkhead pattern?",
      back: "A resilience pattern that isolates components into pools (like compartments in a ship) so that a failure in one does not cascade to others. For example, using separate thread pools or connection pools for calls to different downstream services.",
    },
  ],
  glossary: [
    {
      term: "Bounded Context",
      definition:
        "A DDD concept defining an explicit boundary within which a domain model applies. In microservices, each bounded context typically maps to one service.",
    },
    {
      term: "Service Mesh",
      definition:
        "A dedicated infrastructure layer for managing service-to-service communication, providing traffic management, security (mTLS), and observability through sidecar proxies.",
    },
    {
      term: "Saga Pattern",
      definition:
        "A pattern for managing distributed transactions as a sequence of local transactions, each publishing events that trigger subsequent steps, with compensating transactions for rollback.",
    },
    {
      term: "CQRS (Command Query Responsibility Segregation)",
      definition:
        "An architectural pattern that separates read and write models, allowing each to be optimized independently. Often used with event sourcing in microservices.",
    },
    {
      term: "Idempotency",
      definition:
        "The property of an operation that produces the same result regardless of how many times it is executed. Essential in distributed systems where messages may be delivered more than once.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A stability pattern that prevents cascading failures by detecting repeated failures to a downstream service and short-circuiting requests until the service recovers.",
    },
    {
      term: "Event Sourcing",
      definition:
        "A pattern where state changes are stored as an immutable sequence of events rather than as mutable records. The current state is derived by replaying events.",
    },
  ],
};
