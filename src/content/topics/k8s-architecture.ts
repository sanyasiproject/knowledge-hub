import type { TopicContent } from "../types";

export const k8sArchitecture: TopicContent = {
  quickSummary: [
    "Kubernetes follows a declarative, control-plane / worker-node architecture where users specify desired state and controllers continuously reconcile actual state to match.",
    "The control plane consists of the API server (central gateway), etcd (distributed key-value store), kube-scheduler (pod placement), and controller manager (reconciliation loops).",
    "Worker nodes run kubelet (node agent enforcing pod specs), kube-proxy (network rules for Service routing), and a container runtime (containerd or CRI-O).",
    "The reconciliation loop is the heart of Kubernetes: controllers watch desired state in etcd via the API server and take corrective action whenever actual state drifts.",
    "All communication flows through the API server -- no component talks to etcd directly except the API server, providing a single audit and authentication point.",
  ],
  detailed: [
    "## API Server (kube-apiserver)\n\nThe API server is the front door to the cluster. Every kubectl command, controller watch, and kubelet heartbeat passes through it. It validates and persists resource objects to etcd, serves the RESTful API (OpenAPI spec), handles authentication (certificates, tokens, OIDC), authorization (RBAC, ABAC, webhooks), and admission control (mutating and validating webhooks). It is horizontally scalable -- production clusters typically run multiple replicas behind a load balancer. The API server is stateless; all persistent state lives in etcd.",
    "## etcd\n\netcd is a distributed, strongly consistent key-value store that holds the entire cluster state: every pod, service, secret, configmap, and custom resource. It uses the Raft consensus algorithm to replicate data across an odd number of members (typically 3 or 5) and tolerates (n-1)/2 failures. etcd's watch API is what makes the reconciliation loop efficient -- controllers subscribe to changes rather than polling. Performance tuning includes dedicated SSDs, separate etcd clusters for events, and regular snapshot backups. etcd is the single source of truth; losing it without backup means losing the cluster.",
    "## Scheduler (kube-scheduler)\n\nThe scheduler assigns unscheduled pods to nodes through a two-phase process: filtering (which nodes can run the pod based on resource requests, taints, affinity, topology constraints) and scoring (which eligible node is best, considering factors like resource balance, data locality, and spreading). The scheduler is pluggable -- the scheduling framework allows custom filter and score plugins. It respects priorities and preemption: high-priority pods can evict lower-priority ones. The scheduler only makes placement decisions; kubelet is responsible for actually running the pod.",
    "## Controller Manager (kube-controller-manager)\n\nThe controller manager runs a collection of control loops, each responsible for a specific resource type. The Deployment controller ensures the right number of ReplicaSets exist, the ReplicaSet controller ensures the right number of pods exist, the Node controller monitors node health and evicts pods from unhealthy nodes, and the Job controller manages batch workload completion. Each controller follows the same pattern: watch desired state, observe actual state, compute the diff, and take action. Controllers are level-triggered (reacting to current state, not edge-triggered events), making them naturally idempotent and resilient to missed events.",
    "## Worker Node Components\n\nEach worker node runs three key components. **Kubelet** is the node agent that receives pod specs from the API server and ensures the described containers are running and healthy. It manages container lifecycle through the Container Runtime Interface (CRI), reports node status, and runs liveness/readiness/startup probes. **Kube-proxy** maintains network rules on each node that implement Service abstractions -- it can use iptables rules, IPVS, or eBPF (via Cilium) to route cluster-internal traffic to the correct pod endpoints. **Container runtime** (containerd, CRI-O) pulls images, creates containers using OCI specs, and manages their lifecycle.",
    "## The Reconciliation Loop\n\nThe reconciliation loop is the fundamental design pattern of Kubernetes. A user declares desired state (e.g., 'run 3 replicas of nginx'). The API server stores this in etcd. A controller watches for changes and compares desired state to actual state. If they differ, the controller takes corrective action (create pods, delete extras, update configurations). This loop runs continuously, making the system self-healing: if a node dies, controllers detect the drift and reschedule pods elsewhere. The declarative model plus continuous reconciliation is what distinguishes Kubernetes from imperative orchestration systems.",
  ],
  interviewQA: [
    {
      q: "Walk me through what happens when you run `kubectl apply -f deployment.yaml`.",
      a: "kubectl sends an HTTP request to the API server. The API server authenticates the user, authorizes the request via RBAC, runs admission controllers (mutating then validating), and persists the Deployment object to etcd. The Deployment controller notices the new object (via a watch), creates a ReplicaSet. The ReplicaSet controller sees the ReplicaSet, creates Pod objects. The scheduler notices unscheduled pods, assigns them to nodes. The kubelet on each assigned node detects its new pod, pulls the container image via the container runtime, and starts the containers.",
      followUps: [
        "What role do admission webhooks play in this flow?",
        "What happens if the scheduler cannot find a suitable node?",
        "How does the Deployment controller handle a rolling update?",
      ],
    },
    {
      q: "Why does Kubernetes use etcd, and what happens if etcd goes down?",
      a: "Kubernetes needs a strongly consistent store for cluster state because multiple controllers make decisions based on that state simultaneously. etcd provides this via the Raft consensus protocol. If etcd loses quorum (more than half the members fail), the API server cannot read or write state -- the cluster becomes effectively read-only at the node level. Existing workloads continue running because kubelets operate independently, but no new scheduling, scaling, or healing occurs. This is why etcd is deployed as an odd-numbered cluster with regular backups.",
      followUps: [
        "How do you back up and restore etcd?",
        "What is the impact of etcd latency on cluster performance?",
      ],
    },
    {
      q: "Explain the difference between level-triggered and edge-triggered controllers.",
      a: "Edge-triggered controllers react to events (state changes) -- they fire when something happens. Level-triggered controllers react to current state -- they check what the state IS, regardless of how it got there. Kubernetes controllers are level-triggered: they compare desired state to actual state on every sync. This makes them resilient to missed events. If a controller crashes and restarts, it simply re-examines current state and takes corrective action, without needing an event replay mechanism.",
    },
    {
      q: "How does kube-proxy implement Service routing?",
      a: "Kube-proxy watches the API server for Service and Endpoints objects. In iptables mode (default), it programs iptables rules that DNAT (destination NAT) traffic destined for a Service ClusterIP to one of the backing pod IPs, using random or round-robin selection. In IPVS mode, it uses Linux IPVS for more efficient load balancing with configurable algorithms. Some CNI plugins like Cilium replace kube-proxy entirely with eBPF programs for better performance.",
      followUps: [
        "What are the drawbacks of iptables mode at scale?",
        "How does IPVS mode improve on iptables?",
      ],
    },
  ],
  mcqs: [
    {
      q: "Which component is the ONLY one that communicates directly with etcd?",
      options: [
        "kube-scheduler",
        "kube-controller-manager",
        "kube-apiserver",
        "kubelet",
      ],
      answerIndex: 2,
      explanation:
        "All cluster state access is funneled through the API server. No other component reads from or writes to etcd directly, providing a single point for authentication, authorization, and audit logging.",
    },
    {
      q: "What consensus algorithm does etcd use for replication?",
      options: ["Paxos", "Raft", "Zab", "Viewstamped Replication"],
      answerIndex: 1,
      explanation:
        "etcd uses the Raft consensus algorithm, which elects a leader and replicates log entries to followers, tolerating (n-1)/2 node failures in a cluster of n members.",
    },
    {
      q: "What are the two phases of the kube-scheduler's node selection process?",
      options: [
        "Mapping and Reducing",
        "Filtering and Scoring",
        "Selecting and Binding",
        "Queuing and Dispatching",
      ],
      answerIndex: 1,
      explanation:
        "The scheduler first filters nodes that cannot run the pod (resource constraints, taints, affinity rules), then scores the remaining nodes to find the best placement.",
    },
    {
      q: "Kubernetes controllers are described as 'level-triggered'. What does this mean?",
      options: [
        "They trigger only when a state change event occurs",
        "They react to the current state, not to individual events",
        "They run at a fixed trigger level of priority",
        "They require explicit triggers from the API server",
      ],
      answerIndex: 1,
      explanation:
        "Level-triggered controllers examine current state (what IS) rather than reacting to events (what CHANGED). This makes them naturally idempotent and resilient to missed events.",
    },
    {
      q: "What happens to running workloads if etcd loses quorum?",
      options: [
        "All pods are immediately terminated",
        "Pods continue running but no new scheduling or healing occurs",
        "Kubelet restarts all pods on their current nodes",
        "The cluster automatically fails over to a backup etcd",
      ],
      answerIndex: 1,
      explanation:
        "Kubelet operates independently and keeps existing pods running. However, without etcd quorum the API server cannot persist changes, so no new pods can be scheduled and no self-healing can occur.",
    },
  ],
  flashcards: [
    {
      front: "What are the four control plane components?",
      back: "API server, etcd, kube-scheduler, and kube-controller-manager.",
    },
    {
      front: "What are the three worker node components?",
      back: "Kubelet (node agent), kube-proxy (network rules), and container runtime (containerd/CRI-O).",
    },
    {
      front: "What is the reconciliation loop?",
      back: "A continuous control loop where controllers compare desired state (in etcd) to actual state and take corrective action to eliminate drift.",
    },
    {
      front: "Why is etcd deployed in odd-numbered clusters?",
      back: "Raft consensus requires a majority (quorum) to commit writes. Odd numbers maximize fault tolerance per node -- 3 nodes tolerate 1 failure, 5 tolerate 2.",
    },
    {
      front: "What does the kube-scheduler do?",
      back: "It assigns unscheduled pods to nodes by filtering (feasibility) then scoring (optimality), but does not run the pod itself -- kubelet does that.",
    },
    {
      front: "Why does only the API server talk to etcd?",
      back: "Funneling all access through the API server provides a single point for authentication, authorization, admission control, and audit logging.",
    },
    {
      front: "What is the role of kubelet?",
      back: "The node agent that receives pod specs from the API server, manages container lifecycle via CRI, runs probes, and reports node/pod status.",
    },
    {
      front: "How does kube-proxy implement Services?",
      back: "It watches Service/Endpoints objects and programs iptables/IPVS rules to DNAT traffic from Service ClusterIPs to backing pod IPs.",
    },
  ],
  deepDive: [
    "**The API Server as the nervous system of Kubernetes.** Every interaction with a Kubernetes cluster — whether from `kubectl`, a CI/CD pipeline, a custom operator, or an internal controller — flows through the **kube-apiserver**. It exposes a *RESTful API* over HTTPS, and its request lifecycle is both elegant and extensible. An incoming request first hits **authentication** (client certificates, bearer tokens, OIDC providers, or webhook token review). Next, **authorization** — typically *RBAC* — determines whether the authenticated identity may perform the requested verb on the target resource. Then the request passes through a chain of **admission controllers**: *mutating* webhooks can inject sidecars or default labels, while *validating* webhooks can enforce organizational policies like requiring resource limits. Only after passing all these gates is the object serialized and written to **etcd** via a consistent write. The API server's *watch* mechanism (built on HTTP/2 streaming or long-poll) is what makes the entire controller ecosystem reactive — controllers open watch streams and receive near-real-time notifications of state changes, enabling the reconciliation-based architecture that defines Kubernetes.",
    "**etcd and the guarantees that make orchestration possible.** Distributed systems require a *source of truth* that is both **highly available** and **strongly consistent**. etcd provides exactly this by implementing the **Raft consensus protocol**, where a single elected leader serializes all writes and replicates them to followers before acknowledging. In a 5-node etcd cluster, up to 2 nodes can fail without losing quorum — and read requests can be served from any member when *linearizable reads* are not required (though Kubernetes defaults to linearizable). The performance implications are significant: every `kubectl apply`, every controller reconciliation, and every scheduler binding ultimately results in an etcd write. This is why production clusters isolate etcd on **dedicated SSD-backed nodes**, tune `heartbeat-interval` and `election-timeout` for network conditions, and implement `--quota-backend-bytes` to prevent unbounded growth. Operational best practices include automated **snapshot backups** (via `etcdctl snapshot save`), monitoring with metrics like `etcd_server_has_leader` and `etcd_disk_wal_fsync_duration_seconds`, and never exceeding 8 GB of data per cluster without careful evaluation.",
    "**The reconciliation model and why it enables self-healing infrastructure.** The *reconciliation loop* is not just an implementation detail — it is the **fundamental design philosophy** that separates Kubernetes from imperative orchestration tools. In an imperative system, you issue commands: \"start 3 containers.\" If one dies, you must detect and re-issue the command. In Kubernetes' **declarative model**, you state desired reality: \"there should be 3 replicas.\" Controllers then *continuously* compare this desired state (persisted in etcd) against actual state (observed from the cluster). The diff drives action — create a pod here, delete one there, update a label, restart a container. Because controllers are **level-triggered** rather than *edge-triggered*, they are inherently resilient to failures: if a controller crashes and restarts, it simply re-reads current state and acts, with no need to replay an event log. This design pattern extends beyond built-in controllers — the **Operator pattern** lets teams encode complex application lifecycle management (database failovers, certificate rotations, schema migrations) as custom controllers watching *CustomResourceDefinitions* (CRDs), making Kubernetes an extensible platform rather than a fixed orchestrator."
  ],
  code: [
    {
      language: "yaml",
      caption: "Deployment manifest with resource limits, health probes, and topology spread constraints",
      source: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
  labels:
    app: web-api
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web-api
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web-api
      containers:
        - name: web-api
          image: registry.example.com/web-api:v2.4.1
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20`
    },
    {
      language: "bash",
      caption: "Essential kubectl commands for inspecting cluster architecture and debugging",
      source: `# --- Cluster & Node Inspection ---
# View all control-plane and worker nodes with status and roles
kubectl get nodes -o wide

# Describe a specific node (capacity, allocatable, taints, conditions)
kubectl describe node <node-name>

# Check component health (scheduler, controller-manager, etcd)
kubectl get componentstatuses          # deprecated but still works
kubectl get --raw='/readyz?verbose'     # preferred health endpoint

# --- Workload Debugging ---
# List all pods across namespaces with node placement
kubectl get pods -A -o wide

# Watch pod events in real time (useful for scheduling failures)
kubectl get events --sort-by='.lastTimestamp' -w

# Inspect why a pod is Pending (scheduler issues, resource pressure)
kubectl describe pod <pod-name> -n <namespace>

# Stream container logs (current + previous crash)
kubectl logs <pod-name> -c <container> -f --previous

# --- RBAC & API Access ---
# Check if a service account can perform an action
kubectl auth can-i create deployments --as=system:serviceaccount:default:my-sa

# List all cluster roles and bindings
kubectl get clusterroles,clusterrolebindings | grep -v system:`
    },
    {
      language: "yaml",
      caption: "ClusterRole and ClusterRoleBinding for a read-only monitoring service account",
      source: `# ClusterRole: grants read access to core resources
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring-reader
rules:
  - apiGroups: [""]
    resources: ["pods", "nodes", "services", "endpoints", "namespaces"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["metrics.k8s.io"]
    resources: ["pods", "nodes"]
    verbs: ["get", "list"]
---
# ClusterRoleBinding: binds the role to a service account
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: monitoring-reader-binding
subjects:
  - kind: ServiceAccount
    name: monitoring-agent
    namespace: monitoring
roleRef:
  kind: ClusterRole
  name: monitoring-reader
  apiGroup: rbac.authorization.k8s.io`
    }
  ],
  diagrams: [
    {
      title: "Kubernetes Cluster Architecture",
      kind: "architecture",
      caption: "High-level view of control plane and worker node components with communication flows",
      mermaid: `graph TB
  subgraph CP["Control Plane"]
    API["kube-apiserver<br/><i>REST gateway, auth, admission</i>"]
    ETCD["etcd<br/><i>Raft consensus, cluster state</i>"]
    SCHED["kube-scheduler<br/><i>Filter → Score → Bind</i>"]
    CM["kube-controller-manager<br/><i>Deployment, ReplicaSet,<br/>Node, Job controllers</i>"]
  end

  subgraph W1["Worker Node 1"]
    KL1["kubelet<br/><i>Pod lifecycle, CRI, probes</i>"]
    KP1["kube-proxy<br/><i>iptables / IPVS rules</i>"]
    CR1["containerd<br/><i>Container runtime</i>"]
    P1["Pod A"]
    P2["Pod B"]
  end

  subgraph W2["Worker Node 2"]
    KL2["kubelet"]
    KP2["kube-proxy"]
    CR2["containerd"]
    P3["Pod C"]
  end

  API <-->|"read/write state"| ETCD
  SCHED -->|"watch unscheduled pods"| API
  CM -->|"watch & reconcile"| API
  KL1 -->|"report status & watch specs"| API
  KL2 -->|"report status & watch specs"| API
  KP1 -->|"watch Services/Endpoints"| API
  KP2 -->|"watch Services/Endpoints"| API
  KL1 --> CR1
  KL2 --> CR2
  CR1 --> P1
  CR1 --> P2
  CR2 --> P3`
    },
    {
      title: "kubectl apply Request Lifecycle",
      kind: "flow",
      caption: "Step-by-step flow from kubectl command to running containers on a worker node",
      mermaid: `graph LR
  A["kubectl apply"] --> B["Authentication<br/><i>certs, tokens, OIDC</i>"]
  B --> C["Authorization<br/><i>RBAC / Webhook</i>"]
  C --> D["Mutating<br/>Admission"]
  D --> E["Validating<br/>Admission"]
  E --> F["Persist to etcd"]
  F --> G["Deployment<br/>Controller"]
  G --> H["ReplicaSet<br/>Controller"]
  H --> I["Scheduler<br/><i>Filter → Score</i>"]
  I --> J["Kubelet<br/><i>pull image, start container</i>"]
  J --> K["Container<br/>Running"]`
    },
    {
      title: "Kubernetes Component Mind Map",
      kind: "mindmap",
      caption: "Organized breakdown of all major Kubernetes architectural components",
      mermaid: `mindmap
  root((K8s Architecture))
    Control Plane
      kube-apiserver
        Authentication
        Authorization / RBAC
        Admission Controllers
      etcd
        Raft Consensus
        Watch API
        Snapshot Backups
      kube-scheduler
        Filtering Phase
        Scoring Phase
        Preemption
      kube-controller-manager
        Deployment Controller
        ReplicaSet Controller
        Node Controller
        Job Controller
    Worker Nodes
      kubelet
        CRI Interface
        Pod Lifecycle
        Health Probes
      kube-proxy
        iptables Mode
        IPVS Mode
        eBPF / Cilium
      Container Runtime
        containerd
        CRI-O
    Key Concepts
      Reconciliation Loop
      Declarative Model
      Level-triggered Design
      Operator Pattern`
    }
  ],
  comparison: {
    columns: [
      "Aspect",
      "Control Plane",
      "Worker Node"
    ],
    rows: [
      [
        "**Primary role**",
        "Manages cluster state, makes scheduling and healing decisions",
        "Runs application workloads (pods and containers)"
      ],
      [
        "**Key components**",
        "`kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager`",
        "`kubelet`, `kube-proxy`, container runtime (`containerd` / `CRI-O`)"
      ],
      [
        "**State storage**",
        "Hosts **etcd** — the *single source of truth* for all cluster state",
        "Stateless — receives pod specs from the API server, no local state persistence"
      ],
      [
        "**Failure impact**",
        "Loss of quorum stops *new* scheduling and healing; existing pods keep running",
        "Loss of a node triggers pod rescheduling to healthy nodes by the *Node controller*"
      ],
      [
        "**Scaling model**",
        "Scaled for **availability** (3-5 replicas for HA); not for workload capacity",
        "Scaled for **capacity** — add more nodes to run more pods"
      ],
      [
        "**Network exposure**",
        "API server exposes port *6443* (HTTPS); etcd on *2379/2380* (cluster-internal only)",
        "Kubelet on port *10250*; kube-proxy manages `iptables`/`IPVS` rules for Service routing"
      ],
      [
        "**Communication pattern**",
        "API server is the *hub* — all components communicate through it",
        "Kubelet *pulls* pod specs from API server; kube-proxy *watches* Service/Endpoints objects"
      ]
    ]
  },
  exercises: [
    "**Cluster Exploration:** Spin up a local cluster with `minikube start` or `kind create cluster`. Run `kubectl get nodes -o wide`, `kubectl get pods -n kube-system`, and `kubectl describe node` to identify all control plane and worker node components. Document which component runs as a *static pod* vs. a *system service*.",
    "**Reconciliation in Action:** Create a Deployment with 3 replicas (`kubectl create deployment nginx --image=nginx --replicas=3`). Manually delete one pod with `kubectl delete pod <name>`. Observe the ReplicaSet controller recreating the pod. Then scale to 5 replicas and watch the *events* with `kubectl get events -w`. Explain the **level-triggered** behavior you observe.",
    "**Scheduler Deep Dive:** Create a pod with a `nodeSelector` or `nodeAffinity` rule that *cannot* be satisfied (e.g., label `gpu=true` on a cluster with no GPU nodes). Inspect the pod with `kubectl describe pod` and identify the **FailedScheduling** event. Then add the label to a node with `kubectl label node <name> gpu=true` and watch the pod get scheduled. Explain the *filter* and *score* phases.",
    "**etcd Backup and Restore:** On a `kubeadm`-based cluster, perform an etcd snapshot: `ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key`. Verify the snapshot with `etcdctl snapshot status`. Document the *disaster recovery* steps you would take to restore from this backup.",
    "**RBAC Policy Design:** Create a `ServiceAccount` called `dev-reader` in the `development` namespace. Write a `Role` that grants **get**, **list**, and **watch** on pods and deployments. Bind it with a `RoleBinding`. Use `kubectl auth can-i` to verify the permissions. Then attempt an unauthorized action (e.g., `kubectl delete pod --as=system:serviceaccount:development:dev-reader`) and explain the *RBAC* denial."
  ],
  cheatSheet: [
    "**Cluster health check:** `kubectl get componentstatuses` (legacy) or `kubectl get --raw='/readyz?verbose'` — quickly verify that the *API server*, *scheduler*, *controller-manager*, and *etcd* are healthy.",
    "**Node inspection:** `kubectl describe node <name>` — shows **capacity** vs. **allocatable** resources, *taints*, *conditions* (MemoryPressure, DiskPressure, PIDPressure), and all pods scheduled on the node.",
    "**Pod scheduling debug:** `kubectl describe pod <name>` + `kubectl get events --field-selector involvedObject.name=<pod>` — reveals *FailedScheduling* reasons such as insufficient CPU/memory, unmatched `nodeAffinity`, or unsatisfied `topologySpreadConstraints`.",
    "**etcd backup:** `ETCDCTL_API=3 etcdctl snapshot save backup.db --endpoints=https://127.0.0.1:2379 --cacert=... --cert=... --key=...` — always use **TLS flags** and verify with `etcdctl snapshot status backup.db`.",
    "**RBAC quick check:** `kubectl auth can-i <verb> <resource> --as=<user-or-sa> -n <namespace>` — test whether a *service account* or *user* has a specific permission without trial-and-error.",
    "**Watch reconciliation live:** `kubectl get events -A --sort-by='.lastTimestamp' -w` — stream *cluster-wide events* in real time to observe controllers creating pods, scaling ReplicaSets, and responding to node failures."
  ],
  revisionNotes: [
    "The **API server** is the *only* component that talks to **etcd** directly — every other component (scheduler, controllers, kubelet, kube-proxy) interacts exclusively through the API server, which provides a single point for *authentication*, *authorization*, *admission control*, and *audit logging*.",
    "Kubernetes controllers are **level-triggered**, not *edge-triggered* — they react to *current state* rather than individual change events. This makes them inherently **idempotent** and resilient to missed events or controller restarts, because they always re-derive required actions from the current state diff.",
    "The **scheduler** uses a two-phase approach: **filtering** eliminates nodes that cannot run the pod (resource constraints, taints, affinity rules, topology constraints), then **scoring** ranks remaining nodes by factors like resource balance and data locality. The scheduler only *binds* the pod to a node — **kubelet** is responsible for actually starting it.",
    "**etcd** uses the *Raft consensus* algorithm and requires a **quorum** (majority) to accept writes. In a 5-node cluster, 2 nodes can fail without data loss. If quorum is lost, the API server cannot persist changes — existing workloads keep running but no *new scheduling or self-healing* occurs.",
    "The **Operator pattern** extends Kubernetes by encoding domain-specific operational knowledge into *custom controllers* that watch **CRDs** (Custom Resource Definitions). This turns Kubernetes from a fixed container orchestrator into an **extensible platform** for managing any stateful application lifecycle."
  ],
  glossary: [
    {
      term: "Control Plane",
      definition:
        "The set of components (API server, etcd, scheduler, controller manager) that manage cluster state and make global decisions about scheduling and healing.",
    },
    {
      term: "etcd",
      definition:
        "A distributed, strongly consistent key-value store using Raft consensus that serves as the single source of truth for all Kubernetes cluster state.",
    },
    {
      term: "Reconciliation Loop",
      definition:
        "The continuous process where controllers compare desired state to actual state and take corrective action to converge them.",
    },
    {
      term: "Kubelet",
      definition:
        "The node-level agent that ensures containers described in pod specs are running and healthy, communicating with the container runtime via CRI.",
    },
    {
      term: "Kube-proxy",
      definition:
        "A network component on each node that maintains rules (iptables/IPVS) to route Service traffic to the appropriate pod endpoints.",
    },
    {
      term: "CRI (Container Runtime Interface)",
      definition:
        "A plugin interface that allows kubelet to work with any OCI-compliant container runtime (containerd, CRI-O) without tight coupling.",
    },
    {
      term: "Admission Controller",
      definition:
        "A plugin that intercepts API requests after authentication/authorization and can mutate or reject objects before they are persisted to etcd.",
    },
    {
      term: "Level-triggered",
      definition:
        "A controller design that reacts to current state rather than state-change events, making it naturally idempotent and resilient to missed notifications.",
    },
  ],
};
