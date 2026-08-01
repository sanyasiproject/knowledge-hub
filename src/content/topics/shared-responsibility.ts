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

  deepDive: [
    "## Responsibility Shifts Across Service Models\n\n**The shared responsibility boundary shifts** depending on the AWS service model. With **IaaS (EC2)**, the customer is responsible for the guest OS, patching, firewall configuration, application code, and data encryption. AWS manages the hypervisor, physical hardware, and network infrastructure. With **managed services (RDS)**, AWS takes over OS patching, database engine updates, and backup management — but the customer still owns data classification, IAM policies, security group rules, and encryption key management. With **serverless (Lambda, DynamoDB, S3)**, AWS manages nearly everything below the application layer — the customer's responsibility narrows to function code security, IAM permissions, data encryption configuration, and access policies. The critical insight: **moving up the service abstraction stack reduces customer responsibility surface area** but never eliminates the duty to protect data and manage access. Even with a fully managed service, misconfigured S3 bucket policies or overly permissive IAM roles remain customer-side vulnerabilities.",
    "## Compliance and Audit in the Shared Model\n\n**AWS provides compliance artifacts** through **AWS Artifact** — SOC 1/2/3 reports, PCI DSS AOC, HIPAA BAA, ISO 27001 certificates, and FedRAMP packages. These prove AWS meets its infrastructure obligations. **The customer must separately demonstrate** their own compliance for the layers they manage. For **HIPAA**, AWS signs a BAA covering eligible services, but the customer must implement encryption at rest (KMS), encryption in transit (TLS), access logging (CloudTrail), and access controls (IAM). For **PCI DSS**, AWS is a Level 1 service provider, but the customer must segment their cardholder data environment, implement WAF rules, enable VPC Flow Logs, and pass their own PCI audit. **AWS Config** continuously evaluates resource configurations against compliance rules. **AWS Audit Manager** automates evidence collection for frameworks like SOC 2, PCI, and GDPR. **Security Hub** aggregates findings from GuardDuty, Inspector, Macie, and Config into a unified compliance dashboard with automated scoring.",
    "## Operationalizing Shared Responsibility with Preventive and Detective Controls\n\n**Preventive controls** stop non-compliant actions before they occur. **SCPs** deny restricted operations across all accounts (e.g., deny launching instances without encrypted EBS volumes). **IAM permission boundaries** cap what developers can self-provision. **S3 Block Public Access** at the account level prevents any bucket from being made public. **AWS Control Tower guardrails** provide pre-packaged preventive controls for multi-account environments. **Detective controls** identify issues after they occur. **GuardDuty** uses ML to detect threats: cryptocurrency mining, credential compromise, S3 data exfiltration, anomalous API calls. **AWS Config rules** (managed or custom Lambda) continuously evaluate resource compliance — e.g., 'all EBS volumes must be encrypted', 'all S3 buckets must have versioning'. **CloudTrail** logs every API call for forensic analysis. **Amazon Macie** uses ML to discover and classify sensitive data (PII, financial data, credentials) in S3 buckets. The recommended approach is **defense in depth**: combine preventive controls (SCPs, permission boundaries) with detective controls (Config, GuardDuty) and responsive controls (Lambda auto-remediation triggered by EventBridge)."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: AWS Config rules for compliance monitoring",
      source: `resource "aws_config_configuration_recorder" "main" {
  name     = "config-recorder"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_config_rule" "encrypted_volumes" {
  name = "encrypted-volumes"
  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "s3_bucket_versioning" {
  name = "s3-bucket-versioning-enabled"
  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_VERSIONING_ENABLED"
  }
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "root_mfa" {
  name = "root-account-mfa-enabled"
  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCOUNT_MFA_ENABLED"
  }
  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "iam_password_policy" {
  name = "iam-password-policy"
  source {
    owner             = "AWS"
    source_identifier = "IAM_PASSWORD_POLICY"
  }
  input_parameters = jsonencode({
    RequireUppercaseCharacters = "true"
    RequireLowercaseCharacters = "true"
    RequireSymbols             = "true"
    RequireNumbers             = "true"
    MinimumPasswordLength      = "14"
    PasswordReusePrevention    = "24"
    MaxPasswordAge             = "90"
  })
  depends_on = [aws_config_configuration_recorder.main]
}`
    },
    {
      language: "json",
      caption: "SCP: enforce encryption and restrict regions",
      source: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedEBSVolumes",
      "Effect": "Deny",
      "Action": "ec2:CreateVolume",
      "Resource": "*",
      "Condition": {
        "Bool": {
          "ec2:Encrypted": "false"
        }
      }
    },
    {
      "Sid": "DenyNonApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "sts:*",
        "support:*",
        "budgets:*",
        "cloudfront:*",
        "route53:*",
        "waf:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "us-east-1",
            "us-west-2",
            "eu-west-1"
          ]
        }
      }
    },
    {
      "Sid": "DenyLeavingOrganization",
      "Effect": "Deny",
      "Action": "organizations:LeaveOrganization",
      "Resource": "*"
    }
  ]
}`
    },
    {
      language: "bash",
      caption: "AWS CLI: security audit — check customer-side responsibilities",
      source: `# Check for S3 buckets with public access
aws s3api list-buckets --query 'Buckets[].Name' --output text | \\
  tr '\\t' '\\n' | while read bucket; do
    public=$(aws s3api get-public-access-block --bucket "$bucket" 2>/dev/null)
    if [ $? -ne 0 ]; then
      echo "WARNING: No public access block on bucket: $bucket"
    fi
  done

# Find unencrypted EBS volumes
aws ec2 describe-volumes \\
  --filters "Name=encrypted,Values=false" \\
  --query 'Volumes[].{ID:VolumeId,State:State,Size:Size}' \\
  --output table

# Check CloudTrail is enabled in all regions
aws cloudtrail describe-trails \\
  --query 'trailList[].{Name:Name,IsMultiRegion:IsMultiRegionTrail,IsLogging:HasCustomEventSelectors}' \\
  --output table

# Find security groups with 0.0.0.0/0 ingress on sensitive ports
aws ec2 describe-security-groups \\
  --filters "Name=ip-permission.cidr,Values=0.0.0.0/0" \\
  --query 'SecurityGroups[].{ID:GroupId,Name:GroupName,Rules:IpPermissions[?contains(IpRanges[].CidrIp,\`0.0.0.0/0\`)].{Port:FromPort,Proto:IpProtocol}}' \\
  --output json

# Check GuardDuty is enabled
aws guardduty list-detectors --query 'DetectorIds' --output text`
    }
  ],

  comparison: {
    columns: ["Responsibility", "IaaS (EC2)", "PaaS/Managed (RDS, ECS)", "Serverless (Lambda, S3, DynamoDB)"],
    rows: [
      ["Physical security", "AWS", "AWS", "AWS"],
      ["Network infrastructure", "AWS", "AWS", "AWS"],
      ["Hypervisor / host OS", "AWS", "AWS", "AWS"],
      ["Guest OS patching", "Customer", "AWS", "AWS"],
      ["Runtime / engine updates", "Customer", "AWS (managed patching)", "AWS"],
      ["Application code", "Customer", "Customer", "Customer"],
      ["Network configuration (SG, NACL)", "Customer", "Customer (SG only)", "Customer (resource policies)"],
      ["IAM and access management", "Customer", "Customer", "Customer"],
      ["Data encryption (at rest)", "Customer configures", "Customer enables, AWS manages", "Customer enables, AWS manages"],
      ["Data encryption (in transit)", "Customer (TLS setup)", "Customer (enforce SSL)", "Customer (enforce HTTPS)"],
      ["Backup and recovery", "Customer", "AWS automated + customer config", "AWS (built-in durability)"],
      ["Logging and monitoring", "Customer", "Customer (CloudTrail, CloudWatch)", "Customer (CloudTrail, CloudWatch)"],
      ["Compliance validation", "Customer", "Customer", "Customer"]
    ]
  },

  exercises: [
    "Your company is preparing for a SOC 2 Type II audit and runs workloads on EC2, RDS, S3, and Lambda. For each service, create a matrix mapping SOC 2 trust service criteria (Security, Availability, Confidentiality) to specific AWS controls (AWS-side) and customer controls (your side). Identify which AWS Artifact reports you need and what customer evidence you must produce.",
    "A security incident: an S3 bucket containing customer PII was found publicly accessible for 72 hours. Conduct a root cause analysis within the shared responsibility framework. What customer-side controls failed? Design preventive controls (SCPs, S3 Block Public Access, Config rules) and detective controls (Macie, GuardDuty, CloudTrail) to prevent recurrence. Write the specific Config rule and remediation Lambda.",
    "Design a multi-account security architecture using AWS Control Tower for a healthcare company (HIPAA). Specify: OU structure (security, log archive, production, development), mandatory guardrails (SCPs), detective controls (Config conformance packs for HIPAA), centralized logging (CloudTrail organization trail to S3 with Object Lock), and incident response automation with EventBridge and Step Functions.",
    "Compare the customer's security responsibilities when running PostgreSQL on: (1) EC2 instance, (2) RDS, (3) Aurora Serverless. For each deployment model, list exactly what the customer must manage vs what AWS handles for: OS patches, DB engine updates, backup management, encryption, network isolation, connection management, and high availability configuration.",
    "An external auditor asks you to demonstrate that your AWS infrastructure meets CIS AWS Foundations Benchmark v1.5. Identify the top 10 controls that are customer responsibilities (not AWS-managed). For each, specify: the CIS control number, what it requires, the AWS service to implement it (Config rule, CloudTrail, IAM policy, etc.), and how to provide audit evidence."
  ],

  cheatSheet: [
    "**Simple rule**: AWS is responsible for security OF the cloud (infrastructure). Customer is responsible for security IN the cloud (data, access, configuration)",
    "**Service model shift**: IaaS (EC2) = most customer responsibility. Managed (RDS) = shared. Serverless (Lambda) = least customer responsibility. Data protection is ALWAYS the customer's job",
    "**Encryption responsibility**: AWS provides the tools (KMS, ACM, S3 SSE). Customer must ENABLE and CONFIGURE them. Unencrypted data is a customer misconfiguration, not an AWS failure",
    "**Compliance artifacts**: AWS Artifact provides SOC, PCI, ISO, HIPAA reports proving AWS's side. Customer must separately prove their own controls through their own audits",
    "**Network security layers**: VPC, subnets, route tables, NACLs, security groups, WAF, Shield — all customer-configured. AWS provides the building blocks, not the security architecture",
    "**Patch management**: EC2 = customer patches OS and apps. RDS = AWS patches engine (maintenance window). Lambda = AWS patches runtime. Customer always patches their own application code",
    "**Incident response**: AWS handles physical incidents and infrastructure-level attacks. Customer handles application-level incidents, data breaches from misconfiguration, and compromised credentials",
    "**Key AWS security services to know**: GuardDuty (threat detection), Inspector (vulnerability scanning), Macie (data classification), Security Hub (aggregation), Config (compliance), CloudTrail (audit)"
  ],

  revisionNotes: [
    "The shared responsibility model is a framework, not a product. It defines who is accountable for what — and accountability cannot be transferred even when using managed services",
    "AWS manages physical security of data centers, including biometric access, video surveillance, environmental controls, and hardware decommissioning with media destruction (DoD 5220.22-M)",
    "Customer-side data breaches are almost always due to misconfiguration: public S3 buckets, overly permissive security groups, unrotated credentials, or missing encryption — not AWS infrastructure failures",
    "AWS Config records resource configuration history and evaluates compliance rules continuously. Config rules trigger on configuration changes or run periodically. Non-compliant resources can trigger auto-remediation",
    "GuardDuty analyzes VPC Flow Logs, CloudTrail logs, DNS logs, and S3 data events using ML to detect threats. It requires no customer infrastructure — just enable it. Findings go to Security Hub and EventBridge",
    "AWS Control Tower provides a pre-configured multi-account landing zone with mandatory guardrails (SCPs), centralized logging, and account provisioning. It automates many customer-side security responsibilities",
    "For HIPAA: AWS signs a BAA for eligible services. Customer must implement encryption, access controls, audit logging, and data backup on those services. Using a non-eligible service for PHI violates the BAA",
    "The AWS Well-Architected Security Pillar organizes customer responsibilities into 7 areas: identity management, detection, infrastructure protection, data protection, incident response, application security, and security governance"
  ],

  resources: [
    { label: "AWS Shared Responsibility Model documentation", kind: "docs", note: "Official AWS page defining the shared responsibility model with diagrams for each service type" },
    { label: "AWS Security Blog — Automating compliance with AWS Config", kind: "article", note: "Practical guide to implementing continuous compliance monitoring using Config rules and auto-remediation" },
    { label: "AWS re:Invent — Security Best Practices: The Well-Architected Way (SEC205)", kind: "video", note: "Comprehensive walkthrough of security pillar best practices organized by the shared responsibility model" },
    { label: "CIS Amazon Web Services Foundations Benchmark", kind: "docs", note: "Industry-standard security checklist for AWS accounts — covers IAM, logging, monitoring, networking controls" },
    { label: "prowler - AWS Security Assessment Tool GitHub", kind: "repo", note: "Open-source tool that audits 300+ security checks based on CIS, PCI, HIPAA, and GDPR frameworks" }
  ],

  diagrams: [
    {
      title: "Shared Responsibility by Service Type",
      kind: "architecture",
      caption: "Responsibility boundary shifts between IaaS, PaaS, and Serverless service models.",
      mermaid: `graph TD
    subgraph IaaS["IaaS - EC2"]
      AWS1["AWS: Hardware, network, hypervisor"]
      Cust1["Customer: OS, runtime, app, data"]
    end
    subgraph PaaS["PaaS - RDS"]
      AWS2["AWS: Hardware, OS, DB engine, patching"]
      Cust2["Customer: Schema, data, user access"]
    end
    subgraph SaaS["Serverless - Lambda"]
      AWS3["AWS: Hardware, OS, runtime, scaling"]
      Cust3["Customer: Function code and data"]
    end`,
    },
    {
      title: "Defense in Depth Security Controls",
      kind: "flow",
      caption: "Preventive, detective, and responsive controls layered to achieve defense in depth.",
      mermaid: `flowchart TD
    Threat["Threat or Attack"] --> Prev["Preventive Controls\nSCPs, IAM, Security Groups, WAF"]
    Prev -->|bypass| Det["Detective Controls\nGuardDuty, Config, CloudTrail, Macie"]
    Det -->|alert| Resp["Responsive Controls\nEventBridge, Lambda auto-remediation"]
    Resp --> Cont["Contain and Remediate"]
    Cont --> Post["Post-Incident Hardening"]`,
    },
    {
      title: "AWS Security Event Response",
      kind: "sequence",
      caption: "Automated detection and response flow for a security finding in AWS.",
      mermaid: `sequenceDiagram
    participant Act as Attacker
    participant GD as GuardDuty
    participant EB as EventBridge
    participant L as Lambda
    participant SNS as SNS Alert

    Act->>Act: uses compromised credential
    GD->>GD: analyze CloudTrail logs
    GD->>EB: emit finding UnauthorizedAccess
    EB->>L: trigger remediation function
    L->>L: attach deny-all IAM policy
    L->>L: disable access key
    L->>SNS: notify security team
    SNS-->>SNS: alert sent`,
    },
    {
      title: "Shared Responsibility Coverage Map",
      kind: "mindmap",
      caption: "What AWS and the customer each own across IaaS, PaaS, and serverless.",
      mermaid: `mindmap
    root["Shared Responsibility"]
      AWS Always Owns
        Physical data centers
        Global network
        Hypervisor layer
      Customer Always Owns
        Data classification
        IAM and access control
        Application security
      Shifts by Model
        IaaS customer owns OS up
        PaaS customer owns app up
        Serverless customer owns code only`,
    },
  ],

  animations: [
    {
      title: "Security Incident Detection and Response Flow",
      steps: [
        { label: "Suspicious activity occurs", detail: "An IAM access key is used from an unusual IP address to list and download objects from an S3 bucket containing customer data. This is a potential credential compromise." },
        { label: "GuardDuty detects the anomaly", detail: "GuardDuty analyzes CloudTrail logs and flags a finding: 'UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration'. The finding includes the IP, API calls made, and affected resources." },
        { label: "EventBridge triggers automation", detail: "An EventBridge rule matches the GuardDuty finding type and triggers a Step Functions workflow. The workflow runs in parallel: notify the security team via SNS, create a JIRA incident ticket, and begin automated containment." },
        { label: "Automated containment", detail: "A Lambda function attaches a deny-all IAM policy to the compromised user, disables the access key, and captures a snapshot of the IAM user's recent API activity from CloudTrail for forensic analysis." },
        { label: "Investigation and remediation", detail: "The security team reviews CloudTrail logs to determine scope: which S3 objects were accessed, whether data was exfiltrated, and how the credentials were compromised. They check for lateral movement to other services." },
        { label: "Post-incident hardening", detail: "Root cause: access key was committed to a public GitHub repo. Remediation: rotate all keys, enable GitHub secret scanning, implement SCP requiring MFA for sensitive operations, add Config rule detecting keys older than 90 days, update incident response runbook." }
      ]
    }
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
