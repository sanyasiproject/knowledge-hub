import type { TopicContent } from "../types";

export const leaderElection: TopicContent = {
  quickSummary: [
    "Leader election selects a single node to act as the coordinator for a distributed system — handling writes, making decisions, or orchestrating workflows — while ensuring exactly one leader exists at any time.",
    "The bully algorithm selects the node with the highest ID as leader, using election and coordinator messages — simple but vulnerable to network partitions causing split-brain.",
    "ZooKeeper implements leader election via ephemeral sequential znodes — each candidate creates a znode, and the one with the lowest sequence number becomes the leader; watches notify candidates of changes.",
    "Fencing tokens (monotonically increasing numbers issued with each leadership grant) prevent stale leaders from corrupting state — a storage system rejects operations with tokens older than the latest it has seen.",
  ],
  detailed: [
    `## Why Leader Election

Many distributed systems designate a single **leader** (or master/primary) for coordination: Kafka's partition leader handles all reads/writes; a distributed lock service grants a lock to one holder; a database primary processes writes while replicas follow. Leader election ensures exactly one node acts as leader at any time.

The core challenge is **split-brain**: if the network partitions, nodes on each side might elect their own leader, leading to conflicting decisions and data corruption. Election protocols must prevent this or detect and resolve it. Leader election is fundamentally a consensus problem — the nodes must agree on who the leader is.`,

    `## Bully Algorithm

The **bully algorithm** (Garcia-Molina, 1982) is the simplest leader election protocol. Each node has a unique numeric ID. Rules: (1) When a node detects the leader is down (timeout), it sends an ELECTION message to all nodes with higher IDs. (2) If any higher-ID node responds with ALIVE, the initiator backs off and waits. (3) If no higher-ID node responds, the initiator declares itself leader by sending COORDINATOR to all nodes.

The highest-ID active node always becomes leader (the "bully"). Pros: simple to implement. Cons: assumes reliable failure detection; does not handle network partitions well (nodes on each side of a partition may both elect leaders); generates O(n^2) messages in the worst case; the highest-ID node always wins even if it just recovered and has stale state.`,

    `## ZooKeeper-based Leader Election

**ZooKeeper** provides a reliable leader election primitive. The algorithm:
1. Each candidate creates an **ephemeral sequential znode** under an election path (e.g., /election/candidate-00000001).
2. The candidate with the **lowest sequence number** is the leader.
3. All other candidates set a **watch** on the znode with the next-lower sequence number (not the leader's znode — this prevents the "herd effect" of all candidates watching one node).
4. When a candidate's watched znode is deleted (the owner disconnected), it checks if it now has the lowest number and becomes leader if so.

Ephemeral znodes are automatically deleted when the creating session ends (client disconnects or times out), ensuring dead leaders are detected. ZooKeeper's consensus (ZAB protocol) prevents split-brain.`,

    `## etcd and Raft-based Election

**etcd** provides leader election via its **lease** mechanism and **campaign** API. A candidate acquires a lease (a TTL-based grant) and writes a key (e.g., /election/leader) with the lease attached. The lease must be periodically renewed; if the leader crashes, the lease expires and the key is deleted, allowing another candidate to win.

Since etcd uses **Raft** consensus, only one leader can hold the key at any time — Raft's linearizable writes prevent split-brain. The Go client library provides an \`election\` package that handles the campaign, resign, and observe lifecycle. etcd elections are simpler to use than ZooKeeper but have similar semantics.`,

    `## Fencing Tokens and Stale Leaders

A leader may believe it is still the leader even after its lease expired — due to GC pauses, network delays, or clock skew. If the old leader performs a write after a new leader was elected, it corrupts the system (**split-brain write**).

**Fencing tokens** solve this. Each leadership grant includes a monotonically increasing token (epoch number). The leader includes the fencing token in every operation. Storage systems and downstream services reject operations with a token lower than the highest they have seen. This guarantees that even if a stale leader sends a write, it is rejected because a newer leader's higher token has already been observed.

Without fencing tokens, even systems using ZooKeeper or etcd for election can suffer from stale leader writes — the election system detects leader failure, but the stale leader may still be running and issuing commands.`,

    `## Ring Election Algorithm

In the **ring algorithm**, nodes are arranged in a logical ring where each node knows its successor. When a node detects the leader has failed, it sends an election message containing its own ID to its successor. Each node receiving the message appends its own ID and forwards it. When the message returns to the initiator (having traversed the entire ring), the node with the highest ID (or other criteria such as lowest load) is selected as leader, and a coordinator message is sent around the ring.

The ring algorithm uses O(n) messages — more efficient than the bully algorithm's worst case of O(n^2). However, it requires maintaining the ring topology, which must be updated when nodes join or leave. If the ring breaks (a node's successor fails), the algorithm must repair the ring before proceeding, adding complexity. Like the bully algorithm, the ring algorithm does not handle network partitions and is primarily of academic interest.`,
  ],
  interviewQA: [
    {
      q: "How do fencing tokens prevent split-brain writes?",
      a: "Each time a new leader is elected, it receives a monotonically increasing fencing token (epoch number). The leader includes this token in all operations sent to storage systems. Storage systems track the highest token they have seen and reject any operation with a lower token. So if leader A (token 5) has a GC pause, leader B is elected (token 6), and then A wakes up and tries to write, the storage rejects A's write because token 5 < token 6 (the highest seen). This guarantees that only the most recently elected leader's writes are accepted.",
      followUps: [
        "What happens if the storage layer does not support fencing tokens?",
        "How do fencing tokens relate to Raft's term numbers?",
      ],
    },
    {
      q: "Why does ZooKeeper's leader election use watches on the next-lower znode instead of the leader's znode?",
      a: "If all candidates watched the leader's znode, when the leader dies, ZooKeeper would send a notification to ALL candidates simultaneously — the 'herd effect.' All candidates would then try to check if they are the new leader, creating a thundering herd of read requests. By having each candidate watch only the next-lower znode, when a node fails, only one candidate (the next in sequence) is notified. This reduces notifications from O(n) to O(1) per failure event.",
    },
    {
      q: "What is the fundamental problem with the bully algorithm in the presence of network partitions?",
      a: "The bully algorithm assumes reliable failure detection — if a node does not respond, it is considered dead. In a network partition, nodes on each side cannot reach each other but are still alive. Each side's highest-ID node will declare itself leader, resulting in split-brain with two leaders making conflicting decisions. The bully algorithm has no partition-aware mechanism and no way to determine which side has the legitimate majority. Consensus-based systems (ZooKeeper, etcd) solve this by requiring a majority quorum.",
    },
    {
      q: "How does Raft's leader election work, and what makes it different from ZooKeeper's approach?",
      a: "In Raft, election is integrated into the consensus protocol. A follower that times out waiting for a heartbeat becomes a candidate, increments its term, votes for itself, and requests votes from all peers. It wins with a majority. Raft's election restriction ensures only candidates with sufficiently up-to-date logs can win, preserving committed entries. In ZooKeeper, leader election is an application-level primitive built on top of ZAB consensus: clients create ephemeral sequential znodes and the lowest sequence number wins. The key difference is that Raft's election is tightly coupled with log replication and safety guarantees, while ZooKeeper's election is a higher-level abstraction that delegates consistency to the underlying ZAB protocol.",
      followUps: [
        "What is the log up-to-date check in Raft's election?",
        "How does the ring election algorithm compare to both approaches?",
      ],
    },
  ],
  followUps: [
    "What happens if two nodes both believe they are leader?",
    "How does a lease with a fencing token prevent a stale leader from doing damage?",
    "Why is 'just use ZooKeeper/etcd' usually the right answer?",
  ],
  mcqs: [
    {
      q: "What is a fencing token?",
      options: [
        "A cryptographic key for authenticating the leader",
        "A monotonically increasing number issued with each leadership grant",
        "A timeout value that determines when a leader is considered dead",
        "A lock acquired by the leader from ZooKeeper",
      ],
      answerIndex: 1,
      explanation:
        "A fencing token is a monotonically increasing number (epoch) issued each time a new leader is elected. It prevents stale leaders from corrupting state — storage systems reject operations with old tokens.",
    },
    {
      q: "In ZooKeeper-based leader election, why are ephemeral znodes used?",
      options: [
        "They are faster to create than persistent znodes",
        "They are automatically deleted when the creating session ends, detecting dead leaders",
        "They provide stronger consistency guarantees",
        "They consume less storage space",
      ],
      answerIndex: 1,
      explanation:
        "Ephemeral znodes are tied to the creating client's session. When the client disconnects (crash, network failure), the session eventually expires and the znode is deleted, automatically signaling that the leader is gone.",
    },
    {
      q: "What is the herd effect in distributed systems?",
      options: [
        "Multiple nodes crashing simultaneously due to shared dependency",
        "All candidates being notified simultaneously when the leader fails, causing a spike of competing requests",
        "A cascading failure propagating through the cluster",
        "Nodes following a failed leader's outdated state",
      ],
      answerIndex: 1,
      explanation:
        "The herd effect occurs when all watchers are notified of a single event (like leader failure), causing a simultaneous spike of competing requests. ZooKeeper avoids this by having candidates watch only the next-lower znode.",
    },
    {
      q: "In a Raft cluster with 5 nodes, what happens if 3 nodes are partitioned from the other 2?",
      options: [
        "Both partitions elect a leader",
        "The partition with 3 nodes can elect a leader; the partition with 2 cannot",
        "Neither partition can elect a leader",
        "The partition with the current leader continues; the other waits",
      ],
      answerIndex: 1,
      explanation:
        "A Raft leader requires a majority of votes (3 out of 5). The partition with 3 nodes has enough for a majority and can elect a leader. The partition with 2 nodes cannot reach a majority and remains leaderless, preventing split-brain.",
    },
  ],
  flashcards: [
    {
      front: "What is the bully algorithm?",
      back: "A simple leader election protocol where the node with the highest ID always becomes leader. When a node detects leader failure, it challenges higher-ID nodes; if none respond, it declares itself leader.",
    },
    {
      front: "What is an ephemeral znode in ZooKeeper?",
      back: "A znode that exists only while the creating client session is active. When the session ends (client disconnects or times out), the znode is automatically deleted. Used for leader detection and service registration.",
    },
    {
      front: "What is split-brain?",
      back: "A failure mode where a network partition causes two or more nodes to each believe they are the leader, leading to conflicting decisions and potential data corruption.",
    },
    {
      front: "How does etcd implement leader election?",
      back: "Using leases (TTL-based grants) and linearizable key writes via Raft consensus. A candidate writes a leader key with an attached lease. The lease must be renewed; expiry allows new election. Raft prevents split-brain.",
    },
    {
      front: "Why are fencing tokens necessary even with ZooKeeper/etcd?",
      back: "A stale leader may still be running (e.g., after a GC pause) and issuing writes after a new leader was elected. Fencing tokens let storage systems reject writes from stale leaders by checking the token's recency.",
    },
    {
      front: "What is the herd effect and how is it mitigated?",
      back: "When all watchers are notified of one event (like leader failure), causing a thundering herd of requests. Mitigated in ZooKeeper by having each candidate watch only the next-lower sequential znode, not the leader's znode.",
    },
    {
      front: "What quorum size is needed for safe leader election?",
      back: "A majority quorum (more than half the nodes). This ensures that any two quorums overlap by at least one node, preventing two leaders from being elected simultaneously in different partitions.",
    },
  ],
  deepDive: [
    "The **bully algorithm** operates on the assumption that every node knows the *IDs of all other nodes* in the system and can communicate with any of them. When a node detects that the leader has failed (via a **timeout**), it sends an `ELECTION` message to all nodes with *higher IDs*. If none respond within a timeout, it declares itself the **coordinator**. The critical weakness is the assumption of *reliable failure detection* -- in practice, network delays, **GC pauses**, and transient partitions can cause false positives, leading to unnecessary elections and potential **split-brain**. The message complexity is **O(n^2)** in the worst case because every node may initiate an election simultaneously, and each must contact all higher-ID nodes.",
    "**ZooKeeper's ephemeral sequential znodes** provide a more robust foundation for leader election. The *ephemeral* property ensures automatic cleanup when a session dies, while the *sequential* property establishes a total ordering of candidates. The **herd effect** mitigation -- where each candidate watches only the *next-lower* znode rather than the leader's znode -- is a critical design choice. Without this optimization, a leader failure would trigger `O(n)` simultaneous notifications, each candidate would issue a `getChildren()` call, and the resulting **thundering herd** could overwhelm ZooKeeper itself. The watch-predecessor pattern reduces this to `O(1)` notifications per failure, making the system scalable to *thousands of candidates*.",
    "**Fencing tokens** represent the *last line of defense* against stale leader writes and are essential even when using robust election mechanisms like **Raft** or **ZAB**. The fundamental problem is the **process pause**: a leader might hold a valid lease, experience a *long GC pause* or *page fault*, and resume operations after its lease has expired and a **new leader** has been elected. Without fencing tokens, the stale leader's writes would be accepted, corrupting the system. The fencing token is a *monotonically increasing epoch number* attached to every write operation; storage systems **reject** any write with a token lower than the highest they have seen. This provides a *linearizable ordering* of leadership changes that survives arbitrary process delays.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Bully algorithm leader election simulation",
      source: `#include <iostream>
#include <vector>
#include <algorithm>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <atomic>

class BullyElection {
    int nodeId_;
    int leaderId_;
    std::vector<int> allNodes_;
    std::mutex mtx_;
    std::atomic<bool> electionInProgress_{false};

public:
    BullyElection(int id, std::vector<int> nodes)
        : nodeId_(id), leaderId_(-1), allNodes_(std::move(nodes)) {}

    // Start election: contact all nodes with higher IDs
    void startElection() {
        std::lock_guard<std::mutex> lock(mtx_);
        electionInProgress_ = true;
        std::cout << "Node " << nodeId_ << " starting election\\n";

        bool higherNodeResponded = false;
        for (int node : allNodes_) {
            if (node > nodeId_) {
                // Send ELECTION message to higher-ID node
                if (sendElection(node)) {
                    higherNodeResponded = true;
                }
            }
        }

        if (!higherNodeResponded) {
            // No higher node responded -- declare self as leader
            declareLeader(nodeId_);
        }
        electionInProgress_ = false;
    }

    void declareLeader(int leaderId) {
        leaderId_ = leaderId;
        std::cout << "Node " << nodeId_
                  << " acknowledges leader: " << leaderId_ << "\\n";
        // Broadcast COORDINATOR message to all lower-ID nodes
        for (int node : allNodes_) {
            if (node < leaderId_) {
                sendCoordinator(node, leaderId_);
            }
        }
    }

private:
    bool sendElection(int targetNode) {
        // Simulate: returns true if target is alive
        return std::find(allNodes_.begin(), allNodes_.end(),
                         targetNode) != allNodes_.end();
    }

    void sendCoordinator(int targetNode, int leaderId) {
        std::cout << "  COORDINATOR(" << leaderId
                  << ") -> Node " << targetNode << "\\n";
    }
};`,
    },
    {
      language: "cpp",
      caption: "Fencing token implementation for stale leader protection",
      source: `#include <iostream>
#include <mutex>
#include <optional>
#include <stdexcept>

// Fencing token: monotonically increasing epoch number
class FencingTokenGenerator {
    uint64_t currentEpoch_ = 0;
    std::mutex mtx_;

public:
    uint64_t issueToken() {
        std::lock_guard<std::mutex> lock(mtx_);
        return ++currentEpoch_;
    }
};

// Storage that rejects writes from stale leaders
class FencedStorage {
    uint64_t highestSeenToken_ = 0;
    std::string data_;
    std::mutex mtx_;

public:
    bool write(uint64_t fencingToken, const std::string& value) {
        std::lock_guard<std::mutex> lock(mtx_);
        if (fencingToken < highestSeenToken_) {
            std::cerr << "REJECTED: token " << fencingToken
                      << " < highest seen " << highestSeenToken_
                      << " (stale leader detected)\\n";
            return false;   // Reject stale leader's write
        }
        highestSeenToken_ = fencingToken;
        data_ = value;
        std::cout << "ACCEPTED: token " << fencingToken
                  << ", value = \\"" << value << "\\"\\n";
        return true;
    }

    std::string read() const { return data_; }
};

// Usage: two leaders, one stale
int main() {
    FencingTokenGenerator tokenGen;
    FencedStorage storage;

    uint64_t leaderA_token = tokenGen.issueToken(); // epoch 1
    uint64_t leaderB_token = tokenGen.issueToken(); // epoch 2

    // Leader B writes first (it was elected after A)
    storage.write(leaderB_token, "data_from_leader_B");

    // Leader A wakes up from GC pause, tries to write
    storage.write(leaderA_token, "stale_data_from_A"); // REJECTED

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Ring-based leader election algorithm",
      source: `#include <iostream>
#include <vector>
#include <algorithm>

class RingElection {
    int nodeId_;
    int successor_;          // next node in the ring
    bool participating_ = false;

public:
    RingElection(int id, int successor)
        : nodeId_(id), successor_(successor) {}

    // Initiate election by sending own ID around the ring
    std::vector<int> startElection() {
        participating_ = true;
        std::vector<int> electionMsg = { nodeId_ };
        std::cout << "Node " << nodeId_
                  << " starts election, forwarding to "
                  << successor_ << "\\n";
        return electionMsg;
    }

    // Receive election message, append ID, forward or declare winner
    std::vector<int> receiveElection(std::vector<int> msg) {
        if (std::find(msg.begin(), msg.end(), nodeId_) != msg.end()) {
            // Message has traversed the full ring
            int leader = *std::max_element(msg.begin(), msg.end());
            std::cout << "Ring traversal complete. Leader: "
                      << leader << "\\n";
            return {};  // Send COORDINATOR message instead
        }
        msg.push_back(nodeId_);
        participating_ = true;
        std::cout << "Node " << nodeId_ << " forwards election ["
                  << msg.size() << " candidates] to "
                  << successor_ << "\\n";
        return msg;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Bully Algorithm Election Flow",
      kind: "sequence",
      caption: "Node 3 detects leader failure and initiates an election; the highest-ID active node (5) becomes the new leader.",
      mermaid: `sequenceDiagram
    participant N1 as Node 1
    participant N3 as Node 3
    participant N4 as Node 4
    participant N5 as Node 5
    Note over N3: Detects leader timeout
    N3->>N4: ELECTION
    N3->>N5: ELECTION
    N4->>N5: ELECTION
    N5-->>N3: ALIVE
    N5-->>N4: ALIVE
    Note over N5: Highest ID, no higher nodes
    N5->>N1: COORDINATOR(5)
    N5->>N3: COORDINATOR(5)
    N5->>N4: COORDINATOR(5)
    Note over N1,N5: Node 5 is the new leader`,
    },
    {
      title: "ZooKeeper Leader Election with Watch Chain",
      kind: "flow",
      caption: "Candidates create sequential ephemeral znodes and watch the predecessor znode to avoid the herd effect.",
      mermaid: `flowchart TD
    A[Candidate joins] --> B[Create ephemeral sequential znode\n/election/candidate-0000N]
    B --> C{Lowest sequence\nnumber?}
    C -->|Yes| D[Become Leader]
    C -->|No| E[Set watch on\nnext-lower znode]
    E --> F{Watched znode\ndeleted?}
    F -->|Yes| C
    F -->|No| G[Wait for watch\nnotification]
    G --> F
    D --> H[Hold leadership\nuntil session ends]
    H --> I[Session expires:\nznode auto-deleted]
    I --> F`,
    },
    {
      title: "Fencing Token Preventing Stale Leader Writes",
      kind: "sequence",
      caption: "Leader A pauses, Leader B is elected with a higher token, and storage rejects Leader A's stale write.",
      mermaid: `sequenceDiagram
    participant LA as Leader A
    participant LS as Lock Service
    participant LB as Leader B
    participant S as Storage
    LA->>LS: Acquire lease
    LS-->>LA: Token = 33
    LA->>S: Write(token=33, data)
    S-->>LA: OK
    Note over LA: GC pause begins
    Note over LS: Lease expires
    LB->>LS: Acquire lease
    LS-->>LB: Token = 34
    LB->>S: Write(token=34, data)
    S-->>LB: OK (highest=34)
    Note over LA: GC pause ends
    LA->>S: Write(token=33, data)
    S-->>LA: REJECTED (33 < 34)`,
    },
  ],
  animations: [
    {
      title: "A stale leader and the fence that stops it",
      steps: [
        {
          label: "Node A holds the lease",
          detail: "It is the leader and may write to shared storage.",
        },
        {
          label: "A pauses",
          detail: "A long GC pause or a network partition. A doesn't know anything is wrong.",
        },
        {
          label: "Lease expires",
          detail: "The cluster elects Node B as leader.",
        },
        {
          label: "A wakes up",
          detail: "Still believing it is leader, A issues a write.",
        },
        {
          label: "Without fencing",
          detail: "Storage accepts both writes. Two leaders have corrupted state — split brain.",
        },
        {
          label: "With fencing tokens",
          detail: "Each leadership term has an increasing token. Storage rejects A's write because it carries an older token than B's.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Algorithm", "Message Complexity", "Partition Tolerance", "Implementation Complexity", "Use Case"],
    rows: [
      ["**Bully Algorithm**", "*O(n^2)* worst case", "None -- **split-brain** risk", "Low", "Academic / simple systems"],
      ["**Ring Algorithm**", "*O(n)* messages", "None -- requires intact ring", "Medium", "Academic / structured topologies"],
      ["**ZooKeeper (ZAB)**", "*O(n)* via watches", "**Quorum-based** -- partition safe", "High (external dependency)", "Production: Kafka, HBase, Hadoop"],
      ["**etcd (Raft)**", "*O(n)* vote requests", "**Majority quorum** -- partition safe", "High (external dependency)", "Production: Kubernetes, CockroachDB"],
      ["**Raft (embedded)**", "*O(n)* per election", "**Majority quorum** -- partition safe", "Medium-High", "Embedded consensus: etcd, Consul"],
    ],
  },
  exercises: [
    "Implement the **bully algorithm** in C++ with a simulated network layer using `std::thread` for each node. Introduce *random failures* and verify that the highest alive node always becomes leader.",
    "Extend the **fencing token** example to handle *concurrent writes* from multiple stale leaders. Add a `std::shared_mutex` for reader-writer locking and verify that only the latest leader's writes succeed.",
    "Simulate a **ZooKeeper-style** watch chain in C++ using a `std::map<int, std::function<void()>>` to register watches on predecessor znodes. Test that deleting a znode triggers *only* the next candidate's callback.",
    "Implement a **ring election algorithm** where nodes are `std::thread` instances communicating via `std::queue`. Simulate a node failure mid-election and verify the algorithm still elects the correct leader after ring repair.",
    "Build a **lease-based** leader election system where the leader must renew its lease every *N milliseconds*. Use `std::chrono` for timing and demonstrate what happens when the leader's renewal is delayed beyond the lease TTL.",
  ],
  cheatSheet: [
    "**Bully algorithm**: highest-ID wins; `ELECTION` to higher nodes, `COORDINATOR` to all if no response -- *O(n^2)* messages worst case",
    "**ZooKeeper election**: ephemeral sequential znodes + watch-predecessor pattern -- avoids *herd effect*, automatic cleanup on session death",
    "**Fencing tokens**: monotonically increasing epoch attached to every write; storage **rejects** `token < highestSeen` -- prevents stale leader corruption",
    "**Raft election**: follower times out -> becomes *candidate* -> requests votes -> wins with **majority** -> leader sends heartbeats to prevent new elections",
    "**Split-brain prevention**: requires **majority quorum** (n/2 + 1) -- any two quorums overlap by at least one node, preventing dual leaders",
    "**Lease-based election**: leader holds a TTL lease; must renew before expiry. If leader crashes, lease expires and new election starts -- used in *etcd* and *Chubby*",
  ],
  revisionNotes: [
    "Leader election is fundamentally a **consensus problem** -- nodes must agree on *exactly one leader*. The bully algorithm does not solve consensus; it assumes reliable failure detection.",
    "**Ephemeral znodes** are the key primitive in ZooKeeper elections: they are *automatically deleted* when the creating session ends, ensuring dead leaders are detected without explicit health checks.",
    "**Fencing tokens** are necessary even with perfect election mechanisms because *process pauses* (GC, page faults, scheduling delays) can cause a leader to act after its lease has expired.",
    "**Raft's election restriction**: a candidate can only win if its log is *at least as up-to-date* as the majority -- this ensures the elected leader has all committed entries.",
    "The **herd effect** in ZooKeeper is avoided by having each candidate watch only the *next-lower* sequential znode, reducing notifications from `O(n)` to `O(1)` per failure event.",
  ],
  resources: [
    {
      label: "In Search of an Understandable Consensus Algorithm (Raft) — Ongaro & Ousterhout",
      kind: "paper",
    },
    {
      label: "The Chubby Lock Service — Mike Burrows, Google, 2006",
      kind: "paper",
    },
  ],
  glossary: [
    {
      term: "Leader Election",
      definition:
        "The process of selecting a single node as the coordinator in a distributed system, ensuring exactly one leader exists at any time.",
    },
    {
      term: "Split-Brain",
      definition:
        "A failure mode where a network partition causes multiple nodes to act as leaders simultaneously, leading to conflicting operations.",
    },
    {
      term: "Bully Algorithm",
      definition:
        "A leader election protocol where the highest-ID active node always becomes leader, using ELECTION and COORDINATOR messages.",
    },
    {
      term: "Fencing Token",
      definition:
        "A monotonically increasing number issued with each leadership grant, used by storage systems to reject operations from stale leaders.",
    },
    {
      term: "Ephemeral Znode",
      definition:
        "A ZooKeeper node that is automatically deleted when the creating client's session ends, used for leader detection and liveness tracking.",
    },
    {
      term: "Lease",
      definition:
        "A time-limited grant that must be periodically renewed. In leader election, the leader holds a lease; if it expires, a new leader can be elected.",
    },
    {
      term: "Herd Effect",
      definition:
        "A performance problem where many nodes react simultaneously to a single event, causing a spike of competing requests.",
    },
    {
      term: "Ring Algorithm",
      definition:
        "A leader election protocol where nodes pass election messages around a logical ring, selecting the leader based on the highest ID or other criteria. Uses O(n) messages.",
    },
    {
      term: "Election Timeout",
      definition:
        "The duration a Raft follower waits without hearing from the leader before starting a new election. Randomized to reduce split votes.",
    },
  ],
};
