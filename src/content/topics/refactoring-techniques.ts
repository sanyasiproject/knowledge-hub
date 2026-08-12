import type { TopicContent } from "../types";

export const refactoringTechniques: TopicContent = {
  quickSummary: [
    "Refactoring is the disciplined process of restructuring existing code without changing its external behavior, improving readability, reducing complexity, and making the codebase easier to maintain and extend.",
    "Key techniques include Extract Method (pull logic into a named function), Rename (clarify intent), Move Method/Field (relocate to the class that uses it most), and Replace Conditional with Polymorphism (eliminate complex if/else chains with subclass overrides).",
    "Refactoring should always be backed by tests -- run the suite before, apply one small transformation, run the suite again. If tests fail, revert immediately. This tight feedback loop is the safety net that separates refactoring from reckless rewriting.",
    "Code smells such as Long Method, Feature Envy, Primitive Obsession, and Shotgun Surgery are the triggers that signal when refactoring is needed. Recognizing smells is as important as knowing the techniques to fix them.",
  ],

  detailed: [
    "Extract Method is the most commonly used refactoring. When a method is too long or a block of code needs a comment to explain what it does, extract that block into a new method whose name replaces the comment. This reduces cognitive load, enables reuse, and makes the calling method read like a sequence of high-level steps. The inverse, Inline Method, is used when a method body is as clear as its name -- the indirection adds no value, so you fold it back into the caller.",
    "Rename Variable, Rename Method, and Rename Class are deceptively powerful. Good names eliminate the need for comments and reduce the time readers spend deciphering intent. A rename should convey what something IS or DOES, not how it works. For example, renaming `d` to `elapsedDays` or `calc()` to `calculateMonthlyInterest()` transforms code from a puzzle into prose.",
    "Move Method and Move Field address Feature Envy -- when a method uses more data from another class than its own. By moving the method to the class whose data it accesses most, you improve cohesion and reduce coupling. Pull Up Method moves shared behavior from subclasses into the parent, eliminating duplication. Push Down Method moves parent behavior that only one subclass needs into that subclass, keeping the parent clean.",
    "Replace Conditional with Polymorphism eliminates complex switch statements or if/else chains that branch on type. Instead of checking a type field and executing different logic, you create a class hierarchy where each subclass implements the behavior for its type. The caller simply invokes the method and polymorphism dispatches to the right implementation. This follows the Open/Closed Principle -- adding a new type means adding a new class, not editing an existing switch.",
    "Introduce Parameter Object groups parameters that naturally travel together (e.g., startDate and endDate, or x and y coordinates) into a single object. This reduces parameter count, makes method signatures clearer, and often reveals behavior that belongs on the new object. Replace Temp with Query converts a local variable that holds a computed result into a method call, which eliminates the variable, makes the computation reusable, and often reveals Extract Method opportunities.",
    "Decompose Conditional simplifies complex boolean expressions by extracting the condition, the then-branch, and the else-branch into named methods. Instead of `if (date.before(SUMMER_START) || date.after(SUMMER_END))`, you write `if (isNotSummer(date))`. Extract Class splits a class that does too much into two classes, each with a clear responsibility. Its inverse, Inline Class, merges a class that does too little back into its only user. Replace Magic Number with Symbolic Constant gives names to literal values, turning `if (age >= 18)` into `if (age >= LEGAL_ADULT_AGE)` -- making the intent explicit and the value easy to change.",
    "Knowing when NOT to refactor is equally important. Do not refactor code that is about to be replaced or deleted. Do not refactor without tests -- you need a safety net to verify behavior is preserved. Do not refactor during a production crisis -- fix the bug first, refactor later. Avoid large-scale refactoring across many files in a single commit; instead, make incremental changes that can be reviewed and reverted independently. If the code works, has tests, and no one needs to change it, leave it alone -- refactoring for its own sake wastes time and introduces risk.",
  ],

  deepDive: [
    "Martin Fowler's refactoring catalog identifies over 60 named refactorings, but in practice about a dozen account for 90% of real-world usage. The discipline of refactoring depends on the concept of behavior preservation: after each transformation, the program produces exactly the same outputs for the same inputs. This is what separates refactoring from rewriting. Automated refactoring tools in modern IDEs (IntelliJ, VS Code, Eclipse) enforce many of these behavior-preserving constraints mechanically -- they analyze references, update call sites, check type compatibility, and flag conflicts, making refactoring safer and faster than manual edits.",
    "The relationship between refactoring and testing is symbiotic. Tests make refactoring safe by catching unintended behavior changes. But refactoring also makes testing easier: extracting methods creates smaller units that can be tested in isolation, reducing the need for complex integration test setups. The TDD cycle (Red-Green-Refactor) embeds refactoring as a first-class activity: after making a test pass with the simplest possible code, you refactor to clean up duplication and improve design before writing the next test. Teams that skip the refactoring step accumulate technical debt that compounds over time.",
    "Code smells are heuristics, not rules. A Long Method is not automatically bad if it is a straightforward sequence of steps with no duplication. Feature Envy might be acceptable if moving the method would create a circular dependency. Primitive Obsession (using strings, ints, or booleans where a domain type would be clearer) is one of the most underappreciated smells because it spreads validation and formatting logic across the codebase instead of centralizing it in a value object. Shotgun Surgery -- where a single conceptual change requires edits in many classes -- indicates that a responsibility is scattered and should be consolidated through Move Method or Extract Class.",
    "In large codebases, refactoring strategy matters as much as technique. The Strangler Fig pattern wraps legacy code behind a new interface, gradually routing traffic to the new implementation until the old code can be removed. Branch by Abstraction introduces an abstraction layer over the code to be replaced, allows the old and new implementations to coexist behind the abstraction, and removes the old implementation once migration is complete. Both strategies enable incremental refactoring of production systems without risky big-bang rewrites.",
  ],

  code: [
    {
      language: "cpp",
      caption: "Extract Method and Decompose Conditional -- before and after",
      source: `// BEFORE: Long method with embedded logic and magic numbers
struct Item { double price; int quantity; };
struct Customer { int orders_count; };
struct Order {
    std::vector<Item> items;
    std::string country;
    Customer customer;
};

class OrderProcessorBefore {
public:
    double process(const Order& order) {
        double total = 0;
        for (const auto& item : order.items) {
            double price = item.price * item.quantity;
            if (item.quantity > 10)
                price *= 0.9;   // magic discount
            total += price;
        }
        if (order.country != "US")
            total *= 1.15;  // magic tax
        double shipping;
        if (total > 500)       shipping = 0;
        else if (total > 100)  shipping = 5.99;
        else                   shipping = 12.99;
        total += shipping;

        if (order.customer.orders_count > 50)
            total *= 0.95;
        std::cout << "Charged " << total << std::endl;
        return total;
    }
};

// AFTER: Extracted methods with clear names, no magic numbers
constexpr double BULK_DISCOUNT         = 0.9;
constexpr int    BULK_THRESHOLD        = 10;
constexpr double INTERNATIONAL_TAX_RATE = 1.15;
constexpr double LOYALTY_DISCOUNT      = 0.95;
constexpr int    LOYALTY_THRESHOLD     = 50;
constexpr double FREE_SHIPPING_MIN     = 500.0;
constexpr double REDUCED_SHIPPING_MIN  = 100.0;
constexpr double STANDARD_SHIPPING     = 12.99;
constexpr double REDUCED_SHIPPING      = 5.99;

class OrderProcessor {
public:
    double process(const Order& order) {
        double subtotal = calculate_subtotal(order.items);
        subtotal = apply_international_tax(subtotal, order.country);
        subtotal += calculate_shipping(subtotal);
        double total = apply_loyalty_discount(subtotal, order.customer);
        std::cout << "Charged " << total << std::endl;
        return total;
    }

private:
    double calculate_subtotal(const std::vector<Item>& items) {
        double sum = 0;
        for (const auto& item : items) sum += line_total(item);
        return sum;
    }

    double line_total(const Item& item) {
        double price = item.price * item.quantity;
        if (qualifies_for_bulk_discount(item))
            price *= BULK_DISCOUNT;
        return price;
    }

    bool qualifies_for_bulk_discount(const Item& item) {
        return item.quantity > BULK_THRESHOLD;
    }

    double apply_international_tax(double amount, const std::string& country) {
        if (country != "US")
            return amount * INTERNATIONAL_TAX_RATE;
        return amount;
    }

    double calculate_shipping(double subtotal) {
        if (subtotal > FREE_SHIPPING_MIN)    return 0;
        if (subtotal > REDUCED_SHIPPING_MIN) return REDUCED_SHIPPING;
        return STANDARD_SHIPPING;
    }

    double apply_loyalty_discount(double amount, const Customer& customer) {
        if (customer.orders_count > LOYALTY_THRESHOLD)
            return amount * LOYALTY_DISCOUNT;
        return amount;
    }
};`,
    },
    {
      language: "typescript",
      caption: "Replace Conditional with Polymorphism -- before and after",
      source: `// BEFORE: Switch on type scattered throughout the codebase
interface Shape {
  type: "circle" | "rectangle" | "triangle";
  radius?: number;
  width?: number;
  height?: number;
  base?: number;
  sideA?: number;
  sideB?: number;
  sideC?: number;
}

function area(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius! ** 2;
    case "rectangle":
      return shape.width! * shape.height!;
    case "triangle":
      return 0.5 * shape.base! * shape.height!;
    default:
      throw new Error("Unknown shape");
  }
}

function perimeter(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return 2 * Math.PI * shape.radius!;
    case "rectangle":
      return 2 * (shape.width! + shape.height!);
    case "triangle":
      return shape.sideA! + shape.sideB! + shape.sideC!;
    default:
      throw new Error("Unknown shape");
  }
}

// AFTER: Polymorphism -- each shape knows its own behavior
interface Shape {
  area(): number;
  perimeter(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class Triangle implements Shape {
  constructor(
    private base: number,
    private height: number,
    private sideA: number,
    private sideB: number,
    private sideC: number
  ) {}

  area(): number {
    return 0.5 * this.base * this.height;
  }

  perimeter(): number {
    return this.sideA + this.sideB + this.sideC;
  }
}

// Adding a new shape requires only a new class -- no existing code changes
class Ellipse implements Shape {
  constructor(private a: number, private b: number) {}

  area(): number {
    return Math.PI * this.a * this.b;
  }

  perimeter(): number {
    // Ramanujan approximation
    const h = ((this.a - this.b) ** 2) / ((this.a + this.b) ** 2);
    return Math.PI * (this.a + this.b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }
}`,
    },
    {
      language: "java",
      caption: "Introduce Parameter Object and Extract Class -- before and after",
      source: `// BEFORE: Primitive Obsession -- too many parameters, logic scattered
public class ReportGenerator {
    public String generateReport(String startDate, String endDate,
            String department, boolean includeCharts, boolean includeSummary,
            String format, int maxPages) {

        // Date validation duplicated everywhere these params appear
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End before start");
        }
        long days = ChronoUnit.DAYS.between(start, end);
        // ... hundreds of lines using these raw params ...
        return "report";
    }

    public int estimateSize(String startDate, String endDate,
            String department, boolean includeCharts, boolean includeSummary,
            String format, int maxPages) {
        // Same date validation duplicated again
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End before start");
        }
        // ...
        return 42;
    }
}

// AFTER: Parameter Object encapsulates related data + validation
// Extract Class separates date range into its own type
public class DateRange {
    private final LocalDate start;
    private final LocalDate end;

    public DateRange(String startDate, String endDate) {
        this.start = LocalDate.parse(startDate);
        this.end = LocalDate.parse(endDate);
        if (this.end.isBefore(this.start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }

    public long days()  { return ChronoUnit.DAYS.between(start, end); }
    public LocalDate start() { return start; }
    public LocalDate end()   { return end; }
}

public class ReportConfig {
    private final DateRange dateRange;
    private final String department;
    private final boolean includeCharts;
    private final boolean includeSummary;
    private final String format;
    private final int maxPages;

    public ReportConfig(DateRange dateRange, String department,
            boolean includeCharts, boolean includeSummary,
            String format, int maxPages) {
        this.dateRange = dateRange;
        this.department = department;
        this.includeCharts = includeCharts;
        this.includeSummary = includeSummary;
        this.format = format;
        this.maxPages = maxPages;
    }

    // Getters omitted for brevity
    public DateRange dateRange()    { return dateRange; }
    public String department()      { return department; }
    public boolean includeCharts()  { return includeCharts; }
    public boolean includeSummary() { return includeSummary; }
    public String format()          { return format; }
    public int maxPages()           { return maxPages; }
}

public class ReportGenerator {
    public String generateReport(ReportConfig config) {
        long days = config.dateRange().days();  // Validation already done
        // Clean, focused logic with no duplication
        return "report";
    }

    public int estimateSize(ReportConfig config) {
        long days = config.dateRange().days();  // No duplicated validation
        return 42;
    }
}`,
    },
  ],

  diagrams: [
    {
      title: "Common Refactoring Techniques Map",
      kind: "mindmap",
      caption: "Key refactoring techniques grouped by their purpose: simplifying logic, improving structure, reducing duplication, and clarifying intent.",
      mermaid: `mindmap
  root((Refactoring Techniques))
    Simplify Logic
      Replace Nested Conditional with Guard Clauses
      Decompose Conditional
      Consolidate Duplicate Fragments
    Improve Structure
      Extract Method
      Extract Class
      Move Method
      Inline Method
    Reduce Duplication
      Extract Superclass
      Pull Up Method
      Form Template Method
    Clarify Intent
      Rename Variable
      Rename Method
      Introduce Explaining Variable`,
    },
    {
      title: "Extract Method Refactoring",
      kind: "flow",
      caption: "Step-by-step process for the Extract Method refactoring: identify a code block, create a new method, replace the block, and verify behavior is unchanged.",
      mermaid: `flowchart TD
    A([Identify code block to extract]) --> B[Choose descriptive method name]
    B --> C[Create new method with parameters]
    C --> D[Copy code block into method]
    D --> E[Replace original block with call]
    E --> F[Run tests]
    F --> G{Tests pass?}
    G -->|Yes| H[Refactoring complete]
    G -->|No| I[Debug parameter passing]
    I --> C`,
    },
    {
      title: "Replace Conditional with Polymorphism",
      kind: "architecture",
      caption: "Replacing a switch or if-else chain with polymorphism: create a base class and subclasses that override behavior, removing the conditional entirely.",
      mermaid: `graph TD
    subgraph Before["Before - Conditional"]
      B1[method] --> B2{type switch}
      B2 -->|TypeA| B3[Logic A]
      B2 -->|TypeB| B4[Logic B]
      B2 -->|TypeC| B5[Logic C]
    end
    subgraph After["After - Polymorphism"]
      A1[Base Class method] --> A2[TypeA subclass]
      A1 --> A3[TypeB subclass]
      A1 --> A4[TypeC subclass]
    end`,
    },
    {
      title: "Code Smell to Technique Mapping",
      kind: "network",
      caption: "How common code smells map to refactoring techniques that address them.",
      mermaid: `graph LR
    LongMethod["Long Method"] --> ExtractMethod["Extract Method"]
    LargeClass["Large Class"] --> ExtractClass["Extract Class"]
    DupCode["Duplicate Code"] --> ExtractSuperclass["Extract Superclass"]
    DupCode --> PullUpMethod["Pull Up Method"]
    LongParam["Long Parameter List"] --> IntroParamObj["Introduce Parameter Object"]
    SwitchStatement["Switch Statements"] --> Polymorphism["Replace with Polymorphism"]
    DataClumps["Data Clumps"] --> ExtractClass`,
    },
  ],

  animations: [
    {
      title: "Extract Method Step-by-Step",
      steps: [
        {
          label: "Identify the block",
          detail:
            "Find a block of code inside a long method that performs a single logical task. Look for comments that describe what the block does -- the comment often becomes the method name.",
        },
        {
          label: "Check variable scope",
          detail:
            "Identify all local variables used within the block. Variables read but not modified become parameters. Variables modified inside the block and used after it become return values.",
        },
        {
          label: "Create the new method",
          detail:
            "Create a method with a descriptive name. Add parameters for the variables the block reads. Set the return type to match any variable the block modifies and the caller needs afterward.",
        },
        {
          label: "Move the code",
          detail:
            "Cut the code block from the original method and paste it into the new method. Replace the original block with a call to the new method, passing the required arguments and capturing the return value.",
        },
        {
          label: "Run tests",
          detail:
            "Execute the full test suite. If any test fails, the extraction changed behavior -- revert and investigate. If all tests pass, the refactoring is complete.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Technique",
      "When to Use",
      "Code Smell Addressed",
      "Risk Level",
    ],
    rows: [
      [
        "Extract Method",
        "Method is too long or a block needs a comment",
        "Long Method, Duplicated Code",
        "Low",
      ],
      [
        "Inline Method",
        "Method body is as clear as its name",
        "Unnecessary indirection",
        "Low",
      ],
      [
        "Rename",
        "Name does not reveal intent",
        "Mysterious Name",
        "Low",
      ],
      [
        "Move Method/Field",
        "Method uses another class's data more than its own",
        "Feature Envy",
        "Medium",
      ],
      [
        "Pull Up Method",
        "Subclasses share identical methods",
        "Duplicated Code in subclasses",
        "Medium",
      ],
      [
        "Push Down Method",
        "Parent method only relevant to one subclass",
        "Refused Bequest",
        "Low",
      ],
      [
        "Replace Conditional with Polymorphism",
        "Switch/if-else branches on object type",
        "Switch Statements, Parallel Hierarchies",
        "High",
      ],
      [
        "Introduce Parameter Object",
        "Multiple methods share the same group of parameters",
        "Long Parameter List, Primitive Obsession",
        "Low",
      ],
      [
        "Replace Temp with Query",
        "Temp variable holds a one-off computation",
        "Temporary Field, Long Method",
        "Low",
      ],
      [
        "Decompose Conditional",
        "Complex boolean expressions obscure intent",
        "Long Method, Complex Conditional",
        "Low",
      ],
      [
        "Extract Class",
        "One class handles two or more responsibilities",
        "Large Class, Divergent Change",
        "Medium",
      ],
      [
        "Inline Class",
        "A class does too little to justify its existence",
        "Lazy Class, Speculative Generality",
        "Low",
      ],
      [
        "Replace Magic Number with Constant",
        "Literal values appear without explanation",
        "Magic Number, Mysterious Name",
        "Low",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What is refactoring, and how does it differ from rewriting?",
      a: "Refactoring is the process of restructuring existing code without changing its observable behavior. Each step is small, behavior-preserving, and reversible. Rewriting means discarding existing code and building from scratch. Refactoring carries much lower risk because you verify behavior after every step with automated tests. Rewriting is a last resort when the code is so tangled that incremental improvement is impractical.",
      followUps: [
        "How do you decide between refactoring and rewriting?",
        "What is the Strangler Fig pattern?",
      ],
    },
    {
      q: "How does Extract Method work, and when would you use it?",
      a: "Extract Method takes a block of code from an existing method and moves it into a new method with a descriptive name. You use it when a method is too long, when a code block needs a comment to explain its purpose (the comment becomes the method name), or when the same logic is duplicated in multiple places. You identify the local variables the block reads (they become parameters) and any it modifies and the caller needs (they become the return value). After extraction, run tests to confirm behavior is preserved.",
    },
    {
      q: "What is Replace Conditional with Polymorphism?",
      a: "This refactoring replaces switch statements or if/else chains that branch on an object's type with a class hierarchy where each subclass implements its own variant of the behavior. The caller invokes the method through the base type, and polymorphic dispatch selects the correct implementation. This follows the Open/Closed Principle: adding a new type requires adding a new class, not modifying existing branching logic. It is especially valuable when the same type-based branching appears in multiple places.",
      followUps: [
        "When would you keep a conditional instead of using polymorphism?",
        "How does this relate to the Strategy pattern?",
      ],
    },
    {
      q: "What are code smells, and can you name several?",
      a: "Code smells are surface-level indicators that something in the code might be poorly structured. They are heuristics, not definitive problems. Common smells include: Long Method (too many lines doing too many things), Feature Envy (a method that uses another class's data more than its own), Primitive Obsession (using raw types instead of domain objects), Shotgun Surgery (one change requires edits across many classes), Large Class (a class with too many responsibilities), Duplicated Code (same logic in multiple places), and Long Parameter List (methods with too many arguments). Each smell maps to specific refactoring techniques.",
    },
    {
      q: "Why is testing important for safe refactoring?",
      a: "Tests are the safety net that guarantees refactoring preserves behavior. The workflow is: run tests (all green), make one small refactoring step, run tests again. If a test fails, the refactoring changed behavior -- revert immediately and investigate. Without tests, you have no way to verify that the code still works correctly after restructuring. This is why the first step of refactoring legacy code is often writing characterization tests that capture the current behavior, even if that behavior includes bugs.",
      followUps: [
        "What are characterization tests?",
        "How does TDD relate to refactoring?",
      ],
    },
    {
      q: "Explain Introduce Parameter Object and when you would use it.",
      a: "Introduce Parameter Object replaces a group of parameters that frequently appear together in method signatures with a single object that encapsulates them. For example, replacing startDate and endDate with a DateRange object. Benefits include: shorter parameter lists, reduced duplication of validation logic (the object validates in its constructor), a natural home for behavior that operates on those values (like DateRange.days()), and a clearer API. You use it when you see the same cluster of parameters repeated across multiple methods.",
    },
    {
      q: "When should you NOT refactor code?",
      a: "Do not refactor without adequate test coverage -- you need a way to verify behavior preservation. Do not refactor code that is about to be deleted or replaced. Do not refactor during a production incident -- fix the immediate problem first. Avoid large cross-cutting refactorings in a single commit; break them into incremental steps. Do not refactor purely working code that no one needs to change -- the risk of introducing bugs outweighs the aesthetic benefit. Finally, do not refactor to show off patterns or techniques; refactoring should serve a concrete goal like making a feature change easier.",
    },
  ],

  followUps: [
    "How do you refactor safely when the code has no tests?",
    "What's the difference between refactoring and rewriting, and when does one become the other?",
    "How do you refactor a module that's actively being changed by another team?",
    "Why should a refactoring commit contain no behaviour change at all?",
  ],
  mcqs: [
    {
      q: "What is the primary goal of refactoring?",
      options: [
        "Add new features to the codebase",
        "Improve internal code structure without changing external behavior",
        "Fix bugs and resolve production issues",
        "Optimize runtime performance",
      ],
      answerIndex: 1,
      explanation:
        "Refactoring specifically means restructuring code without changing what it does. Feature additions, bug fixes, and performance optimization are separate activities.",
    },
    {
      q: "Which code smell does Move Method primarily address?",
      options: [
        "Long Method",
        "Feature Envy",
        "Primitive Obsession",
        "Duplicated Code",
      ],
      answerIndex: 1,
      explanation:
        "Feature Envy occurs when a method uses data from another class more than its own. Moving the method to that class improves cohesion.",
    },
    {
      q: "What is the correct first step before applying any refactoring?",
      options: [
        "Create a new branch",
        "Write documentation for the change",
        "Ensure adequate test coverage exists",
        "Get approval from the team lead",
      ],
      answerIndex: 2,
      explanation:
        "Tests are the safety net for refactoring. Without them, you cannot verify that the restructured code preserves behavior.",
    },
    {
      q: "Replace Conditional with Polymorphism follows which SOLID principle?",
      options: [
        "Single Responsibility Principle",
        "Open/Closed Principle",
        "Liskov Substitution Principle",
        "Dependency Inversion Principle",
      ],
      answerIndex: 1,
      explanation:
        "The Open/Closed Principle states that code should be open for extension but closed for modification. Adding a new type means adding a new subclass, not editing existing switch statements.",
    },
    {
      q: "Which refactoring converts a local variable holding a computed result into a method call?",
      options: [
        "Extract Method",
        "Inline Method",
        "Replace Temp with Query",
        "Introduce Parameter Object",
      ],
      answerIndex: 2,
      explanation:
        "Replace Temp with Query eliminates a temporary variable by turning the computation into a method, making it reusable and often revealing further refactoring opportunities.",
    },
    {
      q: "Introduce Parameter Object is most useful when:",
      options: [
        "A method has exactly one parameter",
        "Multiple methods share the same group of parameters",
        "A class has too many methods",
        "A method uses too many local variables",
      ],
      answerIndex: 1,
      explanation:
        "When the same cluster of parameters appears in multiple method signatures, grouping them into an object reduces duplication and provides a home for related behavior.",
    },
    {
      q: "What does the Strangler Fig pattern achieve in the context of refactoring?",
      options: [
        "It replaces all code at once in a big-bang rewrite",
        "It incrementally replaces legacy code behind a new interface",
        "It removes dead code automatically",
        "It generates unit tests for legacy systems",
      ],
      answerIndex: 1,
      explanation:
        "The Strangler Fig pattern wraps legacy code behind a new interface and gradually routes functionality to the new implementation, enabling safe incremental migration.",
    },
  ],

  flashcards: [
    {
      front: "What is the Extract Method refactoring?",
      back: "Move a block of code from a long method into a new method with a descriptive name. Variables the block reads become parameters; variables it modifies and the caller needs become the return value.",
    },
    {
      front: "What is Feature Envy?",
      back: "A code smell where a method accesses data from another class more than from its own class. The fix is usually Move Method -- relocate the method to the class whose data it uses most.",
    },
    {
      front: "When should you use Inline Method?",
      back: "When a method's body is as clear and simple as its name. The extra indirection provides no readability benefit, so fold the body back into the caller.",
    },
    {
      front: "What does Replace Conditional with Polymorphism do?",
      back: "Replaces switch/if-else chains that branch on type with a class hierarchy where each subclass overrides the method with its own behavior. The caller uses polymorphic dispatch instead of branching.",
    },
    {
      front: "What is Primitive Obsession?",
      back: "Using primitive types (strings, ints, booleans) for domain concepts instead of creating small domain-specific classes. For example, using a string for an email address instead of an Email value object that validates format.",
    },
    {
      front: "What is the Red-Green-Refactor cycle?",
      back: "The TDD loop: Red (write a failing test), Green (write the simplest code to pass the test), Refactor (clean up the code while keeping tests green). Refactoring is embedded as a first-class step.",
    },
    {
      front: "What is Shotgun Surgery?",
      back: "A code smell where a single conceptual change requires editing many different classes or files. It indicates a scattered responsibility that should be consolidated through Move Method or Extract Class.",
    },
    {
      front: "What is the Strangler Fig pattern?",
      back: "A strategy for incrementally replacing legacy code by wrapping it behind a new interface and gradually routing functionality to the new implementation until the legacy code can be safely removed.",
    },
    {
      front: "What is Decompose Conditional?",
      back: "Extract a complex condition, its then-branch, and its else-branch into separate named methods. Turns 'if (date.before(SUMMER_START) || date.after(SUMMER_END))' into 'if (isNotSummer(date))'.",
    },
  ],

  revisionNotes: [
    "Refactoring = restructuring code without changing behavior. Always backed by tests.",
    "Extract Method: long method -> multiple short, named methods. Most frequently used refactoring.",
    "Rename: cheapest, highest-ROI refactoring. Good names eliminate the need for comments.",
    "Move Method/Field: fix Feature Envy by putting behavior where the data lives.",
    "Pull Up (shared behavior to parent) vs Push Down (specific behavior to subclass).",
    "Replace Conditional with Polymorphism: eliminate type-based switch/if-else with subclass overrides. Follows Open/Closed.",
    "Introduce Parameter Object: group related parameters into a class. Reduces duplication, centralizes validation.",
    "Replace Temp with Query: local variable -> method call. Enables reuse, reveals further extractions.",
    "Decompose Conditional: name the condition and branches. Turns boolean puzzles into readable prose.",
    "Extract Class (too many responsibilities) vs Inline Class (too few responsibilities).",
    "Replace Magic Number with Symbolic Constant: give names to literals for clarity and single point of change.",
    "Code smells are triggers: Long Method, Feature Envy, Primitive Obsession, Shotgun Surgery, Large Class, Duplicated Code.",
    "Do NOT refactor without tests, during crises, or code that is about to be deleted.",
    "Strangler Fig and Branch by Abstraction enable incremental refactoring of large legacy systems.",
  ],

  cheatSheet: [
    "Extract Method: block with comment -> named method; comment becomes method name",
    "Inline Method: trivial wrapper -> fold body into caller",
    "Rename: d -> elapsedDays; calc() -> calculateMonthlyInterest()",
    "Move Method: method uses ClassB's data more -> move it to ClassB",
    "Pull Up: identical method in 3 subclasses -> move to parent",
    "Push Down: parent method used by 1 of 5 subclasses -> move to that subclass",
    "Replace Conditional w/ Polymorphism: switch(type){...} -> type.doThing()",
    "Introduce Parameter Object: (startDate, endDate) -> DateRange",
    "Replace Temp with Query: double tax = price * 0.1; -> getTax()",
    "Decompose Conditional: complex if(...) -> if(isEligible())",
    "Extract Class: God class -> two focused classes",
    "Inline Class: class with one trivial method -> merge into user",
    "Replace Magic Number: 0.08 -> TAX_RATE; 86400 -> SECONDS_PER_DAY",
    "Refactoring loop: green tests -> one small change -> green tests -> repeat",
  ],

  resources: [
    {
      label: "Refactoring (2nd Ed.) by Martin Fowler",
      kind: "book",
      note: "The definitive catalog of refactoring techniques with JavaScript examples.",
    },
    {
      label: "Working Effectively with Legacy Code by Michael Feathers",
      kind: "book",
      note: "Essential guide to getting untested legacy code under test so you can safely refactor it.",
    },
    {
      label: "Refactoring Guru -- Refactoring Techniques",
      kind: "article",
      note: "Free online catalog with visual explanations of all major refactoring techniques.",
    },
    {
      label: "Clean Code by Robert C. Martin",
      kind: "book",
      note: "Covers naming, function design, and code structure principles that motivate refactoring.",
    },
    {
      label: "Martin Fowler -- Refactoring Catalog (refactoring.com)",
      kind: "docs",
      note: "Online companion to the book with technique descriptions and mechanics.",
    },
    {
      label: "Refactoring with Martin Fowler (YouTube talk)",
      kind: "video",
      note: "Conference talk demonstrating live refactoring with running tests.",
    },
  ],

  glossary: [
    {
      term: "Refactoring",
      definition:
        "The disciplined process of restructuring existing code without changing its observable behavior, improving internal structure for readability, maintainability, and extensibility.",
    },
    {
      term: "Code Smell",
      definition:
        "A surface-level indicator in code that suggests a deeper structural problem. Smells are heuristics that guide developers toward appropriate refactoring techniques.",
    },
    {
      term: "Extract Method",
      definition:
        "A refactoring that moves a block of code from an existing method into a new named method, replacing the block with a call to the new method.",
    },
    {
      term: "Feature Envy",
      definition:
        "A code smell where a method uses data or methods from another class more than from its own, suggesting the method should be moved to that other class.",
    },
    {
      term: "Primitive Obsession",
      definition:
        "A code smell where primitive types (strings, ints) are used to represent domain concepts instead of small purpose-built classes or value objects.",
    },
    {
      term: "Behavior Preservation",
      definition:
        "The fundamental constraint of refactoring: after each transformation, the program must produce exactly the same outputs for the same inputs.",
    },
    {
      term: "Strangler Fig Pattern",
      definition:
        "An incremental migration strategy that wraps legacy code behind a new interface, gradually routing traffic to a new implementation until the old code can be removed.",
    },
    {
      term: "Shotgun Surgery",
      definition:
        "A code smell where a single logical change requires modifications across many different classes or modules, indicating scattered responsibilities.",
    },
    {
      term: "Characterization Test",
      definition:
        "A test written to capture the current behavior of existing code (even if buggy), providing a safety net before refactoring legacy systems.",
    },
    {
      term: "Branch by Abstraction",
      definition:
        "A technique for making large-scale changes incrementally by introducing an abstraction layer that allows old and new implementations to coexist during migration.",
    },
  ],
  exercises: [
    "Find a **long method** (30+ lines) in a codebase you work on or an open-source C++ project. Apply **Extract Method** at least 3 times to break it into well-named helper functions. Before you start, write a test that captures the current behavior. Run the test after *each* extraction to verify behavior preservation. Document the before/after line counts and readability improvement.",
    "Take a C++ class that uses a `switch` statement or `if/else` chain branching on a *type* or *enum* value. Apply **Replace Conditional with Polymorphism**: create a base class with a virtual method and one subclass per case. Verify that adding a new case now requires only a *new subclass* with no edits to existing code. Does this follow the **Open/Closed Principle**?",
    "Identify an instance of **Primitive Obsession** in your code -- for example, raw `std::string` used for email addresses, currency amounts, or date ranges. Apply **Introduce Parameter Object** or **Extract Class** to create a small domain type that encapsulates validation and behavior. How many places in the codebase did the duplicated validation logic previously appear?",
    "Pick a class exhibiting **Feature Envy** -- a method that calls getters on another class more than it uses its own data. Apply **Move Method** to relocate it to the class whose data it envies. Then check: did the move reduce coupling between the two classes? Did it reveal any further refactoring opportunities like **Inline Method** or **Extract Class**?",
    "Practice the **Red-Green-Refactor** cycle: write a failing test for a small feature (e.g., a `DateRange` class with `overlaps()` and `contains()` methods in C++). Make it pass with the simplest possible code. Then refactor -- extract constants, rename variables, simplify conditionals -- running tests after *each* micro-step. Commit after every green test to build a refactoring history.",
  ],
};
