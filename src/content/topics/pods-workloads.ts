import type { TopicContent } from "../types";

export const podsWorkloads: TopicContent = {
  quickSummary: [
    "A Pod is the smallest deployable unit in Kubernetes -- a group of one or more containers that share the same network namespace, IP address, and storage volumes.",
    "Deployments manage stateless workloads with declarative rolling updates, rollbacks, and ReplicaSet-based scaling.",
    "StatefulSets provide stable network identities, ordered deployment/scaling, and persistent storage for stateful applications like databases.",
    "DaemonSets ensure exactly one pod runs on every (or selected) node, used for log collectors, monitoring agents, and network plugins.",
    "Jobs run batch tasks to completion, while CronJobs schedule Jobs on a cron-based time schedule; init containers run setup tasks before the main containers start.",
  ],
  detailed: [
    "## Pods\n\nA Pod encapsulates one or more containers that are co-located, co-scheduled, and share a network namespace (same IP, localhost communication) and storage volumes. Multi-container pods use sidecar patterns: a logging sidecar ships logs from a shared volume, an ambassador proxies outbound traffic, or an adapter normalizes metrics. Pods are ephemeral by design -- they can be killed, rescheduled, or replaced at any time. You rarely create pods directly; instead, you use higher-level workload controllers that manage pod lifecycle.",
    "## Deployments\n\nA Deployment declares the desired state for a set of identical pods. It creates and manages ReplicaSets, which in turn manage pods. Rolling updates work by creating a new ReplicaSet with the updated pod template and gradually scaling it up while scaling down the old one, controlled by `maxSurge` and `maxUnavailable` parameters. Rollbacks are instant because old ReplicaSets are retained (controlled by `revisionHistoryLimit`). Deployments support pause/resume for canary-style partial rollouts and integrate with Horizontal Pod Autoscalers for dynamic scaling.",
    "## StatefulSets\n\nStatefulSets are designed for workloads that need stable, unique identity and persistent storage. Each pod gets a predictable name (`web-0`, `web-1`), a stable DNS hostname via a headless Service, and its own PersistentVolumeClaim that is retained even if the pod is deleted. Pods are created and terminated in order (0, 1, 2... and reverse). This is critical for clustered applications like Kafka, ZooKeeper, or PostgreSQL with streaming replication where identity and startup order matter. The `podManagementPolicy: Parallel` option relaxes ordering when not needed.",
    "## DaemonSets\n\nA DaemonSet ensures one pod runs on every node (or a subset selected by nodeSelector/affinity). When nodes join the cluster, the DaemonSet controller automatically schedules a pod on them. Common uses include log collection (Fluentd, Filebeat), node monitoring (Prometheus node-exporter), network plugins (Calico, Cilium), and storage drivers (CSI node plugins). DaemonSets support rolling updates with `maxUnavailable` to control the update pace. They bypass the scheduler by default, using node affinity instead.",
    "## Jobs and CronJobs\n\nA Job creates one or more pods that run to completion. It tracks successful completions and retries failed pods up to `backoffLimit`. Parallel Jobs (`parallelism` > 1) run multiple pods concurrently for batch processing. A CronJob creates Jobs on a cron schedule (e.g., `0 2 * * *` for 2 AM daily). It manages concurrency via `concurrencyPolicy` (Allow, Forbid, Replace) and retains a configurable number of successful/failed Job histories. Use cases include database backups, report generation, and data pipeline steps.",
    "## Init Containers\n\nInit containers run before the main application containers start, executing in order (each must succeed before the next begins). They share the pod's volumes but can use different images, making them ideal for setup tasks: waiting for a dependent service to be ready, cloning a git repo into a shared volume, generating config files, or running database migrations. If an init container fails, Kubernetes restarts the pod (subject to `restartPolicy`). Init containers do not count toward resource limits of the running pod once they complete.",
  ],
  interviewQA: [
    {
      q: "When would you use a StatefulSet instead of a Deployment?",
      a: "Use a StatefulSet when pods need stable network identities (predictable hostnames), persistent storage that follows the pod across rescheduling, or ordered startup/shutdown. Databases, message queues (Kafka), and distributed coordination systems (ZooKeeper, etcd) are classic examples. If pods are interchangeable and stateless, a Deployment is simpler and more flexible.",
      followUps: [
        "How does a headless Service work with StatefulSets?",
        "What happens to PVCs when a StatefulSet pod is deleted?",
      ],
    },
    {
      q: "Explain how a Deployment performs a rolling update.",
      a: "The Deployment controller creates a new ReplicaSet with the updated pod template. It scales up the new ReplicaSet and scales down the old one incrementally, respecting `maxSurge` (how many extra pods above desired count) and `maxUnavailable` (how many pods can be unavailable during the update). At each step, it waits for new pods to become Ready before continuing. If a pod fails readiness checks, the rollout stalls, preventing a bad update from completing. The old ReplicaSet is retained for instant rollback.",
      followUps: [
        "How do you roll back a failed Deployment update?",
        "What is the difference between Recreate and RollingUpdate strategies?",
      ],
    },
    {
      q: "What are init containers and when would you use them?",
      a: "Init containers are specialized containers that run to completion before the main app containers start. They run sequentially -- each must succeed before the next begins. Common uses include waiting for a database to be available, downloading configuration or secrets from a vault, running database migrations, or cloning application code from a repository. They can use different images from the main containers and share the pod's volumes for data handoff.",
    },
    {
      q: "How does a DaemonSet differ from a Deployment with node affinity?",
      a: "A DaemonSet guarantees exactly one pod per matching node and automatically adds pods when new nodes join the cluster. A Deployment with node affinity can schedule pods on specific nodes but does not guarantee one-per-node coverage or automatically react to new nodes. DaemonSets are the right choice for node-level agents like log collectors, monitoring exporters, and CNI plugins that must run on every node.",
    },
  ],
  followUps: [
    "When do you need a StatefulSet rather than a Deployment?",
    "What is a sidecar for, and what does it cost?",
    "Why is a bare Pod almost never what you want?",
  ],
  mcqs: [
    {
      q: "What guarantees does a StatefulSet provide that a Deployment does not?",
      options: [
        "Automatic horizontal scaling based on CPU usage",
        "Stable network identity, ordered deployment, and persistent storage per pod",
        "Zero-downtime rolling updates with maxSurge control",
        "Automatic bin-packing of pods across nodes",
      ],
      answerIndex: 1,
      explanation:
        "StatefulSets provide stable pod names, headless Service DNS entries, ordered create/delete, and per-pod PVCs -- none of which Deployments offer.",
    },
    {
      q: "What controls the pace of a Deployment rolling update?",
      options: [
        "replicas and revisionHistoryLimit",
        "maxSurge and maxUnavailable",
        "parallelism and completions",
        "minReadySeconds and progressDeadlineSeconds only",
      ],
      answerIndex: 1,
      explanation:
        "`maxSurge` controls how many pods above desired count can exist during the update, and `maxUnavailable` controls how many can be down simultaneously.",
    },
    {
      q: "When does a DaemonSet schedule a new pod?",
      options: [
        "Only when manually triggered with kubectl",
        "When a new node matching its selector joins the cluster",
        "On a cron schedule defined in the DaemonSet spec",
        "When the HPA detects increased CPU usage",
      ],
      answerIndex: 1,
      explanation:
        "The DaemonSet controller watches for new nodes and automatically schedules a pod on any node that matches its node selector or affinity rules.",
    },
    {
      q: "What does a CronJob's `concurrencyPolicy: Forbid` do?",
      options: [
        "Prevents the CronJob from creating any Jobs",
        "Skips a new Job run if the previous one is still active",
        "Cancels the running Job and starts a new one",
        "Runs Jobs in parallel without limit",
      ],
      answerIndex: 1,
      explanation:
        "`Forbid` skips the scheduled Job creation if the previous Job has not yet completed, preventing overlapping executions.",
    },
  ],
  flashcards: [
    {
      front: "What is a Pod?",
      back: "The smallest deployable unit in K8s -- one or more containers sharing a network namespace (same IP) and storage volumes.",
    },
    {
      front: "What does a Deployment manage?",
      back: "Stateless workloads via ReplicaSets, providing rolling updates, rollbacks, and declarative scaling.",
    },
    {
      front: "What makes StatefulSets special?",
      back: "Stable pod names (web-0, web-1), persistent per-pod storage via PVCs, ordered startup/teardown, and stable DNS via headless Services.",
    },
    {
      front: "What is a DaemonSet?",
      back: "A workload controller ensuring exactly one pod runs on every (or selected) node, auto-scheduling on new nodes.",
    },
    {
      front: "Job vs CronJob?",
      back: "A Job runs pods to completion (one-time batch). A CronJob creates Jobs on a cron schedule (recurring batch).",
    },
    {
      front: "What are init containers?",
      back: "Containers that run sequentially before main containers start, used for setup tasks like migrations, config generation, or dependency checks.",
    },
    {
      front: "What do maxSurge and maxUnavailable control?",
      back: "The pace of rolling updates: maxSurge = extra pods allowed above desired count; maxUnavailable = pods that can be down during update.",
    },
    {
      front: "What are common multi-container pod patterns?",
      back: "Sidecar (logging, proxying), Ambassador (outbound proxy), Adapter (metrics normalization).",
    },
  ],
  deepDive: [
    "The **Pod networking model** is foundational to understanding Kubernetes workloads. Every Pod gets its own *unique IP address* within the cluster, and all containers within a Pod share that IP and can reach each other via `localhost`. This **shared network namespace** means containers in the same Pod must coordinate on port usage -- if two containers both try to bind port `8080`, one will fail. The *pause container* (also called the **infrastructure container**) is a hidden container that holds the network namespace alive for the Pod. When the main application container restarts, the network namespace persists because the pause container is still running. This architecture enables the **sidecar pattern**: an Envoy proxy sidecar can intercept all traffic on `localhost` without any network configuration changes to the application container.",
    "**Rolling update mechanics** in Deployments involve a sophisticated coordination between the *Deployment controller*, *ReplicaSets*, and *readiness probes*. When you update a Deployment's Pod template, the controller creates a **new ReplicaSet** with `replicas: 0` and begins scaling it up while scaling down the old ReplicaSet. The `maxSurge` parameter (default *25%*) controls how many extra Pods above the desired count can exist during the update, while `maxUnavailable` (default *25%*) controls how many Pods can be unavailable. At each step, the controller waits for new Pods to pass their **readiness probe** before continuing. If a Pod fails its readiness check, the rollout **stalls** -- this is the safety mechanism that prevents bad updates from completing. The `minReadySeconds` parameter adds an additional delay, requiring Pods to be ready for a minimum duration before the rollout proceeds.",
    "**StatefulSet ordering guarantees** are implemented through a *strict state machine* in the StatefulSet controller. During scale-up, Pod `N` is not created until Pod `N-1` is **Running and Ready** (passes readiness probe). During scale-down, Pod `N` is terminated before Pod `N-1`. This ordering is critical for *clustered applications* like **ZooKeeper** (leader must be established before followers join) and **Cassandra** (seed nodes must be ready before non-seed nodes bootstrap). The `podManagementPolicy: Parallel` option relaxes this ordering when startup order does not matter, allowing all Pods to launch simultaneously. The **stable network identity** (`<pod-name>.<headless-service>.<namespace>.svc.cluster.local`) combined with **persistent PVCs** ensures that even after rescheduling, a Pod gets the *same DNS name* and the *same storage volume*, maintaining identity across failures.",
  ],
  code: [
    {
      language: "yaml",
      caption: "Deployment with rolling update strategy and readiness probe",
      source: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # At most 1 extra pod during update
      maxUnavailable: 0     # Zero downtime -- all pods must be ready
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: app
          image: myapp:v2.1.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi`,
    },
    {
      language: "yaml",
      caption: "StatefulSet with headless Service and volumeClaimTemplates",
      source: `apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None          # Headless service for stable DNS
  selector:
    app: postgres
  ports:
    - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  podManagementPolicy: OrderedReady   # Default: ordered startup
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:       # Per-pod persistent storage
    - metadata:
        name: pgdata
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi`,
    },
    {
      language: "bash",
      caption: "Essential kubectl commands for workload management",
      source: `# --- Deployments ---
kubectl rollout status deployment/web-app        # Watch rollout progress
kubectl rollout history deployment/web-app       # View revision history
kubectl rollout undo deployment/web-app          # Rollback to previous
kubectl rollout undo deployment/web-app --to-revision=3  # Specific revision

# --- Scaling ---
kubectl scale deployment/web-app --replicas=5    # Manual scale
kubectl autoscale deployment/web-app \\
  --min=2 --max=10 --cpu-percent=70              # HPA auto-scale

# --- Pod inspection ---
kubectl get pods -l app=web-app -o wide          # List with node info
kubectl describe pod web-app-6d4f5b7c8-x2k9n    # Detailed pod info
kubectl logs web-app-6d4f5b7c8-x2k9n -c sidecar # Specific container log
kubectl exec -it web-app-6d4f5b7c8-x2k9n -- sh  # Shell into pod

# --- DaemonSet / Jobs ---
kubectl get daemonset -n kube-system             # System DaemonSets
kubectl create job test-job --from=cronjob/backup # Manual CronJob trigger`,
    },
  ],
  diagrams: [
    {
      title: "Deployment Rolling Update Process",
      kind: "sequence",
      caption: "The Deployment controller creates a new ReplicaSet and gradually shifts traffic by scaling up new pods and scaling down old ones.",
      mermaid: `sequenceDiagram
    participant D as Deployment Controller
    participant RS1 as Old ReplicaSet
    participant RS2 as New ReplicaSet
    participant P as Readiness Probe
    D->>RS2: Create new ReplicaSet replicas=0
    D->>RS2: Scale up to 1
    RS2->>P: Pod starts, probe check
    P-->>RS2: Ready
    D->>RS1: Scale down by 1
    D->>RS2: Scale up to 2
    RS2->>P: Pod starts, probe check
    P-->>RS2: Ready
    D->>RS1: Scale down by 1
    D->>RS2: Scale up to 3
    RS2->>P: Pod starts, probe check
    P-->>RS2: Ready
    D->>RS1: Scale down to 0
    Note over D: Rollout complete`,
    },
    {
      title: "Pod Lifecycle States",
      kind: "state",
      caption: "A Pod transitions through Pending, Running, and terminal states (Succeeded or Failed).",
      mermaid: `stateDiagram-v2
    [*] --> Pending
    Pending --> Running: Scheduled and containers started
    Running --> Succeeded: All containers exit 0
    Running --> Failed: Container exits non-zero
    Running --> Unknown: Node unreachable
    Pending --> Failed: Image pull error or insufficient resources
    Failed --> [*]
    Succeeded --> [*]
    Unknown --> Running: Node reconnects
    Unknown --> Failed: Node confirmed down`,
    },
    {
      title: "Kubernetes Workload Controllers Hierarchy",
      kind: "architecture",
      caption: "Higher-level controllers manage lower-level resources, ultimately managing Pods.",
      mermaid: `graph TD
    CJ[CronJob] --> J[Job]
    J --> P1[Pod - batch]
    Deploy[Deployment] --> RS[ReplicaSet]
    RS --> P2[Pod - stateless]
    SS[StatefulSet] --> P3[Pod - stable identity]
    SS --> PVC[PersistentVolumeClaim]
    DS[DaemonSet] --> P4[Pod - per node]
    P3 --> PVC`,
    },
    {
      title: "Workload Controller Selection",
      kind: "flow",
      caption: "Decision tree for choosing the right Kubernetes workload controller based on the application characteristics.",
      mermaid: `flowchart TD
    Start([What is your workload?]) --> Q1{Does each instance need\nstable identity or storage?}
    Q1 -->|Yes| SS[StatefulSet\nDatabases, Kafka, ZooKeeper]
    Q1 -->|No| Q2{Should it run on\nevery node?}
    Q2 -->|Yes| DS[DaemonSet\nLog collectors, monitoring agents]
    Q2 -->|No| Q3{Does it run to completion\nor run indefinitely?}
    Q3 -->|Runs to completion| Q4{Scheduled or on-demand?}
    Q3 -->|Runs indefinitely| Deploy[Deployment\nAPIs, web apps, microservices]
    Q4 -->|Scheduled| CJ[CronJob\nBackups, cleanup, reports]
    Q4 -->|On-demand| Job[Job\nMigrations, batch processing]`,
    },
  ],
  animations: [
    {
      title: "Deployment vs StatefulSet on a rolling update",
      steps: [
        {
          label: "Deployment",
          detail: "Pods are interchangeable, with random names and no stable identity.",
        },
        {
          label: "Rolling update",
          detail: "New Pods start, old ones terminate, in any order. A Pod's replacement is not 'the same' Pod.",
        },
        {
          label: "StatefulSet",
          detail: "Pods have stable ordinal names — `db-0`, `db-1` — and each keeps its own PersistentVolumeClaim.",
        },
        {
          label: "Ordered rollout",
          detail: "Updated in reverse ordinal order, one at a time, waiting for each to be ready.",
        },
        {
          label: "Why it matters",
          detail: "A database replica must reattach to its own data and keep its identity for peers to find it.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Controller", "Identity", "Scaling Order", "Storage", "Best For"],
    rows: [
      ["**Deployment**", "Pods are *interchangeable*", "Parallel (any order)", "Shared or none", "Stateless web apps, APIs, microservices"],
      ["**StatefulSet**", "*Stable* names (`app-0`, `app-1`)", "Ordered (0, 1, 2...)", "Per-pod **PVC** retained", "Databases, Kafka, ZooKeeper"],
      ["**DaemonSet**", "One pod *per node*", "N/A (auto per node)", "HostPath or shared", "Log collectors, monitoring agents, CNI plugins"],
      ["**Job**", "Pods run to *completion*", "Parallel via `parallelism`", "Optional", "Batch processing, data migrations"],
      ["**CronJob**", "Scheduled *Job creation*", "Per schedule tick", "Optional", "Backups, report generation, cleanup tasks"],
    ],
  },
  exercises: [
    "Create a **Deployment** with *3 replicas*, a `readinessProbe`, and `maxSurge: 1` / `maxUnavailable: 0`. Update the image tag and observe the rolling update with `kubectl rollout status`.",
    "Deploy a **StatefulSet** with a *headless Service* and `volumeClaimTemplates`. Verify that each Pod gets a *stable DNS name* using `nslookup <pod-name>.<service-name>` from within the cluster.",
    "Create a **DaemonSet** running a log collector. Use `nodeSelector` to restrict it to *worker nodes only*. Add a new node and verify the DaemonSet automatically schedules a Pod on it.",
    "Write a **CronJob** that runs every 5 minutes with `concurrencyPolicy: Forbid`. Simulate a long-running Job and verify that the next scheduled run is *skipped* rather than overlapping.",
    "Create a Pod with an **init container** that waits for a database Service to be available (using `nslookup`) before the main container starts. Test by creating the Service *after* the Pod.",
  ],
  cheatSheet: [
    "`kubectl rollout undo deployment/<name>` -- instant rollback to previous ReplicaSet revision",
    "`kubectl scale deployment/<name> --replicas=N` -- manual scaling; combine with **HPA** for auto-scaling on CPU/memory",
    "**maxSurge=1, maxUnavailable=0** -- zero-downtime rolling update (at most 1 extra pod, never fewer than desired)",
    "StatefulSet pods: `<pod-name>.<headless-svc>.<ns>.svc.cluster.local` -- *stable DNS* survives rescheduling",
    "`kubectl rollout status deployment/<name>` -- watch rollout progress; exits non-zero if rollout fails",
    "`concurrencyPolicy: Forbid` on CronJobs -- prevents overlapping runs; `Replace` cancels the running Job and starts a new one",
  ],
  revisionNotes: [
    "**Pods** are the atomic unit -- containers in a Pod share *network namespace* (same IP, localhost) and *storage volumes*. Pods are ephemeral; use controllers for reliability.",
    "**Deployments** manage *stateless* workloads via ReplicaSets. Rolling updates are controlled by `maxSurge` and `maxUnavailable`. Old ReplicaSets are retained for instant `rollout undo`.",
    "**StatefulSets** provide three guarantees: *stable network identity* (predictable names + headless Service DNS), *ordered deployment/scaling*, and *persistent per-pod storage* via `volumeClaimTemplates`.",
    "**DaemonSets** ensure *one Pod per matching node*. New nodes automatically get a Pod. Common for node-level agents: logging, monitoring, networking.",
    "**Init containers** run *sequentially before* main containers. Each must succeed (exit 0) before the next starts. They share Pod volumes but can use different images for setup tasks.",
  ],
  resources: [
    {
      label: "Kubernetes documentation — Workloads",
      kind: "docs",
    },
    {
      label: "Kubernetes Patterns — Ibryam & Huß",
      kind: "book",
    },
  ],
  glossary: [
    {
      term: "Pod",
      definition:
        "The atomic scheduling unit in Kubernetes -- one or more co-located containers sharing network and storage.",
    },
    {
      term: "Deployment",
      definition:
        "A workload controller for stateless applications that manages ReplicaSets and provides rolling updates and rollbacks.",
    },
    {
      term: "StatefulSet",
      definition:
        "A workload controller providing stable identity, ordered operations, and persistent storage for stateful applications.",
    },
    {
      term: "DaemonSet",
      definition:
        "A controller ensuring a copy of a pod runs on every (or selected) node in the cluster.",
    },
    {
      term: "ReplicaSet",
      definition:
        "A controller that maintains a stable set of replica pods, typically managed by a Deployment rather than used directly.",
    },
    {
      term: "Init Container",
      definition:
        "A container that runs to completion before application containers start, used for one-time setup tasks within a pod.",
    },
    {
      term: "CronJob",
      definition:
        "A controller that creates Job objects on a repeating cron schedule for periodic batch tasks.",
    },
    {
      term: "Headless Service",
      definition:
        "A Service with clusterIP: None that returns individual pod IPs in DNS, used by StatefulSets for stable per-pod DNS entries.",
    },
  ],
};
