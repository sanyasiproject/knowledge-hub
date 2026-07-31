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
  deepDive: [
    `**Entities** in C++ demand careful attention to *identity semantics* and *ownership*. Unlike garbage-collected languages, C++ requires explicit management of entity lifecycles through \`std::unique_ptr\` or \`std::shared_ptr\`. An entity's identity is typically represented by a *strongly-typed ID wrapper* -- a small class or \`enum class\` that prevents accidental mixing of, say, \`CustomerId\` with \`OrderId\`. The **Rule of Five** (or Rule of Zero) applies heavily: entities that own resources must define or delete copy/move constructors and assignment operators. Since two entities with the same attributes but different IDs are *not equal*, the copy constructor is often deleted to prevent accidental duplication, while move semantics are preserved for efficient container usage. The \`operator==\` compares only the identity field, never the mutable state.`,

    `**Value objects** in C++ benefit enormously from the language's value semantics. A well-designed value object is a *regular type*: it supports copy, move, equality comparison, and optionally ordering. Making all data members \`const\` enforces immutability at compile time -- the compiler itself prevents mutation. C++20's \`operator<=>\` (the *spaceship operator*) makes implementing comparison trivial: a single defaulted declaration generates all six relational operators. Value objects are ideal candidates for \`constexpr\` construction, allowing the compiler to evaluate them at *compile time*. When a value object must be "modified," a new instance is returned -- methods like \`Money::add()\` return a fresh \`Money\` by value. Because C++ has *no garbage collector*, returning by value is both idiomatic and efficient thanks to copy elision (RVO/NRVO) guaranteed by the standard.`,

    `The interplay between entities and value objects shapes *aggregate design* in C++. An aggregate root (an entity) owns its value objects by value (embedded in the class) or by \`std::vector\` for collections. Value objects stored inline benefit from *cache locality* -- they sit contiguously in memory alongside the entity, avoiding pointer indirection. For persistence, value objects serialize naturally into JSON or database columns because they carry no identity. Entities, by contrast, map to rows with primary keys and require a **Repository** abstraction. The key design heuristic in C++ is: *if you can store it by value, model it as a value object; if you must store it by pointer with unique ownership, it is likely an entity*. This mirrors the DDD distinction perfectly and leverages C++'s strengths in memory layout and deterministic destruction.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Strongly-typed Entity with identity-based equality and deleted copy",
      source: `#include <string>
#include <utility>
#include <memory>

// Strongly-typed ID prevents mixing different entity IDs
class CustomerId {
public:
    explicit CustomerId(std::string value) : value_(std::move(value)) {}
    bool operator==(const CustomerId& other) const { return value_ == other.value_; }
    const std::string& value() const { return value_; }
private:
    std::string value_;
};

class Customer {
public:
    Customer(CustomerId id, std::string name, std::string email)
        : id_(std::move(id)), name_(std::move(name)), email_(std::move(email)) {}

    // Entities compare by identity only
    bool operator==(const Customer& other) const { return id_ == other.id_; }
    bool operator!=(const Customer& other) const { return !(*this == other); }

    // No copy -- two customers with same data are still distinct
    Customer(const Customer&) = delete;
    Customer& operator=(const Customer&) = delete;

    // Move is fine -- transferring ownership, not duplicating identity
    Customer(Customer&&) noexcept = default;
    Customer& operator=(Customer&&) noexcept = default;

    // Mutation is expected for entities
    void change_email(std::string new_email) { email_ = std::move(new_email); }
    void rename(std::string new_name) { name_ = std::move(new_name); }

    const CustomerId& id() const { return id_; }
    const std::string& name() const { return name_; }

private:
    CustomerId id_;
    std::string name_;
    std::string email_;
};`,
    },
    {
      language: "cpp",
      caption: "Immutable Value Object with compile-time enforcement using const members",
      source: `#include <stdexcept>
#include <string>
#include <compare>

enum class Currency { USD, EUR, GBP, INR };

class Money {
public:
    // Factory method enforces invariants
    static Money of(double amount, Currency currency) {
        if (amount < 0.0)
            throw std::invalid_argument("Amount cannot be negative");
        return Money(amount, currency);
    }

    static Money zero(Currency currency) { return Money(0.0, currency); }

    // Immutable operations return new instances
    Money add(const Money& other) const {
        if (currency_ != other.currency_)
            throw std::logic_error("Cannot add different currencies");
        return Money(amount_ + other.amount_, currency_);
    }

    Money multiply(double factor) const {
        return Money::of(amount_ * factor, currency_);
    }

    // C++20 spaceship operator gives ==, !=, <, >, <=, >= for free
    auto operator<=>(const Money&) const = default;
    bool operator==(const Money&) const = default;

    double amount() const { return amount_; }
    Currency currency() const { return currency_; }

private:
    Money(double amount, Currency currency)
        : amount_(amount), currency_(currency) {}

    double amount_;
    Currency currency_;
};`,
    },
    {
      language: "cpp",
      caption: "Aggregate Root (Entity) composed of Value Objects with domain methods",
      source: `#include <vector>
#include <string>
#include <stdexcept>
#include <numeric>

enum class OrderStatus { PLACED, CONFIRMED, SHIPPED, DELIVERED };

// Value Object -- no identity, defined by attributes
struct OrderLineItem {
    std::string product_name;
    int quantity;
    Money unit_price;

    Money line_total() const {
        return unit_price.multiply(static_cast<double>(quantity));
    }

    bool operator==(const OrderLineItem&) const = default;
};

// Value Object
struct ShippingAddress {
    std::string street;
    std::string city;
    std::string postal_code;
    std::string country;

    bool operator==(const ShippingAddress&) const = default;
};

// Entity -- Aggregate Root with identity and lifecycle
class Order {
public:
    static Order place(std::string id,
                       std::vector<OrderLineItem> items,
                       ShippingAddress address) {
        if (items.empty())
            throw std::invalid_argument("Order must have at least one item");
        return Order(std::move(id), std::move(items),
                     std::move(address), OrderStatus::PLACED);
    }

    void confirm() {
        if (status_ != OrderStatus::PLACED)
            throw std::logic_error("Only placed orders can be confirmed");
        status_ = OrderStatus::CONFIRMED;
    }

    Money total() const {
        return std::accumulate(
            items_.begin(), items_.end(),
            Money::zero(Currency::USD),
            [](const Money& sum, const OrderLineItem& item) {
                return sum.add(item.line_total());
            });
    }

    bool operator==(const Order& other) const { return id_ == other.id_; }

    const std::string& id() const { return id_; }
    OrderStatus status() const { return status_; }

private:
    Order(std::string id, std::vector<OrderLineItem> items,
          ShippingAddress addr, OrderStatus status)
        : id_(std::move(id)), items_(std::move(items)),
          address_(std::move(addr)), status_(status) {}

    std::string id_;
    std::vector<OrderLineItem> items_;
    ShippingAddress address_;
    OrderStatus status_;
};`,
    },
  ],
  diagrams: [
    {
      title: "Entity vs Value Object Decision Flow",
      kind: "flow",
      caption: "Use this flowchart to determine whether a domain concept should be modeled as an **Entity** or a **Value Object**.",
      mermaid: `flowchart TD
    A["New Domain Concept"] --> B{"Does it need a\\nunique identity?"}
    B -- Yes --> C{"Does it have a\\nlifecycle with\\nstate transitions?"}
    B -- No --> D{"Is it defined\\nentirely by its\\nattributes?"}
    C -- Yes --> E["Model as ENTITY"]
    C -- No --> F{"Must two instances\\nwith same attributes\\nbe distinguishable?"}
    F -- Yes --> E
    F -- No --> G["Model as VALUE OBJECT"]
    D -- Yes --> G
    D -- No --> H{"Can it be freely\\nreplaced by another\\nwith same values?"}
    H -- Yes --> G
    H -- No --> E
    style E fill:#2d6a4f,color:#fff,stroke:#1b4332
    style G fill:#1d3557,color:#fff,stroke:#0d1b2a`,
    },
    {
      title: "Entity and Value Object Composition in an Aggregate",
      kind: "architecture",
      caption: "Shows how an **Order** aggregate root (entity) is composed of embedded **value objects** with clear ownership boundaries.",
      mermaid: `classDiagram
    class Order {
        -OrderId id
        -OrderStatus status
        -List~OrderLineItem~ items
        -ShippingAddress address
        +place(id, items, address) Order
        +confirm() void
        +total() Money
        +operator==(Order) bool
    }
    class OrderId {
        -string value
        +operator==(OrderId) bool
    }
    class OrderLineItem {
        -string productName
        -Quantity quantity
        -Money unitPrice
        +lineTotal() Money
        +operator==(OrderLineItem) bool
    }
    class ShippingAddress {
        -string street
        -string city
        -PostalCode postalCode
        -CountryCode country
        +operator==(ShippingAddress) bool
    }
    class Money {
        -double amount
        -Currency currency
        +add(Money) Money
        +multiply(double) Money
        +operator==(Money) bool
    }
    Order *-- OrderId : identity
    Order *-- OrderLineItem : contains
    Order *-- ShippingAddress : embeds
    OrderLineItem *-- Money : uses`,
    },
    {
      title: "Entity Lifecycle State Machine",
      kind: "state",
      caption: "Entities transition through well-defined states; value objects have *no lifecycle* -- they are created and remain unchanged.",
      mermaid: `stateDiagram-v2
    [*] --> Placed : Order.place()
    Placed --> Confirmed : confirm()
    Placed --> Cancelled : cancel()
    Confirmed --> Shipped : ship()
    Confirmed --> Cancelled : cancel()
    Shipped --> Delivered : markDelivered()
    Shipped --> Returned : initiateReturn()
    Delivered --> [*]
    Cancelled --> [*]
    Returned --> Refunded : processRefund()
    Refunded --> [*]`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Entity", "Value Object"],
    rows: [
      ["**Identity**", "Defined by a *unique identifier* (UUID, sequence, natural key)", "**No identity** -- defined entirely by attribute values"],
      ["**Equality**", "`operator==` compares *ID only*", "`operator==` compares *all attributes*"],
      ["**Mutability**", "*Mutable* -- state changes over lifecycle", "*Immutable* -- \"changes\" produce new instances"],
      ["**Copy semantics (C++)**", "Copy *deleted* or explicitly controlled", "Copy *enabled* -- regular type semantics"],
      ["**Lifecycle**", "Created, transitions through states, eventually archived/deleted", "Created once, never modified, *no lifecycle*"],
      ["**Persistence**", "Own table row with **primary key**", "Embedded in entity's row or serialized as JSON"],
      ["**Thread safety**", "Requires *synchronization* for concurrent access", "Inherently **thread-safe** (immutable)"],
      ["**Testing**", "Requires setup of identity and state; may need *mocking*", "Simple: construct, invoke, assert -- *no mocking needed*"],
      ["**C++ memory**", "Typically heap-allocated via `std::unique_ptr`", "Stored *by value* inline for cache locality"],
      ["**Examples**", "`Customer`, `Order`, `Account`, `Product`", "`Money`, `Address`, `DateRange`, `Email`, `Coordinates`"],
    ],
  },
  exercises: [
    "**Refactor primitive obsession**: You have a `User` class with `std::string email`, `std::string phone`, and `double balance`. Extract **three value objects** (`Email`, `PhoneNumber`, `Money`) with *self-validation* in their constructors. Ensure each value object is *immutable*, supports `operator==`, and rejects invalid input (e.g., negative balance, malformed email). Write a test that verifies an invalid email throws an exception at construction time.",
    "**Implement identity-based equality**: Create a `BankAccount` entity with an `AccountId`, `owner_name`, and `balance`. Implement `operator==` to compare *only by identity*. Write a test demonstrating that two `BankAccount` instances with identical `owner_name` and `balance` but different `AccountId` values are **not equal**, and two with different balances but the same `AccountId` **are equal**.",
    "**Value object composition**: Design a `DateRange` value object with `start_date` and `end_date`. Implement methods: `overlaps(const DateRange&)`, `contains(const Date&)`, and `duration_days()`. Enforce the invariant that `start_date <= end_date` at construction. Write a method `merge(const DateRange&)` that returns a new `DateRange` covering both ranges if they overlap, or throws if they do not. Verify immutability by confirming the original objects are unchanged after merge.",
    "**Aggregate design exercise**: Model a `ShoppingCart` (entity) that contains `CartItem` value objects. Each `CartItem` has a `ProductReference`, `Quantity`, and `Money` unit price. Implement `add_item()`, `remove_item()`, and `total()` on the cart. Ensure that adding the same product twice *increases the quantity* rather than creating a duplicate entry. Write tests covering the empty cart, single item, duplicate product, and removal scenarios.",
    "**Context-dependent modeling**: Consider the concept of `Address`. Write *two implementations*: one as a **value object** for an e-commerce shipping context (immutable, equality by all fields), and one as an **entity** for a real estate context (with an `AddressId`, mutable fields for property details, identity-based equality). Write a brief comment in each explaining *why* the modeling choice is appropriate for that context.",
  ],
  cheatSheet: [
    "**Entity** = identity + lifecycle + mutable state. `operator==` compares *ID only*. Delete copy constructor; keep move semantics.",
    "**Value Object** = attributes + immutability + no identity. `operator==` compares *all fields*. Use `= default` for copy, move, and C++20 `operator<=>` for ordering.",
    "**Self-validation**: Value objects validate invariants in the constructor/factory. An invalid value object *cannot exist*. Use `static Money::of()` pattern to enforce preconditions.",
    "**Prefer value objects**: They are simpler, *thread-safe* (immutable), easier to test (no mocking), and benefit from *cache locality* when stored by value in C++.",
    "**Context matters**: The same concept (e.g., `Address`) can be an entity in one bounded context and a value object in another. Always ask: *does it need identity here?*",
    "**Persistence mapping**: Entities -> own table row with PK. Value objects -> embedded columns, JSON column, or separate table *without domain identity*. Resist ORM pressure to add IDs to value objects.",
  ],
  revisionNotes: [
    "An **entity** is defined by its *unique identity*, not its attributes. Two entities with identical fields but different IDs are **distinct**. In C++, delete the copy constructor and compare only by ID in `operator==`.",
    "A **value object** is defined by its *attributes*, has **no identity**, and is **immutable**. Two value objects with the same field values are *interchangeable*. In C++, use `const` members, return by value, and leverage `operator<=>` for comparisons.",
    "**Favor value objects** over entities wherever possible. They are simpler to reason about, inherently *thread-safe*, easier to test (construct-invoke-assert, no mocking), and in C++ they benefit from *cache locality* when stored inline.",
    "**Aggregates** compose an entity (the root) with embedded value objects. The entity *owns* its value objects by value (not pointer). Value objects are created, stored, and destroyed with the aggregate -- they have no independent lifecycle.",
    "**Context-dependent classification**: The same real-world concept may be an entity in one bounded context and a value object in another. `Address` is a value object in e-commerce (a shipping destination) but an entity in real estate (a property with history and identity).",
  ],
};
