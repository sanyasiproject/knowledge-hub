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
  followUps: [
    "How would you implement read-your-own-writes without making the whole system strongly consistent?",
    "Which of your data genuinely needs linearizability?",
    "Where does eventual consistency become visible and confusing to a user?",
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
  resources: [
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
    },
    {
      label: "Jepsen — consistency model analyses", url: "https://jepsen.io/analyses",
      kind: "article",
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
  deepDive: [
    "**Linearizability** imposes a *total order* on all operations such that each operation appears to execute atomically at a single point between its invocation and response -- this is called the **linearization point**. Implementing linearizability requires a **consensus protocol** like *Raft* or *Multi-Paxos* where a designated leader serializes all writes and a quorum of replicas acknowledges before the write is considered committed. The critical insight is that *reads must also go through the leader* (or use a lease mechanism) to avoid returning stale data from a follower that has not yet received the latest write. Google **Spanner** achieves *external consistency* (stronger than linearizability) by using **TrueTime** -- GPS and atomic clock-synchronized timestamps with bounded uncertainty -- allowing it to order transactions across globally distributed nodes without requiring all reads to hit a single leader. The cost is measurable: linearizable operations in Spanner add 7-14ms of commit latency for cross-region transactions.",
    "**Eventual consistency** is deceptively simple to define but *complex to reason about* in practice. The key challenge is **conflict resolution** when concurrent writes happen at different replicas. **Last-Writer-Wins (LWW)** uses timestamps to pick a winner, but clock skew can silently discard valid writes. **Version vectors** (generalizations of vector clocks) detect conflicts but push resolution to the application. **CRDTs** (Conflict-free Replicated Data Types) provide *mathematically guaranteed convergence* without coordination: a *G-Counter* uses per-replica counters that only increment, merging via element-wise max; an *OR-Set* (Observed-Remove Set) tracks add/remove operations with unique tags. CRDTs are used in production by **Riak** (CRDT maps, sets, counters), **Redis** (CRDB module), and **Figma** (real-time collaborative editing). The limitation is that not all data structures have efficient CRDT representations -- arbitrary relational operations, for instance, cannot be expressed as CRDTs.",
    "**Causal consistency** occupies a *sweet spot* in the consistency spectrum: it is the strongest model achievable without sacrificing availability during partitions (proven by Mahajan et al., 2011). Implementation relies on tracking **causal dependencies** between operations. Each operation carries a *dependency metadata* (typically a **vector clock** or **dotted version vector**) that records which operations it has observed. When a replica receives an operation, it *delays delivery* until all causally preceding operations have been applied locally. In practice, the metadata overhead grows with the number of writers, so systems like **COPS** (Clusters of Order-Preserving Servers) and **Eiger** compress dependency metadata using *explicit dependency tracking* -- only tracking the immediate dependencies rather than the full transitive closure. MongoDB offers causal consistency within a *client session* by passing an `operationTime` token that ensures reads at a replica reflect all prior writes from that session."
  ],
  code: [
    {
      language: "cpp",
      caption: "Simulating linearizable register with Raft-style quorum reads and writes",
      source: `#include <iostream>
#include <vector>
#include <mutex>
#include <thread>
#include <optional>
#include <chrono>

// Simplified **linearizable register** using quorum-based reads/writes.
// In a real system, this would use Raft consensus across network nodes.

class LinearizableRegister {
    struct VersionedValue {
        int value;
        uint64_t version;       // Monotonically increasing *write timestamp*
    };

    // Simulates N replicas — each holds a copy of the value
    std::vector<VersionedValue> replicas_;
    std::mutex mu_;
    uint64_t next_version_ = 1;
    int num_replicas_;

public:
    explicit LinearizableRegister(int n) : num_replicas_(n), replicas_(n, {0, 0}) {}

    // **Quorum write**: must be acknowledged by majority (N/2 + 1)
    bool Write(int value) {
        std::lock_guard<std::mutex> lock(mu_);
        uint64_t ver = next_version_++;
        int acks = 0;
        int quorum = num_replicas_ / 2 + 1;

        for (auto& replica : replicas_) {
            // In practice: RPC to each replica, wait for quorum
            if (replica.version < ver) {
                replica = {value, ver};
                ++acks;
            }
        }
        // Write succeeds only if **quorum** acknowledges
        return acks >= quorum;
    }

    // **Quorum read**: read from majority, return highest version
    std::optional<int> Read() {
        std::lock_guard<std::mutex> lock(mu_);
        int quorum = num_replicas_ / 2 + 1;

        uint64_t max_ver = 0;
        int result = 0;
        int responses = 0;

        for (const auto& replica : replicas_) {
            if (replica.version >= max_ver) {
                max_ver = replica.version;
                result = replica.value;
            }
            ++responses;
            if (responses >= quorum) break;
        }
        // Linearizability: read reflects the **latest committed write**
        return result;
    }
};

int main() {
    LinearizableRegister reg(5);  // 5 replicas, quorum = 3

    reg.Write(42);
    auto val = reg.Read();
    std::cout << "Linearizable read: " << val.value_or(-1) << std::endl;
    // Always prints 42 — **strong consistency** guaranteed

    reg.Write(100);
    val = reg.Read();
    std::cout << "After second write: " << val.value_or(-1) << std::endl;
    // Always prints 100 — reads never return stale data

    return 0;
}`
    },
    {
      language: "cpp",
      caption: "Vector clock implementation for tracking causal dependencies between distributed nodes",
      source: `#include <iostream>
#include <map>
#include <string>
#include <algorithm>
#include <sstream>

// **Vector Clock** — tracks causal dependencies across distributed nodes.
// Each node maintains a map of {node_id -> logical_timestamp}.

class VectorClock {
    std::map<std::string, uint64_t> clock_;

public:
    // **Local event**: increment this node's counter
    void Tick(const std::string& node_id) {
        clock_[node_id]++;
    }

    // **Send event**: tick and return clock to attach to message
    VectorClock Send(const std::string& node_id) {
        Tick(node_id);
        return *this;  // Sender attaches its *full vector clock*
    }

    // **Receive event**: merge incoming clock, then tick local
    void Receive(const std::string& node_id, const VectorClock& incoming) {
        // Element-wise **max** ensures causal history is preserved
        for (const auto& [id, ts] : incoming.clock_) {
            clock_[id] = std::max(clock_[id], ts);
        }
        Tick(node_id);  // Record the receive as a local event
    }

    // **Happens-before** (causal ordering): a -> b iff a[i] <= b[i] for all i
    bool HappensBefore(const VectorClock& other) const {
        bool strictly_less = false;
        for (const auto& [id, ts] : clock_) {
            auto it = other.clock_.find(id);
            uint64_t other_ts = (it != other.clock_.end()) ? it->second : 0;
            if (ts > other_ts) return false;  // Not causally before
            if (ts < other_ts) strictly_less = true;
        }
        // Check for keys in other but not in this (implicitly 0 here)
        for (const auto& [id, ts] : other.clock_) {
            if (clock_.find(id) == clock_.end() && ts > 0)
                strictly_less = true;
        }
        return strictly_less;
    }

    // **Concurrent**: neither happens-before the other
    bool IsConcurrent(const VectorClock& other) const {
        return !HappensBefore(other) && !other.HappensBefore(*this);
    }

    std::string ToString() const {
        std::ostringstream oss;
        oss << "{";
        for (auto it = clock_.begin(); it != clock_.end(); ++it) {
            if (it != clock_.begin()) oss << ", ";
            oss << it->first << ":" << it->second;
        }
        oss << "}";
        return oss.str();
    }
};

int main() {
    VectorClock a, b, c;

    // Node A writes, sends to B
    auto msg1 = a.Send("A");               // A={A:1}
    b.Receive("B", msg1);                   // B={A:1, B:1}

    // Node B writes, sends to C
    auto msg2 = b.Send("B");               // B={A:1, B:2}
    c.Receive("C", msg2);                   // C={A:1, B:2, C:1}

    // Independent write on A (concurrent with B's write)
    a.Tick("A");                            // A={A:2}

    std::cout << "A: " << a.ToString() << std::endl;
    std::cout << "B: " << b.ToString() << std::endl;
    std::cout << "C: " << c.ToString() << std::endl;

    std::cout << "msg1 -> C? " << msg1.HappensBefore(c) << std::endl;  // true
    std::cout << "A concurrent with C? " << a.IsConcurrent(c) << std::endl;  // true

    return 0;
}`
    },
    {
      language: "cpp",
      caption: "G-Counter CRDT: conflict-free replicated counter that converges without coordination",
      source: `#include <iostream>
#include <map>
#include <string>
#include <algorithm>
#include <numeric>

// **G-Counter** (Grow-only Counter) — a CRDT that supports
// increment operations and **converges automatically** across replicas.
// Merge operation: element-wise max. No coordination needed.

class GCounter {
    std::map<std::string, uint64_t> counts_;  // Per-replica counters

public:
    // **Increment**: only the local replica's counter increases
    void Increment(const std::string& replica_id, uint64_t amount = 1) {
        counts_[replica_id] += amount;
    }

    // **Query**: total count is the sum of all replica counters
    uint64_t Value() const {
        return std::accumulate(
            counts_.begin(), counts_.end(), uint64_t{0},
            [](uint64_t sum, const auto& pair) { return sum + pair.second; }
        );
    }

    // **Merge**: element-wise max guarantees *convergence*
    // This is the key CRDT property — merge is:
    //   - **Commutative**: merge(a,b) == merge(b,a)
    //   - **Associative**: merge(merge(a,b),c) == merge(a,merge(b,c))
    //   - **Idempotent**: merge(a,a) == a
    void Merge(const GCounter& other) {
        for (const auto& [replica, count] : other.counts_) {
            counts_[replica] = std::max(counts_[replica], count);
        }
    }

    void Print(const std::string& label) const {
        std::cout << label << " = " << Value() << " (";
        for (const auto& [r, c] : counts_)
            std::cout << r << ":" << c << " ";
        std::cout << ")" << std::endl;
    }
};

int main() {
    GCounter replica_a, replica_b, replica_c;

    // Concurrent increments on different replicas (no coordination!)
    replica_a.Increment("A", 5);
    replica_b.Increment("B", 3);
    replica_c.Increment("C", 7);

    // Each replica has a *partial view*
    replica_a.Print("A before merge");  // A=5 (only knows about itself)
    replica_b.Print("B before merge");  // B=3

    // **Merge** in any order — result is always the same (convergence)
    replica_a.Merge(replica_b);
    replica_a.Merge(replica_c);
    replica_a.Print("A after merge");   // A=15 (5+3+7)

    // Replicas B and C merge independently — same result
    replica_b.Merge(replica_c);
    replica_b.Merge(replica_a);
    replica_b.Print("B after merge");   // B=15 — **converged**

    return 0;
}`
    }
  ],
  diagrams: [
    {
      title: "Consistency Model Taxonomy",
      kind: "mindmap",
      caption: "Consistency models grouped by strength: strong models guarantee real-time ordering, session models provide per-client guarantees, and eventual models prioritize availability.",
      mermaid: `mindmap
  root["Consistency Models"]
    Strong Models
      Linearizability
        Real-time ordering
        Spanner etcd
      Strict Serializability
        Transactions ordered
        FaunaDB
      Sequential Consistency
        Global order exists
        Lamport clocks
    Session Models
      Read-Your-Writes
        See own writes
      Monotonic Reads
        No time travel reads
      Monotonic Writes
        Ordered own writes
    Weak Models
      Causal Consistency
        Cause before effect
        MongoDB sessions
      Eventual Consistency
        Converges over time
        DynamoDB Cassandra`,
    },
    {
      title: "Quorum Read and Write Sequence",
      kind: "sequence",
      caption: "With N=3, W=2, R=2, writing to a quorum and reading from a quorum guarantees overlap since R+W exceeds N, ensuring strong consistency.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant R1 as Replica 1
    participant R2 as Replica 2
    participant R3 as Replica 3

    Note over C,R3: Write quorum W=2
    C->>R1: Write x=42 v=5
    C->>R2: Write x=42 v=5
    C->>R3: Write x=42 v=5
    R1-->>C: ACK
    R2-->>C: ACK
    Note over C: 2 ACKs received - committed
    Note over C,R3: Read quorum R=2
    C->>R1: Read x
    C->>R2: Read x
    R1-->>C: x=42 v=5
    R2-->>C: x=42 v=5
    Note over C: Return highest version x=42`,
    },
    {
      title: "Eventual Consistency Convergence Flow",
      kind: "flow",
      caption: "In an eventually consistent system, concurrent writes on different replicas create temporary divergence that is resolved through anti-entropy and conflict resolution.",
      mermaid: `flowchart TD
    Client1["Client A writes x=1"] --> R1["Replica 1 x=1"]
    Client2["Client B writes x=2"] --> R2["Replica 2 x=2"]
    R1 -->|"gossip sync"| R2
    R2 -->|"gossip sync"| R1
    R1 --> CR{"Conflict resolution"}
    R2 --> CR
    CR -->|"LWW last write wins"| Merged1["Both replicas x=2"]
    CR -->|"CRDT merge"| Merged2["Both replicas merged value"]
    Merged1 --> Conv["System converged"]
    Merged2 --> Conv`,
    },
    {
      title: "CAP Theorem Database Classification",
      kind: "architecture",
      caption: "Distributed databases classified by their CAP trade-off: CP systems choose consistency over availability during partitions, AP systems choose availability.",
      mermaid: `graph TB
    CAP["CAP Theorem - pick 2 of 3"]
    CAP --> CP["CP - Consistent and Partition-tolerant"]
    CAP --> AP["AP - Available and Partition-tolerant"]
    CP --> etcd["etcd - Raft consensus"]
    CP --> Spanner["Spanner - TrueTime"]
    CP --> Zookeeper["ZooKeeper - ZAB protocol"]
    AP --> Cassandra["Cassandra - tunable consistency"]
    AP --> DynamoDB["DynamoDB - eventual default"]
    AP --> CouchDB["CouchDB - multi-master MVCC"]`,
    },
  ],
  animations: [
    {
      title: "The same read under three models",
      steps: [
        {
          label: "Write lands on the primary",
          detail: "User updates their display name.",
        },
        {
          label: "Strong consistency",
          detail: "Every subsequent read anywhere returns the new name — at the cost of coordination latency.",
        },
        {
          label: "Eventual consistency",
          detail: "A read hitting a lagging replica returns the old name. It converges in milliseconds to seconds.",
        },
        {
          label: "Why it matters here",
          detail: "The user sees their own profile still showing the old name and thinks the save failed.",
        },
        {
          label: "Read-your-own-writes",
          detail: "Route that user's reads to the primary for a short window. Everyone else can read replicas.",
        },
        {
          label: "The lesson",
          detail: "Choose per data type, not per system. Most data tolerates lag; a small subset does not.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Linearizability", "Sequential", "Causal", "Eventual"],
    rows: [
      ["**Real-time ordering**", "*Yes* -- ops respect wall-clock order", "No -- any total order is valid", "Only for causally related ops", "No ordering guarantees"],
      ["**Availability under partition**", "No (must reject ops)", "No", "*Yes* (strongest available model)", "*Yes* (maximum availability)"],
      ["**Coordination required**", "Consensus (Raft/Paxos)", "Total order broadcast", "Dependency tracking only", "None (anti-entropy)"],
      ["**Read staleness**", "Never stale", "May see stale across sessions", "Never stale for causal chain", "Can be *arbitrarily stale*"],
      ["**Performance cost**", "*Highest* (quorum round-trips)", "High (total ordering)", "Moderate (vector clocks)", "*Lowest* (local reads)"],
      ["**Example systems**", "Spanner, etcd, ZooKeeper", "ZooKeeper (per-client)", "COPS, MongoDB sessions", "DynamoDB, Cassandra, DNS"],
      ["**Conflict resolution**", "Not needed (serialized)", "Not needed", "Not needed for causal ops", "LWW, vector clocks, CRDTs"]
    ]
  },
  exercises: [
    "**Quorum Calculator**: Given a replication factor `N=5`, determine the minimum values of `W` (write quorum) and `R` (read quorum) such that `R + W > N` for strong consistency. Then calculate all valid `(R, W)` pairs. For each pair, discuss the trade-off: which favors *read-heavy* workloads? Which favors *write-heavy*? What happens if you set `W=1, R=1`?",
    "**Vector Clock Conflict Detection**: Three nodes (A, B, C) perform these operations in order: (1) A writes x=1, sends to B; (2) B writes x=2, sends to C; (3) A writes x=3 (independent of B's write); (4) C receives A's update. Draw the vector clocks at each step. Identify which pairs of operations are *concurrent* and which have a *happens-before* relationship. What conflict does C detect?",
    "**CRDT Design Exercise**: Design a **PN-Counter** (positive-negative counter) CRDT that supports both `increment` and `decrement` operations using two internal G-Counters (one for increments, one for decrements). Implement the `merge` function and prove it satisfies *commutativity*, *associativity*, and *idempotency*. Then implement it in C++ and test with 3 concurrent replicas.",
    "**Consistency Level Analysis**: A Cassandra cluster has `N=3` replicas. A client writes with `CL=QUORUM` (2 replicas) and immediately reads with `CL=ONE` (1 replica). Can the read return stale data? What if the read uses `CL=QUORUM`? Prove your answer using the quorum intersection property. Then consider: what happens if one replica is down during the write?",
    "**Session Guarantee Implementation**: Implement a *read-your-writes* guarantee for a client talking to 3 eventually consistent replicas. The client should track the version of its last write and, on read, either (a) route to the replica that received the write, or (b) wait until the target replica has caught up. Code this in C++ with simulated replicas and demonstrate that the guarantee holds even when replicas have different lag."
  ],
  cheatSheet: [
    "**Linearizability** = every read returns the *latest write*; requires **consensus** (Raft/Paxos); sacrifices availability during partitions (CP in CAP)",
    "**Eventual consistency** = replicas *converge* given no new writes; no ordering guarantees; maximum availability; conflict resolution via **LWW**, **vector clocks**, or **CRDTs**",
    "**Causal consistency** = preserves *happens-before* order; strongest model that remains **available under partitions**; tracked via vector clocks or Lamport timestamps",
    "**Quorum rule**: `R + W > N` guarantees read-write overlap for strong consistency; `R + W <= N` allows stale reads (eventual consistency)",
    "**CAP theorem**: during partition, choose **C** (reject requests) or **A** (serve potentially stale data); cannot have both. **PACELC** adds: without partition, choose **L**atency or **C**onsistency",
    "**CRDTs** converge automatically via *commutative + associative + idempotent* merge; no coordination needed; types include G-Counter, PN-Counter, G-Set, OR-Set, LWW-Register"
  ],
  revisionNotes: [
    "The consistency spectrum runs from **linearizability** (strongest, highest cost) through **sequential**, **causal**, and **session guarantees** down to **eventual consistency** (weakest, highest availability). *Causal consistency* is the strongest model achievable without losing availability during partitions.",
    "**Quorum systems** achieve strong consistency when `R + W > N` because every read quorum *must overlap* with the most recent write quorum. Tuning R and W independently lets you optimize for read-heavy (`R=1, W=N`) or write-heavy (`R=N, W=1`) workloads.",
    "**CRDTs** are the gold standard for *coordination-free convergence*: they define merge operations that are commutative, associative, and idempotent, guaranteeing that replicas converge regardless of message order or duplication. Common types: **G-Counter** (grow-only), **PN-Counter** (positive-negative), **OR-Set** (observed-remove set).",
    "In practice, most systems offer **tunable consistency**: Cassandra's per-query consistency levels, DynamoDB's strongly vs eventually consistent reads, MongoDB's read/write concern. The right choice depends on the operation: use strong consistency for *financial transactions*, eventual for *page view counters*, causal for *social media feeds*."
  ],
};
