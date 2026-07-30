import type { TopicContent } from "../types";

export const timeOrdering: TopicContent = {
  quickSummary: [
    "Wall clocks on distributed nodes are unreliable for ordering events — clock skew, NTP drift, and leap seconds mean two machines can disagree on the current time by milliseconds to seconds.",
    "Lamport clocks provide a logical counter that captures the happens-before relationship — if event A happened before event B, then L(A) < L(B) — but the converse is not true for concurrent events.",
    "Vector clocks assign a counter per node, enabling detection of both causal ordering and concurrency — if two events are concurrent, neither vector clock dominates the other.",
    "Hybrid Logical Clocks (HLC) combine physical timestamps with logical counters, providing causally consistent ordering that stays close to real time — used in CockroachDB and MongoDB.",
  ],
  detailed: [
    `## The Wall Clock Problem

In distributed systems, each node has its own physical clock. These clocks are synchronized via **NTP (Network Time Protocol)** but are never perfectly aligned. Clock skew (the difference between two clocks at a given moment) can range from microseconds in well-configured data centers to hundreds of milliseconds across regions.

Problems: (1) **ordering errors** — if node A timestamps an event at T=100 and node B timestamps a later event at T=99 due to skew, the ordering is incorrect; (2) **clock jumps** — NTP corrections can jump a clock forward or backward; (3) **leap seconds** — UTC occasionally adds a second, causing ambiguity; (4) **monotonicity violations** — system clocks can go backward after NTP adjustments. For these reasons, physical timestamps alone cannot reliably order events across nodes.`,

    `## Lamport Clocks

Leslie Lamport's 1978 paper introduced **logical clocks** that capture causality without relying on physical time. Each process maintains a counter C. Rules: (1) before each local event, increment C; (2) when sending a message, include C in the message; (3) on receiving a message with timestamp T, set C = max(C, T) + 1.

This guarantees: if event A **happens before** event B (A causally precedes B), then L(A) < L(B). However, the converse is not true: L(A) < L(B) does not imply A happened before B — they might be concurrent events that happen to have different counter values. Lamport clocks establish a **total order** (by breaking ties with process IDs) but cannot detect concurrency.`,

    `## Vector Clocks

**Vector clocks** extend Lamport clocks to detect concurrency. Each node maintains a vector of N counters (one per node). Node i increments V[i] before each event. When sending a message, include the full vector. On receiving with vector T, set V[j] = max(V[j], T[j]) for all j, then increment V[i].

Comparison: V(A) < V(B) (A happened before B) if every element of V(A) is less than or equal to the corresponding element of V(B), and at least one is strictly less. If neither V(A) < V(B) nor V(B) < V(A), the events are **concurrent**. This enables conflict detection: concurrent writes to the same key indicate a conflict requiring resolution (e.g., via application logic or CRDTs).

Downsides: vector size grows linearly with the number of nodes. **Dotted version vectors** and **interval tree clocks** are space-optimized alternatives.`,

    `## Hybrid Logical Clocks (HLC)

**Hybrid Logical Clocks** combine physical time with a logical counter. An HLC timestamp is a pair (physical, logical). Rules: (1) on a local/send event, set physical = max(local_clock, current_hlc.physical); if physical did not advance, increment logical; otherwise reset logical to 0. (2) On receive, set physical = max(local_clock, current_hlc.physical, message_hlc.physical); if it equals the sender's physical, take max logical + 1; otherwise reset logical.

HLC provides: causal ordering (like Lamport clocks), closeness to real time (physical component tracks wall clock), and bounded logical component. It does not detect concurrency (like vector clocks) but is more space-efficient (O(1) per timestamp vs O(N) for vector clocks). Used in CockroachDB (for MVCC timestamps), MongoDB (for causal consistency), and other distributed databases.`,

    `## Practical Ordering Strategies

**Google Spanner** uses **TrueTime** — an API that returns an interval [earliest, latest] representing the uncertainty in the current time. Spanner waits out the uncertainty before committing a transaction, guaranteeing that if commit A finishes before commit B starts, then timestamp(A) < timestamp(B). This achieves external consistency using physical time, but requires atomic clocks and GPS receivers in every data center.

**Sequence numbers** (auto-incrementing IDs from a single source) provide total ordering but create a single point of failure and bottleneck. **Snowflake IDs** embed a timestamp, machine ID, and sequence number to generate roughly time-ordered unique IDs without coordination, but do not guarantee strict ordering across machines.

**Causal ordering** is weaker than total ordering but often sufficient. Two events are causally ordered if one could have influenced the other (through message passing or local sequencing). Events with no causal relationship are concurrent and can be ordered arbitrarily. Causal consistency guarantees that all nodes see causally related operations in the same order, while concurrent operations may be seen in different orders. This is cheaper to implement than linearizability and sufficient for many applications like social media feeds and collaborative editing.`,
  ],
  interviewQA: [
    {
      q: "Why can't we use wall clocks to order events in a distributed system?",
      a: "Wall clocks on different machines are never perfectly synchronized. NTP provides millisecond-level accuracy at best, but clock skew, NTP corrections (which can jump clocks backward), leap seconds, and network latency in clock sync all introduce errors. Two events on different machines might have timestamps that suggest the wrong order. A clock going backward after an NTP correction can even make a later event appear earlier than a prior one on the same machine. For reliable ordering, use logical clocks, vector clocks, or hybrid logical clocks.",
      followUps: [
        "How does NTP synchronization work and what are its accuracy limitations?",
        "What is the difference between monotonic clocks and wall clocks?",
      ],
    },
    {
      q: "What can vector clocks detect that Lamport clocks cannot?",
      a: "Concurrency. Lamport clocks establish that if A happened before B, then L(A) < L(B), but if L(A) < L(B), you cannot distinguish whether A caused B or they are concurrent. Vector clocks enable this: if neither V(A) <= V(B) nor V(B) <= V(A), the events are concurrent. This is critical for conflict detection — when two nodes independently update the same data, vector clocks reveal the conflict so the application can resolve it, rather than silently losing one update.",
    },
    {
      q: "How does Google Spanner achieve external consistency with physical clocks?",
      a: "Spanner uses TrueTime, which returns a time interval [earliest, latest] representing clock uncertainty. Before committing a transaction, Spanner waits until the latest possible time of the commit timestamp has passed (commit-wait). This ensures that any transaction that starts after the commit will get a higher timestamp, guaranteeing external consistency. The uncertainty interval is kept small (typically under 7ms) using atomic clocks and GPS receivers in every data center. This is a unique approach that most systems cannot replicate due to the specialized hardware requirement.",
    },
    {
      q: "When would you choose a Hybrid Logical Clock over vector clocks or Lamport clocks?",
      a: "Choose HLC when you need causal ordering that stays close to real time and you cannot afford the O(N) storage overhead of vector clocks — for example, in databases with many nodes where every row stores a version timestamp. HLC provides the same causal guarantee as Lamport clocks (if A happens-before B, then HLC(A) < HLC(B)) with O(1) timestamp size, plus the physical component stays close to wall-clock time, making timestamps human-readable and useful for TTL and expiration logic. However, if you need to detect concurrent events (for conflict resolution), you must use vector clocks — HLC, like Lamport clocks, cannot distinguish causality from concurrency.",
      followUps: [
        "How does CockroachDB use HLC for its MVCC timestamps?",
        "What are dotted version vectors and how do they improve on vector clocks?",
      ],
    },
  ],
  mcqs: [
    {
      q: "What does a Lamport clock guarantee?",
      options: [
        "If L(A) < L(B), then A happened before B",
        "If A happened before B, then L(A) < L(B)",
        "If L(A) = L(B), then A and B are concurrent",
        "Lamport clocks can detect concurrent events",
      ],
      answerIndex: 1,
      explanation:
        "Lamport clocks guarantee that causality is preserved: if A happens before B, then L(A) < L(B). But the converse is not true — L(A) < L(B) does not mean A caused B; they could be concurrent.",
    },
    {
      q: "How do you determine if two events are concurrent using vector clocks?",
      options: [
        "Their timestamps are equal",
        "Neither vector clock dominates the other",
        "They have the same Lamport timestamp",
        "They occurred on different nodes",
      ],
      answerIndex: 1,
      explanation:
        "Two events are concurrent if neither V(A) <= V(B) nor V(B) <= V(A) — meaning each vector has at least one component greater than the corresponding component in the other.",
    },
    {
      q: "What is the main advantage of Hybrid Logical Clocks over vector clocks?",
      options: [
        "HLC can detect concurrency",
        "HLC timestamps are O(1) in size vs O(N) for vector clocks",
        "HLC provides stronger consistency guarantees",
        "HLC does not require any physical clock",
      ],
      answerIndex: 1,
      explanation:
        "HLC timestamps are a fixed-size pair (physical, logical) regardless of the number of nodes, while vector clocks grow linearly with the number of nodes. HLC trades concurrency detection for space efficiency.",
    },
    {
      q: "What does Google Spanner's commit-wait technique achieve?",
      options: [
        "It reduces write latency by parallelizing commits",
        "It guarantees external consistency by waiting out clock uncertainty",
        "It eliminates the need for consensus during transactions",
        "It provides optimistic concurrency control",
      ],
      answerIndex: 1,
      explanation:
        "Spanner's commit-wait delays the commit response until the TrueTime uncertainty interval has passed, ensuring that any transaction starting after the commit observes a strictly higher timestamp. This provides external consistency — real-time ordering matches timestamp ordering.",
    },
  ],
  flashcards: [
    {
      front: "What is clock skew?",
      back: "The difference in time readings between two clocks at the same real moment. In distributed systems, NTP keeps skew to milliseconds in a data center, but it can be much larger across regions.",
    },
    {
      front: "What is the happens-before relationship?",
      back: "Event A happens before event B if: A and B are on the same process and A occurs first, or A is a send and B is the corresponding receive, or there is a chain of such relationships (transitivity).",
    },
    {
      front: "How does a Lamport clock work?",
      back: "Each process maintains a counter. Increment before each event. Include in messages. On receive, set counter = max(local, received) + 1. Guarantees if A happened-before B then L(A) < L(B).",
    },
    {
      front: "How do vector clocks detect concurrency?",
      back: "Each node maintains a vector of counters (one per node). Two events are concurrent if neither vector dominates the other — each has at least one component greater than the other's corresponding component.",
    },
    {
      front: "What is an HLC (Hybrid Logical Clock)?",
      back: "A timestamp pair (physical, logical) that tracks causality like Lamport clocks while staying close to wall-clock time. Fixed size (O(1)) unlike vector clocks (O(N)). Used in CockroachDB and MongoDB.",
    },
    {
      front: "What is Google's TrueTime?",
      back: "An API returning a time interval [earliest, latest] representing clock uncertainty. Spanner uses commit-wait (waiting out the uncertainty) to guarantee external consistency with physical timestamps. Requires atomic clocks and GPS.",
    },
    {
      front: "What are Snowflake IDs?",
      back: "Distributed unique ID generators embedding timestamp + machine ID + sequence number. Roughly time-ordered without coordination, but do not guarantee strict ordering across machines.",
    },
  ],
  glossary: [
    {
      term: "Clock Skew",
      definition:
        "The difference in time readings between clocks on different nodes at the same real-world moment.",
    },
    {
      term: "Lamport Clock",
      definition:
        "A logical clock using a single counter per process to capture the happens-before relationship. Provides total ordering but cannot detect concurrency.",
    },
    {
      term: "Vector Clock",
      definition:
        "A logical clock using a vector of counters (one per node) that can determine both causal ordering and concurrency between events.",
    },
    {
      term: "Hybrid Logical Clock (HLC)",
      definition:
        "A clock combining physical timestamps with logical counters, providing causal ordering close to real time in O(1) space.",
    },
    {
      term: "Happens-Before",
      definition:
        "A partial ordering of events where A happens-before B if A could have influenced B through same-process ordering or message passing.",
    },
    {
      term: "TrueTime",
      definition:
        "Google's time API that returns an uncertainty interval, enabling Spanner to achieve external consistency by waiting out clock uncertainty.",
    },
    {
      term: "NTP (Network Time Protocol)",
      definition:
        "A protocol for synchronizing clocks over a network, typically achieving millisecond accuracy in data centers but subject to drift and corrections.",
    },
    {
      term: "Causal Ordering",
      definition:
        "An ordering guarantee where causally related events are seen in the same order by all nodes. Concurrent events (with no causal relationship) may be ordered differently by different nodes.",
    },
    {
      term: "External Consistency",
      definition:
        "A guarantee that if transaction T1 commits before T2 starts in real time, then T1's timestamp is less than T2's timestamp. Achieved by Google Spanner using TrueTime commit-wait.",
    },
    {
      term: "Monotonic Clock",
      definition:
        "A clock that only moves forward, never backward. Unlike wall clocks (which can jump due to NTP corrections), monotonic clocks are suitable for measuring elapsed time and timeouts.",
    },
  ],
};
