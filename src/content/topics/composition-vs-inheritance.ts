import type { TopicContent } from "../types";

export const compositionVsInheritance: TopicContent = {
  quickSummary: [
    "Inheritance models an 'is-a' relationship (Dog is-a Animal) while composition models a 'has-a' relationship (Car has-a Engine) — composition wires objects together at runtime, inheritance wires classes together at compile time.",
    "The Gang of Four principle 'favor composition over inheritance' exists because inheritance creates tight coupling between parent and child, making hierarchies fragile and hard to change.",
    "Composition achieves code reuse by delegating behavior to contained objects, making it easy to swap implementations at runtime (Strategy pattern) or layer behaviors (Decorator pattern).",
    "Use inheritance when there is a genuine taxonomic relationship and you need polymorphism through a shared interface; use composition for everything else, especially when you need flexibility or the relationship may change.",
  ],
  detailed: [
    "Inheritance is the mechanism by which a subclass acquires the fields and methods of a superclass. It enables polymorphism — you can treat a Dog as an Animal — and provides code reuse by letting subclasses inherit behavior. However, it also creates a rigid compile-time coupling: the subclass depends on the internal implementation details of its parent, not just its public interface. This is the fragile base class problem: changing a method in the parent can silently break subclasses that depend on its behavior.",
    "Composition means building complex objects by combining simpler ones. Instead of a class inheriting behavior, it holds a reference to another object that provides that behavior. The containing class delegates calls to the composed object. This is more flexible because you can change the composed object at runtime, and the containing class depends only on the composed object's interface, not its implementation.",
    "The Strategy pattern is composition in action: a Context class holds a reference to a Strategy interface, and you can swap strategy implementations at runtime. The Decorator pattern uses composition to layer additional behavior on top of existing objects without modifying them. Both patterns demonstrate why composition is more flexible than inheritance for extending behavior.",
    "Languages handle this tension differently. Go has no inheritance at all — it uses struct embedding (composition) and interfaces. Rust uses traits and composition. Java and C# support both but modern guidance strongly favors composition. JavaScript/TypeScript support class inheritance but mixins and functional composition are often preferred.",
    "The diamond problem is another pitfall of inheritance: when a class inherits from two classes that share a common ancestor, ambiguity arises about which version of a method to use. Languages like C++ allow this (with virtual inheritance to resolve it), while Java avoids it by restricting class inheritance to single parent but allowing multiple interface implementation. Composition sidesteps this entirely because there is no inheritance chain — you just hold references to multiple collaborators.",
  ],
  deepDive: [
    "The fragile base class problem is subtle and dangerous. Consider a base class Collection with methods add(item) and addAll(items) where addAll calls add in a loop. A subclass CountingCollection overrides add to increment a counter. If the base class later changes addAll to insert items directly (for performance) instead of calling add, the subclass silently stops counting items added via addAll. The subclass depended on an implementation detail (addAll calling add) that was never part of the contract. This is exactly the scenario Joshua Bloch describes in Effective Java Item 18.",
    "Delegation is the mechanism that makes composition work. In strict delegation (as in Self or Kotlin's 'by' keyword), the delegatee's 'this' refers to the delegator, preserving polymorphism. In forwarding (what most languages call delegation), the composed object's 'this' refers to itself. The distinction matters when the composed object calls back into methods that the containing class might override — with true delegation those callbacks route through the delegator; with forwarding they stay within the composed object.",
    "Mixins and traits are a middle ground. They allow reusing behavior across unrelated classes without full inheritance. Python uses multiple inheritance with MRO (Method Resolution Order) via C3 linearization. Scala has traits that can be stacked with linearization. Ruby has modules. TypeScript can simulate mixins with intersection types and helper functions. These approaches give composition-like flexibility while still using the inheritance mechanism under the hood.",
    "The Liskov Substitution Principle (LSP) gives a rigorous test for when inheritance is appropriate: a subclass must be substitutable for its superclass without altering the correctness of the program. The classic violation is Square extending Rectangle — setting width on a Square must also set height, violating the Rectangle contract. When LSP is violated, composition is almost always the right alternative.",
    "In functional programming, composition is the primary means of building abstractions. Function composition (f . g) pipes the output of one function into another. Higher-order functions, monads, and applicatives are all composition mechanisms. The OOP debate about composition vs inheritance is largely moot in FP because there is no inheritance — everything is composition.",
  ],
  code: [
    {
      language: "java",
      caption: "Fragile Base Class Problem — why inheritance breaks",
      source: `// Base class
public class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c); // BUG: HashSet.addAll calls add() internally!
    }
    // addAll(Arrays.asList("a","b","c")) sets addCount to 6, not 3
    // because addAll increments by 3, then super.addAll calls add() 3 more times
}

// FIX: Use composition instead of inheritance
public class InstrumentedSet<E> implements Set<E> {
    private final Set<E> delegate; // composition
    private int addCount = 0;

    public InstrumentedSet(Set<E> delegate) {
        this.delegate = delegate;
    }

    public boolean add(E e) {
        addCount++;
        return delegate.add(e); // forwarding — no fragile base class issue
    }

    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c); // delegate handles its own internals
    }

    // Forward all other Set methods to delegate...
    public int size() { return delegate.size(); }
    public boolean contains(Object o) { return delegate.contains(o); }
    // ... etc
}`,
    },
    {
      language: "typescript",
      caption: "Strategy Pattern — swapping behavior at runtime via composition",
      source: `// Strategy interface
interface SortStrategy {
  sort(data: number[]): number[];
}

class QuickSort implements SortStrategy {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;
    const pivot = data[0];
    const left = data.slice(1).filter(x => x <= pivot);
    const right = data.slice(1).filter(x => x > pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class MergeSort implements SortStrategy {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;
    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid));
    const right = this.sort(data.slice(mid));
    return this.merge(left, right);
  }
  private merge(a: number[], b: number[]): number[] {
    const result: number[] = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      result.push(a[i] <= b[j] ? a[i++] : b[j++]);
    }
    return [...result, ...a.slice(i), ...b.slice(j)];
  }
}

// Context uses composition — holds a reference to the strategy
class Sorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy) {
    this.strategy = strategy; // swap at runtime!
  }

  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

const sorter = new Sorter(new QuickSort());
sorter.sort([3, 1, 4, 1, 5]); // uses quicksort
sorter.setStrategy(new MergeSort());
sorter.sort([3, 1, 4, 1, 5]); // now uses mergesort`,
    },
    {
      language: "cpp",
      caption: "Decorator Pattern — layering behavior via composition",
      source: `#include <iostream>
#include <memory>
#include <string>

// Component interface
class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& message) = 0;
};

// Concrete component
class EmailNotifier : public Notifier {
public:
    void send(const std::string& message) override {
        std::cout << "Email: " << message << "\\n";
    }
};

// Base decorator -- uses composition (wraps a Notifier)
class NotifierDecorator : public Notifier {
protected:
    std::unique_ptr<Notifier> wrapped_; // composition, not inheritance of behavior
public:
    explicit NotifierDecorator(std::unique_ptr<Notifier> wrapped)
        : wrapped_(std::move(wrapped)) {}

    void send(const std::string& message) override {
        wrapped_->send(message);
    }
};

// Concrete decorators layer additional behavior
class SlackDecorator : public NotifierDecorator {
public:
    using NotifierDecorator::NotifierDecorator;
    void send(const std::string& message) override {
        NotifierDecorator::send(message);
        std::cout << "Slack: " << message << "\\n";
    }
};

class SMSDecorator : public NotifierDecorator {
public:
    using NotifierDecorator::NotifierDecorator;
    void send(const std::string& message) override {
        NotifierDecorator::send(message);
        std::cout << "SMS: " << message << "\\n";
    }
};

int main() {
    // Stack decorators at runtime -- no class explosion
    auto notifier = std::make_unique<SMSDecorator>(
        std::make_unique<SlackDecorator>(
            std::make_unique<EmailNotifier>()));
    notifier->send("Server is down!");
    // Output:
    // Email: Server is down!
    // Slack: Server is down!
    // SMS: Server is down!
    return 0;
}`,
    },
    {
      language: "go",
      caption: "Go uses embedding (composition) instead of inheritance",
      source: `package main

import "fmt"

// Go has NO inheritance. Struct embedding provides composition with
// automatic method forwarding (not inheritance — no polymorphic dispatch).

type Logger struct{}

func (l Logger) Log(msg string) {
    fmt.Println("[LOG]", msg)
}

type Metrics struct{}

func (m Metrics) RecordLatency(ms int) {
    fmt.Printf("[METRIC] latency=%dms\\n", ms)
}

// Server composes Logger and Metrics via embedding
type Server struct {
    Logger      // embedded — Server "has-a" Logger
    Metrics     // embedded — Server "has-a" Metrics
    Port int
}

func main() {
    s := Server{Port: 8080}
    s.Log("starting server")         // promoted from Logger
    s.RecordLatency(42)              // promoted from Metrics

    // But s is NOT a Logger — no is-a relationship
    // var l Logger = s  // compile error!
}

// Interface-based polymorphism with composition
type Animal interface {
    Speak() string
}

type Dog struct {
    Name string
}
func (d Dog) Speak() string { return "Woof!" }

type ServiceDog struct {
    Dog              // composition via embedding
    Certification string
}
// ServiceDog automatically satisfies Animal because Dog.Speak is promoted`,
    },
    {
      language: "kotlin",
      caption: "Kotlin delegation with 'by' keyword — first-class composition",
      source: `// Kotlin makes composition a language feature with 'by'
interface Printer {
    fun print(message: String)
}

class ConsolePrinter : Printer {
    override fun print(message: String) = println("Console: $message")
}

class FilePrinter(private val path: String) : Printer {
    override fun print(message: String) = println("File($path): $message")
}

// 'by' delegates all Printer methods to the composed instance
class LoggingPrinter(printer: Printer) : Printer by printer {
    // Can selectively override methods
    override fun print(message: String) {
        println("LOG: About to print")
        // 'by' handles delegation to the composed printer
    }
}

// Usage: swap printer at construction time
val consolePrinter = LoggingPrinter(ConsolePrinter())
val filePrinter = LoggingPrinter(FilePrinter("/var/log/app.log"))`,
    },
  ],
  diagrams: [
    {
      title: "Inheritance vs Composition Structure",
      kind: "architecture",
      caption: "Structural comparison of deep inheritance hierarchies versus flat composition with capability objects.",
      mermaid: `graph TD
    subgraph Inheritance["Inheritance Hierarchy"]
        BASE["Animal"]
        BASE --> MAMMAL["Mammal"]
        BASE --> BIRD["Bird"]
        MAMMAL --> DOG["Dog"]
        MAMMAL --> CAT["Cat"]
        BIRD --> EAGLE["Eagle"]
        BIRD --> PENGUIN["Penguin - cannot fly!"]
    end
    subgraph Composition["Composition with Behaviours"]
        ENT["Entity"]
        CAN_FLY["Flyable"]
        CAN_SWIM["Swimmable"]
        CAN_RUN["Runnable"]
        ENT_DOG["Dog: run, swim"]
        ENT_EAGLE["Eagle: fly, run"]
        ENT_PENG["Penguin: swim, run"]
        CAN_RUN --> ENT_DOG & ENT_EAGLE & ENT_PENG
        CAN_SWIM --> ENT_DOG & ENT_PENG
        CAN_FLY --> ENT_EAGLE
    end`,
    },
    {
      title: "Choosing Between Composition and Inheritance",
      kind: "flow",
      caption: "Decision flow for selecting composition or inheritance when modelling a relationship in code.",
      mermaid: `flowchart TD
    A["Need to share behaviour"] --> B{"Is-A relationship?"}
    B -->|Yes| C{"Stable hierarchy?"}
    B -->|No| G["Use Composition"]
    C -->|Yes| D{"LSP holds for all subtypes?"}
    C -->|No| G
    D -->|Yes| E["Inheritance is reasonable"]
    D -->|No| G
    G --> H["Inject behaviour as interface"]
    H --> I["Compose at construction time"]
    E --> F["Keep hierarchy shallow max 2 levels"]`,
    },
    {
      title: "Mixin and Interface Composition",
      kind: "state",
      caption: "How an object's effective interface is composed from multiple capability mixins at runtime.",
      mermaid: `stateDiagram-v2
    [*] --> Base
    Base : Base Entity
    Base --> WithLogging : mixin Loggable
    WithLogging --> WithCaching : mixin Cacheable
    WithCaching --> WithAuth : mixin Authorisable
    WithAuth --> FullObject : all capabilities applied
    FullObject --> [*]`,
    },
    {
      title: "Composition Pattern Sequence",
      kind: "sequence",
      caption: "How composed behaviour objects are assembled and delegated to at runtime.",
      mermaid: `sequenceDiagram
    participant Client as Client
    participant Service as OrderService
    participant Logger as LoggingBehaviour
    participant Validator as ValidationBehaviour
    participant Repo as Repository
    Client->>Service: createOrder(data)
    Service->>Logger: log(start)
    Service->>Validator: validate(data)
    Validator-->>Service: valid
    Service->>Repo: save(order)
    Repo-->>Service: saved
    Service->>Logger: log(success)
    Service-->>Client: order created`,
    },
  ],
  animations: [
    {
      title: "Refactoring from Inheritance to Composition",
      steps: [
        { label: "Identify the inheritance", detail: "Class Bird extends Animal with method fly(). Penguin extends Bird but penguins cannot fly — LSP violation." },
        { label: "Extract the behavior", detail: "Create a FlyBehavior interface with implementations CanFly and CannotFly." },
        { label: "Compose instead of inherit", detail: "Bird now has-a FlyBehavior field instead of inheriting fly(). Pass the behavior via constructor." },
        { label: "Runtime flexibility", detail: "A Bird's fly behavior can now be changed at runtime. A baby bird starts with CannotFly and graduates to CanFly." },
      ],
    },
    {
      title: "Diamond Problem Resolution",
      steps: [
        { label: "Setup", detail: "Class A defines method greet(). Classes B and C both extend A and override greet()." },
        { label: "Diamond forms", detail: "Class D extends both B and C. Which greet() does D inherit? This is ambiguous." },
        { label: "Inheritance solutions", detail: "C++ uses virtual inheritance. Python uses MRO (C3 linearization). Java forbids multiple class inheritance." },
        { label: "Composition solution", detail: "D holds references to B and C instances and explicitly chooses which greet() to delegate to. No ambiguity." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Inheritance", "Composition"],
    rows: [
      ["Coupling", "Tight — subclass depends on parent internals", "Loose — depends only on interface"],
      ["Flexibility", "Fixed at compile time", "Swappable at runtime"],
      ["Code reuse", "Automatic — inherit all parent methods", "Explicit — must delegate each method"],
      ["Relationship", "is-a (Dog is-a Animal)", "has-a (Car has-a Engine)"],
      ["Encapsulation", "Broken — subclass sees protected members", "Preserved — only public interface exposed"],
      ["Testing", "Hard to test in isolation", "Easy — mock the composed dependency"],
      ["Diamond problem", "Possible in multiple inheritance", "Not possible — no inheritance chain"],
      ["Polymorphism", "Built-in via subtyping", "Achieved through interfaces"],
    ],
  },
  interviewQA: [
    {
      q: "Why do the Gang of Four say 'favor composition over inheritance'?",
      a: "Because inheritance creates tight coupling between parent and child classes. The subclass depends on the parent's implementation details, not just its interface. This makes the hierarchy fragile — changes to the parent can break subclasses in unexpected ways (fragile base class problem). Composition depends only on interfaces, making code more flexible, testable, and resilient to change.",
      followUps: [
        "Can you give a concrete example of the fragile base class problem?",
        "Does this mean we should never use inheritance?",
      ],
    },
    {
      q: "When IS inheritance the right choice?",
      a: "Inheritance is appropriate when there is a genuine is-a relationship that satisfies the Liskov Substitution Principle — every instance of the subclass can be used wherever the superclass is expected without breaking correctness. Framework extension points (e.g., extending AbstractController) are another valid use. Template Method pattern also relies on inheritance by design. The key test: if the relationship might change, or if you are inheriting just for code reuse without a true taxonomic relationship, use composition instead.",
      followUps: [
        "What is the Liskov Substitution Principle and how does it relate?",
        "Why is Square extending Rectangle a classic LSP violation?",
      ],
    },
    {
      q: "Explain the Strategy pattern and how it uses composition.",
      a: "The Strategy pattern encapsulates a family of algorithms behind a common interface and lets the client swap them at runtime. The Context class holds a reference to a Strategy interface (composition) rather than inheriting algorithm behavior. This means you can add new algorithms without modifying the Context, and you can change the algorithm at runtime — something inheritance cannot do because the class hierarchy is fixed at compile time.",
    },
    {
      q: "What is the diamond problem and how does composition solve it?",
      a: "The diamond problem occurs in multiple inheritance when class D inherits from B and C, which both inherit from A. If B and C override a method from A, it is ambiguous which version D gets. C++ resolves this with virtual inheritance, Python with MRO linearization. Composition avoids the problem entirely: D holds references to B and C instances and explicitly delegates to whichever one is appropriate. There is no inheritance chain to create ambiguity.",
    },
    {
      q: "What is the difference between delegation and forwarding?",
      a: "In forwarding, the wrapper calls methods on the wrapped object, and 'this' inside the wrapped object refers to the wrapped object itself. In true delegation (as in Kotlin's 'by' keyword or the Self language), 'this' inside the delegatee refers to the delegator, preserving self-polymorphism. Forwarding is simpler and more common; true delegation is more powerful but harder to implement manually.",
    },
    {
      q: "How does Go handle the composition vs inheritance question?",
      a: "Go eliminates the debate by having no inheritance at all. It uses struct embedding for composition — an embedded struct's methods are promoted to the outer struct, providing automatic forwarding. Polymorphism is achieved through interfaces, which are satisfied implicitly (structural typing). This design forces composition and makes Go code naturally aligned with the 'favor composition' principle.",
    },
  ],
  followUps: [
    "SOLID Principles — especially Liskov Substitution and Dependency Inversion",
    "Design Patterns — Strategy, Decorator, Template Method, and Adapter patterns",
    "Interfaces & Abstract Classes — the contracts that make composition work",
    "Dependency Injection — a composition-based technique for managing dependencies",
    "Mixins and Traits — a middle ground between inheritance and composition",
    "Functional Composition — how FP achieves reuse without objects or inheritance",
  ],
  mcqs: [
    {
      q: "What is the primary risk of deep inheritance hierarchies?",
      options: [
        "Increased memory usage from vtable lookups",
        "Fragile base class problem — parent changes break subclasses",
        "Slower compilation times due to class resolution",
        "Inability to use polymorphism",
      ],
      answerIndex: 1,
      explanation: "The fragile base class problem is the core risk: subclasses depend on parent implementation details, so changes to the parent can silently break subclasses even when the public interface is unchanged.",
    },
    {
      q: "Which pattern is the classic example of composition enabling runtime behavior swapping?",
      options: [
        "Singleton pattern",
        "Template Method pattern",
        "Strategy pattern",
        "Factory Method pattern",
      ],
      answerIndex: 2,
      explanation: "The Strategy pattern encapsulates algorithms behind an interface and lets the context hold a reference to swap implementations at runtime — this is composition in its purest form.",
    },
    {
      q: "In the Decorator pattern, how is additional behavior added?",
      options: [
        "By subclassing and overriding methods",
        "By wrapping an object and delegating calls through a chain",
        "By modifying the original class at runtime",
        "By using static utility methods",
      ],
      answerIndex: 1,
      explanation: "Decorators wrap the original object (composition), forward calls to it, and add behavior before or after. Multiple decorators can be stacked to combine behaviors without modifying any class.",
    },
    {
      q: "Why does the Square-extends-Rectangle example violate LSP?",
      options: [
        "Because Square has fewer fields than Rectangle",
        "Because setting width on a Square must also change height, breaking Rectangle's contract",
        "Because Square cannot implement area()",
        "Because Rectangle is a concrete class",
      ],
      answerIndex: 1,
      explanation: "Rectangle's contract allows width and height to be set independently. Square violates this by coupling them — code that expects a Rectangle and sets width then height will get unexpected results with a Square.",
    },
    {
      q: "How does Go achieve polymorphism without inheritance?",
      options: [
        "Through struct embedding and implicit interface satisfaction",
        "Through generics and type parameters only",
        "Through runtime reflection and type assertions",
        "Through function overloading",
      ],
      answerIndex: 0,
      explanation: "Go uses struct embedding (composition) for code reuse and implicit interfaces (structural typing) for polymorphism. A type satisfies an interface by implementing its methods — no explicit 'implements' declaration needed.",
    },
    {
      q: "What is the key difference between delegation and forwarding?",
      options: [
        "Delegation is synchronous, forwarding is asynchronous",
        "In delegation 'this' refers to the delegator; in forwarding 'this' refers to the wrapped object",
        "Forwarding requires an interface; delegation does not",
        "Delegation is only possible in dynamic languages",
      ],
      answerIndex: 1,
      explanation: "In true delegation, the delegatee's 'this' refers to the delegator (preserving self-polymorphism). In forwarding, 'this' refers to the wrapped object itself. Most languages implement forwarding rather than true delegation.",
    },
  ],
  exercises: [
    "Refactor a class hierarchy where Bird extends Animal and Penguin extends Bird. Penguin inherits fly() but penguins cannot fly. Use composition with a FlyBehavior interface to fix the design.",
    "Implement the Decorator pattern: create a base DataSource interface with read()/write() methods, then create decorators for Encryption, Compression, and Logging that can be stacked in any order.",
    "Build a payment processing system using the Strategy pattern. Support CreditCard, PayPal, and Cryptocurrency payment methods that can be selected at runtime.",
    "Take the classic Shape hierarchy (Shape -> Circle, Rectangle, Triangle) and redesign it using composition. Extract drawing behavior, area calculation, and serialization into separate composed strategies.",
    "Implement a logging framework where output destinations (console, file, network) and formatting (JSON, plain text, structured) are composed independently, avoiding a combinatorial explosion of subclasses.",
  ],
  flashcards: [
    { front: "What is the fragile base class problem?", back: "When changes to a base class break subclasses because they depend on the parent's implementation details (not just its interface). Example: base class changes internal method call patterns, silently breaking subclass overrides." },
    { front: "What relationship does composition model?", back: "Has-a. A Car has-a Engine. The containing object delegates behavior to the composed object rather than inheriting it." },
    { front: "What relationship does inheritance model?", back: "Is-a. A Dog is-a Animal. The subclass is a specialized version of the superclass and should be substitutable for it (LSP)." },
    { front: "How does the Strategy pattern use composition?", back: "The Context class holds a reference to a Strategy interface. Concrete strategy implementations can be swapped at runtime without modifying the Context." },
    { front: "How does Go handle code reuse without inheritance?", back: "Struct embedding — an embedded struct's methods are promoted to the outer struct, providing automatic forwarding. Polymorphism comes from implicit interface satisfaction." },
    { front: "What is the diamond problem?", back: "In multiple inheritance, when class D inherits from B and C which both inherit from A, it is ambiguous which version of an overridden method D gets. Composition avoids this by using explicit delegation." },
    { front: "What does Kotlin's 'by' keyword do?", back: "It implements true delegation at the language level — automatically forwarding all interface methods to a composed instance, with the option to selectively override." },
    { front: "When should you use inheritance over composition?", back: "When there is a genuine is-a relationship satisfying LSP, when using framework extension points designed for inheritance, or when implementing the Template Method pattern." },
  ],
  revisionNotes: [
    "Favor composition over inheritance (GoF) — composition gives loose coupling, runtime flexibility, and better encapsulation.",
    "Fragile base class problem: subclasses depend on parent internals, so parent changes break subclasses even if the public API is stable.",
    "Strategy pattern = composition for algorithm selection. Decorator pattern = composition for behavior layering. Both avoid subclass explosion.",
    "Delegation vs forwarding: delegation preserves self-polymorphism (this = delegator), forwarding does not (this = wrapped object).",
    "LSP is the test for valid inheritance: every subclass instance must be substitutable for the superclass without breaking correctness.",
    "Go eliminates the debate — no inheritance, only struct embedding (composition) and implicit interfaces.",
    "The diamond problem arises from multiple inheritance. Composition avoids it entirely. Java avoids it by restricting to single class inheritance.",
  ],
  cheatSheet: [
    "is-a → consider inheritance | has-a → use composition",
    "If you inherit just for code reuse (not taxonomic relationship) → switch to composition",
    "If the relationship might change at runtime → composition (Strategy pattern)",
    "If you need to layer behaviors → composition (Decorator pattern)",
    "If the base class is outside your control → use composition wrapper (Effective Java Item 18)",
    "If LSP is violated (Square/Rectangle) → do not inherit, compose instead",
    "Go: struct embedding = composition, interfaces = polymorphism, no inheritance",
    "Kotlin 'by' keyword = first-class delegation syntax for composition",
  ],
  resources: [
    { label: "Effective Java, Item 18: Favor Composition over Inheritance", kind: "book", note: "Joshua Bloch's definitive treatment of why composition beats inheritance, with the InstrumentedHashSet example." },
    { label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)", kind: "book", note: "The original source of 'favor object composition over class inheritance' — Chapter 1." },
    { label: "Head First Design Patterns — Strategy and Decorator chapters", kind: "book", note: "Approachable introduction to composition-based patterns with the SimUDuck example." },
    { label: "Composition over Inheritance — Wikipedia", kind: "article", note: "Good overview of the principle with examples in multiple languages." },
    { label: "Go Blog: Embedding", kind: "docs", note: "Official documentation on how Go uses struct embedding as its composition mechanism." },
    { label: "Kotlin Delegation — Official Docs", kind: "docs", note: "How Kotlin's 'by' keyword provides language-level support for the delegation pattern." },
  ],
  glossary: [
    { term: "Composition", definition: "Building complex objects by combining simpler ones via has-a references, delegating behavior to the composed objects." },
    { term: "Inheritance", definition: "A mechanism where a subclass acquires fields and methods from a superclass, modeling an is-a relationship." },
    { term: "Delegation", definition: "Forwarding method calls from a containing object to a composed object. True delegation preserves self-polymorphism." },
    { term: "Fragile Base Class Problem", definition: "When changes to a base class silently break subclasses because they depended on internal implementation details." },
    { term: "Strategy Pattern", definition: "A behavioral design pattern that uses composition to encapsulate a family of algorithms behind a common interface, making them interchangeable at runtime." },
    { term: "Decorator Pattern", definition: "A structural design pattern that wraps an object to add behavior, using composition to stack layers of functionality." },
    { term: "Diamond Problem", definition: "Ambiguity in multiple inheritance when two parent classes override the same method from a shared grandparent." },
    { term: "Liskov Substitution Principle", definition: "Subclasses must be substitutable for their superclasses without altering program correctness — the test for valid inheritance." },
  ],
};
