import type { TopicContent } from "../types";

export const encapsulation: TopicContent = {
  quickSummary: [
    "Encapsulation is the bundling of data (fields/attributes) and the methods that operate on that data into a single unit (class/module), while restricting direct access to some of the object's components.",
    "It enforces information hiding -- internal implementation details are concealed behind a well-defined public interface, preventing external code from depending on or corrupting internal state.",
    "Access modifiers (public, private, protected, internal) are the primary language mechanism for enforcing encapsulation, though conventions (Python's underscore prefix) and closures (JavaScript) also achieve it.",
    "Encapsulation is NOT the same as abstraction: encapsulation is about restricting access to internals, while abstraction is about exposing only relevant high-level behavior. Encapsulation is one mechanism that supports abstraction.",
    "Well-encapsulated code reduces coupling, improves maintainability, and enables safe refactoring because internal representations can change without affecting consumers of the public API."
  ],

  detailed: [
    "## The Two Facets of Encapsulation\n\nEncapsulation has two complementary aspects: **bundling** (grouping related data and behavior together) and **information hiding** (controlling visibility of internals). Parnas's 1972 paper 'On the Criteria To Be Used in Decomposing Systems into Modules' established the principle that modules should hide design decisions likely to change. Encapsulation is the OOP realization of this principle.",

    "## Access Modifiers Across Languages\n\n**Java** provides four levels: `public` (accessible everywhere), `protected` (same package + subclasses), package-private/default (same package only), and `private` (same class only). **C++** has `public`, `protected`, and `private`, with the addition of `friend` declarations that grant specific classes or functions access to private members. **C#** adds `internal` (same assembly), `protected internal` (same assembly OR subclasses), and `private protected` (same assembly AND subclasses). **TypeScript** mirrors Java's three keywords and adds ECMAScript private fields (`#field`). **Python** uses naming conventions: a single underscore `_name` signals 'protected by convention', and a double underscore `__name` triggers name mangling to `_ClassName__name`, providing weak enforcement.",

    "## Properties and Accessor Methods\n\nRaw getters/setters (Java-style `getX()`/`setX()`) are verbose but provide a stable API boundary. C# and Python offer **properties** that look like field access but execute method logic. C# uses `get`/`set`/`init` accessors within property declarations. Python uses the `@property` decorator and corresponding `@x.setter`. Kotlin has `var`/`val` with custom `get()`/`set(value)`. Swift uses computed properties and `willSet`/`didSet` observers. The key advantage: you can start with a plain field and later add validation, logging, or lazy initialization without changing the caller's syntax.",

    "## Encapsulation Beyond Classes\n\nEncapsulation is not limited to classes. **Module-level encapsulation** is achieved through export lists (TypeScript/ES modules), `__all__` in Python, and package visibility in Go (exported names start with uppercase). **Closure-based encapsulation** in JavaScript uses function scope to hide variables -- the revealing module pattern and IIFE pattern predate ES modules. **Rust** uses `pub`/`pub(crate)`/`pub(super)` at the module level, with struct fields private by default. **Go** uses capitalization: `ExportedField` is public, `unexportedField` is package-private.",

    "## Immutability as Encapsulation\n\nReturning mutable internal collections breaks encapsulation even with getters. Defensive copying (returning `Collections.unmodifiableList(new ArrayList<>(items))` in Java) or using immutable types (Kotlin's `List` vs `MutableList`, Python's `tuple` vs `list`) prevents external mutation of internal state. Effective Java Item 50: 'Make defensive copies when needed.' In functional languages, immutability by default (Haskell, Erlang, Clojure) eliminates this class of encapsulation violation entirely.",

    "## Reflection and Serialization: Encapsulation Breakers\n\nReflection APIs (Java's `java.lang.reflect`, Python's `getattr`/`setattr`, C#'s `System.Reflection`) can bypass access modifiers at runtime, breaking encapsulation guarantees. Serialization frameworks (Jackson, Gson, pickle) often require access to private fields. Modern frameworks mitigate this: Jackson can use constructor-based deserialization, Kotlin's data classes work with `kotlinx.serialization`. The Java module system (JPMS) introduced `--add-opens` to control reflective access, adding a module-level encapsulation boundary.",

    "## Design Principles and Encapsulation\n\nThe **Tell, Don't Ask** principle states that you should tell objects what to do rather than asking for their data and acting on it externally. This avoids 'feature envy' where one class excessively uses another's getters. The **Law of Demeter** (principle of least knowledge) says a method should only call methods on: itself, its parameters, objects it creates, or its direct component objects -- not on objects returned by other calls (`a.getB().getC().doSomething()` violates this). Both principles reinforce strong encapsulation."
  ],

  deepDive: [
    "## Memory Layout and Access Control Enforcement\n\nIn C++, access modifiers are enforced entirely at compile time. At the object level in memory, public and private fields are laid out identically -- there is no runtime distinction. The compiler simply rejects code that accesses private members. This means that with pointer arithmetic or `reinterpret_cast`, you can technically access private members, which is undefined behavior but demonstrates that C++ encapsulation is a compile-time contract, not a runtime barrier. Java and C# enforce access at both compile time and runtime (the JVM verifier checks access flags in bytecode, and reflection requires explicit permission).",

    "## Name Mangling in Python\n\nPython's double-underscore name mangling transforms `__attr` to `_ClassName__attr`. This is NOT security -- it prevents accidental name collisions in inheritance hierarchies. If class `Base` has `__x` and class `Derived(Base)` also has `__x`, they become `_Base__x` and `_Derived__x` respectively, avoiding unintentional shadowing. The mangled names are still accessible. CPython's `__slots__` mechanism provides a different kind of encapsulation: it prevents the creation of `__dict__`, fixing the set of allowed attributes and reducing memory overhead via a struct-like layout.",

    "## The Friend Mechanism in C++\n\nC++ `friend` declarations allow specific classes or functions to access private/protected members. This is controversial: it creates tight coupling but is necessary for operator overloading (e.g., `operator<<` for streams needs access to private fields) and the Pimpl (Pointer to Implementation) idiom. The friendship relationship is not transitive (friends of friends are not friends), not inherited (derived classes of a friend are not friends), and must be declared inside the granting class. The Attorney-Client idiom provides fine-grained friendship by exposing only specific private members through an intermediary class.",

    "## Encapsulation in Module Systems\n\nJava 9's JPMS (Java Platform Module System) adds a layer above packages. A module's `module-info.java` declares which packages are exported (`exports com.example.api`), which are opened for reflection (`opens com.example.internal to framework`), and which modules are required. Unexported packages are strongly encapsulated -- even reflection cannot access them without `--add-opens`. This fixed a long-standing gap where `public` meant 'accessible to the entire world.' Go takes the simplest approach: capitalized identifiers are exported from the package, lowercase are unexported. Rust's module system allows `pub(crate)` for crate-internal visibility, `pub(super)` for parent-module visibility, and `pub(in path)` for arbitrary ancestor visibility.",

    "## Property Patterns and Performance\n\nC# properties compile to `get_PropertyName()` and `set_PropertyName()` methods in IL. The JIT compiler typically inlines trivial auto-properties, so there is no performance penalty versus direct field access. Java's HotSpot JIT similarly inlines simple getter/setter methods after a warmup period. In performance-critical C++ code, trivial accessors are always inlined (especially with `inline` keyword or defined in the header). The overhead concern about getters/setters is largely a myth in modern compiled/JIT-compiled languages, but in interpreted Python, property access via descriptors does add measurable overhead in tight loops.",

    "## Encapsulation Metrics\n\nThe **Encapsulation Ratio** measures the proportion of private/protected members to total members. A higher ratio suggests better encapsulation. **Coupling Between Objects (CBO)** measures the number of other classes a class is coupled to -- high CBO often indicates broken encapsulation. **Lack of Cohesion of Methods (LCOM)** measures how related a class's methods are to its fields -- high LCOM suggests the class bundles unrelated concerns and should be split. Tools like SonarQube, NDepend, and JDepend compute these metrics."
  ],

  code: [
    {
      language: "java",
      caption: "Java encapsulation with validation, defensive copying, and immutability",
      source: `public final class BankAccount {
    private final String accountId;
    private double balance;
    private final List<Transaction> history;

    public BankAccount(String accountId, double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.accountId = Objects.requireNonNull(accountId);
        this.balance = initialBalance;
        this.history = new ArrayList<>();
    }

    public String getAccountId() {
        return accountId; // String is immutable, safe to return directly
    }

    public double getBalance() {
        return balance; // primitives are returned by value
    }

    // Defensive copy -- never expose internal mutable collection
    public List<Transaction> getHistory() {
        return Collections.unmodifiableList(new ArrayList<>(history));
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balance += amount;
        history.add(new Transaction(TransactionType.DEPOSIT, amount));
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive");
        if (amount > balance) throw new InsufficientFundsException(balance, amount);
        balance -= amount;
        history.add(new Transaction(TransactionType.WITHDRAWAL, amount));
    }
}`
    },
    {
      language: "cpp",
      caption: "C++ encapsulation with getters/setters, validation, and private members",
      source: `#include <iostream>
#include <stdexcept>
#include <string>
#include <map>

class Temperature {
    // Encapsulated temperature with validation via accessors.
public:
    explicit Temperature(double celsius) { set_celsius(celsius); }

    double celsius() const { return celsius_; }

    void set_celsius(double value) {
        if (value < -273.15)
            throw std::invalid_argument("Temperature below absolute zero");
        celsius_ = value;
    }

    double fahrenheit() const { return celsius_ * 9.0 / 5.0 + 32.0; }

    void set_fahrenheit(double value) {
        set_celsius((value - 32.0) * 5.0 / 9.0);  // delegates to set_celsius
    }

private:
    double celsius_;
};


class SecureConfig {
    // Private members are inaccessible from outside -- enforced at compile time.
public:
    explicit SecureConfig(std::string api_key, int timeout = 30)
        : api_key_(std::move(api_key)), timeout_(timeout) {}

    std::map<std::string, std::string> make_request_headers() const {
        // Internal use of private attribute
        return {{"Authorization", "Bearer " + api_key_}};
    }

    int timeout() const { return timeout_; }

private:
    std::string api_key_;   // truly private -- compiler-enforced
    int timeout_;           // also private
};

// Usage:
// Temperature t(100);
// std::cout << t.fahrenheit();   // 212.0
// t.set_fahrenheit(32);
// std::cout << t.celsius();      // 0.0
//
// SecureConfig cfg("secret-key");
// auto headers = cfg.make_request_headers();
// cfg.api_key_;  // compile error: private member`
    },
    {
      language: "cpp",
      caption: "C++ encapsulation with Pimpl idiom and friend functions",
      source: `// widget.h -- Public header exposes only interface
#include <memory>
#include <string>
#include <iostream>

class Widget {
public:
    Widget(std::string name, int value);
    ~Widget();  // Must be declared for unique_ptr to incomplete type
    Widget(Widget&& other) noexcept;
    Widget& operator=(Widget&& other) noexcept;

    // Public interface
    std::string name() const;
    void set_value(int v);
    int value() const;

    // Friend for stream output -- needs access to internals
    friend std::ostream& operator<<(std::ostream& os, const Widget& w);

private:
    struct Impl;                     // Forward declaration -- details hidden
    std::unique_ptr<Impl> pImpl;     // Pointer to implementation
};

// widget.cpp -- Implementation details completely hidden from consumers
struct Widget::Impl {
    std::string name;
    int value;
    int internal_counter = 0;  // Completely hidden from users

    void validate(int v) {
        if (v < 0) throw std::invalid_argument("Value must be non-negative");
    }
};

Widget::Widget(std::string name, int value)
    : pImpl(std::make_unique<Impl>()) {
    pImpl->name = std::move(name);
    pImpl->validate(value);
    pImpl->value = value;
}

Widget::~Widget() = default;
Widget::Widget(Widget&&) noexcept = default;
Widget& Widget::operator=(Widget&&) noexcept = default;

std::string Widget::name() const { return pImpl->name; }
int Widget::value() const { return pImpl->value; }

void Widget::set_value(int v) {
    pImpl->validate(v);
    pImpl->value = v;
    pImpl->internal_counter++;
}

std::ostream& operator<<(std::ostream& os, const Widget& w) {
    return os << "Widget(" << w.pImpl->name << ", " << w.pImpl->value << ")";
}`
    },
    {
      language: "typescript",
      caption: "TypeScript encapsulation with ECMAScript private fields and readonly",
      source: `class EventEmitter<T extends Record<string, unknown[]>> {
  // ECMAScript private field -- truly private at runtime
  #listeners: Map<keyof T, Set<Function>> = new Map();
  #maxListeners: number;

  // TypeScript 'readonly' -- enforced at compile time
  readonly name: string;

  constructor(name: string, maxListeners: number = 10) {
    this.name = name;
    this.#maxListeners = maxListeners;
  }

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    const listeners = this.#listeners.get(event)!;
    if (listeners.size >= this.#maxListeners) {
      console.warn(
        \`MaxListenersExceeded: \${String(event)} has \${listeners.size} listeners\`
      );
    }
    listeners.add(listener);
    return this;
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): boolean {
    const listeners = this.#listeners.get(event);
    if (!listeners || listeners.size === 0) return false;
    for (const listener of listeners) {
      listener(...args);
    }
    return true;
  }

  // Expose count without exposing internal data structure
  listenerCount(event: keyof T): number {
    return this.#listeners.get(event)?.size ?? 0;
  }
}

// Usage with type-safe events
interface AppEvents {
  login: [userId: string, timestamp: number];
  error: [error: Error];
}

const emitter = new EventEmitter<AppEvents>("app");
emitter.on("login", (userId, timestamp) => {
  console.log(\`User \${userId} logged in at \${timestamp}\`);
});`
    },
    {
      language: "csharp",
      caption: "C# encapsulation with properties, init-only setters, and access levels",
      source: `public class UserProfile
{
    // Auto-property with private setter -- read-only from outside
    public Guid Id { get; private set; }

    // Init-only setter -- can only be set during object initialization
    public string Username { get; init; }

    // Full property with backing field and validation
    private string _email;
    public string Email
    {
        get => _email;
        set
        {
            if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
                throw new ArgumentException("Invalid email address");
            _email = value;
        }
    }

    // Internal -- accessible within the same assembly only
    internal DateTime LastLoginUtc { get; set; }

    // Protected -- accessible to subclasses
    protected virtual int MaxLoginAttempts => 5;

    // Private protected -- accessible to subclasses in the same assembly
    private protected int FailedAttempts { get; set; }

    // Private backing field with computed property
    private readonly List<string> _roles = new();
    public IReadOnlyList<string> Roles => _roles.AsReadOnly();

    public UserProfile(string username, string email)
    {
        Id = Guid.NewGuid();
        Username = username ?? throw new ArgumentNullException(nameof(username));
        Email = email;  // Goes through validation
    }

    public void AddRole(string role)
    {
        if (_roles.Contains(role))
            throw new InvalidOperationException($"Role '{role}' already assigned");
        _roles.Add(role);
    }
}

// Usage with init-only setter
var user = new UserProfile("alice", "alice@example.com")
{
    Username = "alice_wonderland"  // Allowed during initialization
};
// user.Username = "new_name";  // Compile error: init-only`
    },
    {
      language: "javascript",
      caption: "JavaScript closure-based encapsulation (revealing module pattern)",
      source: `// Closure-based encapsulation -- predates ES2022 private fields
function createCounter(initialValue = 0) {
  // These variables are truly private -- no reflection can reach them
  let count = initialValue;
  const history = [];
  const maxHistory = 100;

  function recordChange(oldVal, newVal, operation) {
    history.push({ oldVal, newVal, operation, timestamp: Date.now() });
    if (history.length > maxHistory) history.shift();
  }

  // Revealed public API
  return Object.freeze({
    increment() {
      const old = count;
      count++;
      recordChange(old, count, 'increment');
      return count;
    },
    decrement() {
      const old = count;
      count--;
      recordChange(old, count, 'decrement');
      return count;
    },
    reset() {
      const old = count;
      count = initialValue;
      recordChange(old, count, 'reset');
    },
    get value() {
      return count;
    },
    get changeCount() {
      return history.length;
    }
  });
}

const counter = createCounter(10);
counter.increment();  // 11
counter.increment();  // 12
counter.decrement();  // 11
console.log(counter.value);       // 11
console.log(counter.changeCount); // 3
// counter.count -- undefined (truly private)
// No way to access 'history' array`
    },
    {
      language: "rust",
      caption: "Rust module-level encapsulation with pub visibility modifiers",
      source: `// lib.rs
pub mod auth {
    // Private struct field -- only accessible within this module
    pub struct Session {
        user_id: String,           // private to module
        pub username: String,      // publicly accessible
        token: String,             // private to module
        pub(crate) role: Role,     // accessible within the crate
        pub(super) created_at: u64,// accessible to parent module
    }

    #[derive(Clone, Debug)]
    pub enum Role {
        User,
        Admin,
        SuperAdmin,
    }

    impl Session {
        // Public constructor -- the only way to create a Session
        pub fn new(user_id: String, username: String, role: Role) -> Self {
            Session {
                user_id,
                username,
                token: Self::generate_token(),
                role,
                created_at: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            }
        }

        // Public getter -- controlled access to private field
        pub fn user_id(&self) -> &str {
            &self.user_id
        }

        // Token is never exposed -- only used internally
        pub fn validate(&self) -> bool {
            !self.token.is_empty() && self.token.len() == 64
        }

        fn generate_token() -> String {
            // In production, use a cryptographic RNG
            (0..64).map(|_| 'a').collect()
        }
    }
}

// In another module within the same crate:
// session.role is accessible (pub(crate))
// session.user_id is NOT accessible directly
// session.user_id() getter IS accessible`
    }
  ],

  diagrams: [
    {
      title: "Encapsulation Boundary Layers",
      kind: "architecture",
      mermaid: `graph TD
    subgraph Module["Module or Package boundary"]
      subgraph Class["Class boundary"]
        subgraph Method["Method scope"]
          Local["Local variables\nonly this method"]
        end
        Private["Private fields\nonly this class"]
        Protected["Protected fields\nclass and subclasses"]
      end
      Internal["Internal or package-private\nwithin module only"]
    end
    Public["Public API\nexposed to all callers"]
    Module --> Public
    Internal -.->|not visible outside| Public`,
      caption: "Encapsulation operates at multiple levels: field visibility, class boundaries, and module exports each progressively restrict access.",
    },
    {
      title: "Property Access Lifecycle",
      kind: "sequence",
      mermaid: `sequenceDiagram
    participant Caller
    participant Property as Property Accessor
    participant Backing as Backing Field
    participant Observer as Change Observer
    Caller->>Property: set value = 42
    Property->>Property: Validate - must be positive
    Property->>Backing: store validated value
    Property->>Observer: notify change event
    Observer-->>Caller: UI update triggered
    Caller->>Property: get value
    Property->>Backing: read backing field
    Backing-->>Property: return 42
    Property-->>Caller: return 42`,
      caption: "Properties add validation, side effects, and change notification between caller and backing storage without changing the call syntax.",
    },
    {
      title: "Encapsulation Violation Consequences",
      kind: "state",
      mermaid: `stateDiagram-v2
    [*] --> Valid : object constructed with invariants
    Valid --> Valid : state change via method - invariant checked
    Valid --> Corrupted : external code sets field directly
    Corrupted --> Corrupted : inconsistent operations continue
    Corrupted --> DetectedBug : assertion or null check fails
    DetectedBug --> Investigating : developer traces root cause
    Investigating --> Fixed : restore encapsulation
    Fixed --> Valid : refactor removes public setter
    note right of Corrupted
      Transaction history
      does not match balance
      invariant violated
    end note`,
      caption: "Breaking encapsulation allows invalid state transitions; bugs manifest far from the violation making them costly to trace and fix.",
    },
    {
      title: "Access Modifier Visibility by Language",
      kind: "network",
      mermaid: `graph LR
    subgraph Scopes["Visibility Scopes"]
      SameClass["Same Class"]
      Subclass["Subclass"]
      SamePackage["Same Package or Module"]
      Everywhere["All Code"]
    end
    Private["private"] --> SameClass
    Protected["protected"] --> SameClass
    Protected --> Subclass
    PackagePrivate["package-private\nor internal"] --> SameClass
    PackagePrivate --> Subclass
    PackagePrivate --> SamePackage
    Public["public"] --> SameClass
    Public --> Subclass
    Public --> SamePackage
    Public --> Everywhere`,
      caption: "Access modifiers form a hierarchy of visibility; each level adds one more scope, with public granting access from anywhere in the codebase.",
    },
  ],

  animations: [
    {
      title: "Breaking Encapsulation: A Cautionary Tale",
      steps: [
        { label: "Well-Encapsulated Class", detail: "BankAccount has private balance field with deposit() and withdraw() methods that enforce invariants (balance >= 0, transactions logged)." },
        { label: "Developer Adds Public Setter", detail: "Under time pressure, a developer adds a public setBalance() method to 'simplify' a batch operation." },
        { label: "External Code Uses Setter", detail: "Another module directly sets balance to a negative value, bypassing validation. Transaction history becomes inconsistent." },
        { label: "Bug Manifests in Production", detail: "Monthly reconciliation fails because transaction history does not match actual balance. The root cause is traced back to the public setter." },
        { label: "Fix: Restore Encapsulation", detail: "The setter is removed. A new adjustBalance(amount, reason) method is added that enforces invariants and logs the adjustment with an audit trail." }
      ]
    },
    {
      title: "Evolution from Field Access to Properties",
      steps: [
        { label: "Direct Field Access", detail: "Version 1: class User { public String name; } -- callers read/write user.name directly." },
        { label: "Requirement Change", detail: "New requirement: names must be trimmed, non-empty, and changes must trigger UI updates." },
        { label: "Breaking Change", detail: "Changing to getName()/setName() breaks all existing callers. In Java, this is a binary-incompatible change." },
        { label: "Property-Based Design", detail: "C#/Python properties allow starting with simple syntax and adding logic later without breaking callers. The interface remains field-like." },
        { label: "Best Practice", detail: "Always use properties/accessors from the start, even for trivial fields. The performance cost is zero (JIT inlines them) but the flexibility is significant." }
      ]
    }
  ],

  comparison: {
    columns: ["Feature", "Java", "C++", "C#", "Python", "TypeScript", "Rust", "Go"],
    rows: [
      ["private", "Yes (class-only)", "Yes (class-only)", "Yes (class-only)", "__ name mangling", "Yes + #private", "Default (module)", "lowercase unexported"],
      ["protected", "Package + subclass", "Subclass only", "Subclass only", "_ convention", "Yes (subclass)", "N/A", "N/A"],
      ["public", "Yes", "Yes", "Yes", "Default", "Yes (default)", "pub", "Uppercase exported"],
      ["package/internal", "Default (package)", "N/A", "internal (assembly)", "Module __all__", "Module exports", "pub(crate)", "Package-level"],
      ["friend access", "No", "Yes (friend)", "InternalsVisibleTo", "No", "No", "No", "No"],
      ["Properties", "Getter/setter methods", "No (use methods)", "get/set/init", "@property decorator", "get/set accessors", "Methods by convention", "Methods by convention"],
      ["Runtime enforcement", "JVM verifier", "Compile-time only", "CLR verifier", "No (conventions)", "Compile-time + #fields", "Compile-time", "Compile-time"],
      ["Reflection bypass", "setAccessible(true)", "Pointer tricks (UB)", "BindingFlags.NonPublic", "getattr() always works", "Not for #private", "unsafe blocks", "reflect package"]
    ]
  },

  interviewQA: [
    {
      q: "What is the difference between encapsulation and information hiding? Are they the same thing?",
      a: "They are related but distinct concepts. Encapsulation is the bundling of data and methods into a single unit (class, module). Information hiding is the principle of concealing implementation details behind an interface. Encapsulation is a mechanism; information hiding is a design principle. You can have encapsulation without information hiding (a class with all public fields bundles data but hides nothing). Information hiding can be achieved without class-based encapsulation (closures, module systems). In practice, they are used together: classes encapsulate data and methods, while access modifiers enforce information hiding.",
      followUps: [
        "Give an example where encapsulation exists but information hiding does not.",
        "How does the module system in Java 9+ add information hiding beyond access modifiers?"
      ]
    },
    {
      q: "Why should you prefer private fields with getters/setters over public fields?",
      a: "Public fields create a direct coupling between external code and internal representation. If you later need to add validation, logging, lazy initialization, computed values, or change the internal storage format, you must break the API. Getter/setter methods (or properties in C#/Python/Kotlin) provide an abstraction layer: the internal representation can change while the public API remains stable. Additionally, getters/setters enable read-only or write-only access, thread synchronization, and debugging breakpoints. The performance argument against them is invalid in modern languages -- JIT compilers inline trivial accessors, eliminating any overhead.",
      followUps: [
        "When might public fields be acceptable?",
        "How do C# auto-properties solve the verbosity problem?"
      ]
    },
    {
      q: "How does Python's approach to encapsulation differ from Java's, and what are the tradeoffs?",
      a: "Python follows 'we are all consenting adults here' -- it relies on naming conventions (_protected, __mangled) rather than compiler enforcement. Java enforces access modifiers at both compile time (compiler rejects illegal access) and runtime (JVM bytecode verifier). Python's approach is more flexible: it enables metaprogramming, testing of internals, and rapid prototyping without fighting the type system. The tradeoff is that Python cannot guarantee encapsulation -- any code can access any attribute with getattr() or by using the mangled name. In large codebases with many contributors, Java's enforcement prevents accidental coupling to internals, while Python relies on discipline and code review.",
      followUps: [
        "What does Python's name mangling actually do at the implementation level?",
        "How does __slots__ relate to encapsulation in Python?"
      ]
    },
    {
      q: "Explain the Pimpl idiom in C++ and why it is used.",
      a: "Pimpl (Pointer to Implementation) moves all private data members and helper methods into a forward-declared implementation class, storing only a pointer (usually unique_ptr<Impl>) in the public header. Benefits: (1) Compilation firewall -- changes to private members do not trigger recompilation of files that include the header. (2) Binary compatibility -- the public class's size never changes because it always contains just a pointer. (3) True information hiding -- private details are not visible in the header at all. Costs: heap allocation for Impl, pointer indirection on every access (though often optimized away), and more complex move/copy semantics. The idiom is widely used in Qt, Boost, and other large C++ libraries.",
      followUps: [
        "How does Pimpl affect move semantics and exception safety?",
        "What is the Attorney-Client idiom and how does it provide finer-grained access than friend?"
      ]
    },
    {
      q: "How can serialization frameworks break encapsulation, and how do you mitigate this?",
      a: "Serialization frameworks like Jackson, Gson, pickle, and System.Text.Json often need to access private fields to serialize/deserialize objects. They typically use reflection to bypass access modifiers. This creates several problems: (1) internal field names become part of the serialized format, creating a hidden public API, (2) deserialization can create objects in invalid states by bypassing constructor validation, (3) changes to private fields break serialization compatibility. Mitigations include: using DTOs (Data Transfer Objects) as a serialization boundary, constructor-based deserialization (Jackson's @JsonCreator), custom serializers, schema evolution strategies (Avro, Protobuf), and the @JsonProperty annotation to decouple field names from serialized keys.",
      followUps: [
        "What is the difference between Jackson's field-based and constructor-based deserialization?",
        "How do you handle backward compatibility when changing private field names?"
      ]
    },
    {
      q: "What is the 'Tell, Don't Ask' principle and how does it relate to encapsulation?",
      a: "Tell, Don't Ask says you should tell objects what to do rather than querying their state and making decisions externally. Instead of 'if (account.getBalance() >= amount) account.setBalance(account.getBalance() - amount)', you should call 'account.withdraw(amount)' and let the object enforce its own invariants. Violating this principle leads to 'feature envy' (a code smell where one class excessively uses another's getters), duplicated validation logic, and procedural rather than object-oriented code. The principle reinforces encapsulation because the object's internal state and decision logic stay within the object. However, pure data objects (DTOs, value objects in DDD) are a legitimate exception where getters without behavior are appropriate.",
      followUps: [
        "How does the Law of Demeter complement Tell, Don't Ask?",
        "Are there cases where Ask is better than Tell?"
      ]
    },
    {
      q: "How do ECMAScript private fields (#) differ from TypeScript's private keyword?",
      a: "TypeScript's 'private' keyword is erased at compile time -- it provides no runtime protection. The compiled JavaScript has normal public properties. ECMAScript private fields (prefixed with #) are enforced at runtime by the JavaScript engine using a WeakMap-like mechanism: access to #field on an object that was not created by the class throws a TypeError. #fields are not visible via Object.keys(), JSON.stringify(), or for...in loops. They cannot be accessed or detected from outside the class, even via Proxy or prototype manipulation. The tradeoff: #fields have slightly more overhead due to runtime enforcement, and they cannot be used with some metaprogramming patterns. TypeScript supports both, and the recommendation is to use #fields when runtime privacy is needed.",
      followUps: [
        "Can you use both # and private on the same field?",
        "How do #private fields interact with subclasses?"
      ]
    },
    {
      q: "Explain how Java's module system (JPMS) provides encapsulation beyond access modifiers.",
      a: "Before JPMS, a public class was accessible to the entire world. Even private fields could be accessed via reflection with setAccessible(true). JPMS introduces module-level encapsulation: a module's module-info.java declares which packages are exported (accessible to other modules) and which are opened (accessible via reflection). Non-exported packages are 'strongly encapsulated' -- even public classes in those packages cannot be accessed from outside the module. The --add-opens flag provides an escape hatch for legacy code. This means a library can have public classes for internal organization without exposing them as API. Example: java.base module exports java.util but does not export sun.misc, making internal JDK classes inaccessible.",
      followUps: [
        "What is the difference between 'exports' and 'opens' in module-info.java?",
        "How does JPMS interact with Spring's dependency injection?"
      ]
    }
  ],

  followUps: [
    "How does encapsulation interact with testing -- should tests access private members?",
    "What is the relationship between encapsulation and the Single Responsibility Principle?",
    "How do functional programming languages achieve encapsulation without classes?",
    "What are the encapsulation implications of inheritance (the fragile base class problem)?",
    "How does aspect-oriented programming (AOP) affect encapsulation boundaries?",
    "What role does encapsulation play in API design and backward compatibility?"
  ],

  mcqs: [
    {
      q: "In Java, which access modifier allows access from the same package and subclasses in other packages?",
      options: ["public", "private", "protected", "default (package-private)"],
      answerIndex: 2,
      explanation: "protected allows access from the same package (like default) AND from subclasses in other packages. Default (package-private) only allows same-package access."
    },
    {
      q: "What does Python's double underscore prefix (__attr) actually do?",
      options: [
        "Makes the attribute completely inaccessible from outside",
        "Triggers name mangling to _ClassName__attr",
        "Raises a RuntimeError if accessed externally",
        "Encrypts the attribute value"
      ],
      answerIndex: 1,
      explanation: "Python's double underscore triggers name mangling: __attr becomes _ClassName__attr. It is still accessible via the mangled name. It was designed to prevent accidental name collisions in inheritance hierarchies, not for security."
    },
    {
      q: "Which C# access modifier restricts access to the same assembly AND subclasses only?",
      options: ["protected internal", "internal", "private protected", "protected"],
      answerIndex: 2,
      explanation: "private protected (added in C# 7.2) restricts access to subclasses within the same assembly. protected internal is the union (same assembly OR subclasses), while private protected is the intersection (same assembly AND subclasses)."
    },
    {
      q: "What is the primary benefit of the Pimpl idiom in C++?",
      options: [
        "It makes objects smaller in memory",
        "It provides compilation firewall and binary compatibility",
        "It enables multiple inheritance",
        "It replaces virtual functions"
      ],
      answerIndex: 1,
      explanation: "Pimpl hides implementation details in a source file, so changes to private members do not require recompilation of dependent code. It also maintains binary compatibility since the public class size (one pointer) never changes."
    },
    {
      q: "In TypeScript, what is the difference between 'private' and '#' (ECMAScript private fields)?",
      options: [
        "They are identical in behavior",
        "'private' is runtime-enforced; '#' is compile-time only",
        "'private' is compile-time only; '#' is runtime-enforced",
        "'#' is deprecated in favor of 'private'"
      ],
      answerIndex: 2,
      explanation: "TypeScript's 'private' keyword is erased at compile time -- the resulting JavaScript has no access restriction. ECMAScript '#' private fields are enforced by the JavaScript engine at runtime, providing true privacy."
    },
    {
      q: "Which principle states that a method should only interact with its immediate dependencies, not with objects returned by those dependencies?",
      options: [
        "Single Responsibility Principle",
        "Tell, Don't Ask",
        "Law of Demeter",
        "Open/Closed Principle"
      ],
      answerIndex: 2,
      explanation: "The Law of Demeter (principle of least knowledge) states that a method should only call methods on: itself, its parameters, objects it creates, and its direct components. Violating this (a.getB().getC().doSomething()) creates deep coupling chains."
    },
    {
      q: "In Rust, what does pub(crate) mean?",
      options: [
        "Public to the entire world",
        "Public only within the current crate",
        "Public only within the parent module",
        "Public only to friend crates"
      ],
      answerIndex: 1,
      explanation: "pub(crate) makes an item visible within the entire current crate but not to external crates. Rust also has pub(super) for parent-module visibility and pub(in path) for arbitrary ancestor modules."
    },
    {
      q: "What problem does defensive copying solve in Java?",
      options: [
        "Thread synchronization",
        "External modification of internal mutable state via returned references",
        "Stack overflow from deep recursion",
        "ClassCastException at runtime"
      ],
      answerIndex: 1,
      explanation: "When a getter returns a reference to a mutable internal collection, external code can modify it, violating encapsulation. Defensive copying returns a new copy, so modifications do not affect the original. Collections.unmodifiableList() provides a view that prevents modification."
    },
    {
      q: "In Go, how is encapsulation achieved?",
      options: [
        "Using private and public keywords",
        "Using access modifier annotations",
        "Capitalized identifiers are exported; lowercase are unexported",
        "Using the #private syntax"
      ],
      answerIndex: 2,
      explanation: "Go uses a simple convention: identifiers starting with an uppercase letter are exported (public), while lowercase identifiers are unexported (package-private). There are no other visibility levels."
    },
    {
      q: "Which of the following breaks encapsulation in Java?",
      options: [
        "Using private fields with public getters",
        "Using reflection with setAccessible(true) to access private fields",
        "Using protected access in a subclass",
        "Using an interface to define the public contract"
      ],
      answerIndex: 1,
      explanation: "setAccessible(true) bypasses Java's access modifier enforcement via reflection. While technically supported, it violates the class's encapsulation contract. Java's module system (JPMS) was partly designed to prevent this for strongly encapsulated packages."
    },
    {
      q: "What is 'feature envy' in the context of encapsulation?",
      options: [
        "A class that has too many features",
        "A method that excessively accesses data from another class instead of its own",
        "A class that envies the performance of another class",
        "A design pattern for adding features to existing classes"
      ],
      answerIndex: 1,
      explanation: "Feature envy is a code smell where a method uses multiple getters from another class to perform logic that should belong to that other class. It indicates broken encapsulation because behavior is separated from the data it operates on."
    },
    {
      q: "What does Java 9's module-info.java 'exports' directive do?",
      options: [
        "Makes all classes in the module public",
        "Specifies which packages are accessible to other modules",
        "Exports the module as a JAR file",
        "Makes private fields accessible via reflection"
      ],
      answerIndex: 1,
      explanation: "The 'exports' directive declares which packages are accessible to other modules. Non-exported packages are strongly encapsulated -- even public classes within them cannot be accessed from outside the module."
    }
  ],

  exercises: [
    "Design a BankAccount class in your language of choice that enforces the following invariants through encapsulation: balance can never be negative, every state change is logged to an audit trail, and the audit trail cannot be modified externally. Write tests proving the invariants hold.",
    "Refactor a class with 10+ public fields into a properly encapsulated class with validation. Identify which fields should be read-only, which need validation on write, and which should be computed properties.",
    "Implement the Pimpl idiom in C++ for a DatabaseConnection class. Measure compilation time with and without Pimpl when changing internal implementation details.",
    "Create a Python class using __slots__, @property, and name mangling. Demonstrate what can and cannot be accessed from outside the class, including through inheritance.",
    "Implement the revealing module pattern in JavaScript without using class syntax. Compare the encapsulation guarantees with ES2022 #private fields. Can reflection or proxies break either approach?",
    "Design a configuration manager in TypeScript that encapsulates sensitive values (API keys, connection strings). The public API should allow reading configuration but never expose raw secrets -- only allow using them through controlled methods (e.g., makeAuthenticatedRequest).",
    "Write a Rust module that exposes a public API for a priority queue but hides the internal heap implementation. Use pub, pub(crate), and private visibility to control access at different levels.",
    "Analyze an open-source library's API for encapsulation violations. Document at least 3 cases where internal details leak through the public API and propose fixes."
  ],

  flashcards: [
    { front: "What are the two aspects of encapsulation?", back: "Bundling (grouping data and behavior together) and Information Hiding (restricting access to implementation details). Encapsulation is the mechanism; information hiding is the principle." },
    { front: "What are Java's four access levels?", back: "public (everywhere), protected (same package + subclasses), default/package-private (same package), private (same class only). Note: there is no 'default' keyword -- omitting the modifier gives package-private access." },
    { front: "What does C#'s 'private protected' mean?", back: "Accessible only to subclasses within the same assembly. It is the intersection of 'private' (same assembly) and 'protected' (subclasses). Added in C# 7.2." },
    { front: "What is defensive copying?", back: "Returning a copy of internal mutable state (e.g., new ArrayList<>(list)) instead of a direct reference. Prevents external code from modifying the object's internal state. See Effective Java Item 50." },
    { front: "What is the Pimpl idiom?", back: "Pointer to Implementation -- a C++ technique where private members are moved to a separate implementation struct, and the public class holds only a unique_ptr to it. Provides compilation firewall and binary compatibility." },
    { front: "How does Python's name mangling work?", back: "__attribute becomes _ClassName__attribute. It prevents accidental name collisions in inheritance hierarchies, NOT security. The mangled name is still accessible." },
    { front: "What is the Law of Demeter?", back: "A method should only call methods on: (1) itself, (2) its parameters, (3) objects it creates, (4) its direct components. Violations look like a.getB().getC().doThing() -- train wreck anti-pattern." },
    { front: "How do ECMAScript #private fields work?", back: "Runtime-enforced privacy using a WeakMap-like mechanism. Accessing #field on the wrong object throws TypeError. Not visible via Object.keys(), JSON.stringify(), or for...in. Cannot be bypassed by reflection or Proxy." },
    { front: "What is 'Tell, Don't Ask'?", back: "Tell objects what to do (account.withdraw(amount)) instead of asking for data and acting externally (if account.getBalance() >= amount ...). Keeps behavior with data, reinforces encapsulation." },
    { front: "What is the feature envy code smell?", back: "A method that excessively uses getters from another class to perform logic. The logic should be moved to the class that owns the data, following Tell Don't Ask." },
    { front: "How does Go achieve encapsulation?", back: "Capitalized identifiers are exported (public), lowercase are unexported (package-private). No classes or access modifier keywords. Encapsulation boundary is the package." },
    { front: "What is Java's module system (JPMS) encapsulation?", back: "module-info.java declares 'exports' (packages accessible to others) and 'opens' (packages accessible via reflection). Non-exported public classes are strongly encapsulated -- even reflection cannot reach them without --add-opens." },
    { front: "What is the compilation firewall benefit of Pimpl?", back: "Changing private members in the Impl struct only recompiles the .cpp file, not all files that #include the header. In large codebases, this can reduce build times from hours to minutes." }
  ],

  revisionNotes: [
    "Encapsulation = bundling + information hiding. These are distinct concepts: a class with all public fields has bundling but no information hiding.",
    "Access modifiers are compile-time in C++, compile-time + runtime in Java/C#. Reflection can bypass them in Java (setAccessible) and C# (BindingFlags.NonPublic).",
    "Python uses conventions (_protected, __mangled) not enforcement. __slots__ prevents __dict__ creation and restricts attribute set.",
    "Properties (C#, Python, Kotlin, Swift) provide field-like syntax with method-like control. JIT compilers inline trivial properties -- no performance penalty.",
    "Defensive copies prevent external mutation of internal mutable state. Use Collections.unmodifiableList() or return immutable types.",
    "Pimpl idiom: compilation firewall + binary compatibility + true hiding. Cost: heap allocation + pointer indirection.",
    "ECMAScript #private fields are runtime-enforced. TypeScript 'private' is compile-time only and erased in JavaScript output.",
    "Law of Demeter: only talk to immediate friends. Violations create coupling chains that are brittle to change.",
    "Tell, Don't Ask: put behavior with data. Excessive getters indicate procedural code wearing an OOP costume.",
    "JPMS adds module-level encapsulation above packages. 'exports' controls compile-time access; 'opens' controls reflection access.",
    "Rust's default is private. pub(crate), pub(super), and pub(in path) provide fine-grained visibility without classes.",
    "Go uses capitalization for visibility: Exported vs unexported. The package is the encapsulation boundary."
  ],

  cheatSheet: [
    "Java: private > default (package) > protected (package + subclass) > public",
    "C#: private > private protected > internal > protected internal > public",
    "C++: private > protected > public | friend grants specific access",
    "Python: __mangled > _convention > public (no enforcement)",
    "TypeScript: private (compile-time) | #field (runtime) | protected | public",
    "Rust: private (default) > pub(super) > pub(crate) > pub",
    "Go: unexported (lowercase) > exported (Uppercase)",
    "Defensive copy: return new ArrayList<>(internal) or Collections.unmodifiableList()",
    "Pimpl: class Foo { struct Impl; unique_ptr<Impl> p; };",
    "C# property: public int X { get; private set; } or { get; init; }",
    "Python property: @property def x(self): return self._x",
    "Tell Don't Ask: object.doAction() not if (object.getState()) then act",
    "Law of Demeter: a.doX() ok | a.getB().doX() violation",
    "JPMS: exports pkg; (compile access) | opens pkg; (reflection access)",
    "Feature envy smell: method uses many getters from another class"
  ],

  resources: [
    { label: "Effective Java by Joshua Bloch", kind: "book", note: "Items 15-17 cover minimizing accessibility, using accessor methods, and minimizing mutability" },
    { label: "On the Criteria To Be Used in Decomposing Systems into Modules (Parnas, 1972)", kind: "paper", note: "The foundational paper on information hiding that motivated encapsulation in OOP" },
    { label: "Clean Code by Robert C. Martin", kind: "book", note: "Chapter 6 contrasts objects (encapsulated behavior) with data structures (exposed data)" },
    { label: "The Pragmatic Programmer by Hunt & Thomas", kind: "book", note: "Discusses decoupling and the Law of Demeter in the context of encapsulation" },
    { label: "Rust By Example - Visibility", kind: "docs", note: "Demonstrates Rust's module-level visibility system with pub, pub(crate), pub(super)" },
    { label: "MDN: Private class features", kind: "docs", note: "Comprehensive documentation on ECMAScript #private fields, methods, and static members" },
    { label: "C++ Core Guidelines C.133-C.139", kind: "docs", note: "Guidelines on encapsulation, access control, and the Pimpl idiom" },
    { label: "Python Descriptor HowTo Guide", kind: "docs", note: "Explains the descriptor protocol underlying @property, __get__, __set__, __delete__" },
    { label: "Java Platform Module System (JPMS) specification", kind: "docs", note: "Official specification for Java's module-level encapsulation system" },
    { label: "Refactoring by Martin Fowler", kind: "book", note: "Covers code smells related to broken encapsulation: Feature Envy, Inappropriate Intimacy, Message Chains" }
  ],

  glossary: [
    { term: "Encapsulation", definition: "The bundling of data and methods that operate on that data into a single unit, combined with restricting direct access to some components." },
    { term: "Information Hiding", definition: "The principle of concealing implementation details behind a stable interface, so that internal changes do not affect external consumers." },
    { term: "Access Modifier", definition: "A keyword (public, private, protected, internal) that specifies the visibility and accessibility of a class member." },
    { term: "Property", definition: "A language feature (C#, Python, Kotlin, Swift) that provides field-like syntax while executing getter/setter methods, enabling validation and computed values." },
    { term: "Defensive Copy", definition: "Creating and returning a copy of a mutable internal object to prevent external code from modifying the object's internal state." },
    { term: "Pimpl Idiom", definition: "Pointer to Implementation -- a C++ technique that hides private members in a separate compilation unit to provide compilation firewall and binary compatibility." },
    { term: "Name Mangling", definition: "Python's mechanism of transforming __attribute to _ClassName__attribute to prevent accidental name collisions in inheritance hierarchies." },
    { term: "Law of Demeter", definition: "The principle of least knowledge -- a method should only communicate with its immediate collaborators, not with objects obtained through those collaborators." },
    { term: "Tell, Don't Ask", definition: "A design principle stating that you should command objects to perform actions rather than querying their state and making decisions externally." },
    { term: "Feature Envy", definition: "A code smell where a method excessively accesses data from another class, indicating that the behavior should be moved to the class that owns the data." },
    { term: "Friend (C++)", definition: "A declaration that grants a specific function or class access to the private and protected members of the declaring class. Not inherited or transitive." },
    { term: "Compilation Firewall", definition: "A technique (like Pimpl) that prevents changes to implementation details from triggering recompilation of dependent code." },
    { term: "Strongly Encapsulated Package", definition: "In Java's module system, a package not listed in 'exports' or 'opens' directives, making its classes inaccessible from outside the module even via reflection." }
  ]
};
