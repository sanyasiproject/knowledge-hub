import type { TopicContent } from "../types";

export const couplingCohesion: TopicContent = {
  quickSummary: [
    "Coupling measures the degree of interdependence between modules. Low coupling means modules can change independently; high coupling means a change in one module forces changes in others. The spectrum runs from content coupling (worst) through common, control, stamp, and data coupling to message coupling (best).",
    "Cohesion measures how strongly the elements within a single module belong together. High cohesion means a module does one thing well; low cohesion means it is a grab-bag of unrelated responsibilities. The spectrum runs from coincidental cohesion (worst) through logical, temporal, procedural, communicational, and sequential to functional cohesion (best).",
    "The goal is low coupling and high cohesion simultaneously. Low coupling reduces ripple effects of change; high cohesion makes modules easier to understand, test, and reuse. These two properties are inversely correlated in practice: increasing cohesion within modules tends to reduce coupling between them.",
    "Key metrics include Coupling Between Objects (CBO), Lack of Cohesion in Methods (LCOM), afferent coupling (Ca, who depends on me), efferent coupling (Ce, who I depend on), and instability (I = Ce / (Ca + Ce)). These are measurable proxies that guide refactoring decisions.",
  ],
  detailed: [
    "Coupling exists on a spectrum of severity. Content coupling is the worst form: one module directly modifies the internal data or control flow of another (e.g., reaching into another object's private fields via reflection). Common coupling occurs when multiple modules share global mutable state, so a change to that state affects all of them unpredictably. Control coupling happens when one module passes a flag or mode parameter that dictates the control flow of another, creating an implicit dependency on the other module's internal logic. Stamp coupling means passing an entire data structure when only a subset of fields is needed, creating a dependency on the structure's shape. Data coupling is the cleanest form of direct parameter passing: modules exchange only the specific primitive values or simple objects they need. External coupling binds modules to the same external interface, protocol, or file format. Message coupling (the ideal) means modules interact only through well-defined message-passing interfaces with no knowledge of each other's internals.",
    "Cohesion similarly exists on a spectrum. Coincidental cohesion is the weakest: elements are grouped arbitrarily, like a 'utils' class containing unrelated functions. Logical cohesion groups elements that perform similar operations (e.g., a class with methods for parsing XML, JSON, and CSV) but share no data or workflow. Temporal cohesion groups elements that execute at the same time, such as an initialization routine that opens database connections, reads config files, and starts logging. Procedural cohesion groups elements that always execute in a fixed sequence but operate on different data. Communicational cohesion groups elements that operate on the same data but perform different operations on it. Sequential cohesion means the output of one element becomes the input of the next, forming a pipeline. Functional cohesion is the ideal: every element in the module contributes to a single, well-defined task.",
    "The relationship between coupling and cohesion is not merely correlational but causal. When a module has low cohesion (mixed responsibilities), other modules that need one of those responsibilities must depend on the entire module, increasing coupling. Extracting each responsibility into its own highly cohesive module allows dependents to couple only to what they actually need. This is the mechanism behind the Single Responsibility Principle and the Interface Segregation Principle from SOLID.",
    "In practice, achieving zero coupling is neither possible nor desirable. Modules must collaborate, and collaboration requires some form of coupling. The goal is to push coupling toward the less harmful end of the spectrum: prefer data coupling and message coupling over control or common coupling. Dependency injection, event-driven architectures, and interface-based programming are structural techniques that shift coupling from compile-time to runtime and from concrete to abstract, making systems more flexible without eliminating necessary dependencies.",
    "Layered and hexagonal architectures encode coupling rules structurally. In a layered architecture, dependencies flow downward: the presentation layer depends on the business layer, which depends on the data access layer, but never the reverse. Hexagonal architecture (ports and adapters) goes further by inverting the dependency direction at boundaries: the domain core defines ports (interfaces), and infrastructure adapters implement them. This ensures the domain is coupled to nothing external, and all external concerns (databases, APIs, UIs) are coupled to the domain's abstractions.",
    "Testing is the practical litmus test for coupling and cohesion. If you cannot unit test a class without setting up a database, an HTTP server, and three other services, that class has excessive afferent coupling to infrastructure concerns. If a test requires dozens of unrelated setup steps because the class under test does too many things, that class has low cohesion. The ease of writing focused, fast, independent unit tests directly reflects the quality of a module's coupling and cohesion characteristics.",
    "Microservices amplify both the benefits and the costs of coupling decisions. A well-bounded microservice with high internal cohesion and low external coupling can be deployed, scaled, and evolved independently. But a distributed monolith, where microservices are tightly coupled through synchronous calls, shared databases, or implicit data contracts, has all the operational complexity of microservices with none of the autonomy benefits. The coupling that was a compile-time inconvenience in a monolith becomes a runtime failure mode in a distributed system.",
  ],
  deepDive: [
    "Robert C. Martin's Stable Dependencies Principle (SDP) and Stable Abstractions Principle (SAP) formalize coupling management at the package level. SDP states that a package should depend only on packages that are more stable than itself. Stability here is measured by the instability metric I = Ce / (Ca + Ce), where Ce is efferent coupling (outgoing dependencies) and Ca is afferent coupling (incoming dependencies). A package with I = 0 is maximally stable (many dependents, no dependencies); I = 1 is maximally unstable (no dependents, many dependencies). SAP adds that stable packages should be abstract (composed of interfaces and abstract classes), so their stability does not prevent extension. Together, SDP and SAP define the 'main sequence' in the abstractness-instability graph: packages should lie near the line from (I=0, A=1) to (I=1, A=0). Packages far from this line are either in the 'zone of pain' (stable and concrete, hard to change) or the 'zone of uselessness' (unstable and abstract, never used).",
    "The Lack of Cohesion in Methods (LCOM) metric has several formulations. LCOM1 (Chidamber-Kemerer) counts pairs of methods that share no instance variables minus pairs that do. LCOM4 (Hitz-Montazeri) builds an undirected graph where nodes are methods and edges connect methods that access the same instance variable or call each other, then counts connected components. An LCOM4 value of 1 means the class is cohesive; values greater than 1 suggest the class should be split into that many classes. Static analysis tools like SonarQube, NDepend, and JDepend compute these metrics and flag violations, but the numbers require contextual interpretation: a data transfer object with many independent fields will always show low LCOM, which is acceptable by design.",
    "Event-driven architectures and the mediator pattern represent structural approaches to decoupling that trade one form of complexity for another. Publishing domain events eliminates direct coupling between the producer and consumer: the order service publishes OrderPlaced without knowing that the inventory, notification, and analytics services subscribe. However, this introduces temporal coupling (the event must be processed eventually), schema coupling (the event payload is a shared contract), and debugging complexity (tracing a request across asynchronous boundaries). The Saga pattern coordinates multi-step business processes across decoupled services using compensating transactions, replacing distributed ACID transactions with eventual consistency. These patterns reduce structural coupling at the cost of increased operational complexity.",
    "Conway's Law observes that system architectures mirror organizational communication structures. This has a direct implication for coupling: teams that communicate frequently will produce tightly coupled modules, regardless of architectural intent. The 'Inverse Conway Maneuver' deliberately structures teams to match the desired architecture. If you want loosely coupled microservices, organize autonomous cross-functional teams around business capabilities. If teams share databases, deploy together, or require synchronous approval from other teams, the resulting architecture will be coupled no matter what the diagrams say. Coupling is ultimately a sociotechnical property, not purely a technical one.",
  ],
  code: [
    {
      language: "java",
      caption:
        "Before: tight coupling via concrete dependencies and control coupling. After: loose coupling via dependency injection and interfaces.",
      source: `// BEFORE: OrderService is tightly coupled to concrete implementations
// and uses control coupling (the boolean flag)
class OrderService {
    // Content coupling: directly instantiates concrete dependencies
    private MySQLDatabase db = new MySQLDatabase("jdbc:mysql://prod:3306/orders");
    private SmtpEmailSender emailSender = new SmtpEmailSender("smtp.company.com");

    public void placeOrder(Order order, boolean isExpress) {
        db.save(order);

        // Control coupling: flag dictates internal behavior of shipping
        if (isExpress) {
            new FedExShippingService().shipExpress(order);
        } else {
            new USPSShippingService().shipStandard(order);
        }

        // Stamp coupling: passes entire Order when email only needs address and orderId
        emailSender.sendConfirmation(order);
    }
}

// ─────────────────────────────────────────────────────

// AFTER: Loosely coupled via interfaces, DI, and data coupling
interface OrderRepository {
    void save(Order order);
}

interface NotificationService {
    void sendOrderConfirmation(String recipientEmail, String orderId);
}

interface ShippingStrategy {
    void ship(ShippingRequest request);
}

record ShippingRequest(String orderId, Address destination, ShippingSpeed speed) {}

class OrderService {
    private final OrderRepository repository;
    private final NotificationService notifications;
    private final ShippingStrategy shipping;

    // Dependencies injected — no knowledge of concrete implementations
    OrderService(OrderRepository repository,
                 NotificationService notifications,
                 ShippingStrategy shipping) {
        this.repository = repository;
        this.notifications = notifications;
        this.shipping = shipping;
    }

    public void placeOrder(Order order, ShippingSpeed speed) {
        repository.save(order);

        // Data coupling: pass only the data the shipping service needs
        shipping.ship(new ShippingRequest(
            order.getId(),
            order.getShippingAddress(),
            speed
        ));

        // Data coupling: pass only email and orderId, not the entire Order
        notifications.sendOrderConfirmation(
            order.getCustomerEmail(),
            order.getId()
        );
    }
}`,
    },
    {
      language: "cpp",
      caption:
        "Before: low cohesion 'god class' mixing unrelated responsibilities. After: high cohesion with single-responsibility classes.",
      source: `// BEFORE: Low cohesion -- UserManager handles authentication, profile
// management, email sending, report generation, and CSV export.
// LCOM4 would show 4+ connected components.

class UserManager {
public:
    UserManager(DbConnection& db, SmtpServer& smtp)
        : db_(db), smtp_(smtp) {}

    // ---- Authentication concern ----
    bool authenticate(const std::string& username, const std::string& password) {
        auto user = db_.query("SELECT * FROM users WHERE username = ?", username);
        if (!user || !bcryptCheckpw(password, user->passwordHash)) {
            failedLogins_[username]++;
            return false;
        }
        failedLogins_.erase(username);
        return true;
    }

    bool isLockedOut(const std::string& username) const {
        auto it = failedLogins_.find(username);
        return it != failedLogins_.end() && it->second >= 5;
    }

    // ---- Profile concern ----
    void updateProfile(int userId, const std::string& displayName, const std::string& bio) {
        db_.execute("UPDATE users SET display_name=?, bio=? WHERE id=?",
                    displayName, bio, userId);
    }

    // ---- Notification concern ----
    void sendWelcomeEmail(const std::string& email, const std::string& name) {
        smtp_.send(email, "Welcome!", "Hello " + name);
    }

    // ---- Reporting concern ----
    std::string generateUserActivityReport(Date startDate, Date endDate) {
        auto rows = db_.query("SELECT ... FROM activity WHERE ...", startDate, endDate);
        return formatAsCsv(rows);
    }

private:
    DbConnection& db_;
    SmtpServer& smtp_;
    std::unordered_map<std::string, int> failedLogins_;

    std::string formatAsCsv(const std::vector<Row>& rows);
};


// -------------------------------------------------------

// AFTER: Each class has functional cohesion -- every method contributes
// to a single well-defined responsibility.

#include <string>
#include <unordered_map>
#include <memory>
#include <chrono>

// Handles login attempts and lockout policy.
class AuthenticationService {
public:
    explicit AuthenticationService(UserRepository& repo) : repo_(repo) {}

    bool authenticate(const std::string& username, const std::string& password) {
        auto user = repo_.findByUsername(username);
        if (!user || !bcryptCheckpw(password, user->passwordHash)) {
            failedAttempts_[username]++;
            return false;
        }
        failedAttempts_.erase(username);
        return true;
    }

    bool isLockedOut(const std::string& username) const {
        auto it = failedAttempts_.find(username);
        return it != failedAttempts_.end() && it->second >= 5;
    }

private:
    UserRepository& repo_;
    std::unordered_map<std::string, int> failedAttempts_;
};


// Manages user profile data.
class UserProfileService {
public:
    explicit UserProfileService(UserRepository& repo) : repo_(repo) {}

    void updateProfile(int userId, const std::string& displayName,
                       const std::string& bio) {
        repo_.update(userId, displayName, bio);
    }

    UserProfile getProfile(int userId) {
        return repo_.findById(userId);
    }

private:
    UserRepository& repo_;
};


// Sends user-related notifications.
class UserNotificationService {
public:
    explicit UserNotificationService(EmailSender& email) : email_(email) {}

    void sendWelcomeEmail(const std::string& email, const std::string& name) {
        email_.send(email, "Welcome!", "Hello " + name);
    }

private:
    EmailSender& email_;
};


// Generates user activity reports.
class ActivityReportService {
public:
    ActivityReportService(ActivityRepository& repo, ReportFormatter& formatter)
        : repo_(repo), formatter_(formatter) {}

    std::string generateReport(Date startDate, Date endDate) {
        auto activities = repo_.findBetween(startDate, endDate);
        return formatter_.format(activities);
    }

private:
    ActivityRepository& repo_;
    ReportFormatter& formatter_;
};`,
    },
    {
      language: "typescript",
      caption:
        "Before: common coupling via shared global state and stamp coupling. After: message coupling via events and data coupling via narrow interfaces.",
      source: `// BEFORE: Common coupling — multiple modules read/write shared global state.
// PaymentProcessor and InventoryService are coupled through globalAppState.

const globalAppState = {
  currentOrder: null as Order | null,
  paymentStatus: "pending",
  inventoryLevels: {} as Record<string, number>,
  lastError: null as string | null,
};

class PaymentProcessor {
  processPayment(): void {
    // Common coupling: reads from shared global state
    const order = globalAppState.currentOrder!;
    try {
      const result = this.chargeCard(order.card, order.total);
      // Common coupling: writes to shared global state
      globalAppState.paymentStatus = result.success ? "paid" : "failed";
    } catch (err) {
      globalAppState.lastError = (err as Error).message;
      globalAppState.paymentStatus = "failed";
    }
  }

  private chargeCard(card: CardInfo, amount: number) {
    return { success: true };
  }
}

class InventoryService {
  reserveStock(): void {
    // Common coupling: reads shared state written by another module
    if (globalAppState.paymentStatus !== "paid") return;
    const order = globalAppState.currentOrder!;
    for (const item of order.items) {
      // Common coupling: mutates shared state
      globalAppState.inventoryLevels[item.sku] -= item.quantity;
    }
  }
}

// ─────────────────────────────────────────────────────

// AFTER: Message coupling via domain events, data coupling via typed payloads.

interface DomainEvent<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: number;
}

class EventBus {
  private listeners = new Map<string, Set<(event: DomainEvent) => void>>();

  subscribe<T>(eventType: string, handler: (event: DomainEvent<T>) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as (event: DomainEvent) => void);
  }

  publish(event: DomainEvent): void {
    this.listeners.get(event.type)?.forEach((handler) => handler(event));
  }
}

// Data coupling: narrow, typed payloads — only what each service needs
interface PaymentRequest {
  orderId: string;
  amount: number;
  cardToken: string;
}

interface PaymentConfirmed {
  orderId: string;
  transactionId: string;
}

interface StockReservation {
  orderId: string;
  items: Array<{ sku: string; quantity: number }>;
}

class PaymentProcessor {
  constructor(private eventBus: EventBus) {}

  // Data coupling: receives only the data it needs, not the entire Order
  processPayment(request: PaymentRequest): void {
    const transactionId = this.chargeCard(request.cardToken, request.amount);

    // Message coupling: publishes an event, no knowledge of subscribers
    this.eventBus.publish({
      type: "PaymentConfirmed",
      payload: { orderId: request.orderId, transactionId } as PaymentConfirmed,
      timestamp: Date.now(),
    });
  }

  private chargeCard(token: string, amount: number): string {
    return "txn_" + Math.random().toString(36).slice(2);
  }
}

class InventoryService {
  constructor(private inventory: Map<string, number>, eventBus: EventBus) {
    // Message coupling: subscribes to events, no knowledge of publisher
    eventBus.subscribe<PaymentConfirmed>("PaymentConfirmed", (event) => {
      this.onPaymentConfirmed(event.payload as PaymentConfirmed);
    });
  }

  reserveStock(reservation: StockReservation): void {
    for (const item of reservation.items) {
      const current = this.inventory.get(item.sku) ?? 0;
      this.inventory.set(item.sku, current - item.quantity);
    }
  }

  private onPaymentConfirmed(payment: PaymentConfirmed): void {
    // In production, would look up the reservation by orderId
    console.log(\`Payment \${payment.transactionId} confirmed for \${payment.orderId}\`);
  }
}`,
    },
  ],
  diagrams: [
    {
      title: "Coupling Spectrum: Worst to Best",
      kind: "flow",
      caption:
        "Content coupling (most harmful) through common, external, control, stamp, data, to message coupling (least harmful). Each step reduces the knowledge one module has about another's internals.",
    },
    {
      title: "Instability and the Main Sequence",
      kind: "architecture",
      caption:
        "Packages plotted on the abstractness (A) vs. instability (I) graph. The main sequence runs from (0,1) to (1,0). Packages in the zone of pain (low I, low A) are stable and concrete — rigid. Packages in the zone of uselessness (high I, high A) are unstable and abstract — never depended upon.",
    },
  ],
  animations: [
    {
      title: "Refactoring from Tight Coupling to Loose Coupling",
      steps: [
        {
          label: "Identify the tightly coupled dependency",
          detail:
            "OrderService directly instantiates MySQLDatabase and SmtpEmailSender. It cannot function without these concrete classes, and testing requires a running database and SMTP server.",
        },
        {
          label: "Extract interfaces for each dependency",
          detail:
            "Define OrderRepository and NotificationService interfaces that describe the behavior needed, without specifying the implementation. The interface boundary is the seam where coupling is reduced.",
        },
        {
          label: "Inject dependencies through the constructor",
          detail:
            "OrderService now receives its dependencies as constructor parameters typed to the interfaces. It no longer knows or cares whether the repository is MySQL, PostgreSQL, or an in-memory fake.",
        },
        {
          label: "Replace control coupling with polymorphism",
          detail:
            "The boolean isExpress flag that controlled shipping logic is replaced with a ShippingStrategy interface. Express and standard shipping are separate implementations selected by the caller or a factory, not by a conditional inside OrderService.",
        },
        {
          label: "Narrow data passed between modules",
          detail:
            "Instead of passing the entire Order object to the notification service (stamp coupling), pass only the email address and order ID (data coupling). Each module receives exactly the data it needs and nothing more.",
        },
        {
          label: "Verify with tests",
          detail:
            "OrderService can now be unit tested with in-memory fakes for all dependencies. Tests run in milliseconds, need no infrastructure, and each test verifies one behavior. The ease of testing confirms the coupling has been reduced.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Level",
      "Coupling Type",
      "Description",
      "Cohesion Type",
      "Description",
    ],
    rows: [
      [
        "Worst",
        "Content",
        "Module modifies another's internals directly",
        "Coincidental",
        "Elements grouped arbitrarily with no relationship",
      ],
      [
        "6",
        "Common",
        "Modules share global mutable state",
        "Logical",
        "Elements perform similar operations but are otherwise unrelated",
      ],
      [
        "5",
        "External",
        "Modules depend on same external format or protocol",
        "Temporal",
        "Elements execute at the same time (e.g., initialization)",
      ],
      [
        "4",
        "Control",
        "One module passes a flag controlling another's logic",
        "Procedural",
        "Elements follow a fixed sequence but operate on different data",
      ],
      [
        "3",
        "Stamp",
        "Modules pass entire structures when only parts are needed",
        "Communicational",
        "Elements operate on the same data but do different things",
      ],
      [
        "2",
        "Data",
        "Modules exchange only necessary primitive data",
        "Sequential",
        "Output of one element is input to the next (pipeline)",
      ],
      [
        "Best",
        "Message",
        "Modules interact through well-defined messages only",
        "Functional",
        "Every element contributes to a single well-defined task",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is coupling and why should we minimize it?",
      a: "Coupling is the degree of interdependence between modules. High coupling means a change in one module forces changes in others, making the system rigid and fragile. We minimize coupling to enable independent development, testing, deployment, and evolution of modules. The goal is not zero coupling (modules must collaborate) but to push toward less harmful forms: prefer data and message coupling over content or common coupling.",
      followUps: [
        "Can you have too little coupling?",
        "How does coupling differ in monoliths vs. microservices?",
      ],
    },
    {
      q: "What is the difference between afferent and efferent coupling?",
      a: "Afferent coupling (Ca) counts the number of external modules that depend on a given module — it measures responsibility. Efferent coupling (Ce) counts the number of external modules a given module depends on — it measures dependency. A module with high Ca is heavily depended upon and should be stable (hard to change without breaking dependents). A module with high Ce depends on many things and is sensitive to external changes. The instability metric I = Ce / (Ca + Ce) captures this: I near 0 means stable (many dependents), I near 1 means unstable (many dependencies).",
    },
    {
      q: "Explain functional cohesion and why it is the ideal.",
      a: "Functional cohesion means every element in a module contributes to a single, well-defined task. A functionally cohesive module has one reason to change, is easy to name (its name describes what it does without conjunctions), is straightforward to test (one setup, one verification), and is highly reusable because it does one thing completely. For example, a PasswordHasher that only hashes and verifies passwords is functionally cohesive. Contrast this with a UserManager that handles authentication, profile updates, and email sending — it has communicational cohesion at best.",
    },
    {
      q: "How does dependency injection reduce coupling?",
      a: "Dependency injection replaces concrete instantiation inside a class with constructor or method parameters typed to abstractions (interfaces). This changes the coupling from compile-time coupling to a concrete implementation to compile-time coupling to an abstraction, with runtime binding to the concrete. The class under test can be given fakes or mocks, enabling isolated unit testing. The key insight is that DI does not eliminate coupling — it redirects it. The coupling to the concrete implementation still exists, but it is pushed to the composition root (the entry point where the object graph is assembled), which is the one place in the system that is allowed to know about all implementations.",
    },
    {
      q: "What is the Stable Dependencies Principle?",
      a: "The Stable Dependencies Principle (SDP) states that a module should only depend on modules that are more stable than itself. Stability is measured by the instability metric I = Ce / (Ca + Ce). A module that many others depend on (high Ca, low I) is stable and expensive to change. SDP says you should not make a stable module depend on an unstable one, because the unstable module's frequent changes would force changes in the stable module and all its dependents. When you must violate this, apply the Dependency Inversion Principle: have the stable module depend on an abstract interface that the unstable module implements.",
    },
    {
      q: "How do you identify a class with low cohesion?",
      a: "Several indicators: (1) the class is hard to name without using 'and' or 'manager'; (2) it has groups of methods that use disjoint sets of instance variables (high LCOM4); (3) changes to one feature require modifying a class that also contains unrelated features; (4) tests require extensive, seemingly unrelated setup; (5) the class has many imports from different domains; (6) you find yourself wanting to reuse part of the class but cannot extract it. The LCOM metric formalizes this: if the method-variable graph has multiple connected components, each component suggests a separate class.",
      followUps: [
        "What is LCOM4 and how is it calculated?",
        "When is low cohesion acceptable?",
      ],
    },
    {
      q: "What is the Law of Demeter and how does it relate to coupling?",
      a: "The Law of Demeter (LoD) states that a method should only call methods on: (1) its own object, (2) its parameters, (3) objects it creates, (4) its direct component objects. Violating LoD (e.g., order.getCustomer().getAddress().getCity()) creates transitive coupling: the caller is coupled not just to Order but to Customer and Address as well. A change to Address's API breaks the caller even though it never directly interacted with Address. Following LoD by providing order.getShippingCity() encapsulates the traversal and limits coupling to the immediate collaborator.",
    },
  ],
  mcqs: [
    {
      q: "Which type of coupling occurs when one module modifies the internal data of another module?",
      options: [
        "Data coupling",
        "Content coupling",
        "Stamp coupling",
        "Common coupling",
      ],
      answerIndex: 1,
      explanation:
        "Content coupling is the most severe form: one module directly accesses or modifies the internals (private fields, internal logic) of another. This creates the tightest possible dependency.",
    },
    {
      q: "A function accepts a boolean parameter that determines which of two code paths to execute. What type of coupling does this represent?",
      options: [
        "Data coupling",
        "Stamp coupling",
        "Control coupling",
        "External coupling",
      ],
      answerIndex: 2,
      explanation:
        "Control coupling occurs when one module passes a control flag (boolean, enum, mode string) that dictates the internal behavior of another module. The caller must know the callee's internal logic to pass the correct flag.",
    },
    {
      q: "What does an LCOM4 value of 3 for a class indicate?",
      options: [
        "The class has 3 methods",
        "The class should likely be split into 3 separate classes",
        "The class has 3 instance variables",
        "The class has 3 external dependencies",
      ],
      answerIndex: 1,
      explanation:
        "LCOM4 counts connected components in the method-variable graph. A value of 3 means there are 3 groups of methods that share no instance variables with each other, suggesting the class contains 3 independent responsibilities that should be separate classes.",
    },
    {
      q: "A module has Ca = 8 and Ce = 2. What is its instability metric?",
      options: ["0.2", "0.8", "4.0", "0.25"],
      answerIndex: 0,
      explanation:
        "Instability I = Ce / (Ca + Ce) = 2 / (8 + 2) = 0.2. This module is relatively stable: 8 other modules depend on it (high afferent coupling), so changing it has widespread impact. It should be abstract per the Stable Abstractions Principle.",
    },
    {
      q: "Which cohesion type describes a module where the output of one function is the input to the next?",
      options: [
        "Communicational cohesion",
        "Procedural cohesion",
        "Sequential cohesion",
        "Functional cohesion",
      ],
      answerIndex: 2,
      explanation:
        "Sequential cohesion means elements form a pipeline: each element's output feeds the next element's input. It is the second-best form of cohesion, just below functional cohesion.",
    },
    {
      q: "What does the Stable Dependencies Principle state?",
      options: [
        "Modules should depend on abstractions, not concretions",
        "A module should depend only on modules more stable than itself",
        "Dependencies should be injected rather than instantiated",
        "Circular dependencies must be eliminated",
      ],
      answerIndex: 1,
      explanation:
        "SDP states that dependencies should flow in the direction of stability. An unstable module (few dependents, many dependencies) may depend on a stable one (many dependents, few dependencies), but not the reverse, because changes to the unstable module would propagate to the stable module's many dependents.",
    },
    {
      q: "Passing an entire User object to a function that only needs the user's email address is an example of:",
      options: [
        "Data coupling",
        "Stamp coupling",
        "Common coupling",
        "Content coupling",
      ],
      answerIndex: 1,
      explanation:
        "Stamp coupling occurs when a module receives a composite data structure but uses only a portion of it. The function is now coupled to the User type's structure even though it only needs a string email address. Passing just the email string would reduce this to data coupling.",
    },
  ],
  flashcards: [
    {
      front: "What is coupling in software design?",
      back: "The degree of interdependence between modules. Low coupling means modules can change independently; high coupling means changes ripple across module boundaries.",
    },
    {
      front: "What is cohesion in software design?",
      back: "The degree to which elements within a single module belong together and contribute to a single purpose. High cohesion means a focused, single-responsibility module.",
    },
    {
      front: "What is the instability metric and how is it calculated?",
      back: "I = Ce / (Ca + Ce), where Ce is efferent coupling (outgoing dependencies) and Ca is afferent coupling (incoming dependencies). I = 0 means maximally stable; I = 1 means maximally unstable.",
    },
    {
      front: "What is the difference between content coupling and common coupling?",
      back: "Content coupling: one module directly modifies another's internals (worst). Common coupling: multiple modules share global mutable state. Both are severe, but content coupling is worse because it bypasses any interface.",
    },
    {
      front: "What is the difference between sequential and communicational cohesion?",
      back: "Sequential: output of one element becomes input to the next (pipeline). Communicational: elements operate on the same data but perform different, independent operations. Sequential is stronger because it implies a necessary ordering.",
    },
    {
      front: "What is LCOM4?",
      back: "Lack of Cohesion in Methods (variant 4). Build a graph where nodes are methods and edges connect methods sharing instance variables or calling each other. Count connected components. Value > 1 suggests the class should be split.",
    },
    {
      front: "What is the Law of Demeter?",
      back: "A method should only call methods on: itself, its parameters, objects it creates, and its direct fields. Prohibits 'train wreck' chains like a.getB().getC().doThing(), which create transitive coupling.",
    },
    {
      front: "What is the zone of pain in the abstractness-instability graph?",
      back: "Packages that are highly stable (I near 0) but not abstract (A near 0). They are heavily depended upon and made of concrete classes, making them rigid and painful to change.",
    },
    {
      front: "How does dependency injection affect coupling?",
      back: "DI replaces compile-time coupling to concrete implementations with coupling to abstractions (interfaces). Concrete binding is pushed to the composition root. This enables testability and swappability without eliminating necessary dependencies.",
    },
  ],
  revisionNotes: [
    "Coupling and cohesion are inverse qualities: improving one typically improves the other. Increasing cohesion (splitting a god class into focused modules) reduces coupling (dependents couple only to what they need).",
    "Coupling spectrum from worst to best: content, common, external, control, stamp, data, message. Each level reduces knowledge of another module's internals.",
    "Cohesion spectrum from worst to best: coincidental, logical, temporal, procedural, communicational, sequential, functional. Each level increases the focus of a module's purpose.",
    "Key metrics: CBO (Coupling Between Objects) counts distinct classes a class is coupled to. LCOM4 counts connected components in the method-variable graph. Instability I = Ce/(Ca+Ce) measures a module's resistance to change.",
    "The Stable Dependencies Principle says depend only on things more stable than you. The Stable Abstractions Principle says stable things should be abstract. Together they define the main sequence in the A-I graph.",
    "Dependency injection, the mediator pattern, event-driven architecture, and interface-based programming are structural techniques for reducing coupling. Each trades one form of complexity for another.",
    "Testing is the practical litmus test: if a class is hard to test in isolation, it has too much coupling. If a test requires unrelated setup, the class has low cohesion.",
    "Conway's Law means coupling is sociotechnical: organizational communication structures will be reflected in system coupling, regardless of architectural intent.",
  ],
  cheatSheet: [
    "Low coupling + high cohesion = maintainable, testable, reusable code",
    "Content coupling (worst): module modifies another's internals -> fix: use public interfaces",
    "Common coupling: shared global state -> fix: pass state explicitly or use events",
    "Control coupling: passing flags/modes -> fix: use polymorphism (strategy pattern)",
    "Stamp coupling: passing whole object when part is needed -> fix: pass only required fields",
    "Data coupling (good): modules exchange only needed primitives or simple DTOs",
    "Message coupling (best): modules communicate via messages with no knowledge of internals",
    "Functional cohesion (best): every element serves one task -> single responsibility",
    "LCOM4 > 1 suggests splitting the class into that many classes",
    "Instability I = Ce/(Ca+Ce); stable modules (low I) should be abstract",
    "Dependency Inversion: high-level modules depend on abstractions, not low-level details",
    "Law of Demeter: don't chain calls through objects you don't directly own",
    "If you can't unit test it easily, coupling is too high or cohesion is too low",
  ],
  resources: [
    {
      label: "Clean Architecture - Robert C. Martin",
      kind: "book",
      note: "Chapters on component coupling principles (SDP, SAP, ADP) and the main sequence graph.",
    },
    {
      label: "Structured Design - Yourdon & Constantine",
      kind: "book",
      note: "The original formalization of coupling and cohesion spectrums from the 1970s.",
    },
    {
      label: "A Metrics Suite for Object-Oriented Design - Chidamber & Kemerer (1994)",
      kind: "paper",
      note: "Defines CBO, LCOM, and other OO metrics. The foundational academic paper on coupling and cohesion measurement.",
    },
    {
      label: "Refactoring: Improving the Design of Existing Code - Martin Fowler",
      kind: "book",
      note: "Catalogs refactoring patterns that reduce coupling (Extract Interface, Introduce Parameter Object) and improve cohesion (Extract Class, Move Method).",
    },
    {
      label: "Building Microservices - Sam Newman",
      kind: "book",
      note: "Covers coupling in distributed systems, bounded contexts, and avoiding the distributed monolith.",
    },
    {
      label: "SonarQube Documentation: Metrics",
      kind: "docs",
      note: "Reference for how static analysis tools compute coupling and cohesion metrics (CBO, LCOM4, afferent/efferent coupling).",
    },
  ],
  glossary: [
    {
      term: "Coupling",
      definition:
        "The degree of interdependence between software modules. Low coupling means modules can be changed, tested, and deployed independently.",
    },
    {
      term: "Cohesion",
      definition:
        "The degree to which elements within a module belong together and serve a single purpose. High cohesion means a focused, understandable module.",
    },
    {
      term: "Afferent Coupling (Ca)",
      definition:
        "The number of external modules that depend on a given module. High Ca means the module is heavily relied upon and should be stable.",
    },
    {
      term: "Efferent Coupling (Ce)",
      definition:
        "The number of external modules that a given module depends on. High Ce means the module is sensitive to external changes.",
    },
    {
      term: "Instability (I)",
      definition:
        "A metric calculated as Ce / (Ca + Ce). Ranges from 0 (maximally stable, all dependents, no dependencies) to 1 (maximally unstable, no dependents, all dependencies).",
    },
    {
      term: "CBO (Coupling Between Objects)",
      definition:
        "A metric counting the number of distinct classes to which a class is coupled. High CBO indicates a class that is difficult to change, test, or reuse in isolation.",
    },
    {
      term: "LCOM (Lack of Cohesion in Methods)",
      definition:
        "A family of metrics measuring how cohesive a class is. LCOM4 counts connected components in the method-variable graph; a value greater than 1 suggests the class should be split.",
    },
    {
      term: "Dependency Inversion Principle",
      definition:
        "High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.",
    },
    {
      term: "Law of Demeter",
      definition:
        "A design guideline stating that a method should only interact with its immediate collaborators, not with objects obtained transitively through those collaborators.",
    },
    {
      term: "Composition Root",
      definition:
        "The single location in an application where the entire object graph is assembled and concrete implementations are bound to their abstractions. The one place allowed to know about all implementations.",
    },
  ],

  exercises: [
    "Take a C++ class `ReportGenerator` that reads data from a database, filters it, formats it as CSV, and emails it to a manager. Identify the **cohesion type** (coincidental, functional, etc.) and calculate its hypothetical **LCOM4** value by listing the methods and instance variables. Refactor it into *four separate classes*, each with **functional cohesion**, and show how **dependency injection** via constructor parameters reduces coupling from *content coupling* to *data coupling*.",
    "Analyze the following C++ function signature: `void processOrder(Order& order, bool isExpress, bool sendEmail, int retryCount)`. Identify *two types* of coupling present (hint: **control coupling** and **stamp coupling**). Refactor the function to eliminate both: replace boolean flags with the **Strategy pattern** and pass only the data each collaborator actually needs. Write the refactored version with interfaces.",
    "You have a C++ codebase with 5 modules. Calculate the **instability metric** `I = Ce / (Ca + Ce)` for each module given: Module A (Ca=10, Ce=1), Module B (Ca=2, Ce=8), Module C (Ca=5, Ce=5), Module D (Ca=0, Ce=6), Module E (Ca=7, Ce=0). Which module is in the *zone of pain* (stable but concrete)? Which is in the *zone of uselessness* (unstable but abstract)? How would you apply the **Stable Dependencies Principle** to fix a dependency from Module E to Module D?",
    "A `UserController` class in your web application has 15 methods: 4 for authentication, 3 for profile management, 4 for admin operations, and 4 for reporting. Draw the **method-variable graph** (which methods share which instance variables) and count the connected components to compute **LCOM4**. Propose a refactoring plan that splits the class so each resulting class has LCOM4 = 1.",
    "Your team is debating whether to use **event-driven architecture** (publish/subscribe) or **direct method calls** between an `OrderService` and an `InventoryService`. List the *coupling type* for each approach (message coupling vs. data/stamp coupling). For the event-driven approach, identify the *new forms of coupling* introduced (schema coupling, temporal coupling). When does the added complexity of events *not* pay off? Design a decision framework with concrete criteria."
  ],
};
