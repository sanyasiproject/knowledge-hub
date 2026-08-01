import type { TopicContent } from "../types";

export const rabbitmqReliability: TopicContent = {
  quickSummary: [
    "Publisher confirms provide asynchronous acknowledgment from the broker that a message has been accepted — the broker sends a basic.ack (or basic.nack) after the message is persisted or routed, replacing heavyweight AMQP transactions.",
    "Consumer acknowledgments (basic.ack, basic.nack, basic.reject) control when a message is removed from the queue — unacknowledged messages are redelivered if the consumer disconnects or the channel closes.",
    "Persistent messages (delivery-mode=2) combined with durable queues survive broker restarts — without both, messages are lost on restart even if one of the two is configured.",
    "Dead letter exchanges (DLX) capture messages that are rejected, expired, or exceed queue length limits, enabling retry patterns and poison message handling without losing data.",
  ],
  detailed: [
    `## Publisher Confirms

**Publisher confirms** (a RabbitMQ extension) provide reliable publishing. When a channel is put into confirm mode (\`confirm.select\`), the broker assigns a sequential delivery tag to each published message and asynchronously sends a \`basic.ack\` when the message has been handled — written to disk for persistent messages, or routed to at least one queue.

If the broker cannot handle the message, it sends a \`basic.nack\`. Confirms can be batched (\`multiple=true\` acknowledges all messages up to and including the delivery tag). Three patterns: (1) publish and wait synchronously for each confirm — simple but slow; (2) batch confirms — publish N messages then wait for all; (3) asynchronous confirms with a callback — highest throughput. AMQP transactions (\`tx.select\`, \`tx.commit\`) are an alternative but 250x slower than confirms.`,

    `## Consumer Acknowledgments

When a consumer receives a message, it must acknowledge processing. **Manual ack** (\`basic.ack\`) tells the broker to remove the message from the queue. **Negative ack** (\`basic.nack\`) or **reject** (\`basic.reject\`) tells the broker the message was not processed — with \`requeue=true\`, the message goes back to the queue; with \`requeue=false\`, it is discarded or sent to the dead letter exchange.

Setting \`auto-ack=true\` (no-ack mode) causes the broker to consider messages delivered as soon as they are sent to the consumer — if the consumer crashes, those messages are lost. Manual ack with prefetch count provides at-least-once delivery: messages are redelivered if the consumer disconnects before acknowledging. The \`redelivered\` flag indicates a message is being delivered again.`,

    `## Message Persistence and Durability

For messages to survive broker restarts, three conditions must be met: (1) the exchange must be **durable**; (2) the queue must be **durable**; (3) the message must have **delivery-mode=2** (persistent). Missing any one of these means the message may be lost on restart.

Persistent messages are written to disk (the message store), but for performance, RabbitMQ may batch writes and fsync periodically rather than on every message. Publisher confirms with persistent messages wait until the message is fsynced to disk before sending the ack, providing the strongest durability guarantee. Quorum queues always persist messages and replicate them via Raft, providing the highest level of data safety.`,

    `## Dead Letter Exchanges

A **dead letter exchange (DLX)** receives messages that are: (1) rejected or nacked with \`requeue=false\`; (2) expired due to per-message TTL or queue-level TTL; (3) dropped because the queue exceeded its \`max-length\` or \`max-length-bytes\` limit.

DLX is configured on the queue via the \`x-dead-letter-exchange\` argument (and optionally \`x-dead-letter-routing-key\`). Common patterns include: retry queues with TTL (message sits in a DLX-bound queue with TTL, then dead-letters back to the original queue after a delay), poison message queues (messages that fail N times are routed to a parking lot queue for manual inspection), and delayed message delivery.`,

    `## Reliable Delivery Patterns

**At-most-once**: Use auto-ack and non-persistent messages. Fastest but messages can be lost on consumer crash or broker restart.

**At-least-once**: Use publisher confirms, persistent messages, durable queues, and manual consumer acks. Messages are never lost but may be delivered multiple times (e.g., consumer processes but crashes before acking — the message is redelivered). Consumers must be idempotent.

**Exactly-once** is not natively supported by RabbitMQ. It can be approximated by combining at-least-once delivery with consumer-side deduplication using unique message IDs stored in a database, leveraging transactional writes that atomically process the message and record its ID.`,
  ],
  interviewQA: [
    {
      q: "How do publisher confirms work and why are they preferred over AMQP transactions?",
      a: "Publisher confirms are an asynchronous mechanism where the broker sends basic.ack with a delivery tag after handling a message (persisting to disk or routing to a queue). They can be used synchronously (wait after each publish), in batches (publish N then wait), or asynchronously (callback-based). AMQP transactions (tx.select/tx.commit) provide similar guarantees but are about 250x slower because they require synchronous round-trips for each transactional batch and block the channel.",
    },
    {
      q: "What are the three conditions required for a message to survive a RabbitMQ broker restart?",
      a: "All three must be true: (1) the exchange must be durable, (2) the queue must be durable, and (3) the message must be published with delivery-mode=2 (persistent). If any one is missing, the message may be lost. Even with all three, there is a small window of data loss if the broker crashes between receiving a message and fsyncing to disk — publisher confirms with persistent messages close this gap by only confirming after fsync.",
    },
    {
      q: "How would you implement a retry mechanism using dead letter exchanges?",
      a: "Create a retry queue with x-dead-letter-exchange pointing back to the original exchange and a message-TTL (e.g., 30 seconds). When a consumer rejects a message (requeue=false), it goes to the DLX which routes to the retry queue. After the TTL expires, the message dead-letters back to the original exchange and queue. Track retry count in message headers — after N retries, route to a parking lot queue instead. This creates exponential backoff by using multiple retry queues with increasing TTLs.",
    },
    {
      q: "Why is exactly-once delivery difficult to achieve in RabbitMQ?",
      a: "RabbitMQ lacks built-in deduplication. With at-least-once delivery, a consumer may process a message and crash before acking — the broker redelivers it, causing duplicate processing. Exactly-once requires coordinating the message ack and the business operation atomically, which crosses system boundaries. The practical solution is at-least-once delivery with idempotent consumers — using unique message IDs and checking a deduplication store before processing.",
    },
  ],
  mcqs: [
    {
      q: "What does the broker send when it cannot handle a message in publisher confirm mode?",
      options: [
        "basic.return",
        "basic.nack",
        "basic.reject",
        "channel.close",
      ],
      answerIndex: 1,
      explanation:
        "In publisher confirm mode, the broker sends basic.nack when it cannot handle a message (e.g., internal error). basic.return is for unroutable mandatory messages, which is a separate mechanism.",
    },
    {
      q: "What happens to a message when a consumer sends basic.nack with requeue=false and a DLX is configured?",
      options: [
        "The message is silently discarded",
        "The message is returned to the producer",
        "The message is sent to the dead letter exchange",
        "The message is placed back at the head of the queue",
      ],
      answerIndex: 2,
      explanation:
        "With requeue=false and a DLX configured on the queue, rejected/nacked messages are routed to the dead letter exchange instead of being discarded.",
    },
    {
      q: "Which combination ensures messages survive a RabbitMQ broker restart?",
      options: [
        "Durable queue + any delivery mode",
        "Transient queue + persistent messages",
        "Durable queue + persistent messages (delivery-mode=2)",
        "Auto-delete queue + publisher confirms",
      ],
      answerIndex: 2,
      explanation:
        "Both the queue must be durable (metadata survives restart) and the message must be persistent (delivery-mode=2, written to disk). Missing either one means messages are lost on restart.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between basic.reject and basic.nack?",
      back: "basic.reject works on a single message. basic.nack (a RabbitMQ extension) supports the 'multiple' flag, allowing batch negative acknowledgment of all messages up to a delivery tag.",
    },
    {
      front: "What is auto-ack mode and its risk?",
      back: "Auto-ack (no-ack) mode considers messages delivered immediately when sent to the consumer. If the consumer crashes before processing, those messages are permanently lost. It provides at-most-once semantics.",
    },
    {
      front: "What triggers dead lettering?",
      back: "Three triggers: (1) message rejected/nacked with requeue=false; (2) message TTL expires; (3) queue exceeds max-length or max-length-bytes limit (overflow messages are dead-lettered).",
    },
    {
      front: "How fast are AMQP transactions compared to publisher confirms?",
      back: "AMQP transactions are roughly 250x slower than publisher confirms because they require synchronous round-trips and block the channel during the transaction.",
    },
    {
      front: "What does the redelivered flag indicate?",
      back: "The redelivered flag (boolean) on a delivered message indicates that the broker has attempted delivery before. It was previously delivered but not acknowledged, typically because the consumer disconnected or rejected it with requeue=true.",
    },
    {
      front: "How do quorum queues improve reliability over classic durable queues?",
      back: "Quorum queues replicate messages across multiple nodes using Raft consensus. A message is confirmed only after a majority of nodes have written it. Classic durable queues store on a single node — if that node's disk fails, data is lost.",
    },
    {
      front: "What is a poison message?",
      back: "A message that repeatedly causes consumer failures — each redelivery attempt fails, creating an infinite retry loop. Handle by tracking delivery count in headers and routing to a parking lot queue after N attempts via DLX.",
    },
  ],
  glossary: [
    {
      term: "Publisher Confirm",
      definition:
        "An asynchronous mechanism where the broker acknowledges (basic.ack/nack) that a published message has been accepted, persisted, or routed.",
    },
    {
      term: "Consumer Acknowledgment",
      definition:
        "A signal from consumer to broker (basic.ack, basic.nack, basic.reject) indicating whether a message was successfully processed, controlling when it is removed from the queue.",
    },
    {
      term: "Persistent Message",
      definition:
        "A message published with delivery-mode=2, written to disk by the broker. Combined with a durable queue, it survives broker restarts.",
    },
    {
      term: "Dead Letter Exchange (DLX)",
      definition:
        "An exchange that receives messages that were rejected, expired, or dropped due to queue overflow, enabling retry and poison message handling patterns.",
    },
    {
      term: "Delivery Tag",
      definition:
        "A channel-scoped sequential number assigned to each delivered message, used to identify which message is being acknowledged or rejected.",
    },
    {
      term: "Prefetch Count",
      definition:
        "The maximum number of unacknowledged messages the broker will deliver to a consumer, set via basic.qos to prevent consumer overload.",
    },
    {
      term: "At-Least-Once Delivery",
      definition:
        "A delivery guarantee ensuring messages are never lost but may be delivered multiple times. Achieved with publisher confirms, persistent messages, and manual consumer acks.",
    },
  ],
  deepDive: [
    `**Publisher confirms** are the cornerstone of reliable message publishing in RabbitMQ, and understanding their *internal mechanics* is essential for production systems. When a channel enters confirm mode via \`confirm.select\`, the broker assigns a **monotonically increasing delivery tag** (starting at 1) to each published message. After the broker has *handled* the message — meaning it has been either **routed to at least one queue** (for transient messages) or **fsynced to disk** (for persistent messages on durable queues) — it sends a \`basic.ack\` back to the publisher with that delivery tag. If the broker encounters an *internal error* and cannot handle the message, it sends a \`basic.nack\`. The \`multiple\` flag on acks is critical for throughput: when \`multiple=true\`, a single ack with tag N confirms *all messages up to and including N*. There are three implementation patterns: **synchronous** (call \`waitForConfirms()\` after each publish — simple but limits throughput to one round-trip per message), **batch** (publish N messages, then call \`waitForConfirms()\` — better throughput but if any message nacks, you must republish the entire batch), and **asynchronous** (register callbacks via \`channel.on('ack')\` and \`channel.on('nack')\` — highest throughput, as publishing never blocks). In amqplib, the \`createConfirmChannel()\` method returns a channel that automatically tracks delivery tags and provides a callback on each \`publish()\` call, making async confirms straightforward.`,

    `**Consumer acknowledgments** control the *lifecycle of a message in the queue* and directly determine the delivery guarantee semantics. When a message is delivered to a consumer, it enters an **unacknowledged** state — the broker holds it in memory, tracked by the channel-scoped \`deliveryTag\`. Three operations resolve this state: \`basic.ack\` (positive acknowledgment — the message is *permanently removed* from the queue), \`basic.nack\` (negative acknowledgment — with \`requeue=true\`, the message goes back to the queue *head* for redelivery; with \`requeue=false\`, it is either discarded or routed to the **dead letter exchange** if configured), and \`basic.reject\` (identical to nack but without the \`multiple\` flag — it operates on a single message only). The **prefetch count** (\`basic.qos\`) is inseparable from acknowledgment strategy: it limits the number of unacknowledged messages the broker will deliver to a consumer. Setting prefetch to \`1\` ensures *fair dispatch* among competing consumers (slow consumers get fewer messages) but reduces throughput due to the per-message round-trip. Setting it to \`10-50\` improves throughput by allowing the broker to pipeline deliveries. Setting it to \`0\` (unlimited) is **dangerous** in production — a slow consumer will accumulate unbounded unacked messages in memory, potentially triggering the broker's memory alarm. The \`redelivered\` flag on delivered messages indicates a message has been delivered before, which is essential for consumers implementing *idempotency checks*.`,

    `**Dead letter exchanges (DLX)** and **retry patterns** form the backbone of *fault-tolerant message processing*. A DLX is simply a regular exchange designated to receive messages that could not be processed normally. Three events trigger dead-lettering: a consumer **rejects or nacks** a message with \`requeue=false\`, a message's **TTL expires** (either per-message via the \`expiration\` property or per-queue via the \`x-message-ttl\` argument), or a queue **overflows** its \`x-max-length\` or \`x-max-length-bytes\` limit (the oldest messages are dead-lettered to make room). The most powerful pattern built on DLX is the **retry with exponential backoff** architecture. The setup uses multiple "wait" queues with increasing TTLs: \`retry.1s\` (1-second TTL), \`retry.5s\` (5-second TTL), \`retry.30s\` (30-second TTL). Each wait queue has its \`x-dead-letter-exchange\` pointing back to the *original exchange*. When a consumer fails to process a message, it reads the \`x-retry-count\` header, increments it, and publishes the message to the appropriate wait queue based on the count. After the TTL expires, the message dead-letters back to the original exchange for reprocessing. After a maximum number of retries (e.g., 5), the message is routed to a **parking lot queue** for manual inspection. This pattern requires consumers to be **idempotent** — since messages may be processed multiple times, each processing must produce the same result. Common idempotency strategies include storing processed \`messageId\` values in a database and using *conditional writes* (e.g., \`UPDATE ... WHERE status = 'pending'\`).`,
  ],
  code: [
    {
      language: "typescript",
      caption: "Publisher confirms with async callback pattern for maximum throughput",
      source: `const amqp = require('amqplib');

async function reliablePublisher() {
  const connection = await amqp.connect('amqp://localhost');

  // createConfirmChannel enables publisher confirms automatically
  const channel = await connection.createConfirmChannel();

  const exchange = 'orders.direct';
  await channel.assertExchange(exchange, 'direct', { durable: true });

  // Track outstanding confirms
  let confirmed = 0;
  let nacked = 0;

  const messages = Array.from({ length: 100 }, (_, i) => ({
    orderId: \`ORD-\${i + 1}\`,
    amount: Math.random() * 100,
  }));

  // Publish all messages with per-message callbacks
  const publishPromises = messages.map((msg, i) => {
    return new Promise<void>((resolve, reject) => {
      channel.publish(
        exchange,
        'order.new',
        Buffer.from(JSON.stringify(msg)),
        {
          persistent: true,       // delivery-mode = 2
          messageId: \`msg-\${i}\`,
          contentType: 'application/json',
          timestamp: Math.floor(Date.now() / 1000),
        },
        (err) => {
          if (err) {
            nacked++;
            console.error(\`NACK for message \${i}:\`, err.message);
            reject(err);
          } else {
            confirmed++;
            resolve();
          }
        }
      );
    });
  });

  await Promise.allSettled(publishPromises);
  console.log(\`Results: \${confirmed} confirmed, \${nacked} nacked\`);

  await channel.close();
  await connection.close();
}

reliablePublisher().catch(console.error);`,
    },
    {
      language: "typescript",
      caption: "Consumer with manual ack, nack, and DLX-based retry pattern",
      source: `const amqp = require('amqplib');

const MAX_RETRIES = 5;

async function resilientConsumer() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // Declare the DLX and parking lot queue
  const dlxExchange = 'dlx.orders';
  await channel.assertExchange(dlxExchange, 'direct', { durable: true });
  await channel.assertQueue('orders.parking-lot', { durable: true });
  await channel.bindQueue('orders.parking-lot', dlxExchange, 'parking-lot');

  // Declare retry queue with TTL — messages dead-letter back to main exchange
  await channel.assertQueue('orders.retry', {
    durable: true,
    arguments: {
      'x-message-ttl': 5000,                    // Wait 5 seconds
      'x-dead-letter-exchange': 'orders.direct', // Then retry
      'x-dead-letter-routing-key': 'order.new',
    },
  });
  await channel.bindQueue('orders.retry', dlxExchange, 'retry');

  // Main queue with DLX configured
  const mainQueue = 'orders.processing';
  await channel.assertExchange('orders.direct', 'direct', { durable: true });
  await channel.assertQueue(mainQueue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dlxExchange,
      'x-dead-letter-routing-key': 'retry',
    },
  });
  await channel.bindQueue(mainQueue, 'orders.direct', 'order.new');

  await channel.prefetch(10);

  channel.consume(mainQueue, async (msg) => {
    if (!msg) return;

    const retryCount = (msg.properties.headers['x-retry-count'] || 0);
    const order = JSON.parse(msg.content.toString());

    try {
      console.log(\`Processing order \${order.orderId} (attempt \${retryCount + 1})\`);

      // Simulate processing that might fail
      if (Math.random() < 0.3) throw new Error('Transient failure');

      channel.ack(msg);
      console.log(\`Order \${order.orderId} processed successfully\`);
    } catch (err) {
      if (retryCount >= MAX_RETRIES) {
        console.error(\`Order \${order.orderId} exceeded max retries — parking\`);
        // Send to parking lot directly
        channel.publish(dlxExchange, 'parking-lot',
          msg.content,
          { persistent: true, headers: { ...msg.properties.headers, 'x-final-error': err.message } }
        );
        channel.ack(msg); // Ack the original to remove from main queue
      } else {
        console.warn(\`Order \${order.orderId} failed (attempt \${retryCount + 1}), retrying...
\`);
        // Republish to retry queue with incremented count
        channel.publish(dlxExchange, 'retry',
          msg.content,
          { persistent: true, headers: { ...msg.properties.headers, 'x-retry-count': retryCount + 1 } }
        );
        channel.ack(msg);
      }
    }
  }, { noAck: false });

  console.log('Resilient consumer started with retry logic');
}

resilientConsumer().catch(console.error);`,
    },
    {
      language: "typescript",
      caption: "Persistent messages with durable queues — full reliability setup",
      source: `const amqp = require('amqplib');

async function fullReliabilitySetup() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createConfirmChannel();

  // 1. Durable exchange (survives restart)
  await channel.assertExchange('payments.topic', 'topic', { durable: true });

  // 2. Durable queue (survives restart)
  await channel.assertQueue('payments.process', {
    durable: true,
    arguments: {
      'x-queue-type': 'quorum',             // Raft replication for HA
      'x-quorum-initial-group-size': 3,      // 3-node replication
      'x-dead-letter-exchange': 'dlx.payments',
      'x-delivery-limit': 5,                 // Auto dead-letter after 5 attempts
    },
  });

  await channel.bindQueue('payments.process', 'payments.topic', 'payment.*');

  // 3. Publish persistent message with confirm
  const payment = {
    paymentId: 'PAY-001',
    amount: 150.00,
    currency: 'USD',
    idempotencyKey: 'idem-abc-123',  // For consumer-side deduplication
  };

  await new Promise<void>((resolve, reject) => {
    channel.publish(
      'payments.topic',
      'payment.received',
      Buffer.from(JSON.stringify(payment)),
      {
        persistent: true,          // delivery-mode = 2 (written to disk)
        mandatory: true,           // Return if unroutable
        contentType: 'application/json',
        messageId: payment.idempotencyKey,
        timestamp: Math.floor(Date.now() / 1000),
      },
      (err) => err ? reject(err) : resolve()
    );
  });

  // Handle mandatory returns (unroutable messages)
  channel.on('return', (msg) => {
    console.error('Message returned (unroutable):', msg.fields.routingKey);
  });

  console.log('Payment published with full reliability guarantees');
  await channel.close();
  await connection.close();
}

fullReliabilitySetup().catch(console.error);`,
    },
  ],
  diagrams: [
    {
      title: "Publisher Confirm Flow",
      kind: "sequence",
      caption: "Publisher confirms ensure the broker has persisted the message. The broker acks after fsync. A nack triggers a retry loop.",
      mermaid: `sequenceDiagram
    participant P as Publisher
    participant CH as Channel
    participant EX as Exchange
    participant Q as Durable Queue
    participant Disk as Disk
    P->>CH: confirm.select
    CH-->>P: confirm.select-ok
    P->>CH: basic.publish (persistent, tag=1)
    CH->>EX: route message
    EX->>Q: enqueue
    Q->>Disk: fsync
    Disk-->>Q: ok
    Q-->>CH: basic.ack (tag=1)
    CH-->>P: basic.ack
    Note over P: Safe to forget message`,
    },
    {
      title: "Dead Letter Exchange Routing",
      kind: "architecture",
      caption: "Messages that are rejected, expire, or exceed max-length are routed to a Dead Letter Exchange, allowing inspection and reprocessing.",
      mermaid: `graph LR
    P[Producer] --> EX[Main Exchange]
    EX --> Q[(Work Queue
x-dead-letter-exchange=dlx)]
    Q -->|nack / ttl / overflow| DLX[Dead Letter Exchange]
    DLX --> DLQ[(Dead Letter Queue)]
    DLQ --> INSPECT[Ops / Retry Service]
    INSPECT -->|requeue| EX`,
    },
    {
      title: "Consumer Acknowledgement State Machine",
      kind: "state",
      caption: "A delivered message stays unacked until the consumer sends ack or nack. Unacked messages are redelivered on channel close or timeout.",
      mermaid: `stateDiagram-v2
    [*] --> Ready : Message enqueued
    Ready --> Unacked : basic.deliver to consumer
    Unacked --> Removed : basic.ack
    Unacked --> Requeued : basic.nack requeue=true
    Unacked --> DeadLettered : basic.nack requeue=false
    Unacked --> Requeued : Channel closed / connection drop
    Requeued --> Ready
    Removed --> [*]
    DeadLettered --> [*]`,
    },
    {
      title: "High Availability Queue Mirroring",
      kind: "architecture",
      caption: "Classic mirrored queues replicate a master queue to mirror nodes. Quorum queues use Raft consensus for stronger durability guarantees.",
      mermaid: `graph TD
    subgraph Cluster
      N1[Node 1 - Master]
      N2[Node 2 - Mirror]
      N3[Node 3 - Mirror]
      N1 -->|sync| N2
      N1 -->|sync| N3
    end
    P[Producer] --> N1
    C1[Consumer] --> N1
    N1 -->|promote on failure| N2`,
    },
  ],
  comparison: {
    columns: ["Aspect", "At-Most-Once", "At-Least-Once", "Exactly-Once (Approx)"],
    rows: [
      ["**Message loss**", "*Possible* — auto-ack, no persistence", "*Never* — confirms + persistence + manual ack", "*Never* — same as at-least-once"],
      ["**Duplicates**", "*None* — each message delivered at most once", "*Possible* — redelivery on consumer crash", "*None* — consumer-side deduplication"],
      ["**Publisher setup**", "No confirms, `persistent: false`", "`createConfirmChannel()`, `persistent: true`", "`createConfirmChannel()`, `persistent: true`"],
      ["**Consumer setup**", "`noAck: true`", "`noAck: false`, manual `channel.ack(msg)`", "Manual ack + **idempotency store** (`messageId` tracking)"],
      ["**Queue type**", "Transient or classic", "**Durable** classic or *quorum*", "**Quorum** queue recommended"],
      ["**Performance**", "*Fastest* — no overhead", "Moderate — disk writes + ack round-trips", "*Slowest* — DB lookup per message"],
      ["**Use cases**", "Logs, metrics, non-critical notifications", "**Most production workloads** — payments, orders", "Financial transactions, exactly-once business operations"],
    ],
  },
  exercises: [
    "**Implement publisher confirms** with all three patterns: (1) *synchronous* — publish one message and call `waitForConfirms()`, (2) *batch* — publish 50 messages then `waitForConfirms()`, (3) *async* — use `createConfirmChannel()` with per-message callbacks. Measure the **throughput** (messages/second) of each pattern.",
    "**Build a DLX retry system** with exponential backoff: create three retry queues with TTLs of `1s`, `5s`, and `30s`. Track the `x-retry-count` header. After 5 retries, route to a **parking lot queue**. Simulate consumer failures and verify that messages cycle through the retry queues correctly.",
    "**Demonstrate message persistence**: publish 100 messages — 50 with `persistent: true` and 50 with `persistent: false` — to a *durable* queue. Restart the RabbitMQ broker and verify which messages survive. Repeat with a *transient* queue to confirm **both** queue durability and message persistence are required.",
    "**Implement idempotent consumers**: create a consumer that tracks processed `messageId` values in a `Map` (simulating a database). Publish 10 messages, then manually requeue 5 of them. Verify the consumer detects and *skips* the duplicates while processing new messages normally.",
    "**Compare auto-ack vs manual-ack**: write two consumers for the same queue — one with `noAck: true` and one with `noAck: false`. Publish 100 messages, then kill each consumer mid-processing. Count how many messages are *lost* vs *redelivered* in each mode.",
  ],
  cheatSheet: [
    "**Publisher confirms**: `createConfirmChannel()` in amqplib. Broker sends `basic.ack` after handling (disk write or queue delivery). **250x faster** than AMQP transactions.",
    "**Consumer ack**: `channel.ack(msg)` removes message. `channel.nack(msg, false, false)` sends to DLX. `channel.nack(msg, false, true)` requeues to queue head.",
    "**Persistence trifecta**: *durable exchange* + *durable queue* + `persistent: true` (delivery-mode=2). Missing **any one** = message loss on broker restart.",
    "**Dead lettering triggers**: (1) `nack`/`reject` with `requeue=false`, (2) **TTL expiry** (per-message or per-queue), (3) queue **overflow** (`x-max-length` or `x-max-length-bytes`).",
    "**Retry pattern**: retry queue with `x-message-ttl` + `x-dead-letter-exchange` pointing back to main exchange. Track `x-retry-count` in headers. Route to *parking lot* after max retries.",
    "**Exactly-once approximation**: at-least-once delivery + **idempotent consumer** using `messageId` deduplication. Store processed IDs in a database with an atomic *process + record* transaction.",
  ],
  revisionNotes: [
    "**Publisher confirms** are the recommended way to ensure messages reach the broker. The broker acks after the message is *persisted* (for persistent messages) or *routed* (for transient messages). Async confirms via `createConfirmChannel()` provide the best throughput. AMQP transactions (`tx.select/tx.commit`) are **250x slower**.",
    "**Consumer acks** determine when a message is removed from the queue. `noAck: true` = at-most-once (message lost if consumer crashes). `noAck: false` + manual `ack` = at-least-once (message redelivered if consumer crashes before acking). The `redelivered` flag identifies retried messages.",
    "**Message persistence** requires THREE things: *durable exchange*, *durable queue*, and `delivery-mode=2`. Even then, there is a small window between broker receiving the message and fsyncing to disk — **publisher confirms close this gap** by acking only after fsync.",
    "**Dead letter exchanges** handle three failure scenarios: consumer rejection (`requeue=false`), TTL expiry, and queue overflow. The DLX-based retry pattern with TTL queues provides **automatic retry with backoff**. Always set a maximum retry count to avoid infinite loops — route exhausted messages to a *parking lot queue*.",
    "**Exactly-once delivery** is not natively supported by RabbitMQ. Approximate it by combining *at-least-once delivery* with **idempotent consumers** — track processed `messageId` values in a persistent store and skip duplicates. Use **quorum queues** with `x-delivery-limit` for automatic poison message handling.",
  ],
};
