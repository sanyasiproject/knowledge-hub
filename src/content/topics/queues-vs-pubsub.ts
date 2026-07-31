import type { TopicContent } from "../types";

export const queuesVsPubsub: TopicContent = {
  quickSummary: [
    "Queues implement point-to-point messaging: each message is consumed by exactly one consumer (competing consumers pattern).",
    "Pub/Sub implements broadcast messaging: each message is delivered to all active subscribers of a topic.",
    "Queues guarantee at-least-once or exactly-once delivery to a single consumer; Pub/Sub fans out to N subscribers independently.",
    "RabbitMQ uses exchanges and queues with flexible routing; Kafka uses partitioned append-only logs with consumer groups.",
    "AWS SQS provides managed queues; AWS SNS provides managed pub/sub; combining SNS+SQS is the canonical fan-out pattern.",
    "Choosing between them depends on whether downstream consumers need independent copies (pub/sub) or load-balanced processing (queue).",
  ],

  detailed: [
    "## Point-to-Point (Queue) Semantics",
    "In a queue, producers enqueue messages and consumers dequeue them. Once a consumer acknowledges a message, it is removed from the queue. If multiple consumers listen on the same queue, they compete for messages — this is the competing consumers pattern, which provides horizontal scalability for processing.",
    "Key properties: messages are persistent until consumed, ordering is typically FIFO (though not always guaranteed under concurrency), and backpressure is naturally handled by queue depth. Dead-letter queues (DLQs) capture messages that fail processing after a configured retry count.",

    "## Publish/Subscribe (Topic) Semantics",
    "In pub/sub, publishers emit messages to a topic (or exchange), and the broker delivers a copy to every active subscription. Each subscriber gets its own independent copy. If a subscriber is offline and has no durable subscription, messages published during that time are lost.",
    "Key properties: decouples publishers from subscribers (neither knows the other exists), enables fan-out to multiple downstream systems, and supports filtering via topic hierarchies or message attributes.",

    "## RabbitMQ Model",
    "RabbitMQ uses AMQP concepts: producers publish to exchanges (not directly to queues). Exchanges route messages to bound queues based on exchange type: direct (routing key match), fanout (broadcast to all bound queues), topic (wildcard routing key patterns), and headers (attribute-based). A fanout exchange with multiple bound queues implements pub/sub. A single queue with multiple consumers implements competing consumers. This gives RabbitMQ flexibility to implement both patterns within one broker.",

    "## Apache Kafka Model",
    "Kafka uses a log-based model. Topics are divided into partitions; each partition is an ordered, immutable append-only log. Consumer groups enable competing consumers: each partition is assigned to exactly one consumer within a group, so messages are load-balanced across group members. Multiple consumer groups reading the same topic implement pub/sub — each group gets all messages independently. Kafka retains messages for a configurable period regardless of consumption, enabling replay.",

    "## AWS SQS vs SNS",
    "SQS is a fully managed queue service supporting standard (best-effort ordering, at-least-once) and FIFO (exactly-once, strict ordering) queue types. SNS is a fully managed pub/sub service supporting topic subscriptions via HTTP, email, SMS, SQS, Lambda, and more. The SNS+SQS fan-out pattern publishes to an SNS topic that delivers to multiple SQS queues, giving each downstream service its own independent, durable queue.",

    "## Google Cloud Pub/Sub",
    "GCP Pub/Sub combines elements of both: messages published to a topic are delivered to subscriptions. Each subscription acts as an independent queue — multiple subscribers on the same subscription compete for messages, while separate subscriptions each get a full copy. This hybrid model avoids needing a separate queue service.",

    "## Ordering and Partitioning",
    "Strict global ordering is expensive and limits throughput. Most systems offer partition-level ordering: messages with the same partition key are ordered, but messages across partitions are not. Kafka partitions, SQS FIFO message group IDs, and RabbitMQ consistent-hash exchanges all use this approach. Design consumers to be idempotent when at-least-once delivery is used.",

    "## Delivery Guarantees",
    "At-most-once: fire and forget, no retries. At-least-once: retry on failure, consumer must handle duplicates. Exactly-once: requires broker and consumer coordination (e.g., Kafka transactions + idempotent producers, SQS FIFO deduplication). True exactly-once across distributed systems is achieved via idempotent consumers with deduplication rather than relying solely on broker guarantees.",

    "## Backpressure and Flow Control",
    "Queues naturally buffer messages, absorbing producer/consumer rate mismatches. Pub/sub without durable subscriptions drops messages to slow consumers. Systems like Kafka handle this well because consumers pull at their own pace from the log. RabbitMQ supports consumer prefetch (QoS) to limit unacknowledged messages per consumer. SQS uses visibility timeouts to manage in-flight messages.",
  ],

  deepDive: [
    "## Consumer Group Rebalancing in Kafka",
    "When a consumer joins or leaves a Kafka consumer group, partitions are rebalanced across remaining members. During rebalancing, no messages are consumed — this causes a brief pause. Cooperative sticky rebalancing (KIP-429) minimizes disruption by only reassigning partitions that need to move. Applications should handle onPartitionsRevoked and onPartitionsAssigned callbacks to commit offsets and clean up state.",

    "## RabbitMQ Quorum Queues vs Classic Queues",
    "Classic mirrored queues in RabbitMQ had well-known issues with split-brain and synchronization. Quorum queues (introduced in 3.8) use the Raft consensus algorithm for replication, providing stronger consistency and automatic leader election. They do not support certain features like message TTL per-message or queue length limits via overflow drop-head. For new deployments, quorum queues are recommended for durable, replicated workloads.",

    "## Exactly-Once Semantics in Kafka",
    "Kafka achieves exactly-once via three mechanisms: idempotent producers (each produce is assigned a sequence number, broker deduplicates), transactions (atomic writes across multiple partitions), and transactional consumers (read_committed isolation). The pattern for stream processing is: read from input topic, process, write to output topic and commit input offsets atomically within a single transaction.",

    "## Dead-Letter Handling Patterns",
    "When a message fails processing after max retries, it should be routed to a dead-letter queue (DLQ). In SQS, configure a redrive policy with maxReceiveCount. In RabbitMQ, use x-dead-letter-exchange and x-dead-letter-routing-key arguments. In Kafka, there is no native DLQ — implement it in application code by producing failed messages to a dedicated DLQ topic. Monitor DLQ depth as a key operational metric.",

    "## Fan-Out at Scale: SNS + SQS Pattern",
    "For systems needing to distribute events to many independent consumers, SNS topics fan out to per-service SQS queues. Each queue can have its own visibility timeout, retry policy, and DLQ. This decouples services completely: adding a new consumer means creating a new SQS queue and subscribing it to the SNS topic — zero changes to the publisher or existing consumers. SNS message filtering reduces costs by delivering only relevant messages to each subscription.",

    "## Message Ordering vs Throughput Tradeoff",
    "Global ordering requires a single partition/queue, limiting throughput to one consumer. Partition-level ordering (Kafka partition keys, SQS FIFO message group IDs) allows parallelism while maintaining order within a logical group. Design partition keys carefully: too few keys create hot partitions, too many lose ordering benefits. A common pattern is using entity ID (e.g., order ID, user ID) as the partition key so all events for one entity are ordered.",
  ],

  code: [
    {
      language: "cpp",
      caption: "RabbitMQ: Competing consumers with manual acknowledgment using AMQP-CPP",
      source: `#include <iostream>
#include <string>
#include <thread>
#include <chrono>
#include <amqpcpp.h>
#include <amqpcpp/linux_tcp.h>

// Producer: publish tasks to a durable queue
void publishTask(AMQP::Channel& channel, const std::string& taskJson) {
    // Declare a durable queue
    channel.declareQueue("task_queue", AMQP::durable);

    AMQP::Envelope envelope(taskJson.data(), taskJson.size());
    envelope.setDeliveryMode(2);  // Persistent
    envelope.setContentType("application/json");

    channel.publish("", "task_queue", envelope);
}

// Consumer: competing consumer with prefetch=1
void consumeTasks(AMQP::Channel& channel) {
    channel.declareQueue("task_queue", AMQP::durable);
    channel.setQos(1);  // Fair dispatch: prefetch=1

    channel.consume("task_queue")
        .onReceived([&channel](const AMQP::Message& message,
                               uint64_t deliveryTag, bool redelivered) {
            std::string body(message.body(), message.bodySize());
            try {
                processTask(body);
                channel.ack(deliveryTag);
            } catch (const std::exception& e) {
                // requeue=false sends to DLQ if configured
                channel.reject(deliveryTag, false);
            }
        });
}

void processTask(const std::string& taskJson) {
    std::cout << "Processing: " << taskJson << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));
}

// Usage with a TCP connection handler (pseudo-code for setup)
// int main() {
//     auto handler = std::make_shared<AMQP::LibEvHandler>(loop);
//     AMQP::TcpConnection conn(handler.get(),
//         AMQP::Address("amqp://localhost/"));
//     AMQP::TcpChannel channel(&conn);
//     publishTask(channel, R"({"type":"email","to":"user@example.com"})");
//     consumeTasks(channel);
//     return 0;
// }`,
    },
    {
      language: "cpp",
      caption: "RabbitMQ: Pub/Sub fan-out using fanout exchange with AMQP-CPP",
      source: `#include <iostream>
#include <string>
#include <functional>
#include <amqpcpp.h>
#include <amqpcpp/linux_tcp.h>

// Publisher: emit event to fanout exchange
void publishEvent(AMQP::Channel& channel, const std::string& eventJson) {
    channel.declareExchange("order_events", AMQP::fanout);

    AMQP::Envelope envelope(eventJson.data(), eventJson.size());
    envelope.setContentType("application/json");

    // Routing key is ignored for fanout exchanges
    channel.publish("order_events", "", envelope);
}

// Subscriber: each service binds its own queue
void subscribe(AMQP::Channel& channel, const std::string& serviceName,
               std::function<void(const std::string&)> handler) {
    channel.declareExchange("order_events", AMQP::fanout);

    // Durable named queue so messages persist if service restarts
    std::string queueName = "order_events_" + serviceName;
    channel.declareQueue(queueName, AMQP::durable);
    channel.bindQueue("order_events", queueName, "");

    channel.consume(queueName)
        .onReceived([&channel, handler](const AMQP::Message& message,
                                        uint64_t deliveryTag, bool) {
            std::string body(message.body(), message.bodySize());
            handler(body);
            channel.ack(deliveryTag);
        });
}

// Each service gets its own copy of every event
// subscribe(channel, "billing", handleBilling);
// subscribe(channel, "inventory", handleInventory);
// subscribe(channel, "notifications", handleNotifications);`,
    },
    {
      language: "java",
      caption: "Kafka: Producer with idempotent writes and consumer group",
      source: `// Producer with idempotent configuration
Properties producerProps = new Properties();
producerProps.put("bootstrap.servers", "localhost:9092");
producerProps.put("key.serializer",
    "org.apache.kafka.common.serialization.StringSerializer");
producerProps.put("value.serializer",
    "org.apache.kafka.common.serialization.StringSerializer");
producerProps.put("enable.idempotence", "true");  // Exactly-once producer
producerProps.put("acks", "all");
producerProps.put("retries", Integer.MAX_VALUE);

KafkaProducer<String, String> producer =
    new KafkaProducer<>(producerProps);

// Partition by orderId to guarantee per-order ordering
ProducerRecord<String, String> record = new ProducerRecord<>(
    "order-events",    // topic
    order.getId(),     // key (partition key)
    toJson(order)      // value
);
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        log.error("Send failed", exception);
    } else {
        log.info("Sent to partition {} offset {}",
            metadata.partition(), metadata.offset());
    }
});

// Consumer group: competing consumers across partitions
Properties consumerProps = new Properties();
consumerProps.put("bootstrap.servers", "localhost:9092");
consumerProps.put("group.id", "order-processing-service");
consumerProps.put("key.deserializer",
    "org.apache.kafka.common.serialization.StringDeserializer");
consumerProps.put("value.deserializer",
    "org.apache.kafka.common.serialization.StringDeserializer");
consumerProps.put("enable.auto.commit", "false");
consumerProps.put("auto.offset.reset", "earliest");

KafkaConsumer<String, String> consumer =
    new KafkaConsumer<>(consumerProps);
consumer.subscribe(List.of("order-events"));

while (true) {
    ConsumerRecords<String, String> records =
        consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> rec : records) {
        processOrder(fromJson(rec.value()));
    }
    consumer.commitSync();  // Manual commit after processing
}`,
    },
    {
      language: "typescript",
      caption: "AWS SNS+SQS fan-out pattern using AWS SDK v3",
      source: `import {
  SNSClient, CreateTopicCommand, SubscribeCommand,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  SQSClient, CreateQueueCommand, ReceiveMessageCommand,
  DeleteMessageCommand, GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";

const sns = new SNSClient({ region: "us-east-1" });
const sqs = new SQSClient({ region: "us-east-1" });

// 1. Create SNS topic for order events
async function setupFanOut() {
  const topic = await sns.send(
    new CreateTopicCommand({ Name: "order-events" })
  );
  const topicArn = topic.TopicArn!;

  // 2. Create per-service SQS queues
  const services = ["billing", "inventory", "notifications"];
  for (const svc of services) {
    const queue = await sqs.send(
      new CreateQueueCommand({
        QueueName: \`order-events-\${svc}\`,
        Attributes: {
          VisibilityTimeout: "30",
          MessageRetentionPeriod: "1209600", // 14 days
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: \`arn:aws:sqs:us-east-1:123456789:order-events-\${svc}-dlq\`,
            maxReceiveCount: "3",
          }),
        },
      })
    );
    const queueUrl = queue.QueueUrl!;
    const attrs = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["QueueArn"],
      })
    );

    // 3. Subscribe each queue to the SNS topic
    await sns.send(new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "sqs",
      Endpoint: attrs.Attributes!.QueueArn,
      Attributes: {
        // Filter: only deliver relevant events
        FilterPolicy: JSON.stringify({
          eventType: [svc === "billing"
            ? "order.paid" : "order.created"],
        }),
      },
    }));
  }
  return topicArn;
}

// 4. Publish an event (all subscribers receive it)
async function publishOrderEvent(
  topicArn: string, event: Record<string, unknown>
) {
  await sns.send(new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(event),
    MessageAttributes: {
      eventType: {
        DataType: "String",
        StringValue: event.type as string,
      },
    },
  }));
}

// 5. Consumer: poll from service-specific SQS queue
async function consumeQueue(queueUrl: string) {
  while (true) {
    const resp = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20, // Long polling
    }));
    for (const msg of resp.Messages ?? []) {
      const body = JSON.parse(msg.Body!);
      const event = JSON.parse(body.Message); // SNS wraps it
      await processEvent(event);
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: msg.ReceiptHandle!,
      }));
    }
  }
}`,
    },
  ],

  diagrams: [
    {
      title: "Queue: Competing Consumers Pattern",
      kind: "architecture",
      caption:
        "Multiple consumers compete for messages from a single queue. Each message is processed by exactly one consumer, enabling horizontal scaling of processing throughput.",
    },
    {
      title: "Pub/Sub: Fan-Out Pattern",
      kind: "architecture",
      caption:
        "A publisher emits to a topic/exchange. The broker delivers independent copies to each subscriber's queue or endpoint. Adding subscribers requires no publisher changes.",
    },
    {
      title: "SNS + SQS Fan-Out Architecture",
      kind: "architecture",
      caption:
        "SNS topic fans out to per-service SQS queues. Each service has its own queue with independent retry, DLQ, and scaling policies. SNS filter policies reduce unnecessary deliveries.",
    },
    {
      title: "Kafka Consumer Groups: Queue + Pub/Sub Hybrid",
      kind: "flow",
      caption:
        "Within a consumer group, partitions are distributed across members (queue semantics). Multiple consumer groups on the same topic each get all messages (pub/sub semantics).",
    },
  ],

  animations: [
    {
      title: "Message Flow: Queue vs Pub/Sub",
      steps: [
        { label: "Producer sends message", detail: "Message enters the broker and is routed based on destination type." },
        { label: "Queue: single delivery", detail: "Broker assigns the message to one consumer. Other consumers on the same queue do not see it." },
        { label: "Pub/Sub: fan-out delivery", detail: "Broker copies the message to every active subscription. Each subscriber processes independently." },
        { label: "Acknowledgment", detail: "Queue: message removed after consumer ACK. Pub/Sub: each subscription tracks its own ACK state independently." },
        { label: "Failure handling", detail: "Queue: message requeued or sent to DLQ after max retries. Pub/Sub: per-subscription retry policies apply." },
      ],
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Queue (Point-to-Point)",
      "Pub/Sub (Broadcast)",
      "Kafka (Hybrid)",
    ],
    rows: [
      [
        "Delivery",
        "Each message to exactly one consumer",
        "Each message to all subscribers",
        "Per consumer group: one consumer; across groups: all",
      ],
      [
        "Consumer scaling",
        "Add consumers to share load",
        "Each subscriber is independent",
        "Add consumers within group (max = partition count)",
      ],
      [
        "Message retention",
        "Removed after ACK",
        "Removed after delivery (unless durable sub)",
        "Retained for configured period regardless of consumption",
      ],
      [
        "Ordering",
        "FIFO within queue",
        "No cross-subscriber ordering",
        "FIFO within partition",
      ],
      [
        "Replay",
        "Not possible (consumed = deleted)",
        "Not possible without log retention",
        "Full replay by resetting consumer offset",
      ],
      [
        "Backpressure",
        "Queue depth grows; consumer pulls at own pace",
        "Slow subscribers may lose messages or block",
        "Consumer pulls at own pace; lag is visible metric",
      ],
      [
        "Use case",
        "Task distribution, job queues, work pipelines",
        "Event notifications, broadcasting, webhooks",
        "Event streaming, event sourcing, log aggregation",
      ],
      [
        "Examples",
        "SQS, RabbitMQ queue, ActiveMQ",
        "SNS, RabbitMQ fanout exchange, Redis Pub/Sub",
        "Kafka, Redpanda, Pulsar, Kinesis",
      ],
    ],
  },

  interviewQA: [
    {
      q: "When would you choose a queue over pub/sub?",
      a: "Use a queue when each message should be processed exactly once by one of N workers — task distribution, background jobs, rate-limited API calls. The competing consumers pattern provides load balancing and ensures no duplicate processing. Use pub/sub when multiple independent systems need to react to the same event.",
      followUps: [
        "How would you handle the case where you need both behaviors for the same event?",
        "What happens if a queue consumer crashes mid-processing?",
      ],
    },
    {
      q: "How does Kafka provide both queue and pub/sub semantics?",
      a: "Kafka consumer groups implement queue semantics: each partition is assigned to one consumer in the group, so messages are load-balanced. Multiple consumer groups reading the same topic implement pub/sub: each group independently reads all messages. This dual model is why Kafka is often described as a distributed commit log rather than a traditional message broker.",
      followUps: [
        "What limits the max parallelism within a consumer group?",
        "How do you handle rebalancing when a consumer dies?",
      ],
    },
    {
      q: "Explain the SNS+SQS fan-out pattern and why it is preferred over direct SNS-to-Lambda.",
      a: "SNS+SQS decouples each consumer with its own queue, providing independent retry policies, DLQs, visibility timeouts, and backpressure handling. Direct SNS-to-Lambda has no built-in buffering — if Lambda throttles, messages can be lost. With SQS in between, messages are durably stored and retried. Each service scales independently and can be deployed or updated without affecting others.",
      followUps: [
        "How do SNS filter policies reduce cost?",
        "What is the max fan-out limit for SNS subscriptions?",
      ],
    },
    {
      q: "What is the difference between at-least-once and exactly-once delivery, and how do you achieve exactly-once in practice?",
      a: "At-least-once means the broker retries delivery on failure, so consumers may see duplicates. Exactly-once means each message is processed once and only once. True exactly-once requires coordination between broker and consumer — Kafka achieves it with idempotent producers + transactions. In practice, most systems use at-least-once delivery with idempotent consumers: assign each message a unique ID, check if already processed before applying side effects, and store the result and deduplication marker atomically.",
    },
    {
      q: "How do you handle message ordering in a distributed queue with multiple consumers?",
      a: "Global ordering requires a single partition/consumer, which limits throughput. The standard approach is partition-level ordering: use a partition key (e.g., entity ID) so all messages for the same entity go to the same partition and are processed in order by one consumer. Different entities can be processed in parallel across partitions. This is the model used by Kafka partitions, SQS FIFO message group IDs, and Kinesis shard keys.",
    },
  ],

  mcqs: [
    {
      q: "In Kafka, what determines the maximum number of active consumers within a single consumer group?",
      options: [
        "The number of brokers in the cluster",
        "The number of partitions in the topic",
        "The replication factor of the topic",
        "The consumer group coordinator's capacity",
      ],
      answerIndex: 1,
      explanation:
        "Each partition is assigned to exactly one consumer within a group. If there are more consumers than partitions, the extra consumers sit idle. Max parallelism = number of partitions.",
    },
    {
      q: "Which RabbitMQ exchange type implements the pub/sub fan-out pattern?",
      options: ["direct", "topic", "fanout", "headers"],
      answerIndex: 2,
      explanation:
        "A fanout exchange broadcasts every message to all bound queues, regardless of routing key. This is the direct implementation of pub/sub in RabbitMQ.",
    },
    {
      q: "In the SNS+SQS fan-out pattern, what happens if an SQS consumer repeatedly fails to process a message?",
      options: [
        "SNS retries delivery to the SQS queue",
        "The message is deleted after the first failure",
        "The message is moved to a dead-letter queue after maxReceiveCount attempts",
        "SNS sends the message to a different SQS queue",
      ],
      answerIndex: 2,
      explanation:
        "SQS redrive policies route messages to a configured DLQ after the message has been received maxReceiveCount times without successful deletion.",
    },
    {
      q: "What is the key advantage of Kafka's log-based retention over traditional queue deletion-on-ACK?",
      options: [
        "Lower storage costs",
        "Faster message delivery",
        "Ability to replay messages by resetting consumer offsets",
        "Simpler consumer implementation",
      ],
      answerIndex: 2,
      explanation:
        "Kafka retains messages for a configurable period regardless of consumption. Consumers can reset their offset to reprocess historical messages — essential for reprocessing after bug fixes, backfilling new services, or auditing.",
    },
  ],

  flashcards: [
    { front: "Competing consumers pattern", back: "Multiple consumers read from the same queue; each message is delivered to exactly one consumer. Provides load balancing and horizontal scalability for message processing." },
    { front: "Fan-out pattern", back: "A single message published to a topic is delivered to all subscribers. Each subscriber gets an independent copy. Enables decoupled, event-driven architectures." },
    { front: "Consumer group (Kafka)", back: "A set of consumers sharing a group ID. Partitions are distributed among members so each message goes to one consumer. Acts as a logical queue. Multiple groups = pub/sub." },
    { front: "Dead-letter queue (DLQ)", back: "A separate queue that receives messages which could not be processed after a maximum number of attempts. Used for debugging, alerting, and manual remediation." },
    { front: "Visibility timeout (SQS)", back: "The period during which a received message is hidden from other consumers. If not deleted within this window, the message becomes visible again for reprocessing." },
    { front: "Idempotent consumer", back: "A consumer that produces the same result whether it processes a message once or multiple times. Essential for at-least-once delivery systems to achieve effectively-once semantics." },
    { front: "Message group ID (SQS FIFO)", back: "A tag that defines a logical partition within an SQS FIFO queue. Messages with the same group ID are delivered in order; different group IDs allow parallel processing." },
    { front: "Exchange (RabbitMQ)", back: "The routing component that receives messages from producers and routes them to queues based on bindings and routing keys. Types: direct, fanout, topic, headers." },
  ],

  revisionNotes: [
    "Queue = point-to-point, one consumer per message. Pub/Sub = broadcast, all subscribers get a copy.",
    "RabbitMQ: exchange routes to queues. Fanout exchange = pub/sub. Queue with multiple consumers = competing consumers.",
    "Kafka: consumer group = queue semantics (partitions split across members). Multiple groups on same topic = pub/sub.",
    "Max Kafka consumer group parallelism = number of partitions. Plan partition count at topic creation.",
    "SQS Standard: at-least-once, best-effort ordering. SQS FIFO: exactly-once, strict ordering within message group ID.",
    "SNS+SQS fan-out: SNS topic -> N SQS queues. Each service gets durable, independent queue with its own DLQ.",
    "SNS filter policies: JSON attribute matching to deliver only relevant messages per subscription. Reduces cost and noise.",
    "Dead-letter queues: configure maxReceiveCount (SQS), x-dead-letter-exchange (RabbitMQ), or implement in app code (Kafka).",
    "Exactly-once in practice: idempotent consumers + deduplication. Store processing result and dedup key atomically.",
    "Ordering vs throughput: global order requires single partition. Use entity-based partition keys for per-entity ordering with parallelism.",
  ],

  cheatSheet: [
    "Queue: one message -> one consumer. Use for task distribution, job processing.",
    "Pub/Sub: one message -> all subscribers. Use for event broadcasting, notifications.",
    "RabbitMQ fanout exchange = pub/sub | direct/topic exchange + single queue = point-to-point",
    "Kafka consumer group = competing consumers | multiple groups = pub/sub",
    "SQS = managed queue | SNS = managed pub/sub | SNS+SQS = managed fan-out",
    "Kafka partition count = max consumers per group. Cannot decrease after creation.",
    "SQS visibility timeout: set to 6x your processing time as a rule of thumb.",
    "Idempotency key pattern: hash(message_id) -> check before processing -> upsert result atomically.",
    "DLQ monitoring: alert on DLQ depth > 0. Every message in a DLQ represents a processing failure.",
    "Long polling (SQS WaitTimeSeconds=20) reduces empty responses and API costs by 10x+.",
  ],

  glossary: [
    { term: "Point-to-Point", definition: "Messaging pattern where each message is consumed by exactly one receiver from a queue." },
    { term: "Pub/Sub", definition: "Messaging pattern where messages are broadcast to all subscribers of a topic." },
    { term: "Competing Consumers", definition: "Multiple consumers on the same queue, each receiving a subset of messages for load balancing." },
    { term: "Fan-Out", definition: "Delivering a single message to multiple independent destinations simultaneously." },
    { term: "Consumer Group", definition: "Kafka concept where consumers share a group ID and collectively consume a topic with partition assignment." },
    { term: "Dead-Letter Queue", definition: "A queue that stores messages which failed processing after maximum retry attempts." },
    { term: "Visibility Timeout", definition: "SQS mechanism that hides a message from other consumers for a period after it is received." },
    { term: "Partition", definition: "An ordered, immutable sequence of messages within a Kafka topic. Unit of parallelism." },
    { term: "Exchange", definition: "RabbitMQ component that routes messages to queues based on type (direct, fanout, topic, headers) and bindings." },
    { term: "Offset", definition: "Sequential ID assigned to each message within a Kafka partition. Consumers track offsets to mark progress." },
    { term: "Backpressure", definition: "Mechanism to slow down producers when consumers cannot keep up, preventing message loss or system overload." },
    { term: "At-Least-Once Delivery", definition: "Guarantee that every message is delivered one or more times. Requires idempotent consumers to handle duplicates." },
  ],

  resources: [
    { label: "RabbitMQ Tutorials", kind: "docs", note: "Official tutorials covering all exchange types, work queues, pub/sub, and routing patterns." },
    { label: "Kafka: The Definitive Guide (2nd Ed.)", kind: "book", note: "Comprehensive coverage of Kafka architecture, consumer groups, transactions, and operations." },
    { label: "AWS SNS+SQS Fan-Out Pattern", kind: "docs", note: "AWS architecture guide for implementing event-driven fan-out with filtering." },
    { label: "Designing Data-Intensive Applications (Ch. 11)", kind: "book", note: "Martin Kleppmann's treatment of stream processing, message brokers, and log-based messaging." },
    { label: "The Log: What every software engineer should know", kind: "article", note: "Jay Kreps' foundational article on log-based architectures that inspired Kafka's design." },
    { label: "Enterprise Integration Patterns", kind: "book", note: "Gregor Hohpe's catalog of messaging patterns including competing consumers, publish-subscribe, and message routing." },
  ],
  exercises: [
    "Design an **order processing system** where an `order.created` event must be handled by three independent services: *billing*, *inventory*, and *notifications*. Choose between a queue, pub/sub, or a hybrid approach. Draw the architecture, specify the messaging technology (RabbitMQ, Kafka, or SNS+SQS), and explain how each service handles **failures** and **retries** independently.",
    "You have a Kafka topic with 6 partitions and a consumer group with 8 consumers. Explain what happens to the extra 2 consumers. Now one consumer crashes -- describe the **rebalancing** process step by step. How does *cooperative sticky rebalancing* differ from the default *eager rebalancing*?",
    "Implement an **idempotent consumer** pattern for processing payment events from an SQS queue. Each payment event has a unique `paymentId`. Show how to use a *deduplication table* in your database to ensure that even if SQS delivers the same message twice, the payment is processed exactly once. Include the SQL schema and the transactional processing logic.",
    "Compare the **SNS+SQS fan-out** pattern with **Kafka consumer groups** for broadcasting order events to 5 downstream services. For each approach, address: how to add a new service without modifying the publisher, how to handle a slow consumer without affecting others, and how to replay past events after a bug fix.",
    "A RabbitMQ consumer is failing on 5% of messages due to a transient external API error. Design a **retry strategy** with exponential backoff using **dead-letter exchanges**. Specify the exchange and queue topology: the main queue, a retry queue with a `message-ttl`, and a final DLQ. How many retries would you allow before sending to the DLQ?",
  ],
};
