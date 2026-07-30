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
