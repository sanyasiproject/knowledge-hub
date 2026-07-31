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
  deepDive: [
    "## Traffic Shifting Internals\n\nAt the network level, release strategies rely on different mechanisms to split traffic. **Layer-4 (TCP/UDP) splitting** uses IPVS or iptables rules — Kubernetes Services backed by kube-proxy fall into this category. Each new connection is routed based on probabilistic weights, but once established, the connection stays pinned. **Layer-7 (HTTP) splitting** uses an ingress controller or service mesh sidecar (Envoy, Linkerd-proxy) to inspect every HTTP request and route it independently. This enables header-based routing (`x-canary: true`), cookie-based stickiness, and weighted traffic shifting at the request level rather than the connection level.\n\nService meshes like Istio expose traffic splitting through VirtualService resources with weighted route destinations. Argo Rollouts integrates with these by patching the weights automatically during analysis. Without a service mesh, Nginx Ingress supports canary annotations (`nginx.ingress.kubernetes.io/canary-weight`) for simpler setups. Understanding the layer at which your traffic split operates is critical — L4 splitting cannot do request-level routing or header matching, which limits the granularity of canary analysis.",

    "## Database Migration Strategies During Releases\n\nThe hardest part of any release strategy is handling database schema changes when two versions of the application serve traffic simultaneously. The **expand-and-contract** pattern solves this in three phases: (1) **Expand** — add new columns/tables without removing old ones; both versions can read/write. (2) **Migrate** — backfill data, update the new version to write to new columns, and ensure the old version still works. (3) **Contract** — once the old version is fully retired, drop deprecated columns.\n\nFor blue-green deployments, the shared database means both environments must work with the same schema at all times. Run the expand migration before switching traffic, and the contract migration only after the old environment is decommissioned. For canary releases, the window of dual-version traffic is longer, making backward-compatible migrations even more critical. Tools like `gh-ost` (GitHub Online Schema Migrations) and `pt-online-schema-change` (Percona) enable non-blocking schema changes on large tables, avoiding locks that could cause downtime during the migration phase.",

    "## Observability Requirements for Progressive Delivery\n\nEffective canary analysis requires a layered observability stack. **Golden signals** (latency, traffic, errors, saturation) form the baseline — compare canary pod metrics against stable pod metrics using the same time window. **Business metrics** (conversion rate, checkout completion, API success rate) catch issues that technical metrics miss — a canary might serve fast responses that are all incorrect. **Synthetic probes** run predefined requests against the canary to validate critical paths even under low traffic.\n\nArgo Rollouts AnalysisTemplates define metric queries (typically PromQL or Datadog queries) with success conditions. For example: `successCondition: result[0] < 0.05` asserts the canary error rate stays below 5%. Multiple AnalysisTemplates can run in parallel — one checking HTTP 5xx rates, another checking latency P99, and a third checking a business metric. If any analysis fails, the rollout is automatically aborted and traffic returns to the stable version. The analysis interval, count, and failure thresholds are all configurable to balance speed of rollout against confidence.",
  ],
  code: [
    {
      language: "yaml",
      caption: "Kubernetes Deployment with rolling update strategy",
      source: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  labels:
    app: api-server
spec:
  replicas: 6
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: api-server
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1    # at most 1 pod down during update
      maxSurge: 2           # up to 2 extra pods during rollout
  minReadySeconds: 30       # wait 30s before marking pod ready
  progressDeadlineSeconds: 600
  template:
    metadata:
      labels:
        app: api-server
        version: v2.4.1
    spec:
      containers:
        - name: api-server
          image: registry.example.com/api-server:v2.4.1
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 10
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi`,
    },
    {
      language: "yaml",
      caption: "Argo Rollouts canary deployment with automated analysis",
      source: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api-server
spec:
  replicas: 6
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api-server
          image: registry.example.com/api-server:v2.4.1
          ports:
            - containerPort: 8080
  strategy:
    canary:
      canaryService: api-server-canary
      stableService: api-server-stable
      trafficRouting:
        istio:
          virtualService:
            name: api-server-vsvc
            routes:
              - primary
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis:
            templates:
              - templateName: error-rate-check
            args:
              - name: service-name
                value: api-server-canary
        - setWeight: 25
        - pause: { duration: 10m }
        - analysis:
            templates:
              - templateName: error-rate-check
            args:
              - name: service-name
                value: api-server-canary
        - setWeight: 50
        - pause: { duration: 10m }
        - analysis:
            templates:
              - templateName: latency-check
            args:
              - name: service-name
                value: api-server-canary
        - setWeight: 100
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: error-rate-check
spec:
  args:
    - name: service-name
  metrics:
    - name: error-rate
      interval: 2m
      count: 3
      failureLimit: 1
      successCondition: result[0] < 0.05
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{
              service="{{args.service-name}}",
              status=~"5.."
            }[5m]))
            /
            sum(rate(http_requests_total{
              service="{{args.service-name}}"
            }[5m]))`,
    },
    {
      language: "typescript",
      caption: "Feature flag implementation with gradual rollout and kill switch",
      source: `interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  allowlist: string[];       // user IDs that always see the feature
  blocklist: string[];       // user IDs that never see the feature
  metadata: Record<string, string>;
}

interface FlagEvaluationContext {
  userId: string;
  attributes: Record<string, string>;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, boolean> = new Map();
  private readonly cacheTTLMs = 30_000;

  constructor(private readonly flagSource: FlagConfigSource) {}

  /** Synchronize local cache with the remote flag configuration store. */
  async refresh(): Promise<void> {
    const remote = await this.flagSource.fetchAll();
    this.flags.clear();
    this.cache.clear();
    for (const flag of remote) {
      this.flags.set(flag.name, flag);
    }
  }

  /** Evaluate whether a flag is active for a given user context. */
  isEnabled(flagName: string, ctx: FlagEvaluationContext): boolean {
    const flag = this.flags.get(flagName);
    if (!flag || !flag.enabled) return false;

    // Blocklist takes precedence — acts as the kill switch per user
    if (flag.blocklist.includes(ctx.userId)) return false;

    // Allowlist overrides percentage rollout
    if (flag.allowlist.includes(ctx.userId)) return true;

    // Deterministic percentage rollout based on user ID hash
    return this.hashToPercentage(ctx.userId, flagName) < flag.rolloutPercentage;
  }

  /** Kill switch: immediately disable a flag for all users. */
  async killSwitch(flagName: string): Promise<void> {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = false;
      await this.flagSource.update(flagName, { enabled: false });
      this.cache.clear();
    }
  }

  /**
   * Deterministic hash: same user + flag always produces the same
   * bucket, so users get a consistent experience across requests.
   */
  private hashToPercentage(userId: string, flagName: string): number {
    const input = \`\${userId}:\${flagName}\`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 100;
  }
}

// Usage
const flags = new FeatureFlagService(configSource);
await flags.refresh();

if (flags.isEnabled("new-checkout-flow", { userId: user.id, attributes: {} })) {
  renderNewCheckout();
} else {
  renderLegacyCheckout();
}`,
    },
  ],
  comparison: {
    columns: ["Aspect", "Blue-Green", "Canary", "Rolling Update", "Feature Flags"],
    rows: [
      ["Traffic shift", "All at once (100%)", "Gradual (e.g. 5% to 100%)", "Pod by pod", "Per-user or per-segment"],
      ["Rollback speed", "Instant (switch back)", "Fast (route to stable)", "Slow (redeploy old version)", "Instant (toggle off)"],
      ["Infrastructure cost", "2x (duplicate env)", "Minimal extra pods", "No extra infra", "No extra infra"],
      ["Blast radius", "All users after switch", "Limited to canary %", "Grows as pods update", "Controlled by flag rules"],
      ["Database handling", "Shared DB, needs backward-compat migrations", "Shared DB, backward-compat required", "Same cluster, backward-compat required", "Single version, no migration issues"],
      ["Observability needed", "Basic health checks", "Advanced metrics + automated analysis", "Readiness/liveness probes", "Flag analytics + monitoring"],
      ["Complexity", "Low", "High", "Low (K8s default)", "Medium (code changes + flag mgmt)"],
      ["Best for", "Stateless apps, quick validation", "Critical services, risk-sensitive releases", "Standard containerized workloads", "Product experiments, dark launches"],
    ],
  },
  diagrams: [
    {
      title: "Canary Release Traffic Flow",
      kind: "flow",
      caption: "Progressive traffic shifting from stable to canary version with automated analysis gates at each stage",
    },
    {
      title: "Blue-Green Deployment Architecture",
      kind: "architecture",
      caption: "Two identical environments behind a load balancer with shared database and instant switchover",
    },
  ],
  animations: [
    {
      title: "Canary Rollout Lifecycle",
      steps: [
        { label: "Deploy canary", detail: "A new ReplicaSet is created with the updated container image. Initially 0% of traffic is routed to it." },
        { label: "Route 5% traffic", detail: "The Istio VirtualService (or ingress canary annotation) is patched to send 5% of requests to the canary pods." },
        { label: "Run analysis (5min)", detail: "AnalysisTemplate queries Prometheus for error rate and P99 latency. Canary metrics are compared against the stable baseline." },
        { label: "Promote to 25%", detail: "Analysis passed. Traffic weight increases to 25%. A second analysis window begins with the higher traffic volume." },
        { label: "Promote to 50%", detail: "Metrics remain healthy. Traffic is now evenly split between stable and canary. Business metrics (conversion rate) are validated." },
        { label: "Promote to 100%", detail: "All checks pass. Canary is promoted to stable. The old ReplicaSet is scaled down. Rollout is complete." },
        { label: "Automatic rollback (if needed)", detail: "If any analysis step fails, traffic is immediately routed back to 100% stable. The canary ReplicaSet is scaled to zero and an alert fires." },
      ],
    },
  ],
  exercises: [
    "Set up a Kubernetes Deployment with a rolling update strategy. Deploy v1 of an nginx container, then update to v2. Use `kubectl rollout status` and `kubectl rollout history` to observe the rollout. Experiment with different `maxUnavailable` and `maxSurge` values and observe how they change the rollout speed and pod availability.",
    "Install Argo Rollouts in a local kind or minikube cluster. Create a Rollout resource with a canary strategy that pauses at 20% and 50%. Use `kubectl argo rollouts promote` to advance through steps. Trigger a deliberate failure (e.g., broken health check) and observe the automatic rollback behavior.",
    "Implement a basic feature flag system in your language of choice. It should support: boolean on/off, percentage-based rollout with deterministic hashing, and a user allowlist. Write tests that verify the same user always gets the same flag evaluation and that the percentage distribution is approximately correct over 10,000 simulated users.",
    "Design a blue-green deployment pipeline using a CI/CD tool (GitHub Actions, GitLab CI, or Jenkins). The pipeline should deploy to the green environment, run smoke tests against it, switch the load balancer, and provide a manual rollback step. Document what happens to in-flight requests during the switch.",
    "Create a canary AnalysisTemplate for Argo Rollouts that checks three metrics: HTTP 5xx error rate below 2%, P99 latency below 500ms, and request throughput within 10% of the stable version. Test it with a synthetic load generator (e.g., k6 or hey) and verify that a deliberately degraded canary triggers automatic rollback.",
  ],
  cheatSheet: [
    "`kubectl rollout status deployment/<name>` — watch a rolling update in real time",
    "`kubectl rollout undo deployment/<name>` — rollback to the previous revision",
    "`kubectl rollout history deployment/<name>` — list all revisions with change-cause annotations",
    "`kubectl argo rollouts get rollout <name> --watch` — monitor an Argo Rollouts canary in real time",
    "`kubectl argo rollouts promote <name>` — manually advance a paused canary to the next step",
    "`kubectl argo rollouts abort <name>` — abort and rollback a canary release",
    "Argo Rollouts AnalysisTemplate `successCondition` uses expr syntax: `result[0] < 0.05` means error rate must stay below 5%",
    "Set `minReadySeconds` on Deployments to prevent fast rollouts from masking slow-starting failures",
  ],
  revisionNotes: [
    "Blue-green gives instant rollback but doubles infrastructure cost; best for stateless applications with simple database schemas.",
    "Canary releases limit blast radius by exposing only a fraction of traffic; they require robust observability and automated metric analysis.",
    "Rolling updates are the Kubernetes default — controlled by `maxUnavailable` (pods that can be down) and `maxSurge` (extra pods allowed).",
    "Feature flags separate deployment from release: code ships to production but is activated independently via toggle rules.",
    "Database migrations during multi-version deployments must be backward-compatible — use the expand-and-contract pattern.",
    "Dark launches execute new code in production with output hidden from users, validating performance under real load.",
    "Argo Rollouts automates canary analysis with AnalysisTemplates that query Prometheus/Datadog and auto-rollback on threshold breaches.",
    "A/B tests validate product hypotheses (business metrics), while canary releases validate technical health (error rates, latency).",
  ],
  resources: [
    { label: "Argo Rollouts Documentation", kind: "docs", note: "Official docs covering canary, blue-green, and analysis-driven progressive delivery on Kubernetes." },
    { label: "Kubernetes Deployments — Rolling Update Strategy", kind: "docs", note: "Kubernetes reference for Deployment strategy configuration, maxSurge, maxUnavailable, and rollback." },
    { label: "Continuous Delivery by Jez Humble & David Farley", kind: "book", note: "Foundational text on deployment pipelines, blue-green deployments, and release engineering practices." },
    { label: "Flagger — Progressive Delivery for Kubernetes", kind: "repo", note: "CNCF project that automates canary, A/B, and blue-green deployments with Istio, Linkerd, or Nginx." },
    { label: "Testing in Production, the safe way (Cindy Sridharan)", kind: "article", note: "Covers dark launches, feature flags, canary analysis, and observability requirements for safe production testing." },
  ],
};
