import type { TopicContent } from "../types";

export const exchangesBindings: TopicContent = {
  quickSummary: [
    "Exchanges are the routing layer in RabbitMQ — producers publish messages to exchanges, which then route messages to bound queues based on exchange type, routing key, and binding rules.",
    "The four exchange types — direct, topic, fanout, and headers — each implement different routing logic, from exact key matching to pattern-based routing to broadcast delivery.",
    "Bindings are rules that link exchanges to queues (or other exchanges), specifying the criteria under which messages should be routed — a queue only receives messages if a matching binding exists.",
    "The default exchange is a pre-declared nameless direct exchange that automatically binds every queue by its queue name, enabling simple point-to-point messaging without explicit binding setup.",
  ],
  detailed: [
    `## Exchange Types Overview

An **exchange** receives messages from producers and routes them to zero or more queues based on its type and the message's routing key and headers. If no queue is bound with a matching rule, the message is either dropped silently or returned to the producer (if the \`mandatory\` flag is set).

Exchanges can be **durable** (survive broker restart) or **transient**. The \`auto-delete\` flag removes the exchange when the last queue unbinds. The \`internal\` flag prevents direct publishing — internal exchanges can only receive messages from other exchanges via exchange-to-exchange bindings.`,

    `## Direct Exchange

A **direct exchange** routes messages to queues whose binding key exactly matches the message's routing key. This is the simplest routing model — if a queue is bound with key "order.created", it receives only messages published with routing key "order.created".

Multiple queues can bind with the same key (fan-out within a key), and a single queue can bind with multiple keys. The **default exchange** (empty string name) is a special direct exchange that auto-binds every queue using the queue name as the binding key — publishing to the default exchange with routing key "my-queue" delivers directly to the queue named "my-queue".`,

    `## Topic Exchange

A **topic exchange** routes messages based on wildcard pattern matching between the routing key and binding patterns. Routing keys are dot-delimited strings (e.g., "order.us.created"). Binding patterns use two wildcards: \`*\` matches exactly one word, and \`#\` matches zero or more words.

For example, binding "order.*.created" matches "order.us.created" and "order.eu.created" but not "order.us.west.created". Binding "order.#" matches "order.created", "order.us.created", and "order.us.west.created". A topic exchange with all literal bindings (no wildcards) behaves like a direct exchange. A binding of "#" makes it behave like a fanout exchange.`,

    `## Fanout Exchange

A **fanout exchange** ignores routing keys entirely and broadcasts every message to all bound queues. This is the simplest and fastest exchange type since no routing key evaluation is needed.

Fanout exchanges are used for broadcast scenarios: sending notifications to all services, distributing cache invalidation events, or implementing pub-sub patterns where every subscriber receives every message. Each consumer typically has its own exclusive queue bound to the fanout exchange, so each gets an independent copy.`,

    `## Headers Exchange and Exchange-to-Exchange Bindings

A **headers exchange** routes based on message header attributes instead of the routing key. The binding specifies a set of header key-value pairs and a match type: \`x-match=all\` (all headers must match) or \`x-match=any\` (at least one must match). This enables multi-attribute routing without encoding everything in the routing key.

**Exchange-to-exchange bindings** (a RabbitMQ extension beyond AMQP 0-9-1) allow chaining exchanges. A message published to one exchange can be routed to another exchange, which then routes to queues. This enables complex routing topologies — for example, a fanout exchange can broadcast to multiple topic exchanges, each routing to different consumer groups based on different criteria.`,
  ],
  interviewQA: [
    {
      q: "When would you choose a topic exchange over a direct exchange?",
      a: "Use a topic exchange when you need pattern-based routing with hierarchical routing keys. For example, routing logs by severity and source: 'log.error.auth' can be captured by bindings like 'log.error.*' (all errors), 'log.*.auth' (all auth logs), or 'log.#' (all logs). Direct exchanges only support exact matching, so you would need separate bindings for every possible routing key. Topic exchanges add slight overhead for pattern matching but provide much more flexible routing.",
    },
    {
      q: "How does the default exchange work and why is it useful?",
      a: "The default exchange is a pre-declared direct exchange with an empty string name. RabbitMQ automatically creates a binding for every queue, using the queue name as the binding key. So publishing a message to the default exchange with routing key 'my-queue' delivers it directly to the queue named 'my-queue'. This simplifies point-to-point messaging — you can send to a queue without declaring an exchange or creating bindings. It is essentially syntactic sugar for direct queue delivery.",
    },
    {
      q: "What happens to a message if no queue binding matches?",
      a: "By default, unroutable messages are silently dropped by the exchange. If the producer sets the 'mandatory' flag, the broker returns the message via a basic.return callback. The 'alternate-exchange' argument can specify a fallback exchange — unroutable messages are forwarded there instead of being dropped, enabling dead-letter patterns. For headers exchanges, x-match controls whether all or any headers must match for routing.",
    },
  ],
  followUps: [
    "Which exchange type would you use for 'notify these three services of every order', and which for routing by region?",
    "What happens to a message that matches no binding?",
    "How do you change routing without dropping in-flight messages?",
  ],
  mcqs: [
    {
      q: "Which exchange type ignores the routing key entirely?",
      options: [
        "Direct exchange",
        "Topic exchange",
        "Fanout exchange",
        "Headers exchange",
      ],
      answerIndex: 2,
      explanation:
        "A fanout exchange broadcasts every message to all bound queues regardless of the routing key. It is the simplest and fastest exchange type.",
    },
    {
      q: "In a topic exchange, what does the '#' wildcard match?",
      options: [
        "Exactly one word in the routing key",
        "Zero or more words in the routing key",
        "Any single character",
        "The entire routing key must be '#'",
      ],
      answerIndex: 1,
      explanation:
        "The '#' wildcard matches zero or more dot-delimited words. For example, 'order.#' matches 'order', 'order.created', and 'order.us.created'.",
    },
    {
      q: "What is the purpose of the x-match argument in a headers exchange binding?",
      options: [
        "It specifies the exchange type",
        "It determines whether all or any specified headers must match",
        "It sets the maximum number of matching queues",
        "It controls the message TTL for matched messages",
      ],
      answerIndex: 1,
      explanation:
        "x-match=all requires all specified headers to match for routing; x-match=any requires at least one header to match. This controls the logical AND vs OR behavior of header matching.",
    },
    {
      q: "What happens when a producer publishes with the mandatory flag and no binding matches?",
      options: [
        "The message is stored in the exchange",
        "The message is silently dropped",
        "The message is returned to the producer via basic.return",
        "The broker throws an exception and closes the channel",
      ],
      answerIndex: 2,
      explanation:
        "The mandatory flag tells the broker to return unroutable messages to the producer via a basic.return callback instead of silently dropping them.",
    },
  ],
  flashcards: [
    {
      front: "What are the four exchange types in RabbitMQ?",
      back: "Direct (exact routing key match), Topic (wildcard pattern matching with * and #), Fanout (broadcast to all bound queues), and Headers (match on message header attributes with x-match=all or x-match=any).",
    },
    {
      front: "What is the default exchange?",
      back: "A pre-declared nameless direct exchange that automatically binds every queue by its queue name. Publishing with routing key 'my-queue' delivers to the queue named 'my-queue'.",
    },
    {
      front: "What is the difference between * and # in topic exchange patterns?",
      back: "* matches exactly one dot-delimited word. # matches zero or more words. Example: 'a.*.c' matches 'a.b.c' but not 'a.b.d.c'. 'a.#' matches 'a', 'a.b', 'a.b.c'.",
    },
    {
      front: "What is an alternate exchange?",
      back: "A fallback exchange specified on another exchange. Messages that cannot be routed to any queue are forwarded to the alternate exchange instead of being dropped, enabling dead-letter patterns.",
    },
    {
      front: "What are exchange-to-exchange bindings?",
      back: "A RabbitMQ extension allowing exchanges to be bound to other exchanges (not just queues). This enables complex routing topologies like chaining a fanout to multiple topic exchanges.",
    },
    {
      front: "When does a fanout exchange outperform a topic exchange?",
      back: "Always, for broadcast scenarios. Fanout skips routing key evaluation entirely. Topic exchanges must evaluate wildcard patterns against routing keys for each binding, adding computational overhead.",
    },
    {
      front: "What does the mandatory flag do?",
      back: "It tells the broker to return messages to the producer via basic.return if no queue binding matches, instead of silently dropping them.",
    },
  ],
  resources: [
    {
      label: "RabbitMQ documentation — exchanges and routing", url: "https://www.rabbitmq.com/docs",
      kind: "docs",
    },
    {
      label: "Enterprise Integration Patterns — Hohpe & Woolf", url: "https://www.enterpriseintegrationpatterns.com/",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Exchange",
      definition:
        "A routing entity in RabbitMQ that receives messages from producers and routes them to queues based on the exchange type, routing key, and bindings.",
    },
    {
      term: "Binding",
      definition:
        "A rule linking an exchange to a queue (or another exchange), specifying the routing criteria (binding key or header match) for message delivery.",
    },
    {
      term: "Routing Key",
      definition:
        "A message attribute used by direct and topic exchanges to determine which bindings match. Typically a dot-delimited string like 'order.us.created'.",
    },
    {
      term: "Direct Exchange",
      definition:
        "An exchange that routes messages to queues whose binding key exactly matches the message routing key.",
    },
    {
      term: "Topic Exchange",
      definition:
        "An exchange that routes messages using wildcard pattern matching (* for one word, # for zero or more) against dot-delimited routing keys.",
    },
    {
      term: "Fanout Exchange",
      definition:
        "An exchange that broadcasts every message to all bound queues, ignoring routing keys entirely.",
    },
    {
      term: "Headers Exchange",
      definition:
        "An exchange that routes based on message header attributes rather than routing keys, using x-match=all or x-match=any to control matching logic.",
    },
  ],
  deepDive: [
    `**RabbitMQ exchanges** are the *heart of the routing layer* — they sit between **producers** and **queues**, making all routing decisions based on three factors: the **exchange type**, the message's \`routing_key\`, and the **binding rules** configured by consumers. Understanding exchanges deeply means understanding that *producers never send directly to queues*; they always publish to an exchange, even if it is the **default exchange** (an unnamed \`direct\` exchange that RabbitMQ pre-declares). Each exchange type implements the \`route()\` method differently: a **direct exchange** performs an O(1) hash lookup on the routing key against its binding table, a **topic exchange** walks a *trie data structure* to evaluate wildcard patterns (\`*\` and \`#\`), a **fanout exchange** simply iterates its binding list ignoring keys entirely, and a **headers exchange** inspects the \`headers\` property of the AMQP message and evaluates \`x-match\` logic. Exchanges can be declared with several important flags: \`durable\` (persisted to disk and survives broker restarts), \`autoDelete\` (removed when the last binding is removed), and \`internal\` (cannot receive publishes directly from clients — only from other exchanges via **exchange-to-exchange bindings**). The \`arguments\` table on declaration can set an \`alternate-exchange\`, which acts as a *fallback route* for messages that do not match any binding — this is a critical pattern for **dead-letter handling** and **auditing** unroutable messages rather than silently dropping them.`,

    `**Bindings** are the *glue* between exchanges and queues (or between exchanges and other exchanges). A binding is declared with \`channel.bindQueue(queue, exchange, pattern)\` or \`channel.bindExchange(destination, source, pattern)\`, where the \`pattern\` string is interpreted differently depending on the exchange type. For a **direct exchange**, the pattern is a *literal string* that must exactly match the \`routing_key\` of published messages. For a **topic exchange**, the pattern supports two wildcards: \`*\` matches *exactly one* dot-delimited word, and \`#\` matches *zero or more* words — so \`order.*.created\` matches \`order.us.created\` but not \`order.us.west.created\`, while \`order.#\` matches all three of \`order\`, \`order.created\`, and \`order.us.west.created\`. For a **fanout exchange**, the binding pattern is *ignored entirely* — every bound queue receives every message. For a **headers exchange**, the binding \`arguments\` contain key-value pairs that must match the message's headers, controlled by the \`x-match\` argument: \`all\` means every specified header must match (*logical AND*), and \`any\` means at least one must match (*logical OR*). Bindings can also carry an \`arguments\` table for advanced features like **priority bindings** or custom plugin logic. It is important to remember that bindings are *not automatically removed* when you delete and re-create a queue with the same name — you must explicitly unbind or the old bindings may linger as stale references.`,

    `**Exchange-to-exchange (E2E) bindings** are a powerful *RabbitMQ extension* beyond the AMQP 0-9-1 specification, enabling you to build **complex routing topologies** without modifying producer code. For example, you can set up a **fanout exchange** as the entry point, broadcasting to multiple **topic exchanges** that each route to different consumer groups based on different criteria — one topic exchange routes by *geographic region* (\`order.us.*\`, \`order.eu.*\`), another routes by *event type* (\`*.*.created\`, \`*.*.cancelled\`). This creates a **routing mesh** that is entirely transparent to producers. E2E bindings follow the same matching rules as queue bindings: if the source is a \`topic\` exchange, the E2E binding pattern supports \`*\` and \`#\` wildcards. Combined with the \`internal\` flag (marking an exchange as *not directly publishable*), you can create sophisticated **multi-tier routing architectures** where the first tier is a public-facing exchange and subsequent tiers are internal exchanges that refine routing further. Performance considerations are important: each additional exchange hop adds *latency* and *memory overhead* because messages are copied at each stage. For high-throughput systems (>50,000 msg/s), benchmark your E2E topology against a single topic exchange with more complex bindings — often a flat topology with well-designed routing keys is faster than a deep exchange chain. Use the **RabbitMQ Management UI** or the \`rabbitmqctl list_bindings\` command to visualize your binding graph and detect routing anomalies or orphaned bindings.`,
  ],
  code: [
    {
      language: "javascript",
      caption: "Declaring exchanges and bindings with different exchange types",
      source: `const amqplib = require("amqplib");

async function setupExchangesAndBindings() {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();

  // Declare a durable direct exchange
  await ch.assertExchange("orders.direct", "direct", { durable: true });

  // Declare a durable topic exchange
  await ch.assertExchange("orders.topic", "topic", { durable: true });

  // Declare a fanout exchange for broadcasting
  await ch.assertExchange("orders.fanout", "fanout", { durable: true });

  // Declare a headers exchange
  await ch.assertExchange("orders.headers", "headers", { durable: true });

  // Declare a durable queue and bind to direct exchange
  await ch.assertQueue("order-processing", { durable: true });
  await ch.bindQueue("order-processing", "orders.direct", "order.created");

  // Bind to topic exchange with wildcard pattern
  await ch.assertQueue("us-orders", { durable: true });
  await ch.bindQueue("us-orders", "orders.topic", "order.us.*");

  // Bind to fanout exchange (routing key is ignored)
  await ch.assertQueue("audit-log", { durable: true });
  await ch.bindQueue("audit-log", "orders.fanout", "");

  // Bind to headers exchange with x-match=all
  await ch.assertQueue("priority-orders", { durable: true });
  await ch.bindQueue("priority-orders", "orders.headers", "", {
    "x-match": "all",
    region: "us",
    priority: "high",
  });

  console.log("Exchanges and bindings configured successfully");
  await conn.close();
}

setupExchangesAndBindings().catch(console.error);`,
    },
    {
      language: "javascript",
      caption: "Publishing to different exchange types and handling unroutable messages",
      source: `const amqplib = require("amqplib");

async function publishToExchanges() {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();

  // Handle unroutable messages (returned when mandatory=true and no binding matches)
  ch.on("return", (msg) => {
    console.error("Message returned:", {
      exchange: msg.fields.exchange,
      routingKey: msg.fields.routingKey,
      replyText: msg.fields.replyText,
      content: msg.content.toString(),
    });
  });

  // Publish to direct exchange — exact routing key match
  ch.publish("orders.direct", "order.created", Buffer.from(
    JSON.stringify({ orderId: "ORD-001", amount: 99.99 })
  ), { persistent: true });

  // Publish to topic exchange — matches bindings like "order.us.*"
  ch.publish("orders.topic", "order.us.created", Buffer.from(
    JSON.stringify({ orderId: "ORD-002", region: "us" })
  ), { persistent: true });

  // Publish to fanout exchange — routing key ignored, all bound queues receive it
  ch.publish("orders.fanout", "", Buffer.from(
    JSON.stringify({ event: "order.created", orderId: "ORD-003" })
  ), { persistent: true });

  // Publish to headers exchange — routing based on headers, not routing key
  ch.publish("orders.headers", "", Buffer.from(
    JSON.stringify({ orderId: "ORD-004", amount: 500 })
  ), {
    persistent: true,
    headers: { region: "us", priority: "high" },
  });

  // Publish with mandatory flag — returns message if no binding matches
  ch.publish("orders.direct", "order.unknown", Buffer.from(
    JSON.stringify({ orderId: "ORD-005" })
  ), { persistent: true, mandatory: true });

  console.log("Messages published to all exchange types");
  setTimeout(() => conn.close(), 1000); // wait for return callbacks
}

publishToExchanges().catch(console.error);`,
    },
    {
      language: "javascript",
      caption: "Exchange-to-exchange bindings and alternate exchange pattern",
      source: `const amqplib = require("amqplib");

async function setupAdvancedTopology() {
  const conn = await amqplib.connect("amqp://localhost");
  const ch = await conn.createChannel();

  // Create an alternate exchange to capture unroutable messages
  await ch.assertExchange("orders.unroutable", "fanout", { durable: true });
  await ch.assertQueue("dead-letters", { durable: true });
  await ch.bindQueue("dead-letters", "orders.unroutable", "");

  // Declare main exchange with alternate-exchange argument
  await ch.assertExchange("orders.main", "topic", {
    durable: true,
    arguments: { "alternate-exchange": "orders.unroutable" },
  });

  // Declare internal sub-exchanges for exchange-to-exchange bindings
  await ch.assertExchange("orders.region.us", "direct", {
    durable: true,
    internal: true, // cannot be published to directly by clients
  });
  await ch.assertExchange("orders.region.eu", "direct", {
    durable: true,
    internal: true,
  });

  // Bind sub-exchanges to the main exchange (exchange-to-exchange binding)
  await ch.bindExchange("orders.region.us", "orders.main", "order.us.#");
  await ch.bindExchange("orders.region.eu", "orders.main", "order.eu.#");

  // Bind queues to the regional sub-exchanges
  await ch.assertQueue("us-fulfillment", { durable: true });
  await ch.bindQueue("us-fulfillment", "orders.region.us", "order.us.created");

  await ch.assertQueue("eu-fulfillment", { durable: true });
  await ch.bindQueue("eu-fulfillment", "orders.region.eu", "order.eu.created");

  // Publish a message — routes through main -> regional -> queue
  ch.publish("orders.main", "order.us.created", Buffer.from(
    JSON.stringify({ orderId: "ORD-100", region: "us" })
  ), { persistent: true });

  // This message has no matching binding — goes to alternate exchange
  ch.publish("orders.main", "order.jp.created", Buffer.from(
    JSON.stringify({ orderId: "ORD-101", region: "jp" })
  ), { persistent: true });

  console.log("Advanced topology with E2E bindings configured");
  await conn.close();
}

setupAdvancedTopology().catch(console.error);`,
    },
  ],
  diagrams: [
    {
      title: "Exchange Types and Routing Flow",
      kind: "architecture",
      caption: "How messages flow from producers through different exchange types to their bound queues.",
      mermaid: `graph LR
    P["Producer"] --> DE["Direct Exchange\nexact routing key match"]
    P --> TE["Topic Exchange\nwildcard pattern match"]
    P --> FE["Fanout Exchange\nbroadcast to all queues"]
    DE --> Q1["order-processing queue"]
    DE --> Q2["shipping queue"]
    TE --> Q3["us-orders queue"]
    TE --> Q4["eu-orders queue"]
    TE --> Q5["all-orders queue"]
    FE --> Q6["audit-log queue"]
    FE --> Q7["analytics queue"]`,
    },
    {
      title: "Exchange-to-Exchange Binding Topology",
      kind: "network",
      caption: "Multi-tier routing using exchange-to-exchange bindings with alternate exchange fallback for unroutable messages.",
      mermaid: `graph TD
    P["Producer"] -->|"publish"| MAIN["orders.main\ntopic exchange"]
    MAIN -->|"order.us.#"| US["orders.region.us\ndirect exchange"]
    MAIN -->|"order.eu.#"| EU["orders.region.eu\ndirect exchange"]
    MAIN -.->|"unroutable"| ALT["orders.unroutable\nfanout alternate exchange"]
    US --> Q1["us-fulfillment"]
    US --> Q2["us-cancellations"]
    EU --> Q3["eu-fulfillment"]
    EU --> Q4["eu-cancellations"]
    ALT --> DL["dead-letters queue"]`,
    },
    {
      title: "Message Publish and Consume Sequence",
      kind: "sequence",
      caption: "End-to-end sequence of publishing a message through an exchange and consuming it from a queue.",
      mermaid: `sequenceDiagram
    participant Prod as Producer
    participant Exch as Exchange
    participant Q as Queue
    participant Cons as Consumer

    Prod->>Exch: Publish message with routing key
    Exch->>Exch: Match routing key against bindings
    Exch->>Q: Route message to matching queue
    Q->>Q: Persist message
    Cons->>Q: Consume (subscribe or poll)
    Q-->>Cons: Deliver message
    Cons->>Cons: Process message
    Cons->>Q: Acknowledge (ack)
    Q->>Q: Remove message from queue`,
    },
    {
      title: "Topic Exchange Wildcard Matching",
      kind: "flow",
      caption: "How star and hash wildcards in topic exchange binding keys match incoming routing keys.",
      mermaid: `flowchart LR
    PUB["Publisher"] -->|"order.us.created"| TX["Topic Exchange"]
    TX -->|"order.us.* matches"| Q1["us-orders queue"]
    TX -->|"order.# matches all order keys"| Q2["all-orders queue"]
    TX -->|"order.*.created matches"| Q3["created-orders queue"]
    TX -->|"*.us.* does not match order.us.west.created"| NOMATCH["No route"]`,
    },
  ],
  animations: [
    {
      title: "One event routed four ways",
      steps: [
        {
          label: "Direct exchange",
          detail: "Routing key `order.eu` goes only to the queue bound with exactly that key.",
        },
        {
          label: "Fanout exchange",
          detail: "Every bound queue gets a copy, routing key ignored — the broadcast case.",
        },
        {
          label: "Topic exchange",
          detail: "Key `order.eu.created` matches bindings `order.#` and `order.*.created` but not `order.us.#`.",
        },
        {
          label: "Headers exchange",
          detail: "Routing on header attributes rather than the key, for when the key can't express the condition.",
        },
        {
          label: "No match",
          detail: "The message is silently dropped unless the exchange has an alternate-exchange configured — a common source of vanishing messages.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Direct Exchange",
      "Topic Exchange",
      "Fanout Exchange",
      "Headers Exchange",
    ],
    rows: [
      [
        "**Routing basis**",
        "Exact `routing_key` match",
        "Wildcard pattern on `routing_key`",
        "Ignores `routing_key`",
        "Message `headers` attributes",
      ],
      [
        "**Wildcards**",
        "None",
        "`*` (one word), `#` (zero or more)",
        "N/A",
        "N/A (uses `x-match`)",
      ],
      [
        "**Performance**",
        "O(1) hash lookup",
        "Trie traversal, slower",
        "Fastest (no evaluation)",
        "Header comparison per binding",
      ],
      [
        "**Use case**",
        "Task routing, RPC",
        "Log routing, event hierarchies",
        "Broadcast, notifications",
        "Multi-attribute routing",
      ],
      [
        "**Binding key**",
        "Literal string",
        "Dot-delimited with wildcards",
        "Ignored (empty string)",
        "Header key-value pairs",
      ],
      [
        "**Multiple queues**",
        "Yes, same key = fan-out",
        "Yes, overlapping patterns",
        "Yes, all bound queues",
        "Yes, matching headers",
      ],
      [
        "**Default exchange**",
        "Yes (unnamed direct)",
        "No",
        "No",
        "No",
      ],
    ],
  },
  exercises: [
    "Set up a **topic exchange** called `logs` with three queues: `all-logs` (binding `#`), `error-logs` (binding `*.error`), and `auth-logs` (binding `auth.*`). Publish messages with routing keys like `auth.error`, `auth.info`, `payment.error`, and `payment.info`. Verify that each queue receives *only the expected messages* by consuming from all three queues.",
    "Implement an **alternate exchange** pattern: declare a main `direct` exchange with an alternate `fanout` exchange. Bind a `dead-letters` queue to the alternate exchange. Publish messages with routing keys that *do not match* any binding on the main exchange and confirm they appear in the `dead-letters` queue. Then add the `mandatory` flag and observe the difference in behavior.",
    "Build an **exchange-to-exchange topology** where a `fanout` exchange broadcasts to two `topic` sub-exchanges. Each topic exchange routes to different queues based on different routing key patterns. Publish a single message and trace its path through the exchange chain, verifying it arrives at the correct final queues.",
    "Create a **headers exchange** with two bindings: one with `x-match=all` requiring `{ region: 'us', priority: 'high' }`, and another with `x-match=any` requiring `{ region: 'eu', priority: 'low' }`. Publish messages with various header combinations and document which messages match which binding. Pay attention to edge cases like *missing headers* and *extra headers*.",
    "Write a Node.js script that dynamically creates **temporary exclusive queues** (with `{ exclusive: true }`), binds them to a `fanout` exchange, consumes messages, and observe what happens when the consumer disconnects. Then modify the script to use a `topic` exchange with changing subscription patterns — add and remove bindings at runtime and verify the consumer receives only the currently subscribed message patterns.",
  ],
  cheatSheet: [
    "**Declare exchange**: `ch.assertExchange(name, type, { durable: true })` — types are `direct`, `topic`, `fanout`, `headers`.",
    "**Bind queue to exchange**: `ch.bindQueue(queue, exchange, routingKey)` — for headers exchanges, pass match criteria as the 4th argument: `{ 'x-match': 'all', key: 'value' }`.",
    "**Publish to exchange**: `ch.publish(exchange, routingKey, Buffer.from(msg), { persistent: true })` — set `mandatory: true` to get returns for unroutable messages.",
    "**Topic wildcards**: `*` matches *exactly one* dot-delimited word, `#` matches *zero or more* words. Pattern `order.*.created` matches `order.us.created` but not `order.us.west.created`.",
    "**Alternate exchange**: Declare with `{ arguments: { 'alternate-exchange': 'my-alt-exchange' } }` — unroutable messages forwarded to the alternate exchange instead of being dropped.",
    "**Exchange-to-exchange bind**: `ch.bindExchange(destination, source, pattern)` — source exchange routes matching messages to destination exchange. Mark destination as `internal: true` to prevent direct publishing.",
  ],
  revisionNotes: [
    "**Exchanges route, queues store**: producers publish to exchanges, never directly to queues. The *exchange type* determines the routing algorithm: `direct` = exact match, `topic` = wildcard match, `fanout` = broadcast, `headers` = header attribute match.",
    "**Bindings are the wiring**: a queue receives messages only if it has a binding to the exchange. The binding key is interpreted by the exchange type — literal for `direct`, pattern with `*`/`#` for `topic`, ignored for `fanout`, and header key-value pairs for `headers`.",
    "**Default exchange shortcut**: the unnamed `direct` exchange auto-binds every queue by its name. Publishing with `ch.sendToQueue(queueName, msg)` is equivalent to `ch.publish('', queueName, msg)` — both use the default exchange.",
    "**Unroutable message handling**: by default, messages with no matching binding are *silently dropped*. Use the `mandatory` flag for `basic.return` callbacks, or configure an **alternate exchange** for automatic fallback routing to a dead-letter queue.",
    "**Exchange-to-exchange bindings** enable multi-tier routing topologies without changing producer code. Combine with the `internal` flag to create exchanges that only receive messages from other exchanges, building layered routing architectures.",
  ],
};
