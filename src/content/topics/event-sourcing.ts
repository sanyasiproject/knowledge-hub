import type { TopicContent } from "../types";

export const eventSourcing: TopicContent = {
  quickSummary: [
    "Event sourcing stores every state change as an immutable event in an append-only log — the current state is derived by replaying the full sequence of events rather than storing only the latest state.",
    "Projections (read models) are built by processing the event stream, materializing data in formats optimized for specific queries — multiple projections can be derived from the same event stream.",
    "Snapshots periodically capture the aggregate state to avoid replaying the entire event history on every load, balancing rebuild performance against storage overhead.",
    "Event replay enables rebuilding state from scratch, creating new projections retroactively, debugging by replaying exact sequences, and migrating data by reprocessing events through new logic.",
  ],
  detailed: [
    `## Event Store Fundamentals

In event sourcing, the **event store** is the system of record. Instead of storing the current state of an entity, you store every state-changing event: "ItemAddedToCart", "ItemRemoved", "DiscountApplied", "OrderPlaced". The current state is reconstructed by loading and replaying all events for that entity (aggregate) in order.

Events are immutable — you never update or delete them. To correct an error, you append a compensating event (e.g., "ItemRemovedFromCart" to undo "ItemAddedToCart"). The event store is typically organized by **stream** (one stream per aggregate instance, e.g., "order-12345"), and each event has a sequential position within its stream.`,

    `## Projections and Read Models

Raw event streams are not optimized for querying. **Projections** (also called read models or views) process events and build denormalized data structures tailored for specific queries. A single event stream can feed multiple projections: one for a dashboard, one for search, one for reporting.

Projections are disposable — they can be deleted and rebuilt from the event store at any time. They can be **synchronous** (updated in the same transaction as the event write, providing strong consistency) or **asynchronous** (updated via an event subscription, providing eventual consistency but better performance). Asynchronous projections are far more common in practice because they decouple write and read performance.`,

    `## Snapshots

For aggregates with long event histories (thousands of events), replaying from the beginning on every load is expensive. **Snapshots** capture the aggregate state at a point in time. To load the aggregate, you load the latest snapshot and replay only events after it.

Snapshot strategies include: (1) snapshot every N events (e.g., every 100); (2) snapshot on a time schedule; (3) snapshot when load time exceeds a threshold. Snapshots are an optimization, not a source of truth — they can be deleted and recreated from events. Store snapshots alongside the event stream with the version number they correspond to.`,

    `## Event Replay and Temporal Queries

Event replay is the most powerful capability of event sourcing. Use cases include: (1) **rebuilding projections** — deploy a new read model and populate it by replaying the entire history; (2) **debugging** — replay events to reproduce exact state at any point; (3) **audit** — the event log is a complete, immutable audit trail; (4) **temporal queries** — reconstruct what the state was at any past moment.

**Upcasting** handles schema evolution during replay: when the event format changes, an upcaster transforms old events into the current format on the fly. This avoids migrating the entire event store when event schemas evolve. Events should be versioned (e.g., "OrderPlaced_v2") to support upcasting.`,

    `## Challenges and Trade-offs

Event sourcing adds complexity: **eventual consistency** between the event store and projections; **event schema evolution** requires versioning and upcasting strategies; **event store growth** demands archival and partitioning strategies; **debugging** requires tooling to inspect event streams.

**Concurrency** is handled via optimistic concurrency control — when writing events, you specify the expected stream version. If another write occurred concurrently, the version check fails and you retry. **GDPR compliance** is challenging since events are immutable — techniques include crypto-shredding (encrypting personal data with per-user keys, then deleting the key) and event transformation (replacing personal data with pseudonyms in a separate pass).`,
  ],
  interviewQA: [
    {
      q: "How is event sourcing different from traditional CRUD with an audit log?",
      a: "In CRUD with audit logging, the database table holds current state and the audit log is a secondary record. The audit log can diverge from reality if logging fails. In event sourcing, the event log IS the primary source of truth — current state is derived from it. Events are never bypassed. This guarantees a complete, consistent history and enables replaying events to rebuild state, create new projections, or debug issues. CRUD audit logs cannot rebuild state; event sourcing logs can.",
    },
    {
      q: "How do you handle event schema evolution in an event-sourced system?",
      a: "Use event versioning (OrderPlaced_v1, OrderPlaced_v2) and upcasting. An upcaster transforms events from old versions to the current version during read/replay. This avoids migrating the event store. For additive changes, add optional fields (backward compatible). For breaking changes, create a new event version with an upcaster. Use a schema registry for validation. Never modify stored events — they are immutable. The upcasting layer is applied at read time, keeping the store as the original record.",
    },
    {
      q: "How do you handle GDPR right-to-erasure with immutable events?",
      a: "The main technique is crypto-shredding: encrypt personal data in events using a per-user encryption key stored separately. When a user requests deletion, delete the encryption key — the personal data in events becomes unreadable gibberish while the event structure remains intact for replaying business logic. An alternative is event transformation: periodically rewrite the event store replacing personal data with pseudonyms, though this breaks immutability guarantees.",
    },
  ],
  mcqs: [
    {
      q: "In event sourcing, what is the primary source of truth?",
      options: [
        "The current state table in the database",
        "The projection/read model",
        "The append-only event log",
        "The latest snapshot",
      ],
      answerIndex: 2,
      explanation:
        "The append-only event log is the source of truth. Current state, projections, and snapshots are all derived from it and can be rebuilt at any time.",
    },
    {
      q: "What is the purpose of a snapshot in event sourcing?",
      options: [
        "To provide the source of truth for an aggregate",
        "To avoid replaying the entire event history when loading an aggregate",
        "To replace the event store after archival",
        "To ensure strong consistency between read and write models",
      ],
      answerIndex: 1,
      explanation:
        "Snapshots are a performance optimization that captures aggregate state at a point in time. Loading uses the snapshot plus only subsequent events, avoiding full history replay.",
    },
    {
      q: "How does event sourcing handle concurrent writes to the same aggregate?",
      options: [
        "Pessimistic locking on the aggregate",
        "Last-write-wins conflict resolution",
        "Optimistic concurrency control using stream version checks",
        "Distributed locks via ZooKeeper",
      ],
      answerIndex: 2,
      explanation:
        "Event sourcing uses optimistic concurrency: when appending events, the expected stream version is specified. If another write has incremented the version, the write fails and the client retries with fresh state.",
    },
    {
      q: "What is crypto-shredding in the context of event sourcing?",
      options: [
        "Encrypting the entire event store for security",
        "Encrypting personal data with per-user keys and deleting the key for erasure",
        "Hashing event data for deduplication",
        "Compressing old events to save storage",
      ],
      answerIndex: 1,
      explanation:
        "Crypto-shredding encrypts personal data in events with a per-user key. To comply with GDPR erasure requests, the key is deleted, making the personal data unreadable while preserving event structure.",
    },
  ],
  flashcards: [
    {
      front: "What is an event store?",
      back: "An append-only database that stores every state change as an immutable event, organized by streams (typically one per aggregate instance). It is the source of truth in event-sourced systems.",
    },
    {
      front: "What is a projection in event sourcing?",
      back: "A read model built by processing events from the event store, materialized in a format optimized for specific queries. Projections are disposable and can be rebuilt from events at any time.",
    },
    {
      front: "What is upcasting?",
      back: "Transforming events from an old schema version to the current version at read time. This avoids migrating the event store when event schemas evolve, keeping stored events immutable.",
    },
    {
      front: "How are corrections handled in event sourcing?",
      back: "Never modify or delete existing events. Instead, append a compensating event that reverses the effect (e.g., 'OrderCancelled' to undo 'OrderPlaced'). The history shows both the original action and the correction.",
    },
    {
      front: "What is the relationship between event sourcing and CQRS?",
      back: "They are complementary but independent. Event sourcing stores state as events; CQRS separates read and write models. Together, events feed the write model (event store) and projections feed the read model, connected by event processing.",
    },
    {
      front: "When should you NOT use event sourcing?",
      back: "When the domain is simple CRUD with no need for audit trails, temporal queries, or complex state derivation. Event sourcing adds significant complexity in schema evolution, eventual consistency, storage growth, and GDPR compliance.",
    },
    {
      front: "What is a stream in an event store?",
      back: "An ordered sequence of events for a single aggregate instance (e.g., 'order-12345'). Events within a stream have sequential positions/versions used for ordering and optimistic concurrency control.",
    },
  ],
  glossary: [
    {
      term: "Event Sourcing",
      definition:
        "A pattern where state changes are stored as an immutable sequence of events, and current state is derived by replaying those events.",
    },
    {
      term: "Event Store",
      definition:
        "An append-only database that persists events as the primary source of truth, organized into streams per aggregate.",
    },
    {
      term: "Projection",
      definition:
        "A read model derived from processing events, optimized for specific query patterns. Disposable and rebuildable from the event store.",
    },
    {
      term: "Snapshot",
      definition:
        "A captured point-in-time state of an aggregate used to optimize load performance by avoiding full event replay.",
    },
    {
      term: "Upcasting",
      definition:
        "The process of transforming events from an older schema version to the current version at read time during replay.",
    },
    {
      term: "Compensating Event",
      definition:
        "An event that reverses or corrects the effect of a previous event, preserving immutability while enabling corrections.",
    },
    {
      term: "Crypto-Shredding",
      definition:
        "A GDPR compliance technique where personal data in events is encrypted with per-user keys; deleting the key renders the data unreadable.",
    },
  ],
};
