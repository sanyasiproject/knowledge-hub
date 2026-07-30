import type { TopicContent } from "../types";

export const entitiesValueObjects: TopicContent = {
  quickSummary: [
    "Entities are domain objects with a unique identity that persists through state changes -- two entities with identical attributes are still distinct if their identities differ.",
    "Value objects are immutable domain objects defined entirely by their attributes -- two value objects with the same attributes are interchangeable and considered equal.",
    "Entities track lifecycle and state transitions; value objects represent descriptive, measurable, or quantifiable aspects of the domain without individual identity.",
    "Favoring value objects over entities wherever possible leads to simpler, more testable domain models with fewer side effects and reduced accidental complexity.",
  ],
  detailed: [
    `## Entities: Identity and Lifecycle

An entity is a domain object whose identity is defined by a unique identifier rather than its attributes. Two customers with the same name and address are still different customers because they have different IDs.

**Key characteristics:**
- **Identity** -- defined by a stable, unique identifier (UUID, database sequence, natural key). Identity survives all attribute changes.
- **Mutability** -- entities change state over their lifecycle (an Order moves from PLACED to SHIPPED to DELIVERED).
- **Equality by identity** -- two entities are equal if and only if their identifiers match, regardless of other attributes.
- **Continuity** -- an entity has a lifecycle. It is created, modified through state transitions, and eventually may be archived or deleted.

**Implementation:**
\`\`\`typescript
class Customer {
  constructor(
    private readonly id: CustomerId,
    private name: string,
    private email: Email,
    private tier: CustomerTier
  ) {}

  equals(other: Customer): boolean {
    return this.id.equals(other.id); // Identity-based equality
  }

  upgradeTier(newTier: CustomerTier): void {
    this.tier = newTier; // State changes are expected
  }
}
\`\`\`

**When to model as an entity:**
- The object must be tracked across time and state changes.
- Two instances with identical attributes must remain distinguishable.
- The object has a meaningful lifecycle (creation, transitions, termination).`,

    `## Value Objects: Attributes and Immutability

A value object is defined entirely by its attributes. It has no conceptual identity -- if two value objects have the same attribute values, they are interchangeable.

**Key characteristics:**
- **No identity** -- defined by what it is, not who it is. No ID field needed.
- **Immutability** -- once created, a value object cannot be modified. "Changes" produce new instances.
- **Equality by value** -- two value objects are equal if all their attributes are equal.
- **Self-validating** -- a value object validates its invariants at construction time. An invalid value object cannot exist.
- **Side-effect free** -- methods return new values rather than modifying internal state.

**Implementation:**
\`\`\`typescript
class Money {
  private constructor(
    readonly amount: number,
    readonly currency: Currency
  ) {
    if (amount < 0) throw new Error("Amount cannot be negative");
  }

  static of(amount: number, currency: Currency): Money {
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency))
      throw new Error("Cannot add different currencies");
    return Money.of(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }
}
\`\`\`

**Common value objects:** Money, Address, DateRange, EmailAddress, PhoneNumber, Coordinates, Temperature, Percentage, Color.`,

    `## Entity vs. Value Object Decision Guide

The distinction is context-dependent. An Address might be a value object in an e-commerce system (just a shipping destination) but an entity in a real estate application (each property address has a unique identity and history).

**Decision criteria:**

| Question | Entity | Value Object |
|----------|--------|--------------|
| Does it need a unique identity? | Yes | No |
| Do two instances with same attributes need to be distinguishable? | Yes | No |
| Does it change state over time? | Yes | No (create new) |
| Is it measured, quantified, or described? | No | Yes |
| Can it be freely replaced by another with same values? | No | Yes |

**Prefer value objects when possible:**
- They are simpler to reason about (no identity management, no mutation side effects).
- They are inherently thread-safe (immutable).
- They are easier to test (no mocking, no state setup, just construct and assert).
- They reduce accidental complexity in the domain model.

**Common mistake:** Modeling everything as an entity with an auto-generated ID. Many concepts that developers reflexively make into entities (Address, Money, DateRange) are naturally value objects.`,

    `## Domain Modeling with Entities and Value Objects

A well-designed domain model uses entities sparingly -- only for concepts that truly need identity and lifecycle -- and composes them from rich value objects.

**Example -- Order domain:**
\`\`\`typescript
// Value Objects
class OrderLineItem {
  constructor(
    readonly product: ProductReference,
    readonly quantity: Quantity,
    readonly unitPrice: Money
  ) {}

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity.value);
  }
}

class ShippingAddress {
  constructor(
    readonly street: string,
    readonly city: string,
    readonly postalCode: PostalCode,
    readonly country: CountryCode
  ) {}
}

// Entity (has identity, lifecycle, state transitions)
class Order {
  private constructor(
    private readonly id: OrderId,
    private items: OrderLineItem[],
    private shippingAddress: ShippingAddress,
    private status: OrderStatus,
    private readonly placedAt: Date
  ) {}

  static place(
    id: OrderId,
    items: OrderLineItem[],
    address: ShippingAddress
  ): Order {
    if (items.length === 0) throw new Error("Order must have items");
    return new Order(id, items, address, OrderStatus.PLACED, new Date());
  }

  confirm(): void {
    if (this.status !== OrderStatus.PLACED)
      throw new Error("Only placed orders can be confirmed");
    this.status = OrderStatus.CONFIRMED;
  }

  total(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.lineTotal()),
      Money.zero(Currency.USD)
    );
  }
}
\`\`\`

**Design principles:**
- Push business rules into value objects where possible (Money handles currency math, Quantity enforces non-negative).
- Use factory methods (\`Order.place()\`) instead of constructors to name the business operation and enforce invariants.
- Encapsulate state transitions in entity methods that validate preconditions.`,

    `## Persistence Considerations

Entities and value objects have different persistence strategies:

**Entities:**
- Map to database rows with primary keys.
- ORM frameworks handle identity mapping naturally.
- Use Repository pattern to load and save entity aggregates.

**Value objects:**
- **Embedded** -- stored as columns in the owning entity's table (e.g., Address fields in a Customer row).
- **Serialized** -- stored as JSON in a single column (flexible but loses queryability).
- **Separate table** -- stored in a related table without its own identity semantics (the table has a technical PK but the domain object has no identity).

**ORM pitfalls:**
- Many ORMs require all objects to have an ID, pushing developers to add artificial IDs to value objects. Resist this or use framework-specific value object support (JPA \`@Embeddable\`, TypeORM \`@Column\` with transformers).
- Immutability conflicts with ORMs that rely on setter-based hydration. Use constructor-based instantiation or factory methods.

**Testing value objects:**
\`\`\`typescript
describe("Money", () => {
  it("adds amounts with the same currency", () => {
    const a = Money.of(10, Currency.USD);
    const b = Money.of(20, Currency.USD);
    expect(a.add(b)).toEqual(Money.of(30, Currency.USD));
  });

  it("rejects addition of different currencies", () => {
    const usd = Money.of(10, Currency.USD);
    const eur = Money.of(20, Currency.EUR);
    expect(() => usd.add(eur)).toThrow();
  });
});
\`\`\``,
  ],
  interviewQA: [
    {
      q: "What is the fundamental difference between an entity and a value object?",
      a: "An entity is defined by its unique identity -- two entities with identical attributes are still distinct if their IDs differ. A value object is defined by its attributes -- two value objects with the same values are interchangeable and equal. Entities have lifecycle and mutable state; value objects are immutable and produce new instances for 'changes.' For example, a Customer is an entity (tracked by ID through state changes), while Money is a value object (10 USD equals 10 USD regardless of which instance).",
    },
    {
      q: "Why should you prefer value objects over entities in domain modeling?",
      a: "Value objects are simpler, safer, and more testable. They are immutable, so no mutation side effects or thread-safety issues. They are self-validating, so invalid states cannot exist. They require no identity management. Tests are straightforward: construct, invoke, assert -- no mocking or state setup needed. By pushing business rules into value objects (Money handles currency math, Quantity enforces non-negative), you reduce the complexity and responsibilities of entities.",
    },
    {
      q: "Can the same concept be an entity in one context and a value object in another?",
      a: "Yes, the classification depends on the bounded context. An Address is a value object in e-commerce (just a shipping destination, interchangeable if attributes match). In a real estate application, the same Address is an entity (each property address has a unique identity, history, and lifecycle). The decision depends on whether the concept requires unique identity and lifecycle tracking in that specific context.",
    },
    {
      q: "How do you persist value objects in a relational database?",
      a: "Three main strategies: (1) Embedded -- store value object attributes as columns in the owning entity's table (e.g., address_street, address_city in the customers table). (2) Serialized -- store as JSON in a single column, which is flexible but loses queryability. (3) Separate table with a technical PK but no domain identity. Embedded is preferred for simple value objects. Watch for ORM friction: many ORMs expect all objects to have IDs, so use framework-specific features like JPA @Embeddable.",
    },
  ],
  mcqs: [
    {
      q: "How is equality determined for a value object?",
      options: [
        "By comparing database primary keys",
        "By comparing object references (memory address)",
        "By comparing all attribute values",
        "By comparing creation timestamps",
      ],
      answerIndex: 2,
      explanation:
        "Value objects have no identity. Two value objects are equal if and only if all their attribute values are equal. This is structural equality, not reference equality or identity-based equality.",
    },
    {
      q: "Which of the following is best modeled as a value object?",
      options: [
        "A user account with login credentials",
        "A monetary amount with currency",
        "An order that transitions through fulfillment stages",
        "A product in a catalog with inventory tracking",
      ],
      answerIndex: 1,
      explanation:
        "Money is a classic value object: it has no identity (10 USD is 10 USD), is defined by its attributes (amount + currency), should be immutable, and two instances with the same values are interchangeable.",
    },
    {
      q: "What happens when you need to 'change' a value object?",
      options: [
        "Modify its internal state directly",
        "Update it through a setter method",
        "Create a new instance with the desired values",
        "Delete and recreate it in the database",
      ],
      answerIndex: 2,
      explanation:
        "Value objects are immutable. 'Changing' a value object means creating a new instance with the modified values. For example, money.add(otherMoney) returns a new Money instance rather than modifying the original.",
    },
    {
      q: "Why is modeling everything as an entity with an auto-generated ID considered an anti-pattern?",
      options: [
        "It uses too much database storage space",
        "It adds unnecessary complexity -- identity management, mutation tracking, and equality confusion for concepts that are naturally value objects",
        "It violates the Single Responsibility Principle",
        "Auto-generated IDs are not supported by all databases",
      ],
      answerIndex: 1,
      explanation:
        "Many concepts (Money, Address, DateRange) are naturally value objects with no need for identity. Making them entities adds artificial IDs, mutation complexity, and makes equality semantics confusing, all without providing any benefit.",
    },
  ],
  flashcards: [
    {
      front: "What makes an entity an entity?",
      back: "Identity. An entity is defined by a unique identifier that persists through all state changes. Two entities with identical attributes are distinct if their IDs differ. Entities have lifecycle, mutable state, and identity-based equality.",
    },
    {
      front: "What makes a value object a value object?",
      back: "Its attributes. A value object has no identity, is immutable, and is defined entirely by its attribute values. Two value objects with the same values are equal and interchangeable. It self-validates at construction.",
    },
    {
      front: "Name 5 common value objects",
      back: "Money (amount + currency), Email (validated string), Address (street, city, postal code, country), DateRange (start + end), Coordinates (latitude + longitude). All are defined by their attributes, not by identity.",
    },
    {
      front: "Why are value objects inherently thread-safe?",
      back: "Because they are immutable. Once created, their state cannot change, so concurrent threads can safely read them without locks, synchronization, or defensive copying.",
    },
    {
      front: "Factory method vs. constructor for entities",
      back: "Factory methods (Order.place(), Account.open()) name the business operation that creates the entity and can enforce complex creation invariants. Constructors are generic. Factory methods make the code read like the domain language.",
    },
    {
      front: "How to persist value objects (3 strategies)",
      back: "1. Embedded: store as columns in the owning entity's table. 2. Serialized: store as JSON in a single column. 3. Separate table: with a technical PK but no domain identity. Embedded is preferred for simple cases.",
    },
    {
      front: "Context-dependent classification",
      back: "The same concept can be an entity or value object depending on the bounded context. Address is a value object in e-commerce (a shipping destination) but an entity in real estate (unique property with history). Always ask: does it need identity in THIS context?",
    },
  ],
  glossary: [
    {
      term: "Entity",
      definition:
        "A domain object defined by its unique identity rather than its attributes. Entities have lifecycle, mutable state, and identity-based equality.",
    },
    {
      term: "Value Object",
      definition:
        "An immutable domain object defined entirely by its attribute values, with no conceptual identity. Two value objects with the same attributes are equal and interchangeable.",
    },
    {
      term: "Identity",
      definition:
        "A unique identifier (UUID, natural key, sequence) that distinguishes one entity from another and persists through all state changes.",
    },
    {
      term: "Immutability",
      definition:
        "The property of an object whose state cannot be modified after creation. Changes produce new instances rather than altering the original. A defining characteristic of value objects.",
    },
    {
      term: "Structural Equality",
      definition:
        "Equality determined by comparing all attribute values. Used by value objects. Contrasts with reference equality (same memory address) and identity equality (same ID).",
    },
    {
      term: "Self-Validating Object",
      definition:
        "An object that enforces its invariants at construction time, making it impossible to create an instance in an invalid state. A best practice for value objects.",
    },
    {
      term: "Factory Method",
      definition:
        "A static method that creates an object while naming the business operation (e.g., Order.place()) and enforcing creation invariants. Preferred over constructors for entities with complex creation logic.",
    },
  ],
};
