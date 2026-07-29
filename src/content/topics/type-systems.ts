import type { TopicContent } from "../types";

export const typeSystems: TopicContent = {
  quickSummary: [
    "A type system is a set of rules that assigns a type to every expression in a program; it exists to prevent certain classes of bugs at either compile time or runtime.",
    "Static typing (C, Java, Haskell) checks types before execution; dynamic typing (Python, Ruby, JavaScript) checks types at runtime when operations are actually performed.",
    "Strong typing (Haskell, Python) prevents implicit type coercions that silently change meaning; weak typing (C, JavaScript) allows them.",
    "Structural typing (TypeScript, Go interfaces) considers two types compatible if they have the same structure; nominal typing (Java, C#) requires explicit declarations of compatibility via names or inheritance.",
  ],
  detailed: [
    "Every programming language has a type system, even if it is as simple as 'everything is a word-sized integer' (assembly). The type system's job is to classify values and constrain the operations that can be performed on them, catching errors that would otherwise surface as crashes, corrupted data, or undefined behavior.",
    "The static vs. dynamic axis determines *when* types are checked. In a statically typed language like Java or Haskell, the compiler verifies type correctness before the program runs. In a dynamically typed language like Python or Ruby, type checks happen at runtime, raising exceptions like TypeError when an operation receives an incompatible operand. The trade-off is between earlier error detection (static) and development flexibility (dynamic).",
    "The strong vs. weak axis describes *how strictly* types are enforced. In a strongly typed language, 1 + \"2\" is a type error (Python raises TypeError). In a weakly typed language like JavaScript, 1 + \"2\" silently coerces to \"12\". C is weakly typed in a different way: it lets you cast any pointer to any other pointer type, reinterpreting raw memory. Strength is a spectrum, not a binary.",
    "Nominal type systems (Java, C#, Swift) determine compatibility by declared names and inheritance hierarchies. If class Dog and class Cat both have a method speak(), they are unrelated types unless they share a named interface. Structural type systems (TypeScript, Go) consider them compatible if their shapes match — any object with a speak() method satisfies the requirement regardless of its declared type.",
    "Type inference allows the compiler to deduce types without explicit annotations. Hindley-Milner inference (used in Haskell, ML, Rust) can infer the most general type for any expression in a decidable way. TypeScript and Kotlin use local type inference, deducing types within expressions and variable declarations but sometimes requiring explicit annotations at function boundaries.",
    "Gradual typing (TypeScript, Python with mypy, Dart) lets you mix typed and untyped code in the same program. You can start with no annotations and incrementally add types to critical paths. The boundary between typed and untyped code is mediated by runtime checks or an 'any' escape hatch. This pragmatic approach acknowledges that full static typing has an adoption cost.",
  ],
  deepDive: [
    "Dependent types take type systems to their logical extreme: types can depend on values. In Idris or Agda, you can express the type Vector 5 Int — a list of exactly 5 integers — and the compiler will reject any code that tries to access the 6th element. Dependent types effectively turn the type checker into a theorem prover, guaranteeing properties like 'this sort function returns a permutation of its input' at compile time. The trade-off is that type checking may become undecidable or require proof terms from the programmer.",
    "Substructural type systems restrict how values can be used. Linear types (as in Linear Haskell or Rust's ownership system) ensure each value is used exactly once, preventing double-free and use-after-free bugs. Affine types (Rust's default) allow at most one use. Relevant types require at least one use. These systems make resource management — file handles, memory, network connections — checkable by the compiler.",
    "Row polymorphism and extensible records allow functions to operate on records with at least certain fields, without specifying the full set. PureScript and OCaml use row polymorphism to provide a type-safe alternative to structural subtyping. The function f : { name : String | r } -> String can accept any record with a name field plus any additional fields, and the type variable r tracks those extra fields through the type system.",
    "Phantom types are type parameters that appear in a type's definition but not in its runtime representation. They carry compile-time information without runtime cost. For example, a SafeString<Escaped> and SafeString<Raw> are the same at runtime (both just strings), but the type system prevents you from passing an unescaped string where an escaped one is expected, preventing XSS vulnerabilities.",
    "Higher-kinded types (HKTs) let you abstract over type constructors, not just types. In Haskell, the Functor type class is defined as class Functor f where fmap :: (a -> b) -> f a -> f b. Here f is a type constructor (like Maybe, List, or IO), not a concrete type. HKTs enable powerful abstractions like Monad, Applicative, and Traversable. Most mainstream languages (Java, C#, TypeScript) lack HKTs, though Scala and Kotlin provide partial support.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Structural typing: shape compatibility without explicit implements",
      source: `interface Printable {
  toString(): string;
}

// No 'implements Printable' needed — structural match suffices
class Point {
  constructor(public x: number, public y: number) {}
  toString() { return \`(\${this.x}, \${this.y})\`; }
}

function print(item: Printable): void {
  console.log(item.toString());
}

print(new Point(3, 4));  // (3, 4) — works because Point has toString()
print({ toString: () => "hello" });  // also works — structural match`,
    },
    {
      language: "haskell",
      caption: "Hindley-Milner type inference and parametric polymorphism",
      source: `-- No type annotation needed: the compiler infers
-- identity :: a -> a
identity x = x

-- Inferred: map :: (a -> b) -> [a] -> [b]
-- We can use it at any type:
nums    = map (+1) [1, 2, 3]       -- [2, 3, 4]  :: [Int]
strings = map show [1, 2, 3]       -- ["1","2","3"] :: [String]
bools   = map not [True, False]    -- [False, True]  :: [Bool]

-- Type classes enable ad-hoc polymorphism
class Describable a where
  describe :: a -> String

instance Describable Int where
  describe n = "An integer: " ++ show n

instance Describable Bool where
  describe True  = "Yes"
  describe False = "No"

main :: IO ()
main = do
  putStrLn (describe (42 :: Int))   -- "An integer: 42"
  putStrLn (describe True)          -- "Yes"`,
    },
    {
      language: "python",
      caption: "Dynamic + strong typing, and gradual typing with type hints",
      source: `# Python is dynamically typed: types checked at runtime
x = 42          # x is an int
x = "hello"     # now x is a str — no error, types are not fixed

# Python is strongly typed: no implicit coercions
try:
    result = 1 + "2"  # TypeError: unsupported operand type(s)
except TypeError as e:
    print(e)

# Gradual typing with type hints (checked by mypy, not at runtime)
def greet(name: str) -> str:
    return f"Hello, {name}"

# Type aliases and generics (Python 3.12+)
type Matrix[T] = list[list[T]]

def transpose(matrix: Matrix[int]) -> Matrix[int]:
    return [list(row) for row in zip(*matrix)]

print(transpose([[1, 2], [3, 4]]))  # [[1, 3], [2, 4]]`,
    },
    {
      language: "c",
      caption: "Weak typing: implicit conversions and unsafe casts",
      source: `#include <stdio.h>

int main(void) {
    // Implicit narrowing conversion — no warning by default
    int i = 3.14;   // truncated to 3
    printf("i = %d\\n", i);

    // Implicit integer promotion
    char c = 'A';               // 65
    int result = c + 1;         // 66 — char promoted to int
    printf("result = %d\\n", result);

    // Unsafe pointer cast — reinterprets memory
    float f = 3.14f;
    int* p = (int*)&f;          // legal but undefined behavior
    printf("reinterpreted bits = 0x%08X\\n", *p);

    // void* erases type information entirely
    void* generic = &f;
    double* wrong = (double*)generic;  // compiles, but wrong type
    // Dereferencing 'wrong' reads past the float's 4 bytes — UB

    return 0;
}`,
    },
    {
      language: "java",
      caption: "Nominal typing: interfaces, generics, and bounded type parameters",
      source: `// Nominal typing: Dog and Cat are unrelated despite identical methods
interface Speaker {
    String speak();
}

class Dog implements Speaker {
    @Override public String speak() { return "Woof"; }
}

class Cat implements Speaker {
    @Override public String speak() { return "Meow"; }
}

// Bounded generics: T must implement Comparable<T>
class Sorter {
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }
}

// Wildcards for variance
class Util {
    // Covariant read: ? extends Number
    public static double sum(java.util.List<? extends Number> nums) {
        double total = 0;
        for (Number n : nums) total += n.doubleValue();
        return total;
    }

    // Contravariant write: ? super Integer
    public static void fill(java.util.List<? super Integer> list, int val) {
        list.add(val);
    }
}`,
    },
    {
      language: "typescript",
      caption: "Advanced TypeScript: mapped types, conditional types, template literals",
      source: `// Mapped type: make all properties optional
type Partial<T> = { [K in keyof T]?: T[K] };

// Conditional type: extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Template literal types: type-safe route parameters
type Route = \`/users/\${string}/posts/\${number}\`;
const valid: Route = "/users/alice/posts/42";
// const bad: Route = "/users/alice/settings"; // Type error

// Discriminated union with exhaustive checking
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":    return Math.PI * s.radius ** 2;
    case "rectangle": return s.width * s.height;
    // If a new variant is added, TypeScript flags this as non-exhaustive
  }
}`,
    },
    {
      language: "rust",
      caption: "Affine types and ownership: compile-time resource safety",
      source: `fn main() {
    let s1 = String::from("hello");  // s1 owns the String

    let s2 = s1;  // Ownership MOVES to s2; s1 is invalidated
    // println!("{}", s1);  // Compile error: value used after move

    // Borrowing: immutable reference
    let s3 = String::from("world");
    let len = calculate_length(&s3);  // borrow, don't move
    println!("{} has length {}", s3, len);  // s3 still valid

    // Mutable reference: only one at a time
    let mut s4 = String::from("hello");
    change(&mut s4);
    println!("{}", s4);  // "hello, world"
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}`,
    },
  ],
  diagrams: [
    {
      title: "Type System Taxonomy",
      kind: "mindmap",
      caption: "Classification tree: Static vs Dynamic (when checked), Strong vs Weak (how strict), Nominal vs Structural (how compatibility is determined), with language examples at each leaf.",
    },
    {
      title: "Type Checking Pipeline",
      kind: "flow",
      caption: "Source code flows through lexing, parsing, name resolution, type inference, type checking, and finally code generation. Errors at the type-checking stage prevent compilation.",
    },
    {
      title: "Variance in Generic Types",
      kind: "architecture",
      caption: "Covariance (Producer<Dog> is a subtype of Producer<Animal>), contravariance (Consumer<Animal> is a subtype of Consumer<Dog>), and invariance (MutableList<Dog> is unrelated to MutableList<Animal>).",
    },
  ],
  animations: [
    {
      title: "Hindley-Milner Type Inference",
      steps: [
        { label: "Parse expression", detail: "The compiler parses 'map (+1) [1,2,3]' and assigns fresh type variables: map :: t1, (+1) :: t2, [1,2,3] :: t3." },
        { label: "Generate constraints", detail: "From the known type of map :: (a->b) -> [a] -> [b], and (+1) :: Num a => a -> a, the compiler generates: t2 = a -> a, t3 = [a], result = [b], a = b." },
        { label: "Unify", detail: "The unification algorithm solves constraints: a = Int (from the literal list), b = Int (from a = b), so map (+1) [1,2,3] :: [Int]." },
        { label: "Generalize", detail: "If the expression were a top-level definition without concrete types, the algorithm would generalize unbound variables to produce the most general (polymorphic) type." },
      ],
    },
    {
      title: "Structural vs Nominal Type Checking",
      steps: [
        { label: "Define types", detail: "Two types, Point{x, y} and Coordinate{x, y}, have identical fields but different names." },
        { label: "Nominal check", detail: "In Java, Point and Coordinate are incompatible: different class names, no inheritance relationship. Assignment fails at compile time." },
        { label: "Structural check", detail: "In TypeScript, both have {x: number, y: number}. The compiler checks field names and types, finds a match, and allows assignment." },
        { label: "Trade-offs", detail: "Nominal typing catches accidental compatibility (Meters vs Seconds both wrapping a number). Structural typing reduces boilerplate and enables duck typing with static safety." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "TypeScript", "Haskell", "Python", "Java", "C", "Rust"],
    rows: [
      ["Static / Dynamic", "Static", "Static", "Dynamic", "Static", "Static", "Static"],
      ["Strong / Weak", "Weak (JS interop)", "Strong", "Strong", "Strong", "Weak", "Strong"],
      ["Nominal / Structural", "Structural", "Nominal (type classes)", "Duck typing", "Nominal", "Nominal", "Nominal (traits)"],
      ["Type inference", "Local", "Full (Hindley-Milner)", "None (hints optional)", "Local (var)", "None", "Local + lifetime inference"],
      ["Generics", "Yes", "Yes (parametric + HKT)", "Yes (3.12+)", "Yes (erasure)", "No (macros/void*)", "Yes (monomorphized)"],
      ["Null safety", "strictNullChecks", "Maybe type", "Optional type hint", "Optional (Java 8+)", "No", "Option<T>"],
      ["Dependent types", "No", "Partial (extensions)", "No", "No", "No", "No"],
      ["Gradual typing", "Yes", "No", "Yes (mypy)", "No", "No", "No"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between static and dynamic typing?",
      a: "Static typing checks types at compile time, before the program runs. If a function expects an int and you pass a string, the compiler rejects it. Dynamic typing defers type checks to runtime — the same error would only surface when that line of code actually executes. Static typing catches bugs earlier but requires type annotations (or inference); dynamic typing offers faster prototyping but risks runtime TypeErrors.",
      followUps: [
        "Can a language be both statically and dynamically typed?",
        "What is gradual typing and how does TypeScript implement it?",
      ],
    },
    {
      q: "Explain structural typing vs. nominal typing with an example.",
      a: "In nominal typing (Java), two classes are compatible only if they share a declared relationship (inheritance or interface). In structural typing (TypeScript), compatibility is determined by shape: if an object has all the required fields and methods, it matches the type regardless of its declared name. For example, in TypeScript, {x: number, y: number} matches any interface requiring x and y fields, even without 'implements'.",
      followUps: [
        "What are the risks of structural typing?",
        "How does Go's interface system relate to structural typing?",
      ],
    },
    {
      q: "What is type inference and how does Hindley-Milner work?",
      a: "Type inference lets the compiler deduce types without explicit annotations. Hindley-Milner (Algorithm W) works by: (1) assigning fresh type variables to all expressions, (2) generating equality constraints from how values are used, (3) solving constraints via unification, and (4) generalizing remaining free variables to produce the most general (polymorphic) type. It is complete and decidable for the simply-typed lambda calculus with let-polymorphism.",
      followUps: [
        "Why do some languages with HM inference still require annotations?",
        "What limitations does HM inference have with subtyping?",
      ],
    },
    {
      q: "What are dependent types and why are they significant?",
      a: "Dependent types allow types to depend on values. For example, Vec n a represents a vector of exactly n elements of type a. The compiler can then statically verify that head is never called on an empty vector, or that matrix multiplication only operates on dimensionally compatible matrices. Languages like Idris and Agda support dependent types. They blur the line between types and proofs, enabling the Curry-Howard correspondence where types are propositions and programs are proofs.",
      followUps: [
        "Why haven't dependent types been adopted in mainstream languages?",
        "What is the Curry-Howard correspondence?",
      ],
    },
    {
      q: "What is variance in generic types?",
      a: "Variance describes how subtyping of parameterized types relates to subtyping of their type arguments. Covariance means Producer<Dog> is a subtype of Producer<Animal> (safe for output). Contravariance means Consumer<Animal> is a subtype of Consumer<Dog> (safe for input). Invariance means neither relationship holds (required for mutable containers). Java uses wildcards (? extends T, ? super T), Kotlin uses declaration-site variance (out T, in T), and TypeScript uses structural checking to infer variance.",
      followUps: [
        "What is the PECS rule in Java?",
        "Why are mutable collections invariant?",
      ],
    },
    {
      q: "How does Rust's ownership system relate to type theory?",
      a: "Rust's ownership implements an affine type system: each value has exactly one owner, and ownership can be moved but not duplicated. This is checked at compile time by the borrow checker. References are typed as either shared (&T, many readers, no writers) or exclusive (&mut T, one writer, no readers). Lifetimes are type-level annotations that track how long references are valid. This eliminates data races, use-after-free, and double-free without garbage collection.",
    },
  ],
  followUps: [
    "Explore how TypeScript's type system is Turing-complete and what that means for type-level programming.",
    "Study Rust's lifetime system as an extension of affine types.",
    "Learn about effect systems (Koka, Eff) as a type-level approach to tracking side effects.",
    "Investigate refinement types and how tools like Liquid Haskell add value-dependent constraints to Haskell.",
    "Understand how gradual typing implementations handle the typed-untyped boundary (blame calculus).",
  ],
  mcqs: [
    {
      q: "Which language uses structural typing for its interface system?",
      options: ["Java", "C#", "Go", "C++"],
      answerIndex: 2,
      explanation: "Go interfaces are satisfied implicitly: any type with the right method signatures satisfies the interface, no 'implements' keyword needed. This is structural typing.",
    },
    {
      q: "In Haskell, what is the inferred type of the expression 'id x = x'?",
      options: ["Int -> Int", "String -> String", "a -> a", "Any -> Any"],
      answerIndex: 2,
      explanation: "Hindley-Milner infers the most general type. Since x is used without any constraint, the type is universally quantified: a -> a (identity for any type a).",
    },
    {
      q: "What does 'strong typing' primarily prevent?",
      options: [
        "Runtime errors",
        "Implicit type coercions that silently change semantics",
        "Stack overflow",
        "Memory leaks",
      ],
      answerIndex: 1,
      explanation: "Strong typing means the language does not implicitly convert between unrelated types (e.g., adding a string and an integer). It prevents silent semantic errors from coercion.",
    },
    {
      q: "Which of the following is an example of a dependent type?",
      options: [
        "List<String>",
        "Map<K, V>",
        "Vec<3, Int> (a vector of exactly 3 integers)",
        "Optional<Int>",
      ],
      answerIndex: 2,
      explanation: "A dependent type has a value (3) as part of the type itself. Vec<3, Int> encodes the length at the type level, allowing compile-time bounds checking.",
    },
    {
      q: "In TypeScript, what does 'strictNullChecks' do?",
      options: [
        "Prevents all null values",
        "Makes null and undefined separate types that must be explicitly handled",
        "Converts null to undefined automatically",
        "Enables runtime null pointer exceptions",
      ],
      answerIndex: 1,
      explanation: "With strictNullChecks enabled, null and undefined are not assignable to other types unless explicitly included in a union (e.g., string | null). This forces explicit handling of nullable values.",
    },
    {
      q: "What is type erasure in Java generics?",
      options: [
        "The compiler removes all type annotations before parsing",
        "Generic type parameters are removed at compile time and replaced with Object (or bounds) in bytecode",
        "Types are erased when objects are garbage collected",
        "The JVM dynamically erases types for performance",
      ],
      answerIndex: 1,
      explanation: "Java implements generics via erasure: List<String> and List<Integer> are both List<Object> at runtime. This maintains backward compatibility but prevents runtime type inspection of generic parameters.",
    },
  ],
  exercises: [
    "Create a TypeScript type-level function that computes the length of a tuple type at compile time: type Length<T extends any[]> = ... . Test it with Length<[string, number, boolean]> which should equal 3.",
    "Write a Haskell function that is polymorphic over any Functor: fmapTwice :: Functor f => (a -> a) -> f a -> f a. Test it with Maybe, List, and IO.",
    "Implement a 'tagged newtype' pattern in Python using NewType from the typing module: create Meters and Seconds types that are both ints at runtime but flagged as incompatible by mypy.",
    "In Java, demonstrate type erasure by writing code that compiles but fails at runtime due to generic type information being unavailable (e.g., instanceof check on a generic type).",
    "Implement a simple type checker for a tiny expression language (integers, booleans, addition, if-then-else) in any language. The checker should reject 'if 3 then 4 else 5' (non-boolean condition) and 'true + 1' (type mismatch).",
  ],
  flashcards: [
    { front: "What is the difference between static and dynamic typing?", back: "Static typing checks types at compile time (before execution). Dynamic typing checks types at runtime (during execution). Static catches errors earlier; dynamic offers more flexibility." },
    { front: "What is structural typing?", back: "Types are compatible if they have the same structure (fields, methods) regardless of their declared names. TypeScript and Go use structural typing." },
    { front: "What is nominal typing?", back: "Types are compatible only if they share a declared relationship (same name, inheritance, or explicit interface implementation). Java, C#, and Swift use nominal typing." },
    { front: "What is type inference?", back: "The compiler's ability to deduce types without explicit annotations. Hindley-Milner can infer the most general type for any expression in ML-family languages." },
    { front: "What is a dependent type?", back: "A type that depends on a value. Example: Vec 5 Int is a vector of exactly 5 integers. Enables compile-time verification of value-dependent properties." },
    { front: "What is covariance?", back: "A generic type G<T> is covariant if G<Sub> is a subtype of G<Super> when Sub is a subtype of Super. Safe for producers/read-only types (e.g., List<out T> in Kotlin)." },
    { front: "What is type erasure?", back: "The process (used by Java) of removing generic type parameters at compile time, replacing them with their bounds (usually Object). Prevents runtime reflection on generic types." },
    { front: "What is gradual typing?", back: "A type system that allows mixing typed and untyped code in the same program. TypeScript's 'any' type and Python's optional type hints are gradual typing mechanisms." },
  ],
  revisionNotes: [
    "Static vs. Dynamic = when types are checked (compile time vs. runtime). Strong vs. Weak = how strictly types are enforced (reject vs. coerce mismatches).",
    "Nominal typing requires declared relationships; structural typing only requires matching shapes. Go interfaces are structural; Java interfaces are nominal.",
    "Hindley-Milner type inference: assign type variables, generate constraints, unify, generalize. Complete and decidable for System F without subtyping.",
    "Java generics use type erasure: generic info is compile-time only. C++ templates are monomorphized: a fresh copy is generated for each type argument.",
    "Variance: covariant = safe for output (out/extends), contravariant = safe for input (in/super), invariant = mutable containers.",
    "Rust's ownership is an affine type system: values used at most once, enforcing memory safety without GC.",
    "Dependent types (Idris, Agda) encode value constraints in types. Powerful but type checking can become undecidable.",
  ],
  cheatSheet: [
    "Static + Strong + Nominal: Java, C#, Swift — maximum ceremony, maximum safety.",
    "Static + Strong + Structural: TypeScript, Go — less boilerplate, still safe.",
    "Static + Strong + Inferred: Haskell, Rust, Kotlin — minimal annotations, maximum safety.",
    "Dynamic + Strong: Python, Ruby — flexible, but runtime TypeErrors possible.",
    "Static + Weak: C — fast, but type punning and implicit conversions cause UB.",
    "Dynamic + Weak: JavaScript — maximum flexibility, maximum surprise ([] + {} === '[object Object]').",
    "Gradual: TypeScript (any), Python (mypy) — incremental adoption of static types.",
    "Covariance: Producer<out T> / ? extends T — safe to read, not write.",
    "Contravariance: Consumer<in T> / ? super T — safe to write, not read.",
  ],
  resources: [
    { label: "Types and Programming Languages by Benjamin C. Pierce", kind: "book", note: "The definitive graduate textbook on type theory, covering lambda calculus, subtyping, polymorphism, and more." },
    { label: "TypeScript Handbook", kind: "docs", note: "Official documentation covering TypeScript's structural type system, generics, conditional types, and utility types." },
    { label: "Haskell Wiki — Type System", kind: "docs", note: "Community wiki with in-depth explanations of Haskell's type classes, kinds, GADTs, and type families." },
    { label: "What Every Programmer Should Know About Types (article)", kind: "article", note: "Accessible overview of type system concepts for working programmers, covering the practical implications of different type system designs." },
    { label: "The Little Typer by Friedman and Christiansen", kind: "book", note: "Gentle introduction to dependent types using Pie, a teaching language. Builds intuition for types-as-propositions." },
    { label: "Rust Reference — Type System", kind: "docs", note: "Covers ownership, borrowing, lifetimes, traits, and how they interact with Rust's type system." },
  ],
  glossary: [
    { term: "Static Typing", definition: "Type checking performed at compile time, before the program executes. Errors are caught before deployment." },
    { term: "Dynamic Typing", definition: "Type checking performed at runtime, when operations are actually executed. Provides flexibility at the cost of later error detection." },
    { term: "Nominal Typing", definition: "Type compatibility determined by explicit declarations (class names, interface implementations, inheritance). Two types with identical structure are incompatible unless explicitly related." },
    { term: "Structural Typing", definition: "Type compatibility determined by the shape of a type (its fields and methods), regardless of declared names or inheritance." },
    { term: "Type Inference", definition: "The compiler's ability to automatically deduce the type of an expression without explicit annotations from the programmer." },
    { term: "Hindley-Milner", definition: "A type inference algorithm that can determine the most general (principal) type of any expression in a polymorphic lambda calculus. Used in Haskell, ML, and Rust." },
    { term: "Dependent Type", definition: "A type that is parameterized by a value, not just another type. Example: a list type that includes its length, enabling compile-time bounds checking." },
    { term: "Variance", definition: "Describes how subtyping of parameterized types relates to subtyping of their type arguments: covariant (output), contravariant (input), or invariant (both)." },
    { term: "Type Erasure", definition: "The removal of generic type information during compilation. In Java, List<String> becomes List<Object> in bytecode, preventing runtime inspection of type arguments." },
    { term: "Gradual Typing", definition: "A type system that allows mixing statically typed and dynamically typed code, with an escape hatch (like 'any' in TypeScript) at the boundary." },
  ],
};
