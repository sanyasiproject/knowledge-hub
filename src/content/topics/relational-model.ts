import type { TopicContent } from "../types";

export const relationalModel: TopicContent = {
  quickSummary: [
    "The relational model organizes data into tables (relations) of rows (tuples) and columns (attributes), providing a mathematical foundation for databases.",
    "Keys enforce identity and relationships: primary keys uniquely identify rows, foreign keys link tables, and candidate keys are minimal unique identifiers.",
    "Relational algebra (select, project, join, union, difference) defines the operations the database engine uses to answer queries.",
  ],
  detailed: [
    "Edgar Codd introduced the relational model in 1970 to separate the logical view of data from its physical storage. A relation is a set of tuples that share the same attributes. Because it is a set, no two tuples are identical, and the order of tuples and attributes is irrelevant. This mathematical grounding gives the model its power: queries are declarative, and the engine is free to choose any execution strategy that produces the correct set.",
    "A schema defines the structure — relation names, attribute names, domains (data types), and constraints. Constraints include domain constraints (a column's allowed values), key constraints (uniqueness), entity integrity (primary keys cannot be null), and referential integrity (foreign key values must match an existing primary key or be null). Together these constraints keep the data consistent without application-level enforcement.",
    "Relational algebra provides six fundamental operations: selection (sigma — filter rows), projection (pi — choose columns), Cartesian product (cross join), union, set difference, and rename. From these, derived operations like natural join, theta join, division, and intersection are built. SQL is a practical realization of relational calculus — a declarative cousin of relational algebra — where you describe what you want and the optimizer decides how to compute it.",
    "The relational model separates the three schema levels: external (views seen by applications), conceptual (the logical schema), and internal (physical storage). This data independence means you can reorganize storage or add indexes without changing application queries, and you can present different views to different users without duplicating data.",
  ],
  deepDive: [
    "Codd's 12 rules (actually 13, numbered 0-12) define the criteria a database must meet to be considered fully relational. Rule 0 states the system must manage data entirely through its relational capabilities. Rule 1 (the information rule) says all data must be represented as values in tables. Rule 2 requires every datum to be accessible by table name, primary key, and column name. Most commercial databases satisfy the spirit but not the letter of all 13 rules — for example, many allow duplicate rows unless explicitly constrained, violating the set semantics of the model.",
    "The distinction between relational algebra and relational calculus matters for optimization. Algebra is procedural — it specifies a sequence of operations. Calculus is declarative — it specifies the properties of the desired result. SQL sits closer to calculus (you write predicates, not operation sequences), but the optimizer internally rewrites queries into an algebraic execution plan, choosing join orders, access methods, and parallelism. Understanding both helps you write queries the optimizer can reason about and predict when it will struggle (e.g., correlated subqueries that resist decorrelation).",
  ],
  code: [
    {
      language: "sql",
      caption: "Creating a relational schema with keys and constraints",
      source: `CREATE TABLE departments (
  dept_id   SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE employees (
  emp_id    SERIAL PRIMARY KEY,
  name      VARCHAR(200) NOT NULL,
  email     VARCHAR(255) UNIQUE,
  dept_id   INT NOT NULL REFERENCES departments(dept_id),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Candidate key: email is also a unique identifier
-- Foreign key: dept_id references departments(dept_id)`
    },
    {
      language: "sql",
      caption: "Relational algebra expressed as SQL",
      source: `-- Selection (sigma): filter rows
SELECT * FROM employees WHERE dept_id = 3;

-- Projection (pi): choose columns
SELECT name, email FROM employees;

-- Natural join: combine by common attribute
SELECT e.name, d.name AS department
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id;

-- Set union (requires union-compatible relations)
SELECT name FROM employees
UNION
SELECT name FROM contractors;

-- Set difference
SELECT name FROM employees
EXCEPT
SELECT name FROM terminated_employees;`
    },
  ],
  diagrams: [
    {
      title: "Relational Model Core Concepts",
      kind: "mindmap",
      caption: "Core concepts of the relational model: relations, tuples, attributes, keys, and constraints that enforce data integrity.",
      mermaid: `mindmap
  root((Relational Model))
    Relation
      Table with rows and columns
      Set of tuples
      Schema defines structure
    Keys
      Primary Key - unique identifier
      Foreign Key - references another table
      Candidate Key - minimal superkey
    Constraints
      Entity Integrity
      Referential Integrity
      Domain Constraints
    Operations
      Select
      Project
      Join
      Union`,
    },
    {
      title: "Entity Relationship to Tables",
      kind: "architecture",
      caption: "How an entity-relationship model maps to relational tables with primary and foreign keys maintaining referential integrity.",
      mermaid: `graph TD
    subgraph ER["Entity-Relationship"]
      E1[Customer Entity]
      E2[Order Entity]
      E3[Product Entity]
      E1 -->|places| E2
      E2 -->|contains| E3
    end
    subgraph Tables["Relational Tables"]
      T1[customers - id PK - name - email]
      T2[orders - id PK - customer_id FK - date]
      T3[order_items - order_id FK - product_id FK - qty]
      T4[products - id PK - name - price]
      T1 --> T2
      T2 --> T3
      T3 --> T4
    end`,
    },
    {
      title: "Normalization Progression",
      kind: "flow",
      caption: "The normalization process from an unnormalized relation through 1NF, 2NF, and 3NF, eliminating different types of data anomalies at each step.",
      mermaid: `flowchart TD
    A[Unnormalized Data] --> B{Atomic values in all columns?}
    B -->|No| C[Split repeating groups]
    C --> B
    B -->|Yes| D[1NF - First Normal Form]
    D --> E{All non-key attrs fully dependent on PK?}
    E -->|No| F[Remove partial dependencies]
    F --> E
    E -->|Yes| G[2NF - Second Normal Form]
    G --> H{No transitive dependencies?}
    H -->|No| I[Remove transitive dependencies]
    I --> H
    H -->|Yes| J[3NF - Third Normal Form]`,
    },
    {
      title: "SQL Join Types on Relational Tables",
      kind: "architecture",
      caption: "Visual representation of how INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN combine rows from two relational tables.",
      mermaid: `graph LR
    subgraph TableA["Table A"]
      A1[Row 1]
      A2[Row 2]
      A3[Row 3 - no match]
    end
    subgraph TableB["Table B"]
      B1[Row 1]
      B2[Row 2]
      B4[Row 4 - no match]
    end
    A1 -->|INNER JOIN| B1
    A2 -->|INNER JOIN| B2
    A3 -->|LEFT JOIN only| L[Left result only]
    B4 -->|RIGHT JOIN only| R[Right result only]`,
    },
  ],
  animations: [
    {
      title: "How a foreign key enforces referential integrity",
      steps: [
        { label: "Insert parent", detail: "A row is inserted into departments with dept_id = 5." },
        { label: "Insert child", detail: "A row is inserted into employees with dept_id = 5. The database checks that dept_id 5 exists in departments." },
        { label: "Violation attempt", detail: "An insert into employees with dept_id = 99 is attempted. No department 99 exists." },
        { label: "Rejection", detail: "The database rejects the insert with a foreign key violation error, preserving referential integrity." },
      ],
    },
  ],
  comparison: {
    columns: ["Concept", "Formal Term", "SQL Term", "Example"],
    rows: [
      ["Table", "Relation", "TABLE", "employees"],
      ["Row", "Tuple", "ROW / record", "('Alice', 'alice@co.com', 3)"],
      ["Column", "Attribute", "COLUMN / field", "email"],
      ["Data type", "Domain", "TYPE / DOMAIN", "VARCHAR(255)"],
      ["Unique identifier", "Primary key", "PRIMARY KEY", "emp_id"],
      ["Cross-table link", "Foreign key", "FOREIGN KEY REFERENCES", "dept_id -> departments(dept_id)"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between a candidate key and a primary key?",
      a: "A candidate key is any minimal set of attributes that uniquely identifies every tuple in a relation. A primary key is the candidate key chosen by the designer to be the main identifier. For example, both emp_id and email might be candidate keys, but emp_id is typically chosen as the primary key because it is stable and compact. All candidate keys enforce uniqueness; the primary key additionally cannot be null.",
      followUps: ["What is a super key?", "Can a table have multiple candidate keys?"],
    },
    {
      q: "What is referential integrity and how is it enforced?",
      a: "Referential integrity ensures that every foreign key value in a child table matches an existing primary key in the referenced parent table, or is null. The database enforces this by rejecting inserts/updates that would create orphan references, and by providing ON DELETE/UPDATE actions (CASCADE, SET NULL, RESTRICT) to handle parent deletions.",
      followUps: ["What happens with circular foreign keys?", "How do cascading deletes work?"],
    },
    {
      q: "Explain the difference between relational algebra and relational calculus.",
      a: "Relational algebra is procedural — you specify a sequence of operations (select, project, join) to derive the result. Relational calculus is declarative — you describe the properties the result must satisfy without specifying how to compute it. SQL is based on relational calculus (specifically tuple relational calculus), but the query optimizer converts it into an algebraic execution plan. Both are equivalent in expressive power (Codd's theorem).",
      followUps: ["What is Codd's theorem?", "How does the optimizer choose between different algebraic plans?"],
    },
  ],
  followUps: [
    "How does normalization build on the relational model?",
    "What are the limitations of the relational model for hierarchical data?",
    "How do ORMs map objects to the relational model?",
    "When would a non-relational model be a better fit?",
  ],
  mcqs: [
    {
      q: "In the relational model, what guarantees that no two rows in a table are identical?",
      options: ["Foreign key constraint", "Primary key constraint", "CHECK constraint", "NOT NULL constraint"],
      answerIndex: 1,
      explanation: "A primary key (or any candidate key) ensures every row is uniquely identifiable. The relational model defines a relation as a set, so duplicates are not permitted.",
    },
    {
      q: "Which relational algebra operation corresponds to SQL's WHERE clause?",
      options: ["Projection (pi)", "Selection (sigma)", "Cartesian product", "Rename"],
      answerIndex: 1,
      explanation: "Selection (sigma) filters tuples based on a predicate, directly analogous to SQL's WHERE clause.",
    },
    {
      q: "What does data independence mean in the three-schema architecture?",
      options: [
        "Data is stored without any schema",
        "Applications can work without a database",
        "Changes to storage structure don't require changes to logical queries",
        "Each table is independent of every other table",
      ],
      answerIndex: 2,
      explanation: "Data independence means the logical schema insulates applications from physical storage changes, and external views insulate them from logical schema changes.",
    },
  ],
  exercises: [
    "Design a relational schema for a library system with books, authors (many-to-many), members, and loans. Identify all candidate keys.",
    "Write the relational algebra expression for: find names of employees in the 'Engineering' department. Then write the equivalent SQL.",
    "Given tables orders(order_id, customer_id, total) and customers(customer_id, name), express a natural join in both relational algebra notation and SQL.",
    "Identify which of Codd's 12 rules your favorite database violates and explain the practical implications.",
  ],
  flashcards: [
    { front: "What is a relation in the relational model?", back: "A set of tuples sharing the same attributes — conceptually a table with rows and columns, where no duplicate rows exist and row/column order is irrelevant." },
    { front: "What is a candidate key?", back: "A minimal set of attributes that uniquely identifies every tuple in a relation. Minimal means no proper subset is also unique." },
    { front: "What is entity integrity?", back: "The rule that no attribute participating in the primary key may be null." },
    { front: "What is referential integrity?", back: "Every foreign key value must match an existing primary key in the referenced table, or be null." },
    { front: "Name the six fundamental operations of relational algebra.", back: "Selection (sigma), projection (pi), Cartesian product, union, set difference, and rename." },
  ],
  revisionNotes: [
    "Relation = table, tuple = row, attribute = column, domain = data type.",
    "Primary key: chosen candidate key, must be unique and non-null.",
    "Foreign key: references another table's primary key — enforces referential integrity.",
    "Relational algebra is procedural; relational calculus is declarative; both are equally expressive.",
    "Three-schema architecture: external (views), conceptual (logical), internal (physical) — provides data independence.",
    "Codd's 12 rules define what it means to be a fully relational database.",
  ],
  cheatSheet: [
    "PRIMARY KEY = unique + NOT NULL",
    "FOREIGN KEY col REFERENCES parent(pk) — enforces referential integrity",
    "UNIQUE constraint = candidate key",
    "SELECT = projection (pi), WHERE = selection (sigma), JOIN = natural join",
    "UNION / EXCEPT / INTERSECT — set operations require union-compatible schemas",
    "ON DELETE CASCADE | SET NULL | RESTRICT — foreign key actions",
  ],
  resources: [
    { label: "A Relational Model of Data for Large Shared Data Banks — E.F. Codd (1970)", kind: "paper", note: "The foundational paper that introduced the relational model." },
    { label: "Database System Concepts — Silberschatz, Korth, Sudarshan", kind: "book", note: "Comprehensive textbook covering relational theory and implementation." },
    { label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/", kind: "book", note: "Chapter 2 covers data models and query languages." },
    { label: "PostgreSQL Documentation — Data Definition", url: "https://www.postgresql.org/docs/current/", kind: "docs", note: "Practical reference for creating relational schemas." },
  ],
  glossary: [
    { term: "Relation", definition: "A table — a set of tuples with a common set of attributes." },
    { term: "Tuple", definition: "A row — an ordered set of attribute values representing a single entity." },
    { term: "Attribute", definition: "A column — a named property with a defined domain (data type)." },
    { term: "Domain", definition: "The set of allowed values for an attribute (e.g., integers, strings of length <= 100)." },
    { term: "Primary key", definition: "The candidate key chosen as the main unique identifier for a relation's tuples." },
    { term: "Foreign key", definition: "An attribute (or set) whose values reference the primary key of another relation." },
    { term: "Candidate key", definition: "A minimal set of attributes that uniquely identifies every tuple — a table may have several." },
    { term: "Super key", definition: "Any set of attributes that uniquely identifies tuples — a superset of a candidate key." },
  ],
};
