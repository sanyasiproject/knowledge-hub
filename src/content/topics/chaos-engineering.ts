import type { TopicContent } from "../types";

export const chaosEngineering: TopicContent = {
  quickSummary: [
    "Chaos engineering is the discipline of experimenting on a system to build confidence in its ability to withstand turbulent conditions in production.",
    "The process follows a scientific method: define steady state, hypothesize that it will hold during disruption, inject failures, and observe whether the hypothesis holds.",
    "Blast radius control limits the scope of experiments to minimize customer impact, starting with non-production environments and gradually expanding to production.",
    "Tools like Chaos Monkey (random instance termination), Gremlin, and Litmus Chaos provide controlled failure injection across infrastructure and application layers.",
  ],
  detailed: [
    `## The Chaos Engineering Process

Chaos engineering follows a disciplined, scientific approach — not random destruction:

1. **Define steady state**: identify measurable indicators of normal system behavior (e.g., order success rate > 99.9%, p99 latency < 500ms, error rate < 0.1%).

2. **Form a hypothesis**: "When we terminate 1 of 3 API instances, the system will continue serving requests with no increase in error rate and less than 100ms increase in p99 latency."

3. **Design the experiment**: determine what failure to inject, how long, what to measure, and how to abort.

4. **Run the experiment**: inject the failure while monitoring steady-state metrics in real-time.

5. **Analyze results**: did the hypothesis hold? If yes, confidence increases. If no, you found a weakness to fix before it causes a real outage.

6. **Fix and iterate**: address weaknesses, then re-run the experiment to verify the fix.

The goal is not to break things — it is to discover weaknesses before they manifest as unplanned outages.`,

    `## Steady State Hypothesis

The steady state hypothesis is the foundation of every chaos experiment. It must be:

- **Measurable**: defined by concrete metrics, not subjective assessments.
- **Business-relevant**: tied to user-facing outcomes, not internal system metrics.
- **Observable in real-time**: monitored during the experiment to enable quick abort.

Examples of steady state definitions:

| System | Steady State Metric | Acceptable Range |
|--------|-------------------|------------------|
| E-commerce | Order completion rate | > 99.9% |
| Search engine | Query success rate | > 99.95% |
| Payment service | Transaction success rate | > 99.99% |
| API gateway | p99 latency | < 200ms |

If you cannot define steady state, you are not ready for chaos engineering — you have a more fundamental observability problem to solve first.`,

    `## Blast Radius Control

Blast radius is the potential impact of an experiment on users and systems:

**Progression of blast radius**:
1. **Development/staging**: validate experiment design with no customer impact.
2. **Canary production**: affect a small percentage of production traffic (e.g., 1%).
3. **Single availability zone**: test AZ failure resilience.
4. **Full production**: wide-scale experiments once confidence is high.

**Safety controls**:
- **Abort conditions**: automatically stop the experiment if steady-state metrics breach thresholds.
- **Duration limits**: bound experiment time (e.g., maximum 30 minutes).
- **Rollback mechanism**: one-click or automatic reversal of injected failures.
- **Communication**: notify the team before experiments; never run them during change freezes.
- **Audience targeting**: exclude VIP customers or critical business flows from initial experiments.

The principle: minimize the blast radius needed to learn. If you can learn from staging, do not test in production. If you can learn from 1% of traffic, do not affect 100%.`,

    `## Types of Chaos Experiments

**Infrastructure failures**:
- Instance/pod termination (Chaos Monkey).
- Availability zone outage simulation.
- Disk fill / I/O errors.
- Network partition between services.
- DNS resolution failures.

**Application failures**:
- Latency injection (add artificial delay to responses).
- Error injection (force specific error codes).
- Resource exhaustion (CPU stress, memory pressure).
- Dependency unavailability.

**Operational failures**:
- Certificate expiration.
- Configuration change (wrong config pushed).
- Deployment failure (bad version deployed).

**GameDay**: a structured team exercise where a realistic outage scenario is simulated and the team practices incident response. Combines chaos engineering with process validation. Typically runs for 2-4 hours with a facilitator, pre-planned scenario, and post-exercise review.`,

    `## Tools and Organizational Adoption

**Tools**:
- **Chaos Monkey** (Netflix): randomly terminates EC2 instances in production. Part of the Simian Army.
- **Gremlin**: SaaS platform for controlled failure injection across infrastructure, network, and application layers.
- **Litmus Chaos**: Kubernetes-native chaos engineering framework with a catalog of pre-built experiments.
- **Toxiproxy** (Shopify): TCP proxy for simulating network conditions (latency, jitter, bandwidth limits).
- **AWS Fault Injection Simulator**: managed service for running chaos experiments on AWS infrastructure.

**Adoption path**:
1. Start with **tabletop exercises**: discuss failure scenarios without actually injecting faults.
2. Run experiments in **staging** to build confidence and tooling.
3. Begin **automated chaos in production** on a schedule (weekly Chaos Monkey).
4. Integrate into **CI/CD**: run chaos tests as part of the deployment pipeline.
5. Build a **chaos engineering culture**: engineers propose experiments, results are shared broadly.

Prerequisites: solid observability (metrics, logs, traces), on-call processes, and incident response playbooks. Chaos engineering without observability is just breaking things.`,
  ],
  interviewQA: [
    {
      q: "What is the difference between chaos engineering and simply breaking things in production?",
      a: "Chaos engineering follows a scientific method: define steady-state metrics, form a specific hypothesis about system behavior under failure, design a controlled experiment with blast radius limits and abort conditions, and analyze results to learn. Simply breaking things has no hypothesis, no controls, no systematic learning. Chaos engineering is also progressive — you start in staging, then canary, then broader production. The goal is building confidence in resilience, not causing outages.",
    },
    {
      q: "What prerequisites should be in place before starting chaos engineering?",
      a: "First, solid observability: you need metrics, logs, and traces to define steady state and monitor experiments in real-time. Second, defined steady-state metrics tied to business outcomes. Third, incident response processes: on-call rotation, escalation paths, and runbooks. Fourth, the ability to quickly abort experiments and roll back failures. Without these, chaos engineering is reckless — you are injecting failures with no way to detect, understand, or stop their impact.",
    },
    {
      q: "How would you introduce chaos engineering to an organization that has never done it?",
      a: "Start with tabletop exercises: discuss 'what would happen if X failed?' without injecting anything. This builds awareness and reveals assumptions. Next, run experiments in staging to validate tooling and build team confidence. Then graduate to production with small blast radius (one instance, one AZ). Share results transparently — both successes and discovered weaknesses. Automate recurring experiments (e.g., weekly instance termination). Finally, integrate into the deployment pipeline: verify that new releases survive standard failure scenarios before reaching production.",
    },
    {
      q: "What is a GameDay and how does it differ from automated chaos experiments?",
      a: "A GameDay is a structured team exercise lasting 2-4 hours where a realistic outage scenario is simulated and the team practices full incident response: detection, communication, diagnosis, mitigation, and post-incident review. Unlike automated chaos experiments that test system resilience, GameDays also test human processes: do alerts fire? Does the on-call respond correctly? Are runbooks accurate? GameDays typically have a facilitator, a pre-planned scenario (unknown to participants), and a debrief session.",
    },
  ],
  mcqs: [
    {
      q: "What is the first step in a chaos engineering experiment?",
      options: [
        "Inject a random failure into production",
        "Define steady state behavior with measurable metrics",
        "Install chaos engineering tools",
        "Get management approval",
      ],
      answerIndex: 1,
      explanation:
        "The scientific method requires defining what 'normal' looks like before you can test whether the system maintains normality under disruption. Without steady-state metrics, you cannot evaluate experiment results.",
    },
    {
      q: "What is blast radius in chaos engineering?",
      options: [
        "The amount of data destroyed in an experiment",
        "The potential scope of impact on users and systems from an experiment",
        "The network range affected by a partition test",
        "The number of services involved in the experiment",
      ],
      answerIndex: 1,
      explanation:
        "Blast radius refers to how many users, services, or systems could be affected by a chaos experiment. Controlling blast radius is essential for minimizing customer impact while still learning.",
    },
    {
      q: "Which tool is specifically designed for simulating network conditions like latency and bandwidth limits?",
      options: [
        "Chaos Monkey",
        "Gremlin",
        "Toxiproxy",
        "Litmus Chaos",
      ],
      answerIndex: 2,
      explanation:
        "Toxiproxy by Shopify is a TCP proxy that sits between services and simulates adverse network conditions including latency, jitter, bandwidth limits, and connection resets.",
    },
    {
      q: "What is the key difference between a GameDay and automated chaos experiments?",
      options: [
        "GameDays only run in staging",
        "GameDays test human processes and incident response in addition to system resilience",
        "GameDays do not inject real failures",
        "GameDays are shorter than automated experiments",
      ],
      answerIndex: 1,
      explanation:
        "GameDays are structured exercises that test both system resilience and human incident response: detection, communication, diagnosis, and mitigation. Automated chaos experiments primarily test system behavior.",
    },
  ],
  flashcards: [
    {
      front: "What are the five steps of a chaos experiment?",
      back: "1) Define steady state metrics, 2) Form a hypothesis, 3) Design the experiment, 4) Run and observe, 5) Analyze results and fix weaknesses.",
    },
    {
      front: "What is a steady state hypothesis?",
      back: "A measurable, business-relevant statement about normal system behavior that the experiment tests. Example: 'Order completion rate stays above 99.9% when one API instance is terminated.'",
    },
    {
      front: "What is blast radius?",
      back: "The potential scope of impact from a chaos experiment. Controlled by progressing from staging to canary to production, with abort conditions and duration limits.",
    },
    {
      front: "What is Chaos Monkey?",
      back: "A Netflix tool that randomly terminates EC2 instances in production to ensure services can tolerate instance failures. Part of the broader Simian Army toolkit.",
    },
    {
      front: "What is a GameDay?",
      back: "A structured 2-4 hour exercise simulating a realistic outage scenario. Tests both system resilience and human incident response processes including detection, communication, and mitigation.",
    },
    {
      front: "What prerequisites are needed before chaos engineering?",
      back: "Observability (metrics, logs, traces), defined steady-state metrics, incident response processes, and the ability to quickly abort experiments and roll back injected failures.",
    },
    {
      front: "Name four chaos engineering tools.",
      back: "Chaos Monkey (Netflix, instance termination), Gremlin (SaaS platform), Litmus Chaos (Kubernetes-native), Toxiproxy (network conditions), AWS Fault Injection Simulator.",
    },
  ],
  glossary: [
    {
      term: "Chaos Engineering",
      definition:
        "The discipline of experimenting on a system in a controlled way to build confidence in its ability to withstand failures and turbulent conditions.",
    },
    {
      term: "Steady State",
      definition:
        "The measurable, normal operating behavior of a system, defined by business-relevant metrics that are monitored during chaos experiments.",
    },
    {
      term: "Blast Radius",
      definition:
        "The potential scope of impact on users and systems from a chaos experiment, controlled through progressive rollout and abort conditions.",
    },
    {
      term: "GameDay",
      definition:
        "A structured team exercise simulating a realistic outage to practice and validate both system resilience and human incident response processes.",
    },
    {
      term: "Chaos Monkey",
      definition:
        "A Netflix tool that randomly terminates production instances to ensure services are resilient to individual instance failures.",
    },
    {
      term: "Fault Injection",
      definition:
        "Deliberately introducing failures (latency, errors, resource exhaustion) into a system to test its behavior under adverse conditions.",
    },
    {
      term: "Abort Condition",
      definition:
        "A predefined threshold that triggers automatic termination of a chaos experiment when steady-state metrics breach acceptable limits.",
    },
  ],
};
