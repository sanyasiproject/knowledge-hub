import type { TopicContent } from "../types";

export const kafkaInternals: TopicContent = {
  quickSummary: [
    "Kafka stores messages in an append-only commit log divided into segments. Each partition is a directory of segment files, with an active segment for writes and older segments for reads.",
    "Replication ensures durability: each partition has a leader (handles all I/O) and follower replicas. The In-Sync Replica (ISR) set tracks followers that are caught up. Writes with acks=all succeed only when all ISR members acknowledge.",
    "Log compaction retains only the latest value per key, turning a topic into a changelog suitable for materializing state. Unlike time-based retention, compacted topics never lose the latest state for any key.",
    "KRaft (Kafka Raft) replaces ZooKeeper for metadata management, embedding consensus directly in the Kafka brokers and eliminating a separate infrastructure dependency.",
  ],
  detailed: [
    "Kafka's storage unit is the log segment. Each partition is a directory (e.g., orders-0/) containing segment files. A segment consists of a .log file (the actual messages), a .index file (offset-to-position mapping for fast lookups), and a .timeindex file (timestamp-to-offset mapping). The active segment receives new writes; when it reaches segment.bytes (default 1GB) or segment.ms (default 7 days), it is rolled and a new active segment is created. Old segments are deleted based on retention.ms (default 7 days) or retention.bytes, or compacted if cleanup.policy=compact.",
    "Each message in the log has a fixed structure: offset (8 bytes), message size (4 bytes), CRC (4 bytes), magic byte (version), attributes (compression, timestamp type), timestamp, key, value, and headers. Messages are stored in batches (RecordBatch) for efficiency. A batch contains a base offset, batch length, partition leader epoch, CRC, attributes (compression codec, transaction flag, control batch flag), first/last timestamps, producer ID, producer epoch, base sequence, and the records themselves. Compression (gzip, snappy, lz4, zstd) is applied at the batch level.",
    "Replication works by having follower replicas fetch data from the leader. Each follower runs a fetcher thread that sends FetchRequests to the leader, identical to how consumers fetch data. The leader tracks each follower's fetch offset. A follower is in the ISR if it has fetched all messages up to the leader's log-end offset (LEO) within replica.lag.time.max.ms (default 30s). If a follower falls behind, it is removed from the ISR. When the leader fails, a new leader is elected from the ISR by the controller. The high-water mark (HW) is the offset up to which all ISR members have replicated -- consumers can only read up to the HW, ensuring they never see messages that might be lost if the leader fails.",
    "The controller is a special broker responsible for administrative operations: partition leader election, ISR changes, topic creation/deletion, and broker registration. In ZooKeeper mode, one broker is elected as controller via a ZooKeeper ephemeral node. If the controller fails, another broker takes over. The controller watches ZooKeeper for broker failures, topic changes, and partition reassignments, then propagates changes to affected brokers via LeaderAndIsr and UpdateMetadata requests.",
    "Log compaction is a background process that ensures a compacted topic retains at least the last value for every key. The log cleaner thread scans dirty (uncompacted) segments, builds an offset map of the latest offset for each key, then rewrites the segments keeping only the latest value per key. Messages with null values (tombstones) are retained for delete.retention.ms (default 24h) to propagate deletions, then removed. Compacted topics are ideal for changelogs, CDC, and materializing state (e.g., __consumer_offsets is a compacted topic keyed by group-partition).",
    "The fetch protocol is used by both consumers and follower replicas. A FetchRequest specifies the topic, partition, fetch offset, and max bytes. The broker reads from the log starting at the requested offset and returns a FetchResponse with the records. For consumers, the broker only returns records up to the high-water mark. For followers, it returns up to the LEO. Fetch requests can include a max wait time (fetch.max.wait.ms) and minimum bytes (fetch.min.bytes) to enable long-polling -- the broker holds the request until enough data is available or the timeout expires, reducing unnecessary round trips.",
  ],
  deepDive: [
    "KRaft (KIP-500) replaces ZooKeeper with a Raft-based consensus protocol embedded in the Kafka brokers. A subset of brokers are designated as controllers and form a quorum. The active controller is the Raft leader. Metadata is stored in an internal topic (__cluster_metadata) replicated via Raft. Benefits over ZooKeeper: eliminates a separate distributed system to operate, faster controller failover (no ZooKeeper session timeout), better scalability for large clusters (metadata is event-sourced rather than stored in ZK znodes), and simplified deployment. KRaft supports millions of partitions versus the ~200K practical limit with ZooKeeper. Migration from ZooKeeper to KRaft is supported via the bridge release (Kafka 3.x).",
    "The ISR mechanism balances durability and availability. With min.insync.replicas=2 and acks=all, a write succeeds only if at least 2 replicas (including the leader) acknowledge. If the ISR shrinks below min.insync.replicas, the leader rejects writes with NotEnoughReplicasException, preserving durability at the cost of availability. Unclean leader election (unclean.leader.election.enable, default false) controls whether a broker outside the ISR can become leader when the entire ISR is unavailable. Enabling it improves availability but risks data loss because the new leader may be missing committed messages.",
    "Zero-copy is a critical performance optimization in Kafka. When a consumer or follower fetches data, the broker uses the sendfile() system call to transfer data directly from the filesystem page cache to the network socket, bypassing user-space buffers. This eliminates two memory copies and two context switches compared to the traditional read()+write() path. Combined with sequential disk I/O (append-only writes, sequential reads), this allows Kafka to achieve throughput limited by network bandwidth rather than disk I/O.",
    "Tiered storage (KIP-405) extends Kafka's retention model by offloading older log segments to remote storage (S3, HDFS, GCS) while keeping recent segments on local disk. This decouples storage from compute -- brokers can have smaller local disks while topics retain data for weeks or months in cheap object storage. When a consumer fetches data from a remote segment, the broker transparently retrieves it from remote storage. Tiered storage is available in Confluent Platform and is being upstreamed to Apache Kafka.",
    "The transaction protocol in Kafka uses a transaction coordinator (a broker that hosts the __transaction_state partition for a given transactional.id). The protocol follows two-phase commit: (1) the producer registers with the coordinator and gets a PID; (2) it sends AddPartitionsToTxn to register partitions participating in the transaction; (3) it produces messages to those partitions with the transactional flag set; (4) it sends EndTxn(COMMIT) to the coordinator; (5) the coordinator writes a COMMIT marker to all participating partitions and updates __transaction_state. Consumers with isolation.level=read_committed skip uncommitted and aborted transactional messages by using the LSO (Last Stable Offset) rather than the HW.",
  ],
  code: [
    {
      language: "bash",
      caption: "Inspecting log segments and offsets on a Kafka broker",
      source: `# List segment files for a partition
ls -la /var/kafka-logs/orders-0/
# 00000000000000000000.log       (first segment)
# 00000000000000000000.index
# 00000000000000000000.timeindex
# 00000000000000524288.log       (second segment, starts at offset 524288)
# 00000000000000524288.index
# 00000000000000524288.timeindex

# Dump log segment contents
kafka-dump-log.sh --files /var/kafka-logs/orders-0/00000000000000000000.log \\
  --print-data-log --max-message-size 1048576

# Check log end offset and ISR for a topic
kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092
# Topic: orders  Partition: 0  Leader: 1  Replicas: 1,2,3  Isr: 1,2,3

# View under-replicated partitions
kafka-topics.sh --describe --under-replicated-partitions \\
  --bootstrap-server localhost:9092`,
    },
    {
      language: "java",
      caption: "Kafka broker configuration for replication and durability",
      source: `// server.properties -- key replication and durability settings

// Number of brokers that must acknowledge a write (topic-level override)
// Set min.insync.replicas=2 with acks=all for strong durability
// min.insync.replicas=2

// Replica lag detection
// replica.lag.time.max.ms=30000  // 30s -- follower removed from ISR if behind

// Unclean leader election -- set false for data safety
// unclean.leader.election.enable=false

// Log segment configuration
// log.segment.bytes=1073741824      // 1 GB per segment
// log.retention.hours=168           // 7 days retention
// log.retention.bytes=-1            // No size limit
// log.cleanup.policy=delete         // or "compact" or "compact,delete"

// Compaction settings
// log.cleaner.enable=true
// log.cleaner.min.cleanable.ratio=0.5
// log.cleaner.threads=1
// min.compaction.lag.ms=0
// delete.retention.ms=86400000      // 24h tombstone retention

// KRaft mode controller settings (replaces ZooKeeper)
// process.roles=broker,controller   // Combined mode
// controller.quorum.voters=1@broker1:9093,2@broker2:9093,3@broker3:9093
// controller.listener.names=CONTROLLER`,
    },
    {
      language: "cpp",
      caption: "Monitoring ISR shrink and under-replicated partitions using librdkafka",
      source: `// Monitor ISR status and detect under-replicated/offline partitions
// using librdkafka's admin API (C++ wrapper).

#include <librdkafka/rdkafkacpp.h>
#include <iostream>
#include <vector>
#include <set>
#include <string>
#include <memory>

struct UnderReplicated {
    std::string topic;
    int partition;
    std::set<int> replicas;
    std::set<int> isr;
    std::set<int> missing;
};

int main() {
    std::string errstr;
    auto conf = std::unique_ptr<RdKafka::Conf>(
        RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL));
    conf->set("bootstrap.servers", "localhost:9092", errstr);

    auto producer = std::unique_ptr<RdKafka::Producer>(
        RdKafka::Producer::create(conf.get(), errstr));
    if (!producer) {
        std::cerr << "Failed to create producer: " << errstr << std::endl;
        return 1;
    }

    // Fetch cluster metadata for all topics
    RdKafka::Metadata* raw_metadata = nullptr;
    RdKafka::ErrorCode err = producer->metadata(
        true,      // all_topics
        nullptr,   // only_topic (null = all)
        &raw_metadata,
        5000       // timeout_ms
    );
    if (err != RdKafka::ERR_NO_ERROR) {
        std::cerr << "Failed to fetch metadata: "
                  << RdKafka::err2str(err) << std::endl;
        return 1;
    }
    std::unique_ptr<RdKafka::Metadata> metadata(raw_metadata);

    std::vector<UnderReplicated> under_replicated;
    std::vector<std::pair<std::string, int>> offline;

    for (const auto* topic : *metadata->topics()) {
        for (const auto* partition : *topic->partitions()) {
            int p_id = partition->id();
            int leader = partition->leader();

            // Collect replica and ISR sets
            std::set<int> replicas;
            for (const auto& r : *partition->replicas())
                replicas.insert(r);

            std::set<int> isr;
            for (const auto& i : *partition->isrs())
                isr.insert(i);

            // Check for under-replication
            if (isr.size() < replicas.size()) {
                std::set<int> missing;
                std::set_difference(
                    replicas.begin(), replicas.end(),
                    isr.begin(), isr.end(),
                    std::inserter(missing, missing.begin())
                );
                under_replicated.push_back({
                    topic->topic(), p_id, replicas, isr, missing
                });
            }

            // Check for offline partitions
            if (leader == -1) {
                offline.push_back({topic->topic(), p_id});
            }
        }
    }

    // Report findings
    if (!under_replicated.empty()) {
        std::cout << "UNDER-REPLICATED PARTITIONS:" << std::endl;
        for (const auto& ur : under_replicated) {
            std::cout << "  " << ur.topic << "-" << ur.partition
                      << ": ISR={";
            for (auto it = ur.isr.begin(); it != ur.isr.end(); ++it)
                std::cout << (it != ur.isr.begin() ? "," : "") << *it;
            std::cout << "}, missing={";
            for (auto it = ur.missing.begin(); it != ur.missing.end(); ++it)
                std::cout << (it != ur.missing.begin() ? "," : "") << *it;
            std::cout << "}" << std::endl;
        }
    }

    if (!offline.empty()) {
        std::cout << "OFFLINE PARTITIONS:" << std::endl;
        for (const auto& op : offline)
            std::cout << "  " << op.first << "-" << op.second << std::endl;
    }

    std::cout << "Summary: " << under_replicated.size()
              << " under-replicated, " << offline.size()
              << " offline" << std::endl;

    return 0;
}`,
    },
    {
      language: "java",
      caption: "Producing to a compacted topic with tombstone deletion",
      source: `Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("acks", "all");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Topic config: cleanup.policy=compact
// Key is mandatory for compacted topics
String userId = "user-42";

// Write initial state
producer.send(new ProducerRecord<>("user-profiles", userId,
    "{\"name\":\"Alice\",\"email\":\"alice@example.com\"}"));

// Update state -- compaction will keep only this latest value
producer.send(new ProducerRecord<>("user-profiles", userId,
    "{\"name\":\"Alice\",\"email\":\"alice@newdomain.com\"}"));

// Delete the key by sending a tombstone (null value)
// Tombstone retained for delete.retention.ms (default 24h)
// then removed by compaction
producer.send(new ProducerRecord<>("user-profiles", userId, null));

producer.flush();
producer.close();`,
    },
  ],
  diagrams: [
    {
      title: "Kafka Partition Replication",
      kind: "architecture",
      caption: "Leader handles reads/writes; followers fetch from leader. ISR tracks caught-up replicas.",
      mermaid: `graph LR
    Producer["Producer"] -->|write| Leader["Partition Leader\nBroker 1"]
    Leader -->|replicate| F1["Follower\nBroker 2"]
    Leader -->|replicate| F2["Follower\nBroker 3"]
    F1 -->|ack in ISR| Leader
    F2 -->|ack in ISR| Leader
    Consumer["Consumer Group"] -->|read up to HWM| Leader
    subgraph ISR["In-Sync Replicas"]
      Leader
      F1
      F2
    end`,
    },
    {
      title: "Kafka Producer Message Flow",
      kind: "sequence",
      caption: "Shows how a producer sends a record through batching, partitioning, and broker acknowledgement.",
      mermaid: `sequenceDiagram
    participant App as Application
    participant P as Producer
    participant B as Broker Leader
    participant R as Replica

    App->>P: send record key value
    P->>P: serialize and partition
    P->>P: accumulate in RecordBatch
    P->>B: ProduceRequest batch
    B->>B: write to log segment
    B->>R: replicate to followers
    R-->>B: follower ack
    B-->>P: ProduceResponse offset
    P-->>App: RecordMetadata`,
    },
    {
      title: "KRaft Controller Architecture",
      kind: "network",
      caption: "Controller quorum uses Raft consensus. No external ZooKeeper dependency.",
      mermaid: `graph TD
    subgraph Controllers["Controller Quorum - KRaft"]
      C1["Controller 1\nRaft Leader"]
      C2["Controller 2\nFollower"]
      C3["Controller 3\nFollower"]
      C1 -->|replicate metadata| C2
      C1 -->|replicate metadata| C3
    end
    C1 -->|push metadata| B1["Broker 1"]
    C1 -->|push metadata| B2["Broker 2"]
    C1 -->|push metadata| B3["Broker 3"]
    Clients["Producers and Consumers"] -->|bootstrap| B1`,
    },
    {
      title: "Log Compaction Flow",
      kind: "flow",
      caption: "Cleaner scans dirty segments, builds key-offset map, rewrites keeping only the latest value per key.",
      mermaid: `flowchart TD
    A["Log segments with duplicate keys"] --> B["Cleaner thread scans dirty segments"]
    B --> C["Build key-to-latest-offset map"]
    C --> D["Rewrite segments, keep only latest value per key"]
    D --> E{"Tombstone records found?"}
    E -->|Yes| F["Retain until tombstone TTL expires"]
    E -->|No| G["Compacted segment written"]
    F --> G
    G --> H["Old dirty segments deleted"]
    H --> I["Compaction complete - log smaller"]`,
    },
  ],
  animations: [
    {
      title: "Leader Election on Broker Failure",
      steps: [
        { label: "Normal operation", detail: "Partition P0: Leader=Broker1, ISR={Broker1, Broker2, Broker3}. All replicas in sync." },
        { label: "Leader fails", detail: "Broker1 crashes. Controller detects via missing heartbeat (or ZK session timeout)." },
        { label: "New leader selected", detail: "Controller selects Broker2 (first in ISR list) as new leader for P0." },
        { label: "Metadata updated", detail: "Controller sends LeaderAndIsr request to Broker2 and UpdateMetadata to all brokers." },
        { label: "Producers redirect", detail: "Producers receive NOT_LEADER error on next send to Broker1. Metadata refresh points to Broker2." },
        { label: "ISR adjusts", detail: "ISR is now {Broker2, Broker3}. Broker1 removed. When Broker1 recovers, it fetches from Broker2 and rejoins ISR." },
      ],
    },
    {
      title: "Log Compaction Step by Step",
      steps: [
        { label: "Dirty segments accumulate", detail: "Topic has messages: {A:1}, {B:2}, {A:3}, {C:4}, {B:5}, {A:6}. Keys A, B, C." },
        { label: "Cleaner builds offset map", detail: "Scans dirty segments. Latest offsets: A->6, B->5, C->4." },
        { label: "Rewrite clean segment", detail: "Copies only latest per key: {C:4}, {B:5}, {A:6}. Older versions of A and B discarded." },
        { label: "Tombstone handling", detail: "If {B:null} arrives (tombstone), B is marked for deletion. Retained for delete.retention.ms." },
        { label: "Tombstone expires", detail: "After 24h (default), tombstone is removed. Key B no longer exists in the topic." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "ZooKeeper Mode", "KRaft Mode"],
    rows: [
      ["External dependency", "Requires ZooKeeper ensemble", "Self-contained in Kafka brokers"],
      ["Metadata storage", "ZooKeeper znodes", "__cluster_metadata internal topic"],
      ["Controller election", "ZK ephemeral node", "Raft leader election"],
      ["Partition limit", "~200K practical limit", "Millions of partitions"],
      ["Failover speed", "Slower (ZK session timeout)", "Faster (Raft leader election)"],
      ["Operational complexity", "Two systems to manage", "Single system"],
      ["Maturity", "Stable, battle-tested", "GA since Kafka 3.3, production-ready"],
      ["Migration path", "N/A", "Bridge release for online migration"],
    ],
  },
  interviewQA: [
    {
      q: "What is the ISR and why does it matter?",
      a: "The In-Sync Replica (ISR) set contains replicas that have fully caught up with the leader within replica.lag.time.max.ms. When acks=all, the leader waits for all ISR members to acknowledge before confirming a write. If a follower falls behind, it is removed from the ISR, and writes continue with fewer acknowledgments. The ISR balances durability and availability: a larger ISR means more copies of data (higher durability) but potentially slower writes. Combined with min.insync.replicas, the ISR determines whether the partition accepts writes at all.",
      followUps: [
        "What happens when the ISR shrinks to just the leader?",
        "What is unclean leader election?",
        "How does min.insync.replicas interact with acks=all?",
      ],
    },
    {
      q: "How does Kafka achieve high throughput with disk-based storage?",
      a: "Three key optimizations: (1) Sequential I/O -- Kafka appends to the end of log files and reads sequentially, which is fast on both spinning disks and SSDs because it avoids random seeks. (2) Zero-copy -- the sendfile() system call transfers data directly from the OS page cache to the network socket without copying through user-space buffers. (3) Batching -- messages are grouped into RecordBatches for writes and fetches, amortizing overhead. Combined with OS page cache (Kafka delegates caching to the OS instead of managing its own), these make Kafka's disk-based storage competitive with in-memory systems.",
      followUps: [
        "What is zero-copy and how does sendfile() work?",
        "Why does Kafka not use its own cache?",
      ],
    },
    {
      q: "Explain log compaction in Kafka.",
      a: "Log compaction ensures a topic retains at least the latest value for every key indefinitely. Unlike time-based retention (which deletes old segments), compaction rewrites segments keeping only the most recent record per key. The cleaner thread scans dirty (uncompacted) log segments, builds an offset map of the latest offset for each key, then creates new segments containing only those latest records. Null-value records (tombstones) signal key deletion and are retained for delete.retention.ms before removal. Compacted topics are used for CDC, state materialization, and internal topics like __consumer_offsets.",
      followUps: [
        "Can a topic use both compaction and time-based retention?",
        "What is a tombstone in log compaction?",
        "How does min.compaction.lag.ms affect compaction?",
      ],
    },
    {
      q: "What is KRaft and why is Kafka moving away from ZooKeeper?",
      a: "KRaft (Kafka Raft, KIP-500) replaces ZooKeeper with an embedded Raft-based consensus protocol for metadata management. A quorum of controller brokers manages cluster metadata in an internal __cluster_metadata topic. Benefits: eliminates a separate ZooKeeper cluster to deploy and monitor, enables faster controller failover, supports millions of partitions (versus ~200K with ZK), and simplifies the architecture. KRaft became production-ready in Kafka 3.3 and is the default in Kafka 4.0. ZooKeeper support is being removed.",
    },
  ],
  followUps: [
    "What does `acks=all` plus `min.insync.replicas` actually guarantee?",
    "How does the page cache make Kafka fast, and what happens when it's cold?",
    "What is a compacted topic for, and what can't you do with one?",
  ],
  mcqs: [
    {
      q: "What is the high-water mark in Kafka replication?",
      options: [
        "The maximum number of messages a producer can send per second",
        "The offset up to which all ISR replicas have replicated",
        "The maximum size of a log segment",
        "The threshold for triggering log compaction",
      ],
      answerIndex: 1,
      explanation: "The high-water mark (HW) is the highest offset that all ISR members have replicated. Consumers can only read up to the HW to prevent reading uncommitted data.",
    },
    {
      q: "What system call does Kafka use for zero-copy data transfer?",
      options: [
        "mmap()",
        "splice()",
        "sendfile()",
        "write()",
      ],
      answerIndex: 2,
      explanation: "Kafka uses sendfile() to transfer data directly from the page cache to the network socket without copying through user-space memory.",
    },
    {
      q: "In a compacted topic, what does a message with a null value represent?",
      options: [
        "An empty update",
        "A tombstone -- signals deletion of the key",
        "A compaction marker",
        "An error record",
      ],
      answerIndex: 1,
      explanation: "A null-value message (tombstone) tells the compaction process to eventually remove all records for that key after delete.retention.ms expires.",
    },
    {
      q: "What does min.insync.replicas=2 with acks=all guarantee?",
      options: [
        "At least 2 brokers are running",
        "At least 2 replicas (including leader) must acknowledge before a write succeeds",
        "The topic has at least 2 partitions",
        "At least 2 consumers must process each message",
      ],
      answerIndex: 1,
      explanation: "min.insync.replicas sets the minimum number of ISR members that must acknowledge a write when acks=all. If ISR < min.insync.replicas, writes are rejected.",
    },
    {
      q: "In KRaft mode, where is cluster metadata stored?",
      options: [
        "In ZooKeeper znodes",
        "In a local file on the controller broker",
        "In the __cluster_metadata internal topic",
        "In the __consumer_offsets topic",
      ],
      answerIndex: 2,
      explanation: "KRaft stores cluster metadata in the __cluster_metadata internal topic, replicated via the Raft protocol among controller quorum members.",
    },
  ],
  flashcards: [
    { front: "Log segment", back: "Physical storage unit: .log (data), .index (offset lookup), .timeindex (time lookup). Rolls at 1GB or 7 days." },
    { front: "ISR (In-Sync Replicas)", back: "Set of replicas caught up within replica.lag.time.max.ms. acks=all waits for ISR acknowledgment." },
    { front: "High-water mark (HW)", back: "Offset up to which all ISR members have replicated. Consumers read only up to HW." },
    { front: "Log compaction", back: "Retains latest value per key. Cleaner rewrites segments. Tombstones (null value) delete keys after TTL." },
    { front: "Zero-copy (sendfile)", back: "Transfers data from page cache to socket without user-space copy. Key to Kafka's throughput." },
    { front: "KRaft", back: "Raft-based metadata consensus embedded in Kafka. Replaces ZooKeeper. Stores metadata in __cluster_metadata." },
    { front: "Controller", back: "Broker managing leader elections, ISR changes, topic operations. One controller in ZK mode; quorum in KRaft." },
    { front: "Unclean leader election", back: "Allowing a non-ISR replica to become leader. Improves availability but risks data loss. Default: disabled." },
    { front: "min.insync.replicas", back: "Minimum ISR size for acks=all writes to succeed. Prevents writes when too few replicas are in sync." },
    { front: "RecordBatch", back: "Kafka's on-disk and wire format. Groups multiple records with shared metadata. Compression applied at batch level." },
  ],
  revisionNotes: [
    "Partition = directory of segment files (.log, .index, .timeindex). Active segment receives writes.",
    "Segment rolls at segment.bytes (1GB) or segment.ms (7 days). Old segments deleted by retention policy or compacted.",
    "Replication: leader handles all I/O. Followers fetch from leader. ISR = followers within replica.lag.time.max.ms.",
    "High-water mark = offset replicated to all ISR. Consumers read up to HW only. Prevents reading uncommitted data.",
    "min.insync.replicas + acks=all = strong durability. ISR < min.insync.replicas = writes rejected.",
    "Unclean leader election: non-ISR replica becomes leader. Availability vs data loss tradeoff. Default false.",
    "Log compaction: keeps latest value per key. Tombstones (null value) expire after delete.retention.ms.",
    "Zero-copy via sendfile(): page cache -> socket. No user-space copy. Key performance optimization.",
    "KRaft: Raft consensus in Kafka brokers. __cluster_metadata topic. Replaces ZooKeeper. Millions of partitions.",
    "Controller: manages leader elections, ISR, topic ops. ZK mode: single controller. KRaft: controller quorum.",
  ],
  cheatSheet: [
    "Dump log: kafka-dump-log.sh --files <path>.log --print-data-log",
    "Under-replicated: kafka-topics.sh --describe --under-replicated-partitions",
    "ISR config: replica.lag.time.max.ms=30000 (default)",
    "Durability: replication.factor=3, min.insync.replicas=2, acks=all",
    "Compaction: cleanup.policy=compact, log.cleaner.enable=true",
    "Tombstone: produce null value for key. Retained delete.retention.ms (24h default)",
    "KRaft: process.roles=broker,controller, controller.quorum.voters=...",
    "Segment: log.segment.bytes=1GB, log.retention.hours=168",
    "Zero-copy: automatic via sendfile(). No config needed.",
    "Unclean election: unclean.leader.election.enable=false (default, safe)",
  ],
  resources: [
    { label: "Kafka Design Documentation", kind: "docs", note: "Official Apache Kafka design docs covering storage, replication, and protocol" },
    { label: "KIP-500: Replace ZooKeeper with Self-Managed Metadata Quorum", kind: "docs", note: "The KRaft design document" },
    { label: "Kafka: The Definitive Guide", kind: "book", note: "O'Reilly book covering Kafka internals comprehensively" },
    { label: "The Log: What every software engineer should know", kind: "article", note: "Jay Kreps' foundational article on append-only logs" },
    { label: "Designing Data-Intensive Applications (Ch. 3, 11)", kind: "book", note: "Martin Kleppmann on storage engines and stream processing" },
    { label: "KIP-405: Tiered Storage", kind: "docs", note: "Design document for offloading old segments to remote storage" },
  ],
  glossary: [
    { term: "Log segment", definition: "A file-based storage unit within a partition, consisting of .log, .index, and .timeindex files." },
    { term: "ISR (In-Sync Replicas)", definition: "The set of replicas that have fully caught up with the partition leader within the configured lag threshold." },
    { term: "High-water mark", definition: "The highest offset replicated to all ISR members. Consumers cannot read beyond this offset." },
    { term: "Log compaction", definition: "A cleanup policy that retains only the latest record for each key in a topic partition." },
    { term: "Tombstone", definition: "A record with a null value that signals deletion of a key during log compaction." },
    { term: "Zero-copy", definition: "A technique using sendfile() to transfer data directly from filesystem cache to network socket without user-space copies." },
    { term: "KRaft", definition: "Kafka's embedded Raft-based consensus protocol for metadata management, replacing ZooKeeper." },
    { term: "Controller", definition: "A broker responsible for partition leader elections, ISR management, and cluster metadata operations." },
    { term: "RecordBatch", definition: "Kafka's wire and disk format grouping multiple records with shared metadata and batch-level compression." },
    { term: "LEO (Log End Offset)", definition: "The offset of the next message to be written to a partition. Each replica tracks its own LEO." },
  ],
  exercises: [
    "You have a Kafka topic with `replication.factor=3`, `min.insync.replicas=2`, and `acks=all`. One broker goes down. Describe what happens to **writes** and **reads**. Now a *second* broker goes down -- what changes? Explain the role of the **ISR** and **high-water mark** at each stage.",
    "Design a **log-compacted topic** for a user-profile service. Specify the key, value schema, and `cleanup.policy`. How would you handle a *GDPR delete request* using **tombstones**? What is the significance of `delete.retention.ms` in this scenario?",
    "Compare the operational impact of running Kafka in **ZooKeeper mode** versus **KRaft mode**. Write a brief migration plan listing the steps to move a 50-broker cluster from ZooKeeper to KRaft, and identify the risks at each step.",
    "A consumer group is reading a topic with 12 partitions but consumers report *increasing lag*. Using `kafka-consumer-groups.sh --describe`, you find that 4 partitions have lag > 1 million. Walk through your **troubleshooting process**: which metrics would you check, and how would you determine if the bottleneck is producer throughput, consumer processing speed, or ISR issues?",
    "Explain how Kafka's **zero-copy** optimization works at the system-call level (`sendfile()`). Draw the data path *with* and *without* zero-copy, counting the number of memory copies and context switches in each case. Why does this matter more for Kafka than for a typical web server?",
  ],
};
