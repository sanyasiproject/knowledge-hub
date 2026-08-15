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
    `## The Framework Applied: Designing a Photo-Sharing Service

Everything above becomes concrete when you watch the framework run end-to-end on a real prompt: "Design a photo-sharing service like Instagram." The following steps walk the exact same 45-minute structure -- requirements, estimation, API, data model, high-level design, deep dive, wrap-up -- with real numbers and real decisions, so you can see what "good" looks like at each phase. Read it as a transcript of what you should be saying and drawing, not as a spec to memorize.

Key insight: In every step below, notice that each artifact (a number, an endpoint, a table) is immediately used to justify a design decision. That connection -- "therefore" -- is what interviewers are listening for.`,
    `## Step 1: Requirements

Open by scoping the problem out loud and writing the agreed list where the interviewer can see it. Functional requirements agreed with the interviewer: (1) users upload photos, (2) users follow other users, (3) users see a reverse-chronological feed of photos from people they follow, (4) users can view a single photo with likes count. Explicitly cut: comments, stories, video, DMs, search, explore/recommendations -- say "I will treat these as out of scope unless you want one of them."

Non-functional requirements: 10M DAU; feed reads must be fast (p99 < 200ms for the feed API, photos themselves served from CDN); the system is heavily read-dominated (people browse far more than they post); eventual consistency is acceptable for the feed (a new photo appearing after a few seconds is fine); photos must never be lost (high durability); availability matters more than consistency for reads. Target availability 99.9% for the MVP.

Common mistake: Skipping the "explicitly out of scope" list. Cutting scope aloud is not weakness -- it is the signal that you can ship an MVP instead of boiling the ocean.`,
    `## Step 2: Back-of-the-Envelope Estimation

Now turn the agreed scale into numbers, narrating each derivation. **Writes:** 10M DAU x 2 photo uploads/day = 20M uploads/day. 20M / 86,400s ≈ 230 writes/s average; peak x3 ≈ 700 writes/s. **Reads:** assume each user opens the feed ~5 times/day and each open loads ~20 photos, so 10M x 100 photo-views/day = 1B views/day. 1B / 86,400 ≈ 11,600 reads/s average; peak x3 ≈ 35,000 reads/s. Read:write ratio ≈ 50:1 -- this system is read-heavy, so the architecture must optimize the read path (cache + CDN), and the feed API itself must be cheap.

**Storage:** 20M photos/day x 2MB average = 40TB/day of originals. Per year: 40TB x 365 ≈ 14.6PB/year before replication -- object storage (S3) with lifecycle tiering, not a database. Metadata is tiny by comparison: 20M rows/day x ~1KB ≈ 20GB/day, ~7TB/year -- comfortably a sharded relational database. **Bandwidth:** ingress at peak = 700 writes/s x 2MB ≈ 1.4GB/s; egress is dominated by photo views: 35,000 reads/s x ~200KB (recompressed/thumbnail, not the 2MB original) ≈ 7GB/s -- far too much to serve from origin, which mandates a CDN.

**Cache sizing with the 80/20 rule:** the feed API serves photo *metadata* (~1KB/entry). Daily metadata read volume ≈ 1B views x 1KB = 1TB, but views are heavily skewed to recent and popular photos. Caching 20% of the daily unique working set covers ~80% of traffic: ≈ 200GB of Redis, i.e. a small cluster (e.g. 4-8 nodes x 32-64GB), not a single box.

Key insight: Every number above closes with a conclusion: 700 writes/s means the write path is easy; 35K reads/s plus 7GB/s egress means CDN + cache are mandatory; 14.6PB/year means S3, not Postgres, holds the bytes. Numbers without conclusions are wasted interview time.`,
    `## Step 3: API and Data Model

Sketch the two or three endpoints that carry the core flows, with just enough shape to drive the data model. Upload: \`POST /v1/photos\` with multipart body (image) + caption; returns \`{photo_id, url, created_at}\`. In practice you would return a pre-signed S3 URL and have the client upload directly, keeping 2MB bodies off your app servers. Feed: \`GET /v1/feed?cursor=<opaque>&limit=20\` returns a page of \`{photo_id, author, thumbnail_url, caption, like_count, created_at}\` -- cursor pagination, never offset, because the feed is an append-heavy timeline. Follow: \`POST /v1/users/{id}/follow\`.

Data model (PostgreSQL for metadata, sharded by user_id when needed):

| Table | Key columns | Notes |
| --- | --- | --- |
| users | user_id (PK), username, created_at | ~10M+ rows, small |
| photos | photo_id (PK), owner_id (FK), s3_key, caption, created_at | index on (owner_id, created_at) |
| follows | follower_id, followee_id (composite PK) | both directions indexed |
| likes | photo_id, user_id (composite PK) | counter cached separately |

The photo *bytes* never touch Postgres: originals and generated thumbnails live in S3 under \`photos/{photo_id}/original.jpg\` and \`photos/{photo_id}/thumb_{size}.jpg\`, and the CDN fronts S3 so clients fetch image bytes from the edge, not from your services.

Common mistake: Putting binary blobs in the relational database "for simplicity." The estimation already told you it is 14.6PB/year -- the data model must respect the numbers you computed two steps ago.`,
    `## Step 4: High-Level Design

Draw the happy paths first and narrate them end-to-end (see the "Worked Example: Photo-Sharing Service HLD" diagram). **Upload path:** client -> load balancer -> API gateway (auth, rate limiting) -> upload service. The upload service writes the image to S3, inserts a row into the photos table, and publishes a \`photo-uploaded\` event to Kafka -- then returns immediately. Everything slow happens asynchronously: thumbnail workers consume the event, generate resized variants, and write them back to S3; fan-out workers consume the same event and push the photo_id into each follower's cached feed. **Feed read path:** client -> LB -> API gateway -> feed service -> Redis feed cache (a sorted list of recent photo_ids per user). On a hit, the feed service hydrates metadata and returns; the client then pulls thumbnails from the CDN. On a miss (inactive user, cold cache), the feed service falls back to Postgres: query followees, merge their recent photos, repopulate the cache.

This is 8 boxes and two labeled flows -- deliberately complete but shallow. At this point pause and ask: "Does this high-level shape look right to you, or is there a component you want me to go deeper on?" That question hands the interviewer a natural transition into the deep dive and confirms alignment before you spend your remaining time.

In practice: Returning from the upload API before thumbnails exist is the standard trick -- the client shows its own local copy instantly, and the CDN serves real thumbnails a few seconds later. Perceived latency beats actual latency.`,
    `## Step 5: Deep Dive -- Feed Generation: Fan-Out on Write vs. Fan-Out on Read

Feed generation is the one genuinely hard problem in this system, so choose it for the deep dive. **Fan-out on write (push):** when a user posts, workers insert the photo_id into the Redis feed of every follower. Reads become O(1) -- just read your precomputed list -- which is exactly what a 50:1 read-heavy system wants. Cost: a user with 10M followers triggers 10M cache writes per post (the "celebrity problem"), and you do wasted work for followers who never log in. **Fan-out on read (pull):** compute the feed at request time by querying recent photos from all followees and merging. No write amplification, always fresh -- but a user following 1,000 accounts makes reads expensive, and at 35K peak reads/s that crushes the database.

The answer used in production systems is the **hybrid**: fan-out on write for normal users (the vast majority, so most reads stay O(1)), and fan-out on read for accounts above a follower threshold (say >100K). At read time, merge your precomputed feed with a live query of the few celebrities you follow. Walk the failure modes too: if a fan-out worker dies mid-fanout, Kafka redelivers and the operation is idempotent (inserting the same photo_id into a sorted set twice is a no-op); if Redis loses a feed, rebuild it lazily from Postgres on the next miss. Trade-off accepted: a follower may see a new photo a few seconds late -- which the requirements from Step 1 explicitly allowed.

Key insight: The deep dive earns its name when you state the threshold, the failure recovery, and the requirement that licenses the trade-off. "Hybrid fan-out" as a buzzword scores nothing; the celebrity threshold plus idempotent replay is what demonstrates depth.`,
    `## Step 6: Wrap-Up -- Bottlenecks, SPOFs, and Evolution

Close by attacking your own design before the interviewer does. **Bottlenecks:** the Postgres photos table takes 20M inserts/day -- fine for years, but the (owner_id, created_at) index and the follows table will eventually need sharding by user_id; the fan-out workers are the write-amplification hotspot and must scale horizontally with Kafka partitions. **Single points of failure:** the load balancer (run a redundant pair), Postgres primary (streaming replica + automated failover), Redis (replicas per shard; losing a feed cache is survivable because feeds rebuild from Postgres, so treat it as a cache, not a store of record), Kafka (3-broker minimum, replication factor 3). S3 and the CDN bring their own redundancy.

**Monitoring:** feed p99 latency, cache hit rate (a drop below ~80% signals the working-set estimate is stale), Kafka consumer lag (rising lag = feeds going stale), upload error rate, and S3/CDN egress cost. **Evolution to 100M DAU:** numbers scale 10x -- ~7,000 writes/s and ~350K reads/s -- which forces sharded Postgres, a larger Redis cluster (~2TB), multi-region read replicas, and likely a move of the feed store to a wide-column database. Naming that path shows the design is an MVP with a future, not a dead end.

In practice: A strong wrap-up sentence sounds like: "The riskiest piece is fan-out lag during a celebrity posting spike; I would watch Kafka consumer lag first and cap per-post fan-out with the hybrid threshold." Specific, measurable, and tied to the design you actually drew.`,
  ],
  animations: [
    {
      title: "Budgeting a 45-minute design interview",
      steps: [
        {
          label: "0–5 Requirements",
          detail: "Functional and non-functional. Agree scope out loud.",
        },
        {
          label: "5–10 Estimation",
          detail: "Scale numbers, and the conclusion each one implies.",
        },
        {
          label: "10–15 API and data model",
          detail: "Endpoints, entities, access patterns, then the datastore choice justified by them.",
        },
        {
          label: "15–25 High-level design",
          detail: "Happy path first: client → LB → service → cache → store, plus queues.",
        },
        {
          label: "25–40 Deep dive",
          detail: "The genuinely hard part — offer one if they don't pick.",
        },
        {
          label: "40–45 Trade-offs",
          detail: "Your own bottlenecks, single points of failure, and what changes at 10× scale.",
        },
      ],
    },
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
    {
      q: "Walk me through sizing the cache for a photo-sharing feed at 10M DAU.",
      a: "Start from read volume: 10M DAU x ~100 photo-views/day = 1B metadata reads/day, ~11,600 reads/s average, ~35K peak. The cache holds feed metadata (~1KB/entry), not image bytes -- those go to the CDN. Daily read data is roughly 1B x 1KB = 1TB, but access is heavily skewed toward recent and popular photos, so apply the 80/20 rule: caching ~20% of the daily unique working set (~200GB) serves ~80% of requests. That is a small Redis cluster (e.g. 4-8 nodes of 32-64GB), sharded by user_id, with replicas per shard. Then validate with the hit-rate: if monitoring shows the hit rate falling below ~80%, the working-set estimate is stale and the cluster needs to grow. Key point to state in an interview: the cache is disposable -- feeds rebuild from Postgres on a miss -- so you size it for latency and cost, not durability.",
      followUps: [
        "What would you evict, and with what policy?",
        "How does the sizing change if the product adds an explore/recommendations tab?",
      ],
    },
    {
      q: "For the photo-sharing feed, would you fan out on write or on read? Defend the choice.",
      a: "Hybrid, and the defense comes from the numbers. The system is ~50:1 read-heavy (35K peak reads/s vs 700 writes/s), which favors fan-out on write: precompute each follower's feed in Redis at post time so reads are O(1). But pure push breaks on the celebrity problem -- one post by a 10M-follower account triggers 10M cache writes -- and wastes work on dormant followers. Pure pull (merge followees' recent photos at read time) has no write amplification but makes every read expensive, which the read volume cannot afford. So: fan-out on write for normal users, fan-out on read for accounts above a follower threshold (e.g. 100K); at read time merge the precomputed feed with a live query of the few celebrities followed. Also state the failure story: fan-out via Kafka with idempotent inserts, so a crashed worker replays safely, and a lost Redis feed rebuilds lazily from Postgres.",
      followUps: [
        "How do you pick the follower threshold?",
        "What happens to feed latency during a celebrity posting spike?",
      ],
    },
    {
      q: "The interviewer says 'skip the estimation, assume large scale.' What do you do?",
      a: "Follow the instruction -- arguing for your framework is a red flag -- but do not silently lose the architectural anchor that estimation provides. Compress it into one stated assumption: 'Then I will design for roughly 10K+ writes/s, a heavily read-skewed workload, and petabyte-scale media -- which means sharding, aggressive caching, and object storage from the start; correct me if the shape is different.' That sentence takes ten seconds, gives the interviewer a chance to recalibrate you, and ensures every later decision still traces back to a scale assumption. The same principle applies to any redirect: preserve the framework's guarantee (no decision without a requirement and a scale behind it) while abandoning its ceremony.",
    },
  ],
  followUps: [
    "What questions would you ask before drawing anything?",
    "How do you recover if your approach turns out wrong halfway through?",
    "How do you decide which part to deep-dive on?",
    "In the photo-sharing example, what changes if uploads grow to 20 photos/day per user?",
    "How would you adjust your interview approach for a staff-level loop versus a mid-level one?",
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
    {
      front: "Photo-sharing worked example: key numbers for 10M DAU, 2 uploads/day, 2MB photos?",
      back: "Writes: 10M x 2 / 86,400 ≈ 230/s, peak ~700/s. Reads: ~1B views/day ≈ 11.6K/s, peak ~35K/s (50:1 read-heavy). Storage: 40TB/day ≈ 14.6PB/year of originals -> S3 + CDN. Feed cache: 20% of ~1TB/day metadata ≈ 200GB Redis.",
    },
    {
      front: "Fan-out on write vs. fan-out on read for a social feed?",
      back: "Write (push): precompute follower feeds at post time; O(1) reads, but the celebrity problem (10M followers = 10M writes/post) and wasted work for dormant users. Read (pull): merge followees' posts at request time; always fresh, no amplification, but expensive reads. Production answer: hybrid -- push for normal users, pull for accounts above a follower threshold, merged at read time.",
    },
    {
      front: "How do interview expectations differ by level (mid vs. senior vs. staff)?",
      back: "Mid: complete, coherent design with correct math and one solid deep dive; boring technology done right. Senior: defend trade-offs, quantify crossover points, volunteer failure modes, drive the interview. Staff: challenge the prompt, reason about evolution and migration, show cost awareness; the design itself is table stakes.",
    },
  ],
  deepDive: [
    `## The Art of Requirements Gathering: Asking the Right Questions

Requirements gathering is not a checklist -- it is a **structured conversation** that reveals the constraints shaping your design. The most common failure mode in system design interviews is solving the wrong problem because requirements were assumed rather than clarified. Begin with **scope**: "Should this system support only text posts, or also images and videos?" This single question can change the architecture from a simple CRUD application to a media processing pipeline with CDN, transcoding, and object storage.

For **non-functional requirements**, use the acronym **CALSDR**: Consistency (strong or eventual?), Availability (99.9% or 99.99%?), Latency (p50 and p99 targets), Scalability (current and projected DAU), Durability (can we lose data?), and Regulatory (GDPR, data residency). Each answer constrains the design space. A 99.99% availability target (52 minutes of downtime per year) requires multi-region deployment and eliminates single points of failure -- a fundamentally different architecture than 99.9% (8.7 hours of downtime). Quantify whenever possible: "low latency" means nothing; "p99 < 200ms for timeline reads" is a design constraint you can work with.`,

    `## Back-of-the-Envelope Estimation: The Numbers That Drive Decisions

Estimation is not about precision -- it is about **determining the order of magnitude** that selects the right architectural tier. The difference between 100 QPS and 100K QPS is not 1000x more servers; it is a fundamentally different architecture (single server vs. distributed system with sharding, caching, and load balancing). Master these **estimation building blocks**: 1 day = 86,400 seconds (~100K for quick math). 1 million seconds = ~12 days. 1 billion seconds = ~32 years. A single server can handle ~1K-10K simple HTTP requests/sec. A single PostgreSQL node handles ~5K-10K simple queries/sec. Redis handles ~100K-200K operations/sec. A single SSD can do ~100K random reads/sec.

**Storage estimation template**: records_per_day x bytes_per_record x retention_days x replication_factor. Example: a chat application with 100M DAU, 50 messages/day, 200 bytes/message, 5-year retention, 3x replication = 100M x 50 x 200 x 1825 x 3 = ~5.5 PB. This tells you immediately that a single database will not suffice -- you need distributed storage with sharding. These numbers are not meant to be exact; they are meant to **eliminate impossible architectures** and **highlight bottlenecks** before you start drawing boxes.`,

    `## The High-Level Design Canvas: Building Blocks and Composition

The high-level design phase is about **composing well-known building blocks** into a system that satisfies the requirements. Think of it as a vocabulary: clients, load balancers, API gateways, application servers, caches, databases, message queues, CDNs, object storage, search indices, notification services. Your job is to select the right components and connect them with the right communication patterns.

**Communication patterns** are as important as the components themselves. **Synchronous** (HTTP/gRPC) for request-response where the client needs an immediate answer. **Asynchronous** (message queues like Kafka, SQS) for work that can be deferred -- email sending, analytics processing, feed generation. **Event-driven** (pub/sub) for decoupling producers from consumers -- a new order triggers inventory update, payment processing, and notification independently. **Streaming** (WebSockets, SSE) for real-time updates -- chat, live dashboards, collaborative editing. Drawing these communication patterns explicitly on your diagram shows the interviewer you understand not just *what* the components are but *how they interact*.`,

    `## Deep Dive Mastery: Going from Boxes to Implementation

The deep dive is where you differentiate yourself from candidates who can only draw generic architecture diagrams. The key is to **pick the right components** (those critical to the system's core value proposition) and discuss them with **implementation-level depth**. For each deep-dive component, cover five dimensions: (1) **Data model** -- what is the schema, what are the access patterns, what are the indexes? (2) **Technology choice** -- why this specific technology and not the alternatives? (3) **Scaling strategy** -- how does it handle 10x growth? (4) **Failure modes** -- what breaks and how do you recover? (5) **Trade-offs** -- what are you giving up with this choice?

For example, deep-diving on the **notification service** of a social media platform: the data model is a fan-out from an event (new post) to followers (potentially millions). Technology: Kafka for event ingestion (durable, replayable, high throughput), Redis sorted sets for per-user notification feeds (fast reads, automatic ordering). Scaling: partition Kafka by user_id for parallelism, shard Redis by user_id range. Failure: if Kafka consumer falls behind, notifications are delayed but not lost (durability guarantee); if Redis fails, rebuild from Kafka replay. Trade-off: eventual consistency (notifications may be slightly delayed) is acceptable for this use case.`,

    `## Adapting the Framework When the Interviewer Pushes

The framework is a default, not a script -- strong candidates bend it gracefully when the interviewer redirects, and weak candidates either ignore the redirect or collapse without their crutch. **Under time pressure** ("we only have 25 minutes"), compress proportionally: 2 minutes of requirements (state your assumptions instead of asking every question: "I will assume 10M DAU and read-heavy -- stop me if that is wrong"), 1-2 minutes of estimation hitting only the numbers that change the architecture, then spend the saved time on the deep dive, which is still where the evaluation happens. **When told to skip estimation** ("assume it is large scale"), do not launch into a spreadsheet anyway -- but also do not silently drop the discipline. Convert it into one sentence: "Then I will design for roughly 10K+ writes/s and a heavily read-skewed workload, which means sharding and aggressive caching from the start." You keep the architectural anchor without spending the time.

**With deep-dive-first interviewers** ("just design the feed ranking system, skip the overview"), follow them -- fighting for your framework is a red flag -- but spend 60 seconds establishing the minimal context the deep dive needs: the scale, the read/write ratio, and the consistency requirement of that one component. Those three facts are the load-bearing subset of steps 1-2, and stating them briefly shows the framework has become judgment, not ritual.

Key insight: The framework's real value is that it guarantees you never make a decision without knowing the requirement and the scale behind it. Any compression that preserves that property is fine; any that abandons it is not.

Common mistake: Treating an interviewer's redirect as an obstacle and steering back to your memorized sequence ("I will get to that after estimation"). Interviewers redirect deliberately to test flexibility -- following their lead while quietly keeping your rigor is the winning move.`,

    `## Calibration by Level: What Mid, Senior, and Staff Interviews Actually Reward

The same question is graded on different rubrics depending on the level, and knowing your rubric changes how you spend your 45 minutes. **Mid-level (L4-equivalent):** the bar is a coherent, complete design of a well-known shape. You are rewarded for a clean requirements list, correct arithmetic, a sensible HLD with cache/queue/CDN in the right places, and one competent deep dive. Exotic technology choices are risk, not reward -- Postgres + Redis + Kafka done correctly beats a novel architecture done shakily. **Senior (L5):** the bar shifts from "can you design it" to "can you defend it." Interviewers probe your trade-offs ("why fan-out on write? what breaks at 10M followers?") and expect you to have alternatives pre-loaded, quantify the crossover point, and volunteer failure modes before being asked. Driving the interview -- proposing the deep dive yourself, checking alignment at transitions -- is expected, not bonus.

**Staff (L6+):** the design itself is table stakes; the differentiators are problem framing and organizational realism. Expect to be rewarded for challenging the prompt ("before designing feed ranking, is chronological actually insufficient for the product's stage?"), reasoning about evolution ("this is the 10M-DAU design; here is what we would rebuild at 100M and why not building it now is correct"), cost awareness (7GB/s of CDN egress is a seven-figure annual line item worth a design concession), and migration paths -- how you get from the current system to the proposed one without downtime. Staff interviews often deliberately under-specify the prompt to see whether you impose structure.

In practice: If you are unsure of the rubric, aim one notch above coherent: complete design, self-initiated trade-off discussion, and one moment of product-level judgment. That profile passes mid and senior loops and signals well in staff loops.`,

    `## Framework Failure Modes: How Prepared Candidates Still Fail

Most failed interviews by candidates who know the framework share one of a handful of patterns, and each has a specific antidote. **The checklist zombie:** mechanically reciting phases ("now I will do non-functional requirements...") while never connecting outputs to decisions -- estimation produces numbers that are never referenced again, requirements are gathered and ignored. Antidote: end every phase with an explicit "therefore" sentence. **The time-sink:** spending 20 minutes on requirements and estimation, leaving 10 for the entire design. Antidote: hard-cap the first two phases at 10 minutes combined; a wrong assumption stated aloud is recoverable, an undrawn design is not. **The mute architect:** drawing silently for minutes, forcing the interviewer to interrupt to learn what you are thinking. Antidote: narrate every box as you draw it, including what you considered and rejected.

**The buzzword stack:** dropping Kafka, Cassandra, and CQRS without being able to answer one "why" deep -- this fails worse than a simpler design because it invites probes you cannot survive. Antidote: never name a technology you cannot defend two follow-up questions deep. **The rigidity failure:** the interviewer hints ("what if a user has 50M followers?") and the candidate acknowledges it but returns to their planned path instead of treating the hint as the new agenda. Interviewer hints are the agenda -- they are telling you where the points are. **The happy-path-only design:** 40 minutes with no mention of failures, retries, or degraded modes. Antidote: for every arrow on the diagram, be ready to answer "what if the thing on the right is down?"

Warning: Interviewers rarely say you are failing; they go quiet, stop probing, and let the clock run. Silence and easy questions in the back half of an interview are a signal to proactively offer a deep dive or a trade-off discussion, not a sign you are cruising.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Back-of-the-envelope estimation calculator for system design interviews",
      source: `#include <iostream>
#include <string>
#include <cmath>
#include <iomanip>

struct SystemEstimate {
    // Input parameters
    long long dau;             // Daily Active Users
    double actionsPerUserDay;  // average actions per user per day
    double avgPayloadBytes;    // average request/response size
    double readWriteRatio;     // reads per write
    int retentionDays;
    int replicationFactor;

    // Computed metrics
    double avgQPS() const {
        return dau * actionsPerUserDay / 86400.0;
    }

    double peakQPS(double multiplier = 3.0) const {
        return avgQPS() * multiplier;
    }

    double readQPS() const {
        return avgQPS() * readWriteRatio / (1.0 + readWriteRatio);
    }

    double writeQPS() const {
        return avgQPS() / (1.0 + readWriteRatio);
    }

    double bandwidthMBps() const {
        return peakQPS() * avgPayloadBytes / (1024.0 * 1024.0);
    }

    double dailyStorageGB() const {
        return (writeQPS() * 86400.0 * avgPayloadBytes * replicationFactor)
               / (1024.0 * 1024.0 * 1024.0);
    }

    double totalStorageTB() const {
        return dailyStorageGB() * retentionDays / 1024.0;
    }

    // Cache sizing: 80/20 rule -- cache 20% of daily read data
    double cacheSizeGB() const {
        double dailyReadDataGB = readQPS() * 86400.0 * avgPayloadBytes
                                 / (1024.0 * 1024.0 * 1024.0);
        return dailyReadDataGB * 0.2; // 20% covers 80% of traffic
    }

    int estimatedAppServers(int rpsPerServer = 1000) const {
        return static_cast<int>(std::ceil(peakQPS() / rpsPerServer)) * 2;
        // 2x for redundancy
    }

    void print() const {
        std::cout << std::fixed << std::setprecision(1);
        std::cout << "=== System Design Estimation ===" << std::endl;
        std::cout << "DAU:                " << dau / 1e6 << "M" << std::endl;
        std::cout << "Avg QPS:            " << avgQPS() << std::endl;
        std::cout << "Peak QPS (3x):      " << peakQPS() << std::endl;
        std::cout << "Read QPS:           " << readQPS() << std::endl;
        std::cout << "Write QPS:          " << writeQPS() << std::endl;
        std::cout << "Bandwidth:          " << bandwidthMBps() << " MB/s" << std::endl;
        std::cout << "Daily new storage:  " << dailyStorageGB() << " GB" << std::endl;
        std::cout << "Total storage:      " << totalStorageTB() << " TB" << std::endl;
        std::cout << "Cache size (80/20): " << cacheSizeGB() << " GB" << std::endl;
        std::cout << "App servers needed: " << estimatedAppServers() << std::endl;

        std::cout << "\\n=== Architecture Tier ===" << std::endl;
        if (peakQPS() < 1000)
            std::cout << "Tier: Single server + DB (monolith)" << std::endl;
        else if (peakQPS() < 50000)
            std::cout << "Tier: Load balancer + app cluster + DB replicas + cache" << std::endl;
        else if (peakQPS() < 500000)
            std::cout << "Tier: Distributed system with sharding + CDN + message queues" << std::endl;
        else
            std::cout << "Tier: Global multi-region with edge + event-driven architecture" << std::endl;
    }
};

int main() {
    // Example: Twitter-like social media platform
    SystemEstimate twitter{
        .dau = 200'000'000,          // 200M DAU
        .actionsPerUserDay = 20,     // reads + writes
        .avgPayloadBytes = 1024,     // 1KB average
        .readWriteRatio = 100,       // 100 reads per write
        .retentionDays = 365 * 5,    // 5 year retention
        .replicationFactor = 3,
    };
    twitter.print();

    std::cout << "\\n========================================\\n" << std::endl;

    // Example: URL shortener
    SystemEstimate urlShortener{
        .dau = 50'000'000,
        .actionsPerUserDay = 5,
        .avgPayloadBytes = 256,
        .readWriteRatio = 1000,      // heavily read
        .retentionDays = 365 * 10,
        .replicationFactor = 3,
    };
    std::cout << "URL Shortener:" << std::endl;
    urlShortener.print();

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Consistent hashing implementation for understanding database sharding",
      source: `#include <iostream>
#include <map>
#include <string>
#include <functional>
#include <vector>
#include <cmath>

class ConsistentHash {
    std::map<size_t, std::string> ring;
    int virtualNodes;
    std::hash<std::string> hasher;

public:
    explicit ConsistentHash(int vnodes = 150) : virtualNodes(vnodes) {}

    void addNode(const std::string& node) {
        for (int i = 0; i < virtualNodes; ++i) {
            std::string key = node + "#" + std::to_string(i);
            ring[hasher(key)] = node;
        }
        std::cout << "Added node: " << node
                  << " (" << virtualNodes << " virtual nodes)" << std::endl;
    }

    void removeNode(const std::string& node) {
        for (int i = 0; i < virtualNodes; ++i) {
            std::string key = node + "#" + std::to_string(i);
            ring.erase(hasher(key));
        }
        std::cout << "Removed node: " << node << std::endl;
    }

    std::string getNode(const std::string& dataKey) const {
        if (ring.empty()) return "";
        size_t hash = hasher(dataKey);
        // Find the first node clockwise from this hash
        auto it = ring.lower_bound(hash);
        if (it == ring.end()) it = ring.begin(); // wrap around
        return it->second;
    }

    // Analyze distribution across nodes
    void analyzeDistribution(int numKeys = 10000) const {
        std::map<std::string, int> distribution;
        for (int i = 0; i < numKeys; ++i) {
            std::string key = "key_" + std::to_string(i);
            distribution[getNode(key)]++;
        }
        std::cout << "\\nKey distribution (" << numKeys << " keys):" << std::endl;
        for (const auto& [node, count] : distribution) {
            double pct = 100.0 * count / numKeys;
            std::cout << "  " << node << ": " << count
                      << " (" << pct << "%)" << std::endl;
        }
    }
};

int main() {
    ConsistentHash ch(150);

    // Initial cluster
    ch.addNode("db-server-1");
    ch.addNode("db-server-2");
    ch.addNode("db-server-3");
    ch.analyzeDistribution();

    // Check which shard a key maps to
    std::cout << "\\nuser:12345 -> " << ch.getNode("user:12345") << std::endl;
    std::cout << "user:67890 -> " << ch.getNode("user:67890") << std::endl;

    // Add a node (simulating horizontal scaling)
    std::cout << "\\n--- Adding db-server-4 ---" << std::endl;
    ch.addNode("db-server-4");
    ch.analyzeDistribution();

    // Only ~1/N keys are remapped when adding a node
    std::cout << "\\nuser:12345 -> " << ch.getNode("user:12345") << std::endl;
    std::cout << "user:67890 -> " << ch.getNode("user:67890") << std::endl;

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Rate limiter implementation (Token Bucket algorithm) -- a common deep-dive component",
      source: `#include <iostream>
#include <chrono>
#include <thread>
#include <string>

class TokenBucket {
    double tokens;
    double maxTokens;
    double refillRatePerSec;
    std::chrono::steady_clock::time_point lastRefill;

    void refill() {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(now - lastRefill).count();
        tokens = std::min(maxTokens, tokens + elapsed * refillRatePerSec);
        lastRefill = now;
    }

public:
    TokenBucket(double maxTok, double refillRate)
        : tokens(maxTok)
        , maxTokens(maxTok)
        , refillRatePerSec(refillRate)
        , lastRefill(std::chrono::steady_clock::now()) {}

    bool tryConsume(double numTokens = 1.0) {
        refill();
        if (tokens >= numTokens) {
            tokens -= numTokens;
            return true;
        }
        return false; // rate limited
    }

    double availableTokens() {
        refill();
        return tokens;
    }
};

// Per-user rate limiter (common in API gateways)
#include <unordered_map>

class RateLimiter {
    double maxTokens;
    double refillRate;
    std::unordered_map<std::string, TokenBucket> buckets;

public:
    RateLimiter(double maxTok, double refillRate)
        : maxTokens(maxTok), refillRate(refillRate) {}

    bool allowRequest(const std::string& userId) {
        auto it = buckets.find(userId);
        if (it == buckets.end()) {
            buckets.emplace(userId, TokenBucket(maxTokens, refillRate));
            it = buckets.find(userId);
        }
        return it->second.tryConsume();
    }
};

int main() {
    // Allow 10 requests per second, burst of 20
    RateLimiter limiter(20, 10);

    std::cout << "Simulating API requests for user 'alice':" << std::endl;

    // Burst: send 25 requests rapidly
    int allowed = 0, denied = 0;
    for (int i = 0; i < 25; ++i) {
        if (limiter.allowRequest("alice")) {
            ++allowed;
        } else {
            ++denied;
            std::cout << "  Request " << (i + 1) << ": RATE LIMITED" << std::endl;
        }
    }
    std::cout << "Burst result: " << allowed << " allowed, "
              << denied << " denied" << std::endl;

    // Wait for tokens to refill
    std::cout << "\\nWaiting 2 seconds for refill..." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(2));

    // Now requests should work again
    allowed = 0;
    for (int i = 0; i < 10; ++i) {
        if (limiter.allowRequest("alice")) ++allowed;
    }
    std::cout << "After refill: " << allowed << "/10 allowed" << std::endl;

    // Different user has separate bucket
    std::cout << "\\nBob (new user): "
              << (limiter.allowRequest("bob") ? "ALLOWED" : "DENIED")
              << " (independent bucket)" << std::endl;

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "System Design Interview Framework",
      kind: "flow",
      caption: "Step-by-step framework for approaching a system design interview from requirements to detailed design.",
      mermaid: `flowchart TD
    A([Start]) --> B["Clarify Requirements\nfunctional + non-functional"]
    B --> C["Estimate Scale\nQPS, storage, bandwidth"]
    C --> D["Define API\nendpoints and contracts"]
    D --> E["High-Level Design\ncore components and data flow"]
    E --> F["Data Model\nschemas and storage choices"]
    F --> G["Deep Dive\nbottlenecks and trade-offs"]
    G --> H["Scale and Reliability\ncaching, sharding, replication"]
    H --> I([Present and Discuss])`,
    },
    {
      title: "Worked Example: Photo-Sharing Service HLD",
      kind: "architecture",
      caption: "The complete high-level design produced by the worked example. Edges labeled U1-U6 trace the upload path (client to S3 via upload service, then an event into Kafka); edges labeled R1-R7 trace the feed read path (feed service to Redis feed cache, image bytes from CDN). Shared hops carry both labels; async worker edges are unnumbered.",
      mermaid: `graph TB
    subgraph ClientsGrp["Clients"]
        Mobile["Mobile App"]
        Web["Web App"]
    end
    subgraph EdgeGrp["Edge"]
        CDN["CDN<br/>thumbnails + originals"]
    end
    subgraph GatewayGrp["Gateway"]
        LB["Load Balancer"]
        APIGW["API Gateway<br/>auth + rate limiting"]
    end
    subgraph ServicesGrp["Services"]
        UploadSvc["Upload Service<br/>POST /v1/photos"]
        FeedSvc["Feed Service<br/>GET /v1/feed"]
        UserSvc["User Service<br/>follows, profiles"]
    end
    subgraph CacheGrp["Cache"]
        RedisFeed["Redis Feed Cache<br/>photo ids per user, ~200GB"]
    end
    subgraph AsyncGrp["Async"]
        Kafka["Kafka<br/>photo-uploaded events"]
        FanoutW["Fan-out Workers"]
        ThumbW["Thumbnail Workers"]
    end
    subgraph StorageGrp["Storage"]
        PG["PostgreSQL<br/>users, photos, follows, likes"]
        S3["S3<br/>originals + thumbnails"]
    end
    Mobile -->|"U1. POST /v1/photos"| LB
    Web -->|"R1. GET /v1/feed"| LB
    Mobile --> CDN
    Web -->|"R6. fetch thumbnails"| CDN
    LB -->|"U2 / R2. route"| APIGW
    APIGW -->|"U3. authenticated upload"| UploadSvc
    APIGW -->|"R3. authenticated read"| FeedSvc
    APIGW --> UserSvc
    UploadSvc -->|"U4. store original"| S3
    UploadSvc -->|"U5. insert photo row"| PG
    UploadSvc -->|"U6. publish photo-uploaded"| Kafka
    Kafka --> FanoutW
    Kafka --> ThumbW
    FanoutW --> RedisFeed
    ThumbW --> S3
    FeedSvc -->|"R4. fetch feed ids"| RedisFeed
    FeedSvc -->|"R5. hydrate / cache miss"| PG
    UserSvc --> PG
    CDN -->|"R7. pull on miss"| S3`,
    },
    {
      title: "CAP Theorem Trade-offs",
      kind: "mindmap",
      caption: "How distributed systems must choose two of three guarantees under network partition.",
      mermaid: `mindmap
  root((CAP Theorem))
    Consistency
      All nodes same data
      CP systems
        HBase
        Zookeeper
    Availability
      Always respond
      AP systems
        DynamoDB
        Cassandra
    Partition Tolerance
      Network splits handled
      Required in practice`,
    },
    {
      title: "Read and Write Path",
      kind: "sequence",
      caption: "How writes flow to the database and reads use cache with fallback to the database.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant LB as Load Balancer
    participant S as App Server
    participant Ca as Cache
    participant DB as Database
    C->>LB: POST write request
    LB->>S: route to server
    S->>DB: write data
    S->>Ca: invalidate cache key
    C->>LB: GET read request
    LB->>S: route to server
    S->>Ca: check cache
    Ca-->>S: cache miss
    S->>DB: read data
    S->>Ca: populate cache
    S-->>C: return data`,
    },
  ],
  exercises: [
    "**Requirements Gathering (Easy):** You are asked to design a URL shortener. Write down at least 8 clarifying questions you would ask the interviewer, covering functional requirements, non-functional requirements, and constraints. For each question, explain how the answer would change your design.",
    "**Estimation Practice (Medium):** Estimate the storage, QPS, and bandwidth requirements for a photo-sharing app like Instagram with 500M DAU. Assume each user uploads 1 photo/day (2MB average), views 100 photos/day, and photos are stored for 10 years with 3x replication. How many storage servers do you need if each server has 10TB?",
    "**High-Level Design (Medium):** Draw the high-level architecture for a ride-sharing application (like Uber). Identify the major components, data stores, communication patterns (sync vs. async), and real-time requirements. For each component, note whether it should be CP or AP.",
    "**Deep Dive: Notification System (Hard):** Design the notification system for a social media platform with 100M DAU. Cover: how notifications are generated (fan-out), stored, delivered (push vs. pull), and displayed. Address: how to handle users with 10M followers, read/unread tracking, notification preferences, and rate limiting to prevent notification storms.",
    "**Full Mock Interview (Hard):** Design a distributed task scheduler (like cron at scale). Walk through all 5 phases: requirements (what kinds of tasks? recurring? one-time? what scale?), estimation (how many tasks per second?), high-level design (scheduler, worker pool, task queue, result store), deep dive (exactly-once execution, failure handling, priority scheduling), and wrap-up (scaling to 10x, monitoring, operational concerns).",
  ],
  cheatSheet: [
    "**Interview time split:** Requirements (5 min) -> Estimation (5 min) -> HLD (10 min) -> Deep Dive (15 min) -> Wrap-up (5 min).",
    "**QPS formula:** DAU x actions/user / 86400. Peak = avg x 3-5. Round 86400 to 100K for quick math.",
    "**Storage formula:** records/day x bytes/record x retention_days x replication_factor.",
    "**Cache sizing (80/20 rule):** 20% of daily unique data covers 80% of traffic. Cache_GB = read_QPS x 86400 x avg_size x 0.2.",
    "**Server capacity rules of thumb:** App server: 1K simple RPS. PostgreSQL: 5-10K QPS. Redis: 100K+ ops/sec. Kafka: 100K+ msgs/sec per broker.",
    "**CALSDR non-functional checklist:** Consistency, Availability, Latency, Scalability, Durability, Regulatory.",
    "**Communication patterns:** Sync (HTTP/gRPC) for request-response. Async (queues) for deferred work. Pub/sub for fan-out. WebSocket/SSE for real-time.",
    "**Deep dive dimensions:** Data model, Technology choice, Scaling strategy, Failure modes, Trade-offs.",
    "**Architecture tiers:** <1K QPS = single server. <50K = clustered + cache + replicas. <500K = sharded + CDN + queues. >500K = multi-region + edge.",
    "**Wrap-up checklist:** SPOFs, monitoring metrics, scaling path, bottlenecks, deployment strategy, security.",
    "**Worked example anchors (photo sharing, 10M DAU):** writes 10M x 2 / 86,400 ≈ 230/s (peak ~700); reads 1B views/day ≈ 11.6K/s (peak ~35K); storage 40TB/day ≈ 14.6PB/year of originals -> S3 + CDN; feed cache 20% of ~1TB/day metadata ≈ 200GB Redis.",
    "**Fan-out decision:** read-heavy feed -> fan-out on write for normal users, fan-out on read above a follower threshold (~100K); merge at read time. Idempotent fan-out via Kafka replay.",
    "**When redirected:** compress phases, never skip the anchor -- state assumed scale in one sentence and keep every decision traceable to a requirement + number.",
  ],
  revisionNotes: [
    "System design interviews follow a 5-phase structure: Requirements (5 min), Estimation (5 min), High-Level Design (10 min), Deep Dive (15 min), Wrap-up (5 min). Spending too long on any phase starves the others.",
    "Requirements gathering is **the most underrated phase**. Asking 'Is this system read-heavy or write-heavy?' can change the entire architecture.",
    "Estimation determines **architectural tier**, not exact numbers. The difference between 1K QPS and 100K QPS is a different architecture, not just more servers.",
    "High-level design should have **5-8 components** connected by arrows with **labeled protocols**. Draw the primary data flow end-to-end before adding secondary flows.",
    "In the deep dive, cover 5 dimensions for each component: **data model, technology choice, scaling strategy, failure modes, and trade-offs**.",
    "The wrap-up should address **what is NOT in your design**: single points of failure, monitoring gaps, scaling limitations, and what you would build with more time.",
    "Never say 'just use Kafka' or 'just add a cache.' Always explain **why** and **what trade-off you accept**.",
    "The 80/20 rule for caching: 20% of data serves 80% of requests. Use this to estimate cache memory requirements.",
    "Read/write ratio fundamentally shapes the architecture. >100:1 = aggressive caching. ~1:1 = write-optimized with sync replication.",
    "End every phase with a **'therefore' sentence** connecting its output to a decision: 700 writes/s -> easy write path; 35K reads/s + 7GB/s egress -> CDN and cache mandatory; 14.6PB/year -> S3, not the database.",
    "For read-heavy feeds, the standard deep-dive answer is **hybrid fan-out**: push (fan-out on write) for normal users, pull (fan-out on read) for high-follower accounts, merged at read time. Know the celebrity problem and the idempotent-replay failure story.",
    "When the interviewer redirects (time pressure, 'skip estimation', deep-dive first), **follow their lead but keep the anchor**: state assumed scale and requirements in one sentence rather than dropping them entirely.",
    "Interviewers going quiet in the back half is a **warning sign, not a pass** -- proactively offer a deep dive or trade-off discussion.",
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
