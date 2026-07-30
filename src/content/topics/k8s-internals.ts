import type { TopicContent } from "../types";

export const k8sInternals: TopicContent = {
  quickSummary: [
    "etcd stores all cluster state as a versioned key-value store; controllers use its watch API via informers to react to changes efficiently without polling.",
    "Informers maintain a local cache of API objects and deliver events (Add, Update, Delete) to controllers through work queues, reducing API server load.",
    "Controllers follow a standard pattern: watch desired state via informers, compare to actual state, and reconcile -- the same pattern used by built-in and custom controllers.",
    "Custom Resource Definitions (CRDs) extend the Kubernetes API with new resource types; operators combine CRDs with custom controllers to automate complex application lifecycle management.",
    "Admission webhooks (mutating and validating) intercept API requests to enforce policies, inject defaults, or reject non-compliant resources before they are persisted.",
  ],
  detailed: [
    "## etcd Internals\n\netcd stores data as a flat key-value space with a multi-version concurrency control (MVCC) model -- every key change increments a global revision number, and old revisions are retained until compacted. Kubernetes objects are stored under keys like `/registry/<resource>/<namespace>/<name>` in protobuf-encoded format. The watch API streams changes since a given revision, which is the foundation of the informer pattern. etcd elections use Raft: a leader handles all writes, replicating log entries to followers. Read performance can be tuned with serializable reads (from any member, potentially stale) versus linearizable reads (from leader, strongly consistent). Compaction, defragmentation, and snapshot backups are essential maintenance operations.",
    "## Informers and the SharedInformerFactory\n\nDirect API server watches for every controller would overload the API server. Informers solve this by maintaining a local in-memory cache (the store/indexer) populated by a list+watch cycle. On startup, an informer lists all objects of its type, then watches for changes. Events are delivered to registered event handlers (AddFunc, UpdateFunc, DeleteFunc) that typically enqueue the object key into a rate-limited work queue. The SharedInformerFactory ensures only one informer per resource type per process, even if multiple controllers need the same data. This pattern reduces API server connections and provides O(1) lookups from the local cache via indexers.",
    "## Controller Pattern and Work Queues\n\nEvery Kubernetes controller follows the same architecture: informer event handlers enqueue object keys (namespace/name) into a work queue. Worker goroutines dequeue keys, fetch the full object from the informer cache, compare desired state to actual state, and take corrective action. The work queue provides rate limiting (exponential backoff on failures), deduplication (processing the same key once even if enqueued multiple times), and graceful shutdown. This design makes controllers naturally idempotent and resilient: if processing fails, the key is re-enqueued with backoff; if events are missed, the periodic resync re-lists all objects.",
    "## Custom Resources and CRDs\n\nCustom Resource Definitions (CRDs) let you define new resource types (e.g., `PostgresCluster`, `Certificate`, `VirtualService`) without modifying the API server. Once a CRD is created, the API server exposes CRUD endpoints for the custom resource, stores instances in etcd, and supports watches, RBAC, and kubectl integration. CRDs support schema validation (OpenAPI v3), subresources (status, scale), categories, and additional printer columns. For complex needs beyond what CRDs provide (custom storage, aggregation), aggregated API servers are an alternative approach.",
    "## Operators\n\nAn operator is a custom controller paired with one or more CRDs that encodes domain-specific operational knowledge. For example, a PostgreSQL operator watches `PostgresCluster` custom resources and handles provisioning, replication setup, failover, backup scheduling, and version upgrades -- tasks that would otherwise require manual DBA intervention. The Operator Framework (operator-sdk) and Kubebuilder provide scaffolding for building operators in Go, with support for Ansible and Helm-based operators. Operator maturity levels range from basic install (Level 1) to full lifecycle management with auto-pilot capabilities (Level 5).",
    "## Admission Webhooks\n\nAdmission webhooks intercept API requests after authentication and authorization but before persistence to etcd. **Mutating admission webhooks** modify the incoming object -- injecting sidecar containers (like Istio's envoy proxy), adding default labels, or setting resource limits. **Validating admission webhooks** accept or reject the request -- enforcing naming conventions, requiring certain labels, or blocking privileged containers. Webhooks are configured via MutatingWebhookConfiguration and ValidatingWebhookConfiguration resources. They specify which resources and operations to intercept (`rules`), the webhook endpoint (`clientConfig`), and a `failurePolicy` (Fail or Ignore if the webhook is unreachable). OPA Gatekeeper and Kyverno use validating webhooks to enforce policy-as-code.",
  ],
  interviewQA: [
    {
      q: "How do informers reduce load on the API server?",
      a: "Instead of each controller independently watching the API server, informers maintain a local in-memory cache via a single list+watch connection per resource type. The SharedInformerFactory ensures one informer is shared across all controllers in a process. Controllers read from the local cache (O(1) lookups via indexers) rather than making API calls. Events are delivered to controllers via registered handlers and processed through rate-limited work queues, preventing thundering-herd API calls on large state changes.",
      followUps: [
        "What is the resync period and why is it needed?",
        "How do indexers improve informer performance?",
      ],
    },
    {
      q: "What is a CRD and how does it differ from an aggregated API server?",
      a: "A CRD defines a new resource type declaratively -- you submit a CRD manifest and the API server dynamically creates REST endpoints for it, storing data in etcd. No additional servers needed. An aggregated API server is a standalone API server that you register with the main API server via APIService. The main API server proxies requests to it. Use aggregated APIs when you need custom storage backends, complex validation logic beyond OpenAPI schemas, or sub-resources that CRDs do not support. CRDs are simpler and sufficient for most use cases.",
      followUps: [
        "How do you add validation to a CRD?",
        "What are CRD subresources and why are they important?",
      ],
    },
    {
      q: "Explain mutating vs validating admission webhooks with a real-world example.",
      a: "Mutating webhooks modify requests. Example: Istio's sidecar injector intercepts Pod creation requests and adds an Envoy proxy container to the pod spec -- the user's manifest does not mention the sidecar. Validating webhooks accept or reject requests. Example: OPA Gatekeeper checks that every Deployment has a resource limit set and rejects any that do not. Mutating webhooks run first (so validators see the final, mutated object). Both can specify failure policies: Fail (reject the request if the webhook is down) or Ignore (allow it through).",
      followUps: [
        "What is the risk of a webhook with failurePolicy: Fail?",
        "How does Kyverno differ from OPA Gatekeeper?",
      ],
    },
    {
      q: "What is the operator pattern and when should you build one?",
      a: "An operator is a custom controller + CRD that automates domain-specific operations. Build one when your application has complex lifecycle management that cannot be captured by Helm charts or Deployments alone -- things like coordinated rolling upgrades, automated failover, backup scheduling, or certificate rotation. If your runbook for operating the application is more than a few pages, those procedures are candidates for encoding in an operator. For simpler applications, a Helm chart or Kustomize overlay is sufficient.",
    },
  ],
  mcqs: [
    {
      q: "What is the role of the work queue in the controller pattern?",
      options: [
        "It stores API server credentials for authentication",
        "It provides rate limiting, deduplication, and ordered processing of reconciliation keys",
        "It caches etcd snapshots for disaster recovery",
        "It queues outbound network requests from pods",
      ],
      answerIndex: 1,
      explanation:
        "The work queue deduplicates object keys, applies rate limiting with exponential backoff on failures, and allows multiple worker goroutines to process reconciliation concurrently.",
    },
    {
      q: "What happens when a mutating admission webhook is unreachable and failurePolicy is set to Fail?",
      options: [
        "The request bypasses the webhook and is persisted normally",
        "The request is rejected with an error",
        "The API server retries the webhook indefinitely",
        "The request is queued until the webhook recovers",
      ],
      answerIndex: 1,
      explanation:
        "With failurePolicy: Fail, an unreachable webhook causes the API request to be rejected. This is safer from a security standpoint but can block all resource creation if the webhook is down.",
    },
    {
      q: "How does etcd's watch API enable the reconciliation loop?",
      options: [
        "It polls etcd every second for changes",
        "It streams change events since a specified revision, enabling informers to update their local caches",
        "It sends email notifications to cluster administrators",
        "It triggers webhooks on the API server for each key change",
      ],
      answerIndex: 1,
      explanation:
        "etcd's watch API uses long-lived gRPC streams to push change events to clients (informers), which update their local caches and trigger controller reconciliation.",
    },
    {
      q: "What does a CRD provide to the cluster?",
      options: [
        "A new node type for specialized hardware",
        "A custom API resource type with CRUD endpoints, RBAC, and etcd storage",
        "A custom container runtime for specialized workloads",
        "A custom network plugin for pod communication",
      ],
      answerIndex: 1,
      explanation:
        "CRDs extend the API server with new resource types that get full API support: REST endpoints, kubectl integration, RBAC, watches, and etcd persistence.",
    },
    {
      q: "In what order do admission webhooks execute?",
      options: [
        "Validating runs first, then mutating",
        "Mutating runs first, then validating",
        "They run in parallel",
        "The order is random per request",
      ],
      answerIndex: 1,
      explanation:
        "Mutating webhooks run first so they can modify the object. Validating webhooks then run against the final, mutated object to accept or reject it.",
    },
  ],
  flashcards: [
    {
      front: "What is an informer?",
      back: "A client-side component that maintains a local cache of API objects via list+watch, delivering Add/Update/Delete events to controllers without direct API calls.",
    },
    {
      front: "What does SharedInformerFactory do?",
      back: "Ensures one informer per resource type per process, sharing it across multiple controllers to minimize API server connections.",
    },
    {
      front: "What is a CRD?",
      back: "Custom Resource Definition -- extends the K8s API with new resource types, getting CRUD endpoints, RBAC, watches, and etcd storage automatically.",
    },
    {
      front: "What is an operator?",
      back: "A custom controller + CRD that encodes domain-specific operational knowledge (provisioning, failover, backups) for complex applications.",
    },
    {
      front: "Mutating vs validating admission webhooks?",
      back: "Mutating modifies the request (inject sidecars, add labels). Validating accepts/rejects it (enforce policies). Mutating runs first.",
    },
    {
      front: "How does etcd store K8s objects?",
      back: "As protobuf-encoded values under keys like /registry/<resource>/<namespace>/<name>, with MVCC versioning and Raft consensus.",
    },
    {
      front: "What is the controller work queue pattern?",
      back: "Informer handlers enqueue object keys; workers dequeue, fetch from cache, compare desired vs actual state, reconcile. Rate-limited with backoff.",
    },
    {
      front: "What is OPA Gatekeeper?",
      back: "A policy engine using validating admission webhooks to enforce custom policies (written in Rego) on Kubernetes resources.",
    },
  ],
  glossary: [
    {
      term: "Informer",
      definition:
        "A client-go component that caches API objects locally via list+watch and delivers change events to controllers.",
    },
    {
      term: "CRD (Custom Resource Definition)",
      definition:
        "A Kubernetes API extension that defines a new resource type, automatically providing REST endpoints, storage, and watch support.",
    },
    {
      term: "Operator",
      definition:
        "A pattern combining a custom controller with CRDs to automate complex application lifecycle management.",
    },
    {
      term: "Mutating Admission Webhook",
      definition:
        "A webhook that modifies incoming API requests before persistence, used for injecting defaults, sidecars, or labels.",
    },
    {
      term: "Validating Admission Webhook",
      definition:
        "A webhook that accepts or rejects API requests based on custom policies, enforcing constraints before objects reach etcd.",
    },
    {
      term: "MVCC (Multi-Version Concurrency Control)",
      definition:
        "etcd's storage model where each key change creates a new revision, enabling efficient watches and point-in-time reads.",
    },
    {
      term: "Aggregated API Server",
      definition:
        "A standalone API server registered with the main K8s API server for custom resources needing custom storage or complex logic beyond CRDs.",
    },
    {
      term: "Work Queue",
      definition:
        "A rate-limited, deduplicating queue that controllers use to process reconciliation keys from informer events.",
    },
  ],
};
