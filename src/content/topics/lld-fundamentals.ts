import type { TopicContent } from "../types";

export const lldFundamentals: TopicContent = {
  quickSummary: [
    "Low-Level Design (LLD) bridges high-level architecture and actual code by specifying class structures, relationships, method signatures, and interaction flows. It answers 'how exactly will these components work together at the code level?'",
    "Class diagrams capture the static structure of a system: classes, attributes, methods, and relationships (inheritance, composition, association). Sequence diagrams capture the dynamic behavior: how objects interact over time to fulfill a use case.",
    "SOLID principles in practice guide LLD decisions. Single Responsibility keeps classes focused, Open/Closed enables extension without modification, Liskov Substitution ensures correct polymorphism, Interface Segregation prevents bloated interfaces, and Dependency Inversion decouples high-level logic from low-level details.",
    "Good LLD balances extensibility with simplicity. Over-engineering with unnecessary abstractions is as harmful as under-engineering with tightly coupled code. Design for the requirements you have plus one level of foreseeable change.",
  ],
  detailed: [
    "## Class Diagrams in LLD\n\nA class diagram is the backbone of any LLD. Each class box shows the class name, its attributes (with types and visibility), and its methods. Relationships between classes include: **Association** (a Teacher *teaches* Students), **Aggregation** (a Department *has* Professors, but professors exist independently), **Composition** (a House *contains* Rooms; rooms don't exist without the house), and **Inheritance** (a SavingsAccount *is-a* BankAccount). Multiplicity annotations (1..*, 0..1) specify cardinality. When drawing class diagrams, start from the nouns in your requirements, identify their responsibilities, and connect them through their natural relationships.",
    "## Sequence Diagrams\n\nSequence diagrams show how objects collaborate to achieve a specific use case. The vertical axis represents time (top to bottom), and horizontal lifelines represent objects. Arrows between lifelines are method calls (solid) and returns (dashed). Key elements include: synchronous calls (filled arrowhead), asynchronous calls (open arrowhead), self-calls (arrow looping back), alt/opt/loop frames for conditionals and iterations. For LLD interviews, draw sequence diagrams for critical flows: user login, placing an order, processing a payment. They reveal hidden interactions and help identify missing classes or methods.",
    "## SOLID in Practice\n\n**SRP**: A `UserService` should handle user CRUD, not also send emails. Extract `EmailService`. **OCP**: Use the Strategy pattern so a `PaymentProcessor` can accept new payment methods without modifying existing code. **LSP**: If `Square extends Rectangle`, calling `setWidth()` on a Square must not violate Rectangle's contract. Prefer composition. **ISP**: Don't force a `ReadOnlyRepository` to implement `save()` and `delete()` from a fat `Repository` interface. Split into `Readable` and `Writable`. **DIP**: A `NotificationService` should depend on a `MessageSender` interface, not directly on `SmsSender` or `EmailSender` classes.",
    "## From Requirements to LLD\n\nThe LLD process follows a structured approach: (1) Gather functional requirements and identify use cases, (2) Extract nouns as candidate classes and verbs as candidate methods, (3) Define relationships and multiplicities between classes, (4) Apply SOLID principles and design patterns where they reduce complexity, (5) Draw sequence diagrams for key flows to validate the design, (6) Refine based on non-functional requirements like thread safety or extensibility. Always validate your design against the original requirements to ensure completeness without over-engineering.",
    "## Common LLD Pitfalls\n\nAvoid **God classes** that accumulate too many responsibilities. Avoid **premature abstraction**: don't create interfaces with only one implementation unless you foresee a genuine need. Avoid **circular dependencies** between classes, which signal poor separation of concerns. Avoid **anemic domain models** where classes are just data holders with all logic in service classes. Strive for **rich domain models** where objects encapsulate both data and behavior relevant to their domain concept.",
  ],
  deepDive: [
    `## Design Patterns in Real-World LLD

**Design patterns** are not theoretical constructs to memorize -- they are *battle-tested solutions* to recurring problems. The key is knowing **when** to apply them, not just **how**.

**Creational patterns** in practice:
- **Factory Method**: Use when the *exact class to instantiate* depends on runtime data. A \`NotificationFactory\` creates \`EmailNotification\`, \`SMSNotification\`, or \`PushNotification\` based on user preferences. The calling code works with the \`Notification\` interface, **decoupled** from concrete types.
- **Builder**: Use when constructing objects with *many optional parameters*. A \`QueryBuilder\` lets you chain \`.select("name")\`, \`.where("age > 18")\`, \`.orderBy("name")\` rather than passing a massive constructor argument list. **Prevents telescoping constructors**.
- **Singleton**: Use *sparingly* -- only for objects that must have exactly one instance (connection pools, configuration managers). In modern C++, prefer a \`static\` local variable inside a function for **thread-safe lazy initialization**.

**Structural patterns** in practice:
- **Adapter**: Wrap a *third-party library* to match your interface. If you switch payment providers from Stripe to Razorpay, only the \`PaymentAdapter\` implementation changes -- the rest of the codebase is **untouched**.
- **Decorator**: Layer behavior *dynamically*. A \`LoggingDecorator\` wraps a \`Repository\` to add logging without modifying the repository code. Stack decorators: \`CachingDecorator(LoggingDecorator(DatabaseRepository))\`.
- **Facade**: Provide a *simplified interface* to a complex subsystem. An \`OrderFacade\` orchestrates \`InventoryService\`, \`PaymentService\`, and \`ShippingService\` behind a single \`placeOrder()\` call.

**Behavioral patterns** in practice:
- **Strategy**: Encapsulate *interchangeable algorithms*. A \`SortStrategy\` interface with \`QuickSort\`, \`MergeSort\`, \`TimSort\` implementations lets you swap sorting at runtime. The context class holds a \`SortStrategy*\` pointer.
- **Observer**: Implement *event systems*. When an \`Order\` changes state, notify \`InventoryObserver\`, \`NotificationObserver\`, \`AnalyticsObserver\` without the Order knowing about them.
- **State**: Model objects with *well-defined state transitions*. A \`Document\` moves through \`Draft\`, \`Review\`, \`Published\` states, each with different allowed actions.`,

    `## Designing for Thread Safety in OOP

In multi-threaded applications, **shared mutable state** is the root of concurrency bugs. LLD must address this *explicitly*.

**Key principles:**
- **Immutable objects** are inherently thread-safe. Prefer \`const\` members and return new objects instead of mutating existing ones. In C++, use \`const\` methods and return by value.
- **Minimize shared state**: Each thread should own its data. Use *message passing* (producer-consumer queues) instead of shared memory where possible.
- **Guard mutable shared state**: Use \`std::mutex\` with \`std::lock_guard\` or \`std::unique_lock\` for **RAII-based locking**. Never hold locks longer than necessary.

**Common patterns:**
- **Monitor pattern**: A class encapsulates its own synchronization. All public methods acquire the lock, perform the operation, and release it. The \`std::mutex\` is a *private member* -- callers do not manage locks.
- **Read-Write Lock**: When reads vastly outnumber writes, use \`std::shared_mutex\`. Multiple readers can hold a *shared lock* simultaneously; writers acquire an **exclusive lock**. This improves throughput for *read-heavy workloads*.
- **Double-checked locking** for lazy initialization: Check without lock, acquire lock, check again, then initialize. In C++11+, prefer \`std::call_once\` with \`std::once_flag\` for **correctness and simplicity**.

**Thread-safe collections:**
- Standard containers (\`std::vector\`, \`std::map\`) are **not thread-safe**. Wrap them in a *thread-safe wrapper* with internal locking, or use lock-free data structures (\`std::atomic\`, compare-and-swap).
- The \`std::shared_ptr\` reference count is *atomic*, but the pointed-to object is **not** automatically thread-safe.`,

    `## Complex State Machines in LLD

Many LLD problems involve objects with **well-defined state transitions**: orders, tickets, documents, elevators, traffic lights. Modeling these as *explicit state machines* improves correctness and maintainability.

**State pattern vs. enum + switch:**
- **Enum + switch**: Simple but *fragile*. Adding a new state requires modifying every switch statement. Violates **OCP** (Open/Closed Principle).
- **State pattern**: Each state is a *separate class* implementing a common interface. Transitions return the *next state object*. Adding a new state means adding a new class -- **no existing code changes**. Preferred for *complex state machines* with many transitions.

**Design guidelines:**
- Define all valid states and transitions in a **state transition table** before coding. This serves as documentation and *test specification*.
- Each state class defines what operations are *allowed* and what happens on each event. Invalid operations throw or are silently ignored based on requirements.
- **Entry and exit actions**: Use \`onEnter()\` and \`onExit()\` hooks for side effects (sending notifications, updating timestamps, logging). This keeps transition logic *clean*.
- **Guard conditions**: Sometimes a transition depends on a *condition* beyond the event. E.g., an order can only move from \`Shipped\` to \`Delivered\` if the delivery confirmation is received. Guards are checked *before* the transition executes.

**Hierarchical state machines** (HSMs) handle *nested states*. An \`Active\` state might contain sub-states \`Idle\`, \`Processing\`, \`WaitingForInput\`. Events not handled by the sub-state *bubble up* to the parent state. This reduces duplication when multiple sub-states share common transitions.`,

    `## Domain-Driven Design at the Class Level

**Domain-Driven Design (DDD)** at the LLD level focuses on making your class structure *mirror the business domain*, so domain experts and developers speak the same language.

**Key tactical patterns:**
- **Entity**: An object with a *unique identity* that persists across state changes. A \`User\` with \`userId\` is the same user even if their name changes. Equality is based on **identity**, not attributes.
- **Value Object**: An object defined by its *attributes*, not identity. A \`Money { amount, currency }\` or \`Address { street, city, zip }\`. Two value objects with the same attributes are **equal**. Prefer *immutability*. In C++, override \`operator==\` to compare all fields.
- **Aggregate**: A cluster of entities and value objects with a *single root entity* (the **Aggregate Root**). All external access goes through the root. An \`Order\` aggregate contains \`OrderItems\` and a \`ShippingAddress\`. External code never modifies an \`OrderItem\` directly -- it calls \`order.addItem()\`.
- **Repository**: Abstracts *persistence*. A \`UserRepository\` interface with \`findById()\`, \`save()\`, \`delete()\` methods. Concrete implementations use a database, file system, or in-memory store. The domain layer depends on the **interface**, not the implementation.
- **Domain Service**: Logic that does not naturally belong to any single entity. A \`TransferService.transfer(from, to, amount)\` spans two \`Account\` entities. Keep domain services *stateless*.

**Ubiquitous language**: Use the same terms in code as the business uses. If the business says "policy," the class is \`Policy\`, not \`Rule\` or \`Config\`. If they say "claim," the method is \`submitClaim()\`, not \`createRequest()\`. This **eliminates translation errors** between requirements and implementation.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Strategy pattern -- swappable sorting algorithms",
      source: `#include <iostream>
#include <vector>
#include <memory>
#include <algorithm>

// Strategy interface
class SortStrategy {
public:
    virtual ~SortStrategy() = default;
    virtual void sort(std::vector<int>& data) = 0;
    virtual std::string name() const = 0;
};

// Concrete strategies
class BubbleSort : public SortStrategy {
public:
    void sort(std::vector<int>& data) override {
        for (size_t i = 0; i < data.size(); ++i)
            for (size_t j = 0; j + 1 < data.size() - i; ++j)
                if (data[j] > data[j + 1])
                    std::swap(data[j], data[j + 1]);
    }
    std::string name() const override { return "BubbleSort"; }
};

class QuickSort : public SortStrategy {
    void quicksort(std::vector<int>& d, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = d[hi], i = lo;
        for (int j = lo; j < hi; ++j)
            if (d[j] < pivot) std::swap(d[i++], d[j]);
        std::swap(d[i], d[hi]);
        quicksort(d, lo, i - 1);
        quicksort(d, i + 1, hi);
    }
public:
    void sort(std::vector<int>& data) override {
        if (!data.empty())
            quicksort(data, 0, static_cast<int>(data.size()) - 1);
    }
    std::string name() const override { return "QuickSort"; }
};

// Context class -- uses a strategy without knowing the concrete type
class Sorter {
    std::unique_ptr<SortStrategy> strategy_;
public:
    explicit Sorter(std::unique_ptr<SortStrategy> strategy)
        : strategy_(std::move(strategy)) {}

    // Swap strategy at runtime (OCP in action)
    void setStrategy(std::unique_ptr<SortStrategy> strategy) {
        strategy_ = std::move(strategy);
    }

    void sort(std::vector<int>& data) {
        std::cout << "Sorting with " << strategy_->name() << "\\n";
        strategy_->sort(data);
    }
};

int main() {
    std::vector<int> data = {5, 3, 8, 1, 9, 2};

    Sorter sorter(std::make_unique<BubbleSort>());
    sorter.sort(data); // Uses BubbleSort

    data = {5, 3, 8, 1, 9, 2};
    sorter.setStrategy(std::make_unique<QuickSort>());
    sorter.sort(data); // Uses QuickSort -- no Sorter code changed

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Observer pattern -- decoupled event notification",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <algorithm>

// Observer interface
class OrderObserver {
public:
    virtual ~OrderObserver() = default;
    virtual void onOrderStateChange(
        const std::string& orderId,
        const std::string& oldState,
        const std::string& newState
    ) = 0;
};

// Concrete observers
class InventoryObserver : public OrderObserver {
public:
    void onOrderStateChange(
        const std::string& orderId,
        const std::string& oldState,
        const std::string& newState
    ) override {
        if (newState == "CONFIRMED") {
            std::cout << "[Inventory] Reserve stock for order "
                      << orderId << "\\n";
        } else if (newState == "CANCELLED") {
            std::cout << "[Inventory] Release stock for order "
                      << orderId << "\\n";
        }
    }
};

class NotificationObserver : public OrderObserver {
public:
    void onOrderStateChange(
        const std::string& orderId,
        const std::string& /*oldState*/,
        const std::string& newState
    ) override {
        std::cout << "[Notification] Order " << orderId
                  << " is now " << newState << "\\n";
    }
};

class AnalyticsObserver : public OrderObserver {
public:
    void onOrderStateChange(
        const std::string& orderId,
        const std::string& oldState,
        const std::string& newState
    ) override {
        std::cout << "[Analytics] Transition " << oldState
                  << " -> " << newState
                  << " for order " << orderId << "\\n";
    }
};

// Subject (Observable)
class Order {
    std::string id_;
    std::string state_ = "CREATED";
    std::vector<std::shared_ptr<OrderObserver>> observers_;

public:
    explicit Order(std::string id) : id_(std::move(id)) {}

    void addObserver(std::shared_ptr<OrderObserver> obs) {
        observers_.push_back(std::move(obs));
    }

    void removeObserver(const std::shared_ptr<OrderObserver>& obs) {
        observers_.erase(
            std::remove(observers_.begin(), observers_.end(), obs),
            observers_.end()
        );
    }

    void setState(const std::string& newState) {
        std::string oldState = state_;
        state_ = newState;
        // Notify all observers -- Order does NOT know who they are
        for (auto& obs : observers_) {
            obs->onOrderStateChange(id_, oldState, newState);
        }
    }

    const std::string& state() const { return state_; }
};

int main() {
    Order order("ORD-42");
    order.addObserver(std::make_shared<InventoryObserver>());
    order.addObserver(std::make_shared<NotificationObserver>());
    order.addObserver(std::make_shared<AnalyticsObserver>());

    order.setState("CONFIRMED");
    // All three observers react independently
    order.setState("SHIPPED");
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "SOLID principles -- Dependency Inversion with interfaces",
      source: `#include <iostream>
#include <string>
#include <memory>

// === Dependency Inversion Principle (DIP) ===
// High-level modules depend on abstractions, not concrete classes.

// Abstraction (interface) -- the "contract"
class MessageSender {
public:
    virtual ~MessageSender() = default;
    virtual bool send(
        const std::string& to,
        const std::string& body
    ) = 0;
    virtual std::string channelName() const = 0;
};

// Low-level module: Email implementation
class EmailSender : public MessageSender {
public:
    bool send(const std::string& to, const std::string& body) override {
        std::cout << "[Email] To: " << to
                  << " | Body: " << body << "\\n";
        return true; // simulate success
    }
    std::string channelName() const override { return "Email"; }
};

// Low-level module: SMS implementation
class SmsSender : public MessageSender {
public:
    bool send(const std::string& to, const std::string& body) override {
        std::cout << "[SMS] To: " << to
                  << " | Body: " << body.substr(0, 160) << "\\n";
        return true;
    }
    std::string channelName() const override { return "SMS"; }
};

// High-level module: depends on MessageSender abstraction
// NOT on EmailSender or SmsSender directly.
// Adding a new channel (e.g., PushSender) requires ZERO changes here.
class NotificationService {
    std::unique_ptr<MessageSender> sender_;

public:
    // Inject dependency via constructor (Constructor Injection)
    explicit NotificationService(std::unique_ptr<MessageSender> sender)
        : sender_(std::move(sender)) {}

    void notify(const std::string& user, const std::string& message) {
        std::cout << "Sending via " << sender_->channelName() << "\\n";
        if (!sender_->send(user, message)) {
            std::cerr << "Failed to send notification!\\n";
        }
    }
};

int main() {
    // Wire up with Email
    auto emailService = std::make_unique<NotificationService>(
        std::make_unique<EmailSender>()
    );
    emailService->notify("alice@example.com", "Your order shipped!");

    // Wire up with SMS -- NotificationService code unchanged
    auto smsService = std::make_unique<NotificationService>(
        std::make_unique<SmsSender>()
    );
    smsService->notify("+1234567890", "Your order shipped!");

    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Observer Pattern Class Diagram",
      kind: "architecture",
      caption: "UML class diagram showing the Observer pattern with Subject (Order) and multiple concrete observers.",
      mermaid: `classDiagram
    class OrderObserver {
        <<interface>>
        +onOrderStateChange(orderId, oldState, newState) void
    }

    class InventoryObserver {
        +onOrderStateChange(orderId, oldState, newState) void
    }

    class NotificationObserver {
        +onOrderStateChange(orderId, oldState, newState) void
    }

    class AnalyticsObserver {
        +onOrderStateChange(orderId, oldState, newState) void
    }

    class Order {
        -string id
        -string state
        -vector~OrderObserver~ observers
        +addObserver(OrderObserver) void
        +removeObserver(OrderObserver) void
        +setState(string newState) void
        +state() string
    }

    OrderObserver <|.. InventoryObserver
    OrderObserver <|.. NotificationObserver
    OrderObserver <|.. AnalyticsObserver
    Order o-- OrderObserver : notifies`,
    },
    {
      title: "Order Placement Sequence Diagram",
      kind: "sequence",
      caption: "Sequence diagram showing how objects interact when a customer places an order, demonstrating method calls between classes.",
      mermaid: `sequenceDiagram
    participant C as Customer
    participant OS as OrderService
    participant O as Order
    participant II as InventoryService
    participant PS as PaymentService
    participant NS as NotificationService

    C->>OS: placeOrder(cart, paymentInfo)
    OS->>O: new Order(cart.items)
    OS->>II: reserveStock(order.items)
    alt Stock Available
        II-->>OS: reserved
        OS->>PS: processPayment(paymentInfo, total)
        alt Payment Success
            PS-->>OS: paymentConfirmed
            OS->>O: setState(CONFIRMED)
            O->>NS: onOrderStateChange(CONFIRMED)
            NS-->>C: Order confirmation email
            OS-->>C: Order created successfully
        else Payment Failed
            PS-->>OS: paymentFailed
            OS->>II: releaseStock(order.items)
            OS->>O: setState(CANCELLED)
            OS-->>C: Payment failed error
        end
    else Out of Stock
        II-->>OS: insufficientStock
        OS-->>C: Out of stock error
    end`,
    },
    {
      title: "Order Lifecycle State Diagram",
      kind: "state",
      caption: "State machine showing all valid transitions for an Order entity in an e-commerce system.",
      mermaid: `stateDiagram-v2
    [*] --> Created
    Created --> Confirmed: Payment successful
    Created --> Cancelled: Payment failed / User cancels

    Confirmed --> Processing: Warehouse picks order
    Confirmed --> Cancelled: User cancels (within window)

    Processing --> Shipped: Handed to carrier
    Processing --> Cancelled: Item unavailable

    Shipped --> Delivered: Delivery confirmed
    Shipped --> Returned: Delivery refused

    Delivered --> Returned: Return requested (within policy)
    Delivered --> [*]

    Returned --> Refunded: Return processed
    Refunded --> [*]
    Cancelled --> [*]`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Inheritance", "Composition", "Aggregation"],
    rows: [
      ["**Relationship**", "*is-a* (Dog is an Animal)", "*has-a* with ownership (Car has an Engine)", "*has-a* without ownership (Dept has Professors)"],
      ["**Lifecycle coupling**", "Subclass depends on superclass", "Part destroyed with whole", "Part exists independently"],
      ["**UML notation**", "Hollow triangle arrow", "Filled diamond", "Empty diamond"],
      ["**Flexibility**", "Static, compile-time binding", "Dynamic, can swap at runtime", "Dynamic, loosely coupled"],
      ["**Code reuse**", "Inherits all parent methods", "Delegates to composed object", "References external object"],
      ["**Fragile base class risk**", "**High** -- parent changes break children", "**Low** -- only interface matters", "**Low** -- minimal coupling"],
      ["**Multiple sources**", "Limited (single inheritance in most languages)", "Compose from *many* objects freely", "Reference *many* objects freely"],
      ["**When to use**", "Genuine type hierarchy with shared behavior", "Object *owns* its parts and controls their lifecycle", "Object *uses* another but does not own it"],
    ],
  },
  exercises: [
    "**Design a Notification System**: Create a class diagram with \`NotificationService\`, \`MessageSender\` (interface), \`EmailSender\`, \`SmsSender\`, \`PushSender\`, and \`NotificationTemplate\`. Apply **DIP** so the service depends only on the interface. Draw a *sequence diagram* for sending a notification with fallback (try push, fall back to SMS, then email).",
    "**Model a Vending Machine**: Design classes for \`VendingMachine\`, \`Product\`, \`Inventory\`, \`Coin\`, \`PaymentProcessor\`, and states (\`Idle\`, \`SelectingProduct\`, \`InsertingMoney\`, \`Dispensing\`). Use the **State pattern** for state transitions. Handle edge cases: *insufficient funds*, *out of stock*, and `coin return`.",
    "**Design a Chess Game**: Identify classes: \`Board\`, \`Square\`, \`Piece\` (abstract with \`King\`, \`Queen\`, \`Rook\`, \`Bishop\`, \`Knight\`, \`Pawn\`), \`Player\`, \`Move\`, \`GameController\`. Each piece has a \`getValidMoves(Board&)\` method. Apply **LSP** so any \`Piece*\` can be used polymorphically. Handle *check*, *checkmate*, and *stalemate* detection.",
    "**Refactor a God Class**: You are given a \`UserManager\` class that handles user CRUD, authentication, password hashing, email sending, session management, and logging. Break it down into *focused classes* applying **SRP**. Draw the *before and after* class diagrams. Justify each extraction.",
    "**Apply the Decorator Pattern**: Design a \`DataStream\` interface with \`read()\` and \`write()\` methods. Create concrete implementations \`FileStream\` and \`NetworkStream\`. Then create decorators: \`EncryptionDecorator\`, \`CompressionDecorator\`, \`BufferingDecorator\`. Show how decorators can be *stacked* in any combination without modifying stream classes.",
  ],
  cheatSheet: [
    "**Class identification**: Extract *nouns* from requirements as classes, *verbs* as methods. Filter out attributes disguised as classes.",
    "**SOLID quick check**: S = one reason to change, O = extend without modifying, L = subtypes substitutable, I = specific interfaces, D = depend on abstractions",
    "**Composition over inheritance**: Default to `composition`; use inheritance only for genuine **is-a** with no LSP violations",
    "**UML relationships**: Association (plain line), Aggregation (empty diamond), Composition (filled diamond), Inheritance (hollow triangle), Dependency (dashed arrow)",
    "**State pattern**: Use when an object has *>3 states* with complex transitions. Each state is a class with allowed actions. **Eliminates switch statements**.",
    "**Observer pattern**: Use for *1-to-many* notifications. Subject maintains a list of observers and calls \`notify()\` on state changes. **Decouples** sender from receivers.",
    "**Factory pattern**: Use when the *concrete class* depends on runtime input. Return a \`Base*\` or \`unique_ptr<Base>\`. Isolates creation logic.",
    "**Thread safety basics**: Immutable objects are safe. Guard mutable shared state with \`std::mutex\` + \`std::lock_guard\`. Prefer **RAII locking**.",
  ],
  revisionNotes: [
    "**LLD bridges HLD and code**: It specifies *class structures*, relationships, method signatures, and interaction flows -- answering **how components work together at the code level**.",
    "**Class diagrams** show static structure (classes, attributes, methods, relationships). **Sequence diagrams** show dynamic behavior (object interactions over time for a specific use case).",
    "**SOLID principles** guide every LLD decision: SRP keeps classes *focused*, OCP enables *extension*, LSP ensures correct *polymorphism*, ISP prevents *bloated interfaces*, DIP *decouples* layers.",
    "**Favor composition over inheritance**: Composition provides *runtime flexibility*, avoids the **fragile base class** problem, and supports combining behaviors from multiple sources.",
    "**Design patterns** are tools, not goals: Apply **Strategy** for swappable algorithms, **Observer** for event notifications, **State** for state machines, **Factory** for creation logic, **Decorator** for layered behavior.",
    "**Avoid common pitfalls**: God classes (too many responsibilities), premature abstraction (interfaces with one implementation), anemic domain models (data-only classes), and circular dependencies.",
    "**Validate with sequence diagrams**: After drawing the class diagram, trace 2-3 key flows as sequence diagrams to verify that classes *interact correctly* and no missing classes or methods exist.",
  ],
  interviewQA: [
    {
      q: "How do you decide between inheritance and composition in LLD?",
      a: "Use inheritance when there is a genuine 'is-a' relationship and the subclass truly extends the superclass's behavior without violating the Liskov Substitution Principle. Use composition when you want 'has-a' relationships or need to combine behaviors from multiple sources. Composition is generally preferred because it avoids the fragile base class problem, enables runtime flexibility (you can swap composed objects), and avoids deep inheritance hierarchies. A classic example: instead of FlyingDuck extending Duck, have Duck contain a FlyBehavior interface that can be SwimFly, NoFly, or RocketFly.",
    },
    {
      q: "Walk me through creating a class diagram for an e-commerce order system.",
      a: "Start with core entities from requirements: Customer, Order, OrderItem, Product, Payment, Address. Customer has a 1-to-many relationship with Order. Order contains OrderItems (composition, 1-to-many). Each OrderItem references a Product (association). Order has a shipping Address (aggregation) and a Payment (composition). Order has states: CREATED, PAID, SHIPPED, DELIVERED, CANCELLED, managed via a state field or State pattern. Key methods: Order.addItem(), Order.calculateTotal(), Order.applyDiscount(), Payment.process(). Apply SRP by separating OrderService (business logic), PaymentGateway (payment processing), and NotificationService (emails/SMS).",
    },
    {
      q: "When should you use a sequence diagram vs. a class diagram in an interview?",
      a: "Use class diagrams when the interviewer asks about the structure: 'Design the classes for X.' Use sequence diagrams when they ask about flows: 'How does X happen in your system?' Often you need both. Start with a class diagram to establish the players, then use sequence diagrams to validate that the classes interact correctly for key use cases. In an interview, a sequence diagram is especially powerful for showing you understand the runtime behavior, not just the static structure. Draw them for the 2-3 most important flows.",
    },
    {
      q: "How do you apply the Open/Closed Principle in real code?",
      a: "The key is to identify the axis of change. If your system needs to support multiple notification channels (email, SMS, push), define a Notifier interface with a send() method. Each channel implements it. When a new channel arrives (Slack, WhatsApp), you add a new class implementing Notifier without modifying existing code. Common mechanisms: Strategy pattern (swap algorithms), Template Method (override specific steps), Decorator (layer on behavior), Plugin architecture (load extensions dynamically). The principle doesn't mean never modifying existing code; it means structuring code so that the most likely changes are additions rather than modifications.",
    },
  ],
  mcqs: [
    {
      q: "In a UML class diagram, a filled diamond on the relationship line indicates:",
      options: [
        "Association",
        "Aggregation",
        "Composition",
        "Inheritance",
      ],
      answerIndex: 2,
      explanation:
        "A filled diamond represents composition, meaning the contained object cannot exist independently of the container. An empty diamond represents aggregation, where the contained object can exist independently.",
    },
    {
      q: "Which SOLID principle is violated when a subclass throws an UnsupportedOperationException for a method inherited from its parent?",
      options: [
        "Single Responsibility Principle",
        "Open/Closed Principle",
        "Liskov Substitution Principle",
        "Dependency Inversion Principle",
      ],
      answerIndex: 2,
      explanation:
        "Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without breaking the program. Throwing UnsupportedOperationException means the subclass cannot be used where the parent is expected.",
    },
    {
      q: "In a sequence diagram, a combined fragment labeled 'alt' represents:",
      options: [
        "A loop that repeats",
        "An optional interaction",
        "Alternative flows based on a condition (if/else)",
        "Parallel execution of interactions",
      ],
      answerIndex: 2,
      explanation:
        "The 'alt' fragment represents alternative flows, similar to if/else. 'opt' is for optional (if without else), 'loop' for repetition, and 'par' for parallel execution.",
    },
    {
      q: "Which relationship should you use when a Car has an Engine that is created and destroyed with the Car?",
      options: [
        "Association",
        "Aggregation",
        "Composition",
        "Dependency",
      ],
      answerIndex: 2,
      explanation:
        "Composition indicates a strong ownership where the part (Engine) cannot exist without the whole (Car). When the Car is destroyed, the Engine is destroyed with it. Aggregation would imply the Engine could exist independently.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between association, aggregation, and composition?",
      back: "Association: general relationship (Teacher teaches Student). Aggregation: weak 'has-a' with independent lifecycle (Department has Professors). Composition: strong 'has-a' where part cannot exist without whole (House has Rooms). Composition uses a filled diamond in UML; aggregation uses an empty diamond.",
    },
    {
      front: "What are the five SOLID principles?",
      back: "S: Single Responsibility - one reason to change. O: Open/Closed - open for extension, closed for modification. L: Liskov Substitution - subtypes must be substitutable. I: Interface Segregation - prefer specific interfaces over general ones. D: Dependency Inversion - depend on abstractions, not concretions.",
    },
    {
      front: "What does a sequence diagram lifeline represent?",
      back: "A lifeline is a vertical dashed line representing an object's existence over time. The activation bar (thin rectangle on the lifeline) shows when the object is actively processing. Messages (arrows) between lifelines represent method calls and returns.",
    },
    {
      front: "What is the 'fragile base class' problem?",
      back: "When changes to a base class unintentionally break subclasses because they depend on the base class's implementation details. This is a key reason to prefer composition over inheritance. With composition, changes to a composed object's internals don't affect the composing class as long as the interface is stable.",
    },
    {
      front: "How do you identify classes from requirements?",
      back: "Extract nouns from requirements as candidate classes (User, Order, Payment). Extract verbs as candidate methods (placeOrder, processPayment). Filter out attributes disguised as classes. Group related attributes and behaviors. Validate by checking if each class has a clear, single responsibility.",
    },
    {
      front: "What is an anemic domain model?",
      back: "A design anti-pattern where domain objects are pure data holders (only getters/setters) with all business logic in separate service classes. This violates encapsulation. Rich domain models place behavior alongside the data it operates on, e.g., Order.calculateTotal() instead of OrderService.calculateTotal(order).",
    },
    {
      front: "What are the key combined fragments in sequence diagrams?",
      back: "alt: if/else alternatives. opt: optional (if without else). loop: iteration with a guard condition. par: parallel execution. break: exit the enclosing interaction. ref: reference to another sequence diagram. critical: a critical section that must execute atomically.",
    },
  ],
  glossary: [
    {
      term: "Class Diagram",
      definition:
        "A UML structural diagram showing classes, their attributes, methods, and relationships. It represents the static structure of a system.",
    },
    {
      term: "Sequence Diagram",
      definition:
        "A UML behavioral diagram showing how objects interact over time through message passing to fulfill a specific use case or scenario.",
    },
    {
      term: "Composition",
      definition:
        "A strong form of association where the part object's lifecycle is managed by the whole. The part cannot exist independently. Represented by a filled diamond in UML.",
    },
    {
      term: "Aggregation",
      definition:
        "A weaker form of association where the part can exist independently of the whole. Represented by an empty diamond in UML.",
    },
    {
      term: "SOLID",
      definition:
        "An acronym for five object-oriented design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
    },
    {
      term: "Multiplicity",
      definition:
        "In UML, a notation on associations indicating how many instances of one class relate to instances of another. Examples: 1 (exactly one), 0..1 (zero or one), * (zero or many), 1..* (one or many).",
    },
    {
      term: "Lifeline",
      definition:
        "In a sequence diagram, a vertical dashed line representing the existence of an object over time. Messages are exchanged between lifelines.",
    },
  ],
};
