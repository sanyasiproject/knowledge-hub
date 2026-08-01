import type { TopicContent } from "../types";

export const polymorphism: TopicContent = {
  quickSummary: [
    "Polymorphism means 'many forms' -- a single interface or operation that works with different types, letting code be written generically and behave specifically based on the actual type at runtime or compile time.",
    "The three main forms are: subtype polymorphism (OOP virtual dispatch), parametric polymorphism (generics/templates), and ad-hoc polymorphism (function/operator overloading).",
    "Polymorphism enables writing flexible, extensible code: you write to an interface once, and new types can plug in without modifying existing code (the Open-Closed Principle).",
  ],
  detailed: [
    "Subtype (inclusion) polymorphism is the classic OOP form: a variable of type Animal can hold a Dog or Cat, and calling speak() dispatches to the correct override at runtime. This is implemented via vtables (C++), method tables (Java/C#), or prototype chain lookup (JavaScript).",
    "Parametric polymorphism lets you write code that works for any type without knowing the specific type. Java generics (List<T>), C++ templates, Rust generics, and Haskell's parametric types all provide this. The same algorithm (sort, filter, map) works on any element type.",
    "Ad-hoc polymorphism provides different implementations for different types under the same name. Function overloading (Java, C++) and operator overloading (C++, Python __add__) are ad-hoc. Haskell type classes and Rust traits generalize this: you define a behavior (Eq, Ord, Show) and implement it per type.",
    "In C++ and Java, virtual method dispatch uses a vtable: each class with virtual methods has a table of function pointers. The object contains a hidden pointer to its class's vtable. When a virtual method is called through a base reference, the runtime looks up the vtable to find the correct function.",
    "Duck typing (Python, Ruby, JavaScript) is a form of polymorphism where the type is irrelevant as long as the object has the required methods. 'If it walks like a duck and quacks like a duck, it is a duck.' This is structural polymorphism without static type checks.",
    "Coercion polymorphism involves implicit type conversion: when an int is used where a double is expected, the compiler inserts a widening conversion. This is the weakest form of polymorphism and can cause subtle bugs (JavaScript's type coercions).",
    "Row polymorphism (OCaml, PureScript) lets a function accept any record with at least certain fields, preserving type information about additional fields. It is more expressive than simple structural subtyping.",
    "Static vs dynamic dispatch: static dispatch (templates, generics with monomorphization, function overloading) resolves the call at compile time. Dynamic dispatch (virtual methods, interface dispatch) resolves at runtime. Static dispatch is faster (no indirection) but less flexible.",
  ],
  deepDive: [
    "Vtable implementation: in C++, each class with virtual functions has a vtable -- an array of function pointers. Each object has a hidden vptr pointing to its class's vtable. Virtual dispatch involves: load the vptr from the object -> index into the vtable -> call the function pointer. This is one or two pointer indirections, which can cause cache misses in hot loops.",
    "Monomorphization (Rust, C++ templates) generates a specialized copy of generic code for each concrete type. Vec<i32> and Vec<String> produce separate machine code. This eliminates virtual dispatch overhead but increases binary size. Contrast with Java's type erasure, which uses a single implementation with casts.",
    "Type erasure (Java generics) removes type parameters at compile time: List<String> and List<Integer> are both just List at runtime. This means you cannot do instanceof T, new T(), or T.class. It is a backwards-compatibility compromise from Java 5.",
    "Higher-kinded types (Haskell, Scala) let you abstract over type constructors, not just types. Functor, Applicative, and Monad are higher-kinded: they abstract over containers (Maybe, List, IO) rather than concrete types. This is the most powerful form of parametric polymorphism.",
    "Multiple dispatch (Julia, Common Lisp CLOS, Dylan) selects the method implementation based on the runtime types of ALL arguments, not just the receiver. This is more expressive than single dispatch (Java, C++) but harder to implement efficiently.",
    "Existential types package a value with its type's capabilities, hiding the concrete type. In Haskell, `forall a. Show a => a` says 'some type that supports Show.' In Rust, `Box<dyn Trait>` is an existential: the concrete type is erased, and only the trait's methods are available. This is trait objects / dynamic dispatch.",
  ],
  code: [
    {
      language: "java",
      caption: "Subtype polymorphism: virtual dispatch via interface",
      source: `interface Shape {
    double area();
    String describe();
}

class Circle implements Shape {
    private final double radius;
    Circle(double r) { this.radius = r; }
    @Override public double area() { return Math.PI * radius * radius; }
    @Override public String describe() { return "Circle(r=" + radius + ")"; }
}

class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override public double area() { return w * h; }
    @Override public String describe() { return "Rect(" + w + "x" + h + ")"; }
}

// Polymorphic code: works with ANY Shape
public static double totalArea(List<Shape> shapes) {
    return shapes.stream().mapToDouble(Shape::area).sum();
}

List<Shape> shapes = List.of(new Circle(5), new Rectangle(3, 4));
System.out.println(totalArea(shapes));  // 90.54 (78.54 + 12)`,
    },
    {
      language: "rust",
      caption: "Static (monomorphization) vs dynamic dispatch (trait objects)",
      source: `trait Drawable {
    fn draw(&self) -> String;
}

struct Circle { radius: f64 }
struct Square { side: f64 }

impl Drawable for Circle {
    fn draw(&self) -> String { format!("Drawing circle r={}", self.radius) }
}
impl Drawable for Square {
    fn draw(&self) -> String { format!("Drawing square s={}", self.side) }
}

// Static dispatch: monomorphized -- separate code per type, no vtable
fn draw_static<T: Drawable>(shape: &T) {
    println!("{}", shape.draw());
}

// Dynamic dispatch: trait object -- vtable lookup at runtime
fn draw_dynamic(shape: &dyn Drawable) {
    println!("{}", shape.draw());
}

// Heterogeneous collection requires dynamic dispatch
fn draw_all(shapes: &[Box<dyn Drawable>]) {
    for s in shapes { println!("{}", s.draw()); }
}`,
    },
    {
      language: "cpp",
      caption: "Template-based duck typing and operator overloading",
      source: `#include <iostream>
#include <string>

// "Duck typing" via templates: no interface declaration needed
struct Duck {
    std::string quack() const { return "Quack!"; }
};

struct Person {
    std::string quack() const { return "I'm quacking like a duck!"; }
};

// Works with anything that has quack() -- compile-time duck typing
template <typename T>
void makeItQuack(const T& thing) {
    std::cout << thing.quack() << std::endl;
}

// Operator overloading
struct Vector {
    double x, y;
    Vector(double x, double y) : x(x), y(y) {}

    Vector operator+(const Vector& other) const {    // v1 + v2
        return Vector(x + other.x, y + other.y);
    }

    Vector operator*(double scalar) const {          // v * 3
        return Vector(x * scalar, y * scalar);
    }

    friend std::ostream& operator<<(std::ostream& os, const Vector& v) {
        return os << "Vector(" << v.x << ", " << v.y << ")";
    }
};

int main() {
    makeItQuack(Duck());    // "Quack!"
    makeItQuack(Person());  // "I'm quacking like a duck!"

    Vector v = Vector(1, 2) + Vector(3, 4);  // Vector(4, 6)
    Vector w = Vector(1, 2) * 3;             // Vector(3, 6)
    std::cout << v << std::endl;
    std::cout << w << std::endl;
    return 0;
}`,
    },
    {
      language: "haskell",
      caption: "Type classes: ad-hoc polymorphism with constraints",
      source: `-- Type class definition: ad-hoc polymorphism
class Describable a where
  describe :: a -> String

-- Instance for Int
instance Describable Int where
  describe n = "Integer: " ++ show n

-- Instance for String
instance Describable String where
  describe s = "String: " ++ s

-- Instance for lists of describable things
instance Describable a => Describable [a] where
  describe xs = "List of " ++ show (length xs) ++ " items"

-- Parametric + ad-hoc: works for any Describable type
printDescription :: Describable a => a -> IO ()
printDescription x = putStrLn (describe x)

-- printDescription (42 :: Int)     -- "Integer: 42"
-- printDescription "hello"         -- "String: hello"
-- printDescription [1,2,3 :: Int]  -- "List of 3 items"`,
    },
  ],
  diagrams: [
    {
      title: "Vtable Dispatch Mechanism",
      kind: "architecture",
      caption: "Object -> vptr -> vtable -> function pointer -> actual method implementation. Shows how virtual dispatch adds one level of indirection.",
      mermaid: `graph LR
    Obj[Object instance\nvptr field] --> VT[Vtable\nfor Animal class]
    VT --> F1[speak: offset 0\nfunction pointer]
    VT --> F2[move: offset 1\nfunction pointer]
    F1 --> Dog[Dog::speak\nbarks]
    F1 --> Cat[Cat::speak\nmeows]
    F2 --> DogMove[Dog::move\nruns]
    F2 --> CatMove[Cat::move\nslinks]
    note1[One extra indirection\nper virtual call] -.- Obj`,
    },
    {
      title: "Polymorphism Taxonomy",
      kind: "mindmap",
      caption: "Polymorphism branches into subtype, parametric, ad-hoc, coercion, and duck typing — each with different dispatch mechanisms.",
      mermaid: `mindmap
  root((Polymorphism))
    Subtype
      Virtual dispatch
      Runtime vtable lookup
      Java interfaces
      C++ virtual functions
    Parametric
      Generics resolved at compile time
      Monomorphization in Rust
      Type erasure in Java
      Templates in C++
    Ad-hoc
      Function overloading
      Type classes in Haskell
      Operator overloading
    Coercion
      Implicit type conversion
      int to float
      upcasting
    Duck Typing
      Python and JavaScript
      No explicit interface
      Structural matching`,
    },
    {
      title: "Static vs Dynamic Dispatch",
      kind: "sequence",
      caption: "Comparing how the compiler and runtime resolve method calls for static dispatch (generics) vs dynamic dispatch (virtual functions).",
      mermaid: `sequenceDiagram
    participant Src as Source Code
    participant Comp as Compiler
    participant RT as Runtime
    Note over Src,Comp: Static Dispatch (Generics / Templates)
    Src->>Comp: max of T where T is Ord called with i32
    Comp->>Comp: Generate max_i32 specialization
    Comp->>Comp: Inline and optimize max_i32
    Comp-->>RT: Direct call instruction - no indirection
    Note over Src,RT: Dynamic Dispatch (Virtual Functions)
    Src->>RT: animal.speak() on Animal reference
    RT->>RT: Load vptr from object
    RT->>RT: Look up speak in vtable
    RT->>RT: Call through function pointer
    RT-->>Src: Correct override executes`,
    },
  ],
  animations: [
    {
      title: "Generic function monomorphization",
      steps: [
        { label: "Generic function defined", detail: "fn max<T: Ord>(a: T, b: T) -> T is written once, parameterized over any Ord type." },
        { label: "Called with i32", detail: "max(3, 5) triggers the compiler to generate a specialized max_i32(a: i32, b: i32) -> i32." },
        { label: "Called with String", detail: "max(s1, s2) triggers a separate max_String(a: String, b: String) -> String." },
        { label: "Each specialization optimized", detail: "The compiler optimizes each monomorphized version independently. No vtable, no indirection, no runtime cost." },
        { label: "Binary contains both", detail: "The final binary includes both specialized versions. Trade-off: zero-cost dispatch but larger binary." },
      ],
    },
  ],
  comparison: {
    columns: ["Form", "Resolved at", "Mechanism", "Languages", "Trade-off"],
    rows: [
      ["Subtype", "Runtime", "Vtable / method table", "Java, C++, C#, Python", "Flexible, slight dispatch overhead"],
      ["Parametric", "Compile time (monomorphized) or runtime (type erasure)", "Templates / generics", "Rust, C++, Haskell, Java, TypeScript", "Type safety + reuse; may bloat binary"],
      ["Ad-hoc (overloading)", "Compile time", "Name mangling / overload resolution", "C++, Java, Kotlin", "Convenient, but can be confusing"],
      ["Ad-hoc (type classes)", "Compile time (dictionary passing)", "Implicit trait/typeclass lookup", "Haskell, Rust, Scala", "Powerful, extensible, can be complex"],
      ["Duck typing", "Runtime", "Method lookup on object", "Python, Ruby, JS", "Very flexible, no static safety"],
      ["Multiple dispatch", "Runtime", "Dispatch on all argument types", "Julia, CLOS, Dylan", "Most expressive, harder to optimize"],
    ],
  },
  interviewQA: [
    {
      q: "What are the different types of polymorphism?",
      a: "Three main types: (1) Subtype polymorphism -- a parent type reference holds a child object, and method calls dispatch to the child's override at runtime. (2) Parametric polymorphism -- generics/templates that work for any type (List<T>, fn<T>). (3) Ad-hoc polymorphism -- different implementations for different types under the same name (function overloading, operator overloading, type classes).",
      followUps: [
        "What is the difference between static and dynamic polymorphism? (Static: resolved at compile time -- templates, overloading. Dynamic: resolved at runtime -- virtual dispatch.)",
        "How does duck typing relate to polymorphism? (It is structural polymorphism without static type checks -- any object with the right methods works.)",
      ],
    },
    {
      q: "How does virtual dispatch work under the hood?",
      a: "Each class with virtual methods has a vtable -- an array of function pointers. Each object has a hidden vptr pointing to its class's vtable. When a virtual method is called: (1) load the vptr from the object, (2) index into the vtable to find the function pointer, (3) call through the pointer. This costs 1-2 pointer indirections versus a direct call.",
    },
    {
      q: "What is the difference between Java generics and C++ templates?",
      a: "Java uses type erasure: generic type information is removed at compile time, and all instantiations share one implementation using Object + casts. C++ uses monomorphization: the compiler generates a separate specialization for each concrete type. Consequences: Java generics cannot use primitive types directly (need boxing) and cannot do instanceof T. C++ templates produce larger binaries but have zero runtime overhead.",
    },
  ],
  followUps: [
    "See Inheritance for how subtype polymorphism is built on class hierarchies.",
    "Explore Interfaces & Abstract Classes for defining polymorphic contracts.",
    "Study Functors & Monads for how parametric polymorphism enables generic abstractions over computational effects.",
  ],
  mcqs: [
    {
      q: "Which form of polymorphism does Java's method overloading represent?",
      options: ["Subtype polymorphism", "Parametric polymorphism", "Ad-hoc polymorphism", "Duck typing"],
      answerIndex: 2,
      explanation: "Method overloading (same name, different parameter types) is ad-hoc polymorphism -- different implementations selected at compile time based on argument types.",
    },
    {
      q: "What is monomorphization?",
      options: [
        "Converting all types to a single base type at runtime",
        "Generating specialized code for each concrete type used with a generic function",
        "Erasing type parameters at compile time",
        "Using a vtable for dynamic dispatch",
      ],
      answerIndex: 1,
      explanation: "Monomorphization (used by Rust and C++ templates) creates separate machine code for each concrete type, eliminating generic dispatch overhead at the cost of binary size.",
    },
    {
      q: "What is a vtable?",
      options: [
        "A table of variable types",
        "A compile-time type lookup table",
        "An array of function pointers used for virtual method dispatch",
        "A table mapping variable names to memory addresses",
      ],
      answerIndex: 2,
      explanation: "A vtable (virtual method table) is an array of function pointers. Objects contain a hidden pointer to their class's vtable, enabling dynamic dispatch.",
    },
    {
      q: "In Python, what enables polymorphism without explicit interfaces?",
      options: ["Abstract base classes", "Duck typing", "Type erasure", "Multiple dispatch"],
      answerIndex: 1,
      explanation: "Python uses duck typing: if an object has the required methods, it can be used regardless of its type. No interface declaration is needed.",
    },
  ],
  exercises: [
    "Implement a Shape hierarchy with Circle, Rectangle, and Triangle in Java. Write a function that processes a List<Shape> polymorphically to compute total area.",
    "In Rust, implement a trait with both static dispatch (generics) and dynamic dispatch (trait objects). Benchmark the difference on a hot loop.",
    "In Python, implement operator overloading for a Matrix class: support +, *, and @ (matrix multiplication) via dunder methods.",
    "Create Haskell type class instances for a custom type (e.g., a Card type that implements Eq, Ord, and Show).",
    "Compare Java generics (type erasure) vs C++ templates (monomorphization) by implementing a generic sort and examining the compiled output.",
  ],
  flashcards: [
    { front: "Subtype polymorphism", back: "Parent reference holds child object. Method calls dispatch to child's override at runtime via vtable." },
    { front: "Parametric polymorphism", back: "Code written once for any type via generics/templates. List<T>, fn<T: Ord>. Type-safe reuse." },
    { front: "Ad-hoc polymorphism", back: "Different implementations for different types under the same name. Function overloading, operator overloading, type classes." },
    { front: "Vtable", back: "Array of function pointers for virtual dispatch. Objects have a hidden vptr to their class's vtable." },
    { front: "Monomorphization", back: "Compiler generates specialized code per concrete type (Rust, C++). Zero overhead but larger binary." },
    { front: "Type erasure", back: "Java generics: type params removed at compile time. One implementation, casts inserted. Cannot do instanceof T." },
    { front: "Duck typing", back: "If it has the right methods, it works. No interface declaration needed. Python, Ruby, JS." },
    { front: "Multiple dispatch", back: "Method selected based on runtime types of ALL arguments, not just the receiver. Julia, CLOS." },
  ],
  revisionNotes: [
    "Polymorphism = one interface, many forms. Three main kinds: subtype, parametric, ad-hoc.",
    "Subtype: virtual dispatch via vtable. Runtime resolution. One indirection overhead.",
    "Parametric: generics/templates. Monomorphized (Rust/C++) or erased (Java).",
    "Ad-hoc: overloading (compile-time), type classes (Haskell), traits (Rust).",
    "Duck typing: structural polymorphism without static checks. Python, Ruby, JS.",
    "Static dispatch: resolved at compile time, zero overhead. Dynamic: resolved at runtime, flexible.",
    "Multiple dispatch: dispatch on all args. More expressive than single dispatch.",
  ],
  cheatSheet: [
    "Subtype: parent ref, child object, virtual dispatch (Java/C++/C#)",
    "Parametric: List<T>, Vec<T>, generics -- one code for all types",
    "Ad-hoc: overloading (same name, diff args), operator overloading",
    "Type classes (Haskell) / traits (Rust): ad-hoc + parametric combined",
    "Vtable: array of function pointers; vptr in each object",
    "Monomorphization: specialized code per type (Rust, C++ templates)",
    "Type erasure: generic info removed at compile time (Java generics)",
    "Duck typing: method presence, not type declaration (Python, JS)",
    "dyn Trait (Rust) / interface ref (Java): dynamic dispatch",
    "impl Trait (Rust) / templates (C++): static dispatch",
  ],
  resources: [
    { label: "On Understanding Types, Data Abstraction, and Polymorphism (Cardelli & Wegner)", kind: "paper", note: "Classic taxonomy of polymorphism: universal (parametric, inclusion) and ad-hoc (overloading, coercion)." },
    { label: "Rust Book: Traits", kind: "docs", note: "Covers trait definitions, implementations, generics, trait objects, and static vs dynamic dispatch." },
    { label: "Effective Java, Item 52: Refer to objects by their interfaces (Bloch)", kind: "book", note: "Explains why programming to interfaces enables polymorphism and flexibility." },
    { label: "Haskell Wiki: Type classes", kind: "docs", note: "Comprehensive guide to Haskell's type class system and how it implements ad-hoc polymorphism." },
    { label: "Julia Documentation: Methods and Multiple Dispatch", kind: "docs", note: "How Julia's multiple dispatch system works and why it is central to the language's design." },
  ],
  glossary: [
    { term: "Polymorphism", definition: "The ability of a single interface to work with different types, resolved at compile time or runtime." },
    { term: "Subtype polymorphism", definition: "Using a parent type reference to invoke overridden methods on child objects via dynamic dispatch." },
    { term: "Parametric polymorphism", definition: "Writing code parameterized by type variables (generics) that works uniformly for any type." },
    { term: "Ad-hoc polymorphism", definition: "Different implementations for different types under the same operation name (overloading, type classes)." },
    { term: "Vtable", definition: "A per-class array of function pointers used to implement virtual method dispatch." },
    { term: "Monomorphization", definition: "Compiler technique that generates a separate specialization of generic code for each concrete type." },
    { term: "Type erasure", definition: "Removing generic type parameters at compile time, using a single runtime implementation with casts." },
    { term: "Duck typing", definition: "Polymorphism based on the presence of methods/properties rather than declared type relationships." },
  ],
};
