import type { TopicContent } from "../types";

export const singleton: TopicContent = {
  quickSummary: [
    "Singleton ensures a class has exactly one instance and provides a global point of access to it -- useful for shared resources like configuration, logging, or connection pools.",
    "Implementations vary by language: Java uses private constructors with static access (or enums), Python uses module-level instances or __new__ overrides, and TypeScript uses module scope.",
    "Singleton is often considered an anti-pattern in modern code because it introduces hidden global state, makes unit testing difficult, and tightly couples consumers to the concrete class.",
  ],
  detailed: [
    "The core mechanism is simple: make the constructor private (or otherwise restricted), store a single instance in a static field, and expose a static method (commonly getInstance()) that returns that instance, creating it on first call if necessary.",
    "Eager initialization creates the instance when the class is loaded (e.g., a static final field in Java). This is thread-safe by default because class loading is synchronized, but the instance is created even if never used.",
    "Lazy initialization defers creation to the first call to getInstance(). In single-threaded environments this is straightforward, but in multi-threaded environments it requires synchronization to prevent multiple threads from each creating an instance.",
    "Double-checked locking is a classic lazy-initialization technique: check the instance is null without locking, then synchronize only if it is null, and check again inside the lock. In Java, the instance field must be declared volatile to prevent instruction reordering from exposing a partially constructed object.",
    "The Java enum singleton (popularized by Joshua Bloch in Effective Java) is considered the best approach in Java: the JVM guarantees exactly one instance, handles serialization correctly, and prevents reflection-based attacks on the constructor.",
  ],
  deepDive: [
    "Thread safety in lazy singletons is subtle. Without volatile in Java's double-checked locking, the JIT compiler or CPU may reorder the write to the instance field and the writes to the object's fields, meaning another thread could see a non-null reference to a partially constructed object. The Java Memory Model (JSR-133, Java 5+) fixed volatile semantics to establish a happens-before relationship that prevents this.",
    "In Python, the module itself is a singleton -- importing a module multiple times returns the same module object. The simplest 'singleton' in Python is just a module-level instance. For classes, overriding __new__ lets you return the same instance, but this still allows subclassing to break the guarantee unless you add explicit checks.",
    "Singletons and Dependency Injection (DI) are often at odds. A singleton accessed via a static method is a hard dependency that cannot be swapped for a test double. DI frameworks (Spring, Guice, Angular) solve this by managing the lifecycle: they can enforce a single instance while still allowing injection of alternatives. The object itself does not enforce its own singularity -- the container does.",
    "Serialization can break singletons in Java. When a singleton is deserialized, a new instance is created unless you implement readResolve() to return the existing instance. Enum singletons handle this automatically because Java's serialization mechanism treats enum constants specially.",
  ],
  code: [
    {
      language: "java",
      caption: "Thread-safe Singleton with double-checked locking and enum approach",
      source: `// Approach 1: Double-checked locking
public class DatabaseConnection {
    // volatile prevents instruction reordering
    private static volatile DatabaseConnection instance;

    private final String connectionUrl;

    private DatabaseConnection(String url) {
        this.connectionUrl = url;
        // Simulate expensive connection setup
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {                    // First check (no lock)
            synchronized (DatabaseConnection.class) {
                if (instance == null) {            // Second check (with lock)
                    instance = new DatabaseConnection("jdbc:postgresql://localhost/mydb");
                }
            }
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql + " on " + connectionUrl);
    }
}

// Approach 2: Enum singleton (preferred in Java)
public enum AppConfig {
    INSTANCE;

    private final Properties properties = new Properties();

    AppConfig() {
        try (InputStream in = getClass().getResourceAsStream("/app.properties")) {
            if (in != null) properties.load(in);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config", e);
        }
    }

    public String get(String key) {
        return properties.getProperty(key);
    }

    public String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}

// Usage:
// AppConfig.INSTANCE.get("db.host", "localhost");`,
    },
    {
      language: "cpp",
      caption: "C++ singletons: Meyer's singleton and thread-safe lazy initialization",
      source: `// Approach 1: Meyer's Singleton (recommended in modern C++)
// Thread-safe since C++11 — static local initialization is guaranteed
// to be thread-safe by the standard (magic statics).
#include <string>
#include <unordered_map>
#include <fstream>
#include <iostream>
#include <mutex>

class AppConfig {
public:
    // Meyer's Singleton: local static, constructed on first call
    static AppConfig& instance() {
        static AppConfig config;
        return config;
    }

    void load(const std::string& path = "config.yaml") {
        // Simplified: load key=value pairs from a file
        std::ifstream file(path);
        std::string line;
        while (std::getline(file, line)) {
            auto pos = line.find('=');
            if (pos != std::string::npos)
                settings_[line.substr(0, pos)] = line.substr(pos + 1);
        }
        loaded_ = true;
    }

    std::string get(const std::string& key,
                    const std::string& default_val = "") const {
        auto it = settings_.find(key);
        return it != settings_.end() ? it->second : default_val;
    }

    // Delete copy/move to enforce single instance
    AppConfig(const AppConfig&) = delete;
    AppConfig& operator=(const AppConfig&) = delete;

private:
    AppConfig() = default;
    std::unordered_map<std::string, std::string> settings_;
    bool loaded_ = false;
};

// Usage:
// AppConfig::instance().load();
// auto db_host = AppConfig::instance().get("db_host", "localhost");


// Approach 2: Explicit double-checked locking (pre-C++11 style,
// shown for educational comparison — prefer Meyer's singleton above)
class Logger {
public:
    static Logger& instance() {
        // C++11 guarantees this is thread-safe (magic statics)
        static Logger logger;
        return logger;
    }

    void log(const std::string& message) {
        std::lock_guard<std::mutex> lock(mutex_);
        log_file_ << message << "\\n";
        log_file_.flush();
    }

    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

private:
    Logger() : log_file_("app.log", std::ios::app) {}
    ~Logger() { if (log_file_.is_open()) log_file_.close(); }

    std::ofstream log_file_;
    std::mutex mutex_;
};

// Both references point to the exact same object
// auto& logger1 = Logger::instance();
// auto& logger2 = Logger::instance();
// assert(&logger1 == &logger2);  // true`,
    },
    {
      language: "typescript",
      caption: "TypeScript singleton using module scope and class-based approach",
      source: `// Approach 1: Module-scoped singleton (idiomatic TypeScript)
// connectionPool.ts
class ConnectionPool {
  private connections: Map<string, unknown> = new Map();

  constructor(private readonly maxSize: number) {}

  acquire(name: string): unknown {
    if (!this.connections.has(name) && this.connections.size < this.maxSize) {
      this.connections.set(name, { id: name, active: true });
    }
    return this.connections.get(name);
  }

  release(name: string): void {
    this.connections.delete(name);
  }
}

// Module-level instance -- importing this module always returns the same object
export const pool = new ConnectionPool(10);


// Approach 2: Class-based singleton with private constructor
class EventBus {
  private static instance: EventBus;
  private handlers = new Map<string, Array<(data: unknown) => void>>();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, handler: (data: unknown) => void): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach(h => h(data));
  }
}

// Usage:
const bus = EventBus.getInstance();
bus.on("user:login", (user) => console.log("Logged in:", user));`,
    },
  ],
  diagrams: [
    {
      title: "Singleton class structure",
      kind: "architecture",
      caption:
        "The Singleton class holds a private static instance and exposes a public static getInstance() method. All clients share the same instance reference.",
    },
    {
      title: "Lazy initialization sequence",
      kind: "sequence",
      caption:
        "Shows two threads calling getInstance() concurrently, illustrating how double-checked locking prevents duplicate instantiation while minimizing synchronization overhead.",
    },
  ],
  animations: [
    {
      title: "Lazy Singleton creation with double-checked locking",
      steps: [
        {
          label: "Thread A calls getInstance()",
          detail: "Thread A checks the instance field -- it is null. Thread A enters the synchronized block.",
        },
        {
          label: "Thread A acquires lock and checks again",
          detail: "Inside the synchronized block, Thread A checks instance again (still null) and creates the new object.",
        },
        {
          label: "Thread B calls getInstance() concurrently",
          detail: "Thread B checks the instance field -- the volatile read now sees the fully constructed object. Thread B skips synchronization entirely and returns the existing instance.",
        },
        {
          label: "All subsequent calls",
          detail: "Every future call reads the volatile field, finds it non-null, and returns immediately with no lock contention.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Approach",
      "Thread Safety",
      "Laziness",
      "Serialization Safe",
      "Reflection Safe",
      "Complexity",
    ],
    rows: [
      ["Eager (static field)", "Yes (class loading)", "No", "No (needs readResolve)", "No", "Low"],
      ["Synchronized getInstance()", "Yes", "Yes", "No (needs readResolve)", "No", "Low"],
      ["Double-checked locking", "Yes (with volatile)", "Yes", "No (needs readResolve)", "No", "Medium"],
      ["Bill Pugh (inner static class)", "Yes (class loading)", "Yes", "No (needs readResolve)", "No", "Low"],
      ["Enum singleton (Java)", "Yes", "No", "Yes", "Yes", "Low"],
      ["Module-level instance (Python/TS)", "Yes (single-threaded import)", "No", "N/A", "N/A", "Lowest"],
    ],
  },
  interviewQA: [
    {
      q: "How do you implement a thread-safe Singleton in Java?",
      a: "The simplest thread-safe approach is an enum singleton: declare an enum with a single constant (INSTANCE). The JVM guarantees one instance, handles serialization, and prevents reflection attacks. If you need lazy initialization, use the Bill Pugh holder pattern (a private static inner class whose static field holds the instance) or double-checked locking with a volatile field.",
      followUps: [
        "Why must the field be volatile in double-checked locking?",
        "What happens if you serialize and deserialize a non-enum singleton?",
        "How does the Bill Pugh pattern achieve lazy loading?",
      ],
    },
    {
      q: "Why is Singleton often called an anti-pattern?",
      a: "Singleton introduces hidden global state that makes code harder to test, reason about, and maintain. Consumers are tightly coupled to the concrete class via the static accessor, making it impossible to substitute a mock without reflection or special frameworks. It also violates the Single Responsibility Principle by combining business logic with lifecycle management.",
      followUps: [
        "How does Dependency Injection address these problems?",
        "Can a DI container enforce a single instance without the Singleton pattern?",
        "When is a Singleton still the right choice?",
      ],
    },
    {
      q: "How would you unit test a class that depends on a Singleton?",
      a: "The best approach is to refactor so the consumer receives the dependency via its constructor (Dependency Injection) rather than calling getInstance(). If you cannot refactor, you can use a framework like Mockito with mockStatic() to stub the static method, or add a package-private resetInstance() method for tests only. In Python, you can simply monkey-patch the module attribute.",
      followUps: [
        "What are the risks of adding a resetInstance() method?",
        "How does @InjectMocks work with singletons in Mockito?",
      ],
    },
    {
      q: "How does Python's module system naturally provide singleton behavior?",
      a: "When you import a module in Python, the interpreter loads and executes it once, then caches the module object in sys.modules. All subsequent imports return the same cached module object. Any module-level variable is therefore shared across all importers, which gives singleton-like behavior without any special pattern.",
      followUps: [
        "Can you force Python to re-import a module?",
        "What happens if two modules import each other circularly?",
      ],
    },
    {
      q: "What is the difference between Singleton and a static class (utility class)?",
      a: "A static class has only static methods and no instance at all -- it is stateless. A Singleton has exactly one instance that can hold state, implement interfaces, be passed as a parameter, and participate in polymorphism. A static class cannot be injected, mocked via interfaces, or swapped at runtime.",
      followUps: [
        "Can a Singleton implement an interface? Why is that useful?",
        "When would you choose a static utility class over a Singleton?",
        "Can a static class be lazy-loaded?",
      ],
    },
    {
      q: "How can reflection break a Singleton in Java, and how do you prevent it?",
      a: "Using reflection, you can call setAccessible(true) on the private constructor and invoke it to create a second instance. To prevent this, throw an exception in the constructor if an instance already exists. Enum singletons prevent this automatically because the JVM does not allow reflective construction of enum instances.",
      followUps: [
        "Can serialization also break a Singleton?",
        "How does readResolve() fix the serialization issue?",
      ],
    },
  ],
  followUps: [
    "How does the Singleton pattern interact with class loaders in Java EE or OSGi environments where multiple class loaders exist?",
    "What is the Multiton pattern, and how does it extend Singleton to manage a fixed set of named instances?",
    "How do DI frameworks like Spring manage singleton scope, and how does that differ from the GoF Singleton pattern?",
    "What are the implications of Singleton in distributed systems -- does the guarantee hold across multiple JVMs or service instances?",
    "How does the Registry of Singletons pattern organize access to multiple singletons in a large application?",
  ],
  mcqs: [
    {
      q: "Which Java keyword is essential for correctness in double-checked locking?",
      options: ["transient", "volatile", "synchronized", "final"],
      answerIndex: 1,
      explanation:
        "The volatile keyword establishes a happens-before relationship that prevents the JVM from reordering the instance field write and the object's constructor writes, which would allow another thread to see a non-null but partially constructed object.",
    },
    {
      q: "Which Singleton implementation in Java is safe against both serialization and reflection attacks?",
      options: [
        "Synchronized getInstance()",
        "Double-checked locking",
        "Enum singleton",
        "Bill Pugh holder class",
      ],
      answerIndex: 2,
      explanation:
        "Enum singletons are the only approach that is inherently safe against serialization (enums have special serialization rules) and reflection (the JVM throws an exception if you attempt to reflectively instantiate an enum).",
    },
    {
      q: "What is the primary disadvantage of eager initialization?",
      options: [
        "It is not thread-safe",
        "It creates the instance even if it is never used",
        "It requires synchronized blocks",
        "It does not work with interfaces",
      ],
      answerIndex: 1,
      explanation:
        "Eager initialization creates the instance at class-loading time regardless of whether any code ever requests it. This wastes resources if the singleton is expensive to create and never needed.",
    },
    {
      q: "In the Bill Pugh Singleton, what triggers the creation of the instance?",
      options: [
        "Loading of the outer class",
        "The first call to getInstance() which loads the inner holder class",
        "Static initializer block in the outer class",
        "JVM startup",
      ],
      answerIndex: 1,
      explanation:
        "The inner static class is not loaded until getInstance() references it. When the inner class loads, the JVM initializes its static field (the Singleton instance) in a thread-safe manner guaranteed by the class-loading specification.",
    },
    {
      q: "Why is Singleton problematic for unit testing?",
      options: [
        "Singletons cannot be instantiated in test environments",
        "Static getInstance() creates a hard dependency that cannot be easily replaced with a test double",
        "Singletons always require database connections",
        "Singletons are too slow for unit tests",
      ],
      answerIndex: 1,
      explanation:
        "The static accessor tightly couples the consumer to the concrete singleton class. Without DI, you cannot inject a mock or stub, making it hard to test the consumer in isolation.",
    },
    {
      q: "What is the Pythonic way to implement a singleton?",
      options: [
        "Using metaclasses",
        "Using a decorator",
        "Creating a module-level instance",
        "Overriding __init__",
      ],
      answerIndex: 2,
      explanation:
        "Python modules are naturally singletons -- they are loaded once and cached in sys.modules. Creating a module-level instance and importing it is the simplest, most idiomatic approach.",
    },
  ],
  exercises: [
    "Implement a thread-safe Singleton in Java using the Bill Pugh holder pattern. Then write a unit test that verifies only one instance is created across 100 concurrent threads using an ExecutorService and a ConcurrentHashMap to collect instance hash codes.",
    "Refactor a legacy class that uses Singleton.getInstance() throughout its methods so that the dependency is injected via the constructor instead. Verify that you can now pass a mock in unit tests.",
    "Create a Python Singleton using the __new__ method that tracks how many times __init__ has been called. Demonstrate that even though __new__ returns the same instance, __init__ is called on every constructor invocation, and add a guard to prevent re-initialization.",
    "Implement a Multiton pattern in TypeScript that manages up to N named instances (e.g., connection pools for different databases). Include a factory method that returns the existing instance for a given key or creates a new one if the limit has not been reached.",
  ],
  flashcards: [
    {
      front: "What is the Singleton pattern?",
      back: "A creational design pattern that ensures a class has exactly one instance and provides a global point of access to it.",
    },
    {
      front: "Why must the instance field be volatile in Java's double-checked locking?",
      back: "Without volatile, the JVM may reorder writes so another thread sees a non-null reference to a partially constructed object. Volatile establishes a happens-before relationship preventing this reordering.",
    },
    {
      front: "What is the Bill Pugh Singleton?",
      back: "It uses a private static inner holder class whose static field holds the singleton instance. The inner class is loaded only when getInstance() is called, providing lazy initialization with thread safety guaranteed by the JVM class loader.",
    },
    {
      front: "Why is the enum singleton considered the best approach in Java?",
      back: "The JVM guarantees exactly one instance, provides thread safety, prevents reflection attacks (cannot reflectively construct enums), and handles serialization correctly (enum constants are serialized by name).",
    },
    {
      front: "How does Dependency Injection solve Singleton's testing problem?",
      back: "DI lets the container manage the single-instance lifecycle while consumers receive the dependency through their constructor. This allows tests to inject mocks or stubs without relying on static accessors.",
    },
    {
      front: "What is the Pythonic singleton?",
      back: "A module-level instance. Python caches imported modules in sys.modules, so any module-level object is shared across all importers -- achieving singleton behavior with zero boilerplate.",
    },
  ],
  revisionNotes: [
    "Singleton = one instance + global access. Private constructor, static field, static accessor.",
    "Eager initialization is thread-safe but creates the instance even if unused. Lazy initialization saves resources but needs synchronization in multi-threaded environments.",
    "Double-checked locking: check null -> lock -> check null again -> create. Requires volatile in Java 5+ to prevent partial construction visibility.",
    "Enum singleton in Java is the gold standard: thread-safe, serialization-safe, reflection-safe, and concise.",
    "Singletons are anti-patterns when they hide dependencies, prevent testability, and couple code to concrete classes. Prefer DI containers for managing single-instance lifecycle.",
    "In Python, use a module-level instance. In TypeScript, use module-scoped exports. No need for the full GoF ceremony in languages with module systems.",
  ],
  cheatSheet: [
    "Eager: private static final INSTANCE = new Singleton(); // Thread-safe, not lazy.",
    "Lazy + synchronized: public static synchronized Singleton getInstance() // Simple but slow.",
    "Double-checked locking: if (instance == null) { synchronized { if (instance == null) instance = new S(); } } // Requires volatile.",
    "Bill Pugh: private static class Holder { static final S INSTANCE = new S(); } // Lazy + thread-safe.",
    "Enum: public enum S { INSTANCE; } // Best in Java. Serialization + reflection safe.",
    "Python: config = _Config()  at module level. Import it everywhere.",
    "Testing: inject the dependency instead of calling getInstance(). Use DI or constructor injection.",
    "readResolve(): private Object readResolve() { return INSTANCE; } // Prevents deserialization from creating a new instance.",
  ],
  resources: [
    {
      label: "Effective Java, 3rd Edition - Item 3: Enforce the singleton property",
      kind: "book",
      note: "Joshua Bloch's definitive guidance on enum singletons and why they are preferred in Java.",
    },
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "The original Singleton pattern description with C++ examples and discussion of known consequences.",
    },
    {
      label: "Refactoring Guru - Singleton Pattern",
      kind: "article",
      note: "Clear visual explanation with UML diagrams and implementations in multiple languages.",
    },
    {
      label: "The Java Memory Model and Double-Checked Locking",
      kind: "article",
      note: "Deep dive into why double-checked locking was broken before Java 5 and how volatile fixes it.",
    },
    {
      label: "Google Testing Blog - Singletons are Pathological Liars",
      kind: "article",
      note: "Misko Hevery's influential post on why singletons harm testability and how DI provides a better alternative.",
    },
  ],
  glossary: [
    {
      term: "Singleton",
      definition: "A design pattern that restricts a class to a single instance and provides a global access point to it.",
    },
    {
      term: "Eager initialization",
      definition: "Creating the singleton instance at class-loading time, before any client requests it.",
    },
    {
      term: "Lazy initialization",
      definition: "Deferring the creation of the singleton instance until it is first requested.",
    },
    {
      term: "Double-checked locking",
      definition: "An optimization that checks the instance twice (once without a lock, once with) to avoid synchronization on every access while remaining thread-safe.",
    },
    {
      term: "Volatile",
      definition: "A Java keyword that ensures a variable's reads and writes are visible across threads and prevents instruction reordering around that variable.",
    },
    {
      term: "Bill Pugh holder",
      definition: "A lazy singleton technique that uses a private static inner class to hold the instance, leveraging the JVM's class-loading guarantees for thread safety.",
    },
    {
      term: "readResolve()",
      definition: "A special Java method invoked during deserialization that allows the class to return an existing object (the singleton) instead of the newly deserialized instance.",
    },
  ],
};
