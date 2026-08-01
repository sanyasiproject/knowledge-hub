import type { TopicContent } from "../types";

export const adapter: TopicContent = {
  quickSummary: [
    "Adapter converts the interface of an existing class into another interface that clients expect, allowing incompatible classes to work together.",
    "There are two variants: class adapter (uses inheritance to extend the adaptee) and object adapter (uses composition by wrapping the adaptee). Object adapter is preferred because it is more flexible and avoids tight coupling.",
    "Adapter is commonly used for legacy system integration, third-party library wrapping, and bridging between different API conventions without modifying existing code.",
  ],
  detailed: [
    "The Adapter pattern has three key participants: the Target (the interface the client expects), the Adaptee (the existing class with an incompatible interface), and the Adapter (the class that bridges between them by implementing the Target interface and delegating to the Adaptee).",
    "Object Adapter uses composition: the adapter holds a reference to the adaptee and delegates calls by translating the target interface methods into adaptee method calls. This allows adapting multiple adaptees or adaptee subclasses without creating parallel class hierarchies.",
    "Class Adapter uses multiple inheritance (or in Java, extending the adaptee and implementing the target interface). The adapter IS-A adaptee and IS-A target. This is less flexible because you can only adapt one specific adaptee class, and in languages without multiple inheritance you must use the single extends slot for the adaptee.",
    "A two-way adapter implements both the target and adaptee interfaces, allowing it to be used wherever either type is expected. This is useful when two subsystems each expect the other's interface, enabling bidirectional compatibility.",
    "Adapter differs from related patterns: Facade simplifies a complex subsystem into a single interface (many-to-one), while Adapter maps one interface to another (one-to-one). Bridge separates abstraction from implementation so they can vary independently, while Adapter makes existing incompatible classes work together after the fact.",
  ],
  deepDive: [
    "Adapter is a reactive pattern -- it is applied after the fact when two interfaces do not match. Bridge is a proactive pattern -- it is designed up front to separate abstraction from implementation. If you are designing from scratch, prefer Bridge. If you are integrating existing code, use Adapter.",
    "In real-world systems, adapters are everywhere: JDBC drivers adapt database-specific wire protocols to the standard JDBC interface. Java's Arrays.asList() adapts an array to the List interface. In JavaScript, polyfills are adapters that make modern APIs work on old browsers by mapping the new interface to older primitives.",
    "When wrapping third-party libraries, the Adapter pattern creates an anti-corruption layer that isolates your domain from the library's API. If the library changes its API in a new version, only the adapter needs to change -- the rest of your codebase remains stable. This is especially important in hexagonal architecture where adapters sit at the boundary between the domain and external systems.",
    "Testing adapters is straightforward: you test that the adapter correctly translates calls from the target interface to the adaptee. Mock the adaptee and verify the adapter passes the right arguments and transforms results correctly. This isolation is one of the key benefits of the pattern.",
  ],
  code: [
    {
      language: "java",
      caption: "Object Adapter: adapting a legacy payment system to a modern interface",
      source: `// Target interface -- what our application expects
public interface PaymentGateway {
    PaymentResult charge(String customerId, BigDecimal amount, String currency);
    PaymentResult refund(String transactionId);
    boolean isAvailable();
}

// Adaptee -- legacy system with incompatible interface
public class LegacyPaymentSystem {
    public int processPayment(String account, double amountInCents, int currencyCode) {
        System.out.println("Legacy: processing " + amountInCents + " cents");
        return 200; // status code
    }

    public int reverseTransaction(int legacyTxId) {
        System.out.println("Legacy: reversing tx " + legacyTxId);
        return 200;
    }

    public String healthCheck() {
        return "OK";
    }
}

// Adapter -- bridges the gap using composition (object adapter)
public class LegacyPaymentAdapter implements PaymentGateway {
    private final LegacyPaymentSystem legacy;
    private final Map<String, Integer> currencyCodeMap;

    public LegacyPaymentAdapter(LegacyPaymentSystem legacy) {
        this.legacy = legacy;
        this.currencyCodeMap = Map.of("USD", 840, "EUR", 978, "GBP", 826);
    }

    @Override
    public PaymentResult charge(String customerId, BigDecimal amount, String currency) {
        // Translate: BigDecimal dollars -> double cents
        double amountInCents = amount.multiply(BigDecimal.valueOf(100)).doubleValue();
        // Translate: currency string -> legacy currency code
        int currencyCode = currencyCodeMap.getOrDefault(currency, 840);

        int status = legacy.processPayment(customerId, amountInCents, currencyCode);

        return new PaymentResult(
            status == 200,
            status == 200 ? "TX-" + System.currentTimeMillis() : null,
            status == 200 ? "Success" : "Failed with code " + status
        );
    }

    @Override
    public PaymentResult refund(String transactionId) {
        // Translate: string transaction ID -> legacy integer ID
        int legacyId = Integer.parseInt(transactionId.replace("TX-", ""));
        int status = legacy.reverseTransaction(legacyId);
        return new PaymentResult(status == 200, transactionId, "Refund " + (status == 200 ? "OK" : "failed"));
    }

    @Override
    public boolean isAvailable() {
        return "OK".equals(legacy.healthCheck());
    }
}

// Client code -- works with PaymentGateway, unaware of legacy system
PaymentGateway gateway = new LegacyPaymentAdapter(new LegacyPaymentSystem());
PaymentResult result = gateway.charge("cust-123", new BigDecimal("49.99"), "USD");`,
    },
    {
      language: "typescript",
      caption: "Adapter wrapping a third-party analytics library",
      source: `// Target interface -- our application's analytics contract
interface AnalyticsTracker {
  trackPageView(page: string, metadata?: Record<string, string>): void;
  trackEvent(category: string, action: string, label?: string, value?: number): void;
  identifyUser(userId: string, traits: Record<string, unknown>): void;
}

// Adaptee -- third-party library with different API
class ThirdPartyAnalytics {
  init(apiKey: string): void {
    console.log("Third-party SDK initialized");
  }

  send(eventType: string, payload: Record<string, unknown>): void {
    console.log(\`[3rd-party] \${eventType}:\`, payload);
  }

  setUserProperties(props: Record<string, unknown>): void {
    console.log("[3rd-party] User props:", props);
  }
}

// Adapter -- translates our interface to the third-party API
class AnalyticsAdapter implements AnalyticsTracker {
  private readonly sdk: ThirdPartyAnalytics;

  constructor(apiKey: string) {
    this.sdk = new ThirdPartyAnalytics();
    this.sdk.init(apiKey);
  }

  trackPageView(page: string, metadata?: Record<string, string>): void {
    this.sdk.send("page_view", {
      url: page,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    this.sdk.send("custom_event", {
      event_category: category,
      event_action: action,
      event_label: label ?? "",
      event_value: value ?? 0,
    });
  }

  identifyUser(userId: string, traits: Record<string, unknown>): void {
    this.sdk.setUserProperties({ user_id: userId, ...traits });
  }
}

// Client code -- programs against AnalyticsTracker, easily swappable
const tracker: AnalyticsTracker = new AnalyticsAdapter("key-abc-123");
tracker.trackPageView("/dashboard", { referrer: "/login" });
tracker.trackEvent("button", "click", "submit-form", 1);
tracker.identifyUser("user-42", { plan: "pro", signupDate: "2024-01-15" });`,
    },
    {
      language: "cpp",
      caption: "C++ adapter using abstract base class for XML-to-JSON data source",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <variant>
#include <memory>

using Record = std::map<std::string, std::variant<int, std::string>>;

// Target interface: what the application expects (pure virtual)
class JsonDataSource {
public:
    virtual ~JsonDataSource() = default;
    virtual std::vector<Record> read_data() = 0;
};


// Concrete target: native JSON source
class ModernJsonApi : public JsonDataSource {
    std::string url_;
public:
    explicit ModernJsonApi(std::string url) : url_(std::move(url)) {}

    std::vector<Record> read_data() override {
        // Simulated JSON response
        return {
            {{"id", 1}, {"name", std::string("Alice")}},
            {{"id", 2}, {"name", std::string("Bob")}}
        };
    }
};


// Adaptee: returns XML, not JSON
class LegacyXmlService {
public:
    std::string fetch_xml() const {
        return "<records>"
               "<record><id>1</id><name>Alice</name></record>"
               "<record><id>2</id><name>Bob</name></record>"
               "</records>";
    }
};


// Adapter: wraps the XML service and exposes the JSON interface
class XmlToJsonAdapter : public JsonDataSource {
    LegacyXmlService xml_service_;

    // Minimal XML tag-content extractor
    static std::string extract_tag(const std::string& xml,
                                   const std::string& tag) {
        auto open  = "<" + tag + ">";
        auto close = "</" + tag + ">";
        auto start = xml.find(open);
        if (start == std::string::npos) return "";
        start += open.size();
        auto end = xml.find(close, start);
        return xml.substr(start, end - start);
    }

    static bool is_digits(const std::string& s) {
        return !s.empty() &&
               s.find_first_not_of("0123456789") == std::string::npos;
    }

public:
    explicit XmlToJsonAdapter(LegacyXmlService svc)
        : xml_service_(std::move(svc)) {}

    std::vector<Record> read_data() override {
        auto xml = xml_service_.fetch_xml();
        std::vector<Record> results;

        std::string tag = "<record>";
        std::string close_tag = "</record>";
        std::string::size_type pos = 0;

        while ((pos = xml.find(tag, pos)) != std::string::npos) {
            auto end = xml.find(close_tag, pos);
            auto block = xml.substr(pos + tag.size(),
                                    end - pos - tag.size());
            Record row;
            auto id_val   = extract_tag(block, "id");
            auto name_val = extract_tag(block, "name");

            // Convert numeric strings to ints
            if (is_digits(id_val))
                row["id"] = std::stoi(id_val);
            else
                row["id"] = id_val;

            row["name"] = name_val;
            results.push_back(row);
            pos = end + close_tag.size();
        }
        return results;
    }
};


// Helper to print a variant value
std::ostream& operator<<(std::ostream& os,
                          const std::variant<int, std::string>& v) {
    std::visit([&os](auto&& val) { os << val; }, v);
    return os;
}

// Client code -- works with any JsonDataSource
void process_records(JsonDataSource& source) {
    for (const auto& record : source.read_data()) {
        std::cout << "Processing: { ";
        for (const auto& [key, val] : record)
            std::cout << key << ": " << val << " ";
        std::cout << "}\\n";
    }
}


int main() {
    // Seamlessly use either source
    ModernJsonApi api("https://api.example.com/users");
    process_records(api);

    LegacyXmlService legacy;
    XmlToJsonAdapter adapter(std::move(legacy));
    process_records(adapter);
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Adapter Pattern Structure",
      kind: "architecture",
      caption: "Object Adapter uses composition (HAS-A adaptee); the client only sees the Target interface and never touches the Adaptee directly.",
      mermaid: `flowchart LR
    CLIENT["Client"]
    TARGET["Target Interface"]
    ADAPTER["Adapter"]
    ADAPTEE["Adaptee"]
    CLIENT -- "uses" --> TARGET
    TARGET -- "implemented by" --> ADAPTER
    ADAPTER -- "delegates to" --> ADAPTEE`,
    },
    {
      title: "Adapter Call Flow",
      kind: "sequence",
      caption: "The client calls the Target interface; the Adapter translates and delegates the call to the Adaptee's incompatible API.",
      mermaid: `sequenceDiagram
    participant CL as Client
    participant AD as Adapter
    participant AE as Adaptee
    CL->>AD: request()
    AD->>AE: specificRequest()
    AE-->>AD: raw result
    AD-->>CL: translated result`,
    },
    {
      title: "Adapter in Hexagonal Architecture",
      kind: "flow",
      caption: "Adapters implement inbound and outbound ports, isolating domain logic from infrastructure and external systems.",
      mermaid: `flowchart TD
    UI["UI Adapter"]
    REST["REST Adapter"]
    PORT_IN["Inbound Port"]
    DOMAIN["Domain Logic"]
    PORT_OUT["Outbound Port"]
    DB_AD["DB Adapter"]
    EXT_AD["External API Adapter"]
    UI --> PORT_IN
    REST --> PORT_IN
    PORT_IN --> DOMAIN
    DOMAIN --> PORT_OUT
    PORT_OUT --> DB_AD
    PORT_OUT --> EXT_AD`,
    },
    {
      title: "Adapter Variants",
      kind: "mindmap",
      caption: "The main flavours of the Adapter pattern and the contexts in which each is typically applied.",
      mermaid: `mindmap
  root["Adapter Pattern"]
    Object Adapter
      Composition
      Runtime flexibility
    Class Adapter
      Multiple inheritance
      Compile-time binding
    Two-Way Adapter
      Both interfaces exposed
    Pluggable Adapter
      Abstract hook methods
      Framework integration`,
    },
  ],
  animations: [
    {
      title: "Adapter call delegation flow",
      steps: [
        {
          label: "Client calls target interface method",
          detail: "The client invokes a method on the Target interface (e.g., charge(customerId, amount, currency)).",
        },
        {
          label: "Adapter receives the call",
          detail: "The Adapter class implements the Target interface and receives the call with the client's expected parameter types.",
        },
        {
          label: "Adapter translates parameters",
          detail: "The Adapter converts the parameters to match the Adaptee's expectations (e.g., dollars to cents, currency string to code number).",
        },
        {
          label: "Adapter delegates to Adaptee",
          detail: "The Adapter calls the Adaptee's method with the translated parameters (e.g., legacy.processPayment(account, centsAmount, currencyCode)).",
        },
        {
          label: "Adapter translates the result",
          detail: "The Adapter converts the Adaptee's return value back to the Target's expected format and returns it to the client.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Adapter", "Facade", "Bridge", "Decorator"],
    rows: [
      ["Intent", "Make incompatible interfaces work together", "Simplify a complex subsystem interface", "Separate abstraction from implementation", "Add behavior dynamically"],
      ["Relationship", "One-to-one interface mapping", "Many-to-one simplification", "Abstraction to implementation decoupling", "Same interface, enhanced behavior"],
      ["When applied", "After the fact (reactive)", "After the fact (reactive)", "Up front (proactive design)", "Any time"],
      ["Number of wrapped objects", "One adaptee", "Multiple subsystem objects", "One implementation", "One component"],
      ["Interface change", "Changes the interface", "Simplifies the interface", "Splits into two hierarchies", "Preserves the interface"],
      ["Typical use case", "Legacy integration, library wrapping", "API gateway, SDK facade", "Platform-independent abstractions", "I/O streams, middleware"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Adapter and Facade?",
      a: "Adapter maps one interface to another so two incompatible classes can work together -- it is a one-to-one transformation. Facade provides a simplified interface to a complex subsystem with many classes -- it is a many-to-one simplification. Adapter enables compatibility; Facade reduces complexity.",
      followUps: [
        "Can a Facade also act as an Adapter?",
        "Give an example where you would use Facade but not Adapter.",
        "Can you combine Adapter and Facade in a single class?",
      ],
    },
    {
      q: "What is the difference between class adapter and object adapter?",
      a: "Class adapter uses inheritance: it extends the adaptee and implements the target interface, gaining direct access to the adaptee's protected members. Object adapter uses composition: it holds a reference to the adaptee and delegates calls. Object adapter is preferred because it can adapt multiple adaptee subclasses, works with interfaces, and avoids the rigidity of inheritance.",
      followUps: [
        "Why is class adapter problematic in Java specifically?",
        "When might you prefer a class adapter?",
      ],
    },
    {
      q: "How does the Adapter pattern relate to hexagonal architecture?",
      a: "In hexagonal architecture (ports and adapters), the domain defines ports (interfaces) for external interactions. Adapters implement these ports to connect to specific external systems (databases, APIs, message queues). The adapter translates between the domain's language and the external system's API, forming an anti-corruption layer.",
      followUps: [
        "What is an anti-corruption layer?",
        "How does this help with testing?",
        "Can a single port have multiple adapters?",
      ],
    },
    {
      q: "How does the Adapter pattern differ from the Bridge pattern?",
      a: "Adapter is a reactive fix: you have two existing incompatible interfaces and need to make them work together. Bridge is a proactive design: you separate an abstraction from its implementation up front so both can evolve independently. Adapter wraps an existing class; Bridge is part of the original design.",
      followUps: [
        "Can you refactor an Adapter into a Bridge?",
        "Give an example of Bridge in a real system.",
      ],
    },
    {
      q: "Give a real-world example of the Adapter pattern in a standard library.",
      a: "Java's Arrays.asList() is an adapter: it wraps a fixed-size array and presents it as a List. InputStreamReader adapts a byte-oriented InputStream to a character-oriented Reader. In Python, the csv module's DictReader adapts a file object into an iterator of dictionaries.",
      followUps: [
        "Why does Arrays.asList() throw UnsupportedOperationException on add()?",
        "What other Java I/O classes are adapters?",
      ],
    },
    {
      q: "How do you test an adapter?",
      a: "Mock or stub the adaptee, then call the adapter through the target interface. Verify that the adapter correctly translates parameters (e.g., dollars to cents) and results (e.g., status codes to domain objects). Because the adapter's sole responsibility is translation, tests are straightforward and focused.",
      followUps: [
        "Should you also write integration tests for adapters?",
        "How do you handle adaptees with side effects in tests?",
      ],
    },
  ],
  followUps: [
    "How does the Adapter pattern apply to microservices integration when services use different data formats (JSON vs Protobuf vs XML)?",
    "What is a two-way adapter, and when would you need one?",
    "How do adapters fit into the Dependency Inversion Principle?",
    "How does TypeScript's structural typing affect the need for explicit adapter classes?",
    "What are the performance implications of adding an adapter layer?",
  ],
  mcqs: [
    {
      q: "Which pattern converts one interface to another so incompatible classes can work together?",
      options: ["Bridge", "Facade", "Adapter", "Proxy"],
      answerIndex: 2,
      explanation:
        "Adapter's specific purpose is to convert one interface into another, enabling collaboration between classes that could not otherwise work together.",
    },
    {
      q: "Why is the object adapter generally preferred over the class adapter?",
      options: [
        "Object adapter is faster at runtime",
        "Object adapter uses composition, making it more flexible and not dependent on a single adaptee class",
        "Object adapter requires fewer lines of code",
        "Class adapter cannot implement interfaces",
      ],
      answerIndex: 1,
      explanation:
        "Object adapter uses composition, so it can adapt any subclass of the adaptee, works with interfaces rather than concrete classes, and avoids using the single inheritance slot.",
    },
    {
      q: "What does Java's Arrays.asList() exemplify?",
      options: ["Builder", "Factory Method", "Adapter", "Decorator"],
      answerIndex: 2,
      explanation:
        "Arrays.asList() adapts a fixed-size array to the List interface. It wraps the array and translates List method calls into array operations.",
    },
    {
      q: "What is the key difference between Adapter and Decorator?",
      options: [
        "Adapter changes the interface; Decorator preserves it and adds behavior",
        "Decorator changes the interface; Adapter preserves it",
        "Adapter adds behavior; Decorator converts interfaces",
        "They are the same pattern with different names",
      ],
      answerIndex: 0,
      explanation:
        "Adapter converts one interface to another (the interfaces differ). Decorator wraps an object with the same interface but adds or modifies behavior. The intent is different even though both use wrapping.",
    },
    {
      q: "In hexagonal architecture, what role does the Adapter play?",
      options: [
        "It defines the core business logic",
        "It connects the domain's ports (interfaces) to specific external systems",
        "It manages the application's lifecycle",
        "It routes HTTP requests to controllers",
      ],
      answerIndex: 1,
      explanation:
        "In hexagonal architecture, adapters sit at the boundary and translate between the domain's ports (interfaces) and the concrete external systems (databases, APIs, message queues).",
    },
  ],
  exercises: [
    "Create an adapter that wraps a third-party HTTP client library (e.g., Axios) behind your own HttpClient interface. Include methods for GET, POST, PUT, and DELETE. Then swap the adapter to wrap a different library (e.g., native fetch) without changing any client code.",
    "Implement a two-way adapter between a Celsius temperature sensor API and a Fahrenheit-based monitoring system. The adapter should work in both directions: the monitoring system can read Celsius data as Fahrenheit, and the sensor can receive Fahrenheit thresholds as Celsius.",
    "Build an anti-corruption layer using Adapter for integrating with a legacy SOAP service. Define a clean domain interface (e.g., CustomerRepository), and implement an adapter that translates to/from the SOAP service's XML-based API. Write unit tests that mock the SOAP client.",
  ],
  flashcards: [
    {
      front: "What is the Adapter pattern?",
      back: "A structural pattern that converts the interface of an existing class into another interface clients expect, allowing incompatible classes to collaborate.",
    },
    {
      front: "Object Adapter vs Class Adapter?",
      back: "Object Adapter uses composition (wraps the adaptee). Class Adapter uses inheritance (extends the adaptee). Object adapter is preferred for its flexibility.",
    },
    {
      front: "Adapter vs Facade?",
      back: "Adapter converts one interface to another (1:1 mapping). Facade simplifies a complex subsystem behind a single interface (many:1 simplification).",
    },
    {
      front: "Adapter vs Bridge?",
      back: "Adapter is reactive -- applied after the fact to fix incompatibility. Bridge is proactive -- designed up front to separate abstraction from implementation.",
    },
    {
      front: "What is an anti-corruption layer?",
      back: "A boundary layer (often using Adapters) that prevents external system APIs from polluting your domain model. If the external API changes, only the adapter changes.",
    },
    {
      front: "What is a two-way adapter?",
      back: "An adapter that implements both the target and adaptee interfaces, allowing it to be used wherever either type is expected for bidirectional compatibility.",
    },
  ],
  revisionNotes: [
    "Adapter = interface converter. Client expects Target; Adaptee has a different interface; Adapter bridges them.",
    "Object Adapter (composition) is preferred over Class Adapter (inheritance) for flexibility.",
    "Adapter is reactive (applied to existing code); Bridge is proactive (designed upfront).",
    "Adapter changes the interface (1:1 mapping). Facade simplifies (many:1). Decorator preserves the interface and adds behavior.",
    "In hexagonal architecture, adapters connect domain ports to external infrastructure, forming anti-corruption layers.",
    "Real-world examples: JDBC drivers, Arrays.asList(), InputStreamReader, API client wrappers.",
  ],
  cheatSheet: [
    "Adapter implements Target interface, wraps Adaptee via composition.",
    "Adapter translates Target method calls into Adaptee method calls (parameter + result conversion).",
    "Use Adapter when you cannot modify the Adaptee's source code.",
    "Prefer Object Adapter (composition) over Class Adapter (inheritance).",
    "Anti-corruption layer: isolate your domain from external API changes with adapters.",
    "Test adapters by mocking the adaptee and verifying parameter/result translation.",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "Original Adapter pattern description with class adapter and object adapter variants.",
    },
    {
      label: "Refactoring Guru - Adapter Pattern",
      kind: "article",
      note: "Visual UML diagrams and code examples in multiple languages, with comparisons to related patterns.",
    },
    {
      label: "Implementing Domain-Driven Design by Vaughn Vernon",
      kind: "book",
      note: "Covers anti-corruption layers and adapters in the context of bounded contexts and hexagonal architecture.",
    },
    {
      label: "Hexagonal Architecture - Alistair Cockburn",
      kind: "article",
      note: "The original description of ports and adapters architecture where the Adapter pattern plays a central structural role.",
    },
  ],
  glossary: [
    {
      term: "Adapter",
      definition: "A structural pattern that converts one interface into another, enabling collaboration between incompatible classes.",
    },
    {
      term: "Target",
      definition: "The interface that the client expects and programs against.",
    },
    {
      term: "Adaptee",
      definition: "The existing class with an incompatible interface that needs to be adapted.",
    },
    {
      term: "Object Adapter",
      definition: "An adapter implementation that uses composition (holds a reference to the adaptee) rather than inheritance.",
    },
    {
      term: "Class Adapter",
      definition: "An adapter implementation that uses multiple inheritance to extend the adaptee while implementing the target interface.",
    },
    {
      term: "Anti-corruption Layer",
      definition: "A boundary of adapters that prevents an external system's API from leaking into and corrupting the domain model.",
    },
    {
      term: "Two-way Adapter",
      definition: "An adapter that implements both the target and adaptee interfaces, enabling bidirectional compatibility.",
    },
  ],
};
