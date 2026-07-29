import type { TopicContent } from "../types";

export const singleResponsibility: TopicContent = {
  quickSummary: [
    "A class should have only one reason to change -- meaning it should encapsulate exactly one responsibility or concern.",
    "SRP is about cohesion: grouping together things that change for the same reason and separating things that change for different reasons.",
    "Violations manifest as 'God classes' that mix business logic, persistence, formatting, validation, and notification in a single class.",
    "SRP applies beyond classes -- to functions, modules, microservices, and even teams (Conway's Law)."
  ],
  detailed: [
    "Robert C. Martin defines SRP as 'A class should have only one reason to change.' The 'reason to change' is tied to a stakeholder or actor: if two different stakeholders could request changes to the same class, that class has more than one responsibility. For example, a class that both calculates employee pay and formats pay reports serves the CFO and the COO -- two distinct actors.",
    "Identifying responsibilities requires understanding the domain. A common heuristic is to describe what a class does in one sentence without using 'and' or 'or'. If you cannot, it likely has multiple responsibilities. Another heuristic: if changes requested by different teams or stakeholders would touch the same class, it violates SRP.",
    "SRP does not mean a class should have only one method. A class with multiple methods can still have a single responsibility if all methods contribute to the same concern. For example, a UserRepository with findById(), findByEmail(), save(), and delete() has a single responsibility: user persistence.",
    "Common SRP violations include: classes that perform both business logic and database access, services that both process data and send notifications, controllers that contain validation logic and response formatting, and entities that include serialization logic. Refactoring involves extracting each responsibility into its own class.",
    "SRP scales to architecture: microservices should have a single bounded context, modules should encapsulate one feature area, and functions should do one thing. Conway's Law -- 'organizations produce designs that mirror their communication structures' -- is the organizational analog of SRP."
  ],
  deepDive: [
    "The subtlety of SRP lies in defining 'responsibility' correctly. Two pieces of code might look similar but serve different actors. Martin's classic example: an Employee class with calculatePay() (serves accounting), reportHours() (serves operations), and save() (serves DBA). Even though they all operate on Employee data, they change for different reasons. The risk: a shared helper used by both calculatePay() and reportHours() gets modified for accounting needs and silently breaks operations reporting.",
    "Over-applying SRP leads to class explosion and 'ravioli code' -- dozens of tiny classes where understanding a feature requires tracing through many files. The antidote is to apply SRP at the right level of granularity. Within a module, some coupling is acceptable and even desirable for readability. SRP should be applied most aggressively at module and service boundaries, where coupling costs are highest.",
    "SRP intersects with the Facade pattern: when decomposition creates many small classes, a Facade can provide a unified interface to clients while maintaining internal separation of concerns. It also relates to the Mediator pattern, which coordinates interactions between decomposed classes without them knowing about each other.",
    "In functional programming, SRP manifests as function composition: each function does one thing, and complex behavior emerges from composing simple functions. Monads in Haskell and pipes in Unix exemplify this -- small, focused units composed into powerful pipelines."
  ],
  code: [
    {
      language: "java",
      caption: "SRP violation: Employee class with mixed responsibilities",
      source: `// VIOLATION: This class has three reasons to change
// 1. Pay calculation rules change (accounting)
// 2. Hour reporting format changes (operations)
// 3. Database schema changes (DBA)
public class Employee {
    private String name;
    private double hourlyRate;
    private List<WorkLog> workLogs;

    // Responsibility 1: Business logic (pay calculation)
    public double calculatePay() {
        double totalHours = workLogs.stream()
            .mapToDouble(WorkLog::getHours)
            .sum();
        double overtimeHours = Math.max(0, totalHours - 40);
        double regularHours = totalHours - overtimeHours;
        return (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
    }

    // Responsibility 2: Reporting (formatting)
    public String generateHoursReport() {
        StringBuilder sb = new StringBuilder();
        sb.append("Hours Report for ").append(name).append("\\n");
        sb.append("=".repeat(40)).append("\\n");
        for (WorkLog log : workLogs) {
            sb.append(String.format("%s: %.1f hours%n", log.getDate(), log.getHours()));
        }
        sb.append(String.format("Total: %.1f hours%n",
            workLogs.stream().mapToDouble(WorkLog::getHours).sum()));
        return sb.toString();
    }

    // Responsibility 3: Persistence
    public void save() {
        Connection conn = DriverManager.getConnection(DB_URL);
        PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO employees (name, hourly_rate) VALUES (?, ?)"
        );
        ps.setString(1, name);
        ps.setDouble(2, hourlyRate);
        ps.executeUpdate();
    }
}`
    },
    {
      language: "java",
      caption: "Refactored: Each responsibility in its own class",
      source: `// Employee is now a pure domain entity
public class Employee {
    private final String id;
    private final String name;
    private final double hourlyRate;
    private final List<WorkLog> workLogs;

    public Employee(String id, String name, double hourlyRate, List<WorkLog> workLogs) {
        this.id = id;
        this.name = name;
        this.hourlyRate = hourlyRate;
        this.workLogs = List.copyOf(workLogs);
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public double getHourlyRate() { return hourlyRate; }
    public List<WorkLog> getWorkLogs() { return workLogs; }
}

// Responsibility 1: Pay calculation
public class PayCalculator {
    private static final double OVERTIME_THRESHOLD = 40.0;
    private static final double OVERTIME_MULTIPLIER = 1.5;

    public double calculatePay(Employee employee) {
        double totalHours = employee.getWorkLogs().stream()
            .mapToDouble(WorkLog::getHours)
            .sum();
        double overtimeHours = Math.max(0, totalHours - OVERTIME_THRESHOLD);
        double regularHours = totalHours - overtimeHours;
        return (regularHours * employee.getHourlyRate())
             + (overtimeHours * employee.getHourlyRate() * OVERTIME_MULTIPLIER);
    }
}

// Responsibility 2: Reporting
public class HoursReportGenerator {
    public String generate(Employee employee) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hours Report for ").append(employee.getName()).append("\\n");
        sb.append("=".repeat(40)).append("\\n");
        for (WorkLog log : employee.getWorkLogs()) {
            sb.append(String.format("%s: %.1f hours%n", log.getDate(), log.getHours()));
        }
        double total = employee.getWorkLogs().stream()
            .mapToDouble(WorkLog::getHours).sum();
        sb.append(String.format("Total: %.1f hours%n", total));
        return sb.toString();
    }
}

// Responsibility 3: Persistence
public class EmployeeRepository {
    private final DataSource dataSource;

    public EmployeeRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void save(Employee employee) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "INSERT INTO employees (id, name, hourly_rate) VALUES (?, ?, ?)")) {
            ps.setString(1, employee.getId());
            ps.setString(2, employee.getName());
            ps.setDouble(3, employee.getHourlyRate());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new PersistenceException("Failed to save employee", e);
        }
    }

    public Optional<Employee> findById(String id) {
        // ... query and map to Employee
    }
}`
    },
    {
      language: "typescript",
      caption: "SRP applied to a Node.js service layer",
      source: `// BEFORE: One service does everything
class OrderService {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Validates input
    if (!dto.items.length) throw new Error("Order must have items");
    if (!dto.customerId) throw new Error("Customer required");

    // Calculates totals
    const subtotal = dto.items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    // Persists to database
    const order = await db.orders.create({ ...dto, subtotal, tax, total });

    // Sends confirmation email
    await sendEmail(dto.customerEmail, "Order Confirmed", \`Order #\${order.id}\`);

    // Publishes analytics event
    await analytics.track("order_created", { orderId: order.id, total });

    return order;
  }
}

// AFTER: Each concern in its own class
class OrderValidator {
  validate(dto: CreateOrderDto): void {
    if (!dto.items.length) throw new ValidationError("Order must have items");
    if (!dto.customerId) throw new ValidationError("Customer required");
  }
}

class OrderPricingService {
  private readonly taxRate = 0.08;

  calculate(items: OrderItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * this.taxRate;
    return { subtotal, tax, total: subtotal + tax };
  }
}

class OrderRepository {
  async save(order: Omit<Order, "id">): Promise<Order> {
    return db.orders.create(order);
  }
}

class OrderNotificationService {
  async sendConfirmation(email: string, orderId: string): Promise<void> {
    await sendEmail(email, "Order Confirmed", \`Order #\${orderId}\`);
  }
}

class OrderAnalyticsService {
  async trackCreation(orderId: string, total: number): Promise<void> {
    await analytics.track("order_created", { orderId, total });
  }
}

// Orchestrator composes the single-responsibility classes
class OrderService {
  constructor(
    private validator: OrderValidator,
    private pricing: OrderPricingService,
    private repo: OrderRepository,
    private notifications: OrderNotificationService,
    private analyticsService: OrderAnalyticsService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    this.validator.validate(dto);
    const pricing = this.pricing.calculate(dto.items);
    const order = await this.repo.save({ ...dto, ...pricing });
    // Fire-and-forget side effects
    Promise.allSettled([
      this.notifications.sendConfirmation(dto.customerEmail, order.id),
      this.analyticsService.trackCreation(order.id, pricing.total),
    ]);
    return order;
  }
}`
    }
  ],
  diagrams: [
    {
      title: "SRP Refactoring: Before and After",
      kind: "architecture",
      caption: "Shows a monolithic Employee class being decomposed into Employee (domain), PayCalculator (logic), HoursReportGenerator (formatting), and EmployeeRepository (persistence)."
    },
    {
      title: "Responsibility Identification Flow",
      kind: "flow",
      caption: "Decision flow: identify actors/stakeholders, map each to the code they would request changes to, group co-changing code, separate independently-changing code."
    }
  ],
  animations: [
    {
      title: "Refactoring a God Class Step by Step",
      steps: [
        { label: "Identify Actors", detail: "List all stakeholders who could request changes to the class. E.g., for Employee: Accounting, Operations, DBA." },
        { label: "Map Responsibilities", detail: "For each actor, highlight the methods and fields they 'own'. Color-code or annotate the class to visualize responsibility boundaries." },
        { label: "Extract Classes", detail: "Create a new class for each responsibility. Move the relevant methods and fields. The original class retains only domain data." },
        { label: "Wire Dependencies", detail: "Use dependency injection to provide the new classes where the old monolithic class was used. Update callers to use the specific collaborator they need." },
        { label: "Verify", detail: "Run existing tests (they should still pass if behavior is preserved). Add unit tests for each new class in isolation. Check that each class now has exactly one reason to change." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "SRP Applied", "SRP Violated (God Class)"],
    rows: [
      ["Class size", "Small, focused classes (50-200 lines typical)", "Large classes (500+ lines) with many unrelated methods"],
      ["Testability", "Each class tested in isolation with focused test suites", "Tests require complex setup; hard to test one concern without others"],
      ["Change impact", "Changing one concern only affects its class and direct dependents", "Any change risks breaking unrelated functionality"],
      ["Team collaboration", "Different developers can work on different responsibilities without conflicts", "Merge conflicts and coordination overhead on shared files"],
      ["Reusability", "Individual classes reusable in different contexts", "Must take the whole class even if only one feature is needed"],
      ["Readability", "Clear purpose from class name; easy to understand", "Must read entire class to understand what it does"],
      ["Dependency count", "Few, focused dependencies per class", "Many dependencies pulling in unrelated concerns"]
    ]
  },
  interviewQA: [
    {
      q: "What does the Single Responsibility Principle mean?",
      a: "SRP states that a class should have only one reason to change. This means it should serve a single actor or stakeholder. If two different stakeholders could independently request changes that affect the same class, that class has more than one responsibility and should be decomposed. The principle is about aligning code structure with organizational change drivers.",
      followUps: [
        "Who coined SRP and how has the definition evolved?",
        "How do you identify the 'actors' a class serves?"
      ]
    },
    {
      q: "Can you give a real-world example of an SRP violation and how to fix it?",
      a: "A classic example is a UserService that handles user registration, password hashing, email verification, profile updates, and user search. Registration logic changes when business rules change. Password hashing changes when security requirements change. Email changes when the mail provider changes. Fix: extract PasswordHasher, EmailVerificationService, UserProfileService, and UserSearchService. The UserService becomes a thin orchestrator or is eliminated entirely.",
      followUps: [
        "How do you prevent the orchestrator from becoming a God class itself?",
        "Is it okay for the orchestrator to know about all the extracted classes?"
      ]
    },
    {
      q: "Does SRP mean a class should have only one method?",
      a: "No. SRP means one responsibility, not one method. A class can have many methods as long as they all serve the same concern. For example, a UserRepository with findById(), findByEmail(), save(), delete(), and findAll() has multiple methods but a single responsibility: user persistence. The test is whether all methods change for the same reason, not how many there are.",
      followUps: [
        "How do you determine if two methods belong to the same responsibility?",
        "What is cohesion and how does it relate to SRP?"
      ]
    },
    {
      q: "How does SRP relate to microservices architecture?",
      a: "SRP scales to the service level in microservices. Each microservice should own a single bounded context from Domain-Driven Design. A service handling both order processing and inventory management violates SRP at the service level -- these concerns change for different reasons and at different rates. This is also why Conway's Law is relevant: team boundaries should align with responsibility boundaries.",
      followUps: [
        "What is a bounded context?",
        "Can SRP be applied too aggressively in microservices (nano-services)?"
      ]
    },
    {
      q: "What are the signs that a class violates SRP?",
      a: "Key indicators: (1) The class has many imports from different domains (database, HTTP, email libraries). (2) You cannot describe what the class does without using 'and'. (3) Changes to unrelated features require modifying the same class. (4) The class has groups of methods that use different subsets of its fields. (5) Test setup is complex because you must mock many unrelated dependencies. (6) Multiple developers frequently have merge conflicts on the same file.",
      followUps: [
        "Is there a quantitative metric for SRP violations?",
        "What is LCOM (Lack of Cohesion of Methods)?"
      ]
    },
    {
      q: "What are the risks of over-applying SRP?",
      a: "Over-applying SRP leads to 'ravioli code' -- many tiny classes where understanding a feature requires tracing through numerous files. It can make code harder to read, increase indirection, and slow down development for simple features. The key is applying SRP at the right granularity: aggressively at module and service boundaries where coupling costs are high, more relaxed within a single module where a few related concerns can coexist for readability.",
      followUps: [
        "How do you find the right level of granularity?",
        "What is the Facade pattern's role in managing decomposition?"
      ]
    }
  ],
  followUps: [
    "How does SRP relate to the other SOLID principles?",
    "What is the relationship between SRP and cohesion metrics like LCOM?",
    "How does Domain-Driven Design's bounded context concept relate to SRP?",
    "When does extracting a responsibility into its own class hurt more than it helps?",
    "How should SRP guide package/module structure in a large codebase?",
    "What role does the Facade pattern play when SRP leads to many small classes?"
  ],
  mcqs: [
    {
      q: "According to Robert C. Martin, what does 'one reason to change' refer to in SRP?",
      options: [
        "The class should only have one method",
        "The class should serve exactly one actor or stakeholder",
        "The class should only use one external dependency",
        "The class should only be modified once during its lifetime"
      ],
      answerIndex: 1,
      explanation: "Martin defines 'reason to change' as being tied to a specific actor or stakeholder. Different actors requesting changes constitute different reasons to change."
    },
    {
      q: "Which of the following is a clear SRP violation?",
      options: [
        "A UserRepository class with findById(), save(), and delete() methods",
        "An InvoiceService that calculates totals, generates PDFs, and sends emails",
        "A DateFormatter with format(), parse(), and validate() methods",
        "A Logger class with log(), warn(), and error() methods"
      ],
      answerIndex: 1,
      explanation: "InvoiceService serves three different concerns: business logic (calculation), document generation (PDF), and communication (email). Each could change independently."
    },
    {
      q: "What is 'ravioli code'?",
      options: [
        "Code with circular dependencies",
        "Code with too many tiny classes from over-applying SRP, making it hard to follow the flow",
        "Code written in Italian-style naming conventions",
        "Code with deeply nested if/else statements"
      ],
      answerIndex: 1,
      explanation: "Ravioli code results from excessive decomposition where each piece is small and encapsulated, but understanding the whole requires tracing through many files."
    },
    {
      q: "How does SRP relate to cohesion?",
      options: [
        "SRP increases coupling between classes",
        "SRP is unrelated to cohesion",
        "SRP promotes high cohesion by grouping things that change together",
        "SRP reduces cohesion to minimize class size"
      ],
      answerIndex: 2,
      explanation: "SRP and cohesion are closely related. A class with a single responsibility has high cohesion -- all its methods and fields work together toward the same concern."
    },
    {
      q: "Which design pattern helps manage the complexity that arises from applying SRP?",
      options: [
        "Singleton",
        "Facade",
        "Prototype",
        "Flyweight"
      ],
      answerIndex: 1,
      explanation: "The Facade pattern provides a unified interface to a set of decomposed classes, hiding the complexity of SRP-driven decomposition from clients."
    },
    {
      q: "At the architectural level, SRP most closely aligns with which DDD concept?",
      options: [
        "Value Object",
        "Aggregate Root",
        "Bounded Context",
        "Domain Event"
      ],
      answerIndex: 2,
      explanation: "A Bounded Context encapsulates a single area of the domain model, analogous to how SRP encapsulates a single responsibility. Each microservice should map to one bounded context."
    }
  ],
  exercises: [
    "Take an existing 'God class' from your codebase (or create a UserService that handles registration, authentication, profile management, and notification sending) and refactor it into separate single-responsibility classes. Document the actors/stakeholders that drove your decomposition decisions.",
    "Analyze three classes in an open-source project and categorize their responsibilities. For each, determine whether the class has one or multiple reasons to change, and propose a refactoring if needed.",
    "Build an order processing pipeline where each step (validation, pricing, persistence, notification, analytics) is a separate class. Wire them together using dependency injection and demonstrate how each can be tested in isolation.",
    "Calculate the LCOM (Lack of Cohesion of Methods) metric for a class you suspect violates SRP. Explain what the metric reveals about the class's cohesion."
  ],
  flashcards: [
    { front: "What is the Single Responsibility Principle?", back: "A class should have only one reason to change -- it should serve a single actor or stakeholder whose requirements could drive modifications." },
    { front: "What is a 'God class'?", back: "A class that has accumulated too many responsibilities, becoming large, hard to test, and frequently modified for unrelated reasons. It is the most common SRP violation." },
    { front: "What is the difference between SRP and 'a class should do one thing'?", back: "SRP is about reasons to change (tied to actors/stakeholders), not about the number of methods. A class with many methods can still have a single responsibility if all methods serve the same concern." },
    { front: "What is cohesion?", back: "The degree to which the elements of a module (methods, fields) belong together. High cohesion means all elements serve the same responsibility. SRP promotes high cohesion." },
    { front: "What is LCOM?", back: "Lack of Cohesion of Methods -- a metric that measures how related the methods of a class are based on shared field usage. High LCOM suggests multiple responsibilities." },
    { front: "What is Conway's Law?", back: "Organizations design systems that mirror their own communication structures. This is the organizational analog of SRP: team boundaries should align with responsibility boundaries." },
    { front: "What is 'ravioli code'?", back: "The result of over-applying SRP: many tiny classes that are individually well-focused but collectively hard to follow, requiring tracing through numerous files to understand a feature." }
  ],
  revisionNotes: [
    "SRP: a class should have one reason to change, meaning it serves one actor/stakeholder.",
    "Identify responsibilities by listing who could request changes -- each distinct actor maps to a responsibility.",
    "SRP is about cohesion: group things that change for the same reason, separate things that change for different reasons.",
    "A class can have many methods and still follow SRP if all methods serve the same concern.",
    "Common violations: mixing business logic with persistence, formatting, notification, or validation.",
    "Over-applying SRP leads to ravioli code -- use Facade to provide a unified interface when decomposition creates many classes.",
    "SRP scales: functions do one thing, classes serve one actor, modules own one feature, services own one bounded context.",
    "LCOM metric quantifies cohesion: high LCOM suggests SRP violations."
  ],
  cheatSheet: [
    "Can you describe the class in one sentence without 'and'? If not, it likely violates SRP.",
    "List the actors/stakeholders -- each one that could request changes is a responsibility.",
    "Extract each responsibility into its own class with a clear, specific name.",
    "Use dependency injection to compose single-responsibility classes.",
    "A Facade can simplify the interface when decomposition creates many classes.",
    "SRP applies at every level: function, class, module, service.",
    "High cohesion = good SRP adherence. Measure with LCOM if needed.",
    "Watch for signs: many imports, frequent merge conflicts, complex test setup."
  ],
  resources: [
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "Chapter 7 covers SRP with the definitive actor-based definition." },
    { label: "Agile Software Development by Robert C. Martin", kind: "book", note: "Original detailed treatment of SRP as part of SOLID principles." },
    { label: "The Single Responsibility Principle (blog post by Uncle Bob)", kind: "article", note: "Martin's own clarification of common SRP misunderstandings." },
    { label: "Refactoring: Improving the Design of Existing Code by Martin Fowler", kind: "book", note: "Provides concrete refactoring techniques for decomposing classes." },
    { label: "SOLID Principles in 100 Seconds (Fireship)", kind: "video", note: "Quick visual overview of all SOLID principles including SRP." }
  ],
  glossary: [
    { term: "Single Responsibility Principle (SRP)", definition: "A class should have only one reason to change, meaning it should serve exactly one actor or stakeholder." },
    { term: "Actor / Stakeholder", definition: "A person or group who could request changes to the software. Each actor's needs define a distinct responsibility." },
    { term: "Cohesion", definition: "The degree to which elements of a module belong together and serve the same purpose. High cohesion correlates with SRP adherence." },
    { term: "God Class", definition: "An anti-pattern where a single class accumulates too many responsibilities, becoming large, tightly coupled, and hard to maintain." },
    { term: "LCOM (Lack of Cohesion of Methods)", definition: "A metric measuring how related a class's methods are based on shared instance variable usage. High LCOM suggests low cohesion and potential SRP violation." },
    { term: "Ravioli Code", definition: "Code with many tiny, well-encapsulated classes that are individually focused but collectively hard to trace and understand." },
    { term: "Conway's Law", definition: "The observation that system designs tend to mirror the communication structures of the organizations that produce them." },
    { term: "Bounded Context", definition: "A DDD concept defining a boundary within which a particular domain model applies. Analogous to SRP at the service/module level." }
  ]
};
