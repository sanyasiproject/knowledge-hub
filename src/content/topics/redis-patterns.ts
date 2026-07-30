import type { TopicContent } from "../types";

export const redisPatterns: TopicContent = {
  quickSummary: [
    "Redis serves as more than a cache — its atomic operations and data structures enable battle-tested distributed patterns: rate limiting, distributed locks, pub/sub messaging, leaderboards, and session management.",
    "The Redlock algorithm provides distributed locking across multiple independent Redis nodes with safety guarantees, while simpler single-node locks use SET NX EX for mutual exclusion.",
    "Sliding window rate limiting with sorted sets, pub/sub for real-time fan-out, and sorted set leaderboards are among the most widely deployed Redis patterns in production systems.",
  ],
  detailed: [
    "Fixed window rate limiting is the simplest approach: use INCR on a key like 'ratelimit:{user}:{minute}' with an EXPIRE. Each request increments the counter; if it exceeds the limit, reject the request. The weakness is the boundary problem — a user can send 2x the limit by clustering requests around a window boundary (end of one minute + start of the next).",
    "Sliding window rate limiting solves the boundary problem using sorted sets. Each request adds an entry with the current timestamp as both score and member (ZADD). Before checking the count, remove entries older than the window (ZREMRANGEBYSCORE). Then ZCARD gives the count within the window. This is more memory-intensive (one entry per request) but provides smooth rate limiting. A hybrid approach uses two fixed windows with weighted counting to approximate a sliding window cheaply.",
    "Distributed locks with Redis use SET key value NX EX timeout — the lock is acquired only if the key does not exist (NX), with an automatic expiry (EX) to prevent deadlocks. The value must be a unique token (UUID) so only the lock holder can release it. Release must be atomic: a Lua script checks the value matches before DEL. Without this, a slow client could release another client's lock after its own lock expired.",
    "The Redlock algorithm (by Salvatore Sanfilippo) extends locking to N independent Redis nodes (typically 5). The client tries to acquire the lock on all N nodes with a short timeout. If it succeeds on a majority (N/2 + 1) within the validity time minus clock drift, the lock is acquired. On failure, it releases all acquired locks. Redlock provides safety under individual node failures but has been debated — Martin Kleppmann argued it is unsafe under process pauses and clock jumps; Antirez countered that practical deployments with fencing tokens address these concerns.",
    "Redis Pub/Sub provides fire-and-forget messaging: publishers send to channels, all connected subscribers receive messages in real time. Messages are not persisted — if a subscriber is disconnected, it misses messages. SUBSCRIBE/PSUBSCRIBE (pattern matching) block the connection. Pub/Sub is ideal for real-time notifications, chat, and invalidation signals. For reliable messaging, use Streams with consumer groups instead.",
    "Leaderboards leverage sorted sets naturally: ZADD adds players with scores, ZINCRBY updates scores atomically, ZREVRANGE retrieves the top N, and ZREVRANK gets a player's position — all in O(log n). For time-decay leaderboards, multiply scores by a timestamp factor. For multi-criteria leaderboards, encode multiple values into the score (e.g., score * 1e10 + timestamp for tie-breaking).",
    "Session management stores session data in Redis hashes (HSET session:{id} field value) with EXPIRE for automatic cleanup. This enables stateless application servers — any server can serve any request by reading the session from Redis. For security, session IDs should be cryptographically random, and sensitive fields should use server-side encryption. The SCAN command can enumerate sessions without blocking, unlike KEYS which is O(n) and blocks the event loop.",
  ],
  deepDive: [
    "The sliding window log algorithm using sorted sets has O(n) memory per user per window (one entry per request). For high-volume APIs, the sliding window counter approach is more efficient: maintain two fixed window counters and compute a weighted sum. If the current window is 30% elapsed, the effective count is (current_count * 0.3 + previous_count * 0.7). This uses O(1) memory per user and provides a good approximation of the sliding window.",
    "Lua scripting is essential for safe Redis patterns. Rate limiting, lock release, and many other patterns require multiple commands to execute atomically. Redis guarantees that a Lua script runs without interruption (single-threaded execution). EVALSHA caches scripts by SHA1 hash, avoiding retransmission. However, long-running Lua scripts block all other clients — keep scripts under a few milliseconds.",
    "Redlock controversy: Martin Kleppmann's 'How to do distributed locking' paper argues that Redlock is unsafe because (1) a process holding the lock could pause (GC, page fault) past the lock expiry, then act on stale data; (2) clock skew between nodes could cause premature expiry. The counter-argument is that fencing tokens (monotonically increasing values attached to each lock acquisition and validated by the resource) solve the safety problem regardless of timing. In practice, most systems use single-node locks with Lua scripts, reserving Redlock for cases where a single Redis node is a single point of failure.",
    "Pub/Sub scalability: each message is delivered to every subscriber, so with M subscribers and N messages, the total work is O(M * N). Cluster mode does not help — PUBLISH broadcasts to all nodes. For high-throughput messaging, Redis Streams with consumer groups provide partitioned consumption (each message to one consumer), persistence, and backpressure. Pub/Sub remains ideal for low-volume, low-latency fan-out like cache invalidation signals.",
  ],
  code: [
    {
      language: "redis",
      caption: "Fixed window rate limiting",
      source: `# Allow 100 requests per minute per user
# Key: ratelimit:{user_id}:{current_minute}

SET ratelimit:user42:202401151030 0 EX 60 NX
INCR ratelimit:user42:202401151030
# Returns current count

# In application logic:
# if count > 100 then reject with 429 Too Many Requests`,
    },
    {
      language: "lua",
      caption: "Sliding window rate limiter (Lua script for atomicity)",
      source: `-- KEYS[1] = rate limit key (e.g., "ratelimit:user42")
-- ARGV[1] = window size in milliseconds
-- ARGV[2] = max requests allowed
-- ARGV[3] = current timestamp in milliseconds
-- ARGV[4] = unique request ID

local key = KEYS[1]
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local req_id = ARGV[4]

-- Remove entries outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count remaining entries
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add this request
  redis.call('ZADD', key, now, req_id)
  -- Set expiry on the key itself
  redis.call('PEXPIRE', key, window)
  return 1  -- allowed
else
  return 0  -- rejected
end`,
    },
    {
      language: "redis",
      caption: "Distributed lock — acquire and release",
      source: `# Acquire lock with unique token and 10-second timeout
SET lock:order:123 "token:abc-def-ghi" NX EX 10
# OK = acquired, nil = already locked

# WRONG release (race condition):
# DEL lock:order:123
# Another client may have acquired the lock after ours expired!

# CORRECT release via Lua script:
EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 lock:order:123 "token:abc-def-ghi"
# Returns 1 if released, 0 if lock was already held by someone else`,
    },
    {
      language: "python",
      caption: "Redlock algorithm implementation outline",
      source: `import time
import uuid
import redis

class Redlock:
    def __init__(self, nodes: list[redis.Redis]):
        self.nodes = nodes
        self.quorum = len(nodes) // 2 + 1
        self.clock_drift_factor = 0.01

    def acquire(self, resource: str, ttl_ms: int) -> str | None:
        token = str(uuid.uuid4())
        start = time.monotonic()
        acquired = 0

        for node in self.nodes:
            try:
                if node.set(resource, token, nx=True, px=ttl_ms):
                    acquired += 1
            except redis.RedisError:
                pass

        elapsed_ms = (time.monotonic() - start) * 1000
        drift = ttl_ms * self.clock_drift_factor + 2  # ms
        validity = ttl_ms - elapsed_ms - drift

        if acquired >= self.quorum and validity > 0:
            return token  # Lock acquired

        # Failed — release all
        self._release_all(resource, token)
        return None

    def release(self, resource: str, token: str):
        self._release_all(resource, token)

    def _release_all(self, resource: str, token: str):
        script = """
        if redis.call('GET', KEYS[1]) == ARGV[1] then
            return redis.call('DEL', KEYS[1])
        end
        return 0
        """
        for node in self.nodes:
            try:
                node.eval(script, 1, resource, token)
            except redis.RedisError:
                pass`,
    },
    {
      language: "redis",
      caption: "Pub/Sub messaging pattern",
      source: `# Terminal 1 — Subscriber
SUBSCRIBE notifications:user42
# Waiting for messages...
# 1) "message"
# 2) "notifications:user42"
# 3) "Your order has shipped!"

# Terminal 2 — Pattern subscriber
PSUBSCRIBE notifications:*
# Receives messages from all notification channels

# Terminal 3 — Publisher
PUBLISH notifications:user42 "Your order has shipped!"
# (integer) 2  — number of subscribers who received it

# Check active channels and subscriber counts
PUBSUB CHANNELS "notifications:*"
PUBSUB NUMSUB notifications:user42`,
    },
    {
      language: "python",
      caption: "Leaderboard with sorted sets",
      source: `import redis

r = redis.Redis(decode_responses=True)
LB = "leaderboard:weekly"

# Add/update scores
r.zadd(LB, {"alice": 1500, "bob": 1200, "charlie": 1800})

# Increment score atomically
r.zincrby(LB, 50, "bob")  # bob -> 1250

# Top 10 with scores
top10 = r.zrevrange(LB, 0, 9, withscores=True)
for rank, (player, score) in enumerate(top10, 1):
    print(f"#{rank} {player}: {score}")

# Get player's rank (0-based from top)
rank = r.zrevrank(LB, "alice")  # 1 (second place)

# Players ranked 50-60 (paginated)
page = r.zrevrange(LB, 49, 59, withscores=True)

# Players within a score range
bracket = r.zrangebyscore(LB, 1300, 1600, withscores=True)

# Total players
total = r.zcard(LB)

# Remove inactive player
r.zrem(LB, "inactive_player")`,
    },
    {
      language: "python",
      caption: "Session management with Redis hashes",
      source: `import redis
import secrets
import json
import time

r = redis.Redis(decode_responses=True)
SESSION_TTL = 3600  # 1 hour

def create_session(user_id: str, metadata: dict) -> str:
    session_id = secrets.token_urlsafe(32)
    key = f"session:{session_id}"
    r.hset(key, mapping={
        "user_id": user_id,
        "created_at": str(time.time()),
        "ip": metadata.get("ip", ""),
        "user_agent": metadata.get("user_agent", ""),
    })
    r.expire(key, SESSION_TTL)
    return session_id

def get_session(session_id: str) -> dict | None:
    key = f"session:{session_id}"
    data = r.hgetall(key)
    if not data:
        return None
    # Refresh TTL on access (sliding expiration)
    r.expire(key, SESSION_TTL)
    return data

def destroy_session(session_id: str):
    r.delete(f"session:{session_id}")

def count_active_sessions() -> int:
    count = 0
    cursor = 0
    while True:
        cursor, keys = r.scan(cursor, match="session:*", count=100)
        count += len(keys)
        if cursor == 0:
            break
    return count`,
    },
  ],
  diagrams: [
    {
      title: "Fixed window vs sliding window rate limiting",
      kind: "flow",
      caption: "Fixed window resets at boundaries, allowing burst at edges. Sliding window tracks each request timestamp for smooth enforcement.",
    },
    {
      title: "Redlock acquisition across 5 Redis nodes",
      kind: "sequence",
      caption: "Client sends SET NX to all 5 nodes. If majority (3+) respond OK within the validity period, the lock is acquired. Otherwise, release all and retry.",
    },
    {
      title: "Pub/Sub message flow",
      kind: "architecture",
      caption: "Publisher sends to channel. Redis broadcasts to all connected subscribers on that channel. No persistence — disconnected subscribers miss messages.",
    },
    {
      title: "Session management architecture",
      kind: "architecture",
      caption: "Stateless app servers read/write session hashes in Redis. Load balancer routes any request to any server. Sessions expire via TTL.",
    },
  ],
  animations: [
    {
      title: "Distributed lock lifecycle with timeout safety",
      steps: [
        { label: "Acquire", detail: "Client A sends SET lock:resource token-A NX EX 10. Redis returns OK — lock acquired with 10-second TTL." },
        { label: "Work", detail: "Client A performs the protected operation (e.g., processing a payment). The 10-second clock is ticking." },
        { label: "Contention", detail: "Client B tries SET lock:resource token-B NX EX 10. Redis returns nil — lock is held. Client B backs off and retries." },
        { label: "Release", detail: "Client A finishes work. It runs the Lua script: check GET == token-A, then DEL. Lock is released." },
        { label: "Timeout safety", detail: "If Client A crashes or hangs, the lock expires after 10 seconds. Client B's next retry succeeds. No deadlock." },
      ],
    },
    {
      title: "Sliding window rate limit check",
      steps: [
        { label: "Clean old entries", detail: "ZREMRANGEBYSCORE removes all entries with timestamp < (now - window_size). These are requests outside the current window." },
        { label: "Count requests", detail: "ZCARD returns the number of entries remaining — this is the request count within the sliding window." },
        { label: "Check limit", detail: "If count < max_allowed, the request is permitted. Otherwise, return 429 Too Many Requests with a Retry-After header." },
        { label: "Record request", detail: "ZADD adds the current request with timestamp as score and a unique ID as member." },
        { label: "Set key expiry", detail: "PEXPIRE ensures the key is cleaned up if the user stops making requests. Set to window_size." },
      ],
    },
  ],
  comparison: {
    columns: ["Pattern", "Data Structure", "Atomicity Method", "Failure Mode", "Alternative"],
    rows: [
      ["Fixed window rate limit", "String (INCR)", "Single command", "Burst at window boundary", "Sliding window"],
      ["Sliding window rate limit", "Sorted Set", "Lua script", "Memory per request", "Sliding window counter (hybrid)"],
      ["Single-node lock", "String (SET NX EX)", "Lua script for release", "Single point of failure", "Redlock"],
      ["Redlock", "String on N nodes", "Majority quorum", "Clock skew, process pause", "Fencing tokens + single lock"],
      ["Pub/Sub", "Channel (no storage)", "N/A (fire and forget)", "Lost messages on disconnect", "Streams with consumer groups"],
      ["Leaderboard", "Sorted Set", "ZINCRBY (atomic)", "Memory for large sets", "Approximate top-K"],
      ["Session store", "Hash + EXPIRE", "HSET (atomic per field)", "Data loss if Redis restarts without persistence", "Sticky sessions"],
    ],
  },
  interviewQA: [
    {
      q: "Why is DEL not safe for releasing a distributed lock, even with a unique token?",
      a: "Without an atomic check-and-delete, there is a race condition: Client A's lock expires, Client B acquires the lock, then Client A (running slowly) calls DEL — deleting Client B's lock. The safe release requires a Lua script that atomically checks if the lock value matches the caller's token before deleting. Lua scripts execute atomically in Redis's single-threaded model.",
      followUps: [
        "What happens if the Lua script itself fails midway?",
        "How would you implement lock extension (renewal) safely?",
      ],
    },
    {
      q: "When would you choose Redis Pub/Sub over Streams for messaging?",
      a: "Use Pub/Sub when you need real-time, low-latency fan-out to all subscribers and can tolerate message loss (e.g., cache invalidation, live notifications, typing indicators). Use Streams when you need message persistence, replay, consumer groups (load-balanced consumption), and at-least-once delivery guarantees (e.g., event sourcing, task queues, audit logs).",
      followUps: [
        "Can you combine Pub/Sub and Streams?",
        "How does Pub/Sub behave in Redis Cluster mode?",
      ],
    },
    {
      q: "How would you handle a leaderboard with billions of players?",
      a: "A single sorted set becomes impractical at billions of entries (memory and O(log n) per operation). Solutions: (1) Shard by region or tier, maintaining top-K per shard and a global top-K. (2) Use approximate ranking — maintain the top 10K exactly and estimate rank for others using score distribution. (3) Use a fan-out approach: batch score updates and periodically rebuild the leaderboard. (4) HyperLogLog for counting unique participants without storing them all.",
    },
    {
      q: "What is the sliding window counter approach to rate limiting?",
      a: "Instead of storing every request timestamp (sorted set approach, O(n) memory), maintain two fixed window counters. The effective count is: previous_window_count * (1 - elapsed_fraction) + current_window_count. For example, if we are 40% through the current minute, the estimate is prev_count * 0.6 + current_count. This uses O(1) memory per user and closely approximates a true sliding window. Cloudflare uses this approach at scale.",
    },
  ],
  mcqs: [
    {
      q: "What Redis command is used to acquire a distributed lock?",
      options: ["LOCK key", "SETNX key value", "SET key value NX EX timeout", "WATCH key"],
      answerIndex: 2,
      explanation: "SET with NX (only if not exists) and EX (expiry in seconds) atomically acquires the lock with a timeout. SETNX alone does not set an expiry, risking deadlock.",
    },
    {
      q: "In the Redlock algorithm, how many nodes must a client acquire to consider the lock valid?",
      options: ["All N nodes", "N/2 + 1 (majority)", "At least 1 node", "N - 1 nodes"],
      answerIndex: 1,
      explanation: "Redlock requires a majority (N/2 + 1) of N independent Redis nodes. With 5 nodes, at least 3 must be acquired within the validity time.",
    },
    {
      q: "What is the main disadvantage of Redis Pub/Sub?",
      options: [
        "It is too slow for real-time use",
        "Messages are not persisted — disconnected subscribers miss them",
        "It cannot handle multiple subscribers",
        "It requires Redis Cluster mode",
      ],
      answerIndex: 1,
      explanation: "Pub/Sub is fire-and-forget. If a subscriber is disconnected or not yet subscribed when a message is published, that message is lost. For reliable messaging, use Streams.",
    },
    {
      q: "Which Redis command atomically increments a player's score in a leaderboard?",
      options: ["ZADD", "ZINCRBY", "ZRANGEBYSCORE", "HINCRBY"],
      answerIndex: 1,
      explanation: "ZINCRBY atomically adds the increment to the member's score in the sorted set. ZADD can also update scores but replaces rather than incrementing.",
    },
    {
      q: "What is the boundary problem in fixed window rate limiting?",
      options: [
        "The counter never resets",
        "A user can send 2x the limit by clustering requests at window edges",
        "The window is too short for accurate counting",
        "Memory grows unboundedly",
      ],
      answerIndex: 1,
      explanation: "A user can send the full limit at the end of one window and the full limit at the start of the next, effectively doubling the rate in a short burst spanning the boundary.",
    },
  ],
  flashcards: [
    { front: "How do you safely release a Redis distributed lock?", back: "Use a Lua script that atomically checks if GET key == your_token, then DEL key. Never use bare DEL — another client may hold the lock after yours expired." },
    { front: "How many Redis nodes does Redlock recommend?", back: "5 independent Redis nodes (or any odd number >= 3). The client must acquire the lock on a majority (N/2 + 1) to succeed." },
    { front: "What is the memory cost of sliding window rate limiting with sorted sets?", back: "O(n) per user, where n is the number of requests in the window. Each request is stored as a sorted set member. For high-volume APIs, the sliding window counter approach uses O(1)." },
    { front: "How does ZINCRBY differ from ZADD for leaderboards?", back: "ZINCRBY adds the increment to the existing score (e.g., +50 points). ZADD replaces the score entirely. ZINCRBY is atomic and ideal for live score updates." },
    { front: "Why use SCAN instead of KEYS for enumerating sessions?", back: "KEYS is O(n) and blocks the event loop for the entire scan. SCAN is cursor-based, returning small batches per call without blocking other clients." },
    { front: "What is a fencing token in distributed locking?", back: "A monotonically increasing value attached to each lock acquisition. The protected resource validates that the token is >= the last seen token, preventing stale lock holders from making changes." },
  ],
  revisionNotes: [
    "Fixed window rate limiting: INCR + EXPIRE. Simple but allows 2x burst at window boundaries.",
    "Sliding window: sorted set with timestamps. Accurate but O(n) memory per user. Sliding window counter (weighted two-window) is O(1) and a good approximation.",
    "Distributed lock: SET key token NX EX timeout. Release with Lua script checking token. Never use bare DEL.",
    "Redlock: acquire on majority of N independent nodes within validity time. Controversial under clock skew and process pauses. Use fencing tokens for extra safety.",
    "Pub/Sub: real-time fan-out, no persistence. SUBSCRIBE blocks the connection. Use Streams for reliable messaging.",
    "Leaderboards: ZADD, ZINCRBY, ZREVRANGE, ZREVRANK — all O(log n) on sorted sets. Encode tie-breakers in the score.",
    "Session management: Hash per session with EXPIRE. SCAN for enumeration. Cryptographically random session IDs.",
    "Lua scripts guarantee atomicity for multi-step patterns. Keep scripts short to avoid blocking.",
  ],
  cheatSheet: [
    "SET key val NX EX 10 — acquire lock with 10s timeout",
    "EVAL 'if GET==token then DEL end' — safe lock release",
    "INCR + EXPIRE — fixed window rate limit counter",
    "ZADD key timestamp member + ZREMRANGEBYSCORE + ZCARD — sliding window",
    "SUBSCRIBE channel — block and receive messages",
    "PUBLISH channel message — send to all subscribers",
    "ZADD lb score player — add/update leaderboard entry",
    "ZINCRBY lb 50 player — increment player score by 50",
    "ZREVRANGE lb 0 9 WITHSCORES — top 10 with scores",
    "ZREVRANK lb player — player's rank from top (0-based)",
    "HSET session:{id} field value + EXPIRE — create/update session",
    "SCAN 0 MATCH session:* COUNT 100 — iterate sessions safely",
    "EVALSHA sha1 numkeys ... — call cached Lua script by hash",
  ],
  resources: [
    { label: "Redis Distributed Locks (Redlock) specification", kind: "docs", note: "Official Redlock algorithm description by Salvatore Sanfilippo." },
    { label: "How to do distributed locking — Martin Kleppmann", kind: "article", note: "Influential critique of Redlock, arguing for fencing tokens." },
    { label: "Redis Pub/Sub documentation", kind: "docs", note: "Official guide to SUBSCRIBE, PUBLISH, and PSUBSCRIBE commands." },
    { label: "Redis in Action — Chapters 6 & 8", kind: "book", note: "Rate limiting, locks, and real-world application patterns." },
    { label: "Stripe's rate limiter blog post", kind: "article", note: "Production rate limiting using Redis with sliding window counters." },
    { label: "Redis Best Practices (redis.io)", kind: "docs", note: "Official pattern catalog including session management and leaderboards." },
  ],
  glossary: [
    { term: "Rate limiting", definition: "Controlling the number of requests a client can make within a time window to protect resources and ensure fair usage." },
    { term: "Distributed lock", definition: "A mutual exclusion mechanism that works across multiple processes or servers, ensuring only one client accesses a critical section at a time." },
    { term: "Redlock", definition: "Redis-based distributed locking algorithm that acquires locks on a majority of independent Redis nodes for fault tolerance." },
    { term: "Fencing token", definition: "A monotonically increasing value attached to lock acquisitions, used by the protected resource to reject stale operations from expired lock holders." },
    { term: "Pub/Sub", definition: "Publish/Subscribe messaging paradigm where publishers send messages to channels and all subscribers on that channel receive them in real time." },
    { term: "Sliding window", definition: "Rate limiting approach that tracks individual request timestamps for a smooth, continuous window rather than fixed time boundaries." },
    { term: "Consumer group", definition: "Redis Streams feature that distributes messages among multiple consumers with tracking, acknowledgment, and failure recovery." },
    { term: "Lua scripting", definition: "Embedded scripting in Redis that runs atomically (no interleaving with other commands), essential for multi-step atomic patterns." },
  ],
};
