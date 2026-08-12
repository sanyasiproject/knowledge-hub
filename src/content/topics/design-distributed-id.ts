import type { TopicContent } from "../types";

export const designDistributedId: TopicContent = {
  quickSummary: [
    "Distributed ID generation produces globally unique identifiers across multiple machines without central coordination. The core challenge is guaranteeing uniqueness at scale (millions of IDs per second) while optimizing for sortability, compactness, and generation speed -- trade-offs that drive fundamentally different designs.",
    "Twitter's Snowflake is the industry standard for time-sorted IDs: a 64-bit integer composed of 41 bits of timestamp (69 years), 10 bits of machine ID (1024 workers), and 12 bits of sequence (4096 IDs per millisecond per worker). This yields roughly 4 million IDs/sec per worker, all naturally sortable by creation time.",
    "UUIDs (128-bit) offer coordination-free generation: UUID v4 uses 122 random bits for statistical uniqueness (collision probability of 1 in 2^61 after generating 1 billion UUIDs). UUID v7 (2022 RFC 9562) adds a Unix timestamp prefix, providing the sortability of Snowflake with the coordination-free nature of UUIDs.",
    "Database auto-increment sequences are simple but create a single point of contention. Strategies like pre-allocated ranges (Flickr's ticket servers), Redis INCR with sharding, and multi-master odd/even sequences trade off throughput, ordering guarantees, and operational complexity.",
  ],
  detailed: [
    "## Snowflake ID Architecture\n\nTwitter's Snowflake (2010) solved the problem of generating unique, time-sortable IDs at massive scale without a central coordinator. The 64-bit ID is structured as: 1 unused sign bit, 41 bits for timestamp in milliseconds since a custom epoch, 10 bits for datacenter and worker ID (5+5), and 12 bits for a per-worker sequence number. The timestamp gives 2^41 milliseconds or roughly 69 years from the epoch. The 10-bit worker ID supports 1024 unique generators, and the 12-bit sequence allows 4096 IDs per millisecond per worker (approximately 4 million IDs/sec per machine). Clock synchronization is critical: if a worker's clock moves backward, it must either wait until the clock catches up or refuse to generate IDs to prevent duplicates. In practice, NTP can cause small clock jumps; Snowflake handles this by tracking the last timestamp and blocking generation if the current time is earlier. The beauty of Snowflake is that each generator is fully independent -- no network calls, no shared state -- making it extremely fast (sub-microsecond generation) and highly available.",
    "## UUID Variants and Trade-offs\n\nUUID v1 combines a timestamp (60 bits, 100-nanosecond intervals since 1582) with the MAC address of the generating machine. It is unique and roughly time-sorted but leaks the MAC address, raising privacy concerns. UUID v4 uses 122 bits of cryptographic randomness with 6 bits for version and variant markers. With 2^122 possible values, the probability of collision after generating 1 billion UUIDs is approximately 1 in 2^61 -- practically zero. However, v4 IDs are completely random, which causes terrible B-tree index performance: each insertion goes to a random leaf page, causing constant page splits and high write amplification. UUID v6 reorders v1's timestamp fields to be sortable, maintaining backward compatibility. UUID v7 (RFC 9562, 2022) is the modern answer: 48 bits of Unix millisecond timestamp followed by 74 bits of randomness. It provides time-sortability like Snowflake with coordination-free generation like v4, making it the best general-purpose choice for new systems. The 128-bit size (vs Snowflake's 64 bits) doubles storage and index size but eliminates the need for worker ID coordination.",
    "## Database Sequences and Ticket Servers\n\nThe simplest approach is a database AUTO_INCREMENT column, but it creates a single point of failure and contention. Flickr's ticket server pattern uses two MySQL servers: one generates odd IDs, the other generates even IDs, with applications round-robining between them. This doubles throughput and provides failover (if one server goes down, all IDs are still unique -- just all odd or all even). For higher throughput, batch allocation is effective: a central coordinator allocates ranges (e.g., server A gets IDs 1-1000, server B gets 1001-2000), and each server generates IDs locally within its range without further coordination. When a range is exhausted, the server requests a new one. This amortizes the coordination cost over thousands of IDs. Redis INCR provides an alternative: atomic increment operations at roughly 100,000 ops/sec per Redis instance. Sharding across multiple Redis instances (each with a different offset and stride) can scale to millions of IDs/sec. The trade-off is adding Redis as a dependency and the risk of ID gaps if a Redis instance crashes before persisting.",
    "## Shard-Aware and Composite IDs\n\nIn sharded databases, embedding the shard key into the ID eliminates the need for a lookup to find which shard owns a record. Instagram's approach encodes: 41 bits of timestamp, 13 bits of logical shard ID (8192 shards), and 10 bits of auto-incrementing sequence within each shard. Each Postgres shard runs a PL/pgSQL function that generates IDs locally, requiring no cross-shard coordination. The shard ID is extractable from the ID itself using bit shifting, so routing a query to the correct shard is a pure computation with no network call. MongoDB's ObjectId uses a similar concept: 4 bytes of timestamp, 5 bytes of random value (unique per process), and 3 bytes of incrementing counter. This 12-byte (96-bit) ID is time-sortable and unique without coordination. For multi-tenant systems, you can prepend a tenant ID to create hierarchical IDs (e.g., tenant_id:snowflake_id) that are both globally unique and efficiently partitioned by tenant.",
    "## Choosing the Right Strategy\n\nThe decision framework centers on five axes: (1) **Sortability** -- do you need time-ordered IDs for range queries and B-tree efficiency? If yes, Snowflake or UUID v7. (2) **Coordination** -- can you tolerate a central coordinator? If not, UUID v4/v7 or embedded-worker Snowflake. (3) **Size** -- is 64 bits sufficient (fits in a long, half the index size of UUID) or do you need 128 bits for the collision space? (4) **Speed** -- Snowflake generates in sub-microsecond; UUID v4 needs a crypto-random call (50-200ns); database sequences need a network round-trip (1-10ms). (5) **Information density** -- do you need to extract metadata (timestamp, shard, datacenter) from the ID? Snowflake and shard-aware IDs embed this; UUIDs do not (except v7's timestamp). For most modern applications, UUID v7 is the recommended default: it provides sortability, zero-coordination generation, and sufficient collision resistance. Use Snowflake when you need 64-bit compactness or must embed machine/shard metadata. Use database sequences only when strong sequential ordering is required and throughput is modest.",
  ],
  deepDive: [
    "**Clock skew and monotonicity** are the most subtle challenges in timestamp-based ID generation. Snowflake assumes monotonically increasing timestamps, but NTP corrections can move the clock backward. A naive implementation would then generate IDs with timestamps earlier than previously issued IDs, potentially creating duplicates if the same sequence range is reused. Production Snowflake implementations handle this by maintaining a `lastTimestamp` variable: if the current timestamp is less than `lastTimestamp`, the generator either blocks (waiting for the clock to catch up) or throws an error. Some implementations use a logical clock that advances by 1ms whenever the physical clock goes backward, ensuring monotonicity at the cost of slightly future-dated IDs. Google's TrueTime API solves this at the infrastructure level by providing a bounded uncertainty interval for the current time, using GPS receivers and atomic clocks in each datacenter. Spanner's transaction IDs wait out the uncertainty window to guarantee globally consistent ordering, achieving an uncertainty bound of typically 1-7 milliseconds.",
    "**Collision analysis** is essential for any ID scheme. For UUID v4 with 122 random bits, the birthday paradox gives a 50% collision probability at approximately 2^61 IDs (about 2.3 quintillion). At a rate of 1 billion IDs per second, it would take roughly 73 years to reach this threshold. However, the collision probability is not zero for any finite number of IDs: after generating N IDs, the probability is approximately N^2 / (2 * 2^122). For N = 10^9 (1 billion), this is about 10^18 / 10^37 = 10^-19 -- astronomically unlikely. For Snowflake IDs, uniqueness is deterministic within a single worker (guaranteed by the sequence counter) but relies on unique worker IDs across the cluster. If two workers are accidentally assigned the same ID (a configuration error), they will generate identical IDs at the same millisecond. Worker ID assignment therefore becomes a critical operational concern -- using ZooKeeper, etcd, or a database lease system to ensure uniqueness.",
    "**Database index performance** varies dramatically by ID type. Random UUIDs (v4) cause severe B-tree fragmentation: each new ID falls on a random leaf page, leading to roughly 50% page fill factor (vs 90%+ for sequential IDs) and high write amplification as pages are constantly split. In benchmarks, insert throughput with random UUID primary keys can be 2-5x slower than sequential IDs for InnoDB/Postgres. Time-sorted IDs (Snowflake, UUID v7, ULID) solve this by ensuring new IDs are always appended to the rightmost leaf page, maintaining sequential write patterns and high page fill factors. However, this concentration of writes on the rightmost page can create a hot spot under extreme concurrency -- partitioning the B-tree or using LSM-tree storage engines (like RocksDB) mitigates this. For secondary indexes, the same principle applies: indexing a random UUID column fragments the index, while indexing a Snowflake column keeps the index append-only.",
    "**Encoding and human-friendliness** matter more than engineers often realize. A raw 64-bit Snowflake ID like 1541815603606036480 is unwieldy for humans. Base62 encoding (0-9, a-z, A-Z) reduces it to 11 characters (e.g., 'aB3kM7pQ2xR'). Base32 (Crockford variant) uses 13 characters but avoids ambiguous characters (0/O, 1/I/L) and is case-insensitive, making it better for manual entry. ULID (Universally Unique Lexicographically Sortable Identifier) standardizes this: 48 bits of millisecond timestamp + 80 bits of randomness, encoded as 26 Crockford Base32 characters. KSUIDs (K-Sortable Unique IDs) use 32 bits of timestamp + 128 bits of randomness, encoded as 27 Base62 characters. The choice of encoding affects URL length, copy-paste reliability, and phone/voice communication. For APIs, returning IDs as strings rather than integers avoids JavaScript's Number.MAX_SAFE_INTEGER limitation (2^53 - 1), which truncates 64-bit Snowflake IDs.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Snowflake ID Generator in C++",
      source: `#include <chrono>
#include <cstdint>
#include <mutex>
#include <stdexcept>

class SnowflakeGenerator {
private:
    // Bit allocation: 1 sign | 41 timestamp | 5 datacenter | 5 worker | 12 sequence
    static constexpr int TIMESTAMP_BITS = 41;
    static constexpr int DATACENTER_BITS = 5;
    static constexpr int WORKER_BITS = 5;
    static constexpr int SEQUENCE_BITS = 12;

    static constexpr int64_t MAX_DATACENTER_ID = (1L << DATACENTER_BITS) - 1; // 31
    static constexpr int64_t MAX_WORKER_ID = (1L << WORKER_BITS) - 1;         // 31
    static constexpr int64_t MAX_SEQUENCE = (1L << SEQUENCE_BITS) - 1;         // 4095

    static constexpr int WORKER_SHIFT = SEQUENCE_BITS;                         // 12
    static constexpr int DATACENTER_SHIFT = SEQUENCE_BITS + WORKER_BITS;       // 17
    static constexpr int TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_BITS +
                                           DATACENTER_BITS;                    // 22

    // Custom epoch: 2020-01-01 00:00:00 UTC
    static constexpr int64_t CUSTOM_EPOCH = 1577836800000L;

    int64_t datacenterId_;
    int64_t workerId_;
    int64_t sequence_ = 0;
    int64_t lastTimestamp_ = -1;
    std::mutex mutex_;

    int64_t currentTimeMs() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

    int64_t waitForNextMs(int64_t lastTs) {
        int64_t ts = currentTimeMs();
        while (ts <= lastTs) {
            ts = currentTimeMs();
        }
        return ts;
    }

public:
    SnowflakeGenerator(int64_t datacenterId, int64_t workerId)
        : datacenterId_(datacenterId), workerId_(workerId) {
        if (datacenterId < 0 || datacenterId > MAX_DATACENTER_ID)
            throw std::invalid_argument("Datacenter ID out of range");
        if (workerId < 0 || workerId > MAX_WORKER_ID)
            throw std::invalid_argument("Worker ID out of range");
    }

    int64_t nextId() {
        std::lock_guard<std::mutex> lock(mutex_);
        int64_t timestamp = currentTimeMs();

        // Clock moved backward -- refuse to generate
        if (timestamp < lastTimestamp_) {
            throw std::runtime_error(
                "Clock moved backward. Refusing to generate ID.");
        }

        if (timestamp == lastTimestamp_) {
            // Same millisecond: increment sequence
            sequence_ = (sequence_ + 1) & MAX_SEQUENCE;
            if (sequence_ == 0) {
                // Sequence exhausted (4096 IDs in this ms)
                timestamp = waitForNextMs(lastTimestamp_);
            }
        } else {
            // New millisecond: reset sequence
            sequence_ = 0;
        }

        lastTimestamp_ = timestamp;

        return ((timestamp - CUSTOM_EPOCH) << TIMESTAMP_SHIFT)
             | (datacenterId_ << DATACENTER_SHIFT)
             | (workerId_ << WORKER_SHIFT)
             | sequence_;
    }

    // Extract components from an ID
    static int64_t extractTimestamp(int64_t id) {
        return (id >> TIMESTAMP_SHIFT) + CUSTOM_EPOCH;
    }
    static int64_t extractDatacenterId(int64_t id) {
        return (id >> DATACENTER_SHIFT) & MAX_DATACENTER_ID;
    }
    static int64_t extractWorkerId(int64_t id) {
        return (id >> WORKER_SHIFT) & MAX_WORKER_ID;
    }
    static int64_t extractSequence(int64_t id) {
        return id & MAX_SEQUENCE;
    }
};

// Usage:
// SnowflakeGenerator gen(1, 5); // datacenter 1, worker 5
// int64_t id = gen.nextId();
// Throughput: ~4 million IDs/sec per worker`,
    },
    {
      language: "cpp",
      caption: "UUID v4 and UUID v7 Generator in C++",
      source: `#include <array>
#include <chrono>
#include <cstdint>
#include <iomanip>
#include <random>
#include <sstream>
#include <string>

class UUIDGenerator {
private:
    std::mt19937_64 rng_;

    std::string formatUUID(const std::array<uint8_t, 16>& bytes) {
        std::ostringstream ss;
        ss << std::hex << std::setfill('0');
        for (int i = 0; i < 16; ++i) {
            if (i == 4 || i == 6 || i == 8 || i == 10)
                ss << '-';
            ss << std::setw(2) << static_cast<int>(bytes[i]);
        }
        return ss.str();
    }

public:
    UUIDGenerator() {
        std::random_device rd;
        rng_.seed(rd());
    }

    // UUID v4: 122 bits of randomness
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where y is one of {8, 9, a, b}
    std::string generateV4() {
        std::array<uint8_t, 16> bytes;

        // Fill with random bytes
        uint64_t r1 = rng_();
        uint64_t r2 = rng_();
        for (int i = 0; i < 8; ++i) {
            bytes[i] = (r1 >> (i * 8)) & 0xFF;
            bytes[i + 8] = (r2 >> (i * 8)) & 0xFF;
        }

        // Set version 4 (bits 48-51)
        bytes[6] = (bytes[6] & 0x0F) | 0x40;
        // Set variant 10xx (bits 64-65)
        bytes[8] = (bytes[8] & 0x3F) | 0x80;

        return formatUUID(bytes);
    }

    // UUID v7: 48-bit timestamp + 74 bits of randomness
    // Time-sortable, coordination-free
    // Format: tttttttt-tttt-7rrr-yrrr-rrrrrrrrrrrr
    std::string generateV7() {
        std::array<uint8_t, 16> bytes;

        // 48-bit Unix timestamp in milliseconds
        int64_t timestamp =
            std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()
            ).count();

        // First 6 bytes: timestamp (big-endian)
        bytes[0] = (timestamp >> 40) & 0xFF;
        bytes[1] = (timestamp >> 32) & 0xFF;
        bytes[2] = (timestamp >> 24) & 0xFF;
        bytes[3] = (timestamp >> 16) & 0xFF;
        bytes[4] = (timestamp >> 8) & 0xFF;
        bytes[5] = timestamp & 0xFF;

        // Remaining 10 bytes: random
        uint64_t r1 = rng_();
        uint64_t r2 = rng_();
        for (int i = 0; i < 8; ++i) {
            if (i < 2) bytes[6 + i] = (r1 >> (i * 8)) & 0xFF;
            else bytes[6 + i] = (r2 >> ((i - 2) * 8)) & 0xFF;
        }

        // Set version 7 (bits 48-51)
        bytes[6] = (bytes[6] & 0x0F) | 0x70;
        // Set variant 10xx (bits 64-65)
        bytes[8] = (bytes[8] & 0x3F) | 0x80;

        return formatUUID(bytes);
    }
};

// UUID v4 example: "550e8400-e29b-41d4-a716-446655440000"
// UUID v7 example: "018ef5a6-7c3d-7b2a-8f1e-9d3c6a5b4e2f"
// v7 IDs sort lexicographically by creation time`,
    },
    {
      language: "cpp",
      caption: "Shard-Aware ID Generator with Range Pre-allocation",
      source: `#include <atomic>
#include <cstdint>
#include <chrono>
#include <mutex>
#include <stdexcept>

// Shard-aware ID: embeds shard ID for O(1) routing
// Layout: 41 bits timestamp | 13 bits shard | 10 bits sequence
class ShardAwareIdGenerator {
private:
    static constexpr int TIMESTAMP_BITS = 41;
    static constexpr int SHARD_BITS = 13;
    static constexpr int SEQUENCE_BITS = 10;

    static constexpr int64_t MAX_SHARD = (1L << SHARD_BITS) - 1;    // 8191
    static constexpr int64_t MAX_SEQUENCE = (1L << SEQUENCE_BITS) - 1; // 1023
    static constexpr int64_t CUSTOM_EPOCH = 1577836800000L;

    int64_t shardId_;
    int64_t sequence_ = 0;
    int64_t lastTimestamp_ = -1;
    std::mutex mutex_;

    int64_t nowMs() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

public:
    explicit ShardAwareIdGenerator(int64_t shardId) : shardId_(shardId) {
        if (shardId < 0 || shardId > MAX_SHARD)
            throw std::invalid_argument("Shard ID out of range (0-8191)");
    }

    int64_t nextId() {
        std::lock_guard<std::mutex> lock(mutex_);
        int64_t ts = nowMs();

        if (ts < lastTimestamp_) {
            throw std::runtime_error("Clock moved backward");
        }

        if (ts == lastTimestamp_) {
            sequence_ = (sequence_ + 1) & MAX_SEQUENCE;
            if (sequence_ == 0) {
                while (ts <= lastTimestamp_) ts = nowMs();
            }
        } else {
            sequence_ = 0;
        }
        lastTimestamp_ = ts;

        return ((ts - CUSTOM_EPOCH) << (SHARD_BITS + SEQUENCE_BITS))
             | (shardId_ << SEQUENCE_BITS)
             | sequence_;
    }

    // Extract shard from ID -- O(1) routing, no lookup needed
    static int64_t extractShard(int64_t id) {
        return (id >> SEQUENCE_BITS) & MAX_SHARD;
    }

    static int64_t extractTimestamp(int64_t id) {
        return (id >> (SHARD_BITS + SEQUENCE_BITS)) + CUSTOM_EPOCH;
    }
};

// Range-based ID allocator for batch pre-allocation
// Central coordinator allocates ranges; local generators
// produce IDs within their range without coordination.
class RangeAllocator {
private:
    std::atomic<int64_t> nextRangeStart_{1};
    int64_t rangeSize_;
    std::mutex mutex_;

public:
    explicit RangeAllocator(int64_t rangeSize = 10000)
        : rangeSize_(rangeSize) {}

    // Called by each worker to get a range of IDs
    // Returns {start, end} inclusive
    std::pair<int64_t, int64_t> allocateRange() {
        int64_t start = nextRangeStart_.fetch_add(rangeSize_);
        return {start, start + rangeSize_ - 1};
    }
};

class LocalIdGenerator {
private:
    RangeAllocator& allocator_;
    int64_t current_ = 0;
    int64_t rangeEnd_ = -1;
    std::mutex mutex_;

public:
    explicit LocalIdGenerator(RangeAllocator& alloc) : allocator_(alloc) {}

    int64_t nextId() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (current_ > rangeEnd_) {
            auto [start, end] = allocator_.allocateRange();
            current_ = start;
            rangeEnd_ = end;
        }
        return current_++;
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Snowflake ID Bit Layout",
      kind: "architecture",
      caption:
        "64-bit Snowflake ID structure showing timestamp, datacenter, worker, and sequence fields with their bit widths.",
      mermaid: `graph LR
    SIGN["Sign: 1 bit"]
    TS["Timestamp: 41 bits -- 69 years"]
    DC["Datacenter: 5 bits -- 32 DCs"]
    WK["Worker: 5 bits -- 32 workers"]
    SEQ["Sequence: 12 bits -- 4096 per ms"]
    SIGN --> TS --> DC --> WK --> SEQ
    TOTAL["Total: 64 bits -- fits in int64"]
    SEQ --> TOTAL`,
    },
    {
      title: "ID Generation Decision Flow",
      kind: "flow",
      caption:
        "Decision flowchart for choosing the right ID generation strategy based on system requirements.",
      mermaid: `flowchart TD
    START["Need unique IDs"] --> Q1{"Need time-sortable IDs?"}
    Q1 -->|No| Q2{"Need zero coordination?"}
    Q2 -->|Yes| UUID4["UUID v4: 122 random bits"]
    Q2 -->|No| DBSEQ["Database AUTO_INCREMENT"]
    Q1 -->|Yes| Q3{"Need compact 64-bit IDs?"}
    Q3 -->|Yes| Q4{"Can assign worker IDs?"}
    Q4 -->|Yes| SNOW["Snowflake: 64-bit time-sorted"]
    Q4 -->|No| SHARD["Shard-Aware ID with range alloc"]
    Q3 -->|No| UUID7["UUID v7: 128-bit time-sorted"]`,
    },
    {
      title: "Distributed ID Service Architecture",
      kind: "architecture",
      caption:
        "Multiple ID generation workers registered via ZooKeeper for worker ID assignment, serving applications that need globally unique IDs.",
      mermaid: `graph TD
    APP1["Application Server 1"]
    APP2["Application Server 2"]
    APP3["Application Server 3"]
    IDG1["ID Generator Worker 1"]
    IDG2["ID Generator Worker 2"]
    IDG3["ID Generator Worker 3"]
    ZK["ZooKeeper - Worker ID Lease"]
    DB["Database Shards"]
    APP1 --> IDG1
    APP2 --> IDG2
    APP3 --> IDG3
    IDG1 --> ZK
    IDG2 --> ZK
    IDG3 --> ZK
    APP1 --> DB
    APP2 --> DB
    APP3 --> DB`,
    },
    {
      title: "Snowflake ID Generation Sequence",
      kind: "sequence",
      caption:
        "Shows the internal logic of generating a Snowflake ID including clock check, sequence management, and bit assembly.",
      mermaid: `sequenceDiagram
    participant App as Application
    participant Gen as Snowflake Generator
    participant Clock as System Clock
    App->>Gen: nextId()
    Gen->>Clock: currentTimeMs()
    Clock-->>Gen: timestamp = 1700000000123
    Gen->>Gen: Check timestamp vs lastTimestamp
    alt Same millisecond
        Gen->>Gen: sequence++ and mask with 0xFFF
        alt Sequence overflow at 4096
            Gen->>Clock: Wait for next millisecond
            Clock-->>Gen: timestamp = 1700000000124
            Gen->>Gen: Reset sequence to 0
        end
    else New millisecond
        Gen->>Gen: Reset sequence to 0
    end
    Gen->>Gen: Assemble bits: timestamp or datacenter or worker or sequence
    Gen-->>App: Return 64-bit ID`,
    },
  ],
  interviewQA: [
    {
      q: "Why can't you just use a database auto-increment for distributed ID generation?",
      a: "A database auto-increment creates a single point of failure and a throughput bottleneck. Every ID generation requires a round-trip to the database, which adds 1-10ms of latency and limits throughput to roughly 10,000-50,000 IDs/sec for a single MySQL instance. In a distributed system generating millions of IDs per second, this becomes a hard ceiling. The database also becomes a single point of failure: if it goes down, no component can generate new IDs. Flickr's ticket server pattern partially addresses this by running two MySQL servers (odd/even IDs), doubling throughput and providing failover. But the fundamental limitation remains: every ID still requires a network call to a central service. Snowflake and UUID approaches eliminate this by making each generator independent, with zero network calls and sub-microsecond generation latency.",
      followUps: [
        "How does Flickr's ticket server work in detail?",
        "What are the consistency implications of batched range allocation?",
      ],
    },
    {
      q: "How does Snowflake handle clock skew and what happens if the clock moves backward?",
      a: "Snowflake maintains a `lastTimestamp` variable that records the timestamp of the most recently generated ID. On each call to `nextId()`, it compares the current system time against `lastTimestamp`. If the current time is less than `lastTimestamp`, the clock has moved backward (typically due to NTP synchronization). In this case, the original Twitter Snowflake implementation throws an exception and refuses to generate IDs, forcing the application to retry. This is a deliberate choice: generating IDs with a past timestamp risks creating duplicates (the same timestamp + sequence combination might have been used before the clock jump). Alternative approaches include: (1) waiting until the clock catches up to `lastTimestamp`, (2) using a logical clock that increments `lastTimestamp` by 1ms on each backward jump, or (3) borrowing from the sequence space to extend the timestamp. Google's TrueTime API solves this at the infrastructure level with GPS and atomic clocks, achieving uncertainty bounds of 1-7 milliseconds.",
      followUps: [
        "What is Google's TrueTime and how does it guarantee ordering?",
        "How would you detect and monitor clock skew across a cluster?",
      ],
    },
    {
      q: "When would you choose UUID v7 over Snowflake IDs?",
      a: "Choose UUID v7 when you want coordination-free generation without the operational overhead of worker ID management. UUID v7 embeds a 48-bit millisecond timestamp followed by 74 bits of randomness, providing time-sortability with zero coordination -- any machine can generate UUIDs independently with essentially zero collision risk. The trade-offs are: UUID v7 is 128 bits (16 bytes) versus Snowflake's 64 bits (8 bytes), doubling primary key and index sizes in the database. UUID v7 also does not embed datacenter or worker metadata, so you cannot extract the origin from the ID. Choose Snowflake when you need 64-bit compactness (important for high-volume tables where index size matters), when you need to embed metadata like shard ID or datacenter ID, or when you need deterministic uniqueness guarantees rather than probabilistic ones. In practice, UUID v7 is the better default for most new systems because it eliminates the operational complexity of worker ID assignment while providing excellent B-tree performance.",
    },
    {
      q: "How does embedding the shard ID in the ID improve query routing?",
      a: "When the shard ID is part of the record's primary key, any query that includes the ID can be routed to the correct shard using pure bit manipulation -- no lookup table, no routing service, no additional network call. For example, with Instagram's scheme (41 bits timestamp, 13 bits shard, 10 bits sequence), extracting the shard is just `(id >> 10) & 0x1FFF`. This is an O(1) computation that takes nanoseconds. Without embedded shard IDs, you need either a routing table (mapping ID ranges to shards) or a consistent hash of the ID, both of which may require a network call to a routing service for correctness. The embedded approach also enables efficient scatter-gather: if you know you need data from shard 42, you can filter a list of IDs locally without contacting any shard. The downside is that the shard assignment is permanent -- if you need to re-shard (split shard 42 into 42a and 42b), existing IDs still point to the original shard, requiring a migration mapping layer.",
      followUps: [
        "How do you handle re-sharding when shard IDs are embedded in records?",
        "What is the maximum number of shards this scheme supports?",
      ],
    },
    {
      q: "What is the collision probability of UUID v4, and is it safe for production use?",
      a: "UUID v4 uses 122 bits of cryptographic randomness (6 bits are fixed for version and variant markers). By the birthday paradox, the probability of at least one collision among N generated UUIDs is approximately N^2 / (2 * 2^122). For 1 billion UUIDs (10^9), this probability is about 10^18 / (2 * 5.3 * 10^36) which is roughly 10^-19 -- equivalent to one in a quintillion. Even generating 1 billion UUIDs per second, it would take about 73 years to reach a 50% collision probability. This makes UUID v4 effectively collision-free for any practical system. The real risk is not mathematical collision but implementation errors: a broken random number generator (low entropy, unseeded PRNG) can produce predictable sequences that collide far sooner. Always use a cryptographically secure random source (like /dev/urandom or std::random_device). UUID v4 is absolutely safe for production and is used by virtually every major tech company.",
    },
  ],
  mcqs: [
    {
      q: "In a Snowflake ID with 41 timestamp bits, 10 machine bits, and 12 sequence bits, what is the maximum number of IDs a single machine can generate per millisecond?",
      options: ["1024", "2048", "4096", "8192"],
      answerIndex: 2,
      explanation:
        "The 12-bit sequence field can hold values 0-4095, allowing 4096 unique IDs per millisecond per machine. If this limit is reached, the generator must wait for the next millisecond. This translates to approximately 4 million IDs per second per machine.",
    },
    {
      q: "Why do random UUID v4 primary keys perform poorly in B-tree indexes?",
      options: [
        "UUIDs are too large to index",
        "Random values cause insertions at random leaf pages, leading to page splits and low fill factor",
        "B-trees cannot handle 128-bit keys",
        "UUID string format is slow to compare",
      ],
      answerIndex: 1,
      explanation:
        "Random UUIDs insert into random positions in the B-tree, causing frequent page splits and resulting in roughly 50% page fill factor versus 90%+ for sequential keys. This increases storage usage, I/O, and write amplification. UUID v7 solves this by using a timestamp prefix that ensures sequential insertion.",
    },
    {
      q: "What is the key advantage of UUID v7 over UUID v4?",
      options: [
        "UUID v7 uses fewer bits, saving storage",
        "UUID v7 is lexicographically sortable by creation time",
        "UUID v7 eliminates all collision risk",
        "UUID v7 is faster to generate",
      ],
      answerIndex: 1,
      explanation:
        "UUID v7 places a 48-bit Unix millisecond timestamp in the most significant bits, making UUIDs sort lexicographically by creation time. This provides excellent B-tree index performance (sequential inserts) while maintaining coordination-free generation. UUID v7 and v4 are the same size (128 bits).",
    },
    {
      q: "In a shard-aware ID scheme with 13 bits for shard ID, how many shards can be supported?",
      options: ["1024", "4096", "8192", "16384"],
      answerIndex: 2,
      explanation:
        "13 bits can represent values 0 through 8191, supporting up to 8192 unique shards. This is typically sufficient for most applications. Instagram uses this exact scheme, with each shard running as a separate PostgreSQL logical partition.",
    },
  ],
  flashcards: [
    {
      front: "What is the Snowflake ID format?",
      back: "64 bits total: 1 sign bit, 41 bits timestamp (69 years from custom epoch), 10 bits machine ID (5 datacenter + 5 worker = 1024 machines), 12 bits sequence (4096 IDs per millisecond per machine). Approximately 4M IDs/sec/worker. Naturally sortable by time.",
    },
    {
      front: "How does UUID v7 differ from UUID v4?",
      back: "UUID v4: 122 bits of randomness. Not sortable. Causes B-tree fragmentation. UUID v7: 48-bit Unix millisecond timestamp + 74 bits of randomness. Lexicographically sortable by creation time. Sequential B-tree inserts. Both are 128 bits and coordination-free.",
    },
    {
      front: "What is the birthday paradox collision probability for UUID v4?",
      back: "With 122 random bits, collision probability after N IDs is approximately N^2 / (2 * 2^122). After 1 billion IDs, probability is roughly 10^-19 (one in a quintillion). 50% collision threshold is at approximately 2.3 quintillion IDs. Effectively zero risk with a proper CSPRNG.",
    },
    {
      front: "How does Snowflake handle clock skew?",
      back: "Maintains lastTimestamp variable. If current time is less than lastTimestamp (clock went backward), the generator either throws an error (original approach), waits until the clock catches up, or uses a logical clock that increments by 1ms. Never generates IDs with past timestamps to prevent duplicates.",
    },
    {
      front: "What is a shard-aware ID and why use one?",
      back: "An ID that embeds the shard number in its bit layout (e.g., Instagram: 41 bits timestamp + 13 bits shard + 10 bits sequence). Enables O(1) shard routing via bit extraction: shard = (id >> seqBits) & shardMask. No routing table lookup needed. Downside: shard assignment is permanent.",
    },
    {
      front: "What are the five axes for choosing an ID strategy?",
      back: "1. Sortability (time-ordered for B-tree efficiency). 2. Coordination (central service vs independent generation). 3. Size (64-bit vs 128-bit -- affects index size). 4. Speed (sub-microsecond vs network round-trip). 5. Information density (can you extract timestamp, shard, DC from the ID?).",
    },
    {
      front: "What is ULID and how does it compare to UUID v7?",
      back: "ULID: 48-bit ms timestamp + 80-bit randomness, encoded as 26 Crockford Base32 characters. Lexicographically sortable. Similar to UUID v7 in concept but predates it (2016 vs 2022 RFC). UUID v7 has broader ecosystem support and is now the preferred standard. Both solve the B-tree fragmentation problem of UUID v4.",
    },
    {
      front: "How does range-based ID allocation work?",
      back: "A central allocator pre-assigns ID ranges to workers (e.g., worker A gets 1-10000, worker B gets 10001-20000). Workers generate IDs locally within their range with zero coordination. When a range is exhausted, the worker requests a new one. Amortizes the coordination cost over thousands of IDs. Risk: gaps in IDs if a worker crashes mid-range.",
    },
  ],
  exercises: [
    "**Implement a Snowflake generator with clock skew tolerance**: Build a Snowflake ID generator in C++ that handles backward clock jumps by using a logical clock fallback. Instead of throwing an error, the generator should increment lastTimestamp by 1ms and continue generating. Track the cumulative clock drift and emit a warning when it exceeds 100ms. Write unit tests that simulate clock skew by mocking the time source.",
    "**Design an ID service for a sharded database**: You have a PostgreSQL cluster with 256 shards. Design an ID generation scheme where each ID encodes the shard number and allows extracting the shard in O(1). Define the bit layout, implement the generator, and write the shard routing function. Calculate the maximum IDs per second per shard and the total system throughput.",
    "**Benchmark UUID v4 vs UUID v7 index performance**: Create a test that inserts 10 million rows into a B-tree-indexed table, once with UUID v4 primary keys and once with UUID v7. Measure insert throughput, index size, page fill factor, and read performance for range queries. Explain the results in terms of B-tree page splits and sequential vs random access patterns.",
    "**Build a coordination-free ID allocator using Redis**: Design a system where multiple application instances each get unique ID ranges from Redis using INCR with a step size. Handle Redis failures gracefully: if Redis is unavailable, fall back to UUID v7 and reconcile when Redis recovers. Implement in C++ with a Redis client library and test with simulated Redis outages.",
    "**Design a multi-tenant ID scheme**: Your SaaS platform has 10,000 tenants with data sharded by tenant. Design an ID scheme that is globally unique, time-sortable, and enceds the tenant ID for routing. Compare embedding tenant ID in the Snowflake bits versus using a composite key (tenant_id, snowflake_id). Analyze the trade-offs in index size, query routing, and cross-tenant uniqueness.",
  ],
  revisionNotes: [
    "**Snowflake**: 64-bit = 1 sign + 41 timestamp (69 years) + 10 machine (1024 workers) + 12 sequence (4096/ms). Roughly 4M IDs/sec/worker. Requires unique worker IDs (use ZooKeeper/etcd). Clock skew is the main failure mode.",
    "**UUID v4**: 128 bits, 122 random. Coordination-free. Collision probability approximately N^2 / 2^123. 1 billion IDs gives approximately 10^-19 collision chance. Random insertion pattern destroys B-tree performance.",
    "**UUID v7**: 128 bits = 48 timestamp + 74 random. RFC 9562 (2022). Best of both worlds: sortable like Snowflake, coordination-free like v4. Recommended default for new systems.",
    "**B-tree impact**: Random IDs cause approximately 50% page fill factor, 2-5x slower inserts. Time-sorted IDs maintain 90%+ fill, sequential writes. Critical for write-heavy workloads.",
    "**Shard-aware IDs**: Embed shard number in ID bits. O(1) routing via bit shift and mask. Instagram: 41 ts + 13 shard + 10 seq. Supports up to 8192 shards. Downside: permanent shard assignment.",
    "**Range allocation**: Central coordinator assigns ranges (e.g., 10K IDs each). Workers generate locally. Amortizes coordination. Gaps on crashes. Good for batch workloads.",
    "**Clock skew handling**: Track lastTimestamp. Options on backward jump: throw error, wait, logical increment. Google TrueTime bounds uncertainty to 1-7ms using GPS + atomic clocks.",
    "**Encoding**: Base62 shortens IDs for URLs. Crockford Base32 avoids ambiguous characters. JavaScript truncates integers beyond 2^53, so return Snowflake IDs as strings over JSON.",
    "**Comparison shortcut**: Need 64-bit compact + metadata -> Snowflake. Need zero coordination -> UUID v7. Need sequential -> DB auto-increment. Need shard routing -> Shard-aware ID.",
    "**Production checklist**: Monitor ID generation rate, sequence exhaustion events, clock skew incidents. Set alerts for worker ID conflicts. Use CSPRNG for UUID randomness. Test failover of ID coordinator.",
  ],
  cheatSheet: [
    "**Snowflake bit math**: `id = (timestamp << 22) | (dcId << 17) | (workerId << 12) | sequence`. Extract: `ts = (id >> 22) + epoch`.",
    "**UUID v4 collision**: P(collision) approximately equals N^2 / 2^123. At 1 billion IDs: approximately 10^-19. Safe for any practical system.",
    "**UUID v7 structure**: Bytes 0-5 = Unix ms timestamp (big-endian). Byte 6 high nibble = 0x7 (version). Bytes 6-15 remaining = random. Variant bits in byte 8.",
    "**Shard extraction**: `shardId = (id >> SEQUENCE_BITS) & SHARD_MASK`. O(1) routing, no lookup needed.",
    "**Worker ID assignment**: Use ZooKeeper ephemeral sequential nodes, etcd lease, or DB row lock. Must be unique across all generators at any given time.",
    "**Clock skew defense**: `if (now < lastTimestamp) { wait or throw }`. Never generate with past timestamp. Monitor NTP sync status.",
    "**B-tree rule of thumb**: Sequential IDs give approximately 90% fill factor. Random IDs give approximately 50% fill factor. 2x storage difference for same data.",
    "**Range allocation formula**: Worker requests range from coordinator. Range size = throughput * max_coordination_latency * safety_factor. E.g., 10K IDs/sec * 1s * 10 = 100K range.",
    "**JSON safety**: JavaScript Number.MAX_SAFE_INTEGER = 2^53 - 1. Snowflake IDs exceed this. Always serialize as strings in JSON APIs.",
    "**Throughput comparison**: DB auto-increment approximately 10K-50K/sec. Redis INCR approximately 100K/sec. Snowflake approximately 4M/sec/worker. UUID v4 approximately 10M+/sec (CPU-bound on CSPRNG).",
  ],
  glossary: [
    {
      term: "Snowflake ID",
      definition:
        "A 64-bit ID format invented by Twitter combining a 41-bit timestamp, 10-bit machine ID, and 12-bit sequence number. Generates roughly 4 million unique, time-sortable IDs per second per worker with no coordination.",
    },
    {
      term: "UUID (Universally Unique Identifier)",
      definition:
        "A 128-bit identifier standardized by RFC 9562. Version 4 uses randomness for uniqueness; version 7 uses a timestamp prefix for sortability. Designed for coordination-free generation across distributed systems.",
    },
    {
      term: "ULID (Universally Unique Lexicographically Sortable Identifier)",
      definition:
        "A 128-bit identifier combining a 48-bit millisecond timestamp with 80 bits of randomness, encoded as 26 Crockford Base32 characters. Precursor to UUID v7 with similar properties.",
    },
    {
      term: "Clock Skew",
      definition:
        "The difference in time readings between clocks on different machines, or the backward jump of a single machine's clock after NTP synchronization. Critical concern for timestamp-based ID generators.",
    },
    {
      term: "Birthday Paradox",
      definition:
        "The counterintuitive probability result that in a set of N randomly chosen values from a range of size R, the probability of a collision is approximately N^2 / (2R). Used to analyze UUID collision probability.",
    },
    {
      term: "Shard-Aware ID",
      definition:
        "An ID scheme that embeds the database shard number within the ID bits, enabling O(1) shard routing by extracting the shard via bit operations. Eliminates the need for a routing lookup table.",
    },
    {
      term: "Ticket Server",
      definition:
        "A centralized service (often a database with AUTO_INCREMENT) that dispenses unique IDs. Flickr's pattern uses two ticket servers generating odd and even IDs for redundancy and doubled throughput.",
    },
  ],
  animations: [
    {
      title: "Generating a sortable unique id without coordination",
      steps: [
        {
          label: "Why not auto-increment",
          detail: "It requires a single writer — the bottleneck you're trying to remove.",
        },
        {
          label: "Why not UUIDv4",
          detail: "Unique, but random, so it destroys index locality and sorts meaninglessly.",
        },
        {
          label: "Snowflake layout",
          detail: "41 bits timestamp, 10 bits machine id, 12 bits sequence within the millisecond.",
        },
        {
          label: "Generation",
          detail: "Each node produces ids locally with no network call at all.",
        },
        {
          label: "Properties",
          detail: "Roughly time-sortable, 4096 ids per node per millisecond, no coordination.",
        },
        {
          label: "The failure mode",
          detail: "A backwards clock adjustment can produce duplicates — so nodes refuse to issue ids until the clock catches up.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Snowflake",
      "UUID v4",
      "UUID v7",
      "DB Auto-increment",
      "Shard-Aware",
    ],
    rows: [
      [
        "**Size**",
        "64 bits (8 bytes)",
        "128 bits (16 bytes)",
        "128 bits (16 bytes)",
        "32 or 64 bits",
        "64 bits (8 bytes)",
      ],
      [
        "**Sortable by time**",
        "Yes",
        "No",
        "Yes",
        "Yes (sequential)",
        "Yes",
      ],
      [
        "**Coordination needed**",
        "Worker ID assignment only",
        "None",
        "None",
        "Central DB for every ID",
        "Worker or shard ID assignment",
      ],
      [
        "**Throughput per node**",
        "approximately 4M/sec",
        "approximately 10M+/sec",
        "approximately 10M+/sec",
        "approximately 10K-50K/sec",
        "approximately 1M/sec",
      ],
      [
        "**B-tree performance**",
        "Excellent (sequential)",
        "Poor (random)",
        "Excellent (sequential)",
        "Excellent (sequential)",
        "Excellent (sequential)",
      ],
      [
        "**Embeds metadata**",
        "Timestamp, DC, worker",
        "None",
        "Timestamp only",
        "None",
        "Timestamp, shard",
      ],
      [
        "**Uniqueness guarantee**",
        "Deterministic",
        "Probabilistic",
        "Probabilistic",
        "Deterministic",
        "Deterministic",
      ],
      [
        "**Clock dependency**",
        "Critical",
        "None",
        "For sorting only",
        "None",
        "Critical",
      ],
    ],
  },
  followUps: [
    "How would you migrate from UUID v4 to UUID v7 in a running production system?",
    "What are the implications of Snowflake IDs for privacy (leaking creation time and datacenter)?",
    "How does CockroachDB generate transaction IDs without a central timestamp authority?",
    "What are the trade-offs of using KSUIDs vs ULIDs vs UUID v7 for a new project?",
    "How do you ensure ID uniqueness during a datacenter failover when worker IDs might conflict?",
    "What changes are needed in your ID generation strategy when moving from a monolith to microservices?",
  ],
  resources: [
    {
      label: "Announcing Snowflake (Twitter Engineering Blog)",
      kind: "article",
      note: "The original blog post describing Twitter's Snowflake ID generation system and its design rationale.",
    },
    {
      label: "RFC 9562 - Universally Unique Identifiers (UUIDs)",
      kind: "docs",
      note: "The 2024 IETF RFC standardizing UUID versions 1-8 including the new time-sortable v6 and v7.",
    },
    {
      label: "Designing Data-Intensive Applications - Ch. 5-6",
      kind: "book",
      note: "Martin Kleppmann covers distributed ID generation, replication, and partitioning strategies in depth.",
    },
    {
      label: "Sharding and IDs at Instagram (Instagram Engineering)",
      kind: "article",
      note: "How Instagram generates shard-aware IDs using PostgreSQL, with detailed bit layout and PL/pgSQL implementation.",
    },
    {
      label: "Spanner: Google's Globally-Distributed Database",
      kind: "paper",
      note: "Google's paper on TrueTime and how globally consistent timestamps enable distributed transactions and ID ordering.",
    },
  ],
};
