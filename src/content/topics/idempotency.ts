import type { TopicContent } from "../types";

export const idempotency: TopicContent = {
  quickSummary: [
    "An idempotent operation produces the same result regardless of how many times it is executed — essential for reliable APIs, payment processing, and distributed systems where retries are inevitable.",
    "HTTP methods GET, PUT, and DELETE are naturally idempotent by specification; POST is not, but can be made idempotent using idempotency keys sent by the client.",
    "Implementation techniques include unique constraint upserts, idempotency key tables with request fingerprinting, conditional updates (WHERE version = N), and the transactional outbox pattern.",
  ],
  detailed: [
    "Idempotency means f(x) = f(f(x)) — applying an operation once has the same effect as applying it multiple times. In APIs, this means a client can safely retry a request without causing duplicate side effects (double charges, duplicate emails, multiple record creations). This is critical because networks are unreliable: a client may not receive the response even though the server processed the request, leading to a retry.",
    "Natural idempotency occurs when the operation itself is inherently idempotent. Setting a value (PUT /users/123 with body {name: 'Alice'}) is naturally idempotent — doing it twice results in the same state. DELETE is naturally idempotent — deleting an already-deleted resource is a no-op. GET is idempotent (and safe — it has no side effects). POST is not naturally idempotent because it typically creates a new resource each time.",
    "Artificial idempotency uses a client-generated unique key (idempotency key) to deduplicate requests. The client includes a key (UUID) in a header (e.g., Idempotency-Key). The server stores this key alongside the response. On retry, the server recognizes the key and returns the stored response without re-executing the operation. Stripe's API popularized this pattern for payment processing.",
    "Database-level idempotency uses constraints and conditional operations: UPSERT (INSERT ... ON CONFLICT DO UPDATE) is idempotent for setting values. Conditional updates (UPDATE ... WHERE version = N) ensure an update only applies once. Unique constraints on business keys (order_id + payment_id) prevent duplicate records. These are simpler than application-level idempotency keys but only work for database operations.",
    "At-least-once vs exactly-once delivery: most message brokers and job queues provide at-least-once delivery (messages may be delivered more than once). Exactly-once delivery is technically impossible in distributed systems (due to the Two Generals Problem), but exactly-once processing is achievable by combining at-least-once delivery with idempotent consumers. The consumer checks whether it has already processed a message before executing the side effect.",
    "The transactional outbox pattern combines idempotency with reliable event publishing: write the business state change and the outbox event in the same database transaction. A separate process reads the outbox and publishes events. Even if the publisher runs twice, the consumer uses idempotency keys to deduplicate. This avoids the dual-write problem (writing to a database and a message broker without a distributed transaction).",
  ],
  deepDive: [
    "Stripe's idempotency implementation is instructive. Clients send an Idempotency-Key header with POST requests. The server uses a state machine with states: started, locked, completed. On first receipt, the key is stored with state 'started'. The request is processed and the state moves to 'completed' with the response body stored. On retry, if the state is 'completed', the stored response is returned immediately. If 'started' (concurrent duplicate), the server returns 409 Conflict. Keys expire after 24 hours to bound storage. The key insight is that the idempotency key and response must be stored atomically with the business operation.",
    "Idempotency in event-driven architectures requires careful design. Each event consumer maintains a processed-events table. Before processing, it checks if the event ID exists. The processing and the insertion of the event ID into the processed-events table happen in the same database transaction. For consumers that call external services (non-transactional), you need compensating transactions: if the external call succeeds but the local transaction fails, you must undo the external effect or accept the duplicate.",
    "Idempotency key storage considerations: keys should be indexed for fast lookups. Use TTL-based expiration (Redis with EXPIRE, or PostgreSQL with a background cleanup job) to prevent unbounded growth. In high-throughput systems, partition the idempotency key table by key hash to distribute writes. Consider using a separate database or Redis instance for idempotency keys to avoid coupling them with business data.",
    "Handling non-idempotent external calls: when your idempotent operation involves calling a third-party API that is not idempotent (e.g., sending an SMS), you need a two-phase approach. First, record the intent in the database (e.g., 'SMS pending for order_123'). Then, call the external API. Finally, update the record to 'SMS sent'. On retry, check the record: if 'SMS sent', skip; if 'SMS pending', you may need to check with the external service whether the SMS was actually sent (using their API), or accept the risk of a duplicate.",
  ],
  code: [
    {
      language: "typescript",
      caption: "Express middleware for idempotency key handling",
      source: `import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

const pool = new Pool();

interface IdempotencyRecord {
  key: string;
  status: 'processing' | 'completed';
  response_code: number;
  response_body: string;
  created_at: Date;
}

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only apply to POST requests
  if (req.method !== 'POST') return next();

  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (!idempotencyKey) return next(); // Allow non-idempotent POST if no key

  const client = await pool.connect();
  try {
    // Try to insert the key (atomic check-and-set)
    const { rows } = await client.query(
      \`INSERT INTO idempotency_keys (key, status, request_path, request_body_hash)
       VALUES ($1, 'processing', $2, md5($3))
       ON CONFLICT (key) DO NOTHING
       RETURNING key\`,
      [idempotencyKey, req.path, JSON.stringify(req.body)]
    );

    if (rows.length > 0) {
      // New key — proceed with request, capture response
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        // Store the response for future replays
        client.query(
          \`UPDATE idempotency_keys
           SET status = 'completed',
               response_code = $1,
               response_body = $2
           WHERE key = $3\`,
          [res.statusCode, JSON.stringify(body), idempotencyKey]
        ).finally(() => client.release());
        return originalJson(body);
      };
      return next();
    }

    // Key already exists — return cached response or wait
    const existing = await client.query<IdempotencyRecord>(
      'SELECT * FROM idempotency_keys WHERE key = $1',
      [idempotencyKey]
    );
    client.release();

    if (existing.rows[0]?.status === 'completed') {
      res.status(existing.rows[0].response_code)
        .json(JSON.parse(existing.rows[0].response_body));
      return;
    }

    // Still processing — return 409 Conflict
    res.status(409).json({
      error: 'Request with this idempotency key is still being processed',
    });
  } catch (err) {
    client.release();
    next(err);
  }
}`,
    },
    {
      language: "sql",
      caption: "Idempotency keys table and database-level idempotent upsert",
      source: `-- Idempotency keys table
CREATE TABLE idempotency_keys (
  key             VARCHAR(255) PRIMARY KEY,
  status          VARCHAR(20) NOT NULL DEFAULT 'processing',
  request_path    VARCHAR(500),
  request_body_hash VARCHAR(32),
  response_code   INTEGER,
  response_body   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys (expires_at);

-- Cleanup expired keys (run periodically)
DELETE FROM idempotency_keys WHERE expires_at < NOW();

-- Database-level idempotent upsert (natural idempotency)
INSERT INTO user_preferences (user_id, theme, language)
VALUES (123, 'dark', 'en')
ON CONFLICT (user_id)
DO UPDATE SET
  theme = EXCLUDED.theme,
  language = EXCLUDED.language,
  updated_at = NOW();
-- Running this 10 times produces the same result as running it once

-- Conditional update with optimistic locking (version check)
UPDATE orders
SET status = 'shipped',
    version = version + 1,
    shipped_at = NOW()
WHERE id = 456
  AND version = 3;  -- Only succeeds if version matches
-- Returns 0 rows affected on retry (already updated)

-- Unique constraint prevents duplicate payments
CREATE UNIQUE INDEX idx_payments_idempotent
  ON payments (order_id, payment_provider, provider_transaction_id);

INSERT INTO payments (order_id, amount, payment_provider, provider_transaction_id)
VALUES (789, 99.99, 'stripe', 'pi_abc123')
ON CONFLICT (order_id, payment_provider, provider_transaction_id)
DO NOTHING;  -- Silently ignores duplicate`,
    },
    {
      language: "typescript",
      caption: "Idempotent event consumer with transactional deduplication",
      source: `import { Pool } from 'pg';

interface OrderEvent {
  eventId: string;
  type: 'order.created';
  data: { orderId: string; userId: string; amount: number };
}

async function handleOrderCreated(event: OrderEvent, pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if this event was already processed (idempotency check)
    const { rows: existing } = await client.query(
      'SELECT 1 FROM processed_events WHERE event_id = $1',
      [event.eventId]
    );

    if (existing.length > 0) {
      await client.query('COMMIT');
      console.log(\`Event \${event.eventId} already processed, skipping\`);
      return;
    }

    // Process the event — create the invoice
    await client.query(
      \`INSERT INTO invoices (order_id, user_id, amount, status)
       VALUES ($1, $2, $3, 'pending')\`,
      [event.data.orderId, event.data.userId, event.data.amount]
    );

    // Mark event as processed (in the same transaction!)
    await client.query(
      'INSERT INTO processed_events (event_id, processed_at) VALUES ($1, NOW())',
      [event.eventId]
    );

    await client.query('COMMIT');
    console.log(\`Processed event \${event.eventId}: invoice created\`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err; // Let the consumer retry
  } finally {
    client.release();
  }
}`,
    },
    {
      language: "typescript",
      caption: "API client with idempotency key for safe retries",
      source: `import { randomUUID } from 'crypto';

async function createPayment(
  orderId: string,
  amount: number,
  idempotencyKey?: string
): Promise<PaymentResult> {
  const key = idempotencyKey ?? randomUUID();
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.payment.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key, // Same key across all retries
        },
        body: JSON.stringify({ order_id: orderId, amount }),
      });

      if (response.status === 409) {
        // Request still being processed — wait and retry
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }

      if (!response.ok) {
        throw new Error(\`Payment failed: \${response.status}\`);
      }

      return await response.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      // Network error — safe to retry with same idempotency key
      await sleep(1000 * Math.pow(2, attempt));
    }
  }

  throw new Error('Payment failed after max retries');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}`,
    },
  ],
  diagrams: [
    {
      title: "Idempotency Key Pattern",
      kind: "sequence",
      caption: "How idempotency keys prevent duplicate operations on retry.",
      mermaid: `sequenceDiagram
    participant Client
    participant API
    participant DB
    Client->>API: POST /payments Idempotency-Key: abc123
    API->>DB: Check if key abc123 exists
    DB-->>API: Not found
    API->>DB: Process payment store key abc123
    DB-->>API: Success
    API-->>Client: 200 Payment processed
    Note over Client: Network error - client retries
    Client->>API: POST /payments Idempotency-Key: abc123
    API->>DB: Check if key abc123 exists
    DB-->>API: Found - return cached response
    API-->>Client: 200 Same response no duplicate charge`,
    },
    {
      title: "HTTP Method Idempotency Matrix",
      kind: "architecture",
      caption: "Idempotency and safety properties of standard HTTP methods.",
      mermaid: `graph LR
    subgraph Safe and Idempotent
        GET
        HEAD
        OPTIONS
    end
    subgraph Idempotent Not Safe
        PUT
        DELETE
    end
    subgraph Neither Safe Nor Idempotent
        POST
        PATCH
    end`,
    },
    {
      title: "Designing Idempotent Operations",
      kind: "flow",
      caption: "Decision flow for making a distributed operation idempotent.",
      mermaid: `flowchart TD
    A[Design Operation] --> B[Assign unique operation ID]
    B --> C[Check if ID already processed]
    C --> D{Already processed?}
    D -- Yes --> E[Return same cached response]
    D -- No --> F[Execute operation]
    F --> G{Success?}
    G -- Yes --> H[Record ID and result atomically]
    H --> I[Return success response]
    G -- No --> J{Retryable error?}
    J -- Yes --> K[Let client retry with same ID]
    J -- No --> L[Return non-retryable error]`,
    },
    {
      title: "Idempotency Across System Components",
      kind: "mindmap",
      caption: "Where idempotency matters across distributed system components.",
      mermaid: `mindmap
  root((Idempotency))
    Payment Systems
      Stripe idempotency keys
      Deduplication windows
    Message Queues
      At-least-once delivery
      Consumer deduplication
    Database Operations
      INSERT OR IGNORE
      UPSERT patterns
    API Design
      PUT over POST for updates
      Conditional requests ETags
    Event Sourcing
      Event deduplication
      Sequence numbers`,
    },
  ],
  exercises: [
    "**Build idempotency middleware for Express:** Implement a complete **idempotency key middleware** in Node.js/Express that intercepts `POST` requests with an `Idempotency-Key` header. Use PostgreSQL to store keys with `status`, `response_code`, `response_body`, and `expires_at`. Handle three cases: *new key* (process and store), *completed key* (return cached response), and *in-progress key* (return `409 Conflict`). Add a background job to clean up expired keys.",
    "**Implement optimistic locking:** Create an Express API for updating a `BankAccount` resource. Each account has a `version` column. The `PUT /accounts/:id` endpoint must include the expected `version` in the request body. Use `UPDATE ... WHERE version = $expected` and return `409 Conflict` if zero rows are updated. Write tests proving that *concurrent updates* with the same version result in only one success.",
    "**Design an idempotent event consumer:** Build a Node.js consumer that reads `order.created` events from a Redis stream (`XREAD`). Each event has an `eventId`. Use a `processed_events` table to deduplicate. The consumer should create an invoice in the same **database transaction** as the dedup record insertion. Test by publishing the same event three times and verifying only one invoice exists.",
    "**Implement the transactional outbox pattern:** Create an Express API where `POST /orders` writes the order to the `orders` table and an event to the `outbox` table in the *same transaction*. Build a separate poller process that reads unprocessed outbox rows, publishes them to a Redis stream, and marks them as published. Verify that if the API crashes after the DB commit, the poller still picks up and publishes the event.",
    "**Test non-idempotent external call handling:** Build a payment endpoint that calls a mock external payment API. Implement the **two-phase approach**: record `payment_pending` in the DB, call the external API, then update to `payment_completed`. Simulate three failure scenarios: (1) crash before external call, (2) crash after external call but before DB update, (3) successful completion. Verify correct behavior on retry for each scenario.",
  ],
  animations: [
    {
      title: "A retried payment that only charges once",
      steps: [
        {
          label: "Client generates a key",
          detail: "A UUID per logical operation, sent as `Idempotency-Key`.",
        },
        {
          label: "First request",
          detail: "Server opens a transaction and inserts the key into a table with a unique constraint. Insert succeeds.",
        },
        {
          label: "Work executes",
          detail: "Card is charged, the response is stored against the key, transaction commits.",
        },
        {
          label: "Response is lost",
          detail: "Network drops it. The client times out and cannot tell whether the charge happened.",
        },
        {
          label: "Client retries",
          detail: "Same key. The insert now violates the unique constraint.",
        },
        {
          label: "Stored response returned",
          detail: "Server returns the original result instead of charging again. One charge, whatever the network did.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Technique", "Scope", "Pros", "Cons"],
    rows: [
      ["Idempotency key header", "API layer", "Works for any operation; client controls key", "Requires storage for keys and responses; adds latency for lookup"],
      ["Database UPSERT", "Database layer", "Simple; no extra infrastructure; naturally idempotent", "Only works for database writes; not suitable for external calls"],
      ["Optimistic locking (version)", "Database layer", "Prevents lost updates; detects concurrent modifications", "Requires version column; client must handle version mismatch"],
      ["Unique constraints", "Database layer", "Enforced by the database; zero application code", "Only prevents exact duplicates; does not handle partial failures"],
      ["Transactional outbox", "System level", "Solves dual-write problem; reliable event publishing", "Requires outbox table and polling/CDC; adds complexity"],
      ["Event deduplication table", "Consumer layer", "Simple per-consumer deduplication", "Requires per-consumer storage; cleanup needed for old entries"],
    ],
  },
  interviewQA: [
    {
      q: "Why is idempotency important in distributed systems?",
      a: "In distributed systems, networks are unreliable. A client may send a request, the server processes it, but the response is lost. The client retries, and without idempotency, the operation executes twice (double charge, duplicate order). Idempotency ensures that retries are safe — the system converges to the same state regardless of how many times the request is sent. This is especially critical for financial operations, state mutations, and message processing.",
      followUps: [
        "How does the Two Generals Problem relate to idempotency?",
        "Is exactly-once delivery possible in a distributed system?",
      ],
    },
    {
      q: "How would you implement idempotency for a payment API?",
      a: "The client generates a UUID as an idempotency key and sends it in the Idempotency-Key header. The server attempts to insert this key into an idempotency_keys table. If the insert succeeds (new key), the payment is processed and the response is stored alongside the key in the same database transaction. If the insert fails (duplicate key), the server returns the previously stored response. The key has a TTL (e.g., 24 hours) for cleanup. Critical: the idempotency key check, the payment processing, and the response storage must all be in the same transaction to prevent race conditions.",
      followUps: [
        "What happens if two identical requests arrive simultaneously?",
        "How do you handle idempotency when the payment involves calling Stripe's API?",
      ],
    },
    {
      q: "What is the difference between natural and artificial idempotency?",
      a: "Natural idempotency means the operation is inherently idempotent by its nature. 'Set user email to alice@example.com' is naturally idempotent — doing it twice produces the same state. 'Increment counter by 1' is NOT naturally idempotent — doing it twice produces a different result. Artificial idempotency adds a deduplication mechanism (idempotency key) to make a non-idempotent operation behave idempotently. The key lets the server recognize a retry and skip re-execution.",
    },
    {
      q: "How do you handle idempotency when calling external APIs that are not idempotent?",
      a: "Use a two-phase approach: (1) Record the intent in your database ('SMS pending for order_123'). (2) Call the external API. (3) Update the record to 'SMS sent'. On retry, if the record says 'sent', skip. If it says 'pending', you have ambiguity — the external call may or may not have succeeded. Strategies: check the external API for the operation's status (if supported), accept the risk of duplicate (for non-critical operations), or use the external API's own idempotency mechanism (many payment APIs support idempotency keys).",
    },
  ],
  followUps: [
    "What happens when a retry arrives while the original request is still in flight?",
    "Which HTTP methods are idempotent by definition, and why isn't POST one of them?",
    "How long do you keep idempotency keys, and what happens when one expires?",
    "How do you make a counter increment idempotent?",
  ],
  mcqs: [
    {
      q: "Which HTTP methods are idempotent by specification?",
      options: [
        "GET, POST, PUT",
        "GET, PUT, DELETE",
        "POST, PUT, PATCH",
        "GET, POST, DELETE",
      ],
      answerIndex: 1,
      explanation:
        "Per RFC 7231, GET, PUT, DELETE, HEAD, OPTIONS, and TRACE are idempotent. POST and PATCH are not idempotent by default. PUT is idempotent because it replaces the entire resource — doing it twice produces the same state.",
    },
    {
      q: "A client sends a payment request, the server processes it, but the response is lost. The client retries with the same idempotency key. What should the server return?",
      options: [
        "An error indicating the payment was already processed",
        "The original response stored with the idempotency key",
        "A new payment confirmation with a different transaction ID",
        "A 409 Conflict status code",
      ],
      answerIndex: 1,
      explanation:
        "The server recognizes the idempotency key, finds the stored response from the original processing, and returns it. The client receives the same response it would have received if the network had not dropped the original response. No duplicate payment occurs.",
    },
    {
      q: "Which operation is NOT naturally idempotent?",
      options: [
        "SET balance = 100",
        "DELETE FROM users WHERE id = 5",
        "INCREMENT counter BY 1",
        "UPSERT user SET name = 'Alice' WHERE id = 3",
      ],
      answerIndex: 2,
      explanation:
        "INCREMENT is not idempotent: running it once gives counter+1, running it twice gives counter+2. SET, DELETE, and UPSERT all produce the same final state regardless of how many times they execute.",
    },
    {
      q: "What is the dual-write problem that the transactional outbox pattern solves?",
      options: [
        "Writing to two replicas of the same database",
        "Writing to a database and a message broker without a distributed transaction, risking inconsistency",
        "Two clients writing to the same record simultaneously",
        "Writing both the primary key and the foreign key in one operation",
      ],
      answerIndex: 1,
      explanation:
        "The dual-write problem: if you write to the database and then publish an event to a message broker, a crash between the two operations leaves the system inconsistent. The outbox pattern writes both the state change and the event to the database in one transaction, then a separate process reads the outbox and publishes events.",
    },
  ],
  flashcards: [
    {
      front: "What does idempotent mean mathematically?",
      back: "f(x) = f(f(x)). Applying the function once is the same as applying it any number of times. For APIs: retrying a request produces the same result and side effects as the original request.",
    },
    {
      front: "How does Stripe implement idempotency?",
      back: "Client sends Idempotency-Key header with POST requests. Server stores the key with states: started -> completed (with response). On retry with a completed key, the stored response is returned. Keys expire after 24 hours.",
    },
    {
      front: "What is the transactional outbox pattern?",
      back: "Write the business state change AND an outbox event record in the same database transaction. A separate process (poller or CDC) reads the outbox and publishes events to the message broker. Solves the dual-write problem.",
    },
    {
      front: "Why is exactly-once delivery impossible but exactly-once processing achievable?",
      back: "Exactly-once delivery is impossible due to the Two Generals Problem (no way to confirm acknowledgment). But exactly-once processing is achievable by combining at-least-once delivery with idempotent consumers that deduplicate based on message/event IDs.",
    },
    {
      front: "What is optimistic locking for idempotency?",
      back: "Each record has a version column. Updates include WHERE version = expected_version and increment the version. A retry with the old version matches zero rows (no-op). Prevents lost updates and ensures the update applies only once.",
    },
  ],
  revisionNotes: [
    "Idempotent: same result no matter how many times executed. Critical for reliable retries in distributed systems.",
    "GET, PUT, DELETE are idempotent by HTTP spec. POST is not — use idempotency keys to make it safe.",
    "Natural idempotency: SET operations, upserts, deletes. Artificial: client-generated idempotency key stored server-side.",
    "Idempotency key flow: insert key -> process request -> store response (all in one transaction). On retry, return stored response.",
    "Database techniques: UPSERT (ON CONFLICT), unique constraints, optimistic locking (version column).",
    "Transactional outbox: write state + event in same DB transaction. Separate process publishes events. Solves dual-write.",
    "At-least-once + idempotent consumer = exactly-once processing.",
    "Always store idempotency keys with TTL to prevent unbounded table growth. 24 hours is a common expiration.",
  ],
  cheatSheet: [
    "Idempotency key header: Idempotency-Key: <uuid>; store in DB with response; return cached on retry",
    "UPSERT: INSERT ... ON CONFLICT (key) DO UPDATE SET ... (naturally idempotent)",
    "Optimistic lock: UPDATE ... SET version = version + 1 WHERE id = X AND version = Y",
    "Unique constraint: CREATE UNIQUE INDEX ON payments (order_id, provider_tx_id) — DB prevents duplicates",
    "Event dedup: INSERT INTO processed_events (event_id) in same transaction as processing",
    "Outbox: INSERT INTO outbox (event_type, payload) alongside business write; poll + publish separately",
    "Key expiry: DELETE FROM idempotency_keys WHERE expires_at < NOW() (run via cron or background job)",
    "Non-idempotent external call: record intent -> call API -> mark done; check status on retry",
  ],
  resources: [
    { label: "Stripe API Idempotent Requests", url: "https://docs.stripe.com/api", kind: "docs", note: "Stripe's documentation on idempotency key usage and behavior." },
    { label: "Designing Data-Intensive Applications, Ch. 11", url: "https://dataintensive.net/", kind: "book", note: "Covers exactly-once semantics, idempotent consumers, and the outbox pattern." },
    { label: "Brandur Leach: Implementing Stripe-like Idempotency Keys", url: "https://docs.stripe.com/api/idempotent_requests", kind: "article", note: "Detailed walkthrough of building an idempotency key system with PostgreSQL." },
    { label: "RFC 7231 Section 4.2.2", url: "https://www.rfc-editor.org/rfc/rfc7231", kind: "docs", note: "HTTP specification defining which methods are idempotent and why." },
    { label: "Martin Kleppmann: Turning the database inside-out", kind: "video", note: "Explains event sourcing, change data capture, and how idempotency fits into event-driven architectures." },
  ],
  glossary: [
    { term: "Idempotency", definition: "The property of an operation where executing it multiple times produces the same result as executing it once." },
    { term: "Idempotency key", definition: "A unique client-generated identifier (typically UUID) sent with a request to enable the server to deduplicate retries." },
    { term: "At-least-once delivery", definition: "A delivery guarantee where every message is delivered one or more times. The consumer may see duplicates and must handle them (via idempotency)." },
    { term: "Exactly-once processing", definition: "Achieved by combining at-least-once delivery with idempotent consumers. Each message's effect is applied exactly once, even if delivered multiple times." },
    { term: "Transactional outbox", definition: "A pattern where domain events are written to an outbox table in the same transaction as the business data change, then published asynchronously by a separate process." },
    { term: "Dual-write problem", definition: "The risk of inconsistency when writing to two systems (e.g., database and message broker) without a distributed transaction. One write may succeed while the other fails." },
    { term: "Optimistic locking", definition: "A concurrency control strategy using a version number. Updates only succeed if the current version matches the expected version, preventing lost updates." },
    { term: "Upsert", definition: "A database operation that inserts a row if it does not exist, or updates it if it does (INSERT ... ON CONFLICT DO UPDATE). Naturally idempotent for set operations." },
  ],
};
