import type { TopicContent } from "../types";

export const cloudCost: TopicContent = {
  quickSummary: [
    "FinOps (Cloud Financial Operations) is the practice of bringing financial accountability to cloud spending through collaboration between engineering, finance, and business teams. The goal is to maximize business value per dollar spent, not simply minimize cost.",
    "Reserved Instances (RIs) and Savings Plans offer 30-72% discounts over on-demand pricing in exchange for 1- or 3-year commitments. They are ideal for steady-state workloads with predictable demand.",
    "Spot/preemptible instances provide 60-90% discounts but can be interrupted with short notice (2 minutes on AWS). Best for fault-tolerant, stateless workloads like batch processing, CI/CD, and distributed computing.",
    "Right-sizing means matching instance types and sizes to actual workload requirements. Studies consistently show 30-40% of cloud resources are idle or significantly underutilized.",
    "Cost allocation tags, budgets, and alerts are essential governance tools. Without proper tagging, organizations cannot attribute costs to teams, projects, or products — making optimization impossible."
  ],

  detailed: [
    "## FinOps Framework\n\nFinOps is a cultural practice and operational framework for managing cloud costs. It operates in three phases: Inform, Optimize, and Operate.\n\n**Inform phase:**\n- Establish visibility into cloud spending with dashboards and reports\n- Implement cost allocation tagging strategies\n- Create showback or chargeback models to attribute costs to business units\n- Understand pricing models and billing mechanics for each service\n\n**Optimize phase:**\n- Right-size instances based on utilization data\n- Purchase reserved capacity for steady-state workloads\n- Use spot/preemptible instances for interruptible workloads\n- Eliminate waste: unused resources, orphaned volumes, idle load balancers\n- Optimize storage tiers and data transfer patterns\n\n**Operate phase:**\n- Automate cost governance with budgets, alerts, and policies\n- Integrate cost awareness into engineering workflows (CI/CD cost checks)\n- Establish FinOps team or embed cost responsibility into engineering teams\n- Continuously iterate on optimization as workloads evolve\n\n**Key FinOps principles:**\n- Teams need to own their cloud costs\n- Decisions are driven by business value, not just cost reduction\n- Cloud cost management is an ongoing practice, not a one-time project\n- Everyone takes advantage of the variable cost model of cloud",

    "## Reserved Instances and Savings Plans\n\nCommitment-based discounts are the single largest cost optimization lever for most organizations.\n\n**AWS Reserved Instances:**\n- Standard RIs: 1 or 3 year commitment, up to 72% discount, limited flexibility to change instance attributes\n- Convertible RIs: up to 54% discount, can change instance family, OS, tenancy during the term\n- Payment options: All Upfront (biggest discount), Partial Upfront, No Upfront\n- Apply to specific instance types in specific regions (Standard) or are more flexible (Convertible)\n\n**AWS Savings Plans:**\n- Compute Savings Plans: up to 66% discount, apply across EC2, Fargate, and Lambda regardless of region, instance family, or OS\n- EC2 Instance Savings Plans: up to 72% discount, locked to a specific instance family and region\n- Commit to a consistent amount of compute usage (measured in $/hour)\n- More flexible than RIs — generally recommended over Standard RIs for new commitments\n\n**Azure Reservations and GCP CUDs:**\n- Azure Reserved VM Instances: similar to AWS RIs, 1 or 3 year terms, up to 72% discount\n- GCP Committed Use Discounts (CUDs): commit to a minimum amount of resources, up to 57% discount\n- GCP Sustained Use Discounts: automatic discounts (up to 30%) for resources running more than 25% of the month\n\n**Best practices:**\n- Analyze at least 30-60 days of utilization before committing\n- Start with Convertible RIs or Compute Savings Plans for flexibility\n- Cover only your steady-state baseline — use on-demand and spot for variable load\n- Review and adjust reservations quarterly as workloads change",

    "## Spot and Preemptible Instances\n\nSpot instances (AWS) / preemptible VMs (GCP) / spot VMs (Azure) offer massive discounts for compute capacity that the provider can reclaim.\n\n**AWS Spot Instances:**\n- 60-90% discount over on-demand\n- 2-minute interruption notice via instance metadata or CloudWatch Events\n- Spot Fleet: request a pool of instances across multiple types and AZs to maximize availability\n- Spot placement scores help predict availability in specific configurations\n\n**Key patterns for spot usage:**\n- **Batch processing:** MapReduce, data pipelines, video encoding — checkpointable and restartable\n- **CI/CD:** Build and test runners — short-lived, stateless, easily replaceable\n- **Containers:** ECS/EKS with spot instances for non-critical services; graceful draining on interruption\n- **Big data:** EMR, Spark clusters with spot workers and on-demand master nodes\n- **Web tier:** Auto Scaling groups mixing on-demand (baseline) with spot (variable capacity)\n\n**Strategies to maximize spot reliability:**\n- Diversify across multiple instance types and availability zones\n- Use capacity-optimized allocation strategy (AWS selects pools with most available capacity)\n- Implement graceful shutdown handlers that checkpoint state on interruption\n- Mix spot with on-demand in Auto Scaling groups (e.g., 70% spot, 30% on-demand baseline)\n- Use Spot Fleet or EC2 Fleet for automated capacity management",

    "## Right-Sizing and Waste Elimination\n\nRight-sizing is the process of matching instance types and sizes to actual workload requirements. It is consistently the highest-ROI optimization activity.\n\n**Common waste patterns:**\n- Instances running at 5-15% average CPU utilization — oversized by 2-4x\n- Development and staging environments running 24/7 but only used during business hours\n- Orphaned EBS volumes from terminated instances (still incurring storage charges)\n- Idle Elastic IPs, unused load balancers, and empty S3 buckets with request charges\n- Over-provisioned RDS instances that could use smaller instance types or Aurora Serverless\n\n**Right-sizing process:**\n1. Collect utilization metrics for at least 2 weeks (CPU, memory, network, disk I/O)\n2. Identify instances consistently below 40% utilization on primary metrics\n3. Recommend downsizing (e.g., m5.xlarge to m5.large) or switching families (compute-optimized vs. general-purpose)\n4. Test in staging, then apply to production with rollback plan\n5. Repeat quarterly — workloads change over time\n\n**Tools:**\n- AWS Compute Optimizer: ML-based recommendations for EC2, EBS, Lambda\n- AWS Cost Explorer right-sizing recommendations\n- Azure Advisor recommendations\n- GCP Recommender for VM right-sizing\n- Third-party: Spot.io, CloudHealth, Apptio Cloudability\n\n**Scheduling non-production environments:**\n- Shut down dev/test instances outside business hours (save 65% on those resources)\n- Use AWS Instance Scheduler, Azure Automation, or custom Lambda functions\n- Tag environments with schedules and automate start/stop cycles",

    "## Cost Allocation, Tagging, and Budgets\n\nWithout proper cost attribution, optimization is impossible because you cannot identify who owns what or measure improvement.\n\n**Tagging strategy:**\n- Define mandatory tags enforced via AWS Tag Policies, Azure Policy, or GCP Organization Policy\n- Common tags: `Environment` (prod/staging/dev), `Team`, `Project`, `CostCenter`, `Owner`, `Application`\n- Enforce tagging in CI/CD pipelines — reject infrastructure deployments missing required tags\n- Use AWS Cost Allocation Tags (activated in Billing Console) to make tags visible in cost reports\n\n**Showback vs. Chargeback:**\n- Showback: report costs to teams for awareness without actual financial charge — good starting point\n- Chargeback: allocate actual cloud costs to team or department budgets — drives stronger accountability\n- Shared costs (networking, security tools, platform teams) need a fair allocation model\n\n**Budgets and alerts:**\n- Set budgets per account, team, or project using AWS Budgets, Azure Cost Management, or GCP Budget Alerts\n- Configure alerts at 50%, 80%, and 100% of budget with notifications to team owners\n- Use anomaly detection (AWS Cost Anomaly Detection) to catch unexpected spending spikes\n- Implement automated responses: alert, then throttle, then terminate if spending exceeds thresholds\n\n**Unit economics:**\n- Track cost per transaction, cost per user, or cost per request — not just total spend\n- This connects cloud spending to business metrics and reveals whether growth is efficient\n- Example: if cost per API call is rising while traffic is flat, something is wrong"
  ],

  interviewQA: [
    {
      q: "How would you reduce AWS costs by 30% for an organization spending $500K/month?",
      a: "I would take a phased approach: (1) Quick wins: identify and terminate unused resources — orphaned EBS volumes, idle load balancers, unattached Elastic IPs, stopped instances with attached storage. (2) Right-size instances using AWS Compute Optimizer data — look for instances below 40% CPU and memory utilization. (3) Purchase Savings Plans or Reserved Instances for steady-state workloads, covering roughly 70% of baseline compute. (4) Implement spot instances for fault-tolerant workloads like batch processing and CI/CD. (5) Schedule non-production environments to shut down outside business hours. (6) Optimize storage by implementing S3 lifecycle policies and moving infrequently accessed data to cheaper tiers. Each step typically yields 5-15% savings, and combined they can easily reach 30%.",
      followUps: ["How do you decide between Savings Plans and Reserved Instances?", "How do you handle resistance from engineering teams?"]
    },
    {
      q: "What is FinOps and why does it matter?",
      a: "FinOps is the practice of bringing financial accountability to cloud spending through collaboration between engineering, finance, and business teams. It matters because cloud spending is variable and decentralized — any engineer can spin up resources. Without FinOps, organizations typically waste 30-40% of their cloud budget on idle or oversized resources. The framework operates in three phases: Inform (visibility and allocation), Optimize (right-sizing, reservations, spot), and Operate (governance, automation, continuous improvement). The key cultural shift is making engineering teams accountable for their cloud costs while giving them the tools and data to optimize effectively.",
      followUps: ["How do you implement chargeback for shared services?", "What FinOps tools do you recommend?"]
    },
    {
      q: "When would you use spot instances vs. reserved instances?",
      a: "Reserved instances are for predictable, steady-state workloads that run continuously — production databases, baseline web tier capacity, core application servers. You commit to 1-3 years and get 30-72% discounts. Spot instances are for fault-tolerant, interruptible workloads — batch processing, CI/CD pipelines, big data analytics, stateless containerized services. You get 60-90% discounts but instances can be reclaimed with 2 minutes notice. Many architectures use both: reserved for the baseline, spot for variable capacity. The decision framework is: Can this workload handle interruption? If yes, spot. Is this workload running 24/7 for at least a year? If yes, reserved. Otherwise, on-demand.",
      followUps: ["How do you handle spot interruptions gracefully?", "What about Savings Plans vs. RIs?"]
    },
    {
      q: "How do you implement a cost allocation tagging strategy?",
      a: "Start by defining 5-8 mandatory tags aligned with business structure: Environment, Team/Owner, Project, CostCenter, and Application at minimum. Enforce these through AWS Tag Policies at the organization level and in CI/CD pipelines — reject Terraform plans or CloudFormation stacks missing required tags. Activate cost allocation tags in the billing console so they appear in Cost Explorer. Build dashboards showing spend by team and project. For untagged resources, use AWS Resource Groups Tag Editor for bulk tagging. Track tagging compliance as a metric and assign ownership for untagged resources. The key is enforcement — voluntary tagging never achieves more than 60-70% coverage."
    }
  ],

  mcqs: [
    {
      q: "Which AWS purchasing option provides the largest discount for compute?",
      options: ["On-demand", "Spot instances", "3-year All Upfront Reserved Instances", "Savings Plans"],
      answerIndex: 1,
      explanation: "Spot instances offer up to 90% discount, the largest available, though they can be interrupted. 3-year All Upfront RIs offer up to 72%. The trade-off is reliability vs. cost."
    },
    {
      q: "What is the recommended approach for covering steady-state compute costs?",
      options: [
        "100% on-demand for maximum flexibility",
        "100% reserved instances for maximum savings",
        "Mix of reserved/savings plans for baseline and on-demand/spot for variable load",
        "100% spot instances with auto-restart on interruption"
      ],
      answerIndex: 2,
      explanation: "Best practice is covering your predictable baseline with commitments (RIs or Savings Plans) and using on-demand or spot for variable workloads. 100% of any single type leaves money on the table or adds unacceptable risk."
    },
    {
      q: "Which is NOT a FinOps phase?",
      options: ["Inform", "Optimize", "Operate", "Migrate"],
      answerIndex: 3,
      explanation: "The three FinOps phases are Inform (visibility), Optimize (take action on savings), and Operate (governance and continuous improvement). Migration is not part of the FinOps framework."
    },
    {
      q: "AWS Compute Optimizer primarily helps with:",
      options: ["Purchasing reserved instances", "Right-sizing EC2 instances based on utilization", "Negotiating enterprise discounts", "Selecting the cheapest AWS region"],
      answerIndex: 1,
      explanation: "AWS Compute Optimizer uses machine learning to analyze utilization metrics and recommend optimal instance types and sizes, helping organizations right-size their compute resources."
    },
    {
      q: "What is the main difference between showback and chargeback?",
      options: [
        "Showback is real-time; chargeback is monthly",
        "Showback reports costs for awareness; chargeback allocates costs to team budgets",
        "Showback is for AWS; chargeback is for Azure",
        "Showback uses tags; chargeback uses accounts"
      ],
      answerIndex: 1,
      explanation: "Showback provides visibility by reporting costs to teams without financial impact. Chargeback actually allocates cloud costs to department or team budgets, creating stronger financial accountability."
    }
  ],

  flashcards: [
    { front: "FinOps", back: "Cloud Financial Operations — practice of bringing financial accountability to cloud spending through Inform, Optimize, and Operate phases. Collaboration between engineering, finance, and business." },
    { front: "Reserved Instances (RIs)", back: "1 or 3-year capacity commitments offering 30-72% discounts. Standard RIs are locked to instance type/region; Convertible RIs allow changes. Best for steady-state workloads." },
    { front: "Savings Plans", back: "AWS flexible commitment model — commit to $/hour of compute. Compute Savings Plans apply across EC2, Fargate, and Lambda. Generally preferred over Standard RIs for new commitments." },
    { front: "Spot Instances", back: "Spare cloud capacity at 60-90% discount, reclaimable with 2-minute notice. Ideal for batch processing, CI/CD, stateless containers. Diversify across instance types and AZs for reliability." },
    { front: "Right-sizing", back: "Matching instance types and sizes to actual utilization. Target instances below 40% CPU/memory. Use Compute Optimizer, review quarterly. Typically saves 20-30%." },
    { front: "Cost allocation tags", back: "Metadata labels (Environment, Team, Project, CostCenter) attached to cloud resources for cost attribution. Must be enforced via policies and CI/CD; voluntary tagging achieves low coverage." },
    { front: "Showback vs. Chargeback", back: "Showback: report costs to teams for awareness. Chargeback: allocate actual costs to team budgets. Chargeback drives stronger accountability but requires fair shared-cost allocation." },
    { front: "Unit economics", back: "Tracking cost per business transaction (per user, per API call, per order) rather than total spend. Connects cloud costs to business value and reveals efficiency trends." }
  ],

  glossary: [
    { term: "FinOps", definition: "Cloud Financial Operations — framework for managing cloud costs through collaboration, visibility, optimization, and governance." },
    { term: "Reserved Instance", definition: "Capacity commitment (1 or 3 years) to a specific instance configuration in exchange for significant discounts over on-demand pricing." },
    { term: "Savings Plan", definition: "AWS flexible commitment model where you commit to a consistent compute spend ($/hour) in exchange for discounts across EC2, Fargate, and Lambda." },
    { term: "Spot instance", definition: "Spare cloud compute capacity offered at steep discounts (60-90%) that can be reclaimed by the provider with short notice." },
    { term: "Right-sizing", definition: "The process of adjusting cloud resource types and sizes to match actual workload requirements, eliminating over-provisioning." },
    { term: "Cost allocation tag", definition: "Metadata label applied to cloud resources to categorize spending by team, project, environment, or cost center." },
    { term: "Chargeback", definition: "Financial model that allocates actual cloud costs to the teams or departments that consumed them, creating direct budget accountability." },
    { term: "Cloud waste", definition: "Cloud spending on resources that deliver no business value — idle instances, orphaned volumes, over-provisioned resources, unused reservations." }
  ]
};
