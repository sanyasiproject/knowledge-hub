import type { TopicContent } from "../types";

export const indexing: TopicContent = {
  quickSummary: [
    "An index is a separate data structure that maps column values to row locations, turning full-table scans into fast lookups — typically O(log n) instead of O(n).",
    "B+ trees are the dominant index structure in relational databases: balanced, sorted, and optimized for disk I/O with high fan-out and sequential leaf pointers.",
    "Indexes accelerate reads but slow writes and consume storage — choosing which columns to index is a critical design decision.",
  ],
  detailed: [
    "Without an index, the database must scan every row (sequential scan) to find matches. An index creates a sorted lookup structure so the engine can jump directly to relevant rows. The most common structure is the B+ tree, where internal nodes contain keys and child pointers, and all actual row pointers live in the leaf nodes. Leaf nodes are linked sequentially, enabling efficient range scans.",
    "A B+ tree with a branching factor of several hundred can index billions of rows in just 3-4 levels, meaning any lookup requires only 3-4 disk reads. The top levels are typically cached in memory, so in practice most lookups need just 1-2 disk reads. This is why B+ trees dominate: they minimize I/O, the bottleneck in database operations.",
    "Hash indexes use a hash function to map keys to buckets, providing O(1) point lookups but no range scan capability. They are useful for equality-only predicates (e.g., exact key lookups). PostgreSQL supports hash indexes; MySQL InnoDB uses an adaptive hash index internally on top of its B+ tree.",
    "Composite (multi-column) indexes store concatenated key values. The order of columns matters: an index on (a, b, c) supports queries on (a), (a, b), and (a, b, c), but not (b) or (c) alone. This is the leftmost prefix rule. Covering indexes include all columns needed by a query, allowing index-only scans that never touch the table data.",
  ],
  deepDive: [
    "B+ tree maintenance: inserts may cause leaf splits (and cascading splits up the tree), while deletes may cause merges. Frequent updates can lead to index bloat — pages that are only partially filled. PostgreSQL's VACUUM reclaims dead tuples but may leave fragmented indexes; REINDEX rebuilds them. Understanding page splits and fill factor helps tune write-heavy workloads.",
    "Partial indexes (CREATE INDEX ... WHERE condition) index only rows matching a predicate, reducing size and maintenance cost. Expression indexes (CREATE INDEX ... ON (lower(email))) index computed values. GiST and GIN indexes support full-text search, geometric data, and array containment. Choosing the right index type for the data and query pattern is as important as choosing which columns to index.",
  ],
  code: [
    {
      language: "sql",
      caption: "Creating and using indexes in PostgreSQL",
      source: `-- Basic B-tree index
CREATE INDEX idx_employees_dept ON employees(dept_id);

-- Composite index (leftmost prefix rule applies)
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);

-- Partial index: only index active users
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- Expression index: case-insensitive email lookup
CREATE INDEX idx_lower_email ON users(lower(email));

-- Covering index (INCLUDE columns for index-only scans)
CREATE INDEX idx_orders_covering ON orders(customer_id)
  INCLUDE (total, status);

-- Hash index (equality only, no range scans)
CREATE INDEX idx_sessions_hash ON sessions USING hash(session_token);`
    },
    {
      language: "sql",
      caption: "Analyzing index usage with EXPLAIN",
      source: `-- Check if an index is used
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42 AND order_date > '2024-01-01';

-- Expected output shows Index Scan or Index Only Scan
-- If you see Seq Scan, the optimizer chose not to use the index
-- (possibly because the table is small or selectivity is low)

-- Check index size and bloat
SELECT
  schemaname, tablename, indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;`
    },
  ],
  diagrams: [
    { title: "B+ tree structure", kind: "architecture", caption: "Internal nodes contain keys and child pointers; leaf nodes contain keys and row pointers, linked sequentially for range scans." },
    { title: "Index scan vs sequential scan decision", kind: "flow", caption: "Optimizer chooses index scan when selectivity is high (few matching rows) and sequential scan when most rows match." },
  ],
  animations: [
    {
      title: "B+ tree lookup for key = 42",
      steps: [
        { label: "Root node", detail: "Compare 42 against root keys [20, 60]. 42 falls between 20 and 60, so follow the middle child pointer." },
        { label: "Internal node", detail: "Compare 42 against keys [30, 45]. 42 falls between 30 and 45, follow the middle child." },
        { label: "Leaf node", detail: "Scan leaf node entries: [35, 38, 42, 44]. Find key 42 and follow its row pointer." },
        { label: "Fetch row", detail: "Use the row pointer (page number + offset) to read the actual data row from the table's heap storage." },
      ],
    },
  ],
  comparison: {
    columns: ["Index Type", "Lookup", "Range Scan", "Use Case", "Example DB Support"],
    rows: [
      ["B+ Tree", "O(log n)", "Yes (linked leaves)", "General purpose, most queries", "All major RDBMS"],
      ["Hash", "O(1) avg", "No", "Equality-only lookups", "PostgreSQL, MySQL (adaptive)"],
      ["GiST", "O(log n)", "Yes", "Geometric, full-text, range types", "PostgreSQL"],
      ["GIN", "O(log n)", "Varies", "Full-text search, arrays, JSONB", "PostgreSQL"],
      ["BRIN", "O(1) per range", "Yes", "Large naturally-ordered tables", "PostgreSQL"],
    ],
  },
  interviewQA: [
    {
      q: "Why does a composite index on (a, b, c) not help a query filtering only on column b?",
      a: "B+ trees store entries sorted by the concatenation of key columns in order. To find values of b, you would need to scan all entries regardless of a, defeating the purpose. The index can only be used when the query provides a prefix of the index columns: (a), (a, b), or (a, b, c). This is the leftmost prefix rule.",
      followUps: ["How can you make b independently searchable?", "What about a query on (a, c) — does it use the index?"],
    },
    {
      q: "What is an index-only scan and when does it occur?",
      a: "An index-only scan (or covering index scan) occurs when all columns needed by the query are present in the index itself, so the engine never needs to fetch the actual table row. This eliminates the random I/O of going from index to heap. In PostgreSQL, you can add extra columns with INCLUDE to make an index covering without affecting its sort order.",
      followUps: ["What is the visibility map's role in index-only scans?", "How does INCLUDE differ from adding columns to the index key?"],
    },
    {
      q: "When should you NOT add an index?",
      a: "Avoid indexing when: the table is small (sequential scan is faster), the column has very low selectivity (e.g., a boolean with 50/50 distribution), the table is write-heavy and reads are infrequent (indexes slow every INSERT/UPDATE/DELETE), or when you already have too many indexes causing bloat and maintenance overhead. Always measure with EXPLAIN ANALYZE rather than guessing.",
      followUps: ["How does selectivity affect index choice?", "What is index bloat and how do you fix it?"],
    },
  ],
  followUps: [
    "How do indexes interact with the query optimizer's cost model?",
    "What are the trade-offs of indexing JSONB columns?",
    "How does InnoDB's clustered index differ from PostgreSQL's heap?",
    "What is index-organized table (IOT) and when is it useful?",
  ],
  mcqs: [
    {
      q: "What is the typical time complexity of a B+ tree lookup?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answerIndex: 1,
      explanation: "B+ trees are balanced, so lookup traverses from root to leaf in O(log n) steps, where the base of the log is the branching factor (typically hundreds).",
    },
    {
      q: "Which index type supports range scans?",
      options: ["Hash index", "B+ tree index", "Both equally", "Neither"],
      answerIndex: 1,
      explanation: "B+ tree leaves are linked sequentially, enabling efficient range scans. Hash indexes only support equality lookups — there is no meaningful ordering of hash values.",
    },
    {
      q: "A covering index eliminates the need to:",
      options: ["Write to the index on INSERT", "Lock the table during reads", "Access the heap/table data pages", "Run VACUUM on the table"],
      answerIndex: 2,
      explanation: "A covering index contains all columns required by the query, so the engine can answer it entirely from the index without fetching the corresponding heap row.",
    },
  ],
  exercises: [
    "Create a composite index for a query: SELECT name, email FROM users WHERE country = 'US' AND city = 'NYC' ORDER BY name. Which column order is optimal?",
    "Use EXPLAIN ANALYZE on a query with and without an index. Compare the execution times and note the plan differences.",
    "Design an indexing strategy for a table with 100M rows that receives 90% reads (mostly by user_id and date range) and 10% writes.",
    "Identify cases in your application where a partial index would be more efficient than a full index.",
  ],
  flashcards: [
    { front: "What is the leftmost prefix rule?", back: "A composite index on (a, b, c) can be used for queries on (a), (a, b), or (a, b, c), but not (b), (c), or (b, c) alone." },
    { front: "Why are B+ trees preferred over B-trees for databases?", back: "B+ trees store all data pointers in leaf nodes (not internal nodes), giving higher fan-out in internal nodes and enabling sequential range scans via linked leaves." },
    { front: "What is a covering index?", back: "An index that includes all columns needed by a query, enabling index-only scans without accessing the table heap." },
    { front: "What is index selectivity?", back: "The ratio of distinct values to total rows. High selectivity (many distinct values) means the index narrows results well; low selectivity (few distinct values) makes it less useful." },
    { front: "What is a partial index?", back: "An index that only covers rows matching a WHERE predicate, reducing size and maintenance cost for queries that only need a subset of rows." },
  ],
  revisionNotes: [
    "B+ tree: balanced, sorted, leaf-linked. O(log n) lookup, supports range scans.",
    "Hash index: O(1) equality lookup, no range scans.",
    "Composite index: leftmost prefix rule. Order columns by selectivity and query patterns.",
    "Covering index: includes all query columns, enables index-only scans.",
    "Partial index: indexes subset of rows — smaller, faster, targeted.",
    "Indexes speed reads but slow writes (maintain on every INSERT/UPDATE/DELETE).",
    "EXPLAIN ANALYZE is your friend — always verify index usage empirically.",
  ],
  cheatSheet: [
    "CREATE INDEX idx ON t(col) — B-tree by default",
    "CREATE INDEX idx ON t(a, b, c) — composite, leftmost prefix rule",
    "CREATE INDEX idx ON t(a) INCLUDE (b, c) — covering index",
    "CREATE INDEX idx ON t(col) WHERE condition — partial index",
    "CREATE INDEX idx ON t(expression) — expression index",
    "USING hash | gist | gin | brin — alternative index types",
    "EXPLAIN ANALYZE SELECT ... — verify index usage",
    "REINDEX INDEX idx — rebuild a bloated index",
  ],
  resources: [
    { label: "Use The Index, Luke — Markus Winand", kind: "article", note: "The best free resource on SQL indexing. Covers B-trees, composite indexes, and query plans." },
    { label: "PostgreSQL Documentation — Indexes", kind: "docs", note: "Comprehensive reference for all PostgreSQL index types." },
    { label: "Database Internals — Alex Petrov", kind: "book", note: "Deep dive into B-tree variants, LSM trees, and storage engine internals." },
    { label: "Designing Data-Intensive Applications, Ch. 3", kind: "book", note: "Storage and retrieval — B-trees vs LSM trees." },
  ],
  glossary: [
    { term: "B+ tree", definition: "A balanced tree structure where internal nodes hold keys and pointers, and leaf nodes hold keys and row pointers linked sequentially." },
    { term: "Fan-out", definition: "The number of child pointers in a B-tree node — higher fan-out means fewer tree levels and fewer disk reads." },
    { term: "Selectivity", definition: "How well an index narrows results: high selectivity (many distinct values) is better for index efficiency." },
    { term: "Covering index", definition: "An index containing all columns needed by a query, enabling index-only scans." },
    { term: "Sequential scan", definition: "Reading every row in a table to find matches — efficient for small tables or low-selectivity queries." },
    { term: "Index bloat", definition: "Wasted space in an index due to page splits, deleted entries, or low fill factors." },
  ],
};
