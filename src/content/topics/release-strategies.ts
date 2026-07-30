import type { TopicContent } from "../types";

export const releaseStrategies: TopicContent = {
  quickSummary: [
    "Release strategies control how new code reaches users — from all-at-once deployments to gradual rollouts — balancing speed of delivery against risk of failure.",
    "Blue-green deployment maintains two identical environments; traffic switches from the current (blue) to the new (green) instantly, with instant rollback by switching back.",
    "Canary releases route a small percentage of traffic to the new version, monitoring for errors before gradually increasing to 100%.",
    "Feature flags decouple deployment from release — code ships to production but is hidden behind toggles, enabling dark launches, A/B testing, and instant kill switches.",
    "Rolling deployments update instances incrementally within a cluster, avoiding downtime while limiting blast radius.",
  ],
  detailed: [
    "## Blue-Green Deployment\n\nTwo identical production environments (blue and green) run simultaneously. At any given time, one serves all live traffic while the other is idle or receiving the new deployment. After deploying and validating the new version on the idle environment, a load balancer or DNS switch redirects traffic instantly. If problems are detected, switching back is equally instant. The trade-off is cost: you maintain double the infrastructure. Database migrations require special handling since both environments typically share the same database — backward-compatible migrations must be applied before the switch.",

    "## Canary Releases\n\nA canary release deploys the new version to a small subset of infrastructure (e.g., 5% of pods) and routes a corresponding fraction of traffic to it. Key metrics — error rates, latency percentiles, business KPIs — are monitored against the baseline. If metrics remain healthy, traffic gradually shifts (5% to 25% to 50% to 100%). If anomalies appear, the canary is rolled back before most users are affected. Tools like Flagger, Argo Rollouts, and AWS CodeDeploy automate this progressive delivery with configurable thresholds and automatic rollback.",

    "## Rolling Deployments\n\nIn a rolling deployment, instances are updated one at a time (or in small batches) within the existing cluster. At any point during the rollout, some instances serve the old version and some the new. The deployment continues until all instances run the new version. Kubernetes performs rolling updates by default with its Deployment resource, controlled by `maxUnavailable` and `maxSurge` parameters. Rolling deployments avoid the cost of duplicate environments but mean that during the rollout, two versions serve traffic simultaneously — the application must handle this gracefully.",

    "## Feature Flags and Dark Launches\n\nFeature flags are conditional statements in code that enable or disable functionality without redeploying. This separates *deployment* (shipping code to production) from *release* (making functionality available to users). Dark launches deploy new features to production but keep them invisible — the code executes but its output is discarded or hidden. This lets teams validate performance and correctness under real production load before users see the feature. Feature flag platforms (LaunchDarkly, Unleash, Flagsmith) provide management UIs, gradual rollout controls, user targeting, and audit logs.",

    "## A/B Testing\n\nA/B testing is a release strategy where different user segments receive different versions to measure which performs better on a specific metric (conversion rate, engagement, revenue). Unlike canary releases (which validate technical health), A/B tests validate product hypotheses. Traffic splitting can be done at the load balancer, CDN, or application level. Statistical rigor matters: tests need sufficient sample size, proper randomization, and significance testing to draw valid conclusions. Feature flags often power the traffic-splitting mechanism for A/B tests.",

    "## Choosing a Strategy\n\nThe right strategy depends on risk tolerance, infrastructure capability, and organizational maturity. Blue-green is simplest conceptually but most expensive. Canary releases offer the best risk-reward ratio for critical services. Rolling deployments are the default for containerized workloads. Feature flags add a layer of control on top of any deployment strategy. Many organizations combine strategies: a canary deployment gated by feature flags, with the option to dark-launch internally first. Regardless of strategy, automated rollback, observability, and runbooks are essential.",
  ],
  interviewQA: [
    {
      q: "What is the difference between a canary release and a blue-green deployment?",
      a: "Blue-green uses two complete environments and switches all traffic at once — it is all-or-nothing with instant rollback. Canary releases gradually shift traffic from the old version to the new one (e.g., 5% then 25% then 100%), monitoring at each stage. Canary limits the blast radius to the percentage of traffic routed to the new version, while blue-green exposes all users immediately after the switch. Canary requires more sophisticated traffic management and monitoring but offers finer-grained risk control.",
      followUps: [
        "How do you handle database schema changes in a blue-green deployment?",
        "What metrics would you monitor during a canary release?",
      ],
    },
    {
      q: "How do feature flags enable dark launches?",
      a: "A dark launch deploys new code to production but hides it from users. The feature flag ensures the new code path executes — processing real requests, writing to shadow databases, calling real dependencies — but the output is discarded or hidden behind the UI. This validates performance characteristics and correctness under real load without user impact. Once confidence is high, the flag is flipped to expose the feature. If problems are found, the flag acts as an instant kill switch.",
      followUps: [
        "What are the risks of long-lived feature flags?",
        "How do you manage technical debt from feature flags?",
      ],
    },
    {
      q: "What problems can arise during a rolling deployment?",
      a: "During a rolling deployment, two versions serve traffic simultaneously. This can cause issues if the versions have incompatible APIs, different database schemas, or different cache formats. Clients may hit version A for one request and version B for the next, leading to inconsistencies. Session affinity can mitigate this but limits load balancing. Database migrations must be backward-compatible. The deployment can also be slow for large clusters, and a subtle bug might not manifest until a certain percentage of instances are updated.",
    },
    {
      q: "How would you implement automatic rollback for a canary deployment?",
      a: "Define success criteria — maximum error rate, latency P99 threshold, minimum request success rate. Use a progressive delivery controller (Flagger, Argo Rollouts) that queries your metrics backend (Prometheus, Datadog) after each traffic increment. If any metric breaches its threshold during the analysis window, the controller automatically routes 100% traffic back to the stable version and scales down the canary. Include alerting so the team knows a rollback occurred and can investigate the root cause.",
    },
  ],
  mcqs: [
    {
      q: "In a blue-green deployment, what is the fastest way to roll back?",
      options: [
        "Redeploy the previous version to the green environment",
        "Switch the load balancer back to the blue environment",
        "Scale down the green environment and scale up blue",
        "Restore the database from a backup",
      ],
      answerIndex: 1,
      explanation: "Since the blue environment still runs the previous version, rollback is simply switching the load balancer or DNS back — an instant operation.",
    },
    {
      q: "What distinguishes a canary release from an A/B test?",
      options: [
        "Canary releases are always automated; A/B tests are manual",
        "Canary validates technical health; A/B tests validate product hypotheses",
        "Canary uses feature flags; A/B tests do not",
        "A/B tests are faster to execute than canary releases",
      ],
      answerIndex: 1,
      explanation: "Canary releases monitor error rates, latency, and system health. A/B tests measure business metrics like conversion rates to determine which variant performs better for users.",
    },
    {
      q: "Which Kubernetes parameters control the pace of a rolling update?",
      options: [
        "replicas and revisionHistoryLimit",
        "maxUnavailable and maxSurge",
        "minReadySeconds and progressDeadlineSeconds only",
        "rollingUpdate.batchSize and rollingUpdate.interval",
      ],
      answerIndex: 1,
      explanation: "`maxUnavailable` sets how many pods can be down during the update, and `maxSurge` sets how many extra pods can exist above the desired count during the rollout.",
    },
    {
      q: "What is a dark launch?",
      options: [
        "Deploying code at night when traffic is low",
        "Deploying code that executes in production but whose output is hidden from users",
        "A deployment that skips the staging environment",
        "Releasing a feature without documentation",
      ],
      answerIndex: 1,
      explanation: "A dark launch deploys and exercises new code under real production conditions while hiding the results from end users, validating performance and correctness before exposure.",
    },
  ],
  flashcards: [
    { front: "What is blast radius in release management?", back: "The scope of impact if a deployment fails — the percentage of users, services, or infrastructure affected by a bad release." },
    { front: "What does progressive delivery mean?", back: "An approach that gradually exposes new code to increasing percentages of users/traffic, using metrics to gate each increment and automatically rolling back on failure." },
    { front: "Why must database migrations be backward-compatible in blue-green deployments?", back: "Both environments share the same database, so the old version must still work with the new schema during and after the switch." },
    { front: "What is a feature flag kill switch?", back: "The ability to instantly disable a feature in production by toggling its flag off, without redeploying code." },
    { front: "What is traffic splitting?", back: "Routing different percentages of user traffic to different versions of a service, used in canary releases and A/B tests." },
    { front: "What is Flagger?", back: "A Kubernetes operator that automates progressive delivery (canary, A/B, blue-green) by analyzing metrics and managing traffic shifting." },
    { front: "What is the difference between deployment and release?", back: "Deployment is shipping code to production infrastructure. Release is making that code available to users. Feature flags let you deploy without releasing." },
  ],
  glossary: [
    { term: "Blue-Green Deployment", definition: "A strategy using two identical environments where traffic is switched entirely from one to the other for zero-downtime releases." },
    { term: "Canary Release", definition: "A strategy that routes a small percentage of traffic to a new version, gradually increasing if metrics remain healthy." },
    { term: "Rolling Deployment", definition: "Updating instances incrementally within a cluster, replacing old versions one at a time or in batches." },
    { term: "Feature Flag", definition: "A conditional toggle in code that controls whether a feature is active, enabling separation of deployment from release." },
    { term: "Dark Launch", definition: "Deploying and executing new code in production while hiding its output from users, used to validate under real load." },
    { term: "A/B Testing", definition: "Exposing different user segments to different versions to measure which performs better on business metrics." },
    { term: "Blast Radius", definition: "The extent of user or system impact if a deployment introduces a defect." },
    { term: "Progressive Delivery", definition: "Gradually rolling out changes to larger audiences with automated analysis and rollback at each stage." },
  ],
};
