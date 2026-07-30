import type { TopicContent } from "../types";

export const faultTolerance: TopicContent = {
  quickSummary: [
    "Fault tolerance is a system's ability to continue operating correctly when components fail. The goal is not to prevent failures but to design systems that tolerate them gracefully.",
    "Failure modes range from simple crash failures (node stops) to omission failures (dropped messages) to Byzantine failures (arbitrary or malicious behavior) — each requires different detection and recovery strategies.",
    "Redundancy is the primary mechanism for fault tolerance: active redundancy processes requests on multiple replicas simultaneously, while passive redundancy promotes a standby when the primary fails.",
    "Graceful degradation allows a system to continue providing reduced functionality rather than failing completely — for example, serving cached data when the database is unavailable.",
  ],
  detailed: [
    `## Failure Modes

**Crash failures** occur when a node stops executing and never recovers (fail-stop) or may later recover (crash-recovery). These are the simplest to handle because the failed node does not produce incorrect outputs — it simply stops. Heartbeat mechanisms and timeout-based failure detectors identify crash failures.

**Omission failures** occur when a node fails to send or receive messages. A send omission means the node processed the request but the response was lost; a receive omission means the node never got the request. Network partitions are a systemic form of omission failure where groups of nodes cannot communicate.

**Timing failures** occur in real-time systems when a node responds outside its specified time bounds — too early or too late. In asynchronous systems (most distributed systems), timing failures are not defined because there are no time bounds.

**Byzantine failures** are the most severe: a node behaves arbitrarily, potentially sending different values to different nodes, lying about its state, or actively trying to subvert the system. Handling Byzantine faults requires specialized protocols (PBFT, BFT) and at least 3f+1 nodes to tolerate f failures.`,

    `## Redundancy Strategies

**Active redundancy (active-active)**: All replicas process every request simultaneously. The system uses the first response or a voting mechanism. Advantages: instant failover with no downtime, simple consistency since all replicas are in the same state. Disadvantages: N times the resource cost, requires deterministic processing or a voting protocol.

**Passive redundancy (active-passive / primary-backup)**: One primary handles all requests and replicates state changes to standby replicas. On primary failure, a standby is promoted. Advantages: lower resource usage since backups do not process requests. Disadvantages: failover latency while the standby catches up with the last replicated state, potential data loss if the primary fails before replicating recent changes.

**Hybrid approaches**: Many real-world systems combine strategies. For example, a database might use synchronous replication to one standby (zero data loss) and asynchronous replication to others (lower latency). Cloud load balancers use active-active across availability zones but active-passive across regions.`,

    `## Failover Strategies

**Cold failover**: The standby is not running. On primary failure, the standby must boot, load state, and begin serving. Failover time is minutes. Used for cost-sensitive non-critical systems.

**Warm failover**: The standby is running and has a recent copy of state but is not processing requests. On failure, it catches up with any missed state changes and begins serving. Failover time is seconds to tens of seconds.

**Hot failover**: The standby is running, fully synchronized (via synchronous replication), and ready to serve immediately. Failover time is sub-second. Used for mission-critical systems where downtime is unacceptable.

**DNS failover** redirects traffic by updating DNS records to point to a healthy endpoint. Simple but limited by DNS TTL (time-to-live) caching — clients may continue using the old address for minutes. Health checks trigger the DNS update, and low TTL values minimize the delay.`,

    `## Replication for Fault Tolerance

**Synchronous replication** ensures the primary does not acknowledge a write until at least one replica has confirmed it. Guarantees zero data loss (RPO=0) but increases write latency. If the replica is unavailable, writes block.

**Asynchronous replication** allows the primary to acknowledge writes immediately and replicate in the background. Lower latency but risks data loss (RPO > 0) if the primary fails before replication completes. The replication lag determines the potential data loss window.

**Semi-synchronous replication** (used in MySQL) waits for at least one replica to acknowledge before confirming to the client, but does not require all replicas. Balances durability and performance. If no replica responds within a timeout, it can fall back to asynchronous mode.

**Quorum-based replication** requires W replicas to acknowledge writes and R replicas to respond to reads, where W + R > N (total replicas). This ensures reads see the latest write. Tuning W and R allows trading read latency for write latency and vice versa.`,

    `## Graceful Degradation

**Circuit breakers** detect when a downstream service is failing and stop sending requests, allowing the failing service to recover. States: Closed (normal operation), Open (requests fail-fast without contacting the service), Half-Open (periodically test if the service has recovered).

**Bulkheads** isolate failures by partitioning resources. If one component's thread pool is exhausted, other components are unaffected because they use separate pools. Named after ship compartments that prevent a hull breach from sinking the entire vessel.

**Fallbacks** provide alternative responses when the primary path fails: serving cached data, returning default values, or switching to a simpler algorithm. The key design decision is what constitutes an acceptable degraded experience.

**Load shedding** deliberately drops low-priority requests during overload to preserve capacity for critical operations. This prevents cascading failures where an overloaded system becomes slower, causing upstream timeouts and retries that further increase load.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between fault tolerance and high availability?",
      a: "Fault tolerance means the system continues operating correctly despite component failures — the user experiences no errors or data loss. High availability means the system is operational for a high percentage of time (e.g., 99.99%) but may have brief outages during failover. A fault-tolerant system is inherently highly available, but a highly available system may not be fully fault-tolerant — for example, a system with hot standby failover is highly available but may lose a few in-flight requests during the switchover.",
      followUps: [
        "How do you calculate availability from MTBF and MTTR?",
        "What is the difference between RPO and RTO?",
      ],
    },
    {
      q: "Explain the circuit breaker pattern and why it prevents cascading failures.",
      a: "A circuit breaker monitors calls to a downstream service and tracks failure rates. When failures exceed a threshold, it trips to the Open state, causing all subsequent calls to fail immediately without contacting the downstream service. This prevents the caller from wasting resources (threads, connections) waiting for timeouts on a failing service, which would otherwise cause the caller itself to become slow, triggering failures upstream in a cascade. After a timeout, the circuit breaker enters Half-Open state and allows a few test requests through — if they succeed, it resets to Closed; if they fail, it stays Open.",
      followUps: [
        "How do you determine the failure threshold for tripping the circuit breaker?",
        "How does the circuit breaker pattern interact with retries?",
      ],
    },
    {
      q: "When would you choose synchronous replication over asynchronous?",
      a: "Choose synchronous replication when zero data loss (RPO=0) is required — financial transactions, order processing, or any system where losing even one committed write is unacceptable. The tradeoff is higher write latency and reduced availability (writes block if the replica is unreachable). Asynchronous replication is appropriate when some data loss is tolerable in exchange for lower latency and higher availability, such as analytics pipelines, logging systems, or social media feeds where a few lost posts during a rare failure are acceptable.",
    },
    {
      q: "How do you handle a split-brain scenario in an active-passive system?",
      a: "Split-brain occurs when both the primary and standby believe they are the active node, typically during a network partition. Solutions include: (1) Fencing — use a shared resource (STONITH/power fencing, disk-based fencing) to forcibly shut down one node. (2) Quorum-based arbitration — a third node or quorum device breaks the tie, and only the side with quorum can be active. (3) Fencing tokens — a monotonically increasing token from a lock service; the storage layer rejects writes from nodes holding an older token. The key principle is that preventing split-brain requires an external authority or mechanism beyond the two nodes themselves.",
    },
  ],
  mcqs: [
    {
      q: "Which failure mode is the most difficult to tolerate?",
      options: [
        "Crash failure",
        "Omission failure",
        "Timing failure",
        "Byzantine failure",
      ],
      answerIndex: 3,
      explanation:
        "Byzantine failures are the most difficult because a node can behave arbitrarily — sending conflicting information to different nodes, lying about its state, or actively sabotaging the protocol. Tolerating f Byzantine faults requires 3f+1 nodes, compared to 2f+1 for crash faults.",
    },
    {
      q: "In quorum-based replication with N=5, W=3, R=3, what property ensures read-your-write consistency?",
      options: [
        "W > N/2",
        "R > N/2",
        "W + R > N",
        "W = R",
      ],
      answerIndex: 2,
      explanation:
        "When W + R > N, the set of nodes that acknowledged the write and the set of nodes responding to the read must overlap by at least one node. That overlapping node guarantees the read sees the latest write.",
    },
    {
      q: "What does a circuit breaker in the 'Open' state do?",
      options: [
        "Forwards all requests to the downstream service",
        "Queues requests until the service recovers",
        "Fails requests immediately without calling the service",
        "Retries requests with exponential backoff",
      ],
      answerIndex: 2,
      explanation:
        "In the Open state, the circuit breaker fails requests immediately (fail-fast) without attempting to contact the downstream service. This prevents resource exhaustion and cascading failures.",
    },
    {
      q: "What is the key difference between hot and warm failover?",
      options: [
        "Hot failover uses DNS; warm failover uses load balancers",
        "Hot standby is fully synchronized; warm standby may need to catch up",
        "Hot failover requires manual intervention; warm does not",
        "Warm failover provides zero data loss; hot does not",
      ],
      answerIndex: 1,
      explanation:
        "A hot standby is fully synchronized via synchronous replication and can serve immediately (sub-second failover). A warm standby has a recent but not necessarily current copy of state and needs time to catch up with missed changes before serving.",
    },
  ],
  flashcards: [
    {
      front: "What are the four failure modes in order of severity?",
      back: "Crash (node stops), Omission (messages lost), Timing (response outside time bounds), Byzantine (arbitrary/malicious behavior). Each successive mode is harder to detect and tolerate.",
    },
    {
      front: "Active-active vs active-passive redundancy",
      back: "Active-active: all replicas process every request, providing instant failover but at N times cost. Active-passive: one primary processes requests and replicates to standby, lower cost but failover latency while standby catches up.",
    },
    {
      front: "What is a bulkhead in fault tolerance?",
      back: "A pattern that isolates resources (thread pools, connection pools, memory) between components so that a failure or resource exhaustion in one does not cascade to others. Named after ship compartments.",
    },
    {
      front: "What is RPO vs RTO?",
      back: "RPO (Recovery Point Objective): maximum acceptable data loss, measured in time. RTO (Recovery Time Objective): maximum acceptable downtime. Synchronous replication achieves RPO=0; hot failover minimizes RTO.",
    },
    {
      front: "What is load shedding?",
      back: "Deliberately dropping low-priority requests during overload to preserve capacity for critical operations. Prevents cascading failures where retries from timed-out requests amplify the overload.",
    },
    {
      front: "What are the three circuit breaker states?",
      back: "Closed (normal, requests flow through), Open (failing fast, no calls to downstream), Half-Open (testing with limited requests to see if the service has recovered).",
    },
    {
      front: "What is STONITH?",
      back: "Shoot The Other Node In The Head — a fencing mechanism that forcibly powers off a node suspected of being the other half of a split-brain, ensuring only one active primary. Common in cluster software like Pacemaker.",
    },
  ],
  glossary: [
    {
      term: "Fault Tolerance",
      definition:
        "A system's ability to continue correct operation despite the failure of one or more components.",
    },
    {
      term: "Byzantine Failure",
      definition:
        "A failure mode where a node behaves arbitrarily — sending incorrect or conflicting information, or acting maliciously.",
    },
    {
      term: "Failover",
      definition:
        "The process of switching to a standby or backup system when the primary system fails. Classified as cold, warm, or hot based on readiness.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A stability pattern that prevents cascading failures by failing fast when a downstream service is unhealthy, giving it time to recover.",
    },
    {
      term: "Replication Lag",
      definition:
        "The delay between a write being committed on the primary and being applied on a replica. In asynchronous replication, this determines the data loss window.",
    },
    {
      term: "Graceful Degradation",
      definition:
        "A design strategy where a system provides reduced but functional service during partial failures rather than failing completely.",
    },
    {
      term: "Fencing",
      definition:
        "A mechanism to prevent split-brain by ensuring that only one node can act as primary, using power control (STONITH), disk reservations, or fencing tokens.",
    },
  ],
};
