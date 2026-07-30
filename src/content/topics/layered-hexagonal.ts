import type { TopicContent } from "../types";

export const layeredHexagonal: TopicContent = {
  quickSummary: [
    "Layered architecture organizes code into horizontal layers (presentation, business, data access) with strict dependency rules flowing top-down.",
    "Hexagonal (Ports and Adapters) architecture inverts dependencies so the domain core has zero knowledge of infrastructure, communicating through abstract ports.",
    "Onion architecture builds on hexagonal ideas with concentric rings: domain model at the center, surrounded by domain services, application services, and infrastructure at the outermost ring.",
    "All three patterns aim to isolate business logic from infrastructure concerns, improving testability and enabling technology changes without rewriting core logic.",
  ],
  detailed: [
    `## Layered Architecture

The traditional layered (N-tier) architecture divides an application into horizontal layers, each with a specific responsibility:

**Common layers:**
- **Presentation layer** -- handles UI rendering and user interaction (controllers, views, API endpoints).
- **Business logic layer** -- contains domain rules, validations, and workflows.
- **Data access layer** -- manages persistence (repositories, ORM mappings, SQL queries).
- **Infrastructure layer** -- cross-cutting concerns like logging, caching, and external integrations.

**Dependency rule:** Each layer may only depend on the layer directly below it. The presentation layer calls the business layer, which calls the data access layer.

**Strengths:** Simple mental model, well-understood by most developers, works well for CRUD-heavy applications.

**Weaknesses:** Business logic can leak into upper or lower layers. The strict top-down dependency means the domain layer depends on the data access layer, coupling business rules to persistence technology.`,

    `## Hexagonal Architecture (Ports and Adapters)

Proposed by Alistair Cockburn, hexagonal architecture places the application core at the center, surrounded by ports (interfaces) and adapters (implementations).

**Core concepts:**
- **Application core** -- contains business logic and domain model with zero external dependencies.
- **Ports** -- interfaces defined by the core that describe how it wants to interact with the outside world. Divided into:
  - *Driving ports* (primary) -- how external actors invoke the application (e.g., \`OrderService\` interface).
  - *Driven ports* (secondary) -- how the application reaches external systems (e.g., \`OrderRepository\` interface).
- **Adapters** -- concrete implementations of ports that connect to specific technologies:
  - *Driving adapters* -- REST controllers, CLI handlers, message consumers.
  - *Driven adapters* -- PostgreSQL repository, SMTP email sender, Redis cache client.

**Dependency rule:** All dependencies point inward. Adapters depend on ports; the core depends on nothing external.

**Key benefit:** You can swap any adapter (change database, replace message broker, switch from REST to gRPC) without touching business logic.`,

    `## Onion Architecture

Jeffrey Palermo's onion architecture refines hexagonal ideas into explicit concentric layers:

**Layers (inside to outside):**
1. **Domain Model** -- entities, value objects, domain events. Pure business concepts with no dependencies.
2. **Domain Services** -- operations that do not naturally belong to a single entity (e.g., pricing calculations spanning multiple aggregates).
3. **Application Services** -- orchestrate use cases by coordinating domain objects and infrastructure. Define the application's API.
4. **Infrastructure** -- outermost ring; implements interfaces defined by inner layers (repositories, external service clients, UI frameworks).

**Dependency rule:** Dependencies flow strictly inward. Inner layers define interfaces; outer layers implement them (Dependency Inversion Principle).

**Comparison with hexagonal:**
- Onion makes the layering within the core explicit (domain model vs. domain services vs. application services).
- Hexagonal treats the entire core as one unit and focuses on the port/adapter boundary.
- In practice, the two are nearly interchangeable and often combined.`,

    `## Practical Implementation

**Project structure (TypeScript example):**
\`\`\`
src/
  domain/           # Entities, value objects, domain events
    order.ts
    order-repository.ts  # Port (interface only)
  application/       # Use cases / application services
    create-order.ts
    get-order-query.ts
  infrastructure/    # Adapters
    persistence/
      postgres-order-repository.ts
    messaging/
      kafka-event-publisher.ts
  api/               # Driving adapters
    rest/
      order-controller.ts
    graphql/
      order-resolver.ts
\`\`\`

**Dependency injection** is the mechanism that wires adapters to ports at runtime. Use a DI container (InversifyJS, tsyringe) or manual composition in a bootstrap module.

**Testing benefits:**
- Unit test domain logic with no mocks -- pure functions and objects.
- Test application services with in-memory adapter stubs.
- Integration test adapters against real infrastructure (testcontainers).`,

    `## Choosing the Right Architecture

| Factor | Layered | Hexagonal / Onion |
|--------|---------|-------------------|
| Complexity | Low | Medium |
| Domain richness | Simple CRUD | Complex business rules |
| Testability | Moderate (mocking needed) | High (ports are natural seam) |
| Technology flexibility | Low (coupled to DB layer) | High (swap adapters freely) |
| Team experience | Any level | Requires DDD familiarity |

**Guidelines:**
- Start with a modular monolith using hexagonal architecture if you anticipate extracting microservices later -- the port/adapter boundary becomes the service boundary.
- For simple CRUD applications with minimal business logic, layered architecture is pragmatic and sufficient.
- Avoid "architecture astronaut" syndrome: the goal is to protect business logic from infrastructure churn, not to maximize the number of abstractions.`,
  ],
  interviewQA: [
    {
      q: "What problem does hexagonal architecture solve that layered architecture does not?",
      a: "In layered architecture, the business layer depends on the data access layer, meaning business logic is coupled to persistence technology. Hexagonal architecture inverts this dependency: the domain core defines ports (interfaces) for data access, and infrastructure adapters implement them. This means you can change databases, swap messaging systems, or replace any external dependency without modifying business logic. It also makes the domain testable in isolation without mocking infrastructure.",
    },
    {
      q: "How do ports and adapters work in practice?",
      a: "A port is an interface defined by the application core that describes a capability it needs (driven port) or offers (driving port). For example, an OrderRepository interface is a driven port. An adapter is a concrete implementation: PostgresOrderRepository implements OrderRepository using SQL queries. At runtime, dependency injection wires the adapter to the port. The core only references the interface, never the concrete class, so swapping PostgresOrderRepository for MongoOrderRepository requires zero changes to business logic.",
    },
    {
      q: "When would you choose layered architecture over hexagonal?",
      a: "Layered architecture is appropriate for applications that are primarily CRUD operations with minimal business logic -- admin dashboards, simple content management systems, or internal tools where the domain is straightforward. The overhead of defining ports, adapters, and managing dependency inversion is not justified when the business logic is thin and technology changes are unlikely. Layered architecture is also easier for junior teams to understand and maintain.",
    },
    {
      q: "How does onion architecture differ from hexagonal architecture?",
      a: "Both share the same fundamental principle: dependencies point inward, and the domain core has no knowledge of infrastructure. The key difference is that onion architecture explicitly defines concentric layers within the core -- domain model, domain services, and application services -- each with its own responsibility. Hexagonal architecture treats the core as a single unit and focuses on the boundary between the core and the outside world (ports and adapters). In practice, many teams combine both: hexagonal ports/adapters at the boundary with onion layering inside the core.",
    },
  ],
  mcqs: [
    {
      q: "In hexagonal architecture, what is a 'driven port'?",
      options: [
        "An interface that external actors use to invoke the application",
        "An interface defined by the core for reaching external systems",
        "A concrete implementation of a database adapter",
        "A REST controller that handles incoming HTTP requests",
      ],
      answerIndex: 1,
      explanation:
        "A driven (secondary) port is an interface defined by the application core that describes how it wants to interact with external systems (databases, message brokers, etc.). The infrastructure layer provides concrete adapters that implement these ports.",
    },
    {
      q: "What is the fundamental dependency rule in onion architecture?",
      options: [
        "Outer layers define interfaces, inner layers implement them",
        "All layers can depend on any other layer",
        "Dependencies flow strictly inward; inner layers define interfaces, outer layers implement them",
        "The domain layer depends on the infrastructure layer for data access",
      ],
      answerIndex: 2,
      explanation:
        "Onion architecture enforces that dependencies always point inward. Inner layers (domain model, domain services) define interfaces that outer layers (infrastructure) implement. This ensures the domain core has no knowledge of external technologies.",
    },
    {
      q: "Which mechanism wires adapters to ports at runtime in hexagonal architecture?",
      options: [
        "Static factory methods hardcoded in the domain layer",
        "Dependency injection via a composition root or DI container",
        "Direct instantiation within business logic classes",
        "Compile-time code generation",
      ],
      answerIndex: 1,
      explanation:
        "Dependency injection (via a DI container or manual composition root) is the standard mechanism for connecting concrete adapters to abstract ports at runtime, keeping the domain core free of infrastructure references.",
    },
    {
      q: "Which architecture is best suited for a simple CRUD application with minimal business logic?",
      options: [
        "Hexagonal architecture with full port/adapter abstraction",
        "Onion architecture with explicit domain service layers",
        "Traditional layered (N-tier) architecture",
        "Event-driven architecture with CQRS",
      ],
      answerIndex: 2,
      explanation:
        "For simple CRUD applications, the overhead of hexagonal or onion architecture is not justified. Traditional layered architecture provides a straightforward, well-understood structure that matches the simplicity of the domain.",
    },
  ],
  flashcards: [
    {
      front: "What is the Dependency Inversion Principle?",
      back: "High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions. This is the foundation of hexagonal and onion architectures.",
    },
    {
      front: "Driving adapter vs. Driven adapter",
      back: "A driving (primary) adapter initiates interaction with the application (e.g., REST controller, CLI handler). A driven (secondary) adapter is called by the application core to reach external systems (e.g., database repository, email sender).",
    },
    {
      front: "What is a Composition Root?",
      back: "A single location in the application (typically the entry point) where all dependencies are wired together. Adapters are instantiated and injected into the ports they implement, keeping the rest of the codebase free of concrete infrastructure references.",
    },
    {
      front: "Why is testability better in hexagonal architecture?",
      back: "Because the domain core depends only on abstract ports (interfaces), you can substitute in-memory or stub adapters during testing. Domain logic is tested with no mocks, no database, no network calls -- just pure business rule verification.",
    },
    {
      front: "Onion architecture layers (inside to outside)",
      back: "1. Domain Model (entities, value objects) 2. Domain Services (cross-entity operations) 3. Application Services (use case orchestration) 4. Infrastructure (persistence, messaging, UI frameworks).",
    },
    {
      front: "What is the Anti-Corruption Layer in the context of ports and adapters?",
      back: "An adapter that translates between the external system's model and the domain's model, preventing external concepts from leaking into the core. It acts as a boundary that preserves the integrity of the domain language.",
    },
    {
      front: "Key weakness of traditional layered architecture",
      back: "The business logic layer depends on the data access layer, coupling domain rules to persistence technology. This makes it hard to change databases and forces business logic tests to mock data access components.",
    },
  ],
  glossary: [
    {
      term: "Port",
      definition:
        "An interface defined by the application core that describes a contract for interaction. Driving ports define how external actors invoke the application; driven ports define how the application reaches external systems.",
    },
    {
      term: "Adapter",
      definition:
        "A concrete implementation of a port that connects the application core to a specific technology (e.g., a PostgreSQL repository adapter, a REST controller adapter).",
    },
    {
      term: "Composition Root",
      definition:
        "The single point in an application where the dependency graph is assembled, wiring concrete adapters to abstract ports via dependency injection.",
    },
    {
      term: "Dependency Inversion Principle (DIP)",
      definition:
        "A SOLID principle stating that high-level modules should depend on abstractions rather than concrete implementations, enabling loose coupling and easy substitution.",
    },
    {
      term: "Onion Architecture",
      definition:
        "An architectural pattern with concentric layers where dependencies flow inward: domain model at center, surrounded by domain services, application services, and infrastructure at the outermost ring.",
    },
    {
      term: "N-Tier Architecture",
      definition:
        "A traditional architectural pattern that separates an application into horizontal layers (presentation, business, data access), with dependencies flowing top-down from presentation to data.",
    },
    {
      term: "Hexagonal Architecture",
      definition:
        "An architectural pattern (also called Ports and Adapters) that places the domain core at the center with no external dependencies, communicating with the outside world through abstract ports implemented by concrete adapters.",
    },
  ],
};
