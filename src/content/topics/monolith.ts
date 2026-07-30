import type { TopicContent } from "../types";

export const monolith: TopicContent = {
  quickSummary: [
    "A monolithic architecture deploys the entire application as a single unit, with all modules sharing the same process, memory space, and database.",
    "A modular monolith enforces strict module boundaries within a single deployable, gaining many benefits of microservices without distributed systems complexity.",
    "Monoliths are often the right choice for small-to-medium teams, new products, and domains where boundaries are not yet well understood.",
    "Migration from monolith to microservices should be incremental, extracting services along well-defined domain boundaries using patterns like Strangler Fig.",
  ],
  detailed: [
    `## What Is a Monolith?

A monolithic application is built and deployed as a single unit. All features — user management, orders, payments, notifications — live in one codebase, one build artifact, and one runtime process.

**Characteristics**:
- Single deployable artifact (WAR, Docker image, binary).
- Shared database — all modules read and write to the same schema.
- In-process communication — function calls, not network calls.
- Single technology stack.

**Advantages**:
- **Simplicity**: one repo, one build, one deployment, one runtime to monitor.
- **Performance**: in-process calls are orders of magnitude faster than network calls.
- **Consistency**: ACID transactions across all data without distributed coordination.
- **Easy debugging**: a single stack trace captures the full request path.
- **Low operational overhead**: no service mesh, no distributed tracing, no inter-service auth.

**Disadvantages**:
- **Scaling granularity**: must scale the entire application even if only one module is the bottleneck.
- **Deployment risk**: a bug in any module requires redeploying everything.
- **Team coupling**: large teams stepping on each other in a shared codebase.
- **Technology lock-in**: the entire application must use the same language and framework.`,

    `## The Modular Monolith

A modular monolith imposes strict boundaries between modules within a single deployable:

- **Explicit module boundaries**: each module has a public API (interface) and private internals. Modules communicate only through defined interfaces, not by reaching into each other's internals.
- **Separate data ownership**: each module owns its database tables. Cross-module data access goes through the module's API, not direct SQL joins.
- **Enforced boundaries**: use package visibility, architecture fitness functions (ArchUnit), or module systems (Java JPMS, .NET projects) to prevent boundary violations.

**Benefits over a traditional monolith**:
- Modules can be independently developed and tested.
- Clear ownership and reduced coupling.
- Easier to extract into microservices later if needed — boundaries are already defined.

**Benefits over microservices**:
- No distributed systems complexity (network failures, eventual consistency, distributed transactions).
- In-process calls instead of network calls.
- Single deployment and operational model.
- Easier to refactor boundaries when domain understanding evolves.

Many experts now recommend starting with a modular monolith and only extracting services when there is a clear, demonstrated need.`,

    `## When a Monolith Fits

A monolith is often the right choice when:

| Situation | Why Monolith |
|-----------|-------------|
| New product / startup | Domain boundaries are unclear; refactoring is easy in a monolith |
| Small team (< 10 engineers) | Distributed systems overhead exceeds the team's capacity |
| Simple domain | The business logic does not warrant independent scaling or deployment |
| Strong consistency needed | ACID transactions are natural; distributed sagas are not |
| Rapid prototyping | Fastest path from idea to working software |
| Performance-critical path | In-process calls avoid network latency |

**Signs you may need to move away from a monolith**:
- Deployment frequency is limited by coordination across teams.
- A single module's resource needs dominate and cannot be scaled independently.
- Teams are blocked by merge conflicts and shared code changes.
- Different modules need different technology stacks.
- The codebase has grown so large that build and test times are impractical.`,

    `## Migration Paths: Monolith to Microservices

Migration should be incremental, not a big-bang rewrite:

**Strangler Fig pattern**:
1. Place a routing layer (API gateway) in front of the monolith.
2. Build the new service alongside the monolith.
3. Route specific requests to the new service while the monolith continues serving everything else.
4. Gradually migrate functionality until the monolith module is empty.
5. Remove the dead code from the monolith.

**Branch by Abstraction**:
1. Create an abstraction (interface) around the module to be extracted.
2. Implement the interface twice: one backed by the monolith, one by the new service.
3. Use a feature flag to switch between implementations.
4. Remove the monolith implementation once the new service is validated.

**Database decomposition**:
- The hardest part of migration. Shared database must be split.
- Start by identifying which tables belong to which service.
- Create views or APIs that provide cross-service data access.
- Use change data capture (CDC) or events for data synchronization.
- Accept eventual consistency between services.

**What to extract first**: choose modules with clear boundaries, independent scaling needs, and minimal cross-module data dependencies. Payment processing and notification services are common first extractions.`,

    `## Anti-Patterns and Pitfalls

**Distributed monolith**: extracting services without proper boundaries creates the worst of both worlds — distributed systems complexity with monolithic coupling. Services that cannot deploy independently or that require lockstep releases are a distributed monolith.

**Premature decomposition**: splitting into microservices before understanding the domain leads to wrong boundaries. Refactoring across service boundaries is orders of magnitude harder than refactoring within a monolith. Build the modular monolith first, discover the natural boundaries, then extract.

**Shared database anti-pattern**: multiple services reading and writing the same database tables. Changes to the schema require coordinating across all services. Each service should own its data.

**Big-bang rewrite**: attempting to rewrite the entire monolith as microservices at once. This carries enormous risk, takes much longer than estimated, and often fails. Use the Strangler Fig pattern for incremental migration.

**Over-engineering**: not every application needs microservices. Many successful, high-traffic systems run as monoliths (Shopify, Stack Overflow, Basecamp). Choose the architecture that fits your team, domain, and scale.`,
  ],
  interviewQA: [
    {
      q: "When would you recommend a monolith over microservices?",
      a: "I would recommend a monolith for new products where domain boundaries are unclear, for small teams under 10 engineers who would be overwhelmed by distributed systems overhead, when strong consistency through ACID transactions is critical, and for rapid prototyping where speed to market matters. A modular monolith specifically gives you clean boundaries that make future extraction possible without paying the distributed systems tax upfront. Many successful large-scale systems (Shopify, Stack Overflow) run as monoliths.",
    },
    {
      q: "What is a modular monolith and how does it differ from a traditional monolith?",
      a: "A modular monolith enforces strict boundaries between modules within a single deployable. Each module has a public API and private internals, owns its database tables, and communicates with other modules only through defined interfaces. Unlike a traditional monolith where any code can access any other code or database table, a modular monolith provides separation of concerns, independent testability, and clear ownership. It avoids the distributed systems complexity of microservices while maintaining most of their organizational benefits. It is also easier to extract services from later because boundaries already exist.",
    },
    {
      q: "Explain the Strangler Fig pattern for migrating from monolith to microservices.",
      a: "Named after a vine that gradually envelops a tree, the Strangler Fig pattern incrementally replaces monolith functionality with new services. Place an API gateway in front of the monolith. Build a new service for one module, routing its requests to the new service while the monolith handles everything else. Once the new service is validated, remove the dead code from the monolith. Repeat for each module. This avoids big-bang rewrite risk, allows rollback at each step, and keeps the system functional throughout the migration.",
    },
    {
      q: "What is a distributed monolith and how do you avoid it?",
      a: "A distributed monolith has the worst of both worlds: services are deployed separately but are tightly coupled, requiring lockstep releases and coordinated deployments. It happens when services share databases, have synchronous chains of dependencies, or when boundaries were drawn along technical layers (frontend service, backend service, database service) rather than business domains. Avoid it by ensuring each service owns its data, can deploy independently, and communicates through well-defined async interfaces. Test by asking: can this service be deployed without coordinating with other teams?",
    },
  ],
  mcqs: [
    {
      q: "What is the primary advantage of a modular monolith over microservices?",
      options: [
        "Better scalability",
        "Avoids distributed systems complexity while maintaining module boundaries",
        "Supports multiple programming languages",
        "Enables independent deployment of modules",
      ],
      answerIndex: 1,
      explanation:
        "A modular monolith provides clean separation between modules (like microservices) but avoids network calls, distributed transactions, eventual consistency, and operational overhead of running multiple services.",
    },
    {
      q: "Which migration pattern places a routing layer in front of the monolith to incrementally redirect traffic?",
      options: [
        "Branch by Abstraction",
        "Big-bang rewrite",
        "Strangler Fig",
        "Database decomposition",
      ],
      answerIndex: 2,
      explanation:
        "The Strangler Fig pattern uses a routing layer (API gateway) to gradually redirect requests from the monolith to new services, one module at a time, until the monolith functionality is fully replaced.",
    },
    {
      q: "What is a distributed monolith?",
      options: [
        "A monolith deployed across multiple data centers",
        "Services that are deployed separately but are tightly coupled and require lockstep releases",
        "A monolith with a microservices-style API",
        "A database shared across multiple monoliths",
      ],
      answerIndex: 1,
      explanation:
        "A distributed monolith has the operational overhead of microservices but the coupling of a monolith. Services cannot be deployed independently and require coordinated releases.",
    },
    {
      q: "What is typically the hardest part of migrating from a monolith to microservices?",
      options: [
        "Rewriting business logic",
        "Setting up CI/CD pipelines",
        "Decomposing the shared database",
        "Choosing a service mesh",
      ],
      answerIndex: 2,
      explanation:
        "Database decomposition is the hardest migration challenge because data relationships, joins, and transactions that were simple within a shared database must be replaced with cross-service APIs, events, and eventual consistency.",
    },
  ],
  flashcards: [
    {
      front: "What is a monolithic architecture?",
      back: "An application built and deployed as a single unit, with all modules sharing the same process, memory, database, and deployment artifact.",
    },
    {
      front: "What is a modular monolith?",
      back: "A monolith with strictly enforced module boundaries: each module has a public API, owns its tables, and communicates only through defined interfaces. Single deployable, but well-structured internally.",
    },
    {
      front: "What is the Strangler Fig pattern?",
      back: "An incremental migration strategy: place an API gateway in front of the monolith, build new services alongside it, gradually redirect traffic, and remove dead monolith code.",
    },
    {
      front: "What is a distributed monolith?",
      back: "Services that are deployed separately but tightly coupled, requiring lockstep releases. The worst of both worlds: distributed complexity with monolithic coupling.",
    },
    {
      front: "When should you NOT migrate from a monolith to microservices?",
      back: "When the team is small, domain boundaries are unclear, the system fits on one machine, ACID transactions are needed, or there is no organizational pressure for independent deployments.",
    },
    {
      front: "What is Branch by Abstraction?",
      back: "A migration technique: create an interface around a module, implement it twice (monolith-backed and service-backed), toggle with a feature flag, then remove the monolith implementation.",
    },
    {
      front: "What should you extract first when migrating?",
      back: "Modules with clear boundaries, independent scaling needs, and minimal cross-module data dependencies. Payment processing and notifications are common first extractions.",
    },
  ],
  glossary: [
    {
      term: "Monolith",
      definition:
        "An application architecture where all functionality is built, deployed, and run as a single unit sharing one process and database.",
    },
    {
      term: "Modular Monolith",
      definition:
        "A monolith with enforced module boundaries, where each module owns its data and communicates through defined interfaces, combining monolith simplicity with microservice-like separation.",
    },
    {
      term: "Strangler Fig Pattern",
      definition:
        "An incremental migration strategy that gradually replaces monolith functionality with new services by routing traffic through an API gateway.",
    },
    {
      term: "Distributed Monolith",
      definition:
        "An anti-pattern where separately deployed services are tightly coupled, requiring coordinated releases and producing distributed systems overhead without the benefits.",
    },
    {
      term: "Branch by Abstraction",
      definition:
        "A migration technique that introduces an abstraction layer with dual implementations (monolith and service), allowing gradual switchover via feature flags.",
    },
    {
      term: "Database Decomposition",
      definition:
        "The process of splitting a shared monolith database into service-owned data stores, often the most challenging aspect of microservices migration.",
    },
    {
      term: "Change Data Capture (CDC)",
      definition:
        "A technique that tracks changes to a database and publishes them as events, used during migration to synchronize data between the monolith and extracted services.",
    },
  ],
};
