import type { TopicContent } from "../types";

export const designMessageQueue: TopicContent = {
  quickSummary: [
    "A message queue decouples producers from consumers, enabling asynchronous communication, load leveling, and fault tolerance across distributed services. Systems like Kafka achieve millions of messages per second by leveraging append-only logs, sequential disk I/O, and zero-copy transfers.",
    "Topics partition messages across brokers; each partition is an ordered, immutable sequence of records. Consumers track their position via offsets, allowing replay, independent pacing, and exactly-once or at-least-once delivery semantics depending on configuration.",
    "Consumer groups enable parallel consumption: each partition is assigned to exactly one consumer in a group, so adding consumers scales throughput linearly up to the partition count. Rebalancing redistributes partitions when consumers join or leave.",
    "Delivery guarantees range from at-most-once (fire and forget, lowest latency) through at-least-once (ack after processing, may duplicate) to exactly-once (idempotent producers plus transactional consumers, highest overhead). Choosing the right guarantee is a core design decision.",
    "Dead letter queues (DLQs) capture messages that fail processing after a configurable retry count, preventing poison messages from blocking the pipeline while preserving them for debugging and reprocessing.",
  ],

  detailed: [
    "## Topics, Partitions, and Ordering\nA topic is a logical channel for a category of messages. Each topic is split into partitions, which are the unit of parallelism, storage, and replication. Within a single partition, messages are strictly ordered by offset, but there is no global ordering across partitions. To maintain ordering for related events (e.g., all updates for user 42), producers hash a partition key so related messages land in the same partition. Kafka typically runs 6-30 partitions per topic for moderate-throughput use cases and hundreds for high-throughput topics. Each partition is replicated across multiple brokers (replication factor 3 is standard), with one replica elected as leader handling all reads and writes while followers replicate asynchronously or synchronously depending on `acks` configuration.",

    "## Consumer Groups, Offsets, and Rebalancing\nA consumer group is a set of consumer instances that cooperatively consume a topic. Each partition is assigned to exactly one consumer in the group, so the maximum parallelism equals the partition count. When a consumer joins or crashes, a rebalance redistributes partitions. Kafka's cooperative sticky assignor minimizes partition movement during rebalances, reducing the pause window from seconds to milliseconds. Consumers track their position using offsets stored in the internal `__consumer_offsets` topic. Committing offsets after processing gives at-least-once semantics; committing before processing gives at-most-once. For exactly-once, the consumer must commit the offset and the processing result atomically, typically using Kafka transactions or an idempotent external store.",

    "## Delivery Guarantees and Idempotency\nAt-most-once delivery commits the offset before processing: if the consumer crashes mid-processing, the message is skipped on restart. At-least-once delivery commits after processing: a crash means the message is reprocessed, so consumers must be idempotent. Exactly-once in Kafka combines idempotent producers (`enable.idempotence=true`, which deduplicates based on producer ID and sequence number) with transactional consumers that atomically commit offsets and output records. The overhead is roughly 3-5% additional latency. RabbitMQ achieves at-least-once via manual acks and publisher confirms, but lacks native exactly-once; applications must implement deduplication. The choice of guarantee directly impacts throughput, latency, and application complexity.",

    "## Persistence, Retention, and Log Compaction\nKafka persists all messages to disk as an append-only log, achieving throughput of 1-2 million messages per second per broker for small messages by exploiting sequential writes and OS page cache. Retention can be time-based (e.g., 7 days) or size-based (e.g., 500 GB per partition). Log compaction is an alternative retention policy that keeps only the latest value for each key, turning the topic into a changelog suitable for materialized views or state reconstruction. Segments are the physical storage unit: active segments receive writes while closed segments are eligible for compaction or deletion. Zero-copy transfer via `sendfile()` lets brokers serve consumers without copying data through userspace, reducing CPU usage by up to 50%.",

    "## Replication, ISR, and Unclean Leader Election\nEvery partition has one leader replica and N-1 followers spread across brokers (replication factor 3 is the production standard). Followers continuously fetch from the leader; those caught up within `replica.lag.time.max.ms` (default 30s) form the In-Sync Replica set (ISR). With `acks=all` and `min.insync.replicas=2`, a produce request succeeds only after at least 2 ISR members have the record, so the cluster tolerates one broker failure with zero data loss. When a leader dies, the controller elects a new leader from the ISR — a clean election that loses nothing. The dangerous knob is `unclean.leader.election.enable`: if true, an out-of-sync replica can become leader when no ISR member survives, restoring availability but silently discarding every record the dead leader had that the new leader did not.\nKey insight: unclean leader election is the CAP theorem made concrete — enabling it chooses availability over consistency; disabling it (the default since Kafka 0.11) means the partition stays offline until an ISR replica returns.\nCommon mistake: setting min.insync.replicas equal to the replication factor. Then a single broker restart makes the partition unwritable, because the ISR can no longer satisfy the minimum. Use RF=3 with min.insync.replicas=2.",

    "## Ordering Guarantees and Key-Based Partitioning\nA distributed log gives strict ordering only within a single partition — there is no global order across a topic. Producers achieve business-level ordering by choosing a partition key: the default partitioner hashes the key (murmur2) so all messages with the same key land in the same partition and are consumed in append order. For example, keying by `order_id` guarantees that ORDER_CREATED, ORDER_PAID, and ORDER_SHIPPED for one order are processed in sequence, even though events for different orders interleave freely. Producer retries can still reorder messages within a partition unless `enable.idempotence=true` (which also caps `max.in.flight.requests.per.connection` at 5 with sequence-number checks).\nCommon mistake: choosing a low-cardinality key (like country code) creates hot partitions — one partition takes most of the traffic while others idle, capping throughput at a single leader's capacity regardless of how many brokers you add.\nIn practice: if you need total ordering across all messages, you are forced to a single partition (single-consumer throughput ceiling) — a strong signal to redesign the requirement around per-entity ordering instead.",

    "## Pull vs Push: Kafka vs RabbitMQ\nKafka consumers pull: they issue fetch requests at their own pace, which gives natural backpressure, cheap batching, and the ability to replay history by rewinding an offset — the broker keeps data regardless of consumption. RabbitMQ pushes messages to consumers (with a prefetch window as flow control) and deletes them once acked, which gives lower per-message latency for lightly loaded task queues and rich routing via exchanges (direct, topic, fanout, headers), but no replay and much lower throughput per node (~30-50K msg/s vs 1M+). Choose RabbitMQ-style brokers for work distribution, RPC, and complex routing with modest volume; choose a log-based system like Kafka for event streaming, fan-out to many independent consumer groups, high throughput, and replayability.\nKey insight: the deepest difference is who owns the cursor — in Kafka the consumer owns its offset (broker is a dumb, fast log); in RabbitMQ the broker tracks per-message delivery state, which is exactly what makes it flexible for routing and expensive at scale.",

    "## Backpressure, DLQs, and Failure Handling\nBackpressure prevents fast producers from overwhelming slow consumers. In Kafka, consumers pull messages at their own pace, providing natural backpressure. RabbitMQ can apply credit-based flow control to publishers when queues grow beyond thresholds. Dead letter queues capture messages that fail processing after a configurable retry count (typically 3-5 retries with exponential backoff). The DLQ preserves the original message, headers, and failure metadata for later inspection and reprocessing. Circuit breakers can pause consumption when downstream services are unhealthy, and rate limiters can smooth bursty traffic. Monitoring consumer lag (the gap between the latest produced offset and the latest committed offset) is critical: lag growing over time indicates the consumer cannot keep up and may need horizontal scaling or processing optimization.",
  ],

  deepDive: [
    "Kafka's storage engine is a log-structured design where each partition maps to a directory of segment files on disk. Each segment consists of a `.log` file (message data), an `.index` file (offset to physical position mapping), and a `.timeindex` file (timestamp to offset mapping). When a consumer requests messages starting from offset N, the broker binary-searches the sparse index to find the segment and position, then streams sequentially from there using zero-copy via the `sendfile` system call. This design turns random read patterns into sequential ones, which is why Kafka can serve historical reads at nearly the same throughput as real-time tailing. The segment size (default 1 GB) balances index granularity against file handle count, and the index interval (default 4 KB) trades memory for seek precision.",

    "Exactly-once semantics (EOS) in Kafka is a multi-layered protocol. The idempotent producer assigns each batch a monotonically increasing sequence number scoped to a producer ID and partition. The broker rejects duplicates by tracking the last five sequence numbers per producer-partition pair, which requires about 7 KB of memory per partition. For cross-partition atomicity, Kafka transactions use a transaction coordinator that writes prepare and commit markers to a __transaction_state topic. The consumer, configured with isolation.level=read_committed, skips uncommitted messages. The end-to-end overhead of EOS is approximately 3-5% additional latency and 10-20% more broker CPU, making it practical for financial and inventory systems where correctness outweighs raw speed.",

    "Partition assignment strategies profoundly affect throughput uniformity and rebalance impact. The range assignor distributes partitions alphabetically, which can create imbalance when topic counts are not divisible by consumer counts. The round-robin assignor distributes more evenly but reshuffles many partitions on rebalance. The sticky assignor minimizes movement by reassigning only the partitions from departed consumers. The cooperative sticky assignor goes further by performing incremental rebalances: instead of revoking all partitions and reassigning, it only revokes the partitions that need to move, allowing other partitions to continue being consumed during the rebalance. This reduces rebalance pauses from the entire rebalance duration (potentially seconds) to just the time needed to transfer a few partitions (typically tens of milliseconds).",

    "Capacity planning for a message queue is an arithmetic exercise, and interviewers expect you to show the numbers. Ingest: 1M msg/s x 1 KB per message = 1 GB/s of raw write bandwidth. With replication factor 3, the cluster absorbs 3 GB/s of writes (1 GB/s from producers + 2 GB/s of inter-broker replication traffic). Add read traffic: 2 consumer groups reading everything doubles egress to 2 GB/s, so total cluster network is roughly 5 GB/s. A 10 Gbps NIC delivers ~1.2 GB/s, so budgeting brokers at ~50% NIC utilization (~600 MB/s each) gives 5 GB/s / 0.6 GB/s = ~9 brokers minimum; provision 12 for failure headroom. Storage: 7-day retention at 1 GB/s = 86,400 s/day x 7 days x 1 GB/s = ~605 TB of raw data, x3 replication = ~1.8 PB cluster-wide, or ~150 TB per broker across 12 brokers — before compression, which typically cuts this 3-4x (LZ4/Zstd), landing at ~40-50 TB per broker. Partition count comes from the consumer side: if one consumer thread sustains 10K msg/s, you need 1M / 10K = 100 consumers, hence at least 100 partitions; over-provision 2-3x (200-300 partitions) because adding partitions later breaks key-to-partition mapping. Memory: 6-8 GB JVM heap per broker, with the remaining RAM (64-128 GB) left to the OS page cache so tail reads never touch disk. Disk is rarely the bottleneck — sequential writes on NVMe do 2-3 GB/s — the network and replication fan-out are.",

    "Consumer group rebalancing is where message queue designs feel their operational pain, and the protocol choice matters. The eager (stop-the-world) protocol, used by the range and round-robin assignors, revokes ALL partitions from ALL consumers at the start of every rebalance: every consumer stops, rejoins the group, waits for the leader to compute assignments, and only then resumes. For a group with hundreds of partitions and stateful consumers, this pause can last seconds to minutes and shows up as a latency cliff on every deploy or pod restart. The cooperative (incremental) protocol fixes this with a two-phase approach: consumers keep their current partitions during the rebalance, the assignor computes which partitions must actually move, only those are revoked in a first rebalance, and a second rebalance assigns them to their new owners — unaffected partitions never stop. Complementary mechanisms reduce rebalance frequency itself: static group membership (group.instance.id) lets a restarting consumer reclaim its old partitions within session.timeout.ms without triggering any rebalance, which is essential on Kubernetes where pods restart routinely. Tune session.timeout.ms (how long before a silent consumer is evicted) against max.poll.interval.ms (how long processing one batch may take) — misconfiguring the latter is a classic cause of rebalance storms, where a slow consumer is repeatedly evicted, triggers a rebalance, rejoins, and gets evicted again.",
  ],

  code: [
    {
      language: "cpp",
      caption: "Log-structured storage for messages: append-only segment files with sparse index",
      source: `#include <cstdint>
#include <fstream>
#include <string>
#include <unordered_map>
#include <vector>
#include <filesystem>
#include <mutex>
#include <stdexcept>

struct Message {
    int64_t offset;
    int64_t timestamp;
    std::string key;
    std::string value;

    size_t serializedSize() const {
        // 8 (offset) + 8 (timestamp) + 4 (key len) + key + 4 (val len) + value
        return 24 + key.size() + value.size();
    }
};

// Sparse index entry: maps offset -> file position
struct IndexEntry {
    int64_t offset;
    int64_t position;
};

class Segment {
    std::string basePath_;
    int64_t baseOffset_;
    int64_t nextOffset_;
    int64_t filePosition_ = 0;
    int64_t indexInterval_ = 4096; // index every 4KB of data
    int64_t bytesSinceIndex_ = 0;
    std::vector<IndexEntry> sparseIndex_;
    static constexpr int64_t MAX_SEGMENT_SIZE = 1L << 30; // 1 GB

public:
    Segment(const std::string& dir, int64_t baseOffset)
        : basePath_(dir + "/" + std::to_string(baseOffset))
        , baseOffset_(baseOffset)
        , nextOffset_(baseOffset) {}

    int64_t baseOffset() const { return baseOffset_; }
    int64_t nextOffset() const { return nextOffset_; }
    bool isFull() const { return filePosition_ >= MAX_SEGMENT_SIZE; }

    int64_t append(const std::string& key, const std::string& value) {
        Message msg{nextOffset_, currentTimestamp(), key, value};

        // Add sparse index entry if enough bytes have passed
        if (bytesSinceIndex_ >= indexInterval_) {
            sparseIndex_.push_back({msg.offset, filePosition_});
            bytesSinceIndex_ = 0;
        }

        size_t written = msg.serializedSize();
        filePosition_ += written;
        bytesSinceIndex_ += written;
        return nextOffset_++;
    }

    // Binary search the sparse index to find starting position
    int64_t findPosition(int64_t targetOffset) const {
        if (sparseIndex_.empty()) return 0;
        int lo = 0, hi = static_cast<int>(sparseIndex_.size()) - 1;
        int64_t bestPos = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (sparseIndex_[mid].offset <= targetOffset) {
                bestPos = sparseIndex_[mid].position;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return bestPos; // scan forward from here
    }

private:
    static int64_t currentTimestamp() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }
};

class PartitionLog {
    std::string dir_;
    std::vector<std::unique_ptr<Segment>> segments_;
    std::mutex mu_;

public:
    explicit PartitionLog(const std::string& dir) : dir_(dir) {
        std::filesystem::create_directories(dir);
        segments_.push_back(std::make_unique<Segment>(dir, 0));
    }

    int64_t append(const std::string& key, const std::string& value) {
        std::lock_guard lock(mu_);
        auto& active = segments_.back();
        if (active->isFull()) {
            int64_t nextBase = active->nextOffset();
            segments_.push_back(std::make_unique<Segment>(dir_, nextBase));
        }
        return segments_.back()->append(key, value);
    }

    int64_t latestOffset() const {
        return segments_.back()->nextOffset() - 1;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Partition assignment using consistent hashing for consumer groups",
      source: `#include <cstdint>
#include <functional>
#include <map>
#include <string>
#include <vector>
#include <algorithm>
#include <iostream>

// Assigns partitions to consumers within a consumer group.
// Supports range, round-robin, and sticky assignment strategies.

struct PartitionAssignment {
    int partitionId;
    std::string consumerId;
};

class ConsumerGroup {
    std::string groupId_;
    std::vector<std::string> consumers_;
    int numPartitions_;
    // Previous assignment for sticky rebalancing
    std::map<int, std::string> prevAssignment_;

public:
    ConsumerGroup(const std::string& groupId, int numPartitions)
        : groupId_(groupId), numPartitions_(numPartitions) {}

    void addConsumer(const std::string& consumerId) {
        consumers_.push_back(consumerId);
    }

    void removeConsumer(const std::string& consumerId) {
        consumers_.erase(
            std::remove(consumers_.begin(), consumers_.end(), consumerId),
            consumers_.end()
        );
    }

    // Range assignment: divide partitions into contiguous ranges
    std::vector<PartitionAssignment> rangeAssign() const {
        std::vector<PartitionAssignment> result;
        if (consumers_.empty()) return result;

        int perConsumer = numPartitions_ / static_cast<int>(consumers_.size());
        int remainder = numPartitions_ % static_cast<int>(consumers_.size());
        int partition = 0;

        for (size_t i = 0; i < consumers_.size(); ++i) {
            int count = perConsumer + (static_cast<int>(i) < remainder ? 1 : 0);
            for (int j = 0; j < count; ++j) {
                result.push_back({partition++, consumers_[i]});
            }
        }
        return result;
    }

    // Round-robin assignment: distribute partitions evenly
    std::vector<PartitionAssignment> roundRobinAssign() const {
        std::vector<PartitionAssignment> result;
        if (consumers_.empty()) return result;

        for (int p = 0; p < numPartitions_; ++p) {
            result.push_back({p, consumers_[p % consumers_.size()]});
        }
        return result;
    }

    // Sticky assignment: minimize partition movement during rebalance
    std::vector<PartitionAssignment> stickyAssign() {
        std::vector<PartitionAssignment> result;
        if (consumers_.empty()) return result;

        std::set<std::string> activeConsumers(consumers_.begin(), consumers_.end());
        std::set<int> assignedPartitions;

        // Phase 1: retain valid previous assignments
        for (auto& [partId, consumerId] : prevAssignment_) {
            if (activeConsumers.count(consumerId) && partId < numPartitions_) {
                result.push_back({partId, consumerId});
                assignedPartitions.insert(partId);
            }
        }

        // Phase 2: assign unassigned partitions via round-robin
        std::vector<int> unassigned;
        for (int p = 0; p < numPartitions_; ++p) {
            if (!assignedPartitions.count(p)) {
                unassigned.push_back(p);
            }
        }

        // Count current assignments per consumer
        std::map<std::string, int> load;
        for (auto& c : consumers_) load[c] = 0;
        for (auto& a : result) load[a.consumerId]++;

        // Assign remaining to least-loaded consumers
        for (int p : unassigned) {
            auto minIt = std::min_element(load.begin(), load.end(),
                [](auto& a, auto& b) { return a.second < b.second; });
            result.push_back({p, minIt->first});
            minIt->second++;
        }

        // Update previous assignment for next rebalance
        prevAssignment_.clear();
        for (auto& a : result) {
            prevAssignment_[a.partitionId] = a.consumerId;
        }
        return result;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Consumer offset management with commit strategies and lag tracking",
      source: `#include <atomic>
#include <chrono>
#include <cstdint>
#include <functional>
#include <map>
#include <mutex>
#include <string>
#include <vector>

// Tracks consumer offsets for each partition.
// Supports auto-commit and manual commit for at-least-once / at-most-once.

struct OffsetMetadata {
    int64_t offset;
    int64_t commitTimestamp;
    std::string metadata; // optional application metadata
};

class OffsetStore {
    // Key: "group:topic:partition"
    std::map<std::string, OffsetMetadata> committedOffsets_;
    std::mutex mu_;

    static std::string makeKey(const std::string& group,
                                const std::string& topic,
                                int partition) {
        return group + ":" + topic + ":" + std::to_string(partition);
    }

public:
    void commitOffset(const std::string& group,
                      const std::string& topic,
                      int partition,
                      int64_t offset,
                      const std::string& metadata = "") {
        std::lock_guard lock(mu_);
        auto key = makeKey(group, topic, partition);
        committedOffsets_[key] = {
            offset,
            std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()
            ).count(),
            metadata
        };
    }

    int64_t getCommittedOffset(const std::string& group,
                                const std::string& topic,
                                int partition) {
        std::lock_guard lock(mu_);
        auto key = makeKey(group, topic, partition);
        auto it = committedOffsets_.find(key);
        if (it == committedOffsets_.end()) return -1; // no committed offset
        return it->second.offset;
    }
};

enum class CommitStrategy {
    AUTO_COMMIT,       // commit periodically (at-most-once risk)
    SYNC_AFTER_PROCESS, // commit after processing (at-least-once)
    TRANSACTIONAL      // commit with processing output (exactly-once)
};

class Consumer {
    std::string groupId_;
    std::string topic_;
    int partition_;
    int64_t currentOffset_;
    OffsetStore& offsetStore_;
    CommitStrategy strategy_;
    int64_t autoCommitIntervalMs_ = 5000;
    int64_t lastAutoCommit_ = 0;

public:
    Consumer(const std::string& groupId,
             const std::string& topic,
             int partition,
             OffsetStore& store,
             CommitStrategy strategy)
        : groupId_(groupId)
        , topic_(topic)
        , partition_(partition)
        , currentOffset_(store.getCommittedOffset(groupId, topic, partition) + 1)
        , offsetStore_(store)
        , strategy_(strategy) {}

    // Process a batch of messages with chosen commit strategy
    void processBatch(const std::vector<std::pair<int64_t, std::string>>& messages,
                      const std::function<void(int64_t, const std::string&)>& handler) {
        if (messages.empty()) return;

        switch (strategy_) {
            case CommitStrategy::AUTO_COMMIT: {
                // Commit before processing (at-most-once)
                auto now = currentTimeMs();
                if (now - lastAutoCommit_ >= autoCommitIntervalMs_) {
                    commitCurrent();
                    lastAutoCommit_ = now;
                }
                for (auto& [offset, value] : messages) {
                    handler(offset, value);
                    currentOffset_ = offset + 1;
                }
                break;
            }
            case CommitStrategy::SYNC_AFTER_PROCESS: {
                // Process then commit (at-least-once, consumer must be idempotent)
                for (auto& [offset, value] : messages) {
                    handler(offset, value);
                    currentOffset_ = offset + 1;
                }
                commitCurrent();
                break;
            }
            case CommitStrategy::TRANSACTIONAL: {
                // Atomically commit offset + processing side effects
                // In real Kafka, this uses beginTransaction/commitTransaction
                for (auto& [offset, value] : messages) {
                    handler(offset, value);
                    currentOffset_ = offset + 1;
                }
                commitCurrent(); // Would be inside transaction in production
                break;
            }
        }
    }

    // Consumer lag = latest produced offset - current consumed offset
    int64_t computeLag(int64_t latestProducedOffset) const {
        return latestProducedOffset - currentOffset_;
    }

    void commitCurrent() {
        offsetStore_.commitOffset(groupId_, topic_, partition_, currentOffset_);
    }

private:
    static int64_t currentTimeMs() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }
};

// Dead Letter Queue handler: captures failed messages after retries
class DeadLetterQueue {
    std::string dlqTopic_;
    int maxRetries_;
    std::map<std::string, int> retryCounts_; // messageId -> retry count
    std::mutex mu_;

public:
    DeadLetterQueue(const std::string& dlqTopic, int maxRetries = 3)
        : dlqTopic_(dlqTopic), maxRetries_(maxRetries) {}

    enum class Action { RETRY, SEND_TO_DLQ };

    Action onFailure(const std::string& messageId) {
        std::lock_guard lock(mu_);
        int& count = retryCounts_[messageId];
        count++;
        if (count >= maxRetries_) {
            retryCounts_.erase(messageId);
            return Action::SEND_TO_DLQ;
        }
        return Action::RETRY;
    }

    void onSuccess(const std::string& messageId) {
        std::lock_guard lock(mu_);
        retryCounts_.erase(messageId);
    }
};`,
    },
  ],

  diagrams: [
    {
      title: "Message Queue Architecture",
      kind: "architecture",
      caption: "Layered architecture: producers batch and send with acks=all through the ISR; the broker cluster stores partitioned, replicated append-only logs served via page cache; a controller (KRaft or ZooKeeper) coordinates leadership; consumer groups fetch, commit offsets to an internal topic, and route poison messages to a DLQ. Steps 1-2 trace the produce path; C1-C3 trace the consume path (C3 only for poison messages).",
      mermaid: `graph TB
    subgraph Producers["Producer Layer"]
        PR1["Producer 1<br/>batch + compress"]
        PR2["Producer 2<br/>key-based partitioning"]
    end

    subgraph Cluster["Broker Cluster"]
        subgraph TopicA["Topic orders (3 partitions, RF=3)"]
            subgraph BR1["Broker 1"]
                P0L["P0 Leader<br/>append-only segments"]
                P1F["P1 Follower"]
            end
            subgraph BR2["Broker 2"]
                P1L["P1 Leader<br/>append-only segments"]
                P2F["P2 Follower"]
            end
            subgraph BR3["Broker 3"]
                P2L["P2 Leader<br/>append-only segments"]
                P0F["P0 Follower"]
            end
        end
        CACHE["OS page cache + zero-copy sendfile"]
        OFFT["Internal topic __consumer_offsets"]
    end

    subgraph Coord["Coordination Layer"]
        CTRL["Controller (KRaft quorum or ZooKeeper)<br/>leader election, ISR tracking, metadata"]
    end

    subgraph Consumers["Consumer Layer"]
        subgraph CG1["Consumer Group A"]
            C1["Consumer 1"]
            C2["Consumer 2"]
        end
        CG2["Consumer Group B<br/>independent offsets"]
    end

    DLQ["Dead Letter Queue topic<br/>failed after max retries"]

    PR1 -->|"1. produce batch, acks=all"| P0L
    PR2 -->|"1. produce batch, acks=all"| P1L
    P0L -.->|"2. replicate (ISR)"| P0F
    P1L -.->|"2. replicate (ISR)"| P1F
    P2L -.->|"2. replicate (ISR)"| P2F
    CTRL -.->|"elect leaders, track ISR"| TopicA
    P0L --- CACHE
    C1 -->|"C1. fetch from offset"| P0L
    C2 -->|"C1. fetch from offset"| P1L
    CG2 -->|"fetch independently"| P2L
    C1 -->|"C2. commit offsets"| OFFT
    C2 -->|"C2. commit offsets"| OFFT
    C1 -->|"C3. poison message after retries"| DLQ`,
    },
    {
      title: "Message Production and Consumption Flow",
      kind: "sequence",
      caption: "Sequence showing producer sending a message through to consumer processing with offset commit and ack.",
      mermaid: `sequenceDiagram
    participant P as Producer
    participant L as Partition Leader
    participant F1 as Follower 1
    participant F2 as Follower 2
    participant C as Consumer

    P->>L: Produce message with key
    L->>L: Append to log segment
    L->>F1: Replicate message
    L->>F2: Replicate message
    F1-->>L: Ack replication
    F2-->>L: Ack replication
    L-->>P: Ack with offset number

    C->>L: Fetch from offset N
    L-->>C: Return messages N to N+batch
    C->>C: Process messages
    C->>L: Commit offset N+batch
    L-->>C: Offset committed`,
    },
    {
      title: "Consumer Group Rebalancing Flow",
      kind: "flow",
      caption: "How partitions are redistributed when consumers join or leave a consumer group.",
      mermaid: `flowchart TD
    START["Consumer joins or leaves group"] --> COORD["Group coordinator detects membership change"]
    COORD --> REVOKE["Revoke partitions from affected consumers"]
    REVOKE --> STRATEGY{"Assignment strategy?"}

    STRATEGY -->|"Range"| RANGE["Divide partitions into contiguous ranges per consumer"]
    STRATEGY -->|"Round Robin"| RR["Distribute partitions cyclically"]
    STRATEGY -->|"Cooperative Sticky"| STICKY["Keep existing assignments, reassign only moved partitions"]

    RANGE --> ASSIGN["Send new assignments to consumers"]
    RR --> ASSIGN
    STICKY --> ASSIGN

    ASSIGN --> RESUME["Consumers resume from committed offsets"]
    RESUME --> MONITOR["Monitor consumer lag and health"]
    MONITOR -->|"Consumer crashes"| COORD`,
    },
    {
      title: "Log Segment Storage Structure",
      kind: "architecture",
      caption: "Internal structure of a partition directory showing segment files, sparse index, and time index.",
      mermaid: `graph TD
    PART["Partition Directory"] --> SEG0["Segment 0-999"]
    PART --> SEG1["Segment 1000-1999"]
    PART --> SEGN["Active Segment 2000+"]

    SEG0 --> LOG0["00000000000000000000.log"]
    SEG0 --> IDX0["00000000000000000000.index"]
    SEG0 --> TDX0["00000000000000000000.timeindex"]

    SEGN --> LOGN["00000000000000002000.log"]
    SEGN --> IDXN["00000000000000002000.index"]
    SEGN --> TDXN["00000000000000002000.timeindex"]

    LOGN --> REC1["Record offset=2000, pos=0"]
    LOGN --> REC2["Record offset=2001, pos=142"]
    LOGN --> REC3["Record offset=2002, pos=305"]

    IDXN --> IE1["Offset 2000 -> Position 0"]
    IDXN --> IE2["Offset 2050 -> Position 7168"]
    IDXN --> IE3["Offset 2100 -> Position 14336"]`,
    },
  ],

  animations: [
    {
      title: "Guaranteeing a message isn't lost",
      steps: [
        {
          label: "Producer sends",
          detail: "Broker writes to an append-only log.",
        },
        {
          label: "Replicate",
          detail: "The write is copied to follower replicas.",
        },
        {
          label: "Acknowledge",
          detail: "With `acks=all` and `min.insync.replicas=2`, the producer is only told 'ok' once a quorum has it on disk.",
        },
        {
          label: "Consumer reads",
          detail: "Pulls from its committed offset.",
        },
        {
          label: "Commit after processing",
          detail: "Offset advanced only after the work succeeded — at-least-once.",
        },
        {
          label: "Crash before commit",
          detail: "The message is redelivered. Hence idempotent consumers; there is no exactly-once across the boundary.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Apache Kafka", "RabbitMQ", "Amazon SQS", "Apache Pulsar"],
    rows: [
      [
        "Architecture model",
        "Distributed commit log with partitioned topics, append-only storage",
        "Traditional message broker with exchanges, queues, and bindings",
        "Fully managed cloud queue service with no broker management",
        "Segment-based log with separate serving and storage layers",
      ],
      [
        "Throughput",
        "1-2M msg/sec per broker; designed for high-throughput streaming",
        "30-50K msg/sec per node; optimized for complex routing",
        "Nearly unlimited with horizontal scaling; ~3K msg/sec per API call",
        "1M+ msg/sec; scales compute and storage independently",
      ],
      [
        "Ordering guarantee",
        "Strict order within partition; no cross-partition ordering",
        "Per-queue FIFO ordering; no ordering across queues",
        "Best-effort; FIFO queues provide strict order within message group",
        "Strict order within partition; key-based ordering available",
      ],
      [
        "Delivery guarantee",
        "At-most-once, at-least-once, or exactly-once with idempotent producers and transactions",
        "At-most-once or at-least-once with manual acks and publisher confirms",
        "At-least-once standard; exactly-once with FIFO deduplication",
        "At-least-once with deduplication; effectively-once with transactions",
      ],
      [
        "Message retention",
        "Configurable retention by time or size; log compaction for changelogs",
        "Messages deleted after consumer ack; TTL and DLQ available",
        "4 days default, up to 14 days max; messages deleted after processing",
        "Configurable retention; tiered storage for offloading to S3 or similar",
      ],
      [
        "Consumer model",
        "Pull-based; consumers control pace; consumer groups for parallel consumption",
        "Push-based with prefetch; consumers ack individual messages",
        "Pull-based; long polling supported; no built-in consumer groups",
        "Pull-based with shared and exclusive subscriptions",
      ],
      [
        "Best suited for",
        "Event streaming, log aggregation, real-time pipelines, high-volume data feeds",
        "Task queues, RPC, complex routing patterns, low-latency request-response",
        "Serverless architectures, simple decoupling, low-ops environments",
        "Multi-tenant streaming, geo-replication, unified queuing and streaming",
      ],
    ],
  },

  interviewQA: [
    {
      q: "How would you design a message queue to handle 10 million messages per second?",
      a: "Start by calculating the hardware requirements. At 1 KB per message, 10M msg/s is 10 GB/s of raw data. With replication factor 3, that becomes 30 GB/s of disk and network I/O. You need roughly 25-30 brokers, each with 10 Gbps NICs and fast SSDs. Partition the topics into 300+ partitions to enable parallel writes and reads. Use batch production (linger.ms=5, batch.size=64KB) to amortize network round trips. Compress messages with LZ4 or Zstandard to reduce network bandwidth by 60-80%. Enable zero-copy transfers so brokers serve consumers without copying data through userspace. On the consumer side, match the consumer count to the partition count and process messages in batches. Monitor broker CPU, network, and disk I/O to identify bottlenecks early.",
      followUps: [
        "What happens when a broker fails at this scale?",
        "How do you handle uneven partition sizes (hot partitions)?",
        "How would you benchmark and validate the 10M msg/s target?",
      ],
    },
    {
      q: "Explain the trade-offs between at-least-once and exactly-once delivery.",
      a: "At-least-once delivery commits the consumer offset after processing, meaning a crash between processing and commit results in the message being reprocessed on restart. This is simple and fast but requires idempotent consumers to avoid side effects from duplicates. Exactly-once delivery uses idempotent producers (which deduplicate based on producer ID and sequence number) combined with transactional consumers that atomically commit offsets and output records. The trade-off is latency and complexity: exactly-once adds 3-5% latency overhead and requires careful transaction boundary management. At-least-once is sufficient for most use cases where processing is naturally idempotent (e.g., upserts to a database). Exactly-once is necessary when duplicates cause real harm, such as double-charging a payment or double-counting an inventory decrement. Many systems achieve effective exactly-once by combining at-least-once delivery with application-level deduplication using unique message IDs.",
      followUps: [
        "How does Kafka implement idempotent producers internally?",
        "Can you achieve exactly-once across multiple downstream systems?",
        "What is the performance impact of enabling transactions?",
      ],
    },
    {
      q: "How do consumer groups enable horizontal scaling, and what are the limitations?",
      a: "A consumer group assigns each partition to exactly one consumer instance, so adding more consumers increases parallelism up to the number of partitions. If you have 12 partitions and 4 consumers, each consumer handles 3 partitions. Adding an 8th consumer means each handles about 1-2 partitions. Adding a 13th consumer leaves it idle because there are only 12 partitions to distribute. The partition count is therefore an upper bound on consumer parallelism. When a consumer joins or leaves, a rebalance redistributes partitions. During a stop-the-world rebalance (eager protocol), all consumers pause, which can cause latency spikes. The cooperative sticky assignor performs incremental rebalances that only pause the partitions being moved, reducing impact. Another limitation is that partition assignment affects data locality: if a consumer was caching state for partition 5 and it gets reassigned to partition 7, it must rebuild its cache.",
      followUps: [
        "How do you choose the right number of partitions for a topic?",
        "What is the impact of rebalancing on end-to-end latency?",
        "How does static group membership avoid unnecessary rebalances?",
      ],
    },
    {
      q: "What is a dead letter queue and how should it be implemented?",
      a: "A dead letter queue (DLQ) is a separate queue or topic that receives messages which cannot be processed successfully after a configured number of retries. When a consumer fails to process a message, it retries with exponential backoff (e.g., 1s, 2s, 4s) up to a maximum retry count (typically 3-5). After exhausting retries, the message is published to the DLQ along with metadata: the original topic and partition, the failure reason, the timestamp, and the retry count. This prevents poison messages from blocking the entire partition. The DLQ should be monitored and alarmed: a growing DLQ indicates a systemic problem. For reprocessing, a separate consumer reads from the DLQ, and an operator can either fix the root cause and replay, or manually dead-letter the messages permanently. In Kafka, DLQs are typically implemented as separate topics (e.g., 'orders.dlq') with long retention.",
      followUps: [
        "How do you differentiate between transient and permanent failures?",
        "Should DLQ messages preserve the original ordering?",
        "How do you prevent DLQ reprocessing from causing cascading failures?",
      ],
    },
    {
      q: "How does log compaction work and when would you use it?",
      a: "Log compaction is a retention policy that keeps only the latest record for each unique key in a partition, discarding older records with the same key. Instead of deleting entire segments after a time or size threshold, the compaction thread scans closed segments, builds an offset map of the latest offset per key, and rewrites segments keeping only those latest records. A tombstone (a record with a null value) marks a key for deletion; after a configurable delay (delete.retention.ms), the tombstone itself is removed. Use log compaction when the topic represents a changelog or materialized view: for example, a topic of user profile updates where you only need the current state. KTable in Kafka Streams and the __consumer_offsets internal topic both use compaction. The trade-off is that compaction is CPU and I/O intensive: it reads and rewrites segments. Configuring min.cleanable.dirty.ratio (default 0.5) controls how aggressive compaction is: lower values compact more frequently but use more resources.",
      followUps: [
        "How does compaction interact with consumer offset tracking?",
        "Can you combine time-based retention with log compaction?",
        "What are the performance implications of compaction on a busy broker?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for a queue ingesting 1 million messages per second with 7-day retention.",
      a: "Start with bandwidth: 1M msg/s x 1 KB = 1 GB/s of producer ingest. Replication factor 3 turns that into 3 GB/s of cluster write traffic (1 GB/s in from producers plus 2 GB/s broker-to-broker replication). If two consumer groups each read the full stream, add 2 GB/s egress, so ~5 GB/s total. A 10 Gbps NIC gives ~1.2 GB/s; at a safe 50% utilization per broker that is ~600 MB/s, so you need at least 9 brokers — provision ~12 for failover headroom. Storage: 1 GB/s x 86,400 s x 7 days is roughly 605 TB of raw data; x3 replication is ~1.8 PB, about 150 TB per broker on 12 brokers, cut to ~40-50 TB each with 3-4x batch compression. Partition count is driven by consumer parallelism: if a consumer thread handles 10K msg/s, you need 100 consumers, so at least 100 partitions — provision 200-300 because increasing partitions later remaps keys. Finish with memory: 6-8 GB heap per broker and the rest of RAM to page cache so tailing consumers never hit disk.",
      followUps: [
        "How does compression change the network math versus the storage math?",
        "What changes if consumers routinely replay old data instead of tailing?",
        "How would tiered storage (offloading closed segments to S3) alter the design?",
      ],
    },
    {
      q: "A leader broker fails and no in-sync replica is available. What are your options and their trade-offs?",
      a: "This is the unclean leader election decision. Option 1: keep unclean.leader.election.enable=false (the default). The partition stays offline until an ISR member — or the recovered leader — comes back. You choose consistency: no acknowledged message is ever lost, but the partition is unavailable, producers block or fail, and lag builds. Option 2: enable unclean leader election, letting an out-of-sync follower become leader. The partition is immediately available, but every record the dead leader had beyond the follower's log-end offset is silently lost, and consumers may see offsets rewind. The right choice depends on the data: payment or inventory events demand consistency (stay offline, page an operator), while metrics or clickstream data can tolerate a small loss for availability. The best answer also mentions prevention: with acks=all and min.insync.replicas=2 on RF=3, this scenario requires two simultaneous broker failures, and rack-aware replica placement makes correlated failures much less likely.",
      followUps: [
        "How does min.insync.replicas interact with acks to define the durability contract?",
        "Why is rack-aware (or AZ-aware) replica placement important here?",
        "How does KRaft change controller failover compared with ZooKeeper?",
      ],
    },
  ],

  mcqs: [
    {
      q: "In Kafka, what determines the maximum number of consumers that can actively consume from a single topic within one consumer group?",
      options: [
        "The number of brokers in the cluster",
        "The number of partitions in the topic",
        "The replication factor of the topic",
        "The number of consumer groups subscribed to the topic",
      ],
      answerIndex: 1,
      explanation:
        "Each partition is assigned to exactly one consumer within a consumer group. Therefore, the partition count is the upper bound on consumer parallelism. Any consumers beyond the partition count will sit idle.",
    },
    {
      q: "Which delivery guarantee requires the consumer to be idempotent to ensure correct behavior?",
      options: [
        "At-most-once delivery",
        "At-least-once delivery",
        "Exactly-once delivery",
        "Best-effort delivery",
      ],
      answerIndex: 1,
      explanation:
        "At-least-once delivery may redeliver messages after a crash (between processing and offset commit). The consumer must handle duplicates gracefully, which requires idempotent processing logic such as upserts or deduplication by message ID.",
    },
    {
      q: "What is the primary purpose of the sparse index in Kafka's log segment storage?",
      options: [
        "To compress messages for efficient storage",
        "To map message offsets to physical file positions for fast lookups",
        "To track which consumers have read each message",
        "To replicate messages to follower brokers",
      ],
      answerIndex: 1,
      explanation:
        "The sparse index (.index file) maps a sample of offsets to their byte positions in the .log file. When a consumer requests messages from a specific offset, the broker binary-searches the index to find the nearest position, then scans forward, turning random reads into sequential reads.",
    },
    {
      q: "During a cooperative sticky rebalance, what happens to partitions that are not being reassigned?",
      options: [
        "All partitions are revoked and reassigned from scratch",
        "Unaffected partitions continue being consumed without interruption",
        "Unaffected partitions are paused until the rebalance completes",
        "Unaffected partitions are temporarily assigned to the group coordinator",
      ],
      answerIndex: 1,
      explanation:
        "The cooperative sticky assignor performs an incremental rebalance: it only revokes partitions that need to move to a different consumer. All other partitions continue being consumed without interruption, reducing the rebalance impact from seconds to milliseconds.",
    },
  ],

  flashcards: [
    {
      front: "What is a partition in a message queue?",
      back: "A partition is an ordered, immutable, append-only sequence of records within a topic. It is the unit of parallelism, storage, and replication. Messages within a partition are strictly ordered by offset.",
    },
    {
      front: "How does a consumer group provide horizontal scalability?",
      back: "Each partition in a topic is assigned to exactly one consumer in the group. Adding consumers increases parallelism up to the partition count. Multiple consumer groups can independently consume the same topic.",
    },
    {
      front: "What is consumer lag and why is it important?",
      back: "Consumer lag is the difference between the latest produced offset and the latest committed consumer offset. Growing lag indicates the consumer cannot keep up with producers and may need scaling or optimization.",
    },
    {
      front: "What is the difference between at-least-once and exactly-once delivery?",
      back: "At-least-once commits the offset after processing, risking duplicates on crash. Exactly-once uses idempotent producers and transactional consumers to atomically commit offsets and processing results, adding ~3-5% latency overhead.",
    },
    {
      front: "What is log compaction?",
      back: "A retention policy that keeps only the latest record for each key, removing older duplicates. Used for changelog topics and materialized views. Tombstones (null-value records) mark keys for eventual deletion.",
    },
    {
      front: "What is zero-copy transfer and why does Kafka use it?",
      back: "Zero-copy uses the sendfile() system call to transfer data directly from the OS page cache to the network socket without copying through userspace, reducing CPU usage by up to 50% and enabling high throughput.",
    },
    {
      front: "What is a dead letter queue?",
      back: "A DLQ is a separate topic that captures messages failing processing after a configured retry count (typically 3-5 with exponential backoff). It prevents poison messages from blocking the pipeline while preserving them for debugging.",
    },
    {
      front: "How does Kafka achieve high write throughput?",
      back: "Append-only sequential writes to segment files, OS page cache utilization, batched production, message compression (LZ4/Zstd), and zero-copy reads. A single broker can handle 1-2 million messages per second.",
    },
    {
      front: "What is the ISR and how does it relate to acks=all?",
      back: "The In-Sync Replica set is the followers caught up with the leader within replica.lag.time.max.ms. acks=all succeeds once min.insync.replicas ISR members have the record; only ISR members are eligible for clean leader election.",
    },
    {
      front: "What is unclean leader election and its trade-off?",
      back: "Allowing an out-of-sync replica to become leader when no ISR member is available. It restores availability but loses every acknowledged record the dead leader had beyond the new leader's log. Disabled by default (consistency over availability).",
    },
    {
      front: "Eager vs cooperative rebalancing?",
      back: "Eager (stop-the-world) revokes all partitions from all consumers on any membership change. Cooperative sticky revokes only partitions that actually move, so unaffected partitions keep flowing — pauses drop from seconds to milliseconds.",
    },
    {
      front: "Quick capacity math for 1M msg/s at 1 KB with 7-day retention?",
      back: "1 GB/s ingest; x3 replication = 3 GB/s cluster writes; storage = 1 GB/s x 604,800 s = ~605 TB raw, ~1.8 PB replicated, ~3-4x less after compression. Partitions >= target consumer count (e.g., 100 consumers at 10K msg/s each).",
    },
  ],

  exercises: [
    "Design a partition assignment algorithm that minimizes partition movement during consumer group rebalancing. Implement the sticky assignor: given a set of partitions, current consumers, and previous assignments, output the new assignment that retains as many existing assignments as possible while balancing load.",
    "Implement an offset management system that supports both at-least-once and exactly-once delivery semantics. Write a consumer class that can switch between committing offsets before vs. after processing, and measure the duplicate rate under simulated crash scenarios.",
    "Build a dead letter queue system with configurable retry count and exponential backoff. The system should track retry counts per message, route exhausted messages to a DLQ topic with failure metadata, and support manual reprocessing from the DLQ.",
    "Design and implement a log-structured storage engine for a message queue partition. Support append, read-from-offset (using a sparse index for efficient lookup), segment rotation at a configurable size, and time-based segment deletion.",
    "Create a consumer lag monitoring system that tracks the gap between produced and consumed offsets for each partition in each consumer group. Alert when lag exceeds a threshold or when lag growth rate suggests the consumer will fall behind by more than N minutes.",
  ],

  revisionNotes: [
    "A topic is a logical channel split into partitions; partitions are the unit of parallelism, ordering, and replication. Strict message order exists only within a single partition.",
    "Consumer groups assign each partition to exactly one consumer. Max parallelism equals partition count. Cooperative sticky rebalancing minimizes disruption when consumers join or leave.",
    "Kafka achieves 1-2M msg/sec/broker via sequential disk writes, OS page cache, batching, compression, and zero-copy transfers (sendfile system call).",
    "Delivery guarantees: at-most-once (commit before process), at-least-once (commit after process, need idempotent consumers), exactly-once (idempotent producers + transactional consumers, ~3-5% latency overhead).",
    "Log segments: .log (data), .index (offset-to-position), .timeindex (timestamp-to-offset). Default segment size 1 GB, index interval 4 KB. Binary search the sparse index, then scan forward.",
    "Replication: leader handles all reads/writes, followers replicate. ISR (in-sync replicas) are followers within replica.lag.time.max.ms. acks=all waits for all ISR members, providing strongest durability.",
    "Log compaction keeps only the latest value per key, useful for changelogs and materialized views. Tombstones mark deletion; they are removed after delete.retention.ms.",
    "Dead letter queues capture poison messages after max retries (typically 3-5 with exponential backoff). DLQs preserve original message, headers, and failure metadata for debugging.",
    "Backpressure: Kafka consumers pull at their own pace (natural backpressure). RabbitMQ uses credit-based flow control. Monitor consumer lag to detect consumers falling behind.",
    "Capacity planning: 10M msg/s at 1 KB = 10 GB/s raw. With replication factor 3, need ~25-30 brokers with 10 Gbps NICs. Partition count should be 3-10x consumer count for headroom.",
    "Worked example: 1M msg/s x 1 KB = 1 GB/s ingest; RF=3 makes it 3 GB/s of writes; 7-day retention = ~605 TB raw, ~1.8 PB replicated, cut 3-4x by compression. Partitions = target consumer count x 2-3 headroom.",
    "Unclean leader election trades consistency for availability: enabled, an out-of-sync replica can lead and acknowledged messages are lost; disabled (default), the partition stays offline until an ISR replica returns.",
    "Rebalancing: eager protocol pauses the whole group (stop-the-world); cooperative sticky only pauses partitions that move. Static group membership (group.instance.id) avoids rebalances entirely on restarts.",
    "Push vs pull: RabbitMQ pushes with prefetch flow control, deletes on ack, excels at routing and task queues (~30-50K msg/s). Kafka consumers pull and own their offsets, enabling replay, fan-out, and 1M+ msg/s per broker.",
  ],

  cheatSheet: [
    "Partition count = upper bound on consumer parallelism per group. Over-partition (start with 3-10x expected consumers) since increasing later requires data rebalancing.",
    "acks=0: fire-and-forget (fastest). acks=1: leader ack (balanced). acks=all: all ISR ack (safest). Use acks=all with min.insync.replicas=2 for production workloads.",
    "enable.idempotence=true: deduplicates producer retries using producer ID + sequence number. Required for exactly-once. Negligible performance cost.",
    "Consumer commit strategies: auto-commit (at-most-once risk) vs. manual commit after processing (at-least-once) vs. transactional commit (exactly-once).",
    "Batch size (batch.size) and linger time (linger.ms) control producer throughput. Larger batches = higher throughput but higher latency. Start with batch.size=64KB, linger.ms=5.",
    "Compression: LZ4 for low-latency, Zstandard for best ratio, Snappy for balanced. Compression happens at the batch level, not per-message. Reduces network I/O by 60-80%.",
    "Consumer lag = latest produced offset - committed consumer offset. Alert on absolute lag (e.g., > 100K messages) and lag growth rate (e.g., increasing for > 5 minutes).",
    "Segment size (log.segment.bytes, default 1 GB) controls file count and compaction granularity. Smaller segments = faster compaction but more file handles.",
    "Retention: time-based (log.retention.hours), size-based (log.retention.bytes), or compaction (log.cleanup.policy=compact). Combine time + compact for changelog topics.",
    "DLQ pattern: try processing, on failure retry with exponential backoff (1s, 2s, 4s), after max retries publish to DLQ topic with error metadata. Alert on DLQ growth.",
    "Capacity quick math: msg/s x msg size = ingest GB/s; x RF for cluster writes; x seconds of retention for raw storage; divide by 3-4 for compression. Brokers = total bandwidth / (NIC x 50%).",
    "Durability contract: acks=all + min.insync.replicas=2 + RF=3 tolerates one broker loss with zero data loss. Never set min.insync.replicas equal to RF (one restart blocks writes).",
    "unclean.leader.election.enable=false (default) = consistency (partition offline until ISR returns); true = availability (out-of-sync replica leads, acknowledged data lost). Decide per topic by data criticality.",
    "Rebalance tuning: use cooperative sticky assignor; set group.instance.id for static membership on Kubernetes; keep max.poll.interval.ms above worst-case batch time to avoid rebalance storms.",
  ],

  glossary: [
    {
      term: "Partition",
      definition:
        "An ordered, immutable, append-only sequence of records within a topic. The fundamental unit of parallelism, storage, and replication in Kafka. Each partition has a single leader broker and zero or more follower replicas.",
    },
    {
      term: "Consumer Group",
      definition:
        "A set of consumer instances that cooperatively consume a topic. Each partition is assigned to exactly one consumer in the group, enabling parallel processing up to the partition count. Multiple groups can independently consume the same topic.",
    },
    {
      term: "Offset",
      definition:
        "A sequential, monotonically increasing integer assigned to each record within a partition. Offsets uniquely identify records and allow consumers to track their position, seek to specific points, and replay messages.",
    },
    {
      term: "ISR (In-Sync Replicas)",
      definition:
        "The set of partition replicas that are fully caught up with the leader within a configured lag threshold (replica.lag.time.max.ms). Only ISR members are eligible for leader election, and acks=all waits for all ISR members to acknowledge a write.",
    },
    {
      term: "Log Compaction",
      definition:
        "A retention policy that removes older records sharing the same key, keeping only the most recent value. Transforms a topic into a compacted changelog suitable for rebuilding materialized views or caches from the latest state.",
    },
    {
      term: "Dead Letter Queue",
      definition:
        "A separate topic or queue that receives messages which failed processing after a configured number of retries. Prevents poison messages from blocking the pipeline while preserving them for later inspection and reprocessing.",
    },
    {
      term: "Backpressure",
      definition:
        "A flow control mechanism that slows producers when consumers cannot keep up. In pull-based systems like Kafka, consumers naturally apply backpressure by fetching at their own pace. In push-based systems like RabbitMQ, credit-based flow control limits publisher rate.",
    },
  ],

  followUps: [
    "How would you implement event sourcing on top of a message queue, and what are the trade-offs vs. a traditional database?",
    "How do you handle schema evolution in messages (e.g., adding/removing fields) without breaking consumers?",
    "What strategies exist for cross-datacenter replication of message queues, and how do they handle split-brain scenarios?",
    "How would you implement exactly-once delivery across multiple downstream systems (e.g., database + cache + search index)?",
    "What are the trade-offs between a message queue and a streaming processing framework like Kafka Streams or Apache Flink?",
    "How do you migrate from one message queue system to another (e.g., RabbitMQ to Kafka) without downtime?",
    "When would you enable unclean leader election, and how would you quantify the data-loss risk for stakeholders?",
    "How would you design priority messaging on top of a log-based queue that has no native priority support?",
    "How does tiered storage (offloading closed segments to object storage) change retention economics and replay behavior?",
  ],

  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/",
      kind: "book",
      note: "Chapter 11 covers stream processing and message queues in depth, including exactly-once semantics and log-based messaging.",
    },
    {
      label: "Apache Kafka Documentation", url: "https://kafka.apache.org/documentation/",
      kind: "docs",
      note: "Official documentation covering architecture, configuration, and operations. Essential reference for production deployments.",
    },
    {
      label: "Kafka: The Definitive Guide (2nd Edition)",
      kind: "book",
      note: "Comprehensive guide covering Kafka internals, producer/consumer APIs, Kafka Streams, and operational best practices.",
    },
    {
      label: "Jay Kreps - The Log: What every software engineer should know about real-time data's unifying abstraction", url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying",
      kind: "article",
      note: "Foundational article by Kafka's co-creator explaining the append-only log as the core abstraction for data systems.",
    },
    {
      label: "Confluent Blog - Exactly-Once Semantics Are Possible",
      kind: "article",
      note: "Deep technical explanation of how Kafka implements exactly-once semantics using idempotent producers and transactions.",
    },
  ],
};
