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
  followUps: [
    "How do Azure's compute options map onto the AWS ones you know?",
    "When is AKS the wrong answer for a small team?",
    "What does the App Service abstraction hide, and when does that hurt?",
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
  deepDive: [
    "## VM Architecture and Placement in Azure\n\n**Azure Virtual Machines** run on top of **Hyper-V hypervisors** across Microsoft's global datacenter fleet. When you create a VM, the **Azure Fabric Controller** selects a physical host that satisfies your requested *VM size*, *region*, and *availability constraints*. Each VM is allocated **dedicated CPU cores, memory, and network bandwidth** based on its SKU — for example, a `Standard_D4s_v5` provides 4 vCPUs, 16 GiB RAM, and up to 12,500 Mbps network bandwidth. The **temporary disk** (often the D: drive on Windows or `/dev/sdb` on Linux) resides on the *physical host's local SSD* and is **ephemeral** — data is lost on VM deallocation, stop, or host migration. **Managed Disks** (OS and data disks) are stored in **Azure Storage** as *page blobs* with three replicas (LRS) or zone-redundant replicas (ZRS), providing *99.999% durability*. Understanding this separation between ephemeral local storage and durable managed disks is critical for designing **data persistence strategies**.",
    "## Serverless Compute Deep Dive: Azure Functions Internals\n\nThe **Azure Functions runtime** operates on a *scale controller* that monitors event sources and decides when to **add or remove worker instances**. In the **Consumption plan**, the scale controller evaluates metrics like *queue length*, *HTTP request rate*, and *Event Hub partition lag* to determine the target instance count — scaling from **zero to hundreds of instances** within seconds. Each instance runs in an **Azure App Service sandbox** with resource limits: the Consumption plan caps at **1.5 GB memory** and **5-minute execution timeout** (configurable up to 10 minutes). The **Premium plan** maintains a pool of *pre-warmed instances* (minimum 1 by default, configurable) that are always ready to handle requests, **eliminating cold starts** entirely. Premium also supports **VNET integration**, allowing functions to access resources in private networks via *regional VNET integration* or *private endpoints*. **Durable Functions** extend the programming model with *orchestrator functions* that use **event sourcing** and **checkpointing** — the orchestration state is persisted to **Azure Storage** (tables, queues, and blobs), enabling reliable long-running workflows that survive process restarts.",
    "## AKS Networking, Identity, and Security Architecture\n\nAKS networking is built on **Azure Virtual Network** integration with two primary CNI options. **Azure CNI** allocates pod IPs from the VNET subnet, requiring careful **IP address planning** — you need enough IPs for `(max_pods_per_node × node_count) + node_count`. The newer **Azure CNI Overlay** uses a *separate overlay CIDR* for pods while routing through the VNET, dramatically reducing VNET IP consumption. **Network Policies** (using *Calico* or *Azure NPM*) define *ingress and egress rules* at the pod level, acting as a **firewall for pod-to-pod traffic**. For identity, AKS integrates with **Microsoft Entra ID** (formerly Azure AD) for both *cluster authentication* (via `kubelogin`) and *workload identity* — the **Workload Identity** feature uses **federated identity credentials** to let pods assume Entra ID managed identities without storing secrets, replacing the older *AAD Pod Identity* approach. The **Secrets Store CSI Driver** mounts secrets from **Azure Key Vault** directly into pods as *volumes or environment variables*, ensuring secrets are **never stored in Kubernetes etcd**. For ingress, the **Application Gateway Ingress Controller (AGIC)** or the newer **Web Application Routing** add-on provide *Layer 7 load balancing* with **WAF protection** and **TLS termination**.",
  ],
  code: [
    {
      language: "bash",
      caption: "Create an Azure VM with managed disk and availability zone using Azure CLI",
      source: `# Create a resource group
az group create \\
  --name rg-compute-prod \\
  --location eastus2

# Create a Linux VM in Availability Zone 1
az vm create \\
  --resource-group rg-compute-prod \\
  --name vm-web-01 \\
  --image Ubuntu2204 \\
  --size Standard_D4s_v5 \\
  --zone 1 \\
  --admin-username azureadmin \\
  --generate-ssh-keys \\
  --os-disk-size-gb 128 \\
  --storage-sku Premium_LRS \\
  --nsg-rule SSH \\
  --public-ip-sku Standard \\
  --tags Environment=Production Team=WebApp

# Attach a 256 GiB data disk
az vm disk attach \\
  --resource-group rg-compute-prod \\
  --vm-name vm-web-01 \\
  --name disk-data-01 \\
  --size-gb 256 \\
  --sku Premium_LRS \\
  --new

# Enable auto-shutdown at 7 PM UTC for cost savings
az vm auto-shutdown \\
  --resource-group rg-compute-prod \\
  --name vm-web-01 \\
  --time 1900`,
    },
    {
      language: "bicep",
      caption: "Deploy an Azure Function App with Premium plan and VNET integration using Bicep",
      source: `param location string = resourceGroup().location
param functionAppName string = 'func-orders-prod'
param vnetName string = 'vnet-app-prod'
param subnetName string = 'snet-functions'

// Premium App Service Plan for Functions (Elastic Premium EP1)
resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'plan-\${functionAppName}'
  location: location
  sku: {
    name: 'EP1'
    tier: 'ElasticPremium'
    family: 'EP'
  }
  kind: 'elastic'
  properties: {
    maximumElasticWorkerCount: 20
    reserved: true  // Linux
  }
}

// Storage account for function runtime
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st\${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}

// Reference existing VNET and subnet
resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' existing = {
  name: vnetName
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' existing = {
  parent: vnet
  name: subnetName
}

// Function App with VNET integration
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    virtualNetworkSubnetId: subnet.id
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      appSettings: [
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=\${storageAccount.name};AccountKey=\${storageAccount.listKeys().keys[0].value}'
        }
      ]
    }
  }
}`,
    },
    {
      language: "bash",
      caption: "Create an AKS cluster with Workload Identity and Key Vault integration",
      source: `# Create AKS cluster with Azure CNI Overlay and Workload Identity
az aks create \\
  --resource-group rg-aks-prod \\
  --name aks-microservices-prod \\
  --node-count 3 \\
  --node-vm-size Standard_D4s_v5 \\
  --network-plugin azure \\
  --network-plugin-mode overlay \\
  --pod-cidr 192.168.0.0/16 \\
  --enable-oidc-issuer \\
  --enable-workload-identity \\
  --enable-addons azure-keyvault-secrets-provider \\
  --enable-managed-identity \\
  --kubernetes-version 1.29 \\
  --zones 1 2 3 \\
  --tier standard \\
  --generate-ssh-keys

# Add a GPU node pool for ML workloads
az aks nodepool add \\
  --resource-group rg-aks-prod \\
  --cluster-name aks-microservices-prod \\
  --name gpupool \\
  --node-count 2 \\
  --node-vm-size Standard_NC6s_v3 \\
  --node-taints sku=gpu:NoSchedule \\
  --labels workload=ml \\
  --zones 1 2

# Get credentials and verify
az aks get-credentials \\
  --resource-group rg-aks-prod \\
  --name aks-microservices-prod

kubectl get nodes -o wide`,
    },
  ],
  diagrams: [
    {
      title: "Azure Compute Services Architecture",
      kind: "architecture",
      caption: "Overview of Azure compute services and their positioning across IaaS, PaaS, and serverless models",
      mermaid: `graph TB
  subgraph IaaS["**IaaS - Full Control**"]
    VM["Azure Virtual Machines<br/>OS-level control"]
    VMSS["VM Scale Sets<br/>Auto-scaling VM groups"]
  end
  subgraph PaaS["**PaaS - Managed Platform**"]
    AppSvc["Azure App Service<br/>Web apps & APIs"]
    AKS["Azure Kubernetes Service<br/>Managed Kubernetes"]
    ACI["Azure Container Instances<br/>Single container groups"]
  end
  subgraph Serverless["**Serverless - Event-Driven**"]
    Func["Azure Functions<br/>Event-triggered code"]
    Logic["Azure Logic Apps<br/>Workflow automation"]
  end
  VM --> |"Scale out"| VMSS
  ACI --> |"Burst scaling"| AKS
  Func --> |"Durable Functions"| Logic
  AppSvc --> |"Container deploy"| ACI
  style IaaS fill:#e6f3ff,stroke:#0078d4
  style PaaS fill:#e6ffe6,stroke:#00a86b
  style Serverless fill:#fff3e6,stroke:#ff8c00`,
    },
    {
      title: "Azure Functions Scaling Flow",
      kind: "flow",
      caption: "How the Azure Functions scale controller manages instance scaling based on event source metrics",
      mermaid: `flowchart LR
  A["**Event Source**<br/>Queue / HTTP / Timer"] --> B["**Scale Controller**<br/>Monitors metrics"]
  B --> C{"Pending<br/>events?"}
  C -->|"Yes"| D["**Add Worker**<br/>Allocate instance"]
  C -->|"No"| E{"Idle<br/>instances?"}
  E -->|"Yes"| F["**Remove Worker**<br/>Scale in"]
  E -->|"No"| G["**Steady State**<br/>Maintain count"]
  D --> H["**Worker Instance**<br/>Execute function"]
  H --> I["**Return Result**<br/>Output bindings"]
  I --> B
  F --> B
  G --> B`,
    },
    {
      title: "AKS Networking with Azure CNI",
      kind: "network",
      caption: "Network architecture showing pod IP allocation and traffic flow in AKS with Azure CNI",
      mermaid: `graph TB
  subgraph VNET["**Azure VNET** 10.0.0.0/8"]
    subgraph NodeSubnet["**Node Subnet** 10.240.0.0/16"]
      N1["Node 1<br/>10.240.0.4"]
      N2["Node 2<br/>10.240.0.5"]
      N3["Node 3<br/>10.240.0.6"]
    end
    subgraph PodCIDR["**Pod IPs from Subnet**"]
      P1["Pod A<br/>10.240.1.10"]
      P2["Pod B<br/>10.240.1.11"]
      P3["Pod C<br/>10.240.1.12"]
    end
    subgraph Services["**Azure Services**"]
      KV["Key Vault"]
      SQL["Azure SQL"]
      ACR["Container Registry"]
    end
  end
  LB["**Azure Load Balancer**"] --> N1
  LB --> N2
  LB --> N3
  N1 --> P1
  N2 --> P2
  N3 --> P3
  P1 --> KV
  P2 --> SQL
  P3 --> ACR
  OnPrem["**On-Premises**"] -->|"ExpressRoute /<br/>VPN Gateway"| VNET`,
    },
    {
      title: "VM Availability Decision Tree",
      kind: "flow",
      caption: "Decision flow for choosing between Availability Sets, Availability Zones, and single VM placement",
      mermaid: `flowchart TD
  Start["**Need High Availability?**"] --> Q1{"Multi-region<br/>required?"}
  Q1 -->|"Yes"| MR["Deploy across<br/>**multiple regions**<br/>with Traffic Manager"]
  Q1 -->|"No"| Q2{"Datacenter-level<br/>resilience needed?"}
  Q2 -->|"Yes"| AZ["Use **Availability Zones**<br/>99.99% SLA<br/>Cross-datacenter"]
  Q2 -->|"No"| Q3{"Rack-level<br/>protection enough?"}
  Q3 -->|"Yes"| AS["Use **Availability Set**<br/>99.95% SLA<br/>Fault & Update Domains"]
  Q3 -->|"No"| SV["**Single VM**<br/>with Premium SSD<br/>99.9% SLA"]`,
    },
  ],
  animations: [
    {
      title: "Choosing an Azure compute service",
      steps: [
        {
          label: "Need full OS control?",
          detail: "Virtual Machines. You patch and scale it.",
        },
        {
          label: "Just a web app?",
          detail: "App Service. Managed runtime, easy deploy slots — at the cost of runtime version control.",
        },
        {
          label: "Event-driven, short-lived?",
          detail: "Functions. Scales to zero; cold starts and execution limits apply.",
        },
        {
          label: "Containers, simple?",
          detail: "Container Apps — managed, scales to zero, no cluster to run.",
        },
        {
          label: "Containers, full control?",
          detail: "AKS. Maximum flexibility, and a real operational commitment.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "Azure VMs",
      "App Service",
      "Azure Functions",
      "AKS",
    ],
    rows: [
      [
        "**Service Model**",
        "*IaaS* — full OS control",
        "*PaaS* — managed platform",
        "*Serverless* — event-driven",
        "*Managed Kubernetes* — container orchestration",
      ],
      [
        "**Scaling**",
        "VMSS with autoscale rules",
        "Built-in autoscale (up to 30 instances)",
        "Auto-scale from **zero** to hundreds",
        "Cluster autoscaler + HPA/KEDA",
      ],
      [
        "**Cold Start**",
        "Minutes (VM boot)",
        "None (always running)",
        "Seconds (Consumption plan)",
        "Seconds (pod scheduling)",
      ],
      [
        "**Max SLA**",
        "**99.99%** (Availability Zones)",
        "**99.95%** (Standard tier)",
        "N/A (event-driven)",
        "**99.95%** (Standard tier with AZs: 99.99%)",
      ],
      [
        "**Cost Model**",
        "Per-second VM billing",
        "Per App Service Plan",
        "Per execution + GB-seconds",
        "Per worker node VM",
      ],
      [
        "**Best For**",
        "Legacy apps, custom OS needs",
        "Web apps, REST APIs",
        "Event processing, microservices glue",
        "Microservices, multi-container apps",
      ],
      [
        "**VNET Integration**",
        "Native (deployed in VNET)",
        "Regional VNET integration",
        "Premium plan only",
        "Native (Azure CNI / kubenet)",
      ],
      [
        "**OS Access**",
        "Full SSH/RDP access",
        "Limited (Kudu console)",
        "None",
        "SSH to nodes (not recommended)",
      ],
    ],
  },
  exercises: [
    "**VM Sizing and Cost Exercise:** You have a *.NET application* that requires **8 vCPUs**, **32 GiB RAM**, and needs to run 24/7 in `East US 2`. Compare the monthly cost of a `Standard_D8s_v5` VM on *pay-as-you-go* vs. a **1-year Reserved Instance** vs. using **Azure Hybrid Benefit** with an existing Windows Server license. Use the `az vm list-skus` command and the **Azure Pricing Calculator** to determine the best option.",
    "**AKS Multi-Tier Deployment:** Design and deploy a **three-tier application** on AKS: a *React frontend*, a *Node.js API*, and a *PostgreSQL database*. Implement **Network Policies** using Calico to restrict traffic so that only the API pods can reach the database pods, and only the frontend pods can reach the API pods. Use `kubectl apply` to deploy and `kubectl get networkpolicy` to verify. Test by exec-ing into a frontend pod and confirming it **cannot** reach the database directly.",
    "**Azure Functions with Durable Orchestration:** Build a **Durable Functions** orchestration that processes an order: (1) *validate inventory* via an activity function, (2) *charge payment* via an activity function, (3) *send confirmation email* via an activity function. Implement **error handling** with retry policies (`maxNumberOfAttempts: 3`, `firstRetryIntervalInSeconds: 5`) and a **compensation pattern** that reverses the payment if email sending fails. Deploy using `func azure functionapp publish`.",
    "**App Service Blue-Green Deployment:** Create an App Service with a **staging deployment slot**. Deploy version 1 of a web app to production, then deploy version 2 to the staging slot. Configure **slot-specific app settings** (e.g., `FEATURE_FLAG=v2` on staging, `FEATURE_FLAG=v1` on production). Perform a **swap operation** using `az webapp deployment slot swap`, verify the settings behavior, then practice a **rollback** by swapping back.",
    "**VMSS with Custom Autoscale:** Deploy a **Virtual Machine Scale Set** with a custom autoscale profile: scale out by 2 instances when *average CPU exceeds 70%* for 5 minutes, and scale in by 1 instance when *CPU drops below 30%* for 10 minutes. Set a minimum of **2 instances** and maximum of **10 instances**. Use `az monitor autoscale create` and `az monitor autoscale rule create`. Stress-test using a CPU load generator and observe the scale-out behavior in **Azure Monitor**.",
  ],
  cheatSheet: [
    "**VM Quick Create:** `az vm create -g <rg> -n <name> --image Ubuntu2204 --size Standard_D2s_v5 --generate-ssh-keys` — creates a Linux VM with *auto-generated SSH keys* and a public IP",
    "**List Available VM Sizes:** `az vm list-sizes --location eastus2 --output table` — shows all *VM SKUs* with their CPU, memory, and disk specs for a given region",
    "**Deploy Function App:** `func init --worker-runtime node && func new --template 'HTTP trigger'` to scaffold, then `func azure functionapp publish <app-name>` to deploy",
    "**AKS Credentials:** `az aks get-credentials -g <rg> -n <cluster>` — merges the cluster's *kubeconfig* into `~/.kube/config` for `kubectl` access",
    "**App Service Slot Swap:** `az webapp deployment slot swap -g <rg> -n <app> --slot staging --target-slot production` — performs a **zero-downtime swap** between staging and production",
    "**Scale VMSS Manually:** `az vmss scale -g <rg> -n <vmss> --new-capacity 5` — immediately sets the instance count to 5; use `az monitor autoscale create` for *auto-scaling rules*",
  ],
  revisionNotes: [
    "**VM families** map to workload types: *B-series* (burstable/dev-test), *D-series* (general purpose), *E-series* (memory-optimized), *F-series* (compute-optimized), *N-series* (GPU/ML), *L-series* (storage-optimized). Temporary disks are **ephemeral** — never store persistent data on them.",
    "**Availability Zones** provide **99.99% SLA** by distributing across *separate datacenters* within a region, while **Availability Sets** provide **99.95% SLA** using *fault domains* (racks) and *update domains* (maintenance groups) within a single datacenter.",
    "**Azure Functions** hosting plans differ in key ways: *Consumption* scales from zero and bills per-execution but has **cold starts**; *Premium* maintains **pre-warmed instances** with VNET support; *Dedicated* runs on an App Service Plan with **always-on** capability. **Durable Functions** enable stateful orchestrations with automatic checkpointing.",
    "**AKS** manages the *control plane* for free (API server, etcd, scheduler); you pay only for **worker node VMs**. Use **Azure CNI** for direct pod-to-VNET communication (more IP consumption) or **Azure CNI Overlay** for IP-efficient pod networking. **Workload Identity** replaces AAD Pod Identity for secure, secretless access to Azure resources.",
    "**Cost optimization** levers: *Reserved Instances* (up to **72% savings**), *Savings Plans* (flexible across VM families), *Spot VMs* (up to **90% discount**, evictable), *Azure Hybrid Benefit* (reuse on-prem licenses for **40% savings**), and *auto-shutdown schedules* for dev/test workloads.",
  ],
  resources: [
    {
      label: "Microsoft Learn — Azure compute services",
      kind: "docs",
    },
    {
      label: "Azure Architecture Center",
      kind: "docs",
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
