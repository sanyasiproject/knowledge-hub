import type { TopicContent } from "../types";

const cloudComputing: TopicContent = {
  quickSummary: [
    "Cloud computing delivers computing resources (servers, storage, databases, networking, software) over the internet on a pay-as-you-go basis, eliminating the need for owning and maintaining physical data centers.",
    "The three primary service models are Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS), each abstracting progressively more of the underlying infrastructure from the consumer.",
    "Key benefits include elasticity (scale up or down on demand), global availability, reduced capital expenditure, faster time to market, and built-in resilience through geographically distributed data centers.",
    "Major providers — AWS, Azure, and Google Cloud — collectively operate hundreds of data center regions worldwide, offering hundreds of managed services spanning compute, storage, AI/ML, IoT, and analytics."
  ],

  detailed: [
    "Cloud computing represents a fundamental shift from the traditional model of purchasing, racking, and operating physical servers in on-premises data centers. Instead, organizations rent compute capacity, storage, and managed services from cloud providers who maintain massive, geographically distributed infrastructure. This model transforms IT spending from capital expenditure (CapEx) — where hardware is purchased upfront and depreciated — into operational expenditure (OpEx), where resources are consumed like a utility and billed per second, per hour, or per request.",
    "The NIST definition of cloud computing identifies five essential characteristics: on-demand self-service (provision resources without human interaction with the provider), broad network access (accessible over standard protocols), resource pooling (provider resources are pooled across tenants using multi-tenancy), rapid elasticity (capabilities scale outward and inward automatically), and measured service (usage is monitored, controlled, and reported transparently). These characteristics collectively distinguish cloud from traditional hosting or colocation arrangements.",
    "Service models define the boundary of responsibility between provider and consumer. IaaS (e.g., EC2, Azure VMs) provides raw virtual machines, networking, and storage — the consumer manages the OS upward. PaaS (e.g., AWS Elastic Beanstalk, Azure App Service, Google App Engine) abstracts the OS and runtime, letting developers deploy application code directly. SaaS (e.g., Salesforce, Microsoft 365) delivers fully managed applications where the consumer only configures business-level settings. Newer models like Function as a Service (FaaS) and Container as a Service (CaaS) further refine these boundaries.",
    "Deployment models describe how cloud infrastructure is provisioned and who has access. Public clouds are owned and operated by third-party providers and shared across organizations. Private clouds are dedicated to a single organization, either on-premises or hosted. Hybrid clouds combine public and private infrastructure with orchestration between them. Multi-cloud strategies use services from multiple public providers to avoid vendor lock-in and leverage best-of-breed capabilities.",
    "The cloud ecosystem has expanded far beyond basic compute and storage. Modern cloud platforms offer hundreds of managed services including relational and NoSQL databases, message queues, container orchestration (EKS, AKS, GKE), machine learning platforms (SageMaker, Vertex AI), serverless compute (Lambda, Cloud Functions), CDN, DNS, identity management, and observability. This breadth allows organizations to compose complex architectures from managed building blocks rather than building every layer from scratch."
  ],

  deepDive: [
    "Multi-tenancy is the architectural foundation of cloud economics. Cloud providers achieve massive economies of scale by running workloads from thousands of customers on shared physical infrastructure, using hypervisors, containers, and network isolation to ensure security boundaries between tenants. Technologies like hardware-assisted virtualization (Intel VT-x, AMD-V), SR-IOV for network passthrough, and Nitro-style custom silicon allow near-bare-metal performance while maintaining isolation. Understanding the tenancy model is critical for compliance-sensitive workloads that may require dedicated hosts or bare-metal instances.",
    "Cloud-native architecture is a design philosophy that fully exploits cloud capabilities rather than simply lifting and shifting existing applications. The Cloud Native Computing Foundation (CNCF) defines it around four pillars: microservices, containers, service meshes, and declarative APIs. Cloud-native applications are designed for failure (assuming any component can fail at any time), scale horizontally (adding more instances rather than bigger machines), deploy immutably (replacing rather than patching running instances), and observe deeply (structured logging, distributed tracing, and metrics as first-class concerns). The Twelve-Factor App methodology provides a complementary set of principles for building cloud-native software.",
    "The economics of cloud computing involve nuanced trade-offs. While cloud eliminates upfront CapEx and provides elasticity, sustained workloads can become more expensive than on-premises at scale — a phenomenon sometimes called 'cloud repatriation.' Organizations must understand reserved instances, savings plans, spot/preemptible instances, and committed use discounts to optimize costs. FinOps — the practice of financial accountability for cloud spending — has emerged as a discipline combining engineering, finance, and procurement to maximize the business value of cloud. Tools like AWS Cost Explorer, Azure Cost Management, and third-party platforms like CloudHealth help organizations track and optimize their cloud spending.",
    "Edge computing and sovereign cloud represent important extensions of the cloud model. Edge computing pushes computation closer to data sources — IoT devices, retail locations, factory floors — to reduce latency and bandwidth costs. Cloud providers offer edge services like AWS Outposts, Azure Stack Edge, and Google Distributed Cloud. Sovereign clouds address data residency and regulatory requirements by ensuring data never leaves specific geographic or jurisdictional boundaries, a growing concern with regulations like GDPR, data localization laws in India and China, and government cloud requirements like FedRAMP in the United States."
  ],

  code: [
    {
      language: "cpp",
      caption: "Provisioning a cloud VM using the AWS SDK for C++",
      source: `#include <aws/core/Aws.h>
#include <aws/ec2/EC2Client.h>
#include <aws/ec2/model/RunInstancesRequest.h>
#include <aws/ec2/model/CreateTagsRequest.h>
#include <aws/ec2/model/DescribeInstancesRequest.h>
#include <aws/ec2/model/MonitorInstancesRequest.h>
#include <iostream>

int main() {
    Aws::SDKOptions options;
    Aws::InitAPI(options);
    {
        Aws::Client::ClientConfiguration config;
        config.region = "us-east-1";
        Aws::EC2::EC2Client ec2(config);

        // Launch a t3.micro instance with Amazon Linux 2
        Aws::EC2::Model::RunInstancesRequest runRequest;
        runRequest.SetImageId("ami-0c55b159cbfafe1f0");  // Amazon Linux 2 AMI
        runRequest.SetMinCount(1);
        runRequest.SetMaxCount(1);
        runRequest.SetInstanceType(Aws::EC2::Model::InstanceType::t3_micro);
        runRequest.SetKeyName("my-key-pair");

        // Enable detailed monitoring
        Aws::EC2::Model::RunInstancesMonitoringEnabled monitoring;
        monitoring.SetEnabled(true);
        runRequest.SetMonitoring(monitoring);

        auto runOutcome = ec2.RunInstances(runRequest);
        if (!runOutcome.IsSuccess()) {
            std::cerr << "Failed to launch instance: "
                      << runOutcome.GetError().GetMessage() << std::endl;
            return 1;
        }

        auto instanceId = runOutcome.GetResult()
            .GetInstances()[0].GetInstanceId();
        std::cout << "Launched instance " << instanceId
                  << ", waiting for running state..." << std::endl;

        // Tag the instance
        Aws::EC2::Model::Tag nameTag;
        nameTag.SetKey("Name");
        nameTag.SetValue("MyCloudVM");
        Aws::EC2::Model::CreateTagsRequest tagRequest;
        tagRequest.AddResources(instanceId);
        tagRequest.AddTags(nameTag);
        ec2.CreateTags(tagRequest);

        // Wait for running state by polling DescribeInstances
        Aws::EC2::Model::DescribeInstancesRequest describeRequest;
        describeRequest.AddInstanceIds(instanceId);
        bool running = false;
        while (!running) {
            auto describeOutcome = ec2.DescribeInstances(describeRequest);
            if (describeOutcome.IsSuccess()) {
                auto state = describeOutcome.GetResult()
                    .GetReservations()[0].GetInstances()[0]
                    .GetState().GetName();
                if (state == Aws::EC2::Model::InstanceStateName::running) {
                    auto publicIp = describeOutcome.GetResult()
                        .GetReservations()[0].GetInstances()[0]
                        .GetPublicIpAddress();
                    std::cout << "Instance running at " << publicIp << std::endl;
                    running = true;
                }
            }
            if (!running) std::this_thread::sleep_for(std::chrono::seconds(5));
        }
    }
    Aws::ShutdownAPI(options);
    return 0;
}`
    },
    {
      language: "typescript",
      caption: "Infrastructure as Code with Pulumi (TypeScript) — defining a cloud stack",
      source: `import * as aws from "@pulumi/aws";

// Create a VPC
const vpc = new aws.ec2.Vpc("app-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: { Name: "app-vpc" },
});

// Public subnet
const subnet = new aws.ec2.Subnet("app-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "us-east-1a",
    mapPublicIpOnLaunch: true,
});

// Security group allowing HTTP and SSH
const sg = new aws.ec2.SecurityGroup("app-sg", {
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["10.0.0.0/8"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

// EC2 instance
const server = new aws.ec2.Instance("web-server", {
    instanceType: "t3.micro",
    ami: "ami-0c55b159cbfafe1f0",
    subnetId: subnet.id,
    vpcSecurityGroupIds: [sg.id],
    tags: { Name: "web-server" },
});

export const publicIp = server.publicIp;`
    }
  ],

  diagrams: [
    {
      title: "Cloud Service Model Layers",
      kind: "architecture",
      caption: "IaaS, PaaS, and SaaS layers showing which components are managed by the provider versus the customer.",
      mermaid: `graph TD
    subgraph SaaS["SaaS - Provider Manages All"]
        APP["Application"]
        DATA["Data"]
    end
    subgraph PaaS["PaaS - Provider Manages Runtime"]
        RT["Runtime and Middleware"]
        OS2["Operating System"]
    end
    subgraph IaaS["IaaS - Provider Manages Hardware"]
        VM["Virtual Machines"]
        NET["Networking"]
        STOR["Storage"]
        HW["Physical Hardware"]
    end
    APP --> RT --> VM --> HW
    DATA --> STOR`,
    },
    {
      title: "Cloud Deployment Models",
      kind: "network",
      caption: "Public, private, and hybrid cloud deployment topologies and their connectivity patterns.",
      mermaid: `graph LR
    subgraph Public["Public Cloud"]
        PC1["Region A"]
        PC2["Region B"]
    end
    subgraph Private["Private Cloud"]
        ON["On-Premises DC"]
        PRIV["Private Network"]
    end
    subgraph Hybrid["Hybrid Connectivity"]
        VPN["VPN Gateway"]
        DX["Direct Connect"]
    end
    PC1 <--> PC2
    ON --> PRIV
    PRIV --> VPN --> PC1
    PRIV --> DX --> PC2`,
    },
    {
      title: "Cloud Resource Provisioning",
      kind: "flow",
      caption: "Flow for provisioning cloud resources using infrastructure-as-code with approval and validation gates.",
      mermaid: `flowchart TD
    A["Write IaC Template"] --> B["Validate and Lint"]
    B --> C{"Plan Changes"}
    C --> D["Review Diff"]
    D --> E{"Approved?"}
    E -->|No| A
    E -->|Yes| F["Apply to Staging"]
    F --> G{"Tests Pass?"}
    G -->|No| H["Rollback"]
    G -->|Yes| I["Apply to Production"]
    I --> J["Monitor and Alert"]
    H --> A`,
    },
    {
      title: "Cloud Shared Responsibility",
      kind: "mindmap",
      caption: "Breakdown of security and operational responsibilities split between cloud provider and customer.",
      mermaid: `mindmap
  root((Shared Responsibility))
    Provider Responsibility
      Physical security
      Network infrastructure
      Hypervisor
      Global backbone
    Customer Responsibility
      Identity and access
      Data encryption
      Application security
      OS patching on IaaS
    Shared Areas
      Compliance controls
      Logging and monitoring
      Network configuration`,
    },
  ],

  animations: [
    {
      title: "How Auto-Scaling Works in the Cloud",
      steps: [
        { label: "Baseline Load", detail: "Application runs on 2 instances behind a load balancer, handling normal traffic of ~100 requests/second." },
        { label: "Traffic Spike Detected", detail: "CloudWatch/Monitoring detects CPU utilization exceeding 70% threshold for 3 consecutive minutes." },
        { label: "Scale-Out Triggered", detail: "Auto-scaling group launches 3 additional instances from the launch template, registering them with the load balancer." },
        { label: "New Instances Serve Traffic", detail: "Load balancer distributes traffic across all 5 instances, bringing average CPU down to 40%." },
        { label: "Traffic Subsides", detail: "After traffic drops and CPU stays below 30% for 10 minutes, a scale-in policy terminates 2 excess instances." },
        { label: "Cool-Down Period", detail: "A 5-minute cool-down prevents rapid oscillation between scaling events, ensuring stability." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "IaaS", "PaaS", "SaaS", "FaaS/Serverless"],
    rows: [
      ["You Manage", "Apps, data, runtime, OS", "Apps, data", "Data (config only)", "Function code only"],
      ["Provider Manages", "Virtualization, servers, storage, networking", "Runtime, OS, servers, storage", "Everything", "Everything incl. scaling"],
      ["Example", "EC2, Azure VMs, GCE", "Elastic Beanstalk, App Engine", "Gmail, Salesforce", "Lambda, Cloud Functions"],
      ["Scaling", "Manual or auto-scaling groups", "Automatic with platform limits", "Fully managed", "Per-invocation, instant"],
      ["Pricing", "Per hour/second of VM uptime", "Per app instance/hour", "Per user/month subscription", "Per invocation + duration"],
      ["Use Case", "Full control, legacy migration", "Web apps, APIs", "End-user business apps", "Event-driven, glue logic"],
      ["Ops Overhead", "High", "Medium", "Minimal", "Near zero"]
    ]
  },

  interviewQA: [
    {
      q: "What are the key differences between horizontal and vertical scaling in cloud environments?",
      a: "Vertical scaling (scaling up) increases the resources of a single instance — more CPU, RAM, or faster storage. It is simpler but has hard upper limits and typically requires downtime. Horizontal scaling (scaling out) adds more instances of the same size behind a load balancer. It provides theoretically unlimited capacity, better fault tolerance (losing one instance does not bring the system down), and is the preferred approach for cloud-native applications. However, horizontal scaling requires the application to be stateless or use externalized state (databases, caches) so any instance can handle any request.",
      followUps: [
        "How does session affinity (sticky sessions) relate to horizontal scaling?",
        "What database patterns support horizontal scaling (read replicas, sharding)?",
        "When might vertical scaling actually be preferable?"
      ]
    },
    {
      q: "Explain the CAP theorem and its relevance to distributed cloud systems.",
      a: "The CAP theorem states that a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data at the same time), Availability (every request receives a response), and Partition Tolerance (the system continues operating despite network partitions between nodes). Since network partitions are inevitable in cloud environments spanning multiple availability zones or regions, the practical choice is between CP systems (consistent but may reject requests during partitions, like ZooKeeper) and AP systems (always available but may return stale data, like Cassandra with eventual consistency). Most cloud-native systems choose AP with eventual consistency and use techniques like conflict-free replicated data types (CRDTs) or last-write-wins to resolve conflicts.",
      followUps: [
        "How does eventual consistency differ from strong consistency in practice?",
        "What is the PACELC theorem and how does it extend CAP?"
      ]
    },
    {
      q: "How would you design a migration strategy for moving a monolithic on-premises application to the cloud?",
      a: "The 6 R's framework provides structured migration strategies: Rehost (lift-and-shift — move VMs as-is for quick migration), Replatform (lift-and-reshape — make targeted optimizations like switching to managed databases), Refactor (re-architect for cloud-native patterns like microservices and containers), Repurchase (switch to SaaS, e.g., moving from self-hosted email to Microsoft 365), Retire (decommission unused components), and Retain (keep certain workloads on-premises). A phased approach typically starts with rehosting to get to cloud quickly, then incrementally refactors high-value components. Critical success factors include thorough dependency mapping, establishing a landing zone with proper networking and security, setting up CI/CD pipelines, training teams, and implementing a FinOps practice from day one."
    }
  ],

  followUps: [
    "How do availability zones and regions provide fault tolerance in cloud architectures?",
    "What is the difference between reserved instances, savings plans, and spot instances?",
    "How does Infrastructure as Code (Terraform, Pulumi, CloudFormation) relate to cloud computing?",
    "What security considerations are unique to cloud environments compared to on-premises?",
    "How do service meshes like Istio work in cloud-native architectures?",
    "What is the role of observability (metrics, logs, traces) in managing cloud applications?",
    "How do cloud providers implement network isolation between tenants?"
  ],

  mcqs: [
    {
      q: "Which NIST characteristic of cloud computing ensures that resources can be provisioned without requiring human interaction with the service provider?",
      options: [
        "Broad network access",
        "On-demand self-service",
        "Resource pooling",
        "Measured service"
      ],
      answerIndex: 1,
      explanation: "On-demand self-service means consumers can unilaterally provision computing capabilities (server time, storage) as needed automatically without requiring human interaction with each service provider. This is what enables developers to spin up resources via APIs or web consoles instantly."
    },
    {
      q: "In the shared responsibility model, which layer does the customer typically manage when using a PaaS offering?",
      options: [
        "Physical security of data centers",
        "Hypervisor and host operating system",
        "Application code and data",
        "Network infrastructure and virtualization"
      ],
      answerIndex: 2,
      explanation: "With PaaS, the cloud provider manages everything from the physical infrastructure up through the runtime environment. The customer is responsible for their application code, data, and access management. This is the key value proposition of PaaS — reducing operational burden so teams can focus on application logic."
    },
    {
      q: "What is the primary advantage of using multiple availability zones within a single cloud region?",
      options: [
        "Lower latency for global users",
        "Reduced data transfer costs",
        "High availability through fault isolation",
        "Compliance with data residency requirements"
      ],
      answerIndex: 2,
      explanation: "Availability zones are physically separate data centers within a region, each with independent power, cooling, and networking. Deploying across multiple AZs ensures that a failure in one data center (fire, power outage, network issue) does not take down the entire application. This provides high availability within a region without the complexity and latency of multi-region deployments."
    }
  ],

  exercises: [
    "Set up a free-tier account on AWS, Azure, or GCP. Launch a virtual machine, SSH into it, install a web server (nginx), and serve a static page. Then create a custom machine image (AMI/snapshot) from that VM and launch a second instance from it. Document the steps and the cost incurred.",
    "Using Terraform or Pulumi, write an Infrastructure as Code template that provisions a VPC with two subnets (public and private), an internet gateway, a NAT gateway, and an EC2 instance in each subnet. Apply it, verify connectivity, then destroy all resources.",
    "Design a cost comparison spreadsheet for running a web application (4 vCPU, 16 GB RAM, 500 GB storage, 1 TB monthly data transfer) on AWS, Azure, and GCP. Compare on-demand, 1-year reserved, and 3-year reserved pricing. Identify which provider offers the best value for each commitment level.",
    "Implement a simple auto-scaling demo: deploy a containerized application behind a load balancer with auto-scaling configured to add instances when CPU exceeds 60%. Use a load testing tool (e.g., Apache Bench, k6) to generate traffic and observe the scaling behavior in the cloud console."
  ],

  flashcards: [
    { front: "What are the five essential characteristics of cloud computing per NIST?", back: "On-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service." },
    { front: "What is the difference between CapEx and OpEx in cloud context?", back: "CapEx (Capital Expenditure) is upfront hardware purchase and depreciation. OpEx (Operational Expenditure) is pay-as-you-go cloud consumption billed as an ongoing expense. Cloud shifts IT from CapEx to OpEx." },
    { front: "What is an Availability Zone?", back: "A physically separate data center (or cluster of data centers) within a cloud region, with independent power, cooling, and networking. AZs are connected via low-latency links and provide fault isolation." },
    { front: "What does 'elasticity' mean in cloud computing?", back: "The ability to automatically scale resources up or down based on demand, so you only pay for what you use. This includes both scaling out (adding instances) and scaling in (removing instances)." },
    { front: "What is multi-tenancy?", back: "An architecture where a single instance of software or infrastructure serves multiple customers (tenants), with logical isolation between them. It is the foundation of cloud economics, enabling resource sharing and cost efficiency." },
    { front: "Name the three main cloud service models.", back: "IaaS (Infrastructure as a Service) — raw compute/storage; PaaS (Platform as a Service) — managed runtime; SaaS (Software as a Service) — fully managed applications." },
    { front: "What is a cloud region?", back: "A geographic area containing multiple availability zones. Regions are fully independent and isolated from each other. Data does not automatically replicate between regions unless configured to do so." }
  ],

  revisionNotes: [
    "Cloud computing = on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Five NIST characteristics: self-service, broad access, pooling, elasticity, measured service.",
    "Service models: IaaS (you manage OS up), PaaS (you manage app + data), SaaS (you configure), FaaS (you write functions). Each trades control for convenience.",
    "Deployment models: Public (shared, multi-tenant), Private (dedicated to one org), Hybrid (public + private connected), Multi-cloud (multiple public providers).",
    "Regions contain Availability Zones (2-6 per region). Deploy across AZs for HA within a region; across regions for disaster recovery and global reach.",
    "Cloud-native = microservices + containers + declarative APIs + automation. Twelve-Factor App methodology guides cloud-native application design.",
    "Cost optimization levers: right-sizing, reserved instances/savings plans, spot instances, auto-scaling, storage tiering, and FinOps practices.",
    "Security in the cloud follows a shared responsibility model — the provider secures infrastructure ('security OF the cloud'), the customer secures workloads ('security IN the cloud')."
  ],

  cheatSheet: [
    "IaaS examples: EC2, Azure VMs, GCE | PaaS: Elastic Beanstalk, App Service, App Engine | SaaS: M365, Salesforce | FaaS: Lambda, Cloud Functions, Azure Functions",
    "AWS regions format: us-east-1, eu-west-2 | AZ format: us-east-1a, us-east-1b | Azure: East US, West Europe | GCP: us-central1",
    "Elasticity = automatic scaling to match demand | Scalability = ability to handle growth (may be manual)",
    "CapEx → buy servers | OpEx → rent cloud resources | Cloud shifts IT to OpEx model",
    "Well-Architected Frameworks: AWS (6 pillars), Azure (5 pillars), GCP (4 pillars) — all cover security, reliability, cost, performance, operations",
    "Free tiers: AWS (12 months + always-free), Azure (12 months + always-free), GCP ($300 credit + always-free) — use for learning without cost"
  ],

  resources: [
    { label: "NIST Definition of Cloud Computing (SP 800-145)", kind: "docs", note: "The authoritative definition establishing the five characteristics, three service models, and four deployment models." },
    { label: "AWS Well-Architected Framework", kind: "docs", note: "Best practices across six pillars: operational excellence, security, reliability, performance, cost optimization, and sustainability." },
    { label: "The Phoenix Project by Gene Kim, Kevin Behr, George Spafford", kind: "book", note: "A novel about IT transformation that illustrates the cultural and organizational shifts needed for cloud adoption." },
    { label: "Cloud Native Patterns by Cornelia Davis (Manning)", kind: "book", note: "Deep dive into patterns for building cloud-native applications including redundancy, configuration, and lifecycle management." }
  ],

  glossary: [
    { term: "Region", definition: "A geographic area consisting of multiple isolated availability zones. Each region operates independently with its own set of services and data residency guarantees." },
    { term: "Availability Zone (AZ)", definition: "One or more discrete data centers within a region with redundant power, networking, and connectivity. AZs within a region are connected via high-bandwidth, low-latency links." },
    { term: "Multi-tenancy", definition: "Architecture pattern where a single instance of infrastructure or software serves multiple customers (tenants) with logical isolation, enabling cost-effective resource sharing." },
    { term: "Elasticity", definition: "The ability to automatically provision and de-provision resources to match current demand, scaling out during peaks and in during troughs." },
    { term: "FinOps", definition: "A cultural practice and discipline that brings financial accountability to cloud spending, combining engineering, finance, and business teams to optimize cloud costs." },
    { term: "Landing Zone", definition: "A pre-configured, secure, multi-account cloud environment based on best practices that provides a foundation for migrating workloads to the cloud." },
    { term: "Hypervisor", definition: "Software (Type 1: bare-metal like Xen/KVM, Type 2: hosted like VirtualBox) that creates and manages virtual machines by abstracting physical hardware resources." }
  ]
};

export default cloudComputing;
