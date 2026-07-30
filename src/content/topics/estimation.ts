import type { TopicContent } from "../types";

export const estimation: TopicContent = {
  quickSummary: [
    "Back-of-the-envelope estimation is the skill of quickly calculating approximate system requirements (QPS, storage, bandwidth) using simple math and reasonable assumptions.",
    "Start with user-facing numbers (DAU, actions per user) and derive system-level metrics (requests per second, data written per day, network bandwidth) through multiplication chains.",
    "Key reference numbers to memorize: powers of 2, latency comparisons, storage unit conversions, and common system capacities help anchor calculations.",
    "The goal is not precision but order-of-magnitude correctness -- determining whether you need 1 server or 1,000, gigabytes or petabytes, to guide architectural decisions.",
  ],
  detailed: [
    `## The Estimation Framework

Every estimation follows a three-step pattern: **define assumptions, build a formula, compute the result.**

**Step 1: Define assumptions**
State your assumptions explicitly. Interviewers want to see your reasoning, not a memorized answer.
- Daily Active Users (DAU): how many users use the system per day?
- Actions per user: how many of the key action does each user perform?
- Data per action: how much data is generated or consumed per action?
- Read/write ratio: what percentage of traffic is reads vs. writes?
- Growth factor: how much will traffic grow over the design horizon (typically 3-5 years)?

**Step 2: Build a formula**
Chain your assumptions with multiplication:
\`\`\`
QPS = DAU x actions_per_user / seconds_per_day
Storage/year = DAU x actions_per_user x data_per_action x 365
Bandwidth = QPS x average_response_size
\`\`\`

**Step 3: Compute and round**
Use round numbers. 86,400 seconds/day rounds to ~100,000 (10^5) for quick math. The answer should be within 2-5x of reality -- close enough to make architectural decisions.`,

    `## Essential Reference Numbers

**Powers of 2 (storage):**
| Power | Value | Approximate |
|-------|-------|-------------|
| 2^10 | 1,024 | ~1 Thousand (KB) |
| 2^20 | ~1 Million | ~1 MB |
| 2^30 | ~1 Billion | ~1 GB |
| 2^40 | ~1 Trillion | ~1 TB |
| 2^50 | ~1 Quadrillion | ~1 PB |

**Latency comparisons (Jeff Dean's numbers, approximate):**
| Operation | Latency |
|-----------|---------|
| L1 cache reference | 1 ns |
| L2 cache reference | 4 ns |
| Main memory reference | 100 ns |
| SSD random read | 16 us |
| HDD random read | 2 ms |
| Send 1 KB over 1 Gbps network | 10 us |
| Round trip within datacenter | 500 us |
| Round trip cross-continent | 150 ms |

**Useful conversions:**
- 1 day = 86,400 seconds ~ 10^5 seconds (round to 100K)
- 1 month ~ 2.5 million seconds ~ 2.5 x 10^6
- 1 year ~ 30 million seconds ~ 3 x 10^7
- 1 million requests/day ~ 12 QPS
- 1 billion requests/day ~ 12,000 QPS (12K)
- Average tweet/post: ~300 bytes text; with metadata: ~1 KB
- Average image: 200 KB-2 MB; average video: 5-50 MB per minute`,

    `## QPS Estimation

**Example: Twitter-like service**

Assumptions:
- 300M DAU
- Average user reads 100 tweets/day (timeline loads)
- Average user posts 2 tweets/day
- Peak traffic is 3x average

Read QPS:
\`\`\`
300M x 100 / 100K = 300,000 QPS (average)
Peak: 300K x 3 = 900K QPS
\`\`\`

Write QPS:
\`\`\`
300M x 2 / 100K = 6,000 QPS (average)
Peak: 6K x 3 = 18K QPS
\`\`\`

Read-to-write ratio: ~50:1 (read-heavy system).

**Implications:**
- Reads dominate: invest heavily in caching and read replicas.
- 900K peak read QPS requires horizontal scaling -- no single database handles this.
- Write QPS (18K peak) is manageable with a sharded write path.
- Consider fan-out-on-write (precompute timelines) vs. fan-out-on-read (assemble at read time).`,

    `## Storage Estimation

**Example: Photo sharing service (Instagram-like)**

Assumptions:
- 500M DAU
- 10% of users upload 2 photos/day = 100M photos/day
- Average photo: 2 MB (after compression)
- Store original + 3 thumbnails (50KB each) = ~2.15 MB per photo
- Metadata per photo: 1 KB (user ID, timestamp, location, caption)
- 5-year retention

Daily storage:
\`\`\`
100M photos x 2.15 MB = 215 TB/day
Metadata: 100M x 1 KB = 100 GB/day
\`\`\`

Annual storage:
\`\`\`
215 TB x 365 = ~78 PB/year (photos)
100 GB x 365 = ~36 TB/year (metadata)
\`\`\`

5-year storage:
\`\`\`
~390 PB photos + ~180 TB metadata
With 3x replication: ~1.2 EB photos
\`\`\`

**Implications:**
- Need object storage (S3-class) for photos, not a database.
- Metadata fits in a sharded relational or NoSQL database.
- CDN is essential for serving photos with low latency.
- Compression and deduplication strategies become critical at this scale.`,

    `## Bandwidth Estimation

**Example: Video streaming service**

Assumptions:
- 200M DAU
- Average user watches 1 hour/day
- Average bitrate: 5 Mbps (1080p adaptive)
- Peak concurrent viewers: 10% of DAU = 20M

Average egress bandwidth:
\`\`\`
200M users x 1 hour x 5 Mbps / 24 hours
= 200M x 5 Mbps / 24
= ~42M Mbps average
= ~42 Tbps average
\`\`\`

Peak bandwidth (concurrent viewers):
\`\`\`
20M viewers x 5 Mbps = 100 Tbps peak
\`\`\`

Daily data transfer:
\`\`\`
200M x 1 hour x 5 Mbps x 3600 sec/hour
= 200M x 18,000 Mb = 200M x 2.25 GB
= 450 PB/day
\`\`\`

**Implications:**
- CDN is non-negotiable; serving this from origin would be impossible.
- Adaptive bitrate streaming reduces bandwidth for users with slower connections.
- Edge caching of popular content dramatically reduces origin load.
- Bandwidth costs dominate operational expenses at this scale.

**General estimation tips:**
- Always state assumptions first and explain your reasoning.
- Round aggressively -- order of magnitude is what matters.
- Sanity-check results: does the answer make sense? Compare to known reference points.
- Consider peak vs. average: systems must handle peaks, not just averages.
- Factor in replication: storage requirements multiply by replication factor (typically 3x).`,
  ],
  interviewQA: [
    {
      q: "How do you estimate the QPS for a social media feed?",
      a: "Start with DAU (e.g., 300M), multiply by average feed loads per user per day (e.g., 10 timeline refreshes). Divide by seconds per day (~100K). That gives average read QPS: 300M x 10 / 100K = 30K QPS. For peak, multiply by 2-3x: 60-90K QPS. Write QPS: if 1% of users post once per day, that is 3M / 100K = 30 QPS. The massive read-to-write ratio (1000:1) means caching and precomputed timelines are essential.",
    },
    {
      q: "How would you estimate storage requirements for a URL shortener?",
      a: "Assumptions: 100M new URLs/month, each mapping is ~500 bytes (short code + original URL + metadata), 5-year retention. Monthly: 100M x 500B = 50GB. Five years: 50GB x 60 months = 3TB. With 3x replication: 9TB. This is very manageable -- fits in a single sharded database. The interesting design challenge is not storage but generating unique short codes at scale (base62 encoding, pre-generated ID ranges).",
    },
    {
      q: "Why do we use 10^5 instead of 86,400 for seconds per day?",
      a: "86,400 rounds to ~100,000 (10^5), which is within 16% accuracy. In back-of-envelope estimation, we care about order of magnitude, not precision. Using 10^5 makes mental math dramatically easier: dividing by 100,000 is just moving the decimal point 5 places. The 16% error is negligible when our assumptions (DAU, actions per user) already have larger uncertainty margins.",
    },
    {
      q: "How do you estimate bandwidth for a chat application?",
      a: "Assumptions: 50M DAU, 40 messages sent per user per day, average message 200 bytes. Ingress: 50M x 40 x 200B / 100K = 4 MB/s -- trivial. But each message is delivered to recipients. If average group size is 5, fan-out makes it 50M x 40 x 5 x 200B / 100K = 20 MB/s egress. With media (5% of messages include a 200KB image): 50M x 40 x 0.05 x 200KB / 100K = 20 GB/s. Media dominates bandwidth; text is negligible.",
    },
  ],
  mcqs: [
    {
      q: "How many seconds are in a day, rounded for estimation purposes?",
      options: [
        "10^3 (one thousand)",
        "10^4 (ten thousand)",
        "10^5 (one hundred thousand)",
        "10^6 (one million)",
      ],
      answerIndex: 2,
      explanation:
        "A day has 86,400 seconds, which rounds to approximately 10^5 (100,000). This approximation is within 16% and makes mental division much easier during back-of-envelope calculations.",
    },
    {
      q: "If a service has 100M DAU and each user makes 10 requests per day, what is the approximate average QPS?",
      options: [
        "1,000 QPS",
        "10,000 QPS",
        "100,000 QPS",
        "1,000,000 QPS",
      ],
      answerIndex: 1,
      explanation:
        "100M x 10 / 10^5 = 10^9 / 10^5 = 10^4 = 10,000 QPS. This is the average; peak would be 2-3x higher (20K-30K QPS).",
    },
    {
      q: "What is the approximate latency of a cross-continent network round trip?",
      options: [
        "1 microsecond",
        "500 microseconds",
        "150 milliseconds",
        "2 seconds",
      ],
      answerIndex: 2,
      explanation:
        "A cross-continent round trip (e.g., US East to Europe) takes approximately 150 milliseconds due to the speed of light in fiber and routing overhead. This is why CDNs and multi-region deployments matter for global applications.",
    },
    {
      q: "A system stores 1 KB per record, receives 10M new records per day, and needs 3x replication. How much storage per year?",
      options: [
        "~3.6 TB",
        "~11 TB",
        "~36 TB",
        "~110 TB",
      ],
      answerIndex: 1,
      explanation:
        "10M records x 1KB = 10GB/day. Per year: 10GB x 365 = 3.65TB. With 3x replication: 3.65 x 3 = ~11TB per year.",
    },
  ],
  flashcards: [
    {
      front: "Quick conversion: 1M requests/day = ? QPS",
      back: "1M / 100K (seconds/day) = ~10 QPS. Similarly: 100M requests/day = ~1K QPS. 1B requests/day = ~12K QPS.",
    },
    {
      front: "Storage scale: KB -> MB -> GB -> TB -> PB",
      back: "Each step is ~1000x (technically 1024x). KB = 10^3 bytes, MB = 10^6, GB = 10^9, TB = 10^12, PB = 10^15. Corresponds to 2^10, 2^20, 2^30, 2^40, 2^50.",
    },
    {
      front: "Latency hierarchy (fastest to slowest)",
      back: "L1 cache (1ns) -> L2 cache (4ns) -> RAM (100ns) -> SSD read (16us) -> Network in datacenter (500us) -> HDD read (2ms) -> Cross-continent round trip (150ms). Each jump is roughly 10-100x slower.",
    },
    {
      front: "Peak vs. average traffic rule of thumb",
      back: "Peak traffic is typically 2-3x average for most applications. For event-driven spikes (sports, elections), peaks can be 10x+ average. Always design for peak, not average.",
    },
    {
      front: "Why state assumptions explicitly in estimation?",
      back: "Assumptions are where the real thinking happens. Interviewers evaluate your reasoning and ability to make sensible assumptions, not your arithmetic. Different assumptions lead to different designs, which is the entire point of estimation.",
    },
    {
      front: "Replication factor in storage estimation",
      back: "Most production systems replicate data 3x for durability and availability. Always multiply raw storage by the replication factor. 10TB raw = 30TB with 3x replication.",
    },
    {
      front: "Read-heavy vs. write-heavy system implications",
      back: "Read-heavy (100:1 ratio): invest in caches, read replicas, CDN, denormalized read models. Write-heavy (1:1 or writes dominate): focus on write-optimized stores (LSM trees), sharding, async processing, eventual consistency.",
    },
  ],
  glossary: [
    {
      term: "QPS (Queries Per Second)",
      definition:
        "The number of requests a system handles per second. Calculated as total daily requests divided by seconds per day (~100K). Distinguish between read QPS and write QPS.",
    },
    {
      term: "DAU (Daily Active Users)",
      definition:
        "The number of unique users who interact with the system in a 24-hour period. The starting point for most system design estimations.",
    },
    {
      term: "Back-of-Envelope Estimation",
      definition:
        "Quick, approximate calculations using rounded numbers and stated assumptions to determine the order of magnitude for system requirements like QPS, storage, and bandwidth.",
    },
    {
      term: "Fan-Out",
      definition:
        "The multiplication of data or requests when one input triggers multiple outputs. A post seen by 1000 followers has a fan-out of 1000. Critical for bandwidth and storage estimation.",
    },
    {
      term: "Replication Factor",
      definition:
        "The number of copies of data maintained for durability and availability. A replication factor of 3 means each piece of data exists on 3 separate nodes, tripling raw storage requirements.",
    },
    {
      term: "Egress Bandwidth",
      definition:
        "The rate of data leaving the system to clients or external services. Typically the dominant bandwidth cost, especially for media-heavy applications.",
    },
    {
      term: "Peak-to-Average Ratio",
      definition:
        "The ratio of peak traffic to average traffic. Typically 2-3x for normal applications, but can be 10x+ for event-driven systems. Systems must be sized for peak capacity.",
    },
  ],
};
