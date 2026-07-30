import type { TopicContent } from "../types";

export const rabbitmqFundamentals: TopicContent = {
  quickSummary: [
    "RabbitMQ is an open-source message broker implementing AMQP 0-9-1, providing reliable message delivery through exchanges, queues, and bindings with support for multiple messaging patterns.",
    "Virtual hosts (vhosts) provide logical isolation within a single RabbitMQ instance — each vhost has its own exchanges, queues, bindings, permissions, and policies, similar to database schemas.",
    "Connections are long-lived TCP sockets between clients and brokers, while channels are lightweight virtual connections multiplexed over a single connection — avoiding the overhead of multiple TCP connections.",
    "RabbitMQ uses a push-based delivery model where the broker pushes messages to consumers (basic.consume), unlike Kafka's pull-based model — though basic.get allows polling for individual messages.",
  ],
  detailed: [
    `## AMQP 0-9-1 Protocol Model

The **Advanced Message Queuing Protocol (AMQP) 0-9-1** defines the wire-level protocol RabbitMQ implements. The core model has three components: **producers** publish messages to **exchanges**, exchanges route messages to **queues** based on **bindings** and routing rules, and **consumers** subscribe to queues.

Messages in AMQP have a body (opaque bytes), routing key, and properties (headers, content-type, delivery-mode, priority, expiration, etc.). The protocol guarantees that messages are delivered atomically — either the entire message arrives or nothing does. AMQP also defines transactions and publisher confirms for delivery guarantees.`,

    `## Virtual Hosts

A **virtual host (vhost)** is a logical grouping of resources within a RabbitMQ broker. Each vhost has its own namespace for exchanges, queues, bindings, users, and permissions. The default vhost is \`/\`.

Vhosts provide multi-tenancy without running separate broker instances. A user can have different permissions across vhosts — configure (create/delete resources), write (publish), and read (consume). Policies, federation, and shovel configurations are also scoped to vhosts. Cross-vhost communication requires the Shovel or Federation plugins to bridge messages between vhosts.`,

    `## Connections and Channels

A **connection** is a TCP socket between a client application and the RabbitMQ broker, authenticated via SASL (PLAIN, AMQPLAIN, or EXTERNAL). Connections support TLS encryption and are relatively expensive to establish due to the TCP and AMQP handshake.

A **channel** is a virtual connection inside a real TCP connection. All AMQP operations (declare, publish, consume, ack) happen on channels. Multiple channels are multiplexed over one TCP connection, allowing concurrent operations without the overhead of multiple TCP connections. Each channel has an independent flow control and error scope — a channel error (e.g., publishing to a non-existent exchange) closes that channel, not the entire connection.`,

    `## Queue Properties and Types

Queues in RabbitMQ can be **durable** (survive broker restart — metadata and persistent messages are preserved) or **transient** (deleted on restart). The \`auto-delete\` flag removes a queue when its last consumer disconnects. \`exclusive\` queues are scoped to the declaring connection and auto-deleted when it closes.

**Classic queues** store messages in a single-node queue process. **Quorum queues** (recommended for production) use Raft consensus to replicate messages across multiple nodes for high availability. **Stream queues** provide a Kafka-like append-only log within RabbitMQ, supporting multiple consumers reading from offsets and high fan-out without message duplication.`,

    `## Message Flow and Flow Control

When a consumer subscribes with \`basic.consume\`, the broker **pushes** messages to the consumer. The **prefetch count** (\`basic.qos\`) limits how many unacknowledged messages the broker will send to a consumer — this prevents fast producers from overwhelming slow consumers.

**Connection-level flow control** uses TCP backpressure and credit-based flow. When a broker is under memory or disk pressure, it can block publishing connections (the connection enters a "blocked" state). Producers should handle connection.blocked and connection.unblocked notifications gracefully. The **memory alarm** triggers at 40% of available RAM by default, and the **disk alarm** triggers when free disk drops below a configured limit.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between a connection and a channel in RabbitMQ?",
      a: "A connection is a physical TCP socket between a client and broker, involving TCP handshake and AMQP authentication — relatively expensive to create. A channel is a lightweight virtual connection multiplexed over a single TCP connection. All AMQP operations happen on channels. Multiple channels share one connection for concurrent operations. Channels have independent error scopes — a channel error closes that channel only, not the connection. Best practice is one connection per application with one channel per thread.",
    },
    {
      q: "Explain the purpose of virtual hosts in RabbitMQ.",
      a: "Virtual hosts provide logical isolation within a single RabbitMQ instance. Each vhost has its own namespace for exchanges, queues, bindings, and permissions. They enable multi-tenancy — different applications or environments can share a broker without interfering. Users can have different permissions per vhost (configure, write, read). Policies are vhost-scoped. Cross-vhost messaging requires Shovel or Federation plugins. They are analogous to database schemas or Kafka's concept of separate clusters.",
    },
    {
      q: "How does RabbitMQ handle backpressure when consumers are slow?",
      a: "RabbitMQ uses multiple mechanisms: (1) prefetch count (basic.qos) limits unacknowledged messages delivered to each consumer — the broker stops pushing until acks arrive; (2) TCP-level backpressure through credit-based flow control between internal processes; (3) connection blocking when broker memory exceeds the alarm threshold (default 40% RAM) or disk space is critically low — publishing connections are blocked and receive connection.blocked notifications. These mechanisms prevent the broker from being overwhelmed.",
    },
  ],
  mcqs: [
    {
      q: "What is the default virtual host in RabbitMQ?",
      options: ["default", "/", "main", "rabbitmq"],
      answerIndex: 1,
      explanation:
        "The default virtual host in RabbitMQ is '/' (forward slash). All connections that do not specify a vhost use this default.",
    },
    {
      q: "Which queue type uses Raft consensus for replication in RabbitMQ?",
      options: [
        "Classic queues",
        "Quorum queues",
        "Stream queues",
        "Priority queues",
      ],
      answerIndex: 1,
      explanation:
        "Quorum queues use Raft-based consensus to replicate messages across multiple nodes, providing high availability and data safety. They are the recommended queue type for production workloads.",
    },
    {
      q: "What happens when a channel error occurs in RabbitMQ?",
      options: [
        "The entire connection is closed",
        "Only the affected channel is closed",
        "The broker restarts the connection",
        "All channels on the connection are paused",
      ],
      answerIndex: 1,
      explanation:
        "Channels have independent error scopes. A channel error (like publishing to a non-existent exchange) closes only that channel, not the underlying TCP connection or other channels on it.",
    },
    {
      q: "What does basic.qos prefetch count control?",
      options: [
        "The maximum message size",
        "The number of unacknowledged messages the broker will deliver to a consumer",
        "The number of connections a client can open",
        "The rate at which producers can publish",
      ],
      answerIndex: 1,
      explanation:
        "The prefetch count limits how many unacknowledged messages the broker will push to a consumer. The broker stops delivering new messages to that consumer until it acknowledges some of the outstanding ones.",
    },
  ],
  flashcards: [
    {
      front: "What is AMQP 0-9-1?",
      back: "The Advanced Message Queuing Protocol version 0-9-1 — a wire-level protocol defining how clients communicate with message brokers. It specifies exchanges, queues, bindings, and message properties.",
    },
    {
      front: "What is the difference between durable and transient queues?",
      back: "Durable queues survive broker restarts (metadata and persistent messages are preserved). Transient queues are deleted when the broker restarts. Note: message durability also requires delivery-mode=2 (persistent).",
    },
    {
      front: "What are quorum queues?",
      back: "A replicated queue type using Raft consensus across multiple RabbitMQ nodes. They provide high availability, data safety, and are the recommended replacement for classic mirrored queues.",
    },
    {
      front: "What triggers the RabbitMQ memory alarm?",
      back: "When the broker's memory usage exceeds the high watermark (default 40% of available RAM). The broker blocks all publishing connections until memory drops below the threshold.",
    },
    {
      front: "What is an exclusive queue?",
      back: "A queue that is scoped to the declaring connection — only that connection can consume from it. It is automatically deleted when the connection closes. Used for temporary reply queues in RPC patterns.",
    },
    {
      front: "What are stream queues in RabbitMQ?",
      back: "A queue type providing Kafka-like append-only log semantics. Consumers can read from specific offsets, multiple consumers can read independently, and messages are not removed after consumption.",
    },
    {
      front: "How does credit-based flow control work in RabbitMQ?",
      back: "Internal processes grant 'credits' to upstream processes. Each message sent uses a credit. When credits are exhausted, the sender blocks until the receiver grants more, providing natural backpressure without external coordination.",
    },
  ],
  glossary: [
    {
      term: "AMQP",
      definition:
        "Advanced Message Queuing Protocol — an open standard application-layer protocol for message-oriented middleware, defining message format, routing, queuing, and delivery guarantees.",
    },
    {
      term: "Virtual Host (vhost)",
      definition:
        "A logical partition within a RabbitMQ broker providing isolated namespaces for exchanges, queues, bindings, and permissions.",
    },
    {
      term: "Connection",
      definition:
        "A TCP socket between a client and RabbitMQ broker, authenticated via SASL, over which channels are multiplexed.",
    },
    {
      term: "Channel",
      definition:
        "A virtual connection multiplexed over a TCP connection. All AMQP operations occur on channels, each with independent error handling and flow control.",
    },
    {
      term: "Quorum Queue",
      definition:
        "A replicated queue type using Raft consensus for high availability and data safety across multiple RabbitMQ cluster nodes.",
    },
    {
      term: "Prefetch Count",
      definition:
        "The maximum number of unacknowledged messages the broker will deliver to a consumer, set via basic.qos. Controls consumer-level flow.",
    },
    {
      term: "Stream Queue",
      definition:
        "A queue type providing append-only log semantics with offset-based consumption, enabling non-destructive reads and high fan-out patterns.",
    },
  ],
};
