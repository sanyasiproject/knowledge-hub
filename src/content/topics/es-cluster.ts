import type { TopicContent } from "../types";

export const esCluster: TopicContent = {
  quickSummary: [
    "An Elasticsearch cluster is a group of nodes that collectively store data and provide search and indexing capabilities. Each index is divided into shards -- the basic unit of data distribution. Primary shards hold the original data, and replica shards are copies distributed across different nodes for fault tolerance and read throughput.",
    "Cluster health is reported as green (all primary and replica shards assigned), yellow (all primaries assigned but some replicas unassigned -- typically a single-node cluster), or red (some primary shards unassigned -- data loss risk, search results may be incomplete). Monitoring cluster health is the first diagnostic step for any Elasticsearch issue.",
    "The master node manages cluster state: creating/deleting indices, tracking which shards are on which nodes, and making allocation decisions. Split brain (two masters simultaneously) is prevented by requiring a quorum of master-eligible nodes. Since Elasticsearch 7.0, this is handled automatically by the cluster coordination layer.",
    "Shard allocation determines which shards live on which nodes. Elasticsearch balances shards across nodes automatically, considering disk space, shard count per node, and allocation awareness settings (e.g., distribute replicas across availability zones). The allocation decider framework controls these decisions.",
    "Index Lifecycle Management (ILM) automates the progression of indices through phases: hot (actively written and queried), warm (read-only, less frequent queries), cold (infrequent access, cheaper storage), frozen (rarely accessed, searchable snapshots), and delete. ILM is essential for managing time-series data like logs and metrics cost-effectively."
  ],

  detailed: [
    "## Node Roles\n\nElasticsearch nodes can serve multiple roles. **Master-eligible** nodes participate in master elections and manage cluster state (index creation/deletion, shard allocation). Dedicate 3 master-eligible nodes for production. **Data** nodes store shards and execute queries and aggregations -- they do the heavy lifting. Sub-roles include data_hot, data_warm, data_cold, and data_frozen for tiered architectures. **Ingest** nodes run ingest pipelines (document transformation before indexing). **Coordinating-only** nodes (no roles assigned) act as smart load balancers: they receive requests, route to relevant data nodes, and merge results. They are useful for heavy aggregation workloads. **ML** nodes run machine learning jobs. **Transform** nodes run transforms (continuous aggregation). **Remote cluster client** nodes connect to remote clusters for cross-cluster search and replication. In production, separate master and data roles to prevent heavy indexing from destabilizing cluster management.",

    "## Shards: Primary and Replica\n\nWhen you create an index, you specify the number of primary shards (default 1 since ES 7.0, was 5 previously). Each primary shard is an independent Lucene index. The number of primary shards is fixed at index creation and cannot be changed (use the _split or _shrink API for this, which creates a new index). Replica shards are copies of primary shards placed on different nodes. Replicas serve two purposes: (1) fault tolerance -- if a node holding a primary shard fails, a replica is promoted to primary, and (2) read throughput -- search requests can be served by any copy (primary or replica). Shard sizing matters: each shard has overhead (file handles, memory, thread pools). Too many small shards waste resources; too few large shards limit parallelism and recovery speed. The recommended shard size is 10-50 GB. A common formula: number_of_primary_shards = ceil(expected_data_size / target_shard_size).",

    "## Master Election and Split Brain Prevention\n\nBefore Elasticsearch 7.0, split brain was prevented by setting discovery.zen.minimum_master_nodes to a quorum (master_eligible_nodes / 2 + 1). Misconfiguring this could cause two partitions to each elect a master, leading to divergent cluster states and data corruption. Since 7.0, Elasticsearch uses a new cluster coordination layer that automatically manages the quorum. The initial_master_nodes setting is only needed for bootstrapping a brand-new cluster. After the first election, the cluster remembers its master-eligible nodes. The election algorithm uses a voting configuration that is automatically updated as nodes join/leave. A master candidate must receive votes from a majority of the voting configuration. Term numbers prevent stale masters from being re-elected after a partition heals. This makes split brain virtually impossible in properly configured clusters.",

    "## Shard Allocation and Awareness\n\nThe allocation decider framework determines shard placement across nodes. Key deciders: (1) **SameShardAllocationDecider** prevents a primary and its replica from being on the same node. (2) **DiskThresholdDecider** prevents allocation to nodes exceeding disk watermarks (low: 85% stops new shard allocation, high: 90% relocates shards away, flood_stage: 95% makes indices read-only). (3) **AwarenessAllocationDecider** distributes replicas across zones defined by cluster.routing.allocation.awareness.attributes (e.g., rack or availability zone). (4) **FilterAllocationDecider** uses index-level settings to include/exclude/require specific node attributes. **Forced awareness** prevents all copies of a shard from being in one zone even during a zone failure -- it keeps some replicas unassigned rather than co-locating them. The cluster rebalances shards when nodes join or leave, controlled by cluster.routing.rebalance.enable and the rebalancing threshold.",

    "## Cluster State and Its Management\n\nThe cluster state is a global data structure maintained by the master node and replicated to all nodes. It contains: index metadata (mappings, settings, aliases), shard routing table (which shards on which nodes), node membership, and persistent cluster settings. Every change to the cluster state (creating an index, moving a shard, changing a setting) goes through the master as a cluster state update. The full cluster state is sent to new nodes; subsequent updates are sent as diffs. A large cluster state (many indices, many fields, many shards) increases master node memory and the time to process updates. Limits to watch: total number of shards (keep under ~1000 per node), total fields per index (default 1000), and total indices. Closing unused indices reduces their contribution to cluster state. The _cluster/state API shows the current state; _cluster/pending_tasks shows the master's task queue.",

    "## Index Lifecycle Management (ILM)\n\nILM automates index transitions through lifecycle phases. **Hot**: the index is actively receiving writes and serving queries. Actions: rollover (create a new index when the current one reaches a size/age/doc count threshold), set_priority, shrink, forcemerge. **Warm**: the index is read-only and queried less frequently. Actions: allocate (move to warm-tier nodes), shrink (reduce shard count), forcemerge (merge segments for smaller size and faster queries), read_only. **Cold**: infrequent access, optimized for cost. Actions: allocate to cold-tier nodes, searchable_snapshot (mount from snapshot repository instead of local storage). **Frozen**: rarely accessed. Uses shared cache searchable snapshots for minimal local storage. **Delete**: remove the index entirely after a retention period. ILM policies are attached to index templates so all new indices in a data stream follow the same lifecycle. The _ilm/explain API shows the current phase and step of each index."
  ],

  deepDive: [
    "## Shard Routing and Custom Routing\n\nBy default, Elasticsearch routes documents to shards using the formula: shard_num = hash(_routing) % num_primary_shards. The default _routing value is the document's _id. Custom routing forces related documents onto the same shard by specifying a routing value (e.g., route by tenant_id or user_id). Benefits: (1) queries with a routing value hit only one shard instead of all shards (reduced fan-out), (2) nested and parent-child relationships require co-located documents. Risks: (1) uneven shard sizes if routing values have skewed cardinality, (2) hot shards if some routing values have much more data/traffic. The routing_partition_size setting distributes documents for a routing value across a subset of shards rather than exactly one, reducing hotspots while still limiting fan-out.",

    "## Recovery, Replication, and Consistency\n\nWhen a primary shard fails, one of its replicas is promoted to primary. The cluster then creates a new replica by copying data from the new primary -- this is **peer recovery**. During recovery, the new replica receives a snapshot of the primary's Lucene segments plus any operations that occurred since the snapshot (operations-based recovery using the translog). The recovery process is throttled to avoid saturating network and disk I/O (indices.recovery.max_bytes_per_sec, default 40mb). Write consistency: since ES 7.0, Elasticsearch uses a primary-backup replication model where writes go to the primary, which replicates to all in-sync replicas before acknowledging. The wait_for_active_shards parameter controls how many shard copies must be active before a write is accepted (default 1 = primary only, 'all' = primary + all replicas). In-sync replicas are tracked; replicas that fall behind are removed from the in-sync set and must catch up before rejoining.",

    "## Cross-Cluster Search and Replication\n\nCross-cluster search (CCS) allows querying remote clusters without data migration. A local cluster connects to remote clusters via seed nodes. Queries fan out to both local and remote clusters. CCS is useful for federated search across geo-distributed clusters or organizational boundaries. The ccs_minimize_roundtrips setting reduces latency by having remote clusters perform the full query locally. Cross-cluster replication (CCR) creates follower indices that replicate leader indices from a remote cluster. CCR is used for disaster recovery (maintain a standby cluster in another region) and read locality (replicate data close to users). Follower indices are read-only and automatically stay in sync. CCR uses the changes API to poll for new operations on the leader, applying them to the follower with configurable read and write polling intervals.",

    "## Searchable Snapshots and Frozen Tier\n\nSearchable snapshots (introduced in 7.10) allow mounting a snapshot as a read-only index, searching it directly from the snapshot repository (typically S3, GCS, or Azure Blob Storage) without restoring all data to local disk. Two mount types: **full_copy** (cold tier) downloads segment files to local storage on first access and caches them; **shared_cache** (frozen tier) uses a local LRU cache and fetches segment data from the repository on demand. Frozen tier indices can have near-zero local disk footprint. The trade-off is latency: cold tier has near-normal query speed after warmup; frozen tier queries may have higher latency due to remote fetches. This enables massive cost reduction for historical data that must remain searchable. ILM can automatically transition indices to searchable snapshots in the cold and frozen phases.",

    "## Performance Tuning: Shard Sizing and Indexing Throughput\n\nShard sizing directly impacts cluster performance. Each shard consumes resources: 1-5 MB of heap for metadata, file handles for segment files, thread pool slots for search and indexing. Rules of thumb: (1) target 10-50 GB per shard, (2) keep total shards per node under 600-1000, (3) avoid very small shards (< 1 GB) from over-sharding. For indexing throughput: increase refresh_interval (default 1s, set to 30s or -1 during bulk indexing), use bulk API with 5-15 MB request size, set number_of_replicas to 0 during initial load (add replicas after). For search performance: more replicas = more search throughput (up to a point), fewer larger shards = less overhead per query, forcemerge read-only indices to 1 segment for optimal search. The _nodes/stats and _cat/thread_pool APIs help identify bottlenecks in search, write, and merge thread pools."
  ],

  code: [
    {
      language: "json",
      caption: "Cluster health, shard allocation settings, and allocation awareness configuration",
      source: `// Check cluster health
GET /_cluster/health
// Response: { "status": "green", "number_of_nodes": 6,
//   "active_primary_shards": 50, "active_shards": 100,
//   "unassigned_shards": 0, "pending_tasks": 0 }

// Check health of a specific index
GET /_cluster/health/orders?level=shards

// View shard allocation
GET /_cat/shards/orders?v&s=shard,prirep
// index  shard prirep state   docs  store node
// orders 0     p      STARTED 50000 25mb  data-node-1
// orders 0     r      STARTED 50000 25mb  data-node-2
// orders 1     p      STARTED 48000 24mb  data-node-3
// orders 1     r      STARTED 48000 24mb  data-node-1

// Configure allocation awareness for availability zones
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone",
    "cluster.routing.allocation.awareness.force.zone.values": "us-east-1a,us-east-1b,us-east-1c"
  }
}

// Disk watermark settings
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}

// Diagnose unassigned shards
GET /_cluster/allocation/explain
{
  "index": "orders",
  "shard": 0,
  "primary": false
}`
    },
    {
      language: "json",
      caption: "Index Lifecycle Management (ILM) policy for time-series data",
      source: `// Create an ILM policy
PUT /_ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d",
            "max_docs": 100000000
          },
          "set_priority": { "priority": 100 },
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "require": { "data": "warm" },
            "number_of_replicas": 1
          },
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "require": { "data": "cold" },
            "number_of_replicas": 0
          },
          "searchable_snapshot": {
            "snapshot_repository": "my_s3_repo",
            "force_merge_index": true
          },
          "set_priority": { "priority": 0 }
        }
      },
      "frozen": {
        "min_age": "90d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "my_s3_repo"
          }
        }
      },
      "delete": {
        "min_age": "365d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}

// Attach policy to an index template
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "logs_policy",
      "index.lifecycle.rollover_alias": "logs-write",
      "index.routing.allocation.require.data": "hot"
    }
  }
}

// Check ILM status of an index
GET /logs-000001/_ilm/explain`
    },
    {
      language: "json",
      caption: "Node configuration for a multi-tier production cluster with dedicated roles",
      source: `// Master node configuration (elasticsearch.yml)
// Dedicate 3 nodes for master role
// node.roles: [master]
// cluster.name: production
// cluster.initial_master_nodes: [master-1, master-2, master-3]

// Hot data node configuration
// node.roles: [data_hot, ingest]
// node.attr.data: hot

// Warm data node configuration
// node.roles: [data_warm]
// node.attr.data: warm

// Cold data node configuration
// node.roles: [data_cold]
// node.attr.data: cold

// Coordinating-only node configuration
// node.roles: []

// Check node roles and stats
GET /_cat/nodes?v&h=name,role,heap.percent,disk.used_percent,cpu,load_1m
// name       role  heap.percent disk.used_percent cpu load_1m
// master-1   m     25           15                2   0.5
// master-2   m     28           12                1   0.3
// master-3   m     22           14                3   0.4
// hot-1      dhi   65           72                45  3.2
// hot-2      dhi   70           68                50  3.5
// warm-1     dw    45           80                10  1.0
// cold-1     dc    20           85                5   0.2
// coord-1    -     55           10                30  2.1

// Check thread pool queue lengths for bottleneck detection
GET /_cat/thread_pool/search,write,force_merge?v&h=node_name,name,active,queue,rejected
// node_name  name    active queue rejected
// hot-1      search  10     0     0
// hot-1      write   8      0     0
// hot-2      search  12     2     0
// hot-2      write   6      0     0`
    },
    {
      language: "json",
      caption: "Split and shrink operations for adjusting shard count on existing indices",
      source: `// Shrink an index from 10 shards to 1
// Step 1: Make index read-only and relocate all shards to one node
PUT /logs-2024.01/_settings
{
  "settings": {
    "index.routing.allocation.require._name": "hot-1",
    "index.blocks.write": true
  }
}

// Step 2: Shrink (target shard count must be a factor of source)
POST /logs-2024.01/_shrink/logs-2024.01-shrunk
{
  "settings": {
    "index.number_of_shards": 1,
    "index.number_of_replicas": 1,
    "index.routing.allocation.require._name": null,
    "index.blocks.write": null,
    "index.codec": "best_compression"
  }
}

// Split an index from 1 shard to 4
// Step 1: Make index read-only
PUT /products/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}

// Step 2: Split (target must be a multiple of source)
POST /products/_split/products-split
{
  "settings": {
    "index.number_of_shards": 4,
    "index.number_of_replicas": 1,
    "index.blocks.write": null
  }
}

// Check the progress
GET /_cat/recovery/products-split?v&h=index,shard,stage,bytes_percent`
    }
  ],

  diagrams: [
    {
      title: "Elasticsearch Cluster Architecture",
      kind: "architecture",
      mermaid: `graph TD
    subgraph Masters["Master Nodes - 3 for quorum"]
      M1["master-1"]
      M2["master-2"]
      M3["master-3"]
    end
    subgraph Hot["Hot Data Nodes - SSD"]
      D1["data-hot-1\nPrimary shards\nActive writes"]
      D2["data-hot-2\nPrimary shards\nActive writes"]
    end
    subgraph Warm["Warm Data Nodes - HDD"]
      D3["data-warm-1\nReplica shards\nRead-heavy"]
    end
    subgraph Coord["Coordinating Nodes"]
      C1["coordinating-1\nRoute requests\nMerge results"]
    end
    Client["Client"] --> C1
    C1 --> D1
    C1 --> D2
    C1 --> D3
    M1 <-->|Raft consensus| M2
    M2 <-->|Raft consensus| M3`,
      caption: "Dedicated master nodes manage cluster state; coordinating nodes route queries; hot and warm data nodes serve tiered storage tiers.",
    },
    {
      title: "Index Lifecycle Management Phases",
      kind: "flow",
      mermaid: `flowchart LR
    Hot["HOT phase\nActive writes\nFast SSD\nRollover on size or age"]
    Warm["WARM phase\nRead-only\nShrink and forcemerge\nCheaper storage"]
    Cold["COLD phase\nInfrequent access\nSearchable snapshots\nMinimal local disk"]
    Frozen["FROZEN phase\nRarely accessed\nShared cache snapshots\nNear-zero local storage"]
    Delete["DELETE phase\nRetention period expired\nIndex removed"]
    Hot -->|Rollover threshold met| Warm
    Warm -->|Age threshold| Cold
    Cold -->|Age threshold| Frozen
    Frozen -->|Retention expired| Delete`,
      caption: "ILM automatically moves indices through tiers as data ages, balancing query performance with storage cost.",
    },
    {
      title: "Shard Allocation and Failure Recovery",
      kind: "sequence",
      mermaid: `sequenceDiagram
    participant Master as Master Node
    participant N1 as Node 1
    participant N2 as Node 2
    participant N3 as Node 3
    Note over N1,N3: Normal green state
    N2->>Master: Node 2 unreachable
    Note over Master: Cluster health turns RED
    Master->>N3: Promote replica R1 to primary P1
    Note over Master: Cluster health turns YELLOW
    Master->>N1: Allocate new replica R0 on node 1
    Master->>N3: Allocate new replica R1 on node 3
    N1->>N1: Peer recovery from primary
    N3->>N3: Peer recovery from primary
    Note over Master: Cluster health returns GREEN
    N2->>Master: Node 2 rejoins cluster
    Master->>N2: Rebalance shards across 3 nodes`,
      caption: "On node failure the master promotes replicas and reallocates missing shards; recovery proceeds in the background until cluster returns to green.",
    },
    {
      title: "Elasticsearch Write Path",
      kind: "flow",
      mermaid: `flowchart TD
    Client["Client indexing request"] --> Coord["Coordinating Node\nRoutes to primary shard"]
    Coord --> Primary["Primary Shard Node\nValidates and indexes document"]
    Primary --> Trans["Write to translog\nfsync if requested"]
    Primary --> Memory["Update in-memory\nLucene index buffer"]
    Primary --> Replica1["Replicate to Replica 1"]
    Primary --> Replica2["Replicate to Replica 2"]
    Replica1 --> Ack1["ACK"]
    Replica2 --> Ack2["ACK"]
    Ack1 --> WC{"Write concern\nmet?"}
    Ack2 --> WC
    WC -->|Yes| Client2["Acknowledge client"]
    Memory -->|Refresh every 1s| Searchable["Document searchable"]`,
      caption: "Writes go to the primary shard, replicate in parallel to replicas, and acknowledge the client when the configured write concern is satisfied.",
    },
  ],

  animations: [
    {
      title: "Node Failure and Shard Recovery",
      steps: [
        { label: "Normal operation", detail: "3-node cluster with index 'orders' having 2 primary shards and 1 replica each. P0 on node-1, R0 on node-2, P1 on node-2, R1 on node-3. Cluster health: green." },
        { label: "Node-2 fails", detail: "Node-2 goes down, taking P1 (primary) and R0 (replica) with it. Cluster health immediately turns red because P1 has no active copy." },
        { label: "Replica promoted", detail: "Master promotes R1 on node-3 to become the new P1. Cluster health turns yellow -- all primaries assigned but some replicas missing." },
        { label: "Replica reallocation", detail: "Master schedules new replicas: new R0 on node-3, new R1 on node-1. Peer recovery begins -- segments are copied from primaries to new replica locations." },
        { label: "Recovery completes", detail: "Shard recovery finishes. All primary and replica shards are assigned across the remaining 2 nodes. Cluster health: green." },
        { label: "Node-2 returns", detail: "When node-2 rejoins, the master rebalances shards across all 3 nodes. Its stale copies are either synced via translog replay or replaced via full recovery." }
      ]
    },
    {
      title: "Master Election Process",
      steps: [
        { label: "Master failure detected", detail: "The active master (master-1) becomes unreachable. Other master-eligible nodes detect this via the fault detection ping mechanism after 3 missed pings (default 30 seconds)." },
        { label: "Election triggered", detail: "Master-eligible nodes enter an election. Each node proposes itself as a candidate and solicits votes from other master-eligible nodes in the voting configuration." },
        { label: "Quorum vote", detail: "A candidate must receive votes from a majority (e.g., 2 of 3 master-eligible nodes). Master-2 receives votes from master-2 and master-3, achieving quorum." },
        { label: "New master elected", detail: "Master-2 becomes the new active master. It publishes the updated cluster state to all nodes. The term number is incremented to prevent stale master-1 from reclaiming leadership." },
        { label: "Cluster stabilizes", detail: "The new master checks shard allocation, initiates any necessary recoveries, and resumes processing cluster state updates." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "Green", "Yellow", "Red"],
    rows: [
      ["Meaning", "All primary and replica shards assigned", "All primaries assigned, some replicas unassigned", "Some primary shards unassigned"],
      ["Data availability", "Full redundancy. No data loss risk.", "All data accessible but reduced redundancy.", "Some data inaccessible. Search results incomplete."],
      ["Common cause", "Normal healthy state", "Single-node cluster (replica cannot be on same node as primary), or node failure during recovery", "Node failure with no replicas, or cluster bootstrapping"],
      ["Immediate risk", "None", "If another node fails, data loss is possible for unassigned replicas", "Active data loss. Some queries return partial results."],
      ["Action needed", "None -- monitor and maintain", "Investigate: add nodes, check disk space, review allocation settings", "Urgent: restore failed nodes, check unassigned shard reasons with allocation explain API"],
      ["Search behavior", "All results returned, full redundancy for reads", "All results returned, but fewer copies to serve reads", "Results may be incomplete -- shards with unassigned primaries cannot serve queries"]
    ]
  },

  interviewQA: [
    {
      q: "What is the difference between primary and replica shards, and why do replicas matter?",
      a: "Primary shards hold the original data and handle write operations. Replica shards are copies of primary shards placed on different nodes. Replicas serve two purposes: (1) fault tolerance -- if a node with a primary shard fails, a replica is promoted to primary, preventing data loss; (2) search throughput -- search requests can be served by any copy (primary or replica), so more replicas mean more concurrent search capacity. The number of primary shards is fixed at index creation, but replicas can be adjusted dynamically. Elasticsearch ensures a primary and its replica never co-locate on the same node.",
      followUps: [
        "What happens when a node holding a primary shard goes down?",
        "Can you change the number of primary shards after index creation?",
        "What is the recommended shard size?"
      ]
    },
    {
      q: "How does Elasticsearch prevent split brain?",
      a: "Split brain occurs when network partition causes two groups of nodes to each elect a master, leading to divergent cluster states. Before ES 7.0, this was prevented by setting discovery.zen.minimum_master_nodes to (master_nodes / 2 + 1), but misconfiguration was common. Since ES 7.0, the cluster coordination layer handles quorum automatically using a voting configuration. A candidate must receive votes from a majority of the voting configuration to be elected. Term numbers prevent stale masters from reclaiming leadership after a partition heals. The voting configuration is automatically updated as nodes join or leave, making split brain virtually impossible.",
      followUps: [
        "Why do you need an odd number of master-eligible nodes?",
        "What is the initial_master_nodes setting for?"
      ]
    },
    {
      q: "Explain the ILM phases and when you would use each.",
      a: "Hot: actively written and queried, on fast SSD storage. Rollover creates new indices at size/age thresholds. Warm: read-only, queried less frequently, on cheaper storage. Shrink reduces shard count, forcemerge optimizes segments. Cold: infrequent access, uses searchable snapshots (data lives in a snapshot repository like S3 with local caching). Frozen: rarely accessed, uses shared-cache searchable snapshots with near-zero local storage. Delete: remove after retention period. Use ILM for time-series data (logs, metrics, events) where recent data is hot and older data can be progressively moved to cheaper tiers without losing searchability.",
      followUps: [
        "What are searchable snapshots and how do they work?",
        "How does rollover work with data streams?"
      ]
    },
    {
      q: "What is allocation awareness and why is it important?",
      a: "Allocation awareness distributes replica shards across different failure domains (e.g., availability zones, racks). Without it, a primary and its replica might end up in the same AZ, providing no protection against AZ failure. Configure with cluster.routing.allocation.awareness.attributes (e.g., 'zone'). Each node declares its zone via a node attribute. Elasticsearch ensures replicas are placed in different zones. Forced awareness (cluster.routing.allocation.awareness.force) goes further: during a zone failure, it keeps replicas unassigned rather than co-locating them in the surviving zone, preventing a subsequent failure from losing all copies.",
      followUps: [
        "What happens during a zone failure without forced awareness?",
        "How do disk watermarks affect shard allocation?"
      ]
    },
    {
      q: "How do you diagnose and fix unassigned shards?",
      a: "First, check cluster health (GET /_cluster/health) and identify unassigned shards (GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason). Use the allocation explain API (GET /_cluster/allocation/explain) to see why a specific shard is unassigned. Common reasons: (1) INDEX_CREATED -- not enough nodes to place replicas (single-node cluster); (2) NODE_LEFT -- the node holding the shard departed; (3) ALLOCATION_FAILED -- the shard could not be allocated (corrupt data, incompatible version); (4) DISK_THRESHOLD -- nodes exceed disk watermarks. Fixes depend on the cause: add nodes, free disk space, reduce replicas, or reroute manually (POST /_cluster/reroute with allocate_stale_primary for last resort data recovery)."
    }
  ],

  followUps: [
    "Why can't you change the primary shard count after index creation?",
    "What is split brain and how does `minimum_master_nodes` / quorum prevent it?",
    "How do you size shards — what goes wrong with too many and with too few?",
  ],
  mcqs: [
    {
      q: "What does a yellow cluster health status indicate?",
      options: [
        "The cluster is overloaded and queries are timing out",
        "All primary shards are assigned but some replica shards are unassigned",
        "Some primary shards are unassigned and data may be missing",
        "The master node is unreachable"
      ],
      answerIndex: 1,
      explanation: "Yellow means all primary shards are assigned (all data is accessible) but some replica shards are not assigned. This commonly occurs on single-node clusters (replicas cannot be on the same node as their primary) or during shard recovery after a node failure."
    },
    {
      q: "How many master-eligible nodes should a production Elasticsearch cluster have?",
      options: [
        "1 for simplicity",
        "2 for redundancy",
        "3 or more (odd number for quorum)",
        "Equal to the number of data nodes"
      ],
      answerIndex: 2,
      explanation: "Production clusters should have 3 (or 5 for very large clusters) dedicated master-eligible nodes. An odd number ensures a clear majority for quorum during elections. With 2 nodes, neither can achieve a majority if the other is unreachable, preventing master election."
    },
    {
      q: "What is the default disk watermark threshold at which Elasticsearch makes indices read-only?",
      options: [
        "80%",
        "85%",
        "90%",
        "95%"
      ],
      answerIndex: 3,
      explanation: "The flood_stage watermark (default 95%) triggers the read-only block on indices with shards on the affected node. The low watermark (85%) stops new shard allocation to the node, and the high watermark (90%) starts relocating shards away from the node."
    },
    {
      q: "What determines which shard a document is routed to?",
      options: [
        "Round-robin across all shards",
        "The shard with the least documents",
        "hash(_routing) % number_of_primary_shards (default _routing = _id)",
        "Random assignment"
      ],
      answerIndex: 2,
      explanation: "Elasticsearch uses the formula shard_num = hash(_routing) % num_primary_shards to determine document-to-shard routing. By default, _routing is the document's _id, ensuring uniform distribution. Custom routing can be specified to co-locate related documents on the same shard."
    },
    {
      q: "Which ILM phase uses searchable snapshots to minimize local disk usage?",
      options: [
        "Hot",
        "Warm",
        "Cold and Frozen",
        "Delete"
      ],
      answerIndex: 2,
      explanation: "The cold phase uses full_copy searchable snapshots (data cached locally after first access). The frozen phase uses shared_cache searchable snapshots (LRU cache, data fetched from repository on demand). Both reduce local disk requirements by keeping data primarily in the snapshot repository."
    }
  ],

  flashcards: [
    { front: "What are the three cluster health states?", back: "Green: all primaries and replicas assigned. Yellow: all primaries assigned, some replicas unassigned. Red: some primaries unassigned (data may be inaccessible)." },
    { front: "What is the shard routing formula?", back: "shard_num = hash(_routing) % number_of_primary_shards. Default _routing = document _id. Custom routing co-locates related docs on the same shard." },
    { front: "What are the Elasticsearch node roles?", back: "Master (cluster management), Data (store shards, execute queries), Ingest (document pipelines), Coordinating-only (request routing, result merging), ML, Transform, Remote cluster client." },
    { front: "What are the disk watermark thresholds?", back: "Low (85%): stop new shard allocation. High (90%): relocate shards away. Flood stage (95%): make indices read-only. Configurable via cluster settings." },
    { front: "What is allocation awareness?", back: "Distributes replicas across failure domains (AZs, racks). Set cluster.routing.allocation.awareness.attributes to a node attribute. Forced awareness keeps replicas unassigned rather than co-locating during zone failure." },
    { front: "What is the recommended shard size?", back: "10-50 GB per shard. Too small: excessive overhead (memory, file handles). Too large: slow recovery, limited parallelism. Each shard = independent Lucene index." },
    { front: "How does split brain prevention work since ES 7.0?", back: "Automatic quorum via voting configuration. Candidate needs majority votes. Term numbers prevent stale masters. No manual minimum_master_nodes setting required." },
    { front: "What are the ILM phases?", back: "Hot (active writes, fast storage) -> Warm (read-only, shrink, forcemerge) -> Cold (searchable snapshots, full_copy) -> Frozen (shared_cache snapshots) -> Delete." },
    { front: "What does the _cluster/allocation/explain API do?", back: "Explains why a specific shard is unassigned or allocated to a particular node. Shows which allocation deciders allowed or denied placement. Essential for diagnosing yellow/red cluster health." },
    { front: "What is peer recovery?", back: "When a new replica is created, it copies Lucene segments from the primary shard + translog replay for recent operations. Throttled by indices.recovery.max_bytes_per_sec (default 40mb)." }
  ],

  revisionNotes: [
    "Primary shards: hold original data, fixed at creation. Replicas: copies for fault tolerance + read throughput, adjustable dynamically.",
    "Cluster health: green (all assigned), yellow (primaries OK, replicas missing), red (primaries missing).",
    "3 dedicated master-eligible nodes for production. Quorum = majority. Automatic since ES 7.0.",
    "Shard routing: hash(_routing) % num_primary_shards. Default _routing = _id. Custom routing for co-location.",
    "Disk watermarks: 85% (no new allocation), 90% (relocate away), 95% (read-only). Configurable.",
    "Allocation awareness: distribute replicas across zones. Forced awareness prevents co-location during zone failure.",
    "ILM phases: hot -> warm -> cold -> frozen -> delete. Automates index lifecycle for time-series data.",
    "Searchable snapshots: cold (full_copy, local cache) and frozen (shared_cache, remote fetch on demand).",
    "Target shard size: 10-50 GB. Keep total shards per node under ~1000. Each shard has memory overhead.",
    "Use _cluster/allocation/explain to diagnose unassigned shards. Common causes: insufficient nodes, disk full, corrupt data."
  ],

  cheatSheet: [
    "GET /_cluster/health -- check green/yellow/red status",
    "GET /_cat/shards?v -- view shard allocation across nodes",
    "GET /_cluster/allocation/explain -- diagnose unassigned shards",
    "Primary shards: fixed at creation. Replicas: adjustable dynamically.",
    "Shard routing: hash(_routing) % num_primary_shards",
    "3 master-eligible nodes minimum for production (odd number for quorum)",
    "Disk watermarks: low=85% (stop alloc), high=90% (relocate), flood=95% (read-only)",
    "Allocation awareness: cluster.routing.allocation.awareness.attributes: zone",
    "ILM: hot -> warm -> cold (searchable snapshot) -> frozen -> delete",
    "Target shard size: 10-50 GB. Max ~1000 shards per node.",
    "Bulk indexing: set replicas=0, refresh_interval=-1, restore after load",
    "GET /_cat/nodes?v -- check node roles, heap, disk, CPU"
  ],

  exercises: [
    "Your Elasticsearch cluster is showing **red health** with 3 unassigned primary shards on the `orders` index. Walk through the diagnostic process: which APIs would you call (hint: `_cluster/health`, `_cat/shards`, `_cluster/allocation/explain`), what are the most likely root causes, and how would you resolve each one?",
    "Design an **ILM policy** for a logging platform that ingests 100 GB/day. The policy should rollover at 50 GB or 1 day, move to warm tier after 7 days with `forcemerge` to 1 segment, transition to cold tier with *searchable snapshots* at 30 days, and delete at 365 days. Write the full `PUT /_ilm/policy` request.",
    "You are planning a production cluster across **3 availability zones** (us-east-1a, 1b, 1c). Configure *allocation awareness* with *forced awareness* so that replicas are never co-located in the same AZ, even during a zone failure. Write the `PUT /_cluster/settings` request and explain why forced awareness keeps replicas unassigned rather than co-locating them.",
    "An index has 10 primary shards but traffic has decreased and you want to **shrink it to 2 shards**. Describe the prerequisites (read-only, all shards on one node), write the `PUT` and `POST /_shrink` commands, and explain why the target shard count must be a *factor* of the source shard count.",
    "Your cluster has a *single master-eligible node* and you need to add two more to prevent **split brain**. Describe the configuration changes in `elasticsearch.yml` for each node, explain how the *voting configuration* is automatically updated, and verify the setup using `GET /_cat/nodes?v&h=name,role`.",
  ],
  resources: [
    { label: "Elasticsearch Cluster Administration documentation", kind: "docs", note: "Official guide covering cluster settings, shard allocation, and node configuration" },
    { label: "Elasticsearch: The Definitive Guide - Cluster chapter", kind: "book", note: "Comprehensive explanation of cluster architecture, shard allocation, and scaling" },
    { label: "Elastic Blog: Sizing Elasticsearch Shards", kind: "article", note: "Official guidance on shard sizing, including benchmarks and formulas for capacity planning" },
    { label: "Elasticsearch ILM documentation", kind: "docs", note: "Complete reference for Index Lifecycle Management policies, phases, and actions" },
    { label: "Elastic Blog: A New Era for Cluster Coordination in Elasticsearch", kind: "article", note: "Deep technical explanation of the ES 7.0 cluster coordination layer that replaced zen discovery" },
    { label: "Elastic Blog: Searchable Snapshots", kind: "article", note: "Architecture and performance characteristics of searchable snapshots for cold and frozen tiers" }
  ],

  glossary: [
    { term: "Primary Shard", definition: "The original copy of a shard that handles write operations. Each index has a fixed number of primary shards set at creation." },
    { term: "Replica Shard", definition: "A copy of a primary shard on a different node, providing fault tolerance and additional search throughput. Count adjustable dynamically." },
    { term: "Cluster Health", definition: "Status indicator: green (all shards assigned), yellow (primaries OK, replicas missing), red (primaries missing, data at risk)." },
    { term: "Split Brain", definition: "A failure mode where network partition causes two groups of nodes to each elect a master, leading to divergent cluster states. Prevented by quorum-based election." },
    { term: "Allocation Awareness", definition: "A feature that distributes shard copies across failure domains (availability zones, racks) to ensure fault tolerance against zone-level failures." },
    { term: "Index Lifecycle Management (ILM)", definition: "An automated system for transitioning indices through lifecycle phases (hot, warm, cold, frozen, delete) based on age, size, or document count." },
    { term: "Searchable Snapshot", definition: "A read-only index mounted from a snapshot repository, enabling search without full local data restoration. Used in cold and frozen tiers." },
    { term: "Voting Configuration", definition: "The set of master-eligible nodes that participate in master elections. A candidate must receive votes from a majority of this set." },
    { term: "Shard Routing", definition: "The formula (hash(_routing) % num_primary_shards) that determines which shard a document belongs to. Custom routing co-locates related documents." },
    { term: "Peer Recovery", definition: "The process of creating a new shard copy by transferring Lucene segments and translog operations from an existing copy. Occurs after node failure or rebalancing." }
  ]
};
