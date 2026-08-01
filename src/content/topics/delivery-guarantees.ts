import type { TopicContent } from "../types";

export const deliveryGuarantees: TopicContent = {
  quickSummary: [
    "Message delivery guarantees describe how many times a message is delivered between producer and consumer: at-most-once (fire and forget), at-least-once (retry until acknowledged), or exactly-once (effectively delivered precisely once).",
    "At-most-once is the simplest and fastest but risks data loss. At-least-once is the most common default, requiring idempotent consumers to handle duplicates. Exactly-once is the hardest to achieve and typically relies on idempotency plus transactional coordination.",
    "Idempotent consumers are the practical foundation of reliable messaging: designing operations so that processing the same message multiple times produces the same result as processing it once.",
    "The transactional outbox pattern solves the dual-write problem by writing the message to a database table atomically with the business transaction, then publishing it asynchronously via a relay process.",
  ],
  detailed: [
    "At-most-once delivery means a message is sent and no retry is attempted if delivery fails. The producer fires the message and moves on. If the broker crashes, the network drops, or the consumer is unavailable, the message is lost. This is appropriate for metrics, logs, or telemetry where occasional data loss is acceptable. In Kafka, setting acks=0 on the producer achieves at-most-once semantics. In RabbitMQ, publishing without confirms and using auto-ack on the consumer side yields at-most-once behavior.",
    "At-least-once delivery means the system guarantees the message will be delivered, but it may arrive more than once. The producer retries on failure, and the consumer acknowledges only after successful processing. If the consumer processes a message but crashes before acknowledging, the broker redelivers it. This is the default in most messaging systems: Kafka with acks=all and enable.auto.commit=false, RabbitMQ with publisher confirms and manual acks, SQS with its visibility timeout mechanism. The consumer must handle duplicates gracefully.",
    "Exactly-once semantics (EOS) means each message is processed exactly once, with no duplicates and no losses. True exactly-once across arbitrary distributed systems is impossible (per the Two Generals problem), but effective exactly-once can be achieved within bounded systems. Kafka achieves EOS for stream processing via idempotent producers (which deduplicate at the broker using producer IDs and sequence numbers) combined with transactional writes that atomically commit produced messages and consumer offsets. This only works within the Kafka ecosystem; once you cross system boundaries (e.g., writing to a database), you need application-level idempotency.",
    "Idempotent consumers are designed so that processing a message N times has the same effect as processing it once. Common strategies include: using a unique message ID stored in a deduplication table (check before processing), designing operations to be naturally idempotent (SET balance = 100 vs. INCREMENT balance BY 10), and using database upserts with natural keys. The deduplication window must be managed carefully -- storing every message ID forever is impractical, so a TTL-based or sliding-window approach is typical.",
    "The transactional outbox pattern addresses the dual-write problem: when a service needs to update its database AND publish an event, doing both atomically is impossible without coordination. The solution is to write the event to an outbox table in the same database transaction as the business data, then have a separate process (log tailer or poller) read the outbox and publish events to the message broker. This guarantees that if the business data is committed, the event will eventually be published. Debezium (CDC-based) and custom pollers are common implementations.",
    "Deduplication can happen at multiple levels: broker-level (Kafka idempotent producer deduplicates within a partition using sequence numbers), infrastructure-level (SQS FIFO queues provide message deduplication IDs with a 5-minute window), or application-level (consumer maintains a set of processed message IDs). Application-level deduplication is the most flexible and reliable, as it works across system boundaries.",
  ],
  deepDive: [
    "Kafka's exactly-once semantics rely on three mechanisms working together. First, idempotent producers: each producer instance gets a unique PID (producer ID) from the broker, and each message within a partition gets a monotonically increasing sequence number. The broker rejects duplicates by checking the sequence number against the last committed one for that PID-partition pair. Second, transactional producers: the producer can begin a transaction, send messages to multiple partitions, and commit or abort atomically. The broker uses a transaction coordinator and a transaction log (__transaction_state topic) to manage two-phase commits. Third, read_committed isolation: consumers configured with isolation.level=read_committed only see messages from committed transactions, skipping aborted ones. The combination of these three ensures that a Kafka Streams application can read from input topics, process, and write to output topics with exactly-once semantics.",
    "The transactional outbox has several implementation variants. The polling publisher periodically queries the outbox table for unpublished events (SELECT ... WHERE published = false ORDER BY created_at LIMIT 100), publishes them, and marks them as published. This is simple but introduces latency and requires careful handling of concurrent pollers (use SELECT ... FOR UPDATE SKIP LOCKED). The log-tailing approach uses change data capture (CDC) tools like Debezium to stream the database's write-ahead log (WAL/binlog) directly to Kafka. This is more efficient and lower-latency but adds operational complexity. A third variant, the listen/notify approach (PostgreSQL), uses database triggers to notify a connected process when new outbox rows are inserted.",
    "SQS provides two queue types with different delivery guarantees. Standard queues offer at-least-once delivery with best-effort ordering -- messages may be delivered more than once and potentially out of order. FIFO queues guarantee exactly-once processing (within the deduplication window of 5 minutes) and strict ordering within a message group. FIFO queues achieve deduplication via a MessageDeduplicationId: if a message with the same deduplication ID is sent within 5 minutes, SQS discards the duplicate. However, FIFO queues have lower throughput (300 messages/second without batching, 3000 with) compared to standard queues (nearly unlimited).",
    "The Two Generals problem proves that no protocol can guarantee exactly-once delivery over an unreliable channel with a finite number of messages. In practice, we approximate exactly-once through idempotency. The key insight is that exactly-once is not a transport-layer property but an application-layer abstraction built on at-least-once delivery plus deduplication. Even Kafka's EOS is technically at-least-once with broker-side deduplication -- the broker may receive the same message twice but only commits it once.",
    "Ordered delivery interacts with delivery guarantees in subtle ways. In Kafka, messages within a partition are strictly ordered, but retries can reorder messages if max.in.flight.requests.per.connection > 1 and enable.idempotence=false. With idempotent producers (enable.idempotence=true), Kafka allows up to 5 in-flight requests while preserving order because the broker rejects out-of-sequence messages and the producer retries transparently. In RabbitMQ, messages are delivered in order per queue, but redeliveries (nack + requeue) can break ordering since requeued messages go to the head of the queue.",
  ],
  code: [
    {
      language: "java",
      caption: "Kafka idempotent producer configuration for at-least-once with broker dedup",
      source: `Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// Enable idempotent producer -- guarantees no duplicates at broker
props.put("enable.idempotence", "true");
// acks=all is required and set automatically with idempotence
props.put("acks", "all");
// Max in-flight requests must be <= 5 with idempotence
props.put("max.in.flight.requests.per.connection", "5");
props.put("retries", Integer.MAX_VALUE);

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

producer.send(new ProducerRecord<>("orders", orderId, orderJson),
    (metadata, exception) -> {
        if (exception != null) {
            log.error("Failed to send order {}", orderId, exception);
        } else {
            log.info("Order {} sent to partition {} offset {}",
                orderId, metadata.partition(), metadata.offset());
        }
    });`,
    },
    {
      language: "java",
      caption: "Kafka transactional producer for exactly-once semantics",
      source: `Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("enable.idempotence", "true");
props.put("transactional.id", "order-processor-1");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
producer.initTransactions();

KafkaConsumer<String, String> consumer = createConsumer();

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    if (records.isEmpty()) continue;

    producer.beginTransaction();
    try {
        for (ConsumerRecord<String, String> record : records) {
            // Process and produce to output topic
            String result = process(record.value());
            producer.send(new ProducerRecord<>("processed-orders", record.key(), result));
        }
        // Atomically commit offsets and produced messages
        producer.sendOffsetsToTransaction(
            getOffsetsToCommit(records),
            consumer.groupMetadata()
        );
        producer.commitTransaction();
    } catch (Exception e) {
        producer.abortTransaction();
        log.error("Transaction aborted", e);
    }
}`,
    },
    {
      language: "cpp",
      caption: "Idempotent consumer with deduplication table in C++ (librdkafka + libpqxx)",
      source: `#include <iostream>
#include <string>
#include <librdkafka/rdkafkacpp.h>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

int main() {
    // Configure Kafka consumer
    RdKafka::Conf* conf = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);
    std::string errstr;
    conf->set("bootstrap.servers", "localhost:9092", errstr);
    conf->set("group.id", "order-processor", errstr);
    conf->set("enable.auto.commit", "false", errstr);
    conf->set("auto.offset.reset", "earliest", errstr);

    RdKafka::KafkaConsumer* consumer = RdKafka::KafkaConsumer::create(conf, errstr);
    consumer->subscribe({"orders"});
    delete conf;

    pqxx::connection conn("dbname=orders user=app");

    while (true) {
        RdKafka::Message* msg = consumer->consume(1000);
        if (msg->err() != RdKafka::ERR_NO_ERROR) {
            delete msg;
            continue;
        }

        std::string payload(static_cast<const char*>(msg->payload()), msg->len());
        json order = json::parse(payload);

        // Build message ID from headers or topic-partition-offset
        std::string message_id;
        RdKafka::Headers* headers = msg->headers();
        if (headers) {
            std::vector<RdKafka::Headers::Header> hdr = headers->get("message-id");
            if (!hdr.empty()) {
                message_id.assign(static_cast<const char*>(hdr[0].value()), hdr[0].value_size());
            }
        }
        if (message_id.empty()) {
            message_id = msg->topic_name() + "-"
                + std::to_string(msg->partition()) + "-"
                + std::to_string(msg->offset());
        }

        pqxx::work txn(conn);

        // Check if already processed (deduplication)
        pqxx::result res = txn.exec_params(
            "SELECT 1 FROM processed_messages WHERE message_id = $1",
            message_id);
        if (!res.empty()) {
            txn.abort();
            consumer->commitSync(msg);
            delete msg;
            continue;
        }

        // Process: insert order and dedup record in same transaction
        txn.exec_params(
            "INSERT INTO orders (order_id, customer_id, amount, status) "
            "VALUES ($1, $2, $3, 'confirmed') "
            "ON CONFLICT (order_id) DO NOTHING",
            order["id"].get<std::string>(),
            order["customer_id"].get<std::string>(),
            order["amount"].get<double>());

        txn.exec_params(
            "INSERT INTO processed_messages (message_id, processed_at) "
            "VALUES ($1, NOW())",
            message_id);

        txn.commit();
        consumer->commitSync(msg);
        delete msg;
    }

    consumer->close();
    delete consumer;
    return 0;
}`,
    },
    {
      language: "typescript",
      caption: "Transactional outbox pattern with PostgreSQL and polling publisher",
      source: `// Writing business data + outbox event in one transaction
async function placeOrder(order: Order): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert the order
    await client.query(
      'INSERT INTO orders (id, customer_id, amount, status) VALUES ($1, $2, $3, $4)',
      [order.id, order.customerId, order.amount, 'confirmed']
    );

    // Write the event to the outbox in the same transaction
    await client.query(
      \`INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4, $5)\`,
      [uuid(), 'Order', order.id, 'OrderPlaced', JSON.stringify(order)]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Polling publisher that reads outbox and publishes to Kafka
async function publishOutboxEvents(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      \`SELECT * FROM outbox WHERE published = false
       ORDER BY created_at LIMIT 100
       FOR UPDATE SKIP LOCKED\`
    );

    for (const row of result.rows) {
      await kafkaProducer.send({
        topic: \`\${row.aggregate_type.toLowerCase()}-events\`,
        messages: [{
          key: row.aggregate_id,
          value: row.payload,
          headers: { 'event-type': row.event_type, 'outbox-id': row.id },
        }],
      });
    }

    const ids = result.rows.map(r => r.id);
    if (ids.length > 0) {
      await client.query(
        'UPDATE outbox SET published = true WHERE id = ANY($1)',
        [ids]
      );
    }
    await client.query('COMMIT');
  } finally {
    client.release();
  }
}`,
    },
  ],
  diagrams: [
    {
      title: "Delivery Guarantee Comparison",
      kind: "mindmap",
      caption: "The three delivery guarantees compared across loss risk, duplicate risk, complexity, and typical use cases.",
      mermaid: `mindmap
  root[Delivery Guarantees]
    At-Most-Once
      May lose messages
      No duplicates
      Lowest complexity
      Metrics and logs
    At-Least-Once
      No message loss
      May duplicate
      Medium complexity
      Orders and events
      Requires idempotent consumer
    Exactly-Once
      No loss
      No duplicates
      Highest complexity
      Financial ledgers
      Kafka transactions or dedup table`,
    },
    {
      title: "At-Least-Once Delivery with Retry",
      kind: "sequence",
      caption: "Producer retries on missing ACK. Consumer may process a duplicate if the ACK is lost after the consumer processes but before it acknowledges.",
      mermaid: `sequenceDiagram
    participant P as Producer
    participant B as Broker
    participant C as Consumer
    P->>B: Send message msg-42
    B->>C: Deliver msg-42
    C->>C: Process msg-42
    C-->>B: ACK lost in network
    B-->>P: No ACK received - timeout
    P->>B: Retry: Send msg-42 again
    B->>C: Deliver msg-42 again
    C->>C: Process msg-42 duplicate`,
    },
    {
      title: "Transactional Outbox Pattern",
      kind: "architecture",
      caption: "Business data and outbox event are written atomically in one DB transaction. A relay process reads the outbox and publishes to the broker, achieving at-least-once event delivery.",
      mermaid: `graph LR
    S["Service"] -->|1 - atomic transaction| DB["Database"]
    DB --> BT["business_data table"]
    DB --> OT["outbox table - unpublished event"]
    R["Relay Process"] -->|2 - poll or CDC| OT
    R -->|3 - publish| MB["Message Broker"]
    MB -->|4 - consume| CON["Consumer"]
    R -->|5 - mark published| OT`,
    },
    {
      title: "Idempotent Consumer Deduplication Flow",
      kind: "flow",
      caption: "Consumer checks a deduplication table before processing to skip already-seen messages, achieving effective exactly-once processing on top of at-least-once delivery.",
      mermaid: `flowchart TD
    A[Receive message with ID] --> B{ID in dedup table?}
    B -->|Yes - duplicate| C[Skip processing]
    C --> D[ACK message to broker]
    B -->|No - new message| E[Begin DB transaction]
    E --> F[Execute business logic]
    F --> G[Insert message ID into dedup table]
    G --> H[Commit transaction]
    H --> D`,
    },
  ],
  animations: [
    {
      title: "Message Deduplication with Idempotent Consumer",
      steps: [
        { label: "Message arrives", detail: "Consumer receives message with ID msg-42 from the broker." },
        { label: "Check dedup table", detail: "Consumer queries the processed_messages table for msg-42. Not found." },
        { label: "Process message", detail: "Consumer executes business logic -- inserts order into database." },
        { label: "Record in dedup table", detail: "Consumer writes msg-42 to processed_messages in the same DB transaction." },
        { label: "Commit and ACK", detail: "Database transaction commits. Consumer acknowledges the message to the broker." },
        { label: "Broker redelivers", detail: "Network glitch causes broker to redeliver msg-42 (ACK was lost)." },
        { label: "Duplicate detected", detail: "Consumer finds msg-42 in dedup table. Skips processing. Acknowledges immediately." },
      ],
    },
  ],
  comparison: {
    columns: ["Property", "At-Most-Once", "At-Least-Once", "Exactly-Once"],
    rows: [
      ["Message loss", "Possible", "No", "No"],
      ["Duplicates", "No", "Possible", "No"],
      ["Complexity", "Lowest", "Medium", "Highest"],
      ["Latency", "Lowest", "Medium", "Highest"],
      ["Throughput", "Highest", "High", "Lower"],
      ["Kafka setting", "acks=0", "acks=all + manual commit", "Transactional producer"],
      ["RabbitMQ setting", "Auto-ack, no confirms", "Publisher confirms + manual ack", "Not natively supported"],
      ["SQS variant", "N/A", "Standard queue", "FIFO queue (5-min dedup)"],
      ["Consumer requirement", "None", "Idempotent handling", "Idempotent + transactional"],
      ["Use case", "Metrics, logs", "Orders, payments", "Financial ledgers, CDC"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between at-least-once and exactly-once delivery?",
      a: "At-least-once guarantees no message loss but allows duplicates -- the producer retries and the consumer may see the same message multiple times. Exactly-once means each message is effectively processed once with no duplicates and no losses. In practice, exactly-once is implemented as at-least-once delivery with deduplication, either at the broker level (Kafka idempotent producers) or at the application level (deduplication tables).",
      followUps: [
        "How does Kafka implement exactly-once semantics?",
        "Why is true exactly-once impossible in distributed systems?",
        "What is the Two Generals problem?",
      ],
    },
    {
      q: "How would you design an idempotent consumer?",
      a: "Store a unique message identifier (or derive one from the message content) in a deduplication table. Before processing, check if the ID exists. If it does, skip processing and acknowledge. If not, process the message and insert the ID into the deduplication table within the same database transaction as the business logic. Use a TTL or sliding window to prune old entries. Additionally, design business operations to be naturally idempotent where possible -- use upserts with natural keys, set absolute values rather than increments, and include version numbers for optimistic concurrency.",
      followUps: [
        "How do you handle deduplication at scale?",
        "What if the deduplication table grows too large?",
        "How do you derive a stable message ID if the producer does not set one?",
      ],
    },
    {
      q: "Explain the transactional outbox pattern.",
      a: "The transactional outbox solves the dual-write problem: needing to atomically update a database and publish an event. Instead of publishing directly, the service writes the event to an outbox table in the same database transaction as the business data. A separate relay process (polling publisher or CDC-based log tailer like Debezium) reads unpublished events from the outbox and publishes them to the message broker. Since the outbox write is atomic with the business write, this guarantees that committed business data always has a corresponding event, achieving at-least-once event publishing.",
      followUps: [
        "What are the tradeoffs between polling and CDC for the outbox relay?",
        "How do you handle ordering with the outbox pattern?",
        "What happens if the relay crashes after publishing but before marking as published?",
      ],
    },
    {
      q: "Can you achieve exactly-once delivery across system boundaries (e.g., Kafka to PostgreSQL)?",
      a: "Not with broker-level mechanisms alone. Kafka's exactly-once only works within the Kafka ecosystem (consume-transform-produce). When writing to an external system like PostgreSQL, you need application-level exactly-once: consume from Kafka with at-least-once, use an idempotent consumer (dedup table in PostgreSQL), and commit the Kafka offset only after the database transaction succeeds. The consumer stores the Kafka offset in the database alongside business data, so on restart it can seek to the last committed offset stored in the DB rather than relying on Kafka's consumer group offsets.",
    },
  ],
  mcqs: [
    {
      q: "Which Kafka producer setting enables broker-level deduplication?",
      options: [
        "acks=all",
        "enable.idempotence=true",
        "transactional.id=my-txn",
        "max.in.flight.requests.per.connection=1",
      ],
      answerIndex: 1,
      explanation: "enable.idempotence=true assigns each producer a PID and sequence numbers per partition, allowing the broker to detect and discard duplicate messages.",
    },
    {
      q: "What is the deduplication window for SQS FIFO queues?",
      options: ["1 minute", "5 minutes", "15 minutes", "1 hour"],
      answerIndex: 1,
      explanation: "SQS FIFO queues deduplicate messages with the same MessageDeduplicationId within a 5-minute window.",
    },
    {
      q: "In the transactional outbox pattern, where is the event written?",
      options: [
        "Directly to the message broker",
        "To an in-memory queue in the application",
        "To an outbox table in the same database as business data",
        "To a separate event store database",
      ],
      answerIndex: 2,
      explanation: "The outbox pattern writes events to a table in the same database, within the same transaction as the business data, ensuring atomicity.",
    },
    {
      q: "Why is true exactly-once delivery impossible in distributed systems?",
      options: [
        "TCP does not support it",
        "The Two Generals problem proves no finite protocol can guarantee agreement over unreliable channels",
        "Message brokers cannot store sequence numbers",
        "Consumers cannot be made idempotent",
      ],
      answerIndex: 1,
      explanation: "The Two Generals problem (a special case of consensus impossibility) proves that no protocol using a finite number of messages over an unreliable channel can guarantee both sides agree on delivery.",
    },
    {
      q: "With Kafka idempotent producers, what is the maximum allowed value for max.in.flight.requests.per.connection?",
      options: ["1", "3", "5", "Unlimited"],
      answerIndex: 2,
      explanation: "Kafka's idempotent producer allows up to 5 in-flight requests per connection while maintaining ordering and deduplication via sequence numbers.",
    },
  ],
  flashcards: [
    { front: "At-most-once delivery", back: "Message sent with no retry. Fast but may lose data. Kafka: acks=0." },
    { front: "At-least-once delivery", back: "Producer retries until acknowledged. No loss but possible duplicates. Requires idempotent consumer." },
    { front: "Exactly-once semantics", back: "Each message processed exactly once. Achieved via idempotent producer + transactions (Kafka) or application-level dedup." },
    { front: "Idempotent consumer", back: "A consumer that produces the same result whether a message is processed once or multiple times. Uses dedup tables, upserts, or natural idempotency." },
    { front: "Transactional outbox", back: "Write events to a DB outbox table atomically with business data. A relay process publishes them to the broker. Solves the dual-write problem." },
    { front: "Dual-write problem", back: "The impossibility of atomically updating two separate systems (e.g., DB + message broker) without a coordination mechanism." },
    { front: "Kafka PID + sequence number", back: "Idempotent producer gets a Producer ID; each message gets a per-partition sequence number. Broker rejects duplicates." },
    { front: "Deduplication window", back: "Time period during which duplicate messages can be detected. SQS FIFO: 5 minutes. Application-level: configurable TTL." },
  ],
  revisionNotes: [
    "At-most-once: no retries, possible loss, zero duplicates. Best for expendable data like metrics.",
    "At-least-once: retries until ACK, no loss, possible duplicates. Default for most systems. Requires idempotent consumers.",
    "Exactly-once: effectively processed once. Kafka achieves it within its ecosystem via idempotent producers + transactions + read_committed isolation.",
    "Cross-system exactly-once requires application-level idempotency -- store message ID or offset in the target database.",
    "Transactional outbox: write event to DB outbox table in same transaction as business data. Relay publishes to broker.",
    "CDC (e.g., Debezium) can replace polling for outbox relay -- lower latency, no polling overhead.",
    "SQS Standard = at-least-once + best-effort ordering. SQS FIFO = exactly-once (5-min dedup window) + strict ordering.",
    "Kafka idempotent producer: enable.idempotence=true, acks=all, max.in.flight <= 5. Broker assigns PID + sequence numbers.",
    "The Two Generals problem means true exactly-once over unreliable networks is impossible -- we approximate it with idempotency.",
  ],
  cheatSheet: [
    "At-most-once: acks=0, auto-commit, no retries",
    "At-least-once: acks=all, manual commit, retries=MAX, idempotent consumer",
    "Exactly-once (Kafka): enable.idempotence=true + transactional.id + read_committed",
    "Idempotent consumer: check dedup table -> process -> write dedup + business data in one TX -> ACK",
    "Outbox pattern: BEGIN TX -> write business data -> write outbox row -> COMMIT -> relay publishes",
    "CDC outbox: Debezium tails WAL/binlog -> publishes outbox rows to Kafka automatically",
    "SQS FIFO dedup: set MessageDeduplicationId, 5-minute window, 300 msg/s (3000 batched)",
    "Cross-system EOS: store Kafka offset in target DB, seek on restart",
  ],
  exercises: [
    "Design an **idempotent consumer** for a payment processing service that receives `PaymentCompleted` events via Kafka. Describe the deduplication strategy, the database schema for the dedup table, and how you would handle the case where the consumer crashes *after* processing but *before* committing the offset.",
    "You have a microservice that must update its **PostgreSQL** database and publish an event to **Kafka** atomically. Implement the *transactional outbox pattern*: write the SQL schema for the outbox table, the transaction that writes both business data and the outbox row, and outline the polling publisher logic including `SELECT ... FOR UPDATE SKIP LOCKED`.",
    "Compare the behavior of a Kafka producer configured with `acks=0`, `acks=1`, and `acks=all` when the **leader broker crashes** mid-write. For each setting, describe whether the message is lost, duplicated, or safely persisted. Then explain how `enable.idempotence=true` changes the picture for `acks=all`.",
    "An **SQS FIFO queue** has a 5-minute deduplication window. Design a scenario where this window is *insufficient* for your application's needs, and propose an application-level deduplication strategy using DynamoDB to extend the window. Include the DynamoDB table schema and the consumer pseudocode.",
    "You are tasked with achieving **exactly-once semantics** across system boundaries: consuming from Kafka and writing to PostgreSQL. Implement the pattern where the Kafka consumer offset is stored *in the PostgreSQL database* alongside business data. Explain how this avoids the dual-write problem and what happens on consumer restart.",
  ],
  resources: [
    { label: "Kafka Exactly-Once Semantics (KIP-98)", kind: "docs", note: "The original Kafka proposal for transactional messaging" },
    { label: "Designing Data-Intensive Applications (Ch. 11)", kind: "book", note: "Martin Kleppmann's coverage of stream processing guarantees" },
    { label: "Transactional Outbox Pattern - microservices.io", kind: "article", note: "Chris Richardson's canonical description of the pattern" },
    { label: "Debezium Documentation", kind: "docs", note: "CDC tool commonly used with the outbox pattern" },
    { label: "You Cannot Have Exactly-Once Delivery - Bravenewgeek", kind: "article", note: "Tyler Treat's influential blog post on delivery semantics" },
    { label: "Two Generals Problem - Wikipedia", kind: "article", note: "Background on the impossibility result underlying delivery guarantees" },
  ],
  glossary: [
    { term: "At-most-once", definition: "Delivery guarantee where a message is sent at most one time with no retries; may be lost but never duplicated." },
    { term: "At-least-once", definition: "Delivery guarantee where a message is retried until acknowledged; never lost but may be delivered multiple times." },
    { term: "Exactly-once semantics (EOS)", definition: "Guarantee that each message is effectively processed exactly once, typically achieved through idempotency and transactional coordination." },
    { term: "Idempotency", definition: "Property of an operation where applying it multiple times produces the same result as applying it once." },
    { term: "Transactional outbox", definition: "Pattern where events are written to a database outbox table atomically with business data, then published asynchronously." },
    { term: "Dual-write problem", definition: "The challenge of atomically updating two separate data stores without a distributed transaction." },
    { term: "Deduplication", definition: "The process of detecting and discarding duplicate messages to prevent double-processing." },
    { term: "CDC (Change Data Capture)", definition: "Technique that captures row-level changes from a database log and streams them to external systems." },
    { term: "Visibility timeout", definition: "SQS mechanism where a message becomes invisible to other consumers for a configurable period after being received." },
    { term: "Producer ID (PID)", definition: "Unique identifier assigned to a Kafka idempotent producer, used with sequence numbers for deduplication." },
  ],
};
