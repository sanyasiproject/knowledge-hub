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
          { slug: "request-lifecycle", title: "Request Lifecycle", summary: "From DNS to response, end to end.", level: "Beginner", tags: ["backend"], contentReady: ["quick-summary", "animations", "diagrams", "interview-qa"] },
          { slug: "concurrency-models-backend", title: "Server Concurrency Models", summary: "Thread-per-request, event loop, and pools.", level: "Intermediate", tags: ["backend"] },
          { slug: "background-jobs", title: "Background Jobs & Queues", summary: "Deferring work outside the request path.", level: "Intermediate", tags: ["backend"] },
          { slug: "idempotency", title: "Idempotency", summary: "Making retries safe.", level: "Advanced", tags: ["backend"] },
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
          { slug: "rest", title: "REST", summary: "Resources, verbs, and statelessness.", level: "Beginner", tags: ["apis"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "interview-qa"] },
          { slug: "graphql", title: "GraphQL", summary: "Client-specified queries over a typed schema.", level: "Intermediate", tags: ["apis"] },
          { slug: "grpc", title: "gRPC", summary: "High-performance RPC over HTTP/2 and protobuf.", level: "Advanced", tags: ["apis"] },
        ],
      },
      {
        slug: "api-design",
        title: "API Design",
        summary: "The concerns every API must handle.",
        topics: [
          { slug: "api-versioning", title: "Versioning & Evolution", summary: "Changing an API without breaking clients.", level: "Intermediate", tags: ["apis"] },
          { slug: "pagination-filtering", title: "Pagination & Filtering", summary: "Serving large collections efficiently.", level: "Intermediate", tags: ["apis"] },
          { slug: "rate-limiting", title: "Rate Limiting", summary: "Protecting services from overload.", level: "Advanced", tags: ["apis"], contentReady: ["quick-summary", "diagrams", "comparison", "interview-qa"] },
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
          { slug: "authn-vs-authz", title: "Authentication vs Authorization", summary: "The two questions and why they differ.", level: "Beginner", tags: ["auth"] },
          { slug: "sessions-vs-tokens", title: "Sessions vs Tokens", summary: "Stateful cookies vs stateless tokens.", level: "Intermediate", tags: ["auth"] },
          { slug: "oauth-oidc", title: "OAuth 2.0 & OpenID Connect", summary: "Delegated authorization and federated identity.", level: "Advanced", tags: ["auth"], contentReady: ["quick-summary", "animations", "diagrams", "interview-qa"] },
          { slug: "jwt", title: "JWT", summary: "Self-contained signed tokens and their pitfalls.", level: "Advanced", tags: ["auth"] },
          { slug: "rbac-abac", title: "RBAC & ABAC", summary: "Modeling permissions at scale.", level: "Advanced", tags: ["auth"] },
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
          { slug: "owasp-top-10", title: "OWASP Top 10", summary: "The most critical web application risks.", level: "Intermediate", tags: ["security"] },
          { slug: "injection-attacks", title: "Injection (SQLi, XSS, CSRF)", summary: "When untrusted input becomes code.", level: "Intermediate", tags: ["security"] },
          { slug: "secure-coding", title: "Secure Coding Practices", summary: "Defensive habits that prevent classes of bugs.", level: "Advanced", tags: ["security"] },
        ],
      },
      {
        slug: "cryptography",
        title: "Cryptography",
        summary: "The math that protects data.",
        topics: [
          { slug: "crypto-basics", title: "Cryptography Fundamentals", summary: "Symmetric, asymmetric, and hashing.", level: "Intermediate", tags: ["security", "crypto"] },
          { slug: "hashing-passwords", title: "Password Hashing", summary: "Salts, bcrypt/argon2, and why not to encrypt.", level: "Intermediate", tags: ["security", "crypto"] },
          { slug: "pki-certificates", title: "PKI & Certificates", summary: "Trust, signing, and the certificate chain.", level: "Advanced", tags: ["security", "crypto"] },
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
          { slug: "queues-vs-pubsub", title: "Queues vs Pub/Sub", summary: "Point-to-point vs broadcast.", level: "Beginner", tags: ["messaging"] },
          { slug: "delivery-guarantees", title: "Delivery Guarantees", summary: "At-most-once, at-least-once, exactly-once.", level: "Advanced", tags: ["messaging"] },
          { slug: "backpressure", title: "Backpressure & Flow Control", summary: "Preventing fast producers from overwhelming consumers.", level: "Advanced", tags: ["messaging"] },
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
          { slug: "kafka-fundamentals", title: "Kafka Fundamentals", summary: "The distributed commit log model.", level: "Beginner", tags: ["kafka"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"] },
          { slug: "topics-partitions", title: "Topics & Partitions", summary: "How Kafka distributes and orders data.", level: "Intermediate", tags: ["kafka"] },
          { slug: "consumers-groups", title: "Consumers & Consumer Groups", summary: "Scaling consumption and rebalancing.", level: "Intermediate", tags: ["kafka"] },
          { slug: "kafka-internals", title: "Kafka Internals", summary: "ISR, replication, and the storage engine.", level: "Advanced Concepts", tags: ["kafka"] },
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
          { slug: "rabbitmq-fundamentals", title: "RabbitMQ Fundamentals", summary: "The AMQP model.", level: "Beginner", tags: ["rabbitmq"] },
          { slug: "exchanges-bindings", title: "Exchanges & Bindings", summary: "Direct, topic, fanout, and headers routing.", level: "Intermediate", tags: ["rabbitmq"] },
          { slug: "rabbitmq-reliability", title: "Acknowledgements & Reliability", summary: "Making sure messages aren't lost.", level: "Advanced", tags: ["rabbitmq"] },
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
          { slug: "eda-fundamentals", title: "EDA Fundamentals", summary: "Events, producers, consumers, and choreography.", level: "Intermediate", tags: ["eda"] },
          { slug: "event-sourcing", title: "Event Sourcing", summary: "Storing state as a sequence of events.", level: "Advanced", tags: ["eda"] },
          { slug: "cqrs", title: "CQRS", summary: "Separating read and write models.", level: "Advanced", tags: ["eda"] },
          { slug: "saga-pattern", title: "Sagas", summary: "Coordinating distributed transactions.", level: "Advanced Concepts", tags: ["eda", "distributed"] },
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
          { slug: "cap-theorem", title: "CAP Theorem", summary: "Consistency, availability, partition tolerance — pick two.", level: "Intermediate", tags: ["distributed"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "comparison", "interview-qa"] },
          { slug: "consistency-models", title: "Consistency Models", summary: "Strong, eventual, causal, and everything between.", level: "Advanced", tags: ["distributed"] },
          { slug: "time-ordering", title: "Time, Clocks & Ordering", summary: "Logical clocks and why wall time lies.", level: "Advanced Concepts", tags: ["distributed"] },
        ],
      },
      {
        slug: "coordination-and-failure",
        title: "Coordination & Failure",
        summary: "Agreement and resilience across machines.",
        topics: [
          { slug: "consensus", title: "Consensus (Paxos, Raft)", summary: "Getting machines to agree despite failures.", level: "Advanced Concepts", tags: ["distributed"] },
          { slug: "leader-election", title: "Leader Election", summary: "Choosing a coordinator safely.", level: "Advanced", tags: ["distributed"] },
          { slug: "fault-tolerance", title: "Fault Tolerance & Replication", summary: "Surviving the failures that will happen.", level: "Advanced", tags: ["distributed", "reliability"] },
        ],
      },
    ],
  },
];
