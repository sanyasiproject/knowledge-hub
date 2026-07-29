import type { Domain } from "../schema";

export const craftsmanship: Domain[] = [
  {
    slug: "design-patterns",
    title: "Design Patterns",
    summary: "Named, reusable solutions to recurring design problems.",
    icon: "🎯",
    group: "Craftsmanship",
    categories: [
      {
        slug: "creational-patterns",
        title: "Creational Patterns",
        summary: "How objects get created.",
        topics: [
          { slug: "singleton", title: "Singleton", summary: "One shared instance — and why it's controversial.", level: "Beginner", tags: ["patterns"], contentReady: ["quick-summary", "detailed-explanation", "code", "common-mistakes", "interview-qa"] },
          { slug: "factory-method", title: "Factory & Abstract Factory", summary: "Delegating object creation to subclasses.", level: "Intermediate", tags: ["patterns"] },
          { slug: "builder", title: "Builder", summary: "Constructing complex objects step by step.", level: "Intermediate", tags: ["patterns"] },
        ],
      },
      {
        slug: "structural-patterns",
        title: "Structural Patterns",
        summary: "How objects compose into larger structures.",
        topics: [
          { slug: "adapter", title: "Adapter", summary: "Making incompatible interfaces work together.", level: "Intermediate", tags: ["patterns"] },
          { slug: "decorator", title: "Decorator", summary: "Adding behavior without subclassing.", level: "Intermediate", tags: ["patterns"] },
          { slug: "proxy", title: "Proxy", summary: "A stand-in that controls access.", level: "Advanced", tags: ["patterns"] },
        ],
      },
      {
        slug: "behavioral-patterns",
        title: "Behavioral Patterns",
        summary: "How objects communicate and share responsibility.",
        topics: [
          { slug: "observer", title: "Observer", summary: "Publish/subscribe within an object graph.", level: "Intermediate", tags: ["patterns"] },
          { slug: "strategy", title: "Strategy", summary: "Swappable algorithms behind one interface.", level: "Intermediate", tags: ["patterns"] },
          { slug: "state", title: "State", summary: "Behavior that changes with internal state.", level: "Advanced", tags: ["patterns"] },
        ],
      },
    ],
  },
  {
    slug: "solid-principles",
    title: "SOLID Principles",
    summary: "Five principles for building maintainable object-oriented software.",
    icon: "🧱",
    group: "Craftsmanship",
    categories: [
      {
        slug: "the-five-principles",
        title: "The Five Principles",
        summary: "One topic per letter of SOLID.",
        topics: [
          { slug: "single-responsibility", title: "Single Responsibility Principle", summary: "A class should have one reason to change.", level: "Beginner", tags: ["solid"], contentReady: ["quick-summary", "detailed-explanation", "code", "common-mistakes", "interview-qa"] },
          { slug: "open-closed", title: "Open/Closed Principle", summary: "Open for extension, closed for modification.", level: "Intermediate", tags: ["solid"] },
          { slug: "liskov-substitution", title: "Liskov Substitution Principle", summary: "Subtypes must be substitutable for their base types.", level: "Intermediate", tags: ["solid"] },
          { slug: "interface-segregation", title: "Interface Segregation Principle", summary: "Prefer many small interfaces over one large one.", level: "Intermediate", tags: ["solid"] },
          { slug: "dependency-inversion", title: "Dependency Inversion Principle", summary: "Depend on abstractions, not concretions.", level: "Advanced", tags: ["solid"] },
        ],
      },
    ],
  },
  {
    slug: "software-engineering-principles",
    title: "Software Engineering Principles",
    summary: "The heuristics that separate maintainable systems from tangled ones.",
    icon: "📏",
    group: "Craftsmanship",
    categories: [
      {
        slug: "core-principles",
        title: "Core Principles",
        summary: "The most-cited rules of thumb.",
        topics: [
          { slug: "dry-kiss-yagni", title: "DRY, KISS & YAGNI", summary: "Don't repeat yourself, keep it simple, don't over-build.", level: "Beginner", tags: ["principles"] },
          { slug: "coupling-cohesion", title: "Coupling & Cohesion", summary: "The two forces that shape module quality.", level: "Intermediate", tags: ["principles"] },
          { slug: "separation-of-concerns", title: "Separation of Concerns", summary: "One module, one concern.", level: "Intermediate", tags: ["principles"] },
          { slug: "law-of-demeter", title: "Law of Demeter", summary: "Talk only to your immediate friends.", level: "Advanced", tags: ["principles"] },
        ],
      },
    ],
  },
  {
    slug: "clean-code",
    title: "Clean Code",
    summary: "Writing code that humans can read, change, and trust.",
    icon: "✨",
    group: "Craftsmanship",
    categories: [
      {
        slug: "clean-code-practices",
        title: "Practices",
        summary: "Concrete habits for readable code.",
        topics: [
          { slug: "naming", title: "Naming", summary: "The hardest and highest-leverage skill.", level: "Beginner", tags: ["clean-code"] },
          { slug: "functions", title: "Functions", summary: "Small, single-purpose, well-named.", level: "Beginner", tags: ["clean-code"] },
          { slug: "comments", title: "Comments", summary: "When to write them and when they're a smell.", level: "Beginner", tags: ["clean-code"] },
          { slug: "error-handling", title: "Error Handling", summary: "Failing clearly without cluttering logic.", level: "Intermediate", tags: ["clean-code"] },
        ],
      },
    ],
  },
  {
    slug: "refactoring",
    title: "Refactoring",
    summary: "Improving the design of existing code without changing behavior.",
    icon: "🔧",
    group: "Craftsmanship",
    categories: [
      {
        slug: "refactoring-catalog",
        title: "Smells & Techniques",
        summary: "Recognizing problems and the moves that fix them.",
        topics: [
          { slug: "code-smells", title: "Code Smells", summary: "The warning signs that code needs work.", level: "Beginner", tags: ["refactoring"] },
          { slug: "refactoring-techniques", title: "Refactoring Techniques", summary: "Extract, inline, rename, and more.", level: "Intermediate", tags: ["refactoring"] },
          { slug: "refactoring-safely", title: "Refactoring Safely", summary: "Small steps behind a test harness.", level: "Advanced", tags: ["refactoring", "testing"] },
        ],
      },
    ],
  },
  {
    slug: "testing",
    title: "Testing",
    summary: "Proving software works — and keeping it working as it changes.",
    icon: "🧪",
    group: "Craftsmanship",
    categories: [
      {
        slug: "test-types",
        title: "Test Types & The Pyramid",
        summary: "The levels of testing and how they balance.",
        topics: [
          { slug: "unit-testing", title: "Unit Testing", summary: "Fast, isolated tests of small pieces.", level: "Beginner", tags: ["testing"], contentReady: ["quick-summary", "detailed-explanation", "code", "interview-qa"] },
          { slug: "integration-testing", title: "Integration Testing", summary: "Verifying components work together.", level: "Intermediate", tags: ["testing"] },
          { slug: "e2e-testing", title: "End-to-End Testing", summary: "Testing the whole system like a user.", level: "Intermediate", tags: ["testing"] },
          { slug: "test-pyramid", title: "The Test Pyramid", summary: "Balancing speed, cost, and confidence.", level: "Intermediate", tags: ["testing"] },
        ],
      },
      {
        slug: "test-practices",
        title: "Practices & Techniques",
        summary: "How to test well.",
        topics: [
          { slug: "tdd", title: "Test-Driven Development", summary: "Red, green, refactor.", level: "Intermediate", tags: ["testing"] },
          { slug: "test-doubles", title: "Mocks, Stubs & Fakes", summary: "Standing in for real dependencies.", level: "Advanced", tags: ["testing"] },
          { slug: "property-based-testing", title: "Property-Based Testing", summary: "Testing invariants over generated inputs.", level: "Advanced Concepts", tags: ["testing"] },
        ],
      },
    ],
  },
];
