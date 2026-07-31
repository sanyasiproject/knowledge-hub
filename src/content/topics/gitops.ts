import type { TopicContent } from "../types";

export const gitops: TopicContent = {
  quickSummary: [
    "GitOps uses Git as the single source of truth for both application code and infrastructure/deployment configuration — the desired state of the entire system is declared in Git.",
    "A pull-based reconciliation loop continuously compares the live cluster state to the desired state in Git and automatically corrects any drift, rather than pushing changes via CI pipelines.",
    "ArgoCD and Flux are the leading GitOps operators for Kubernetes, watching Git repositories and syncing cluster resources to match declared manifests.",
    "GitOps provides a complete audit trail (Git log), easy rollback (git revert), access control (Git permissions), and self-healing infrastructure (continuous reconciliation).",
  ],
  detailed: [
    "## What Is GitOps\n\nGitOps is an operational framework where the entire desired state of a system — Kubernetes manifests, Helm charts, Kustomize overlays, infrastructure config — is stored in Git repositories. Changes are made via pull requests, reviewed, and merged. An operator running inside the cluster detects the new commit and reconciles the live state to match. No one runs `kubectl apply` manually; no CI pipeline pushes to the cluster. The cluster pulls its own configuration. This inversion of control is what distinguishes GitOps from traditional CI/CD-driven deployment.",

    "## Pull-Based Reconciliation\n\nIn traditional CI/CD, the pipeline pushes changes to the cluster (push-based). In GitOps, an in-cluster operator polls (or receives webhooks from) Git and pulls the desired state. A reconciliation loop runs continuously: compare desired state (Git) to actual state (cluster), compute the diff, and apply corrections. If someone manually changes a resource with `kubectl edit`, the operator detects the drift and reverts it. This self-healing behavior ensures the cluster always matches what is declared in Git. The reconciliation interval is typically 1-5 minutes, or immediate via webhook triggers.",

    "## ArgoCD\n\nArgoCD is a declarative GitOps continuous delivery tool for Kubernetes. It watches one or more Git repositories containing Kubernetes manifests (plain YAML, Helm, Kustomize, Jsonnet). An ArgoCD Application resource maps a Git path to a cluster namespace. The ArgoCD UI shows sync status, resource health, and a visual tree of all managed resources. Key features include automated sync (auto-apply on Git changes), sync waves and hooks (ordering of resource application), multi-cluster support, SSO integration, RBAC, and diff previews. ArgoCD Application Sets allow templating applications across multiple clusters or environments.",

    "## Flux\n\nFlux (v2) is a set of Kubernetes controllers that implement GitOps. Its architecture is modular: Source Controller watches Git/Helm/OCI repositories, Kustomize Controller applies Kustomize overlays, Helm Controller manages Helm releases, and Notification Controller handles alerts and webhooks. Flux is configured entirely via Kubernetes custom resources — there is no separate UI server (though web UIs like Weave GitOps exist). Flux supports multi-tenancy, allowing different teams to manage their own namespaces with separate Git sources and permissions.",

    "## Git Repository Structure\n\nA common pattern uses two repositories: an application repo (source code + Dockerfile) and a GitOps config repo (Kubernetes manifests). The CI pipeline builds the app, pushes a Docker image tagged with the commit SHA, and updates the image tag in the config repo (via PR or automated commit). The GitOps operator detects the config repo change and deploys the new image. This separation ensures that the config repo is the sole authority for what runs in the cluster and keeps deployment concerns out of the application repo.",

    "## Benefits and Trade-offs\n\nBenefits: complete audit trail via Git history, easy rollback via `git revert`, access control via Git permissions (no cluster credentials in CI), self-healing from manual drift, and consistent multi-cluster deployments. Trade-offs: managing secrets in Git requires encryption (Sealed Secrets, SOPS, External Secrets Operator), the reconciliation loop adds latency compared to direct push, debugging sync failures requires understanding the operator's logs and status conditions, and the learning curve for teams accustomed to imperative `kubectl` workflows. Despite these trade-offs, GitOps has become the dominant deployment model for Kubernetes workloads.",
  ],
  interviewQA: [
    {
      q: "What is the difference between push-based CI/CD and pull-based GitOps?",
      a: "In push-based CI/CD, the pipeline has credentials to the cluster and actively pushes changes (kubectl apply, helm upgrade) after building and testing. In pull-based GitOps, an operator inside the cluster has credentials to Git (read-only) and pulls the desired state, reconciling the cluster to match. The key advantages of pull-based: the CI system never needs cluster credentials (reducing attack surface), the cluster self-heals from manual drift, and the Git repo is the single source of truth for what is deployed. The trade-off is added latency from the reconciliation interval.",
      followUps: [
        "How do you handle urgent hotfixes in a GitOps model?",
        "Can you use GitOps for non-Kubernetes infrastructure?",
      ],
    },
    {
      q: "How do you manage secrets in a GitOps workflow?",
      a: "Since Git is the source of truth, secrets need special handling — you cannot commit plaintext secrets. Common approaches: Sealed Secrets (encrypt secrets with a cluster-side key; only the controller can decrypt), SOPS (encrypt specific values in YAML files using KMS, PGP, or age keys), and External Secrets Operator (sync secrets from AWS Secrets Manager, Vault, or Azure Key Vault into Kubernetes Secrets at runtime). Each approach has trade-offs in complexity, key management, and rotation. External Secrets Operator is increasingly preferred for production because secrets are managed in purpose-built vaults.",
      followUps: [
        "How does Sealed Secrets work under the hood?",
        "What happens when a KMS key is rotated?",
      ],
    },
    {
      q: "How does ArgoCD handle rollback?",
      a: "ArgoCD supports rollback at two levels. First, since the desired state is in Git, `git revert` on the config commit and pushing creates a new commit with the previous state — ArgoCD syncs to it automatically. Second, ArgoCD maintains a history of sync operations and can re-sync to a previous Git revision through the UI or CLI (`argocd app rollback`). The Git-based approach is preferred because it maintains the audit trail and keeps Git as the source of truth. Direct rollback via ArgoCD bypasses Git and can cause drift between Git and the cluster.",
    },
    {
      q: "What is an ArgoCD ApplicationSet?",
      a: "ApplicationSet is an ArgoCD controller that generates Application resources from templates. It enables managing hundreds of applications across multiple clusters from a single definition. Generators include Git (create an app per directory in a repo), Cluster (create an app per registered cluster), List (explicit list of targets), and Matrix/Merge (combine generators). This is essential for platform teams managing multi-cluster, multi-tenant environments — instead of maintaining hundreds of Application YAMLs, a single ApplicationSet template scales automatically.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary difference between push-based deployment and GitOps?",
      options: [
        "GitOps does not use Git for version control",
        "In GitOps, an in-cluster operator pulls desired state from Git instead of CI pushing to the cluster",
        "Push-based deployment is faster than GitOps",
        "GitOps only works with Helm charts",
      ],
      answerIndex: 1,
      explanation: "GitOps inverts the deployment model: instead of CI/CD pushing changes to the cluster, an in-cluster operator continuously pulls and reconciles desired state from Git.",
    },
    {
      q: "What happens when someone runs `kubectl edit` on a resource managed by a GitOps operator?",
      options: [
        "The change persists permanently",
        "The operator detects the drift and reverts the resource to match Git",
        "The operator updates Git to reflect the manual change",
        "The operator shuts down the affected pod",
      ],
      answerIndex: 1,
      explanation: "GitOps operators continuously reconcile cluster state to match Git. Manual changes are treated as drift and automatically corrected on the next reconciliation cycle.",
    },
    {
      q: "Which tool encrypts Kubernetes secrets so they can be safely stored in Git?",
      options: ["Kustomize", "Sealed Secrets", "ArgoCD", "Flux Source Controller"],
      answerIndex: 1,
      explanation: "Sealed Secrets uses asymmetric encryption: secrets are encrypted with the controller's public key and can only be decrypted by the controller running in the cluster.",
    },
    {
      q: "What is the recommended way to roll back a deployment in GitOps?",
      options: [
        "SSH into the cluster and run kubectl rollout undo",
        "Delete the ArgoCD Application and recreate it",
        "Use git revert on the config commit and let the operator sync",
        "Manually edit the running deployment's image tag",
      ],
      answerIndex: 2,
      explanation: "Git revert creates a new commit with the previous desired state, maintaining the audit trail and keeping Git as the single source of truth.",
    },
  ],
  flashcards: [
    { front: "What is reconciliation in GitOps?", back: "The continuous process of comparing the live cluster state to the desired state in Git and applying corrections to eliminate drift." },
    { front: "What is an ArgoCD Application?", back: "A custom resource that maps a Git repository path (containing Kubernetes manifests) to a target cluster and namespace for continuous synchronization." },
    { front: "What is Flux Source Controller?", back: "A Flux component that watches Git repositories, Helm repositories, or OCI registries and makes their contents available to other Flux controllers." },
    { front: "What is a sync wave in ArgoCD?", back: "An annotation that controls the order in which resources are applied during a sync operation — lower wave numbers are applied first." },
    { front: "What is the External Secrets Operator?", back: "A Kubernetes operator that synchronizes secrets from external vaults (AWS Secrets Manager, HashiCorp Vault) into native Kubernetes Secret resources." },
    { front: "Why use two repositories in GitOps?", back: "One for application source code (triggers CI builds) and one for deployment configuration (triggers GitOps sync), keeping concerns separated and allowing independent change cadences." },
    { front: "What is SOPS?", back: "Secrets OPerationS — a tool that encrypts specific values within YAML/JSON files using KMS, PGP, or age keys, allowing encrypted secrets to be stored in Git." },
    { front: "What is an ArgoCD ApplicationSet?", back: "A template-based generator that creates multiple ArgoCD Applications from a single definition, enabling scalable multi-cluster and multi-environment management." },
  ],
  glossary: [
    { term: "GitOps", definition: "An operational model where Git repositories are the single source of truth for infrastructure and application desired state, with automated reconciliation." },
    { term: "Reconciliation Loop", definition: "A continuous process that compares desired state (Git) to actual state (cluster) and applies corrections to eliminate drift." },
    { term: "Pull-Based Deployment", definition: "A model where the deployment target (cluster) pulls its configuration from a source (Git), rather than having changes pushed to it." },
    { term: "Drift", definition: "Any difference between the live cluster state and the desired state declared in Git." },
    { term: "Sealed Secrets", definition: "A Kubernetes controller and tool for encrypting secrets so they can be safely stored in Git and decrypted only within the cluster." },
    { term: "ArgoCD", definition: "A declarative GitOps continuous delivery tool for Kubernetes that syncs cluster resources to match manifests in Git repositories." },
    { term: "Flux", definition: "A set of modular Kubernetes controllers implementing GitOps, managing sources, Kustomize overlays, and Helm releases via custom resources." },
    { term: "Self-Healing", definition: "The property of GitOps-managed infrastructure to automatically correct manual changes and maintain the desired state declared in Git." },
  ],
  deepDive: [
    "## Reconciliation Internals and Controller Architecture\n\nGitOps operators are built on the Kubernetes controller pattern — a control loop that watches resources and drives actual state toward desired state. ArgoCD's application controller uses an informer cache of all managed resources and performs a three-way diff between the Git-declared state, the last-applied state (stored as an annotation), and the live cluster state. This three-way diff prevents destructive updates when fields are managed by other controllers (e.g., HPA modifying replica counts). The reconciliation cycle works as follows: (1) the repo-server clones or fetches the Git repository, (2) it renders manifests by running Helm template, Kustomize build, or Jsonnet evaluation in a sandboxed environment, (3) the application controller diffs the rendered manifests against the live cluster objects, (4) if drift is detected and auto-sync is enabled, it applies the corrective patch using server-side apply. Flux follows a similar pattern but distributes responsibilities across separate controllers — the Source Controller produces an artifact tarball from Git, and the Kustomize Controller or Helm Controller consumes it. Each controller manages its own reconciliation interval independently, allowing fine-grained control over how aggressively different resources are corrected.",

    "## Multi-Cluster Strategies and Tenant Isolation\n\nProduction GitOps deployments rarely involve a single cluster. ArgoCD supports multi-cluster management by registering external clusters via `argocd cluster add`, storing their kubeconfig credentials as Kubernetes Secrets. An ApplicationSet with a Cluster generator can template an application across all registered clusters, deploying the same manifests (or environment-specific overlays) everywhere. For hub-and-spoke topologies, a central management cluster runs ArgoCD while workload clusters only need network reachability. Flux takes a different approach: each workload cluster typically runs its own set of Flux controllers, each pointing to the same or different Git repositories. Multi-tenancy in Flux is enforced through Kubernetes namespaces and RBAC — a tenant's GitRepository and Kustomization resources are namespace-scoped, and Flux's `--default-service-account` flag ensures manifests are applied with the tenant's ServiceAccount, not the controller's. Cross-namespace references are denied by default, preventing privilege escalation. Both tools support progressive delivery through integrations — ArgoCD with Argo Rollouts (canary and blue-green strategies) and Flux with Flagger (traffic shifting via service mesh or ingress).",

    "## Secret Management Deep Dive\n\nManaging secrets in GitOps requires solving a fundamental tension: Git must be the source of truth, but secrets cannot be stored in plaintext. Sealed Secrets addresses this with asymmetric encryption — the `kubeseal` CLI encrypts a Secret using the controller's public certificate, producing a SealedSecret custom resource that can be safely committed to Git. The controller decrypts it inside the cluster and creates a regular Kubernetes Secret. Critically, SealedSecrets are scoped: by default they are bound to a specific name and namespace (encrypted with those values as additional authenticated data), preventing an attacker from renaming or moving a SealedSecret to gain access in a different context. SOPS (Secrets OPerationS) takes a different approach — it encrypts individual values within a YAML file while leaving keys and structure in plaintext, making diffs readable. SOPS integrates with AWS KMS, GCP KMS, Azure Key Vault, and age keys. Flux has native SOPS support via the `decryption` field on Kustomization resources. The External Secrets Operator (ESO) avoids storing secrets in Git entirely — an ExternalSecret resource declares which key to fetch from an external vault, and the operator creates the Kubernetes Secret at runtime. ESO supports refresh intervals for automatic rotation and template-based Secret construction."
  ],
  code: [
    {
      language: "yaml",
      caption: "ArgoCD Application resource syncing a Helm chart from Git",
      source: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-config.git
    targetRevision: main
    path: environments/production/my-app
    helm:
      valueFiles:
        - values-production.yaml
      parameters:
        - name: image.tag
          value: "abc1234"
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ServerSideApply=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m`
    },
    {
      language: "yaml",
      caption: "Flux GitRepository and Kustomization resources",
      source: `---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/org/gitops-config.git
  ref:
    branch: main
  secretRef:
    name: git-credentials
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  retryInterval: 2m
  timeout: 3m
  sourceRef:
    kind: GitRepository
    name: my-app
  path: ./environments/production/my-app
  targetNamespace: my-app
  prune: true
  force: false
  decryption:
    provider: sops
    secretRef:
      name: sops-age-key
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-app
      namespace: my-app`
    },
    {
      language: "yaml",
      caption: "Sealed Secret encrypted for safe Git storage",
      source: `apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: my-app-secrets
  namespace: my-app
  annotations:
    sealedsecrets.bitnami.com/cluster-wide: "false"
spec:
  encryptedData:
    DATABASE_URL: AgBy3i4OJSWK+PiTySYZZA9rO...truncated...==
    API_KEY: AgCtr8KHJG7xDmP2G1ynQ7nL...truncated...==
  template:
    metadata:
      name: my-app-secrets
      namespace: my-app
    type: Opaque`
    }
  ],
  comparison: {
    columns: ["Feature", "ArgoCD", "Flux"],
    rows: [
      ["Architecture", "Monolithic server with API, UI, repo-server, and application controller", "Modular set of independent controllers (Source, Kustomize, Helm, Notification)"],
      ["UI", "Built-in web UI with resource tree visualization, diff preview, and sync status", "No built-in UI; third-party options like Weave GitOps Dashboard"],
      ["Configuration", "Application CRDs plus CLI/UI for management", "Entirely Kubernetes-native CRDs; no CLI required for operation"],
      ["Multi-Cluster", "Central ArgoCD manages remote clusters via registered kubeconfigs", "Each cluster runs its own Flux controllers; can share Git sources"],
      ["Multi-Tenancy", "RBAC via AppProject resources restricting repos, clusters, and namespaces", "Namespace-scoped resources with per-tenant ServiceAccounts and RBAC"],
      ["Secret Management", "Supports plugins; community integrations with Sealed Secrets, SOPS, ESO", "Native SOPS decryption built into Kustomize Controller"],
      ["Manifest Rendering", "Helm, Kustomize, Jsonnet, plain YAML, custom config management plugins", "Kustomize and Helm via dedicated controllers; no Jsonnet support"],
      ["Progressive Delivery", "Integrates with Argo Rollouts for canary and blue-green", "Integrates with Flagger for canary, A/B testing, and blue-green"],
      ["Notifications", "Built-in notification system with Slack, webhook, and email support", "Notification Controller with provider integrations for alerts"],
      ["Scalability", "ApplicationSets for templating hundreds of apps from one definition", "Scales horizontally by sharding controllers across namespaces"]
    ]
  },
  diagrams: [
    {
      title: "GitOps Reconciliation Architecture",
      kind: "architecture",
      caption: "Shows the pull-based flow from Git repository through the GitOps operator to the Kubernetes cluster, including the reconciliation feedback loop"
    },
    {
      title: "GitOps Deployment Pipeline Flow",
      kind: "flow",
      caption: "End-to-end flow from developer commit through CI build, config repo update, operator sync, and cluster deployment with drift detection"
    }
  ],
  animations: [
    {
      title: "GitOps Deployment Lifecycle",
      steps: [
        { label: "Developer pushes code", detail: "A developer merges a pull request to the application repository's main branch, triggering the CI pipeline." },
        { label: "CI builds and publishes image", detail: "The CI pipeline runs tests, builds a container image tagged with the commit SHA (e.g., my-app:a3f8c21), and pushes it to the container registry." },
        { label: "Config repo updated", detail: "The CI pipeline (or an automated bot) opens a PR to the GitOps config repository updating the image tag in the deployment manifest or values file." },
        { label: "PR reviewed and merged", detail: "A team member reviews the config change, verifies the image tag matches the tested commit, and merges the PR. This merge is the deployment trigger." },
        { label: "Operator detects new commit", detail: "The GitOps operator (ArgoCD or Flux) detects the new commit on the config repo via polling or webhook and begins reconciliation." },
        { label: "Manifests rendered and diffed", detail: "The operator renders the manifests (Helm template, Kustomize build) and computes a diff between the desired state and the live cluster state." },
        { label: "Resources applied to cluster", detail: "The operator applies the diff using server-side apply. New pods are created with the updated image while old pods are terminated according to the rollout strategy." },
        { label: "Health checks and status", detail: "The operator monitors resource health (Deployment rollout, Pod readiness). If healthy, the sync is marked successful. If unhealthy, it reports a degraded status and can trigger alerts." }
      ]
    }
  ],
  exercises: [
    "Set up a local Kubernetes cluster (kind or minikube), install ArgoCD, create a Git repository with a simple Nginx deployment manifest, and configure an ArgoCD Application to sync it. Verify that changing the replica count in Git triggers an automatic update in the cluster.",
    "Install Flux on a cluster using `flux bootstrap github`, create a GitRepository and Kustomization resource pointing to a config repo, and deploy a multi-tier application (frontend + backend + database). Practice modifying manifests and observing the reconciliation.",
    "Implement secret management by installing the Sealed Secrets controller, encrypting a database password with `kubeseal`, committing the SealedSecret to your GitOps repo, and verifying the operator decrypts it into a usable Kubernetes Secret.",
    "Simulate drift detection: after deploying an application via GitOps, manually edit the Deployment with `kubectl edit` to change the image tag. Observe how the GitOps operator detects and reverts the change. Check the operator logs and status conditions to understand the reconciliation.",
    "Create an ArgoCD ApplicationSet using the Git directory generator to deploy separate instances of an application for dev, staging, and production environments from different directory paths in the same repository."
  ],
  cheatSheet: [
    "argocd app create <name> --repo <url> --path <path> --dest-server https://kubernetes.default.svc --dest-namespace <ns> — create an ArgoCD Application from CLI",
    "argocd app sync <name> — manually trigger a sync for an application",
    "argocd app diff <name> — preview what changes would be applied on next sync",
    "argocd app history <name> — view the sync history and previous revisions",
    "flux bootstrap github --owner=<org> --repository=<repo> --path=clusters/my-cluster — bootstrap Flux on a cluster with GitHub",
    "flux get kustomizations — list all Flux Kustomization resources and their sync status",
    "flux reconcile kustomization <name> — force an immediate reconciliation instead of waiting for the interval",
    "kubeseal --format=yaml --cert=pub-cert.pem < secret.yaml > sealed-secret.yaml — encrypt a Secret into a SealedSecret for Git storage"
  ],
  revisionNotes: [
    "GitOps uses Git as the single source of truth — all changes to infrastructure and applications must go through Git commits and pull requests.",
    "Pull-based model: the cluster operator pulls desired state from Git, unlike traditional CI/CD where pipelines push to the cluster. This eliminates the need for cluster credentials in CI.",
    "Reconciliation loop continuously compares desired state (Git) with actual state (cluster) and auto-corrects drift, providing self-healing infrastructure.",
    "ArgoCD is a monolithic GitOps tool with a built-in UI, multi-cluster support via registered kubeconfigs, and ApplicationSets for scaling across environments.",
    "Flux v2 is modular — separate controllers for sources, Kustomize, Helm, and notifications. Configured entirely via Kubernetes CRDs with native SOPS decryption support.",
    "Secrets in Git require encryption: Sealed Secrets (asymmetric encryption, cluster-scoped decryption), SOPS (value-level encryption with KMS/age), or External Secrets Operator (fetches from external vaults at runtime).",
    "Two-repo pattern: application repo (source code + CI) and config repo (Kubernetes manifests + GitOps sync). CI updates the image tag in the config repo, and the operator deploys it.",
    "Rollback in GitOps is a git revert — creating a new commit with the previous desired state maintains the audit trail and keeps Git authoritative."
  ],
  resources: [
    { label: "OpenGitOps Specification", kind: "docs", note: "The CNCF-backed specification defining GitOps principles and required capabilities for compliant implementations" },
    { label: "ArgoCD Official Documentation", kind: "docs", note: "Comprehensive docs covering installation, Application CRDs, ApplicationSets, SSO, RBAC, and multi-cluster setup" },
    { label: "Flux Official Documentation", kind: "docs", note: "Complete reference for Flux controllers, bootstrap process, multi-tenancy configuration, and SOPS integration" },
    { label: "Guide to GitOps by Weaveworks", kind: "article", note: "In-depth guide from the team that coined the term GitOps, covering principles, patterns, and production best practices" },
    { label: "GitOps and Kubernetes (Manning)", kind: "book", note: "Book covering GitOps fundamentals, ArgoCD and Flux in practice, secret management, and progressive delivery patterns" }
  ],
};
