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

  followUps: [
    "RDS or DynamoDB for a new service — what would decide it?",
    "What does Aurora change about the storage layer?",
    "How does DynamoDB's partition key choice cause throttling?",
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

  deepDive: [
    "## DynamoDB Partition Strategy and Hot Key Mitigation\n\n**DynamoDB distributes data across partitions** based on a hash of the partition key. Each partition supports up to 3,000 RCUs and 1,000 WCUs. When a single partition key receives disproportionate traffic (a **hot key**), that partition throttles even if total table capacity is underutilized. Mitigation strategies: **Write sharding** appends a random suffix (e.g., `order#1234#3`) to distribute writes across partitions, with scatter-gather reads. **DynamoDB Adaptive Capacity** automatically rebalances throughput to hot partitions, but has limits. For extreme cases, **DAX (DynamoDB Accelerator)** absorbs read hot spots with microsecond-latency caching. **Single-table design** consolidates multiple entity types into one table using composite keys (e.g., PK=`CUSTOMER#123`, SK=`ORDER#2024-01-15`) — this enables transactional operations across entities and reduces the number of tables to manage. GSIs with **sparse indexes** (only items with the GSI attribute are indexed) enable efficient queries on subsets of data.",
    "## Aurora Architecture and Multi-Master Patterns\n\n**Aurora separates compute from storage** — the storage layer is a distributed, self-healing system spanning 6 copies across 3 AZs. Storage is organized into **10 GB segments called protection groups**, each replicated 6 ways. Aurora can tolerate losing an entire AZ (2 copies) without read availability loss, and 2 copies without write availability loss. The **log-structured storage** system means only redo log records are written to the network — reducing I/O amplification by 4.5x compared to standard MySQL. **Aurora Serverless v2** scales compute in increments of 0.5 ACU (2 GB RAM each), from 0.5 to 128 ACUs, in milliseconds — ideal for dev/test, variable workloads, and multi-tenant applications. **Aurora Global Database** uses dedicated replication infrastructure for cross-region replication with < 1 second lag, enabling RPO < 1 second and RTO < 1 minute for disaster recovery.",
    "## ElastiCache Patterns: Caching Strategies in Practice\n\n**Cache-aside (lazy loading)** is the most common pattern: the application checks the cache first, on miss reads from the database and populates the cache. This handles cache failures gracefully (degraded but functional) and only caches accessed data. **Write-through** updates the cache on every database write — ensures cache freshness but increases write latency and caches data that may never be read. **Write-behind (write-back)** writes to cache first, then asynchronously flushes to the database — lowest write latency but risk of data loss if the cache fails. **ElastiCache for Redis** supports **cluster mode** with up to 500 shards (partitions) and 1-5 replicas per shard, enabling 200+ million reads/sec and 100+ million writes/sec. Key Redis data structures for caching: **Sorted Sets** for leaderboards and rate limiting, **HyperLogLog** for unique visitor counting (12 KB per counter), and **Streams** for event logs with consumer groups."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: RDS Aurora PostgreSQL cluster with read replicas",
      source: `resource "aws_rds_cluster" "main" {
  cluster_identifier     = "prod-aurora-postgres"
  engine                 = "aurora-postgresql"
  engine_version         = "15.4"
  database_name          = "appdb"
  master_username        = "admin"
  master_password        = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.aurora.id]

  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn

  backup_retention_period   = 14
  preferred_backup_window   = "03:00-04:00"
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "prod-aurora-final"

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 64
  }
}

resource "aws_rds_cluster_instance" "writer" {
  identifier         = "prod-aurora-writer"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.r6g.2xlarge"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
}

resource "aws_rds_cluster_instance" "readers" {
  count              = 2
  identifier         = "prod-aurora-reader-\${count.index}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version
}

resource "aws_rds_cluster_instance" "analytics" {
  identifier         = "prod-aurora-analytics"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  tags = { Purpose = "analytics-queries" }
}`
    },
    {
      language: "bash",
      caption: "AWS CLI: DynamoDB table with GSI and auto-scaling",
      source: `# Create a DynamoDB table with on-demand billing
aws dynamodb create-table \\
  --table-name Orders \\
  --attribute-definitions \\
    AttributeName=PK,AttributeType=S \\
    AttributeName=SK,AttributeType=S \\
    AttributeName=GSI1PK,AttributeType=S \\
    AttributeName=GSI1SK,AttributeType=S \\
  --key-schema \\
    AttributeName=PK,KeyType=HASH \\
    AttributeName=SK,KeyType=RANGE \\
  --global-secondary-indexes '[
    {
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }
  ]' \\
  --billing-mode PAY_PER_REQUEST \\
  --tags Key=Environment,Value=prod

# Enable point-in-time recovery
aws dynamodb update-continuous-backups \\
  --table-name Orders \\
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Enable TTL on an expiry attribute
aws dynamodb update-time-to-live \\
  --table-name Orders \\
  --time-to-live-specification Enabled=true,AttributeName=expiresAt`
    },
    {
      language: "json",
      caption: "DynamoDB single-table design: access patterns for e-commerce",
      source: `{
  "TableName": "ECommerce",
  "KeySchema": { "PK": "HASH", "SK": "RANGE" },
  "GSI1": { "GSI1PK": "HASH", "GSI1SK": "RANGE" },
  "AccessPatterns": {
    "GetCustomer":       { "PK": "CUSTOMER#123", "SK": "PROFILE" },
    "GetCustomerOrders": { "PK": "CUSTOMER#123", "SK": "begins_with(ORDER#)" },
    "GetOrder":          { "PK": "ORDER#456",    "SK": "METADATA" },
    "GetOrderItems":     { "PK": "ORDER#456",    "SK": "begins_with(ITEM#)" },
    "OrdersByDate":      { "GSI1PK": "CUSTOMER#123", "GSI1SK": "begins_with(2024-)" },
    "OrdersByStatus":    { "GSI1PK": "STATUS#PENDING", "GSI1SK": "sortByDate" }
  },
  "ExampleItems": [
    { "PK": "CUSTOMER#123", "SK": "PROFILE", "name": "Jane Doe", "email": "jane@example.com" },
    { "PK": "CUSTOMER#123", "SK": "ORDER#2024-01-15#456", "total": 89.99, "status": "SHIPPED",
      "GSI1PK": "CUSTOMER#123", "GSI1SK": "2024-01-15", "expiresAt": 1737936000 },
    { "PK": "ORDER#456", "SK": "ITEM#1", "productId": "PROD#789", "quantity": 2, "price": 44.99 }
  ]
}`
    }
  ],

  comparison: {
    columns: ["Feature", "RDS/Aurora", "DynamoDB", "ElastiCache Redis", "Redshift"],
    rows: [
      ["Data model", "Relational (SQL)", "Key-value / document", "In-memory key-value", "Columnar (SQL)"],
      ["Max storage", "128 TB (Aurora)", "Unlimited", "500+ GB (cluster)", "8 PB (RA3)"],
      ["Latency", "1-10 ms", "1-10 ms (DAX: microseconds)", "Sub-millisecond", "Seconds (complex queries)"],
      ["Scaling", "Vertical + read replicas", "Horizontal (auto-partitioning)", "Cluster mode sharding", "Node resize / elastic"],
      ["Transactions", "Full ACID", "TransactWriteItems (25 items)", "MULTI/EXEC (single shard)", "Full ACID"],
      ["Pricing model", "Instance hours + storage", "RCU/WCU or on-demand per request", "Node hours", "Node hours + spectrum queries"],
      ["HA/DR", "Multi-AZ, cross-region read replicas", "Multi-AZ by default, Global Tables", "Multi-AZ replication", "Multi-AZ, cross-region snapshots"],
      ["Best for", "Complex queries, joins, ACID transactions", "High-scale, predictable access patterns", "Session cache, leaderboards, rate limiting", "Analytics, data warehousing, BI"]
    ]
  },

  exercises: [
    "Design a DynamoDB single-table schema for a social media application supporting these access patterns: get user profile, list user's posts (newest first), get post with comments, list posts by hashtag (newest first), get user's followers/following. Define PK/SK structure, GSIs needed, and item examples for each entity type.",
    "A SaaS application has 50,000 tenants sharing a single Aurora PostgreSQL cluster. During peak hours, connection count reaches 10,000+. Design a solution using RDS Proxy for connection pooling, Aurora Serverless v2 for compute scaling, and read replicas for query distribution. Specify how to route read vs write traffic and handle tenant isolation.",
    "You need to implement a caching layer for an e-commerce product catalog. Products are updated 10 times/day but read 100,000 times/day. Design the ElastiCache architecture: choose between Redis and Memcached, select the caching strategy (cache-aside vs write-through), define TTL policies, handle cache invalidation on product updates, and plan for cache node failures.",
    "A financial services company needs a database for transaction processing (strict ACID, 50,000 TPS) and real-time analytics on the same data. Design an architecture using Aurora PostgreSQL for OLTP, with zero-ETL integration to Redshift for analytics. Address: data consistency between systems, query routing, and cost optimization.",
    "Your DynamoDB table experiences hot partition issues: 80% of reads target the top 100 products (out of 10 million). Current table uses product_id as partition key and has 10,000 RCUs provisioned. Design a solution using DAX, write sharding for popular items, and ElastiCache Redis for computed aggregations (like trending products). Calculate the cost comparison."
  ],

  cheatSheet: [
    "**DynamoDB pricing**: On-demand = $1.25/million WCUs + $0.25/million RCUs. Provisioned = $0.00065/WCU-hr + $0.00013/RCU-hr. On-demand costs ~6.6x more per request but no capacity planning needed",
    "**Aurora vs RDS**: Aurora costs ~20% more but gives 6-way replication, auto-scaling storage, faster failover (30s vs 60-120s), and up to 15 read replicas (vs 5 for RDS)",
    "**DynamoDB item size limit**: 400 KB per item. Large items should use S3 for the payload and store the S3 key in DynamoDB. GSI inherits the base table's 400 KB limit",
    "**ElastiCache node types**: r6g (memory-optimized) for caching, m6g (general) for complex data structures. Max ~500 GB with cluster mode. Graviton nodes are 20% cheaper",
    "**RDS Multi-AZ**: synchronous replication, automatic failover in 1-2 minutes, failover endpoint stays the same. Read replicas are async and can be promoted manually for DR",
    "**DynamoDB Streams + Lambda**: enable CDC (Change Data Capture) for real-time reactions to data changes. Use for denormalization, analytics pipelines, cross-region replication triggers",
    "**Redshift Spectrum**: query S3 data directly without loading it. Combine with RA3 nodes that cache hot data on local SSDs. Use for data lakehouse architectures",
    "**Connection pooling**: RDS Proxy pools connections, supports IAM auth, and handles failover transparently. Essential for Lambda-to-RDS (prevents connection exhaustion from concurrent invocations)"
  ],

  revisionNotes: [
    "DynamoDB is multi-AZ by default with no configuration needed. Data is replicated across 3 AZs automatically. Global Tables add cross-region active-active replication with eventual consistency",
    "Aurora storage auto-scales in 10 GB increments up to 128 TB. You never provision storage — you only pay for what you use. Storage is billed separately from compute",
    "ElastiCache Redis supports persistence (RDB snapshots + AOF) but is NOT a database replacement. Use it to accelerate reads and reduce database load. Plan for cache warming after restarts",
    "RDS automated backups: daily snapshots + transaction logs retained 0-35 days. Point-in-time recovery restores to any second within the retention window. Manual snapshots persist until deleted",
    "DynamoDB on-demand mode is best for unpredictable workloads or new tables. Switch to provisioned mode with auto-scaling once patterns are established — it's significantly cheaper for steady-state",
    "Redshift uses columnar storage and massively parallel processing. RA3 nodes separate compute from storage (managed S3). Concurrency Scaling adds transient clusters for read bursts at no extra cost (1 hour free/day per cluster)",
    "DynamoDB TransactWriteItems supports up to 100 items (25 in a single call) across tables in the same region. Transactions consume 2x the WCUs of non-transactional writes",
    "Aurora Serverless v2 scales in 0.5 ACU increments with near-instant response. Set min ACU to 0.5 for dev (costs ~$43/month) and appropriate max for production to control costs"
  ],

  resources: [
    { label: "Alex DeBrie — The DynamoDB Book", kind: "book", note: "The definitive guide to DynamoDB single-table design, access patterns, and advanced modeling techniques" },
    { label: "Amazon Builders' Library: Avoiding fallback in distributed systems", kind: "article", note: "Deep dive into caching strategies, cache stampede prevention, and graceful degradation patterns" },
    { label: "AWS re:Invent — Amazon Aurora Under the Hood (DAT320)", kind: "video", note: "Internal architecture of Aurora: quorum writes, log-structured storage, and the separation of compute and storage" },
    { label: "AWS Database Migration Service documentation", kind: "docs", note: "Official guide for migrating databases to AWS — schema conversion, continuous replication, and validation" },
    { label: "aws-samples/aws-dynamodb-examples GitHub", kind: "repo", note: "Official AWS DynamoDB examples including single-table design patterns, streams processing, and DAX integration" }
  ],

  diagrams: [
    {
      title: "AWS Database Services Architecture",
      kind: "architecture",
      caption: "Overview of AWS managed database services grouped by type: relational, NoSQL, in-memory, and purpose-built.",
      mermaid: `graph TB
    subgraph Relational["Relational"]
      RDS["RDS\nMySQL, Postgres, Oracle, SQL Server"]
      AURORA["Aurora\nMySQL and Postgres compatible"]
    end
    subgraph NoSQL["NoSQL"]
      DYNAMO["DynamoDB\nKey-value and document"]
      DOCDB["DocumentDB\nMongoDB compatible"]
    end
    subgraph InMemory["In-Memory"]
      REDIS["ElastiCache Redis\nCache and sessions"]
      MEMCACHED["ElastiCache Memcached\nSimple caching"]
    end
    subgraph PurposeBuilt["Purpose-Built"]
      NEPTUNE["Neptune\nGraph database"]
      TIMESTREAM["Timestream\nTime-series data"]
      QLDB["QLDB\nImmutable ledger"]
    end
    App["Application"] --> Relational
    App --> NoSQL
    App --> InMemory
    App --> PurposeBuilt`,
    },
    {
      title: "Choosing an AWS Database",
      kind: "flow",
      caption: "Decision tree for selecting the right AWS database service based on data model, access pattern, and scale requirements.",
      mermaid: `flowchart TD
    Start["What is your data model?"] --> Q1{"Structured\nrelational data?"}
    Q1 -->|Yes| Q2{"Need high\nautoscaling?"}
    Q2 -->|Yes| AURORA["Aurora Serverless v2\nAuto-scales capacity"]
    Q2 -->|No| RDS["RDS\nManaged relational DB"]
    Q1 -->|No| Q3{"Key-value or\ndocument?"}
    Q3 -->|Yes| Q4{"Massive scale\nsingle-digit ms?"}
    Q4 -->|Yes| DYNAMO["DynamoDB\nManaged NoSQL"]
    Q4 -->|No| DOCDB["DocumentDB\nMongoDB workloads"]
    Q3 -->|No| Q5{"Graph\nrelationships?"}
    Q5 -->|Yes| NEPTUNE["Neptune\nGraph queries"]
    Q5 -->|No| Q6{"Time-series\ndata?"}
    Q6 -->|Yes| TIMESTREAM["Timestream\nTime-series optimised"]
    Q6 -->|No| REDIS["ElastiCache Redis\nCaching layer"]`,
    },
    {
      title: "Aurora Storage Architecture",
      kind: "architecture",
      caption: "6-way replication across 3 AZs with quorum writes requiring 4 of 6 and quorum reads requiring 3 of 6 storage nodes.",
      mermaid: `graph TB
    Writer["Aurora Writer Instance"]
    Reader1["Aurora Reader 1"]
    Reader2["Aurora Reader 2"]
    subgraph AZ1["Availability Zone A"]
      S1["Storage Node 1"]
      S2["Storage Node 2"]
    end
    subgraph AZ2["Availability Zone B"]
      S3["Storage Node 3"]
      S4["Storage Node 4"]
    end
    subgraph AZ3["Availability Zone C"]
      S5["Storage Node 5"]
      S6["Storage Node 6"]
    end
    Writer -->|Write quorum 4 of 6| S1
    Writer --> S2
    Writer --> S3
    Writer --> S4
    Writer --> S5
    Writer --> S6
    Reader1 -->|Read quorum 3 of 6| S1
    Reader2 -->|Read quorum 3 of 6| S3`,
    },
    {
      title: "DynamoDB Key Concepts",
      kind: "mindmap",
      caption: "Mind map of DynamoDB features covering data model, capacity modes, indexes, and advanced capabilities.",
      mermaid: `mindmap
  root((DynamoDB))
    Data Model
      Table
      Item rows
      Partition Key required
      Sort Key optional
      Attributes schemaless
    Capacity Modes
      On-Demand auto-scales
      Provisioned RCU and WCU
      Auto Scaling
    Indexes
      GSI Global Secondary Index
      LSI Local Secondary Index
    Advanced Features
      DynamoDB Streams CDC
      DAX in-memory cache
      Transactions ACID
      TTL automatic expiry
      Point-in-time recovery`,
    },
  ],

  animations: [
    {
      title: "Cache-Aside Pattern with ElastiCache",
      steps: [
        { label: "Application receives read request", detail: "A user requests product details for product_id=789. The application first checks ElastiCache Redis for the key 'product:789'." },
        { label: "Cache miss", detail: "Redis returns nil — the product is not cached. This is a cache miss. The application must fall back to the primary database." },
        { label: "Query the database", detail: "Application queries Aurora PostgreSQL: SELECT * FROM products WHERE id = 789. The database returns the full product record in ~5ms." },
        { label: "Populate the cache", detail: "Application writes the product data to Redis: SET product:789 '{...}' EX 3600. The EX flag sets a 1-hour TTL to ensure eventual consistency with the database." },
        { label: "Return response", detail: "Application returns the product data to the user. Total latency: ~8ms (Redis check + DB query + Redis write)." },
        { label: "Subsequent cache hit", detail: "Next request for product_id=789 finds data in Redis (cache hit). Redis returns the cached JSON in ~0.5ms. Database is not queried. Hit rate improves over time as the working set is cached." }
      ]
    }
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
