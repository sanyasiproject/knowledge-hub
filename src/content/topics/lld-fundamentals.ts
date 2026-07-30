import type { TopicContent } from "../types";

export const lldFundamentals: TopicContent = {
  quickSummary: [
    "Low-Level Design (LLD) bridges high-level architecture and actual code by specifying class structures, relationships, method signatures, and interaction flows. It answers 'how exactly will these components work together at the code level?'",
    "Class diagrams capture the static structure of a system: classes, attributes, methods, and relationships (inheritance, composition, association). Sequence diagrams capture the dynamic behavior: how objects interact over time to fulfill a use case.",
    "SOLID principles in practice guide LLD decisions. Single Responsibility keeps classes focused, Open/Closed enables extension without modification, Liskov Substitution ensures correct polymorphism, Interface Segregation prevents bloated interfaces, and Dependency Inversion decouples high-level logic from low-level details.",
    "Good LLD balances extensibility with simplicity. Over-engineering with unnecessary abstractions is as harmful as under-engineering with tightly coupled code. Design for the requirements you have plus one level of foreseeable change.",
  ],
  detailed: [
    "## Class Diagrams in LLD\n\nA class diagram is the backbone of any LLD. Each class box shows the class name, its attributes (with types and visibility), and its methods. Relationships between classes include: **Association** (a Teacher *teaches* Students), **Aggregation** (a Department *has* Professors, but professors exist independently), **Composition** (a House *contains* Rooms; rooms don't exist without the house), and **Inheritance** (a SavingsAccount *is-a* BankAccount). Multiplicity annotations (1..*, 0..1) specify cardinality. When drawing class diagrams, start from the nouns in your requirements, identify their responsibilities, and connect them through their natural relationships.",
    "## Sequence Diagrams\n\nSequence diagrams show how objects collaborate to achieve a specific use case. The vertical axis represents time (top to bottom), and horizontal lifelines represent objects. Arrows between lifelines are method calls (solid) and returns (dashed). Key elements include: synchronous calls (filled arrowhead), asynchronous calls (open arrowhead), self-calls (arrow looping back), alt/opt/loop frames for conditionals and iterations. For LLD interviews, draw sequence diagrams for critical flows: user login, placing an order, processing a payment. They reveal hidden interactions and help identify missing classes or methods.",
    "## SOLID in Practice\n\n**SRP**: A `UserService` should handle user CRUD, not also send emails. Extract `EmailService`. **OCP**: Use the Strategy pattern so a `PaymentProcessor` can accept new payment methods without modifying existing code. **LSP**: If `Square extends Rectangle`, calling `setWidth()` on a Square must not violate Rectangle's contract. Prefer composition. **ISP**: Don't force a `ReadOnlyRepository` to implement `save()` and `delete()` from a fat `Repository` interface. Split into `Readable` and `Writable`. **DIP**: A `NotificationService` should depend on a `MessageSender` interface, not directly on `SmsSender` or `EmailSender` classes.",
    "## From Requirements to LLD\n\nThe LLD process follows a structured approach: (1) Gather functional requirements and identify use cases, (2) Extract nouns as candidate classes and verbs as candidate methods, (3) Define relationships and multiplicities between classes, (4) Apply SOLID principles and design patterns where they reduce complexity, (5) Draw sequence diagrams for key flows to validate the design, (6) Refine based on non-functional requirements like thread safety or extensibility. Always validate your design against the original requirements to ensure completeness without over-engineering.",
    "## Common LLD Pitfalls\n\nAvoid **God classes** that accumulate too many responsibilities. Avoid **premature abstraction**: don't create interfaces with only one implementation unless you foresee a genuine need. Avoid **circular dependencies** between classes, which signal poor separation of concerns. Avoid **anemic domain models** where classes are just data holders with all logic in service classes. Strive for **rich domain models** where objects encapsulate both data and behavior relevant to their domain concept.",
  ],
  interviewQA: [
    {
      q: "How do you decide between inheritance and composition in LLD?",
      a: "Use inheritance when there is a genuine 'is-a' relationship and the subclass truly extends the superclass's behavior without violating the Liskov Substitution Principle. Use composition when you want 'has-a' relationships or need to combine behaviors from multiple sources. Composition is generally preferred because it avoids the fragile base class problem, enables runtime flexibility (you can swap composed objects), and avoids deep inheritance hierarchies. A classic example: instead of FlyingDuck extending Duck, have Duck contain a FlyBehavior interface that can be SwimFly, NoFly, or RocketFly.",
    },
    {
      q: "Walk me through creating a class diagram for an e-commerce order system.",
      a: "Start with core entities from requirements: Customer, Order, OrderItem, Product, Payment, Address. Customer has a 1-to-many relationship with Order. Order contains OrderItems (composition, 1-to-many). Each OrderItem references a Product (association). Order has a shipping Address (aggregation) and a Payment (composition). Order has states: CREATED, PAID, SHIPPED, DELIVERED, CANCELLED, managed via a state field or State pattern. Key methods: Order.addItem(), Order.calculateTotal(), Order.applyDiscount(), Payment.process(). Apply SRP by separating OrderService (business logic), PaymentGateway (payment processing), and NotificationService (emails/SMS).",
    },
    {
      q: "When should you use a sequence diagram vs. a class diagram in an interview?",
      a: "Use class diagrams when the interviewer asks about the structure: 'Design the classes for X.' Use sequence diagrams when they ask about flows: 'How does X happen in your system?' Often you need both. Start with a class diagram to establish the players, then use sequence diagrams to validate that the classes interact correctly for key use cases. In an interview, a sequence diagram is especially powerful for showing you understand the runtime behavior, not just the static structure. Draw them for the 2-3 most important flows.",
    },
    {
      q: "How do you apply the Open/Closed Principle in real code?",
      a: "The key is to identify the axis of change. If your system needs to support multiple notification channels (email, SMS, push), define a Notifier interface with a send() method. Each channel implements it. When a new channel arrives (Slack, WhatsApp), you add a new class implementing Notifier without modifying existing code. Common mechanisms: Strategy pattern (swap algorithms), Template Method (override specific steps), Decorator (layer on behavior), Plugin architecture (load extensions dynamically). The principle doesn't mean never modifying existing code; it means structuring code so that the most likely changes are additions rather than modifications.",
    },
  ],
  mcqs: [
    {
      q: "In a UML class diagram, a filled diamond on the relationship line indicates:",
      options: [
        "Association",
        "Aggregation",
        "Composition",
        "Inheritance",
      ],
      answerIndex: 2,
      explanation:
        "A filled diamond represents composition, meaning the contained object cannot exist independently of the container. An empty diamond represents aggregation, where the contained object can exist independently.",
    },
    {
      q: "Which SOLID principle is violated when a subclass throws an UnsupportedOperationException for a method inherited from its parent?",
      options: [
        "Single Responsibility Principle",
        "Open/Closed Principle",
        "Liskov Substitution Principle",
        "Dependency Inversion Principle",
      ],
      answerIndex: 2,
      explanation:
        "Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without breaking the program. Throwing UnsupportedOperationException means the subclass cannot be used where the parent is expected.",
    },
    {
      q: "In a sequence diagram, a combined fragment labeled 'alt' represents:",
      options: [
        "A loop that repeats",
        "An optional interaction",
        "Alternative flows based on a condition (if/else)",
        "Parallel execution of interactions",
      ],
      answerIndex: 2,
      explanation:
        "The 'alt' fragment represents alternative flows, similar to if/else. 'opt' is for optional (if without else), 'loop' for repetition, and 'par' for parallel execution.",
    },
    {
      q: "Which relationship should you use when a Car has an Engine that is created and destroyed with the Car?",
      options: [
        "Association",
        "Aggregation",
        "Composition",
        "Dependency",
      ],
      answerIndex: 2,
      explanation:
        "Composition indicates a strong ownership where the part (Engine) cannot exist without the whole (Car). When the Car is destroyed, the Engine is destroyed with it. Aggregation would imply the Engine could exist independently.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between association, aggregation, and composition?",
      back: "Association: general relationship (Teacher teaches Student). Aggregation: weak 'has-a' with independent lifecycle (Department has Professors). Composition: strong 'has-a' where part cannot exist without whole (House has Rooms). Composition uses a filled diamond in UML; aggregation uses an empty diamond.",
    },
    {
      front: "What are the five SOLID principles?",
      back: "S: Single Responsibility - one reason to change. O: Open/Closed - open for extension, closed for modification. L: Liskov Substitution - subtypes must be substitutable. I: Interface Segregation - prefer specific interfaces over general ones. D: Dependency Inversion - depend on abstractions, not concretions.",
    },
    {
      front: "What does a sequence diagram lifeline represent?",
      back: "A lifeline is a vertical dashed line representing an object's existence over time. The activation bar (thin rectangle on the lifeline) shows when the object is actively processing. Messages (arrows) between lifelines represent method calls and returns.",
    },
    {
      front: "What is the 'fragile base class' problem?",
      back: "When changes to a base class unintentionally break subclasses because they depend on the base class's implementation details. This is a key reason to prefer composition over inheritance. With composition, changes to a composed object's internals don't affect the composing class as long as the interface is stable.",
    },
    {
      front: "How do you identify classes from requirements?",
      back: "Extract nouns from requirements as candidate classes (User, Order, Payment). Extract verbs as candidate methods (placeOrder, processPayment). Filter out attributes disguised as classes. Group related attributes and behaviors. Validate by checking if each class has a clear, single responsibility.",
    },
    {
      front: "What is an anemic domain model?",
      back: "A design anti-pattern where domain objects are pure data holders (only getters/setters) with all business logic in separate service classes. This violates encapsulation. Rich domain models place behavior alongside the data it operates on, e.g., Order.calculateTotal() instead of OrderService.calculateTotal(order).",
    },
    {
      front: "What are the key combined fragments in sequence diagrams?",
      back: "alt: if/else alternatives. opt: optional (if without else). loop: iteration with a guard condition. par: parallel execution. break: exit the enclosing interaction. ref: reference to another sequence diagram. critical: a critical section that must execute atomically.",
    },
  ],
  glossary: [
    {
      term: "Class Diagram",
      definition:
        "A UML structural diagram showing classes, their attributes, methods, and relationships. It represents the static structure of a system.",
    },
    {
      term: "Sequence Diagram",
      definition:
        "A UML behavioral diagram showing how objects interact over time through message passing to fulfill a specific use case or scenario.",
    },
    {
      term: "Composition",
      definition:
        "A strong form of association where the part object's lifecycle is managed by the whole. The part cannot exist independently. Represented by a filled diamond in UML.",
    },
    {
      term: "Aggregation",
      definition:
        "A weaker form of association where the part can exist independently of the whole. Represented by an empty diamond in UML.",
    },
    {
      term: "SOLID",
      definition:
        "An acronym for five object-oriented design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
    },
    {
      term: "Multiplicity",
      definition:
        "In UML, a notation on associations indicating how many instances of one class relate to instances of another. Examples: 1 (exactly one), 0..1 (zero or one), * (zero or many), 1..* (one or many).",
    },
    {
      term: "Lifeline",
      definition:
        "In a sequence diagram, a vertical dashed line representing the existence of an object over time. Messages are exchanged between lifelines.",
    },
  ],
};
