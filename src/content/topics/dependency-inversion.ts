import type { TopicContent } from "../types";

export const dependencyInversion: TopicContent = {
  quickSummary: [
    "High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces).",
    "Abstractions should not depend on details; details (implementations) should depend on abstractions.",
    "DIP enables loose coupling by inverting the traditional dependency direction: instead of high-level code importing low-level code, both depend on an interface owned by the high-level layer.",
    "DIP is distinct from Dependency Injection (DI): DIP is the principle (depend on abstractions), DI is a technique (injecting dependencies via constructors/setters) that helps achieve DIP."
  ],
  detailed: [
    "In traditional layered architectures, high-level modules (business logic) depend directly on low-level modules (database access, file I/O, HTTP clients). This means changes to low-level implementation details propagate upward, forcing business logic to change. DIP inverts this: the high-level module defines the interface it needs, and the low-level module implements it.",
    "The key insight of DIP is interface ownership. The abstraction (interface) lives in the high-level module's layer, not the low-level module's. The OrderService defines OrderRepository as an interface in the business layer. The PostgresOrderRepository in the infrastructure layer implements it. The business layer owns the contract; the infrastructure layer conforms to it.",
    "Dependency Injection (DI) is the most common mechanism for achieving DIP. Constructor injection is the preferred form: dependencies are passed as constructor parameters, making them explicit and enabling easy testing via mock objects. Other forms include setter injection and method injection, each with different trade-offs.",
    "DI containers (Spring, Guice in Java; NestJS in TypeScript; FastAPI/injector in Python) automate the wiring of dependencies. They manage object creation, lifecycle, and injection based on configuration or annotations. While convenient, DI containers add complexity and can be replaced by manual 'poor man's DI' (constructing the dependency graph by hand in a composition root).",
    "DIP is foundational to the Hexagonal Architecture (Ports and Adapters). The domain/application core defines ports (interfaces for its needs). Adapters implement these ports for specific technologies (PostgreSQL, Redis, SMTP). The core is technology-agnostic and testable in isolation."
  ],
  deepDive: [
    "DIP vs DI vs IoC: these three concepts are often confused. Dependency Inversion Principle (DIP) is a design principle -- depend on abstractions. Dependency Injection (DI) is a technique for providing dependencies to a class from outside. Inversion of Control (IoC) is the broader concept where framework/container code calls your code (Hollywood Principle: don't call us, we'll call you). DI is one form of IoC. You can practice DI without a container, and you can follow DIP without DI (e.g., using the Service Locator pattern, though it's less preferred).",
    "The composition root is the single place in an application where the entire dependency graph is assembled. All concrete classes are instantiated and wired together here. This is typically in the application's main() or startup configuration. By confining new ConcreteClass() to the composition root, the rest of the codebase depends only on abstractions.",
    "DIP enables testing at multiple levels. Unit tests inject mock/stub implementations of the abstractions, testing business logic without databases, networks, or file systems. Integration tests inject real or in-memory implementations. This flexibility is only possible because the business logic depends on abstractions, not concrete infrastructure classes.",
    "In functional programming, DIP manifests as parameterization: instead of a function calling a database directly, it receives a function parameter (or closure) for data access. The high-level function defines the signature it needs; the caller provides the implementation. Reader monad in Haskell and dependency injection via partial application in Clojure exemplify this."
  ],
  code: [
    {
      language: "java",
      caption: "DIP violation vs DIP-compliant design with constructor injection",
      source: `// VIOLATION: High-level OrderService directly depends on low-level MySqlOrderDao
public class OrderService {
    // Direct dependency on concrete implementation
    private final MySqlOrderDao orderDao = new MySqlOrderDao();
    private final SmtpEmailSender emailSender = new SmtpEmailSender();

    public void placeOrder(Order order) {
        orderDao.save(order);                    // coupled to MySQL
        emailSender.send(order.getCustomerEmail(), // coupled to SMTP
            "Order Confirmed", "Your order #" + order.getId());
    }
}

// ------- DIP APPLIED -------

// Step 1: Define abstractions in the business layer
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(String id);
    List<Order> findByCustomer(String customerId);
}

public interface NotificationService {
    void sendOrderConfirmation(Order order);
}

// Step 2: High-level module depends on abstractions
public class OrderService {
    private final OrderRepository orderRepo;
    private final NotificationService notifications;

    // Constructor injection -- dependencies are explicit
    public OrderService(OrderRepository orderRepo, NotificationService notifications) {
        this.orderRepo = orderRepo;
        this.notifications = notifications;
    }

    public void placeOrder(Order order) {
        order.validate();
        orderRepo.save(order);
        notifications.sendOrderConfirmation(order);
    }
}

// Step 3: Low-level modules implement the abstractions
public class PostgresOrderRepository implements OrderRepository {
    private final DataSource dataSource;

    public PostgresOrderRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void save(Order order) {
        try (Connection conn = dataSource.getConnection()) {
            // PostgreSQL-specific implementation
        }
    }

    @Override
    public Optional<Order> findById(String id) { /* ... */ return Optional.empty(); }

    @Override
    public List<Order> findByCustomer(String customerId) { /* ... */ return List.of(); }
}

public class EmailNotificationService implements NotificationService {
    private final EmailClient emailClient;

    public EmailNotificationService(EmailClient emailClient) {
        this.emailClient = emailClient;
    }

    @Override
    public void sendOrderConfirmation(Order order) {
        emailClient.send(
            order.getCustomerEmail(),
            "Order Confirmed",
            "Your order #" + order.getId() + " has been placed."
        );
    }
}

// Step 4: Composition root wires everything together
public class Application {
    public static void main(String[] args) {
        DataSource ds = createDataSource();
        EmailClient emailClient = new SmtpEmailClient("smtp.example.com", 587);

        OrderRepository repo = new PostgresOrderRepository(ds);
        NotificationService notifications = new EmailNotificationService(emailClient);
        OrderService orderService = new OrderService(repo, notifications);

        // Application runs with all dependencies wired
    }
}`
    },
    {
      language: "typescript",
      caption: "DIP in TypeScript with repository pattern and testing",
      source: `// Abstractions (owned by the business/domain layer)
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

interface TokenService {
  generate(payload: Record<string, unknown>): string;
  verify(token: string): Record<string, unknown> | null;
}

// High-level module depends only on abstractions
class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictError("Email already registered");

    const hashedPassword = await this.hasher.hash(password);
    const user: User = { id: crypto.randomUUID(), email, hashedPassword };
    await this.users.save(user);
    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new AuthError("Invalid credentials");

    const valid = await this.hasher.verify(password, user.hashedPassword);
    if (!valid) throw new AuthError("Invalid credentials");

    return this.tokens.generate({ userId: user.id, email: user.email });
  }
}

// Low-level implementations
class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
}

class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// TESTING: inject mock implementations
class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find(u => u.email === email) ?? null;
  }
  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

// Test uses in-memory implementations -- no database, no bcrypt
const testAuth = new AuthService(
  new InMemoryUserRepository(),
  { hash: async (p) => \`hashed_\${p}\`, verify: async (p, h) => h === \`hashed_\${p}\` },
  { generate: (p) => JSON.stringify(p), verify: (t) => JSON.parse(t) },
);`
    }
  ],
  diagrams: [
    {
      title: "Traditional vs Inverted Dependencies",
      kind: "architecture",
      caption: "Traditional: high-level module depends on low-level module directly. Inverted: both depend on an abstraction owned by the high-level layer.",
      mermaid: `graph TD
    subgraph Traditional ["Traditional - Violation"]
        OS1["OrderService - high level"] -->|depends on| DAO["MySqlDao - low level"]
    end
    subgraph Inverted ["DIP - Correct"]
        OS2["OrderService - high level"] -->|depends on| IFACE["OrderRepository - interface"]
        IMPL["PostgresRepo - low level"] -->|implements| IFACE
    end`,
    },
    {
      title: "Dependency Injection Flow",
      kind: "sequence",
      caption: "Constructor injection: the composition root creates concrete dependencies and injects them into the high-level module at startup.",
      mermaid: `sequenceDiagram
    participant Main as Composition Root
    participant Repo as PostgresOrderRepo
    participant Svc as OrderService
    participant Client
    Main->>Repo: new PostgresOrderRepo
    Main->>Svc: new OrderService with repo
    Client->>Svc: placeOrder
    Svc->>Repo: save order via interface
    Repo-->>Svc: saved
    Svc-->>Client: order placed`,
    },
    {
      title: "Hexagonal Architecture Ports and Adapters",
      kind: "architecture",
      caption: "Domain core defines ports as interfaces. Adapters in the infrastructure layer implement those ports. All dependencies point inward toward the domain.",
      mermaid: `graph LR
    subgraph Domain ["Domain Core"]
        D["Business Logic"]
        P1["OrderRepository - port"]
        P2["EventPublisher - port"]
    end
    subgraph Adapters ["Infrastructure Adapters"]
        A1["PostgresOrderRepo - implements port"]
        A2["KafkaEventPublisher - implements port"]
        A3["REST API Controller - drives domain"]
    end
    A1 -->|implements| P1
    A2 -->|implements| P2
    A3 -->|calls| D
    D --> P1
    D --> P2`,
    },
    {
      title: "DIP vs DI vs IoC",
      kind: "mindmap",
      caption: "Distinguishing the three related but distinct concepts: DIP is a principle, DI is a technique, and IoC is a broad paradigm.",
      mermaid: `mindmap
  root[Inversion Concepts]
    DIP - Principle
      Depend on abstractions
      Interface owned by high-level module
      Architectural guideline
    DI - Technique
      Provide deps from outside class
      Constructor injection preferred
      Setter and field injection also exist
      Makes deps explicit and testable
    IoC - Paradigm
      Framework calls your code
      Hollywood Principle
      DI containers implement IoC
      Event-driven systems`,
    },
  ],
  animations: [
    {
      title: "Inverting a Dependency Step by Step",
      steps: [
        { label: "Identify the coupling", detail: "High-level OrderService directly instantiates and calls MySqlOrderDao. Any change to the database technology requires changing business logic." },
        { label: "Extract interface", detail: "Create OrderRepository interface with methods matching what OrderService needs (save, findById). The interface lives in the business layer." },
        { label: "Update high-level module", detail: "Change OrderService to depend on OrderRepository (the interface) instead of MySqlOrderDao. Accept it via constructor injection." },
        { label: "Implement in low-level module", detail: "MySqlOrderDao implements OrderRepository. The low-level module now depends on the abstraction defined by the high-level module." },
        { label: "Wire in composition root", detail: "In the main/startup code, create MySqlOrderDao and inject it into OrderService. This is the only place that knows about concrete types." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "DIP (Principle)", "DI (Technique)", "IoC (Concept)", "Service Locator"],
    rows: [
      ["What is it", "Design principle: depend on abstractions", "Technique: provide dependencies from outside", "Concept: framework calls your code", "Pattern: objects request dependencies from a registry"],
      ["Level", "Architectural principle", "Implementation technique", "Broad paradigm", "Implementation pattern"],
      ["Testing", "Enables testability through abstractions", "Makes test injection easy", "N/A directly", "Harder to test (hidden dependencies)"],
      ["Explicitness", "N/A (guides structure)", "Constructor injection makes dependencies explicit", "N/A", "Dependencies are hidden in method bodies"],
      ["Container needed", "No", "Optional (manual DI works)", "Usually yes", "Yes (the locator itself)"]
    ]
  },
  interviewQA: [
    {
      q: "What is the Dependency Inversion Principle?",
      a: "DIP has two rules: (1) High-level modules should not depend on low-level modules; both should depend on abstractions. (2) Abstractions should not depend on details; details should depend on abstractions. The key insight is that the interface is owned by the high-level module, inverting the traditional dependency direction so that business logic is insulated from infrastructure changes.",
      followUps: [
        "What do you mean by 'interface ownership'?",
        "How is DIP different from DI?"
      ]
    },
    {
      q: "What is the difference between DIP, DI, and IoC?",
      a: "DIP is a design principle: depend on abstractions, not concretions. DI (Dependency Injection) is a technique for providing dependencies from outside the class, typically via constructors. IoC (Inversion of Control) is the broader concept where the framework controls the flow and calls your code (the Hollywood Principle). DI is one form of IoC. You can practice DI without following DIP (injecting concrete classes), and you can follow DIP without DI (using Service Locator, though it's less preferred).",
      followUps: [
        "Why is Service Locator less preferred than DI?",
        "What is the Hollywood Principle?"
      ]
    },
    {
      q: "What is constructor injection and why is it preferred?",
      a: "Constructor injection provides all dependencies through the class constructor. It is preferred because: (1) Dependencies are explicit and visible in the constructor signature. (2) The object is fully initialized after construction -- no partially constructed state. (3) Dependencies can be made final/readonly, ensuring immutability. (4) It is impossible to create the object without providing its dependencies, catching missing configuration at startup rather than runtime.",
      followUps: [
        "When would you use setter injection instead?",
        "What is the difference between required and optional dependencies?"
      ]
    },
    {
      q: "What is a composition root?",
      a: "The composition root is the single location in an application where the entire object graph is assembled. All concrete classes are instantiated and wired together here, typically in main() or the application startup configuration. The rest of the codebase depends only on abstractions. By confining 'new ConcreteClass()' to the composition root, you ensure DIP is followed throughout the application.",
      followUps: [
        "Should the composition root use a DI container or manual wiring?",
        "What is the 'Register, Resolve, Release' pattern?"
      ]
    },
    {
      q: "How does DIP enable the Repository pattern?",
      a: "The Repository pattern is a textbook application of DIP. The business layer defines a repository interface (e.g., OrderRepository with save(), findById()). The infrastructure layer provides implementations (PostgresOrderRepository, MongoOrderRepository). Business logic depends on the interface, not the database technology. You can switch databases, use in-memory implementations for testing, or add caching decorators -- all without changing business logic.",
      followUps: [
        "How does the Repository pattern differ from the DAO pattern?",
        "Can you combine DIP with the Decorator pattern for cross-cutting concerns?"
      ]
    }
  ],
  followUps: [
    "How does DIP relate to Hexagonal Architecture (Ports and Adapters)?",
    "What is the role of DI containers vs manual dependency injection?",
    "How does DIP apply in functional programming?",
    "What is the Service Locator anti-pattern and why is DI preferred?",
    "How do you handle circular dependencies when applying DIP?",
    "What is the composition root and where should it live?"
  ],
  mcqs: [
    {
      q: "According to DIP, who should own the abstraction (interface)?",
      options: [
        "The low-level module (infrastructure layer)",
        "The high-level module (business/domain layer)",
        "A shared library used by both",
        "The DI container"
      ],
      answerIndex: 1,
      explanation: "DIP requires that the abstraction is owned by the high-level module. The low-level module implements an interface defined by the layer that uses it, inverting the dependency direction."
    },
    {
      q: "Which of the following best describes the relationship between DIP and DI?",
      options: [
        "They are the same thing with different names",
        "DIP is a design principle; DI is a technique that helps achieve DIP",
        "DI is a principle; DIP is a technique",
        "They are completely unrelated concepts"
      ],
      answerIndex: 1,
      explanation: "DIP is the principle (depend on abstractions). DI is a technique (inject dependencies from outside) that helps implement DIP. You can use DI without DIP and vice versa."
    },
    {
      q: "Why is constructor injection preferred over setter injection?",
      options: [
        "It is faster at runtime",
        "It makes dependencies explicit, ensures full initialization, and enables immutability",
        "It requires less code",
        "It is the only form supported by DI containers"
      ],
      answerIndex: 1,
      explanation: "Constructor injection makes dependencies visible in the signature, ensures the object is fully initialized after construction (no partial state), and allows fields to be final/readonly."
    },
    {
      q: "What is the composition root?",
      options: [
        "The base class of all application objects",
        "The single location where the object graph is assembled and concrete types are instantiated",
        "The root directory of the project",
        "The first method called in the application"
      ],
      answerIndex: 1,
      explanation: "The composition root is where all concrete classes are instantiated and wired together, confining 'new ConcreteClass()' to one place. The rest of the codebase depends on abstractions."
    },
    {
      q: "What is the Service Locator pattern and why is it less preferred than DI?",
      options: [
        "It is a way to discover microservices; it is preferred over DI",
        "It provides dependencies on request from a registry; dependencies are hidden and harder to test",
        "It is identical to constructor injection",
        "It is a database access pattern"
      ],
      answerIndex: 1,
      explanation: "Service Locator provides dependencies from a global registry. Dependencies are hidden inside method bodies rather than explicit in constructors, making the class harder to test and understand."
    }
  ],
  exercises: [
    "Refactor a UserService that directly instantiates MySqlUserDao and SmtpMailer into a DIP-compliant design. Define interfaces in the business layer, implement them in the infrastructure layer, and create a composition root that wires everything together.",
    "Build a notification system where the business logic can send notifications via Email, SMS, Push, or Slack. Use DIP so the business layer defines a NotificationChannel interface and the infrastructure layer provides implementations. Demonstrate swapping channels without changing business logic.",
    "Implement the Repository pattern for a Product entity with three implementations: PostgresProductRepository, InMemoryProductRepository (for tests), and CachedProductRepository (a decorator that adds caching). Show how DIP enables this flexibility.",
    "Create a payment processing service using DIP. The business layer defines PaymentGateway interface. Implement StripeGateway and MockGateway. Write unit tests using MockGateway and integration tests using StripeGateway's test mode."
  ],
  flashcards: [
    { front: "State the two rules of DIP.", back: "1) High-level modules should not depend on low-level modules; both should depend on abstractions. 2) Abstractions should not depend on details; details should depend on abstractions." },
    { front: "What is the key insight of DIP regarding interface ownership?", back: "The interface is owned by the high-level module (business layer), not the low-level module (infrastructure). The low-level module implements an interface defined by its consumer." },
    { front: "How is DIP different from DI?", back: "DIP is a design principle (depend on abstractions). DI is a technique (inject dependencies from outside, typically via constructors). DI is one way to achieve DIP." },
    { front: "What is a composition root?", back: "The single location (typically main/startup) where the entire dependency graph is assembled using concrete types. The rest of the codebase depends only on abstractions." },
    { front: "What is constructor injection?", back: "A DI technique where dependencies are provided through the class constructor. Preferred because dependencies are explicit, the object is fully initialized, and fields can be final." },
    { front: "What is Inversion of Control (IoC)?", back: "The broad concept where framework/container code calls your code (Hollywood Principle). DI is one form of IoC. It refers to inverting the traditional flow of control." },
    { front: "Why is Service Locator considered an anti-pattern?", back: "Dependencies are hidden inside method bodies (requested from a global registry) rather than declared in the constructor. This makes classes harder to test, understand, and maintain." }
  ],
  revisionNotes: [
    "DIP: high-level modules and low-level modules both depend on abstractions, not on each other.",
    "The interface is owned by the consumer (high-level module), not the provider (low-level module).",
    "DIP (principle) is not the same as DI (technique) or IoC (concept).",
    "Constructor injection is preferred: explicit, fully initialized, immutable-friendly.",
    "The composition root is the one place where concrete types are instantiated and wired.",
    "DI containers automate wiring but are optional -- manual/poor-man's DI is valid.",
    "Service Locator achieves DIP but hides dependencies; DI makes them explicit.",
    "DIP is the foundation of Hexagonal Architecture (Ports and Adapters).",
    "DIP enables testing: inject mocks/stubs via the abstractions."
  ],
  cheatSheet: [
    "Define interfaces in the business/domain layer, implement them in the infrastructure layer.",
    "Use constructor injection: pass dependencies as constructor parameters.",
    "Make injected fields final/readonly -- no reassignment after construction.",
    "Confine 'new ConcreteClass()' to the composition root (main/startup).",
    "For testing, inject mock/in-memory implementations of your abstractions.",
    "Don't inject everything -- value objects and data classes are fine to create directly.",
    "Avoid the Service Locator pattern -- prefer explicit constructor injection.",
    "DI containers are optional; manual wiring is simpler for small applications."
  ],
  resources: [
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "Chapter 11 covers DIP as the architectural driver for the dependency rule." },
    { label: "Dependency Injection Principles, Practices, and Patterns by Mark Seemann", kind: "book", note: "The definitive book on DI and DIP in practice, covering composition roots, containers, and anti-patterns." },
    { label: "Hexagonal Architecture (Alistair Cockburn)", kind: "article", note: "The Ports and Adapters pattern that builds directly on DIP." },
    { label: "Inversion of Control Containers and the Dependency Injection Pattern (Martin Fowler)", kind: "article", note: "Fowler's classic article distinguishing DI from Service Locator and IoC." },
    { label: "NestJS Documentation -- Dependency Injection", kind: "docs", note: "Practical DIP/DI implementation in a TypeScript framework." }
  ],
  glossary: [
    { term: "Dependency Inversion Principle (DIP)", definition: "High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details." },
    { term: "Dependency Injection (DI)", definition: "A technique for providing dependencies to a class from outside, typically via constructors, setters, or method parameters." },
    { term: "Inversion of Control (IoC)", definition: "A broad paradigm where the framework/container controls the flow and calls application code, inverting the traditional control flow." },
    { term: "Constructor Injection", definition: "The preferred DI form where dependencies are provided through the class constructor, making them explicit and enabling immutability." },
    { term: "Composition Root", definition: "The single location in an application where the complete dependency graph is assembled using concrete types." },
    { term: "DI Container", definition: "A framework (Spring, Guice, NestJS) that automates dependency resolution, object creation, and lifecycle management based on configuration." },
    { term: "Service Locator", definition: "A pattern where objects request dependencies from a central registry. Considered an anti-pattern because it hides dependencies." },
    { term: "Port (Hexagonal Architecture)", definition: "An interface defined by the domain core representing a capability it needs (driven port) or offers (driving port)." },
    { term: "Adapter (Hexagonal Architecture)", definition: "A concrete implementation of a port, connecting the domain core to a specific technology (database, API, messaging)." }
  ]
};
