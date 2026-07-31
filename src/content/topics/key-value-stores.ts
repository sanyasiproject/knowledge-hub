import type { TopicContent } from "../types";

export const keyValueStores: TopicContent = {
  quickSummary: [
    "Key-value stores are the simplest NoSQL data model: each entry is a unique key mapped to an opaque value (string, JSON, binary blob).",
    "They excel at high-throughput, low-latency lookups by key, making them ideal for caching, session storage, and configuration.",
    "Major systems: Redis (in-memory, rich data structures), DynamoDB (managed, scalable), Memcached (pure cache), etcd (distributed consensus).",
  ],
  detailed: [
    "A key-value store exposes three core operations: GET(key), PUT(key, value), and DELETE(key). The store treats the value as opaque — it does not parse, index, or query inside the value. This simplicity enables extreme performance: lookups are O(1) via hashing, and the lack of relational overhead allows millions of operations per second.",
    "Redis extends the basic model with typed data structures (strings, lists, sets, sorted sets, hashes, streams) and atomic operations on them, blurring the line between a key-value store and a data structure server. DynamoDB adds secondary indexes and conditional writes, making it more capable for application data while retaining key-value simplicity for its primary access pattern.",
    "Partitioning in key-value stores typically uses consistent hashing: keys are hashed and distributed across nodes on a ring. This minimizes data movement when nodes are added or removed. Replication provides durability and availability — DynamoDB replicates each partition across three availability zones. The trade-off between consistency and availability follows the CAP theorem: DynamoDB offers eventually consistent reads (fast, cheap) and strongly consistent reads (slower, costlier).",
    "Key-value stores shine in specific access patterns: cache layers (Memcached, Redis), session management, feature flags, rate limiting, leaderboards, and real-time counters. They struggle when you need to query by value (without knowing the key), enforce relationships between entries, or perform complex ad-hoc queries — those needs call for document stores or relational databases.",
  ],
  deepDive: [
    "DynamoDB's single-table design pushes multiple entity types into one table, using composite keys (partition key + sort key) to model one-to-many relationships and enable efficient queries. The partition key determines which node stores the data, while the sort key enables range queries within a partition. Global Secondary Indexes (GSIs) provide alternative access patterns at the cost of additional write capacity. This design requires thinking about access patterns upfront — unlike relational databases where you can add queries after the schema is defined.",
    "The memory efficiency of key-value stores matters at scale. Redis stores small strings using a compact encoding (embstr for strings <= 44 bytes, int for numbers). Memcached uses a slab allocator that pre-allocates memory in size classes, reducing fragmentation but wasting space when object sizes don't fit the slabs well. Understanding these internals helps size deployments and predict memory usage.",
  ],
  code: [
    {
      language: "bash",
      caption: "Redis basic key-value operations",
      source: `# String operations
SET user:1001:name "Alice"
GET user:1001:name               # "Alice"

# Set with expiration (TTL)
SET session:abc123 '{"user_id":1001}' EX 3600    # expires in 1 hour
TTL session:abc123                                 # seconds remaining

# Atomic increment (counters)
INCR page:views:homepage          # 1
INCRBY page:views:homepage 10     # 11

# Conditional set (distributed lock pattern)
SET lock:order:5001 "worker-1" NX EX 30   # set only if not exists

# Multiple key operations
MSET user:1:name "Alice" user:2:name "Bob"
MGET user:1:name user:2:name      # ["Alice", "Bob"]`
    },
    {
      language: "cpp",
      caption: "DynamoDB key-value operations with AWS SDK for C++",
      source: `#include <aws/core/Aws.h>
#include <aws/dynamodb/DynamoDBClient.h>
#include <aws/dynamodb/model/PutItemRequest.h>
#include <aws/dynamodb/model/GetItemRequest.h>
#include <aws/dynamodb/model/UpdateItemRequest.h>
#include <iostream>

using namespace Aws::DynamoDB;
using namespace Aws::DynamoDB::Model;

int main() {
    Aws::SDKOptions options;
    Aws::InitAPI(options);
    {
        DynamoDBClient client;
        const Aws::String table_name = "Users";

        // Put item
        PutItemRequest put_req;
        put_req.SetTableName(table_name);
        put_req.AddItem("user_id", AttributeValue().SetS("u-1001"));
        put_req.AddItem("name",    AttributeValue().SetS("Alice"));
        put_req.AddItem("email",   AttributeValue().SetS("alice@example.com"));
        put_req.AddItem("plan",    AttributeValue().SetS("premium"));
        client.PutItem(put_req);

        // Get item (strongly consistent)
        GetItemRequest get_req;
        get_req.SetTableName(table_name);
        get_req.AddKey("user_id", AttributeValue().SetS("u-1001"));
        get_req.SetConsistentRead(true);

        auto get_result = client.GetItem(get_req);
        if (get_result.IsSuccess()) {
            const auto& item = get_result.GetResult().GetItem();
            std::cout << "Name: " << item.at("name").GetS() << "\\n";
            std::cout << "Plan: " << item.at("plan").GetS() << "\\n";
        }

        // Conditional update (optimistic concurrency)
        UpdateItemRequest update_req;
        update_req.SetTableName(table_name);
        update_req.AddKey("user_id", AttributeValue().SetS("u-1001"));
        update_req.SetUpdateExpression("SET plan = :new_plan");
        update_req.SetConditionExpression("plan = :old_plan");
        update_req.AddExpressionAttributeValues(":new_plan",
            AttributeValue().SetS("enterprise"));
        update_req.AddExpressionAttributeValues(":old_plan",
            AttributeValue().SetS("premium"));

        auto update_result = client.UpdateItem(update_req);
        if (!update_result.IsSuccess()) {
            std::cerr << "Conditional update failed: "
                      << update_result.GetError().GetMessage() << "\\n";
        }
    }
    Aws::ShutdownAPI(options);
    return 0;
}`
    },
  ],
  diagrams: [
    { title: "Key-value store architecture", kind: "architecture", caption: "Client hashes key to determine node; node stores key-value pair in memory or on disk." },
    { title: "Consistent hashing ring", kind: "network", caption: "Keys and nodes mapped to a hash ring; each key is owned by the next clockwise node." },
  ],
  animations: [
    {
      title: "Key-value lookup flow",
      steps: [
        { label: "Client sends GET", detail: "Application sends GET('user:1001:profile') to the key-value store." },
        { label: "Hash key", detail: "The key is hashed to determine which partition/node holds the data." },
        { label: "Route to node", detail: "The request is routed to the correct node (directly or via a proxy)." },
        { label: "Lookup", detail: "The node looks up the key in its hash table (O(1) for in-memory stores)." },
        { label: "Return value", detail: "The value is returned to the client. If not found, a cache miss or null is returned." },
      ],
    },
  ],
  comparison: {
    columns: ["System", "Storage", "Data Structures", "Persistence", "Scaling", "Best For"],
    rows: [
      ["Redis", "In-memory (+ disk)", "Rich (strings, lists, sets, sorted sets, hashes, streams)", "RDB snapshots + AOF", "Cluster (hash slots)", "Caching, sessions, real-time features"],
      ["Memcached", "In-memory only", "Strings only", "None", "Client-side sharding", "Simple caching"],
      ["DynamoDB", "SSD (managed)", "Items with attributes, secondary indexes", "Fully managed, durable", "Auto-scaling partitions", "Serverless apps, scalable backends"],
      ["etcd", "Disk (Raft consensus)", "Key-value with versioning, watch", "Built-in (Raft log)", "Raft cluster (3-5 nodes)", "Config, service discovery, leader election"],
    ],
  },
  interviewQA: [
    {
      q: "When would you choose a key-value store over a relational database?",
      a: "When your access pattern is almost exclusively lookup-by-key (GET/PUT/DELETE), you need sub-millisecond latency, and you do not need to query by attributes other than the key. Common cases: caching, session storage, feature flags, rate limiting counters, leaderboards. If you need to query by non-key attributes, join data, or enforce complex constraints, a relational database is better.",
      followUps: ["Can DynamoDB handle relational-like queries?", "What about Redis with secondary indexes?"],
    },
    {
      q: "How does DynamoDB handle hot partitions?",
      a: "DynamoDB distributes data across partitions by hashing the partition key. If many requests target the same partition key, that partition becomes hot and may be throttled. Solutions: choose a high-cardinality partition key (e.g., user_id, not date), use write sharding (append a random suffix to the key), or use DynamoDB Adaptive Capacity which automatically redistributes capacity to hot partitions. The 2019 update also added burst capacity and improved handling of uneven workloads.",
      followUps: ["What is write sharding?", "How does adaptive capacity work?"],
    },
    {
      q: "What is the difference between Redis and Memcached?",
      a: "Redis supports rich data structures (lists, sets, sorted sets, hashes, streams), persistence (RDB/AOF), Lua scripting, pub/sub, and clustering. Memcached stores only strings, has no persistence, and uses client-side sharding. Memcached is simpler and slightly faster for pure string caching due to its multi-threaded architecture (Redis is single-threaded per instance). Choose Redis when you need data structures or persistence; choose Memcached for simple, high-throughput string caching.",
      followUps: ["Is Redis truly single-threaded?", "When would Memcached's simplicity be an advantage?"],
    },
  ],
  followUps: [
    "How does DynamoDB's single-table design work?",
    "What are the consistency options in DynamoDB?",
    "How does Redis persistence (RDB/AOF) work?",
    "What is etcd and how is it used in Kubernetes?",
  ],
  mcqs: [
    {
      q: "What is the time complexity of a key lookup in a hash-based key-value store?",
      options: ["O(log n)", "O(n)", "O(1) average", "O(n log n)"],
      answerIndex: 2,
      explanation: "Hash-based key-value stores use a hash function to map keys to locations, providing O(1) average-case lookup time.",
    },
    {
      q: "Which key-value store supports rich data structures like sorted sets and streams?",
      options: ["Memcached", "etcd", "Redis", "DynamoDB"],
      answerIndex: 2,
      explanation: "Redis is a data structure server that supports strings, lists, sets, sorted sets, hashes, streams, bitmaps, and more.",
    },
    {
      q: "DynamoDB provides two types of read consistency. What are they?",
      options: ["Strong and weak", "Eventually consistent and strongly consistent", "Read committed and serializable", "Linearizable and causal"],
      answerIndex: 1,
      explanation: "DynamoDB offers eventually consistent reads (default, faster, cheaper) and strongly consistent reads (always reflect the latest write, costs more read capacity).",
    },
  ],
  exercises: [
    "Design a session store using Redis with appropriate TTLs. Handle session extension on user activity.",
    "Implement a rate limiter using Redis INCR and EXPIRE (fixed window) or sorted sets (sliding window).",
    "Design a DynamoDB table for an e-commerce application that supports queries by user_id and by order_date range. Identify the partition key, sort key, and any GSIs needed.",
    "Compare the performance of Redis GET vs a PostgreSQL SELECT by primary key for 10,000 sequential lookups.",
  ],
  flashcards: [
    { front: "What are the three core operations of a key-value store?", back: "GET(key), PUT(key, value), DELETE(key). The value is treated as opaque — the store does not parse or index it." },
    { front: "Why is Memcached faster than Redis for simple string caching?", back: "Memcached is multi-threaded and has less overhead (no persistence, no data structures). Redis is single-threaded per instance but offers far more features." },
    { front: "What is a hot partition in DynamoDB?", back: "A partition that receives disproportionate traffic because many items share the same partition key, causing throttling." },
    { front: "What does NX mean in Redis SET?", back: "Set only if the key does Not eXist. Used for distributed lock acquisition: SET key value NX EX timeout." },
  ],
  revisionNotes: [
    "Key-value: simplest NoSQL model. GET/PUT/DELETE by key. O(1) lookup.",
    "Redis: in-memory data structure server. Rich types, persistence, clustering.",
    "Memcached: simple string cache. Multi-threaded, no persistence.",
    "DynamoDB: managed, scalable. Partition key + sort key. Eventually or strongly consistent reads.",
    "etcd: consensus-based (Raft). Used for config, service discovery, leader election.",
    "Partitioning: consistent hashing distributes keys across nodes.",
    "Hot partitions: solved by high-cardinality keys or write sharding.",
  ],
  cheatSheet: [
    "SET key value [EX seconds] [NX|XX] — Redis set with options",
    "GET key — retrieve value",
    "INCR key / INCRBY key n — atomic counter",
    "MGET key1 key2 — batch get",
    "EXPIRE key seconds — set TTL",
    "TTL key — check remaining time",
    "DynamoDB: PK = partition key, SK = sort key, GSI = global secondary index",
    "Consistent hashing: minimal remapping on node changes",
  ],
  resources: [
    { label: "Redis Documentation", kind: "docs", note: "Complete reference for all Redis commands and data types." },
    { label: "Amazon DynamoDB Developer Guide", kind: "docs", note: "Official guide for DynamoDB data modeling and operations." },
    { label: "Designing Data-Intensive Applications, Ch. 2", kind: "book", note: "Covers data models including key-value stores." },
    { label: "Dynamo: Amazon's Highly Available Key-Value Store", kind: "paper", note: "The foundational paper behind DynamoDB's design." },
  ],
  glossary: [
    { term: "Key-value store", definition: "A database that stores data as key-value pairs, where the value is opaque to the store." },
    { term: "Partition key", definition: "The key used to determine which partition (node) stores a given item." },
    { term: "Sort key", definition: "A secondary key within a partition that enables range queries (DynamoDB)." },
    { term: "Consistent hashing", definition: "A hash-based partitioning scheme that minimizes data movement when nodes join or leave." },
    { term: "TTL (Time to Live)", definition: "An expiration time after which the key-value pair is automatically deleted." },
    { term: "GSI (Global Secondary Index)", definition: "An index in DynamoDB with a different partition key than the base table, enabling alternative query patterns." },
  ],
};
