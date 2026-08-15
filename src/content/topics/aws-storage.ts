import type { TopicContent } from "../types";

export const awsStorage: TopicContent = {
  quickSummary: [
    "Amazon S3 (Simple Storage Service) is object storage with virtually unlimited capacity. Objects are stored in buckets across storage classes ranging from S3 Standard (frequent access, highest cost) to S3 Glacier Deep Archive (12-hour retrieval, lowest cost at ~$1/TB/month).",
    "EBS (Elastic Block Store) provides persistent block storage for EC2 instances. Volume types include gp3 (general-purpose SSD, baseline 3,000 IOPS), io2 (provisioned IOPS up to 256,000), and st1/sc1 (HDD for throughput and cold workloads).",
    "EFS (Elastic File System) is a managed NFS file system that can be mounted concurrently by thousands of EC2 instances or containers. It scales automatically and supports lifecycle policies to move infrequently accessed files to cheaper EFS-IA storage.",
    "S3 Lifecycle policies automatically transition objects between storage classes based on age (e.g., move to IA after 30 days, Glacier after 90 days, delete after 365 days). This is essential for cost optimization of growing data sets.",
    "S3 Transfer Acceleration uses CloudFront edge locations to speed up long-distance uploads by routing through AWS's optimized backbone network, improving transfer speeds by 50-500% for geographically distant clients."
  ],

  detailed: [
    "## S3 Storage Classes\n\nS3 offers multiple storage classes optimized for different access patterns and cost requirements.\n\n**S3 Standard:**\n- Designed for frequently accessed data\n- 99.99% availability, 99.999999999% (11 nines) durability\n- No retrieval fees, no minimum storage duration\n- Use for: active application data, content distribution, data lakes, analytics\n\n**S3 Standard-Infrequent Access (S3 Standard-IA):**\n- 40% cheaper storage than Standard, but charges per-GB retrieval fee\n- 99.9% availability, same 11-nines durability\n- 128 KB minimum object size charge, 30-day minimum storage duration\n- Use for: backups, disaster recovery, data accessed less than once a month\n\n**S3 One Zone-IA:**\n- 20% cheaper than Standard-IA, stored in a single AZ (lower resilience)\n- Use for: data that can be recreated (thumbnails, transcoded media) or secondary backups\n\n**S3 Intelligent-Tiering:**\n- Automatically moves objects between tiers based on access patterns\n- No retrieval fees, small monthly monitoring fee per object\n- Tiers: Frequent Access, Infrequent Access (30 days), Archive Instant Access (90 days), optional Archive (90 days) and Deep Archive (180 days)\n- Use for: data with unpredictable or changing access patterns\n\n**S3 Glacier Instant Retrieval:**\n- 68% cheaper than Standard, millisecond retrieval\n- 90-day minimum storage duration\n- Use for: medical images, news archives — rarely accessed but needs instant access\n\n**S3 Glacier Flexible Retrieval:**\n- Minutes to 12-hour retrieval times (Expedited, Standard, Bulk)\n- Use for: compliance archives, long-term backups\n\n**S3 Glacier Deep Archive:**\n- Cheapest storage (~$1/TB/month), 12-48 hour retrieval\n- 180-day minimum storage duration\n- Use for: regulatory archives, tape replacement",

    "## EBS Volume Types\n\nEBS provides block-level storage volumes for EC2 instances. Each volume type is optimized for different performance characteristics.\n\n**General Purpose SSD (gp3):**\n- Baseline: 3,000 IOPS, 125 MB/s throughput (included in price)\n- Scalable up to 16,000 IOPS and 1,000 MB/s independently of volume size\n- 20% cheaper than gp2 with better baseline performance\n- Use for: boot volumes, dev/test environments, small-to-medium databases\n\n**General Purpose SSD (gp2):**\n- IOPS scales with volume size (3 IOPS/GB, up to 16,000 IOPS)\n- Burst credit system for small volumes\n- Legacy — gp3 is preferred for new workloads\n\n**Provisioned IOPS SSD (io2/io2 Block Express):**\n- Up to 256,000 IOPS and 4,000 MB/s (Block Express)\n- 99.999% durability (vs. 99.8-99.9% for other types)\n- Consistent, predictable performance\n- Use for: large databases (Oracle, SQL Server), latency-sensitive applications\n- io2 Block Express available on Nitro-based instances for extreme performance\n\n**Throughput Optimized HDD (st1):**\n- Up to 500 MB/s throughput, not designed for random IOPS\n- Cannot be a boot volume\n- Use for: big data, data warehouses, log processing — sequential read/write\n\n**Cold HDD (sc1):**\n- Lowest cost EBS option, up to 250 MB/s throughput\n- Cannot be a boot volume\n- Use for: infrequently accessed large data sets, file servers\n\n**Key EBS features:**\n- Snapshots: point-in-time backups stored in S3, incremental (only changed blocks)\n- Encryption: AES-256, transparent to the instance, uses KMS keys\n- Multi-Attach (io2): attach a single volume to up to 16 Nitro instances simultaneously\n- Elastic Volumes: resize, change type, or adjust IOPS without detaching",

    "## Amazon EFS (Elastic File System)\n\nEFS provides fully managed, elastic NFS file storage accessible by multiple compute resources simultaneously.\n\n**Key characteristics:**\n- POSIX-compliant file system accessible via NFSv4.1 protocol\n- Scales automatically from zero to petabytes without provisioning\n- Concurrent access from thousands of EC2 instances, ECS tasks, EKS pods, and Lambda functions\n- Regional service: data replicated across multiple AZs for durability\n\n**Performance modes:**\n- General Purpose: lowest latency, suitable for most workloads (web serving, CMS, home directories)\n- Max I/O: highest throughput and IOPS, slightly higher latency (big data, media processing)\n\n**Throughput modes:**\n- Bursting: throughput scales with file system size (50 MB/s per TB stored, bursts higher)\n- Provisioned: configure throughput independently of storage size\n- Elastic: automatically scales throughput based on workload demand (recommended for most new file systems)\n\n**Storage classes:**\n- Standard: for frequently accessed files\n- Infrequent Access (IA): up to 92% lower cost, per-access charge\n- Archive: up to 50x cheaper than Standard for rarely accessed data\n- Lifecycle policies automatically move files between classes based on last access time\n\n**EFS vs. EBS vs. S3:**\n- EFS: shared file system, NFS protocol, concurrent access. Use when multiple instances need the same files\n- EBS: single-instance block storage (except io2 multi-attach), highest performance. Use for databases, boot volumes\n- S3: object storage, HTTP API, unlimited scale. Use for data lakes, backups, static content\n\n**One Zone EFS:**\n- 47% cheaper than standard EFS, data stored in a single AZ\n- Use for: dev environments, data that can be recreated, or when paired with single-AZ compute",

    "## S3 Lifecycle Policies and Data Management\n\nLifecycle policies automate object transitions and expiration, essential for managing costs as data grows.\n\n**Lifecycle rule components:**\n- **Scope:** Apply to entire bucket, prefix, or objects matching tags\n- **Transition actions:** Move objects between storage classes after specified days\n- **Expiration actions:** Delete objects or previous versions after specified days\n- **Abort incomplete multipart uploads:** Clean up failed uploads after a specified period\n\n**Common lifecycle patterns:**\n```\nDay 0:    S3 Standard (active data)\nDay 30:   S3 Standard-IA (less frequently accessed)\nDay 90:   S3 Glacier Instant Retrieval\nDay 180:  S3 Glacier Flexible Retrieval\nDay 365:  S3 Glacier Deep Archive\nDay 2555: Delete (7-year retention for compliance)\n```\n\n**Versioning and lifecycle:**\n- Enable versioning for data protection (accidental deletion recovery)\n- Use lifecycle rules to expire noncurrent versions after N days (e.g., keep 30 days of versions)\n- Delete markers can be cleaned up automatically with lifecycle rules\n\n**S3 Object Lock:**\n- WORM (Write Once Read Many) protection — objects cannot be deleted or overwritten\n- Governance mode: users with special permissions can override\n- Compliance mode: no one can override, including root account\n- Use for: regulatory compliance (SEC Rule 17a-4, HIPAA), audit trails\n\n**S3 Replication:**\n- Cross-Region Replication (CRR): replicate to another region for DR or compliance\n- Same-Region Replication (SRR): replicate to another bucket for log aggregation or account isolation\n- Requires versioning enabled on source and destination",

    "## Transfer Acceleration and Data Transfer\n\nMoving data into and out of S3 efficiently is critical for global applications and large data sets.\n\n**S3 Transfer Acceleration:**\n- Uses CloudFront edge locations as on-ramps to AWS backbone network\n- Client uploads to nearest edge location; AWS backbone carries data to the S3 bucket's region\n- 50-500% faster for long-distance transfers (e.g., uploading from Asia to US-East)\n- Additional cost: $0.04-0.08/GB on top of standard transfer fees\n- Enable per-bucket; clients use a different endpoint (bucketname.s3-accelerate.amazonaws.com)\n- Use the speed comparison tool to verify benefit before enabling\n\n**AWS DataSync:**\n- Managed data transfer service for moving data between on-premises and AWS, or between AWS services\n- Handles scheduling, integrity verification, encryption, and bandwidth throttling\n- Supports NFS, SMB, HDFS, self-managed object storage as sources\n- 10x faster than open-source tools for on-premises to cloud transfers\n\n**S3 Multipart Upload:**\n- Required for objects > 5 GB, recommended for objects > 100 MB\n- Upload parts in parallel for higher throughput\n- Resume failed uploads without starting over\n- Configure lifecycle rules to abort incomplete multipart uploads (they incur storage charges)\n\n**AWS Snow Family (offline transfer):**\n- Snowcone: 8-14 TB, rugged portable device\n- Snowball Edge: 80 TB storage, optional compute for edge processing\n- Snowmobile: 100 PB in a shipping container truck\n- Use when network transfer would take weeks/months or bandwidth is limited"
  ],

  interviewQA: [
    {
      q: "How do you choose between S3 storage classes for a data lake?",
      a: "Start by analyzing access patterns: hot data accessed daily stays in S3 Standard. Data accessed weekly or monthly moves to Standard-IA after 30 days via lifecycle policy. If access patterns are unpredictable, S3 Intelligent-Tiering automatically moves objects between tiers. Data for compliance retention that is rarely accessed goes to Glacier Flexible Retrieval or Deep Archive. I would implement lifecycle policies that automatically transition objects based on age, and use S3 analytics to validate access patterns before setting transitions. For a data lake specifically, most data is write-once-read-occasionally, so a heavy use of IA and Glacier tiers can reduce storage costs by 60-80%.",
      followUps: ["What are the retrieval costs and times for each Glacier tier?", "How does Intelligent-Tiering pricing compare?"]
    },
    {
      q: "When would you choose EFS over EBS?",
      a: "EFS when you need shared file access across multiple EC2 instances or containers — for example, a CMS where multiple web servers need the same uploaded files, or a machine learning pipeline where multiple instances read training data. EBS when you need high-performance block storage for a single instance — databases, boot volumes, or applications requiring low-latency direct disk access. Key technical difference: EFS is a network file system (NFS) with higher latency but shared access; EBS is block storage attached directly to an instance with lower latency but (generally) single-instance access. Cost-wise, EFS is more expensive per GB but you avoid the complexity of synchronizing data across EBS volumes.",
      followUps: ["What about FSx for Lustre or FSx for Windows?", "How does EFS performance scale?"]
    },
    {
      q: "Explain EBS gp3 vs. gp2 and when you would use io2.",
      a: "gp3 decouples IOPS and throughput from volume size — you get a baseline of 3,000 IOPS and 125 MB/s regardless of size, and can scale them independently up to 16,000 IOPS and 1,000 MB/s. It is 20% cheaper than gp2 with better baseline performance. gp2 ties IOPS to size (3 IOPS per GB), so a 100 GB volume only gets 300 IOPS — you had to over-provision size to get more IOPS. gp3 is the clear choice for new workloads. io2 provides up to 256,000 IOPS with 99.999% durability and consistent performance — use it for production databases (Oracle, SQL Server, large PostgreSQL) where you need guaranteed IOPS without variability and higher durability than gp3.",
      followUps: ["What is io2 Block Express?", "How do EBS snapshots work?"]
    }
  ],

  followUps: [
    "S3, EBS, EFS — which for a shared upload directory, and why?",
    "What consistency does S3 give you now, and what did it give you before 2020?",
    "How do storage classes change the cost/retrieval trade-off?",
  ],
  mcqs: [
    {
      q: "Which S3 storage class offers millisecond retrieval at the lowest cost for rarely accessed data?",
      options: ["S3 Standard-IA", "S3 Glacier Instant Retrieval", "S3 Glacier Flexible Retrieval", "S3 One Zone-IA"],
      answerIndex: 1,
      explanation: "Glacier Instant Retrieval provides millisecond access like Standard but at 68% lower cost, with a 90-day minimum storage duration. It is designed for data accessed once per quarter."
    },
    {
      q: "What is the baseline IOPS for a gp3 EBS volume?",
      options: ["100 IOPS", "1,000 IOPS", "3,000 IOPS", "16,000 IOPS"],
      answerIndex: 2,
      explanation: "gp3 volumes include a baseline of 3,000 IOPS and 125 MB/s throughput regardless of volume size, with the ability to provision up to 16,000 IOPS independently."
    },
    {
      q: "Which storage service supports concurrent access from multiple EC2 instances?",
      options: ["EBS gp3", "EBS io2 (standard)", "EFS", "Instance store"],
      answerIndex: 2,
      explanation: "EFS is a managed NFS file system that supports concurrent access from thousands of instances. Standard EBS volumes attach to a single instance (io2 multi-attach supports up to 16)."
    },
    {
      q: "S3 Object Lock in Compliance mode:",
      options: [
        "Allows admin users to delete objects",
        "Cannot be overridden by any user including root",
        "Encrypts objects with customer-managed keys",
        "Replicates objects across regions automatically"
      ],
      answerIndex: 1,
      explanation: "Compliance mode WORM protection prevents any user, including the root account, from deleting or overwriting the object until the retention period expires. This meets strict regulatory requirements."
    },
    {
      q: "When is S3 Transfer Acceleration most beneficial?",
      options: [
        "Downloading objects within the same region",
        "Uploading large files from geographically distant locations",
        "Transferring data between S3 buckets in the same account",
        "Accessing S3 from EC2 instances in the same region"
      ],
      answerIndex: 1,
      explanation: "Transfer Acceleration uses CloudFront edge locations to route uploads through AWS's optimized backbone, providing the greatest benefit for long-distance transfers (50-500% improvement)."
    }
  ],

  flashcards: [
    { front: "S3 durability", back: "99.999999999% (11 nines) durability across all storage classes. This means statistically losing 1 object out of 10 billion every 10,000 years. Availability varies by class (99.5% to 99.99%)." },
    { front: "S3 Intelligent-Tiering", back: "Automatically moves objects between access tiers based on usage patterns. No retrieval fees, small monitoring fee per object. Best for unpredictable access patterns." },
    { front: "EBS gp3 vs. gp2", back: "gp3: 3,000 IOPS baseline regardless of size, independently scalable, 20% cheaper. gp2: IOPS tied to volume size (3 IOPS/GB), uses burst credits. gp3 is preferred for new workloads." },
    { front: "EBS Snapshots", back: "Point-in-time incremental backups stored in S3. Only changed blocks are saved after the first snapshot. Can be used to create new volumes in any AZ or copy across regions." },
    { front: "EFS storage classes", back: "Standard (frequent access), Infrequent Access (92% cheaper, per-access fee), Archive (50x cheaper). Lifecycle policies move files automatically based on last access time." },
    { front: "S3 Lifecycle Policy", back: "Rules that automatically transition objects between storage classes or delete them based on age. Essential for cost optimization: Standard -> IA -> Glacier -> Delete." },
    { front: "Multipart Upload", back: "S3 feature for uploading large objects in parts. Required for >5 GB, recommended for >100 MB. Enables parallel upload and resumable transfers." },
    { front: "Snow Family", back: "Physical devices for offline data transfer. Snowcone (8-14 TB), Snowball Edge (80 TB + optional compute), Snowmobile (100 PB shipping container)." }
  ],

  deepDive: [
    "## S3 Consistency Model and Internal Architecture\n\n**Strong read-after-write consistency** was delivered in December 2020 for all S3 operations — PUTs, DELETEs, and list operations. Internally, S3 uses a distributed metadata subsystem backed by a **persistent, replicated key-value store** that replaced the eventual-consistency index. Objects are stored across a minimum of **3 Availability Zones** (except One Zone-IA). Each object is split into chunks, erasure-coded, and distributed across multiple devices and facilities. The **S3 Intelligent-Tiering** storage class uses per-object access monitoring to automatically move data between frequent, infrequent, archive instant, archive, and deep archive tiers — with no retrieval fees. For buckets with millions of objects, **S3 Inventory** and **S3 Storage Lens** provide visibility into usage patterns, while **S3 Batch Operations** enable bulk actions (copy, tag, restore) across billions of objects.",
    "## EBS Volume Types and Performance Characteristics\n\nEBS volumes attach to EC2 instances via the **Nitro** hypervisor's NVMe interface. **gp3** is the default general-purpose SSD: 3,000 baseline IOPS and 125 MB/s throughput (independently scalable to 16,000 IOPS and 1,000 MB/s) without capacity dependency. **io2 Block Express** delivers up to 256,000 IOPS and 4,000 MB/s with 99.999% durability — designed for SAP HANA, Oracle, and mission-critical databases. **st1** (throughput-optimized HDD) supports up to 500 MB/s for sequential workloads like Kafka logs. Key consideration: **EBS-optimized instances** have dedicated bandwidth to EBS (separate from network), and the instance type sets the ceiling — a `t3.micro` maxes out at 2,085 Mbps regardless of volume capabilities. **Multi-Attach** for io2 volumes enables up to 16 instances to share a single volume (requires cluster-aware filesystem like GFS2).",
    "## EFS vs FSx: Choosing the Right File System\n\n**EFS** provides managed NFS v4.1 with automatic scaling from 0 to petabytes. Performance modes: **General Purpose** (lowest latency, 35,000 IOPS) and **Max I/O** (higher throughput, slightly higher latency). Throughput modes: **Bursting** (scales with size), **Provisioned** (fixed throughput), and **Elastic** (auto-scales throughput, pay per use). EFS is ideal for CMS, ML training data, container shared storage. **FSx for Lustre** is a high-performance parallel file system integrating with S3 — use for HPC, video processing, and ML training (hundreds of GB/s throughput). **FSx for Windows File Server** provides fully managed SMB shares with Active Directory integration, DFS namespaces, and shadow copies — required for Windows workloads. **FSx for NetApp ONTAP** supports multi-protocol (NFS, SMB, iSCSI) with data deduplication and compression, ideal for hybrid cloud and lift-and-shift."
  ],

  code: [
    {
      language: "hcl",
      caption: "Terraform: S3 bucket with versioning, encryption, and lifecycle rules",
      source: `resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake-prod"
}

resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    filter { prefix = "raw/" }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 90
      storage_class = "GLACIER_INSTANT_RETRIEVAL"
    }
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

resource "aws_s3_bucket_public_access_block" "data_lake" {
  bucket                  = aws_s3_bucket.data_lake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`
    },
    {
      language: "bash",
      caption: "AWS CLI: EBS snapshot management and cross-region copy",
      source: `# Create a snapshot of a production EBS volume
aws ec2 create-snapshot \\
  --volume-id vol-0abc123def456 \\
  --description "prod-db-daily-$(date +%Y%m%d)" \\
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Environment,Value=prod},{Key=Backup,Value=daily}]'

# Copy snapshot to DR region
aws ec2 copy-snapshot \\
  --source-region us-east-1 \\
  --source-snapshot-id snap-0abc123def456 \\
  --destination-region us-west-2 \\
  --encrypted \\
  --kms-key-id alias/ebs-dr-key \\
  --description "DR copy of prod-db snapshot"

# List and clean up old snapshots (older than 30 days)
aws ec2 describe-snapshots \\
  --owner-ids self \\
  --filters "Name=tag:Backup,Values=daily" \\
  --query "Snapshots[?StartTime<='$(date -d '30 days ago' +%Y-%m-%d)'].SnapshotId" \\
  --output text | tr '\\t' '\\n' | while read snap; do
    echo "Deleting old snapshot: $snap"
    aws ec2 delete-snapshot --snapshot-id "$snap"
  done`
    },
    {
      language: "json",
      caption: "S3 bucket policy: enforce encryption and restrict VPC access",
      source: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::company-data-lake-prod/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    },
    {
      "Sid": "RestrictToVPC",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::company-data-lake-prod",
        "arn:aws:s3:::company-data-lake-prod/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:sourceVpce": "vpce-abc123"
        }
      }
    }
  ]
}`
    }
  ],

  comparison: {
    columns: ["Feature", "S3", "EBS (gp3)", "EBS (io2)", "EFS", "FSx for Lustre"],
    rows: [
      ["Storage type", "Object", "Block (SSD)", "Block (SSD)", "File (NFS)", "File (Lustre)"],
      ["Max size", "Unlimited", "16 TB/volume", "64 TB/volume", "Petabytes (auto)", "Petabytes"],
      ["Max IOPS", "5,500 GET/s/prefix", "16,000", "256,000", "35,000 (GP mode)", "Millions"],
      ["Max throughput", "Varies by prefix", "1,000 MB/s", "4,000 MB/s", "Elastic: auto", "Hundreds GB/s"],
      ["Durability", "99.999999999% (11 nines)", "99.8-99.9%", "99.999%", "99.999999999%", "Depends on type"],
      ["Access pattern", "Any (via API)", "Single EC2 (or Multi-Attach io2)", "Single/Multi-Attach", "Multi-AZ concurrent", "Multi-instance parallel"],
      ["Pricing model", "Per GB stored + requests", "Per GB provisioned", "Per GB + IOPS provisioned", "Per GB used", "Per GB provisioned"],
      ["Best for", "Data lakes, backups, static assets", "Boot volumes, general workloads", "Mission-critical databases", "Shared app storage, CMS", "HPC, ML training, video"]
    ]
  },

  exercises: [
    "Design an S3 data lake architecture for a company ingesting 500 GB/day of log data. Specify: bucket structure (prefix strategy), lifecycle rules (transition schedule to IA, Glacier, Deep Archive), access patterns (Athena queries on recent data, occasional historical analysis), encryption strategy (SSE-KMS vs SSE-S3), and cross-region replication for DR. Calculate the monthly storage cost after 1 year of data accumulation.",
    "A PostgreSQL database on EC2 requires consistent 20,000 IOPS with sub-millisecond latency. The database is 2 TB and growing 50 GB/month. Choose the right EBS volume type, configure the volume and instance type for the required performance, set up automated snapshots with cross-region copy for DR, and design a monitoring strategy using CloudWatch metrics (VolumeQueueLength, VolumeThroughput).",
    "Your team needs a shared file system for 20 ECS Fargate tasks processing video files. Each task reads input (1-5 GB files) and writes output (200 MB files). Total dataset is 10 TB. Compare EFS (with throughput mode selection) vs FSx for Lustre (with S3 integration). Consider: cost, throughput requirements, burst behavior, and deployment complexity.",
    "Design an S3 security architecture for a healthcare company (HIPAA-compliant). Address: bucket policies enforcing encryption, VPC endpoint access restrictions, S3 Access Points for different teams, Object Lock for compliance retention (WORM), CloudTrail data events for audit logging, and Macie for PII detection. Specify the exact IAM and bucket policies.",
    "A media company stores 500 TB of video assets in S3 Standard. Analytics show 80% of files haven't been accessed in 90 days, and 50% haven't been accessed in a year. Design an S3 Intelligent-Tiering vs manual lifecycle optimization strategy. Calculate the cost savings for each approach and recommend which to use."
  ],

  cheatSheet: [
    "**S3 storage class costs (us-east-1)**: Standard $0.023/GB → IA $0.0125/GB → Glacier Instant $0.004/GB → Glacier Flexible $0.0036/GB → Deep Archive $0.00099/GB",
    "**S3 performance**: 5,500 GETs + 3,500 PUTs per second per prefix. Parallelize across prefixes for higher throughput. Multipart upload required > 5 GB, recommended > 100 MB",
    "**EBS gp3 baseline**: 3,000 IOPS + 125 MB/s included free. Scale independently up to 16,000 IOPS ($0.005/IOPS) and 1,000 MB/s ($0.04/MB/s)",
    "**EBS snapshot pricing**: you pay only for changed blocks (incremental). First snapshot = full copy, subsequent = deltas. Cross-region copy incurs data transfer charges",
    "**EFS Elastic throughput**: automatically scales to match workload — you pay per GB transferred rather than provisioning throughput. Best for spiky or unpredictable workloads",
    "**S3 Object Lock modes**: Governance (root can override), Compliance (nobody can delete, even root, until retention expires). Legal Hold blocks deletion independently of retention",
    "**S3 Transfer Acceleration**: uses CloudFront edge locations for faster uploads. Enable per-bucket. Charges only when acceleration is faster than normal transfer",
    "**EBS Multi-Attach**: only for io2/io2 Block Express, max 16 Nitro instances, requires cluster-aware filesystem (not ext4/xfs). Use for HA active-active databases"
  ],

  revisionNotes: [
    "S3 provides strong read-after-write consistency for all operations since December 2020 — no more eventual consistency caveats. This applies to PUTs of new objects, overwrites, DELETEs, and LIST operations",
    "EBS volume performance is capped by the instance type's EBS bandwidth. Always check instance limits — a powerful io2 volume on a small instance wastes provisioned IOPS and money",
    "S3 Intelligent-Tiering has no retrieval fees (unlike Standard-IA which charges $0.01/GB retrieved). It charges a small monitoring fee ($0.0025 per 1,000 objects) for automatic tier transitions",
    "EFS pricing: Standard storage $0.30/GB-month, IA $0.016/GB-month + $0.01/GB access. Enable lifecycle policy to move files to IA after 14/30/60/90 days for significant savings",
    "S3 versioning cannot be disabled once enabled — only suspended. Suspended versioning stops creating new versions but preserves existing ones. Delete markers are lightweight version entries",
    "FSx for Lustre deployment types: Scratch (temporary, no replication, highest throughput) for short-term processing; Persistent (replicated within AZ, auto-heals) for longer-term storage",
    "S3 Glacier retrieval times: Instant (milliseconds), Flexible Expedited (1-5 min), Standard (3-5 hr), Bulk (5-12 hr). Deep Archive: Standard (12 hr), Bulk (48 hr)",
    "EBS snapshots are stored in S3 (managed by AWS, not in your bucket). They are incremental — deleting a snapshot removes only blocks not referenced by other snapshots"
  ],

  resources: [
    { label: "AWS Storage Blog: S3 strong consistency deep dive", kind: "article", note: "Technical explanation of how AWS achieved strong consistency for S3 without performance compromise" },
    { label: "AWS Well-Architected — Storage Lens and optimization", url: "https://aws.amazon.com/architecture/well-architected/", kind: "docs", note: "Official guidance on storage right-sizing, tiering strategies, and cost optimization across S3, EBS, and EFS" },
    { label: "AWS re:Invent — Deep dive on Amazon S3 (STG204)", kind: "video", note: "Covers S3 internals, performance optimization, security features, and access patterns at scale" },
    { label: "Amazon Builders' Library: Using S3 as a data lake foundation", kind: "article", note: "Architectural patterns for S3-based data lakes including partitioning, formats (Parquet, ORC), and query engines" },
    { label: "AWS EBS CSI Driver GitHub repository", kind: "repo", note: "Kubernetes CSI driver for EBS — essential for persistent volumes in EKS clusters" }
  ],

  diagrams: [
    {
      title: "AWS Storage Services Overview",
      kind: "architecture",
      caption: "AWS storage services grouped by type: block, file, and object storage, with their primary use cases.",
      mermaid: `graph TB
    subgraph Block["Block Storage"]
      EBS["EBS Elastic Block Store\nEC2-attached volumes"]
      IS["EC2 Instance Store\nEphemeral NVMe"]
    end
    subgraph File["File Storage"]
      EFS["EFS Elastic File System\nNFS shared storage"]
      FSX["FSx\nWindows, Lustre, NetApp, OpenZFS"]
    end
    subgraph Object["Object Storage"]
      S3["S3 Standard\nGeneral purpose"]
      S3IA["S3 Infrequent Access\nLower cost less frequent"]
      GLACIER["S3 Glacier\nArchival storage"]
    end
    EC2["EC2 Instance"] --> EBS
    EC2 --> IS
    EC2 --> EFS
    EC2 --> S3
    EBS -->|Snapshots| S3
    Lambda["Lambda"] --> S3
    EFS --> FSX`,
    },
    {
      title: "S3 Storage Class Lifecycle Transitions",
      kind: "flow",
      caption: "Allowed lifecycle transitions between S3 storage classes and their minimum duration requirements before transition.",
      mermaid: `flowchart TD
    STD["S3 Standard\nNo minimum"]
    IA["S3 Standard-IA\nMin 30 days"]
    ZIA["S3 One Zone-IA\nMin 30 days"]
    IT["S3 Intelligent-Tiering\nNo minimum"]
    GF["S3 Glacier Flexible\nMin 90 days"]
    GIR["S3 Glacier Instant\nMin 90 days"]
    GDA["S3 Glacier Deep Archive\nMin 180 days"]
    STD -->|After 30+ days| IA
    STD -->|After 30+ days| ZIA
    STD --> IT
    STD -->|After 90+ days| GIR
    IA -->|After 90+ days| GF
    IA -->|After 90+ days| GIR
    GF -->|After 180+ days| GDA
    IT -->|Auto tiering| GF`,
    },
    {
      title: "EBS Architecture with EC2",
      kind: "architecture",
      caption: "EBS volumes attached to EC2 instances within an AZ, with cross-region snapshot replication to S3.",
      mermaid: `graph TB
    subgraph AZ1["Availability Zone A"]
      EC2A["EC2 Instance"]
      GP3["EBS gp3\nOS volume 100 GiB"]
      IO2["EBS io2\nData volume 1 TiB"]
      EC2A --> GP3
      EC2A --> IO2
    end
    subgraph AZ2["Availability Zone B"]
      EC2B["EC2 Instance standby"]
      GP3B["EBS gp3\nOS volume 100 GiB"]
    end
    subgraph S3["S3 - Regional"]
      SNAP["EBS Snapshots\nIncremental backups"]
    end
    GP3 -->|Snapshot| SNAP
    IO2 -->|Snapshot| SNAP
    SNAP -->|Restore in AZ B| GP3B
    SNAP -->|Copy to other region| REMOTE["Remote Region Snapshot"]`,
    },
    {
      title: "S3 Core Features",
      kind: "mindmap",
      caption: "Mind map of S3 capabilities covering storage classes, security, performance, and data management features.",
      mermaid: `mindmap
  root((Amazon S3))
    Storage Classes
      Standard high durability
      Intelligent-Tiering auto
      Standard-IA infrequent
      Glacier instant retrieval
      Glacier Deep Archive
    Security
      Bucket policies
      ACLs legacy
      S3 Block Public Access
      SSE-S3 AWS managed keys
      SSE-KMS customer keys
    Performance
      Multipart upload
      Transfer Acceleration
      S3 Select query in place
      Byte-range fetches
    Data Management
      Versioning
      Lifecycle policies
      Replication CRR and SRR
      Object Lock WORM
      Event notifications`,
    },
  ],

  animations: [
    {
      title: "S3 Multipart Upload Process",
      steps: [
        { label: "Initiate multipart upload", detail: "Client calls CreateMultipartUpload API. S3 returns an UploadId that identifies this upload session. The object key is reserved but not yet visible." },
        { label: "Upload parts in parallel", detail: "Client splits the file into parts (minimum 5 MB each, except last part). Each part is uploaded with UploadPart API using the UploadId and a part number (1-10,000). Multiple parts upload concurrently for maximum throughput." },
        { label: "Track ETags for each part", detail: "S3 returns an ETag for each successfully uploaded part. Client must store the part number and ETag pairs. Failed parts can be retried independently without re-uploading successful parts." },
        { label: "Complete multipart upload", detail: "Client calls CompleteMultipartUpload with the ordered list of part numbers and ETags. S3 assembles the parts into the final object. The object becomes visible and any previous version is superseded." },
        { label: "Cleanup incomplete uploads", detail: "If the upload is abandoned, parts consume storage but are invisible. S3 Lifecycle rules with AbortIncompleteMultipartUpload action automatically clean up incomplete uploads after a configured number of days." }
      ]
    }
  ],

  glossary: [
    { term: "S3", definition: "Simple Storage Service — AWS object storage with virtually unlimited capacity, 11-nines durability, and multiple storage classes for different access patterns." },
    { term: "EBS", definition: "Elastic Block Store — persistent block-level storage volumes for EC2 instances, offering SSD and HDD options with snapshot and encryption capabilities." },
    { term: "EFS", definition: "Elastic File System — managed NFS file system that automatically scales and supports concurrent access from multiple compute resources." },
    { term: "Storage class", definition: "S3 pricing tier optimized for a specific access pattern, ranging from Standard (frequent, highest cost) to Glacier Deep Archive (rare, lowest cost)." },
    { term: "IOPS", definition: "Input/Output Operations Per Second — measure of storage performance for random read/write operations, critical for database workloads." },
    { term: "Lifecycle policy", definition: "S3 rule that automatically transitions objects between storage classes or deletes them based on age, prefix, or tags." },
    { term: "Transfer Acceleration", definition: "S3 feature using CloudFront edge locations to speed up long-distance uploads via AWS backbone network." },
    { term: "Object Lock", definition: "S3 WORM feature preventing object deletion or overwriting for a specified retention period, supporting regulatory compliance." }
  ]
};
