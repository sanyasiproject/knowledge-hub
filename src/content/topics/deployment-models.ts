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
