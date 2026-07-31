import type { TopicContent } from "../types";

export const inheritance: TopicContent = {
  quickSummary: [
    "Inheritance is an OOP mechanism where a class (subclass/derived/child) acquires the properties and behaviors of another class (superclass/base/parent), enabling code reuse and establishing an 'is-a' relationship.",
    "Types of inheritance: single (one parent), multilevel (chain of parents), hierarchical (multiple children from one parent), multiple (multiple parents -- supported in C++/Python, not Java/C#), and hybrid (combination).",
    "The Diamond Problem occurs in multiple inheritance when a class inherits from two classes that share a common ancestor, creating ambiguity about which version of inherited members to use. C++ solves it with virtual inheritance; Python uses C3 linearization (MRO).",
    "Composition over inheritance: the GoF principle that favoring object composition (has-a) over class inheritance (is-a) leads to more flexible, less coupled designs. Inheritance creates tight coupling between parent and child; composition allows runtime flexibility.",
    "Prototypal inheritance (JavaScript) differs fundamentally from classical inheritance -- objects inherit directly from other objects through a prototype chain, without classes serving as blueprints."
  ],

  detailed: [
    "## Single Inheritance\n\nThe simplest form: one class extends exactly one parent. Java, C#, Kotlin, and Swift enforce single inheritance for classes. The subclass inherits all non-private members and can override methods (virtual by default in Java, opt-in with `virtual` in C#/C++). The Liskov Substitution Principle (LSP) states that a subclass instance must be usable wherever a superclass instance is expected without altering program correctness. Violations of LSP (e.g., Square extending Rectangle where setWidth breaks invariants) indicate that inheritance is the wrong abstraction.",

    "## Multiple Inheritance and the Diamond Problem\n\nMultiple inheritance allows a class to inherit from more than one parent. C++ supports it directly; Python supports it; Java/C#/Swift/Kotlin do not (for classes, though they allow multiple interface implementation). The Diamond Problem: class D inherits from B and C, both of which inherit from A. Which version of A's members does D get? Without resolution: (1) ambiguous method calls, (2) duplicated state from A. C++ solves this with `virtual` inheritance (single shared instance of A). Python uses C3 linearization to create a deterministic Method Resolution Order (MRO). Java avoids the problem entirely by allowing only single class inheritance.",

    "## Method Resolution Order (MRO) and C3 Linearization\n\nPython's MRO determines the order in which base classes are searched when looking up a method. C3 linearization (used since Python 2.3) produces a consistent, monotonic ordering that respects: (1) subclass before superclass, (2) the order in which base classes are listed, (3) if two classes are in the MRO, their relative order from any inheritance list is preserved. The algorithm: L(C) = C + merge(L(B1), L(B2), ..., [B1, B2, ...]). 'merge' repeatedly takes the first element of the first list that does not appear in the tail of any other list. If no such element exists, the hierarchy is inconsistent and Python raises TypeError.",

    "## Mixins and Traits\n\nMixins are classes designed to provide specific functionality to other classes through multiple inheritance, without standing alone. They differ from abstract classes: mixins provide concrete implementations of cross-cutting concerns (serialization, logging, comparison). Ruby has explicit `include Module` mixins. Python uses multiple inheritance with mixin classes (by convention, named `XxxMixin`). Scala and PHP have traits -- similar to mixins but with conflict resolution rules. TypeScript achieves mixin-like behavior through declaration merging and helper functions. Java 8+ default methods on interfaces serve a similar role.",

    "## Prototypal Inheritance in JavaScript\n\nJavaScript's inheritance is fundamentally different from classical OOP. Objects inherit directly from other objects through the prototype chain. Every object has an internal `[[Prototype]]` link (accessible via `Object.getPrototypeOf()` or the deprecated `__proto__`). Property lookup walks up the chain: if an object does not have a property, its prototype is checked, then the prototype's prototype, up to `Object.prototype` (whose prototype is `null`). `Object.create(proto)` creates an object with the specified prototype. ES6 `class` syntax is syntactic sugar over this prototype mechanism -- there are no true classes. Constructor functions + `prototype` property were the pre-ES6 pattern.",

    "## Inheritance Anti-Patterns and Composition\n\nThe Fragile Base Class Problem: changes to a base class can unexpectedly break subclasses. Java's `Stack` extends `Vector`, exposing vector methods that violate stack semantics. The Gorilla-Banana Problem (Joe Armstrong): 'you wanted a banana but you got a gorilla holding the banana and the entire jungle' -- inheritance drags in unwanted dependencies. The Circle-Ellipse Problem: mathematical subtyping (circle is-a ellipse) conflicts with behavioral subtyping (setting width on a circle must also set height). Composition solves these: instead of inheriting behavior, hold a reference to an object that provides it. Strategy, Decorator, and Delegate patterns all use composition."
  ],

  deepDive: [
    "## Virtual Inheritance in C++ -- Memory Layout\n\nWithout virtual inheritance, diamond inheritance duplicates the base class: if D inherits from B and C, both inheriting from A, D contains two copies of A's data members. Virtual inheritance (`class B : virtual public A`) ensures a single shared instance of A. This changes the memory layout: instead of A's data being at a fixed offset from B or C, a virtual base pointer (vptr) in each intermediate class points to the shared A instance. The constructor of the most-derived class (D) is responsible for initializing the virtual base (A), not B or C. This has performance implications: accessing virtual base members requires an extra pointer dereference, and the object layout is more complex.",

    "## C3 Linearization Algorithm in Detail\n\nGiven: class D(B, C), class B(A), class C(A).\nL(A) = [A]\nL(B) = B + merge(L(A), [A]) = B + merge([A], [A]) = [B, A]\nL(C) = C + merge(L(A), [A]) = [C, A]\nL(D) = D + merge(L(B), L(C), [B, C])\n     = D + merge([B, A], [C, A], [B, C])\n     Take B (head of first list, not in tail of any): [D, B]\n     merge([A], [C, A], [C])\n     Take C (A is in tail of [C, A], so skip; C is head of third, not in tail of any): [D, B, C]\n     merge([A], [A], [])\n     Take A: [D, B, C, A]\n\nFinal MRO: D -> B -> C -> A. This is monotonic: the relative order from any single inheritance list is preserved. If linearization fails (contradictory orderings), Python raises TypeError.",

    "## Prototype Chain Internals in V8\n\nV8 optimizes prototype chain lookups through hidden classes (Maps) and inline caches. Each object has a hidden class that describes its shape (property names, types, offsets). When a property is not found on the object itself, V8 follows the `[[Prototype]]` chain. For frequently accessed prototype properties, V8 installs inline caches that directly point to the property's location, bypassing the chain walk. The `Object.create(null)` idiom creates objects with no prototype, used for dictionary-like lookups (no inherited Object.prototype methods like toString). Modifying an object's prototype at runtime (`Object.setPrototypeOf()`) invalidates optimization assumptions and causes deoptimization.",

    "## Method Overriding Mechanics: vtables and vptrs\n\nIn C++, when a class has virtual methods, the compiler generates a vtable (virtual method table) -- an array of function pointers, one per virtual method. Each object instance contains a vptr (pointer to its class's vtable). When a virtual method is called through a base pointer, the runtime: (1) reads the vptr from the object, (2) indexes into the vtable at the method's slot, (3) calls the function pointer. When a derived class overrides a virtual method, its vtable entry at that slot points to the derived implementation. This mechanism enables runtime polymorphism. Java uses a similar mechanism (method dispatch table) but all non-static, non-final methods are virtual by default. C# requires explicit `virtual`/`override` keywords.",

    "## Sealed/Final Classes and Performance\n\nMarking a class as `final` (Java), `sealed` (C#/Kotlin), or `final` (C++) prevents inheritance. This enables the compiler to devirtualize method calls: if no subclass can exist, virtual dispatch is unnecessary. HotSpot JVM performs Class Hierarchy Analysis (CHA) to detect effectively-final classes (no loaded subclass). Kotlin's classes are final by default -- you must explicitly declare `open` to allow inheritance. This design choice reflects the principle that inheritance should be designed for explicitly, not enabled by accident. Effective Java Item 19: 'Design and document for inheritance or else prohibit it.'",

    "## Inheritance and Serialization/ORM Complexities\n\nInheritance hierarchies create complexities for persistence: (1) Single Table Inheritance (STI): all subclass fields in one table with a discriminator column -- wastes space, but simple queries. (2) Table Per Class: each concrete class gets its own table -- no wasted space, but polymorphic queries require UNION. (3) Table Per Hierarchy (JPA @Inheritance JOINED): base class in one table, subclass-specific fields in separate tables joined by primary key -- normalized but requires JOINs. ORMs must handle this mapping (JPA @Inheritance, Django model inheritance). Serialization frameworks (Jackson) need @JsonTypeInfo to include type discriminators. Deep hierarchies create particularly complex persistence strategies."
  ],

  code: [
    {
      language: "java",
      caption: "Java single inheritance with method overriding and super delegation",
      source: `public abstract class Shape {
    private final String color;

    protected Shape(String color) {
        this.color = Objects.requireNonNull(color);
    }

    public String getColor() { return color; }

    // Template method: defines algorithm skeleton
    public final String describe() {
        return String.format("%s %s (area=%.2f, perimeter=%.2f)",
            color, getClass().getSimpleName(), area(), perimeter());
    }

    public abstract double area();
    public abstract double perimeter();
}

public class Circle extends Shape {
    private final double radius;

    public Circle(String color, double radius) {
        super(color);  // Must call superclass constructor
        if (radius <= 0) throw new IllegalArgumentException("Radius must be positive");
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }
}

// Multilevel inheritance
public class Cylinder extends Circle {
    private final double height;

    public Cylinder(String color, double radius, double height) {
        super(color, radius);
        this.height = height;
    }

    @Override
    public double area() {
        // Surface area: 2 * base area + lateral area
        return 2 * super.area() + perimeter() * height;
    }

    // perimeter() inherited from Circle -- circumference of base

    public double volume() {
        return super.area() * height;  // base area * height
    }
}

// Usage demonstrating Liskov Substitution Principle
List<Shape> shapes = List.of(
    new Circle("red", 5),
    new Cylinder("blue", 3, 10)
);
for (Shape s : shapes) {
    System.out.println(s.describe());  // Polymorphic call
}`
    },
    {
      language: "cpp",
      caption: "C++ multiple inheritance with mixins and virtual dispatch",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// Base classes for multiple inheritance
class Animal {
protected:
    std::string name_;
public:
    Animal(const std::string& name) : name_(name) {
        std::cout << "Animal(" << name << ")\\n";
    }
    virtual ~Animal() = default;

    virtual std::string speak() const {
        return name_ + " makes a sound";
    }
};

class Flyable {
protected:
    double max_altitude_;
public:
    Flyable(double max_altitude = 1000.0) : max_altitude_(max_altitude) {
        std::cout << "Flyable(max_altitude=" << max_altitude << ")\\n";
    }
    virtual ~Flyable() = default;

    std::string fly() const {
        return "Flying up to " + std::to_string(max_altitude_) + "m";
    }
};

class Swimmable {
protected:
    double max_depth_;
public:
    Swimmable(double max_depth = 50.0) : max_depth_(max_depth) {
        std::cout << "Swimmable(max_depth=" << max_depth << ")\\n";
    }
    virtual ~Swimmable() = default;

    std::string swim() const {
        return "Swimming down to " + std::to_string(max_depth_) + "m";
    }
};

// Multiple inheritance -- Duck inherits from all three
class Duck : public Animal, public Flyable, public Swimmable {
public:
    Duck(const std::string& name)
        : Animal(name), Flyable(500.0), Swimmable(10.0) {}

    std::string speak() const override {
        return name_ + " says Quack!";
    }
};

// --- Mixin pattern using CRTP (Curiously Recurring Template Pattern) ---
template <typename Derived>
class LoggableMixin {
    std::vector<std::string> log_;
public:
    void log(const std::string& message) {
        log_.push_back(message);
    }
    const std::vector<std::string>& get_log() const { return log_; }
};

template <typename Derived>
class SerializableMixin {
public:
    // Derived class must implement serialize()
    std::string to_string() const {
        return static_cast<const Derived*>(this)->serialize();
    }
};

// User class composing mixins via multiple inheritance + CRTP
class User : public LoggableMixin<User>, public SerializableMixin<User> {
public:
    std::string name;
    std::string email;

    User(const std::string& name, const std::string& email)
        : name(name), email(email) {}

    std::string serialize() const {
        return "{ name: " + name + ", email: " + email + " }";
    }
};

int main() {
    Duck duck("Donald");
    std::cout << duck.speak() << "\\n";   // Donald says Quack!
    std::cout << duck.fly() << "\\n";     // Flying up to 500m
    std::cout << duck.swim() << "\\n";    // Swimming down to 10m

    User user("Alice", "alice@example.com");
    user.log("Created");
    std::cout << user.to_string() << "\\n";
    // { name: Alice, email: alice@example.com }
    return 0;
}`
    },
    {
      language: "cpp",
      caption: "C++ diamond problem with virtual inheritance",
      source: `#include <iostream>
#include <string>

// Base class
class Device {
    std::string serial_number;
public:
    Device(std::string sn) : serial_number(std::move(sn)) {
        std::cout << "Device(" << serial_number << ")\\n";
    }
    virtual ~Device() = default;

    const std::string& serial() const { return serial_number; }
    virtual std::string type() const { return "Device"; }
};

// WITHOUT virtual inheritance -- Device is duplicated in SmartWatch
class Phone_NV : public Device {
public:
    Phone_NV(std::string sn) : Device(std::move(sn)) {}
    std::string type() const override { return "Phone"; }
    void call(const std::string& number) {
        std::cout << "Calling " << number << " from " << serial() << "\\n";
    }
};

class Watch_NV : public Device {
public:
    Watch_NV(std::string sn) : Device(std::move(sn)) {}
    std::string type() const override { return "Watch"; }
    void showTime() { std::cout << "12:00 on " << serial() << "\\n"; }
};

// SmartWatch_NV has TWO copies of Device -- ambiguous!
// class SmartWatch_NV : public Phone_NV, public Watch_NV { ... };
// sw.serial() -- ERROR: ambiguous
// sw.Phone_NV::serial() -- works but ugly

// WITH virtual inheritance -- Device is shared
class Phone : public virtual Device {
public:
    // Virtual base Device is NOT initialized here in final class
    Phone(std::string sn) : Device(std::move(sn)) {}
    std::string type() const override { return "Phone"; }
    void call(const std::string& number) {
        std::cout << "Calling " << number << " from " << serial() << "\\n";
    }
};

class Watch : public virtual Device {
public:
    Watch(std::string sn) : Device(std::move(sn)) {}
    std::string type() const override { return "Watch"; }
    void showTime() { std::cout << "12:00 on " << serial() << "\\n"; }
};

// SmartWatch has ONE shared Device instance
class SmartWatch : public Phone, public Watch {
public:
    // Most-derived class MUST initialize virtual base
    SmartWatch(std::string sn) : Device(std::move(sn)), Phone(sn), Watch(sn) {}
    std::string type() const override { return "SmartWatch"; }
};

int main() {
    SmartWatch sw("SW-001");
    sw.call("+1234567890");  // Unambiguous -- single Device
    sw.showTime();
    std::cout << sw.serial() << "\\n";  // Unambiguous
    std::cout << sw.type() << "\\n";    // "SmartWatch"

    // Verify single Device instance
    Device* d = &sw;  // Unambiguous upcast
    std::cout << d->type() << "\\n";  // "SmartWatch" via virtual dispatch

    return 0;
}`
    },
    {
      language: "javascript",
      caption: "JavaScript prototypal inheritance and ES6 class sugar",
      source: `// ===== Prototypal Inheritance (pre-ES6) =====
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  return this.name + " makes a sound";
};

function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up prototype chain: Dog.prototype -> Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Fix constructor reference

Dog.prototype.speak = function () {
  return this.name + " barks!";
};

Dog.prototype.fetch = function (item) {
  return this.name + " fetches " + item;
};

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak());                    // "Rex barks!"
console.log(dog instanceof Dog);             // true
console.log(dog instanceof Animal);          // true
console.log(Object.getPrototypeOf(dog) === Dog.prototype); // true

// ===== ES6 Class Syntax (sugar over prototypes) =====
class Vehicle {
  #mileage = 0; // Private field

  constructor(make, model) {
    this.make = make;
    this.model = model;
  }

  drive(miles) {
    this.#mileage += miles;
    return \`Drove \${miles} miles in \${this.make} \${this.model}\`;
  }

  get mileage() {
    return this.#mileage;
  }

  toString() {
    return \`\${this.make} \${this.model} (\${this.#mileage} miles)\`;
  }
}

class ElectricVehicle extends Vehicle {
  #batteryLevel;

  constructor(make, model, batteryCapacity) {
    super(make, model); // Must call super() before using 'this'
    this.#batteryLevel = 100;
    this.batteryCapacity = batteryCapacity;
  }

  drive(miles) {
    const consumption = miles * 0.3; // kWh per mile
    if (consumption > this.#batteryLevel) {
      throw new Error("Insufficient battery");
    }
    this.#batteryLevel -= consumption;
    return super.drive(miles) + \` (battery: \${this.#batteryLevel.toFixed(1)}%)\`;
  }

  charge() {
    this.#batteryLevel = 100;
    return "Fully charged";
  }
}

const ev = new ElectricVehicle("Tesla", "Model 3", 75);
console.log(ev.drive(50));    // "Drove 50 miles in Tesla Model 3 (battery: 85.0%)"
console.log(ev.mileage);     // 50

// ===== Object.create: Direct Object Inheritance =====
const animal = {
  speak() { return \`\${this.name} makes a sound\`; }
};

const cat = Object.create(animal);
cat.name = "Whiskers";
cat.purr = function () { return \`\${this.name} purrs\`; };
console.log(cat.speak()); // "Whiskers makes a sound" (inherited)
console.log(cat.purr());  // "Whiskers purrs" (own method)`
    },
    {
      language: "typescript",
      caption: "TypeScript mixins pattern and intersection types for composition",
      source: `// TypeScript Mixin Pattern -- composition over inheritance

// Base type for mixin constructors
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin 1: Timestamped
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    touch() {
      this.updatedAt = new Date();
    }
  };
}

// Mixin 2: SoftDeletable
function SoftDeletable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    deletedAt: Date | null = null;

    softDelete() {
      this.deletedAt = new Date();
    }

    restore() {
      this.deletedAt = null;
    }

    get isDeleted(): boolean {
      return this.deletedAt !== null;
    }
  };
}

// Mixin 3: Validatable
function Validatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private _errors: Map<string, string[]> = new Map();

    addError(field: string, message: string) {
      const errors = this._errors.get(field) ?? [];
      errors.push(message);
      this._errors.set(field, errors);
    }

    get isValid(): boolean {
      return this._errors.size === 0;
    }

    get errors(): ReadonlyMap<string, string[]> {
      return this._errors;
    }
  };
}

// Base entity
class Entity {
  constructor(public id: string) {}
}

// Compose mixins -- order matters for MRO
const BaseModel = SoftDeletable(Timestamped(Validatable(Entity)));

class User extends BaseModel {
  constructor(id: string, public name: string, public email: string) {
    super(id);
  }

  validate(): boolean {
    if (!this.name) this.addError("name", "Name is required");
    if (!this.email?.includes("@")) this.addError("email", "Invalid email");
    return this.isValid;
  }
}

const user = new User("1", "Alice", "alice@example.com");
user.validate();           // true
user.touch();              // Updates updatedAt
user.softDelete();         // Sets deletedAt
console.log(user.isDeleted); // true
user.restore();
console.log(user.createdAt); // Date object from construction`
    },
    {
      language: "cpp",
      caption: "C++ abstract classes (pure virtual), mixins, and the repository pattern",
      source: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <optional>
#include <chrono>
#include <ctime>
#include <memory>

// Simple entity represented as a map of string key-value pairs
using Entity = std::unordered_map<std::string, std::string>;

// Abstract base class with enforced contracts (pure virtual methods)
class Repository {
public:
    virtual ~Repository() = default;

    virtual std::optional<Entity> find_by_id(const std::string& id) = 0;
    virtual Entity save(Entity entity) = 0;
    virtual bool remove(const std::string& id) = 0;
    virtual std::vector<Entity> find_all() = 0;

    // Concrete method using abstract methods (Template Method)
    bool exists(const std::string& id) {
        return find_by_id(id).has_value();
    }
};

// Mixin for audit logging via inheritance
class AuditMixin : public virtual Repository {
    static std::string now_iso() {
        auto t = std::time(nullptr);
        char buf[32];
        std::strftime(buf, sizeof(buf), "%FT%T", std::localtime(&t));
        return buf;
    }
public:
    Entity save(Entity entity) override {
        entity["updated_at"] = now_iso();
        if (entity.find("created_at") == entity.end()) {
            entity["created_at"] = entity["updated_at"];
        }
        return entity;  // Derived class continues processing
    }

    bool remove(const std::string& id) override {
        auto entity = find_by_id(id);
        if (entity) {
            std::cout << "AUDIT: Deleting entity " << id << "\\n";
        }
        return false;  // Derived class performs actual deletion
    }
};

// Concrete implementation combining repository contract and audit mixin
class InMemoryRepository : public AuditMixin {
    std::unordered_map<std::string, Entity> store_;
public:
    std::optional<Entity> find_by_id(const std::string& id) override {
        auto it = store_.find(id);
        if (it != store_.end()) return it->second;
        return std::nullopt;
    }

    Entity save(Entity entity) override {
        // AuditMixin::save adds timestamps
        entity = AuditMixin::save(std::move(entity));
        auto id = entity["id"];
        store_[id] = entity;
        return entity;
    }

    std::vector<Entity> find_all() override {
        std::vector<Entity> result;
        result.reserve(store_.size());
        for (const auto& [key, val] : store_) {
            result.push_back(val);
        }
        return result;
    }

    bool remove(const std::string& id) override {
        AuditMixin::remove(id);  // logs the deletion
        return store_.erase(id) > 0;
    }
};

int main() {
    InMemoryRepository repo;
    Entity alice = {{"id", "1"}, {"name", "Alice"}};
    repo.save(alice);

    auto found = repo.find_by_id("1");
    if (found) {
        std::cout << "Found: " << (*found)["name"]
                  << " (created: " << (*found)["created_at"] << ")\\n";
    }
    // Found: Alice (created: 2024-01-15T10:30:00)
    return 0;
}`
    }
  ],

  diagrams: [
    {
      title: "Types of Inheritance",
      kind: "mindmap",
      caption: "Mind map showing single, multiple, multilevel, hierarchical, and hybrid inheritance with examples from Java, C++, and Python"
    },
    {
      title: "The Diamond Problem",
      kind: "architecture",
      caption: "Diamond inheritance diagram showing class D inheriting from B and C, both inheriting from A, with and without virtual inheritance in C++"
    },
    {
      title: "C3 Linearization Algorithm",
      kind: "flow",
      caption: "Step-by-step flow of C3 linearization computing MRO for a diamond hierarchy, showing merge operations"
    },
    {
      title: "JavaScript Prototype Chain",
      kind: "network",
      caption: "Network diagram showing object instances, constructor.prototype, Object.prototype, and null -- the full prototype chain with property lookup path"
    },
    {
      title: "Composition vs Inheritance",
      kind: "sequence",
      caption: "Sequence diagram comparing method dispatch in inheritance (vtable/MRO) vs composition (delegation to held object), showing flexibility differences"
    }
  ],

  animations: [
    {
      title: "C3 Linearization Step by Step",
      steps: [
        { label: "Define Hierarchy", detail: "class A, class B(A), class C(A), class D(B, C). We need to compute the MRO of D." },
        { label: "Compute Base MROs", detail: "L(A) = [A, object]. L(B) = [B, A, object]. L(C) = [C, A, object]." },
        { label: "Set Up Merge", detail: "L(D) = D + merge([B, A, object], [C, A, object], [B, C]). Three lists to merge." },
        { label: "Iteration 1: Take B", detail: "B is the head of the first list. Is B in the tail of any list? Tail of list 2 = [A, object] -- no. Tail of list 3 = [C] -- no. Take B. Remove B from all lists." },
        { label: "Iteration 2: Take C", detail: "Lists: [A, object], [C, A, object], [C]. Head of first list is A. Is A in any tail? Yes -- tail of [C, A, object] contains A. Skip. Head of list 2 is C. Is C in any tail? No. Take C." },
        { label: "Iteration 3: Take A", detail: "Lists: [A, object], [A, object], []. A is head of both remaining lists, not in any tail. Take A. Remove from all." },
        { label: "Final MRO", detail: "L(D) = [D, B, C, A, object]. Method lookup order: D first, then B, then C, then A, then object." }
      ]
    },
    {
      title: "Prototype Chain Lookup in JavaScript",
      steps: [
        { label: "Create Objects", detail: "const animal = { speak() { return 'sound'; } }; const dog = Object.create(animal); dog.name = 'Rex'; dog.bark = function() { return 'Woof!'; };" },
        { label: "Access Own Property", detail: "dog.name -- found directly on dog object. No prototype chain traversal needed. Result: 'Rex'." },
        { label: "Access Own Method", detail: "dog.bark() -- found directly on dog object. Calls dog's own bark function. Result: 'Woof!'." },
        { label: "Access Inherited Method", detail: "dog.speak() -- not found on dog. Engine follows [[Prototype]] to animal. Found on animal. Calls animal.speak() with 'this' set to dog. Result: 'sound'." },
        { label: "Access Nonexistent Property", detail: "dog.fly -- not on dog, not on animal, not on Object.prototype. [[Prototype]] of Object.prototype is null. Chain exhausted. Result: undefined." },
        { label: "Shadowing", detail: "dog.speak = function() { return 'Bark!'; }. Now dog.speak() returns 'Bark!' (own property shadows inherited one). animal.speak() still returns 'sound'." }
      ]
    }
  ],

  comparison: {
    columns: ["Feature", "Java", "C++", "Python", "JavaScript", "C#", "Kotlin"],
    rows: [
      ["Single class inheritance", "Yes", "Yes", "Yes", "Yes (prototype)", "Yes", "Yes"],
      ["Multiple class inheritance", "No", "Yes", "Yes", "No", "No", "No"],
      ["Interface/trait MI", "Yes (interface)", "N/A (abstract class)", "N/A (use MI)", "N/A (mixins)", "Yes (interface)", "Yes (interface)"],
      ["Diamond resolution", "N/A (no MI)", "Virtual inheritance", "C3 linearization (MRO)", "N/A (no MI)", "N/A (no MI)", "N/A (no MI)"],
      ["Methods virtual by default", "Yes", "No (explicit virtual)", "Yes", "Yes (prototype chain)", "No (explicit virtual)", "No (explicit open)"],
      ["Final/sealed class", "final", "final (C++11)", "No built-in", "No", "sealed", "Default (use open)"],
      ["super() call", "super.method()", "Base::method()", "super().method()", "super.method()", "base.Method()", "super.method()"],
      ["Abstract classes", "abstract class", "Pure virtual (= 0)", "ABC", "N/A", "abstract class", "abstract class"],
      ["Mixins", "Default methods (Java 8+)", "Multiple inheritance", "Multiple inheritance", "Object.assign / class expr", "Default methods (C# 8+)", "Interface default + delegation"]
    ]
  },

  interviewQA: [
    {
      q: "What is the Diamond Problem and how do different languages solve it?",
      a: "The Diamond Problem occurs when class D inherits from B and C, both of which inherit from A. Without resolution, D has ambiguous access to A's members and potentially duplicated A state. Solutions: C++ uses virtual inheritance -- the 'virtual' keyword on B and C's inheritance from A ensures a single shared A instance. The most-derived class (D) must initialize the virtual base. Python uses C3 linearization to compute a deterministic MRO (Method Resolution Order), ensuring each class appears exactly once. Java/C#/Kotlin avoid the problem entirely by forbidding multiple class inheritance, allowing only multiple interface implementation. For interfaces with default methods (Java 8+), the class must explicitly override the conflicting method.",
      followUps: [
        "What is the memory layout difference between virtual and non-virtual inheritance in C++?",
        "Can you cause C3 linearization to fail? When does Python raise TypeError?"
      ]
    },
    {
      q: "Explain Python's MRO and C3 linearization. Why was it introduced?",
      a: "Before Python 2.3, old-style classes used a simple depth-first left-to-right search, which could produce incorrect results in diamond hierarchies (a base class could appear before its subclass). C3 linearization guarantees three properties: (1) monotonicity -- if C1 precedes C2 in the MRO of a class, C1 precedes C2 in the MRO of any subclass, (2) local precedence order -- the order in which parents are listed in the class definition is preserved, (3) each class appears exactly once. The algorithm works by computing L(C) = C + merge(L(parent1), L(parent2), ..., [parent1, parent2, ...]) where merge selects the first element that does not appear in the tail of any other list. If no such element exists, the hierarchy is inconsistent and Python raises TypeError.",
      followUps: [
        "How does super() use the MRO?",
        "Give an example of an inconsistent hierarchy that fails C3 linearization."
      ]
    },
    {
      q: "Why is composition generally preferred over inheritance?",
      a: "Inheritance creates tight coupling: the subclass depends on the implementation details of the superclass (fragile base class problem). Changes to the parent can break children in unexpected ways. Inheritance is also static -- you cannot change the parent class at runtime. Composition is more flexible: (1) you can swap implementations at runtime (Strategy pattern), (2) you can compose multiple behaviors without diamond problems, (3) it avoids the gorilla-banana problem (inheriting unwanted methods/state), (4) it follows the Interface Segregation Principle (depend only on what you need). The GoF book states: 'Favor object composition over class inheritance.' Use inheritance when there is a genuine 'is-a' relationship and you want to leverage the Liskov Substitution Principle. Use composition for 'has-a' or 'uses-a' relationships.",
      followUps: [
        "What is the fragile base class problem?",
        "When IS inheritance the right choice?"
      ]
    },
    {
      q: "How does prototypal inheritance in JavaScript differ from classical inheritance?",
      a: "In classical inheritance (Java, C++), classes are blueprints: you define a class hierarchy, and objects are instances of classes. In prototypal inheritance (JavaScript), there are no classes as first-class entities -- objects inherit directly from other objects through the prototype chain. Key differences: (1) no distinction between class and instance at the object level (a prototype is just an object), (2) inheritance is per-object, not per-class (you can change an individual object's prototype), (3) property lookup is dynamic -- walking the chain at runtime, (4) you can modify prototypes at runtime, affecting all objects that inherit from them. ES6 'class' syntax is sugar over prototypes -- it does not change the underlying mechanism. This makes JavaScript more flexible but less predictable than classical inheritance.",
      followUps: [
        "What happens when you modify a prototype after objects have been created?",
        "How does 'new' work in JavaScript under the hood?"
      ]
    },
    {
      q: "What are mixins and how do they differ from interfaces and abstract classes?",
      a: "Mixins are classes designed to provide specific reusable functionality to other classes through composition or multiple inheritance, without standing as independent entities. Unlike interfaces, mixins provide concrete implementations (not just contracts). Unlike abstract classes, mixins are designed to be combined freely without establishing a rigid hierarchy. Examples: Ruby modules (include Enumerable), Python mixin classes (class AuditMixin), Scala traits, TypeScript mixin pattern using class expressions. Mixins address the tension between code reuse (abstract classes) and multiple type inheritance (interfaces). Best practices: mixins should be stateless or minimal state, focused on a single cross-cutting concern, and not depend on specific base class implementations.",
      followUps: [
        "How do Scala traits resolve conflicts between mixins?",
        "How does the TypeScript mixin pattern work with intersection types?"
      ]
    },
    {
      q: "Explain the Liskov Substitution Principle (LSP) and give a violation example.",
      a: "LSP states that objects of a subtype must be substitutable for objects of the supertype without altering the correctness of the program. Formal definition: if S is a subtype of T, then objects of type T may be replaced with objects of type S without changing desirable properties (correctness, task performed). Classic violation: Square extends Rectangle. Rectangle has setWidth()/setHeight() that set independently. Square's setWidth() must also set height (to maintain the square invariant). Code that calls rect.setWidth(5); rect.setHeight(10); assert(rect.area() == 50) fails for a Square (area would be 100). The fix: make them siblings under a Shape interface, or use immutable value objects. LSP violations indicate that the 'is-a' relationship is wrong.",
      followUps: [
        "How does LSP relate to covariant return types and contravariant parameters?",
        "What is behavioral subtyping?"
      ]
    },
    {
      q: "What is the difference between method overriding and method hiding?",
      a: "Method overriding replaces a virtual method in a subclass with runtime dispatch: the actual type of the object determines which method runs. Method hiding (shadowing) creates a new method with the same name that is resolved at compile time based on the declared type. In Java, instance methods are always overridden (virtual by default). In C#, without 'override', a subclass method with the same signature 'hides' the base method (compiler warns and suggests 'new' keyword). In C++, without 'virtual' on the base method, the derived method hides rather than overrides. Hiding can cause confusing behavior: Base* b = new Derived(); b->method() calls Base::method (hidden), not Derived::method. This is a common source of bugs.",
      followUps: [
        "How does C# differentiate between 'override' and 'new'?",
        "What is the 'override' specifier in C++11 and why was it added?"
      ]
    },
    {
      q: "How do sealed/final classes improve performance?",
      a: "When a class is marked final (Java), sealed (C#/Kotlin), or final (C++), the compiler knows no subclass exists. This enables devirtualization: virtual method calls on the final class can be resolved at compile time and inlined, eliminating vtable lookups. HotSpot JVM performs speculative devirtualization even for non-final classes using Class Hierarchy Analysis (CHA) -- if no subclass is currently loaded, it treats methods as effectively final. If a subclass is loaded later, JIT-compiled code is invalidated (deoptimized). Kotlin makes classes final by default for this reason -- you must explicitly declare 'open'. This follows Effective Java Item 19: 'Design and document for inheritance or else prohibit it.'",
      followUps: [
        "What is Class Hierarchy Analysis in HotSpot?",
        "How does Kotlin's default-final interact with frameworks like Spring that use proxies?"
      ]
    }
  ],

  followUps: [
    "How does inheritance interact with serialization frameworks (Jackson, Protobuf)?",
    "What is the role of inheritance in the Strategy, Template Method, and Decorator patterns?",
    "How do you migrate from an inheritance hierarchy to a composition-based design?",
    "What are covariant return types and how do they relate to inheritance?",
    "How does inheritance work in functional languages (Haskell, OCaml)?",
    "What is the fragile base class problem and how do you mitigate it?"
  ],

  mcqs: [
    {
      q: "What is the Diamond Problem in inheritance?",
      options: [
        "A class that inherits from exactly four other classes",
        "Ambiguity when a class inherits from two classes that share a common ancestor",
        "A performance issue with deeply nested inheritance",
        "A design pattern for diamond-shaped class hierarchies"
      ],
      answerIndex: 1,
      explanation: "The Diamond Problem occurs when class D inherits from B and C, both inheriting from A, creating ambiguity about which version of A's members D inherits and potentially duplicating A's state."
    },
    {
      q: "How does C++ solve the Diamond Problem?",
      options: [
        "By forbidding multiple inheritance",
        "Through virtual inheritance (virtual keyword on intermediate classes)",
        "By using interfaces instead of classes",
        "Through C3 linearization"
      ],
      answerIndex: 1,
      explanation: "C++ uses 'virtual' inheritance: 'class B : virtual public A'. This ensures a single shared instance of A in the diamond, with the most-derived class responsible for constructing A."
    },
    {
      q: "What algorithm does Python use to determine Method Resolution Order (MRO)?",
      options: [
        "Depth-first search",
        "Breadth-first search",
        "C3 linearization",
        "Topological sort"
      ],
      answerIndex: 2,
      explanation: "Python uses C3 linearization (since Python 2.3) which produces a consistent, monotonic ordering that preserves local precedence order and ensures each class appears exactly once in the MRO."
    },
    {
      q: "In JavaScript, what is the prototype chain?",
      options: [
        "The order in which constructors are called",
        "A linked list of objects through [[Prototype]] links used for property lookup",
        "The inheritance hierarchy of ES6 classes",
        "A security mechanism for cross-origin requests"
      ],
      answerIndex: 1,
      explanation: "Every JavaScript object has an internal [[Prototype]] link to another object. Property lookup walks this chain: object -> prototype -> prototype's prototype -> ... -> Object.prototype -> null."
    },
    {
      q: "What does the Liskov Substitution Principle state?",
      options: [
        "Subclasses should always override all parent methods",
        "Subclass instances must be usable wherever superclass instances are expected without altering correctness",
        "All classes should inherit from a common base class",
        "Substituting one algorithm for another should not change the interface"
      ],
      answerIndex: 1,
      explanation: "LSP states that if S is a subtype of T, objects of type T can be replaced by objects of type S without altering the correctness of the program. Violations indicate wrong use of inheritance."
    },
    {
      q: "Why is composition generally preferred over inheritance?",
      options: [
        "Composition is always faster than inheritance",
        "Composition provides more flexibility, lower coupling, and avoids fragile base class problems",
        "Inheritance is deprecated in modern languages",
        "Composition uses less memory"
      ],
      answerIndex: 1,
      explanation: "Composition avoids tight coupling between parent and child classes, enables runtime flexibility (swapping implementations), avoids the diamond problem, and prevents inheriting unwanted behavior."
    },
    {
      q: "What is the difference between method overriding and method hiding in C#?",
      options: [
        "They are the same thing",
        "Overriding uses 'override' and dispatches at runtime; hiding uses 'new' and resolves at compile time",
        "Overriding is faster; hiding is slower",
        "Hiding replaces the method; overriding adds to it"
      ],
      answerIndex: 1,
      explanation: "In C#, 'override' replaces a virtual method with runtime dispatch. 'new' hides the base method -- the declared type (not actual type) determines which method runs. Hiding can cause confusing behavior."
    },
    {
      q: "Which languages prohibit multiple class inheritance?",
      options: [
        "C++ and Python",
        "Java, C#, Kotlin, and Swift",
        "JavaScript and Ruby",
        "All languages prohibit it"
      ],
      answerIndex: 1,
      explanation: "Java, C#, Kotlin, and Swift allow only single class inheritance (but multiple interface implementation). C++ and Python support full multiple class inheritance."
    },
    {
      q: "What is a mixin?",
      options: [
        "A class that can only be instantiated once",
        "A class providing specific functionality designed to be combined with other classes, not used standalone",
        "A design pattern for mixing data types",
        "A function that combines two objects"
      ],
      answerIndex: 1,
      explanation: "Mixins provide concrete implementations of cross-cutting concerns (logging, serialization) designed to be combined with other classes through multiple inheritance or similar mechanisms, without establishing a rigid hierarchy."
    },
    {
      q: "In JavaScript ES6, what are 'class' and 'extends' keywords?",
      options: [
        "They introduce true classical inheritance to JavaScript",
        "They are syntactic sugar over the prototype-based inheritance mechanism",
        "They are deprecated in favor of Object.create()",
        "They create immutable class definitions"
      ],
      answerIndex: 1,
      explanation: "ES6 class/extends are syntactic sugar over JavaScript's prototypal inheritance. Under the hood, they still use prototype chains, constructor functions, and Object.create(). There are no true classes."
    },
    {
      q: "What does Kotlin's 'open' keyword do?",
      options: [
        "Opens a file for reading",
        "Makes a class or method overridable -- Kotlin classes are final by default",
        "Opens a network connection",
        "Marks a class as public"
      ],
      answerIndex: 1,
      explanation: "In Kotlin, all classes are final by default (cannot be inherited from). The 'open' keyword explicitly allows a class to be subclassed or a method to be overridden. This follows the principle of designing for inheritance or prohibiting it."
    },
    {
      q: "What is the fragile base class problem?",
      options: [
        "Base classes that consume too much memory",
        "Changes to a base class can unexpectedly break derived classes",
        "Base classes that cannot be garbage collected",
        "Base classes that are too deeply nested"
      ],
      answerIndex: 1,
      explanation: "The fragile base class problem occurs when modifications to a base class (adding methods, changing behavior) break derived classes in unexpected ways, because subclasses depend on implementation details of the parent."
    }
  ],

  exercises: [
    "Implement a class hierarchy for geometric shapes (Shape -> 2DShape/3DShape -> Circle/Rectangle/Sphere/Cube) in Java. Ensure LSP compliance by writing tests that operate on the base type.",
    "Create a diamond inheritance scenario in Python and trace the MRO manually using C3 linearization. Verify your result against Python's __mro__ attribute.",
    "Implement the same diamond hierarchy in C++ with and without virtual inheritance. Print the addresses of the base class members to demonstrate whether they are duplicated or shared.",
    "Build a mixin-based system in TypeScript using the mixin pattern (function that takes a constructor and returns a new class). Create Serializable, Validatable, and EventEmitter mixins and compose them.",
    "Implement prototypal inheritance in JavaScript using Object.create(), then rewrite the same hierarchy using ES6 classes. Prove they produce equivalent prototype chains.",
    "Refactor an inheritance-heavy design (e.g., Vehicle -> Car/Truck -> ElectricCar) into a composition-based design using the Strategy pattern. Compare the flexibility of both approaches.",
    "Create a scenario that violates the Liskov Substitution Principle (e.g., Square extends Rectangle). Write a test that passes for Rectangle but fails for Square, then fix the design.",
    "Implement a Python class hierarchy with cooperative multiple inheritance using super(). Include a mixin and demonstrate that all __init__ methods in the MRO are called correctly."
  ],

  flashcards: [
    { front: "What is the Diamond Problem?", back: "When class D inherits from B and C, both inheriting from A, creating ambiguity about which A's members D gets. C++ solves with virtual inheritance; Python with C3 linearization; Java forbids multiple class inheritance." },
    { front: "What is C3 linearization?", back: "Python's MRO algorithm. L(C) = C + merge(L(parents...), [parents...]). Merge takes the first head not in any tail. Guarantees monotonicity and local precedence order. Fails with TypeError if inconsistent." },
    { front: "What is the Liskov Substitution Principle?", back: "Subclass instances must be usable wherever superclass instances are expected without altering correctness. Violation example: Square extends Rectangle, but setWidth() breaks the independence of width and height." },
    { front: "What is the fragile base class problem?", back: "Changes to a base class can unexpectedly break derived classes because subclasses depend on implementation details of the parent. Composition avoids this by depending on interfaces rather than implementations." },
    { front: "How does prototypal inheritance work in JavaScript?", back: "Objects inherit directly from other objects through [[Prototype]] links. Property lookup walks the chain: object -> prototype -> ... -> Object.prototype -> null. No true classes; ES6 class is syntax sugar." },
    { front: "What are mixins?", back: "Classes providing concrete implementations of cross-cutting concerns (logging, serialization) designed to be composed with other classes. They provide code reuse without establishing rigid hierarchies. Examples: Ruby modules, Python mixin classes." },
    { front: "What is virtual inheritance in C++?", back: "Declaring 'class B : virtual public A' ensures a single shared instance of A in diamond inheritance. The most-derived class must initialize the virtual base. Adds pointer indirection overhead." },
    { front: "What is the difference between overriding and hiding?", back: "Overriding: virtual method, runtime dispatch based on actual type. Hiding: non-virtual method, compile-time resolution based on declared type. C#: 'override' vs 'new'. C++: virtual vs non-virtual." },
    { front: "Why is composition preferred over inheritance?", back: "Lower coupling, runtime flexibility, no fragile base class problem, no diamond problem, no gorilla-banana problem. GoF: 'Favor object composition over class inheritance.' Use inheritance only for genuine is-a with LSP." },
    { front: "What does Kotlin's 'open' keyword do?", back: "Allows a class to be subclassed or a method to be overridden. Kotlin classes are final by default. This enforces Effective Java Item 19: 'Design for inheritance or prohibit it.'" },
    { front: "How does super() work in Python MI?", back: "super() follows the MRO, not just the direct parent. In cooperative MI, each class calls super().__init__() which delegates to the next class in the MRO chain, ensuring all initializers run." },
    { front: "What is method resolution in Java?", back: "Java methods are virtual by default (except static, private, final). Dispatch uses the invokevirtual bytecode instruction, which looks up the method in the object's actual class's method table at runtime." }
  ],

  revisionNotes: [
    "Inheritance types: single, multiple, multilevel, hierarchical, hybrid. Java/C#/Kotlin: single class + multiple interface.",
    "Diamond Problem: D inherits B and C, both inherit A. C++: virtual inheritance. Python: C3 linearization. Java: forbids multiple class inheritance.",
    "C3 linearization: L(C) = C + merge(L(parents), [parents]). Take first head not in any tail. Fails TypeError if inconsistent.",
    "Python super() follows MRO, not direct parent. Cooperative MI: all classes call super().__init__().",
    "LSP: subtype instances must substitute for supertype without breaking correctness. Square/Rectangle is the classic violation.",
    "Composition > Inheritance: lower coupling, runtime flexibility, no fragile base class, no diamond problem.",
    "Prototypal (JS): objects inherit from objects via [[Prototype]] chain. ES6 class = syntax sugar. No true classes.",
    "Virtual inheritance (C++): single shared base instance, most-derived class constructs it. Extra pointer indirection.",
    "Mixins: concrete cross-cutting functionality composed via MI or patterns. Not standalone. Stateless preferred.",
    "Override vs hide: override = runtime dispatch (virtual); hide = compile-time resolution (declared type). C# override vs new.",
    "Kotlin default-final: classes cannot be inherited unless marked 'open'. Follows design-for-inheritance-or-prohibit principle.",
    "Fragile base class: parent changes break children. Root cause: subclass depends on implementation, not interface."
  ],

  cheatSheet: [
    "Java: class Sub extends Super (single only) | implements I1, I2 (multiple interfaces)",
    "C++: class D : public B, public C (multiple) | virtual public B (virtual inheritance)",
    "Python: class D(B, C) -- MRO via C3 linearization | check with D.__mro__",
    "JavaScript: class D extends B | Object.create(proto) | prototype chain",
    "C#: class D : Base, IFace (single class + multiple interfaces) | sealed prevents inheritance",
    "Kotlin: open class Base | class Derived : Base() | classes final by default",
    "Diamond fix (C++): virtual inheritance -- class B : virtual public A",
    "Diamond fix (Python): C3 linearization -- automatic MRO, cooperative super()",
    "LSP test: replace supertype with subtype -- all tests must still pass",
    "Composition: hold reference + delegate (Strategy, Decorator patterns)",
    "Mixin pattern (TS): function Mixin<T extends Constructor>(Base: T) { return class extends Base {...} }",
    "Python MRO: D.__mro__ or D.mro() to inspect",
    "Override (C#): virtual in base + override in derived | new = hide",
    "super keyword: Java/Kotlin/JS super.method() | Python super().method() | C++ Base::method()"
  ],

  resources: [
    { label: "Effective Java by Joshua Bloch", kind: "book", note: "Items 18-19: Favor composition over inheritance; Design and document for inheritance or prohibit it" },
    { label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)", kind: "book", note: "Discusses composition over inheritance as a fundamental principle; Strategy, Decorator, and Template Method patterns" },
    { label: "A Monotonic Superclass Linearization for Dylan (Barrett et al., 1996)", kind: "paper", note: "The paper introducing C3 linearization, later adopted by Python" },
    { label: "Python MRO documentation", kind: "docs", note: "Official documentation on Method Resolution Order and C3 linearization in Python" },
    { label: "MDN: Inheritance and the prototype chain", kind: "docs", note: "Comprehensive guide to JavaScript's prototypal inheritance mechanism" },
    { label: "C++ Core Guidelines C.120-C.140", kind: "docs", note: "Guidelines on class hierarchies, virtual functions, and multiple inheritance in C++" },
    { label: "The Liskov Substitution Principle (Martin, 1996)", kind: "paper", note: "Robert C. Martin's practical explanation of LSP with examples" },
    { label: "Kotlin language documentation - Classes and Inheritance", kind: "docs", note: "Covers Kotlin's default-final classes, open keyword, and delegation pattern" },
    { label: "You Don't Know JS: this & Object Prototypes (Kyle Simpson)", kind: "book", note: "Deep dive into JavaScript's prototype mechanism and why 'class' is misleading" },
    { label: "A Theory of Objects (Abadi & Cardelli)", kind: "book", note: "Formal treatment of object calculi, inheritance, and subtyping from a type-theoretic perspective" }
  ],

  glossary: [
    { term: "Inheritance", definition: "An OOP mechanism where a subclass acquires properties and behaviors from a superclass, establishing an 'is-a' relationship." },
    { term: "Diamond Problem", definition: "Ambiguity in multiple inheritance when a class inherits from two classes that share a common ancestor, leading to duplicated state or ambiguous method resolution." },
    { term: "Virtual Inheritance (C++)", definition: "A mechanism ensuring a single shared instance of a base class in diamond inheritance, using virtual base pointers instead of direct embedding." },
    { term: "Method Resolution Order (MRO)", definition: "The order in which base classes are searched when looking up a method. Python computes this using C3 linearization." },
    { term: "C3 Linearization", definition: "An algorithm producing a monotonic, consistent class ordering for method resolution in multiple inheritance hierarchies." },
    { term: "Liskov Substitution Principle (LSP)", definition: "Subtype instances must be usable wherever supertype instances are expected without altering program correctness." },
    { term: "Prototypal Inheritance", definition: "JavaScript's inheritance model where objects inherit directly from other objects through the [[Prototype]] chain, without class blueprints." },
    { term: "Mixin", definition: "A class providing specific reusable functionality designed to be composed with other classes through multiple inheritance or similar mechanisms." },
    { term: "Fragile Base Class Problem", definition: "The situation where changes to a base class unexpectedly break derived classes that depend on its implementation details." },
    { term: "Method Overriding", definition: "Replacing a virtual method in a subclass with a new implementation, resolved at runtime based on the actual object type." },
    { term: "Method Hiding (Shadowing)", definition: "Creating a new method with the same name in a subclass, resolved at compile time based on the declared type, not the actual type." },
    { term: "Composition over Inheritance", definition: "The GoF principle that object composition (has-a) leads to more flexible designs than class inheritance (is-a)." },
    { term: "Prototype Chain", definition: "JavaScript's linked list of objects through [[Prototype]] links, traversed during property lookup from an object up to Object.prototype and null." },
    { term: "Sealed/Final Class", definition: "A class that cannot be inherited from. Enables compiler devirtualization and enforces design-for-inheritance-or-prohibit principles." }
  ]
};
