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
  deepDive: [
    `## The Anatomy of Cascading Failures

Cascading failures are the **most dangerous failure mode** in distributed systems because they are *self-amplifying*. The typical progression starts when a single node becomes slow or unresponsive. Upstream callers **block on pending requests**, exhausting their own thread pools and connection pools. As these callers become slow, *their* callers experience the same degradation, creating a **domino effect** that can take down an entire service mesh in minutes. The key insight is that a slow service is often *worse* than a dead service: a dead service triggers fast failure detection, while a slow service **ties up resources** across the call chain. This is why patterns like \`circuit breakers\` and \`timeouts\` are critical — they convert slow failures into fast failures, breaking the cascade chain before it propagates. Real-world examples include the **2012 AWS ELB outage**, where a memory leak in one component cascaded through the Elastic Load Balancing control plane, and the **2021 Facebook outage**, where a configuration change triggered a cascade through BGP and DNS infrastructure.`,

    `## Consensus and Leader Election Under Failure

When a primary node fails, the remaining nodes must **agree on a new leader** — a problem that sits at the heart of *distributed consensus*. The **Raft** protocol simplifies this: each node is in one of three states — \`Leader\`, \`Follower\`, or \`Candidate\`. When followers stop receiving heartbeats, they increment their **term number**, transition to \`Candidate\`, and request votes. A candidate wins if it receives votes from a *majority* (quorum) of nodes. Crucially, Raft guarantees that a candidate's log must be **at least as up-to-date** as the majority's, preventing a stale node from becoming leader and losing committed entries. In contrast, **Paxos** separates the roles of \`Proposer\`, \`Acceptor\`, and \`Learner\`, achieving consensus in two phases: *Prepare* (proposer claims a ballot number) and *Accept* (proposer asks acceptors to commit a value). Multi-Paxos optimizes by letting a stable leader skip the Prepare phase for subsequent rounds. The **FLP impossibility result** proves that no deterministic protocol can guarantee consensus in a purely asynchronous system with even one crash failure — real systems work around this with **randomized timeouts** and partial synchrony assumptions.`,

    `## Designing for Failure: Chaos Engineering and Game Days

Building fault-tolerant systems is necessary but insufficient — you must also **verify** that fault tolerance mechanisms work under realistic conditions. *Chaos engineering*, pioneered by Netflix's **Chaos Monkey**, takes this further by **proactively injecting failures** into production systems: killing VMs, introducing network latency, corrupting responses, and simulating entire availability-zone outages. The methodology follows a rigorous scientific process: define a **steady-state hypothesis** (e.g., "p99 latency stays below 200ms"), introduce a **real-world failure event**, observe whether the steady state holds, and iterate on the design. \`Litmus\` and \`Chaos Mesh\` bring this to Kubernetes with declarative fault-injection experiments. **Game days** are scheduled exercises where engineering teams simulate major incidents — database failovers, region evacuations, DDoS attacks — and practice the runbook responses. AWS and Google run these internally, and the practice has spread across the industry. The critical principle is that *untested failover is not failover* — you must regularly exercise every redundancy path, because **stale backups**, **expired certificates on standby nodes**, and **configuration drift** between primary and secondary are common failure modes that only surface during real failover attempts.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Circuit Breaker pattern in C++ with state machine transitions",
      source: `#include <iostream>
#include <chrono>
#include <functional>
#include <stdexcept>
#include <mutex>

enum class CircuitState { CLOSED, OPEN, HALF_OPEN };

class CircuitBreaker {
    CircuitState state_ = CircuitState::CLOSED;
    int failureCount_ = 0;
    int failureThreshold_;
    int successThreshold_;
    int halfOpenSuccesses_ = 0;
    std::chrono::seconds openTimeout_;
    std::chrono::steady_clock::time_point openedAt_;
    mutable std::mutex mu_;

public:
    CircuitBreaker(int failThresh = 5,
                   int successThresh = 3,
                   std::chrono::seconds timeout = std::chrono::seconds(30))
        : failureThreshold_(failThresh),
          successThreshold_(successThresh),
          openTimeout_(timeout) {}

    // Execute a callable through the circuit breaker
    template <typename Func>
    auto execute(Func&& fn) -> decltype(fn()) {
        std::lock_guard<std::mutex> lock(mu_);

        if (state_ == CircuitState::OPEN) {
            auto now = std::chrono::steady_clock::now();
            if (now - openedAt_ >= openTimeout_) {
                // Transition to HALF_OPEN: allow a test request
                state_ = CircuitState::HALF_OPEN;
                halfOpenSuccesses_ = 0;
                std::cout << "[CircuitBreaker] OPEN -> HALF_OPEN\\n";
            } else {
                throw std::runtime_error("Circuit is OPEN — failing fast");
            }
        }

        try {
            auto result = fn();
            onSuccess();
            return result;
        } catch (...) {
            onFailure();
            throw;
        }
    }

private:
    void onSuccess() {
        if (state_ == CircuitState::HALF_OPEN) {
            halfOpenSuccesses_++;
            if (halfOpenSuccesses_ >= successThreshold_) {
                state_ = CircuitState::CLOSED;
                failureCount_ = 0;
                std::cout << "[CircuitBreaker] HALF_OPEN -> CLOSED\\n";
            }
        } else {
            failureCount_ = 0;
        }
    }

    void onFailure() {
        failureCount_++;
        if (state_ == CircuitState::HALF_OPEN) {
            // Any failure in HALF_OPEN reopens the circuit
            state_ = CircuitState::OPEN;
            openedAt_ = std::chrono::steady_clock::now();
            std::cout << "[CircuitBreaker] HALF_OPEN -> OPEN\\n";
        } else if (failureCount_ >= failureThreshold_) {
            state_ = CircuitState::OPEN;
            openedAt_ = std::chrono::steady_clock::now();
            std::cout << "[CircuitBreaker] CLOSED -> OPEN\\n";
        }
    }
};`,
    },
    {
      language: "cpp",
      caption: "Retry with exponential backoff and jitter in C++",
      source: `#include <iostream>
#include <functional>
#include <thread>
#include <chrono>
#include <random>
#include <stdexcept>
#include <cmath>

struct RetryPolicy {
    int maxRetries = 3;
    int baseDelayMs = 100;       // Initial delay in milliseconds
    int maxDelayMs = 10000;      // Cap to prevent excessive waits
    double jitterFactor = 0.5;   // 0.0 = no jitter, 1.0 = full jitter
};

template <typename Func>
auto retryWithBackoff(Func&& fn, const RetryPolicy& policy) -> decltype(fn()) {
    std::mt19937 rng(std::random_device{}());

    for (int attempt = 0; attempt <= policy.maxRetries; ++attempt) {
        try {
            return fn();
        } catch (const std::exception& ex) {
            if (attempt == policy.maxRetries) {
                std::cerr << "[Retry] All " << policy.maxRetries
                          << " retries exhausted. Last error: "
                          << ex.what() << "\\n";
                throw;  // Re-throw after final attempt
            }

            // Exponential backoff: baseDelay * 2^attempt
            int delay = std::min(
                policy.baseDelayMs * static_cast<int>(std::pow(2, attempt)),
                policy.maxDelayMs
            );

            // Add jitter to prevent thundering herd
            std::uniform_int_distribution<int> dist(
                0, static_cast<int>(delay * policy.jitterFactor));
            int jitter = dist(rng);
            int finalDelay = delay + jitter;

            std::cout << "[Retry] Attempt " << (attempt + 1)
                      << " failed: " << ex.what()
                      << " — retrying in " << finalDelay << "ms\\n";

            std::this_thread::sleep_for(
                std::chrono::milliseconds(finalDelay));
        }
    }
    // Unreachable, but satisfies compiler
    throw std::runtime_error("Retry logic error");
}

// Usage example:
// auto result = retryWithBackoff(
//     []() { return callExternalService(); },
//     RetryPolicy{.maxRetries = 5, .baseDelayMs = 200}
// );`,
    },
    {
      language: "typescript",
      caption: "Circuit breaker with retry and bulkhead in Node.js",
      source: `import { setTimeout as sleep } from "node:timers/promises";

// --- Circuit Breaker ---
type CBState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private state: CBState = "CLOSED";
  private failures = 0;
  private halfOpenSuccesses = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly successThreshold = 3,
    private readonly openTimeoutMs = 30_000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt >= this.openTimeoutMs) {
        this.state = "HALF_OPEN";
        this.halfOpenSuccesses = 0;
      } else {
        throw new Error("Circuit is OPEN -- failing fast");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.successThreshold) {
        this.state = "CLOSED";
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure() {
    this.failures++;
    if (
      this.state === "HALF_OPEN" ||
      this.failures >= this.failureThreshold
    ) {
      this.state = "OPEN";
      this.openedAt = Date.now();
    }
  }
}

// --- Retry with Exponential Backoff ---
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 100
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelayMs * 2 ** attempt;
      const jitter = Math.random() * delay * 0.5;
      console.log(\`Retry \${attempt + 1}: waiting \${Math.round(delay + jitter)}ms\`);
      await sleep(delay + jitter);
    }
  }
  throw new Error("unreachable");
}

// --- Bulkhead (concurrency limiter) ---
class Bulkhead {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(private readonly maxConcurrent: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.queue.shift()?.();
    }
  }
}

// --- Compose them together ---
const breaker = new CircuitBreaker(5, 3, 30_000);
const bulkhead = new Bulkhead(10);

async function resilientCall<T>(fn: () => Promise<T>): Promise<T> {
  return bulkhead.execute(() =>
    breaker.execute(() => retryWithBackoff(fn, 3, 200))
  );
}`,
    },
  ],

  diagrams: [
    {
      title: "Circuit Breaker State Machine",
      kind: "state",
      caption: "Transitions between Closed, Open, and Half-Open states based on failure thresholds and recovery probes.",
      mermaid: `stateDiagram-v2
    [*] --> Closed
    Closed --> Open : Failure count reaches threshold
    Open --> HalfOpen : Timeout expires
    HalfOpen --> Closed : Probe succeeds
    HalfOpen --> Open : Probe fails
    Closed --> Closed : Success resets counter
    Open --> Open : Requests fail fast`,
    },
    {
      title: "Active-Passive Failover Architecture",
      kind: "architecture",
      caption: "Active-passive failover topology with health monitor detecting primary failure and triggering failover.",
      mermaid: `graph TB
    Client["Client Requests"] --> LB["Load Balancer"]
    LB --> Primary["Primary Node\nactive"]
    LB -.->|"failover"| Standby["Standby Node\npassive"]
    Primary -->|"sync replication"| Standby
    Primary --> Storage["Shared Storage"]
    Standby --> Storage
    HM["Health Monitor"] -->|"heartbeat"| Primary
    HM -->|"heartbeat"| Standby
    HM -->|"trigger failover"| LB`,
    },
    {
      title: "Retry with Exponential Backoff",
      kind: "flow",
      caption: "Decision flow for retrying failed requests with exponential backoff and jitter to prevent thundering herd.",
      mermaid: `flowchart TD
    A["Send Request"] --> B{Success?}
    B -->|Yes| C["Return Response"]
    B -->|No| D{Retries Exhausted?}
    D -->|Yes| E["Throw or Return Error"]
    D -->|No| F["Calculate delay: base * 2 ^ attempt"]
    F --> G["Add random jitter"]
    G --> H["Wait for delay + jitter"]
    H --> A`,
    },
    {
      title: "Fault Tolerance Patterns Overview",
      kind: "mindmap",
      caption: "Key fault tolerance strategies, failure modes, and resilience patterns at a glance.",
      mermaid: `mindmap
  root((Fault Tolerance))
    Failure Modes
      Crash
      Omission
      Timing
      Byzantine
    Redundancy
      Active-Active
      Active-Passive
      Quorum-based
    Resilience Patterns
      Circuit Breaker
      Bulkhead
      Retry and Backoff
      Load Shedding
      Fallback
    Replication
      Synchronous
      Asynchronous
      Semi-synchronous`,
    },
  ],

  comparison: {
    columns: [
      "Strategy",
      "Failover Time",
      "Data Loss Risk",
      "Resource Cost",
      "Complexity",
      "Best For",
    ],
    rows: [
      [
        "**Cold Failover**",
        "Minutes",
        "High (RPO large)",
        "Low (standby off)",
        "Low",
        "Non-critical, cost-sensitive workloads",
      ],
      [
        "**Warm Failover**",
        "Seconds to tens of seconds",
        "Moderate (async lag)",
        "Medium (standby running)",
        "Medium",
        "Business apps with moderate SLAs",
      ],
      [
        "**Hot Failover**",
        "Sub-second",
        "None (RPO=0)",
        "High (full sync replication)",
        "High",
        "Mission-critical, financial systems",
      ],
      [
        "**Active-Active**",
        "Zero (instant)",
        "None (all replicas current)",
        "Very High (N x resources)",
        "Very High",
        "Global services needing zero downtime",
      ],
      [
        "**DNS Failover**",
        "Minutes (TTL-dependent)",
        "Varies (depends on backend)",
        "Low",
        "Low",
        "Multi-region routing, disaster recovery",
      ],
    ],
  },

  exercises: [
    "**Design a circuit breaker for a microservices gateway**: Implement a circuit breaker that tracks per-service failure rates, supports configurable thresholds, and exposes metrics (state, failure count, last transition time). Consider how to handle *partial failures* where only some endpoints of a service are unhealthy.",
    "**Simulate a cascading failure**: Build a chain of three services (A calls B calls C). Introduce artificial latency in service C and observe how the failure cascades to A. Then add `timeouts`, `circuit breakers`, and `bulkheads` to service B and measure how each pattern mitigates the cascade.",
    "**Implement quorum-based replication**: Create a simple key-value store replicated across 5 nodes. Implement configurable *W* (write quorum) and *R* (read quorum) parameters. Verify that reads return the latest write when `W + R > N`, and demonstrate a stale read when `W + R <= N`.",
    "**Build a chaos testing harness**: Write a test framework that can inject failures into a distributed application: random process kills, network partition simulation (using `iptables` or traffic control), and artificial latency injection. Use it to validate that your application's failover mechanisms work correctly under each failure type.",
    "**Compare retry strategies under load**: Implement three retry strategies — *fixed delay*, *exponential backoff*, and *exponential backoff with jitter*. Simulate 100 concurrent clients retrying against a service that recovers after 10 seconds. Measure and compare the **thundering herd** effect, total request volume, and time to recovery for each strategy.",
  ],

  cheatSheet: [
    "**Circuit Breaker States**: `Closed` (normal) -> `Open` (fail-fast after threshold breached) -> `Half-Open` (probe with limited requests) -> back to `Closed` on success or `Open` on failure.",
    "**Quorum Formula**: For *N* replicas, set write quorum *W* and read quorum *R* such that `W + R > N` to guarantee **read-your-write consistency**. Common config: `N=3, W=2, R=2`.",
    "**Exponential Backoff**: Delay = `base * 2^attempt + random_jitter`. Always add **jitter** to prevent *thundering herd* when many clients retry simultaneously.",
    "**Availability Formula**: `A = MTBF / (MTBF + MTTR)`. To improve availability, either *increase* **MTBF** (reduce failure frequency) or *decrease* **MTTR** (recover faster).",
    "**Byzantine Fault Tolerance**: Requires `3f + 1` nodes to tolerate *f* Byzantine faults. Crash fault tolerance requires only `2f + 1` nodes for *f* failures.",
    "**Bulkhead Sizing**: Allocate separate **thread pools** or **connection pools** per downstream dependency. Size each pool to the dependency's expected concurrency + headroom; never share a single pool across unrelated dependencies.",
  ],

  revisionNotes: [
    "A **slow service is worse than a dead service** for cascading failures: dead services trigger fast detection, while slow services tie up caller resources (threads, connections) across the entire call chain. Always pair timeouts with circuit breakers.",
    "The **FLP impossibility result** proves no deterministic consensus protocol can guarantee termination in an asynchronous system with even one crash failure. Real protocols (Raft, Paxos) use *randomized timeouts* and partial synchrony to work around this theoretical limit.",
    "**Untested failover is not failover** — configuration drift, expired certificates on standby nodes, and stale backups are common issues that only surface during actual failover. Run regular **game days** and chaos experiments to validate every redundancy path.",
    "**Retry storms** are a form of cascading failure: when a service goes down, all clients retry with the same delay, creating periodic load spikes that prevent recovery. **Exponential backoff with jitter** spreads retries over time, and **circuit breakers** stop retries entirely when the service is confirmed down.",
    "**RPO** (Recovery Point Objective) measures maximum tolerable *data loss*; **RTO** (Recovery Time Objective) measures maximum tolerable *downtime*. Synchronous replication achieves `RPO=0`; hot failover minimizes RTO. These two metrics drive the choice of replication and failover strategy.",
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
