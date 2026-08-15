import type { TopicContent } from "../types";

export const strategy: TopicContent = {
  quickSummary: [
    "Strategy defines a family of algorithms, encapsulates each one in its own class, and makes them interchangeable -- the algorithm can vary independently from the clients that use it.",
    "The pattern eliminates conditional logic (if/else or switch) for selecting behavior by replacing it with polymorphism: inject the desired strategy object rather than hard-coding the decision.",
    "In languages with first-class functions (TypeScript, Python, Kotlin), a strategy can simply be a function passed as a parameter, achieving the same decoupling without a class hierarchy.",
  ],
  detailed: [
    "The pattern has three participants: Strategy (the interface defining the algorithm contract), ConcreteStrategy (each implementation of the algorithm), and Context (the class that uses a Strategy and delegates the algorithmic work to it). The Context does not know which concrete strategy it uses.",
    "Strategy is commonly used for sorting algorithms (comparators), payment processing (credit card, PayPal, bank transfer), validation rules (different validators for different regions), compression (gzip, brotli, zstd), and routing algorithms (shortest path, fastest, scenic).",
    "The Context can receive its strategy via constructor injection (fixed for the object's lifetime), setter injection (changeable at runtime), or method parameter (per-call selection). Constructor injection is simplest; setter injection enables runtime switching.",
    "Strategy differs from State in intent: Strategy selects an algorithm to use, and the choice is typically made by the client or configuration. State manages an object's behavior based on its internal state, and transitions happen automatically. Strategy replaces one behavior; State can change the entire set of behaviors.",
    "In functional programming, the Strategy pattern reduces to passing a function. Instead of defining a SortStrategy interface with a sort() method and creating QuickSortStrategy and MergeSortStrategy classes, you pass (items) => quickSort(items) or (items) => mergeSort(items) directly. This is idiomatic in TypeScript, Python, and Kotlin.",
  ],
  deepDive: [
    "The Strategy pattern is a direct application of the Open/Closed Principle: the Context is closed for modification (its code never changes when a new algorithm is added) but open for extension (new strategies can be plugged in). This is why it eliminates switch statements -- each case becomes a separate strategy class.",
    "Strategy and Template Method solve similar problems differently. Template Method uses inheritance: the base class defines the algorithm skeleton and subclasses override specific steps. Strategy uses composition: the algorithm is entirely delegated to an injected object. Strategy is more flexible (you can swap at runtime and mix strategies), while Template Method is simpler when the algorithm structure is fixed.",
    "When strategies need shared state or complex initialization, the Context can pass itself to the strategy (strategy.execute(this)), giving the strategy access to context data without tight coupling. Alternatively, extract the shared data into a parameter object.",
    "The Null Object pattern pairs well with Strategy: define a NoOpStrategy that implements the interface but does nothing. This eliminates null checks in the Context and provides a safe default behavior when no real strategy is configured.",
  ],
  code: [
    {
      language: "java",
      caption: "Strategy pattern for payment processing with runtime switching",
      source: `// Strategy interface
public interface PaymentStrategy {
    PaymentResult pay(BigDecimal amount, String currency);
    boolean supports(String paymentMethod);
}

// ConcreteStrategy: Credit Card
public class CreditCardPayment implements PaymentStrategy {
    private final String cardNumber;
    private final String expiryDate;

    public CreditCardPayment(String cardNumber, String expiryDate) {
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
    }

    @Override
    public PaymentResult pay(BigDecimal amount, String currency) {
        // Process credit card payment via payment gateway
        System.out.printf("Charging %s %s to card ending %s%n",
            currency, amount, cardNumber.substring(cardNumber.length() - 4));
        return new PaymentResult(true, "CC-" + System.currentTimeMillis());
    }

    @Override
    public boolean supports(String method) {
        return "CREDIT_CARD".equals(method);
    }
}

// ConcreteStrategy: Bank Transfer
public class BankTransferPayment implements PaymentStrategy {
    private final String accountNumber;
    private final String routingNumber;

    public BankTransferPayment(String accountNumber, String routingNumber) {
        this.accountNumber = accountNumber;
        this.routingNumber = routingNumber;
    }

    @Override
    public PaymentResult pay(BigDecimal amount, String currency) {
        System.out.printf("Transferring %s %s from account %s%n",
            currency, amount, accountNumber);
        return new PaymentResult(true, "BT-" + System.currentTimeMillis());
    }

    @Override
    public boolean supports(String method) {
        return "BANK_TRANSFER".equals(method);
    }
}

// ConcreteStrategy: Digital Wallet
public class DigitalWalletPayment implements PaymentStrategy {
    private final String walletId;

    public DigitalWalletPayment(String walletId) {
        this.walletId = walletId;
    }

    @Override
    public PaymentResult pay(BigDecimal amount, String currency) {
        System.out.printf("Paying %s %s from wallet %s%n", currency, amount, walletId);
        return new PaymentResult(true, "DW-" + System.currentTimeMillis());
    }

    @Override
    public boolean supports(String method) {
        return "DIGITAL_WALLET".equals(method);
    }
}

// Context
public class CheckoutService {
    private PaymentStrategy paymentStrategy;

    public CheckoutService(PaymentStrategy defaultStrategy) {
        this.paymentStrategy = defaultStrategy;
    }

    // Runtime strategy switching
    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }

    public PaymentResult processOrder(Order order) {
        // Business logic that does not change regardless of payment method
        validateOrder(order);
        BigDecimal total = calculateTotal(order);
        applyDiscounts(order, total);

        // Delegate payment to the current strategy
        PaymentResult result = paymentStrategy.pay(total, order.getCurrency());

        if (result.isSuccess()) {
            updateInventory(order);
            sendConfirmation(order, result);
        }
        return result;
    }

    // ...helper methods omitted for brevity
}

// Usage -- strategy selected at runtime based on user choice
PaymentStrategy strategy = switch (userChoice) {
    case "CREDIT_CARD" -> new CreditCardPayment(cardNumber, expiry);
    case "BANK_TRANSFER" -> new BankTransferPayment(account, routing);
    case "DIGITAL_WALLET" -> new DigitalWalletPayment(walletId);
    default -> throw new IllegalArgumentException("Unknown: " + userChoice);
};

CheckoutService checkout = new CheckoutService(strategy);
checkout.processOrder(order);`,
    },
    {
      language: "typescript",
      caption: "Strategy as functions (functional approach) for validation",
      source: `// Strategy as a function type -- no class hierarchy needed
type ValidationStrategy = (value: string) => { valid: boolean; error?: string };

// Concrete strategies as plain functions
const requiredValidator: ValidationStrategy = (value) => ({
  valid: value.trim().length > 0,
  error: value.trim().length === 0 ? "Field is required" : undefined,
});

const emailValidator: ValidationStrategy = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(value),
    error: emailRegex.test(value) ? undefined : "Invalid email format",
  };
};

const minLengthValidator = (min: number): ValidationStrategy => (value) => ({
  valid: value.length >= min,
  error: value.length < min ? \`Must be at least \${min} characters\` : undefined,
});

const passwordStrengthValidator: ValidationStrategy = (value) => {
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*]/.test(value);
  const strong = hasUpper && hasLower && hasDigit && hasSpecial && value.length >= 8;
  return {
    valid: strong,
    error: strong ? undefined : "Password needs uppercase, lowercase, digit, and special character",
  };
};

// Context: composes multiple strategies
class FormField {
  private validators: ValidationStrategy[] = [];

  constructor(
    private readonly name: string,
    private value: string = ""
  ) {}

  addValidator(validator: ValidationStrategy): this {
    this.validators.push(validator);
    return this;
  }

  setValue(value: string): void {
    this.value = value;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    for (const validator of this.validators) {
      const result = validator(this.value);
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

// Usage -- compose strategies at runtime
const emailField = new FormField("email")
  .addValidator(requiredValidator)
  .addValidator(emailValidator);

const passwordField = new FormField("password")
  .addValidator(requiredValidator)
  .addValidator(minLengthValidator(8))
  .addValidator(passwordStrengthValidator);

emailField.setValue("user@example.com");
console.log(emailField.validate());
// { valid: true, errors: [] }

passwordField.setValue("weak");
console.log(passwordField.validate());
// { valid: false, errors: ["Must be at least 8 characters", "Password needs..."] }`,
    },
    {
      language: "cpp",
      caption: "C++ Strategy with abstract base class and runtime switching",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <cstdio>
#include <cassert>
#include <zlib.h>

using Bytes = std::vector<uint8_t>;

// Strategy interface (abstract base class)
class CompressionStrategy {
public:
    virtual ~CompressionStrategy() = default;
    virtual Bytes compress(const Bytes& data) const = 0;
    virtual Bytes decompress(const Bytes& data) const = 0;
    virtual std::string name() const = 0;
};

// ConcreteStrategy: No compression
class NoCompression : public CompressionStrategy {
public:
    std::string name() const override { return "none"; }
    Bytes compress(const Bytes& data) const override { return data; }
    Bytes decompress(const Bytes& data) const override { return data; }
};

// ConcreteStrategy: Zlib compression
class ZlibCompression : public CompressionStrategy {
    int level_;
public:
    explicit ZlibCompression(int level = Z_DEFAULT_COMPRESSION)
        : level_(level) {}

    std::string name() const override {
        return "zlib(level=" + std::to_string(level_) + ")";
    }

    Bytes compress(const Bytes& data) const override {
        uLongf dest_len = compressBound(data.size());
        Bytes result(dest_len);
        compress2(result.data(), &dest_len, data.data(), data.size(), level_);
        result.resize(dest_len);
        return result;
    }

    Bytes decompress(const Bytes& data) const override {
        Bytes result(data.size() * 10);  // estimate decompressed size
        uLongf dest_len = result.size();
        uncompress(result.data(), &dest_len, data.data(), data.size());
        result.resize(dest_len);
        return result;
    }
};

// ConcreteStrategy: Run-Length Encoding (simple illustrative compressor)
class RleCompression : public CompressionStrategy {
public:
    std::string name() const override { return "rle"; }

    Bytes compress(const Bytes& data) const override {
        Bytes result;
        for (size_t i = 0; i < data.size(); ) {
            uint8_t ch = data[i];
            size_t count = 1;
            while (i + count < data.size() && data[i + count] == ch && count < 255)
                ++count;
            result.push_back(static_cast<uint8_t>(count));
            result.push_back(ch);
            i += count;
        }
        return result;
    }

    Bytes decompress(const Bytes& data) const override {
        Bytes result;
        for (size_t i = 0; i + 1 < data.size(); i += 2)
            result.insert(result.end(), data[i], data[i + 1]);
        return result;
    }
};

// Context
class FileStorage {
    std::unique_ptr<CompressionStrategy> strategy_;
    std::unordered_map<std::string, Bytes> store_;
public:
    explicit FileStorage(std::unique_ptr<CompressionStrategy> strategy = nullptr)
        : strategy_(strategy ? std::move(strategy) : std::make_unique<NoCompression>()) {}

    const std::string& compression() const {
        static std::string n;
        n = strategy_->name();
        return n;
    }

    // Runtime strategy switching
    void set_compression(std::unique_ptr<CompressionStrategy> strategy) {
        strategy_ = std::move(strategy);
    }

    size_t save(const std::string& key, const Bytes& data) {
        Bytes compressed = strategy_->compress(data);
        double ratio = data.empty() ? 100.0
            : static_cast<double>(compressed.size()) / data.size() * 100.0;
        std::printf("Saved '%s': %zuB -> %zuB (%.1f%%) [%s]\\n",
            key.c_str(), data.size(), compressed.size(), ratio,
            strategy_->name().c_str());
        store_[key] = std::move(compressed);
        return store_[key].size();
    }

    Bytes load(const std::string& key) {
        return strategy_->decompress(store_.at(key));
    }
};

// Usage -- switch compression strategy at runtime
int main() {
    FileStorage storage;
    Bytes test_data;
    for (int i = 0; i < 1000; ++i) {
        std::string s = "Hello, World! ";
        test_data.insert(test_data.end(), s.begin(), s.end());
    }

    storage.save("file1.txt", test_data);  // No compression
    // Saved 'file1.txt': 14000B -> 14000B (100.0%) [none]

    storage.set_compression(std::make_unique<ZlibCompression>(9));
    storage.save("file2.txt", test_data);  // Max zlib compression
    // Saved 'file2.txt': 14000B -> 42B (0.3%) [zlib(level=9)]

    storage.set_compression(std::make_unique<RleCompression>());
    storage.save("file3.txt", test_data);  // RLE compression
    // Saved 'file3.txt': 14000B -> ... [rle]

    // Verify round-trip
    assert(storage.load("file2.txt") == test_data);
}`,
    },
  ],
  diagrams: [
    {
      title: "Strategy Pattern Class Structure",
      kind: "architecture",
      caption: "Context holds a Strategy interface reference. ConcreteStrategy classes implement the algorithm. Client injects the chosen strategy.",
      mermaid: `graph TD
    Client --> Context["Context
-strategy: Strategy
+setStrategy()
+executeStrategy()"]
    Context -->|delegates to| SI["<<interface>>
Strategy
+execute(data)"]
    SI --> CS1["ConcreteStrategyA
+execute(data)"]
    SI --> CS2["ConcreteStrategyB
+execute(data)"]
    SI --> CS3["ConcreteStrategyC
+execute(data)"]`,
    },
    {
      title: "Strategy Selection Flow",
      kind: "flow",
      caption: "How a client selects and injects a strategy into the context at runtime.",
      mermaid: `flowchart TD
    A([Client]) --> B{Which algorithm?}
    B -->|Quick sort| C["new QuickSortStrategy"]
    B -->|Merge sort| D["new MergeSortStrategy"]
    B -->|Heap sort| E["new HeapSortStrategy"]
    C --> F["context.setStrategy(strategy)"]
    D --> F
    E --> F
    F --> G["context.sort(data)"]
    G --> H["strategy.execute(data)"]
    H --> I([Sorted Result])`,
    },
    {
      title: "Strategy vs Template Method",
      kind: "mindmap",
      caption: "Comparison of two patterns that both address algorithm variation but use different mechanisms.",
      mermaid: `mindmap
  root((Algorithm Variation))
    Strategy Pattern
      Composition
      Inject strategy object
      Swap at runtime
      Independent strategies
      Client selects
    Template Method
      Inheritance
      Override subclass steps
      Fixed at compile time
      Shared skeleton
      Parent controls flow`,
    },
    {
      title: "Payment Processing with Strategy",
      kind: "sequence",
      caption: "A checkout context delegating payment to whichever payment strategy the user chose.",
      mermaid: `sequenceDiagram
    participant U as User
    participant C as CheckoutContext
    participant S as PaymentStrategy
    U->>C: selectPayment(creditCard)
    C->>C: setStrategy(CreditCardStrategy)
    U->>C: confirmOrder(amount)
    C->>S: execute(amount)
    S-->>C: PaymentResult
    C-->>U: OrderConfirmation`,
    },
  ],
  animations: [
    {
      title: "Runtime strategy switching",
      steps: [
        {
          label: "Context is initialized with a default strategy",
          detail: "The Context receives a ConcreteStrategy (e.g., GzipCompression) via constructor injection. It stores a reference to the Strategy interface.",
        },
        {
          label: "Client calls the Context's method",
          detail: "The client calls storage.save(data). The Context delegates the compression step to the current strategy: strategy.compress(data).",
        },
        {
          label: "Client switches the strategy at runtime",
          detail: "The client calls storage.setCompression(new ZlibCompression()). The Context replaces its strategy reference.",
        },
        {
          label: "Next call uses the new strategy",
          detail: "The next call to storage.save(data) delegates to ZlibCompression.compress(data) instead of Gzip. The Context code did not change -- only the injected strategy did.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Strategy", "State", "Template Method", "Command"],
    rows: [
      ["Intent", "Select an algorithm", "Change behavior based on state", "Define algorithm skeleton, override steps", "Encapsulate a request as an object"],
      ["Who decides", "Client selects the strategy", "State transitions happen internally", "Subclass overrides steps", "Client creates and assigns commands"],
      ["Mechanism", "Composition (inject strategy object)", "Composition (state object replaces itself)", "Inheritance (override hook methods)", "Composition (inject command object)"],
      ["Runtime switching", "Yes (set new strategy)", "Yes (state changes automatically)", "No (fixed at subclass creation)", "Yes (assign new command)"],
      ["Number of methods", "Typically one algorithmic method", "Multiple methods change together", "Multiple hook methods", "Typically one execute() method"],
      ["Typical use case", "Sorting, compression, validation", "Workflow states, TCP connections", "Parsing, rendering pipelines", "Undo/redo, task queues, macros"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Strategy and State pattern?",
      a: "Both have nearly identical structure (Context + interface + concrete implementations), but the intent differs. Strategy lets the client choose which algorithm to use -- the selection is external. State manages an object's behavior based on its internal state -- transitions happen automatically within the state objects. Strategy replaces one behavior; State can replace the entire behavior set.",
      followUps: [
        "Can a State object change the Context's behavior without the client knowing?",
        "Can the same class implement both patterns?",
        "How does a TCP connection use the State pattern?",
      ],
    },
    {
      q: "How does the Strategy pattern eliminate conditional logic?",
      a: "Without Strategy, the Context uses if/else or switch to select the algorithm: if (type == 'gzip') gzipCompress(data) else if (type == 'zlib') zlibCompress(data)... Each new algorithm requires modifying the Context. With Strategy, the Context delegates to strategy.compress(data), and new algorithms are added by creating new ConcreteStrategy classes -- no modifications to existing code.",
      followUps: [
        "Which SOLID principle does this support?",
        "Is there ever a case where a switch is preferable to Strategy?",
        "How do you select the right strategy at runtime?",
      ],
    },
    {
      q: "When can you use functions instead of the full Strategy pattern?",
      a: "In languages with first-class functions (TypeScript, Python, Kotlin, Java 8+), if the strategy has a single method and no state, you can replace the interface and class hierarchy with a function type. A TypeScript (value: string) => boolean replaces a ValidationStrategy interface and multiple validator classes. Use full classes when strategies have state, multiple methods, or complex configuration.",
      followUps: [
        "What are the trade-offs of functions vs classes for strategies?",
        "How does Java's Comparator serve as a functional strategy?",
      ],
    },
    {
      q: "How does Strategy differ from Template Method?",
      a: "Both solve the problem of varying algorithms. Template Method uses inheritance: the base class defines the algorithm skeleton with hook methods that subclasses override. Strategy uses composition: the entire algorithm is delegated to an injected strategy object. Strategy is more flexible (can swap at runtime, avoids fragile base class), while Template Method is simpler when the algorithm structure is fixed and only specific steps vary.",
      followUps: [
        "Can you refactor a Template Method into a Strategy?",
        "Which is more testable and why?",
      ],
    },
    {
      q: "Give a real-world example of the Strategy pattern in a standard library.",
      a: "Java's Comparator is a strategy: Collections.sort(list, comparator) delegates the comparison algorithm to the injected Comparator. The sorting algorithm (TimSort) is fixed, but the comparison strategy is pluggable. Similarly, Java's LayoutManager in Swing is a strategy for positioning UI components -- FlowLayout, BorderLayout, GridLayout are concrete strategies.",
      followUps: [
        "How does Comparator.comparing() simplify strategy creation in Java?",
        "What other Java APIs use the Strategy pattern?",
      ],
    },
    {
      q: "How do you test classes that use the Strategy pattern?",
      a: "Testing is straightforward because of the separation. Test each ConcreteStrategy independently by calling its methods directly. Test the Context by injecting a mock or stub strategy and verifying the Context delegates correctly. This isolation is one of Strategy's key benefits -- you can test the algorithmic logic and the orchestration logic separately.",
      followUps: [
        "How do you test strategy selection logic?",
        "What is a Null Strategy, and how does it help in testing?",
      ],
    },
  ],
  followUps: [
    "How does the Strategy pattern relate to Dependency Injection frameworks?",
    "How would you implement a strategy registry that maps configuration strings to strategy instances?",
    "What is the Null Object pattern, and how does it pair with Strategy for default behavior?",
    "How does the Strategy pattern apply to machine learning model selection?",
    "How do you handle strategies that need access to the Context's internal state?",
  ],
  mcqs: [
    {
      q: "What does the Strategy pattern encapsulate?",
      options: [
        "The state of an object",
        "A family of interchangeable algorithms",
        "The creation process of objects",
        "Access control to an object",
      ],
      answerIndex: 1,
      explanation:
        "Strategy encapsulates algorithms in separate classes behind a common interface, making them interchangeable without changing the client code.",
    },
    {
      q: "How does Strategy differ from State?",
      options: [
        "Strategy uses inheritance; State uses composition",
        "Strategy's selection is external (client chooses); State's transitions are internal (automatic)",
        "State supports multiple algorithms; Strategy supports only one",
        "They are identical patterns",
      ],
      answerIndex: 1,
      explanation:
        "In Strategy, the client selects which algorithm to use. In State, the object's behavior changes automatically based on its internal state. The structural pattern is nearly identical, but the intent and who controls the change differs.",
    },
    {
      q: "Which Java API is a classic example of the Strategy pattern?",
      options: [
        "Iterator",
        "Comparator",
        "Singleton enum",
        "StringBuilder",
      ],
      answerIndex: 1,
      explanation:
        "Comparator is injected into sorting methods (Collections.sort(list, comparator)) to provide a pluggable comparison algorithm -- the textbook Strategy pattern.",
    },
    {
      q: "In languages with first-class functions, when is the full Strategy class hierarchy still preferred?",
      options: [
        "Always -- functions are never sufficient",
        "When the strategy has state, multiple methods, or complex configuration",
        "When the language does not support lambdas",
        "When performance is critical",
      ],
      answerIndex: 1,
      explanation:
        "Functions work well for simple, single-method, stateless strategies. When a strategy needs internal state, multiple methods, or complex initialization, a full class provides better encapsulation and clarity.",
    },
    {
      q: "What SOLID principle does the Strategy pattern primarily support?",
      options: [
        "Single Responsibility Principle",
        "Liskov Substitution Principle",
        "Open/Closed Principle",
        "Dependency Inversion Principle",
      ],
      answerIndex: 2,
      explanation:
        "Strategy supports OCP: the Context is closed for modification (its code does not change for new algorithms) but open for extension (new ConcreteStrategy classes can be added).",
    },
    {
      q: "How does the Context typically receive its strategy?",
      options: [
        "By creating it internally with new",
        "Via constructor injection, setter injection, or method parameter",
        "By looking it up in a global registry",
        "Through inheritance",
      ],
      answerIndex: 1,
      explanation:
        "The strategy is injected into the Context from outside -- via the constructor (fixed), a setter (switchable at runtime), or a method parameter (per-call). This is what makes the algorithm interchangeable.",
    },
  ],
  exercises: [
    "Implement a shipping cost calculator using the Strategy pattern in Java. Create strategies for StandardShipping, ExpressShipping, and FreeShipping (orders over a threshold). The checkout service should accept the shipping strategy and calculate the total accordingly.",
    "Build a text formatter in TypeScript using functional strategies. Define strategies as functions for Markdown, HTML, and plain text formatting. Create a DocumentExporter context that accepts a formatting strategy and exports content in the specified format.",
    "Create a route planning system in Python with strategies for ShortestPath, FastestRoute, and ScenicRoute. Each strategy takes a graph of locations and returns a path. Demonstrate switching strategies at runtime and verify different routes are returned for the same origin/destination.",
    "Refactor a class with a large switch statement (e.g., handling different file export formats: CSV, JSON, XML, YAML) into the Strategy pattern. Show the before/after code and verify that adding a new format requires no changes to existing code.",
  ],
  flashcards: [
    {
      front: "What is the Strategy pattern?",
      back: "A behavioral pattern that defines a family of algorithms, encapsulates each in a class, and makes them interchangeable. The algorithm varies independently from the client.",
    },
    {
      front: "What are the three participants in Strategy?",
      back: "Strategy (algorithm interface), ConcreteStrategy (specific algorithm implementation), and Context (uses a Strategy and delegates work to it).",
    },
    {
      front: "Strategy vs State: key difference?",
      back: "Strategy: client selects the algorithm externally. State: behavior changes automatically based on internal state transitions.",
    },
    {
      front: "Strategy vs Template Method?",
      back: "Strategy uses composition (inject algorithm object). Template Method uses inheritance (override hook methods). Strategy is more flexible; Template Method is simpler for fixed algorithm structures.",
    },
    {
      front: "When can a function replace a Strategy class?",
      back: "When the strategy has a single method, no internal state, and no complex configuration. In TypeScript/Python/Kotlin, pass a function instead of creating a class.",
    },
    {
      front: "What is a Null Strategy?",
      back: "A strategy that implements the interface but does nothing. It serves as a safe default, eliminating null checks in the Context.",
    },
  ],
  revisionNotes: [
    "Strategy = encapsulate algorithms behind an interface, inject into Context. Client picks the algorithm; Context runs it.",
    "Eliminates if/else and switch for algorithm selection by replacing them with polymorphism.",
    "Three injection methods: constructor (fixed), setter (runtime switching), method parameter (per-call).",
    "Strategy vs State: same structure, different intent. Strategy = external selection, State = internal transitions.",
    "Functional alternative: pass a function instead of a strategy object when the strategy is a single method with no state.",
    "Real-world: Java Comparator, Swing LayoutManager, compression algorithms, payment processors, validation rules.",
  ],
  cheatSheet: [
    "interface Strategy { Result execute(Input input); } -- one method defining the algorithm contract.",
    "Context holds a Strategy reference and delegates: return strategy.execute(input);",
    "Constructor injection: new Context(strategy) -- strategy fixed for object lifetime.",
    "Setter injection: context.setStrategy(newStrategy) -- switchable at runtime.",
    "Functional: type Strategy = (input: Input) => Result; -- no class needed for simple strategies.",
    "Add new algorithms by creating new ConcreteStrategy classes -- no changes to Context (OCP).",
    "Null Strategy: implements interface, does nothing. Safe default, eliminates null checks.",
    "Java Comparator: Collections.sort(list, (a, b) -> a.name().compareTo(b.name()));",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "Original Strategy pattern description with text composition (line-breaking algorithms) as the motivating example.",
    },
    {
      label: "Head First Design Patterns, 2nd Edition",
      kind: "book",
      note: "Opens with Strategy using a duck simulator example, demonstrating composition over inheritance for flying and quacking behaviors.",
    },
    {
      label: "Refactoring Guru - Strategy Pattern", url: "https://refactoring.guru/",
      kind: "article",
      note: "Visual guide with UML, real-world analogy (transportation to airport), and code in multiple languages.",
    },
    {
      label: "Effective Java, 3rd Edition - Item 42: Prefer lambdas to anonymous classes",
      kind: "book",
      note: "Shows how Java 8 lambdas simplify Strategy implementations like Comparator.",
    },
  ],
  glossary: [
    {
      term: "Strategy",
      definition: "A behavioral pattern that encapsulates algorithms in separate classes behind a common interface, making them interchangeable.",
    },
    {
      term: "Context",
      definition: "The class that uses a Strategy and delegates algorithmic work to it without knowing the concrete strategy type.",
    },
    {
      term: "ConcreteStrategy",
      definition: "A specific implementation of the Strategy interface that provides one particular algorithm.",
    },
    {
      term: "Open/Closed Principle",
      definition: "The principle that classes should be open for extension (new strategies) but closed for modification (Context code does not change).",
    },
    {
      term: "Null Object (Null Strategy)",
      definition: "A strategy implementation that does nothing, serving as a safe default to eliminate null checks.",
    },
    {
      term: "Comparator (Java)",
      definition: "A functional interface in Java that serves as a strategy for comparison, passed to sorting methods to define custom ordering.",
    },
  ],
};
