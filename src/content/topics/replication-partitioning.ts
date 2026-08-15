import type { TopicContent } from "../types";

export const replicationPartitioning: TopicContent = {
  quickSummary: [
    "Replication copies data across multiple nodes for fault tolerance and read scalability; partitioning splits data across nodes for write scalability and large dataset handling.",
    "Replication models: leader-follower (one writer), multi-leader (multiple writers), and leaderless (quorum-based reads/writes).",
    "Partitioning strategies: range-based (good for scans, risk of hotspots), hash-based (even distribution, poor range queries), and composite approaches.",
  ],
  detailed: [
    "Leader-follower (master-replica) replication has one node accept writes and replicate changes to followers via a replication log. Followers serve read queries, scaling read throughput horizontally. Synchronous replication guarantees followers are up-to-date but adds latency; asynchronous replication is faster but followers may lag. On leader failure, a follower is promoted (failover), which can cause data loss if the follower was behind.",
    "Multi-leader replication allows writes at multiple nodes, useful for multi-datacenter setups where each datacenter has a local leader. The challenge is write conflicts: two leaders may modify the same row simultaneously. Conflict resolution strategies include last-writer-wins (LWW, risks data loss), merge functions, and CRDTs (Conflict-free Replicated Data Types). Multi-leader adds significant complexity and is avoided when possible.",
    "Leaderless replication (used by Dynamo, Cassandra, Riak) sends reads and writes to multiple nodes simultaneously. A write succeeds if W nodes acknowledge; a read succeeds if R nodes respond. If W + R > N (total replicas), at least one read node has the latest write (quorum). Read repair and anti-entropy processes fix stale replicas. This model offers high availability but weaker consistency guarantees.",
    "Partitioning (sharding) distributes rows across nodes by a partition key. Range partitioning sorts data into contiguous ranges (good for range queries, but hotspots on popular ranges). Hash partitioning distributes data by hashing the key (even distribution, but range queries must hit all partitions). Consistent hashing minimizes data movement during rebalancing by mapping both nodes and keys to a ring.",
  ],
  deepDive: [
    "Replication lag causes read-your-writes inconsistency: a user writes to the leader and immediately reads from a lagging follower that hasn't received the write yet. Solutions include reading from the leader for recently-written data, using monotonic reads (always read from the same replica), and causal consistency (tracking which writes a read depends on). These are application-level decisions that depend on the consistency requirements of each feature.",
    "Rebalancing partitions without downtime is operationally challenging. Fixed-partition schemes (e.g., Elasticsearch, Kafka) pre-allocate many more partitions than nodes; moving partitions between nodes is just a metadata change. Dynamic partitioning (e.g., HBase) splits and merges partitions as data grows or shrinks. The danger of hash-mod-N partitioning (key % N) is that adding a node changes N, remapping almost all keys. Consistent hashing and virtual nodes solve this by mapping both keys and nodes to a ring, minimizing remapping to ~1/N of keys on a node change.",
  ],
  code: [
    {
      language: "sql",
      caption: "PostgreSQL declarative partitioning",
      source: `-- Range partitioning by date
CREATE TABLE events (
  id         BIGSERIAL,
  event_time TIMESTAMPTZ NOT NULL,
  payload    JSONB
) PARTITION BY RANGE (event_time);

CREATE TABLE events_2024_q1 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE events_2024_q2 PARTITION OF events
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Hash partitioning by user_id
CREATE TABLE user_data (
  user_id INT NOT NULL,
  data    TEXT
) PARTITION BY HASH (user_id);

CREATE TABLE user_data_p0 PARTITION OF user_data
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE user_data_p1 PARTITION OF user_data
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE user_data_p2 PARTITION OF user_data
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE user_data_p3 PARTITION OF user_data
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);`
    },
    {
      language: "sql",
      caption: "Setting up streaming replication (PostgreSQL)",
      source: `-- On the primary: postgresql.conf
-- wal_level = replica
-- max_wal_senders = 5
-- synchronous_standby_names = 'replica1'

-- On the replica: create base backup and configure
-- pg_basebackup -h primary_host -D /var/lib/postgresql/data -R

-- primary_conninfo in postgresql.auto.conf (created by -R flag):
-- primary_conninfo = 'host=primary_host port=5432 user=replicator'

-- Check replication status on primary
SELECT client_addr, state, sent_lsn, replay_lsn,
       sent_lsn - replay_lsn AS lag_bytes
FROM pg_stat_replication;`
    },
  ],
  diagrams: [
    {
      title: "Primary-Replica Replication",
      kind: "architecture",
      caption: "Primary node handles all writes and replicates changes to replica nodes. Replicas serve read traffic, improving scalability and providing failover capability.",
      mermaid: `graph TD
    Client[Client] -->|Writes| Primary[Primary Node]
    Primary -->|Replicate| R1[Replica 1]
    Primary -->|Replicate| R2[Replica 2]
    Primary -->|Replicate| R3[Replica 3]
    Client -->|Reads| R1
    Client -->|Reads| R2
    Client -->|Reads| R3
    subgraph Failover["Failover"]
      R1 -->|Promote on primary failure| NewPrimary[New Primary]
    end`,
    },
    {
      title: "Horizontal Partitioning - Sharding Strategies",
      kind: "mindmap",
      caption: "Different strategies for partitioning data horizontally across multiple nodes, each with different trade-offs for distribution and query routing.",
      mermaid: `mindmap
  root((Partitioning Strategies))
    Range Partitioning
      Split by key range
      Easy range queries
      Risk of hot spots
    Hash Partitioning
      Hash key to shard
      Even distribution
      Range queries expensive
    Directory Partitioning
      Lookup table maps keys to shards
      Flexible reassignment
      Lookup overhead
    Consistent Hashing
      Nodes on a ring
      Minimal rekey on change
      Used in Cassandra and DynamoDB`,
    },
    {
      title: "Replication Lag and Read-Your-Writes",
      kind: "sequence",
      caption: "Asynchronous replication introduces lag between primary and replica. Read-your-writes consistency ensures a user sees their own updates despite replication lag.",
      mermaid: `sequenceDiagram
    participant User
    participant Primary
    participant Replica

    User->>Primary: Write: update profile
    Primary-->>User: Write confirmed
    Note over Primary,Replica: Async replication lag 100ms
    User->>Replica: Read: get profile
    Replica-->>User: Returns stale data
    Note over User: Read-your-writes fix: route read to Primary
    User->>Primary: Read: get profile
    Primary-->>User: Returns updated data`,
    },
    {
      title: "Multi-Leader Replication Conflict",
      kind: "flow",
      caption: "When multiple leaders accept concurrent writes to the same record, conflicts arise on replication. Conflict resolution strategies include last-write-wins and application-level merge.",
      mermaid: `flowchart TD
    A[Leader 1 accepts write X=1] --> C[Replicate to Leader 2]
    B[Leader 2 accepts write X=2] --> D[Replicate to Leader 1]
    C --> E{Conflict detected - X=1 vs X=2}
    D --> E
    E --> F{Resolution strategy}
    F -->|Last Write Wins| G[Use higher timestamp]
    F -->|Application merge| H[Custom merge logic]
    F -->|Conflict CRDT| I[Merge using CRDT rules]
    G --> J[Converged value]
    H --> J
    I --> J`,
    },
  ],
  animations: [
    {
      title: "Leader failover process",
      steps: [
        { label: "Leader fails", detail: "The leader node becomes unresponsive due to a crash or network issue." },
        { label: "Detection", detail: "Followers or a monitoring system detect the failure via heartbeat timeout." },
        { label: "Election", detail: "A follower with the most up-to-date replication log is chosen as the new leader." },
        { label: "Reconfiguration", detail: "Other followers are redirected to replicate from the new leader; clients are pointed to the new leader." },
        { label: "Catch-up", detail: "The new leader may have been slightly behind; any unreplicated writes from the old leader are lost (if async) or guaranteed present (if sync)." },
      ],
    },
  ],
  comparison: {
    columns: ["Model", "Writers", "Consistency", "Availability", "Complexity", "Example"],
    rows: [
      ["Leader-follower", "Single leader", "Strong (reads from leader)", "Leader is SPOF without failover", "Low", "PostgreSQL streaming, MySQL replication"],
      ["Multi-leader", "Multiple leaders", "Eventual (conflict resolution needed)", "High (each DC has a leader)", "High", "CouchDB, Tungsten Replicator"],
      ["Leaderless", "Any node", "Tunable (quorum W+R>N)", "Highest (no single point)", "Medium-High", "Cassandra, DynamoDB, Riak"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between synchronous and asynchronous replication?",
      a: "Synchronous replication waits for at least one follower to confirm it received and wrote the change before acknowledging the commit to the client. This guarantees the follower is up-to-date but adds latency. Asynchronous replication acknowledges the commit immediately after the leader writes it; followers receive changes later. Async is faster but risks data loss if the leader crashes before followers catch up. Semi-synchronous (one sync follower, rest async) is a common compromise.",
      followUps: ["What is replication lag?", "What is semi-synchronous replication?"],
    },
    {
      q: "How does consistent hashing minimize data movement when adding a node?",
      a: "In consistent hashing, both keys and nodes are mapped to positions on a ring. Each key is assigned to the next node clockwise. When a new node is added, it takes over a portion of the ring from its successor — only the keys between the new node and its predecessor need to move. This is approximately 1/N of all keys (where N is the number of nodes), compared to hash-mod-N where nearly all keys are remapped. Virtual nodes (multiple positions per physical node) improve balance.",
      followUps: ["What are virtual nodes?", "How does DynamoDB handle partitioning?"],
    },
    {
      q: "What is the quorum formula and why does W + R > N guarantee seeing the latest write?",
      a: "In a system with N replicas, if a write is acknowledged by W nodes and a read queries R nodes, then when W + R > N, the read and write sets must overlap — at least one node in the read set has the latest write. For example, with N=3, W=2, R=2: any two write nodes and any two read nodes must share at least one node. However, quorums don't guarantee linearizability — concurrent writes and network delays can still cause anomalies.",
      followUps: ["What happens if W + R <= N?", "What is sloppy quorum?"],
    },
  ],
  followUps: [
    "How do you handle replication lag in application code?",
    "What is the split-brain problem and how is it prevented?",
    "How does sharding affect joins and transactions?",
    "What is the difference between physical and logical replication?",
  ],
  mcqs: [
    {
      q: "In a leaderless system with N=5, W=3, R=3, what is the minimum overlap between write and read sets?",
      options: ["0 nodes", "1 node", "2 nodes", "3 nodes"],
      answerIndex: 1,
      explanation: "W + R = 6 > N = 5, so the overlap is at least W + R - N = 1 node. At least one node in the read set participated in the write.",
    },
    {
      q: "What is the main disadvantage of range partitioning?",
      options: ["Cannot do range queries", "Risk of hotspots on popular ranges", "Requires consistent hashing", "Only works with numeric keys"],
      answerIndex: 1,
      explanation: "Range partitioning keeps related data together (enabling efficient range queries), but popular key ranges create hotspots — one partition gets disproportionate load.",
    },
    {
      q: "What data can be lost during an asynchronous leader failover?",
      options: [
        "All data on the old leader",
        "Writes acknowledged by the leader but not yet replicated to followers",
        "Reads that happened during the failover",
        "Data on the followers",
      ],
      answerIndex: 1,
      explanation: "In async replication, the leader acknowledges writes before followers receive them. If the leader crashes, writes that were acknowledged but not yet replicated are lost.",
    },
  ],
  exercises: [
    "Set up a PostgreSQL primary-replica pair. Insert data on the primary and verify it appears on the replica. Simulate a failover by stopping the primary.",
    "Implement consistent hashing in your preferred language with virtual nodes. Add and remove nodes, measuring data movement.",
    "Design a sharding strategy for a social media application (users, posts, followers). Consider cross-shard queries and transactions.",
    "Compare the latency of synchronous vs asynchronous replication by measuring commit times with different synchronous_commit settings.",
  ],
  flashcards: [
    { front: "What is replication lag?", back: "The delay between a write being applied on the leader and appearing on a follower. Caused by network latency, follower load, or slow replays." },
    { front: "What is a quorum?", back: "In a system with N replicas, a quorum for writes (W) and reads (R) where W + R > N ensures at least one node in any read set has the latest write." },
    { front: "What is consistent hashing?", back: "A partitioning scheme that maps keys and nodes to a ring. Adding or removing a node only remaps ~1/N of keys, minimizing data movement." },
    { front: "What is split-brain?", back: "When a network partition causes two nodes to both believe they are the leader, accepting conflicting writes. Prevented by fencing (STONITH) or quorum-based leader election." },
    { front: "What is read-your-writes consistency?", back: "A guarantee that after a user writes data, subsequent reads by that same user will see the write, even if reads go to replicas." },
  ],
  revisionNotes: [
    "Leader-follower: one writer, many readers. Simple but leader is SPOF.",
    "Multi-leader: multiple writers, conflict resolution needed. Good for multi-DC.",
    "Leaderless: quorum reads/writes (W+R>N). Highest availability.",
    "Sync replication: durable but slow. Async: fast but risk of data loss.",
    "Range partitioning: good for scans, risk of hotspots.",
    "Hash partitioning: even distribution, poor range queries.",
    "Consistent hashing: minimizes data movement on node changes. Use virtual nodes for balance.",
  ],
  cheatSheet: [
    "Leader-follower: writes -> leader, reads -> any node",
    "Quorum: W + R > N guarantees read-write overlap",
    "Sloppy quorum: write to any W available nodes (not necessarily the home nodes)",
    "Range partition: PARTITION BY RANGE (key)",
    "Hash partition: PARTITION BY HASH (key)",
    "Consistent hashing: ring of 2^n positions, virtual nodes for balance",
    "Replication lag = sent_lsn - replay_lsn",
    "Split-brain prevention: fencing (STONITH), quorum, epoch numbers",
  ],
  resources: [
    { label: "Designing Data-Intensive Applications, Ch. 5-6", url: "https://dataintensive.net/", kind: "book", note: "The definitive treatment of replication and partitioning." },
    { label: "Dynamo: Amazon's Highly Available Key-Value Store", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", kind: "paper", note: "Foundational paper on leaderless replication and consistent hashing." },
    { label: "PostgreSQL Documentation — High Availability and Replication", url: "https://www.postgresql.org/docs/current/", kind: "docs", note: "Streaming replication, logical replication, and failover." },
    { label: "Consistent Hashing and Random Trees — Karger et al.", url: "https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf", kind: "paper", note: "The original consistent hashing paper." },
  ],
  glossary: [
    { term: "Replication", definition: "Copying data across multiple nodes so each has a complete copy for fault tolerance and read scalability." },
    { term: "Partitioning (sharding)", definition: "Splitting data across nodes so each holds a subset, enabling horizontal write scaling." },
    { term: "Leader", definition: "The node that accepts writes in leader-follower replication." },
    { term: "Follower (replica)", definition: "A node that receives replicated writes from the leader and serves read queries." },
    { term: "Quorum", definition: "The minimum number of nodes that must participate in a read or write for it to be considered successful." },
    { term: "Consistent hashing", definition: "A ring-based hash scheme where adding/removing nodes remaps only a fraction of keys." },
    { term: "Replication lag", definition: "The delay between a write being applied on the leader and becoming visible on a follower." },
    { term: "Split-brain", definition: "A failure mode where two nodes both act as leader simultaneously, causing conflicting writes." },
  ],
};
