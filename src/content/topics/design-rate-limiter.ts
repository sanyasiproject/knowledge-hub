import type { TopicContent } from "../types";

export const designRateLimiter: TopicContent = {
  quickSummary: [
    "A rate limiter controls the number of requests a client can make within a time window, protecting services from abuse, DDoS attacks, and resource exhaustion. It sits at the API gateway or as middleware before request processing.",
    "The Token Bucket algorithm fills a bucket with tokens at a fixed rate. Each request consumes one token. If the bucket is empty, the request is rejected. It allows short bursts up to the bucket capacity while enforcing a long-term average rate.",
    "The Sliding Window algorithms provide smoother rate limiting. Sliding Window Log tracks exact request timestamps for perfect accuracy but uses more memory. Sliding Window Counter approximates by weighting the current and previous windows, balancing accuracy with efficiency.",
    "Distributed rate limiting requires atomic operations across multiple servers. Redis with Lua scripts provides atomicity. Challenges include clock synchronization, race conditions, and deciding between local (per-node) and global (centralized) enforcement.",
  ],
  detailed: [
    "## Rate Limiting Algorithms\n\n**Fixed Window Counter**: divide time into fixed windows (e.g., 1-minute intervals). Count requests per window. If count exceeds the limit, reject. Simple but has the boundary burst problem: a client can send the limit at the end of one window and the limit at the start of the next, getting 2x the rate in a short span. **Sliding Window Log**: store the timestamp of every request. To check the limit, count timestamps within the last window. Remove expired timestamps. Perfectly accurate but O(n) memory per client. **Sliding Window Counter**: a hybrid. Track counts in fixed sub-windows and compute a weighted count: `count = prev_window_count * overlap_fraction + current_window_count`. Near-perfect accuracy with O(1) memory per client. **Token Bucket**: a bucket holds up to `maxTokens`. Tokens are added at `refillRate` per second. Each request takes one token. If empty, reject. Allows bursts up to bucket size. **Leaky Bucket**: requests enter a queue (bucket) and are processed at a fixed rate. If the queue is full, new requests are dropped. Smooths output to a constant rate, no bursts.",
    "## Token Bucket Deep Dive\n\nState per client: `tokens` (current count) and `lastRefillTimestamp`. On each request: (1) Calculate elapsed time since last refill. (2) Add `elapsed * refillRate` tokens, capped at `maxTokens`. (3) If `tokens >= 1`, allow request and decrement. Else reject. This lazy refill approach avoids running a background timer. Parameters: `maxTokens` controls burst size, `refillRate` controls sustained throughput. Example: maxTokens=10, refillRate=2/sec allows a burst of 10 requests instantly, then 2/sec sustained. In a distributed system, store the bucket state in Redis. Use a Lua script for atomic check-refill-decrement to prevent race conditions between concurrent requests.",
    "## Sliding Window Counter Deep Dive\n\nDivide time into fixed windows of duration W. Track the request count for the current and previous windows. When a request arrives at time t within the current window: `weighted_count = prev_count * ((W - elapsed_in_current) / W) + current_count`. If `weighted_count < limit`, allow and increment current_count. This approximates the true sliding window with very low error. Example: limit=100/minute. Previous minute had 80 requests. Current minute is 40 seconds in with 30 requests. Weighted count = 80 * (20/60) + 30 = 26.67 + 30 = 56.67. Under limit, allow. Memory: O(1) per client (just two counters and a window timestamp). Error rate is typically < 1% in practice.",
    "## Distributed Rate Limiting\n\nIn a multi-server deployment, each server sees only a fraction of a client's requests. Options: (1) **Local rate limiting**: each server enforces its own limit. If you have N servers and want a global limit of L, set each server's limit to L/N. Simple but inaccurate when traffic is unevenly distributed. (2) **Centralized rate limiting**: all servers check a shared store (Redis). Accurate but adds a network round-trip to every request. Use Redis with Lua scripts for atomic operations. (3) **Hybrid**: local rate limiter as a first pass (fast, approximate), with periodic sync to a central store for accuracy. **Redis Lua script for token bucket**: `EVAL` a script that reads the bucket, computes refill, checks and decrements atomically. This avoids race conditions between multiple servers checking the same client's bucket concurrently.",
    "## Production Considerations\n\n**Response headers**: include `X-RateLimit-Limit` (max requests), `X-RateLimit-Remaining` (requests left), `X-RateLimit-Reset` (when the window resets), and `Retry-After` (seconds until the client can retry). **Multiple rate limits**: apply different limits at different granularities (100/min per user, 10000/min per API key, 50000/min global). Check all applicable limits; reject if any is exceeded. **Rate limit by**: IP address (for unauthenticated traffic), user ID (for authenticated), API key, or a combination. **Graceful degradation**: instead of hard rejection (429), consider throttling (slowing responses), queueing (processing later), or degraded responses (cached/simplified data). **Monitoring**: track rate limit hits, rejection rates per client, and latency added by the limiter. Alert on sudden spikes in rejections (potential attack or misconfiguration).",
  ],
  interviewQA: [
    {
      q: "What is the boundary burst problem in fixed window rate limiting?",
      a: "If the limit is 100 requests per minute, a client can send 100 requests at second 59 of window 1 and 100 requests at second 0 of window 2, getting 200 requests in 2 seconds while technically staying within the limit for each window. This defeats the purpose of rate limiting during that burst. The sliding window counter solves this by weighting the previous window's count based on how much of it overlaps with the current sliding window, preventing the boundary exploit.",
    },
    {
      q: "How would you implement rate limiting in a distributed microservices architecture?",
      a: "Use a centralized Redis instance with Lua scripts for atomic rate limit checks. Each API gateway or service middleware calls Redis before processing a request. The Lua script implements the chosen algorithm (token bucket or sliding window counter) atomically. For very high throughput, use a hybrid approach: a local in-memory rate limiter handles the fast path (allowing requests clearly under the limit), syncing with Redis periodically. This reduces Redis round-trips while maintaining approximate global accuracy. If Redis is temporarily unavailable, fall back to local-only limiting with conservative limits to avoid overload.",
    },
    {
      q: "When would you choose token bucket over sliding window?",
      a: "Choose token bucket when you want to allow controlled bursts. For example, an API that can handle short traffic spikes but needs to limit sustained load. The bucket capacity defines the maximum burst size, and the refill rate defines the sustained limit. Choose sliding window counter when you want strict, uniform rate enforcement with no bursts. For example, a payment processing API where you genuinely cannot handle more than N transactions per minute regardless of burst pattern. Sliding window is also simpler to reason about: 'N requests per minute' is the literal behavior.",
    },
    {
      q: "How do you handle rate limiting for different tiers of users?",
      a: "Define rate limit rules per tier: free users get 100 req/min, premium get 1000, enterprise get 10000. Store the mapping in a configuration store. When a request arrives: (1) Extract the user/API key from the request. (2) Look up their tier and corresponding limits. (3) Apply the limits using the chosen algorithm. For multiple dimensions: apply per-user, per-endpoint, and global limits independently. A request must pass all applicable limits. Store limits in a rules engine that supports dynamic updates so you can change limits without redeploying.",
    },
  ],
  followUps: [
    "Why does a fixed window allow a 2× burst at the boundary?",
    "Fail open or fail closed when the counter store is down?",
    "How do you rate limit fairly across tenants of very different sizes?",
  ],
  mcqs: [
    {
      q: "In a token bucket algorithm, what does the bucket capacity (maxTokens) control?",
      options: [
        "The sustained request rate",
        "The maximum burst size allowed",
        "The time window for counting requests",
        "The number of clients supported",
      ],
      answerIndex: 1,
      explanation:
        "The bucket capacity determines the maximum number of requests that can be made in a short burst. The refill rate controls the sustained long-term rate. Together, they allow controlled bursts while limiting average throughput.",
    },
    {
      q: "The sliding window counter approximates a true sliding window by:",
      options: [
        "Storing the timestamp of every request",
        "Using only the current window's count",
        "Weighting the previous window's count by the overlap fraction with the current window",
        "Rounding timestamps to the nearest second",
      ],
      answerIndex: 2,
      explanation:
        "The sliding window counter computes: prev_count * overlap_fraction + current_count. This approximates the true sliding window with O(1) memory instead of O(n) for a sliding window log.",
    },
    {
      q: "Why are Lua scripts used with Redis for distributed rate limiting?",
      options: [
        "Lua is faster than Redis commands",
        "Lua scripts execute atomically on Redis, preventing race conditions",
        "Lua provides better error handling",
        "Lua enables persistent storage in Redis",
      ],
      answerIndex: 1,
      explanation:
        "Redis executes Lua scripts atomically: no other command can interleave. This is critical for rate limiting where the check-and-update must be atomic to prevent race conditions where multiple servers simultaneously read and update the same counter.",
    },
    {
      q: "Which HTTP status code should a rate limiter return when a request is rejected?",
      options: [
        "400 Bad Request",
        "403 Forbidden",
        "429 Too Many Requests",
        "503 Service Unavailable",
      ],
      answerIndex: 2,
      explanation:
        "HTTP 429 Too Many Requests specifically indicates that the client has sent too many requests in a given time period. It should include a Retry-After header telling the client when to retry.",
    },
  ],
  flashcards: [
    {
      front: "How does the token bucket algorithm work?",
      back: "A bucket holds up to maxTokens tokens, refilled at a constant rate. Each request consumes one token. If the bucket is empty, the request is rejected. Allows bursts up to bucket capacity while maintaining a steady average rate. State: token count + last refill timestamp.",
    },
    {
      front: "What is the boundary burst problem?",
      back: "In fixed window rate limiting, a client can send the maximum requests at the end of one window and the maximum at the start of the next, effectively doubling the rate over a short period spanning the window boundary.",
    },
    {
      front: "How does the sliding window counter work?",
      back: "Track request counts per fixed window. Approximate the sliding window: weighted_count = prev_window_count * overlap_fraction + current_window_count. O(1) memory per client, <1% error in practice. Solves the boundary burst problem.",
    },
    {
      front: "What is the leaky bucket algorithm?",
      back: "Requests enter a FIFO queue (bucket). They are processed at a fixed output rate. If the queue is full, new requests are dropped. Unlike token bucket, leaky bucket produces a perfectly smooth output rate with no bursts.",
    },
    {
      front: "What response headers should a rate limiter include?",
      back: "X-RateLimit-Limit: maximum allowed requests. X-RateLimit-Remaining: requests left in current window. X-RateLimit-Reset: timestamp when the window resets. Retry-After: seconds until the client should retry (on 429 responses).",
    },
    {
      front: "How does distributed rate limiting with Redis work?",
      back: "All servers check a shared Redis instance. A Lua script atomically reads the bucket/counter, updates it, and returns allow/deny. Lua scripts run atomically in Redis, preventing race conditions. Trade-off: adds a network round-trip per request.",
    },
    {
      front: "What is the difference between local and global rate limiting?",
      back: "Local: each server enforces its own limit (limit/N per server). Fast but inaccurate if traffic is unevenly distributed. Global: all servers check a centralized store (Redis). Accurate but adds latency. Hybrid: local fast path with periodic global sync.",
    },
  ],
  deepDive: [
    "**Rate limiting** is far more than a simple counter — it is a critical component of any production-grade distributed system. At its core, a rate limiter must make a **sub-millisecond decision** on every incoming request: *allow* or *reject*. This decision depends on the **algorithm chosen**, the **granularity of tracking** (per IP, per user, per API key, per endpoint), and the **storage backend** used to maintain state. In high-throughput systems handling millions of requests per second, the rate limiter itself must not become a bottleneck. This means the algorithm must operate in **O(1) time and space** per check, and the storage layer must support **atomic read-modify-write** operations. The *Token Bucket* algorithm achieves this with a **lazy refill** strategy: rather than running a background timer to add tokens, it calculates how many tokens *should have been added* since the last request, using `elapsed_time * refill_rate`. This makes each check a simple arithmetic operation with two state variables (`tokens` and `last_refill_ts`), stored per client. The *Sliding Window Counter* similarly achieves O(1) by maintaining just two counters per window and computing a **weighted approximation** of the true sliding count.",
    "In a **distributed microservices architecture**, rate limiting introduces the challenge of **shared mutable state** across multiple server instances. A naive approach — each server maintaining its own local counter — fails because traffic is rarely evenly distributed across nodes. Consider a system with 4 servers and a global limit of 1000 req/min: setting each server to 250 req/min means a client whose requests all hit the same server gets only 250, while one with evenly distributed traffic gets the full 1000. The standard solution is a **centralized store like Redis**. The key insight is that the *check-and-update* operation must be **atomic**. Redis provides this through **Lua scripting**: a Lua script executes on the Redis server in a single, uninterruptible step. For the token bucket algorithm, the Lua script reads the current `tokens` and `last_refill_ts`, calculates the refill, checks if tokens are available, decrements if so, writes back the updated state, and returns the result — all *atomically*. Without this atomicity, a **TOCTOU race condition** occurs: two servers read the same token count (say, 1), both decide to allow, and both decrement, resulting in a **negative token count** and exceeding the rate limit.",
    "**Advanced production patterns** go beyond basic allow/reject. **Multi-tier rate limiting** applies different limits at different scopes simultaneously: per-user (100 req/min), per-API-key (10,000 req/min), and global (1,000,000 req/min). A request must pass *all* applicable tiers. This is implemented as a **chain of rate limiters**, each checking its own scope. **Adaptive rate limiting** dynamically adjusts limits based on system health: when CPU usage exceeds 80% or p99 latency spikes, the limiter *tightens* automatically, shedding load before the system degrades. **Graceful degradation** strategies include *throttling* (adding artificial delay via `setTimeout` or `sleep` rather than rejecting), *queueing* (buffering requests in a queue for later processing), and *degraded responses* (returning cached or simplified data). The **`Retry-After`** header is essential for client-side cooperation: it tells clients *exactly* when to retry, preventing thundering herd retries. Finally, **rate limit observability** is critical — tracking metrics like `rate_limit_hits_total`, `rate_limit_rejections_total`, and `rate_limit_latency_seconds` enables alerting on potential attacks or misconfigurations.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Token Bucket Rate Limiter in C++",
      source: `#include <chrono>
#include <mutex>
#include <unordered_map>
#include <string>

class TokenBucket {
private:
    double maxTokens_;
    double refillRate_;  // tokens per second
    double tokens_;
    std::chrono::steady_clock::time_point lastRefill_;
    std::mutex mutex_;

    void refill() {
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(
            now - lastRefill_).count();
        tokens_ = std::min(maxTokens_, tokens_ + elapsed * refillRate_);
        lastRefill_ = now;
    }

public:
    TokenBucket(double maxTokens, double refillRate)
        : maxTokens_(maxTokens),
          refillRate_(refillRate),
          tokens_(maxTokens),
          lastRefill_(std::chrono::steady_clock::now()) {}

    // Returns true if the request is allowed
    bool tryConsume(double tokens = 1.0) {
        std::lock_guard<std::mutex> lock(mutex_);
        refill();
        if (tokens_ >= tokens) {
            tokens_ -= tokens;
            return true;  // Request allowed
        }
        return false;  // Request rejected (429)
    }

    double remainingTokens() {
        std::lock_guard<std::mutex> lock(mutex_);
        refill();
        return tokens_;
    }
};

// Per-client rate limiter using a map of buckets
class RateLimiter {
private:
    double maxTokens_;
    double refillRate_;
    std::unordered_map<std::string, TokenBucket> buckets_;
    std::mutex mapMutex_;

public:
    RateLimiter(double maxTokens, double refillRate)
        : maxTokens_(maxTokens), refillRate_(refillRate) {}

    bool allowRequest(const std::string& clientId) {
        std::lock_guard<std::mutex> lock(mapMutex_);
        auto it = buckets_.find(clientId);
        if (it == buckets_.end()) {
            auto [newIt, _] = buckets_.emplace(
                clientId, TokenBucket(maxTokens_, refillRate_));
            return newIt->second.tryConsume();
        }
        return it->second.tryConsume();
    }
};`,
    },
    {
      language: "cpp",
      caption: "Sliding Window Counter Rate Limiter in C++",
      source: `#include <chrono>
#include <mutex>

class SlidingWindowCounter {
private:
    int limit_;                   // max requests per window
    int windowSizeMs_;            // window duration in milliseconds
    int prevCount_ = 0;
    int currCount_ = 0;
    int64_t currWindowStart_ = 0; // ms since epoch
    std::mutex mutex_;

    int64_t nowMs() {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now().time_since_epoch()
        ).count();
    }

public:
    SlidingWindowCounter(int limit, int windowSizeMs)
        : limit_(limit), windowSizeMs_(windowSizeMs),
          currWindowStart_(0) {}

    bool allowRequest() {
        std::lock_guard<std::mutex> lock(mutex_);
        int64_t now = nowMs();

        // Initialize on first call
        if (currWindowStart_ == 0) {
            currWindowStart_ = now;
        }

        // Advance windows if needed
        int64_t elapsed = now - currWindowStart_;
        if (elapsed >= windowSizeMs_ * 2) {
            // Skipped an entire window
            prevCount_ = 0;
            currCount_ = 0;
            currWindowStart_ = now;
        } else if (elapsed >= windowSizeMs_) {
            // Move to next window
            prevCount_ = currCount_;
            currCount_ = 0;
            currWindowStart_ += windowSizeMs_;
        }

        // Compute weighted count
        double elapsedInCurr = static_cast<double>(
            now - currWindowStart_);
        double overlapFraction =
            (windowSizeMs_ - elapsedInCurr) / windowSizeMs_;
        double weightedCount =
            prevCount_ * overlapFraction + currCount_;

        if (weightedCount < limit_) {
            currCount_++;
            return true;  // Allowed
        }
        return false;     // Rejected
    }
};`,
    },
    {
      language: "typescript",
      caption: "Express.js Rate Limiting Middleware with Redis (Token Bucket)",
      source: `import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

const redis = new Redis({ host: "127.0.0.1", port: 6379 });

// Lua script for atomic token bucket check-and-update
const TOKEN_BUCKET_SCRIPT = \`
  local key = KEYS[1]
  local maxTokens = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
  local tokens = tonumber(bucket[1]) or maxTokens
  local lastRefill = tonumber(bucket[2]) or now

  -- Refill tokens based on elapsed time
  local elapsed = (now - lastRefill) / 1000
  tokens = math.min(maxTokens, tokens + elapsed * refillRate)

  if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
    redis.call('EXPIRE', key, math.ceil(maxTokens / refillRate) + 10)
    return {1, math.floor(tokens)}  -- allowed, remaining
  else
    redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
    redis.call('EXPIRE', key, math.ceil(maxTokens / refillRate) + 10)
    return {0, 0}                   -- rejected, remaining
  end
\`;

interface RateLimitOptions {
  maxTokens: number;   // Burst capacity
  refillRate: number;   // Tokens per second
  keyPrefix?: string;
}

function rateLimiter(options: RateLimitOptions) {
  const { maxTokens, refillRate, keyPrefix = "rl" } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Identify client by IP or authenticated user ID
    const clientId = (req as any).userId ?? req.ip ?? "unknown";
    const key = \`\${keyPrefix}:\${clientId}\`;
    const now = Date.now();

    try {
      const [allowed, remaining] = (await redis.eval(
        TOKEN_BUCKET_SCRIPT, 1, key, maxTokens, refillRate, now
      )) as [number, number];

      // Set standard rate limit headers
      res.set("X-RateLimit-Limit", String(maxTokens));
      res.set("X-RateLimit-Remaining", String(remaining));

      if (allowed === 1) {
        return next();  // Request passes
      }

      // Calculate retry delay
      const retryAfter = Math.ceil(1 / refillRate);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: "Too Many Requests",
        message: \`Rate limit exceeded. Retry after \${retryAfter}s.\`,
        retryAfter,
      });
    } catch (err) {
      // If Redis is down, fail open (allow) or fail closed (deny)
      console.error("Rate limiter error:", err);
      return next();  // Fail open — adjust for your risk tolerance
    }
  };
}

// Usage in Express app:
// app.use("/api/", rateLimiter({ maxTokens: 100, refillRate: 10 }));
// app.use("/api/payments", rateLimiter({ maxTokens: 10, refillRate: 1 }));

export { rateLimiter };`,
    },
  ],
  diagrams: [
    {
      title: "Rate Limiter Architecture",
      kind: "architecture",
      caption: "Rate limiter sits between clients and backend services. It uses Redis for distributed atomic state and returns 429 to blocked clients.",
      mermaid: `graph TB
    C1["Client A"]
    C2["Client B"]
    GW["API Gateway"]
    RL["Rate Limiter Middleware"]
    REDIS["Redis - Token Buckets"]
    LB["Load Balancer"]
    S1["Service Instance 1"]
    S2["Service Instance 2"]
    C1 --> GW
    C2 --> GW
    GW --> RL
    RL --> REDIS
    RL -->|Allowed| LB
    RL -->|429 Too Many Requests| C1
    LB --> S1
    LB --> S2`,
    },
    {
      title: "Token Bucket Algorithm Flow",
      kind: "flow",
      caption: "On each request the bucket is refilled by elapsed time times refill rate, then one token is consumed if available.",
      mermaid: `flowchart TD
    A[Request Arrives] --> B[Calculate elapsed time since last refill]
    B --> C[Add elapsed times refillRate tokens]
    C --> D{tokens greater than maxTokens?}
    D -->|Yes| E[Cap tokens at maxTokens]
    D -->|No| F[Keep current token count]
    E --> G{tokens greater than or equal to 1?}
    F --> G
    G -->|Yes| H[Decrement tokens by 1]
    H --> I[Return 200 OK]
    G -->|No| J[Return 429 Too Many Requests]`,
    },
    {
      title: "Rate Limiting Algorithm Comparison",
      kind: "mindmap",
      caption: "Four main rate limiting algorithms compared by burst handling, memory usage, accuracy, and best use case.",
      mermaid: `mindmap
  root[Rate Limiting Algorithms]
    Token Bucket
      Allows bursts up to maxTokens
      O1 memory per client
      Best for APIs with spiky traffic
    Leaky Bucket
      Smooth constant output rate
      No bursts allowed
      Best for downstream protection
    Fixed Window Counter
      Simplest implementation
      Boundary burst problem
      O1 memory per client
    Sliding Window Counter
      Near-perfect accuracy
      Weighted approximation
      Best general-purpose choice`,
    },
    {
      title: "Distributed Rate Limiter Sequence",
      kind: "sequence",
      caption: "Lua script executes atomically on Redis to check and decrement the token bucket, ensuring no race conditions across multiple API server instances.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant API as API Server
    participant RL as Rate Limiter
    participant R as Redis
    C->>API: HTTP Request
    API->>RL: Check limit for clientId
    RL->>R: Execute Lua script atomic check and decrement
    R-->>RL: allowed=true tokens=8
    RL-->>API: Allowed
    API-->>C: 200 OK with X-RateLimit headers
    C->>API: Another request
    API->>RL: Check limit for clientId
    RL->>R: Execute Lua script
    R-->>RL: allowed=false retry_after=12s
    RL-->>API: Blocked
    API-->>C: 429 Too Many Requests`,
    },
  ],
  animations: [
    {
      title: "Token bucket in action",
      steps: [
        {
          label: "Bucket",
          detail: "Capacity 10 tokens, refilling at 1 per second. Starts full.",
        },
        {
          label: "Burst of 10",
          detail: "All succeed instantly, draining the bucket. Bursts are allowed by design.",
        },
        {
          label: "11th request",
          detail: "Bucket empty → 429 with `Retry-After: 1`.",
        },
        {
          label: "One second later",
          detail: "One token refilled; one request allowed.",
        },
        {
          label: "Sustained rate",
          detail: "Long-run throughput settles at the refill rate; the capacity governs burst size.",
        },
        {
          label: "Distributed",
          detail: "Bucket state in Redis, updated by an atomic Lua script — in-process state would multiply the limit by instance count.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Token Bucket",
      "Leaky Bucket",
      "Sliding Window Counter",
    ],
    rows: [
      [
        "**Burst handling**",
        "Allows bursts up to `maxTokens`",
        "No bursts — constant output rate",
        "Smooth; no boundary bursts",
      ],
      [
        "**Memory per client**",
        "*O(1)* — 2 values (`tokens`, `lastRefill`)",
        "*O(queue size)* — bounded FIFO queue",
        "*O(1)* — 2 counters + timestamp",
      ],
      [
        "**Accuracy**",
        "Exact for burst + sustained rate",
        "Exact — FIFO guarantees order",
        "Approximate (~1% error typical)",
      ],
      [
        "**Time complexity**",
        "*O(1)* per request",
        "*O(1)* enqueue/dequeue",
        "*O(1)* per request",
      ],
      [
        "**Implementation complexity**",
        "Low — lazy refill arithmetic",
        "Medium — requires queue management",
        "Low — two counters + weighted sum",
      ],
      [
        "**Best suited for**",
        "APIs tolerating short bursts",
        "Downstream systems needing smooth input",
        "General-purpose rate limiting",
      ],
      [
        "**Distributed support**",
        "Redis + Lua script (atomic)",
        "Harder — queue state is complex",
        "Redis + Lua script (atomic)",
      ],
      [
        "**Boundary burst problem**",
        "N/A (not window-based)",
        "N/A (not window-based)",
        "Solved via weighted approximation",
      ],
    ],
  },
  exercises: [
    "**Design a multi-tier rate limiter**: Implement a rate limiter that enforces three simultaneous limits — 10 requests/second per user, 500 requests/minute per API key, and 50,000 requests/hour globally. Define the data structures, storage layout in Redis, and the Lua script that checks all three tiers atomically. How do you handle the case where one tier allows but another rejects?",
    "**Implement a sliding window log** in C++ using `std::deque<int64_t>` to store timestamps. Support `allowRequest(clientId)` and `cleanup()` methods. Analyze the memory usage for 10,000 clients each making 100 requests/minute. Compare the memory footprint to the sliding window counter approach and discuss when the log's perfect accuracy justifies the extra memory.",
    "**Build an adaptive rate limiter**: Design a rate limiter that automatically tightens its limits when the system is under stress (high CPU, high latency, high error rate). Define the health metrics it monitors, the algorithm for adjusting limits (e.g., *AIMD — Additive Increase, Multiplicative Decrease*), and how it recovers when the system stabilizes. Implement the core logic in Node.js/TypeScript.",
    "**Handle Redis failover**: Your distributed rate limiter uses Redis as the central store. Design the behavior when Redis becomes unavailable. Consider: Should you *fail open* (allow all requests) or *fail closed* (reject all)? How do you implement a local fallback with periodic sync? Write the Express middleware that gracefully degrades when the Redis connection drops.",
    "**Rate limiting WebSocket connections**: Design a rate limiter for a WebSocket-based chat application. Unlike HTTP, WebSocket connections are long-lived. Define how you limit: (a) connection establishment rate, (b) message send rate per connection, and (c) payload size per time window. Discuss how the token bucket parameters differ from a REST API rate limiter.",
  ],
  cheatSheet: [
    "**Token Bucket formula**: `tokens = min(maxTokens, tokens + elapsed * refillRate)`. If `tokens >= 1`, allow and decrement. Two params: `maxTokens` (burst size), `refillRate` (sustained rate).",
    "**Sliding Window Counter formula**: `weighted_count = prev_count * ((window_size - elapsed_in_current) / window_size) + current_count`. If `weighted_count < limit`, allow and increment `current_count`.",
    "**Redis atomic pattern**: Use `EVAL` with a Lua script to perform read-check-update in a single atomic operation. Never do separate `GET` then `SET` — this creates a **TOCTOU race condition** in distributed systems.",
    "**HTTP 429 response headers**: Always include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (Unix timestamp), and `Retry-After` (seconds). These are essential for well-behaved clients.",
    "**Rule of thumb for distributed limiting**: Use *local* rate limiting (limit/N per node) only when traffic is evenly distributed. Use *centralized* Redis when accuracy matters. Use *hybrid* (local fast path + periodic Redis sync) for ultra-low-latency requirements.",
    "**Key design decisions checklist**: (1) Algorithm choice based on burst tolerance, (2) Scope — per IP, user, API key, or endpoint, (3) Storage — in-memory vs Redis vs hybrid, (4) Failure mode — fail open vs fail closed, (5) Response — hard reject (429) vs throttle vs degrade.",
  ],
  revisionNotes: [
    "**Core algorithms**: *Fixed Window* is simplest but has the **boundary burst problem**. *Sliding Window Counter* solves it with a **weighted approximation** using O(1) memory. *Token Bucket* allows **controlled bursts** (burst size = `maxTokens`, sustained rate = `refillRate`). *Leaky Bucket* produces **smooth, constant-rate output** via a FIFO queue. *Sliding Window Log* is **perfectly accurate** but uses O(n) memory per client.",
    "**Distributed rate limiting** requires **atomic operations** to prevent race conditions. Redis + Lua scripts provide atomicity. The Lua script reads state, computes the decision, and writes updated state in a **single uninterruptible step**. Without atomicity, concurrent requests can bypass the limit via **TOCTOU (Time of Check, Time of Use)** vulnerabilities.",
    "**Production essentials**: Return proper **HTTP 429** with `Retry-After` header. Implement **multi-tier limits** (per-user, per-key, global) as a chain — request must pass *all* tiers. Support **graceful degradation**: fail open (allow on Redis failure) for availability-critical services, fail closed (reject) for security-critical ones. Monitor `rejection_rate` and alert on anomalies.",
    "**Trade-off matrix**: Token Bucket trades burst allowance for slightly more complex tuning (two params). Sliding Window Counter trades ~1% accuracy for O(1) memory. Centralized (Redis) rate limiting trades an extra network round-trip (~1ms) for global accuracy. Local-only limiting trades accuracy for zero added latency. Choose based on your system's **primary constraint**: accuracy, latency, or simplicity.",
    "**Interview talking points**: Rate limiter placement (API Gateway vs middleware vs per-service). Why Lua scripts in Redis (atomicity without distributed locks). How to handle rate limit key extraction (IP for unauthenticated, user ID for authenticated, composite keys for fine-grained control). Adaptive limiting with AIMD. The relationship between rate limiting and **circuit breakers** (rate limiting prevents overload *from clients*; circuit breakers prevent cascading failures *between services*).",
  ],
  resources: [
    {
      label: "System Design Interview — Alex Xu",
      kind: "book",
    },
    {
      label: "Stripe engineering — Scaling your API with rate limiters",
      kind: "article",
    },
  ],
  glossary: [
    {
      term: "Token Bucket",
      definition:
        "A rate limiting algorithm using a bucket that fills with tokens at a fixed rate. Requests consume tokens; empty bucket means rejection. Allows controlled bursts.",
    },
    {
      term: "Leaky Bucket",
      definition:
        "A rate limiting algorithm where requests queue in a bucket and are processed at a constant rate. Full bucket means new requests are dropped. Produces smooth, burst-free output.",
    },
    {
      term: "Sliding Window Log",
      definition:
        "A rate limiting algorithm that stores exact timestamps of all requests within the window. Perfectly accurate but uses O(n) memory per client.",
    },
    {
      term: "Sliding Window Counter",
      definition:
        "A rate limiting algorithm that approximates the sliding window by weighting the previous fixed window's count. O(1) memory with near-perfect accuracy.",
    },
    {
      term: "Fixed Window Counter",
      definition:
        "The simplest rate limiting algorithm: count requests in fixed time windows. Subject to the boundary burst problem at window edges.",
    },
    {
      term: "429 Too Many Requests",
      definition:
        "The HTTP status code indicating that the client has exceeded its rate limit. Should include a Retry-After header.",
    },
    {
      term: "Rate Limit Rule",
      definition:
        "A configuration specifying the limit (number of requests), window (time period), and scope (per user, per IP, per API key, per endpoint) for rate limiting.",
    },
  ],
};
