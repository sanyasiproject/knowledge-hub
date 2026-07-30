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
