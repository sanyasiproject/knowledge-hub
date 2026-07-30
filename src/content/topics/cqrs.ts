import type { TopicContent } from "../types";

export const cqrs: TopicContent = {
  quickSummary: [
    "CQRS (Command Query Responsibility Segregation) separates the write model (handling commands that change state) from the read model (handling queries that return data), allowing each to be optimized independently.",
    "Read models are denormalized projections tailored for specific query patterns, updated asynchronously from write-side events — enabling high-performance reads without compromising write model integrity.",
    "Eventual consistency between write and read models is the primary trade-off — after a command is processed, the read model may take milliseconds to seconds to reflect the change.",
    "CQRS enables independent scaling (read-heavy systems can scale read replicas without affecting writes), independent storage choices (SQL for writes, Elasticsearch for searches), and polyglot persistence.",
  ],
  detailed: [
    `## Command and Query Separation

The principle originates from Bertrand Meyer's **Command-Query Separation (CQS)**: a method should either change state (command) or return data (query), never both. **CQRS** elevates this to an architectural level — separate models, potentially separate services and databases, for writes and reads.

**Commands** represent intent to change state: CreateOrder, CancelSubscription, UpdateProfile. They are validated, processed by the write model, and result in state changes (and often domain events). Commands return success/failure but not data. **Queries** ask for data: GetOrderById, SearchProducts, ListUserOrders. They read from optimized read models and never modify state.`,

    `## Read Model Design

Read models are **denormalized views** optimized for specific query patterns. Unlike a normalized relational model where a query might join 5 tables, a read model stores pre-joined, pre-aggregated data in the exact shape the UI or API needs.

A single write model can feed multiple read models: a relational table for transactional lookups, an Elasticsearch index for full-text search, a Redis cache for hot data, a data warehouse for analytics. Each read model is updated by consuming events from the write side. Read models are disposable — they can be deleted and rebuilt from the event source or write-side change log.`,

    `## Eventual Consistency

The gap between a command being processed and the read model being updated creates **eventual consistency**. After a user submits an order, querying immediately might not show it. Strategies to handle this:

**Read-your-writes consistency**: after a command, redirect the user to a page that reads directly from the write model or use a version token — the read model serves stale data until it catches up to the expected version. **Optimistic UI**: immediately reflect the change in the UI without waiting for the read model. **Polling/SSE/WebSocket**: the client polls or subscribes until the read model reflects the change. **Causal consistency**: tag commands with a causality token passed to subsequent queries.`,

    `## When to Use CQRS

CQRS adds architectural complexity and is not appropriate for simple CRUD applications. It shines when: (1) read and write workloads have vastly different scaling needs; (2) read and write models have fundamentally different shapes (normalized writes, denormalized reads); (3) multiple read representations are needed (search, analytics, API); (4) combined with event sourcing where projections naturally form the read side.

**Without event sourcing**: CQRS can use a traditional database for writes and publish change events (via CDC, outbox pattern, or application-level events) to update read models. This is simpler than full event sourcing and still provides the scaling and optimization benefits of separate read/write models.`,

    `## Implementation Patterns

**Synchronous projection**: the write transaction updates both the write model and the read model atomically (same database or distributed transaction). Simple but couples read and write performance.

**Asynchronous projection**: the write side publishes events; a separate process consumes them and updates read models. Provides eventual consistency but decouples write and read scaling.

**Outbox pattern**: the write side stores events in an outbox table within the same transaction as the state change. A separate process (or CDC) reads the outbox and publishes events to the message broker, ensuring exactly-once event production without distributed transactions.`,
  ],
  interviewQA: [
    {
      q: "What problem does CQRS solve that a traditional CRUD architecture does not?",
      a: "In CRUD, a single model serves both reads and writes, forcing compromises — normalization for write integrity hurts read performance, or denormalization for reads complicates writes. CQRS separates these concerns: the write model is optimized for validation and consistency, the read model is denormalized for fast queries. This enables independent scaling (scale reads without affecting writes), polyglot persistence (SQL for writes, Elasticsearch for search), and multiple query-optimized views from a single source of truth.",
    },
    {
      q: "How do you handle the case where a user creates a resource but the read model has not been updated yet?",
      a: "Several strategies: (1) Read-your-writes: after the command, redirect to a view that reads from the write model directly, or use a version token — the query waits until the read model reaches that version. (2) Optimistic UI: immediately display the expected result on the client without waiting for the server read model. (3) Include the created entity in the command response (breaking pure CQRS but pragmatic). (4) Client polls until the read model reflects the change. The right choice depends on consistency requirements and user experience.",
    },
    {
      q: "Can you implement CQRS without event sourcing?",
      a: "Yes. CQRS and event sourcing are complementary but independent. Without event sourcing, the write side uses a traditional database. Changes are propagated to read models via: application-level domain events published to a message broker, change data capture (CDC) from the write database, or an outbox pattern. The read models are still separate, denormalized projections updated from these change events. This is simpler than full event sourcing and still provides the scaling and optimization benefits.",
    },
  ],
  mcqs: [
    {
      q: "In CQRS, what should a command return?",
      options: [
        "The full updated entity",
        "A list of affected records",
        "Success/failure status (and optionally the new ID)",
        "The entire read model",
      ],
      answerIndex: 2,
      explanation:
        "Commands change state and return only success or failure (and sometimes a generated ID). Returning full entity data blurs the command/query boundary. If the caller needs data, it issues a separate query.",
    },
    {
      q: "What is the primary trade-off of CQRS with asynchronous read model updates?",
      options: [
        "Write performance degrades",
        "Read models become strongly consistent",
        "Eventual consistency — reads may not reflect the latest write",
        "The write model must be denormalized",
      ],
      answerIndex: 2,
      explanation:
        "Asynchronous projection means the read model is updated after the write completes, creating a window where queries return stale data. This is the fundamental trade-off of async CQRS.",
    },
    {
      q: "Which pattern ensures events are reliably published from the write side without distributed transactions?",
      options: [
        "Two-phase commit",
        "Outbox pattern",
        "Saga pattern",
        "Event replay",
      ],
      answerIndex: 1,
      explanation:
        "The outbox pattern stores events in an outbox table within the same local transaction as the write. A separate process reads and publishes them, ensuring exactly-once production without distributed transactions.",
    },
  ],
  flashcards: [
    {
      front: "What is CQRS?",
      back: "Command Query Responsibility Segregation — an architectural pattern that uses separate models for updating (commands) and reading (queries) data, allowing each to be optimized independently.",
    },
    {
      front: "What is a read model in CQRS?",
      back: "A denormalized, query-optimized projection of data maintained separately from the write model. It can use different storage technologies and schemas, tailored for specific query patterns.",
    },
    {
      front: "What is the outbox pattern?",
      back: "Store domain events in an outbox table within the same database transaction as the state change. A separate process reads and publishes events to the message broker, ensuring reliable event production without distributed transactions.",
    },
    {
      front: "When should you NOT use CQRS?",
      back: "When the application is simple CRUD with similar read/write patterns, when the team lacks experience with eventual consistency, or when read and write workloads do not have significantly different requirements.",
    },
    {
      front: "What is read-your-writes consistency in CQRS?",
      back: "A technique where after a command, the system ensures the user sees their own change — either by reading directly from the write model, using version tokens, or waiting until the read model catches up.",
    },
    {
      front: "How does CQRS enable polyglot persistence?",
      back: "Since read and write models are separate, each can use the optimal storage: PostgreSQL for writes, Elasticsearch for search queries, Redis for hot data lookups, ClickHouse for analytics — all fed from the same event stream.",
    },
    {
      front: "What is optimistic UI in the context of CQRS?",
      back: "The client immediately reflects the expected result of a command without waiting for the read model to update. If the command fails, the UI reverts. This provides instant feedback despite eventual consistency.",
    },
  ],
  glossary: [
    {
      term: "CQRS",
      definition:
        "Command Query Responsibility Segregation — separating write operations (commands) from read operations (queries) into distinct models.",
    },
    {
      term: "Command",
      definition:
        "An operation that changes system state, validated and processed by the write model. Returns success/failure, not data.",
    },
    {
      term: "Query",
      definition:
        "An operation that reads data from the read model without modifying state. Optimized for specific access patterns.",
    },
    {
      term: "Read Model",
      definition:
        "A denormalized, query-optimized projection maintained separately from the write model, updated via events or change capture.",
    },
    {
      term: "Eventual Consistency",
      definition:
        "The state where the read model temporarily lags behind the write model after a command is processed, converging over time.",
    },
    {
      term: "Outbox Pattern",
      definition:
        "Storing events in a database table within the write transaction, then asynchronously publishing them to a message broker for read model updates.",
    },
    {
      term: "Synchronous Projection",
      definition:
        "Updating the read model in the same transaction as the write, providing strong consistency at the cost of coupled performance.",
    },
  ],
};
