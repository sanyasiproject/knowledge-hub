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
