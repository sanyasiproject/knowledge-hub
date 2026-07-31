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
  deepDive: [
    `**Event-Driven Architecture** represents a fundamental shift in how distributed systems communicate. In traditional *request-response* architectures, service A calls service B synchronously and waits for a reply — this creates **tight temporal coupling** where both services must be available simultaneously. EDA breaks this by introducing an *intermediary* (the **message broker**) that decouples producers from consumers. The producer publishes an event like \`OrderPlaced\` to the broker and moves on immediately; the broker stores it durably and delivers it to interested consumers when they are ready. This *fire-and-forget* model means the producer has **zero knowledge** of downstream consumers — you can add analytics, notification, or audit services that subscribe to \`OrderPlaced\` without touching a single line of producer code. However, this decoupling introduces **eventual consistency**: after an order is placed, the inventory service may take milliseconds or seconds to reserve stock, and during that window the system state is *inconsistent*. Developers must design UIs and APIs that embrace this reality — showing "processing" states, using **optimistic updates**, and handling the case where a downstream step *fails* after the initial event was accepted.`,

    `The distinction between **choreography** and **orchestration** is one of the most consequential architectural decisions in EDA. In *choreography*, each service is autonomous: \`OrderService\` emits \`OrderPlaced\`, \`PaymentService\` listens and emits \`PaymentProcessed\`, \`InventoryService\` listens to both and emits \`StockReserved\`. The **workflow is emergent** — no single service knows the full saga. This is powerful for *team autonomy* (each team owns its service and its reactions) but creates **implicit workflows** that are hard to debug. When something goes wrong, you must correlate events across multiple services using a \`correlationId\` header. In contrast, *orchestration* uses a **central coordinator** (like a saga manager) that explicitly calls \`paymentService.charge()\`, waits for the result, then calls \`inventoryService.reserve()\`. The workflow is **explicit and visible** — you can inspect the orchestrator's state machine to see exactly where a process is stuck. The trade-off is that the orchestrator becomes a **coupling point** and potential bottleneck. The pragmatic approach is a **hybrid**: use choreography *across* bounded contexts (services react to each other's integration events) and orchestration *within* a bounded context (a coordinator manages multi-step internal workflows).`,

    `**Schema evolution** is the hidden challenge that makes or breaks EDA at scale. Every event is a **contract** between the producing service and all consuming services, deployed and versioned independently. When \`OrderService\` adds a \`loyaltyPoints\` field to the \`OrderPlaced\` event, every consumer must handle both the old format (without the field) and the new format (with it). This is **backward compatibility** — new producers, old consumers. **Forward compatibility** means old producers can coexist with new consumers that expect fields not yet present. Schema registries like *Confluent Schema Registry* enforce compatibility rules automatically: \`BACKWARD\` (can add optional fields, cannot remove required fields), \`FORWARD\` (can remove fields, cannot add required fields), and \`FULL\` (both). In practice, the safest strategy is to **never remove or rename fields** — only *add* optional fields with sensible defaults. Use formats like **Avro** or **Protobuf** that support schema evolution natively, or enforce \`JSON Schema\` validation at the broker level. Without disciplined schema management, EDA systems degrade into a tangle of *brittle integrations* where any producer change triggers cascading consumer failures.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Publishing an event with amqplib using a fanout exchange (broadcast pattern)",
      source: `const amqp = require('amqplib');

async function publishEvent() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // Declare a fanout exchange for broadcasting events
  const exchange = 'events.order';
  await channel.assertExchange(exchange, 'fanout', { durable: true });

  // Create the event payload
  const event = {
    type: 'OrderPlaced',
    timestamp: new Date().toISOString(),
    correlationId: 'corr-' + Date.now(),
    data: {
      orderId: 'ORD-12345',
      customerId: 'CUST-789',
      items: [{ sku: 'WIDGET-A', qty: 2, price: 29.99 }],
      total: 59.98,
    },
  };

  // Publish — routing key is ignored by fanout exchanges
  channel.publish(exchange, '', Buffer.from(JSON.stringify(event)), {
    persistent: true,         // delivery-mode = 2
    contentType: 'application/json',
    messageId: 'msg-' + Date.now(),
    headers: { 'x-event-type': 'OrderPlaced' },
  });

  console.log('Event published:', event.type);
  await channel.close();
  await connection.close();
}

publishEvent().catch(console.error);`,
    },
    {
      language: "typescript",
      caption: "Consuming events with competing consumers pattern (multiple workers on one queue)",
      source: `const amqp = require('amqplib');

async function startConsumer(workerId: number) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'events.order';
  const queue = 'inventory.order-placed'; // shared queue for competing consumers

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');

  // Prefetch 1 ensures fair dispatch among workers
  await channel.prefetch(1);

  console.log(\`Worker \${workerId} waiting for events...\`);

  channel.consume(queue, (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    console.log(\`Worker \${workerId} processing: \${event.type} [\${event.data.orderId}]\`);

    // Simulate async processing
    setTimeout(() => {
      console.log(\`Worker \${workerId} done with \${event.data.orderId}\`);
      channel.ack(msg); // Manual ack after successful processing
    }, 1000);
  }, { noAck: false }); // Manual acknowledgment mode
}

// Start 3 competing consumers
Promise.all([startConsumer(1), startConsumer(2), startConsumer(3)]);`,
    },
    {
      language: "typescript",
      caption: "Choreography pattern: independent services reacting to events via topic exchange",
      source: `const amqp = require('amqplib');

async function setupChoreography() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'events.domain';
  await channel.assertExchange(exchange, 'topic', { durable: true });

  // --- Payment Service: listens for order events ---
  const paymentQueue = 'payment.order-events';
  await channel.assertQueue(paymentQueue, { durable: true });
  await channel.bindQueue(paymentQueue, exchange, 'order.placed');

  channel.consume(paymentQueue, async (msg) => {
    if (!msg) return;
    const event = JSON.parse(msg.content.toString());
    console.log('PaymentService: charging for', event.data.orderId);

    // After processing, emit its own event (choreography)
    const paymentEvent = {
      type: 'PaymentProcessed',
      data: { orderId: event.data.orderId, status: 'charged' },
    };
    channel.publish(exchange, 'payment.processed',
      Buffer.from(JSON.stringify(paymentEvent)),
      { persistent: true, contentType: 'application/json' }
    );
    channel.ack(msg);
  }, { noAck: false });

  // --- Notification Service: listens for multiple event types ---
  const notifyQueue = 'notifications.all-events';
  await channel.assertQueue(notifyQueue, { durable: true });
  await channel.bindQueue(notifyQueue, exchange, 'order.*');
  await channel.bindQueue(notifyQueue, exchange, 'payment.*');

  channel.consume(notifyQueue, (msg) => {
    if (!msg) return;
    const event = JSON.parse(msg.content.toString());
    console.log('NotificationService: sending notification for', event.type);
    channel.ack(msg);
  }, { noAck: false });
}

setupChoreography().catch(console.error);`,
    },
  ],
  diagrams: [
    {
      title: "Event-Driven Architecture Overview",
      kind: "architecture",
      caption: "Producers publish events to the broker; consumers subscribe independently, enabling loose coupling and independent scaling.",
      mermaid: `graph LR
  P1[Order Service] -->|OrderPlaced| B[Message Broker]
  P2[Payment Service] -->|PaymentProcessed| B
  B -->|OrderPlaced| C1[Inventory Service]
  B -->|OrderPlaced| C2[Notification Service]
  B -->|OrderPlaced| C3[Analytics Service]
  B -->|PaymentProcessed| C4[Shipping Service]
  B -->|PaymentProcessed| C2`,
    },
    {
      title: "Choreography vs Orchestration Flow",
      kind: "sequence",
      caption: "Choreography: services react independently to events. Orchestration: a coordinator directs each step.",
      mermaid: `sequenceDiagram
  participant OS as OrderService
  participant Broker as Message Broker
  participant PS as PaymentService
  participant IS as InventoryService

  rect rgb(200, 230, 255)
  Note over OS, IS: Choreography Pattern
  OS->>Broker: publish OrderPlaced
  Broker->>PS: deliver OrderPlaced
  Broker->>IS: deliver OrderPlaced
  PS->>Broker: publish PaymentProcessed
  IS->>Broker: publish StockReserved
  end

  rect rgb(255, 230, 200)
  Note over OS, IS: Orchestration Pattern
  OS->>PS: charge(orderId)
  PS-->>OS: success
  OS->>IS: reserve(orderId)
  IS-->>OS: success
  end`,
    },
    {
      title: "Event Types Mind Map",
      kind: "mindmap",
      caption: "Overview of event categories and their characteristics in EDA.",
      mermaid: `mindmap
  root((EDA Events))
    Domain Events
      OrderPlaced
      PaymentReceived
      Scoped to bounded context
    Integration Events
      Cross-context communication
      Stable versioned schemas
      Public API of a service
    Notification Events
      Minimal payload
      Consumer calls back for details
      Low schema coupling
    State Transfer Events
      Full payload included
      No callback needed
      Higher schema coupling`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Choreography", "Orchestration"],
    rows: [
      ["**Coupling**", "*Loose* — services are independent", "*Tighter* — coordinator knows all services"],
      ["**Workflow visibility**", "*Implicit* — must trace across services", "*Explicit* — visible in coordinator's state machine"],
      ["**Debugging**", "*Harder* — requires distributed tracing with `correlationId`", "*Easier* — inspect orchestrator state"],
      ["**Single point of failure**", "*None* — no central coordinator", "*Yes* — the orchestrator is a critical component"],
      ["**Team autonomy**", "*High* — teams own their reactions", "*Lower* — changes require orchestrator updates"],
      ["**Error handling**", "*Distributed* — each service handles its own compensation", "*Centralized* — orchestrator manages retries and rollbacks"],
      ["**Best for**", "Cross-bounded-context communication", "Complex multi-step workflows within a context"],
    ],
  },
  exercises: [
    "**Design an event schema** for an e-commerce system: define the `OrderPlaced`, `PaymentProcessed`, `ShipmentDispatched`, and `OrderCancelled` events with appropriate fields, *naming conventions* (past tense), and `correlationId` headers. Ensure **backward compatibility** — add a new `loyaltyPoints` field to `OrderPlaced` without breaking existing consumers.",
    "**Implement a choreography flow** using `amqplib` where three services (`OrderService`, `PaymentService`, `NotificationService`) communicate *only* through events on a **topic exchange**. Each service should publish its own domain event after processing. Add a `correlationId` to trace the full flow.",
    "**Build an event-carried state transfer** vs **notification event** comparison: implement the same `UserRegistered` flow twice — once with a minimal notification event (consumer queries for details) and once with a full payload. Measure the *latency* and *coupling* trade-offs.",
    "**Implement idempotent consumers**: create a consumer that processes `PaymentProcessed` events but uses a **deduplication store** (e.g., a `Set` or `Map` of `messageId` values) to ensure each event is processed *exactly once* even if delivered multiple times.",
    "**Design a hybrid choreography-orchestration system**: use *choreography* across two bounded contexts (Order and Shipping) and an *orchestrator* within the Order context to manage the `PlaceOrder -> Charge -> ReserveStock -> Confirm` saga. Draw the architecture and implement the orchestrator logic.",
  ],
  cheatSheet: [
    "**Events** = past tense (*OrderPlaced*), **Commands** = imperative (*PlaceOrder*). Events *inform*, commands *instruct*.",
    "**Three decouplings**: *temporal* (don't run simultaneously), *spatial* (don't know each other), *platform* (different tech stacks).",
    "**Choreography** = no coordinator, emergent workflow, *loose coupling*. **Orchestration** = central coordinator, explicit workflow, *better visibility*.",
    "**Notification events** = minimal payload + callback. **State transfer events** = full payload, no callback, higher *schema coupling*.",
    "**Schema evolution rule**: *never* remove or rename required fields. Only **add optional fields** with defaults. Use `Avro` / `Protobuf` / `JSON Schema` for enforcement.",
    "**Idempotent consumers** are mandatory for *at-least-once* delivery — use `messageId` + deduplication store to handle redeliveries.",
  ],
  revisionNotes: [
    "EDA provides **temporal**, **spatial**, and **platform decoupling** — producers and consumers can be *offline*, *unaware of each other*, and *built with different technologies*. The trade-off is **eventual consistency**.",
    "**Events vs Commands**: events are *immutable facts* (past tense, broadcast, zero coupling), commands are *directed instructions* (imperative, point-to-point, expects response). A command disguised as an event (e.g., `SendEmailEvent`) defeats the purpose of EDA.",
    "**Choreography** works best *across bounded contexts* where team autonomy matters. **Orchestration** works best *within a bounded context* for complex multi-step sagas with error handling. Most production systems use a **hybrid**.",
    "**Schema evolution** is the most underestimated challenge in EDA. Use a **schema registry** with **backward compatibility** rules. Never remove fields; only add optional ones. Breaking schema changes require a *new event type* (e.g., `OrderPlacedV2`).",
    "The **competing consumers** pattern provides horizontal scaling — multiple instances share a queue. **Pub-sub** provides fan-out — each consumer type gets its own queue bound to the exchange. These are complementary, not competing patterns.",
  ],
};
