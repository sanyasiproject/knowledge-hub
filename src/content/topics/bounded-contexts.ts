import type { TopicContent } from "../types";

export const boundedContexts: TopicContent = {
  quickSummary: [
    "A bounded context is an explicit boundary within which a particular domain model applies; the same concept (e.g., 'Customer') can have different meanings and representations across different contexts.",
    "Context mapping defines the relationships between bounded contexts -- how they communicate, who has authority over shared concepts, and where translation occurs.",
    "The Anti-Corruption Layer (ACL) is a translation boundary that prevents one context's model from leaking into another, preserving each context's integrity and autonomy.",
    "Bounded contexts align naturally with team ownership and microservice boundaries, making them the primary decomposition strategy in DDD-based architectures.",
  ],
  detailed: [
    `## What Are Bounded Contexts?

A bounded context is the central pattern in Domain-Driven Design for dealing with large models. It defines an explicit boundary within which a domain model is consistent, coherent, and meaningful.

**Why bounded contexts exist:**
Large domains contain ambiguity. The word "Order" means something different to the warehouse team (a pick list), the finance team (an invoice trigger), and the customer support team (a complaint reference). Attempting a single unified model forces awkward compromises that serve no one well.

**Key characteristics:**
- **Linguistic boundary** -- each context has its own ubiquitous language. The same word can mean different things across contexts.
- **Model boundary** -- each context has its own domain model with its own entities, value objects, and aggregates.
- **Ownership boundary** -- each context is owned by one team. Ownership clarity prevents design-by-committee.
- **Technical boundary** -- each context can have its own database, deployment pipeline, and technology stack.

**Identifying bounded contexts:**
- Listen for language shifts in domain conversations ("When we say 'product' in catalog, we mean... but in pricing, it means...").
- Look for organizational boundaries -- different departments often imply different contexts.
- Use event storming to identify clusters of related events that form natural groupings.`,

    `## Context Mapping

Context mapping is the practice of explicitly documenting the relationships between bounded contexts. Eric Evans defined several relationship patterns:

**Upstream-Downstream patterns:**
- **Customer-Supplier** -- the downstream context depends on the upstream context. The upstream team accommodates downstream needs within reason, like a supplier-customer relationship.
- **Conformist** -- the downstream context conforms entirely to the upstream model with no translation. Used when the upstream team has no incentive to accommodate and the cost of translation is too high.
- **Anti-Corruption Layer (ACL)** -- the downstream context translates upstream concepts into its own language, preventing model contamination.

**Mutual patterns:**
- **Shared Kernel** -- two contexts share a small subset of the model. Changes require coordination between both teams. Use sparingly; shared kernels become maintenance bottlenecks.
- **Partnership** -- two contexts evolve together with mutual coordination. Both teams align planning and releases.

**Decoupled patterns:**
- **Published Language** -- a well-documented, versioned schema (events, APIs) that serves as the official communication contract.
- **Open Host Service** -- a context exposes a public API designed for general consumption by multiple downstream contexts.
- **Separate Ways** -- contexts have no relationship; they solve their problems independently.`,

    `## Anti-Corruption Layer (ACL)

The ACL is one of the most important tactical patterns for maintaining model integrity at context boundaries.

**What it does:**
The ACL sits between two bounded contexts and translates concepts, data structures, and protocols from one context's language into the other's. It prevents "model leakage" -- where foreign concepts and assumptions infiltrate and corrupt the local model.

**Implementation components:**
- **Facade** -- provides a simplified interface to the external context, hiding its complexity.
- **Adapter** -- converts external data formats into local domain objects.
- **Translator** -- maps between vocabularies (e.g., external "SKU" to local "ProductId").

**Example:**
An e-commerce application integrating with a legacy ERP system:
\`\`\`typescript
// ACL adapter translating ERP concepts to local domain
class ErpOrderAdapter implements OrderPort {
  async getOrder(orderId: OrderId): Promise<Order> {
    const erpData = await this.erpClient.fetchSalesDocument(orderId.value);
    return new Order(
      new OrderId(erpData.doc_number),
      this.translateLineItems(erpData.positions),
      this.translateStatus(erpData.status_code),
      Money.of(erpData.net_value, erpData.currency)
    );
  }

  private translateStatus(erpStatus: string): OrderStatus {
    const mapping: Record<string, OrderStatus> = {
      "10": OrderStatus.CREATED,
      "20": OrderStatus.CONFIRMED,
      "30": OrderStatus.SHIPPED,
      "90": OrderStatus.CANCELLED,
    };
    return mapping[erpStatus] ?? OrderStatus.UNKNOWN;
  }
}
\`\`\`

**When to use an ACL:**
- Integrating with legacy systems whose model you cannot change.
- Consuming third-party APIs with different domain concepts.
- When the upstream model is unstable or poorly designed and you want to insulate your context.`,

    `## Context Boundaries and Microservices

Bounded contexts provide the natural decomposition boundary for microservices.

**Alignment principles:**
- **One bounded context = one service (or a small cluster of services)** -- this ensures each service has a coherent model and clear ownership.
- **Database per context** -- each context owns its data; no shared databases that would couple contexts at the persistence layer.
- **Events as the primary integration mechanism** -- contexts publish domain events at boundaries; other contexts consume and translate them through their ACL.

**Common mistakes:**
- **Too granular** -- splitting a single bounded context into multiple services creates unnecessary inter-service communication for operations that should be local.
- **Too coarse** -- lumping multiple contexts into one service recreates the problems of a monolithic model within a service.
- **Shared database** -- two services accessing the same database tables couples their models and evolution.
- **Distributed monolith** -- services that must be deployed together because of shared state or synchronous dependency chains provide the worst of both worlds.

**Practical guidance:**
Start with a modular monolith where each module represents a bounded context with clear interfaces. When a module needs independent scaling, deployment, or team ownership, extract it into a microservice. The module boundary (already a context boundary) becomes the service boundary with minimal redesign.`,

    `## Evolving Context Boundaries

Bounded context boundaries are not fixed at project inception. They evolve as domain understanding deepens and organizational needs change.

**Signs that boundaries need adjustment:**
- **Frequent cross-context changes** -- if most features require coordinated changes across multiple contexts, boundaries may be wrong.
- **Model clashes within a context** -- if the same entity has conflicting meanings within a single context, it may need splitting.
- **Team friction** -- if multiple teams work in the same context and step on each other, the context may be too large.
- **Unnecessary complexity** -- if a context has become so small that it adds integration overhead without meaningful isolation, consider merging.

**Refactoring strategies:**
- **Context splitting** -- extract a subdomain that has grown complex enough to warrant its own model and team.
- **Context merging** -- combine contexts that have become too fine-grained, especially when they share most of their data and behavior.
- **Boundary redefinition** -- shift where the boundary falls when the current split does not align with how the business actually operates.

**Key insight:** The cost of getting boundaries wrong is proportional to the coupling between contexts. Invest in clean interfaces (events, APIs) so boundaries can be moved without cascading redesigns.`,
  ],
  interviewQA: [
    {
      q: "What is a bounded context and how do you identify one?",
      a: "A bounded context is an explicit boundary within which a domain model is consistent and a specific ubiquitous language applies. Identify them by listening for language shifts in domain conversations (the same word meaning different things to different groups), observing organizational boundaries (different teams or departments), and using event storming to find natural clusters of related domain events. A well-defined bounded context has its own language, model, data store, and team ownership.",
    },
    {
      q: "What is the Anti-Corruption Layer and when should you use it?",
      a: "The ACL is a translation boundary that converts concepts from an external or upstream context into your local domain language, preventing foreign models from contaminating your domain. Use it when integrating with legacy systems, third-party APIs, or upstream contexts whose model is unstable, poorly designed, or simply different from yours. It typically consists of facades, adapters, and translators that map external data structures and terminology to local domain objects.",
    },
    {
      q: "How do bounded contexts relate to microservice boundaries?",
      a: "Bounded contexts provide the natural decomposition boundary for microservices. Each bounded context maps to one service or a small cluster of services, owns its data store, and communicates with other contexts through events or APIs. Start with a modular monolith where each module is a bounded context; extract services when scaling, deployment independence, or team ownership demands it. The module boundary becomes the service boundary with minimal redesign.",
    },
    {
      q: "What is the difference between a Shared Kernel and an Anti-Corruption Layer?",
      a: "A Shared Kernel is a small, jointly owned subset of the domain model that two contexts share directly -- changes require coordination between both teams. An ACL is a one-way translation layer where the downstream context converts upstream concepts into its own language with zero shared model. Shared Kernels create coupling and should be used sparingly for closely collaborating teams. ACLs provide isolation and are preferred when contexts are owned by different teams or evolve at different rates.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary purpose of a bounded context in DDD?",
      options: [
        "To limit the number of classes in a code module",
        "To define an explicit boundary within which a domain model is consistent and a ubiquitous language applies",
        "To restrict database access to authorized users",
        "To create API rate limiting boundaries",
      ],
      answerIndex: 1,
      explanation:
        "A bounded context defines where a particular domain model applies, ensuring terms have precise, consistent meanings within that boundary. Different contexts can have different interpretations of the same business concept.",
    },
    {
      q: "Which context mapping pattern provides the most isolation between contexts?",
      options: [
        "Shared Kernel",
        "Conformist",
        "Anti-Corruption Layer",
        "Partnership",
      ],
      answerIndex: 2,
      explanation:
        "The ACL provides the most isolation by translating all upstream concepts into the downstream context's own language. No upstream model details leak through. Shared Kernel and Partnership require coordination; Conformist adopts the upstream model entirely.",
    },
    {
      q: "What is a 'distributed monolith'?",
      options: [
        "A monolith deployed across multiple data centers for high availability",
        "Services that must be deployed together due to shared state or tight coupling, providing the worst of both architectures",
        "A monolith that uses distributed caching for performance",
        "A single service that processes distributed events",
      ],
      answerIndex: 1,
      explanation:
        "A distributed monolith results from splitting a system into services without proper context boundaries. The services remain tightly coupled -- sharing databases, requiring synchronized deployments -- adding network complexity without gaining independence.",
    },
    {
      q: "When should two bounded contexts use a Shared Kernel?",
      options: [
        "When the contexts are owned by different organizations",
        "When both contexts need a small, jointly maintained subset of the model and their teams collaborate closely",
        "When one context is a legacy system that cannot be modified",
        "When the contexts communicate only through asynchronous events",
      ],
      answerIndex: 1,
      explanation:
        "Shared Kernels are appropriate only when two closely collaborating teams need to share a small subset of the model and can coordinate changes. They create coupling, so they should be used sparingly and only between teams with strong communication.",
    },
  ],
  flashcards: [
    {
      front: "Bounded Context vs. Subdomain",
      back: "A subdomain is a part of the problem space (the business reality). A bounded context is a part of the solution space (the software model). Ideally, they align one-to-one, but in practice a bounded context may cover multiple subdomains or a subdomain may be split across contexts.",
    },
    {
      front: "What is the Conformist pattern?",
      back: "A context mapping pattern where the downstream context adopts the upstream model as-is with no translation. Used when the upstream team has no incentive to accommodate downstream needs and the cost of building an ACL outweighs the cost of conforming.",
    },
    {
      front: "Open Host Service pattern",
      back: "A context exposes a well-defined public API (the 'open host') designed for general consumption by multiple downstream contexts. The API is a stable contract, often paired with a Published Language for the data format.",
    },
    {
      front: "Why avoid shared databases between bounded contexts?",
      back: "Shared databases couple contexts at the persistence layer. Schema changes in one context can break the other. Each context loses the freedom to choose the storage technology that best fits its needs. Use events or APIs for cross-context data access instead.",
    },
    {
      front: "Signs that bounded context boundaries are wrong",
      back: "Frequent cross-context changes for single features, conflicting meanings of the same entity within a context, multiple teams stepping on each other in the same context, or excessive integration overhead from overly fine-grained contexts.",
    },
    {
      front: "What is a Context Map?",
      back: "A visual diagram documenting all bounded contexts in a system and the relationships between them (Customer-Supplier, ACL, Shared Kernel, etc.). It provides a high-level view of system integration architecture.",
    },
    {
      front: "Partnership context mapping pattern",
      back: "Two bounded contexts evolve together with mutual coordination. Both teams align their planning, releases, and model changes. Suitable when contexts are interdependent and teams are co-located or closely collaborating.",
    },
  ],
  glossary: [
    {
      term: "Bounded Context",
      definition:
        "An explicit boundary within which a domain model is defined and applicable. Each context has its own ubiquitous language, model, and typically its own team and data store.",
    },
    {
      term: "Context Map",
      definition:
        "A diagram or document that shows all bounded contexts in a system and the relationships (integration patterns) between them.",
    },
    {
      term: "Anti-Corruption Layer (ACL)",
      definition:
        "A translation boundary that converts concepts from an external context into the local context's domain language, preventing model contamination.",
    },
    {
      term: "Shared Kernel",
      definition:
        "A small, jointly owned subset of the domain model shared by two bounded contexts. Changes require coordination between both teams.",
    },
    {
      term: "Published Language",
      definition:
        "A well-documented, versioned schema (event contracts, API specifications) used as the official communication format between bounded contexts.",
    },
    {
      term: "Conformist",
      definition:
        "A context mapping pattern where the downstream context adopts the upstream model as-is without translation, accepting the upstream team's design decisions.",
    },
    {
      term: "Open Host Service",
      definition:
        "A bounded context that exposes a well-defined, stable public API designed for consumption by multiple downstream contexts.",
    },
  ],
};
