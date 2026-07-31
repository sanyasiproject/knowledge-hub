import type { TopicContent } from "../types";

export const documentStores: TopicContent = {
  quickSummary: [
    "Document stores persist data as self-contained documents (JSON, BSON, XML) rather than rows in fixed-schema tables, enabling schema flexibility and natural mapping to application objects.",
    "MongoDB is the dominant document database, storing BSON documents in collections with rich query capabilities, an aggregation pipeline, replica sets for high availability, and sharding for horizontal scaling.",
    "CouchDB takes a different approach with an HTTP/JSON API, multi-version concurrency control (MVCC), and a multi-master replication model that excels in offline-first and edge-computing scenarios.",
    "Denormalization — embedding related data within a single document — is the default design strategy, trading storage and update complexity for read performance and atomic single-document operations.",
  ],
  detailed: [
    "The document model stores data as hierarchical, self-describing structures. Unlike relational tables where an entity might span many rows across joined tables, a document bundles an entity and its related data into a single retrievable unit. This maps naturally to objects in application code, eliminating much of the impedance mismatch that ORMs try to bridge.",
    "BSON (Binary JSON) is MongoDB's wire and storage format. It extends JSON with types like Date, ObjectId, Decimal128, BinData, and 32/64-bit integers. BSON is length-prefixed, making it fast to traverse without parsing, and supports efficient in-place updates. The maximum document size is 16 MB; for larger payloads, GridFS splits data across chunks.",
    "Schema flexibility does not mean schema-less. Production systems enforce schemas via MongoDB's JSON Schema validation, application-level validation (Mongoose, Joi), or CouchDB's validate_doc_update functions. The flexibility lies in evolution: adding a field to new documents does not require a migration or ALTER TABLE — old documents simply lack the field, and application code handles both shapes.",
    "Embedding vs. referencing is the fundamental modeling decision. Embed when: data is accessed together (1:1 or 1:few), sub-documents are not entities in their own right, and the combined document stays under 16 MB. Reference when: data has independent lifecycles, relationships are many-to-many, or sub-collections grow unboundedly. Hybrid approaches embed frequently-read fields and reference the full related entity.",
    "MongoDB's aggregation pipeline processes documents through a sequence of stages — $match, $group, $project, $lookup, $unwind, $sort, $limit — enabling SQL-equivalent analytics without leaving the database. Each stage transforms the document stream, and the engine optimizes stage ordering (e.g., pushing $match before $project). The pipeline supports window functions ($setWindowFields), graph traversal ($graphLookup), and writing results to new collections ($merge, $out).",
    "Replica sets provide high availability: a primary node accepts writes, and secondaries asynchronously replicate the oplog. If the primary fails, an automatic election promotes a secondary within seconds. Read preferences let applications route reads to secondaries for geographic locality or load distribution, at the cost of potentially stale data.",
    "Sharding distributes data across shards using a shard key. Range-based sharding supports efficient range queries but risks hot spots; hashed sharding distributes writes evenly but scatters range queries. A good shard key has high cardinality, even distribution, and supports the dominant query pattern. Changing a shard key after deployment is expensive (resharding), so this decision deserves upfront analysis.",
    "CouchDB uses MVCC: updates create new document revisions rather than overwriting. This eliminates read locks and enables conflict-free replication — when two nodes independently update the same document, CouchDB deterministically picks a winner and preserves the losing revision for application-level resolution. Views are precomputed B-tree indexes defined by JavaScript MapReduce functions.",
  ],
  deepDive: [
    "MongoDB's WiredTiger storage engine uses a combination of B-tree indexes for data access and a write-ahead journal for durability. It compresses data and indexes on disk (snappy by default, zstd and zlib also available). Each document operation acquires a document-level lock (not collection-level), enabling high concurrency. WiredTiger checkpoints flush dirty pages every 60 seconds, and the journal syncs every 50ms (or every commit with j:true write concern).",
    "The oplog is a capped collection on the primary that records every write operation. Secondaries tail the oplog to replicate changes. The oplog window — the time range covered by the oplog — determines how long a secondary can be offline and still catch up without a full resync. Monitoring oplog window size is critical for operational health.",
    "Change streams, built on the oplog, provide a real-time event feed of data changes without polling. Applications subscribe to insert, update, replace, and delete events at the collection, database, or deployment level. Change streams are resumable: the application stores a resume token and, on reconnection, receives events from where it left off. This underpins event-driven architectures and CDC (Change Data Capture) pipelines.",
    "MongoDB transactions (multi-document ACID since 4.0, cross-shard since 4.2) use snapshot isolation. A transaction reads from a consistent snapshot and writes to a private side table. On commit, the engine checks for write conflicts (optimistic concurrency). Transactions have a default 60-second time limit and should be kept short. The majority of MongoDB workloads are designed to avoid transactions by embedding related data, using transactions only for cross-collection consistency requirements.",
    "CouchDB's replication protocol is a sophisticated incremental algorithm. It compares revision trees between source and target, transfers only missing revisions, and handles conflicts deterministically. The _changes feed is the foundation: it provides a sequential, resumable list of all document changes. This protocol works over plain HTTP, making CouchDB suitable for edge nodes, mobile devices (PouchDB), and intermittently connected environments.",
  ],
  code: [
    {
      language: "javascript",
      caption: "MongoDB CRUD operations",
      source: `// Insert a document
db.products.insertOne({
  name: "Mechanical Keyboard",
  price: 149.99,
  category: "peripherals",
  specs: {
    switches: "Cherry MX Blue",
    layout: "TKL",
    connectivity: ["USB-C", "Bluetooth"]
  },
  tags: ["mechanical", "wireless", "rgb"],
  createdAt: new Date()
});

// Find with query operators
db.products.find({
  price: { $gte: 100, $lte: 200 },
  "specs.connectivity": "Bluetooth",
  tags: { $in: ["mechanical", "membrane"] }
}).sort({ price: 1 }).limit(10);

// Update with operators
db.products.updateOne(
  { name: "Mechanical Keyboard" },
  {
    $set: { price: 129.99 },
    $addToSet: { tags: "sale" },
    $inc: { "stats.views": 1 }
  }
);

// Upsert — insert if not found
db.products.updateOne(
  { sku: "KB-2024-BLU" },
  { $setOnInsert: { createdAt: new Date() },
    $set: { price: 129.99, name: "Mechanical Keyboard" } },
  { upsert: true }
);`
    },
    {
      language: "javascript",
      caption: "Aggregation pipeline: revenue by category with running totals",
      source: `db.orders.aggregate([
  // Stage 1: Filter to completed orders in the last 90 days
  { $match: {
    status: "completed",
    orderDate: { $gte: new Date(Date.now() - 90 * 86400000) }
  }},

  // Stage 2: Unwind line items
  { $unwind: "$items" },

  // Stage 3: Lookup product details
  { $lookup: {
    from: "products",
    localField: "items.productId",
    foreignField: "_id",
    as: "product"
  }},
  { $unwind: "$product" },

  // Stage 4: Group by category
  { $group: {
    _id: "$product.category",
    totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.unitPrice"] } },
    orderCount: { $sum: 1 },
    avgOrderValue: { $avg: { $multiply: ["$items.qty", "$items.unitPrice"] } }
  }},

  // Stage 5: Sort by revenue descending
  { $sort: { totalRevenue: -1 } },

  // Stage 6: Add running total with window function
  { $setWindowFields: {
    sortBy: { totalRevenue: -1 },
    output: {
      runningTotal: {
        $sum: "$totalRevenue",
        window: { documents: ["unbounded", "current"] }
      }
    }
  }},

  // Stage 7: Reshape output
  { $project: {
    category: "$_id",
    totalRevenue: { $round: ["$totalRevenue", 2] },
    orderCount: 1,
    avgOrderValue: { $round: ["$avgOrderValue", 2] },
    runningTotal: { $round: ["$runningTotal", 2] },
    _id: 0
  }}
]);`
    },
    {
      language: "javascript",
      caption: "MongoDB change stream for real-time CDC",
      source: `const pipeline = [
  { $match: {
    operationType: { $in: ["insert", "update", "replace"] },
    "fullDocument.status": "shipped"
  }}
];

const changeStream = db.orders.watch(pipeline, {
  fullDocument: "updateLookup"  // include full doc on updates
});

changeStream.on("change", (event) => {
  console.log("Order shipped:", event.fullDocument.orderId);
  console.log("Operation:", event.operationType);
  console.log("Resume token:", event._id);
  // Forward to notification service, analytics, etc.
});

// Resume after disconnect
const resumeToken = savedToken; // persisted from event._id
const resumed = db.orders.watch(pipeline, {
  resumeAfter: resumeToken,
  fullDocument: "updateLookup"
});`
    },
    {
      language: "javascript",
      caption: "CouchDB MapReduce view and Mango query",
      source: `// MapReduce view: revenue by month
// Design document: _design/analytics
{
  "views": {
    "revenue_by_month": {
      "map": function(doc) {
        if (doc.type === "order" && doc.status === "completed") {
          var d = new Date(doc.orderDate);
          var key = [d.getFullYear(), d.getMonth() + 1];
          emit(key, doc.total);
        }
      }.toString(),
      "reduce": "_sum"
    }
  }
}

// Query the view: revenue for 2024
// GET /shop/_design/analytics/_view/revenue_by_month
//   ?startkey=[2024,1]&endkey=[2024,12]&group_level=2

// Mango query (CouchDB 2.x+): declarative JSON queries
// POST /shop/_find
{
  "selector": {
    "type": "order",
    "status": "completed",
    "total": { "$gte": 100 }
  },
  "fields": ["_id", "customer", "total", "orderDate"],
  "sort": [{ "total": "desc" }],
  "limit": 25
}`
    },
    {
      language: "javascript",
      caption: "Schema validation in MongoDB",
      source: `db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        name: {
          bsonType: "object",
          required: ["first", "last"],
          properties: {
            first: { bsonType: "string", minLength: 1 },
            last: { bsonType: "string", minLength: 1 }
          }
        },
        role: {
          enum: ["admin", "editor", "viewer"],
          description: "Must be a valid role"
        },
        loginHistory: {
          bsonType: "array",
          maxItems: 100,
          items: {
            bsonType: "object",
            properties: {
              timestamp: { bsonType: "date" },
              ip: { bsonType: "string" }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});`
    },
  ],
  diagrams: [
    {
      title: "MongoDB replica set architecture",
      kind: "architecture",
      caption: "Primary accepts writes; secondaries replicate the oplog asynchronously. An arbiter participates in elections but holds no data.",
    },
    {
      title: "Sharded cluster topology",
      kind: "architecture",
      caption: "mongos routers direct queries to the correct shard based on the shard key. Config servers store metadata and chunk mappings.",
    },
    {
      title: "Document embedding vs. referencing decision flow",
      kind: "flow",
      caption: "Decision tree: access patterns, data size, update frequency, and relationship cardinality determine whether to embed or reference.",
    },
    {
      title: "CouchDB multi-master replication",
      kind: "sequence",
      caption: "Two CouchDB nodes independently accept writes, then replicate changes bidirectionally using the _changes feed and revision trees.",
    },
  ],
  animations: [
    {
      title: "MongoDB write path with journaling",
      steps: [
        { label: "Client sends write", detail: "The driver sends an insert/update/delete command to the primary node." },
        { label: "WiredTiger journal", detail: "The operation is written to the in-memory journal buffer. Every 50ms (or on j:true), the journal is fsynced to disk." },
        { label: "In-memory B-tree update", detail: "WiredTiger updates the in-memory B-tree pages for the collection and affected indexes." },
        { label: "Checkpoint", detail: "Every 60 seconds, WiredTiger writes all dirty pages to the data files on disk." },
        { label: "Oplog entry", detail: "The write is recorded in the oplog (local.oplog.rs), a capped collection that secondaries tail for replication." },
        { label: "Write concern acknowledgment", detail: "Based on the write concern (w:1, w:majority), the primary waits for the appropriate number of replicas to confirm before acknowledging the client." },
      ],
    },
    {
      title: "Aggregation pipeline execution",
      steps: [
        { label: "$match", detail: "Filter documents early to reduce the volume flowing through subsequent stages. Uses indexes when possible." },
        { label: "$lookup + $unwind", detail: "Join with another collection and flatten arrays. The engine may reorder stages or use index-backed lookups." },
        { label: "$group", detail: "Accumulate values by a grouping key. Memory limit is 100 MB per stage; use allowDiskUse for larger datasets." },
        { label: "$sort", detail: "Sort the grouped results. If the sort matches an index, no in-memory sort is needed." },
        { label: "$project", detail: "Reshape documents, compute new fields, and exclude unnecessary ones to minimize data transfer." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "MongoDB", "CouchDB", "Amazon DocumentDB"],
    rows: [
      ["Data format", "BSON (binary JSON)", "JSON", "BSON-compatible JSON"],
      ["Query language", "MQL (MongoDB Query Language)", "MapReduce + Mango (JSON)", "MongoDB-compatible API subset"],
      ["Replication", "Replica sets (single primary)", "Multi-master with conflict resolution", "6 copies across 3 AZs (managed)"],
      ["Scaling", "Sharding with configurable shard key", "Clustering (BigCouch/3.x)", "Managed auto-scaling"],
      ["Transactions", "Multi-document ACID (4.0+)", "Single-document atomic", "ACID transactions"],
      ["Consistency", "Tunable (write concern + read preference)", "Eventual (multi-master)", "Read-after-write on primary"],
      ["Change feed", "Change streams (oplog-based)", "_changes feed (sequence-based)", "Change streams (compatible)"],
      ["Max document size", "16 MB", "Configurable (default 4 GB with attachments)", "16 MB"],
      ["Ideal use case", "General-purpose, high-throughput apps", "Offline-first, edge sync, CMS", "AWS-native MongoDB-compatible workloads"],
    ],
  },
  interviewQA: [
    {
      q: "When would you embed data vs. reference it in MongoDB?",
      a: "Embed when data has a one-to-one or one-to-few relationship, is always accessed together, and the resulting document stays well under 16 MB. Reference when the related entity has an independent lifecycle, the relationship is many-to-many, or the sub-collection grows unboundedly. A common hybrid approach embeds frequently-read summary fields and stores a reference to the full related document.",
      followUps: [
        "How does the 16 MB document size limit influence your modeling decisions?",
        "What are the update implications of deeply nested embedded documents?",
      ],
    },
    {
      q: "Explain MongoDB's write concern and read preference. How do they affect consistency and performance?",
      a: "Write concern controls how many replica set members must acknowledge a write before the driver considers it successful. w:1 (default) waits only for the primary; w:majority waits for a majority of data-bearing members, providing durability against primary failover. j:true adds journal durability. Read preference controls where reads are routed: primary (default, strongly consistent), primaryPreferred, secondary (eventual consistency but reduced primary load), secondaryPreferred, or nearest (lowest latency). The combination of w:majority writes and primary reads gives the strongest consistency guarantee.",
      followUps: [
        "What happens to in-flight writes during a replica set election?",
        "How does the maxStalenessSeconds option work with secondary reads?",
      ],
    },
    {
      q: "How does MongoDB sharding work and how do you choose a shard key?",
      a: "Sharding partitions data across multiple shards. A mongos router uses the shard key to direct queries to the correct shard(s). The config servers store chunk-to-shard mappings. A good shard key has high cardinality, distributes writes evenly (avoids monotonic keys like auto-incrementing IDs), and supports common query patterns so most queries target a single shard (targeted queries) rather than broadcasting to all shards (scatter-gather). Common strategies include hashed keys for even distribution, compound keys for query affinity, and zone-based sharding for data locality requirements.",
    },
    {
      q: "How does CouchDB handle conflicts in multi-master replication?",
      a: "CouchDB stores all conflicting revisions in a revision tree. It deterministically picks a 'winner' using a consistent algorithm (longest revision path, then lexicographic comparison of revision hashes) so all replicas agree on the same winner without coordination. The losing revisions remain accessible. Applications are responsible for conflict resolution: they can read all conflicting revisions via the ?conflicts=true parameter and merge them into a new revision. This design prioritizes availability and partition tolerance over immediate consistency.",
    },
  ],
  mcqs: [
    {
      q: "What is the maximum document size in MongoDB?",
      options: ["4 MB", "8 MB", "16 MB", "64 MB"],
      answerIndex: 2,
      explanation: "MongoDB enforces a 16 MB maximum document size. For larger data, use GridFS which splits files across multiple chunks.",
    },
    {
      q: "Which MongoDB write concern guarantees a write survives a primary failover?",
      options: ["w: 0", "w: 1", "w: majority", "w: all"],
      answerIndex: 2,
      explanation: "w:majority ensures a majority of replica set members have acknowledged the write, so the data persists even if the primary fails and a new one is elected.",
    },
    {
      q: "In MongoDB's aggregation pipeline, what does the $unwind stage do?",
      options: [
        "Joins two collections",
        "Deconstructs an array field into one document per element",
        "Groups documents by a key",
        "Filters documents by a condition",
      ],
      answerIndex: 1,
      explanation: "$unwind takes a document with an array field and outputs one document for each element in the array, duplicating the non-array fields.",
    },
    {
      q: "How does CouchDB determine the winning revision in a conflict?",
      options: [
        "Last write wins based on timestamp",
        "The primary node's version wins",
        "Deterministic algorithm: longest revision path, then lexicographic hash comparison",
        "Application must always resolve conflicts manually before reads",
      ],
      answerIndex: 2,
      explanation: "CouchDB uses a deterministic algorithm so all replicas agree on the same winner without coordination. The longest revision path wins; ties are broken by lexicographic comparison of revision hashes.",
    },
    {
      q: "What is BSON?",
      options: [
        "A text-based JSON superset used only for MongoDB queries",
        "Binary JSON — MongoDB's wire and storage format with additional types",
        "A compression algorithm for JSON documents",
        "A schema definition language for document databases",
      ],
      answerIndex: 1,
      explanation: "BSON (Binary JSON) extends JSON with types like Date, ObjectId, Decimal128, and BinData. Its binary, length-prefixed format enables fast traversal and in-place updates.",
    },
  ],
  flashcards: [
    { front: "What format does MongoDB use for storage and wire protocol?", back: "BSON (Binary JSON) — a binary-encoded superset of JSON that adds types like Date, ObjectId, Decimal128, and supports length-prefixed traversal." },
    { front: "What is the role of the oplog in a MongoDB replica set?", back: "The oplog (operations log) is a capped collection on the primary that records every write. Secondaries tail it to replicate changes. Change streams are also built on the oplog." },
    { front: "What is a covered query in MongoDB?", back: "A query that can be answered entirely from an index without accessing documents. All queried and returned fields must be in the index. Confirmed by totalDocsExamined: 0 in explain()." },
    { front: "How does CouchDB's replication differ from MongoDB's?", back: "CouchDB uses multi-master replication: any node accepts writes, and conflicts are resolved deterministically. MongoDB uses single-primary replication: only the primary accepts writes, and secondaries replicate the oplog." },
    { front: "What is the aggregation pipeline's memory limit per stage?", back: "100 MB per stage by default. Use { allowDiskUse: true } to spill to disk for larger datasets." },
    { front: "What is GridFS?", back: "MongoDB's mechanism for storing files larger than 16 MB. It splits files into 255 KB chunks stored in fs.chunks and records metadata in fs.files." },
    { front: "What is a shard key and why is it hard to change?", back: "A shard key is the field(s) that determine how data is distributed across shards. Changing it requires resharding, which involves rewriting and redistributing all data — an expensive operation." },
  ],
  revisionNotes: [
    "Document stores trade normalization for read performance: embed related data to avoid joins, but accept update complexity and potential data duplication.",
    "MongoDB uses WiredTiger with document-level locking, B-tree indexes, snappy compression, and a write-ahead journal. Checkpoints every 60s, journal sync every 50ms.",
    "Write concern + read preference = consistency dial. w:majority + primary reads = strong consistency. w:1 + secondary reads = eventual consistency with lower latency.",
    "Aggregation pipeline stages are ordered but the optimizer can reorder them. $match early, $project to reduce document size, use allowDiskUse for large datasets.",
    "Sharding: high-cardinality, non-monotonic shard keys distribute data evenly. Compound shard keys balance distribution with query targeting. Hashed keys spread writes but lose range query efficiency.",
    "CouchDB's MVCC and deterministic conflict resolution make it ideal for offline-first and multi-datacenter deployments. PouchDB brings the same protocol to the browser.",
    "Change streams provide resumable, real-time event feeds — the foundation for event-driven architectures and CDC pipelines with MongoDB.",
  ],
  cheatSheet: [
    "db.collection.find({ field: value }) — basic query",
    "db.collection.find({ field: { $gte: 10, $lte: 50 } }) — range query",
    "db.collection.find({ tags: { $in: ['a', 'b'] } }) — match any in array",
    "db.collection.find({ 'nested.field': value }) — dot notation for nested fields",
    "db.collection.aggregate([{ $match }, { $group }, { $sort }]) — pipeline",
    "db.collection.createIndex({ field: 1 }) — ascending index",
    "db.collection.createIndex({ a: 1, b: -1 }) — compound index",
    "db.collection.explain('executionStats').find(...) — query plan analysis",
    "rs.status() — replica set status",
    "sh.status() — sharding status",
    "db.collection.watch() — open change stream",
    "mongodump / mongorestore — backup and restore",
    "curl http://host:5984/db/_changes?feed=continuous — CouchDB changes feed",
    "curl -X POST http://host:5984/db/_find -d '{\"selector\":{...}}' — CouchDB Mango query",
  ],
  exercises: [
    "Design a MongoDB schema for an **e-commerce product catalog** where each product has variants (color, size) with independent prices and stock levels. Decide whether to *embed* or *reference* variants, justify your choice based on access patterns, and write the `insertOne` command with sample data.",
    "Write a MongoDB **aggregation pipeline** that computes the *top 5 customers by total spend* in the last 90 days, including each customer's order count, average order value, and most frequently purchased category. Use `$match`, `$group`, `$sort`, and `$project` stages.",
    "You have a single-node MongoDB deployment showing **yellow cluster health** (replica cannot be placed). Set up a 3-member replica set with `w: majority` write concern. Describe the `rs.initiate()` configuration, explain what happens during a primary failover, and how *read preference* `secondaryPreferred` affects consistency.",
    "Implement a **change stream** listener in Node.js that watches an `orders` collection for documents transitioning to `status: 'shipped'`. The listener should persist a *resume token* to a file so it can recover after a crash. Include error handling for `ChangeStreamInvalidate` events.",
    "A CouchDB deployment has two nodes that independently updated the same document, creating a **conflict**. Write a script using CouchDB's HTTP API that fetches the document with `?conflicts=true`, reads both conflicting revisions, merges them using a *last-writer-wins* strategy based on a `updatedAt` timestamp, and deletes the losing revision.",
  ],
  resources: [
    { label: "MongoDB Manual", kind: "docs", note: "Official reference for all MongoDB features, operators, and best practices." },
    { label: "MongoDB University (free courses)", kind: "video", note: "Free self-paced courses covering development, administration, and aggregation." },
    { label: "CouchDB: The Definitive Guide", kind: "book", note: "Comprehensive guide to CouchDB architecture, replication, and MapReduce views." },
    { label: "Designing Data-Intensive Applications — Ch. 2 & 3", kind: "book", note: "Martin Kleppmann covers document model trade-offs and storage engine internals." },
    { label: "MongoDB Blog: Schema Design Patterns", kind: "article", note: "Series covering attribute pattern, bucket pattern, outlier pattern, and more." },
    { label: "PouchDB project", kind: "repo", note: "JavaScript database inspired by CouchDB that syncs — demonstrates the CouchDB replication protocol in the browser." },
  ],
  glossary: [
    { term: "BSON", definition: "Binary JSON — MongoDB's binary-encoded data format that extends JSON with additional types (Date, ObjectId, Decimal128) and supports length-prefixed traversal." },
    { term: "Oplog", definition: "Operations log — a capped collection on the primary that records every write operation. Secondaries tail it for replication; change streams are built on it." },
    { term: "Replica set", definition: "A group of MongoDB instances that maintain the same data set. One primary accepts writes; secondaries replicate asynchronously for high availability." },
    { term: "Shard key", definition: "The field(s) used to distribute data across shards in a sharded MongoDB cluster. Determines which shard stores which documents." },
    { term: "Write concern", definition: "A setting that controls how many replica set members must acknowledge a write before the driver reports success. Ranges from w:0 (fire-and-forget) to w:majority." },
    { term: "Aggregation pipeline", definition: "A framework for data processing in MongoDB where documents pass through a sequence of transformation stages ($match, $group, $project, $lookup, etc.)." },
    { term: "GridFS", definition: "MongoDB's specification for storing files larger than 16 MB by splitting them into chunks across two collections (fs.chunks and fs.files)." },
    { term: "MVCC", definition: "Multi-Version Concurrency Control — CouchDB's concurrency model where updates create new revisions rather than overwriting, enabling lock-free reads." },
    { term: "Mango query", definition: "CouchDB's declarative JSON-based query language (introduced in 2.x) that provides MongoDB-like query syntax as an alternative to MapReduce views." },
    { term: "Denormalization", definition: "Intentionally duplicating or embedding data to optimize read performance, trading storage efficiency and update complexity for fewer lookups." },
  ],
};
