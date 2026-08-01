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
  deepDive: [
    "**Azure Blob Storage** operates on a *three-layer architecture*: the **front-end layer** (FE) handles authentication and request routing, the **partition layer** manages the *namespace* and maps blob names to storage locations, and the **stream layer** (DFS) persists data as *extents* across multiple disks. Each storage account is assigned to a **storage stamp** — a cluster of ~10-20 racks with *fault domains*. The **partition layer** maintains a *range-partitioned index* (the **Object Table**) that maps `(AccountName, ContainerName, BlobName)` to the blob's extent locations. Block blobs are composed of **committed block lists** — each `Put Block` uploads a block (up to *4000 MiB* with `2022-11-02` API) identified by a *base64 block ID*, and `Put Block List` atomically commits the blob. The partition layer uses a **Paxos-based replication** protocol within the stamp to ensure *strong consistency* for all writes. *Append blobs* use a **single-writer append** pattern where new blocks are appended sequentially — ideal for `log aggregation` and `audit trails`. The **partition server** handles *load balancing* by splitting hot partitions (a process called **partition splitting**) when a range receives disproportionate traffic, and merging cold partitions to reduce overhead.",
    "**Storage redundancy** relies on two distinct replication mechanisms: *synchronous intra-region* replication and *asynchronous cross-region* replication. For **LRS**, all three replicas are written *synchronously* within a single storage stamp before the write is acknowledged — the **RPO is zero** and the **RTO** depends on hardware recovery (typically *minutes*). **ZRS** extends this by writing *synchronously* across **three availability zones** — each zone is an independent datacenter with its own power, cooling, and networking — achieving `RPO = 0` with an **RTO of ~12 hours** in a zone failure scenario. For **GRS** and **GZRS**, the primary region commits writes synchronously (LRS or ZRS respectively), then *asynchronously* replicates to the **secondary region** using a **background geo-replication process**. The `RPO for geo-replication is typically under 15 minutes` (no SLA guarantee). During a **customer-initiated failover** (`az storage account failover`), the secondary becomes primary — the **RTO is approximately 1 hour**, but *any writes not yet replicated are lost*. With **RA-GRS** / **RA-GZRS**, the secondary endpoint (`accountname-secondary.blob.core.windows.net`) serves *read-only* requests with **eventual consistency** — the `Last-Sync-Time` property indicates how far behind the secondary is.",
    "**Azure Files** supports two protocols with distinct negotiation and performance characteristics. **SMB** (Server Message Block) uses `port 445` and negotiates the highest mutually supported dialect — Azure Files supports **SMB 3.0** and **SMB 3.1.1** with *AES-128-GCM* and *AES-256-GCM* encryption. For **Premium file shares**, performance scales with provisioned share size: each GiB provisions *1 IOPS* (baseline) + **burst up to 10,000 IOPS** using a *credit bucket model*. Enable `SMB Multichannel` on Premium shares to aggregate bandwidth across **up to 4 NIC channels**, increasing throughput from ~100 MB/s to over *400 MB/s* for a single client. **NFS 4.1** is supported *only on Premium file shares* and requires a **VNET** (no public internet access) — NFS shares use `nconnect` mount option (up to **16 connections**) for parallelism. Performance tuning tips: use `max_read_ahead_kb=16384` for sequential workloads, set `rsize=1048576,wsize=1048576` for large I/O sizes, and enable **metadata caching** with `actimeo=30`. For *latency-sensitive workloads*, co-locate compute in the **same availability zone** as the Premium file share and use **Accelerated Networking** on the VM to reduce round-trip time to *sub-millisecond* levels."
  ],
  code: [
    {
      language: "bash",
      caption: "Create a storage account with GZRS redundancy and enforce HTTPS-only access",
      source: `# Create a resource group
az group create \\
  --name rg-storage-prod \\
  --location eastus2

# Create a storage account with GZRS redundancy
az storage account create \\
  --name stproddata2024 \\
  --resource-group rg-storage-prod \\
  --location eastus2 \\
  --sku Standard_GZRS \\
  --kind StorageV2 \\
  --access-tier Hot \\
  --min-tls-version TLS1_2 \\
  --https-only true \\
  --allow-blob-public-access false

# Enable blob soft delete with 30-day retention
az storage blob service-properties delete-policy update \\
  --account-name stproddata2024 \\
  --enable true \\
  --days-retained 30`,
    },
    {
      language: "json",
      caption: "Lifecycle management policy: transition blobs from Hot to Cool after 30 days, to Archive after 180 days, and delete after 365 days",
      source: `{
  "rules": [
    {
      "enabled": true,
      "name": "lifecycle-tiering-rule",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            },
            "tierToArchive": {
              "daysAfterModificationGreaterThan": 180
            },
            "delete": {
              "daysAfterModificationGreaterThan": 365
            }
          },
          "snapshot": {
            "delete": {
              "daysAfterCreationGreaterThan": 90
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["data/", "logs/", "backups/"]
        }
      }
    }
  ]
}`,
    },
    {
      language: "bash",
      caption: "Set up a private endpoint for a storage account to restrict access to a VNET",
      source: `# Create a private endpoint for blob storage
az network private-endpoint create \\
  --name pe-stproddata-blob \\
  --resource-group rg-storage-prod \\
  --vnet-name vnet-prod \\
  --subnet snet-private-endpoints \\
  --private-connection-resource-id $(az storage account show \\
    --name stproddata2024 \\
    --resource-group rg-storage-prod \\
    --query id -o tsv) \\
  --group-id blob \\
  --connection-name conn-stproddata-blob

# Create a private DNS zone for blob storage
az network private-dns zone create \\
  --resource-group rg-storage-prod \\
  --name privatelink.blob.core.windows.net

# Link DNS zone to VNET
az network private-dns zone vnet-link create \\
  --resource-group rg-storage-prod \\
  --zone-name privatelink.blob.core.windows.net \\
  --name link-vnet-prod \\
  --virtual-network vnet-prod \\
  --registration-enabled false

# Create DNS zone group for automatic DNS record management
az network private-endpoint dns-zone-group create \\
  --resource-group rg-storage-prod \\
  --endpoint-name pe-stproddata-blob \\
  --name default \\
  --private-dns-zone privatelink.blob.core.windows.net \\
  --zone-name blob`,
    },
  ],
  diagrams: [
    {
      title: "Azure Storage Services Architecture",
      kind: "architecture",
      caption: "Overview of Azure storage services under a storage account, their protocols, and primary use cases.",
      mermaid: `graph TD
    SA["Storage Account"]
    Blob["Blob Storage<br/>Objects and unstructured data"]
    Files["Azure Files<br/>SMB and NFS shares"]
    Queue["Queue Storage<br/>Async messaging"]
    Table["Table Storage<br/>NoSQL key-value"]
    Disk["Managed Disks<br/>Block storage for VMs"]

    SA --> Blob
    SA --> Files
    SA --> Queue
    SA --> Table

    Blob --> BB["Block Blobs<br/>Up to 190 TiB"]
    Blob --> AB["Append Blobs<br/>Log streams"]
    Blob --> PB["Page Blobs<br/>Random read/write"]
    Files --> SMB["SMB 3.0/3.1.1<br/>Port 445"]
    Files --> NFS["NFS 4.1<br/>Premium only"]
    Disk --> HDD["Standard HDD"]
    Disk --> SSD["Premium SSD"]
    Disk --> Ultra["Ultra Disk<br/>160K IOPS"]`,
    },
    {
      title: "Choosing the Right Azure Storage Type",
      kind: "flow",
      caption: "Decision flow for selecting the correct Azure storage service based on data type, access pattern, and performance requirements.",
      mermaid: `flowchart TD
    A["What type of data?"] --> B{"Structured or<br/>unstructured?"}
    B -->|"Unstructured objects<br/>images, video, backups"| C["Blob Storage"]
    B -->|"File shares<br/>shared file system"| D["Azure Files"]
    B -->|"Semi-structured<br/>key-value rows"| E["Table Storage"]
    B -->|"Messages between<br/>app components"| F["Queue Storage"]
    B -->|"VM block storage"| G{"Performance tier?"}
    C --> H{"Access frequency?"}
    H -->|"Frequent"| I["Hot Tier"]
    H -->|"Infrequent"| J["Cool Tier"]
    H -->|"Rare, archival"| K["Archive Tier"]
    G -->|"Dev/test"| L["Standard HDD"]
    G -->|"Production workloads"| M["Premium SSD"]
    G -->|"High IOPS databases"| N["Ultra Disk"]`,
    },
    {
      title: "Storage Redundancy Architecture",
      kind: "architecture",
      caption: "How LRS, ZRS, GRS, and GZRS replicate data across datacenters and regions, with synchronous and asynchronous replication boundaries.",
      mermaid: `graph TD
    subgraph Primary["Primary Region"]
      subgraph Zone1["Availability Zone 1"]
        R1["Replica 1"]
      end
      subgraph Zone2["Availability Zone 2"]
        R2["Replica 2"]
      end
      subgraph Zone3["Availability Zone 3"]
        R3["Replica 3"]
      end
    end
    subgraph Secondary["Secondary Region"]
      subgraph DC["Single Datacenter"]
        R4["Replica 4"]
        R5["Replica 5"]
        R6["Replica 6"]
      end
    end
    R1 -->|"Sync - ZRS/GZRS"| R2
    R1 -->|"Sync - ZRS/GZRS"| R3
    R1 -->|"Async GRS/GZRS RPO under 15 min"| R4
    R4 --- R5
    R4 --- R6`,
    },
    {
      title: "Blob Storage Access Tier Lifecycle",
      kind: "flow",
      caption: "Automated blob tier transitions driven by lifecycle management policies, including rehydration paths and snapshot deletion.",
      mermaid: `flowchart LR
    A["Blob Created - Hot Tier"] -->|"30 days since modified"| B["Cool Tier"]
    B -->|"180 days since modified"| C["Archive Tier"]
    C -->|"365 days since modified"| D["Deleted"]
    C -->|"Rehydrate standard up to 15h"| B
    B -->|"Access triggers recall"| A
    A -->|"Snapshot created"| E["Snapshot"]
    E -->|"90 days since creation"| D`,
    },
  ],
  comparison: {
    columns: ["Feature", "LRS", "ZRS", "GRS / RA-GRS", "GZRS / RA-GZRS"],
    rows: [
      ["**Replication scope**", "Single datacenter", "Three availability zones", "Two regions (LRS + LRS)", "Two regions (ZRS + LRS)"],
      ["**Durability (annual)**", "*11 nines* (99.999999999%)", "*12 nines* (99.9999999999%)", "*16 nines* (99.99999999999999%)", "*16 nines* (99.99999999999999%)"],
      ["**Availability SLA (read)**", "99.9%", "99.9%", "99.99% (RA-GRS)", "99.99% (RA-GZRS)"],
      ["**Protects against**", "Disk/rack failure", "Datacenter failure", "Regional disaster", "Datacenter + regional disaster"],
      ["**Write consistency**", "*Synchronous* (3 local copies)", "*Synchronous* (3 zone copies)", "*Sync* primary + *async* secondary", "*Sync* primary (ZRS) + *async* secondary"],
      ["**RPO**", "`0` (local)", "`0` (zonal)", "`< 15 minutes` (geo)", "`< 15 minutes` (geo)"],
      ["**RTO (failover)**", "Minutes (hardware)", "~12 hours (zone)", "~1 hour (customer-initiated)", "~1 hour (customer-initiated)"],
      ["**Secondary read access**", "N/A", "N/A", "Yes (RA-GRS)", "Yes (RA-GZRS)"],
      ["**Relative cost**", "*Lowest*", "*Moderate*", "*Higher*", "*Highest*"],
      ["**Best for**", "Dev/test, non-critical data", "High availability in-region", "Disaster recovery", "Maximum durability + availability"],
    ],
  },
  exercises: [
    "**Lab 1 — Blob Lifecycle Automation:** Create a storage account with `az storage account create --sku Standard_LRS`. Upload 10+ blobs to a container using `az storage blob upload-batch`. Apply a lifecycle management policy that transitions blobs to *Cool* after 7 days and *Archive* after 14 days. Verify the policy with `az storage account management-policy show` and monitor tier transitions in the **Azure Portal > Storage account > Lifecycle management** blade.",
    "**Lab 2 — Private Endpoint Networking:** Deploy a VNET with two subnets (`workload` and `private-endpoints`). Create a storage account and configure a **private endpoint** for the `blob` sub-resource. Set up a **Private DNS Zone** (`privatelink.blob.core.windows.net`) linked to the VNET. From a VM in the workload subnet, verify `nslookup <account>.blob.core.windows.net` resolves to the *private IP*. Disable public network access and confirm external requests are blocked.",
    "**Lab 3 — Geo-Redundancy Failover Drill:** Create a **GRS** storage account and upload critical test data. Enable **RA-GRS** and read from the `accountname-secondary.blob.core.windows.net` endpoint. Check the `Last-Sync-Time` header to observe replication lag. Initiate a **customer-managed failover** with `az storage account failover` and measure the *RTO*. After failover, verify the account is now **LRS** in the (former) secondary region and re-enable geo-redundancy.",
    "**Lab 4 — Azure Files with SMB Multichannel:** Create a **Premium file share** (FileStorage account kind, `Premium_LRS` SKU). Enable **SMB Multichannel** via `az storage account file-service-properties update --enable-smb-multichannel`. Mount the share from a Windows VM with multiple NICs and run `robocopy` to benchmark throughput. Compare single-channel vs. multichannel performance using *perfmon* counters for `SMB Client Shares\\Avg. Bytes/Read`.",
    "**Lab 5 — Immutable Storage for Compliance:** Create a blob container and enable a **time-based retention policy** with a 30-day retention period using `az storage container immutability-policy create`. Upload a blob and attempt to *delete* or *overwrite* it — observe the `409 Conflict` error. Lock the policy (irreversible) and verify that even a *storage account owner* cannot shorten the retention period. Add a **legal hold** tag and confirm it prevents deletion independently of the retention policy.",
  ],
  cheatSheet: [
    "Create storage account: `az storage account create --name <name> --resource-group <rg> --sku Standard_ZRS --kind StorageV2`",
    "Upload blob: `az storage blob upload --account-name <acct> --container-name <ctr> --name <blob> --file <local-path> --tier Hot`",
    "Set lifecycle policy: `az storage account management-policy create --account-name <acct> --resource-group <rg> --policy @policy.json`",
    "Initiate failover: `az storage account failover --name <acct> --resource-group <rg> --yes` (converts to *LRS* in secondary region)",
    "Generate SAS token: `az storage blob generate-sas --account-name <acct> --container-name <ctr> --name <blob> --permissions r --expiry 2024-12-31T23:59Z --https-only`",
    "Check geo-replication lag: `az storage account show --name <acct> --query geoReplicationStats` (shows `lastSyncTime` and replication status)",
  ],
  revisionNotes: [
    "**Redundancy hierarchy**: *LRS* (11 nines, single DC) < *ZRS* (12 nines, 3 zones) < *GRS/RA-GRS* (16 nines, 2 regions with LRS) <= *GZRS/RA-GZRS* (16 nines, ZRS primary + LRS secondary). Geo-replication is *asynchronous* with `RPO < 15 minutes`.",
    "**Access tiers and retention minimums**: *Hot* = no minimum, *Cool* = **30-day** minimum retention, *Archive* = **180-day** minimum retention. Archive rehydration: `standard priority` up to 15 hours, `high priority` under 1 hour. Only **block blobs** support tiering.",
    "**Security best practices**: Use *Entra ID RBAC* over shared keys. Enforce `--https-only true` and `--min-tls-version TLS1_2`. Use **private endpoints** (private IP in VNET) over service endpoints (public IP with route optimization). Enable `az storage account keys renew` on a regular rotation schedule.",
    "**Managed Disk performance**: Effective IOPS = `min(disk IOPS limit, VM IOPS limit)`. *Premium SSD* IOPS scales with disk size (P-series). *Ultra Disks* allow independent provisioning of IOPS (up to `160,000`) and throughput (up to `4,000 MB/s`). Enable **ReadOnly host caching** for read-heavy workloads on Premium SSD.",
    "**Azure Files protocols**: *SMB 3.x* on port `445` — works cross-platform, supports encryption in transit. *NFS 4.1* — **Premium shares only**, requires VNET (no public access), use `nconnect=16` for parallelism. Enable **SMB Multichannel** on Premium for up to *4x throughput* improvement.",
  ],
};
