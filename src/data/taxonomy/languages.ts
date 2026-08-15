import type { Domain } from "../schema";

export const languagesAndParadigms: Domain[] = [
  {
    slug: "programming-languages",
    title: "Programming Languages",
    summary: "The concepts shared across all languages — type systems, memory models, and runtimes.",
    icon: "💬",
    group: "Languages & Paradigms",
    categories: [
      {
        slug: "language-concepts",
        title: "Language Concepts",
        summary: "The building blocks common to every language.",
        topics: [
          { slug: "paradigms-overview", title: "Programming Paradigms", summary: "Imperative, OO, functional, declarative — and how they combine.", level: "Beginner", tags: ["languages"], related: ["type-systems", "pure-functions", "encapsulation", "higher-order-functions", "immutability"] },
          { slug: "type-systems", title: "Type Systems", summary: "Static vs dynamic, strong vs weak, and inference.", level: "Intermediate", tags: ["languages", "types"], related: ["compilation-vs-interpretation", "memory-models", "interfaces-abstract-classes", "paradigms-overview", "garbage-collection"] },
          { slug: "memory-models", title: "Memory Models", summary: "Value vs reference, stack vs heap, ownership.", level: "Advanced", tags: ["languages", "memory"], related: ["garbage-collection", "memory-allocation", "virtual-memory", "type-systems", "concurrency-vs-parallelism"] },
        ],
      },
      {
        slug: "runtimes-and-execution",
        title: "Runtimes & Execution",
        summary: "How code actually runs — VMs, GC, and compilation.",
        topics: [
          { slug: "compilation-vs-interpretation", title: "Compilation vs Interpretation", summary: "AOT, JIT, and bytecode.", level: "Intermediate", tags: ["languages"], related: ["virtual-machines", "compilers-interpreters", "garbage-collection", "type-systems", "cpu-architecture"] },
          { slug: "garbage-collection", title: "Garbage Collection", summary: "Automatic memory reclamation and its strategies.", level: "Advanced", tags: ["languages", "memory"], contentReady: ["quick-summary", "animations", "diagrams", "interview-qa"], related: ["memory-allocation", "memory-models", "virtual-machines", "profiling", "latency-throughput"] },
          { slug: "virtual-machines", title: "Virtual Machines & Bytecode", summary: "JVM, CLR, and language runtimes.", level: "Advanced", tags: ["languages"], related: ["compilation-vs-interpretation", "garbage-collection", "container-fundamentals", "compilers-interpreters", "memory-models"] },
        ],
      },
    ],
  },
  {
    slug: "object-oriented-programming",
    title: "Object-Oriented Programming",
    summary: "Modeling software as interacting objects — the dominant paradigm of the industry.",
    icon: "🧩",
    group: "Languages & Paradigms",
    categories: [
      {
        slug: "oop-pillars",
        title: "The Four Pillars",
        summary: "Encapsulation, abstraction, inheritance, polymorphism.",
        topics: [
          { slug: "encapsulation", title: "Encapsulation", summary: "Bundling data with behavior and hiding internals.", level: "Beginner", tags: ["oop"], contentReady: ["quick-summary", "detailed-explanation", "code", "interview-qa"], related: ["abstraction", "inheritance", "polymorphism", "single-responsibility", "law-of-demeter"] },
          { slug: "abstraction", title: "Abstraction", summary: "Exposing what matters, hiding how it works.", level: "Beginner", tags: ["oop"], related: ["encapsulation", "inheritance", "interfaces-abstract-classes", "dependency-inversion", "separation-of-concerns"] },
          { slug: "inheritance", title: "Inheritance", summary: "Reusing and specializing behavior.", level: "Beginner", tags: ["oop"], related: ["encapsulation", "polymorphism", "composition-vs-inheritance", "liskov-substitution", "abstraction"] },
          { slug: "polymorphism", title: "Polymorphism", summary: "One interface, many implementations.", level: "Intermediate", tags: ["oop"], related: ["inheritance", "encapsulation", "interfaces-abstract-classes", "strategy", "liskov-substitution"] },
        ],
      },
      {
        slug: "oop-relationships",
        title: "Relationships & Modeling",
        summary: "How objects relate and how to model a domain.",
        topics: [
          { slug: "composition-vs-inheritance", title: "Composition vs Inheritance", summary: "Why 'favor composition' is the default advice.", level: "Intermediate", tags: ["oop"], related: ["inheritance", "association-aggregation", "decorator", "dependency-inversion", "coupling-cohesion"] },
          { slug: "association-aggregation", title: "Association, Aggregation & Composition", summary: "The has-a relationships and their strengths.", level: "Intermediate", tags: ["oop"], related: ["composition-vs-inheritance", "encapsulation", "class-design", "coupling-cohesion", "lld-fundamentals"] },
          { slug: "interfaces-abstract-classes", title: "Interfaces & Abstract Classes", summary: "Contracts vs partial implementations.", level: "Intermediate", tags: ["oop"], related: ["abstraction", "polymorphism", "interface-segregation", "dependency-inversion", "type-systems"] },
        ],
      },
    ],
  },
  {
    slug: "functional-programming",
    title: "Functional Programming",
    summary: "Building software from pure functions and immutable data.",
    icon: "λ",
    group: "Languages & Paradigms",
    categories: [
      {
        slug: "fp-fundamentals",
        title: "FP Fundamentals",
        summary: "The core ideas that define the paradigm.",
        topics: [
          { slug: "pure-functions", title: "Pure Functions & Side Effects", summary: "Predictable functions and isolating effects.", level: "Beginner", tags: ["fp"], related: ["immutability", "higher-order-functions", "functions", "tdd", "unit-testing"] },
          { slug: "immutability", title: "Immutability", summary: "Data that never changes, and why it helps.", level: "Beginner", tags: ["fp"], related: ["pure-functions", "concurrency-vs-parallelism", "race-conditions", "actor-model", "memory-models"] },
          { slug: "higher-order-functions", title: "Higher-Order Functions", summary: "Functions that take or return functions.", level: "Intermediate", tags: ["fp"], related: ["pure-functions", "function-composition", "recursion", "functors-monads", "functions"] },
          { slug: "recursion", title: "Recursion & Tail Calls", summary: "Solving problems in terms of themselves.", level: "Intermediate", tags: ["fp"], related: ["higher-order-functions", "monotonic-stack", "dfs-traversal", "combinatorics", "function-composition"] },
        ],
      },
      {
        slug: "fp-advanced",
        title: "Advanced FP",
        summary: "The abstractions functional programmers reach for.",
        topics: [
          { slug: "function-composition", title: "Composition & Currying", summary: "Building complex behavior from small functions.", level: "Advanced", tags: ["fp"], related: ["higher-order-functions", "pure-functions", "functors-monads", "separation-of-concerns", "immutability"] },
          { slug: "functors-monads", title: "Functors & Monads", summary: "Structured ways to sequence computation.", level: "Advanced Concepts", tags: ["fp"], related: ["function-composition", "higher-order-functions", "type-systems", "error-handling", "pure-functions"] },
        ],
      },
    ],
  },
  {
    slug: "concurrency-parallelism",
    title: "Concurrency & Parallelism",
    summary: "Doing many things at once — correctly and fast.",
    icon: "🔀",
    group: "Languages & Paradigms",
    categories: [
      {
        slug: "concurrency-models",
        title: "Concurrency Models",
        summary: "The different ways to structure concurrent work.",
        topics: [
          { slug: "concurrency-vs-parallelism", title: "Concurrency vs Parallelism", summary: "Dealing with many things vs doing many things.", level: "Beginner", tags: ["concurrency"], contentReady: ["quick-summary", "comparison", "diagrams", "interview-qa"], related: ["threads-vs-async", "processes-vs-threads", "actor-model", "immutability", "race-conditions"] },
          { slug: "threads-vs-async", title: "Threads vs Async / Event Loops", summary: "Preemptive threads vs cooperative async.", level: "Intermediate", tags: ["concurrency"], related: ["concurrency-vs-parallelism", "actor-model", "processes-vs-threads", "locks-and-atomics", "concurrency-models-backend"] },
          { slug: "actor-model", title: "Actor Model & CSP", summary: "Message-passing concurrency without shared state.", level: "Advanced", tags: ["concurrency"], related: ["threads-vs-async", "concurrency-vs-parallelism", "immutability", "eda-fundamentals", "kafka-fundamentals"] },
        ],
      },
      {
        slug: "synchronization",
        title: "Synchronization & Hazards",
        summary: "Coordinating shared state safely.",
        topics: [
          { slug: "race-conditions", title: "Race Conditions", summary: "When timing changes correctness.", level: "Intermediate", tags: ["concurrency"], related: ["locks-and-atomics", "deadlocks", "synchronization-primitives", "isolation-levels", "immutability"] },
          { slug: "locks-and-atomics", title: "Locks, Atomics & Memory Barriers", summary: "The primitives for safe sharing.", level: "Advanced", tags: ["concurrency"], related: ["race-conditions", "lock-free-programming", "synchronization-primitives", "deadlocks", "memory-models"] },
          { slug: "lock-free-programming", title: "Lock-Free & Wait-Free Programming", summary: "Concurrency without traditional locks.", level: "Advanced Concepts", tags: ["concurrency"], related: ["locks-and-atomics", "race-conditions", "memory-models", "concurrency-vs-parallelism", "redis-patterns"] },
        ],
      },
    ],
  },
];
