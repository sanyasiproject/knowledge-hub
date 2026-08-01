import type { TopicContent } from "../types";

export const gcpData: TopicContent = {
  quickSummary: [
    "BigQuery is Google Cloud's serverless, petabyte-scale data warehouse that uses a columnar storage format and distributed query engine (Dremel) to execute SQL queries across massive datasets in seconds, with separation of storage and compute enabling independent scaling and on-demand or flat-rate pricing.",
    "Cloud Bigtable is a fully managed, wide-column NoSQL database designed for low-latency, high-throughput workloads at petabyte scale, ideal for time-series data, IoT telemetry, financial data, and ML feature stores, with single-digit millisecond latency and HBase API compatibility.",
    "Cloud Spanner is a globally distributed, strongly consistent relational database that combines the scalability of NoSQL with full SQL support, ACID transactions, and automatic horizontal sharding, delivering 99.999% availability with the TrueTime API for external consistency.",
    "Firestore is a serverless, document-oriented NoSQL database with real-time synchronization, offline support, and automatic scaling, serving as the evolution of the original Firebase Realtime Database with richer querying and stronger consistency guarantees.",
    "Cloud SQL is a fully managed relational database service supporting MySQL, PostgreSQL, and SQL Server with automated backups, replication, failover, encryption, and up to 64 TiB storage, suited for traditional OLTP workloads that do not require global distribution.",
  ],
  detailed: [
    "## BigQuery\n\nBigQuery separates storage and compute, allowing each to scale independently. Data is stored in Google's Capacitor columnar format, which provides high compression ratios and efficient column pruning. The Dremel query engine distributes query execution across thousands of workers using a multi-level serving tree. Key features: standard SQL with support for nested/repeated fields (STRUCT and ARRAY), materialized views for pre-computed aggregations, BigQuery ML for training and running ML models directly in SQL (linear regression, logistic regression, K-means, time-series, TensorFlow imports), partitioned tables (by ingestion time, date/timestamp column, or integer range) for pruning scanned data, and clustered tables (sorted by specified columns) for further reducing bytes scanned. Pricing: on-demand charges per TiB scanned ($6.25/TiB), while flat-rate (BigQuery Editions) provides dedicated slot capacity for predictable costs.",
    "## Cloud Bigtable\n\nBigtable is modeled after Google's internal Bigtable paper and stores data in a sorted key-value map indexed by row key, column family, column qualifier, and timestamp. Each row key is lexicographically sorted, making key design critical for performance — poorly designed keys cause hotspotting where a few nodes handle disproportionate traffic. Column families group related columns and are defined at schema creation; column qualifiers (individual columns) are created dynamically. Bigtable scales linearly by adding nodes to a cluster; each node provides approximately 10,000 reads/writes per second. Replication across clusters (up to 4 clusters in different zones or regions) provides high availability and read scaling. Bigtable integrates with Apache HBase API, Hadoop, Dataflow, and Dataproc for batch and stream processing.",
    "## Cloud Spanner\n\nSpanner achieves global strong consistency using TrueTime, a distributed clock system based on GPS receivers and atomic clocks in every Google datacenter. TrueTime provides bounded uncertainty intervals for timestamps, allowing Spanner to order transactions globally without traditional distributed locking. Data is automatically sharded into splits based on primary key ranges and distributed across zones and regions. Spanner supports both Google Standard SQL and PostgreSQL interface. Key features: interleaved tables (parent-child co-location for efficient joins), secondary indexes (global and local), change streams for capturing row-level mutations, and multi-region configurations (regional for 99.99% SLA, multi-region for 99.999% SLA). Spanner is ideal for global financial systems, inventory management, and any workload needing horizontal SQL scaling with strong consistency.",
    "## Firestore\n\nFirestore stores data as documents (JSON-like objects with typed fields) organized into collections. It operates in Native mode (full feature set including real-time listeners, offline support, and composite indexes) or Datastore mode (backward-compatible with the legacy Datastore API, no real-time listeners). Native mode supports real-time synchronization — clients subscribe to document or collection changes and receive instant updates via WebSocket connections. Queries are indexed by default; composite queries require explicitly created composite indexes. Firestore provides strong consistency for all reads (unlike the eventual consistency of legacy Datastore). Transactions support both read-write and read-only modes. Firestore scales automatically with no capacity planning and charges for document reads, writes, deletes, and storage.",
    "## Cloud SQL\n\nCloud SQL manages MySQL (5.6, 5.7, 8.0), PostgreSQL (12-16), and SQL Server (2017, 2019, 2022) instances. Automated features include daily backups with point-in-time recovery (PITR using binary/WAL logs), high availability with regional failover (synchronous replication to a standby in another zone), read replicas (up to 10 per instance, including cross-region), storage auto-resize, and maintenance windows for patches. Cloud SQL Auth Proxy provides secure connectivity without allowlisting IPs by establishing an encrypted tunnel authenticated via IAM. Private IP connectivity through VPC peering keeps traffic off the public internet. Cloud SQL supports up to 96 vCPUs, 624 GiB RAM, and 64 TiB storage per instance. For workloads outgrowing Cloud SQL's limits, AlloyDB (PostgreSQL-compatible) offers higher performance with disaggregated storage and compute.",
    "## Choosing the Right Database\n\nBigQuery is for analytics and OLAP — complex queries over large historical datasets. Cloud SQL is for traditional OLTP with relational schemas and moderate scale. Spanner is for globally distributed OLTP needing strong consistency and horizontal scaling. Bigtable is for high-throughput, low-latency NoSQL workloads with simple key-based access patterns. Firestore is for application backends needing real-time sync, offline support, and serverless scaling. Key decision factors include: consistency requirements (strong vs. eventual), query complexity (SQL vs. key-value), scale (GBs vs. PBs), latency requirements, global distribution needs, and whether the workload is OLTP or OLAP.",
  ],
  interviewQA: [
    {
      q: "How does BigQuery achieve fast query performance over petabytes of data?",
      a: "BigQuery uses several techniques: columnar storage (Capacitor format) means queries only read the columns they reference, dramatically reducing I/O. The Dremel execution engine distributes query processing across thousands of workers in a multi-level serving tree, parallelizing computation. Separation of storage and compute means query slots scale independently. Table partitioning (by date, timestamp, or integer range) prunes entire partitions that do not match the WHERE clause. Clustering sorts data within partitions by specified columns, enabling block-level pruning. Caching returns results of identical queries instantly. Materialized views pre-compute expensive aggregations. Slot-based execution means adding more slots (flat-rate) directly increases parallelism and query speed.",
      followUps: [
        "How do partitioned and clustered tables differ?",
        "What is the difference between on-demand and flat-rate pricing?",
      ],
    },
    {
      q: "Why is row key design critical in Cloud Bigtable, and what are common antipatterns?",
      a: "Bigtable stores rows sorted lexicographically by row key and distributes them across nodes based on key ranges. A poorly designed key causes hotspotting — all reads/writes concentrated on a few nodes. Common antipatterns: monotonically increasing keys (timestamps, sequential IDs) cause all writes to hit the last node in the range. Domain names in natural order (example.com) cluster all subdomains on one node. Recommended patterns: reverse timestamps (MAX_TIMESTAMP - actual) for time-series data spread writes across nodes, reversed domain names (com.example.www) distribute web data, and salted/hashed key prefixes distribute load evenly. Field-promoted keys (moving a high-cardinality field to the key prefix) help distribute specific access patterns.",
      followUps: [
        "How does Bigtable's replication work across clusters?",
        "When would you choose Bigtable over BigQuery for time-series data?",
      ],
    },
    {
      q: "How does Cloud Spanner achieve global strong consistency?",
      a: "Spanner uses TrueTime, a globally distributed clock based on GPS receivers and atomic clocks in every datacenter, providing timestamps with bounded uncertainty intervals. When a transaction commits, Spanner waits out the uncertainty interval (typically a few milliseconds) before making the data visible, guaranteeing that any transaction that starts after the commit sees the committed data — this is called external consistency. Combined with Paxos-based synchronous replication across zones and regions, Spanner ensures that reads always see the latest committed data regardless of which replica serves the read. This eliminates the need for the stale reads and eventual consistency trade-offs that other distributed databases require.",
      followUps: [
        "What is the performance cost of TrueTime's commit wait?",
        "How do interleaved tables improve query performance?",
      ],
    },
    {
      q: "Compare Firestore Native mode and Datastore mode.",
      a: "Native mode is the full-featured Firestore with real-time listeners (clients subscribe to document changes), offline support (local cache with automatic sync), mobile/web SDKs, composite indexes, and strong consistency for all reads. Datastore mode is backward-compatible with the legacy Cloud Datastore API — it supports the Datastore client libraries and data model but does not provide real-time listeners or offline caching. A project can only use one mode and cannot switch after creation. Choose Native mode for new applications, especially mobile/web apps needing real-time sync. Choose Datastore mode for existing Datastore applications or server-side-only workloads that use the Datastore API.",
    },
  ],
  mcqs: [
    {
      q: "Which BigQuery feature allows training ML models directly using SQL?",
      options: [
        "BigQuery BI Engine",
        "BigQuery ML",
        "BigQuery Data Transfer Service",
        "BigQuery Omni",
      ],
      answerIndex: 1,
      explanation:
        "BigQuery ML enables users to create, train, evaluate, and predict with ML models using standard SQL syntax, supporting models like linear regression, logistic regression, K-means clustering, time-series forecasting, and imported TensorFlow models.",
    },
    {
      q: "What technology does Cloud Spanner use to achieve global strong consistency?",
      options: [
        "Vector clocks",
        "Lamport timestamps",
        "TrueTime (GPS + atomic clocks)",
        "Conflict-free replicated data types (CRDTs)",
      ],
      answerIndex: 2,
      explanation:
        "Spanner uses TrueTime, a globally synchronized clock system based on GPS receivers and atomic clocks in every Google datacenter, providing bounded timestamp uncertainty for external consistency.",
    },
    {
      q: "What causes hotspotting in Cloud Bigtable?",
      options: [
        "Too many column families",
        "Monotonically increasing row keys concentrating writes on few nodes",
        "Excessive replication across clusters",
        "Using too many composite indexes",
      ],
      answerIndex: 1,
      explanation:
        "Monotonically increasing keys (like timestamps or sequential IDs) cause all new writes to target the last node in the sorted key range, creating a hotspot. Reversing or salting keys distributes writes across nodes.",
    },
    {
      q: "Which Cloud SQL feature provides secure connectivity without IP allowlisting?",
      options: [
        "VPC peering",
        "Cloud SQL Auth Proxy",
        "Private Service Connect",
        "Cloud Armor",
      ],
      answerIndex: 1,
      explanation:
        "Cloud SQL Auth Proxy creates an encrypted tunnel authenticated via IAM credentials, eliminating the need to manage SSL certificates, allowlist IPs, or configure authorized networks.",
    },
    {
      q: "What is the maximum availability SLA for a multi-region Cloud Spanner instance?",
      options: ["99.9%", "99.95%", "99.99%", "99.999%"],
      answerIndex: 3,
      explanation:
        "Multi-region Cloud Spanner configurations provide a 99.999% (five nines) availability SLA. Regional configurations provide 99.99% (four nines).",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between partitioning and clustering in BigQuery?",
      back: "Partitioning divides a table into segments by a date/timestamp/integer column — queries skip entire partitions. Clustering sorts data within partitions by up to 4 columns — queries skip blocks within partitions. Use both together for maximum query pruning.",
    },
    {
      front: "How does Bigtable scale?",
      back: "Linearly by adding nodes to a cluster. Each node handles approximately 10,000 reads/writes per second. Data is automatically rebalanced across nodes. Up to 4 clusters can be replicated across zones or regions.",
    },
    {
      front: "What is external consistency in Cloud Spanner?",
      back: "A stronger guarantee than serializability: if transaction T1 commits before T2 starts (in real time), T2 is guaranteed to see T1's changes. Achieved via TrueTime's globally synchronized timestamps with bounded uncertainty.",
    },
    {
      front: "What is Firestore's real-time synchronization?",
      back: "Clients subscribe to document or collection snapshots and receive push notifications via WebSocket whenever matching data changes, enabling live-updating UIs without polling.",
    },
    {
      front: "What is AlloyDB?",
      back: "A Google Cloud fully managed PostgreSQL-compatible database with disaggregated compute and storage, offering up to 4x faster transactional performance and 100x faster analytical queries than standard PostgreSQL, for workloads outgrowing Cloud SQL.",
    },
    {
      front: "How does BigQuery pricing work?",
      back: "On-demand: $6.25 per TiB scanned (first 1 TiB/month free). Flat-rate (Editions): purchase dedicated slot capacity (100-slot increments) for predictable costs regardless of bytes scanned.",
    },
    {
      front: "What is an interleaved table in Spanner?",
      back: "A child table whose rows are physically co-located with their parent row based on a shared primary key prefix, enabling efficient joins and range scans across parent-child relationships without cross-node communication.",
    },
    {
      front: "What is Cloud SQL Auth Proxy?",
      back: "A client-side proxy that establishes encrypted, IAM-authenticated connections to Cloud SQL instances, eliminating the need for SSL certificate management, IP allowlisting, or authorized networks configuration.",
    },
  ],
  glossary: [
    {
      term: "Dremel",
      definition:
        "Google's distributed query execution engine underlying BigQuery, which uses a multi-level serving tree to parallelize SQL queries across thousands of workers for fast analytical processing.",
    },
    {
      term: "TrueTime",
      definition:
        "A globally distributed clock system in Google datacenters using GPS receivers and atomic clocks, providing timestamps with bounded uncertainty intervals that enable Spanner's external consistency.",
    },
    {
      term: "Hotspotting",
      definition:
        "A performance problem in Bigtable where poorly designed row keys concentrate reads or writes on a small number of nodes, causing those nodes to become bottlenecks.",
    },
    {
      term: "Column Family",
      definition:
        "In Bigtable, a grouping of related columns defined at schema creation time. Column families share storage and garbage collection settings. Individual columns (qualifiers) within a family are created dynamically.",
    },
    {
      term: "Capacitor",
      definition:
        "Google's proprietary columnar storage format used by BigQuery, providing high compression ratios and efficient column-level access for analytical queries.",
    },
    {
      term: "Change Streams",
      definition:
        "A Spanner feature that captures and streams row-level data changes (inserts, updates, deletes) in near-real-time, enabling change data capture (CDC) pipelines to downstream systems.",
    },
    {
      term: "Point-in-Time Recovery (PITR)",
      definition:
        "A Cloud SQL feature that allows restoring a database to any specific point in time within the backup retention window using binary logs (MySQL) or WAL logs (PostgreSQL).",
    },
    {
      term: "Composite Index",
      definition:
        "In Firestore, an index covering multiple fields that must be explicitly created to support queries filtering or ordering on multiple fields simultaneously.",
    },
  ],
  deepDive: [
    "**BigQuery's Dremel Execution Engine and Slot Scheduling Internals**\n\nAt its core, BigQuery is powered by **Dremel**, a *massively parallel* query execution engine originally described in Google's 2010 research paper. Dremel organizes query execution as a **multi-level serving tree** — a *root server* receives the SQL query, parses and optimizes it, then fans it out to **intermediate servers** (mixers) that further decompose the work into **leaf servers** (slots). Each *leaf slot* reads columnar data from Google's distributed file system (**Colossus**) in the proprietary `Capacitor` format. The key innovation is **in-situ processing** — data is read *directly* from storage without ETL into a separate compute cluster. Slot scheduling uses a **fair-share model**: on-demand queries draw from a shared pool where each project receives a *dynamic allocation* based on current demand, while **BigQuery Editions** (Enterprise, Enterprise Plus) reserve *dedicated slot commitments* (measured in `slot-hours`) for predictable performance. The query optimizer employs **adaptive execution** — it can *repartition data mid-query* if it detects skew, and uses **shuffle persistence** to materialize intermediate results in RAM or on Colossus for multi-stage joins. BigQuery also uses **BI Engine**, an *in-memory analysis service* that caches frequently accessed data in RAM for sub-second query responses on dashboards. Understanding slot utilization via `INFORMATION_SCHEMA.JOBS_BY_PROJECT` and the `slot_ms` metric is critical for **capacity planning** and *cost optimization*.",
    "**Cloud Spanner TrueTime and Split-Based Sharding Deep Mechanics**\n\n*Cloud Spanner's* strongest differentiator is **TrueTime**, a globally distributed clock infrastructure that uses *GPS receivers* and *atomic clocks* co-located in every Google datacenter. TrueTime exposes an API returning a **time interval** `[earliest, latest]` rather than a single timestamp — this *bounded uncertainty* (typically **1-7 milliseconds**) is the foundation of Spanner's **external consistency**. When a transaction commits, Spanner performs a **commit wait**: it delays making the write visible until `TrueTime.now().latest` exceeds the commit timestamp, *guaranteeing* that any subsequent transaction sees the committed data regardless of which replica it reads from. Data is organized into **splits** — contiguous ranges of primary key space — each managed by a **Paxos group** with a *leader replica* and multiple *follower replicas* across zones. The split manager automatically **splits and merges** key ranges based on *size* (each split targets ~8 GiB) and *load* (hot splits are subdivided). **Interleaved tables** physically co-locate child rows *within the same split* as their parent row by sharing a primary key prefix, enabling `JOIN` operations to execute *locally* without cross-split coordination. Spanner's **query optimizer** supports both *hash joins* and *merge joins* across splits, and the **query statistics** tables (`SPANNER_SYS.QUERY_STATS_TOP_*`) provide *detailed execution metrics* for performance tuning. For *multi-region configurations*, Spanner uses **witness replicas** (vote in Paxos but do not serve reads) to achieve quorum without the storage overhead of full replicas.",
    "**Bigtable Compaction, LSM-Tree Storage, and Tablet Management**\n\nCloud Bigtable uses a **Log-Structured Merge-tree** (*LSM-tree*) storage architecture, which is optimized for *write-heavy workloads*. Incoming writes are first recorded in an **in-memory buffer** called a `memtable` (backed by a **write-ahead log** on Colossus for durability). When the memtable reaches a threshold, it is **flushed** to disk as an immutable **SSTable** (*Sorted String Table*) file. Over time, multiple SSTables accumulate, and Bigtable runs **compaction** — a background process that *merges SSTables*, eliminates deleted cells (marked with **tombstones**), and discards expired versions based on *garbage collection policies*. There are two types: **minor compaction** merges a few small SSTables into a larger one, while **major compaction** rewrites *all* SSTables for a tablet into a single file, reclaiming space from deletions. The data is organized into **tablets** — contiguous row-key ranges assigned to individual *tablet servers*. The **tablet server** handles all reads and writes for its assigned tablets. A *metadata table* (`METADATA`) tracks the mapping from row-key ranges to tablets and their locations. When a tablet grows too large (typically beyond **8 GiB**), it is **automatically split** into two tablets and potentially reassigned to different servers for **load balancing**. Bigtable's **replication** works at the cluster level — each cluster maintains its *own set of tablets and SSTables*, with changes propagated via **eventually consistent replication** (or *single-row transactions* for same-cluster writes). Key performance tuning involves monitoring `server latencies`, `disk utilization`, and `hotspot metrics` through the **Key Visualizer** tool, which provides a *heatmap* of access patterns across the row-key space.",
  ],
  code: [
    {
      language: "sql",
      caption: "BigQuery: Create a partitioned and clustered table with expiration",
      source: `-- Create a partitioned + clustered table in BigQuery
CREATE TABLE \`my_project.my_dataset.events\`
(
  event_id STRING NOT NULL,
  user_id STRING,
  event_type STRING,
  event_timestamp TIMESTAMP,
  payload JSON,
  region STRING
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY region, event_type
OPTIONS (
  partition_expiration_days = 365,
  description = "Partitioned by event date, clustered by region and event type"
);

-- Query that benefits from partition pruning and cluster filtering
SELECT event_type, COUNT(*) AS event_count, AVG(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), event_timestamp, HOUR)) AS avg_age_hours
FROM \`my_project.my_dataset.events\`
WHERE DATE(event_timestamp) BETWEEN '2025-01-01' AND '2025-06-30'
  AND region = 'us-east1'
GROUP BY event_type
ORDER BY event_count DESC;`,
    },
    {
      language: "sql",
      caption: "Cloud Spanner: DDL with interleaved tables and secondary index",
      source: `-- Spanner DDL: Parent table
CREATE TABLE Customers (
  CustomerId   INT64 NOT NULL,
  Name         STRING(256),
  Email        STRING(512),
  CreatedAt    TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
) PRIMARY KEY (CustomerId);

-- Interleaved child table (co-located with parent rows)
CREATE TABLE Orders (
  CustomerId   INT64 NOT NULL,
  OrderId      INT64 NOT NULL,
  OrderDate    DATE,
  TotalAmount  NUMERIC,
  Status       STRING(64),
) PRIMARY KEY (CustomerId, OrderId),
  INTERLEAVE IN PARENT Customers ON DELETE CASCADE;

-- Interleaved grandchild table
CREATE TABLE OrderItems (
  CustomerId   INT64 NOT NULL,
  OrderId      INT64 NOT NULL,
  ItemId       INT64 NOT NULL,
  ProductName  STRING(512),
  Quantity     INT64,
  UnitPrice    NUMERIC,
) PRIMARY KEY (CustomerId, OrderId, ItemId),
  INTERLEAVE IN PARENT Orders ON DELETE CASCADE;

-- Secondary index for querying orders by status
CREATE INDEX OrdersByStatus ON Orders(Status) STORING (TotalAmount, OrderDate);`,
    },
    {
      language: "bash",
      caption: "Bigtable: CLI operations with cbt tool",
      source: `# Install the cbt CLI tool
gcloud components install cbt

# Configure cbt with project and instance
echo "project = my-project" > ~/.cbtrc
echo "instance = my-bigtable-instance" >> ~/.cbtrc

# Create a new table with column families
cbt createtable user-events
cbt createfamily user-events activity
cbt createfamily user-events metadata

# Set garbage collection policy (keep last 3 versions, delete cells older than 7 days)
cbt setgcpolicy user-events activity maxversions=3
cbt setgcpolicy user-events metadata maxage=168h

# Write data using reversed timestamp key pattern
cbt set user-events "user123#9999999999999-1690000000000" \\
  activity:type=click \\
  activity:page=/dashboard \\
  metadata:ip=10.0.0.1

# Read a single row
cbt read user-events prefix="user123#" count=5

# List tables in the instance
cbt ls

# Delete a table (use with caution)
# cbt deletetable user-events`,
    },
  ],
  diagrams: [
    {
      title: "GCP Data Service Landscape",
      kind: "mindmap",
      caption: "Overview of GCP managed data services by category.",
      mermaid: `mindmap
  root((GCP Data))
    Relational
      Cloud SQL
      Cloud Spanner
      AlloyDB
    Analytics
      BigQuery
      Looker
    NoSQL
      Firestore
      Bigtable
    Streaming
      Pub/Sub
      Dataflow
    Storage
      Cloud Storage
      Filestore`,
    },
    {
      title: "BigQuery Query Execution",
      kind: "flow",
      caption: "How BigQuery processes a SQL query through its distributed engine.",
      mermaid: `flowchart TD
    A[SQL Query Submitted] --> B[Query Parser and Planner]
    B --> C[Execution Plan Generated]
    C --> D{Cached result?}
    D -- Yes --> E[Return from Cache]
    D -- No --> F[Dremel Execution Engine]
    F --> G[Distributed Slot Workers]
    G --> H[Columnar Storage Scan]
    H --> I[Shuffle and Aggregate]
    I --> J[Result Assembled]
    J --> K[Return to Client]`,
    },
    {
      title: "Pub/Sub Message Flow",
      kind: "sequence",
      caption: "End-to-end message lifecycle in Google Cloud Pub/Sub.",
      mermaid: `sequenceDiagram
    participant Publisher
    participant Topic as Pub/Sub Topic
    participant Sub as Subscription
    participant Subscriber
    Publisher->>Topic: Publish message
    Topic-->>Publisher: Message ID
    Topic->>Sub: Fan-out to subscriptions
    Subscriber->>Sub: Pull messages
    Sub-->>Subscriber: Messages batch
    Subscriber->>Sub: Acknowledge messages
    alt Not acknowledged
        Sub->>Subscriber: Redeliver after ack deadline
    end`,
    },
    {
      title: "Cloud Spanner Architecture",
      kind: "architecture",
      caption: "Spanner distributed database architecture across regions.",
      mermaid: `graph TD
    Client --> FE[Frontend Servers]
    FE --> Spanserver
    Spanserver --> Paxos[Paxos Group]
    Paxos --> R1[Replica Region 1]
    Paxos --> R2[Replica Region 2]
    Paxos --> R3[Replica Region 3]
    Spanserver --> Colossus[Colossus Storage]
    subgraph TrueTime
        TT[Atomic Clock and GPS]
    end
    Spanserver --> TrueTime`,
    },
  ],
  comparison: {
    columns: ["Feature", "BigQuery", "Cloud Spanner", "Cloud Bigtable", "Firestore", "Cloud SQL"],
    rows: [
      ["**Type**", "*Columnar data warehouse*", "*Distributed relational*", "*Wide-column NoSQL*", "*Document NoSQL*", "*Managed relational*"],
      ["**Workload**", "OLAP / analytics", "Global OLTP", "High-throughput key-value", "App backends / real-time", "Traditional OLTP"],
      ["**Query Language**", "`Standard SQL`", "`Google SQL` / `PostgreSQL`", "`HBase API` / `cbt CLI`", "*Document API (SDKs)*", "`MySQL` / `PostgreSQL` / `SQL Server`"],
      ["**Max Scale**", "*Petabytes+, serverless*", "*Petabytes, horizontal*", "*Petabytes, linear scaling*", "*Auto-scaling, serverless*", "*64 TiB, vertical*"],
      ["**Consistency**", "*Strong (within dataset)*", "**Strong (global external)**", "*Eventually consistent (cross-cluster)*", "**Strong (all reads)**", "*Strong (single instance)*"],
      ["**Latency**", "*Seconds (analytical queries)*", "*Single-digit ms reads/writes*", "*Sub-10ms reads/writes*", "*Single-digit ms reads/writes*", "*Single-digit ms reads/writes*"],
      ["**Availability SLA**", "`99.99%`", "`99.999%` (multi-region)", "`99.99%` (replicated)", "`99.999%` (multi-region)", "`99.95%` - `99.99%`"],
      ["**Pricing Model**", "*Per TiB scanned or slot-hours*", "*Per node-hour + storage*", "*Per node-hour + storage*", "*Per read/write/delete ops*", "*Per vCPU + RAM + storage*"],
      ["**Best For**", "BI dashboards, ML, ad-hoc analytics", "Global finance, inventory, gaming", "IoT, time-series, ML features", "Mobile/web apps, real-time sync", "Legacy apps, WordPress, ERP"],
      ["**Key Feature**", "`BigQuery ML`, *serverless*", "`TrueTime`, *interleaved tables*", "`Key Visualizer`, *HBase compat*", "*Real-time listeners, offline mode*", "`Auth Proxy`, *read replicas*"],
    ],
  },
  exercises: [
    "**Lab 1 - BigQuery Partitioning & Clustering:** Create a BigQuery dataset and load the publicly available `bigquery-public-data.github_repos.commits` table. Create a *partitioned table* by `committer.date` and *clustered* by `repo_name`. Write queries that demonstrate **partition pruning** (filter by date range) and compare `slot_ms` and `bytes_scanned` between the partitioned vs. non-partitioned versions using `INFORMATION_SCHEMA.JOBS`.",
    "**Lab 2 - Cloud Spanner Interleaved Tables:** Provision a *single-node regional Spanner instance*. Create a schema with `Customers`, `Orders`, and `OrderItems` as **interleaved tables**. Insert sample data using *DML batch transactions*. Run `JOIN` queries across parent-child tables and examine **query execution plans** via `SPANNER_SYS.QUERY_STATS_TOP_MINUTE` to observe the benefit of co-located data.",
    "**Lab 3 - Bigtable Key Design & Performance:** Create a Bigtable instance with a *development cluster*. Design three different **row key schemas** for time-series IoT data: (a) `device_id#timestamp`, (b) `device_id#reversed_timestamp`, (c) `salted_hash#device_id#timestamp`. Load 100,000 rows using the `cbt` CLI or a *Dataflow pipeline*. Use the **Key Visualizer** to observe access pattern distribution and identify any *hotspotting*.",
    "**Lab 4 - Firestore Real-Time Sync:** Build a minimal *web application* using Firestore in **Native mode**. Create a `messages` collection and implement **real-time listeners** using `onSnapshot()`. Open the app in *two browser windows* and observe real-time synchronization. Create a **composite index** for queries that filter on both `sender` and `timestamp`, and verify it appears in the *Firebase Console* under Indexes.",
    "**Lab 5 - Cross-Service Data Pipeline:** Design and implement an *end-to-end pipeline*: IoT device data ingested into **Bigtable** (low-latency writes), periodically exported to **BigQuery** via a `Dataflow` streaming job for analytics, with aggregated results written to **Firestore** for a real-time dashboard. Use `gcloud` CLI commands to provision all resources and monitor pipeline health via *Cloud Monitoring*.",
  ],
  cheatSheet: [
    "`bq query --use_legacy_sql=false 'SELECT * FROM dataset.table WHERE _PARTITIONDATE = \"2025-01-01\"'` -- Query a *partitioned table* with **partition pruning** in BigQuery",
    "`gcloud spanner databases ddl update my-db --instance=my-instance --ddl='CREATE INDEX OrdersByDate ON Orders(OrderDate) STORING (TotalAmount)'` -- Add a **secondary index** with *stored columns* to Spanner",
    "`cbt -instance=my-instance read my-table prefix=\"user123#\" count=10` -- Read rows by **key prefix** from Bigtable using the *cbt CLI*",
    "`bq mk --table --schema 'id:STRING,ts:TIMESTAMP,val:FLOAT64' --time_partitioning_field ts --clustering_fields id project:dataset.table` -- Create a **partitioned + clustered** table via `bq` CLI",
    "`gcloud sql connect my-instance --user=root --quiet` -- Connect to a **Cloud SQL** instance via *Cloud SQL Auth Proxy* with `gcloud`",
    "`gcloud firestore indexes composite create --collection-group=orders --field-config field-path=status,order=ASCENDING --field-config field-path=created,order=DESCENDING` -- Create a **composite index** in *Firestore*",
  ],
  revisionNotes: [
    "**BigQuery** uses the *Dremel* execution engine with a **multi-level serving tree** (root -> mixers -> leaf slots). Storage is in *Capacitor* columnar format on **Colossus**. Key optimization levers: `partitioning` (prune by date/integer range), `clustering` (prune blocks within partitions), and **materialized views**. Pricing is either *on-demand* ($6.25/TiB scanned) or *flat-rate slot reservations* (Editions).",
    "**Cloud Spanner** achieves **external consistency** via *TrueTime* (GPS + atomic clocks providing bounded timestamp uncertainty). Data is split into **key-range-based splits** (~8 GiB each), each replicated via *Paxos*. **Interleaved tables** co-locate parent-child data in the same split. Multi-region configs use **witness replicas** for quorum votes without full data copies, delivering `99.999%` SLA.",
    "**Cloud Bigtable** uses an *LSM-tree* architecture: writes go to a `memtable` (with WAL), flush to immutable **SSTables**, and are merged via *compaction* (minor and major). Data is organized into **tablets** (row-key ranges) managed by *tablet servers*. Key design is paramount — avoid *monotonically increasing keys* to prevent **hotspotting**. Use the `Key Visualizer` heatmap to diagnose access patterns.",
    "**Firestore** operates in *Native mode* (real-time listeners, offline support, mobile SDKs) or *Datastore mode* (legacy API compatibility, no real-time). All reads are **strongly consistent**. Queries require *indexes* — single-field indexes are automatic, **composite indexes** must be explicitly created. Pricing is per *document operation* (reads, writes, deletes) plus storage.",
    "**Cloud SQL** supports `MySQL`, `PostgreSQL`, and `SQL Server` with automated *backups*, **PITR** (binary/WAL logs), HA with *regional failover*, and up to 10 **read replicas** (including cross-region). The `Cloud SQL Auth Proxy` provides IAM-authenticated encrypted connections without IP allowlisting. Max capacity: *96 vCPUs, 624 GiB RAM, 64 TiB storage*. For larger workloads, consider **AlloyDB**.",
  ],
};
