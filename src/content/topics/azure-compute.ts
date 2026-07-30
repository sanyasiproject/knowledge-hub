import type { TopicContent } from "../types";

export const azureCompute: TopicContent = {
  quickSummary: [
    "Azure Virtual Machines (VMs) provide on-demand, scalable IaaS compute with a wide range of VM sizes optimized for general purpose, compute-intensive, memory-intensive, storage-intensive, and GPU workloads, running Windows or Linux with full OS-level control.",
    "Azure Functions is the serverless compute offering that executes event-driven code without managing infrastructure, supporting consumption (pay-per-execution), premium (pre-warmed instances), and dedicated (App Service Plan) hosting plans with bindings for seamless integration with other Azure services.",
    "Azure App Service is a fully managed PaaS for hosting web apps, REST APIs, and mobile backends, supporting .NET, Java, Node.js, Python, and PHP with built-in CI/CD, autoscaling, custom domains, TLS certificates, and deployment slots for zero-downtime releases.",
    "Azure Kubernetes Service (AKS) is a managed Kubernetes offering that handles control plane provisioning, upgrades, patching, and monitoring while you manage the worker nodes, with deep integration into Azure networking (CNI), identity (Entra ID), and monitoring (Azure Monitor).",
    "Virtual Machine Scale Sets (VMSS) enable you to deploy and manage a group of identical, auto-scaling VMs behind a load balancer, supporting both uniform (identical instances) and flexible (mixed VM sizes) orchestration modes.",
  ],
  detailed: [
    "## Azure Virtual Machines\n\nAzure VMs are IaaS compute resources that give you full control over the operating system, middleware, and runtime. VM sizes are organized into families: B-series (burstable, cost-effective for variable workloads), D-series (general purpose, balanced CPU-to-memory), E-series (memory-optimized for in-memory databases), F-series (compute-optimized for CPU-intensive tasks), N-series (GPU-enabled for ML training and rendering), and L-series (storage-optimized with high disk throughput). Each VM has an OS disk (managed disk by default), optional data disks, and a temporary disk (ephemeral, lost on deallocation). Availability Sets distribute VMs across fault domains (separate racks) and update domains (rolling update groups) within a datacenter. Availability Zones distribute VMs across physically separate datacenters within a region for higher resilience.",
    "## Azure Functions\n\nAzure Functions is a serverless compute platform that abstracts infrastructure management entirely. Functions are triggered by events: HTTP requests, timer schedules (CRON), queue messages, blob changes, Event Grid events, Cosmos DB change feed, and more. The Consumption plan scales automatically from zero and bills only for execution time (GB-seconds) and invocations. The Premium plan provides pre-warmed instances to eliminate cold starts, VNET integration, and unlimited execution duration. The Durable Functions extension enables stateful workflows by defining orchestrator functions that manage state, checkpointing, and fan-out/fan-in patterns. Input and output bindings declaratively connect functions to data sources (Cosmos DB, Storage, Service Bus) without boilerplate SDK code.",
    "## Azure App Service\n\nApp Service runs web applications on fully managed VMs that you never directly access. An App Service Plan defines the compute tier (Free, Shared, Basic, Standard, Premium, Isolated) and the number and size of VM instances. Deployment slots let you deploy a new version to a staging slot, warm it up, and then swap it into production with zero downtime — the swap redirects traffic at the load balancer level. Built-in features include custom domain mapping, managed TLS certificates (free with App Service Managed Certificates), authentication/authorization (Easy Auth supporting Entra ID, Google, Facebook, etc.), WebSocket support, and integration with Azure DevOps or GitHub Actions for CI/CD. The Isolated tier (App Service Environment, ASE) deploys into your own VNET for network-level isolation.",
    "## Azure Kubernetes Service\n\nAKS provides a managed Kubernetes control plane at no charge — you pay only for the worker node VMs. AKS manages etcd, the API server, scheduler, and controller manager, and handles Kubernetes version upgrades. Node pools group worker VMs of the same size and configuration; you can have system node pools (for Kubernetes system pods) and user node pools (for application workloads), and you can mix VM sizes across pools. Azure CNI assigns pod IPs from the VNET subnet, enabling direct pod-to-VNET communication without NAT. AKS integrates with Entra ID for cluster RBAC, Azure Policy for governance (via Gatekeeper/OPA), Azure Monitor (Container Insights) for logging and metrics, and Azure Key Vault (via the Secrets Store CSI driver) for secret management.",
    "## Virtual Machine Scale Sets\n\nVMSS allows you to create and manage a set of identical VMs that automatically scale based on demand or a defined schedule. Uniform orchestration mode ensures all instances use the same VM model, OS image, and extensions — ideal for stateless workloads behind a load balancer. Flexible orchestration mode allows mixing VM sizes and manually adding existing VMs to the scale set — suited for workloads needing heterogeneous configurations. VMSS supports automatic OS image upgrades (rolling upgrades with health probes), custom script extensions for bootstrapping, and integration with Azure Load Balancer or Application Gateway. Spot VMs in VMSS let you use spare Azure capacity at up to 90% discount, with the trade-off that Azure can evict them with 30 seconds notice when capacity is needed.",
    "## Cost Optimization Strategies\n\nAzure Reserved Instances (RIs) offer 1-year or 3-year commitments for up to 72% savings on VM compute costs compared to pay-as-you-go. Azure Savings Plans provide flexible pricing across VM families and regions with similar discounts. Azure Spot VMs offer the deepest discounts for fault-tolerant workloads. Azure Hybrid Benefit lets you apply existing Windows Server or SQL Server licenses to Azure VMs, reducing costs by up to 40%. The Azure Advisor continuously analyzes your usage and recommends right-sizing underutilized VMs, shutting down idle resources, and purchasing reservations. Auto-shutdown schedules for dev/test VMs prevent unnecessary charges during off-hours.",
  ],
  interviewQA: [
    {
      q: "How do Availability Sets and Availability Zones differ in Azure, and when would you choose one over the other?",
      a: "Availability Sets distribute VMs across fault domains (separate physical racks sharing power and networking) and update domains (groups that undergo planned maintenance sequentially) within a single datacenter, providing 99.95% SLA. Availability Zones distribute VMs across physically separate datacenters (each with independent power, cooling, and networking) within the same region, providing 99.99% SLA. Choose Availability Sets for protection against hardware failures within a datacenter at lower cost and latency. Choose Availability Zones when your application needs resilience against full datacenter outages and can tolerate the slightly higher inter-zone latency (typically under 2ms round-trip within a region).",
      followUps: [
        "What happens to VMs during a planned maintenance event with update domains?",
        "Can you combine Availability Zones with Virtual Machine Scale Sets?",
      ],
    },
    {
      q: "What are cold starts in Azure Functions and how do you mitigate them?",
      a: "A cold start occurs when a function app has no running instances and a new request arrives — Azure must allocate a host, start the language runtime, and load your code before execution begins. This can add several seconds of latency, especially for Java and .NET functions. Mitigation strategies include: using the Premium plan which maintains pre-warmed instances, using the Dedicated (App Service) plan which keeps the app always running, minimizing dependencies and package size to reduce load time, keeping functions warm with scheduled timer triggers (warm-up ping), and using .NET isolated worker model with ReadyToRun compilation for faster startup.",
      followUps: [
        "How does the Premium plan's pre-warming work under the hood?",
        "What is the maximum execution timeout on each hosting plan?",
      ],
    },
    {
      q: "Explain how AKS networking works with Azure CNI versus kubenet.",
      a: "With Azure CNI, every pod receives an IP address directly from the Azure VNET subnet. This means pods are first-class VNET citizens — they can communicate with other VNET resources, on-premises networks via VPN/ExpressRoute, and Azure services without NAT. The trade-off is IP address consumption: you need a large enough subnet to accommodate all pods and nodes. With kubenet, only nodes get VNET IPs; pods get IPs from a separate overlay network and reach external resources through NAT on the node. Kubenet uses fewer VNET IPs but adds NAT overhead and prevents direct pod-to-VNET routing. Azure CNI Overlay is a newer option that gives pods overlay IPs while still routing through the VNET, balancing IP efficiency with connectivity.",
      followUps: [
        "How do Network Policies work in AKS?",
        "What is Azure CNI Powered by Cilium?",
      ],
    },
    {
      q: "How do deployment slots in Azure App Service enable zero-downtime deployments?",
      a: "Deployment slots are live instances of your app with their own hostnames. You deploy the new version to a staging slot, run smoke tests against it, then perform a swap operation. The swap works by changing the routing rules at the load balancer level — the staging slot's content becomes the production slot and vice versa. Because both slots are already warmed up and running, there is no cold-start delay during the swap. Slot-specific settings (like connection strings marked as 'slot setting') stay with the slot and do not swap, allowing different configurations per environment. If the new version has issues, you can swap back instantly to restore the previous version.",
    },
  ],
  mcqs: [
    {
      q: "Which Azure VM series is optimized for memory-intensive workloads such as in-memory databases?",
      options: ["B-series", "F-series", "E-series", "N-series"],
      answerIndex: 2,
      explanation:
        "E-series VMs are memory-optimized with high memory-to-CPU ratios, making them ideal for in-memory databases, caching, and analytics. B-series is burstable, F-series is compute-optimized, and N-series is GPU-enabled.",
    },
    {
      q: "In the Azure Functions Consumption plan, what is the billing model?",
      options: [
        "Fixed monthly fee per function app",
        "Per-second billing for provisioned instances",
        "Pay per execution count and execution time (GB-seconds)",
        "Pay per deployment slot",
      ],
      answerIndex: 2,
      explanation:
        "The Consumption plan bills based on the number of executions and the resource consumption measured in GB-seconds (memory allocation multiplied by execution time). The first 1 million executions and 400,000 GB-seconds per month are free.",
    },
    {
      q: "What is the primary purpose of update domains in an Azure Availability Set?",
      options: [
        "To distribute VMs across different Azure regions",
        "To ensure VMs are restarted sequentially during planned maintenance",
        "To assign different OS images to each VM",
        "To balance network traffic across VMs",
      ],
      answerIndex: 1,
      explanation:
        "Update domains group VMs so that during planned maintenance, Azure updates only one update domain at a time, ensuring that the other update domains remain running and available.",
    },
    {
      q: "Which AKS networking plugin assigns pod IPs directly from the Azure VNET subnet?",
      options: [
        "kubenet",
        "Calico",
        "Azure CNI",
        "Flannel",
      ],
      answerIndex: 2,
      explanation:
        "Azure CNI (Container Networking Interface) assigns each pod an IP from the VNET subnet, making pods first-class network citizens. Kubenet uses an overlay with NAT. Calico and Flannel are third-party CNI plugins with different networking models.",
    },
    {
      q: "What discount can Azure Spot VMs offer compared to pay-as-you-go pricing?",
      options: [
        "Up to 30%",
        "Up to 50%",
        "Up to 72%",
        "Up to 90%",
      ],
      answerIndex: 3,
      explanation:
        "Azure Spot VMs can offer up to 90% discount on pay-as-you-go prices by using Azure's spare capacity. The trade-off is that Azure can evict Spot VMs with 30 seconds notice when it needs the capacity back.",
    },
  ],
  flashcards: [
    {
      front: "What are the three Azure Functions hosting plans?",
      back: "Consumption (auto-scale from zero, pay-per-execution), Premium (pre-warmed instances, VNET integration), and Dedicated (runs on an App Service Plan, always-on).",
    },
    {
      front: "What SLA does Azure provide for VMs deployed across Availability Zones?",
      back: "99.99% uptime SLA, compared to 99.95% for Availability Sets within a single datacenter.",
    },
    {
      front: "What is a deployment slot in Azure App Service?",
      back: "A live instance of the app with its own hostname used for staging and testing. Swapping slots exchanges routing rules at the load balancer for zero-downtime deployments.",
    },
    {
      front: "What does AKS manage vs. what you manage?",
      back: "AKS manages the control plane (API server, etcd, scheduler, controller manager). You manage the worker node pools, application workloads, and node-level configuration.",
    },
    {
      front: "What is the difference between Uniform and Flexible VMSS orchestration?",
      back: "Uniform: all instances use the same VM model and image (stateless workloads). Flexible: allows mixed VM sizes and manual addition of existing VMs (heterogeneous workloads).",
    },
    {
      front: "What is Azure Hybrid Benefit?",
      back: "A licensing benefit that lets you use existing on-premises Windows Server or SQL Server licenses on Azure VMs, reducing compute costs by up to 40%.",
    },
    {
      front: "What are Durable Functions?",
      back: "An extension of Azure Functions that enables stateful workflows, orchestrations, fan-out/fan-in patterns, and human interaction workflows using orchestrator functions with automatic checkpointing.",
    },
    {
      front: "What is an App Service Environment (ASE)?",
      back: "An Isolated-tier deployment of App Service into your own VNET, providing network-level isolation, dedicated compute, and support for high-scale deployments.",
    },
  ],
  glossary: [
    {
      term: "Fault Domain",
      definition:
        "A group of VMs that share a common power source and network switch within a datacenter rack. Availability Sets distribute VMs across fault domains to protect against hardware failures.",
    },
    {
      term: "Update Domain",
      definition:
        "A logical group of VMs that Azure reboots together during planned maintenance. Azure updates one update domain at a time to maintain application availability.",
    },
    {
      term: "Cold Start",
      definition:
        "The latency incurred when a serverless function has no running instances and must allocate a host, initialize the runtime, and load application code before handling a request.",
    },
    {
      term: "Managed Disk",
      definition:
        "Azure-managed block storage for VM disks, abstracting storage account management and providing built-in redundancy (LRS, ZRS), snapshots, and encryption at rest.",
    },
    {
      term: "Node Pool",
      definition:
        "A group of worker nodes in AKS that share the same VM size, OS image, and configuration. System node pools run Kubernetes system pods; user node pools run application workloads.",
    },
    {
      term: "Reserved Instance",
      definition:
        "A 1-year or 3-year commitment to a specific VM size and region that provides up to 72% cost savings compared to pay-as-you-go pricing.",
    },
    {
      term: "Consumption Plan",
      definition:
        "The default Azure Functions hosting plan that automatically scales from zero instances, charges only for execution time and invocation count, and has a 5-minute default execution timeout.",
    },
    {
      term: "App Service Plan",
      definition:
        "The compute resource definition for Azure App Service specifying the tier (Free through Isolated), VM size, instance count, and region. All apps in a plan share the same compute resources.",
    },
  ],
};
