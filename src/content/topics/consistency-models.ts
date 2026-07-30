import type { TopicContent } from "../types";

export const consistencyModels: TopicContent = {
  quickSummary: [
    "Strong consistency (linearizability) guarantees that any read returns the most recent write — all nodes appear as a single copy, but at the cost of latency and availability during network partitions.",
    "Eventual consistency guarantees that if no new writes occur, all replicas will converge to the same value — the system is highly available but reads may return stale data temporarily.",
    "Causal consistency preserves the happens-before relationship — if operation A causally depends on operation B, all nodes see B before A, but concurrent operations may be observed in different orders.",
    "Read-your-writes consistency ensures a client always sees its own writes in subsequent reads, even if other clients may see stale data — a practical middle ground for user-facing applications.",
  ],
  detailed: [
    `## Strong Consistency (Linearizability)

**Linearizability** is the strongest consistency model: every operation appears to take effect atomically at some point between its invocation and response, and all operations are ordered consistently across all nodes. In practical terms, once a write completes, every subsequent read (from any node) returns that value or a newer one.

Achieving linearizability requires coordination — typically consensus protocols (Paxos, Raft) or synchronous replication. This coordination adds latency (round-trips between nodes) and reduces availability: per the **CAP theorem**, during a network partition, a linearizable system must either refuse writes (sacrificing availability) or accept them on one side only.

Systems providing linearizability: ZooKeeper, etcd, CockroachDB (serializable), Spanner (external consistency via TrueTime).`,

    `## Eventual Consistency

**Eventual consistency** guarantees that if no new updates are made, all replicas will eventually converge to the same value. There is no bound on how long convergence takes — it depends on replication lag, network conditions, and conflict resolution.

This is the weakest useful consistency model and enables maximum availability and partition tolerance. DynamoDB, Cassandra (with consistency level ONE), and DNS are eventually consistent. The challenge is that reads may return stale or conflicting data. Conflict resolution strategies include: **last-writer-wins** (LWW) using timestamps, **version vectors** for detecting conflicts, and **CRDTs** (Conflict-free Replicated Data Types) for automatic merge without coordination.`,

    `## Causal Consistency

**Causal consistency** sits between strong and eventual consistency. It guarantees that causally related operations are seen in the same order by all nodes, while concurrent (independent) operations may be observed in different orders.

Two operations are causally related if one could have influenced the other — for example, if a user posts a message and then another user replies, the reply is causally dependent on the original post. All nodes must see the post before the reply. But two independent posts by different users can appear in any order on different nodes.

Causal consistency is weaker than linearizability (it does not order concurrent operations) but stronger than eventual consistency (it preserves causal chains). It can be implemented without global coordination using **vector clocks** or **Lamport timestamps** to track causality.`,

    `## Session Guarantees

Practical distributed systems often offer **session-level consistency** guarantees that are weaker than strong consistency but more useful than bare eventual consistency:

**Read-your-writes**: a client always sees its own prior writes. Implemented by routing reads to the replica that received the write, or by tracking a version/token. **Monotonic reads**: once a client reads a value, subsequent reads never return an older value. Prevents time-travel effects. **Monotonic writes**: writes from a single client are applied in order. **Writes-follow-reads**: if a client reads a value and then writes, the write is guaranteed to be applied after the read value.

These guarantees can be combined. MongoDB offers "majority read concern + majority write concern" for causal consistency within a session.`,

    `## Consistency vs Availability Trade-offs

The **CAP theorem** states that during a network partition, a distributed system must choose between consistency (every read gets the latest write) and availability (every request gets a response). The **PACELC theorem** extends this: even when there is no partition (E = else), there is a trade-off between latency and consistency.

In practice, most systems are tunable. Cassandra's consistency levels (ONE, QUORUM, ALL) let you choose per-query: ONE = available but eventually consistent, QUORUM = consistent but higher latency. DynamoDB offers strongly consistent reads (higher latency, routed to the leader) and eventually consistent reads (lower latency, any replica).`,
  ],
  interviewQA: [
    {
      q: "What is the difference between linearizability and serializability?",
      a: "Linearizability is a recency guarantee on individual operations — reads return the latest write, and operations appear to execute atomically at a single point in time. Serializability is a transaction isolation level — transactions appear to execute in some serial order, but that order need not correspond to real-time ordering. A system can be serializable but not linearizable (transactions are ordered but reads may not reflect the latest write). Strict serializability (or external consistency) combines both: transactions are serializable AND respect real-time ordering.",
    },
    {
      q: "How does causal consistency differ from eventual consistency in practice?",
      a: "Eventual consistency makes no ordering guarantees — replicas may see updates in any order, leading to anomalies like seeing a reply before the original message. Causal consistency tracks dependencies between operations (using vector clocks or similar) and ensures that if operation B depends on operation A, all replicas see A before B. Concurrent (independent) operations can still appear in different orders. This prevents the most confusing anomalies while remaining highly available — causal consistency does not require global consensus.",
    },
    {
      q: "Explain the PACELC theorem and how it extends CAP.",
      a: "CAP says during a Partition, choose between Availability and Consistency. PACELC adds: Else (no partition), choose between Latency and Consistency. This captures the reality that even in normal operation, stronger consistency requires more coordination, which increases latency. For example, DynamoDB: during partition, it chooses A over C (AP system); in normal operation, it offers both eventually consistent reads (low latency) and strongly consistent reads (higher latency, choose C over L).",
    },
  ],
  mcqs: [
    {
      q: "Which consistency model guarantees that causally related operations are seen in order, but allows concurrent operations to be observed in any order?",
      options: [
        "Linearizability",
        "Eventual consistency",
        "Causal consistency",
        "Read-your-writes consistency",
      ],
      answerIndex: 2,
      explanation:
        "Causal consistency preserves the happens-before relationship for causally dependent operations while allowing concurrent (independent) operations to appear in different orders on different nodes.",
    },
    {
      q: "According to the CAP theorem, what must a distributed system sacrifice during a network partition?",
      options: [
        "Either consistency or availability",
        "Either consistency or partition tolerance",
        "Either availability or performance",
        "Nothing — modern systems avoid CAP constraints",
      ],
      answerIndex: 0,
      explanation:
        "During a network partition, a system must choose: either refuse some requests to maintain consistency (CP) or continue serving requests with potentially stale data (AP). Partition tolerance cannot be sacrificed in a distributed system.",
    },
    {
      q: "What does 'read-your-writes' consistency guarantee?",
      options: [
        "All nodes see all writes immediately",
        "A client always sees its own prior writes in subsequent reads",
        "Reads and writes are serializable",
        "Writes are applied in timestamp order",
      ],
      answerIndex: 1,
      explanation:
        "Read-your-writes is a session guarantee ensuring that after a client writes, its own subsequent reads reflect that write. Other clients may still see stale data.",
    },
  ],
  flashcards: [
    {
      front: "What is linearizability?",
      back: "The strongest consistency model: every operation appears atomic at a single point in time, and reads always return the latest completed write. Requires coordination (consensus) and sacrifices availability during partitions.",
    },
    {
      front: "What is eventual consistency?",
      back: "The weakest useful consistency: all replicas converge to the same value if no new writes occur, but there is no bound on convergence time. Enables maximum availability.",
    },
    {
      front: "What is causal consistency?",
      back: "Causally related operations are observed in order by all nodes; concurrent operations may appear in any order. Stronger than eventual, weaker than linearizable, achievable without global consensus.",
    },
    {
      front: "What is the CAP theorem?",
      back: "During a network partition, a distributed system must choose between consistency (latest data) and availability (serving all requests). You cannot have both under partition.",
    },
    {
      front: "What is the PACELC theorem?",
      back: "Extends CAP: during Partition choose A or C; Else (no partition) choose Latency or Consistency. Captures the latency-consistency trade-off during normal operation.",
    },
    {
      front: "What is monotonic reads consistency?",
      back: "A session guarantee: once a client reads a value, subsequent reads never return an older value. Prevents 'time travel' where a client sees newer data then older data.",
    },
    {
      front: "How does Cassandra handle the consistency spectrum?",
      back: "Tunable per-query via consistency levels: ONE (eventual, fast), QUORUM (strong if R+W > N), ALL (strongest but lowest availability). Each query independently trades consistency for latency/availability.",
    },
  ],
  glossary: [
    {
      term: "Linearizability",
      definition:
        "The strongest consistency model where operations appear atomic and ordered in real-time. Reads always return the latest write.",
    },
    {
      term: "Eventual Consistency",
      definition:
        "A model guaranteeing all replicas converge to the same value given sufficient time with no new writes. No ordering or recency guarantees.",
    },
    {
      term: "Causal Consistency",
      definition:
        "A model preserving the order of causally related operations while allowing concurrent operations to be observed in any order.",
    },
    {
      term: "Read-Your-Writes",
      definition:
        "A session guarantee ensuring a client always observes its own prior writes in subsequent reads.",
    },
    {
      term: "CAP Theorem",
      definition:
        "The principle that a distributed system can provide at most two of three guarantees: Consistency, Availability, and Partition tolerance.",
    },
    {
      term: "PACELC Theorem",
      definition:
        "An extension of CAP: during Partition choose Availability or Consistency; Else choose Latency or Consistency.",
    },
    {
      term: "Tunable Consistency",
      definition:
        "The ability to configure consistency guarantees per operation, as in Cassandra's consistency levels (ONE, QUORUM, ALL).",
    },
  ],
};
