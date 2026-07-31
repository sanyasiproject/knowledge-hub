import type { TopicContent } from "../types";

export const aggregates: TopicContent = {
  quickSummary: [
    "An aggregate is a cluster of domain objects (entities and value objects) treated as a single unit for data changes, with one entity designated as the aggregate root that controls all access.",
    "The aggregate root is the only entry point for external interactions -- all modifications to objects within the aggregate must go through the root, which enforces business invariants.",
    "Consistency boundaries define the scope of transactional guarantees: strong consistency within an aggregate, eventual consistency between aggregates.",
    "The Repository pattern provides collection-like access to aggregates, abstracting persistence details and loading/saving entire aggregates as atomic units.",
  ],
  detailed: [
    `## Aggregate Root and Structure

An aggregate is a graph of domain objects with a designated root entity. The root is the sole entry point: external code holds references only to the root, never to internal objects.

**Rules of aggregates:**
1. The root entity has global identity; internal entities have local identity (unique only within the aggregate).
2. External objects may hold references only to the root. Internal objects are accessible only through root navigation.
3. The root is responsible for enforcing all invariants across the aggregate.
4. Delete the root and everything inside the aggregate is deleted.

**Example -- Order aggregate:**
\`\`\`typescript
class Order {  // Aggregate root
  private readonly id: OrderId;
  private items: OrderLineItem[];     // Internal entity
  private shippingAddress: Address;   // Value object
  private status: OrderStatus;

  addItem(product: ProductRef, quantity: Quantity, price: Money): void {
    if (this.status !== OrderStatus.DRAFT)
      throw new Error("Cannot modify a non-draft order");
    if (this.items.length >= 50)
      throw new Error("Order cannot exceed 50 line items");
    this.items.push(new OrderLineItem(product, quantity, price));
  }

  removeItem(productId: ProductId): void {
    this.items = this.items.filter(i => !i.product.id.equals(productId));
    if (this.items.length === 0)
      throw new Error("Order must have at least one item");
  }
}
\`\`\`

**Key insight:** External code calls \`order.addItem()\`, not \`lineItem.setQuantity()\`. The root mediates all changes and enforces cross-object invariants (max items, minimum one item, draft-only modification).`,

    `## Consistency Boundaries

Aggregates define transactional boundaries in the domain model.

**Within an aggregate (strong consistency):**
- All invariants across the aggregate's objects are enforced in a single transaction.
- When you save an aggregate, all its internal objects are persisted atomically.
- Example: adding an item to an Order checks the total item count and validates the order status -- both invariants are guaranteed within one transaction.

**Between aggregates (eventual consistency):**
- Different aggregates should not be modified in the same transaction.
- Use domain events to propagate changes: when one aggregate changes state, it publishes an event; another aggregate reacts asynchronously.
- Example: placing an Order publishes an OrderPlaced event; the Inventory aggregate reacts by reserving stock in a separate transaction.

**Why this matters:**
- Small aggregates mean smaller transactions, fewer lock contentions, and better scalability.
- Large aggregates that span too many objects create performance bottlenecks and concurrency conflicts.

**Sizing heuristic:**
- An aggregate should be as small as possible while still enforcing its true invariants.
- Ask: "Must these objects be consistent at all times, or can they be eventually consistent?" If eventually consistent is acceptable, they belong in separate aggregates.
- Vaughn Vernon's rule: prefer small aggregates; reference other aggregates by ID, not by direct object reference.`,

    `## Designing Aggregate Boundaries

**Common mistakes:**

1. **Giant aggregates** -- modeling an entire Order with Customer, Products, Inventory, and Payments as one aggregate. This creates massive transactions, frequent concurrency conflicts, and performance issues.

2. **Anemic aggregates** -- aggregates that are just data containers with no behavior. Business rules live in service layers instead of in the aggregate. The aggregate root does not enforce invariants.

3. **Cross-aggregate references** -- holding direct object references to other aggregates instead of referencing them by ID. This blurs boundaries and tempts developers to modify other aggregates in the same transaction.

**Design process:**
1. Identify the true invariants: which rules must be enforced immediately and atomically?
2. Group only the objects needed to enforce those invariants into an aggregate.
3. Reference other aggregates by ID (e.g., \`customerId: CustomerId\` rather than \`customer: Customer\`).
4. Use domain events for cross-aggregate coordination.

**Example -- correcting a common mistake:**
\`\`\`
// Wrong: Order aggregate contains Customer entity
class Order {
  customer: Customer;  // Direct reference -- tempts cross-aggregate mutation
}

// Right: Order references Customer by ID
class Order {
  customerId: CustomerId;  // ID reference -- clean boundary
}
\`\`\``,

    `## Repository Pattern

The Repository pattern provides collection-like access to aggregates, abstracting persistence details.

**Core contract:**
\`\`\`typescript
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
  nextId(): OrderId;
}
\`\`\`

**Key principles:**
- **One repository per aggregate root** -- repositories exist only for aggregate roots, never for internal entities or value objects.
- **Load and save entire aggregates** -- the repository loads the complete aggregate graph and saves it atomically. No partial loads or saves.
- **Collection semantics** -- think of a repository as an in-memory collection. \`save()\` is like adding to or updating the collection; \`findById()\` is like looking up an item.
- **Persistence ignorance** -- the domain model has no knowledge of how aggregates are stored. The repository implementation handles ORM mapping, SQL queries, or document serialization.

**Implementation strategies:**
- **ORM-based** -- use an ORM (TypeORM, Hibernate, Prisma) to map aggregate objects to relational tables. Handle object-relational impedance mismatch with careful mapping.
- **Document store** -- store each aggregate as a JSON document (MongoDB, DynamoDB). Natural fit because aggregates are loaded and saved as units.
- **Event sourcing** -- store the sequence of domain events that produced the aggregate's current state. Reconstruct state by replaying events.

**Testing:**
Use in-memory repository implementations for unit tests:
\`\`\`typescript
class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.value) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.value, order);
  }
}
\`\`\``,

    `## Domain Events and Aggregate Coordination

Domain events are the mechanism for cross-aggregate communication, maintaining eventual consistency between aggregates.

**Pattern:**
1. An aggregate performs a state change and records a domain event.
2. After the transaction commits, the event is published.
3. Event handlers in other aggregates or services react to the event.

**Implementation:**
\`\`\`typescript
class Order {
  private domainEvents: DomainEvent[] = [];

  place(): void {
    if (this.items.length === 0)
      throw new Error("Cannot place an empty order");
    this.status = OrderStatus.PLACED;
    this.domainEvents.push(new OrderPlaced(this.id, this.total(), new Date()));
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
\`\`\`

**Publishing flow:**
1. Application service calls \`order.place()\`.
2. Repository saves the order (including recording events).
3. After commit, infrastructure publishes events from \`order.pullDomainEvents()\`.
4. Inventory handler receives \`OrderPlaced\` and reserves stock.
5. Notification handler receives \`OrderPlaced\` and sends confirmation email.

**Guarantees:**
- Use the Outbox pattern to ensure events are published reliably: store events in a database table within the same transaction as the aggregate change, then a separate process publishes them to the message broker.
- Consumers must be idempotent because events may be delivered more than once.`,
  ],
  interviewQA: [
    {
      q: "What is an aggregate root and why is it important?",
      a: "An aggregate root is the designated entry point entity for a cluster of related domain objects. All external access and modifications to objects within the aggregate must go through the root. It is important because the root enforces business invariants across the entire aggregate, ensuring consistency. Without a root, external code could modify internal objects directly, bypassing validation rules and leaving the aggregate in an inconsistent state.",
    },
    {
      q: "How do you decide what belongs inside an aggregate vs. being a separate aggregate?",
      a: "Ask whether the objects must be immediately consistent with each other (true invariant) or can be eventually consistent. Only objects that share true invariants belong in the same aggregate. Keep aggregates small -- reference other aggregates by ID, not by direct object reference. For example, an Order does not contain a Customer entity; it holds a CustomerId. Use domain events for cross-aggregate coordination. Vaughn Vernon's heuristic: if in doubt, make it a separate aggregate.",
    },
    {
      q: "Why should there be one repository per aggregate root?",
      a: "Repositories provide collection-like access to aggregates and manage their persistence lifecycle. Since the aggregate root is the entry point for all access, the repository loads and saves the entire aggregate as an atomic unit. Creating repositories for internal entities would violate the aggregate boundary -- internal objects should only be accessible through the root. This also ensures that all invariants are checked when the aggregate is saved.",
    },
    {
      q: "How do you handle coordination between aggregates without breaking transactional boundaries?",
      a: "Use domain events. When one aggregate changes state, it records a domain event. After the transaction commits, the event is published and other aggregates react in their own transactions. Use the Outbox pattern for reliable publishing: store events in a table within the same transaction, then publish asynchronously. This maintains eventual consistency between aggregates without coupling them in a single transaction, which would create contention and scalability issues.",
    },
  ],
  mcqs: [
    {
      q: "Which statement about aggregate roots is correct?",
      options: [
        "Any entity within an aggregate can serve as the entry point for external access",
        "The aggregate root is the only entity that external objects may hold references to",
        "Aggregate roots should not enforce business invariants to keep them lightweight",
        "Multiple aggregate roots can share the same database transaction",
      ],
      answerIndex: 1,
      explanation:
        "External objects may only hold references to the aggregate root. Internal entities and value objects are accessible only through the root, which enforces all invariants and controls all modifications.",
    },
    {
      q: "How should one aggregate reference another aggregate?",
      options: [
        "By holding a direct object reference to the other aggregate root",
        "By sharing the same database table for joined queries",
        "By referencing the other aggregate's identity (ID) only",
        "By embedding the other aggregate as a nested value object",
      ],
      answerIndex: 2,
      explanation:
        "Aggregates should reference each other by ID, not by direct object reference. This maintains clean boundaries, prevents accidental cross-aggregate mutations in the same transaction, and supports independent scaling and persistence.",
    },
    {
      q: "What is the Outbox pattern used for?",
      options: [
        "Caching frequently accessed aggregate data",
        "Ensuring domain events are published reliably after the aggregate transaction commits",
        "Batching multiple aggregate saves into a single transaction",
        "Storing aggregate snapshots for faster loading",
      ],
      answerIndex: 1,
      explanation:
        "The Outbox pattern stores domain events in a database table within the same transaction as the aggregate change. A separate process then reads from this table and publishes to the message broker, ensuring events are not lost even if the broker is temporarily unavailable.",
    },
    {
      q: "What is the main risk of designing aggregates that are too large?",
      options: [
        "The code becomes harder to read due to too many classes",
        "Increased transaction scope leading to lock contention, concurrency conflicts, and poor performance",
        "The domain language becomes too specific and rigid",
        "Unit tests require more assertions per test case",
      ],
      answerIndex: 1,
      explanation:
        "Large aggregates create large transactions that lock more data for longer periods, increasing the chance of concurrent updates conflicting. This degrades performance and scalability. Keep aggregates small and use eventual consistency between them.",
    },
  ],
  flashcards: [
    {
      front: "Four rules of aggregates",
      back: "1. Root has global identity; internals have local identity. 2. External objects reference only the root. 3. Root enforces all invariants. 4. Deleting the root deletes everything inside.",
    },
    {
      front: "Strong vs. eventual consistency in aggregate design",
      back: "Strong consistency applies within a single aggregate (one transaction). Eventual consistency applies between aggregates (domain events, separate transactions). This distinction drives aggregate sizing -- only group objects that must be immediately consistent.",
    },
    {
      front: "Why reference other aggregates by ID, not by object?",
      back: "Direct object references blur boundaries, tempt cross-aggregate mutations in one transaction, prevent independent scaling, and create loading/serialization issues. ID references keep aggregates decoupled and allow lazy loading when needed.",
    },
    {
      front: "What is the Outbox pattern?",
      back: "Store domain events in a database table within the same transaction as the aggregate change. A separate process polls the outbox and publishes events to the message broker. This guarantees reliable event delivery without distributed transactions.",
    },
    {
      front: "Repository: one per aggregate root",
      back: "Repositories exist only for aggregate roots. They load and save entire aggregates atomically. No repositories for internal entities -- those are accessed only through the root. Think of a repository as an in-memory collection of aggregates.",
    },
    {
      front: "Vaughn Vernon's aggregate sizing heuristic",
      back: "Prefer small aggregates. Include only what is needed to enforce true invariants. If eventual consistency is acceptable between two objects, put them in separate aggregates. Most aggregates should have a single root entity with value objects.",
    },
    {
      front: "Domain events pattern for aggregate coordination",
      back: "Aggregate performs state change and records event internally. After transaction commits, events are published. Other aggregates react in their own transactions. Consumers must be idempotent (at-least-once delivery).",
    },
  ],
  glossary: [
    {
      term: "Aggregate",
      definition:
        "A cluster of domain objects (entities and value objects) treated as a single unit for data changes, with a designated root entity controlling all access and enforcing invariants.",
    },
    {
      term: "Aggregate Root",
      definition:
        "The designated entity that serves as the sole entry point for an aggregate. External objects may only hold references to the root.",
    },
    {
      term: "Consistency Boundary",
      definition:
        "The scope within which transactional consistency is guaranteed. Within an aggregate, consistency is immediate; between aggregates, it is eventual.",
    },
    {
      term: "Repository Pattern",
      definition:
        "A pattern that provides collection-like access to aggregates, abstracting persistence details. One repository exists per aggregate root, loading and saving entire aggregates atomically.",
    },
    {
      term: "Domain Event",
      definition:
        "A record of something significant that happened in the domain (e.g., OrderPlaced, PaymentCaptured). Used to coordinate between aggregates with eventual consistency.",
    },
    {
      term: "Outbox Pattern",
      definition:
        "A reliability pattern where domain events are stored in a database table within the aggregate's transaction, then published to a message broker by a separate process.",
    },
    {
      term: "Invariant",
      definition:
        "A business rule that must always be true. Aggregates are designed to enforce their invariants atomically within a single transaction.",
    },
  ],
  deepDive: [
    `## The Anatomy of a Well-Designed Aggregate

**Aggregates** are the cornerstone of *tactical* Domain-Driven Design. At their core, they answer a deceptively simple question: **"Which objects must change together in the same transaction?"** The answer shapes your entire architecture -- from database schema to API design to messaging topology.

A well-designed aggregate has three defining characteristics:
- **A single root entity** with a globally unique identity (e.g., \`OrderId\`, \`AccountId\`). Every interaction from the outside world flows through this root.
- **Internal entities and value objects** that exist only in relation to the root. They carry *local identity* (meaningful only within the aggregate) or no identity at all (value objects compared by structural equality).
- **Invariant enforcement** -- the root's methods are the *only* place where cross-object business rules are validated. External services, application layers, and even other aggregates **never** reach inside to mutate internal state directly.

The **Aggregate Root** pattern is not merely an organizational convenience; it is a *consistency firewall*. Without it, any piece of code could mutate an \`OrderLineItem\` directly, bypassing the Order's rule that \`totalAmount <= customerCreditLimit\`. The root acts as a **gatekeeper**, making invalid states *unrepresentable* at the API level.`,

    `## Transactional Boundaries and Eventual Consistency

The most consequential design decision in aggregate modeling is **where to draw the boundary**. This decision has cascading effects on *performance*, *scalability*, and *developer experience*.

**Within an aggregate**, you get **ACID guarantees**:
- *Atomicity*: all changes commit or none do
- *Consistency*: invariants are checked before commit
- *Isolation*: concurrent modifications are serialized (typically via optimistic locking with a \`version\` field)
- *Durability*: once committed, the state persists

**Between aggregates**, you must embrace **eventual consistency**. This is not a compromise -- it is a *strategic choice*. Consider an e-commerce system:
- The \`Order\` aggregate records that an order was placed
- The \`Inventory\` aggregate reserves stock *in a separate transaction*
- The \`Payment\` aggregate captures payment *in yet another transaction*

Each step publishes a **domain event** (\`OrderPlaced\`, \`StockReserved\`, \`PaymentCaptured\`). If stock reservation fails, a *compensating action* (e.g., \`OrderCancelled\`) is triggered. This is the **Saga pattern** in action -- a sequence of local transactions coordinated by events, with compensations for failures.

**Optimistic concurrency** is the preferred locking strategy for aggregates. Each aggregate carries a \`version\` number. On save, the repository checks: *"Is the version in the database the same as when I loaded it?"* If not, a \`ConcurrencyException\` is thrown, and the operation is retried. This avoids pessimistic locks that degrade throughput under load.`,

    `## Advanced Patterns: Event Sourcing, Snapshots, and CQRS

When aggregates are **event-sourced**, their state is not stored as a mutable row in a table. Instead, every state change is recorded as an immutable **domain event** in an append-only event store. The current state is reconstructed by *replaying* the event stream from the beginning.

**Benefits of event sourcing with aggregates:**
- **Complete audit trail** -- every change is preserved with a timestamp and actor
- **Temporal queries** -- reconstruct the aggregate's state at any point in time
- **Event-driven architecture** -- the event store *is* the publish mechanism; consumers subscribe to the stream directly
- **Debugging** -- reproduce any bug by replaying the exact sequence of events that caused it

**Challenges and mitigations:**
- *Event replay performance*: for long-lived aggregates with thousands of events, replaying from scratch is slow. Use **snapshots** -- periodically serialize the aggregate's full state and replay only events after the snapshot.
- *Schema evolution*: events are immutable, but their structure evolves over time. Use **event upcasters** to transform old event shapes into the current schema at read time.
- *CQRS (Command Query Responsibility Segregation)*: separate the write model (aggregates processing commands) from the read model (projections optimized for queries). Aggregates handle *writes*; read-side projections (denormalized views, search indexes) handle *queries*. This decouples write-side complexity from read-side performance requirements.

**Key takeaway:** Aggregates, whether traditionally persisted or event-sourced, are fundamentally about **protecting invariants within a transactional boundary** while enabling **loose coupling** between boundaries via domain events.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Aggregate root with invariant enforcement and domain events in C++",
      source: `#include <string>
#include <vector>
#include <stdexcept>
#include <memory>
#include <chrono>

// Value Objects
struct Money {
    double amount;
    std::string currency;

    Money operator+(const Money& other) const {
        if (currency != other.currency)
            throw std::logic_error("Currency mismatch");
        return {amount + other.amount, currency};
    }

    bool operator>(const Money& other) const {
        return amount > other.amount;
    }
};

struct ProductRef {
    std::string productId;
};

// Domain Event base
struct DomainEvent {
    virtual ~DomainEvent() = default;
    std::chrono::system_clock::time_point occurredAt =
        std::chrono::system_clock::now();
};

struct OrderPlaced : public DomainEvent {
    std::string orderId;
    Money total;
    OrderPlaced(std::string id, Money t)
        : orderId(std::move(id)), total(t) {}
};

// Internal Entity (local identity within the aggregate)
class OrderLineItem {
public:
    OrderLineItem(ProductRef product, int quantity, Money unitPrice)
        : product_(std::move(product))
        , quantity_(quantity)
        , unitPrice_(unitPrice) {}

    Money lineTotal() const {
        return {unitPrice_.amount * quantity_, unitPrice_.currency};
    }

    const std::string& productId() const { return product_.productId; }

private:
    ProductRef product_;
    int quantity_;
    Money unitPrice_;
};

// Aggregate Root
enum class OrderStatus { DRAFT, PLACED, SHIPPED, CANCELLED };

class Order {
public:
    explicit Order(std::string id, std::string customerId)
        : id_(std::move(id))
        , customerId_(std::move(customerId))
        , status_(OrderStatus::DRAFT)
        , version_(0) {}

    // --- Commands (mutating operations via the root) ---

    void addItem(ProductRef product, int quantity, Money unitPrice) {
        if (status_ != OrderStatus::DRAFT)
            throw std::logic_error("Cannot modify a non-draft order");
        if (items_.size() >= 50)
            throw std::logic_error("Order cannot exceed 50 line items");
        if (quantity <= 0)
            throw std::invalid_argument("Quantity must be positive");

        items_.emplace_back(std::move(product), quantity, unitPrice);
    }

    void place() {
        if (items_.empty())
            throw std::logic_error("Cannot place an empty order");
        if (status_ != OrderStatus::DRAFT)
            throw std::logic_error("Order must be in DRAFT to place");

        status_ = OrderStatus::PLACED;
        recordEvent(std::make_unique<OrderPlaced>(id_, calculateTotal()));
    }

    // --- Queries ---

    Money calculateTotal() const {
        Money total{0.0, "USD"};
        for (const auto& item : items_)
            total = total + item.lineTotal();
        return total;
    }

    const std::string& id() const { return id_; }
    int version() const { return version_; }
    OrderStatus status() const { return status_; }

    // --- Domain Events ---

    std::vector<std::unique_ptr<DomainEvent>> pullEvents() {
        return std::move(events_);
    }

private:
    void recordEvent(std::unique_ptr<DomainEvent> event) {
        events_.push_back(std::move(event));
    }

    std::string id_;
    std::string customerId_;  // ID reference, NOT an object
    OrderStatus status_;
    int version_;
    std::vector<OrderLineItem> items_;
    std::vector<std::unique_ptr<DomainEvent>> events_;
};`,
    },
    {
      language: "cpp",
      caption: "Repository pattern with optimistic concurrency for aggregate persistence",
      source: `#include <unordered_map>
#include <optional>
#include <memory>
#include <stdexcept>

// Repository interface -- one per aggregate root
class OrderRepository {
public:
    virtual ~OrderRepository() = default;
    virtual std::optional<Order> findById(const std::string& id) = 0;
    virtual void save(Order& order) = 0;
    virtual void remove(const std::string& id) = 0;
};

// In-memory implementation (for unit tests)
class InMemoryOrderRepository : public OrderRepository {
public:
    std::optional<Order> findById(const std::string& id) override {
        auto it = store_.find(id);
        if (it == store_.end()) return std::nullopt;
        return it->second;  // returns a copy
    }

    void save(Order& order) override {
        auto it = store_.find(order.id());
        if (it != store_.end()) {
            // Optimistic concurrency check
            if (it->second.version() != order.version())
                throw std::runtime_error(
                    "Concurrency conflict: aggregate was modified by another transaction");
        }
        store_[order.id()] = order;
    }

    void remove(const std::string& id) override {
        store_.erase(id);
    }

private:
    std::unordered_map<std::string, Order> store_;
};

// Application Service -- orchestrates use cases
class PlaceOrderService {
public:
    explicit PlaceOrderService(OrderRepository& repo) : repo_(repo) {}

    void execute(const std::string& orderId) {
        auto orderOpt = repo_.findById(orderId);
        if (!orderOpt.has_value())
            throw std::runtime_error("Order not found");

        Order& order = orderOpt.value();
        order.place();          // Aggregate enforces invariants
        repo_.save(order);      // Persist atomically

        // After commit, publish domain events
        auto events = order.pullEvents();
        for (auto& event : events) {
            // eventBus_.publish(*event);  // infrastructure concern
        }
    }

private:
    OrderRepository& repo_;
};`,
    },
    {
      language: "cpp",
      caption: "Event-sourced aggregate reconstructing state from domain events",
      source: `#include <vector>
#include <string>
#include <memory>
#include <functional>
#include <stdexcept>

// Event types for the Account aggregate
struct AccountEvent {
    virtual ~AccountEvent() = default;
};

struct AccountOpened : AccountEvent {
    std::string accountId;
    std::string ownerName;
    AccountOpened(std::string id, std::string name)
        : accountId(std::move(id)), ownerName(std::move(name)) {}
};

struct MoneyDeposited : AccountEvent {
    double amount;
    explicit MoneyDeposited(double amt) : amount(amt) {}
};

struct MoneyWithdrawn : AccountEvent {
    double amount;
    explicit MoneyWithdrawn(double amt) : amount(amt) {}
};

// Event-sourced aggregate
class BankAccount {
public:
    // --- Reconstruct from event history ---
    static BankAccount fromHistory(
        const std::vector<std::unique_ptr<AccountEvent>>& history
    ) {
        BankAccount account;
        for (const auto& event : history)
            account.apply(*event);
        account.uncommitted_.clear();  // history events are already persisted
        return account;
    }

    // --- Commands ---
    static BankAccount open(const std::string& id, const std::string& owner) {
        BankAccount account;
        account.raise(std::make_unique<AccountOpened>(id, owner));
        return account;
    }

    void deposit(double amount) {
        if (amount <= 0)
            throw std::invalid_argument("Deposit amount must be positive");
        raise(std::make_unique<MoneyDeposited>(amount));
    }

    void withdraw(double amount) {
        if (amount <= 0)
            throw std::invalid_argument("Withdrawal amount must be positive");
        if (amount > balance_)
            throw std::logic_error("Insufficient funds");
        raise(std::make_unique<MoneyWithdrawn>(amount));
    }

    // --- Queries ---
    double balance() const { return balance_; }
    const std::string& id() const { return id_; }

    std::vector<std::unique_ptr<AccountEvent>> pullUncommitted() {
        return std::move(uncommitted_);
    }

private:
    BankAccount() = default;

    void raise(std::unique_ptr<AccountEvent> event) {
        apply(*event);
        uncommitted_.push_back(std::move(event));
    }

    void apply(const AccountEvent& event) {
        if (auto* e = dynamic_cast<const AccountOpened*>(&event)) {
            id_ = e->accountId;
            ownerName_ = e->ownerName;
            balance_ = 0.0;
        } else if (auto* e = dynamic_cast<const MoneyDeposited*>(&event)) {
            balance_ += e->amount;
        } else if (auto* e = dynamic_cast<const MoneyWithdrawn*>(&event)) {
            balance_ -= e->amount;
        }
    }

    std::string id_;
    std::string ownerName_;
    double balance_ = 0.0;
    std::vector<std::unique_ptr<AccountEvent>> uncommitted_;
};`,
    },
  ],
  diagrams: [
    {
      title: "Aggregate Structure and Boundaries",
      kind: "architecture",
      caption: "Shows how the aggregate root controls access to internal entities and value objects, with external references by ID only.",
      mermaid: `flowchart TB
    subgraph OrderAggregate["Order Aggregate"]
        Root["<b>Order</b><br/>(Aggregate Root)<br/>Global Identity: OrderId"]
        LI1["OrderLineItem<br/>(Internal Entity)<br/>Local Identity"]
        LI2["OrderLineItem<br/>(Internal Entity)<br/>Local Identity"]
        Addr["Address<br/>(Value Object)<br/>No Identity"]
        Status["OrderStatus<br/>(Value Object)"]
        Root --> LI1
        Root --> LI2
        Root --> Addr
        Root --> Status
    end

    ExtService["Application Service"]
    CustId["customerId: CustomerId<br/>(ID Reference)"]
    Root -.- CustId

    ExtService -->|"order.addItem()"| Root
    ExtService -.->|"BLOCKED: lineItem.setQty()"| LI1

    style Root fill:#4a9eff,color:#fff,stroke:#2a7ae0
    style LI1 fill:#6cc644,color:#fff,stroke:#4a9f35
    style LI2 fill:#6cc644,color:#fff,stroke:#4a9f35
    style Addr fill:#f5a623,color:#fff,stroke:#d4891a
    style Status fill:#f5a623,color:#fff,stroke:#d4891a
    style ExtService fill:#9b59b6,color:#fff,stroke:#7d3c98`,
    },
    {
      title: "Cross-Aggregate Coordination via Domain Events",
      kind: "sequence",
      caption: "Illustrates eventual consistency between aggregates using domain events and the Outbox pattern.",
      mermaid: `sequenceDiagram
    participant AppService as Application Service
    participant Order as Order Aggregate
    participant DB as Database
    participant Outbox as Outbox Table
    participant Poller as Outbox Poller
    participant Broker as Message Broker
    participant Inventory as Inventory Aggregate
    participant Notification as Notification Service

    AppService->>Order: place()
    Order->>Order: Validate invariants
    Order->>Order: Record OrderPlaced event

    AppService->>DB: BEGIN TRANSACTION
    AppService->>DB: Save Order (status=PLACED)
    AppService->>Outbox: Insert OrderPlaced event
    AppService->>DB: COMMIT

    Note over Poller: Polls outbox periodically
    Poller->>Outbox: Read unpublished events
    Poller->>Broker: Publish OrderPlaced
    Poller->>Outbox: Mark as published

    Broker->>Inventory: OrderPlaced
    Inventory->>Inventory: reserveStock()
    Note over Inventory: Separate transaction

    Broker->>Notification: OrderPlaced
    Notification->>Notification: sendConfirmationEmail()`,
    },
    {
      title: "Aggregate Lifecycle State Transitions",
      kind: "state",
      caption: "State machine for a typical Order aggregate showing valid transitions and the events that trigger them.",
      mermaid: `stateDiagram-v2
    [*] --> Draft: create()
    Draft --> Draft: addItem() / removeItem()
    Draft --> Placed: place()
    Placed --> Confirmed: confirmPayment()
    Placed --> Cancelled: cancel()
    Confirmed --> Shipped: ship()
    Confirmed --> Cancelled: cancel()
    Shipped --> Delivered: confirmDelivery()
    Shipped --> Returned: initiateReturn()
    Delivered --> [*]
    Cancelled --> [*]
    Returned --> Refunded: processRefund()
    Refunded --> [*]

    note right of Draft: Invariants checked\\non every mutation
    note right of Placed: Publishes OrderPlaced\\ndomain event
    note left of Cancelled: Publishes OrderCancelled\\ntriggers compensation`,
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Traditional Persistence",
      "Event Sourcing",
      "Document Store",
    ],
    rows: [
      [
        "**Storage format**",
        "Mutable rows in relational tables",
        "Append-only immutable event stream",
        "JSON/BSON documents per aggregate",
      ],
      [
        "**State reconstruction**",
        "Direct read from current row",
        "Replay events from the beginning (or snapshot)",
        "Direct read of full document",
      ],
      [
        "**Audit trail**",
        "Requires explicit audit logging",
        "*Built-in* -- every event is an audit record",
        "Requires explicit versioning or change tracking",
      ],
      [
        "**Schema evolution**",
        "Database migrations (ALTER TABLE)",
        "Event upcasters transform old event shapes",
        "Schema-flexible but needs migration scripts",
      ],
      [
        "**Aggregate fit**",
        "Requires ORM mapping for object graphs",
        "Natural fit -- aggregate emits and consumes events",
        "Natural fit -- aggregate is a single document",
      ],
      [
        "**Query complexity**",
        "Rich SQL queries, joins across tables",
        "Requires *CQRS* read projections for queries",
        "Limited query power; denormalization needed",
      ],
      [
        "**Concurrency handling**",
        "`version` column with optimistic locking",
        "Stream position / expected version check",
        "Atomic document replacement with version field",
      ],
    ],
  },
  exercises: [
    "**Design an aggregate for a Library system**: Identify the aggregate root, internal entities, and value objects for a `BookLoan` aggregate. Define which invariants it must enforce (e.g., a book cannot be loaned if already checked out, a patron cannot exceed 5 active loans). Write the aggregate root class in C++ with methods `checkOut()`, `returnBook()`, and `extend()`, each enforcing the relevant invariants.",
    "**Refactor a monolithic aggregate**: Given a `ShoppingCart` aggregate that contains `Customer`, `Product`, `Inventory`, and `PaymentMethod` as direct object references, identify which objects should be extracted into separate aggregates. Replace direct references with ID references and define the domain events needed for cross-aggregate coordination.",
    "**Implement the Outbox pattern**: Write a C++ `OutboxRepository` that stores domain events in the same transaction as the aggregate save. Then write a `OutboxPoller` class that reads unpublished events, publishes them to a mock event bus, and marks them as published. Handle idempotency by checking for duplicate event IDs.",
    "**Event-source a BankAccount aggregate**: Implement a `BankAccount` aggregate in C++ that derives its state entirely from events (`AccountOpened`, `MoneyDeposited`, `MoneyWithdrawn`, `AccountFrozen`). Include a `fromHistory()` static method that replays events to rebuild state. Add a snapshot mechanism that serializes the aggregate state after every 100 events.",
    "**Aggregate boundary analysis**: For an e-commerce domain with `Order`, `Customer`, `Product`, `Inventory`, `Payment`, and `Shipping`, draw the aggregate boundaries. For each boundary, justify *why* those objects must be strongly consistent. Identify at least three domain events that flow between aggregates and describe the Saga that coordinates the full order-to-delivery workflow.",
  ],
  cheatSheet: [
    "**One repository per aggregate root** -- never create repositories for internal entities or value objects. The repository loads and saves the *entire* aggregate atomically.",
    "**Reference other aggregates by ID** -- use `customerId: CustomerId` not `customer: Customer`. This prevents cross-aggregate mutations in a single transaction and keeps boundaries clean.",
    "**Prefer small aggregates** -- include only objects that share *true invariants* (must be immediately consistent). If eventual consistency is acceptable, split into separate aggregates.",
    "**Use domain events for cross-aggregate coordination** -- publish events after the aggregate transaction commits. Consumers react in their own transactions. Use the **Outbox pattern** for reliable delivery.",
    "**Optimistic concurrency via version field** -- each aggregate carries a `version` number. On save, check that the stored version matches the loaded version. Throw `ConcurrencyException` on mismatch.",
    "**Enforce invariants in the aggregate root** -- all business rules that span multiple objects within the aggregate must be validated in the root's methods. External code *never* mutates internal objects directly.",
  ],
  revisionNotes: [
    "An **aggregate** is a cluster of entities and value objects with a designated **root entity**. The root has *global identity*; internal objects have *local identity* or none. All external access goes through the root, which enforces all **invariants** in a single transaction.",
    "**Consistency model**: *strong consistency* within an aggregate (ACID transaction), *eventual consistency* between aggregates (domain events). This distinction drives aggregate sizing -- smaller is better for performance and concurrency.",
    "**Repository pattern**: one repo per aggregate root, loads/saves the full aggregate atomically. Use **optimistic locking** (version field) to handle concurrent modifications. In-memory implementations enable fast unit testing.",
    "**Domain events + Outbox pattern**: after an aggregate commits, domain events stored in an outbox table are published by a poller to a message broker. Consumers must be **idempotent** (at-least-once delivery). The **Saga pattern** coordinates multi-aggregate workflows with compensating actions.",
    "**Event sourcing** stores state as an append-only event stream rather than mutable rows. Benefits: full audit trail, temporal queries, natural event-driven architecture. Use **snapshots** to avoid replaying thousands of events. Pair with **CQRS** to separate write-side aggregates from read-side projections.",
  ],
};
