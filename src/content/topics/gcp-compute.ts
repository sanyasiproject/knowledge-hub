import type { TopicContent } from "../types";

export const gcpCompute: TopicContent = {
  quickSummary: [
    "Google Compute Engine (GCE) provides IaaS virtual machines with predefined, custom, and sole-tenant machine types across general-purpose (E2, N2, N2D), compute-optimized (C2, C2D), memory-optimized (M2, M3), and accelerator-optimized (A2, G2) families, with per-second billing and sustained-use discounts applied automatically.",
    "Cloud Run is a fully managed serverless platform for running stateless containers that scales automatically from zero to thousands of instances, billing only for request-handling time, with support for HTTP, gRPC, WebSockets, and event-driven workloads via Eventarc.",
    "Google Kubernetes Engine (GKE) is a managed Kubernetes service offering Standard mode (you manage node pools) and Autopilot mode (Google manages nodes, scaling, and security), with deep integration into Google Cloud networking, identity, and observability.",
    "Cloud Functions is Google's Functions-as-a-Service (FaaS) offering for lightweight event-driven compute, supporting HTTP triggers, Pub/Sub, Cloud Storage events, Firestore triggers, and more, with 2nd gen built on Cloud Run for longer timeouts, larger instances, and concurrency.",
    "Preemptible VMs (and their successor, Spot VMs) offer up to 60-91% discount on compute by using spare Google Cloud capacity, with the caveat that instances can be terminated with 30 seconds notice and always terminate after 24 hours (preemptible) or may run indefinitely (Spot).",
  ],
  detailed: [
    "## Google Compute Engine\n\nGCE is Google Cloud's IaaS VM platform. Machine types are grouped into families: E2 (cost-optimized, shared-core and standard), N2/N2D (balanced price-performance, Intel/AMD), C2/C2D (compute-optimized for HPC, gaming servers), M2/M3 (memory-optimized, up to 12 TiB RAM for SAP HANA), and A2/G2 (accelerator-optimized with NVIDIA GPUs for ML). Custom machine types let you specify exact vCPU and memory ratios. Sole-tenant nodes provide a physical server dedicated to your project for licensing compliance. GCE supports live migration — VMs are transparently moved between hosts during maintenance without downtime. Persistent disks (pd-standard, pd-balanced, pd-ssd, pd-extreme) are network-attached and independent of VM lifecycle. Local SSDs provide high-IOPS ephemeral storage directly attached to the host.",
    "## Cloud Run\n\nCloud Run runs stateless containers without cluster management. You deploy a container image and Cloud Run handles provisioning, scaling, TLS, and load balancing. Key features: automatic scaling from zero (no minimum instances by default, configurable minimum for latency-sensitive workloads), concurrency up to 1000 requests per instance, support for any language/runtime via containers, CPU allocation modes (CPU always allocated for background processing, or CPU only during requests for cost savings), and revision-based traffic splitting for canary deployments. Cloud Run integrates with Eventarc for event-driven architectures, receiving events from Pub/Sub, Cloud Storage, Cloud Audit Logs, and 90+ Google Cloud sources. Cloud Run Jobs handle batch workloads that run to completion rather than serving requests.",
    "## Google Kubernetes Engine\n\nGKE provides managed Kubernetes with two modes. Standard mode gives you full control over node configuration, node pools, and cluster settings — you manage node upgrades and scaling. Autopilot mode is a fully managed experience where Google provisions and manages nodes, enforces security best practices (no SSH, no privileged containers), and bills per pod resource request rather than per node. GKE features include: multi-cluster management with GKE Fleet, Workload Identity for mapping Kubernetes service accounts to Google Cloud service accounts (eliminating service account key files), Binary Authorization for enforcing deploy-time container image verification, GKE Sandbox (gVisor) for untrusted workloads, and Cloud Service Mesh (Istio-based) for traffic management and observability.",
    "## Cloud Functions\n\nCloud Functions (2nd gen, built on Cloud Run and Eventarc) executes single-purpose functions in response to events. Supported runtimes include Node.js, Python, Go, Java, .NET, Ruby, and PHP. Triggers include HTTP(S), Pub/Sub messages, Cloud Storage events (object create, delete, archive, metadata update), Firestore document changes, Firebase Authentication events, and Cloud Scheduler for cron-like invocations. 2nd gen improvements over 1st gen: longer timeouts (up to 60 minutes vs. 9 minutes), larger instances (up to 16 GiB RAM, 4 vCPUs), concurrency (up to 1000 concurrent requests per instance vs. 1), traffic splitting between revisions, and Eventarc integration for broader event sources. Functions connect to VPC networks via Serverless VPC Access connectors for reaching private resources.",
    "## Preemptible and Spot VMs\n\nPreemptible VMs are excess Compute Engine capacity available at 60-91% discount. They can be preempted (terminated) at any time with 30 seconds notice and always terminate after 24 hours. Spot VMs are the newer version with the same pricing model but without the 24-hour maximum lifetime — instances may run indefinitely if capacity is available. Both types are ideal for fault-tolerant, batch, and stateless workloads: MapReduce jobs, CI/CD builds, rendering, genomics pipelines, and distributed compute. Best practices include: using managed instance groups with autohealing for automatic replacement, checkpointing long-running work, distributing across zones and machine types for availability, and using shutdown scripts to handle graceful termination during the 30-second preemption notice.",
    "## Cost Optimization\n\nGCE applies Sustained Use Discounts (SUDs) automatically — if a VM runs for more than 25% of a month, the incremental cost decreases, resulting in up to 30% savings for full-month usage. Committed Use Discounts (CUDs) offer 1-year (37% off) or 3-year (55% off) commitments for predictable workloads. Recommendations Engine analyzes usage and suggests right-sizing underutilized VMs. Cloud Run charges only for actual request-handling time (billed per 100ms), making it cost-effective for variable traffic. GKE Autopilot bins-packs pods efficiently and bills per pod, avoiding over-provisioned nodes. Preemptible/Spot VMs provide the deepest discounts for fault-tolerant workloads.",
  ],
  interviewQA: [
    {
      q: "Compare GKE Standard mode and Autopilot mode. When would you choose each?",
      a: "Standard mode gives full control over node pools, machine types, node images, SSH access, and DaemonSets — choose it when you need custom node configurations, GPU workloads, privileged containers, or specific kernel modules. Autopilot mode abstracts node management entirely: Google provisions nodes, enforces security hardening (no SSH, no privileged pods, restricted hostPath mounts), and bills per pod resource request rather than per node. Choose Autopilot when you want to focus on workloads without managing infrastructure, want built-in security best practices, and have workloads that fit within Autopilot's constraints. Autopilot also eliminates the cost of unscheduled node capacity since you pay only for what pods request.",
      followUps: [
        "What is Workload Identity and why is it preferred over service account keys?",
        "How does Binary Authorization enforce supply chain security?",
      ],
    },
    {
      q: "How does Cloud Run differ from Cloud Functions, and when should you use each?",
      a: "Cloud Run runs arbitrary containers and supports any language, framework, or binary, with concurrency up to 1000 requests per instance, request timeouts up to 60 minutes, and WebSocket/gRPC support. Cloud Functions (2nd gen) runs single-purpose functions in supported runtimes, built on Cloud Run under the hood, with the same timeout and concurrency improvements. Use Cloud Functions when you want a simple event-driven function with minimal boilerplate and declarative event bindings. Use Cloud Run when you need full control over the runtime, have an existing containerized application, need WebSocket or streaming support, or want to use frameworks not supported by Cloud Functions runtimes.",
      followUps: [
        "What is the cold start behavior difference between Cloud Run and Cloud Functions?",
        "How does Cloud Run Jobs differ from Cloud Run services?",
      ],
    },
    {
      q: "Explain the difference between Preemptible VMs and Spot VMs in GCE.",
      a: "Both offer the same deep discounts (60-91% off) using spare capacity and can be preempted with 30 seconds notice. The key difference: Preemptible VMs always terminate after 24 hours regardless of capacity availability, while Spot VMs have no maximum lifetime and may run indefinitely if capacity remains. Spot VMs also support dynamic pricing where the discount varies. For new workloads, Google recommends Spot VMs as the successor to Preemptible VMs. Both require fault-tolerant application design with checkpointing, automatic restart, and distributed workload patterns.",
    },
    {
      q: "How do Sustained Use Discounts work on GCE?",
      a: "SUDs are automatic discounts that apply when a VM instance runs for a significant portion of the billing month. After running for more than 25% of the month, each additional increment is billed at a progressively lower rate. At full month usage, the effective discount is up to 30% off on-demand pricing. SUDs are applied per project per region per machine type family — GCE aggregates usage across all instances of the same machine type in a region. SUDs apply to custom machine types and predefined types but not to E2, A2, or Spot VMs. They stack with Committed Use Discounts only partially — CUDs replace SUDs for committed usage.",
    },
  ],
  mcqs: [
    {
      q: "Which GKE mode bills per pod resource request rather than per node?",
      options: ["Standard", "Autopilot", "Flex", "Serverless"],
      answerIndex: 1,
      explanation:
        "GKE Autopilot provisions and manages nodes automatically and bills based on the CPU, memory, and ephemeral storage requested by pods, eliminating the cost of idle node capacity.",
    },
    {
      q: "What is the maximum request timeout for Cloud Run services?",
      options: ["5 minutes", "15 minutes", "60 minutes", "24 hours"],
      answerIndex: 2,
      explanation:
        "Cloud Run supports request timeouts up to 60 minutes (3600 seconds). The default is 5 minutes (300 seconds). This applies to both HTTP requests and gRPC streams.",
    },
    {
      q: "What is the maximum lifetime of a Preemptible VM?",
      options: ["1 hour", "6 hours", "24 hours", "No maximum"],
      answerIndex: 2,
      explanation:
        "Preemptible VMs always terminate after 24 hours. Spot VMs (the newer version) have no maximum lifetime and may run indefinitely if capacity remains available.",
    },
    {
      q: "Which feature allows GKE pods to authenticate to Google Cloud APIs without service account key files?",
      options: [
        "Binary Authorization",
        "Workload Identity",
        "GKE Sandbox",
        "Config Connector",
      ],
      answerIndex: 1,
      explanation:
        "Workload Identity maps Kubernetes service accounts to Google Cloud service accounts, allowing pods to obtain credentials through the GKE metadata server without storing key files. This is the recommended approach for pod authentication.",
    },
    {
      q: "What discount do Sustained Use Discounts provide for full-month VM usage on GCE?",
      options: ["Up to 10%", "Up to 20%", "Up to 30%", "Up to 50%"],
      answerIndex: 2,
      explanation:
        "Sustained Use Discounts provide up to 30% off on-demand pricing when a VM runs for the entire billing month. The discount is applied automatically with no upfront commitment.",
    },
  ],
  flashcards: [
    {
      front: "What is live migration in GCE?",
      back: "A feature that transparently moves running VMs between physical hosts during maintenance events without downtime, reboots, or IP address changes. Enabled by default for most machine types.",
    },
    {
      front: "What is Cloud Run Jobs?",
      back: "A Cloud Run feature for running containers to completion (batch workloads) rather than serving requests. Jobs can run multiple tasks in parallel, retry on failure, and integrate with Cloud Scheduler for cron-like execution.",
    },
    {
      front: "What are the two CPU allocation modes in Cloud Run?",
      back: "CPU always allocated (for background processing, WebSockets, continuous work) and CPU throttled outside requests (cheaper, CPU is available only during request handling).",
    },
    {
      front: "What is GKE Sandbox (gVisor)?",
      back: "A security feature that runs pods inside a gVisor user-space kernel, providing an additional isolation layer between the container and the host kernel. Used for running untrusted or multi-tenant workloads.",
    },
    {
      front: "What improvements does Cloud Functions 2nd gen offer over 1st gen?",
      back: "Longer timeouts (60 min vs 9 min), larger instances (16 GiB RAM, 4 vCPUs), concurrency (1000 vs 1 per instance), traffic splitting, and broader event sources via Eventarc.",
    },
    {
      front: "What is a custom machine type in GCE?",
      back: "A VM configuration where you specify the exact number of vCPUs and amount of memory rather than using a predefined machine type, allowing you to right-size resources for your workload.",
    },
    {
      front: "What are Committed Use Discounts (CUDs)?",
      back: "1-year (37% discount) or 3-year (55% discount) commitments for a specified amount of vCPUs and memory in a region, applied automatically to matching usage across the project.",
    },
    {
      front: "What is the Serverless VPC Access connector?",
      back: "A managed component that allows Cloud Functions and Cloud Run to connect to resources in a VPC network, enabling access to private IPs, Memorystore instances, Cloud SQL with private IP, and on-premises resources via VPN.",
    },
  ],
  glossary: [
    {
      term: "Managed Instance Group (MIG)",
      definition:
        "A GCE feature that manages a group of identical VM instances from a common instance template, providing autohealing, autoscaling, rolling updates, and multi-zone distribution.",
    },
    {
      term: "Spot VM",
      definition:
        "A GCE VM type using spare capacity at 60-91% discount, subject to preemption with 30 seconds notice but without the 24-hour maximum lifetime of the older Preemptible VM type.",
    },
    {
      term: "Eventarc",
      definition:
        "A Google Cloud service that routes events from Google Cloud sources, Pub/Sub, and third-party providers to Cloud Run, Cloud Functions, and GKE as event-driven triggers.",
    },
    {
      term: "Workload Identity",
      definition:
        "A GKE feature that federates Kubernetes service accounts with Google Cloud IAM service accounts, enabling pods to authenticate to Google Cloud APIs without service account key files.",
    },
    {
      term: "Sole-Tenant Node",
      definition:
        "A physical Compute Engine server dedicated exclusively to a single project, used for workloads with licensing requirements (bring-your-own-license) or strict isolation needs.",
    },
    {
      term: "Persistent Disk",
      definition:
        "Network-attached block storage for GCE VMs that persists independently of VM lifecycle. Available as pd-standard (HDD), pd-balanced, pd-ssd, and pd-extreme performance tiers.",
    },
    {
      term: "Autopilot",
      definition:
        "A GKE management mode where Google fully manages node provisioning, scaling, security hardening, and upgrades, billing per pod resource request rather than per node.",
    },
    {
      term: "Binary Authorization",
      definition:
        "A GKE security feature that enforces deploy-time policies requiring container images to be signed by trusted attestors before they can run on the cluster.",
    },
  ],
};
