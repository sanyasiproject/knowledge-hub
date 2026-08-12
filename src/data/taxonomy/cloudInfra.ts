import type { Domain } from "../schema";

export const cloudAndInfra: Domain[] = [
  {
    slug: "cloud-computing",
    title: "Cloud Computing",
    summary: "Renting computing as a utility — the models and mental frameworks.",
    icon: "☁️",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "cloud-fundamentals",
        title: "Fundamentals",
        summary: "The service and deployment models.",
        topics: [
          { slug: "cloud-computing", title: "What Is Cloud Computing?", summary: "Computing as a metered utility — the idea, the economics, and the trade-offs.", level: "Beginner", tags: ["cloud"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"], related: ["service-models", "deployment-models", "shared-responsibility", "cloud-cost", "serverless-arch"] },
          { slug: "service-models", title: "IaaS, PaaS & SaaS", summary: "The layers of cloud abstraction.", level: "Beginner", tags: ["cloud"], contentReady: ["quick-summary", "comparison", "diagrams", "interview-qa"], related: ["cloud-computing", "deployment-models", "shared-responsibility", "cloud-cost", "aws-compute"] },
          { slug: "deployment-models", title: "Public, Private & Hybrid Cloud", summary: "Where your cloud lives.", level: "Beginner", tags: ["cloud"], related: ["service-models", "shared-responsibility", "cloud-cost", "infrastructure-as-code", "serverless-arch"] },
          { slug: "shared-responsibility", title: "Shared Responsibility Model", summary: "Who secures what.", level: "Intermediate", tags: ["cloud", "security"], related: ["service-models", "aws-iam", "azure-entra", "deployment-models", "cloud-cost"] },
          { slug: "cloud-cost", title: "Cost Management & FinOps", summary: "Keeping the cloud bill under control.", level: "Advanced", tags: ["cloud"], related: ["shared-responsibility", "service-models", "deployment-models", "infrastructure-as-code", "capacity-planning"] },
        ],
      },
    ],
  },
  {
    slug: "aws",
    title: "AWS",
    summary: "Amazon Web Services — the most widely used cloud platform.",
    icon: "🟧",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "aws-core",
        title: "Core Services",
        summary: "Compute, storage, database, networking, identity.",
        topics: [
          { slug: "aws-compute", title: "Compute (EC2, Lambda, ECS)", summary: "Running code, from VMs to serverless.", level: "Intermediate", tags: ["aws"], related: ["aws-storage", "aws-databases", "aws-networking", "aws-iam", "container-fundamentals"] },
          { slug: "aws-storage", title: "Storage (S3, EBS, EFS)", summary: "Object, block, and file storage.", level: "Intermediate", tags: ["aws"], related: ["aws-compute", "aws-databases", "aws-networking", "aws-iam", "k8s-storage"] },
          { slug: "aws-databases", title: "Databases (RDS, DynamoDB, Aurora)", summary: "Managed relational and NoSQL data.", level: "Intermediate", tags: ["aws"], related: ["aws-compute", "aws-storage", "aws-networking", "indexing", "replication-partitioning"] },
          { slug: "aws-networking", title: "Networking (VPC, Route 53, CloudFront)", summary: "Isolating and delivering workloads.", level: "Advanced", tags: ["aws"], related: ["aws-compute", "aws-iam", "k8s-networking", "dns", "load-balancing"] },
          { slug: "aws-iam", title: "IAM & Security", summary: "Least-privilege access and policies.", level: "Advanced", tags: ["aws", "security"], related: ["aws-networking", "rbac-abac", "oauth-oidc", "azure-entra", "shared-responsibility"] },
        ],
      },
    ],
  },
  {
    slug: "azure",
    title: "Azure",
    summary: "Microsoft's cloud, strong in enterprise and identity.",
    icon: "🟦",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "azure-core",
        title: "Core Services",
        summary: "The Azure equivalents of the core building blocks.",
        topics: [
          { slug: "azure-compute", title: "Compute (VMs, Functions, AKS)", summary: "Running workloads on Azure.", level: "Intermediate", tags: ["azure"], related: ["azure-storage", "azure-entra", "aws-compute", "gcp-compute", "container-fundamentals"] },
          { slug: "azure-storage", title: "Storage (Blob, Disk, Files)", summary: "Azure's storage tiers.", level: "Intermediate", tags: ["azure"], related: ["azure-compute", "azure-entra", "aws-storage", "k8s-storage", "docker-networking"] },
          { slug: "azure-entra", title: "Identity (Microsoft Entra ID)", summary: "Enterprise identity and access.", level: "Advanced", tags: ["azure", "security"], related: ["azure-compute", "aws-iam", "rbac-abac", "oauth-oidc", "shared-responsibility"] },
        ],
      },
    ],
  },
  {
    slug: "google-cloud",
    title: "Google Cloud",
    summary: "GCP — strong in data, ML, and Kubernetes.",
    icon: "🟨",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "gcp-core",
        title: "Core Services",
        summary: "GCP's building blocks.",
        topics: [
          { slug: "gcp-compute", title: "Compute (GCE, Cloud Run, GKE)", summary: "From VMs to managed Kubernetes.", level: "Intermediate", tags: ["gcp"], related: ["gcp-data", "aws-compute", "azure-compute", "k8s-architecture", "container-fundamentals"] },
          { slug: "gcp-data", title: "Data (BigQuery, Bigtable, Spanner)", summary: "Analytics and globally-distributed data.", level: "Advanced", tags: ["gcp"], related: ["gcp-compute", "aws-databases", "cap-theorem", "replication-partitioning", "data-modeling-nosql"] },
        ],
      },
    ],
  },
  {
    slug: "docker",
    title: "Docker",
    summary: "Packaging applications and their dependencies into portable containers.",
    icon: "🐳",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "docker-core",
        title: "Core Docker",
        summary: "Images, containers, and how they work.",
        topics: [
          { slug: "container-fundamentals", title: "Container Fundamentals", summary: "Namespaces and cgroups vs virtual machines.", level: "Beginner", tags: ["docker"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"], related: ["images-layers", "docker-networking", "docker-compose", "virtual-machines", "k8s-architecture"] },
          { slug: "images-layers", title: "Images & Layers", summary: "How the union filesystem keeps images small.", level: "Intermediate", tags: ["docker"], related: ["container-fundamentals", "docker-networking", "docker-compose", "k8s-architecture", "linux-filesystem"] },
          { slug: "docker-networking", title: "Networking & Volumes", summary: "Connecting and persisting containers.", level: "Intermediate", tags: ["docker"], related: ["container-fundamentals", "images-layers", "docker-compose", "k8s-networking", "aws-networking"] },
          { slug: "docker-compose", title: "Docker Compose", summary: "Defining multi-container applications.", level: "Intermediate", tags: ["docker"], related: ["container-fundamentals", "images-layers", "docker-networking", "k8s-architecture", "infrastructure-as-code"] },
        ],
      },
    ],
  },
  {
    slug: "kubernetes",
    title: "Kubernetes",
    summary: "The de-facto platform for orchestrating containers at scale.",
    icon: "☸️",
    group: "Cloud & Infrastructure",
    categories: [
      {
        slug: "k8s-fundamentals",
        title: "Fundamentals",
        summary: "Pods, workloads, and the object model.",
        topics: [
          { slug: "k8s-architecture", title: "Kubernetes Architecture", summary: "Control plane, nodes, and the reconciliation loop.", level: "Intermediate", tags: ["kubernetes"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["pods-workloads", "k8s-networking", "k8s-storage", "k8s-scheduling", "container-fundamentals"] },
          { slug: "pods-workloads", title: "Pods & Workloads", summary: "Deployments, StatefulSets, DaemonSets, Jobs.", level: "Intermediate", tags: ["kubernetes"], related: ["k8s-architecture", "k8s-networking", "k8s-storage", "k8s-scheduling", "docker-compose"] },
          { slug: "k8s-networking", title: "Services & Networking", summary: "How pods find and reach each other.", level: "Advanced", tags: ["kubernetes"], related: ["pods-workloads", "k8s-architecture", "k8s-storage", "docker-networking", "aws-networking"] },
          { slug: "k8s-storage", title: "Storage & Config", summary: "Volumes, ConfigMaps, and Secrets.", level: "Advanced", tags: ["kubernetes"], related: ["pods-workloads", "k8s-architecture", "k8s-networking", "aws-storage", "docker-networking"] },
        ],
      },
      {
        slug: "k8s-operations",
        title: "Operations & Internals",
        summary: "Running Kubernetes for real.",
        topics: [
          { slug: "k8s-scheduling", title: "Scheduling & Autoscaling", summary: "Placing pods and scaling to demand.", level: "Advanced", tags: ["kubernetes"], related: ["k8s-internals", "pods-workloads", "k8s-architecture", "capacity-planning", "k8s-networking"] },
          { slug: "k8s-internals", title: "Control Plane Internals", summary: "etcd, controllers, and the API server.", level: "Advanced Concepts", tags: ["kubernetes"], related: ["k8s-scheduling", "k8s-architecture", "consensus", "leader-election", "k8s-networking"] },
        ],
      },
    ],
  },
];
