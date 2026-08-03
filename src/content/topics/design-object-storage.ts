import type { TopicContent } from "../types";

export const designObjectStorage: TopicContent = {
  quickSummary: [
    "An object storage system like S3 stores exabytes of immutable binary objects (blobs) addressed by a flat namespace (bucket + key), achieving 99.999999999% (11 nines) durability by writing each object across multiple availability zones using erasure coding or triple replication.",
    "The architecture splits into three planes: a metadata service (key-to-location mapping backed by a distributed B-tree or LSM-tree), a data plane (chunked blob storage on commodity disks with erasure coding for space efficiency), and a gateway/API layer that routes client requests, enforces authentication, rate limiting, and multi-part upload orchestration.",
    "Multi-part upload breaks large objects (up to 5 TB) into independently uploadable parts (5 MB to 5 GB each), enabling parallel uploads, resumable transfers, and server-side reassembly via a manifest that maps part numbers to their storage locations.",
    "Versioning and lifecycle policies are metadata-layer features: versioning appends a version ID to every PUT so deletes are logical (a delete marker), while lifecycle rules (transition to cold storage after 30 days, expire after 365 days) are executed by background garbage collection workers scanning metadata indexes.",
    "Consistency evolved from eventual (original S3) to strong read-after-write: after a successful PUT returns 200, any subsequent GET anywhere in the world returns the latest version, achieved by synchronous metadata commits with Paxos/Raft before acknowledging the write.",
  ],
  detailed: [
    "## High-Level Architecture and Data Flow\n\nAn object storage system is organized into three planes: an API gateway layer, a metadata service, and a data storage layer. The API gateway receives HTTP requests (PUT, GET, DELETE, HEAD, LIST), authenticates them using HMAC-signed requests (like AWS Signature V4), and routes them to the correct internal service. The metadata service is the brain of the system: it maps each object key to its physical storage locations, manages bucket-level configuration (versioning, lifecycle, CORS), and maintains indexes for LIST operations. The data storage layer handles the actual bytes on disk across thousands of storage nodes, each running a local blob store daemon that manages disk I/O, checksums, and local garbage collection. A typical write path for a 100 MB object involves the gateway chunking it into 64 MB or 128 MB blocks, writing each block to the data layer across multiple storage nodes, and then atomically committing the object metadata once all blocks are durable. The read path is simpler: the gateway queries the metadata service for the block locations, then streams the blocks directly from storage nodes back to the client, often in parallel.",
    "## Metadata Service Design\n\nThe metadata service is the most critical and complex component because every single operation touches it. It must handle billions of objects across millions of buckets, supporting fast point lookups (GET object metadata by key) and range scans (LIST objects with prefix and delimiter). A common design uses a distributed B-tree or LSM-tree partitioned by bucket ID, with each partition responsible for a range of object keys within that bucket. Partitioning by bucket avoids hotspots for LIST operations but creates skew for buckets with millions of objects, so large buckets are further sub-partitioned by key range. Each metadata record stores the object key, version ID, size, content type, user metadata, ACL, creation timestamp, and a list of chunk references (storage node + disk + offset + length). The metadata service uses Paxos or Raft for replication across 3-5 nodes per partition to achieve strong consistency. The total metadata footprint matters: at 1 KB per record and 100 billion objects, the metadata layer alone requires 100 TB of storage, typically on SSDs for low-latency access.",
    "## Erasure Coding vs. Replication\n\nDurability is the defining feature of object storage, and the choice between erasure coding and replication is the most consequential engineering trade-off. Triple replication stores 3 copies of every byte, consuming 3x storage but offering simple recovery (just copy from a surviving replica) and low read latency (read from the nearest replica). Erasure coding (e.g., Reed-Solomon 8+4) splits each chunk into 8 data fragments and 4 parity fragments across 12 storage nodes, tolerating any 4 failures while using only 1.5x storage — a 50% space savings compared to triple replication. The trade-off is CPU overhead for encoding/decoding (roughly 2-4 GB/s per core with SIMD-optimized libraries like ISA-L) and higher read tail latency because a degraded read requires fetching from 8 of 12 nodes and reconstructing. In practice, S3 uses erasure coding for the vast majority of data because at exabyte scale, the storage cost savings dominate. Hot data (frequently accessed) might use replication for latency, while warm and cold tiers use progressively more aggressive erasure coding ratios (e.g., 12+4 or 17+3).",
    "## Multi-Part Upload and Large Object Handling\n\nMulti-part upload is essential for objects larger than ~100 MB because single-stream uploads over the internet are unreliable for large transfers. The protocol works in three phases: initiate (returns an upload ID), upload parts (each part is a separate HTTP PUT with the upload ID and a part number, uploaded in any order, potentially in parallel), and complete (submits a manifest listing all part ETags, which triggers the server to assemble the final object). Each part is independently stored and checksummed, so a failed part can be retried without re-uploading the entire object. The server enforces a minimum part size of 5 MB (except the last part) to prevent abuse that would create billions of tiny fragments. Parts can be uploaded from different machines or regions, enabling distributed upload pipelines. An important edge case is abandoned uploads: parts consume storage but the object is not yet visible, so a lifecycle rule or background sweeper must garbage-collect incomplete uploads after a configurable timeout (e.g., 7 days).",
    "## Versioning, Lifecycle Policies, and Garbage Collection\n\nVersioning transforms every PUT into an append operation at the metadata layer: instead of overwriting the previous metadata record, a new record with a unique version ID is inserted, and the latest-version pointer is updated atomically. A DELETE on a versioned bucket inserts a delete marker (a zero-byte version), making the object invisible to unversioned GET requests but recoverable by specifying the version ID. Lifecycle policies are declarative rules (expressed as XML or JSON) that automate storage management: transition rules move objects to cheaper storage classes (e.g., Standard to Infrequent Access after 30 days, to Glacier after 90 days), and expiration rules delete objects after a specified age. These rules are executed by background workers that scan metadata indexes (typically sorted by creation timestamp), identify matching objects, and enqueue transition or deletion tasks. Garbage collection is a two-phase process: first, metadata is updated to mark the object as deleted, then a separate background process reclaims the physical storage blocks. This decoupling prevents deletion latency from affecting client-facing operations and allows batch optimization of disk I/O during garbage collection.",
  ],
  deepDive: [
    "Achieving 11 nines of durability (99.999999999%) requires thinking probabilistically about correlated failures. At 1 trillion objects, 11 nines means losing fewer than 0.01 objects per year. With triple replication across 3 availability zones, you must lose all 3 copies simultaneously. If a single drive has an annual failure rate (AFR) of 2% and mean time to repair (MTTR) of 4 hours, the probability of triple failure is approximately (AFR * MTTR/8760)^2 for each pair, multiplied across all objects. But the real danger is correlated failures: a firmware bug affecting a batch of drives, a power event taking out a rack, or a software bug corrupting data silently (bit rot). Erasure coding with fragments spread across independent failure domains (different racks, power circuits, and AZs) reduces correlation. Silent data corruption is detected by computing and verifying checksums (SHA-256 or CRC32c) at every layer: on write, on read, during background scrubbing (periodic verification of all stored data, typically cycling through the entire corpus every 30-90 days). The scrubbing process detects and repairs bit rot before it compounds into an irrecoverable state.",
    "The consistency model of an object storage system is more nuanced than simple strong or eventual. Read-after-write consistency guarantees that after a PUT returns 200, any GET from any client sees the new object. List-after-write consistency guarantees the new object appears in LIST results. S3 achieved strong consistency for both by making the metadata commit the linearization point: data is written to the storage layer first (potentially with eventual convergence), and only after the metadata is committed via Raft consensus across multiple metadata nodes does the PUT return success. The metadata layer acts as a serialization barrier. For deletes, the delete marker is committed the same way, so subsequent GETs return 404 immediately. The subtle aspect is conditional writes: if-none-match semantics require a read-modify-write cycle on the metadata, which must be linearized to prevent lost updates. S3 added conditional writes in 2024, using compare-and-swap on the version vector in the metadata layer, enabling safe concurrent modifications without application-level locking.",
    "Scaling to exabytes requires careful capacity planning at every layer. The metadata service must handle hundreds of millions of requests per second globally, which is achieved by aggressive partitioning (millions of metadata partitions) and caching (hot bucket metadata in a distributed cache layer in front of the metadata store). The data layer consists of hundreds of thousands of storage nodes, each with 10-36 HDDs (14-22 TB each), giving a total raw capacity of 50-800 TB per node. The placement algorithm must balance writes across nodes while respecting failure domain constraints (no two fragments of the same erasure-coded group on the same rack), which is solved by a consistent-hashing-based placement algorithm (similar to Ceph's CRUSH) that is deterministic — any node can compute the placement without consulting a central coordinator. Network bandwidth is a binding constraint: a storage node with 36 HDDs can sustain about 3-5 GB/s aggregate disk throughput, requiring at least a 50 Gbps network link. Cross-AZ data transfer for replication and erasure coding adds significant cost, so systems batch cross-AZ writes and use intra-AZ read preference to minimize transfer fees.",
    "Failure scenarios and operational resilience define the true quality of an object storage system. A storage node failure triggers the repair process: the placement algorithm identifies all erasure-coded groups that had a fragment on the failed node, reads the surviving fragments from other nodes, reconstructs the missing fragment, and writes it to a new node. At 500 TB per node and 200 MB/s repair throughput, a full node repair takes about 40 minutes with parallel reconstruction across hundreds of groups. During repair, the system operates in a degraded state with reduced fault tolerance, so repair speed is critical — a second failure during repair could cause data loss if the erasure coding cannot tolerate it. To mitigate this, systems over-provision parity (e.g., 8+4 tolerates 4 failures but expects at most 1-2 during repair), monitor repair queues, and prioritize groups with the fewest surviving fragments. Beyond hardware failures, the system must handle software bugs (detected by checksums and cross-replica comparison), human errors (prevented by versioning and MFA Delete), and regional outages (handled by cross-region replication with configurable RPO).",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Erasure coding encode/decode using Reed-Solomon (simplified GF(2^8) arithmetic)",
      source: `#include <vector>
#include <cstdint>
#include <stdexcept>
#include <algorithm>

// Galois Field GF(2^8) arithmetic for Reed-Solomon erasure coding.
// Primitive polynomial: x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
class GaloisField {
    uint8_t exp_table_[512];  // double-sized for mod-free multiplication
    uint8_t log_table_[256];

public:
    GaloisField() {
        uint16_t x = 1;
        for (int i = 0; i < 255; ++i) {
            exp_table_[i] = static_cast<uint8_t>(x);
            exp_table_[i + 255] = static_cast<uint8_t>(x);
            log_table_[x] = static_cast<uint8_t>(i);
            x <<= 1;
            if (x & 0x100) x ^= 0x11d;
        }
        log_table_[0] = 0;  // undefined, but set to 0 for convenience
    }

    uint8_t multiply(uint8_t a, uint8_t b) const {
        if (a == 0 || b == 0) return 0;
        return exp_table_[log_table_[a] + log_table_[b]];
    }

    uint8_t inverse(uint8_t a) const {
        if (a == 0) throw std::runtime_error("No inverse for zero");
        return exp_table_[255 - log_table_[a]];
    }
};

// Reed-Solomon erasure coding: k data shards + m parity shards
// Each shard is a vector of bytes (all same length).
class ErasureCoder {
    int k_;  // data shards
    int m_;  // parity shards
    GaloisField gf_;
    std::vector<std::vector<uint8_t>> encoding_matrix_;

    // Build a Vandermonde-based encoding matrix (k+m) x k
    void buildEncodingMatrix() {
        int n = k_ + m_;
        encoding_matrix_.resize(n, std::vector<uint8_t>(k_));
        // Top k rows = identity (data shards pass through)
        for (int r = 0; r < k_; ++r)
            for (int c = 0; c < k_; ++c)
                encoding_matrix_[r][c] = (r == c) ? 1 : 0;
        // Bottom m rows = Vandermonde-derived parity coefficients
        for (int r = 0; r < m_; ++r)
            for (int c = 0; c < k_; ++c)
                encoding_matrix_[k_ + r][c] =
                    gf_.multiply(1, gf_.inverse(r ^ c ? (r ^ c) : 1));
    }

public:
    ErasureCoder(int data_shards, int parity_shards)
        : k_(data_shards), m_(parity_shards) {
        buildEncodingMatrix();
    }

    // Encode: given k data shards, produce k+m shards (data + parity).
    // Each shard is shard_size bytes.
    std::vector<std::vector<uint8_t>> encode(
        const std::vector<std::vector<uint8_t>>& data_shards) {
        if ((int)data_shards.size() != k_)
            throw std::runtime_error("Expected k data shards");
        size_t shard_size = data_shards[0].size();
        int n = k_ + m_;
        std::vector<std::vector<uint8_t>> all_shards(n,
            std::vector<uint8_t>(shard_size, 0));

        // Copy data shards directly
        for (int i = 0; i < k_; ++i)
            all_shards[i] = data_shards[i];

        // Compute parity shards: parity[r][byte] = sum(matrix[k+r][c] * data[c][byte])
        for (int r = 0; r < m_; ++r) {
            for (size_t b = 0; b < shard_size; ++b) {
                uint8_t val = 0;
                for (int c = 0; c < k_; ++c) {
                    val ^= gf_.multiply(
                        encoding_matrix_[k_ + r][c], data_shards[c][b]);
                }
                all_shards[k_ + r][b] = val;
            }
        }
        return all_shards;
    }

    // Decode: given any k surviving shards (with their original indices),
    // reconstruct the original k data shards via matrix inversion.
    std::vector<std::vector<uint8_t>> decode(
        const std::vector<std::vector<uint8_t>>& surviving_shards,
        const std::vector<int>& surviving_indices) {
        if ((int)surviving_shards.size() < k_)
            throw std::runtime_error("Need at least k shards to decode");

        size_t shard_size = surviving_shards[0].size();
        // Build sub-matrix from encoding_matrix rows corresponding
        // to surviving shards, then invert it over GF(2^8).
        // (Gauss-Jordan elimination omitted for brevity)
        // Result: multiply inverse_matrix * surviving_shards
        return surviving_shards;  // placeholder for full reconstruction
    }
};

// Usage example: 8 data + 4 parity = 12 total shards, tolerates 4 failures
// ErasureCoder ec(8, 4);
// auto all_shards = ec.encode(data_shards);  // produces 12 shards
// Store each shard on a different storage node/rack/AZ.
// On read: fetch any 8 of 12 shards, call decode() to reconstruct.`,
    },
    {
      language: "cpp",
      caption:
        "Content-addressable storage: SHA-256 hashing for deduplication and integrity verification",
      source: `#include <string>
#include <vector>
#include <cstdint>
#include <unordered_map>
#include <mutex>
#include <sstream>
#include <iomanip>
#include <array>
#include <functional>

// Simplified content-addressable storage using SHA-256 content hashing.
// In production, use a crypto library (OpenSSL, libsodium) for SHA-256.

struct ChunkDescriptor {
    std::string content_hash;  // hex-encoded SHA-256
    uint64_t size;
    std::string storage_node;
    uint64_t disk_offset;
};

struct ObjectMetadata {
    std::string bucket;
    std::string key;
    std::string version_id;
    uint64_t total_size;
    std::string content_type;
    int64_t created_at;           // epoch millis
    std::vector<ChunkDescriptor> chunks;  // ordered list of chunks
    std::string etag;             // MD5 of content or multipart manifest hash
};

class ContentAddressableStore {
    // Map from content hash -> reference count and storage location.
    // Enables deduplication: identical chunks share storage.
    struct StoredChunk {
        std::string storage_node;
        uint64_t disk_offset;
        uint64_t size;
        int ref_count;
    };

    std::unordered_map<std::string, StoredChunk> chunk_index_;
    std::mutex mu_;

    // In production, this would be a real SHA-256 implementation.
    std::string computeSHA256(const std::vector<uint8_t>& data) {
        std::hash<std::string> hasher;
        std::string input(data.begin(), data.end());
        size_t h = hasher(input);
        std::ostringstream oss;
        oss << std::hex << std::setfill('0') << std::setw(16) << h;
        // Repeat to simulate 256-bit hash (placeholder)
        std::string half = oss.str();
        return half + half + half + half;
    }

public:
    // Store a chunk. Returns its content hash.
    // If the chunk already exists (same hash), increment ref count
    // and skip the write (deduplication).
    ChunkDescriptor storeChunk(
        const std::vector<uint8_t>& data,
        const std::string& target_node) {

        std::string hash = computeSHA256(data);

        std::lock_guard<std::mutex> lock(mu_);
        auto it = chunk_index_.find(hash);
        if (it != chunk_index_.end()) {
            // Deduplication hit: chunk already stored
            it->second.ref_count++;
            return {hash, it->second.size,
                    it->second.storage_node, it->second.disk_offset};
        }

        // New chunk: write to storage node (RPC omitted)
        uint64_t offset = allocateOnNode(target_node, data.size());
        // writeToNode(target_node, offset, data);  // actual I/O

        StoredChunk sc{target_node, offset, data.size(), 1};
        chunk_index_[hash] = sc;
        return {hash, data.size(), target_node, offset};
    }

    // Verify integrity by re-hashing stored data and comparing.
    // Called during background scrubbing (every 30-90 days).
    bool verifyChunk(const std::string& hash,
                     const std::vector<uint8_t>& data) {
        return computeSHA256(data) == hash;
    }

    // Decrement ref count; reclaim space when it reaches zero.
    void releaseChunk(const std::string& hash) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = chunk_index_.find(hash);
        if (it == chunk_index_.end()) return;
        if (--it->second.ref_count <= 0) {
            // Enqueue for async disk space reclamation
            // reclaimStorage(it->second.storage_node, it->second.disk_offset);
            chunk_index_.erase(it);
        }
    }

private:
    uint64_t allocateOnNode(const std::string& node, size_t size) {
        // Placeholder: in production, this contacts the storage node
        // to allocate contiguous disk space and returns the offset.
        static uint64_t next_offset = 0;
        uint64_t offset = next_offset;
        next_offset += size;
        return offset;
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Metadata B-tree index for bucket object listing with prefix and delimiter support",
      source: `#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <optional>

// Simplified B-tree node for object metadata indexing.
// In production, this would be a persistent B+-tree backed by SSDs
// with WAL for crash recovery, replicated via Raft across 3-5 nodes.

struct MetadataRecord {
    std::string key;          // full object key within bucket
    std::string version_id;
    uint64_t size;
    int64_t last_modified;    // epoch millis
    std::string etag;
    bool is_delete_marker;
    std::vector<std::string> chunk_hashes;  // references to data chunks
};

class BTreeNode {
    static constexpr int ORDER = 256;  // high fanout for disk-based B-tree
    bool is_leaf_;
    std::vector<MetadataRecord> records_;
    std::vector<std::shared_ptr<BTreeNode>> children_;

public:
    explicit BTreeNode(bool leaf) : is_leaf_(leaf) {}

    // Point lookup: find a specific object key (latest version).
    std::optional<MetadataRecord> get(const std::string& key) const {
        int idx = lowerBound(key);
        if (is_leaf_) {
            if (idx < (int)records_.size() && records_[idx].key == key) {
                // Return latest non-delete-marker version
                return records_[idx];
            }
            return std::nullopt;
        }
        // Internal node: descend to appropriate child
        return children_[idx]->get(key);
    }

    // Range scan: list objects with given prefix, respecting delimiter
    // for simulating directory-like hierarchy.
    // e.g., prefix="photos/2024/", delimiter="/" returns:
    //   - objects directly under photos/2024/ (not in sub-prefixes)
    //   - common prefixes like photos/2024/jan/, photos/2024/feb/
    struct ListResult {
        std::vector<MetadataRecord> objects;
        std::vector<std::string> common_prefixes;
        std::string next_continuation_token;
        bool is_truncated;
    };

    ListResult listObjects(const std::string& prefix,
                           const std::string& delimiter,
                           const std::string& start_after,
                           int max_keys) const {
        ListResult result;
        result.is_truncated = false;
        std::vector<MetadataRecord> all_matching;

        // Collect all records with matching prefix via in-order traversal
        collectWithPrefix(prefix, start_after, all_matching);

        // Apply delimiter logic to group common prefixes
        std::set<std::string> seen_prefixes;
        for (const auto& rec : all_matching) {
            if (rec.is_delete_marker) continue;
            if ((int)result.objects.size() + (int)result.common_prefixes.size()
                    >= max_keys) {
                result.is_truncated = true;
                result.next_continuation_token = rec.key;
                break;
            }

            if (!delimiter.empty()) {
                // Check if key has delimiter after the prefix
                size_t delim_pos = rec.key.find(delimiter, prefix.size());
                if (delim_pos != std::string::npos) {
                    std::string common_prefix =
                        rec.key.substr(0, delim_pos + delimiter.size());
                    if (seen_prefixes.insert(common_prefix).second) {
                        result.common_prefixes.push_back(common_prefix);
                    }
                    continue;  // skip individual object, grouped under prefix
                }
            }
            result.objects.push_back(rec);
        }
        return result;
    }

private:
    int lowerBound(const std::string& key) const {
        return static_cast<int>(std::lower_bound(
            records_.begin(), records_.end(), key,
            [](const MetadataRecord& r, const std::string& k) {
                return r.key < k;
            }) - records_.begin());
    }

    void collectWithPrefix(const std::string& prefix,
                           const std::string& start_after,
                           std::vector<MetadataRecord>& out) const {
        int start_idx = lowerBound(
            start_after.empty() ? prefix : start_after);
        if (is_leaf_) {
            for (int i = start_idx; i < (int)records_.size(); ++i) {
                if (records_[i].key.substr(0, prefix.size()) != prefix) break;
                if (records_[i].key > start_after) {
                    out.push_back(records_[i]);
                }
            }
        } else {
            for (int i = start_idx; i <= (int)records_.size(); ++i) {
                if (i < (int)records_.size()) {
                    if (records_[i].key.substr(0, prefix.size()) != prefix)
                        break;
                }
                if (i < (int)children_.size()) {
                    children_[i]->collectWithPrefix(prefix, start_after, out);
                }
                if (i < (int)records_.size() &&
                    records_[i].key > start_after &&
                    records_[i].key.substr(0, prefix.size()) == prefix) {
                    out.push_back(records_[i]);
                }
            }
        }
    }
};

// In production, the B-tree is partitioned per bucket and stored on SSDs.
// Each partition is replicated via Raft for durability and consistency.
// A typical metadata record is ~500 bytes to 1 KB.
// With ORDER=256 and 3 levels, a single B-tree handles ~16 million keys.
// Larger buckets are sub-partitioned by key range (e.g., first 2 chars).`,
    },
  ],
  diagrams: [
    {
      title: "Object Storage High-Level Architecture",
      kind: "architecture",
      caption:
        "Three-plane architecture: API gateways, metadata service with Raft consensus, and erasure-coded data storage across availability zones",
      mermaid: `graph TD
    Client["Client / SDK"] -->|"HTTP PUT/GET"| LB["Load Balancer"]
    LB --> GW1["API Gateway 1"]
    LB --> GW2["API Gateway 2"]
    LB --> GW3["API Gateway 3"]
    GW1 --> Auth["Auth Service - Signature V4"]
    GW2 --> Auth
    GW3 --> Auth
    GW1 --> Meta["Metadata Service - Raft Cluster"]
    GW2 --> Meta
    GW3 --> Meta
    Meta --> MetaDB1["Metadata Partition 1 - SSD B-tree"]
    Meta --> MetaDB2["Metadata Partition 2 - SSD B-tree"]
    Meta --> MetaDB3["Metadata Partition N - SSD B-tree"]
    GW1 --> DS["Data Plane Router"]
    GW2 --> DS
    GW3 --> DS
    DS --> AZ1["AZ-1 Storage Nodes"]
    DS --> AZ2["AZ-2 Storage Nodes"]
    DS --> AZ3["AZ-3 Storage Nodes"]
    AZ1 --> D1["Node 1: 36 HDDs"]
    AZ1 --> D2["Node 2: 36 HDDs"]
    AZ2 --> D3["Node 3: 36 HDDs"]
    AZ2 --> D4["Node 4: 36 HDDs"]
    AZ3 --> D5["Node 5: 36 HDDs"]
    AZ3 --> D6["Node 6: 36 HDDs"]`,
    },
    {
      title: "Multi-Part Upload Sequence",
      kind: "sequence",
      caption:
        "Three-phase multi-part upload: initiate, parallel part uploads with independent checksums, and atomic completion via manifest commit",
      mermaid: `sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant MS as Metadata Service
    participant DS as Data Storage

    C->>GW: POST /bucket/key?uploads (Initiate)
    GW->>MS: Create upload record
    MS-->>GW: Upload ID
    GW-->>C: 200 OK + Upload ID

    par Parallel Part Uploads
        C->>GW: PUT /bucket/key?partNumber=1&uploadId=X
        GW->>DS: Write chunk (erasure coded 8+4)
        DS-->>GW: Chunk locations + checksum
        GW-->>C: 200 OK + ETag for part 1
    and
        C->>GW: PUT /bucket/key?partNumber=2&uploadId=X
        GW->>DS: Write chunk (erasure coded 8+4)
        DS-->>GW: Chunk locations + checksum
        GW-->>C: 200 OK + ETag for part 2
    and
        C->>GW: PUT /bucket/key?partNumber=3&uploadId=X
        GW->>DS: Write chunk (erasure coded 8+4)
        DS-->>GW: Chunk locations + checksum
        GW-->>C: 200 OK + ETag for part 3
    end

    C->>GW: POST /bucket/key?uploadId=X (Complete)
    Note over GW: Validate all part ETags
    GW->>MS: Atomic metadata commit with chunk manifest
    MS-->>GW: Version ID assigned
    GW-->>C: 200 OK + ETag + Version ID

    Note over C,DS: Object now visible to all readers globally`,
    },
    {
      title: "Erasure Coding Data Distribution",
      kind: "flow",
      caption:
        "Reed-Solomon 8+4 encoding: a 64 MB chunk is split into 8 data fragments and 4 parity fragments, distributed across 12 storage nodes in different racks",
      mermaid: `flowchart TD
    OBJ["Original 64 MB Chunk"] --> SPLIT["Split into 8 equal data fragments"]
    SPLIT --> D1["Data Fragment 1 - 8 MB"]
    SPLIT --> D2["Data Fragment 2 - 8 MB"]
    SPLIT --> D3["Data Fragment 3 - 8 MB"]
    SPLIT --> D4["Data Fragment 4 - 8 MB"]
    SPLIT --> D5["Data Fragment 5 - 8 MB"]
    SPLIT --> D6["Data Fragment 6 - 8 MB"]
    SPLIT --> D7["Data Fragment 7 - 8 MB"]
    SPLIT --> D8["Data Fragment 8 - 8 MB"]

    D1 --> ENC["Reed-Solomon Encoder GF 2^8"]
    D2 --> ENC
    D3 --> ENC
    D4 --> ENC
    D5 --> ENC
    D6 --> ENC
    D7 --> ENC
    D8 --> ENC

    ENC --> P1["Parity Fragment 1 - 8 MB"]
    ENC --> P2["Parity Fragment 2 - 8 MB"]
    ENC --> P3["Parity Fragment 3 - 8 MB"]
    ENC --> P4["Parity Fragment 4 - 8 MB"]

    D1 --> N1["Rack A / Node 1"]
    D2 --> N2["Rack A / Node 2"]
    D3 --> N3["Rack B / Node 3"]
    D4 --> N4["Rack B / Node 4"]
    D5 --> N5["Rack C / Node 5"]
    D6 --> N6["Rack C / Node 6"]
    D7 --> N7["Rack D / Node 7"]
    D8 --> N8["Rack D / Node 8"]
    P1 --> N9["Rack E / Node 9"]
    P2 --> N10["Rack E / Node 10"]
    P3 --> N11["Rack F / Node 11"]
    P4 --> N12["Rack F / Node 12"]

    style ENC fill:#f9f,stroke:#333,stroke-width:2px`,
    },
    {
      title: "Object Versioning and Lifecycle State Machine",
      kind: "flow",
      caption:
        "Object lifecycle from creation through storage class transitions to expiration, including versioning states and delete markers",
      mermaid: `flowchart TD
    PUT["PUT Object"] --> CURRENT["Current Version - Standard Storage"]
    CURRENT -->|"New PUT same key"| NONCURRENT["Non-Current Version"]
    CURRENT -->|"DELETE with versioning"| DM["Delete Marker Created"]
    DM -->|"Unversioned GET"| R404["Returns 404"]
    DM -->|"GET with version ID"| RESTORE["Returns Original Object"]

    CURRENT -->|"Lifecycle: 30 days"| IA["Infrequent Access Tier"]
    IA -->|"Lifecycle: 90 days"| ARCHIVE["Archive / Glacier Tier"]
    ARCHIVE -->|"Lifecycle: 365 days"| EXPIRE["Expired - GC Eligible"]

    NONCURRENT -->|"Lifecycle: 30 days noncurrent"| NC_IA["Non-Current IA Tier"]
    NC_IA -->|"Lifecycle: 90 days noncurrent"| NC_DEL["Permanently Deleted"]

    EXPIRE --> GC["Garbage Collector"]
    NC_DEL --> GC
    GC --> META_DEL["Remove Metadata Record"]
    GC --> CHUNK_DEL["Decrement Chunk Ref Counts"]
    CHUNK_DEL -->|"Ref count = 0"| RECLAIM["Reclaim Disk Space"]`,
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Triple Replication",
      "Erasure Coding 8+4",
      "Erasure Coding 12+4",
      "Erasure Coding 17+3",
    ],
    rows: [
      [
        "Storage Overhead",
        "3.0x (200% overhead)",
        "1.5x (50% overhead)",
        "1.33x (33% overhead)",
        "1.18x (18% overhead)",
      ],
      [
        "Fault Tolerance",
        "Tolerates 2 failures",
        "Tolerates 4 failures",
        "Tolerates 4 failures",
        "Tolerates 3 failures",
      ],
      [
        "Read Latency",
        "Low - read from nearest replica",
        "Medium - need 8 of 12 nodes",
        "Higher - need 12 of 16 nodes",
        "Highest - need 17 of 20 nodes",
      ],
      [
        "Write Latency",
        "Low - 3 parallel writes",
        "Medium - encode + 12 writes",
        "Higher - encode + 16 writes",
        "Highest - encode + 20 writes",
      ],
      [
        "Repair Speed",
        "Fast - copy single replica",
        "Medium - reconstruct from 8 fragments",
        "Slower - reconstruct from 12 fragments",
        "Slowest - reconstruct from 17 fragments",
      ],
      [
        "CPU Cost",
        "None for replication",
        "Moderate - GF arithmetic",
        "Higher - larger matrix operations",
        "Highest - largest matrix",
      ],
      [
        "Best Use Case",
        "Hot data, latency-sensitive",
        "General purpose, balanced",
        "Warm data, cost-optimized",
        "Cold/archive data, minimum cost",
      ],
    ],
  },
  interviewQA: [
    {
      q: "How would you design the metadata service for an object storage system that handles 100 billion objects?",
      a: "The metadata service must support fast point lookups (GET by key) and range scans (LIST with prefix). I would partition the metadata by bucket ID first, then sub-partition large buckets by key range (e.g., hash of the first few characters). Each partition is a B+-tree stored on SSDs, replicated via Raft across 3-5 nodes for strong consistency. At 1 KB per metadata record and 100 billion objects, the total metadata footprint is about 100 TB, which is manageable across hundreds of SSD-backed nodes. Each metadata record contains the object key, version ID, size, content type, checksum, ACL, and a list of chunk references pointing to the data storage layer. For LIST operations, the B-tree's sorted nature provides efficient prefix scans. I would add a caching layer (similar to a distributed cache) in front of the metadata store for hot buckets, using short TTLs to maintain consistency. The critical insight is that the metadata commit is the linearization point for consistency: the PUT only returns success after the Raft leader commits the metadata entry.",
      followUps: [
        "How do you handle a bucket with 10 billion objects when listing?",
        "What happens to metadata consistency during a network partition between Raft nodes?",
        "How would you index metadata for time-range queries on last-modified?",
      ],
    },
    {
      q: "Explain the trade-offs between erasure coding and replication for achieving 11 nines durability.",
      a: "Both approaches can achieve 11 nines durability, but they trade off storage cost against read latency and operational complexity. Triple replication uses 3x storage: for every 1 PB of data you store 3 PB. Erasure coding with an 8+4 scheme uses only 1.5x storage while tolerating more simultaneous failures (4 vs 2). The durability math works as follows: with an annual disk failure rate of 2% and a 4-hour mean time to repair, the probability of losing all 3 replicas is approximately 10^-14 per object per year, which exceeds 11 nines. For 8+4 erasure coding, you need 5 or more simultaneous failures in the same group to lose data, which has a probability below 10^-18. However, erasure coding has higher read latency because you must contact 8 of 12 nodes and potentially reconstruct data using Galois field arithmetic. The CPU cost of encoding is about 2-4 GB/s per core with SIMD-optimized libraries. In practice, cloud providers use replication for the hottest data and increasingly aggressive erasure coding ratios for warmer and colder tiers, optimizing total cost of ownership while maintaining the durability SLA across all tiers.",
      followUps: [
        "How does correlated failure (e.g., a firmware bug) affect the durability calculation?",
        "What is the repair bandwidth cost when a storage node fails?",
        "How do you choose erasure coding parameters for different storage classes?",
      ],
    },
    {
      q: "How does strong read-after-write consistency work in a globally distributed object store?",
      a: "Strong read-after-write consistency means that after a PUT returns 200, any subsequent GET from any client anywhere in the world will return the new version of the object. The key insight is that consistency is enforced at the metadata layer, not the data layer. When a PUT is received, the data is first written to the storage layer (erasure coded across multiple nodes). Only after all data chunks are durable does the API gateway send a commit to the metadata service. The metadata service uses Raft consensus to replicate the metadata entry across 3-5 nodes, and the PUT response is sent to the client only after the Raft leader confirms the commit is replicated to a majority. For reads, the GET request queries the metadata service, which always returns the latest committed version because Raft provides linearizable reads (either through leader leases or read-index protocol). This approach decouples data durability from metadata consistency: the data can be eventually consistent in the background, but the metadata commit creates a happens-before relationship that the client can rely on. The challenge is cross-region consistency for global deployments, which requires either synchronous cross-region Raft (high latency) or a witness-based protocol that confirms durability without full cross-region replication.",
      followUps: [
        "How does LIST consistency differ from GET consistency, and why?",
        "What is the latency impact of synchronous Raft commits on write throughput?",
        "How did S3 transition from eventual to strong consistency without downtime?",
      ],
    },
    {
      q: "Walk through the failure recovery process when a storage node with 500 TB of data dies.",
      a: "When a storage node fails, the recovery system must reconstruct all erasure-coded fragments that were on that node and place them on healthy nodes. First, the monitoring system detects the failure (via heartbeat timeout, typically 30-60 seconds) and marks the node as down. The placement algorithm then identifies every erasure-coded group that had a fragment on the failed node, which could be millions of groups. For each group, the system reads the surviving fragments from the other nodes (at least k out of n for an (k,m) code), reconstructs the missing fragment using Galois field arithmetic, and writes it to a new node selected by the placement algorithm (respecting rack/AZ diversity constraints). With 500 TB spread across millions of groups and a repair throughput of 200 MB/s per group (limited by disk I/O and network), the total repair takes about 40-60 minutes because hundreds of groups are repaired in parallel across many nodes. During repair, the system operates in a degraded state where those groups have reduced fault tolerance (e.g., 8+3 instead of 8+4), so repair speed is critical. The system prioritizes groups with the fewest surviving fragments. If a second node fails during repair, only groups that had fragments on both failed nodes are at risk, which is a small fraction of the total since fragments are distributed across hundreds of nodes.",
      followUps: [
        "How do you prevent repair I/O from impacting client-facing read/write performance?",
        "What happens if the placement algorithm cannot find a node that satisfies rack diversity?",
        "How do you handle a correlated failure that takes out an entire rack?",
      ],
    },
    {
      q: "How would you implement versioning and lifecycle policies without impacting read/write performance?",
      a: "Versioning is implemented entirely in the metadata layer by making version ID a component of the primary key. Instead of a simple (bucket, key) lookup, the metadata B-tree stores entries as (bucket, key, version_id), with the most recent version also indexed separately for fast unversioned lookups. A PUT creates a new version entry and atomically updates the latest-version pointer. A DELETE inserts a delete-marker entry (zero-byte object with is_delete_marker=true) as the new latest version, so the object appears deleted but all previous versions remain accessible. This design means versioning adds no overhead to reads of the latest version (single index lookup) and minimal overhead to writes (one additional index update). Lifecycle policies are processed asynchronously by background workers to avoid impacting the request path. Workers scan a secondary index on (bucket, creation_timestamp) to identify objects matching transition or expiration rules, then enqueue actions to a task queue. Transitions (e.g., Standard to IA) update the metadata to change the storage class and may trigger background data movement (e.g., re-encoding with a more aggressive erasure coding ratio). Expirations create delete markers or permanently delete non-current versions. The garbage collector runs separately, scanning for chunks with zero references and reclaiming their disk space in batch, which is I/O-efficient because it can sort deletes by disk location to minimize seek time.",
      followUps: [
        "How do you handle the S3-style MFA Delete feature for compliance?",
        "What is the storage overhead of keeping all versions indefinitely?",
        "How do you optimize lifecycle scans for buckets with billions of objects?",
      ],
    },
  ],
  mcqs: [
    {
      q: "An object storage system uses Reed-Solomon erasure coding with parameters (8, 4). What is the maximum number of simultaneous fragment losses the system can tolerate?",
      options: ["2", "4", "8", "12"],
      answerIndex: 1,
      explanation:
        "In a Reed-Solomon (k, m) scheme, k is the number of data fragments and m is the number of parity fragments. The system can tolerate up to m simultaneous failures. With (8, 4), there are 4 parity fragments, so the system can lose any 4 of the 12 total fragments and still reconstruct the original data from the remaining 8.",
    },
    {
      q: "Why is the metadata commit the linearization point for achieving strong read-after-write consistency in object storage?",
      options: [
        "Because metadata is always stored on faster SSDs than the data",
        "Because the PUT returns success only after Raft commits the metadata, and all reads go through the same Raft-linearized metadata service",
        "Because metadata is smaller and faster to replicate than data",
        "Because the client caches metadata locally after a successful PUT",
      ],
      answerIndex: 1,
      explanation:
        "Strong read-after-write consistency requires that any read after a successful write sees the written data. By making the metadata commit via Raft consensus the point at which a PUT returns success, and ensuring all GET operations query the same Raft-linearized metadata service, there is a happens-before relationship: the client knows the write is committed before it can issue a read, and the metadata service always returns the latest committed version.",
    },
    {
      q: "In a multi-part upload, what happens if the client never calls the Complete operation?",
      options: [
        "The parts are automatically assembled into the final object after a timeout",
        "The parts remain stored but the object is not visible; a lifecycle rule or background sweeper must garbage-collect them",
        "The parts are immediately deleted when the upload session times out",
        "The metadata service blocks all new uploads to the same key until the incomplete upload is resolved",
      ],
      answerIndex: 1,
      explanation:
        "Incomplete multi-part uploads leave orphaned parts that consume storage but never become a visible object. The system does not automatically complete or delete them because the client might resume. Instead, a lifecycle policy (e.g., AbortIncompleteMultipartUpload after 7 days) or a background garbage collection process cleans them up, which is why configuring this lifecycle rule is a best practice to avoid unbounded storage waste.",
    },
    {
      q: "What is the primary advantage of content-addressable storage (CAS) using cryptographic hashes in an object storage system?",
      options: [
        "It eliminates the need for access control lists",
        "It enables deduplication across objects: identical data chunks are stored once regardless of how many objects reference them",
        "It makes all reads O(1) by using the hash as a direct disk offset",
        "It provides encryption at rest without additional key management",
      ],
      answerIndex: 1,
      explanation:
        "Content-addressable storage derives the storage address from the content itself (e.g., SHA-256 hash of the data). When two objects contain identical data chunks, they hash to the same value, so the system can store one copy and maintain reference counts. This deduplication can save significant storage for workloads with redundant data (e.g., VM images, backups). The hash also serves as an integrity check: any bit corruption will produce a different hash during verification scrubbing.",
    },
  ],
  flashcards: [
    {
      front: "What does 11 nines durability (99.999999999%) mean in practical terms?",
      back: "At 1 trillion objects, you expect to lose fewer than 0.01 objects per year. This is achieved through erasure coding or replication across independent failure domains (different racks, power circuits, AZs), combined with background scrubbing to detect and repair silent data corruption (bit rot) before it becomes irrecoverable.",
    },
    {
      front: "What is the difference between erasure coding parameters (8,4) and (12,4)?",
      back: "(8,4) splits data into 8 data + 4 parity = 12 fragments, uses 1.5x storage, tolerates 4 failures. (12,4) splits into 12 data + 4 parity = 16 fragments, uses 1.33x storage (cheaper), tolerates 4 failures, but requires contacting 12 nodes for reads (higher latency). More data fragments = better storage efficiency but higher read fan-out.",
    },
    {
      front: "What are the three phases of a multi-part upload?",
      back: "1) Initiate: POST returns an upload ID. 2) Upload Parts: each part is a separate PUT with the upload ID and part number, uploadable in any order and in parallel, minimum 5 MB per part (except last). 3) Complete: POST with manifest of all part ETags triggers atomic assembly and metadata commit. Abort is also possible to clean up parts.",
    },
    {
      front: "How does versioning work at the metadata layer?",
      back: "Each PUT creates a new metadata record keyed by (bucket, key, version_id) and updates the latest-version pointer atomically. DELETE inserts a zero-byte delete marker as the latest version (object appears deleted to unversioned GETs). All previous versions remain accessible by specifying version ID. This makes versioning an append-only operation on metadata.",
    },
    {
      front: "What is the CRUSH algorithm and why is it used in object storage?",
      back: "CRUSH (Controlled Replication Under Scalable Hashing) is a deterministic placement algorithm used by Ceph. Given an object ID and cluster map, any node can compute the placement without consulting a central coordinator. It respects failure domain constraints (e.g., no two fragments on the same rack) and handles cluster topology changes with minimal data migration.",
    },
    {
      front: "Why does the metadata service use SSDs while the data layer uses HDDs?",
      back: "The metadata service needs low-latency random reads/writes for point lookups and range scans (B-tree operations). SSDs provide ~100 microsecond random access vs ~10 ms for HDDs. The data layer primarily does large sequential reads/writes (64-128 MB chunks), where HDDs provide adequate throughput (150-200 MB/s) at 1/10th the cost per GB, making them cost-effective at exabyte scale.",
    },
    {
      front: "What is background scrubbing in object storage?",
      back: "Scrubbing is a continuous background process that reads every stored fragment, recomputes its checksum (SHA-256 or CRC32c), and compares it to the stored checksum. If a mismatch is detected (bit rot from cosmic rays, media degradation), the corrupted fragment is reconstructed from surviving erasure-coded peers and rewritten. A full scrub cycle typically runs every 30-90 days across the entire corpus.",
    },
    {
      front: "How does object storage handle the thundering herd problem on a popular object?",
      back: "When a hot object gets thousands of concurrent requests, mitigations include: 1) Edge caching via CDN to serve repeated GETs without hitting the storage backend. 2) Request coalescing at the gateway: concurrent GETs for the same object share a single backend fetch. 3) Local read caches on gateway nodes with short TTLs. 4) Multiple replicas of hot objects across more storage nodes to spread read load.",
    },
  ],
  exercises: [
    "Design the data placement algorithm for an object storage system: given N storage nodes across 3 AZs and R racks per AZ, write pseudocode that selects 12 nodes for an (8,4) erasure-coded group such that no two fragments share a rack, at least one fragment is in each AZ, and the algorithm is deterministic (any node can compute the placement from the object key and cluster map alone).",
    "Calculate the storage cost and durability trade-off: you have 10 PB of data. Compare the total raw storage required and annual durability (in nines) for triple replication, RS(8,4), and RS(12,4), assuming 2% annual disk failure rate, 4-hour MTTR, and fragments distributed across independent failure domains. Show your probability calculations.",
    "Implement a multi-part upload state machine: design the metadata schema and state transitions for tracking multi-part uploads, including states for initiated, parts-received, completing, completed, aborting, and aborted. Handle edge cases: duplicate part numbers (overwrite), completing with missing parts (error), concurrent complete and abort, and garbage collection of abandoned uploads.",
    "Design a garbage collection system for versioned object storage: objects may have multiple versions, delete markers, and lifecycle rules. Define the data structures, the scanning strategy (how the GC identifies reclaimable storage), the two-phase delete protocol (metadata first, then data), and how you prevent race conditions between GC and concurrent reads/writes to the same object.",
    "Benchmark and optimize LIST performance: a bucket contains 50 billion objects. Design the metadata index structure, partitioning scheme, and query execution plan that allows listing objects with a prefix and delimiter in under 100ms for the first page (1000 results). Address how you handle continuation tokens, consistent snapshots during concurrent writes, and the common prefix aggregation required for directory-style listing.",
  ],
  revisionNotes: [
    "Object storage uses a flat namespace (bucket + key) not a hierarchical filesystem; directory-like behavior is simulated using prefixes and delimiters in the LIST API.",
    "The architecture has three planes: API gateway (auth, routing, rate limiting), metadata service (key-to-location mapping, Raft-replicated, SSD-backed B-trees), and data storage (erasure-coded chunks on commodity HDDs across AZs).",
    "Erasure coding RS(8,4) stores 12 fragments for every 8 data units: 1.5x storage overhead, tolerates 4 simultaneous failures, vs triple replication at 3x storage tolerating only 2 failures.",
    "11 nines durability (99.999999999%) means losing fewer than 0.01 objects per trillion per year; achieved by spreading fragments across independent failure domains and continuous background scrubbing.",
    "Multi-part upload has three phases: Initiate (get upload ID), Upload Parts (parallel, any order, min 5 MB), Complete (atomic manifest commit). Abandoned uploads must be garbage-collected.",
    "Strong read-after-write consistency uses the metadata Raft commit as the linearization point: PUT returns only after metadata is committed to a Raft majority, and all GETs read from the Raft-linearized metadata.",
    "Versioning is metadata-only: each PUT appends a new version, DELETE inserts a delete marker, all versions remain accessible by version ID. No data is duplicated for versioning.",
    "Lifecycle policies are background processes: workers scan metadata indexes by creation timestamp, apply transition rules (Standard to IA to Archive) and expiration rules, enqueuing actions to a task queue.",
    "Garbage collection is two-phase: first update metadata (fast, in the client path), then asynchronously reclaim data chunks when reference counts reach zero (batch-optimized for disk I/O).",
    "Content-addressable storage using SHA-256 hashes enables deduplication (identical chunks stored once with reference counting) and integrity verification (hash comparison during scrubbing).",
  ],
  cheatSheet: [
    "Object key lookup: Client -> Gateway -> Metadata Service (B-tree point query, ~1ms on SSD) -> return chunk locations -> Gateway reads chunks from Data Storage in parallel.",
    "PUT write path: Gateway -> chunk data into 64 MB blocks -> erasure encode each block (8+4) -> write 12 fragments to 12 nodes across 3 AZs -> commit metadata via Raft -> return 200.",
    "Durability formula: P(data loss) = P(more than m failures in a group of n=k+m within MTTR window). For RS(8,4) with 2% AFR and 4h MTTR: ~10^-18 per group per year.",
    "Storage overhead: Replication factor R = Rx raw. Erasure coding (k,m) = (k+m)/k raw. RS(8,4) = 12/8 = 1.5x. RS(12,4) = 16/12 = 1.33x. RS(17,3) = 20/17 = 1.18x.",
    "Metadata size budget: ~1 KB per object. 100 billion objects = 100 TB metadata. Use SSDs (not HDDs) for metadata. Partition by bucket, sub-partition large buckets by key range.",
    "Multi-part upload limits: min part size 5 MB (except last), max part size 5 GB, max 10,000 parts, max object size 5 TB (10,000 x 5 GB = 50 TB theoretical, 5 TB practical limit).",
    "Consistency: metadata Raft commit = linearization point. Raft quorum write (majority of 3 or 5 nodes) before PUT returns. Reads from Raft leader with lease or read-index.",
    "Versioning overhead: one additional metadata record per version (~1 KB). Data chunks shared via content-addressable deduplication when versions share unchanged parts.",
    "Background processes: scrubbing (30-90 day cycle, verify all checksums), garbage collection (reclaim unreferenced chunks), lifecycle workers (scan and apply transition/expiration rules), repair (reconstruct missing fragments after node failure).",
    "Capacity planning: storage node with 36 x 20 TB HDDs = 720 TB raw. With RS(8,4) at 1.5x overhead, usable = 480 TB. 1 EB raw = ~1,400 storage nodes. Add 20% headroom for repair and fragmentation.",
  ],
  glossary: [
    {
      term: "Erasure Coding",
      definition:
        "A data protection method that splits data into k data fragments and m parity fragments using mathematical operations (typically Reed-Solomon over Galois fields). Any k of the (k+m) total fragments are sufficient to reconstruct the original data. Provides higher storage efficiency than replication while tolerating more failures.",
    },
    {
      term: "Content-Addressable Storage (CAS)",
      definition:
        "A storage mechanism where data is addressed by a cryptographic hash of its content (e.g., SHA-256) rather than by a location or name. Enables deduplication (identical data stored once) and integrity verification (hash mismatch indicates corruption).",
    },
    {
      term: "Multi-Part Upload",
      definition:
        "A protocol for uploading large objects in independently addressable parts. Each part is uploaded, checksummed, and stored separately. A final completion step assembles the parts into a single object atomically. Enables parallel uploads, resumability, and handling of objects up to 5 TB.",
    },
    {
      term: "Delete Marker",
      definition:
        "A zero-byte metadata entry in a versioned bucket that acts as a logical delete. It becomes the latest version of the object, causing unversioned GET requests to return 404, while all previous versions remain accessible by specifying their version ID.",
    },
    {
      term: "Background Scrubbing",
      definition:
        "A continuous background process that reads every stored data fragment, recomputes its checksum, and compares it to the recorded value. Detects and repairs silent data corruption (bit rot) before it accumulates to the point of data loss. Typically cycles through all data every 30-90 days.",
    },
    {
      term: "Placement Algorithm (CRUSH)",
      definition:
        "A deterministic, decentralized algorithm that maps an object to a set of storage nodes based on the object's identifier and the cluster topology. Any node can independently compute the same placement without consulting a central coordinator. Respects failure domain constraints (e.g., rack and AZ diversity).",
    },
    {
      term: "Linearization Point",
      definition:
        "The specific event in a distributed operation that determines the operation's position in the global order. In object storage, the Raft metadata commit serves as the linearization point: the operation is considered to have happened at the moment the metadata is committed to a majority of Raft replicas.",
    },
  ],
  followUps: [
    "How would you design cross-region replication for disaster recovery, and what RPO/RTO guarantees can you provide?",
    "How does S3 Select or data lake integration (querying objects without downloading them) change the storage layer design?",
    "What are the security considerations: encryption at rest (SSE-S3 vs SSE-KMS vs SSE-C), encryption in transit, bucket policies, and access logging?",
    "How would you design a storage class transition system that physically moves data between different erasure coding schemes without affecting availability?",
    "How does the system handle extremely large buckets (10 billion+ objects) for LIST performance and metadata partitioning?",
    "What is the design for event notifications (e.g., S3 Event Notifications to Lambda/SQS/SNS) and how do you guarantee at-least-once delivery without impacting write latency?",
  ],
  resources: [
    {
      label: "Amazon S3 Strong Consistency Deep Dive",
      kind: "article",
      note: "Official AWS blog post explaining how S3 achieved strong read-after-write consistency without performance trade-offs, covering the metadata caching and witness protocol.",
    },
    {
      label: "CRUSH: Controlled Scalable Decentralized Placement of Replicated Data (Weil et al.)",
      kind: "paper",
      note: "The foundational paper on the CRUSH algorithm used in Ceph, describing the deterministic placement algorithm that respects failure domains without a central lookup table.",
    },
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters 5-9 cover replication, partitioning, consistency models, and distributed system trade-offs directly applicable to object storage design.",
    },
    {
      label: "Facebook f4: Warm BLOB Storage System (Muralidhar et al.)",
      kind: "article",
      note: "Describes Facebook's transition from triple replication to erasure coding for warm data, achieving 2.1x storage reduction while maintaining durability, with detailed cost analysis.",
    },
    {
      label: "System Design Interview: Object Storage (S3) - by Alex Xu",
      kind: "video",
      note: "Walkthrough of S3 system design covering the metadata service, data storage layer, multi-part upload, and consistency model with interview-focused trade-off analysis.",
    },
  ],
};
