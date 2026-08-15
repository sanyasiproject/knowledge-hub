import type { Domain } from "../schema";

export const opsAndReliability: Domain[] = [
  {
    slug: "devops",
    title: "DevOps",
    summary: "Culture and tooling that unify development and operations.",
    icon: "♾️",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "devops-practices",
        title: "Practices",
        summary: "The engineering practices behind DevOps.",
        topics: [
          { slug: "devops-culture", title: "DevOps Culture", summary: "Ownership, automation, and feedback loops.", level: "Beginner", tags: ["devops"], related: ["continuous-integration", "continuous-delivery", "infrastructure-as-code", "sre", "gitops"] },
          { slug: "infrastructure-as-code", title: "Infrastructure as Code", summary: "Managing infrastructure declaratively.", level: "Intermediate", tags: ["devops"], contentReady: ["quick-summary", "detailed-explanation", "code", "interview-qa"], related: ["config-management", "gitops", "container-fundamentals", "deployment-models", "devops-culture"] },
          { slug: "config-management", title: "Configuration Management", summary: "Keeping systems in a known state.", level: "Intermediate", tags: ["devops"], related: ["infrastructure-as-code", "gitops", "deployment-models", "continuous-delivery", "container-fundamentals"] },
          { slug: "release-strategies", title: "Release Strategies", summary: "Blue-green, canary, and rolling deploys.", level: "Advanced", tags: ["devops"], related: ["continuous-delivery", "deployment-models", "resilience-patterns", "gitops", "chaos-engineering"] },
        ],
      },
    ],
  },
  {
    slug: "cicd",
    title: "CI/CD",
    summary: "Automating the path from commit to production.",
    icon: "🚀",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "cicd-core",
        title: "Core CI/CD",
        summary: "Pipelines from integration to deployment.",
        topics: [
          { slug: "continuous-integration", title: "Continuous Integration", summary: "Merging and testing early and often.", level: "Beginner", tags: ["cicd"], related: ["continuous-delivery", "pipelines", "test-pyramid", "git-fundamentals", "devops-culture"] },
          { slug: "pipelines", title: "Pipelines", summary: "Stages, artifacts, and gates.", level: "Intermediate", tags: ["cicd"], related: ["continuous-integration", "continuous-delivery", "gitops", "container-fundamentals", "release-strategies"] },
          { slug: "continuous-delivery", title: "Continuous Delivery & Deployment", summary: "Shipping safely and automatically.", level: "Intermediate", tags: ["cicd"], related: ["continuous-integration", "pipelines", "release-strategies", "deployment-models", "gitops"] },
          { slug: "gitops", title: "GitOps", summary: "Git as the source of truth for deployment.", level: "Advanced", tags: ["cicd"], related: ["continuous-delivery", "infrastructure-as-code", "config-management", "k8s-architecture", "git-internals"] },
        ],
      },
    ],
  },
  {
    slug: "linux",
    title: "Linux",
    summary: "The operating system that runs the cloud — from the shell to the kernel.",
    icon: "🐧",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "linux-core",
        title: "Core Linux",
        summary: "The essentials every engineer needs.",
        topics: [
          { slug: "linux-shell", title: "The Shell & Command Line", summary: "Navigating and scripting the system.", level: "Beginner", tags: ["linux"], related: ["linux-processes", "linux-filesystem", "git-fundamentals", "linux-performance", "infrastructure-as-code"] },
          { slug: "linux-processes", title: "Processes & Signals", summary: "Managing running programs.", level: "Intermediate", tags: ["linux"], related: ["linux-shell", "processes-vs-threads", "linux-filesystem", "linux-performance", "context-switching"] },
          { slug: "linux-filesystem", title: "Filesystem & Permissions", summary: "How Linux organizes and protects files.", level: "Intermediate", tags: ["linux"], related: ["linux-shell", "linux-processes", "file-systems", "rbac-abac", "linux-performance"] },
          { slug: "linux-performance", title: "Performance Tools", summary: "top, perf, strace, and friends.", level: "Advanced", tags: ["linux", "performance"], related: ["profiling", "linux-processes", "linux-shell", "latency-throughput", "metrics"] },
        ],
      },
    ],
  },
  {
    slug: "git",
    title: "Git",
    summary: "The distributed version control system that underpins modern development.",
    icon: "🌿",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "git-core",
        title: "Core Git",
        summary: "Everyday version control.",
        topics: [
          { slug: "git-fundamentals", title: "Git Fundamentals", summary: "Commits, staging, and the three trees.", level: "Beginner", tags: ["git"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["branching-merging", "rebasing", "git-internals", "continuous-integration", "gitops"] },
          { slug: "branching-merging", title: "Branching & Merging", summary: "Parallel work and bringing it together.", level: "Intermediate", tags: ["git"], related: ["git-fundamentals", "rebasing", "continuous-integration", "gitops", "git-internals"] },
          { slug: "rebasing", title: "Rebasing", summary: "Rewriting history for a clean line.", level: "Intermediate", tags: ["git"], related: ["branching-merging", "git-fundamentals", "git-internals", "continuous-integration", "gitops"] },
          { slug: "git-internals", title: "Git Internals", summary: "The object model: blobs, trees, commits.", level: "Advanced Concepts", tags: ["git"], related: ["git-fundamentals", "branching-merging", "file-systems", "design-data-structures", "rebasing"] },
        ],
      },
    ],
  },
  {
    slug: "monitoring-observability",
    title: "Monitoring & Observability",
    summary: "Understanding what your systems are doing in production.",
    icon: "📈",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "observability-pillars",
        title: "The Pillars",
        summary: "Metrics, logs, and traces.",
        topics: [
          { slug: "metrics", title: "Metrics", summary: "Numeric time series for health and trends.", level: "Beginner", tags: ["observability"], related: ["logging", "distributed-tracing", "sli-slo-sla", "sre", "capacity-planning"] },
          { slug: "logging", title: "Logging", summary: "Structured records of what happened.", level: "Beginner", tags: ["observability"], related: ["metrics", "distributed-tracing", "error-handling", "sli-slo-sla", "linux-shell"] },
          { slug: "distributed-tracing", title: "Distributed Tracing", summary: "Following a request across services.", level: "Advanced", tags: ["observability"], related: ["metrics", "logging", "microservices", "sli-slo-sla", "request-lifecycle"] },
          { slug: "sli-slo-sla", title: "SLIs, SLOs & SLAs", summary: "Defining and measuring reliability targets.", level: "Advanced", tags: ["observability", "reliability"], related: ["sre", "metrics", "chaos-engineering", "resilience-patterns", "capacity-planning"] },
        ],
      },
    ],
  },
  {
    slug: "performance-engineering",
    title: "Performance Engineering",
    summary: "Making systems fast and efficient under real load.",
    icon: "⏱️",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "performance-core",
        title: "Core Performance",
        summary: "Measuring and improving speed.",
        topics: [
          { slug: "profiling", title: "Profiling", summary: "Finding where the time actually goes.", level: "Intermediate", tags: ["performance"], related: ["latency-throughput", "linux-performance", "garbage-collection", "capacity-planning", "caching-basics"] },
          { slug: "latency-throughput", title: "Latency vs Throughput", summary: "Two different goals, often in tension.", level: "Intermediate", tags: ["performance"], related: ["profiling", "capacity-planning", "load-balancing", "caching-basics", "backpressure"] },
          { slug: "capacity-planning", title: "Capacity Planning", summary: "Provisioning for expected and peak load.", level: "Advanced", tags: ["performance"], related: ["latency-throughput", "sli-slo-sla", "horizontal-vertical", "metrics", "sharding"] },
        ],
      },
    ],
  },
  {
    slug: "scalability",
    title: "Scalability",
    summary: "Handling growth in users, data, and traffic.",
    icon: "📶",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "scaling-core",
        title: "Core Scaling",
        summary: "The techniques for growing a system.",
        topics: [
          { slug: "horizontal-vertical", title: "Horizontal vs Vertical Scaling", summary: "Scaling out vs scaling up.", level: "Beginner", tags: ["scalability"], contentReady: ["quick-summary", "comparison", "diagrams", "interview-qa"], related: ["load-balancing", "sharding", "replication-partitioning", "capacity-planning", "distributed-caching"] },
          { slug: "load-balancing", title: "Load Balancing", summary: "Distributing traffic across instances.", level: "Intermediate", tags: ["scalability"], related: ["horizontal-vertical", "sharding", "resilience-patterns", "dns", "latency-throughput"] },
          { slug: "sharding", title: "Sharding", summary: "Splitting data across nodes.", level: "Advanced", tags: ["scalability"], related: ["replication-partitioning", "horizontal-vertical", "cap-and-nosql", "distributed-caching", "cap-theorem"] },
        ],
      },
    ],
  },
  {
    slug: "reliability",
    title: "Reliability",
    summary: "Keeping systems available and correct despite failure.",
    icon: "🧯",
    group: "Operations & Reliability",
    categories: [
      {
        slug: "reliability-core",
        title: "Core Reliability & SRE",
        summary: "Designing for and operating with failure in mind.",
        topics: [
          { slug: "resilience-patterns", title: "Resilience Patterns", summary: "Retries, timeouts, circuit breakers, bulkheads.", level: "Advanced", tags: ["reliability"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["fault-tolerance", "chaos-engineering", "sre", "idempotency", "distributed-tracing"] },
          { slug: "chaos-engineering", title: "Chaos Engineering", summary: "Injecting failure to build confidence.", level: "Advanced", tags: ["reliability"], related: ["resilience-patterns", "sre", "fault-tolerance", "sli-slo-sla", "distributed-tracing"] },
          { slug: "sre", title: "Site Reliability Engineering", summary: "Error budgets, toil, and operating at scale.", level: "Advanced", tags: ["reliability"], related: ["sli-slo-sla", "chaos-engineering", "resilience-patterns", "capacity-planning", "devops-culture"] },
        ],
      },
    ],
  },
];
