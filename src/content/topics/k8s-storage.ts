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
  deepDive: [
    "The **PV lifecycle** follows a well-defined state machine: *Available* (not yet bound), *Bound* (claimed by a PVC), *Released* (PVC deleted, data retained), and *Failed* (reclamation error). When a PVC is created, the **PV controller** in `kube-controller-manager` searches for a matching PV based on *storage capacity*, *access modes*, *StorageClass*, and *label selectors*. If no match exists and a `StorageClass` is specified, the **external provisioner** (a CSI sidecar container) dynamically creates the backing storage resource (e.g., an AWS EBS volume or GCE Persistent Disk) and a corresponding PV object. The `WaitForFirstConsumer` binding mode is critical for **topology-aware provisioning** -- it delays PV creation until a pod is actually scheduled, ensuring the volume is created in the *same availability zone* as the node. Without this, `Immediate` mode might provision a disk in `us-east-1a` while the pod lands on a node in `us-east-1b`, causing a `FailedAttachVolume` error that is notoriously confusing to debug.",
    "**Volume snapshots** and **volume cloning** extend the CSI storage model with data management primitives. A `VolumeSnapshot` captures the state of a PVC at a point in time, backed by the storage provider's native snapshot mechanism (e.g., AWS EBS snapshots, GCE disk snapshots). Snapshots are represented by three objects: `VolumeSnapshotClass` (defines the snapshot driver and deletion policy), `VolumeSnapshot` (the user-facing request), and `VolumeSnapshotContent` (the actual snapshot resource, analogous to PV). You can create a new PVC *from a snapshot* by referencing it in `dataSource`, enabling workflows like **database backup/restore**, *environment cloning* (create a staging copy from a production snapshot), and **disaster recovery**. Volume cloning (`dataSource` referencing another PVC) creates a new volume pre-populated with data from the source, which is faster than snapshot-restore for same-zone copies. Both features require a CSI driver that implements the snapshot/clone controller capabilities.",
    "**Secrets management in production** demands layered defenses beyond Kubernetes' built-in `Secret` objects. At the *infrastructure layer*, enable **etcd encryption at rest** via `EncryptionConfiguration` using `aescbc`, `secretbox`, or a KMS provider (AWS KMS, GCP KMS, Azure Key Vault). At the *application layer*, tools like **External Secrets Operator** sync secrets from external vaults (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager) into Kubernetes Secrets automatically, keeping the *source of truth* outside the cluster. **Sealed Secrets** (by Bitnami) encrypt secrets client-side so they can be safely committed to Git -- only the in-cluster controller can decrypt them. For the most sensitive workloads, **CSI Secret Store Driver** mounts secrets directly from the external vault as volumes, *bypassing etcd entirely*. RBAC should restrict `get`/`list`/`watch` on Secrets to only the namespaces and service accounts that need them, and `audit logging` should track all Secret access for compliance.",
  ],
  code: [
    {
      language: "yaml",
      caption: "**StorageClass** with `WaitForFirstConsumer` and a **PVC** requesting dynamic provisioning",
      source: `# --- StorageClass: topology-aware SSD ---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com          # AWS EBS CSI driver
parameters:
  type: gp3                            # General Purpose SSD
  iops: "4000"
  throughput: "250"                    # MB/s
  encrypted: "true"                    # encrypt at rest
  fsType: ext4
reclaimPolicy: Delete                  # delete EBS volume when PVC is removed
volumeBindingMode: WaitForFirstConsumer # provision in same AZ as the pod
allowVolumeExpansion: true             # allow PVC resize later
---
# --- PVC requesting 50Gi from fast-ssd ---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-storage
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce                    # single-node read-write
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 50Gi                    # request 50 GiB`,
    },
    {
      language: "yaml",
      caption: "**ConfigMap** and **Secret** mounted as volumes in a Pod",
      source: `# --- ConfigMap with application config ---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  app.properties: |
    server.port=8080
    cache.ttl=300
    log.level=info
  feature-flags.json: |
    {"darkMode": true, "betaAPI": false}
---
# --- Secret with database credentials ---
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: production
type: Opaque
data:
  username: YWRtaW4=                  # base64("admin")
  password: czNjdXIzUEBzcw==          # base64("s3cur3P@ss")
immutable: true                        # prevent accidental changes
---
# --- Pod mounting both ConfigMap and Secret ---
apiVersion: v1
kind: Pod
metadata:
  name: app-server
spec:
  containers:
    - name: app
      image: myapp:2.1
      volumeMounts:
        - name: config-vol
          mountPath: /etc/app/config   # each key = file
          readOnly: true
        - name: secret-vol
          mountPath: /etc/app/secrets
          readOnly: true
      env:
        - name: DB_USER               # inject single key as env var
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
  volumes:
    - name: config-vol
      configMap:
        name: app-config
    - name: secret-vol
      secret:
        secretName: db-credentials
        defaultMode: 0400              # read-only for owner`,
    },
    {
      language: "bash",
      caption: "Essential **kubectl** commands for storage management and debugging",
      source: `# --- PV / PVC Management ---
# List all PersistentVolumes with status and claim
kubectl get pv -o wide

# List PVCs in a namespace with bound PV and StorageClass
kubectl get pvc -n production -o wide

# Describe a PVC to see events (binding, provisioning errors)
kubectl describe pvc database-storage -n production

# Expand a PVC (StorageClass must have allowVolumeExpansion: true)
kubectl patch pvc database-storage -n production \\
  -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'

# --- ConfigMaps & Secrets ---
# Create ConfigMap from file
kubectl create configmap nginx-conf --from-file=nginx.conf

# Create Secret from literal values
kubectl create secret generic api-keys \\
  --from-literal=stripe-key=sk_live_xxx \\
  --from-literal=sendgrid-key=SG.xxx

# View decoded Secret values (base64 decode)
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d

# --- Storage Debugging ---
# Check CSI driver pods are running
kubectl get pods -n kube-system -l app=ebs-csi-controller

# View StorageClasses available in the cluster
kubectl get storageclass

# Check volume attachment status
kubectl get volumeattachment`,
    },
  ],
  diagrams: [
    {
      title: "PV / PVC Binding and Dynamic Provisioning Flow",
      kind: "flow",
      caption: "How a **PVC** triggers *dynamic provisioning* via a **StorageClass**, resulting in a bound **PV** backed by cloud storage.",
      mermaid: `flowchart LR
    A["PVC Created"] --> B{"StorageClass\\nSpecified?"}
    B -- No --> C["Match existing\\nPV by size/access"]
    B -- Yes --> D["CSI Provisioner\\ncreates volume"]
    D --> E["PV Created\\nautomatically"]
    C --> F{"Match\\nFound?"}
    F -- Yes --> G["Bind PVC to PV"]
    F -- No --> H["PVC stays\\nPending"]
    E --> G
    G --> I["Pod mounts\\nPVC"]

    style H fill:#f66,stroke:#333
    style I fill:#6f6,stroke:#333`,
    },
    {
      title: "Kubernetes Storage Architecture",
      kind: "architecture",
      caption: "The relationship between **Pods**, **PVCs**, **PVs**, **StorageClasses**, and the underlying **CSI drivers** connecting to cloud storage backends.",
      mermaid: `flowchart TB
    subgraph Cluster["Kubernetes Cluster"]
        Pod["Pod"] -->|"volumeMount"| PVC["PVC\\n(namespace-scoped)"]
        PVC -->|"binds to"| PV["PV\\n(cluster-scoped)"]
        PVC -.->|"references"| SC["StorageClass"]
        SC -->|"provisions via"| CSI["CSI Driver\\n(controller + node)"]
    end

    subgraph Storage["Storage Backends"]
        EBS["AWS EBS"]
        GCE["GCE PD"]
        NFS["NFS Server"]
        CEPH["Ceph / Rook"]
    end

    CSI --> EBS
    CSI --> GCE
    CSI --> NFS
    CSI --> CEPH

    subgraph Config["Config & Secrets"]
        CM["ConfigMap"] -->|"mount as files\\nor env vars"| Pod
        SEC["Secret"] -->|"mount as tmpfs\\nor env vars"| Pod
        PROJ["Projected\\nVolume"] -->|"combine sources"| Pod
    end`,
    },
    {
      title: "Secret Management Strategies",
      kind: "mindmap",
      caption: "Layered approach to **Kubernetes secrets management** -- from basic built-in Secrets to external vault integrations and encryption at rest.",
      mermaid: `mindmap
  root(("Secrets\\nManagement"))
    Built-in Secrets
      base64 encoding
      RBAC restrictions
      immutable: true
      tmpfs mounts
    Encryption at Rest
      EncryptionConfiguration
      aescbc / secretbox
      KMS providers
    External Vaults
      HashiCorp Vault
      AWS Secrets Manager
      GCP Secret Manager
      Azure Key Vault
    Operators & Tools
      External Secrets Operator
      Sealed Secrets
      CSI Secret Store Driver
    Best Practices
      Audit logging
      Namespace isolation
      Rotate credentials
      Never commit to Git`,
    },
  ],
  comparison: {
    columns: ["Feature", "PV/PVC", "ConfigMap", "Secret", "Projected Volume", "CSI Volume"],
    rows: [
      ["**Purpose**", "Persistent block/file storage", "Non-sensitive config data", "Sensitive data (credentials)", "Combine multiple sources", "Plugin-based storage"],
      ["**Scope**", "PV: *cluster*; PVC: *namespace*", "*Namespace*-scoped", "*Namespace*-scoped", "*Pod*-level", "*Cluster*-level driver"],
      ["**Data at rest**", "On disk/cloud volume", "In **etcd** (plain)", "In **etcd** (base64, encrypt recommended)", "Inherited from sources", "Provider-managed encryption"],
      ["**Dynamic provisioning**", "Yes, via `StorageClass`", "N/A", "N/A", "N/A", "Yes (provisioner sidecar)"],
      ["**Live updates**", "N/A (persistent data)", "*Yes* for volume mounts (~60s)", "*Yes* for volume mounts", "Yes (inherits from sources)", "N/A"],
      ["**Access modes**", "RWO, ROX, RWX, RWOP", "N/A", "N/A", "N/A", "Driver-dependent"],
    ],
  },
  exercises: [
    "Create a **StorageClass** named `standard-gp3` with the AWS EBS CSI provisioner, `WaitForFirstConsumer` binding mode, and `allowVolumeExpansion: true`. Then create a **PVC** requesting `10Gi` and deploy a pod that mounts it at `/data`. Verify the PV is created in the *same AZ* as the scheduled node using `kubectl get pv -o wide`.",
    "Create a **ConfigMap** from a file containing application configuration. Mount it as a volume in a pod, then *update the ConfigMap* and verify the mounted files reflect the change within ~60 seconds **without restarting** the pod. Compare this with environment variable injection -- update the ConfigMap and confirm the env var does NOT change.",
    "Create a **Secret** with database credentials. Mount it in a pod at `/etc/db-creds` with file mode `0400`. Verify the mount is a *tmpfs* (not written to disk) by running `mount | grep db-creds` inside the container. Then try to `kubectl edit` an `immutable: true` Secret and observe the error.",
    "Set up a **VolumeSnapshot** of an existing PVC. Then create a *new PVC* from that snapshot using `dataSource.kind: VolumeSnapshot`. Mount the new PVC in a pod and verify it contains the same data as the original. This simulates a **database backup and restore** workflow.",
    "Deploy a pod using a **projected volume** that combines a ConfigMap (app config), a Secret (API key), and the **downward API** (pod name, namespace, labels) into a single mount at `/etc/pod-info`. Exec into the pod and verify all three sources appear as files in the same directory.",
  ],
  cheatSheet: [
    "`kubectl get pv,pvc -o wide` -- **List all volumes** with status, capacity, access mode, StorageClass, and bound claim",
    "`kubectl describe pvc <name>` -- **Debug volume issues**: check `Events` for provisioning errors, binding failures, or attach problems",
    "`kubectl create configmap <name> --from-file=<path>` -- **Create ConfigMap** from file; use `--from-literal=key=val` for inline values",
    "`kubectl create secret generic <name> --from-literal=key=val` -- **Create Secret** from literal; use `--from-file` for certificate files",
    "`kubectl get secret <name> -o jsonpath='{.data.key}' | base64 -d` -- **Decode Secret** value (base64 to plaintext)",
    "`kubectl patch pvc <name> -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"100Gi\"}}}}'` -- **Expand PVC** (requires `allowVolumeExpansion: true` on StorageClass)",
  ],
  revisionNotes: [
    "**PV binding** matches on *capacity*, *access modes*, *StorageClass*, and *labels*. Use `WaitForFirstConsumer` binding mode to avoid **cross-AZ mounting failures** -- the PV is provisioned in the same zone as the scheduled pod.",
    "**ConfigMaps** update *live* when volume-mounted (kubelet sync ~60s) but **NOT** when injected as environment variables. Secrets follow the same pattern. Use `immutable: true` on Secrets/ConfigMaps that should never change -- it also reduces API server watch load.",
    "**Secrets are NOT encrypted by default** -- they are only *base64-encoded*. Enable `EncryptionConfiguration` for etcd encryption at rest. For production, use **External Secrets Operator** or **CSI Secret Store Driver** to sync from an external vault.",
    "**CSI** replaced in-tree volume plugins with an *out-of-tree*, containerized architecture. CSI drivers enable **volume snapshots**, *cloning*, *expansion*, and *topology-aware provisioning*. They run as controller + node DaemonSet pods.",
    "**Reclaim policies**: `Retain` keeps the PV and data after PVC deletion (manual cleanup needed); `Delete` removes backing storage automatically. Always use `Retain` for production databases to prevent accidental data loss.",
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
