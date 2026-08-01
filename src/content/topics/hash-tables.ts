import type { TopicContent } from "../types";

export const hashTables: TopicContent = {
  quickSummary: [
    "A hash table maps keys to values using a hash function that converts each key into an array index, enabling average-case O(1) lookups, insertions, and deletions.",
    "Collisions occur when two distinct keys hash to the same index; the two major families of resolution are chaining (linked lists at each slot) and open addressing (probing for the next free slot).",
    "Performance degrades as the load factor (n/m, items over slots) grows; most implementations resize (typically doubling) when the load factor crosses a threshold such as 0.75.",
    "Hash tables underpin ubiquitous abstractions: Python's dict, Java's HashMap, JavaScript objects/Maps, database index structures, caches, and distributed systems like consistent-hashing rings.",
  ],
  detailed: [
    "A hash table (also called a hash map) is an associative data structure that stores key-value pairs. Internally it maintains an array of 'buckets.' When you insert or look up a key, a hash function computes an integer from the key, and a modular reduction (index = hash(key) % capacity) maps that integer to a bucket index. Because the hash function spreads keys roughly uniformly, most operations touch only one bucket, yielding O(1) amortized time.",
    "The quality of the hash function is critical. A good hash function is deterministic, distributes keys uniformly across the index space, and is fast to compute. Cryptographic hashes (SHA-256) provide strong uniformity but are slow; non-cryptographic hashes like MurmurHash3, xxHash, and wyhash trade a small increase in collision probability for dramatically higher throughput. For integer keys, multiplicative hashing (key * large_prime >> shift) is common. For strings, polynomial rolling hashes or FNV-1a are popular choices.",
    "When two keys collide at the same bucket, the table must resolve the conflict. Separate chaining stores a linked list (or a balanced tree for long chains, as Java 8's HashMap does) at each bucket. Open addressing instead probes for another empty slot inside the same array -- linear probing checks the next slot sequentially, quadratic probing uses a quadratic offset, and double hashing applies a second hash function for the step size. Each strategy has trade-offs in cache performance, clustering behavior, and deletion complexity.",
    "The load factor alpha = n / m (number of stored entries divided by number of buckets) governs performance. For chaining, the expected chain length is alpha, so operations remain O(1) on average regardless of alpha, but memory overhead grows. For open addressing, the expected number of probes grows as 1/(1-alpha), diverging as alpha approaches 1. Most implementations keep alpha below 0.75 and trigger a resize -- allocating a new, larger array and reinserting every element -- when the threshold is crossed. Resizing is O(n) but amortized over n insertions it adds only O(1) per operation.",
    "Beyond the basics, specialized variants exist. Robin Hood hashing reduces probe-length variance by 'stealing' slots from keys that are closer to their home position, giving more uniform lookup times. Cuckoo hashing uses two (or more) hash functions and guarantees worst-case O(1) lookups by displacing existing entries on insert. Hopscotch hashing restricts probing to a small neighborhood for cache efficiency. Swiss Table (used by abseil and Rust's hashbrown) uses SIMD instructions to probe 16 slots in parallel, achieving extremely high throughput on modern CPUs.",
  ],
  deepDive: [
    "Hash functions are the foundation. A universal hash function family H satisfies P(h(x) == h(y)) <= 1/m for any x != y when h is chosen uniformly from H. This bounds the expected collision rate regardless of the input distribution. In practice, multiply-shift hashing h(k) = ((a*k + b) >> (w - log2(m))) with random odd a and arbitrary b is 2-universal over w-bit integers. For variable-length keys such as strings, polynomial hashing h(s) = sum(s[i] * p^i) mod m with a random base p from a prime field is a common universal construction. Tabulation hashing -- XOR-ing independent lookups from random tables indexed by each byte of the key -- is 3-independent and extremely fast, making it suitable for linear probing where 5-independence is sufficient for O(1) expected time.",
    "Collision resolution deeply affects real-world performance. Separate chaining is simple and tolerant of high load factors but every lookup chases a pointer, causing cache misses. Open addressing with linear probing enjoys excellent cache locality because probes touch consecutive memory, but it suffers from primary clustering: a run of occupied slots grows like a snowball because any key hashing into the run extends it. Quadratic probing breaks primary clustering but introduces secondary clustering (keys with the same home slot follow the same probe sequence). Double hashing eliminates both forms of clustering but loses cache locality since probes jump to unrelated locations. Robin Hood hashing is a variant of linear probing that keeps the variance of probe distances low: when inserting, if the new key's probe distance exceeds that of the current occupant, they swap, pushing 'rich' (close-to-home) elements further away. This variance reduction means the worst-case lookup is dramatically shorter in practice, often within O(log log n) of the average.",
    "Resizing (rehashing) is the amortized cost that keeps hash tables efficient. When the load factor crosses the threshold, a new array of 2x (or sometimes 1.5x) the size is allocated and every entry is reinserted using hash mod new_capacity. This O(n) operation is amortized to O(1) per insert via the standard doubling argument. However, the latency spike of a single resize can be problematic in real-time systems. Incremental rehashing, used by Redis, solves this: it maintains two tables simultaneously and gradually migrates entries from the old table to the new one, spreading the O(n) cost across subsequent operations. Each lookup or insert migrates a constant number of entries, and once the old table is fully drained it is freed.",
    "Consistent hashing is a technique designed for distributed systems where the set of nodes (servers) changes dynamically. Keys and nodes are both mapped onto a ring (0 to 2^k - 1). Each key is assigned to the first node encountered clockwise from its hash position. When a node is added or removed, only K/n keys (where K is total keys and n is the number of nodes) need to be remapped on average, compared to nearly all keys in a naive hash-mod-n scheme. To address load imbalance (since node positions on the ring are random), each physical node is replicated as multiple 'virtual nodes' spread around the ring. Systems like Amazon DynamoDB, Apache Cassandra, and Akamai CDN rely on consistent hashing for partition assignment and request routing.",
    "Performance tuning in production involves choosing the right load factor threshold, hash function, and collision strategy for the workload. For small key sets (< 1000), even a simple array scan may beat a hash table due to lower overhead and better cache behavior. For read-heavy workloads with known key sets, perfect hashing (a hash function with zero collisions for a specific set of keys, constructible in O(n) time and space) eliminates probing entirely. Minimal perfect hashing further guarantees the table has exactly n slots for n keys. Tools like gperf and CMPH generate perfect hash functions. For concurrent access, lock-free hash tables (such as Cliff Click's NonBlockingHashMap) use compare-and-swap operations and help-based cooperative insertion to achieve high throughput without locks, at the cost of significant implementation complexity.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Basic hash table with separate chaining",
      source: `#include <functional>
#include <iostream>
#include <list>
#include <string>
#include <utility>
#include <vector>

template <typename K, typename V>
class HashTable {
    // Hash table using separate chaining for collision resolution.
    using Bucket = std::list<std::pair<K, V>>;

    std::vector<Bucket> buckets_;
    size_t size_ = 0;
    double threshold_ = 0.75;
    std::hash<K> hasher_;

    size_t index(const K& key) const {
        return hasher_(key) % buckets_.size();
    }

    void resize() {
        auto old = std::move(buckets_);
        buckets_.assign(old.size() * 2, Bucket{});
        size_ = 0;
        for (auto& bucket : old)
            for (auto& [k, v] : bucket)
                put(k, v);
    }

public:
    explicit HashTable(size_t capacity = 16)
        : buckets_(capacity) {}

    void put(const K& key, const V& value) {
        size_t idx = index(key);
        for (auto& [k, v] : buckets_[idx]) {
            if (k == key) { v = value; return; } // Update existing
        }
        buckets_[idx].emplace_back(key, value);
        ++size_;
        if (load_factor() > threshold_) resize();
    }

    const V* get(const K& key) const {
        size_t idx = index(key);
        for (auto& [k, v] : buckets_[idx])
            if (k == key) return &v;
        return nullptr;
    }

    bool remove(const K& key) {
        size_t idx = index(key);
        auto& bucket = buckets_[idx];
        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (it->first == key) {
                bucket.erase(it);
                --size_;
                return true;
            }
        }
        return false;
    }

    double load_factor() const {
        return static_cast<double>(size_) / buckets_.size();
    }

    size_t size() const { return size_; }
};

// Usage
// HashTable<std::string, int> ht;
// ht.put("alice", 42);
// if (auto* val = ht.get("alice")) std::cout << *val;
// ht.remove("alice");`,
    },
    {
      language: "cpp",
      caption: "Open addressing with linear probing and Robin Hood optimization",
      source: `#include <functional>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

template <typename K, typename V>
class RobinHoodHashTable {
    // Open-addressing hash table with Robin Hood hashing.
    // On insert, if the new key has traveled farther from its home slot
    // than the current occupant, they swap -- reducing probe-length variance.

    enum class State { EMPTY, OCCUPIED, DELETED };

    struct Slot {
        K key{};
        V value{};
        State state = State::EMPTY;
    };

    std::vector<Slot> slots_;
    size_t size_ = 0;
    std::hash<K> hasher_;

    size_t hash_index(const K& key) const { return hasher_(key) % slots_.size(); }

    size_t probe_distance(size_t home, size_t current) const {
        return (current + slots_.size() - home) % slots_.size();
    }

    void resize() {
        auto old = std::move(slots_);
        slots_.assign(old.size() * 2, Slot{});
        size_ = 0;
        for (auto& s : old)
            if (s.state == State::OCCUPIED)
                put(s.key, s.value);
    }

public:
    explicit RobinHoodHashTable(size_t capacity = 16)
        : slots_(capacity) {}

    void put(K key, V value) {
        if (static_cast<double>(size_) / slots_.size() > 0.7)
            resize();

        size_t idx = hash_index(key);
        size_t dist = 0;
        while (true) {
            if (slots_[idx].state != State::OCCUPIED) {
                slots_[idx] = {key, value, State::OCCUPIED};
                ++size_;
                return;
            }
            if (slots_[idx].key == key) {
                slots_[idx].value = value; // Update
                return;
            }
            // Robin Hood: steal from the rich (low probe distance)
            size_t existing_dist = probe_distance(
                hash_index(slots_[idx].key), idx);
            if (dist > existing_dist) {
                std::swap(key, slots_[idx].key);
                std::swap(value, slots_[idx].value);
                dist = existing_dist;
            }
            idx = (idx + 1) % slots_.size();
            ++dist;
        }
    }

    std::optional<V> get(const K& key) const {
        size_t idx = hash_index(key);
        size_t dist = 0;
        while (true) {
            if (slots_[idx].state == State::EMPTY)
                return std::nullopt;
            if (slots_[idx].state == State::OCCUPIED && slots_[idx].key == key)
                return slots_[idx].value;
            size_t existing_dist = probe_distance(
                hash_index(slots_[idx].key), idx);
            if (dist > existing_dist)
                return std::nullopt; // Key would have been placed here
            idx = (idx + 1) % slots_.size();
            ++dist;
        }
    }

    size_t size() const { return size_; }
};

// Usage:
// RobinHoodHashTable<std::string, int> ht;
// ht.put("alice", 42);
// auto val = ht.get("alice"); // std::optional<int>{42}`,
    },
    {
      language: "cpp",
      caption: "Consistent hashing ring with virtual nodes",
      source: `#include <functional>
#include <iostream>
#include <map>
#include <string>
#include <unordered_set>

class ConsistentHashRing {
    // Consistent hashing ring for distributing keys across nodes.
    // Each physical node is mapped to multiple virtual nodes (replicas)
    // spread around the ring to improve load balance.

    int replicas_;
    std::map<size_t, std::string> ring_;      // sorted hash -> node_id
    std::unordered_set<std::string> nodes_;
    std::hash<std::string> hasher_;

    size_t hash_key(const std::string& key) const {
        // Combine multiple rounds for better distribution
        size_t h = hasher_(key);
        h ^= (h >> 16);
        return h;
    }

public:
    explicit ConsistentHashRing(int replicas = 150)
        : replicas_(replicas) {}

    void add_node(const std::string& node_id) {
        nodes_.insert(node_id);
        for (int i = 0; i < replicas_; ++i) {
            std::string virtual_key = node_id + ":vn" + std::to_string(i);
            size_t h = hash_key(virtual_key);
            ring_[h] = node_id;
        }
    }

    void remove_node(const std::string& node_id) {
        nodes_.erase(node_id);
        for (int i = 0; i < replicas_; ++i) {
            std::string virtual_key = node_id + ":vn" + std::to_string(i);
            size_t h = hash_key(virtual_key);
            ring_.erase(h);
        }
    }

    // Find the node responsible for a key (clockwise walk).
    std::string get_node(const std::string& key) const {
        if (ring_.empty()) return "";
        size_t h = hash_key(key);
        // lower_bound gives the first position >= h
        auto it = ring_.lower_bound(h);
        if (it == ring_.end())
            it = ring_.begin(); // wrap around
        return it->second;
    }
};

// Usage:
// ConsistentHashRing ring(150);
// ring.add_node("cache-server-1");
// ring.add_node("cache-server-2");
// ring.add_node("cache-server-3");
// std::cout << ring.get_node("user:42")     << "\\n";
// std::cout << ring.get_node("session:abc") << "\\n";
// ring.remove_node("cache-server-2"); // Only ~1/3 keys remap`,
    },
  ],
  diagrams: [
    {
      title: "Hash Table Internals",
      kind: "architecture",
      caption: "Internal structure of a hash table with buckets and collision chaining.",
      mermaid: `graph TD
    Key[Input Key] --> HF[Hash Function]
    HF --> IDX[Array Index 0 to N-1]
    IDX --> B0[Bucket 0 empty]
    IDX --> B1[Bucket 1]
    IDX --> B2[Bucket 2]
    B1 --> E1[Entry: key1 value1]
    E1 --> E2[Entry: key2 value2 chained]
    B2 --> E3[Entry: key3 value3]`,
    },
    {
      title: "Collision Resolution Strategies",
      kind: "flow",
      caption: "Decision flow for handling key collisions in a hash table.",
      mermaid: `flowchart TD
    A[Insert key-value pair] --> B[Compute hash index]
    B --> C{Slot empty?}
    C -- Yes --> D[Insert directly]
    C -- No --> E{Collision strategy?}
    E -- Chaining --> F[Append to linked list at slot]
    E -- Open Addressing --> G{Probing type?}
    G -- Linear --> H[Check index plus 1 plus 2 etc]
    G -- Quadratic --> I[Check index plus 1 plus 4 plus 9 etc]
    G -- Double Hash --> J[Apply second hash function]`,
    },
    {
      title: "Hash Table Resize Process",
      kind: "sequence",
      caption: "How a hash table rehashes entries when load factor exceeds threshold.",
      mermaid: `sequenceDiagram
    participant App
    participant HT as Hash Table
    App->>HT: Insert new key-value
    HT->>HT: Check load factor
    alt Load factor exceeds threshold
        HT->>HT: Allocate new array 2x size
        HT->>HT: Rehash all existing entries
        HT->>HT: Insert into new positions
        HT->>HT: Replace old array
    end
    HT-->>App: Insert complete`,
    },
    {
      title: "Hash Function Properties",
      kind: "mindmap",
      caption: "Properties of a good hash function for use in hash tables.",
      mermaid: `mindmap
  root((Hash Function))
    Deterministic
      Same key same hash always
    Uniform Distribution
      Minimize collisions
      Spread keys evenly
    Fast Computation
      O of 1 time
    Avalanche Effect
      Small input change
      Large hash change
    Common Algorithms
      FNV-1a
      MurmurHash
      xxHash`,
    },
  ],
  animations: [
    {
      title: "Inserting into a hash table with separate chaining",
      steps: [
        { label: "Compute hash", detail: "Apply the hash function to the key: h = hash(key) % capacity. For key 'alice' with capacity 8, suppose h = 3." },
        { label: "Navigate to bucket", detail: "Go to index 3 in the backing array. The bucket currently contains one entry: ('dave', 42)." },
        { label: "Check for duplicate", detail: "Walk the chain at bucket 3. Compare 'alice' with 'dave' -- no match. Reached end of chain." },
        { label: "Append entry", detail: "Append ('alice', 7) to the chain at bucket 3. The bucket now holds [('dave', 42), ('alice', 7)]." },
        { label: "Update size and check load factor", detail: "Increment size. If size/capacity > 0.75, trigger a resize; otherwise, done." },
      ],
    },
    {
      title: "Linear probing collision resolution",
      steps: [
        { label: "Hash the key", detail: "Compute index = hash('bob') % 8 = 5." },
        { label: "Slot occupied", detail: "Slot 5 is already taken by 'eve'. Cannot place 'bob' here." },
        { label: "Probe forward", detail: "Move to slot 6 (index + 1). Slot 6 is also occupied by 'frank'." },
        { label: "Probe again", detail: "Move to slot 7 (index + 2). Slot 7 is empty." },
        { label: "Place the entry", detail: "Store ('bob', value) at slot 7. The probe distance for this entry is 2." },
        { label: "Lookup follows the same path", detail: "To find 'bob', start at slot 5, probe through 6 and 7 until the key is found or an empty slot proves it is absent." },
      ],
    },
    {
      title: "Consistent hashing: adding a node",
      steps: [
        { label: "Initial ring", detail: "Three nodes A, B, C are placed on the hash ring. Keys are assigned to the next clockwise node." },
        { label: "New node D arrives", detail: "Node D is hashed and placed on the ring between B and C." },
        { label: "Keys reassigned", detail: "Only keys in the arc between B and D (previously owned by C) are reassigned to D. All other keys stay put." },
        { label: "Minimal disruption", detail: "On average, only K/n keys move (K = total keys, n = new node count), compared to ~K keys in hash-mod-n." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Separate Chaining", "Open Addressing (Linear Probing)", "Cuckoo Hashing", "Robin Hood Hashing"],
    rows: [
      ["Worst-case lookup", "O(n) -- all keys in one chain", "O(n) -- long cluster", "O(1) guaranteed", "O(log n) expected, tight variance"],
      ["Average lookup", "O(1 + alpha)", "O(1 / (1 - alpha))", "O(1)", "O(1 / (1 - alpha)) with low variance"],
      ["Cache friendliness", "Poor -- pointer chasing", "Excellent -- sequential memory", "Moderate -- two random lookups", "Excellent -- sequential like linear probing"],
      ["Deletion", "Simple -- unlink node", "Complex -- requires tombstones or back-shifting", "Simple -- clear slot", "Moderate -- back-shift needed"],
      ["Load factor tolerance", "Works well even above 1.0", "Degrades sharply above 0.7", "Must stay below 0.5 per table", "Good up to 0.9 with managed variance"],
      ["Space overhead", "Pointers per node (8 bytes each)", "None beyond array slots", "Two full arrays required", "None beyond array slots"],
      ["Insertion worst case", "O(1) amortized (append to chain)", "O(n) in degenerate cluster", "O(n) -- may trigger full rehash cycle", "O(n) in degenerate case, amortized O(1)"],
      ["Implementation complexity", "Simple", "Moderate", "High -- eviction chains, cycle detection", "Moderate -- swap logic on insert"],
    ],
  },
  interviewQA: [
    {
      q: "How does a hash table achieve O(1) average-case lookup?",
      a: "A hash function maps the key to an integer, which is reduced modulo the table capacity to get a bucket index. If the hash function distributes keys uniformly and the load factor is bounded, each bucket holds O(1) entries on average, so lookup requires only constant work: one hash computation plus a short chain traversal or a few probes.",
      followUps: [
        "What happens to this guarantee if the hash function is poor?",
        "Can you prove the O(1) average using a universal hash family?",
      ],
    },
    {
      q: "What is the difference between separate chaining and open addressing?",
      a: "Separate chaining stores colliding entries in a secondary data structure (typically a linked list) attached to each bucket; the array never runs out of slots. Open addressing stores all entries directly in the array and resolves collisions by probing for another empty slot (linear, quadratic, or double hashing). Open addressing has better cache performance because it avoids pointer chasing, but it is more sensitive to high load factors and complicates deletion (often requiring tombstone markers).",
      followUps: [
        "How does Java's HashMap transition from chaining with linked lists to red-black trees?",
        "Why do tombstones hurt open addressing performance over time?",
      ],
    },
    {
      q: "What happens when a hash table resizes? What is the cost?",
      a: "When the load factor exceeds a threshold (commonly 0.75), the table allocates a new backing array -- usually double the old capacity. Every existing entry must be rehashed against the new capacity and inserted into the new array, because changing the modulus changes each key's bucket index. This is O(n) work but happens after at least n/2 insertions since the last resize, so the amortized cost per insert remains O(1). The transient latency spike can be mitigated with incremental rehashing, as Redis does.",
      followUps: [
        "How does incremental rehashing work in Redis?",
        "Why is doubling preferred over, say, adding a fixed number of slots?",
      ],
    },
    {
      q: "Explain consistent hashing and when you would use it.",
      a: "Consistent hashing maps both keys and servers onto a ring (hash space 0 to 2^k - 1). Each key is assigned to the next server clockwise on the ring. When a server is added or removed, only the keys in the affected arc are remapped -- on average K/n keys instead of nearly all keys as in hash-mod-n. This is essential in distributed caches, load balancers, and partitioned databases (Cassandra, DynamoDB) where server membership changes and you want to minimize data movement. Virtual nodes (multiple ring positions per physical server) improve load balance.",
      followUps: [
        "What are virtual nodes and why are they necessary?",
        "How does consistent hashing relate to the CAP theorem?",
      ],
    },
    {
      q: "How would you design a hash map that supports concurrent reads and writes?",
      a: "The simplest approach is a global lock, but it serializes all operations. Striped locking (used by Java's ConcurrentHashMap pre-Java 8) partitions the array into segments, each with its own lock, allowing concurrent access to different segments. Java 8's ConcurrentHashMap uses a lock-free approach for reads (volatile reads of the bin head) and fine-grained synchronized blocks per bin for writes, combined with CAS (compare-and-swap) for initialization and resizing. Fully lock-free designs like Cliff Click's NonBlockingHashMap use CAS on every slot and cooperative helping during resize, achieving near-linear scalability but with substantial implementation complexity.",
      followUps: [
        "What is the role of memory barriers / volatile in a concurrent hash map?",
        "How does a lock-free resize work without stopping the world?",
        "What are the trade-offs of read-copy-update (RCU) for read-heavy hash maps?",
      ],
    },
    {
      q: "What makes a good hash function for a hash table?",
      a: "A good hash function for a hash table must be deterministic, distribute keys uniformly to minimize collisions, and be fast to compute. Unlike cryptographic hashes, table hash functions prioritize speed: MurmurHash3, xxHash, and wyhash compute in nanoseconds. The function should exhibit the avalanche property (a small input change flips roughly half the output bits). For security-sensitive contexts (e.g., web frameworks parsing user-supplied keys), the function should also be randomized (seeded) to prevent algorithmic-complexity attacks (HashDoS) where an adversary crafts keys that all collide.",
      followUps: [
        "What is a HashDoS attack and how do modern languages defend against it?",
        "What is the avalanche property and how do you test for it?",
      ],
    },
  ],
  followUps: [
    "How do bloom filters relate to hash tables, and when would you choose one over the other?",
    "What is perfect hashing and when is it practical?",
    "How do distributed hash tables (DHTs) like Chord and Kademlia work?",
    "What are the real-world performance differences between std::unordered_map, abseil::flat_hash_map, and Rust's HashMap?",
    "How does the Linux kernel's hash table implementation differ from user-space versions?",
  ],
  mcqs: [
    {
      q: "What is the average time complexity of a lookup in a well-designed hash table?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 0,
      explanation: "With a good hash function and bounded load factor, lookups touch a constant number of entries on average.",
    },
    {
      q: "Which collision resolution strategy suffers from primary clustering?",
      options: ["Separate chaining", "Linear probing", "Double hashing", "Cuckoo hashing"],
      answerIndex: 1,
      explanation: "Linear probing places colliding keys in consecutive slots, causing runs of occupied slots to merge and grow (primary clustering).",
    },
    {
      q: "In a hash table with open addressing, what is a tombstone?",
      options: [
        "A sentinel value marking the end of the array",
        "A marker left in a slot after deletion to keep probe chains intact",
        "The first element inserted into the table",
        "A special hash value reserved for null keys",
      ],
      answerIndex: 1,
      explanation: "Deleting an entry in open addressing cannot simply empty the slot, because that would break probe sequences for other keys. A tombstone marker indicates 'deleted but keep probing past me.'",
    },
    {
      q: "What load factor threshold does Java's HashMap use to trigger resizing?",
      options: ["0.5", "0.6", "0.75", "1.0"],
      answerIndex: 2,
      explanation: "Java's HashMap uses a default load factor of 0.75, balancing time and space overhead.",
    },
    {
      q: "In consistent hashing, when a new server is added to the ring, approximately how many keys need to be remapped?",
      options: ["All keys", "K / n (total keys divided by new node count)", "n keys (one per server)", "None"],
      answerIndex: 1,
      explanation: "Only the keys in the arc between the new node and its predecessor are remapped, which is K/n on average.",
    },
    {
      q: "Which of the following provides worst-case O(1) lookup time?",
      options: ["Separate chaining", "Linear probing", "Cuckoo hashing", "Quadratic probing"],
      answerIndex: 2,
      explanation: "Cuckoo hashing guarantees O(1) worst-case lookups because each key can be in exactly one of two (or more) possible positions.",
    },
    {
      q: "What is the primary advantage of Robin Hood hashing over standard linear probing?",
      options: [
        "It eliminates all collisions",
        "It reduces the variance of probe distances, making worst-case lookups shorter",
        "It uses less memory",
        "It avoids the need for resizing",
      ],
      answerIndex: 1,
      explanation: "Robin Hood hashing swaps entries so that no key is much farther from its home slot than any other, dramatically reducing probe-length variance.",
    },
  ],
  exercises: [
    "Implement a hash table from scratch using open addressing with linear probing. Support put, get, delete (with tombstones), and automatic resizing. Write tests demonstrating correctness after resize.",
    "Given a hash table with separate chaining, write a function that returns the length of the longest chain. Use it to empirically measure how chain lengths distribute for random vs adversarial inputs.",
    "Implement cuckoo hashing with two hash functions and two arrays. Handle the case where an insertion triggers a cycle (detect it and trigger a rehash with new hash functions).",
    "Build a consistent hashing ring that supports adding and removing nodes with virtual nodes. Write a simulation that inserts 100,000 random keys, adds and removes nodes, and measures how many keys are reassigned each time.",
    "Compare the cache performance of separate chaining vs linear probing experimentally: insert 1 million random integers into both, measure lookup time for 1 million random queries using Python's time.perf_counter, and explain the results.",
    "Implement a thread-safe hash map in Java or Go using striped locking (partition the array into 16 segments, each with its own lock). Benchmark it against a global-lock version under contention from 8 threads.",
  ],
  flashcards: [
    { front: "What is the average time complexity of hash table lookup?", back: "O(1) -- assuming a good hash function and bounded load factor." },
    { front: "What is the load factor of a hash table?", back: "alpha = n / m, the ratio of stored entries (n) to the number of buckets (m). It measures how full the table is." },
    { front: "Name the two main families of collision resolution.", back: "Separate chaining (store collisions in a linked list per bucket) and open addressing (probe for another empty slot in the same array)." },
    { front: "What is primary clustering in linear probing?", back: "Contiguous runs of occupied slots tend to merge and grow, because any key hashing into a run extends it. This increases average probe length." },
    { front: "Why does open addressing need tombstones for deletion?", back: "Emptying a slot would break probe chains for keys that were inserted past that slot. A tombstone says 'keep probing' during lookup but 'reusable' during insert." },
    { front: "What is the worst-case lookup time for cuckoo hashing?", back: "O(1) -- each key can be in exactly one of two (or k) positions, so lookup checks at most k slots." },
    { front: "How does Robin Hood hashing improve over standard linear probing?", back: "It reduces probe-distance variance by swapping a new key with an existing key whenever the new key has traveled farther from its home slot. This makes the worst-case lookup much shorter." },
    { front: "What is consistent hashing?", back: "A scheme that maps keys and nodes onto a ring so that adding or removing a node remaps only K/n keys on average, instead of nearly all keys as in hash-mod-n." },
    { front: "What triggers a hash table resize?", back: "The load factor exceeding a threshold (commonly 0.75). The table allocates a larger array and rehashes every entry, an O(n) operation amortized to O(1) per insert." },
    { front: "What is a universal hash function family?", back: "A family H of hash functions where for any distinct keys x, y, the probability P(h(x) = h(y)) <= 1/m when h is chosen uniformly from H. This bounds collision rates regardless of input distribution." },
  ],
  revisionNotes: [
    "Hash table = array of buckets + hash function that maps keys to indices.",
    "Average O(1) for get/put/delete; worst case O(n) without cuckoo hashing.",
    "Load factor alpha = n/m; resize (usually 2x) when alpha > 0.75.",
    "Chaining: linked list per bucket. Simple, tolerates alpha > 1, but poor cache behavior.",
    "Open addressing: all entries in the array. Great cache locality, but sensitive to alpha and deletion is tricky (tombstones).",
    "Linear probing: fast due to cache lines, but suffers primary clustering.",
    "Quadratic probing: breaks primary clustering, introduces secondary clustering.",
    "Double hashing: eliminates both clustering types, but loses cache locality.",
    "Robin Hood hashing: linear probing variant that reduces variance by swapping with 'richer' entries.",
    "Cuckoo hashing: O(1) worst-case lookup via two hash functions; insert may trigger eviction chain or rehash.",
    "Good hash function: deterministic, uniform distribution, fast, avalanche property. Use MurmurHash3 / xxHash / wyhash.",
    "HashDoS: adversary crafts keys that all collide; mitigated by randomized (seeded) hash functions (SipHash in Python 3.4+).",
    "Consistent hashing: keys and nodes on a ring; adding/removing a node remaps only K/n keys. Virtual nodes balance load.",
    "Amortized resize: O(n) cost spread over n inserts = O(1) amortized per insert.",
    "Incremental rehashing (Redis): migrate entries gradually across operations to avoid latency spikes.",
  ],
  cheatSheet: [
    "Lookup/insert/delete: O(1) average, O(n) worst case.",
    "Load factor: alpha = n / m. Keep below 0.75 for open addressing.",
    "Resize: double capacity, rehash all entries. Amortized O(1) per insert.",
    "Chaining: list per bucket. Simple. Alpha can exceed 1.",
    "Linear probing: sequential scan. Cache-friendly. Suffers primary clustering.",
    "Quadratic probing: index + 1, +4, +9, ... Breaks primary clustering.",
    "Double hashing: step = h2(key). No clustering. Poor cache locality.",
    "Robin Hood: steal from the rich. Low variance in probe distances.",
    "Cuckoo: 2 hash functions, 2 tables. O(1) worst-case lookup. Alpha < 0.5.",
    "Consistent hashing: ring + virtual nodes. K/n keys remapped on node change.",
    "Hash function quality: uniform, fast, avalanche. Seed for DoS protection.",
    "Python dict: open addressing (since 3.6), insertion-ordered, load factor ~0.66.",
    "Java HashMap: chaining (list -> red-black tree at 8 entries), alpha = 0.75.",
    "C++ unordered_map: chaining. Rust HashMap: Robin Hood (hashbrown/SwissTable).",
  ],
  resources: [
    { label: "Introduction to Algorithms (CLRS), Chapter 11: Hash Tables", kind: "book", note: "The canonical textbook treatment covering universal hashing, chaining, and open addressing with proofs." },
    { label: "Designing Data-Intensive Applications by Martin Kleppmann", kind: "book", note: "Covers consistent hashing, partitioning, and distributed hash table patterns in real systems." },
    { label: "Abseil Swiss Tables Design Notes", kind: "docs", note: "Google's flat_hash_map design using SIMD-accelerated probing -- a masterclass in modern hash table engineering." },
    { label: "Cuckoo Hashing -- Pagh and Rodler (2004)", kind: "paper", note: "The original paper introducing cuckoo hashing with worst-case O(1) lookups." },
    { label: "Consistent Hashing and Random Trees -- Karger et al. (1997)", kind: "paper", note: "The foundational paper on consistent hashing, developed for distributed caching at Akamai." },
    { label: "Hash Table Performance Tests by Martin Ankerl", kind: "article", note: "Comprehensive benchmarks of Robin Hood, Swiss Table, and other hash map implementations in C++." },
    { label: "MIT 6.006 Lecture on Hashing (YouTube)", kind: "video", note: "Erik Demaine's lecture covering hash functions, chaining, open addressing, and universal hashing." },
    { label: "hashbrown (Rust HashMap implementation)", kind: "repo", note: "Rust's standard HashMap backed by SwissTable, a production-grade Robin Hood + SIMD implementation." },
  ],
  glossary: [
    { term: "Hash function", definition: "A function that maps a key of arbitrary size to a fixed-size integer (the hash code), used to compute the bucket index." },
    { term: "Collision", definition: "When two distinct keys produce the same bucket index after hashing." },
    { term: "Load factor", definition: "The ratio alpha = n / m of stored entries to bucket count. Governs performance and triggers resizing." },
    { term: "Separate chaining", definition: "Collision resolution where each bucket holds a linked list (or tree) of all entries that hash to that index." },
    { term: "Open addressing", definition: "Collision resolution where all entries are stored in the array itself; collisions are resolved by probing for the next empty slot." },
    { term: "Linear probing", definition: "An open-addressing strategy that checks consecutive slots (index+1, index+2, ...) on collision." },
    { term: "Tombstone", definition: "A marker placed in a deleted slot under open addressing to preserve probe chains for other keys." },
    { term: "Primary clustering", definition: "The tendency of linear probing to form long contiguous runs of occupied slots, degrading performance." },
    { term: "Robin Hood hashing", definition: "A linear-probing variant that swaps entries during insertion so no key is much farther from its home slot than others, reducing variance." },
    { term: "Cuckoo hashing", definition: "A scheme using two or more hash functions where each key has a fixed set of possible positions, guaranteeing O(1) worst-case lookup." },
    { term: "Consistent hashing", definition: "A technique for distributing keys across nodes on a ring such that adding or removing a node remaps only a minimal fraction of keys." },
    { term: "Virtual node", definition: "A replica of a physical node placed at a different position on the consistent hashing ring to improve load balance." },
    { term: "Universal hash family", definition: "A family of hash functions where the collision probability for any two keys is at most 1/m when the function is chosen at random." },
    { term: "Avalanche property", definition: "A quality of hash functions where changing a single input bit flips approximately half the output bits, ensuring good distribution." },
    { term: "Rehashing", definition: "The process of allocating a larger array and reinserting all entries with new bucket indices when the load factor exceeds the threshold." },
  ],
};
