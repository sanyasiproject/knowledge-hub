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
  followUps: [
    "What does the kubelet do that the API server does not?",
    "How does a controller differ from an operator?",
    "Why is etcd's consistency model the constraint on cluster size?",
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
  deepDive: [
    "**etcd** is the *single source of truth* for all cluster state, and understanding its internals is essential for debugging and operating Kubernetes at scale. Every write goes through the **Raft consensus protocol**: the elected leader appends log entries and replicates them to a quorum of followers before committing. This means write latency is bounded by the *slowest quorum member*, making network latency between etcd nodes critical. The **MVCC model** assigns a monotonically increasing *revision number* to every key mutation, allowing the `watch` API to stream changes from any point in history. However, old revisions accumulate and must be **compacted** periodically (default: every 5 minutes) to reclaim storage. After compaction, a **defragmentation** pass reclaims freed pages in the boltdb backend. Operators should monitor `etcd_mvcc_db_total_size_in_bytes`, `etcd_server_slow_apply_total`, and `etcd_disk_wal_fsync_duration_seconds` to detect performance degradation before it cascades into API server timeouts.",
    "The **informer and controller pattern** is the beating heart of Kubernetes extensibility. When a controller process starts, the `SharedInformerFactory` creates one *reflector* per resource type, which performs an initial `List` call (populating the **DeltaFIFO** queue) followed by a long-running `Watch`. Events flow from `DeltaFIFO` into the **Indexer** (a thread-safe, indexed in-memory store) and then fan out to registered **ResourceEventHandlers**. These handlers should *never block* -- they simply compute an object key (`namespace/name`) and push it onto a **rate-limited work queue** (`workqueue.RateLimitingInterface`). Worker goroutines then dequeue keys, look up the full object from the Indexer (an *O(1)* cache read, not an API call), and execute the reconciliation logic. If reconciliation fails, the key is **re-enqueued with exponential backoff** (default: 5ms base, 1000s max). The periodic **resync** (e.g., every 30s) re-delivers all cached objects as *Update* events, ensuring eventual consistency even if watch events were lost.",
    "**Admission webhooks** form the last programmatic checkpoint before an object is persisted to etcd, and their design has significant *availability implications*. A `MutatingWebhookConfiguration` with `failurePolicy: Fail` and a broad `rules` match (e.g., all `pods` in all namespaces) becomes a **cluster-wide dependency** -- if the webhook endpoint is unavailable, *no pods can be created*. Best practices include: scoping `rules` narrowly with `objectSelector` or `namespaceSelector`, excluding the `kube-system` namespace, setting reasonable `timeoutSeconds` (default 10, recommend 5), and using `reinvocationPolicy: IfNeeded` when multiple mutating webhooks interact. **Validating Admission Policies** (KEP-3488, GA in 1.30) offer an in-process alternative using *CEL expressions* evaluated by the API server itself, eliminating the network hop and availability risk of external webhooks for common validation scenarios like requiring labels or enforcing resource quotas.",
  ],
  code: [
    {
      language: "yaml",
      caption: "CRD definition for a custom **PostgresCluster** resource with *status subresource* and *printer columns*",
      source: `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: postgresclusters.db.example.com
spec:
  group: db.example.com
  names:
    kind: PostgresCluster
    plural: postgresclusters
    singular: postgrescluster
    shortNames: [pg]
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      subresources:
        status: {}          # enables /status subresource
      additionalPrinterColumns:
        - name: Replicas
          type: integer
          jsonPath: .spec.replicas
        - name: Status
          type: string
          jsonPath: .status.phase
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                replicas:
                  type: integer
                  minimum: 1
                version:
                  type: string
            status:
              type: object
              properties:
                phase:
                  type: string`,
    },
    {
      language: "yaml",
      caption: "**ValidatingWebhookConfiguration** scoped to Deployments with a *namespace selector*",
      source: `apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: require-resource-limits
webhooks:
  - name: limits.policy.example.com
    admissionReviewVersions: [v1]
    sideEffects: None
    timeoutSeconds: 5
    failurePolicy: Fail
    namespaceSelector:
      matchExpressions:
        - key: environment
          operator: In
          values: [production, staging]
    rules:
      - apiGroups: ["apps"]
        apiVersions: ["v1"]
        resources: ["deployments"]
        operations: [CREATE, UPDATE]
    clientConfig:
      service:
        name: webhook-service
        namespace: policy-system
        path: /validate-resource-limits
      caBundle: <base64-encoded-CA>`,
    },
    {
      language: "bash",
      caption: "Useful **kubectl** commands for inspecting *etcd state*, *CRDs*, and *admission webhooks*",
      source: `# Check etcd cluster health (requires etcdctl)
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key \\
  endpoint health --cluster

# List all CRDs and their versions
kubectl get crd -o custom-columns=\\
  NAME:.metadata.name,\\
  GROUP:.spec.group,\\
  VERSION:.spec.versions[0].name,\\
  SCOPE:.spec.scope

# Inspect a specific CRD's schema
kubectl get crd postgresclusters.db.example.com -o jsonpath='{.spec.versions[0].schema.openAPIV3Schema}' | jq .

# List all admission webhooks
kubectl get validatingwebhookconfigurations,mutatingwebhookconfigurations

# Test webhook dry-run (see if admission rejects)
kubectl apply --dry-run=server -f deployment.yaml

# Watch informer-style events on Deployments
kubectl get deployments --watch -o wide`,
    },
  ],
  diagrams: [
    {
      title: "Informer and Work Queue Architecture",
      kind: "flow",
      caption: "Informers maintain a local cache via list and watch. Events go to handlers that enqueue keys. Workers dequeue, read from cache, and reconcile. Failures are re-enqueued with backoff.",
      mermaid: `flowchart LR
    A["etcd\nWatch API"] -->|gRPC stream| B["API Server"]
    B -->|Watch events| C["Reflector\nList plus Watch"]
    C -->|Add Update Delete| D["DeltaFIFO Queue"]
    D -->|Sync| E["Indexer\nLocal Cache"]
    D -->|Events| F["Event Handlers\nAddFunc UpdateFunc DeleteFunc"]
    F -->|Enqueue namespace/name| G["Work Queue\nRate-Limited"]
    G -->|Dequeue| H["Worker Goroutine"]
    H -->|Read from cache| E
    H -->|Compare desired vs actual| I{"State Matches?"}
    I -->|No| J["Reconcile\nCreate Update Delete"]
    I -->|Yes| K["Done - No Action"]
    J -->|Failure| G`,
    },
    {
      title: "Admission Webhook Request Flow",
      kind: "sequence",
      caption: "Mutating webhooks run first and can modify the object. Validating webhooks run second and can only accept or reject. Both run after AuthN and AuthZ but before etcd persistence.",
      mermaid: `sequenceDiagram
    participant C as kubectl
    participant A as API Server
    participant MW as Mutating Webhooks
    participant VW as Validating Webhooks
    participant E as etcd
    C->>A: Create Pod
    A->>A: Authenticate and Authorize RBAC
    A->>MW: mutating admission
    MW-->>A: modified object - sidecar injected
    A->>VW: validating admission
    VW-->>A: accepted - resource limits present
    A->>E: persist object
    E-->>A: stored revision N
    A-->>C: 201 Created
    Note over MW,VW: failurePolicy Fail means\nwebhook down blocks the request`,
    },
    {
      title: "CRD and Operator Architecture",
      kind: "architecture",
      caption: "A CRD adds a new resource type to the API. An operator watches instances of that CRD and runs domain-specific reconciliation logic to manage the application lifecycle.",
      mermaid: `graph TD
    subgraph API["Kubernetes API"]
      CRD["CRD Definition\nPostgresCluster spec"]
      CR["Custom Resource\nmy-db PostgresCluster"]
      API_EP["REST endpoints\nauto-generated by API server"]
    end
    subgraph Operator["Operator Pod"]
      INF["Informer\nwatches PostgresCluster"]
      CTRL["Controller\nreconcile loop"]
      LOGIC["Domain Logic\nprovision replicate backup failover"]
    end
    CRD --> API_EP
    API_EP --> CR
    CR -->|watch event| INF
    INF --> CTRL
    CTRL --> LOGIC
    LOGIC -->|creates manages| RES["StatefulSet Service\nSecrets ConfigMaps"]`,
    },
    {
      title: "etcd Data Model and Watch",
      kind: "network",
      caption: "etcd stores Kubernetes objects at hierarchical keys under /registry. The watch API streams changes from any revision, enabling informers to stay current without polling.",
      mermaid: `graph LR
    subgraph ETCD["etcd Key Space"]
      K1["/registry/deployments/default/nginx"]
      K2["/registry/pods/default/nginx-abc"]
      K3["/registry/services/default/nginx-svc"]
      K4["/registry/secrets/default/db-creds"]
    end
    subgraph Clients["API Server Clients"]
      DC["Deployment Controller\nwatches /registry/deployments"]
      SC["Scheduler\nwatches /registry/pods"]
      KB["Kubelet\nwatches /registry/pods for its node"]
    end
    K1 -->|stream changes\nsince revision N| DC
    K2 -->|stream changes| SC
    K2 -->|stream changes| KB
    NOTE["Raft consensus: leader handles\nall writes, followers replicate\nQuorum required for writes"]`,
    },
  ],
  animations: [
    {
      title: "The reconciliation loop",
      steps: [
        {
          label: "Desired state",
          detail: "You declare what you want. It lives in etcd, reached only through the API server.",
        },
        {
          label: "Watch",
          detail: "Controllers watch for changes to the resources they own.",
        },
        {
          label: "Compare",
          detail: "Each controller compares desired state with observed state.",
        },
        {
          label: "Act",
          detail: "If they differ, it takes one step to close the gap — create a Pod, delete one, update a status.",
        },
        {
          label: "Repeat forever",
          detail: "This never stops. Delete a Pod manually and it comes back, because the loop notices the discrepancy.",
        },
        {
          label: "Why it's robust",
          detail: "Nothing depends on a command succeeding once. The system converges after any failure or restart.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "CRD", "Aggregated API Server", "Admission Webhook"],
    rows: [
      ["**Complexity**", "*Low* -- declarative YAML", "*High* -- custom Go server", "*Medium* -- HTTP endpoint"],
      ["**Storage**", "etcd (automatic)", "Custom backend possible", "N/A (intercepts requests)"],
      ["**Validation**", "OpenAPI v3 schema + CEL", "Arbitrary Go code", "Arbitrary logic in handler"],
      ["**Use case**", "New resource types", "Complex APIs, custom storage", "Policy enforcement, mutation"],
      ["**RBAC support**", "Automatic", "Manual registration", "N/A (acts on existing resources)"],
      ["**Availability risk**", "*None* (built into API server)", "*Moderate* (extra server)", "*High* if `failurePolicy: Fail`"],
      ["**Examples**", "`Certificate`, `VirtualService`", "Metrics API, custom catalogs", "OPA Gatekeeper, Istio injection"],
    ],
  },
  exercises: [
    "**Build a custom controller**: Write a controller in Go (or using a framework like *Kubebuilder*) that watches `ConfigMap` objects with a specific label and creates a corresponding `Secret` with base64-encoded data. Implement proper *error handling* with work queue requeue and *exponential backoff*.",
    "**Create and validate a CRD**: Define a CRD for a `BackupSchedule` resource with fields for `schedule` (cron expression), `targetDatabase`, and `retentionDays`. Add **OpenAPI v3 validation** with `minimum`, `pattern`, and `required` constraints. Verify that `kubectl apply` rejects invalid manifests.",
    "**Implement a mutating webhook**: Build a webhook that automatically injects a `sidecar` container into any Pod created in namespaces labeled `inject-sidecar: \"true\"`. Test with `kubectl apply --dry-run=server` and verify the mutated Pod spec includes the sidecar.",
    "**etcd disaster recovery drill**: Take an *etcd snapshot* using `etcdctl snapshot save`, simulate data loss by deleting a namespace, then restore the snapshot with `etcdctl snapshot restore`. Document the **RPO** (data since last snapshot) and **RTO** (time to restore) you observed.",
    "**Debug an informer cache inconsistency**: Create a scenario where a controller reads stale data from its informer cache (e.g., by disabling resync). Observe the behavior, then fix it by configuring an appropriate `resyncPeriod` and adding a *resourceVersion* check in the reconcile loop.",
  ],
  cheatSheet: [
    "**etcd key format**: `/registry/<resource>/<namespace>/<name>` -- use `etcdctl get /registry/ --prefix --keys-only` to browse stored objects",
    "**CRD short names**: Define `shortNames` in the CRD spec so `kubectl get pg` works instead of `kubectl get postgresclusters`",
    "**Webhook dry-run**: `kubectl apply --dry-run=server -f manifest.yaml` triggers admission webhooks without persisting, ideal for testing policies",
    "**Informer resync**: Set `resyncPeriod` to 0 to disable periodic resync (rely solely on watch events) or to 30s-5m for controllers that need periodic re-evaluation",
    "**Controller rate limiting**: Default work queue uses *exponential backoff* (5ms base, 1000s max) -- override with `workqueue.NewRateLimitingQueue(workqueue.NewItemExponentialFailureRateLimiter(time.Second, 5*time.Minute))`",
    "**CRD status subresource**: Always enable `.subresources.status` so that status updates do not trigger spec validation and can use a separate RBAC verb (`/status`)",
  ],
  revisionNotes: [
    "**etcd** uses *Raft consensus* for leader election and log replication; writes require a quorum. The **MVCC model** tracks revisions, and the `watch` API streams changes from any revision -- this is the foundation of the informer pattern.",
    "**Informers** perform `List` + `Watch`, maintain a local **Indexer** cache, and deliver events to handlers that enqueue keys into a **rate-limited work queue**. `SharedInformerFactory` ensures *one informer per resource type* per process.",
    "**CRDs** declaratively extend the API server with new resource types, providing automatic *CRUD endpoints*, *RBAC*, *etcd storage*, and *kubectl integration*. **Operators** combine CRDs with custom controllers to encode domain-specific operational logic.",
    "**Admission webhooks** intercept requests after AuthN/AuthZ but before persistence. *Mutating* webhooks modify objects (run first); *validating* webhooks accept/reject (run second). `failurePolicy: Fail` makes the webhook a cluster-wide dependency -- scope narrowly and set low `timeoutSeconds`.",
    "**Validating Admission Policies** (GA in K8s 1.30) use *CEL expressions* evaluated in-process by the API server, eliminating the network hop and availability risk of external webhooks for common validation use cases.",
  ],
  resources: [
    {
      label: "Kubernetes documentation — Cluster Architecture",
      kind: "docs",
    },
    {
      label: "Programming Kubernetes — Hausenblas & Schimanski",
      kind: "book",
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
