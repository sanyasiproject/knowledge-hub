import type { TopicContent } from "../types";

export const deploymentModels: TopicContent = {
  quickSummary: [
    "Cloud deployment models define where infrastructure lives and who controls it: public cloud (shared, provider-owned), private cloud (dedicated, single-tenant), hybrid cloud (mix of on-premises and public cloud), and multi-cloud (multiple public cloud providers).",
    "Public cloud offers the lowest upfront cost and fastest scaling but raises data sovereignty and compliance concerns. Private cloud provides maximum control and isolation but requires significant capital expenditure and operational expertise.",
    "Hybrid cloud is the most common enterprise pattern — keep sensitive workloads on-premises or in private cloud while bursting to public cloud for variable demand. It requires robust networking (VPN, Direct Connect) and consistent identity management across environments.",
    "Multi-cloud strategies use multiple public providers (e.g., AWS + Azure + GCP) to avoid vendor lock-in, leverage best-of-breed services, and meet regional compliance requirements — but add complexity in networking, IAM, monitoring, and cost management.",
    "Data sovereignty laws (GDPR, PDPA, data localization mandates) often dictate deployment model choices: certain data must remain within geographic boundaries, forcing region-specific or private cloud deployments regardless of technical preference."
  ],

  detailed: [
    "## Public Cloud\n\nPublic cloud infrastructure is owned and operated by third-party providers (AWS, Azure, GCP) and shared across multiple tenants. Resources are provisioned on demand via self-service APIs.\n\n**Key characteristics:**\n- No upfront capital expenditure — purely operational expense (OpEx)\n- Near-infinite scalability with global presence across dozens of regions\n- Multi-tenant: physical hardware is shared, but logical isolation is enforced via hypervisors and network virtualization\n- Provider handles physical security, hardware lifecycle, power, cooling, and network backbone\n- Pay-as-you-go pricing with volume discounts (reserved instances, committed use)\n\n**When to use:**\n- Startups and projects needing fast time-to-market\n- Variable or unpredictable workloads that benefit from elastic scaling\n- Applications without strict data residency requirements\n- Development and testing environments\n\n**Risks:**\n- Data sovereignty: your data resides on someone else's infrastructure, potentially in another country\n- Vendor lock-in: deep use of proprietary services makes migration costly\n- Noisy neighbor: shared hardware can lead to variable performance\n- Compliance: some regulations prohibit certain data from leaving specific jurisdictions",

    "## Private Cloud\n\nPrivate cloud dedicates infrastructure to a single organization, either on-premises or hosted by a provider (e.g., AWS Outposts, Azure Stack, VMware Cloud Foundation). It provides cloud-like agility with full control.\n\n**Key characteristics:**\n- Single-tenant: hardware is not shared with other organizations\n- Full control over security policies, network configuration, and hardware selection\n- Can be on-premises (you own the data center) or hosted (provider manages hardware in a dedicated environment)\n- Higher upfront cost (CapEx) but predictable ongoing costs\n- Limited scalability compared to public cloud — constrained by physical hardware\n\n**When to use:**\n- Industries with strict compliance requirements (finance, healthcare, government, defense)\n- Workloads requiring guaranteed performance without noisy-neighbor risk\n- Organizations with existing data center investments wanting cloud-like automation\n- Data that legally cannot leave specific physical premises\n\n**Hosted private cloud options:** AWS Outposts, Azure Stack Hub, Google Anthos on bare metal, Oracle Cloud@Customer — these bring cloud services into your data center while maintaining the public cloud's management plane.",

    "## Hybrid Cloud\n\nHybrid cloud combines on-premises or private cloud infrastructure with one or more public cloud services, with orchestration and data movement between them.\n\n**Key characteristics:**\n- Workload placement flexibility: keep sensitive data on-premises, run compute-heavy tasks in public cloud\n- Cloud bursting: handle baseline load on-premises, scale to public cloud during peak demand\n- Requires secure, low-latency connectivity (AWS Direct Connect, Azure ExpressRoute, GCP Cloud Interconnect)\n- Unified management plane is critical — tools like Azure Arc, AWS Outposts, Google Anthos provide consistent operations\n- Identity federation between environments (SAML, OIDC, Active Directory integration)\n\n**Architecture patterns:**\n- **Tiered hybrid:** Frontend in public cloud, database on-premises\n- **Cloud bursting:** On-premises primary with public cloud overflow capacity\n- **Analytics hybrid:** Operational data on-premises, analytics and ML in public cloud\n- **DR hybrid:** Production on-premises, disaster recovery in public cloud\n\n**Challenges:**\n- Network latency between environments affects application performance\n- Consistent security policies across environments are hard to maintain\n- Data synchronization and consistency across boundaries\n- Increased operational complexity — two (or more) platforms to manage",

    "## Multi-Cloud\n\nMulti-cloud uses two or more public cloud providers simultaneously, distributing workloads based on each provider's strengths, pricing, or geographic availability.\n\n**Key characteristics:**\n- Avoids single-vendor lock-in by distributing critical workloads\n- Leverage best-of-breed services (e.g., GCP for ML, AWS for breadth, Azure for enterprise integration)\n- Geographic coverage: some regions only have certain providers\n- Requires abstraction layers for portability (Kubernetes, Terraform, Pulumi)\n\n**When to use:**\n- Regulatory requirements mandating provider diversity\n- M&A scenarios where acquired companies use different providers\n- Best-of-breed strategy: specific services from each provider\n- Negotiation leverage with cloud vendors on pricing\n\n**Challenges:**\n- Significantly higher operational complexity — multiple IAM systems, networking models, billing, and monitoring tools\n- Data egress costs when moving data between providers\n- Skills gap: teams need expertise across multiple platforms\n- Lowest-common-denominator problem: using only portable features limits innovation",

    "## Data Sovereignty and Compliance\n\nData sovereignty refers to the concept that data is subject to the laws of the country where it is stored or processed. This fundamentally shapes deployment model decisions.\n\n**Key regulations:**\n- **GDPR (EU):** Personal data of EU residents must be processed lawfully; transfers outside the EU require adequacy decisions or standard contractual clauses\n- **Data localization laws:** Russia, China, India, Brazil, and others require certain data to remain within national borders\n- **Industry-specific:** HIPAA (US healthcare), PCI-DSS (payment card data), ITAR (US defense data)\n\n**Deployment implications:**\n- Choose cloud regions carefully — not all services are available in all regions\n- Private or hybrid cloud may be required for data that cannot leave specific jurisdictions\n- Multi-cloud can help meet regional requirements (e.g., Azure in government-specific regions)\n- Data classification is essential: understand what data has residency requirements before choosing a deployment model\n\n**Vendor lock-in mitigation strategies:**\n- Use open standards (Kubernetes, Terraform) for infrastructure abstraction\n- Prefer cloud-agnostic data formats and APIs where possible\n- Maintain infrastructure-as-code that can target multiple providers\n- Evaluate exit costs as part of vendor selection — not just entry costs\n- Containerize applications for portability across environments"
  ],

  interviewQA: [
    {
      q: "What are the four main cloud deployment models?",
      a: "Public cloud (shared infrastructure operated by a third-party provider like AWS or Azure), private cloud (dedicated infrastructure for a single organization, either on-premises or hosted), hybrid cloud (a combination of on-premises/private and public cloud with orchestration between them), and multi-cloud (using multiple public cloud providers simultaneously). Community cloud is sometimes cited as a fifth model, where infrastructure is shared among organizations with common concerns (e.g., government agencies).",
      followUps: ["When would you choose private over public cloud?", "What connectivity options exist for hybrid cloud?"]
    },
    {
      q: "How do you mitigate vendor lock-in in a cloud deployment?",
      a: "Several strategies help: (1) Use infrastructure-as-code tools like Terraform that support multiple providers. (2) Containerize workloads with Kubernetes for compute portability. (3) Prefer open-source databases and middleware over proprietary managed services. (4) Design applications with clean abstraction layers that separate business logic from cloud-specific APIs. (5) Evaluate exit costs during vendor selection. (6) Avoid deep integration with proprietary services unless the business value clearly outweighs the lock-in cost. The trade-off is that avoiding lock-in often means forgoing the most powerful provider-specific features.",
      followUps: ["What are the costs of a multi-cloud strategy?", "Can Kubernetes truly provide cloud portability?"]
    },
    {
      q: "How does data sovereignty affect cloud architecture decisions?",
      a: "Data sovereignty means data is governed by the laws of the country where it resides. This affects architecture in several ways: (1) You must choose cloud regions that comply with data residency requirements. (2) Some data may not be allowed to leave specific jurisdictions, requiring private or region-locked deployments. (3) Cross-border data transfers (e.g., EU to US) require legal mechanisms like Standard Contractual Clauses under GDPR. (4) You need data classification to know which data has residency constraints. (5) Backup and disaster recovery locations must also comply. This often forces hybrid or multi-region architectures even when a simpler deployment would suffice technically.",
      followUps: ["How does GDPR affect cloud provider selection?", "What is a data processing agreement?"]
    },
    {
      q: "What is cloud bursting and when would you use it?",
      a: "Cloud bursting is a hybrid cloud pattern where an application runs on private cloud or on-premises infrastructure under normal load, but 'bursts' into public cloud when demand exceeds local capacity. It's useful for workloads with predictable baselines but occasional spikes — for example, a retail site during Black Friday, or a financial system during end-of-quarter processing. Implementation requires low-latency connectivity between environments, consistent application deployment (usually via containers), and a load-balancing layer that can route traffic across boundaries. The challenge is maintaining data consistency and session state across environments during burst events."
    },
    {
      q: "Compare hosted private cloud solutions like AWS Outposts vs. traditional on-premises private cloud.",
      a: "AWS Outposts, Azure Stack, and similar services bring public cloud hardware and software into your data center. Advantages over traditional private cloud: same APIs and management tools as the public cloud, managed hardware lifecycle (provider replaces failed components), consistent developer experience across environments. Disadvantages: still requires data center space, power, and cooling; limited service availability compared to the full public cloud; higher cost than traditional on-premises for raw compute; vendor lock-in to that provider's ecosystem. Traditional private cloud (e.g., VMware, OpenStack) offers more vendor flexibility but requires significantly more operational expertise."
    }
  ],

  followUps: [
    "What actually drives a hybrid decision — is it ever purely technical?",
    "What does data residency force on your architecture?",
    "Why is 'multi-cloud for portability' usually more expensive than the lock-in it avoids?",
  ],
  mcqs: [
    {
      q: "Which deployment model combines on-premises infrastructure with public cloud services?",
      options: ["Public cloud", "Private cloud", "Hybrid cloud", "Community cloud"],
      answerIndex: 2,
      explanation: "Hybrid cloud connects on-premises or private cloud infrastructure with public cloud, enabling workload placement flexibility, cloud bursting, and compliance with data residency requirements."
    },
    {
      q: "What is the primary driver for multi-cloud adoption?",
      options: ["Lower compute costs", "Avoiding vendor lock-in", "Simpler operations", "Faster network speeds"],
      answerIndex: 1,
      explanation: "While multi-cloud can offer best-of-breed services and geographic coverage, the primary driver is avoiding dependence on a single vendor. Multi-cloud actually increases operational complexity and costs."
    },
    {
      q: "Data sovereignty requires that:",
      options: [
        "All data must be encrypted at rest",
        "Data is subject to the laws of the country where it is stored",
        "Data must be stored in at least two geographic regions",
        "Only government agencies can access stored data"
      ],
      answerIndex: 1,
      explanation: "Data sovereignty means data is governed by the laws and regulations of the country where it physically resides. This affects which cloud regions and deployment models are permissible."
    },
    {
      q: "Which is a disadvantage of private cloud compared to public cloud?",
      options: [
        "Less control over security policies",
        "Higher upfront capital expenditure",
        "Greater noisy-neighbor risk",
        "Less compliance flexibility"
      ],
      answerIndex: 1,
      explanation: "Private cloud requires significant capital investment in hardware, data center space, power, and cooling, whereas public cloud operates on an OpEx model with no upfront costs."
    },
    {
      q: "AWS Direct Connect and Azure ExpressRoute are primarily used for:",
      options: [
        "Content delivery to end users",
        "Dedicated private connectivity between on-premises and cloud",
        "Inter-region replication within a single provider",
        "DNS resolution for hybrid environments"
      ],
      answerIndex: 1,
      explanation: "Direct Connect (AWS) and ExpressRoute (Azure) provide dedicated, private network connections from on-premises data centers to the cloud, offering lower latency and more consistent performance than internet-based VPN."
    }
  ],

  flashcards: [
    { front: "Public Cloud", back: "Shared, multi-tenant infrastructure operated by a third-party provider. OpEx model, near-infinite scale, but data sovereignty and lock-in concerns. Examples: AWS, Azure, GCP." },
    { front: "Private Cloud", back: "Dedicated, single-tenant infrastructure for one organization. On-premises or hosted. Higher CapEx but full control over security and compliance. Examples: VMware, OpenStack, AWS Outposts." },
    { front: "Hybrid Cloud", back: "Combination of on-premises/private and public cloud with orchestration between environments. Enables cloud bursting, tiered architectures, and compliance-driven workload placement." },
    { front: "Multi-Cloud", back: "Using two or more public cloud providers simultaneously. Reduces vendor lock-in but increases operational complexity, egress costs, and skills requirements." },
    { front: "Cloud Bursting", back: "Hybrid cloud pattern where applications run on-premises at baseline load and overflow to public cloud during demand spikes. Requires low-latency connectivity and consistent deployment." },
    { front: "Data Sovereignty", back: "Legal principle that data is subject to the laws of the country where it is stored. Drives deployment model and region selection decisions." },
    { front: "Vendor Lock-in", back: "The cost and difficulty of migrating away from a cloud provider. Mitigated by containers, IaC tools, open standards, and abstraction layers." },
    { front: "AWS Direct Connect / Azure ExpressRoute", back: "Dedicated private network connections from on-premises to cloud, bypassing the public internet for lower latency, higher bandwidth, and more consistent performance." }
  ],

  deepDive: [
    "## Hybrid Cloud Architecture Patterns\n\n**Hybrid cloud connects on-premises infrastructure with public cloud** through dedicated network links and consistent management planes. **AWS Direct Connect** provides 1/10/100 Gbps dedicated connections from your data center to AWS, bypassing the public internet for lower latency and consistent throughput. **AWS Outposts** extends AWS infrastructure into your data center — identical hardware running AWS services (EC2, EBS, S3, EKS, RDS) managed by AWS but located on your premises. Use cases include data residency requirements, ultra-low latency to on-premises systems, and local data processing. **VMware Cloud on AWS** runs the full VMware SDDC stack on dedicated AWS hardware, enabling lift-and-shift of VMware workloads without re-architecting. The key challenge in hybrid architectures is **identity federation** — using IAM Identity Center or SAML federation to provide seamless authentication across on-premises Active Directory and AWS services. **AWS Storage Gateway** bridges on-premises storage with S3 through file (NFS/SMB), volume (iSCSI), and tape gateway modes.",
    "## Multi-Cloud Strategy: Benefits, Challenges, and Decision Framework\n\n**Multi-cloud** uses two or more public cloud providers simultaneously. **Legitimate drivers**: avoiding vendor lock-in for negotiation leverage, leveraging best-of-breed services (e.g., GCP BigQuery for analytics, AWS for general compute, Azure for Microsoft workloads), meeting data sovereignty requirements across regions where a single provider lacks presence, and organizational M&A where acquired companies use different clouds. **Challenges are significant**: each provider has distinct networking models (VPC vs VNet vs VPC), IAM systems (IAM vs Azure AD/Entra vs GCP IAM), and service APIs. Teams need expertise across all platforms, increasing hiring and training costs. **Cross-cloud networking** requires third-party solutions (Aviatrix, Megaport) or VPN mesh configurations. **Terraform** is the de facto multi-cloud IaC tool, but provider-specific modules still dominate. **The pragmatic approach**: standardize on Kubernetes (EKS, AKS, GKE) for application portability, use Terraform for infrastructure abstraction, keep data in one primary cloud (cross-cloud data transfer is expensive), and use a second cloud strategically for specific services rather than mirroring everything.",
    "## Private Cloud and Cloud-Native On-Premises\n\n**Private cloud** provides cloud-like agility (self-service provisioning, elasticity, metering) on dedicated infrastructure. **OpenStack** is the open-source platform for building private clouds — it provides compute (Nova), networking (Neutron), storage (Cinder/Swift), and identity (Keystone) services. **VMware vSphere with Tanzu** adds Kubernetes-native management to VMware private clouds, enabling developers to use familiar Kubernetes APIs while infrastructure teams manage vSphere underneath. **Nutanix** offers hyperconverged infrastructure with a cloud-like management plane. The **total cost of ownership (TCO)** argument is nuanced: private cloud has higher upfront capital expenditure (CapEx) but predictable ongoing costs; public cloud converts CapEx to operational expenditure (OpEx) but costs can grow unpredictably. For workloads running 24/7 at high utilization (>70%), private cloud can be 30-50% cheaper over 3-5 years. For variable or growing workloads, public cloud's elasticity is more cost-effective. **Cloud-native on-premises** platforms like AWS Outposts, Azure Stack HCI, and Google Anthos on bare metal blur the boundary — providing public cloud APIs and management while data stays on-premises."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: AWS Direct Connect and VPN failover for hybrid connectivity",
      source: `# Direct Connect Gateway for hybrid connectivity
resource "aws_dx_gateway" "main" {
  name            = "hybrid-dx-gateway"
  amazon_side_asn = 64512
}

resource "aws_dx_gateway_association" "main" {
  dx_gateway_id         = aws_dx_gateway.main.id
  associated_gateway_id = aws_vpn_gateway.main.id
  allowed_prefixes      = ["10.0.0.0/8"]
}

# VPN as failover for Direct Connect
resource "aws_vpn_gateway" "main" {
  vpc_id          = aws_vpc.main.id
  amazon_side_asn = 64512

  tags = { Name = "hybrid-vpn-gw" }
}

resource "aws_customer_gateway" "onprem" {
  bgp_asn    = 65000
  ip_address = var.onprem_public_ip
  type       = "ipsec.1"

  tags = { Name = "onprem-datacenter" }
}

resource "aws_vpn_connection" "failover" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.onprem.id
  type                = "ipsec.1"
  static_routes_only  = false

  tags = { Name = "dx-failover-vpn" }
}

# Route table with routes to on-premises
resource "aws_route" "to_onprem" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "10.0.0.0/8"
  gateway_id             = aws_vpn_gateway.main.id
}`
    },
    {
      language: "yaml",
      caption: "Kubernetes multi-cloud deployment with Helm values per provider",
      source: `# values-aws.yaml - AWS EKS specific overrides
cloud: aws
ingress:
  class: alb
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:123456789012:certificate/abc123

storage:
  class: gp3
  provisioner: ebs.csi.aws.com

serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/app-role

monitoring:
  cloudwatch:
    enabled: true
    logGroup: /eks/prod/app

---
# values-azure.yaml - Azure AKS specific overrides
cloud: azure
ingress:
  class: azure-application-gateway
  annotations:
    appgw.ingress.kubernetes.io/ssl-redirect: "true"

storage:
  class: managed-premium
  provisioner: disk.csi.azure.com

serviceAccount:
  annotations:
    azure.workload.identity/client-id: "abc-123-def"

monitoring:
  azureMonitor:
    enabled: true
    workspaceId: "/subscriptions/.../workspaces/prod"`
    },
    {
      language: "bash",
      caption: "AWS CLI: set up AWS Storage Gateway for hybrid storage",
      source: `# Create an S3 File Gateway for hybrid file access
# Step 1: Deploy the gateway VM on-premises (OVA/AMI)
# Step 2: Activate the gateway
aws storagegateway activate-gateway \\
  --activation-key "ABCDE-12345-FGHIJ-67890-KLMNO" \\
  --gateway-name "onprem-file-gateway" \\
  --gateway-timezone "GMT-5:00" \\
  --gateway-region "us-east-1" \\
  --gateway-type "FILE_S3"

# Add local cache disk for frequently accessed files
aws storagegateway add-cache \\
  --gateway-arn "arn:aws:storagegateway:us-east-1:123456789012:gateway/sgw-abc123" \\
  --disk-ids "['/dev/sdb']"

# Create an NFS file share backed by S3
aws storagegateway create-nfs-file-share \\
  --client-token "unique-token-123" \\
  --gateway-arn "arn:aws:storagegateway:us-east-1:123456789012:gateway/sgw-abc123" \\
  --role "arn:aws:iam::123456789012:role/StorageGatewayS3Role" \\
  --location-arn "arn:aws:s3:::hybrid-file-share" \\
  --default-storage-class "S3_STANDARD" \\
  --client-list "10.0.0.0/8" \\
  --squash "RootSquash" \\
  --read-only false

# Verify the file share is available
aws storagegateway list-file-shares \\
  --gateway-arn "arn:aws:storagegateway:us-east-1:123456789012:gateway/sgw-abc123" \\
  --query 'FileShareInfoList[].{ID:FileShareId,Status:FileShareStatus,Path:Path}' \\
  --output table`
    }
  ],

  comparison: {
    columns: ["Aspect", "Public Cloud", "Private Cloud", "Hybrid Cloud", "Multi-Cloud"],
    rows: [
      ["Capital expenditure", "None (OpEx only)", "High (hardware + software)", "Medium (on-prem + cloud)", "None to medium"],
      ["Scalability", "Virtually unlimited", "Limited by hardware", "Burst to public cloud", "Unlimited across providers"],
      ["Time to deploy", "Minutes", "Weeks to months", "Days to weeks", "Days to weeks per provider"],
      ["Control", "Limited (provider-managed)", "Full control", "Mixed — varies by workload location", "Limited per provider"],
      ["Data sovereignty", "Provider regions", "Full control (your premises)", "Flexible placement", "Flexible across providers"],
      ["Vendor lock-in risk", "High (single provider)", "Low (you own it)", "Medium", "Low (distributed risk)"],
      ["Operational complexity", "Low (managed services)", "High (self-managed)", "High (bridge two worlds)", "Very high (multiple platforms)"],
      ["Best for", "Startups, variable workloads, rapid scaling", "Regulated industries, predictable workloads", "Data residency + cloud agility", "Avoid lock-in, best-of-breed services"]
    ]
  },

  exercises: [
    "A European bank must keep customer financial data within the EU while leveraging AWS for compute-intensive risk modeling. Design a hybrid architecture using: AWS Outposts in their Frankfurt data center for data storage, Direct Connect to AWS eu-central-1 for compute bursting, AWS Storage Gateway for file access, and IAM Identity Center federated with their on-premises Active Directory. Address data residency compliance and network failover.",
    "A media company currently runs 100% on AWS ($500K/month) wants to evaluate a multi-cloud strategy to reduce vendor lock-in risk and leverage GCP's BigQuery for analytics. Design a phased migration plan: which workloads to keep on AWS, which to move to GCP, how to handle cross-cloud networking (Megaport or VPN), how to standardize on Kubernetes (EKS + GKE), and how to manage IaC with Terraform. Calculate the TCO impact of the multi-cloud overhead.",
    "Compare the TCO of running a consistent workload (50 servers, 24/7, 3 years) on: (1) AWS EC2 with 3-year Reserved Instances, (2) private cloud with OpenStack on purchased hardware, (3) hybrid with 30 servers on-premises and burst capacity on AWS. Include: hardware costs, power/cooling, staffing for private cloud operations, AWS pricing, and network connectivity costs.",
    "Design a cloud bursting architecture for an e-commerce company whose on-premises Kubernetes cluster handles 1,000 req/s normally but needs to scale to 10,000 req/s during holiday sales. Specify: the on-premises Kubernetes setup, the AWS EKS cluster for burst capacity, Kubernetes Federation or Admiralty for cross-cluster scheduling, data synchronization strategy, and DNS-based traffic routing.",
    "A healthcare organization uses Azure for their Microsoft-centric workloads (Azure AD, Office 365, SQL Server) but needs AWS for a new ML pipeline (SageMaker, S3 data lake). Design a multi-cloud architecture addressing: identity federation between Azure AD and AWS IAM, cross-cloud networking (Azure ExpressRoute + AWS Direct Connect via Megaport), data transfer patterns, and unified monitoring (Datadog or Grafana Cloud spanning both)."
  ],

  cheatSheet: [
    "**Hybrid connectivity options**: Direct Connect (dedicated line, 1-100 Gbps, consistent latency) vs Site-to-Site VPN (encrypted over internet, cheaper, minutes to set up). Use VPN as failover for Direct Connect",
    "**AWS Outposts**: AWS-managed hardware in YOUR data center. Supports EC2, EBS, S3, EKS, RDS. You provide power, cooling, networking. AWS patches and maintains the hardware remotely",
    "**Multi-cloud reality check**: most organizations use multi-cloud by accident (M&A, team preferences), not by strategy. Intentional multi-cloud should target specific services, not mirror everything",
    "**Data gravity**: data is expensive to move between clouds ($0.09/GB AWS egress). Keep primary data in one cloud and move compute to data, not data to compute. This often determines the primary cloud choice",
    "**Kubernetes as the portability layer**: standardize on K8s (EKS, AKS, GKE) for application portability. Use Helm charts with provider-specific values files. But K8s alone does not make you multi-cloud — storage, networking, IAM still differ",
    "**Private cloud cost crossover**: at roughly 60-70% sustained utilization, private cloud becomes cheaper than public cloud over 3-5 years. Below that, public cloud elasticity is more cost-effective",
    "**Community cloud**: shared infrastructure for organizations with common requirements (government, healthcare, education). FedRAMP GovCloud is AWS's community cloud for US government workloads",
    "**Cloud repatriation**: the trend of moving some workloads back from public cloud to on-premises (e.g., Basecamp/37signals). Usually driven by predictable, high-utilization workloads where cloud flexibility provides diminishing returns"
  ],

  revisionNotes: [
    "Public cloud = multi-tenant shared infrastructure (AWS, Azure, GCP). Private cloud = single-tenant dedicated infrastructure (on-premises or hosted). Hybrid = connected combination. Multi-cloud = multiple public cloud providers",
    "Hybrid cloud requires consistent identity, networking, and management across environments. Without these, you have disconnected silos, not a hybrid architecture",
    "AWS Direct Connect does NOT encrypt traffic by default — it is a dedicated line but not inherently secure. Layer a VPN over Direct Connect for encryption in transit if required by compliance",
    "AWS Outposts pricing: you pay for the Outpost rack (compute + storage capacity on a 3-year term) plus standard AWS pricing for services running on it. AWS handles hardware maintenance and software updates",
    "Multi-cloud increases operational complexity: separate billing, different IAM models, different networking concepts, separate monitoring tools. The abstraction cost is real — budget 20-30% overhead for tooling and skills",
    "Data sovereignty drives many hybrid/multi-cloud decisions: GDPR (EU data stays in EU), China's data localization law, India's data protection bill, HIPAA (PHI handling). Map your data classification to deployment model",
    "Cloud bursting from on-premises to public cloud requires: network connectivity (VPN or Direct Connect), identity federation, data synchronization, load balancer integration, and consistent CI/CD pipelines across environments",
    "VMware Cloud on AWS provides a migration path for VMware-based data centers: use HCX for live migration of VMs, then gradually refactor to cloud-native services. It is not a long-term cost optimization strategy"
  ],

  resources: [
    { label: "AWS Hybrid Cloud documentation", kind: "docs", note: "Official guidance on Direct Connect, Outposts, Storage Gateway, and hybrid architectures with reference designs" },
    { label: "Thoughtworks Technology Radar — Multi-Cloud", kind: "article", note: "Industry assessment of multi-cloud strategies: when it makes sense, common pitfalls, and recommended approaches" },
    { label: "AWS re:Invent — Hybrid Cloud Architecture Patterns (ARC307)", kind: "video", note: "Deep dive into hybrid patterns: cloud bursting, data residency, disaster recovery, and edge computing with AWS" },
    { label: "The Cost of Cloud by a]Cloud", kind: "article", note: "Comprehensive TCO analysis comparing public cloud vs private cloud at various scales and utilization levels" },
    { label: "Aviatrix multi-cloud networking platform", kind: "docs", note: "Platform for building and managing cloud networking across AWS, Azure, GCP, and OCI with unified policies" }
  ],

  diagrams: [
    {
      title: "Deployment Strategy Overview",
      kind: "mindmap",
      caption: "The main deployment strategies compared by risk level, downtime, rollback speed, and infrastructure cost.",
      mermaid: `mindmap
  root[Deployment Strategies]
    Recreate
      Stop old then start new
      Simple but has downtime
      Low cost
    Rolling Update
      Replace instances one by one
      No downtime
      Partial versions coexist briefly
    Blue-Green
      Two identical environments
      Instant cutover via DNS or LB
      Fast rollback
      Double infrastructure cost
    Canary
      Route small traffic to new version
      Gradual rollout with monitoring
      Slow rollback if issues found
    Feature Flags
      Code deployed but hidden
      Toggle without deployment
      Runtime control`,
    },
    {
      title: "Blue-Green Deployment Flow",
      kind: "flow",
      caption: "Blue-green deployment: both environments run in parallel, load balancer shifts traffic to green after validation, blue is kept for fast rollback.",
      mermaid: `flowchart TD
    A[Deploy new version to Green env] --> B[Run smoke tests on Green]
    B --> C{Tests pass?}
    C -->|No| D[Abort - Blue still serves traffic]
    C -->|Yes| E[Shift LB to send 100% traffic to Green]
    E --> F[Monitor error rates and latency]
    F --> G{Issues detected?}
    G -->|Yes| H[Flip LB back to Blue - instant rollback]
    G -->|No| I[Green becomes production]
    I --> J[Keep Blue warm for rollback window]
    J --> K[Tear down Blue after confidence period]`,
    },
    {
      title: "Canary Deployment Sequence",
      kind: "sequence",
      caption: "Canary deployment gradually shifts traffic to the new version while monitoring metrics, rolling forward or back based on error rate thresholds.",
      mermaid: `sequenceDiagram
    participant Ops as Operator
    participant LB as Load Balancer
    participant V1 as Version 1 - Stable
    participant V2 as Version 2 - Canary
    participant Mon as Monitoring
    Ops->>LB: Route 5% traffic to V2
    LB->>V2: 5% of requests
    LB->>V1: 95% of requests
    Mon->>Mon: Observe error rate and latency
    Ops->>Mon: Check metrics after 10 min
    Mon-->>Ops: Error rate within threshold
    Ops->>LB: Increase to 25% to V2
    Mon-->>Ops: Still healthy
    Ops->>LB: Increase to 100% to V2
    Ops->>V1: Decommission old version`,
    },
    {
      title: "Hybrid and Multi-Cloud Architecture",
      kind: "architecture",
      caption: "On-premises data center connected to public cloud via dedicated link for hybrid bursting, with a second cloud provider for disaster recovery.",
      mermaid: `graph LR
    subgraph OnPrem ["On-Premises DC"]
        K8S["Kubernetes Cluster"]
        DB["Primary Database"]
    end
    subgraph Cloud1 ["AWS - Primary Cloud"]
        EKS["EKS - Burst Capacity"]
        RDS["Read Replica"]
        S3["Object Storage"]
    end
    subgraph Cloud2 ["GCP - DR Site"]
        GKE["GKE - Disaster Recovery"]
        BQ["Analytics Warehouse"]
    end
    K8S -->|Direct Connect| EKS
    DB -->|Replication| RDS
    DB -->|Async replication| GKE
    EKS --> S3
    S3 -->|Export| BQ`,
    },
  ],

  animations: [
    {
      title: "Hybrid Cloud Bursting During Traffic Spike",
      steps: [
        { label: "Normal operation on-premises", detail: "An e-commerce application runs on an on-premises Kubernetes cluster handling 1,000 requests/second. All services (web, API, database) run locally with 50% resource utilization." },
        { label: "Traffic spike detected", detail: "Holiday sale begins. Monitoring detects request rate climbing to 3,000 req/s. On-premises cluster CPU hits 85%. Horizontal Pod Autoscaler cannot scale further — no remaining node capacity." },
        { label: "Cloud burst initiated", detail: "Kubernetes Federation controller detects on-premises capacity saturation. It schedules new pods on the pre-configured AWS EKS cluster connected via Direct Connect. EKS Karpenter provisions spot nodes within 30 seconds." },
        { label: "Traffic distributed across environments", detail: "DNS-weighted routing (Route 53) shifts 60% of traffic to AWS EKS, 40% stays on-premises. The API tier on AWS reads from a read replica in the same region. Write operations route back to the on-premises primary database via Direct Connect." },
        { label: "Peak load handled", detail: "Combined capacity handles 10,000 req/s. AWS EKS scales to 20 nodes (spot instances). Total cost for the 4-hour burst: ~$150 in spot compute. On-premises infrastructure remains stable at 40% utilization." },
        { label: "Scale down and rebalance", detail: "Traffic subsides to normal levels. EKS pods are drained and terminated. DNS shifts 100% of traffic back to on-premises. EKS cluster scales to zero nodes. Direct Connect link returns to baseline utilization." }
      ]
    }
  ],

  glossary: [
    { term: "Public cloud", definition: "Cloud infrastructure shared across multiple tenants, owned and operated by a third-party provider, accessible via the internet." },
    { term: "Private cloud", definition: "Cloud infrastructure dedicated to a single organization, providing full control over security, compliance, and hardware selection." },
    { term: "Hybrid cloud", definition: "Architecture combining on-premises or private cloud with public cloud services, with data and application orchestration between them." },
    { term: "Multi-cloud", definition: "Strategy of using multiple public cloud providers to avoid lock-in, leverage best-of-breed services, or meet geographic requirements." },
    { term: "Data sovereignty", definition: "Legal principle that data is subject to the laws of the country or jurisdiction where it is physically stored or processed." },
    { term: "Cloud bursting", definition: "Hybrid pattern where workloads run on-premises under normal load and scale into public cloud during demand spikes." },
    { term: "Direct Connect / ExpressRoute", definition: "Dedicated private network links from on-premises to AWS (Direct Connect) or Azure (ExpressRoute), bypassing the public internet." },
    { term: "Community cloud", definition: "Cloud infrastructure shared among organizations with common concerns (compliance, security, jurisdiction), managed by the group or a third party." }
  ]
};
