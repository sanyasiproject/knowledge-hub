import type { TopicContent } from "../types";

export const normalization: TopicContent = {
  quickSummary: [
    "Normalization eliminates data redundancy and update anomalies by decomposing tables according to functional dependencies.",
    "Normal forms progress from 1NF (atomic values) through 2NF, 3NF, BCNF, 4NF, and 5NF, each removing a specific class of redundancy.",
    "Denormalization intentionally reintroduces redundancy for read performance — it is a trade-off, not a failure.",
  ],
  detailed: [
    "Normalization is the process of organizing a relational schema so that every non-trivial functional dependency is properly captured by the table structure. A functional dependency X -> Y means that for any two tuples with the same X value, the Y values must also be identical. When dependencies are not respected, data is duplicated, and updates to one copy can leave others inconsistent — these are update anomalies.",
    "First Normal Form (1NF) requires that every attribute contains only atomic (indivisible) values and that each row is unique. Second Normal Form (2NF) removes partial dependencies — attributes that depend on only part of a composite primary key. Third Normal Form (3NF) removes transitive dependencies — attributes that depend on the key only through another non-key attribute. Boyce-Codd Normal Form (BCNF) is stricter: every determinant (left side of a functional dependency) must be a candidate key.",
    "Fourth Normal Form (4NF) deals with multivalued dependencies — where one attribute independently determines multiple values of another. Fifth Normal Form (5NF, also called Project-Join Normal Form) handles join dependencies that cannot be decomposed further without loss. In practice, most production schemas aim for 3NF or BCNF; 4NF and 5NF are rarely needed outside academic contexts.",
    "Denormalization is the deliberate decision to violate normal forms to optimize read queries. Common patterns include adding redundant columns to avoid joins, pre-computing aggregates, and maintaining materialized views. The cost is additional write complexity and risk of inconsistency. Denormalization should be guided by measured query patterns, not premature optimization.",
  ],
  deepDive: [
    "The decomposition process must be lossless — joining the decomposed tables must reproduce the original data without spurious tuples. It should also be dependency-preserving — all original functional dependencies should be enforceable using only the decomposed tables' constraints. BCNF guarantees lossless decomposition but does not always preserve dependencies. 3NF decomposition (via the synthesis algorithm) guarantees both. This is why some designs stop at 3NF even when BCNF is achievable.",
    "Armstrong's axioms (reflexivity, augmentation, transitivity) form the basis for deriving all functional dependencies from a given set. The closure of an attribute set X (written X+) is all attributes functionally determined by X. Computing closures lets you identify candidate keys: an attribute set is a candidate key if its closure contains all attributes and no proper subset does. Understanding closures is essential for exam-style normalization problems and for reasoning about schema design in practice.",
  ],
  code: [
    {
      language: "sql",
      caption: "Unnormalized table with redundancy",
      source: `-- UNNORMALIZED: student-course with repeated student info
CREATE TABLE enrollment_bad (
  student_id   INT,
  student_name VARCHAR(100),
  student_email VARCHAR(200),   -- repeated for every course
  course_id    INT,
  course_name  VARCHAR(100),    -- repeated for every student
  grade        CHAR(2)
);

-- Problem: updating a student's email requires updating many rows
-- Problem: deleting the last enrollment loses the student's info`
    },
    {
      language: "sql",
      caption: "Normalized to 3NF",
      source: `-- Students table (no course data)
CREATE TABLE students (
  student_id   SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(200) UNIQUE NOT NULL
);

-- Courses table (no student data)
CREATE TABLE courses (
  course_id    SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL
);

-- Junction table: only the relationship and its own attribute
CREATE TABLE enrollments (
  student_id   INT REFERENCES students(student_id),
  course_id    INT REFERENCES courses(course_id),
  grade        CHAR(2),
  PRIMARY KEY (student_id, course_id)
);`
    },
    {
      language: "sql",
      caption: "Identifying a BCNF violation",
      source: `-- Table: course_sections(course_id, section, instructor)
-- FDs: {course_id, section} -> instructor
--       instructor -> course_id  (each instructor teaches one course)
--
-- instructor is a determinant but NOT a candidate key
-- This violates BCNF. Decompose into:
--   instructors(instructor, course_id)
--   sections(section, instructor)

CREATE TABLE instructors (
  instructor  VARCHAR(100) PRIMARY KEY,
  course_id   INT NOT NULL REFERENCES courses(course_id)
);

CREATE TABLE sections (
  section     INT,
  instructor  VARCHAR(100) REFERENCES instructors(instructor),
  PRIMARY KEY (section, instructor)
);`
    },
  ],
  diagrams: [
    {
      title: "Normal Forms Hierarchy",
      kind: "flow",
      caption: "Progression from 1NF to BCNF, each step eliminating a specific type of dependency anomaly.",
      mermaid: `flowchart TD
    UNF["Unnormalized Form\nrepeating groups"] --> NF1["1NF\natomic values, no repeating groups"]
    NF1 --> NF2["2NF\nno partial dependencies on composite key"]
    NF2 --> NF3["3NF\nno transitive dependencies"]
    NF3 --> BCNF["BCNF\nevery determinant is a candidate key"]
    BCNF --> NF4["4NF\nno multi-valued dependencies"]
    NF4 --> NF5["5NF\nno join dependencies"]`,
    },
    {
      title: "1NF to 3NF Decomposition",
      kind: "sequence",
      caption: "Step-by-step decomposition of a flat table into normalized tables eliminating redundancy.",
      mermaid: `sequenceDiagram
    participant Dev as Designer
    participant T as Original Table
    participant S as Students Table
    participant C as Courses Table
    participant E as Enrollments Table

    Dev->>T: identify functional dependencies
    T-->>Dev: student_id -> name, course_id -> name, composite -> grade
    Dev->>S: extract students student_id name
    Dev->>C: extract courses course_id name
    Dev->>E: extract enrollments student_id course_id grade
    Dev->>Dev: verify lossless join
    Note over S,E: No redundancy, no update anomalies`,
    },
    {
      title: "Functional Dependency Graph",
      kind: "network",
      caption: "Shows which columns determine which other columns in an unnormalized table.",
      mermaid: `graph LR
    StudentID["student_id"] -->|determines| Name["student_name"]
    CourseID["course_id"] -->|determines| CourseName["course_name"]
    CourseID -->|determines| Credits["credits"]
    StudentID -->|partial key| Grade["grade"]
    CourseID -->|partial key| Grade
    Name -->|transitive| Dept["dept_name"]
    style Name fill:#fff3cd
    style CourseName fill:#fff3cd`,
    },
    {
      title: "Normalization Trade-offs",
      kind: "mindmap",
      caption: "Benefits of normalization and when denormalization is appropriate.",
      mermaid: `mindmap
    root["Normalization"]
      Benefits
        Eliminates redundancy
        Prevents update anomalies
        Reduces storage
      Costs
        More joins required
        More complex queries
        Higher join latency
      Denormalize When
        Read-heavy workloads
        Reporting and analytics
        OLAP data warehouses`,
    },
  ],
  animations: [
    {
      title: "Normalizing a table from UNF to 3NF",
      steps: [
        { label: "Start with UNF", detail: "An unnormalized table with repeating groups and redundant data: student_id, student_name, {course_id, course_name, grade}." },
        { label: "Apply 1NF", detail: "Flatten repeating groups so every cell is atomic. Each student-course pair becomes its own row." },
        { label: "Identify FDs", detail: "student_id -> student_name; course_id -> course_name; {student_id, course_id} -> grade." },
        { label: "Apply 2NF", detail: "Remove partial dependencies. student_name depends only on student_id (part of the composite key), so extract a students table." },
        { label: "Apply 3NF", detail: "Remove transitive dependencies. course_name depends on course_id, not on the primary key directly. Extract a courses table." },
        { label: "Result", detail: "Three tables: students, courses, enrollments. No redundancy, no update anomalies." },
      ],
    },
  ],
  comparison: {
    columns: ["Normal Form", "Eliminates", "Requirement", "Guarantee"],
    rows: [
      ["1NF", "Repeating groups, non-atomic values", "All values are atomic; rows are unique", "Flat table structure"],
      ["2NF", "Partial dependencies", "Every non-key attribute depends on the whole primary key", "No partial key dependence"],
      ["3NF", "Transitive dependencies", "No non-key attribute depends on another non-key attribute", "Lossless + dependency preserving decomposition"],
      ["BCNF", "Non-candidate-key determinants", "Every determinant is a candidate key", "Lossless decomposition (may lose some FDs)"],
      ["4NF", "Multivalued dependencies", "No non-trivial multivalued dependencies", "Handles independent multi-valued facts"],
      ["5NF", "Join dependencies", "Every join dependency is implied by candidate keys", "Maximal decomposition"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between 3NF and BCNF?",
      a: "3NF allows a non-key attribute to be a determinant if it is part of some candidate key (the 'transitive dependency exception'). BCNF is stricter: every determinant must itself be a candidate key. A table can be in 3NF but not BCNF when there are overlapping candidate keys. The trade-off is that BCNF decomposition is always lossless but may not preserve all functional dependencies, while 3NF decomposition preserves both.",
      followUps: ["Give an example of a table in 3NF but not BCNF.", "When would you prefer 3NF over BCNF?"],
    },
    {
      q: "What are update anomalies and how does normalization prevent them?",
      a: "Update anomalies come in three forms. Insertion anomaly: you cannot insert data without unrelated data (e.g., cannot add a course without a student). Deletion anomaly: deleting the last related row removes unrelated data (e.g., deleting the last enrollment loses the student). Modification anomaly: changing a repeated fact requires updating multiple rows. Normalization prevents these by ensuring each fact is stored in exactly one place.",
      followUps: ["What is a deletion anomaly?", "Can constraints prevent anomalies without normalization?"],
    },
    {
      q: "When and why would you denormalize?",
      a: "Denormalize when measured read performance is unacceptable and the query pattern is well-understood. Common cases: adding a redundant column to avoid a frequent join, storing pre-computed aggregates, or flattening a hierarchy for reporting. The cost is write amplification and consistency risk. Use triggers, materialized views, or application-level logic to keep redundant data in sync. Always start normalized and denormalize based on evidence, not speculation.",
      followUps: ["How do materialized views help with denormalization?", "What is the star schema in data warehousing?"],
    },
  ],
  followUps: [
    "How does normalization relate to indexing strategy?",
    "What is the star schema and how does it relate to denormalization?",
    "How do ORMs handle normalized schemas with many joins?",
    "What is the trade-off between normalization and query performance?",
  ],
  mcqs: [
    {
      q: "A table is in 2NF but has a transitive dependency. What normal form should you apply next?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      answerIndex: 2,
      explanation: "3NF eliminates transitive dependencies — where a non-key attribute depends on the key through another non-key attribute.",
    },
    {
      q: "Which anomaly occurs when you cannot add a new course to the database because no student has enrolled in it yet?",
      options: ["Modification anomaly", "Insertion anomaly", "Deletion anomaly", "Selection anomaly"],
      answerIndex: 1,
      explanation: "An insertion anomaly prevents adding data about one entity without unrelated data about another, due to an overly coupled schema.",
    },
    {
      q: "Armstrong's axioms include reflexivity, augmentation, and which third rule?",
      options: ["Symmetry", "Transitivity", "Commutativity", "Idempotency"],
      answerIndex: 1,
      explanation: "The three Armstrong's axioms are reflexivity (if Y is a subset of X, then X -> Y), augmentation (if X -> Y then XZ -> YZ), and transitivity (if X -> Y and Y -> Z then X -> Z).",
    },
  ],
  exercises: [
    "Given a table with attributes {StudentID, CourseID, CourseName, InstructorID, InstructorName, Grade}, list all functional dependencies and normalize to BCNF.",
    "Compute the closure of {A, B} given FDs: A -> C, BC -> D, D -> E, A -> B. Is {A} a candidate key?",
    "Design a schema for an e-commerce system (products, categories, orders, order items) in 3NF. Identify which denormalizations you might add for a product listing page.",
    "Identify the normal form of: R(A, B, C, D) with FDs A -> B, B -> C, A -> D. Decompose to BCNF if needed.",
  ],
  flashcards: [
    { front: "What does 1NF require?", back: "All attribute values must be atomic (no repeating groups or arrays), and each row must be unique." },
    { front: "What is a partial dependency?", back: "A non-key attribute depends on only part of a composite primary key. Eliminated by 2NF." },
    { front: "What is a transitive dependency?", back: "A non-key attribute depends on the primary key through another non-key attribute (A -> B -> C). Eliminated by 3NF." },
    { front: "What is a functional dependency?", back: "X -> Y means that for any two tuples with the same X values, the Y values are also the same. Y is functionally determined by X." },
    { front: "What is lossless decomposition?", back: "Splitting a table into smaller tables such that joining them exactly reproduces the original data — no rows are lost or spuriously added." },
  ],
  revisionNotes: [
    "1NF: atomic values, unique rows.",
    "2NF: no partial dependencies on composite keys.",
    "3NF: no transitive dependencies (non-key -> non-key).",
    "BCNF: every determinant is a candidate key.",
    "4NF: no non-trivial multivalued dependencies.",
    "Denormalize only after measuring — add redundancy intentionally for known read patterns.",
    "Armstrong's axioms: reflexivity, augmentation, transitivity — derive all FDs from a given set.",
  ],
  cheatSheet: [
    "FD X -> Y: same X implies same Y",
    "Candidate key: minimal set whose closure covers all attributes",
    "1NF: atomic + unique rows",
    "2NF: 1NF + no partial deps on composite PK",
    "3NF: 2NF + no transitive deps (non-key -> non-key)",
    "BCNF: every determinant is a candidate key",
    "Lossless decomposition: R1 JOIN R2 = R (no spurious tuples)",
    "Denormalize = intentionally add redundancy for read speed",
  ],
  resources: [
    { label: "Database System Concepts — Silberschatz, Korth, Sudarshan, Ch. 7", kind: "book", note: "Formal treatment of normalization and functional dependencies." },
    { label: "The Normal Forms — Wikipedia", kind: "article", note: "Good visual reference for the normal form hierarchy." },
    { label: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/", kind: "book", note: "Practical perspective on when normalization helps and when it hurts." },
  ],
  glossary: [
    { term: "Functional dependency", definition: "A constraint X -> Y meaning that identical X values always have identical Y values." },
    { term: "Partial dependency", definition: "A non-key attribute depends on a proper subset of a composite primary key." },
    { term: "Transitive dependency", definition: "A non-key attribute depends on the primary key indirectly through another non-key attribute." },
    { term: "Determinant", definition: "The left-hand side of a functional dependency — the attribute(s) that determine other attributes." },
    { term: "Decomposition", definition: "Splitting a relation into smaller relations to eliminate redundancy while preserving data." },
    { term: "Denormalization", definition: "Intentionally introducing redundancy into a normalized schema to improve read performance." },
    { term: "Closure", definition: "The set of all attributes functionally determined by a given set of attributes, written X+." },
  ],
};
