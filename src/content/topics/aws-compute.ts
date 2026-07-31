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

  deepDive: [
    "## EC2 Placement Groups and Advanced Networking\n\n**Cluster placement groups** pack instances physically close within a single AZ for lowest latency (< 25 microseconds). Use for HPC workloads with tightly-coupled node communication. **Spread placement groups** distribute instances across distinct hardware racks (max 7 per AZ) for independent failure domains — ideal for critical replicas. **Partition placement groups** split instances across logical partitions (each on separate racks) for large distributed systems like HDFS or Cassandra where you control partition-aware placement. Enhanced Networking via **Elastic Network Adapter (ENA)** provides up to 100 Gbps bandwidth with SR-IOV, eliminating hypervisor overhead. **Elastic Fabric Adapter (EFA)** extends this with OS-bypass for MPI and NCCL workloads, critical for distributed ML training.",
    "## Lambda Execution Model Internals\n\nWhen a Lambda function is invoked, the **Lambda Worker Manager** assigns it to a **micro-VM** (Firecracker) running a minimal Linux kernel. The execution environment includes a `/tmp` directory (up to 10 GB), the runtime (Node.js, Python, etc.), and your function code loaded from an internal S3 bucket. **Cold starts** occur when no warm environment exists: the service must allocate a micro-VM, download code, initialize the runtime, and run your init code. Cold start latency ranges from 100ms (Python, small package) to 10+ seconds (Java with large dependencies in a VPC). **Provisioned Concurrency** pre-initializes environments to eliminate cold starts. The **Lambda Extensions API** allows observability agents (Datadog, New Relic) to run as companion processes within the same execution environment. **SnapStart** (Java only) snapshots the initialized environment after init and restores from snapshot on invocation, reducing cold starts from ~6s to ~200ms.",
    "## Container Orchestration Decision Framework\n\n**ECS on Fargate** is the simplest path for teams without Kubernetes expertise — you define task definitions (CPU, memory, container image, port mappings) and ECS handles scheduling. The **capacity provider** strategy can mix Fargate and Fargate Spot for cost optimization. **ECS on EC2** gives full node control: you manage the AMI, install custom agents, use GPU instances, and access instance metadata. **EKS** is the choice when you need Kubernetes-native tooling (Helm, ArgoCD, Istio, custom operators) or multi-cloud portability. EKS manages the control plane (etcd, API server) across 3 AZs, while you manage worker nodes (managed node groups, self-managed, or Fargate profiles). Key EKS add-ons: **AWS Load Balancer Controller** for ALB/NLB ingress, **EBS CSI Driver** for persistent volumes, **Karpenter** for intelligent node provisioning that replaces Cluster Autoscaler with faster, more efficient scaling."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: EC2 Auto Scaling Group with mixed instances",
      source: `resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "m6i.large"

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.app.id]
  }

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "app-server", Environment = "prod" }
  }
}

resource "aws_autoscaling_group" "app" {
  desired_capacity    = 3
  max_size            = 10
  min_size            = 2
  vpc_zone_identifier = module.vpc.private_subnets

  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 2
      on_demand_percentage_above_base_capacity = 25
      spot_allocation_strategy                 = "capacity-optimized"
    }
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.app.id
        version            = "$Latest"
      }
      override {
        instance_type = "m6i.large"
      }
      override {
        instance_type = "m6a.large"
      }
      override {
        instance_type = "m5.large"
      }
    }
  }

  target_group_arns = [aws_lb_target_group.app.arn]

  tag {
    key                 = "Environment"
    value               = "prod"
    propagate_at_launch = true
  }
}`
    },
    {
      language: "yaml",
      caption: "CloudFormation: Lambda function with event source mapping",
      source: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  ProcessOrderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.12
      Handler: app.handler
      MemorySize: 512
      Timeout: 30
      Architectures: [arm64]
      Environment:
        Variables:
          TABLE_NAME: !Ref OrdersTable
          QUEUE_URL: !GetAtt DeadLetterQueue.QueueUrl
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable
      Events:
        SQSTrigger:
          Type: SQS
          Properties:
            Queue: !GetAtt OrderQueue.Arn
            BatchSize: 10
            MaximumBatchingWindowInSeconds: 5
            FunctionResponseTypes:
              - ReportBatchItemFailures

  OrderQueue:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 180
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
        maxReceiveCount: 3

  DeadLetterQueue:
    Type: AWS::SQS::Queue`
    },
    {
      language: "bash",
      caption: "AWS CLI: ECS Fargate service deployment",
      source: `# Register a task definition
aws ecs register-task-definition \\
  --family my-api \\
  --requires-compatibilities FARGATE \\
  --network-mode awsvpc \\
  --cpu 512 --memory 1024 \\
  --execution-role-arn arn:aws:iam::123456789012:role/ecsTaskExecutionRole \\
  --container-definitions '[{
    "name": "api",
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-api:latest",
    "portMappings": [{"containerPort": 8080, "protocol": "tcp"}],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/my-api",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]'

# Create or update the service
aws ecs create-service \\
  --cluster prod \\
  --service-name my-api \\
  --task-definition my-api \\
  --desired-count 3 \\
  --launch-type FARGATE \\
  --network-configuration '{
    "awsvpcConfiguration": {
      "subnets": ["subnet-abc123", "subnet-def456"],
      "securityGroups": ["sg-abc123"],
      "assignPublicIp": "DISABLED"
    }
  }' \\
  --load-balancers '[{
    "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-api/abc123",
    "containerName": "api",
    "containerPort": 8080
  }]'`
    }
  ],

  comparison: {
    columns: ["Feature", "EC2", "Lambda", "ECS/Fargate", "EKS"],
    rows: [
      ["Billing model", "Per-second (min 60s)", "Per-ms invocation", "Per-second (vCPU + memory)", "Control plane $0.10/hr + worker nodes"],
      ["Max execution time", "Unlimited", "15 minutes", "Unlimited", "Unlimited"],
      ["Scaling speed", "Minutes (AMI launch)", "Seconds (concurrent)", "Seconds (Fargate task)", "Minutes (node provision)"],
      ["Max memory", "24 TB (u-24tb1)", "10 GB", "120 GB (Fargate)", "Node instance limit"],
      ["Persistent storage", "EBS, instance store", "/tmp (10 GB, ephemeral)", "EBS, EFS via mount", "EBS CSI, EFS CSI"],
      ["VPC integration", "Full (ENI per instance)", "Optional (adds cold start)", "awsvpc mode (ENI per task)", "Full (pod networking)"],
      ["GPU support", "P/G instances", "No", "EC2 launch type only", "GPU node groups"],
      ["Best for", "Stateful, long-running, GPU", "Event-driven, glue logic", "Containerized microservices", "K8s-native, multi-cloud portability"]
    ]
  },

  exercises: [
    "Your e-commerce platform handles 500 req/s normally but spikes to 5,000 req/s during flash sales (2-3 times per month, lasting 2 hours). Design a compute architecture using EC2 Auto Scaling with mixed instances policy. Specify: which instance types to mix, the on-demand base capacity, the spot allocation strategy, the scaling policy type and target metric, and how you would pre-warm before known sale events.",
    "A data pipeline processes 10,000 files daily (each 50-200 MB) uploaded to S3. Each file requires 2-4 minutes of processing and writes results to DynamoDB. Design a Lambda-based solution addressing: concurrency limits, error handling with DLQ, memory/timeout configuration, and cost comparison vs. a Fargate-based alternative. Calculate the approximate monthly Lambda cost.",
    "You are migrating a monolithic application (Java, 16 GB heap, persistent WebSocket connections, 200ms p99 latency requirement) to containers on AWS. Evaluate ECS on EC2 vs. ECS on Fargate vs. EKS. Consider: memory requirements, long-lived connections, deployment strategy (blue/green vs. rolling), service mesh needs, and team Kubernetes experience. Justify your choice.",
    "An ML inference API needs GPU-accelerated compute for real-time predictions (p99 < 100ms). Traffic is unpredictable: 0-1000 req/s. Design a solution considering: EC2 G5 instances with auto scaling vs. SageMaker endpoints vs. EKS with GPU node pools. Address cold start concerns, cost optimization for idle periods, and model artifact deployment.",
    "Your company runs 50 Lambda functions across 3 environments (dev, staging, prod). Cold starts on 5 Java functions cause p99 latency spikes to 8 seconds in production. Design a strategy combining: SnapStart for Java functions, Provisioned Concurrency scheduling for peak hours, architecture changes (function splitting, language migration candidates), and monitoring with CloudWatch Lambda Insights."
  ],

  cheatSheet: [
    "**Instance naming**: `m7g.2xlarge` = family(m) generation(7) attribute(g=Graviton) . size(2xlarge) — decode any instance type in seconds",
    "**Spot interruption**: always handle via 2-minute warning (instance metadata `spot/instance-action`) or EventBridge. Use `capacity-optimized` allocation for lowest interruption rates",
    "**Lambda limits**: 15 min timeout, 10 GB memory, 10 GB /tmp, 1000 default concurrent executions (soft limit), 6 MB sync response, 256 KB async payload",
    "**Fargate sizing**: CPU values 0.25-16 vCPU, memory depends on CPU (e.g., 0.25 vCPU allows 0.5-2 GB). Invalid combos are rejected — check the matrix",
    "**EKS control plane**: $0.10/hr (~$73/mo) per cluster — always factor this fixed cost. Use Karpenter over Cluster Autoscaler for faster, more efficient node scaling",
    "**Auto Scaling cooldown**: default 300s. Set target tracking to 60% CPU (not 80%) to absorb spikes before new instances are ready. Warm pools pre-initialize stopped instances",
    "**Graviton migration**: test with `arm64` architecture flag. Most workloads (Node, Python, Go, .NET 6+) work without code changes. 20-40% cost savings",
    "**Lambda cold start fixes**: SnapStart (Java), Provisioned Concurrency, smaller deployment packages, avoid VPC unless required, use arm64 for faster init"
  ],

  revisionNotes: [
    "EC2 purchasing: On-Demand (baseline) > Reserved/Savings Plans (steady-state, up to 72% off) > Spot (fault-tolerant, up to 90% off). Savings Plans are more flexible than RIs — commit to $/hr, not instance type",
    "Lambda is priced per 1ms of execution x memory allocated. arm64 (Graviton) Lambda is 20% cheaper. Free tier: 1M requests + 400,000 GB-seconds per month",
    "ECS Task Definition = blueprint (like a pod spec): defines containers, CPU, memory, networking, volumes, IAM role. Service = running desired count of tasks with load balancing and auto scaling",
    "EKS manages the Kubernetes control plane across 3 AZs. You manage worker nodes via: Managed Node Groups (easiest), Self-Managed (full control), or Fargate Profiles (serverless pods)",
    "Fargate eliminates instance management but costs ~30-50% more than well-optimized EC2. Best when operational simplicity outweighs cost, or for spiky/unpredictable workloads",
    "Auto Scaling types: Target Tracking (maintain metric, e.g., 60% CPU), Step Scaling (tiered thresholds), Scheduled (known patterns), Predictive (ML-based forecasting)",
    "Lambda concurrency: unreserved (shared pool), reserved (guarantees capacity but limits), provisioned (pre-initialized, eliminates cold starts, costs more). Account default limit: 1,000 concurrent",
    "Container image choice matters: use multi-stage builds, distroless/Alpine base images, and ECR image scanning. Fargate pulls from ECR fastest (same-region, PrivateLink)"
  ],

  resources: [
    { label: "AWS Well-Architected — Performance Efficiency Pillar", kind: "docs", note: "Official guidance on selecting and optimizing compute resources across EC2, Lambda, and containers" },
    { label: "Amazon Builders' Library: Avoiding insurmountable queue backlogs", kind: "article", note: "Deep dive into Lambda concurrency, queue processing patterns, and backpressure handling" },
    { label: "AWS re:Invent — Advanced EC2 Networking (NET403)", kind: "video", note: "Covers placement groups, ENA, EFA, and network bandwidth allocation across instance families" },
    { label: "Firecracker: Lightweight Virtualization for Serverless (NSDI '20)", kind: "paper", note: "The academic paper behind Lambda's micro-VM technology — explains Firecracker's design and security model" },
    { label: "aws/karpenter GitHub repository", kind: "repo", note: "Kubernetes node provisioner replacing Cluster Autoscaler — essential for EKS cost optimization" }
  ],

  diagrams: [
    {
      title: "AWS Compute Decision Tree",
      kind: "flow" as const,
      caption: "Decision flow for choosing between EC2, Lambda, ECS, EKS, and Fargate based on workload characteristics"
    },
    {
      title: "Lambda Execution Lifecycle",
      kind: "sequence" as const,
      caption: "Sequence diagram showing cold start vs warm invocation: API Gateway to Lambda Worker Manager to Firecracker micro-VM"
    }
  ],

  animations: [
    {
      title: "EC2 Auto Scaling in Action",
      steps: [
        { label: "Baseline load", detail: "ASG running 3 instances at 40% CPU behind an ALB. Target tracking policy set to maintain 60% average CPU utilization." },
        { label: "Traffic spike detected", detail: "CloudWatch alarm fires: average CPU exceeds 60% for 3 consecutive minutes. ASG calculates needed capacity: ceil(current_load / target) = 5 instances." },
        { label: "Scale-out initiated", detail: "ASG launches 2 new instances from launch template. Mixed instances policy selects: 1 on-demand m6i.large, 1 spot m6a.large (capacity-optimized)." },
        { label: "Health check and registration", detail: "New instances pass EC2 health checks, then ALB health checks (HTTP 200 on /health). ALB begins routing traffic to new targets after the healthy threshold (3 checks)." },
        { label: "Load stabilizes", detail: "With 5 instances, average CPU drops to 55%. Scaling policy holds steady as metric is within target range. Cooldown period (300s) prevents thrashing." },
        { label: "Traffic subsides", detail: "Load decreases, CPU drops to 30%. Scale-in policy waits for cooldown, then terminates 2 instances (spot first, then oldest on-demand). ASG returns to 3 instances." }
      ]
    }
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
