import type { TopicContent } from "../types";

export const factoryMethod: TopicContent = {
  quickSummary: [
    "Factory Method defines an interface for creating objects but lets subclasses decide which concrete class to instantiate -- it defers instantiation to subclasses.",
    "Abstract Factory provides an interface for creating families of related objects without specifying their concrete classes -- it groups multiple factory methods together.",
    "Both patterns decouple client code from concrete classes, enabling the Open/Closed Principle: new product types can be added without modifying existing client code.",
  ],
  detailed: [
    "The Factory Method pattern defines a method in a base class (the creator) that returns a product interface. Subclasses override this method to return specific concrete products. The client programs against the product interface and never calls new on a concrete class directly.",
    "Abstract Factory goes a step further by grouping related factory methods into a single interface. For example, a UIFactory might have methods createButton(), createCheckbox(), and createTextField(), with concrete factories like WindowsUIFactory and MacUIFactory each producing platform-consistent widgets.",
    "Parameterized factories accept a type discriminator (string, enum, or class token) and use conditional logic or a registry map to return the correct concrete product. This is simpler than full factory method inheritance but violates the Open/Closed Principle unless a registry is used.",
    "Factory patterns differ from Builder in intent: factories create a complete object in one step (possibly choosing among types), while Builder constructs a complex object step by step with many optional parts. Use Factory when the creation logic is which class to instantiate; use Builder when it is how to configure a complex instance.",
    "Real-world examples include JDBC's DriverManager.getConnection() (factory method that returns a Connection whose concrete type depends on the URL), and Java's Collection.iterator() where each collection subclass returns its own Iterator implementation.",
  ],
  deepDive: [
    "The Factory Method pattern embodies the Hollywood Principle ('Don't call us, we'll call you'). The base creator class defines a template method that calls the factory method internally. The base class controls the workflow, and the subclass controls only which product is created. This inversion of control keeps high-level policy stable while low-level details vary.",
    "Abstract Factory is often implemented with Factory Methods internally -- each concrete factory has multiple factory methods, one per product in the family. The two patterns compose naturally: Abstract Factory defines the family contract, and Factory Methods provide the individual creation points.",
    "In modern frameworks, factories are often replaced by Dependency Injection containers that resolve types from a registry. However, factories remain essential when the type to create depends on runtime data (e.g., parsing a message type field to choose a handler class) because DI containers resolve types at wiring time, not at runtime.",
    "TypeScript and Python often use simpler factory functions (plain functions that return objects) rather than full class hierarchies. A factory function combined with a type map achieves the same decoupling with less ceremony. This is the functional equivalent of the Factory Method pattern.",
  ],
  code: [
    {
      language: "java",
      caption: "Factory Method pattern: document creator hierarchy",
      source: `// Product interface
public interface Document {
    void open();
    void save();
    String getType();
}

// Concrete products
public class PdfDocument implements Document {
    private final String content;

    public PdfDocument(String content) {
        this.content = content;
    }

    @Override public void open() { System.out.println("Opening PDF viewer"); }
    @Override public void save() { System.out.println("Saving as PDF"); }
    @Override public String getType() { return "PDF"; }
}

public class WordDocument implements Document {
    private final String content;

    public WordDocument(String content) {
        this.content = content;
    }

    @Override public void open() { System.out.println("Opening Word processor"); }
    @Override public void save() { System.out.println("Saving as DOCX"); }
    @Override public String getType() { return "DOCX"; }
}

// Creator (abstract class with factory method)
public abstract class DocumentCreator {
    // Factory method -- subclasses decide which Document to create
    protected abstract Document createDocument(String content);

    // Template method using the factory method
    public Document newDocument(String content) {
        Document doc = createDocument(content);
        doc.open();
        System.out.println("Created " + doc.getType() + " document");
        return doc;
    }
}

// Concrete creators
public class PdfCreator extends DocumentCreator {
    @Override
    protected Document createDocument(String content) {
        return new PdfDocument(content);
    }
}

public class WordCreator extends DocumentCreator {
    @Override
    protected Document createDocument(String content) {
        return new WordDocument(content);
    }
}

// Client code -- works with any creator
DocumentCreator creator = new PdfCreator();
Document doc = creator.newDocument("Hello, World!");`,
    },
    {
      language: "java",
      caption: "Abstract Factory pattern: cross-platform UI toolkit",
      source: `// Abstract product interfaces
public interface Button {
    void render();
    void onClick(Runnable handler);
}

public interface TextField {
    void render();
    String getValue();
}

// Concrete products: Windows family
public class WindowsButton implements Button {
    @Override public void render() { System.out.println("[Win Button]"); }
    @Override public void onClick(Runnable h) { h.run(); }
}

public class WindowsTextField implements TextField {
    @Override public void render() { System.out.println("[Win TextField]"); }
    @Override public String getValue() { return "win-text"; }
}

// Concrete products: macOS family
public class MacButton implements Button {
    @Override public void render() { System.out.println("[Mac Button]"); }
    @Override public void onClick(Runnable h) { h.run(); }
}

public class MacTextField implements TextField {
    @Override public void render() { System.out.println("[Mac TextField]"); }
    @Override public String getValue() { return "mac-text"; }
}

// Abstract Factory interface
public interface UIFactory {
    Button createButton();
    TextField createTextField();
}

// Concrete factories
public class WindowsUIFactory implements UIFactory {
    @Override public Button createButton() { return new WindowsButton(); }
    @Override public TextField createTextField() { return new WindowsTextField(); }
}

public class MacUIFactory implements UIFactory {
    @Override public Button createButton() { return new MacButton(); }
    @Override public TextField createTextField() { return new MacTextField(); }
}

// Client code -- completely decoupled from concrete classes
public class LoginForm {
    private final Button submitBtn;
    private final TextField usernameField;

    public LoginForm(UIFactory factory) {
        this.submitBtn = factory.createButton();
        this.usernameField = factory.createTextField();
    }

    public void render() {
        usernameField.render();
        submitBtn.render();
    }
}

// Usage: switch entire UI family with one line
UIFactory factory = System.getProperty("os.name").contains("Mac")
    ? new MacUIFactory()
    : new WindowsUIFactory();
LoginForm form = new LoginForm(factory);
form.render();`,
    },
    {
      language: "typescript",
      caption: "Parameterized factory with a registry map",
      source: `// Product interface
interface PaymentProcessor {
  charge(amount: number): Promise<{ success: boolean; transactionId: string }>;
  refund(transactionId: string): Promise<boolean>;
}

// Concrete products
class StripeProcessor implements PaymentProcessor {
  async charge(amount: number) {
    console.log(\`Charging \${amount} via Stripe\`);
    return { success: true, transactionId: \`stripe_\${Date.now()}\` };
  }
  async refund(txId: string) {
    console.log(\`Refunding \${txId} via Stripe\`);
    return true;
  }
}

class PayPalProcessor implements PaymentProcessor {
  async charge(amount: number) {
    console.log(\`Charging \${amount} via PayPal\`);
    return { success: true, transactionId: \`paypal_\${Date.now()}\` };
  }
  async refund(txId: string) {
    console.log(\`Refunding \${txId} via PayPal\`);
    return true;
  }
}

// Registry-based parameterized factory
type ProcessorConstructor = new () => PaymentProcessor;

class PaymentFactory {
  private static registry = new Map<string, ProcessorConstructor>();

  static register(type: string, ctor: ProcessorConstructor): void {
    PaymentFactory.registry.set(type, ctor);
  }

  static create(type: string): PaymentProcessor {
    const Ctor = PaymentFactory.registry.get(type);
    if (!Ctor) throw new Error(\`Unknown payment type: \${type}\`);
    return new Ctor();
  }
}

// Registration -- extensible without modifying factory code
PaymentFactory.register("stripe", StripeProcessor);
PaymentFactory.register("paypal", PayPalProcessor);

// Usage
const processor = PaymentFactory.create("stripe");
await processor.charge(49.99);`,
    },
  ],
  diagrams: [
    {
      title: "Factory Method class hierarchy",
      kind: "architecture",
      caption:
        "Shows the Creator base class with a factory method, ConcreteCreator subclasses, and the Product interface with ConcreteProduct implementations. The creator hierarchy parallels the product hierarchy.",
    },
    {
      title: "Abstract Factory product families",
      kind: "architecture",
      caption:
        "Illustrates how an Abstract Factory interface groups multiple factory methods, and each Concrete Factory produces a consistent family of related products (e.g., all Windows widgets or all Mac widgets).",
    },
  ],
  animations: [
    {
      title: "Factory Method object creation flow",
      steps: [
        {
          label: "Client requests a product",
          detail: "The client calls the creator's template method (e.g., newDocument()) without knowing which concrete product will be created.",
        },
        {
          label: "Creator delegates to factory method",
          detail: "The template method internally calls the abstract factory method (e.g., createDocument()), which is implemented by a concrete creator subclass.",
        },
        {
          label: "Concrete creator returns product",
          detail: "The subclass instantiates the appropriate concrete product and returns it through the Product interface.",
        },
        {
          label: "Client uses the product via interface",
          detail: "The client receives an object typed as the Product interface and interacts with it polymorphically, never knowing the concrete type.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Factory Method", "Abstract Factory", "Builder"],
    rows: [
      ["Intent", "Defer instantiation to subclasses", "Create families of related objects", "Construct complex objects step by step"],
      ["Number of products", "One product per factory method", "Multiple related products per factory", "One complex product"],
      ["Variation axis", "Which subclass to create", "Which family of products", "How to configure the product"],
      ["Implementation", "Inheritance (override factory method)", "Composition (inject factory object)", "Fluent method chaining or director"],
      ["When to use", "Type depends on subclass context", "Products must be used together consistently", "Many optional parameters or complex construction"],
      ["OCP compliance", "Yes (add new creator subclasses)", "Yes (add new concrete factories)", "Yes (add new builder methods)"],
      ["Complexity", "Low", "Medium-High", "Medium"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Factory Method and Abstract Factory?",
      a: "Factory Method is about a single method in a creator class that subclasses override to produce one type of product. Abstract Factory is an interface with multiple factory methods that together produce a family of related products. Factory Method uses inheritance; Abstract Factory uses object composition (you inject the factory).",
      followUps: [
        "Can an Abstract Factory be implemented using Factory Methods internally?",
        "Give a real-world example where you would need an Abstract Factory but not just a Factory Method.",
        "How would you add a new product type to each pattern?",
      ],
    },
    {
      q: "When would you use a Factory over a constructor?",
      a: "Use a factory when: the concrete type depends on runtime data or configuration; construction logic is complex and you want to hide it; you need to return cached instances or pool objects; you want to program against an interface rather than a concrete class; or you need to centralize and control object creation for cross-cutting concerns like logging or validation.",
      followUps: [
        "What is the relationship between factories and the Open/Closed Principle?",
        "How do static factory methods in Java (like List.of()) relate to the Factory Method pattern?",
      ],
    },
    {
      q: "How does a parameterized factory work, and what are its trade-offs?",
      a: "A parameterized factory takes a discriminator (string, enum, etc.) and uses a switch/map to return the matching concrete product. It is simpler than a full factory method hierarchy but violates OCP if you use conditionals -- each new type requires modifying the switch. Using a registry map fixes this: new types self-register without changing existing code.",
      followUps: [
        "How would you implement a self-registering factory in Java?",
        "What pattern does a registry-based factory resemble?",
      ],
    },
    {
      q: "How do factories relate to Dependency Injection?",
      a: "DI containers resolve and inject dependencies at wiring time, while factories create objects at runtime. When the type to create depends on runtime data (e.g., a user's payment method choice), a factory is necessary even in a DI-managed application. The factory itself can be injected by the DI container.",
      followUps: [
        "Can a DI container completely replace factories?",
        "What is the Provider pattern in DI frameworks?",
      ],
    },
    {
      q: "What is the Simple Factory, and is it a real design pattern?",
      a: "Simple Factory (or Static Factory) is a class with a static method that encapsulates object creation logic, typically using a switch on a type parameter. It is not one of the GoF patterns -- it is a common programming idiom. It centralizes creation but the static method cannot be overridden, and it violates OCP unless combined with a registry.",
      followUps: [
        "How does Java's valueOf() method exemplify the Simple Factory idiom?",
        "Why do some purists say Simple Factory is not a pattern?",
      ],
    },
    {
      q: "Give a real-world example of the Abstract Factory pattern.",
      a: "JDBC is a prime example. DriverManager acts as a factory that produces Connections. Each database vendor provides a concrete factory (the JDBC driver) that creates vendor-specific implementations of Connection, Statement, and ResultSet -- a family of related objects that must be consistent. Your application code works entirely through the JDBC interfaces.",
      followUps: [
        "How does the JDBC driver registration mechanism work?",
        "What other Java APIs use Abstract Factory?",
      ],
    },
  ],
  followUps: [
    "How does the Factory pattern interact with Generics in Java or TypeScript to create type-safe factories?",
    "What is the Prototype pattern, and how does it compare to Factory as an alternative for object creation?",
    "How do modern languages with first-class functions (TypeScript, Python, Kotlin) simplify factory implementations?",
    "How would you implement a factory that supports both creation and caching (flyweight factory)?",
    "What is the Service Locator pattern, and how does it relate to factories and DI?",
  ],
  mcqs: [
    {
      q: "Which pattern defines an interface for creating families of related objects?",
      options: ["Factory Method", "Abstract Factory", "Builder", "Prototype"],
      answerIndex: 1,
      explanation:
        "Abstract Factory groups multiple factory methods to produce a family of related products (e.g., all UI components for a specific platform) that must be used together.",
    },
    {
      q: "In the Factory Method pattern, who decides which concrete class to instantiate?",
      options: ["The client code", "The abstract creator", "The concrete creator subclass", "The product interface"],
      answerIndex: 2,
      explanation:
        "The concrete creator subclass overrides the factory method to instantiate and return a specific concrete product. The client and abstract creator only work with the product interface.",
    },
    {
      q: "What principle does the Factory Method pattern primarily support?",
      options: [
        "Single Responsibility Principle",
        "Liskov Substitution Principle",
        "Open/Closed Principle",
        "Interface Segregation Principle",
      ],
      answerIndex: 2,
      explanation:
        "Factory Method supports OCP because you can introduce new product types by adding new creator subclasses without modifying existing creator or client code.",
    },
    {
      q: "Which of the following is NOT a valid reason to use a factory?",
      options: [
        "The concrete type is determined at runtime",
        "You want to reduce the number of classes in the system",
        "Construction logic is complex and should be encapsulated",
        "You want to program against interfaces rather than concrete classes",
      ],
      answerIndex: 1,
      explanation:
        "Factories actually increase the number of classes (creator classes, factory interfaces). Their purpose is decoupling, encapsulation, and flexibility -- not reducing class count.",
    },
    {
      q: "How does a registry-based parameterized factory achieve Open/Closed compliance?",
      options: [
        "By using reflection to discover classes",
        "By allowing new types to register themselves without modifying the factory code",
        "By using abstract classes instead of interfaces",
        "By caching created instances",
      ],
      answerIndex: 1,
      explanation:
        "A registry map lets new product types add themselves (e.g., via a register() call) without changing the factory's creation logic, satisfying OCP.",
    },
    {
      q: "What does JDBC's DriverManager.getConnection() exemplify?",
      options: ["Builder", "Singleton", "Abstract Factory", "Observer"],
      answerIndex: 2,
      explanation:
        "JDBC drivers act as abstract factories that produce families of related objects (Connection, Statement, ResultSet) specific to a database vendor, all accessed through common JDBC interfaces.",
    },
  ],
  exercises: [
    "Implement a Factory Method pattern for a notification system: create a NotificationSender interface with send(message, recipient) and concrete implementations for Email, SMS, and Push notifications. Write a NotificationFactory that selects the sender based on a NotificationType enum.",
    "Build an Abstract Factory for a theme system: define a ThemeFactory interface with methods createPrimaryColor(), createFont(), and createBorderStyle(). Implement DarkThemeFactory and LightThemeFactory. Use the factory to render a styled component.",
    "Create a registry-based payment processor factory in TypeScript where new payment methods can register themselves. Write three processors (CreditCard, BankTransfer, Crypto) and demonstrate adding a fourth without modifying the factory class.",
    "Refactor a class that uses a large switch statement to create different report types (PDF, CSV, HTML, JSON) into a proper Factory Method pattern. Verify that adding a new report type requires no changes to existing code.",
  ],
  flashcards: [
    {
      front: "What is the Factory Method pattern?",
      back: "A creational pattern that defines an interface for creating an object but lets subclasses decide which class to instantiate. It defers instantiation to subclasses via an overridable method.",
    },
    {
      front: "What is the Abstract Factory pattern?",
      back: "A creational pattern that provides an interface for creating families of related objects without specifying their concrete classes. It groups multiple factory methods into one factory interface.",
    },
    {
      front: "Factory Method vs Abstract Factory: key difference?",
      back: "Factory Method creates one product via inheritance (subclass overrides a method). Abstract Factory creates a family of related products via composition (client receives a factory object).",
    },
    {
      front: "What is a parameterized factory?",
      back: "A factory that accepts a type discriminator (string, enum) and returns the corresponding concrete product. Simple but may violate OCP unless a registry pattern is used.",
    },
    {
      front: "When should you use Factory over Builder?",
      back: "Use Factory when the decision is which type to create. Use Builder when the decision is how to configure a complex object with many optional parameters.",
    },
    {
      front: "What is the Simple Factory idiom?",
      back: "A static method that encapsulates object creation logic (typically a switch on a type parameter). Not a GoF pattern, but a common pragmatic approach for centralizing creation.",
    },
  ],
  revisionNotes: [
    "Factory Method = one overridable creation method in a creator class. Subclasses decide the concrete type.",
    "Abstract Factory = an interface grouping multiple factory methods to produce a consistent family of products.",
    "Parameterized factory uses a discriminator to select the type. Use a registry map instead of switch for OCP compliance.",
    "Factory creates a whole object in one call; Builder constructs step by step. Different problems, different solutions.",
    "Real-world: JDBC DriverManager (abstract factory), Collection.iterator() (factory method), React.createElement (parameterized factory).",
    "Factories shine when the concrete type depends on runtime data -- DI containers handle wiring-time resolution, factories handle runtime resolution.",
  ],
  cheatSheet: [
    "Factory Method: abstract Creator { abstract Product create(); } -- ConcreteCreator overrides create().",
    "Abstract Factory: interface Factory { A createA(); B createB(); } -- each concrete factory makes a consistent family.",
    "Parameterized: Factory.create(type) with registry map for OCP.",
    "Use Factory when choosing which class; use Builder when configuring how to build.",
    "Static factory methods (e.g., List.of(), Optional.empty()) are not the Factory Method pattern but a useful Java idiom.",
    "To add a new type: Factory Method -> add a new creator subclass. Abstract Factory -> add a new concrete factory.",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "The original Factory Method and Abstract Factory pattern descriptions with C++ and Smalltalk examples.",
    },
    {
      label: "Head First Design Patterns, 2nd Edition",
      kind: "book",
      note: "Accessible coverage of Factory patterns with a pizza store example that builds intuition progressively.",
    },
    {
      label: "Refactoring Guru - Factory Method",
      kind: "article",
      note: "Interactive visual guide with UML diagrams and code examples in multiple languages.",
    },
    {
      label: "Refactoring Guru - Abstract Factory",
      kind: "article",
      note: "Detailed comparison with Factory Method including when to use each pattern.",
    },
    {
      label: "Effective Java, 3rd Edition - Item 1: Static factory methods",
      kind: "book",
      note: "Joshua Bloch on static factory methods as an alternative to constructors -- distinct from the Factory Method pattern but related.",
    },
  ],
  glossary: [
    {
      term: "Factory Method",
      definition: "A creational pattern where a method in a base class returns a product interface, and subclasses override it to return specific concrete products.",
    },
    {
      term: "Abstract Factory",
      definition: "A creational pattern providing an interface for creating families of related objects without specifying their concrete classes.",
    },
    {
      term: "Creator",
      definition: "The base class or interface in the Factory Method pattern that declares the factory method and may contain a template method that uses it.",
    },
    {
      term: "Product",
      definition: "The interface or abstract class that defines the type of object the factory method creates.",
    },
    {
      term: "Parameterized Factory",
      definition: "A factory that accepts a type identifier and returns the matching concrete product, often implemented with a map or switch statement.",
    },
    {
      term: "Simple Factory",
      definition: "A common idiom (not a GoF pattern) where a static method encapsulates creation logic, typically using conditionals to select the concrete type.",
    },
    {
      term: "Product Family",
      definition: "A set of related products (e.g., Button + TextField + Checkbox) that are designed to work together and are produced by one Abstract Factory.",
    },
  ],
};
