import type { TopicContent } from "../types";

export const metrics: TopicContent = {
  quickSummary: [
    "Counters are monotonically increasing values that only go up (or reset to zero on restart) — used for totals like requests served, errors occurred, or bytes transferred; derive rates with rate() or increase().",
    "Gauges represent a current value that can go up or down — used for snapshots like temperature, queue depth, active connections, or memory usage.",
    "Histograms sample observations (e.g., request latency) into configurable buckets and provide sum/count, enabling percentile estimation; summaries compute streaming quantiles on the client side.",
    "The RED method (Rate, Errors, Duration) monitors request-driven services; the USE method (Utilization, Saturation, Errors) monitors infrastructure resources — together they cover full-stack observability.",
  ],
  detailed: [
    "## Metric Types: Counters and Gauges\n\n**Counters** are cumulative metrics that only increase (or reset to zero on process restart). Examples: total HTTP requests, total errors, total bytes sent. You never read a counter's absolute value directly — instead, use `rate()` to compute per-second change or `increase()` for total change over a window. Counters are the most common metric type.\n\n**Gauges** represent a current value that can go up or down. Examples: CPU temperature, memory usage, queue size, active goroutines. Unlike counters, the raw gauge value is meaningful. Use `avg_over_time()`, `max_over_time()`, or `min_over_time()` to summarize gauge behavior over time.\n\nChoosing between them: if the value can decrease, use a gauge. If it only goes up (totals, counts), use a counter. Using the wrong type leads to incorrect queries — `rate()` on a gauge or raw reads on a counter both give misleading results.",
    "## Histograms and Summaries\n\n**Histograms** divide observations into configurable buckets. For each scrape, Prometheus exposes:\n- `<metric>_bucket{le=\"0.1\"}` — count of observations <= 0.1\n- `<metric>_bucket{le=\"0.5\"}` — count <= 0.5\n- ... cumulative buckets ...\n- `<metric>_sum` — sum of all observed values\n- `<metric>_count` — total number of observations\n\nPercentiles are estimated using `histogram_quantile(0.99, rate(metric_bucket[5m]))`. Bucket boundaries must be chosen carefully — too few miss detail, too many waste storage.\n\n**Summaries** compute streaming quantiles (e.g., p50, p95, p99) on the client before exposing them. They are precise but cannot be aggregated across instances (you cannot average percentiles). Histograms are generally preferred because they are aggregatable and allow choosing quantiles at query time.",
    "## Prometheus Architecture\n\nPrometheus is a pull-based monitoring system:\n1. **Instrumentation** — applications expose metrics at an HTTP endpoint (e.g., `/metrics`) in Prometheus text format\n2. **Scraping** — Prometheus server periodically pulls metrics from configured targets\n3. **Storage** — time-series data is stored in a local TSDB (time series database) with compaction and retention\n4. **Querying** — PromQL enables powerful queries: `rate(http_requests_total{status=\"500\"}[5m])` gives the per-second 500 error rate over 5 minutes\n5. **Alerting** — alert rules in Prometheus trigger when conditions are met; Alertmanager handles routing, grouping, and notification\n\nKey concepts: labels add dimensions to metrics (e.g., `method`, `endpoint`, `status`), enabling flexible grouping and filtering. High cardinality labels (user IDs, request IDs) should be avoided as they explode storage.",
    "## Grafana Dashboards\n\nGrafana visualizes metrics from Prometheus (and other data sources) in configurable dashboards:\n- **Panels** display individual queries as graphs, gauges, tables, heatmaps, or stat values\n- **Variables** enable dynamic dashboards (e.g., dropdown to select a service or instance)\n- **Alerts** can be configured in Grafana as an alternative to Prometheus alerting\n- **Dashboard-as-code** — dashboards can be provisioned from JSON files or generated programmatically (Grafonnet, grafana-dashboard-builder)\n\nBest practices: use consistent naming conventions for dashboards and panels, organize by service with drill-down links, include a summary row with key SLI metrics at the top, set sensible default time ranges, and use template variables for multi-instance views.",
    "## The RED Method\n\nThe RED method monitors request-driven services (APIs, web servers, microservices):\n- **Rate** — requests per second (`rate(http_requests_total[5m])`)\n- **Errors** — failed requests per second or error rate percentage\n- **Duration** — latency distribution, typically p50, p95, p99 (`histogram_quantile(0.99, ...)`)\n\nEvery service should expose these three signals. They directly map to user experience: rate shows traffic, errors show reliability, duration shows responsiveness. RED is the service-level complement to USE (infrastructure-level).",
    "## The USE Method for Infrastructure\n\nThe USE method systematically checks each hardware resource:\n- **Utilization** — fraction of time the resource is busy (CPU %, disk %util, NIC bandwidth %)\n- **Saturation** — work queued beyond capacity (CPU run queue, disk I/O queue depth, memory swap activity)\n- **Errors** — error events (disk errors, network packet drops, ECC memory corrections)\n\nApply to: CPUs, memory, storage devices, network interfaces, GPUs. USE finds infrastructure bottlenecks that RED cannot: a service may have high latency (RED Duration) because the underlying disk is saturated (USE Saturation on storage). Together, RED + USE cover the full stack from user request to hardware resource.",
  ],
  interviewQA: [
    {
      q: "What is the difference between a counter and a gauge, and when would you use each?",
      a: "A counter is a monotonically increasing value that only goes up (or resets to zero on restart). Use it for totals: requests served, errors, bytes transferred. You query it with rate() or increase() to get per-second rates or deltas. A gauge is a value that can go up and down, representing a current snapshot: temperature, queue depth, memory usage. The raw gauge value is directly meaningful. Using the wrong type leads to broken queries — rate() on a gauge or reading a raw counter value are both meaningless.",
      followUps: [
        "What happens to a counter when a process restarts?",
        "How does rate() handle counter resets?",
      ],
    },
    {
      q: "Why are histograms generally preferred over summaries in Prometheus?",
      a: "Histograms are preferred because they are aggregatable across instances — you can combine bucket counts from multiple pods and compute a global percentile. Summary quantiles are computed on each instance and cannot be meaningfully averaged or combined. Histograms also let you choose which quantiles to compute at query time, while summaries fix them at instrumentation time. The trade-off is that histogram percentiles are estimates whose accuracy depends on bucket boundaries, while summary quantiles are precise for a single instance.",
      followUps: [
        "How do you choose histogram bucket boundaries?",
        "When might summaries still be the right choice?",
      ],
    },
    {
      q: "Explain the RED and USE methods. How do they complement each other?",
      a: "RED monitors request-driven services: Rate (requests/sec), Errors (failure rate), Duration (latency percentiles). USE monitors infrastructure resources: Utilization (% busy), Saturation (queued work), Errors (hardware errors). They complement each other because RED tells you what the user experiences (slow responses, errors) while USE tells you why (saturated disk, exhausted memory). A complete monitoring setup applies RED to every service and USE to every resource, linking them so you can trace a RED anomaly to a USE bottleneck.",
      followUps: [
        "How do SLIs and SLOs relate to the RED method?",
        "What tools implement USE method monitoring?",
      ],
    },
    {
      q: "What is label cardinality and why is it a problem in Prometheus?",
      a: "Label cardinality is the number of unique label value combinations for a metric. Each unique combination creates a separate time series. High-cardinality labels like user_id, request_id, or IP address create millions of series, overwhelming Prometheus's TSDB with memory and storage requirements. This leads to slow queries, increased scrape times, and potential OOM crashes. Best practice: keep labels to bounded sets (HTTP method, status code, endpoint) and move high-cardinality data to logs or tracing systems.",
    },
  ],
  followUps: [
    "Why report percentiles rather than averages?",
    "What's the difference between a counter, a gauge, and a histogram?",
    "Why does high-cardinality labelling break a metrics system?",
    "What should page a human versus just be a dashboard?",
  ],
  mcqs: [
    {
      q: "Which metric type should be used for tracking the total number of HTTP requests?",
      options: ["Gauge", "Histogram", "Counter", "Summary"],
      answerIndex: 2,
      explanation:
        "Total request count only increases (or resets on restart), making it a counter. Use rate() to derive the requests-per-second rate.",
    },
    {
      q: "What does histogram_quantile(0.99, rate(http_duration_bucket[5m])) compute?",
      options: [
        "The average request duration",
        "The 99th percentile request duration estimated from histogram buckets",
        "The total request count",
        "The maximum request duration",
      ],
      answerIndex: 1,
      explanation:
        "histogram_quantile estimates a quantile (here p99) from histogram bucket boundaries and counts. The rate() converts cumulative counters to per-second rates over the 5m window.",
    },
    {
      q: "In the RED method, what does the 'E' stand for?",
      options: ["Efficiency", "Events", "Errors", "Endpoints"],
      answerIndex: 2,
      explanation:
        "RED stands for Rate (requests/sec), Errors (failed requests), Duration (latency). These three signals capture the user-facing health of a service.",
    },
    {
      q: "Why can't you aggregate summary quantiles across multiple instances?",
      options: [
        "Summaries don't support labels",
        "Averaging percentiles is statistically invalid",
        "Summaries are too large to transfer",
        "Prometheus doesn't support summary queries",
      ],
      answerIndex: 1,
      explanation:
        "You cannot average percentiles to get a correct aggregate percentile — the average of p99 values from two instances is not the p99 of the combined traffic. Histograms avoid this because raw bucket counts can be summed before computing quantiles.",
    },
    {
      q: "What is label cardinality?",
      options: [
        "The number of labels on a metric",
        "The number of unique label value combinations creating distinct time series",
        "The length of label names",
        "The number of metrics in a dashboard",
      ],
      answerIndex: 1,
      explanation:
        "Cardinality is the count of unique time series for a metric, determined by the cross-product of all label values. High cardinality (e.g., user_id labels) causes storage and performance problems.",
    },
  ],
  flashcards: [
    {
      front: "What PromQL function converts a counter to a per-second rate?",
      back: "rate(<counter>[<range>]) — computes the per-second average rate of increase over the range window, automatically handling counter resets.",
    },
    {
      front: "What is the difference between rate() and increase()?",
      back: "rate() returns per-second change; increase() returns total change over the window. increase(x[5m]) = rate(x[5m]) * 300. Both handle counter resets.",
    },
    {
      front: "What is a time series in Prometheus?",
      back: "A unique combination of a metric name and its label key-value pairs. Each time series stores a sequence of timestamped values (samples).",
    },
    {
      front: "What does the le label mean in histogram buckets?",
      back: "'le' stands for 'less than or equal to' — the upper bound of the bucket. _bucket{le=\"0.5\"} counts observations with value <= 0.5. Buckets are cumulative.",
    },
    {
      front: "What is Alertmanager?",
      back: "A Prometheus component that receives alerts from Prometheus, deduplicates, groups, routes, silences, and sends notifications to receivers (email, Slack, PagerDuty, etc.).",
    },
    {
      front: "What does USE stand for?",
      back: "Utilization (% resource busy), Saturation (queued work beyond capacity), Errors (error events). Applied per resource: CPU, memory, disk, network.",
    },
    {
      front: "What does RED stand for?",
      back: "Rate (requests/sec), Errors (failed requests/sec), Duration (latency distribution). Applied per service endpoint.",
    },
    {
      front: "What is a recording rule in Prometheus?",
      back: "A precomputed PromQL expression stored as a new time series. Used to speed up frequently queried or expensive expressions like histogram quantiles.",
    },
  ],
  resources: [
    {
      label: "Site Reliability Engineering — Google",
      kind: "book",
    },
    {
      label: "Prometheus documentation — instrumentation best practices",
      kind: "docs",
    },
  ],
  glossary: [
    {
      term: "Counter",
      definition:
        "A metric type that only increases (or resets to zero on restart), used for cumulative totals like request counts or error counts.",
    },
    {
      term: "Gauge",
      definition:
        "A metric type representing a current value that can increase or decrease, like temperature, queue depth, or memory usage.",
    },
    {
      term: "Histogram",
      definition:
        "A metric type that samples observations into configurable buckets, exposing cumulative counts per bucket plus sum and total count, enabling percentile estimation.",
    },
    {
      term: "Summary",
      definition:
        "A metric type that computes streaming quantiles on the client side. Precise for single instances but not aggregatable across multiple instances.",
    },
    {
      term: "PromQL",
      definition:
        "Prometheus Query Language — a functional language for querying time-series data with operations like rate(), sum(), histogram_quantile(), and label matching.",
    },
    {
      term: "Label",
      definition:
        "A key-value pair attached to a metric that adds dimensions (e.g., method=\"GET\", status=\"200\"), creating distinct time series per unique combination.",
    },
    {
      term: "Scraping",
      definition:
        "The process by which Prometheus pulls metrics from application endpoints at regular intervals (scrape_interval, typically 15-30 seconds).",
    },
    {
      term: "SLI (Service Level Indicator)",
      definition:
        "A quantitative measure of service behavior (e.g., request latency p99 < 200ms, error rate < 0.1%) used to define and monitor SLOs.",
    },
  ],
  deepDive: [
    "**Designing Custom Metrics** requires careful thought about *naming conventions*, *label dimensions*, and *metric types*. Follow the pattern `<namespace>_<subsystem>_<name>_<unit>` — for example, `myapp_http_request_duration_seconds` or `myapp_queue_messages_total`. Always include a **unit suffix** (`_seconds`, `_bytes`, `_total`) so dashboards and queries are self-documenting. When choosing labels, apply the **bounded cardinality rule**: every label value set must be *finite and small* (e.g., `method=\"GET\"`, `status=\"200\"`). Never use `user_id`, `trace_id`, or `ip` as labels — these create **cardinality explosions** that crash Prometheus. Instead, record high-cardinality identifiers in *logs* or *traces* and correlate via **exemplars** (`histogram_observe_with_exemplar`). Use `const` labels for metadata that never changes per process (e.g., `version`, `region`) and `variable` labels for request-scoped dimensions. When in doubt, start with *fewer labels* and add more later — removing a label is a **breaking schema change** for existing dashboards and alerts.",
    "**Advanced PromQL Patterns** unlock powerful observability insights. The `rate()` function is the workhorse for counters, but for *bursty traffic*, consider `irate()` which uses only the last two samples for higher resolution. **Aggregation operators** like `sum by (service)`, `avg without (instance)`, and `topk(5, ...)` let you slice data across dimensions. A critical pattern is the **error ratio**: `sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))` gives the *fraction of 5xx responses*. For **histogram percentiles**, use `histogram_quantile(0.99, sum by (le) (rate(http_duration_bucket[5m])))` — note that the `by (le)` clause is *mandatory*. **Subqueries** enable time-over-time analysis: `max_over_time(rate(cpu_usage[5m])[1h:1m])` finds the *peak 5-minute CPU rate* in the last hour. The `predict_linear()` function forecasts gauge values: `predict_linear(node_filesystem_avail_bytes[6h], 24*3600) < 0` predicts *disk exhaustion within 24 hours*. Master these patterns and you can express virtually any monitoring question in PromQL.",
    "**SLO-Based Alerting** replaces *threshold-based* alerts with **error budget** reasoning, dramatically reducing alert fatigue. Define an *SLI* (Service Level Indicator) like `request latency p99 < 300ms` and set an *SLO* (Service Level Objective) like `99.9% of requests meet the SLI over 30 days`. The **error budget** is `1 - SLO = 0.1%`, meaning you tolerate *0.1% of requests* violating the SLI per month. Use **multi-window, multi-burn-rate alerts**: a *fast burn* (14.4x budget consumption over 1 hour, confirmed over 5 minutes) pages immediately for acute incidents, while a *slow burn* (1x budget consumption over 3 days, confirmed over 6 hours) creates a ticket for gradual degradation. Implement this in Prometheus with `recording rules` that precompute SLI compliance ratios: `sum(rate(http_requests_total{status!~\"5..\"}[30d])) / sum(rate(http_requests_total[30d]))`. Track the **remaining error budget** on a Grafana dashboard with `1 - ((1 - sli_ratio) / (1 - 0.999))` to show the *percentage of budget consumed*. This approach, documented in the **Google SRE Book**, ensures you only get paged when user experience is *measurably impacted*, not when an arbitrary threshold is crossed."
  ],
  code: [
    {
      language: "typescript",
      caption: "Prometheus metrics instrumentation in Node.js using prom-client",
      source: `import express from "express";
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";

const register = new Registry();

// Collect default Node.js metrics (GC, event loop, memory)
collectDefaultMetrics({ register, prefix: "myapp_" });

// Counter — total HTTP requests
const httpRequestsTotal = new Counter({
  name: "myapp_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

// Histogram — request duration in seconds
const httpRequestDuration = new Histogram({
  name: "myapp_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Gauge — active connections
const activeConnections = new Gauge({
  name: "myapp_active_connections",
  help: "Number of active connections",
  registers: [register],
});

const app = express();

// Middleware to track request metrics
app.use((req, res, next) => {
  activeConnections.inc();
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on("finish", () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: String(res.statusCode) });
    end();
    activeConnections.dec();
  });
  next();
});

// Expose /metrics endpoint for Prometheus scraping
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.listen(3000, () => console.log("Server listening on :3000"));`,
    },
    {
      language: "promql",
      caption: "Common PromQL query patterns for dashboards and alerts",
      source: `# --- Rate & Throughput ---
# Requests per second by status code (5m smoothing)
sum by (status) (rate(myapp_http_requests_total[5m]))

# Error rate as a percentage
sum(rate(myapp_http_requests_total{status=~"5.."}[5m]))
  / sum(rate(myapp_http_requests_total[5m])) * 100

# --- Latency Percentiles ---
# p50, p95, p99 request duration
histogram_quantile(0.50, sum by (le) (rate(myapp_http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.95, sum by (le) (rate(myapp_http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.99, sum by (le) (rate(myapp_http_request_duration_seconds_bucket[5m])))

# Average request duration
rate(myapp_http_request_duration_seconds_sum[5m])
  / rate(myapp_http_request_duration_seconds_count[5m])

# --- Saturation & Resources ---
# CPU usage per instance
1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))

# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
  / node_memory_MemTotal_bytes * 100

# Disk space: predict when filesystem will be full
predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 24*3600) < 0

# --- Alerting: Multi-burn-rate SLO ---
# Fast burn: 14.4x error budget consumption over 1h
(
  sum(rate(myapp_http_requests_total{status=~"5.."}[1h]))
  / sum(rate(myapp_http_requests_total[1h]))
) > (14.4 * 0.001)

# Slow burn: 1x error budget consumption over 3d
(
  sum(rate(myapp_http_requests_total{status=~"5.."}[3d]))
  / sum(rate(myapp_http_requests_total[3d]))
) > (1 * 0.001)

# --- Top-K & Aggregation ---
# Top 5 endpoints by request rate
topk(5, sum by (route) (rate(myapp_http_requests_total[5m])))

# Requests per service, excluding internal routes
sum by (service) (rate(http_requests_total{route!~"/internal/.*"}[5m]))`,
    },
    {
      language: "cpp",
      caption: "Prometheus metrics instrumentation in C++ using prometheus-cpp",
      source: `#include <prometheus/counter.h>
#include <prometheus/exposer.h>
#include <prometheus/histogram.h>
#include <prometheus/registry.h>
#include <chrono>
#include <memory>
#include <thread>

int main() {
  // Create an HTTP exposer on port 8080 (serves /metrics)
  prometheus::Exposer exposer{"0.0.0.0:8080"};

  auto registry = std::make_shared<prometheus::Registry>();

  // Counter family — total requests by method and status
  auto& request_counter = prometheus::BuildCounter()
    .Name("myapp_http_requests_total")
    .Help("Total HTTP requests")
    .Register(*registry);

  auto& get_200 = request_counter.Add({{"method", "GET"}, {"status", "200"}});
  auto& post_201 = request_counter.Add({{"method", "POST"}, {"status", "201"}});
  auto& get_500 = request_counter.Add({{"method", "GET"}, {"status", "500"}});

  // Histogram family — request duration
  auto& duration_histogram = prometheus::BuildHistogram()
    .Name("myapp_http_request_duration_seconds")
    .Help("Request duration in seconds")
    .Register(*registry);

  auto& get_duration = duration_histogram.Add(
    {{"method", "GET"}},
    prometheus::Histogram::BucketBoundaries{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 5.0}
  );

  exposer.RegisterCollectable(registry);

  // Simulate request handling
  while (true) {
    auto start = std::chrono::steady_clock::now();
    // ... handle request ...
    std::this_thread::sleep_for(std::chrono::milliseconds(15));
    auto end = std::chrono::steady_clock::now();

    double duration = std::chrono::duration<double>(end - start).count();
    get_200.Increment();
    get_duration.Observe(duration);
  }

  return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Prometheus Monitoring Architecture",
      kind: "architecture",
      caption: "End-to-end Prometheus stack showing service discovery, scraping, TSDB storage, alerting, and long-term remote storage.",
      mermaid: `graph TB
    subgraph Targets["Instrumented Targets"]
        A1["Service A - /metrics"]
        A2["Service B - /metrics"]
        A3["Node Exporter - /metrics"]
        A4["cAdvisor - /metrics"]
    end
    subgraph Prometheus["Prometheus Server"]
        SD["Service Discovery - Kubernetes, Consul, DNS"]
        SC["Scraper"]
        TSDB["Time Series DB - Local Storage"]
        AE["Alert Rules Engine"]
        QE["PromQL Query Engine"]
    end
    AM["Alertmanager - Dedup, Group, Route"]
    SL["Slack"]
    PD["PagerDuty"]
    GR["Grafana Dashboards"]
    TH["Thanos or Mimir - Long-Term Storage"]
    SD -->|discover targets| SC
    SC -->|pull /metrics| A1
    SC -->|pull /metrics| A2
    SC -->|pull /metrics| A3
    SC -->|pull /metrics| A4
    SC -->|write samples| TSDB
    TSDB --> AE
    TSDB --> QE
    AE -->|fire alerts| AM
    AM --> SL
    AM --> PD
    QE --> GR
    TSDB -->|remote write| TH`,
    },
    {
      title: "RED and USE Methodologies Mindmap",
      kind: "mindmap",
      caption: "Comprehensive overview of RED and USE monitoring methodologies with key metrics for each dimension.",
      mermaid: `mindmap
  root((Metrics Methodologies))
    RED Method - for Services
      Rate
        requests per second
        throughput by endpoint
      Errors
        error rate percentage
        5xx divided by total requests
        error budget tracking
      Duration
        p50 p95 p99 latency
        histogram_quantile in PromQL
        Apdex score
    USE Method - for Resources
      Utilisation
        CPU percentage
        Memory usage percentage
        Disk and network bandwidth
      Saturation
        CPU run queue depth
        Disk I/O queue depth
        Thread pool exhaustion
      Errors
        Disk read and write errors
        Network packet drops
        NIC errors
    SLO Framework
      SLI definition
      Error budget calculation
      Burn rate alerts
      Multi-window detection`,
    },
    {
      title: "Alert Routing State Machine",
      kind: "state",
      caption: "States an alert passes through in Alertmanager from firing through grouping, deduplication, and notification delivery.",
      mermaid: `stateDiagram-v2
    [*] --> Pending: Alert rule condition first met
    Pending --> Firing: for duration exceeded
    Pending --> Resolved: Condition clears before for duration
    Firing --> Grouped: Alertmanager groups by labels
    Grouped --> Inhibited: Inhibition rule matches
    Grouped --> Silenced: Matching silence exists
    Grouped --> Sent: Notification dispatched to receiver
    Sent --> Repeated: Repeat interval elapsed - still firing
    Repeated --> Sent: Resend notification
    Firing --> Resolved: Prometheus marks alert resolved
    Resolved --> [*]
    Inhibited --> Grouped: Inhibiting alert clears
    Silenced --> Grouped: Silence expires`,
    },
    {
      title: "Metric Type Selection Flow",
      kind: "flow",
      caption: "Decision flow for choosing the correct Prometheus metric type based on what you are measuring.",
      mermaid: `flowchart TD
    A["What are you measuring?"] --> B{"Does the value\nonly go up?"}
    B -->|Yes| C{"Do you need\nrate over time?"}
    C -->|Yes| D["Counter\nUse rate() or increase() in PromQL\ne.g. http_requests_total"]
    C -->|No| E["Counter still - rate gives you the rate"]
    B -->|No| F{"Is it a\ncurrent snapshot?"}
    F -->|Yes| G{"Distribution\nof values needed?"}
    G -->|No| H["Gauge\ncurrent value up or down\ne.g. memory_bytes, connections"]
    G -->|Yes| I{"Need exact\nquantiles?"}
    I -->|Yes| J["Summary\npre-computed quantiles client-side\ne.g. request_duration_seconds summary"]
    I -->|No| K["Histogram\nbuckets server-side quantile approximation\ne.g. request_duration_seconds histogram"]`,
    },
  ],
  animations: [
    {
      title: "Why an average hides the outage",
      steps: [
        {
          label: "1,000 requests",
          detail: "990 take 50 ms. 10 take 5 seconds.",
        },
        {
          label: "Average",
          detail: "~100 ms. The dashboard looks healthy.",
        },
        {
          label: "p99",
          detail: "5 seconds. One in a hundred users is having an unusable experience.",
        },
        {
          label: "At scale",
          detail: "A million requests a day means 10,000 people affected — and they're the ones who contact support.",
        },
        {
          label: "Which to alert on",
          detail: "Percentiles against an SLO, not averages.",
        },
        {
          label: "Cardinality warning",
          detail: "Labelling metrics by user id creates a time series per user and takes down the metrics system instead.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "Prometheus", "Datadog", "CloudWatch", "InfluxDB"],
    rows: [
      ["**Type**", "Open-source, self-hosted", "Commercial SaaS", "AWS-native SaaS", "Open-source / Cloud"],
      ["**Data Model**", "Multi-dimensional time series with *labels*", "Tags-based time series with *custom metrics*", "Namespaces, dimensions, metrics", "Tags-based time series with *field keys*"],
      ["**Query Language**", "`PromQL` — powerful, functional", "`DQL` — proprietary query language", "CloudWatch Metrics Insights (SQL-like)", "`InfluxQL` / `Flux` — SQL-like and functional"],
      ["**Collection**", "Pull-based (scraping `/metrics`)", "Push-based (agent / API)", "Push-based (SDK / API / agent)", "Push-based (Telegraf agent / API)"],
      ["**Storage**", "Local TSDB; remote write to *Thanos/Mimir/Cortex*", "Managed cloud storage (*15-month retention*)", "Managed AWS storage (*15-month retention*)", "Built-in TSM engine; *InfluxDB Cloud*"],
      ["**Alerting**", "Prometheus rules + *Alertmanager* (routing, grouping, silencing)", "Built-in monitors with *anomaly detection* and ML", "CloudWatch Alarms + *SNS* notifications", "Built-in checks and *notification endpoints*"],
      ["**Visualization**", "Basic Web UI; pair with **Grafana**", "Built-in dashboards, *notebooks*, SLO tracking", "CloudWatch Dashboards (*limited customization*)", "Built-in Chronograf; pair with **Grafana**"],
      ["**Scalability**", "Single-node; scale with *Thanos/Mimir* federation", "Fully managed, *auto-scaling* infrastructure", "Fully managed, *auto-scaling* per AWS region", "Clustering in *Enterprise*; InfluxDB Cloud scales"],
      ["**Cost**", "**Free**; infrastructure cost only", "Per-host + per-metric pricing (*expensive at scale*)", "Pay per metric, dashboard, alarm, API call", "**Free** OSS; Cloud plans per usage"],
      ["**Best For**", "Kubernetes-native, *cloud-native* microservices", "Full-stack observability with *minimal ops overhead*", "AWS-native workloads, *tight AWS integration*", "IoT, *high-write* time series, edge deployments"],
    ],
  },
  exercises: [
    "**Instrument a REST API**: Add `prom-client` to a Node.js Express app. Create a *counter* for total requests (labeled by `method`, `route`, `status`), a *histogram* for request duration with custom bucket boundaries, and a *gauge* for active connections. Expose a `/metrics` endpoint and verify the output with `curl`.",
    "**Build a RED Dashboard**: Using Grafana and Prometheus, create a dashboard for a service with three panels: *request rate* (`rate()`), *error percentage* (ratio of 5xx to total), and *latency percentiles* (`histogram_quantile` for p50, p95, p99). Add template variables for `service` and `instance` to make it reusable.",
    "**Simulate a Cardinality Explosion**: Create a metric with a `user_id` label and generate 100,000 unique values. Observe the impact on Prometheus memory usage and query latency. Then refactor to remove the high-cardinality label and use *exemplars* instead to link to trace IDs.",
    "**Implement SLO-Based Alerting**: Define an SLI (`99.9% of requests < 300ms`), compute the *error budget*, and create **multi-window, multi-burn-rate** alert rules in Prometheus. Set up a Grafana panel showing *remaining error budget percentage* over a 30-day rolling window.",
    "**Infrastructure Monitoring with USE**: Deploy `node_exporter` on a Linux host and build a Grafana dashboard applying the USE method: *CPU utilization* (`1 - idle rate`), *CPU saturation* (load average vs. core count), *memory utilization*, *disk I/O saturation* (await, queue depth), and *network errors* (packet drops). Trigger each condition with stress tools like `stress-ng`."
  ],
  cheatSheet: [
    "**Counter vs Gauge**: If the value can *decrease*, use a `Gauge`. If it only goes *up* (totals, counts), use a `Counter`. Query counters with `rate()` or `increase()`, never read raw values.",
    "**rate() vs irate()**: `rate()` averages over the full range window for *smooth graphs*. `irate()` uses only the *last two samples* for higher resolution on bursty traffic. Use `rate()` for alerts, `irate()` for dashboards.",
    "**Histogram percentiles**: `histogram_quantile(0.99, sum by (le) (rate(my_histogram_bucket[5m])))` — the `by (le)` clause is **mandatory**. Forgetting it gives *wrong results silently*.",
    "**Naming convention**: `<namespace>_<subsystem>_<name>_<unit>` with unit suffix: `_seconds`, `_bytes`, `_total`. Example: `myapp_http_request_duration_seconds`.",
    "**Label cardinality rule**: Keep label value sets *bounded and small*. Never use `user_id`, `request_id`, or `ip` as labels. Move high-cardinality data to *logs* or *traces*.",
    "**predict_linear()**: `predict_linear(node_filesystem_avail_bytes[6h], 24*3600) < 0` alerts when a disk will be *full within 24 hours* based on the last 6 hours of data. Essential for **proactive capacity planning**."
  ],
  revisionNotes: [
    "**Metric Types**: *Counters* only go up (use `rate()`/`increase()`), *Gauges* go up and down (raw value is meaningful), *Histograms* use cumulative `le` buckets for percentile estimation (aggregatable), *Summaries* compute client-side quantiles (precise but **not aggregatable**).",
    "**RED for Services**: `Rate` = `rate(requests_total[5m])`, `Errors` = `sum(rate(errors[5m])) / sum(rate(total[5m]))`, `Duration` = `histogram_quantile(0.99, ...)`. Apply to *every service endpoint*. Maps directly to **user experience**.",
    "**USE for Infrastructure**: Check *Utilization* (% busy), *Saturation* (queue depth, swap), *Errors* (hardware errors) for **every resource** (CPU, memory, disk, network). USE finds the *root cause* that RED symptoms point to.",
    "**SLO Alerting**: Define `SLI` (what to measure) and `SLO` (target, e.g., 99.9%). Error budget = `1 - SLO`. Use **multi-burn-rate** alerts: *fast burn* (14.4x over 1h) pages immediately, *slow burn* (1x over 3d) creates tickets. This eliminates alert fatigue from *threshold-based* alerting.",
    "**Cardinality Management**: Each unique `{metric_name, label_values...}` combination is a separate *time series*. High cardinality = millions of series = **OOM crashes**. Audit with `prometheus_tsdb_head_series` and `topk(10, count by (__name__) ({__name__=~\".+\"}))`. Use `metric_relabel_configs` to drop unwanted labels at scrape time."
  ],
};
