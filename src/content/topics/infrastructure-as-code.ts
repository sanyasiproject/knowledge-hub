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
  glossary: [
    { term: "Infrastructure as Code (IaC)", definition: "The practice of managing and provisioning infrastructure through machine-readable configuration files rather than manual processes." },
    { term: "Declarative", definition: "A paradigm where you specify the desired end state and the tool determines the steps to achieve it." },
    { term: "Imperative", definition: "A paradigm where you specify the exact sequence of operations to perform." },
    { term: "State file", definition: "A record maintained by IaC tools that maps declared resources to their real-world counterparts and attributes." },
    { term: "Drift", definition: "The divergence between the infrastructure's actual state and the state declared in IaC configuration files." },
    { term: "Provider", definition: "A Terraform plugin responsible for understanding API interactions with a specific infrastructure platform." },
    { term: "Idempotent", definition: "An operation that produces the same result whether executed once or multiple times." },
    { term: "Plan", definition: "A preview of changes an IaC tool will make, showing resources to be created, updated, or destroyed." },
  ],
};
