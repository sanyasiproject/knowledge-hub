import type { TopicContent } from "../types";

export const k8sScheduling: TopicContent = {
  quickSummary: [
    "Node selectors provide simple pod-to-node assignment by matching node labels, while node affinity offers richer expressions with required and preferred rules.",
    "Pod affinity and anti-affinity co-locate or spread pods relative to other pods, useful for latency optimization (co-locate app + cache) and high availability (spread replicas).",
    "Taints on nodes repel pods unless the pod has a matching toleration, used to reserve nodes for specific workloads or mark nodes as unhealthy.",
    "The Horizontal Pod Autoscaler (HPA) scales pod replicas based on CPU, memory, or custom metrics; the Vertical Pod Autoscaler (VPA) adjusts resource requests/limits.",
    "The Cluster Autoscaler adds or removes nodes from the cluster based on pending pods that cannot be scheduled or underutilized nodes.",
  ],
  detailed: [
    "## Node Selectors and Node Affinity\n\nNode selectors are the simplest scheduling constraint: a map of label key-value pairs that the target node must match (e.g., `disktype: ssd`). Node affinity is more expressive, supporting `requiredDuringSchedulingIgnoredDuringExecution` (hard constraint -- pod is not scheduled if no node matches) and `preferredDuringSchedulingIgnoredDuringExecution` (soft constraint -- scheduler tries to match but can fall back). Affinity expressions support `In`, `NotIn`, `Exists`, `DoesNotExist`, and `Gt`/`Lt` operators, allowing rules like 'schedule on nodes in us-east-1a or us-east-1b' or 'prefer nodes with GPU but accept CPU-only if needed'.",
    "## Pod Affinity and Anti-Affinity\n\nPod affinity co-locates pods with other pods that match a label selector, within a topology domain (node, zone, region). Example: schedule a Redis cache pod on the same node as the web pod it serves for low-latency access. Pod anti-affinity does the opposite -- it spreads pods apart. Example: ensure replicas of the same Deployment land on different nodes or zones for high availability. Both support required and preferred modes. Topology spread constraints (`topologySpreadConstraints`) provide a more precise way to evenly distribute pods across topology domains with configurable `maxSkew`.",
    "## Taints and Tolerations\n\nTaints are applied to nodes and repel pods that lack a matching toleration. A taint has a key, value, and effect: `NoSchedule` (prevent scheduling), `PreferNoSchedule` (soft -- avoid if possible), or `NoExecute` (evict existing pods without the toleration). Tolerations on pods declare which taints they accept. Common patterns: taint GPU nodes so only GPU workloads schedule there, taint control-plane nodes to prevent user workloads, or use `NoExecute` to drain a node for maintenance. The node controller automatically taints unreachable/not-ready nodes, and pods have default tolerations with a `tolerationSeconds` that controls eviction delay.",
    "## Horizontal Pod Autoscaler (HPA)\n\nHPA automatically adjusts the number of pod replicas based on observed metrics. It checks metrics every 15 seconds (configurable) and computes the desired replica count as `ceil(currentReplicas * (currentMetric / targetMetric))`. Built-in metrics include CPU and memory utilization. Custom metrics (request rate, queue depth) are supported via the custom metrics API (served by adapters like Prometheus Adapter). HPA includes stabilization windows to prevent rapid scale-up/scale-down oscillation (flapping). It works with Deployments, ReplicaSets, and StatefulSets. Best practice: always set resource requests, as HPA calculates CPU utilization as a percentage of requested CPU.",
    "## Vertical Pod Autoscaler (VPA)\n\nVPA analyzes historical resource usage and recommends or automatically adjusts pod resource requests and limits. It operates in three modes: `Off` (recommendation only), `Initial` (set resources at pod creation), and `Auto` (update running pods by evicting and recreating them with new resource values). VPA is useful for workloads with unpredictable resource needs -- it right-sizes containers so they neither waste resources nor get OOM-killed. VPA and HPA should not target the same metric (e.g., both scaling on CPU) to avoid conflicts, though they can coexist if HPA scales on custom metrics and VPA adjusts resource requests.",
    "## Cluster Autoscaler\n\nThe Cluster Autoscaler adjusts the number of nodes in the cluster. It scales up when pods are pending due to insufficient resources (no node can fit the pod after filtering). It scales down when nodes are underutilized (all pods on a node could be rescheduled elsewhere) for a configurable duration (default 10 minutes). It respects pod disruption budgets, local storage, and pods without controllers when deciding whether to drain a node. Cloud providers (AWS ASG, GCP MIG, Azure VMSS) provide the underlying node pools. Karpenter is an alternative to Cluster Autoscaler on AWS that provisions right-sized nodes directly rather than scaling fixed node groups.",
  ],
  interviewQA: [
    {
      q: "When would you use taints and tolerations versus node affinity?",
      a: "They serve complementary purposes. Node affinity is pod-centric: it tells the scheduler where a pod prefers or requires to run. Taints are node-centric: they repel all pods except those with matching tolerations. Use node affinity when specific pods need specific nodes (e.g., ML workloads on GPU nodes). Use taints when you want to reserve nodes for certain workloads and keep everything else off (e.g., taint GPU nodes so only GPU-tolerant pods land there). In practice, you often use both together: taint the node AND set affinity on the pod for a complete solution.",
      followUps: [
        "What is the effect of NoExecute versus NoSchedule?",
        "How do default tolerations for node.kubernetes.io/not-ready work?",
      ],
    },
    {
      q: "How does HPA decide how many replicas to run?",
      a: "HPA queries the metrics API every 15 seconds and applies the formula: desiredReplicas = ceil(currentReplicas * (currentMetricValue / targetMetricValue)). For example, if current CPU is 80% and target is 50% with 3 replicas, desired = ceil(3 * 80/50) = ceil(4.8) = 5 replicas. It includes stabilization windows (default 5 minutes for scale-down) to prevent flapping. HPA requires resource requests to be set because CPU utilization is calculated as actual usage / requested CPU.",
      followUps: [
        "How do you scale on custom metrics like queue depth?",
        "Can HPA and VPA be used together?",
      ],
    },
    {
      q: "How does the Cluster Autoscaler decide to remove a node?",
      a: "The Cluster Autoscaler considers a node for scale-down if its resource utilization is below a threshold (default 50%) for a sustained period (default 10 minutes). Before removing it, it checks whether all pods on the node can be rescheduled elsewhere, respects PodDisruptionBudgets, and skips nodes with pods that have local storage, pods not managed by a controller, or pods with restrictive scheduling constraints. It then cordons the node, drains pods, and terminates the instance.",
    },
    {
      q: "What are topology spread constraints and when would you use them?",
      a: "Topology spread constraints distribute pods evenly across topology domains (nodes, zones, regions). You specify a `topologyKey` (e.g., `topology.kubernetes.io/zone`), a `maxSkew` (maximum difference in pod count between domains), and a `whenUnsatisfiable` action (DoNotSchedule or ScheduleAnyway). Use them to spread replicas across availability zones for HA, or across nodes to balance load. They provide more control than pod anti-affinity, which only says 'not on the same node' without ensuring even distribution.",
    },
  ],
  mcqs: [
    {
      q: "What is the difference between `requiredDuringSchedulingIgnoredDuringExecution` and `preferredDuringSchedulingIgnoredDuringExecution` affinity?",
      options: [
        "Required rules apply during execution too; preferred rules do not",
        "Required rules are hard constraints; preferred rules are soft constraints the scheduler tries to honor",
        "Required rules apply to nodes; preferred rules apply to pods",
        "There is no functional difference -- they are aliases",
      ],
      answerIndex: 1,
      explanation:
        "Required rules must be satisfied or the pod will not be scheduled. Preferred rules influence scoring but the pod can still be placed on non-matching nodes if needed.",
    },
    {
      q: "What taint effect evicts already-running pods?",
      options: [
        "NoSchedule",
        "PreferNoSchedule",
        "NoExecute",
        "EvictExisting",
      ],
      answerIndex: 2,
      explanation:
        "NoExecute evicts running pods that lack a matching toleration (after tolerationSeconds, if set). NoSchedule and PreferNoSchedule only affect future scheduling.",
    },
    {
      q: "Why must pods have resource requests set for HPA to work with CPU metrics?",
      options: [
        "HPA reads requests to determine the container image size",
        "CPU utilization is calculated as actual usage divided by requested CPU",
        "Resource requests are required for all pods in Kubernetes",
        "HPA uses requests to set the maximum replica count",
      ],
      answerIndex: 1,
      explanation:
        "HPA calculates CPU utilization as a percentage: (actual CPU usage / CPU request) * 100. Without requests, the utilization percentage is undefined.",
    },
    {
      q: "What does Cluster Autoscaler do when pods are pending due to insufficient resources?",
      options: [
        "Vertically scales existing pods to free up resources",
        "Evicts lower-priority pods to make room",
        "Adds new nodes to the cluster via the cloud provider",
        "Reduces resource requests of pending pods automatically",
      ],
      answerIndex: 2,
      explanation:
        "Cluster Autoscaler detects unschedulable pending pods and provisions new nodes from cloud provider node pools (ASGs, MIGs, VMSS) to provide capacity.",
    },
  ],
  flashcards: [
    {
      front: "Node selector vs node affinity?",
      back: "Node selector: simple label matching. Node affinity: richer expressions with required/preferred modes and operators (In, NotIn, Exists, Gt, Lt).",
    },
    {
      front: "What do taints and tolerations do?",
      back: "Taints repel pods from nodes. Tolerations on pods override specific taints. Effects: NoSchedule, PreferNoSchedule, NoExecute.",
    },
    {
      front: "HPA scaling formula?",
      back: "desiredReplicas = ceil(currentReplicas * (currentMetric / targetMetric)). Requires resource requests for CPU-based scaling.",
    },
    {
      front: "VPA modes?",
      back: "Off (recommend only), Initial (set at pod creation), Auto (evict and recreate with adjusted resources).",
    },
    {
      front: "When does Cluster Autoscaler scale up?",
      back: "When pods are pending because no existing node can satisfy their resource requests or scheduling constraints.",
    },
    {
      front: "What is maxSkew in topology spread constraints?",
      back: "The maximum allowed difference in pod count between topology domains. Lower values enforce more even distribution.",
    },
    {
      front: "Pod affinity vs anti-affinity?",
      back: "Affinity co-locates pods (e.g., app + cache on same node). Anti-affinity spreads pods apart (e.g., replicas across zones for HA).",
    },
    {
      front: "What is Karpenter?",
      back: "An AWS-focused alternative to Cluster Autoscaler that provisions right-sized nodes directly instead of scaling fixed node groups.",
    },
  ],
  deepDive: [
    "The Kubernetes **scheduler** operates in a *two-phase cycle*: **filtering** and **scoring**. During the *filtering* phase, the scheduler eliminates nodes that cannot run the pod -- nodes that lack sufficient CPU or memory, nodes that do not match `nodeSelector` labels, nodes whose taints are not tolerated, and nodes that violate *pod affinity/anti-affinity* rules. The surviving nodes enter the *scoring* phase, where the scheduler ranks them using weighted scoring plugins. Built-in scoring strategies include `LeastRequestedPriority` (prefer nodes with the most available resources), `BalancedResourceAllocation` (prefer nodes where CPU and memory utilization are balanced), and `InterPodAffinityPriority` (reward or penalize based on pod affinity/anti-affinity preferences). The node with the **highest aggregate score** wins, and the pod is *bound* to that node via the API server. Understanding this pipeline is critical for debugging scheduling failures -- when a pod stays in `Pending`, `kubectl describe pod` reveals which filter rejected every candidate node.",
    "**Priority and Preemption** add an economic layer to scheduling. Every pod can carry a `priorityClassName` referencing a `PriorityClass` object with an integer `value`. When a high-priority pod cannot be scheduled because no node passes filtering, the scheduler attempts *preemption*: it identifies a node where evicting one or more lower-priority pods would free enough resources. The scheduler respects **PodDisruptionBudgets** (PDBs) during preemption -- it will not evict pods if doing so violates the PDB's `minAvailable` or `maxUnavailable` constraints. Preempted pods receive a *graceful termination* period (`terminationGracePeriodSeconds`) before being killed. System-critical pods (e.g., `kube-dns`, `kube-proxy`) typically use the built-in `system-cluster-critical` or `system-node-critical` priority classes with values above **one billion**, ensuring they always beat user workloads. Misconfiguring priorities can lead to *cascading evictions*, so organizations should define a clear **priority tier policy** (e.g., `background=100`, `standard=1000`, `critical=10000`).",
    "**Descheduler** and **advanced autoscaling patterns** round out the scheduling ecosystem. The *Kubernetes Descheduler* is a separate project that runs periodically and evicts pods that violate current scheduling constraints -- for example, pods that were placed before an anti-affinity rule was added, or pods on nodes that are now underutilized (to consolidate workloads). It works in tandem with the scheduler: the descheduler evicts, and the scheduler re-places pods optimally. On the autoscaling front, **KEDA** (Kubernetes Event-Driven Autoscaling) extends HPA by scaling deployments to *zero* and back up based on external event sources (Kafka topic lag, AWS SQS queue depth, Prometheus queries). This is transformative for *event-driven microservices* and **batch processing** workloads that should not consume resources when idle. Combining `Cluster Autoscaler` + `HPA` + `KEDA` + `VPA` creates a *multi-dimensional scaling strategy* where the cluster right-sizes at every level -- from individual container resource requests to replica counts to the total number of nodes.",
  ],
  code: [
    {
      language: "yaml",
      caption: "Pod with **node affinity**, **tolerations**, and **topology spread constraints**",
      source: `apiVersion: v1
kind: Pod
metadata:
  name: web-server
  labels:
    app: web
spec:
  # --- Node Affinity: prefer SSD nodes in us-east-1 ---
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: topology.kubernetes.io/region
                operator: In
                values: ["us-east-1"]
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 80
          preference:
            matchExpressions:
              - key: disktype
                operator: In
                values: ["ssd"]
    # --- Pod Anti-Affinity: spread across nodes ---
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app: web
          topologyKey: kubernetes.io/hostname
  # --- Tolerate GPU taint ---
  tolerations:
    - key: "gpu"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"
  # --- Topology Spread: even across zones ---
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: web
  containers:
    - name: nginx
      image: nginx:1.25
      resources:
        requests:
          cpu: "250m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "256Mi"`,
    },
    {
      language: "yaml",
      caption: "**HorizontalPodAutoscaler** with CPU and custom metrics (Prometheus)",
      source: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
    # Scale on CPU utilization (built-in)
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60    # target 60% of requested CPU
    # Scale on custom metric: requests-per-second via Prometheus Adapter
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"      # scale up when RPS > 1000 per pod
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # wait 5 min before scaling down
      policies:
        - type: Percent
          value: 25                     # remove at most 25% of pods per minute
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Pods
          value: 4                      # add at most 4 pods per 30s
          periodSeconds: 30`,
    },
    {
      language: "bash",
      caption: "Useful **kubectl** commands for scheduling debugging and management",
      source: `# --- Taints & Tolerations ---
# Add a taint to a node (NoSchedule effect)
kubectl taint nodes worker-1 dedicated=gpu:NoSchedule

# Remove a taint (trailing dash)
kubectl taint nodes worker-1 dedicated=gpu:NoSchedule-

# View taints on all nodes
kubectl get nodes -o custom-columns=\\
  NAME:.metadata.name,TAINTS:.spec.taints

# --- Scheduling Debugging ---
# Check why a pod is Pending (shows scheduling events)
kubectl describe pod <pod-name> | grep -A 20 "Events"

# See which node a pod was scheduled on
kubectl get pod <pod-name> -o wide

# View node labels used for affinity rules
kubectl get nodes --show-labels

# --- Autoscaler ---
# Check HPA status and current metrics
kubectl get hpa -o wide

# Describe HPA for detailed scaling events
kubectl describe hpa web-hpa

# View Cluster Autoscaler status (on AWS/GKE)
kubectl -n kube-system logs -l app=cluster-autoscaler --tail=50

# Manually label a node for scheduling
kubectl label nodes worker-2 disktype=ssd`,
    },
  ],
  diagrams: [
    {
      title: "Kubernetes Scheduler Pipeline",
      kind: "flow",
      caption: "The *two-phase* scheduler pipeline: filtering eliminates ineligible nodes, scoring ranks the survivors, and the pod is bound to the **highest-scoring** node.",
      mermaid: `flowchart LR
    A["Pod Created\\n(Pending)"] --> B["Filter Phase"]
    B --> C{"Nodes\\nRemaining?"}
    C -- No --> D["Pod stays\\nPending"]
    C -- Yes --> E["Score Phase"]
    E --> F["Rank Nodes\\nby Weight"]
    F --> G["Bind Pod to\\nTop Node"]
    G --> H["Pod Running"]

    style A fill:#f9f,stroke:#333
    style D fill:#f66,stroke:#333
    style H fill:#6f6,stroke:#333`,
    },
    {
      title: "Autoscaling Architecture",
      kind: "architecture",
      caption: "How **HPA**, **VPA**, **Cluster Autoscaler**, and **KEDA** interact to provide multi-dimensional scaling across pods, containers, and nodes.",
      mermaid: `flowchart TB
    subgraph Metrics["Metrics Sources"]
        M1["Metrics Server\\n(CPU/Memory)"]
        M2["Prometheus\\n(Custom Metrics)"]
        M3["External Events\\n(Kafka, SQS)"]
    end

    subgraph Autoscalers["Autoscaling Controllers"]
        HPA["HPA\\nReplica Count"]
        VPA["VPA\\nResource Requests"]
        KEDA["KEDA\\nEvent-Driven"]
        CA["Cluster Autoscaler\\nNode Count"]
    end

    M1 --> HPA
    M1 --> VPA
    M2 --> HPA
    M3 --> KEDA

    HPA --> D["Deployment\\n(scale replicas)"]
    KEDA --> D
    VPA --> P["Pod\\n(adjust requests)"]
    CA --> N["Node Pool\\n(add/remove nodes)"]

    D -.->|"Pending pods\\ntrigger scale-up"| CA`,
    },
    {
      title: "Taints, Tolerations, and Affinity Decision Tree",
      kind: "flow",
      caption: "How the scheduler uses **taints**, **tolerations**, and **node affinity** together to decide pod placement.",
      mermaid: `flowchart TD
    Start["Schedule Pod"] --> T{"Node has\\nTaints?"}
    T -- No --> A{"Node Affinity\\nMatches?"}
    T -- Yes --> Tol{"Pod has\\nmatching\\nToleration?"}
    Tol -- No --> Reject["Node Rejected"]
    Tol -- Yes --> A
    A -- "Required: No" --> Reject
    A -- "Required: Yes\\nor no rule" --> S{"Pod Anti-Affinity\\nViolated?"}
    S -- Yes --> Reject
    S -- No --> Score["Node Passes\\nto Scoring"]
    A -- "Preferred: No" --> S2["Lower Score\\nbut still eligible"]

    style Reject fill:#f66,stroke:#333
    style Score fill:#6f6,stroke:#333`,
    },
  ],
  comparison: {
    columns: ["Feature", "Node Selector", "Node Affinity", "Taints & Tolerations", "Pod Affinity/Anti-Affinity", "Topology Spread"],
    rows: [
      ["**Direction**", "Pod -> Node", "Pod -> Node", "Node -> Pod (repel)", "Pod -> Pod", "Pod -> Topology"],
      ["**Complexity**", "*Simple* (label match)", "*Rich* (operators, weights)", "*Moderate* (key/value/effect)", "*Rich* (label selectors)", "*Moderate* (maxSkew)"],
      ["**Hard/Soft modes**", "Hard only", "Both `required` and `preferred`", "`NoSchedule` (hard), `PreferNoSchedule` (soft)", "Both `required` and `preferred`", "`DoNotSchedule` (hard), `ScheduleAnyway` (soft)"],
      ["**Use case**", "Pin pod to labeled node", "Prefer SSD, require region", "Reserve GPU nodes", "Co-locate app+cache, spread replicas", "Even distribution across zones"],
      ["**Affects running pods?**", "No", "No", "Yes (`NoExecute` evicts)", "No", "No"],
      ["**Scope**", "Single node labels", "Node labels with expressions", "Node-level property", "Pod labels within topology", "Topology domains (node/zone)"],
    ],
  },
  exercises: [
    "**Taint a node** called `gpu-worker` with `accelerator=nvidia:NoSchedule`, then create a pod with the correct *toleration* and a `nodeSelector` for `accelerator=nvidia`. Verify with `kubectl describe node` and `kubectl get pods -o wide` that only the tolerating pod schedules there.",
    "Deploy a **3-replica Deployment** with `podAntiAffinity` set to `requiredDuringSchedulingIgnoredDuringExecution` on `topologyKey: kubernetes.io/hostname`. Scale to 4 replicas on a 3-node cluster and observe the 4th pod staying `Pending`. Then switch to `preferredDuringSchedulingIgnoredDuringExecution` and verify all 4 pods schedule.",
    "Create an **HPA** targeting 50% CPU utilization for a Deployment running `k8s.gcr.io/hpa-example`. Use `kubectl run load-generator` to send traffic and watch replicas scale up with `kubectl get hpa -w`. Then stop the load and observe the *stabilization window* delaying scale-down.",
    "Configure a `topologySpreadConstraints` rule with `maxSkew: 1` across `topology.kubernetes.io/zone`. Deploy 6 replicas across 3 zones and verify even distribution with `kubectl get pods -o wide`. Then cordon one zone's nodes and observe how new pods distribute.",
    "Set up **PriorityClasses** (`low=100`, `high=10000`) and deploy a low-priority pod consuming most of a node's CPU. Then deploy a high-priority pod and observe *preemption* -- the low-priority pod being evicted to make room. Check events with `kubectl get events --sort-by=.metadata.creationTimestamp`.",
  ],
  cheatSheet: [
    "`kubectl taint nodes <node> key=value:NoSchedule` -- **Add taint** to a node; append `-` to *remove* it",
    "`kubectl label nodes <node> disktype=ssd` -- **Label a node** for use with `nodeSelector` or *node affinity*",
    "`kubectl describe pod <name>` -- **Debug scheduling**: look at `Events` section for `FailedScheduling` reasons",
    "`kubectl get hpa -o wide` -- **Check HPA status**: current/target metrics, replica count, and *last scale time*",
    "`kubectl top nodes` / `kubectl top pods` -- **View resource usage** (requires *Metrics Server* installed)",
    "`kubectl cordon <node>` / `kubectl uncordon <node>` -- **Prevent/allow** new pods from scheduling on a node (existing pods unaffected)",
  ],
  revisionNotes: [
    "The scheduler's **filter-then-score** pipeline processes pods from the scheduling queue. *Filtering* eliminates nodes failing resource, taint, affinity, or topology checks. *Scoring* ranks survivors using weighted plugins like `LeastRequestedPriority`.",
    "**Taints** are *node-centric* (repel pods); **affinity** is *pod-centric* (attract to nodes). Use them **together** for complete isolation -- taint the node AND set affinity on the pod. `NoExecute` is the only effect that evicts *already-running* pods.",
    "**HPA formula**: `desiredReplicas = ceil(currentReplicas * currentMetric / targetMetric)`. Always set `resources.requests` for CPU-based scaling. Use `behavior.scaleDown.stabilizationWindowSeconds` (default **300s**) to prevent *flapping*.",
    "**Topology spread constraints** with `maxSkew: 1` ensure *even pod distribution* across zones/nodes. They are more precise than `podAntiAffinity`, which only prevents co-location but does not guarantee *balance*.",
    "**Cluster Autoscaler** scales *nodes*; **HPA** scales *replicas*; **VPA** right-sizes *resource requests*; **KEDA** scales from *external events* (and supports scale-to-zero). Avoid targeting the same metric with both HPA and VPA.",
  ],
  glossary: [
    {
      term: "Node Affinity",
      definition:
        "A scheduling rule that constrains which nodes a pod can be placed on based on node labels, supporting required and preferred modes.",
    },
    {
      term: "Taint",
      definition:
        "A property on a node that repels pods unless they carry a matching toleration; effects include NoSchedule, PreferNoSchedule, and NoExecute.",
    },
    {
      term: "Toleration",
      definition:
        "A pod-level declaration that allows the pod to be scheduled on (or not evicted from) nodes with matching taints.",
    },
    {
      term: "HPA",
      definition:
        "Horizontal Pod Autoscaler -- automatically adjusts replica count based on CPU, memory, or custom metrics.",
    },
    {
      term: "VPA",
      definition:
        "Vertical Pod Autoscaler -- analyzes usage and adjusts pod resource requests/limits to right-size containers.",
    },
    {
      term: "Cluster Autoscaler",
      definition:
        "A component that adds or removes nodes from cloud provider node pools based on pending pod demand or node underutilization.",
    },
    {
      term: "Topology Spread Constraint",
      definition:
        "A scheduling rule that distributes pods evenly across topology domains (nodes, zones) with a configurable maxSkew.",
    },
    {
      term: "Pod Anti-Affinity",
      definition:
        "A scheduling rule that prevents co-locating pods matching a label selector within the same topology domain, used for high availability.",
    },
  ],
};
