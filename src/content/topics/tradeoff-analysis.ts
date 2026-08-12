import type { TopicContent } from "../types";

export const tradeoffAnalysis: TopicContent = {
  quickSummary: [
    "System design is fundamentally about trade-offs -- every architectural decision favors one quality attribute at the expense of another, and the art lies in choosing the right balance for your context.",
    "The CAP theorem states a distributed system can guarantee at most two of Consistency, Availability, and Partition tolerance; since partitions are inevitable, the real choice is between consistency and availability during failures.",
    "Latency and throughput are inversely related at system capacity: optimizing for one often degrades the other, requiring different architectural patterns for latency-sensitive vs. throughput-oriented workloads.",
    "Effective trade-off analysis requires quantifying requirements, understanding the business context, and explicitly documenting what you are giving up with each design decision.",
  ],
  detailed: [
    `## Consistency vs. Availability (CAP and PACELC)

**CAP Theorem:**
In the presence of a network partition (P), a distributed system must choose between:
- **Consistency (C)** -- every read returns the most recent write or an error.
- **Availability (A)** -- every request receives a non-error response, but it may not reflect the most recent write.

Since network partitions are inevitable in distributed systems, the practical choice is CP (consistent but may be unavailable during partitions) or AP (available but may return stale data during partitions).

**PACELC extension:**
Even when there is no partition (E = else), there is a trade-off between **latency** and **consistency**. A system can be:
- PA/EL -- available during partitions, low latency otherwise (Cassandra, DynamoDB).
- PC/EC -- consistent during partitions, consistent otherwise but higher latency (traditional RDBMS with synchronous replication).
- PA/EC -- available during partitions, consistent otherwise (most practical systems).

**Practical consistency models:**
- **Strong consistency** -- reads always return the latest write. Use for financial transactions, inventory counts.
- **Eventual consistency** -- reads may return stale data, but all replicas converge eventually. Use for social media feeds, analytics dashboards.
- **Causal consistency** -- preserves cause-effect ordering. Use for messaging (messages appear in order).
- **Read-your-writes** -- a user always sees their own recent writes. Common UX requirement even in eventually consistent systems.`,

    `## Latency vs. Throughput

Latency and throughput are related but distinct, and optimizing for one often hurts the other.

**Definitions:**
- **Latency** -- the time to complete a single operation (measured in ms, usually at p50/p95/p99).
- **Throughput** -- the number of operations completed per unit time (measured in QPS, TPS, or MB/s).

**The tension:**
- Batching increases throughput (process many items at once) but increases latency (each item waits for the batch to fill).
- Processing items individually minimizes latency but wastes resources and reduces throughput.
- As a system approaches maximum throughput, latency increases non-linearly (queueing theory: latency spikes as utilization approaches 100%).

**Architectural patterns by priority:**

| Priority | Pattern | Example |
|----------|---------|---------|
| Low latency | Cache-heavy, in-memory, pre-computed | Real-time bidding, game servers |
| High throughput | Batch processing, async pipelines, write-behind | ETL, log aggregation, analytics |
| Balanced | Request-response with async offloading | E-commerce, SaaS applications |

**Key design decisions:**
- Synchronous vs. asynchronous processing: sync gives lower latency for simple operations; async gives higher throughput for complex workflows.
- Connection pooling: reusing connections improves throughput but may add latency for pool acquisition.
- Data locality: co-locating compute and data reduces latency but may limit scaling flexibility.`,

    `## Simplicity vs. Scalability

**The tension:**
Simple architectures (monoliths, single database) are easier to build, debug, and operate but harder to scale beyond certain thresholds. Complex architectures (microservices, sharding, CQRS) scale further but are harder to build and maintain.

**Spectrum:**
\`\`\`
Monolith -> Modular Monolith -> Microservices -> Serverless/Event-Driven
Simple DB -> Read Replicas -> Sharding -> Multi-region
\`\`\`

**When simplicity wins:**
- Startup phase: ship fast, learn, iterate. Over-engineering kills velocity.
- Small team: the operational overhead of distributed systems exceeds the team's capacity.
- Well-understood domain: if the requirements are stable, a simple architecture serves well.

**When complexity is justified:**
- Multiple teams need independent deployment and scaling.
- Different components have vastly different scaling requirements.
- Regulatory or compliance requirements demand isolation.
- The system has proven it needs to scale beyond a single node's capacity.

**The YAGNI principle:** Do not add complexity for hypothetical future needs. Build for current requirements with clean boundaries that allow future decomposition. A well-structured monolith can be split into microservices; a poorly structured microservices system is much harder to fix.`,

    `## Cost vs. Performance

Every performance improvement has a cost -- in money, complexity, or both. Trade-off analysis must consider economics.

**Examples:**

| Optimization | Performance gain | Cost |
|-------------|-----------------|------|
| Add Redis cache | 10-100x read latency reduction | Cache infrastructure, invalidation logic, stale data risk |
| Multi-region deployment | 50-150ms latency reduction for distant users | 2-3x infrastructure cost, cross-region replication complexity |
| SSD over HDD | 100x random read improvement | 3-5x storage cost per GB |
| Provisioned concurrency (Lambda) | Eliminate cold starts | Pay for idle capacity |
| Denormalized read model (CQRS) | Faster complex queries | Data duplication, sync logic, eventual consistency |

**Decision framework:**
1. **Quantify the requirement** -- what latency/throughput does the business actually need? Not "as fast as possible" but "p99 < 200ms."
2. **Measure the current state** -- where are you relative to the requirement?
3. **Identify the bottleneck** -- profiling before optimizing. Do not add caches when the bottleneck is CPU-bound computation.
4. **Estimate the cost** -- infrastructure, development time, operational overhead, opportunity cost.
5. **Evaluate diminishing returns** -- going from 500ms to 200ms may be worth it; going from 200ms to 180ms rarely is.`,

    `## Making and Documenting Trade-off Decisions

**Framework for trade-off analysis:**

1. **State the options** -- clearly define the alternatives (e.g., "SQL vs. NoSQL for user profiles").
2. **List evaluation criteria** -- consistency, latency, scalability, operational complexity, team expertise, cost.
3. **Score each option** -- rate each option against each criterion (high/medium/low or 1-5).
4. **Weigh the criteria** -- not all criteria matter equally. Consistency might be critical for payments but irrelevant for analytics.
5. **Document the decision and rationale** -- record what was decided, why, what was explicitly traded away, and under what conditions the decision should be revisited.

**Architecture Decision Records (ADRs):**
\`\`\`markdown
# ADR-007: Use Kafka for inter-service events

## Status: Accepted

## Context
Services need to communicate state changes. Options: REST webhooks, RabbitMQ, Kafka.

## Decision
Use Kafka for all inter-service event communication.

## Rationale
- Durable, replayable log enables event sourcing and audit.
- High throughput matches our projected 50K events/sec.
- Consumer groups allow independent scaling of consumers.

## Trade-offs accepted
- Higher operational complexity than RabbitMQ.
- Eventually consistent; not suitable for synchronous request-response.
- Requires schema registry for contract management.

## Revisit when
- Event volume drops below 1K/sec (Kafka overhead may not be justified).
- Team lacks Kafka operational expertise after staff changes.
\`\`\`

**In interviews:**
Always articulate trade-offs explicitly. Saying "I chose X because of Y, accepting the trade-off of Z" demonstrates mature engineering judgment. There are no universally correct answers in system design -- only context-appropriate ones.`,
  ],
  animations: [
    {
      title: "Making a trade-off explicit",
      steps: [
        {
          label: "Name the decision",
          detail: "Cache user profiles in Redis, or read from Postgres every time.",
        },
        {
          label: "What you gain",
          detail: "p95 read latency from 40 ms to 1 ms; database load down ~90%.",
        },
        {
          label: "What you give up",
          detail: "Up to 60 s of staleness; a new dependency; a stampede risk on hot keys.",
        },
        {
          label: "Under what condition would you choose differently",
          detail: "If profiles were edited constantly, or if stale permissions were a security issue.",
        },
        {
          label: "Mitigations",
          detail: "Explicit invalidation on write, jittered TTLs, single-flight repopulation.",
        },
        {
          label: "Write it down",
          detail: "An undocumented trade-off gets re-litigated every six months by someone who doesn't know it was a choice.",
        },
      ],
    },
  ],
  interviewQA: [
    {
      q: "Explain the CAP theorem and how it applies to real system design.",
      a: "CAP states that during a network partition, a distributed system must choose between consistency (every read sees the latest write) and availability (every request gets a response). Since partitions are inevitable, the real decision is CP or AP. In practice, most systems are not purely one or the other -- they make different choices for different operations. A banking system is CP for balance updates (reject requests during partitions) but might be AP for transaction history (serve slightly stale data). PACELC extends this: even without partitions, there is a latency-consistency trade-off.",
    },
    {
      q: "How do you decide between strong and eventual consistency?",
      a: "Ask: what is the business cost of a stale read? For financial balances, inventory counts, or booking availability, a stale read causes real problems (double-spending, overselling) -- use strong consistency. For social media feeds, product recommendations, or analytics dashboards, a few seconds of staleness is invisible to users -- use eventual consistency for better performance and availability. Many systems use a hybrid: strong consistency for writes and critical reads, eventual consistency for read-heavy, latency-sensitive paths.",
    },
    {
      q: "When is it worth adding architectural complexity to improve performance?",
      a: "Only when you have quantified the requirement, measured the current state, identified the bottleneck, and confirmed the gap matters to the business. Adding a cache layer is worth it when database reads are the measured bottleneck and latency requirements are not being met. Adding CQRS is worth it when read and write patterns have fundamentally different scaling needs. Never add complexity speculatively. The cost includes not just infrastructure but also development time, operational overhead, debugging difficulty, and the opportunity cost of not building features.",
    },
    {
      q: "How do you communicate trade-offs in a system design interview?",
      a: "State the decision, the reasoning, and what you are explicitly giving up. For example: 'I am choosing DynamoDB over PostgreSQL because the access pattern is key-value lookups at 50K QPS with no cross-entity queries. The trade-off is giving up flexible querying and ACID transactions across items, which is acceptable because our domain does not require them.' This shows you understand both sides and made a deliberate, context-appropriate choice rather than defaulting to a technology you are comfortable with.",
    },
  ],
  followUps: [
    "Name a trade-off you made here and the condition under which you'd choose differently.",
    "How do you present a trade-off to a non-technical stakeholder?",
    "What's the cost of deferring a decision versus making it now?",
  ],
  mcqs: [
    {
      q: "According to the CAP theorem, what must a distributed system choose between during a network partition?",
      options: [
        "Latency and throughput",
        "Consistency and availability",
        "Durability and performance",
        "Security and scalability",
      ],
      answerIndex: 1,
      explanation:
        "During a network partition (which is inevitable in distributed systems), a system must choose between consistency (all nodes see the same data) and availability (all requests receive a response). This is the practical interpretation of the CAP theorem.",
    },
    {
      q: "What happens to latency as a system approaches its maximum throughput capacity?",
      options: [
        "Latency decreases linearly",
        "Latency remains constant",
        "Latency increases non-linearly (exponentially)",
        "Latency and throughput are completely independent",
      ],
      answerIndex: 2,
      explanation:
        "Per queueing theory, as utilization approaches 100%, requests spend increasingly more time waiting in queues. Latency increases sharply and non-linearly. This is why systems are typically operated at 60-80% capacity to maintain acceptable latency.",
    },
    {
      q: "Which consistency model guarantees that a user always sees their own recent writes?",
      options: [
        "Strong consistency",
        "Eventual consistency",
        "Read-your-writes consistency",
        "Linearizable consistency",
      ],
      answerIndex: 2,
      explanation:
        "Read-your-writes consistency ensures that after a user performs a write, their subsequent reads reflect that write. Other users may still see stale data (unlike strong consistency). This is a practical middle ground often implemented in eventually consistent systems.",
    },
    {
      q: "What does the PACELC theorem add to CAP?",
      options: [
        "It adds security as a fourth dimension",
        "It addresses the latency-consistency trade-off that exists even when there is no network partition",
        "It replaces partition tolerance with performance",
        "It introduces cost as a factor in distributed system design",
      ],
      answerIndex: 1,
      explanation:
        "PACELC extends CAP by noting that even when no partition exists (the 'else' case), systems must still trade off between latency and consistency. Synchronous replication gives consistency but higher latency; asynchronous replication gives lower latency but eventual consistency.",
    },
  ],
  flashcards: [
    {
      front: "CAP theorem in one sentence",
      back: "During a network partition (inevitable in distributed systems), choose consistency (reject requests if state is uncertain) or availability (serve possibly stale data). You cannot have both simultaneously.",
    },
    {
      front: "PACELC: what does the 'ELC' add?",
      back: "Even without partitions (Else), there is a Latency vs. Consistency trade-off. Synchronous replication = consistent but slower. Asynchronous replication = faster but eventually consistent.",
    },
    {
      front: "Latency vs. throughput: the batching trade-off",
      back: "Batching increases throughput (process many items at once) but increases latency (each item waits for the batch). Individual processing minimizes latency but reduces throughput. Choose based on which the business values more.",
    },
    {
      front: "When does system latency spike sharply?",
      back: "As utilization approaches 100% capacity (queueing theory). At 90% utilization, latency can be 10x the value at 50% utilization. This is why systems target 60-80% utilization for acceptable latency.",
    },
    {
      front: "YAGNI in architecture",
      back: "You Aren't Gonna Need It. Do not add architectural complexity (microservices, sharding, CQRS) for hypothetical future requirements. Build for current needs with clean boundaries. A well-structured monolith is easier to decompose later than a poorly structured distributed system is to fix.",
    },
    {
      front: "Architecture Decision Record (ADR) key sections",
      back: "Status, Context (the problem), Decision (what was chosen), Rationale (why), Trade-offs Accepted (what was given up), Revisit When (conditions that invalidate the decision).",
    },
    {
      front: "How to articulate trade-offs in interviews",
      back: "Formula: 'I chose X because of Y (specific requirement), accepting the trade-off of Z (what is given up), which is acceptable because W (why the trade-off is tolerable in this context).' Never present a choice as universally correct.",
    },
  ],
  deepDive: [
    `## The Mathematics Behind CAP and Consistency Models

Trade-off analysis in distributed systems is not merely a philosophical exercise -- it is rooted in formal guarantees and impossibility results. The **CAP theorem**, proven by Seth Gilbert and Nancy Lynch in 2002, demonstrates that no distributed algorithm can simultaneously guarantee consistency, availability, and partition tolerance. Understanding *why* this is true deepens your ability to reason about system design. During a partition, a node receiving a write cannot know whether the other partition has also received a conflicting write. It must either **refuse the request** (sacrificing availability to maintain consistency) or **accept it optimistically** (sacrificing consistency to maintain availability). There is no third option.

Beyond CAP, the **FLP impossibility result** shows that in an asynchronous system where even one process can fail, no deterministic consensus protocol can guarantee termination. This is why consensus algorithms like Paxos and Raft use timeouts and leader election -- they trade theoretical impossibility for practical reliability under reasonable assumptions. When you choose a CP system like etcd (Raft-based) or ZooKeeper (Zab-based), you are accepting that during leader elections or network instability, the system may be temporarily unavailable. When you choose an AP system like Cassandra or DynamoDB, you accept that conflict resolution (last-write-wins, vector clocks, CRDTs) becomes your responsibility.`,

    `## Quantitative Trade-off Analysis: Latency Budgets and SLO Decomposition

Effective trade-off analysis requires **quantifying constraints** rather than reasoning abstractly. A common technique is **latency budget decomposition**: given a p99 SLO of 200ms for an API endpoint, break it down across the call chain. If the request traverses a load balancer (1ms), application server (5ms), cache lookup (2ms), database query on cache miss (50ms), and serialization (2ms), the total is ~60ms on the happy path. But at p99, database latency might spike to 150ms, cache miss rate might be 20%, and garbage collection pauses might add 30ms. Suddenly the 200ms budget is tight.

This quantitative approach forces explicit trade-offs: **Should you add a second cache layer** (reducing DB hits but adding complexity and potential staleness)? **Should you denormalize the data model** (faster queries but harder writes and potential inconsistency)? **Should you move to an async pattern** (better p99 but eventual consistency)? Each option has a measurable impact on the latency budget. Tools like distributed tracing (Jaeger, Zipkin) and percentile histograms (HDR Histogram) make this analysis empirical rather than speculative.`,

    `## Real-World Trade-off Patterns: Read-Heavy vs. Write-Heavy Systems

The **read/write ratio** fundamentally shapes architecture. A social media feed (1000:1 read-to-write ratio) benefits from aggressive caching, precomputed timelines (fan-out-on-write), and eventual consistency. A banking ledger (1:1 or write-heavy) needs strong consistency, write-ahead logs, and synchronous replication. Misidentifying this ratio leads to the wrong architecture.

**Fan-out-on-write vs. fan-out-on-read** illustrates this perfectly. Twitter's timeline can be built by: (1) precomputing each user's timeline when a tweet is posted (fan-out-on-write: fast reads, expensive writes, stale data during propagation), or (2) querying all followed users' tweets at read time (fan-out-on-read: slow reads, cheap writes, always fresh). Twitter uses a hybrid: fan-out-on-write for most users, fan-out-on-read for celebrity accounts with millions of followers (where write fan-out cost is prohibitive). This is a textbook example of **adaptive trade-off analysis** -- the optimal strategy depends on the specific entity's characteristics.`,

    `## The Hidden Trade-off: Operational Complexity

Often overlooked in system design interviews, **operational complexity** is a trade-off that compounds over time. Every architectural component adds: monitoring and alerting requirements, failure modes to understand and handle, configuration to manage, upgrades to coordinate, and on-call burden. A system with PostgreSQL, Redis, Kafka, Elasticsearch, and S3 requires expertise in five different systems, each with its own failure characteristics, backup procedures, and scaling mechanisms.

The **total cost of ownership** includes not just infrastructure but **cognitive load on the team**. A microservices architecture with 50 services may be technically superior for scalability but operationally brutal for a 5-person team. The trade-off framework must include: How many people will operate this system? What is their expertise? What is the on-call rotation? How quickly can a new team member become productive? Systems that are technically optimal but operationally unsustainable fail in practice. This is why many successful companies run "boring" technology stacks -- the trade-off favors operational simplicity over theoretical perfection.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Demonstrating consistency vs. availability with a simple distributed key-value store simulation",
      source: `#include <iostream>
#include <unordered_map>
#include <string>
#include <vector>
#include <optional>
#include <chrono>
#include <thread>

// Simulates a node in a distributed system
class Node {
public:
    std::string id;
    std::unordered_map<std::string, std::string> store;
    bool partitioned = false; // simulates network partition

    explicit Node(std::string nodeId) : id(std::move(nodeId)) {}

    void put(const std::string& key, const std::string& value) {
        store[key] = value;
    }

    std::optional<std::string> get(const std::string& key) const {
        auto it = store.find(key);
        if (it != store.end()) return it->second;
        return std::nullopt;
    }
};

// CP system: rejects operations during partition
class CPStore {
public:
    std::vector<Node> nodes;

    CPStore() : nodes{Node("A"), Node("B")} {}

    bool write(const std::string& key, const std::string& value) {
        // Requires ALL nodes to acknowledge (strong consistency)
        for (auto& node : nodes) {
            if (node.partitioned) {
                std::cerr << "[CP] Write REJECTED: node " << node.id
                          << " is partitioned. Consistency > Availability.\\n";
                return false; // sacrifice availability for consistency
            }
        }
        for (auto& node : nodes) {
            node.put(key, value);
        }
        std::cout << "[CP] Write SUCCESS: all nodes consistent.\\n";
        return true;
    }

    std::optional<std::string> read(const std::string& key) {
        // Read from primary; reject if partitioned
        if (nodes[0].partitioned) {
            std::cerr << "[CP] Read REJECTED: primary partitioned.\\n";
            return std::nullopt;
        }
        return nodes[0].get(key);
    }
};

// AP system: always serves requests, may return stale data
class APStore {
public:
    std::vector<Node> nodes;

    APStore() : nodes{Node("A"), Node("B")} {}

    bool write(const std::string& key, const std::string& value) {
        // Write to any available node (availability > consistency)
        bool written = false;
        for (auto& node : nodes) {
            if (!node.partitioned) {
                node.put(key, value);
                written = true;
                std::cout << "[AP] Write to node " << node.id << " (available).\\n";
            }
        }
        if (!written) std::cerr << "[AP] All nodes down.\\n";
        return written;
    }

    std::optional<std::string> read(const std::string& key) {
        // Read from any available node (may be stale)
        for (const auto& node : nodes) {
            if (!node.partitioned) {
                auto val = node.get(key);
                std::cout << "[AP] Read from node " << node.id
                          << " (may be stale).\\n";
                return val;
            }
        }
        return std::nullopt;
    }
};

int main() {
    std::cout << "=== CP Store (Consistency Priority) ===\\n";
    CPStore cp;
    cp.write("balance", "1000");
    cp.nodes[1].partitioned = true; // simulate partition
    cp.write("balance", "900"); // will be rejected

    std::cout << "\\n=== AP Store (Availability Priority) ===\\n";
    APStore ap;
    ap.write("balance", "1000");
    ap.nodes[1].partitioned = true; // simulate partition
    ap.write("balance", "900"); // succeeds on node A only
    // Node B still has "1000" -- stale data
    ap.nodes[1].partitioned = false;
    std::cout << "Node B balance: "
              << ap.nodes[1].get("balance").value_or("N/A")
              << " (stale!)\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Latency vs. throughput: batching trade-off with configurable batch size",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <chrono>
#include <thread>
#include <numeric>

// Simulates processing items with different batching strategies
class BatchProcessor {
public:
    int batchSize;
    int processingTimePerBatchMs; // fixed overhead per batch

    BatchProcessor(int batchSz, int procTimeMs)
        : batchSize(batchSz), processingTimePerBatchMs(procTimeMs) {}

    struct Result {
        double avgLatencyMs;
        double throughputItemsPerSec;
    };

    // Simulate processing N items
    Result process(int totalItems) const {
        int numBatches = (totalItems + batchSize - 1) / batchSize;
        double totalTimeMs = 0;
        double totalLatencyMs = 0;
        int itemsProcessed = 0;

        for (int b = 0; b < numBatches; ++b) {
            int itemsInBatch = std::min(batchSize, totalItems - itemsProcessed);

            // Each item waits for: (1) batch to fill, (2) batch to process
            // Average wait for batch to fill = batchSize/2 * arrivalInterval
            double batchFillTimeMs = (batchSize - 1) * 0.5; // simplified
            double batchProcessTimeMs = processingTimePerBatchMs;

            for (int i = 0; i < itemsInBatch; ++i) {
                // Items arriving later in the batch wait less to fill
                double itemWaitMs = (itemsInBatch - 1 - i) * 0.5;
                totalLatencyMs += itemWaitMs + batchProcessTimeMs;
            }
            totalTimeMs += batchFillTimeMs + batchProcessTimeMs;
            itemsProcessed += itemsInBatch;
        }

        return {
            totalLatencyMs / totalItems,
            totalItems / (totalTimeMs / 1000.0)
        };
    }
};

int main() {
    int totalItems = 1000;
    int processingOverhead = 10; // ms per batch

    std::cout << "Batch Size | Avg Latency (ms) | Throughput (items/s)\\n";
    std::cout << "-----------|------------------|--------------------\\n";

    for (int batchSize : {1, 5, 10, 50, 100, 500}) {
        BatchProcessor bp(batchSize, processingOverhead);
        auto result = bp.process(totalItems);
        std::cout << "    " << batchSize
                  << "      |      " << result.avgLatencyMs
                  << "       |    " << result.throughputItemsPerSec << "\\n";
    }

    std::cout << "\\nKey insight: larger batches increase throughput but also\\n"
              << "increase average latency. Choose based on your SLO.\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Simple ADR (Architecture Decision Record) generator",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <ctime>

struct TradeOff {
    std::string aspect;
    std::string accepted;
    std::string rejected;
};

struct ADR {
    int number;
    std::string title;
    std::string status; // "Proposed", "Accepted", "Deprecated", "Superseded"
    std::string context;
    std::string decision;
    std::vector<TradeOff> tradeoffs;
    std::vector<std::string> revisitConditions;

    std::string render() const {
        std::ostringstream oss;
        oss << "# ADR-" << number << ": " << title << "\\n\\n";
        oss << "## Status: " << status << "\\n\\n";
        oss << "## Context\\n" << context << "\\n\\n";
        oss << "## Decision\\n" << decision << "\\n\\n";
        oss << "## Trade-offs\\n";
        oss << "| Aspect | Accepted | Rejected Alternative |\\n";
        oss << "|--------|----------|---------------------|\\n";
        for (const auto& t : tradeoffs) {
            oss << "| " << t.aspect << " | " << t.accepted
                << " | " << t.rejected << " |\\n";
        }
        oss << "\\n## Revisit When\\n";
        for (const auto& cond : revisitConditions) {
            oss << "- " << cond << "\\n";
        }
        return oss.str();
    }
};

int main() {
    ADR adr{
        .number = 1,
        .title = "Use Redis for session caching",
        .status = "Accepted",
        .context = "User sessions need sub-5ms reads at 50K QPS. "
                   "Current PostgreSQL-backed sessions average 25ms.",
        .decision = "Deploy Redis cluster for session storage with "
                    "PostgreSQL as durable fallback.",
        .tradeoffs = {
            {"Consistency", "Eventual (sessions may be stale for ~1s)",
             "Strong consistency via DB-only approach"},
            {"Complexity", "Added Redis operational overhead",
             "Simple single-DB architecture"},
            {"Cost", "Additional infrastructure (~$500/mo)",
             "Zero additional cost"},
            {"Latency", "Sub-2ms reads achieved",
             "25ms average with DB-only"},
        },
        .revisitConditions = {
            "Session QPS drops below 5K (Redis overhead unjustified)",
            "Team lacks Redis operational expertise",
            "PostgreSQL read replicas achieve <5ms for sessions",
        },
    };

    std::cout << adr.render() << std::endl;
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "System Design Trade-off Dimensions",
      kind: "mindmap",
      caption: "Common architectural trade-off axes encountered in system design and distributed systems.",
      mermaid: `mindmap
  root((Trade-offs))
    Consistency vs Availability
      CAP theorem
      Strong vs eventual
    Latency vs Throughput
      Batching
      Response time
    Read vs Write Optimization
      Indexes
      Denormalization
    Space vs Time
      Caching
      Precomputation
    Simplicity vs Scalability
      Monolith vs microservices
      Premature optimization`,
    },
    {
      title: "CAP Theorem Decision",
      kind: "flow",
      caption: "How to navigate the CAP theorem when designing a distributed system under network partition.",
      mermaid: `flowchart TD
    A([Network Partition Occurs]) --> B{Which guarantee
do you prioritize?}
    B -->|Consistency| C["Reject requests
or block until consistent
CP system"]
    B -->|Availability| D["Serve stale or
potentially inconsistent data
AP system"]
    C --> E["HBase, Zookeeper
banking transactions"]
    D --> F["DynamoDB, Cassandra
shopping carts, DNS"]`,
    },
    {
      title: "Normalization vs Denormalization",
      kind: "architecture",
      caption: "Database design trade-off between normalized schema for write efficiency and denormalized for read speed.",
      mermaid: `graph LR
    subgraph Normalized
    U["Users table"] --> O["Orders table"]
    O --> I["Items table"]
    end
    subgraph Denormalized
    DO["orders_flat
user_name, order_id,
item_name, total"]
    end
    Normalized -->|faster writes
no duplication| Norm["OLTP workloads"]
    Denormalized -->|faster reads
no joins needed| Denorm["OLAP and analytics"]`,
    },
    {
      title: "Caching Trade-off Sequence",
      kind: "sequence",
      caption: "Cache-aside pattern showing the consistency trade-off between serving stale data and cache invalidation.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant Ca as Cache
    participant DB as Database
    C->>Ca: GET user:123
    Ca-->>C: MISS
    C->>DB: SELECT user 123
    DB-->>C: user data
    C->>Ca: SET user:123 TTL=60s
    Note over Ca: data may become stale
    C->>Ca: GET user:123
    Ca-->>C: HIT - possibly stale
    Note over DB: user updated in DB
    C->>Ca: DEL user:123
    Note over Ca: next read will refresh`,
    },
  ],
  exercises: [
    "**CAP Analysis (Easy):** You are designing a shopping cart service. Users expect their cart to always be accessible (even during outages) and to reflect items they just added. Analyze whether this system should be CP or AP. Consider: What happens if a user adds an item during a partition? What consistency model provides the best UX?",
    "**Latency Budget (Medium):** An e-commerce checkout API has a 500ms p99 SLO. The call chain is: API gateway (5ms) -> auth service (20ms) -> inventory check (50ms) -> payment service (200ms) -> order service (30ms) -> notification (async). Calculate the remaining budget. If the payment service p99 spikes to 350ms, what trade-offs could you make to stay within budget?",
    "**Write an ADR (Medium):** You are choosing between PostgreSQL and Cassandra for a user activity feed that receives 100K writes/sec and 500K reads/sec. Write a complete Architecture Decision Record covering context, decision, rationale, trade-offs accepted, and revisit conditions.",
    "**PACELC Classification (Easy):** Classify the following systems under PACELC and justify your answer: (1) A banking ledger, (2) A DNS system, (3) A collaborative document editor like Google Docs, (4) A leaderboard for an online game.",
    "**Cost-Performance Analysis (Hard):** A system currently uses a single PostgreSQL instance handling 5K QPS with p99 of 50ms. Requirements will grow to 50K QPS within 6 months. Compare three approaches: (1) Vertical scaling, (2) Read replicas + connection pooling, (3) Sharding. For each, estimate the cost, complexity, latency impact, and operational overhead. Which would you recommend and why?",
  ],
  cheatSheet: [
    "**CAP in one line:** Partition happens -> pick Consistency (reject) or Availability (serve stale).",
    "**PACELC:** P->A/C, else L/C. Captures the normal-operation latency-consistency trade-off CAP misses.",
    "**Latency spike rule:** At 90% utilization, latency is ~10x the value at 50%. Target 60-80% utilization.",
    "**QPS formula:** QPS = DAU x actions/user / 86400. Peak = 2-5x average.",
    "**Batching trade-off:** Bigger batch = higher throughput, higher latency. Smaller batch = lower latency, lower throughput.",
    "**Read/write ratio drives architecture:** >100:1 = cache-heavy, fan-out-on-write. ~1:1 = write-optimized, sync replication.",
    "**ADR sections:** Status, Context, Decision, Rationale, Trade-offs Accepted, Revisit When.",
    "**Interview formula:** 'I chose X because Y, accepting trade-off Z, which is acceptable because W.'",
    "**Consistency spectrum:** Strong > Sequential > Causal > Read-your-writes > Eventual. Pick the weakest model that meets business needs.",
    "**Cost-performance curve:** The first 80% of performance improvement costs 20% of the total budget. The last 20% costs 80%.",
  ],
  revisionNotes: [
    "The CAP theorem is not about choosing 2 of 3 -- partition tolerance is mandatory in distributed systems, so the real choice is between consistency and availability **during partitions**.",
    "PACELC extends CAP: even without partitions, you trade latency for consistency. Sync replication = consistent but slow. Async = fast but eventually consistent.",
    "Latency increases **non-linearly** as utilization approaches capacity (queueing theory). At 90% utilization, expect 10x the latency at 50%.",
    "Always quantify trade-offs: 'p99 < 200ms' not 'as fast as possible'. Latency budgets force explicit decisions about where to spend time.",
    "The read/write ratio fundamentally shapes architecture. Identify it early and design the system accordingly.",
    "Operational complexity is a hidden but critical trade-off. A system the team cannot operate reliably is worse than a simpler but maintainable one.",
    "Use Architecture Decision Records (ADRs) to document decisions, rationale, trade-offs, and revisit conditions. Institutional memory prevents repeated debates.",
    "In interviews, never present a choice as universally correct. Always state what you are giving up and why that is acceptable in the given context.",
  ],
  resources: [
    {
      label: "Software Architecture: The Hard Parts — Ford, Richards et al.",
      kind: "book",
    },
    {
      label: "Fundamentals of Software Architecture — Richards & Ford",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "CAP Theorem",
      definition:
        "A distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance. Since partitions are inevitable, the practical choice is between consistency and availability during failures.",
    },
    {
      term: "PACELC",
      definition:
        "Extension of CAP: if Partition, choose Availability or Consistency; Else (no partition), choose Latency or Consistency. Captures the latency-consistency trade-off that exists even in normal operation.",
    },
    {
      term: "Eventual Consistency",
      definition:
        "A consistency model where, given no new writes, all replicas will eventually converge to the same value. Reads may return stale data temporarily but the system converges over time.",
    },
    {
      term: "Strong Consistency",
      definition:
        "A consistency model where every read returns the most recent write or an error. Achieved through synchronous replication or consensus protocols, at the cost of higher latency.",
    },
    {
      term: "Queueing Theory",
      definition:
        "Mathematical study of waiting lines. In system design, it explains why latency increases non-linearly as utilization approaches capacity -- requests spend more time waiting in queues.",
    },
    {
      term: "Architecture Decision Record (ADR)",
      definition:
        "A document capturing an architectural decision, its context, rationale, trade-offs accepted, and conditions under which it should be revisited. Provides institutional memory for design choices.",
    },
    {
      term: "Read-Your-Writes Consistency",
      definition:
        "A consistency guarantee where a user's reads always reflect their own prior writes, even if other users may still see older data. A practical middle ground between strong and eventual consistency.",
    },
  ],
};
