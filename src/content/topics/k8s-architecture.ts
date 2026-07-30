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
