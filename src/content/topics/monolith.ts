import type { TopicContent } from "../types";

export const monolith: TopicContent = {
  quickSummary: [
    "A monolithic architecture deploys the entire application as a single unit, with all modules sharing the same process, memory space, and database.",
    "A modular monolith enforces strict module boundaries within a single deployable, gaining many benefits of microservices without distributed systems complexity.",
    "Monoliths are often the right choice for small-to-medium teams, new products, and domains where boundaries are not yet well understood.",
    "Migration from monolith to microservices should be incremental, extracting services along well-defined domain boundaries using patterns like Strangler Fig.",
  ],
  detailed: [
    `## What Is a Monolith?

A monolithic application is built and deployed as a single unit. All features — user management, orders, payments, notifications — live in one codebase, one build artifact, and one runtime process.

**Characteristics**:
- Single deployable artifact (WAR, Docker image, binary).
- Shared database — all modules read and write to the same schema.
- In-process communication — function calls, not network calls.
- Single technology stack.

**Advantages**:
- **Simplicity**: one repo, one build, one deployment, one runtime to monitor.
- **Performance**: in-process calls are orders of magnitude faster than network calls.
- **Consistency**: ACID transactions across all data without distributed coordination.
- **Easy debugging**: a single stack trace captures the full request path.
- **Low operational overhead**: no service mesh, no distributed tracing, no inter-service auth.

**Disadvantages**:
- **Scaling granularity**: must scale the entire application even if only one module is the bottleneck.
- **Deployment risk**: a bug in any module requires redeploying everything.
- **Team coupling**: large teams stepping on each other in a shared codebase.
- **Technology lock-in**: the entire application must use the same language and framework.`,

    `## The Modular Monolith

A modular monolith imposes strict boundaries between modules within a single deployable:

- **Explicit module boundaries**: each module has a public API (interface) and private internals. Modules communicate only through defined interfaces, not by reaching into each other's internals.
- **Separate data ownership**: each module owns its database tables. Cross-module data access goes through the module's API, not direct SQL joins.
- **Enforced boundaries**: use package visibility, architecture fitness functions (ArchUnit), or module systems (Java JPMS, .NET projects) to prevent boundary violations.

**Benefits over a traditional monolith**:
- Modules can be independently developed and tested.
- Clear ownership and reduced coupling.
- Easier to extract into microservices later if needed — boundaries are already defined.

**Benefits over microservices**:
- No distributed systems complexity (network failures, eventual consistency, distributed transactions).
- In-process calls instead of network calls.
- Single deployment and operational model.
- Easier to refactor boundaries when domain understanding evolves.

Many experts now recommend starting with a modular monolith and only extracting services when there is a clear, demonstrated need.`,

    `## When a Monolith Fits

A monolith is often the right choice when:

| Situation | Why Monolith |
|-----------|-------------|
| New product / startup | Domain boundaries are unclear; refactoring is easy in a monolith |
| Small team (< 10 engineers) | Distributed systems overhead exceeds the team's capacity |
| Simple domain | The business logic does not warrant independent scaling or deployment |
| Strong consistency needed | ACID transactions are natural; distributed sagas are not |
| Rapid prototyping | Fastest path from idea to working software |
| Performance-critical path | In-process calls avoid network latency |

**Signs you may need to move away from a monolith**:
- Deployment frequency is limited by coordination across teams.
- A single module's resource needs dominate and cannot be scaled independently.
- Teams are blocked by merge conflicts and shared code changes.
- Different modules need different technology stacks.
- The codebase has grown so large that build and test times are impractical.`,

    `## Migration Paths: Monolith to Microservices

Migration should be incremental, not a big-bang rewrite:

**Strangler Fig pattern**:
1. Place a routing layer (API gateway) in front of the monolith.
2. Build the new service alongside the monolith.
3. Route specific requests to the new service while the monolith continues serving everything else.
4. Gradually migrate functionality until the monolith module is empty.
5. Remove the dead code from the monolith.

**Branch by Abstraction**:
1. Create an abstraction (interface) around the module to be extracted.
2. Implement the interface twice: one backed by the monolith, one by the new service.
3. Use a feature flag to switch between implementations.
4. Remove the monolith implementation once the new service is validated.

**Database decomposition**:
- The hardest part of migration. Shared database must be split.
- Start by identifying which tables belong to which service.
- Create views or APIs that provide cross-service data access.
- Use change data capture (CDC) or events for data synchronization.
- Accept eventual consistency between services.

**What to extract first**: choose modules with clear boundaries, independent scaling needs, and minimal cross-module data dependencies. Payment processing and notification services are common first extractions.`,

    `## Anti-Patterns and Pitfalls

**Distributed monolith**: extracting services without proper boundaries creates the worst of both worlds — distributed systems complexity with monolithic coupling. Services that cannot deploy independently or that require lockstep releases are a distributed monolith.

**Premature decomposition**: splitting into microservices before understanding the domain leads to wrong boundaries. Refactoring across service boundaries is orders of magnitude harder than refactoring within a monolith. Build the modular monolith first, discover the natural boundaries, then extract.

**Shared database anti-pattern**: multiple services reading and writing the same database tables. Changes to the schema require coordinating across all services. Each service should own its data.

**Big-bang rewrite**: attempting to rewrite the entire monolith as microservices at once. This carries enormous risk, takes much longer than estimated, and often fails. Use the Strangler Fig pattern for incremental migration.

**Over-engineering**: not every application needs microservices. Many successful, high-traffic systems run as monoliths (Shopify, Stack Overflow, Basecamp). Choose the architecture that fits your team, domain, and scale.`,
  ],
  interviewQA: [
    {
      q: "When would you recommend a monolith over microservices?",
      a: "I would recommend a monolith for new products where domain boundaries are unclear, for small teams under 10 engineers who would be overwhelmed by distributed systems overhead, when strong consistency through ACID transactions is critical, and for rapid prototyping where speed to market matters. A modular monolith specifically gives you clean boundaries that make future extraction possible without paying the distributed systems tax upfront. Many successful large-scale systems (Shopify, Stack Overflow) run as monoliths.",
    },
    {
      q: "What is a modular monolith and how does it differ from a traditional monolith?",
      a: "A modular monolith enforces strict boundaries between modules within a single deployable. Each module has a public API and private internals, owns its database tables, and communicates with other modules only through defined interfaces. Unlike a traditional monolith where any code can access any other code or database table, a modular monolith provides separation of concerns, independent testability, and clear ownership. It avoids the distributed systems complexity of microservices while maintaining most of their organizational benefits. It is also easier to extract services from later because boundaries already exist.",
    },
    {
      q: "Explain the Strangler Fig pattern for migrating from monolith to microservices.",
      a: "Named after a vine that gradually envelops a tree, the Strangler Fig pattern incrementally replaces monolith functionality with new services. Place an API gateway in front of the monolith. Build a new service for one module, routing its requests to the new service while the monolith handles everything else. Once the new service is validated, remove the dead code from the monolith. Repeat for each module. This avoids big-bang rewrite risk, allows rollback at each step, and keeps the system functional throughout the migration.",
    },
    {
      q: "What is a distributed monolith and how do you avoid it?",
      a: "A distributed monolith has the worst of both worlds: services are deployed separately but are tightly coupled, requiring lockstep releases and coordinated deployments. It happens when services share databases, have synchronous chains of dependencies, or when boundaries were drawn along technical layers (frontend service, backend service, database service) rather than business domains. Avoid it by ensuring each service owns its data, can deploy independently, and communicates through well-defined async interfaces. Test by asking: can this service be deployed without coordinating with other teams?",
    },
  ],
  mcqs: [
    {
      q: "What is the primary advantage of a modular monolith over microservices?",
      options: [
        "Better scalability",
        "Avoids distributed systems complexity while maintaining module boundaries",
        "Supports multiple programming languages",
        "Enables independent deployment of modules",
      ],
      answerIndex: 1,
      explanation:
        "A modular monolith provides clean separation between modules (like microservices) but avoids network calls, distributed transactions, eventual consistency, and operational overhead of running multiple services.",
    },
    {
      q: "Which migration pattern places a routing layer in front of the monolith to incrementally redirect traffic?",
      options: [
        "Branch by Abstraction",
        "Big-bang rewrite",
        "Strangler Fig",
        "Database decomposition",
      ],
      answerIndex: 2,
      explanation:
        "The Strangler Fig pattern uses a routing layer (API gateway) to gradually redirect requests from the monolith to new services, one module at a time, until the monolith functionality is fully replaced.",
    },
    {
      q: "What is a distributed monolith?",
      options: [
        "A monolith deployed across multiple data centers",
        "Services that are deployed separately but are tightly coupled and require lockstep releases",
        "A monolith with a microservices-style API",
        "A database shared across multiple monoliths",
      ],
      answerIndex: 1,
      explanation:
        "A distributed monolith has the operational overhead of microservices but the coupling of a monolith. Services cannot be deployed independently and require coordinated releases.",
    },
    {
      q: "What is typically the hardest part of migrating from a monolith to microservices?",
      options: [
        "Rewriting business logic",
        "Setting up CI/CD pipelines",
        "Decomposing the shared database",
        "Choosing a service mesh",
      ],
      answerIndex: 2,
      explanation:
        "Database decomposition is the hardest migration challenge because data relationships, joins, and transactions that were simple within a shared database must be replaced with cross-service APIs, events, and eventual consistency.",
    },
  ],
  flashcards: [
    {
      front: "What is a monolithic architecture?",
      back: "An application built and deployed as a single unit, with all modules sharing the same process, memory, database, and deployment artifact.",
    },
    {
      front: "What is a modular monolith?",
      back: "A monolith with strictly enforced module boundaries: each module has a public API, owns its tables, and communicates only through defined interfaces. Single deployable, but well-structured internally.",
    },
    {
      front: "What is the Strangler Fig pattern?",
      back: "An incremental migration strategy: place an API gateway in front of the monolith, build new services alongside it, gradually redirect traffic, and remove dead monolith code.",
    },
    {
      front: "What is a distributed monolith?",
      back: "Services that are deployed separately but tightly coupled, requiring lockstep releases. The worst of both worlds: distributed complexity with monolithic coupling.",
    },
    {
      front: "When should you NOT migrate from a monolith to microservices?",
      back: "When the team is small, domain boundaries are unclear, the system fits on one machine, ACID transactions are needed, or there is no organizational pressure for independent deployments.",
    },
    {
      front: "What is Branch by Abstraction?",
      back: "A migration technique: create an interface around a module, implement it twice (monolith-backed and service-backed), toggle with a feature flag, then remove the monolith implementation.",
    },
    {
      front: "What should you extract first when migrating?",
      back: "Modules with clear boundaries, independent scaling needs, and minimal cross-module data dependencies. Payment processing and notifications are common first extractions.",
    },
  ],
  deepDive: [
    `## The Monolith Runtime Model: Why In-Process Communication Matters

A monolithic application runs as a **single OS process** (or a small cluster of identical processes behind a load balancer). All modules share the same virtual address space, heap, and thread pool. Function calls between modules cost nanoseconds with no serialization, no network hops, and no failure modes beyond exceptions. Compare this to a microservice call: DNS resolution, TCP connection, TLS handshake, serialization (JSON/protobuf), deserialization, network round-trip (~1ms LAN, 10-100ms WAN), and the possibility of timeouts, retries, and partial failures. The performance difference is **5-6 orders of magnitude** for a single call.

This runtime model also enables **ACID transactions** across all data. A single database connection can atomically update user records, order records, and inventory records in one transaction. In a microservices architecture, the same operation requires a distributed saga or two-phase commit — adding complexity, latency, and failure modes. For domains with strong consistency requirements (financial systems, inventory management, booking systems), the monolith's transactional model is a significant advantage.

The shared-process model has a downside: a memory leak or CPU-bound loop in any module affects the entire application. Resource isolation between modules does not exist at the runtime level — it can only be enforced through code discipline, module boundaries, and monitoring. This is the fundamental trade-off: simplicity and performance versus isolation.`,

    `## Modular Monolith Architecture Patterns in Depth

Building a modular monolith requires deliberate architectural discipline — without enforcement, a monolith naturally devolves into a "big ball of mud" where any code can reach into any other module. Key enforcement mechanisms include:

**Package/namespace isolation**: each module lives in its own top-level package. Only the module's public API types are exported; implementation classes are package-private. In C++, this maps to separate library targets with explicit dependency declarations in the build system (CMake, Bazel) and careful use of header visibility.

**Interface-based communication**: modules communicate only through defined interfaces (abstract base classes in C++). A module never directly instantiates another module's concrete classes — it uses dependency injection or a service locator. This allows modules to be tested in isolation with mock implementations.

**Data ownership**: each module owns its database tables. No module writes SQL that joins tables from another module. Cross-module data access goes through the owning module's API. In practice, this means each module might have its own schema namespace, and foreign keys across module boundaries are replaced with API calls that return IDs.

**Architecture fitness functions**: automated tests that verify architectural rules. Tools like ArchUnit (Java), dependency-cruiser (JS), or custom build-system checks enforce that module boundaries are not violated. Run these in CI to prevent regressions.`,

    `## The Distributed Monolith Anti-Pattern: A Deep Dive

The distributed monolith is arguably **worse than either a pure monolith or well-designed microservices**. It happens when teams split a monolith into services without properly decomposing data ownership, API contracts, and deployment dependencies. Common symptoms:

**Shared database**: multiple services read and write the same tables. Any schema change requires coordinating across all services. Effectively, the database IS the monolith — you have just added network hops and partial failure modes on top. The fix: each service owns its data and exposes it through APIs; use change data capture (CDC) or domain events for cross-service data needs.

**Synchronous call chains**: Service A calls Service B which calls Service C which calls Service D. If any service in the chain is down or slow, the entire request fails. Worse, cascading timeouts amplify latency. The fix: use asynchronous messaging (event bus, message queue) for non-time-critical communication; apply circuit breakers and bulkheads for synchronous calls.

**Lockstep deployments**: if deploying Service A requires simultaneously deploying Service B (because of breaking API changes), they are not independent services. The fix: use versioned APIs, backward-compatible changes, and consumer-driven contract testing (Pact) to enable independent deployment.

**Shared libraries with business logic**: a common "shared" library containing domain logic creates hidden coupling. Changes to the shared library force all consuming services to update. The fix: shared libraries should contain only true cross-cutting concerns (logging, serialization, auth) — never business logic.`,

    `## Real-World Monolith Success Stories and Lessons

Several high-profile, high-scale systems run successfully as monoliths, disproving the notion that microservices are required for scale:

**Shopify** processes billions of dollars in GMV on a modular Rails monolith. They use a tool called Packwerk to enforce module boundaries and have developed sophisticated deployment practices (pods, sharding) to scale the monolith horizontally.

**Stack Overflow** serves millions of requests per day from a monolithic .NET application running on just a handful of servers. Their architecture demonstrates that a well-optimized monolith on bare metal can outperform a sprawling microservices deployment on cloud infrastructure, at a fraction of the cost.

**Basecamp/HEY** deliberately chose a monolith for their email service (HEY), citing reduced operational complexity and faster development velocity as key advantages over microservices.

The common thread: these teams chose the architecture that fit their **organizational size, domain, and operational capabilities** rather than following industry trends. They invested in code quality, module boundaries, and deployment tooling within the monolith rather than assuming that service boundaries would enforce quality automatically.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Modular monolith structure with enforced module boundaries in C++",
      source: `// === Module boundary enforcement via interfaces ===

// modules/orders/public/order_service.h
// This is the PUBLIC API of the Orders module
#pragma once
#include <string>
#include <optional>
#include <vector>

struct OrderSummary {
    std::string order_id;
    std::string customer_id;
    double total_amount;
    std::string status;  // "pending", "confirmed", "shipped"
};

// Abstract interface - other modules depend on THIS, not the implementation
class IOrderService {
public:
    virtual ~IOrderService() = default;
    virtual std::optional<OrderSummary> get_order(const std::string& id) = 0;
    virtual std::string create_order(const std::string& customer_id,
                                     const std::vector<std::string>& item_ids) = 0;
    virtual bool cancel_order(const std::string& id) = 0;
};

// modules/orders/internal/order_service_impl.h
// PRIVATE - only the Orders module's own code includes this
#pragma once
#include "order_service.h"
#include "order_repository.h"  // internal DB access

class OrderServiceImpl : public IOrderService {
    OrderRepository& repo_;
public:
    explicit OrderServiceImpl(OrderRepository& repo) : repo_(repo) {}
    std::optional<OrderSummary> get_order(const std::string& id) override;
    std::string create_order(const std::string& customer_id,
                             const std::vector<std::string>& item_ids) override;
    bool cancel_order(const std::string& id) override;
};

// modules/payments/internal/payment_processor.cpp
// The Payments module uses Orders via the public interface ONLY
#include "modules/orders/public/order_service.h"  // OK: public API
// #include "modules/orders/internal/order_repository.h"  // FORBIDDEN

class PaymentProcessor {
    IOrderService& orders_;  // Injected dependency
public:
    explicit PaymentProcessor(IOrderService& orders) : orders_(orders) {}

    bool process_payment(const std::string& order_id) {
        auto order = orders_.get_order(order_id);
        if (!order || order->status != "pending") return false;
        // ... process payment using order->total_amount
        return true;
    }
};`,
    },
    {
      language: "cpp",
      caption: "In-process event bus for module communication in a monolith",
      source: `#include <iostream>
#include <functional>
#include <unordered_map>
#include <vector>
#include <string>
#include <any>
#include <typeindex>

// Domain events - shared vocabulary between modules
struct OrderCreatedEvent {
    std::string order_id;
    std::string customer_id;
    double amount;
};

struct PaymentCompletedEvent {
    std::string order_id;
    std::string payment_id;
};

// In-process event bus (replaces message queues in microservices)
class EventBus {
    using Handler = std::function<void(const std::any&)>;
    std::unordered_map<std::type_index, std::vector<Handler>> handlers_;

public:
    template<typename Event>
    void subscribe(std::function<void(const Event&)> handler) {
        handlers_[std::type_index(typeid(Event))].push_back(
            [handler](const std::any& event) {
                handler(std::any_cast<const Event&>(event));
            }
        );
    }

    template<typename Event>
    void publish(const Event& event) {
        auto it = handlers_.find(std::type_index(typeid(Event)));
        if (it != handlers_.end()) {
            for (auto& handler : it->second) {
                handler(event);  // Synchronous, in-process (ns, not ms)
            }
        }
    }
};

int main() {
    EventBus bus;

    // Notification module subscribes to order events
    bus.subscribe<OrderCreatedEvent>([](const OrderCreatedEvent& e) {
        std::cout << "Notification: Order " << e.order_id
                  << " created for customer " << e.customer_id << "\\n";
    });

    // Analytics module subscribes to payment events
    bus.subscribe<PaymentCompletedEvent>([](const PaymentCompletedEvent& e) {
        std::cout << "Analytics: Payment " << e.payment_id
                  << " completed for order " << e.order_id << "\\n";
    });

    // Orders module publishes events
    bus.publish(OrderCreatedEvent{"ORD-001", "CUST-42", 99.99});
    bus.publish(PaymentCompletedEvent{"ORD-001", "PAY-789"});

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Strangler Fig pattern: routing layer for incremental migration",
      source: `#include <iostream>
#include <string>
#include <unordered_map>
#include <functional>
#include <memory>

// Simulates the routing layer (API gateway) in the Strangler Fig pattern
struct Request {
    std::string path;
    std::string method;
    std::string body;
};

struct Response {
    int status;
    std::string body;
};

// The old monolith handler
Response monolith_handler(const Request& req) {
    return {200, "Response from MONOLITH: " + req.path};
}

// New microservice handler (e.g., extracted payment service)
Response payment_service_handler(const Request& req) {
    return {200, "Response from NEW PAYMENT SERVICE: " + req.path};
}

class StranglerRouter {
    using Handler = std::function<Response(const Request&)>;

    // Routes migrated to new services
    std::unordered_map<std::string, Handler> migrated_routes_;
    Handler monolith_fallback_;

public:
    explicit StranglerRouter(Handler monolith)
        : monolith_fallback_(std::move(monolith)) {}

    // Migrate a route prefix from monolith to new service
    void migrate_route(const std::string& prefix, Handler new_service) {
        migrated_routes_[prefix] = std::move(new_service);
        std::cout << "[Router] Migrated " << prefix
                  << " to new service\\n";
    }

    Response route(const Request& req) {
        // Check if any migrated prefix matches
        for (const auto& [prefix, handler] : migrated_routes_) {
            if (req.path.find(prefix) == 0) {
                return handler(req);  // Route to new service
            }
        }
        return monolith_fallback_(req);  // Fallback to monolith
    }
};

int main() {
    StranglerRouter router(monolith_handler);

    // Phase 1: Everything goes to monolith
    auto r1 = router.route({"/api/orders", "GET", ""});
    auto r2 = router.route({"/api/payments/charge", "POST", "{}"});
    std::cout << r1.body << "\\n" << r2.body << "\\n\\n";

    // Phase 2: Migrate payments to new service
    router.migrate_route("/api/payments", payment_service_handler);

    auto r3 = router.route({"/api/orders", "GET", ""});       // still monolith
    auto r4 = router.route({"/api/payments/charge", "POST", "{}"}); // new service
    std::cout << r3.body << "\\n" << r4.body << "\\n";

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Feature flag for Branch by Abstraction migration",
      source: `#include <iostream>
#include <string>
#include <memory>
#include <unordered_map>

// Feature flag system for gradual migration
class FeatureFlags {
    std::unordered_map<std::string, bool> flags_;
public:
    void set(const std::string& flag, bool enabled) {
        flags_[flag] = enabled;
    }
    bool is_enabled(const std::string& flag) const {
        auto it = flags_.find(flag);
        return it != flags_.end() && it->second;
    }
};

// Abstraction layer (interface both implementations share)
class INotificationSender {
public:
    virtual ~INotificationSender() = default;
    virtual bool send(const std::string& user_id,
                      const std::string& message) = 0;
};

// Old monolith implementation (in-process, uses shared DB)
class MonolithNotificationSender : public INotificationSender {
public:
    bool send(const std::string& user_id,
              const std::string& message) override {
        std::cout << "[MONOLITH] Sending to " << user_id
                  << ": " << message << "\\n";
        // Direct DB insert into notifications table
        return true;
    }
};

// New microservice implementation (HTTP call to extracted service)
class ServiceNotificationSender : public INotificationSender {
public:
    bool send(const std::string& user_id,
              const std::string& message) override {
        std::cout << "[NEW SERVICE] Sending to " << user_id
                  << ": " << message << "\\n";
        // HTTP POST to notification-service.internal/api/send
        return true;
    }
};

// Branch by Abstraction: toggle between implementations
class NotificationRouter : public INotificationSender {
    std::unique_ptr<INotificationSender> monolith_;
    std::unique_ptr<INotificationSender> service_;
    const FeatureFlags& flags_;

public:
    NotificationRouter(std::unique_ptr<INotificationSender> monolith,
                       std::unique_ptr<INotificationSender> service,
                       const FeatureFlags& flags)
        : monolith_(std::move(monolith))
        , service_(std::move(service))
        , flags_(flags) {}

    bool send(const std::string& user_id,
              const std::string& message) override {
        if (flags_.is_enabled("use_notification_service")) {
            return service_->send(user_id, message);
        }
        return monolith_->send(user_id, message);
    }
};

int main() {
    FeatureFlags flags;
    flags.set("use_notification_service", false); // Start with monolith

    NotificationRouter router(
        std::make_unique<MonolithNotificationSender>(),
        std::make_unique<ServiceNotificationSender>(),
        flags
    );

    router.send("user-1", "Your order shipped!");  // Uses monolith

    // Flip the flag (in production: gradual rollout by %)
    flags.set("use_notification_service", true);
    router.send("user-2", "Your order shipped!");  // Uses new service

    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Monolith vs Modular Monolith vs Microservices",
      kind: "architecture",
      caption: "Comparison of the three architectural approaches showing module boundaries and communication",
      mermaid: `graph TD
    subgraph Traditional["Traditional Monolith"]
      A1[Orders] --- A2[Payments]
      A2 --- A3[Users]
      A1 --- A3
      A4[(Shared DB)]
      A1 --> A4
      A2 --> A4
      A3 --> A4
    end

    subgraph Modular["Modular Monolith"]
      B1["Orders\n(private data)"] -->|"API call\n(in-process)"| B2["Payments\n(private data)"]
      B2 -->|"API call"| B3["Users\n(private data)"]
      B4[("Orders\nschema")]
      B5[("Payments\nschema")]
      B6[("Users\nschema")]
      B1 --> B4
      B2 --> B5
      B3 --> B6
    end

    subgraph Micro["Microservices"]
      C1["Orders\nService"] -->|"HTTP/gRPC\n(network)"| C2["Payments\nService"]
      C2 -->|"HTTP/gRPC"| C3["Users\nService"]
      C4[("Orders\nDB")]
      C5[("Payments\nDB")]
      C6[("Users\nDB")]
      C1 --> C4
      C2 --> C5
      C3 --> C6
    end`,
    },
    {
      title: "Strangler Fig Migration Pattern",
      kind: "flow",
      caption: "Incremental migration from monolith to microservices via an API gateway",
      mermaid: `flowchart TD
    CLIENT[Client] --> GW[API Gateway / Router]

    subgraph Phase1["Phase 1: All traffic to monolith"]
      GW -->|"/api/*"| MONO1["Monolith\n(Orders + Payments + Users)"]
    end

    subgraph Phase2["Phase 2: Extract Payments"]
      GW2[API Gateway] -->|"/api/payments/*"| PS["New Payment\nService"]
      GW2 -->|"/api/orders/*\n/api/users/*"| MONO2["Monolith\n(Orders + Users)"]
    end

    subgraph Phase3["Phase 3: Extract Orders"]
      GW3[API Gateway] -->|"/api/payments/*"| PS2["Payment\nService"]
      GW3 -->|"/api/orders/*"| OS["New Order\nService"]
      GW3 -->|"/api/users/*"| MONO3["Monolith\n(Users only)"]
    end

    Phase1 -.->|"Migrate"| Phase2
    Phase2 -.->|"Migrate"| Phase3`,
    },
    {
      title: "Distributed Monolith Anti-Pattern",
      kind: "architecture",
      caption: "How tightly coupled services create the worst of both worlds",
      mermaid: `graph TD
    subgraph "Distributed Monolith (Anti-Pattern)"
      S1[Service A] -->|"sync HTTP"| S2[Service B]
      S2 -->|"sync HTTP"| S3[Service C]
      S3 -->|"sync HTTP"| S4[Service D]
      S1 --> DB[(Shared Database)]
      S2 --> DB
      S3 --> DB
      S4 --> DB
    end

    PROBLEM1["All services share\none database"] -.-> DB
    PROBLEM2["Synchronous call chain:\nA -> B -> C -> D\nOne failure = total failure"] -.-> S2
    PROBLEM3["Cannot deploy\nindependently"] -.-> S1

    style PROBLEM1 fill:#e74c3c,color:#fff
    style PROBLEM2 fill:#e74c3c,color:#fff
    style PROBLEM3 fill:#e74c3c,color:#fff
    style DB fill:#f39c12,color:#fff`,
    },
    {
      title: "Monolith Decision Framework",
      kind: "flow",
      caption: "Decision tree for choosing between monolith, modular monolith, and microservices",
      mermaid: `flowchart TD
    START{Team size?} -->|"< 10 engineers"| MONO["Start with\nModular Monolith"]
    START -->|"10-50 engineers"| Q2{"Clear domain\nboundaries?"}
    START -->|"50+ engineers"| Q3{"Independent\ndeployment needed?"}

    Q2 -->|"No"| MONO
    Q2 -->|"Yes"| Q4{"Need independent\nscaling?"}
    Q4 -->|"No"| MODMONO["Modular Monolith\nwith enforced boundaries"]
    Q4 -->|"Yes"| MICRO["Extract specific\nservices"]

    Q3 -->|"No"| MODMONO
    Q3 -->|"Yes"| MICRO

    MONO -->|"Domain matures"| MODMONO
    MODMONO -->|"Scaling pressure"| MICRO

    style MONO fill:#27ae60,color:#fff
    style MODMONO fill:#3498db,color:#fff
    style MICRO fill:#9b59b6,color:#fff`,
    },
    {
      title: "Branch by Abstraction Migration",
      kind: "sequence",
      caption: "Step-by-step process for migrating a module using feature flags",
      mermaid: `sequenceDiagram
    participant App as Application
    participant Abs as Abstraction Layer
    participant Mono as Monolith Impl
    participant Svc as New Service

    Note over App,Svc: Step 1: Create abstraction
    App->>Abs: call via interface
    Abs->>Mono: delegate (flag OFF)
    Mono-->>Abs: response
    Abs-->>App: response

    Note over App,Svc: Step 2: Build new service
    App->>Abs: call via interface
    Abs->>Svc: delegate (flag ON for 10%)
    Svc-->>Abs: response
    Abs-->>App: response

    Note over App,Svc: Step 3: Gradual rollout
    App->>Abs: call via interface
    Abs->>Svc: delegate (flag ON for 100%)
    Svc-->>Abs: response

    Note over App,Svc: Step 4: Remove monolith impl`,
    },
  ],

  exercises: [
    "**Design a modular monolith in C++.** Create a project with three modules: Users, Orders, and Notifications. Each module should have a public interface header and private implementation. Enforce that the Orders module can only call Users through the `IUserService` interface, never through internal headers. Use CMake to create separate library targets with explicit `target_link_libraries` dependencies. Verify that adding a direct include of an internal header causes a build failure.",
    "**Implement an in-process event bus.** Build a type-safe event bus in C++ using templates and `std::function`. Support subscribing to events by type, publishing events, and unsubscribing. Add support for event ordering guarantees (handlers for the same event type run in subscription order). Test with domain events like `OrderCreated`, `PaymentProcessed`, and `OrderShipped` flowing between modules.",
    "**Simulate the Strangler Fig pattern.** Build a simple HTTP router (using string matching, no actual HTTP required) that can route requests to either a monolith handler or a new service handler based on URL prefix. Implement the migration by progressively moving route prefixes from monolith to new service. Add percentage-based canary routing where 10% of traffic for a route goes to the new service.",
    "**Measure monolith vs microservice call overhead.** Write a benchmark in C++ that compares: (a) a direct function call between two modules in-process, (b) an IPC call via Unix domain socket, and (c) a simulated HTTP call with JSON serialization/deserialization. Measure latency for 100,000 calls and report p50, p95, p99. This demonstrates the 5-6 orders of magnitude difference in communication cost.",
    "**Implement a dependency graph analyzer.** Write a C++ program that reads module dependency declarations (e.g., from a config file listing which modules depend on which) and detects: (a) circular dependencies between modules, (b) modules that depend on another module's internal headers (boundary violations), and (c) the most depended-upon module (a refactoring risk). Use a directed graph with DFS for cycle detection.",
  ],

  cheatSheet: [
    "**Monolith advantages**: simplicity, in-process calls (ns not ms), ACID transactions, single deployment, easy debugging with one stack trace.",
    "**Monolith disadvantages**: must scale entire app, deployment risk across all modules, team coupling, technology lock-in.",
    "**Modular monolith**: strict module boundaries + single deployable. Best of both worlds for most teams. Enforce with package visibility and architecture fitness functions.",
    "**When to stay monolith**: team < 10, unclear domain boundaries, strong consistency needed, rapid prototyping, performance-critical paths.",
    "**When to extract**: deployment frequency limited by coordination, scaling bottleneck in one module, teams blocked by shared code, different tech stack needs.",
    "**Strangler Fig**: API gateway routes traffic gradually from monolith to new services. Incremental, reversible, production-safe.",
    "**Branch by Abstraction**: interface + dual implementations + feature flag. Toggle between monolith and service implementations. Remove old impl when validated.",
    "**Database decomposition**: hardest part of migration. Identify table ownership, create service APIs for cross-service data, use CDC/events for sync, accept eventual consistency.",
    "**Distributed monolith red flags**: shared database across services, synchronous call chains, lockstep deployments, shared libraries with business logic.",
    "**Extract first**: modules with clear boundaries, independent scaling needs, minimal cross-module data dependencies. Payments and notifications are common first targets.",
  ],

  revisionNotes: [
    "A **monolith** deploys everything as one unit. In-process calls are nanoseconds vs milliseconds for network calls -- a 5-6 order-of-magnitude difference.",
    "A **modular monolith** enforces strict module boundaries (interfaces, data ownership, build-system enforcement) within a single deployable -- the recommended starting point for most teams.",
    "Monoliths enable **ACID transactions** across all data naturally. Microservices require distributed sagas or eventual consistency for the same guarantees.",
    "The **Strangler Fig** pattern incrementally migrates from monolith to microservices via an API gateway that routes traffic route-by-route. It is reversible and production-safe.",
    "**Branch by Abstraction** uses an interface with dual implementations (monolith-backed and service-backed) toggled by a feature flag for gradual, safe migration.",
    "A **distributed monolith** (shared DB, sync chains, lockstep deploys) is the worst outcome -- distributed complexity with monolithic coupling. Avoid by ensuring each service owns its data and deploys independently.",
    "**Database decomposition** is the hardest migration challenge. Start by identifying table ownership, then use APIs and events to replace direct cross-module SQL joins.",
    "Many high-scale systems (Shopify, Stack Overflow, Basecamp) run successfully as monoliths. Choose architecture based on team size, domain clarity, and operational capacity -- not industry trends.",
  ],

  glossary: [
    {
      term: "Monolith",
      definition:
        "An application architecture where all functionality is built, deployed, and run as a single unit sharing one process and database.",
    },
    {
      term: "Modular Monolith",
      definition:
        "A monolith with enforced module boundaries, where each module owns its data and communicates through defined interfaces, combining monolith simplicity with microservice-like separation.",
    },
    {
      term: "Strangler Fig Pattern",
      definition:
        "An incremental migration strategy that gradually replaces monolith functionality with new services by routing traffic through an API gateway.",
    },
    {
      term: "Distributed Monolith",
      definition:
        "An anti-pattern where separately deployed services are tightly coupled, requiring coordinated releases and producing distributed systems overhead without the benefits.",
    },
    {
      term: "Branch by Abstraction",
      definition:
        "A migration technique that introduces an abstraction layer with dual implementations (monolith and service), allowing gradual switchover via feature flags.",
    },
    {
      term: "Database Decomposition",
      definition:
        "The process of splitting a shared monolith database into service-owned data stores, often the most challenging aspect of microservices migration.",
    },
    {
      term: "Change Data Capture (CDC)",
      definition:
        "A technique that tracks changes to a database and publishes them as events, used during migration to synchronize data between the monolith and extracted services.",
    },
  ],
};
