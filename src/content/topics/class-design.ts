import type { TopicContent } from "../types";

export const classDesign: TopicContent = {
  quickSummary: [
    "Cohesive classes group related data and behavior around a single, well-defined responsibility. A cohesive class is easy to name, test, and reason about because everything in it serves one purpose.",
    "Good API design follows principles of least surprise, consistency, and discoverability. Method names should be verbs describing the action, parameters should be minimal and well-typed, and return types should be predictable.",
    "Immutability means once an object is created, its state cannot change. Immutable objects are inherently thread-safe, easier to reason about, safe as hash map keys, and simplify debugging because their state at creation is their state forever.",
    "Effective class design balances encapsulation (hiding internal details), cohesion (keeping related things together), and coupling (minimizing dependencies between classes).",
  ],
  detailed: [
    "## Designing Cohesive Classes\n\nCohesion measures how strongly related the responsibilities of a class are. High cohesion means every field and method in a class contributes to a single, focused purpose. A `UserAuthenticator` that handles login, password hashing, and token generation is cohesive. A `UserManager` that handles authentication, profile management, email notifications, and report generation is not. To check cohesion, ask: 'If I split this class in two, would either half need the other's fields?' If not, split it. The LCOM (Lack of Cohesion of Methods) metric formalizes this: if methods don't share instance variables, cohesion is low. Strive for classes where most methods use most fields.",
    "## API Design Principles\n\nA well-designed class API makes the right thing easy and the wrong thing hard. **Principle of least surprise**: `list.remove(item)` should remove the item, not return a new list without it (unless the class is documented as immutable). **Consistency**: if `getUser()` returns null on not-found, `getOrder()` should too, not throw an exception. **Fail fast**: validate inputs in constructors and methods early, throwing meaningful exceptions. **Builder pattern for complex construction**: when a constructor would need more than 3-4 parameters, use a builder. **Fluent interfaces** (method chaining) work well for configuration objects but can hurt readability for business logic. Avoid boolean parameters; use enums or separate methods for clarity.",
    "## Immutability in Practice\n\nTo make a class immutable: (1) declare it `final` (or sealed) so it cannot be subclassed, (2) make all fields `private final`, (3) don't provide setters, (4) if the class holds mutable objects (like lists or dates), return defensive copies from getters and copy inputs in the constructor, (5) ensure the class is fully initialized in the constructor. In TypeScript/JavaScript, use `readonly` properties and `Object.freeze()`. Immutable objects shine in concurrent systems: no synchronization needed. They also enable value semantics: two `Money(10, 'USD')` objects with the same fields are interchangeable. The trade-off is performance: every 'change' creates a new object. Structural sharing (as in persistent data structures) mitigates this.",
    "## Encapsulation and Information Hiding\n\nEncapsulation means bundling data with the methods that operate on it and restricting direct access to internal state. This isn't just about making fields private; it's about exposing a meaningful API that hides implementation decisions. A `Stack` exposes `push()`, `pop()`, and `peek()`, not whether it uses an array or linked list internally. Good encapsulation lets you change the internal representation (array to linked list) without affecting clients. Tell, don't ask: instead of `if (account.getBalance() >= amount) account.setBalance(account.getBalance() - amount)`, use `account.withdraw(amount)` which encapsulates the validation and state change.",
    "## Coupling and Dependency Management\n\nCoupling measures how dependent one class is on another's internals. Tight coupling means changes in one class ripple through many others. Reduce coupling by: depending on interfaces rather than concrete classes (Dependency Inversion), using events or callbacks instead of direct method calls for cross-cutting concerns, keeping method parameters general (accept `Iterable<T>` instead of `ArrayList<T>`), and following the Law of Demeter (only talk to your immediate friends, not `a.getB().getC().doSomething()`). The goal is that most classes can be understood, tested, and modified in isolation.",
  ],
  interviewQA: [
    {
      q: "How do you decide what should be a method on a class vs. a separate utility function?",
      a: "A method belongs on a class if it operates primarily on that class's data and represents behavior intrinsic to the concept. `order.calculateTotal()` belongs on Order because it uses Order's items and discounts. A formatting function `formatCurrency(amount)` is a utility because it works on primitive data and isn't specific to any domain class. The 'Feature Envy' code smell helps: if a method in class A uses more data from class B than from A, it probably belongs on B. Utility functions are appropriate for stateless transformations, cross-cutting concerns, and operations on primitives.",
    },
    {
      q: "What are the pros and cons of immutability?",
      a: "Pros: thread safety without locks, simpler debugging (state doesn't change after creation), safe to use as hash map keys and set elements, enables structural sharing for efficient persistent data structures, makes temporal reasoning easy (no need to track when state changed). Cons: every modification creates a new object, which increases GC pressure; deeply nested immutable structures require builders or copy-with-modification patterns that can be verbose; not suitable for large, frequently mutated state like game worlds or pixel buffers. In practice, default to immutable for value objects and domain entities, use mutability for performance-critical hot paths.",
    },
    {
      q: "How would you refactor a class that has too many responsibilities?",
      a: "First, identify the distinct responsibilities by listing what the class does and grouping related methods. Then extract each group into its own class. For example, a `UserService` handling registration, authentication, profile updates, and notification sending can be split into `RegistrationService`, `AuthService`, `ProfileService`, and `NotificationService`. Move the relevant fields and methods to each new class. The original class might become a facade that delegates to the new classes, or it might be removed entirely. Ensure each new class has a clear, single purpose and can be tested independently. Update callers incrementally.",
    },
    {
      q: "What makes a good class constructor?",
      a: "A good constructor fully initializes the object into a valid state. It should validate all inputs and throw exceptions for invalid arguments. It should not perform heavy I/O or computation (use factory methods for that). Keep parameter count low (3-4 max); use the Builder pattern for more. Avoid doing work that creates side effects (like registering the object in a global registry). For optional parameters, use telescoping constructors, builders, or a configuration object. The result of calling `new` should be an object that is immediately usable and internally consistent.",
    },
  ],
  mcqs: [
    {
      q: "Which of the following is NOT a requirement for making a class immutable?",
      options: [
        "Make all fields private and final",
        "Don't provide setter methods",
        "Mark the class as final or sealed",
        "Use only primitive fields",
      ],
      answerIndex: 3,
      explanation:
        "Immutable classes can have non-primitive fields, but they must make defensive copies of mutable objects in the constructor and getters. Using only primitives is not required.",
    },
    {
      q: "The 'Tell, Don't Ask' principle means:",
      options: [
        "Always use command-line interfaces instead of GUIs",
        "Send commands to objects instead of querying state and acting on it externally",
        "Log every method call for debugging",
        "Use assertions instead of return values",
      ],
      answerIndex: 1,
      explanation:
        "Tell, Don't Ask means instead of getting data from an object, making decisions externally, and setting state back, you tell the object what to do and let it manage its own state. This promotes encapsulation.",
    },
    {
      q: "A class where most methods use most instance fields exhibits:",
      options: [
        "High coupling",
        "Low cohesion",
        "High cohesion",
        "Feature envy",
      ],
      answerIndex: 2,
      explanation:
        "When most methods use most fields, the class's responsibilities are tightly related, indicating high cohesion. Low cohesion would be when methods are grouped that don't share data.",
    },
    {
      q: "Which pattern is most appropriate when a class constructor would need 8 parameters?",
      options: [
        "Singleton pattern",
        "Builder pattern",
        "Observer pattern",
        "Strategy pattern",
      ],
      answerIndex: 1,
      explanation:
        "The Builder pattern provides a readable, step-by-step way to construct complex objects with many parameters. It avoids long parameter lists and makes it clear which values are being set.",
    },
  ],
  flashcards: [
    {
      front: "What is cohesion in class design?",
      back: "Cohesion measures how strongly related the responsibilities within a class are. High cohesion means all fields and methods serve a single, focused purpose. Low cohesion means the class handles unrelated responsibilities and should be split.",
    },
    {
      front: "What is the Law of Demeter?",
      back: "Also called 'Don't talk to strangers.' A method should only call methods on: (1) its own object, (2) objects passed as parameters, (3) objects it creates, (4) its direct component objects. Avoid chains like a.getB().getC().doSomething().",
    },
    {
      front: "What is a defensive copy?",
      back: "A copy made to protect an immutable object's state. In the constructor, copy mutable inputs before storing them. In getters, return copies of mutable fields. This prevents external code from modifying the internal state through shared references.",
    },
    {
      front: "What is the 'Feature Envy' code smell?",
      back: "When a method in class A uses more data from class B than from class A itself. The method probably belongs on class B. Example: a method in ReportGenerator that accesses 5 fields from Order but none from ReportGenerator.",
    },
    {
      front: "What is the Builder pattern?",
      back: "A creational pattern for constructing complex objects step by step. Instead of a constructor with many parameters, you use a builder with named methods: new UserBuilder().name('Alice').email('a@b.com').role(ADMIN).build(). The build() method validates and creates the final immutable object.",
    },
    {
      front: "What is structural sharing?",
      back: "A technique used by persistent/immutable data structures where unchanged portions of a data structure are shared between the old and new versions. Only the modified path is copied, making immutable updates O(log n) instead of O(n).",
    },
    {
      front: "What makes a good method name?",
      back: "Use verbs for actions (calculateTotal, sendNotification), 'is/has/can' for boolean queries (isEmpty, hasPermission), 'get/find' for retrievals. Be specific: processPayment() over handle(). Be consistent: if you use 'get' for synchronous and 'fetch' for async, stick with it throughout.",
    },
  ],
  glossary: [
    {
      term: "Cohesion",
      definition:
        "A measure of how closely related and focused the responsibilities of a single class or module are. High cohesion is desirable.",
    },
    {
      term: "Coupling",
      definition:
        "The degree of interdependence between classes or modules. Low (loose) coupling is desirable because it reduces the impact of changes.",
    },
    {
      term: "Immutability",
      definition:
        "A property of objects whose state cannot be modified after creation. Any apparent modification creates a new object instead.",
    },
    {
      term: "Encapsulation",
      definition:
        "Bundling data and the methods that operate on it within a class, and restricting direct access to internal state through access modifiers.",
    },
    {
      term: "Defensive Copy",
      definition:
        "A copy of a mutable object made to prevent external code from modifying an object's internal state. Used in constructors and getters of immutable classes.",
    },
    {
      term: "Fluent Interface",
      definition:
        "An API design where methods return the current object (this), enabling method chaining. Example: builder.setName('x').setAge(5).build().",
    },
    {
      term: "Value Object",
      definition:
        "An object that is defined by its attribute values rather than its identity. Two value objects with the same attributes are considered equal. Typically immutable. Examples: Money, DateRange, Address.",
    },
  ],
  deepDive: [
    `**Cohesion and the Single Responsibility Principle** in C++ are enforced through the language's *compilation model* and *header discipline*. A well-cohesive C++ class has a header that tells a clear story: every public method relates to one responsibility, and the \`#include\` list is minimal. If a class header pulls in \`<thread>\`, \`<fstream>\`, \`<network>\`, and \`<json>\`, it is a red flag -- the class likely handles threading, file I/O, networking, and serialization, violating SRP. The LCOM metric translates directly to C++: if a class has five member variables but each method only touches two, the class should probably be split. C++'s *compilation firewall* idiom (Pimpl -- Pointer to Implementation) helps enforce encapsulation at the ABI level, hiding private members entirely from the header. This reduces recompilation cascades when internal details change, which is a *physical manifestation* of good cohesion.`,

    `**Immutability in C++** is uniquely powerful because the compiler *enforces* it. Declaring data members as \`const\` prevents any modification after construction -- not just by convention but by *language rule*. The \`constexpr\` keyword goes further, enabling objects to be constructed at *compile time*, completely eliminating runtime overhead. For value-semantic classes, the Rule of Zero applies: if all members are value types or smart pointers, the compiler generates correct copy, move, and destruction automatically. When mutation is needed, the **copy-and-modify** pattern returns a new object: \`Money Money::add(const Money& other) const\` returns a fresh \`Money\`. Copy elision (guaranteed RVO in C++17) makes this efficient -- the new object is constructed directly in the caller's storage. For thread safety, \`const\` correctness is essential: a \`const\` method promises not to modify observable state, making it safe to call concurrently without locks.`,

    `**Coupling in C++** has both *logical* and *physical* dimensions. Logical coupling (depending on another class's interface) is managed through **abstract base classes** (interfaces with pure virtual functions) and *dependency injection* via constructor parameters. Physical coupling (header dependencies causing recompilation) is managed through *forward declarations*, the Pimpl idiom, and careful header hygiene. The **Dependency Inversion Principle** in C++ means depending on abstract base classes rather than concrete implementations: \`class OrderService { public: OrderService(std::unique_ptr<IOrderRepository> repo); }\`. This enables testing with mock repositories and swapping implementations without modifying client code. The *Law of Demeter* prevents chain calls like \`order.getCustomer().getAddress().getCity()\` -- instead, provide \`order.shippingCity()\`. In C++, violating Demeter also creates unnecessary header dependencies, as each intermediate type must be visible.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "Immutable value class with const members, factory method, and copy-and-modify pattern",
      source: `#include <string>
#include <stdexcept>
#include <compare>

class Temperature {
public:
    // Factory methods -- named constructors enforce domain language
    static Temperature celsius(double value) {
        return Temperature(value, Scale::CELSIUS);
    }

    static Temperature fahrenheit(double value) {
        return Temperature(value, Scale::FAHRENHEIT);
    }

    // Immutable operations return new instances
    Temperature to_celsius() const {
        if (scale_ == Scale::CELSIUS) return *this;
        return Temperature((value_ - 32.0) * 5.0 / 9.0, Scale::CELSIUS);
    }

    Temperature to_fahrenheit() const {
        if (scale_ == Scale::FAHRENHEIT) return *this;
        return Temperature(value_ * 9.0 / 5.0 + 32.0, Scale::FAHRENHEIT);
    }

    // Value semantics: equality by attributes
    bool operator==(const Temperature& other) const {
        // Compare in same scale for correctness
        return to_celsius().value_ == other.to_celsius().value_;
    }

    auto operator<=>(const Temperature& other) const {
        return to_celsius().value_ <=> other.to_celsius().value_;
    }

    double value() const { return value_; }
    std::string scale_name() const {
        return scale_ == Scale::CELSIUS ? "C" : "F";
    }

private:
    enum class Scale { CELSIUS, FAHRENHEIT };

    Temperature(double value, Scale scale)
        : value_(value), scale_(scale) {}

    double value_;
    Scale scale_;
};`,
    },
    {
      language: "cpp",
      caption: "Builder pattern for complex object construction with validation",
      source: `#include <string>
#include <optional>
#include <stdexcept>
#include <vector>

class HttpRequest {
public:
    // Accessors -- all const, object is immutable after build
    const std::string& method() const { return method_; }
    const std::string& url() const { return url_; }
    const std::vector<std::pair<std::string, std::string>>& headers() const {
        return headers_;
    }
    const std::string& body() const { return body_; }
    int timeout_ms() const { return timeout_ms_; }

    class Builder {
    public:
        Builder& method(std::string m) { method_ = std::move(m); return *this; }
        Builder& url(std::string u) { url_ = std::move(u); return *this; }
        Builder& header(std::string key, std::string value) {
            headers_.emplace_back(std::move(key), std::move(value));
            return *this;
        }
        Builder& body(std::string b) { body_ = std::move(b); return *this; }
        Builder& timeout_ms(int ms) { timeout_ms_ = ms; return *this; }

        HttpRequest build() const {
            // Validate required fields
            if (method_.empty())
                throw std::invalid_argument("HTTP method is required");
            if (url_.empty())
                throw std::invalid_argument("URL is required");
            if (timeout_ms_ <= 0)
                throw std::invalid_argument("Timeout must be positive");

            return HttpRequest(method_, url_, headers_, body_, timeout_ms_);
        }

    private:
        std::string method_;
        std::string url_;
        std::vector<std::pair<std::string, std::string>> headers_;
        std::string body_;
        int timeout_ms_ = 5000;  // sensible default
    };

private:
    HttpRequest(std::string method, std::string url,
                std::vector<std::pair<std::string, std::string>> headers,
                std::string body, int timeout_ms)
        : method_(std::move(method)), url_(std::move(url)),
          headers_(std::move(headers)), body_(std::move(body)),
          timeout_ms_(timeout_ms) {}

    std::string method_;
    std::string url_;
    std::vector<std::pair<std::string, std::string>> headers_;
    std::string body_;
    int timeout_ms_;
};

// Usage:
// auto req = HttpRequest::Builder()
//     .method("POST")
//     .url("https://api.example.com/orders")
//     .header("Content-Type", "application/json")
//     .body(R"({"item": "widget"})")
//     .timeout_ms(3000)
//     .build();`,
    },
    {
      language: "cpp",
      caption: "Pimpl idiom for encapsulation and compilation firewall",
      source: `// ---- database_connection.h ----
// The header exposes NO implementation details
#include <memory>
#include <string>
#include <vector>

class DatabaseConnection {
public:
    // Constructor and destructor declared here, defined in .cpp
    explicit DatabaseConnection(const std::string& connection_string);
    ~DatabaseConnection();

    // Move-only semantics (no copying a connection)
    DatabaseConnection(DatabaseConnection&&) noexcept;
    DatabaseConnection& operator=(DatabaseConnection&&) noexcept;
    DatabaseConnection(const DatabaseConnection&) = delete;
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;

    // Public API -- clean, domain-focused
    void connect();
    void disconnect();
    bool is_connected() const;

    struct Row { std::vector<std::string> columns; };
    std::vector<Row> execute_query(const std::string& sql);

private:
    // The Pimpl -- hides ALL implementation details
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

// ---- database_connection.cpp ----
// #include "database_connection.h"
// #include <pqxx/pqxx>  // PostgreSQL -- only visible here!
//
// struct DatabaseConnection::Impl {
//     std::string connection_string;
//     std::unique_ptr<pqxx::connection> conn;
//     bool connected = false;
// };
//
// DatabaseConnection::DatabaseConnection(const std::string& cs)
//     : impl_(std::make_unique<Impl>()) {
//     impl_->connection_string = cs;
// }
// ... (all methods implemented in .cpp, accessing impl_->)`,
    },
  ],
  diagrams: [
    {
      title: "Well-Designed Class Structure",
      kind: "architecture",
      caption: "Example class hierarchy demonstrating single responsibility, clear interfaces, and cohesive responsibilities.",
      mermaid: `graph TD
    subgraph Domain["Domain Layer"]
        Order["Order\n+ id\n+ items\n+ total()"]
        Customer["Customer\n+ id\n+ name\n+ email"]
        Product["Product\n+ id\n+ price\n+ sku"]
    end
    subgraph Services["Service Layer"]
        OS["OrderService\n+ create()\n+ cancel()"]
        PS["PaymentService\n+ charge()\n+ refund()"]
    end
    subgraph Repos["Repository Layer"]
        OR["OrderRepository\n+ save()\n+ findById()"]
        CR["CustomerRepository\n+ save()\n+ findByEmail()"]
    end
    OS --> Order & Customer
    OS --> PS
    OS --> OR
    OR --> Order
    CR --> Customer
    Order --> Product`,
    },
    {
      title: "Class Design Principles Mindmap",
      kind: "mindmap",
      caption: "Key principles guiding good class design organized around SOLID and cohesion concepts.",
      mermaid: `mindmap
  root((Class Design))
    SOLID
      Single Responsibility
      Open Closed
      Liskov Substitution
      Interface Segregation
      Dependency Inversion
    Cohesion
      High cohesion goal
      Related methods grouped
      Avoid god classes
    Coupling
      Low coupling goal
      Depend on abstractions
      Inject dependencies
    Encapsulation
      Hide internals
      Expose minimal API
      Immutable where possible`,
    },
    {
      title: "Object Lifecycle State",
      kind: "state",
      caption: "State transitions of a domain object from creation through active use to archival or deletion.",
      mermaid: `stateDiagram-v2
    [*] --> Draft
    Draft --> Active : validate and save
    Active --> Modified : field updated
    Modified --> Active : changes saved
    Active --> Suspended : admin action
    Suspended --> Active : reinstated
    Active --> Archived : retention policy
    Archived --> [*]`,
    },
    {
      title: "Dependency Injection Flow",
      kind: "sequence",
      caption: "How a dependency injection container assembles class dependencies at application startup.",
      mermaid: `sequenceDiagram
    participant Main as Application
    participant DI as DI Container
    participant Repo as Repository
    participant Svc as Service
    participant Ctrl as Controller
    Main->>DI: bootstrap()
    DI->>Repo: new Repository(db)
    DI->>Svc: new Service(repo)
    DI->>Ctrl: new Controller(svc)
    DI-->>Main: container ready
    Main->>Ctrl: handle(request)
    Ctrl->>Svc: execute()
    Svc->>Repo: query()
    Repo-->>Svc: result
    Svc-->>Ctrl: response`,
    },
  ],
  comparison: {
    columns: ["Principle", "Good Practice", "Anti-Pattern", "C++ Mechanism"],
    rows: [
      ["**Cohesion**", "Each class has a *single, focused* responsibility", "**God class** with unrelated methods and fields", "Minimal `#include` list, small headers"],
      ["**Coupling**", "Depend on *abstract base classes*, inject dependencies", "Direct instantiation of concrete classes, **chain calls**", "`std::unique_ptr<IInterface>` in constructor"],
      ["**Encapsulation**", "*Tell, don't ask*: `account.withdraw(amount)`", "Expose getters/setters, logic lives outside: `account.setBalance(account.getBalance() - amount)`", "**Pimpl idiom**, `private` members, no public fields"],
      ["**Immutability**", "All fields `const`, return new instances on \"change\"", "Mutable state, setters everywhere, *shared mutable state*", "`const` members, `constexpr`, Rule of Zero"],
      ["**Construction**", "Factory methods or **Builder** for complex objects", "Constructors with 8+ positional parameters", "`static` factory methods, nested `Builder` class"],
      ["**Naming**", "Domain verbs: `approve()`, `fulfill()`, `withdraw()`", "Generic: `process()`, `handle()`, `execute()`, `doWork()`", "Method names match *ubiquitous language*"],
    ],
  },
  exercises: [
    "**Split a god class**: You have a `UserService` class with methods: `registerUser()`, `authenticateUser()`, `updateProfile()`, `sendWelcomeEmail()`, `generateReport()`, and `resetPassword()`. Identify the *distinct responsibilities* and extract them into focused classes. For each new class, write the *header file* with public API only. Justify which methods belong together based on shared data dependencies.",
    "**Implement an immutable class**: Design a `GeoCoordinate` class in C++ with `latitude` and `longitude` (both `const double`). Add methods: `distance_to(const GeoCoordinate&)` using the Haversine formula, and `midpoint(const GeoCoordinate&)` that returns a *new* `GeoCoordinate`. Validate that latitude is in `[-90, 90]` and longitude in `[-180, 180]` at construction. Verify that the class is *trivially copyable* and supports `operator==`.",
    "**Apply the Builder pattern**: Create a `Pizza` class with crust type, size, sauce, cheese, and a list of toppings. The constructor is private; the only way to create a `Pizza` is through a `Pizza::Builder`. The `build()` method validates that crust, size, and sauce are set (required), while cheese and toppings are optional. Write tests that verify: (1) a valid pizza is built, (2) missing required fields throw, (3) the built pizza is **immutable**.",
    "**Pimpl refactoring**: Take a class that directly includes a heavy third-party header (e.g., `<sqlite3.h>` or a JSON library). Refactor it to use the *Pimpl idiom*: forward-declare the `Impl` struct in the header, move all third-party includes to the `.cpp` file. Verify that client code *no longer transitively includes* the third-party header. Measure the change in *compilation time* for files that include your header.",
    "**Dependency inversion exercise**: You have a `ReportGenerator` class that directly constructs a `FileWriter` to write reports. Refactor to: (1) extract an `IWriter` interface with a pure virtual `write(const std::string&)` method, (2) inject `std::unique_ptr<IWriter>` via the constructor, (3) create `FileWriter` and `InMemoryWriter` implementations, (4) write a unit test for `ReportGenerator` using `InMemoryWriter` -- *no file I/O in tests*.",
  ],
  cheatSheet: [
    "**Cohesion check**: If you struggle to name a class in one word or short phrase, it probably has *too many responsibilities*. Split it.",
    "**Immutability recipe**: `const` data members + private constructor + `static` factory methods + copy-and-modify methods that return *by value*. Use `constexpr` where possible.",
    "**Builder pattern**: Use when constructors exceed *3-4 parameters*. Builder methods return `*this` for chaining. `build()` validates all required fields and returns an *immutable* product.",
    "**Pimpl idiom**: Forward-declare `struct Impl;` in header, define in `.cpp`. Use `std::unique_ptr<Impl>`. Declare destructor in header, define in `.cpp` (where `Impl` is complete). Reduces *recompilation* cascades.",
    "**Law of Demeter**: Only talk to *immediate friends*. Replace `a.getB().getC().doX()` with `a.doX()` which internally delegates. Each dot is a *coupling point*.",
    "**Tell, don't ask**: Instead of `if (obj.getState() == X) obj.setState(Y)`, call `obj.transitionToY()`. The object *owns* its state transitions and invariants.",
  ],
  revisionNotes: [
    "**Cohesion** measures how focused a class is. High cohesion = all methods use most fields, *single responsibility*, easy to name. Low cohesion = unrelated methods, the class should be split. In C++, a minimal `#include` list in the header is a *physical indicator* of good cohesion.",
    "**Immutability** in C++ is enforced by the compiler via `const` members. Immutable objects are *thread-safe* without locks, safe as map keys, and enable *copy elision* (RVO). The copy-and-modify pattern returns new instances by value.",
    "**Encapsulation** is more than `private` fields -- it means exposing a *meaningful API* that hides implementation decisions. The Pimpl idiom provides **ABI-level** encapsulation. *Tell, don't ask*: send commands, don't query-then-act.",
    "**Coupling** has *logical* (interface dependency) and *physical* (header dependency) dimensions in C++. Reduce logical coupling with **abstract base classes** and dependency injection. Reduce physical coupling with forward declarations and Pimpl.",
    "**Construction**: Use *factory methods* for named construction (`Temperature::celsius(100.0)`), **Builder** for objects with many optional parameters, and always validate invariants at construction time. A constructed object must be *immediately usable*.",
  ],
};
