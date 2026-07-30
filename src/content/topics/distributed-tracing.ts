import type { TopicContent } from "../types";

export const distributedTracing: TopicContent = {
  quickSummary: [
    "Distributed tracing tracks a request as it flows through multiple services, producing a trace composed of individual spans that capture timing, metadata, and parent-child relationships.",
    "Context propagation passes trace IDs across service boundaries via HTTP headers (like W3C Traceparent) so that spans from different services can be stitched into a single trace.",
    "OpenTelemetry is the vendor-neutral standard for instrumentation, providing APIs and SDKs for traces, metrics, and logs across all major languages.",
    "Backends like Jaeger and Tempo store and visualize traces, enabling engineers to pinpoint latency bottlenecks and failure points in distributed architectures.",
  ],
  detailed: [
    `## Core Concepts: Traces, Spans, and Context

A **trace** represents the entire journey of a single request through a distributed system. It is composed of **spans**, each representing a unit of work (an HTTP call, a database query, a queue publish). Every span records:

- **Trace ID**: shared across all spans in the trace.
- **Span ID**: unique identifier for this span.
- **Parent Span ID**: links child spans to their parent, forming a tree.
- **Start time and duration**.
- **Attributes**: key-value metadata (HTTP method, status code, DB statement).
- **Events**: timestamped annotations within a span (e.g., "cache miss").
- **Status**: OK, ERROR, or UNSET.

**Context propagation** is the mechanism that carries trace and span IDs across process boundaries. The W3C \`traceparent\` header (\`00-<traceId>-<spanId>-<flags>\`) is the standard format. Without propagation, spans from different services remain orphaned.`,

    `## OpenTelemetry Architecture

OpenTelemetry (OTel) provides three pillars of observability instrumentation:

1. **API**: defines the interfaces for creating spans, recording metrics, and emitting logs. Application code depends only on the API.
2. **SDK**: implements the API with configurable exporters, samplers, and processors.
3. **Collector**: a standalone binary that receives telemetry via OTLP, processes it (batching, filtering, enrichment), and exports to one or more backends.

A typical deployment:
\`\`\`
App (OTel SDK) --> OTel Collector --> Jaeger / Tempo / Datadog
\`\`\`

**Auto-instrumentation** libraries wrap common frameworks (Express, Spring, gRPC) to create spans without manual code changes. Manual instrumentation adds custom spans for business-critical operations.

**Sampling** controls cost: head-based sampling decides at trace start (e.g., 10% of requests), while tail-based sampling in the Collector keeps traces that exhibit errors or high latency.`,

    `## Jaeger and Other Backends

**Jaeger** (originally from Uber) is an open-source tracing backend that provides:

- **Storage**: supports Elasticsearch, Cassandra, and Kafka as span stores.
- **Query service**: REST/gRPC API for retrieving traces by ID, service, operation, or tags.
- **UI**: waterfall view of spans, service dependency graph, and comparison of two traces.

**Grafana Tempo** is an alternative that stores traces in object storage (S3/GCS) with no indexing, relying on trace ID lookups and integration with Loki/Prometheus for discovery. It is cheaper at scale but lacks Jaeger's tag-based search.

**Zipkin** is another popular option with a simpler architecture, well-suited for smaller deployments.`,

    `## Practical Patterns and Pitfalls

- **Instrument at boundaries**: every network call (HTTP, gRPC, message queue) should produce a span. Internal method calls rarely need spans unless they represent significant latency.
- **Propagate through async**: message queues and event buses must carry trace context in message headers so consumers continue the trace.
- **Use baggage sparingly**: OTel baggage propagates arbitrary key-value pairs across all services, but it adds overhead to every request and can leak data.
- **Watch cardinality**: span attributes with unbounded values (user IDs as tag values) can overwhelm storage backends. Use them as span attributes, not as indexed tags in Jaeger.
- **Correlate with logs**: embed \`traceId\` and \`spanId\` in log entries to jump from a log line to its trace and vice versa.`,

    `## Sampling Strategies

| Strategy | When Decision Is Made | Pros | Cons |
|----------|----------------------|------|------|
| Head-based | At trace start | Simple, predictable cost | May drop interesting traces |
| Tail-based | After trace completes | Keeps errors and slow traces | Requires buffering full traces in Collector |
| Rate-limiting | Per-service per-second | Prevents burst overload | May miss rare but important traces |
| Priority | Per-request flag | Guarantees capture of critical paths | Requires caller cooperation |

In practice, most teams combine head-based sampling (e.g., 5%) with tail-based rules that retain all error traces and traces exceeding a latency threshold.`,
  ],
  interviewQA: [
    {
      q: "How does distributed tracing differ from logging, and when would you use each?",
      a: "Logging captures discrete events within a single service, while distributed tracing captures the causal chain of operations across multiple services for a single request. Use logging for detailed diagnostic information within a service and tracing to understand request flow, identify latency bottlenecks, and pinpoint which service in a chain caused a failure. They complement each other: embedding traceId in log entries lets you correlate both views.",
    },
    {
      q: "Explain context propagation and why it is essential for distributed tracing.",
      a: "Context propagation is the mechanism by which trace metadata (trace ID, span ID, sampling flags) is transmitted across service boundaries, typically via HTTP headers like W3C traceparent. Without it, spans generated by different services cannot be linked into a single trace. The requesting service injects context into outgoing requests, and the receiving service extracts it to create child spans. This must work across all transport mechanisms: HTTP, gRPC, and message queues.",
    },
    {
      q: "What are the trade-offs between head-based and tail-based sampling?",
      a: "Head-based sampling decides whether to record a trace at its start, giving predictable throughput and simple implementation, but it randomly drops traces that might contain errors or unusual latency. Tail-based sampling buffers complete traces in the Collector and applies rules after the fact (keep all errors, keep traces over 2s), capturing the most interesting data but requiring more memory and a more complex Collector deployment. Most production systems combine both: a low head-based rate plus tail-based rules for anomalies.",
    },
    {
      q: "How would you introduce distributed tracing into an existing microservices system?",
      a: "Start with auto-instrumentation: add OpenTelemetry SDK with auto-instrumentation libraries for your frameworks (Express, Spring, gRPC). This captures spans at HTTP and database boundaries with zero code changes. Deploy an OTel Collector to receive, batch, and export spans to a backend like Jaeger. Then incrementally add manual spans for business-critical operations. Propagate context through message queues by injecting trace headers into message metadata. Finally, embed traceId in all log entries to enable log-trace correlation.",
    },
  ],
  mcqs: [
    {
      q: "What does the W3C traceparent header contain?",
      options: [
        "Service name and operation type",
        "Version, trace ID, span ID, and trace flags",
        "Timestamp and log level",
        "Authentication token and user ID",
      ],
      answerIndex: 1,
      explanation:
        "The traceparent header follows the format `00-<traceId>-<spanId>-<flags>`, carrying the version, a 128-bit trace ID, a 64-bit parent span ID, and sampling flags for context propagation.",
    },
    {
      q: "What is the primary advantage of tail-based sampling over head-based sampling?",
      options: [
        "Lower memory usage in the Collector",
        "Simpler deployment architecture",
        "Ability to retain traces based on their outcome (errors, high latency)",
        "Faster span export to backends",
      ],
      answerIndex: 2,
      explanation:
        "Tail-based sampling makes the keep/drop decision after the trace completes, so it can retain traces that contain errors or exceed latency thresholds, which head-based sampling would randomly drop.",
    },
    {
      q: "Which OpenTelemetry component sits between the application SDK and the tracing backend?",
      options: ["API", "SDK", "Collector", "Exporter"],
      answerIndex: 2,
      explanation:
        "The OTel Collector is a standalone process that receives telemetry from application SDKs via OTLP, processes it (batching, filtering, sampling), and exports to backends like Jaeger or Tempo.",
    },
    {
      q: "Why is propagating trace context through message queues important?",
      options: [
        "To encrypt messages in transit",
        "To link asynchronous consumer spans to the original trace",
        "To order messages by timestamp",
        "To balance load across consumers",
      ],
      answerIndex: 1,
      explanation:
        "Without trace context in message headers, spans created by queue consumers are orphaned and cannot be connected to the trace that produced the message, breaking end-to-end visibility.",
    },
  ],
  flashcards: [
    {
      front: "What is a span in distributed tracing?",
      back: "A span represents a single unit of work within a trace, recording its name, start time, duration, parent span ID, attributes, and status. Spans form a tree that represents the full request flow.",
    },
    {
      front: "What is the W3C traceparent header format?",
      back: "`00-<traceId>-<spanId>-<flags>` where traceId is 128 bits, spanId is 64 bits, and flags indicate sampling decisions.",
    },
    {
      front: "What are the three pillars of OpenTelemetry?",
      back: "Traces (distributed request tracking), Metrics (numerical measurements over time), and Logs (timestamped event records). OTel provides unified APIs and SDKs for all three.",
    },
    {
      front: "What is auto-instrumentation in OpenTelemetry?",
      back: "Libraries that automatically wrap common frameworks (HTTP servers, DB clients, gRPC) to create spans without manual code changes. They hook into framework internals at startup.",
    },
    {
      front: "How does Grafana Tempo differ from Jaeger?",
      back: "Tempo stores traces in object storage without indexing, relying on trace ID lookups and integration with other Grafana tools for discovery. It is cheaper at scale but lacks tag-based search.",
    },
    {
      front: "What is OTel baggage?",
      back: "A mechanism to propagate arbitrary key-value pairs across all services in a trace via request headers. Useful for cross-cutting concerns but adds overhead to every request.",
    },
    {
      front: "What is head-based vs tail-based sampling?",
      back: "Head-based decides at trace start (simple, but drops interesting traces randomly). Tail-based decides after completion (captures anomalies, but requires buffering full traces in the Collector).",
    },
  ],
  glossary: [
    {
      term: "Trace",
      definition:
        "The complete record of a request's journey through a distributed system, composed of a tree of spans sharing a common trace ID.",
    },
    {
      term: "Span",
      definition:
        "A named, timed unit of work within a trace, recording operation details, parent-child relationships, attributes, and status.",
    },
    {
      term: "Context Propagation",
      definition:
        "The mechanism for transmitting trace metadata (trace ID, span ID, flags) across service boundaries via headers or message metadata.",
    },
    {
      term: "OpenTelemetry (OTel)",
      definition:
        "A vendor-neutral open-source project providing APIs, SDKs, and a Collector for generating, collecting, and exporting telemetry data.",
    },
    {
      term: "OTLP",
      definition:
        "OpenTelemetry Protocol — the native wire protocol for transmitting traces, metrics, and logs between OTel components, supporting gRPC and HTTP/protobuf.",
    },
    {
      term: "Jaeger",
      definition:
        "An open-source distributed tracing backend originally built at Uber, providing span storage, querying, and a waterfall visualization UI.",
    },
    {
      term: "Tail-based Sampling",
      definition:
        "A sampling strategy where the keep/drop decision is made after a trace completes, allowing retention of traces with errors or high latency.",
    },
  ],
};
