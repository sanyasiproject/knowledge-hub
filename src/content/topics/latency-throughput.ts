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
