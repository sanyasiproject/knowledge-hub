import type { TopicContent } from "../types";

export const aggregation: TopicContent = {
  quickSummary: [
    "Aggregate functions (COUNT, SUM, AVG, MIN, MAX) collapse multiple rows into a single summary value.",
    "GROUP BY partitions rows into groups by one or more columns; each group produces one output row with aggregated values.",
    "HAVING filters groups after aggregation (unlike WHERE, which filters rows before aggregation).",
  ],
  detailed: [
    "Aggregate functions operate on sets of rows. COUNT(*) counts all rows; COUNT(column) counts non-null values; COUNT(DISTINCT column) counts unique non-null values. SUM and AVG work on numeric columns (NULLs are ignored, not treated as zero). MIN and MAX work on any comparable type — numbers, strings, dates. Without GROUP BY, the entire result set is a single group.",
    "GROUP BY divides rows into groups sharing the same values in the specified columns. Each group is reduced to one output row. Every column in the SELECT list must either be in the GROUP BY clause or be wrapped in an aggregate function — otherwise the database does not know which value to display for the group. This is the 'single-value rule' and is enforced in standard SQL (MySQL historically allowed violations with non-deterministic results).",
    "HAVING filters groups after aggregation. WHERE filters individual rows before grouping; HAVING filters the aggregated results. Example: WHERE filters orders by date, GROUP BY groups by customer, HAVING filters customers with total > 1000. You cannot use aggregate functions in WHERE — that is what HAVING is for.",
    "ROLLUP, CUBE, and GROUPING SETS generate multiple levels of aggregation in a single query. ROLLUP(a, b) produces groups for (a, b), (a), and the grand total. CUBE(a, b) produces all combinations: (a, b), (a), (b), and grand total. GROUPING SETS lets you specify exactly which groupings you want. The GROUPING() function identifies which rows are subtotals (where the grouping column is NULL due to aggregation, not because the data is NULL).",
  ],
  deepDive: [
    "The FILTER clause (PostgreSQL, SQL standard) allows conditional aggregation without CASE expressions: COUNT(*) FILTER (WHERE status = 'active') counts only active rows. This is cleaner and more efficient than COUNT(CASE WHEN status = 'active' THEN 1 END). Multiple FILTER clauses in the same query can compute different conditional aggregates in a single pass over the data.",
    "Aggregation interacts with NULL in specific ways that cause bugs. SUM of all NULLs returns NULL (not 0). AVG ignores NULLs, so AVG over [10, NULL, 20] is 15, not 10. COUNT(*) counts all rows including those with NULLs; COUNT(column) excludes NULLs. Understanding these rules is essential for correct reporting queries. Use COALESCE to substitute defaults when needed: COALESCE(SUM(amount), 0).",
  ],
  code: [
    {
      language: "sql",
      caption: "Basic aggregation with GROUP BY and HAVING",
      source: `-- Total revenue per customer, only customers with > $1000
SELECT
  c.name,
  COUNT(o.order_id) AS order_count,
  SUM(o.total) AS total_revenue,
  AVG(o.total) AS avg_order_value,
  MIN(o.order_date) AS first_order,
  MAX(o.order_date) AS last_order
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2024-01-01'
GROUP BY c.customer_id, c.name
HAVING SUM(o.total) > 1000
ORDER BY total_revenue DESC;`
    },
    {
      language: "sql",
      caption: "ROLLUP, CUBE, and GROUPING SETS",
      source: `-- ROLLUP: hierarchical subtotals
SELECT
  COALESCE(region, 'ALL REGIONS') AS region,
  COALESCE(product, 'ALL PRODUCTS') AS product,
  SUM(revenue) AS total_revenue
FROM sales
GROUP BY ROLLUP(region, product)
ORDER BY region NULLS LAST, product NULLS LAST;

-- CUBE: all combinations
SELECT region, product, SUM(revenue)
FROM sales
GROUP BY CUBE(region, product);

-- GROUPING SETS: specific groupings only
SELECT region, product, SUM(revenue)
FROM sales
GROUP BY GROUPING SETS (
  (region, product),   -- detail
  (region),            -- subtotal by region
  ()                   -- grand total
);

-- GROUPING() to distinguish real NULLs from subtotal NULLs
SELECT
  CASE WHEN GROUPING(region) = 1 THEN 'TOTAL' ELSE region END AS region,
  SUM(revenue)
FROM sales
GROUP BY ROLLUP(region);`
    },
    {
      language: "sql",
      caption: "Conditional aggregation with FILTER",
      source: `-- PostgreSQL FILTER clause (cleaner than CASE)
SELECT
  dept_id,
  COUNT(*) AS total_employees,
  COUNT(*) FILTER (WHERE salary > 100000) AS high_earners,
  AVG(salary) FILTER (WHERE hire_date >= '2024-01-01') AS avg_new_hire_salary,
  SUM(salary) FILTER (WHERE is_active) AS active_payroll
FROM employees
GROUP BY dept_id;

-- Equivalent with CASE (works in all databases)
SELECT
  dept_id,
  COUNT(*) AS total_employees,
  COUNT(CASE WHEN salary > 100000 THEN 1 END) AS high_earners,
  AVG(CASE WHEN hire_date >= '2024-01-01' THEN salary END) AS avg_new_hire_salary
FROM employees
GROUP BY dept_id;`
    },
  ],
  diagrams: [
    { title: "GROUP BY processing pipeline", kind: "flow", caption: "FROM -> WHERE (filter rows) -> GROUP BY (partition into groups) -> aggregate (compute per-group values) -> HAVING (filter groups) -> SELECT." },
    { title: "ROLLUP vs CUBE groupings", kind: "mindmap", caption: "ROLLUP(a,b): (a,b), (a), (). CUBE(a,b): (a,b), (a), (b), (). GROUPING SETS: user-defined selection." },
  ],
  animations: [
    {
      title: "How GROUP BY processes data",
      steps: [
        { label: "Input rows", detail: "After FROM and WHERE, we have a set of rows: [(A, 10), (A, 20), (B, 30), (B, 40), (A, 50)]." },
        { label: "Partition", detail: "GROUP BY column1 creates groups: Group A = [(A,10), (A,20), (A,50)], Group B = [(B,30), (B,40)]." },
        { label: "Aggregate", detail: "Apply functions to each group: Group A: COUNT=3, SUM=80. Group B: COUNT=2, SUM=70." },
        { label: "HAVING filter", detail: "HAVING SUM > 75 keeps Group A (80 > 75) and removes Group B (70 is not > 75)." },
        { label: "Output", detail: "One row per surviving group: (A, 3, 80)." },
      ],
    },
  ],
  comparison: {
    columns: ["Function", "Ignores NULL?", "On Empty Set", "On All NULLs", "Notes"],
    rows: [
      ["COUNT(*)", "No (counts all rows)", "0", "Returns row count", "Counts rows, not values"],
      ["COUNT(col)", "Yes", "0", "0", "Counts non-null values"],
      ["SUM(col)", "Yes", "NULL", "NULL", "Use COALESCE for 0"],
      ["AVG(col)", "Yes", "NULL", "NULL", "Denominator excludes NULLs"],
      ["MIN(col)", "Yes", "NULL", "NULL", "Works on strings, dates too"],
      ["MAX(col)", "Yes", "NULL", "NULL", "Works on strings, dates too"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between WHERE and HAVING?",
      a: "WHERE filters individual rows before grouping and aggregation — you cannot use aggregate functions in WHERE. HAVING filters groups after aggregation — it can use aggregate functions. Example: WHERE order_date > '2024-01-01' filters which orders are included; HAVING COUNT(*) > 5 filters which groups (e.g., customers) are shown based on aggregate results.",
      followUps: ["Can HAVING reference non-aggregated columns?", "Is it more efficient to filter in WHERE or HAVING?"],
    },
    {
      q: "Why does AVG ignore NULLs, and what problem can this cause?",
      a: "AVG is defined as SUM(col) / COUNT(col), where both SUM and COUNT ignore NULLs. So AVG([10, NULL, 20]) = 30/2 = 15, not 30/3 = 10. This can cause misleading results if NULL represents 'zero' rather than 'unknown'. If NULLs should be treated as zero, use AVG(COALESCE(col, 0)) to make the intention explicit.",
      followUps: ["What does SUM return when all values are NULL?", "How do you count NULLs?"],
    },
    {
      q: "When would you use ROLLUP vs CUBE?",
      a: "ROLLUP generates hierarchical subtotals along a single dimension: GROUP BY ROLLUP(year, quarter, month) gives subtotals by year-quarter-month, year-quarter, year, and grand total. CUBE generates subtotals for all combinations of dimensions: GROUP BY CUBE(region, product) gives every combination including region-only, product-only, and grand total. Use ROLLUP for hierarchies (time, geography); use CUBE for cross-tabulation reports where every combination matters.",
      followUps: ["What does GROUPING() return?", "How does GROUPING SETS give finer control?"],
    },
  ],
  followUps: [
    "How do window functions differ from GROUP BY aggregation?",
    "What are array_agg and string_agg used for?",
    "How do you compute running totals with aggregation?",
    "What is the performance impact of GROUP BY on large tables?",
  ],
  mcqs: [
    {
      q: "What does COUNT(*) return when the table is empty?",
      options: ["NULL", "0", "An error", "1"],
      answerIndex: 1,
      explanation: "COUNT(*) returns 0 for an empty set. Other aggregate functions (SUM, AVG, MIN, MAX) return NULL for an empty set.",
    },
    {
      q: "Which clause filters groups after aggregation?",
      options: ["WHERE", "HAVING", "FILTER", "GROUP BY"],
      answerIndex: 1,
      explanation: "HAVING filters groups after GROUP BY and aggregation. WHERE filters rows before grouping.",
    },
    {
      q: "GROUP BY ROLLUP(a, b) produces how many grouping levels?",
      options: ["1", "2", "3", "4"],
      answerIndex: 2,
      explanation: "ROLLUP(a, b) produces three levels: (a, b), (a), and () — the grand total. In general, ROLLUP of n columns produces n+1 levels.",
    },
  ],
  exercises: [
    "Write a query to find the top 5 products by total revenue, showing product name, units sold, and total revenue. Include only products with more than 100 units sold.",
    "Use ROLLUP to create a sales report with subtotals by region and grand total. Use GROUPING() to label the subtotal rows.",
    "Write a query using conditional aggregation (FILTER or CASE) to pivot order counts by status (pending, shipped, delivered) into separate columns for each customer.",
    "Demonstrate the difference between COUNT(*), COUNT(col), and COUNT(DISTINCT col) on a table with NULL values and duplicates.",
  ],
  flashcards: [
    { front: "What is the single-value rule in GROUP BY?", back: "Every column in SELECT must either appear in GROUP BY or be wrapped in an aggregate function — otherwise the database cannot determine which value to show for the group." },
    { front: "What does SUM return when all values are NULL?", back: "NULL (not 0). Use COALESCE(SUM(col), 0) if you want 0." },
    { front: "What is ROLLUP?", back: "GROUP BY ROLLUP(a, b) produces groups for (a, b), (a), and () — hierarchical subtotals plus a grand total." },
    { front: "What does the FILTER clause do?", back: "Applies a condition to an aggregate function: COUNT(*) FILTER (WHERE status = 'active') counts only rows where status is active. Cleaner than CASE." },
    { front: "How does AVG handle NULLs?", back: "It ignores them. AVG([10, NULL, 20]) = 15 (sum=30, count=2), not 10 (count=3). The denominator excludes NULL rows." },
  ],
  revisionNotes: [
    "Aggregate functions: COUNT, SUM, AVG, MIN, MAX. All except COUNT(*) ignore NULLs.",
    "GROUP BY: partitions rows into groups; each group produces one row.",
    "Single-value rule: SELECT columns must be in GROUP BY or in an aggregate.",
    "WHERE filters rows before grouping; HAVING filters groups after aggregation.",
    "ROLLUP: hierarchical subtotals. CUBE: all combinations. GROUPING SETS: custom.",
    "GROUPING(col) returns 1 for subtotal rows, 0 for regular groups.",
    "FILTER (WHERE ...) is the clean way to do conditional aggregation in PostgreSQL.",
    "SUM/AVG of all NULLs = NULL. COUNT(*) of empty set = 0.",
  ],
  cheatSheet: [
    "SELECT col, COUNT(*), SUM(val) FROM t GROUP BY col",
    "HAVING SUM(val) > 100 — filter groups",
    "COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)",
    "COALESCE(SUM(col), 0) — NULL-safe sum",
    "GROUP BY ROLLUP(a, b) — hierarchical subtotals",
    "GROUP BY CUBE(a, b) — all combinations",
    "GROUP BY GROUPING SETS ((a,b), (a), ())",
    "GROUPING(col) — 1 for subtotal, 0 for regular",
    "AGG(*) FILTER (WHERE cond) — conditional aggregate",
  ],
  resources: [
    { label: "PostgreSQL Documentation — Aggregate Functions", kind: "docs", note: "Complete list of built-in aggregates and their behavior." },
    { label: "PostgreSQL Documentation — GROUPING SETS, CUBE, ROLLUP", kind: "docs", note: "Multi-level aggregation features." },
    { label: "Modern SQL — FILTER clause", kind: "article", note: "Explanation of the SQL standard FILTER clause for conditional aggregation." },
    { label: "SQL Cookbook — Anthony Molinaro", kind: "book", note: "Practical aggregation recipes." },
  ],
  glossary: [
    { term: "Aggregate function", definition: "A function that operates on a set of rows and returns a single value (e.g., SUM, COUNT, AVG)." },
    { term: "GROUP BY", definition: "A clause that partitions rows into groups by column values; each group is reduced to one row via aggregation." },
    { term: "HAVING", definition: "A clause that filters groups after aggregation, analogous to WHERE but for groups." },
    { term: "ROLLUP", definition: "A GROUP BY extension that generates hierarchical subtotals from right to left plus a grand total." },
    { term: "CUBE", definition: "A GROUP BY extension that generates subtotals for all possible combinations of grouping columns." },
    { term: "GROUPING SETS", definition: "A GROUP BY extension that lets you specify exactly which groupings to compute." },
    { term: "FILTER", definition: "A clause on an aggregate function that restricts which rows contribute to the aggregate." },
  ],
};
