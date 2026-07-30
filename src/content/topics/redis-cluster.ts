import type { TopicContent } from "../types";

export const redisCluster: TopicContent = {
  quickSummary: [
    "Redis supports three high-availability architectures: standalone replication (master-replica), Redis Sentinel (automatic failover for replication), and Redis Cluster (sharded, distributed mode with 16384 hash slots).",
    "Redis Cluster partitions data across multiple masters using CRC16(key) mod 16384 hash slots. Each master owns a subset of slots and has one or more replicas. The cluster bus (port + 10000) handles node discovery, failure detection, and failover via a gossip protocol.",
    "Clients must handle MOVED (permanent redirect to the correct node) and ASK (temporary redirect during resharding) responses. Smart clients cache the slot-to-node mapping to minimize redirections.",
  ],
  detailed: [
    "Redis replication is asynchronous by default: the master sends write commands to replicas after executing them, without waiting for acknowledgment. This means replicas may lag behind the master. WAIT command provides synchronous replication — it blocks until N replicas acknowledge the write, but still does not guarantee durability (a replica could crash after ACK but before persisting). Replication uses a replication backlog (circular buffer, default 1 MB) for partial resynchronization after brief disconnections.",
    "Redis Sentinel is a separate process that monitors master and replica instances, performs automatic failover when a master is unreachable, and provides service discovery (clients ask Sentinel for the current master address). Sentinels use quorum-based failure detection: a master is considered down only when a configurable number of Sentinels agree (objective down, ODOWN). A Sentinel leader is elected via Raft-like consensus to perform the failover. Sentinel requires at least 3 instances for reliability.",
    "Redis Cluster divides the keyspace into 16384 hash slots. Each master node is responsible for a subset of these slots. The slot for a key is computed as CRC16(key) mod 16384. Hash tags — the portion of a key within curly braces {tag} — allow related keys to map to the same slot (e.g., {user:42}:profile and {user:42}:sessions both hash on 'user:42'). Multi-key commands (MGET, MSET, pipeline transactions) only work when all keys are in the same slot.",
    "The cluster bus is a node-to-node binary protocol on port + 10000 (e.g., 16379 for a node on 6379). It uses a gossip protocol for node discovery, heartbeat exchange, and failure detection. Each node sends ping packets containing information about a random subset of known nodes. If a node does not respond to pings within cluster-node-timeout (default 15 seconds), it is marked as PFAIL (possibly failed). When a majority of masters report a node as PFAIL, it transitions to FAIL and triggers failover.",
    "Failover in Redis Cluster: when a master is marked FAIL, its replicas initiate an election. The replica with the most up-to-date replication offset requests votes from other masters. A replica needs votes from a majority of masters to become the new master. The winning replica promotes itself, takes ownership of the failed master's slots, and broadcasts the configuration change. The entire failover typically completes in 1-2 seconds after detection.",
    "Resharding moves hash slots between nodes without downtime. The CLUSTER SETSLOT slot MIGRATING target-node-id command marks a slot as migrating on the source, and CLUSTER SETSLOT slot IMPORTING source-node-id on the target. During migration, the source node serves requests for keys still present and returns ASK redirections for keys already migrated. The MIGRATE command moves individual keys atomically. After all keys are migrated, CLUSTER SETSLOT slot NODE target-node-id finalizes the move on all nodes.",
    "MOVED vs ASK: MOVED means the slot is permanently owned by another node — the client should update its slot mapping cache. ASK means the slot is being migrated and the key happens to be on the target node — the client should send the next command to the target with an ASKING prefix, but not update its cache (the migration may not be complete). Smart clients like redis-py-cluster, Jedis, and Lettuce handle both redirections automatically.",
  ],
  deepDive: [
    "The choice of 16384 hash slots is a deliberate trade-off. Each node sends its slot bitmap in heartbeat messages — 16384 bits = 2 KB, a manageable overhead. With 65536 slots, heartbeats would be 8 KB. Antirez chose 16384 as the sweet spot for clusters up to ~1000 nodes (16 slots per node minimum). The CRC16 hash function provides good distribution across slots. The slot count is fixed and cannot be changed without reimplementing the protocol.",
    "Replication topology in Cluster mode: each master should have at least one replica. Redis Cluster supports replica migration — if a master has multiple replicas and another master's replica fails, one replica can be automatically migrated to the orphaned master. This is controlled by cluster-migration-barrier (default 1: a master must have at least 1 remaining replica before donating one). This self-healing behavior reduces the risk of data loss from cascading failures.",
    "Split-brain scenarios: if the cluster network partitions, a minority partition's masters will be marked FAIL by the majority. Clients connected to the minority side will receive CLUSTERDOWN errors after cluster-node-timeout. The majority side continues serving and may elect new masters for the failed nodes. When the partition heals, the minority-side masters become replicas of the newly elected masters, discarding any writes they accepted during the partition. The min-replicas-to-write setting can prevent a master from accepting writes if it has fewer than N connected replicas, reducing the window for lost writes.",
    "Cluster mode limitations: multi-key operations require all keys in the same hash slot (use hash tags). Lua scripts can only access keys in a single slot. SELECT (database selection) is not supported — only database 0. PUBLISH works but broadcasts to all nodes, making it expensive. Large clusters (>100 nodes) may experience gossip overhead. For cross-slot atomic operations, application-level coordination or CRDTs are needed.",
  ],
  code: [
    {
      language: "bash",
      caption: "Creating a Redis Cluster from scratch",
      source: `# Start 6 Redis instances (3 masters + 3 replicas)
for port in 7000 7001 7002 7003 7004 7005; do
  redis-server --port $port --cluster-enabled yes \
    --cluster-config-file nodes-$port.conf \
    --cluster-node-timeout 5000 \
    --appendonly yes --daemonize yes
done

# Create the cluster (3 masters, 1 replica each)
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1

# Verify cluster state
redis-cli -p 7000 CLUSTER INFO
# cluster_state:ok
# cluster_slots_assigned:16384
# cluster_slots_ok:16384
# cluster_known_nodes:6
# cluster_size:3`,
    },
    {
      language: "redis",
      caption: "Cluster inspection and management commands",
      source: `# View all nodes and their roles
CLUSTER NODES
# <id> 127.0.0.1:7000@17000 myself,master - 0 0 1 connected 0-5460
# <id> 127.0.0.1:7001@17001 master - 0 1688000000 2 connected 5461-10922
# <id> 127.0.0.1:7002@17002 master - 0 1688000000 3 connected 10923-16383
# <id> 127.0.0.1:7003@17003 slave <master-id> 0 1688000000 1 connected
# ...

# Check which node owns a slot
CLUSTER KEYSLOT mykey
# (integer) 14687

CLUSTER SLOTS
# Returns slot ranges and their master/replica nodes

# Get cluster info
CLUSTER INFO

# Check replication lag on a replica
INFO replication
# role:slave
# master_link_status:up
# master_last_io_seconds_ago:0
# slave_repl_offset:12345
# slave_read_repl_offset:12345`,
    },
    {
      language: "redis",
      caption: "Hash tags for co-locating related keys",
      source: `# These keys hash on "user:42", landing in the same slot
SET {user:42}:profile '{"name":"Alice"}'
SET {user:42}:sessions '["sess1","sess2"]'
SET {user:42}:cart '{"items":3}'

# Verify they share a slot
CLUSTER KEYSLOT {user:42}:profile
# (integer) 8220
CLUSTER KEYSLOT {user:42}:sessions
# (integer) 8220
CLUSTER KEYSLOT {user:42}:cart
# (integer) 8220

# Now multi-key operations work
MGET {user:42}:profile {user:42}:sessions {user:42}:cart

# Without hash tags, these would likely be on different nodes
CLUSTER KEYSLOT user:42:profile
# (integer) 2901  -- different slot!`,
    },
    {
      language: "bash",
      caption: "Resharding slots between nodes",
      source: `# Move 1000 slots from node 7000 to node 7001
redis-cli --cluster reshard 127.0.0.1:7000 \
  --cluster-from <source-node-id> \
  --cluster-to <target-node-id> \
  --cluster-slots 1000 \
  --cluster-yes

# Check progress
redis-cli -p 7000 CLUSTER NODES | grep "migrating"
redis-cli -p 7001 CLUSTER NODES | grep "importing"

# Manual slot migration (step by step):
# 1. Mark slot as migrating on source
redis-cli -p 7000 CLUSTER SETSLOT 8220 MIGRATING <target-id>

# 2. Mark slot as importing on target
redis-cli -p 7001 CLUSTER SETSLOT 8220 IMPORTING <source-id>

# 3. Get keys in the slot
redis-cli -p 7000 CLUSTER GETKEYSINSLOT 8220 100

# 4. Migrate each key atomically
redis-cli -p 7000 MIGRATE 127.0.0.1 7001 "" 0 5000 KEYS key1 key2 key3

# 5. Finalize on all nodes
redis-cli -p 7000 CLUSTER SETSLOT 8220 NODE <target-id>
redis-cli -p 7001 CLUSTER SETSLOT 8220 NODE <target-id>
redis-cli -p 7002 CLUSTER SETSLOT 8220 NODE <target-id>`,
    },
    {
      language: "redis",
      caption: "Sentinel configuration and commands",
      source: `# sentinel.conf
sentinel monitor mymaster 127.0.0.1 6379 2
# 2 = quorum (number of Sentinels needed to agree on failure)

sentinel down-after-milliseconds mymaster 5000
# 5 seconds of no response = subjective down

sentinel failover-timeout mymaster 60000
# 60 seconds max for failover

sentinel parallel-syncs mymaster 1
# 1 replica syncs at a time during failover

# Query Sentinel for current master
SENTINEL GET-MASTER-ADDR-BY-NAME mymaster
# 1) "127.0.0.1"
# 2) "6379"

# List all replicas
SENTINEL REPLICAS mymaster

# List all sentinels monitoring this master
SENTINEL SENTINELS mymaster

# Force a manual failover
SENTINEL FAILOVER mymaster

# Check if master is reachable
SENTINEL CKQUORUM mymaster
# OK 3 usable Sentinels. Quorum: 2. OK!`,
    },
    {
      language: "python",
      caption: "Connecting to Redis Cluster with smart client",
      source: `from redis.cluster import RedisCluster, ClusterNode

# Smart client auto-discovers all nodes from seed nodes
startup_nodes = [
    ClusterNode("127.0.0.1", 7000),
    ClusterNode("127.0.0.1", 7001),
]

rc = RedisCluster(
    startup_nodes=startup_nodes,
    decode_responses=True,
    skip_full_coverage_check=False,
)

# Basic operations — client handles MOVED/ASK transparently
rc.set("key1", "value1")
rc.get("key1")

# Hash tags for multi-key operations
rc.mset({"{order:100}:status": "paid", "{order:100}:total": "59.99"})
result = rc.mget("{order:100}:status", "{order:100}:total")

# Pipeline within a single slot (using hash tags)
pipe = rc.pipeline()
pipe.hset("{user:1}:data", "visits", 0)
pipe.hincrby("{user:1}:data", "visits", 1)
pipe.hget("{user:1}:data", "visits")
results = pipe.execute()

# Cross-slot pipeline will raise an error
# pipe.set("key_a", "1")  # slot X
# pipe.set("key_b", "2")  # slot Y -- CrossSlotError!`,
    },
    {
      language: "python",
      caption: "Sentinel-aware client connection",
      source: `from redis.sentinel import Sentinel

# Connect to Sentinel instances
sentinel = Sentinel([
    ("sentinel-1.example.com", 26379),
    ("sentinel-2.example.com", 26379),
    ("sentinel-3.example.com", 26379),
], socket_timeout=0.5)

# Get a connection to the current master
master = sentinel.master_for("mymaster", socket_timeout=0.5, db=0)
master.set("key", "value")

# Get a connection for read-only queries to a replica
replica = sentinel.slave_for("mymaster", socket_timeout=0.5, db=0)
value = replica.get("key")

# The client automatically reconnects to the new master after failover
# No application code change needed`,
    },
  ],
  diagrams: [
    {
      title: "Redis Cluster hash slot distribution",
      kind: "architecture",
      caption: "16384 hash slots divided among master nodes. Each master has replica(s). CRC16(key) mod 16384 determines the slot.",
    },
    {
      title: "Cluster failover sequence",
      kind: "sequence",
      caption: "Master stops responding. Replicas detect PFAIL after cluster-node-timeout. Majority of masters confirm FAIL. Replica with best offset requests votes, wins election, promotes to master.",
    },
    {
      title: "MOVED vs ASK redirection flow",
      kind: "flow",
      caption: "Client sends command. If slot is on another node, MOVED redirect (update cache). If slot is migrating and key is on target, ASK redirect (one-time, no cache update).",
    },
    {
      title: "Redis Sentinel architecture",
      kind: "architecture",
      caption: "3+ Sentinel processes monitor master and replicas. On master failure, Sentinels elect a leader who promotes a replica. Clients query Sentinel for current master address.",
    },
    {
      title: "Resharding slot migration",
      kind: "sequence",
      caption: "Source marks slot MIGRATING, target marks IMPORTING. Keys are moved with MIGRATE. Source returns ASK for migrated keys. Finalized with SETSLOT NODE on all nodes.",
    },
  ],
  animations: [
    {
      title: "Cluster failover election",
      steps: [
        { label: "Detection", detail: "A master stops responding to heartbeats. After cluster-node-timeout (default 15s), nodes mark it as PFAIL (possibly failed)." },
        { label: "Consensus", detail: "When a majority of masters have marked the node PFAIL, its status changes to FAIL. This is broadcast to all nodes via the gossip protocol." },
        { label: "Election start", detail: "The failed master's replicas wait a delay proportional to their replication offset (most up-to-date replica waits shortest). Then each requests FAILOVER_AUTH votes from all masters." },
        { label: "Vote collection", detail: "Each master votes for at most one replica per epoch. The first replica to collect votes from a majority of masters wins the election." },
        { label: "Promotion", detail: "The winning replica promotes itself to master, claims the failed master's hash slots, increments the config epoch, and broadcasts the new configuration." },
        { label: "Clients update", detail: "Clients sending commands to the old master receive MOVED redirections to the new master. Smart clients update their slot mapping cache." },
      ],
    },
    {
      title: "Live resharding of a hash slot",
      steps: [
        { label: "Mark migration", detail: "Source node marks slot X as MIGRATING to target. Target node marks slot X as IMPORTING from source." },
        { label: "Client behavior", detail: "Clients continue sending requests for slot X to the source. If the key exists on source, it is served normally." },
        { label: "ASK redirection", detail: "If the key has already been migrated to the target, the source returns ASK target_addr. The client sends ASKING followed by the command to the target." },
        { label: "Key migration", detail: "An orchestrator (redis-cli --cluster reshard) iterates CLUSTER GETKEYSINSLOT and runs MIGRATE for batches of keys from source to target." },
        { label: "Finalization", detail: "After all keys are migrated, CLUSTER SETSLOT X NODE target-id is sent to all nodes. The slot is now permanently on the target. No more ASK redirections." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Standalone Replication", "Redis Sentinel", "Redis Cluster"],
    rows: [
      ["Data distribution", "Single master, all data", "Single master, all data", "Sharded across multiple masters"],
      ["Automatic failover", "No", "Yes (Sentinel-managed)", "Yes (built-in)"],
      ["Max dataset size", "Single server memory", "Single server memory", "Sum of all masters' memory"],
      ["Write scaling", "Single master only", "Single master only", "Linear with master count"],
      ["Read scaling", "Replicas for reads", "Replicas for reads", "Replicas per shard for reads"],
      ["Multi-key operations", "All keys accessible", "All keys accessible", "Only within same hash slot"],
      ["Setup complexity", "Low", "Medium (3+ Sentinels)", "High (6+ nodes minimum)"],
      ["Client support", "Standard client", "Sentinel-aware client", "Cluster-aware client"],
      ["Service discovery", "Manual / DNS", "Sentinel provides master address", "Any node provides slot map"],
    ],
  },
  interviewQA: [
    {
      q: "Why does Redis Cluster use exactly 16384 hash slots?",
      a: "It is a balance between granularity and gossip overhead. Each node sends its slot bitmap in heartbeat messages — 16384 slots = 2 KB bitmap. With more slots, heartbeat packets grow (65536 would be 8 KB). With fewer slots, there is insufficient granularity for rebalancing across many nodes. 16384 supports clusters up to ~1000 nodes with at least 16 slots per node. The number was chosen by Antirez as the practical sweet spot.",
      followUps: [
        "What hash function maps keys to slots?",
        "Can you change the number of hash slots after cluster creation?",
      ],
    },
    {
      q: "What is the difference between MOVED and ASK redirections?",
      a: "MOVED means the slot has been permanently reassigned to another node — the client should update its slot-to-node cache and send all future requests for that slot to the new node. ASK means the slot is being migrated and a specific key happens to already be on the target node — the client should send the next command to the target (prefixed with ASKING), but NOT update its cache because the migration is still in progress and other keys in the same slot may still be on the source.",
      followUps: [
        "What happens if a client ignores MOVED?",
        "Why does ASK require the ASKING command prefix?",
      ],
    },
    {
      q: "How does Redis Sentinel avoid split-brain during failover?",
      a: "Sentinel uses quorum-based failure detection: a master is only considered objectively down (ODOWN) when at least 'quorum' Sentinels agree. Failover is performed by a single Sentinel leader elected via a Raft-like algorithm, preventing multiple simultaneous failovers. However, split-brain can still occur at the Redis level: if a master is network-partitioned but still running, it may accept writes that will be lost when it later discovers it was replaced and becomes a replica. The min-replicas-to-write setting mitigates this by refusing writes when fewer than N replicas are connected.",
      followUps: [
        "What is the difference between SDOWN and ODOWN?",
        "How is the Sentinel leader elected?",
      ],
    },
    {
      q: "Can you run a Lua script that accesses keys on different hash slots in Redis Cluster?",
      a: "No. Lua scripts in Redis Cluster can only access keys that belong to the same hash slot. If a script references keys in different slots, Redis returns a CROSSSLOT error. You must use hash tags to ensure all keys accessed by a script map to the same slot. For example, use {order:1}:items and {order:1}:total so both hash on 'order:1'.",
    },
  ],
  mcqs: [
    {
      q: "How many hash slots does Redis Cluster use?",
      options: ["1024", "4096", "16384", "65536"],
      answerIndex: 2,
      explanation: "Redis Cluster uses exactly 16384 hash slots. The slot is computed as CRC16(key) mod 16384. This number was chosen to keep gossip heartbeat packets at 2 KB.",
    },
    {
      q: "What is the minimum recommended number of Sentinel instances?",
      options: ["1", "2", "3", "5"],
      answerIndex: 2,
      explanation: "At least 3 Sentinels are recommended for reliable quorum-based failure detection and leader election. With 2 Sentinels, losing one means quorum cannot be reached.",
    },
    {
      q: "Which port does the Redis Cluster bus use by default?",
      options: ["Same as the data port", "Data port + 1000", "Data port + 10000", "16384"],
      answerIndex: 2,
      explanation: "The cluster bus uses the data port + 10000. For a node on port 6379, the cluster bus is on 16379. This binary protocol handles gossip, failure detection, and configuration updates.",
    },
    {
      q: "What does a MOVED -3999 127.0.0.1:7001 response mean?",
      options: [
        "The key is temporarily on node 7001 during migration",
        "Slot 3999 is permanently served by node 7001 — update your cache",
        "Node 7001 is the Sentinel master",
        "The command failed due to a cluster error",
      ],
      answerIndex: 1,
      explanation: "MOVED indicates a permanent slot reassignment. The client should update its slot-to-node mapping cache and redirect all future slot 3999 requests to 127.0.0.1:7001.",
    },
    {
      q: "What ensures related keys land on the same hash slot?",
      options: ["Key prefixes", "Hash tags (curly braces)", "Consistent hashing", "Manual slot assignment"],
      answerIndex: 1,
      explanation: "Hash tags — the substring within curly braces — determine the hash slot. {user:42}:profile and {user:42}:cart both hash on 'user:42', guaranteeing the same slot.",
    },
  ],
  flashcards: [
    { front: "How is the hash slot for a key computed in Redis Cluster?", back: "CRC16(key) mod 16384. If the key contains curly braces, only the substring within the first pair of braces is hashed (hash tag)." },
    { front: "What is the cluster bus and what port does it use?", back: "A node-to-node binary protocol for gossip, failure detection, and config propagation. It runs on the data port + 10000 (e.g., 16379 for port 6379)." },
    { front: "What is PFAIL vs FAIL in Redis Cluster?", back: "PFAIL (possibly failed): a single node's local view that another node is unreachable. FAIL: a majority of masters agree the node is unreachable — triggers failover." },
    { front: "What does ASKING command do before an ASK-redirected request?", back: "ASKING tells the target node to accept the next command for a slot it is importing but does not yet own. Without ASKING, the target would return MOVED back to the source." },
    { front: "What is replica migration in Redis Cluster?", back: "Automatic movement of a replica from a master with multiple replicas to a master that has lost all replicas, controlled by cluster-migration-barrier." },
    { front: "What is cluster-node-timeout?", back: "Time in ms (default 15000) after which a non-responding node is marked PFAIL. Also affects failover election delay and cluster convergence speed." },
    { front: "What is the quorum in Redis Sentinel?", back: "The number of Sentinels that must agree a master is unreachable (ODOWN) before failover can proceed. Configurable per monitored master." },
    { front: "Can multi-key transactions (MULTI/EXEC) work across slots in Cluster mode?", back: "No. All keys in a transaction must be in the same hash slot. Use hash tags to co-locate related keys." },
  ],
  revisionNotes: [
    "Redis replication is asynchronous by default. WAIT provides synchronous replication but not durability guarantees.",
    "Sentinel: 3+ instances, quorum-based ODOWN detection, Raft-like leader election for failover. Clients query Sentinel for master address.",
    "Cluster: 16384 hash slots, CRC16(key) mod 16384. Each master owns a slot range. Minimum 3 masters + 3 replicas.",
    "Hash tags {tag} ensure related keys share a slot — required for multi-key ops, Lua scripts, and transactions in Cluster mode.",
    "MOVED = permanent redirect (update client cache). ASK = temporary redirect during resharding (one-time, send ASKING first).",
    "Cluster bus on port + 10000 uses gossip protocol. PFAIL (local suspicion) upgrades to FAIL when majority of masters agree.",
    "Failover election: replicas wait delay proportional to replication offset, then request votes. Majority of master votes wins.",
    "Resharding: MIGRATING on source, IMPORTING on target, MIGRATE keys, then SETSLOT NODE to finalize on all nodes.",
    "Split-brain risk: partitioned master may accept writes that are lost on rejoin. Mitigate with min-replicas-to-write.",
    "Cluster limitations: no cross-slot multi-key ops, no SELECT (only db 0), PUBLISH broadcasts to all nodes.",
  ],
  cheatSheet: [
    "CLUSTER INFO — cluster state, slot assignment, node count",
    "CLUSTER NODES — list all nodes with roles, slots, and status",
    "CLUSTER SLOTS — slot ranges with master and replica addresses",
    "CLUSTER KEYSLOT key — compute hash slot for a key",
    "CLUSTER GETKEYSINSLOT slot count — list keys in a slot",
    "CLUSTER SETSLOT slot MIGRATING/IMPORTING/NODE id — manage slot migration",
    "CLUSTER FAILOVER — manual failover (run on replica)",
    "CLUSTER RESET SOFT/HARD — reset node cluster state",
    "CLUSTER REPLICATE node-id — make current node a replica of node-id",
    "redis-cli --cluster create host:port ... --cluster-replicas N — bootstrap cluster",
    "redis-cli --cluster reshard host:port — interactive resharding",
    "redis-cli --cluster check host:port — verify cluster health",
    "SENTINEL GET-MASTER-ADDR-BY-NAME name — get current master from Sentinel",
    "SENTINEL FAILOVER name — force manual Sentinel failover",
    "INFO replication — check replication offset and lag",
    "CONFIG SET min-replicas-to-write N — reject writes without N replicas",
  ],
  resources: [
    { label: "Redis Cluster Specification", kind: "docs", note: "Official protocol specification covering hash slots, gossip, failover, and resharding." },
    { label: "Redis Sentinel Documentation", kind: "docs", note: "Setup, configuration, and client integration guide for Sentinel." },
    { label: "Redis Cluster Tutorial", kind: "docs", note: "Step-by-step guide to creating and operating a Redis Cluster." },
    { label: "Designing Data-Intensive Applications — Chapter 6", kind: "book", note: "Martin Kleppmann's coverage of partitioning, replication, and consensus relevant to Redis Cluster." },
    { label: "Redis source: cluster.c", kind: "repo", note: "Core cluster implementation: gossip, failover election, slot migration, MOVED/ASK handling." },
    { label: "Redis Cluster and Sentinel in Production (Redis Day talk)", kind: "video", note: "Practical deployment lessons, failure scenarios, and operational tips." },
  ],
  glossary: [
    { term: "Hash slot", definition: "One of 16384 partitions in Redis Cluster. Each key maps to a slot via CRC16(key) mod 16384." },
    { term: "Hash tag", definition: "Substring within curly braces in a key name. Only the hash tag is used for slot computation, allowing co-location of related keys." },
    { term: "MOVED redirection", definition: "Response indicating a slot has been permanently reassigned to another node. Clients should update their slot mapping cache." },
    { term: "ASK redirection", definition: "Response during slot migration indicating a key is on the target node. Client sends ASKING + command to the target without updating cache." },
    { term: "Cluster bus", definition: "Binary protocol on port + 10000 for node-to-node communication: gossip, heartbeats, failure detection, and config updates." },
    { term: "PFAIL (Possibly Failed)", definition: "A node's local determination that another node is unreachable. Upgraded to FAIL when a majority of masters agree." },
    { term: "ODOWN (Objectively Down)", definition: "Sentinel term: a master is confirmed down when the configured quorum of Sentinels agree it is unreachable." },
    { term: "Replica migration", definition: "Automatic redistribution of replicas in Cluster mode from masters with excess replicas to masters that have lost theirs." },
    { term: "Config epoch", definition: "Monotonically increasing counter used to resolve conflicts when multiple nodes claim ownership of the same hash slots." },
    { term: "Replication backlog", definition: "Circular buffer (default 1 MB) on the master storing recent write commands. Enables partial resynchronization after brief replica disconnections." },
  ],
};
