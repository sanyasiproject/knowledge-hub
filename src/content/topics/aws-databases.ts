import type { TopicContent } from "../types";

export const awsDatabases: TopicContent = {
  quickSummary: [
    "Amazon RDS (Relational Database Service) manages MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server with automated backups, patching, Multi-AZ failover, and read replicas. You manage schema design, query optimization, and data — AWS handles the engine and infrastructure.",
    "Amazon Aurora is AWS's cloud-native relational database, compatible with MySQL and PostgreSQL. It delivers up to 5x MySQL and 3x PostgreSQL throughput through a distributed storage engine that replicates 6 copies across 3 AZs, with 128 TB auto-scaling storage.",
    "DynamoDB is a fully managed NoSQL key-value and document database. It offers single-digit millisecond latency at any scale with two capacity modes: on-demand (pay-per-request) and provisioned (with auto-scaling). Global Tables provide multi-region, active-active replication.",
    "DynamoDB secondary indexes extend query flexibility: Global Secondary Indexes (GSI) allow queries on any attribute with a different partition key, while Local Secondary Indexes (LSI) use the same partition key but a different sort key and must be created at table creation.",
    "ElastiCache provides managed Redis or Memcached for sub-millisecond in-memory caching. Redshift is a columnar data warehouse for analytics queries across petabytes of data using massively parallel processing (MPP)."
  ],

  detailed: [
    "## Amazon RDS\n\nRDS manages relational databases, handling provisioning, patching, backup, recovery, and scaling while you focus on application development.\n\n**Supported engines:** MySQL, PostgreSQL, MariaDB, Oracle, SQL Server\n\n**Key features:**\n- **Multi-AZ deployments:** Synchronous replication to a standby instance in a different AZ. Automatic failover in 60-120 seconds on instance failure. The standby is not readable — it exists purely for HA\n- **Read replicas:** Asynchronous replication for read scaling. Up to 15 replicas (Aurora) or 5 replicas (other engines). Can be in different regions for global read performance. Can be promoted to standalone instances\n- **Automated backups:** Daily snapshots plus transaction log backups. Point-in-time recovery to any second within the retention period (up to 35 days)\n- **Storage auto-scaling:** Automatically increases storage when usage approaches capacity\n\n**Instance classes:**\n- db.m-series: general purpose (balanced CPU/memory)\n- db.r-series: memory optimized (large databases, in-memory caching)\n- db.t-series: burstable (dev/test, small production workloads)\n- Graviton-based instances (db.m7g, db.r7g) for 20-30% cost savings\n\n**RDS Proxy:**\n- Managed connection pooling for RDS and Aurora\n- Reduces database connection overhead by multiplexing application connections\n- Improves failover time by keeping connections alive during switchovers\n- Essential for Lambda-to-database connections (Lambda can create thousands of concurrent connections)\n\n**When NOT to use RDS:**\n- Need OS-level access (custom extensions, specialized tuning): use EC2 with self-managed database\n- Need horizontal write scaling: consider DynamoDB or Aurora Global Database\n- Need a database engine not supported by RDS: use EC2",

    "## Amazon Aurora\n\nAurora is AWS's cloud-native relational database, designed from the ground up for the cloud while maintaining MySQL and PostgreSQL compatibility.\n\n**Architecture:**\n- Separates compute (database instances) from storage (distributed, fault-tolerant storage layer)\n- Storage automatically replicates 6 copies of data across 3 AZs\n- Storage auto-scales from 10 GB up to 128 TB without downtime\n- Can tolerate loss of 2 copies for writes, 3 copies for reads without data loss\n\n**Performance:**\n- Up to 5x throughput of standard MySQL, 3x of standard PostgreSQL\n- Improvements come from the distributed storage engine, optimized query processing, and reduced I/O\n- Sub-10ms replica lag (vs. seconds with RDS MySQL/PostgreSQL read replicas)\n\n**Aurora Serverless v2:**\n- Auto-scales compute capacity in fine-grained increments (0.5 ACU steps)\n- Scales from minimum to maximum ACUs based on workload demand\n- Ideal for variable workloads, dev/test environments, and multi-tenant applications\n- Can mix serverless and provisioned instances in the same cluster\n\n**Aurora Global Database:**\n- Replicates to up to 5 secondary regions with < 1 second replication lag\n- Cross-region disaster recovery with RPO < 1 second, RTO < 1 minute\n- Secondary regions can serve read traffic for global applications\n\n**Aurora vs. RDS:**\n- Aurora: higher availability (6-way replication), faster replication, auto-scaling storage, higher throughput, but ~20% more expensive\n- RDS: supports more engines (Oracle, SQL Server), simpler pricing, sufficient for many workloads\n- Choose Aurora for: high availability requirements, large databases, global distribution, or workloads needing PostgreSQL/MySQL with enhanced performance",

    "## Amazon DynamoDB\n\nDynamoDB is a fully managed NoSQL database providing single-digit millisecond performance at any scale.\n\n**Data model:**\n- Tables contain items (rows), each with attributes (columns)\n- Primary key: partition key (hash) alone, or partition key + sort key (range)\n- Partition key determines data distribution across partitions — choose high-cardinality keys\n- No fixed schema beyond the primary key — each item can have different attributes\n\n**Capacity modes:**\n- **On-demand:** Pay per read/write request. No capacity planning needed. Instantly accommodates traffic spikes. Best for unpredictable workloads or new applications\n- **Provisioned:** Specify read and write capacity units (RCUs/WCUs). Auto-scaling adjusts capacity within min/max bounds. Cheaper than on-demand for predictable workloads. Reserve capacity for additional savings\n\n**Capacity units:**\n- 1 RCU = 1 strongly consistent read/second for items up to 4 KB, or 2 eventually consistent reads\n- 1 WCU = 1 write/second for items up to 1 KB\n- Larger items consume more units proportionally\n\n**Consistency models:**\n- Eventually consistent reads: default, may return slightly stale data (typically < 1 second lag)\n- Strongly consistent reads: guaranteed to return the most recent write, but consume 2x RCUs and only work on the table's primary region\n\n**DynamoDB Streams:**\n- Captures item-level changes (insert, update, delete) as an ordered stream\n- Triggers Lambda functions for event-driven architectures\n- Used for replication, analytics pipelines, and cross-region synchronization\n\n**DynamoDB Accelerator (DAX):**\n- In-memory cache for DynamoDB providing microsecond read latency\n- API-compatible — drop-in replacement with minimal code changes\n- Ideal for read-heavy workloads with repeated access patterns",

    "## DynamoDB Secondary Indexes\n\nSecondary indexes enable efficient queries on attributes other than the primary key.\n\n**Global Secondary Index (GSI):**\n- Defines a completely new partition key and optional sort key from any table attributes\n- Created at any time (table creation or after)\n- Has its own provisioned capacity (separate RCUs/WCUs from the base table)\n- Eventually consistent reads only\n- Up to 20 GSIs per table\n- Can project all, specific, or only key attributes\n- Think of it as a separate table that DynamoDB keeps in sync with the base table\n\n**Local Secondary Index (LSI):**\n- Same partition key as the base table, different sort key\n- Must be created at table creation time — cannot be added later\n- Shares the base table's read/write capacity (no separate provisioning)\n- Supports both eventually consistent and strongly consistent reads\n- Up to 5 LSIs per table\n- 10 GB size limit per partition key value (includes base table and all LSI data)\n\n**Design considerations:**\n- GSIs are more flexible and commonly used; LSIs are niche\n- GSIs have their own throughput — a hot GSI can be throttled independently\n- Over-indexing wastes write capacity (every table write replicates to each GSI)\n- Use sparse indexes: if the GSI key attribute doesn't exist on most items, the index only contains items with that attribute\n\n**Single-table design pattern:**\n- Store multiple entity types in one table using generic key names (PK, SK)\n- Use GSIs with inverted keys to support additional access patterns\n- Reduces the number of tables and enables transactional operations across entity types\n- Trade-off: harder to understand and maintain, but more efficient at scale",

    "## ElastiCache and Redshift\n\n**Amazon ElastiCache:**\n\nManaged in-memory data store supporting Redis and Memcached.\n\n**Redis vs. Memcached:**\n- Redis: data structures (strings, lists, sets, sorted sets, hashes), persistence, replication, pub/sub, Lua scripting, cluster mode with sharding. Choose Redis for most use cases\n- Memcached: simple key-value caching, multi-threaded, no persistence or replication. Choose for simple caching with multi-threaded performance\n\n**Redis features:**\n- Cluster mode: horizontal scaling across up to 500 shards with automatic partitioning\n- Read replicas: up to 5 per shard for read scaling and HA\n- Multi-AZ with automatic failover\n- Encryption at rest and in transit\n- Global Datastore: cross-region replication for disaster recovery\n\n**Common caching patterns:**\n- Cache-aside (lazy loading): application checks cache first, loads from DB on miss\n- Write-through: application writes to cache and DB simultaneously\n- TTL-based expiration: set time-to-live to automatically evict stale data\n\n---\n\n**Amazon Redshift:**\n\nFully managed, petabyte-scale data warehouse using columnar storage and MPP.\n\n**Key features:**\n- Columnar storage: compresses data efficiently and reads only needed columns\n- Massively parallel processing: distributes queries across nodes\n- Redshift Spectrum: query data directly in S3 without loading into Redshift\n- Concurrency Scaling: automatically adds cluster capacity for burst read queries\n- Redshift Serverless: auto-scaling compute without cluster management\n\n**Use cases:**\n- Business intelligence and reporting on large datasets\n- ETL/ELT data processing pipelines\n- Historical data analysis across petabytes\n- Not suitable for OLTP (transactional) workloads — use RDS or DynamoDB instead"
  ],

  interviewQA: [
    {
      q: "When would you choose DynamoDB over RDS?",
      a: "DynamoDB when: (1) You need single-digit millisecond latency at any scale with auto-scaling. (2) Your access patterns are known and fit key-value or document queries. (3) You need horizontal write scaling. (4) Your data model doesn't require complex joins or transactions across many entities. (5) You want fully managed with zero operational overhead. RDS when: (1) You need complex queries with joins, aggregations, or ad-hoc SQL. (2) Your data model is highly relational with referential integrity requirements. (3) You need ACID transactions across multiple tables. (4) Your team's expertise is in SQL. The key question is: do you know your access patterns upfront? DynamoDB requires designing around specific query patterns; RDS allows flexible ad-hoc queries.",
      followUps: ["How do you handle DynamoDB's lack of joins?", "What about DynamoDB transactions?"]
    },
    {
      q: "Explain DynamoDB partition key design and why it matters.",
      a: "The partition key determines how DynamoDB distributes data across physical partitions. A good partition key has high cardinality (many distinct values), uniform request distribution, and avoids 'hot partitions' where one key receives disproportionate traffic. Bad example: using 'status' (only a few values like active/inactive) as partition key — all active users hit the same partition. Good example: using 'userId' — traffic distributes evenly across millions of users. For time-series data, avoid using just a date as the partition key (today's date gets all writes). Instead, use a compound key like 'sensorId' + date as sort key. DynamoDB has adaptive capacity that can handle some imbalance, but fundamental key design is critical.",
      followUps: ["What is the hot partition problem?", "How does adaptive capacity work?"]
    },
    {
      q: "Compare Aurora Serverless v2 with provisioned Aurora. When would you use each?",
      a: "Provisioned Aurora: you select specific instance sizes and pay for them regardless of utilization. Best for production workloads with predictable, sustained demand where you can right-size instances. Aurora Serverless v2: auto-scales in 0.5 ACU increments from a minimum to maximum you set. Best for variable workloads (dev/test environments, multi-tenant apps, periodic reporting). You can mix both in the same cluster — provisioned writer for baseline, serverless readers for variable read load. Serverless v2 is slightly more expensive per ACU than equivalent provisioned capacity, but saves money when utilization is variable because you don't pay for idle capacity.",
      followUps: ["What is an ACU?", "How fast does Serverless v2 scale?"]
    },
    {
      q: "How would you design a caching strategy using ElastiCache Redis?",
      a: "Start with cache-aside (lazy loading): application checks Redis first, on miss reads from the database and writes to Redis with a TTL. This is the safest starting pattern because cache misses just fall back to the database. Set TTLs based on data staleness tolerance — session data might have 30-minute TTL, product catalog 1 hour. For data that must be immediately consistent, add write-through: update Redis when you write to the database. Use Redis data structures strategically: sorted sets for leaderboards, sets for tags, hashes for user profiles. Monitor cache hit ratio — below 80% suggests your caching strategy needs adjustment. Plan for cache failure: the application must handle Redis being unavailable by falling back to the database gracefully."
    }
  ],

  mcqs: [
    {
      q: "How many copies of data does Aurora maintain across Availability Zones?",
      options: ["2 copies across 2 AZs", "3 copies across 3 AZs", "6 copies across 3 AZs", "6 copies across 6 AZs"],
      answerIndex: 2,
      explanation: "Aurora automatically replicates 6 copies of your data across 3 AZs. It can tolerate the loss of 2 copies without affecting write availability and 3 copies without affecting read availability."
    },
    {
      q: "Which DynamoDB capacity mode is best for a new application with unpredictable traffic?",
      options: ["Provisioned with auto-scaling", "On-demand", "Reserved capacity", "Provisioned without auto-scaling"],
      answerIndex: 1,
      explanation: "On-demand mode requires no capacity planning, instantly accommodates traffic spikes, and you only pay per request. It is ideal for new applications before access patterns are established."
    },
    {
      q: "What is a key limitation of DynamoDB Local Secondary Indexes (LSI)?",
      options: [
        "Cannot be used with sort keys",
        "Must be created at table creation time",
        "Only support eventually consistent reads",
        "Limited to 1 per table"
      ],
      answerIndex: 1,
      explanation: "LSIs must be defined when the table is created and cannot be added or removed later. They also have a 10 GB size limit per partition key value. GSIs can be created at any time."
    },
    {
      q: "RDS Multi-AZ deployment provides:",
      options: [
        "Read scaling with readable replicas",
        "Automatic failover to a synchronous standby in another AZ",
        "Cross-region disaster recovery",
        "Horizontal write scaling"
      ],
      answerIndex: 1,
      explanation: "Multi-AZ maintains a synchronous standby replica in another AZ. It provides automatic failover (60-120 seconds) for high availability. The standby is NOT readable — use read replicas for read scaling."
    },
    {
      q: "Which caching pattern writes to the cache and database simultaneously?",
      options: ["Cache-aside", "Write-through", "Read-through", "Write-behind"],
      answerIndex: 1,
      explanation: "Write-through updates the cache at the same time as the database, ensuring the cache always has the latest data. Cache-aside only populates the cache on read misses."
    }
  ],

  flashcards: [
    { front: "RDS Multi-AZ vs. Read Replicas", back: "Multi-AZ: synchronous standby for HA, not readable, automatic failover. Read Replicas: asynchronous copies for read scaling, readable, can be cross-region, can be promoted to standalone." },
    { front: "Aurora storage architecture", back: "6 copies across 3 AZs, auto-scales 10 GB to 128 TB. Tolerates 2 copy loss for writes, 3 for reads. Separates compute from storage for independent scaling." },
    { front: "DynamoDB capacity units", back: "1 RCU = 1 strongly consistent read/s (4 KB) or 2 eventually consistent. 1 WCU = 1 write/s (1 KB). Larger items consume proportionally more units." },
    { front: "GSI vs. LSI", back: "GSI: any partition/sort key, created anytime, own throughput, eventually consistent only, up to 20. LSI: same partition key, must create at table creation, shares table throughput, strongly consistent supported, up to 5." },
    { front: "DynamoDB Streams", back: "Ordered log of item-level changes (insert/update/delete). Used to trigger Lambda, power replication, feed analytics. Retained for 24 hours." },
    { front: "DAX", back: "DynamoDB Accelerator — in-memory cache providing microsecond reads. API-compatible drop-in. Ideal for read-heavy workloads with repeated access patterns." },
    { front: "ElastiCache Redis vs. Memcached", back: "Redis: data structures, persistence, replication, pub/sub, cluster mode. Memcached: simple key-value, multi-threaded, no persistence. Redis preferred for most use cases." },
    { front: "Redshift Spectrum", back: "Query data directly in S3 from Redshift without loading it into tables. Extends Redshift to exabyte-scale data lakes using external tables." }
  ],

  glossary: [
    { term: "RDS", definition: "Relational Database Service — managed service for MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server with automated backups, patching, and high availability." },
    { term: "Aurora", definition: "AWS cloud-native relational database compatible with MySQL and PostgreSQL, offering 6-way replication, auto-scaling storage, and up to 5x performance improvement." },
    { term: "DynamoDB", definition: "Fully managed NoSQL key-value and document database providing single-digit millisecond latency with automatic scaling and replication." },
    { term: "GSI", definition: "Global Secondary Index — DynamoDB index with a different partition key from the base table, enabling queries on non-primary-key attributes." },
    { term: "LSI", definition: "Local Secondary Index — DynamoDB index sharing the base table's partition key but with a different sort key, created only at table creation time." },
    { term: "ElastiCache", definition: "Managed in-memory caching service supporting Redis and Memcached for sub-millisecond data access." },
    { term: "Redshift", definition: "Fully managed petabyte-scale data warehouse using columnar storage and massively parallel processing for analytics workloads." },
    { term: "RDS Proxy", definition: "Managed connection pooler for RDS and Aurora that reduces database connection overhead and improves failover resilience." }
  ]
};
