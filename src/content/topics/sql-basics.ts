import type { TopicContent } from "../types";

export const sqlBasics: TopicContent = {
  quickSummary: [
    "SELECT retrieves columns from tables, WHERE filters rows by conditions, and ORDER BY sorts the result set.",
    "SQL is declarative: you describe what data you want, not how to get it. The optimizer decides the execution strategy.",
    "LIMIT/OFFSET control result size, DISTINCT removes duplicates, and operators like IN, BETWEEN, LIKE, and IS NULL handle common filtering patterns.",
  ],
  detailed: [
    "The SELECT clause specifies which columns (or expressions) to include in the result. SELECT * returns all columns — convenient for exploration but avoided in production because it fetches unnecessary data, prevents index-only scans, and breaks if the schema changes. Expressions can include arithmetic (price * qty), functions (UPPER(name)), and aliases (total AS order_total).",
    "The WHERE clause filters rows before grouping or aggregation. It supports comparison operators (=, <>, <, >, <=, >=), logical operators (AND, OR, NOT), pattern matching (LIKE with % and _ wildcards), range checks (BETWEEN low AND high, inclusive), set membership (IN (v1, v2, ...)), and null checks (IS NULL, IS NOT NULL). Note that NULL is not equal to anything — even NULL = NULL is false in SQL; you must use IS NULL.",
    "ORDER BY sorts the result set by one or more columns, ascending (ASC, the default) or descending (DESC). NULLS FIRST / NULLS LAST controls where nulls appear. Multi-column sorts apply left to right: ORDER BY country, city sorts by country first, then by city within each country. Sorting happens after filtering and projection, so you can ORDER BY columns not in the SELECT list (in standard SQL).",
    "LIMIT restricts the number of rows returned; OFFSET skips a number of rows before starting to return. Together they enable pagination: page N with size S uses LIMIT S OFFSET (N-1)*S. However, large offsets are inefficient because the database still processes all skipped rows. Keyset pagination (WHERE id > last_seen_id LIMIT S) is more efficient for large datasets.",
  ],
  deepDive: [
    "SQL's logical query processing order differs from the written order. The actual evaluation sequence is: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT/OFFSET. This means you cannot use a column alias defined in SELECT within the WHERE clause (though some databases allow it as an extension). Understanding this order clarifies why certain constructs work or fail.",
    "The interaction between NULL and SQL operators is a common source of bugs. NULL represents an unknown value. Any comparison with NULL yields NULL (not true or false), which means WHERE status <> 'active' will NOT return rows where status IS NULL. The three-valued logic (true, false, null) extends to AND and OR: true AND null = null, true OR null = true, false AND null = false, false OR null = null. Using COALESCE(column, default) or IS DISTINCT FROM can help handle nulls predictably.",
  ],
  code: [
    {
      language: "sql",
      caption: "SELECT, WHERE, and ORDER BY fundamentals",
      source: `-- Basic select with filtering and sorting
SELECT first_name, last_name, hire_date, salary
FROM employees
WHERE dept_id = 5 AND salary > 50000
ORDER BY hire_date DESC;

-- Using expressions and aliases
SELECT
  product_name,
  unit_price * quantity AS line_total,
  unit_price * quantity * 0.1 AS tax
FROM order_items
WHERE order_id = 1001;

-- DISTINCT removes duplicate rows
SELECT DISTINCT country, city
FROM customers
ORDER BY country, city;`
    },
    {
      language: "sql",
      caption: "WHERE clause operators",
      source: `-- Pattern matching with LIKE
SELECT * FROM products WHERE name LIKE 'Smart%';       -- starts with 'Smart'
SELECT * FROM products WHERE name LIKE '%phone%';      -- contains 'phone'
SELECT * FROM products WHERE sku LIKE 'A_B%';          -- _ matches single char

-- Range check (inclusive)
SELECT * FROM orders WHERE total BETWEEN 100 AND 500;

-- Set membership
SELECT * FROM employees WHERE dept_id IN (1, 3, 5);

-- NULL handling (= does NOT work with NULL)
SELECT * FROM customers WHERE phone IS NULL;
SELECT * FROM customers WHERE phone IS NOT NULL;

-- Combining conditions
SELECT * FROM orders
WHERE status = 'shipped'
  AND (total > 1000 OR priority = 'high')
  AND cancelled_at IS NULL;`
    },
    {
      language: "sql",
      caption: "Pagination patterns",
      source: `-- LIMIT/OFFSET pagination (simple but slow for large offsets)
SELECT id, title, created_at
FROM articles
ORDER BY created_at DESC
LIMIT 20 OFFSET 60;  -- page 4, 20 per page

-- Keyset pagination (efficient for large datasets)
SELECT id, title, created_at
FROM articles
WHERE created_at < '2024-06-15T10:30:00Z'
ORDER BY created_at DESC
LIMIT 20;

-- Using FETCH (SQL standard syntax)
SELECT id, title FROM articles
ORDER BY created_at DESC
OFFSET 20 ROWS
FETCH NEXT 20 ROWS ONLY;`
    },
  ],
  diagrams: [
    {
      title: "SQL Query Execution Order",
      kind: "flow",
      caption: "SQL clauses are executed in a logical order that differs from how they are written. Understanding this order is essential for correct queries.",
      mermaid: `flowchart TD
    A[FROM and JOIN - identify source tables] --> B[WHERE - filter rows]
    B --> C[GROUP BY - group remaining rows]
    C --> D[HAVING - filter groups]
    D --> E[SELECT - compute output columns]
    E --> F[DISTINCT - remove duplicates]
    F --> G[ORDER BY - sort results]
    G --> H[LIMIT and OFFSET - paginate]`,
    },
    {
      title: "JOIN Types",
      kind: "architecture",
      caption: "SQL JOIN types and what rows they include from left and right tables, from INNER JOIN returning only matches to FULL OUTER JOIN returning all rows.",
      mermaid: `graph TD
    subgraph INNER["INNER JOIN"]
      I[Only matching rows from both tables]
    end
    subgraph LEFT["LEFT JOIN"]
      L[All rows from left table]
      L --> L1[Plus matching rows from right]
      L --> L2[NULL for non-matching right rows]
    end
    subgraph RIGHT["RIGHT JOIN"]
      R[All rows from right table]
      R --> R1[Plus matching rows from left]
      R --> R2[NULL for non-matching left rows]
    end
    subgraph FULL["FULL OUTER JOIN"]
      F[All rows from both tables]
      F --> F1[NULLs where no match on either side]
    end`,
    },
    {
      title: "Aggregate Functions and GROUP BY",
      kind: "sequence",
      caption: "How GROUP BY partitions rows into groups and aggregate functions compute one value per group for COUNT, SUM, AVG, MIN, and MAX.",
      mermaid: `sequenceDiagram
    participant Q as Query
    participant E as SQL Engine
    participant Result as Result Set

    Q->>E: SELECT dept, COUNT(*) FROM employees GROUP BY dept
    E->>E: Scan employees table
    E->>E: Group rows by dept value
    E->>E: For each group: compute COUNT
    E-->>Result: Engineering - 15
    E-->>Result: Marketing - 8
    E-->>Result: Finance - 5
    Q->>E: Add HAVING COUNT(*) > 10
    E->>E: Filter groups where count exceeds 10
    E-->>Result: Engineering - 15`,
    },
    {
      title: "SQL Indexes and Query Planning",
      kind: "flow",
      caption: "How the query planner decides whether to use an index or perform a full table scan based on selectivity and available indexes.",
      mermaid: `flowchart TD
    A([SQL query received]) --> B[Parse and validate query]
    B --> C[Query planner generates plans]
    C --> D{Index available for WHERE clause?}
    D -->|Yes| E{High selectivity - few rows?}
    E -->|Yes| F[Index scan - read index then fetch rows]
    E -->|No - low selectivity| G[Full table scan may be faster]
    D -->|No| G
    F --> H[Execute chosen plan]
    G --> H
    H --> I([Return result set])`,
    },
  ],
  animations: [
    {
      title: "SQL query execution pipeline",
      steps: [
        { label: "FROM", detail: "Identify the source tables and compute any joins to produce a working set of rows." },
        { label: "WHERE", detail: "Filter rows that do not match the predicate. NULL comparisons yield NULL, which is treated as false." },
        { label: "SELECT", detail: "Evaluate expressions and choose the columns to include in the output." },
        { label: "ORDER BY", detail: "Sort the remaining rows by the specified columns and directions." },
        { label: "LIMIT/OFFSET", detail: "Skip OFFSET rows, then return at most LIMIT rows." },
      ],
    },
  ],
  comparison: {
    columns: ["Operator", "Syntax", "NULL Behavior", "Use Case"],
    rows: [
      ["= / <>", "col = value", "NULL = NULL is NULL (falsy)", "Exact match"],
      ["LIKE", "col LIKE 'pattern'", "NULL LIKE ... is NULL", "Pattern matching with % and _"],
      ["IN", "col IN (v1, v2)", "NULL IN (...) is NULL", "Set membership check"],
      ["BETWEEN", "col BETWEEN a AND b", "NULL BETWEEN is NULL", "Inclusive range check"],
      ["IS NULL", "col IS NULL", "Correctly checks for NULL", "Null detection"],
      ["IS DISTINCT FROM", "a IS DISTINCT FROM b", "Treats NULL as a comparable value", "NULL-safe equality (PostgreSQL)"],
    ],
  },
  interviewQA: [
    {
      q: "Why does WHERE status <> 'active' not return rows where status is NULL?",
      a: "In SQL's three-valued logic, any comparison involving NULL yields NULL, not true or false. NULL <> 'active' evaluates to NULL, which WHERE treats as false (only true passes). To include NULL rows, you must explicitly add: OR status IS NULL, or use: WHERE status IS DISTINCT FROM 'active' (PostgreSQL extension).",
      followUps: ["What is three-valued logic?", "What does COALESCE do?"],
    },
    {
      q: "Why is OFFSET-based pagination slow for large page numbers?",
      a: "OFFSET N requires the database to fetch and discard N rows before returning the requested page. For OFFSET 100000, the database processes 100000 rows just to throw them away. The query still scans, sorts, and counts those rows. Keyset pagination avoids this by using a WHERE clause with the last seen value (e.g., WHERE id > 12345 LIMIT 20), which can directly seek to the right position using an index.",
      followUps: ["What is keyset pagination?", "How does FETCH FIRST differ from LIMIT?"],
    },
    {
      q: "Can you use a column alias in the WHERE clause?",
      a: "In standard SQL, no — WHERE is evaluated before SELECT in the logical processing order, so aliases defined in SELECT are not yet available. Some databases (MySQL) allow it as an extension. To filter on a computed value, repeat the expression in WHERE, or use a subquery/CTE: WITH t AS (SELECT price * qty AS total FROM items) SELECT * FROM t WHERE total > 100.",
      followUps: ["What is the SQL logical processing order?", "Can you use aliases in ORDER BY?"],
    },
  ],
  followUps: [
    "How do JOINs extend the FROM clause?",
    "How does GROUP BY change the query processing order?",
    "What are window functions and how do they differ from aggregation?",
    "How do subqueries work in the WHERE clause?",
  ],
  mcqs: [
    {
      q: "What does SELECT DISTINCT do?",
      options: [
        "Selects the first row of each group",
        "Removes duplicate rows from the result set",
        "Selects unique columns only",
        "Orders results uniquely",
      ],
      answerIndex: 1,
      explanation: "DISTINCT eliminates duplicate rows from the result set by comparing all selected columns.",
    },
    {
      q: "Which clause is evaluated first in SQL's logical processing order?",
      options: ["SELECT", "WHERE", "FROM", "ORDER BY"],
      answerIndex: 2,
      explanation: "The logical processing order starts with FROM (identifying source tables), then WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, and finally LIMIT/OFFSET.",
    },
    {
      q: "What does BETWEEN 10 AND 20 include?",
      options: ["10 to 19", "11 to 20", "10 to 20 (inclusive)", "11 to 19"],
      answerIndex: 2,
      explanation: "BETWEEN is inclusive on both ends. It is equivalent to col >= 10 AND col <= 20.",
    },
  ],
  exercises: [
    "Write a query to find all employees hired in 2024 whose salary is above the company average. Use a subquery in the WHERE clause.",
    "Write a query with LIKE to find products whose names contain 'pro' (case-insensitive). Handle the case sensitivity appropriately for your database.",
    "Implement keyset pagination for a blog: given the last article's created_at and id, return the next 20 articles sorted by recency.",
    "Demonstrate the difference between WHERE col <> 'x' and WHERE col IS DISTINCT FROM 'x' when some rows have NULL values.",
  ],
  flashcards: [
    { front: "What is the SQL logical processing order?", back: "FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT/OFFSET." },
    { front: "Why can't you use a SELECT alias in WHERE?", back: "Because WHERE is evaluated before SELECT in the logical processing order. The alias doesn't exist yet." },
    { front: "What does NULL = NULL evaluate to?", back: "NULL (not true, not false). Use IS NULL or IS DISTINCT FROM for null comparisons." },
    { front: "What is keyset pagination?", back: "Using WHERE id > last_seen_id ORDER BY id LIMIT N instead of OFFSET. More efficient because it seeks directly via an index." },
    { front: "What is the difference between LIKE '%abc' and LIKE 'abc%'?", back: "'%abc' matches strings ending with 'abc' (cannot use index). 'abc%' matches strings starting with 'abc' (can use B-tree index)." },
  ],
  revisionNotes: [
    "SELECT: columns and expressions to return. Avoid SELECT * in production.",
    "WHERE: filters rows. Evaluated before SELECT. Cannot use SELECT aliases.",
    "ORDER BY: sorts results. ASC (default) or DESC. NULLS FIRST/LAST.",
    "LIMIT N OFFSET M: pagination. Large offsets are slow — use keyset pagination.",
    "DISTINCT: removes duplicate rows (compares all selected columns).",
    "NULL is not equal to anything — use IS NULL, not = NULL.",
    "Three-valued logic: true, false, null. NULL in AND/OR follows specific rules.",
  ],
  cheatSheet: [
    "SELECT col1, expr AS alias FROM table",
    "WHERE col = value AND col2 > value",
    "WHERE col LIKE 'pattern%' — % = any chars, _ = one char",
    "WHERE col IN (v1, v2, v3)",
    "WHERE col BETWEEN low AND high — inclusive",
    "WHERE col IS NULL / IS NOT NULL",
    "ORDER BY col ASC/DESC NULLS FIRST/LAST",
    "LIMIT n OFFSET m — or FETCH NEXT n ROWS ONLY",
    "COALESCE(col, default) — replace NULL with default",
  ],
  resources: [
    { label: "PostgreSQL Tutorial — SELECT", kind: "docs", note: "Comprehensive reference for SELECT syntax and behavior." },
    { label: "SQL in 10 Minutes — Ben Forta", kind: "book", note: "Quick practical introduction to SQL fundamentals." },
    { label: "Mode Analytics SQL Tutorial", kind: "article", note: "Interactive SQL learning with real datasets." },
    { label: "SQLBolt", kind: "article", note: "Interactive exercises for learning SQL basics." },
  ],
  glossary: [
    { term: "Predicate", definition: "A condition in a WHERE clause that evaluates to true, false, or null for each row." },
    { term: "Projection", definition: "Selecting specific columns from a table (the SELECT clause in SQL)." },
    { term: "Three-valued logic", definition: "SQL's logic system where expressions can evaluate to true, false, or null." },
    { term: "Keyset pagination", definition: "Pagination using WHERE with the last-seen value instead of OFFSET, enabling efficient index-based seeking." },
    { term: "Wildcard", definition: "In LIKE patterns: % matches zero or more characters, _ matches exactly one character." },
    { term: "COALESCE", definition: "A function that returns the first non-null argument, useful for providing defaults for null values." },
  ],
};
