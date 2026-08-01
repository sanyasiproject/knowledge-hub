import type { TopicContent } from "../types";

export const logging: TopicContent = {
  quickSummary: [
    "Structured logging captures events as key-value pairs rather than free-form text, making logs machine-parseable and queryable at scale.",
    "Log levels (DEBUG, INFO, WARN, ERROR, FATAL) let teams control verbosity per environment and filter noise during incident response.",
    "The ELK stack (Elasticsearch, Logstash, Kibana) is a widely adopted pipeline for ingesting, indexing, and visualizing logs from distributed systems.",
    "Log aggregation centralizes output from many services into a single searchable store, enabling correlation across request boundaries.",
  ],
  detailed: [
    `## Why Structured Logging Matters

Free-form log lines like \`"User 42 placed order #99"\` are easy for humans to read but hard for machines to query. Structured logging emits each event as a JSON object with explicit fields (\`userId\`, \`orderId\`, \`action\`). This enables:

- **Filtering**: find all logs where \`statusCode >= 500\` without fragile regex.
- **Aggregation**: count errors per service per minute.
- **Correlation**: join logs sharing a \`traceId\` across microservices.

Libraries like **Winston** (Node.js), **Logback** (Java), and **Serilog** (.NET) support structured output natively. The key discipline is treating log schema like an API contract: add fields intentionally and avoid uncontrolled string interpolation.`,

    `## Log Levels and When to Use Them

| Level | Purpose | Example |
|-------|---------|---------|
| DEBUG | Detailed diagnostic info, disabled in prod | Variable values inside a loop |
| INFO  | Normal operational events | "Order created", "Cache refreshed" |
| WARN  | Unexpected but recoverable situations | Retry succeeded on 2nd attempt |
| ERROR | Failures requiring attention | Unhandled exception, downstream timeout |
| FATAL | Process cannot continue | Out-of-memory, missing config at startup |

A common mistake is logging too much at INFO level, which drowns signal in noise. A good rule: if the message does not help an on-call engineer decide what to do, it belongs at DEBUG.`,

    `## The ELK Stack Pipeline

1. **Beats / Fluentd** — lightweight agents on each host ship log files or stdout to the pipeline.
2. **Logstash** — receives raw events, parses them (grok, JSON), enriches with metadata (host, environment), and routes to storage.
3. **Elasticsearch** — stores documents in inverted indices, enabling full-text and structured queries at petabyte scale.
4. **Kibana** — provides dashboards, saved searches, and alerting on top of Elasticsearch.

Alternatives include **Grafana Loki** (stores labels, not full text — cheaper for high-volume) and **Datadog Logs** (SaaS with built-in APM correlation).`,

    `## Log Aggregation Best Practices

- **Centralize early**: even a two-service system benefits from a single pane of glass.
- **Enrich at the edge**: attach service name, version, and environment at the shipper, not in application code.
- **Set retention policies**: hot (7 days in Elasticsearch), warm (30 days compressed), cold (S3/GCS archive). Align with compliance needs.
- **Redact sensitive data**: PII, tokens, and credentials must never appear in logs. Use allowlist-based field scrubbing.
- **Correlate with traces**: embed \`traceId\` and \`spanId\` in every log line so you can jump from a log entry to its distributed trace.`,

    `## Operational Pitfalls

- **Cardinality explosion**: logging a unique request ID as a Kibana field is fine; logging full request bodies as indexed fields is not — it bloats storage and slows queries.
- **Synchronous logging**: writing to disk or network on the hot path adds latency. Use async appenders with bounded buffers.
- **Missing context**: a log saying "timeout" without the target URL, duration, or retry count is almost useless during an incident.
- **Inconsistent schemas**: if service A logs \`user_id\` and service B logs \`userId\`, cross-service queries break. Establish an org-wide naming convention.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between structured and unstructured logging, and why does it matter?",
      a: "Unstructured logging outputs free-form text strings, while structured logging emits events as key-value pairs (typically JSON). Structured logs are machine-parseable, enabling precise filtering, aggregation, and correlation across services without brittle regex. This is critical in distributed systems where you need to query millions of log lines to diagnose an issue quickly.",
    },
    {
      q: "How would you design a logging strategy for a microservices architecture?",
      a: "First, standardize on a structured format (JSON) with a shared schema across all services. Embed traceId and spanId in every log entry for cross-service correlation. Use async appenders to avoid blocking the hot path. Ship logs via lightweight agents (Filebeat, Fluent Bit) to a central store like Elasticsearch or Loki. Define log levels consistently, keeping production at INFO by default with the ability to dynamically raise to DEBUG for specific services during incidents. Set retention tiers and redact PII at the shipper level.",
    },
    {
      q: "What are the trade-offs between ELK and Grafana Loki for log management?",
      a: "ELK indexes the full text of every log line, enabling powerful ad-hoc queries but at high storage and compute cost. Loki indexes only labels (service, level, pod) and stores log lines as compressed chunks, making it significantly cheaper for high-volume environments. The trade-off is query flexibility: Loki requires you to filter by labels first, then grep within those streams, which can be slower for exploratory queries. ELK is better when teams need arbitrary full-text search; Loki is better when cost efficiency and Grafana integration are priorities.",
    },
    {
      q: "How do you prevent sensitive data from leaking into logs?",
      a: "Use an allowlist approach: explicitly define which fields are safe to log rather than trying to block known sensitive patterns. Implement a logging middleware or wrapper that scrubs or masks fields like passwords, tokens, SSNs, and credit card numbers before they reach the appender. At the pipeline level, use Logstash filters or Fluent Bit processors to redact patterns that slip through. Regularly audit log output in staging environments and set up alerts for common PII patterns appearing in log indices.",
    },
  ],
  mcqs: [
    {
      q: "Which component in the ELK stack is responsible for parsing and enriching raw log events?",
      options: ["Elasticsearch", "Logstash", "Kibana", "Filebeat"],
      answerIndex: 1,
      explanation:
        "Logstash receives raw log events, applies parsing (grok, JSON), enriches them with metadata, and routes them to Elasticsearch for storage and indexing.",
    },
    {
      q: "What is the main advantage of Grafana Loki over Elasticsearch for log storage?",
      options: [
        "Full-text indexing of all log content",
        "Lower cost by indexing only labels, not full log text",
        "Built-in APM and tracing support",
        "Native support for SQL queries",
      ],
      answerIndex: 1,
      explanation:
        "Loki indexes only metadata labels and stores log lines as compressed chunks, dramatically reducing storage and compute costs compared to Elasticsearch's full-text indexing approach.",
    },
    {
      q: "Why should logging on the hot path use asynchronous appenders?",
      options: [
        "To ensure logs are never lost",
        "To enable structured formatting",
        "To avoid adding latency to request processing",
        "To automatically redact sensitive data",
      ],
      answerIndex: 2,
      explanation:
        "Synchronous logging blocks the application thread while writing to disk or network. Async appenders buffer log events and flush them in a background thread, preventing logging from degrading request latency.",
    },
    {
      q: "Which log level is most appropriate for a situation where a retry succeeded on the second attempt?",
      options: ["DEBUG", "INFO", "WARN", "ERROR"],
      answerIndex: 2,
      explanation:
        "WARN is appropriate because the initial failure was unexpected but the system recovered. It signals a potential issue worth monitoring without indicating a current failure requiring immediate action.",
    },
  ],
  flashcards: [
    {
      front: "What is structured logging?",
      back: "Emitting log events as key-value pairs (typically JSON) rather than free-form text, enabling machine parsing, filtering, and aggregation at scale.",
    },
    {
      front: "What are the four components of the ELK stack?",
      back: "Elasticsearch (search and storage), Logstash (parsing and enrichment), Kibana (visualization and dashboards), plus Beats/agents for shipping logs from hosts.",
    },
    {
      front: "What is log cardinality and why does it matter?",
      back: "Cardinality refers to the number of unique values in a log field. High-cardinality fields (like full request bodies) bloat indices and degrade query performance. Use high-cardinality values as unindexed message content, not as indexed fields.",
    },
    {
      front: "How does Grafana Loki differ from Elasticsearch?",
      back: "Loki indexes only labels (metadata) and stores log content as compressed chunks, trading query flexibility for significantly lower storage costs. Elasticsearch indexes full text, enabling richer ad-hoc queries.",
    },
    {
      front: "Why embed traceId in log entries?",
      back: "It enables correlation of logs across multiple services handling the same request, allowing engineers to reconstruct the full request flow from distributed log data.",
    },
    {
      front: "What is the allowlist approach to PII redaction in logs?",
      back: "Explicitly defining which fields are safe to log rather than trying to detect and block sensitive patterns. This is more secure because it fails closed: unknown fields are excluded by default.",
    },
    {
      front: "What is the difference between WARN and ERROR log levels?",
      back: "WARN indicates unexpected but recoverable situations (e.g., retry succeeded). ERROR indicates failures requiring attention (e.g., unhandled exception, downstream timeout with no fallback).",
    },
  ],
  glossary: [
    {
      term: "Structured Logging",
      definition:
        "A logging approach where events are emitted as machine-parseable key-value pairs instead of free-form text strings.",
    },
    {
      term: "Log Aggregation",
      definition:
        "The practice of collecting logs from multiple sources into a centralized, searchable store for unified querying and analysis.",
    },
    {
      term: "ELK Stack",
      definition:
        "A popular open-source log management pipeline comprising Elasticsearch (search), Logstash (processing), and Kibana (visualization).",
    },
    {
      term: "Log Level",
      definition:
        "A severity classification (DEBUG, INFO, WARN, ERROR, FATAL) that controls which log messages are emitted and helps filter noise during operations.",
    },
    {
      term: "Cardinality",
      definition:
        "The number of unique values a log field can take. High-cardinality fields increase index size and query cost in log storage systems.",
    },
    {
      term: "Async Appender",
      definition:
        "A logging component that buffers events in memory and writes them in a background thread, preventing log I/O from blocking request processing.",
    },
    {
      term: "Grafana Loki",
      definition:
        "A log aggregation system that indexes only metadata labels rather than full log text, optimized for cost-efficient storage with Grafana integration.",
    },
  ],
  deepDive: [
    `**Structured logging** is not just a best practice — it is a *fundamental architectural decision* that determines how effectively your team can **debug**, **monitor**, and **audit** production systems. When you emit logs as \`JSON\` objects with explicit fields like \`timestamp\`, \`level\`, \`service\`, \`traceId\`, and \`message\`, you transform raw text into *queryable data*. This enables **log-based metrics** (e.g., counting \`level: "error"\` events per minute), **automated alerting** (triggering PagerDuty when error rate exceeds a threshold), and **compliance auditing** (proving that a specific action occurred at a specific time). The shift from \`console.log("something happened")\` to \`logger.info({ event: "order.created", orderId, userId })\` is the difference between *guessing* and *knowing* what your system is doing.`,

    `The **log pipeline architecture** deserves as much design attention as your application architecture. A production-grade pipeline typically follows the pattern: *application* → **shipper** → **buffer** → **processor** → **storage** → **visualization**. The **shipper** (e.g., \`Filebeat\`, \`Fluent Bit\`) runs as a *sidecar* or *DaemonSet* on each node, tailing log files or capturing \`stdout\`. The **buffer** (e.g., \`Kafka\`, \`Redis Streams\`) decouples producers from consumers, absorbing traffic spikes without backpressure on applications. The **processor** (\`Logstash\`, \`Vector\`, \`Fluentd\`) parses, enriches, and routes events. Finally, **storage** (\`Elasticsearch\`, \`Loki\`, \`ClickHouse\`) indexes and retains data according to *retention policies*. Each component must be **horizontally scalable** and **fault-tolerant** — a logging pipeline that loses data during an incident is worse than useless, because it creates *false confidence*.`,

    `**Observability correlation** ties logging to the broader telemetry stack of *metrics* and *traces*. By embedding \`traceId\` and \`spanId\` in every log entry — typically injected via **middleware** or an \`AsyncLocalStorage\` context in Node.js, or \`MDC\` (Mapped Diagnostic Context) in Java — you create a *unified view* of each request's journey. When an alert fires on a **metric** (e.g., \`p99 latency > 500ms\`), an engineer can pivot to the corresponding **traces** to identify the slow span, then drill into the **logs** for that span to find the root cause (e.g., \`"DNS resolution timeout for payments.internal"\`). This *three-pillar correlation* — **metrics → traces → logs** — is the foundation of modern **observability**. Tools like \`OpenTelemetry\` provide a *vendor-neutral SDK* that instruments all three signals with shared context, eliminating the need to manually propagate correlation IDs.`,
  ],
  code: [
    {
      language: "typescript",
      caption:
        "Node.js/Express structured logging middleware with request correlation using Winston and OpenTelemetry trace context",
      source: `import express, { Request, Response, NextFunction } from "express";
import winston from "winston";
import { randomUUID } from "crypto";
import { trace, context } from "@opentelemetry/api";

// Configure structured JSON logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "ISO" }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "order-service",
    version: process.env.APP_VERSION || "unknown",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/app.log",
      maxsize: 50 * 1024 * 1024, // 50MB rotation
      maxFiles: 5,
    }),
  ],
});

// Logging middleware — attaches correlation IDs and logs request lifecycle
function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  const startTime = process.hrtime.bigint();

  // Extract OpenTelemetry trace context if available
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan?.spanContext().traceId || "no-trace";
  const spanId = activeSpan?.spanContext().spanId || "no-span";

  // Attach correlation IDs to request for downstream use
  req.headers["x-request-id"] = requestId;

  // Log incoming request
  logger.info({
    event: "http.request.start",
    requestId,
    traceId,
    spanId,
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.get("user-agent"),
    ip: req.ip,
  });

  // Capture response details on finish
  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const logData = {
      event: "http.request.end",
      requestId,
      traceId,
      spanId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      contentLength: res.get("content-length"),
    };

    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
}

const app = express();
app.use(loggingMiddleware);

app.get("/api/orders/:id", (req, res) => {
  logger.info({
    event: "order.fetch",
    orderId: req.params.id,
    requestId: req.headers["x-request-id"],
  });
  res.json({ id: req.params.id, status: "shipped" });
});

app.listen(3000, () => {
  logger.info({ event: "server.start", port: 3000 });
});`,
    },
    {
      language: "cpp",
      caption:
        "C++ structured logging with spdlog featuring custom JSON formatting and log rotation",
      source: `#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <string>
#include <memory>

using json = nlohmann::json;

// Structured log entry builder
class LogEntry {
public:
    LogEntry(const std::string& event) {
        data_["timestamp"] = getCurrentTimestamp();
        data_["event"] = event;
        data_["service"] = "payment-gateway";
        data_["version"] = "2.4.1";
    }

    LogEntry& field(const std::string& key, const std::string& value) {
        data_[key] = value;
        return *this;
    }

    LogEntry& field(const std::string& key, int value) {
        data_[key] = value;
        return *this;
    }

    LogEntry& field(const std::string& key, double value) {
        data_[key] = value;
        return *this;
    }

    std::string build() const {
        return data_.dump();
    }

private:
    json data_;

    static std::string getCurrentTimestamp() {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
            now.time_since_epoch()) % 1000;
        char buf[64];
        std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", std::gmtime(&time_t));
        return std::string(buf) + "." + std::to_string(ms.count()) + "Z";
    }
};

// Initialize logger with console + rotating file sinks
std::shared_ptr<spdlog::logger> initLogger() {
    auto console_sink = std::make_shared<spdlog::sinks::stdout_color_sink_mt>();
    console_sink->set_level(spdlog::level::info);

    auto file_sink = std::make_shared<spdlog::sinks::rotating_file_sink_mt>(
        "logs/payment-gateway.log",
        50 * 1024 * 1024,  // 50 MB max file size
        5                   // Keep 5 rotated files
    );
    file_sink->set_level(spdlog::level::debug);

    auto logger = std::make_shared<spdlog::logger>(
        "structured",
        spdlog::sinks_init_list{console_sink, file_sink}
    );
    logger->set_level(spdlog::level::debug);
    logger->set_pattern("%v");  // Raw message — we handle formatting
    return logger;
}

// Usage example
int main() {
    auto logger = initLogger();

    // Log a payment processing event
    logger->info(
        LogEntry("payment.process.start")
            .field("transactionId", "txn_a1b2c3d4")
            .field("amount", 149.99)
            .field("currency", "USD")
            .field("merchantId", "merchant_xyz")
            .field("traceId", "abc123def456")
            .build()
    );

    // Simulate processing...
    auto start = std::chrono::steady_clock::now();
    // ... payment logic here ...
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - start).count();

    logger->info(
        LogEntry("payment.process.complete")
            .field("transactionId", "txn_a1b2c3d4")
            .field("status", "approved")
            .field("durationMs", static_cast<int>(elapsed))
            .field("traceId", "abc123def456")
            .build()
    );

    // Log an error scenario
    logger->error(
        LogEntry("payment.process.failed")
            .field("transactionId", "txn_e5f6g7h8")
            .field("error", "gateway_timeout")
            .field("retryCount", 3)
            .field("targetHost", "payments.provider.com")
            .field("traceId", "xyz789abc012")
            .build()
    );

    return 0;
}`,
    },
    {
      language: "yaml",
      caption:
        "Fluent Bit configuration for shipping structured logs to Elasticsearch with parsing and enrichment",
      source: `# fluent-bit.conf — production log shipping pipeline
[SERVICE]
    Flush         5
    Daemon        Off
    Log_Level     info
    Parsers_File  parsers.conf
    HTTP_Server   On
    HTTP_Listen   0.0.0.0
    HTTP_Port     2020       # Health check endpoint

# Tail application JSON logs
[INPUT]
    Name          tail
    Path          /var/log/containers/*.log
    Parser        docker
    Tag           kube.*
    Mem_Buf_Limit 10MB
    Skip_Long_Lines On
    Refresh_Interval 5

# Parse nested JSON from container log messages
[FILTER]
    Name          parser
    Match         kube.*
    Key_Name      log
    Parser        json_parser
    Reserve_Data  On

# Add Kubernetes metadata (pod, namespace, labels)
[FILTER]
    Name          kubernetes
    Match         kube.*
    Kube_URL      https://kubernetes.default.svc:443
    Kube_CA_File  /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File /var/run/secrets/kubernetes.io/serviceaccount/token
    Merge_Log     On
    K8S-Logging.Parser On

# Redact sensitive fields before shipping
[FILTER]
    Name          modify
    Match         *
    Remove        password
    Remove        authorization
    Remove        cookie
    Remove        x-api-key

# Output to Elasticsearch
[OUTPUT]
    Name          es
    Match         *
    Host          elasticsearch.logging.svc.cluster.local
    Port          9200
    Index         app-logs
    Type          _doc
    Logstash_Format On
    Logstash_Prefix app-logs
    Retry_Limit   5
    tls           On
    tls.verify    On
    Suppress_Type_Name On`,
    },
  ],
  diagrams: [
    {
      title: "ELK Log Pipeline Architecture",
      kind: "architecture",
      caption: "End-to-end flow of log data from application containers through the ELK pipeline to dashboards and alerts.",
      mermaid: `graph LR
    subgraph Sources["Application Sources"]
        A1["Service A - stdout JSON"]
        A2["Service B - stdout JSON"]
        A3["Service C - stdout JSON"]
    end
    subgraph Shippers["Log Shippers"]
        F1["Fluent Bit DaemonSet"]
        F2["Filebeat Sidecar"]
    end
    K["Kafka - logs topic"]
    subgraph Processing["Log Processing"]
        L1["Logstash Node 1"]
        L2["Logstash Node 2"]
    end
    subgraph Storage["Elasticsearch Cluster"]
        ES1["Hot Nodes - 7-day SSD"]
        ES2["Warm Nodes - 30-day HDD"]
        ES3["Cold Archive S3"]
    end
    KB["Kibana Dashboards"]
    AL["ElastAlert Alerting"]
    A1 --> F1
    A2 --> F1
    A3 --> F2
    F1 --> K
    F2 --> K
    K --> L1
    K --> L2
    L1 --> ES1
    L2 --> ES1
    ES1 -->|ILM rollover| ES2
    ES2 -->|ILM rollover| ES3
    ES1 --> KB
    ES1 --> AL`,
    },
    {
      title: "Log Level Selection Flow",
      kind: "flow",
      caption: "Decision tree for choosing the appropriate log level for any event in production systems.",
      mermaid: `flowchart TD
    Start["Event Occurs"] --> Q1{"Can the process\ncontinue?"}
    Q1 -->|No| FATAL["FATAL - Process must exit"]
    Q1 -->|Yes| Q2{"Did an error occur?"}
    Q2 -->|Yes| Q3{"Was it recovered?"}
    Q3 -->|No| ERROR["ERROR - Requires attention"]
    Q3 -->|Yes| WARN["WARN - Recovered but notable"]
    Q2 -->|No| Q4{"Normal operational event?"}
    Q4 -->|Yes| INFO["INFO - Business events"]
    Q4 -->|No| Q5{"Useful for debugging?"}
    Q5 -->|Yes| DEBUG["DEBUG - Diagnostic detail"]
    Q5 -->|No| SKIP["Do not log - avoid noise"]`,
    },
    {
      title: "Log Event Lifecycle States",
      kind: "state",
      caption: "States a log event passes through from emission to archival, including error and drop paths.",
      mermaid: `stateDiagram-v2
    [*] --> Emitted: Application logs event
    Emitted --> Buffered: Async appender queues
    Buffered --> Shipped: Shipper reads from buffer
    Buffered --> Dropped: Buffer overflow
    Shipped --> Queued: Arrives in Kafka
    Shipped --> Failed: Network error
    Failed --> Shipped: Retry with backoff
    Queued --> Parsed: Logstash processes
    Parsed --> Enriched: Add metadata and redact PII
    Enriched --> HotStorage: Index in Elasticsearch
    HotStorage --> WarmStorage: ILM policy 7 days
    WarmStorage --> ColdStorage: ILM policy 30 days
    ColdStorage --> Archived: Move to S3
    Archived --> Deleted: Retention expired
    Deleted --> [*]
    Dropped --> [*]`,
    },
    {
      title: "Structured Logging Fields Mindmap",
      kind: "mindmap",
      caption: "Essential and optional fields for structured JSON log events in a distributed system.",
      mermaid: `mindmap
  root((Structured Log Event))
    Required Fields
      timestamp ISO 8601
      level ERROR WARN INFO DEBUG
      message human readable
      service name
    Correlation
      requestId per request UUID
      traceId distributed trace
      spanId current span
      userId or sessionId
    Context
      host or pod name
      region or zone
      version or commit SHA
    Error Fields
      error.type exception class
      error.message
      stack trace
    Performance
      durationMs
      statusCode
      httpMethod and path`,
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "ELK Stack",
      "Grafana Loki",
      "Datadog Logs",
      "Fluentd / Fluent Bit",
    ],
    rows: [
      [
        "Architecture",
        "Full-text indexing with inverted indices",
        "Label-based indexing, compressed log chunks",
        "SaaS with proprietary indexing",
        "Log shipper and processor (not storage)",
      ],
      [
        "Query Language",
        "KQL (Kibana Query Language) and Lucene",
        "LogQL (Prometheus-inspired)",
        "Proprietary query syntax with natural language",
        "N/A — routes to downstream storage",
      ],
      [
        "Storage Cost",
        "High — indexes every word in every log line",
        "Low — indexes only labels, stores chunks",
        "Usage-based SaaS pricing, can be expensive at scale",
        "N/A — depends on destination",
      ],
      [
        "Query Flexibility",
        "Excellent — arbitrary full-text and structured queries",
        "Good for label filtering, limited for ad-hoc text search",
        "Excellent — full-text plus APM correlation",
        "N/A — processing only",
      ],
      [
        "Operational Overhead",
        "High — must manage Elasticsearch cluster, tune JVM, handle sharding",
        "Medium — simpler architecture, integrates with existing Prometheus/Grafana",
        "Low — fully managed SaaS",
        "Low — lightweight agent, minimal resource usage",
      ],
      [
        "Best For",
        "Teams needing powerful ad-hoc search across large log volumes",
        "Cost-conscious teams already using Grafana and Prometheus",
        "Teams wanting unified logs, metrics, traces, and APM in one SaaS platform",
        "Log routing, parsing, and enrichment before sending to any backend",
      ],
      [
        "Scaling Model",
        "Horizontal — add data/master/ingest nodes",
        "Horizontal — stateless queriers, scalable ingesters",
        "Automatic — SaaS scales transparently",
        "Horizontal — deploy more shipper instances",
      ],
      [
        "APM Integration",
        "Via Elastic APM (separate setup)",
        "Via Tempo (Grafana tracing) — requires separate config",
        "Built-in — traces, logs, metrics unified natively",
        "Ships trace-correlated logs to any backend",
      ],
    ],
  },
  exercises: [
    "**Set up a local ELK stack** using `docker-compose` with Elasticsearch, Logstash, and Kibana. Write a Node.js application that emits *structured JSON logs* to stdout, configure Filebeat to ship them to Logstash, and build a Kibana dashboard showing **request rate**, **error rate**, and **p95 latency** over time.",
    "**Implement a logging middleware** for an Express.js API that automatically attaches `requestId`, `traceId`, `userId`, and `durationMs` to every log entry. Use `AsyncLocalStorage` to propagate context without passing logger instances through every function call. Verify that logs from *nested async operations* carry the correct correlation IDs.",
    "**Build a log-based alerting pipeline**: configure ElastAlert (or Grafana alerting with Loki) to trigger a *Slack notification* when the error rate for any single service exceeds **5 errors per minute**. Test by intentionally causing errors and verifying the alert fires within the expected window. Document the *false-positive tuning* process.",
    "**Perform a PII redaction audit** on an existing application's logs. Write a script that scans log output for patterns matching email addresses, credit card numbers, JWTs, and API keys. Implement a `Logstash filter` (or Fluent Bit Lua script) that **masks** detected patterns before indexing. Verify by querying Elasticsearch for any remaining PII patterns.",
    "**Compare Elasticsearch vs. Loki query performance**: ingest the same 1 million log events into both systems. Write equivalent queries (filter by service + time range, count errors by endpoint, search for a specific `traceId`) and measure *query latency* and *resource consumption*. Document the trade-offs you observe in a comparison table.",
  ],
  cheatSheet: [
    "**Log levels in order of severity**: `DEBUG` < `INFO` < `WARN` < `ERROR` < `FATAL` — set production default to `INFO` and enable `DEBUG` *per-service* during incidents.",
    "**Always include these fields** in structured logs: `timestamp`, `level`, `service`, `traceId`, `spanId`, `event`, `message` — use `logger.defaultMeta` in Winston or `MDC` in Logback to auto-attach them.",
    "**Use `async appenders`** to prevent logging from blocking the hot path — in Node.js, Winston writes async by default; in Java, use Logback's `AsyncAppender` with `queueSize: 512` and `discardingThreshold: 0`.",
    "**Retention tiers**: `Hot` (7 days, SSD, full indexing) → `Warm` (30 days, HDD, reduced replicas) → `Cold` (S3/GCS archive, query-on-demand) — configure via **ILM policies** in Elasticsearch.",
    "**Redact PII before indexing**: use an `allowlist` approach — explicitly define safe fields rather than trying to block known sensitive patterns. Apply redaction at the **shipper or processor level**, not in application code.",
    "**Query cheat sheet**: ELK uses `level:error AND service:payments AND @timestamp>[now-1h]`; Loki uses `{service=\"payments\", level=\"error\"} |= \"timeout\"` — always **filter by labels first** in Loki to avoid full scans.",
  ],
  revisionNotes: [
    "**Structured logging** emits events as `JSON` key-value pairs instead of free-form text. This enables *machine parsing*, **filtering** (e.g., `statusCode >= 500`), **aggregation** (errors per service per minute), and **cross-service correlation** via shared `traceId` fields.",
    "The **ELK pipeline** flows: *Application* → `Beats/Fluent Bit` (shipper) → `Kafka` (buffer) → `Logstash` (parse + enrich) → `Elasticsearch` (index + store) → `Kibana` (visualize + alert). Each component must be **horizontally scalable** and **fault-tolerant**.",
    "**Log levels** serve as a *severity filter*: `FATAL` = process must exit, `ERROR` = failure needing attention, `WARN` = recovered but notable, `INFO` = normal business events, `DEBUG` = diagnostic detail. The *golden rule*: if the message does not help an on-call engineer decide what to do, it belongs at `DEBUG`.",
    "**ELK vs. Loki**: Elasticsearch indexes *full text* (powerful queries, high cost); Loki indexes only *labels* (cheaper, but requires label-first filtering). **Datadog** offers *SaaS convenience* with built-in APM correlation. Choose based on your **query needs**, **budget**, and **operational capacity**.",
    "**Observability correlation** connects the three pillars: *metrics* (detect anomalies) → *traces* (identify slow spans) → *logs* (find root cause). Embed `traceId` and `spanId` in every log entry using **OpenTelemetry** or framework-specific MDC to enable seamless cross-pillar navigation.",
  ],
};
