import type { TopicContent } from "../types";

export const lawOfDemeter: TopicContent = {
  quickSummary: [
    "The Law of Demeter (LoD) states that a method should only call methods on: itself, its parameters, objects it creates, and its direct component objects -- never on objects returned by other calls (\"don't talk to strangers\").",
    "Violations appear as 'train wreck' chains like `order.getCustomer().getAddress().getCity()`, which tightly couple the caller to the entire object graph and make refactoring brittle.",
    "LoD is fundamentally about minimizing coupling: each unit of code should have limited knowledge of the structure of other units, communicating only with its immediate collaborators.",
    "The law applies to mutable domain objects and business logic; it is deliberately relaxed for fluent builders, stream/LINQ pipelines, and pure data transfer objects where the chain is a single abstraction."
  ],

  detailed: [
    "Formally proposed by Ian Holland in 1987 during the Demeter project at Northeastern University, LoD is sometimes called the 'Principle of Least Knowledge'. It constrains which objects a method M of class C may invoke methods on: (1) C itself (this/self), (2) M's parameters, (3) any object created/instantiated inside M, (4) C's direct instance variables. Calling a method on the *return value* of another method call is a violation because you are now coupled to a type that is not a direct collaborator.",
    "Train-wreck code such as `invoice.getLineItems().get(0).getProduct().getCategory().getName()` creates implicit structural dependencies: the caller must know that invoices have line items, line items have products, products have categories, and categories have names. If any of those relationships change, the caller breaks -- even though it only cares about a category name.",
    "The standard refactoring is 'Tell, Don't Ask': instead of reaching through objects to pull data out, push behavior into the object that owns the data. For example, replace `customer.getAddress().getCity()` with `customer.getCity()` or, better, `customer.isInCity(targetCity)` so the knowledge of internal structure stays encapsulated.",
    "LoD violations inflate the fan-out of a class -- the number of other types it depends on. High fan-out makes unit testing painful because every transitive type must be mocked or stubbed. Applying LoD keeps each class's dependency surface small, making tests focused and fast.",
    "One common misunderstanding is that LoD forbids *all* method chaining. It does not. Fluent APIs (`builder.withName(\"x\").withAge(30).build()`) return `this` or a same-abstraction wrapper, so each call stays within the same logical collaborator. Similarly, Java Streams and LINQ chains operate on a pipeline abstraction, not on unrelated domain objects.",
    "Applying LoD naively can lead to 'wrapper bloat' -- dozens of thin delegation methods on intermediate objects. The remedy is to evaluate whether the delegation truly hides a decision. If the delegating method is pure pass-through with no conditional logic, it may be better to expose a richer interface or restructure the object graph."
  ],

  deepDive: [
    "From a graph-theory perspective, LoD restricts the call graph to edges of distance 1 in the object-reference graph. Without LoD, a single method can traverse an arbitrarily long path through the reference graph, creating hidden runtime coupling that does not appear in the class's import/dependency list. This is why static analysis tools (SonarQube, NDepend) flag deep chains: the compile-time type set is a subset of the runtime coupling set, and LoD keeps them aligned.",
    "LoD interacts deeply with the Interface Segregation Principle (ISP). When you feel the urge to chain through objects, it often means the consuming code needs a narrower interface that directly provides the required data. Introducing a role interface (e.g., `Locatable` with `getCity()`) that the domain object implements satisfies both LoD and ISP, keeping the caller decoupled from the full object.",
    "In event-driven and message-passing architectures, LoD is enforced structurally: components communicate via events or commands, never by traversing each other's state. This is why microservices and actor models (Akka, Erlang/OTP) naturally satisfy LoD -- each actor only knows its own state and the addresses of its direct collaborators. Violations reappear when services expose deeply nested REST responses and consumers parse into nested fields, recreating structural coupling over the wire.",
    "Testing is where LoD violations hurt most visibly. Consider mocking `order.getCustomer().getAddress().getZip()`: you need a mock Order that returns a mock Customer that returns a mock Address that returns a string. Mockito's `RETURNS_DEEP_STUBS` exists precisely because this pattern is so common -- but its existence is a code smell, not a solution. After refactoring to `order.getShippingZip()`, the test needs one mock with one stub.",
    "The 'Law' is really a guideline with well-known exceptions. Data-oriented designs (Entity-Component-System in game engines, DataFrame column access in data science) intentionally expose structure because the data *is* the interface. Applying LoD there would hide the very thing users need to manipulate. The key heuristic: if the chained objects represent *different responsibilities* in your domain, apply LoD; if they represent layers of *the same data abstraction*, chaining is acceptable."
  ],

  code: [
    {
      language: "java",
      caption: "LoD violation (train wreck) and refactored version",
      source: `// --- VIOLATION ---
public class OrderProcessor {
    public String getCustomerCity(Order order) {
        // Reaches through Order -> Customer -> Address -> city
        return order.getCustomer().getAddress().getCity();
    }
}

// --- REFACTORED (Tell, Don't Ask) ---
// Push the knowledge into Order:
public class Order {
    private Customer customer;

    public String getShippingCity() {
        return customer.getCity(); // Customer delegates to Address internally
    }
}

public class Customer {
    private Address address;

    public String getCity() {
        return address.getCity(); // Only Address knows its own structure
    }
}

public class OrderProcessor {
    public String getCustomerCity(Order order) {
        return order.getShippingCity(); // Single dot -- LoD satisfied
    }
}`
    },
    {
      language: "typescript",
      caption: "LoD-compliant design using Tell Don't Ask with behavior push-down",
      source: `// VIOLATION: UI layer reaches deep into domain objects
function renderDiscount(order: Order) {
  const rate = order.getCustomer().getLoyaltyProgram().getDiscountRate();
  const total = order.getTotal() * (1 - rate);
  return \`Total after discount: \${total}\`;
}

// REFACTORED: Order owns the discount calculation
class Order {
  private customer: Customer;
  private items: LineItem[];

  getDiscountedTotal(): number {
    const rate = this.customer.getDiscountRate(); // Customer hides loyalty details
    return this.getSubtotal() * (1 - rate);
  }

  private getSubtotal(): number {
    return this.items.reduce((sum, li) => sum + li.getTotal(), 0);
  }
}

class Customer {
  private loyaltyProgram: LoyaltyProgram | null;

  getDiscountRate(): number {
    return this.loyaltyProgram?.getDiscountRate() ?? 0;
  }
}

// Now the UI only talks to its direct collaborator
function renderDiscount(order: Order) {
  return \`Total after discount: \${order.getDiscountedTotal()}\`;
}`
    },
    {
      language: "cpp",
      caption: "When chaining is acceptable: fluent builders and STL pipelines",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <algorithm>

// ACCEPTABLE: Fluent builder -- each call returns *this (same object)
class QueryBuilder {
    std::string query_;
public:
    QueryBuilder& select(const std::string& cols) {
        query_ = "SELECT " + cols; return *this;
    }
    QueryBuilder& from(const std::string& table) {
        query_ += " FROM " + table; return *this;
    }
    QueryBuilder& where(const std::string& cond) {
        query_ += " WHERE " + cond; return *this;
    }
    QueryBuilder& order_by(const std::string& col) {
        query_ += " ORDER BY " + col; return *this;
    }
    QueryBuilder& limit(int n) {
        query_ += " LIMIT " + std::to_string(n); return *this;
    }
    std::string build() const { return query_; }
};

auto query = QueryBuilder()
    .select("name, email")
    .from("users")
    .where("active = true")
    .order_by("created_at")
    .limit(50)
    .build();

// ACCEPTABLE: STL algorithms -- operating on a single abstraction (range)
struct Order { bool is_confirmed; double total; };
std::vector<Order> orders = {{true, 100.0}, {false, 50.0}, {true, 200.0}};

double total_revenue = 0.0;
for (const auto& o : orders) {
    if (o.is_confirmed) total_revenue += o.total;
}
// Or with std::accumulate and a lambda -- single-abstraction pipeline

// VIOLATION: Navigating unrelated domain objects
// city = company.get_ceo().get_assistant().get_office().get_address().get_city();

// REFACTORED: single call to immediate collaborator
class Company {
    // ... internal structure hidden ...
public:
    std::string get_headquarters_city() const {
        // Internally delegates through the object graph
        return "San Francisco";  // details encapsulated
    }
};

Company company;
auto city = company.get_headquarters_city();  // LoD compliant`
    },
    {
      language: "java",
      caption: "Testing impact: deep mocks vs. LoD-compliant single mock",
      source: `// --- Before LoD: painful test setup ---
@Test
void calculateShipping_beforeLoD() {
    Address address = mock(Address.class);
    when(address.getZipCode()).thenReturn("94105");

    Customer customer = mock(Customer.class);
    when(customer.getAddress()).thenReturn(address);

    Order order = mock(Order.class);
    when(order.getCustomer()).thenReturn(customer);

    // 3 mocks just to get a zip code!
    ShippingCalculator calc = new ShippingCalculator();
    double cost = calc.calculate(order);
    assertEquals(12.99, cost);
}

// --- After LoD: clean, focused test ---
@Test
void calculateShipping_afterLoD() {
    Order order = mock(Order.class);
    when(order.getShippingZipCode()).thenReturn("94105");

    // 1 mock, 1 stub -- exactly what the calculator needs
    ShippingCalculator calc = new ShippingCalculator();
    double cost = calc.calculate(order);
    assertEquals(12.99, cost);
}`
    }
  ],

  diagrams: [
    {
      title: "LoD Coupling Boundary",
      kind: "architecture",
      caption: "Shows which objects a method may legally call methods on (green) vs. strangers it must not reach into (red). The boundary keeps coupling to immediate collaborators only."
    },
    {
      title: "Train Wreck Refactoring Flow",
      kind: "flow",
      caption: "Step-by-step flow for identifying a train wreck chain, determining the real data need, pushing behavior into the owning class, and verifying the refactored call satisfies LoD."
    }
  ],

  animations: [
    {
      title: "Refactoring a Train Wreck Step by Step",
      steps: [
        {
          label: "Identify the chain",
          detail: "Spot a multi-dot expression like `order.getCustomer().getAddress().getCity()`. Each dot after the first is a potential LoD violation."
        },
        {
          label: "Determine what the caller actually needs",
          detail: "The caller wants a city name. It does not care about Customer or Address objects -- those are implementation details of Order."
        },
        {
          label: "Push a method into the nearest collaborator",
          detail: "Add `getShippingCity()` to Order. Internally, Order delegates to Customer, and Customer delegates to Address. Each class only talks to its own field."
        },
        {
          label: "Replace the chain with a single call",
          detail: "The caller now writes `order.getShippingCity()` -- one dot, one collaborator, LoD satisfied."
        },
        {
          label: "Verify testability improvement",
          detail: "The test for the caller now mocks only Order with one stub instead of three nested mocks. Fewer dependencies, faster tests, clearer intent."
        }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "LoD-Violating Code", "LoD-Compliant Code"],
    rows: [
      ["Coupling", "Caller coupled to entire object graph (Order, Customer, Address)", "Caller coupled only to Order"],
      ["Testability", "Requires deep mock chains (3+ mocks for a single value)", "Single mock with one stub"],
      ["Change impact", "Renaming Address.getCity() breaks OrderProcessor", "Only Address and Customer internals change; OrderProcessor untouched"],
      ["Readability", "Long chains obscure intent -- what does the caller really need?", "Method name `getShippingCity()` communicates intent directly"],
      ["Encapsulation", "Internal structure of Customer/Address is public knowledge", "Internal structure hidden behind domain methods"],
      ["Reuse", "Every caller duplicates the navigation path", "Navigation logic centralized in one delegation method"]
    ]
  },

  interviewQA: [
    {
      q: "What is the Law of Demeter and why is it important?",
      a: "The Law of Demeter says a method should only call methods on itself, its parameters, objects it creates, and its own instance variables -- never on objects returned by those calls. It minimizes coupling by limiting each object's knowledge of the system's structure, making code easier to change, test, and understand.",
      followUps: [
        "Can you give a concrete example of a violation?",
        "How does LoD relate to the Single Responsibility Principle?"
      ]
    },
    {
      q: "What is a 'train wreck' in the context of LoD?",
      a: "A train wreck is a chain of method calls like `a.getB().getC().getD()` where each call returns a different object whose method is then invoked. It violates LoD because the caller is coupled to B, C, and D even though it only directly holds A. The name comes from the visual appearance of the chained dots resembling connected train cars -- and the code is just as fragile when one car derails.",
      followUps: [
        "Is every method chain a train wreck?",
        "How would you refactor a train wreck in legacy code with no tests?"
      ]
    },
    {
      q: "Does the Law of Demeter apply to fluent APIs and builder patterns?",
      a: "No, fluent APIs are exempt because each method returns `this` or the same builder type. The caller is always talking to the same logical object, so there is no coupling to strangers. The key distinction is whether the chained calls traverse different responsibilities (violation) or stay within a single abstraction (acceptable).",
      followUps: [
        "What about Java Streams or LINQ?",
        "How do you decide if a chain is a single abstraction vs. multiple?"
      ]
    },
    {
      q: "How does LoD relate to 'Tell, Don't Ask'?",
      a: "They are complementary principles. 'Tell, Don't Ask' says you should tell an object to do something rather than asking it for data and doing the work yourself. LoD provides the structural rule (don't reach through objects), while Tell-Don't-Ask provides the behavioral rule (push logic to the data owner). Applying Tell-Don't-Ask naturally satisfies LoD because you stop navigating the object graph to extract data.",
      followUps: [
        "Are there cases where asking is better than telling?",
        "How does this interact with CQRS?"
      ]
    },
    {
      q: "What are the downsides of applying LoD too aggressively?",
      a: "Over-application leads to 'wrapper bloat' or 'middle man' classes -- dozens of thin delegation methods that add indirection without encapsulating any decision. If `Customer.getCity()` is purely `return address.getCity()` with no conditional logic, you have added a layer of indirection for no behavioral benefit. The remedy is to evaluate whether the delegation hides a real design decision, and to consider richer interfaces or restructured object graphs instead of blind delegation.",
      followUps: [
        "How do you tell if a wrapper is adding value?",
        "When would you intentionally violate LoD?"
      ]
    },
    {
      q: "How do you detect LoD violations in a codebase?",
      a: "Static analysis tools like SonarQube, PMD, and NDepend can flag long method chains and high efferent coupling. In code review, look for multiple dots on a single expression involving different types, mock setups requiring `when(a.getB()).thenReturn(mockB)` chains, and methods that import types they never directly use but reach through intermediaries. Metrics like CBO (Coupling Between Objects) and fan-out also surface LoD issues.",
      followUps: [
        "Can you automate LoD enforcement in a CI pipeline?",
        "What SonarQube rules are relevant?"
      ]
    },
    {
      q: "How does LoD apply in microservices and distributed systems?",
      a: "In distributed systems, LoD manifests as 'don't call a service just to get data to call another service'. A service should own its data and behavior, exposing only what consumers need. Violations reappear when API responses contain deeply nested objects and consumers parse multiple levels deep -- this recreates structural coupling over the wire. The fix is the same: push the needed computation to the service that owns the data, or create a facade/BFF that aggregates it.",
      followUps: [
        "How does GraphQL affect LoD in APIs?",
        "What about service mesh and sidecar patterns?"
      ]
    }
  ],

  followUps: [
    "How does LoD interact with Domain-Driven Design's Aggregate pattern, where the root controls access to internal entities?",
    "In functional programming, does LoD still apply when data is modeled as nested immutable records?",
    "How does the Facade pattern help satisfy LoD at an architectural level?",
    "What is the relationship between LoD and the Mediator pattern?",
    "How do ORMs like Hibernate/JPA encourage LoD violations through lazy-loaded navigation properties?",
    "Can LoD be quantified with coupling metrics, and what thresholds are useful?"
  ],

  mcqs: [
    {
      q: "Which of the following method calls violates the Law of Demeter inside a method of class A?",
      options: [
        "this.field.doSomething()",
        "param.doSomething()",
        "param.getChild().doSomething()",
        "new Helper().doSomething()"
      ],
      answerIndex: 2,
      explanation: "Calling a method on the return value of param.getChild() means A is talking to a 'stranger' -- an object it did not directly create, receive as a parameter, or hold as a field. The other three options are all permitted by LoD."
    },
    {
      q: "Why is `order.getCustomer().getAddress().getCity()` considered a 'train wreck'?",
      options: [
        "Because it is too slow at runtime",
        "Because it couples the caller to Customer and Address, which are not its direct collaborators",
        "Because method chaining is always an anti-pattern",
        "Because it violates the Single Responsibility Principle"
      ],
      answerIndex: 1,
      explanation: "The chain forces the caller to know the internal structure of Order (it has a Customer) and Customer (it has an Address). Any change to that structure breaks the caller, even though it only needs a city name."
    },
    {
      q: "Which pattern is exempt from LoD because each chained call returns the same object?",
      options: [
        "Observer pattern",
        "Strategy pattern",
        "Fluent builder pattern",
        "Template method pattern"
      ],
      answerIndex: 2,
      explanation: "Fluent builders return `this` from each method, so the caller always communicates with the same object. There is no traversal into stranger objects, so LoD is not violated."
    },
    {
      q: "What is the primary refactoring technique for fixing an LoD violation?",
      options: [
        "Extract Method",
        "Tell, Don't Ask (push behavior to the data owner)",
        "Replace Conditional with Polymorphism",
        "Introduce Parameter Object"
      ],
      answerIndex: 1,
      explanation: "Tell, Don't Ask moves the behavior into the class that owns the data, eliminating the need for the caller to navigate through intermediate objects. Instead of asking for data and computing externally, you tell the object to perform the computation."
    },
    {
      q: "What is a common downside of applying LoD too aggressively?",
      options: [
        "Increased runtime performance overhead",
        "Violation of the Open/Closed Principle",
        "Wrapper bloat -- many thin delegation methods that add indirection without encapsulating decisions",
        "Inability to use dependency injection"
      ],
      answerIndex: 2,
      explanation: "Blindly wrapping every access creates 'middle man' classes full of pass-through methods. These add indirection and maintenance cost without hiding any real design decision."
    },
    {
      q: "In testing, what symptom typically indicates an LoD violation?",
      options: [
        "Tests require too many assertions",
        "Tests need deep chains of mocks (mock returning a mock returning a mock)",
        "Tests run slowly due to I/O",
        "Tests have too many setup parameters"
      ],
      answerIndex: 1,
      explanation: "When you need `when(mockA.getB()).thenReturn(mockB); when(mockB.getC()).thenReturn(mockC);` just to test a single method, it is a strong signal that the production code violates LoD by reaching through multiple objects."
    }
  ],

  exercises: [
    "Take a class in your codebase that has a method chain of 3+ dots involving different types. Refactor it to satisfy LoD by introducing delegation methods. Track how the number of mocks in the corresponding test changes before and after.",
    "Identify a 'Middle Man' class in your project -- one that only delegates calls without adding logic. Decide whether the delegation is justified (it hides a design decision) or is wrapper bloat (pure pass-through). If it is bloat, remove the indirection.",
    "Write a ShippingCostCalculator that needs the customer's country. First write it violating LoD (`order.getCustomer().getAddress().getCountry()`), then refactor by adding `order.getShippingCountry()`. Write unit tests for both versions and compare the mock complexity.",
    "Audit a REST API response in your project. If the client parses 3+ levels deep into the JSON to get a value, design a flatter response or a dedicated endpoint that provides exactly what the client needs, satisfying LoD at the API boundary.",
    "Design a small class hierarchy (e.g., Company -> Department -> Team -> Employee) and write a method that finds the manager's email. First write it as a train wreck, then refactor using Tell-Don't-Ask. Discuss which version is easier to extend when the hierarchy changes."
  ],

  flashcards: [
    {
      front: "What are the four categories of objects a method may call methods on under LoD?",
      back: "(1) The object itself (this/self), (2) the method's parameters, (3) objects created within the method, (4) the object's direct instance variables/fields."
    },
    {
      front: "What is a 'train wreck' in LoD?",
      back: "A chain of method calls like a.getB().getC().getD() where each call returns a different type, coupling the caller to the entire object graph rather than just its immediate collaborator."
    },
    {
      front: "Why are fluent builders exempt from LoD?",
      back: "Each method in a fluent builder returns `this` (or the same builder type), so the caller communicates with one logical object throughout the chain -- no strangers are involved."
    },
    {
      front: "What is the 'Tell, Don't Ask' refactoring for LoD?",
      back: "Instead of pulling data out of nested objects to make a decision externally, push the behavior into the object that owns the data. This eliminates object-graph navigation and keeps decisions close to the data they depend on."
    },
    {
      front: "What is 'wrapper bloat' and how does it relate to LoD?",
      back: "Wrapper bloat occurs when LoD is applied too aggressively, creating many delegation methods that are pure pass-throughs with no conditional logic. These add indirection without encapsulating any design decision."
    },
    {
      front: "How does LoD improve testability?",
      back: "By limiting a method's collaborators to direct dependencies, LoD reduces the number of mocks needed in unit tests. Instead of chaining mock.getX().getY().getZ(), you mock a single collaborator with one stub."
    },
    {
      front: "How does LoD relate to encapsulation?",
      back: "LoD enforces encapsulation at the behavioral level: it prevents external code from depending on an object's internal structure. If callers cannot navigate through your fields, your internal representation is truly hidden."
    },
    {
      front: "When is it acceptable to violate LoD?",
      back: "When chaining stays within a single abstraction (fluent APIs, stream pipelines), when working with pure data structures/DTOs with no behavior, or in data-oriented designs where the structure IS the interface (DataFrames, ECS)."
    }
  ],

  revisionNotes: [
    "LoD (1987, Ian Holland, Demeter project): a method should only invoke methods on this, its parameters, objects it creates, and its direct fields -- never on objects returned by those calls.",
    "Train wrecks like `a.getB().getC().getD()` couple the caller to B, C, and D transitively. Refactor with 'Tell, Don't Ask' by pushing behavior into the object that owns the data.",
    "Fluent builders, Java Streams, and LINQ pipelines are NOT LoD violations because they chain on the same abstraction, not across different domain objects.",
    "LoD violations inflate test complexity: each link in the chain requires a separate mock. After refactoring, test setup shrinks to one mock per direct collaborator.",
    "Over-applying LoD creates wrapper bloat (Middle Man smell). Only delegate when the method hides a real decision; pure pass-through methods are code smell.",
    "LoD at the API level means: don't make clients parse deeply nested JSON responses. Provide flat, purpose-specific endpoints or response shapes.",
    "In DDD, the Aggregate Root pattern enforces LoD structurally: external code can only interact with the root, never with internal entities directly.",
    "Metrics for LoD compliance: efferent coupling (Ce), fan-out, CBO (Coupling Between Objects). Tools: SonarQube, PMD, NDepend."
  ],

  cheatSheet: [
    "A method M on object O may call methods on: O itself, M's parameters, objects M creates, O's direct fields. Everything else is a stranger.",
    "Count the dots: if `a.b().c().d()` involves 3 different types, it is likely an LoD violation.",
    "Refactoring recipe: (1) identify what the caller truly needs, (2) add a method on the nearest collaborator that provides it, (3) replace the chain with one call.",
    "Fluent APIs (return this), Streams, LINQ: exempt -- same abstraction throughout.",
    "DTOs / data classes with no behavior: LoD is less relevant because there is no encapsulation to protect.",
    "Deep mock chains in tests (`when(a.getB()).thenReturn(mockB)`) are the #1 symptom of LoD violations.",
    "Wrapper bloat antidote: only delegate if the method encapsulates a decision. Pure pass-through = Middle Man smell.",
    "In DDD: Aggregate Root = structural LoD enforcement. External code talks only to the root."
  ],

  resources: [
    {
      label: "The Paperboy, The Wallet, and The Law of Demeter (David Bock)",
      kind: "article",
      note: "Classic article with the Paperboy analogy: the paperboy should not reach into the customer's pocket for the wallet. One of the best intuitive explanations of LoD."
    },
    {
      label: "Clean Code by Robert C. Martin, Chapter 6: Objects and Data Structures",
      kind: "book",
      note: "Covers the distinction between objects (hide data, expose behavior) and data structures (expose data, no behavior), and when LoD applies to each."
    },
    {
      label: "Pragmatic Programmer by Hunt and Thomas -- 'Don't Talk to Strangers'",
      kind: "book",
      note: "Section on minimizing coupling through LoD, with practical refactoring advice and the 'don't talk to strangers' mnemonic."
    },
    {
      label: "Original Demeter Project Page (Northeastern University)",
      kind: "docs",
      note: "The academic origin of the Law of Demeter with formal definitions, research papers, and the Demeter/Java tools for automated enforcement."
    },
    {
      label: "Refactoring: Improving the Design of Existing Code by Martin Fowler",
      kind: "book",
      note: "Describes the 'Middle Man' and 'Message Chains' code smells, which are the over-application and under-application of LoD respectively."
    }
  ],

  glossary: [
    {
      term: "Law of Demeter (LoD)",
      definition: "A design guideline stating that a method should only call methods on its immediate collaborators -- itself, its parameters, objects it creates, and its own fields -- to minimize coupling."
    },
    {
      term: "Train Wreck",
      definition: "A chain of method calls on successively returned objects (e.g., a.getB().getC().getD()) that violates LoD by coupling the caller to the entire traversal path."
    },
    {
      term: "Tell, Don't Ask",
      definition: "A principle urging developers to tell objects to perform actions rather than extracting their data to compute externally. The primary refactoring pattern for LoD violations."
    },
    {
      term: "Wrapper Bloat / Middle Man",
      definition: "An anti-pattern where excessive delegation methods are added to satisfy LoD, but each method is a pure pass-through that adds indirection without encapsulating any decision."
    },
    {
      term: "Fluent Interface",
      definition: "An API design where each method returns the same object (or type), enabling chained calls that read like a sentence. Exempt from LoD because no strangers are involved."
    },
    {
      term: "Efferent Coupling (Ce)",
      definition: "The number of types a class depends on. LoD violations inflate Ce because the class transitively depends on types it reaches through intermediaries."
    },
    {
      term: "Principle of Least Knowledge",
      definition: "An alternate name for the Law of Demeter, emphasizing that each module should have minimal knowledge of the structure of other modules."
    },
    {
      term: "Aggregate Root (DDD)",
      definition: "In Domain-Driven Design, the single entry point to a cluster of domain objects. External code interacts only with the root, which structurally enforces LoD for the aggregate's internals."
    }
  ]
};
