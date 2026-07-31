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
  deepDive: [
    `## The Anatomy of Cascade Failures and Why Resilience Matters

In a **distributed microservices architecture**, a single unhealthy dependency can trigger a **domino effect** that takes down the entire system. Consider a typical e-commerce platform: the *product catalog* service calls the *inventory service*, which calls the *warehouse API*, which queries a *database*. If the database becomes slow (not down, just *slow*), the warehouse API threads start piling up waiting for responses. The inventory service threads then pile up waiting for the warehouse API. The product catalog service piles up waiting for inventory. Within minutes, every thread pool across three services is exhausted, and the entire platform is unresponsive — even the **checkout flow**, which never touched the slow database. This is a **cascade failure**, and it is the primary motivator for every resilience pattern. The insidious part is that the root cause (a slow database) may resolve on its own in 30 seconds, but without resilience patterns, the recovery can take *minutes* because every service in the chain has exhausted resources and needs time to drain queues, close stale connections, and restart processing. Resilience patterns break this chain at multiple points: **timeouts** prevent indefinite blocking, **circuit breakers** stop calling the failing service, **bulkheads** isolate the blast radius, and **fallbacks** keep the user experience functional.`,

    `## Circuit Breaker Internals: State Machine, Metrics Windows, and Failure Detection

The circuit breaker is fundamentally a **finite state machine** with three states: \`CLOSED\`, \`OPEN\`, and \`HALF_OPEN\`. The transition logic depends on a **sliding window** of recent call outcomes. There are two common windowing strategies: *count-based* (e.g., the last 100 calls) and *time-based* (e.g., calls within the last 60 seconds). The **failure rate** is computed over this window, and when it exceeds a configurable threshold (e.g., **50%**), the circuit trips to \`OPEN\`. In the \`OPEN\` state, every call is immediately rejected with a \`CircuitBreakerOpenException\` — no network call is made. After a configurable **wait duration** (e.g., 30 seconds), the circuit transitions to \`HALF_OPEN\`. In this probing state, a limited number of calls (the *permitted number of calls in half-open state*) are allowed through. If these test calls meet the success criteria (e.g., all succeed, or failure rate drops below threshold), the circuit **closes** and normal operation resumes. If any test call fails, the circuit **reopens** and the wait timer resets. Advanced implementations also track **slow calls** — calls that succeed but exceed a latency threshold — as a separate metric. A high slow-call rate can trip the circuit even if there are no outright failures, because slow responses are often a precursor to timeouts and failures. The state transitions should emit **events** (via callbacks or an event bus) so that monitoring systems can alert on circuit state changes and dashboards can visualize the health of each dependency.`,

    `## Production Hardening: Combining Patterns with Observability

Implementing resilience patterns in production requires more than just wrapping calls — it demands **observability**, **testing**, and **tuning**. Every circuit breaker, retry, timeout, and bulkhead should emit **metrics**: circuit state changes, rejection counts, retry counts, timeout counts, bulkhead queue depths, and fallback invocations. These metrics feed into dashboards (e.g., *Grafana*, *Datadog*) and alerts. Without metrics, you cannot distinguish between "the circuit breaker is protecting us from a real failure" and "the circuit breaker is misconfigured and rejecting healthy traffic." **Chaos engineering** — intentionally injecting failures using tools like *Chaos Monkey*, *Litmus*, or *Gremlin* — is essential for validating that resilience patterns work as intended. A fallback that has never been exercised in production may itself be broken. **Tuning** is an ongoing process: a failure threshold that is too low causes false positives (circuit trips during normal variance), while one that is too high allows too many failures before protection kicks in. The timeout value must be informed by actual latency percentiles (\`p99\`, \`p999\`) of the downstream service. **Retry budgets** should be set based on load testing to ensure that retries do not exceed the downstream's capacity. Finally, resilience patterns must be layered in the correct order — **Bulkhead > Circuit Breaker > Retry > Timeout** — and each layer's configuration must be consistent (e.g., the retry timeout must be less than the circuit breaker's slow-call threshold).`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Circuit Breaker State Machine in C++",
      source: `#include <chrono>
#include <functional>
#include <mutex>
#include <stdexcept>

enum class CircuitState { CLOSED, OPEN, HALF_OPEN };

class CircuitBreaker {
public:
    CircuitBreaker(int failureThreshold, int successThreshold,
                   std::chrono::milliseconds openDuration)
        : failureThreshold_(failureThreshold),
          successThreshold_(successThreshold),
          openDuration_(openDuration),
          state_(CircuitState::CLOSED),
          failureCount_(0),
          successCount_(0) {}

    // Execute a callable through the circuit breaker
    template <typename Func>
    auto execute(Func&& func) -> decltype(func()) {
        std::lock_guard<std::mutex> lock(mutex_);

        switch (state_) {
        case CircuitState::OPEN:
            if (shouldAttemptReset()) {
                state_ = CircuitState::HALF_OPEN;
                successCount_ = 0;
                // Fall through to allow the test call
            } else {
                throw std::runtime_error("CircuitBreaker is OPEN");
            }
            [[fallthrough]];

        case CircuitState::HALF_OPEN:
        case CircuitState::CLOSED:
            try {
                // Unlock during the actual call to avoid holding
                // the mutex during potentially slow I/O
                mutex_.unlock();
                auto result = func();
                mutex_.lock();
                onSuccess();
                return result;
            } catch (...) {
                mutex_.lock();
                onFailure();
                throw;
            }
        }
        // Unreachable, but satisfies compiler
        throw std::runtime_error("Unknown circuit state");
    }

    CircuitState getState() const { return state_; }

private:
    void onSuccess() {
        if (state_ == CircuitState::HALF_OPEN) {
            successCount_++;
            if (successCount_ >= successThreshold_) {
                state_ = CircuitState::CLOSED;
                failureCount_ = 0;
            }
        } else {
            failureCount_ = 0; // Reset on success in CLOSED
        }
    }

    void onFailure() {
        failureCount_++;
        if (state_ == CircuitState::HALF_OPEN) {
            // Any failure in HALF_OPEN reopens
            state_ = CircuitState::OPEN;
            lastOpenTime_ = std::chrono::steady_clock::now();
        } else if (failureCount_ >= failureThreshold_) {
            state_ = CircuitState::OPEN;
            lastOpenTime_ = std::chrono::steady_clock::now();
        }
    }

    bool shouldAttemptReset() const {
        auto elapsed = std::chrono::steady_clock::now() - lastOpenTime_;
        return elapsed >= openDuration_;
    }

    int failureThreshold_;
    int successThreshold_;
    std::chrono::milliseconds openDuration_;
    CircuitState state_;
    int failureCount_;
    int successCount_;
    std::chrono::steady_clock::time_point lastOpenTime_;
    std::mutex mutex_;
};

// Usage:
// CircuitBreaker cb(5, 3, std::chrono::seconds(30));
// auto result = cb.execute([&]() { return httpClient.get("/api/data"); });`,
    },
    {
      language: "cpp",
      caption: "Bulkhead Pattern with Semaphore Isolation in C++",
      source: `#include <condition_variable>
#include <functional>
#include <mutex>
#include <stdexcept>
#include <chrono>

class Bulkhead {
public:
    // maxConcurrent: max simultaneous calls allowed
    // maxWait: max time to wait for a permit before rejecting
    Bulkhead(int maxConcurrent, std::chrono::milliseconds maxWait)
        : maxConcurrent_(maxConcurrent),
          maxWait_(maxWait),
          activeCount_(0) {}

    template <typename Func>
    auto execute(Func&& func) -> decltype(func()) {
        acquirePermit();
        try {
            auto result = func();
            releasePermit();
            return result;
        } catch (...) {
            releasePermit();
            throw;
        }
    }

    int getActiveCount() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return activeCount_;
    }

private:
    void acquirePermit() {
        std::unique_lock<std::mutex> lock(mutex_);
        if (!cv_.wait_for(lock, maxWait_,
                [this] { return activeCount_ < maxConcurrent_; })) {
            throw std::runtime_error(
                "Bulkhead full: max concurrent calls reached");
        }
        activeCount_++;
    }

    void releasePermit() {
        {
            std::lock_guard<std::mutex> lock(mutex_);
            activeCount_--;
        }
        cv_.notify_one();
    }

    int maxConcurrent_;
    std::chrono::milliseconds maxWait_;
    int activeCount_;
    mutable std::mutex mutex_;
    std::condition_variable cv_;
};

// Usage:
// Bulkhead paymentBulkhead(10, std::chrono::seconds(2));
// Bulkhead recommendationBulkhead(5, std::chrono::seconds(1));
//
// // Payment calls are isolated from recommendation calls
// auto payment = paymentBulkhead.execute([&]() {
//     return paymentGateway.charge(order);
// });
// auto recs = recommendationBulkhead.execute([&]() {
//     return recsService.getRecommendations(userId);
// });`,
    },
    {
      language: "typescript",
      caption: "Resilient HTTP Client with Circuit Breaker, Retry, and Timeout in Node.js",
      source: `import CircuitBreaker from "opossum";

interface ResilientCallOptions {
  /** Maximum time for a single attempt (ms) */
  timeout: number;
  /** Max retry attempts (excluding the initial call) */
  maxRetries: number;
  /** Base delay for exponential backoff (ms) */
  baseDelay: number;
  /** Circuit breaker failure threshold (percentage) */
  failureThreshold: number;
  /** Circuit breaker reset timeout (ms) */
  resetTimeout: number;
}

const DEFAULT_OPTIONS: ResilientCallOptions = {
  timeout: 3000,
  maxRetries: 3,
  baseDelay: 200,
  failureThreshold: 50,
  resetTimeout: 30000,
};

/**
 * Wraps an async function with retry + exponential backoff + jitter.
 * Only retries on transient errors (5xx, timeouts, network errors).
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Do not retry client errors (4xx)
      if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
        throw err;
      }

      if (attempt < maxRetries) {
        // Exponential backoff with full jitter
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitteredDelay = Math.random() * exponentialDelay;
        console.log(
          \`Retry \${attempt + 1}/\${maxRetries} after \${Math.round(jitteredDelay)}ms\`
        );
        await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
      }
    }
  }

  throw lastError;
}

/**
 * Creates a resilient wrapper around an async service call.
 * Layers: Circuit Breaker > Retry with Backoff > Timeout
 */
function createResilientCall<T>(
  serviceFn: (...args: any[]) => Promise<T>,
  fallbackFn: (...args: any[]) => Promise<T>,
  options: Partial<ResilientCallOptions> = {}
): (...args: any[]) => Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Wrap the service call with retry logic
  const retryWrapped = (...args: any[]) =>
    retryWithBackoff(() => serviceFn(...args), opts.maxRetries, opts.baseDelay);

  // Wrap with circuit breaker (opossum)
  const breaker = new CircuitBreaker(retryWrapped, {
    timeout: opts.timeout,
    errorThresholdPercentage: opts.failureThreshold,
    resetTimeout: opts.resetTimeout,
    volumeThreshold: 10, // Minimum calls before threshold is evaluated
  });

  // Register fallback
  breaker.fallback(fallbackFn);

  // Observability: log circuit state changes
  breaker.on("open", () =>
    console.warn("[CircuitBreaker] OPEN - requests will be rejected")
  );
  breaker.on("halfOpen", () =>
    console.info("[CircuitBreaker] HALF_OPEN - testing downstream")
  );
  breaker.on("close", () =>
    console.info("[CircuitBreaker] CLOSED - normal operation resumed")
  );

  return (...args: any[]) => breaker.fire(...args);
}

// --- Example Usage ---
// const resilientGetUser = createResilientCall(
//   (userId: string) => fetch(\`https://api.example.com/users/\${userId}\`)
//     .then(res => { if (!res.ok) throw new Error(\`HTTP \${res.status}\`); return res.json(); }),
//   (userId: string) => Promise.resolve({ id: userId, name: "Unknown", cached: true }),
//   { timeout: 2000, maxRetries: 2, resetTimeout: 15000 }
// );
//
// const user = await resilientGetUser("user-123");`,
    },
  ],

  diagrams: [
    {
      title: "Circuit Breaker State Machine",
      kind: "state",
      caption:
        "The three states of a circuit breaker and the transitions between them based on failure thresholds, timeouts, and test call outcomes.",
      mermaid: `stateDiagram-v2
    [*] --> Closed
    Closed --> Open : Failure rate >= threshold
    Open --> HalfOpen : Wait duration elapsed
    HalfOpen --> Closed : Test calls succeed\\n(success >= successThreshold)
    HalfOpen --> Open : Test call fails

    state Closed {
        [*] --> Monitoring
        Monitoring --> Monitoring : Count successes/failures\\nin sliding window
    }

    state Open {
        [*] --> Rejecting
        Rejecting --> Rejecting : All calls rejected\\nimmediately (fail fast)
    }

    state HalfOpen {
        [*] --> Testing
        Testing --> Testing : Allow limited\\ntest requests through
    }`,
    },
    {
      title: "Resilience Pattern Layering",
      kind: "flow",
      caption:
        "How resilience patterns are layered around a downstream service call, from outermost (bulkhead) to innermost (timeout).",
      mermaid: `flowchart TD
    A[Incoming Request] --> B{Bulkhead\\nPermit available?}
    B -- No --> B1[Reject: Resource limit]
    B -- Yes --> C{Circuit Breaker\\nState?}
    C -- OPEN --> C1[Reject: Circuit open]
    C1 --> F[Fallback Response]
    C -- CLOSED / HALF_OPEN --> D[Retry with Backoff]
    D --> E{Timeout\\nExceeded?}
    E -- Yes --> D1{Retries\\nremaining?}
    D1 -- Yes --> D
    D1 -- No --> G[Record failure]
    G --> F
    E -- No --> H[Downstream Service Call]
    H -- Success --> I[Return response]
    H -- Failure --> D1
    B1 --> F`,
    },
  ],

  comparison: {
    columns: [
      "Pattern",
      "Problem Solved",
      "Mechanism",
      "Overhead",
      "When to Use",
    ],
    rows: [
      [
        "**Circuit Breaker**",
        "Cascade failures from a *down* dependency",
        "State machine that stops calls after failure threshold",
        "Low (counter + timer)",
        "Every external service call",
      ],
      [
        "**Retry with Backoff**",
        "*Transient* failures (network blips, brief overloads)",
        "Re-attempt with exponentially increasing delays + jitter",
        "Low (delay logic only)",
        "Idempotent operations with transient error potential",
      ],
      [
        "**Bulkhead**",
        "Resource exhaustion from one *slow* dependency",
        "Isolated thread/connection pools or semaphores per dependency",
        "Medium (thread pool management)",
        "Services calling multiple downstream dependencies",
      ],
      [
        "**Timeout**",
        "Indefinite blocking on slow calls",
        "Hard deadline on each outbound call",
        "Negligible",
        "Every outbound network call, always",
      ],
      [
        "**Fallback**",
        "Complete failure of a dependency",
        "Return cached/default/degraded response",
        "Low (cache lookup or static data)",
        "Non-critical data enrichment, user-facing features",
      ],
      [
        "**Hedged Requests**",
        "Tail latency spikes",
        "Send duplicate request to another replica after p95 delay",
        "Medium (extra network call)",
        "Idempotent reads where latency SLA is strict",
      ],
    ],
  },

  exercises: [
    "**Design a circuit breaker** for a payment gateway integration. Specify the failure threshold, wait duration, and success threshold values you would use. Justify each choice considering that false positives (tripping on healthy traffic) block revenue, while false negatives (not tripping fast enough) risk cascade failures.",
    "**Implement retry with exponential backoff and jitter** in your preferred language. Test it by simulating a service that fails 3 times then succeeds. Verify with logs that (a) delays increase exponentially, (b) jitter randomizes the actual wait time, and (c) the 4th attempt succeeds.",
    "**Calculate the retry amplification** in a 3-tier service chain (A -> B -> C) where each tier retries 3 times. If C returns an error, how many total requests does C receive from a single user request to A? What is the maximum if you add a 4th tier? Propose a mitigation strategy.",
    "**Design bulkhead boundaries** for a service that depends on: (1) a *PostgreSQL* database for user data, (2) a *Redis* cache, (3) an external *payment gateway*, and (4) a *recommendation engine*. For each dependency, choose between thread pool isolation and semaphore isolation, and justify your pool sizes based on expected concurrency and criticality.",
    "**Chaos engineering exercise**: Write a test harness that wraps a mock HTTP client with a circuit breaker and retry logic. Inject failures at configurable rates (e.g., 30%, 60%, 90%) and measure: (a) when the circuit breaker trips, (b) how many retries occur before tripping, (c) how long recovery takes after failures stop. Plot the results to find the optimal failure threshold.",
  ],

  cheatSheet: [
    "**Circuit Breaker states**: `CLOSED` (normal, counting failures) -> `OPEN` (all calls rejected, timer running) -> `HALF_OPEN` (limited test calls allowed). Trips when failure rate exceeds threshold over a *sliding window*.",
    "**Retry formula**: `delay = baseDelay * 2^attempt * (0.5 + random() * 0.5)`. Always set a **max retry count** (typically 3). Only retry *transient* errors (5xx, timeout, connection refused) — never 4xx.",
    "**Retry amplification**: In an N-tier chain with R retries each, worst-case total calls = **R^N**. Mitigate with *retry budgets* (cap retries at 10% of total traffic) and circuit breakers.",
    "**Bulkhead sizing**: Set pool size based on `expectedConcurrency * (averageLatency / 1000)`. For a dependency with 100 RPS and 200ms latency: `100 * 0.2 = 20` threads. Add 20-50% headroom.",
    "**Timeout hierarchy**: `connectionTimeout < requestTimeout < overallTimeout`. Example: `1s < 3s < 10s`. For deadline propagation: each hop deducts its own processing time from the remaining budget.",
    "**Layering order** (outermost to innermost): *Bulkhead* > *Circuit Breaker* > *Retry* > *Timeout*. Fallback triggers when circuit rejects or retries exhausted. The circuit breaker **must** wrap retries so failures count toward the threshold.",
  ],

  revisionNotes: [
    "The **circuit breaker** is a *state machine* with three states. The key insight is that it **fails fast** — callers get immediate errors instead of waiting for timeouts, which prevents thread pool exhaustion and cascade failures.",
    "**Exponential backoff without jitter** is dangerous: all clients retry at identical intervals, creating *synchronized retry storms*. Always add **full jitter** (`delay * random()`) or **decorrelated jitter** to spread retries across time.",
    "**Bulkheads** are about *blast radius containment*. The analogy is ship compartments: a hull breach floods one compartment, not the whole ship. In software, a slow dependency exhausts its own pool without starving others.",
    "The **correct layering order** is critical and frequently asked in interviews: **Bulkhead > Circuit Breaker > Retry > Timeout**. If retries wrap the circuit breaker (wrong order), retry failures do not count toward the circuit breaker threshold, so the circuit never trips.",
    "**Fallbacks must be tested regularly** — an untested fallback may itself be broken when needed. Use *chaos engineering* to deliberately fail dependencies and verify fallback behavior under realistic conditions.",
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
