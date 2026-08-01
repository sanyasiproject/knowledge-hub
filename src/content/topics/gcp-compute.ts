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
  deepDive: [
    "**GCE Live Migration and Maintenance Event Internals** — When Google needs to perform *host maintenance* (hardware repairs, firmware updates, security patches), it uses **live migration** to move running VMs to a healthy host *without any downtime*. The process works in three phases: (1) **pre-copy phase** — the VM's memory pages are copied to the destination host while the VM continues running; dirty pages (modified during copy) are *re-copied iteratively* until the delta is small enough; (2) **blackout phase** — the VM is briefly paused (typically *sub-second*, often under `100ms`) while the final dirty pages and CPU state are transferred; (3) **post-copy phase** — the VM resumes on the new host, and any remaining memory pages are fetched on demand via **demand paging**. The `maintenancePolicy` on the instance determines behavior: `MIGRATE` (default) triggers live migration, while `TERMINATE` stops the instance instead. **Preemptible and Spot VMs** *always* use `TERMINATE` since they cannot be live-migrated. You can monitor maintenance events via the *metadata server* at `http://metadata.google.internal/computeMetadata/v1/instance/maintenance-event` — it returns `MIGRATE_ON_HOST_MAINTENANCE` when a migration is imminent. The `gcloud compute instances describe` command shows the `scheduling.onHostMaintenance` field. Instances with **local SSDs** can be live-migrated on *most* machine types, though some older types require `TERMINATE`. The entire process is transparent to the guest OS — *no reboot, no IP change, no dropped connections*.",
    "**Cloud Run Autoscaling Algorithm and Cold Start Optimization** — Cloud Run's autoscaler operates on a *request-based* model that considers **concurrency**, **CPU utilization**, and **request queue depth**. Each Cloud Run instance handles up to `containerConcurrency` requests simultaneously (default `80`, max `1000`). When the *average concurrency* across all instances approaches the configured maximum, the autoscaler provisions **new instances**. The scaling decision uses an *exponentially weighted moving average (EWMA)* to smooth out spikes and avoid thrashing. **Cold starts** occur when a new instance must be created — this involves *pulling the container image*, starting the container runtime, and executing the application's *startup code*. Optimization strategies include: (a) setting `--min-instances` to keep a **warm pool** (e.g., `gcloud run services update my-svc --min-instances=2`); (b) using **startup CPU boost** (`--cpu-boost`) which *temporarily doubles CPU* during startup for faster initialization; (c) keeping container images **small** — use *distroless* or `alpine` base images and multi-stage builds; (d) enabling **lazy loading** of dependencies and deferring heavy initialization; (e) using `--cpu-throttling=false` (CPU always allocated) for workloads that do background work. The `--max-instances` flag caps scaling to prevent runaway costs. Cloud Run also supports **gradual rollouts** with `--revision-traffic` to send a *percentage of traffic* to new revisions, letting you observe cold start behavior under production load before full rollout.",
    "**GKE Autopilot Scheduling and Bin-Packing Mechanics** — GKE Autopilot fundamentally changes the Kubernetes scheduling model by *abstracting away nodes entirely*. When you deploy a pod, Autopilot's **resource management layer** examines the pod's `requests` and `limits` (which *must be set* — Autopilot enforces this via a **mutating admission webhook** that injects defaults if missing). The scheduler then performs **bin-packing**: it fits pods onto nodes using a *best-fit decreasing* algorithm that minimizes wasted resources. Unlike Standard mode, Autopilot **automatically provisions nodes** of the right *machine type and size* — it selects from the `e2-standard`, `e2-medium`, or other families based on the aggregate resource requests. **Pod overhead** is automatically accounted for: each pod has a fixed overhead for the *sandbox, networking, and logging agents* that Autopilot adds transparently. If a pod requests a **GPU** (`nvidia.com/gpu` resource), Autopilot provisions `g2-standard` or `a2-highgpu` nodes as needed. The billing model charges for `max(requests, actual_usage)` per pod, rounded up to predefined **SKU tiers** — you can see these with `kubectl describe pod` in the `autopilot.gke.io/resource-adjustments` annotation. Autopilot enforces **security constraints** via built-in `PodSecurityStandard` policies: *no privileged containers*, no `hostNetwork`, no `hostPID`, and restricted volume types. **Vertical Pod Autoscaler (VPA)** recommendations are applied automatically in Autopilot to right-size pods over time, and the **Horizontal Pod Autoscaler (HPA)** works as expected with custom metrics from *Cloud Monitoring*.",
  ],
  code: [
    {
      language: "bash",
      caption: "Deploy a Cloud Run service with min instances, CPU boost, and concurrency settings",
      source: `# Build and push container image to Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/my-project/my-repo/my-app:v1 .

# Deploy to Cloud Run with autoscaling and cold start optimization
gcloud run deploy my-app \\
  --image us-central1-docker.pkg.dev/my-project/my-repo/my-app:v1 \\
  --region us-central1 \\
  --platform managed \\
  --min-instances 2 \\
  --max-instances 100 \\
  --concurrency 80 \\
  --cpu-boost \\
  --cpu-throttling \\
  --memory 512Mi \\
  --cpu 1 \\
  --timeout 300 \\
  --set-env-vars "NODE_ENV=production" \\
  --allow-unauthenticated

# Split traffic between revisions for canary deployment
gcloud run services update-traffic my-app \\
  --region us-central1 \\
  --to-revisions my-app-v2=10,my-app-v1=90`,
    },
    {
      language: "bash",
      caption: "Create a GKE Autopilot cluster with Workload Identity and deploy a workload",
      source: `# Create GKE Autopilot cluster
gcloud container clusters create-auto my-autopilot-cluster \\
  --region us-central1 \\
  --project my-project \\
  --release-channel regular \\
  --enable-master-authorized-networks \\
  --master-authorized-networks 10.0.0.0/8

# Get cluster credentials
gcloud container clusters get-credentials my-autopilot-cluster \\
  --region us-central1

# Create a Kubernetes service account and bind to GCP service account
kubectl create serviceaccount my-ksa --namespace default

gcloud iam service-accounts add-iam-policy-binding \\
  my-gsa@my-project.iam.gserviceaccount.com \\
  --role roles/iam.workloadIdentityUser \\
  --member "serviceAccount:my-project.svc.id.goog[default/my-ksa]"

kubectl annotate serviceaccount my-ksa \\
  --namespace default \\
  iam.gke.io/gcp-service-account=my-gsa@my-project.iam.gserviceaccount.com`,
    },
    {
      language: "yaml",
      caption: "Configure a Managed Instance Group with Spot VMs and autoscaling",
      source: `# instance-template.yaml — Create via gcloud:
# gcloud compute instance-templates create spot-template \\
#   --machine-type e2-standard-4 \\
#   --provisioning-model SPOT \\
#   --instance-termination-action STOP \\
#   --maintenance-policy TERMINATE \\
#   --image-family debian-12 \\
#   --image-project debian-cloud \\
#   --boot-disk-size 50GB \\
#   --boot-disk-type pd-balanced \\
#   --metadata-from-file shutdown-script=shutdown.sh \\
#   --scopes cloud-platform

# Create MIG with autoscaling:
# gcloud compute instance-groups managed create spot-mig \\
#   --template spot-template \\
#   --size 3 \\
#   --zone us-central1-a

# Configure autoscaler:
# gcloud compute instance-groups managed set-autoscaling spot-mig \\
#   --zone us-central1-a \\
#   --min-num-replicas 1 \\
#   --max-num-replicas 20 \\
#   --target-cpu-utilization 0.6 \\
#   --cool-down-period 90

# --- Equivalent Terraform configuration ---
resource "google_compute_instance_template" "spot" {
  name_prefix  = "spot-"
  machine_type = "e2-standard-4"

  scheduling {
    preemptible                 = false
    provisioning_model          = "SPOT"
    instance_termination_action = "STOP"
    on_host_maintenance         = "TERMINATE"
    automatic_restart           = false
  }

  disk {
    source_image = "debian-cloud/debian-12"
    disk_size_gb = 50
    disk_type    = "pd-balanced"
    auto_delete  = true
    boot         = true
  }

  network_interface {
    network = "default"
  }

  metadata = {
    shutdown-script = file("shutdown.sh")
  }
}`,
    },
  ],
  diagrams: [
    {
      title: "GCP Compute Service Selection",
      kind: "flow",
      caption: "Decision tree for selecting the right GCP compute service.",
      mermaid: `flowchart TD
    A[Need to run workload] --> B{Full VM control needed?}
    B -- Yes --> C{Dedicated hardware?}
    C -- Yes --> D[Sole-Tenant Nodes]
    C -- No --> E{Fault-tolerant batch?}
    E -- Yes --> F[Spot VMs]
    E -- No --> G[Compute Engine VMs]
    B -- No --> H{Container-based?}
    H -- Yes --> I{Need Kubernetes?}
    I -- Yes --> J{Managed nodes?}
    J -- Yes --> K[GKE Autopilot]
    J -- No --> L[GKE Standard]
    I -- No --> M[Cloud Run]
    H -- No --> N[Cloud Functions 2nd Gen]`,
    },
    {
      title: "Cloud Run Request Lifecycle",
      kind: "sequence",
      caption: "How Cloud Run handles an incoming HTTP request end-to-end.",
      mermaid: `sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant Scaler as Autoscaler
    participant Instance as Cloud Run Instance
    participant App as Container App
    Client->>LB: HTTPS Request
    LB->>Scaler: Route request
    alt No warm instance
        Scaler->>Instance: Provision instance
        Instance->>App: Cold start container
    end
    LB->>Instance: Forward request
    Instance->>App: Handle request
    App-->>Instance: Response
    Instance-->>LB: Response
    LB-->>Client: HTTPS Response`,
    },
    {
      title: "GKE Autopilot vs Standard",
      kind: "architecture",
      caption: "Comparing responsibilities between GKE Autopilot and Standard modes.",
      mermaid: `graph LR
    subgraph Autopilot
        A1[Pod Spec] --> A2[GKE Manages Nodes]
        A2 --> A3[Auto Scaling]
        A2 --> A4[Security Policy]
        A2 --> A5[Billing Per Pod]
    end
    subgraph Standard
        S1[Pod Spec] --> S2[You Manage Node Pools]
        S2 --> S3[Manual Scaling Config]
        S2 --> S4[Custom Security]
        S2 --> S5[Billing Per Node]
    end`,
    },
    {
      title: "GCP Compute Cost Tiers",
      kind: "mindmap",
      caption: "Overview of GCP compute pricing and discount strategies.",
      mermaid: `mindmap
  root((GCP Compute Cost))
    On-Demand
      Standard VMs
      Per-second billing
    Sustained Use
      Auto applied
      Up to 30 percent off
    Committed Use
      1 year 37 percent off
      3 year 55 percent off
    Spot VMs
      60 to 91 percent off
      Preemptible
    Cloud Run
      Per request billing
      100ms granularity`,
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Compute Engine (GCE)",
      "Cloud Run",
      "GKE (Autopilot)",
      "Cloud Functions",
    ],
    rows: [
      [
        "**Abstraction Level**",
        "*IaaS* — full VM control",
        "*Serverless* containers",
        "*Managed* Kubernetes",
        "*FaaS* — function-level",
      ],
      [
        "**Scaling**",
        "MIG autoscaler or manual",
        "Automatic, *0 to N* instances",
        "HPA/VPA + node auto-provisioning",
        "Automatic, *0 to N* instances",
      ],
      [
        "**Min Scale**",
        "`1` instance (always running)",
        "`0` (scale to zero)",
        "`0` pods (nodes scale too)",
        "`0` (scale to zero)",
      ],
      [
        "**Max Timeout**",
        "Unlimited",
        "`60 minutes`",
        "Unlimited",
        "`60 minutes` (2nd gen)",
      ],
      [
        "**Concurrency**",
        "OS-level, unlimited",
        "Up to `1000` per instance",
        "Pod-level, configurable",
        "Up to `1000` (2nd gen)",
      ],
      [
        "**Billing**",
        "Per-second, *vCPU + memory*",
        "Per-request, *100ms granularity*",
        "Per-pod resource request",
        "Per-invocation + compute time",
      ],
      [
        "**GPU Support**",
        "Yes — *A2, G2* families",
        "No",
        "Yes — via `nvidia.com/gpu` resource",
        "No",
      ],
      [
        "**Cold Start**",
        "Minutes (boot VM)",
        "Seconds (*sub-second* with min instances)",
        "Seconds (pod scheduling)",
        "Seconds to minutes",
      ],
      [
        "**Networking**",
        "Full VPC, *custom IPs*",
        "VPC connector, *no static IP* by default",
        "Full VPC, *pod IPs*",
        "VPC connector required",
      ],
      [
        "**Best For**",
        "Legacy apps, HPC, *stateful* workloads",
        "Stateless APIs, *microservices*",
        "Complex *multi-service* architectures",
        "Lightweight *event handlers*",
      ],
    ],
  },
  exercises: [
    "**Lab 1: Deploy a Scalable API on Cloud Run** — Containerize a simple REST API using a *Dockerfile* with a **multi-stage build** (builder + distroless runtime). Push the image to `Artifact Registry` with `gcloud builds submit`. Deploy to Cloud Run with `--min-instances 1`, `--max-instances 10`, `--concurrency 50`, and `--cpu-boost`. Use `hey` or `ab` to generate load and observe autoscaling behavior in the *Cloud Run metrics dashboard*. Compare cold start times with and without `--cpu-boost` enabled.",
    "**Lab 2: Set Up a GKE Autopilot Cluster with Workload Identity** — Create an Autopilot cluster using `gcloud container clusters create-auto`. Deploy a pod that reads from a **Cloud Storage bucket** using *Workload Identity* (no service account key). Configure a `HorizontalPodAutoscaler` targeting `80%` CPU utilization with `minReplicas: 2` and `maxReplicas: 20`. Verify that Autopilot automatically provisions nodes of the correct machine type by checking `kubectl get nodes` and the `autopilot.gke.io/resource-adjustments` annotation on your pods.",
    "**Lab 3: Implement a Cost-Optimized Batch Pipeline with Spot VMs** — Create an *instance template* with `--provisioning-model SPOT` and a **shutdown script** that checkpoints work to Cloud Storage. Build a *Managed Instance Group* with autoscaling based on a Pub/Sub queue backlog metric using `gcloud compute instance-groups managed set-autoscaling`. Submit 1000 tasks to the Pub/Sub topic and monitor how the MIG scales up. Observe preemption events in *Cloud Logging* and verify that checkpointed tasks are retried on replacement instances.",
    "**Lab 4: Canary Deployment with Cloud Run Traffic Splitting** — Deploy *version 1* of a service to Cloud Run. Make a code change and deploy *version 2* as a new revision with `--no-traffic` flag. Use `gcloud run services update-traffic` to send `10%` of traffic to v2. Monitor **error rates** and **latency** in Cloud Monitoring for both revisions. Gradually increase to `50%`, then `100%` if metrics are healthy. Practice *rollback* by shifting `100%` traffic back to v1 with a single command.",
    "**Lab 5: Event-Driven Architecture with Cloud Functions and Eventarc** — Create a *Cloud Storage bucket* and deploy a **2nd gen Cloud Function** triggered by `google.cloud.storage.object.v1.finalized` events via Eventarc. The function should process uploaded CSV files, transform the data, and write results to **BigQuery**. Configure `--retry` for at-least-once delivery. Test with files of varying sizes and observe *concurrent execution* in Cloud Functions metrics. Set up a *dead-letter topic* in Pub/Sub to capture failed events after retry exhaustion.",
  ],
  cheatSheet: [
    "List all VM instances: `gcloud compute instances list --project my-project`",
    "SSH into a VM: `gcloud compute ssh my-instance --zone us-central1-a --tunnel-through-iap`",
    "Deploy to Cloud Run: `gcloud run deploy SERVICE --image IMAGE --region REGION --allow-unauthenticated`",
    "Create GKE Autopilot cluster: `gcloud container clusters create-auto CLUSTER --region REGION`",
    "Get GKE credentials: `gcloud container clusters get-credentials CLUSTER --region REGION`",
    "Set Cloud Run min instances: `gcloud run services update SERVICE --min-instances N --region REGION`",
  ],
  revisionNotes: [
    "**GCE machine type families**: *E2* (cost-optimized), *N2/N2D* (balanced), *C2/C2D* (compute-optimized), *M2/M3* (memory-optimized up to `12 TiB`), *A2/G2* (GPU-accelerated). Custom machine types allow exact `vCPU:memory` ratios. **Sustained Use Discounts** apply automatically at up to `30%` off for full-month usage, but *not* to E2, A2, or Spot VMs.",
    "**Cloud Run key limits**: max `1000` concurrent requests per instance, `60-minute` request timeout, scale to zero by default, `--min-instances` for warm pools, `--cpu-boost` for faster cold starts. *CPU allocation modes*: `always allocated` (background work) vs. `throttled` (cost savings). Billing is per-request at `100ms` granularity.",
    "**GKE Autopilot vs Standard**: Autopilot *manages nodes*, enforces **security policies** (no privileged containers, no SSH, no `hostNetwork`), and bills *per pod resource request*. Standard mode gives full node control but requires you to manage upgrades, scaling, and security. **Workload Identity** is the recommended way to authenticate pods — it eliminates `service account key files`.",
    "**Spot VMs vs Preemptible VMs**: Both offer `60-91%` discounts using spare capacity with `30-second` preemption notice. Key difference: Preemptible VMs *always terminate after 24 hours*; Spot VMs have **no maximum lifetime**. For new workloads, always prefer Spot VMs. Best practices: use MIGs with *autohealing*, implement **checkpointing**, distribute across *multiple zones*.",
    "**Cloud Functions 2nd gen** is built on *Cloud Run + Eventarc*. Improvements over 1st gen: `60-min` timeout (vs `9 min`), `16 GiB` RAM and `4 vCPUs` (vs `8 GiB` and `2 vCPUs`), concurrency up to `1000` (vs `1`), **traffic splitting** between revisions, and broader event sources. Use **Serverless VPC Access** connector to reach private VPC resources.",
  ],
};
