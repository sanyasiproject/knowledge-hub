import type { TopicContent } from "../types";

export const kafkaFundamentals: TopicContent = {
  quickSummary: [
    "Apache Kafka is a distributed event streaming platform built around a persistent, append-only commit log. Producers write events to topics, consumers read from topics, and data is retained for a configurable duration.",
    "Kafka provides high throughput (millions of messages/sec), durability (data persisted to disk and replicated), ordering guarantees (per partition), and decoupling of producers from consumers.",
    "Key concepts: topics (named feeds), partitions (units of parallelism and ordering), offsets (position in a partition), consumer groups (scalable consumption), and brokers (servers in the cluster).",
  ],
  detailed: [
    "Kafka models data as an immutable, ordered, append-only log. Each topic is divided into partitions, and each partition is an independent log stored on disk. When a producer writes a message, it's appended to the end of a partition and assigned a sequential offset number. Consumers read by tracking their offset — they can start from the beginning, from the latest message, or from any specific offset. This log-centric model enables replay, reprocessing, and decoupling.",
    "Topics are the fundamental abstraction — a named feed of events. A topic can have any number of partitions (typically 3-50 in production). Partitions serve two purposes: (1) parallelism — different consumers can read different partitions simultaneously, and (2) ordering — messages within a single partition are strictly ordered. Messages are assigned to partitions by key (hash of key → partition) or round-robin if no key is provided.",
    "Brokers are the servers that form a Kafka cluster. Each broker stores a subset of partitions. Every partition has one leader broker (handles all reads and writes) and zero or more follower brokers (replicate the data for fault tolerance). If the leader fails, a follower is elected as the new leader. The replication factor (typically 3) determines how many copies of each partition exist.",
    "Consumer groups enable scalable, parallel consumption. Each consumer in a group is assigned a subset of partitions — no two consumers in the same group read the same partition. If a consumer fails, its partitions are reassigned to other consumers in the group (rebalancing). Different consumer groups are independent — each gets its own view of the entire topic. This supports both queue semantics (one group, each message processed once) and pub/sub (multiple groups, each gets all messages).",
    "Kafka retains messages for a configurable retention period (default 7 days) regardless of whether they've been consumed. This is fundamentally different from traditional message queues (RabbitMQ, SQS) where messages are deleted after consumption. Retention enables consumers to replay data, rebuild state, or catch up after a crash.",
  ],
  deepDive: [
    "Kafka's performance comes from sequential disk I/O and zero-copy transfers. Messages are written to disk in append-only segments. Reads are sequential scans, which are extremely fast on modern disks (600 MB/s+ for sequential vs 100 IOPS for random). The sendfile() system call transfers data directly from the disk page cache to the network socket, avoiding copies through user space (zero-copy).",
    "The ISR (In-Sync Replicas) set determines durability guarantees. A follower is in the ISR if it's fully caught up with the leader (within replica.lag.time.max.ms). When a producer sets acks=all, the write is only acknowledged after all ISR members have replicated it. If a broker falls out of the ISR, the leader removes it to maintain write latency. The min.insync.replicas setting prevents writes when too few replicas are in sync — with replication.factor=3 and min.insync.replicas=2, writes fail if fewer than 2 replicas are available.",
    "Compacted topics retain the latest value for each key, discarding older versions. Instead of time-based retention, the compaction process removes old duplicates, keeping only the most recent message per key. This makes compacted topics function like a changelog or key-value store — perfect for storing the latest state of entities (user profiles, configurations, CDC snapshots).",
    "Kafka Streams and ksqlDB build stream processing on top of the core broker. Kafka Streams is a Java library for building stateful streaming applications (windowed aggregations, joins, exactly-once processing). ksqlDB provides a SQL-like interface for querying streams. Kafka Connect provides standardized connectors for moving data between Kafka and external systems (databases, S3, Elasticsearch).",
  ],
  code: [
    {
      language: "java",
      caption: "Kafka Producer — sending messages to a topic",
      source: `Properties props = new Properties();
props.put("bootstrap.servers", "broker1:9092,broker2:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("acks", "all");              // Wait for all ISR replicas
props.put("retries", 3);              // Retry on transient failures
props.put("enable.idempotence", true); // Exactly-once per partition

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Key determines partition assignment (same key → same partition → ordered)
ProducerRecord<String, String> record = new ProducerRecord<>(
    "user-events",           // topic
    "user-123",              // key (all events for user-123 go to same partition)
    "{\\"action\\":\\"login\\"}"  // value
);

// Async send with callback
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        System.err.println("Send failed: " + exception.getMessage());
    } else {
        System.out.printf("Sent to partition %d offset %d%n",
            metadata.partition(), metadata.offset());
    }
});

producer.flush();
producer.close();`,
    },
    {
      language: "java",
      caption: "Kafka Consumer — reading from a topic with a consumer group",
      source: `Properties props = new Properties();
props.put("bootstrap.servers", "broker1:9092");
props.put("group.id", "order-processor");     // Consumer group
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("auto.offset.reset", "earliest");   // Start from beginning if no committed offset
props.put("enable.auto.commit", false);        // Manual offset commit for reliability

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Collections.singletonList("user-events"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        System.out.printf("Partition: %d, Offset: %d, Key: %s, Value: %s%n",
            record.partition(), record.offset(), record.key(), record.value());
        processEvent(record.value());
    }
    consumer.commitSync(); // Commit after processing (at-least-once)
}`,
    },
  ],
  diagrams: [
    {
      title: "Kafka Cluster Architecture",
      kind: "architecture",
      caption: "Producers write to partition leaders on brokers. Followers replicate for durability. Consumer groups read independently, each maintaining their own offsets.",
      mermaid: `graph LR
    subgraph Producers["Producers"]
      P1["Producer A\nkey-based routing"]
      P2["Producer B\nround-robin"]
    end
    subgraph Cluster["Kafka Cluster - 3 Brokers"]
      B1["Broker 1\nTopic A P0 leader\nTopic A P1 follower"]
      B2["Broker 2\nTopic A P1 leader\nTopic A P0 follower"]
      B3["Broker 3\nTopic A P2 leader\nmetadata backup"]
    end
    subgraph CG1["Consumer Group 1"]
      C1["Consumer 1\nreads P0"]
      C2["Consumer 2\nreads P1"]
      C3["Consumer 3\nreads P2"]
    end
    subgraph CG2["Consumer Group 2"]
      C4["Consumer X\nreads all partitions"]
    end
    P1 -->|append to leader| B1
    P2 -->|append to leader| B2
    B1 <-->|replicate| B2
    B2 <-->|replicate| B3
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B1 --> C4`,
    },
    {
      title: "Producer Message Delivery Flow",
      kind: "sequence",
      caption: "A producer sends a message with acks=all. The leader appends to the log, ISR followers replicate, and the ack is returned only after all ISR members confirm.",
      mermaid: `sequenceDiagram
    participant Prod as Producer
    participant Lead as Partition Leader
    participant F1 as Follower 1 ISR
    participant F2 as Follower 2 ISR
    Prod->>Lead: send message key=user-123
    Lead->>Lead: append to log at offset N
    Lead->>F1: replicate offset N
    Lead->>F2: replicate offset N
    F1-->>Lead: ack replicated
    F2-->>Lead: ack replicated
    Lead-->>Prod: ack offset N
    Note over Prod,Lead: acks=all ensures all ISR replicas\nhave the message before ack`,
    },
    {
      title: "Consumer Group Partition Assignment",
      kind: "network",
      caption: "Each partition is assigned to exactly one consumer in a group. Adding or removing consumers triggers a rebalance that redistributes partitions.",
      mermaid: `graph TD
    subgraph Topic["Topic: user-events - 6 Partitions"]
      P0["P0"]
      P1["P1"]
      P2["P2"]
      P3["P3"]
      P4["P4"]
      P5["P5"]
    end
    subgraph Group["Consumer Group - 3 Consumers"]
      C1["Consumer 1\nP0 P1"]
      C2["Consumer 2\nP2 P3"]
      C3["Consumer 3\nP4 P5"]
    end
    P0 --> C1
    P1 --> C1
    P2 --> C2
    P3 --> C2
    P4 --> C3
    P5 --> C3
    NOTE["Adding a 4th consumer triggers\nrebalance: 1-2 partitions each\nRemoving a consumer reassigns\nits partitions to survivors"]`,
    },
    {
      title: "Kafka Key Concepts Overview",
      kind: "mindmap",
      caption: "Core Kafka concepts organized by area: storage model, delivery guarantees, retention, and performance optimizations.",
      mermaid: `mindmap
    root((Kafka))
      Storage Model
        Append-only log
        Partitions - units of parallelism
        Offsets - sequential position
        Immutable segments on disk
      Delivery Guarantees
        acks=0 fire and forget
        acks=1 leader only
        acks=all all ISR replicas
        enable.idempotence exactly-once per partition
        ISR in-sync replicas set
      Retention
        Time-based default 7 days
        Size-based byte limit
        Compacted topics keep latest per key
        Consumers can replay from any offset
      Performance
        Sequential disk IO
        Zero-copy sendfile syscall
        Batch compression
        Page cache exploitation`,
    },
  ],
  animations: [
    {
      title: "How Kafka produces and consumes messages",
      steps: [
        { label: "Producer sends message", detail: "Producer serializes the message, computes the partition (hash of key mod partition count), and sends to the leader broker of that partition." },
        { label: "Leader appends to log", detail: "The leader broker appends the message to the end of the partition log on disk and assigns it the next sequential offset." },
        { label: "Followers replicate", detail: "Follower brokers fetch the new message from the leader and append it to their copies. Once all ISR replicas have it, the write is durable." },
        { label: "Producer receives ack", detail: "Based on the acks setting: acks=0 (no wait), acks=1 (leader only), acks=all (all ISR replicas confirmed)." },
        { label: "Consumer polls", detail: "Consumer calls poll(), specifying its last committed offset. The broker returns messages from that offset forward." },
        { label: "Consumer processes", detail: "The application processes each message. Offset is committed after successful processing (at-least-once) or before (at-most-once)." },
        { label: "Offset committed", detail: "The consumer commits its offset to a special __consumer_offsets topic. On restart, it resumes from the committed offset." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Kafka", "RabbitMQ", "AWS SQS"],
    rows: [
      ["Model", "Distributed log", "Message queue / broker", "Managed queue"],
      ["Ordering", "Per-partition", "Per-queue (single consumer)", "Best-effort (FIFO available)"],
      ["Retention", "Time-based (configurable)", "Until consumed + ack", "14 days max"],
      ["Replay", "Yes (seek to any offset)", "No (consumed = deleted)", "No"],
      ["Throughput", "Millions msg/sec", "Tens of thousands msg/sec", "Thousands msg/sec"],
      ["Consumer model", "Pull (consumer polls)", "Push (broker delivers)", "Pull"],
      ["Best for", "Event streaming, logs, ETL", "Task queues, RPC", "Simple cloud queues"],
    ],
  },
  interviewQA: [
    {
      q: "How does Kafka achieve high throughput?",
      a: "Several design decisions: (1) Sequential disk I/O — append-only writes and sequential reads are extremely fast, approaching the throughput of RAM. (2) Zero-copy transfer via sendfile() — data moves directly from the OS page cache to the network socket, bypassing user space. (3) Batching — producers batch messages before sending, amortizing network overhead. (4) Compression — messages are compressed in batches (Snappy, LZ4, zstd), reducing I/O. (5) Partitioning — parallelism across partitions and brokers. (6) No per-message tracking — consumers track their own offsets, so the broker doesn't maintain per-message state.",
      followUps: [
        "What is the page cache and why does Kafka rely on it? (The OS caches recently accessed disk pages in RAM. Kafka leverages this — recently written messages are served from memory without Kafka doing any caching itself.)",
        "How does batching affect latency? (Batching increases latency for individual messages. linger.ms controls how long the producer waits to batch. Set to 0 for lowest latency, higher for better throughput.)",
      ],
    },
    {
      q: "What happens when a Kafka consumer fails?",
      a: "If a consumer in a group crashes, the group coordinator detects the failure (via heartbeat timeout) and triggers a rebalance. The failed consumer's partitions are reassigned to the remaining consumers in the group. The new consumers resume from the last committed offset — messages processed but not committed will be reprocessed (at-least-once semantics). If max.poll.interval.ms expires (consumer is alive but processing is too slow), a rebalance also occurs.",
      followUps: [
        "How do you prevent message loss during rebalancing? (Commit offsets after processing, not before. Use cooperative rebalancing to avoid stopping all consumers during the reassignment.)",
        "What is a sticky assignor? (A partition assignment strategy that minimizes partition movement during rebalances, keeping partitions assigned to the same consumer when possible.)",
      ],
    },
  ],
  followUps: [
    "How does Kafka guarantee exactly-once processing?",
    "What is the difference between acks=0, acks=1, and acks=all?",
    "How does log compaction work and when would you use it?",
    "What is Kafka Connect and how does it differ from writing your own producer/consumer?",
    "How do you choose the number of partitions for a topic?",
  ],
  mcqs: [
    {
      q: "What determines which partition a message is written to?",
      options: [
        "The consumer group",
        "The message offset",
        "The hash of the message key",
        "The broker's available disk space",
      ],
      answerIndex: 2,
      explanation: "If a key is provided, Kafka hashes it and maps it to a partition (hash(key) mod partitions). This ensures all messages with the same key go to the same partition (preserving order per key). If no key is provided, round-robin is used.",
    },
    {
      q: "What happens to messages after they are consumed in Kafka?",
      options: [
        "They are immediately deleted",
        "They are marked for garbage collection",
        "They remain in the log until the retention period expires",
        "They are moved to a dead-letter topic",
      ],
      answerIndex: 2,
      explanation: "Unlike traditional queues, Kafka retains messages regardless of consumption. Messages are deleted only when the retention period expires (time-based) or when compaction removes old duplicates (for compacted topics).",
    },
    {
      q: "With acks=all and min.insync.replicas=2, what happens if only 1 replica is in sync?",
      options: [
        "The write succeeds with a warning",
        "The write fails with NotEnoughReplicasException",
        "The write goes to a different partition",
        "Kafka automatically adds more replicas",
      ],
      answerIndex: 1,
      explanation: "With acks=all, the producer waits for all ISR members to acknowledge. If the ISR has fewer members than min.insync.replicas, the broker rejects the write to protect durability guarantees.",
    },
  ],
  exercises: [
    "Set up a single-node Kafka cluster and create a topic with 3 partitions. Produce 100 messages with keys and observe how they distribute across partitions.",
    "Write a consumer group with 3 consumers for a 6-partition topic. Kill one consumer and observe rebalancing — which partitions get reassigned?",
    "Configure a topic with retention.ms=60000 (1 minute). Produce messages and observe them disappearing after the retention period.",
    "Implement idempotent processing: track processed offsets in a database and skip duplicates after a consumer restart.",
  ],
  flashcards: [
    { front: "What is a Kafka partition?", back: "An ordered, immutable, append-only log within a topic. The unit of parallelism and ordering. Each partition has one leader and zero or more followers." },
    { front: "What is a consumer group?", back: "A set of consumers that cooperatively consume a topic. Each partition is assigned to exactly one consumer in the group. Different groups are independent." },
    { front: "What is an offset?", back: "A sequential number assigned to each message within a partition. Consumers track their position by committing offsets." },
    { front: "acks=all", back: "Producer waits for all in-sync replicas to acknowledge the write. Strongest durability guarantee. Slower than acks=0 or acks=1." },
    { front: "What is ISR?", back: "In-Sync Replicas — the set of replicas that are fully caught up with the leader. Only ISR members can be elected leader." },
  ],
  revisionNotes: [
    "Kafka = distributed, append-only commit log. Not a queue — messages are retained, not deleted on consumption.",
    "Topic → Partitions → Messages (with offsets). Partition = unit of ordering and parallelism.",
    "Producer: key → hash → partition. Same key → same partition → ordered.",
    "Consumer group: each partition assigned to exactly one consumer. Rebalance on join/leave/fail.",
    "Replication: leader handles reads/writes, followers replicate. ISR = in-sync replicas.",
    "acks: 0 (fire-and-forget), 1 (leader only), all (all ISR). acks=all + min.insync.replicas=2 = durable.",
    "Retention: time-based (default 7 days) or log compaction (keep latest per key).",
  ],
  cheatSheet: [
    "kafka-topics.sh --create --topic my-topic --partitions 6 --replication-factor 3",
    "kafka-console-producer.sh --topic my-topic --property 'parse.key=true' --property 'key.separator=:'",
    "kafka-console-consumer.sh --topic my-topic --group my-group --from-beginning",
    "kafka-consumer-groups.sh --describe --group my-group (check lag)",
    "Key configs: retention.ms, min.insync.replicas, acks, enable.idempotence",
  ],
  resources: [
    { label: "Kafka: The Definitive Guide (O'Reilly)", kind: "book", note: "Comprehensive Kafka book from Confluent engineers." },
    { label: "Apache Kafka Documentation", kind: "docs", note: "Official docs — thorough on configuration and internals." },
    { label: "The Log: What every software engineer should know (Jay Kreps)", kind: "article", note: "The foundational blog post explaining the log abstraction behind Kafka." },
    { label: "Confluent Developer Tutorials", kind: "video", note: "Hands-on video tutorials for Kafka." },
  ],
  glossary: [
    { term: "Broker", definition: "A Kafka server that stores partitions and serves producer/consumer requests." },
    { term: "Topic", definition: "A named feed of messages, divided into partitions. The primary abstraction for organizing data in Kafka." },
    { term: "Partition", definition: "An ordered, immutable, append-only log. The unit of parallelism and the scope of ordering guarantees." },
    { term: "Offset", definition: "A unique, sequential number assigned to each message in a partition, used by consumers to track their position." },
    { term: "Consumer group", definition: "A group of consumers that share the work of reading from a topic. Each partition is assigned to exactly one consumer in the group." },
    { term: "ISR", definition: "In-Sync Replicas — the set of replicas that have fully replicated the leader's log. Only ISR members can become the new leader." },
  ],
};
