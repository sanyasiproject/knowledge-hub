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
  deepDive: [
    "**The fundamental impossibility of distributed time** stems from the lack of a shared global clock and the non-zero latency of all communication. Even with **NTP**, clocks drift between synchronization intervals (typically 64-1024 seconds) at rates of 10-100 ppm (parts per million), meaning a 100 ppm drift accumulates **~8.6 ms per day**. In a geo-distributed system with nodes across continents, one-way network latency alone can exceed 100 ms, making it impossible to distinguish \"event A happened 50 ms before event B\" from \"event B happened first but the clock was 150 ms ahead.\" This is why Leslie Lamport formalized the *happens-before* relation as a **partial order** rather than a total order: some events are genuinely **concurrent** (neither could have influenced the other), and any system that forces a total order on concurrent events is making an *arbitrary* choice. Understanding this distinction between *physical time* (which is unreliable across nodes) and *logical time* (which captures only causality) is the foundation of all distributed ordering strategies.",
    "**Vector clocks and their trade-offs** deserve deeper analysis because they represent the *theoretical optimum* for capturing causality. A vector clock with N entries can represent the full causal history of the system: `V(a) < V(b)` if and only if event `a` *happened before* event `b` in Lamport's sense. No smaller data structure can achieve this. However, the **O(N) space cost** per timestamp becomes prohibitive in systems with thousands of nodes — imagine storing a 10,000-entry vector with every key-value pair in a database. **Dotted version vectors** (used in Riak) optimize for the common case where most entries are identical by storing only the *dots* (node-id, counter pairs) that differ from a shared base. **Interval tree clocks** go further by representing the vector as a binary tree that can be efficiently split and merged, supporting dynamic node joins and departures without vector growth. In practice, many systems compromise: **CRDTs** use vector clocks for conflict detection but keep vectors short by limiting them to the set of *active replicas* rather than all historical participants.",
    "**Hybrid Logical Clocks and their adoption in modern databases** represent a pragmatic middle ground. CockroachDB uses HLC timestamps as its **MVCC version**, meaning every row version is tagged with an HLC value. Reads at a specific HLC timestamp see a consistent snapshot, and *causal consistency* ensures that if transaction T1 writes a value that transaction T2 reads, then `HLC(T1) < HLC(T2)`. The physical component stays within a configurable **maximum clock offset** (default 500 ms in CockroachDB); if a node's clock drifts beyond this, it self-terminates to prevent ordering violations. MongoDB uses a similar scheme for its *oplog* timestamps, combining a Unix epoch seconds value with an incrementing counter to produce unique, causally ordered identifiers. The **bounded logical counter** in HLC is a critical design property: because the logical component resets whenever the physical component advances, it cannot grow unboundedly, keeping timestamps compact and comparable to wall-clock values for human debugging and TTL enforcement.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Lamport Clock implementation in C++",
      source: `#include <cstdint>
#include <algorithm>
#include <mutex>

class LamportClock {
    uint64_t counter_{0};
    mutable std::mutex mu_;

public:
    // Increment before each local event; returns the new timestamp
    uint64_t tick() {
        std::lock_guard<std::mutex> lock(mu_);
        return ++counter_;
    }

    // Called when sending a message: returns timestamp to include
    uint64_t send() {
        return tick();
    }

    // Called on receiving a message with the sender's timestamp
    uint64_t receive(uint64_t sender_ts) {
        std::lock_guard<std::mutex> lock(mu_);
        counter_ = std::max(counter_, sender_ts) + 1;
        return counter_;
    }

    uint64_t current() const {
        std::lock_guard<std::mutex> lock(mu_);
        return counter_;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Vector Clock with concurrency detection",
      source: `#include <vector>
#include <algorithm>
#include <cstdint>
#include <string>
#include <sstream>

class VectorClock {
    std::vector<uint64_t> clock_;
    int node_id_;

public:
    VectorClock(int node_id, int num_nodes)
        : clock_(num_nodes, 0), node_id_(node_id) {}

    // Increment own entry before each local event
    void tick() { ++clock_[node_id_]; }

    // On send: tick and return a copy of the vector
    std::vector<uint64_t> send() {
        tick();
        return clock_;
    }

    // On receive: merge with sender's vector, then tick
    void receive(const std::vector<uint64_t>& sender) {
        for (size_t i = 0; i < clock_.size(); ++i)
            clock_[i] = std::max(clock_[i], sender[i]);
        tick();
    }

    // Compare two vector clocks for causal ordering
    enum Relation { BEFORE, AFTER, CONCURRENT, EQUAL };

    static Relation compare(const std::vector<uint64_t>& a,
                            const std::vector<uint64_t>& b) {
        bool a_leq_b = true, b_leq_a = true;
        for (size_t i = 0; i < a.size(); ++i) {
            if (a[i] > b[i]) a_leq_b = false;
            if (b[i] > a[i]) b_leq_a = false;
        }
        if (a_leq_b && b_leq_a) return EQUAL;
        if (a_leq_b) return BEFORE;   // a happened before b
        if (b_leq_a) return AFTER;    // b happened before a
        return CONCURRENT;            // neither dominates
    }

    const std::vector<uint64_t>& get() const { return clock_; }
};`,
    },
    {
      language: "cpp",
      caption: "Hybrid Logical Clock (HLC) implementation",
      source: `#include <cstdint>
#include <algorithm>
#include <chrono>
#include <mutex>

struct HLCTimestamp {
    uint64_t physical;  // wall-clock milliseconds
    uint32_t logical;   // logical counter

    bool operator<(const HLCTimestamp& o) const {
        return physical < o.physical ||
               (physical == o.physical && logical < o.logical);
    }
    bool operator==(const HLCTimestamp& o) const {
        return physical == o.physical && logical == o.logical;
    }
};

class HybridLogicalClock {
    HLCTimestamp current_{0, 0};
    mutable std::mutex mu_;

    static uint64_t wall_ms() {
        using namespace std::chrono;
        return duration_cast<milliseconds>(
            system_clock::now().time_since_epoch()).count();
    }

public:
    // Local or send event
    HLCTimestamp tick() {
        std::lock_guard<std::mutex> lock(mu_);
        uint64_t pt = wall_ms();
        if (pt > current_.physical) {
            current_.physical = pt;
            current_.logical = 0;
        } else {
            ++current_.logical;
        }
        return current_;
    }

    // Receive event with sender's HLC timestamp
    HLCTimestamp receive(const HLCTimestamp& msg) {
        std::lock_guard<std::mutex> lock(mu_);
        uint64_t pt = wall_ms();
        if (pt > current_.physical && pt > msg.physical) {
            current_.physical = pt;
            current_.logical = 0;
        } else if (current_.physical == msg.physical) {
            current_.logical = std::max(current_.logical, msg.logical) + 1;
        } else if (current_.physical > msg.physical) {
            ++current_.logical;
        } else {
            current_.physical = msg.physical;
            current_.logical = msg.logical + 1;
        }
        return current_;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Logical Clocks and Ordering",
      kind: "mindmap",
      caption: "Overview of time ordering mechanisms in distributed systems from physical to vector clocks.",
      mermaid: `mindmap
  root((Time Ordering))
    Physical Clocks
      NTP synchronization
      Clock drift
      Not monotonic
    Lamport Timestamps
      Logical clock
      Happens-before
      Causal ordering
    Vector Clocks
      Per-node counters
      Concurrent detection
      Full causality
    Hybrid Logical Clocks
      Physical plus logical
      NTP plus causality`,
    },
    {
      title: "Lamport Clock Message Flow",
      kind: "sequence",
      caption: "How Lamport timestamps are incremented on send and updated on receive to preserve causal order.",
      mermaid: `sequenceDiagram
    participant A as Node A
    participant B as Node B
    participant C as Node C
    Note over A: t=1
    A->>B: msg t=1
    Note over B: t=max(0,1)+1=2
    Note over B: t=2
    B->>C: msg t=2
    Note over C: t=max(0,2)+1=3
    Note over A: t=2 local event
    A->>C: msg t=2
    Note over C: t=max(3,2)+1=4`,
    },
    {
      title: "Vector Clock Causality Detection",
      kind: "architecture",
      caption: "Three nodes maintaining vector clocks to detect causal relationships and concurrent events.",
      mermaid: `graph TD
    A1["A: [1,0,0]
local event"] --> A2["A: [2,0,0]
send to B"]
    A2 -->|send [2,0,0]| B1["B: [2,1,0]
receive from A"]
    B1 --> B2["B: [2,2,0]
send to C"]
    B2 -->|send [2,2,0]| C1["C: [2,2,1]
receive from B"]
    A1 --> A3["A: [3,0,0]
concurrent with B events"]`,
    },
    {
      title: "Total vs Causal Ordering",
      kind: "flow",
      caption: "Decision flow for choosing an ordering guarantee based on system requirements.",
      mermaid: `flowchart TD
    A([Choose ordering]) --> B{Global total order needed?}
    B -->|Yes| C["Use consensus
Raft or Paxos"]
    C --> D["Total Order Broadcast
high cost"]
    B -->|No| E{Causal order enough?}
    E -->|Yes| F["Use Vector Clocks
or Causal Broadcast"]
    E -->|No| G{Per-key order enough?}
    G -->|Yes| H["Partition by key
single leader per key"]
    G -->|No| F`,
    },
  ],
  comparison: {
    columns: ["Property", "**Wall Clock**", "**Lamport Clock**", "**Vector Clock**", "**HLC**", "**TrueTime**"],
    rows: [
      ["Ordering guarantee", "*None* (skew)", "*Causal* (one-way)", "**Causal + concurrency**", "*Causal* (one-way)", "**External consistency**"],
      ["Detects concurrency", "No", "No", "**Yes**", "No", "No"],
      ["Space per timestamp", "O(1)", "O(1)", "**O(N)** nodes", "O(1)", "O(1)"],
      ["Close to real time", "**Yes**", "No", "No", "**Yes**", "**Yes**"],
      ["Hardware required", "Standard NTP", "None", "None", "Standard NTP", "*Atomic clocks + GPS*"],
      ["Used in", "General", "Textbook / simple systems", "Riak, Dynamo", "**CockroachDB, MongoDB**", "**Google Spanner**"],
    ],
  },
  exercises: [
    "**Lamport clock trace**: Simulate three processes exchanging 5 messages. Manually compute the Lamport timestamp for each event and verify that every *send-receive* pair satisfies `L(send) < L(receive)`. Find two events where `L(A) < L(B)` but A and B are actually *concurrent*.",
    "**Vector clock conflict detection**: Implement the `VectorClock` class and simulate two nodes independently writing to the same key without synchronizing. Use `VectorClock::compare()` to prove the writes are *concurrent*, then add a synchronization message and verify the ordering becomes *causal*.",
    "**HLC bounded drift**: Implement `HybridLogicalClock` and write a test where you artificially set one node's physical clock 1 second ahead. Send 100 messages between nodes and verify that the *logical counter* stays bounded (resets on physical advancement).",
    "**Clock skew simulation**: Write a program with two threads, each maintaining a `std::chrono::system_clock` with artificial skew (add a random offset of 0-200 ms). Have them timestamp shared events and count how many events are *misordered* by wall clock vs correctly ordered by a Lamport clock.",
    "**Snowflake ID generator**: Implement a Snowflake-style ID with 41 bits for timestamp (ms since epoch), 10 bits for machine ID, and 12 bits for sequence number. Generate 10,000 IDs across 4 simulated machines and verify they are *roughly* time-ordered but not *strictly* ordered across machines.",
  ],
  cheatSheet: [
    "**Lamport Clock rule**: on local/send event `C++`; on receive `C = max(C, msg_C) + 1`. Guarantees: `a -> b` implies `L(a) < L(b)`, but *not* the converse.",
    "**Vector Clock rule**: on local/send `V[self]++`; on receive `V[i] = max(V[i], msg_V[i])` for all i, then `V[self]++`. **Concurrent** if neither vector dominates.",
    "**HLC rule**: `physical = max(wall, current.physical, msg.physical)`; if physical unchanged, `logical++`; else `logical = 0`. Stays close to wall time with **O(1)** space.",
    "**TrueTime**: returns `[earliest, latest]`. Spanner *commit-waits* the uncertainty interval to guarantee **external consistency**. Requires atomic clocks + GPS.",
    "**Concurrency test**: events A, B are concurrent iff `NOT (V(A) <= V(B)) AND NOT (V(B) <= V(A))` — each vector has at least one component strictly greater.",
    "**NTP accuracy**: ~1 ms in data centers, ~10-100 ms across regions. Clock can jump *backward* after correction. Use **monotonic clocks** for elapsed-time measurement.",
  ],
  revisionNotes: [
    "**Wall clocks are unreliable** across nodes due to NTP drift (~10-100 ppm), clock jumps, and leap seconds. Never use raw `system_clock` timestamps to order distributed events.",
    "**Lamport clocks** provide a *total order* consistent with causality using a single counter, but **cannot detect concurrent events**. If `L(A) < L(B)`, A might have caused B *or* they might be concurrent.",
    "**Vector clocks** are the only mechanism that captures both *causal ordering* and *concurrency detection*, but at **O(N) space cost** per timestamp. Optimized variants: *dotted version vectors* (Riak) and *interval tree clocks*.",
    "**HLC** combines physical time with a bounded logical counter, giving *causal ordering* close to real time in **O(1) space**. Used in CockroachDB (MVCC) and MongoDB (oplog). Cannot detect concurrency.",
    "**Google TrueTime** is the only approach achieving *external consistency* with physical time, using uncertainty intervals and *commit-wait*. Requires specialized hardware (atomic clocks + GPS) unavailable to most systems.",
  ],
};
