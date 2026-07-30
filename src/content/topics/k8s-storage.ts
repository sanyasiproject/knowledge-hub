import type { TopicContent } from "../types";

export const k8sStorage: TopicContent = {
  quickSummary: [
    "PersistentVolumes (PV) represent cluster-level storage resources; PersistentVolumeClaims (PVC) are namespace-scoped requests that bind to PVs, decoupling storage provisioning from consumption.",
    "StorageClasses enable dynamic provisioning -- when a PVC references a StorageClass, the provisioner automatically creates a PV backed by cloud disks, NFS, or other storage backends.",
    "ConfigMaps store non-sensitive configuration as key-value pairs or files, mountable as volumes or injected as environment variables.",
    "Secrets store sensitive data (passwords, tokens, TLS certs) base64-encoded in etcd; they can be mounted as volumes or injected as environment variables, and should be encrypted at rest.",
    "Projected volumes combine multiple sources (ConfigMaps, Secrets, downward API, service account tokens) into a single volume mount point.",
  ],
  detailed: [
    "## PersistentVolumes and PersistentVolumeClaims\n\nA PersistentVolume (PV) is a cluster-wide storage resource provisioned by an administrator or dynamically by a StorageClass. It has a lifecycle independent of any pod. A PersistentVolumeClaim (PVC) is a namespace-scoped request for storage specifying size, access mode (ReadWriteOnce, ReadOnlyMany, ReadWriteMany), and optionally a StorageClass. When a PVC is created, the control plane finds a matching PV and binds them. Access modes determine how many nodes can mount the volume simultaneously. Reclaim policies control what happens when a PVC is deleted: Retain (keep data), Delete (remove the backing storage), or Recycle (deprecated). StatefulSets use volumeClaimTemplates to create per-pod PVCs automatically.",
    "## StorageClasses and Dynamic Provisioning\n\nStorageClasses abstract storage backends behind a named class (e.g., `fast-ssd`, `standard-hdd`). Each class specifies a provisioner (e.g., `kubernetes.io/aws-ebs`, `pd.csi.storage.gke.io`), parameters (disk type, IOPS, filesystem), and a reclaim policy. When a PVC references a StorageClass, the provisioner creates a PV on demand -- no manual pre-provisioning needed. A default StorageClass (annotated `storageclass.kubernetes.io/is-default-class: true`) handles PVCs that do not specify a class. Volume binding can be Immediate (provision when PVC is created) or WaitForFirstConsumer (provision when a pod using the PVC is scheduled, ensuring topology alignment).",
    "## ConfigMaps\n\nConfigMaps decouple configuration from container images. They store key-value pairs or entire files (via `kubectl create configmap --from-file`). Pods consume ConfigMaps as environment variables (`envFrom` or individual `valueFrom` references) or as mounted volumes where each key becomes a file. Volume-mounted ConfigMaps can be updated live -- kubelet periodically syncs changes (within the sync period, typically under a minute), enabling config hot-reload without pod restart. However, env-var-based ConfigMaps require a pod restart to pick up changes. ConfigMaps are namespace-scoped and should not contain sensitive data.",
    "## Secrets\n\nSecrets are similar to ConfigMaps but intended for sensitive data: passwords, API keys, TLS certificates, and Docker registry credentials. Values are base64-encoded (not encrypted) in the API and stored in etcd. For real security, enable etcd encryption at rest via EncryptionConfiguration and consider external secret managers (HashiCorp Vault, AWS Secrets Manager) with operators like External Secrets. Secrets can be mounted as volumes (each key as a file) or injected as environment variables. Kubernetes creates a default service account token Secret for each namespace. Immutable Secrets (`immutable: true`) prevent accidental changes and reduce API server watch load.",
    "## Projected Volumes\n\nProjected volumes aggregate multiple volume sources into a single mount point. You can combine a ConfigMap, a Secret, the downward API (pod metadata like labels, annotations, resource limits), and a service account token projection into one directory. This is particularly useful for constructing complex configuration directories where files come from different sources. Bound service account token projection (replacing the legacy auto-mounted token) uses projected volumes to provide short-lived, audience-scoped tokens that are more secure than static tokens.",
    "## CSI (Container Storage Interface)\n\nCSI is the standard plugin interface for connecting storage systems to Kubernetes. It replaced the in-tree volume plugins with an out-of-tree, containerized architecture. CSI drivers run as pods (a controller component for provisioning/attaching and a node component for mounting) and register with the kubelet. This allows storage vendors to release drivers independently of Kubernetes releases. Features like volume snapshots, volume cloning, volume expansion, and topology-aware provisioning are all delivered through CSI. Popular CSI drivers include AWS EBS CSI, GCE PD CSI, Azure Disk CSI, and Ceph CSI.",
  ],
  interviewQA: [
    {
      q: "Explain the relationship between PV, PVC, and StorageClass.",
      a: "A StorageClass defines a type of storage (e.g., SSD, HDD) and its provisioner. A PVC is a request for storage specifying size, access mode, and optionally a StorageClass. With dynamic provisioning, the StorageClass provisioner creates a PV automatically when a PVC is created. The PVC then binds to the PV. This three-layer model separates storage administration (StorageClass), request (PVC), and actual resource (PV).",
      followUps: [
        "What is WaitForFirstConsumer binding mode and when is it needed?",
        "What happens to the PV when you delete the PVC with Retain vs Delete reclaim policy?",
      ],
    },
    {
      q: "How do ConfigMaps and Secrets differ, and what are the security implications of Secrets?",
      a: "Both store key-value data consumable as env vars or volumes. Secrets are intended for sensitive data and are base64-encoded, but base64 is encoding, not encryption. Secrets in etcd are stored in plain text by default unless you enable encryption at rest. For production security, enable etcd encryption, restrict RBAC access to Secrets, use external secret managers (Vault, AWS Secrets Manager) synced via operators, and avoid committing Secrets to version control. Volume-mounted Secrets are stored as tmpfs on the node, not written to disk.",
      followUps: [
        "How do external secret operators like External Secrets work?",
        "What are immutable Secrets and why use them?",
      ],
    },
    {
      q: "What is CSI and why was it introduced?",
      a: "CSI (Container Storage Interface) is a standard plugin API that replaced Kubernetes's in-tree volume plugins. Previously, adding a new storage backend required modifying Kubernetes core code and waiting for a release. CSI drivers run as pods alongside Kubernetes and can be developed and released independently. CSI enables features like volume snapshots, cloning, expansion, and topology-aware provisioning through a standardized interface.",
    },
    {
      q: "How do volume-mounted ConfigMaps support live updates?",
      a: "When a ConfigMap is mounted as a volume, kubelet periodically checks for changes and updates the files in the mount (via atomic symlink swap). The application can detect file changes and reload configuration without a pod restart. The update delay is bounded by the kubelet sync period (configurable, default ~60 seconds). Environment variable-based ConfigMaps do not update live and require a pod restart.",
    },
  ],
  mcqs: [
    {
      q: "What does WaitForFirstConsumer volume binding mode do?",
      options: [
        "Waits for a second PVC before binding",
        "Delays PV provisioning until a pod using the PVC is scheduled, ensuring topology alignment",
        "Waits for the first pod to consume 50% of the volume before provisioning more",
        "Queues PVC requests and processes them in order",
      ],
      answerIndex: 1,
      explanation:
        "WaitForFirstConsumer delays provisioning until a pod is scheduled so the PV is created in the same availability zone as the node, avoiding cross-zone mounting issues.",
    },
    {
      q: "Are Kubernetes Secrets encrypted by default?",
      options: [
        "Yes, with AES-256 encryption",
        "No, they are only base64-encoded; encryption at rest must be explicitly configured",
        "Yes, using the cluster's TLS certificates",
        "No, they are stored in plain text without any encoding",
      ],
      answerIndex: 1,
      explanation:
        "Secrets are base64-encoded in the API but stored without encryption in etcd by default. You must configure EncryptionConfiguration for at-rest encryption.",
    },
    {
      q: "Which access mode allows a volume to be mounted read-write on multiple nodes?",
      options: [
        "ReadWriteOnce (RWO)",
        "ReadOnlyMany (ROX)",
        "ReadWriteMany (RWX)",
        "ReadWriteOncePod (RWOP)",
      ],
      answerIndex: 2,
      explanation:
        "ReadWriteMany allows the volume to be mounted as read-write by many nodes simultaneously, typically supported by network filesystems like NFS or CephFS.",
    },
    {
      q: "What is a projected volume?",
      options: [
        "A volume that grows automatically as data is added",
        "A volume combining multiple sources (ConfigMaps, Secrets, downward API) into one mount",
        "A volume projected across multiple availability zones",
        "A volume backed by a cloud storage projection service",
      ],
      answerIndex: 1,
      explanation:
        "Projected volumes aggregate data from ConfigMaps, Secrets, the downward API, and service account tokens into a single directory mount point.",
    },
  ],
  flashcards: [
    {
      front: "PV vs PVC?",
      back: "PV is a cluster-wide storage resource. PVC is a namespace-scoped request that binds to a PV, decoupling provisioning from consumption.",
    },
    {
      front: "What does a StorageClass do?",
      back: "Defines a storage type with a provisioner and parameters, enabling dynamic PV creation when PVCs reference it.",
    },
    {
      front: "ConfigMap vs Secret?",
      back: "ConfigMaps store non-sensitive config; Secrets store sensitive data (base64-encoded, should be encrypted at rest).",
    },
    {
      front: "What are the PV access modes?",
      back: "RWO (ReadWriteOnce -- single node), ROX (ReadOnlyMany -- many nodes read), RWX (ReadWriteMany -- many nodes read-write), RWOP (ReadWriteOncePod).",
    },
    {
      front: "What is a projected volume?",
      back: "A volume combining multiple sources (ConfigMaps, Secrets, downward API, SA tokens) into a single mount point.",
    },
    {
      front: "Do volume-mounted ConfigMaps update live?",
      back: "Yes -- kubelet syncs changes periodically (within ~60s). Env-var ConfigMaps do NOT update without a pod restart.",
    },
    {
      front: "What is CSI?",
      back: "Container Storage Interface -- a standard plugin API for storage backends, replacing in-tree plugins with out-of-tree, independently-releasable drivers.",
    },
    {
      front: "What are PV reclaim policies?",
      back: "Retain (keep data after PVC deletion), Delete (remove backing storage), Recycle (deprecated -- basic scrub).",
    },
  ],
  glossary: [
    {
      term: "PersistentVolume (PV)",
      definition:
        "A cluster-level storage resource with a lifecycle independent of any pod, provisioned statically or dynamically.",
    },
    {
      term: "PersistentVolumeClaim (PVC)",
      definition:
        "A namespace-scoped request for storage that binds to a matching PV by size, access mode, and StorageClass.",
    },
    {
      term: "StorageClass",
      definition:
        "An abstraction defining a storage type and its provisioner, enabling dynamic PV creation on demand.",
    },
    {
      term: "ConfigMap",
      definition:
        "A Kubernetes object storing non-sensitive configuration as key-value pairs, consumable as environment variables or mounted files.",
    },
    {
      term: "Secret",
      definition:
        "A Kubernetes object for sensitive data (base64-encoded), mountable as files or env vars, ideally encrypted at rest.",
    },
    {
      term: "CSI",
      definition:
        "Container Storage Interface -- the standard plugin API for integrating external storage systems with Kubernetes.",
    },
    {
      term: "Projected Volume",
      definition:
        "A volume type that combines data from ConfigMaps, Secrets, downward API, and service account tokens into one mount.",
    },
    {
      term: "Reclaim Policy",
      definition:
        "Determines what happens to a PV when its PVC is deleted: Retain preserves data, Delete removes it, Recycle is deprecated.",
    },
  ],
};
