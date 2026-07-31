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
  deepDive: [
    `The **AMQP 0-9-1 protocol** is a *binary wire-level protocol* that defines exactly how bytes are transmitted between client and broker. Unlike HTTP-based messaging APIs, AMQP operates at a much lower level: the connection starts with a **protocol header** (\`AMQP\\x00\\x00\\x09\\x01\`), followed by a *negotiation phase* where client and broker agree on **frame size**, **channel limit**, and **heartbeat interval**. Every operation — \`queue.declare\`, \`basic.publish\`, \`basic.consume\` — is a **method frame** sent on a specific channel. Understanding this matters because it explains why **channels** exist: they are *multiplexed logical streams* within a single TCP connection, each with its own **flow control** and **error boundary**. When you call \`channel.assertQueue()\` in amqplib, the library sends a \`queue.declare\` method frame on that channel and waits for the \`queue.declare-ok\` response. If the declaration fails (e.g., redeclaring a queue with different properties), the *channel* is closed with a \`channel.close\` frame — but the TCP connection and other channels remain intact. This is why the best practice is **one channel per thread/operation** and **one connection per application instance** — you get concurrency isolation without the overhead of multiple TCP handshakes.`,

    `**Virtual hosts** in RabbitMQ are far more than simple namespaces — they are *complete isolation boundaries* for the broker's resource model. Each vhost maintains its own set of **exchanges**, **queues**, **bindings**, **policies**, **operator policies**, and **user permissions**. When a client connects, it specifies a vhost in the \`connection.open\` frame (e.g., \`amqp://user:pass@host:5672/my-vhost\`), and from that point on, *every operation* is scoped to that vhost. You cannot publish to an exchange in one vhost from a connection authenticated against another. This isolation makes vhosts ideal for **multi-tenancy** (different customers on the same broker), **environment separation** (dev, staging, production queues on one cluster), and **security boundaries** (users can have \`configure\`, \`write\`, and \`read\` permissions per vhost). The three permission types map directly to AMQP operations: *configure* allows \`queue.declare\` and \`exchange.declare\`; *write* allows \`basic.publish\` and \`queue.bind\` (binding the exchange side); *read* allows \`basic.consume\` and \`queue.bind\` (binding the queue side). Permissions use **regex patterns** — granting write permission on \`^order\\..*\` lets the user publish only to exchanges matching that pattern.`,

    `**Queue types** in modern RabbitMQ represent a critical architectural decision. **Classic queues** are the original single-node queue implementation — fast and simple, but the queue process lives on *one node* only. If that node fails, the queue is unavailable (and if it was not durable, it is *lost*). **Quorum queues** (introduced in RabbitMQ 3.8) solve this by replicating queue state across multiple nodes using the **Raft consensus algorithm**. A message published to a quorum queue is confirmed *only after a majority of replicas* (e.g., 2 of 3 nodes) have written it to their *write-ahead log* (WAL). This provides **data safety** even if a minority of nodes fail. Quorum queues also support **poison message handling** via the \`x-delivery-limit\` header — after N redeliveries, the message is automatically dead-lettered. **Stream queues** (introduced in RabbitMQ 3.9) take a fundamentally different approach: they are an *append-only log* inspired by Apache Kafka. Messages are not removed after consumption; instead, consumers track their **offset** and can re-read from any point. This enables **high fan-out** (many consumers reading independently), **replay** (reprocessing historical events), and **time-travel queries**. The trade-off is that stream queues use more disk space and do not support per-message TTL or classic queue semantics like \`basic.reject\` with \`requeue=true\`.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Establishing a connection with channels, vhost, and heartbeat configuration",
      source: `const amqp = require('amqplib');

async function setupConnection() {
  // Connect to a specific vhost with heartbeat and connection timeout
  const connection = await amqp.connect({
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/my-app',       // Specific virtual host
    heartbeat: 30,           // Heartbeat interval in seconds
  });

  // Handle connection-level events
  connection.on('error', (err) => {
    console.error('Connection error:', err.message);
  });
  connection.on('close', () => {
    console.log('Connection closed — attempting reconnect...');
  });
  connection.on('blocked', (reason) => {
    console.warn('Connection BLOCKED by broker:', reason);
  });
  connection.on('unblocked', () => {
    console.log('Connection unblocked — publishing can resume');
  });

  // Create a channel for operations
  const channel = await connection.createChannel();

  channel.on('error', (err) => {
    console.error('Channel error:', err.message);
  });
  channel.on('close', () => {
    console.log('Channel closed');
  });

  // Set prefetch (QoS) — limit unacked messages per consumer
  await channel.prefetch(10);

  console.log('Connected to vhost /my-app with prefetch=10');
  return { connection, channel };
}

setupConnection().catch(console.error);`,
    },
    {
      language: "typescript",
      caption: "Declaring different queue types: classic, quorum, and stream",
      source: `const amqp = require('amqplib');

async function declareQueues() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // 1. Classic durable queue
  await channel.assertQueue('classic.orders', {
    durable: true,           // Survives broker restart
    arguments: {
      'x-queue-type': 'classic',
      'x-max-length': 100000,         // Max messages in queue
      'x-message-ttl': 86400000,      // Message TTL: 24 hours (ms)
      'x-dead-letter-exchange': 'dlx.orders',  // DLX for rejected/expired
    },
  });

  // 2. Quorum queue (replicated across cluster nodes via Raft)
  await channel.assertQueue('quorum.payments', {
    durable: true,           // Quorum queues are always durable
    arguments: {
      'x-queue-type': 'quorum',
      'x-quorum-initial-group-size': 3,  // Replicate across 3 nodes
      'x-delivery-limit': 5,             // Auto dead-letter after 5 redeliveries
    },
  });

  // 3. Stream queue (append-only log, Kafka-like)
  await channel.assertQueue('stream.events', {
    durable: true,
    arguments: {
      'x-queue-type': 'stream',
      'x-max-length-bytes': 1073741824,  // 1 GB max segment size
      'x-max-age': '7D',                 // Retain messages for 7 days
      'x-stream-max-segment-size-bytes': 52428800, // 50 MB per segment
    },
  });

  console.log('All queue types declared successfully');
  await channel.close();
  await connection.close();
}

declareQueues().catch(console.error);`,
    },
    {
      language: "typescript",
      caption: "Producer and consumer with prefetch, manual ack, and graceful shutdown",
      source: `const amqp = require('amqplib');

async function startWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const queue = 'tasks.processing';
  await channel.assertQueue(queue, { durable: true });

  // Prefetch 5: broker sends at most 5 unacked messages
  await channel.prefetch(5);

  console.log('Worker ready. Waiting for tasks...');

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const task = JSON.parse(msg.content.toString());
    const deliveryTag = msg.fields.deliveryTag;
    const isRedelivered = msg.fields.redelivered;

    console.log(
      \`Processing task \${task.id} (tag: \${deliveryTag}, redelivered: \${isRedelivered})\`
    );

    try {
      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 500));
      channel.ack(msg);  // Success — remove from queue
      console.log(\`Task \${task.id} completed\`);
    } catch (err) {
      console.error(\`Task \${task.id} failed:\`, err);
      // Reject without requeue — sends to DLX if configured
      channel.nack(msg, false, false);
    }
  }, { noAck: false });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await channel.close();
    await connection.close();
    process.exit(0);
  });
}

startWorker().catch(console.error);`,
    },
  ],
  diagrams: [
    {
      title: "RabbitMQ AMQP Architecture",
      kind: "architecture",
      caption: "The core components of RabbitMQ: connections, channels, exchanges, bindings, queues, and consumers.",
      mermaid: `graph LR
  subgraph Client Application
    Conn[TCP Connection]
    Ch1[Channel 1]
    Ch2[Channel 2]
    Ch3[Channel 3]
    Conn --> Ch1
    Conn --> Ch2
    Conn --> Ch3
  end

  subgraph RabbitMQ Broker
    subgraph VHost /production
      Ex1[Direct Exchange]
      Ex2[Topic Exchange]
      Q1[Quorum Queue]
      Q2[Classic Queue]
      Q3[Stream Queue]
      Ex1 -->|binding key: order.new| Q1
      Ex2 -->|pattern: log.*| Q2
      Ex2 -->|pattern: event.#| Q3
    end
  end

  Ch1 -->|publish| Ex1
  Ch2 -->|publish| Ex2
  Ch3 -->|consume| Q1`,
    },
    {
      title: "Connection and Channel Lifecycle",
      kind: "sequence",
      caption: "How a client establishes a connection, opens channels, and handles errors independently per channel.",
      mermaid: `sequenceDiagram
  participant App as Client App
  participant Broker as RabbitMQ Broker

  App->>Broker: TCP connect + AMQP handshake
  Broker-->>App: connection.tune (frame size, heartbeat)
  App->>Broker: connection.open (vhost: /production)
  Broker-->>App: connection.open-ok

  App->>Broker: channel.open (channel 1)
  Broker-->>App: channel.open-ok
  App->>Broker: channel.open (channel 2)
  Broker-->>App: channel.open-ok

  App->>Broker: queue.declare on channel 1
  Broker-->>App: queue.declare-ok

  Note over App,Broker: Channel 2 error (e.g. redeclare mismatch)
  Broker->>App: channel.close (channel 2 only)
  Note over App: Channel 1 still active
  App->>Broker: basic.publish on channel 1
  Broker-->>App: basic.ack`,
    },
    {
      title: "Queue Types Comparison",
      kind: "mindmap",
      caption: "Overview of RabbitMQ queue types and their key characteristics.",
      mermaid: `mindmap
  root((Queue Types))
    Classic Queue
      Single node
      Fastest performance
      No built-in replication
      Supports all features
    Quorum Queue
      Raft consensus
      Multi-node replication
      Majority write confirmation
      x-delivery-limit support
      Recommended for production
    Stream Queue
      Append-only log
      Offset-based consumption
      Non-destructive reads
      High fan-out
      Time-based retention`,
    },
  ],
  comparison: {
    columns: ["Feature", "Classic Queue", "Quorum Queue", "Stream Queue"],
    rows: [
      ["**Replication**", "*None* — single node", "*Raft consensus* across N nodes", "*Raft-based* segment replication"],
      ["**Data safety**", "Durable + persistent messages", "**Majority write** before confirm", "Always persisted to segments"],
      ["**Message removal**", "On `basic.ack`", "On `basic.ack`", "*Never* — offset-based reads"],
      ["**Performance**", "*Highest* throughput", "Moderate (consensus overhead)", "High throughput, *high fan-out*"],
      ["**Poison message handling**", "Manual via DLX", "Built-in `x-delivery-limit`", "N/A (no ack/reject semantics)"],
      ["**Use case**", "Non-critical, high-speed workloads", "**Production workloads** requiring HA", "Event sourcing, audit logs, replay"],
      ["**Memory usage**", "In-memory + paging", "In-memory + WAL", "*Disk-heavy* with segment files"],
    ],
  },
  exercises: [
    "**Set up a multi-vhost environment**: create two virtual hosts (`/dev` and `/prod`) using the RabbitMQ management API or CLI. Configure a user with *full permissions* on `/dev` but **read-only** permissions on `/prod`. Verify isolation by attempting to declare a queue on `/prod`.",
    "**Implement connection resilience**: write a Node.js application using `amqplib` that automatically **reconnects** when the connection drops. Handle `connection.close`, `connection.error`, and `connection.blocked` events. Use *exponential backoff* with a maximum delay of 30 seconds.",
    "**Compare queue types**: declare a *classic*, *quorum*, and *stream* queue on the same broker. Publish 10,000 messages to each and measure **publish throughput**, **consume throughput**, and **memory usage** via the management API (`/api/queues`). Document the trade-offs observed.",
    "**Build a channel pool**: create a connection with a pool of **5 channels**, assigning each publish/consume operation to a channel using round-robin. Handle individual channel errors without disrupting the connection or other channels. Measure the throughput improvement over single-channel usage.",
    "**Implement flow control handling**: write a producer that publishes messages continuously and correctly handles `connection.blocked` and `connection.unblocked` events by **pausing** and **resuming** publishing. Test by lowering the broker's memory alarm threshold.",
  ],
  cheatSheet: [
    "**Connection** = TCP socket (expensive to create). **Channel** = virtual connection multiplexed over TCP (cheap). Rule: *1 connection per app, 1 channel per thread*.",
    "**Vhost permissions**: `configure` = declare/delete resources, `write` = publish to exchanges, `read` = consume from queues. Each uses a **regex pattern** for fine-grained control.",
    "**Queue durability** = metadata survives restart. **Message persistence** = `delivery-mode: 2`. You need **both** for messages to survive a broker restart.",
    "**Prefetch** (`basic.qos`): set to `1` for *fair dispatch* to slow consumers; set to `10-50` for *throughput*. Never use `0` (unlimited) in production.",
    "**Quorum queues**: always durable, Raft-replicated, support `x-delivery-limit`. Use for any queue where **data loss is unacceptable**.",
    "**Stream queues**: append-only log, consumers read by **offset** or **timestamp**. Messages are *never deleted* by ack — retention is time/size-based.",
  ],
  revisionNotes: [
    "RabbitMQ implements **AMQP 0-9-1** — a *binary wire protocol* with method frames sent on multiplexed channels over a single TCP connection. The protocol defines the exact byte format for `queue.declare`, `basic.publish`, `basic.consume`, and all other operations.",
    "**Channels** provide *concurrency isolation* without TCP overhead. Each channel has independent **error handling** (channel error closes only that channel) and **flow control**. Best practice: one connection per app instance, one channel per concurrent operation.",
    "**Virtual hosts** are *complete isolation boundaries* — separate exchanges, queues, bindings, permissions, and policies. Users have per-vhost permissions: `configure`, `write`, `read`, each with regex-based resource matching.",
    "**Three queue types**: *Classic* (single node, fastest), *Quorum* (Raft replicated, production-recommended), *Stream* (append-only log, Kafka-like). Choose based on your data safety, performance, and consumption pattern requirements.",
    "**Flow control** operates at multiple levels: `prefetch` limits unacked messages per consumer, **credit-based flow** between internal processes, and **connection blocking** when memory/disk alarms trigger. Producers must handle `blocked`/`unblocked` events.",
  ],
};
