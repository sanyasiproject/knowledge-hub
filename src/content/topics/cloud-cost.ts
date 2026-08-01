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

  deepDive: [
    "## FinOps Framework: Inform, Optimize, Operate\n\n**FinOps (Cloud Financial Operations)** is a cultural practice bringing financial accountability to cloud spending through three iterative phases. **Inform** establishes visibility: implement cost allocation tags (mandatory tags: team, project, environment, cost-center), configure AWS Cost Explorer with granular hourly data, deploy S3 Cost and Usage Reports (CUR) to a data lake for custom analysis, and set up AWS Budgets with SNS alerts at 50%, 80%, and 100% thresholds. **Optimize** reduces waste: right-size instances using AWS Compute Optimizer recommendations (analyzes 14 days of CloudWatch metrics), purchase Savings Plans based on Coverage and Utilization reports, eliminate idle resources (unattached EBS volumes, unused Elastic IPs, idle load balancers), and implement S3 lifecycle policies. **Operate** embeds cost awareness into engineering culture: integrate cost data into CI/CD (Infracost for Terraform PRs), create team-level dashboards showing unit economics (cost per transaction, cost per user), conduct monthly FinOps reviews comparing budgets to actuals, and implement showback/chargeback models to create spending accountability.",
    "## Reserved Instances vs Savings Plans: Commitment Strategy\n\n**Reserved Instances (RIs)** commit to a specific instance family, region, OS, and tenancy for 1 or 3 years. **Standard RIs** offer up to 72% discount but cannot change instance family (can change size within family). **Convertible RIs** offer up to 66% discount and allow changing instance family, OS, and tenancy — providing flexibility for evolving architectures. **Savings Plans** are the modern alternative: **Compute Savings Plans** commit to a $/hour spend applicable across EC2, Fargate, and Lambda in any region — maximum flexibility at up to 66% discount. **EC2 Instance Savings Plans** lock to an instance family in a region for up to 72% discount (matching Standard RI savings). Strategy: analyze 90 days of usage with Cost Explorer Recommendations. Cover steady-state baseline with 3-year No Upfront Compute Savings Plans (best balance of commitment and flexibility), add 1-year EC2 Instance Savings Plans for predictable workloads, and use on-demand/spot for variable capacity.",
    "## Spot Instances: Architecture for Interruption Tolerance\n\n**Spot instances** offer up to 90% discount by using AWS's spare EC2 capacity, but can be reclaimed with a **2-minute interruption notice**. Successful spot architectures require **interruption tolerance** through specific patterns. **Diversification** across multiple instance types and AZs reduces interruption probability: use `capacity-optimized` allocation strategy in ASGs with 10+ instance type overrides. **Stateless design** ensures any instance can be terminated without data loss — externalize state to S3, DynamoDB, or ElastiCache. **Checkpointing** for long-running jobs (ML training, batch processing) saves progress to S3 periodically, enabling resume on a new instance. **Mixed instances policies** in ASGs combine a base of on-demand instances (for minimum capacity guarantee) with spot instances for elastic scaling. **Spot placement score** API predicts which Region/AZ combinations have the highest spot capacity for your instance types. For containers, **Fargate Spot** provides the same model for ECS tasks. For EKS, **Karpenter** with spot provisioner handles instance selection and interruption handling automatically."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: enforce cost allocation tags with AWS Config",
      source: `# Require mandatory cost allocation tags on all resources
resource "aws_config_config_rule" "required_tags" {
  name = "required-cost-allocation-tags"

  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }

  input_parameters = jsonencode({
    tag1Key   = "team"
    tag1Value = ""
    tag2Key   = "project"
    tag2Value = ""
    tag3Key   = "environment"
    tag3Value = "dev,staging,prod"
    tag4Key   = "cost-center"
    tag4Value = ""
  })

  scope {
    compliance_resource_types = [
      "AWS::EC2::Instance",
      "AWS::RDS::DBInstance",
      "AWS::S3::Bucket",
      "AWS::Lambda::Function",
      "AWS::ECS::Service",
      "AWS::ElasticLoadBalancingV2::LoadBalancer"
    ]
  }
}

# Budget alert for team spending
resource "aws_budgets_budget" "team_monthly" {
  name         = "team-platform-monthly"
  budget_type  = "COST"
  limit_amount = "10000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:team\$platform"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_sns_topic_arns = [aws_sns_topic.budget_alerts.arn]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_sns_topic_arns = [aws_sns_topic.budget_alerts.arn]
  }
}`
    },
    {
      language: "bash",
      caption: "AWS CLI: identify cloud waste and optimization opportunities",
      source: `# Find unattached EBS volumes (wasted storage cost)
aws ec2 describe-volumes \\
  --filters "Name=status,Values=available" \\
  --query 'Volumes[].{ID:VolumeId,Size:Size,Type:VolumeType,Created:CreateTime}' \\
  --output table

# Find unused Elastic IPs ($3.65/month each when unattached)
aws ec2 describe-addresses \\
  --query 'Addresses[?AssociationId==null].{IP:PublicIp,AllocId:AllocationId}' \\
  --output table

# Find idle load balancers (no healthy targets)
aws elbv2 describe-load-balancers \\
  --query 'LoadBalancers[].LoadBalancerArn' --output text | \\
  tr '\\t' '\\n' | while read arn; do
    targets=$(aws elbv2 describe-target-health \\
      --target-group-arn "$arn" 2>/dev/null \\
      --query 'length(TargetHealthDescriptions[?TargetHealth.State==\`healthy\`])')
    if [ "$targets" = "0" ]; then
      echo "IDLE: $arn"
    fi
  done

# Get Compute Optimizer recommendations for right-sizing
aws compute-optimizer get-ec2-instance-recommendations \\
  --query 'instanceRecommendations[?finding==\`OVER_PROVISIONED\`].{
    Instance:instanceArn,
    Current:currentInstanceType,
    Recommended:recommendationOptions[0].instanceType,
    MonthlySavings:recommendationOptions[0].estimatedMonthlySavings.value
  }' --output table

# Check Savings Plan utilization
aws ce get-savings-plans-utilization \\
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \\
  --query 'Total.{Utilization:UtilizationPercentage,Savings:NetSavings}'`
    },
    {
      language: "yaml",
      caption: "Infracost config: cost estimation in CI/CD pipeline",
      source: `# .infracost.yml - cost estimation for Terraform changes
version: 0.1
projects:
  - path: terraform/environments/prod
    name: production
    terraform_var_files:
      - terraform.tfvars
    usage_file: infracost-usage.yml

# GitHub Actions workflow for PR cost comments
# .github/workflows/infracost.yml
name: Infracost
on: [pull_request]
jobs:
  infracost:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Infracost
        uses: infracost/actions/setup@v3
        with:
          api-key: \${{ secrets.INFRACOST_API_KEY }}

      - name: Generate cost diff
        run: |
          infracost diff \\
            --path=terraform/environments/prod \\
            --format=json \\
            --compare-to=infracost-base.json \\
            --out-file=/tmp/infracost-diff.json

      - name: Post PR comment
        run: |
          infracost comment github \\
            --path=/tmp/infracost-diff.json \\
            --repo=\${{ github.repository }} \\
            --pull-request=\${{ github.event.pull_request.number }} \\
            --github-token=\${{ secrets.GITHUB_TOKEN }} \\
            --behavior=update`
    }
  ],

  comparison: {
    columns: ["Pricing Model", "Discount", "Commitment", "Flexibility", "Best For"],
    rows: [
      ["On-Demand", "0% (baseline)", "None", "Full — start/stop anytime", "Unpredictable workloads, short-term, development"],
      ["Savings Plan (Compute)", "Up to 66%", "1 or 3 year $/hr", "Any EC2, Fargate, Lambda, any region", "Steady-state compute with evolving architecture"],
      ["Savings Plan (EC2 Instance)", "Up to 72%", "1 or 3 year $/hr", "Specific instance family + region, any size/OS", "Predictable EC2 workloads in known regions"],
      ["Reserved Instance (Standard)", "Up to 72%", "1 or 3 year", "Specific family, region, OS, tenancy; can change size", "Stable, well-understood EC2 workloads"],
      ["Reserved Instance (Convertible)", "Up to 66%", "1 or 3 year", "Can change family, OS, tenancy", "Long-term commitment with architecture uncertainty"],
      ["Spot Instance", "Up to 90%", "None (can be interrupted)", "Multiple types recommended", "Fault-tolerant batch, CI/CD, stateless workers"],
      ["Fargate Spot", "Up to 70%", "None (can be interrupted)", "ECS tasks only", "Fault-tolerant containerized workloads"],
      ["Lambda", "Pay per ms", "None (or Savings Plan)", "Automatic scaling", "Event-driven, intermittent workloads"]
    ]
  },

  exercises: [
    "Your company spends $150,000/month on AWS. Cost Explorer shows: 40% EC2 ($60K), 20% RDS ($30K), 15% S3 ($22.5K), 10% data transfer ($15K), 15% other. Design a 6-month FinOps optimization plan targeting a 30% cost reduction. Specify: Savings Plan purchases (amount, type, term), EC2 right-sizing candidates, S3 lifecycle optimization, data transfer reduction strategies (VPC endpoints, CloudFront), and the team structure and review cadence.",
    "A data processing pipeline runs 200 c5.2xlarge instances for 8 hours daily (batch jobs). During the remaining 16 hours, only 10 instances handle real-time ingestion. Design a cost-optimized architecture using: Spot instances with fallback to on-demand for batch processing, Savings Plans or RIs for the 10-instance baseline, Auto Scaling schedules for the daily pattern, and instance type diversification for spot availability. Calculate the monthly cost for each option.",
    "Implement a tagging strategy and showback model for an organization with 5 teams across 3 environments. Define: the mandatory tag schema, an AWS Config rule to enforce tagging, a Cost and Usage Report pipeline to Athena for analysis, per-team dashboards in QuickSight, and budget alerts at team and project levels. Write the Terraform for the Config rule and budget resources.",
    "Your S3 storage costs are $45,000/month across 200 TB. S3 Storage Lens shows: 60% of data is in Standard (never accessed after 30 days), 25% is in Standard-IA (accessed quarterly), 15% is in Glacier (compliant archives). Design a lifecycle optimization strategy using Intelligent-Tiering vs manual lifecycle rules. Calculate exact monthly savings for each approach.",
    "A startup's AWS bill grew from $5K to $50K over 6 months without proportional revenue growth. Conduct a cost investigation: identify the top 5 cost optimization opportunities using Cost Explorer data (EC2 right-sizing, unused resources, missing Savings Plans, S3 lifecycle, data transfer). Create an Infracost integration for the Terraform-based infrastructure to prevent future cost surprises in PRs."
  ],

  cheatSheet: [
    "**Top 5 AWS cost leaks**: unattached EBS volumes, idle load balancers, unused Elastic IPs, over-provisioned instances, missing S3 lifecycle policies — check monthly",
    "**Savings Plan coverage**: aim for 70-80% coverage of steady-state compute. Over-committing wastes money on unused commitments; under-committing pays too much on-demand",
    "**Right-sizing signals**: sustained CPU < 40% = likely over-provisioned. Use Compute Optimizer (14-day analysis) or CloudWatch metrics to identify candidates",
    "**Data transfer costs**: inter-AZ = $0.01/GB, internet egress = $0.09/GB (first 10 TB). Use VPC endpoints ($0.01/GB) for S3/DynamoDB, CloudFront for edge caching, same-AZ placement where possible",
    "**Graviton instances**: 20-40% cheaper than x86 equivalents with equal or better performance. Switch M5 to M7g, C5 to C7g, R5 to R7g — most workloads require zero code changes",
    "**Cost Explorer tips**: enable hourly granularity, filter by usage type for data transfer analysis, use the Reservation Utilization report to check commitment efficiency",
    "**Spot best practices**: diversify across 10+ instance types and all AZs, use capacity-optimized allocation, handle 2-minute interruption notice via instance metadata or EventBridge",
    "**Quick wins checklist**: delete unattached EBS volumes, release unused EIPs, stop dev/staging instances at night (Instance Scheduler), enable S3 Intelligent-Tiering, review NAT Gateway data processing charges"
  ],

  revisionNotes: [
    "AWS charges separately for compute, storage, data transfer, and API requests. Data transfer is the most commonly overlooked cost — especially NAT Gateway processing ($0.045/GB) and inter-AZ traffic ($0.01/GB each way)",
    "Savings Plans apply automatically to the highest on-demand cost first, maximizing savings without manual assignment. They are region-specific (EC2 Instance SP) or region-flexible (Compute SP)",
    "S3 storage class differences matter at scale: Standard ($0.023/GB) vs Intelligent-Tiering (same + $0.0025/1000 objects monitoring) vs Infrequent Access ($0.0125/GB + $0.01/GB retrieval). Model your access patterns before choosing",
    "Spot interruption rates vary by instance type and AZ. AWS publishes the Spot Placement Score API and Spot Instance Advisor to help select combinations with lowest interruption probability",
    "Cost allocation tags must be activated in the Billing console before they appear in Cost Explorer and CUR. Only tags activated as cost allocation tags are available for cost analysis — regular resource tags are not",
    "AWS Free Tier has three types: 12-month free (new accounts: 750 hrs t2.micro), always free (Lambda 1M requests, DynamoDB 25 GB), and trials (SageMaker 250 hrs). Monitor usage to avoid surprise charges",
    "Reserved Instance Marketplace lets you sell unused Standard RIs (not Convertible) to other AWS customers. This provides an exit strategy for commitments that no longer match your needs",
    "Unit economics (cost per transaction, cost per user) are more meaningful than raw cloud spend. A growing bill is healthy if the cost per unit is decreasing — this is what FinOps optimizes for"
  ],

  resources: [
    { label: "FinOps Foundation — Cloud Financial Management Framework", kind: "docs", note: "The industry-standard framework for cloud cost management: principles, personas, phases, and maturity model" },
    { label: "AWS Well-Architected — Cost Optimization Pillar", kind: "docs", note: "Official AWS guidance on cost-aware architectures: expenditure awareness, cost-effective resources, matching supply and demand" },
    { label: "Last Week in AWS Newsletter by Corey Quinn", kind: "article", note: "Weekly newsletter covering AWS pricing changes, billing surprises, and cost optimization strategies with real-world analysis" },
    { label: "Infracost — Cloud Cost Estimates for Terraform", kind: "repo", note: "Open-source tool that shows cost impact of Terraform changes in pull requests — essential for shift-left cost management" },
    { label: "AWS re:Invent — Cost Optimization at Scale (FIN301)", kind: "video", note: "Enterprise-scale FinOps practices: organizational strategies, commitment management, and automated cost governance" }
  ],

  diagrams: [
    {
      title: "Cloud Cost Optimization Workflow",
      kind: "flow",
      caption: "Iterative workflow for identifying, prioritizing, and reducing cloud spend without impacting reliability.",
      mermaid: `flowchart TD
    A["Export Cost Report"] --> B["Tag and Attribute Spend"]
    B --> C["Identify Top Cost Drivers"]
    C --> D{"Waste or Overprovisioning?"}
    D -->|Yes| E["Right-size or Delete"]
    D -->|No| F["Optimize Pricing Model"]
    E --> G["Measure Savings"]
    F --> G
    G --> H["Set Budget Alerts"]
    H --> I["Monthly Review"]
    I --> A`,
    },
    {
      title: "Cloud Cost Categories",
      kind: "mindmap",
      caption: "Taxonomy of cloud cost categories and the levers available to reduce each one.",
      mermaid: `mindmap
  root((Cloud Costs))
    Compute
      Right-size instances
      Reserved instances
      Spot and preemptible
      Auto-scaling
    Storage
      Lifecycle policies
      Compression
      Tiered storage
      Delete orphaned volumes
    Network
      Reduce data egress
      CDN caching
      VPC endpoints
      Compress transfers
    Database
      Read replicas tuning
      Serverless options
      Connection pooling
    Licensing
      BYOL options
      Open source alternatives`,
    },
    {
      title: "FinOps Architecture",
      kind: "architecture",
      caption: "FinOps tooling architecture connecting cloud billing APIs with tagging, alerting, and chargeback systems.",
      mermaid: `graph LR
    subgraph CloudProviders["Cloud Providers"]
        AWS["AWS Cost Explorer"]
        GCP["GCP Billing"]
        AZ["Azure Cost Mgmt"]
    end
    subgraph Aggregation["Cost Platform"]
        ETL["ETL Pipeline"]
        DW["Cost Data Warehouse"]
        TAG["Tag Enrichment"]
    end
    subgraph Outputs["Actions and Reporting"]
        DASH["Dashboard"]
        ALERT["Budget Alerts"]
        CB["Chargeback Reports"]
        REC["Recommendations"]
    end
    AWS & GCP & AZ --> ETL
    ETL --> TAG --> DW
    DW --> DASH & ALERT & CB & REC`,
    },
    {
      title: "Reserved vs On-Demand Decision",
      kind: "state",
      caption: "Decision states for choosing the right cloud pricing commitment tier for a workload.",
      mermaid: `stateDiagram-v2
    [*] --> Evaluate
    Evaluate : Analyse workload pattern
    Evaluate --> OnDemand : unpredictable or new
    Evaluate --> Savings : steady-state workload
    Evaluate --> Spot : fault-tolerant batch
    OnDemand --> Savings : usage stabilizes
    Savings : Reserved or Savings Plan
    Spot --> OnDemand : latency-sensitive`,
    },
  ],

  animations: [
    {
      title: "EC2 Right-Sizing and Commitment Strategy",
      steps: [
        { label: "Analyze current usage", detail: "Enable AWS Compute Optimizer and review 14 days of CloudWatch metrics. Identify instances with sustained CPU < 40% or memory < 50% as over-provisioned. Current fleet: 50 m5.2xlarge instances running 24/7 at average 35% CPU." },
        { label: "Right-size instances", detail: "Compute Optimizer recommends m5.xlarge (50% smaller) for 30 instances. Test in staging with load simulation. After validation, resize in production during maintenance window. Monthly savings: 30 instances x $0.192/hr savings x 730 hrs = $4,205/month." },
        { label: "Identify commitment candidates", detail: "After right-sizing, the fleet is 20 m5.2xlarge + 30 m5.xlarge running 24/7 (steady state). Cost Explorer Savings Plans recommendations suggest $15/hr Compute Savings Plan commitment covering 80% of steady-state compute." },
        { label: "Purchase Savings Plans", detail: "Buy 3-year No Upfront Compute Savings Plan at $15/hr. This covers 80% of the compute baseline with ~60% discount. Remaining 20% stays on-demand for flexibility. Annual commitment savings: ~$78,000 compared to full on-demand pricing." },
        { label: "Implement Spot for variable workloads", detail: "Batch processing jobs (10 instances, 8 hrs/day) migrate to Spot with capacity-optimized allocation and 10 instance type overrides. Monthly savings: ~70% off on-demand for batch compute. Auto Scaling handles interruptions by launching replacement instances." },
        { label: "Continuous optimization", detail: "Set up monthly FinOps review: check Savings Plan utilization (target > 90%), review Compute Optimizer for new right-sizing opportunities, audit for idle resources, and track unit economics (cost per API call trending downward quarter over quarter)." }
      ]
    }
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
