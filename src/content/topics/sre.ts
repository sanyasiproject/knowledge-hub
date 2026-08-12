import type { TopicContent } from "../types";

export const sre: TopicContent = {
  quickSummary: [
    "Site Reliability Engineering (SRE) applies software engineering principles to operations, treating infrastructure and operations as software problems.",
    "Error budgets formalize the balance between reliability and feature velocity: when budget remains, ship fast; when it is exhausted, prioritize stability.",
    "Toil is repetitive, manual, automatable work that scales linearly with service size. SRE aims to keep toil below 50% of team time through automation.",
    "Postmortems are blameless reviews of incidents that focus on systemic causes and produce concrete action items to prevent recurrence.",
  ],
  detailed: [
    `## What Is SRE?

Site Reliability Engineering, pioneered at Google, is defined as "what happens when you ask a software engineer to design an operations function." Core principles:

- **Embrace risk**: 100% reliability is neither achievable nor desirable. Define acceptable risk through SLOs and error budgets.
- **Eliminate toil**: automate repetitive operational tasks so the team can focus on engineering work that scales.
- **Monitor meaningfully**: use SLIs and SLOs rather than threshold-based alerts on system metrics.
- **Release engineering**: make deployments safe, frequent, and reversible through automation and progressive rollouts.
- **Simplicity**: every system accrues complexity over time. SRE actively fights unnecessary complexity.

SRE is not just ops with a new title. The key difference is that SRE teams spend at least 50% of their time on engineering (building tools, automating, improving systems) rather than manual operations.`,

    `## Error Budgets in Practice

The error budget is the operational mechanism that makes SLOs actionable:

**How it works**:
1. Set an SLO (e.g., 99.9% availability over 30 days).
2. Error budget = 1 - SLO = 0.1% = ~43 minutes of downtime.
3. Track budget consumption in real-time.
4. When budget is healthy: deploy frequently, experiment, take risks.
5. When budget is low: slow down, increase testing, focus on reliability.
6. When budget is exhausted: freeze feature deployments, fix reliability issues.

**Error budget policy** — an agreed-upon document that specifies:
- What percentage of budget remaining triggers caution (e.g., 25%).
- What actions are taken when budget is exhausted (deployment freeze, postmortem, reliability sprint).
- Who can override the freeze (VP-level escalation with justification).
- How long the freeze lasts (until budget recovers or a specified period).

The budget creates a shared language between product (wants features) and engineering (wants stability). It replaces subjective arguments with data-driven decisions.`,

    `## Toil and Automation

**Toil** has specific characteristics in SRE:
- **Manual**: requires human intervention.
- **Repetitive**: done again and again.
- **Automatable**: could be handled by software.
- **Tactical**: reactive, not strategic.
- **No enduring value**: does not permanently improve the system.
- **Scales linearly**: more traffic = more toil.

Examples: manually restarting services, manually provisioning accounts, manually running database migrations, manually responding to routine alerts.

**Measuring toil**: track the percentage of team time spent on toil. SRE targets less than 50% toil. If toil exceeds 50%, the team cannot do enough engineering to reduce it — a vicious cycle.

**Automation priorities**:
1. Automate the most frequent toil first (highest ROI).
2. Build self-healing systems (auto-restart, auto-scale, auto-remediate).
3. Create playbooks that can be progressively automated.
4. Use infrastructure as code for provisioning.
5. Build internal platforms and self-service tools for developers.`,

    `## SLO-Based Alerting

Traditional alerting fires on arbitrary thresholds (CPU > 80%, memory > 90%). SLO-based alerting fires on error budget consumption:

**Multi-window, multi-burn-rate alerts**:
- Fast burn (14.4x burn rate, 1-hour window): pages immediately for severe incidents.
- Medium burn (6x, 6-hour window): pages for sustained degradation.
- Slow burn (1x, 3-day window): creates a ticket for gradual erosion.

**Benefits over threshold alerts**:
- Directly tied to user impact (SLO breach = users are affected).
- Fewer false positives (metric spikes that do not affect users do not alert).
- Actionable (budget-based alerts require specific responses defined in the error budget policy).
- Reduced alert fatigue.

**Implementing**: tools like Sloth (Kubernetes), Google Cloud Monitoring, and Datadog support SLO-based alerting natively. For custom solutions, compute burn rate from SLI metrics and alert via Prometheus/Alertmanager.`,

    `## Incident Management and Postmortems

**Incident management** in SRE follows a structured process:
- **Detection**: SLO-based alerts or customer reports.
- **Response**: on-call acknowledges, assembles incident team if needed.
- **Roles**: Incident Commander (coordinates), Operations Lead (executes), Communications Lead (updates stakeholders).
- **Communication**: status page updates, Slack war room, periodic stakeholder emails.
- **Mitigation**: restore service first, investigate root cause later.
- **Resolution**: confirm steady state is restored.

**Blameless postmortems**:
- Focus on **systemic causes**, not individual blame. "The deploy pipeline lacked canary validation" not "Engineer X pushed a bad config."
- **Timeline**: reconstruct the sequence of events.
- **Root cause analysis**: use techniques like Five Whys or fault tree analysis.
- **Action items**: concrete, assigned, time-bound improvements.
- **Share broadly**: publish postmortems across the organization to spread learning.

A good postmortem produces 3-5 specific action items. A great one changes a process or adds automation that prevents the entire class of incident.`,
  ],
  interviewQA: [
    {
      q: "How does SRE differ from traditional DevOps?",
      a: "SRE and DevOps share goals (breaking down silos, improving reliability, accelerating delivery) but SRE is more prescriptive. SRE defines specific practices: SLOs and error budgets for reliability targets, toil budgets (less than 50% manual work), blameless postmortems, and the principle that SRE teams spend at least 50% of time on engineering. DevOps is a broader cultural movement focused on collaboration and automation. Google describes it as: 'SRE is a specific implementation of DevOps with opinionated practices.'",
    },
    {
      q: "Explain how error budgets resolve the tension between development speed and reliability.",
      a: "Error budgets provide a data-driven mechanism. When the error budget is healthy, product teams can ship fast, deploy frequently, and take risks — the SRE team supports this because the data shows reliability is fine. When the budget is exhausted, feature deployments freeze and the team focuses on reliability work. This replaces subjective arguments ('we need to go faster' vs 'we need to be more careful') with objective data. Both sides agree to the policy upfront, so the decision is automatic, not political.",
    },
    {
      q: "What makes a postmortem blameless, and why does it matter?",
      a: "A blameless postmortem focuses on systemic causes rather than individual mistakes. Instead of 'Engineer X pushed a bad config,' it asks 'Why did the system allow a bad config to reach production?' This matters because blame discourages reporting and hides problems. If engineers fear punishment, they will hide near-misses and avoid volunteering for incident response. Blameless culture increases the quality and quantity of incident reports, producing more learning and better systemic improvements.",
    },
    {
      q: "How do you measure and reduce toil in an SRE team?",
      a: "Measure toil by tracking the percentage of team time spent on manual, repetitive, automatable work. Categorize work weekly into toil vs. engineering. If toil exceeds 50%, the team cannot invest enough in automation to improve — escalate to leadership. Reduce toil by prioritizing automation of the most frequent tasks (highest ROI), building self-healing systems (auto-restart, auto-scale), creating self-service platforms for developers, and converting manual runbooks into automated workflows. Track toil reduction over quarters to show progress.",
    },
  ],
  followUps: [
    "How does an error budget create a real conversation between product and engineering?",
    "What is toil, and why is capping it a policy rather than a preference?",
    "What makes a postmortem blameless in practice, not just in name?",
  ],
  mcqs: [
    {
      q: "What is the SRE-recommended maximum percentage of team time spent on toil?",
      options: ["25%", "50%", "75%", "90%"],
      answerIndex: 1,
      explanation:
        "SRE targets a maximum of 50% toil. Above this threshold, the team cannot invest enough time in engineering and automation to reduce toil, creating a vicious cycle.",
    },
    {
      q: "What is the primary advantage of SLO-based alerting over threshold-based alerting?",
      options: [
        "It requires less monitoring infrastructure",
        "It is directly tied to user impact and reduces false positives",
        "It eliminates the need for on-call rotations",
        "It is simpler to configure",
      ],
      answerIndex: 1,
      explanation:
        "SLO-based alerts fire when error budget is being consumed at an unsustainable rate, which directly correlates with user-perceived reliability. Threshold alerts on system metrics often fire without user impact.",
    },
    {
      q: "In a blameless postmortem, how should a bad configuration push be described?",
      options: [
        "Engineer X pushed a bad config and caused the outage",
        "The deploy pipeline lacked validation that would have caught the bad config",
        "The team should have reviewed the config more carefully",
        "The config was too complex for anyone to manage",
      ],
      answerIndex: 1,
      explanation:
        "Blameless postmortems focus on systemic causes: the missing validation in the pipeline is the actionable issue, not the individual who made the push. This leads to structural improvements.",
    },
    {
      q: "What happens when an error budget is exhausted according to SRE practices?",
      options: [
        "The SLO target is lowered",
        "Feature deployments are frozen and the team prioritizes reliability",
        "The team switches to manual operations",
        "The service is taken offline for maintenance",
      ],
      answerIndex: 1,
      explanation:
        "When the error budget is exhausted, the error budget policy typically mandates freezing risky feature deployments and redirecting engineering effort toward reliability improvements until the budget recovers.",
    },
  ],
  flashcards: [
    {
      front: "What is SRE?",
      back: "Site Reliability Engineering: applying software engineering principles to operations. SRE teams spend at least 50% of time on engineering work (automation, tooling) rather than manual operations.",
    },
    {
      front: "What are the five characteristics of toil?",
      back: "Manual, repetitive, automatable, tactical (reactive), and scales linearly with service growth. It produces no enduring value.",
    },
    {
      front: "What is an error budget policy?",
      back: "An agreed-upon document specifying actions at different budget levels: caution thresholds, deployment freeze conditions, override process, and recovery criteria.",
    },
    {
      front: "What are the three incident management roles?",
      back: "Incident Commander (coordinates), Operations Lead (executes technical actions), Communications Lead (updates stakeholders and status page).",
    },
    {
      front: "What makes a postmortem blameless?",
      back: "Focusing on systemic causes, not individual mistakes. 'Why did the system allow this?' not 'Who did this?' Encourages reporting and produces structural improvements.",
    },
    {
      front: "What are multi-window burn rate alerts?",
      back: "SLO-based alerts that use different time windows and burn rates: fast burn (1h, 14.4x) for severe incidents, medium (6h, 6x) for sustained issues, slow (3d, 1x) for gradual erosion.",
    },
    {
      front: "How does SRE define acceptable reliability?",
      back: "Through SLOs and error budgets. 100% is not the target. The SLO sets the threshold; the error budget quantifies how much unreliability is acceptable, enabling data-driven trade-offs.",
    },
  ],
  deepDive: [
    `## The Philosophy Behind Error Budgets and Risk Management

Site Reliability Engineering fundamentally reframes how organizations think about **risk** and **failure**. Traditional operations teams treat every outage as a crisis and every deployment as a threat. SRE inverts this by recognizing that *some amount of failure is not only acceptable but necessary* for innovation. The **error budget** is the mathematical expression of this philosophy: if your SLO is **99.9%**, you have a budget of **0.1%** unreliability — roughly **43 minutes per month**. This is not a target to hit but a *resource to spend*. Product teams can "spend" error budget on risky deployments, experiments, and rapid feature releases. When the budget is healthy, velocity is encouraged; when it is depleted, the organization **automatically** shifts focus to reliability. This mechanism eliminates the perennial "ship vs. stabilize" debate by replacing opinion with data. The key insight is that the error budget belongs to the *product*, not to SRE — it is the product team's risk allowance, and SRE's job is to measure and enforce it.`,

    `## Observability, SLIs, and the Art of Meaningful Measurement

Effective SRE depends on choosing the right **Service Level Indicators (SLIs)** — the metrics that genuinely reflect user experience. A common anti-pattern is monitoring *system* metrics (CPU utilization, disk I/O) rather than *user-facing* metrics (request latency at the \`p99\`, error rate on critical endpoints, availability as seen from the client). The **USE method** (*Utilization, Saturation, Errors*) is valuable for infrastructure troubleshooting, but SLOs should be built on **RED metrics** (*Rate, Errors, Duration*) because these directly correlate with what users perceive. Beyond metrics, modern SRE embraces the **three pillars of observability**: *metrics* for aggregate health, *logs* for event-level detail, and *distributed traces* for request-path analysis. Tools like **Prometheus** with **Grafana**, **Jaeger** for tracing, and **Loki** for log aggregation form a common open-source observability stack. The goal is not to collect more data but to ask better questions — observability means you can understand *why* a system is misbehaving, not just *that* it is misbehaving.`,

    `## Building a Culture of Reliability: On-Call, Postmortems, and Continuous Improvement

SRE is as much a **cultural practice** as a technical one. The on-call rotation is a critical touchpoint: SRE insists that on-call engineers should receive *no more than two pages per 12-hour shift* on average. If page volume exceeds this, it signals either poor alert quality or systemic reliability issues that must be addressed. Each page should be **actionable, urgent, and user-impacting** — anything else is noise that erodes trust and causes **alert fatigue**. After incidents, the *blameless postmortem* is the primary learning mechanism. The word "blameless" is precise: it means analyzing the **system conditions** that allowed a failure, not exonerating individuals from accountability. Engineers are expected to act in good faith with the information available at the time; the postmortem asks what *systemic guardrails* were missing. Action items from postmortems should be tracked with the same rigor as product features — they go into the backlog, get prioritized, and are reviewed in retrospectives. Organizations that treat postmortem action items as optional suggestions will repeat the same incidents. The SRE book recommends publishing postmortems broadly within the organization to maximize *organizational learning* and normalize the discussion of failure.`,
  ],

  code: [
    {
      language: "bash",
      caption: "Incident Response Runbook — automated triage script for on-call engineers",
      source: `#!/usr/bin/env bash
# =============================================================
# SRE Incident Response Runbook — Quick Triage
# Run this script when paged for a service degradation alert.
# Usage: ./incident-triage.sh <service-name> <environment>
# =============================================================

set -euo pipefail

SERVICE="\${1:?Usage: ./incident-triage.sh <service-name> <environment>}"
ENV="\${2:-production}"
TIMESTAMP=\$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_DIR="/var/log/incident-triage"
mkdir -p "\$LOG_DIR"
REPORT="\$LOG_DIR/\${SERVICE}_\${TIMESTAMP}.log"

echo "=== Incident Triage Report ===" | tee "\$REPORT"
echo "Service:     \$SERVICE" | tee -a "\$REPORT"
echo "Environment: \$ENV" | tee -a "\$REPORT"
echo "Timestamp:   \$TIMESTAMP" | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 1: Check pod/container health (Kubernetes)
echo "--- Step 1: Pod Health ---" | tee -a "\$REPORT"
kubectl get pods -n "\$SERVICE" -o wide 2>&1 | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 2: Check for recent restarts or OOMKills
echo "--- Step 2: Recent Restarts / OOMKills ---" | tee -a "\$REPORT"
kubectl get pods -n "\$SERVICE" -o json \\
  | jq -r '.items[] | select(.status.containerStatuses[]?.restartCount > 2)
           | "\\(.metadata.name) restarts=\\(.status.containerStatuses[0].restartCount)"' \\
  2>&1 | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 3: Check error rate from Prometheus
echo "--- Step 3: Error Rate (last 15 min) ---" | tee -a "\$REPORT"
curl -sG "http://prometheus.\$ENV:9090/api/v1/query" \\
  --data-urlencode "query=sum(rate(http_requests_total{service=\\"\$SERVICE\\",code=~\\"5..\\"}[15m])) / sum(rate(http_requests_total{service=\\"\$SERVICE\\"}[15m])) * 100" \\
  | jq -r '.data.result[0].value[1] // "no data"' \\
  2>&1 | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 4: Check p99 latency
echo "--- Step 4: p99 Latency (last 15 min) ---" | tee -a "\$REPORT"
curl -sG "http://prometheus.\$ENV:9090/api/v1/query" \\
  --data-urlencode "query=histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service=\\"\$SERVICE\\"}[15m])) by (le))" \\
  | jq -r '.data.result[0].value[1] // "no data"' \\
  2>&1 | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 5: Check recent deployments
echo "--- Step 5: Recent Deployments (last 2 hours) ---" | tee -a "\$REPORT"
kubectl rollout history deployment/"\$SERVICE" -n "\$SERVICE" 2>&1 \\
  | tail -5 | tee -a "\$REPORT"
echo "" | tee -a "\$REPORT"

# Step 6: Tail recent error logs
echo "--- Step 6: Recent Error Logs (last 50 lines) ---" | tee -a "\$REPORT"
kubectl logs -n "\$SERVICE" -l app="\$SERVICE" --tail=50 \\
  --since=15m 2>&1 | grep -i -E "error|fatal|panic|exception" \\
  | tee -a "\$REPORT"

echo ""
echo "Triage report saved to: \$REPORT"
echo "Next steps:"
echo "  1. If error rate > 1%, check recent deploys and consider rollback"
echo "  2. If pods are crash-looping, inspect logs and resource limits"
echo "  3. If latency is high, check downstream dependencies"
echo "  4. Open an incident channel: #inc-\$SERVICE-\$(date +%Y%m%d)"`,
    },
    {
      language: "yaml",
      caption: "Prometheus alerting rules — multi-window, multi-burn-rate SLO alerts",
      source: `# =============================================================
# Prometheus Alerting Rules — SLO-Based Multi-Burn-Rate Alerts
# Implements the multi-window, multi-burn-rate approach from
# the Google SRE Workbook for a 99.9% availability SLO.
# =============================================================

groups:
  - name: slo_burn_rate_alerts
    rules:
      # -------------------------------------------------------
      # SLI Recording Rules — precompute error ratios
      # -------------------------------------------------------
      - record: sli:error_ratio:rate5m
        expr: >
          sum(rate(http_requests_total{code=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)

      - record: sli:error_ratio:rate30m
        expr: >
          sum(rate(http_requests_total{code=~"5.."}[30m])) by (service)
          /
          sum(rate(http_requests_total[30m])) by (service)

      - record: sli:error_ratio:rate1h
        expr: >
          sum(rate(http_requests_total{code=~"5.."}[1h])) by (service)
          /
          sum(rate(http_requests_total[1h])) by (service)

      - record: sli:error_ratio:rate6h
        expr: >
          sum(rate(http_requests_total{code=~"5.."}[6h])) by (service)
          /
          sum(rate(http_requests_total[6h])) by (service)

      - record: sli:error_ratio:rate3d
        expr: >
          sum(rate(http_requests_total{code=~"5.."}[3d])) by (service)
          /
          sum(rate(http_requests_total[3d])) by (service)

      # -------------------------------------------------------
      # Fast Burn Alert — 14.4x burn rate
      # Burns through 30-day budget in ~2 days.
      # Short window (1h) + long window (5m) = high confidence.
      # Severity: PAGE (wake someone up).
      # -------------------------------------------------------
      - alert: SLO_HighErrorRate_FastBurn
        expr: >
          sli:error_ratio:rate1h > (14.4 * 0.001)
          and
          sli:error_ratio:rate5m > (14.4 * 0.001)
        for: 2m
        labels:
          severity: page
          slo: availability
          burn_rate: "14.4x"
        annotations:
          summary: >
            High error rate: {{ $labels.service }} is burning
            error budget at 14.4x (budget exhaustion in ~2 days)
          description: >
            1h error ratio: {{ $value | humanizePercentage }}.
            SLO target: 99.9%. Immediate investigation required.
          runbook_url: https://wiki.internal/runbooks/slo-fast-burn

      # -------------------------------------------------------
      # Medium Burn Alert — 6x burn rate
      # Burns through 30-day budget in ~5 days.
      # Severity: PAGE (but less urgent than fast burn).
      # -------------------------------------------------------
      - alert: SLO_HighErrorRate_MediumBurn
        expr: >
          sli:error_ratio:rate6h > (6 * 0.001)
          and
          sli:error_ratio:rate30m > (6 * 0.001)
        for: 5m
        labels:
          severity: page
          slo: availability
          burn_rate: "6x"
        annotations:
          summary: >
            Elevated error rate: {{ $labels.service }} is burning
            error budget at 6x (budget exhaustion in ~5 days)
          description: >
            6h error ratio: {{ $value | humanizePercentage }}.
            Sustained degradation detected. Investigate promptly.
          runbook_url: https://wiki.internal/runbooks/slo-medium-burn

      # -------------------------------------------------------
      # Slow Burn Alert — 1x burn rate
      # Consuming budget at the exact SLO threshold.
      # Severity: TICKET (not a page, but needs attention).
      # -------------------------------------------------------
      - alert: SLO_HighErrorRate_SlowBurn
        expr: >
          sli:error_ratio:rate3d > (1 * 0.001)
          and
          sli:error_ratio:rate6h > (1 * 0.001)
        for: 30m
        labels:
          severity: ticket
          slo: availability
          burn_rate: "1x"
        annotations:
          summary: >
            Gradual error budget erosion: {{ $labels.service }}
            is consuming budget at 1x rate over 3 days
          description: >
            3d error ratio: {{ $value | humanizePercentage }}.
            At this rate, the monthly budget will be fully consumed.
            Create a ticket and investigate during business hours.
          runbook_url: https://wiki.internal/runbooks/slo-slow-burn

      # -------------------------------------------------------
      # Error Budget Remaining — informational recording rule
      # -------------------------------------------------------
      - record: slo:error_budget_remaining:ratio
        expr: >
          1 - (
            sum_over_time(sli:error_ratio:rate5m[30d])
            / (30 * 24 * 60 / 5)
          ) / 0.001`,
    },
    {
      language: "yaml",
      caption: "SLO definition document — YAML template for defining service SLOs",
      source: `# =============================================================
# SLO Definition Document — Template
# Defines the SLOs, SLIs, and error budget policy for a service.
# =============================================================

service:
  name: checkout-api
  owner: payments-team
  tier: critical   # critical | standard | best-effort

slos:
  - name: availability
    description: "Proportion of successful HTTP requests"
    sli:
      type: request-based
      # Good events / Total events
      good_event: 'http_requests_total{code!~"5.."}'
      total_event: 'http_requests_total'
    target: 99.9        # percentage
    window: 30d         # rolling window
    error_budget: 0.1%  # = 43.2 min/month

  - name: latency
    description: "Proportion of requests served within 300ms"
    sli:
      type: request-based
      good_event: 'http_request_duration_seconds_bucket{le="0.3"}'
      total_event: 'http_request_duration_seconds_count'
    target: 99.0
    window: 30d
    error_budget: 1.0%

error_budget_policy:
  # Actions triggered at each threshold
  thresholds:
    - remaining: 75%
      action: "Normal operations — ship features freely"
    - remaining: 50%
      action: "Caution — increase canary duration, add integration tests"
    - remaining: 25%
      action: "Warning — require SRE approval for deployments"
    - remaining: 0%
      action: >
        FREEZE — halt feature deployments, redirect engineering to
        reliability work. VP-level override required for exceptions.
        Conduct reliability sprint until budget recovers to 25%.

  review_cadence: weekly
  escalation_path:
    - eng-manager
    - director-of-engineering
    - vp-engineering`,
    },
  ],

  diagrams: [
    {
      title: "SRE Toil vs Engineering Work",
      kind: "flow",
      caption: "SRE teams cap toil at 50 percent of their time. The rest goes to engineering work that reduces future toil through automation and improved systems.",
      mermaid: `flowchart TD
    A([SRE work items]) --> B{Is it toil?}
    B -->|Yes| C{Toil > 50 percent of time?}
    C -->|Yes| D[Escalate to reduce toil]
    D --> E[Automate or eliminate]
    C -->|No| F[Do the toil]
    B -->|No - engineering work| G[Build automation]
    G --> H[Improve reliability]
    H --> I[Reduce future toil]
    E --> I
    F --> J{Toil automatable?}
    J -->|Yes| K[Add to backlog]
    J -->|No| L[Accept as necessary]`,
    },
    {
      title: "Incident Response Lifecycle",
      kind: "state",
      caption: "The stages of incident response from detection through resolution and post-incident review, ensuring learning from every incident.",
      mermaid: `stateDiagram-v2
    [*] --> Detected: Alert fires or user reports
    Detected --> Triaged: Severity assessed
    Triaged --> Investigating: Incident commander assigned
    Investigating --> Mitigating: Root cause identified
    Mitigating --> Resolved: Service restored
    Resolved --> PostMortem: Blameless review
    PostMortem --> ActionItems: Improvements identified
    ActionItems --> [*]: Action items tracked to completion
    Investigating --> Escalated: Need more help
    Escalated --> Investigating: Additional responders engaged`,
    },
    {
      title: "SRE Reliability Hierarchy",
      kind: "architecture",
      caption: "The SRE reliability pyramid: monitoring and alerting at the base, then incident response, post-mortems, capacity planning, and change management.",
      mermaid: `graph TD
    CM[Change Management - safe deployments] --> CP[Capacity Planning - headroom]
    CP --> PM[Post-Mortems - learning from failures]
    PM --> IR[Incident Response - fast MTTR]
    IR --> MA[Monitoring and Alerting - fast MTTD]
    MA --> Found[Foundation: SLIs and SLOs]`,
    },
    {
      title: "Four Golden Signals",
      kind: "mindmap",
      caption: "Google SRE's four golden signals for monitoring any service: latency, traffic, errors, and saturation, each capturing a different failure mode.",
      mermaid: `mindmap
  root((Four Golden Signals))
    Latency
      Time to serve requests
      p50 p95 p99 percentiles
      Distinguish success vs error latency
    Traffic
      Request rate per second
      Transactions per second
      Active connections
    Errors
      Explicit 5xx errors
      Implicit wrong content
      Rate and count
    Saturation
      How full is the service
      CPU memory queue depth
      Leading indicator of degradation`,
    },
  ],

  animations: [
    {
      title: "A blameless postmortem",
      steps: [
        {
          label: "Timeline first",
          detail: "What happened, when, in facts — no interpretation and no names attached to mistakes.",
        },
        {
          label: "Impact",
          detail: "Who was affected, how badly, for how long. Quantified.",
        },
        {
          label: "Contributing factors",
          detail: "Usually several. 'Human error' is never a root cause — ask what made the error possible and undetected.",
        },
        {
          label: "Why blameless",
          detail: "Blame makes people hide information. You need the person who made the change to explain freely what they saw.",
        },
        {
          label: "Actions",
          detail: "Specific, owned, dated. 'Be more careful' is not an action.",
        },
        {
          label: "Publish",
          detail: "Widely. A postmortem nobody reads teaches only the people already in the room.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "SRE", "DevOps", "Traditional Ops"],
    rows: [
      [
        "**Philosophy**",
        "Apply *software engineering* to operations; treat ops as a software problem",
        "Cultural movement emphasizing *collaboration* between Dev and Ops",
        "Separate teams with *handoffs*; Ops receives what Dev builds",
      ],
      [
        "**Reliability Target**",
        "Defined by **SLOs** and **error budgets**; 100% is explicitly *not* the goal",
        "Continuous improvement; reliability goals vary by team maturity",
        "Target is often **100% uptime**; any outage is a failure",
      ],
      [
        "**Failure Response**",
        "**Blameless postmortems** with systemic analysis and tracked action items",
        "Retrospectives and *feedback loops*; varies by implementation",
        "Root cause analysis often assigns *individual blame*; post-incident reviews may be punitive",
      ],
      [
        "**Automation**",
        "Mandatory: **toil budget < 50%**; automate or the team cannot function",
        "Encouraged through *CI/CD*, IaC, and tooling; no hard threshold",
        "Automation is *nice-to-have*; manual runbooks are the norm",
      ],
      [
        "**Change Management**",
        "Progressive rollouts, *canary deploys*, automated rollback tied to SLOs",
        "CI/CD pipelines with *automated testing*; deployment frequency as a metric",
        "**Change Advisory Boards (CABs)**, scheduled maintenance windows, manual approvals",
      ],
      [
        "**On-Call**",
        "Max **2 pages per 12h shift**; excess paging triggers reliability improvements",
        "Shared on-call between Dev and Ops; structure varies",
        "Ops team bears *all on-call burden*; no limit on page volume",
      ],
      [
        "**Team Structure**",
        "Embedded SRE teams or *platform teams*; engineers rotate between SRE and product",
        "Cross-functional teams; *\"you build it, you run it\"*",
        "**Siloed** Dev, QA, and Ops teams with formal handoff processes",
      ],
      [
        "**Prescriptiveness**",
        "Highly prescriptive: specific practices like error budgets, toil tracking, SLOs",
        "Principles-based: *CALMS* (Culture, Automation, Lean, Measurement, Sharing)",
        "Process-heavy: *ITIL* frameworks, formal change management",
      ],
    ],
  },

  exercises: [
    "**Error Budget Calculation**: Your service has an SLO of **99.95%** availability over a **30-day** window. Calculate the error budget in *minutes*. If the service experienced **15 minutes** of downtime in the first week, what percentage of the budget has been consumed? Should you adjust your deployment velocity?",
    "**SLO Design Exercise**: You are the SRE for an e-commerce checkout service. Define appropriate **SLIs** and **SLOs** for *availability* and *latency*. Consider: what percentile should the latency SLI use? What window? Write the SLO in the format: `99.X% of requests complete successfully within Y ms over a Z-day window`.",
    "**Postmortem Writing**: Given this scenario — a database connection pool exhaustion caused a **45-minute outage** during peak traffic because the connection limit was hardcoded and not monitored — write a *blameless postmortem* including: timeline, root cause analysis (use **Five Whys**), impact assessment, and **3-5 concrete action items** with owners and deadlines.",
    "**Toil Audit**: Track your team's work for one week and categorize each task as **toil** or **engineering**. For each toil item, assess: frequency, time-per-occurrence, and automation feasibility. Prioritize the top 3 automation candidates by `frequency x time_per_occurrence` and write a one-page proposal for automating the highest-ROI item.",
    "**Burn-Rate Alert Design**: Design a *multi-window, multi-burn-rate* alerting configuration for a service with a **99.9%** availability SLO. Define the burn rates, time windows, and severity levels for each alert tier. Explain *why* you chose each burn rate multiplier and what response each alert should trigger.",
  ],

  cheatSheet: [
    "**Error Budget Formula**: `Error Budget = 1 - SLO`. For 99.9% SLO: budget = 0.1% = **43.2 min/month** or **~8.76 hours/year**. Track consumption: `budget_consumed = (bad_minutes / total_minutes) / (1 - SLO)`.",
    "**SLO Targets to Downtime**: `99%` = 7.3h/mo | `99.9%` = 43.2min/mo | `99.95%` = 21.6min/mo | `99.99%` = 4.3min/mo | `99.999%` = 26s/mo. Each additional **nine** is roughly **10x harder** and more expensive.",
    "**Burn Rate Multipliers**: Fast burn = **14.4x** (1h window, pages immediately), Medium burn = **6x** (6h window, pages for sustained issues), Slow burn = **1x** (3d window, creates ticket). Formula: `burn_rate = error_rate / (1 - SLO_target)`.",
    "**Toil Checklist**: Is it *manual*? Is it *repetitive*? Is it *automatable*? Is it *tactical* (not strategic)? Does it *scale linearly* with service size? Does it produce *no enduring value*? If **yes to all six**, it is toil.",
    "**Postmortem Template**: 1) *Title and date*, 2) *Impact summary* (duration, users affected, revenue impact), 3) *Timeline* (detection to resolution), 4) *Root cause* (Five Whys), 5) *What went well*, 6) *What went wrong*, 7) *Action items* (owner + deadline), 8) *Lessons learned*.",
    "**On-Call Health Metrics**: Target max **2 pages per 12h shift**. Track: pages per shift, *time-to-acknowledge*, *time-to-mitigate*, % of pages that were **actionable** vs. noise. If >50% noise, fix alerting before adding more alerts.",
  ],

  revisionNotes: [
    "SRE is *not* just \"ops with a new name\" — the defining characteristic is that SRE teams spend **at least 50%** of their time on *engineering* (automation, tooling, platform work) rather than manual operations. If toil exceeds 50%, the team enters a **death spiral** where there is no capacity to automate.",
    "**Error budgets** are the bridge between product and reliability. They replace subjective arguments with *objective data*. The budget belongs to the **product team** as their risk allowance; SRE *measures and enforces* it. When budget is exhausted, the error budget policy (agreed upon in advance) dictates the response — typically a **deployment freeze**.",
    "**SLO-based alerting** uses *multi-window, multi-burn-rate* alerts instead of static thresholds. The key insight: a CPU spike that does not affect users should **not** page anyone. Alerts should fire only when the *error budget is being consumed faster than sustainable*. This dramatically reduces **alert fatigue** and ensures every page is actionable.",
    "**Blameless postmortems** focus on *systemic causes*, not individual mistakes. The question is never \"*who* broke it?\" but \"*what system conditions* allowed this to happen?\" This is critical because blame discourages reporting, hides near-misses, and prevents organizational learning. Action items must be **concrete, assigned, and tracked** — not vague recommendations.",
    "The **SRE book** identifies three key practices for managing complexity: *simplicity* (actively fight accidental complexity), *release engineering* (make deploys safe, frequent, and reversible), and *capacity planning* (predict demand and provision ahead of need). All three reduce the probability and blast radius of incidents.",
  ],

  resources: [
    {
      label: "Site Reliability Engineering — Google",
      kind: "book",
    },
    {
      label: "The Site Reliability Workbook — Google",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Site Reliability Engineering (SRE)",
      definition:
        "A discipline that applies software engineering practices to operations, emphasizing automation, SLOs, error budgets, and blameless culture.",
    },
    {
      term: "Toil",
      definition:
        "Manual, repetitive, automatable operational work that scales linearly with service growth and produces no enduring value.",
    },
    {
      term: "Error Budget",
      definition:
        "The permitted amount of unreliability within an SLO, used as a mechanism to balance feature velocity against reliability investment.",
    },
    {
      term: "Blameless Postmortem",
      definition:
        "An incident review that focuses on systemic causes rather than individual blame, producing concrete action items to prevent recurrence.",
    },
    {
      term: "Incident Commander",
      definition:
        "The person who coordinates the incident response, makes decisions about escalation, and ensures communication flows to stakeholders.",
    },
    {
      term: "Error Budget Policy",
      definition:
        "A pre-agreed document specifying actions to take at various error budget thresholds, including deployment freezes and reliability sprints.",
    },
    {
      term: "Burn Rate Alert",
      definition:
        "An alert based on the rate of error budget consumption, using multiple time windows to detect both fast-burning severe incidents and slow steady degradation.",
    },
  ],
};
