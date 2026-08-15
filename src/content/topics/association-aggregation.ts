import type { TopicContent } from "../types";

export const associationAggregation: TopicContent = {
  quickSummary: [
    "Association is a structural relationship where one object 'uses' or 'knows about' another without implying ownership — both objects have independent lifecycles and neither is responsible for creating or destroying the other.",
    "Aggregation is a specialised association that models a whole-part (has-a) relationship with shared ownership: the part can exist independently of the whole. In UML it is drawn as an open diamond on the whole's end.",
    "Composition is the strongest form — it models exclusive ownership where the part's lifecycle is bound to the whole. Destroying the whole destroys the parts. In UML it is drawn as a filled diamond.",
    "The progression Association -> Aggregation -> Composition represents increasing coupling: from 'uses-a' to 'has-a (shared)' to 'has-a (exclusive, lifecycle-bound)'.",
  ],
  detailed: [
    "In object-oriented modelling, the way objects relate to each other is as important as the objects themselves. Association, aggregation, and composition describe structural relationships between classes, each with different semantics around ownership, lifecycle management, and coupling. Understanding these distinctions is critical for producing clean domain models, choosing the right data structures, and making defensible architectural decisions.",
    "Association is the most general relationship: class A 'knows about' or 'uses' class B. There is no ownership implication. A Teacher teaches many Students, and a Student is taught by many Teachers — neither creates nor destroys the other. Associations carry multiplicity (1..*, 0..1, etc.), navigability (unidirectional or bidirectional), and may be named or have role labels. In code, an association typically manifests as a field that holds a reference (or a collection of references) passed in from outside.",
    "Aggregation refines association into a whole-part hierarchy. A Department aggregates Employees — the department 'has' employees, but if the department is dissolved, the employees continue to exist and can join other departments. The 'part' object's lifecycle is not governed by the 'whole'. In memory-managed languages (Java, C#, Python, TypeScript), aggregation is often indistinguishable from association at the code level because both are simply references. The distinction lives in the domain semantics, not in the syntax. In C++, aggregation is modelled with raw pointers or references (non-owning), while composition uses value members or std::unique_ptr (owning).",
    "Composition is the strongest coupling: the whole exclusively owns the part and controls its lifecycle. A House is composed of Rooms — destroying the house destroys the rooms; a room cannot belong to two houses simultaneously. In code, this means the whole is responsible for constructing and destructing its parts. In C++, this maps naturally to member objects (value semantics) or unique_ptr. In Java/TypeScript, composition is enforced by creating the part inside the whole's constructor and never exposing a setter that would let external code replace or share the reference.",
    "A common design pitfall is treating every reference as composition. Over-coupling lifecycle management limits reuse and testability. Prefer association when objects merely collaborate, aggregation when the whole organises parts that have independent identity, and composition only when the part is meaningless without the whole. The Dependency Inversion Principle often turns what looks like composition into association — depending on an interface injected from outside rather than a concrete class created internally.",
  ],
  deepDive: [
    "In UML 2.5, association is drawn as a plain line between two classifiers. Aggregation adds an open (hollow) diamond at the whole's end; composition adds a filled (solid) diamond. Both aggregation and composition are technically 'kinds of association' — the UML metamodel defines Property.aggregation as an enumeration with values 'none', 'shared' (aggregation), and 'composite' (composition). A composite association enforces two constraints: (1) multiplicity on the whole's end is 0..1 or 1 (a part cannot be simultaneously owned by multiple wholes), and (2) the part's lifetime is bounded by the whole's — when the whole is destroyed, so are its composite parts (cascade-delete semantics). Shared aggregation imposes neither constraint in the metamodel, which is why the UML specification itself notes that shared aggregation has 'no precise semantics' beyond indicating a whole-part intent.",
    "From a memory-management perspective, C++ makes the distinction concrete. A composite part stored as a direct member (value type) has automatic storage duration tied to the enclosing object — construction and destruction are compiler-guaranteed via RAII. Alternatively, std::unique_ptr<Part> models composition with heap allocation while preserving exclusive ownership. Aggregation is modelled with raw pointers, references, or std::shared_ptr when shared ownership is explicit. In garbage-collected languages, lifecycle coupling must be enforced programmatically: the whole creates the part in its constructor, never leaks a mutable reference, and the garbage collector reclaims the part only after the whole becomes unreachable. Weak references (Java's WeakReference, Python's weakref) are sometimes used to let parts back-reference their whole without preventing collection, avoiding reference cycles that can lead to memory leaks in reference-counted runtimes like CPython.",
    "Database schema design mirrors these relationships. A plain association between two entities is often modelled with a join table (many-to-many) or a foreign key (one-to-many) with no cascade behaviour. Aggregation translates to a foreign key where the child row may have a NULL parent or be reassigned. Composition maps to a foreign key with ON DELETE CASCADE — deleting the parent row automatically deletes all child rows. ORMs like Hibernate, SQLAlchemy, and TypeORM expose cascade options (CascadeType.ALL, cascade='all, delete-orphan', { cascade: true, onDelete: 'CASCADE' }) that directly encode this semantic. Getting cascade configuration wrong is a frequent source of data integrity bugs: too aggressive cascading deletes data the user expected to survive; too lax leaves orphan rows that waste storage and break queries.",
    "In distributed systems, composition becomes problematic because the whole and its parts may reside in different services or databases. The Aggregate pattern from Domain-Driven Design addresses this: an Aggregate is a cluster of domain objects treated as a single transactional unit, with an Aggregate Root that controls access and enforces invariants. Parts inside the aggregate boundary are composed (their lifecycle is managed by the root), while references crossing aggregate boundaries are associations — typically by ID rather than by direct object reference. This prevents distributed transactions and allows each aggregate to be persisted independently. The key design heuristic is: keep aggregates small, reference other aggregates by identity, and use eventual consistency across boundaries.",
    "From a testing and SOLID perspective, composition creates tight coupling that can hinder unit testing. If class Whole hard-codes the creation of Part in its constructor, you cannot substitute a mock or stub for Part without subclassing or reflection hacks. The solution is to promote composition to aggregation at the constructor boundary — accept the part as a constructor parameter (dependency injection) — while still treating it as composition in the domain model (the whole logically owns the part's lifecycle). Inversion-of-control containers (Spring, Guice, tsyringe, Python's dependency-injector) formalise this by managing object graphs externally. The container creates parts, injects them into wholes, and controls lifecycle scopes (singleton, request, transient), effectively decoupling the 'what owns what' domain question from the 'who creates what' infrastructure question.",
  ],
  code: [
    {
      language: "java",
      caption: "Association, aggregation, and composition in Java with lifecycle semantics",
      source: `// --- Association: Teacher uses-a Course (no ownership) ---
class Course {
    private final String code;
    Course(String code) { this.code = code; }
    String getCode() { return code; }
}

class Teacher {
    private final String name;
    private final List<Course> courses = new ArrayList<>();  // association

    Teacher(String name) { this.name = name; }

    // Course is passed in — Teacher neither creates nor destroys it
    void assignCourse(Course c) { courses.add(c); }
    void removeCourse(Course c) { courses.remove(c); }
}

// --- Aggregation: Department has-a Employee (shared ownership) ---
class Employee {
    private final String id;
    Employee(String id) { this.id = id; }
    String getId() { return id; }
}

class Department {
    private final String name;
    private final List<Employee> members = new ArrayList<>();  // aggregation

    Department(String name) { this.name = name; }

    // Employees exist independently; dept does not create or destroy them
    void addMember(Employee e) { members.add(e); }
    void removeMember(Employee e) { members.remove(e); }

    void dissolve() {
        // Employees survive — we just clear the reference list
        members.clear();
    }
}

// --- Composition: House owns-a Room (exclusive, lifecycle-bound) ---
class Room {
    private final String label;
    private final int areaSqM;
    Room(String label, int areaSqM) {
        this.label = label;
        this.areaSqM = areaSqM;
    }
}

class House {
    private final List<Room> rooms;  // composition — created internally

    House(List<String> roomSpecs) {
        // House creates its own rooms — they cannot exist independently
        this.rooms = roomSpecs.stream()
            .map(spec -> {
                String[] parts = spec.split(":");
                return new Room(parts[0], Integer.parseInt(parts[1]));
            })
            .collect(Collectors.toList());
    }

    // No setRooms() or addRoom(Room) — external code cannot inject rooms
    List<Room> getRooms() {
        return Collections.unmodifiableList(rooms);
    }
    // When House is garbage-collected, all Room instances become unreachable too
}`,
    },
    {
      language: "typescript",
      caption: "TypeScript examples showing navigability and multiplicity",
      source: `// --- Association: bidirectional, many-to-many ---
class Student {
  readonly id: string;
  private readonly enrolledCourses: Set<CourseSection> = new Set();

  constructor(id: string) { this.id = id; }

  enroll(course: CourseSection): void {
    this.enrolledCourses.add(course);
    course.addStudent(this);               // bidirectional navigability
  }

  drop(course: CourseSection): void {
    this.enrolledCourses.delete(course);
    course.removeStudent(this);
  }

  getEnrolled(): ReadonlySet<CourseSection> { return this.enrolledCourses; }
}

class CourseSection {
  readonly code: string;
  private readonly students: Set<Student> = new Set();

  constructor(code: string) { this.code = code; }

  addStudent(s: Student): void { this.students.add(s); }
  removeStudent(s: Student): void { this.students.delete(s); }
  getRoster(): ReadonlySet<Student> { return this.students; }
}

// --- Aggregation: Team has Players (players outlive the team) ---
class Player {
  constructor(readonly name: string, readonly rating: number) {}
}

class Team {
  private readonly roster: Player[] = [];

  constructor(readonly teamName: string) {}

  sign(player: Player): void { this.roster.push(player); }  // not created here
  release(player: Player): void {
    const idx = this.roster.indexOf(player);
    if (idx !== -1) this.roster.splice(idx, 1);
    // player still exists — can be signed by another team
  }
}

// --- Composition: Order owns OrderLines (lines are meaningless alone) ---
interface LineItem {
  readonly sku: string;
  readonly qty: number;
  readonly unitPrice: number;
}

class Order {
  private readonly lines: LineItem[] = [];

  constructor(readonly orderId: string, items: { sku: string; qty: number; unitPrice: number }[]) {
    // Lines are created inside the constructor — the Order owns them
    for (const item of items) {
      this.lines.push(Object.freeze({ ...item }));
    }
  }

  get total(): number {
    return this.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  }

  // Expose immutable view only — external code cannot swap or share lines
  getLines(): readonly LineItem[] { return this.lines; }
}`,
    },
    {
      language: "cpp",
      caption: "C++ with explicit lifecycle management: raw pointers for association, shared_ptr for aggregation, unique_ptr/value for composition",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <numeric>

// --- Association: Library uses-a Book (books exist independently) ---
struct Book {
    std::string isbn;
    std::string title;
};

class Library {
public:
    explicit Library(std::string name) : name_(std::move(name)) {}

    // Association — Library does not own Books (raw pointer, non-owning)
    void addBook(Book* book) { catalogue_.push_back(book); }

    void removeBook(const std::string& isbn) {
        catalogue_.erase(
            std::remove_if(catalogue_.begin(), catalogue_.end(),
                [&](const Book* b) { return b->isbn == isbn; }),
            catalogue_.end());
    }

private:
    std::string name_;
    std::vector<Book*> catalogue_;  // non-owning pointers
};


// --- Aggregation: University has Professors (professors outlive the uni) ---
class University;  // forward declaration

class Professor {
public:
    Professor(std::string id, std::string name)
        : employee_id_(std::move(id)), name_(std::move(name)) {}

    // Weak back-reference avoids preventing destruction of the university
    void setUniversity(std::weak_ptr<University> uni) { university_ = uni; }
    std::shared_ptr<University> university() const { return university_.lock(); }

private:
    std::string employee_id_;
    std::string name_;
    std::weak_ptr<University> university_;
};

class University : public std::enable_shared_from_this<University> {
public:
    explicit University(std::string name) : name_(std::move(name)) {}

    void hire(std::shared_ptr<Professor> prof) {
        prof->setUniversity(weak_from_this());
        faculty_.push_back(prof);
    }

    void close() {
        // Professors survive — clear references, don't delete objects
        for (auto& prof : faculty_) {
            prof->setUniversity(std::weak_ptr<University>{});
        }
        faculty_.clear();
    }

private:
    std::string name_;
    std::vector<std::shared_ptr<Professor>> faculty_;  // shared ownership
};


// --- Composition: Invoice owns InvoiceLines ---
// Immutable value object — meaningless outside its Invoice.
struct InvoiceLine {
    const std::string description;
    const int quantity;
    const int unit_price_cents;

    int subtotalCents() const { return quantity * unit_price_cents; }
};

class Invoice {
public:
    Invoice(std::string invoice_id,
            const std::vector<InvoiceLine>& raw_lines)
        : invoice_id_(std::move(invoice_id))
    {
        // Lines are created here — the Invoice exclusively owns them
        for (const auto& line : raw_lines) {
            lines_.push_back(
                std::make_unique<InvoiceLine>(line));
        }
    }

    int totalCents() const {
        return std::accumulate(lines_.begin(), lines_.end(), 0,
            [](int sum, const auto& line) {
                return sum + line->subtotalCents();
            });
    }

    // Expose const view only — external code cannot mutate or share lines
    const std::vector<std::unique_ptr<InvoiceLine>>& lines() const {
        return lines_;
    }

    // When Invoice is destroyed, its unique_ptr lines are automatically deleted
    ~Invoice() = default;

private:
    std::string invoice_id_;
    std::vector<std::unique_ptr<InvoiceLine>> lines_;  // exclusive ownership
};`,
    },
    {
      language: "cpp",
      caption: "C++ with RAII: value semantics for composition, raw/shared_ptr for aggregation",
      source: `#include <memory>
#include <string>
#include <vector>
#include <iostream>

// --- Composition via value semantics (RAII) ---
class Engine {
public:
    explicit Engine(int horsepower) : hp_(horsepower) {}
    ~Engine() { std::cout << "Engine(" << hp_ << "hp) destroyed\\n"; }
    int hp() const { return hp_; }
private:
    int hp_;
};

class Wheel {
public:
    explicit Wheel(int rimInches) : rim_(rimInches) {}
    ~Wheel() { std::cout << "Wheel(" << rim_ << "\\") destroyed\\n"; }
private:
    int rim_;
};

// Car COMPOSES Engine and Wheels — they are destroyed when the Car is
class Car {
public:
    Car(const std::string& model, int hp, int rimSize)
        : model_(model)
        , engine_(hp)                           // value member — automatic lifetime
        , wheels_()
    {
        wheels_.reserve(4);
        for (int i = 0; i < 4; ++i)
            wheels_.emplace_back(rimSize);       // constructed in place
    }
    // Destructor automatically destroys engine_ and wheels_ — RAII
    ~Car() { std::cout << model_ << " destroyed\\n"; }
private:
    std::string model_;
    Engine engine_;                              // composition: value
    std::vector<Wheel> wheels_;                  // composition: owned container
};


// --- Composition via unique_ptr (heap, exclusive ownership) ---
class CPU {
public:
    explicit CPU(const std::string& arch) : arch_(arch) {}
    ~CPU() { std::cout << "CPU(" << arch_ << ") destroyed\\n"; }
private:
    std::string arch_;
};

class Motherboard {
public:
    explicit Motherboard(const std::string& cpuArch)
        : cpu_(std::make_unique<CPU>(cpuArch))  // Motherboard creates and owns CPU
    {}
    // unique_ptr ensures CPU is destroyed with Motherboard
private:
    std::unique_ptr<CPU> cpu_;                   // composition: exclusive heap ownership
};


// --- Aggregation via raw pointer / shared_ptr (no ownership) ---
class Driver {
public:
    explicit Driver(std::string name) : name_(std::move(name)) {}
    const std::string& name() const { return name_; }
private:
    std::string name_;
};

class Fleet {
public:
    // Fleet does NOT own drivers — it merely references them
    void assignDriver(std::shared_ptr<Driver> d) {
        drivers_.push_back(d);                   // shared ownership (aggregation)
    }

    void disband() {
        drivers_.clear();                        // drivers still exist if held elsewhere
    }

private:
    std::vector<std::shared_ptr<Driver>> drivers_;
};

// Usage:
// auto alice = std::make_shared<Driver>("Alice");
// Fleet f;
// f.assignDriver(alice);
// f.disband();
// alice is still alive — shared_ptr ref count > 0`,
    },
    {
      language: "java",
      caption: "DDD Aggregate Root pattern — composition within aggregate boundary, association across",
      source: `// Aggregate Root: controls lifecycle of composed entities within the boundary
public class OrderAggregate {
    private final UUID orderId;
    private final List<OrderLine> lines = new ArrayList<>();   // composition
    private final UUID customerId;                             // association by ID

    public OrderAggregate(UUID customerId, List<OrderLineRequest> requests) {
        this.orderId = UUID.randomUUID();
        this.customerId = customerId;  // does NOT hold a Customer object — just an ID

        for (OrderLineRequest req : requests) {
            // Lines are created inside the aggregate — fully owned
            lines.add(new OrderLine(
                UUID.randomUUID(), req.sku(), req.qty(), req.unitPrice()
            ));
        }
    }

    public void addLine(String sku, int qty, BigDecimal price) {
        lines.add(new OrderLine(UUID.randomUUID(), sku, qty, price));
    }

    public void removeLine(UUID lineId) {
        lines.removeIf(l -> l.id().equals(lineId));
    }

    // Invariant enforcement — only the root modifies internal state
    public BigDecimal total() {
        return lines.stream()
            .map(OrderLine::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

// Value object within the aggregate — no independent identity outside
record OrderLine(UUID id, String sku, int qty, BigDecimal unitPrice) {
    BigDecimal subtotal() { return unitPrice.multiply(BigDecimal.valueOf(qty)); }
}

// Separate aggregate — referenced by ID, never by direct object reference
public class Customer {
    private final UUID customerId;
    private String name;
    // ...
}

// Repository persists the entire aggregate atomically
public interface OrderRepository {
    void save(OrderAggregate order);   // cascade-saves all OrderLines
    Optional<OrderAggregate> findById(UUID orderId);
}`,
    },
  ],
  diagrams: [
    {
      title: "UML Relationship Notation",
      kind: "architecture",
      caption: "Shows the three UML relationship types: plain line for association, open diamond for aggregation, and filled diamond for composition.",
      mermaid: `flowchart LR
    subgraph Association["Association - plain line"]
        Teacher["Teacher"] --- Student["Student"]
    end
    subgraph Aggregation["Aggregation - open diamond"]
        Team["Team"] o--o Player["Player"]
    end
    subgraph Composition["Composition - filled diamond"]
        Order["Order"] *--* LineItem["LineItem"]
    end`,
    },
    {
      title: "Relationship Types Mindmap",
      kind: "mindmap",
      caption: "Key properties distinguishing association, aggregation, and composition.",
      mermaid: `mindmap
  root((UML Relationships))
    Association
      Uses-A relationship
      Independent lifecycles
      Bidirectional or unidirectional
      Plain line in UML
    Aggregation
      Has-A weak ownership
      Part exists independently
      Shared ownership possible
      Open diamond in UML
    Composition
      Has-A strong ownership
      Part owned exclusively
      Part dies with whole
      Filled diamond in UML`,
    },
    {
      title: "Object Lifecycle Dependency",
      kind: "sequence",
      caption: "Illustrates how lifecycle management differs between aggregation and composition when the container is destroyed.",
      mermaid: `sequenceDiagram
    participant Client
    participant Container as Container Object
    participant Part as Part Object
    Client->>Part: Create part independently
    Client->>Container: Create container
    Client->>Container: addPart(part) [aggregation]
    Container->>Part: Hold reference
    Client->>Container: destroy container
    Note over Part: Part survives - aggregation
    Client->>Container: new Container [composition]
    Container->>Part: Create part internally
    Client->>Container: destroy container
    Note over Part: Part also destroyed - composition`,
    },
    {
      title: "Ownership Rules Flow",
      kind: "flow",
      caption: "Decision flow for determining the correct UML relationship to model between two classes.",
      mermaid: `flowchart TD
    Q1{"Can part exist\\nwithout whole?"} -->|No| Comp["Composition\\nfilled diamond"]
    Q1 -->|Yes| Q2{"Does whole\\nown the part?"}
    Q2 -->|Yes, exclusively| Q3{"Part created\\nby whole?"}
    Q3 -->|Yes| Comp
    Q3 -->|No| Agg["Aggregation\\nopen diamond"]
    Q2 -->|No, just uses it| Assoc["Association\\nplain line"]`,
    },
  ],
  animations: [
    {
      title: "Lifecycle of composed vs aggregated parts when the whole is destroyed",
      steps: [
        {
          label: "Create the whole and its parts",
          detail:
            "A House object is constructed. Inside its constructor, it creates three Room objects (composition) and receives a reference to an existing Address object (aggregation). The Address was created externally and also referenced by a PostalService.",
        },
        {
          label: "Whole is in use",
          detail:
            "The House uses its Rooms internally. The Address is shared — PostalService can navigate to the same Address instance. Rooms are private to the House; no external code holds references to them.",
        },
        {
          label: "Whole is destroyed",
          detail:
            "The House goes out of scope or is explicitly deleted. The three Room objects are destroyed automatically (composition — their lifecycle is bound to the House). The Address object is NOT destroyed because PostalService still references it (aggregation — independent lifecycle).",
        },
        {
          label: "After destruction",
          detail:
            "The Address continues to exist and is still usable by PostalService. The Rooms no longer exist in memory. This demonstrates the fundamental distinction: composition cascades destruction; aggregation does not.",
        },
      ],
    },
    {
      title: "Refactoring composition to aggregation for testability",
      steps: [
        {
          label: "Tight composition — hard to test",
          detail:
            "Class PaymentService creates a new StripeClient in its constructor (composition). Unit tests cannot substitute a mock because the concrete dependency is hard-coded. Testing requires a real Stripe API connection.",
        },
        {
          label: "Extract interface",
          detail:
            "Define a PaymentGateway interface with a charge() method. StripeClient implements this interface. PaymentService still creates StripeClient internally — still composition, but now against an abstraction.",
        },
        {
          label: "Inject dependency — promote to aggregation",
          detail:
            "Change PaymentService's constructor to accept a PaymentGateway parameter instead of creating StripeClient internally. The service now aggregates the gateway — it uses it but does not own its lifecycle. An IoC container or factory manages creation.",
        },
        {
          label: "Test with mock",
          detail:
            "In unit tests, pass a MockPaymentGateway that implements PaymentGateway. PaymentService is now fully testable in isolation. Domain semantics still treat this as 'PaymentService has-a PaymentGateway', but the structural relationship shifted from composition to aggregation, enabling dependency inversion.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Association", "Aggregation", "Composition"],
    rows: [
      [
        "UML notation",
        "Plain line",
        "Open (hollow) diamond on whole's end",
        "Filled (solid) diamond on whole's end",
      ],
      [
        "Relationship type",
        "uses-a / knows-about",
        "has-a (shared ownership)",
        "has-a (exclusive ownership)",
      ],
      [
        "Lifecycle coupling",
        "Independent — neither controls the other",
        "Independent — part survives the whole",
        "Dependent — part dies with the whole",
      ],
      [
        "Part multiplicity on whole's end",
        "Any (*, 0..1, 1, 1..*)",
        "Any",
        "0..1 or 1 (part belongs to at most one whole)",
      ],
      [
        "Part shareability",
        "Can be referenced by many objects",
        "Can be shared across wholes",
        "Exclusive — part belongs to exactly one whole",
      ],
      [
        "C++ idiom",
        "Raw pointer / reference parameter",
        "shared_ptr or raw pointer (non-owning)",
        "Value member or unique_ptr",
      ],
      [
        "Java/TS idiom",
        "Field set via setter or method param",
        "Field injected via constructor (DI)",
        "Field created inside constructor, no setter",
      ],
      [
        "DB mapping",
        "Join table or FK (no cascade)",
        "FK, nullable, ON DELETE SET NULL",
        "FK, non-null, ON DELETE CASCADE",
      ],
      [
        "Coupling strength",
        "Weakest",
        "Medium",
        "Strongest",
      ],
      [
        "Example",
        "Teacher — Course",
        "Department — Employee",
        "House — Room",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the fundamental difference between aggregation and composition?",
      a: "Both are whole-part (has-a) relationships, but they differ in lifecycle semantics. In aggregation, the part has an independent lifecycle — it can exist without the whole and can be shared across multiple wholes. In composition, the part's lifecycle is strictly bound to the whole: the whole creates and destroys the part, and the part cannot belong to more than one whole simultaneously. Destroying the whole cascades to destroy the parts.",
      followUps: [
        "How would you model this difference in a relational database? (Aggregation uses a nullable FK or SET NULL on delete; composition uses a non-null FK with ON DELETE CASCADE.)",
        "Can you convert a composition to an aggregation? When would you? (Yes — dependency injection promotes composition to aggregation for testability while preserving domain semantics.)",
      ],
    },
    {
      q: "How do you distinguish association from aggregation in code, especially in garbage-collected languages?",
      a: "In garbage-collected languages like Java, Python, and TypeScript, both association and aggregation are syntactically identical — a reference field. The distinction is semantic, not syntactic. You infer aggregation when there is a whole-part domain relationship (a Department 'has' Employees), while association is a more general 'uses' or 'knows about' relationship (a Teacher 'teaches' Courses). The code difference shows in who creates and manages the reference: aggregation implies the whole manages a collection of parts, while association may be a peer-to-peer or uses relationship.",
      followUps: [
        "In C++, how do smart pointers make the distinction explicit? (unique_ptr = composition, shared_ptr = aggregation with shared ownership, raw pointer/reference = non-owning association.)",
      ],
    },
    {
      q: "Why does the UML specification say shared aggregation has 'no precise semantics'?",
      a: "The UML metamodel defines Property.aggregation with three values: none, shared, and composite. The composite kind has strict rules — multiplicity on the whole's end must be 0..1 or 1, and the part's lifecycle is bounded by the whole's. However, the specification explicitly states that shared aggregation 'has no precise semantics' — it does not mandate any lifecycle or exclusivity constraints. It simply signals intent: 'this is a whole-part relationship, but we are not imposing lifecycle coupling.' This is why many modelling experts consider aggregation to be the weakest and most ambiguous of the three.",
    },
    {
      q: "How does the DDD Aggregate pattern relate to composition and association?",
      a: "A DDD Aggregate is a cluster of domain objects treated as a single consistency boundary. The Aggregate Root is the only entry point, and it composes its internal entities — their lifecycle is fully managed by the root, and they cannot be referenced directly from outside the aggregate. References to other aggregates are associations by identity (storing a UUID or ID, not an object reference). This prevents distributed transactions: each aggregate can be persisted atomically, and cross-aggregate consistency is eventual. The boundary is a design decision — keep aggregates small and reference externally by ID.",
      followUps: [
        "What happens if you incorrectly compose objects that should be in separate aggregates? (You get overly large transactional scopes, contention, and scalability problems.)",
        "How do you enforce aggregate boundary invariants? (All mutations go through the root, which validates before applying changes.)",
      ],
    },
    {
      q: "How does composition affect unit testing, and how do you work around it?",
      a: "When a class composes (internally creates) its dependencies, you cannot substitute test doubles without resorting to reflection or subclassing hacks. The fix is to promote the structural relationship from composition to aggregation at the constructor boundary: accept the dependency as a parameter (dependency injection). The domain model may still consider it composition (the 'whole' logically owns the 'part'), but structurally, the dependency is injected, making it substitutable. IoC containers (Spring, Guice, tsyringe) automate this by managing object graphs and lifecycle scopes externally.",
      followUps: [
        "Does injecting a dependency always mean it is no longer composition? (Not necessarily — the domain semantics remain composition if the whole conceptually owns the part's lifecycle. The structural relationship at the code level becomes aggregation to enable DI, but the logical relationship is still composition.)",
      ],
    },
    {
      q: "Give a real-world example where choosing the wrong relationship type causes bugs.",
      a: "Consider an ORM mapping where OrderLine is modelled as aggregation (independent lifecycle) instead of composition. If you delete an Order without cascade, the OrderLines become orphan rows — they reference a non-existent Order, break foreign key constraints (if enforced), waste storage, and produce incorrect analytics. Conversely, if Employee is modelled as composition under Department with ON DELETE CASCADE, deleting a department would delete all employee records — a catastrophic data loss since employees should survive a departmental restructuring. The fix is to match the relationship type to the domain: OrderLines are composed by Order, Employees are aggregated by Department.",
      followUps: [
        "How do ORMs handle orphan removal? (Hibernate has orphanRemoval=true; SQLAlchemy has delete-orphan cascade; TypeORM supports cascade removal on the relation decorator.)",
      ],
    },
    {
      q: "What is navigability in UML associations, and why does it matter?",
      a: "Navigability indicates which direction an association can be traversed. A unidirectional association means only one class holds a reference to the other (A knows B, but B does not know A). A bidirectional association means both hold references. Navigability matters for coupling: bidirectional associations create tighter coupling because changes to either class can affect the other, and you must keep both sides in sync (e.g., adding a Student to a Course also requires adding the Course to the Student's enrolled list). Unidirectional associations are simpler and preferred when only one direction of traversal is needed.",
    },
  ],
  followUps: [
    "Dependency vs association — when a relationship is even weaker than association (method-parameter-only usage).",
    "SOLID principles and how Dependency Inversion turns composition into injectable aggregation.",
    "Domain-Driven Design aggregates — designing transactional consistency boundaries.",
    "UML class diagram relationships — generalization, realisation, and dependency in addition to association.",
    "Smart pointers in C++ — unique_ptr, shared_ptr, and weak_ptr as ownership models.",
    "ORM cascade strategies — how Hibernate, SQLAlchemy, and TypeORM map these relationships to database operations.",
  ],
  mcqs: [
    {
      q: "Which UML notation represents composition?",
      options: [
        "A plain line between two classes",
        "An open (hollow) diamond on the whole's end",
        "A filled (solid) diamond on the whole's end",
        "A dashed line with an arrowhead",
      ],
      answerIndex: 2,
      explanation:
        "Composition uses a filled (solid) diamond at the whole's end, indicating exclusive ownership and lifecycle dependency. The open diamond is aggregation, the plain line is association, and the dashed arrow is a dependency.",
    },
    {
      q: "In a composition relationship, what happens when the 'whole' object is destroyed?",
      options: [
        "The parts continue to exist independently",
        "The parts are destroyed along with the whole",
        "The parts are transferred to another whole",
        "The parts become null references",
      ],
      answerIndex: 1,
      explanation:
        "Composition binds the part's lifecycle to the whole's. When the whole is destroyed, its composed parts are destroyed too. This is the defining semantic of composition — cascade destruction.",
    },
    {
      q: "Which C++ construct best models composition with heap-allocated parts?",
      options: [
        "std::shared_ptr<Part>",
        "Part* (raw pointer)",
        "std::unique_ptr<Part>",
        "std::weak_ptr<Part>",
      ],
      answerIndex: 2,
      explanation:
        "std::unique_ptr models exclusive ownership — exactly one owner, automatic deletion when the owner is destroyed. This maps directly to composition semantics. shared_ptr allows shared ownership (aggregation), raw pointers express no ownership, and weak_ptr is a non-owning observer.",
    },
    {
      q: "A Department has Employees. If the Department is closed, the Employees continue to exist and may join other Departments. This relationship is best described as:",
      options: [
        "Composition",
        "Association",
        "Aggregation",
        "Dependency",
      ],
      answerIndex: 2,
      explanation:
        "This is aggregation — a whole-part relationship where the part (Employee) has an independent lifecycle and can be shared across wholes. Composition would require the Employees to be destroyed with the Department.",
    },
    {
      q: "In a DDD Aggregate, how should references to objects in OTHER aggregates be modelled?",
      options: [
        "Composition with cascade delete",
        "Direct object references (association by reference)",
        "Association by identity (store the ID, not the object)",
        "Shared aggregation with bidirectional navigability",
      ],
      answerIndex: 2,
      explanation:
        "Cross-aggregate references should use identity (ID) rather than direct object references. This prevents tight coupling, avoids distributed transactions, and allows each aggregate to be persisted and loaded independently. Direct object references within the aggregate are fine (composition).",
    },
    {
      q: "Which database cascade option correctly models composition between Order and OrderLine?",
      options: [
        "ON DELETE SET NULL",
        "ON DELETE RESTRICT",
        "ON DELETE CASCADE",
        "ON DELETE NO ACTION",
      ],
      answerIndex: 2,
      explanation:
        "ON DELETE CASCADE mirrors composition: deleting the parent (Order) automatically deletes all child rows (OrderLines). SET NULL would leave orphan rows with null FKs (aggregation), and RESTRICT/NO ACTION would prevent deletion of the parent while children exist.",
    },
  ],
  exercises: [
    "Model a University system with classes University, Department, Professor, and Course. Identify which relationships are association, aggregation, and composition. Implement it in your language of choice, ensuring that deleting a University cascades to Departments (composition) but Professors survive (aggregation) and Courses can be offered by multiple Departments (association).",
    "In C++, implement a Computer class that composes a CPU (value member), aggregates a Monitor (shared_ptr), and associates with a Network (raw pointer). Write a destructor and verify with print statements which objects are destroyed when the Computer goes out of scope.",
    "Design a database schema for an e-commerce system with tables: Customer, Order, OrderLine, Product, and ShippingAddress. Decide which foreign keys should use ON DELETE CASCADE (composition), ON DELETE SET NULL (aggregation), or no cascade (association). Write the DDL statements and justify each choice.",
    "Refactor the following tight composition into injectable aggregation for testability: a NotificationService that internally creates an SmtpEmailSender in its constructor. Extract an interface, apply dependency injection, and write a unit test using a mock implementation.",
    "Implement the DDD Aggregate pattern: create an OrderAggregate with an OrderLine value object (composition) that references a ProductId (association by identity). Ensure all mutations go through the aggregate root, enforce an invariant (e.g., maximum 20 lines per order), and write a repository interface that persists the aggregate atomically.",
  ],
  flashcards: [
    {
      front: "What is an association in OOP?",
      back: "A structural relationship where one object uses or knows about another without any ownership implication. Both objects have independent lifecycles. In UML, it is drawn as a plain line.",
    },
    {
      front: "What is the UML notation for aggregation?",
      back: "An open (hollow) diamond placed on the 'whole' end of the association line, indicating a whole-part relationship with shared, non-exclusive ownership.",
    },
    {
      front: "How does composition differ from aggregation in terms of lifecycle?",
      back: "In composition, the part's lifecycle is bound to the whole — destroying the whole destroys the parts. In aggregation, the part has an independent lifecycle and survives the whole's destruction.",
    },
    {
      front: "Which C++ smart pointer models composition? Which models aggregation?",
      back: "std::unique_ptr models composition (exclusive ownership, automatic deletion). std::shared_ptr models aggregation with shared ownership. Value members (stack allocation) also model composition via RAII.",
    },
    {
      front: "What constraint does UML impose on the whole-end multiplicity in composition?",
      back: "The multiplicity on the whole's end must be 0..1 or 1 — a composed part can belong to at most one whole at any time. This enforces exclusive ownership.",
    },
    {
      front: "How does ON DELETE CASCADE relate to OOP relationship types?",
      back: "ON DELETE CASCADE maps to composition: deleting the parent row automatically deletes all child rows, mirroring the lifecycle binding where destroying the whole destroys its parts.",
    },
    {
      front: "What is the DDD Aggregate pattern's rule about cross-aggregate references?",
      back: "References crossing aggregate boundaries should be by identity (storing an ID), not by direct object reference. This prevents distributed transactions and allows independent persistence of each aggregate.",
    },
    {
      front: "Why does promoting composition to aggregation improve testability?",
      back: "When a class internally creates its dependency (composition), you cannot substitute a mock. Accepting the dependency as a constructor parameter (aggregation / DI) makes it replaceable with test doubles, enabling isolated unit testing.",
    },
  ],
  revisionNotes: [
    "Association is the most general relationship: 'A uses B'. No ownership, independent lifecycles. UML: plain line. In code: a reference passed from outside.",
    "Aggregation is a specialised association: 'A has B, but B can exist without A'. Whole-part with shared ownership. UML: open diamond. DB: nullable FK, ON DELETE SET NULL.",
    "Composition is the strongest form: 'A owns B exclusively, B dies with A'. UML: filled diamond. Multiplicity on the whole's end is 0..1 or 1. DB: non-null FK, ON DELETE CASCADE.",
    "In garbage-collected languages, aggregation and association look identical in code (both are reference fields). The distinction is semantic and documented in domain models, not enforced by syntax.",
    "In C++, ownership semantics are explicit: value members and unique_ptr = composition, shared_ptr = aggregation, raw pointers/references = association (non-owning).",
    "The DDD Aggregate pattern uses composition inside aggregate boundaries and association-by-identity across boundaries to define transactional consistency scopes.",
    "Dependency Injection promotes structural composition to aggregation (passing in dependencies instead of creating them internally), improving testability while preserving domain-level ownership semantics.",
  ],
  cheatSheet: [
    "Association = uses-a | plain line | independent lifecycles | any multiplicity",
    "Aggregation = has-a (shared) | open diamond | part survives whole | no lifecycle coupling",
    "Composition = has-a (exclusive) | filled diamond | part dies with whole | whole-end multiplicity 0..1 or 1",
    "C++ ownership: value member / unique_ptr = composition, shared_ptr = aggregation, raw ptr = association",
    "DB cascade: ON DELETE CASCADE = composition, ON DELETE SET NULL = aggregation, no cascade = association",
    "DDD Aggregate: compose inside boundary, associate by ID across boundaries",
    "Testability: promote composition to aggregation via dependency injection to enable mocking",
    "UML Property.aggregation enum: none (association), shared (aggregation), composite (composition)",
  ],
  resources: [
    {
      label: "UML 2.5.1 Specification - Section 9.5 (Properties and Association Ends)",
      kind: "docs",
      note: "The authoritative source for association, aggregation, and composition semantics in UML, including the Property.aggregation enumeration and its constraints.",
    },
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "The foundational patterns book extensively uses composition over inheritance and demonstrates when to use each relationship type in pattern implementations.",
    },
    {
      label: "Domain-Driven Design: Tackling Complexity in the Heart of Software by Eric Evans",
      kind: "book",
      note: "Chapters on Aggregates define how composition boundaries map to transactional consistency and why cross-aggregate references should be by identity.",
    },
    {
      label: "Effective Modern C++ by Scott Meyers — Items 18-22 on Smart Pointers",
      kind: "book",
      note: "Covers unique_ptr, shared_ptr, and weak_ptr with precise guidance on modelling ownership semantics that directly map to composition and aggregation.",
    },
    {
      label: "Martin Fowler — AggregateOrientedDatabase", url: "https://martinfowler.com/",
      kind: "article",
      note: "Explains how aggregate boundaries influence database design and why composition within aggregates simplifies persistence.",
    },
    {
      label: "Hibernate ORM User Guide — Cascading and Orphan Removal",
      kind: "docs",
      note: "Practical reference for mapping composition and aggregation to JPA cascade types (CascadeType.ALL, orphanRemoval) in Java applications.",
    },
  ],
  glossary: [
    {
      term: "Association",
      definition:
        "A structural UML relationship where one class knows about or uses another. No ownership is implied, and both objects have fully independent lifecycles.",
    },
    {
      term: "Aggregation (Shared Aggregation)",
      definition:
        "A whole-part association where the part can exist independently of the whole and may be shared among multiple wholes. UML: open diamond. The UML spec notes it has 'no precise semantics' beyond whole-part intent.",
    },
    {
      term: "Composition (Composite Aggregation)",
      definition:
        "A whole-part association with exclusive ownership and lifecycle binding. The part belongs to at most one whole and is destroyed when the whole is destroyed. UML: filled diamond.",
    },
    {
      term: "Multiplicity",
      definition:
        "A UML constraint specifying how many instances of one class relate to one instance of another (e.g., 1, 0..1, *, 1..*). In composition, the whole-end multiplicity is restricted to 0..1 or 1.",
    },
    {
      term: "Navigability",
      definition:
        "Indicates whether an association can be traversed in one direction (unidirectional) or both (bidirectional). Affects coupling — bidirectional associations require both sides to stay in sync.",
    },
    {
      term: "Cascade Delete",
      definition:
        "A database or ORM behaviour where deleting a parent row automatically deletes all dependent child rows. It is the persistence-level implementation of composition semantics.",
    },
    {
      term: "Aggregate Root (DDD)",
      definition:
        "The single entry-point entity of a DDD Aggregate. It composes internal entities (controlling their lifecycle) and is the only object that external code may reference directly. Cross-aggregate references use identity, not object pointers.",
    },
    {
      term: "RAII (Resource Acquisition Is Initialization)",
      definition:
        "A C++ idiom where resource lifetime is tied to object scope. Value members and unique_ptr leverage RAII to model composition — the part is automatically destroyed when the owning object goes out of scope.",
    },
  ],
};
