import type { TopicContent } from "../types";

export const latencyThroughput: TopicContent = {
  quickSummary: [
    "Latency measures how long a single request takes to complete; throughput measures how many requests the system handles per unit time. They are related but distinct.",
    "Percentile metrics (p50, p95, p99) reveal the distribution of latency rather than just the average, which hides tail latency experienced by a significant fraction of users.",
    "Little's Law (L = lambda * W) relates concurrency, throughput, and latency: the average number of in-flight requests equals arrival rate times average response time.",
    "Queuing theory explains how latency degrades non-linearly as utilization approaches capacity, with wait times growing exponentially past roughly 70-80% utilization.",
  ],
  detailed: [
    `## Latency vs Throughput

**Latency** is the time from when a request is sent to when the response is received. It is usually measured in milliseconds and experienced by individual users.

**Throughput** is the rate of completed requests, measured in requests per second (RPS), transactions per second (TPS), or messages per second.

They are not inverses of each other:

- A system can have low latency and low throughput (fast but handles few requests).
- A system can have high throughput and high latency (batching trades latency for throughput).
- Adding concurrency often increases throughput but may increase latency due to contention.

When optimizing, clarify the goal: reducing p99 latency is a different problem from increasing maximum throughput.`,

    `## Percentile Metrics: p50, p95, p99

Averages are misleading for latency because the distribution is typically long-tailed. Key percentiles:

| Percentile | Meaning | Use |
|------------|---------|-----|
| p50 (median) | Half of requests are faster | General user experience |
| p95 | 95% of requests are faster | Experience of frequent users |
| p99 | 99% of requests are faster | Worst-case for most users |
| p99.9 | 1 in 1000 requests is slower | Critical for high-value transactions |

Why tail latency matters: if a user's page load triggers 50 backend calls in parallel, the probability of hitting at least one p99 event is 1 - (0.99)^50 = 39.5%. At scale, tail latency becomes the typical experience.

**Coordinated omission** is a benchmarking pitfall where the load generator waits for each response before sending the next request, artificially suppressing high percentiles. Tools like wrk2 and Gatling correct for this.`,

    `## Little's Law

Little's Law is a foundational result from queuing theory:

> **L = lambda * W**

Where:
- **L** = average number of requests in the system (concurrency / in-flight requests)
- **lambda** = average arrival rate (throughput, in requests/second)
- **W** = average time a request spends in the system (latency, in seconds)

Practical applications:

- **Capacity planning**: if average latency is 100ms and target throughput is 1000 RPS, you need L = 1000 * 0.1 = 100 concurrent connections.
- **Thread pool sizing**: the required pool size equals the expected concurrency L.
- **Bottleneck detection**: if L is growing while lambda is constant, W must be increasing — something is getting slower.

Little's Law holds for any stable system regardless of arrival distribution, service time distribution, or scheduling discipline. It requires only that the system is in steady state (arrival rate equals departure rate).`,

    `## Queuing Theory and the Hockey Stick

When a server approaches its capacity, latency does not degrade linearly — it follows a hockey stick curve:

For an M/M/1 queue (single server, random arrivals, random service times):

> **W = S / (1 - rho)**

Where S is the service time and rho is utilization (0 to 1).

At 50% utilization, wait time is 2x service time. At 80%, it is 5x. At 95%, it is 20x. This explains why systems that are "only 80% utilized" can still have terrible tail latency.

Implications for system design:

- **Keep utilization below 70-80%** for latency-sensitive services.
- **Use multiple servers**: an M/M/k queue (k servers) has much better latency at high utilization than k independent M/M/1 queues.
- **Avoid head-of-line blocking**: a single slow request in a FIFO queue delays all requests behind it. Use request timeouts and circuit breakers.
- **Auto-scale based on latency**, not just CPU utilization, because latency degrades before CPU saturates.`,

    `## Measurement and Optimization Strategies

**Measuring correctly**:

- Measure latency at the client, not the server, to include network and queue wait time.
- Use HDR Histogram or t-digest for accurate percentile computation with bounded memory.
- Record latency for all requests, including timeouts and errors (which are often the slowest).
- Beware coordinated omission in load tests.

**Reducing latency**:

- **Caching**: eliminate work entirely for repeated requests.
- **Connection pooling**: avoid TCP/TLS handshake overhead per request.
- **Async I/O**: do not block threads waiting for I/O.
- **Hedged requests**: send the same request to multiple replicas and use the first response. Effective for p99 but increases load.
- **Request collapsing**: batch identical in-flight requests into one backend call.

**Increasing throughput**:

- **Horizontal scaling**: add more instances behind a load balancer.
- **Batching**: group multiple items into a single operation (batch writes, bulk API calls).
- **Backpressure**: reject or queue excess requests rather than letting the system collapse.`,
  ],
  interviewQA: [
    {
      q: "Why is average latency a misleading metric, and what should you use instead?",
      a: "Average latency hides the distribution shape. A service with 100ms average might have p50 = 50ms and p99 = 2000ms — most users are fast, but 1% wait 2 seconds. At scale, tail latency matters because fan-out amplifies it: a page making 50 parallel backend calls has a 39.5% chance of hitting at least one p99 event. Use percentiles (p50, p95, p99) to understand the full distribution and set SLOs against percentiles, not averages.",
    },
    {
      q: "Explain Little's Law and give a practical application.",
      a: "Little's Law states L = lambda * W: the average number of in-flight requests (L) equals the arrival rate (lambda) times the average latency (W). For example, if a service handles 500 RPS with 200ms average latency, it has 500 * 0.2 = 100 concurrent requests in-flight. This directly informs thread pool sizing: you need at least 100 threads (or async connections) to sustain that throughput at that latency. It also helps detect problems: if concurrency rises while throughput stays flat, latency must be increasing.",
    },
    {
      q: "Why does latency spike when server utilization exceeds 70-80%?",
      a: "Queuing theory predicts that wait time grows as S/(1-rho), where rho is utilization. This is non-linear: at 50% utilization, wait is 2x service time; at 90%, it is 10x. Beyond 70-80%, small increases in load cause disproportionate latency spikes because requests spend more time waiting in the queue than being served. This is why latency-sensitive services should auto-scale based on latency metrics rather than CPU utilization alone.",
    },
    {
      q: "What are hedged requests and when should you use them?",
      a: "Hedged requests send the same request to multiple replicas simultaneously and use the first response, canceling the rest. This dramatically reduces tail latency because the probability of all replicas being slow is much lower than one being slow. Use them for read-only, idempotent operations where tail latency matters (e.g., serving search results). The trade-off is increased backend load, so apply them selectively to the most latency-sensitive paths.",
    },
  ],
  mcqs: [
    {
      q: "If a service has an average latency of 50ms and processes 2000 RPS, how many requests are in-flight on average?",
      options: ["25", "50", "100", "200"],
      answerIndex: 2,
      explanation:
        "By Little's Law: L = lambda * W = 2000 * 0.05 = 100 concurrent in-flight requests.",
    },
    {
      q: "What is coordinated omission in latency benchmarking?",
      options: [
        "Multiple load generators coordinating their request timing",
        "The load generator waiting for each response before sending the next, hiding queuing delays",
        "Omitting error responses from latency calculations",
        "Coordinating benchmark runs across time zones",
      ],
      answerIndex: 1,
      explanation:
        "Coordinated omission occurs when a closed-loop load generator waits for each response before sending the next request, so slow responses reduce the request rate and artificially lower measured percentiles.",
    },
    {
      q: "At what server utilization does queuing theory predict wait times become problematic?",
      options: ["20-30%", "40-50%", "70-80%", "95-100%"],
      answerIndex: 2,
      explanation:
        "The M/M/1 queuing formula W = S/(1-rho) shows wait times grow non-linearly. Past 70-80% utilization, small load increases cause disproportionate latency spikes.",
    },
    {
      q: "If a page makes 100 parallel backend calls, what is the probability of hitting at least one p99 latency event?",
      options: ["1%", "37%", "63%", "99%"],
      answerIndex: 2,
      explanation:
        "P(at least one p99 event) = 1 - (0.99)^100 = 1 - 0.366 = 63.4%. This demonstrates why tail latency dominates at scale with fan-out.",
    },
  ],
  flashcards: [
    {
      front: "State Little's Law.",
      back: "L = lambda * W. Average in-flight requests (L) = arrival rate (lambda) * average time in system (W). Holds for any stable system regardless of distribution.",
    },
    {
      front: "Why does tail latency matter in fan-out architectures?",
      back: "If a page makes N parallel calls, the probability of hitting at least one slow response is 1-(1-p)^N, which grows quickly. With 50 calls, there is a 39.5% chance of hitting a p99 event.",
    },
    {
      front: "What is the M/M/1 queuing formula for wait time?",
      back: "W = S / (1 - rho), where S is service time and rho is utilization. Wait time grows non-linearly: 2x at 50% util, 5x at 80%, 10x at 90%.",
    },
    {
      front: "What is coordinated omission?",
      back: "A benchmarking flaw where the load generator waits for each response before sending the next, causing slow responses to reduce the request rate and hide queuing delays from percentile measurements.",
    },
    {
      front: "What are hedged requests?",
      back: "Sending the same request to multiple replicas and using the first response. Reduces tail latency but increases backend load. Only suitable for idempotent, read-only operations.",
    },
    {
      front: "How do p50 and p99 differ in what they reveal?",
      back: "p50 (median) shows typical user experience. p99 shows worst-case for 99% of users — the latency that 1 in 100 requests exceeds. p99 often reveals queuing, GC pauses, or contention issues hidden by the median.",
    },
    {
      front: "Why auto-scale on latency rather than CPU?",
      back: "Queuing delays cause latency to degrade before CPU saturates. A service at 70% CPU may already have unacceptable tail latency due to queue buildup.",
    },
  ],
  deepDive: [
    `## The Anatomy of Latency: Where Time Disappears

Latency is not a single number — it is the sum of many components, each of which can dominate under different conditions. A typical web request traverses: **DNS resolution** (1-100ms, cached after first lookup), **TCP handshake** (1 RTT), **TLS handshake** (1-2 RTTs), **request serialization and transmission** (depends on payload size and bandwidth), **server-side processing** (application logic, database queries, external calls), **response transmission**, and **client-side processing**. Understanding this breakdown is essential for optimization.

Server-side latency itself decomposes into **service time** (CPU cycles actually doing work) and **wait time** (time spent in queues, waiting for locks, I/O completion, or thread pool availability). At low load, wait time is negligible. As utilization increases, wait time dominates — a request that takes 5ms of CPU might experience 50ms of queue wait at 90% utilization. This is why optimizing service time alone is insufficient; you must also manage queuing behavior through load shedding, backpressure, and capacity planning.

Network latency has a hard physical floor: the speed of light in fiber optic cable is roughly 200,000 km/s, giving a minimum round-trip time of ~30ms between coasts (US) and ~120ms between continents. **Content Delivery Networks** (CDNs) reduce this by placing content closer to users. For latency-critical applications, geography becomes a primary architectural constraint.`,

    `## Throughput Modeling and Bottleneck Analysis

Throughput is governed by the **bottleneck resource** — the component with the lowest capacity in the request path. Amdahl's Law applies: the maximum speedup from parallelizing part of the system is limited by the serial (non-parallelizable) portion. If 20% of request processing is inherently serial (e.g., a database write with a row-level lock), throughput cannot exceed 5x the serial portion's capacity, no matter how many parallel workers you add.

**Universal Scalability Law (USL)** extends Amdahl's Law by adding a contention penalty. Throughput scales as: \`C(N) = N / (1 + alpha*(N-1) + beta*N*(N-1))\` where N is the concurrency level, alpha represents the serial fraction, and beta represents the coherence/crosstalk penalty (e.g., cache invalidation across cores, lock contention, distributed consensus). When beta > 0, throughput actually **decreases** past a certain concurrency level — adding more workers makes the system slower. This explains why naively adding threads or instances can degrade performance.

Practical bottleneck identification: instrument each layer (load balancer, application, database, cache, external APIs) with latency percentiles. The component where latency percentiles diverge most from its p50 is likely the bottleneck. Use **distributed tracing** (OpenTelemetry, Jaeger) to visualize the request waterfall and pinpoint where time is spent.`,

    `## Tail Latency Amplification in Distributed Systems

In microservice architectures, a single user request often fans out to dozens of backend services. If each service has independent p99 latency of 100ms (with p50 of 5ms), the probability that **all** N services respond within their p50 is (0.50)^N — essentially zero for large N. The user-facing latency is dominated by the **slowest** service in each request.

Sources of tail latency include: **garbage collection pauses** (especially full GC in Java/Go), **context switching** under high CPU contention, **disk I/O variance** (SSD tail latency can spike 100x due to internal compaction), **network retransmissions** (TCP retransmit timeout is typically 200ms+), **noisy neighbors** in shared infrastructure, and **lock contention** in critical sections. Each is rare individually but collectively they make tail latency events frequent at scale.

**Mitigation strategies** beyond hedged requests include: **request deadlines** propagated through the call chain (if a sub-request has already exceeded the overall deadline, cancel it), **backup requests** (send a second request only after a delay threshold, not immediately like hedging), **micro-partitioning** (split data into many small partitions so a slow partition affects fewer requests), and **latency-aware load balancing** (route away from instances showing elevated latency).`,

    `## Benchmarking and Load Testing Done Right

Most benchmarks produce misleading results due to systematic errors. **Coordinated omission** (mentioned earlier) is the most common, but other pitfalls include: **warmup effects** (JIT compilation, cache cold starts, connection pool initialization), **resource leaks** during long runs, **clock skew** between load generators and servers, and **network saturation** of the load generator itself.

A rigorous load testing methodology includes: (1) **Open-loop load generation** — send requests at a fixed rate regardless of response timing (tools: wrk2, Gatling, k6). (2) **Warmup period** — discard the first few minutes of data. (3) **HDR Histogram** for percentile recording with configurable precision and bounded memory. (4) **Multiple runs** with statistical analysis (mean, standard deviation, confidence intervals across runs, not just within one run). (5) **Production-like data** — synthetic data often exercises different code paths than real data. (6) **Soak testing** — run for hours to surface memory leaks, connection pool exhaustion, and GC pressure that shorter tests miss.

Record **all** outcomes including errors and timeouts in latency measurements. A timed-out request at 30 seconds is a 30-second latency data point, not a missing data point. Excluding it makes your p99 look better than reality.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Measuring latency percentiles using a histogram in C++",
      source: `#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <random>
#include <cmath>

class LatencyHistogram {
    std::vector<double> samples_;

public:
    void record(double latency_ms) {
        samples_.push_back(latency_ms);
    }

    // Returns the p-th percentile (p in [0, 100])
    double percentile(double p) {
        if (samples_.empty()) return 0.0;
        std::vector<double> sorted = samples_;
        std::sort(sorted.begin(), sorted.end());
        double rank = (p / 100.0) * (sorted.size() - 1);
        size_t lower = static_cast<size_t>(std::floor(rank));
        size_t upper = static_cast<size_t>(std::ceil(rank));
        double frac = rank - lower;
        return sorted[lower] * (1.0 - frac) + sorted[upper] * frac;
    }

    void print_summary() {
        std::cout << "Samples: " << samples_.size() << "\\n";
        std::cout << "p50:  " << percentile(50)  << " ms\\n";
        std::cout << "p95:  " << percentile(95)  << " ms\\n";
        std::cout << "p99:  " << percentile(99)  << " ms\\n";
        std::cout << "p99.9:" << percentile(99.9) << " ms\\n";
    }
};

int main() {
    LatencyHistogram hist;
    std::mt19937 rng(42);
    // Simulate log-normal latency distribution (realistic)
    std::lognormal_distribution<double> dist(1.5, 0.8);

    for (int i = 0; i < 100000; ++i) {
        hist.record(dist(rng));
    }

    hist.print_summary();
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Applying Little's Law for thread pool sizing",
      source: `#include <iostream>
#include <cmath>

struct SystemMetrics {
    double arrival_rate_rps;   // lambda: requests per second
    double avg_latency_sec;    // W: average response time in seconds
};

// Little's Law: L = lambda * W
double required_concurrency(const SystemMetrics& m) {
    return m.arrival_rate_rps * m.avg_latency_sec;
}

// M/M/1 queuing model: expected wait time given utilization
double mm1_wait_time(double service_time_sec, double utilization) {
    if (utilization >= 1.0) {
        std::cerr << "System is unstable (rho >= 1)\\n";
        return INFINITY;
    }
    return service_time_sec / (1.0 - utilization);
}

int main() {
    // Scenario: API service capacity planning
    SystemMetrics current = {
        .arrival_rate_rps = 2000.0,  // 2000 requests/sec
        .avg_latency_sec  = 0.050    // 50ms average latency
    };

    double L = required_concurrency(current);
    std::cout << "=== Little's Law: Thread Pool Sizing ===\\n";
    std::cout << "Arrival rate:      " << current.arrival_rate_rps << " RPS\\n";
    std::cout << "Avg latency:       " << current.avg_latency_sec * 1000 << " ms\\n";
    std::cout << "Required threads:  " << std::ceil(L) << "\\n\\n";

    // M/M/1 queuing: show hockey-stick degradation
    double service_time = 0.010; // 10ms pure service time
    std::cout << "=== M/M/1 Queuing: Latency vs Utilization ===\\n";
    for (double util : {0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99}) {
        double wait = mm1_wait_time(service_time, util);
        std::cout << "Utilization " << (util * 100) << "%: "
                  << "wait = " << wait * 1000 << " ms "
                  << "(" << wait / service_time << "x service time)\\n";
    }

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Fan-out tail latency probability calculator",
      source: `#include <iostream>
#include <cmath>
#include <vector>

// Probability of hitting at least one slow request in fan-out
double prob_tail_hit(int fan_out, double percentile_fraction) {
    // percentile_fraction: e.g., 0.99 means p99
    // P(at least one exceeds pN) = 1 - (percentile_fraction)^fan_out
    return 1.0 - std::pow(percentile_fraction, fan_out);
}

// Expected latency at a given percentile for parallel fan-out
// Assumes latency follows an exponential distribution for simplicity
double expected_max_latency(int fan_out, double base_p50_ms) {
    // For exponential: max of N samples ~ ln(N) * mean
    // This is a rough approximation; real distributions vary
    double mean = base_p50_ms / std::log(2.0); // exponential mean from median
    double harmonic_sum = 0.0;
    for (int i = 1; i <= fan_out; ++i) {
        harmonic_sum += 1.0 / i;
    }
    return mean * harmonic_sum;
}

int main() {
    std::cout << "=== Fan-Out Tail Latency Amplification ===\\n\\n";

    std::vector<int> fan_outs = {1, 5, 10, 25, 50, 100};

    std::cout << "Probability of hitting >= 1 p99 event:\\n";
    for (int n : fan_outs) {
        double prob = prob_tail_hit(n, 0.99) * 100.0;
        std::cout << "  Fan-out " << n << ": "
                  << prob << "%\\n";
    }

    std::cout << "\\nProbability of hitting >= 1 p99.9 event:\\n";
    for (int n : fan_outs) {
        double prob = prob_tail_hit(n, 0.999) * 100.0;
        std::cout << "  Fan-out " << n << ": "
                  << prob << "%\\n";
    }

    std::cout << "\\nExpected max latency (base p50 = 5ms):\\n";
    for (int n : fan_outs) {
        double lat = expected_max_latency(n, 5.0);
        std::cout << "  Fan-out " << n << ": "
                  << lat << " ms\\n";
    }

    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Token bucket rate limiter for throughput control",
      source: `#include <iostream>
#include <chrono>
#include <algorithm>

class TokenBucket {
    double tokens_;
    double max_tokens_;
    double refill_rate_;  // tokens per second
    std::chrono::steady_clock::time_point last_refill_;

public:
    TokenBucket(double max_tokens, double refill_rate)
        : tokens_(max_tokens)
        , max_tokens_(max_tokens)
        , refill_rate_(refill_rate)
        , last_refill_(std::chrono::steady_clock::now())
    {}

    bool try_acquire(double tokens = 1.0) {
        refill();
        if (tokens_ >= tokens) {
            tokens_ -= tokens;
            return true;  // Request allowed
        }
        return false;     // Rate limited (shed load)
    }

    double available() const { return tokens_; }

private:
    void refill() {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(
            now - last_refill_).count();
        tokens_ = std::min(max_tokens_,
                           tokens_ + elapsed * refill_rate_);
        last_refill_ = now;
    }
};

int main() {
    // Allow 100 RPS with burst capacity of 20
    TokenBucket limiter(20.0, 100.0);

    int allowed = 0, rejected = 0;
    for (int i = 0; i < 150; ++i) {
        if (limiter.try_acquire()) {
            ++allowed;
        } else {
            ++rejected;
        }
    }

    std::cout << "Allowed: " << allowed
              << ", Rejected: " << rejected << "\\n";
    // First ~20 pass (burst), rest rejected until refill

    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Latency vs Utilization (Hockey Stick Curve)",
      kind: "flow",
      caption: "M/M/1 queuing model showing how latency grows non-linearly with utilization",
      mermaid: `graph LR
    subgraph "Latency vs Server Utilization"
      A["30% util\n1.4x service time"] --> B["50% util\n2x service time"]
      B --> C["70% util\n3.3x service time"]
      C --> D["80% util\n5x service time"]
      D --> E["90% util\n10x service time"]
      E --> F["95% util\n20x service time"]
    end

    style A fill:#27ae60,color:#fff
    style B fill:#2ecc71,color:#fff
    style C fill:#f39c12,color:#fff
    style D fill:#e67e22,color:#fff
    style E fill:#e74c3c,color:#fff
    style F fill:#c0392b,color:#fff`,
    },
    {
      title: "Request Lifecycle Latency Breakdown",
      kind: "sequence",
      caption: "Detailed breakdown of where time is spent in a typical web request",
      mermaid: `sequenceDiagram
    participant Client
    participant DNS
    participant LB as Load Balancer
    participant App as App Server
    participant DB as Database
    participant Cache

    Client->>DNS: DNS lookup (~1-50ms)
    DNS-->>Client: IP address
    Client->>LB: TCP + TLS handshake (~10-30ms)
    LB->>App: Forward request (~1ms)
    App->>Cache: Check cache (~1ms)
    Cache-->>App: Cache miss
    App->>DB: Query (~5-50ms)
    DB-->>App: Results
    App-->>LB: Response (~1-5ms processing)
    LB-->>Client: Response (~10-100ms network)

    Note over Client,DB: Total: 30-270ms typical`,
    },
    {
      title: "Little's Law Visualization",
      kind: "architecture",
      caption: "Relationship between concurrency (L), throughput (lambda), and latency (W)",
      mermaid: `graph TD
    subgraph "Little's Law: L = lambda x W"
      IN["Arriving Requests\nlambda = 1000 RPS"] --> SYSTEM["System\nL = 100 in-flight"]
      SYSTEM --> OUT["Completed Requests\nlambda = 1000 RPS"]
    end

    subgraph "Implication"
      W["Avg Latency W = L/lambda\n= 100/1000 = 0.1s = 100ms"]
      TP["Thread Pool >= L = 100 threads"]
    end

    SYSTEM -.-> W
    SYSTEM -.-> TP

    style IN fill:#3498db,color:#fff
    style SYSTEM fill:#e67e22,color:#fff
    style OUT fill:#27ae60,color:#fff`,
    },
    {
      title: "Tail Latency Amplification in Fan-Out",
      kind: "architecture",
      caption: "How parallel backend calls amplify tail latency at the aggregation point",
      mermaid: `graph TD
    CLIENT[Client Request] --> AGG[Aggregator Service]
    AGG --> S1[Service 1\np50=5ms p99=100ms]
    AGG --> S2[Service 2\np50=5ms p99=100ms]
    AGG --> S3[Service 3\np50=5ms p99=100ms]
    AGG --> SN["... Service N\np50=5ms p99=100ms"]

    S1 --> WAIT["Response = max(all)\nWith N=50 services:\nP(>=1 hits p99) = 39.5%"]
    S2 --> WAIT
    S3 --> WAIT
    SN --> WAIT

    WAIT --> RESP[User sees slowest service]

    style CLIENT fill:#3498db,color:#fff
    style AGG fill:#9b59b6,color:#fff
    style WAIT fill:#e74c3c,color:#fff`,
    },
    {
      title: "Hedged Requests Strategy",
      kind: "sequence",
      caption: "Sending duplicate requests to reduce tail latency",
      mermaid: `sequenceDiagram
    participant C as Client
    participant R1 as Replica 1
    participant R2 as Replica 2
    participant R3 as Replica 3

    C->>R1: Request (t=0ms)
    C->>R2: Hedged request (t=0ms)
    Note over R1: Slow (GC pause)
    R2-->>C: Response (t=8ms) - USED
    R1-->>C: Response (t=150ms) - DISCARDED

    Note over C,R3: Without hedging: 150ms latency
    Note over C,R3: With hedging: 8ms latency`,
    },
  ],

  exercises: [
    "**Implement an HDR Histogram in C++.** Build a histogram data structure that supports recording latency values and querying arbitrary percentiles (p50, p95, p99, p99.9) in O(1) time. Use logarithmic bucketing: bucket widths increase with magnitude (1-microsecond precision for <1ms, 1ms precision for <1s, etc.). Test it with a log-normal distribution of 1 million samples and compare percentile accuracy against a naive sorted-array approach.",
    "**Model the M/M/k queue in C++.** Write a discrete-event simulation of a multi-server queue. Accept parameters for arrival rate (lambda), service rate (mu), and number of servers (k). Run the simulation for 100,000 requests and compute p50, p95, p99 latency. Compare results for k=1 vs k=4 servers at 80% total utilization to demonstrate the advantage of pooled servers.",
    "**Build a tail-latency-aware load balancer in C++.** Implement three load balancing strategies: round-robin, least-connections, and latency-weighted (route to the replica with the lowest recent p95). Simulate 5 backend replicas where one has 3x higher latency. Measure the user-facing p99 latency under each strategy and show which minimizes tail latency.",
    "**Implement a token bucket rate limiter with sliding window counters.** Combine a token bucket (for burst control) with a sliding window counter (for accurate rate measurement). The system should support `try_acquire()` returning immediately, and `wait_and_acquire()` that blocks until a token is available. Measure throughput under varying request rates.",
    "**Coordinated omission detector.** Write a load generator in C++ that sends requests at a fixed rate (open-loop). Compare the measured p99 latency against a naive closed-loop generator that waits for each response. Introduce artificial latency spikes (every 100th request takes 500ms) and show how the closed-loop generator underreports the true p99.",
  ],

  cheatSheet: [
    "**Little's Law**: `L = lambda * W` -- in-flight requests = throughput * avg latency. Use for thread pool sizing and capacity planning.",
    "**M/M/1 wait time**: `W = S / (1 - rho)` -- at 80% utilization, wait is 5x service time. Keep latency-sensitive services below 70% utilization.",
    "**Fan-out tail probability**: `P(hit) = 1 - (1-p)^N` -- with N=50 parallel calls, 39.5% chance of hitting a p99 event per user request.",
    "**p50** = median, typical user experience. **p99** = worst-case for 99% of users. Always measure and alert on percentiles, not averages.",
    "**Coordinated omission**: closed-loop load generators hide queuing delays. Use open-loop tools (wrk2, k6) for accurate percentile measurement.",
    "**Hedged requests**: send same request to 2+ replicas, use first response. Cuts tail latency dramatically but increases backend load. Only for idempotent reads.",
    "**Backpressure**: reject excess requests (HTTP 429, circuit breaker) rather than accepting and queuing indefinitely, which causes cascading latency.",
    "**Amdahl's Law**: max speedup = `1 / (S + (1-S)/N)` where S is serial fraction. 20% serial code limits speedup to 5x regardless of parallelism.",
    "**USL (Universal Scalability Law)**: accounts for both serialization and crosstalk; throughput can *decrease* past optimal concurrency.",
    "**Soak testing**: run load tests for hours, not minutes, to surface memory leaks, connection pool exhaustion, and GC pressure.",
  ],

  revisionNotes: [
    "**Latency** is time per request (ms); **throughput** is requests per unit time (RPS). They are related but not inverses -- optimizing one can hurt the other.",
    "Always measure latency in **percentiles** (p50, p95, p99), never just averages. Averages hide the long-tailed distribution that real users experience.",
    "**Little's Law** (`L = lambda * W`) relates concurrency, throughput, and latency. It holds for any stable system and directly informs thread pool and connection pool sizing.",
    "The **M/M/1 queuing model** shows latency degrades as `S/(1-rho)` -- non-linearly. Past 70-80% utilization, latency spikes dramatically (the hockey stick curve).",
    "**Fan-out amplifies tail latency**: with N parallel backend calls, the user sees the latency of the slowest one. Mitigate with hedged requests, deadlines, and latency-aware routing.",
    "**Coordinated omission** is the most common benchmarking flaw. Closed-loop generators artificially suppress high percentiles by reducing request rate during slow responses.",
    "Key latency reduction techniques: **caching**, **connection pooling**, **async I/O**, **hedged requests**, **request collapsing**, and **geographic proximity** (CDNs).",
    "Key throughput techniques: **horizontal scaling**, **batching**, **backpressure**, and eliminating serial bottlenecks (Amdahl's Law).",
  ],

  glossary: [
    {
      term: "Latency",
      definition:
        "The time elapsed from when a request is initiated to when the response is fully received, typically measured in milliseconds.",
    },
    {
      term: "Throughput",
      definition:
        "The rate at which a system completes work, measured in requests per second (RPS), transactions per second (TPS), or similar units.",
    },
    {
      term: "Percentile (pN)",
      definition:
        "The value below which N% of observations fall. p99 latency means 99% of requests are faster than this value.",
    },
    {
      term: "Little's Law",
      definition:
        "L = lambda * W: a fundamental queuing theory result relating average concurrency (L), arrival rate (lambda), and average latency (W).",
    },
    {
      term: "Tail Latency",
      definition:
        "The latency experienced by the slowest fraction of requests (p99, p99.9), often caused by GC pauses, contention, or background tasks.",
    },
    {
      term: "Coordinated Omission",
      definition:
        "A load-testing flaw where the generator's closed-loop design causes slow responses to reduce request rate, artificially suppressing high-percentile measurements.",
    },
    {
      term: "Hedged Request",
      definition:
        "A technique that sends the same request to multiple replicas simultaneously and uses the first response, reducing tail latency at the cost of increased backend load.",
    },
  ],
};
