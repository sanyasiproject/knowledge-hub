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
  followUps: [
    "How do you choose a shard key, and why is it nearly irreversible?",
    "How do you rebalance without downtime?",
    "What happens to a query that doesn't include the shard key?",
    "How do you handle a tenant that's a thousand times bigger than the rest?",
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
  deepDive: [
    `## Consistent Hashing and Virtual Nodes

**Consistent hashing** is the backbone of modern hash-based sharding, solving the catastrophic data migration problem that arises with naive \`hash(key) % N\` when *N* changes. In a consistent hashing ring, both **shard nodes** and **data keys** are mapped onto the same circular hash space (typically \`0\` to \`2^32 - 1\`). Each key is assigned to the *first node encountered* when walking clockwise from the key's position on the ring. When a node is added or removed, only the keys in the adjacent arc are remapped — roughly \`1/N\` of the total data — rather than the majority of keys as in modular hashing. However, raw consistent hashing can produce **uneven partitions** because nodes are placed at arbitrary points on the ring. **Virtual nodes** (vnodes) fix this: each physical node is represented by *many* points (e.g., 150-256 tokens) scattered across the ring, which statistically smooths out the distribution. Apache Cassandra, Amazon DynamoDB, and Riak all rely on vnodes. The trade-off is a larger routing table (\`numPhysicalNodes * vnodesFactor\` entries), but this table is small enough to fit entirely in memory on any modern machine.`,

    `## Shard-Aware Application Architecture

Building applications on top of a sharded data store requires **shard-aware routing** at the application layer unless an intermediate proxy (like *Vitess*, *ProxySQL*, or *mongos*) handles it transparently. The application must compute the target shard from the shard key embedded in every query and route the request to the correct connection pool. This introduces several architectural concerns: **connection fan-out** (the app must maintain connection pools to every shard, consuming file descriptors and memory), **retry semantics** (failures on one shard should not block queries to healthy shards), and **result aggregation** (scatter-gather queries must merge, sort, and paginate results from multiple shards in the application layer). A common pattern is a *shard router* service that encapsulates the hashing logic and connection management behind a clean API, so that domain services remain shard-unaware. In microservice architectures, the router can be a **sidecar proxy** or a **shared library**. Care must be taken to keep the shard map in sync across all instances — stale maps cause misdirected queries, leading to empty results or writes to the wrong shard.`,

    `## Operational Challenges: Monitoring, Hotspots, and Failure Domains

Running a sharded cluster in production demands **per-shard observability**. Each shard must be monitored independently for disk usage, query latency percentiles (\`p50\`, \`p95\`, \`p99\`), replication lag, connection count, and lock contention. A shard that is 80% full while others are at 40% signals an **imbalanced shard key** or organic data skew. **Hotspot detection** requires tracking write and read rates per shard and, ideally, per key-range within a shard. Google Cloud Spanner, for example, automatically *splits* hot ranges without manual intervention. For self-managed systems, tooling must detect hotspots and trigger resharding workflows. **Failure domain isolation** is another critical concern: if all shards share the same physical rack, a single power or network failure takes down the entire system. Best practice is to spread shards across *availability zones* or *racks* and to maintain **at least one replica per shard** in a different failure domain. Backup strategies must also be shard-aware — restoring a single shard from backup while others remain live introduces consistency windows that must be accounted for in the application's data contract.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Consistent Hashing Ring with Virtual Nodes in C++",
      source: `#include <map>
#include <string>
#include <functional>
#include <vector>
#include <stdexcept>

class ConsistentHashRing {
private:
    // Sorted map: hash-position -> physical node name
    std::map<size_t, std::string> ring_;
    int vnodes_per_node_;
    std::hash<std::string> hasher_;

public:
    explicit ConsistentHashRing(int vnodes_per_node = 150)
        : vnodes_per_node_(vnodes_per_node) {}

    // Add a physical node with its virtual nodes
    void addNode(const std::string& node) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            std::string vnode_key = node + "#vnode" + std::to_string(i);
            size_t hash_val = hasher_(vnode_key);
            ring_[hash_val] = node;
        }
    }

    // Remove a physical node and all its virtual nodes
    void removeNode(const std::string& node) {
        for (int i = 0; i < vnodes_per_node_; ++i) {
            std::string vnode_key = node + "#vnode" + std::to_string(i);
            size_t hash_val = hasher_(vnode_key);
            ring_.erase(hash_val);
        }
    }

    // Route a key to the appropriate shard node
    std::string getNode(const std::string& key) const {
        if (ring_.empty()) {
            throw std::runtime_error("Hash ring is empty");
        }
        size_t hash_val = hasher_(key);
        // Find the first node at or after this hash position
        auto it = ring_.lower_bound(hash_val);
        // Wrap around to the beginning if past the last node
        if (it == ring_.end()) {
            it = ring_.begin();
        }
        return it->second;
    }

    size_t nodeCount() const {
        // Unique physical nodes
        std::set<std::string> nodes;
        for (const auto& [_, node] : ring_) {
            nodes.insert(node);
        }
        return nodes.size();
    }
};

// Usage:
// ConsistentHashRing ring(150);
// ring.addNode("shard-01.db.internal");
// ring.addNode("shard-02.db.internal");
// ring.addNode("shard-03.db.internal");
// std::string target = ring.getNode("user:48291");
// // target == "shard-02.db.internal" (deterministic)`,
    },
    {
      language: "cpp",
      caption: "Shard Router: routing queries by shard key hash in C++",
      source: `#include <string>
#include <vector>
#include <functional>
#include <iostream>

struct ShardConfig {
    std::string host;
    int port;
    std::string db_name;
};

class ShardRouter {
private:
    std::vector<ShardConfig> shards_;
    std::hash<std::string> hasher_;

public:
    explicit ShardRouter(std::vector<ShardConfig> shards)
        : shards_(std::move(shards)) {}

    // Determine which shard owns a given key
    const ShardConfig& resolve(const std::string& shard_key) const {
        size_t hash_val = hasher_(shard_key);
        size_t shard_index = hash_val % shards_.size();
        return shards_[shard_index];
    }

    // Scatter-gather: run a query across ALL shards
    // Returns results from each shard for client-side merge
    template <typename QueryFn>
    std::vector<std::string> scatterGather(QueryFn query_fn) const {
        std::vector<std::string> results;
        results.reserve(shards_.size());
        for (const auto& shard : shards_) {
            // In production, these would run in parallel threads
            results.push_back(query_fn(shard));
        }
        return results;
    }
};

// Usage:
// ShardRouter router({
//     {"shard1.db.internal", 5432, "app_shard_0"},
//     {"shard2.db.internal", 5432, "app_shard_1"},
//     {"shard3.db.internal", 5432, "app_shard_2"},
//     {"shard4.db.internal", 5432, "app_shard_3"},
// });
// auto& target = router.resolve("user:98321");
// std::cout << "Route to: " << target.host << std::endl;`,
    },
    {
      language: "javascript",
      caption: "MongoDB Sharded Cluster Configuration",
      source: `// ---- MongoDB Sharding Setup Commands ----

// 1. Start config server replica set (stores shard metadata)
// mongod --configsvr --replSet configRS --port 27019 --dbpath /data/configdb

// 2. Start shard replica sets
// mongod --shardsvr --replSet shard01RS --port 27018 --dbpath /data/shard01
// mongod --shardsvr --replSet shard02RS --port 27020 --dbpath /data/shard02

// 3. Start mongos router (application connects here)
// mongos --configdb configRS/cfg1:27019,cfg2:27019,cfg3:27019 --port 27017

// 4. Connect to mongos and configure sharding:

// Add shards to the cluster
sh.addShard("shard01RS/shard01a:27018,shard01b:27018");
sh.addShard("shard02RS/shard02a:27020,shard02b:27020");

// Enable sharding on the database
sh.enableSharding("ecommerce");

// Shard the 'orders' collection using HASHED shard key
// Hashed keys provide even distribution across shards
sh.shardCollection("ecommerce.orders", { userId: "hashed" });

// Shard the 'products' collection using RANGE shard key
// Range keys support efficient range queries on the key
sh.shardCollection("ecommerce.products", { category: 1, _id: 1 });

// Check shard distribution status
db.orders.getShardDistribution();

// View chunk distribution across shards
use config;
db.chunks.aggregate([
  { $match: { ns: "ecommerce.orders" } },
  { $group: { _id: "$shard", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// Pre-split chunks for known high-cardinality ranges
// (avoids initial hotspot on a single shard)
sh.splitAt("ecommerce.products", { category: "electronics", _id: MinKey });
sh.splitAt("ecommerce.products", { category: "clothing", _id: MinKey });

// Set chunk size (default 128 MB, lower for faster balancing)
use config;
db.settings.updateOne(
  { _id: "chunksize" },
  { $set: { value: 64 } },
  { upsert: true }
);

// Monitor the balancer
sh.isBalancerRunning();
sh.getBalancerState();`,
    },
  ],

  diagrams: [
    {
      title: "Horizontal Sharding Architecture",
      kind: "architecture",
      caption: "Data is distributed across multiple shard nodes. A routing layer maps each key to the correct shard using a sharding strategy.",
      mermaid: `graph TD
    Client[Application] --> Router[Shard Router]
    Router --> S1[Shard 1 - users A-F]
    Router --> S2[Shard 2 - users G-M]
    Router --> S3[Shard 3 - users N-S]
    Router --> S4[Shard 4 - users T-Z]
    S1 --> R1[(Replica 1)]
    S2 --> R2[(Replica 2)]
    S3 --> R3[(Replica 3)]
    S4 --> R4[(Replica 4)]`,
    },
    {
      title: "Hash vs Range Sharding",
      kind: "flow",
      caption: "Hash sharding distributes keys evenly but loses ordering. Range sharding preserves ordering and enables range queries but can create hot shards.",
      mermaid: `flowchart TD
    A([Shard key: user_id]) --> B{Sharding strategy}
    B -->|Hash sharding| C["shard = hash(user_id) mod N"]
    C --> D[Even distribution]
    D --> E[No range queries across shards]
    B -->|Range sharding| F[shard = range table lookup]
    F --> G[Preserves ordering]
    G --> H[Supports range scans]
    H --> I{Traffic distribution?}
    I -->|Uneven writes| J[Hot shard problem]
    I -->|Uniform| K[Works well]`,
    },
    {
      title: "Consistent Hashing Ring",
      kind: "network",
      caption: "Consistent hashing places nodes on a virtual ring. Keys map to the nearest node clockwise. Adding or removing a node minimizes key redistribution.",
      mermaid: `graph LR
    subgraph Ring["Consistent Hash Ring"]
      K1[Key A - hash 10] --> N1[Node 1 - pos 20]
      K2[Key B - hash 35] --> N2[Node 2 - pos 50]
      K3[Key C - hash 60] --> N3[Node 3 - pos 80]
      K4[Key D - hash 90] --> N1
    end
    NewNode[New Node - pos 40] -.->|Takes keys 20-40 from Node 2| N2
    Note1[Only 1 of N keys move on node add or remove] -.-> Ring`,
    },
    {
      title: "Resharding Process",
      kind: "sequence",
      caption: "Online resharding migrates data from existing shards to new shards without downtime using dual-write and background migration techniques.",
      mermaid: `sequenceDiagram
    participant App
    participant Router
    participant OldShard as Old Shards x4
    participant NewShard as New Shards x8

    Note over App,NewShard: Phase 1 - Dual write
    App->>Router: Write to key K
    Router->>OldShard: Write to old shard
    Router->>NewShard: Write to new shard
    Note over OldShard,NewShard: Background migration copies existing data
    Note over App,NewShard: Phase 2 - Cut over reads
    App->>Router: Read key K
    Router->>NewShard: Read from new shard
    Note over App,NewShard: Phase 3 - Stop writing to old shards
    App->>Router: Write to key K
    Router->>NewShard: Write only to new shard`,
    },
  ],

  animations: [
    {
      title: "Choosing a shard key, and the hot shard",
      steps: [
        {
          label: "Shard by tenant id",
          detail: "Seems natural — each customer's data stays together, so queries are single-shard.",
        },
        {
          label: "Traffic arrives",
          detail: "One enterprise customer is 1,000× the size of the median.",
        },
        {
          label: "Hot shard",
          detail: "That shard saturates while the rest idle. Cluster capacity is now the capacity of one node.",
        },
        {
          label: "Can't just rekey",
          detail: "Changing the shard key means migrating everything, live.",
        },
        {
          label: "Mitigation",
          detail: "Sub-shard large tenants on a secondary dimension, or give them dedicated infrastructure.",
        },
        {
          label: "The lesson",
          detail: "Examine the key's distribution — and its worst case — before committing. It's nearly irreversible.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Range-Based Sharding",
      "Hash-Based Sharding",
      "Directory-Based Sharding",
    ],
    rows: [
      [
        "**Distribution method**",
        "Contiguous value ranges of the shard key",
        "Hash function applied to the shard key, modulo shard count",
        "Explicit lookup table mapping each key to a shard",
      ],
      [
        "**Data distribution**",
        "Can be *uneven* if key values are skewed",
        "**Even** across shards by design",
        "Depends on how entries are assigned; can be tuned manually",
      ],
      [
        "**Range query support**",
        "**Excellent** — co-located data within ranges",
        "*Poor* — requires scatter-gather across all shards",
        "*Moderate* — depends on how ranges are mapped in the directory",
      ],
      [
        "**Hotspot risk**",
        "**High** — monotonic keys (timestamps, auto-increment) cause all writes to one shard",
        "**Low** — hash function disperses keys uniformly",
        "**Low** — can manually rebalance by reassigning directory entries",
      ],
      [
        "**Resharding complexity**",
        "Splitting a range requires data migration and boundary updates",
        "Adding a shard remaps ~`1/N` keys (with consistent hashing) or *all* keys (naive mod)",
        "**Simplest** — update the directory entries, then migrate data",
      ],
      [
        "**Operational overhead**",
        "Low metadata; boundary list is small",
        "Low metadata; hash function is stateless",
        "**High** — directory must be highly available, cached, and kept in sync",
      ],
      [
        "**Best suited for**",
        "Time-series with uniform write rates; lexicographic scans",
        "User-centric workloads needing even write distribution",
        "Multi-tenant SaaS with per-tenant shard placement needs",
      ],
    ],
  },

  exercises: [
    "**Design a shard key** for a social media platform where the primary queries are: (a) fetch a user's posts, (b) fetch a user's timeline (posts from followed users), and (c) search posts by hashtag. Discuss the trade-offs of sharding by `userId` vs. `postId` vs. a compound key. Which queries become cross-shard, and how would you mitigate that?",
    "**Implement a minimal consistent hashing ring** in your language of choice. Support `addNode(nodeId)`, `removeNode(nodeId)`, and `getNode(key)`. Write tests that verify: (1) adding a 4th node to a 3-node ring moves approximately 25% of 10,000 test keys, and (2) removing a node redistributes only that node's keys to its clockwise neighbor.",
    "**Capacity planning exercise**: You have a 4-shard PostgreSQL cluster. Each shard can hold 500 GB and handle 5,000 write TPS. Your data is growing at 50 GB/month and writes are increasing 10% monthly. Calculate when you will need to reshard to 8 shards, and describe the migration strategy you would use (dual-write, logical sharding, or Vitess-style online resharding).",
    "**Cross-shard query optimization**: Given an e-commerce database sharded by `userId`, design an efficient way to answer the query *\"top 10 best-selling products this week\"* without scanning all shards on every request. Consider denormalization, materialized views, or a separate analytics pipeline. Sketch the data flow and explain the consistency guarantees.",
    "**Failure scenario analysis**: In a 5-shard cluster with no replicas, one shard's disk fails. Describe the impact on the system (which queries fail, which succeed), the recovery steps, and the architectural changes you would recommend to prevent this from being a catastrophic event.",
  ],

  cheatSheet: [
    "**Shard key selection rule of thumb**: pick a field with *high cardinality*, *even distribution*, and that appears in **most queries** — the trifecta is `userId`/`tenantId` for user-centric apps.",
    "**Consistent hashing formula**: position on ring = `hash(nodeId + \"#vnode\" + i)` for `i` in `[0, vnodes_per_node)`. Keys route to the *first node clockwise* from `hash(key)`.",
    "**Logical sharding shortcut**: start with 256+ logical shards mapped to fewer physical nodes. Resharding = reassigning mappings, *not* recomputing boundaries or migrating all data.",
    "**Cross-shard query cost**: scatter-gather latency = `max(shard_latencies)` + merge overhead. Avoid by co-locating related data and denormalizing for common access patterns.",
    "**MongoDB sharding commands**: `sh.enableSharding(\"db\")`, `sh.shardCollection(\"db.col\", { key: \"hashed\" })`, `sh.status()` to inspect chunk distribution.",
    "**Hotspot detection signal**: if one shard's write TPS is >2x the average, investigate the shard key distribution — likely a low-cardinality or monotonic key problem.",
  ],

  revisionNotes: [
    "Sharding enables **horizontal write scaling** by partitioning data across multiple database instances. It is a last resort after indexing, caching, query optimization, and read replicas have been exhausted.",
    "The three core strategies are **range-based** (efficient range queries, hotspot risk), **hash-based** (even distribution, no range queries), and **directory-based** (flexible placement, operational overhead from the lookup service).",
    "**Shard key selection** is the single most impactful design decision: choose a key with high cardinality, even distribution, and alignment with the dominant query patterns. Changing the shard key later requires a full data migration.",
    "**Consistent hashing with virtual nodes** minimizes data movement during resharding — adding a node moves only ~`1/N` of keys. **Logical sharding** (many logical shards mapped to fewer physical nodes) further simplifies resharding to a metadata-only operation.",
    "**Cross-shard operations** (scatter-gather queries, distributed transactions) are the primary source of complexity. Mitigate by co-locating related entities, denormalizing, and separating analytical workloads into a replicated read store (CQRS pattern).",
  ],

  resources: [
    {
      label: "Designing Data-Intensive Applications — Martin Kleppmann",
      kind: "book",
    },
    {
      label: "Vitess documentation — sharding",
      kind: "docs",
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
