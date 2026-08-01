import type { TopicContent } from "../types";

export const sliSloSla: TopicContent = {
  quickSummary: [
    "An SLI (Service Level Indicator) is a quantitative measure of a specific aspect of service quality, such as request latency, availability, or error rate.",
    "An SLO (Service Level Objective) sets a target value or range for an SLI over a time window, like 99.9% availability over 30 days.",
    "An SLA (Service Level Agreement) is a contractual commitment with consequences (credits, penalties) if SLOs are not met, typically between a provider and customer.",
    "Error budgets quantify how much unreliability is allowed within an SLO, enabling teams to balance feature velocity against reliability investment.",
  ],
  detailed: [
    `## SLIs: Measuring What Matters

An SLI is a carefully defined metric that captures user-facing service quality. Good SLIs share these properties:

- **User-centric**: measure what users experience, not internal system health.
- **Ratio-based**: expressed as good events / total events (e.g., successful requests / all requests).
- **Bounded**: values between 0% and 100%, making them easy to reason about.

Common SLI types:

| Category | SLI | Measurement |
|----------|-----|-------------|
| Availability | Success rate | Non-5xx responses / total responses |
| Latency | Speed | Requests served < 200ms / total requests |
| Quality | Correctness | Responses with valid data / total responses |
| Freshness | Data age | Queries returning data < 1 min old / total queries |

The measurement point matters: an SLI measured at the load balancer captures user experience more accurately than one measured inside the application server.`,

    `## SLOs: Setting Targets

An SLO combines an SLI with a target and a time window:

> "99.9% of requests will return a non-error response within 200ms, measured over a rolling 30-day window."

Key principles for setting SLOs:

- **Start with user expectations**, not engineering aspirations. If users do not notice when availability drops from 99.99% to 99.9%, do not target 99.99%.
- **Use multiple SLOs** per service: one for availability, one for latency, possibly one for data freshness.
- **Choose the right window**: rolling windows (30 days) are more operationally useful than calendar-aligned windows because they prevent end-of-month cliffs.
- **Make them achievable**: an SLO you consistently miss provides no signal. Set it at a level where breaching it genuinely indicates a problem.

SLOs are internal targets. They should be slightly stricter than any external SLA to provide a buffer.`,

    `## SLAs: Contractual Commitments

An SLA is a business agreement that attaches consequences to SLO violations:

- **Service credits**: e.g., 10% credit if monthly availability drops below 99.9%.
- **Penalty tiers**: escalating credits or contract exit clauses at lower availability levels.
- **Exclusions**: planned maintenance windows, force majeure, and customer-caused outages are typically excluded.

SLAs are negotiated between provider and customer, often by business teams, not engineers. The engineering team's job is to set internal SLOs that are tighter than the SLA, creating a safety margin.

Example: If the SLA promises 99.9% availability (43 minutes of downtime per month), the internal SLO might target 99.95% (21 minutes), giving the team a buffer before financial penalties kick in.`,

    `## Error Budgets and Burn Rate

The **error budget** is the inverse of the SLO target: if the SLO is 99.9%, the error budget is 0.1% of total requests over the window. This budget can be "spent" on:

- Planned maintenance and deployments.
- Unplanned incidents.
- Experimentation and risky feature launches.

**Burn rate** measures how fast the error budget is being consumed relative to the window:

- Burn rate = 1: budget will be exactly exhausted at window end.
- Burn rate = 10: budget will be exhausted in 1/10th of the window (3 days of a 30-day window).

**Multi-window burn rate alerts** are the recommended alerting strategy:

| Alert | Long window | Short window | Burn rate | Catches |
|-------|-------------|--------------|-----------|---------|
| Page  | 1 hour      | 5 minutes    | 14.4x     | Severe, fast-burning incidents |
| Page  | 6 hours     | 30 minutes   | 6x        | Moderate, sustained incidents |
| Ticket| 3 days      | 6 hours      | 1x        | Slow, steady degradation |

This approach avoids both alert fatigue (from threshold-based alerts) and delayed detection (from budget-only alerts).`,

    `## Putting It All Together

A mature SLI/SLO practice involves:

1. **Define SLIs** based on critical user journeys (login, checkout, search).
2. **Set SLOs** collaboratively between engineering and product, grounded in user expectations.
3. **Implement error budget tracking** with dashboards showing remaining budget.
4. **Configure burn rate alerts** that page for fast burns and ticket for slow ones.
5. **Establish error budget policy**: when budget is exhausted, freeze feature work and prioritize reliability until budget recovers.
6. **Review quarterly**: adjust SLOs based on changing user expectations, system maturity, and business needs.

The error budget policy is the cultural mechanism that makes SLOs actionable. Without it, SLOs are just dashboards that engineers glance at and ignore.`,
  ],
  interviewQA: [
    {
      q: "Explain the relationship between SLIs, SLOs, and SLAs with a concrete example.",
      a: "Consider a payment processing API. The SLI is the success rate: non-5xx responses divided by total responses, measured at the load balancer. The SLO is the internal target: 99.95% success rate over a rolling 30-day window. The SLA is the customer-facing contract: 99.9% availability per calendar month, with 10% service credits if breached. The SLO is intentionally tighter than the SLA to create a safety buffer before contractual penalties apply.",
    },
    {
      q: "What is an error budget and how does it influence engineering decisions?",
      a: "An error budget is the amount of unreliability permitted by an SLO. For a 99.9% SLO over 30 days, the error budget is 0.1% of requests or roughly 43 minutes of downtime. When budget is ample, teams can deploy frequently and take risks. When budget is nearly exhausted, teams should freeze risky changes and focus on reliability. This creates a data-driven mechanism for balancing feature velocity and reliability without subjective arguments.",
    },
    {
      q: "How would you set up burn rate alerting for an SLO?",
      a: "Use multi-window burn rate alerts. A short window (5 minutes) combined with a long window (1 hour) at a high burn rate (14.4x) pages for severe, fast-burning incidents. A medium pair (30 min / 6 hours at 6x) catches sustained degradation. A slow pair (6 hours / 3 days at 1x) creates tickets for gradual budget erosion. This layered approach avoids alert fatigue from simple threshold alerts while catching both acute and chronic issues.",
    },
    {
      q: "Why should SLOs be based on user experience rather than system metrics?",
      a: "System metrics like CPU utilization or queue depth are indirect proxies that do not always correlate with user-perceived quality. A server at 90% CPU might be serving requests perfectly; a server at 10% CPU might be returning stale data. User-centric SLIs (success rate, latency at the edge) directly measure what matters. This also aligns engineering priorities with business outcomes: improving an SLI that users do not notice is wasted effort.",
    },
  ],
  mcqs: [
    {
      q: "If an SLO targets 99.9% availability over 30 days, what is the error budget in minutes?",
      options: [
        "4.3 minutes",
        "43.2 minutes",
        "432 minutes",
        "8.6 minutes",
      ],
      answerIndex: 1,
      explanation:
        "30 days = 43,200 minutes. 0.1% error budget = 43,200 * 0.001 = 43.2 minutes of allowed downtime.",
    },
    {
      q: "What does a burn rate of 10 mean?",
      options: [
        "The service has 10% error rate",
        "The error budget will be exhausted in 1/10th of the SLO window",
        "10 alerts have been fired",
        "The service needs 10x more capacity",
      ],
      answerIndex: 1,
      explanation:
        "A burn rate of 10 means the error budget is being consumed 10 times faster than the sustainable rate, so a 30-day budget would be exhausted in 3 days.",
    },
    {
      q: "Where is the best place to measure an availability SLI?",
      options: [
        "Inside the application server",
        "At the database layer",
        "At the load balancer or edge proxy",
        "In the CI/CD pipeline",
      ],
      answerIndex: 2,
      explanation:
        "Measuring at the load balancer or edge captures user-facing experience including network issues and server crashes that internal metrics would miss.",
    },
    {
      q: "What is the purpose of an error budget policy?",
      options: [
        "To define SLA penalties for customers",
        "To set thresholds for auto-scaling",
        "To specify actions when error budget is exhausted, such as freezing feature work",
        "To calculate the cost of infrastructure",
      ],
      answerIndex: 2,
      explanation:
        "An error budget policy defines what happens when budget is low or exhausted — typically freezing risky deployments and prioritizing reliability work until the budget recovers.",
    },
  ],
  flashcards: [
    {
      front: "What is an SLI?",
      back: "A Service Level Indicator — a quantitative measure of service quality, typically expressed as a ratio of good events to total events (e.g., successful requests / total requests).",
    },
    {
      front: "What is an SLO?",
      back: "A Service Level Objective — a target value for an SLI over a time window (e.g., 99.9% success rate over 30 days). It is an internal reliability goal.",
    },
    {
      front: "What is an SLA?",
      back: "A Service Level Agreement — a contractual commitment to a customer with financial consequences (credits, penalties) if specified service levels are not met.",
    },
    {
      front: "How is an error budget calculated?",
      back: "Error budget = 1 - SLO target. For a 99.9% SLO, the error budget is 0.1% of total requests or time in the measurement window.",
    },
    {
      front: "What is burn rate in SLO alerting?",
      back: "The rate at which the error budget is being consumed relative to the window. Burn rate 1 = budget exhausted at window end. Burn rate 10 = budget exhausted in 1/10th of the window.",
    },
    {
      front: "Why set SLOs tighter than SLAs?",
      back: "To create a safety buffer. If the SLA promises 99.9% and the SLO targets 99.95%, the team gets early warning before financial penalties kick in.",
    },
    {
      front: "What are the four common SLI categories?",
      back: "Availability (success rate), Latency (response speed), Quality/Correctness (valid data), and Freshness (data recency).",
    },
  ],
  deepDive: [
    `## The Mathematics Behind Error Budgets and Burn Rates

Error budgets transform **abstract reliability targets** into *concrete, actionable numbers*. For a service handling **10 million requests per day** with a **99.9% SLO**, the error budget is \`10,000,000 * 0.001 = 10,000\` failed requests per day, or \`300,000\` over a **30-day rolling window**. The *burn rate* normalizes consumption against this budget: if \`15,000\` requests fail in a single day, the burn rate is \`15,000 / 10,000 = 1.5x\`, meaning the budget will be exhausted in \`30 / 1.5 = 20 days\` at that pace. **Multi-window burn rate alerting** layers a *short detection window* (e.g., 5 minutes) inside a *long confirmation window* (e.g., 1 hour) — the short window provides **fast detection**, while the long window suppresses **false positives** from transient spikes. The recommended burn rates for paging alerts (\`14.4x\` and \`6x\`) are derived from the formula \`burn_rate = (1 / fraction_of_window)\` where the fraction represents how quickly the budget would be fully consumed.`,

    `## SLI Specification vs. SLI Implementation

A critical but often overlooked distinction is between the **SLI specification** and the **SLI implementation**. The *specification* defines *what* you are measuring in user-centric terms: "the proportion of requests that load the homepage in under 300ms as experienced by the end user." The *implementation* defines *how* you measure it: perhaps from \`nginx\` access logs, a **Prometheus histogram**, or **Real User Monitoring (RUM)** beacons. The same specification can have multiple valid implementations with different trade-offs. Load balancer logs are **cheap and reliable** but miss client-side rendering time. RUM captures the *true user experience* but introduces **sampling bias** and **data pipeline latency**. Synthetic monitoring provides **consistent baselines** but does not reflect real traffic patterns. Mature organizations often start with *server-side SLIs* for operational alerting and layer on **client-side SLIs** for product-quality tracking, treating them as complementary rather than competing signals.`,

    `## Organizational Dynamics: Error Budget Policies and SLO Culture

The most technically sound SLO framework will fail without **organizational buy-in** and a well-defined *error budget policy*. This policy is a **written agreement** between engineering, product, and leadership that specifies exactly what happens at different budget thresholds. At **50% remaining**, the team might increase \`code review rigor\` and delay risky migrations. At **20% remaining**, feature freezes may begin. At **0%**, all engineering effort shifts to reliability until the budget recovers. The policy must have **executive sponsorship** — without it, product managers will pressure engineers to ship features despite exhausted budgets, undermining the entire system. Equally important is the *quarterly SLO review*: teams examine whether SLOs are too tight (causing excessive engineering burden with no user-visible benefit), too loose (allowing degradation users actually notice), or just right. **Google's SRE teams** recommend that SLOs should be *aspirational but achievable* — breached occasionally but not routinely, triggering meaningful action rather than alert fatigue or learned helplessness.`,
  ],
  code: [
    {
      language: "promql",
      caption: "Prometheus queries for SLI measurement and burn rate alerting",
      source: `# --- Availability SLI: ratio of successful HTTP requests ---
# This query calculates the proportion of non-5xx responses
# over a 30-day rolling window

- record: sli:http_availability:ratio_rate30d
  expr: |
    sum(rate(http_requests_total{status!~"5.."}[30d]))
    /
    sum(rate(http_requests_total[30d]))

# --- Latency SLI: proportion of requests under 300ms ---
# Uses a histogram bucket to count "good" latency events

- record: sli:http_latency:ratio_rate30d
  expr: |
    sum(rate(http_request_duration_seconds_bucket{le="0.3"}[30d]))
    /
    sum(rate(http_request_duration_seconds_count[30d]))

# --- Error budget remaining (as a percentage) ---
- record: error_budget:remaining:ratio
  expr: |
    1 - (
      (1 - sli:http_availability:ratio_rate30d)
      /
      (1 - 0.999)
    )

# --- Burn rate alert: 14.4x over 1h + 5m windows (page-worthy) ---
- alert: HighBurnRate_Page
  expr: |
    (
      1 - (sum(rate(http_requests_total{status!~"5.."}[1h]))
           / sum(rate(http_requests_total[1h])))
    ) > (14.4 * 0.001)
    and
    (
      1 - (sum(rate(http_requests_total{status!~"5.."}[5m]))
           / sum(rate(http_requests_total[5m])))
    ) > (14.4 * 0.001)
  labels:
    severity: page
  annotations:
    summary: "Error budget burning at 14.4x — will exhaust in ~2 hours"`,
    },
    {
      language: "typescript",
      caption: "Node.js script to calculate SLI, error budget, and burn rate from request logs",
      source: `import * as fs from "fs";

/**
 * Represents a single HTTP request log entry.
 */
interface RequestLog {
  timestamp: number;   // Unix ms
  status: number;      // HTTP status code
  latencyMs: number;   // Response time in milliseconds
}

/**
 * SLI calculation result with error budget tracking.
 */
interface SLIReport {
  totalRequests: number;
  goodRequests: number;
  sliValue: number;           // 0.0 - 1.0
  sloTarget: number;          // e.g., 0.999
  errorBudgetTotal: number;   // allowed bad requests
  errorBudgetConsumed: number;
  errorBudgetRemaining: number;
  burnRate: number;
}

/**
 * Calculate the **availability SLI** and **error budget** status
 * from a set of request logs.
 */
function calculateAvailabilitySLI(
  logs: RequestLog[],
  sloTarget: number = 0.999
): SLIReport {
  const totalRequests = logs.length;
  // Good requests = non-5xx responses
  const goodRequests = logs.filter((r) => r.status < 500).length;
  const sliValue = totalRequests > 0 ? goodRequests / totalRequests : 1;

  // Error budget = (1 - SLO target) * total requests
  const errorBudgetTotal = Math.floor((1 - sloTarget) * totalRequests);
  const errorBudgetConsumed = totalRequests - goodRequests;
  const errorBudgetRemaining = Math.max(
    0,
    errorBudgetTotal - errorBudgetConsumed
  );

  // Burn rate: how fast we are consuming relative to budget
  const burnRate =
    errorBudgetTotal > 0 ? errorBudgetConsumed / errorBudgetTotal : 0;

  return {
    totalRequests,
    goodRequests,
    sliValue,
    sloTarget,
    errorBudgetTotal,
    errorBudgetConsumed,
    errorBudgetRemaining,
    burnRate,
  };
}

// --- Example usage ---
const sampleLogs: RequestLog[] = [
  { timestamp: Date.now(), status: 200, latencyMs: 45 },
  { timestamp: Date.now(), status: 200, latencyMs: 120 },
  { timestamp: Date.now(), status: 503, latencyMs: 5002 },
  { timestamp: Date.now(), status: 200, latencyMs: 89 },
  { timestamp: Date.now(), status: 500, latencyMs: 3500 },
];

const report = calculateAvailabilitySLI(sampleLogs, 0.999);
console.log("=== SLI / Error Budget Report ===");
console.log(\`SLI (availability): \${(report.sliValue * 100).toFixed(3)}%\`);
console.log(\`SLO target:         \${(report.sloTarget * 100).toFixed(1)}%\`);
console.log(\`Error budget total:  \${report.errorBudgetTotal} requests\`);
console.log(\`Budget consumed:     \${report.errorBudgetConsumed} requests\`);
console.log(\`Budget remaining:    \${report.errorBudgetRemaining} requests\`);
console.log(\`Burn rate:           \${report.burnRate.toFixed(2)}x\`);`,
    },
    {
      language: "typescript",
      caption: "Latency SLI calculator using percentile-based thresholds",
      source: `/**
 * Calculate a **latency SLI** — the proportion of requests
 * served within a target duration threshold.
 */
function calculateLatencySLI(
  logs: { latencyMs: number }[],
  thresholdMs: number = 300
): { sliValue: number; goodCount: number; totalCount: number } {
  const totalCount = logs.length;
  const goodCount = logs.filter((r) => r.latencyMs <= thresholdMs).length;
  const sliValue = totalCount > 0 ? goodCount / totalCount : 1;

  return { sliValue, goodCount, totalCount };
}

// --- Example ---
const latencyLogs = [
  { latencyMs: 45 },
  { latencyMs: 120 },
  { latencyMs: 310 },  // exceeds 300ms threshold
  { latencyMs: 89 },
  { latencyMs: 250 },
];

const latencyReport = calculateLatencySLI(latencyLogs, 300);
console.log(
  \`Latency SLI (<300ms): \${(latencyReport.sliValue * 100).toFixed(1)}%\`
);
// Output: "Latency SLI (<300ms): 80.0%"`,
    },
  ],
  diagrams: [
    {
      title: "SLI SLO SLA Hierarchy",
      kind: "architecture",
      caption: "SLIs are the raw measurements, SLOs are the internal targets set on those measurements, and SLAs are the external contractual commitments derived from SLOs.",
      mermaid: `graph TD
    subgraph SLA["SLA - External Contract"]
      Contract["Contract with customer - 99.9 percent uptime"]
      Penalty["Penalties for breach"]
    end
    subgraph SLO["SLO - Internal Target"]
      Target["Internal target - 99.95 percent"]
      ErrorBudget["Error budget: 4.38 hours per year"]
    end
    subgraph SLI["SLI - Measurement"]
      Metric["Metric: successful requests divided by total requests"]
      Window["Measured over 30-day rolling window"]
    end
    SLA --> SLO
    SLO --> SLI`,
    },
    {
      title: "Error Budget Flow",
      kind: "flow",
      caption: "Error budget is consumed by incidents and releases. When depleted, engineering must prioritize reliability over new features.",
      mermaid: `flowchart TD
    A[Monthly error budget: 43.8 minutes for 99.9 percent SLO] --> B{Incident occurs}
    B -->|5 min outage| C[Budget remaining: 38.8 min]
    C --> D{New deployment?}
    D -->|Deploy - error rate spikes| E[Another 10 min consumed]
    E --> F[Budget remaining: 28.8 min]
    F --> G{Budget < 10 percent?}
    G -->|Yes| H[Freeze deployments]
    H --> I[Focus on reliability work]
    G -->|No| J[Continue normal operations]
    I --> K([Budget resets next month])`,
    },
    {
      title: "Common SLI Types",
      kind: "mindmap",
      caption: "Categories of SLIs used to measure service reliability across availability, latency, throughput, and correctness dimensions.",
      mermaid: `mindmap
  root((SLI Categories))
    Availability
      Request success rate
      Uptime percentage
      Health check pass rate
    Latency
      p50 response time
      p95 response time
      p99 response time
    Throughput
      Requests per second
      Transactions per second
    Error Rate
      5xx errors per minute
      Failed transactions
    Saturation
      CPU utilization
      Memory usage
      Queue depth`,
    },
    {
      title: "SLO Burn Rate Alerting",
      kind: "sequence",
      caption: "Multi-window burn rate alerts detect SLO violations at different severity levels: fast burn for immediate outages, slow burn for creeping degradation.",
      mermaid: `sequenceDiagram
    participant Monitor as Monitoring System
    participant PagerDuty as Alert Manager
    participant OncallEng as On-Call Engineer
    participant Team as Engineering Team

    Monitor->>Monitor: Calculate 1h burn rate: 14x normal
    Monitor->>PagerDuty: CRITICAL: Fast burn alert
    PagerDuty->>OncallEng: Page immediately
    OncallEng->>OncallEng: Investigate and mitigate
    Monitor->>Monitor: Calculate 6h burn rate: 3x normal
    Monitor->>PagerDuty: WARNING: Slow burn alert
    PagerDuty->>Team: Ticket created
    Team->>Team: Investigate during business hours`,
    },
  ],
  comparison: {
    columns: ["Aspect", "**SLI** (Indicator)", "**SLO** (Objective)", "**SLA** (Agreement)"],
    rows: [
      ["**Definition**", "A *quantitative metric* measuring service quality", "A *target value* for an SLI over a time window", "A *contractual commitment* with financial consequences"],
      ["**Audience**", "Engineering / SRE teams", "Engineering + Product teams", "Customers + Business / Legal teams"],
      ["**Example**", "`successful_requests / total_requests`", "99.9% availability over 30 days", "99.9% uptime/month; 10% credit if breached"],
      ["**Consequence of breach**", "None — it is a *measurement*", "Triggers *error budget policy* (e.g., feature freeze)", "Triggers *financial penalties* (credits, refunds, contract exit)"],
      ["**Who sets it**", "SRE / Platform engineers", "Engineering + Product *collaboratively*", "Business / Legal teams negotiate with customers"],
      ["**Typical strictness**", "N/A (raw measurement)", "**Stricter** than SLA (provides safety buffer)", "**Looser** than SLO (contractual minimum)"],
      ["**Time window**", "Continuous (real-time metric)", "Rolling window (e.g., *30 days*)", "Calendar-aligned (e.g., *per month*)"],
      ["**Actionability**", "Feeds into SLO evaluation", "Drives *alerting* and *error budget* tracking", "Drives *legal/financial* remedies"],
    ],
  },
  exercises: [
    "**Design SLIs for an e-commerce checkout flow**: Identify at least *three* SLIs covering availability, latency, and correctness. For each, specify the *measurement point* (load balancer, application, client) and the *formula* (good events / total events). Explain why you chose each measurement point.",
    "**Calculate error budgets across tiers**: A service has a **99.95% SLO** and handles **5 million requests per day**. Calculate: (a) the daily error budget in requests, (b) the 30-day error budget, (c) how many minutes of *complete outage* the budget allows per month, and (d) the burn rate if **8,000 requests** fail in one day.",
    "**Set up multi-window burn rate alerts**: Given a **99.9% SLO** on a 30-day window, write the Prometheus alerting rules for three tiers: a *fast-burn page* (14.4x over 1h/5m), a *moderate page* (6x over 6h/30m), and a *slow-burn ticket* (1x over 3d/6h). Explain why each tier uses its specific burn rate value.",
    "**Draft an error budget policy document**: Write a policy that specifies actions at *four thresholds*: 50% budget remaining, 25% remaining, 10% remaining, and 0% (exhausted). Include who is responsible for each action, what types of deployments are restricted, and how the team decides when to resume normal operations.",
    "**SLO negotiation role-play**: Your product manager wants to set the availability SLO to **99.99%** (52 minutes of downtime per *year*). The service currently achieves **99.95%** over the past quarter. Write a *memo* arguing for a **99.9% SLO** instead, using error budget math, the cost of the last three incidents, and the impact on feature velocity.",
  ],
  cheatSheet: [
    "**SLI formula**: `SLI = good events / total events` — always a *ratio* between **0%** and **100%**. Measure at the **load balancer** or **edge** for the most user-representative signal.",
    "**Error budget formula**: `Error Budget = (1 - SLO target) * total events`. For **99.9% SLO** over 30 days = **43.2 minutes** of allowed downtime or **0.1%** of requests.",
    "**Burn rate formula**: `Burn Rate = (error rate observed) / (error rate allowed by SLO)`. A burn rate of **1.0** means the budget is consumed exactly at the sustainable pace; **>1.0** means faster than sustainable.",
    "**Page-worthy alert thresholds**: Use `14.4x` burn rate (exhausts 30-day budget in **2 hours**) with *1h + 5m* windows, or `6x` burn rate (exhausts in **5 days**) with *6h + 30m* windows.",
    "**SLO buffer rule**: Set internal SLO **tighter** than external SLA. If SLA = 99.9%, target SLO = *99.95%* to create a **safety margin** before contractual penalties.",
    "**The four golden SLI categories**: *Availability* (success rate), *Latency* (response speed), *Quality* (correctness of data), *Freshness* (age of data). Most services need at least **availability + latency** SLIs.",
  ],
  revisionNotes: [
    "**SLI -> SLO -> SLA** is a *layered hierarchy*: SLIs are raw measurements, SLOs add targets and time windows, SLAs add contracts and penalties. Each layer builds on the one below it. Remember: *all SLAs have SLOs, but not all SLOs have SLAs*.",
    "**Error budgets are the bridge** between reliability and feature velocity. They answer the question *\"how unreliable can we afford to be?\"* and convert it into a **concrete number** of allowed failures. When the budget is healthy, ship fast; when it is low, focus on reliability.",
    "**Burn rate alerting** replaces naive threshold alerts. Instead of alerting when error rate > X%, alert when the *rate of budget consumption* exceeds a sustainable pace. The **multi-window approach** (short + long windows) eliminates both *false positives* (from transient spikes caught by the long window) and *slow detection* (caught by the short window).",
    "**Measurement point matters**: an SLI measured inside the application server *misses* failures caused by the load balancer, network, or DNS. Always prefer measuring at the **closest point to the user** — typically the *edge proxy* or *load balancer* — and supplement with *client-side RUM* for true end-to-end visibility.",
    "**SLOs are a social contract**, not just a technical metric. They only work when backed by an **error budget policy** with *executive sponsorship*. Without organizational commitment, SLOs become dashboards that everyone ignores. The quarterly review process keeps SLOs calibrated to *actual user expectations*.",
  ],
  glossary: [
    {
      term: "SLI (Service Level Indicator)",
      definition:
        "A quantitative measure of a specific aspect of service quality, typically expressed as a ratio of good events to total events.",
    },
    {
      term: "SLO (Service Level Objective)",
      definition:
        "A target value or range for an SLI over a specified time window, used as an internal reliability goal.",
    },
    {
      term: "SLA (Service Level Agreement)",
      definition:
        "A contractual commitment between a service provider and customer that specifies service level targets and consequences for not meeting them.",
    },
    {
      term: "Error Budget",
      definition:
        "The amount of unreliability permitted within an SLO, calculated as (1 - SLO target) applied to the measurement window.",
    },
    {
      term: "Burn Rate",
      definition:
        "The speed at which an error budget is being consumed relative to the SLO window, used to trigger alerts at different severity levels.",
    },
    {
      term: "Multi-window Alert",
      definition:
        "An alerting strategy that requires both a long-window and short-window burn rate threshold to fire, reducing false positives and alert fatigue.",
    },
    {
      term: "Error Budget Policy",
      definition:
        "An agreed-upon set of actions triggered when an error budget is depleted, typically involving freezing risky changes and prioritizing reliability work.",
    },
  ],
};
