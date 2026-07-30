import type { TopicContent } from "../types";

export const systemDesignFramework: TopicContent = {
  quickSummary: [
    "A system design interview follows a structured framework: Requirements Gathering (5 min), Back-of-the-Envelope Estimation (5 min), High-Level Design (10 min), Deep Dive (15 min), and Wrap-Up (5 min). This structure ensures you cover breadth before depth.",
    "Requirements gathering distinguishes functional requirements (what the system does) from non-functional requirements (availability, latency, consistency, durability). Clarifying these upfront prevents designing the wrong system.",
    "Back-of-the-envelope estimation grounds your design in reality: DAU, QPS, storage, bandwidth, and memory calculations determine whether you need 1 server or 1000, and which bottlenecks to address.",
    "The deep dive phase is where you differentiate yourself. Pick 2-3 components critical to the system's non-functional requirements and design them thoroughly, discussing trade-offs and alternatives.",
  ],
  detailed: [
    "## Requirements Gathering\n\nSpend the first 5 minutes asking clarifying questions. For functional requirements, identify the core use cases: 'Users can post tweets and follow other users.' For non-functional requirements, clarify: What is the expected scale (DAU, peak QPS)? What are the latency requirements (p99 < 200ms)? Is consistency or availability more important (can users see slightly stale data)? Is the system read-heavy or write-heavy? What is the data retention policy? Geographic distribution? Write down the agreed requirements on the whiteboard. This alignment prevents you from designing a globally distributed system when the interviewer expected a single-region MVP.",
    "## Back-of-the-Envelope Estimation\n\nEstimate key numbers to drive architectural decisions. Start with DAU, then derive: **QPS** = DAU x actions_per_user / 86400. **Peak QPS** = QPS x 2-5. **Storage** = new_records_per_day x record_size x retention_days. **Bandwidth** = QPS x avg_response_size. **Memory for cache** = QPS x avg_response_size x cache_duration_seconds (or use the 80/20 rule: cache 20% of daily requests). Example: 100M DAU, 10 reads/day = ~12K QPS, peak ~50K QPS. If avg response is 1KB, bandwidth = 50MB/s. These numbers tell you whether a single database suffices or you need sharding, whether you need a CDN, and how much cache memory to provision.",
    "## High-Level Design\n\nSketch the system's major components and their interactions. Start with clients (web, mobile) connecting through a load balancer to application servers. Identify the primary data stores (relational DB for structured data, NoSQL for flexible schemas, blob storage for media). Add caches where read latency matters. Add message queues for asynchronous processing. Add a CDN for static content. Draw the data flow for the primary use case end-to-end. Keep it to 5-8 boxes connected by arrows with labeled protocols (HTTP, gRPC, WebSocket). The goal is a complete but high-level picture that you and the interviewer can reference during the deep dive.",
    "## Deep Dive Strategy\n\nThe interviewer will either ask you to deep dive into a specific component or let you choose. Pick components that are: (1) critical to the system's core requirements, (2) technically interesting, and (3) where you can demonstrate depth. For each component, discuss: the data model (schema, access patterns), the specific technology choice and why (PostgreSQL vs. Cassandra), scaling strategy (read replicas, sharding, partitioning), failure modes and mitigation (replication, fallbacks), and consistency/availability trade-offs. For example, in a URL shortener deep dive on the key generation service: discuss base62 encoding, pre-generated key ranges, distributed ID generation, and handling key collisions.",
    "## Wrap-Up and Trade-Offs\n\nIn the final minutes, summarize the design, acknowledge its limitations, and discuss how you would evolve it. Mention: single points of failure you would address, monitoring and alerting (what metrics would you watch?), how the system scales from 1M to 100M to 1B users, potential bottlenecks under extreme load, and operational concerns (deployment, rollback, data migration). This shows maturity and real-world engineering judgment. Never present your design as perfect; instead, show you understand the trade-offs you made and what you would prioritize with more time.",
  ],
  interviewQA: [
    {
      q: "How do you decide whether to prioritize consistency or availability in a system design?",
      a: "It depends on the domain. Financial systems (banking, payments) must prioritize consistency: showing a wrong balance or processing a duplicate payment is unacceptable. Social media feeds can tolerate eventual consistency: seeing a post a few seconds late is fine. Ask the interviewer about the business impact of inconsistency vs. downtime. Then design accordingly: CP systems use synchronous replication and may sacrifice availability during network partitions. AP systems use eventual consistency, conflict resolution (last-write-wins, CRDTs), and always serve requests. Most real systems mix both: strong consistency for the write path, eventual consistency for reads.",
    },
    {
      q: "What are common mistakes candidates make in system design interviews?",
      a: "1) Diving into details without gathering requirements, designing the wrong system. 2) Not estimating scale, leading to over- or under-engineering. 3) Focusing only on the happy path, ignoring failures, edge cases, and operational concerns. 4) Using buzzwords without understanding trade-offs ('just use Kafka' without explaining why). 5) Not communicating their thought process; the interview is about how you think, not the final diagram. 6) Trying to cover everything at the same depth instead of going deep on 2-3 critical areas. 7) Not considering the read/write ratio, which fundamentally affects the architecture.",
    },
    {
      q: "How do you estimate the number of servers needed for a service?",
      a: "Start with peak QPS. A typical application server handles 500-1000 simple requests/second (varies by complexity). For 50K peak QPS with simple requests: ~50-100 servers. For compute-heavy requests, reduce to 50-100 RPS per server. Add 2-3x for redundancy and headroom. For databases: estimate total data size and working set size. A single PostgreSQL node handles ~5-10K simple queries/second and stores terabytes. If your QPS or data exceeds one node, you need read replicas (for read scaling) or sharding (for write scaling and data size). For caches: estimate working set size; a single Redis node handles 100K+ ops/second with ~25-50GB RAM.",
    },
    {
      q: "How do you approach a system you have never designed before?",
      a: "Start with first principles: (1) What is the core value the system provides? (2) What are the primary entities and their relationships? (3) What are the main read and write paths? (4) What is the expected scale? Then map to known building blocks: if it needs real-time updates, consider WebSockets or SSE. If it needs high write throughput, consider append-only logs or LSM-tree databases. If it needs full-text search, consider an inverted index. If it needs to process events asynchronously, consider a message queue. Every novel system is a combination of well-known patterns. Identify which patterns apply and compose them.",
    },
  ],
  mcqs: [
    {
      q: "In a system design interview, approximately how much time should you spend on requirements gathering?",
      options: [
        "1-2 minutes",
        "5 minutes",
        "15 minutes",
        "It depends on the interviewer",
      ],
      answerIndex: 1,
      explanation:
        "About 5 minutes (or roughly 10-15% of the interview) should be spent clarifying requirements. This is enough to align with the interviewer without consuming time needed for design.",
    },
    {
      q: "If a system has 100M DAU and each user performs 5 read operations per day, what is the approximate average read QPS?",
      options: [
        "~500",
        "~6,000",
        "~60,000",
        "~600,000",
      ],
      answerIndex: 1,
      explanation:
        "100M x 5 / 86,400 seconds per day = ~5,787, approximately 6,000 QPS. Peak QPS would be 2-5x higher depending on traffic patterns.",
    },
    {
      q: "Which of the following is a non-functional requirement?",
      options: [
        "Users can upload photos",
        "Users can follow other users",
        "The system should have 99.9% availability",
        "Users can search for posts by hashtag",
      ],
      answerIndex: 2,
      explanation:
        "Availability is a non-functional requirement describing how the system performs, not what it does. The other options are functional requirements specifying system features.",
    },
    {
      q: "During the deep dive phase, you should:",
      options: [
        "Cover every component at equal depth",
        "Focus on 2-3 critical components and discuss trade-offs thoroughly",
        "Only discuss the database schema",
        "Draw as many diagrams as possible",
      ],
      answerIndex: 1,
      explanation:
        "The deep dive should focus on 2-3 components critical to the system's core requirements. Going deep on a few areas demonstrates more expertise than covering everything superficially.",
    },
  ],
  flashcards: [
    {
      front: "What are the 5 phases of a system design interview?",
      back: "1. Requirements Gathering (~5 min): functional and non-functional requirements. 2. Estimation (~5 min): DAU, QPS, storage, bandwidth. 3. High-Level Design (~10 min): major components and data flow. 4. Deep Dive (~15 min): 2-3 critical components in detail. 5. Wrap-Up (~5 min): trade-offs, limitations, future evolution.",
    },
    {
      front: "How do you calculate QPS from DAU?",
      back: "QPS = DAU x actions_per_user / 86,400 (seconds in a day). Peak QPS = QPS x 2-5 (depending on traffic pattern). Example: 50M DAU, 10 actions/day = 50M x 10 / 86,400 = ~5,800 QPS, peak ~15K-30K.",
    },
    {
      front: "What is the 80/20 rule for cache sizing?",
      back: "Approximately 20% of data accounts for 80% of requests. To size a cache, estimate daily read volume, calculate the data size of 20% of unique requests. Example: 10M unique reads/day, 1KB each = 10GB total, cache 20% = 2GB covers 80% of traffic.",
    },
    {
      front: "What components appear in most high-level designs?",
      back: "Clients (web/mobile), Load Balancer, Application Servers, Cache (Redis/Memcached), Primary Database (SQL/NoSQL), CDN (static assets), Message Queue (async processing), Object/Blob Storage (media), and optionally Search Index, Notification Service, Analytics Pipeline.",
    },
    {
      front: "What should you discuss during the wrap-up phase?",
      back: "Single points of failure and how to mitigate them, monitoring and key metrics, scaling path from current to 10x/100x load, potential bottlenecks, operational concerns (deployment, rollback, data migration), and security considerations. Show engineering maturity.",
    },
    {
      front: "How many requests can a typical server handle?",
      back: "Rough estimates: Application server: 500-1K simple RPS. Database (PostgreSQL): 5-10K simple queries/sec. Cache (Redis): 100K+ ops/sec. These vary widely with request complexity, payload size, and hardware.",
    },
    {
      front: "What is the difference between functional and non-functional requirements?",
      back: "Functional: what the system does (user can post, search, follow). Non-functional: how the system performs (99.99% availability, p99 latency < 200ms, support 100M DAU, data durability, GDPR compliance).",
    },
  ],
  glossary: [
    {
      term: "DAU",
      definition:
        "Daily Active Users. The number of unique users who interact with the system in a 24-hour period. A key input for capacity estimation.",
    },
    {
      term: "QPS",
      definition:
        "Queries Per Second. The rate of requests a system handles. Used to size servers, databases, and caches.",
    },
    {
      term: "P99 Latency",
      definition:
        "The latency at the 99th percentile: 99% of requests complete faster than this value. A common SLA metric that captures tail latency.",
    },
    {
      term: "Back-of-the-Envelope Estimation",
      definition:
        "Quick, rough calculations to determine the scale of a system (storage, bandwidth, compute) and guide architectural decisions.",
    },
    {
      term: "High-Level Design (HLD)",
      definition:
        "A diagram showing the major components of a system and their interactions, without implementation details. Typically 5-8 boxes connected by arrows.",
    },
    {
      term: "Non-Functional Requirement (NFR)",
      definition:
        "A requirement specifying how a system should perform rather than what it should do. Examples: availability, latency, scalability, security, durability.",
    },
    {
      term: "Working Set",
      definition:
        "The subset of data that is actively accessed. Caches and memory are sized to hold the working set for optimal performance.",
    },
  ],
};
