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
          { slug: "relational-model", title: "The Relational Model", summary: "Tables, keys, and relationships.", level: "Beginner", tags: ["databases"] },
          { slug: "normalization", title: "Normalization", summary: "Organizing data to reduce redundancy.", level: "Intermediate", tags: ["databases"] },
          { slug: "indexing", title: "Indexing & B-Trees", summary: "How databases find rows fast.", level: "Advanced", tags: ["databases", "performance"], contentReady: ["quick-summary", "detailed-explanation", "animations", "diagrams", "interview-qa"] },
        ],
      },
      {
        slug: "transactions-and-scaling",
        title: "Transactions & Scaling",
        summary: "Correctness under concurrency, and growing beyond one box.",
        topics: [
          { slug: "acid-transactions", title: "ACID & Transactions", summary: "Atomicity, consistency, isolation, durability.", level: "Intermediate", tags: ["databases"] },
          { slug: "isolation-levels", title: "Isolation Levels & MVCC", summary: "The trade-offs between correctness and concurrency.", level: "Advanced", tags: ["databases"] },
          { slug: "replication-partitioning", title: "Replication & Partitioning", summary: "Copies for availability, shards for scale.", level: "Advanced", tags: ["databases", "scalability"] },
          { slug: "query-optimization", title: "Query Optimization", summary: "How the planner turns SQL into a fast plan.", level: "Advanced Concepts", tags: ["databases", "performance"] },
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
          { slug: "sql-basics", title: "SELECT, WHERE & ORDER BY", summary: "The everyday query shape.", level: "Beginner", tags: ["sql"] },
          { slug: "joins", title: "Joins", summary: "Combining rows across tables.", level: "Intermediate", tags: ["sql"], contentReady: ["quick-summary", "diagrams", "comparison", "interview-qa"] },
          { slug: "aggregation", title: "Aggregation & GROUP BY", summary: "Summarizing sets of rows.", level: "Intermediate", tags: ["sql"] },
        ],
      },
      {
        slug: "sql-advanced",
        title: "Advanced SQL",
        summary: "The features that separate power users.",
        topics: [
          { slug: "window-functions", title: "Window Functions", summary: "Calculations across related rows.", level: "Advanced", tags: ["sql"] },
          { slug: "ctes-recursion", title: "CTEs & Recursive Queries", summary: "Readable and hierarchical queries.", level: "Advanced", tags: ["sql"] },
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
          { slug: "key-value-stores", title: "Key-Value Stores", summary: "The simplest, fastest model.", level: "Beginner", tags: ["nosql"] },
          { slug: "document-stores", title: "Document Stores", summary: "Schema-flexible JSON-like documents.", level: "Intermediate", tags: ["nosql"] },
          { slug: "wide-column", title: "Wide-Column Stores", summary: "Columns grouped into families for scale.", level: "Advanced", tags: ["nosql"] },
          { slug: "graph-databases", title: "Graph Databases", summary: "Relationships as first-class citizens.", level: "Advanced", tags: ["nosql", "graphs"] },
        ],
      },
      {
        slug: "nosql-tradeoffs",
        title: "Trade-offs",
        summary: "Choosing NoSQL wisely.",
        topics: [
          { slug: "cap-and-nosql", title: "CAP, BASE & Consistency", summary: "What you give up for availability and scale.", level: "Advanced", tags: ["nosql", "distributed"] },
          { slug: "data-modeling-nosql", title: "NoSQL Data Modeling", summary: "Modeling around access patterns, not entities.", level: "Advanced", tags: ["nosql"] },
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
          { slug: "caching-basics", title: "Caching Fundamentals", summary: "Why, where, and what to cache.", level: "Beginner", tags: ["caching"], contentReady: ["quick-summary", "detailed-explanation", "animations", "interview-qa"] },
          { slug: "cache-strategies", title: "Cache Strategies", summary: "Cache-aside, write-through, write-behind.", level: "Intermediate", tags: ["caching"] },
          { slug: "cache-invalidation", title: "Cache Invalidation", summary: "The famously hard problem of staleness.", level: "Advanced", tags: ["caching"] },
          { slug: "distributed-caching", title: "Distributed Caching", summary: "Consistent hashing and cache clusters.", level: "Advanced", tags: ["caching", "distributed"] },
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
          { slug: "redis-data-structures", title: "Redis Data Structures", summary: "Strings, hashes, lists, sets, sorted sets, streams.", level: "Beginner", tags: ["redis"] },
          { slug: "redis-persistence", title: "Persistence (RDB & AOF)", summary: "Keeping in-memory data durable.", level: "Intermediate", tags: ["redis"] },
          { slug: "redis-patterns", title: "Redis Patterns", summary: "Rate limiting, locks, leaderboards, queues.", level: "Advanced", tags: ["redis"] },
          { slug: "redis-cluster", title: "Replication & Clustering", summary: "Scaling and high availability.", level: "Advanced", tags: ["redis", "scalability"] },
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
          { slug: "inverted-index", title: "The Inverted Index", summary: "The structure that makes full-text search fast.", level: "Intermediate", tags: ["elasticsearch", "search"] },
          { slug: "es-mapping", title: "Indexing & Mapping", summary: "Defining how documents are analyzed and stored.", level: "Intermediate", tags: ["elasticsearch"] },
          { slug: "es-querying", title: "Query DSL", summary: "Full-text, term, and compound queries.", level: "Advanced", tags: ["elasticsearch"] },
          { slug: "es-cluster", title: "Shards, Replicas & Scaling", summary: "How Elasticsearch distributes data.", level: "Advanced", tags: ["elasticsearch", "scalability"] },
        ],
      },
    ],
  },
];
