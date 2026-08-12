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
  ],
  followUps: [
    "What questions would you ask before drawing anything?",
    "How do you recover if your approach turns out wrong halfway through?",
    "How do you decide which part to deep-dive on?",
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
      title: "Typical Large-Scale Architecture",
      kind: "architecture",
      caption: "Common high-level system architecture with load balancing, caching, database replication, and CDN.",
      mermaid: `graph LR
    Client --> CDN["CDN\nStatic Assets"]
    Client --> LB["Load Balancer"]
    LB --> S1["App Server 1"]
    LB --> S2["App Server 2"]
    LB --> S3["App Server 3"]
    S1 --> Cache["Redis Cache"]
    S2 --> Cache
    S3 --> Cache
    S1 --> DB["Primary DB"]
    DB --> R1["Read Replica 1"]
    DB --> R2["Read Replica 2"]`,
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
  ],
  resources: [
    {
      label: "System Design Interview — Alex Xu",
      kind: "book",
    },
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann",
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
