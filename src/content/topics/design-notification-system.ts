import type { TopicContent } from "../types";

export const designNotificationSystem: TopicContent = {
  quickSummary: [
    "A notification system delivers messages across multiple channels -- push notifications (APNs/FCM), email (SMTP/SES), SMS (Twilio/SNS), and in-app (WebSocket/SSE) -- routing each notification to the user's preferred channel based on notification type, urgency, and user settings.",
    "At scale (billions of notifications per day), the system decouples producers from consumers using message queues (Kafka/SQS). Each channel has its own worker pool that consumes from dedicated queues, allowing independent scaling and failure isolation per delivery channel.",
    "A template engine separates notification content from delivery logic. Templates are parameterized with placeholders (e.g., '{{user_name}}, your order {{order_id}} has shipped') and rendered at send time by merging template definitions with per-event context data, supporting localization and A/B testing.",
    "Rate limiting protects users from notification fatigue and protects downstream providers from throttling. Per-user, per-channel, and per-notification-type rate limits are enforced using sliding window counters in Redis, with overflow notifications either dropped, batched, or downgraded to a digest.",
    "Delivery tracking and retry with exponential backoff ensure reliability. Each notification is assigned a unique ID and its lifecycle (queued, sent, delivered, read, failed) is tracked. Failed deliveries are retried with exponential backoff and jitter, with a dead-letter queue capturing permanently failed notifications for investigation.",
  ],
  detailed: [
    "## High-Level Architecture\n\nThe notification system is composed of several layers: **Notification Service** (API gateway that receives send requests from internal services), **Validation and Enrichment** (checks user preferences, deduplicates, applies rate limits, resolves templates), **Channel Router** (determines which channels to use based on priority, user preferences, and channel availability), **Channel Workers** (per-channel consumer pools that handle actual delivery via third-party providers), and **Tracking Service** (records delivery status, handles callbacks/webhooks from providers). Producers (order service, payment service, social service) call the Notification Service API with a notification type, recipient, and context data. The service validates the request, checks if the user has opted out, resolves the template, and publishes channel-specific messages to Kafka topics (one topic per channel). Channel workers consume from their respective topics and deliver via the appropriate provider (APNs for iOS push, FCM for Android push, SES/SendGrid for email, Twilio for SMS). Provider delivery receipts (webhooks, callbacks) flow back into the tracking service to update notification status.",
    "## Template Engine and User Preferences\n\nThe **template engine** stores versioned templates in a template registry (database or configuration service). Each template has a unique type identifier (e.g., 'order_shipped', 'payment_received'), a channel variant (push body is shorter than email body), locale-specific translations, and parameterized placeholders. At render time, the engine merges the template with event context data using a lightweight templating language (Mustache, Handlebars, or a custom DSL). Templates support conditional blocks for personalization (e.g., show a coupon section only for premium users). **User preferences** are stored per user and define: which notification types they want to receive, preferred channels per type (e.g., 'order updates via push + email, marketing via email only'), quiet hours (do not disturb windows), and language/locale. The preference service is queried during the enrichment phase. If a user has disabled a notification type entirely, the notification is dropped. If they have channel preferences, the router sends only to those channels. Quiet hours cause notifications to be deferred (queued with a scheduled delivery time) rather than dropped.",
    "## Rate Limiting and Priority Levels\n\nRate limiting operates at multiple granularities: **per-user** (no more than N notifications per hour to prevent fatigue), **per-channel** (respect provider rate limits -- e.g., APNs throttles per device token), **per-notification-type** (marketing emails capped at 1/day), and **global** (circuit breaker if total throughput exceeds system capacity). Implementation uses Redis sliding window counters: for each (userId, channel, window) tuple, increment a counter on each send; if the counter exceeds the limit, the notification is either dropped (low priority), deferred to the next window (medium), or sent anyway with a warning (critical). **Priority levels** classify notifications: P0 (critical -- security alerts, OTP codes) bypass rate limits and quiet hours; P1 (high -- transaction confirmations) respect quiet hours but get priority queue placement; P2 (normal -- social updates) follow all rules; P3 (low -- marketing, digests) are batched and sent during optimal engagement windows. Priority determines queue ordering: channel workers consume from priority-partitioned topics, processing P0 before P1 before P2.",
    "## Delivery Tracking, Retry, and Reliability\n\nEvery notification is assigned a globally unique notification ID (UUID or Snowflake ID) at creation. The **tracking service** maintains a state machine for each notification: Created -> Queued -> Sent -> Delivered -> Read (or Failed at any stage). State transitions are recorded in an append-only event log (Cassandra or DynamoDB) for auditability. Provider callbacks (APNs delivery receipts, email open/click tracking pixels, SMS delivery reports) update the state asynchronously. **Retry logic**: when a channel worker fails to deliver (provider timeout, 5xx error, network issue), the notification is re-queued with exponential backoff: delay = min(base * 2^attempt + jitter, max_delay). Typical values: base=1s, max_delay=1h, max_attempts=5. After max attempts, the notification moves to a **dead-letter queue (DLQ)** for manual investigation or alerting. **Idempotency**: each delivery attempt includes the notification ID; providers that support idempotency keys will deduplicate. For providers that do not, the system checks the tracking state before re-sending. **Exactly-once semantics** are approximated but not guaranteed -- the system errs on the side of at-least-once delivery for critical notifications, with deduplication at the client layer for in-app notifications.",
    "## Scalability and Multi-Tenant Considerations\n\nHorizontal scaling is achieved by partitioning Kafka topics by recipient user ID (ensuring all notifications for a user go to the same partition for ordering) and scaling channel worker pools independently. Email workers might need 50 instances while push workers need 200, depending on throughput ratios. **Analytics pipeline**: a copy of all notification events flows into a data warehouse (BigQuery, Redshift) for computing delivery rates, open rates, click-through rates, and engagement metrics per notification type. These metrics feed back into the template engine for A/B test evaluation and into the preference service for smart defaults. **Multi-region deployment**: for global users, notification services run in multiple regions. User preferences and templates are replicated across regions. The routing layer sends notifications to the region closest to the user's device for lowest latency push delivery. **Observability**: every component emits metrics (queue depth, delivery latency p50/p99, failure rate by provider, rate limit hit rate) to a monitoring system (Prometheus/Grafana). Alerts fire on anomalies: sudden spike in failures, queue backlog growing, provider degradation.",
  ],
  deepDive: [
    "Fan-out strategies differ significantly based on notification type. **Event-triggered notifications** (order shipped, password reset) are 1:1 and processed immediately. **Broadcast notifications** (system maintenance, new feature announcement) target millions of users and require a different path: a broadcast service expands the recipient list in batches, writing individual notifications to the queue in chunks of 1000-10000. This prevents a single broadcast from overwhelming the queue. Segment-based targeting (e.g., 'all users in region X who have not logged in for 30 days') requires integration with a user segmentation service that pre-computes audience lists. The broadcast path also needs its own rate limiting to prevent a marketing campaign from starving transactional notifications.",
    "Channel failover and multi-channel orchestration add resilience. When the primary channel fails (push provider returns a permanent error like 'invalid device token'), the system can automatically fall back to a secondary channel (email). This requires a **channel orchestration engine** that defines fallback chains per notification type: for OTP, try SMS first, then voice call; for order updates, try push first, then email. The orchestrator tracks which channels succeeded and avoids sending the same notification twice (once via push and again via fallback email if push already delivered). Time-based escalation is another pattern: send a push notification, wait 5 minutes, if not read (no read receipt), send an email as a follow-up. This requires a scheduler service that tracks pending escalations and fires them based on the absence of a delivery/read event within the window.",
    "Notification deduplication and aggregation handle bursty event sources. If a user receives 50 likes on a photo in 10 minutes, sending 50 individual push notifications creates a terrible experience. The **aggregation service** groups related notifications within a time window (e.g., 5 minutes) and collapses them into a single notification ('Alice, Bob, and 48 others liked your photo'). Aggregation rules are defined per notification type: social events aggregate by target entity (photo, post), while transaction events (payment received) are never aggregated. The aggregation buffer is implemented as a time-windowed accumulator in Redis: on each incoming notification, check if an aggregation buffer exists for (userId, notificationType, entityId); if yes, increment the counter and update the actor list; if no, create a new buffer with a TTL equal to the aggregation window. When the TTL expires, a scheduled job flushes the aggregated notification to the channel queue.",
    "Compliance and deliverability are critical operational concerns. Email notifications must comply with CAN-SPAM (unsubscribe link in every email, honor opt-outs within 10 days), GDPR (right to erasure applies to notification history), and carrier regulations for SMS. The system maintains per-user consent records and processes unsubscribe events from multiple sources (email link clicks, SMS STOP replies, in-app preference changes) through a centralized preference update pipeline. Email deliverability requires managing sender reputation: using dedicated IP pools, implementing SPF/DKIM/DMARC, monitoring bounce rates, and automatically suppressing hard-bounced addresses. SMS requires maintaining opt-in records and handling carrier-specific throughput limits. Push notifications require handling token rotation (when a user reinstalls the app, the device token changes) and cleaning up stale tokens that return 'not registered' errors from APNs/FCM.",
  ],
  code: [
    {
      language: "cpp",
      caption:
        "Priority queue for notifications with multi-level priority support and thread-safe operations",
      source: `#include <queue>
#include <mutex>
#include <condition_variable>
#include <string>
#include <chrono>
#include <optional>

enum class Priority { CRITICAL = 0, HIGH = 1, NORMAL = 2, LOW = 3 };
enum class Channel { PUSH, EMAIL, SMS, IN_APP };

struct Notification {
    std::string id;
    std::string userId;
    std::string templateId;
    Priority priority;
    Channel channel;
    std::chrono::steady_clock::time_point createdAt;
    int attemptCount = 0;
    std::chrono::steady_clock::time_point nextRetryAt;

    // Higher priority (lower enum value) should be dequeued first.
    // Within same priority, earlier creation time wins.
    bool operator>(const Notification& other) const {
        if (priority != other.priority)
            return static_cast<int>(priority) > static_cast<int>(other.priority);
        return createdAt > other.createdAt;
    }
};

class NotificationPriorityQueue {
    std::priority_queue<Notification, std::vector<Notification>,
                        std::greater<Notification>> pq_;
    mutable std::mutex mu_;
    std::condition_variable cv_;
    bool shutdown_ = false;
    size_t maxSize_;

public:
    explicit NotificationPriorityQueue(size_t maxSize = 100000)
        : maxSize_(maxSize) {}

    // Returns false if the queue is full and the notification is low priority.
    bool enqueue(Notification notif) {
        std::unique_lock lock(mu_);
        if (pq_.size() >= maxSize_ && notif.priority == Priority::LOW) {
            return false;  // Shed low-priority load
        }
        pq_.push(std::move(notif));
        cv_.notify_one();
        return true;
    }

    // Blocking dequeue with timeout. Returns nullopt on shutdown or timeout.
    std::optional<Notification> dequeue(std::chrono::milliseconds timeout) {
        std::unique_lock lock(mu_);
        if (!cv_.wait_for(lock, timeout,
                          [&] { return !pq_.empty() || shutdown_; })) {
            return std::nullopt;  // Timeout
        }
        if (shutdown_ && pq_.empty()) return std::nullopt;
        Notification top = pq_.top();
        pq_.pop();
        return top;
    }

    void shutdown() {
        std::lock_guard lock(mu_);
        shutdown_ = true;
        cv_.notify_all();
    }

    size_t size() const {
        std::lock_guard lock(mu_);
        return pq_.size();
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Sliding window rate limiter for per-user, per-channel notification throttling",
      source: `#include <unordered_map>
#include <deque>
#include <mutex>
#include <string>
#include <chrono>

struct RateLimitConfig {
    int maxCount;                              // Max notifications allowed
    std::chrono::seconds windowSize;           // Time window
};

class NotificationRateLimiter {
    struct SlidingWindow {
        std::deque<std::chrono::steady_clock::time_point> timestamps;
    };

    std::unordered_map<std::string, SlidingWindow> windows_;
    std::mutex mu_;

    // Build a composite key: "userId:channel:notifType"
    static std::string makeKey(const std::string& userId,
                               const std::string& channel,
                               const std::string& notifType) {
        return userId + ":" + channel + ":" + notifType;
    }

    void evictExpired(SlidingWindow& win,
                      std::chrono::steady_clock::time_point cutoff) {
        while (!win.timestamps.empty() && win.timestamps.front() < cutoff) {
            win.timestamps.pop_front();
        }
    }

public:
    // Returns true if the notification is allowed under rate limits.
    bool allow(const std::string& userId,
               const std::string& channel,
               const std::string& notifType,
               const RateLimitConfig& config) {
        auto now = std::chrono::steady_clock::now();
        auto cutoff = now - config.windowSize;
        std::string key = makeKey(userId, channel, notifType);

        std::lock_guard lock(mu_);
        auto& win = windows_[key];
        evictExpired(win, cutoff);

        if (static_cast<int>(win.timestamps.size()) >= config.maxCount) {
            return false;  // Rate limit exceeded
        }

        win.timestamps.push_back(now);
        return true;
    }

    // Check remaining quota without consuming it.
    int remaining(const std::string& userId,
                  const std::string& channel,
                  const std::string& notifType,
                  const RateLimitConfig& config) {
        auto cutoff = std::chrono::steady_clock::now() - config.windowSize;
        std::string key = makeKey(userId, channel, notifType);

        std::lock_guard lock(mu_);
        auto it = windows_.find(key);
        if (it == windows_.end()) return config.maxCount;

        evictExpired(it->second, cutoff);
        return config.maxCount - static_cast<int>(it->second.timestamps.size());
    }

    // Periodic cleanup of stale entries to prevent memory growth.
    void cleanup(std::chrono::seconds maxAge) {
        auto cutoff = std::chrono::steady_clock::now() - maxAge;
        std::lock_guard lock(mu_);
        for (auto it = windows_.begin(); it != windows_.end(); ) {
            evictExpired(it->second, cutoff);
            if (it->second.timestamps.empty()) {
                it = windows_.erase(it);
            } else {
                ++it;
            }
        }
    }
};`,
    },
    {
      language: "cpp",
      caption:
        "Template engine that resolves parameterized notification templates with variable substitution and conditional blocks",
      source: `#include <string>
#include <unordered_map>
#include <vector>
#include <stdexcept>
#include <sstream>
#include <optional>

struct NotificationTemplate {
    std::string templateId;
    std::string version;
    std::string subject;        // For email channel
    std::string body;           // Template body with {{placeholders}}
    std::string locale;         // e.g., "en-US", "es-MX"
};

class TemplateEngine {
    // templateId -> (locale -> template)
    std::unordered_map<std::string,
        std::unordered_map<std::string, NotificationTemplate>> registry_;

public:
    void registerTemplate(NotificationTemplate tmpl) {
        registry_[tmpl.templateId][tmpl.locale] = std::move(tmpl);
    }

    // Resolve a template with the given context variables.
    // Supports {{variable}} substitution and {{#if var}}...{{/if}} conditionals.
    std::string render(const std::string& templateId,
                       const std::string& locale,
                       const std::unordered_map<std::string, std::string>& ctx) {
        auto tmpl = findTemplate(templateId, locale);
        if (!tmpl) {
            throw std::runtime_error("Template not found: " + templateId);
        }
        return substitute(tmpl->body, ctx);
    }

    std::string renderSubject(const std::string& templateId,
                              const std::string& locale,
                              const std::unordered_map<std::string, std::string>& ctx) {
        auto tmpl = findTemplate(templateId, locale);
        if (!tmpl) {
            throw std::runtime_error("Template not found: " + templateId);
        }
        return substitute(tmpl->subject, ctx);
    }

private:
    std::optional<NotificationTemplate> findTemplate(
            const std::string& id, const std::string& locale) {
        auto it = registry_.find(id);
        if (it == registry_.end()) return std::nullopt;

        // Try exact locale, then language prefix, then fallback "en-US"
        auto& locales = it->second;
        auto lit = locales.find(locale);
        if (lit != locales.end()) return lit->second;

        std::string lang = locale.substr(0, locale.find('-'));
        for (auto& [loc, tmpl] : locales) {
            if (loc.substr(0, loc.find('-')) == lang) return tmpl;
        }

        lit = locales.find("en-US");
        if (lit != locales.end()) return lit->second;
        return std::nullopt;
    }

    std::string substitute(const std::string& text,
                           const std::unordered_map<std::string, std::string>& ctx) {
        std::string result;
        result.reserve(text.size());
        size_t i = 0;

        while (i < text.size()) {
            // Handle {{#if var}}...{{/if}} conditional blocks
            if (text.substr(i, 5) == "{{#if") {
                size_t varStart = text.find(' ', i) + 1;
                size_t varEnd = text.find("}}", varStart);
                std::string var = text.substr(varStart, varEnd - varStart);

                size_t blockStart = varEnd + 2;
                size_t blockEnd = text.find("{{/if}}", blockStart);

                bool hasVar = ctx.count(var) && !ctx.at(var).empty();
                if (hasVar) {
                    std::string inner = text.substr(blockStart,
                                                    blockEnd - blockStart);
                    result += substitute(inner, ctx);
                }
                i = blockEnd + 7;  // Skip past {{/if}}
            }
            // Handle {{variable}} substitution
            else if (i + 1 < text.size() &&
                     text[i] == '{' && text[i + 1] == '{') {
                size_t end = text.find("}}", i + 2);
                if (end == std::string::npos) {
                    result += text[i++];
                    continue;
                }
                std::string key = text.substr(i + 2, end - i - 2);
                auto it = ctx.find(key);
                result += (it != ctx.end()) ? it->second : ("{{" + key + "}}");
                i = end + 2;
            } else {
                result += text[i++];
            }
        }
        return result;
    }
};

// Usage example:
// TemplateEngine engine;
// engine.registerTemplate({
//     "order_shipped", "1.0",
//     "Your order {{order_id}} has shipped!",
//     "Hi {{user_name}}, your order {{order_id}} shipped via {{carrier}}."
//     "{{#if tracking_url}}Track it here: {{tracking_url}}{{/if}}",
//     "en-US"
// });
// auto body = engine.render("order_shipped", "en-US", {
//     {"user_name", "Alice"}, {"order_id", "ORD-9821"},
//     {"carrier", "FedEx"}, {"tracking_url", "https://track.example.com/9821"}
// });`,
    },
  ],
  diagrams: [
    {
      title: "Notification System Architecture",
      kind: "architecture",
      caption:
        "End-to-end notification system with multi-channel delivery, template engine, and tracking",
      mermaid: `graph TB
    subgraph Producers
        OS[Order Service]
        PS[Payment Service]
        SS[Social Service]
        MS[Marketing Service]
    end

    subgraph Notification Platform
        API[Notification API Gateway]
        VAL[Validator + Deduplicator]
        PREF[User Preference Service]
        TE[Template Engine]
        RL[Rate Limiter]
        ROUTER[Channel Router]
        PQ[Priority Queue - Kafka]
    end

    subgraph Channel Workers
        PW[Push Workers]
        EW[Email Workers]
        SW[SMS Workers]
        IW[In-App Workers]
    end

    subgraph Providers
        APNS[APNs / FCM]
        SES[SES / SendGrid]
        TWI[Twilio / SNS]
        WS[WebSocket Gateway]
    end

    subgraph Tracking
        TS[Tracking Service]
        DLQ[Dead Letter Queue]
        AN[Analytics Pipeline]
    end

    OS & PS & SS & MS --> API
    API --> VAL
    VAL --> PREF
    VAL --> TE
    VAL --> RL
    RL --> ROUTER
    ROUTER --> PQ
    PQ --> PW & EW & SW & IW
    PW --> APNS
    EW --> SES
    SW --> TWI
    IW --> WS
    APNS & SES & TWI --> TS
    PW & EW & SW & IW --> TS
    TS --> DLQ
    TS --> AN`,
    },
    {
      title: "Notification Lifecycle Flow",
      kind: "flow",
      caption:
        "Complete flow from notification request to delivery with rate limiting, retry, and fallback",
      mermaid: `flowchart TD
    A[Producer sends notification request] --> B{Validate request}
    B -->|Invalid| C[Return error to producer]
    B -->|Valid| D[Check user preferences]
    D -->|User opted out| E[Drop notification, log]
    D -->|Allowed| F[Resolve template + locale]
    F --> G{Check rate limit}
    G -->|Exceeded, P3| H[Drop or batch into digest]
    G -->|Exceeded, P1-P2| I[Defer to next window]
    G -->|Allowed| J[Assign priority + notification ID]
    G -->|P0 Critical| J
    J --> K[Publish to channel queue]
    K --> L[Channel worker picks up]
    L --> M{Deliver via provider}
    M -->|Success| N[Update status: Sent]
    M -->|Transient failure| O{Retry count < max?}
    O -->|Yes| P[Re-queue with backoff delay]
    P --> L
    O -->|No| Q[Move to Dead Letter Queue]
    M -->|Permanent failure| R{Fallback channel?}
    R -->|Yes| S[Route to fallback channel]
    S --> K
    R -->|No| Q
    N --> T[Provider callback: Delivered]
    T --> U[Update status: Delivered]`,
    },
    {
      title: "Notification State Machine",
      kind: "state",
      caption:
        "Lifecycle states of a notification from creation to terminal state",
      mermaid: `stateDiagram-v2
    [*] --> Created: Producer sends request
    Created --> Validated: Pass validation
    Created --> Rejected: Fail validation
    Validated --> RateLimited: Exceeds limit
    Validated --> Queued: Pass rate check
    RateLimited --> Deferred: Medium priority
    RateLimited --> Dropped: Low priority
    Deferred --> Queued: Window opens
    Queued --> Sending: Worker picks up
    Sending --> Sent: Provider accepts
    Sending --> RetryPending: Transient error
    Sending --> FallbackRouted: Permanent error + fallback exists
    RetryPending --> Sending: Backoff elapsed
    RetryPending --> Failed: Max retries exceeded
    FallbackRouted --> Queued: Re-queued on fallback channel
    Sent --> Delivered: Provider confirms delivery
    Sent --> Bounced: Hard bounce
    Delivered --> Read: User opens or clicks
    Failed --> [*]
    Dropped --> [*]
    Rejected --> [*]
    Bounced --> [*]
    Read --> [*]`,
    },
    {
      title: "Retry with Exponential Backoff Sequence",
      kind: "sequence",
      caption:
        "Interaction between channel worker, provider, and retry scheduler during failed delivery attempts",
      mermaid: `sequenceDiagram
    participant W as Channel Worker
    participant P as Push Provider (FCM)
    participant R as Retry Scheduler
    participant T as Tracking Service
    participant DLQ as Dead Letter Queue

    W->>P: Send notification (attempt 1)
    P-->>W: 503 Service Unavailable
    W->>T: Update status: RetryPending
    W->>R: Schedule retry (delay = 1s + jitter)
    R-->>W: Retry triggered
    W->>P: Send notification (attempt 2)
    P-->>W: 503 Service Unavailable
    W->>R: Schedule retry (delay = 2s + jitter)
    R-->>W: Retry triggered
    W->>P: Send notification (attempt 3)
    P-->>W: 200 OK (message accepted)
    W->>T: Update status: Sent
    Note over P,T: Later, provider confirms delivery
    P->>T: Delivery receipt callback
    T->>T: Update status: Delivered

    Note over W,DLQ: If all retries exhausted
    W->>P: Send notification (attempt 5)
    P-->>W: 503 Service Unavailable
    W->>T: Update status: Failed
    W->>DLQ: Move to dead letter queue`,
    },
  ],
  interviewQA: [
    {
      q: "How would you handle sending a notification to millions of users for a broadcast event (e.g., system maintenance announcement)?",
      a: "A broadcast notification should not be expanded into millions of individual messages in one shot -- that would overwhelm the queue and starve transactional notifications. Instead, use a dedicated broadcast service: (1) Store the broadcast definition (template, audience criteria) in the database. (2) A batch expansion job queries the user base in pages (e.g., 10,000 users per batch) and writes individual notification records to Kafka in controlled bursts with rate limiting (e.g., 50K/second). (3) Use a separate Kafka topic or lower-priority partition so broadcasts do not compete with transactional notifications. (4) Track broadcast progress (X of Y batches completed) for monitoring. (5) Support cancellation -- if the broadcast is aborted mid-expansion, remaining batches are skipped. For segment-based broadcasts, pre-compute the audience list asynchronously and store it, so expansion only reads from the precomputed list.",
    },
    {
      q: "How do you prevent notification fatigue while ensuring critical notifications always reach the user?",
      a: "Use a tiered priority system combined with per-user rate limiting. Assign every notification type a priority level: P0 (critical -- OTP, security alerts) bypasses all rate limits and quiet hours. P1 (high -- payment confirmation) respects quiet hours but has generous limits. P2 (normal -- social updates) follows standard rate limits (e.g., max 20 push notifications per hour). P3 (low -- marketing) is heavily throttled (max 1 per day per channel) and can be batched into digests. Rate limits use sliding window counters in Redis keyed by (userId, channel, priority). When a P2/P3 notification hits the limit, it can be (a) dropped with a log, (b) deferred to the next window, or (c) aggregated into a daily digest email. Additionally, implement smart notification grouping: collapse 50 'someone liked your post' into a single 'Alice and 49 others liked your post'. Let users configure their own thresholds in preferences.",
    },
    {
      q: "How would you design the retry mechanism for failed notification deliveries?",
      a: "Use exponential backoff with jitter to avoid thundering herd on provider recovery. Formula: delay = min(base_delay * 2^attempt + random_jitter, max_delay). Typical config: base=1s, max=3600s, max_attempts=5. Distinguish between transient errors (5xx, timeout -- retry) and permanent errors (invalid token, unsubscribed -- do not retry, update user record). Each notification record tracks attempt_count and next_retry_at. A retry scheduler (cron job or delayed queue like SQS with visibility timeout) re-enqueues notifications when their retry time arrives. After exhausting retries, move to a dead-letter queue with full context (notification payload, error history, timestamps) for debugging. For permanent push token errors, trigger a token cleanup job that marks the device token as invalid. Implement circuit breakers per provider: if FCM returns errors for >50% of requests in a 1-minute window, stop sending and queue all notifications for that provider until the circuit half-opens.",
    },
    {
      q: "How do you track delivery status across multiple channels and providers?",
      a: "Maintain a centralized tracking service backed by an append-only event store (Cassandra with partition key = notification_id). Each notification has a state machine: Created -> Queued -> Sending -> Sent -> Delivered -> Read (with Failed and Bounced as terminal error states). Channel workers emit state-change events synchronously (Queued, Sending, Sent). Provider delivery confirmations arrive asynchronously via webhooks: APNs/FCM provide delivery receipts, email providers send bounce/delivery/open/click events, SMS providers send delivery reports. The tracking service exposes APIs for: (1) single notification status lookup by ID, (2) user notification history with pagination, (3) aggregate delivery metrics (delivery rate, bounce rate, open rate per notification type). For email, embed a tracking pixel (1x1 transparent image hosted by the tracking service) to detect opens, and rewrite links through a redirect service to track clicks. For push, rely on provider delivery receipts. For in-app, the client SDK reports 'displayed' and 'clicked' events directly.",
    },
    {
      q: "What happens when a third-party provider (e.g., Twilio for SMS) goes down?",
      a: "Implement multi-layer resilience: (1) **Circuit breaker**: monitor provider error rates. If errors exceed a threshold (e.g., 50% in 60 seconds), trip the circuit -- stop sending to that provider, queue all notifications for that channel. The circuit half-opens after a cooldown period and lets a few test requests through. If they succeed, close the circuit. (2) **Provider failover**: configure backup providers per channel (e.g., Twilio primary, Vonage secondary for SMS). When the primary circuit breaks, route to the backup. (3) **Queue buffering**: since notifications are already in Kafka, they survive provider outages. Workers simply stop consuming (or consume and re-enqueue with delay) until the provider recovers. No data is lost. (4) **Channel failover**: if the entire SMS channel is degraded, the orchestration engine can escalate critical notifications to an alternative channel (e.g., push notification + email for an OTP that would normally go via SMS). (5) **Alerting**: immediate page to the on-call engineer when a provider circuit trips, with dashboards showing queue depth growth and estimated drain time.",
    },
  ],
  mcqs: [
    {
      q: "A notification system uses priority levels P0-P3. A P0 (critical) notification arrives during a user's quiet hours. What should happen?",
      options: [
        "Drop the notification and log the event",
        "Defer the notification until quiet hours end",
        "Deliver immediately, bypassing quiet hours",
        "Downgrade to P1 and apply normal rules",
      ],
      answerIndex: 2,
      explanation:
        "P0 notifications (security alerts, OTP codes) are critical and must reach the user immediately regardless of quiet hours or rate limits. Deferring an OTP code would make it useless. The priority system exists precisely to distinguish between notifications that can wait and those that cannot.",
    },
    {
      q: "When retrying a failed notification delivery, exponential backoff with jitter is preferred over fixed-interval retry because:",
      options: [
        "It reduces the total number of retry attempts needed",
        "It prevents thundering herd when a provider recovers, spreading retry load over time",
        "It guarantees exactly-once delivery",
        "It eliminates the need for a dead-letter queue",
      ],
      answerIndex: 1,
      explanation:
        "When a provider goes down, many notifications fail simultaneously. Fixed-interval retry would cause all of them to retry at the same moment, potentially overwhelming the recovering provider. Exponential backoff spreads retries over increasing intervals, and jitter (random offset) prevents synchronization of retry waves across different notification workers.",
    },
    {
      q: "In a multi-channel notification system, per-channel Kafka topics (one for push, one for email, one for SMS) are preferred over a single shared topic because:",
      options: [
        "Kafka does not support multiple consumer groups on a single topic",
        "Each channel has different throughput, latency, and scaling requirements that benefit from independent consumer pools",
        "A single topic would lose message ordering",
        "Kafka topics have a maximum message size that differs per channel",
      ],
      answerIndex: 1,
      explanation:
        "Push notifications need low-latency delivery with many workers, while email batching can tolerate higher latency with fewer workers. Per-channel topics allow independent scaling (100 push workers vs. 20 email workers), independent backpressure (SMS provider throttling does not block push delivery), and channel-specific retry policies. A shared topic would couple all channels together.",
    },
    {
      q: "When 50 users like a photo within 5 minutes, the notification system should:",
      options: [
        "Send 50 individual push notifications immediately",
        "Send only the first notification and drop the remaining 49",
        "Aggregate into a single notification like 'Alice, Bob, and 48 others liked your photo'",
        "Queue all 50 and send them as a batch email digest",
      ],
      answerIndex: 2,
      explanation:
        "Notification aggregation groups related events within a time window and collapses them into a single, more informative notification. This prevents notification fatigue while still conveying the full information. The aggregation buffer accumulates events by (userId, notificationType, entityId) and flushes a summarized notification when the window expires.",
    },
  ],
  flashcards: [
    {
      front: "What are the four primary notification delivery channels?",
      back: "Push notifications (APNs for iOS, FCM for Android), Email (SMTP via SES/SendGrid), SMS (Twilio/SNS), and In-app (WebSocket or SSE for real-time, polling for fallback). Each channel has different latency, cost, reliability, and content richness trade-offs.",
    },
    {
      front: "How does exponential backoff with jitter work for notification retry?",
      back: "delay = min(base_delay * 2^attempt + random_jitter, max_delay). Example: base=1s, attempts produce delays of ~1s, ~2s, ~4s, ~8s, ~16s (plus random jitter). Jitter prevents synchronized retry storms when a provider recovers. After max_attempts, the notification moves to a dead-letter queue.",
    },
    {
      front: "What is the difference between transient and permanent delivery failures?",
      back: "Transient failures (5xx errors, timeouts, rate limiting) are temporary and should be retried with backoff. Permanent failures (invalid device token, unsubscribed email, deactivated phone number) will never succeed and should not be retried. Instead, update the user's contact record and try a fallback channel if available.",
    },
    {
      front: "How does notification aggregation prevent fatigue?",
      back: "A time-windowed buffer in Redis groups related events by (userId, notificationType, entityId). Within the window (e.g., 5 minutes), new events increment a counter and update the actor list. When the window expires, one consolidated notification is sent ('Alice, Bob, and 48 others liked your photo') instead of 50 individual ones.",
    },
    {
      front: "What is the role of the template engine in a notification system?",
      back: "The template engine decouples content from delivery logic. Templates are versioned, parameterized ({{user_name}}), locale-aware, and channel-specific (push body is shorter than email). At send time, the engine merges the template with event context data, supporting personalization, localization, and A/B testing without code changes.",
    },
    {
      front: "How are priority levels used in notification routing?",
      back: "P0 (critical): OTP, security alerts -- bypass rate limits and quiet hours. P1 (high): transaction confirmations -- respect quiet hours, priority queue placement. P2 (normal): social updates -- standard rate limits. P3 (low): marketing -- heavily throttled, batched into digests. Priority determines queue ordering and which rules can be bypassed.",
    },
    {
      front: "What is a dead-letter queue (DLQ) in notification systems?",
      back: "A DLQ captures notifications that have exhausted all retry attempts and permanently failed to deliver. Each DLQ entry contains the full notification payload, error history (all attempt timestamps and error codes), and metadata. Operations teams monitor the DLQ to identify systemic issues (provider outages, bad token batches) and can replay messages after fixing the root cause.",
    },
    {
      front: "How does channel failover work?",
      back: "Each notification type defines a fallback chain (e.g., OTP: SMS -> voice call; order update: push -> email). When the primary channel permanently fails (invalid token) or the provider circuit breaker trips, the orchestration engine routes to the next channel in the chain. It tracks which channels succeeded to avoid duplicate delivery across channels.",
    },
  ],
  exercises: [
    "Design and implement a notification preference service that stores per-user, per-notification-type channel preferences with quiet hours. Include APIs to update preferences, query effective delivery channels for a given notification, and handle timezone-aware quiet hour calculations.",
    "Build a notification aggregation system that groups social notifications (likes, comments, follows) within configurable time windows. Implement the Redis-based accumulator buffer, the flush-on-expiry mechanism, and the template that renders aggregated content ('X, Y, and N others liked your post').",
    "Implement a multi-provider failover system for the SMS channel. Configure a primary provider (Twilio) and a secondary (Vonage) with a circuit breaker pattern. The circuit should trip after 50% error rate in a 60-second window and half-open after 30 seconds. Write the health check and failover routing logic.",
    "Design a delivery analytics pipeline that computes real-time metrics: delivery rate, bounce rate, open rate, and click-through rate per notification type and channel. Use a streaming processor (Kafka Streams or Flink) to compute windowed aggregates and expose them via a dashboard API.",
    "Implement an end-to-end notification deduplication system. Handle deduplication at the API layer (idempotency keys), the queue layer (message deduplication window), and the provider layer (APNs collapse ID, FCM collapse key). Test with scenarios: duplicate API calls, worker crashes mid-delivery, and provider timeout with uncertain delivery.",
  ],
  revisionNotes: [
    "The notification system decouples producers from delivery via message queues (Kafka). Producers publish a notification request; the platform handles validation, templating, rate limiting, routing, and delivery independently.",
    "Four delivery channels: Push (APNs/FCM, low latency, limited content), Email (SES/SendGrid, rich content, higher latency), SMS (Twilio/SNS, highest cost, regulated), In-App (WebSocket/SSE, requires active session).",
    "Template engine separates content from logic: versioned templates with {{placeholders}}, locale variants, channel-specific formats. Render at send time by merging template + event context.",
    "Rate limiting uses sliding window counters in Redis keyed by (userId, channel, notificationType). Limits are tiered by priority: P0 bypasses all limits, P3 is heavily throttled.",
    "Priority levels: P0 (critical, bypass everything), P1 (high, respect quiet hours), P2 (normal, standard limits), P3 (low, batch into digests). Priority determines queue consumption order.",
    "Retry with exponential backoff: delay = min(base * 2^attempt + jitter, max_delay). Distinguish transient (retry) vs permanent (no retry, update contact record) failures. Dead-letter queue for exhausted retries.",
    "Notification lifecycle state machine: Created -> Validated -> Queued -> Sending -> Sent -> Delivered -> Read, with branches for RateLimited, RetryPending, Failed, and Bounced.",
    "Aggregation groups bursty events (50 likes) into one notification using a time-windowed buffer. Prevents fatigue while preserving information. Rules are per-notification-type (social events aggregate, transaction events do not).",
    "Channel failover: define fallback chains per notification type. On permanent failure or circuit breaker trip, route to next channel. Track delivery across channels to prevent duplicates.",
    "Observability: track queue depth, delivery latency (p50/p99), failure rate per provider, rate limit hit rate, open/click rates. Alert on provider degradation, queue backlog growth, and abnormal failure spikes.",
  ],
  cheatSheet: [
    "Architecture layers: API Gateway -> Validator -> Preference Check -> Template Render -> Rate Limiter -> Channel Router -> Priority Queue -> Channel Workers -> Providers -> Tracking Service",
    "Channel selection: Push for real-time + low data, Email for rich content + async, SMS for critical + no-app, In-App for active users. Cost order (high to low): SMS > Email > Push > In-App.",
    "Rate limit formula (sliding window): key = userId:channel:type, counter per time window. If count >= limit: P0 send anyway, P1-P2 defer, P3 drop or digest.",
    "Retry backoff: delay = min(base * 2^attempt + jitter, max_delay). Typical: base=1s, max=3600s, max_attempts=5. Jitter = random(0, base * 2^attempt * 0.1).",
    "Permanent vs transient errors: 4xx/invalid token/unsubscribed = permanent (do not retry, clean up). 5xx/timeout/rate-limited = transient (retry with backoff).",
    "Aggregation: buffer key = (userId, notifType, entityId), TTL = aggregation window (e.g., 5 min). On each event: if buffer exists, increment counter + append actor; else create buffer. On TTL expiry, flush as single notification.",
    "Circuit breaker states: Closed (normal) -> Open (error rate > threshold, stop sending) -> Half-Open (after cooldown, test with few requests) -> Closed (if tests pass) or Open (if tests fail).",
    "Idempotency: API layer uses idempotency key (client-provided UUID). Queue layer uses Kafka deduplication. Provider layer uses collapse IDs (APNs) or collapse keys (FCM).",
    "Broadcast expansion: never expand all-at-once. Batch into pages of 10K users, write to queue at controlled rate (50K/sec), use lower-priority topic to avoid starving transactional notifications.",
    "Tracking state machine: Created -> Queued -> Sending -> Sent -> Delivered -> Read. Terminal error states: Rejected, Dropped, Failed, Bounced. All transitions logged to append-only event store.",
  ],
  glossary: [
    {
      term: "APNs (Apple Push Notification service)",
      definition:
        "Apple's cloud service for sending push notifications to iOS, macOS, and other Apple devices. Requires a device token obtained during app registration and uses HTTP/2 for delivery. Returns immediate feedback on token validity.",
    },
    {
      term: "FCM (Firebase Cloud Messaging)",
      definition:
        "Google's cross-platform messaging service for sending push notifications to Android, iOS, and web applications. Supports topic-based messaging (pub/sub to groups), device group messaging, and upstream messaging from devices to server.",
    },
    {
      term: "Dead-Letter Queue (DLQ)",
      definition:
        "A secondary queue that captures messages that have failed processing after all retry attempts are exhausted. In notification systems, the DLQ holds undeliverable notifications with full error context for manual investigation, alerting, and potential replay after root cause resolution.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A fault-tolerance pattern that monitors error rates for a downstream service (e.g., push provider). When errors exceed a threshold, the circuit 'opens' and stops sending requests, preventing cascade failures. After a cooldown, it 'half-opens' to test recovery before fully closing.",
    },
    {
      term: "Notification Aggregation",
      definition:
        "The process of grouping multiple related notifications within a time window into a single summarized notification. Reduces notification fatigue for bursty events (e.g., collapsing 50 'liked your photo' events into one). Implemented via time-windowed buffers keyed by user, type, and target entity.",
    },
    {
      term: "Sliding Window Rate Limiter",
      definition:
        "A rate-limiting algorithm that tracks request timestamps in a rolling time window. Unlike fixed windows that reset at boundaries (causing burst-at-boundary issues), sliding windows provide smooth, continuous rate enforcement by evicting expired timestamps as new ones arrive.",
    },
    {
      term: "Idempotency Key",
      definition:
        "A client-generated unique identifier (typically UUID) attached to a notification request. The server uses it to detect and deduplicate retried requests, ensuring that network-level retries or client bugs do not result in the same notification being delivered multiple times.",
    },
  ],
  animations: [
    {
      title: "One event, three channels",
      steps: [
        {
          label: "Event published",
          detail: "`OrderShipped` lands on a topic.",
        },
        {
          label: "Notification service consumes",
          detail: "Resolves the user's preferences and locale.",
        },
        {
          label: "Fan out per channel",
          detail: "Separate queues for push, email, and SMS — each with its own rate limits and failure behaviour.",
        },
        {
          label: "Template rendered",
          detail: "Per channel and locale, with the payload.",
        },
        {
          label: "Provider called",
          detail: "With retries and backoff. A provider outage backs up one queue without affecting the others.",
        },
        {
          label: "Deduplicate",
          detail: "An idempotency key per (user, event) stops a redelivered event sending the same notification twice.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "Push (APNs/FCM)",
      "Email (SES/SendGrid)",
      "SMS (Twilio/SNS)",
      "In-App (WebSocket)",
    ],
    rows: [
      [
        "Latency",
        "Low (sub-second)",
        "Medium (seconds to minutes)",
        "Medium (seconds)",
        "Very low (real-time)",
      ],
      [
        "Content richness",
        "Limited (title + short body + image)",
        "High (HTML, images, attachments)",
        "Very limited (160 chars plain text)",
        "High (custom UI rendering)",
      ],
      [
        "Cost per message",
        "Free (provider infrastructure cost only)",
        "Low ($0.10 per 1K emails)",
        "High ($0.0075 per SMS segment)",
        "Free (own infrastructure cost)",
      ],
      [
        "Requires app installed",
        "Yes (device token needed)",
        "No (email address only)",
        "No (phone number only)",
        "Yes (active session required)",
      ],
      [
        "Delivery guarantee",
        "Best-effort (provider dependent)",
        "Best-effort (spam filters may block)",
        "High (carrier-level delivery reports)",
        "Guaranteed if connected, lost if offline",
      ],
      [
        "User reach when offline",
        "Yes (queued by OS)",
        "Yes (queued in inbox)",
        "Yes (queued by carrier)",
        "No (requires active connection)",
      ],
      [
        "Opt-out mechanism",
        "OS-level toggle per app",
        "Unsubscribe link (CAN-SPAM required)",
        "Reply STOP (carrier-enforced)",
        "In-app preference toggle",
      ],
    ],
  },
  followUps: [
    "How would you design a notification system that supports scheduled notifications (send at user's local 9 AM) across multiple timezones?",
    "How would you implement A/B testing for notification content (subject lines, body text, send times) and measure engagement lift?",
    "How would you handle notification delivery for a user who switches devices (new phone, different device token) without losing pending notifications?",
    "How would you design a notification analytics dashboard that shows real-time delivery funnel metrics (sent -> delivered -> opened -> clicked) per notification campaign?",
    "What strategies would you use to maintain email deliverability at scale (managing sender reputation, IP warming, bounce handling, spam score optimization)?",
    "How would you extend the notification system to support rich interactive notifications (action buttons, inline replies, carousels) across different platforms?",
  ],
  resources: [
    {
      label: "Designing a Notification System - System Design Interview",
      kind: "book",
      note: "Alex Xu's System Design Interview Vol. 1, Chapter 10 covers notification system design with focus on scalability and reliability patterns",
    },
    {
      label: "Firebase Cloud Messaging Documentation",
      kind: "docs",
      note: "Official FCM docs covering message types, topic messaging, device group messaging, and delivery analytics",
    },
    {
      label: "Building Reliable Notification Systems at Scale",
      kind: "article",
      note: "Engineering blog posts from companies like Airbnb, LinkedIn, and Uber describing real-world notification infrastructure challenges and solutions",
    },
    {
      label: "Amazon SNS and SQS Documentation",
      kind: "docs",
      note: "AWS documentation for Simple Notification Service (fan-out pub/sub) and Simple Queue Service (reliable message queuing) used as building blocks for notification systems",
    },
    {
      label: "Designing Data-Intensive Applications",
      kind: "book",
      note: "Martin Kleppmann's book covers message queues, exactly-once delivery, idempotency, and distributed system reliability patterns foundational to notification systems",
    },
  ],
};
