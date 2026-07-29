import type { TopicContent } from "../types";

export const paradigmsOverview: TopicContent = {
  quickSummary: [
    "A programming paradigm is a fundamental style of structuring and reasoning about code; most modern languages support multiple paradigms simultaneously.",
    "The two broadest categories are imperative (tell the machine *how* step-by-step) and declarative (describe *what* you want and let the runtime figure out how).",
    "Object-Oriented Programming (OOP) organizes code around objects that bundle state and behavior; Functional Programming (FP) organizes code around pure functions and immutable data.",
    "Other important paradigms include procedural (structured imperative with functions), logic (declare facts and rules, let the engine derive answers), and event-driven (react to asynchronous events via callbacks or message loops).",
  ],
  detailed: [
    "Imperative programming is the oldest paradigm, rooted in the von Neumann architecture. Programs are sequences of statements that mutate state through assignment, loops, and conditionals. Assembly, C, and early BASIC are quintessential imperative languages. The programmer specifies the exact control flow the CPU should follow.",
    "Declarative programming inverts this: you describe the desired result rather than the steps to achieve it. SQL is the canonical example — you declare which rows you want, and the query optimizer decides the execution plan. HTML and CSS are declarative descriptions of document structure and style. Functional and logic programming are both sub-paradigms of the declarative family.",
    "Object-Oriented Programming models the world as interacting objects, each encapsulating state (fields) and behavior (methods). The four pillars — encapsulation, abstraction, inheritance, and polymorphism — let you build hierarchies of reusable components. Java, C#, and Smalltalk are class-based OOP; JavaScript and Lua use prototype-based OOP where objects inherit directly from other objects rather than from classes.",
    "Functional Programming treats computation as the evaluation of mathematical functions. Core tenets include immutability, first-class and higher-order functions, referential transparency, and avoidance of side effects. Haskell enforces purity via its type system; languages like Scala, Clojure, and modern JavaScript/TypeScript support FP idioms within a multi-paradigm environment.",
    "Logic programming, exemplified by Prolog, lets you state facts and rules; the runtime uses unification and backtracking to derive answers. It excels at constraint satisfaction, theorem proving, and AI search problems. Datalog, a restricted form of logic programming, powers modern program analysis tools like Soufflé.",
    "Event-driven programming structures applications around an event loop that dispatches callbacks in response to I/O, user actions, or timer ticks. GUI frameworks (Qt, SwiftUI), Node.js, and game engines all follow this model. The reactive programming extension (RxJS, Project Reactor) adds composable stream operators on top of the event-driven foundation.",
  ],
  deepDive: [
    "Multi-paradigm convergence is the dominant trend: Rust combines imperative systems programming with algebraic data types and pattern matching from ML-family FP; Kotlin blends OOP with coroutines and extension functions; Swift merges protocol-oriented programming (a structural flavor of OOP) with value semantics and first-class closures. Understanding paradigms in isolation helps you recognize which tool fits each sub-problem within a single codebase.",
    "The expression problem, first articulated by Philip Wadler, highlights a fundamental tension between OOP and FP. OOP makes it easy to add new data variants (new subclasses) but hard to add new operations (you must modify every class). FP makes it easy to add new operations (new functions over a closed algebraic type) but hard to add new data variants (you must update every pattern match). Solutions like type classes (Haskell), extension methods (Kotlin/C#), and the visitor pattern attempt to bridge this gap.",
    "Concurrency paradigms intersect with the list above. The actor model (Erlang/Elixir, Akka) treats concurrent entities as isolated actors exchanging messages — an event-driven + OOP hybrid. Communicating Sequential Processes (Go channels) is a procedural concurrency model. Software Transactional Memory (Clojure, Haskell STM) applies a declarative transactional approach to shared mutable state.",
    "Category theory provides the mathematical foundation for many FP abstractions. Functors (mappable containers), monads (chainable computations that manage context like Maybe, IO, or async), and applicatives formalize patterns that appear across every functional language. While the theory is deep, the practical payoff is composability: once you know something is a monad, you know it supports a standard set of operations regardless of the specific context it manages.",
    "Metaprogramming is sometimes considered its own paradigm. Lisp macros, Rust procedural macros, and Template Haskell let you write code that generates or transforms code at compile time. Reflection (Java, C#) and metaclasses (Python) provide runtime metaprogramming. These capabilities blur the boundary between the language and its programs, enabling domain-specific languages (DSLs) embedded within the host language.",
  ],
  code: [
    {
      language: "python",
      caption: "Imperative: step-by-step mutation",
      source: `# Sum of squares of even numbers, imperative style
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
result = 0
for n in numbers:
    if n % 2 == 0:
        result += n * n
print(result)  # 220`,
    },
    {
      language: "python",
      caption: "Functional: same problem using pure functions and no mutation",
      source: `# Sum of squares of even numbers, functional style
from functools import reduce

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
result = reduce(
    lambda acc, x: acc + x,
    map(lambda n: n * n, filter(lambda n: n % 2 == 0, numbers)),
    0
)
print(result)  # 220

# Or with a generator expression (Pythonic declarative)
result = sum(n * n for n in numbers if n % 2 == 0)`,
    },
    {
      language: "java",
      caption: "OOP: encapsulation, inheritance, and polymorphism",
      source: `// Base class with encapsulated state
abstract class Shape {
    private String color;

    public Shape(String color) { this.color = color; }
    public String getColor() { return color; }

    // Polymorphic method — each subclass provides its own formula
    public abstract double area();
}

class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

class Rectangle extends Shape {
    private double width, height;

    public Rectangle(String color, double w, double h) {
        super(color);
        this.width = w;
        this.height = h;
    }

    @Override
    public double area() {
        return width * height;
    }
}

// Client code depends on the abstraction, not the concrete type
public class Main {
    public static void printArea(Shape s) {
        System.out.printf("%s shape: area = %.2f%n", s.getColor(), s.area());
    }

    public static void main(String[] args) {
        printArea(new Circle("red", 5));       // red shape: area = 78.54
        printArea(new Rectangle("blue", 3, 4)); // blue shape: area = 12.00
    }
}`,
    },
    {
      language: "haskell",
      caption: "Functional (Haskell): algebraic data types and pattern matching",
      source: `-- Algebraic data type for a binary tree
data Tree a = Leaf | Node (Tree a) a (Tree a)
  deriving (Show)

-- Pure function: fold a tree into a single value
foldTree :: (b -> a -> b -> b) -> b -> Tree a -> b
foldTree _ base Leaf         = base
foldTree f base (Node l x r) = f (foldTree f base l) x (foldTree f base r)

-- Sum all values in a tree of integers
treeSum :: Tree Int -> Int
treeSum = foldTree (\\l x r -> l + x + r) 0

-- Build a sample tree:      5
--                          / \\
--                         3   8
--                        / \\
--                       1   4
sample :: Tree Int
sample = Node (Node (Node Leaf 1 Leaf) 3 (Node Leaf 4 Leaf)) 5 (Node Leaf 8 Leaf)

main :: IO ()
main = print (treeSum sample)  -- 21`,
    },
    {
      language: "prolog",
      caption: "Logic programming: facts, rules, and queries",
      source: `% Facts
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).

% Rules
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
sibling(X, Y)     :- parent(P, X), parent(P, Y), X \\= Y.

% Queries (at the Prolog prompt):
% ?- grandparent(tom, ann).   -> true.
% ?- sibling(ann, pat).       -> true.
% ?- grandparent(tom, Who).   -> Who = ann ; Who = pat.`,
    },
    {
      language: "javascript",
      caption: "Event-driven: Node.js HTTP server with callbacks",
      source: `const http = require('http');

// The server is entirely event-driven: the callback fires
// on each incoming request; between requests Node is idle.
const server = http.createServer((req, res) => {
  console.log(\`\${req.method} \${req.url}\`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from an event-driven server\\n');
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

// The event loop keeps the process alive, dispatching
// I/O callbacks, timers, and microtasks as they arrive.`,
    },
    {
      language: "c",
      caption: "Procedural: structured program with functions, no objects",
      source: `#include <stdio.h>
#include <math.h>

// Pure procedure: compute the distance between two 2-D points
double distance(double x1, double y1, double x2, double y2) {
    double dx = x2 - x1;
    double dy = y2 - y1;
    return sqrt(dx * dx + dy * dy);
}

// Procedure that mutates an array in-place (side effect)
void normalize(double* vec, int len) {
    double mag = 0;
    for (int i = 0; i < len; i++) mag += vec[i] * vec[i];
    mag = sqrt(mag);
    for (int i = 0; i < len; i++) vec[i] /= mag;
}

int main(void) {
    printf("Distance: %.4f\\n", distance(0, 0, 3, 4));  // 5.0000

    double v[] = {3.0, 4.0};
    normalize(v, 2);
    printf("Normalized: (%.4f, %.4f)\\n", v[0], v[1]);  // (0.6000, 0.8000)
    return 0;
}`,
    },
    {
      language: "sql",
      caption: "Declarative: SQL describes what, not how",
      source: `-- Find the top 5 customers by total spend in the last 90 days.
-- The database engine decides the join order, index usage, etc.
SELECT
    c.name,
    SUM(o.total) AS total_spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.placed_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.name
ORDER BY total_spend DESC
LIMIT 5;`,
    },
  ],
  diagrams: [
    {
      title: "Paradigm Family Tree",
      kind: "mindmap",
      caption: "Hierarchical relationship between major paradigms, showing how declarative branches into functional and logic, while imperative branches into procedural, OOP, and event-driven.",
    },
    {
      title: "Multi-Paradigm Language Venn Diagram",
      kind: "network",
      caption: "Languages positioned by paradigm support: Haskell (pure FP), Prolog (logic), C (procedural), Java (OOP + imperative), Scala (OOP + FP), JavaScript (imperative + FP + event-driven + OOP), Rust (imperative + FP + procedural).",
    },
    {
      title: "Event-Driven Execution Flow",
      kind: "flow",
      caption: "Event loop cycle: poll for events, dispatch to registered handler, handler runs to completion, return to polling. Illustrates non-blocking I/O and callback invocation.",
    },
  ],
  animations: [
    {
      title: "Imperative vs Functional Execution",
      steps: [
        { label: "Input", detail: "Both approaches receive the list [1, 2, 3, 4, 5, 6]." },
        { label: "Imperative: loop", detail: "A for-loop iterates over elements, testing each with an if-statement, and mutates an accumulator variable in place." },
        { label: "Functional: filter", detail: "filter(isEven) returns a new list [2, 4, 6] without modifying the original." },
        { label: "Functional: map", detail: "map(square) returns [4, 16, 36] from the filtered list." },
        { label: "Functional: reduce", detail: "reduce(add, 0) folds [4, 16, 36] into the single value 56." },
        { label: "Result", detail: "Both approaches produce 56, but the functional version composes three named transformations with no mutable state." },
      ],
    },
    {
      title: "OOP Message Dispatch (Polymorphism)",
      steps: [
        { label: "Call site", detail: "Client code calls shape.area() on a reference typed as the abstract Shape." },
        { label: "Vtable lookup", detail: "The runtime inspects the object's vtable (virtual method table) pointer to find the concrete implementation." },
        { label: "Dispatch to Circle", detail: "If the actual object is a Circle, the Circle::area() method is invoked, computing pi * r^2." },
        { label: "Dispatch to Rectangle", detail: "If the actual object is a Rectangle, Rectangle::area() is invoked, computing width * height." },
        { label: "Return", detail: "The result is returned to the call site, which never needed to know the concrete type." },
      ],
    },
  ],
  comparison: {
    columns: ["Dimension", "Imperative", "OOP", "Functional", "Logic", "Event-Driven"],
    rows: [
      ["Core unit", "Statement", "Object (class)", "Function", "Rule / Fact", "Event handler"],
      ["State management", "Mutable variables", "Encapsulated fields", "Immutable values", "Unification bindings", "Stateless handlers + external store"],
      ["Control flow", "Loops, conditionals", "Method calls, polymorphism", "Recursion, higher-order functions", "Backtracking search", "Event loop + callbacks"],
      ["Composition", "Procedure calls", "Inheritance, composition", "Function composition, monads", "Rule chaining", "Event chaining, middleware"],
      ["Side effects", "Anywhere", "Methods with side effects", "Isolated (IO monad, etc.)", "Controlled (assert/retract)", "In handlers, between events"],
      ["Testing ease", "Moderate (state setup)", "Moderate (mocking)", "High (pure functions)", "High (query-based)", "Moderate (async testing)"],
      ["Canonical language", "C, Go", "Java, C#", "Haskell, Clojure", "Prolog, Datalog", "JavaScript (Node), Erlang"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between imperative and declarative programming?",
      a: "Imperative programming tells the computer *how* to do something step by step (assignments, loops, conditionals). Declarative programming tells the computer *what* result you want without specifying the control flow. SQL is declarative: you describe the result set, and the query engine decides the execution plan. Functional and logic programming are both declarative sub-paradigms.",
      followUps: [
        "Can a language be both imperative and declarative?",
        "Is React declarative? Why or why not?",
      ],
    },
    {
      q: "What are the four pillars of OOP?",
      a: "Encapsulation (bundling data with the methods that operate on it, restricting direct access to internals), Abstraction (exposing only relevant details and hiding complexity), Inheritance (creating new classes from existing ones to reuse and extend behavior), and Polymorphism (using a single interface to represent different underlying types, typically via method overriding or interfaces).",
      followUps: [
        "What problems does inheritance cause and how does composition address them?",
        "Explain the Liskov Substitution Principle.",
      ],
    },
    {
      q: "What is referential transparency and why does it matter?",
      a: "An expression is referentially transparent if it can be replaced with its value without changing the program's behavior. This implies no side effects. It matters because it makes code easier to reason about, test, parallelize, and optimize (the compiler can freely cache or reorder evaluations). Haskell enforces referential transparency; impure languages achieve it by convention.",
      followUps: [
        "How does Haskell handle I/O if all functions must be pure?",
        "What is a monad and how does it relate to referential transparency?",
      ],
    },
    {
      q: "Explain the actor model of concurrency.",
      a: "In the actor model, the fundamental unit is an actor — an isolated entity with its own private state that communicates exclusively via asynchronous message passing. Actors can create other actors, send messages, and decide how to handle the next message. Because there is no shared mutable state, data races are eliminated by design. Erlang/OTP is built on the actor model; Akka brings it to the JVM. The model naturally supports fault tolerance via supervision trees.",
      followUps: [
        "How do supervision trees provide fault tolerance?",
        "Compare the actor model to communicating sequential processes (CSP).",
      ],
    },
    {
      q: "What is the expression problem?",
      a: "The expression problem, named by Philip Wadler, asks: can you add both new data variants and new operations to a system without modifying existing code and while maintaining type safety? OOP makes adding new data variants easy (add a subclass) but adding new operations hard (must modify all classes). FP makes adding new operations easy (add a function) but adding new data variants hard (must update all pattern matches). Solutions include type classes, visitor pattern, and tagless final encoding.",
      followUps: [
        "How do type classes in Haskell solve the expression problem?",
        "How does the visitor pattern relate to the expression problem?",
      ],
    },
    {
      q: "Why might you choose functional programming for a concurrent system?",
      a: "Pure functions and immutable data eliminate data races by construction — if no thread can modify shared state, no locks are needed. This makes concurrent code dramatically easier to reason about and debug. Additionally, FP’s emphasis on composability means concurrent workflows (map-reduce, parallel pipelines) compose naturally. Languages like Erlang, Haskell, and Clojure were designed with this advantage in mind.",
    },
  ],
  followUps: [
    "Explore how algebraic data types and pattern matching bridge OOP and FP concepts.",
    "Study the actor model and CSP as concurrency-oriented paradigms.",
    "Learn how modern languages like Rust, Kotlin, and Swift blend multiple paradigms.",
    "Investigate domain-specific languages (DSLs) as a metaprogramming paradigm.",
    "Understand how reactive programming (RxJS, Project Reactor) extends the event-driven paradigm with composable stream operators.",
  ],
  mcqs: [
    {
      q: "Which paradigm treats computation as the evaluation of mathematical functions with no side effects?",
      options: ["Imperative", "Object-Oriented", "Functional", "Procedural"],
      answerIndex: 2,
      explanation: "Functional programming is defined by pure functions, immutability, and the avoidance of side effects, modeling computation as function evaluation.",
    },
    {
      q: "In Prolog, what mechanism does the runtime use to find variable bindings that satisfy a query?",
      options: ["Garbage collection", "Unification and backtracking", "Dynamic dispatch", "Tail-call optimization"],
      answerIndex: 1,
      explanation: "Prolog's execution engine uses unification to match terms and backtracking to systematically explore alternative solutions when a path fails.",
    },
    {
      q: "Which OOP principle states that objects of a supertype should be replaceable with objects of a subtype without altering program correctness?",
      options: ["Encapsulation", "Liskov Substitution Principle", "Single Responsibility Principle", "Open-Closed Principle"],
      answerIndex: 1,
      explanation: "The Liskov Substitution Principle (LSP) ensures that subclasses honor the contracts of their parent types, preserving correctness under polymorphism.",
    },
    {
      q: "What is the primary control structure in event-driven programming?",
      options: ["For loop", "Recursive descent", "Event loop with callback dispatch", "Backtracking search"],
      answerIndex: 2,
      explanation: "Event-driven programs revolve around an event loop that waits for events and dispatches registered callback handlers for each one.",
    },
    {
      q: "Which statement about imperative vs. declarative programming is FALSE?",
      options: [
        "SQL is a declarative language",
        "Imperative programs specify step-by-step instructions",
        "Declarative programs always run faster than imperative ones",
        "HTML is a declarative markup language",
      ],
      answerIndex: 2,
      explanation: "Declarative programs are not inherently faster. They describe *what* to compute; the runtime decides *how*, which may or may not be more efficient depending on the optimizer and problem.",
    },
    {
      q: "What does the 'expression problem' refer to?",
      options: [
        "The difficulty of parsing arithmetic expressions",
        "The tension between adding new data types vs. new operations without modifying existing code",
        "The problem of evaluating expressions in the wrong order",
        "The challenge of converting infix expressions to postfix",
      ],
      answerIndex: 1,
      explanation: "The expression problem highlights a fundamental design tension: OOP makes new types easy but new operations hard; FP makes new operations easy but new types hard.",
    },
  ],
  exercises: [
    "Implement a stack data structure in three paradigms: (a) procedural C with a struct and functions, (b) OOP Java with a class, and (c) functional Haskell using a list. Compare the APIs.",
    "Write a program that computes the Fibonacci sequence using: (a) an imperative loop, (b) a recursive pure function with memoization, and (c) a lazy infinite stream. Measure performance differences.",
    "Build a tiny event-driven chat server in Node.js where multiple clients can connect via TCP, and messages from one client are broadcast to all others. Identify where callbacks, closures, and the event loop interact.",
    "Model a family tree in Prolog (at least 10 people across 3 generations) and define rules for ancestor, cousin, and uncle/aunt. Query the system to find all cousins of a given person.",
    "Refactor an imperative data-processing script (e.g., parsing a CSV and computing statistics) into a functional pipeline using map, filter, and reduce. Compare readability and testability.",
  ],
  flashcards: [
    { front: "What are the two broadest paradigm families?", back: "Imperative (specify how, step-by-step) and Declarative (specify what, let the runtime decide how)." },
    { front: "Name three sub-paradigms of imperative programming.", back: "Procedural, Object-Oriented, and Event-Driven." },
    { front: "What is a higher-order function?", back: "A function that takes other functions as arguments or returns a function as its result. Examples: map, filter, reduce." },
    { front: "What makes a function 'pure'?", back: "It always returns the same output for the same input (deterministic) and has no side effects (no mutation, no I/O)." },
    { front: "What is unification in logic programming?", back: "The process of finding substitutions for variables that make two terms identical. It is the core mechanism Prolog uses to match queries against facts and rules." },
    { front: "What is dynamic dispatch?", back: "The process of selecting which method implementation to call at runtime based on the actual type of the object, rather than the declared type. It enables polymorphism in OOP." },
    { front: "What is the event loop?", back: "A programming construct that waits for and dispatches events or messages. It continuously checks a queue of events and invokes the corresponding callback handlers." },
    { front: "What is the difference between class-based and prototype-based OOP?", back: "Class-based OOP (Java, C#) defines blueprints (classes) from which objects are instantiated. Prototype-based OOP (JavaScript) creates objects by cloning existing objects (prototypes) and adding or overriding properties." },
  ],
  revisionNotes: [
    "Imperative = step-by-step mutation of state; Declarative = describe the result, let the system handle execution.",
    "OOP's four pillars: Encapsulation, Abstraction, Inheritance, Polymorphism. Prefer composition over inheritance in practice.",
    "FP's core tenets: pure functions, immutability, first-class functions, referential transparency. Monads handle side effects in pure languages.",
    "Logic programming (Prolog) uses facts, rules, unification, and backtracking. Great for constraint satisfaction and search problems.",
    "Event-driven programming revolves around an event loop dispatching callbacks. Non-blocking I/O avoids thread-per-connection overhead.",
    "The expression problem: OOP favors new types; FP favors new operations. Type classes and visitor pattern are common bridges.",
    "Most modern languages are multi-paradigm: Rust (imperative + FP), Kotlin (OOP + FP), Scala (OOP + FP), JavaScript (imperative + FP + event-driven + prototype OOP).",
  ],
  cheatSheet: [
    "Imperative: for, while, if/else, mutable variables, assignments.",
    "Procedural: imperative + modular functions + structs (C, Pascal, Go).",
    "OOP: classes, objects, methods, inheritance, interfaces, polymorphism.",
    "FP: map/filter/reduce, pure functions, immutability, pattern matching, monads.",
    "Logic: facts, rules, queries, unification, backtracking (Prolog).",
    "Event-driven: event loop, callbacks, listeners, emit/on pattern.",
    "Declarative: SQL, HTML, CSS, configuration languages — describe what, not how.",
    "Actor model: isolated actors, async message passing, no shared state (Erlang, Akka).",
    "Reactive: observable streams, operators (map, merge, debounce), backpressure (RxJS, Reactor).",
  ],
  resources: [
    { label: "Structure and Interpretation of Computer Programs (SICP)", kind: "book", note: "Classic MIT text covering functional, imperative, and meta-linguistic abstraction. Freely available online." },
    { label: "Seven Languages in Seven Weeks by Bruce Tate", kind: "book", note: "Tours Ruby, Io, Prolog, Scala, Erlang, Clojure, and Haskell, showcasing how paradigms shape language design." },
    { label: "Paradigms of Artificial Intelligence Programming by Peter Norvig", kind: "book", note: "Deep exploration of logic, rule-based, and functional paradigms applied to AI in Common Lisp." },
    { label: "Learn You a Haskell for Great Good!", kind: "book", note: "Beginner-friendly introduction to pure functional programming in Haskell. Free online." },
    { label: "The Reactive Manifesto", kind: "article", note: "Defines principles of reactive systems: responsive, resilient, elastic, message-driven." },
    { label: "Philip Wadler — The Expression Problem (1998)", kind: "paper", note: "Original formulation of the expression problem and its implications for language design." },
  ],
  glossary: [
    { term: "Paradigm", definition: "A fundamental style or approach to programming that provides a framework for structuring code and reasoning about computation." },
    { term: "Encapsulation", definition: "The OOP principle of bundling data and the methods that operate on it within a single unit (class/object) and restricting direct access to internal state." },
    { term: "Referential Transparency", definition: "A property of expressions that can be replaced by their value without changing program behavior, implying no side effects." },
    { term: "Higher-Order Function", definition: "A function that takes one or more functions as arguments, returns a function, or both. Examples include map, filter, and reduce." },
    { term: "Unification", definition: "In logic programming, the process of finding variable substitutions that make two terms structurally identical." },
    { term: "Polymorphism", definition: "The ability to present the same interface for different underlying data types. Includes subtype polymorphism (OOP), parametric polymorphism (generics), and ad-hoc polymorphism (overloading/type classes)." },
    { term: "Event Loop", definition: "A control structure that continuously polls for events (I/O, timers, user input) and dispatches them to registered handler functions." },
    { term: "Monad", definition: "A design pattern (from category theory) that wraps values in a computational context and provides bind/flatMap to chain context-dependent operations. Used in FP to handle side effects, optionality, and asynchrony." },
  ],
};
