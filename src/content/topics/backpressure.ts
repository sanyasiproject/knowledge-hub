import type { TopicContent } from "../types";

export const backpressure: TopicContent = {
  quickSummary: [
    "Backpressure is a flow-control mechanism where a slow consumer signals upstream producers to slow down, preventing buffer overflow and system collapse under load.",
    "Without backpressure, fast producers overwhelm slow consumers, leading to unbounded memory growth, increased latency, dropped messages, or cascading failures.",
    "Pull-based systems (Kafka consumers, Reactive Streams) naturally provide backpressure because the consumer controls the rate. Push-based systems (WebSockets, traditional message brokers) require explicit flow-control protocols.",
    "The Reactive Streams specification standardizes backpressure in the JVM ecosystem: a Subscriber requests N items from a Publisher, which sends at most N items before waiting for more demand.",
  ],
  detailed: [
    "Backpressure arises whenever components in a pipeline process data at different rates. In a producer-consumer system, if the producer emits 10,000 events per second but the consumer can only handle 2,000, the excess 8,000 events per second must go somewhere. Without backpressure, they accumulate in buffers that grow without bound, eventually causing out-of-memory errors, GC pauses, or dropped data. Backpressure propagates the slow consumer's capacity constraint upstream so the producer adjusts its rate.",
    "TCP implements backpressure at the transport layer via its sliding window mechanism. The receiver advertises a window size in each ACK, telling the sender how many bytes it can accept. When the receiver's buffer fills, the window shrinks to zero, and the sender pauses. This is why a slow HTTP client can throttle a fast server without any application-level flow control. TCP backpressure is automatic but coarse-grained -- it operates at the byte level with no awareness of message boundaries.",
    "Pull-based consumption is the simplest form of application-level backpressure. In Kafka, consumers call poll() to fetch batches of records. The consumer controls the rate by adjusting how frequently it polls and how many records it fetches per poll (max.poll.records and fetch.max.bytes). If the consumer is slow, it simply polls less frequently, and records accumulate in the topic partitions (which are durable on disk). The broker does not push data; it waits for fetch requests. This makes Kafka inherently backpressure-friendly.",
    "Push-based systems need explicit flow-control mechanisms. RabbitMQ uses consumer prefetch (basic.qos): the consumer declares how many unacknowledged messages it can handle at once. The broker stops pushing when the prefetch limit is reached. gRPC uses per-stream flow control borrowed from HTTP/2, with WINDOW_UPDATE frames controlling how much data the sender can transmit. WebSocket connections have no built-in flow control above TCP, so application-level protocols must implement their own.",
    "The Reactive Streams specification (java.util.concurrent.Flow in Java 9+) formalizes backpressure with four interfaces: Publisher, Subscriber, Subscription, and Processor. The Subscriber calls subscription.request(n) to signal demand for n items. The Publisher sends at most n items via onNext(), then waits for more demand. This pull-within-push model allows fine-grained flow control. Project Reactor (Mono/Flux) and RxJava 2+ implement Reactive Streams.",
    "Buffering strategies are an alternative or complement to backpressure. Instead of slowing the producer, the system absorbs bursts with buffers. Common strategies: bounded buffers that reject or drop when full (drop-oldest, drop-newest, drop-incoming), unbounded buffers (dangerous -- defer the OOM), windowed buffers that aggregate items over time or count, and spillover buffers that write excess to disk. Each has tradeoffs between latency, data loss, and resource usage.",
  ],
  deepDive: [
    "In Kafka, consumer backpressure manifests as consumer lag -- the difference between the latest offset in a partition and the consumer group's committed offset. Lag is a natural consequence of pull-based consumption and is not inherently problematic; it simply means the consumer is behind. However, excessive lag can cause issues: if the consumer falls behind the log retention period, data is lost. Monitoring consumer lag (via kafka-consumer-groups.sh, Burrow, or JMX metrics) is essential. If lag grows continuously, the remedy is to add more consumers to the group (up to the number of partitions), optimize processing, or increase partition count.",
    "Rate limiting is a complementary mechanism to backpressure that caps throughput at a configured maximum regardless of downstream capacity. Unlike backpressure (which is demand-driven), rate limiting is policy-driven. Token bucket and leaky bucket are the classic algorithms. Token bucket allows bursts up to the bucket size and then enforces a steady rate. Leaky bucket smooths output to a constant rate. In messaging, Kafka quotas (produce and fetch byte-rate limits per client-id or user) implement rate limiting at the broker level. Application-level rate limiting (e.g., Guava RateLimiter, resilience4j) can protect downstream services.",
    "Reactive Streams operators handle backpressure in various ways. The buffer operator collects items when downstream is slow, with configurable overflow strategies (ERROR, DROP_LATEST, DROP_OLDEST). The onBackpressureBuffer/onBackpressureDrop/onBackpressureLatest operators in RxJava explicitly control what happens when demand is insufficient. The flatMap operator with a maxConcurrency parameter limits parallelism, providing indirect backpressure. The sample/throttle operators discard items to match downstream speed, trading data completeness for system stability.",
    "In distributed microservices, backpressure must cross network boundaries. gRPC streams use HTTP/2 flow control: each stream has a flow-control window (default 64KB), and the receiver sends WINDOW_UPDATE frames to grant more capacity. When a gRPC server produces results faster than the client can consume, the server's send buffer fills, causing the server-side write to block or return a signal that the stream is not ready. Libraries like Project Reactor's rsocket-java implement Reactive Streams semantics over the network, allowing request(n) signals to propagate from consumer to producer across service boundaries.",
    "Backpressure in event-driven architectures requires careful design. In a pipeline where Service A publishes to a topic consumed by Service B, which publishes to another topic consumed by Service C, backpressure must propagate through the entire chain. If Service C is slow, Service B's consumer lag grows. If Service B is well-designed, its consumer lag causes it to poll less frequently, which naturally limits its produce rate. If Service B decouples input and output (e.g., batches and bulk-inserts), the backpressure signal may not propagate, and Service B itself may fail under load. The solution is end-to-end flow control: each service monitors its own lag and adjusts produce rate accordingly, or uses explicit coordination (circuit breakers, adaptive rate limiting).",
  ],
  code: [
    {
      language: "java",
      caption: "Reactive Streams backpressure with Project Reactor Flux",
      source: `import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;
import java.time.Duration;

// Fast producer: emits 1000 items/sec
Flux<Long> fastProducer = Flux.interval(Duration.ofMillis(1))
    .onBackpressureBuffer(256, dropped ->
        System.out.println("Dropped: " + dropped)
    );

// Slow consumer: processes 10 items/sec
fastProducer
    .publishOn(Schedulers.boundedElastic(), 64) // prefetch 64 items
    .doOnNext(item -> {
        try {
            Thread.sleep(100); // Simulate slow processing
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Processed: " + item);
    })
    .subscribe();`,
    },
    {
      language: "java",
      caption: "RabbitMQ consumer prefetch for push-based backpressure",
      source: `import com.rabbitmq.client.*;

ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
Connection connection = factory.newConnection();
Channel channel = connection.createChannel();

// Set prefetch count: broker sends at most 50 unacknowledged messages
// This is the primary backpressure mechanism in RabbitMQ
channel.basicQos(50);

channel.basicConsume("order-queue", false, new DefaultConsumer(channel) {
    @Override
    public void handleDelivery(String consumerTag, Envelope envelope,
                               AMQP.BasicProperties properties, byte[] body) {
        try {
            String message = new String(body, "UTF-8");
            processOrder(message);
            // Manual ACK after successful processing
            // Frees one slot in the prefetch window
            channel.basicAck(envelope.getDeliveryTag(), false);
        } catch (Exception e) {
            // Nack and requeue on failure
            channel.basicNack(envelope.getDeliveryTag(), false, true);
        }
    }
});`,
    },
    {
      language: "cpp",
      caption: "Kafka consumer with controlled poll rate and batch processing",
      source: `#include <librdkafka/rdkafkacpp.h>
#include <iostream>
#include <thread>
#include <chrono>

// Simplified Kafka consumer with pull-based backpressure
// Using librdkafka C++ API

int main() {
    RdKafka::Conf* conf = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);
    std::string errstr;

    conf->set("bootstrap.servers", "localhost:9092", errstr);
    conf->set("group.id", "analytics", errstr);
    conf->set("enable.auto.commit", "false", errstr);
    conf->set("max.poll.records", "100", errstr);       // Backpressure: limit batch size
    conf->set("fetch.max.bytes", "1048576", errstr);     // 1 MB max per fetch

    RdKafka::KafkaConsumer* consumer =
        RdKafka::KafkaConsumer::create(conf, errstr);
    delete conf;

    std::vector<std::string> topics = {"sensor-data"};
    consumer->subscribe(topics);

    while (true) {
        // Pull-based: consumer controls rate by polling frequency
        RdKafka::Message* msg = consumer->consume(1000);  // timeout 1s

        if (msg->err() == RdKafka::ERR_NO_ERROR) {
            // Process the sensor reading
            process_sensor_reading(msg->payload(), msg->len());

            // Commit only after successful processing
            consumer->commitSync();
        }

        delete msg;

        // Optional: adaptive throttling based on processing time
        // Slow down if consistently hitting max batch
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    consumer->close();
    delete consumer;
    return 0;
}`,
    },
    {
      language: "typescript",
      caption: "Node.js readable stream backpressure with highWaterMark",
      source: `import { Readable, Transform, Writable } from 'stream';
import { pipeline } from 'stream/promises';

// Fast producer: generates records rapidly
const source = new Readable({
  objectMode: true,
  highWaterMark: 64,  // Buffer up to 64 objects before pausing
  read(size) {
    for (let i = 0; i < size; i++) {
      const record = generateRecord();
      // push() returns false when internal buffer is full
      // Node automatically pauses reads until buffer drains
      if (!this.push(record)) break;
    }
  },
});

// Slow transformer: simulates heavy processing
const processor = new Transform({
  objectMode: true,
  highWaterMark: 16,  // Smaller buffer = stronger backpressure signal
  async transform(record, encoding, callback) {
    const result = await heavyComputation(record); // 50ms per record
    callback(null, result);
  },
});

// Sink: writes to database in batches
const sink = new Writable({
  objectMode: true,
  highWaterMark: 32,
  async write(record, encoding, callback) {
    await db.insert(record);
    callback();
  },
});

// pipeline() handles backpressure propagation automatically
await pipeline(source, processor, sink);`,
    },
  ],
  diagrams: [
    {
      title: "Pull vs Push Flow Control",
      kind: "sequence",
      caption: "Pull-based: consumer requests data when ready. Push-based: producer sends data, consumer must signal capacity.",
    },
    {
      title: "Backpressure Propagation in a Pipeline",
      kind: "flow",
      caption: "Slow downstream consumer causes buffers to fill, propagating pause signals upstream through the pipeline.",
    },
    {
      title: "TCP Sliding Window Mechanism",
      kind: "sequence",
      caption: "Receiver advertises window size in ACKs; sender limits in-flight bytes to window size.",
    },
  ],
  animations: [
    {
      title: "Reactive Streams Request-Demand Protocol",
      steps: [
        { label: "Subscribe", detail: "Subscriber calls publisher.subscribe(subscriber). Publisher creates a Subscription." },
        { label: "onSubscribe", detail: "Publisher calls subscriber.onSubscribe(subscription), handing over the Subscription object." },
        { label: "Request demand", detail: "Subscriber calls subscription.request(10), signaling it can handle 10 items." },
        { label: "Emit items", detail: "Publisher sends up to 10 items via subscriber.onNext(item). Demand decreases with each call." },
        { label: "Demand exhausted", detail: "After 10 items, demand is zero. Publisher stops emitting and waits." },
        { label: "More demand", detail: "Subscriber finishes processing, calls subscription.request(10) again. Cycle repeats." },
        { label: "Completion", detail: "When all items are sent, publisher calls subscriber.onComplete(). No more items." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Pull-Based", "Push-Based"],
    rows: [
      ["Backpressure", "Natural -- consumer controls rate", "Must be implemented explicitly"],
      ["Latency", "Higher -- poll interval adds delay", "Lower -- immediate delivery"],
      ["Complexity", "Simpler -- no flow-control protocol needed", "More complex -- prefetch, windows, credits"],
      ["Example systems", "Kafka, HTTP polling, Iterator", "RabbitMQ, WebSocket, gRPC stream"],
      ["Buffer location", "Server-side (durable)", "Client-side (memory)"],
      ["Burst handling", "Bursts absorbed in server log", "Requires buffer or drop policy"],
      ["Idle overhead", "Wasted polls when no data", "None -- events pushed when available"],
      ["Ordering", "Consumer reads in order", "Redelivery may break order"],
    ],
  },
  interviewQA: [
    {
      q: "What is backpressure and why is it important?",
      a: "Backpressure is a mechanism for a slow consumer to signal an upstream producer to slow down. Without it, a fast producer can overwhelm a slow consumer, causing unbounded buffer growth, out-of-memory errors, increased latency, or data loss. Backpressure ensures system stability by matching production rate to consumption capacity.",
      followUps: [
        "How does TCP implement backpressure?",
        "What happens in a system without backpressure when the consumer is slower than the producer?",
      ],
    },
    {
      q: "How does Kafka handle backpressure?",
      a: "Kafka uses a pull-based model where consumers call poll() to fetch records. The consumer controls the rate by adjusting poll frequency and batch size (max.poll.records, fetch.max.bytes). If the consumer is slow, records accumulate in the partition log on disk -- Kafka's durable storage acts as an elastic buffer. Consumer lag (the offset gap between producer and consumer) is the visible indicator of backpressure. Unlike push-based systems, no explicit flow-control protocol is needed.",
      followUps: [
        "What are the risks of excessive consumer lag?",
        "How do you monitor and alert on consumer lag?",
      ],
    },
    {
      q: "Explain the Reactive Streams specification.",
      a: "Reactive Streams defines a standard for asynchronous stream processing with non-blocking backpressure on the JVM. It has four interfaces: Publisher (source of items), Subscriber (consumer), Subscription (link between them), and Processor (both subscriber and publisher). The key mechanism is demand signaling: the Subscriber calls subscription.request(n) to indicate how many items it can handle. The Publisher sends at most n items. This request-demand protocol prevents the publisher from overwhelming the subscriber. Java 9 adopted it as java.util.concurrent.Flow. Project Reactor and RxJava 2+ implement it.",
      followUps: [
        "What operators are available for handling backpressure in Reactor?",
        "How does backpressure work across network boundaries?",
      ],
    },
    {
      q: "What buffering strategies exist for handling fast producers?",
      a: "Common strategies: (1) Bounded buffer with drop policy -- when full, drop the oldest item, the newest item, or reject the incoming item. (2) Unbounded buffer -- absorbs all excess but risks OOM. (3) Windowed buffer -- aggregate items by time window or count before emitting. (4) Spillover to disk -- write excess to a file or embedded database when memory buffer fills. (5) Sample/throttle -- periodically emit only the latest item, discarding intermediates. The choice depends on whether data loss is acceptable and latency requirements.",
    },
  ],
  mcqs: [
    {
      q: "In Kafka, what is the primary mechanism for consumer backpressure?",
      options: [
        "The broker rate-limits producers when consumers are slow",
        "Consumers pull data via poll(), controlling their own consumption rate",
        "The broker sends WINDOW_UPDATE frames to the producer",
        "Consumers set a prefetch count on the broker",
      ],
      answerIndex: 1,
      explanation: "Kafka uses a pull-based model. Consumers call poll() and control their rate via max.poll.records and poll frequency.",
    },
    {
      q: "What does RabbitMQ's basic.qos(prefetchCount) control?",
      options: [
        "The maximum message size",
        "The number of unacknowledged messages the broker will push to a consumer",
        "The rate at which producers can publish",
        "The number of queues a consumer can subscribe to",
      ],
      answerIndex: 1,
      explanation: "basic.qos sets the prefetch count -- the max number of unacked messages the broker sends before waiting for acknowledgments. This is RabbitMQ's primary backpressure mechanism.",
    },
    {
      q: "In Reactive Streams, how does a Subscriber signal demand?",
      options: [
        "By returning a value from onNext()",
        "By calling subscription.request(n)",
        "By setting a buffer size in the constructor",
        "By implementing a capacity() method",
      ],
      answerIndex: 1,
      explanation: "The Subscriber calls subscription.request(n) to tell the Publisher it can handle n more items.",
    },
    {
      q: "What is consumer lag in Kafka?",
      options: [
        "The time between message production and consumption",
        "The difference between the latest partition offset and the consumer group's committed offset",
        "The number of failed consumer poll attempts",
        "The network latency between consumer and broker",
      ],
      answerIndex: 1,
      explanation: "Consumer lag is the offset difference between the log-end offset and the consumer's committed offset, indicating how far behind the consumer is.",
    },
    {
      q: "Which buffering strategy risks out-of-memory errors?",
      options: [
        "Bounded buffer with drop-oldest policy",
        "Unbounded buffer",
        "Spillover to disk",
        "Sampling/throttling",
      ],
      answerIndex: 1,
      explanation: "Unbounded buffers grow without limit when the producer is faster than the consumer, eventually exhausting memory.",
    },
  ],
  flashcards: [
    { front: "Backpressure", back: "Flow-control mechanism where a slow consumer signals upstream to slow down, preventing buffer overflow." },
    { front: "Pull-based consumption", back: "Consumer requests data when ready (e.g., Kafka poll()). Natural backpressure -- consumer controls rate." },
    { front: "Push-based consumption", back: "Producer sends data to consumer. Requires explicit flow control (prefetch, credits, window)." },
    { front: "TCP sliding window", back: "Receiver advertises buffer space in ACKs. Sender limits in-flight data to window size. Zero window = sender pauses." },
    { front: "Reactive Streams request(n)", back: "Subscriber signals demand for n items. Publisher sends at most n. Prevents overwhelming the subscriber." },
    { front: "Consumer lag (Kafka)", back: "Offset gap between log-end and committed offset. Indicates consumer is behind. Monitor to detect backpressure." },
    { front: "Prefetch count (RabbitMQ)", back: "basic.qos(n) limits unacked messages pushed to consumer. Primary backpressure mechanism for push-based brokers." },
    { front: "Token bucket rate limiter", back: "Allows bursts up to bucket capacity, then enforces steady rate. Tokens added at fixed rate; each request consumes a token." },
  ],
  revisionNotes: [
    "Backpressure = slow consumer tells fast producer to slow down. Without it: OOM, dropped data, cascading failures.",
    "Pull-based (Kafka) = natural backpressure. Push-based (RabbitMQ, WebSocket) = needs explicit flow control.",
    "TCP implements backpressure via sliding window. Zero window = sender pauses.",
    "Reactive Streams: Subscriber.request(n) -> Publisher sends at most n items -> waits for more demand.",
    "Kafka consumer lag = log-end offset - committed offset. Monitor with Burrow or JMX.",
    "RabbitMQ prefetch (basic.qos) limits unacked messages. Acts as push-based backpressure.",
    "Buffering strategies: bounded (drop-oldest/newest), unbounded (risky), spillover to disk, sampling.",
    "Rate limiting (token/leaky bucket) is policy-driven; backpressure is demand-driven. Both control throughput.",
    "In pipelines, backpressure must propagate end-to-end. A decoupled stage can break the chain.",
    "Node.js streams: highWaterMark controls buffer size. push() returns false when full. pipeline() handles propagation.",
  ],
  cheatSheet: [
    "Pull-based backpressure: consumer polls when ready (Kafka, HTTP long-poll)",
    "Push-based backpressure: prefetch/credits/window (RabbitMQ basic.qos, HTTP/2 WINDOW_UPDATE)",
    "Reactive Streams: subscribe -> onSubscribe -> request(n) -> onNext * n -> request(n) -> ...",
    "Kafka consumer tuning: max.poll.records, fetch.max.bytes, max.poll.interval.ms",
    "RabbitMQ: channel.basicQos(prefetchCount) before basicConsume",
    "Node.js: Readable.highWaterMark, push() returns false, pipeline() for propagation",
    "Buffer overflow strategies: DROP_OLDEST, DROP_LATEST, ERROR, BUFFER_UNBOUNDED",
    "Rate limiting: token bucket (bursty), leaky bucket (smooth), sliding window (per-interval)",
  ],
  resources: [
    { label: "Reactive Streams Specification", kind: "docs", note: "The canonical spec for async stream processing with backpressure on the JVM" },
    { label: "Project Reactor Reference Guide", kind: "docs", note: "Comprehensive guide to Reactor's Flux/Mono and backpressure operators" },
    { label: "Designing Data-Intensive Applications (Ch. 11)", kind: "book", note: "Martin Kleppmann on stream processing and flow control" },
    { label: "Node.js Stream Documentation", kind: "docs", note: "Official guide to Node.js streams, including backpressure handling" },
    { label: "RabbitMQ Consumer Prefetch", kind: "docs", note: "Official RabbitMQ documentation on basic.qos and prefetch" },
    { label: "Kafka Consumer Configuration", kind: "docs", note: "Apache Kafka docs on consumer configs affecting throughput and backpressure" },
  ],
  glossary: [
    { term: "Backpressure", definition: "A flow-control mechanism where a downstream component signals upstream to reduce its output rate." },
    { term: "Consumer lag", definition: "In Kafka, the difference between the log-end offset and the consumer's committed offset for a partition." },
    { term: "Prefetch count", definition: "RabbitMQ's basic.qos parameter limiting how many unacknowledged messages the broker sends to a consumer." },
    { term: "Reactive Streams", definition: "JVM specification (java.util.concurrent.Flow) for asynchronous stream processing with non-blocking backpressure." },
    { term: "Sliding window", definition: "TCP flow-control mechanism where the receiver advertises available buffer space in ACK packets." },
    { term: "Token bucket", definition: "Rate-limiting algorithm that allows bursts up to a configured bucket size and then enforces a steady rate." },
    { term: "highWaterMark", definition: "In Node.js streams, the buffer threshold above which the stream signals the producer to pause." },
    { term: "Flow control", definition: "General term for mechanisms that regulate the rate of data transfer between producer and consumer." },
  ],

  exercises: [
    "You have a **data pipeline**: an HTTP ingestion endpoint receives 50,000 events/sec, writes to a Kafka topic, and a consumer service processes events and writes to PostgreSQL (which can handle 5,000 inserts/sec). Identify *every point* where backpressure can occur in this pipeline. For each point, propose a specific mechanism (e.g., `basic.qos`, `max.poll.records`, connection pool limits) and explain the trade-off between **data loss** and **latency**.",
    "Implement a **bounded producer-consumer queue** in C++ using `std::mutex`, `std::condition_variable`, and a fixed-size `std::deque`. The producer should *block* when the queue is full (backpressure). Measure the throughput difference between a bounded queue of size 10, 100, and 1000. At what point does increasing the buffer size stop improving throughput, and why?",
    "Compare **three overflow strategies** for a message buffer: *drop-oldest*, *drop-newest*, and *block-sender*. For each strategy, give a real-world scenario where it is the best choice (e.g., live video streaming, financial transactions, IoT sensor data). Implement all three as variants of a `template<typename T> class BackpressureBuffer` in C++.",
    "A **Reactive Streams** publisher emits items at variable rates (bursts of 10,000/sec, then idle). The subscriber calls `subscription.request(100)` after processing each batch. Design the buffering and demand-signaling strategy so the system handles bursts *without dropping data* and without unbounded memory growth. What role does the `onBackpressureBuffer(maxSize, overflowStrategy)` operator play?",
    "Your Kafka consumer group has **consumer lag** growing steadily at 500 messages/sec across 12 partitions. Walk through a systematic **diagnosis and remediation** process: How do you determine whether the bottleneck is *deserialization*, *processing logic*, *database writes*, or *insufficient consumers*? What Kafka consumer configs (`max.poll.records`, `fetch.max.bytes`, `max.poll.interval.ms`) would you tune, and in what order?"
  ],
};
