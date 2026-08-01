import type { TopicContent } from "../types";

export const proxy: TopicContent = {
  quickSummary: [
    "Proxy provides a surrogate or placeholder for another object to control access to it -- the proxy and the real object share the same interface, so the client is unaware of the indirection.",
    "Common proxy types include virtual proxy (lazy loading), protection proxy (access control), remote proxy (represents an object in another address space), caching proxy, and logging proxy.",
    "Proxy differs from Decorator in intent: Proxy controls access to the subject, while Decorator adds behavior. Proxy often manages the lifecycle of the subject; Decorator does not.",
  ],
  detailed: [
    "The pattern has three participants: Subject (the interface shared by the real object and proxy), RealSubject (the actual object being proxied), and Proxy (holds a reference to the RealSubject, controls access, and optionally creates it lazily).",
    "Virtual Proxy defers the creation of an expensive object until it is actually needed. For example, a document editor might use image proxies that display a placeholder until the user scrolls to that image, at which point the real image is loaded from disk or network.",
    "Protection Proxy controls access to the real object based on the caller's permissions. It checks authorization before forwarding the call. For example, a proxy around a sensitive service might verify that the caller has the required role before delegating.",
    "Remote Proxy represents an object in a different address space (another process, machine, or network). Java RMI stubs, gRPC client stubs, and REST client wrappers are all remote proxies that hide the network communication from the client.",
    "Caching Proxy stores the results of expensive operations and returns cached results for repeated requests with the same parameters. It manages cache invalidation and expiration, transparent to the client.",
  ],
  deepDive: [
    "Java's dynamic proxies (java.lang.reflect.Proxy) create proxy instances at runtime for any interface. You provide an InvocationHandler that intercepts all method calls, letting you implement cross-cutting concerns (logging, transactions, security) without writing a separate proxy class for each interface. Spring AOP and Hibernate lazy loading use dynamic proxies extensively.",
    "JavaScript's Proxy object (ES2015) provides a meta-programming mechanism where you define trap handlers for fundamental operations (get, set, apply, construct, has, deleteProperty, etc.). This is more powerful than the GoF Proxy because it intercepts property access, not just method calls. Vue 3's reactivity system uses Proxy to detect state changes.",
    "The key distinction between Proxy and Decorator is lifecycle control. A Proxy typically creates, manages, or restricts access to the real subject. A Decorator receives an already-created component and adds behavior. A logging proxy controls whether the call happens; a logging decorator always forwards the call but logs it. The line can blur in practice.",
    "Smart references are a form of proxy that performs additional actions when the object is accessed: reference counting (releasing the object when no clients hold references), loading a persistent object into memory on first access, or checking that the real object is not locked before allowing modifications.",
  ],
  code: [
    {
      language: "java",
      caption: "Virtual Proxy for lazy-loading heavy images and Protection Proxy for access control",
      source: `// Subject interface
public interface Image {
    void display();
    int getWidth();
    int getHeight();
}

// RealSubject -- expensive to create
public class HighResImage implements Image {
    private final String filename;
    private final byte[] pixelData;

    public HighResImage(String filename) {
        this.filename = filename;
        System.out.println("Loading high-res image from disk: " + filename);
        // Simulate expensive I/O
        this.pixelData = loadFromDisk(filename);
    }

    @Override
    public void display() {
        System.out.println("Displaying " + filename + " (" + pixelData.length + " bytes)");
    }

    @Override public int getWidth() { return 1920; }
    @Override public int getHeight() { return 1080; }

    private byte[] loadFromDisk(String path) {
        // Simulate heavy loading
        return new byte[1024 * 1024];
    }
}

// Virtual Proxy -- defers loading until display() is called
public class ImageProxy implements Image {
    private final String filename;
    private HighResImage realImage;  // Created lazily

    public ImageProxy(String filename) {
        this.filename = filename;
        // No loading happens here -- just store the filename
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new HighResImage(filename);  // Load on first use
        }
        realImage.display();
    }

    @Override
    public int getWidth() {
        // Can return metadata without loading the full image
        return 1920;
    }

    @Override
    public int getHeight() {
        return 1080;
    }
}

// ---- Protection Proxy ----

public interface DocumentService {
    String readDocument(String docId);
    void writeDocument(String docId, String content);
    void deleteDocument(String docId);
}

public class SecureDocumentProxy implements DocumentService {
    private final DocumentService realService;
    private final String currentUserRole;

    public SecureDocumentProxy(DocumentService realService, String userRole) {
        this.realService = realService;
        this.currentUserRole = userRole;
    }

    @Override
    public String readDocument(String docId) {
        // All authenticated users can read
        return realService.readDocument(docId);
    }

    @Override
    public void writeDocument(String docId, String content) {
        if (!"EDITOR".equals(currentUserRole) && !"ADMIN".equals(currentUserRole)) {
            throw new SecurityException("Write access denied for role: " + currentUserRole);
        }
        realService.writeDocument(docId, content);
    }

    @Override
    public void deleteDocument(String docId) {
        if (!"ADMIN".equals(currentUserRole)) {
            throw new SecurityException("Delete access denied for role: " + currentUserRole);
        }
        realService.deleteDocument(docId);
    }
}

// Usage
DocumentService service = new SecureDocumentProxy(new RealDocumentService(), "VIEWER");
service.readDocument("doc-1");     // OK
service.writeDocument("doc-1", "new content");  // Throws SecurityException`,
    },
    {
      language: "typescript",
      caption: "Caching Proxy and JavaScript Proxy API for reactive state tracking",
      source: `// --- Caching Proxy ---

interface WeatherService {
  getTemperature(city: string): Promise<number>;
  getForecast(city: string, days: number): Promise<string[]>;
}

class OpenWeatherService implements WeatherService {
  async getTemperature(city: string): Promise<number> {
    console.log(\`[API] Fetching temperature for \${city}\`);
    // Simulate API call
    return 22 + Math.random() * 10;
  }

  async getForecast(city: string, days: number): Promise<string[]> {
    console.log(\`[API] Fetching \${days}-day forecast for \${city}\`);
    return Array.from({ length: days }, (_, i) => \`Day \${i + 1}: Sunny\`);
  }
}

class CachingWeatherProxy implements WeatherService {
  private cache = new Map<string, { value: unknown; expiry: number }>();

  constructor(
    private readonly service: WeatherService,
    private readonly ttlMs: number = 60_000
  ) {}

  async getTemperature(city: string): Promise<number> {
    const key = \`temp:\${city}\`;
    const cached = this.getFromCache<number>(key);
    if (cached !== undefined) return cached;

    const result = await this.service.getTemperature(city);
    this.setCache(key, result);
    return result;
  }

  async getForecast(city: string, days: number): Promise<string[]> {
    const key = \`forecast:\${city}:\${days}\`;
    const cached = this.getFromCache<string[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.service.getForecast(city, days);
    this.setCache(key, result);
    return result;
  }

  private getFromCache<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      console.log(\`[Cache] HIT for \${key}\`);
      return entry.value as T;
    }
    if (entry) this.cache.delete(key);
    return undefined;
  }

  private setCache(key: string, value: unknown): void {
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }
}

// Usage -- client is unaware of caching
const weather: WeatherService = new CachingWeatherProxy(
  new OpenWeatherService(),
  30_000
);
await weather.getTemperature("London");  // API call
await weather.getTemperature("London");  // Cache hit


// --- JavaScript Proxy API (meta-programming proxy) ---

interface UserState {
  name: string;
  email: string;
  preferences: Record<string, unknown>;
}

function createReactiveState<T extends object>(
  initial: T,
  onChange: (prop: string, oldVal: unknown, newVal: unknown) => void
): T {
  return new Proxy(initial, {
    set(target, property, value, receiver) {
      const oldValue = Reflect.get(target, property, receiver);
      if (oldValue !== value) {
        onChange(String(property), oldValue, value);
      }
      return Reflect.set(target, property, value, receiver);
    },
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      // Recursively proxy nested objects
      if (typeof value === "object" && value !== null) {
        return createReactiveState(value as object, onChange);
      }
      return value;
    },
  });
}

// Usage: state changes are automatically tracked
const state = createReactiveState<UserState>(
  { name: "Alice", email: "alice@example.com", preferences: {} },
  (prop, oldVal, newVal) => {
    console.log(\`State changed: \${prop} = \${oldVal} -> \${newVal}\`);
  }
);

state.name = "Bob";  // Logs: State changed: name = Alice -> Bob`,
    },
    {
      language: "cpp",
      caption: "C++ logging proxy and lazy-loading proxy using templates",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <chrono>
#include <thread>
#include <functional>

// RealSubject: expensive to create
class DatabaseConnection {
public:
    explicit DatabaseConnection(const std::string& connectionString) {
        std::cout << "Connecting to database: " << connectionString << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        connString_ = connectionString;
    }

    std::vector<std::map<std::string, std::string>> execute(const std::string& query) {
        std::cout << "Executing: " << query << std::endl;
        return {{{"id", "1"}, {"name", "Alice"}}};
    }

    void close() {
        std::cout << "Connection closed" << std::endl;
    }

private:
    std::string connString_;
};

// Virtual Proxy: defers connection until first query
class LazyDatabaseProxy {
public:
    explicit LazyDatabaseProxy(const std::string& connectionString)
        : connectionString_(connectionString) {}

    std::vector<std::map<std::string, std::string>> execute(const std::string& query) {
        return ensureConnected().execute(query);
    }

    void close() {
        if (realConnection_) {
            realConnection_->close();
            realConnection_.reset();
        }
    }

private:
    DatabaseConnection& ensureConnected() {
        if (!realConnection_) {
            realConnection_ = std::make_unique<DatabaseConnection>(connectionString_);
        }
        return *realConnection_;
    }

    std::string connectionString_;
    std::unique_ptr<DatabaseConnection> realConnection_;
};

// Logging Proxy: wraps a target and logs method calls via function wrappers
template <typename T>
class LoggingProxy {
public:
    LoggingProxy(std::unique_ptr<T> target, const std::string& loggerName = "proxy")
        : target_(std::move(target)), loggerName_(loggerName) {}

    template <typename Ret, typename... Args>
    Ret loggedCall(const std::string& methodName,
                   Ret (T::*method)(Args...), Args... args) {
        std::cout << "[" << loggerName_ << "] " << methodName << "(...)" << std::endl;
        auto start = std::chrono::high_resolution_clock::now();
        Ret result = (target_.get()->*method)(args...);
        auto elapsed = std::chrono::high_resolution_clock::now() - start;
        auto ms = std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count();
        std::cout << "[" << loggerName_ << "] " << methodName
                  << " completed (" << ms / 1000.0 << "ms)" << std::endl;
        return result;
    }

    T* operator->() { return target_.get(); }

private:
    std::unique_ptr<T> target_;
    std::string loggerName_;
};

// Usage: combine proxies
int main() {
    LoggingProxy<LazyDatabaseProxy> db(
        std::make_unique<LazyDatabaseProxy>("postgresql://localhost/mydb"),
        "DB"
    );

    // No connection yet -- lazy proxy defers it
    auto results = db.loggedCall(
        "execute",
        &LazyDatabaseProxy::execute,
        std::string("SELECT * FROM users")
    );

    // Output:
    // [DB] execute(...)
    // Connecting to database: postgresql://localhost/mydb
    // Executing: SELECT * FROM users
    // [DB] execute completed (100.42ms)
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Proxy Pattern Class Structure",
      kind: "architecture",
      caption: "Subject interface implemented by both RealSubject and Proxy. The Proxy holds a reference to RealSubject and controls access while presenting the same interface to clients.",
      mermaid: `graph LR
    Client[Client] --> Subject[Subject Interface\nrequest method]
    Subject --> Proxy[Proxy\nholds RealSubject ref\ncontrols access]
    Subject --> Real[RealSubject\nactual implementation]
    Proxy --> Real
    Proxy --> PreLogic[Pre-access logic\nauth check, cache hit, lazy init]
    Proxy --> PostLogic[Post-access logic\nlogging, caching result]`,
    },
    {
      title: "Proxy Types and Responsibilities",
      kind: "mindmap",
      caption: "The five main proxy types mapped to their specific responsibilities and typical use cases.",
      mermaid: `mindmap
  root((Proxy Types))
    Virtual Proxy
      Defers expensive creation
      Creates RealSubject on first use
      Heavy images
      DB connections
      Config parsers
    Protection Proxy
      Access control and RBAC
      Permission checks before forwarding
      Authentication enforcement
      Admin-only operations
    Remote Proxy
      Network transparency
      gRPC stubs
      RMI objects
      Hides marshaling complexity
    Caching Proxy
      Memoizes results
      Avoids redundant calls
      API response cache
      Query result cache
    Logging Proxy
      Audit trail
      Records method calls
      Performance metrics
      Debugging aid`,
    },
    {
      title: "Virtual Proxy Lazy Loading Sequence",
      kind: "sequence",
      caption: "How a virtual proxy defers expensive object creation until the first method call that requires the real subject.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant P as ImageProxy
    participant R as HighResImage - RealSubject
    C->>P: new ImageProxy - filename.jpg
    Note over P: Stores filename only, no loading
    C->>P: getWidth
    P-->>C: Return cached metadata - no load
    C->>P: display
    P->>P: Check: realSubject is null
    P->>R: new HighResImage - load from disk
    R-->>P: Loaded successfully
    P->>R: display
    R-->>C: Image rendered
    C->>P: display again
    P->>R: display - already loaded, no reload
    R-->>C: Image rendered instantly`,
    },
  ],
  animations: [
    {
      title: "Virtual Proxy lazy loading sequence",
      steps: [
        {
          label: "Client creates the proxy",
          detail: "The client instantiates an ImageProxy with a filename. No heavy loading occurs -- only the filename is stored. This is instant.",
        },
        {
          label: "Client calls a lightweight method",
          detail: "The client calls getWidth() on the proxy. The proxy returns cached metadata without loading the real image -- the RealSubject is still null.",
        },
        {
          label: "Client calls display()",
          detail: "The proxy checks if the RealSubject exists. It is null, so the proxy creates a new HighResImage, triggering the expensive disk I/O.",
        },
        {
          label: "Subsequent calls use the loaded object",
          detail: "The RealSubject is now cached in the proxy. All future calls to display() go directly to the loaded image with no additional loading cost.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Virtual Proxy", "Protection Proxy", "Remote Proxy", "Caching Proxy", "Decorator"],
    rows: [
      ["Primary intent", "Lazy loading", "Access control", "Network transparency", "Result memoization", "Add behavior"],
      ["Creates the subject?", "Yes (on first use)", "No (receives it)", "No (remote reference)", "No (receives it)", "No (receives it)"],
      ["Controls whether call proceeds?", "Yes (defers creation)", "Yes (may reject)", "Always forwards (over network)", "May skip (return cached)", "Always forwards"],
      ["Typical use case", "Heavy images, DB connections", "RBAC, permission checks", "RMI, gRPC stubs", "API response caching", "Logging, compression"],
      ["Stackable?", "No (one proxy per subject)", "Can layer proxies", "No (one stub per remote)", "Can combine with others", "Yes (designed for stacking)"],
      ["Lifecycle management", "Manages creation", "Does not manage", "Manages connection", "Manages cache", "Does not manage"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Proxy and Decorator?",
      a: "Both wrap an object with the same interface, but their intent differs. Proxy controls access: it decides whether, when, or how the client reaches the real object (lazy loading, access control, caching). Decorator always forwards the call but adds behavior (logging, compression, encryption). Proxy often manages the subject's lifecycle; Decorator does not.",
      followUps: [
        "Can a single class serve as both Proxy and Decorator?",
        "How would you classify a caching wrapper -- Proxy or Decorator?",
        "Does the client know it is working with a proxy?",
      ],
    },
    {
      q: "Explain the Virtual Proxy pattern with a real use case.",
      a: "A Virtual Proxy defers creation of an expensive object until it is actually needed. Example: an image gallery where each image is represented by a proxy. The proxy stores the image URL and dimensions (metadata) but does not load pixel data until display() is called. This way, scrolling through thumbnails does not load all full-resolution images into memory.",
      followUps: [
        "How does Hibernate use virtual proxies for lazy loading?",
        "What happens if the lazy-loaded object fails to load?",
        "How do you handle thread safety in a virtual proxy?",
      ],
    },
    {
      q: "How does Java's dynamic proxy mechanism work?",
      a: "java.lang.reflect.Proxy creates a proxy instance at runtime for any set of interfaces. You provide an InvocationHandler whose invoke(proxy, method, args) method intercepts every call. The JVM generates a proxy class that implements the specified interfaces and delegates to the handler. This eliminates the need to write separate proxy classes for each interface.",
      followUps: [
        "What are the limitations of Java's dynamic proxies?",
        "How does CGLIB differ from java.lang.reflect.Proxy?",
        "How does Spring AOP use dynamic proxies?",
      ],
    },
    {
      q: "How does JavaScript's Proxy object differ from the GoF Proxy pattern?",
      a: "JavaScript's Proxy (ES2015) is a meta-programming facility that intercepts fundamental object operations (property access, assignment, function calls, etc.) via trap handlers. It is more powerful than the GoF pattern because it intercepts all property access, not just predefined methods. Vue 3's reactivity system uses it to detect state changes transparently.",
      followUps: [
        "What are the performance implications of JavaScript Proxy?",
        "What traps does JavaScript Proxy support?",
        "How does Reflect relate to Proxy?",
      ],
    },
    {
      q: "What is a Remote Proxy, and where is it used?",
      a: "A Remote Proxy represents an object in a different address space (another process, machine, or service). It handles network communication, serialization, and deserialization, presenting the remote object as if it were local. Examples include Java RMI stubs, gRPC generated clients, and CORBA object references.",
      followUps: [
        "How does a gRPC client stub act as a remote proxy?",
        "What are the challenges of remote proxies (latency, failure modes)?",
        "How does the Proxy pattern relate to the Ambassador pattern in microservices?",
      ],
    },
    {
      q: "How would you implement a thread-safe caching proxy?",
      a: "Use a ConcurrentHashMap for the cache store and computeIfAbsent() for atomic cache population in Java. In TypeScript, since JS is single-threaded, a regular Map suffices, but for async operations you need to cache the Promise itself (not the resolved value) to prevent duplicate in-flight requests for the same key.",
      followUps: [
        "How do you handle cache invalidation?",
        "What is the thundering herd problem, and how does caching the Promise prevent it?",
      ],
    },
  ],
  followUps: [
    "How does the Proxy pattern relate to the Ambassador pattern in cloud-native architectures?",
    "How do ORMs like Hibernate and SQLAlchemy use proxies for lazy loading of related entities?",
    "What is the difference between a forward proxy and a reverse proxy in networking, and how do they relate to the GoF Proxy?",
    "How can you combine Proxy and Decorator patterns in the same system?",
    "How does Python's __getattr__ enable transparent proxying without implementing every method?",
  ],
  mcqs: [
    {
      q: "Which proxy type defers object creation until the object is actually needed?",
      options: ["Protection Proxy", "Remote Proxy", "Virtual Proxy", "Logging Proxy"],
      answerIndex: 2,
      explanation:
        "Virtual Proxy creates the real object lazily on first use, avoiding the cost of creating heavy objects that may never be accessed.",
    },
    {
      q: "What is the key difference between Proxy and Decorator?",
      options: [
        "Proxy uses a different interface; Decorator uses the same interface",
        "Proxy controls access to the subject; Decorator adds behavior to the subject",
        "Proxy is a creational pattern; Decorator is structural",
        "Decorator manages the subject's lifecycle; Proxy does not",
      ],
      answerIndex: 1,
      explanation:
        "Both use the same interface and wrapping mechanism, but Proxy's intent is controlling access (when, whether, how the call reaches the subject), while Decorator's intent is adding behavior (the call always reaches the component).",
    },
    {
      q: "Which Java mechanism creates proxy instances at runtime for any interface?",
      options: [
        "java.util.Proxy",
        "java.lang.reflect.Proxy with InvocationHandler",
        "javax.proxy.DynamicProxy",
        "java.lang.instrument.Proxy",
      ],
      answerIndex: 1,
      explanation:
        "java.lang.reflect.Proxy creates a dynamic proxy class at runtime that implements specified interfaces and delegates all method calls to an InvocationHandler.",
    },
    {
      q: "What does JavaScript's Proxy trap that the GoF Proxy pattern typically does not?",
      options: [
        "Method calls only",
        "Property access, assignment, deletion, and other fundamental operations",
        "Network requests",
        "Memory allocation",
      ],
      answerIndex: 1,
      explanation:
        "JavaScript's Proxy intercepts fundamental object operations (get, set, has, deleteProperty, apply, construct, etc.) via trap handlers, making it more general than the GoF pattern which focuses on method-level interception.",
    },
    {
      q: "Which is an example of a Remote Proxy?",
      options: [
        "A lazy-loaded image placeholder",
        "A gRPC generated client stub",
        "A caching wrapper around a database query",
        "A logging decorator on an HTTP client",
      ],
      answerIndex: 1,
      explanation:
        "A gRPC client stub represents a remote service object locally, handling serialization, network communication, and deserialization transparently -- the classic Remote Proxy.",
    },
    {
      q: "In a caching proxy for async operations, why should you cache the Promise rather than the resolved value?",
      options: [
        "Promises are smaller in memory",
        "It prevents multiple concurrent requests for the same key (thundering herd)",
        "Promises are faster to compare",
        "It simplifies error handling",
      ],
      answerIndex: 1,
      explanation:
        "If you cache only the resolved value, concurrent requests arriving before the first one resolves will each trigger their own request. Caching the Promise means all concurrent callers await the same in-flight operation.",
    },
  ],
  exercises: [
    "Implement a Virtual Proxy for a database connection pool in Java. The proxy should defer establishing the actual database connection until the first query is executed. Include a health-check method that works without establishing the connection.",
    "Build a Protection Proxy in TypeScript for a document management API. The proxy should check user roles (VIEWER, EDITOR, ADMIN) before allowing read, write, and delete operations. Write tests covering all role-operation combinations.",
    "Create a Caching Proxy for a weather API client in Python. The proxy should cache responses with a configurable TTL, handle cache misses by delegating to the real service, and provide a method to clear the cache. Test with both sync and async implementations.",
    "Implement a Logging Proxy in Python using __getattr__ that transparently wraps any object and logs all method calls with their arguments, return values, and execution time. Verify it works with any class without modification.",
  ],
  flashcards: [
    {
      front: "What is the Proxy pattern?",
      back: "A structural pattern that provides a surrogate or placeholder for another object to control access to it. The proxy and real subject share the same interface.",
    },
    {
      front: "What are the five main types of proxy?",
      back: "Virtual (lazy loading), Protection (access control), Remote (network transparency), Caching (result memoization), and Logging (call tracking).",
    },
    {
      front: "Proxy vs Decorator: intent difference?",
      back: "Proxy controls access (decides whether/when/how the call reaches the subject). Decorator adds behavior (always forwards the call but enhances it).",
    },
    {
      front: "What is a Virtual Proxy?",
      back: "A proxy that defers creation of an expensive object until it is actually used. It stores enough metadata to stand in for the real object until the real one is needed.",
    },
    {
      front: "What is Java's dynamic proxy?",
      back: "java.lang.reflect.Proxy creates proxy instances at runtime for any interface. An InvocationHandler intercepts all method calls, enabling generic cross-cutting concerns.",
    },
    {
      front: "How does JavaScript's Proxy differ from the GoF Proxy?",
      back: "JS Proxy intercepts fundamental operations (property get/set/delete, function apply, construct) via trap handlers. GoF Proxy focuses on method-level interception through a shared interface.",
    },
  ],
  revisionNotes: [
    "Proxy = same interface, controls access. Decorator = same interface, adds behavior. Adapter = different interface.",
    "Virtual Proxy: lazy creation. Protection Proxy: permission checks. Remote Proxy: network abstraction. Caching Proxy: memoization.",
    "Proxy often manages the subject's lifecycle (creates it, caches it, connects to it). Decorator receives an already-created component.",
    "Java dynamic proxies (reflect.Proxy + InvocationHandler) avoid writing one proxy class per interface. Used by Spring AOP and Hibernate.",
    "JavaScript Proxy (ES2015) intercepts property access, assignment, and more via trap handlers. Powers Vue 3 reactivity.",
    "Cache the Promise, not the resolved value, to prevent thundering herd in async caching proxies.",
  ],
  cheatSheet: [
    "Proxy implements the same Subject interface as the RealSubject.",
    "Virtual Proxy: create RealSubject lazily in first method call.",
    "Protection Proxy: check permissions before delegating.",
    "Caching Proxy: check cache -> return cached or delegate -> cache result.",
    "Remote Proxy: serialize args, send over network, deserialize result.",
    "Java: java.lang.reflect.Proxy.newProxyInstance(classLoader, interfaces, handler).",
    "JS: new Proxy(target, { get(t,p,r){...}, set(t,p,v,r){...} }).",
    "Python: use __getattr__ to intercept attribute access and delegate transparently.",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "Original Proxy pattern with virtual proxy, remote proxy, and protection proxy variants.",
    },
    {
      label: "Refactoring Guru - Proxy Pattern",
      kind: "article",
      note: "Visual guide with UML, real-world analogy, and code examples comparing Proxy with Decorator.",
    },
    {
      label: "MDN Web Docs - Proxy (JavaScript)",
      kind: "docs",
      note: "Complete reference for JavaScript's Proxy object, including all trap handlers and Reflect API.",
    },
    {
      label: "Spring Framework Documentation - AOP Proxies",
      kind: "docs",
      note: "How Spring uses JDK dynamic proxies and CGLIB proxies for aspect-oriented programming.",
    },
  ],
  glossary: [
    {
      term: "Proxy",
      definition: "A structural pattern that provides a surrogate for another object to control access to it.",
    },
    {
      term: "Virtual Proxy",
      definition: "A proxy that defers the creation of an expensive object until it is first accessed.",
    },
    {
      term: "Protection Proxy",
      definition: "A proxy that checks access permissions before forwarding requests to the real subject.",
    },
    {
      term: "Remote Proxy",
      definition: "A proxy that represents an object in a different address space, handling network communication transparently.",
    },
    {
      term: "Caching Proxy",
      definition: "A proxy that stores results of expensive operations and returns cached results for repeated identical requests.",
    },
    {
      term: "InvocationHandler",
      definition: "A Java interface whose invoke() method intercepts all calls to a dynamic proxy, enabling generic cross-cutting behavior.",
    },
    {
      term: "Trap (JavaScript Proxy)",
      definition: "A handler function that intercepts a fundamental operation on a JavaScript Proxy object (e.g., get, set, apply, construct).",
    },
  ],
};
