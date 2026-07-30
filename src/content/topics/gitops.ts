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
};
