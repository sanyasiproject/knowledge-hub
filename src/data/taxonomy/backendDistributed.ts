import type { Domain } from "../schema";

export const backendAndDistributed: Domain[] = [
  {
    slug: "backend-engineering",
    title: "Backend Engineering",
    summary: "Building the servers, services, and data flows behind every application.",
    icon: "🛠️",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "server-fundamentals",
        title: "Server Fundamentals",
        summary: "How a backend handles a request.",
        topics: [
          { slug: "request-lifecycle", title: "Request Lifecycle", summary: "From DNS to response, end to end.", level: "Beginner", tags: ["backend"], contentReady: ["quick-summary", "animations", "diagrams", "interview-qa"], related: ["http", "dns", "tcp-handshake", "load-balancing", "caching-basics"] },
          { slug: "concurrency-models-backend", title: "Server Concurrency Models", summary: "Thread-per-request, event loop, and pools.", level: "Intermediate", tags: ["backend"], related: ["threads-vs-async", "background-jobs", "processes-vs-threads", "locks-and-atomics", "idempotency"] },
          { slug: "background-jobs", title: "Background Jobs & Queues", summary: "Deferring work outside the request path.", level: "Intermediate", tags: ["backend"], related: ["queues-vs-pubsub", "idempotency", "kafka-fundamentals", "rabbitmq-fundamentals", "concurrency-models-backend"] },
          { slug: "idempotency", title: "Idempotency", summary: "Making retries safe.", level: "Advanced", tags: ["backend"], related: ["delivery-guarantees", "background-jobs", "saga-pattern", "rate-limiting", "acid-transactions"] },
        ],
      },
    ],
  },
  {
    slug: "apis",
    title: "APIs",
    summary: "Designing the contracts through which systems talk.",
    icon: "🔌",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "api-styles",
        title: "API Styles",
        summary: "REST, GraphQL, and gRPC.",
        topics: [
          { slug: "rest", title: "REST", summary: "Resources, verbs, and statelessness.", level: "Beginner", tags: ["apis"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "interview-qa"], related: ["graphql", "grpc", "api-versioning", "http", "pagination-filtering"] },
          { slug: "graphql", title: "GraphQL", summary: "Client-specified queries over a typed schema.", level: "Intermediate", tags: ["apis"], related: ["rest", "grpc", "api-versioning", "pagination-filtering", "rate-limiting"] },
          { slug: "grpc", title: "gRPC", summary: "High-performance RPC over HTTP/2 and protobuf.", level: "Advanced", tags: ["apis"], related: ["rest", "graphql", "http", "tls-ssl", "api-versioning"] },
        ],
      },
      {
        slug: "api-design",
        title: "API Design",
        summary: "The concerns every API must handle.",
        topics: [
          { slug: "api-versioning", title: "Versioning & Evolution", summary: "Changing an API without breaking clients.", level: "Intermediate", tags: ["apis"], related: ["rest", "pagination-filtering", "rate-limiting", "graphql", "grpc"] },
          { slug: "pagination-filtering", title: "Pagination & Filtering", summary: "Serving large collections efficiently.", level: "Intermediate", tags: ["apis"], related: ["rest", "api-versioning", "rate-limiting", "caching-basics", "indexing"] },
          { slug: "rate-limiting", title: "Rate Limiting", summary: "Protecting services from overload.", level: "Advanced", tags: ["apis"], contentReady: ["quick-summary", "diagrams", "comparison", "interview-qa"], related: ["design-rate-limiter", "pagination-filtering", "redis-patterns", "distributed-caching", "idempotency"] },
        ],
      },
    ],
  },
  {
    slug: "auth",
    title: "Authentication & Authorization",
    summary: "Proving who a user is, and what they're allowed to do.",
    icon: "🔐",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "authn-authz",
        title: "AuthN & AuthZ",
        summary: "Identity and permission.",
        topics: [
          { slug: "authn-vs-authz", title: "Authentication vs Authorization", summary: "The two questions and why they differ.", level: "Beginner", tags: ["auth"], related: ["sessions-vs-tokens", "jwt", "oauth-oidc", "rbac-abac", "secure-coding"] },
          { slug: "sessions-vs-tokens", title: "Sessions vs Tokens", summary: "Stateful cookies vs stateless tokens.", level: "Intermediate", tags: ["auth"], related: ["authn-vs-authz", "jwt", "oauth-oidc", "crypto-basics", "rbac-abac"] },
          { slug: "oauth-oidc", title: "OAuth 2.0 & OpenID Connect", summary: "Delegated authorization and federated identity.", level: "Advanced", tags: ["auth"], contentReady: ["quick-summary", "animations", "diagrams", "interview-qa"], related: ["sessions-vs-tokens", "jwt", "authn-vs-authz", "rbac-abac", "tls-ssl"] },
          { slug: "jwt", title: "JWT", summary: "Self-contained signed tokens and their pitfalls.", level: "Advanced", tags: ["auth"], related: ["sessions-vs-tokens", "oauth-oidc", "crypto-basics", "hashing-passwords", "authn-vs-authz"] },
          { slug: "rbac-abac", title: "RBAC & ABAC", summary: "Modeling permissions at scale.", level: "Advanced", tags: ["auth"], related: ["authn-vs-authz", "oauth-oidc", "sessions-vs-tokens", "aws-iam", "azure-entra"] },
        ],
      },
    ],
  },
  {
    slug: "security",
    title: "Security",
    summary: "Protecting systems and data from misuse and attack.",
    icon: "🛡️",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "application-security",
        title: "Application Security",
        summary: "The vulnerabilities every engineer must know.",
        topics: [
          { slug: "owasp-top-10", title: "OWASP Top 10", summary: "The most critical web application risks.", level: "Intermediate", tags: ["security"], related: ["injection-attacks", "secure-coding", "crypto-basics", "hashing-passwords", "authn-vs-authz"] },
          { slug: "injection-attacks", title: "Injection (SQLi, XSS, CSRF)", summary: "When untrusted input becomes code.", level: "Intermediate", tags: ["security"], related: ["owasp-top-10", "secure-coding", "sql-basics", "crypto-basics", "hashing-passwords"] },
          { slug: "secure-coding", title: "Secure Coding Practices", summary: "Defensive habits that prevent classes of bugs.", level: "Advanced", tags: ["security"], related: ["owasp-top-10", "injection-attacks", "crypto-basics", "error-handling", "tls-ssl"] },
        ],
      },
      {
        slug: "cryptography",
        title: "Cryptography",
        summary: "The math that protects data.",
        topics: [
          { slug: "crypto-basics", title: "Cryptography Fundamentals", summary: "Symmetric, asymmetric, and hashing.", level: "Intermediate", tags: ["security", "crypto"], related: ["hashing-passwords", "tls-ssl", "jwt", "secure-coding", "owasp-top-10"] },
          { slug: "hashing-passwords", title: "Password Hashing", summary: "Salts, bcrypt/argon2, and why not to encrypt.", level: "Intermediate", tags: ["security", "crypto"], related: ["crypto-basics", "jwt", "sessions-vs-tokens", "secure-coding", "owasp-top-10"] },
          { slug: "pki-certificates", title: "PKI & Certificates", summary: "Trust, signing, and the certificate chain.", level: "Advanced", tags: ["security", "crypto"], related: ["tls-ssl", "crypto-basics", "secure-coding", "oauth-oidc", "hashing-passwords"] },
        ],
      },
    ],
  },
  {
    slug: "message-brokers",
    title: "Message Brokers",
    summary: "Decoupling services with asynchronous messaging.",
    icon: "📨",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "messaging-fundamentals",
        title: "Messaging Fundamentals",
        summary: "The patterns and guarantees of async messaging.",
        topics: [
          { slug: "queues-vs-pubsub", title: "Queues vs Pub/Sub", summary: "Point-to-point vs broadcast.", level: "Beginner", tags: ["messaging"], related: ["kafka-fundamentals", "rabbitmq-fundamentals", "delivery-guarantees", "background-jobs", "eda-fundamentals"] },
          { slug: "delivery-guarantees", title: "Delivery Guarantees", summary: "At-most-once, at-least-once, exactly-once.", level: "Advanced", tags: ["messaging"], related: ["queues-vs-pubsub", "kafka-fundamentals", "rabbitmq-reliability", "idempotency", "backpressure"] },
          { slug: "backpressure", title: "Backpressure & Flow Control", summary: "Preventing fast producers from overwhelming consumers.", level: "Advanced", tags: ["messaging"], related: ["delivery-guarantees", "queues-vs-pubsub", "kafka-internals", "rate-limiting", "concurrency-models-backend"] },
        ],
      },
    ],
  },
  {
    slug: "kafka",
    title: "Kafka",
    summary: "The distributed log at the heart of modern data pipelines.",
    icon: "🌊",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "kafka-core",
        title: "Core Kafka",
        summary: "The log, topics, and consumers.",
        topics: [
          { slug: "kafka-fundamentals", title: "Kafka Fundamentals", summary: "The distributed commit log model.", level: "Beginner", tags: ["kafka"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["topics-partitions", "consumers-groups", "kafka-internals", "queues-vs-pubsub", "eda-fundamentals"] },
          { slug: "topics-partitions", title: "Topics & Partitions", summary: "How Kafka distributes and orders data.", level: "Intermediate", tags: ["kafka"], related: ["kafka-fundamentals", "consumers-groups", "kafka-internals", "replication-partitioning", "delivery-guarantees"] },
          { slug: "consumers-groups", title: "Consumers & Consumer Groups", summary: "Scaling consumption and rebalancing.", level: "Intermediate", tags: ["kafka"], related: ["kafka-fundamentals", "topics-partitions", "kafka-internals", "delivery-guarantees", "backpressure"] },
          { slug: "kafka-internals", title: "Kafka Internals", summary: "ISR, replication, and the storage engine.", level: "Advanced Concepts", tags: ["kafka"], related: ["topics-partitions", "consumers-groups", "kafka-fundamentals", "replication-partitioning", "consensus"] },
        ],
      },
    ],
  },
  {
    slug: "rabbitmq",
    title: "RabbitMQ",
    summary: "The versatile message broker built on flexible routing.",
    icon: "🐰",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "rabbitmq-core",
        title: "Core RabbitMQ",
        summary: "Exchanges, queues, and reliability.",
        topics: [
          { slug: "rabbitmq-fundamentals", title: "RabbitMQ Fundamentals", summary: "The AMQP model.", level: "Beginner", tags: ["rabbitmq"], related: ["exchanges-bindings", "rabbitmq-reliability", "queues-vs-pubsub", "delivery-guarantees", "kafka-fundamentals"] },
          { slug: "exchanges-bindings", title: "Exchanges & Bindings", summary: "Direct, topic, fanout, and headers routing.", level: "Intermediate", tags: ["rabbitmq"], related: ["rabbitmq-fundamentals", "rabbitmq-reliability", "queues-vs-pubsub", "delivery-guarantees", "eda-fundamentals"] },
          { slug: "rabbitmq-reliability", title: "Acknowledgements & Reliability", summary: "Making sure messages aren't lost.", level: "Advanced", tags: ["rabbitmq"], related: ["rabbitmq-fundamentals", "exchanges-bindings", "delivery-guarantees", "idempotency", "backpressure"] },
        ],
      },
    ],
  },
  {
    slug: "event-driven-architecture",
    title: "Event-Driven Architecture",
    summary: "Systems that communicate through events rather than direct calls.",
    icon: "📡",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "eda-patterns",
        title: "EDA Patterns",
        summary: "The core patterns of event-driven systems.",
        topics: [
          { slug: "eda-fundamentals", title: "EDA Fundamentals", summary: "Events, producers, consumers, and choreography.", level: "Intermediate", tags: ["eda"], related: ["event-sourcing", "cqrs", "saga-pattern", "kafka-fundamentals", "queues-vs-pubsub"] },
          { slug: "event-sourcing", title: "Event Sourcing", summary: "Storing state as a sequence of events.", level: "Advanced", tags: ["eda"], related: ["eda-fundamentals", "cqrs", "saga-pattern", "aggregates", "acid-transactions"] },
          { slug: "cqrs", title: "CQRS", summary: "Separating read and write models.", level: "Advanced", tags: ["eda"], related: ["event-sourcing", "eda-fundamentals", "saga-pattern", "aggregates", "replication-partitioning"] },
          { slug: "saga-pattern", title: "Sagas", summary: "Coordinating distributed transactions.", level: "Advanced Concepts", tags: ["eda", "distributed"], related: ["cqrs", "event-sourcing", "eda-fundamentals", "distributed-caching", "acid-transactions"] },
        ],
      },
    ],
  },
  {
    slug: "distributed-systems",
    title: "Distributed Systems",
    summary: "Building correct, available systems from unreliable parts.",
    icon: "🕸️",
    group: "Backend & Distributed",
    categories: [
      {
        slug: "distributed-fundamentals",
        title: "Fundamentals",
        summary: "The laws and limits of distributed computing.",
        topics: [
          { slug: "cap-theorem", title: "CAP Theorem", summary: "Consistency, availability, partition tolerance — pick two.", level: "Intermediate", tags: ["distributed"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "comparison", "interview-qa"], related: ["consistency-models", "time-ordering", "consensus", "replication-partitioning", "fault-tolerance"] },
          { slug: "consistency-models", title: "Consistency Models", summary: "Strong, eventual, causal, and everything between.", level: "Advanced", tags: ["distributed"], related: ["cap-theorem", "isolation-levels", "time-ordering", "consensus", "replication-partitioning"] },
          { slug: "time-ordering", title: "Time, Clocks & Ordering", summary: "Logical clocks and why wall time lies.", level: "Advanced Concepts", tags: ["distributed"], related: ["consistency-models", "cap-theorem", "consensus", "leader-election", "distributed-caching"] },
        ],
      },
      {
        slug: "coordination-and-failure",
        title: "Coordination & Failure",
        summary: "Agreement and resilience across machines.",
        topics: [
          { slug: "consensus", title: "Consensus (Paxos, Raft)", summary: "Getting machines to agree despite failures.", level: "Advanced Concepts", tags: ["distributed"], related: ["leader-election", "fault-tolerance", "time-ordering", "replication-partitioning", "cap-theorem"] },
          { slug: "leader-election", title: "Leader Election", summary: "Choosing a coordinator safely.", level: "Advanced", tags: ["distributed"], related: ["consensus", "fault-tolerance", "time-ordering", "cap-theorem", "distributed-caching"] },
          { slug: "fault-tolerance", title: "Fault Tolerance & Replication", summary: "Surviving the failures that will happen.", level: "Advanced", tags: ["distributed", "reliability"], related: ["consensus", "leader-election", "resilience-patterns", "replication-partitioning", "cap-theorem"] },
        ],
      },
    ],
  },
];
