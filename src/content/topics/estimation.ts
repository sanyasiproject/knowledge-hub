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
  deepDive: [
    `**The Philosophy of Estimation: Why Order-of-Magnitude Thinking Matters**

Back-of-the-envelope estimation is not about arriving at a precise number -- it is about developing *intuition* for scale. In system design, the difference between **10 QPS** and **10,000 QPS** is not just arithmetic; it dictates whether you need a single PostgreSQL instance or a distributed cluster with read replicas, caches, and load balancers. Order-of-magnitude thinking forces you to confront the *shape* of the problem before committing to a solution. When an interviewer asks you to estimate, they are testing whether you can translate **vague product requirements** into **concrete infrastructure constraints**. The goal is a rough compass bearing, not GPS coordinates. A 2x error is perfectly acceptable; a 100x error means you chose the wrong architecture entirely. This is why estimation is the *first* step in any system design discussion -- it tells you which problems are worth solving and which are negligible. Memorizing reference numbers (latencies, throughput limits, storage conversions) serves as your **calibration toolkit**, anchoring calculations to reality rather than guesswork.`,

    `**Common Pitfalls and Anti-Patterns in Estimation**

The most frequent mistake is **forgetting replication**. Raw storage estimates must be multiplied by the replication factor (typically *3x* for distributed systems), and many candidates present numbers that are a third of what is actually needed. The second major pitfall is **confusing peak and average traffic**. Systems must be provisioned for *peak* load, not average -- a service that handles 10K QPS on average but spikes to 50K during rush hour will collapse if sized for the average. Candidates also commonly **confuse throughput and latency**: high QPS (throughput) does not imply low latency, and vice versa. A batch processing system may have enormous throughput but multi-second latency per request. Other anti-patterns include: *ignoring the read/write ratio* (which determines whether to optimize for reads or writes), *neglecting data growth over time* (a 5-year projection can be 5-10x the year-one estimate), and *failing to account for metadata and indexes* (which can add 20-50% overhead on top of raw data). Finally, **not sanity-checking results** is a critical error -- always compare your answer to known reference points. If your estimate says a chat app needs 1 PB/day of bandwidth for text messages, something is wrong.`,

    `**Connecting Estimation to Capacity Planning and Real-World Infrastructure**

Estimation is the bridge between *system design* and *capacity planning*. Once you have approximate QPS, storage, and bandwidth numbers, you can map them to real infrastructure decisions. For compute, divide your peak QPS by the throughput of a single server (typically **1K-10K QPS** for a web server, depending on complexity) to determine the number of application servers needed. For storage, your total data estimate determines whether you need a single database, a sharded cluster, or an object storage service like **S3**. For bandwidth, your egress estimate determines CDN requirements and network costs -- at scale, bandwidth is often the *dominant* operational expense. In practice, capacity planning adds additional factors: **headroom** (typically 30-50% above peak for safety), **failover capacity** (if one availability zone goes down, can the remaining zones absorb the load?), and **auto-scaling lead time** (how quickly can new instances spin up?). Real-world infrastructure teams use estimation as a starting point, then refine with *load testing* and *production metrics*. The estimation skill you build in interviews translates directly to the capacity planning reviews that engineering teams conduct quarterly at companies like Google, Meta, and Amazon.`,
  ],
  code: [
    {
      language: "cpp",
      caption: "QPS Estimation Utility",
      source: `#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>

class QPSEstimator {
    // Utility for estimating Queries Per Second from user-level metrics.
    static constexpr long long SECONDS_PER_DAY = 100'000; // ~86,400 rounded

    long long dau_;
    double actions_per_user_;
    double peak_factor_;

public:
    QPSEstimator(long long dau, double actions_per_user, double peak_factor = 3.0)
        : dau_(dau), actions_per_user_(actions_per_user), peak_factor_(peak_factor) {}

    // Average QPS: DAU * actions_per_user / seconds_per_day
    double average_qps() const {
        return static_cast<double>(dau_) * actions_per_user_ / SECONDS_PER_DAY;
    }

    // Peak QPS = average QPS * peak_factor
    double peak_qps() const {
        return average_qps() * peak_factor_;
    }

    void report() const {
        std::cout << std::fixed << std::setprecision(0);
        std::cout << "DAU:              " << dau_ << "\\n"
                  << "Actions/user/day: " << actions_per_user_ << "\\n"
                  << "Average QPS:      " << average_qps() << "\\n"
                  << "Peak QPS (" << peak_factor_ << "x): "
                  << peak_qps() << "\\n";
    }
};

int main() {
    // Example: Twitter-like feed reads
    QPSEstimator estimator(300'000'000LL, 100.0, 3.0);
    estimator.report();
    // Average QPS: 300,000
    // Peak QPS (3.0x): 900,000
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Storage Estimation Calculator",
      source: `#include <cmath>
#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>

struct StorageEstimate {
    std::string daily_raw;
    std::string yearly_raw;
    std::string total_raw;
    std::string total_replicated;
    int replication_factor;
};

std::string human_readable(double size_bytes) {
    const char* units[] = {"B", "KB", "MB", "GB", "TB", "PB", "EB"};
    int i = 0;
    while (std::abs(size_bytes) >= 1024.0 && i < 6) {
        size_bytes /= 1024.0;
        ++i;
    }
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(1) << size_bytes << " " << units[i];
    return oss.str();
}

StorageEstimate estimate_storage(
    long long dau,
    double active_fraction,
    double items_per_user_per_day,
    long long item_size_bytes,
    long long metadata_size_bytes = 0,
    int replication_factor = 3,
    int retention_years = 5)
{
    double active_users     = dau * active_fraction;
    double items_per_day    = active_users * items_per_user_per_day;
    double size_per_item    = item_size_bytes + metadata_size_bytes;
    double daily_bytes      = items_per_day * size_per_item;
    double yearly_bytes     = daily_bytes * 365;
    double total_bytes      = yearly_bytes * retention_years;
    double replicated_bytes = total_bytes * replication_factor;

    return {
        human_readable(daily_bytes),
        human_readable(yearly_bytes),
        human_readable(total_bytes),
        human_readable(replicated_bytes),
        replication_factor,
    };
}

int main() {
    // Example: Photo sharing service
    auto result = estimate_storage(
        500'000'000LL,   // dau
        0.1,             // active_fraction
        2.0,             // items_per_user_per_day
        2'150'000LL,     // item_size_bytes (2.15 MB photo + thumbnails)
        1'000LL,         // metadata_size_bytes (1 KB)
        3,               // replication_factor
        5                // retention_years
    );
    std::cout << "daily_raw:        " << result.daily_raw        << "\\n"
              << "yearly_raw:       " << result.yearly_raw       << "\\n"
              << "total_raw:        " << result.total_raw        << "\\n"
              << "total_replicated: " << result.total_replicated << "\\n"
              << "replication:      " << result.replication_factor << "x\\n";
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Bandwidth Estimation Helper",
      source: `#include <cmath>
#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>

struct BandwidthEstimate {
    std::string avg_bandwidth;
    std::string peak_bandwidth;
    std::string daily_transfer;
    std::string avg_qps_str;
    std::string peak_qps_str;
};

std::string to_bitrate(double bytes_per_sec) {
    double bits = bytes_per_sec * 8.0;
    const char* units[] = {"bps", "Kbps", "Mbps", "Gbps", "Tbps"};
    int i = 0;
    while (std::abs(bits) >= 1000.0 && i < 4) {
        bits /= 1000.0;
        ++i;
    }
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(1) << bits << " " << units[i];
    return oss.str();
}

std::string to_volume(double total_bytes) {
    const char* units[] = {"B", "KB", "MB", "GB", "TB", "PB"};
    int i = 0;
    while (std::abs(total_bytes) >= 1024.0 && i < 5) {
        total_bytes /= 1024.0;
        ++i;
    }
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(1) << total_bytes << " " << units[i];
    return oss.str();
}

BandwidthEstimate estimate_bandwidth(
    long long dau,
    double requests_per_user_per_day,
    long long avg_response_size_bytes,
    double peak_factor = 3.0)
{
    constexpr long long SECONDS_PER_DAY = 100'000;

    double total_requests = static_cast<double>(dau) * requests_per_user_per_day;
    double avg_qps  = total_requests / SECONDS_PER_DAY;
    double peak_qps = avg_qps * peak_factor;

    double avg_bw   = avg_qps  * avg_response_size_bytes;
    double peak_bw  = peak_qps * avg_response_size_bytes;
    double daily_tx = total_requests * avg_response_size_bytes;

    std::ostringstream avg_s, peak_s;
    avg_s  << std::fixed << std::setprecision(0) << avg_qps;
    peak_s << std::fixed << std::setprecision(0) << peak_qps;

    return {
        to_bitrate(avg_bw),
        to_bitrate(peak_bw),
        to_volume(daily_tx),
        avg_s.str(),
        peak_s.str(),
    };
}

int main() {
    // Example: Video streaming service
    auto r = estimate_bandwidth(
        200'000'000LL,   // dau
        10.0,            // requests_per_user_per_day
        5'000'000LL,     // avg_response_size_bytes (5 MB per segment)
        3.0              // peak_factor
    );
    std::cout << "avg_bandwidth:  " << r.avg_bandwidth  << "\\n"
              << "peak_bandwidth: " << r.peak_bandwidth << "\\n"
              << "daily_transfer: " << r.daily_transfer << "\\n"
              << "avg_qps:        " << r.avg_qps_str    << "\\n"
              << "peak_qps:       " << r.peak_qps_str   << "\\n";
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "Estimation Framework Flow",
      kind: "flow",
      caption: "Step-by-step process for back-of-the-envelope estimation in system design interviews.",
      mermaid: `flowchart TD
    A["1. Clarify Requirements"] --> B["2. State Assumptions"]
    B --> C["3. Identify Key Metrics"]
    C --> D{Which metrics?}
    D --> E["QPS Estimation\nDAU x actions / 86400"]
    D --> F["Storage Estimation\nitems x size x retention"]
    D --> G["Bandwidth Estimation\nQPS x response size"]
    E --> H["Apply peak factor 2-3x"]
    F --> I["Apply replication 3x"]
    G --> J["Apply peak factor 2-3x"]
    H --> K["4. Sanity Check Results"]
    I --> K
    J --> K
    K --> L["5. Derive Infrastructure\nServers / Shards / CDN"]`,
    },
    {
      title: "Estimation Categories",
      kind: "mindmap",
      caption: "Key categories and sub-metrics involved in system design estimation.",
      mermaid: `mindmap
  root((Estimation))
    QPS
      Read QPS
      Write QPS
      Peak vs Average
    Storage
      Raw Data Size
      Replication Factor
      Retention Period
    Bandwidth
      Ingress
      Egress
      CDN Offload
    Infrastructure
      Server Count
      Database Shards
      Cache Nodes
    Reference Numbers
      Powers of 2
      Latency Hierarchy
      Seconds per Day`,
    },
    {
      title: "QPS to Infrastructure Derivation",
      kind: "architecture",
      caption: "How estimated QPS drives server count, caching, and sharding architectural decisions.",
      mermaid: `graph LR
    DAU["DAU\ne.g. 100M users"] --> QPS["Avg QPS\nDAU x actions / 86400"]
    QPS --> PEAK["Peak QPS\nAvg x 2-3x"]
    PEAK --> SERVERS["Server Count\nPeak QPS / QPS per server + 50% headroom"]
    PEAK --> CACHE["Cache Tier\nread-heavy ratio"]
    QPS --> STORAGE["Daily Storage\nQPS x record size x 86400"]
    STORAGE --> SHARDS["DB Shards\nstorage exceeds single node"]`,
    },
  ],
  comparison: {
    columns: ["Metric", "Formula", "Typical Range", "Key Consideration"],
    rows: [
      [
        "**QPS** (Queries/sec)",
        "`DAU x actions_per_user / 86,400`",
        "100 - 1,000,000 QPS",
        "*Peak is 2-3x average*; separate **read** and **write** QPS",
      ],
      [
        "**Storage** (total)",
        "`items/day x size x 365 x years x replication`",
        "GB to PB range",
        "Always multiply by **replication factor** (typically *3x*); include metadata",
      ],
      [
        "**Bandwidth** (egress)",
        "`QPS x avg_response_size`",
        "Mbps to Tbps",
        "*Media dominates* text by 100-1000x; CDN offloads 90%+ of egress",
      ],
      [
        "**Number of Servers**",
        "`peak_QPS / QPS_per_server`",
        "10 - 10,000 servers",
        "Add **30-50% headroom**; account for *failover* across availability zones",
      ],
    ],
  },
  exercises: [
    "**Estimate storage for a messaging app**: Assume 500M DAU, 40 messages/user/day, average message size 200 bytes, 5% of messages include a 200KB image. Calculate daily and yearly storage with *3x replication*. How does media vs. text storage compare?",
    "**Calculate QPS for a ride-sharing service**: Assume 20M DAU, each user opens the app 3 times/day, each session generates 50 location update pings and 2 API calls (search, book). What is the total *read* and *write* QPS? What is the peak QPS during rush hour (*5x average*)?",
    "**Estimate bandwidth for a music streaming platform**: Assume 100M DAU, average user streams 1 hour/day at 256 Kbps. What is the average and peak egress bandwidth? How much daily data transfer occurs? What percentage can a CDN offload?",
    "**Design the storage tier for a URL shortener**: Assume 500M new URLs/month, each record is 500 bytes, 10-year retention, 3x replication. What is the total storage? Would you use an RDBMS or NoSQL? Justify with your numbers.",
    "**Estimate server count for a social media feed service**: Given 200M DAU, 20 feed loads/user/day, and a single server handling 5,000 QPS, how many servers are needed for average load? For peak (*3x*)? Include *50% headroom* for failover.",
  ],
  cheatSheet: [
    "**Seconds per day**: 86,400 ~ *10^5* (use 100K for quick division)",
    "**QPS shortcut**: 1M requests/day ~ *12 QPS*; 1B requests/day ~ *12K QPS*",
    "**Storage units**: each step is ~**1000x** -- KB -> MB -> GB -> TB -> PB (i.e., *2^10* per step)",
    "**Replication rule**: always multiply raw storage by the **replication factor** (default *3x*) -- forgetting this is a common interview mistake",
    "**Peak traffic**: design for **2-3x average** for normal apps; *10x+* for event-driven spikes (sports finals, flash sales)",
    "**Server capacity rule of thumb**: a typical web server handles **1K-10K QPS** depending on request complexity; divide peak QPS by this to get server count, then add *30-50% headroom*",
  ],
  revisionNotes: [
    "**Estimation is about order of magnitude**, not precision. A *2-5x* error is acceptable; a *100x* error means you chose the wrong architecture. Always round aggressively -- use **10^5** for seconds/day, powers of 10 for user counts.",
    "**Always separate reads from writes**. The *read/write ratio* determines your architecture: read-heavy systems (100:1) need `caches` and `read replicas`; write-heavy systems need `sharding`, `LSM-tree stores`, and *async processing*.",
    "**Three things candidates forget**: (1) *replication factor* -- multiply storage by 3x, (2) *peak vs. average* -- provision for peak (2-3x), not average, (3) *metadata and indexes* -- add 20-50% overhead on top of raw data.",
    "**The estimation-to-design pipeline**: QPS tells you how many **servers** and whether to **cache**. Storage tells you whether to use a **single DB**, **sharded cluster**, or **object store**. Bandwidth tells you whether you need a **CDN**. Always connect your numbers to *architectural decisions*.",
    "**Sanity-check every result** against known reference points. If a text-only chat app seems to need petabytes of bandwidth, recheck your math. Compare to public numbers: Twitter serves ~300K QPS for timelines, Instagram stores ~100M photos/day, Netflix peaks at ~100 Tbps egress.",
  ],
};
