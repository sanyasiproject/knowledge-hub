import type { TopicContent } from "../types";

export const interfacesAbstractClasses: TopicContent = {
  quickSummary: [
    "An interface defines a contract — a set of method signatures that implementing classes must provide — without any implementation. It specifies WHAT a type can do, not HOW it does it.",
    "An abstract class is a partially implemented class that cannot be instantiated directly. It provides shared code (concrete methods, fields) alongside abstract methods that subclasses must implement.",
    "Java/C# allow implementing multiple interfaces but extending only one class. This makes interfaces the primary tool for polymorphism across unrelated types, while abstract classes share implementation within a family.",
    "Go and TypeScript use structural typing (a type satisfies an interface if it has the right methods/shape), while Java, C#, and Kotlin use nominal typing (explicit 'implements' declaration required).",
  ],
  detailed: [
    "Interfaces represent pure abstraction — a contract that decouples consumers from implementations. When code depends on an interface rather than a concrete class, you can swap implementations without changing the consumer. This is the Dependency Inversion Principle in action: high-level modules depend on abstractions, not details. Interfaces enable polymorphism across unrelated type hierarchies — a Dog and a Robot can both implement Walkable without sharing any common ancestor.",
    "Abstract classes sit between full interfaces and concrete classes. They can hold state (fields), provide default method implementations, and define constructors. Subclasses inherit both the contract and the shared implementation. This makes abstract classes ideal for the Template Method pattern, where the abstract class defines an algorithm skeleton and subclasses fill in specific steps. The tradeoff is that you can only extend one abstract class (in Java/C#), limiting flexibility.",
    "Java 8 introduced default methods in interfaces, blurring the line between interfaces and abstract classes. Default methods allow interfaces to provide implementations without breaking existing implementors. However, interfaces still cannot hold instance state — they can only have static final fields. This limitation preserves the key distinction: interfaces define behavior contracts, abstract classes share implementation and state.",
    "Go takes a radically different approach: interfaces are satisfied implicitly. A type implements an interface simply by having methods with matching signatures — no 'implements' keyword. This structural typing enables interfaces to be defined by the consumer rather than the provider, following the Interface Segregation Principle naturally. Go's standard library defines many small interfaces (io.Reader, io.Writer, fmt.Stringer) that types satisfy without knowing about them.",
    "Rust uses traits instead of interfaces/abstract classes. Traits can define method signatures (like interfaces), provide default implementations (like abstract classes), and be composed (a trait can require other traits). Scala also has traits with similar capabilities. Both languages avoid the rigid interface-vs-abstract-class distinction by combining the best of both into a single mechanism.",
  ],
  deepDive: [
    "The evolution of Java interfaces shows the tension between purity and pragmatism. Pre-Java-8 interfaces were pure contracts. Java 8 added default methods to enable interface evolution without breaking implementors (the motivating case was adding stream() to Collection). Java 9 added private methods in interfaces for implementation sharing between default methods. Java 17 added sealed interfaces to restrict which classes can implement them. Each addition trades some conceptual purity for practical capability.",
    "Structural vs nominal typing has deep implications for API design. In nominal typing (Java/C#), the author of a class decides which interfaces it implements at definition time. In structural typing (Go/TypeScript), any code can define an interface that existing types already satisfy. This means Go interfaces can be defined close to where they are used, not where types are defined — producing smaller, more focused interfaces naturally. TypeScript's structural typing means you rarely need to explicitly implement an interface; if your object has the right shape, it works.",
    "Marker interfaces (like Java's Serializable) carry no methods — they exist purely to tag a type with a capability. The alternative is annotations (@Serializable), but marker interfaces have a compile-time advantage: you can use them as type parameters (List<Serializable>) while annotations cannot be used in generics. Sealed interfaces (Java 17+) take this further by restricting the set of implementors, enabling exhaustive pattern matching in switch expressions.",
    "Multiple inheritance of type (implementing multiple interfaces) vs multiple inheritance of implementation (extending multiple classes) is a critical distinction. Most mainstream languages allow the former but forbid the latter (Java, C#, Kotlin). The reason: multiple implementation inheritance creates the diamond problem and ambiguity about field ownership. Interfaces avoid this because they carry no state (pre-default-methods) or at most stateless default methods. C++ and Python allow full multiple inheritance but require explicit conflict resolution (virtual inheritance in C++, MRO in Python).",
    "The dependency injection principle relies heavily on interfaces. By depending on an interface (e.g., UserRepository) rather than a concrete class (e.g., PostgresUserRepository), you can inject different implementations for testing (InMemoryUserRepository), different environments (DynamoUserRepository), or different feature flags. Abstract classes can serve this purpose too, but interfaces are preferred because they impose no inheritance hierarchy — the implementation classes can extend whatever they need.",
  ],
  code: [
    {
      language: "java",
      caption: "Interface vs Abstract Class — when to use each",
      source: `// Interface: pure contract, multiple implementation
public interface Drawable {
    void draw();                    // abstract — must implement
    default String format() {       // default — optional to override (Java 8+)
        return "SVG";
    }
}

public interface Resizable {
    void resize(double factor);
}

// A class can implement multiple interfaces
public class Circle implements Drawable, Resizable {
    private double radius;

    public Circle(double radius) { this.radius = radius; }

    @Override
    public void draw() { System.out.println("Drawing circle r=" + radius); }

    @Override
    public void resize(double factor) { radius *= factor; }
}

// Abstract class: shared state + partial implementation
public abstract class Shape {
    protected String color;       // state — interfaces can't have this
    protected Point position;

    public Shape(String color, Point position) {  // constructor
        this.color = color;
        this.position = position;
    }

    // Template Method: defines the algorithm skeleton
    public final void render() {
        validate();                // concrete step
        computeBounds();           // abstract step — subclass fills in
        draw();                    // abstract step
    }

    private void validate() {
        if (color == null) throw new IllegalStateException("No color");
    }

    protected abstract Rectangle computeBounds();
    protected abstract void draw();
}

// Sealed interface (Java 17+): restricts implementors
public sealed interface Payment permits CreditCard, PayPal, BankTransfer {
    BigDecimal amount();
}
// Only CreditCard, PayPal, BankTransfer can implement Payment
// Enables exhaustive switch:
// switch (payment) {
//     case CreditCard cc -> ...
//     case PayPal pp -> ...
//     case BankTransfer bt -> ...
//     // no default needed — compiler knows it's exhaustive
// }`,
    },
    {
      language: "typescript",
      caption: "Structural typing — interfaces as shapes, not declarations",
      source: `// TypeScript interfaces describe the SHAPE of data
interface Printable {
  print(): void;
}

interface Serializable {
  toJSON(): string;
}

// No "implements" needed — structural typing
class Report {
  constructor(private title: string, private data: unknown[]) {}

  print(): void {
    console.log(\`Report: \${this.title}\`);
  }

  toJSON(): string {
    return JSON.stringify({ title: this.title, data: this.data });
  }
}

// Report satisfies both interfaces implicitly
function printItem(item: Printable): void {
  item.print();
}

function serialize(item: Serializable): string {
  return item.toJSON();
}

const report = new Report("Q4", [1, 2, 3]);
printItem(report);     // works — Report has print()
serialize(report);     // works — Report has toJSON()

// Abstract class in TypeScript — can hold state and provide implementations
abstract class BaseRepository<T> {
  protected items: Map<string, T> = new Map();

  findById(id: string): T | undefined {
    return this.items.get(id);  // shared implementation
  }

  abstract save(entity: T): void;    // subclass must implement
  abstract delete(id: string): void; // subclass must implement
}

class UserRepository extends BaseRepository<User> {
  save(user: User): void {
    this.items.set(user.id, user);
  }
  delete(id: string): void {
    this.items.delete(id);
  }
}

// Intersection types combine multiple interfaces
type Loggable = Printable & Serializable;
// Any object with both print() and toJSON() satisfies Loggable`,
    },
    {
      language: "go",
      caption: "Go interfaces — implicit satisfaction, small and composable",
      source: `package main

import (
    "fmt"
    "io"
)

// Go interfaces are implicitly satisfied — no "implements" keyword
// Convention: small interfaces, often single method

type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// Compose interfaces by embedding
type ReadWriter interface {
    Reader
    Writer
}

// Any type with Read([]byte)(int, error) satisfies Reader
type FileReader struct {
    path string
}

func (f FileReader) Read(p []byte) (int, error) {
    // FileReader satisfies Reader without declaring it
    fmt.Printf("Reading from %s\n", f.path)
    return len(p), nil
}

// Consumer defines the interface it needs (ISP)
type Stringer interface {
    String() string
}

type User struct {
    Name  string
    Email string
}

func (u User) String() string {
    return fmt.Sprintf("%s <%s>", u.Name, u.Email)
}

// User satisfies fmt.Stringer without importing fmt at definition

// Empty interface = any type (like Object in Java)
func printAnything(v interface{}) {
    fmt.Println(v)
}

// Type assertion to recover concrete type
func describe(r Reader) {
    if fr, ok := r.(FileReader); ok {
        fmt.Println("It's a FileReader for", fr.path)
    }
}

// Accept interfaces, return structs — Go proverb
func NewReader(path string) FileReader {  // returns concrete type
    return FileReader{path: path}
}

func Process(r io.Reader) error {  // accepts interface
    buf := make([]byte, 1024)
    _, err := r.Read(buf)
    return err
}`,
    },
    {
      language: "rust",
      caption: "Rust traits — interfaces + default methods + trait bounds",
      source: `// Traits combine interface contracts with default implementations

trait Summary {
    fn summarize_author(&self) -> String;  // required

    // Default implementation — can use other trait methods
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

struct Article {
    title: String,
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }

    // Override default summarize
    fn summarize(&self) -> String {
        format!("{}, by {} — {}", self.title, self.author, &self.content[..50])
    }
}

struct Tweet {
    username: String,
    content: String,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
    // Uses default summarize() implementation
}

// Trait bounds — "generic with constraints" (like Java's <T extends Interface>)
fn notify(item: &impl Summary) {
    println!("Breaking: {}", item.summarize());
}

// Multiple trait bounds
fn display_and_summarize(item: &(impl Summary + std::fmt::Display)) {
    println!("{}", item);
    println!("{}", item.summarize());
}

// Trait objects for dynamic dispatch (like interface references in Java)
fn get_summaries(items: &[&dyn Summary]) -> Vec<String> {
    items.iter().map(|i| i.summarize()).collect()
}

// Supertraits — trait inheritance
trait DetailedSummary: Summary + std::fmt::Display {
    fn detailed_summary(&self) -> String;
}`,
    },
  ],
  diagrams: [
    {
      title: "Interface vs Abstract Class Feature Comparison",
      kind: "architecture",
      caption: "Interfaces provide pure contracts with no state. Abstract classes add shared state, constructors, and partial implementation at the cost of single inheritance.",
      mermaid: `graph LR
    subgraph Interface["Interface"]
      IC["Contract only\nmethod signatures"]
      IM["Multiple implementation\nallowed"]
      IS["No instance state\nno constructors"]
      ID["Default methods\nJava 8+"]
    end
    subgraph AbstractClass["Abstract Class"]
      AC["Contract plus\npartial implementation"]
      AS["Instance state\nand constructors"]
      AI["Single inheritance\nonly"]
      AT["Template Method\npattern support"]
    end
    Interface -->|"use for cross-cutting\ncapabilities"| USE1["Unrelated types\nsharing a contract"]
    AbstractClass -->|"use for shared\nbase implementation"| USE2["Family of related\ntypes"]`,
    },
    {
      title: "Structural vs Nominal Typing Decision Flow",
      kind: "flow",
      caption: "In nominal typing a class must declare implements. In structural typing having matching methods is sufficient. This affects where interfaces can be defined.",
      mermaid: `flowchart TD
    A["Define a type T"] --> B{"Language typing\ndiscipline?"}
    B -->|Nominal\nJava C#| C["T must explicitly\ndeclare implements I"]
    B -->|Structural\nGo TypeScript| D["T just needs\nmatching method signatures"]
    C --> E["Interface defined\nby the provider\nat type definition site"]
    D --> F["Interface can be defined\nby the consumer\nwhere it is used"]
    E --> G["Tight coupling\nbetween type and interface"]
    F --> H["Loose coupling\nnatural ISP"]`,
    },
    {
      title: "Dependency Injection via Interface",
      kind: "sequence",
      caption: "By depending on an interface rather than a concrete class, OrderService can work with any implementation — PostgresRepo in production, InMemoryRepo in tests.",
      mermaid: `sequenceDiagram
    participant App as Application
    participant OS as OrderService
    participant I as OrderRepository interface
    participant PG as PostgresOrderRepo
    participant MEM as InMemoryOrderRepo
    App->>OS: new OrderService(repo)
    Note over App,PG: Production
    App->>PG: inject
    OS->>I: save(order)
    I->>PG: save(order)
    PG-->>OS: saved
    Note over App,MEM: Tests
    App->>MEM: inject
    OS->>I: save(order)
    I->>MEM: save(order)
    MEM-->>OS: saved`,
    },
    {
      title: "Java Interface Evolution",
      kind: "state",
      caption: "Java interfaces evolved from pure abstract contracts to support default methods, private methods, and sealed restrictions across major releases.",
      mermaid: `stateDiagram-v2
    [*] --> Java7
    Java7: Java 7 - Abstract only\nmethod signatures only\nany change breaks all implementors
    Java7 --> Java8
    Java8: Java 8 - Default methods\nbackward-compatible evolution\nstream forEach added to Collection
    Java8 --> Java9
    Java9: Java 9 - Private methods\nshare code between default methods\nno duplication in interface
    Java9 --> Java17
    Java17: Java 17 - Sealed interfaces\npermits clause restricts implementors\nexhaustive pattern matching enabled`,
    },
  ],
  animations: [
    {
      title: "Default Method Evolution in Java Interfaces",
      steps: [
        { label: "Java 7 interface", detail: "Pure abstract contract — only method signatures. Any change to the interface breaks all implementors." },
        { label: "Java 8 default methods", detail: "Interfaces can provide default implementations. Existing implementors inherit the default without code changes. Collection.stream() was added this way." },
        { label: "Java 9 private methods", detail: "Interfaces can share implementation between default methods via private methods. Reduces code duplication within the interface." },
        { label: "Java 17 sealed interfaces", detail: "Interfaces can restrict which classes implement them. Enables exhaustive pattern matching — the compiler knows all possible implementations." },
      ],
    },
    {
      title: "Dependency Inversion via Interfaces",
      steps: [
        { label: "Direct dependency", detail: "OrderService creates PostgresOrderRepo directly. Tightly coupled — cannot test without a database, cannot swap storage." },
        { label: "Extract interface", detail: "Define OrderRepository interface with save(), findById() methods. OrderService depends on the interface, not PostgresOrderRepo." },
        { label: "Inject implementation", detail: "Pass the concrete repo to OrderService via constructor. In production: PostgresOrderRepo. In tests: InMemoryOrderRepo." },
        { label: "New requirement", detail: "Need DynamoDB support? Implement OrderRepository with DynamoOrderRepo. OrderService needs zero changes — it depends only on the interface." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Interface", "Abstract Class", "Trait (Rust/Scala)"],
    rows: [
      ["Instance state (fields)", "No (Java/C#) / N/A (Go)", "Yes", "No (Rust) / Yes (Scala)"],
      ["Constructors", "No", "Yes", "No"],
      ["Multiple implementation", "Yes", "No (single inheritance)", "Yes"],
      ["Default method bodies", "Yes (Java 8+, C# 8+)", "Yes", "Yes"],
      ["Access modifiers", "Public only (Java) / All (C#)", "All (public, protected, private)", "Public by default"],
      ["Static methods", "Yes (Java 8+)", "Yes", "Yes (associated functions)"],
      ["Typing discipline", "Nominal (Java/C#) or Structural (Go/TS)", "Nominal", "Nominal with coherence rules"],
      ["Use case", "Cross-cutting contracts", "Shared base implementation", "Composable behavior units"],
    ],
  },
  interviewQA: [
    {
      q: "When should you use an interface vs an abstract class?",
      a: "Use an interface when you need a contract that unrelated classes can implement — especially when a class needs to conform to multiple contracts. Use an abstract class when you have a family of related classes that share state and implementation. The key heuristic: if the types form an is-a hierarchy with shared code, abstract class. If the types are unrelated but share a capability, interface.",
      followUps: [
        "What changed with Java 8 default methods — did it make abstract classes obsolete?",
        "Can you give an example where both are used together effectively?",
      ],
    },
    {
      q: "What are default methods in Java interfaces, and why were they added?",
      a: "Default methods allow interfaces to provide method implementations. They were added in Java 8 primarily to evolve the Collections API — adding stream(), forEach(), etc. — without breaking millions of existing Collection implementations. Without default methods, adding a method to an interface would break every class that implements it. Default methods provide backward-compatible interface evolution.",
      followUps: [
        "What happens if a class implements two interfaces with the same default method?",
        "How do default methods interact with the diamond problem?",
      ],
    },
    {
      q: "Explain structural typing vs nominal typing with examples.",
      a: "In nominal typing (Java, C#), a type must explicitly declare 'implements SomeInterface' — having the right methods is not enough. In structural typing (Go, TypeScript), a type satisfies an interface if it has all the required methods/properties with matching signatures, regardless of declaration. For example, in Go, any type with a String() method satisfies fmt.Stringer automatically. This enables defining interfaces close to consumers rather than at the type definition site.",
    },
    {
      q: "What is the Interface Segregation Principle (ISP)?",
      a: "ISP states that no client should be forced to depend on methods it does not use. Instead of one large interface, define multiple small focused ones. Go's standard library exemplifies this: io.Reader, io.Writer, and io.Closer are separate single-method interfaces. Types implement only what they need, and composed interfaces (io.ReadWriteCloser) combine them for consumers that need more.",
      followUps: [
        "How does ISP relate to the Single Responsibility Principle?",
        "What is the 'fat interface' anti-pattern?",
      ],
    },
    {
      q: "What are sealed interfaces and why do they matter?",
      a: "Sealed interfaces (Java 17+) restrict which classes can implement them using a 'permits' clause. This gives the compiler a closed set of implementations, enabling exhaustive pattern matching in switch expressions without a default case. If you add a new implementation, the compiler flags every switch that needs updating. This is the algebraic data type pattern from functional programming brought to Java's type system.",
    },
    {
      q: "How do Rust traits differ from Java interfaces?",
      a: "Rust traits combine the roles of interfaces and abstract classes: they define method contracts, can provide default implementations, and support trait bounds (generics constraints). Unlike Java interfaces, Rust traits participate in the ownership system and can be used as trait objects for dynamic dispatch (dyn Trait) or with static dispatch via monomorphization (impl Trait). Rust also enforces the orphan rule — you can only implement a trait for a type if you own either the trait or the type — preventing conflicting implementations.",
    },
    {
      q: "What is a marker interface and when would you use one?",
      a: "A marker interface has no methods — it exists solely to tag a type with a capability or characteristic. Java's Serializable and Cloneable are classic examples. The advantage over annotations is that marker interfaces create a type you can use in generics (List<Serializable>) and method signatures. The disadvantage is that they add to the type hierarchy. Modern Java tends to prefer annotations for metadata, but marker interfaces remain useful when you need compile-time type checking.",
    },
  ],
  followUps: [
    "Composition vs Inheritance — interfaces enable composition-based design",
    "SOLID Principles — Interface Segregation and Dependency Inversion rely on interfaces",
    "Design Patterns — Strategy, Observer, and Factory patterns use interfaces extensively",
    "Generics and Type Parameters — trait bounds and bounded type parameters constrain generics via interfaces",
    "Dependency Injection — interfaces are the abstraction layer that makes DI possible",
  ],
  mcqs: [
    {
      q: "Which of the following can an interface in Java 17 contain?",
      options: [
        "Instance fields and constructors",
        "Abstract methods, default methods, static methods, and private methods",
        "Protected methods and mutable state",
        "Only abstract method signatures",
      ],
      answerIndex: 1,
      explanation: "Java interfaces can have abstract methods (always), default methods (Java 8+), static methods (Java 8+), and private methods (Java 9+). They cannot have instance fields, constructors, or non-public-abstract methods that are not default/static/private.",
    },
    {
      q: "In Go, how does a type implement an interface?",
      options: [
        "By declaring 'implements InterfaceName'",
        "By using the @Override annotation",
        "By having methods that match the interface's method signatures",
        "By embedding the interface type",
      ],
      answerIndex: 2,
      explanation: "Go uses structural typing — a type implements an interface implicitly by having all the methods the interface requires. No explicit declaration is needed. This is fundamentally different from Java's nominal typing.",
    },
    {
      q: "What problem do sealed interfaces solve?",
      options: [
        "They prevent classes from being subclassed further",
        "They enable exhaustive pattern matching by restricting the set of implementors",
        "They make interfaces faster at runtime",
        "They allow interfaces to hold mutable state",
      ],
      answerIndex: 1,
      explanation: "Sealed interfaces restrict which classes can implement them. This gives the compiler a known, closed set of types, enabling exhaustive switch expressions without a default case. Adding a new implementor causes compilation errors at every unhandled switch.",
    },
    {
      q: "Why were default methods added to Java interfaces in Java 8?",
      options: [
        "To make abstract classes obsolete",
        "To allow backward-compatible interface evolution (e.g., adding stream() to Collection)",
        "To enable multiple inheritance of state",
        "To improve runtime performance of interface dispatch",
      ],
      answerIndex: 1,
      explanation: "Default methods were added so that new methods could be added to existing interfaces without breaking all implementors. The driving use case was adding functional-style methods (stream, forEach) to the Collection hierarchy.",
    },
    {
      q: "What is the orphan rule in Rust?",
      options: [
        "A trait cannot have more than one default method",
        "You can only implement a trait for a type if you own either the trait or the type",
        "Orphan types cannot implement any traits",
        "Traits without implementations are automatically removed by the compiler",
      ],
      answerIndex: 1,
      explanation: "The orphan rule ensures coherence — preventing conflicting trait implementations. You must own either the trait or the type (or both) to write an impl block. This prevents two crates from providing conflicting implementations of the same trait for the same type.",
    },
    {
      q: "Which typing discipline does TypeScript use for interfaces?",
      options: [
        "Nominal typing — explicit 'implements' is required",
        "Structural typing — matching shape is sufficient",
        "Duck typing with no compile-time checks",
        "Dependent typing with proof terms",
      ],
      answerIndex: 1,
      explanation: "TypeScript uses structural typing. An object satisfies an interface if it has all the required properties and methods with matching types. While you can write 'implements' for documentation and error messages, it is not required — the structural check is what matters.",
    },
  ],
  exercises: [
    "Design a plugin system using interfaces. Define a Plugin interface with init(), execute(), and shutdown() methods. Create three concrete plugins (LoggingPlugin, MetricsPlugin, CachingPlugin) and a PluginManager that loads and orchestrates them.",
    "Implement the Repository pattern with an interface and multiple backends. Define a Repository<T> interface with CRUD methods. Implement InMemoryRepository for testing and a FileRepository for persistence. Write tests that work against the interface.",
    "In Go, define small interfaces (Reader, Writer, Closer) and create a type that satisfies all three. Then define a composed interface ReadWriteCloser and show that your type satisfies it without any changes.",
    "Refactor a fat interface (a single interface with 10+ methods) into multiple focused interfaces following ISP. Show how existing implementations can implement only the interfaces they need.",
    "Implement a sealed interface hierarchy in Java for an expression evaluator: Expression is sealed, with permitted implementations Literal, BinaryOp, and UnaryOp. Write an eval() method using pattern matching that the compiler verifies is exhaustive.",
  ],
  flashcards: [
    { front: "What can an abstract class have that an interface cannot (in Java)?", back: "Instance fields (mutable state), constructors, protected/private concrete methods, and initialization logic. Interfaces are limited to constants (static final), abstract methods, default methods, static methods, and private methods." },
    { front: "What is structural typing?", back: "A type satisfies an interface if it has all the required methods/properties with matching signatures, regardless of whether it explicitly declares 'implements'. Used by Go and TypeScript." },
    { front: "What is nominal typing?", back: "A type satisfies an interface only if it explicitly declares 'implements' (or equivalent). Having the right methods is not enough. Used by Java, C#, and Kotlin." },
    { front: "What is a marker interface?", back: "An interface with no methods, used to tag a type with a capability (e.g., Java's Serializable). Advantage over annotations: can be used as a type in generics and method signatures." },
    { front: "What is a sealed interface?", back: "An interface that restricts which classes can implement it (Java 17+ 'permits' clause). Enables exhaustive pattern matching — the compiler knows all possible implementations." },
    { front: "What is the Interface Segregation Principle?", back: "No client should be forced to depend on methods it doesn't use. Prefer many small, focused interfaces over one large one. Example: io.Reader, io.Writer, io.Closer in Go." },
    { front: "How do Rust traits differ from Java interfaces?", back: "Traits combine contracts + default implementations, support trait bounds for generics, enable both static (monomorphization) and dynamic (dyn Trait) dispatch, and enforce the orphan rule for coherence." },
    { front: "Why can Java classes implement multiple interfaces but extend only one class?", back: "Multiple interface implementation is safe because interfaces carry no state (only contracts). Multiple class inheritance creates the diamond problem — ambiguity about which fields and method implementations to inherit." },
  ],
  revisionNotes: [
    "Interface = contract (what). Abstract class = partial implementation + contract (what + some how). Trait = both combined.",
    "Java interfaces evolved: abstract-only (Java 7) → default + static methods (Java 8) → private methods (Java 9) → sealed (Java 17).",
    "Use interfaces for cross-cutting concerns (Comparable, Serializable). Use abstract classes for shared base implementation within a type family.",
    "Structural typing (Go, TS): shape matters, not declaration. Nominal typing (Java, C#): explicit 'implements' required.",
    "ISP: prefer small focused interfaces. Go exemplifies this with single-method interfaces (Reader, Writer, Stringer).",
    "Sealed interfaces enable algebraic data types in Java — exhaustive pattern matching with compiler verification.",
    "The orphan rule (Rust) prevents conflicting trait implementations by requiring ownership of either the trait or the type.",
  ],
  cheatSheet: [
    "Need multiple contracts → interface | Need shared state/code → abstract class",
    "Unrelated types sharing a capability → interface | Family of related types → abstract class",
    "Java 8+ default methods allow interface evolution without breaking implementors",
    "Go: implicit interfaces + small single-method interfaces = natural ISP",
    "Sealed interface + pattern matching = exhaustive, compiler-checked branching",
    "Rust trait bounds: fn foo<T: Display + Clone>(x: T) constrains generics via traits",
    "TypeScript: 'implements' is optional documentation — structural checking is what enforces the contract",
    "Marker interface vs annotation: marker gives you a type for generics; annotation gives you runtime metadata",
  ],
  resources: [
    { label: "Effective Java, Items 20-22: Interfaces vs Abstract Classes", kind: "book", note: "Joshua Bloch's guidance on when to use each, including skeletal implementations (AbstractList, AbstractSet)." },
    { label: "Go Proverbs — Accept Interfaces, Return Structs", kind: "article", note: "Rob Pike's design philosophy on Go interfaces and why they should be small." },
    { label: "The Rust Programming Language — Traits Chapter", kind: "docs", note: "Official Rust book covering trait definitions, default implementations, trait bounds, and trait objects." },
    { label: "Java Sealed Classes JEP 409", kind: "docs", note: "The JDK Enhancement Proposal explaining sealed classes and interfaces, their motivation, and exhaustive pattern matching." },
    { label: "TypeScript Handbook — Interfaces", kind: "docs", note: "Official documentation on TypeScript's structural type system and interface declarations." },
    { label: "Design Patterns (GoF) — Strategy, Observer, and Template Method", kind: "book", note: "Patterns that demonstrate the power of programming to interfaces rather than implementations." },
  ],
  glossary: [
    { term: "Interface", definition: "A contract defining method signatures that implementing types must provide. Specifies what a type can do, not how." },
    { term: "Abstract Class", definition: "A partially implemented class that cannot be instantiated. Provides shared code and abstract methods that subclasses must implement." },
    { term: "Trait", definition: "A language feature (Rust, Scala) that combines interface contracts with optional default implementations. Composable and supports bounds." },
    { term: "Structural Typing", definition: "A type system where interface satisfaction is determined by shape (having the right methods/fields), not by explicit declaration." },
    { term: "Nominal Typing", definition: "A type system where interface satisfaction requires an explicit declaration (implements keyword). Having matching methods is not sufficient." },
    { term: "Default Method", definition: "A method in an interface that provides an implementation. Implementors inherit it but can override it. Added to Java in version 8." },
    { term: "Sealed Interface", definition: "An interface that restricts its set of implementors via a permits clause, enabling exhaustive compile-time checking." },
    { term: "Marker Interface", definition: "An interface with no methods, used purely to tag a type with a characteristic (e.g., Serializable)." },
  ],
};
