import type { TopicContent } from "../types";

export const queryOptimization: TopicContent = {
  quickSummary: [
    "The query optimizer transforms a declarative SQL query into an efficient execution plan by evaluating access methods, join orders, and algorithms based on cost estimates.",
    "EXPLAIN ANALYZE is the primary tool for understanding and improving query performance — it shows the actual execution plan, row estimates, and timing.",
    "Key optimization techniques include proper indexing, predicate pushdown, join reordering, avoiding unnecessary work (SELECT *), and using materialized views for expensive aggregations.",
  ],
  detailed: [
    "When a query arrives, the database parses it into a syntax tree, validates it against the schema, and hands it to the optimizer. The optimizer generates candidate execution plans and estimates each plan's cost using table statistics (row counts, value distributions, index correlation). It chooses the plan with the lowest estimated cost. This is called cost-based optimization (CBO), and its accuracy depends entirely on the quality of statistics — stale stats produce bad plans.",
    "Join ordering is one of the most impactful optimization decisions. For N tables, there are N! possible join orders. The optimizer uses dynamic programming or heuristics to prune the search space. Choosing the right join order can mean the difference between milliseconds and minutes. The three main join algorithms are nested loop (good for small tables or indexed lookups), hash join (good for large unsorted tables with equality joins), and merge join (good for pre-sorted data or when both sides can be efficiently sorted).",
    "Predicate pushdown moves filter conditions as close to the data source as possible — filtering rows before joins rather than after. The optimizer does this automatically, but complex views, subqueries, or functions can prevent it. Query rewriting techniques like converting correlated subqueries to joins, using EXISTS instead of IN for large sets, and avoiding functions on indexed columns help the optimizer produce better plans.",
    "Materialized views pre-compute and store the results of expensive queries (aggregations, multi-table joins). They trade write-time maintenance cost for read-time speed. PostgreSQL supports REFRESH MATERIALIZED VIEW (manual) and CONCURRENTLY (non-blocking). In warehousing workloads, materialized views can reduce query times from minutes to milliseconds.",
  ],
  deepDive: [
    "PostgreSQL's optimizer uses a cost model with configurable parameters: seq_page_cost, random_page_cost, cpu_tuple_cost, etc. These represent the relative cost of different operations. The optimizer combines these with statistics (pg_statistic stores histograms, most-common values, null fractions, and n_distinct estimates) to estimate the total cost of each plan. ANALYZE collects these statistics; auto-analyze runs periodically but can lag on rapidly-changing tables. When the optimizer's row estimate is wrong by orders of magnitude, the chosen plan can be catastrophically bad — this is the most common source of query performance problems.",
    "Advanced techniques include partial indexes for queries that filter on a known predicate, expression indexes for computed lookups, and index-only scans via covering indexes. For OLAP workloads, columnar storage extensions (like Citus columnar or TimescaleDB) can dramatically reduce I/O by reading only needed columns. Parallel query execution splits work across multiple CPU cores for large scans, joins, and aggregations — controlled by max_parallel_workers_per_gather. Understanding when the optimizer chooses parallel execution and when it does not helps identify bottlenecks.",
  ],
  code: [
    {
      language: "sql",
      caption: "Using EXPLAIN ANALYZE to diagnose a query",
      source: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.order_id, c.name, SUM(oi.qty * oi.unit_price) AS total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= '2024-01-01'
GROUP BY o.order_id, c.name
ORDER BY total DESC
LIMIT 10;

-- Key things to look for:
-- 1. Seq Scan vs Index Scan (is the index being used?)
-- 2. Rows estimated vs actual (bad estimates = bad plan)
-- 3. Sort method (quicksort in memory vs external merge on disk)
-- 4. Buffers: shared hit vs read (cache hit ratio)`
    },
    {
      language: "sql",
      caption: "Common optimization rewrites",
      source: `-- BAD: function on indexed column prevents index use
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
-- FIX: create an expression index
CREATE INDEX idx_lower_email ON users (LOWER(email));

-- BAD: correlated subquery executed per row
SELECT * FROM orders o
WHERE o.total > (SELECT AVG(total) FROM orders WHERE customer_id = o.customer_id);
-- BETTER: rewrite as JOIN with window function or CTE
WITH avgs AS (
  SELECT customer_id, AVG(total) AS avg_total FROM orders GROUP BY customer_id
)
SELECT o.* FROM orders o JOIN avgs a ON o.customer_id = a.customer_id
WHERE o.total > a.avg_total;

-- BAD: SELECT * fetches unnecessary columns
SELECT * FROM large_table WHERE status = 'active';
-- BETTER: select only needed columns (may enable index-only scan)
SELECT id, name FROM large_table WHERE status = 'active';`
    },
    {
      language: "sql",
      caption: "Materialized view for expensive aggregation",
      source: `CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT
  date_trunc('month', order_date) AS month,
  SUM(total) AS revenue,
  COUNT(*) AS order_count
FROM orders
GROUP BY date_trunc('month', order_date);

-- Refresh (blocks reads during refresh)
REFRESH MATERIALIZED VIEW monthly_revenue;

-- Non-blocking refresh (requires a unique index)
CREATE UNIQUE INDEX idx_mr_month ON monthly_revenue(month);
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;`
    },
  ],
  diagrams: [
    {
      title: "Query Execution Pipeline",
      kind: "flow",
      caption: "How SQL moves from raw text through parsing, optimization, and execution to return a result set.",
      mermaid: `flowchart TD
    A([SQL Text]) --> B[Parse into AST]
    B --> C[Validate Schema]
    C --> D[Generate Candidate Plans]
    D --> E[Estimate Costs via Statistics]
    E --> F{Cheapest Plan?}
    F -->|Yes| G[Execute Plan]
    F -->|No| D
    G --> H([Result Set])`,
    },
    {
      title: "Join Algorithm Decision Tree",
      kind: "flow",
      caption: "How the optimizer chooses between Nested Loop, Hash Join, and Merge Join based on table size, sort order, and join predicate type.",
      mermaid: `flowchart TD
    A([Join Request]) --> B{Equality join?}
    B -->|No| C[Nested Loop Join]
    B -->|Yes| D{Both sides sorted?}
    D -->|Yes| E[Merge Join]
    D -->|No| F{Enough memory?}
    F -->|Yes| G[Hash Join]
    F -->|No| H[Sort then Merge Join]`,
    },
    {
      title: "Index vs Sequential Scan",
      kind: "architecture",
      caption: "Index scan follows a B-tree to row pointers then fetches heap pages. Sequential scan reads every heap page in order. Selectivity determines which is cheaper.",
      mermaid: `graph TD
    Q[Query with WHERE clause] --> OPT[Cost-based Optimizer]
    OPT --> STATS[Table Statistics]
    STATS --> SEL{High selectivity?}
    SEL -->|Yes, few rows| IDX[Index Scan]
    SEL -->|No, many rows| SEQ[Sequential Scan]
    IDX --> BTREE[B-tree / Hash Index]
    BTREE --> HEAP[Heap Page Fetch]
    SEQ --> HEAPALL[All Heap Pages]`,
    },
    {
      title: "Materialized View Refresh Lifecycle",
      kind: "state",
      caption: "A materialized view starts stale after underlying data changes and must be refreshed. CONCURRENTLY avoids locks but requires a unique index.",
      mermaid: `stateDiagram-v2
    [*] --> Fresh : CREATE MATERIALIZED VIEW
    Fresh --> Stale : Underlying table updated
    Stale --> Refreshing : REFRESH MATERIALIZED VIEW
    Refreshing --> Fresh : Refresh complete
    Refreshing --> Stale : Refresh failed
    Fresh --> [*] : DROP MATERIALIZED VIEW`,
    },
  ],
  animations: [
    {
      title: "Cost-based optimizer choosing a plan",
      steps: [
        { label: "Parse query", detail: "SQL is parsed into an abstract syntax tree. Tables and columns are validated against the schema." },
        { label: "Generate candidates", detail: "The optimizer generates multiple execution plans: different join orders, access methods (seq scan vs index scan), and join algorithms." },
        { label: "Estimate costs", detail: "For each plan, the optimizer uses table statistics (row counts, histograms, null fractions) and cost parameters to estimate total I/O and CPU cost." },
        { label: "Choose plan", detail: "The plan with the lowest estimated cost is selected. If estimates are wrong, the chosen plan may be suboptimal." },
        { label: "Execute", detail: "The chosen plan is executed. EXPLAIN ANALYZE shows the actual vs estimated rows and timing at each step." },
      ],
    },
  ],
  comparison: {
    columns: ["Join Algorithm", "Best For", "Requires", "Complexity", "Notes"],
    rows: [
      ["Nested Loop", "Small inner table, indexed lookups", "Index on join column (ideal)", "O(n * m) worst case", "Only algorithm for non-equi joins"],
      ["Hash Join", "Large tables, equality joins", "Enough memory for hash table", "O(n + m)", "Cannot do range joins; parallel-friendly"],
      ["Merge Join", "Pre-sorted or large data, equality joins", "Sorted input (or efficient sort)", "O(n + m) after sort", "Good when both sides are already sorted"],
    ],
  },
  interviewQA: [
    {
      q: "What does it mean when EXPLAIN shows 'Seq Scan' on a table that has an index?",
      a: "The optimizer estimated that a sequential scan is cheaper than an index scan. This happens when: the query returns a large fraction of the table (low selectivity), the table is small enough to fit in memory, statistics are stale so the optimizer overestimates matching rows, or the query uses a function on the indexed column that prevents index use. Run ANALYZE on the table to refresh statistics, and check that the WHERE clause can use the index directly.",
      followUps: ["How do you force an index scan?", "When is a sequential scan actually faster than an index scan?"],
    },
    {
      q: "How do stale statistics cause bad query plans?",
      a: "The optimizer relies on statistics (row counts, value distributions, null fractions) to estimate how many rows each operation will produce. If the table has changed significantly since the last ANALYZE, these estimates can be wildly wrong. For example, if stats say a column has 100 distinct values but it now has 1 million, the optimizer may choose a nested loop join expecting 10 rows where it actually gets 100,000. The fix is to run ANALYZE or ensure autovacuum/autoanalyze is keeping statistics current.",
      followUps: ["What is autoanalyze?", "How do you check if statistics are stale?"],
    },
    {
      q: "What is predicate pushdown and why is it important?",
      a: "Predicate pushdown moves filter conditions to the earliest possible point in the execution plan — typically to the table scan level rather than after joins. This reduces the number of rows flowing through the plan, making joins and aggregations faster. The optimizer does this automatically for simple predicates, but may be prevented by views, functions, CTEs (in older PostgreSQL), or complex subqueries. Understanding predicate pushdown helps you write queries the optimizer can efficiently plan.",
      followUps: ["Do CTEs prevent predicate pushdown?", "What about subquery flattening?"],
    },
  ],
  followUps: [
    "How does parallel query execution work in PostgreSQL?",
    "What is the difference between cost-based and rule-based optimization?",
    "How do you optimize queries on partitioned tables?",
    "What is adaptive query execution (as in Spark)?",
  ],
  mcqs: [
    {
      q: "Which join algorithm is the only one that can handle non-equality join conditions (e.g., a.value > b.value)?",
      options: ["Hash join", "Merge join", "Nested loop join", "All of them"],
      answerIndex: 2,
      explanation: "Hash joins and merge joins require equality conditions. Nested loop joins can evaluate any predicate by comparing each pair of rows.",
    },
    {
      q: "What is the most common reason for a bad query plan?",
      options: ["Missing primary key", "Incorrect SQL syntax", "Inaccurate table statistics", "Too many indexes"],
      answerIndex: 2,
      explanation: "The cost-based optimizer depends on accurate statistics. When row count estimates are wrong, the optimizer may choose the wrong join algorithm, join order, or access method.",
    },
    {
      q: "REFRESH MATERIALIZED VIEW CONCURRENTLY requires:",
      options: ["No active transactions", "A unique index on the view", "Superuser privileges", "The table to be empty"],
      answerIndex: 1,
      explanation: "CONCURRENTLY refresh computes the new data and atomically swaps it with the old, but requires a unique index to match old and new rows for the diff.",
    },
  ],
  exercises: [
    "Take a slow query in your application, run EXPLAIN ANALYZE, identify the bottleneck (bad estimate, missing index, unnecessary sort), and fix it. Document the before/after plans and timings.",
    "Create a materialized view for a common dashboard query. Measure the query time with and without it. Set up a refresh schedule.",
    "Write a query with a correlated subquery, then rewrite it as a JOIN. Compare the EXPLAIN plans.",
    "Artificially create stale statistics (insert many rows without running ANALYZE) and show how it produces a bad plan. Then run ANALYZE and show the improvement.",
  ],
  flashcards: [
    { front: "What does the cost-based optimizer use to estimate plan costs?", back: "Table statistics (row counts, value histograms, null fractions, n_distinct) combined with configurable cost parameters (seq_page_cost, random_page_cost, cpu_tuple_cost, etc.)." },
    { front: "What is predicate pushdown?", back: "Moving filter conditions to the earliest point in the execution plan (close to the data source) to reduce the number of rows processed by joins and aggregations." },
    { front: "When does the optimizer choose a hash join?", back: "For equality joins on large unsorted tables, when there is enough memory to build a hash table on the smaller side." },
    { front: "What is a materialized view?", back: "A database object that stores the precomputed result of a query. Must be explicitly refreshed to pick up changes to the underlying tables." },
  ],
  revisionNotes: [
    "EXPLAIN ANALYZE: shows actual execution plan with timings and row counts.",
    "Cost-based optimizer relies on statistics — run ANALYZE to keep them fresh.",
    "Join order matters enormously; optimizer uses dynamic programming to find good orders.",
    "Three join algorithms: nested loop (indexed/small), hash join (equality/large), merge join (sorted).",
    "Predicate pushdown reduces rows early; functions on columns can prevent it.",
    "Materialized views pre-compute expensive queries; trade write cost for read speed.",
    "Common pitfalls: SELECT *, functions on indexed columns, correlated subqueries, stale stats.",
  ],
  cheatSheet: [
    "EXPLAIN (ANALYZE, BUFFERS) SELECT ... — show actual plan with I/O stats",
    "ANALYZE table_name — refresh table statistics",
    "CREATE INDEX ... — most impactful optimization tool",
    "Rewrite correlated subqueries as JOINs",
    "Avoid functions on indexed columns in WHERE",
    "SELECT only needed columns (not SELECT *)",
    "REFRESH MATERIALIZED VIEW CONCURRENTLY view_name",
    "SET enable_seqscan = off — for testing, not production",
  ],
  resources: [
    { label: "Use The Index, Luke — Markus Winand", url: "https://use-the-index-luke.com/", kind: "article", note: "The best free guide to SQL performance and index optimization." },
    { label: "PostgreSQL Documentation — Using EXPLAIN", url: "https://www.postgresql.org/docs/current/", kind: "docs", note: "Official guide to reading and interpreting query plans." },
    { label: "SQL Performance Explained — Markus Winand", kind: "book", note: "Deep dive into how the optimizer uses indexes." },
    { label: "The Art of PostgreSQL — Dimitri Fontaine", kind: "book", note: "Practical SQL optimization techniques." },
  ],
  glossary: [
    { term: "Cost-based optimizer (CBO)", definition: "An optimizer that estimates the cost of multiple execution plans using statistics and chooses the cheapest." },
    { term: "Execution plan", definition: "The tree of operations (scans, joins, sorts, aggregations) the database will perform to execute a query." },
    { term: "Predicate pushdown", definition: "Moving filter conditions to the earliest possible point in the plan to reduce intermediate result sizes." },
    { term: "Selectivity", definition: "The fraction of rows that match a predicate. Low selectivity (few matches) favors index scans; high selectivity favors sequential scans." },
    { term: "Materialized view", definition: "A stored result of a query, refreshed manually or on a schedule, that can be queried like a table." },
    { term: "Query rewriting", definition: "Transforming a query into an equivalent but more efficient form (e.g., subquery to join, predicate pushdown)." },
  ],
};
