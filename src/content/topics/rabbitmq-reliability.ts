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
};
