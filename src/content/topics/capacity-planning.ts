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
};
