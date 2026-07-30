import type { TopicContent } from "../types";

export const resiliencePatterns: TopicContent = {
  quickSummary: [
    "The circuit breaker pattern stops calling a failing downstream service after a threshold of failures, preventing cascade failures and giving the service time to recover.",
    "Retry with exponential backoff and jitter re-attempts failed requests with increasing delays and randomization to avoid thundering herd problems.",
    "The bulkhead pattern isolates failures by partitioning resources (thread pools, connection pools) so one failing dependency cannot exhaust resources needed by others.",
    "Timeouts and fallbacks ensure that slow or failing dependencies do not block callers indefinitely, providing degraded but functional responses instead.",
  ],
  detailed: [
    `## Circuit Breaker

The circuit breaker pattern, inspired by electrical circuits, has three states:

1. **Closed** (normal): requests flow through. Failures are counted.
2. **Open** (tripped): after failure threshold is exceeded, all requests are immediately rejected without calling the downstream. A timer starts.
3. **Half-Open** (testing): after the timer expires, a limited number of test requests are allowed through. If they succeed, the circuit closes. If they fail, it reopens.

Configuration parameters:
- **Failure threshold**: number or percentage of failures to trip (e.g., 50% failure rate over 10 requests).
- **Timeout duration**: how long the circuit stays open before testing (e.g., 30 seconds).
- **Success threshold**: number of successes in half-open to close the circuit.

Benefits:
- Prevents cascading failures: a failing service does not consume caller resources.
- Fails fast: callers get immediate errors instead of waiting for timeouts.
- Gives the failing service breathing room to recover.

Libraries: Resilience4j (Java), Polly (.NET), opossum (Node.js), Hystrix (legacy).`,

    `## Retry with Exponential Backoff and Jitter

Retrying failed requests is essential for handling transient failures (network blips, temporary overload), but naive retries can make things worse:

**Exponential backoff**: each retry waits longer — e.g., 100ms, 200ms, 400ms, 800ms. This reduces load on a struggling service.

**Jitter**: add randomness to the delay — e.g., delay * (0.5 + random * 0.5). This prevents the **thundering herd** problem where many clients retry at exactly the same time after a brief outage.

**Retry budget**: limit retries to a percentage of total traffic (e.g., max 10% of requests can be retries) to prevent retry amplification.

**Idempotency**: only retry operations that are safe to repeat. Non-idempotent operations (creating an order) need idempotency keys to prevent duplicates.

Best practices:
- Set a maximum retry count (e.g., 3 attempts).
- Only retry on transient errors (5xx, connection refused, timeout), not on 4xx (client errors).
- Include the retry count in logs and metrics for observability.
- Use circuit breakers to stop retrying when the downstream is completely down.`,

    `## Bulkhead Pattern

Named after ship compartments that contain flooding, the bulkhead pattern isolates failure domains:

**Thread pool isolation**: allocate separate thread pools for each downstream dependency. If Service A's pool is exhausted due to slow responses, Service B's pool is unaffected.

**Connection pool isolation**: separate database connection pools for critical and non-critical queries. A runaway analytics query does not starve the checkout flow.

**Semaphore isolation**: lighter than thread pools — limit concurrent calls to a dependency using a semaphore count. Lower overhead but no timeout protection.

**Process/container isolation**: run different workloads in separate containers or pods. Kubernetes resource limits and quotas enforce isolation at the infrastructure level.

Example: an e-commerce service calls a payment gateway, a recommendation engine, and an inventory service. Without bulkheads, if the recommendation engine hangs, all threads are consumed waiting for it, and the payment flow (which is healthy) starves. With bulkheads, the recommendation pool exhausts but payment and inventory pools continue operating.`,

    `## Timeout Pattern

Every outbound call must have a timeout. Without timeouts, a hanging downstream can block threads indefinitely, leading to resource exhaustion:

**Types of timeouts**:
- **Connection timeout**: maximum time to establish a TCP connection (typically 1-5 seconds).
- **Request/response timeout**: maximum time to receive a complete response after connection is established.
- **Overall timeout**: end-to-end deadline including retries and queuing.

**Timeout propagation**: in a chain of microservices (A -> B -> C), each service should propagate a deadline. If A sets a 5-second timeout, B should pass a 4-second timeout to C (reserving 1 second for its own processing). gRPC supports deadline propagation natively.

**Hedged requests**: instead of waiting for a timeout, send a duplicate request to another replica after a delay (e.g., p95 latency). Use the first response. Only for idempotent reads.`,

    `## Fallback Pattern

When a dependency fails, provide a degraded but functional response:

- **Cached response**: return the last known good value from cache.
- **Default value**: return a static default (e.g., a generic list of recommended products).
- **Simplified computation**: skip optional enrichment (e.g., show prices without personalized discounts).
- **Graceful degradation**: disable non-critical features (e.g., hide the recommendation widget, keep the checkout flow).

Fallbacks should be tested regularly — if a fallback path is never exercised, it may itself be broken when needed.

**Combining patterns**: a production-grade resilient call typically layers:
1. **Timeout** (prevent indefinite blocking)
2. **Retry with backoff** (handle transient failures)
3. **Circuit breaker** (stop calling when downstream is down)
4. **Fallback** (return degraded response when circuit is open)
5. **Bulkhead** (isolate from other dependencies)

The order matters: the circuit breaker wraps retries (not the other way around), and the fallback is triggered when the circuit breaker rejects a request.`,
  ],
  interviewQA: [
    {
      q: "Explain the circuit breaker pattern and its three states.",
      a: "The circuit breaker monitors calls to a downstream service. In the Closed state, requests flow normally and failures are counted. When failures exceed a threshold (e.g., 50% error rate), the circuit trips to Open: all requests are immediately rejected without calling the downstream, giving it time to recover. After a timeout period, the circuit moves to Half-Open: a limited number of test requests are allowed through. If they succeed, the circuit closes; if they fail, it reopens. This prevents cascade failures and provides fast failure instead of slow timeouts.",
    },
    {
      q: "Why is jitter important in retry logic?",
      a: "Without jitter, all clients that experienced the same brief outage will retry at the same exponential intervals, creating synchronized waves of retries (thundering herd) that can overwhelm the recovering service. Jitter adds randomness to the delay, spreading retries across time. For example, instead of all clients retrying at exactly 1 second, they retry between 0.5 and 1.5 seconds. This smooths the load and gives the downstream service a better chance to recover gracefully.",
    },
    {
      q: "How does the bulkhead pattern prevent cascading failures?",
      a: "The bulkhead pattern isolates resources by allocating separate pools (threads, connections, semaphores) for each downstream dependency. If one dependency becomes slow and exhausts its pool, other dependencies continue operating normally with their own pools. Without bulkheads, all outbound calls share a single thread pool, so a single slow dependency can consume all threads and starve every other dependency, causing a complete service outage even though most downstreams are healthy.",
    },
    {
      q: "In what order should resilience patterns be layered for a downstream call?",
      a: "From outermost to innermost: Bulkhead (resource isolation) wraps Circuit Breaker (fail fast when down) wraps Retry with Backoff (handle transient failures) wraps Timeout (prevent indefinite blocking). The Fallback is triggered when the circuit breaker rejects or when all retries are exhausted. The circuit breaker must wrap retries so that retry failures count toward the circuit breaker threshold; otherwise, retries would mask the failure rate.",
    },
  ],
  mcqs: [
    {
      q: "What triggers a circuit breaker to move from Closed to Open?",
      options: [
        "A single failed request",
        "The failure rate exceeding a configured threshold",
        "A timeout in the health check",
        "Manual operator intervention",
      ],
      answerIndex: 1,
      explanation:
        "The circuit breaker trips to Open when the failure rate (or count) exceeds a configured threshold over a measurement window, indicating the downstream is unhealthy.",
    },
    {
      q: "What is the thundering herd problem in retry logic?",
      options: [
        "Too many users accessing the system simultaneously",
        "All clients retrying at the same time after an outage, overwhelming the recovering service",
        "A memory leak caused by retry queues",
        "Retrying non-idempotent operations",
      ],
      answerIndex: 1,
      explanation:
        "Without jitter, clients using identical exponential backoff schedules retry in synchronized waves, creating traffic spikes that can prevent the downstream from recovering.",
    },
    {
      q: "Which resilience pattern prevents a slow recommendation service from starving the payment flow?",
      options: [
        "Circuit breaker",
        "Retry with backoff",
        "Bulkhead",
        "Fallback",
      ],
      answerIndex: 2,
      explanation:
        "The bulkhead pattern isolates resources per dependency. A separate thread/connection pool for recommendations means its slowness cannot exhaust resources needed by the payment flow.",
    },
    {
      q: "Why should the circuit breaker wrap retries rather than the other way around?",
      options: [
        "To reduce the number of retry attempts",
        "So retry failures count toward the circuit breaker threshold",
        "To enable faster timeout detection",
        "To simplify the fallback logic",
      ],
      answerIndex: 1,
      explanation:
        "If retries are outside the circuit breaker, failed retries do not count toward the failure threshold, masking the true error rate and preventing the circuit from tripping when it should.",
    },
  ],
  flashcards: [
    {
      front: "What are the three states of a circuit breaker?",
      back: "Closed (normal, counting failures), Open (rejecting all requests, waiting for timeout), Half-Open (allowing test requests to check if downstream has recovered).",
    },
    {
      front: "What is exponential backoff with jitter?",
      back: "Retries with exponentially increasing delays (100ms, 200ms, 400ms...) plus random jitter to prevent thundering herd. Example: delay * (0.5 + random * 0.5).",
    },
    {
      front: "What is a retry budget?",
      back: "A limit on retries as a percentage of total traffic (e.g., max 10%). Prevents retry amplification where retries generate more retries in a chain of services.",
    },
    {
      front: "What is the bulkhead pattern?",
      back: "Isolating resources (thread pools, connection pools) per dependency so that one failing dependency cannot exhaust resources needed by others. Named after ship compartments.",
    },
    {
      front: "What is timeout propagation?",
      back: "Passing a deadline through a service chain so each service knows how much time remains. If A gives B 5 seconds, B should give C 4 seconds, reserving time for its own work.",
    },
    {
      front: "What is a fallback in resilience?",
      back: "A degraded but functional response when a dependency fails: cached data, default values, simplified computation, or disabling non-critical features.",
    },
    {
      front: "What is the correct layering order for resilience patterns?",
      back: "Outermost to innermost: Bulkhead > Circuit Breaker > Retry > Timeout. Fallback triggers when circuit breaker rejects or retries are exhausted.",
    },
  ],
  glossary: [
    {
      term: "Circuit Breaker",
      definition:
        "A pattern that stops calling a failing dependency after a failure threshold, preventing cascade failures and giving the service time to recover.",
    },
    {
      term: "Exponential Backoff",
      definition:
        "A retry strategy where each successive retry waits exponentially longer, reducing load on a struggling service.",
    },
    {
      term: "Jitter",
      definition:
        "Random variation added to retry delays to prevent synchronized retry waves (thundering herd) from overwhelming a recovering service.",
    },
    {
      term: "Bulkhead",
      definition:
        "An isolation pattern that partitions resources (thread pools, connections) per dependency to contain failures and prevent resource exhaustion.",
    },
    {
      term: "Timeout",
      definition:
        "A maximum duration for an outbound call, preventing indefinite blocking when a downstream service is slow or unresponsive.",
    },
    {
      term: "Fallback",
      definition:
        "A degraded response provided when a dependency fails, such as cached data, default values, or graceful feature degradation.",
    },
    {
      term: "Retry Budget",
      definition:
        "A limit on retry traffic as a percentage of total requests, preventing retry amplification in distributed systems.",
    },
  ],
};
