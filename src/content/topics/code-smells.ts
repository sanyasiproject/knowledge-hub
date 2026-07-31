import type { TopicContent } from "../types";

export const codeSmells: TopicContent = {
  quickSummary: [
    "A code smell is a surface indication in source code that usually corresponds to a deeper design problem. Smells are not bugs -- the code works -- but they signal that the design could be improved to reduce complexity, coupling, or fragility.",
    "Martin Fowler and Kent Beck catalogued the canonical smells in 'Refactoring': Long Method, Large Class, Feature Envy, Data Clumps, Primitive Obsession, Switch Statements, Parallel Inheritance Hierarchies, Lazy Class, Speculative Generality, Temporary Field, Message Chains, Middle Man, and Inappropriate Intimacy.",
    "Smells exist on a spectrum. Some (Long Method, Large Class) are almost always worth fixing. Others (Middle Man, Lazy Class) indicate over-engineering and suggest simplifying. The right response depends on context: team size, change frequency, and the cost of the refactoring.",
    "Two smells deserve special attention for their architectural impact: Divergent Change (one class changed for many unrelated reasons, violating SRP) and Shotgun Surgery (one change requires editing many classes, indicating scattered responsibility)."
  ],

  detailed: [
    "Long Method is the most common smell and the easiest to fix. Functions longer than 20-30 lines usually do more than one thing, mix levels of abstraction, and have high cyclomatic complexity. The fix is Extract Method: whenever you can identify a block of code that serves a distinct purpose (especially if it has a comment above it), extract it into a well-named function. Smaller functions are easier to understand, test, reuse, and override.",
    "Large Class (also called God Class or Blob) is a class that has too many responsibilities, too many instance variables, or too many methods. It attracts more and more functionality because developers do not know where else to put it. The fix is Extract Class: identify clusters of related fields and methods and move them to a new class. If the large class acts as a facade, the extracted classes become collaborators. Signs include: partial usage (some methods only use a subset of fields), too many imports, and a class name that is vague ('Manager', 'Handler', 'Utility').",
    "Feature Envy occurs when a method uses more fields and methods from another class than from its own. It suggests the method belongs in the other class. The fix is Move Method: relocate the method to the class whose data it uses most. A classic example is a method in an Order class that repeatedly accesses Customer fields to calculate a discount -- that method belongs in Customer or in a discount strategy object. Feature Envy often co-occurs with Data Clumps.",
    "Data Clumps are groups of variables that frequently appear together: (firstName, lastName, email) or (latitude, longitude, altitude). If you always pass these together, they should be a class. The fix is Extract Class or Introduce Parameter Object. The new class often reveals behavior that was scattered across callers -- for example, an Address class might gain validation and formatting methods that were duplicated everywhere addresses were used.",
    "Primitive Obsession is using primitive types (strings, ints, booleans) to represent domain concepts: a phone number as a string, money as a double, a status as an int. The fix is Replace Primitive with Object (also called Wrap Primitive). Creating PhoneNumber, Money, and OrderStatus types adds validation, formatting, and type safety. The compiler can then prevent bugs like passing a customerId where an orderId is expected -- both are strings but they are not interchangeable.",
    "Switch Statements (or long if-else chains) that dispatch on a type code are a smell because adding a new type requires modifying every switch statement. The fix is Replace Conditional with Polymorphism: create a class hierarchy where each subclass handles one case. The switch statement becomes a virtual method dispatch. This is not about eliminating all switch statements -- a switch that maps an external input to an internal type at a boundary is fine. The smell is when the same switch appears in multiple places.",
    "Parallel Inheritance Hierarchies occur when every time you create a subclass of one hierarchy, you must also create a subclass of another. For example, adding a CreditCardPayment requires adding CreditCardPaymentProcessor. The fix is usually Move Method to eliminate one hierarchy, or use composition: a Payment has a PaymentStrategy rather than each payment type having a parallel processor type.",
    "Divergent Change means one class is frequently modified for different reasons: you change it to add a new report format, then again to support a new database, then again to add a new business rule. Each change affects different methods. This violates the Single Responsibility Principle. The fix is Extract Class: split the class so each resulting class has one reason to change. Shotgun Surgery is the opposite: one change requires editing many classes, indicating that a responsibility is scattered and should be consolidated."
  ],

  deepDive: [
    "The relationship between code smells and SOLID principles is systematic. Long Method and Large Class violate the Single Responsibility Principle. Feature Envy violates encapsulation (and often SRP in the class that contains the envious method). Parallel Inheritance Hierarchies violate the Open/Closed Principle. Divergent Change violates SRP. Shotgun Surgery indicates violation of SRP from the other direction (responsibility scattered instead of concentrated). Understanding this mapping helps you predict which smells will appear when SOLID principles are violated.",
    "Some smells are opposites and indicate over-correction. Middle Man is a class that delegates all its work to another class, adding a layer of indirection that provides no value. Lazy Class is a class that does too little to justify its existence. Both are often the result of over-zealous refactoring: extracting too many classes or applying too many design patterns. The fix is to inline the class -- merge it back into its caller or delegate. The lesson is that refactoring can go too far, and code simplicity is the ultimate goal.",
    "Speculative Generality is premature abstraction: creating hooks, parameters, and framework-like structures for future requirements that may never materialize. YAGNI (You Ain't Gonna Need It) is the antidote. Signs include: abstract classes with only one subclass, unused parameters, methods that are never called, and class names with words like 'Framework', 'Engine', or 'Generic'. The fix is to remove the speculation: inline the abstract class, remove unused parameters, delete dead code. When the requirement actually arrives, you can generalize then.",
    "Message Chains (a.getB().getC().getD()) violate the Law of Demeter and create tight coupling to the object graph's structure. If any intermediate object changes its interface, all chains break. The fix is Hide Delegate: add a method on A that returns what the caller actually needs, hiding the navigation path. However, overzealous application of Hide Delegate creates Middle Man -- a class that is nothing but delegation methods. The art is finding the right balance: hide navigation that crosses module boundaries, but allow chains within a single cohesive module.",
    "Inappropriate Intimacy occurs when two classes are too tightly coupled: accessing each other's private fields, sharing mutable data, or having circular dependencies. The fix depends on the direction: if one class knows too much about the other, Move Method or Extract Class to create a proper interface between them. If both classes need shared data, introduce an intermediate data structure or event. In the worst case (circular dependency between modules), break the cycle by introducing an abstraction (interface or event bus) that one module depends on and the other implements."
  ],

  code: [
    {
      language: "java",
      caption: "Feature Envy and Data Clumps: before and after refactoring",
      source: `// SMELL: Feature Envy -- this method in Order uses Customer's data extensively
// SMELL: Data Clumps -- (street, city, state, zip) always appear together
public class Order {
    private Customer customer;
    private List<LineItem> items;

    // Feature Envy: this method barely uses Order's own fields
    public String formatShippingLabel() {
        return customer.getFirstName() + " " + customer.getLastName() + "\\n"
             + customer.getStreet() + "\\n"
             + customer.getCity() + ", " + customer.getState() + " " + customer.getZip();
    }

    // Feature Envy: discount logic depends entirely on Customer's data
    public double calculateDiscount() {
        if (customer.getLoyaltyYears() > 5 && customer.getTotalOrders() > 50) {
            return getTotal() * 0.15;
        } else if (customer.getLoyaltyYears() > 2) {
            return getTotal() * 0.08;
        }
        return 0;
    }
}


// REFACTORED: Data Clump extracted into Address, Feature Envy moved to owning class
public class Address {
    private final String street;
    private final String city;
    private final String state;
    private final String zip;

    public Address(String street, String city, String state, String zip) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
    }

    public String formatForLabel() {
        return street + "\\n" + city + ", " + state + " " + zip;
    }
}

public class Customer {
    private String firstName;
    private String lastName;
    private Address address;
    private int loyaltyYears;
    private int totalOrders;

    // Moved from Order: this logic belongs with Customer's data
    public double calculateDiscountRate() {
        if (loyaltyYears > 5 && totalOrders > 50) return 0.15;
        if (loyaltyYears > 2) return 0.08;
        return 0.0;
    }

    public String formatShippingLabel() {
        return firstName + " " + lastName + "\\n" + address.formatForLabel();
    }
}

public class Order {
    private Customer customer;
    private List<LineItem> items;

    // Now delegates to the appropriate owner
    public String getShippingLabel() {
        return customer.formatShippingLabel();
    }

    public Money calculateDiscount() {
        return getTotal().multiplyBy(customer.calculateDiscountRate());
    }
}`
    },
    {
      language: "typescript",
      caption: "Primitive Obsession and Switch Statement smells: before and after",
      source: `// SMELL: Primitive Obsession -- money as a number, status as a string
// SMELL: Switch Statement -- repeated type-checking across functions
interface OrderData {
  id: string;
  amount: number;        // primitive obsession: money as number
  currency: string;      // primitive obsession: currency as string
  status: string;        // primitive obsession: status as string
}

function processOrder(order: OrderData): void {
  // Switch smell: this pattern repeats everywhere status is used
  switch (order.status) {
    case "pending":
      chargeCustomer(order.amount);
      order.status = "paid";
      break;
    case "paid":
      shipOrder(order.id);
      order.status = "shipped";
      break;
    case "shipped":
      // do nothing
      break;
    default:
      throw new Error("Unknown status: " + order.status);
  }
}

function getStatusLabel(order: OrderData): string {
  // Same switch appears in another function
  switch (order.status) {
    case "pending": return "Awaiting payment";
    case "paid": return "Payment received";
    case "shipped": return "On the way";
    default: return "Unknown";
  }
}


// REFACTORED: Value objects replace primitives, State pattern replaces switch

class Money {
  constructor(
    readonly amount: number,
    readonly currency: Currency
  ) {
    if (amount < 0) throw new Error("Money cannot be negative");
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  format(): string {
    return \`\${this.currency} \${this.amount.toFixed(2)}\`;
  }
}

type Currency = "USD" | "EUR" | "INR";

// State pattern: each status is a class with its own behavior
interface OrderState {
  process(order: Order): OrderState;
  getLabel(): string;
}

class PendingState implements OrderState {
  process(order: Order): OrderState {
    chargeCustomer(order.total);
    return new PaidState();
  }
  getLabel(): string { return "Awaiting payment"; }
}

class PaidState implements OrderState {
  process(order: Order): OrderState {
    shipOrder(order.id);
    return new ShippedState();
  }
  getLabel(): string { return "Payment received"; }
}

class ShippedState implements OrderState {
  process(_order: Order): OrderState {
    return this; // Already shipped, no-op
  }
  getLabel(): string { return "On the way"; }
}

class Order {
  private state: OrderState = new PendingState();

  constructor(
    readonly id: string,
    readonly total: Money
  ) {}

  process(): void {
    this.state = this.state.process(this);
  }

  get statusLabel(): string {
    return this.state.getLabel();
  }
}`
    },
    {
      language: "cpp",
      caption: "Divergent Change and Shotgun Surgery identification",
      source: `// SMELL: Divergent Change -- this class changes for many unrelated reasons
class ReportService {
    // This class changes when:
    // 1. A new report format is added (PDF, CSV, Excel)
    // 2. A new data source is added (MySQL, Postgres, API)
    // 3. A new report type is added (sales, inventory, financial)
    // Each change affects different methods -- classic Divergent Change.
public:
    std::vector<Row> fetchSalesData();        // Changes for data source reasons
    std::vector<Row> fetchInventoryData();     // Changes for data source reasons
    Summary calculateSalesSummary();           // Changes for business logic reasons
    Metrics calculateInventoryMetrics();        // Changes for business logic reasons
    std::vector<uint8_t> renderAsPdf(const ReportData& data);   // Changes for format reasons
    std::string renderAsCsv(const ReportData& data);            // Changes for format reasons
    std::vector<uint8_t> renderAsExcel(const ReportData& data); // Changes for format reasons
};


// REFACTORED: Each class has one reason to change

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <numeric>
#include <cstdint>

using Row = std::map<std::string, std::string>;

// Changes only when data access logic changes.
class DataSource {
public:
    virtual ~DataSource() = default;
    virtual std::vector<Row> fetch() = 0;
};

class SalesDataSource : public DataSource {
public:
    std::vector<Row> fetch() override {
        return querySalesDatabase();
    }
private:
    std::vector<Row> querySalesDatabase();
};

class InventoryDataSource : public DataSource {
public:
    std::vector<Row> fetch() override {
        return queryInventoryApi();
    }
private:
    std::vector<Row> queryInventoryApi();
};


struct ReportData {
    std::string title;
    std::vector<Row> rows;
    double total;
};

// Changes only when business logic changes.
class ReportCalculator {
public:
    virtual ~ReportCalculator() = default;
    virtual ReportData compute(const std::vector<Row>& rawData) = 0;
};

class SalesSummaryCalculator : public ReportCalculator {
public:
    ReportData compute(const std::vector<Row>& rawData) override {
        double total = 0.0;
        for (const auto& row : rawData) {
            total += std::stod(row.at("amount"));
        }
        return {"Sales Summary", rawData, total};
    }
};


// Changes only when output format changes.
class ReportRenderer {
public:
    virtual ~ReportRenderer() = default;
    virtual std::vector<uint8_t> render(const ReportData& report) = 0;
};

class PdfRenderer : public ReportRenderer {
public:
    std::vector<uint8_t> render(const ReportData& report) override {
        // PDF generation logic
        return {};
    }
};

class CsvRenderer : public ReportRenderer {
public:
    std::vector<uint8_t> render(const ReportData& report) override {
        // CSV generation logic
        return {};
    }
};


// Composition: each piece changes independently
class ReportPipeline {
public:
    ReportPipeline(std::unique_ptr<DataSource> source,
                   std::unique_ptr<ReportCalculator> calculator,
                   std::unique_ptr<ReportRenderer> renderer)
        : source_(std::move(source))
        , calculator_(std::move(calculator))
        , renderer_(std::move(renderer)) {}

    std::vector<uint8_t> generate() {
        auto rawData = source_->fetch();
        auto report = calculator_->compute(rawData);
        return renderer_->render(report);
    }

private:
    std::unique_ptr<DataSource> source_;
    std::unique_ptr<ReportCalculator> calculator_;
    std::unique_ptr<ReportRenderer> renderer_;
};`
    }
  ],

  diagrams: [
    {
      title: "Code Smells Taxonomy",
      kind: "mindmap",
      caption: "Mindmap organized into categories: Bloaters (Long Method, Large Class, Primitive Obsession, Long Parameter List, Data Clumps), Object-Orientation Abusers (Switch Statements, Parallel Inheritance, Refused Bequest, Temporary Field), Change Preventers (Divergent Change, Shotgun Surgery, Feature Envy), Dispensables (Lazy Class, Speculative Generality, Dead Code, Redundant Comment), Couplers (Feature Envy, Message Chains, Middle Man, Inappropriate Intimacy)."
    },
    {
      title: "Divergent Change vs Shotgun Surgery",
      kind: "architecture",
      caption: "Two diagrams side by side. Left (Divergent Change): One class with arrows from three different change reasons pointing to it -- one class changed for many reasons. Right (Shotgun Surgery): One change reason with arrows pointing to many classes -- one change requires editing many classes. Both violate SRP but from opposite directions."
    }
  ],

  animations: [
    {
      title: "Detecting and Fixing Feature Envy",
      steps: [
        { label: "Spot the envy", detail: "A method in class Order repeatedly calls customer.getX() for five different fields. It barely uses any of Order's own fields -- it is 'envious' of Customer's data." },
        { label: "Count the dependencies", detail: "The method references 5 Customer fields and only 1 Order field. The majority of its data comes from Customer, confirming feature envy." },
        { label: "Apply Move Method", detail: "Move the method from Order to Customer. The method now directly accesses the fields it needs, eliminating the chain of getter calls." },
        { label: "Create a delegation method if needed", detail: "If Order's callers still need access, add a thin delegation method in Order: calculateDiscount() calls customer.calculateDiscountFor(this). The logic lives where the data lives." },
        { label: "Verify encapsulation improved", detail: "Customer's internal representation can now change without affecting Order. The coupling between the two classes has been reduced from data coupling to message coupling." }
      ]
    }
  ],

  comparison: {
    columns: ["Smell", "Symptom", "Typical Fix", "SOLID Violation"],
    rows: [
      ["Long Method", "Function over 20-30 lines, multiple comment blocks", "Extract Method", "SRP (function does too many things)"],
      ["Large Class", "Too many fields, methods, responsibilities", "Extract Class", "SRP (class has too many reasons to change)"],
      ["Feature Envy", "Method uses another class's data more than its own", "Move Method", "Encapsulation (logic not near its data)"],
      ["Data Clumps", "Same group of variables appears in multiple places", "Extract Class / Parameter Object", "Missing abstraction"],
      ["Primitive Obsession", "Domain concepts represented as strings/ints", "Replace Primitive with Value Object", "Missing domain types"],
      ["Switch Statements", "Same switch/if-else chain in multiple places", "Replace Conditional with Polymorphism", "OCP (adding a case requires modifying existing code)"],
      ["Parallel Inheritance", "Adding subclass X always requires adding Y", "Move Method, use composition", "Tight coupling between hierarchies"],
      ["Divergent Change", "One class modified for many unrelated reasons", "Extract Class", "SRP (class has multiple reasons to change)"],
      ["Shotgun Surgery", "One change requires editing many classes", "Move Method / Inline Class to consolidate", "SRP (responsibility scattered)"],
      ["Message Chains", "a.getB().getC().getD()", "Hide Delegate", "Law of Demeter / coupling to object graph"],
      ["Middle Man", "Class delegates everything, adds no value", "Remove Middle Man / Inline Class", "Over-engineering, unnecessary indirection"],
      ["Lazy Class", "Class is too small to justify its existence", "Inline Class", "Over-engineering, premature extraction"],
      ["Speculative Generality", "Unused abstractions, hooks, parameters", "Remove unused code, Inline Class", "YAGNI violation"],
      ["Temporary Field", "Field only used in some scenarios, null otherwise", "Extract Class for the scenario", "Confusing nullability"],
      ["Inappropriate Intimacy", "Two classes access each other's internals", "Move Method, Extract Class, introduce interface", "Encapsulation violation"]
    ]
  },

  interviewQA: [
    {
      q: "What is a code smell, and how does it differ from a bug?",
      a: "A code smell is a surface indication in the source code that usually corresponds to a deeper design problem. The code works correctly -- all tests pass -- but the design makes the code harder to understand, modify, or extend. A bug is incorrect behavior: the program does not do what it should. Smells are about maintainability and design quality, not correctness. However, smelly code is more likely to attract bugs because it is harder to understand and change safely.",
      followUps: [
        "Can smells be detected automatically by tools?",
        "Is there a threshold for when a smell becomes bad enough to fix?",
        "How do you prioritize which smells to fix first?"
      ]
    },
    {
      q: "Explain the difference between Divergent Change and Shotgun Surgery.",
      a: "Both are SRP violations but in opposite directions. Divergent Change means one class is modified for many unrelated reasons: you change it for database changes, then for business rule changes, then for UI changes. The fix is to split the class so each new class has one reason to change. Shotgun Surgery is the opposite: one logical change (e.g., adding a new payment type) requires modifying many classes scattered across the codebase. The fix is to consolidate the scattered responsibility into one class or module. Divergent Change = too many reasons to touch one place. Shotgun Surgery = one reason touches too many places.",
      followUps: [
        "How do you detect Shotgun Surgery in practice?",
        "Can microservices exhibit Shotgun Surgery across service boundaries?",
        "What refactoring patterns fix each smell?"
      ]
    },
    {
      q: "What is Primitive Obsession and why is it harmful?",
      a: "Primitive Obsession is representing domain concepts with primitive types: money as a double, email as a string, status as an int. It is harmful because: (1) there is no type safety -- you can pass a customerId where an orderId is expected since both are strings; (2) there is no validation -- any string can be an email, including invalid ones; (3) behavior that belongs with the concept is scattered -- formatting, validation, comparison logic ends up duplicated across callers. The fix is to create value objects: Money, EmailAddress, OrderId, OrderStatus. These carry validation, formatting, and behavior, and the compiler prevents mixing incompatible types.",
      followUps: [
        "When is it acceptable to use primitives for domain concepts?",
        "How do value objects interact with serialization/deserialization?",
        "How does Primitive Obsession relate to Data Clumps?"
      ]
    },
    {
      q: "When is the Middle Man smell actually over-engineering, and when is delegation appropriate?",
      a: "Middle Man occurs when a class exists solely to forward calls to another class, adding no logic of its own. It is a smell when the delegation adds no value: every public method is just `return delegate.sameMethod()`. However, delegation is appropriate when: (1) you are implementing the Facade pattern to simplify a complex subsystem; (2) you are providing a stable interface that shields callers from an unstable dependency; (3) you need to add cross-cutting concerns (logging, caching, authorization) around the delegated calls. The test is whether removing the middle man would force callers to interact with a complex or unstable interface.",
      followUps: [
        "How do you distinguish a useful facade from a useless middle man?",
        "Does the decorator pattern create middle men?",
        "How does this relate to the Law of Demeter?"
      ]
    },
    {
      q: "How do you decide whether a class is a Lazy Class that should be inlined or a well-factored small class?",
      a: "A Lazy Class does too little to justify its existence: it might have one field and no behavior, or it might be a leftover from refactoring that moved its logic elsewhere. The test is whether the class provides a meaningful abstraction. A PhoneNumber class with validation and formatting is small but valuable -- it represents a domain concept with behavior. A PhoneNumberWrapper class that just holds a string and has no behavior beyond a getter is lazy and should be inlined. Also consider future trajectory: if you expect the class to grow as the domain evolves, keep it. If it has been lazy for years, inline it.",
      followUps: [
        "How does this interact with Speculative Generality?",
        "Should value objects ever be considered lazy?",
        "What is the minimum viable behavior for a class to exist?"
      ]
    },
    {
      q: "What are Temporary Fields and why are they confusing?",
      a: "A Temporary Field is an instance variable that is only set and used in certain circumstances, being null or meaningless the rest of the time. For example, an Employee class might have a `bonusCalculationResult` field that is only populated during the annual bonus run. Other methods that access the object at other times see null and have to work around it. This is confusing because readers expect all instance variables to be meaningful at all times. The fix is Extract Class: create a BonusCalculation class that holds the temporary fields and is only instantiated when needed. Alternatively, make the data a local variable or a return value rather than an instance field.",
      followUps: [
        "How do you detect Temporary Fields in a large codebase?",
        "Can this smell be detected by static analysis tools?",
        "How do Temporary Fields relate to the Null Object pattern?"
      ]
    }
  ],

  followUps: [
    "How do static analysis tools (SonarQube, PMD, ESLint) detect code smells automatically?",
    "What is the relationship between code smells and technical debt?",
    "How do you make the case to management that fixing code smells is worth the investment?",
    "Are there code smells unique to microservices architectures?",
    "How do code smells in test code differ from smells in production code?",
    "Can design patterns themselves become code smells if overused?"
  ],

  mcqs: [
    {
      q: "Which code smell occurs when a method uses more data from another class than from its own class?",
      options: ["Inappropriate Intimacy", "Feature Envy", "Message Chains", "Data Clumps"],
      answerIndex: 1,
      explanation: "Feature Envy is when a method is more interested in another class's data than its own, suggesting the method should be moved to the class it envies."
    },
    {
      q: "What is the typical fix for Primitive Obsession?",
      options: [
        "Extract Method",
        "Replace Primitive with Value Object / Wrap Primitive",
        "Inline Class",
        "Replace Conditional with Polymorphism"
      ],
      answerIndex: 1,
      explanation: "Primitive Obsession is fixed by creating dedicated value objects (Money, EmailAddress, OrderId) that carry validation, behavior, and type safety."
    },
    {
      q: "What is the difference between Divergent Change and Shotgun Surgery?",
      options: [
        "They are the same smell with different names",
        "Divergent Change: one class changed for many reasons. Shotgun Surgery: one change touches many classes",
        "Divergent Change: many classes with similar behavior. Shotgun Surgery: one class doing too much",
        "Divergent Change is about data, Shotgun Surgery is about behavior"
      ],
      answerIndex: 1,
      explanation: "Both are SRP violations. Divergent Change means one class has multiple reasons to change. Shotgun Surgery means one reason for change is scattered across multiple classes."
    },
    {
      q: "Which smell indicates over-engineering or premature abstraction?",
      options: ["Feature Envy", "Speculative Generality", "Long Method", "Data Clumps"],
      answerIndex: 1,
      explanation: "Speculative Generality is creating abstractions, hooks, or frameworks for future requirements that may never materialize (YAGNI violation)."
    },
    {
      q: "What does a.getB().getC().getD() indicate?",
      options: [
        "Feature Envy",
        "Message Chains (Law of Demeter violation)",
        "Primitive Obsession",
        "Middle Man"
      ],
      answerIndex: 1,
      explanation: "Message Chains show tight coupling to the object graph structure. If any intermediate object's interface changes, all chains break. The fix is Hide Delegate."
    },
    {
      q: "When is a 'Lazy Class' smell actually appropriate?",
      options: [
        "Never -- all classes should have substantial behavior",
        "When the class represents a meaningful domain concept with validation, even if small",
        "When the class has exactly one method",
        "When the class is abstract"
      ],
      answerIndex: 1,
      explanation: "A small class is fine if it represents a real domain concept (e.g., PhoneNumber with validation). It becomes a Lazy Class smell only when it provides no meaningful abstraction or behavior."
    }
  ],

  exercises: [
    "Audit a class in your codebase with more than 300 lines. Identify which smell(s) it exhibits (Large Class, Divergent Change, or both). Sketch a plan to extract 2-3 smaller classes from it, listing which fields and methods move to each.",
    "Find three instances of Primitive Obsession in your project (e.g., email as string, money as double, status as string constant). Create value objects for each with validation, and update the callers.",
    "Search your codebase for repeated switch/if-else chains that dispatch on the same type or status field. Refactor one using Replace Conditional with Polymorphism (Strategy or State pattern).",
    "Identify a Message Chain (3+ method calls chained) in your codebase. Apply Hide Delegate to reduce the chain. Then evaluate whether the resulting class becomes a Middle Man -- if so, find the right balance.",
    "Use a static analysis tool (SonarQube, ESLint with complexity rules, or radon for Python) to generate a report of code smells in your project. Pick the top 3 highest-impact smells and create refactoring tickets."
  ],

  flashcards: [
    { front: "What is a code smell?", back: "A surface indication in source code that usually corresponds to a deeper design problem. The code works correctly but is harder to maintain, understand, or extend." },
    { front: "What is Feature Envy?", back: "A method that uses more data from another class than from its own class, suggesting it should be moved to the class whose data it envies." },
    { front: "What is the fix for Data Clumps?", back: "Extract Class or Introduce Parameter Object: group the frequently co-occurring variables into a dedicated class (e.g., Address from street, city, state, zip)." },
    { front: "What is Primitive Obsession?", back: "Using primitive types (string, int, double) to represent domain concepts instead of creating dedicated value objects like Money, EmailAddress, or OrderId." },
    { front: "What is the difference between Divergent Change and Shotgun Surgery?", back: "Divergent Change: one class modified for many unrelated reasons (too many responsibilities). Shotgun Surgery: one change requires editing many classes (scattered responsibility)." },
    { front: "What is Speculative Generality?", back: "Creating abstractions, hooks, or extensibility mechanisms for anticipated future requirements that may never materialize. The antidote is YAGNI." },
    { front: "What is a Temporary Field?", back: "An instance variable that is only meaningful in certain circumstances and null/meaningless otherwise, confusing readers who expect all fields to always be relevant." },
    { front: "When is Middle Man a smell?", back: "When a class exists solely to delegate calls to another class, adding no logic, validation, or abstraction of its own." }
  ],

  revisionNotes: [
    "Code smells are design indicators, not bugs. The code works but is harder to maintain.",
    "Bloaters (Long Method, Large Class, Data Clumps, Primitive Obsession) are the most common and easiest to spot.",
    "Feature Envy: method belongs in the class whose data it uses most. Fix with Move Method.",
    "Data Clumps: groups of variables that always appear together should be a class.",
    "Primitive Obsession: use value objects instead of raw strings/ints for domain concepts.",
    "Switch Statements repeated across the codebase indicate missing polymorphism.",
    "Divergent Change (one class, many reasons to change) and Shotgun Surgery (one change, many classes to edit) are opposite SRP violations.",
    "Middle Man and Lazy Class indicate over-engineering; simplify by inlining.",
    "Speculative Generality is premature abstraction; apply YAGNI."
  ],

  cheatSheet: [
    "Long Method: >20 lines -> Extract Method",
    "Large Class: too many fields/methods -> Extract Class",
    "Feature Envy: method uses another class's data -> Move Method",
    "Data Clumps: same variable group everywhere -> Extract Class / Parameter Object",
    "Primitive Obsession: domain concept as primitive -> Value Object",
    "Switch Statements: same switch in multiple places -> Replace with Polymorphism",
    "Divergent Change: one class, many change reasons -> Split into focused classes",
    "Shotgun Surgery: one change, many files touched -> Consolidate responsibility",
    "Message Chains: a.b().c().d() -> Hide Delegate",
    "Middle Man: pure delegation class -> Remove Middle Man / Inline",
    "Speculative Generality: unused abstractions -> Delete, apply YAGNI",
    "Temporary Field: field used only sometimes -> Extract Class for that scenario"
  ],

  resources: [
    { label: "Refactoring by Martin Fowler (2nd edition)", kind: "book", note: "The definitive catalog of code smells and their corresponding refactoring techniques" },
    { label: "Clean Code by Robert C. Martin", kind: "book", note: "Covers code smells in the context of writing clean, maintainable code" },
    { label: "Refactoring Guru: Code Smells", kind: "article", note: "Interactive web catalog of all code smells with visual examples and refactoring recipes" },
    { label: "Working Effectively with Legacy Code by Michael Feathers", kind: "book", note: "Practical techniques for identifying and fixing smells in codebases without tests" },
    { label: "SonarQube documentation on Code Smells", kind: "docs", note: "How the leading static analysis platform detects and categorizes code smells" }
  ],

  glossary: [
    { term: "Code Smell", definition: "A surface indication in source code that suggests a deeper design problem, even though the code functions correctly." },
    { term: "Feature Envy", definition: "A method that uses more fields and methods from another class than from its own class, suggesting misplaced responsibility." },
    { term: "Data Clump", definition: "A group of variables that frequently appear together across the codebase, indicating a missing abstraction (class)." },
    { term: "Primitive Obsession", definition: "Using primitive types (string, int, double) to represent domain concepts that deserve their own value object with validation and behavior." },
    { term: "Divergent Change", definition: "A class that is frequently modified for different, unrelated reasons, violating the Single Responsibility Principle." },
    { term: "Shotgun Surgery", definition: "A single logical change that requires modifications to many different classes, indicating scattered responsibility." },
    { term: "Speculative Generality", definition: "Premature abstraction created for anticipated future requirements that may never materialize, violating YAGNI." },
    { term: "Middle Man", definition: "A class that exists solely to delegate calls to another class, adding no meaningful logic or abstraction of its own." }
  ]
};
