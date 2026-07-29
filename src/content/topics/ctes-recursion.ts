import type { TopicContent } from "../types";

export const ctesRecursion: TopicContent = {
  quickSummary: [
    "Common Table Expressions (CTEs) are named temporary result sets defined with the WITH clause that make complex queries readable and composable.",
    "Recursive CTEs enable tree and graph traversal in SQL by defining a base case and a recursive step that references the CTE itself.",
    "CTEs can be materialized (computed once, result cached) or inlined (optimized as part of the outer query), with significant performance implications.",
  ],
  detailed: [
    "A CTE is defined with WITH name AS (query) and can be referenced like a table in the subsequent query. CTEs improve readability by breaking complex queries into logical steps, each with a descriptive name. Multiple CTEs can be chained: WITH a AS (...), b AS (SELECT ... FROM a), c AS (SELECT ... FROM b) SELECT ... FROM c. Each CTE can reference the ones defined before it.",
    "Recursive CTEs have two parts connected by UNION ALL: the anchor member (base case) that runs once, and the recursive member that references the CTE itself and runs repeatedly until it produces no new rows. The database executes iteratively: anchor produces initial rows, recursive step processes those rows to produce more, and so on until the working table is empty. A CYCLE clause or manual cycle detection (tracking visited IDs) prevents infinite loops.",
    "CTEs are essential for hierarchical data: org charts (employee-manager), category trees, bill-of-materials, file system paths, and graph traversal. The recursive CTE walks the hierarchy level by level, accumulating the path or depth as it goes. PostgreSQL supports SEARCH BREADTH FIRST / DEPTH FIRST and CYCLE clauses (SQL standard) to control traversal order and detect cycles.",
    "In PostgreSQL, non-recursive CTEs were historically always materialized (computed once, results stored in a temp table). Since PostgreSQL 12, the optimizer can inline them (fold them into the outer query) unless you explicitly mark them AS MATERIALIZED. Materialization prevents predicate pushdown from the outer query, which can harm performance. In MySQL 8, CTEs are generally inlined by default.",
  ],
  deepDive: [
    "The materialization behavior of CTEs is a critical performance consideration. A materialized CTE computes its result once and stores it, which is beneficial if the CTE is referenced multiple times (avoiding recomputation) or if you want to ensure a specific evaluation order. However, materialization creates an optimization fence — the outer query's WHERE predicates cannot be pushed into the CTE, potentially causing the CTE to return far more rows than needed. AS NOT MATERIALIZED (PostgreSQL 12+) lets the optimizer inline the CTE. Rule of thumb: if the CTE is referenced once, let the optimizer inline it; if referenced multiple times, materialization avoids redundant work.",
    "Recursive CTEs have practical limits. Deep recursion (thousands of levels) can be slow and memory-intensive. Set a max depth guard in the WHERE clause of the recursive step (WHERE depth < 100) to prevent runaway queries. For very large graphs, consider storing the closure table (all ancestor-descendant pairs precomputed) or using the ltree extension (PostgreSQL) for hierarchical data. For simple parent-child hierarchies, a materialized path (storing the full path as a string, e.g., '/1/5/12/') combined with LIKE queries can be more efficient than recursive CTEs.",
  ],
  code: [
    {
      language: "sql",
      caption: "Non-recursive CTEs for readable queries",
      source: `-- Break a complex report into logical steps
WITH monthly_orders AS (
  SELECT
    customer_id,
    date_trunc('month', order_date) AS month,
    SUM(total) AS monthly_total
  FROM orders
  WHERE order_date >= '2024-01-01'
  GROUP BY customer_id, date_trunc('month', order_date)
),
customer_stats AS (
  SELECT
    customer_id,
    COUNT(*) AS active_months,
    AVG(monthly_total) AS avg_monthly_spend,
    MAX(monthly_total) AS peak_monthly_spend
  FROM monthly_orders
  GROUP BY customer_id
)
SELECT
  c.name,
  cs.active_months,
  cs.avg_monthly_spend,
  cs.peak_monthly_spend
FROM customer_stats cs
JOIN customers c ON cs.customer_id = c.customer_id
WHERE cs.avg_monthly_spend > 500
ORDER BY cs.avg_monthly_spend DESC;`
    },
    {
      language: "sql",
      caption: "Recursive CTE: org chart traversal",
      source: `-- Employee hierarchy: find all reports (direct and indirect) under a manager
WITH RECURSIVE org_tree AS (
  -- Anchor: start with the given manager
  SELECT emp_id, name, manager_id, 0 AS depth,
         ARRAY[emp_id] AS path
  FROM employees
  WHERE emp_id = 1  -- CEO

  UNION ALL

  -- Recursive step: join children to the current frontier
  SELECT e.emp_id, e.name, e.manager_id, ot.depth + 1,
         ot.path || e.emp_id
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.emp_id
  WHERE ot.depth < 20  -- safety limit
    AND e.emp_id <> ALL(ot.path)  -- cycle detection
)
SELECT
  depth,
  REPEAT('  ', depth) || name AS org_chart,
  path
FROM org_tree
ORDER BY path;`
    },
    {
      language: "sql",
      caption: "Recursive CTE: graph traversal (shortest path)",
      source: `-- Find all reachable nodes from a starting node in a graph
CREATE TABLE edges (src INT, dst INT, weight INT);

WITH RECURSIVE reachable AS (
  -- Start node
  SELECT dst AS node, weight AS total_cost, ARRAY[1, dst] AS path
  FROM edges
  WHERE src = 1

  UNION ALL

  -- Expand frontier
  SELECT e.dst, r.total_cost + e.weight,
         r.path || e.dst
  FROM edges e
  JOIN reachable r ON e.src = r.node
  WHERE e.dst <> ALL(r.path)  -- avoid cycles
    AND array_length(r.path, 1) < 10  -- depth limit
)
SELECT DISTINCT ON (node)
  node, total_cost, path
FROM reachable
ORDER BY node, total_cost;`
    },
  ],
  diagrams: [
    { title: "Recursive CTE execution", kind: "flow", caption: "Anchor produces initial rows -> recursive step processes them -> new rows feed back into recursive step -> repeat until no new rows." },
    { title: "CTE materialization vs inlining", kind: "architecture", caption: "Materialized: CTE computed once, stored, outer query reads result. Inlined: CTE merged into outer query, enabling predicate pushdown." },
  ],
  animations: [
    {
      title: "Recursive CTE: walking an org chart",
      steps: [
        { label: "Anchor", detail: "Base case selects the root: CEO (emp_id=1, depth=0). Working table = [{1, 'CEO', 0}]." },
        { label: "Iteration 1", detail: "Find employees whose manager_id = 1 (CEO's direct reports). Working table = [{2, 'VP Sales', 1}, {3, 'VP Eng', 1}]." },
        { label: "Iteration 2", detail: "Find employees whose manager_id IN (2, 3). Working table = [{4, 'Sales Rep', 2}, {5, 'Engineer', 2}]." },
        { label: "Iteration 3", detail: "Find employees whose manager_id IN (4, 5). No matches found — working table is empty." },
        { label: "Termination", detail: "Recursion stops. Final result is the union of all iterations: 5 employees across 3 levels." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "CTE (WITH)", "Subquery", "Temp Table", "View"],
    rows: [
      ["Scope", "Single query", "Single query", "Session", "Permanent"],
      ["Reusability", "Multiple references in query", "Must repeat or use subquery", "Across queries", "Across queries"],
      ["Recursion", "Yes (WITH RECURSIVE)", "No", "Via loops/procedural code", "No"],
      ["Optimization", "May be inlined or materialized", "Always inlined", "Always materialized", "Always inlined"],
      ["Readability", "High (named steps)", "Low (nested)", "Medium", "High"],
    ],
  },
  interviewQA: [
    {
      q: "When should you use a CTE instead of a subquery?",
      a: "Use a CTE when: (1) the same derived table is referenced multiple times in the query, (2) you want to break a complex query into named, readable steps, (3) you need recursion (only CTEs support WITH RECURSIVE), or (4) you want to control materialization. Use a subquery when the expression is simple, used once, and inline readability is fine. Performance-wise, in modern PostgreSQL they are usually equivalent for single-reference cases due to CTE inlining.",
      followUps: ["What is the optimization fence problem?", "How do you force a CTE to be inlined?"],
    },
    {
      q: "How do you prevent infinite recursion in a recursive CTE?",
      a: "Three approaches: (1) Add a depth counter and filter in the recursive step (WHERE depth < max_depth). (2) Track visited nodes in an array and exclude already-visited nodes (WHERE node_id <> ALL(visited_path)). (3) Use PostgreSQL's CYCLE clause (SQL standard): CYCLE node SET is_cycle USING path — the database automatically stops when it detects a repeated node. Always include at least one safeguard, even for data you believe is acyclic.",
      followUps: ["What is the CYCLE clause syntax?", "What is the performance impact of cycle detection?"],
    },
    {
      q: "What is the difference between a materialized and non-materialized CTE?",
      a: "A materialized CTE is computed once, and its result is stored in a temporary buffer. The outer query reads this buffer — predicates from the outer query cannot be pushed into the CTE, which can cause it to return more rows than needed. A non-materialized (inlined) CTE is merged into the outer query by the optimizer, enabling predicate pushdown and other optimizations. In PostgreSQL 12+, single-reference CTEs default to inlining. Use AS MATERIALIZED when the CTE is referenced multiple times or when you need to guarantee evaluation order.",
      followUps: ["Can you force inlining in older PostgreSQL?", "How do you tell if a CTE was materialized from the EXPLAIN plan?"],
    },
  ],
  followUps: [
    "How do recursive CTEs compare to the ltree extension for hierarchies?",
    "What is a closure table and when is it better than recursive queries?",
    "How do CTEs interact with DML (INSERT, UPDATE, DELETE)?",
    "What are the performance limits of deep recursive CTEs?",
  ],
  mcqs: [
    {
      q: "What terminates a recursive CTE?",
      options: [
        "A LIMIT clause",
        "When the recursive step produces no new rows",
        "After a fixed number of iterations",
        "When a STOP keyword is encountered",
      ],
      answerIndex: 1,
      explanation: "Recursive CTE iteration stops when the recursive step returns an empty result set — there are no more rows to process.",
    },
    {
      q: "In PostgreSQL 12+, when is a CTE materialized by default?",
      options: [
        "Always",
        "When it is recursive or referenced more than once",
        "Never",
        "Only with explicit AS MATERIALIZED",
      ],
      answerIndex: 1,
      explanation: "PostgreSQL 12+ inlines non-recursive CTEs that are referenced once. Recursive CTEs and CTEs referenced multiple times are materialized by default.",
    },
    {
      q: "Which keyword enables recursion in a CTE?",
      options: ["WITH LOOP", "WITH RECURSIVE", "WITH ITERATE", "WITH HIERARCHY"],
      answerIndex: 1,
      explanation: "WITH RECURSIVE is the SQL standard keyword that enables a CTE to reference itself.",
    },
  ],
  exercises: [
    "Write a recursive CTE to generate the Fibonacci sequence up to the 20th number.",
    "Given an employees table with (emp_id, name, manager_id), write a recursive CTE that produces the full path from each employee to the CEO.",
    "Rewrite a complex nested subquery as a chain of CTEs. Compare readability and EXPLAIN plans.",
    "Create a category tree (categories with parent_id) and write a recursive CTE that computes the full category path (e.g., 'Electronics > Phones > Smartphones') for each leaf category.",
  ],
  flashcards: [
    { front: "What are the two parts of a recursive CTE?", back: "The anchor member (base case, runs once) and the recursive member (references the CTE itself, runs iteratively until it produces no new rows), connected by UNION ALL." },
    { front: "What is the optimization fence problem with CTEs?", back: "A materialized CTE is computed independently of the outer query, preventing predicate pushdown and other optimizations. This can cause the CTE to process far more rows than needed." },
    { front: "How do you detect cycles in a recursive CTE?", back: "Track visited nodes in an array column and exclude already-visited nodes with WHERE id <> ALL(path), or use the SQL standard CYCLE clause." },
    { front: "What does AS NOT MATERIALIZED do?", back: "Tells PostgreSQL to inline the CTE into the outer query (merge their plans), enabling predicate pushdown and other optimizations." },
  ],
  revisionNotes: [
    "CTE: WITH name AS (query) — named temporary result set for readability and reuse.",
    "Multiple CTEs: WITH a AS (...), b AS (SELECT FROM a) — chained, each can reference previous ones.",
    "Recursive CTE: anchor UNION ALL recursive step. Stops when recursive step returns empty.",
    "Cycle prevention: depth limit, visited-node tracking, or CYCLE clause.",
    "Materialized CTE: computed once, blocks predicate pushdown.",
    "Inlined CTE: merged into outer query, enables optimization.",
    "PostgreSQL 12+: single-reference non-recursive CTEs are inlined by default.",
    "Use cases: hierarchies (org chart, categories), graph traversal, sequence generation, breaking complex queries into steps.",
  ],
  cheatSheet: [
    "WITH name AS (SELECT ...) SELECT ... FROM name",
    "WITH RECURSIVE r AS (anchor UNION ALL recursive) SELECT * FROM r",
    "Add WHERE depth < N to prevent runaway recursion",
    "WHERE id <> ALL(path_array) — cycle detection",
    "AS MATERIALIZED — force materialization",
    "AS NOT MATERIALIZED — force inlining (PostgreSQL 12+)",
    "SEARCH BREADTH FIRST / DEPTH FIRST BY col SET ordcol",
    "CYCLE col SET is_cycle USING path — SQL standard cycle detection",
  ],
  resources: [
    { label: "PostgreSQL Documentation — WITH Queries (CTEs)", kind: "docs", note: "Official reference for CTE syntax including recursive and cycle detection." },
    { label: "Modern SQL — WITH and Recursive Queries", kind: "article", note: "Clear explanation with practical examples." },
    { label: "The Art of PostgreSQL — Dimitri Fontaine", kind: "book", note: "Practical recipes for recursive queries and hierarchical data." },
    { label: "SQL Antipatterns — Bill Karwin, Ch. 3", kind: "book", note: "Covers naive trees and the adjacency list vs closure table trade-off." },
  ],
  glossary: [
    { term: "CTE (Common Table Expression)", definition: "A named temporary result set defined with WITH that exists for the duration of a single query." },
    { term: "Anchor member", definition: "The non-recursive part of a recursive CTE — the base case that produces the initial rows." },
    { term: "Recursive member", definition: "The part of a recursive CTE that references the CTE itself, processing rows iteratively." },
    { term: "Working table", definition: "The set of rows produced by the most recent iteration of the recursive step, used as input for the next iteration." },
    { term: "Materialization", definition: "Computing a CTE's result once and storing it, rather than merging it into the outer query plan." },
    { term: "Optimization fence", definition: "A barrier that prevents the optimizer from pushing predicates or other optimizations across a boundary (e.g., a materialized CTE)." },
  ],
};
