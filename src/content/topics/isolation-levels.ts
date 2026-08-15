import type { TopicContent } from "../types";

export const isolationLevels: TopicContent = {
  quickSummary: [
    "Isolation levels control how much concurrent transactions can see of each other's changes, trading consistency for performance.",
    "The four SQL standard levels — Read Uncommitted, Read Committed, Repeatable Read, Serializable — progressively prevent dirty reads, non-repeatable reads, and phantom reads.",
    "MVCC (Multi-Version Concurrency Control) enables high concurrency by keeping multiple versions of each row, so readers never block writers and vice versa.",
  ],
  detailed: [
    "Read Uncommitted allows dirty reads — a transaction can see another transaction's uncommitted changes that might later be rolled back. This is rarely used in practice because the data is unreliable. PostgreSQL does not implement Read Uncommitted at all; its minimum is Read Committed.",
    "Read Committed (the PostgreSQL and Oracle default) ensures each statement sees only data committed before it started. However, if a transaction runs two identical queries, the results can differ because other transactions may commit between them — this is a non-repeatable read. Each statement gets a fresh snapshot.",
    "Repeatable Read guarantees that once a transaction reads a row, subsequent reads within the same transaction return the same value. PostgreSQL implements this with snapshot isolation: the transaction sees a consistent snapshot taken at its first query. However, pure snapshot isolation allows write skew — two transactions can each read a value, make decisions based on it, and write without conflict, producing an outcome that no serial execution would allow.",
    "Serializable is the strongest level: transactions behave as if executed one at a time. PostgreSQL implements Serializable Snapshot Isolation (SSI), which detects dangerous patterns of read-write dependencies and aborts one of the conflicting transactions. It provides true serializability without the performance penalty of strict two-phase locking, but transactions may be retried on conflict.",
  ],
  deepDive: [
    "MVCC works by assigning each row version a transaction ID (xmin = creating transaction, xmax = deleting transaction). When a row is updated, the old version is marked with xmax and a new version is created with a new xmin. A reading transaction applies visibility rules: a row version is visible if xmin committed before the snapshot and xmax is either not set or committed after the snapshot. This means readers never block writers and writers never block readers — a huge concurrency advantage over lock-based isolation.",
    "Write skew is the subtle anomaly that Repeatable Read (snapshot isolation) allows. Example: two doctors are on call. Each checks that at least two doctors are on call, then removes themselves. Under snapshot isolation, both see two doctors, both remove themselves, and now zero doctors are on call — an invariant violation no serial execution would produce. Serializable isolation detects this via SSI's dependency graph: it identifies a cycle in the read-write dependencies and aborts one transaction. Applications using Repeatable Read must guard against write skew with explicit locking (SELECT ... FOR UPDATE) or application-level checks.",
  ],
  code: [
    {
      language: "sql",
      caption: "Setting isolation levels in PostgreSQL",
      source: `-- Set for a single transaction
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM accounts WHERE id = 1;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- Set session default
SET default_transaction_isolation = 'repeatable read';

-- Check current level
SHOW transaction_isolation;`
    },
    {
      language: "sql",
      caption: "Demonstrating non-repeatable read (Read Committed)",
      source: `-- Session 1 (Read Committed)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Returns 1000

-- Session 2 commits an update
-- UPDATE accounts SET balance = 500 WHERE id = 1; COMMIT;

SELECT balance FROM accounts WHERE id = 1;  -- Returns 500 (changed!)
COMMIT;

-- Under Repeatable Read, the second SELECT would still return 1000`
    },
    {
      language: "sql",
      caption: "Preventing write skew with explicit locking",
      source: `-- Under Repeatable Read, guard against write skew
BEGIN ISOLATION LEVEL REPEATABLE READ;

-- Lock the rows we depend on
SELECT * FROM doctors WHERE on_call = true FOR UPDATE;

-- Now safe to check count and update
-- Other transactions trying to update these rows will block
UPDATE doctors SET on_call = false WHERE id = 42;
COMMIT;`
    },
  ],
  diagrams: [
    {
      title: "Isolation Levels and Prevented Anomalies",
      kind: "architecture",
      caption: "Each isolation level progressively prevents more anomalies. PostgreSQL's Repeatable Read uses snapshot isolation which also prevents phantoms, and Serializable adds SSI to catch write skew.",
      mermaid: `graph LR
    subgraph Levels["Isolation Levels - Strictest at Bottom"]
      RU["Read Uncommitted\ndirty reads allowed\nrarely used"]
      RC["Read Committed\nprevents dirty reads\ndefault in PostgreSQL and Oracle"]
      RR["Repeatable Read\nprevents non-repeatable reads\nsnapshot isolation in PostgreSQL"]
      SER["Serializable\nprevents write skew\nSSI detects dependency cycles"]
    end
    RU -->|adds protection| RC
    RC -->|adds protection| RR
    RR -->|adds protection| SER
    DIRTY["Dirty Read"] -.->|prevented at| RC
    NRR["Non-Repeatable Read"] -.->|prevented at| RR
    PHANTOM["Phantom Read"] -.->|prevented at| RR
    WS["Write Skew"] -.->|prevented at| SER`,
    },
    {
      title: "MVCC Row Version Visibility",
      kind: "sequence",
      caption: "MVCC tags each row version with xmin and xmax transaction IDs. A snapshot sees only versions where xmin committed before the snapshot and xmax did not.",
      mermaid: `sequenceDiagram
    participant T100 as Transaction 100
    participant T200 as Transaction 200
    participant T250 as Reader at snapshot 250
    participant DB as Row Storage
    T100->>DB: INSERT row\nxmin=100 xmax=null
    T200->>DB: UPDATE row\nold version: xmax=200\nnew version: xmin=200 xmax=null
    Note over DB: Two versions coexist
    T250->>DB: SELECT row
    DB-->>T250: Returns new version\nxmin=200 committed before 250\nxmax=null means current
    Note over T100,DB: Reader at snapshot 150\nwould see old version\nxmax=200 not committed before 150`,
    },
    {
      title: "Write Skew Scenario",
      kind: "flow",
      caption: "Write skew occurs under Repeatable Read when two transactions each read shared data, make independent decisions, and write without conflict — yet together violate an invariant.",
      mermaid: `flowchart TD
    A["Invariant: at least 2 doctors on call"] --> B["T1 reads: 2 doctors on call"]
    A --> C["T2 reads: 2 doctors on call"]
    B --> D["T1 decides: safe to go off call"]
    C --> E["T2 decides: safe to go off call"]
    D --> F["T1 updates: doctor A off call"]
    E --> G["T2 updates: doctor B off call"]
    F --> H["0 doctors on call - invariant violated"]
    G --> H
    H --> FIX["Fix: use Serializable isolation\nor SELECT FOR UPDATE to lock rows"]`,
    },
    {
      title: "Transaction Isolation State Transitions",
      kind: "state",
      caption: "A transaction progresses through states from Begin to Commit or Rollback. Under Serializable, a serialization failure triggers a required retry.",
      mermaid: `stateDiagram-v2
    [*] --> Active: BEGIN
    Active --> ReadPhase: execute statements
    ReadPhase --> WritePhase: modifications
    ReadPhase --> Committed: read-only COMMIT
    WritePhase --> Committed: COMMIT
    WritePhase --> Aborted: ROLLBACK
    WritePhase --> Aborted: serialization failure\nSQLSTATE 40001
    Aborted --> Active: retry transaction
    Committed --> [*]
    Aborted --> [*]: give up`,
    },
  ],
  animations: [
    {
      title: "MVCC visibility check",
      steps: [
        { label: "Row created", detail: "Transaction 100 inserts a row. The row's xmin = 100, xmax = null." },
        { label: "Row updated", detail: "Transaction 200 updates the row. Old version gets xmax = 200. New version has xmin = 200, xmax = null." },
        { label: "Reader at snapshot 150", detail: "Transaction at snapshot 150 sees the old version (xmin=100 committed before 150, xmax=200 not committed before 150)." },
        { label: "Reader at snapshot 250", detail: "Transaction at snapshot 250 sees the new version (xmin=200 committed before 250)." },
        { label: "Cleanup", detail: "VACUUM removes old versions that no active transaction can see, reclaiming space." },
      ],
    },
  ],
  comparison: {
    columns: ["Isolation Level", "Dirty Read", "Non-Repeatable Read", "Phantom Read", "Write Skew", "Performance"],
    rows: [
      ["Read Uncommitted", "Possible", "Possible", "Possible", "Possible", "Highest concurrency"],
      ["Read Committed", "Prevented", "Possible", "Possible", "Possible", "Good (default PostgreSQL/Oracle)"],
      ["Repeatable Read", "Prevented", "Prevented", "Prevented*", "Possible", "Good (snapshot isolation)"],
      ["Serializable", "Prevented", "Prevented", "Prevented", "Prevented", "Some aborts on conflict"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Repeatable Read and Serializable in PostgreSQL?",
      a: "Both use snapshot isolation, but Serializable adds SSI (Serializable Snapshot Isolation) which tracks read-write dependencies between concurrent transactions. If SSI detects a cycle that could lead to a non-serializable outcome (like write skew), it aborts one transaction. Repeatable Read does not detect write skew — you must use explicit locks (SELECT FOR UPDATE) to prevent it.",
      followUps: ["What is write skew?", "How does SSI detect conflicts?"],
    },
    {
      q: "How does MVCC avoid the need for read locks?",
      a: "MVCC maintains multiple versions of each row, tagged with transaction IDs. Readers see the version consistent with their snapshot, without needing to lock the current version. Writers create new versions rather than modifying in place. This means readers never block writers and writers never block readers — only writer-writer conflicts require coordination. The cost is storage for old versions and the need for periodic cleanup (VACUUM in PostgreSQL).",
      followUps: ["What happens when two transactions try to update the same row?", "What is VACUUM and why is it needed?"],
    },
    {
      q: "Give an example of a phantom read.",
      a: "Transaction A reads all orders with status='pending' and counts 10. Transaction B inserts a new pending order and commits. Transaction A re-runs the same query and now counts 11 — the new row is a 'phantom' that appeared between reads. Under Read Committed, this is allowed. Under PostgreSQL's Repeatable Read (snapshot isolation), phantoms are prevented because the snapshot is fixed at transaction start.",
      followUps: ["How do gap locks prevent phantoms?", "Does PostgreSQL use gap locks?"],
    },
  ],
  followUps: [
    "How does MySQL InnoDB's implementation of Repeatable Read differ from PostgreSQL's?",
    "What is the performance overhead of Serializable isolation?",
    "How do optimistic and pessimistic concurrency control relate to isolation levels?",
    "When should you use SELECT FOR UPDATE vs Serializable isolation?",
  ],
  mcqs: [
    {
      q: "Under which isolation level can a transaction see uncommitted changes from other transactions?",
      options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
      answerIndex: 0,
      explanation: "Read Uncommitted allows dirty reads — seeing data that another transaction has written but not yet committed.",
    },
    {
      q: "What anomaly does Repeatable Read (snapshot isolation) still allow?",
      options: ["Dirty reads", "Non-repeatable reads", "Write skew", "Lost updates"],
      answerIndex: 2,
      explanation: "Snapshot isolation prevents dirty reads, non-repeatable reads, and phantoms, but allows write skew — where two transactions read overlapping data, make decisions, and write non-conflicting updates that together violate an invariant.",
    },
    {
      q: "In PostgreSQL's MVCC, what does xmin represent?",
      options: ["The minimum value in the row", "The transaction ID that created the row version", "The row's lock status", "The transaction's start time"],
      answerIndex: 1,
      explanation: "xmin is the transaction ID of the transaction that created (inserted or updated to create) this row version. It is used for visibility checks.",
    },
  ],
  exercises: [
    "Open two psql sessions. In Session 1, begin a Read Committed transaction and read a row. In Session 2, update and commit. Re-read in Session 1 and observe the non-repeatable read. Repeat with Repeatable Read.",
    "Reproduce write skew: create a table with two on-call doctors. In two concurrent Repeatable Read transactions, each removes one. Verify the invariant is violated. Then repeat with Serializable and observe the abort.",
    "Measure the abort rate under Serializable isolation with a workload that has read-write conflicts. Compare throughput to Read Committed.",
    "Implement a retry loop in application code for Serializable transactions that handles serialization failures (SQLSTATE 40001).",
  ],
  flashcards: [
    { front: "What is a dirty read?", back: "Reading data written by another transaction that has not yet committed — the data may be rolled back." },
    { front: "What is a non-repeatable read?", back: "Reading the same row twice in a transaction and getting different values because another transaction committed an update between reads." },
    { front: "What is a phantom read?", back: "Re-running a query that returns a set of rows and getting different rows because another transaction inserted or deleted matching rows." },
    { front: "What is write skew?", back: "Two transactions each read overlapping data, make decisions based on it, and write non-conflicting updates that together violate an invariant. Allowed by snapshot isolation, prevented by serializable." },
    { front: "How does MVCC enable non-blocking reads?", back: "Multiple versions of each row coexist, each tagged with transaction IDs. Readers see the version matching their snapshot without locking the current version." },
  ],
  revisionNotes: [
    "Read Uncommitted: dirty reads allowed (rarely used).",
    "Read Committed: each statement sees latest committed data; non-repeatable reads possible.",
    "Repeatable Read: snapshot at transaction start; prevents phantoms in PostgreSQL; allows write skew.",
    "Serializable: SSI detects dependency cycles, aborts conflicting transactions; true serializability.",
    "MVCC: multiple row versions, xmin/xmax transaction IDs, visibility rules based on snapshot.",
    "VACUUM cleans up old row versions no longer visible to any transaction.",
    "SELECT FOR UPDATE: pessimistic lock to prevent write skew under Repeatable Read.",
  ],
  cheatSheet: [
    "BEGIN ISOLATION LEVEL {level}; — set per-transaction",
    "SET default_transaction_isolation = 'level'; — session default",
    "SHOW transaction_isolation; — check current",
    "SELECT ... FOR UPDATE — pessimistic row lock",
    "SELECT ... FOR SHARE — shared lock (blocks writes, allows reads)",
    "Serialization failure (40001) — retry the transaction",
    "VACUUM — clean up dead row versions from MVCC",
  ],
  resources: [
    { label: "Designing Data-Intensive Applications, Ch. 7", url: "https://dataintensive.net/", kind: "book", note: "Outstanding treatment of isolation levels, snapshot isolation, and write skew." },
    { label: "PostgreSQL Documentation — Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", kind: "docs", note: "Implementation details of PostgreSQL's MVCC and SSI." },
    { label: "A Critique of ANSI SQL Isolation Levels — Berenson et al.", kind: "paper", note: "Seminal paper showing ANSI levels are insufficient and introducing snapshot isolation." },
    { label: "Serializable Snapshot Isolation in PostgreSQL — Ports & Grittner", kind: "paper", note: "How PostgreSQL implements true serializability on top of MVCC." },
  ],
  glossary: [
    { term: "Dirty read", definition: "Reading uncommitted data from another transaction." },
    { term: "Non-repeatable read", definition: "Getting different values when reading the same row twice within a transaction." },
    { term: "Phantom read", definition: "Getting different rows when re-executing a query within a transaction, due to concurrent inserts/deletes." },
    { term: "Write skew", definition: "Two transactions read overlapping data and make non-conflicting writes that together violate an invariant." },
    { term: "MVCC", definition: "Multi-Version Concurrency Control — maintaining multiple row versions so readers don't block writers." },
    { term: "Snapshot isolation", definition: "Each transaction sees a consistent snapshot of the database as of its start time." },
    { term: "SSI", definition: "Serializable Snapshot Isolation — PostgreSQL's method for detecting serialization conflicts on top of MVCC." },
  ],
};
