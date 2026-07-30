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
};
