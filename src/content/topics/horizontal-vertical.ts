import type { TopicContent } from "../types";

export const horizontalVertical: TopicContent = {
  quickSummary: [
    "Vertical scaling (scale-up) adds more resources (CPU, RAM, faster disks) to a single machine; horizontal scaling (scale-out) adds more machines to distribute the workload.",
    "Horizontal scaling requires stateless application design so that any instance can handle any request without depending on local state from previous requests.",
    "Session affinity (sticky sessions) pins a user to a specific instance, simplifying stateful interactions but reducing the benefits of horizontal scaling.",
    "Most production architectures combine both: vertically scale individual nodes to a cost-effective point, then scale horizontally for capacity beyond that.",
  ],
  detailed: [
    `## Vertical Scaling (Scale-Up)

Vertical scaling increases the capacity of a single machine:

- Add more CPU cores or upgrade to faster processors.
- Increase RAM.
- Replace HDDs with SSDs or NVMe drives.
- Upgrade network interfaces.

**Advantages**:
- **Simplicity**: no distributed systems complexity. One machine, one process, one database.
- **Strong consistency**: no need for distributed coordination or consensus.
- **Low latency**: no network hops between components.

**Limitations**:
- **Hardware ceiling**: there is a maximum size for a single machine (e.g., AWS u-24tb1.metal: 448 vCPUs, 24 TB RAM). Beyond this, you must scale out.
- **Single point of failure**: one machine means one failure domain unless paired with a standby.
- **Cost curve**: high-end hardware has non-linear pricing — doubling capacity often costs 3-4x.
- **Downtime for upgrades**: scaling up often requires stopping and restarting the instance.`,

    `## Horizontal Scaling (Scale-Out)

Horizontal scaling adds more instances to share the workload:

- Deploy multiple application servers behind a load balancer.
- Shard databases across multiple nodes.
- Distribute queue consumers across workers.

**Advantages**:
- **Near-linear scalability**: adding instances proportionally increases capacity (in theory).
- **Fault tolerance**: losing one instance does not take down the system.
- **Cost efficiency**: commodity hardware is cheaper per unit of compute than high-end single machines.
- **Rolling upgrades**: update instances one at a time with zero downtime.

**Challenges**:
- **State management**: local state (sessions, caches, file uploads) must be externalized.
- **Data consistency**: distributed databases require trade-offs (CAP theorem).
- **Operational complexity**: more instances mean more monitoring, deployment, and networking.
- **Non-trivial bottlenecks**: shared resources (database, message queue) can become the new bottleneck.`,

    `## Stateless Design for Horizontal Scaling

Stateless services treat each request independently, storing no per-client state locally:

- **Sessions**: store in Redis, Memcached, or a database — not in process memory.
- **File uploads**: write to object storage (S3, GCS) — not to local disk.
- **Caches**: use distributed caches (Redis, Memcached) — not in-process caches for shared data.
- **Configuration**: load from a config service or environment variables — not from local files that vary per instance.

The stateless rule is not absolute: in-process caches for immutable or rarely-changing data (e.g., feature flags refreshed every 60 seconds) are fine because inconsistency is bounded and temporary.

**12-Factor App** principles codify stateless design: processes are disposable, share-nothing, and treat backing services as attached resources.`,

    `## Session Affinity (Sticky Sessions)

Session affinity routes all requests from a user to the same backend instance, typically using a cookie or source IP hash:

**When it helps**:
- Legacy applications that store session state in process memory.
- WebSocket connections that must remain on the same server.
- In-memory caches that benefit from request locality (cache warming).

**Why it hurts horizontal scaling**:
- **Uneven load distribution**: popular users or long sessions can overload specific instances.
- **Failure impact**: if the sticky instance dies, the user loses their session (unless externalized anyway).
- **Scaling friction**: new instances receive no traffic from existing sessions, leading to cold-start inefficiency.
- **Deployment complexity**: rolling updates must drain sessions before retiring old instances.

Best practice: externalize state and eliminate the need for session affinity entirely. Use sticky sessions only as a transitional measure while migrating to stateless design.`,

    `## Choosing Between Scale-Up and Scale-Out

| Factor | Favor Scale-Up | Favor Scale-Out |
|--------|---------------|-----------------|
| Workload | CPU-bound, single-threaded | I/O-bound, parallelizable |
| Data model | Strong consistency required | Eventually consistent acceptable |
| Team maturity | Small team, simple ops | Team experienced with distributed systems |
| Budget | Small-medium workloads | Large workloads where commodity hardware is cheaper |
| Availability | Can tolerate brief downtime | Requires high availability |
| Database | Relational with complex joins | Document/key-value, already shardable |

In practice, most systems use a hybrid approach:

1. Scale up each instance to a cost-effective size (e.g., 8-16 vCPUs).
2. Scale out horizontally for capacity beyond a single instance.
3. Keep the database vertically scaled as long as possible (it is the hardest to shard).
4. Use read replicas as a middle ground for read-heavy database workloads.`,
  ],
  interviewQA: [
    {
      q: "What is the main prerequisite for horizontal scaling, and how do you achieve it?",
      a: "The main prerequisite is stateless application design. Each instance must be able to handle any request without depending on local state from previous requests. Achieve this by externalizing all state: store sessions in Redis or a database, write uploads to object storage, use distributed caches for shared data, and load configuration from environment variables or a config service. The 12-Factor App methodology codifies these practices.",
    },
    {
      q: "When would you recommend vertical scaling over horizontal scaling?",
      a: "Vertical scaling is preferable when the workload is CPU-bound and single-threaded (cannot parallelize), when strong consistency is a hard requirement (avoiding distributed coordination), when the team is small and lacks distributed systems expertise, or when current load fits within a single machine's capacity with adequate headroom. It is also often the right first step: scale up until cost becomes non-linear, then scale out. Databases in particular benefit from staying vertically scaled as long as possible since sharding adds significant complexity.",
    },
    {
      q: "What are the problems with sticky sessions and how would you eliminate them?",
      a: "Sticky sessions cause uneven load distribution (popular users overload specific instances), increase failure impact (user loses session when instance dies), create scaling friction (new instances get no existing traffic), and complicate deployments (must drain sessions before retiring instances). Eliminate them by externalizing all session state to a shared store like Redis with TTL-based expiration. This makes instances truly interchangeable, enabling even load distribution and seamless instance replacement.",
    },
    {
      q: "Why is the database often the bottleneck in horizontally scaled architectures?",
      a: "Application servers are stateless and easy to scale horizontally, but the database holds state and must maintain consistency. Adding app servers increases database connection pressure and query load. Sharding the database adds significant complexity (cross-shard queries, resharding, distributed transactions). Read replicas help with read-heavy workloads but do not solve write bottlenecks. This is why teams vertically scale the database as long as possible and invest heavily in caching to reduce database load before resorting to sharding.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary disadvantage of vertical scaling?",
      options: [
        "It requires stateless design",
        "It has a hardware ceiling and non-linear cost",
        "It introduces distributed systems complexity",
        "It requires a load balancer",
      ],
      answerIndex: 1,
      explanation:
        "Vertical scaling is limited by the maximum available hardware and becomes disproportionately expensive at the high end — doubling capacity often costs 3-4x rather than 2x.",
    },
    {
      q: "Which of the following violates stateless design principles?",
      options: [
        "Storing sessions in Redis",
        "Writing uploads to S3",
        "Caching user sessions in process memory",
        "Loading config from environment variables",
      ],
      answerIndex: 2,
      explanation:
        "Storing user sessions in process memory makes the instance stateful: if the user's next request hits a different instance, their session is lost. Sessions should be stored in an external shared store.",
    },
    {
      q: "What is the main problem with sticky sessions in a horizontally scaled system?",
      options: [
        "They increase network latency",
        "They cause uneven load distribution across instances",
        "They prevent SSL termination",
        "They require more CPU per instance",
      ],
      answerIndex: 1,
      explanation:
        "Sticky sessions pin users to specific instances, which can lead to some instances being overloaded while others are underutilized, defeating the purpose of horizontal scaling.",
    },
    {
      q: "Why is the database typically the last component to be horizontally scaled?",
      options: [
        "Databases do not support clustering",
        "Database licenses are too expensive",
        "Sharding adds significant complexity (distributed transactions, cross-shard queries)",
        "Databases cannot run in containers",
      ],
      answerIndex: 2,
      explanation:
        "Database sharding introduces complex challenges like cross-shard queries, distributed transactions, and resharding. Teams prefer vertical scaling and read replicas as long as possible before resorting to sharding.",
    },
  ],
  flashcards: [
    {
      front: "What is vertical scaling?",
      back: "Adding more resources (CPU, RAM, storage) to a single machine. Simple but limited by hardware ceiling and non-linear cost at the high end.",
    },
    {
      front: "What is horizontal scaling?",
      back: "Adding more machines to distribute workload. Enables near-linear scalability and fault tolerance but requires stateless design and adds operational complexity.",
    },
    {
      front: "What does stateless design mean?",
      back: "Each request is handled independently without relying on local state from previous requests. All shared state is externalized to backing services (Redis, S3, databases).",
    },
    {
      front: "What is session affinity (sticky sessions)?",
      back: "Routing all requests from a user to the same backend instance, typically via cookie or IP hash. Simplifies stateful apps but causes uneven load and increases failure impact.",
    },
    {
      front: "What is the 12-Factor App?",
      back: "A methodology for building cloud-native applications. Key principles include stateless processes, config in environment variables, disposable instances, and backing services as attached resources.",
    },
    {
      front: "When should you prefer vertical over horizontal scaling?",
      back: "When the workload is single-threaded, requires strong consistency, or fits within a single machine. Also when the team is small and lacks distributed systems experience.",
    },
    {
      front: "What is the hybrid scaling approach?",
      back: "Scale up each instance to a cost-effective size, then scale out horizontally for additional capacity. Keep databases vertically scaled as long as possible, adding read replicas before sharding.",
    },
  ],
  glossary: [
    {
      term: "Vertical Scaling (Scale-Up)",
      definition:
        "Increasing capacity by adding more resources to a single machine — more CPU, RAM, or faster storage.",
    },
    {
      term: "Horizontal Scaling (Scale-Out)",
      definition:
        "Increasing capacity by adding more machines to distribute the workload, typically behind a load balancer.",
    },
    {
      term: "Stateless Design",
      definition:
        "An architecture where each request is handled independently, with no per-client state stored locally on the server instance.",
    },
    {
      term: "Session Affinity",
      definition:
        "A load balancing strategy that routes all requests from the same client to the same backend instance, also called sticky sessions.",
    },
    {
      term: "12-Factor App",
      definition:
        "A methodology for building scalable, maintainable cloud-native applications, emphasizing stateless processes, externalized config, and disposable instances.",
    },
    {
      term: "Read Replica",
      definition:
        "A read-only copy of a database that serves read queries, reducing load on the primary and serving as a middle ground before full sharding.",
    },
    {
      term: "Share-Nothing Architecture",
      definition:
        "A design where each node is independent and self-sufficient, sharing no memory or disk storage with other nodes, enabling linear horizontal scalability.",
    },
  ],
};
