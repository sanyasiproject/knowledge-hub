import type { Domain } from "../schema";

export const architectureAndDesign: Domain[] = [
  {
    slug: "architecture-patterns",
    title: "Architecture Patterns",
    summary: "The high-level shapes systems take, and when each fits.",
    icon: "🏛️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "structural-styles",
        title: "Structural Styles",
        summary: "How a system is decomposed.",
        topics: [
          { slug: "monolith", title: "Monolithic Architecture", summary: "One deployable unit — simple until it isn't.", level: "Beginner", tags: ["architecture"], related: ["microservices", "layered-hexagonal", "serverless-arch", "hld-fundamentals", "deployment-models"] },
          { slug: "microservices", title: "Microservices", summary: "Independently deployable services around business capabilities.", level: "Advanced", tags: ["architecture"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"], related: ["monolith", "serverless-arch", "bounded-contexts", "saga-pattern", "layered-hexagonal"] },
          { slug: "layered-hexagonal", title: "Layered & Hexagonal", summary: "Organizing code around boundaries and ports.", level: "Intermediate", tags: ["architecture"], related: ["monolith", "microservices", "lld-fundamentals", "bounded-contexts", "separation-of-concerns"] },
          { slug: "serverless-arch", title: "Serverless Architecture", summary: "Functions and managed services with no servers to run.", level: "Advanced", tags: ["architecture"], related: ["monolith", "microservices", "aws-compute", "deployment-models", "cloud-cost"] },
        ],
      },
    ],
  },
  {
    slug: "domain-driven-design",
    title: "Domain-Driven Design",
    summary: "Aligning software design with the business domain.",
    icon: "🗺️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "strategic-ddd",
        title: "Strategic Design",
        summary: "Modeling the big picture.",
        topics: [
          { slug: "ubiquitous-language", title: "Ubiquitous Language", summary: "A shared language between devs and domain experts.", level: "Intermediate", tags: ["ddd"], related: ["bounded-contexts", "entities-value-objects", "aggregates", "lld-fundamentals", "class-design"] },
          { slug: "bounded-contexts", title: "Bounded Contexts", summary: "Explicit boundaries around models.", level: "Advanced", tags: ["ddd"], related: ["ubiquitous-language", "microservices", "aggregates", "entities-value-objects", "event-sourcing"] },
        ],
      },
      {
        slug: "tactical-ddd",
        title: "Tactical Design",
        summary: "Modeling within a context.",
        topics: [
          { slug: "entities-value-objects", title: "Entities & Value Objects", summary: "Identity vs value in the model.", level: "Intermediate", tags: ["ddd"], related: ["aggregates", "ubiquitous-language", "bounded-contexts", "class-design", "lld-fundamentals"] },
          { slug: "aggregates", title: "Aggregates & Repositories", summary: "Consistency boundaries and persistence.", level: "Advanced", tags: ["ddd"], related: ["entities-value-objects", "bounded-contexts", "event-sourcing", "cqrs", "ubiquitous-language"] },
        ],
      },
    ],
  },
  {
    slug: "high-level-design",
    title: "High-Level Design (HLD)",
    summary: "Designing the architecture and major components of a system.",
    icon: "🏗️",
    group: "Architecture & Design",
    categories: [
      {
        slug: "hld-core",
        title: "Core HLD",
        summary: "The building blocks and how to reason about them.",
        topics: [
          { slug: "hld-fundamentals", title: "HLD Fundamentals", summary: "Components, data flow, and boundaries.", level: "Intermediate", tags: ["hld", "system-design"], related: ["system-design-framework", "estimation", "tradeoff-analysis", "building-blocks", "microservices"] },
          { slug: "estimation", title: "Back-of-Envelope Estimation", summary: "Sizing traffic, storage, and bandwidth.", level: "Advanced", tags: ["hld", "system-design"], related: ["hld-fundamentals", "system-design-framework", "tradeoff-analysis", "capacity-planning", "latency-throughput"] },
          { slug: "tradeoff-analysis", title: "Trade-off Analysis", summary: "Reasoning about competing designs.", level: "Advanced", tags: ["hld", "system-design"], related: ["hld-fundamentals", "estimation", "system-design-framework", "cap-theorem", "consistency-models"] },
        ],
      },
    ],
  },
  {
    slug: "low-level-design",
    title: "Low-Level Design (LLD)",
    summary: "Designing classes, interfaces, and interactions in detail.",
    icon: "🧰",
    group: "Architecture & Design",
    categories: [
      {
        slug: "lld-core",
        title: "Core LLD",
        summary: "Turning requirements into clean object models.",
        topics: [
          { slug: "lld-fundamentals", title: "LLD Fundamentals", summary: "Responsibilities, interfaces, and interactions.", level: "Intermediate", tags: ["lld"], related: ["class-design", "lld-case-studies", "single-responsibility", "coupling-cohesion", "interfaces-abstract-classes"] },
          { slug: "class-design", title: "Class & API Design", summary: "Designing cohesive, well-encapsulated classes.", level: "Advanced", tags: ["lld"], related: ["lld-fundamentals", "lld-case-studies", "encapsulation", "coupling-cohesion", "single-responsibility"] },
          { slug: "lld-case-studies", title: "LLD Case Studies", summary: "Parking lot, elevator, rate limiter, and more.", level: "Advanced", tags: ["lld"], related: ["lld-fundamentals", "class-design", "design-rate-limiter", "design-url-shortener", "hld-fundamentals"] },
        ],
      },
    ],
  },
  {
    slug: "system-design",
    title: "System Design",
    summary: "Designing large-scale systems end to end — the interview and the craft.",
    icon: "🧭",
    group: "Architecture & Design",
    categories: [
      {
        slug: "system-design-core",
        title: "Framework & Building Blocks",
        summary: "A repeatable approach and the reusable pieces.",
        topics: [
          { slug: "system-design-framework", title: "A System Design Framework", summary: "Requirements, estimation, high-level design, deep dive.", level: "Intermediate", tags: ["system-design"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["hld-fundamentals", "building-blocks", "estimation", "tradeoff-analysis", "design-url-shortener"] },
          { slug: "building-blocks", title: "Common Building Blocks", summary: "Load balancers, caches, queues, CDNs, databases.", level: "Intermediate", tags: ["system-design"], related: ["system-design-framework", "hld-fundamentals", "load-balancing", "caching-basics", "rate-limiting"] },
        ],
      },
      {
        slug: "system-design-problems",
        title: "Classic Problems",
        summary: "The systems asked about again and again.",
        topics: [
          { slug: "design-url-shortener", title: "Design a URL Shortener", summary: "Hashing, storage, and redirects at scale.", level: "Intermediate", tags: ["system-design"], related: ["system-design-framework", "building-blocks", "hashing-passwords", "caching-basics", "rate-limiting"] },
          { slug: "design-news-feed", title: "Design a News Feed", summary: "Fan-out on write vs read.", level: "Advanced", tags: ["system-design"], related: ["system-design-framework", "building-blocks", "caching-basics", "replication-partitioning", "kafka-fundamentals"] },
          { slug: "design-chat-system", title: "Design a Chat System", summary: "Real-time messaging and presence.", level: "Advanced", tags: ["system-design"], related: ["system-design-framework", "building-blocks", "eda-fundamentals", "delivery-guarantees", "redis-patterns"] },
          { slug: "design-rate-limiter", title: "Design a Rate Limiter", summary: "Algorithms and distributed enforcement.", level: "Advanced", tags: ["system-design"], related: ["system-design-framework", "rate-limiting", "redis-patterns", "distributed-caching", "building-blocks"] },
        ],
      },
      {
        slug: "real-world-systems",
        title: "Real-World System Designs",
        summary: "End-to-end designs of systems used by billions.",
        topics: [
          { slug: "design-instagram", title: "Design Instagram", summary: "Photo sharing, CDN, feed generation.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-news-feed", "design-cdn", "building-blocks", "caching-basics", "design-youtube"] },
          { slug: "design-twitter", title: "Design Twitter/X", summary: "Timeline, fan-out, real-time.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-news-feed", "design-instagram", "kafka-fundamentals", "caching-basics", "design-notification-system"] },
          { slug: "design-youtube", title: "Design YouTube", summary: "Video upload, transcoding, streaming.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-netflix", "design-cdn", "design-object-storage", "design-message-queue", "building-blocks"] },
          { slug: "design-uber", title: "Design Uber/Ride Sharing", summary: "Matching, real-time location, pricing.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-google-maps", "design-notification-system", "design-message-queue", "design-distributed-cache", "design-task-scheduler"] },
          { slug: "design-whatsapp", title: "Design WhatsApp", summary: "E2E encryption, message delivery, groups.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-chat-system", "design-notification-system", "design-message-queue", "design-distributed-cache", "building-blocks"] },
          { slug: "design-netflix", title: "Design Netflix", summary: "Video streaming, recommendations, CDN.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-youtube", "design-cdn", "design-object-storage", "design-distributed-cache", "building-blocks"] },
          { slug: "design-amazon", title: "Design Amazon E-commerce", summary: "Product catalog, cart, orders, payments.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-payment-system", "design-search-engine", "design-notification-system", "design-distributed-cache", "design-message-queue"] },
          { slug: "design-google-maps", title: "Design Google Maps", summary: "Geospatial, routing, tiles.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-uber", "design-cdn", "design-distributed-cache", "design-object-storage", "building-blocks"] },
          { slug: "design-spotify", title: "Design Spotify", summary: "Audio streaming, playlists, recommendations.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-netflix", "design-youtube", "design-cdn", "design-distributed-cache", "design-notification-system"] },
          { slug: "design-tinder", title: "Design Tinder/Dating App", summary: "Matching, geolocation, swiping.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-uber", "design-google-maps", "design-notification-system", "design-distributed-cache", "design-message-queue"] },
        ],
      },
      {
        slug: "infrastructure-systems",
        title: "Infrastructure Systems",
        summary: "The foundational systems that other systems depend on.",
        topics: [
          { slug: "design-distributed-cache", title: "Design Distributed Cache", summary: "Like Redis cluster — consistent hashing, eviction, replication.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["distributed-caching", "caching-basics", "redis-cluster", "design-load-balancer", "building-blocks"] },
          { slug: "design-message-queue", title: "Design Message Queue", summary: "Like Kafka/RabbitMQ — topics, partitions, guarantees.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["kafka-fundamentals", "delivery-guarantees", "design-notification-system", "design-task-scheduler", "building-blocks"] },
          { slug: "design-search-engine", title: "Design Search Engine", summary: "Crawling, indexing, ranking.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["inverted-index", "design-web-crawler", "design-typeahead", "es-querying", "building-blocks"] },
          { slug: "design-object-storage", title: "Design Object Storage", summary: "Like S3 — metadata, erasure coding, durability.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-cdn", "design-youtube", "replication-partitioning", "consistency-models", "building-blocks"] },
          { slug: "design-cdn", title: "Design a CDN", summary: "Edge caching, routing, invalidation.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-object-storage", "design-youtube", "design-netflix", "caching-basics", "building-blocks"] },
          { slug: "design-load-balancer", title: "Design a Load Balancer", summary: "L4/L7, algorithms, health checks.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["load-balancing", "design-distributed-cache", "design-cdn", "building-blocks", "hld-fundamentals"] },
          { slug: "design-distributed-id", title: "Design Distributed ID Generator", summary: "Snowflake, UUID, coordination-free generation.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-url-shortener", "design-distributed-cache", "sharding", "building-blocks", "hld-fundamentals"] },
          { slug: "design-task-scheduler", title: "Design Distributed Task Scheduler", summary: "Cron at scale — scheduling, execution, reliability.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-message-queue", "design-notification-system", "leader-election", "building-blocks", "hld-fundamentals"] },
        ],
      },
      {
        slug: "data-intensive-systems",
        title: "Data-Intensive Systems",
        summary: "Systems where data volume, velocity, or variety is the core challenge.",
        topics: [
          { slug: "design-notification-system", title: "Design Notification System", summary: "Push, email, SMS, in-app.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-message-queue", "design-task-scheduler", "design-whatsapp", "kafka-fundamentals", "building-blocks"] },
          { slug: "design-typeahead", title: "Design Typeahead/Autocomplete", summary: "Trie, prefix search, ranking.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-search-engine", "trie-template", "design-distributed-cache", "building-blocks", "hld-fundamentals"] },
          { slug: "design-web-crawler", title: "Design Web Crawler", summary: "Distributed crawling, politeness, deduplication.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-search-engine", "design-message-queue", "design-url-shortener", "building-blocks", "hld-fundamentals"] },
          { slug: "design-pastebin", title: "Design Pastebin", summary: "Short-lived content, sharing, access control.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-url-shortener", "design-object-storage", "design-cdn", "building-blocks", "hld-fundamentals"] },
          { slug: "design-google-docs", title: "Design Google Docs", summary: "Real-time collaboration, OT/CRDT.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-whatsapp", "design-notification-system", "consistency-models", "building-blocks", "hld-fundamentals"] },
          { slug: "design-payment-system", title: "Design Payment System", summary: "Idempotency, reconciliation, reliability.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-amazon", "idempotency", "saga-pattern", "acid-transactions", "building-blocks"] },
          { slug: "design-ticketmaster", title: "Design Ticketmaster", summary: "High-concurrency booking, seat selection.", level: "Advanced", tags: ["system-design", "hld", "lld"], contentReady: ["quick-summary", "detailed-explanation", "deep-dive", "code-examples", "diagrams", "interview-qa", "mcqs", "flashcards", "exercises", "revision-notes", "cheat-sheet", "glossary", "comparison", "follow-ups", "resources"], related: ["design-payment-system", "design-distributed-cache", "design-notification-system", "design-load-balancer", "building-blocks"] },
        ],
      },
    ],
  },
];
