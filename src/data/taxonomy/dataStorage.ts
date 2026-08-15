import type { Domain } from "../schema";

export const dataAndStorage: Domain[] = [
  {
    slug: "databases",
    title: "Databases",
    summary: "How data is stored, indexed, queried, and kept consistent at scale.",
    icon: "🗄️",
    group: "Data & Storage",
    categories: [
      {
        slug: "rdbms-fundamentals",
        title: "Relational Fundamentals",
        summary: "The model that still runs most of the world.",
        topics: [
          { slug: "relational-model", title: "The Relational Model", summary: "Tables, keys, and relationships.", level: "Beginner", tags: ["databases"], related: ["normalization", "sql-basics", "acid-transactions", "indexing", "joins"] },
          { slug: "normalization", title: "Normalization", summary: "Organizing data to reduce redundancy.", level: "Intermediate", tags: ["databases"], related: ["relational-model", "data-modeling-nosql", "indexing", "sql-basics", "query-optimization"] },
          { slug: "indexing", title: "Indexing & B-Trees", summary: "How databases find rows fast.", level: "Advanced", tags: ["databases", "performance"], contentReady: ["quick-summary", "detailed-explanation", "animations", "diagrams", "interview-qa"], related: ["query-optimization", "relational-model", "segment-tree-1d", "normalization", "replication-partitioning"] },
        ],
      },
      {
        slug: "transactions-and-scaling",
        title: "Transactions & Scaling",
        summary: "Correctness under concurrency, and growing beyond one box.",
        topics: [
          { slug: "acid-transactions", title: "ACID & Transactions", summary: "Atomicity, consistency, isolation, durability.", level: "Intermediate", tags: ["databases"], related: ["isolation-levels", "cap-theorem", "consistency-models", "replication-partitioning", "saga-pattern"] },
          { slug: "isolation-levels", title: "Isolation Levels & MVCC", summary: "The trade-offs between correctness and concurrency.", level: "Advanced", tags: ["databases"], related: ["acid-transactions", "race-conditions", "deadlocks", "concurrency-models-backend", "consistency-models"] },
          { slug: "replication-partitioning", title: "Replication & Partitioning", summary: "Copies for availability, shards for scale.", level: "Advanced", tags: ["databases", "scalability"], related: ["sharding", "cap-theorem", "consistency-models", "leader-election", "distributed-caching"] },
          { slug: "query-optimization", title: "Query Optimization", summary: "How the planner turns SQL into a fast plan.", level: "Advanced Concepts", tags: ["databases", "performance"], related: ["indexing", "normalization", "joins", "ctes-recursion", "window-functions"] },
        ],
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL",
    summary: "The declarative language for querying relational data.",
    icon: "📊",
    group: "Data & Storage",
    categories: [
      {
        slug: "sql-core",
        title: "Core SQL",
        summary: "Selecting, filtering, and joining.",
        topics: [
          { slug: "sql-basics", title: "SELECT, WHERE & ORDER BY", summary: "The everyday query shape.", level: "Beginner", tags: ["sql"], related: ["joins", "aggregation", "relational-model", "normalization", "indexing"] },
          { slug: "joins", title: "Joins", summary: "Combining rows across tables.", level: "Intermediate", tags: ["sql"], contentReady: ["quick-summary", "diagrams", "comparison", "interview-qa"], related: ["sql-basics", "aggregation", "relational-model", "normalization", "query-optimization"] },
          { slug: "aggregation", title: "Aggregation & GROUP BY", summary: "Summarizing sets of rows.", level: "Intermediate", tags: ["sql"], related: ["sql-basics", "joins", "window-functions", "ctes-recursion", "query-optimization"] },
        ],
      },
      {
        slug: "sql-advanced",
        title: "Advanced SQL",
        summary: "The features that separate power users.",
        topics: [
          { slug: "window-functions", title: "Window Functions", summary: "Calculations across related rows.", level: "Advanced", tags: ["sql"], related: ["aggregation", "ctes-recursion", "query-optimization", "joins", "normalization"] },
          { slug: "ctes-recursion", title: "CTEs & Recursive Queries", summary: "Readable and hierarchical queries.", level: "Advanced", tags: ["sql"], related: ["window-functions", "aggregation", "query-optimization", "recursion", "graph-databases"] },
        ],
      },
    ],
  },
  {
    slug: "nosql",
    title: "NoSQL",
    summary: "Non-relational databases for scale, flexibility, and specialized shapes.",
    icon: "🧬",
    group: "Data & Storage",
    categories: [
      {
        slug: "nosql-families",
        title: "The Families",
        summary: "The four major non-relational models.",
        topics: [
          { slug: "key-value-stores", title: "Key-Value Stores", summary: "The simplest, fastest model.", level: "Beginner", tags: ["nosql"], related: ["document-stores", "redis-data-structures", "caching-basics", "design-data-structures", "cap-and-nosql"] },
          { slug: "document-stores", title: "Document Stores", summary: "Schema-flexible JSON-like documents.", level: "Intermediate", tags: ["nosql"], related: ["key-value-stores", "wide-column", "data-modeling-nosql", "normalization", "cap-and-nosql"] },
          { slug: "wide-column", title: "Wide-Column Stores", summary: "Columns grouped into families for scale.", level: "Advanced", tags: ["nosql"], related: ["document-stores", "key-value-stores", "replication-partitioning", "data-modeling-nosql", "cap-and-nosql"] },
          { slug: "graph-databases", title: "Graph Databases", summary: "Relationships as first-class citizens.", level: "Advanced", tags: ["nosql", "graphs"], related: ["graph-theory", "bfs-traversal", "document-stores", "data-modeling-nosql", "ctes-recursion"] },
        ],
      },
      {
        slug: "nosql-tradeoffs",
        title: "Trade-offs",
        summary: "Choosing NoSQL wisely.",
        topics: [
          { slug: "cap-and-nosql", title: "CAP, BASE & Consistency", summary: "What you give up for availability and scale.", level: "Advanced", tags: ["nosql", "distributed"], related: ["cap-theorem", "consistency-models", "acid-transactions", "replication-partitioning", "consensus"] },
          { slug: "data-modeling-nosql", title: "NoSQL Data Modeling", summary: "Modeling around access patterns, not entities.", level: "Advanced", tags: ["nosql"], related: ["document-stores", "wide-column", "normalization", "relational-model", "aggregates"] },
        ],
      },
    ],
  },
  {
    slug: "caching",
    title: "Caching",
    summary: "Storing results close to where they're needed for speed and scale.",
    icon: "⚡",
    group: "Data & Storage",
    categories: [
      {
        slug: "caching-fundamentals",
        title: "Fundamentals & Strategies",
        summary: "Where caches live and how they're kept fresh.",
        topics: [
          { slug: "caching-basics", title: "Caching Fundamentals", summary: "Why, where, and what to cache.", level: "Beginner", tags: ["caching"], contentReady: ["quick-summary", "detailed-explanation", "animations", "interview-qa"], related: ["cache-strategies", "cache-invalidation", "redis-data-structures", "memory-hierarchy", "latency-throughput"] },
          { slug: "cache-strategies", title: "Cache Strategies", summary: "Cache-aside, write-through, write-behind.", level: "Intermediate", tags: ["caching"], related: ["caching-basics", "cache-invalidation", "distributed-caching", "consistency-models", "redis-patterns"] },
          { slug: "cache-invalidation", title: "Cache Invalidation", summary: "The famously hard problem of staleness.", level: "Advanced", tags: ["caching"], related: ["cache-strategies", "caching-basics", "consistency-models", "distributed-caching", "redis-patterns"] },
          { slug: "distributed-caching", title: "Distributed Caching", summary: "Consistent hashing and cache clusters.", level: "Advanced", tags: ["caching", "distributed"], related: ["cache-strategies", "cache-invalidation", "redis-cluster", "replication-partitioning", "consistency-models"] },
        ],
      },
    ],
  },
  {
    slug: "redis",
    title: "Redis",
    summary: "The in-memory data structure store used as cache, broker, and database.",
    icon: "🔺",
    group: "Data & Storage",
    categories: [
      {
        slug: "redis-core",
        title: "Core Redis",
        summary: "Data structures and how Redis is used.",
        topics: [
          { slug: "redis-data-structures", title: "Redis Data Structures", summary: "Strings, hashes, lists, sets, sorted sets, streams.", level: "Beginner", tags: ["redis"], related: ["redis-patterns", "caching-basics", "key-value-stores", "redis-persistence", "design-data-structures"] },
          { slug: "redis-persistence", title: "Persistence (RDB & AOF)", summary: "Keeping in-memory data durable.", level: "Intermediate", tags: ["redis"], related: ["redis-data-structures", "redis-cluster", "acid-transactions", "replication-partitioning", "fault-tolerance"] },
          { slug: "redis-patterns", title: "Redis Patterns", summary: "Rate limiting, locks, leaderboards, queues.", level: "Advanced", tags: ["redis"], related: ["redis-data-structures", "rate-limiting", "cache-strategies", "distributed-caching", "lock-free-programming"] },
          { slug: "redis-cluster", title: "Replication & Clustering", summary: "Scaling and high availability.", level: "Advanced", tags: ["redis", "scalability"], related: ["redis-persistence", "distributed-caching", "replication-partitioning", "sharding", "consensus"] },
        ],
      },
    ],
  },
  {
    slug: "elasticsearch",
    title: "Elasticsearch",
    summary: "Distributed search and analytics over the inverted index.",
    icon: "🔍",
    group: "Data & Storage",
    categories: [
      {
        slug: "elasticsearch-core",
        title: "Core Elasticsearch",
        summary: "Indexing and querying at scale.",
        topics: [
          { slug: "inverted-index", title: "The Inverted Index", summary: "The structure that makes full-text search fast.", level: "Intermediate", tags: ["elasticsearch", "search"], related: ["es-mapping", "es-querying", "design-data-structures", "indexing", "trie-template"] },
          { slug: "es-mapping", title: "Indexing & Mapping", summary: "Defining how documents are analyzed and stored.", level: "Intermediate", tags: ["elasticsearch"], related: ["inverted-index", "es-querying", "es-cluster", "normalization", "data-modeling-nosql"] },
          { slug: "es-querying", title: "Query DSL", summary: "Full-text, term, and compound queries.", level: "Advanced", tags: ["elasticsearch"], related: ["es-mapping", "inverted-index", "es-cluster", "query-optimization", "aggregation"] },
          { slug: "es-cluster", title: "Shards, Replicas & Scaling", summary: "How Elasticsearch distributes data.", level: "Advanced", tags: ["elasticsearch", "scalability"], related: ["es-querying", "es-mapping", "replication-partitioning", "sharding", "consensus"] },
        ],
      },
    ],
  },
];
