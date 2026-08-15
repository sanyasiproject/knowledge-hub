import type { TopicContent } from "../types";

export const acidTransactions: TopicContent = {
  quickSummary: [
    "ACID guarantees that database transactions are Atomic (all or nothing), Consistent (valid state to valid state), Isolated (concurrent transactions don't interfere), and Durable (committed data survives crashes).",
    "The Write-Ahead Log (WAL) is the mechanism that enables both atomicity and durability: changes are logged before being applied, so the database can recover by replaying or undoing the log.",
    "Transactions group multiple operations into a single logical unit — if any part fails, the entire unit is rolled back.",
  ],
  detailed: [
    "Atomicity means a transaction is indivisible: either all operations succeed and the transaction commits, or all are undone and it aborts. There is no partial state. The database uses an undo log to reverse incomplete transactions. Savepoints allow partial rollbacks within a transaction — you can roll back to a savepoint without aborting the entire transaction.",
    "Consistency means a transaction brings the database from one valid state to another, respecting all constraints (primary keys, foreign keys, CHECK constraints, triggers). This is partly the database's responsibility (enforcing constraints) and partly the application's (writing correct transactions). If a constraint is violated, the transaction is aborted.",
    "Isolation determines how concurrent transactions see each other's changes. Full isolation (serializability) means concurrent transactions behave as if they ran one at a time. Weaker levels (Read Committed, Repeatable Read) allow more concurrency at the cost of potential anomalies. MVCC (Multi-Version Concurrency Control) provides isolation without locking readers against writers.",
    "Durability guarantees that once a transaction commits, its changes survive any subsequent crash. The WAL ensures this: before commit, all changes are flushed to the log on disk. On crash recovery, the database replays committed transactions from the log and undoes uncommitted ones. Even if the data pages were not yet written to disk, the log is sufficient to reconstruct them.",
  ],
  deepDive: [
    "Two-Phase Commit (2PC) extends ACID across multiple databases or services. A coordinator asks all participants to prepare (phase 1) and then to commit (phase 2). If any participant cannot prepare, all abort. The weakness is that if the coordinator crashes between phases, participants are blocked — they have promised to commit but cannot proceed without the coordinator's decision. This is the fundamental limitation of distributed transactions and why many systems avoid them in favor of eventual consistency patterns (sagas, outbox pattern).",
    "The WAL is more nuanced than 'write log, then write data.' PostgreSQL uses LSN (Log Sequence Numbers) to track which WAL records have been flushed to disk and which data pages are dirty. Checkpoints periodically flush dirty pages and advance the recovery start point, bounding crash recovery time. The trade-off is that frequent checkpoints reduce recovery time but increase I/O. The wal_level, max_wal_size, and checkpoint_timeout settings control this balance.",
  ],
  code: [
    {
      language: "sql",
      caption: "Basic transaction with commit and rollback",
      source: `BEGIN;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;

-- If both succeed:
COMMIT;

-- If anything goes wrong:
-- ROLLBACK;  -- undoes both updates`
    },
    {
      language: "sql",
      caption: "Using savepoints for partial rollback",
      source: `BEGIN;

INSERT INTO orders (customer_id, total) VALUES (42, 99.99);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, qty) VALUES (currval('orders_order_id_seq'), 7, 1);
-- Oops, product 7 is out of stock — roll back just the item, not the order
ROLLBACK TO SAVEPOINT order_created;

-- Try a different product
INSERT INTO order_items (order_id, product_id, qty) VALUES (currval('orders_order_id_seq'), 12, 1);

COMMIT;`
    },
    {
      language: "sql",
      caption: "Observing WAL and checkpoint behavior (PostgreSQL)",
      source: `-- Check current WAL position
SELECT pg_current_wal_lsn();

-- Force a checkpoint (flushes dirty pages)
CHECKPOINT;

-- View checkpoint statistics
SELECT * FROM pg_stat_bgwriter;

-- Check WAL settings
SHOW wal_level;
SHOW max_wal_size;
SHOW checkpoint_timeout;`
    },
  ],
  diagrams: [
    {
      title: "Transaction Lifecycle",
      kind: "flow",
      caption: "A transaction moves from BEGIN through operations to either COMMIT (durable) or ROLLBACK (all changes reversed).",
      mermaid: `flowchart TD
    BEGIN["BEGIN Transaction"]
    OPS["Execute SQL Operations"]
    CHECK{"Error or ROLLBACK?"}
    WAL["Write Commit Record to WAL"]
    FLUSH["Flush WAL to Disk"]
    COMMIT["Transaction COMMITTED"]
    UNDO["Apply Undo Log"]
    ABORT["Transaction ABORTED"]
    BEGIN --> OPS --> CHECK
    CHECK -- "No" --> WAL --> FLUSH --> COMMIT
    CHECK -- "Yes" --> UNDO --> ABORT`,
    },
    {
      title: "ACID Properties Overview",
      kind: "architecture",
      caption: "The four ACID guarantees and the database mechanisms that enforce each one.",
      mermaid: `flowchart TD
    ACID["ACID Guarantees"]
    A["Atomicity"]
    C["Consistency"]
    I["Isolation"]
    D["Durability"]
    UL["Undo Log"]
    CON["Constraints + Triggers"]
    LOCKS["Locks / MVCC"]
    WAL["Write-Ahead Log"]
    ACID --> A --> UL
    ACID --> C --> CON
    ACID --> I --> LOCKS
    ACID --> D --> WAL`,
    },
    {
      title: "Transaction States",
      kind: "state",
      caption: "Possible states a database transaction passes through from initiation to final outcome.",
      mermaid: `stateDiagram-v2
    [*] --> Active : BEGIN
    Active --> PartiallyCommitted : all ops done
    Active --> Failed : error / deadlock
    PartiallyCommitted --> Committed : WAL flush ok
    PartiallyCommitted --> Failed : flush error
    Failed --> Aborted : rollback complete
    Committed --> [*]
    Aborted --> [*]`,
    },
    {
      title: "Two-Phase Commit Protocol",
      kind: "sequence",
      caption: "Coordinator drives a prepare phase then a commit/abort phase across all participants to achieve distributed atomicity.",
      mermaid: `sequenceDiagram
    participant CO as Coordinator
    participant P1 as Participant 1
    participant P2 as Participant 2
    CO->>P1: PREPARE
    CO->>P2: PREPARE
    P1-->>CO: VOTE YES
    P2-->>CO: VOTE YES
    CO->>P1: COMMIT
    CO->>P2: COMMIT
    P1-->>CO: ACK
    P2-->>CO: ACK`,
    },
  ],
  animations: [
    {
      title: "Transaction lifecycle: commit vs abort",
      steps: [
        { label: "BEGIN", detail: "A new transaction starts and gets a transaction ID." },
        { label: "Operations", detail: "SQL statements execute, modifying data in the buffer pool. Changes are written to the WAL." },
        { label: "Commit decision", detail: "The application decides to commit. The database writes a commit record to the WAL and flushes it to disk." },
        { label: "Commit complete", detail: "The transaction is now durable. Even if the server crashes, the WAL records allow recovery." },
        { label: "Alternative: Abort", detail: "If ROLLBACK is issued or an error occurs, the database uses the undo log to reverse all changes. No commit record is written." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "Guarantees", "Mechanism", "Failure Without It"],
    rows: [
      ["Atomicity", "All or nothing", "Undo log / WAL", "Partial updates leave inconsistent data"],
      ["Consistency", "Valid state transitions", "Constraints + application logic", "Constraint violations, corrupted invariants"],
      ["Isolation", "No interference between concurrent txns", "Locks, MVCC, isolation levels", "Dirty reads, lost updates, phantom reads"],
      ["Durability", "Committed data survives crashes", "WAL flush to disk before commit", "Data loss on power failure or crash"],
    ],
  },
  interviewQA: [
    {
      q: "How does the Write-Ahead Log provide both atomicity and durability?",
      a: "For durability: the WAL record is flushed to disk before the transaction is reported as committed, so even if the server crashes before dirty data pages are written, the log can replay the changes. For atomicity: if the server crashes mid-transaction (no commit record in the WAL), the recovery process uses the log to undo any partial changes, restoring the database to the last consistent state.",
      followUps: ["What is the difference between redo and undo logging?", "What are checkpoints and why are they needed?"],
    },
    {
      q: "What are the problems with two-phase commit?",
      a: "2PC has a blocking problem: if the coordinator crashes after participants have voted 'yes' (prepared) but before sending the commit decision, participants are stuck — they cannot commit or abort on their own. This can block resources indefinitely. It also has performance issues: two network round-trips and forced log writes at each participant. Alternatives include three-phase commit (non-blocking but more complex), sagas (compensating transactions), and the outbox pattern (eventual consistency).",
      followUps: ["What is a saga pattern?", "How does the outbox pattern work?"],
    },
    {
      q: "What is the difference between a transaction's consistency guarantee and eventual consistency?",
      a: "ACID consistency means each transaction transitions the database from one valid state to another, enforcing all constraints within the transaction boundary. Eventual consistency (a property of distributed systems, not ACID) means replicas may temporarily disagree but will converge to the same state given enough time. They operate at different levels: ACID consistency is within a single database; eventual consistency is across distributed nodes.",
      followUps: ["Can a system be both ACID and eventually consistent?", "What does BASE stand for?"],
    },
  ],
  followUps: [
    "How do isolation levels trade off between consistency and performance?",
    "What are the alternatives to 2PC in distributed systems?",
    "How does group commit improve transaction throughput?",
    "What is the relationship between WAL and replication?",
  ],
  mcqs: [
    {
      q: "Which ACID property guarantees that committed data survives a server crash?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      answerIndex: 3,
      explanation: "Durability ensures that once a transaction is committed, its effects are permanent, even in the face of crashes, through mechanisms like WAL.",
    },
    {
      q: "What happens if the coordinator crashes during the second phase of 2PC?",
      options: [
        "All participants automatically commit",
        "All participants automatically abort",
        "Participants are blocked until the coordinator recovers",
        "Each participant independently decides",
      ],
      answerIndex: 2,
      explanation: "In 2PC, participants who voted 'yes' in phase 1 cannot unilaterally commit or abort — they must wait for the coordinator's decision, causing a blocking problem.",
    },
    {
      q: "What is a savepoint used for?",
      options: [
        "Creating a backup of the database",
        "Allowing partial rollback within a transaction",
        "Marking a checkpoint in the WAL",
        "Saving the query execution plan",
      ],
      answerIndex: 1,
      explanation: "A savepoint marks a point within a transaction that you can roll back to without aborting the entire transaction.",
    },
  ],
  exercises: [
    "Write a transaction that transfers money between two accounts, handles insufficient funds gracefully with a rollback, and logs the attempt.",
    "Simulate a crash recovery scenario: start a transaction, insert data, kill the database process before commit, restart, and verify the data was rolled back.",
    "Implement the outbox pattern: write a business event to an outbox table in the same transaction as the data change, then have a separate process publish it.",
    "Measure the performance impact of synchronous vs asynchronous WAL commit (synchronous_commit setting in PostgreSQL).",
  ],
  flashcards: [
    { front: "What does Atomicity guarantee?", back: "A transaction is all-or-nothing: either all operations succeed and commit, or all are rolled back. No partial state." },
    { front: "How does WAL provide durability?", back: "Changes are written to the append-only log and flushed to disk before commit is acknowledged. On crash, the log is replayed to reconstruct committed changes." },
    { front: "What is a savepoint?", back: "A marker within a transaction that allows partial rollback — you can undo operations back to the savepoint without aborting the whole transaction." },
    { front: "What is the blocking problem in 2PC?", back: "If the coordinator crashes after participants have prepared (voted yes), participants cannot commit or abort on their own — they are blocked until the coordinator recovers." },
    { front: "What is a checkpoint?", back: "A periodic operation that flushes dirty pages from the buffer pool to disk, advancing the WAL recovery start point and bounding crash recovery time." },
  ],
  revisionNotes: [
    "ACID: Atomicity (all or nothing), Consistency (valid states), Isolation (no interference), Durability (survives crashes).",
    "WAL: write changes to log before data files. Enables redo (replay committed) and undo (reverse uncommitted) on recovery.",
    "Savepoints: partial rollback within a transaction — SAVEPOINT name / ROLLBACK TO SAVEPOINT name.",
    "2PC: prepare + commit phases across distributed participants. Blocking if coordinator fails.",
    "Checkpoints: flush dirty pages, bound recovery time, trade-off with I/O load.",
    "Group commit: batch multiple transactions' WAL flushes into one fsync for throughput.",
  ],
  cheatSheet: [
    "BEGIN; ... COMMIT; — transaction boundaries",
    "ROLLBACK; — abort entire transaction",
    "SAVEPOINT sp; ROLLBACK TO SAVEPOINT sp; — partial rollback",
    "WAL ensures durability: log flushed before commit ack",
    "2PC: PREPARE -> vote -> COMMIT/ABORT",
    "synchronous_commit = off — trade durability for speed (small crash window)",
    "CHECKPOINT — force dirty page flush",
  ],
  resources: [
    { label: "Designing Data-Intensive Applications, Ch. 7", url: "https://dataintensive.net/", kind: "book", note: "Transactions — the definitive practical treatment of ACID." },
    { label: "PostgreSQL Documentation — Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", kind: "docs", note: "How PostgreSQL implements ACID properties." },
    { label: "ARIES: A Transaction Recovery Method — Mohan et al.", kind: "paper", note: "The foundational paper on WAL-based recovery (redo/undo logging)." },
    { label: "Database Internals — Alex Petrov, Ch. 5", kind: "book", note: "Transaction processing and recovery internals." },
  ],
  glossary: [
    { term: "Transaction", definition: "A sequence of database operations treated as a single atomic unit of work." },
    { term: "WAL (Write-Ahead Log)", definition: "An append-only log where changes are recorded before being applied to data files, enabling crash recovery." },
    { term: "Savepoint", definition: "A named marker within a transaction that allows partial rollback." },
    { term: "Two-Phase Commit (2PC)", definition: "A distributed transaction protocol with prepare and commit phases across multiple participants." },
    { term: "Checkpoint", definition: "An operation that flushes dirty buffer pages to disk and records the WAL position, bounding crash recovery time." },
    { term: "Undo log", definition: "Records needed to reverse uncommitted changes during abort or crash recovery." },
    { term: "Redo log", definition: "Records needed to replay committed changes during crash recovery when data pages were not yet flushed." },
  ],
};
