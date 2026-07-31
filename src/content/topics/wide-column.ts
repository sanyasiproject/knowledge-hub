import type { TopicContent } from "../types";

export const wideColumn: TopicContent = {
  quickSummary: [
    "Wide-column stores (Cassandra, HBase, Bigtable) organize data into rows identified by a partition key, with columns grouped into column families — optimized for massive write throughput and horizontal scalability.",
    "Data is sorted within partitions by clustering keys, enabling efficient range scans over time-series, event logs, and IoT data without secondary indexes.",
    "The LSM tree (Log-Structured Merge-tree) storage engine writes sequentially to an in-memory memtable, flushes to immutable SSTables on disk, and merges them through compaction — favoring writes over reads.",
    "Cassandra is a masterless, peer-to-peer system with tunable consistency, while HBase follows a master-based architecture built on top of HDFS with strong consistency guarantees.",
  ],
  detailed: [
    "Wide-column stores descend from Google's Bigtable paper (2006). Data is organized as a sparse, distributed, persistent multi-dimensional sorted map. Each row is identified by a row key, and columns are grouped into column families. Unlike relational tables where every row has the same columns, wide-column rows can have different columns — hence 'wide' and 'sparse.'",
    "In Cassandra, the primary key consists of a partition key and optional clustering columns. The partition key determines which node stores the row (via consistent hashing). Clustering columns define the sort order within a partition. This design makes partition-scoped queries extremely fast — the entire partition is stored contiguously on a single node. Cross-partition queries (scatter-gather) are expensive and should be avoided in production workloads.",
    "The LSM tree is the storage engine behind both Cassandra and HBase. Writes go to an in-memory structure (memtable in Cassandra, MemStore in HBase) and are simultaneously appended to a commit log (write-ahead log) for durability. When the memtable fills, it is flushed to an immutable SSTable (Sorted String Table) on disk. Background compaction merges multiple SSTables, discarding tombstones (deletion markers) and obsolete versions. This design makes writes O(1) amortized — always sequential — at the cost of read amplification.",
    "Compaction strategies significantly impact performance. Size-Tiered Compaction (STCS) groups similarly-sized SSTables and merges them — simple but causes temporary space amplification (needs 2x space during compaction). Leveled Compaction (LCS) organizes SSTables into levels with non-overlapping key ranges, reducing read amplification and space amplification but increasing write amplification. Time-Window Compaction (TWCS) is optimized for time-series data, grouping SSTables by time window and never compacting across windows.",
    "Cassandra's tunable consistency allows per-query trade-offs. Write with consistency level QUORUM (majority of replicas acknowledge) and read with QUORUM to guarantee strong consistency (R + W > N). Use ONE/ONE for maximum throughput with eventual consistency. LOCAL_QUORUM restricts the quorum to the local datacenter, reducing cross-datacenter latency while maintaining consistency within a datacenter.",
    "HBase provides strong consistency by design — a region (partition) is served by exactly one RegionServer at a time. Reads and writes to the same region are linearizable. HBase runs on HDFS, leveraging its replication for durability. The HBase Master handles region assignment and load balancing, while ZooKeeper coordinates master election and configuration.",
    "Data modeling in wide-column stores is query-driven: you design tables around your query patterns, not around entity relationships. This often means denormalizing data across multiple tables, each optimized for a specific access pattern. One-to-many relationships are modeled as wide rows where the 'many' side becomes clustering columns within a partition.",
    "Bloom filters are attached to each SSTable to quickly determine whether a key might exist in that file, avoiding unnecessary disk reads. Combined with key caches (caching partition index entries) and row caches (caching entire partitions), these mechanisms reduce read amplification.",
  ],
  deepDive: [
    "Consistent hashing with virtual nodes (vnodes) distributes partitions across the cluster. Each physical node owns multiple token ranges (default 256 vnodes in Cassandra). When a node joins or leaves, only its adjacent token ranges are affected, minimizing data movement. The Murmur3 partitioner hashes partition keys to 64-bit tokens, distributing data uniformly across the ring.",
    "Cassandra's gossip protocol propagates cluster state (node liveness, token ownership, schema versions) in O(log N) rounds. Every second, each node picks a random peer and exchanges state digests. If digests differ, they exchange full state for the divergent entries. Failure detection uses the Phi Accrual algorithm, which computes a suspicion level based on inter-arrival times of gossip messages rather than a fixed timeout.",
    "Read path in Cassandra: the coordinator identifies replicas for the partition key, sends a read request to enough replicas to satisfy the consistency level, merges responses (including data from memtables, row cache, bloom filters, partition index, compression offsets, and SSTables), and returns the most recent version. Read repair runs in the background: if replicas returned different versions, the coordinator sends the latest version to stale replicas.",
    "Tombstones in LSM trees deserve special attention. A delete in Cassandra writes a tombstone marker, not an actual deletion. Tombstones persist until compaction removes them after gc_grace_seconds (default 10 days). If tombstones accumulate excessively — common with TTL-heavy workloads or frequent deletes — they cause read performance degradation because every read must scan through tombstones. Monitoring tombstone counts per read (via tombstone_warn_threshold) is critical.",
    "HBase's coprocessors are the equivalent of database stored procedures and triggers. Observer coprocessors intercept operations (pre/post get, put, delete) for cross-cutting concerns like access control and secondary indexing. Endpoint coprocessors enable server-side computation, pushing aggregation logic to the RegionServers to avoid transferring large datasets to the client.",
  ],
  code: [
    {
      language: "sql",
      caption: "Cassandra CQL: table design for time-series sensor data",
      source: `-- Partition by sensor_id, cluster by timestamp descending
-- Each partition holds all readings for one sensor
CREATE TABLE sensor_readings (
  sensor_id    UUID,
  reading_time TIMESTAMP,
  temperature  DOUBLE,
  humidity     DOUBLE,
  pressure     DOUBLE,
  location     TEXT,
  PRIMARY KEY (sensor_id, reading_time)
) WITH CLUSTERING ORDER BY (reading_time DESC)
  AND compaction = {
    'class': 'TimeWindowCompactionStrategy',
    'compaction_window_unit': 'DAYS',
    'compaction_window_size': 1
  }
  AND default_time_to_live = 7776000;  -- 90 days TTL

-- Insert a reading
INSERT INTO sensor_readings (sensor_id, reading_time, temperature, humidity, pressure, location)
VALUES (uuid(), toTimestamp(now()), 23.5, 68.2, 1013.25, 'warehouse-A');

-- Query last 24 hours for a specific sensor
SELECT reading_time, temperature, humidity
FROM sensor_readings
WHERE sensor_id = 550e8400-e29b-41d4-a716-446655440000
  AND reading_time >= toTimestamp(now()) - 86400000;

-- Efficient: partition key (sensor_id) + clustering key range scan`
    },
    {
      language: "sql",
      caption: "Cassandra CQL: denormalized tables for different query patterns",
      source: `-- Table 1: Look up orders by customer
CREATE TABLE orders_by_customer (
  customer_id  UUID,
  order_date   TIMESTAMP,
  order_id     UUID,
  total        DECIMAL,
  status       TEXT,
  PRIMARY KEY (customer_id, order_date, order_id)
) WITH CLUSTERING ORDER BY (order_date DESC, order_id ASC);

-- Table 2: Look up orders by status (for fulfillment dashboard)
CREATE TABLE orders_by_status (
  status       TEXT,
  order_date   TIMESTAMP,
  order_id     UUID,
  customer_id  UUID,
  total        DECIMAL,
  PRIMARY KEY (status, order_date, order_id)
) WITH CLUSTERING ORDER BY (order_date DESC, order_id ASC);

-- Application writes to BOTH tables in a logged batch
BEGIN BATCH
  INSERT INTO orders_by_customer (customer_id, order_date, order_id, total, status)
  VALUES (?, ?, ?, ?, ?);
  INSERT INTO orders_by_status (status, order_date, order_id, customer_id, total)
  VALUES (?, ?, ?, ?, ?);
APPLY BATCH;

-- Each query hits exactly one partition — no scatter-gather`
    },
    {
      language: "bash",
      caption: "HBase shell: creating tables and performing operations",
      source: `# Create a table with two column families
hbase shell
create 'users', \
  {NAME => 'profile', VERSIONS => 1, COMPRESSION => 'SNAPPY'}, \
  {NAME => 'activity', VERSIONS => 3, TTL => 7776000, BLOOMFILTER => 'ROW'}

# Put data (row key, column family:qualifier, value)
put 'users', 'user-001', 'profile:name', 'Alice Chen'
put 'users', 'user-001', 'profile:email', 'alice@example.com'
put 'users', 'user-001', 'activity:last_login', '2024-06-15T10:30:00Z'
put 'users', 'user-001', 'activity:page_views', '4271'

# Get entire row
get 'users', 'user-001'

# Get specific column family
get 'users', 'user-001', {COLUMN => 'profile'}

# Scan with filter
scan 'users', {
  COLUMNS => ['profile:name', 'activity:last_login'],
  FILTER => "SingleColumnValueFilter('activity', 'page_views', >, 'binary:1000')",
  LIMIT => 100
}

# Check table regions and splits
status 'detailed'
describe 'users'`
    },
    {
      language: "sql",
      caption: "Cassandra: materialized views and secondary indexes",
      source: `-- Secondary index: use sparingly, only on low-cardinality columns
CREATE INDEX ON sensor_readings (location);

-- Materialized view: server-maintained denormalized table
CREATE MATERIALIZED VIEW readings_by_location AS
  SELECT sensor_id, reading_time, temperature, location
  FROM sensor_readings
  WHERE location IS NOT NULL
    AND sensor_id IS NOT NULL
    AND reading_time IS NOT NULL
  PRIMARY KEY (location, reading_time, sensor_id)
  WITH CLUSTERING ORDER BY (reading_time DESC, sensor_id ASC);

-- Query the materialized view
SELECT sensor_id, reading_time, temperature
FROM readings_by_location
WHERE location = 'warehouse-A'
  AND reading_time >= '2024-06-01';

-- Warning: MVs add write amplification and have consistency caveats.
-- Application-managed denormalized tables (with batches) are often preferred.`
    },
  ],
  diagrams: [
    {
      title: "LSM tree write and compaction flow",
      kind: "flow",
      caption: "Writes go to memtable + commit log. Memtable flushes to immutable SSTable. Background compaction merges SSTables, discarding tombstones.",
    },
    {
      title: "Cassandra consistent hashing ring",
      kind: "architecture",
      caption: "Nodes own token ranges on the ring. Partition keys are hashed to tokens. Replicas are placed on subsequent nodes in the ring.",
    },
    {
      title: "Cassandra read path through storage layers",
      kind: "sequence",
      caption: "Read checks memtable, row cache, bloom filter, partition key cache, compression offset map, then SSTable data on disk.",
    },
    {
      title: "HBase architecture with HDFS",
      kind: "architecture",
      caption: "HBase Master assigns regions to RegionServers. Each RegionServer manages MemStores and HFiles on HDFS. ZooKeeper coordinates master election.",
    },
  ],
  animations: [
    {
      title: "LSM tree compaction lifecycle",
      steps: [
        { label: "Write to memtable", detail: "Incoming writes are inserted into a sorted in-memory structure (red-black tree or skip list). A commit log entry is appended for durability." },
        { label: "Memtable flush", detail: "When the memtable reaches its size threshold, it is written as an immutable SSTable to disk. A new empty memtable takes over." },
        { label: "SSTable accumulation", detail: "Multiple SSTables accumulate on disk. Each is internally sorted, but their key ranges may overlap across files." },
        { label: "Compaction triggered", detail: "When the number or size of SSTables exceeds thresholds, the compaction strategy selects files to merge." },
        { label: "Merge and discard", detail: "Selected SSTables are merge-sorted into a new SSTable. Tombstones past gc_grace_seconds and superseded versions are discarded." },
        { label: "Old SSTables removed", detail: "After the merged SSTable is written and verified, the input SSTables are deleted, freeing disk space." },
      ],
    },
    {
      title: "Cassandra write path with replication",
      steps: [
        { label: "Client sends write", detail: "The driver sends the write to a coordinator node (any node in the cluster)." },
        { label: "Coordinator identifies replicas", detail: "The coordinator hashes the partition key to find the token, then identifies the replica nodes for that token range." },
        { label: "Parallel replica writes", detail: "The coordinator forwards the write to all replica nodes simultaneously." },
        { label: "Replica processing", detail: "Each replica appends to its commit log and inserts into its memtable. The write is acknowledged to the coordinator." },
        { label: "Consistency level met", detail: "Once enough replicas respond (e.g., QUORUM = 2 of 3), the coordinator acknowledges success to the client." },
        { label: "Hints for down replicas", detail: "If a replica is down, the coordinator stores a hint. When the replica recovers, the hint is replayed — this is hinted handoff." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Apache Cassandra", "Apache HBase", "Google Bigtable"],
    rows: [
      ["Architecture", "Masterless peer-to-peer ring", "Master-based (HBase Master + RegionServers)", "Managed service (no visible master)"],
      ["Consistency", "Tunable (ONE to ALL)", "Strong (single region owner)", "Strong (single-row), eventual (cross-row)"],
      ["Storage", "LSM tree with local SSTables", "LSM tree on HDFS (HFiles)", "Proprietary on Colossus (GFS successor)"],
      ["Query language", "CQL (SQL-like)", "Java API + shell commands", "Java/Go/Python client APIs + cbt CLI"],
      ["Compaction", "STCS, LCS, TWCS", "Minor + major compaction", "Managed automatic compaction"],
      ["Use cases", "High-write IoT, time-series, messaging", "Hadoop ecosystem analytics, random R/W", "Large-scale analytics, ML feature stores"],
      ["Transactions", "Lightweight transactions (Paxos)", "Single-row atomic operations", "Single-row atomic read-modify-write"],
      ["Schema flexibility", "Typed columns, schema required", "Dynamic columns within families", "Dynamic columns within families"],
      ["Operational model", "Self-managed or Astra (managed)", "Self-managed on Hadoop cluster", "Fully managed GCP service"],
    ],
  },
  interviewQA: [
    {
      q: "Why are wide-column stores preferred for time-series and IoT workloads?",
      a: "Time-series data is naturally partitioned by entity (sensor, device) and sorted by timestamp — a perfect fit for the partition key + clustering key model. Writes are append-only and sequential (LSM tree optimized). Time-windowed compaction (TWCS) efficiently manages TTL-expired data. Queries are almost always scoped to a single entity and time range, which maps to a single-partition range scan — the fastest possible query pattern.",
      followUps: [
        "What happens when a single partition grows too large? How do you handle it?",
        "How does TWCS differ from STCS for time-series workloads?",
      ],
    },
    {
      q: "Explain the trade-offs between size-tiered, leveled, and time-window compaction in Cassandra.",
      a: "Size-Tiered (STCS) groups similarly-sized SSTables, producing larger ones — simple but doubles disk usage during compaction and suffers read amplification from overlapping key ranges. Leveled (LCS) maintains non-overlapping SSTables in levels, guaranteeing at most one SSTable per key at each level — excellent read performance but high write amplification (each byte is rewritten ~10x). Time-Window (TWCS) groups SSTables by time window, never compacting across windows — ideal for time-series with TTL since entire expired windows are simply dropped.",
    },
    {
      q: "How does Cassandra's consistency model work? What does QUORUM mean?",
      a: "Cassandra offers per-query tunable consistency. With a replication factor of N, a write at consistency level W waits for W replicas to acknowledge. A read at level R contacts R replicas and returns the latest. The pigeonhole principle guarantees that if R + W > N, at least one replica in the read set has the latest write — this is strong consistency. QUORUM = floor(N/2) + 1, so QUORUM reads + QUORUM writes always overlap. Lower levels (ONE, LOCAL_ONE) trade consistency for latency and availability.",
      followUps: [
        "What happens if a read returns inconsistent data from replicas?",
        "Explain the difference between QUORUM and LOCAL_QUORUM in multi-datacenter setups.",
      ],
    },
    {
      q: "What are tombstones in Cassandra and why can they cause problems?",
      a: "Tombstones are markers that indicate a deletion. Because SSTables are immutable, data cannot be removed in place — a tombstone is written instead. During reads, tombstones must be scanned to ensure deleted data is not returned, causing read latency if they accumulate. Tombstones are purged during compaction only after gc_grace_seconds (default 10 days) to ensure all replicas have seen the delete. Workloads with frequent deletes or short TTLs can accumulate millions of tombstones, degrading read performance. Monitoring and tuning gc_grace_seconds, using appropriate compaction strategies, and avoiding anti-patterns like queue-like data models help manage this.",
    },
  ],
  mcqs: [
    {
      q: "In Cassandra, what determines which node stores a particular row?",
      options: [
        "The clustering key",
        "The partition key (hashed via consistent hashing)",
        "The column family name",
        "The datacenter assignment",
      ],
      answerIndex: 1,
      explanation: "The partition key is hashed to a token value, which maps to a position on the consistent hashing ring. The node owning that token range stores the partition.",
    },
    {
      q: "What is the purpose of the commit log in Cassandra's write path?",
      options: [
        "To index data for faster reads",
        "To provide durability — writes are recoverable from the log after a crash",
        "To replicate data to other nodes",
        "To compact SSTables",
      ],
      answerIndex: 1,
      explanation: "The commit log is a write-ahead log. If a node crashes before memtable data is flushed to an SSTable, the commit log is replayed on restart to recover the data.",
    },
    {
      q: "Which compaction strategy is best suited for time-series data with TTLs?",
      options: [
        "Size-Tiered Compaction (STCS)",
        "Leveled Compaction (LCS)",
        "Time-Window Compaction (TWCS)",
        "Universal Compaction",
      ],
      answerIndex: 2,
      explanation: "TWCS groups SSTables by time window. When all data in a window expires (TTL), the entire SSTable is dropped — no merge needed. This avoids the write amplification of compacting expired data.",
    },
    {
      q: "What consistency guarantee do you get with QUORUM reads and QUORUM writes in Cassandra (RF=3)?",
      options: [
        "Eventual consistency only",
        "Strong consistency (linearizable)",
        "Strong consistency (R + W > N guarantees overlap)",
        "No consistency guarantee without ALL",
      ],
      answerIndex: 2,
      explanation: "With RF=3, QUORUM=2. R(2) + W(2) = 4 > 3 = N, so at least one replica in every read set has the latest write. This gives strong consistency without requiring ALL.",
    },
    {
      q: "How does HBase differ from Cassandra in its consistency model?",
      options: [
        "HBase has tunable consistency; Cassandra is always strongly consistent",
        "Both offer only eventual consistency",
        "HBase provides strong consistency (single region owner); Cassandra offers tunable consistency",
        "They have identical consistency models",
      ],
      answerIndex: 2,
      explanation: "HBase assigns each region to exactly one RegionServer, providing strong consistency. Cassandra distributes replicas across peers and lets the client choose the consistency level per query.",
    },
  ],
  flashcards: [
    { front: "What is an SSTable?", back: "Sorted String Table — an immutable, sorted file written when a memtable is flushed to disk. SSTables are the persistent storage units in LSM tree-based engines." },
    { front: "What is the difference between a partition key and a clustering key in Cassandra?", back: "The partition key determines which node stores the data (via hashing). The clustering key determines the sort order of rows within that partition." },
    { front: "What is hinted handoff in Cassandra?", back: "When a replica is temporarily down, the coordinator stores the write as a 'hint.' When the replica recovers, the hint is replayed to bring it up to date." },
    { front: "What is read repair?", back: "During a read, if replicas return different versions, the coordinator sends the latest version to stale replicas in the background, repairing the inconsistency." },
    { front: "What is a bloom filter and why is it used in wide-column stores?", back: "A probabilistic data structure that can definitively say a key is NOT in an SSTable (avoiding a disk read) or that it MIGHT be (requiring a check). False positives are possible but false negatives are not." },
    { front: "What is the purpose of gc_grace_seconds in Cassandra?", back: "The time tombstones are kept before compaction can discard them — ensuring all replicas have seen the delete before the marker is removed. Default is 10 days (864000 seconds)." },
    { front: "What are vnodes (virtual nodes)?", back: "Instead of each physical node owning one token range, it owns many small ranges (default 256). This improves data distribution balance and reduces data movement when nodes join or leave." },
  ],
  revisionNotes: [
    "Wide-column = partition key (data placement) + clustering key (sort order within partition). Design tables around query patterns, not entity relationships.",
    "LSM tree: write to memtable + commit log -> flush to SSTable -> compaction merges SSTables. Writes are always sequential; reads may check multiple SSTables.",
    "Compaction strategies: STCS (simple, space-heavy), LCS (read-optimized, write-heavy), TWCS (time-series, drops expired windows).",
    "Cassandra consistency: R + W > N = strong consistency. QUORUM/QUORUM with RF=3 is the common strong-consistency setup.",
    "Tombstones are the hidden cost of deletes. Monitor tombstone_warn_threshold and use appropriate TTLs and compaction strategies.",
    "HBase = strong consistency on HDFS. Cassandra = tunable consistency, masterless. Bigtable = managed, GCP-native.",
    "Bloom filters, key caches, and row caches mitigate LSM tree read amplification. Tune per workload.",
  ],
  cheatSheet: [
    "CREATE TABLE t (pk_col TYPE, ck_col TYPE, ..., PRIMARY KEY (pk_col, ck_col)) WITH CLUSTERING ORDER BY (ck_col DESC);",
    "INSERT INTO t (col1, col2) VALUES (?, ?) USING TTL 86400;",
    "SELECT * FROM t WHERE pk_col = ? AND ck_col >= ? AND ck_col <= ?;",
    "BEGIN BATCH ... APPLY BATCH; — atomic batch (same partition preferred)",
    "nodetool status — cluster overview",
    "nodetool tablestats keyspace.table — SSTable count, tombstones, bloom filter stats",
    "nodetool compactionstats — active compactions",
    "nodetool repair — anti-entropy repair (run regularly)",
    "TRACING ON; SELECT ... ; — trace query execution path",
    "ALTER TABLE t WITH compaction = {'class': 'LeveledCompactionStrategy'};",
    "hbase> create 'table', {NAME => 'cf', COMPRESSION => 'SNAPPY'}",
    "hbase> put 'table', 'rowkey', 'cf:col', 'value'",
    "hbase> scan 'table', {LIMIT => 10, FILTER => \"...\"}",
  ],
  resources: [
    { label: "Cassandra: The Definitive Guide (O'Reilly)", kind: "book", note: "Comprehensive guide to Cassandra architecture, data modeling, and operations." },
    { label: "DataStax Academy (free courses)", kind: "video", note: "Self-paced courses on Cassandra fundamentals, data modeling, and administration." },
    { label: "Google Bigtable paper (2006)", kind: "paper", note: "The foundational paper that inspired HBase, Cassandra, and the wide-column model." },
    { label: "The Log-Structured Merge-Tree (O'Neil et al., 1996)", kind: "paper", note: "The original LSM tree paper describing the write-optimized storage structure." },
    { label: "Apache Cassandra documentation", kind: "docs", note: "Official reference for CQL, configuration, and operational procedures." },
    { label: "Apache HBase Reference Guide", kind: "docs", note: "Official HBase documentation covering architecture, shell commands, and Java API." },
    { label: "Designing Data-Intensive Applications — Ch. 3", kind: "book", note: "Martin Kleppmann's deep coverage of LSM trees, SSTables, and storage engine internals." },
  ],
  glossary: [
    { term: "SSTable", definition: "Sorted String Table — an immutable, on-disk file containing key-value pairs sorted by key. The basic storage unit in LSM tree engines." },
    { term: "LSM tree", definition: "Log-Structured Merge-tree — a write-optimized storage engine that buffers writes in memory, flushes to immutable sorted files, and merges them via background compaction." },
    { term: "Memtable", definition: "An in-memory sorted data structure (skip list or red-black tree) that accumulates writes before being flushed to an SSTable." },
    { term: "Compaction", definition: "The background process of merging multiple SSTables into fewer, larger ones — removing tombstones, deduplicating keys, and reducing read amplification." },
    { term: "Tombstone", definition: "A marker indicating a deletion. Required because SSTables are immutable — the actual data is removed only during compaction after gc_grace_seconds." },
    { term: "Partition key", definition: "The portion of the primary key that determines data placement via consistent hashing. All rows with the same partition key are stored together on the same node." },
    { term: "Clustering key", definition: "The portion of the primary key that determines the sort order of rows within a partition. Enables efficient range scans." },
    { term: "Column family", definition: "A group of related columns stored together on disk. In Cassandra, a table is a column family. In HBase, a table can have multiple column families with different storage properties." },
    { term: "Consistent hashing", definition: "A hashing scheme where nodes and keys are mapped to positions on a ring. Adding or removing a node affects only adjacent ranges, minimizing data redistribution." },
    { term: "Hinted handoff", definition: "A mechanism where the coordinator stores writes destined for a temporarily unavailable replica and replays them when the replica recovers." },
  ],
  exercises: [
    "Design a Cassandra data model for a **messaging application** where users can view their conversations sorted by last message time, and messages within a conversation sorted by timestamp. Create at least two denormalized tables -- one for the *conversation list* and one for *messages within a conversation*. Write a `BATCH` statement that keeps both in sync. What is the partition key and clustering key for each?",
    "Set up a Cassandra table with **Time-Window Compaction (TWCS)** and a 1-day TTL. Insert 100,000 rows spanning 5 simulated days. Use `nodetool tablestats` to observe SSTable count and tombstone ratio. Wait for compaction and verify that expired time windows are **dropped as whole SSTables** without merge overhead. Compare with the same workload under *Size-Tiered Compaction (STCS)*.",
    "Create a Cassandra table and perform **10,000 deletes** within a single partition. Then read the partition and observe the performance impact of *tombstone accumulation* using `TRACING ON`. How many tombstones are scanned per read? Experiment with lowering `gc_grace_seconds` and triggering compaction with `nodetool compact` -- measure the read latency improvement after tombstones are purged.",
    "Write a benchmarking script that inserts 1 million rows into a Cassandra table at consistency level **ONE**, then at **QUORUM**, then at **ALL** (with `RF=3`). Measure throughput (ops/sec) and p99 latency for each level. Then repeat the same comparison for *reads*. Present a table showing the **consistency vs. performance trade-off** with actual numbers from your cluster.",
    "Model a **multi-tenant IoT sensor platform** in Cassandra. Each tenant has thousands of sensors, each producing a reading every second. Design the partition key to avoid *unbounded partition growth* (hint: use a **time bucket** as part of the partition key, e.g., `sensor_id + day`). Calculate the partition size for a sensor producing 86,400 readings per day with 100 bytes per reading. At what point should you split into smaller time buckets?",
  ],
};
