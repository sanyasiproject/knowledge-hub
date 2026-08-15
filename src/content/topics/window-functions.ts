import type { TopicContent } from "../types";

export const windowFunctions: TopicContent = {
  quickSummary: [
    "Window functions compute values across a set of rows related to the current row without collapsing them into a single output row like GROUP BY does.",
    "The OVER clause defines the window: PARTITION BY groups rows, ORDER BY sorts within each partition, and frame clauses (ROWS/RANGE/GROUPS) define which rows to include.",
    "Common window functions: ROW_NUMBER, RANK, DENSE_RANK for ranking; LAG, LEAD for accessing adjacent rows; SUM/AVG OVER for running totals and moving averages.",
  ],
  detailed: [
    "Window functions differ from aggregate functions in a crucial way: they do not reduce the number of rows. Each input row produces one output row, but the function can access other rows in its window (partition). This enables calculations like rankings, running totals, row-to-row comparisons, and moving averages — all of which are awkward or impossible with GROUP BY alone.",
    "The OVER clause has three parts. PARTITION BY divides rows into independent partitions (like GROUP BY, but without collapsing). ORDER BY defines the order within each partition (required for ranking and frame functions). The frame clause (ROWS BETWEEN ... AND ..., RANGE BETWEEN, or GROUPS BETWEEN) defines which rows relative to the current row are included in the calculation. The default frame when ORDER BY is present is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
    "Ranking functions assign positions to rows. ROW_NUMBER gives a unique sequential number (no ties). RANK gives the same number to ties but skips positions (1, 2, 2, 4). DENSE_RANK gives the same number to ties without skipping (1, 2, 2, 3). NTILE(n) distributes rows into n roughly equal groups.",
    "LAG(column, offset, default) accesses a previous row's value; LEAD(column, offset, default) accesses a following row. FIRST_VALUE and LAST_VALUE return the first and last values in the window frame. These are powerful for time-series analysis: comparing today's sales to yesterday's, computing period-over-period growth, and finding the first/last event in a sequence.",
  ],
  deepDive: [
    "The frame clause subtlety is a common source of bugs. When ORDER BY is specified, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — this includes all rows from the start of the partition to the current row's peer group (rows with the same ORDER BY value). For LAST_VALUE, this means it returns the current row's value (not the partition's last), because the frame ends at the current row. To get the true last value, you must specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. Understanding frames is essential for correct running totals and moving averages.",
    "Named windows (WINDOW w AS (...)) let you define a window once and reuse it across multiple functions, reducing repetition and ensuring consistency. Multiple window functions in the same SELECT can use different windows. The optimizer often computes all window functions in a single pass over the sorted data, making them more efficient than equivalent self-join or correlated subquery approaches.",
  ],
  code: [
    {
      language: "sql",
      caption: "Ranking functions",
      source: `SELECT
  emp_id,
  dept_id,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS overall_rank,
  RANK()       OVER (ORDER BY salary DESC) AS rank_with_gaps,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS rank_no_gaps,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank,
  NTILE(4)     OVER (ORDER BY salary DESC) AS salary_quartile
FROM employees;

-- Top 3 earners per department
SELECT * FROM (
  SELECT emp_id, dept_id, salary,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employees
) ranked
WHERE rn <= 3;`
    },
    {
      language: "sql",
      caption: "Running totals and moving averages",
      source: `-- Running total of daily revenue
SELECT
  order_date,
  daily_revenue,
  SUM(daily_revenue) OVER (ORDER BY order_date) AS running_total,
  AVG(daily_revenue) OVER (
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS seven_day_moving_avg
FROM daily_sales;

-- Cumulative percentage
SELECT
  product_name,
  revenue,
  SUM(revenue) OVER (ORDER BY revenue DESC) AS cumulative,
  ROUND(
    100.0 * SUM(revenue) OVER (ORDER BY revenue DESC) /
    SUM(revenue) OVER (),
    2
  ) AS cumulative_pct
FROM product_revenue;`
    },
    {
      language: "sql",
      caption: "LAG, LEAD, and period-over-period comparison",
      source: `-- Month-over-month revenue growth
SELECT
  month,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY month) AS prev_month,
  revenue - LAG(revenue, 1) OVER (ORDER BY month) AS growth,
  ROUND(
    100.0 * (revenue - LAG(revenue, 1) OVER (ORDER BY month)) /
    NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0),
    2
  ) AS growth_pct
FROM monthly_revenue;

-- Difference from department average
SELECT
  emp_id, dept_id, salary,
  AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY dept_id) AS diff_from_avg
FROM employees;

-- FIRST_VALUE and LAST_VALUE
SELECT
  emp_id, dept_id, hire_date,
  FIRST_VALUE(emp_id) OVER (
    PARTITION BY dept_id ORDER BY hire_date
  ) AS first_hired,
  LAST_VALUE(emp_id) OVER (
    PARTITION BY dept_id ORDER BY hire_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_hired
FROM employees;`
    },
  ],
  diagrams: [
    {
      title: "SQL Window Function Anatomy",
      kind: "architecture",
      caption: "Structure of a window function clause showing OVER, PARTITION BY, ORDER BY, and frame specification.",
      mermaid: `graph TD
    WF["Window Function
SUM, RANK, LAG"] --> OV["OVER clause
defines the window"]
    OV --> PB["PARTITION BY
divide rows into groups"]
    OV --> OB["ORDER BY
sort within partition"]
    OV --> FR["Frame
ROWS or RANGE bounds"]
    FR --> RS["ROWS BETWEEN
UNBOUNDED PRECEDING
AND CURRENT ROW"]
    PB --> P1["Partition 1
dept = Sales"]
    PB --> P2["Partition 2
dept = Eng"]`,
    },
    {
      title: "Window Function Types",
      kind: "mindmap",
      caption: "Categories of SQL window functions: ranking, analytic, and aggregate with examples.",
      mermaid: `mindmap
  root((Window Functions))
    Ranking
      ROW_NUMBER unique rank
      RANK gaps on tie
      DENSE_RANK no gaps
      NTILE buckets
    Analytic
      LAG previous row value
      LEAD next row value
      FIRST_VALUE partition first
      LAST_VALUE partition last
    Aggregate
      SUM running total
      AVG moving average
      COUNT cumulative count
      MAX running maximum`,
    },
    {
      title: "Window Function Execution Flow",
      kind: "flow",
      caption: "How the database engine processes a query with window functions after the WHERE and GROUP BY phases.",
      mermaid: `flowchart TD
    A["Full table or join result"] --> B["Apply WHERE filter"]
    B --> C["Apply GROUP BY
if present"]
    C --> D["Apply HAVING
if present"]
    D --> E["Evaluate Window Functions
over partitioned rows"]
    E --> F["Apply SELECT columns
with window results"]
    F --> G["Apply ORDER BY
final sort"]
    G --> H["Apply LIMIT
return rows"]`,
    },
    {
      title: "Running Total Sequence",
      kind: "sequence",
      caption: "How SUM with ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW computes a running total.",
      mermaid: `sequenceDiagram
    participant Q as Query Engine
    participant W as Window Frame
    participant R as Result Set
    Q->>W: partition by dept, order by date
    W->>W: row 1: amount=100, frame=[100]
    W->>R: running_total=100
    W->>W: row 2: amount=200, frame=[100,200]
    W->>R: running_total=300
    W->>W: row 3: amount=150, frame=[100,200,150]
    W->>R: running_total=450`,
    },
  ],
  animations: [
    {
      title: "How a running total window works",
      steps: [
        { label: "Partition and order", detail: "Rows are partitioned (if PARTITION BY specified) and sorted by ORDER BY within each partition." },
        { label: "Frame for row 1", detail: "Current row is row 1. Frame is UNBOUNDED PRECEDING to CURRENT ROW: just row 1. SUM = 100." },
        { label: "Frame for row 2", detail: "Frame includes rows 1-2. SUM = 100 + 200 = 300." },
        { label: "Frame for row 3", detail: "Frame includes rows 1-3. SUM = 100 + 200 + 150 = 450." },
        { label: "Result", detail: "Each row retains its original data plus a running total column. No rows are collapsed." },
      ],
    },
  ],
  comparison: {
    columns: ["Function", "Ties", "Gaps", "Example Output"],
    rows: [
      ["ROW_NUMBER()", "Arbitrary (unique)", "No gaps", "1, 2, 3, 4, 5"],
      ["RANK()", "Same rank for ties", "Gaps after ties", "1, 2, 2, 4, 5"],
      ["DENSE_RANK()", "Same rank for ties", "No gaps", "1, 2, 2, 3, 4"],
      ["NTILE(3)", "Distributes into N groups", "Groups sized ceil(count/N)", "1, 1, 2, 2, 3"],
    ],
  },
  interviewQA: [
    {
      q: "How do you get the top N rows per group?",
      a: "Use ROW_NUMBER() OVER (PARTITION BY group_col ORDER BY sort_col DESC) in a subquery or CTE, then filter WHERE rn <= N in the outer query. ROW_NUMBER gives unique ranks (no ties), so you get exactly N rows per group. If you want all tied rows at rank N, use RANK() or DENSE_RANK() instead.",
      followUps: ["What if you want exactly N per group with no randomness in ties?", "Can you use LIMIT per group without window functions?"],
    },
    {
      q: "Why does LAST_VALUE often return the current row's value?",
      a: "Because the default frame when ORDER BY is present is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. LAST_VALUE of this frame is the current row itself (or its peer group). To get the true last value in the partition, explicitly set the frame to ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.",
      followUps: ["What is the difference between ROWS and RANGE frames?", "What is a peer group?"],
    },
    {
      q: "How would you compute a 7-day moving average?",
      a: "Use AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). This includes the current row and the 6 preceding rows (7 total). Use ROWS (not RANGE) to count exactly 7 physical rows regardless of gaps in dates. If there are missing dates, you may need to fill gaps with generate_series first, otherwise the window includes more than 7 calendar days.",
      followUps: ["What happens if some dates are missing?", "What is the difference between ROWS and RANGE for this?"],
    },
  ],
  followUps: [
    "How do window functions perform compared to self-joins?",
    "Can you use window functions in WHERE or HAVING?",
    "What are named windows and how do they reduce duplication?",
    "How do window functions interact with DISTINCT?",
  ],
  mcqs: [
    {
      q: "What is the default window frame when ORDER BY is specified?",
      options: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
        "No frame is applied",
      ],
      answerIndex: 1,
      explanation: "When ORDER BY is present, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes all rows from the start of the partition to the current row's peer group.",
    },
    {
      q: "RANK() over values [10, 20, 20, 30] produces:",
      options: ["1, 2, 3, 4", "1, 2, 2, 3", "1, 2, 2, 4", "1, 2, 3, 3"],
      answerIndex: 2,
      explanation: "RANK gives tied values the same rank but leaves gaps. Both 20s get rank 2, then 30 gets rank 4 (skipping 3).",
    },
    {
      q: "Can you filter on a window function result directly in the WHERE clause?",
      options: ["Yes", "No, use a subquery or CTE", "Only in PostgreSQL", "Only with HAVING"],
      answerIndex: 1,
      explanation: "Window functions are evaluated after WHERE in the logical processing order. To filter on their results, wrap the query in a subquery or CTE and filter in the outer query.",
    },
  ],
  exercises: [
    "Find the top 3 highest-paid employees per department using ROW_NUMBER. Then modify to include all employees tied for third place.",
    "Compute month-over-month revenue growth percentage using LAG. Handle the first month (where there is no previous month) gracefully.",
    "Calculate a 30-day moving average of daily signups. Fill in missing dates with zero signups using generate_series.",
    "Use NTILE(4) to divide employees into salary quartiles. Then compute the average salary per quartile.",
  ],
  flashcards: [
    { front: "How does a window function differ from GROUP BY?", back: "Window functions compute a value across related rows without collapsing them — every input row produces an output row. GROUP BY collapses rows into groups." },
    { front: "What are the three parts of the OVER clause?", back: "PARTITION BY (group rows), ORDER BY (sort within partition), and frame clause (ROWS/RANGE/GROUPS BETWEEN ... AND ...)." },
    { front: "What does LAG(col, 2, 0) do?", back: "Returns the value of col from 2 rows before the current row (within the partition). If there is no such row, returns 0 (the default)." },
    { front: "Why is LAST_VALUE often wrong?", back: "The default frame ends at CURRENT ROW. LAST_VALUE of that frame is the current row. Fix: use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING." },
    { front: "What does NTILE(4) do?", back: "Divides ordered rows into 4 roughly equal groups, assigning each row a group number from 1 to 4." },
  ],
  revisionNotes: [
    "Window functions: compute across rows WITHOUT collapsing (unlike GROUP BY).",
    "OVER clause: PARTITION BY + ORDER BY + frame.",
    "Default frame with ORDER BY: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
    "Rankings: ROW_NUMBER (unique), RANK (gaps), DENSE_RANK (no gaps), NTILE (buckets).",
    "Navigation: LAG (previous), LEAD (next), FIRST_VALUE, LAST_VALUE.",
    "Running total: SUM(x) OVER (ORDER BY col).",
    "Moving average: AVG(x) OVER (ORDER BY col ROWS BETWEEN N PRECEDING AND CURRENT ROW).",
    "Cannot use window functions in WHERE — wrap in subquery or CTE.",
  ],
  cheatSheet: [
    "ROW_NUMBER() OVER (PARTITION BY g ORDER BY s) — unique rank per group",
    "RANK() / DENSE_RANK() — with/without gaps on ties",
    "LAG(col, n, default) / LEAD(col, n, default) — adjacent rows",
    "SUM(col) OVER (ORDER BY x) — running total",
    "AVG(col) OVER (ORDER BY x ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — 7-day moving avg",
    "FIRST_VALUE(col) / LAST_VALUE(col) — first/last in frame",
    "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — full partition frame",
    "WINDOW w AS (PARTITION BY dept ORDER BY salary) — named window",
  ],
  resources: [
    { label: "PostgreSQL Documentation — Window Functions", url: "https://www.postgresql.org/docs/current/", kind: "docs", note: "Official reference with all built-in window functions." },
    { label: "Modern SQL — Window Functions", kind: "article", note: "Excellent tutorial on window functions and frames." },
    { label: "SQL Window Functions Cheat Sheet — LearnSQL", kind: "article", note: "Visual guide to all window function types." },
    { label: "SQL Performance Explained — Markus Winand", kind: "book", note: "How window functions are executed and optimized." },
  ],
  glossary: [
    { term: "Window function", definition: "A function that operates on a set of rows (window) related to the current row, without collapsing them." },
    { term: "Partition", definition: "A subset of rows defined by PARTITION BY, within which the window function operates independently." },
    { term: "Frame", definition: "The subset of the partition's rows that a window function considers for each row, defined by ROWS/RANGE/GROUPS BETWEEN." },
    { term: "Peer group", definition: "Rows that have the same ORDER BY value within a partition. RANGE frames treat peers as a unit." },
    { term: "ROW_NUMBER", definition: "Assigns a unique sequential integer to each row within its partition, ordered by the ORDER BY clause." },
    { term: "LAG / LEAD", definition: "Access a value from a previous (LAG) or following (LEAD) row relative to the current row." },
  ],
};
