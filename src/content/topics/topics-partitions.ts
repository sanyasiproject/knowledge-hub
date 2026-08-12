import type { TopicContent } from "../types";

export const topicsPartitions: TopicContent = {
  quickSummary: [
    "A Kafka topic is a logical channel for events, divided into partitions -- ordered, immutable, append-only logs that are the unit of parallelism and replication.",
    "Messages with the same partition key always go to the same partition, guaranteeing ordering per key. Without a key, messages are distributed via sticky partitioning.",
    "The number of partitions determines the maximum consumer parallelism within a consumer group -- you cannot have more active consumers than partitions.",
    "Hot partitions occur when a skewed key distribution causes one partition to receive disproportionate traffic, creating a bottleneck.",
  ],
  detailed: [
    "A Kafka topic is a named feed of records. Producers write to topics, and consumers read from them. Under the hood, a topic is split into one or more partitions, each hosted on a specific broker. Each partition is an ordered, append-only commit log. Records within a partition are assigned a sequential offset starting from 0. Ordering is guaranteed only within a single partition, not across partitions of the same topic.",
    "The partition key determines which partition receives a given message. The default partitioner computes hash(key) % numPartitions using the murmur2 algorithm. Messages with the same key always land in the same partition (assuming partition count does not change), which guarantees ordering for that key. Common partition keys include user ID, order ID, device ID, or tenant ID -- any entity whose events must be processed in order. If no key is provided, the producer distributes messages across partitions using sticky partitioning (batches go to a single partition, then rotate) for better batching efficiency.",
    "Choosing the right number of partitions is critical. Too few partitions limit throughput because consumer parallelism is capped at the partition count. Too many partitions increase metadata overhead, lengthen leader election times, increase end-to-end latency, and consume more file handles and memory on brokers. A common heuristic: partitions = max(T/Cp, T/Pp) where T is target throughput, Cp is per-consumer throughput, and Pp is per-producer throughput. Start with the number of brokers as a baseline, then adjust.",
    "Partition rebalancing occurs when the partition count changes or when consumer group membership changes. Increasing partition count is straightforward (kafka-topics --alter), but it breaks key-based ordering guarantees for existing keys because the hash-to-partition mapping changes. Decreasing partition count is not supported -- you must create a new topic and migrate data.",
    "Hot partitions arise when partition key distribution is heavily skewed. For example, if 80% of orders come from 5% of customers and customer ID is the partition key, a few partitions handle most of the traffic while others sit idle. Solutions include: composite keys (customerId + date), salted keys (append a random suffix, but breaks strict ordering), custom partitioners, or repartitioning with finer-grained keys.",
    "Kafka partitions are the unit of replication. Each partition has one leader replica (handles all reads and writes) and zero or more follower replicas. The replication factor is set per topic (typically 3 in production). Followers that are caught up form the In-Sync Replica set (ISR). Writes with acks=all succeed only when all ISR members acknowledge.",
  ],
  deepDive: [
    "The default partitioner in Kafka clients (since KIP-480, Kafka 2.4+) uses sticky partitioning for null keys. Instead of round-robin per message, it sends an entire batch to one partition, then switches to another. This improves batching efficiency and reduces the number of smaller produce requests. For keyed messages, it uses murmur2 hash of the key bytes modulo the partition count. The murmur2 algorithm is deterministic and consistent across all client languages.",
    "Partition count cannot be decreased because existing data is stored in numbered partition directories (topic-0, topic-1, ..., topic-N). The log segments, offsets, and consumer group state are all tied to specific partition numbers. Removing a partition would orphan its data and invalidate consumer offsets. The only way to reduce partitions is to create a new topic with fewer partitions and use MirrorMaker or Kafka Connect to migrate the data.",
    "Compacted topics use a different partitioning consideration. In log compaction, Kafka retains only the latest value for each key within a partition. Keys are mandatory for compacted topics. Since compaction is per-partition, all values for a key must be in the same partition for compaction to correctly retain only the latest value. This is naturally ensured by key-based partitioning.",
    "Cross-partition ordering is a common challenge. If events for a business process span multiple entities (e.g., an order involves a customer, a product, and a payment), you cannot guarantee ordering across all three if they have different partition keys. Solutions include: using a single partition (kills parallelism), using a coarse-grained key (e.g., tenant ID), or accepting eventual consistency with event timestamps and application-level reordering.",
    "The impact of partition count on availability: when a broker fails, all partitions where it was the leader need new leaders. With more partitions, leader election takes longer (each partition's election is handled sequentially by the controller). In a 10,000-partition cluster, a broker failure can cause 10+ seconds of unavailability for affected partitions. KRaft mode improves this with batched metadata updates, but the fundamental tradeoff remains. The recommended upper bound is approximately 4,000 partitions per broker.",
  ],
  code: [
    {
      language: "java",
      caption: "Producing with explicit partition keys for ordering guarantees",
      source: [
        "Properties props = new Properties();",
        "props.put(\"bootstrap.servers\", \"localhost:9092\");",
        "props.put(\"key.serializer\", \"org.apache.kafka.common.serialization.StringSerializer\");",
        "props.put(\"value.serializer\", \"org.apache.kafka.common.serialization.StringSerializer\");",
        "props.put(\"acks\", \"all\");",
        "",
        "KafkaProducer<String, String> producer = new KafkaProducer<>(props);",
        "",
        "// All events for the same orderId go to the same partition",
        "// guaranteeing order: Created -> Paid -> Shipped -> Delivered",
        "String orderId = \"order-12345\";",
        "",
        "producer.send(new ProducerRecord<>(\"order-events\", orderId,",
        "    \"{\\\"type\\\":\\\"OrderCreated\\\",\\\"orderId\\\":\\\"order-12345\\\"}\"));",
        "producer.send(new ProducerRecord<>(\"order-events\", orderId,",
        "    \"{\\\"type\\\":\\\"OrderPaid\\\",\\\"orderId\\\":\\\"order-12345\\\"}\"));",
        "producer.send(new ProducerRecord<>(\"order-events\", orderId,",
        "    \"{\\\"type\\\":\\\"OrderShipped\\\",\\\"orderId\\\":\\\"order-12345\\\"}\"));",
        "",
        "// Different order goes to (potentially) a different partition",
        "String otherOrderId = \"order-67890\";",
        "producer.send(new ProducerRecord<>(\"order-events\", otherOrderId,",
        "    \"{\\\"type\\\":\\\"OrderCreated\\\",\\\"orderId\\\":\\\"order-67890\\\"}\"));",
        "",
        "producer.flush();",
      ].join("\n"),
    },
    {
      language: "java",
      caption: "Custom partitioner to handle hot keys by spreading across partitions",
      source: [
        "import org.apache.kafka.clients.producer.Partitioner;",
        "import org.apache.kafka.common.Cluster;",
        "import java.util.Map;",
        "import java.util.Set;",
        "import java.util.concurrent.ThreadLocalRandom;",
        "",
        "public class HotKeyAwarePartitioner implements Partitioner {",
        "    private Set<String> hotKeys;",
        "",
        "    @Override",
        "    public void configure(Map<String, ?> configs) {",
        "        hotKeys = Set.of(\"tenant-mega-corp\", \"tenant-big-co\");",
        "    }",
        "",
        "    @Override",
        "    public int partition(String topic, Object key, byte[] keyBytes,",
        "                         Object value, byte[] valueBytes, Cluster cluster) {",
        "        int numPartitions = cluster.partitionCountForTopic(topic);",
        "",
        "        if (key == null) {",
        "            return ThreadLocalRandom.current().nextInt(numPartitions);",
        "        }",
        "",
        "        String keyStr = (String) key;",
        "        if (hotKeys.contains(keyStr)) {",
        "            // Spread hot keys across a subset of partitions",
        "            int subPartition = Math.abs(valueBytes.hashCode()) % 4;",
        "            int basePartition = Math.abs(keyStr.hashCode()) % numPartitions;",
        "            return (basePartition + subPartition) % numPartitions;",
        "        }",
        "",
        "        // Default: murmur2 hash",
        "        return (Math.abs(org.apache.kafka.common.utils.Utils",
        "            .murmur2(keyBytes)) % numPartitions);",
        "    }",
        "",
        "    @Override",
        "    public void close() {}",
        "}",
      ].join("\n"),
    },
    {
      language: "cpp",
      caption: "Inspecting topic partitions and consuming from a specific partition (librdkafka)",
      source: [
        "#include <iostream>",
        "#include <string>",
        "#include <librdkafka/rdkafkacpp.h>",
        "",
        "int main() {",
        "    std::string errstr;",
        "",
        "    // Create admin client configuration",
        "    RdKafka::Conf* conf = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);",
        "    conf->set(\"bootstrap.servers\", \"localhost:9092\", errstr);",
        "",
        "    // --- Inspect topic metadata ---",
        "    RdKafka::Producer* producer = RdKafka::Producer::create(conf, errstr);",
        "    RdKafka::Metadata* metadata = nullptr;",
        "    producer->metadata(true, nullptr, &metadata, 5000);",
        "",
        "    for (const auto* topic : *metadata->topics()) {",
        "        if (topic->topic() == \"order-events\") {",
        "            std::cout << \"Topic: \" << topic->topic() << \"\\n\";",
        "            for (const auto* part : *topic->partitions()) {",
        "                std::cout << \"  Partition \" << part->id()",
        "                          << \": leader=\" << part->leader()",
        "                          << \", replicas=[\";",
        "                for (auto r : *part->replicas()) std::cout << r << \" \";",
        "                std::cout << \"], isr=[\";",
        "                for (auto i : *part->isrs()) std::cout << i << \" \";",
        "                std::cout << \"]\\n\";",
        "            }",
        "        }",
        "    }",
        "    delete metadata;",
        "    delete producer;",
        "",
        "    // --- Manual partition assignment for targeted consumption ---",
        "    conf->set(\"group.id\", \"\", errstr);",
        "    conf->set(\"auto.offset.reset\", \"earliest\", errstr);",
        "",
        "    RdKafka::KafkaConsumer* consumer = RdKafka::KafkaConsumer::create(conf, errstr);",
        "    delete conf;",
        "",
        "    // Read only from partition 0",
        "    std::vector<RdKafka::TopicPartition*> partitions;",
        "    partitions.push_back(",
        "        RdKafka::TopicPartition::create(\"order-events\", 0,",
        "            RdKafka::Topic::OFFSET_BEGINNING));",
        "    consumer->assign(partitions);",
        "",
        "    int count = 0;",
        "    while (count < 100) {",
        "        RdKafka::Message* msg = consumer->consume(1000);",
        "        if (msg->err() == RdKafka::ERR_NO_ERROR) {",
        "            std::cout << \"Partition \" << msg->partition()",
        "                      << \", Offset \" << msg->offset()",
        "                      << \": \" << (msg->key() ? *msg->key() : \"null\")",
        "                      << \"\\n\";",
        "            ++count;",
        "        }",
        "        delete msg;",
        "    }",
        "",
        "    consumer->close();",
        "    delete consumer;",
        "    for (auto* tp : partitions) delete tp;",
        "}",
      ].join("\n"),
    },
  ],
  diagrams: [
    {
      title: "Kafka Topics and Partitions Layout",
      kind: "architecture",
      caption: "How a Kafka topic is divided into partitions distributed across brokers for parallelism.",
      mermaid: `graph TD
    Topic["Topic: orders"] --> P0["Partition 0
Broker 1"]
    Topic --> P1["Partition 1
Broker 2"]
    Topic --> P2["Partition 2
Broker 3"]
    P0 --> R0["Replica on Broker 2"]
    P1 --> R1["Replica on Broker 3"]
    P2 --> R2["Replica on Broker 1"]
    Prod["Producer"] -->|key hash| P0
    Prod -->|key hash| P1
    CG["Consumer Group"] --> C1["Consumer 1
P0"]
    CG --> C2["Consumer 2
P1"]
    CG --> C3["Consumer 3
P2"]`,
    },
    {
      title: "Producer to Consumer Message Flow",
      kind: "sequence",
      caption: "End-to-end flow of a message from producer through broker partition to consumer.",
      mermaid: `sequenceDiagram
    participant P as Producer
    participant B as Broker Leader
    participant R as Replica
    participant C as Consumer
    P->>B: Produce msg with key
    B->>B: Write to partition log
    B->>R: Replicate to followers
    R-->>B: ACK replication
    B-->>P: ACK to producer
    C->>B: Fetch from offset N
    B-->>C: Return messages
    C->>C: Commit offset N+1`,
    },
    {
      title: "Partition Assignment Flow",
      kind: "flow",
      caption: "How Kafka assigns partitions to consumers in a consumer group on join and rebalance.",
      mermaid: `flowchart TD
    A["New consumer joins group"] --> B["Group coordinator notified"]
    B --> C["Trigger rebalance"]
    C --> D["All consumers rejoin"]
    D --> E["Leader consumer runs
partition assignor"]
    E --> F["Round-robin or sticky
assignment"]
    F --> G["Distribute partition
assignments"]
    G --> H["Consumers resume
from committed offsets"]`,
    },
    {
      title: "Topic Configuration Concepts",
      kind: "mindmap",
      caption: "Key configuration parameters that govern topic behavior, retention, and replication.",
      mermaid: `mindmap
  root((Topic Config))
    Partitions
      Parallelism degree
      Cannot decrease
      Key-based routing
    Replication Factor
      Fault tolerance
      ISR tracking
      Minimum 3 in prod
    Retention
      Time-based
      Size-based
      Compaction
    Segment Size
      Log rolling
      Index granularity`,
    },
  ],
  animations: [
    {
      title: "Message Distribution Across Partitions",
      steps: [
        { label: "Topic created", detail: "Topic 'orders' is created with 4 partitions (P0, P1, P2, P3)." },
        { label: "Keyed message arrives", detail: "Producer sends message with key='user-A'. hash('user-A') % 4 = 2. Message goes to P2." },
        { label: "Same key again", detail: "Another message with key='user-A'. Same hash, same partition P2. Order preserved." },
        { label: "Different key", detail: "Message with key='user-B'. hash('user-B') % 4 = 0. Goes to P0." },
        { label: "Null key (sticky)", detail: "Message with no key. Producer batches it with current sticky partition (P1). Next batch may go to P3." },
        { label: "Partition added", detail: "Admin increases partitions to 6. Now hash('user-A') % 6 = 4. New messages for user-A go to P4, breaking ordering with old messages in P2." },
      ],
    },
  ],
  comparison: {
    columns: ["Factor", "Few Partitions (1-10)", "Many Partitions (100+)"],
    rows: [
      ["Consumer parallelism", "Limited", "High"],
      ["End-to-end latency", "Lower", "Higher (more fetch requests)"],
      ["Leader election time", "Fast", "Slow (sequential per partition)"],
      ["Broker memory usage", "Low", "High (buffers per partition)"],
      ["File handles", "Few", "Many (segment files per partition)"],
      ["Rebalancing speed", "Fast", "Slow"],
      ["Key ordering", "Coarse (fewer buckets)", "Fine (more even distribution)"],
      ["Replication overhead", "Low", "High"],
    ],
  },
  interviewQA: [
    {
      q: "How does Kafka guarantee message ordering?",
      a: "Kafka guarantees ordering only within a single partition. Messages with the same partition key are always routed to the same partition via a deterministic hash, so all events for a given key are strictly ordered. Across partitions, there is no ordering guarantee. If you need global ordering, you must use a single partition, which limits throughput to a single consumer. For most use cases, per-key ordering is sufficient.",
      followUps: [
        "What happens to ordering when you increase the partition count?",
        "How can you achieve cross-partition ordering?",
        "What is the max.in.flight.requests.per.connection setting's impact on ordering?",
      ],
    },
    {
      q: "How do you choose the right number of partitions for a Kafka topic?",
      a: "Consider target throughput, consumer processing speed, and operational overhead. A formula: partitions >= max(targetThroughput / consumerThroughput, targetThroughput / producerThroughput). Start with the number of brokers as a baseline. More partitions increase parallelism but add overhead: more file handles, slower leader elections, higher rebalance times, and more memory per broker. Start conservatively and increase as needed -- you can add partitions but cannot remove them.",
      followUps: [
        "What happens if you have more consumers than partitions?",
        "Can you decrease the number of partitions?",
      ],
    },
    {
      q: "What causes hot partitions and how do you fix them?",
      a: "Hot partitions occur when partition key distribution is skewed -- a few keys receive most of the traffic. For example, a multi-tenant system where one tenant generates 80% of events. Fixes include: composite keys that add a secondary dimension (tenantId + date), salted keys that append a random suffix (spreads load but breaks strict ordering for that key), custom partitioners that explicitly distribute hot keys across multiple partitions, or splitting the hot entity into sub-entities. Monitor per-partition bytes-in and bytes-out metrics to detect skew.",
    },
    {
      q: "What happens when you add partitions to an existing topic?",
      a: "Adding partitions changes the hash-to-partition mapping for keyed messages. A key that previously mapped to partition 2 may now map to partition 5. This breaks ordering guarantees for existing keys because new messages for that key go to a different partition than historical messages. Existing data in old partitions is not moved. Consumer groups will rebalance to assign the new partitions. For compacted topics, adding partitions can cause the same key to exist in multiple partitions, breaking compaction semantics.",
    },
  ],
  followUps: [
    "What happens to ordering when you add partitions to an existing topic?",
    "How do you choose the partition key, and what does a bad choice cost you?",
    "Why does adding consumers beyond the partition count do nothing?",
  ],
  mcqs: [
    {
      q: "What determines which partition a keyed message is sent to in Kafka?",
      options: [
        "Round-robin assignment",
        "The broker with the least load",
        "hash(key) % number_of_partitions",
        "The partition specified in the consumer group",
      ],
      answerIndex: 2,
      explanation: "The default partitioner computes murmur2(key) % numPartitions to deterministically assign keyed messages to partitions.",
    },
    {
      q: "What is the maximum number of active consumers in a consumer group for a topic with 8 partitions?",
      options: ["4", "8", "16", "Unlimited"],
      answerIndex: 1,
      explanation: "Each partition is assigned to exactly one consumer in a group. With 8 partitions, at most 8 consumers can be active; additional consumers sit idle.",
    },
    {
      q: "Can you decrease the number of partitions in a Kafka topic?",
      options: [
        "Yes, with kafka-topics --alter --partitions",
        "Yes, but only if the partitions are empty",
        "No, you must create a new topic and migrate data",
        "Yes, but it requires a cluster restart",
      ],
      answerIndex: 2,
      explanation: "Kafka does not support decreasing partitions because offsets, segment files, and consumer state are tied to partition numbers.",
    },
    {
      q: "What is sticky partitioning in Kafka?",
      options: [
        "Pinning a consumer to a specific partition",
        "Sending all messages in a batch to the same partition for null keys",
        "Preventing partition reassignment during rebalancing",
        "Binding a topic to a specific broker",
      ],
      answerIndex: 1,
      explanation: "Sticky partitioning (KIP-480) sends all null-key messages in a batch to the same partition, improving batching efficiency compared to per-message round-robin.",
    },
    {
      q: "Which scenario causes a hot partition?",
      options: [
        "Too many partitions on one broker",
        "Skewed partition key distribution where a few keys dominate traffic",
        "Setting replication factor too high",
        "Using auto-commit for consumer offsets",
      ],
      answerIndex: 1,
      explanation: "Hot partitions result from key skew. If most messages share a few keys, those keys' partitions receive disproportionate traffic.",
    },
  ],
  flashcards: [
    { front: "Kafka partition", back: "An ordered, immutable, append-only log. Unit of parallelism and replication. Records assigned sequential offsets." },
    { front: "Partition key", back: "Determines partition via hash(key) % numPartitions. Same key = same partition = ordering guaranteed." },
    { front: "Sticky partitioning", back: "For null keys, send entire batch to one partition then rotate. Better batching than per-message round-robin." },
    { front: "Partition count heuristic", back: "partitions >= max(targetThroughput/consumerSpeed, targetThroughput/producerSpeed). Cannot decrease after creation." },
    { front: "Hot partition", back: "Partition receiving disproportionate traffic due to skewed key distribution. Fix with composite keys or custom partitioner." },
    { front: "Adding partitions", back: "Breaks key-to-partition mapping for existing keys. New messages may go to different partitions than historical ones." },
    { front: "Compacted topic partitioning", back: "Keys are mandatory. Compaction retains latest value per key within each partition. Key must stay in same partition." },
    { front: "Max partitions per broker", back: "Recommended ~4000. More causes slow leader elections, high memory/file-handle usage." },
  ],
  revisionNotes: [
    "Topic = logical channel. Partition = physical ordered log. Parallelism = partition count.",
    "Ordering guaranteed only within a partition, not across partitions.",
    "Default partitioner: murmur2(key) % numPartitions. Null key = sticky partitioning.",
    "Cannot decrease partitions. Adding partitions breaks key-based ordering for existing keys.",
    "Max consumers in a group = number of partitions. Extra consumers sit idle.",
    "Hot partition = skewed key distribution. Fix: composite keys, salting, custom partitioner.",
    "Partition count tradeoffs: more = more parallelism but more overhead (memory, file handles, leader election time).",
    "Each partition has 1 leader + N-1 followers. ISR = in-sync replicas. acks=all waits for ISR.",
    "Compacted topics require keys. Compaction is per-partition.",
    "KRaft improves leader election speed for large partition counts vs ZooKeeper.",
  ],
  cheatSheet: [
    "Create topic: kafka-topics --create --topic X --partitions 12 --replication-factor 3",
    "Increase partitions: kafka-topics --alter --topic X --partitions 24",
    "Describe topic: kafka-topics --describe --topic X",
    "Default partitioner: murmur2(keyBytes) % numPartitions",
    "Sticky partitioning: null key -> batch to one partition, rotate per batch",
    "Custom partitioner: implement org.apache.kafka.clients.producer.Partitioner",
    "Hot key fix: composite key (userId + shard), custom partitioner, or salting",
    "Max parallel consumers = partition count",
    "Partition count formula: max(T/Cp, T/Pp) where T=throughput, Cp=consumer rate, Pp=producer rate",
  ],
  resources: [
    { label: "Kafka Documentation - Topics and Partitions", kind: "docs", note: "Official Apache Kafka documentation on topic configuration" },
    { label: "Designing Data-Intensive Applications (Ch. 6)", kind: "book", note: "Martin Kleppmann on partitioning strategies" },
    { label: "KIP-480: Sticky Partitioner", kind: "docs", note: "Design document for the sticky partitioning improvement" },
    { label: "Confluent - How to Choose the Number of Partitions", kind: "article", note: "Practical guidance on partition count selection" },
    { label: "Kafka: The Definitive Guide (Ch. 3)", kind: "book", note: "O'Reilly book covering Kafka producers and partitioning in depth" },
  ],
  glossary: [
    { term: "Partition", definition: "An ordered, append-only log within a Kafka topic. The unit of parallelism and replication." },
    { term: "Offset", definition: "A sequential ID assigned to each record in a partition, starting from 0." },
    { term: "Partition key", definition: "A value used to determine which partition a message is assigned to via hashing." },
    { term: "Sticky partitioning", definition: "Strategy where null-key messages in a batch all go to the same partition, improving batching." },
    { term: "Hot partition", definition: "A partition receiving disproportionate traffic due to skewed key distribution." },
    { term: "Replication factor", definition: "The number of copies of each partition maintained across brokers for fault tolerance." },
    { term: "Leader replica", definition: "The partition replica that handles all read and write requests." },
    { term: "Murmur2", definition: "The hash algorithm used by Kafka's default partitioner, consistent across all client languages." },
  ],
  exercises: [
    "Create a Kafka topic with **4 partitions** and produce 1,000 messages with keys like `user-1` through `user-100`. Write a consumer that logs the **partition assignment** for each key. Verify that all messages for the same key land in the same partition. Then increase partitions to 8 with `kafka-topics --alter` and produce the same keys again -- which keys changed partition? Document the **ordering guarantee breakage**.",
    "Simulate a **hot partition** scenario: create a topic with 6 partitions and produce 10,000 messages where 80% have the key `mega-tenant` and 20% are distributed across 50 other keys. Use `kafka-consumer-groups --describe` and broker metrics to show the imbalance. Then implement a **custom partitioner** that spreads `mega-tenant` across 3 partitions using a composite sub-key, and measure the improvement.",
    "Write a Kafka consumer group with **3 consumers** reading from a topic with 6 partitions. Observe partition assignment via `kafka-consumer-groups --describe`. Then add a 4th consumer and document the **rebalance**: which partitions moved? Remove a consumer and observe again. What happens when you have *more consumers than partitions*?",
    "Design the **partition key strategy** for an e-commerce order processing system. Orders must be processed in sequence per customer, but some customers generate 100x more orders than others. Propose at least two approaches (e.g., *customer ID*, *customer ID + date shard*, *custom partitioner*) and analyze each for ordering guarantees, partition balance, and consumer parallelism.",
    "Set up a **compacted topic** with 3 partitions. Produce multiple values for the same keys over time, then trigger compaction. Verify that only the *latest value per key* survives. Now try adding partitions to the compacted topic and produce a key that previously existed -- show that the same key can now exist in **two different partitions**, breaking compaction semantics. Explain why this is dangerous.",
  ],
};
