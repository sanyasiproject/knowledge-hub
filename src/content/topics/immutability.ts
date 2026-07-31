import type { TopicContent } from "../types";

export const immutability: TopicContent = {
  quickSummary: [
    "Immutability means once a value is created, it cannot be changed. Instead of modifying data in place, you create new values with the desired changes, leaving the original intact.",
    "Immutable data eliminates entire classes of bugs: no race conditions from shared mutable state, no aliasing bugs, no unexpected mutation through references, no stale state after concurrent updates.",
    "Persistent data structures use structural sharing to make immutable updates efficient — when you 'modify' a tree, the new version shares most nodes with the old one, avoiding full copies.",
    "const/final/val prevent reassignment of the variable binding but do NOT make the value immutable — const obj = {x: 1}; obj.x = 2; is perfectly legal in JavaScript.",
  ],
  detailed: [
    "Immutability is a core principle of functional programming but has become mainstream across paradigms. In an immutable design, data structures are never modified after creation. Instead of changing a field, you create a copy with the new value. This might seem wasteful, but persistent data structures use structural sharing to make this efficient — typically O(log n) for updates instead of the O(n) a full copy would require.",
    "The distinction between const/final (binding immutability) and deep immutability is crucial. In JavaScript, const prevents reassigning the variable but the object it points to is fully mutable. Object.freeze() makes an object's own properties read-only but is shallow — nested objects remain mutable. True deep immutability requires recursive freezing or using a library like Immer.js or Immutable.js. In Java, final on a field prevents reassignment but the referred object can still be mutated; Java's unmodifiable collections (Collections.unmodifiableList) and the newer List.of() provide immutable collection interfaces.",
    "Immutability makes concurrent programming dramatically simpler. When data cannot change, there is no need for locks, mutexes, or atomic operations to protect shared state. Multiple threads can safely read the same immutable data simultaneously. This is why Erlang (all data is immutable), Clojure (persistent data structures by default), and Haskell (purity enforces immutability) excel at concurrent programming. Even in languages that allow mutation, adopting an immutable-first approach reduces the surface area for concurrency bugs.",
    "The copy-on-write (CoW) optimization sits between full mutability and full immutability. The system shares a single copy of data across all references, and only creates a separate copy when a reference attempts to modify it. Swift uses CoW for value types like Array and String. The Linux kernel uses CoW for memory pages during fork(). This gives the safety benefits of immutability (no aliasing bugs) with the performance of mutation in the common case where only one reference exists.",
    "Immutability enables powerful programming patterns. Time-travel debugging (Redux DevTools) works because each state is a separate immutable snapshot — you can replay any past state. Undo/redo is trivial — just keep a list of immutable states. Caching is safe because immutable values cannot become stale. Equality checking can use reference equality instead of deep comparison — if two references point to different objects, the values must be different (since values never change in place).",
  ],
  deepDive: [
    "Persistent data structures are the key technology that makes immutability practical. A persistent data structure preserves previous versions when modified. The most common implementation is the Hash Array Mapped Trie (HAMT), used by Clojure's vectors and maps, Scala's immutable collections, and Immutable.js. A HAMT is a 32-way branching trie where each node contains up to 32 entries. When you 'update' an element, you create new nodes only along the path from the root to the changed leaf — all other nodes are shared with the previous version. This gives O(log32 n) updates, which for practical sizes (under a billion elements) is effectively O(1) — at most 7 levels deep.",
    "Structural sharing is what makes persistent data structures memory-efficient. When you add an element to an immutable list of 1 million items, you do not copy 1 million items. You create a new root node that shares all but a few nodes with the old tree. The old version remains valid and accessible. In a balanced tree with branching factor 32, updating one element in a collection of 1 million items creates only about 4-5 new nodes (the path from root to leaf), sharing the remaining ~31,250 nodes. This means creating a new version costs O(log n) time and O(log n) additional memory.",
    "Value objects (DDD) are inherently immutable — they are defined by their attribute values, not by identity. Two Money objects with the same amount and currency are equal regardless of which instance they are. Value objects should always be immutable because their equality is based on their value — if you mutate one, all references to it see the change, which violates the value semantics. Java records (Java 16+), Kotlin data classes, and Python's @dataclass(frozen=True) provide language-level support for immutable value objects.",
    "The builder pattern solves the construction problem for immutable objects. Since immutable objects cannot be modified after creation, constructing one with many fields requires either a massive constructor (telescoping constructor anti-pattern) or a builder that accumulates values and creates the immutable object in one shot. Java's StringBuilder → String is the classic example. Lombok's @Builder and Kotlin's data class copy() method provide ergonomic alternatives. In functional languages, the equivalent is named parameters or record update syntax (Haskell's record { field = newValue }).",
    "Immutability has nuanced performance implications. Naive immutable updates (full copies) are O(n) and wasteful. Persistent data structures reduce this to O(log n). But even O(log n) is slower than O(1) in-place mutation, and persistent structures have higher constant factors due to indirection and allocation pressure. For hot inner loops processing millions of elements, mutable local state is often appropriate — the key is to keep mutation local and expose immutable interfaces. Clojure's transients provide this: temporarily mutable versions of persistent data structures for batch operations, converted back to persistent when done.",
  ],
  code: [
    {
      language: "typescript",
      caption: "const vs immutable, Object.freeze, and Immer.js",
      source: `// const prevents REASSIGNMENT, not MUTATION
const person = { name: "Alice", age: 30 };
// person = { name: "Bob" };  // ERROR: can't reassign const
person.age = 31;               // WORKS: object is mutable!

// Object.freeze — shallow immutability
const frozen = Object.freeze({ name: "Alice", address: { city: "NYC" } });
// frozen.name = "Bob";       // ERROR in strict mode, silently ignored otherwise
frozen.address.city = "LA";    // WORKS! Freeze is shallow

// Deep freeze utility
function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop];
    if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return obj;
}

// Immutable updates with spread operator
interface State {
  user: { name: string; prefs: { theme: string; lang: string } };
  items: string[];
}

const state: State = {
  user: { name: "Alice", prefs: { theme: "dark", lang: "en" } },
  items: ["a", "b"],
};

// Spread: verbose for nested updates
const newState: State = {
  ...state,
  user: {
    ...state.user,
    prefs: {
      ...state.user.prefs,
      theme: "light",  // only this changed
    },
  },
};

// Immer.js: write mutable-style code, get immutable updates
import { produce } from "immer";

const betterState = produce(state, draft => {
  draft.user.prefs.theme = "light";  // looks mutable, but creates new immutable state
  draft.items.push("c");
});

// state.user.prefs.theme is still "dark"
// betterState.user.prefs.theme is "light"
// state.items === betterState.items? No — items changed
// state.user.prefs.lang === betterState.user.prefs.lang? Yes — structural sharing`,
    },
    {
      language: "java",
      caption: "Immutable class design, records, and unmodifiable collections",
      source: `// Immutable class: all fields final, no setters, defensive copies
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        this.amount = amount;          // BigDecimal is immutable
        this.currency = currency;       // Currency is immutable
    }

    // No setters — return new instances instead
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money multiply(int factor) {
        return new Money(this.amount.multiply(BigDecimal.valueOf(factor)), this.currency);
    }

    public BigDecimal amount() { return amount; }
    public Currency currency() { return currency; }
}

// Java 16+ Record: immutable by default
public record Point(double x, double y) {
    // fields are final, constructor + getters + equals/hashCode auto-generated
    public Point translate(double dx, double dy) {
        return new Point(x + dx, y + dy);  // returns new Point
    }
}

// Immutable collections
var mutableList = new ArrayList<>(List.of("a", "b", "c"));
var immutableList = List.of("a", "b", "c");  // Java 9+
// immutableList.add("d");  // throws UnsupportedOperationException

var immutableCopy = List.copyOf(mutableList);  // defensive copy
mutableList.add("d");  // immutableCopy is NOT affected

// Unmodifiable wrapper (view, not copy — beware!)
var wrapper = Collections.unmodifiableList(mutableList);
mutableList.add("e");  // wrapper WILL see this change!
// Use List.copyOf() for true immutability

// Builder pattern for immutable objects
public final class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final byte[] body;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Map.copyOf(builder.headers);  // defensive copy
        this.body = builder.body != null ? builder.body.clone() : null;
    }

    public static class Builder {
        private String url;
        private String method = "GET";
        private final Map<String, String> headers = new HashMap<>();
        private byte[] body;

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String m) { this.method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public Builder body(byte[] b) { this.body = b; return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}`,
    },
    {
      language: "cpp",
      caption: "Immutable structs, const correctness, and copy-on-write patterns",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <memory>
#include <set>

// --- Mutable vs immutable ---
// std::vector is mutable by default
std::vector<int> mutable_vec = {1, 2, 3};
mutable_vec.push_back(4);  // mutates in place

// std::tuple is immutable once constructed
auto immutable_tuple = std::make_tuple(1, 2, 3);
// std::get<0>(immutable_tuple) = 99;  // compiles, but const tuple would prevent it
const auto frozen_tuple = std::make_tuple(1, 2, 3);
// std::get<0>(frozen_tuple) = 99;  // ERROR: const prevents modification

// --- Immutable struct: all fields const, return new instances ---
struct Point {
    const double x;
    const double y;

    Point(double x, double y) : x(x), y(y) {}

    // Cannot mutate fields -- return a new Point instead
    Point translate(double dx, double dy) const {
        return Point(x + dx, y + dy);
    }

    bool operator<(const Point& other) const {
        return std::tie(x, y) < std::tie(other.x, other.y);
    }

    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
};

Point p1(1.0, 2.0);
Point p2 = p1.translate(3.0, 4.0);  // p1 unchanged, p2 is (4.0, 6.0)

// Immutable structs can be used in sets (like frozen dataclasses)
std::set<Point> point_set = {p1, p2};

// --- Immutable update patterns ---
struct AppState {
    const std::string user;
    const int count;
    const std::vector<std::string> items;

    AppState(std::string user, int count, std::vector<std::string> items)
        : user(std::move(user)), count(count), items(std::move(items)) {}

    AppState increment() const {
        return AppState(user, count + 1, items);
    }

    AppState add_item(const std::string& item) const {
        auto new_items = items;  // copy
        new_items.push_back(item);
        return AppState(user, count, std::move(new_items));
    }
};

AppState state("alice", 0, {});
auto new_state = state.increment().add_item("task1");
// state.count is still 0; new_state.count is 1

// --- Copy-on-write using shared_ptr ---
template <typename T>
class CowVector {
    std::shared_ptr<std::vector<T>> data_;

public:
    CowVector() : data_(std::make_shared<std::vector<T>>()) {}
    CowVector(std::initializer_list<T> init)
        : data_(std::make_shared<std::vector<T>>(init)) {}

    // Read access: no copy needed
    const T& operator[](size_t i) const { return (*data_)[i]; }
    size_t size() const { return data_->size(); }

    // Write access: copy only if shared (use_count > 1)
    void push_back(const T& value) {
        if (data_.use_count() > 1) {
            data_ = std::make_shared<std::vector<T>>(*data_);  // copy on write
        }
        data_->push_back(value);
    }
};

CowVector<int> a = {1, 2, 3};
CowVector<int> b = a;       // shared -- no copy
b.push_back(4);             // triggers copy-on-write for b only
// a still has {1, 2, 3}; b has {1, 2, 3, 4}`,
    },
    {
      language: "clojure",
      caption: "Persistent data structures and structural sharing",
      source: `; Clojure: ALL data structures are immutable and persistent by default

; Vectors — persistent (structural sharing via HAMT)
(def v1 [1 2 3 4 5])
(def v2 (conj v1 6))       ; "add" 6 — returns new vector
; v1 is still [1 2 3 4 5]  — unchanged
; v2 is [1 2 3 4 5 6]      — shares structure with v1

; Maps — persistent hash maps
(def m1 {:name "Alice" :age 30 :city "NYC"})
(def m2 (assoc m1 :age 31))    ; "update" age — returns new map
(def m3 (dissoc m2 :city))     ; "remove" city — returns new map
; m1 still has :age 30 and :city "NYC"

; Nested updates with assoc-in and update-in
(def state {:user {:name "Alice" :prefs {:theme "dark"}}
            :items ["a" "b"]})

(def new-state
  (-> state
      (assoc-in [:user :prefs :theme] "light")   ; nested update
      (update :items conj "c")))                  ; add item

; Transients: temporarily mutable for batch operations
(defn build-large-vector [n]
  (persistent!                          ; convert back to persistent
    (reduce (fn [tv i]
              (conj! tv i))             ; mutable conj!
            (transient [])              ; start with transient
            (range n))))
; 10x faster than persistent conj for large batches

; Atoms: managed mutable references to immutable values
(def counter (atom 0))
(swap! counter inc)          ; atomically update: old-value → (inc old-value)
(swap! counter + 10)         ; atomically add 10
@counter                     ; deref to read current value

; Atoms enforce immutability of the VALUE while allowing the REFERENCE to change
; The value inside the atom is always an immutable persistent data structure
; swap! retries automatically on contention — no locks needed

; Structural sharing in action:
(def big-map (into {} (map (fn [i] [i (* i i)]) (range 1000000))))
(def big-map-2 (assoc big-map 42 9999))
; big-map-2 shares ~99.9998% of its nodes with big-map
; Only ~6 new nodes created (path from root to leaf in 32-way trie)`,
    },
    {
      language: "rust",
      caption: "Ownership, borrowing, and immutability by default",
      source: `// Rust: variables are immutable by default
fn main() {
    let x = 5;
    // x = 6;  // ERROR: cannot assign twice to immutable variable

    let mut y = 5;  // explicitly opt into mutability
    y = 6;           // OK

    // Immutable references prevent mutation through aliases
    let data = vec![1, 2, 3];
    let r1 = &data;  // immutable borrow
    let r2 = &data;  // multiple immutable borrows OK
    // let r3 = &mut data;  // ERROR: can't borrow mutably while immutably borrowed

    // This prevents data races at COMPILE TIME

    // Immutable structs
    #[derive(Debug, Clone)]
    struct Point {
        x: f64,
        y: f64,
    }

    impl Point {
        // Methods that return new instances instead of mutating
        fn translate(&self, dx: f64, dy: f64) -> Point {
            Point { x: self.x + dx, y: self.y + dy }
        }

        fn scale(&self, factor: f64) -> Point {
            Point { x: self.x * factor, y: self.y * factor }
        }
    }

    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1.translate(3.0, 4.0);  // p1 unchanged

    // Copy-on-write with Cow<T>
    use std::borrow::Cow;

    fn process(input: &str) -> Cow<str> {
        if input.contains("bad") {
            // Only allocate a new String if modification is needed
            Cow::Owned(input.replace("bad", "good"))
        } else {
            // No allocation — just borrow the input
            Cow::Borrowed(input)
        }
    }

    let clean = process("hello");        // Borrowed — zero allocation
    let fixed = process("bad word");     // Owned — allocated new String

    // Arc for shared immutable data across threads
    use std::sync::Arc;
    use std::thread;

    let shared_data = Arc::new(vec![1, 2, 3, 4, 5]);

    let handles: Vec<_> = (0..4).map(|i| {
        let data = Arc::clone(&shared_data);  // cheap reference count increment
        thread::spawn(move || {
            // Multiple threads safely read shared immutable data
            println!("Thread {}: sum = {}", i, data.iter().sum::<i32>());
        })
    }).collect();

    for h in handles { h.join().unwrap(); }
    // No locks needed — data is immutable
}`,
    },
  ],
  diagrams: [
    {
      title: "Structural Sharing in Persistent Data Structures",
      kind: "architecture",
      caption: "When updating one element in a persistent tree, only the path from root to the changed leaf is copied. All other nodes are shared between old and new versions.",
    },
    {
      title: "const/final vs True Immutability",
      kind: "flow",
      caption: "const/final freezes the binding (variable cannot be reassigned). Deep immutability freezes the value (object properties cannot be changed). They are independent concepts.",
    },
    {
      title: "Copy-on-Write Lifecycle",
      kind: "state",
      caption: "State transitions: Shared (multiple references, no copies) → Write attempted → Copy created for the writer → Writer mutates its copy, other references unaffected.",
    },
  ],
  animations: [
    {
      title: "Persistent Vector Update with Structural Sharing",
      steps: [
        { label: "Original tree", detail: "A 32-way branching trie with root R, internal nodes A/B/C, and leaf nodes containing data elements. Vector has 1000 elements, tree depth is 2." },
        { label: "Update element at index 42", detail: "Locate the path from root R to the leaf containing index 42: R → A → leaf. This path has 3 nodes." },
        { label: "Create new path", detail: "Copy only the 3 nodes on the path: new root R', new node A', new leaf with updated value. All other nodes (B, C, other leaves) are shared." },
        { label: "Two versions coexist", detail: "Old root R still points to the old tree (original value). New root R' points to the new tree (updated value). They share ~97% of nodes." },
      ],
    },
    {
      title: "Redux Time-Travel Debugging",
      steps: [
        { label: "Action dispatched", detail: "User clicks 'Add Item'. Redux reducer receives current state (immutable) and the action." },
        { label: "New state created", detail: "Reducer returns a new state object. Previous state is not modified. Both states exist in memory." },
        { label: "State history accumulates", detail: "After 10 actions, there are 10 immutable state snapshots. Each shares structure with the previous one via Immer." },
        { label: "Time travel", detail: "Developer clicks 'step back' in DevTools. The app renders state snapshot #7. No recalculation needed — the state is already there, unchanged." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Mutable", "Immutable (naive copy)", "Immutable (persistent)"],
    rows: [
      ["Update cost", "O(1) in-place", "O(n) full copy", "O(log n) path copy"],
      ["Memory per version", "N/A — one version", "O(n) per version", "O(log n) per version (shared)"],
      ["Thread safety", "Requires locks/atomics", "Inherently safe", "Inherently safe"],
      ["Aliasing bugs", "Possible — shared references", "Impossible — separate copies", "Impossible — immutable"],
      ["Equality check", "Deep comparison O(n)", "Deep comparison O(n)", "Reference equality O(1) when unchanged"],
      ["Undo/redo", "Complex — save/restore state", "Simple — keep old copies", "Efficient — structural sharing"],
      ["Cache safety", "Risk of stale data", "Safe — cannot change", "Safe — cannot change"],
      ["GC pressure", "Low — reuse objects", "High — many copies", "Moderate — shared nodes"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between const and immutability?",
      a: "const/final prevents reassigning the variable binding — you cannot point the variable to a different value. Immutability means the value itself cannot be changed. In JavaScript, const obj = {x: 1}; obj.x = 2; is legal because const only freezes the binding, not the object. For true immutability, you need Object.freeze() (shallow), deep freezing, or libraries like Immer.js. In Java, final List<String> list = new ArrayList<>(); list.add('x'); compiles fine — final prevents reassigning 'list' but the ArrayList is fully mutable.",
      followUps: [
        "How do you achieve deep immutability in JavaScript?",
        "What is the difference between Collections.unmodifiableList and List.of in Java?",
      ],
    },
    {
      q: "What are persistent data structures and why do they matter?",
      a: "Persistent data structures preserve previous versions when modified. Instead of updating in place, they create a new version that shares most of its structure with the old one (structural sharing). This makes immutable updates efficient — O(log n) instead of O(n) for a full copy. Clojure's vectors and maps use Hash Array Mapped Tries (HAMTs) with a branching factor of 32, giving effectively O(1) updates for practical collection sizes. They matter because they make immutability performant enough for real-world use.",
      followUps: [
        "What is a HAMT and how does it achieve structural sharing?",
        "What are Clojure transients and when would you use them?",
      ],
    },
    {
      q: "How does immutability help with concurrency?",
      a: "Immutable data cannot be modified, so there is no shared mutable state to protect. Multiple threads can safely read the same immutable data simultaneously without locks, mutexes, or atomic operations. There are no data races because data races require at least one write — and immutable data is never written after creation. This is why functional languages like Erlang and Clojure excel at concurrency and why libraries like Immutable.js are popular in concurrent/async JavaScript applications.",
    },
    {
      q: "What is copy-on-write and where is it used?",
      a: "Copy-on-write (CoW) shares a single copy of data across all references and only creates a separate copy when someone attempts to modify it. This gives the safety of immutability with the performance of mutation in the common case where data is read more often than written. Swift uses CoW for value types (Array, String, Dictionary). The Linux kernel uses CoW for memory pages during fork(). Rust's Cow<T> type provides this explicitly — it borrows data when read-only and clones only when mutation is needed.",
      followUps: [
        "What is the performance tradeoff of copy-on-write?",
        "How does Swift implement CoW for its value types?",
      ],
    },
    {
      q: "How does Immer.js work?",
      a: "Immer lets you write mutable-style code that produces immutable updates. You call produce(currentState, draft => { ... }) where the draft is a Proxy of the current state. Inside the callback, you mutate the draft freely. Immer tracks which parts of the draft were modified, and produces a new immutable state that shares unchanged subtrees with the original (structural sharing). This gives the ergonomics of mutation with the correctness guarantees of immutability. It is the foundation of Redux Toolkit's state management.",
    },
    {
      q: "What is a value object and why should it be immutable?",
      a: "A value object (from DDD) is defined by its attributes rather than its identity. Two Money objects with the same amount and currency are equal even if they are different instances. Value objects should be immutable because their equality depends on their values — if you mutate one, the equality contract breaks. Java records, Kotlin data classes, and Python's frozen dataclasses provide language support for immutable value objects.",
    },
    {
      q: "When should you NOT use immutability?",
      a: "In performance-critical inner loops processing millions of elements, mutable local state is often significantly faster. Persistent data structures have higher constant factors than arrays due to indirection and allocation pressure. For local computation within a function (not shared across threads or returned), mutation is safe and efficient. Clojure addresses this with transients — temporarily mutable persistent structures for batch operations. The guideline: use immutability at boundaries (APIs, shared state, function returns) and allow local mutation inside tight loops.",
    },
  ],
  followUps: [
    "Pure Functions & Side Effects — immutability is the data complement of function purity",
    "Concurrency & Thread Safety — immutable data eliminates data races without locks",
    "Functional Programming Fundamentals — immutability as a core FP principle",
    "React State Management — Redux, Immer, and immutable state in UI frameworks",
    "Domain-Driven Design — value objects, aggregates, and immutable domain models",
    "Data Structures — tries, HAMTs, and persistent data structure implementations",
  ],
  mcqs: [
    {
      q: "What does const in JavaScript guarantee?",
      options: [
        "The variable and all nested properties are immutable",
        "The variable binding cannot be reassigned, but the value may be mutated",
        "The value is deeply frozen and cannot be modified",
        "The variable is available only in the current block scope",
      ],
      answerIndex: 1,
      explanation: "const only prevents reassignment of the binding. const obj = {x: 1}; obj.x = 2; is legal. For immutability, use Object.freeze() or a library like Immer.",
    },
    {
      q: "What is structural sharing in persistent data structures?",
      options: [
        "Sharing the same data structure across multiple modules",
        "Reusing unchanged subtrees between old and new versions of a data structure",
        "Using the same class definition for multiple instances",
        "Sharing data between threads using shared memory",
      ],
      answerIndex: 1,
      explanation: "When a persistent data structure is updated, only the path from root to the changed node is copied. All other nodes are shared between the old and new versions, making updates O(log n) in space and time.",
    },
    {
      q: "Why is immutable data inherently thread-safe?",
      options: [
        "Immutable data uses internal locks automatically",
        "The JVM optimizes immutable data for concurrent access",
        "Data races require at least one write, and immutable data is never written after creation",
        "Immutable data is stored in a special thread-safe memory region",
      ],
      answerIndex: 2,
      explanation: "Data races occur when two threads access the same data concurrently and at least one is writing. Since immutable data is never modified after creation, concurrent reads are always safe — no writes means no races.",
    },
    {
      q: "What is copy-on-write?",
      options: [
        "Always copying data before reading it",
        "Sharing data across references and only copying when a modification is attempted",
        "Writing data to disk before modifying it in memory",
        "Creating a backup copy of every variable at creation time",
      ],
      answerIndex: 1,
      explanation: "Copy-on-write shares a single copy across all references. A separate copy is created only when a reference tries to modify the data. This combines the safety of immutability with the performance of sharing for read-heavy workloads.",
    },
    {
      q: "How does Immer.js produce immutable state from mutable-style code?",
      options: [
        "It deep-copies the entire state on every change",
        "It uses Proxy objects to track mutations on a draft and produces a new state with structural sharing",
        "It compiles the mutable code into immutable operations",
        "It freezes all objects before passing them to the callback",
      ],
      answerIndex: 1,
      explanation: "Immer creates a Proxy-based draft of the state. Mutations to the draft are tracked. When the produce callback finishes, Immer creates a new immutable state sharing unchanged subtrees with the original.",
    },
    {
      q: "What is a Clojure transient and when would you use it?",
      options: [
        "A garbage-collected reference that expires after use",
        "A temporarily mutable version of a persistent data structure for batch operations",
        "A short-lived variable that is automatically freed",
        "A data structure that exists only during compilation",
      ],
      answerIndex: 1,
      explanation: "Transients allow batch mutations on a persistent data structure for performance. You convert to transient, perform many mutations efficiently, then convert back to persistent. Used when building large collections in a loop.",
    },
  ],
  exercises: [
    "Implement an immutable LinkedList in TypeScript with methods prepend(value), head(), tail(), and map(fn). Each operation should return a new list, sharing structure with the original where possible.",
    "Build a simple Redux-like state manager: create a store that holds immutable state, accepts reducer functions (old state + action → new state), and keeps a history of all past states for time-travel debugging.",
    "Implement a copy-on-write wrapper class in Python that wraps a list. Multiple wrappers can share the same underlying list. When any wrapper attempts to modify the list, it creates a private copy first.",
    "Create an immutable Config class in Java using the builder pattern. The config should have 8+ fields, be deeply immutable (defensive copies for collections), and support a toBuilder() method for creating modified copies.",
    "Compare the performance of mutable updates vs persistent data structure updates in a language of your choice. Create a benchmark that performs 1 million insertions into (a) a mutable HashMap and (b) an immutable persistent map. Measure time and memory.",
  ],
  flashcards: [
    { front: "What is the difference between const/final and immutability?", back: "const/final prevents variable reassignment (binding immutability). Immutability prevents the value itself from being changed. const obj = {x:1}; obj.x = 2; is legal — the binding is const but the value is mutable." },
    { front: "What is structural sharing?", back: "When updating a persistent data structure, only the changed path is copied. All unchanged nodes are shared between old and new versions. This makes immutable updates O(log n) instead of O(n)." },
    { front: "What is a HAMT?", back: "Hash Array Mapped Trie — a 32-way branching trie used to implement persistent vectors and maps (Clojure, Scala, Immutable.js). Provides effectively O(1) updates for practical sizes (at most 7 levels deep for billions of elements)." },
    { front: "Why is immutable data thread-safe?", back: "Data races require at least one write. Immutable data is never written after creation, so concurrent reads are always safe. No locks, mutexes, or atomics needed." },
    { front: "What is copy-on-write?", back: "Share one copy of data across all references. Only create a separate copy when someone tries to modify it. Used by Swift (Array, String), Linux kernel (fork), and Rust (Cow<T>)." },
    { front: "How does Immer.js work?", back: "Creates a Proxy-based draft of state. You mutate the draft in a callback. Immer tracks changes and produces a new immutable state with structural sharing. Foundation of Redux Toolkit." },
    { front: "What is a value object?", back: "An object defined by its attribute values, not identity. Two Money(10, USD) are equal regardless of instance. Should always be immutable because equality depends on values." },
    { front: "What are Clojure transients?", back: "Temporarily mutable versions of persistent data structures for batch operations. Use transient! to start, conj!/assoc! for mutations, persistent! to convert back. ~10x faster for bulk building." },
  ],
  revisionNotes: [
    "const/final = binding immutability (cannot reassign). Object.freeze / List.of = value immutability (cannot modify). They are independent.",
    "Persistent data structures use structural sharing to make immutable updates O(log n) time and space, not O(n) full copies.",
    "HAMT (32-way trie): the workhorse of persistent collections. At most 7 levels for billions of elements. Effectively O(1) updates.",
    "Immutable data is inherently thread-safe: no writes after creation = no data races = no locks needed.",
    "Copy-on-write: share until modification, then copy. Swift value types, Linux fork(), Rust Cow<T>.",
    "Immer.js: Proxy-based draft tracking → structural sharing → mutable ergonomics with immutable guarantees.",
    "Use immutability at boundaries (APIs, shared state). Allow local mutation in tight loops for performance. Clojure transients bridge the gap.",
  ],
  cheatSheet: [
    "const/final ≠ immutable — const freezes the binding, not the value",
    "Object.freeze() is shallow — use deepFreeze or Immer for nested objects",
    "Java: List.of() = truly immutable | Collections.unmodifiableList() = just a view, source can change",
    "Persistent data structures: O(log n) updates via structural sharing, not O(n) full copies",
    "Immutable → thread-safe for free (no locks), safe to cache, safe to share",
    "Immer produce(state, draft => { mutate draft }) → new immutable state with structural sharing",
    "Value objects (DDD) should always be immutable — equality is by value, not identity",
    "Clojure transients: persistent! / transient! for fast batch operations on persistent collections",
  ],
  resources: [
    { label: "Clojure Reference — Persistent Data Structures", kind: "docs", note: "Official documentation on Clojure's immutable vectors, maps, and sets including HAMTs and transients." },
    { label: "Immer.js Documentation", kind: "docs", note: "Official guide to Immer — Proxy-based immutable state management that powers Redux Toolkit." },
    { label: "Purely Functional Data Structures — Chris Okasaki", kind: "book", note: "The foundational academic text on persistent data structures, covering amortized analysis and lazy evaluation." },
    { label: "Effective Java, Item 17: Minimize Mutability", kind: "book", note: "Joshua Bloch's guidance on designing immutable classes in Java, including defensive copying and the builder pattern." },
    { label: "Rich Hickey — The Value of Values (talk)", kind: "video", note: "Clojure creator's influential talk on why immutable values are superior to mutable objects for information systems." },
    { label: "Understanding Clojure's Persistent Vectors — Jean Niklas L'orange", kind: "article", note: "Deep dive into the HAMT implementation underlying Clojure's persistent vectors, with diagrams." },
  ],
  glossary: [
    { term: "Immutability", definition: "The property of data that cannot be changed after creation. Updates produce new values rather than modifying existing ones." },
    { term: "Persistent Data Structure", definition: "A data structure that preserves previous versions when modified, using structural sharing to avoid full copies." },
    { term: "Structural Sharing", definition: "Reusing unchanged parts of a data structure between versions. Only the modified path is copied; everything else is shared." },
    { term: "HAMT", definition: "Hash Array Mapped Trie — a 32-way branching trie used to implement persistent maps and vectors with near-constant-time operations." },
    { term: "Copy-on-Write", definition: "Sharing data across references and creating a separate copy only when modification is attempted." },
    { term: "Value Object", definition: "An object defined by its attribute values (not identity). Two instances with the same values are equal. Should be immutable." },
    { term: "Transient", definition: "A temporarily mutable version of a persistent data structure (Clojure), used for efficient batch operations before converting back to persistent." },
    { term: "Defensive Copy", definition: "Creating a copy of mutable data when accepting it into or returning it from an immutable object, preventing external mutation of internal state." },
  ],
};
