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
};
