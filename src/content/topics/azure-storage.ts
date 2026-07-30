import type { TopicContent } from "../types";

export const azureStorage: TopicContent = {
  quickSummary: [
    "Azure Blob Storage is an object storage service for unstructured data, offering three access tiers — Hot (frequent access, lowest read cost), Cool (infrequent access, lower storage cost), and Archive (rare access, lowest storage cost with high retrieval latency) — enabling lifecycle management policies to automatically transition data between tiers.",
    "Azure Managed Disks provide block-level storage for VMs with four performance tiers: Standard HDD, Standard SSD, Premium SSD, and Ultra Disk, each offering different IOPS, throughput, and latency characteristics with built-in redundancy and snapshot support.",
    "Azure Files delivers fully managed SMB and NFS file shares accessible from cloud or on-premises, with Azure File Sync enabling hybrid caching scenarios that replicate frequently accessed files to on-premises Windows Servers.",
    "Azure Table Storage is a NoSQL key-value store for semi-structured data with massive scale and low cost, while Azure Queue Storage provides reliable messaging between application components with at-least-once delivery semantics.",
  ],
  detailed: [
    "## Azure Blob Storage\n\nBlob Storage stores unstructured data as objects (blobs) within containers inside a storage account. There are three blob types: block blobs (optimized for streaming and storing documents, images, videos — up to 190.7 TiB), append blobs (optimized for append operations like logging — up to 195 GiB), and page blobs (optimized for random read/write operations, used by VM disks — up to 8 TiB). Access tiers control cost: Hot tier has the highest storage cost but lowest access cost, Cool tier reduces storage cost by about 40% but doubles access cost and requires a minimum 30-day retention, and Archive tier reduces storage cost by roughly 90% but requires rehydration (hours) before data can be read. Lifecycle management rules automate tier transitions and deletion based on last modified or last accessed dates.",
    "## Storage Redundancy\n\nAzure Storage offers multiple redundancy options. Locally Redundant Storage (LRS) replicates data three times within a single datacenter — cheapest option, protects against disk and rack failures. Zone-Redundant Storage (ZRS) replicates across three availability zones in a region — protects against datacenter-level failures. Geo-Redundant Storage (GRS) replicates to a secondary region hundreds of miles away with LRS in each region — protects against regional disasters but secondary is read-only during failover. Read-Access GRS (RA-GRS) allows read access to the secondary region at all times. Geo-Zone-Redundant Storage (GZRS) combines ZRS in the primary region with LRS in a secondary region for maximum durability (16 nines).",
    "## Azure Managed Disks\n\nManaged Disks abstract the storage account management for VM disks. Standard HDD disks are for dev/test and non-critical workloads (up to 2,000 IOPS). Standard SSD disks provide consistent performance for web servers and lightly used production apps (up to 6,000 IOPS). Premium SSD disks (P-series) deliver high-performance, low-latency storage for production workloads (up to 20,000 IOPS per disk). Ultra Disks provide the highest performance (up to 160,000 IOPS and 4,000 MB/s throughput) with sub-millisecond latency for data-intensive workloads like SAP HANA and top-tier databases. Disk bursting allows Standard SSD and Premium SSD disks to temporarily exceed their provisioned IOPS and throughput limits to handle spiky workloads. Snapshots create point-in-time copies stored as page blobs, and incremental snapshots store only the delta from the previous snapshot.",
    "## Azure Files and File Sync\n\nAzure Files provides fully managed file shares accessible via SMB 3.0/3.1.1 (port 445) or NFS 4.1 protocols. Standard file shares use HDD-backed storage (up to 100 TiB per share with large file shares enabled), while Premium file shares use SSD-backed storage with provisioned IOPS model. Azure File Sync extends Azure Files to on-premises by installing agents on Windows Servers that maintain a local cache of frequently accessed files while tiering cold files to the cloud. Cloud tiering uses a heat map to determine which files to keep locally; when a tiered file is accessed, it is transparently recalled from Azure. This enables hybrid scenarios where on-premises servers act as fast caches while Azure Files serves as the authoritative source.",
    "## Table and Queue Storage\n\nAzure Table Storage is a NoSQL key-value store designed for storing terabytes of semi-structured data. Each entity (row) is identified by a partition key and row key combination, supporting up to 252 custom properties and a maximum entity size of 1 MiB. Partition keys determine data distribution across storage partitions — choosing an effective partition key is critical for performance and scalability. For richer querying and global distribution, Azure Cosmos DB Table API provides a premium alternative with the same data model. Azure Queue Storage provides asynchronous messaging between components, supporting messages up to 64 KiB with a maximum TTL of 7 days. Queues support at-least-once delivery with a visibility timeout mechanism — when a consumer reads a message, it becomes invisible to other consumers for a configurable period, and if not deleted within that period, it reappears for retry.",
    "## Security and Access Control\n\nStorage account security is multi-layered. Data is encrypted at rest with 256-bit AES encryption (Storage Service Encryption) using Microsoft-managed keys by default or customer-managed keys in Azure Key Vault. Data in transit is encrypted via HTTPS (enforced by default) or SMB 3.0 encryption. Access is controlled through Entra ID RBAC (recommended), shared access signatures (SAS tokens with granular permissions, time bounds, and IP restrictions), or storage account access keys (full access, should be rotated regularly). Network security includes VNET service endpoints (traffic stays on the Azure backbone), private endpoints (private IP within your VNET), and storage firewalls (IP allowlists). Immutable storage (WORM — Write Once, Read Many) supports time-based retention and legal hold policies for compliance with SEC 17a-4, CFTC, and FINRA regulations.",
  ],
  interviewQA: [
    {
      q: "When should you choose Archive tier over Cool tier in Azure Blob Storage?",
      a: "Choose Archive tier for data that is rarely accessed (less than once per year) and can tolerate high retrieval latency (hours). Archive storage cost is about 90% less than Hot tier, but rehydrating a blob takes 1-15 hours (standard priority) or under 1 hour (high priority, at higher cost). Cool tier is better for data accessed less than once per month but still needs to be immediately readable. Cool tier also has a 30-day minimum retention policy, while Archive has a 180-day minimum. Typical Archive use cases include compliance archives, long-term backups, and raw data for future analytics.",
      followUps: [
        "How does lifecycle management automate tier transitions?",
        "What is the cost difference between standard and high-priority rehydration?",
      ],
    },
    {
      q: "Explain the difference between LRS, ZRS, GRS, and GZRS redundancy options.",
      a: "LRS replicates data three times within a single datacenter (protects against disk/rack failure, 11 nines durability). ZRS replicates across three availability zones in the primary region (protects against datacenter failure, 12 nines). GRS replicates with LRS in the primary region plus asynchronously to a secondary region with LRS (protects against regional disaster, 16 nines). GZRS combines ZRS in the primary region with LRS in the secondary region (maximum protection, 16 nines). Read-access variants (RA-GRS, RA-GZRS) allow reading from the secondary region at all times, not just during failover.",
      followUps: [
        "What is the RPO for geo-replication?",
        "How do you initiate a storage account failover?",
      ],
    },
    {
      q: "How do you secure an Azure Storage account in a production environment?",
      a: "Use Entra ID RBAC for identity-based access instead of shared keys. Disable shared key access if not needed. Use private endpoints to expose storage only within your VNET, removing public internet exposure. Enable storage firewall rules to restrict access to specific IPs or VNETs. Enforce HTTPS-only with the 'Secure transfer required' setting. Use customer-managed keys in Key Vault for encryption at rest if regulatory requirements demand key control. Enable soft delete for blobs and containers to protect against accidental deletion. Enable Azure Defender for Storage to detect anomalous access patterns. Rotate access keys regularly and use short-lived SAS tokens with minimum required permissions.",
      followUps: [
        "What is the difference between a service SAS and an account SAS?",
        "How do private endpoints differ from service endpoints?",
      ],
    },
    {
      q: "What factors determine IOPS and throughput for Azure Managed Disks?",
      a: "Performance depends on the disk tier and size. For Premium SSD, IOPS and throughput scale with disk size (e.g., P30 = 5,000 IOPS, P80 = 20,000 IOPS). The VM size also imposes an IOPS cap — the effective performance is the minimum of the disk limit and the VM limit. Disk bursting (credit-based for smaller disks, on-demand for larger) allows temporary performance spikes. Ultra Disks decouple IOPS and throughput from disk size — you independently provision capacity, IOPS (up to 160,000), and throughput (up to 4,000 MB/s). Host caching (ReadOnly or ReadWrite) on Premium SSD further improves read performance by using the VM's local SSD as cache.",
    },
  ],
  mcqs: [
    {
      q: "What is the minimum retention period for the Azure Blob Storage Archive tier?",
      options: ["7 days", "30 days", "90 days", "180 days"],
      answerIndex: 3,
      explanation:
        "Archive tier has a 180-day minimum retention period. Deleting or moving a blob before 180 days incurs an early deletion charge. Cool tier has a 30-day minimum retention period.",
    },
    {
      q: "Which Azure Storage redundancy option provides the highest durability?",
      options: ["LRS", "ZRS", "GRS", "GZRS"],
      answerIndex: 3,
      explanation:
        "GZRS (Geo-Zone-Redundant Storage) provides 16 nines of durability by combining ZRS in the primary region (cross-zone) with LRS replication to a secondary region.",
    },
    {
      q: "What is the maximum IOPS supported by Azure Ultra Disks?",
      options: ["6,000", "20,000", "80,000", "160,000"],
      answerIndex: 3,
      explanation:
        "Ultra Disks support up to 160,000 IOPS and 4,000 MB/s throughput with sub-millisecond latency, and allow independent provisioning of capacity, IOPS, and throughput.",
    },
    {
      q: "Which protocol does Azure Files NOT support?",
      options: ["SMB 3.0", "NFS 4.1", "iSCSI", "REST API"],
      answerIndex: 2,
      explanation:
        "Azure Files supports SMB 3.0/3.1.1, NFS 4.1, and REST API access. It does not support iSCSI — block-level storage via iSCSI is provided by Azure Managed Disks or Azure Elastic SAN.",
    },
  ],
  flashcards: [
    {
      front: "What are the three Azure Blob Storage access tiers?",
      back: "Hot (frequent access, lowest read cost), Cool (infrequent, lower storage cost, 30-day minimum), and Archive (rare access, lowest storage cost, hours-long rehydration, 180-day minimum).",
    },
    {
      front: "What is Azure File Sync?",
      back: "A service that caches frequently accessed Azure Files data on on-premises Windows Servers, tiering cold files to the cloud and recalling them transparently when accessed.",
    },
    {
      front: "What are the four managed disk tiers?",
      back: "Standard HDD (dev/test), Standard SSD (web servers), Premium SSD (production, up to 20K IOPS), Ultra Disk (up to 160K IOPS, sub-ms latency).",
    },
    {
      front: "How does Azure Queue Storage ensure at-least-once delivery?",
      back: "When a consumer reads a message, it becomes invisible for a configurable visibility timeout. If the consumer does not delete the message before the timeout expires, it reappears in the queue for another consumer to process.",
    },
    {
      front: "What is a private endpoint for Azure Storage?",
      back: "A network interface with a private IP in your VNET that connects to Azure Storage over the Azure backbone, removing the need for public internet access to the storage account.",
    },
    {
      front: "What is immutable blob storage?",
      back: "WORM (Write Once, Read Many) storage that supports time-based retention policies and legal holds, ensuring blobs cannot be modified or deleted during the retention period for regulatory compliance.",
    },
    {
      front: "How does Azure Table Storage partition data?",
      back: "Each entity is identified by a partition key and row key. The partition key determines which storage partition holds the entity. Entities with the same partition key are stored together for efficient range queries.",
    },
    {
      front: "What is disk bursting in Azure Managed Disks?",
      back: "A capability that allows Standard SSD and Premium SSD disks to temporarily exceed their provisioned IOPS and throughput limits. Credit-based bursting accumulates burst credits during low usage; on-demand bursting is available for larger disks.",
    },
  ],
  glossary: [
    {
      term: "Block Blob",
      definition:
        "A blob type optimized for streaming and storing large objects as blocks that can be uploaded in parallel and committed as a single blob, supporting up to 190.7 TiB.",
    },
    {
      term: "Rehydration",
      definition:
        "The process of making an Archive-tier blob readable by changing its tier to Hot or Cool. Standard rehydration takes up to 15 hours; high-priority rehydration completes in under 1 hour.",
    },
    {
      term: "SAS Token",
      definition:
        "A Shared Access Signature that provides delegated access to storage resources with specified permissions, time bounds, IP restrictions, and protocol requirements without exposing account keys.",
    },
    {
      term: "Storage Service Encryption (SSE)",
      definition:
        "Automatic encryption of data at rest in Azure Storage using 256-bit AES, applied to all storage services with Microsoft-managed or customer-managed keys.",
    },
    {
      term: "Cloud Tiering",
      definition:
        "An Azure File Sync feature that automatically moves infrequently accessed files from on-premises servers to Azure Files, replacing them with reparse points that transparently recall files on access.",
    },
    {
      term: "Visibility Timeout",
      definition:
        "The period during which a queue message is hidden from other consumers after being read. If the consumer does not delete the message before the timeout, it becomes visible again for reprocessing.",
    },
    {
      term: "Incremental Snapshot",
      definition:
        "A managed disk snapshot that stores only the changes (delta) since the previous snapshot, significantly reducing storage costs compared to full snapshots.",
    },
    {
      term: "Service Endpoint",
      definition:
        "A VNET feature that routes traffic to Azure Storage over the Azure backbone network, restricting storage access to specific subnets while the storage account retains its public IP.",
    },
  ],
};
