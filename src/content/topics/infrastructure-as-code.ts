import type { TopicContent } from "../types";

export const infrastructureAsCode: TopicContent = {
  quickSummary: [
    "Infrastructure as Code (IaC) manages servers, networks, and cloud resources through machine-readable definition files rather than manual configuration or interactive tools.",
    "Declarative IaC (Terraform, CloudFormation) describes the desired end state and lets the tool figure out how to reach it; imperative IaC (Pulumi, AWS CDK) uses general-purpose code to describe the steps.",
    "State management is central to IaC: tools maintain a state file that maps declared resources to real infrastructure, enabling accurate diffs, plans, and drift detection.",
    "IaC enables version-controlled, peer-reviewed, repeatable infrastructure changes — the same workflow software engineers already use for application code.",
  ],
  detailed: [
    "## What Is Infrastructure as Code\n\nIaC replaces manual point-and-click provisioning with text files that describe every resource — VPCs, subnets, load balancers, databases, IAM roles. These files live in version control, go through code review, and are applied by automated pipelines. The result is reproducible environments: you can spin up an identical staging copy of production in minutes, and every change is auditable in the Git log.",

    "## Declarative vs Imperative Approaches\n\nDeclarative tools like Terraform and CloudFormation ask *what* the infrastructure should look like. You declare a desired state (e.g., 'three EC2 instances behind an ALB'), and the tool computes the diff between the current state and the desired state, then executes the minimal set of API calls. Imperative tools like Pulumi and AWS CDK let you write infrastructure definitions in TypeScript, Python, or Go, using loops, conditionals, and abstractions. Under the hood Pulumi still produces a desired-state graph, but the authoring experience feels like regular programming.",

    "## Terraform Deep Dive\n\nTerraform uses HashiCorp Configuration Language (HCL). The workflow is `terraform init` (download providers), `terraform plan` (preview changes), and `terraform apply` (execute changes). Resources are grouped into modules for reuse. Providers are plugins that translate HCL into cloud API calls — there are providers for AWS, GCP, Azure, Kubernetes, GitHub, Datadog, and hundreds more. Remote backends (S3 + DynamoDB, Terraform Cloud) store state centrally and provide locking to prevent concurrent modifications.",

    "## State Management and Drift\n\nThe state file is the single source of truth for what Terraform believes exists. When you run `plan`, Terraform refreshes state by querying the cloud APIs, compares it to your config, and shows the delta. If someone changes infrastructure outside Terraform (console click, CLI command), the state drifts. `terraform plan` will detect the drift and propose corrections. Teams should treat the state file as sensitive — it contains resource IDs, IP addresses, and sometimes secrets — and store it in an encrypted remote backend with access controls.",

    "## CloudFormation and AWS CDK\n\nCloudFormation is AWS's native IaC service. You submit a JSON/YAML template, and CloudFormation creates a *stack* — a managed collection of resources. It handles ordering, rollback on failure, and drift detection. The AWS CDK lets you write CloudFormation templates in TypeScript, Python, Java, or C# using high-level constructs. CDK synthesizes your code into a CloudFormation template, so you get the expressiveness of a programming language with the reliability of CloudFormation's deployment engine.",

    "## Best Practices\n\nKeep modules small and composable. Use remote state with locking. Pin provider and module versions. Run `plan` in CI and require approval before `apply`. Separate environments (dev/staging/prod) with workspaces or directory structures. Use policy-as-code tools (OPA, Sentinel, Checkov) to enforce guardrails — no public S3 buckets, no overly broad IAM policies. Tag every resource for cost attribution.",
  ],
  interviewQA: [
    {
      q: "What is the difference between declarative and imperative Infrastructure as Code?",
      a: "Declarative IaC (Terraform, CloudFormation) describes the desired end state and lets the tool compute the necessary changes. Imperative IaC (scripts, some Pulumi patterns) specifies the exact steps to execute. Declarative is generally preferred because it is idempotent — running it twice produces the same result — and the tool handles dependency ordering automatically.",
      followUps: [
        "How does Pulumi blur the line between declarative and imperative?",
        "What are the trade-offs of using a general-purpose language for IaC?",
      ],
    },
    {
      q: "How does Terraform state work, and why is it important?",
      a: "Terraform maintains a JSON state file that records every resource it manages, including cloud-assigned IDs and attributes. On each plan/apply, Terraform compares the desired configuration against this state (and optionally refreshes it from the cloud) to determine what to create, update, or destroy. Without state, Terraform would not know which real resources correspond to which config blocks. The state file must be stored securely (it can contain secrets) and locked during operations to prevent concurrent writes.",
      followUps: [
        "What happens if the state file is lost or corrupted?",
        "How do you import existing resources into Terraform state?",
      ],
    },
    {
      q: "How do you handle secrets in IaC?",
      a: "Never hardcode secrets in IaC files. Instead, reference secrets from a vault (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) using data sources or provider integrations. Mark sensitive outputs with `sensitive = true` in Terraform to prevent them from appearing in logs. Use encrypted remote state backends. In CI/CD, inject secrets as environment variables from the pipeline's secret store rather than committing them to the repository.",
    },
    {
      q: "What is drift detection and how do you handle it?",
      a: "Drift occurs when actual infrastructure diverges from the declared state — someone made a manual change via the console, another tool modified a resource, or an auto-scaling event changed instance counts. Terraform detects drift during `plan` by refreshing state from the cloud. CloudFormation has an explicit drift detection feature. To handle drift, either update the IaC config to match reality (if the change was intentional) or re-apply the IaC to correct the infrastructure back to the declared state.",
    },
  ],
  followUps: [
    "What happens if two engineers apply at the same time?",
    "How do you handle a resource someone changed manually in the console?",
    "Why does the state file need protecting as carefully as a secret?",
    "How do you structure modules so staging can't touch production?",
  ],
  mcqs: [
    {
      q: "Which Terraform command shows the difference between desired and actual infrastructure without making changes?",
      options: ["terraform init", "terraform plan", "terraform apply", "terraform destroy"],
      answerIndex: 1,
      explanation: "`terraform plan` computes and displays the execution plan — what will be created, modified, or destroyed — without actually making any changes.",
    },
    {
      q: "What is the primary purpose of a Terraform state file?",
      options: [
        "To cache provider plugins for offline use",
        "To map declared resources to real cloud resources",
        "To store the HCL source code in a compiled format",
        "To log all previous apply operations",
      ],
      answerIndex: 1,
      explanation: "The state file maintains the mapping between resource blocks in configuration and the actual resources in the cloud, including their IDs and current attributes.",
    },
    {
      q: "Which tool synthesizes general-purpose code into CloudFormation templates?",
      options: ["Terraform", "Pulumi", "AWS CDK", "Ansible"],
      answerIndex: 2,
      explanation: "AWS CDK lets you define infrastructure in TypeScript, Python, Java, or C# and synthesizes it into CloudFormation JSON/YAML templates for deployment.",
    },
    {
      q: "What does idempotency mean in the context of IaC?",
      options: [
        "Resources are created in parallel for speed",
        "Applying the same configuration multiple times produces the same result",
        "The tool automatically rolls back on failure",
        "Infrastructure changes require manual approval",
      ],
      answerIndex: 1,
      explanation: "An idempotent operation produces the same outcome regardless of how many times it is executed. Declarative IaC achieves this by converging toward the desired state rather than blindly executing steps.",
    },
  ],
  flashcards: [
    { front: "What does HCL stand for?", back: "HashiCorp Configuration Language — Terraform's declarative configuration syntax." },
    { front: "What is a Terraform provider?", back: "A plugin that translates HCL resource definitions into API calls for a specific platform (AWS, GCP, Azure, Kubernetes, etc.)." },
    { front: "What is a Terraform module?", back: "A reusable, self-contained package of Terraform configuration files that encapsulates a set of related resources." },
    { front: "What is a CloudFormation stack?", back: "A managed collection of AWS resources created and managed as a single unit from a CloudFormation template." },
    { front: "What is the purpose of terraform init?", back: "Initializes the working directory, downloads required providers and modules, and configures the backend for state storage." },
    { front: "What is a Terraform workspace?", back: "An isolated instance of state within the same configuration, commonly used to manage multiple environments (dev, staging, prod) from one codebase." },
    { front: "What is policy-as-code?", back: "Automated enforcement of organizational rules (no public buckets, required tags) against IaC plans using tools like OPA, Sentinel, or Checkov." },
    { front: "What is remote state locking?", back: "A mechanism (e.g., DynamoDB for S3 backend) that prevents concurrent Terraform operations from corrupting the state file." },
  ],

  deepDive: [
    "## Terraform Internals: The Graph Engine\n\nTerraform builds a **Directed Acyclic Graph (DAG)** of all resources and their dependencies. When you run `terraform plan`, the engine walks this graph to determine the correct order of operations — a security group must exist before the EC2 instance that references it. Terraform parallelizes operations where possible: independent resources are created concurrently, respecting a configurable `-parallelism` flag (default 10). The `terraform graph` command outputs DOT format you can visualize with Graphviz.\n\n**Import and State Surgery:** `terraform import` brings existing resources under management by writing their cloud state into the state file. For bulk imports, `import` blocks (Terraform 1.5+) let you declare imports in HCL. State surgery commands — `terraform state mv`, `terraform state rm` — let you rename, split, or remove resources without destroying real infrastructure. These are powerful but dangerous; always back up state first.\n\n**Provider Development:** Providers are Go binaries using the Terraform Plugin SDK (or the newer Plugin Framework). Each resource type implements CRUD operations. The schema definition specifies attributes, types, defaults, validators, and plan modifiers. Custom providers let you manage anything with an API — internal platforms, SaaS products, DNS providers.",

    "## Multi-Environment Strategies\n\nTeams need to manage dev, staging, and production from the same codebase without duplication.\n\n**Workspaces:** Terraform workspaces create separate state files per environment. Simple but limited — you can only vary by `terraform.workspace` conditionals, and all environments share the same backend configuration.\n\n**Directory-per-environment:** Each environment gets its own directory with a `backend.tf` and `terraform.tfvars`. Modules are shared via relative paths or a registry. More explicit but requires discipline to keep directories in sync.\n\n**Terragrunt:** A thin wrapper that generates backend configs, manages dependencies between modules, and reduces boilerplate. Its `terragrunt.hcl` files compose modules with environment-specific inputs. Popular in large organizations but adds another tool to learn.\n\n**Feature branches for infrastructure:** Use CI/CD to run `terraform plan` on PRs and `terraform apply` on merge to main. Atlantis, Spacelift, and Terraform Cloud automate this workflow with plan comments, policy checks, and approval gates.",

    "## Security and Compliance Automation\n\n**Policy-as-Code** tools enforce guardrails before infrastructure is provisioned:\n- **OPA (Open Policy Agent):** Write policies in Rego against the Terraform plan JSON. Example: deny any `aws_s3_bucket` without `server_side_encryption_configuration`.\n- **Sentinel (HashiCorp):** Embedded in Terraform Cloud/Enterprise. Policies run between `plan` and `apply` with soft/hard mandatory enforcement levels.\n- **Checkov / tfsec:** Static analysis tools that scan HCL files for misconfigurations against CIS benchmarks, OWASP, and custom rules.\n\n**Supply Chain Security:** Pin provider versions in `required_providers`. Use a private registry mirror for air-gapped environments. Sign and verify modules. Audit the `.terraform.lock.hcl` file in version control — it records provider checksums.\n\n**Secrets in State:** The state file contains attribute values in plaintext, including database passwords and API keys passed as resource arguments. Always use encrypted remote backends (S3 with SSE, Terraform Cloud). Consider using `sensitive` variable/output markers and external secret stores (Vault, AWS Secrets Manager) referenced via data sources."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: VPC with public/private subnets and NAT gateway",
      source: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"

  name = "my-app-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true  # Cost optimization for non-prod
  enable_dns_hostnames = true

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "app" {
  name_prefix = "app-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`
    },
    {
      language: "yaml",
      caption: "CloudFormation: S3 bucket with encryption and versioning",
      source: `AWSTemplateFormatVersion: '2010-09-09'
Description: Secure S3 bucket with encryption and versioning

Parameters:
  BucketName:
    Type: String
    Description: Name of the S3 bucket

Resources:
  SecureBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      VersioningConfiguration:
        Status: Enabled
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: aws:kms
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      Tags:
        - Key: ManagedBy
          Value: cloudformation

  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref SecureBucket
      PolicyDocument:
        Statement:
          - Sid: EnforceTLS
            Effect: Deny
            Principal: '*'
            Action: s3:*
            Resource:
              - !GetAtt SecureBucket.Arn
              - !Sub "\${SecureBucket.Arn}/*"
            Condition:
              Bool:
                aws:SecureTransport: false

Outputs:
  BucketArn:
    Value: !GetAtt SecureBucket.Arn`
    },
    {
      language: "typescript",
      caption: "Pulumi: ECS Fargate service with ALB",
      source: `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const cluster = new aws.ecs.Cluster("app-cluster");

const alb = new awsx.lb.ApplicationLoadBalancer("app-lb");

const service = new awsx.ecs.FargateService("app-service", {
  cluster: cluster.arn,
  desiredCount: 2,
  taskDefinitionArgs: {
    container: {
      name: "app",
      image: "my-app:latest",
      cpu: 256,
      memory: 512,
      essential: true,
      portMappings: [{
        containerPort: 8080,
        targetGroup: alb.defaultTargetGroup,
      }],
      environment: [
        { name: "NODE_ENV", value: "production" },
      ],
    },
  },
});

export const url = alb.loadBalancer.dnsName;`
    }
  ],

  comparison: {
    columns: ["Aspect", "Terraform", "CloudFormation", "Pulumi", "AWS CDK"],
    rows: [
      ["Language", "HCL (declarative)", "JSON/YAML (declarative)", "TypeScript, Python, Go, C#", "TypeScript, Python, Java, C#"],
      ["Multi-cloud", "Yes (any provider)", "AWS only", "Yes (any provider)", "AWS only (synthesizes to CFN)"],
      ["State management", "State file (S3, TF Cloud)", "Managed by AWS", "State file (S3, Pulumi Cloud)", "Managed by CloudFormation"],
      ["Drift detection", "On plan/refresh", "Built-in drift detection API", "On preview/refresh", "Via CloudFormation"],
      ["Rollback", "Manual (no auto-rollback)", "Automatic stack rollback", "Manual", "Automatic via CloudFormation"],
      ["Modularity", "Modules (registry)", "Nested stacks, macros", "Components (classes)", "Constructs (L1/L2/L3)"],
      ["Testing", "terraform test, Terratest", "cfn-lint, TaskCat", "Unit tests in any framework", "cdk-assert, Jest"],
      ["Learning curve", "Medium (learn HCL)", "Low (YAML, AWS-native)", "Low (use your language)", "Medium (CDK + CFN concepts)"],
      ["Community", "Largest (any cloud)", "AWS ecosystem", "Growing", "AWS ecosystem"],
      ["Best for", "Multi-cloud, large orgs", "AWS-only shops", "Devs who prefer real code", "AWS shops wanting type safety"],
    ]
  },

  diagrams: [
    {
      title: "IaC Workflow",
      kind: "flow",
      caption: "Infrastructure-as-code workflow from code commit to provisioned resources.",
      mermaid: `flowchart TD
    A[Write IaC config files] --> B[Version control commit]
    B --> C[CI pipeline trigger]
    C --> D[Lint and validate]
    D --> E{Validation pass?}
    E -- No --> A
    E -- Yes --> F[Plan or preview changes]
    F --> G[Review diff output]
    G --> H{Approve changes?}
    H -- No --> A
    H -- Yes --> I[Apply changes]
    I --> J[Provision or update resources]
    J --> K[State file updated]`,
    },
    {
      title: "Terraform State Management",
      kind: "architecture",
      caption: "How Terraform state tracks real infrastructure and enables planning.",
      mermaid: `graph TD
    Code[Terraform .tf files] --> TF[Terraform Core]
    State[State file .tfstate] --> TF
    TF --> Plan[terraform plan shows diff]
    Plan --> Apply[terraform apply]
    Apply --> Provider[Cloud Provider API]
    Provider --> Resources[Real Infrastructure]
    Apply --> State
    subgraph Remote Backend
        RS[S3 or GCS bucket] --> Lock[DynamoDB or GCS lock]
    end
    State --> RS`,
    },
    {
      title: "IaC Tool Comparison",
      kind: "mindmap",
      caption: "Comparing popular infrastructure-as-code tools and their approaches.",
      mermaid: `mindmap
  root((IaC Tools))
    Terraform
      HCL declarative
      Multi-cloud
      State file required
      Large module ecosystem
    Pulumi
      Real code TypeScript Python Go
      Multi-cloud
      No DSL needed
    CloudFormation
      AWS native
      JSON or YAML
      No state file
    Ansible
      Procedural not declarative
      Agentless SSH
      Configuration management
    CDK
      AWS native
      TypeScript Python Java
      Compiles to CloudFormation`,
    },
    {
      title: "Drift Detection and Remediation",
      kind: "sequence",
      caption: "How IaC tools detect and remediate infrastructure configuration drift.",
      mermaid: `sequenceDiagram
    participant Engineer
    participant IaC as IaC Tool
    participant State as State Backend
    participant Cloud as Cloud Provider
    Engineer->>IaC: terraform plan
    IaC->>State: Read desired state
    IaC->>Cloud: Read actual state via API
    IaC->>IaC: Diff desired vs actual
    IaC-->>Engineer: Show drift detected
    Engineer->>IaC: terraform apply
    IaC->>Cloud: Apply changes to fix drift
    Cloud-->>IaC: Resources updated
    IaC->>State: Update state file`,
    },
  ],

  animations: [
    {
      title: "Terraform workflow: from code to cloud",
      steps: [
        { label: "Write HCL", detail: "Define resources in .tf files — VPC, subnets, security groups, EC2 instances. Use modules for reuse." },
        { label: "terraform init", detail: "Download provider plugins (e.g., aws v5.x), initialize the backend, and install modules." },
        { label: "terraform plan", detail: "Terraform builds the resource graph, refreshes state from the cloud, and computes the diff. Output shows + create, ~ update, - destroy." },
        { label: "Code review", detail: "The plan output is posted as a PR comment (via Atlantis/Spacelift). Team reviews the changes and approves." },
        { label: "terraform apply", detail: "Terraform executes the plan — creating, updating, or destroying resources in dependency order with parallelism." },
        { label: "State updated", detail: "The state file is updated with new resource IDs, ARNs, and attributes. Stored in the encrypted remote backend." },
        { label: "Drift monitoring", detail: "Scheduled plans or drift detection tools run periodically to catch manual changes and alert the team." },
      ],
    },
  ],

  exercises: [
    "Create a Terraform module that provisions a VPC with public and private subnets across 3 AZs, a NAT gateway, and outputs the subnet IDs. Use it from a root module with different CIDR blocks for dev and prod.",
    "Write a CloudFormation template that creates an RDS PostgreSQL instance with Multi-AZ, automated backups, and a security group that only allows access from a specified CIDR. Use parameters for instance class and storage.",
    "Set up a Terraform CI/CD pipeline using GitHub Actions: run `terraform fmt -check` and `terraform validate` on PRs, post `terraform plan` output as a PR comment, and run `terraform apply` on merge to main.",
    "Implement a Checkov custom policy that denies any `aws_security_group` with an ingress rule allowing 0.0.0.0/0 on port 22 (SSH). Test it against a deliberately insecure configuration.",
    "Migrate an existing manually-created AWS infrastructure (VPC, 2 EC2 instances, an RDS database) into Terraform using `terraform import`. Write the matching HCL and verify with `terraform plan` that no changes are needed.",
  ],

  cheatSheet: [
    "terraform init → download providers and modules, configure backend",
    "terraform plan → preview changes without applying (safe to run anytime)",
    "terraform apply → execute the plan (creates/updates/destroys resources)",
    "terraform destroy → tear down all managed resources (use with caution)",
    "terraform import aws_instance.foo i-1234567890 → bring existing resource under management",
    "terraform state mv → rename a resource in state without destroying it",
    "terraform workspace new staging → create isolated state for a new environment",
    "Always pin provider versions: required_providers { aws = { version = \"~> 5.0\" } }",
  ],

  revisionNotes: [
    "IaC = version-controlled, peer-reviewed, repeatable infrastructure — treat infra like application code",
    "Declarative (Terraform, CFN) describes WHAT; imperative (scripts) describes HOW — prefer declarative for idempotency",
    "Terraform state is the single source of truth — store it encrypted with locking (S3 + DynamoDB)",
    "Drift = manual changes diverging from declared state — detect with scheduled plans, fix by re-applying",
    "Modules are the unit of reuse — keep them small, versioned, and published to a registry",
    "Policy-as-code (OPA, Sentinel, Checkov) enforces guardrails before apply — shift security left",
    "Never hardcode secrets in IaC — use Vault, Secrets Manager, or data sources",
    "Multi-environment strategies: workspaces (simple), directory-per-env (explicit), Terragrunt (DRY at scale)",
  ],

  resources: [
    { label: "Terraform: Up & Running (Brikman)", kind: "book", note: "The definitive guide to Terraform in production, covering modules, state, testing, and team workflows" },
    { label: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs", kind: "docs", note: "Official docs covering all providers, functions, and configuration language" },
    { label: "AWS CloudFormation User Guide", kind: "docs", note: "Complete reference for CloudFormation templates, intrinsic functions, and stack management" },
    { label: "Infrastructure as Code (Morris)", kind: "book", note: "Principles and patterns for managing infrastructure in the cloud era" },
    { label: "Spacelift Blog: IaC Best Practices", kind: "article", note: "Practical articles on Terraform workflows, testing strategies, and policy enforcement" },
  ],
};
