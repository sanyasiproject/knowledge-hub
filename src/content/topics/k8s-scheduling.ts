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
