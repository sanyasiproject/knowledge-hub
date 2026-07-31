import type { TopicContent } from "../types";

export const rateLimiting: TopicContent = {
  quickSummary: [
    "Rate limiting controls how many requests a client can make in a given time window — it protects services from abuse, ensures fair usage, and prevents cascading failures under load.",
    "The five main algorithms are: fixed window, sliding window log, sliding window counter, token bucket, and leaky bucket. Each trades off precision, memory, and implementation complexity differently.",
    "In distributed systems, rate limiting typically uses Redis with atomic operations (INCR + EXPIRE or Lua scripts) to maintain shared counters across multiple server instances.",
  ],
  detailed: [
    "Fixed window counting divides time into discrete windows (e.g., 1-minute intervals starting at :00, :01, :02). Each request increments a counter for the current window. When the counter exceeds the limit, requests are rejected. The problem: a burst at the end of one window plus a burst at the start of the next allows 2x the intended rate. For example, with a 100 req/min limit, a client could send 100 requests at 0:59 and 100 more at 1:00, achieving 200 requests in 2 seconds.",
    "Sliding window log stores the timestamp of every request in a sorted set. To check the rate, you remove timestamps older than the window and count the remaining entries. This is perfectly accurate but memory-intensive — storing timestamps for every request from every client can be expensive at scale.",
    "Sliding window counter combines fixed window and sliding window approaches. It maintains counters for the current and previous windows, then weights them based on the overlap. For example, if we're 30% into the current minute, the estimated count is (previous window count * 0.7) + (current window count). This is memory-efficient (two counters per client) and smooth (no burst-at-boundary problem), with only a small approximation error.",
    "Token bucket allows bursts up to a maximum capacity while enforcing an average rate. The bucket holds tokens; each request consumes one token. Tokens are added at a fixed refill rate. If the bucket is empty, the request is rejected (or queued). The bucket capacity determines the maximum burst size, and the refill rate determines the sustained throughput. This is the most commonly used algorithm in production systems (used by AWS, Stripe, and most API gateways).",
    "Leaky bucket processes requests at a fixed rate, like water leaking from a bucket at a constant drip. Incoming requests are added to a queue (the bucket). If the queue is full, new requests are rejected. Unlike token bucket, leaky bucket smooths out bursts — requests are always processed at the same rate. This is ideal when the downstream system cannot handle any bursts.",
    "Distributed rate limiting requires a shared store (typically Redis) accessible by all server instances. The basic pattern uses INCR to atomically increment a counter and EXPIRE to set the TTL. For token bucket, a Lua script atomically reads the current token count, calculates tokens added since the last request, deducts a token, and returns the result. Redis's single-threaded execution model guarantees atomicity without explicit locks.",
    "Rate limit response headers communicate limits to clients: X-RateLimit-Limit (max requests per window), X-RateLimit-Remaining (requests left in current window), X-RateLimit-Reset (Unix timestamp when the window resets), and Retry-After (seconds to wait before retrying, sent with 429 responses). The IETF has proposed standardized headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset) in RFC 6585 and draft-ietf-httpapi-ratelimit-headers.",
  ],
  deepDive: [
    "Rate limiting strategies can be layered: per-IP for anonymous traffic, per-API-key for authenticated clients, per-user for logged-in users, and per-endpoint for expensive operations. Different endpoints may have different limits — a search endpoint might allow 10 req/min while a read endpoint allows 100 req/min. This is often called tiered or hierarchical rate limiting.",
    "In microservice architectures, rate limiting can happen at multiple levels: at the API gateway (global limits), at individual services (service-specific limits), and at the database level (connection pool limits). The gateway handles coarse-grained limits, while services enforce fine-grained limits specific to their resources.",
    "Graceful degradation under rate limiting: instead of hard rejection (429), consider returning cached or stale data, reducing response quality (fewer results, lower resolution), or prioritizing requests by client tier. Some systems implement a 'soft' rate limit that logs and alerts but doesn't reject, alongside a 'hard' limit that does.",
    "Race conditions in distributed rate limiting: even with Redis INCR (which is atomic), a check-then-act pattern (GET count, if count < limit, INCR) has a race condition. Two requests could both read count=99 (limit=100), both pass the check, and both increment to 101. Solution: always use atomic increment-and-check (INCR first, then check if the result exceeds the limit) or Lua scripts that combine the operations atomically.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Token bucket rate limiter with Redis (Lua script for atomicity)",
      source: `import Redis from "ioredis";

const redis = new Redis();

// Lua script for atomic token bucket check-and-consume
const TOKEN_BUCKET_SCRIPT = \`
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])  -- tokens per second
  local now = tonumber(ARGV[3])
  local requested = tonumber(ARGV[4])

  local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
  local tokens = tonumber(data[1])
  local lastRefill = tonumber(data[2])

  -- Initialize if first request
  if tokens == nil then
    tokens = capacity
    lastRefill = now
  end

  -- Add tokens based on elapsed time
  local elapsed = now - lastRefill
  tokens = math.min(capacity, tokens + (elapsed * refillRate))

  local allowed = 0
  local remaining = tokens

  if tokens >= requested then
    tokens = tokens - requested
    allowed = 1
    remaining = tokens
  end

  redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
  redis.call('EXPIRE', key, math.ceil(capacity / refillRate) * 2)

  return { allowed, math.floor(remaining) }
\`;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

async function checkRateLimit(
  clientId: string,
  capacity: number = 100,
  refillRate: number = 10  // 10 tokens per second
): Promise<RateLimitResult> {
  const key = \`ratelimit:\${clientId}\`;
  const now = Date.now() / 1000;

  const [allowed, remaining] = (await redis.eval(
    TOKEN_BUCKET_SCRIPT, 1, key, capacity, refillRate, now, 1
  )) as [number, number];

  return {
    allowed: allowed === 1,
    remaining,
    limit: capacity,
    resetAt: Math.ceil(now + (capacity - remaining) / refillRate),
  };
}`,
    },
    {
      language: "typescript",
      caption: "Sliding window counter rate limiter",
      source: `async function slidingWindowCheck(
  clientId: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Math.floor(Date.now() / 1000);
  const currentWindow = Math.floor(now / windowSeconds) * windowSeconds;
  const previousWindow = currentWindow - windowSeconds;
  const elapsedRatio = (now - currentWindow) / windowSeconds;

  const currentKey = \`sw:\${clientId}:\${currentWindow}\`;
  const previousKey = \`sw:\${clientId}:\${previousWindow}\`;

  const pipe = redis.pipeline();
  pipe.get(previousKey);
  pipe.get(currentKey);
  const results = await pipe.exec();

  const previousCount = parseInt((results![0][1] as string) || "0", 10);
  const currentCount = parseInt((results![1][1] as string) || "0", 10);

  // Weighted estimate: more of the previous window has elapsed,
  // so less of its count is relevant
  const estimatedCount =
    previousCount * (1 - elapsedRatio) + currentCount;

  if (estimatedCount >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Atomically increment current window counter
  await redis
    .pipeline()
    .incr(currentKey)
    .expire(currentKey, windowSeconds * 2)
    .exec();

  return {
    allowed: true,
    remaining: Math.max(0, Math.floor(limit - estimatedCount - 1)),
  };
}`,
    },
    {
      language: "typescript",
      caption: "Express middleware with rate limit headers",
      source: `import { Request, Response, NextFunction } from "express";

function rateLimitMiddleware(
  capacity: number = 100,
  refillRate: number = 10
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const result = await checkRateLimit(
      String(clientId), capacity, refillRate
    );

    // Always set rate limit headers
    res.set("X-RateLimit-Limit", String(capacity));
    res.set("X-RateLimit-Remaining", String(result.remaining));
    res.set("X-RateLimit-Reset", String(result.resetAt));

    if (!result.allowed) {
      const retryAfter = Math.ceil(result.resetAt - Date.now() / 1000);
      res.set("Retry-After", String(Math.max(1, retryAfter)));
      return res.status(429).json({
        error: "Too Many Requests",
        retryAfter: Math.max(1, retryAfter),
      });
    }

    next();
  };
}`,
    },
  ],
  diagrams: [
    {
      title: "Token Bucket Algorithm",
      kind: "flow",
      caption:
        "Tokens are added to the bucket at a fixed refill rate up to capacity. Each request consumes a token. When the bucket is empty, requests are rejected until tokens refill.",
    },
    {
      title: "Fixed Window vs Sliding Window",
      kind: "sequence",
      caption:
        "Fixed window allows bursts at window boundaries (2x rate). Sliding window weighs current and previous window counts to smooth the boundary.",
    },
    {
      title: "Distributed Rate Limiting Architecture",
      kind: "architecture",
      caption:
        "Multiple API server instances share a Redis cluster for rate limit state. Each request atomically checks and updates the counter via Lua scripts.",
    },
  ],
  animations: [
    {
      title: "Token Bucket in Action",
      steps: [
        { label: "Bucket initialized", detail: "Bucket starts full with capacity=5 tokens. Refill rate is 1 token/second." },
        { label: "Burst of 3 requests", detail: "3 requests arrive simultaneously. Each consumes 1 token. Bucket: 5 -> 4 -> 3 -> 2. All allowed." },
        { label: "Two more requests", detail: "2 more requests arrive. Bucket: 2 -> 1 -> 0. Both allowed, bucket now empty." },
        { label: "Request rejected", detail: "Another request arrives immediately. Bucket has 0 tokens. Request returns 429 Too Many Requests with Retry-After: 1." },
        { label: "Refill", detail: "1 second passes. 1 token is added to the bucket (refill rate = 1/s). Bucket: 0 -> 1." },
        { label: "Request allowed", detail: "Next request arrives, consumes the token. Bucket: 1 -> 0. Request succeeds." },
      ],
    },
  ],
  comparison: {
    columns: ["Algorithm", "Burst Handling", "Memory", "Precision", "Best For"],
    rows: [
      ["Fixed Window", "Allows 2x burst at boundary", "O(1) per client", "Low", "Simple, low-traffic APIs"],
      ["Sliding Window Log", "No boundary burst", "O(n) per client (timestamps)", "Exact", "When precision matters, low volume"],
      ["Sliding Window Counter", "Minimal boundary burst", "O(1) per client", "Approximate (small error)", "Production APIs needing accuracy + efficiency"],
      ["Token Bucket", "Allows controlled bursts up to capacity", "O(1) per client", "Exact", "Most APIs — flexible burst + sustained rate"],
      ["Leaky Bucket", "No bursts — constant output rate", "O(n) queue", "Exact", "Protecting fragile downstream services"],
    ],
  },
  interviewQA: [
    {
      q: "What's the difference between token bucket and leaky bucket?",
      a: "Token bucket allows bursts up to the bucket capacity while enforcing an average rate — a full bucket can absorb a burst of requests. Leaky bucket processes requests at a constant rate by queuing them, so it smooths out all bursts. Token bucket is better when bursts are acceptable; leaky bucket is better when the downstream system needs a constant request rate.",
      followUps: [
        "Which would you use for a payment processing API?",
        "How would you implement token bucket in a distributed system?",
      ],
    },
    {
      q: "How do you handle rate limiting in a distributed system with multiple server instances?",
      a: "Use a centralized store like Redis that all instances share. Atomic operations (INCR + EXPIRE, or Lua scripts for complex algorithms like token bucket) ensure consistency. The key concern is avoiding race conditions — always increment-then-check rather than check-then-increment. For extreme scale, you can use local approximate counters with periodic sync to Redis to reduce network calls.",
    },
    {
      q: "A client is hitting the rate limit but claims they're not sending that many requests. How do you debug this?",
      a: "Check: (1) Are multiple clients sharing the same API key or IP? NAT or proxies can make many clients appear as one. (2) Is the client retrying failed requests aggressively, creating a retry storm? (3) Is the rate limit key correct — per-user vs per-IP vs per-API-key? (4) Check the server logs for the actual request timestamps and counts. (5) Ensure the client is reading and respecting the Retry-After header.",
    },
  ],
  mcqs: [
    {
      q: "What problem does the sliding window counter solve compared to fixed window?",
      options: [
        "It uses less memory",
        "It eliminates the boundary burst problem where 2x the rate is allowed",
        "It supports distributed systems",
        "It allows higher throughput",
      ],
      answerIndex: 1,
      explanation:
        "Fixed window allows a burst at the boundary between two windows (e.g., 100 requests at :59 and 100 at :00). Sliding window counter weights the previous and current window counts, smoothing this boundary.",
    },
    {
      q: "In a token bucket with capacity=10 and refill rate=2/sec, what is the maximum burst size?",
      options: ["2 requests", "10 requests", "20 requests", "Unlimited"],
      answerIndex: 1,
      explanation:
        "The maximum burst size equals the bucket capacity. A full bucket can serve 10 requests instantly, then requests are limited to 2 per second (the refill rate) until the bucket refills.",
    },
    {
      q: "Why should you use INCR-then-check rather than check-then-INCR for Redis-based rate limiting?",
      options: [
        "INCR is faster than GET",
        "It avoids a race condition where two requests both pass the check before either increments",
        "Redis doesn't support GET",
        "It reduces memory usage",
      ],
      answerIndex: 1,
      explanation:
        "GET-then-INCR has a TOCTOU race: two requests can both read count=99 (limit=100), both pass, and both increment to 101, exceeding the limit. INCR-then-check atomically increments first, so only one request sees 100 and the next sees 101 and is rejected.",
    },
  ],
  flashcards: [
    { front: "What HTTP status code indicates rate limiting?", back: "429 Too Many Requests. Include a Retry-After header with the number of seconds the client should wait." },
    { front: "What are the standard rate limit response headers?", back: "X-RateLimit-Limit (max requests), X-RateLimit-Remaining (requests left), X-RateLimit-Reset (when window resets), Retry-After (seconds to wait on 429)." },
    { front: "Why use Lua scripts in Redis for rate limiting?", back: "Lua scripts execute atomically in Redis's single-threaded model, preventing race conditions between read-check-update operations across multiple commands." },
    { front: "Token bucket capacity vs refill rate?", back: "Capacity = max burst size (requests that can be served instantly). Refill rate = sustained throughput (tokens added per second). Together they define the rate limit shape." },
    { front: "What is the GCRA (Generic Cell Rate Algorithm)?", back: "A variation of the leaky bucket used in networking. It tracks the 'theoretical arrival time' of the next allowed request rather than maintaining a queue or counter." },
  ],
  revisionNotes: [
    "Fixed window: simple counter per time interval, allows 2x burst at boundaries.",
    "Sliding window log: stores all timestamps, exact but memory-intensive.",
    "Sliding window counter: weights current + previous window counts, efficient and smooth.",
    "Token bucket: allows bursts up to capacity, refills at a fixed rate. Most popular in production.",
    "Leaky bucket: constant output rate, queues requests. Ideal for protecting fragile backends.",
    "Distributed: use Redis with atomic INCR or Lua scripts. Always increment-then-check.",
    "Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After.",
    "Layer limits: per-IP, per-API-key, per-user, per-endpoint with different thresholds.",
  ],
  cheatSheet: [
    "429 Too Many Requests + Retry-After header",
    "Token bucket: capacity = burst size, refill rate = sustained rate",
    "Redis INCR + EXPIRE for fixed window (atomic, simple)",
    "Redis Lua script for token bucket (atomic read-refill-consume)",
    "Sliding window: weight = previousCount * (1 - elapsed%) + currentCount",
    "Always increment-then-check, never check-then-increment (race condition)",
    "Key pattern: ratelimit:{clientId}:{windowTimestamp}",
    "Layer: gateway (global) -> service (per-endpoint) -> DB (connection pool)",
  ],
  resources: [
    { label: "Stripe Rate Limiting Blog Post", kind: "article", note: "Detailed walkthrough of Stripe's rate limiting architecture using token bucket." },
    { label: "Redis Rate Limiting Pattern", kind: "docs", note: "Official Redis documentation on rate limiting with INCR and Lua scripts." },
    { label: "IETF RateLimit Header Fields (Draft)", kind: "docs", note: "Draft standard for rate limit response headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)." },
    { label: "System Design Interview Rate Limiter Chapter", kind: "book", note: "Alex Xu's System Design Interview covers rate limiter design in depth." },
  ],
  glossary: [
    { term: "Token bucket", definition: "Rate limiting algorithm where tokens accumulate at a fixed rate up to a capacity. Each request consumes a token; empty bucket means rejection." },
    { term: "Leaky bucket", definition: "Rate limiting algorithm that processes requests at a constant rate by queuing them. Smooths out all bursts." },
    { term: "Sliding window", definition: "Rate limiting approach that avoids fixed window boundary bursts by weighting counts from current and previous windows." },
    { term: "429 Too Many Requests", definition: "HTTP status code indicating the client has exceeded the rate limit. Should include Retry-After header." },
    { term: "Retry-After", definition: "HTTP response header indicating how many seconds the client should wait before retrying a rate-limited request." },
    { term: "GCRA", definition: "Generic Cell Rate Algorithm — a leaky bucket variant that tracks theoretical arrival time rather than maintaining a queue." },
  ],
  exercises: [
    "Implement a **fixed window** rate limiter using Redis `INCR` and `EXPIRE`. Then demonstrate the **boundary burst problem**: with a limit of 100 req/min, show how a client can send 200 requests in a 2-second window spanning the boundary. Fix it by switching to a **sliding window counter** approach.",
    "Write a **token bucket** rate limiter as a Redis Lua script that atomically reads the current token count, calculates refill based on elapsed time, and deducts a token. Test it with `capacity=10` and `refillRate=2/sec`. Verify that (a) a burst of 10 requests succeeds immediately, (b) the 11th request is rejected, and (c) after 5 seconds, 10 more tokens are available.",
    "Design a **tiered rate limiting** system for an API with three client tiers: *free* (10 req/min), *pro* (100 req/min), and *enterprise* (1000 req/min). Additionally, the `/search` endpoint has a separate limit of 5 req/min for free users. Show the Redis key structure and explain how you would look up the correct limit for each request.",
    "A distributed API with 8 server instances uses local in-memory rate limiting (no shared store). Explain why a client can effectively get **8x the intended rate**. Propose two solutions: (a) a centralized Redis-based approach, and (b) a *local counter with periodic sync* approach. Compare the tradeoffs in accuracy, latency, and failure modes.",
    "Your rate limiter returns `429 Too Many Requests`, but clients are **retrying immediately** in a tight loop, making the overload worse. Design a client-side **exponential backoff with jitter** strategy that respects the `Retry-After` header. Write the retry logic in TypeScript and explain why *jitter* is essential to prevent a **thundering herd**.",
  ],
};
