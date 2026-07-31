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
  deepDive: [
    `## The Mechanics of Event Replay and State Reconstruction

**Event replay** is the cornerstone capability that distinguishes event sourcing from every other persistence pattern. When an aggregate is loaded, the system fetches all events from that aggregate's **stream** and applies them sequentially through a *fold function* — a pure function that takes the current state and an event, returning the new state. This is conceptually identical to a \`reduce\` operation: \`state = events.reduce(applyEvent, initialState)\`. The **deterministic** nature of this fold is critical — given the same sequence of events, you always arrive at the same state. This property enables powerful capabilities like *temporal queries* (reconstructing state at any past point by replaying events up to that timestamp), *parallel projection rebuilds* (multiple consumers independently replaying the same stream), and *debugging* (reproducing exact production state locally by replaying the event log). The fold function must be **side-effect-free** — it should not make network calls, write to databases, or emit further events during replay. Side effects belong in the *command handler* that decides whether to accept a command and which events to emit, never in the event application logic.`,

    `## Event Store Internals and Storage Strategies

A production **event store** must satisfy several non-trivial requirements: *append-only writes* with **optimistic concurrency** (each stream maintains a version counter, and writes specify the expected version — a version mismatch indicates a concurrent write and the operation is rejected), *ordered reads* by stream and optionally by global position, and *subscriptions* for push-based notification of new events to projection builders. Under the hood, implementations like **EventStoreDB** use a *transaction log* architecture similar to a database WAL (write-ahead log), where events are appended to a single global log and streams are logical partitions indexed by \`streamId\`. This design gives \`O(1)\` append performance regardless of stream count. For *partitioning* at scale, events are typically sharded by \`streamId\` hash, ensuring all events for one aggregate land on the same partition and maintain ordering. **Global ordering** across partitions requires additional coordination — some systems use a *global sequence number* assigned by a single sequencer, while others accept *partial ordering* (ordered within a stream, unordered across streams). The choice between these approaches has deep implications for projection consistency: global ordering enables a single projection to process events from multiple streams in a consistent order, while partial ordering requires the projection to handle out-of-order cross-stream events gracefully.`,

    `## CQRS Integration and Eventual Consistency Patterns

Event sourcing naturally pairs with **CQRS** (Command Query Responsibility Segregation) because the *event store* is optimized for writes (append-only) while *projections* are optimized for reads (denormalized, indexed). The write side processes **commands** — a command handler loads the aggregate by replaying its events, validates the command against current state, and emits new events if valid. The read side subscribes to the event stream and updates **materialized views** asynchronously. This separation introduces *eventual consistency*: after a command succeeds, the read model may take milliseconds to seconds to reflect the change. Handling this in the UI typically involves one of three patterns: (1) **client-side optimistic updates** — the UI assumes success and patches its local state immediately; (2) **polling** — the client polls the read model until it reflects the expected change; (3) **subscriptions** — the client subscribes to a real-time channel (e.g., WebSocket, SSE) and receives a notification when the projection updates. For operations requiring *strong consistency* between write and read, you can use a **synchronous projection** updated within the same transaction as the event write, at the cost of increased write latency and coupling. In practice, most systems use a mix: a small number of critical projections run synchronously, while the majority run asynchronously for scalability.`,
  ],
  code: [
    {
      language: "cpp",
      caption:
        "C++ Event Store with append, replay, and snapshot support",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <functional>
#include <stdexcept>
#include <chrono>
#include <sstream>

// --- Event base and concrete event types ---
struct Event {
    std::string type;
    std::string streamId;
    int version;
    std::string payload;       // JSON string in production
    long long timestamp;

    Event(const std::string& t, const std::string& sid, int v,
          const std::string& p)
        : type(t), streamId(sid), version(v), payload(p),
          timestamp(std::chrono::system_clock::now()
                        .time_since_epoch().count()) {}
};

// --- Snapshot for performance optimization ---
struct Snapshot {
    std::string streamId;
    int version;               // event version this snapshot covers
    std::string state;         // serialized aggregate state
};

// --- Append-only Event Store ---
class EventStore {
public:
    // Append with **optimistic concurrency** check
    void append(const std::string& streamId, int expectedVersion,
                const std::vector<Event>& newEvents) {
        auto& stream = streams_[streamId];
        int currentVersion = stream.empty() ? 0 : stream.back().version;

        if (currentVersion != expectedVersion) {
            throw std::runtime_error(
                "Concurrency conflict: expected version "
                + std::to_string(expectedVersion)
                + " but stream is at " + std::to_string(currentVersion));
        }

        for (auto& evt : newEvents) {
            stream.push_back(evt);
            globalLog_.push_back(evt);   // global ordering
        }
    }

    // Load events for a stream, optionally *after* a snapshot version
    std::vector<Event> loadStream(const std::string& streamId,
                                  int afterVersion = 0) const {
        std::vector<Event> result;
        auto it = streams_.find(streamId);
        if (it == streams_.end()) return result;

        for (auto& evt : it->second) {
            if (evt.version > afterVersion) {
                result.push_back(evt);
            }
        }
        return result;
    }

    // Save and load **snapshots**
    void saveSnapshot(const Snapshot& snap) {
        snapshots_[snap.streamId] = snap;
    }

    Snapshot* loadSnapshot(const std::string& streamId) {
        auto it = snapshots_.find(streamId);
        return (it != snapshots_.end()) ? &it->second : nullptr;
    }

    // Subscribe to *global* event stream (for projections)
    const std::vector<Event>& globalLog() const { return globalLog_; }

private:
    std::unordered_map<std::string, std::vector<Event>> streams_;
    std::unordered_map<std::string, Snapshot> snapshots_;
    std::vector<Event> globalLog_;
};

// --- Aggregate: Shopping Cart ---
struct CartState {
    std::unordered_map<std::string, int> items;  // itemId -> quantity
    bool checkedOut = false;
};

// Pure **fold function** — deterministic, no side effects
CartState applyEvent(CartState state, const Event& evt) {
    if (evt.type == "ItemAdded") {
        state.items[evt.payload] += 1;
    } else if (evt.type == "ItemRemoved") {
        state.items.erase(evt.payload);
    } else if (evt.type == "CheckedOut") {
        state.checkedOut = true;
    }
    return state;
}

// Rebuild state via **event replay**
CartState replayCart(EventStore& store, const std::string& cartId) {
    CartState state;
    int startVersion = 0;

    // Try loading snapshot first
    Snapshot* snap = store.loadSnapshot(cartId);
    if (snap) {
        // Deserialize snapshot into state (simplified)
        startVersion = snap->version;
        // state = deserialize(snap->state);
    }

    auto events = store.loadStream(cartId, startVersion);
    for (auto& evt : events) {
        state = applyEvent(state, evt);
    }
    return state;
}

int main() {
    EventStore store;
    std::string cartId = "cart-42";

    // Append events with version tracking
    store.append(cartId, 0, {
        Event("ItemAdded", cartId, 1, "sku-laptop"),
        Event("ItemAdded", cartId, 2, "sku-mouse"),
        Event("ItemAdded", cartId, 3, "sku-keyboard"),
    });

    store.append(cartId, 3, {
        Event("ItemRemoved", cartId, 4, "sku-mouse"),
        Event("CheckedOut",  cartId, 5, ""),
    });

    // **Replay** full state
    CartState cart = replayCart(store, cartId);
    std::cout << "Cart checked out: "
              << (cart.checkedOut ? "yes" : "no") << "\\n";
    std::cout << "Items in cart: " << cart.items.size() << "\\n";
    for (auto& [item, qty] : cart.items) {
        std::cout << "  " << item << " x" << qty << "\\n";
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption:
        "C++ Projection Builder — materializing a read model from the event stream",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>

// Reuses Event struct from the event store example above.
struct Event {
    std::string type;
    std::string streamId;
    int version;
    std::string payload;
};

// --- Projection: Order Summary Read Model ---
// A **projection** consumes events and builds a denormalized view
// optimized for a specific query pattern.
struct OrderSummary {
    std::string orderId;
    int itemCount = 0;
    bool isCheckedOut = false;
};

class OrderSummaryProjection {
public:
    // Process a single event — called for each event in the stream
    void apply(const Event& evt) {
        auto& summary = summaries_[evt.streamId];
        summary.orderId = evt.streamId;

        if (evt.type == "ItemAdded") {
            summary.itemCount++;
        } else if (evt.type == "ItemRemoved") {
            summary.itemCount = std::max(0, summary.itemCount - 1);
        } else if (evt.type == "CheckedOut") {
            summary.isCheckedOut = true;
        }
    }

    // **Rebuild** from scratch — replay entire global log
    void rebuildFrom(const std::vector<Event>& globalLog) {
        summaries_.clear();
        for (auto& evt : globalLog) {
            apply(evt);
        }
    }

    // Query the materialized view
    void printAll() const {
        for (auto& [id, s] : summaries_) {
            std::cout << "Order: " << id
                      << " | Items: " << s.itemCount
                      << " | Checked out: "
                      << (s.isCheckedOut ? "yes" : "no")
                      << "\\n";
        }
    }

private:
    std::unordered_map<std::string, OrderSummary> summaries_;
};

int main() {
    // Simulate a global event log
    std::vector<Event> globalLog = {
        {"ItemAdded",   "order-1", 1, "sku-a"},
        {"ItemAdded",   "order-1", 2, "sku-b"},
        {"ItemAdded",   "order-2", 1, "sku-c"},
        {"ItemRemoved", "order-1", 3, "sku-a"},
        {"CheckedOut",  "order-1", 4, ""},
    };

    OrderSummaryProjection projection;
    // Rebuild projection from the *entire* event history
    projection.rebuildFrom(globalLog);
    projection.printAll();

    return 0;
}`,
    },
    {
      language: "typescript",
      caption:
        "Node.js/Express event-driven API with in-memory event store, projections, and replay endpoint",
      source: `import express, { Request, Response } from "express";

// --- Event and Store types ---
interface DomainEvent {
  id: string;
  streamId: string;
  type: string;
  data: Record<string, unknown>;
  version: number;
  timestamp: Date;
}

// **Append-only** in-memory event store
const eventStore: Map<string, DomainEvent[]> = new Map();
const globalLog: DomainEvent[] = [];
let globalSeq = 0;

function appendEvents(
  streamId: string,
  expectedVersion: number,
  events: Omit<DomainEvent, "id" | "version" | "timestamp">[]
): DomainEvent[] {
  const stream = eventStore.get(streamId) ?? [];
  const currentVersion = stream.length;

  // **Optimistic concurrency** check
  if (currentVersion !== expectedVersion) {
    throw new Error(
      \`Concurrency conflict on \${streamId}: \` +
      \`expected v\${expectedVersion}, actual v\${currentVersion}\`
    );
  }

  const persisted: DomainEvent[] = events.map((e, i) => ({
    ...e,
    id: \`evt-\${++globalSeq}\`,
    version: currentVersion + i + 1,
    timestamp: new Date(),
  }));

  stream.push(...persisted);
  eventStore.set(streamId, stream);
  globalLog.push(...persisted);
  return persisted;
}

// --- Projection: Account Balance read model ---
const balances: Map<string, number> = new Map();

function applyToBalanceProjection(evt: DomainEvent): void {
  const current = balances.get(evt.streamId) ?? 0;
  switch (evt.type) {
    case "MoneyDeposited":
      balances.set(evt.streamId, current + (evt.data.amount as number));
      break;
    case "MoneyWithdrawn":
      balances.set(evt.streamId, current - (evt.data.amount as number));
      break;
  }
}

// Subscribe projection to new events (simplified sync subscription)
function rebuildBalanceProjection(): void {
  balances.clear();
  for (const evt of globalLog) {
    applyToBalanceProjection(evt);
  }
}

// --- Express API ---
const app = express();
app.use(express.json());

// POST /accounts/:id/deposit — **command** endpoint
app.post("/accounts/:id/deposit", (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const stream = eventStore.get(id) ?? [];
    const events = appendEvents(id, stream.length, [
      { streamId: id, type: "MoneyDeposited", data: { amount } },
    ]);
    // Update projection synchronously
    events.forEach(applyToBalanceProjection);
    res.status(201).json({ events });
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

// POST /accounts/:id/withdraw — with *business rule* validation
app.post("/accounts/:id/withdraw", (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  const balance = balances.get(id) ?? 0;

  if (amount > balance) {
    return res.status(400).json({ error: "Insufficient funds" });
  }

  try {
    const stream = eventStore.get(id) ?? [];
    const events = appendEvents(id, stream.length, [
      { streamId: id, type: "MoneyWithdrawn", data: { amount } },
    ]);
    events.forEach(applyToBalanceProjection);
    res.status(201).json({ events });
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

// GET /accounts/:id — **query** the projection (read model)
app.get("/accounts/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const balance = balances.get(id) ?? 0;
  const events = eventStore.get(id) ?? [];
  res.json({ accountId: id, balance, eventCount: events.length });
});

// GET /accounts/:id/events — full **event history** for audit
app.get("/accounts/:id/events", (req: Request, res: Response) => {
  const events = eventStore.get(req.params.id) ?? [];
  res.json({ events });
});

// POST /projections/rebuild — **replay** all events to rebuild projections
app.post("/projections/rebuild", (_req: Request, res: Response) => {
  rebuildBalanceProjection();
  res.json({
    message: "Projections rebuilt",
    totalEvents: globalLog.length,
  });
});

app.listen(3000, () => {
  console.log("Event-sourced API running on http://localhost:3000");
});`,
    },
  ],
  diagrams: [
    {
      title: "Event Sourcing Architecture Overview",
      kind: "architecture",
      caption:
        "Shows the flow from commands through the event store to projections and read models",
      mermaid: `graph TB
    subgraph Write Side
        CMD[Command] --> CH[Command Handler]
        CH -->|Validate & Emit| ES[(Event Store<br/>Append-Only Log)]
        CH -->|Load Aggregate| ES
    end

    subgraph Event Processing
        ES -->|Subscribe| EP1[Projection Builder 1]
        ES -->|Subscribe| EP2[Projection Builder 2]
        ES -->|Subscribe| EP3[Notification Service]
    end

    subgraph Read Side
        EP1 -->|Materialize| RM1[(Read Model:<br/>Dashboard View)]
        EP2 -->|Materialize| RM2[(Read Model:<br/>Search Index)]
        Q[Query] --> RM1
        Q --> RM2
    end

    style ES fill:#f9a825,stroke:#f57f17,color:#000
    style CMD fill:#42a5f5,stroke:#1565c0,color:#000
    style Q fill:#66bb6a,stroke:#2e7d32,color:#000`,
    },
    {
      title: "Event Replay and Snapshot Flow",
      kind: "flow",
      caption:
        "Demonstrates how snapshots optimize aggregate loading by reducing the number of events to replay",
      mermaid: `flowchart LR
    A[Load Aggregate Request] --> B{Snapshot Exists?}
    B -->|Yes| C[Load Snapshot<br/>version N]
    B -->|No| D[Start from<br/>Empty State]
    C --> E[Load Events<br/>after version N]
    D --> F[Load ALL Events<br/>from version 1]
    E --> G[Replay Events<br/>via Fold Function]
    F --> G
    G --> H[Current Aggregate<br/>State]
    H --> I{Events Since<br/>Last Snapshot > N?}
    I -->|Yes| J[Save New Snapshot]
    I -->|No| K[Done]
    J --> K`,
    },
    {
      title: "Event Lifecycle Sequence",
      kind: "sequence",
      caption:
        "Sequence of interactions when a command is processed in an event-sourced system with CQRS",
      mermaid: `sequenceDiagram
    participant Client
    participant API
    participant CommandHandler
    participant EventStore
    participant ProjectionBuilder
    participant ReadModel

    Client->>API: POST /orders/place
    API->>CommandHandler: PlaceOrder command
    CommandHandler->>EventStore: Load stream "order-123"
    EventStore-->>CommandHandler: Events [v1..v5]
    Note over CommandHandler: Replay events to<br/>rebuild aggregate state
    CommandHandler->>CommandHandler: Validate command<br/>against current state
    CommandHandler->>EventStore: Append OrderPlaced (expected v5)
    EventStore-->>CommandHandler: Confirmed (v6)
    CommandHandler-->>API: Success
    API-->>Client: 201 Created

    Note over EventStore,ProjectionBuilder: Async subscription
    EventStore->>ProjectionBuilder: New event: OrderPlaced
    ProjectionBuilder->>ReadModel: Update materialized view
    Client->>API: GET /orders/123
    API->>ReadModel: Query
    ReadModel-->>API: Order details
    API-->>Client: 200 OK`,
    },
    {
      title: "Event Sourcing Concept Mind Map",
      kind: "mindmap",
      caption:
        "Key concepts and their relationships in event sourcing",
      mermaid: `mindmap
  root((Event Sourcing))
    Event Store
      Append-Only Log
      Streams per Aggregate
      Global Ordering
      Optimistic Concurrency
    Projections
      Read Models
      Synchronous vs Async
      Disposable & Rebuildable
      Multiple per Stream
    Snapshots
      Performance Optimization
      Every N Events
      Not Source of Truth
    Event Replay
      State Reconstruction
      Temporal Queries
      Projection Rebuilds
      Debugging
    Challenges
      Schema Evolution
        Upcasting
        Versioning
      GDPR Compliance
        Crypto-Shredding
      Eventual Consistency
      Storage Growth`,
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Event Sourcing",
      "Traditional CRUD",
      "Event Store",
      "Traditional Database",
    ],
    rows: [
      [
        "**Source of truth**",
        "Immutable *event log*",
        "Current state in *mutable rows*",
        "Append-only event streams",
        "Tables with `UPDATE`/`DELETE`",
      ],
      [
        "**History**",
        "Complete — every change is an event",
        "Lost on overwrite unless separate audit log",
        "Built-in via ordered event streams",
        "Requires triggers or CDC",
      ],
      [
        "**Schema changes**",
        "*Upcasting* transforms old events at read time",
        "Schema migration alters existing rows",
        "Event versioning + upcaster pipeline",
        "`ALTER TABLE` with data migration",
      ],
      [
        "**Concurrency**",
        "Optimistic via **stream version** checks",
        "Row-level locks or optimistic via `updated_at`",
        "`expectedVersion` on append",
        "Database-level locking (`SELECT FOR UPDATE`)",
      ],
      [
        "**Read performance**",
        "Depends on *projections* (eventually consistent)",
        "Direct query on current state tables",
        "Projections built from subscriptions",
        "Indexes on the same tables",
      ],
      [
        "**Debugging**",
        "Replay exact sequence to reproduce state",
        "Only current state available; need logs",
        "Full event history per stream",
        "Point-in-time recovery at DB level only",
      ],
      [
        "**Complexity**",
        "High — schema evolution, eventual consistency, tooling",
        "Low — well-understood CRUD patterns",
        "Specialized infrastructure (e.g., EventStoreDB)",
        "Mature ecosystem (PostgreSQL, MySQL)",
      ],
      [
        "**Data deletion (GDPR)**",
        "*Crypto-shredding* or event transformation",
        "Simple `DELETE` statement",
        "Delete encryption key, not events",
        "Delete or anonymize the row",
      ],
    ],
  },
  exercises: [
    `**Design an Event-Sourced Shopping Cart**: Define the event types (\`ItemAdded\`, \`ItemRemoved\`, \`QuantityChanged\`, \`CartCleared\`, \`CheckedOut\`) and implement the *fold function* that reconstructs the cart state from a sequence of events. Handle edge cases: removing an item not in the cart, checking out an empty cart, and adding an item after checkout. Write the \`applyEvent\` function in your language of choice and test it with at least 10 events.`,
    `**Implement Optimistic Concurrency Control**: Build an event store that enforces version checks on writes. Simulate two concurrent command handlers loading the same aggregate at version 5, then both trying to append events. Verify that the second write *fails* with a concurrency error and demonstrate the retry logic: reload the aggregate at the new version and re-validate the command before retrying the append.`,
    `**Build a Projection Rebuilder**: Given an event store with a global log, implement a projection that tracks \`TotalRevenue\` per product category. Then simulate adding a *new projection* (\`AverageOrderValue\`) after the system has been running — rebuild it from the full event history. Measure the rebuild time and implement a **checkpoint** mechanism so the rebuilder can resume from the last processed position after a crash.`,
    `**Crypto-Shredding for GDPR**: Extend an event-sourced user profile system where events like \`ProfileCreated\`, \`EmailChanged\`, and \`AddressUpdated\` contain personal data. Encrypt the personal data fields using a *per-user key* stored in a separate key store. Implement the \`forgetUser(userId)\` function that deletes the encryption key, then demonstrate that replaying the events for that user yields *unreadable* personal data while the event structure and business logic fields remain intact.`,
    `**Temporal Query Engine**: Build a function \`getStateAtTime(streamId, timestamp)\` that reconstructs the aggregate state as it was at a specific point in the past. Test it by creating 20 events spread across different timestamps, then querying the state at 5 different points. Extend it to support \`getStateBetween(streamId, from, to)\` that returns the *sequence of states* the aggregate passed through in a time window.`,
  ],
  cheatSheet: [
    `**Event Store Append**: Always use \`expectedVersion\` when writing — this is your *optimistic concurrency* guard. Pattern: \`store.append(streamId, expectedVersion, [event1, event2])\`. If the version does not match, reload and retry.`,
    `**Fold / Replay**: State reconstruction is a pure \`reduce\`: \`const state = events.reduce(applyEvent, initialState)\`. The \`applyEvent\` function must be **deterministic** and **side-effect-free** — no I/O, no external calls.`,
    `**Snapshots**: Take a snapshot every **N events** (typical: 50–200). Load pattern: \`snapshot + events[snapshot.version+1 .. latest]\`. Snapshots are *disposable* — never treat them as source of truth.`,
    `**Projections**: Read models are *derived* and *disposable*. To add a new query pattern, create a new projection and rebuild it from the event log. Use **async subscriptions** for scalability; use **sync projections** only for critical consistency needs.`,
    `**Schema Evolution**: Never mutate stored events. Use **event versioning** (\`OrderPlaced_v1\`, \`OrderPlaced_v2\`) and **upcasters** that transform old events to the current schema at read time.`,
    `**GDPR / Deletion**: Use **crypto-shredding** — encrypt PII with a per-user key stored separately. To erase: delete the key. The event structure stays intact for replay; only personal data becomes unreadable.`,
  ],
  revisionNotes: [
    `The **event store** is the single source of truth — current state, projections, and snapshots are all *derived* from the event log and can be rebuilt at any time. Events are **immutable** and **append-only**; corrections are modeled as *compensating events*, never as mutations.`,
    `**Optimistic concurrency** is enforced via stream version checks: when appending events, specify the \`expectedVersion\`. A mismatch means another write occurred concurrently — reload the aggregate, re-validate the command, and retry. This eliminates the need for pessimistic locks.`,
    `**Projections** decouple read and write concerns. They are *asynchronous* (eventually consistent) by default and *synchronous* (strongly consistent) when explicitly needed. Because projections are disposable, new query patterns can be added retroactively by replaying the full event history into a new projection.`,
    `**Event replay** enables temporal queries (state at any past time), debugging (reproduce exact production state), and projection rebuilds. The fold function \`state = events.reduce(apply, init)\` must be **pure** — deterministic and free of side effects.`,
    `Key challenges: **schema evolution** (solved by versioning + upcasting), **GDPR compliance** (solved by *crypto-shredding*), **storage growth** (solved by snapshots + archival), and **eventual consistency** between the event store and projections (mitigated by UI patterns like optimistic updates and polling).`,
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
