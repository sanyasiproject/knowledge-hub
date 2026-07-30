import type { TopicContent } from "../types";

export const sharding: TopicContent = {
  quickSummary: [
    "Sharding partitions data across multiple database instances (shards) so each holds a subset, enabling horizontal scaling beyond the capacity of a single machine.",
    "Range-based sharding splits data by value ranges (e.g., A-M, N-Z), hash-based sharding distributes by hash of the key, and directory-based sharding uses a lookup table.",
    "Resharding (adding or removing shards) is one of the most operationally complex tasks in distributed systems, requiring careful data migration with minimal downtime.",
    "Cross-shard queries and transactions are expensive and complex, making shard key selection the most critical design decision in a sharded architecture.",
  ],
  detailed: [
    `## Why Shard?

A single database node has finite capacity: CPU, memory, storage, and connection limits. Vertical scaling reaches a ceiling, and read replicas only help with read-heavy workloads. Sharding is the path to horizontal write scaling.

Each shard is an independent database instance holding a partition of the data. Sharding enables:

- **Write scalability**: writes are distributed across shards.
- **Storage scalability**: total data can exceed what one machine can hold.
- **Query performance**: queries touching a single shard scan less data.
- **Isolation**: a hot shard does not degrade other shards.

The cost is significant complexity in application logic, operational tooling, and query patterns. Shard only when you have exhausted simpler options: indexing, query optimization, caching, read replicas, and vertical scaling.`,

    `## Sharding Strategies

**Range-based sharding**: partition by contiguous value ranges of the shard key.
- Example: users with IDs 1-1M on shard 1, 1M-2M on shard 2.
- Pros: range queries are efficient (data is co-located), easy to understand.
- Cons: hotspots if writes cluster in one range (e.g., new users always hit the last shard).

**Hash-based sharding**: apply a hash function to the shard key, then mod by shard count.
- Example: shard = hash(userId) % numShards.
- Pros: even distribution of data and load.
- Cons: range queries require scatter-gather across all shards. Adding shards remaps most keys (mitigated by consistent hashing).

**Directory-based sharding**: a lookup service maps each key to its shard.
- Example: a mapping table stores {userId -> shardId}.
- Pros: flexible — can move individual entities between shards for rebalancing.
- Cons: the directory is a single point of failure and a potential bottleneck; must be cached aggressively.

**Compound/hierarchical sharding**: shard by tenant, then by entity within tenant. Common in multi-tenant SaaS.`,

    `## Shard Key Selection

The shard key determines how data is distributed and what queries are efficient. It is the most impactful design decision:

**Good shard key properties**:
- **High cardinality**: many distinct values for even distribution.
- **Even distribution**: no single value dominates (avoid sharding by country if 60% of users are in one country).
- **Query alignment**: most queries include the shard key, avoiding cross-shard scatter.
- **Stable**: the key should not change frequently (reshuffling data is expensive).

**Common shard keys**:
- \`userId\` or \`accountId\`: good for user-centric applications.
- \`tenantId\`: natural for multi-tenant SaaS.
- \`orderId\`: works if most queries are order-scoped.

**Anti-patterns**:
- Sharding by timestamp: all writes go to the latest shard (hotspot).
- Sharding by a low-cardinality field like status or country.
- Choosing a key that most queries do not include.`,

    `## Resharding

Resharding — changing the number of shards or redistributing data — is necessary when:
- A shard reaches capacity.
- Load becomes unbalanced across shards.
- The sharding scheme needs to change.

**Approaches**:

- **Double-and-migrate**: add new shards, migrate data in the background while dual-writing, then cut over. Requires application-level routing changes.
- **Consistent hashing with virtual nodes**: adding a physical node only moves data from its neighbors on the hash ring. Virtual nodes ensure even distribution.
- **Logical sharding**: over-provision logical shards (e.g., 1024) mapped to fewer physical nodes. Resharding means reassigning logical-to-physical mappings without moving the logical boundaries.
- **Vitess / ProxySQL**: middleware that manages shard routing, schema changes, and resharding for MySQL.

Best practice: plan for resharding from day one by using logical shards. Starting with hash(key) % 4 makes expanding to 8 shards require moving half the data. Starting with 256 logical shards mapped to 4 physical nodes means expanding to 8 just reassigns logical shard mappings.`,

    `## Cross-Shard Queries and Transactions

Operations spanning multiple shards are the primary source of complexity:

**Cross-shard queries**: require scatter-gather (send query to all shards, merge results). This increases latency (slowest shard determines response time), consumes more connections, and complicates sorting/pagination.

**Cross-shard transactions**: require distributed coordination (two-phase commit or saga pattern). 2PC adds latency and a coordinator as a failure point. Sagas use compensating transactions but sacrifice atomicity.

**Mitigation strategies**:
- **Co-locate related data**: if orders and order items are always queried together, shard both by the same key (e.g., userId).
- **Denormalize**: store pre-computed aggregates so that common queries hit a single shard.
- **Secondary indexes**: maintain a separate index mapping non-shard-key fields to shard locations.
- **Accept eventual consistency**: for analytics and reporting, use a replicated read store (data warehouse) that aggregates across all shards.
- **CQRS**: separate the write model (sharded) from the read model (denormalized, potentially unsharded).`,
  ],
  interviewQA: [
    {
      q: "How do you choose a shard key for a multi-tenant e-commerce platform?",
      a: "Use tenantId as the primary shard key. It has high cardinality (many tenants), aligns with most queries (which are tenant-scoped), and provides natural isolation between tenants. Co-locate all tenant data (orders, products, customers) on the same shard to avoid cross-shard joins. For very large tenants, consider a compound key (tenantId + entityId hash) to spread their data across multiple shards. Monitor shard sizes and use logical sharding to simplify future rebalancing.",
    },
    {
      q: "What is the difference between hash-based and range-based sharding?",
      a: "Range-based sharding splits data by contiguous value ranges, making range queries efficient but risking hotspots when writes cluster at one end. Hash-based sharding distributes data evenly by hashing the key, eliminating hotspots but making range queries require scatter-gather across all shards. Choose range-based when range queries are common and write distribution is uniform. Choose hash-based when even distribution matters more than range query efficiency.",
    },
    {
      q: "How would you handle resharding with minimal downtime?",
      a: "Use logical sharding: pre-allocate many logical shards (e.g., 256 or 1024) mapped to fewer physical nodes. Resharding becomes reassigning logical-to-physical mappings rather than recomputing shard boundaries. For the data migration itself, use a dual-write approach: start writing to both old and new locations, backfill historical data in the background, verify consistency, then switch reads and stop writing to the old location. Tools like Vitess automate this for MySQL-based systems.",
    },
    {
      q: "Why are cross-shard transactions problematic and how do you avoid them?",
      a: "Cross-shard transactions require distributed coordination like two-phase commit, which adds latency, introduces a coordinator as a failure point, and reduces throughput. Avoid them by co-locating related data on the same shard (shard orders and order items by the same key), denormalizing data to eliminate joins, and using saga patterns with compensating transactions where atomicity can be relaxed. For analytics requiring cross-shard data, replicate to a data warehouse rather than querying shards directly.",
    },
  ],
  mcqs: [
    {
      q: "What is the main disadvantage of hash-based sharding?",
      options: [
        "Uneven data distribution",
        "Range queries require scatter-gather across all shards",
        "High memory overhead",
        "Requires a directory service",
      ],
      answerIndex: 1,
      explanation:
        "Hash-based sharding distributes data evenly but destroys key ordering, so range queries (e.g., 'all orders from last week') must be sent to all shards and results merged.",
    },
    {
      q: "Why is logical sharding recommended from the start?",
      options: [
        "It reduces query latency",
        "It simplifies resharding by reassigning logical-to-physical mappings",
        "It eliminates the need for a shard key",
        "It provides automatic load balancing",
      ],
      answerIndex: 1,
      explanation:
        "With logical sharding, the boundaries are fixed (e.g., 256 logical shards). Adding physical nodes only requires reassigning which logical shards map to which physical node, without recomputing shard boundaries or moving all data.",
    },
    {
      q: "Which shard key would cause a write hotspot in a time-series application?",
      options: [
        "Device ID",
        "Timestamp",
        "Region + Device ID hash",
        "Random UUID",
      ],
      answerIndex: 1,
      explanation:
        "Sharding by timestamp causes all current writes to go to the shard holding the latest time range, creating a hotspot. The other options distribute writes more evenly.",
    },
    {
      q: "What is scatter-gather in the context of sharding?",
      options: [
        "A data replication strategy",
        "Sending a query to all shards and merging their results",
        "A method for distributing writes evenly",
        "A backup and recovery technique",
      ],
      answerIndex: 1,
      explanation:
        "Scatter-gather sends a query to all shards in parallel (scatter), waits for all responses, and merges results (gather). It is necessary when the query cannot be routed to a single shard.",
    },
  ],
  flashcards: [
    {
      front: "What are the three main sharding strategies?",
      back: "Range-based (split by value ranges), Hash-based (distribute by key hash), and Directory-based (lookup table maps keys to shards).",
    },
    {
      front: "What makes a good shard key?",
      back: "High cardinality, even distribution, alignment with common queries, and stability (does not change frequently).",
    },
    {
      front: "What is logical sharding?",
      back: "Pre-allocating many logical shard slots (e.g., 256) mapped to fewer physical nodes. Resharding becomes reassigning mappings rather than recomputing boundaries.",
    },
    {
      front: "Why is sharding by timestamp an anti-pattern?",
      back: "All current writes go to the latest shard, creating a hotspot. Only the most recent shard receives write traffic while others sit idle.",
    },
    {
      front: "What is scatter-gather?",
      back: "A query pattern where the request is sent to all shards in parallel, and results are merged. Required when the query does not include the shard key.",
    },
    {
      front: "How do you handle cross-shard joins?",
      back: "Co-locate related data on the same shard, denormalize to avoid joins, use a secondary index, or replicate to a data warehouse for analytics queries.",
    },
    {
      front: "What is Vitess?",
      back: "A database middleware for MySQL that manages shard routing, schema changes, and online resharding, originally built at YouTube.",
    },
  ],
  glossary: [
    {
      term: "Sharding",
      definition:
        "Horizontally partitioning data across multiple database instances so each holds a subset, enabling write scalability beyond a single machine.",
    },
    {
      term: "Shard Key",
      definition:
        "The field used to determine which shard a piece of data belongs to. Its selection is the most critical design decision in a sharded system.",
    },
    {
      term: "Range-Based Sharding",
      definition:
        "Partitioning data by contiguous value ranges of the shard key, enabling efficient range queries but risking hotspots.",
    },
    {
      term: "Hash-Based Sharding",
      definition:
        "Partitioning data by applying a hash function to the shard key, providing even distribution but requiring scatter-gather for range queries.",
    },
    {
      term: "Resharding",
      definition:
        "The process of changing the number of shards or redistributing data across shards, typically to address capacity or load imbalance.",
    },
    {
      term: "Scatter-Gather",
      definition:
        "A query pattern that sends a request to all shards in parallel and merges their results, necessary when queries do not include the shard key.",
    },
    {
      term: "Logical Sharding",
      definition:
        "Pre-allocating many logical shard slots mapped to fewer physical nodes, simplifying future resharding by reassigning mappings rather than recomputing boundaries.",
    },
  ],
};
