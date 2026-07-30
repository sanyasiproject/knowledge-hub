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
