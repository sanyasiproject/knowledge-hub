import type { TopicContent } from "../types";

export const sharedResponsibility: TopicContent = {
  quickSummary: [
    "The shared responsibility model divides security obligations between the cloud provider and the customer. The provider secures the infrastructure ('security OF the cloud'), while the customer secures their workloads, data, and configurations ('security IN the cloud').",
    "In IaaS, the customer manages OS patching, firewall rules, application security, and data encryption. In PaaS, the provider additionally handles the OS and runtime. In SaaS, the provider manages nearly everything — the customer handles identity, access control, and data classification.",
    "Most cloud security breaches result from customer misconfiguration — public S3 buckets, overly permissive IAM policies, unencrypted data, exposed credentials — not from provider infrastructure failures.",
    "Compliance frameworks (SOC 2, HIPAA, PCI-DSS, ISO 27001) require demonstrating security controls at every stack layer. The provider's certifications cover their layers, but customers must independently certify their own controls."
  ],

  detailed: [
    "## The Model Explained\n\nEvery cloud provider publishes a shared responsibility model that clarifies which security layers they manage versus which the customer must manage. AWS phrases it as 'security OF the cloud' (provider) vs. 'security IN the cloud' (customer).\n\n**Provider responsibilities (consistent across all service models):**\n- Physical data center security (biometrics, surveillance, access controls)\n- Hardware lifecycle management (procurement, patching, decommissioning, destruction)\n- Network backbone and edge infrastructure\n- Hypervisor security and isolation between tenants\n- Global infrastructure availability and redundancy\n\n**The dividing line shifts based on service model:**\n- **IaaS:** Provider manages through the hypervisor; customer manages OS, middleware, application, data\n- **PaaS:** Provider manages through the runtime; customer manages application code and data\n- **SaaS:** Provider manages nearly everything; customer manages user access, data classification, and some configuration\n\nThe model is not binary — some layers are shared. Network security, for example, is shared in IaaS: the provider secures the physical network and provides tools (security groups, NACLs), but the customer must configure them correctly.",

    "## Customer Responsibilities by Layer\n\n### Identity and Access Management\n- Enforce least-privilege access with role-based controls\n- Enable multi-factor authentication (MFA) for all human users\n- Rotate credentials regularly; use temporary credentials (STS) over long-lived keys\n- Implement strong password policies and federation with corporate identity providers\n- Review and audit permissions regularly; remove unused accounts\n\n### Data Protection\n- Classify data by sensitivity (public, internal, confidential, restricted)\n- Encrypt data at rest using provider-managed or customer-managed keys (KMS)\n- Encrypt data in transit using TLS 1.2+ for all communications\n- Implement backup and disaster recovery strategies with tested restore procedures\n- Apply data retention and deletion policies consistent with regulatory requirements\n\n### Application Security\n- Secure application code against OWASP Top 10 vulnerabilities\n- Implement input validation, output encoding, and proper error handling\n- Use Web Application Firewalls (WAF) for internet-facing applications\n- Perform regular security testing (SAST, DAST, penetration testing)\n- Manage application dependencies and patch known vulnerabilities\n\n### Network Security (IaaS/PaaS)\n- Configure security groups and NACLs to restrict traffic to minimum required\n- Use private subnets for backend resources; only expose load balancers publicly\n- Implement VPC flow logs and network monitoring\n- Use VPN or private connectivity for sensitive data transfers\n- Segment networks by workload sensitivity",

    "## Provider Responsibilities\n\nCloud providers invest billions in infrastructure security that would be impractical for individual organizations to replicate.\n\n### Physical Security\n- Data centers with multiple layers of physical access controls\n- 24/7 monitoring with security personnel, CCTV, intrusion detection\n- Environmental controls: fire suppression, climate management, power redundancy\n- Media destruction: storage devices are cryptographically wiped and physically destroyed\n\n### Infrastructure Security\n- Custom hardware with hardware root of trust (e.g., AWS Nitro, Google Titan)\n- Hypervisor hardening and tenant isolation\n- Network infrastructure with DDoS mitigation at the backbone level\n- Continuous patching of infrastructure components without customer downtime\n- Compliance certifications maintained for the infrastructure layer (SOC 2, ISO 27001, FedRAMP)\n\n### Managed Service Security (PaaS/SaaS layers)\n- OS and runtime patching for managed services (RDS, Lambda, S3)\n- Automatic encryption at rest for many services by default\n- Built-in monitoring and anomaly detection\n- High availability and automatic failover for managed services\n- Regular security assessments and penetration testing of the platform",

    "## Compliance Implications\n\nCompliance in the cloud is a layered responsibility. Using a certified provider does NOT make your application compliant.\n\n**How it works:**\n- Providers obtain certifications (SOC 2 Type II, ISO 27001, HIPAA eligibility, PCI-DSS) that cover THEIR layers\n- These certifications prove the provider's infrastructure meets the standard's requirements\n- Customers must independently demonstrate compliance for THEIR layers\n- Auditors will evaluate both the provider's attestation reports and the customer's controls\n\n**Common compliance frameworks:**\n- **SOC 2:** Controls for security, availability, processing integrity, confidentiality, and privacy\n- **HIPAA:** US healthcare data protection — requires Business Associate Agreements (BAA) with providers\n- **PCI-DSS:** Payment card data security — strict network segmentation, encryption, and access controls\n- **ISO 27001:** Information security management system with risk-based approach\n- **GDPR:** EU data protection — data processing agreements, privacy by design, breach notification\n\n**Key compliance pitfalls:**\n- Assuming the provider's certification covers your application\n- Failing to encrypt data that regulations require to be encrypted\n- Inadequate logging and audit trails for regulated data access\n- Not having a tested incident response plan for cloud environments\n- Storing regulated data in non-compliant regions",

    "## Common Misconfigurations and Breaches\n\nThe vast majority of cloud security incidents stem from customer-side misconfigurations, not provider failures.\n\n**Top misconfiguration categories:**\n\n1. **Public storage buckets:** S3 buckets, Azure Blob containers, or GCS buckets left publicly accessible — responsible for numerous high-profile data leaks\n2. **Overly permissive IAM:** Policies granting `*` permissions, unused admin accounts, long-lived access keys without rotation\n3. **Unencrypted data:** Sensitive data stored without encryption at rest, or transmitted without TLS\n4. **Exposed credentials:** API keys, database passwords, or tokens committed to source code repositories or embedded in application configs\n5. **Missing network controls:** Databases directly accessible from the internet, security groups allowing 0.0.0.0/0 on sensitive ports\n6. **Disabled logging:** CloudTrail, VPC flow logs, or access logging turned off — eliminating audit trails\n\n**Prevention strategies:**\n- Enable cloud security posture management (CSPM) tools: AWS Security Hub, Azure Defender, GCP Security Command Center\n- Implement infrastructure-as-code with security policies enforced in CI/CD pipelines\n- Use AWS Config rules, Azure Policy, or GCP Organization Policy to detect and remediate drift\n- Conduct regular cloud security assessments and tabletop exercises\n- Enable GuardDuty / Sentinel / Security Command Center for threat detection",

    "## Operationalizing Shared Responsibility\n\nMoving from understanding the model to implementing it requires organizational structure and tooling.\n\n**Cloud Security Governance:**\n- Establish a cloud center of excellence (CCoE) or cloud security team\n- Define security baselines and guardrails for each service model\n- Create landing zones with pre-configured security controls for new accounts/projects\n- Implement tagging standards for resource ownership and cost allocation\n\n**Tooling layers:**\n- **Preventive:** Service control policies (SCPs), permission boundaries, network ACLs, resource policies\n- **Detective:** CloudTrail, Config, GuardDuty, Security Hub, SIEM integration\n- **Responsive:** Lambda-based auto-remediation, incident response playbooks, automated ticketing\n\n**Security as Code:**\n- Define infrastructure with Terraform/CloudFormation including security controls\n- Use policy-as-code tools (OPA, Sentinel, Checkov) to validate configurations before deployment\n- Automate security scanning in CI/CD pipelines\n- Version control all security policies and review changes through pull requests"
  ],

  interviewQA: [
    {
      q: "Explain the shared responsibility model in cloud computing.",
      a: "The shared responsibility model divides security between the provider and customer. The provider secures the physical infrastructure, hypervisor, and network backbone — 'security of the cloud.' The customer secures their data, applications, identity management, and configurations — 'security in the cloud.' The dividing line shifts by service model: in IaaS you manage the OS up; in PaaS the provider additionally manages the OS and runtime; in SaaS the provider manages nearly everything except user access and data classification. Most cloud breaches are customer misconfigurations, not provider failures.",
      followUps: ["Can you give examples of customer-side misconfigurations?", "How does this affect compliance audits?"]
    },
    {
      q: "If your company uses AWS RDS (a managed database), what is your security responsibility vs. AWS's?",
      a: "AWS manages the underlying infrastructure: physical servers, OS patching, database engine patching (on your maintenance window), storage encryption infrastructure, and automated backups/replication. The customer is responsible for: configuring the database to not be publicly accessible, managing security group rules to restrict network access, setting strong master passwords and rotating them, enabling encryption at rest (choosing KMS keys), managing database users and privileges within the database, configuring backup retention and testing restore procedures, enabling audit logging, and ensuring data stored complies with regulatory requirements.",
      followUps: ["What about encryption key management?", "How do you handle RDS in a HIPAA-compliant environment?"]
    },
    {
      q: "How do you ensure compliance in a cloud environment using the shared responsibility model?",
      a: "First, understand which compliance frameworks apply to your data and workloads. Second, leverage the provider's compliance certifications — request their SOC 2 report or ISO 27001 certificate to cover the infrastructure layers. Third, implement your own controls for the layers you manage: encrypt data per regulatory requirements, enforce access controls with IAM and MFA, enable comprehensive logging and audit trails, and configure network segmentation. Fourth, use cloud-native compliance tools (AWS Config, Security Hub) to continuously monitor for drift. Fifth, document everything for auditors — the provider's attestation covers their layers, but you need evidence for yours. Finally, conduct regular assessments and penetration tests on your applications.",
      followUps: ["What is a SOC 2 Type II report?", "How do you handle a compliance audit for cloud workloads?"]
    },
    {
      q: "What are the most common cloud security mistakes companies make?",
      a: "The most frequent mistakes are: (1) Leaving storage buckets publicly accessible — responsible for many high-profile breaches. (2) Overly permissive IAM policies, especially using wildcard permissions or not enforcing MFA. (3) Hardcoding credentials in source code or environment variables without secrets management. (4) Not encrypting sensitive data at rest or in transit. (5) Disabling logging services to save costs, eliminating audit trails. (6) Not restricting network access — databases or admin interfaces accessible from the internet. (7) Assuming the provider's compliance certifications cover the customer's application layer. Prevention requires a combination of preventive controls (SCPs, guardrails), detective controls (CSPM, GuardDuty), and organizational discipline (security reviews, training)."
    }
  ],

  mcqs: [
    {
      q: "In the AWS shared responsibility model, who is responsible for patching the operating system on an EC2 instance?",
      options: ["AWS", "The customer", "Shared equally", "Depends on the support plan"],
      answerIndex: 1,
      explanation: "EC2 is IaaS — AWS manages the hypervisor and below; the customer manages the guest OS, including patching, security configuration, and software updates."
    },
    {
      q: "Which of the following is ALWAYS the customer's responsibility regardless of service model?",
      options: ["OS patching", "Physical security", "Data classification and governance", "Runtime updates"],
      answerIndex: 2,
      explanation: "Regardless of whether you use IaaS, PaaS, or SaaS, the customer is always responsible for classifying their data and managing access to it. OS patching is customer responsibility only in IaaS."
    },
    {
      q: "A company's S3 bucket was found publicly accessible, exposing customer data. Under the shared responsibility model, who is at fault?",
      options: ["AWS, because they host the data", "The customer, because bucket access is a customer configuration", "Both equally", "Neither — it is a design flaw in S3"],
      answerIndex: 1,
      explanation: "S3 bucket access policies are a customer configuration responsibility. AWS provides the tools (bucket policies, ACLs, Block Public Access) but the customer must configure them correctly."
    },
    {
      q: "Which compliance framework specifically requires a Business Associate Agreement (BAA) with cloud providers?",
      options: ["PCI-DSS", "SOC 2", "HIPAA", "ISO 27001"],
      answerIndex: 2,
      explanation: "HIPAA requires covered entities to sign a BAA with any business associate (including cloud providers) that handles protected health information (PHI)."
    },
    {
      q: "For AWS Lambda (serverless), which is NOT the customer's responsibility?",
      options: ["Function code security", "IAM execution role permissions", "Operating system patching", "Data encryption within the function"],
      answerIndex: 2,
      explanation: "Lambda is a managed serverless service — AWS manages the underlying OS, runtime patching, and infrastructure. The customer manages function code, IAM roles, and data handling."
    }
  ],

  flashcards: [
    { front: "Security OF the cloud", back: "Provider responsibility: physical security, hardware, hypervisor, network backbone, global infrastructure. The provider ensures the infrastructure itself is secure." },
    { front: "Security IN the cloud", back: "Customer responsibility: data, applications, IAM, network configuration, encryption, OS patching (IaaS). How you use the cloud determines your security posture." },
    { front: "Shared controls", back: "Some controls are managed by both parties: patch management (provider for infrastructure, customer for OS/apps), configuration management, and awareness/training." },
    { front: "CSPM", back: "Cloud Security Posture Management — tools that continuously monitor cloud configurations for security risks and compliance violations. Examples: AWS Security Hub, Azure Defender, Prisma Cloud." },
    { front: "SOC 2 Type II", back: "Audit report that evaluates a service organization's controls over a period of time (typically 6-12 months) for security, availability, processing integrity, confidentiality, and privacy." },
    { front: "Guardrails vs. Guidelines", back: "Guardrails are enforced preventive controls (SCPs, permission boundaries) that prevent violations. Guidelines are advisory recommendations. Cloud security requires guardrails, not just guidelines." },
    { front: "Inherited controls", back: "Controls that a customer fully inherits from the provider — physical security, environmental controls. These appear in compliance documentation as 'provider-managed controls.'" },
    { front: "Customer-specific controls", back: "Controls solely the customer's responsibility — data classification, application security, user access management. These must be implemented and evidenced independently." }
  ],

  glossary: [
    { term: "Shared responsibility model", definition: "Framework dividing security and compliance obligations between the cloud provider (infrastructure) and customer (workloads, data, configuration)." },
    { term: "CSPM", definition: "Cloud Security Posture Management — automated tools that detect misconfigurations, compliance violations, and security risks in cloud environments." },
    { term: "SOC 2", definition: "Service Organization Control 2 — audit framework evaluating controls for security, availability, processing integrity, confidentiality, and privacy." },
    { term: "BAA", definition: "Business Associate Agreement — HIPAA-required contract between a covered entity and any service provider handling protected health information." },
    { term: "SCP", definition: "Service Control Policy — AWS Organizations policy that sets permission guardrails across accounts, restricting what actions any principal can perform." },
    { term: "Guardrail", definition: "Preventive control that automatically blocks non-compliant actions, as opposed to detective controls that alert after the fact." },
    { term: "Landing zone", definition: "Pre-configured, secure multi-account environment with baseline security controls, networking, and governance ready for workload deployment." },
    { term: "Policy-as-code", definition: "Practice of defining and enforcing security and compliance policies through code (OPA, Sentinel, Checkov) that can be version-controlled and tested." }
  ]
};
