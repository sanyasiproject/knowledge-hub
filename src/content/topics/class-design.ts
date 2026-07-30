import type { TopicContent } from "../types";

export const classDesign: TopicContent = {
  quickSummary: [
    "Cohesive classes group related data and behavior around a single, well-defined responsibility. A cohesive class is easy to name, test, and reason about because everything in it serves one purpose.",
    "Good API design follows principles of least surprise, consistency, and discoverability. Method names should be verbs describing the action, parameters should be minimal and well-typed, and return types should be predictable.",
    "Immutability means once an object is created, its state cannot change. Immutable objects are inherently thread-safe, easier to reason about, safe as hash map keys, and simplify debugging because their state at creation is their state forever.",
    "Effective class design balances encapsulation (hiding internal details), cohesion (keeping related things together), and coupling (minimizing dependencies between classes).",
  ],
  detailed: [
    "## Designing Cohesive Classes\n\nCohesion measures how strongly related the responsibilities of a class are. High cohesion means every field and method in a class contributes to a single, focused purpose. A `UserAuthenticator` that handles login, password hashing, and token generation is cohesive. A `UserManager` that handles authentication, profile management, email notifications, and report generation is not. To check cohesion, ask: 'If I split this class in two, would either half need the other's fields?' If not, split it. The LCOM (Lack of Cohesion of Methods) metric formalizes this: if methods don't share instance variables, cohesion is low. Strive for classes where most methods use most fields.",
    "## API Design Principles\n\nA well-designed class API makes the right thing easy and the wrong thing hard. **Principle of least surprise**: `list.remove(item)` should remove the item, not return a new list without it (unless the class is documented as immutable). **Consistency**: if `getUser()` returns null on not-found, `getOrder()` should too, not throw an exception. **Fail fast**: validate inputs in constructors and methods early, throwing meaningful exceptions. **Builder pattern for complex construction**: when a constructor would need more than 3-4 parameters, use a builder. **Fluent interfaces** (method chaining) work well for configuration objects but can hurt readability for business logic. Avoid boolean parameters; use enums or separate methods for clarity.",
    "## Immutability in Practice\n\nTo make a class immutable: (1) declare it `final` (or sealed) so it cannot be subclassed, (2) make all fields `private final`, (3) don't provide setters, (4) if the class holds mutable objects (like lists or dates), return defensive copies from getters and copy inputs in the constructor, (5) ensure the class is fully initialized in the constructor. In TypeScript/JavaScript, use `readonly` properties and `Object.freeze()`. Immutable objects shine in concurrent systems: no synchronization needed. They also enable value semantics: two `Money(10, 'USD')` objects with the same fields are interchangeable. The trade-off is performance: every 'change' creates a new object. Structural sharing (as in persistent data structures) mitigates this.",
    "## Encapsulation and Information Hiding\n\nEncapsulation means bundling data with the methods that operate on it and restricting direct access to internal state. This isn't just about making fields private; it's about exposing a meaningful API that hides implementation decisions. A `Stack` exposes `push()`, `pop()`, and `peek()`, not whether it uses an array or linked list internally. Good encapsulation lets you change the internal representation (array to linked list) without affecting clients. Tell, don't ask: instead of `if (account.getBalance() >= amount) account.setBalance(account.getBalance() - amount)`, use `account.withdraw(amount)` which encapsulates the validation and state change.",
    "## Coupling and Dependency Management\n\nCoupling measures how dependent one class is on another's internals. Tight coupling means changes in one class ripple through many others. Reduce coupling by: depending on interfaces rather than concrete classes (Dependency Inversion), using events or callbacks instead of direct method calls for cross-cutting concerns, keeping method parameters general (accept `Iterable<T>` instead of `ArrayList<T>`), and following the Law of Demeter (only talk to your immediate friends, not `a.getB().getC().doSomething()`). The goal is that most classes can be understood, tested, and modified in isolation.",
  ],
  interviewQA: [
    {
      q: "How do you decide what should be a method on a class vs. a separate utility function?",
      a: "A method belongs on a class if it operates primarily on that class's data and represents behavior intrinsic to the concept. `order.calculateTotal()` belongs on Order because it uses Order's items and discounts. A formatting function `formatCurrency(amount)` is a utility because it works on primitive data and isn't specific to any domain class. The 'Feature Envy' code smell helps: if a method in class A uses more data from class B than from A, it probably belongs on B. Utility functions are appropriate for stateless transformations, cross-cutting concerns, and operations on primitives.",
    },
    {
      q: "What are the pros and cons of immutability?",
      a: "Pros: thread safety without locks, simpler debugging (state doesn't change after creation), safe to use as hash map keys and set elements, enables structural sharing for efficient persistent data structures, makes temporal reasoning easy (no need to track when state changed). Cons: every modification creates a new object, which increases GC pressure; deeply nested immutable structures require builders or copy-with-modification patterns that can be verbose; not suitable for large, frequently mutated state like game worlds or pixel buffers. In practice, default to immutable for value objects and domain entities, use mutability for performance-critical hot paths.",
    },
    {
      q: "How would you refactor a class that has too many responsibilities?",
      a: "First, identify the distinct responsibilities by listing what the class does and grouping related methods. Then extract each group into its own class. For example, a `UserService` handling registration, authentication, profile updates, and notification sending can be split into `RegistrationService`, `AuthService`, `ProfileService`, and `NotificationService`. Move the relevant fields and methods to each new class. The original class might become a facade that delegates to the new classes, or it might be removed entirely. Ensure each new class has a clear, single purpose and can be tested independently. Update callers incrementally.",
    },
    {
      q: "What makes a good class constructor?",
      a: "A good constructor fully initializes the object into a valid state. It should validate all inputs and throw exceptions for invalid arguments. It should not perform heavy I/O or computation (use factory methods for that). Keep parameter count low (3-4 max); use the Builder pattern for more. Avoid doing work that creates side effects (like registering the object in a global registry). For optional parameters, use telescoping constructors, builders, or a configuration object. The result of calling `new` should be an object that is immediately usable and internally consistent.",
    },
  ],
  mcqs: [
    {
      q: "Which of the following is NOT a requirement for making a class immutable?",
      options: [
        "Make all fields private and final",
        "Don't provide setter methods",
        "Mark the class as final or sealed",
        "Use only primitive fields",
      ],
      answerIndex: 3,
      explanation:
        "Immutable classes can have non-primitive fields, but they must make defensive copies of mutable objects in the constructor and getters. Using only primitives is not required.",
    },
    {
      q: "The 'Tell, Don't Ask' principle means:",
      options: [
        "Always use command-line interfaces instead of GUIs",
        "Send commands to objects instead of querying state and acting on it externally",
        "Log every method call for debugging",
        "Use assertions instead of return values",
      ],
      answerIndex: 1,
      explanation:
        "Tell, Don't Ask means instead of getting data from an object, making decisions externally, and setting state back, you tell the object what to do and let it manage its own state. This promotes encapsulation.",
    },
    {
      q: "A class where most methods use most instance fields exhibits:",
      options: [
        "High coupling",
        "Low cohesion",
        "High cohesion",
        "Feature envy",
      ],
      answerIndex: 2,
      explanation:
        "When most methods use most fields, the class's responsibilities are tightly related, indicating high cohesion. Low cohesion would be when methods are grouped that don't share data.",
    },
    {
      q: "Which pattern is most appropriate when a class constructor would need 8 parameters?",
      options: [
        "Singleton pattern",
        "Builder pattern",
        "Observer pattern",
        "Strategy pattern",
      ],
      answerIndex: 1,
      explanation:
        "The Builder pattern provides a readable, step-by-step way to construct complex objects with many parameters. It avoids long parameter lists and makes it clear which values are being set.",
    },
  ],
  flashcards: [
    {
      front: "What is cohesion in class design?",
      back: "Cohesion measures how strongly related the responsibilities within a class are. High cohesion means all fields and methods serve a single, focused purpose. Low cohesion means the class handles unrelated responsibilities and should be split.",
    },
    {
      front: "What is the Law of Demeter?",
      back: "Also called 'Don't talk to strangers.' A method should only call methods on: (1) its own object, (2) objects passed as parameters, (3) objects it creates, (4) its direct component objects. Avoid chains like a.getB().getC().doSomething().",
    },
    {
      front: "What is a defensive copy?",
      back: "A copy made to protect an immutable object's state. In the constructor, copy mutable inputs before storing them. In getters, return copies of mutable fields. This prevents external code from modifying the internal state through shared references.",
    },
    {
      front: "What is the 'Feature Envy' code smell?",
      back: "When a method in class A uses more data from class B than from class A itself. The method probably belongs on class B. Example: a method in ReportGenerator that accesses 5 fields from Order but none from ReportGenerator.",
    },
    {
      front: "What is the Builder pattern?",
      back: "A creational pattern for constructing complex objects step by step. Instead of a constructor with many parameters, you use a builder with named methods: new UserBuilder().name('Alice').email('a@b.com').role(ADMIN).build(). The build() method validates and creates the final immutable object.",
    },
    {
      front: "What is structural sharing?",
      back: "A technique used by persistent/immutable data structures where unchanged portions of a data structure are shared between the old and new versions. Only the modified path is copied, making immutable updates O(log n) instead of O(n).",
    },
    {
      front: "What makes a good method name?",
      back: "Use verbs for actions (calculateTotal, sendNotification), 'is/has/can' for boolean queries (isEmpty, hasPermission), 'get/find' for retrievals. Be specific: processPayment() over handle(). Be consistent: if you use 'get' for synchronous and 'fetch' for async, stick with it throughout.",
    },
  ],
  glossary: [
    {
      term: "Cohesion",
      definition:
        "A measure of how closely related and focused the responsibilities of a single class or module are. High cohesion is desirable.",
    },
    {
      term: "Coupling",
      definition:
        "The degree of interdependence between classes or modules. Low (loose) coupling is desirable because it reduces the impact of changes.",
    },
    {
      term: "Immutability",
      definition:
        "A property of objects whose state cannot be modified after creation. Any apparent modification creates a new object instead.",
    },
    {
      term: "Encapsulation",
      definition:
        "Bundling data and the methods that operate on it within a class, and restricting direct access to internal state through access modifiers.",
    },
    {
      term: "Defensive Copy",
      definition:
        "A copy of a mutable object made to prevent external code from modifying an object's internal state. Used in constructors and getters of immutable classes.",
    },
    {
      term: "Fluent Interface",
      definition:
        "An API design where methods return the current object (this), enabling method chaining. Example: builder.setName('x').setAge(5).build().",
    },
    {
      term: "Value Object",
      definition:
        "An object that is defined by its attribute values rather than its identity. Two value objects with the same attributes are considered equal. Typically immutable. Examples: Money, DateRange, Address.",
    },
  ],
};
