import type { TopicContent } from "../types";

export const capacityPlanning: TopicContent = {
  quickSummary: [
    "Capacity planning determines the resources needed to meet current and future demand while maintaining performance targets, balancing cost against headroom.",
    "Load testing (using tools like k6, Locust, or Gatling) establishes the system's performance baseline and breaking point under controlled synthetic traffic.",
    "Benchmarking isolates component performance (database queries, cache hit rates, API endpoints) to identify bottlenecks before they limit system-wide capacity.",
    "Growth modeling uses historical trends, business forecasts, and seasonal patterns to predict when current capacity will be exhausted.",
  ],
  detailed: [
    `## The Capacity Planning Process

Capacity planning is a continuous cycle, not a one-time exercise:

1. **Measure current state**: baseline throughput, latency percentiles, and resource utilization under normal and peak load.
2. **Model demand growth**: combine historical traffic trends with business forecasts (new markets, marketing campaigns, seasonal peaks).
3. **Identify bottlenecks**: determine which resource (CPU, memory, database connections, network bandwidth) will saturate first.
4. **Plan capacity additions**: decide how much headroom to maintain and when to provision additional resources.
5. **Validate with load tests**: confirm that planned capacity meets projected demand.
6. **Iterate**: re-evaluate quarterly or after significant architecture changes.

The goal is to avoid both under-provisioning (outages during traffic spikes) and over-provisioning (wasted infrastructure cost).`,

    `## Load Testing Strategies

| Type | Purpose | Traffic Pattern |
|------|---------|-----------------|
| Smoke test | Verify system works under minimal load | 1-5 users |
| Load test | Validate performance under expected peak | Normal peak traffic |
| Stress test | Find the breaking point | Ramp beyond expected peak |
| Soak test | Detect memory leaks and degradation | Sustained load for hours |
| Spike test | Test response to sudden traffic surges | Sharp ramp up and down |

Key practices:

- **Realistic scenarios**: replay production traffic patterns or model user journeys, not just hammer a single endpoint.
- **Production-like environment**: test against infrastructure that mirrors production (same instance types, database size, network topology).
- **Measure end-to-end**: capture latency at the client, not just server response time.
- **Watch for coordinated omission**: use open-loop load generators (wrk2, k6) that maintain request rate regardless of response time.
- **Automate**: run load tests in CI/CD to catch performance regressions early.`,

    `## Benchmarking Components

While load testing exercises the full system, benchmarking isolates individual components:

- **Database benchmarks**: measure query throughput, read/write latency, and connection pool exhaustion under concurrent load.
- **Cache benchmarks**: measure hit rates, eviction rates, and latency at different cache sizes.
- **Network benchmarks**: measure bandwidth, packet loss, and latency between services and availability zones.
- **Application benchmarks**: profile specific code paths (serialization, computation, I/O) to find optimization opportunities.

Tools: \`pgbench\` (PostgreSQL), \`redis-benchmark\`, \`iperf3\` (network), \`wrk\`/\`hey\` (HTTP endpoints), and language-specific microbenchmark frameworks (JMH for Java, BenchmarkDotNet for .NET).

Always benchmark with production-representative data volumes. A query that is fast on 1000 rows may be catastrophically slow on 10 million.`,

    `## Headroom and Growth Modeling

**Headroom** is the buffer between current peak usage and provisioned capacity. Industry practice:

- **20-30% headroom** for predictable workloads with auto-scaling.
- **50%+ headroom** for workloads with unpredictable spikes or slow scaling (databases, stateful services).

**Growth modeling** approaches:

- **Linear extrapolation**: simple trend line from historical data. Works for steady-state growth.
- **Exponential modeling**: for rapidly growing products. Use doubling time as the planning horizon.
- **Event-driven**: overlay known events (product launches, marketing campaigns, Black Friday) onto baseline projections.
- **Regression analysis**: correlate traffic with business metrics (active users, orders) for more accurate forecasting.

**Capacity runway**: the time until current resources are exhausted at projected growth rates. Maintain at least 3-6 months of runway for resources that require long lead times (hardware procurement, database migrations).`,

    `## Auto-scaling and Cost Optimization

Auto-scaling does not eliminate capacity planning — it changes the planning focus from "how many servers" to "what are the scaling limits and costs."

Considerations:

- **Scaling speed**: how quickly can new instances become healthy? If boot + warm-up takes 5 minutes, you need enough headroom to absorb 5 minutes of traffic growth.
- **Scaling limits**: cloud accounts have quotas (instance limits, IP addresses, load balancer targets). Know these limits and request increases proactively.
- **Cost modeling**: project monthly cost at different traffic levels. Auto-scaling can lead to surprise bills during traffic spikes.
- **Stateful components**: databases, caches, and message queues often cannot auto-scale horizontally. These become the binding constraint.
- **Scaling policies**: scale out aggressively (respond quickly to demand) and scale in conservatively (avoid flapping during variable load).

Reserved instances and savings plans reduce cost for baseline capacity; auto-scaling handles the variable portion on top.`,
  ],
  interviewQA: [
    {
      q: "How would you approach capacity planning for a new product launch expected to 10x traffic?",
      a: "First, establish current baselines through load testing: throughput, latency percentiles, and resource utilization at current peak. Then identify the binding constraint — the component that will saturate first (usually database or a stateful service). Load test to 10x current peak to validate which components fail and at what point. For horizontally scalable components, provision with 30% headroom above 10x. For databases, consider read replicas, caching layers, or pre-sharding. Set up auto-scaling with policies tuned for rapid scale-out. During the launch, monitor in real-time with pre-built dashboards and have rollback plans ready.",
    },
    {
      q: "What is the difference between load testing and stress testing?",
      a: "Load testing validates that the system meets performance requirements under expected peak traffic — it answers 'can we handle our busiest day?' Stress testing pushes beyond expected peak to find the breaking point — it answers 'where does the system fail, and how does it fail?' Load testing should show all SLOs being met. Stress testing should reveal graceful degradation (shedding load, returning errors) rather than catastrophic failure (crashes, data corruption). Both are essential: load testing for confidence, stress testing for risk assessment.",
    },
    {
      q: "Why does auto-scaling not eliminate the need for capacity planning?",
      a: "Auto-scaling addresses the variable portion of demand but has limitations that require planning: scaling speed (new instances need boot and warm-up time, creating a gap during sudden spikes), cloud quotas (instance limits, IP exhaustion), cost unpredictability (spike-driven bills can be enormous), and stateful components (databases and caches often cannot auto-scale horizontally). Capacity planning shifts from 'how many servers' to understanding scaling limits, ensuring sufficient headroom for scaling lag, planning stateful component capacity, and modeling costs across traffic scenarios.",
    },
  ],
  mcqs: [
    {
      q: "Which type of load test is specifically designed to detect memory leaks?",
      options: ["Spike test", "Stress test", "Soak test", "Smoke test"],
      answerIndex: 2,
      explanation:
        "Soak tests (also called endurance tests) run sustained load for hours or days to detect gradual degradation like memory leaks, connection pool exhaustion, or log file growth.",
    },
    {
      q: "What is capacity runway?",
      options: [
        "The maximum throughput of a system",
        "The time until current resources are exhausted at projected growth rates",
        "The number of servers in a cluster",
        "The network bandwidth between data centers",
      ],
      answerIndex: 1,
      explanation:
        "Capacity runway is the estimated time until current provisioned resources can no longer handle projected traffic growth, helping teams plan procurements and migrations proactively.",
    },
    {
      q: "Why should auto-scaling scale out aggressively but scale in conservatively?",
      options: [
        "To minimize cloud costs",
        "To prevent flapping during variable load while responding quickly to demand spikes",
        "To reduce deployment complexity",
        "To maintain consistent instance counts",
      ],
      answerIndex: 1,
      explanation:
        "Aggressive scale-out ensures capacity is added quickly during demand spikes. Conservative scale-in prevents repeatedly removing and re-adding instances during normal traffic variability (flapping), which wastes time and resources.",
    },
    {
      q: "What headroom percentage is recommended for stateful services with unpredictable spikes?",
      options: ["5-10%", "10-15%", "20-30%", "50% or more"],
      answerIndex: 3,
      explanation:
        "Stateful services (databases, caches) are difficult or slow to scale horizontally, so 50%+ headroom is recommended to absorb unpredictable spikes without immediate capacity additions.",
    },
  ],
  flashcards: [
    {
      front: "What are the five types of load tests?",
      back: "Smoke (minimal load verification), Load (expected peak), Stress (beyond peak to find breaking point), Soak (sustained load for hours to detect leaks), Spike (sudden traffic surges).",
    },
    {
      front: "What is capacity runway?",
      back: "The estimated time until current resources are exhausted at projected growth rates. Teams should maintain 3-6 months of runway for resources with long provisioning lead times.",
    },
    {
      front: "What does headroom mean in capacity planning?",
      back: "The buffer between current peak usage and provisioned capacity. Typically 20-30% for auto-scalable workloads and 50%+ for stateful services.",
    },
    {
      front: "Why benchmark with production-representative data volumes?",
      back: "Performance characteristics change dramatically with data size. A query fast on 1000 rows may be catastrophically slow on 10 million due to index misses, cache overflow, or plan changes.",
    },
    {
      front: "What is the key limitation of auto-scaling?",
      back: "Scaling lag: new instances need boot + warm-up time. The system must have enough headroom to absorb traffic growth during this lag. Also, stateful components often cannot auto-scale.",
    },
    {
      front: "Name three load testing tools.",
      back: "k6 (JavaScript scripting, open-source), Locust (Python, distributed), Gatling (Scala/Java, CI-friendly). All support open-loop load generation to avoid coordinated omission.",
    },
    {
      front: "What is the recommended auto-scaling strategy?",
      back: "Scale out aggressively (respond quickly to demand) and scale in conservatively (avoid flapping). Use reserved instances for baseline capacity and auto-scaling for the variable portion.",
    },
  ],
  glossary: [
    {
      term: "Capacity Planning",
      definition:
        "The process of determining the resources needed to meet current and future demand while maintaining performance targets and cost efficiency.",
    },
    {
      term: "Load Testing",
      definition:
        "Exercising a system under expected peak traffic conditions to validate that performance requirements (latency, throughput, error rate) are met.",
    },
    {
      term: "Stress Testing",
      definition:
        "Pushing a system beyond expected peak load to find the breaking point and observe how it degrades under extreme conditions.",
    },
    {
      term: "Headroom",
      definition:
        "The buffer of unused capacity between current peak usage and provisioned resources, providing a safety margin for unexpected demand.",
    },
    {
      term: "Capacity Runway",
      definition:
        "The estimated time until current provisioned resources are exhausted at projected growth rates.",
    },
    {
      term: "Soak Test",
      definition:
        "A load test that runs sustained traffic for hours or days to detect gradual degradation such as memory leaks or connection pool exhaustion.",
    },
    {
      term: "Growth Modeling",
      definition:
        "The practice of projecting future traffic demand using historical trends, business forecasts, and seasonal patterns to inform capacity decisions.",
    },
  ],

  deepDive: [
    `**Capacity planning at hyperscale** is a discipline that separates *resilient* global platforms from those that crumble under growth. Companies like **Google** use the **Borg** cluster manager to perform *bin-packing* — fitting workloads onto machines like a three-dimensional puzzle of CPU, memory, and disk — achieving utilization rates above **60%** while maintaining strict **resource quotas** per team. **Amazon** employs *cell-based architecture*, isolating blast radius so that capacity exhaustion in one cell cannot cascade. **Netflix** pioneered *chaos engineering* alongside capacity planning, using tools like \`Chaos Monkey\` to validate that capacity buffers survive real-world failure modes. At this scale, capacity planning becomes a *statistical* exercise: you are not planning for a single server but for **probability distributions** across thousands of machines, where even a 0.1% tail event affects millions of users.`,

    `**Advanced load testing** goes far beyond running a simple script against an endpoint. *Distributed load generation* — coordinating hundreds of load generators across multiple regions using tools like \`k6 Cloud\`, \`Locust\` in distributed mode, or **Gatling Enterprise** — is essential for simulating realistic global traffic patterns. **Traffic replay** from production logs (using tools like \`GoReplay\` or \`Shadowtraffic\`) captures the *actual distribution* of request types, sizes, and timing that synthetic tests miss. The **coordinated omission problem**, first described by *Gil Tene*, occurs when load generators *slow down* their request rate as the system under test slows down, producing \`artificially optimistic\` latency measurements. Tools like \`wrk2\` and \`k6\` use *open-loop* designs that maintain constant request rate regardless of response time. Integrating **performance regression detection** into CI — comparing p99 latency and throughput against baselines with statistical significance tests — catches degradations *before* they reach production.`,

    `**Cost-capacity optimization** bridges capacity planning with **FinOps** principles, treating infrastructure spend as a *first-class engineering metric*. **Right-sizing recommendations** from tools like \`AWS Compute Optimizer\`, \`Google Recommender\`, or open-source \`Goldilocks\` analyze actual resource consumption versus provisioned capacity, often finding **30-50% overprovisioning**. For load testing environments, *spot instances* and **preemptible VMs** can reduce costs by **60-90%** — the ephemeral nature of load tests makes them ideal candidates. **Serverless capacity planning** shifts the focus from instance counts to *concurrency limits*, \`cold start\` latency budgets, and per-invocation cost modeling. **Edge computing** adds another dimension: capacity must be planned per *point of presence* (PoP), balancing the cost of edge nodes against latency reduction. The goal is a **capacity-cost curve** — understanding exactly how much each additional unit of capacity costs at different scale points, enabling *informed* trade-off decisions between performance, reliability, and spend.`,
  ],

  code: [
    {
      language: "javascript",
      caption: "k6 load test script with **staged ramp-up**, *thresholds*, and `custom metrics`",
      source: `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for capacity analysis
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration', true);

export const options = {
  // Staged ramp-up simulates realistic traffic growth
  stages: [
    { duration: '2m', target: 100 },   // Ramp to 100 VUs
    { duration: '5m', target: 100 },   // Hold at 100 VUs (baseline)
    { duration: '3m', target: 500 },   // Ramp to 500 VUs (peak)
    { duration: '5m', target: 500 },   // Hold at peak
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<1000'],  // Latency SLOs
    errors: ['rate<0.01'],                             // <1% error rate
    api_duration: ['avg<200', 'p(90)<400'],
  },
};

export default function () {
  const res = http.get('https://api.example.com/products', {
    headers: { 'Authorization': 'Bearer \${__ENV.API_TOKEN}' },
    tags: { endpoint: 'products' },
  });

  apiDuration.add(res.timings.duration);
  errorRate.add(res.status >= 400);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
    'body contains data': (r) => r.json().data !== undefined,
  });

  sleep(Math.random() * 3 + 1); // Realistic think time
}`,
    },
    {
      language: "hcl",
      caption: "Terraform **auto-scaling policy** with *predictive scaling* and `target tracking`",
      source: `resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  min_size            = 2
  max_size            = 50
  desired_capacity    = 4
  vpc_zone_identifier = var.private_subnet_ids
  health_check_type   = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Scale out aggressively, scale in conservatively
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 80
    }
  }
}

# Target tracking: maintain 60% average CPU
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value     = 60.0
    scale_in_cooldown  = 300  # Conservative scale-in (5 min)
    scale_out_cooldown = 60   # Aggressive scale-out (1 min)
  }
}

# Predictive scaling based on historical patterns
resource "aws_autoscaling_policy" "predictive" {
  name                   = "predictive-scaling"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "PredictiveScaling"

  predictive_scaling_configuration {
    metric_specification {
      target_value = 60
      predefined_load_metric_specification {
        predefined_metric_type = "ASGTotalCPUUtilization"
        resource_label         = "app-production"
      }
      predefined_scaling_metric_specification {
        predefined_metric_type = "ASGAverageCPUUtilization"
      }
    }
    mode                          = "ForecastAndScale"
    scheduling_buffer_time        = 300
  }
}`,
    },
    {
      language: "cpp",
      caption: "**Capacity runway calculator** with *growth modeling* and `exhaustion date` forecasting",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <iomanip>
#include <sstream>
#include <ctime>
#include <limits>

struct CapacityMetrics {
    std::string resource_name;
    double current_usage;   // e.g., 3500 RPS
    double max_capacity;    // e.g., 5000 RPS
    std::string unit;       // e.g., "RPS", "GB", "connections"
};

struct DataPoint {
    int day_offset;   // days since first measurement
    double value;
};

// Simple linear regression: fits y = m*x + c using least squares
struct LinFit { double m; double c; };

LinFit linear_fit(const std::vector<DataPoint>& pts) {
    double sx = 0, sy = 0, sxx = 0, sxy = 0;
    int n = static_cast<int>(pts.size());
    for (auto& p : pts) {
        sx  += p.day_offset;
        sy  += p.value;
        sxx += p.day_offset * p.day_offset;
        sxy += p.day_offset * p.value;
    }
    double denom = n * sxx - sx * sx;
    double m = (n * sxy - sx * sy) / denom;
    double c = (sy - m * sx) / n;
    return {m, c};
}

struct RunwayResult {
    std::string resource;
    double utilization_pct;
    double effective_capacity;
    std::string unit;
    int runway_days;
    std::string exhaust_date;
    std::string growth_model;
    double daily_growth_rate;
    std::string recommendation;
};

// Format a std::tm as YYYY-MM-DD
std::string format_date(std::tm t) {
    char buf[11];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d", &t);
    return buf;
}

RunwayResult calculate_runway(
    const CapacityMetrics& metrics,
    const std::vector<DataPoint>& history,
    const std::tm& last_date,
    const std::string& growth_model = "linear",
    double headroom_pct = 0.20)
{
    double effective_cap = metrics.max_capacity * (1.0 - headroom_pct);

    double days_to_exhaust = 0;
    double daily_growth = 0;

    if (growth_model == "exponential") {
        // Fit log(value) = b*day + log_a  =>  value = a * e^(b*day)
        std::vector<DataPoint> log_pts;
        for (auto& p : history)
            log_pts.push_back({p.day_offset, std::log(p.value + 1)});
        auto [b, log_a] = linear_fit(log_pts);
        double a = std::exp(log_a);
        if (b <= 0) {
            RunwayResult r;
            r.runway_days = std::numeric_limits<int>::max();
            r.growth_model = "no growth";
            return r;
        }
        days_to_exhaust = std::log(effective_cap / a) / b;
        daily_growth = (std::exp(b) - 1.0) * 100.0;
    } else {
        auto [m, c] = linear_fit(history);
        if (m <= 0) {
            RunwayResult r;
            r.runway_days = std::numeric_limits<int>::max();
            r.growth_model = "no growth";
            return r;
        }
        days_to_exhaust = (effective_cap - c) / m;
        daily_growth = m;
    }

    int last_day = history.back().day_offset;
    int remaining = std::max(0, static_cast<int>(std::round(days_to_exhaust - last_day)));

    // Compute exhaust date
    std::tm exhaust = last_date;
    std::time_t t = std::mktime(&exhaust);
    t += remaining * 86400;
    std::tm* ed = std::localtime(&t);

    double utilization = metrics.current_usage / metrics.max_capacity * 100.0;
    std::string rec = remaining < 30  ? "CRITICAL: < 30 days runway"
                    : remaining < 90  ? "WARNING: < 90 days runway"
                    :                   "OK: sufficient runway";

    return {
        metrics.resource_name, utilization, effective_cap, metrics.unit,
        remaining, format_date(*ed), growth_model, daily_growth, rec
    };
}

int main() {
    // Historical usage data (day_offset from Jan 1, value)
    std::vector<DataPoint> history = {
        {0,   2000},   // Jan 1
        {31,  2300},   // Feb 1
        {59,  2650},   // Mar 1
        {90,  3100},   // Apr 1
        {120, 3500},   // May 1
    };
    std::tm last_date = {};
    last_date.tm_year = 2025 - 1900; last_date.tm_mon = 4; last_date.tm_mday = 1;

    CapacityMetrics metrics{"API Gateway", 3500, 5000, "RPS"};
    auto r = calculate_runway(metrics, history, last_date, "exponential");

    std::cout << "  resource: "            << r.resource            << "\\n"
              << "  current_utilization: "  << std::fixed << std::setprecision(1)
                                            << r.utilization_pct << "%\\n"
              << "  effective_capacity: "   << std::setprecision(0)
                                            << r.effective_capacity << " " << r.unit << "\\n"
              << "  runway_days: "          << r.runway_days         << "\\n"
              << "  exhaust_date: "         << r.exhaust_date        << "\\n"
              << "  growth_model: "         << r.growth_model        << "\\n"
              << "  daily_growth_rate: "    << std::setprecision(2)
                                            << r.daily_growth_rate   << "\\n"
              << "  recommendation: "       << r.recommendation      << "\\n";
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "Capacity Planning Cycle",
      kind: "flow",
      caption: "The continuous capacity planning cycle from measurement through validation, ensuring infrastructure stays ahead of demand.",
      mermaid: `flowchart TD
    A["Measure Baselines"] --> B["Forecast Demand"]
    B --> C["Identify Bottlenecks"]
    C --> D["Plan Additions"]
    D --> E["Load Test"]
    E --> F{"SLOs Met?"}
    F -->|Yes| G["Deploy and Monitor"]
    F -->|No| H["Optimize"]
    H --> D
    G --> I["Quarterly Review"]
    I --> A`,
    },
    {
      title: "Auto-Scaling Architecture",
      kind: "architecture",
      caption: "Production auto-scaling architecture showing the relationship between stateless compute tiers and stateful data tiers.",
      mermaid: `graph LR
    subgraph Traffic["Traffic Layer"]
        CDN["CDN"]
        LB["Load Balancer"]
    end
    subgraph Compute["Stateless Tier"]
        ASG["Auto Scaling Group"]
        A1["Instance 1"]
        A2["Instance 2"]
        A3["Instance N"]
    end
    subgraph Data["Stateful Tier"]
        DB["Primary DB"]
        CACHE["Redis Cache"]
        QUEUE["Message Queue"]
    end
    subgraph Metrics["Scaling Engine"]
        MON["Metrics Collector"]
        POL["Scaling Policy"]
    end
    CDN --> LB --> ASG
    ASG --> A1 & A2 & A3
    A1 & A2 & A3 --> DB & CACHE & QUEUE
    MON --> POL --> ASG`,
    },
    {
      title: "Resource Utilization State Machine",
      kind: "state",
      caption: "State transitions for a resource pool as utilization crosses warning and critical thresholds.",
      mermaid: `stateDiagram-v2
    [*] --> Normal
    Normal --> Warning : utilization > 70%
    Warning --> Critical : utilization > 85%
    Critical --> Emergency : utilization > 95%
    Warning --> Normal : scale out succeeds
    Critical --> Warning : scale out succeeds
    Emergency --> Critical : emergency capacity added
    Emergency --> Incident : SLO breached`,
    },
    {
      title: "Capacity Estimation Process",
      kind: "sequence",
      caption: "Sequence of interactions between teams when performing a formal capacity estimation exercise.",
      mermaid: `sequenceDiagram
    participant PM as Product
    participant Eng as Engineering
    participant Ops as SRE/Ops
    participant Infra as Infrastructure
    PM->>Eng: Share growth forecast
    Eng->>Ops: Request baseline metrics
    Ops-->>Eng: Current RPS, latency, utilization
    Eng->>Eng: Model demand scenarios
    Eng->>Infra: Submit capacity request
    Infra-->>Eng: Cost estimate and timeline
    Eng->>PM: Confirm runway and budget
    Ops->>Infra: Execute provisioning
    Infra-->>Ops: Resources ready
    Ops->>Ops: Validate with load tests`,
    },
  ],

  comparison: {
    columns: [
      "Tool",
      "Language",
      "Protocol Support",
      "Distributed Mode",
      "Cloud Integration",
      "Best For",
    ],
    rows: [
      [
        "**k6**",
        "*JavaScript* / TypeScript",
        "HTTP, WebSocket, gRPC, `SQL`",
        "Built-in via `k6 Cloud` or Kubernetes operator",
        "Grafana Cloud, **AWS**, Azure, GCP",
        "Developer-centric load testing with *CI/CD integration*",
      ],
      [
        "**Locust**",
        "*Python*",
        "HTTP (extensible to any protocol)",
        "Built-in **master/worker** architecture",
        "Any cloud via `Docker` / Kubernetes",
        "Teams with *Python* expertise needing **custom protocols**",
      ],
      [
        "**Gatling**",
        "*Scala* / Java / Kotlin",
        "HTTP, WebSocket, `JMS`, MQTT",
        "**Gatling Enterprise** for distributed runs",
        "Gatling Cloud, CI/CD pipelines",
        "JVM teams needing *detailed HTML reports* and **CI integration**",
      ],
      [
        "**JMeter**",
        "*Java* (GUI + XML)",
        "HTTP, FTP, JDBC, `LDAP`, SOAP, JMS",
        "Built-in **remote testing** via RMI",
        "BlazeMeter, Azure Load Testing",
        "*Protocol diversity* and teams preferring **GUI-based** test design",
      ],
      [
        "**wrk2**",
        "*C* (Lua scripting)",
        "HTTP only",
        "Manual (multiple instances)",
        "None (self-hosted)",
        "**Precise latency measurement** with *constant-rate* load (avoids coordinated omission)",
      ],
      [
        "**Artillery**",
        "*JavaScript* / YAML",
        "HTTP, WebSocket, `Socket.io`, gRPC",
        "**Artillery Cloud** or `AWS Lambda`-based",
        "AWS Lambda, Artillery Cloud",
        "*Serverless* distributed load testing with **YAML-first** configuration",
      ],
    ],
  },

  exercises: [
    "**Run a staged load test** using `k6` against a sample API: configure a *ramp-up* from 10 to 200 virtual users over 5 minutes, set **p95 latency < 500ms** and *error rate < 1%* thresholds, then analyze the results to identify the **saturation point** where latency begins to degrade.",
    "**Calculate the capacity runway** for a service currently handling *8,000 RPS* with a provisioned capacity of *12,000 RPS*, given monthly traffic growth of **12%**. Determine the *exhaustion date*, recommended **headroom buffer**, and the date by which new capacity must be ordered assuming a 6-week procurement lead time.",
    "**Design an auto-scaling policy** for a web application tier: define *target tracking* metrics (CPU, request count, custom metrics), set **scale-out** and *scale-in* cooldown periods, configure `predictive scaling` based on weekly traffic patterns, and calculate the **cost differential** between reserved and on-demand instances at baseline vs. peak.",
    "**Benchmark a PostgreSQL database** using `pgbench`: initialize with a *scale factor* matching production data volume, run read-heavy and write-heavy workloads, measure **TPS**, *latency percentiles*, and `connection pool` saturation, then determine the maximum number of application instances the database can support.",
    "**Create a 12-month growth model** for a SaaS platform using *three scenarios* (conservative: **10%** monthly growth, expected: **20%**, aggressive: **35%**). For each scenario, calculate the *capacity runway* for compute, database, and cache tiers, and produce a **FinOps budget forecast** showing monthly infrastructure spend.",
  ],

  cheatSheet: [
    "**Utilization formula**: `utilization = (current_usage / max_capacity) * 100%` — target **< 70%** for stateless, **< 50%** for stateful services",
    "**Capacity runway**: `runway_days = (effective_capacity - current_usage) / daily_growth_rate` — maintain **> 90 days** for critical resources",
    "**Little's Law**: `L = λ × W` — *concurrent requests* (L) = *arrival rate* (λ) × *average response time* (W) — essential for connection pool sizing",
    "**Headroom targets**: *20-30%* for auto-scalable stateless tiers, **50%+** for databases and stateful services, `100%+` (N+1 redundancy) for single points of failure",
    "**k6 quick commands**: `k6 run script.js` (local), `k6 cloud script.js` (distributed), `k6 run --vus 100 --duration 5m script.js` (*quick stress test*)",
    "**Auto-scaling rule of thumb**: scale **out** at *60% CPU* with **60s cooldown**, scale *in* at *30% CPU* with `300s cooldown` — aggressive out, conservative in",
  ],

  revisionNotes: [
    "**Capacity planning is continuous**, not a one-time exercise — the cycle of *measure → model → plan → validate → deploy → review* repeats **quarterly** or after significant architecture changes. Always distinguish between **stateless** tiers (horizontally auto-scalable) and *stateful* tiers (databases, caches) that require **manual capacity planning** with longer lead times.",
    "**Load testing types** form a progression: *smoke* (verify basic function), **load** (validate at expected peak), *stress* (find breaking point), **soak** (detect memory leaks over hours), *spike* (test sudden surges). The **coordinated omission problem** is a critical concept — use `open-loop` generators like *k6* or *wrk2* that maintain constant request rate regardless of server response time.",
    "**Headroom and runway** are the two key planning metrics. *Headroom* is the buffer between current peak and provisioned capacity (**20-30%** for auto-scalable, **50%+** for stateful). *Runway* is the time until exhaustion at projected growth. Use **Little's Law** (`L = λ × W`) for connection pool and concurrency calculations — it appears frequently in *system design interviews*.",
    "**Cost-capacity optimization** ties capacity planning to **FinOps**: use *right-sizing tools* to eliminate overprovisioning (typically **30-50%** waste), leverage `spot instances` for load testing environments, and build a **capacity-cost curve** showing the marginal cost of each additional unit of capacity. For *serverless*, plan around **concurrency limits** and *cold start* budgets rather than instance counts.",
  ],
};
