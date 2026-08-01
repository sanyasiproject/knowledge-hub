import type { TopicContent } from "../types";

export const redisDataStructures: TopicContent = {
  quickSummary: [
    "Redis provides 10+ data structures — Strings, Hashes, Lists, Sets, Sorted Sets, Streams, HyperLogLog, Bitmaps, Bitfields, and Geospatial indexes — each optimized for specific access patterns with well-defined time complexities.",
    "Every Redis value is internally represented using an encoding chosen for size and speed: ziplist, listpack, intset, hashtable, skiplist, or raw/embstr SDS (Simple Dynamic Strings).",
    "Choosing the right data structure is the single most impactful Redis design decision — it determines memory footprint, operation latency, and whether your use case scales.",
  ],
  detailed: [
    "Strings are the simplest type: binary-safe byte sequences up to 512 MB. Redis uses SDS (Simple Dynamic Strings) internally, which store the length to avoid O(n) strlen calls. Small integers (0-9999) are cached as shared objects. Strings under 44 bytes use embstr encoding (object header and SDS in a single allocation); larger ones use raw encoding. SET, GET, INCR, APPEND, and GETRANGE are all O(1) except APPEND which is amortized O(1).",
    "Hashes map field-value pairs under a single key — ideal for representing objects. Small hashes (few fields, small values) use listpack encoding (formerly ziplist), which is memory-efficient but O(n) for lookups. When the hash exceeds hash-max-listpack-entries (default 128) or hash-max-listpack-value (default 64 bytes), Redis promotes it to a hashtable with O(1) field access. HSET, HGET, HDEL are O(1) in hashtable encoding; HGETALL is O(n) where n is the number of fields.",
    "Lists are ordered sequences supporting push/pop at both ends in O(1). Internally they use quicklist — a doubly-linked list of listpack (compressed ziplist) nodes. This gives O(1) head/tail access with good memory efficiency for interior elements. LINDEX and LINSERT are O(n). LPOS (search by value) is O(n). LRANGE is O(s+n) where s is the offset and n is the range length. Lists are the backbone of message queues (BRPOPLPUSH pattern) and activity feeds.",
    "Sets are unordered collections of unique strings. Small sets of integers use intset encoding (sorted array, O(log n) membership test via binary search). Larger sets use a hashtable. SADD, SREM, SISMEMBER are O(1) in hashtable encoding. SUNION, SINTER, SDIFF are O(n*m) in the worst case. Sets are used for tagging, unique visitor tracking, and social graph operations (mutual friends via SINTER).",
    "Sorted Sets (ZSETs) associate a floating-point score with each member, maintaining order by score. Internally they use a skiplist + hashtable dual structure: the skiplist provides O(log n) range queries and rank lookups, while the hashtable provides O(1) score lookups by member. Small sorted sets use listpack. ZADD, ZREM, ZSCORE are O(log n). ZRANGEBYSCORE and ZRANGEBYLEX are O(log n + m) where m is the result size. Sorted sets power leaderboards, priority queues, and time-series indexes.",
    "Streams are an append-only log structure introduced in Redis 5.0, designed for event sourcing and message brokering. Each entry has an auto-generated ID (timestamp-sequence) and a set of field-value pairs. Consumer groups enable multiple consumers to cooperatively process entries with at-least-once delivery semantics. XADD is O(1) for the append, O(n) for trimming. XREAD and XREADGROUP are O(n) where n is the count. XACK marks entries as processed.",
    "HyperLogLog (HLL) is a probabilistic data structure for cardinality estimation (counting unique elements) using only ~12 KB regardless of the number of elements. PFADD adds elements, PFCOUNT returns the approximate count with a standard error of 0.81%. PFMERGE combines multiple HLLs. All operations are O(1). The trade-off is that you cannot retrieve individual elements or get exact counts.",
    "Bitmaps are not a separate type — they are String values manipulated at the bit level. SETBIT and GETBIT are O(1). BITCOUNT is O(n) over the byte range. BITOP performs AND, OR, XOR, NOT across multiple keys. Bitmaps are ideal for tracking binary states (user logged in on day X, feature flag per user). A bitmap tracking 100 million users uses only ~12 MB.",
    "Geospatial indexes use Sorted Sets under the hood, encoding longitude/latitude into a geohash score. GEOADD stores locations, GEODIST computes distances, GEORADIUS/GEOSEARCH finds nearby points. GEOADD is O(log n) per element. GEOSEARCH is O(n+log(n)) where n is the number of elements in the search area. The precision is sub-meter for points within the same geohash cell.",
  ],
  deepDive: [
    "Redis memory optimization hinges on understanding encodings. A hash with 100 small fields in listpack uses roughly 10x less memory than in hashtable encoding. The thresholds (hash-max-listpack-entries, list-max-listpack-size, zset-max-listpack-entries) are tunable. The trade-off: listpack is O(n) for random access but cache-friendly and compact; hashtable is O(1) but has pointer overhead. For read-heavy small objects, listpack wins on both memory and speed due to CPU cache effects.",
    "Sorted Set internals: the skiplist has a probabilistic balancing factor of p=0.25 with a max level of 32, giving O(log n) expected time for insert, delete, and range queries. The dual skiplist+hashtable design means each member is stored twice (in both structures), trading memory for the ability to do both score-based range queries (skiplist) and direct member-to-score lookups (hashtable) efficiently.",
    "Streams use a radix tree (rax) of macro-nodes, where each macro-node contains a listpack of entries. This provides O(log n) seeking by ID with excellent memory efficiency for sequential IDs. Consumer groups maintain a last-delivered-ID and a Pending Entries List (PEL) per consumer for tracking unacknowledged messages. The PEL is a rax tree keyed by entry ID, enabling O(log n) lookups for XACK.",
    "Redis 7.0 replaced ziplist with listpack everywhere. Listpack improves on ziplist by eliminating the cascading update problem: ziplist stored the previous entry length, so inserting a large entry could trigger O(n) updates to subsequent entries. Listpack stores only the current entry length, making insertions always O(1) amortized within the node.",
  ],
  code: [
    {
      language: "redis",
      caption: "String operations with encoding inspection",
      source: `SET user:1:name "Alice"
GET user:1:name
# "Alice"

SET counter 0
INCR counter
INCRBY counter 10
# (integer) 11

# Check internal encoding
OBJECT ENCODING user:1:name
# "embstr"  (short string, single allocation)

SET longval "This is a string longer than 44 bytes for demonstration purposes here"
OBJECT ENCODING longval
# "raw"  (separate SDS allocation)

OBJECT ENCODING counter
# "int"  (stored as native integer)

# Atomic get-and-set
GETSET counter 0
# "11"  (returns old value, sets new)

# SET with expiry and conditional flags
SET session:abc "data" EX 3600 NX
# OK if key did not exist, nil otherwise`,
    },
    {
      language: "redis",
      caption: "Hash operations for object modeling",
      source: `HSET user:1000 name "Bob" email "bob@example.com" age 30 score 4.5
# (integer) 4

HGET user:1000 name
# "Bob"

HMGET user:1000 name email age
# 1) "Bob"  2) "bob@example.com"  3) "30"

HINCRBY user:1000 age 1
# (integer) 31

HINCRBYFLOAT user:1000 score 0.5
# "5"

HSCAN user:1000 0 MATCH "e*" COUNT 10
# Returns fields starting with 'e'

OBJECT ENCODING user:1000
# "listpack"  (small hash, compact encoding)

# Demonstrate encoding promotion
# After adding > 128 fields, encoding becomes "hashtable"`,
    },
    {
      language: "redis",
      caption: "List operations — queue and stack patterns",
      source: `# Queue pattern: LPUSH + RPOP (or RPUSH + LPOP)
LPUSH queue:tasks "task1" "task2" "task3"
# (integer) 3

RPOP queue:tasks
# "task1"  (FIFO order)

# Stack pattern: LPUSH + LPOP
LPUSH stack:undo "action1" "action2"
LPOP stack:undo
# "action2"  (LIFO order)

# Blocking pop — waits up to 5 seconds
BRPOP queue:tasks 5

# Atomic move between lists
LMOVE source dest LEFT RIGHT

# Trim to keep only last 100 entries (capped list)
LTRIM mylist -100 -1

# Get range
LRANGE queue:tasks 0 -1`,
    },
    {
      language: "redis",
      caption: "Sorted Set — leaderboard with rank and range queries",
      source: `ZADD leaderboard 1500 "player:alice" 1200 "player:bob" 1800 "player:charlie"

# Top 3 with scores (descending)
ZREVRANGE leaderboard 0 2 WITHSCORES
# 1) "player:charlie"  2) "1800"
# 3) "player:alice"    4) "1500"
# 5) "player:bob"      6) "1200"

# Rank of a player (0-based, ascending)
ZRANK leaderboard "player:alice"
# (integer) 1

ZREVRANK leaderboard "player:alice"
# (integer) 1  (0-based from top)

# Score range query
ZRANGEBYSCORE leaderboard 1300 1900 WITHSCORES
# Players with scores between 1300 and 1900

# Increment score atomically
ZINCRBY leaderboard 100 "player:bob"
# "1300"

# Lexicographic range (when all scores are equal)
ZADD index 0 "apple" 0 "banana" 0 "cherry"
ZRANGEBYLEX index "[b" "[d"
# 1) "banana"  2) "cherry"`,
    },
    {
      language: "redis",
      caption: "Streams — event log with consumer groups",
      source: `# Append entries
XADD events * user_id 1001 action "login" ip "10.0.0.1"
# "1688000000000-0"  (auto-generated ID)

XADD events * user_id 1002 action "purchase" amount 49.99
# "1688000000001-0"

# Read latest entries
XRANGE events - + COUNT 10

# Create consumer group starting from the beginning
XGROUP CREATE events analytics-group 0

# Consumer reads from group
XREADGROUP GROUP analytics-group consumer-1 COUNT 5 BLOCK 2000 STREAMS events >

# Acknowledge processing
XACK events analytics-group "1688000000000-0"

# Check pending entries
XPENDING events analytics-group - + 10

# Trim stream to ~1000 entries (approximate for performance)
XTRIM events MAXLEN ~ 1000`,
    },
    {
      language: "redis",
      caption: "HyperLogLog, Bitmaps, and Geospatial",
      source: `# HyperLogLog — count unique visitors
PFADD visitors:2024-01 "user:1" "user:2" "user:3" "user:1"
PFCOUNT visitors:2024-01
# (integer) 3  (approximate unique count)

PFADD visitors:2024-02 "user:2" "user:4"
PFMERGE visitors:q1 visitors:2024-01 visitors:2024-02
PFCOUNT visitors:q1
# (integer) 4

# Bitmaps — daily active users
SETBIT dau:2024-01-15 1001 1
SETBIT dau:2024-01-15 1002 1
SETBIT dau:2024-01-16 1001 1

BITCOUNT dau:2024-01-15
# (integer) 2

# Users active on BOTH days
BITOP AND dau:both dau:2024-01-15 dau:2024-01-16
BITCOUNT dau:both
# (integer) 1  (only user 1001)

# Geospatial
GEOADD locations 13.361389 38.115556 "Palermo"
GEOADD locations -122.4194 37.7749 "San Francisco"
GEODIST locations "Palermo" "San Francisco" km
# "10216.5388"

GEOSEARCH locations FROMMEMBER "San Francisco" BYRADIUS 200 km ASC`,
    },
  ],
  diagrams: [
    {
      title: "Redis Encoding Selection Decision Tree",
      kind: "flow",
      caption: "Redis selects a compact internal encoding (listpack, intset, ziplist) for small structures and upgrades to hashtable, skiplist, or raw when thresholds are exceeded.",
      mermaid: `flowchart TD
    A([Set value]) --> B{Data type?}
    B -->|String| C{Length <= 44 bytes?}
    C -->|Yes| D[embstr encoding]
    C -->|No| E[raw SDS]
    B -->|Hash| F{Entries <= 128 and values small?}
    F -->|Yes| G[listpack]
    F -->|No| H[hashtable]
    B -->|Set| I{All integers, count <= 512?}
    I -->|Yes| J[intset]
    I -->|No| K[hashtable]
    B -->|ZSet| L{Entries <= 128 and values small?}
    L -->|Yes| M[listpack]
    L -->|No| N[skiplist + hashtable]`,
    },
    {
      title: "Sorted Set Internal Structure",
      kind: "architecture",
      caption: "A Sorted Set uses both a skip list for ordered range queries and a hash table for O(1) score lookups by member name.",
      mermaid: `graph TD
    ZSET[Sorted Set] --> SL[Skip List
ordered by score]
    ZSET --> HT[Hash Table
member to score]
    SL --> E1[member:alice score:1.0]
    SL --> E2[member:bob score:2.5]
    SL --> E3[member:carol score:4.0]
    HT --> E1
    HT --> E2
    HT --> E3`,
    },
    {
      title: "Stream Consumer Group Architecture",
      kind: "architecture",
      caption: "A Stream has a radix tree of entries. Consumer groups track the last delivered ID and maintain a Pending Entries List (PEL) per consumer.",
      mermaid: `graph LR
    STR[(Stream
radix tree)] --> CG1[Consumer Group A]
    STR --> CG2[Consumer Group B]
    CG1 --> C1A[Consumer 1
PEL: msg-1, msg-3]
    CG1 --> C1B[Consumer 2
PEL: msg-2]
    CG2 --> C2A[Consumer 1
PEL: msg-1]`,
    },
    {
      title: "Redis Data Structures Overview",
      kind: "mindmap",
      caption: "All Redis data structures with their key commands and typical use cases.",
      mermaid: `mindmap
  root((Redis Data Structures))
    String
      SET GET INCR
      Counters, sessions
    List
      LPUSH RPOP LRANGE
      Queues, activity feeds
    Hash
      HSET HGET HGETALL
      User profiles, objects
    Set
      SADD SMEMBERS SINTER
      Tags, unique visitors
    Sorted Set
      ZADD ZRANGE ZRANGEBYSCORE
      Leaderboards, rate limits
    Stream
      XADD XREAD XACK
      Event logs, messaging`,
    },
  ],
  animations: [
    {
      title: "Skiplist insertion in a Sorted Set",
      steps: [
        { label: "Generate level", detail: "Random level is chosen with probability p=0.25 per level. Most nodes are level 1; ~25% are level 2; ~6% are level 3." },
        { label: "Search path", detail: "Starting from the top-left header, traverse right while the next node's score is less than the target. Drop down a level when blocked. Record update pointers at each level." },
        { label: "Insert node", detail: "Create the new node at the generated level. Splice it into the skiplist at each level using the recorded update pointers." },
        { label: "Update hashtable", detail: "Insert the member-to-score mapping in the companion hashtable for O(1) ZSCORE lookups." },
        { label: "Update span", detail: "Recalculate the span (rank distance) of affected forward pointers at each level for O(log n) ZRANK." },
      ],
    },
    {
      title: "Listpack to hashtable encoding promotion",
      steps: [
        { label: "Threshold check", detail: "On each HSET, Redis checks if the field count exceeds hash-max-listpack-entries (128) or any value exceeds hash-max-listpack-value (64 bytes)." },
        { label: "Allocate hashtable", detail: "A new dict (hashtable) is allocated with an initial size that is a power of 2 >= the number of fields." },
        { label: "Migrate entries", detail: "Each field-value pair is read from the listpack and inserted into the hashtable. SDS strings are allocated for each." },
        { label: "Free listpack", detail: "The old listpack buffer is freed. The robj encoding field is updated from OBJ_ENCODING_LISTPACK to OBJ_ENCODING_HT." },
        { label: "No reverse", detail: "Once promoted to hashtable, Redis never converts back to listpack — even if fields are deleted below the threshold." },
      ],
    },
  ],
  comparison: {
    columns: ["Data Structure", "Key Operations", "Time Complexity", "Memory Encoding", "Typical Use Case"],
    rows: [
      ["String", "GET, SET, INCR, APPEND", "O(1)", "int / embstr / raw", "Caching, counters, flags"],
      ["Hash", "HSET, HGET, HDEL, HGETALL", "O(1) / O(n) for ALL", "listpack / hashtable", "Object storage, user profiles"],
      ["List", "LPUSH, RPOP, LRANGE, LINDEX", "O(1) push/pop, O(n) index", "quicklist (listpack nodes)", "Queues, activity feeds, capped logs"],
      ["Set", "SADD, SREM, SISMEMBER, SINTER", "O(1) / O(n*m) for set ops", "intset / hashtable", "Tags, unique tracking, graph ops"],
      ["Sorted Set", "ZADD, ZRANGE, ZRANK, ZSCORE", "O(log n)", "listpack / skiplist+ht", "Leaderboards, priority queues"],
      ["Stream", "XADD, XREAD, XREADGROUP, XACK", "O(1) add, O(n) read", "rax + listpack", "Event sourcing, message broker"],
      ["HyperLogLog", "PFADD, PFCOUNT, PFMERGE", "O(1)", "~12 KB fixed", "Unique counting (approximate)"],
      ["Bitmap", "SETBIT, GETBIT, BITCOUNT", "O(1) bit ops, O(n) count", "String (bit-addressed)", "Daily active users, feature flags"],
      ["Geo", "GEOADD, GEOSEARCH, GEODIST", "O(log n)", "Sorted Set (geohash)", "Location-based queries"],
    ],
  },
  interviewQA: [
    {
      q: "Why does Redis use a skiplist instead of a balanced BST (e.g., red-black tree) for Sorted Sets?",
      a: "Skiplists are simpler to implement, have comparable O(log n) performance, and crucially support O(log n) range queries naturally by walking forward pointers. They are also easier to make concurrent (though Redis is single-threaded). Antirez (Salvatore Sanfilippo) specifically chose skiplists because they are simpler to debug and reason about, and ZRANGEBYSCORE is a first-class operation that maps directly to a skiplist traversal.",
      followUps: [
        "What is the space overhead of a skiplist compared to a balanced tree?",
        "How does the probabilistic level assignment (p=0.25) affect expected height?",
      ],
    },
    {
      q: "When would you choose a Hash over a String for storing a JSON object?",
      a: "Use a Hash when you need to read or update individual fields without fetching the entire object — HGET and HSET are O(1) and avoid deserializing/re-serializing JSON. Use a String (with JSON) when you always read/write the entire object atomically, or when you need nested structures that Hashes cannot represent. Hashes also use less memory for small objects due to listpack encoding.",
      followUps: [
        "What happens to memory when a hash exceeds the listpack threshold?",
        "How does RedisJSON (the module) change this trade-off?",
      ],
    },
    {
      q: "Explain the difference between XREAD and XREADGROUP in Redis Streams.",
      a: "XREAD is a simple fan-out read — every caller sees every message, similar to pub/sub but with persistence and replay. XREADGROUP distributes messages across consumers in a group — each message is delivered to exactly one consumer (load balancing), and must be acknowledged with XACK. Unacknowledged messages are tracked in the Pending Entries List (PEL) and can be claimed by other consumers for failure recovery.",
    },
    {
      q: "How does HyperLogLog achieve O(1) space for cardinality estimation?",
      a: "HLL hashes each element and uses the hash bits to assign the element to one of 16384 registers. It records the maximum number of leading zeros seen in each register. The harmonic mean of 2^(max_leading_zeros) across all registers estimates the cardinality. The fixed 16384 registers at 6 bits each use exactly 12 KB. The standard error is 0.81% — mathematically derived from the register count (1.04 / sqrt(16384)).",
    },
  ],
  mcqs: [
    {
      q: "What is the time complexity of ZADD in a Sorted Set with n elements?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 1,
      explanation: "ZADD must find the insertion position in the skiplist, which takes O(log n). It also updates the companion hashtable in O(1), so the overall complexity is O(log n).",
    },
    {
      q: "Which encoding does Redis use for a Hash with 50 fields, each under 64 bytes?",
      options: ["hashtable", "listpack", "skiplist", "intset"],
      answerIndex: 1,
      explanation: "With fewer than 128 fields (hash-max-listpack-entries default) and values under 64 bytes (hash-max-listpack-value default), Redis uses the compact listpack encoding.",
    },
    {
      q: "What is the maximum memory used by a HyperLogLog structure in Redis?",
      options: ["64 bytes", "1 KB", "12 KB", "1 MB"],
      answerIndex: 2,
      explanation: "HyperLogLog uses 16384 registers at 6 bits each, totaling 12288 bytes (~12 KB), regardless of how many elements are added.",
    },
    {
      q: "Which Redis data structure does GEOADD use internally?",
      options: ["Hash", "List", "Sorted Set", "Stream"],
      answerIndex: 2,
      explanation: "GEOADD stores locations as members in a Sorted Set, with the 52-bit geohash of the longitude/latitude as the score. This enables range queries via ZRANGEBYSCORE on the geohash space.",
    },
    {
      q: "What problem did listpack solve over ziplist?",
      options: [
        "Listpack supports larger entries",
        "Listpack eliminates cascading updates when inserting entries",
        "Listpack uses less memory per entry",
        "Listpack supports concurrent access",
      ],
      answerIndex: 1,
      explanation: "Ziplist stored the previous entry's length, so inserting a large entry could cascade O(n) length updates. Listpack only stores the current entry's length, eliminating this problem.",
    },
  ],
  flashcards: [
    { front: "What internal encoding does Redis use for short strings (< 44 bytes)?", back: "embstr — the redisObject header and SDS are allocated in a single contiguous block, requiring one allocation and one cache line." },
    { front: "Time complexity of LINDEX on a Redis List?", back: "O(n) — Lists use quicklist (linked list of listpack nodes), so accessing by index requires linear traversal." },
    { front: "How many registers does Redis HyperLogLog use?", back: "16384 registers, each 6 bits wide, totaling ~12 KB." },
    { front: "What is the difference between intset and hashtable encoding for Sets?", back: "intset is used for small sets containing only integers — stored as a sorted array with O(log n) binary search. Hashtable is used otherwise, giving O(1) lookups." },
    { front: "What does XACK do in Redis Streams?", back: "Acknowledges that a consumer has processed a message, removing it from the consumer's Pending Entries List (PEL) in the consumer group." },
    { front: "What is the precision of Redis geospatial commands?", back: "Sub-meter precision. The 52-bit geohash encoded in the sorted set score provides ~0.6m resolution at the equator." },
    { front: "Default threshold for hash listpack-to-hashtable promotion?", back: "128 entries (hash-max-listpack-entries) or any value exceeding 64 bytes (hash-max-listpack-value)." },
    { front: "What data structure underlies Redis quicklist?", back: "A doubly-linked list of listpack nodes. Each node is a compressed block of sequential entries." },
  ],
  revisionNotes: [
    "Redis Strings use SDS internally; 3 encodings: int (for integers), embstr (strings <= 44 bytes), raw (longer strings).",
    "Hashes use listpack for small hashes (< 128 fields, values < 64 bytes) and hashtable for larger ones. HGETALL is O(n).",
    "Lists use quicklist — a doubly-linked list of listpack nodes. O(1) push/pop at ends, O(n) for index access.",
    "Sets use intset for small integer-only sets, hashtable otherwise. Set operations (SINTER, SUNION) are O(n*m).",
    "Sorted Sets use skiplist + hashtable. Skiplist for ordered range queries O(log n + m), hashtable for O(1) score lookups.",
    "Streams use rax (radix tree) of listpack nodes. Consumer groups track delivered messages and PEL for reliability.",
    "HyperLogLog uses 12 KB for approximate unique counting with 0.81% standard error.",
    "Bitmaps are Strings addressed at the bit level. BITOP supports AND/OR/XOR/NOT across keys.",
    "Geospatial indexes are Sorted Sets with geohash-encoded scores.",
    "Redis 7.0 replaced ziplist with listpack to eliminate cascading updates.",
  ],
  cheatSheet: [
    "SET key val EX 60 NX — set with 60s TTL, only if not exists",
    "MSET / MGET — batch string operations, O(n) total",
    "HSET key f1 v1 f2 v2 — set multiple hash fields in one call",
    "HSCAN key 0 MATCH pattern COUNT 100 — iterate hash fields without blocking",
    "LPUSH + BRPOP — reliable queue pattern with blocking consumer",
    "LMOVE src dst LEFT RIGHT — atomic queue-to-queue transfer",
    "SINTERSTORE dest k1 k2 — compute and store set intersection",
    "ZADD key GT score member — only update if new score is greater",
    "ZRANGEBYSCORE key min max LIMIT offset count — paginated range query",
    "XADD key MAXLEN ~ 1000 * field val — append to capped stream",
    "XREADGROUP GROUP g c COUNT 10 BLOCK 5000 STREAMS key > — consumer group read",
    "PFADD / PFCOUNT — HyperLogLog add and approximate count",
    "SETBIT / GETBIT / BITCOUNT — bitmap operations on string values",
    "GEOSEARCH key FROMMEMBER m BYRADIUS 10 km ASC COUNT 5 — nearest neighbors",
    "OBJECT ENCODING key — inspect internal encoding for optimization",
    "OBJECT HELP — list available object subcommands",
    "MEMORY USAGE key — bytes consumed by a key including overhead",
  ],
  resources: [
    { label: "Redis Data Types Documentation", kind: "docs", note: "Official reference for all data types and their commands." },
    { label: "Redis University (free courses)", kind: "video", note: "Hands-on courses covering data structures, indexing, and performance." },
    { label: "Redis in Action by Josiah Carlson", kind: "book", note: "Practical patterns and real-world use cases for each data structure." },
    { label: "Antirez blog — Redis internals", kind: "article", note: "Creator's blog explaining design decisions behind skiplists, HLL, and streams." },
    { label: "Redis source code (github.com/redis/redis)", kind: "repo", note: "t_zset.c for sorted sets, t_stream.c for streams, object.c for encoding logic." },
    { label: "HyperLogLog paper by Flajolet et al.", kind: "paper", note: "Original 2007 paper describing the algorithm Redis implements." },
  ],
  glossary: [
    { term: "SDS (Simple Dynamic String)", definition: "Redis's string implementation that stores length, avoiding O(n) strlen and enabling binary safety." },
    { term: "listpack", definition: "Compact sequential encoding for small collections. Replaced ziplist in Redis 7.0 to eliminate cascading updates." },
    { term: "skiplist", definition: "Probabilistic data structure providing O(log n) search, insert, and delete. Used in Sorted Sets for ordered operations." },
    { term: "intset", definition: "Sorted array encoding for Sets containing only integers. Uses binary search for O(log n) membership test." },
    { term: "quicklist", definition: "Doubly-linked list of listpack nodes. Used as the internal encoding for Redis Lists." },
    { term: "rax (radix tree)", definition: "Compressed trie used by Streams for efficient storage and lookup of sequential entry IDs." },
    { term: "geohash", definition: "Encoding that interleaves longitude and latitude bits into a single integer, enabling range queries via sorted set score ranges." },
    { term: "PEL (Pending Entries List)", definition: "Per-consumer tracking of stream entries that have been delivered but not yet acknowledged." },
    { term: "embstr encoding", definition: "String encoding where the redisObject header and SDS are in a single allocation. Used for strings up to 44 bytes." },
    { term: "encoding promotion", definition: "Automatic upgrade from a compact encoding (listpack, intset) to a full encoding (hashtable, skiplist) when size thresholds are exceeded. Never reversed." },
  ],
  exercises: [
    "Create a Redis hash with 50 small fields and inspect its encoding with `OBJECT ENCODING`. Then add fields one at a time until the encoding **promotes from `listpack` to `hashtable`**. Record the exact threshold. Use `MEMORY USAGE` before and after promotion -- how much does memory per field increase?",
    "Build a **real-time leaderboard** using a sorted set. Insert 1,000 players with random scores, then implement: *top 10 retrieval*, *player rank lookup*, *score range query*, and *atomic score increment*. Measure latency for each operation and confirm the **O(log n)** complexity claim.",
    "Implement a **daily active users tracker** using Redis bitmaps. Use `SETBIT` to mark user IDs as active for each day, then compute users active on *all* of the last 7 days using `BITOP AND`. Compare the memory usage of this approach vs. storing user IDs in a set for 10 million users.",
    "Use Redis Streams to build a **producer-consumer pipeline** with a consumer group. Produce 500 messages, consume them across 3 consumers, and handle failures: crash one consumer mid-processing and use `XPENDING` and `XCLAIM` to reassign its unacknowledged messages. Document the *at-least-once delivery* guarantees you observe.",
    "Compare `HyperLogLog` accuracy against an exact `SET`-based unique count. Add 100,000 random elements to both, then add the same elements again. What is the **percentage error** of `PFCOUNT` vs `SCARD`? Repeat with 1 million and 10 million elements -- does the error rate stay within the theoretical *0.81%*?",
  ],
};
