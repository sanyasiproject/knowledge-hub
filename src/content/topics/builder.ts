import type { TopicContent } from "../types";

export const builder: TopicContent = {
  quickSummary: [
    "Builder separates the construction of a complex object from its representation, allowing the same construction process to create different representations.",
    "It solves the telescoping constructor problem -- when a class has many optional parameters, Builder provides a readable, step-by-step API instead of a constructor with dozens of parameters.",
    "The fluent Builder variant returns 'this' from each setter method, enabling method chaining: new UserBuilder().name('Alice').email('a@b.com').age(30).build().",
  ],
  detailed: [
    "The classic GoF Builder has four participants: Builder (interface defining construction steps), ConcreteBuilder (implements the steps and tracks the product being built), Director (orchestrates the build steps in a specific order), and Product (the complex object being constructed).",
    "In modern practice (especially after Effective Java), the Director is often omitted. The client calls builder methods directly in any order, and the build() method finalizes and returns the product. This is the fluent builder or 'Effective Java Builder' style.",
    "Builder is ideal for immutable objects: the builder accumulates mutable state, and the build() method constructs an immutable product by passing all values to a private constructor. This gives you the readability of setters with the safety of immutability.",
    "The telescoping constructor anti-pattern occurs when you create multiple constructors with increasing numbers of parameters: User(name), User(name, email), User(name, email, age), etc. Each new optional field doubles the constructors needed. Builder eliminates this entirely.",
    "Builder differs from Factory in intent: Factory decides which class to instantiate; Builder decides how to construct a complex instance of a known class. Factory is about type selection; Builder is about configuration.",
  ],
  deepDive: [
    "The Director in the GoF pattern encapsulates a specific construction sequence. For example, a DocumentDirector might have buildReport() and buildLetter() methods that call the same builder steps in different orders. This is useful when you have multiple standard configurations and want to reuse them across different concrete builders.",
    "A type-safe builder can enforce required fields at compile time using the Step Builder pattern (also called Staged Builder). Each step returns a different interface that only exposes the next required method, ensuring the caller cannot skip mandatory fields. In TypeScript, this is achieved with discriminated return types.",
    "Builder combined with the Prototype pattern allows you to create a builder pre-filled with values from an existing object (a copy builder). This is useful for creating modified copies of immutable objects: existing.toBuilder().email('new@email.com').build().",
    "In Java, Lombok's @Builder annotation generates the entire builder pattern as boilerplate, including the builder class, setter methods, and build() method. This has made Builder the default approach for any class with more than a few fields in many Java codebases.",
  ],
  code: [
    {
      language: "java",
      caption: "Effective Java-style Builder for an immutable HttpRequest class",
      source: `public final class HttpRequest {
    private final String method;
    private final String url;
    private final Map<String, String> headers;
    private final String body;
    private final int timeoutMs;
    private final boolean followRedirects;

    private HttpRequest(Builder builder) {
        this.method = builder.method;
        this.url = builder.url;
        this.headers = Collections.unmodifiableMap(new HashMap<>(builder.headers));
        this.body = builder.body;
        this.timeoutMs = builder.timeoutMs;
        this.followRedirects = builder.followRedirects;
    }

    // Getters only -- no setters, immutable
    public String getMethod() { return method; }
    public String getUrl() { return url; }
    public Map<String, String> getHeaders() { return headers; }
    public String getBody() { return body; }
    public int getTimeoutMs() { return timeoutMs; }
    public boolean isFollowRedirects() { return followRedirects; }

    public static class Builder {
        // Required parameters
        private final String method;
        private final String url;

        // Optional parameters with defaults
        private Map<String, String> headers = new HashMap<>();
        private String body = null;
        private int timeoutMs = 30_000;
        private boolean followRedirects = true;

        public Builder(String method, String url) {
            this.method = Objects.requireNonNull(method);
            this.url = Objects.requireNonNull(url);
        }

        public Builder header(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public Builder timeoutMs(int timeoutMs) {
            if (timeoutMs <= 0) throw new IllegalArgumentException("Timeout must be positive");
            this.timeoutMs = timeoutMs;
            return this;
        }

        public Builder followRedirects(boolean follow) {
            this.followRedirects = follow;
            return this;
        }

        public HttpRequest build() {
            // Validation before construction
            if (("POST".equals(method) || "PUT".equals(method)) && body == null) {
                throw new IllegalStateException(method + " requests should have a body");
            }
            return new HttpRequest(this);
        }
    }
}

// Usage -- readable, self-documenting
HttpRequest request = new HttpRequest.Builder("POST", "https://api.example.com/users")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .body("{\\"name\\": \\"Alice\\"}")
    .timeoutMs(5000)
    .followRedirects(false)
    .build();`,
    },
    {
      language: "typescript",
      caption: "TypeScript Builder with compile-time required field enforcement",
      source: `// The product -- immutable after construction
interface QueryConfig {
  readonly table: string;
  readonly columns: readonly string[];
  readonly where: string | null;
  readonly orderBy: string | null;
  readonly limit: number | null;
  readonly offset: number;
}

// Builder class
class QueryBuilder {
  private table: string = "";
  private columns: string[] = ["*"];
  private whereClause: string | null = null;
  private orderByClause: string | null = null;
  private limitValue: number | null = null;
  private offsetValue: number = 0;

  from(table: string): this {
    this.table = table;
    return this;
  }

  select(...columns: string[]): this {
    this.columns = columns;
    return this;
  }

  where(clause: string): this {
    this.whereClause = clause;
    return this;
  }

  orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByClause = \`\${column} \${direction}\`;
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  build(): QueryConfig {
    if (!this.table) {
      throw new Error("Table name is required");
    }
    return Object.freeze({
      table: this.table,
      columns: Object.freeze([...this.columns]),
      where: this.whereClause,
      orderBy: this.orderByClause,
      limit: this.limitValue,
      offset: this.offsetValue,
    });
  }

  toSQL(): string {
    const config = this.build();
    let sql = \`SELECT \${config.columns.join(", ")} FROM \${config.table}\`;
    if (config.where) sql += \` WHERE \${config.where}\`;
    if (config.orderBy) sql += \` ORDER BY \${config.orderBy}\`;
    if (config.limit !== null) sql += \` LIMIT \${config.limit}\`;
    if (config.offset > 0) sql += \` OFFSET \${config.offset}\`;
    return sql;
  }
}

// Usage
const query = new QueryBuilder()
  .from("users")
  .select("id", "name", "email")
  .where("active = true")
  .orderBy("name", "ASC")
  .limit(20)
  .offset(40)
  .toSQL();
// => SELECT id, name, email FROM users WHERE active = true ORDER BY name ASC LIMIT 20 OFFSET 40`,
    },
    {
      language: "cpp",
      caption: "C++ Builder using fluent API for an immutable EmailMessage",
      source: `#include <string>
#include <vector>
#include <stdexcept>

// Immutable email message -- constructed via Builder
class EmailMessage {
public:
    const std::string& sender() const { return sender_; }
    const std::vector<std::string>& recipients() const { return recipients_; }
    const std::string& subject() const { return subject_; }
    const std::string& body() const { return body_; }
    const std::vector<std::string>& cc() const { return cc_; }
    const std::vector<std::string>& bcc() const { return bcc_; }
    const std::vector<std::string>& attachments() const { return attachments_; }
    bool is_html() const { return is_html_; }
    const std::string& priority() const { return priority_; }

    class Builder {
    public:
        explicit Builder(std::string sender) : sender_(std::move(sender)) {}

        Builder& to(const std::string& recipient) {
            recipients_.push_back(recipient);
            return *this;
        }
        Builder& subject(std::string s) { subject_ = std::move(s); return *this; }
        Builder& body(std::string b) { body_ = std::move(b); return *this; }
        Builder& html_body(std::string html) {
            body_ = std::move(html);
            is_html_ = true;
            return *this;
        }
        Builder& cc(const std::string& addr) { cc_.push_back(addr); return *this; }
        Builder& bcc(const std::string& addr) { bcc_.push_back(addr); return *this; }
        Builder& attach(const std::string& path) {
            attachments_.push_back(path);
            return *this;
        }
        Builder& priority(std::string level) {
            if (level != "low" && level != "normal" && level != "high")
                throw std::invalid_argument("Invalid priority: " + level);
            priority_ = std::move(level);
            return *this;
        }

        EmailMessage build() const {
            if (recipients_.empty())
                throw std::invalid_argument("At least one recipient is required");
            if (subject_.empty())
                throw std::invalid_argument("Subject is required");
            return EmailMessage(sender_, recipients_, subject_, body_,
                                cc_, bcc_, attachments_, is_html_, priority_);
        }

    private:
        std::string sender_;
        std::vector<std::string> recipients_;
        std::string subject_;
        std::string body_;
        std::vector<std::string> cc_;
        std::vector<std::string> bcc_;
        std::vector<std::string> attachments_;
        bool is_html_ = false;
        std::string priority_ = "normal";
    };

private:
    EmailMessage(std::string sender, std::vector<std::string> recipients,
                 std::string subject, std::string body,
                 std::vector<std::string> cc, std::vector<std::string> bcc,
                 std::vector<std::string> attachments, bool is_html,
                 std::string priority)
        : sender_(std::move(sender)), recipients_(std::move(recipients)),
          subject_(std::move(subject)), body_(std::move(body)),
          cc_(std::move(cc)), bcc_(std::move(bcc)),
          attachments_(std::move(attachments)), is_html_(is_html),
          priority_(std::move(priority)) {}

    std::string sender_;
    std::vector<std::string> recipients_;
    std::string subject_;
    std::string body_;
    std::vector<std::string> cc_;
    std::vector<std::string> bcc_;
    std::vector<std::string> attachments_;
    bool is_html_;
    std::string priority_;
};

// Usage
// auto email = EmailMessage::Builder("noreply@example.com")
//     .to("alice@example.com")
//     .to("bob@example.com")
//     .subject("Weekly Report")
//     .html_body("<h1>Report</h1><p>All systems operational.</p>")
//     .cc("manager@example.com")
//     .attach("/reports/weekly.pdf")
//     .priority("high")
//     .build();`,
    },
  ],
  diagrams: [
    {
      title: "GoF Builder Pattern Structure",
      kind: "architecture",
      caption: "Director orchestrates a Builder interface; ConcreteBuilder assembles the Product step by step.",
      mermaid: `graph TD
    Director["Director\norchestrates construction order"]
    Builder["Builder interface\nbuildPartA, buildPartB, getResult"]
    ConcreteBuilder["ConcreteBuilder\nimplements each build step"]
    Product["Product\nfinished complex object"]
    Director --> Builder
    Builder --> ConcreteBuilder
    ConcreteBuilder --> Product`,
    },
    {
      title: "Fluent Builder Method Chain",
      kind: "flow",
      caption: "Each setter returns 'this', enabling chained calls that terminate with build(), which validates and constructs the immutable object.",
      mermaid: `flowchart LR
    A([new Builder]) --> B["setHost(host)\nreturns this"]
    B --> C["setPort(port)\nreturns this"]
    C --> D["setTls(true)\nreturns this"]
    D --> E["setRetries(3)\nreturns this"]
    E --> F{build()}
    F -->|valid| G([Immutable Config])
    F -->|invalid| H([throws IllegalStateException])`,
    },
    {
      title: "Builder vs Constructor vs Factory",
      kind: "sequence",
      caption: "How a caller interacts with a telescoping constructor, a factory method, and a fluent builder for the same complex object.",
      mermaid: `sequenceDiagram
    participant Caller
    participant TelescopingCtor
    participant Factory
    participant FluentBuilder
    Caller->>TelescopingCtor: new Config(host, port, null, null, true, 3)
    TelescopingCtor-->>Caller: Config - fragile, hard to read
    Caller->>Factory: ConfigFactory.createTls(host, port)
    Factory-->>Caller: Config preset - limited flexibility
    Caller->>FluentBuilder: new Builder().host(h).port(p).tls(true).build()
    FluentBuilder-->>Caller: Config - readable, validated, immutable`,
    },
    {
      title: "Builder Construction State",
      kind: "state",
      caption: "Internal states a fluent builder object moves through from creation to a validated final product.",
      mermaid: `stateDiagram-v2
    [*] --> Empty : new Builder
    Empty --> PartiallyConfigured : set required field
    PartiallyConfigured --> PartiallyConfigured : set optional fields
    PartiallyConfigured --> Validated : build() called - all required fields present
    PartiallyConfigured --> Error : build() called - missing required field
    Validated --> [*] : returns Product
    Error --> [*] : throws exception`,
    },
  ],
  animations: [
    {
      title: "Step-by-step Builder construction",
      steps: [
        {
          label: "Create the Builder",
          detail: "The client instantiates a Builder, optionally passing required parameters to its constructor.",
        },
        {
          label: "Set optional fields via fluent methods",
          detail: "Each method stores a value in the builder's mutable state and returns 'this' for chaining. Methods can be called in any order.",
        },
        {
          label: "Call build()",
          detail: "The build() method validates all accumulated state (checking required fields, cross-field constraints) and throws if invalid.",
        },
        {
          label: "Product is constructed",
          detail: "The builder passes its state to the product's private constructor, creating an immutable instance. The builder can be reused or discarded.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Builder", "Telescoping Constructors", "JavaBean Setters", "Factory"],
    rows: [
      ["Readability", "High -- named methods", "Low -- positional args", "Medium -- named setters", "N/A (different purpose)"],
      ["Immutability", "Yes -- build() returns immutable object", "Yes -- set in constructor", "No -- setters imply mutability", "Depends on product"],
      ["Validation", "In build() before construction", "In constructor", "No single validation point", "In factory method"],
      ["Required fields", "Enforced in constructor or build()", "Enforced by compiler", "Easy to forget", "Enforced by factory"],
      ["Number of classes", "Product + Builder", "Product only", "Product only", "Product + Factory hierarchy"],
      ["Thread safety", "Builder is not shared -- no issue", "Constructor is atomic", "Not thread-safe without synchronization", "Factory method is typically stateless"],
    ],
  },
  interviewQA: [
    {
      q: "What problem does the Builder pattern solve?",
      a: "Builder solves the telescoping constructor problem: when a class has many optional parameters, constructors become unreadable and error-prone (which argument is which?). Builder provides named setter methods and a single build() call, making construction self-documenting and allowing validation before the object is created.",
      followUps: [
        "Can you show the telescoping constructor problem with an example?",
        "How does Builder compare to using a Map of parameters?",
        "When is a constructor sufficient and Builder is overkill?",
      ],
    },
    {
      q: "What is the Director in the Builder pattern, and is it always needed?",
      a: "The Director is a class that defines a specific sequence of builder calls to produce a particular configuration of the product. For example, a Director might have buildSportsCar() and buildSUV() methods that call the same CarBuilder methods in different orders with different values. In modern usage, the Director is often omitted -- the client drives the builder directly.",
      followUps: [
        "When is a Director valuable?",
        "Can a Director work with different concrete builders?",
      ],
    },
    {
      q: "How does Builder help with immutability?",
      a: "The builder object is mutable and accumulates state through setter methods. When build() is called, it passes all the accumulated values to the product's private constructor, which stores them in final fields. The resulting product is fully immutable, but the construction process was flexible and readable.",
      followUps: [
        "How would you create a modified copy of an immutable object built with Builder?",
        "What is the toBuilder() method pattern?",
      ],
    },
    {
      q: "How does the Builder pattern differ from the Factory pattern?",
      a: "Builder and Factory solve different problems. Factory decides which class to instantiate (type selection). Builder decides how to configure an instance of a known class (step-by-step construction). A factory call is typically one step; a builder involves multiple configuration steps before build().",
      followUps: [
        "Can a Factory return a Builder instead of a finished product?",
        "When would you combine Builder and Factory?",
      ],
    },
    {
      q: "What is the Step Builder (Staged Builder) pattern?",
      a: "Step Builder enforces a specific ordering and completeness of builder calls at compile time. Each method returns a different interface that exposes only the valid next step. For example: builder.from('users') returns a SelectStep which has select(), which returns a BuildStep which has build(). This prevents invalid states like calling build() without setting required fields.",
      followUps: [
        "How do you implement a Step Builder in TypeScript?",
        "What are the trade-offs compared to runtime validation in build()?",
      ],
    },
    {
      q: "Give real-world examples of the Builder pattern in popular libraries.",
      a: "StringBuilder in Java builds strings incrementally without allocating intermediate String objects. HttpRequest.Builder in Java 11 builds HTTP requests with method, URI, headers, and body. Retrofit's Request.Builder, OkHttp's Request.Builder, Protocol Buffers' message builders, and Lombok's @Builder annotation are all prominent examples.",
      followUps: [
        "How does StringBuilder differ from the GoF Builder?",
        "How does Lombok's @Builder work under the hood?",
      ],
    },
  ],
  followUps: [
    "How does the Builder pattern work with inheritance -- can a subclass extend a parent's builder?",
    "What is the relationship between Builder and the Fluent Interface pattern?",
    "How do you implement a thread-safe Builder for use in concurrent environments?",
    "How does Kotlin's named parameters and default arguments reduce the need for Builder?",
    "What is the Builder pattern's relationship to the Prototype pattern for creating copies?",
  ],
  mcqs: [
    {
      q: "What problem does the Builder pattern primarily solve?",
      options: [
        "Creating objects from multiple possible classes",
        "Constructing complex objects with many optional parameters",
        "Ensuring only one instance of a class exists",
        "Adding new behavior to objects dynamically",
      ],
      answerIndex: 1,
      explanation:
        "Builder's primary purpose is constructing complex objects step by step, especially when there are many optional parameters that would make constructors unwieldy (the telescoping constructor problem).",
    },
    {
      q: "In the Effective Java-style Builder, what does the build() method typically do?",
      options: [
        "Returns the builder itself for further chaining",
        "Validates accumulated state and returns an immutable product",
        "Resets the builder to its initial state",
        "Serializes the object to JSON",
      ],
      answerIndex: 1,
      explanation:
        "The build() method is the terminal operation: it validates all accumulated state, throws if invalid, and constructs the immutable product by passing the builder's state to a private constructor.",
    },
    {
      q: "What is the role of the Director in the GoF Builder pattern?",
      options: [
        "It validates the product after construction",
        "It defines a specific construction sequence using builder steps",
        "It decides which concrete builder to use",
        "It manages the builder's memory lifecycle",
      ],
      answerIndex: 1,
      explanation:
        "The Director encapsulates a specific build sequence (which methods to call and in what order) and can reuse that sequence across different concrete builders.",
    },
    {
      q: "How does Builder support immutability?",
      options: [
        "By making the builder itself immutable",
        "By using only primitive fields",
        "By accumulating mutable state in the builder, then constructing an immutable product in build()",
        "By using the final keyword on the builder class",
      ],
      answerIndex: 2,
      explanation:
        "The builder is mutable (accepting setter calls), but the final product is immutable (private constructor with final fields). This separates the flexible construction phase from the rigid product.",
    },
    {
      q: "Which of the following is NOT a real-world example of the Builder pattern?",
      options: [
        "Java's StringBuilder",
        "Java 11's HttpRequest.Builder",
        "JDBC's DriverManager.getConnection()",
        "Protocol Buffers message builders",
      ],
      answerIndex: 2,
      explanation:
        "DriverManager.getConnection() is a factory -- it selects which Connection implementation to create. StringBuilder and HttpRequest.Builder are builders that construct products step by step.",
    },
  ],
  exercises: [
    "Implement a PizzaBuilder that supports size (required), crust type, sauce, and a variable number of toppings. The build() method should validate that at least one topping is selected and return an immutable Pizza object. Write tests covering valid and invalid configurations.",
    "Create a Step Builder for a database connection config that enforces this order at compile time: host (required) -> port (optional, default 5432) -> database (required) -> credentials (optional) -> build(). Use TypeScript interfaces to ensure calling build() without host or database is a type error.",
    "Refactor an existing class with 8+ constructor parameters into a Builder pattern. Include a toBuilder() method that creates a pre-filled builder from an existing instance, enabling modified copies of immutable objects.",
    "Implement a Director class that uses the same HTMLDocumentBuilder to produce different standard pages: buildErrorPage(code, message), buildLoginPage(), and buildDashboardPage(data). Demonstrate that the Director can also work with a MarkdownDocumentBuilder.",
  ],
  flashcards: [
    {
      front: "What is the Builder pattern?",
      back: "A creational pattern that separates the construction of a complex object from its representation, allowing step-by-step construction with a fluent API and a terminal build() method.",
    },
    {
      front: "What is the telescoping constructor problem?",
      back: "When a class needs multiple constructors with increasing parameter counts to handle optional fields: User(name), User(name, email), User(name, email, age), etc. Each new optional field potentially doubles the needed constructors.",
    },
    {
      front: "What are the four participants in the GoF Builder?",
      back: "Builder (interface defining construction steps), ConcreteBuilder (implements steps), Director (orchestrates the step order), and Product (the complex object being built).",
    },
    {
      front: "How does the fluent builder achieve readability?",
      back: "Each setter method returns 'this' (the builder instance), enabling method chaining. This produces code that reads like a declaration: new Builder().name('X').email('Y').build().",
    },
    {
      front: "Builder vs Factory: when to use which?",
      back: "Use Builder when the problem is how to configure a complex object (many optional params). Use Factory when the problem is which type to create (type selection based on input).",
    },
    {
      front: "What is the toBuilder() method?",
      back: "A method on an immutable object that returns a new Builder pre-filled with the object's current values. It allows creating modified copies without manually re-specifying unchanged fields.",
    },
  ],
  revisionNotes: [
    "Builder = step-by-step construction + fluent API + terminal build() method.",
    "Solves telescoping constructors: replace multiple overloaded constructors with named builder methods.",
    "Key to immutability: builder is mutable during construction, product is immutable after build().",
    "GoF includes a Director that encapsulates construction sequences. Modern usage often omits it.",
    "build() is the validation gate -- check required fields and cross-field invariants before constructing.",
    "Step Builder (Staged Builder) enforces required fields at compile time using interface chaining.",
  ],
  cheatSheet: [
    "Builder structure: Product (immutable) + Builder (mutable, inner class) + build() (validates and constructs).",
    "Fluent API: each setter returns 'this'. Terminal call is build().",
    "Required params: pass to Builder constructor. Optional params: setter methods with defaults.",
    "Validation: check in build(), throw IllegalStateException for invalid combinations.",
    "Immutability: private Product constructor, final fields, defensive copies for collections.",
    "Copy builder: Product.toBuilder() returns pre-filled Builder for modified copies.",
    "Lombok: @Builder on a class generates the entire pattern automatically in Java.",
  ],
  resources: [
    {
      label: "Effective Java, 3rd Edition - Item 2: Consider a builder when faced with many constructor parameters",
      kind: "book",
      note: "The definitive guide to the modern Builder idiom in Java, with rationale and examples.",
    },
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "Original Builder pattern with the Director role and multiple concrete builders.",
    },
    {
      label: "Refactoring Guru - Builder Pattern", url: "https://refactoring.guru/",
      kind: "article",
      note: "Visual guide with step-by-step UML and code examples in Java, Python, TypeScript, and more.",
    },
    {
      label: "Project Lombok @Builder documentation",
      kind: "docs",
      note: "Shows how Lombok auto-generates the builder pattern, including @Singular for collection fields.",
    },
  ],
  glossary: [
    {
      term: "Builder",
      definition: "A creational pattern that constructs complex objects step by step, separating construction from representation.",
    },
    {
      term: "Fluent Interface",
      definition: "An API design where methods return 'this' to enable method chaining, commonly used in Builder implementations.",
    },
    {
      term: "Director",
      definition: "A class in the GoF Builder pattern that encapsulates a specific build sequence, calling builder methods in a predefined order.",
    },
    {
      term: "Telescoping Constructor",
      definition: "An anti-pattern where a class has many overloaded constructors with increasing parameter counts to handle optional fields.",
    },
    {
      term: "Step Builder",
      definition: "A Builder variant where each step returns a different interface, enforcing required fields and method order at compile time.",
    },
    {
      term: "build()",
      definition: "The terminal method in a Builder that validates accumulated state and constructs the final immutable product.",
    },
  ],
};
