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
  followUps: [
    "Does CQRS require event sourcing? Does event sourcing require CQRS?",
    "How does the user experience the lag between write and read models?",
    "When is CQRS clearly over-engineering?",
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
  deepDive: [
    `## The Philosophical Foundation of CQRS

**CQRS** is rooted in Bertrand Meyer's **Command-Query Separation (CQS)** principle from *Object-Oriented Software Construction* (1988), which states that every method should either be a **command** that performs an action *or* a **query** that returns data — **never both**. Greg Young elevated this to an *architectural* pattern around 2010, recognizing that in complex domains, the **write model** (optimized for *invariant enforcement*, *validation*, and *transactional consistency*) and the **read model** (optimized for *query performance*, *denormalization*, and *presentation*) have fundamentally **divergent requirements**. Forcing both into a single model creates a "**least common denominator**" design where neither reads nor writes are truly optimized. CQRS breaks this tension by giving each side its own **model**, **storage**, and **scaling strategy**. The write side uses *Domain-Driven Design* aggregates, enforcing business rules through a rich domain model, while the read side uses \`denormalized projections\` — flat, pre-joined views tailored for specific screens or API responses.`,

    `## Event-Driven Synchronization and Projection Strategies

The **synchronization** between write and read models is where CQRS's real architectural complexity lives. In a **synchronous projection** approach, the write transaction *atomically* updates both models — typically in the same database using *database views* or *materialized views*. This provides **strong consistency** but *tightly couples* read and write performance. The more common **asynchronous projection** approach uses an **event bus** (e.g., \`Kafka\`, \`RabbitMQ\`, \`Amazon SNS/SQS\`) to propagate domain events from the write side to one or more *projection handlers* that update read models. The **outbox pattern** is critical here: rather than publishing events directly (which risks *dual-write failures* — the database commits but the message broker publish fails), the write side stores events in an \`outbox\` table *within the same transaction*. A separate **relay process** (or *Change Data Capture* via Debezium) reads the outbox and publishes to the broker, guaranteeing **at-least-once delivery**. Projection handlers must therefore be **idempotent** — processing the same event twice should produce the same result.`,

    `## Scaling, Failure Modes, and Operational Considerations

CQRS enables **independent scaling**: read-heavy workloads (common in most applications where reads outnumber writes *10:1 to 1000:1*) can scale horizontally with *read replicas*, \`Elasticsearch\` clusters, or \`Redis\` caches, while the write side remains a single, consistent source of truth. However, this architecture introduces **operational complexity**. **Read model rebuilds** are necessary when projection logic changes — this requires *replaying* all events (if using event sourcing) or re-reading the write model. **Monitoring** must track *projection lag* (the delay between a write and its reflection in read models), *dead-letter queues* for failed projections, and *schema evolution* across read models. **Testing** becomes more nuanced: you need *integration tests* that verify the full command-event-projection pipeline, not just unit tests on individual components. The **eventual consistency** window must be communicated to stakeholders and handled in the *UI layer* through patterns like **optimistic updates**, **loading spinners with version checks**, or **read-your-writes** guarantees using \`causal consistency tokens\`.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "C++ Command Handler and Query Handler with Event Bus",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <memory>
#include <optional>

// ─── Domain Events ───────────────────────────────────────
struct DomainEvent {
    std::string type;
    std::string aggregateId;
    virtual ~DomainEvent() = default;
};

struct OrderCreatedEvent : DomainEvent {
    std::string customerId;
    double totalAmount;
    OrderCreatedEvent(const std::string& id, const std::string& custId, double amount)
        : customerId(custId), totalAmount(amount) {
        type = "OrderCreated";
        aggregateId = id;
    }
};

// ─── Event Bus ───────────────────────────────────────────
class EventBus {
    using Handler = std::function<void(const DomainEvent&)>;
    std::unordered_map<std::string, std::vector<Handler>> handlers_;
public:
    void subscribe(const std::string& eventType, Handler handler) {
        handlers_[eventType].push_back(std::move(handler));
    }
    void publish(const DomainEvent& event) {
        auto it = handlers_.find(event.type);
        if (it != handlers_.end()) {
            for (auto& handler : it->second) {
                handler(event);
            }
        }
    }
};

// ─── Write Model (Command Side) ─────────────────────────
struct Order {
    std::string id;
    std::string customerId;
    double totalAmount;
    std::string status;
};

class OrderCommandHandler {
    std::unordered_map<std::string, Order> writeStore_;
    EventBus& eventBus_;
public:
    explicit OrderCommandHandler(EventBus& bus) : eventBus_(bus) {}

    // Command: returns success/failure, NOT data
    bool handleCreateOrder(const std::string& orderId,
                           const std::string& customerId,
                           double amount) {
        // Validate invariants
        if (amount <= 0) return false;
        if (writeStore_.count(orderId)) return false;

        // Persist to write model
        writeStore_[orderId] = {orderId, customerId, amount, "Created"};

        // Publish domain event for read model projection
        OrderCreatedEvent event(orderId, customerId, amount);
        eventBus_.publish(event);
        return true;
    }
};

// ─── Read Model (Query Side) ────────────────────────────
struct OrderReadDto {
    std::string orderId;
    std::string customerId;
    double totalAmount;
    std::string status;
};

class OrderQueryHandler {
    std::unordered_map<std::string, OrderReadDto> readStore_;
public:
    // Projection: subscribes to events and updates read model
    void onOrderCreated(const DomainEvent& baseEvent) {
        auto& event = static_cast<const OrderCreatedEvent&>(baseEvent);
        readStore_[event.aggregateId] = {
            event.aggregateId,
            event.customerId,
            event.totalAmount,
            "Created"
        };
    }

    // Query: returns data, never modifies state
    std::optional<OrderReadDto> getOrderById(const std::string& id) const {
        auto it = readStore_.find(id);
        if (it != readStore_.end()) return it->second;
        return std::nullopt;
    }

    std::vector<OrderReadDto> getOrdersByCustomer(const std::string& custId) const {
        std::vector<OrderReadDto> result;
        for (auto& [_, dto] : readStore_) {
            if (dto.customerId == custId) result.push_back(dto);
        }
        return result;
    }
};

int main() {
    EventBus bus;
    OrderCommandHandler commandHandler(bus);
    OrderQueryHandler queryHandler;

    // Wire up projection
    bus.subscribe("OrderCreated",
        [&](const DomainEvent& e) { queryHandler.onOrderCreated(e); });

    // Execute command
    commandHandler.handleCreateOrder("ORD-001", "CUST-42", 149.99);

    // Execute query
    auto order = queryHandler.getOrderById("ORD-001");
    if (order) {
        std::cout << "Order: " << order->orderId
                  << " | Customer: " << order->customerId
                  << " | Amount: " << order->totalAmount << std::endl;
    }
    return 0;
}`,
    },
    {
      language: "typescript",
      caption: "Node.js/Express CQRS API with Separate Command and Query Routes",
      source: `import express, { Request, Response } from "express";
import { EventEmitter } from "events";

// ─── Event Bus ───────────────────────────────────────────
const eventBus = new EventEmitter();

// ─── Write Model (Command Side) ─────────────────────────
interface Order {
  id: string;
  customerId: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "cancelled";
  createdAt: Date;
}

// In-memory write store (replace with PostgreSQL in production)
const writeStore = new Map<string, Order>();

// Command handlers — validate, persist, emit events
function handleCreateOrder(cmd: {
  orderId: string;
  customerId: string;
  items: { productId: string; quantity: number; price: number }[];
}): { success: boolean; error?: string } {
  // Invariant checks
  if (writeStore.has(cmd.orderId)) {
    return { success: false, error: "Order already exists" };
  }
  if (!cmd.items.length) {
    return { success: false, error: "Order must have at least one item" };
  }

  const totalAmount = cmd.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const order: Order = {
    id: cmd.orderId,
    customerId: cmd.customerId,
    items: cmd.items,
    totalAmount,
    status: "pending",
    createdAt: new Date(),
  };

  // Persist to write store
  writeStore.set(order.id, order);

  // Publish domain event (async projection)
  eventBus.emit("OrderCreated", {
    orderId: order.id,
    customerId: order.customerId,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
    createdAt: order.createdAt,
  });

  return { success: true };
}

// ─── Read Model (Query Side) ────────────────────────────
interface OrderSummaryDto {
  orderId: string;
  customerId: string;
  totalAmount: number;
  itemCount: number;
  status: string;
  createdAt: string;
}

// Denormalized read store (replace with Elasticsearch/Redis)
const readStore = new Map<string, OrderSummaryDto>();
const customerOrderIndex = new Map<string, Set<string>>();

// Projection handler — subscribes to events, updates read model
eventBus.on("OrderCreated", (event: any) => {
  const summary: OrderSummaryDto = {
    orderId: event.orderId,
    customerId: event.customerId,
    totalAmount: event.totalAmount,
    itemCount: event.itemCount,
    status: "pending",
    createdAt: event.createdAt.toISOString(),
  };

  readStore.set(event.orderId, summary);

  // Maintain customer index for fast lookups
  if (!customerOrderIndex.has(event.customerId)) {
    customerOrderIndex.set(event.customerId, new Set());
  }
  customerOrderIndex.get(event.customerId)!.add(event.orderId);
});

// ─── Express API ─────────────────────────────────────────
const app = express();
app.use(express.json());

// COMMAND endpoint — POST only, returns success/failure
app.post("/commands/create-order", (req: Request, res: Response) => {
  const result = handleCreateOrder(req.body);
  if (result.success) {
    res.status(202).json({ status: "accepted" });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// QUERY endpoints — GET only, read from read model
app.get("/queries/orders/:orderId", (req: Request, res: Response) => {
  const order = readStore.get(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.get("/queries/customers/:customerId/orders", (req: Request, res: Response) => {
  const orderIds = customerOrderIndex.get(req.params.customerId);
  if (!orderIds) return res.json([]);
  const orders = [...orderIds]
    .map((id) => readStore.get(id))
    .filter(Boolean);
  res.json(orders);
});

app.listen(3000, () => console.log("CQRS API running on port 3000"));`,
    },
    {
      language: "cpp",
      caption: "C++ Outbox Pattern with Idempotent Projection Handler",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <chrono>

// ─── Outbox Entry ────────────────────────────────────────
struct OutboxEntry {
    std::string eventId;
    std::string eventType;
    std::string aggregateId;
    std::string payload;  // JSON in production
    bool published = false;
};

// ─── Write Side with Outbox ─────────────────────────────
class WriteModelWithOutbox {
    std::unordered_map<std::string, double> accounts_;  // accountId -> balance
    std::vector<OutboxEntry> outbox_;
    int eventCounter_ = 0;

    std::string nextEventId() {
        return "evt-" + std::to_string(++eventCounter_);
    }
public:
    // Command: transfer money (writes to state + outbox atomically)
    bool handleTransfer(const std::string& fromId,
                        const std::string& toId,
                        double amount) {
        // Validate
        if (accounts_[fromId] < amount) return false;

        // Atomic write: state change + outbox entry
        accounts_[fromId] -= amount;
        accounts_[toId] += amount;

        outbox_.push_back({
            nextEventId(), "MoneyTransferred", fromId,
            "from:" + fromId + ",to:" + toId + ",amount:" + std::to_string(amount)
        });
        return true;
    }

    void seedAccount(const std::string& id, double balance) {
        accounts_[id] = balance;
    }

    // Outbox relay: reads unpublished entries
    std::vector<OutboxEntry> getUnpublishedEvents() {
        std::vector<OutboxEntry> result;
        for (auto& entry : outbox_) {
            if (!entry.published) {
                result.push_back(entry);
                entry.published = true;
            }
        }
        return result;
    }
};

// ─── Idempotent Projection Handler ──────────────────────
class TransferReadModel {
    struct TransferDto {
        std::string fromAccount;
        std::string toAccount;
        double amount;
    };
    std::vector<TransferDto> transfers_;
    std::unordered_set<std::string> processedEventIds_;  // idempotency check
public:
    void handleEvent(const OutboxEntry& entry) {
        // Idempotency: skip already-processed events
        if (processedEventIds_.count(entry.eventId)) {
            std::cout << "  [SKIP] Duplicate event: " << entry.eventId << std::endl;
            return;
        }
        processedEventIds_.insert(entry.eventId);

        // Parse and project (simplified; use JSON parser in production)
        transfers_.push_back({"parsed-from", "parsed-to", 0.0});
        std::cout << "  [PROJECTED] " << entry.eventId
                  << " -> " << entry.payload << std::endl;
    }

    size_t transferCount() const { return transfers_.size(); }
};

int main() {
    WriteModelWithOutbox writeModel;
    TransferReadModel readModel;

    writeModel.seedAccount("ACC-1", 1000.0);
    writeModel.seedAccount("ACC-2", 500.0);

    // Execute command
    writeModel.handleTransfer("ACC-1", "ACC-2", 250.0);

    // Outbox relay publishes events
    auto events = writeModel.getUnpublishedEvents();
    std::cout << "Publishing " << events.size() << " events:" << std::endl;
    for (auto& evt : events) {
        readModel.handleEvent(evt);
        // Simulate redelivery (idempotency test)
        readModel.handleEvent(evt);
    }

    std::cout << "Total projected transfers: "
              << readModel.transferCount() << std::endl;
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "CQRS Architecture Overview",
      kind: "architecture",
      caption: "High-level view of CQRS with separate command and query paths, outbox relay, event bus, and multiple read model projections.",
      mermaid: `flowchart TB
    Client["Client or UI"]

    subgraph CommandSide["Command Side - Write"]
        CmdAPI["Command API\nPOST /commands"]
        CmdHandler["Command Handler\nValidate and persist"]
        WriteDB[("Write Database\nNormalized SQL")]
        Outbox[("Outbox Table\nsame transaction")]
    end

    subgraph EventInfra["Event Infrastructure"]
        Relay["Outbox Relay or CDC"]
        EventBus["Event Bus\nKafka or RabbitMQ"]
    end

    subgraph QuerySide["Query Side - Read"]
        Proj1["Projection Handler\nOrders"]
        Proj2["Projection Handler\nSearch"]
        Proj3["Projection Handler\nAnalytics"]
        ReadDB1[("PostgreSQL\nRead Replica")]
        ReadDB2[("Elasticsearch\nSearch Index")]
        ReadDB3[("ClickHouse\nAnalytics")]
        QueryAPI["Query API\nGET /queries"]
    end

    Client --> CmdAPI --> CmdHandler
    CmdHandler --> WriteDB
    CmdHandler --> Outbox
    Outbox --> Relay --> EventBus
    EventBus --> Proj1 --> ReadDB1
    EventBus --> Proj2 --> ReadDB2
    EventBus --> Proj3 --> ReadDB3
    Client --> QueryAPI
    QueryAPI --> ReadDB1
    QueryAPI --> ReadDB2
    QueryAPI --> ReadDB3`,
    },
    {
      title: "CQRS Command Processing Sequence",
      kind: "sequence",
      caption: "Full lifecycle of a command from client submission through atomic write and outbox, async projection, and eventual query availability.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant CA as Command API
    participant CH as Command Handler
    participant WDB as Write DB
    participant OB as Outbox
    participant EB as Event Bus
    participant PH as Projection Handler
    participant RDB as Read DB
    participant QA as Query API

    C->>CA: POST /commands/create-order
    CA->>CH: CreateOrderCommand
    CH->>CH: Validate business rules
    CH->>WDB: BEGIN TRANSACTION
    CH->>WDB: INSERT order row
    CH->>OB: INSERT outbox event
    CH->>WDB: COMMIT
    CH-->>CA: 202 Accepted
    CA-->>C: status accepted

    Note over OB,EB: Async outbox relay polls
    OB->>EB: Publish OrderCreated event
    EB->>PH: Deliver event
    PH->>PH: Check idempotency key
    PH->>RDB: UPSERT read model row

    Note over C,QA: Client queries later
    C->>QA: GET /queries/orders/ORD-001
    QA->>RDB: SELECT from read model
    RDB-->>QA: OrderSummaryDto
    QA-->>C: orderId status totalAmount`,
    },
    {
      title: "CQRS Command Lifecycle State Machine",
      kind: "state",
      caption: "State transitions a command passes through from receipt to read model availability, including failure and retry paths.",
      mermaid: `stateDiagram-v2
    [*] --> CommandReceived: Client submits command
    CommandReceived --> Validating: Parse payload
    Validating --> Rejected: Business rule violation
    Validating --> Persisting: All rules pass

    Rejected --> [*]: Return 400 with error

    Persisting --> WritePersisted: Write DB commit
    WritePersisted --> OutboxStored: Event in outbox table

    OutboxStored --> EventPublished: Relay reads and publishes
    EventPublished --> Projecting: Handler receives event

    Projecting --> ProjectionFailed: Handler throws error
    Projecting --> ReadModelUpdated: Projection written

    ProjectionFailed --> Projecting: Retry with backoff
    ProjectionFailed --> DeadLetter: Max retries exceeded
    ReadModelUpdated --> [*]: Query returns updated data`,
    },
    {
      title: "CQRS vs CRUD Data Flow",
      kind: "flow",
      caption: "Comparison of CRUD single-model flow versus CQRS separate write and read model flow, showing where each approach diverges.",
      mermaid: `flowchart TD
    subgraph CRUD["Traditional CRUD"]
        CR["Client Request\nread or write"]
        SM["Single Model\nnormalized schema"]
        SD[("Single Database\nPostgreSQL")]
        CR --> SM --> SD
        SD --> SM --> CR
    end

    subgraph CQRS["CQRS Pattern"]
        CMD["Command\nwrite intent"]
        QRY["Query\nread request"]
        WM["Write Model\naggregate and rules"]
        RM1["Read Model A\ndenormalized"]
        RM2["Read Model B\nsearch index"]
        WDB2[("Write DB\nnormalized")]
        RDB1[("Read DB A\nPostgreSQL")]
        RDB2[("Read DB B\nElasticsearch")]
        EV["Domain Events\noutbox pattern"]
        CMD --> WM --> WDB2
        WDB2 --> EV
        EV --> RM1 --> RDB1
        EV --> RM2 --> RDB2
        QRY --> RDB1
        QRY --> RDB2
    end`,
    },
  ],

  animations: [
    {
      title: "Splitting the write and read models",
      steps: [
        {
          label: "Single model",
          detail: "One `Order` entity serves both a complex checkout write path and a dashboard that joins six tables.",
        },
        {
          label: "The strain",
          detail: "Normalising for correct writes makes reads slow; denormalising for fast reads makes writes fragile.",
        },
        {
          label: "Split the models",
          detail: "The write side accepts commands and enforces invariants. The read side is a separate, denormalised projection shaped for the queries.",
        },
        {
          label: "Propagate",
          detail: "The write side publishes events; a projector updates the read model.",
        },
        {
          label: "Lag appears",
          detail: "The user submits a change and the dashboard briefly shows the old value — the read model is eventually consistent.",
        },
        {
          label: "Handle it in the UI",
          detail: "Show the optimistic result, or read the user's own recent writes from the write side. Pretending the lag doesn't exist is what makes CQRS feel broken.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Traditional CRUD",
      "CQRS (without Event Sourcing)",
      "CQRS + Event Sourcing",
    ],
    rows: [
      [
        "**Data Model**",
        "Single *normalized* model for reads and writes",
        "Separate **write model** (normalized) and **read model** (denormalized)",
        "Write model is an **event store**; read models are *projections* from events",
      ],
      [
        "**Consistency**",
        "**Strong consistency** — read-after-write guaranteed",
        "**Eventual consistency** between write and read models",
        "**Eventual consistency** — projections lag behind event store",
      ],
      [
        "**Scalability**",
        "Read and write scale *together* (vertical)",
        "Read and write scale **independently** (horizontal reads)",
        "Reads scale **independently**; event store is *append-only* and highly scalable",
      ],
      [
        "**Query Performance**",
        "May require *complex joins* across normalized tables",
        "**Pre-joined**, denormalized read models — *no joins needed*",
        "Projections can be **rebuilt** and *optimized* for any query pattern",
      ],
      [
        "**Audit Trail**",
        "Requires *separate audit logging* — only current state stored",
        "Partial audit via **outbox events** — not a complete history",
        "**Full audit trail** — every state change is an *immutable event*",
      ],
      [
        "**Complexity**",
        "**Low** — single model, single database, *simple CRUD operations*",
        "**Medium** — event bus, projection handlers, *consistency management*",
        "**High** — event store, *snapshots*, projection rebuilds, *versioning*",
      ],
      [
        "**Storage**",
        "Single database (e.g., `PostgreSQL`)",
        "**Polyglot**: `SQL` for writes, `Elasticsearch`/`Redis` for reads",
        "**Event store** + multiple *projection databases* — most storage-intensive",
      ],
      [
        "**Rebuild Capability**",
        "Cannot rebuild — *current state only*",
        "Read models can be **rebuilt from write DB** (with limitations)",
        "Read models fully **rebuildable** by *replaying all events*",
      ],
    ],
  },

  exercises: [
    "**Design a CQRS System**: You are building an e-commerce platform where reads outnumber writes *100:1*. Design the **command side** (order creation, payment processing, inventory updates) and the **query side** (product catalog search, order history, analytics dashboard). Specify which *storage technology* you would use for each read model and justify your choices. Draw the **event flow** from a `CreateOrder` command through to the read model update.",
    "**Implement Idempotent Projections**: Given an event bus that guarantees **at-least-once delivery**, implement a projection handler in your language of choice that handles `OrderCreated`, `OrderShipped`, and `OrderCancelled` events *idempotently*. Ensure that processing the same event twice does not corrupt the read model. Test with a scenario where `OrderCreated` is delivered *three times* followed by `OrderShipped`.",
    "**Handle Eventual Consistency in the UI**: A user submits a form to create a new task in a project management app. After the command succeeds, the user is redirected to the task list — but the *read model has not been updated yet*. Implement **three different strategies** to handle this: (1) `read-your-writes` with version tokens, (2) *optimistic UI update*, and (3) **polling with exponential backoff**. Compare the *trade-offs* of each approach.",
    "**Outbox Pattern Implementation**: Implement the **outbox pattern** for a banking application that processes *money transfers*. The write side must atomically persist the transfer and the outbox event in a **single database transaction**. Build the *relay process* that reads unpublished events and publishes them to a message broker. Handle the case where the relay process *crashes and restarts* — ensure no events are lost or duplicated.",
    "**CQRS Read Model Migration**: Your CQRS system has been running for 6 months with a `PostgreSQL` read model for order queries. Product wants to add **full-text search** across order descriptions, customer names, and product details. Design the *migration plan*: how do you add an `Elasticsearch` read model, **backfill** it with existing data, and ensure it stays *synchronized* with the write side going forward? Consider the impact on existing query endpoints.",
  ],

  cheatSheet: [
    "**Commands** change state and return *success/failure* only. **Queries** return data and *never* modify state. A method that does both violates **CQS**.",
    "Use the **outbox pattern** to avoid *dual-write failures*: persist the event in an `outbox` table within the **same transaction** as the state change, then relay it asynchronously.",
    "**Projection handlers must be idempotent** — with *at-least-once delivery*, the same event may arrive multiple times. Use an `eventId` or `sequence number` to detect and skip duplicates.",
    "Read models are **disposable** — they can be *deleted and rebuilt* from the event source or write-side change log. Design them as **denormalized views** tailored to specific query patterns.",
    "**Eventual consistency** is the core trade-off. Handle it with: *optimistic UI*, `read-your-writes` consistency (version tokens), **polling/SSE/WebSocket**, or *causal consistency* tokens.",
    "CQRS **does not require event sourcing**. You can use a traditional *relational database* for writes and propagate changes via **CDC** (Change Data Capture) or application-level domain events.",
  ],

  revisionNotes: [
    "**Core Principle**: CQRS separates the *write model* (commands — validate and persist state changes) from the *read model* (queries — return denormalized, pre-joined data). Each model can use **different databases**, *different schemas*, and **scale independently**.",
    "**Event Propagation**: Write-side changes flow to read models via **domain events**. The **outbox pattern** ensures reliable delivery: events are stored in an `outbox` table *atomically* with the write, then relayed to the event bus by a separate process. This avoids *distributed transaction* complexity.",
    "**Consistency Trade-off**: CQRS with async projections means **eventual consistency** — the read model *lags behind* the write model. Mitigation strategies include `read-your-writes` guarantees (version tokens), *optimistic UI updates*, and **polling with backoff**. Synchronous projections provide strong consistency but *couple read/write performance*.",
    "**When to Use**: CQRS is justified when (1) read/write workloads have *vastly different scaling needs*, (2) read and write models have **fundamentally different shapes**, (3) *multiple read representations* are needed (search, analytics, API), or (4) combined with **event sourcing** where projections naturally form the read side.",
    "**Key Implementation Details**: Projection handlers must be **idempotent** (same event processed twice produces same result). Read models are *disposable and rebuildable*. The **outbox relay** must handle crashes gracefully — use `last-processed-offset` tracking. Monitor *projection lag* and *dead-letter queues* in production.",
  ],

  resources: [
    {
      label: "CQRS — Martin Fowler",
      kind: "article",
    },
    {
      label: "CQRS Documents — Greg Young",
      kind: "article",
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
