import type { TopicContent } from "../types";

export const layeredHexagonal: TopicContent = {
  quickSummary: [
    "Layered architecture organizes code into horizontal layers (presentation, business, data access) with strict dependency rules flowing top-down.",
    "Hexagonal (Ports and Adapters) architecture inverts dependencies so the domain core has zero knowledge of infrastructure, communicating through abstract ports.",
    "Onion architecture builds on hexagonal ideas with concentric rings: domain model at the center, surrounded by domain services, application services, and infrastructure at the outermost ring.",
    "All three patterns aim to isolate business logic from infrastructure concerns, improving testability and enabling technology changes without rewriting core logic.",
  ],
  detailed: [
    `## Layered Architecture

The traditional layered (N-tier) architecture divides an application into horizontal layers, each with a specific responsibility:

**Common layers:**
- **Presentation layer** -- handles UI rendering and user interaction (controllers, views, API endpoints).
- **Business logic layer** -- contains domain rules, validations, and workflows.
- **Data access layer** -- manages persistence (repositories, ORM mappings, SQL queries).
- **Infrastructure layer** -- cross-cutting concerns like logging, caching, and external integrations.

**Dependency rule:** Each layer may only depend on the layer directly below it. The presentation layer calls the business layer, which calls the data access layer.

**Strengths:** Simple mental model, well-understood by most developers, works well for CRUD-heavy applications.

**Weaknesses:** Business logic can leak into upper or lower layers. The strict top-down dependency means the domain layer depends on the data access layer, coupling business rules to persistence technology.`,

    `## Hexagonal Architecture (Ports and Adapters)

Proposed by Alistair Cockburn, hexagonal architecture places the application core at the center, surrounded by ports (interfaces) and adapters (implementations).

**Core concepts:**
- **Application core** -- contains business logic and domain model with zero external dependencies.
- **Ports** -- interfaces defined by the core that describe how it wants to interact with the outside world. Divided into:
  - *Driving ports* (primary) -- how external actors invoke the application (e.g., \`OrderService\` interface).
  - *Driven ports* (secondary) -- how the application reaches external systems (e.g., \`OrderRepository\` interface).
- **Adapters** -- concrete implementations of ports that connect to specific technologies:
  - *Driving adapters* -- REST controllers, CLI handlers, message consumers.
  - *Driven adapters* -- PostgreSQL repository, SMTP email sender, Redis cache client.

**Dependency rule:** All dependencies point inward. Adapters depend on ports; the core depends on nothing external.

**Key benefit:** You can swap any adapter (change database, replace message broker, switch from REST to gRPC) without touching business logic.`,

    `## Onion Architecture

Jeffrey Palermo's onion architecture refines hexagonal ideas into explicit concentric layers:

**Layers (inside to outside):**
1. **Domain Model** -- entities, value objects, domain events. Pure business concepts with no dependencies.
2. **Domain Services** -- operations that do not naturally belong to a single entity (e.g., pricing calculations spanning multiple aggregates).
3. **Application Services** -- orchestrate use cases by coordinating domain objects and infrastructure. Define the application's API.
4. **Infrastructure** -- outermost ring; implements interfaces defined by inner layers (repositories, external service clients, UI frameworks).

**Dependency rule:** Dependencies flow strictly inward. Inner layers define interfaces; outer layers implement them (Dependency Inversion Principle).

**Comparison with hexagonal:**
- Onion makes the layering within the core explicit (domain model vs. domain services vs. application services).
- Hexagonal treats the entire core as one unit and focuses on the port/adapter boundary.
- In practice, the two are nearly interchangeable and often combined.`,

    `## Practical Implementation

**Project structure (TypeScript example):**
\`\`\`
src/
  domain/           # Entities, value objects, domain events
    order.ts
    order-repository.ts  # Port (interface only)
  application/       # Use cases / application services
    create-order.ts
    get-order-query.ts
  infrastructure/    # Adapters
    persistence/
      postgres-order-repository.ts
    messaging/
      kafka-event-publisher.ts
  api/               # Driving adapters
    rest/
      order-controller.ts
    graphql/
      order-resolver.ts
\`\`\`

**Dependency injection** is the mechanism that wires adapters to ports at runtime. Use a DI container (InversifyJS, tsyringe) or manual composition in a bootstrap module.

**Testing benefits:**
- Unit test domain logic with no mocks -- pure functions and objects.
- Test application services with in-memory adapter stubs.
- Integration test adapters against real infrastructure (testcontainers).`,

    `## Choosing the Right Architecture

| Factor | Layered | Hexagonal / Onion |
|--------|---------|-------------------|
| Complexity | Low | Medium |
| Domain richness | Simple CRUD | Complex business rules |
| Testability | Moderate (mocking needed) | High (ports are natural seam) |
| Technology flexibility | Low (coupled to DB layer) | High (swap adapters freely) |
| Team experience | Any level | Requires DDD familiarity |

**Guidelines:**
- Start with a modular monolith using hexagonal architecture if you anticipate extracting microservices later -- the port/adapter boundary becomes the service boundary.
- For simple CRUD applications with minimal business logic, layered architecture is pragmatic and sufficient.
- Avoid "architecture astronaut" syndrome: the goal is to protect business logic from infrastructure churn, not to maximize the number of abstractions.`,
  ],
  interviewQA: [
    {
      q: "What problem does hexagonal architecture solve that layered architecture does not?",
      a: "In layered architecture, the business layer depends on the data access layer, meaning business logic is coupled to persistence technology. Hexagonal architecture inverts this dependency: the domain core defines ports (interfaces) for data access, and infrastructure adapters implement them. This means you can change databases, swap messaging systems, or replace any external dependency without modifying business logic. It also makes the domain testable in isolation without mocking infrastructure.",
    },
    {
      q: "How do ports and adapters work in practice?",
      a: "A port is an interface defined by the application core that describes a capability it needs (driven port) or offers (driving port). For example, an OrderRepository interface is a driven port. An adapter is a concrete implementation: PostgresOrderRepository implements OrderRepository using SQL queries. At runtime, dependency injection wires the adapter to the port. The core only references the interface, never the concrete class, so swapping PostgresOrderRepository for MongoOrderRepository requires zero changes to business logic.",
    },
    {
      q: "When would you choose layered architecture over hexagonal?",
      a: "Layered architecture is appropriate for applications that are primarily CRUD operations with minimal business logic -- admin dashboards, simple content management systems, or internal tools where the domain is straightforward. The overhead of defining ports, adapters, and managing dependency inversion is not justified when the business logic is thin and technology changes are unlikely. Layered architecture is also easier for junior teams to understand and maintain.",
    },
    {
      q: "How does onion architecture differ from hexagonal architecture?",
      a: "Both share the same fundamental principle: dependencies point inward, and the domain core has no knowledge of infrastructure. The key difference is that onion architecture explicitly defines concentric layers within the core -- domain model, domain services, and application services -- each with its own responsibility. Hexagonal architecture treats the core as a single unit and focuses on the boundary between the core and the outside world (ports and adapters). In practice, many teams combine both: hexagonal ports/adapters at the boundary with onion layering inside the core.",
    },
  ],
  followUps: [
    "Which direction do dependencies point in a hexagonal architecture, and why?",
    "What does a port/adapter split let you test that a layered design doesn't?",
    "When is this ceremony rather than value?",
  ],
  mcqs: [
    {
      q: "In hexagonal architecture, what is a 'driven port'?",
      options: [
        "An interface that external actors use to invoke the application",
        "An interface defined by the core for reaching external systems",
        "A concrete implementation of a database adapter",
        "A REST controller that handles incoming HTTP requests",
      ],
      answerIndex: 1,
      explanation:
        "A driven (secondary) port is an interface defined by the application core that describes how it wants to interact with external systems (databases, message brokers, etc.). The infrastructure layer provides concrete adapters that implement these ports.",
    },
    {
      q: "What is the fundamental dependency rule in onion architecture?",
      options: [
        "Outer layers define interfaces, inner layers implement them",
        "All layers can depend on any other layer",
        "Dependencies flow strictly inward; inner layers define interfaces, outer layers implement them",
        "The domain layer depends on the infrastructure layer for data access",
      ],
      answerIndex: 2,
      explanation:
        "Onion architecture enforces that dependencies always point inward. Inner layers (domain model, domain services) define interfaces that outer layers (infrastructure) implement. This ensures the domain core has no knowledge of external technologies.",
    },
    {
      q: "Which mechanism wires adapters to ports at runtime in hexagonal architecture?",
      options: [
        "Static factory methods hardcoded in the domain layer",
        "Dependency injection via a composition root or DI container",
        "Direct instantiation within business logic classes",
        "Compile-time code generation",
      ],
      answerIndex: 1,
      explanation:
        "Dependency injection (via a DI container or manual composition root) is the standard mechanism for connecting concrete adapters to abstract ports at runtime, keeping the domain core free of infrastructure references.",
    },
    {
      q: "Which architecture is best suited for a simple CRUD application with minimal business logic?",
      options: [
        "Hexagonal architecture with full port/adapter abstraction",
        "Onion architecture with explicit domain service layers",
        "Traditional layered (N-tier) architecture",
        "Event-driven architecture with CQRS",
      ],
      answerIndex: 2,
      explanation:
        "For simple CRUD applications, the overhead of hexagonal or onion architecture is not justified. Traditional layered architecture provides a straightforward, well-understood structure that matches the simplicity of the domain.",
    },
  ],
  flashcards: [
    {
      front: "What is the Dependency Inversion Principle?",
      back: "High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions. This is the foundation of hexagonal and onion architectures.",
    },
    {
      front: "Driving adapter vs. Driven adapter",
      back: "A driving (primary) adapter initiates interaction with the application (e.g., REST controller, CLI handler). A driven (secondary) adapter is called by the application core to reach external systems (e.g., database repository, email sender).",
    },
    {
      front: "What is a Composition Root?",
      back: "A single location in the application (typically the entry point) where all dependencies are wired together. Adapters are instantiated and injected into the ports they implement, keeping the rest of the codebase free of concrete infrastructure references.",
    },
    {
      front: "Why is testability better in hexagonal architecture?",
      back: "Because the domain core depends only on abstract ports (interfaces), you can substitute in-memory or stub adapters during testing. Domain logic is tested with no mocks, no database, no network calls -- just pure business rule verification.",
    },
    {
      front: "Onion architecture layers (inside to outside)",
      back: "1. Domain Model (entities, value objects) 2. Domain Services (cross-entity operations) 3. Application Services (use case orchestration) 4. Infrastructure (persistence, messaging, UI frameworks).",
    },
    {
      front: "What is the Anti-Corruption Layer in the context of ports and adapters?",
      back: "An adapter that translates between the external system's model and the domain's model, preventing external concepts from leaking into the core. It acts as a boundary that preserves the integrity of the domain language.",
    },
    {
      front: "Key weakness of traditional layered architecture",
      back: "The business logic layer depends on the data access layer, coupling domain rules to persistence technology. This makes it hard to change databases and forces business logic tests to mock data access components.",
    },
  ],
  deepDive: [
    `## The Dependency Inversion Principle as the Architectural Foundation

The **Dependency Inversion Principle** (DIP) is not merely a coding guideline — it is the *structural spine* of both hexagonal and onion architectures. In a traditional layered design, the \`BusinessLogic\` layer directly instantiates and calls into \`DataAccess\` classes. This creates a **compile-time coupling** that propagates change: swapping PostgreSQL for MongoDB forces edits in the business layer. DIP flips this relationship. The domain core declares *abstract ports* — pure virtual interfaces in C++ terms — and the infrastructure layer provides \`concrete adapters\` that satisfy those contracts. At link time (or via a DI container at runtime), the adapter is injected into the core. The result is that **high-level policy is decoupled from low-level mechanism**, and the build graph points inward rather than downward. This single principle transforms a fragile, technology-bound system into one where you can replace every adapter without recompiling business logic.`,

    `## Ports, Adapters, and the Anti-Corruption Layer

A *port* is an **interface boundary** — a set of operations the domain expects (\`driven port\`) or offers (\`driving port\`). Ports live in the domain's own namespace and speak the domain's own language: \`OrderRepository::save(Order const&)\`, not \`INSERT INTO orders ...\`. An *adapter* translates between that domain language and a specific technology dialect. For example, a \`PostgresOrderRepository\` adapter maps \`Order\` aggregate fields to SQL columns and handles connection pooling. When the external system uses a wildly different model — a legacy SOAP service, a third-party REST API with its own vocabulary — the adapter doubles as an **Anti-Corruption Layer** (ACL). The ACL ensures that foreign concepts like \`legacy_customer_id\` never leak into the domain; instead the adapter maps them to domain-native \`CustomerId\` value objects. This boundary discipline keeps the domain model *pure*, *testable*, and *expressive*, regardless of how many heterogeneous systems surround it.`,

    `## Practical Trade-offs and When to Break the Rules

No architecture survives contact with reality unscathed. Hexagonal architecture adds **indirection overhead**: every database call goes through a port interface, every external service is wrapped in an adapter, and the composition root must wire dozens of dependencies. For a simple *CRUD microservice* with three endpoints and no business logic, this ceremony yields **negative return on investment**. The pragmatic approach is to apply hexagonal architecture **selectively**: isolate the modules with rich business rules behind ports and adapters, and let simple read-through queries bypass the abstraction. Another common pitfall is \`port explosion\` — defining a separate interface for every conceivable external interaction. Instead, group related operations into **cohesive port interfaces** (e.g., a single \`NotificationPort\` covering email, SMS, and push). Finally, beware of *adapter leakage*: if your domain entity has a \`@Column\` ORM annotation, the infrastructure has invaded the core. Keep domain objects as **plain data structures** (PODs in C++, POJOs in Java) with zero framework dependencies.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Driven port (abstract interface) and two adapters demonstrating Dependency Inversion in C++",
      source: `#include <string>
#include <vector>
#include <memory>
#include <optional>

// ── Domain Entity ──────────────────────────────────────
struct Order {
    std::string id;
    std::string customer_name;
    double      total_amount;
};

// ── Driven Port (pure virtual interface in the domain layer) ──
class IOrderRepository {
public:
    virtual ~IOrderRepository() = default;

    virtual void                    save(Order const& order)          = 0;
    virtual std::optional<Order>    find_by_id(std::string const& id) = 0;
    virtual std::vector<Order>      find_all()                        = 0;
};

// ── Adapter 1: In-Memory (for unit tests) ──────────────
class InMemoryOrderRepository final : public IOrderRepository {
    std::vector<Order> store_;
public:
    void save(Order const& order) override {
        store_.push_back(order);
    }
    std::optional<Order> find_by_id(std::string const& id) override {
        for (auto const& o : store_)
            if (o.id == id) return o;
        return std::nullopt;
    }
    std::vector<Order> find_all() override { return store_; }
};

// ── Adapter 2: PostgreSQL (production) ─────────────────
// Uses libpqxx; the domain layer never sees this header.
#include <pqxx/pqxx>

class PostgresOrderRepository final : public IOrderRepository {
    pqxx::connection conn_;
public:
    explicit PostgresOrderRepository(std::string const& connstr)
        : conn_(connstr) {}

    void save(Order const& order) override {
        pqxx::work txn(conn_);
        txn.exec_params(
            "INSERT INTO orders (id, customer_name, total_amount) "
            "VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE "
            "SET customer_name=$2, total_amount=$3",
            order.id, order.customer_name, order.total_amount);
        txn.commit();
    }

    std::optional<Order> find_by_id(std::string const& id) override {
        pqxx::work txn(conn_);
        auto row = txn.exec_params1(
            "SELECT id, customer_name, total_amount FROM orders WHERE id=$1", id);
        return Order{row[0].as<std::string>(),
                     row[1].as<std::string>(),
                     row[2].as<double>()};
    }

    std::vector<Order> find_all() override {
        pqxx::work txn(conn_);
        auto rows = txn.exec("SELECT id, customer_name, total_amount FROM orders");
        std::vector<Order> result;
        for (auto const& r : rows)
            result.push_back({r[0].as<std::string>(),
                              r[1].as<std::string>(),
                              r[2].as<double>()});
        return result;
    }
};`,
    },
    {
      language: "cpp",
      caption: "Application service (use case) injected with a port, plus the Composition Root wiring",
      source: `#include <stdexcept>
#include <memory>
#include <iostream>

// ── Application Service (Use Case) ────────────────────
// Depends ONLY on the IOrderRepository port, never on a concrete adapter.
class CreateOrderUseCase {
    std::unique_ptr<IOrderRepository> repo_;
public:
    explicit CreateOrderUseCase(std::unique_ptr<IOrderRepository> repo)
        : repo_(std::move(repo)) {}

    void execute(std::string const& id,
                 std::string const& customer,
                 double amount) {
        if (amount <= 0.0)
            throw std::invalid_argument("Order amount must be positive");

        Order order{id, customer, amount};
        repo_->save(order);
        std::cout << "Order " << id << " created for " << customer << "\\n";
    }
};

// ── Driving Adapter: CLI Handler ───────────────────────
// Translates user input into a use-case invocation.
void handle_cli_create(CreateOrderUseCase& uc, int argc, char* argv[]) {
    if (argc < 4)
        throw std::runtime_error("Usage: create <id> <customer> <amount>");
    uc.execute(argv[1], argv[2], std::stod(argv[3]));
}

// ── Composition Root ───────────────────────────────────
// The ONLY place where concrete adapters are instantiated.
int main(int argc, char* argv[]) {
    // Swap this line to switch adapters — no other file changes.
    auto repo = std::make_unique<InMemoryOrderRepository>();
    // auto repo = std::make_unique<PostgresOrderRepository>("host=...");

    CreateOrderUseCase useCase(std::move(repo));
    handle_cli_create(useCase, argc, argv);
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Driving port with a REST adapter sketch (showing the inbound side of hexagonal architecture)",
      source: `// ── Driving Port (interface the outside world calls) ──
class IOrderService {
public:
    virtual ~IOrderService() = default;
    virtual void              create(std::string id, std::string customer, double amount) = 0;
    virtual std::optional<Order> get(std::string const& id) = 0;
};

// ── Concrete Application Service implementing the driving port ──
class OrderService final : public IOrderService {
    std::unique_ptr<IOrderRepository> repo_;   // driven port
public:
    explicit OrderService(std::unique_ptr<IOrderRepository> repo)
        : repo_(std::move(repo)) {}

    void create(std::string id, std::string customer, double amount) override {
        if (amount <= 0)
            throw std::invalid_argument("Amount must be positive");
        repo_->save(Order{std::move(id), std::move(customer), amount});
    }

    std::optional<Order> get(std::string const& id) override {
        return repo_->find_by_id(id);
    }
};

// ── Driving Adapter: REST Controller (pseudo-code using httplib) ──
// #include <httplib.h>
//
// void register_routes(httplib::Server& srv, IOrderService& svc) {
//     srv.Post("/orders", [&](auto const& req, auto& res) {
//         auto j = json::parse(req.body);
//         svc.create(j["id"], j["customer"], j["amount"]);
//         res.status = 201;
//     });
//     srv.Get("/orders/:id", [&](auto const& req, auto& res) {
//         auto order = svc.get(req.path_params.at("id"));
//         if (order) res.set_content(to_json(*order), "application/json");
//         else       res.status = 404;
//     });
// }`,
    },
  ],

  diagrams: [
    {
      title: "Hexagonal Architecture (Ports and Adapters)",
      kind: "architecture",
      caption: "The domain core at the center communicates through **driving ports** (inbound) and **driven ports** (outbound). Adapters on the outside translate between the domain language and specific technologies.",
      mermaid: `graph LR
    subgraph Driving Adapters
        REST["REST Controller"]
        CLI["CLI Handler"]
        GQL["GraphQL Resolver"]
    end

    subgraph Domain Core
        DP["Driving Ports<br/>(IOrderService)"]
        BL["Business Logic<br/>& Domain Model"]
        SP["Driven Ports<br/>(IOrderRepository,<br/>INotificationPort)"]
    end

    subgraph Driven Adapters
        PG["PostgreSQL Adapter"]
        MEM["In-Memory Adapter"]
        SMTP["SMTP Email Adapter"]
    end

    REST --> DP
    CLI --> DP
    GQL --> DP
    DP --> BL
    BL --> SP
    SP --> PG
    SP --> MEM
    SP --> SMTP`,
    },
    {
      title: "Onion Architecture Layers",
      kind: "architecture",
      caption: "Concentric rings with dependencies flowing **strictly inward**. Inner layers define interfaces; outer layers implement them.",
      mermaid: `graph TB
    subgraph Infrastructure
        DB["Database Adapters"]
        MQ["Message Queue"]
        UI["REST / gRPC / UI"]
    end

    subgraph Application Services
        UC["Use Cases<br/>(CreateOrder, GetOrder)"]
    end

    subgraph Domain Services
        DS["Pricing Engine<br/>Discount Calculator"]
    end

    subgraph Domain Model
        DM["Entities<br/>Value Objects<br/>Domain Events"]
    end

    Infrastructure --> Application Services
    Application Services --> Domain Services
    Domain Services --> Domain Model`,
    },
    {
      title: "Dependency Flow Comparison",
      kind: "flow",
      caption: "Layered architecture has top-down dependencies (business depends on data access). Hexagonal inverts this so the core depends on nothing external.",
      mermaid: `flowchart LR
    subgraph Layered["Layered (Top-Down)"]
        direction TB
        P1["Presentation"] --> B1["Business Logic"]
        B1 --> D1["Data Access"]
        D1 --> DB1[("Database")]
    end

    subgraph Hexagonal["Hexagonal (Inverted)"]
        direction TB
        A2["REST Adapter"] --> Port2["Port Interface"]
        Port2 --> Core2["Domain Core"]
        Core2 --> Port3["Port Interface"]
        Port3 --> A3["DB Adapter"]
    end`,
    },
  ],

  animations: [
    {
      title: "Inverting the dependency on the database",
      steps: [
        {
          label: "Layered",
          detail: "Domain depends on the repository, which depends on the database driver. The arrow points outward, toward infrastructure.",
        },
        {
          label: "Consequence",
          detail: "You can't test the domain without a database, and swapping stores means changing domain code.",
        },
        {
          label: "Define a port",
          detail: "The domain declares the interface it needs — `OrderRepository` — in its own language.",
        },
        {
          label: "Adapter implements it",
          detail: "A Postgres adapter in the infrastructure layer implements that interface.",
        },
        {
          label: "Arrow inverted",
          detail: "Infrastructure now depends on the domain. The domain depends on nothing outside itself.",
        },
        {
          label: "Payoff",
          detail: "Unit tests use an in-memory adapter; changing the datastore is a new adapter, not a domain change.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Layered (N-Tier)", "Hexagonal (Ports & Adapters)", "Clean Architecture", "Onion Architecture"],
    rows: [
      [
        "**Core principle**",
        "Horizontal separation of concerns with *top-down* dependency flow",
        "Domain core at center; all dependencies point **inward** via *ports and adapters*",
        "Concentric circles with **Dependency Rule**: source code dependencies point inward only",
        "Concentric rings; inner layers define *interfaces*, outer layers provide **implementations**",
      ],
      [
        "**Dependency direction**",
        "Top to bottom: Presentation → Business → Data Access",
        "Outside-in: Adapters → Ports → Core",
        "Outside-in: Frameworks → Interface Adapters → Use Cases → Entities",
        "Outside-in: Infrastructure → App Services → Domain Services → Domain Model",
      ],
      [
        "**Domain isolation**",
        "*Weak* — business layer depends on data access layer",
        "**Strong** — core has zero external dependencies",
        "**Strong** — entities at the center know nothing about outer circles",
        "**Strong** — domain model is the innermost ring with no outward references",
      ],
      [
        "**Testability**",
        "Moderate; requires *mocking* data access and infrastructure",
        "High; swap adapters for **in-memory stubs** at the port boundary",
        "High; use cases testable with *stub gateways*",
        "High; inject **test doubles** for outer-ring interfaces",
      ],
      [
        "**Flexibility to change tech**",
        "Low — changing the DB typically ripples into business logic",
        "**High** — swap any adapter without touching the core",
        "**High** — frameworks are a *detail* in the outermost circle",
        "**High** — infrastructure is the outermost replaceable ring",
      ],
      [
        "**Complexity & learning curve**",
        "*Low* — simple mental model understood by most developers",
        "Medium — requires understanding of **DIP**, ports, adapters, and DI",
        "Medium-High — adds *use case interactors*, *presenters*, and *gateway* abstractions",
        "Medium — explicit layering within the core adds structural clarity",
      ],
      [
        "**Best suited for**",
        "Simple CRUD apps, admin dashboards, internal tools",
        "Systems with **rich domain logic** and multiple integration points",
        "Large-scale apps where *framework independence* is critical",
        "Domain-driven designs needing **explicit layer boundaries** within the core",
      ],
      [
        "**Originated by**",
        "Traditional; no single author",
        "Alistair Cockburn (2005)",
        "Robert C. Martin (2012)",
        "Jeffrey Palermo (2008)",
      ],
    ],
  },

  exercises: [
    "**Port extraction:** Take a C++ class that directly calls `sqlite3_exec()` inside business logic. Refactor it by extracting an `IProductRepository` *port* (pure virtual class) and moving the SQLite code into a `SqliteProductRepository` adapter. Verify that the business logic compiles without including any SQLite headers.",
    "**Adapter swap:** Given the `IOrderRepository` port from the code examples, implement a **JSON file adapter** (`JsonFileOrderRepository`) that persists orders to a `.json` file using `nlohmann/json`. Write a `main()` composition root that lets you switch between the in-memory and JSON adapters via a command-line flag.",
    "**Driving adapter:** Design a `INotificationPort` driven port with `send(userId, message)`. Implement two adapters: `ConsoleNotificationAdapter` (prints to `stdout`) and `SmtpNotificationAdapter` (sends an email). Then create a *driving adapter* — a simple HTTP endpoint using `cpp-httplib` — that accepts a POST request and invokes a `SendNotificationUseCase`.",
    "**Layer violation audit:** Review an existing codebase (or a provided sample) and identify all *dependency rule violations* — places where the domain layer imports infrastructure headers, or where an adapter directly manipulates domain internals. Document each violation and propose a fix using the **ports and adapters** pattern.",
    "**Comparison essay:** Write a 500-word analysis comparing **hexagonal** and **clean** architecture. Address: (a) how each handles the boundary between use cases and external systems, (b) where *presenters* fit in clean architecture but not in hexagonal, and (c) which pattern you would choose for a real-time trading system and *why*.",
  ],

  cheatSheet: [
    "**Dependency Rule:** All source-code dependencies must point *inward*. The domain core **never** imports infrastructure modules — if it does, you have a layer violation.",
    "**Port = Interface, Adapter = Implementation:** A *port* is a `pure virtual class` (C++) or `interface` (Java/TS) defined in the domain layer. An *adapter* is a concrete class in the infrastructure layer that `implements` / `extends` the port.",
    "**Composition Root:** Wire all dependencies in **one place** — typically `main()` or a bootstrap module. This is the only location that knows about concrete adapter types. Everywhere else, depend on abstractions.",
    "**Driving vs. Driven:** *Driving* (primary) adapters **call into** the application (REST controllers, CLI handlers, message consumers). *Driven* (secondary) adapters are **called by** the application through ports (database repos, email senders, external API clients).",
    "**Test seam = Port boundary:** To unit-test business logic, inject an `InMemory` or `Stub` adapter for each driven port. No database, no network, no filesystem — just pure logic verification.",
    "**Anti-Corruption Layer (ACL):** When integrating with a legacy or third-party system whose data model differs from yours, build the adapter as an ACL that *translates* external concepts into domain-native types. Never let foreign field names or structures leak into the domain model.",
  ],

  revisionNotes: [
    "The **fundamental difference** between layered and hexagonal architecture is the *direction of dependency*: layered flows top-down (business depends on data access), while hexagonal inverts dependencies so the domain core depends on **nothing external**. This inversion is achieved through the **Dependency Inversion Principle** — the core defines abstract ports, and infrastructure provides concrete adapters.",
    "**Ports** come in two flavors: *driving ports* (how external actors invoke the app — e.g., `IOrderService`) and *driven ports* (how the app reaches external systems — e.g., `IOrderRepository`). **Adapters** are the concrete implementations: a `RestController` is a driving adapter; a `PostgresRepository` is a driven adapter. The **Composition Root** wires adapters to ports at startup.",
    "**Onion architecture** adds *explicit layering within the core*: Domain Model → Domain Services → Application Services, each with its own responsibility. **Clean architecture** (Robert C. Martin) is conceptually similar but adds *use case interactors*, *presenters*, and *interface adapters* as distinct rings. In practice, hexagonal, onion, and clean architectures are **variations of the same idea** — dependencies point inward, and the domain is technology-agnostic.",
    "**When to use what:** Choose *layered* for simple CRUD with minimal business logic. Choose *hexagonal/onion* when the domain is complex, you need to swap infrastructure freely, or you plan to extract microservices later (the port boundary becomes the service boundary). Avoid over-engineering — if you have 3 endpoints and no business rules, a full ports-and-adapters setup adds cost without benefit.",
    "**Key pitfalls to avoid:** (1) *Port explosion* — too many fine-grained interfaces; group related operations into cohesive ports. (2) *Adapter leakage* — ORM annotations on domain entities let infrastructure invade the core. (3) *Skipping the composition root* — scattering \`new ConcreteAdapter()\` calls throughout the codebase defeats the purpose of dependency inversion.",
  ],

  resources: [
    {
      label: "The Clean Architecture — Robert C. Martin",
      kind: "article",
    },
    {
      label: "Hexagonal Architecture — Alistair Cockburn",
      kind: "article",
    },
  ],
  glossary: [
    {
      term: "Port",
      definition:
        "An interface defined by the application core that describes a contract for interaction. Driving ports define how external actors invoke the application; driven ports define how the application reaches external systems.",
    },
    {
      term: "Adapter",
      definition:
        "A concrete implementation of a port that connects the application core to a specific technology (e.g., a PostgreSQL repository adapter, a REST controller adapter).",
    },
    {
      term: "Composition Root",
      definition:
        "The single point in an application where the dependency graph is assembled, wiring concrete adapters to abstract ports via dependency injection.",
    },
    {
      term: "Dependency Inversion Principle (DIP)",
      definition:
        "A SOLID principle stating that high-level modules should depend on abstractions rather than concrete implementations, enabling loose coupling and easy substitution.",
    },
    {
      term: "Onion Architecture",
      definition:
        "An architectural pattern with concentric layers where dependencies flow inward: domain model at center, surrounded by domain services, application services, and infrastructure at the outermost ring.",
    },
    {
      term: "N-Tier Architecture",
      definition:
        "A traditional architectural pattern that separates an application into horizontal layers (presentation, business, data access), with dependencies flowing top-down from presentation to data.",
    },
    {
      term: "Hexagonal Architecture",
      definition:
        "An architectural pattern (also called Ports and Adapters) that places the domain core at the center with no external dependencies, communicating with the outside world through abstract ports implemented by concrete adapters.",
    },
  ],
};
