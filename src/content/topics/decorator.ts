import type { TopicContent } from "../types";

export const decorator: TopicContent = {
  quickSummary: [
    "Decorator attaches additional responsibilities to an object dynamically by wrapping it in another object that has the same interface -- an alternative to subclassing for extending behavior.",
    "Decorators can be stacked: each wrapper adds one concern and delegates to the next, creating a chain of composable behaviors (e.g., BufferedInputStream wrapping FileInputStream).",
    "The pattern embodies composition over inheritance: instead of creating exponential subclass combinations (BufferedCompressedEncryptedStream), you compose independent decorators at runtime.",
  ],
  detailed: [
    "The pattern has four participants: Component (the interface defining operations), ConcreteComponent (the base object being decorated), Decorator (abstract class implementing Component and holding a reference to another Component), and ConcreteDecorator (adds specific behavior before/after delegating to the wrapped component).",
    "Java's I/O streams are the canonical example: InputStream is the Component, FileInputStream is the ConcreteComponent, FilterInputStream is the abstract Decorator, and BufferedInputStream, DataInputStream, GZIPInputStream are ConcreteDecorators. You compose them: new BufferedInputStream(new GZIPInputStream(new FileInputStream(path))).",
    "Decorators preserve the component's interface. The client cannot tell whether it is working with the original component or a decorated version (they are type-compatible). This is the key difference from Adapter, which changes the interface.",
    "Each decorator should add exactly one responsibility (Single Responsibility Principle). Logging, caching, authentication, compression, and encryption are all independent cross-cutting concerns that map naturally to separate decorators.",
    "Language-level decorators in Python (@decorator) and TypeScript (experimentalDecorators or TC39 Stage 3 decorators) are syntactic features that modify classes or methods at definition time. They are related in spirit but differ from the GoF Decorator pattern, which wraps objects at runtime to add behavior via composition.",
  ],
  deepDive: [
    "The decorator chain forms a linked list of wrappers. When a method is called on the outermost decorator, each decorator performs its added behavior (before and/or after) and delegates to the next component in the chain. The order of wrapping matters: encrypting then compressing differs from compressing then encrypting.",
    "A common pitfall is identity comparison: if code checks obj instanceof ConcreteComponent, a decorated object will fail the check (it is an instance of Decorator, not ConcreteComponent). Design for interface-based checking, not concrete type checking. This is why the Component should be an interface or abstract class.",
    "In functional programming, decorators correspond to higher-order functions: a function that takes a function and returns a new function with added behavior. Middleware in Express.js and Python's @functools.wraps are functional analogs of the Decorator pattern.",
    "Performance consideration: deep decorator chains add indirection. Each wrapper adds a method call and an object allocation. For hot paths, the overhead is real (Java's I/O stream performance has been criticized for this). Profile before over-decorating performance-sensitive code.",
  ],
  code: [
    {
      language: "java",
      caption: "Decorator pattern: composable data source with encryption and compression",
      source: `// Component interface
public interface DataSource {
    void writeData(String data);
    String readData();
}

// ConcreteComponent
public class FileDataSource implements DataSource {
    private final String filename;

    public FileDataSource(String filename) {
        this.filename = filename;
    }

    @Override
    public void writeData(String data) {
        // Write to file
        try (var writer = new FileWriter(filename)) {
            writer.write(data);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public String readData() {
        try {
            return Files.readString(Path.of(filename));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}

// Base Decorator
public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrappee;

    protected DataSourceDecorator(DataSource source) {
        this.wrappee = source;
    }

    @Override
    public void writeData(String data) {
        wrappee.writeData(data);
    }

    @Override
    public String readData() {
        return wrappee.readData();
    }
}

// ConcreteDecorator: Encryption
public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) {
        super(source);
    }

    @Override
    public void writeData(String data) {
        String encrypted = encrypt(data);
        super.writeData(encrypted);
    }

    @Override
    public String readData() {
        String data = super.readData();
        return decrypt(data);
    }

    private String encrypt(String data) {
        return Base64.getEncoder().encodeToString(data.getBytes());
    }

    private String decrypt(String data) {
        return new String(Base64.getDecoder().decode(data));
    }
}

// ConcreteDecorator: Compression
public class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource source) {
        super(source);
    }

    @Override
    public void writeData(String data) {
        String compressed = compress(data);
        super.writeData(compressed);
    }

    @Override
    public String readData() {
        String data = super.readData();
        return decompress(data);
    }

    private String compress(String data) {
        // Simplified -- real implementation would use GZIPOutputStream
        return "COMPRESSED:" + data;
    }

    private String decompress(String data) {
        return data.replace("COMPRESSED:", "");
    }
}

// Usage -- compose decorators at runtime
DataSource source = new FileDataSource("data.txt");
// Stack decorators: file -> compression -> encryption
DataSource decorated = new EncryptionDecorator(
    new CompressionDecorator(source)
);
decorated.writeData("Sensitive user data");
String result = decorated.readData(); // Decrypts, then decompresses`,
    },
    {
      language: "typescript",
      caption: "TypeScript decorator pattern for an HTTP client with logging and retry",
      source: `// Component interface
interface HttpClient {
  request(url: string, options?: RequestInit): Promise<Response>;
}

// ConcreteComponent
class FetchClient implements HttpClient {
  async request(url: string, options?: RequestInit): Promise<Response> {
    return fetch(url, options);
  }
}

// ConcreteDecorator: Logging
class LoggingHttpClient implements HttpClient {
  constructor(private readonly inner: HttpClient) {}

  async request(url: string, options?: RequestInit): Promise<Response> {
    const start = performance.now();
    console.log(\`[HTTP] \${options?.method ?? "GET"} \${url}\`);

    try {
      const response = await this.inner.request(url, options);
      const duration = (performance.now() - start).toFixed(1);
      console.log(\`[HTTP] \${response.status} in \${duration}ms\`);
      return response;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(1);
      console.error(\`[HTTP] FAILED after \${duration}ms:\`, error);
      throw error;
    }
  }
}

// ConcreteDecorator: Retry with exponential backoff
class RetryHttpClient implements HttpClient {
  constructor(
    private readonly inner: HttpClient,
    private readonly maxRetries: number = 3,
    private readonly baseDelayMs: number = 1000
  ) {}

  async request(url: string, options?: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.inner.request(url, options);
        if (response.status >= 500 && attempt < this.maxRetries) {
          throw new Error(\`Server error: \${response.status}\`);
        }
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          const delay = this.baseDelayMs * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }
}

// ConcreteDecorator: Auth header injection
class AuthHttpClient implements HttpClient {
  constructor(
    private readonly inner: HttpClient,
    private readonly getToken: () => string
  ) {}

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Authorization", \`Bearer \${this.getToken()}\`);
    return this.inner.request(url, { ...options, headers });
  }
}

// Compose decorators -- order matters
const client: HttpClient = new LoggingHttpClient(
  new RetryHttpClient(
    new AuthHttpClient(
      new FetchClient(),
      () => "token-abc-123"
    ),
    3,
    500
  )
);

// Every request is now: logged -> retried on failure -> auth token added -> fetched
await client.request("https://api.example.com/data");`,
    },
    {
      language: "cpp",
      caption: "C++ higher-order function wrappers vs GoF Decorator pattern",
      source: `#include <iostream>
#include <functional>
#include <chrono>
#include <string>
#include <memory>
#include <stdexcept>
#include <map>

// --- Higher-order function wrappers (analogous to Python @decorator) ---
// Wraps a callable to measure execution time.

template <typename Func>
auto timing(Func func) {
    return [func](auto&&... args) {
        auto start = std::chrono::steady_clock::now();
        auto result = func(std::forward<decltype(args)>(args)...);
        auto elapsed = std::chrono::steady_clock::now() - start;
        auto ms = std::chrono::duration<double>(elapsed).count();
        std::cout << "Call took " << ms << "s\\n";
        return result;
    };
}

// Wraps a callable with retry logic.
template <typename Func>
auto retry(Func func, int maxAttempts = 3) {
    return [func, maxAttempts](auto&&... args) {
        for (int attempt = 0; attempt < maxAttempts; ++attempt) {
            try {
                return func(std::forward<decltype(args)>(args)...);
            } catch (const std::exception& e) {
                if (attempt == maxAttempts - 1) throw;
                std::cout << "Retry " << (attempt + 1) << "/"
                          << maxAttempts << " after: " << e.what() << "\\n";
            }
        }
        throw std::runtime_error("unreachable");
    };
}

// Compose wrappers: timing(retry(fetchData))
std::map<std::string, std::string> fetchDataImpl(const std::string& url) {
    std::cout << "Fetching " << url << "\\n";
    return {{"status", "ok"}};
}

// --- GoF Decorator pattern (runtime object wrapping) ---

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void send(const std::string& message) = 0;
};

class EmailNotifier : public Notifier {
public:
    void send(const std::string& message) override {
        std::cout << "Email: " << message << "\\n";
    }
};

class NotifierDecorator : public Notifier {
protected:
    std::unique_ptr<Notifier> wrapped_;
public:
    explicit NotifierDecorator(std::unique_ptr<Notifier> wrapped)
        : wrapped_(std::move(wrapped)) {}
    void send(const std::string& message) override {
        wrapped_->send(message);
    }
};

class SlackDecorator : public NotifierDecorator {
public:
    using NotifierDecorator::NotifierDecorator;
    void send(const std::string& message) override {
        NotifierDecorator::send(message);
        std::cout << "Slack: " << message << "\\n";
    }
};

class SmsDecorator : public NotifierDecorator {
public:
    using NotifierDecorator::NotifierDecorator;
    void send(const std::string& message) override {
        NotifierDecorator::send(message);
        std::cout << "SMS: " << message << "\\n";
    }
};

int main() {
    // Higher-order function wrapper composition
    auto fetchData = timing(retry(fetchDataImpl, 3));
    auto result = fetchData("https://example.com/data");

    // GoF Decorator: compose at runtime based on preferences
    bool userWantsSlack = true, userWantsSms = true;

    std::unique_ptr<Notifier> notifier = std::make_unique<EmailNotifier>();
    if (userWantsSlack)
        notifier = std::make_unique<SlackDecorator>(std::move(notifier));
    if (userWantsSms)
        notifier = std::make_unique<SmsDecorator>(std::move(notifier));
    notifier->send("Server is down!");
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Decorator Pattern Class Structure",
      kind: "architecture",
      caption: "Component interface at the top. ConcreteComponent and abstract Decorator both implement it. Decorator holds a Component reference. ConcreteDecorators extend Decorator and add specific behavior.",
      mermaid: `graph TD
    I["Component Interface"]
    CC["ConcreteComponent"]
    D["Decorator - abstract - wraps Component"]
    CD1["ConcreteDecoratorA - adds behavior A"]
    CD2["ConcreteDecoratorB - adds behavior B"]
    I --> CC
    I --> D
    D --> CD1
    D --> CD2
    D -->|holds reference| I`,
    },
    {
      title: "Decorator Chain Execution",
      kind: "sequence",
      caption: "Client calls the outermost decorator. Each decorator adds its behavior and delegates to the next wrapper until the ConcreteComponent handles the base operation.",
      mermaid: `sequenceDiagram
    participant Client
    participant EncDec as EncryptionDecorator
    participant CompDec as CompressionDecorator
    participant Base as FileDataSource
    Client->>EncDec: writeData
    EncDec->>EncDec: encrypt data
    EncDec->>CompDec: writeData with encrypted data
    CompDec->>CompDec: compress data
    CompDec->>Base: writeData with compressed+encrypted data
    Base->>Base: write to file
    Base-->>CompDec: done
    CompDec-->>EncDec: done
    EncDec-->>Client: done`,
    },
    {
      title: "Decorator vs Inheritance Combinatorial Explosion",
      kind: "flow",
      caption: "With inheritance, n independent features require up to 2^n subclasses. With decorators, only n classes are needed and they compose freely at runtime.",
      mermaid: `flowchart TD
    A[Need: DataSource with optional Encrypt and Compress] --> B{Approach?}
    B -->|Inheritance| C[PlainDataSource]
    B -->|Inheritance| D[EncryptedDataSource]
    B -->|Inheritance| E[CompressedDataSource]
    B -->|Inheritance| F[EncryptedCompressedDataSource]
    C --> X1[4 classes for 2 features]
    B -->|Decorator| G[DataSource interface]
    G --> H[FileDataSource base]
    G --> I[EncryptionDecorator]
    G --> J[CompressionDecorator]
    I --> K[Compose at runtime - any order]
    J --> K`,
    },
    {
      title: "Decorator Pattern Variations",
      kind: "mindmap",
      caption: "Decorator appears across many contexts: GoF structural pattern, language annotations, and middleware chains all share the core wrapping concept.",
      mermaid: `mindmap
  root[Decorator Concept]
    GoF Structural Pattern
      Runtime object wrapping
      Stackable composition
      Java IO Streams
      Web framework middleware
    Language Decorators
      Python at-syntax
      TypeScript at-syntax
      Applied at definition time
      Metadata and transformation
    Middleware Chains
      Express middleware
      Koa onion model
      Django middleware
      List-based dynamic composition`,
    },
  ],
  animations: [
    {
      title: "Method call through a decorator chain",
      steps: [
        {
          label: "Client calls the outermost decorator",
          detail: "The client calls writeData('hello') on what it thinks is a DataSource. It is actually the EncryptionDecorator (the outermost wrapper).",
        },
        {
          label: "EncryptionDecorator adds its behavior",
          detail: "The EncryptionDecorator encrypts the data ('hello' -> 'aGVsbG8=') and calls writeData on its wrapped component.",
        },
        {
          label: "CompressionDecorator adds its behavior",
          detail: "The CompressionDecorator compresses the already-encrypted data and delegates to its wrapped component.",
        },
        {
          label: "ConcreteComponent performs the base operation",
          detail: "The FileDataSource (ConcreteComponent) writes the compressed-and-encrypted data to disk. The decorators have transparently added two layers of processing.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Decorator (GoF Pattern)", "Inheritance", "Python/TS @decorator", "Proxy"],
    rows: [
      ["When applied", "Runtime (object wrapping)", "Compile time", "Definition time (class/method load)", "Runtime"],
      ["What it modifies", "Object behavior", "Class behavior", "Function/class definition", "Object access"],
      ["Composability", "Stackable, any order", "Class explosion for combinations", "Stackable", "Typically single wrapper"],
      ["Interface", "Preserves the component interface", "Extends/overrides parent", "Same function signature", "Same interface as subject"],
      ["Primary intent", "Add responsibilities", "Specialize behavior", "Modify/wrap functions", "Control access"],
      ["Transparency", "Client unaware of wrapping", "Client may depend on subclass", "Caller unaware", "Client unaware of indirection"],
    ],
  },
  interviewQA: [
    {
      q: "How does the Decorator pattern differ from inheritance for extending behavior?",
      a: "Inheritance is static (fixed at compile time) and creates a class for each combination of features, leading to class explosion. Decorator is dynamic (applied at runtime) and composable: you can mix and match independent decorators without creating a new class for each combination. With 4 independent features, inheritance needs up to 16 subclasses; decorators need only 4 classes.",
      followUps: [
        "What is class explosion? Give a concrete example.",
        "When is inheritance still the better choice?",
        "How does 'composition over inheritance' relate to this?",
      ],
    },
    {
      q: "How does Decorator differ from Proxy?",
      a: "Both wrap an object with the same interface, but their intent differs. Decorator adds new behavior or responsibilities (enhancement). Proxy controls access to the object (protection, caching, lazy loading, remote access). A proxy typically has a fixed relationship with its subject, while decorators are stackable.",
      followUps: [
        "Can a single class act as both a Decorator and a Proxy?",
        "How do you decide between Decorator and Proxy for caching?",
      ],
    },
    {
      q: "Explain Java I/O streams as an example of the Decorator pattern.",
      a: "InputStream is the Component interface. FileInputStream, ByteArrayInputStream are ConcreteComponents. FilterInputStream is the abstract Decorator base. BufferedInputStream adds buffering, DataInputStream adds typed reading, GZIPInputStream adds decompression -- each is a ConcreteDecorator. You compose them: new BufferedInputStream(new GZIPInputStream(new FileInputStream('file.gz'))). Each wrapper adds one concern.",
      followUps: [
        "What are the drawbacks of this design in Java I/O?",
        "Why do beginners find Java I/O confusing?",
        "How does NIO differ in approach?",
      ],
    },
    {
      q: "How do Python's @decorator and TypeScript's decorator features relate to the GoF Decorator pattern?",
      a: "They share the concept of wrapping to add behavior, but differ in mechanism. GoF Decorator wraps objects at runtime using composition. Python @decorator and TS decorator annotations modify functions or classes at definition time using higher-order functions or metadata. GoF is about runtime object composition; language decorators are about compile/load-time function/class transformation.",
      followUps: [
        "Can you implement the GoF pattern using Python's @ syntax?",
        "What are TC39 Stage 3 decorators in JavaScript?",
      ],
    },
    {
      q: "What are the drawbacks of the Decorator pattern?",
      a: "Identity comparison breaks (decorated object is not instanceof ConcreteComponent). Deep chains add method-call overhead. Debugging is harder because the call stack passes through multiple wrapper layers. Order of wrapping can produce subtle bugs. The large number of small wrapper classes can confuse newcomers to the codebase.",
      followUps: [
        "How do you mitigate the debugging difficulty?",
        "When does decorator overhead matter in practice?",
      ],
    },
    {
      q: "How would you implement a decorator that can be dynamically added and removed at runtime?",
      a: "Use a list-based approach: instead of nesting wrappers, maintain an ordered list of decorator functions or behavior objects. When processing a request, iterate through the list, applying each decorator's logic in sequence. This makes adding and removing decorators O(1) list operations. Middleware chains in web frameworks (Express, Koa) use this approach.",
      followUps: [
        "How does Express middleware relate to Decorator?",
        "What is the Chain of Responsibility pattern, and how does it compare?",
      ],
    },
  ],
  followUps: [
    "How does the Decorator pattern relate to the Chain of Responsibility pattern?",
    "How do middleware stacks in web frameworks (Express, Django) relate to the Decorator pattern?",
    "How would you implement a decorator that works with async/await operations?",
    "What is the relationship between Decorator and Aspect-Oriented Programming (AOP)?",
    "How do you handle decorator ordering when the order of operations matters?",
  ],
  mcqs: [
    {
      q: "What is the primary advantage of Decorator over inheritance for extending behavior?",
      options: [
        "Decorator is faster at runtime",
        "Decorators can be composed dynamically at runtime without class explosion",
        "Decorators do not require interfaces",
        "Decorator enforces stronger type safety",
      ],
      answerIndex: 1,
      explanation:
        "Decorator allows mixing and matching behaviors at runtime by stacking wrappers. With inheritance, each combination of features requires a separate subclass, leading to class explosion.",
    },
    {
      q: "Which of the following is NOT a valid example of the Decorator pattern?",
      options: [
        "BufferedInputStream wrapping FileInputStream",
        "A logging wrapper around an HTTP client",
        "Arrays.asList() wrapping an array as a List",
        "A compression wrapper around a data source",
      ],
      answerIndex: 2,
      explanation:
        "Arrays.asList() is an Adapter (converts array interface to List interface). The others are Decorators (they preserve the same interface and add behavior).",
    },
    {
      q: "In the Decorator pattern, what does the abstract Decorator class do?",
      options: [
        "It implements all the business logic",
        "It holds a reference to a Component and delegates calls to it by default",
        "It prevents subclassing of the ConcreteComponent",
        "It manages the lifecycle of the component",
      ],
      answerIndex: 1,
      explanation:
        "The abstract Decorator implements the Component interface and holds a reference to another Component. By default, it delegates all calls to the wrapped component. Concrete decorators override specific methods to add behavior.",
    },
    {
      q: "What problem arises from using instanceof with decorated objects?",
      options: [
        "The decorated object throws a ClassCastException",
        "The instanceof check against ConcreteComponent returns false for a decorated object",
        "The decorator loses its reference to the wrapped object",
        "The decorator cannot access the component's methods",
      ],
      answerIndex: 1,
      explanation:
        "A decorated object is an instance of the Decorator class, not the ConcreteComponent. Code that checks instanceof ConcreteComponent will fail to recognize a decorated object, which is why you should program against interfaces.",
    },
    {
      q: "How does Python's @decorator differ from the GoF Decorator pattern?",
      options: [
        "Python @decorator wraps functions at definition time; GoF Decorator wraps objects at runtime",
        "Python @decorator only works with classes; GoF works with any object",
        "They are identical in mechanism and intent",
        "Python @decorator cannot be stacked; GoF Decorator can",
      ],
      answerIndex: 0,
      explanation:
        "Python's @decorator syntax applies a higher-order function to a function/class at definition time. The GoF Decorator pattern wraps objects at runtime using composition. Both add behavior via wrapping, but at different times and granularities.",
    },
  ],
  exercises: [
    "Implement a text processing pipeline using the Decorator pattern: start with a PlainTextProcessor (Component), then create decorators for UpperCaseDecorator, TrimDecorator, and CensorDecorator (replaces banned words with ****). Demonstrate stacking them in different orders and verify the output changes based on order.",
    "Build a Logger decorator chain in TypeScript: start with a ConsoleLogger (writes to console), then add TimestampDecorator (prefixes log with timestamp), JsonFormatterDecorator (formats as JSON), and FilterDecorator (only logs messages above a given severity). Compose and test different combinations.",
    "Create both a GoF Decorator and a Python @decorator version of a caching solution. The GoF version should wrap a DataFetcher object; the @decorator version should wrap a fetch function. Compare the two approaches in terms of flexibility, composability, and testing.",
    "Implement an HTTP middleware chain using the Decorator pattern: each decorator adds one concern (authentication, rate limiting, CORS headers, request logging). Write the chain so decorators can be added or removed via configuration.",
  ],
  flashcards: [
    {
      front: "What is the Decorator pattern?",
      back: "A structural pattern that attaches additional responsibilities to an object dynamically by wrapping it in a decorator that implements the same interface. An alternative to subclassing.",
    },
    {
      front: "What are the four participants in the Decorator pattern?",
      back: "Component (interface), ConcreteComponent (base object), Decorator (abstract wrapper holding a Component reference), and ConcreteDecorator (adds specific behavior).",
    },
    {
      front: "Why is Decorator preferred over inheritance for extending behavior?",
      back: "Inheritance is static and leads to class explosion (2^n subclasses for n features). Decorator is dynamic, composable at runtime, and each decorator adds exactly one concern.",
    },
    {
      front: "What is the canonical example of Decorator in Java?",
      back: "Java I/O streams: InputStream is the Component, FileInputStream is ConcreteComponent, FilterInputStream is the abstract Decorator, and BufferedInputStream/GZIPInputStream are ConcreteDecorators.",
    },
    {
      front: "Decorator vs Proxy: key difference?",
      back: "Same mechanism (wrapping), different intent. Decorator adds behavior (enhancement). Proxy controls access (lazy loading, security, caching). Decorators are typically stackable; proxies typically are not.",
    },
    {
      front: "GoF Decorator vs Python @decorator?",
      back: "GoF wraps objects at runtime via composition. Python @decorator wraps functions/classes at definition time via higher-order functions. Both add behavior via wrapping but at different times.",
    },
  ],
  revisionNotes: [
    "Decorator = wrap an object in another with the same interface to add behavior. Composition over inheritance.",
    "Stacking: decorators form a chain. Each adds one concern and delegates to the next. Order matters.",
    "Canonical example: Java I/O streams (BufferedInputStream wrapping GZIPInputStream wrapping FileInputStream).",
    "Identity pitfall: decorated objects fail instanceof checks against ConcreteComponent. Use interface-based checks.",
    "Python/TS @decorators are syntactic features that modify at definition time. GoF Decorator wraps at runtime. Related in spirit, different in mechanism.",
    "Decorator adds behavior (enhancement). Proxy controls access. Adapter changes the interface. Know the distinctions.",
  ],
  cheatSheet: [
    "Decorator implements the same interface as the component it wraps.",
    "Abstract Decorator: holds Component reference, delegates by default. Concrete Decorators override to add behavior.",
    "Stack decorators: new D1(new D2(new D3(component))) -- outermost is called first.",
    "One decorator = one responsibility (SRP). Logging, caching, auth are separate decorators.",
    "Avoid instanceof checks on decorated objects -- program against the interface.",
    "Functional equivalent: higher-order functions that wrap a function with added behavior.",
    "Middleware chains (Express, Django) are decorator chains where each middleware wraps the next handler.",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "The original Decorator pattern description with the Motivation section using a TextView/ScrollDecorator example.",
    },
    {
      label: "Head First Design Patterns, 2nd Edition",
      kind: "book",
      note: "Uses a coffee shop example (Beverage + condiment decorators) to build intuition for stacking decorators.",
    },
    {
      label: "Refactoring Guru - Decorator Pattern", url: "https://refactoring.guru/",
      kind: "article",
      note: "Visual guide with UML, code in multiple languages, and comparisons with Proxy and Adapter.",
    },
    {
      label: "TC39 Decorators Proposal (Stage 3)",
      kind: "docs",
      note: "The JavaScript/TypeScript decorator specification for class and method decorators -- distinct from but inspired by the GoF pattern.",
    },
  ],
  glossary: [
    {
      term: "Decorator",
      definition: "A structural pattern that wraps an object in another with the same interface to dynamically add behavior.",
    },
    {
      term: "Component",
      definition: "The interface defining the operations that can be decorated.",
    },
    {
      term: "ConcreteComponent",
      definition: "The base object that is being wrapped by decorators.",
    },
    {
      term: "Composition over inheritance",
      definition: "A design principle favoring assembling behavior by composing objects (HAS-A) rather than inheriting from base classes (IS-A).",
    },
    {
      term: "Class explosion",
      definition: "The exponential growth in subclass count when trying to represent all combinations of independent features through inheritance.",
    },
    {
      term: "FilterInputStream",
      definition: "Java's abstract decorator class for InputStream, providing the base for decorators like BufferedInputStream and DataInputStream.",
    },
    {
      term: "Higher-order function",
      definition: "A function that takes a function as input and/or returns a function, serving as the functional equivalent of the Decorator pattern.",
    },
  ],
};
