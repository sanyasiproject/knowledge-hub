import type { TopicContent } from "../types";

export const dataModelingNosql: TopicContent = {
  quickSummary: [
    "NoSQL data modeling is driven by access patterns, not entity relationships. You design your schema around the queries your application will run, not the shape of your domain objects.",
    "Embedding (denormalization) is the default strategy: nest related data inside a single document to enable single-read access. Reference (normalization) when data is unbounded, updated independently, or accessed separately.",
    "DynamoDB single-table design pushes this to the extreme: all entity types share one table, using composite keys and overloaded indexes to serve every access pattern with a single query.",
  ],
  detailed: [
    "In relational databases, you normalize first and optimize later. In NoSQL, you start with a list of access patterns and design backward from there. Every collection, partition key, and index exists to serve a specific query. If no query needs a piece of data in a particular shape, that shape should not exist.",
    "Embedding means storing related data inside a parent document. A blog post document might embed its comments array. This eliminates joins and guarantees that reading a post with its comments is a single I/O operation. The trade-off is document size (MongoDB has a 16 MB limit), write amplification when embedded data changes frequently, and the impossibility of querying embedded entities independently without additional indexes.",
    "Referencing stores a foreign key (ObjectId or string) and requires a second query or application-level join. Use referencing when the child entity is unbounded (e.g., an event log), when it changes independently and frequently, when it needs to be queried on its own, or when it is shared across multiple parents (many-to-many).",
    "Denormalization means duplicating data across documents to avoid reads. For example, storing the author name on every blog post document instead of looking up the user document. The cost is that updates must fan out to every copy. This is acceptable when reads vastly outnumber writes and the duplicated data changes infrequently.",
    "One-to-many relationships have three sub-patterns depending on cardinality: one-to-few (embed the array), one-to-many (embed an array of references or use a parent reference on the child), and one-to-squillions (always use a parent reference on the child, never an array on the parent).",
    "Many-to-many in NoSQL is handled by either embedding an array of IDs on both sides (with application-level consistency), using an adjacency list pattern (a junction document/item), or in DynamoDB by using inverted indexes where the same data is written with PK and SK swapped.",
    "DynamoDB single-table design stores all entity types (users, orders, order items) in one table with a generic partition key (PK) and sort key (SK). Access patterns are served by overloading these keys and using Global Secondary Indexes (GSIs) with similarly overloaded keys. This minimizes the number of tables and GSIs while serving all queries with single GetItem or Query calls.",
  ],
  deepDive: [
    "The Subset Pattern addresses the 16 MB document limit and working set problems. Instead of embedding all reviews on a product, embed only the most recent 10 reviews and store the full set in a separate collection. This keeps the hot document small while still allowing a single read for the common case (showing a product page with recent reviews).",
    "The Computed Pattern pre-computes aggregations at write time. Instead of counting all orders for a user on every read, maintain a totalOrders counter on the user document and increment it on each order insert. This trades write complexity for read performance and is essential at scale.",
    "The Bucket Pattern groups time-series or event data into fixed-size buckets. Instead of one document per sensor reading, store one document per hour with an array of readings. This reduces document count, index size, and query overhead for range scans.",
    "DynamoDB single-table design requires careful key design. A common pattern uses PK=ENTITY#id and SK=METADATA for the main item, and PK=ENTITY#id SK=RELATED#timestamp for related items. GSI1 might invert this for the reverse access pattern. The key insight is that a DynamoDB Query returns items sharing the same partition key, sorted by sort key, so you model one-to-many relationships as items sharing a PK with different SK prefixes.",
    "Write sharding in DynamoDB prevents hot partitions. If a single partition key (e.g., a popular product) receives too many writes, append a random suffix (product#123#3) and scatter writes across multiple partitions. Reads must then query all suffixes and merge results. This is the standard pattern for counters and high-write entities.",
  ],
  code: [
    {
      language: "javascript",
      caption: "MongoDB: Embedding vs Referencing patterns",
      source: `// === EMBEDDING (one-to-few) ===
// Good when comments are bounded and always read with the post
const blogPost = {
  _id: ObjectId("post1"),
  title: "NoSQL Data Modeling",
  author: { name: "Alice", avatar: "/img/alice.png" }, // denormalized
  comments: [
    { user: "Bob", text: "Great post!", createdAt: new Date("2024-01-15") },
    { user: "Carol", text: "Very helpful", createdAt: new Date("2024-01-16") },
  ],
};
// Single read gets everything:
db.posts.findOne({ _id: "post1" });

// === REFERENCING (one-to-many / one-to-squillions) ===
// Event log: unbounded, queried independently
const sensorReading = {
  _id: ObjectId("reading1"),
  sensorId: ObjectId("sensor42"),   // parent reference
  temperature: 22.5,
  timestamp: new Date("2024-01-15T10:30:00Z"),
};
// Query child documents by parent:
db.readings.find({ sensorId: "sensor42" }).sort({ timestamp: -1 }).limit(100);

// === MANY-TO-MANY with array of references ===
const student = {
  _id: "student1",
  name: "Dave",
  enrolledCourses: ["course1", "course2", "course3"],
};
const course = {
  _id: "course1",
  title: "Databases 101",
  enrolledStudents: ["student1", "student5", "student9"],
};
// Application must update both sides on enrollment changes`,
    },
    {
      language: "javascript",
      caption: "MongoDB: Subset and Computed patterns",
      source: `// === SUBSET PATTERN ===
// Product document embeds only the 5 most recent reviews
const product = {
  _id: "prod1",
  name: "Mechanical Keyboard",
  price: 149.99,
  recentReviews: [
    { user: "Alice", rating: 5, text: "Love it!", date: new Date() },
    // ... up to 5 most recent
  ],
  reviewCount: 342,
  avgRating: 4.6,
};
// Full reviews live in a separate collection
db.reviews.find({ productId: "prod1" }).sort({ date: -1 }).skip(5);

// === COMPUTED PATTERN ===
// Increment counters at write time instead of counting at read time
await db.users.updateOne(
  { _id: userId },
  {
    $inc: { totalOrders: 1, totalSpent: orderAmount },
    $set: { lastOrderDate: new Date() },
  }
);
// Read is now a simple findOne, no aggregation needed
const stats = await db.users.findOne(
  { _id: userId },
  { projection: { totalOrders: 1, totalSpent: 1, lastOrderDate: 1 } }
);`,
    },
    {
      language: "typescript",
      caption: "DynamoDB single-table design with composite keys",
      source: `import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = "AppTable";

// === WRITE: Create a user and their orders in one table ===
// User item
await client.send(new PutCommand({
  TableName: TABLE,
  Item: {
    PK: "USER#user123",
    SK: "METADATA",
    name: "Alice",
    email: "alice@example.com",
    GSI1PK: "USER#user123",    // GSI for alternate access patterns
    GSI1SK: "METADATA",
  },
}));

// Order item (same table, shares PK with user)
await client.send(new PutCommand({
  TableName: TABLE,
  Item: {
    PK: "USER#user123",
    SK: "ORDER#2024-01-15#order456",
    orderId: "order456",
    total: 79.99,
    status: "shipped",
    GSI1PK: "ORDER#order456",    // lets us query order by ID
    GSI1SK: "USER#user123",      // inverted index
  },
}));

// === READ: Get user with all their orders (one Query) ===
const result = await client.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: "PK = :pk",
  ExpressionAttributeValues: { ":pk": "USER#user123" },
}));
// result.Items contains the user metadata + all orders, sorted by SK

// === READ: Get orders by date range ===
const recentOrders = await client.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: "PK = :pk AND SK BETWEEN :start AND :end",
  ExpressionAttributeValues: {
    ":pk": "USER#user123",
    ":start": "ORDER#2024-01-01",
    ":end": "ORDER#2024-12-31",
  },
}));`,
    },
    {
      language: "typescript",
      caption: "DynamoDB write sharding for hot partitions",
      source: `// Problem: A viral product page gets thousands of view-count increments/sec
// Solution: Scatter writes across N shards, aggregate on read

const SHARD_COUNT = 10;

async function incrementViewCount(productId: string): Promise<void> {
  const shard = Math.floor(Math.random() * SHARD_COUNT);
  await client.send(new PutCommand({
    TableName: TABLE,
    Item: {
      PK: \`PRODUCT#\${productId}\`,
      SK: \`VIEWCOUNT#\${shard}\`,
      count: 1,
    },
    // Use ADD to atomically increment
  }));
}

async function getViewCount(productId: string): Promise<number> {
  const result = await client.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
    ExpressionAttributeValues: {
      ":pk": \`PRODUCT#\${productId}\`,
      ":prefix": "VIEWCOUNT#",
    },
  }));
  return (result.Items ?? []).reduce((sum, item) => sum + (item.count ?? 0), 0);
}`,
    },
  ],
  diagrams: [
    {
      title: "Embedding vs Referencing Decision Tree",
      kind: "flow",
      caption: "Choose embedding when data is bounded, co-read, and rarely changes. Choose referencing when data is unbounded, queried independently, or shared across multiple parents.",
      mermaid: `flowchart TD
    A[Start: Model Relationship] --> B{Data bounded in size?}
    B -->|No - unbounded| R[Use Referencing]
    B -->|Yes| C{Always read together?}
    C -->|No - queried independently| R
    C -->|Yes| D{Shared across multiple parents?}
    D -->|Yes| R
    D -->|No| E{Updated frequently?}
    E -->|Yes - high write churn| R
    E -->|No| M[Use Embedding]
    M --> M1[Single document read]
    R --> R1[Separate documents with ID refs]`,
    },
    {
      title: "DynamoDB Single-Table Design",
      kind: "architecture",
      caption: "All entity types stored in one table using overloaded composite PK and SK keys. GSIs serve additional access patterns.",
      mermaid: `graph LR
    subgraph Table ["DynamoDB Table"]
        Row1["PK: USER#u1 | SK: METADATA"]
        Row2["PK: USER#u1 | SK: ORDER#2024-01"]
        Row3["PK: USER#u1 | SK: ORDER#2024-02"]
        Row4["PK: PRODUCT#p1 | SK: METADATA"]
    end
    subgraph GSI ["GSI1 - Inverted Index"]
        G1["GSI1PK: ORDER#2024-01 | GSI1SK: USER#u1"]
        G2["GSI1PK: ORDER#2024-02 | GSI1SK: USER#u1"]
    end
    Row2 -.-> G1
    Row3 -.-> G2`,
    },
    {
      title: "NoSQL Data Model Types",
      kind: "mindmap",
      caption: "The four main NoSQL data model families and their typical use cases and representative databases.",
      mermaid: `mindmap
  root[NoSQL Models]
    Document
      Nested JSON objects
      MongoDB, Firestore
      Flexible schema
      Rich query support
    Key-Value
      Simple get and set
      Redis, DynamoDB
      High throughput
      Limited query patterns
    Wide-Column
      Sparse column families
      Cassandra, HBase
      Time-series, analytics
      Partition key critical
    Graph
      Nodes and edges
      Neo4j, Amazon Neptune
      Relationship queries
      Social networks`,
    },
    {
      title: "One-to-Many Relationship Patterns in MongoDB",
      kind: "flow",
      caption: "Three sub-patterns based on cardinality: one-to-few uses embedding, one-to-many uses reference arrays or parent refs, one-to-squillions uses only parent refs.",
      mermaid: `flowchart TD
    A[One-to-Many Relationship] --> B{Cardinality?}
    B -->|Few items 1-10| C[Embed array in parent document]
    B -->|Many items 10-1000| D{Access pattern?}
    B -->|Squillions 1000+| G[Parent ref on child document]
    D -->|Mostly from parent| E[Array of child IDs in parent]
    D -->|Mostly from child| F[Parent ref on each child]
    C --> C1[Single read for parent and children]
    E --> E1[Query parent then fetch IDs]
    F --> F1[Index on parentId field]
    G --> G1[Query by parentId with index]`,
    },
  ],
  animations: [
    {
      title: "DynamoDB Query on a Single Table",
      steps: [
        { label: "Identify access pattern", detail: "We need to get a user and all their orders. The access pattern is: given a userId, return user metadata and order history." },
        { label: "Design composite key", detail: "PK = USER#userId for both user and order items. SK = METADATA for the user, SK = ORDER#date#orderId for each order." },
        { label: "Execute Query", detail: "A single Query with PK = USER#user123 returns all items: the user metadata item (SK=METADATA) followed by all order items (SK=ORDER#...) sorted by date." },
        { label: "Client-side separation", detail: "The application separates the results: items where SK=METADATA become the user object, items where SK begins with ORDER# become the orders array." },
      ],
    },
    {
      title: "Many-to-Many with Inverted Index",
      steps: [
        { label: "Write the forward direction", detail: "Store PK=STUDENT#s1 SK=COURSE#c1. This lets us query all courses for a student." },
        { label: "Overload GSI keys", detail: "Set GSI1PK=COURSE#c1 GSI1SK=STUDENT#s1. The GSI now supports the reverse query." },
        { label: "Query forward (student courses)", detail: "Query main table: PK=STUDENT#s1, SK begins_with COURSE# returns all courses for student s1." },
        { label: "Query reverse (course students)", detail: "Query GSI1: GSI1PK=COURSE#c1, GSI1SK begins_with STUDENT# returns all students in course c1." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Embedding", "Referencing"],
    rows: [
      ["Read performance", "Single read, no joins", "Multiple reads or application-level join"],
      ["Write performance", "May rewrite large documents", "Update only the changed document"],
      ["Data duplication", "Data is duplicated (denormalized)", "No duplication (normalized)"],
      ["Document size", "Can grow unbounded if not careful", "Each document stays small"],
      ["Consistency", "Atomic within one document", "Requires multi-document transactions or app logic"],
      ["Query flexibility", "Limited to parent document queries", "Each entity independently queryable"],
      ["Best for", "Bounded, co-accessed, rarely changing data", "Unbounded, independently accessed, frequently changing data"],
    ],
  },
  interviewQA: [
    {
      q: "How do you decide between embedding and referencing in MongoDB?",
      a: "Start by listing your access patterns. If related data is always read together, bounded in size, and changes infrequently, embed it. If data is unbounded, queried independently, updated frequently, or shared across multiple parents, use references. The 16 MB document limit is a hard constraint. Also consider write patterns: embedding causes the entire document to be rewritten on updates to any nested field.",
      followUps: [
        "What happens when an embedded array grows beyond the 16 MB limit?",
        "How does MongoDB handle updates to deeply nested embedded documents?",
        "When would you use both embedding and referencing in the same document?",
      ],
    },
    {
      q: "Explain DynamoDB single-table design and when you would use it.",
      a: "Single-table design stores all entity types in one DynamoDB table using overloaded composite keys (PK and SK). Related entities share the same PK so a single Query retrieves them all. GSIs with overloaded keys serve additional access patterns. Benefits: fewer tables to manage, all related data retrieved in one query, reduced GSI count. Drawbacks: harder to understand the schema, complex key design, GSI projections become tricky. Use it when you have well-defined access patterns, need minimal latency, and can invest in upfront schema design. Avoid it for ad-hoc querying or rapidly changing access patterns.",
      followUps: [
        "How do you handle a new access pattern that was not anticipated in the original design?",
        "What are the limits on GSI count and how do you work around them?",
      ],
    },
    {
      q: "How do you model many-to-many relationships in DynamoDB?",
      a: "Use the adjacency list pattern: create an item for each direction of the relationship with composite keys. For a student-course enrollment, write PK=STUDENT#s1 SK=COURSE#c1 and use a GSI with GSI1PK=COURSE#c1 GSI1SK=STUDENT#s1. The main table query gives you all courses for a student; the GSI query gives you all students in a course. Both queries are single-partition, single-digit millisecond operations. The cost is writing two key patterns per relationship and paying for GSI storage and write capacity.",
    },
    {
      q: "What is denormalization and when is it dangerous?",
      a: "Denormalization duplicates data across documents to avoid joins or multiple reads. For example, storing an author's name on every blog post instead of looking it up from a users collection. It is dangerous when the duplicated data changes frequently (you must update every copy), when consistency is critical (missed updates create stale data), or when storage cost matters (high-cardinality duplication). It is safe when duplicated data is immutable or near-immutable (country names, product SKUs) and reads vastly outnumber writes.",
    },
  ],
  followUps: [
    "Why do you design the access patterns before the schema here, and not after?",
    "What happens when a new access pattern arrives that the key design doesn't serve?",
    "How do you model a many-to-many relationship without joins?",
  ],
  mcqs: [
    {
      q: "In MongoDB, which pattern is best for a one-to-squillions relationship like log entries per server?",
      options: [
        "Embed all log entries in the server document",
        "Store an array of log entry IDs in the server document",
        "Store a server reference (serverId) on each log entry document",
        "Use a separate junction collection",
      ],
      answerIndex: 2,
      explanation: "With potentially millions of log entries per server, embedding is impossible (16 MB limit) and an ID array on the server document would be too large. The correct pattern is a parent reference: each log entry document contains the serverId, and you query log entries by serverId with an index.",
    },
    {
      q: "In DynamoDB single-table design, what is the primary purpose of overloading GSI keys?",
      options: [
        "To reduce storage costs",
        "To serve additional access patterns without creating more tables",
        "To enforce referential integrity",
        "To enable ACID transactions",
      ],
      answerIndex: 1,
      explanation: "GSI overloading means using the same GSI for multiple entity types by assigning different key prefixes (e.g., GSI1PK = ORDER#id for one pattern and GSI1PK = PRODUCT#id for another). This serves multiple access patterns from a single GSI, staying within DynamoDB's limit of 20 GSIs per table.",
    },
    {
      q: "What is the Bucket Pattern in document databases?",
      options: [
        "Grouping documents by hash into fixed partitions",
        "Storing time-series data in fixed-size document chunks (e.g., one document per hour)",
        "Distributing writes across random partition keys",
        "Caching frequently accessed documents in memory buckets",
      ],
      answerIndex: 1,
      explanation: "The Bucket Pattern groups granular data (like sensor readings or events) into documents representing a fixed time window (e.g., one document per sensor per hour). This reduces document count and index size while keeping range queries efficient.",
    },
    {
      q: "Which is NOT a valid reason to choose referencing over embedding in MongoDB?",
      options: [
        "The related data is queried independently of the parent",
        "The related data set is unbounded and could grow without limit",
        "The related data is always read together with the parent",
        "The related data changes frequently and independently",
      ],
      answerIndex: 2,
      explanation: "If related data is always read together with the parent, embedding is the better choice since it enables a single read operation. The other options are all valid reasons to prefer referencing.",
    },
  ],
  flashcards: [
    { front: "What drives NoSQL data model design?", back: "Access patterns (queries), not entity relationships. You design your schema around how data will be read and written." },
    { front: "MongoDB document size limit?", back: "16 MB per document. This constrains embedding and is why the Subset Pattern exists." },
    { front: "When should you embed vs reference?", back: "Embed: bounded data, always read together, rarely changes independently. Reference: unbounded, independently queried, frequently updated, or shared across parents." },
    { front: "What is the Subset Pattern?", back: "Embed only a subset (e.g., 10 most recent reviews) in the parent document. Store the full set in a separate collection. Optimizes the common read path." },
    { front: "DynamoDB single-table design: what are PK and SK used for?", back: "PK (partition key) groups related entities. SK (sort key) differentiates entity types and enables range queries. Example: PK=USER#123 SK=METADATA for user, SK=ORDER#date for orders." },
    { front: "How do you model many-to-many in DynamoDB?", back: "Adjacency list pattern: write an item for each direction. Use a GSI with inverted keys (GSI1PK=SK, GSI1SK=PK) to query the reverse direction." },
    { front: "What is write sharding in DynamoDB?", back: "Appending a random suffix to partition keys to spread writes across multiple partitions. Reads must scatter-gather across all shards and aggregate." },
    { front: "What is the Computed Pattern?", back: "Pre-compute aggregations (counts, sums, averages) at write time and store them on the document, avoiding expensive read-time aggregations." },
  ],
  revisionNotes: [
    "NoSQL = query-first design. Start with access patterns, design schema backward.",
    "Embed when: bounded, co-read, rarely changes. Reference when: unbounded, independent, frequently changes.",
    "One-to-few: embed array. One-to-many: reference array or parent ref. One-to-squillions: parent ref only.",
    "Many-to-many in DynamoDB: adjacency list + inverted GSI.",
    "Single-table design: all entities in one table, composite PK/SK, overloaded GSIs.",
    "Denormalization trade-off: faster reads vs. write fan-out and potential inconsistency.",
    "Subset Pattern: embed only recent/top-N items, full set in separate collection.",
    "Computed Pattern: maintain running aggregates at write time.",
    "Bucket Pattern: group time-series data into fixed-size documents.",
    "Write sharding: scatter hot-key writes across N shards, aggregate on read.",
  ],
  cheatSheet: [
    "Access patterns first, schema second.",
    "Embed = single read, but watch document size and write amplification.",
    "Reference = flexible, but costs extra reads.",
    "16 MB MongoDB doc limit. Use Subset Pattern for large embedded arrays.",
    "DynamoDB: PK groups entities, SK differentiates and sorts them.",
    "GSI overloading: reuse GSIs across entity types with key prefixes.",
    "Adjacency list + inverted GSI = many-to-many in DynamoDB.",
    "Denormalize immutable/slow-changing data. Never denormalize volatile data.",
    "Write sharding: PK#random_suffix to avoid hot partitions.",
    "Computed Pattern: $inc counters at write time, not $count at read time.",
  ],
  resources: [
    { label: "MongoDB Data Modeling Documentation", url: "https://www.mongodb.com/docs/", kind: "docs", note: "Official guide covering embedding, referencing, and schema design patterns." },
    { label: "Building with Patterns (MongoDB Blog Series)", kind: "article", note: "Covers Subset, Computed, Bucket, Outlier, and other advanced patterns." },
    { label: "The DynamoDB Book by Alex DeBrie", kind: "book", note: "The definitive guide to single-table design, access pattern modeling, and advanced DynamoDB patterns." },
    { label: "AWS re:Invent - Advanced Design Patterns for DynamoDB", kind: "video", note: "Rick Houlihan's talks on single-table design, adjacency lists, and GSI overloading." },
    { label: "Designing Data-Intensive Applications by Martin Kleppmann", url: "https://dataintensive.net/", kind: "book", note: "Chapter 2 covers data models and query languages, comparing relational, document, and graph models." },
    { label: "dynamodb-toolbox", kind: "repo", note: "TypeScript library that simplifies single-table design with entity definitions and mapped attributes." },
  ],
  glossary: [
    { term: "Access Pattern", definition: "A specific query or operation the application needs to perform. NoSQL schemas are designed around these patterns." },
    { term: "Embedding", definition: "Storing related data as nested sub-documents within a parent document. Enables single-read access at the cost of potential document bloat." },
    { term: "Referencing", definition: "Storing a foreign key (ID) instead of the full related document. Requires additional reads but keeps documents small and independent." },
    { term: "Denormalization", definition: "Intentionally duplicating data across documents to avoid joins or multiple reads. Trades write complexity for read performance." },
    { term: "Single-Table Design", definition: "A DynamoDB pattern where all entity types are stored in one table with composite keys, minimizing table and GSI count." },
    { term: "Partition Key (PK)", definition: "The primary hash key in DynamoDB that determines which partition stores the item. Items with the same PK are co-located." },
    { term: "Sort Key (SK)", definition: "The secondary key in DynamoDB that orders items within a partition. Enables range queries and entity type differentiation." },
    { term: "GSI (Global Secondary Index)", definition: "A DynamoDB index with a different partition key and sort key from the base table, enabling alternate query patterns." },
    { term: "Adjacency List", definition: "A pattern for modeling relationships in DynamoDB where each relationship is stored as an item with composite keys enabling bidirectional queries via GSIs." },
    { term: "Write Sharding", definition: "Distributing writes for a hot partition key across multiple shards by appending a random suffix, then aggregating on read." },
  ],

  exercises: [
    "You are modeling a **blog platform** in MongoDB with *users*, *posts*, *comments*, and *tags*. A user can have thousands of posts, each post can have thousands of comments, and tags are shared across posts (many-to-many). For each relationship, decide whether to **embed** or **reference** and justify your choice based on the *cardinality* (one-to-few, one-to-many, one-to-squillions). What happens to your design if comments need to be queried independently (e.g., *\"show all comments by user X across all posts\"*)?",
    "Design a **DynamoDB single-table schema** for a task management app with these access patterns: (1) get all tasks for a user, (2) get a specific task by ID, (3) get all tasks assigned to a team, (4) get tasks due today across all users. Define the `PK`, `SK`, and at least one `GSI` with overloaded keys. Write the `KeyConditionExpression` for each access pattern. What happens when a *new access pattern* is added later -- e.g., *\"get all overdue tasks sorted by priority\"*?",
    "A product catalog has 50,000 products, each with up to *10,000 reviews*. Using the **Subset Pattern**, design a MongoDB schema where the product document embeds the *10 most recent reviews* and the full review set lives in a separate `reviews` collection. Write the *aggregation pipeline* that updates the embedded subset when a new review is added. What is the trade-off between **read performance** (single document fetch) and **write complexity** (maintaining the subset)?",
    "Implement **write sharding** for a DynamoDB view counter on a viral product page receiving 10,000 increments/sec. Use `SHARD_COUNT = 10` and a random suffix on the partition key. Write the `incrementViewCount()` and `getViewCount()` functions. Calculate the *read amplification* (how many `Query` operations are needed to get the total count). How would you periodically **compact** the shards into a single counter to reduce read cost?",
    "Compare modeling a **social graph** (users following other users) in three NoSQL systems: (1) MongoDB with embedded arrays of follower IDs, (2) DynamoDB with an adjacency list and inverted GSI, and (3) Neo4j with `FOLLOWS` relationships. For each, write the query for *\"get all followers of user X who also follow user Y\"* (mutual followers). Analyze the **time complexity** and **scalability** of each approach when a user has 1 million followers."
  ],
};
