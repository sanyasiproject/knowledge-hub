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
};
