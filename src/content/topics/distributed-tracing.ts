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
  deepDive: [
    `**Trace-Based Testing** is an emerging practice that uses distributed traces as *test assertions* in integration and end-to-end test suites. Instead of merely checking HTTP status codes, trace-based tests verify the **internal behavior** of a request: Did the \`order-service\` create a span for the database write? Did the \`payment-gateway\` span complete in under 200ms? Tools like **Tracetest** and **Malabi** let you write assertions against span attributes, timing, and tree structure. For example, you can assert that a checkout trace contains *exactly* three service hops, that the \`db.statement\` attribute on the Postgres span matches a parameterized query, and that no span has \`status = ERROR\`. This catches **regressions in service interactions** that unit tests miss entirely. Trace-based testing also validates that *context propagation* is working correctly across all boundaries — if a span is orphaned, the test fails, surfacing broken instrumentation before it reaches production.`,

    `**Service mesh integration** with distributed tracing unlocks *infrastructure-level observability* without modifying application code. Meshes like **Istio**, **Linkerd**, and **Consul Connect** inject sidecar proxies (e.g., \`Envoy\`) that automatically generate spans for every network hop between pods. The sidecar captures \`upstream_cluster\`, \`response_flags\`, **mTLS handshake duration**, and \`retry_count\` as span attributes. However, the mesh can only propagate context if the application *forwards* incoming trace headers on outgoing requests — the sidecar does not inspect application payloads. A common pitfall is assuming the mesh handles everything: without header forwarding, each sidecar produces **disconnected root spans**. Best practice is to combine mesh-generated spans (capturing infrastructure concerns like *TLS negotiation*, *load balancer selection*, and *circuit breaker state*) with application-level spans (capturing **business logic** like order validation or inventory checks). The \`OpenTelemetry Collector\` can merge both sources, enriching application spans with \`k8s.pod.name\`, \`k8s.namespace\`, and \`container.id\` via the \`k8sattributes\` processor.`,

    `**Production debugging workflows** with distributed tracing follow a systematic pattern. When an alert fires for elevated **p99 latency** on the \`/api/checkout\` endpoint, the first step is to query the tracing backend for *slow traces* matching that operation (e.g., \`service=api-gateway operation=POST /api/checkout duration>2s\`). Examine the **waterfall view** to identify the longest span — often a downstream call to \`inventory-service\` or a database query. Check span attributes: \`db.statement\` reveals unoptimized queries, \`http.status_code\` shows upstream failures, and \`retry.count > 0\` indicates flaky dependencies. Use **trace comparison** (available in Jaeger and Grafana Tempo) to diff a slow trace against a fast one, highlighting which spans diverged. For intermittent failures, use *exemplar links* from Prometheus metrics to jump directly to a trace exhibiting the anomaly. Cross-reference with logs using the embedded \`traceId\` — run \`grep\` or a Loki query like \`{service="payment"} |= "abc123traceid"\` to see detailed error messages within the trace's time window. Finally, for **root cause in async workflows**, follow the trace through message queue spans: the \`messaging.destination\` and \`messaging.message_id\` attributes link the producer span to the consumer span, even across Kafka partitions or SQS queues.`,
  ],
  code: [
    {
      language: "typescript",
      caption: "OpenTelemetry tracing setup for a Node.js Express application",
      source: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

const traceExporter = new OTLPTraceExporter({
  url: "http://otel-collector:4317",
});

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "order-service",
    [ATTR_SERVICE_VERSION]: "1.4.0",
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  textMapPropagator: new W3CTraceContextPropagator(),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": {
        ignoreIncomingPaths: ["/health", "/ready"],
      },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-pg": { enhancedDatabaseReporting: true },
    }),
  ],
});

sdk.start();
console.log("OpenTelemetry tracing initialized");

process.on("SIGTERM", async () => {
  await sdk.shutdown();
  console.log("Tracing shut down gracefully");
});`,
    },
    {
      language: "typescript",
      caption: "Manual span creation and context propagation across an async boundary",
      source: `import { trace, context, SpanKind, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("order-service", "1.0.0");

async function processOrder(orderId: string): Promise<void> {
  // Create a parent span for the entire order processing workflow
  await tracer.startActiveSpan(
    "processOrder",
    { kind: SpanKind.INTERNAL, attributes: { "order.id": orderId } },
    async (parentSpan) => {
      try {
        // Validate inventory — creates a child span automatically
        await tracer.startActiveSpan("validateInventory", async (span) => {
          const available = await checkInventory(orderId);
          span.setAttribute("inventory.available", available);
          if (!available) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: "Out of stock" });
            throw new Error("Insufficient inventory");
          }
          span.end();
        });

        // Charge payment — propagate context to external HTTP call
        await tracer.startActiveSpan(
          "chargePayment",
          { kind: SpanKind.CLIENT },
          async (span) => {
            const headers: Record<string, string> = {};
            // Inject current context into outgoing HTTP headers
            const { W3CTraceContextPropagator } = await import("@opentelemetry/core");
            const propagator = new W3CTraceContextPropagator();
            propagator.inject(context.active(), headers, {
              set: (carrier, key, value) => { carrier[key] = value; },
            });

            const response = await fetch("https://payment.internal/charge", {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, amount: 99.99 }),
            });

            span.setAttribute("http.status_code", response.status);
            span.end();
          }
        );

        parentSpan.addEvent("order.completed", { "order.id": orderId });
        parentSpan.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        parentSpan.recordException(error as Error);
        parentSpan.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      } finally {
        parentSpan.end();
      }
    }
  );
}`,
    },
    {
      language: "cpp",
      caption: "C++ structured logging with trace context injection using OpenTelemetry C++ SDK",
      source: `#include <opentelemetry/trace/provider.h>
#include <opentelemetry/context/propagation/global_propagator.h>
#include <opentelemetry/trace/span.h>
#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>

namespace trace_api = opentelemetry::trace;
using json = nlohmann::json;

// Extract trace context and inject into structured log entries
void logWithTraceContext(const std::string& message, const std::string& level) {
    auto span = trace_api::Tracer::GetCurrentSpan();
    auto spanContext = span->GetContext();

    char traceIdHex[32];
    char spanIdHex[16];
    spanContext.trace_id().ToLowerBase16(traceIdHex);
    spanContext.span_id().ToLowerBase16(spanIdHex);

    json logEntry = {
        {"message", message},
        {"level", level},
        {"trace_id", std::string(traceIdHex, 32)},
        {"span_id", std::string(spanIdHex, 16)},
        {"trace_flags", static_cast<int>(spanContext.trace_flags().IsSet()
            ? opentelemetry::trace::TraceFlags::kIsSampled : 0)},
        {"service", "inventory-service"},
    };

    spdlog::info(logEntry.dump());
}

// Usage within a traced operation
void handleInventoryCheck(const std::string& productId) {
    auto provider = trace_api::Provider::GetTracerProvider();
    auto tracer = provider->GetTracer("inventory-service", "2.1.0");

    auto span = tracer->StartSpan("checkInventory",
        {{"product.id", productId}, {"db.system", "postgresql"}});
    auto scope = tracer->WithActiveSpan(span);

    logWithTraceContext("Starting inventory lookup for product " + productId, "info");

    // ... perform DB query ...

    span->SetAttribute("inventory.count", 42);
    span->SetStatus(trace_api::StatusCode::kOk);
    logWithTraceContext("Inventory check completed", "info");
    span->End();
}`,
    },
  ],
  diagrams: [
    {
      title: "Distributed Trace Across Microservices",
      kind: "sequence",
      mermaid: `sequenceDiagram
    participant User
    participant GW as API Gateway
    participant Order as Order Service
    participant Payment as Payment Service
    participant Inventory as Inventory Service
    User->>GW: POST /checkout
    Note right of GW: Root Span - traceId: abc123
    GW->>Order: POST /orders traceparent: abc123-span1
    Note right of Order: Child Span - parentId: span1
    Order->>Inventory: GET /stock traceparent: abc123-span2
    Inventory-->>Order: 200 OK items available
    Order->>Payment: POST /charge traceparent: abc123-span3
    Payment-->>Order: 200 OK charged
    Order-->>GW: 201 Created
    GW-->>User: 201 Order Confirmed`,
      caption: "A single user request generates a trace tree across four services, linked by traceparent headers propagating the shared traceId.",
    },
    {
      title: "OpenTelemetry Collector Pipeline",
      kind: "architecture",
      mermaid: `graph LR
    subgraph Apps["Applications"]
      A1["Order Service\nOTel SDK"]
      A2["Payment Service\nOTel SDK"]
    end
    subgraph Collector["OTel Collector"]
      R["Receivers\nOTLP gRPC 4317\nOTLP HTTP 4318"]
      P["Processors\nBatch\nTail Sampling\nAttributes"]
      E["Exporters\nOTLP\nJaeger\nPrometheus"]
      R --> P --> E
    end
    subgraph Backends["Backends"]
      T[("Grafana Tempo")]
      J[("Jaeger")]
      Pr[("Prometheus")]
    end
    A1 -->|OTLP gRPC| R
    A2 -->|OTLP HTTP| R
    E --> T
    E --> J
    E --> Pr`,
      caption: "The OTel Collector receives telemetry, processes it through a configurable pipeline, and exports to multiple observability backends.",
    },
    {
      title: "Span Lifecycle State Machine",
      kind: "state",
      mermaid: `stateDiagram-v2
    [*] --> Created : tracer.startSpan()
    Created --> Active : scope activated
    Active --> Active : addEvent or setAttribute
    Active --> Error : exception recorded
    Error --> Ended : span.end()
    Active --> Ended : span.end()
    Ended --> Sampled : decision = RECORD_AND_SAMPLE
    Ended --> Dropped : decision = DROP
    Sampled --> Batched : BatchSpanProcessor
    Batched --> Exported : OTLP export
    Exported --> [*]
    Dropped --> [*]`,
      caption: "A span moves from Created through Active to Ended, then is either sampled and exported or dropped based on the sampling decision.",
    },
    {
      title: "Sampling Strategy Overview",
      kind: "flow",
      mermaid: `flowchart TD
    A["Incoming Request"] --> B{"Head-based\nsampling decision"}
    B -->|Sampled 5 pct| C["Collect all spans\nfor this trace"]
    B -->|Not sampled| D["Drop trace"]
    C --> E["Trace completes\nat Collector"]
    E --> F{"Tail-based\nsampling rules"}
    F -->|Has ERROR span| G["Keep trace 100 pct"]
    F -->|Latency over 2s| G
    F -->|Normal trace| H{"Random 20 pct"}
    H -->|Keep| G
    H -->|Drop| I["Discard trace"]
    G --> J["Export to backend"]`,
      caption: "Combined head and tail sampling: low head rate controls volume, tail rules ensure errors and slow traces are always retained.",
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Jaeger",
      "Grafana Tempo",
      "Zipkin",
      "Datadog APM",
      "AWS X-Ray",
    ],
    rows: [
      [
        "License",
        "Apache 2.0 (open source)",
        "AGPLv3 (open source)",
        "Apache 2.0 (open source)",
        "Proprietary (SaaS)",
        "Proprietary (AWS)",
      ],
      [
        "Storage Backends",
        "Elasticsearch, Cassandra, Kafka, Badger",
        "S3, GCS, Azure Blob (object storage)",
        "Elasticsearch, Cassandra, MySQL",
        "Managed (Datadog cloud)",
        "Managed (AWS cloud)",
      ],
      [
        "Query Capability",
        "Tag-based search, service/operation filter",
        "Trace ID lookup only (uses Grafana for discovery)",
        "Tag and annotation search",
        "Full-text search, analytics, APM queries",
        "Filter expressions, annotations, groups",
      ],
      [
        "Sampling Support",
        "Head-based, remote sampling",
        "Head and tail-based via OTel Collector",
        "Head-based, rate limiting",
        "Head and tail-based, priority sampling",
        "Reservoir sampling, fixed rate",
      ],
      [
        "OTel Native Support",
        "OTLP receiver, OTel SDK compatible",
        "OTLP native, built for OTel",
        "OTLP via Collector, native Zipkin format",
        "OTLP ingestion, proprietary agent",
        "OTLP via ADOT Collector, X-Ray SDK",
      ],
      [
        "Service Dependency Map",
        "Yes (auto-generated from traces)",
        "Via Grafana (derived from metrics)",
        "Yes (built-in dependency view)",
        "Yes (auto-generated service map)",
        "Yes (X-Ray service map)",
      ],
      [
        "Cost Model",
        "Self-hosted infrastructure cost",
        "Low (object storage is cheap)",
        "Self-hosted infrastructure cost",
        "Per ingested span pricing",
        "Per traced request pricing",
      ],
      [
        "Best For",
        "Teams wanting full tag search, self-hosted",
        "High-volume, cost-sensitive Grafana users",
        "Simple deployments, small-medium scale",
        "Full-stack APM with metrics and logs",
        "AWS-native workloads",
      ],
    ],
  },
  exercises: [
    "Set up a three-service application (API gateway, order service, inventory service) with **OpenTelemetry auto-instrumentation** in Node.js. Deploy the **OTel Collector** and **Jaeger** backend using Docker Compose. Send a request through the gateway and verify that the full trace appears in Jaeger's waterfall view with all three services linked.",
    "Implement **manual span creation** for a business-critical workflow (e.g., payment processing). Add custom span attributes like `payment.method`, `payment.amount`, and `payment.currency`. Record span events for key milestones (authorization, capture, confirmation). Verify the enriched spans appear in the backend.",
    "Configure **tail-based sampling** in the OpenTelemetry Collector to retain 100% of error traces and traces with latency exceeding 2 seconds, while sampling only 5% of successful fast traces. Generate a mix of fast, slow, and error requests and verify that the sampling rules produce the expected trace retention behavior.",
    "Implement **cross-boundary context propagation** through a message queue (Kafka or RabbitMQ). Produce a message with trace context injected into message headers, consume it in a separate service, extract the context, and create a child span. Verify the producer and consumer spans appear in the same trace in the backend.",
    "Build a **trace-based integration test** that asserts on span structure. After sending a request through your instrumented services, query the tracing backend API for the trace, and assert: (1) the trace contains the expected number of spans, (2) no span has an ERROR status, (3) the database span's `db.statement` attribute matches the expected query pattern, and (4) total trace duration is under a threshold.",
  ],
  cheatSheet: [
    "**W3C Traceparent format**: `00-<traceId 32hex>-<spanId 16hex>-<flags 2hex>` — inject via `traceparent` HTTP header for cross-service propagation.",
    "**Start OTel Collector**: `docker run -p 4317:4317 -p 4318:4318 -v ./otel-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector-contrib` — accepts OTLP on gRPC (4317) and HTTP (4318).",
    "**Create a span**: `tracer.startActiveSpan('operationName', (span) => { /* work */ span.end(); })` — always call `span.end()` or spans leak.",
    "**Add attributes**: `span.setAttribute('http.method', 'POST')` — use **OpenTelemetry Semantic Conventions** (`http.method`, `db.system`, `rpc.service`) for consistent naming across services.",
    "**Record errors**: `span.recordException(error)` then `span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })` — both are needed for proper error visibility in backends.",
    "**Log correlation**: embed `trace_id` and `span_id` in every structured log entry — query logs with `{service=\"myapp\"} |= \"<traceId>\"` in Loki or `traceId: \"<traceId>\"` in Elasticsearch to jump from traces to logs.",
  ],
  revisionNotes: [
    "A **trace** is a tree of **spans** sharing a `traceId`. Each span has a `spanId`, `parentSpanId`, *start time*, *duration*, **attributes**, **events**, and a **status** (`OK`, `ERROR`, `UNSET`). Context propagation via the `traceparent` header links spans across service boundaries.",
    "**OpenTelemetry** separates the *API* (interfaces your code depends on), the *SDK* (implementation with exporters and samplers), and the *Collector* (standalone pipeline for receiving, processing, and exporting telemetry). **Auto-instrumentation** wraps frameworks automatically; **manual instrumentation** adds custom spans for business logic.",
    "**Head-based sampling** decides at trace start (simple, predictable cost, but randomly drops interesting traces). **Tail-based sampling** decides after completion in the Collector (retains errors and slow traces, but requires buffering). Production systems typically combine both: a low head-based rate (e.g., `5%`) plus tail-based rules for anomalies.",
    "**Backends compared**: *Jaeger* offers tag-based search and a rich UI but requires managed storage. *Tempo* is cheapest at scale (object storage, no indexing) but only supports trace ID lookups. *Zipkin* is simplest for small deployments. *Datadog APM* and *AWS X-Ray* are managed SaaS options with integrated metrics and logs.",
    "**Key practices**: instrument at service boundaries (HTTP, gRPC, queues), propagate context through async boundaries (inject `traceparent` into message headers), embed `traceId` in logs for correlation, use **semantic conventions** for span attribute names, and avoid unbounded attribute cardinality to prevent storage blowup.",
  ],
};
