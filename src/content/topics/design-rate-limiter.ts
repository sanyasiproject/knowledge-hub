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
