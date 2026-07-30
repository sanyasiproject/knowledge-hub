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
};
