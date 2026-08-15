import type { TopicContent } from "../types";

export const openClosed: TopicContent = {
  quickSummary: [
    "Software entities (classes, modules, functions) should be open for extension but closed for modification.",
    "New behavior should be added by writing new code (new classes, new implementations), not by changing existing, tested code.",
    "OCP is achieved primarily through abstraction and polymorphism -- Strategy, Template Method, and plugin architectures.",
    "Violating OCP means every new feature or variation requires modifying existing code, increasing regression risk."
  ],
  detailed: [
    "Bertrand Meyer first stated OCP in 1988: a module is 'open' if it is available for extension (new behavior can be added) and 'closed' if it is available for use by other modules with a stable, well-defined interface. Robert C. Martin later reframed it around polymorphic abstraction: depend on abstractions, and extend behavior by providing new implementations.",
    "The most common OCP violation is a function with a growing switch/case or if/else chain that checks a type discriminator. Every new type requires modifying the function. The fix: define an interface with the varying behavior, have each type implement it, and use polymorphic dispatch instead of conditionals.",
    "The Strategy pattern achieves OCP by extracting variable behavior into interchangeable strategy objects behind a common interface. The context class is closed for modification -- it delegates to whatever strategy is injected. New strategies are added without touching existing code.",
    "The Template Method pattern achieves OCP through inheritance: the base class defines the algorithm skeleton with abstract hook methods. Subclasses override the hooks to customize behavior without modifying the template. This is OCP via inheritance rather than composition.",
    "Plugin architectures are OCP at the system level. The core application defines extension points (interfaces or abstract classes). Plugins implement these interfaces and are discovered at runtime (via classpath scanning, configuration files, or dynamic loading). Examples: IDE plugins (VS Code extensions), build tool plugins (Maven, Webpack), middleware pipelines (Express.js, ASP.NET)."
  ],
  deepDive: [
    "OCP does not mean you never modify existing code. It means you design strategic extension points where you anticipate variation. You cannot predict every future requirement, so the key is identifying the axes of change that are most likely. Applying OCP everywhere leads to over-engineering; applying it nowhere leads to fragile code. Experience and domain knowledge guide where to invest in abstractions.",
    "The relationship between OCP and polymorphism is foundational. In languages with static typing (Java, TypeScript), interfaces and abstract classes define the contracts that enable extension. In dynamically typed languages (Python, Ruby), duck typing provides implicit OCP -- any object with the expected methods can be substituted. However, explicit interfaces still provide documentation and tooling benefits.",
    "OCP connects deeply with other SOLID principles. The Liskov Substitution Principle ensures that new extensions (subclasses/implementations) can truly substitute for the abstractions they extend. The Dependency Inversion Principle provides the mechanism (depending on abstractions) that makes OCP possible. SRP ensures each extension point has a clear, focused purpose.",
    "In functional programming, OCP manifests through higher-order functions and function composition. A function that accepts a callback or strategy function is open for extension (pass a new function) and closed for modification (the higher-order function itself doesn't change). Clojure's multimethods and protocols, or Haskell's type classes, provide more structured extension mechanisms."
  ],
  code: [
    {
      language: "java",
      caption: "OCP violation: growing if/else chain for discount calculation",
      source: `// VIOLATION: Adding a new customer type requires modifying this method
public class DiscountCalculator {
    public double calculateDiscount(Order order, String customerType) {
        double discount = 0;

        if ("regular".equals(customerType)) {
            discount = order.getTotal() > 100 ? 0.05 : 0;
        } else if ("premium".equals(customerType)) {
            discount = 0.10;
        } else if ("vip".equals(customerType)) {
            discount = 0.15;
            if (order.getTotal() > 500) {
                discount = 0.20;
            }
        } else if ("employee".equals(customerType)) {
            discount = 0.30;
        }
        // Every new customer type: add another else-if here...

        return order.getTotal() * discount;
    }
}`
    },
    {
      language: "java",
      caption: "OCP applied: Strategy pattern with polymorphic discount strategies",
      source: `// Step 1: Define the abstraction (extension point)
public interface DiscountStrategy {
    double calculateDiscount(Order order);
}

// Step 2: Implement concrete strategies (each can be added without modifying existing code)
public class RegularDiscount implements DiscountStrategy {
    @Override
    public double calculateDiscount(Order order) {
        return order.getTotal() > 100 ? order.getTotal() * 0.05 : 0;
    }
}

public class PremiumDiscount implements DiscountStrategy {
    @Override
    public double calculateDiscount(Order order) {
        return order.getTotal() * 0.10;
    }
}

public class VipDiscount implements DiscountStrategy {
    @Override
    public double calculateDiscount(Order order) {
        double rate = order.getTotal() > 500 ? 0.20 : 0.15;
        return order.getTotal() * rate;
    }
}

public class EmployeeDiscount implements DiscountStrategy {
    @Override
    public double calculateDiscount(Order order) {
        return order.getTotal() * 0.30;
    }
}

// Step 3: Context is closed for modification -- delegates to the injected strategy
public class DiscountCalculator {
    private final DiscountStrategy strategy;

    public DiscountCalculator(DiscountStrategy strategy) {
        this.strategy = strategy;
    }

    public double calculateDiscount(Order order) {
        return strategy.calculateDiscount(order);
    }
}

// Step 4: Factory or registry maps customer types to strategies
public class DiscountStrategyFactory {
    private static final Map<String, Supplier<DiscountStrategy>> REGISTRY = Map.of(
        "regular",  RegularDiscount::new,
        "premium",  PremiumDiscount::new,
        "vip",      VipDiscount::new,
        "employee", EmployeeDiscount::new
    );

    public static DiscountStrategy forCustomerType(String type) {
        Supplier<DiscountStrategy> supplier = REGISTRY.get(type);
        if (supplier == null) {
            throw new IllegalArgumentException("Unknown customer type: " + type);
        }
        return supplier.get();
    }

    // Extension: new types can be registered at runtime
    public static void register(String type, Supplier<DiscountStrategy> supplier) {
        REGISTRY.put(type, supplier);
    }
}`
    },
    {
      language: "typescript",
      caption: "OCP with middleware pipeline (Express-style)",
      source: `// The pipeline framework is closed for modification.
// New behaviors are added by writing new middleware (extension).

type Context = { request: Request; response: Response; data: Record<string, unknown> };
type NextFn = () => Promise<void>;
type Middleware = (ctx: Context, next: NextFn) => Promise<void>;

class Pipeline {
  private middlewares: Middleware[] = [];

  // Open for extension: add new middleware without modifying Pipeline
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(ctx: Context): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const mw = this.middlewares[index++];
        await mw(ctx, next);
      }
    };
    await next();
  }
}

// Extension: each middleware is a new class/function, no modification to Pipeline
const loggingMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  console.log(\`[\${ctx.request.method}] \${ctx.request.url}\`);
  await next();
  console.log(\`Completed in \${Date.now() - start}ms\`);
};

const authMiddleware: Middleware = async (ctx, next) => {
  const token = ctx.request.headers.get("Authorization");
  if (!token) {
    ctx.response = new Response("Unauthorized", { status: 401 });
    return; // short-circuit, don't call next
  }
  ctx.data.user = await verifyToken(token);
  await next();
};

const rateLimitMiddleware: Middleware = async (ctx, next) => {
  const ip = ctx.request.headers.get("X-Forwarded-For") ?? "unknown";
  if (await isRateLimited(ip)) {
    ctx.response = new Response("Too Many Requests", { status: 429 });
    return;
  }
  await next();
};

// Compose the pipeline -- adding new middleware is pure extension
const pipeline = new Pipeline()
  .use(loggingMiddleware)
  .use(rateLimitMiddleware)
  .use(authMiddleware);`
    }
  ],
  diagrams: [
    {
      title: "OCP via Strategy Pattern",
      kind: "architecture",
      caption: "Context depends on an abstract Strategy interface. New strategies extend without modifying Context.",
      mermaid: `graph TD
    Context["Context\nuses Strategy"] -->|depends on| Strategy["Strategy Interface\nexecute"]
    Strategy --> S1["ConcreteStrategy A\nexecute impl"]
    Strategy --> S2["ConcreteStrategy B\nexecute impl"]
    Strategy --> S3["NEW ConcreteStrategy C\nexecute impl"]
    Context -->|no change needed| Note1["Context closed for modification"]
    S3 -->|add without touching| Note2["Open for extension"]`,
    },
    {
      title: "Plugin Architecture Extension Flow",
      kind: "flow",
      caption: "Core defines extension points; plugins implement interfaces; registry loads them at runtime.",
      mermaid: `flowchart TD
    A["Core defines plugin interface"] --> B["Plugin implements interface"]
    B --> C["Plugin registered in registry"]
    C --> D["Application starts"]
    D --> E["Registry discovers plugins"]
    E --> F["Core delegates to loaded plugins"]
    F --> G{"New plugin needed?"}
    G -->|Yes| H["Write new plugin class"]
    H --> B
    G -->|No| I["Core unchanged"]`,
    },
    {
      title: "OCP Violation vs Compliance",
      kind: "sequence",
      caption: "Shows the difference between violating OCP with if/else chains and complying via polymorphism.",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant Bad as Violation if-else
    participant Good as OCP-Compliant

    Note over Dev,Bad: Adding new discount type - VIOLATION
    Dev->>Bad: add STUDENT discount
    Bad->>Bad: modify calculateDiscount method
    Bad->>Bad: add new else-if branch
    Note over Bad: Existing code modified - risk of regression

    Note over Dev,Good: Adding new discount type - OCP
    Dev->>Good: create StudentDiscount class
    Good->>Good: implements DiscountStrategy
    Dev->>Good: register in DI container
    Note over Good: No existing code modified`,
    },
    {
      title: "Open-Closed Principle Patterns",
      kind: "mindmap",
      caption: "Design patterns that enable extension without modification.",
      mermaid: `mindmap
    root["Open-Closed Principle"]
      Design Patterns
        Strategy runtime behavior swap
        Template Method hook methods
        Decorator wrap without changing
        Observer add listeners
      Extension Mechanisms
        Interfaces and abstract classes
        Plugin registries
        Dependency injection
        Event systems
      Code Smells Suggesting Violation
        Long if-else or switch on type
        instanceof chains
        Hardcoded enum checks`,
    },
  ],
  animations: [
    {
      title: "Adding a New Feature with OCP",
      steps: [
        { label: "Identify Variation Point", detail: "Recognize that a new type of discount/behavior/handler is needed. In a well-designed system, an extension point (interface) already exists." },
        { label: "Create New Implementation", detail: "Write a new class implementing the existing interface. No existing classes are opened or modified." },
        { label: "Register/Inject", detail: "Register the new implementation in a factory, DI container, or plugin registry. The core system discovers it automatically." },
        { label: "Verify", detail: "Run existing tests -- they should all pass because no existing code was changed. Write new tests for the new implementation." },
        { label: "Deploy", detail: "The new feature is live. Existing behavior is unchanged because existing code was not touched." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "Open for Extension", "Closed for Modification", "Violation"],
    rows: [
      ["New behavior", "Add a new class implementing the interface", "Existing classes remain unchanged", "Modify existing if/else or switch/case"],
      ["Testing", "Only new code needs new tests", "Existing tests remain valid", "All tests must be re-run; risk of regression"],
      ["Deployment", "Can deploy new implementations independently", "Core module unchanged, no redeployment needed", "Must redeploy the modified core"],
      ["Risk", "Low -- isolated change", "Zero -- nothing changes", "High -- modifying tested code"],
      ["Mechanism", "Interfaces, abstract classes, callbacks", "Stable contracts, encapsulation", "Concrete dependencies, type checking"]
    ]
  },
  interviewQA: [
    {
      q: "What is the Open/Closed Principle?",
      a: "OCP states that software entities should be open for extension (new behavior can be added) but closed for modification (existing code should not change to accommodate new features). It is achieved through abstraction: define interfaces at variation points, and add new behavior by implementing those interfaces rather than modifying existing code.",
      followUps: [
        "Who first stated OCP and how did the definition evolve?",
        "Is OCP always achievable?"
      ]
    },
    {
      q: "How do you achieve OCP in practice?",
      a: "The primary mechanisms are: (1) Strategy pattern -- extract varying behavior into interchangeable objects behind a common interface. (2) Template Method -- define an algorithm skeleton with overridable hooks. (3) Plugin/middleware architectures -- the core defines extension points, new behavior is loaded dynamically. (4) Higher-order functions -- accept behavior as a parameter. (5) Dependency injection -- wire in new implementations without modifying consumers.",
      followUps: [
        "Which approach do you prefer, Strategy or Template Method, and why?",
        "How do middleware pipelines exemplify OCP?"
      ]
    },
    {
      q: "What is the relationship between OCP and polymorphism?",
      a: "Polymorphism is the primary enabler of OCP. By depending on abstractions (interfaces/abstract classes) and using polymorphic dispatch, the core code works with any implementation without knowing the concrete type. New implementations extend behavior without modifying the core. Without polymorphism, you would need conditionals to handle each variation, which violates OCP.",
      followUps: [
        "How does duck typing in dynamic languages relate to OCP?",
        "Can you achieve OCP without inheritance or interfaces?"
      ]
    },
    {
      q: "When should you NOT apply OCP?",
      a: "OCP should not be applied preemptively everywhere -- that leads to over-engineering with unnecessary abstractions. Apply it when you identify a clear axis of change: a place where new variations are likely to be needed. If a piece of logic has been stable for years and shows no sign of needing extension, adding an interface 'just in case' adds complexity without benefit. The YAGNI principle provides a counterbalance.",
      followUps: [
        "How do you identify axes of change?",
        "What is speculative generality and how does it relate to over-applying OCP?"
      ]
    },
    {
      q: "Give a real-world example of OCP at the architectural level.",
      a: "VS Code's extension system is a textbook example. The core editor defines extension points: language providers, debugger adapters, theme interfaces, command registrations. Extensions implement these interfaces and are loaded dynamically. Adding TypeScript support, a new theme, or a Git integration requires zero changes to the VS Code core. The core is closed for modification; the extension points make it open for extension.",
      followUps: [
        "How does VS Code discover and load extensions?",
        "What are the trade-offs of a plugin architecture?"
      ]
    },
    {
      q: "How does OCP relate to the other SOLID principles?",
      a: "OCP is enabled by DIP (depend on abstractions, not concretions). LSP ensures that extensions (new implementations) are truly substitutable for the abstractions they implement. SRP ensures each extension point has a focused purpose. ISP ensures the extension interfaces are not bloated, making them easier to implement. Together, the SOLID principles form a cohesive design philosophy.",
      followUps: [
        "Can you violate OCP while following SRP?",
        "Is OCP possible without DIP?"
      ]
    }
  ],
  followUps: [
    "How do you balance OCP with YAGNI (avoiding speculative generality)?",
    "What is the role of the Factory pattern in supporting OCP?",
    "How do event-driven architectures naturally support OCP?",
    "What are the performance implications of polymorphic dispatch vs switch/case?",
    "How does aspect-oriented programming (AOP) relate to OCP?",
    "How do you retrofit OCP into legacy code with extensive conditionals?"
  ],
  mcqs: [
    {
      q: "What does 'closed for modification' mean in OCP?",
      options: [
        "The source code is read-only and cannot be edited",
        "Existing tested code should not need to change when new behavior is added",
        "The class cannot be subclassed",
        "The module cannot accept any new dependencies"
      ],
      answerIndex: 1,
      explanation: "'Closed for modification' means the existing, tested behavior should remain stable when new features are added. New behavior should come from new code, not changes to old code."
    },
    {
      q: "Which pattern most directly achieves OCP through composition?",
      options: [
        "Singleton",
        "Strategy",
        "Template Method",
        "Observer"
      ],
      answerIndex: 1,
      explanation: "Strategy uses composition: the context delegates to an interchangeable strategy object. New strategies are new implementations of the interface. Template Method achieves OCP through inheritance instead."
    },
    {
      q: "A function with a growing switch statement that checks object types is a violation of which principle?",
      options: [
        "SRP only",
        "OCP",
        "ISP",
        "DIP only"
      ],
      answerIndex: 1,
      explanation: "A growing switch on types violates OCP because adding a new type requires modifying the existing function. The fix is polymorphism: each type implements the behavior in its own class."
    },
    {
      q: "How does Template Method achieve OCP?",
      options: [
        "By using interfaces and composition",
        "By defining an algorithm skeleton with abstract hook methods that subclasses override",
        "By using runtime configuration files",
        "By applying the Decorator pattern"
      ],
      answerIndex: 1,
      explanation: "Template Method defines the algorithm in a base class with hook methods. Subclasses extend behavior by overriding hooks -- the base class (template) is closed for modification."
    },
    {
      q: "What is speculative generality?",
      options: [
        "Writing documentation before code",
        "Creating abstractions and extension points for variations that may never be needed",
        "Using generics in statically typed languages",
        "Predicting user requirements before gathering them"
      ],
      answerIndex: 1,
      explanation: "Speculative generality is the anti-pattern of over-applying OCP: creating interfaces and abstract classes 'just in case' future extensions are needed, adding complexity without current benefit."
    }
  ],
  exercises: [
    "Refactor a payment processing function that uses if/else chains for CreditCard, PayPal, BankTransfer, and Crypto into a Strategy-based design that follows OCP. Then add a new payment method (ApplePay) without modifying any existing classes.",
    "Design a notification system using OCP: create an interface for notification channels and implement Email, SMS, Push, and Slack channels. The system should be extensible -- adding a new channel should require zero changes to existing code.",
    "Build a file parser system that supports CSV, JSON, and XML. Use OCP so new formats (YAML, Parquet) can be added by implementing a parser interface and registering with a factory. Write tests proving existing parsers are unaffected.",
    "Implement a middleware pipeline (like Express.js) where new middleware can be plugged in without modifying the pipeline engine. Demonstrate with logging, authentication, and rate limiting middleware."
  ],
  flashcards: [
    { front: "What does 'open for extension' mean?", back: "New behavior can be added to the system -- typically by implementing an interface or extending an abstract class -- without modifying the existing codebase." },
    { front: "What does 'closed for modification' mean?", back: "Existing, tested code does not need to change when new features are added. The stable interface and behavior are preserved." },
    { front: "How does Strategy pattern achieve OCP?", back: "The context depends on an abstract strategy interface and delegates behavior to it. New strategies are new classes implementing the interface -- the context is never modified." },
    { front: "How does Template Method achieve OCP?", back: "A base class defines the algorithm skeleton with abstract hook methods. Subclasses override hooks to customize behavior without modifying the base template." },
    { front: "What is speculative generality?", back: "The anti-pattern of creating abstractions and extension points 'just in case' without a concrete need. It adds complexity without current benefit and is the risk of over-applying OCP." },
    { front: "What is a plugin architecture?", back: "A system design where the core defines extension points (interfaces) and third-party code implements them. Plugins are discovered and loaded at runtime, achieving OCP at the system level." },
    { front: "Who first stated OCP?", back: "Bertrand Meyer in 1988 (Object-Oriented Software Construction). Robert C. Martin later popularized the polymorphic interpretation as part of SOLID." }
  ],
  revisionNotes: [
    "OCP: open for extension (add new behavior), closed for modification (don't change existing code).",
    "Primary mechanism: depend on abstractions (interfaces), extend by providing new implementations.",
    "Strategy (composition) and Template Method (inheritance) are the two classic OCP enablers.",
    "Plugin and middleware architectures are OCP at the system level.",
    "Growing switch/case or if/else on types is the classic OCP violation.",
    "OCP is enabled by DIP (depend on abstractions) and protected by LSP (substitutability).",
    "Don't over-apply: YAGNI warns against speculative generality. Apply OCP at identified axes of change.",
    "Higher-order functions achieve OCP in functional programming."
  ],
  cheatSheet: [
    "Depend on interfaces, not concrete classes -- this is what makes extension possible.",
    "Use Strategy for OCP via composition; Template Method for OCP via inheritance.",
    "Factory or registry maps identifiers to implementations without modifying consumer code.",
    "Plugin architectures: define extension points, let third parties implement them.",
    "Growing if/else or switch on types? Replace with polymorphism.",
    "Don't create abstractions you don't need yet (YAGNI). Wait for the second or third variation.",
    "Middleware pipelines achieve OCP: the engine is fixed, behavior is added by appending handlers."
  ],
  resources: [
    { label: "Object-Oriented Software Construction by Bertrand Meyer", kind: "book", note: "The original source of OCP, with the inheritance-based formulation." },
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "Chapter 8 covers OCP with the polymorphic abstraction interpretation." },
    { label: "Refactoring.Guru -- Open/Closed Principle", url: "https://refactoring.guru/", kind: "article", note: "Visual explanation with before/after code examples." },
    { label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)", kind: "book", note: "Strategy and Template Method patterns that enable OCP." },
    { label: "The Open-Closed Principle (Robert C. Martin, 1996)", kind: "paper", note: "Martin's seminal article reframing OCP around polymorphic abstraction." }
  ],
  glossary: [
    { term: "Open/Closed Principle (OCP)", definition: "Software entities should be open for extension (new behavior can be added) but closed for modification (existing code should not change)." },
    { term: "Extension Point", definition: "An interface or abstract class that defines where new behavior can be plugged into a system. The contract is stable; implementations vary." },
    { term: "Strategy Pattern", definition: "A design pattern that encapsulates interchangeable algorithms behind a common interface, enabling OCP through composition." },
    { term: "Template Method Pattern", definition: "A design pattern where a base class defines an algorithm skeleton with abstract hooks that subclasses override, enabling OCP through inheritance." },
    { term: "Plugin Architecture", definition: "A system design where the core defines extension points and third-party code implements them, achieving OCP at the system level." },
    { term: "Speculative Generality", definition: "The anti-pattern of creating unnecessary abstractions for anticipated but unrealized future needs, adding complexity without current benefit." },
    { term: "Polymorphic Dispatch", definition: "The mechanism by which a method call is resolved to a specific implementation at runtime based on the actual type of the object, enabling OCP." }
  ]
};
