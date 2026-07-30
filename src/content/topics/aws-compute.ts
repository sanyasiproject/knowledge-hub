import type { TopicContent } from "../types";

export const awsCompute: TopicContent = {
  quickSummary: [
    "AWS EC2 provides resizable virtual machines across 600+ instance types organized into families: general-purpose (M/T), compute-optimized (C), memory-optimized (R/X), storage-optimized (I/D), and accelerated computing (P/G for GPUs). Choosing the right family is the first right-sizing decision.",
    "AWS Lambda is a serverless compute service — upload function code, define triggers (API Gateway, S3, SQS, EventBridge), and pay only per invocation (per-ms billing). Max 15-minute execution, 10 GB memory, and cold starts are the key constraints.",
    "Container orchestration on AWS spans ECS (AWS-native), EKS (managed Kubernetes), and Fargate (serverless containers). ECS is simpler for AWS-only shops; EKS provides Kubernetes portability; Fargate eliminates instance management for both.",
    "Auto Scaling adjusts EC2 capacity based on demand using target tracking (e.g., maintain 60% CPU), step scaling, or scheduled scaling. Combined with Elastic Load Balancing, it provides fault-tolerant, cost-efficient architectures.",
    "AWS Graviton processors (Arm-based, custom-designed by AWS) deliver up to 40% better price-performance than x86 equivalents. Available across EC2, RDS, ElastiCache, and EKS — a straightforward cost optimization for compatible workloads."
  ],

  detailed: [
    "## EC2 Instance Types and Families\n\nEC2 instances are grouped into families optimized for different workload profiles. The naming convention is: `[family][generation][attributes].[size]` (e.g., `m7g.xlarge`).\n\n**General Purpose (M, T):**\n- M-series (m7i, m7g): balanced CPU, memory, networking. The default choice for most workloads — web servers, app servers, small databases\n- T-series (t3, t4g): burstable performance with CPU credits. Cost-effective for variable workloads that don't need sustained high CPU. T3.micro is free tier eligible\n- T instances earn credits when idle and spend them during bursts. Unlimited mode allows sustained bursting at additional cost\n\n**Compute Optimized (C):**\n- C-series (c7i, c7g): highest CPU-to-memory ratio. For batch processing, scientific modeling, gaming servers, video encoding, ML inference\n- Ideal when your bottleneck is CPU, not memory or I/O\n\n**Memory Optimized (R, X, z):**\n- R-series (r7i, r7g): high memory-to-CPU ratio. For in-memory caches (Redis, Memcached), real-time analytics, SAP HANA\n- X-series (x2idn): extreme memory (up to 4 TB). For large in-memory databases\n- z-series: high single-thread performance for legacy applications\n\n**Storage Optimized (I, D, H):**\n- I-series (i4i): high-speed NVMe local storage. For NoSQL databases (Cassandra, MongoDB), data warehousing\n- D-series: dense HDD storage for distributed file systems (HDFS), MapReduce\n\n**Accelerated Computing (P, G, Inf, Trn):**\n- P-series (p5): NVIDIA GPU instances for ML training and HPC\n- G-series (g5): GPU instances for graphics rendering, video transcoding, ML inference\n- Inf-series (inf2): AWS Inferentia chips for ML inference at lowest cost\n- Trn-series (trn1): AWS Trainium chips for ML training",

    "## AWS Lambda\n\nLambda executes code in response to events without provisioning or managing servers. You pay only for compute time consumed.\n\n**Core concepts:**\n- **Function:** Your code packaged as a ZIP or container image (up to 10 GB)\n- **Trigger/Event source:** What invokes the function — API Gateway, S3, SQS, DynamoDB Streams, EventBridge, CloudWatch Events, SNS, Kinesis\n- **Execution environment:** Isolated container with your runtime, code, and dependencies\n- **Concurrency:** Number of simultaneous executions. Default account limit is 1,000 concurrent; can be increased\n\n**Limits and constraints:**\n- Max execution time: 15 minutes\n- Memory: 128 MB to 10,240 MB (CPU scales proportionally with memory)\n- Deployment package: 50 MB zipped, 250 MB unzipped (or 10 GB container image)\n- /tmp storage: 512 MB default, configurable up to 10 GB\n- Payload size: 6 MB synchronous, 256 KB asynchronous\n\n**Cold starts:**\n- First invocation of a new execution environment incurs initialization latency\n- JVM-based runtimes (Java) have the longest cold starts (seconds); Python and Node.js are fastest (100-300ms)\n- Mitigation: Provisioned Concurrency keeps environments pre-warmed; SnapStart (Java) snapshots initialized state\n\n**Pricing:**\n- Per-request: $0.20 per 1M requests\n- Per-duration: based on memory allocated, billed per 1ms\n- Free tier: 1M requests and 400,000 GB-seconds per month\n\n**Best practices:**\n- Keep functions small and focused (single responsibility)\n- Minimize deployment package size for faster cold starts\n- Use environment variables for configuration, Secrets Manager for secrets\n- Reuse connections (database, HTTP) across invocations by initializing outside the handler\n- Set appropriate timeouts — don't use 15 minutes for a 3-second function",

    "## Container Services: ECS, EKS, and Fargate\n\nAWS offers multiple container orchestration options, each with different trade-offs.\n\n**Amazon ECS (Elastic Container Service):**\n- AWS-native container orchestrator — simpler than Kubernetes\n- Task definitions describe containers (image, CPU, memory, ports, environment variables)\n- Services maintain desired count of tasks with load balancing and auto-scaling\n- Launch types: EC2 (you manage instances) or Fargate (serverless)\n- Deep integration with AWS services: ALB, CloudWatch, IAM, Secrets Manager\n- Best for: AWS-only shops wanting simplicity over portability\n\n**Amazon EKS (Elastic Kubernetes Service):**\n- Managed Kubernetes control plane — AWS handles the API server, etcd, and control plane scaling\n- Run standard Kubernetes workloads with full API compatibility\n- Node types: managed node groups (EC2), self-managed nodes, or Fargate\n- Supports Kubernetes ecosystem tools: Helm, Istio, ArgoCD, Prometheus\n- Best for: teams with Kubernetes expertise, multi-cloud portability requirements, complex microservice architectures\n\n**AWS Fargate:**\n- Serverless compute engine for containers — no EC2 instances to manage\n- Works with both ECS and EKS\n- You specify CPU and memory per task/pod; AWS handles infrastructure\n- Per-vCPU and per-GB-memory per-second billing\n- No SSH access to underlying infrastructure\n- Best for: teams wanting container benefits without infrastructure management\n- Trade-offs: higher per-unit cost than EC2, less control, some limitations (no GPU support, daemonsets)\n\n**Decision framework:**\n- Need Kubernetes portability or ecosystem? EKS\n- AWS-only and want simplicity? ECS\n- Don't want to manage instances at all? Add Fargate to either\n- Need GPUs, custom AMIs, or maximum control? ECS or EKS on EC2",

    "## Auto Scaling\n\nAuto Scaling automatically adjusts EC2 capacity to maintain performance and minimize cost.\n\n**Components:**\n- **Launch Template:** Defines instance configuration (AMI, instance type, security groups, user data)\n- **Auto Scaling Group (ASG):** Manages a fleet of instances with min, max, and desired capacity\n- **Scaling Policies:** Rules that trigger scaling actions\n\n**Scaling policy types:**\n- **Target Tracking:** Set a target metric value (e.g., maintain 60% average CPU). ASG adds/removes instances to stay near target. Simplest and most common\n- **Step Scaling:** Define scaling actions for different alarm thresholds (e.g., add 2 instances at 70% CPU, add 4 at 90% CPU)\n- **Scheduled Scaling:** Scale based on known patterns (e.g., scale up at 8 AM, scale down at 8 PM)\n- **Predictive Scaling:** ML-based forecasting that pre-scales based on predicted demand patterns\n\n**Best practices:**\n- Use target tracking as the default — it handles most scenarios well\n- Set appropriate cooldown periods to prevent scaling thrash\n- Use multiple AZs for high availability (ASG distributes instances across AZs)\n- Combine with Elastic Load Balancing for health checks and traffic distribution\n- Use warm pools to pre-initialize instances for faster scaling\n- Mix instance types and purchase options (on-demand + spot) in the ASG\n- Enable instance scale-in protection for stateful workloads\n\n**Health checks:**\n- EC2 health checks: instance status only (running/stopped)\n- ELB health checks: application-level (HTTP 200 response). Preferred for web workloads\n- Custom health checks via the Auto Scaling API",

    "## Graviton Processors\n\nAWS Graviton processors are Arm-based chips designed by AWS, offering superior price-performance for many workloads.\n\n**Generations:**\n- Graviton2 (2020): 40% better price-performance than x86 for most workloads\n- Graviton3 (2022): 25% better performance than Graviton2, 60% less energy\n- Graviton4 (2024): 30% better performance than Graviton3\n\n**Availability:**\n- EC2: M7g, C7g, R7g, T4g, and many more (the 'g' suffix denotes Graviton)\n- RDS: Graviton-based instances for MySQL, PostgreSQL, MariaDB\n- ElastiCache: Graviton-based cache nodes\n- EKS/ECS: Run Arm-based container images on Graviton instances\n- Lambda: Arm64 architecture option\n\n**Migration considerations:**\n- Most interpreted languages (Python, Node.js, Ruby, PHP) work without changes\n- Compiled languages (Go, Rust, C/C++, Java) need recompilation for arm64\n- Container images must be built for arm64 or use multi-arch manifests\n- Some dependencies may not have arm64 builds — check before migrating\n- x86-specific assembly code or intrinsics need porting\n\n**Migration strategy:**\n- Start with non-production environments (dev, staging, CI/CD runners)\n- Test workloads for correctness and measure performance differences\n- Use multi-arch container images to support gradual migration\n- Lambda is the easiest entry point — just change the architecture setting\n- For EC2, switch instance type (e.g., m6i.xlarge to m7g.xlarge) after testing"
  ],

  interviewQA: [
    {
      q: "How do you choose the right EC2 instance type for a workload?",
      a: "Start by identifying the workload's bottleneck: CPU-bound workloads use C-family, memory-bound use R-family, balanced workloads use M-family, I/O-heavy use I-family. Then right-size: launch a reasonable instance, monitor CPU, memory, network, and disk utilization for at least a week, and adjust. Use AWS Compute Optimizer for data-driven recommendations. Consider burstable T instances for variable workloads to save cost. Finally, evaluate Graviton (Arm) variants for 20-40% cost savings. The instance type is not a permanent decision — monitor and adjust regularly.",
      followUps: ["When would you use a T instance vs. an M instance?", "How do you benchmark instances for a specific workload?"]
    },
    {
      q: "Compare ECS and EKS. When would you choose each?",
      a: "ECS is AWS-native, simpler to set up and operate, with deep AWS service integration. Choose ECS when your team doesn't have Kubernetes experience, you're AWS-only, and you want operational simplicity. EKS is managed Kubernetes — choose it when you need Kubernetes portability across clouds, want to use the Kubernetes ecosystem (Helm, Istio, ArgoCD), or your team already knows Kubernetes. Both can use Fargate for serverless containers or EC2 for more control. The key differentiator is portability vs. simplicity: EKS gives you a standard Kubernetes API that works similarly on any provider; ECS locks you into AWS but is easier to run.",
      followUps: ["When would you use Fargate vs. EC2 launch type?", "How does Fargate pricing compare to EC2?"]
    },
    {
      q: "How do you handle Lambda cold starts in a latency-sensitive application?",
      a: "Several strategies: (1) Use Provisioned Concurrency to keep a set number of execution environments pre-warmed — eliminates cold starts but costs more. (2) Choose lightweight runtimes — Python and Node.js have much shorter cold starts than Java. (3) Minimize deployment package size by excluding unnecessary dependencies. (4) For Java, use SnapStart which snapshots the initialized JVM state. (5) Keep functions warm with scheduled pings (though Provisioned Concurrency is cleaner). (6) Optimize initialization code — move expensive operations inside the handler if they're not needed for every invocation. (7) Consider whether Lambda is the right choice — if every request is latency-critical and traffic is sustained, a container service might be more appropriate.",
      followUps: ["What is SnapStart and how does it work?", "How is Provisioned Concurrency priced?"]
    },
    {
      q: "Design an auto-scaling strategy for a web application with predictable daily patterns and occasional traffic spikes.",
      a: "I would use a layered approach: (1) Scheduled scaling to handle the predictable daily pattern — scale up before the morning traffic increase, scale down after evening traffic drops. (2) Target tracking policy with a 60% CPU target to handle normal variation and unexpected spikes within the day. (3) Predictive scaling to learn traffic patterns over time and pre-scale before predicted demand. (4) Mix instance types: on-demand for the baseline minimum, spot instances for additional capacity (with fallback to on-demand). (5) Use an ALB with health checks so the ASG replaces unhealthy instances. (6) Set appropriate cooldown periods (300 seconds) to prevent thrashing. (7) Monitor and tune — review scaling activity weekly and adjust targets."
    }
  ],

  mcqs: [
    {
      q: "Which EC2 instance family is best for a CPU-intensive batch processing workload?",
      options: ["T3 (general purpose burstable)", "R6i (memory optimized)", "C7i (compute optimized)", "I4i (storage optimized)"],
      answerIndex: 2,
      explanation: "C-family instances are compute-optimized with the highest CPU-to-memory ratio, ideal for CPU-bound workloads like batch processing, scientific computing, and video encoding."
    },
    {
      q: "What is the maximum execution time for an AWS Lambda function?",
      options: ["5 minutes", "10 minutes", "15 minutes", "30 minutes"],
      answerIndex: 2,
      explanation: "AWS Lambda functions can run for a maximum of 15 minutes (900 seconds). Workloads requiring longer execution should use ECS, Step Functions, or EC2."
    },
    {
      q: "Which container service provides the most portability across cloud providers?",
      options: ["ECS", "EKS", "Fargate", "App Runner"],
      answerIndex: 1,
      explanation: "EKS runs standard Kubernetes, which is available on all major cloud providers (AKS on Azure, GKE on GCP). ECS is AWS-proprietary. Fargate is a compute engine, not an orchestrator."
    },
    {
      q: "What does the 'g' suffix indicate in an EC2 instance type like m7g.xlarge?",
      options: ["GPU-enabled", "Graviton (Arm) processor", "Enhanced networking", "Previous generation"],
      answerIndex: 1,
      explanation: "The 'g' suffix denotes AWS Graviton (Arm-based) processors, offering up to 40% better price-performance than equivalent x86 instances."
    },
    {
      q: "Which Auto Scaling policy type uses ML to forecast demand and pre-scale?",
      options: ["Target tracking", "Step scaling", "Scheduled scaling", "Predictive scaling"],
      answerIndex: 3,
      explanation: "Predictive scaling uses machine learning to analyze historical traffic patterns and proactively scale capacity before anticipated demand increases."
    }
  ],

  flashcards: [
    { front: "EC2 Instance Naming", back: "Format: [family][generation][attributes].[size]. Example: m7g.xlarge = general-purpose, 7th gen, Graviton, extra-large. Common attributes: g=Graviton, i=Intel, a=AMD, n=networking, d=local NVMe." },
    { front: "T-series burstable instances", back: "Earn CPU credits when idle, spend them during bursts. Cost-effective for variable workloads averaging below baseline CPU. Unlimited mode allows sustained bursting at additional cost." },
    { front: "Lambda cold start", back: "Initialization delay (100ms to 10s) when a new execution environment is created. Mitigate with Provisioned Concurrency, lightweight runtimes, small packages, or SnapStart (Java)." },
    { front: "ECS vs. EKS", back: "ECS: AWS-native, simpler, deep AWS integration. EKS: managed Kubernetes, portable, rich ecosystem. Both support EC2 and Fargate launch types." },
    { front: "Fargate", back: "Serverless container compute for ECS and EKS. No instance management, per-vCPU/memory billing. Trade-off: higher unit cost, less control, no GPUs." },
    { front: "Auto Scaling Group", back: "Manages a fleet of EC2 instances with min/max/desired capacity. Uses launch templates, scaling policies, and health checks. Distributes across AZs for HA." },
    { front: "Target Tracking Scaling", back: "Simplest ASG policy: set a target metric value (e.g., 60% CPU) and ASG automatically adjusts capacity to maintain it." },
    { front: "Graviton", back: "AWS-designed Arm processors offering up to 40% better price-performance. Available across EC2, RDS, ElastiCache, Lambda. Requires arm64-compatible code/containers." }
  ],

  glossary: [
    { term: "EC2", definition: "Elastic Compute Cloud — AWS service providing resizable virtual machines (instances) in the cloud with various instance types optimized for different workloads." },
    { term: "Lambda", definition: "AWS serverless compute service that runs code in response to events, automatically scaling and billing per millisecond of execution time." },
    { term: "ECS", definition: "Elastic Container Service — AWS-native container orchestration service for running Docker containers using task definitions and services." },
    { term: "EKS", definition: "Elastic Kubernetes Service — managed Kubernetes control plane on AWS, supporting standard Kubernetes APIs and ecosystem tools." },
    { term: "Fargate", definition: "Serverless compute engine for containers that works with ECS and EKS, eliminating the need to manage underlying EC2 instances." },
    { term: "Auto Scaling Group", definition: "AWS feature that automatically adjusts the number of EC2 instances based on demand, health checks, and scaling policies." },
    { term: "Graviton", definition: "AWS-designed Arm-based processors offering superior price-performance compared to x86 instances, available across multiple AWS services." },
    { term: "Provisioned Concurrency", definition: "Lambda feature that keeps a specified number of execution environments initialized and ready, eliminating cold start latency." }
  ]
};
