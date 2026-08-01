import type { TopicContent } from "../types";

export const joins: TopicContent = {
  quickSummary: [
    "JOINs combine rows from two or more tables based on a related column, enabling queries across normalized schemas.",
    "INNER JOIN returns only matching rows; LEFT/RIGHT JOIN returns all rows from one side plus matches; FULL OUTER JOIN returns everything from both sides; CROSS JOIN produces the Cartesian product.",
    "The optimizer chooses between nested loop, hash join, and merge join algorithms based on table sizes, indexes, and join conditions.",
  ],
  detailed: [
    "INNER JOIN returns rows where the join condition is satisfied in both tables. Rows from either table without a match are excluded. This is the most common join type and is the default when you write just JOIN. The join condition is typically an equality on a foreign key (ON orders.customer_id = customers.id), but can be any boolean expression.",
    "LEFT JOIN (LEFT OUTER JOIN) returns all rows from the left table and matched rows from the right. Where there is no match, right-side columns are NULL. RIGHT JOIN is the mirror image. FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no match on either side. These outer joins are essential for detecting missing relationships (e.g., customers with no orders, or orphaned records).",
    "CROSS JOIN produces the Cartesian product — every row from the left table paired with every row from the right. If left has M rows and right has N rows, the result has M x N rows. This is rarely used intentionally, but it is useful for generating combinations (e.g., crossing a list of dates with a list of products for a report matrix).",
    "A self-join joins a table to itself, typically with an alias on each instance. Common use cases include hierarchical data (employees and their managers), comparing rows within the same table (e.g., finding employees with the same salary), and time-series analysis (comparing today's data with yesterday's).",
  ],
  deepDive: [
    "The three main join algorithms have different performance characteristics. Nested Loop Join: for each row in the outer table, scan the inner table for matches. With an index on the inner table's join column, this becomes an index lookup per outer row — efficient when the outer table is small. Hash Join: build a hash table from the smaller table, then probe it for each row of the larger table. O(n + m) but requires memory for the hash table. Merge Join: sort both tables on the join column, then merge them in a single pass. O(n log n + m log m) for sorting, O(n + m) for the merge; efficient when data is already sorted or an index provides order.",
    "Join ordering significantly impacts performance. Joining table A to B to C can have very different costs depending on which join happens first, because intermediate result sizes vary. The optimizer considers all orderings (or uses heuristics for many tables). You can influence this with join_collapse_limit in PostgreSQL or STRAIGHT_JOIN in MySQL, but overriding the optimizer should be a last resort after verifying bad statistics or a known optimizer limitation.",
  ],
  code: [
    {
      language: "sql",
      caption: "All join types demonstrated",
      source: `-- INNER JOIN: customers who have placed orders
SELECT c.name, o.order_id, o.total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;

-- LEFT JOIN: all customers, even those with no orders
SELECT c.name, o.order_id, o.total
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;

-- Finding customers WITHOUT orders (anti-join pattern)
SELECT c.name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;

-- FULL OUTER JOIN: all customers and all orders, matched where possible
SELECT c.name, o.order_id
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id;

-- CROSS JOIN: generate a report matrix
SELECT d.date, p.product_name
FROM generate_series('2024-01-01'::date, '2024-01-31', '1 day') AS d(date)
CROSS JOIN products p;`
    },
    {
      language: "sql",
      caption: "Self-join and multi-table join",
      source: `-- Self-join: employees and their managers
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id;

-- Multi-table join: order details with customer and product info
SELECT
  c.name AS customer,
  o.order_id,
  p.product_name,
  oi.qty,
  oi.unit_price,
  oi.qty * oi.unit_price AS line_total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_id, p.product_name;`
    },
  ],
  diagrams: [
    {
      title: "SQL Join Types Overview",
      kind: "architecture",
      caption: "Each join type controls which rows appear in the result. INNER returns only matches. LEFT keeps all left rows. FULL OUTER keeps all rows from both sides.",
      mermaid: `graph TD
    subgraph Types["Join Types"]
      INNER["INNER JOIN\nonly matching rows\nexcludes unmatched from both sides"]
      LEFT["LEFT JOIN\nall left rows\nNULL for unmatched right columns"]
      RIGHT["RIGHT JOIN\nall right rows\nNULL for unmatched left columns"]
      FULL["FULL OUTER JOIN\nall rows from both\nNULL where no match"]
      CROSS["CROSS JOIN\nCartesian product\nM x N rows"]
    end
    INNER -->|"extend with"| LEFT
    INNER -->|"extend with"| RIGHT
    LEFT -->|"combine"| FULL
    RIGHT -->|"combine"| FULL`,
    },
    {
      title: "Join Algorithm Selection",
      kind: "flow",
      caption: "The query optimizer chooses nested loop, hash join, or merge join based on table sizes, available indexes, and whether the join condition is an equality.",
      mermaid: `flowchart TD
    A["Join needed"] --> B{"Equality\ncondition?"}
    B -->|No| NL["Nested Loop Join\nonly option for\nnon-equality conditions"]
    B -->|Yes| C{"Outer table\nsmall?"}
    C -->|Yes| D{"Index on inner\njoin column?"}
    D -->|Yes| E["Nested Loop\nwith Index Lookup\nbest for small outer"]
    D -->|No| F["Hash Join\nbuild hash table\nfrom smaller side"]
    C -->|No| G{"Both sides\nalready sorted?"}
    G -->|Yes| H["Merge Join\nsingle pass O(n+m)\nmost efficient when sorted"]
    G -->|No| F`,
    },
    {
      title: "Anti-Join Pattern for Missing Relationships",
      kind: "sequence",
      caption: "The anti-join pattern finds rows in table A with no match in table B. LEFT JOIN with IS NULL check and NOT EXISTS are the two preferred approaches.",
      mermaid: `sequenceDiagram
    participant Q as Query Engine
    participant C as Customers Table
    participant O as Orders Table
    Q->>C: scan all customers
    C-->>Q: customer rows including Alice Bob Charlie
    Q->>O: LEFT JOIN on customer_id
    O-->>Q: matches for Alice and Charlie\nno match for Bob
    Q->>Q: WHERE orders.customer_id IS NULL
    Q-->>Q: return Bob only
    Note over Q: NOT EXISTS alternative:\nsubquery returns no rows for Bob\nso Bob passes the WHERE NOT EXISTS filter`,
    },
    {
      title: "Self-Join for Hierarchical Data",
      kind: "network",
      caption: "A self-join connects a table to itself using two aliases to traverse a parent-child relationship such as employees and their managers.",
      mermaid: `graph LR
    subgraph Employees["Employees Table"]
      E1["emp_id=1\nname=CEO\nmanager_id=NULL"]
      E2["emp_id=2\nname=VP Eng\nmanager_id=1"]
      E3["emp_id=3\nname=Dev Lead\nmanager_id=2"]
      E4["emp_id=4\nname=Engineer\nmanager_id=3"]
    end
    E2 -->|"reports to\nJOIN e.manager_id = m.emp_id"| E1
    E3 -->|"reports to"| E2
    E4 -->|"reports to"| E3`,
    },
  ],
  animations: [
    {
      title: "How a LEFT JOIN works row by row",
      steps: [
        { label: "Take first left row", detail: "Read customer 'Alice' from the left (customers) table." },
        { label: "Find matches", detail: "Search the right (orders) table for rows where customer_id matches Alice's ID. Found 2 orders." },
        { label: "Emit matched rows", detail: "Output (Alice, order_1) and (Alice, order_2)." },
        { label: "Take next left row", detail: "Read customer 'Bob'. Search orders — no matches found." },
        { label: "Emit with NULLs", detail: "Output (Bob, NULL, NULL, ...) because LEFT JOIN keeps all left rows, filling right columns with NULL when no match exists." },
      ],
    },
  ],
  comparison: {
    columns: ["Join Type", "Left Unmatched", "Right Unmatched", "Result Size", "Common Use"],
    rows: [
      ["INNER JOIN", "Excluded", "Excluded", "<= min(M, N)", "Matched data only"],
      ["LEFT JOIN", "Included (NULLs)", "Excluded", ">= left table size", "All left + matches; anti-join"],
      ["RIGHT JOIN", "Excluded", "Included (NULLs)", ">= right table size", "All right + matches (rare)"],
      ["FULL OUTER JOIN", "Included (NULLs)", "Included (NULLs)", "Up to M + N", "Complete picture of both sides"],
      ["CROSS JOIN", "N/A", "N/A", "M x N", "Generating combinations"],
    ],
  },
  interviewQA: [
    {
      q: "How do you find rows in table A that have no matching rows in table B?",
      a: "Use a LEFT JOIN with a NULL check (anti-join pattern): SELECT a.* FROM a LEFT JOIN b ON a.id = b.a_id WHERE b.a_id IS NULL. Alternatives include NOT EXISTS (SELECT 1 FROM b WHERE b.a_id = a.id) and NOT IN (SELECT a_id FROM b) — but NOT IN has pitfalls with NULLs (if any b.a_id is NULL, the entire NOT IN returns no rows). LEFT JOIN + IS NULL and NOT EXISTS are generally preferred and often produce the same plan.",
      followUps: ["Why is NOT IN dangerous with NULLs?", "Which anti-join pattern performs best?"],
    },
    {
      q: "What happens if you accidentally omit the ON clause in an INNER JOIN?",
      a: "In standard SQL, omitting ON in an INNER JOIN is a syntax error. However, if you write a comma-separated FROM clause (FROM a, b) without a WHERE condition, you get a CROSS JOIN — the Cartesian product. This is a common bug that produces M x N rows instead of the expected matched set, causing massive result sets and performance problems.",
      followUps: ["What is an implicit join?", "Why are explicit JOIN ... ON preferred over comma joins?"],
    },
    {
      q: "Explain the three join algorithms and when each is used.",
      a: "Nested Loop: iterate over the outer table and look up matches in the inner table. Best when the outer table is small or an index exists on the inner join column. Hash Join: build a hash table from the smaller table, then probe with the larger. Best for large equality joins without indexes. Requires memory proportional to the smaller table. Merge Join: sort both inputs on the join key and merge in one pass. Best when both sides are already sorted (e.g., from an index) or when the data is large enough that the sort cost is amortized.",
      followUps: ["Can hash joins handle non-equality conditions?", "What happens if the hash table doesn't fit in memory?"],
    },
  ],
  followUps: [
    "How do LATERAL joins differ from regular joins?",
    "What is a semi-join and how is it used?",
    "How do joins interact with indexes?",
    "What are the performance implications of joining many tables?",
  ],
  mcqs: [
    {
      q: "What does a LEFT JOIN return for left-table rows that have no match in the right table?",
      options: [
        "Those rows are excluded",
        "Those rows are included with NULLs for right-table columns",
        "Those rows cause an error",
        "Those rows are duplicated",
      ],
      answerIndex: 1,
      explanation: "LEFT JOIN preserves all rows from the left table. Where there is no match on the right, right-side columns are filled with NULL.",
    },
    {
      q: "Which join produces M x N rows if the left table has M rows and the right has N?",
      options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
      answerIndex: 3,
      explanation: "CROSS JOIN produces the Cartesian product — every left row paired with every right row, resulting in M x N rows.",
    },
    {
      q: "Which join algorithm requires an equality condition?",
      options: ["Nested loop join", "Hash join", "Both", "Neither"],
      answerIndex: 1,
      explanation: "Hash joins require equality conditions because they use a hash function on the join key. Nested loop joins can evaluate any condition.",
    },
  ],
  exercises: [
    "Write a query to list all departments and the count of employees in each, including departments with zero employees. Which join type do you need?",
    "Find all products that have never been ordered using three different anti-join patterns (LEFT JOIN + IS NULL, NOT EXISTS, NOT IN). Compare their EXPLAIN plans.",
    "Write a self-join to find pairs of employees who work in the same department but have different managers.",
    "Given tables students, courses, and enrollments, write a query to find students enrolled in ALL courses (relational division problem). Hint: compare the count of their enrollments to the total number of courses.",
  ],
  flashcards: [
    { front: "What is the anti-join pattern?", back: "LEFT JOIN + WHERE right.key IS NULL — returns left rows that have no match in the right table." },
    { front: "What is a self-join?", back: "Joining a table to itself using aliases. Used for hierarchies (employee-manager), comparing rows, and time-series analysis." },
    { front: "Why is NOT IN dangerous with NULL values?", back: "If any value in the subquery result is NULL, NOT IN returns no rows for any input, because x NOT IN (..., NULL, ...) is always NULL (falsy)." },
    { front: "What is a natural join?", back: "A join that automatically matches on all columns with the same name in both tables. Fragile — adding a column can change the join behavior." },
  ],
  revisionNotes: [
    "INNER JOIN: only matching rows from both sides.",
    "LEFT JOIN: all left rows + matches (NULLs for unmatched right).",
    "FULL OUTER JOIN: all rows from both sides, NULLs where no match.",
    "CROSS JOIN: Cartesian product, M x N rows.",
    "Self-join: table joined to itself with aliases.",
    "Anti-join: LEFT JOIN + IS NULL or NOT EXISTS.",
    "Join algorithms: nested loop (indexed), hash join (equality), merge join (sorted).",
    "Join order matters for performance; optimizer decides automatically.",
  ],
  cheatSheet: [
    "INNER JOIN: SELECT ... FROM a JOIN b ON a.id = b.a_id",
    "LEFT JOIN: FROM a LEFT JOIN b ON ... (keeps all from a)",
    "Anti-join: LEFT JOIN + WHERE b.id IS NULL",
    "CROSS JOIN: FROM a CROSS JOIN b (M x N rows)",
    "Self-join: FROM t AS a JOIN t AS b ON a.col = b.col",
    "Multi-table: FROM a JOIN b ON ... JOIN c ON ...",
    "NOT EXISTS (SELECT 1 FROM b WHERE b.id = a.id) — safe anti-join",
    "Avoid NOT IN with nullable columns",
  ],
  resources: [
    { label: "PostgreSQL Documentation — Joins Between Tables", kind: "docs", note: "Official reference for all join types and syntax." },
    { label: "Visual Representation of SQL Joins — C.L. Moffatt", kind: "article", note: "Classic visual guide with Venn diagrams for every join type." },
    { label: "SQL Performance Explained — Markus Winand", kind: "book", note: "Detailed coverage of join algorithms and their performance." },
    { label: "Use The Index, Luke — Join Operations", kind: "article", note: "How indexes affect join performance." },
  ],
  glossary: [
    { term: "Join condition", definition: "The ON clause that specifies how rows from two tables should be matched (e.g., ON a.id = b.a_id)." },
    { term: "Anti-join", definition: "A pattern that returns rows from one table that have no match in another (LEFT JOIN + IS NULL or NOT EXISTS)." },
    { term: "Cartesian product", definition: "Every row from one table paired with every row from another — the result of a CROSS JOIN or an ON-less join." },
    { term: "Equi-join", definition: "A join whose condition uses equality (=). Required for hash joins." },
    { term: "Self-join", definition: "Joining a table to itself, using aliases to distinguish the two instances." },
    { term: "Nested loop join", definition: "For each row in the outer table, scan the inner table for matches. Efficient with an index on the inner table." },
  ],
};
