import type { TopicContent } from "../types";

export const capAndNosql: TopicContent = {
  quickSummary: [
    "The CAP theorem (Brewer's theorem) states that a distributed data store can guarantee at most two of three properties simultaneously: Consistency, Availability, and Partition tolerance.",
    "Since network partitions are inevitable in distributed systems, the real choice is between CP (consistency + partition tolerance, sacrificing availability during partitions) and AP (availability + partition tolerance, sacrificing consistency during partitions).",
    "BASE (Basically Available, Soft state, Eventually consistent) is the alternative to ACID for distributed systems that prioritize availability over immediate consistency.",
    "Choosing the right NoSQL store requires matching the data model (document, wide-column, graph, key-value) and consistency trade-offs to the application's access patterns and tolerance for stale data.",
  ],
  detailed: [
    "Eric Brewer proposed the CAP conjecture at PODC 2000, and Seth Gilbert and Nancy Lynch formally proved it in 2002. The three properties are: Consistency (every read receives the most recent write or an error — linearizability), Availability (every request receives a non-error response, without guarantee that it contains the most recent write), and Partition tolerance (the system continues to operate despite arbitrary message loss or delay between nodes).",
    "Partition tolerance is not optional in real distributed systems — network failures, switch crashes, and datacenter connectivity issues happen. The practical choice is: during a partition, do you refuse some requests to maintain consistency (CP), or do you serve all requests with potentially stale data to maintain availability (AP)? When there is no partition, the system can provide both consistency and availability.",
    "Strong consistency (linearizability) means every operation appears to take effect instantaneously at some point between its invocation and response. All clients see the same state at the same logical time. This is what CP systems like ZooKeeper, etcd, and HBase provide. The cost is latency (consensus protocols require round-trips) and unavailability during partitions.",
    "Eventual consistency means that if no new updates are made, all replicas will eventually converge to the same value. There is no bound on how long 'eventually' takes, though in practice convergence happens within milliseconds to seconds. DynamoDB, Cassandra (at low consistency levels), and CouchDB are eventually consistent by default. Stronger variants include read-your-writes consistency, monotonic reads, and causal consistency.",
    "BASE is the acronym for the consistency model used by AP systems: Basically Available (the system guarantees availability per the CAP definition), Soft state (the state of the system may change over time even without input, due to eventual consistency propagation), Eventually consistent (given sufficient time without updates, all replicas converge). BASE is not a formal theorem but a design philosophy contrasting with ACID.",
    "Tunable consistency, offered by Cassandra and DynamoDB, lets developers choose the consistency level per operation rather than per system. In Cassandra, setting both reads and writes to QUORUM (majority) achieves strong consistency (R + W > N). Setting both to ONE maximizes throughput with eventual consistency. This flexibility allows different parts of an application to make different trade-offs.",
    "The PACELC theorem extends CAP: if there is a Partition, choose between Availability and Consistency; Else (normal operation), choose between Latency and Consistency. This captures the latency cost of consistency even when no partition exists. Systems like Cassandra are PA/EL (available during partitions, low latency normally), while systems like HBase are PC/EC (consistent during partitions and normally, at higher latency).",
    "Choosing a NoSQL store depends on multiple factors: data model fit (documents for hierarchical data, wide-column for time-series, graph for relationship-heavy data, key-value for caching), consistency requirements (financial data needs strong consistency, social feeds tolerate eventual), scale requirements (write-heavy vs. read-heavy, data volume), operational complexity (managed vs. self-hosted), and ecosystem fit (cloud provider, existing infrastructure).",
  ],
  deepDive: [
    "The formal proof of CAP by Gilbert and Lynch models the system as asynchronous message-passing processes. They show that in an asynchronous network where messages can be lost (partition), no algorithm can guarantee both that every read returns the latest write (consistency) and that every non-failing node returns a response (availability). The proof constructs a specific partition scenario where a write reaches one partition and a read arrives at another, and the system must choose: return stale data (violate consistency) or not respond (violate availability).",
    "Consensus protocols (Paxos, Raft, ZAB) are the mechanism by which CP systems maintain consistency. They require a majority of nodes to agree on each operation, guaranteeing consistency at the cost of availability when a majority is unreachable. Raft (used by etcd, CockroachDB, Neo4j) is the most widely understood: a leader accepts writes, replicates them to a majority, then commits. If the leader fails, an election timeout triggers a new leader election among the reachable majority.",
    "CRDTs (Conflict-free Replicated Data Types) offer an alternative to consensus for certain data structures. A CRDT is designed so that concurrent updates at different replicas always converge without coordination. Examples include G-Counters (grow-only counters), PN-Counters (positive-negative counters), OR-Sets (observed-remove sets), and LWW-Registers (last-writer-wins registers). Riak uses CRDTs for its data types. The limitation is that not all application logic can be expressed as a CRDT.",
    "Vector clocks and version vectors track causality in distributed systems. Each node maintains a vector of logical clocks, one per node. When node A sends a message to node B, it includes its vector clock. B merges the vectors (taking the element-wise maximum) and increments its own entry. Concurrent events (where neither vector dominates the other) indicate a conflict requiring resolution. DynamoDB and Riak use variants of this approach. The trade-off is metadata overhead: vector clocks grow with the number of nodes that have written to a key.",
    "The Jepsen testing framework, created by Kyle Kingsbury, is the industry standard for empirically verifying the consistency claims of distributed databases. Jepsen introduces network partitions, process crashes, and clock skew into running clusters, then checks whether the observed history is consistent with the database's claimed consistency model. Jepsen analyses have found consistency bugs in nearly every major distributed database, including MongoDB, Cassandra, CockroachDB, and Redis. These findings have driven significant improvements in the ecosystem.",
  ],
  code: [
    {
      language: "javascript",
      caption: "MongoDB: configuring write concern and read preference for consistency",
      source: `// Strong consistency: majority write concern + primary reads
const client = new MongoClient(uri, {
  writeConcern: { w: 'majority', j: true, wtimeout: 5000 },
  readPreference: 'primary',
  readConcern: { level: 'majority' }
});

// Session with causal consistency
const session = client.startSession({ causalConsistency: true });
try {
  // Write is acknowledged by majority
  await db.collection('accounts').updateOne(
    { _id: accountId },
    { $inc: { balance: -100 } },
    { session }
  );

  // Subsequent read in same session guaranteed to see the write
  // even if routed to a secondary
  const account = await db.collection('accounts').findOne(
    { _id: accountId },
    { session, readPreference: 'secondary' }
  );
  console.log('Balance after debit:', account.balance);
} finally {
  session.endSession();
}

// Eventual consistency: fire-and-forget writes + secondary reads
const fastClient = new MongoClient(uri, {
  writeConcern: { w: 0 },           // no acknowledgment
  readPreference: 'nearest',         // lowest latency
  readConcern: { level: 'local' }    // no majority guarantee
});`
    },
    {
      language: "sql",
      caption: "Cassandra: tunable consistency per query",
      source: `-- Strong consistency: QUORUM reads + QUORUM writes (RF=3)
-- R(2) + W(2) = 4 > 3 = N → overlap guaranteed
CONSISTENCY QUORUM;
INSERT INTO accounts (id, balance) VALUES (uuid(), 1000.00);
SELECT balance FROM accounts WHERE id = ?;

-- Eventual consistency: ONE for maximum throughput
CONSISTENCY ONE;
INSERT INTO events (sensor_id, ts, value) VALUES (?, toTimestamp(now()), 23.5);
SELECT * FROM events WHERE sensor_id = ? AND ts > ?;

-- LOCAL_QUORUM: strong consistency within a datacenter
-- Avoids cross-datacenter latency
CONSISTENCY LOCAL_QUORUM;
INSERT INTO orders (id, status) VALUES (?, 'confirmed');

-- Serial consistency for lightweight transactions (Paxos)
INSERT INTO users (username, email)
VALUES ('alice', 'alice@example.com')
IF NOT EXISTS;
-- Uses SERIAL consistency (linearizable) internally`
    },
    {
      language: "cpp",
      caption: "DynamoDB: strongly consistent vs. eventually consistent reads (AWS SDK for C++)",
      source: `#include <aws/core/Aws.h>
#include <aws/dynamodb/DynamoDBClient.h>
#include <aws/dynamodb/model/GetItemRequest.h>
#include <aws/dynamodb/model/UpdateItemRequest.h>
#include <iostream>

int main() {
    Aws::SDKOptions options;
    Aws::InitAPI(options);
    {
        Aws::DynamoDB::DynamoDBClient client;

        Aws::DynamoDB::Model::AttributeValue keyVal;
        keyVal.SetS("ORD-12345");

        // Eventually consistent read (default) -- may return stale data
        // Lower latency, half the read capacity cost
        Aws::DynamoDB::Model::GetItemRequest ecRead;
        ecRead.SetTableName("Orders");
        ecRead.AddKey("orderId", keyVal);
        ecRead.SetConsistentRead(false);  // default
        auto ecResult = client.GetItem(ecRead);

        // Strongly consistent read -- guaranteed latest data
        // Higher latency, full read capacity cost
        Aws::DynamoDB::Model::GetItemRequest scRead;
        scRead.SetTableName("Orders");
        scRead.AddKey("orderId", keyVal);
        scRead.SetConsistentRead(true);
        auto scResult = client.GetItem(scRead);

        // Conditional write for optimistic concurrency
        // Succeeds only if the version matches (compare-and-swap)
        Aws::DynamoDB::Model::UpdateItemRequest updateReq;
        updateReq.SetTableName("Orders");
        updateReq.AddKey("orderId", keyVal);
        updateReq.SetUpdateExpression(
            "SET #s = :new_status, version = version + :one");
        updateReq.SetConditionExpression("version = :expected_version");
        updateReq.AddExpressionAttributeNames("#s", "status");

        Aws::DynamoDB::Model::AttributeValue statusVal;
        statusVal.SetS("shipped");
        updateReq.AddExpressionAttributeValues(":new_status", statusVal);

        Aws::DynamoDB::Model::AttributeValue versionVal;
        versionVal.SetN("3");
        updateReq.AddExpressionAttributeValues(":expected_version", versionVal);

        Aws::DynamoDB::Model::AttributeValue oneVal;
        oneVal.SetN("1");
        updateReq.AddExpressionAttributeValues(":one", oneVal);

        auto updateResult = client.UpdateItem(updateReq);
        if (!updateResult.IsSuccess()) {
            auto& error = updateResult.GetError();
            if (error.GetErrorType() ==
                Aws::DynamoDB::DynamoDBErrors::CONDITIONAL_CHECK_FAILED) {
                std::cout << "Conflict: order was modified by another process"
                          << std::endl;
            }
        }
    }
    Aws::ShutdownAPI(options);
    return 0;
}`
    },
    {
      language: "cpp",
      caption: "Simulating eventual consistency convergence",
      source: `#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <thread>
#include <mutex>
#include <chrono>
#include <optional>
#include <algorithm>

// Simulates an AP system with eventual consistency.
class EventuallyConsistentStore {
public:
    using Clock = std::chrono::steady_clock;
    using TimePoint = Clock::time_point;
    using Entry = std::pair<std::string, TimePoint>;  // {value, timestamp}
    using Replica = std::unordered_map<std::string, Entry>;

    EventuallyConsistentStore(int numReplicas = 3,
                              int replicationDelayMs = 100)
        : replicas_(numReplicas), delayMs_(replicationDelayMs) {}

    // Write to one replica; propagate asynchronously.
    void write(const std::string& key, const std::string& value,
               int replicaId = 0) {
        auto now = Clock::now();
        replicas_[replicaId][key] = {value, now};

        // Asynchronous replication to other replicas
        for (int i = 0; i < static_cast<int>(replicas_.size()); ++i) {
            if (i != replicaId) {
                std::thread([this, key, value, now, i]() {
                    std::this_thread::sleep_for(
                        std::chrono::milliseconds(delayMs_));
                    replicate(key, value, now, i);
                }).detach();
            }
        }
    }

    // Read from a specific replica (may be stale).
    std::optional<std::string> read(const std::string& key,
                                     int replicaId = 0) const {
        auto it = replicas_[replicaId].find(key);
        if (it == replicas_[replicaId].end()) return std::nullopt;
        return it->second.first;
    }

    // Read from majority -- returns most recent value.
    std::optional<std::string> readQuorum(const std::string& key) const {
        std::vector<Entry> entries;
        for (const auto& replica : replicas_) {
            auto it = replica.find(key);
            if (it != replica.end()) {
                entries.push_back(it->second);
            }
        }
        if (entries.empty()) return std::nullopt;
        auto best = std::max_element(entries.begin(), entries.end(),
            [](const Entry& a, const Entry& b) {
                return a.second < b.second;
            });
        return best->first;
    }

private:
    // Last-writer-wins replication.
    void replicate(const std::string& key, const std::string& value,
                   TimePoint timestamp, int target) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = replicas_[target].find(key);
        if (it == replicas_[target].end() || it->second.second < timestamp) {
            replicas_[target][key] = {value, timestamp};
        }
    }

    std::vector<Replica> replicas_;
    int delayMs_;
    mutable std::mutex mutex_;
};`
    },
  ],
  diagrams: [
    {
      title: "CAP theorem Venn diagram",
      kind: "mindmap",
      caption: "Three properties (C, A, P) with databases positioned: CP (HBase, ZooKeeper, etcd), AP (Cassandra at CL=ONE, CouchDB, DynamoDB default), CA (single-node RDBMS — not distributed).",
    },
    {
      title: "Network partition scenario",
      kind: "network",
      caption: "Two groups of nodes unable to communicate. CP system refuses writes on the minority side. AP system accepts writes on both sides, creating divergent state.",
    },
    {
      title: "Eventual consistency convergence timeline",
      kind: "sequence",
      caption: "Write hits node A, propagates to B after delay, propagates to C after further delay. All replicas converge after replication completes.",
    },
    {
      title: "PACELC decision tree",
      kind: "flow",
      caption: "If partition: choose A or C. Else: choose L or C. Maps systems: Cassandra=PA/EL, HBase=PC/EC, MongoDB=PA/EC (depends on config).",
    },
  ],
  animations: [
    {
      title: "What happens during a network partition",
      steps: [
        { label: "Normal operation", detail: "All nodes communicate freely. Reads and writes are processed with full consistency and availability." },
        { label: "Partition occurs", detail: "A network failure splits the cluster into two groups. Nodes in each group can communicate with each other but not across the partition." },
        { label: "CP system response", detail: "Nodes on the minority side stop accepting writes (or all requests) to prevent inconsistency. The majority side continues operating if it has quorum. Clients on the minority side receive errors." },
        { label: "AP system response", detail: "Both sides continue accepting reads and writes independently. The data diverges — each side may have different values for the same key." },
        { label: "Partition heals", detail: "Network connectivity is restored. CP systems resume normal operation immediately (minority replays the log). AP systems must reconcile divergent writes — using last-writer-wins, vector clocks, CRDTs, or application-level merge logic." },
        { label: "Convergence", detail: "After reconciliation, all nodes agree on the same state. The system returns to providing both consistency and availability until the next partition." },
      ],
    },
    {
      title: "Quorum-based consistency (R + W > N)",
      steps: [
        { label: "Setup", detail: "A cluster of N=3 replicas. Each stores a copy of the data. The client connects through a coordinator." },
        { label: "Write with W=2", detail: "The coordinator sends the write to all 3 replicas. It waits for 2 (W=2) acknowledgments before confirming to the client. The third replica gets it eventually." },
        { label: "Read with R=2", detail: "The coordinator sends a read to all 3 replicas and waits for 2 responses. Since W=2, at least one of the 2 responders has the latest write." },
        { label: "Overlap guarantee", detail: "R(2) + W(2) = 4 > N(3). By the pigeonhole principle, the read set and write set must share at least one replica — guaranteeing the read sees the latest write." },
        { label: "Trade-off: W=1, R=1", detail: "R(1) + W(1) = 2 < N(3). No overlap guarantee. The single replica contacted for a read may not have the latest write — eventual consistency." },
      ],
    },
  ],
  comparison: {
    columns: ["Category", "CP Systems", "AP Systems", "Tunable"],
    rows: [
      ["Examples", "HBase, ZooKeeper, etcd, Spanner", "CouchDB, DynamoDB (default), Riak", "Cassandra, MongoDB, DynamoDB"],
      ["During partition", "Refuse requests on minority side", "Serve all requests, allow divergence", "Configurable per-query"],
      ["Consistency", "Strong (linearizable)", "Eventual", "ONE (eventual) to ALL (strong)"],
      ["Availability", "Reduced during partitions", "Always available", "Trade-off per query"],
      ["Latency (no partition)", "Higher (consensus round-trips)", "Lower (local reads)", "Depends on consistency level"],
      ["Conflict resolution", "Prevented (single writer/leader)", "Required (LWW, CRDTs, app-level)", "Depends on configuration"],
      ["Ideal for", "Financial data, coordination, config", "Social feeds, IoT, content delivery", "Applications with mixed requirements"],
    ],
  },
  interviewQA: [
    {
      q: "Explain the CAP theorem. Is it really about choosing two out of three?",
      a: "The CAP theorem states that a distributed system cannot simultaneously guarantee Consistency (linearizability), Availability (every non-failing node responds), and Partition tolerance (operates despite network failures). The 'pick two' framing is misleading because partition tolerance is not optional — network failures happen. The real choice is: during a partition, do you sacrifice consistency (AP) or availability (CP)? When there is no partition, the system can provide both. Modern systems like Cassandra make this a per-query decision rather than a system-wide one.",
      followUps: [
        "How does the PACELC theorem extend CAP?",
        "Can a single system be both CP and AP for different operations?",
      ],
    },
    {
      q: "What is eventual consistency and when is it acceptable?",
      a: "Eventual consistency guarantees that if no new writes occur, all replicas will eventually converge to the same value. It is acceptable when the application can tolerate briefly stale data: social media feeds (seeing a post a few seconds late is fine), product catalog browsing (a price update can propagate in seconds), analytics dashboards (slight lag is acceptable), DNS (TTL-based caching is eventual by design). It is NOT acceptable for financial transactions (double-spending), inventory management with limited stock (overselling), or any operation where stale reads lead to incorrect, irreversible decisions.",
      followUps: [
        "What are stronger forms of eventual consistency (read-your-writes, monotonic reads)?",
        "How do you test whether a system actually provides the consistency level it claims?",
      ],
    },
    {
      q: "How do you choose between different NoSQL database categories?",
      a: "Match the data model to the access pattern: Key-value stores (Redis, DynamoDB) for simple lookups by key, session storage, and caching — highest throughput, simplest model. Document stores (MongoDB, CouchDB) for hierarchical, schema-flexible data with rich queries — good for content management, user profiles, catalogs. Wide-column stores (Cassandra, HBase) for high-volume time-series, IoT, and event data — write-optimized, partition-oriented queries. Graph databases (Neo4j) for relationship-heavy data with traversal queries — social networks, fraud detection, recommendations. Then layer on consistency requirements, scale needs, and operational preferences.",
    },
    {
      q: "What is the difference between ACID and BASE?",
      a: "ACID (Atomicity, Consistency, Isolation, Durability) is the consistency model for traditional databases: transactions are all-or-nothing, enforce constraints, are isolated from each other, and survive crashes. BASE (Basically Available, Soft state, Eventually consistent) is the model for distributed AP systems: the system is always available, state may change without input (as replicas converge), and given time, all replicas reach the same value. ACID prioritizes correctness; BASE prioritizes availability and performance. They are not mutually exclusive — systems like CockroachDB and Spanner provide ACID guarantees in a distributed setting, at the cost of higher latency.",
      followUps: [
        "Can you have ACID transactions in a distributed NoSQL database?",
        "What is the performance cost of strong consistency in a distributed system?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In the CAP theorem, what does Partition tolerance mean?",
      options: [
        "The system can be partitioned into independent shards",
        "The system continues to operate despite network failures between nodes",
        "The system can tolerate data being split across partitions",
        "The system supports partition keys for efficient queries",
      ],
      answerIndex: 1,
      explanation: "Partition tolerance means the system continues to function even when network messages between nodes are lost or delayed — an inevitable reality in distributed systems.",
    },
    {
      q: "Which of the following is a CP system?",
      options: [
        "CouchDB (multi-master)",
        "Cassandra at consistency level ONE",
        "HBase",
        "DynamoDB with eventually consistent reads",
      ],
      answerIndex: 2,
      explanation: "HBase provides strong consistency by assigning each region to exactly one RegionServer. During a partition, the minority side becomes unavailable rather than serving stale data.",
    },
    {
      q: "What does R + W > N guarantee in a quorum-based system?",
      options: [
        "All replicas have the latest data",
        "At least one node in the read set has the latest write",
        "No network partitions can occur",
        "Writes are durable across all nodes",
      ],
      answerIndex: 1,
      explanation: "When the number of read replicas (R) plus write replicas (W) exceeds the total replicas (N), the read and write sets must overlap by the pigeonhole principle — at least one responder has the latest write.",
    },
    {
      q: "What does the 'S' in BASE stand for?",
      options: [
        "Strong consistency",
        "Soft state",
        "Scalable state",
        "Synchronized state",
      ],
      answerIndex: 1,
      explanation: "Soft state means the system's state may change over time even without new input, as replicas asynchronously converge through eventual consistency propagation.",
    },
    {
      q: "Which consistency model allows different replicas to temporarily return different values for the same key?",
      options: [
        "Linearizability",
        "Serializability",
        "Eventual consistency",
        "Strict consistency",
      ],
      answerIndex: 2,
      explanation: "Eventual consistency allows replicas to be temporarily out of sync. Different replicas may return different values until the system converges, given no new writes.",
    },
    {
      q: "What does the PACELC theorem add to CAP?",
      options: [
        "A fourth property: Durability",
        "The trade-off between Latency and Consistency during normal operation (no partition)",
        "A mechanism for automatic partition recovery",
        "Support for multi-region deployments",
      ],
      answerIndex: 1,
      explanation: "PACELC extends CAP by noting that even when there is no partition (Else), systems must choose between Latency and Consistency. Low-latency systems sacrifice consistency even during normal operation.",
    },
  ],
  flashcards: [
    { front: "State the CAP theorem in one sentence.", back: "A distributed system can provide at most two of three guarantees simultaneously: Consistency (linearizability), Availability (every non-failing node responds), and Partition tolerance (operates despite network failures)." },
    { front: "Why is 'pick two out of three' a misleading description of CAP?", back: "Because partition tolerance is not optional in distributed systems — network failures happen. The real choice is between consistency and availability during a partition." },
    { front: "What does BASE stand for?", back: "Basically Available, Soft state, Eventually consistent — the design philosophy for AP distributed systems, contrasting with ACID." },
    { front: "What is the quorum formula for strong consistency?", back: "R + W > N, where R = read replicas contacted, W = write replicas that must acknowledge, N = total replicas. This guarantees at least one overlapping node has the latest write." },
    { front: "What is the PACELC theorem?", back: "If Partition: choose Availability or Consistency. Else: choose Latency or Consistency. Extends CAP to cover normal-operation trade-offs." },
    { front: "What are CRDTs?", back: "Conflict-free Replicated Data Types — data structures designed so concurrent updates at different replicas always converge without coordination. Examples: G-Counter, OR-Set, LWW-Register." },
    { front: "Name the four NoSQL data model categories.", back: "Key-value (Redis, DynamoDB), Document (MongoDB, CouchDB), Wide-column (Cassandra, HBase), Graph (Neo4j, Neptune)." },
    { front: "What is linearizability?", back: "The strongest single-object consistency model: every operation appears to take effect atomically at some point between its invocation and response. All clients observe operations in the same order." },
  ],
  revisionNotes: [
    "CAP: during a partition, choose Consistency (CP) or Availability (AP). Partitions are inevitable, so CA is only possible in single-node systems.",
    "PACELC extends CAP: even without partitions, there is a Latency vs. Consistency trade-off. Cassandra = PA/EL, HBase = PC/EC.",
    "Quorum: R + W > N guarantees strong consistency. QUORUM/QUORUM with RF=3 is the common configuration.",
    "Eventual consistency: replicas converge given no new writes. Acceptable for social feeds, catalogs, analytics. Not for financial operations.",
    "BASE (Basically Available, Soft state, Eventually consistent) contrasts with ACID. Not mutually exclusive — NewSQL systems provide distributed ACID.",
    "CRDTs enable coordination-free convergence for specific data structures (counters, sets, registers). Limited to operations expressible as commutative, associative merges.",
    "Choosing NoSQL: key-value for lookups/caching, documents for hierarchical data, wide-column for time-series, graph for relationship-heavy traversals.",
  ],
  cheatSheet: [
    "CAP: C = linearizability, A = every non-failing node responds, P = operates despite network failures",
    "CP examples: HBase, ZooKeeper, etcd, Spanner, CockroachDB",
    "AP examples: CouchDB, Cassandra (CL=ONE), DynamoDB (default), Riak",
    "Tunable: Cassandra (CL per query), MongoDB (write concern + read preference), DynamoDB (ConsistentRead)",
    "Quorum formula: R + W > N → strong consistency. RF=3: QUORUM=2, so 2+2=4>3.",
    "BASE: Basically Available, Soft state, Eventually consistent",
    "PACELC: Partition → A or C; Else → L or C",
    "CRDTs: G-Counter (grow-only), PN-Counter, OR-Set, LWW-Register",
    "Vector clocks: detect concurrent writes, grow with writers — metadata overhead trade-off",
    "Jepsen: empirical consistency testing framework — the standard for verifying database claims",
  ],
  resources: [
    { label: "Brewer's CAP conjecture (PODC 2000 keynote)", kind: "paper", note: "The original presentation where Eric Brewer proposed the CAP conjecture." },
    { label: "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (Gilbert & Lynch, 2002)", kind: "paper", note: "The formal proof of the CAP theorem." },
    { label: "Designing Data-Intensive Applications — Ch. 5, 7, 9", kind: "book", note: "Martin Kleppmann's authoritative coverage of replication, consistency, and distributed systems trade-offs." },
    { label: "Please stop calling databases CP or AP (Martin Kleppmann, 2015)", kind: "article", note: "Explains why the CAP labels are often misapplied and how to think about consistency more precisely." },
    { label: "Jepsen: Consistency testing for distributed systems", kind: "repo", note: "Kyle Kingsbury's testing framework and analyses that have found consistency bugs in nearly every major distributed database." },
    { label: "A Critique of the CAP Theorem (Kleppmann, 2015)", kind: "paper", note: "Detailed analysis of CAP's limitations and why PACELC and other models are more useful in practice." },
    { label: "Consistency Models in Distributed Systems (Viotti & Vukolic, 2016)", kind: "paper", note: "Comprehensive survey and taxonomy of consistency models from linearizability to eventual consistency." },
  ],
  glossary: [
    { term: "CAP theorem", definition: "Brewer's theorem: a distributed data store can guarantee at most two of Consistency, Availability, and Partition tolerance simultaneously." },
    { term: "Linearizability", definition: "The strongest single-object consistency model. Every operation appears to execute atomically at a single point in time between invocation and response." },
    { term: "Eventual consistency", definition: "A consistency model where replicas may temporarily diverge but are guaranteed to converge to the same value if no further updates are made." },
    { term: "Partition tolerance", definition: "The system continues to operate correctly despite arbitrary message loss or delay between nodes in the network." },
    { term: "BASE", definition: "Basically Available, Soft state, Eventually consistent — the design philosophy for AP distributed systems, contrasting with ACID." },
    { term: "PACELC", definition: "Extension of CAP: if Partition, choose Availability or Consistency; Else (no partition), choose Latency or Consistency." },
    { term: "Quorum", definition: "A majority-based voting mechanism. In a system with N replicas, a quorum is typically floor(N/2) + 1 nodes." },
    { term: "CRDT", definition: "Conflict-free Replicated Data Type — a data structure that can be independently updated on different replicas and always converges without coordination." },
    { term: "Vector clock", definition: "A mechanism for tracking causality in distributed systems. Each node maintains a vector of logical timestamps, enabling detection of concurrent (conflicting) updates." },
    { term: "Split brain", definition: "A failure mode where a network partition causes two subsets of a cluster to independently believe they are the active cluster, potentially leading to data divergence." },
    { term: "Hinted handoff", definition: "A technique where writes destined for an unavailable replica are temporarily stored on another node and delivered when the target recovers." },
  ],

  exercises: [
    "You are designing a **global e-commerce platform** with users in the US, Europe, and Asia. For the *shopping cart* (must not lose items) and the *product recommendation feed* (can tolerate stale data), choose between a **CP** and **AP** system for each. Justify your choices using the CAP theorem, and explain what happens to each system during a *network partition* between the US and Europe data centers.",
    "Set up a **Cassandra** cluster (or simulate one) with `replication_factor = 3`. Execute the same write and read with consistency levels `ONE`, `QUORUM`, and `ALL`. For each combination, determine: Does `R + W > N` hold? Is the read *guaranteed* to return the latest write? Measure the *latency difference* between `ONE` and `QUORUM`. When would you accept the staleness risk of `CONSISTENCY ONE`?",
    "Implement a simple **eventually consistent key-value store** in C++ with 3 replicas (simulated as `std::unordered_map` instances). Writes go to one replica and propagate asynchronously using `std::thread`. Use **last-writer-wins** with `std::chrono` timestamps for conflict resolution. Demonstrate a scenario where two concurrent writes to the same key produce *different values* on different replicas, then show convergence after replication completes.",
    "A startup asks you to choose a database for their **ride-sharing app**. They need: real-time driver location updates (*high write throughput*), passenger ride history (*read-heavy, eventual consistency OK*), and payment processing (*strong consistency required*). Would you use one database or multiple? Map each requirement to a **NoSQL category** (key-value, document, wide-column, graph) and a specific system. How does the **PACELC theorem** influence your choices?",
    "Explain why a **CRDT-based counter** (G-Counter) converges without coordination, while a naive `counter++` operation on a replicated integer does not. Implement a `GCounter` in C++ where each of 3 nodes maintains a `std::map<nodeId, int>`. Define `increment(nodeId)`, `merge(otherCounter)`, and `value()` methods. Show that *any order* of merge operations produces the same final count."
  ],
};
