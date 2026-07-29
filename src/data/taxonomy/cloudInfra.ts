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
          { slug: "service-models", title: "IaaS, PaaS & SaaS", summary: "The layers of cloud abstraction.", level: "Beginner", tags: ["cloud"], contentReady: ["quick-summary", "comparison", "diagrams", "interview-qa"] },
          { slug: "deployment-models", title: "Public, Private & Hybrid Cloud", summary: "Where your cloud lives.", level: "Beginner", tags: ["cloud"] },
          { slug: "shared-responsibility", title: "Shared Responsibility Model", summary: "Who secures what.", level: "Intermediate", tags: ["cloud", "security"] },
          { slug: "cloud-cost", title: "Cost Management & FinOps", summary: "Keeping the cloud bill under control.", level: "Advanced", tags: ["cloud"] },
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
          { slug: "aws-compute", title: "Compute (EC2, Lambda, ECS)", summary: "Running code, from VMs to serverless.", level: "Intermediate", tags: ["aws"] },
          { slug: "aws-storage", title: "Storage (S3, EBS, EFS)", summary: "Object, block, and file storage.", level: "Intermediate", tags: ["aws"] },
          { slug: "aws-databases", title: "Databases (RDS, DynamoDB, Aurora)", summary: "Managed relational and NoSQL data.", level: "Intermediate", tags: ["aws"] },
          { slug: "aws-networking", title: "Networking (VPC, Route 53, CloudFront)", summary: "Isolating and delivering workloads.", level: "Advanced", tags: ["aws"] },
          { slug: "aws-iam", title: "IAM & Security", summary: "Least-privilege access and policies.", level: "Advanced", tags: ["aws", "security"] },
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
          { slug: "azure-compute", title: "Compute (VMs, Functions, AKS)", summary: "Running workloads on Azure.", level: "Intermediate", tags: ["azure"] },
          { slug: "azure-storage", title: "Storage (Blob, Disk, Files)", summary: "Azure's storage tiers.", level: "Intermediate", tags: ["azure"] },
          { slug: "azure-entra", title: "Identity (Microsoft Entra ID)", summary: "Enterprise identity and access.", level: "Advanced", tags: ["azure", "security"] },
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
          { slug: "gcp-compute", title: "Compute (GCE, Cloud Run, GKE)", summary: "From VMs to managed Kubernetes.", level: "Intermediate", tags: ["gcp"] },
          { slug: "gcp-data", title: "Data (BigQuery, Bigtable, Spanner)", summary: "Analytics and globally-distributed data.", level: "Advanced", tags: ["gcp"] },
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
          { slug: "container-fundamentals", title: "Container Fundamentals", summary: "Namespaces and cgroups vs virtual machines.", level: "Beginner", tags: ["docker"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"] },
          { slug: "images-layers", title: "Images & Layers", summary: "How the union filesystem keeps images small.", level: "Intermediate", tags: ["docker"] },
          { slug: "docker-networking", title: "Networking & Volumes", summary: "Connecting and persisting containers.", level: "Intermediate", tags: ["docker"] },
          { slug: "docker-compose", title: "Docker Compose", summary: "Defining multi-container applications.", level: "Intermediate", tags: ["docker"] },
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
          { slug: "k8s-architecture", title: "Kubernetes Architecture", summary: "Control plane, nodes, and the reconciliation loop.", level: "Intermediate", tags: ["kubernetes"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"] },
          { slug: "pods-workloads", title: "Pods & Workloads", summary: "Deployments, StatefulSets, DaemonSets, Jobs.", level: "Intermediate", tags: ["kubernetes"] },
          { slug: "k8s-networking", title: "Services & Networking", summary: "How pods find and reach each other.", level: "Advanced", tags: ["kubernetes"] },
          { slug: "k8s-storage", title: "Storage & Config", summary: "Volumes, ConfigMaps, and Secrets.", level: "Advanced", tags: ["kubernetes"] },
        ],
      },
      {
        slug: "k8s-operations",
        title: "Operations & Internals",
        summary: "Running Kubernetes for real.",
        topics: [
          { slug: "k8s-scheduling", title: "Scheduling & Autoscaling", summary: "Placing pods and scaling to demand.", level: "Advanced", tags: ["kubernetes"] },
          { slug: "k8s-internals", title: "Control Plane Internals", summary: "etcd, controllers, and the API server.", level: "Advanced Concepts", tags: ["kubernetes"] },
        ],
      },
    ],
  },
];
