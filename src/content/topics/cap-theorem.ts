import type { TopicContent } from "../types";

export const capTheorem: TopicContent = {
  quickSummary: [
    "The CAP theorem states that a distributed data store can provide at most two of three guarantees simultaneously: Consistency (every read gets the most recent write), Availability (every request gets a non-error response), and Partition tolerance (the system works despite network splits).",
    "Since network partitions are unavoidable in distributed systems, the real choice is between CP (consistent but may be unavailable during partitions) and AP (available but may serve stale data during partitions).",
    "In practice, CAP is a spectrum, not a binary choice — systems make nuanced trade-offs between consistency and availability, often configurable per operation.",
  ],
  detailed: [
    "The CAP theorem was conjectured by Eric Brewer in 2000 and formally proved by Seth Gilbert and Nancy Lynch in 2002. It applies to any distributed system that stores state across multiple nodes connected by a network. The theorem says: when a network partition occurs (messages between nodes are lost or delayed), the system must choose between consistency and availability.",
    "Consistency (C) means linearizability: every read reflects the most recent write, as if there's a single copy of the data. If node A accepts a write, node B must see it immediately — or refuse to answer. This is different from ACID consistency, which is about data integrity constraints within a database.",
    "Availability (A) means every request to a non-failed node receives a response. The response doesn't have to contain the most recent write — it just has to be a valid, non-error response within a reasonable time. A system that returns an error or times out during a partition is not available in the CAP sense.",
    "Partition Tolerance (P) means the system continues to operate despite arbitrary message loss between nodes. In any real distributed system, network partitions happen (switches fail, cables are cut, cloud regions lose connectivity). You can't choose 'not P' — you're always choosing between CP and AP when a partition occurs.",
    "CP systems (e.g., HBase, MongoDB with majority reads, etcd, ZooKeeper) refuse to serve reads or writes when they can't confirm consistency — they sacrifice availability during a partition. AP systems (e.g., Cassandra, DynamoDB, CouchDB) continue serving requests during partitions but may return stale data — they sacrifice consistency temporarily.",
  ],
  deepDive: [
    "Brewer himself later clarified that CAP is misleading as a simple 'pick 2' framework. In practice: (1) Partitions are rare, so during normal operation you can have both C and A. (2) When a partition occurs, the choice between C and A can be made per-operation, not system-wide. (3) After the partition heals, you can detect and repair inconsistencies. This led to the PACELC theorem: during Partition, choose A or C; Else (normal operation), choose Latency or Consistency.",
    "Many modern databases offer tunable consistency. Cassandra lets you choose consistency level per query: ONE (fast, may be stale), QUORUM (majority agree, strong for most cases), ALL (every replica, slowest). DynamoDB offers eventually consistent reads (fast) and strongly consistent reads (slower, higher cost). This turns the binary CAP choice into a spectrum.",
    "The CAP theorem only applies to the data plane (reads and writes), not the control plane (cluster membership, leader election). A system can use strong consistency for metadata (who owns what partition) while using eventual consistency for user data — this is exactly what Kafka does with ZooKeeper/KRaft for metadata and configurable acks for data.",
    "Real-world partition scenarios: a network switch fails, splitting a cluster in two. A cloud availability zone becomes unreachable. An undersea cable is severed, splitting intercontinental replication. In each case, nodes on both sides of the partition must decide: reject requests (CP) or serve potentially stale data (AP). The right choice depends on the domain — a banking system prefers CP (wrong balance = bad); a social media feed prefers AP (slightly stale timeline = acceptable).",
  ],
  code: [
    {
      language: "python",
      caption: "Simulating CP vs AP behavior during a network partition",
      source: `# CP System: Refuses to serve reads when partition is detected
class CPStore:
    def __init__(self):
        self.data = {}
        self.can_reach_replicas = True

    def write(self, key, value):
        if not self.can_reach_replicas:
            raise Exception("Write rejected: cannot confirm replication (CP)")
        self.data[key] = value
        # In reality: replicate to majority before acknowledging

    def read(self, key):
        if not self.can_reach_replicas:
            raise Exception("Read rejected: cannot confirm consistency (CP)")
        return self.data.get(key)


# AP System: Always serves requests, may return stale data
class APStore:
    def __init__(self):
        self.data = {}
        self.pending_sync = []

    def write(self, key, value):
        self.data[key] = value
        self.pending_sync.append((key, value))
        # Accept write locally, sync later when partition heals

    def read(self, key):
        # Always returns a response, even if it might be stale
        return self.data.get(key, None)

    def heal_partition(self, remote_store):
        # Conflict resolution after partition heals
        for key, value in self.pending_sync:
            # Last-writer-wins, vector clocks, or app-specific merge
            remote_store.data[key] = value
        self.pending_sync.clear()`,
    },
    {
      language: "bash",
      caption: "Cassandra: Tunable consistency per query",
      source: `# Write with QUORUM consistency (majority of replicas must acknowledge)
cqlsh> CONSISTENCY QUORUM;
cqlsh> INSERT INTO users (id, name) VALUES (1, 'Alice');
# Blocks until majority of replicas confirm the write

# Read with ONE consistency (fastest, potentially stale)
cqlsh> CONSISTENCY ONE;
cqlsh> SELECT * FROM users WHERE id = 1;
# Returns immediately from any single replica

# Read with ALL consistency (strongest, slowest)
cqlsh> CONSISTENCY ALL;
cqlsh> SELECT * FROM users WHERE id = 1;
# Waits for ALL replicas to respond — fails if any replica is down`,
    },
  ],
  diagrams: [
    {
      title: "CAP theorem Venn diagram",
      kind: "architecture",
      caption: "Three overlapping circles (C, A, P) with real systems placed in CP (HBase, etcd), AP (Cassandra, DynamoDB), and CA (single-node RDBMS — not distributed, so P isn't applicable).",
    },
    {
      title: "Network partition scenario",
      kind: "network",
      caption: "A cluster of 5 nodes split into groups of 3 and 2 by a network failure. CP: only the majority group serves requests. AP: both groups serve requests independently.",
    },
  ],
  animations: [
    {
      title: "What happens during a network partition",
      steps: [
        { label: "Normal operation", detail: "All nodes are connected. Reads and writes are consistent and available. No trade-off needed." },
        { label: "Partition occurs", detail: "Network failure splits the cluster into two groups that cannot communicate." },
        { label: "CP choice", detail: "The minority partition stops accepting reads/writes. Only the majority partition serves requests, ensuring consistency but reducing availability." },
        { label: "AP choice", detail: "Both partitions continue serving requests independently. Data diverges between the two sides — availability is maintained but consistency is lost." },
        { label: "Partition heals", detail: "Network connectivity is restored. The system must reconcile divergent data (last-writer-wins, vector clocks, or merge functions)." },
        { label: "Recovery", detail: "After reconciliation, the system returns to normal operation with both consistency and availability." },
      ],
    },
  ],
  comparison: {
    columns: ["System", "CAP Trade-off", "Partition Behavior", "Consistency Model"],
    rows: [
      ["PostgreSQL (single node)", "CA (no distribution)", "N/A — single node", "Strong (ACID)"],
      ["etcd / ZooKeeper", "CP", "Minority stops serving", "Linearizable"],
      ["HBase", "CP", "Region unavailable if master lost", "Strong per-region"],
      ["Cassandra", "AP (tunable)", "All nodes serve, may be stale", "Tunable (ONE to ALL)"],
      ["DynamoDB", "AP (tunable)", "Continues serving", "Eventually consistent or strong"],
      ["CouchDB", "AP", "Continues, merge on reconnect", "Eventually consistent"],
      ["MongoDB", "CP (default)", "Primary elections block writes", "Strong with majority reads"],
    ],
  },
  interviewQA: [
    {
      q: "Explain the CAP theorem. Can you have all three?",
      a: "The CAP theorem states that during a network partition, a distributed system must choose between consistency (every read sees the latest write) and availability (every request gets a response). You can't have all three simultaneously because: if nodes can't communicate (partition), they must either refuse to answer (sacrificing availability to maintain consistency) or answer with potentially stale data (sacrificing consistency to maintain availability). During normal operation (no partition), you can have both C and A. Since partitions are inevitable in distributed systems, the practical question is: do you prefer CP or AP when things go wrong?",
      followUps: [
        "What's the difference between CAP consistency and ACID consistency? (CAP consistency = linearizability across distributed nodes. ACID consistency = data integrity constraints within a transaction.)",
        "What is the PACELC theorem? (Extends CAP: during Partition choose A or C; Else (normal operation) choose Latency or Consistency. Addresses the trade-off even when there's no partition.)",
        "Can you be both CP and AP? (Not during a partition. But you can be CP for some operations and AP for others, or switch between them dynamically.)",
      ],
    },
    {
      q: "Is a single-node database CA?",
      a: "Technically yes — a single-node database provides consistency and availability because there's no network partition possible (only one node). But this is a degenerate case: the system isn't distributed, so CAP doesn't meaningfully apply. The moment you add a second node, you must handle the possibility of partitions.",
    },
  ],
  followUps: [
    "What is the PACELC theorem and how does it extend CAP?",
    "How does Cassandra's tunable consistency let you choose between C and A per query?",
    "What conflict resolution strategies exist for AP systems after partition healing?",
    "How do consensus protocols (Raft, Paxos) relate to CP systems?",
    "What is the difference between strong consistency, eventual consistency, and causal consistency?",
  ],
  mcqs: [
    {
      q: "During a network partition, a CP system will:",
      options: [
        "Continue serving all requests normally",
        "Serve requests but return potentially stale data",
        "Reject or delay requests to maintain consistency",
        "Automatically resolve the partition",
      ],
      answerIndex: 2,
      explanation: "A CP system prioritizes consistency during a partition. It will refuse to serve reads/writes (or only serve from the majority partition) rather than risk returning inconsistent data.",
    },
    {
      q: "Which of these is an AP (Available + Partition-tolerant) system?",
      options: ["etcd", "ZooKeeper", "Cassandra with CONSISTENCY ONE", "HBase"],
      answerIndex: 2,
      explanation: "Cassandra with low consistency levels (ONE) prioritizes availability — it will serve requests from any single replica even during partitions, accepting possible staleness.",
    },
    {
      q: "Why is 'pick two of three' misleading for the CAP theorem?",
      options: [
        "Because the theorem is mathematically incorrect",
        "Because partitions are inevitable, so the real choice is CP vs AP during partitions",
        "Because modern databases don't have consistency guarantees",
        "Because availability is always more important than consistency",
      ],
      answerIndex: 1,
      explanation: "Network partitions are unavoidable in distributed systems. During normal operation you can have all three. The real decision is: when a partition occurs, do you sacrifice consistency or availability?",
    },
  ],
  exercises: [
    "You're designing a banking system that must never show incorrect balances. Would you choose CP or AP? What happens to ATM withdrawals during a network partition?",
    "You're designing a social media timeline that should always be available. Would you choose CP or AP? What's the worst case during a partition?",
    "Set up a 3-node Cassandra cluster and experiment with CONSISTENCY ONE, QUORUM, and ALL. Take one node down and observe which consistency levels still work.",
    "Design a conflict resolution strategy for an AP shopping cart when two partitions both modify the same cart independently.",
  ],
  flashcards: [
    { front: "CAP Theorem", back: "A distributed system can provide at most 2 of 3: Consistency, Availability, Partition tolerance. Since P is unavoidable, the real choice is C vs A during partitions." },
    { front: "CAP Consistency", back: "Every read receives the most recent write (linearizability). Different from ACID consistency (data integrity constraints)." },
    { front: "CAP Availability", back: "Every request to a non-failed node receives a non-error response. Doesn't guarantee the response is the latest." },
    { front: "CP example systems", back: "etcd, ZooKeeper, HBase, MongoDB (default). They refuse requests during partitions to maintain consistency." },
    { front: "AP example systems", back: "Cassandra, DynamoDB, CouchDB. They continue serving during partitions, potentially returning stale data." },
    { front: "PACELC", back: "During Partition: choose A or C. Else (normal operation): choose Latency or Consistency. Extends CAP to non-partition scenarios." },
  ],
  revisionNotes: [
    "CAP: during a network partition, choose Consistency or Availability. Can't have both.",
    "Partitions are inevitable → CP vs AP is the real decision.",
    "CP: refuses requests during partition (etcd, ZooKeeper). AP: serves stale data (Cassandra, DynamoDB).",
    "During normal operation (no partition), you can have both C and A.",
    "PACELC extends CAP: even without partitions, there's a latency vs consistency trade-off.",
    "Tunable consistency (Cassandra, DynamoDB) makes the trade-off per-query, not system-wide.",
  ],
  cheatSheet: [
    "C = linearizability (latest write visible to all reads)",
    "A = every non-failed node responds (not necessarily latest data)",
    "P = system works despite message loss between nodes",
    "CP systems: etcd, ZooKeeper, HBase | AP systems: Cassandra, DynamoDB, CouchDB",
    "PACELC: P→A/C, else L/C (latency vs consistency in normal operation)",
    "Tunable consistency: Cassandra CONSISTENCY ONE/QUORUM/ALL per query",
  ],
  resources: [
    { label: "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services", kind: "paper", note: "The original 2002 proof by Gilbert and Lynch." },
    { label: "CAP Twelve Years Later: How the 'Rules' Have Changed (Brewer, 2012)", kind: "paper", note: "Brewer's own clarification of how CAP should be applied." },
    { label: "Designing Data-Intensive Applications, Ch. 9", kind: "book", note: "Martin Kleppmann's thorough treatment of consistency and consensus." },
    { label: "Jepsen.io", kind: "repo", note: "Kyle Kingsbury's distributed systems correctness testing — tests real databases against their consistency claims." },
  ],
  glossary: [
    { term: "Linearizability", definition: "The strongest consistency model: all operations appear to execute atomically in some total order consistent with real time." },
    { term: "Eventual consistency", definition: "If no new updates are made, all replicas will eventually converge to the same value." },
    { term: "Network partition", definition: "A failure where some nodes in a distributed system cannot communicate with others." },
    { term: "Quorum", definition: "A majority of replicas (e.g., 3 of 5) that must agree for an operation to succeed in a CP or tunable-consistency system." },
    { term: "Split-brain", definition: "A partition where both sides believe they are the primary, potentially causing divergent writes." },
  ],
};
