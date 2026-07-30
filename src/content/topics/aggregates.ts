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
};
