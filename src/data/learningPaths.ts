export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  icon: string;
  topics: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "system-design-30-days",
    title: "System Design in 30 Days",
    description:
      "A structured journey through system design — from estimation and fundamentals to real case studies. Perfect for interview prep or levelling up your architecture skills.",
    icon: "🏛️",
    topics: ["estimation", "latency-throughput", "horizontal-vertical", "load-balancing", "caching-basics", "cache-strategies", "cache-invalidation", "distributed-caching", "dns", "http", "rest", "rate-limiting", "cap-theorem", "consistency-models", "replication-partitioning", "sharding", "hld-fundamentals", "system-design-framework", "tradeoff-analysis", "microservices", "monolith", "eda-fundamentals", "saga-pattern", "cqrs", "event-sourcing", "design-url-shortener", "design-rate-limiter", "design-news-feed", "design-chat-system", "capacity-planning"],
  },
  {
    slug: "backend-foundations",
    title: "Backend Engineering Foundations",
    description:
      "Core data structures, algorithms, databases, and API design — the building blocks every backend engineer needs before scaling up.",
    icon: "🔧",
    topics: ["two-pointers", "linked-list-reversal", "monotonic-stack", "design-data-structures", "dfs-traversal", "top-k-heap", "bfs-traversal", "big-o-notation", "time-space-complexity", "recursion", "relational-model", "sql-basics", "normalization", "indexing", "joins", "acid-transactions", "isolation-levels", "http", "rest", "graphql", "grpc", "pagination-filtering", "api-versioning", "authn-vs-authz", "jwt", "oauth-oidc", "error-handling", "request-lifecycle", "idempotency", "background-jobs"],
  },
  {
    slug: "cloud-native-developer",
    title: "Cloud Native Developer",
    description:
      "Containers, Kubernetes, cloud services, and CI/CD — everything you need to build and ship cloud-native applications confidently.",
    icon: "☁️",
    topics: ["cloud-computing", "service-models", "container-fundamentals", "images-layers", "docker-compose", "docker-networking", "k8s-architecture", "pods-workloads", "k8s-networking", "k8s-storage", "k8s-scheduling", "k8s-internals", "aws-compute", "aws-storage", "aws-networking", "aws-iam", "infrastructure-as-code", "continuous-integration", "continuous-delivery", "release-strategies", "gitops", "config-management", "logging", "metrics", "distributed-tracing", "sli-slo-sla", "chaos-engineering", "cloud-cost", "shared-responsibility", "deployment-models"],
  },
  {
    slug: "interview-prep-dsa",
    title: "Interview Prep: DSA",
    description:
      "Arrays, trees, graphs, dynamic programming, and sorting — the essential data structures and algorithms path for coding interviews.",
    icon: "🎯",
    topics: ["big-o-notation", "time-space-complexity", "amortized-analysis", "two-pointers", "linked-list-reversal", "monotonic-stack", "design-data-structures", "dfs-traversal", "segment-tree-1d", "top-k-heap", "trie-template", "bfs-traversal", "graph-theory", "recursion", "combinatorics", "probability-basics", "set-theory-logic", "boolean-logic", "p-vs-np", "automata-theory"],
  },
  {
    slug: "full-stack-fundamentals",
    title: "Full Stack Fundamentals",
    description:
      "HTTP, REST, databases, authentication, and frontend basics — a broad tour through the technologies a full-stack developer touches daily.",
    icon: "🌐",
    topics: ["http", "dns", "osi-tcpip-model", "tcp-udp", "tls-ssl", "rest", "graphql", "relational-model", "sql-basics", "normalization", "indexing", "key-value-stores", "document-stores", "caching-basics", "authn-vs-authz", "jwt", "oauth-oidc", "sessions-vs-tokens", "hashing-passwords", "injection-attacks", "owasp-top-10", "git-fundamentals", "branching-merging", "unit-testing", "integration-testing", "continuous-integration", "continuous-delivery", "error-handling", "logging", "naming"],
  },
];

export function getLearningPath(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}
