import type { TopicContent } from "../types";

export const edaFundamentals: TopicContent = {
  quickSummary: [
    "Event-Driven Architecture (EDA) is a design paradigm where system components communicate by producing and consuming events — immutable records of something that happened — enabling loose coupling and asynchronous processing.",
    "Events represent facts (something happened), while commands represent intentions (do something) — this distinction drives fundamentally different error handling, routing, and coupling patterns.",
    "Choreography lets services react independently to events without central coordination, while orchestration uses a central coordinator to direct the workflow — each has distinct trade-offs in coupling, visibility, and complexity.",
    "EDA enables temporal decoupling (producer and consumer do not need to be available simultaneously), spatial decoupling (they do not need to know each other), and scale independence (they can scale independently).",
  ],
  detailed: [
    `## Events vs Commands vs Queries

An **event** is an immutable notification that something happened: "OrderPlaced", "PaymentReceived", "UserRegistered". Events are named in past tense and owned by the producer — the producer does not know or care who consumes them.

A **command** is a directed instruction to do something: "PlaceOrder", "ProcessPayment", "SendEmail". Commands are named in imperative mood, targeted at a specific handler, and expect a response (success/failure). A **query** asks for data without side effects.

The key distinction: events inform (broadcast, zero or many listeners), commands instruct (point-to-point, exactly one handler). Mixing these up leads to tight coupling disguised as event-driven architecture — publishing "SendEmailEvent" is a command in event's clothing.`,

    `## Choreography vs Orchestration

In **choreography**, each service listens for events and independently decides how to react. OrderService publishes "OrderPlaced"; PaymentService hears it and charges the card; InventoryService hears it and reserves stock. No service knows about the others. The workflow emerges from individual reactions.

In **orchestration**, a central **orchestrator** (often a saga or workflow engine) directs the process. The OrderOrchestrator tells PaymentService to charge, waits for confirmation, then tells InventoryService to reserve. The orchestrator owns the workflow logic.

Choreography provides loose coupling but the workflow is implicit and hard to trace. Orchestration centralizes logic for visibility and control but creates a coupling point. Many systems use a hybrid — choreography across bounded contexts, orchestration within them.`,

    `## Event Types and Schemas

**Domain events** represent business facts within a bounded context (OrderPlaced, InventoryReserved). **Integration events** are published for cross-context communication — often a curated subset of domain events with stable schemas.

**Notification events** carry minimal data ("OrderPlaced: {orderId}"), requiring consumers to call back for details. **Event-carried state transfer** includes the full state needed by consumers ("OrderPlaced: {orderId, items, total, address}"), eliminating callbacks but increasing message size and coupling to the schema.

Schema evolution is critical: use schema registries (Avro, Protobuf, JSON Schema) with compatibility rules (backward, forward, full) to evolve events without breaking consumers. Add optional fields freely; never remove or rename required fields.`,

    `## Temporal and Spatial Decoupling

EDA provides three forms of decoupling. **Temporal decoupling**: the producer and consumer do not need to be running at the same time — events are stored in the broker until consumed. **Spatial decoupling**: producers do not know which consumers exist — they publish to a topic, not to a specific service. **Platform decoupling**: producer and consumer can use different languages, frameworks, and runtimes.

This decoupling enables independent deployment, scaling, and evolution of services. However, it introduces eventual consistency — the system state is not immediately consistent across all services. Developers must design for this: handle out-of-order events, build idempotent consumers, and implement compensation logic for failures.`,

    `## Common EDA Patterns

**Event notification**: a lightweight signal that something changed, triggering consumers to query for details. Low coupling but adds query load.

**Event-carried state transfer**: events carry all data consumers need, eliminating queries but creating schema coupling.

**Event sourcing**: storing all state changes as an append-only sequence of events — the event log is the source of truth (covered in depth separately).

**CQRS**: separating read and write models, often with events bridging the two sides (covered separately).

**Competing consumers**: multiple instances of the same service consume from a shared queue/partition for load balancing. **Publish-subscribe**: each consumer type gets its own copy of every event for independent processing.`,
  ],
  interviewQA: [
    {
      q: "What is the fundamental difference between events and commands, and why does it matter?",
      a: "Events are immutable facts about something that already happened (past tense: OrderPlaced). The producer owns the event and does not know who consumes it. Commands are directed instructions to do something (imperative: PlaceOrder), targeted at a specific handler with an expected response. This matters because events enable loose coupling — adding a new consumer requires no changes to the producer. Commands create point-to-point coupling. Conflating the two (e.g., 'SendEmailEvent') creates hidden coupling disguised as event-driven design.",
    },
    {
      q: "When would you choose choreography over orchestration?",
      a: "Choose choreography when: services are owned by different teams with independent deployment cycles; the workflow is simple and linear; loose coupling is more important than workflow visibility; and you want maximum autonomy per service. Choose orchestration when: the workflow has complex branching, retries, and compensation logic; you need clear visibility into workflow state; debugging distributed processes must be straightforward; or the workflow spans many steps with error handling at each stage. Many systems use choreography across bounded contexts and orchestration within them.",
    },
    {
      q: "What are the trade-offs between notification events and event-carried state transfer?",
      a: "Notification events (minimal data, just IDs) keep events small and reduce schema coupling — consumers call back to the producer for details. Downsides: increases query load on the producer, introduces runtime coupling (consumer cannot process if producer is down), and adds latency. Event-carried state transfer includes all data consumers need, eliminating callbacks and enabling full temporal decoupling. Downsides: larger messages, stronger schema coupling (consumers depend on the event structure), and potential data staleness if the source changes between events.",
    },
  ],
  mcqs: [
    {
      q: "Which naming convention correctly distinguishes events from commands?",
      options: [
        "Events: PlaceOrder, Commands: OrderPlaced",
        "Events: OrderPlaced, Commands: PlaceOrder",
        "Events: OrderPlacing, Commands: OrderPlace",
        "Events and commands use the same naming",
      ],
      answerIndex: 1,
      explanation:
        "Events use past tense (OrderPlaced — something happened) while commands use imperative mood (PlaceOrder — do this). This naming convention reflects their fundamental semantic difference.",
    },
    {
      q: "In a choreography-based architecture, who owns the workflow logic?",
      options: [
        "A central orchestrator service",
        "The first service in the chain",
        "No single service — the workflow emerges from individual service reactions to events",
        "The message broker manages the workflow",
      ],
      answerIndex: 2,
      explanation:
        "In choreography, there is no central coordinator. Each service independently reacts to events and publishes its own events. The overall workflow is an emergent property of these individual reactions.",
    },
    {
      q: "What is temporal decoupling in EDA?",
      options: [
        "Events are processed in timestamp order",
        "Producer and consumer do not need to be running at the same time",
        "Events expire after a configurable time window",
        "Services are deployed in different time zones",
      ],
      answerIndex: 1,
      explanation:
        "Temporal decoupling means the producer and consumer do not need to be available simultaneously. Events are stored in the broker and consumed when the consumer is ready.",
    },
  ],
  flashcards: [
    {
      front: "What are the three forms of decoupling EDA provides?",
      back: "Temporal (producer and consumer need not run simultaneously), Spatial (producer does not know which consumers exist), and Platform (different languages/frameworks can interoperate via events).",
    },
    {
      front: "What is a notification event vs event-carried state transfer?",
      back: "Notification event carries minimal data (just IDs) — consumer must call back for details. Event-carried state transfer includes all data the consumer needs, eliminating callbacks but increasing message size and schema coupling.",
    },
    {
      front: "What is the competing consumers pattern?",
      back: "Multiple instances of the same service consume from a shared queue/partition for load balancing. Each message is processed by exactly one instance, enabling horizontal scaling of processing.",
    },
    {
      front: "What is an integration event?",
      back: "An event published for cross-bounded-context communication. It is a curated, stable subset of internal domain events with a carefully managed schema, serving as the public API of a service.",
    },
    {
      front: "Why is schema evolution important in EDA?",
      back: "Events are contracts between producers and consumers deployed independently. Schema evolution rules (backward/forward compatibility) ensure producers can add fields without breaking existing consumers, and consumers can handle both old and new event formats.",
    },
    {
      front: "What is a command disguised as an event?",
      back: "An event like 'SendEmailEvent' that is really a command directed at a specific service. It creates hidden coupling because the producer is dictating what should happen rather than reporting what did happen.",
    },
    {
      front: "What is the hybrid choreography-orchestration approach?",
      back: "Use choreography across bounded contexts (services react to each other's events independently) and orchestration within a bounded context (a coordinator manages multi-step workflows involving internal services).",
    },
  ],
  glossary: [
    {
      term: "Event",
      definition:
        "An immutable record of something that happened, named in past tense, published by a producer without knowledge of consumers.",
    },
    {
      term: "Command",
      definition:
        "A directed instruction to perform an action, named in imperative mood, targeted at a specific handler with an expected response.",
    },
    {
      term: "Choreography",
      definition:
        "A coordination pattern where services independently react to events without a central coordinator, with the workflow emerging from individual reactions.",
    },
    {
      term: "Orchestration",
      definition:
        "A coordination pattern where a central orchestrator directs the workflow by sending commands to services and handling responses.",
    },
    {
      term: "Event-Carried State Transfer",
      definition:
        "An event pattern where the event payload includes all data consumers need, eliminating the need to call back to the producer.",
    },
    {
      term: "Temporal Decoupling",
      definition:
        "A property of EDA where producers and consumers do not need to be running simultaneously — events are persisted in the broker until consumed.",
    },
    {
      term: "Integration Event",
      definition:
        "An event published across bounded context boundaries with a stable, versioned schema serving as the public contract between services.",
    },
  ],
};
