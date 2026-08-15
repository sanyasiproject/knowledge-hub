import type { TopicContent } from "../types";

export const designWebCrawler: TopicContent = {
  quickSummary: [
    "A web crawler systematically downloads pages from the internet using a URL frontier (priority queue of URLs to visit), respecting politeness constraints like robots.txt and crawl-delay to avoid overwhelming hosts.",
    "URL deduplication is critical at scale: bloom filters provide O(1) membership checks with controllable false-positive rates, preventing billions of redundant fetches across a distributed crawler fleet.",
    "Distributed crawling partitions URLs by domain (consistent hashing) so each crawler node owns specific hosts, enabling per-host rate limiting and DNS caching while scaling horizontally to billions of pages.",
    "The crawl scheduler prioritizes URLs based on PageRank, freshness signals, and change frequency — a page updated hourly deserves re-crawling sooner than a static about-page unchanged for years.",
    "Content extraction pipelines parse HTML to extract text, metadata, and outgoing links; the link graph built from crawled pages feeds ranking algorithms and enables discovery of new content across the web.",
  ],
  detailed: [
    "## Capacity Estimation: Do the Math First\nBefore drawing boxes, anchor the design in numbers — interviewers expect the arithmetic, not just the conclusions. Throughput: 1 billion pages per month ÷ (30 days × 86,400 s ≈ 2.6M seconds) ≈ 385 pages/second sustained; provisioning for a 3x peak gives roughly 1,200 pages/second. Bandwidth: at an average page size of 100 KB, sustained ingress is 385 × 100 KB ≈ 38.5 MB/s ≈ 310 Mbps, and about 1 Gbps at peak — a real network-provisioning constraint, not a rounding error. Storage: 1B pages × 100 KB = 100 TB of raw HTML per month; keeping 5 historical versions per page pushes this toward 500 TB, which is why raw content lands in S3/HDFS rather than a database. Concurrency: with an average end-to-end fetch latency of 500 ms (DNS + TCP + TLS + download), sustaining 385 pages/s requires 385 × 0.5 ≈ 200 in-flight requests; async I/O means a handful of fetcher nodes suffice, so the fleet is sized by bandwidth and politeness spread, not CPU. Dedup memory: a Bloom filter for 10 billion URLs at 1% false-positive rate needs m = -n·ln(p)/(ln 2)² = 10^10 × 4.6 / 0.48 ≈ 9.6 × 10^10 bits ≈ 12 GB with k ≈ 7 hash functions. Frontier storage: billions of pending URLs at ~100 bytes each (URL + priority + metadata) is hundreds of GB — disk-backed by necessity, with only the hot front in memory. Key insight: politeness, not hardware, is usually the binding constraint — 385 pages/s at 1 request/host/second requires URLs spread across at least ~400 distinct hosts at any moment, so a frontier full of URLs from few hosts stalls the whole fleet regardless of how many fetchers you add.",

    "## URL Frontier and Crawl Scheduling\nThe URL frontier is the heart of a web crawler — it determines what gets crawled and in what order. A naive FIFO queue fails because it ignores page importance and politeness constraints. Instead, the frontier is split into a front queue (priority-based) and a back queue (politeness-based). The front queue uses multiple priority levels: seed URLs from high-authority domains get top priority, newly discovered links inherit a fraction of their parent page's importance, and re-crawl candidates are scored by estimated change frequency. The back queue ensures that at most one request is in-flight per host at any time, with configurable delays between requests to the same domain. A typical delay is 1-5 seconds per host, derived from robots.txt crawl-delay or measured server response times. At Google scale, the frontier holds billions of URLs and must be disk-backed (e.g., RocksDB) with an in-memory hot layer for the next N thousand URLs to fetch.",

    "## Politeness and robots.txt\nPoliteness is not optional — aggressive crawling gets your IP blocked and can bring down small websites. The crawler must fetch and cache robots.txt for every domain before crawling any page on that domain, respecting Disallow rules and Crawl-delay directives. The robots.txt cache should have a TTL of 24 hours and be refreshed before it expires. Know the semantics (RFC 9309): rules are grouped by User-agent and the crawler obeys the most specific group matching its name; within a group, the longest matching path rule wins between Allow and Disallow; a 4xx response for robots.txt means everything is allowed, while a persistent 5xx should be treated as full disallow; Crawl-delay is a non-standard extension that major engines interpret differently, so treat it as a hint with a sane cap (e.g., ignore delays over 30s or the host would take years to crawl). Beyond robots.txt, adaptive politeness monitors server response times: if a server starts returning 503s or slowing down, the crawler should exponentially back off on that domain. A good crawler also identifies itself with a descriptive User-Agent string and provides a contact URL. At scale, you need a distributed politeness enforcer — since URLs for the same domain might land on different crawler nodes, consistent hashing ensures a single node owns each domain, centralizing rate-limit decisions. Some crawlers implement a token-bucket rate limiter per domain, allowing bursts of 2-3 requests followed by mandatory delays.",

    "## URL Deduplication and Content Fingerprinting\nWith billions of pages, the same URL appears in countless link lists. URL-level dedup uses a bloom filter: a 10-billion-entry bloom filter with 1% false-positive rate needs about 12 GB of memory — feasible for a single machine, or partitioned across nodes. But URL dedup alone is insufficient because the same content appears at different URLs (www vs non-www, HTTP vs HTTPS, trailing slashes, query parameter reordering). Content-level dedup computes SimHash or MinHash fingerprints of page content and compares against previously seen fingerprints. SimHash produces a 64-bit fingerprint where similar documents have fingerprints differing in few bits — documents within Hamming distance 3 are considered near-duplicates. This two-layer dedup (URL bloom filter + content fingerprint) eliminates the vast majority of redundant work. The fingerprint store can be a distributed hash table like Cassandra, keyed by fingerprint with the canonical URL as value.",

    "## Distributed Architecture and Scaling\nA production crawler at scale (billions of pages/month) requires a distributed architecture. The system consists of a URL frontier service, multiple crawler workers, a DNS resolver cache, a content store, and a link extractor pipeline. Crawler workers are stateless — they pull URLs from the frontier, fetch pages, and push results (content + extracted links) to downstream queues. DNS resolution is a hidden bottleneck: resolving each hostname takes 10-100ms, so a local DNS cache is essential, backed by a shared DNS cache across the cluster. The content store (e.g., HDFS or S3) holds raw HTML and extracted text, partitioned by crawl date for easy re-processing. Link extraction runs as a separate pipeline — it parses HTML, normalizes URLs (lowercasing hostnames, removing fragments, canonicalizing query parameters), and feeds new URLs back into the frontier. Failure handling is critical: if a crawler node dies mid-fetch, the URLs it was processing must be returned to the frontier after a timeout. The system should track crawl metadata (last crawl time, HTTP status, response time) per URL to inform re-crawl scheduling.",

    "## Crawl Depth, Traps, and Quality\nSpider traps — URLs that generate infinite pages (calendars going forward forever, session IDs in URLs, faceted navigation producing combinatorial explosion) — can consume all crawler resources. Defense strategies include limiting crawl depth per domain, detecting URL patterns that produce unbounded growth (e.g., URLs containing dates that increment), and capping the total pages crawled per domain. Concrete detection heuristics: flag URLs longer than ~2 KB or with more than ~8 path segments or query parameters; flag repeating path segments (/a/b/a/b/a/b) which indicate a relative-link loop; flag high-entropy parameter values that differ across links to identical content (session IDs); flag dates beyond a sane window (a calendar link to the year 2087); and watch the yield ratio per URL pattern — if 10,000 fetches matching /calendar/* produced near-identical SimHash fingerprints and zero new outlinks, quarantine the pattern and crawl only a sample. URL normalization must strip session IDs, sort query parameters, and resolve relative URLs. Content quality filtering removes pages with very little text (boilerplate-heavy pages), duplicate content, and spam. A crawl budget per domain allocates more fetches to high-quality domains and fewer to low-quality ones. The budget is informed by historical crawl data: domains that consistently produce high-PageRank pages get larger budgets. Monitoring is essential — dashboards should track pages crawled per second, error rates per domain, frontier size, and dedup hit rates to detect problems early.",

    "## Recrawl Scheduling and Freshness\nCrawling is not a one-shot job — the web changes constantly, and a search index is only as good as its freshness. The scheduler maintains per-URL metadata (last crawl time, content checksum, observed change history) and models each page's change rate, classically as a Poisson process with rate λ estimated from how often successive crawls saw different checksums. A simple and effective policy is multiplicative-adaptive: if a page is unchanged since the last crawl, double its recrawl interval (capped at, say, 30 days); if it changed, halve it (floored at, say, 15 minutes for news front pages). This converges toward each page's true change frequency without wasting fetches. Priority for recrawl combines change rate with importance — a counterintuitive result from Cho and Garcia-Molina is that pages changing extremely fast should sometimes be crawled LESS often, because no feasible schedule keeps them fresh and the budget is better spent elsewhere. Signals that sharpen the estimate: HTTP Last-Modified and ETag headers (use conditional GETs — a 304 Not Modified costs almost no bandwidth), sitemap lastmod hints, and RSS/Atom feeds for push-style discovery. In practice: search engines split the crawl into a fast lane (news, home pages — minutes to hours) and a batch lane (the long tail — days to weeks), each with its own frontier and budget, so a burst of breaking news never starves long-tail coverage.",
  ],
  deepDive: [
    "The Mercator frontier is the canonical answer to 'how do you combine priority with politeness' and is worth knowing in mechanical detail. It has F front queues (one per priority level, e.g. F = 8) and B back queues, where every back queue holds URLs for exactly one host and B is sized at roughly 3x the number of fetcher threads so most threads find a ready host. A prioritizer assigns each incoming URL to a front queue; a router moves URLs from front queues (biased random selection favoring high priorities) into the back queue owning that URL's host, and a host-to-queue table tracks the mapping. The elegant piece is the heap: one entry per back queue keyed by the earliest time that host may be contacted again (last fetch time + crawl delay). A fetcher thread pops the heap root, blocks until its timestamp if needed, drains one URL from that back queue, fetches it, then re-inserts the heap entry with the new next-allowed time. When a back queue empties, the router refills it with URLs for a NEW host pulled from the front queues, keeping all B queues busy. Key insight: the heap makes politeness enforcement O(log B) per fetch and guarantees by construction that no host ever has two in-flight requests — there is no rate-limit check to forget, because the data structure cannot express a violation. Common mistake: candidates propose a single global priority queue plus a 'check if host is rate-limited' step at dispatch time — under skewed host distributions this degenerates into repeatedly popping and re-inserting blocked URLs, which is exactly the busy-wait Mercator's design eliminates.",

    "URL normalization looks trivial and is a minefield — getting it wrong either merges distinct pages or misses obvious duplicates, and both failure modes are silent. The safe, semantics-preserving transforms (RFC 3986): lowercase the scheme and host, decode unreserved percent-encodings (%7E to ~), uppercase remaining percent-encoding hex digits, remove default ports (:80, :443), resolve dot-segments in the path, and strip the fragment. The heuristic transforms are where judgment enters: sorting query parameters is usually safe; stripping known tracking parameters (utm_*, fbclid, gclid) is high-value; removing session IDs (jsessionid, PHPSESSID, sid) is essential to avoid infinite URL spaces; collapsing http/https and www/non-www variants is usually right but technically lossy. Warning: URL paths are case-sensitive by spec — /About and /about may be different pages on a Linux-served site — so lowercasing paths is a correctness bug, unlike lowercasing hosts. For example, example.com/index.html vs example.com/ often serve identical content, but only a content-level checksum can prove it; normalization alone cannot. Distributed coordination hangs off the normalized host: hash(host) mod N assigns every URL of a host to one crawler node, which localizes the robots.txt cache, DNS entry, politeness timer, and per-host state with zero cross-node chatter — a node that extracts a link to a foreign host simply forwards it to the owning node's frontier. Consistent hashing (rather than mod N) keeps reassignment to ~1/N of hosts when the fleet resizes, so politeness state and caches survive scaling events mostly intact.",

    "DNS resolution is a critical performance bottleneck that is often underestimated in crawler design. Each new hostname requires a DNS lookup that can take 10-200ms depending on resolver proximity and cache state. A production crawler resolves millions of unique hostnames per day, so relying on the system DNS resolver creates a serialization point. The solution is a dedicated DNS resolver layer: a cluster of caching DNS resolvers (e.g., Unbound) with aggressive TTL extension — even if a DNS record has a 5-minute TTL, the crawler can safely cache it for hours since IP changes are rare. Prefetching DNS for URLs in the frontier before they reach the front of the queue hides latency entirely. Some crawlers maintain a persistent hostname-to-IP mapping table, updated asynchronously, so DNS lookups never block the critical path of page fetching.",

    "The link graph built during crawling is itself a valuable data structure that feeds search ranking algorithms. Storing the full web graph (billions of nodes, trillions of edges) requires compressed adjacency lists. Webgraph compression exploits the fact that link targets from a single page tend to cluster (links often go to pages on the same domain or to popular domains), enabling reference coding where each adjacency list is stored as a delta from a similar reference list. This achieves 2-4 bits per edge for large web graphs, making it feasible to store the entire web graph in memory on a modest cluster. Graph algorithms like PageRank, HITS, and spam detection run on this compressed graph. Incremental graph updates from new crawls must be merged efficiently — a common approach is to rebuild the graph periodically (e.g., weekly) rather than updating it in real-time, since graph algorithms need a consistent snapshot.",

    "Handling JavaScript-rendered content (Single Page Applications) adds significant complexity to web crawling. Traditional crawlers only see the initial HTML, missing content loaded dynamically by JavaScript. A headless browser approach (using Chromium or similar) renders pages fully but is 10-100x slower than simple HTTP fetching and consumes far more resources (CPU, memory). The practical approach is a two-tier system: the fast tier does simple HTTP fetches for the majority of pages, while a slow tier uses headless rendering for domains known to require JavaScript. Detection of JS-dependent pages can be automated by comparing the DOM from HTTP fetch vs headless render and flagging domains with significant differences. Resource management for the headless tier is critical — each browser instance consumes 100-500 MB of RAM, so the fleet size for headless rendering is much smaller than for simple fetching.",

    "Politeness at true web scale creates an interesting scheduling problem. If you have a billion URLs to crawl across 100 million domains, and each domain allows one request per second, the theoretical throughput is 100 million pages per second — far more than any crawler fleet can handle. The real constraint becomes crawler fleet size and network bandwidth, not politeness. But the distribution is highly skewed: a few large domains (Wikipedia, government sites) have millions of pages each, while most domains have fewer than 100 pages. The crawler must balance between breadth (covering many domains) and depth (thoroughly crawling important domains). A common strategy is to allocate crawl budget proportional to domain importance (measured by incoming link count or historical quality), with a minimum budget for discovery of new domains. This creates a feedback loop: highly linked domains get crawled more, producing more links to discover, which must be dampened to ensure diversity.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Bloom filter for URL deduplication",
      source: `#include <vector>
#include <string>
#include <functional>
#include <cmath>

class BloomFilter {
    std::vector<bool> bits_;
    size_t num_hashes_;
    size_t size_;

    // Generate k hash values using double-hashing technique
    size_t hash(const std::string& url, size_t i) const {
        size_t h1 = std::hash<std::string>{}(url);
        size_t h2 = std::hash<std::string>{}(url + "salt");
        return (h1 + i * h2) % size_;
    }

public:
    // n = expected elements, fpr = false positive rate
    BloomFilter(size_t n, double fpr) {
        // Optimal size: m = -n * ln(fpr) / (ln2)^2
        size_ = static_cast<size_t>(
            -static_cast<double>(n) * std::log(fpr) / (std::log(2) * std::log(2))
        );
        // Optimal hash count: k = (m/n) * ln2
        num_hashes_ = static_cast<size_t>(
            (static_cast<double>(size_) / n) * std::log(2)
        );
        bits_.resize(size_, false);
    }

    void insert(const std::string& url) {
        for (size_t i = 0; i < num_hashes_; ++i) {
            bits_[hash(url, i)] = true;
        }
    }

    bool might_contain(const std::string& url) const {
        for (size_t i = 0; i < num_hashes_; ++i) {
            if (!bits_[hash(url, i)]) return false;
        }
        return true; // Possibly present (may be false positive)
    }

    double estimated_fpr() const {
        size_t set_bits = 0;
        for (bool b : bits_) if (b) ++set_bits;
        double fill = static_cast<double>(set_bits) / size_;
        return std::pow(fill, num_hashes_);
    }
};

// Usage in crawler:
// BloomFilter url_filter(10'000'000'000, 0.01); // 10B URLs, 1% FPR ~12GB
// if (!url_filter.might_contain(new_url)) {
//     url_filter.insert(new_url);
//     frontier.push(new_url);
// }`
    },
    {
      language: "cpp",
      caption: "URL frontier with priority and per-host politeness",
      source: `#include <queue>
#include <unordered_map>
#include <string>
#include <chrono>
#include <mutex>

struct CrawlURL {
    std::string url;
    std::string host;
    double priority;      // Higher = more important (e.g., PageRank)
    int depth;            // Hops from seed URL

    bool operator<(const CrawlURL& o) const {
        return priority < o.priority; // Max-heap by priority
    }
};

class URLFrontier {
    // Front queues: priority-based selection
    std::priority_queue<CrawlURL> front_queue_;

    // Back queues: per-host politeness enforcement
    struct HostQueue {
        std::queue<CrawlURL> urls;
        std::chrono::steady_clock::time_point next_allowed;
        std::chrono::milliseconds crawl_delay{1000}; // Default 1s
    };
    std::unordered_map<std::string, HostQueue> back_queues_;

    std::mutex mu_;

public:
    void add(CrawlURL url) {
        std::lock_guard<std::mutex> lk(mu_);
        front_queue_.push(std::move(url));
    }

    // Set per-host delay (from robots.txt)
    void set_crawl_delay(const std::string& host, int delay_ms) {
        std::lock_guard<std::mutex> lk(mu_);
        back_queues_[host].crawl_delay =
            std::chrono::milliseconds(delay_ms);
    }

    // Get next URL respecting politeness constraints
    bool get_next(CrawlURL& out) {
        std::lock_guard<std::mutex> lk(mu_);
        auto now = std::chrono::steady_clock::now();

        // Try to find a URL whose host is not rate-limited
        std::vector<CrawlURL> deferred;
        while (!front_queue_.empty()) {
            CrawlURL candidate = front_queue_.top();
            front_queue_.pop();

            auto& hq = back_queues_[candidate.host];
            if (now >= hq.next_allowed) {
                // Host is ready — schedule next allowed time
                hq.next_allowed = now + hq.crawl_delay;
                out = std::move(candidate);
                // Re-insert deferred URLs
                for (auto& d : deferred) front_queue_.push(std::move(d));
                return true;
            }
            deferred.push_back(std::move(candidate));
        }
        // All URLs are rate-limited — put them back
        for (auto& d : deferred) front_queue_.push(std::move(d));
        return false;
    }
};`
    },
    {
      language: "cpp",
      caption: "SimHash for near-duplicate content detection",
      source: `#include <string>
#include <vector>
#include <sstream>
#include <functional>
#include <cstdint>

class SimHash {
    static constexpr int HASH_BITS = 64;

    // Tokenize content into words (simplified)
    static std::vector<std::string> tokenize(const std::string& text) {
        std::vector<std::string> tokens;
        std::istringstream iss(text);
        std::string word;
        while (iss >> word) {
            // Generate shingles (2-word sliding window)
            if (!tokens.empty()) {
                tokens.push_back(tokens.back() + " " + word);
            }
            tokens.push_back(word);
        }
        return tokens;
    }

public:
    static uint64_t compute(const std::string& content) {
        int v[HASH_BITS] = {0}; // Dimension counters

        auto tokens = tokenize(content);
        for (const auto& token : tokens) {
            uint64_t h = std::hash<std::string>{}(token);
            for (int i = 0; i < HASH_BITS; ++i) {
                if (h & (1ULL << i))
                    v[i]++;
                else
                    v[i]--;
            }
        }

        // Build fingerprint: bit i is 1 if v[i] > 0
        uint64_t fingerprint = 0;
        for (int i = 0; i < HASH_BITS; ++i) {
            if (v[i] > 0)
                fingerprint |= (1ULL << i);
        }
        return fingerprint;
    }

    static int hamming_distance(uint64_t a, uint64_t b) {
        return __builtin_popcountll(a ^ b);
    }

    static bool is_near_duplicate(uint64_t a, uint64_t b,
                                   int threshold = 3) {
        return hamming_distance(a, b) <= threshold;
    }
};

// Usage:
// uint64_t fp1 = SimHash::compute(page1_text);
// uint64_t fp2 = SimHash::compute(page2_text);
// if (SimHash::is_near_duplicate(fp1, fp2)) {
//     // Skip — near-duplicate content
// }`
    },
  ],
  diagrams: [
    {
      title: "Web Crawler High-Level Architecture",
      kind: "architecture",
      caption: "Layered crawler architecture. The crawl loop runs continuously and is numbered 1-12: frontier dispatches URLs, fetchers download pages, processing extracts and normalizes new links, and deduplicated URLs flow back into the frontier. The control plane schedules recrawls from metadata and monitors the whole pipeline.",
      mermaid: `graph TB
    subgraph CONTROL["Control Plane"]
        SCHED["Scheduler<br/>recrawl policies"]
        MON["Monitoring<br/>pages per sec, error rates,<br/>frontier depth"]
    end
    subgraph FRONTIER["URL Frontier"]
        SEED["Seed URLs"]
        FQ["Front Queues<br/>priority levels"]
        BQ["Back Queues<br/>per-host politeness<br/>with delay timers"]
        SEED --> FQ
        FQ -->|"1. assign to per-host queue"| BQ
    end
    subgraph FETCHING["Fetcher Fleet"]
        FETCHERS["Async HTTP Fetchers<br/>hundreds of concurrent<br/>connections per node"]
        DNSC["DNS Resolver<br/>with cache"]
        ROBOTS["robots.txt Cache<br/>24h TTL per host"]
    end
    subgraph PROCESSING["Processing Pipeline"]
        PARSER["HTML Parser"]
        CDEDUP["Content Dedup<br/>checksums and SimHash"]
        LINKX["Link Extractor"]
        NORM["URL Normalizer"]
        SEEN["Seen-URL Filter<br/>Bloom filter approx 12GB<br/>for 10B URLs"]
    end
    subgraph STORAGE["Storage Layer"]
        RAW["Raw Content Store<br/>S3 or HDFS"]
        META["Metadata DB<br/>crawl history, status,<br/>change frequency"]
        GRAPHDB["Link Graph Store"]
    end
    BQ -->|"2. dispatch when<br/>host timer expires"| FETCHERS
    FETCHERS -->|"3. resolve host"| DNSC
    FETCHERS -->|"4. check robots.txt"| ROBOTS
    FETCHERS -->|"5. fetched HTML"| PARSER
    PARSER -->|"6. checksum content"| CDEDUP
    CDEDUP -->|"7. unique content"| RAW
    CDEDUP -->|"8. record crawl result"| META
    PARSER -->|"9. extract links"| LINKX
    LINKX -->|"10. normalize URLs"| NORM
    NORM -->|"11. filter seen URLs"| SEEN
    LINKX --> GRAPHDB
    SEEN -->|"12. new URLs back<br/>to frontier"| FQ
    META --> SCHED
    SCHED -->|"recrawl candidates"| FQ
    MON -.-> FETCHERS
    MON -.-> FRONTIER`
    },
    {
      title: "Crawl Request Flow",
      kind: "sequence",
      caption: "Sequence of operations for crawling a single URL, from frontier retrieval to content storage.",
      mermaid: `sequenceDiagram
    participant F as URL Frontier
    participant W as Crawler Worker
    participant R as Robots.txt Cache
    participant D as DNS Cache
    participant S as Target Server
    participant C as Content Store
    participant E as Link Extractor

    W->>F: Pull next URL batch
    F-->>W: URLs with priority
    W->>R: Check robots.txt for host
    R-->>W: Allowed / Disallowed
    W->>D: Resolve hostname
    D-->>W: IP address
    W->>S: HTTP GET page
    S-->>W: HTML response
    W->>C: Store raw content
    W->>E: Extract links
    E->>F: New URLs (after dedup)`
    },
    {
      title: "URL Frontier Priority Flow",
      kind: "flow",
      caption: "How URLs flow through front queues (priority) and back queues (politeness) in the URL frontier.",
      mermaid: `flowchart TD
    NEW["New URL Discovered"] --> NORM["URL Normalization"]
    NORM --> DEDUP{"Bloom Filter Check"}
    DEDUP -->|"Not seen"| PRIORITY["Priority Scorer"]
    DEDUP -->|"Already seen"| DROP["Drop URL"]
    PRIORITY --> FQ1["Front Queue: High Priority"]
    PRIORITY --> FQ2["Front Queue: Medium Priority"]
    PRIORITY --> FQ3["Front Queue: Low Priority"]
    FQ1 --> SELECT["Queue Selector"]
    FQ2 --> SELECT
    FQ3 --> SELECT
    SELECT --> POLITE{"Host Rate Limit OK?"}
    POLITE -->|"Yes"| FETCH["Dispatch to Crawler"]
    POLITE -->|"No"| WAIT["Back Queue: Wait for Delay"]
    WAIT --> POLITE`
    },
    {
      title: "Content Deduplication Pipeline",
      kind: "flow",
      caption: "Two-layer deduplication: URL-level bloom filter followed by content-level SimHash fingerprinting.",
      mermaid: `flowchart TD
    URL["Incoming URL"] --> URLCHECK{"URL Bloom Filter"}
    URLCHECK -->|"Possibly seen"| URLDB["Check URL Database"]
    URLCHECK -->|"Definitely new"| FETCH["Fetch Page"]
    URLDB -->|"Confirmed duplicate"| SKIP1["Skip"]
    URLDB -->|"False positive"| FETCH
    FETCH --> SIMHASH["Compute SimHash"]
    SIMHASH --> FPCHECK{"Hamming Distance <= 3?"}
    FPCHECK -->|"Near-duplicate"| SKIP2["Skip / Link to Canonical"]
    FPCHECK -->|"Unique"| STORE["Store Content"]
    STORE --> FPSTORE["Store Fingerprint"]`
    },
  ],
  interviewQA: [
    {
      q: "How would you design a web crawler that can crawl billions of pages while respecting website politeness rules?",
      a: "The key insight is separating URL selection (what to crawl) from politeness enforcement (when to crawl). I would design a two-part URL frontier: front queues ranked by priority (PageRank, freshness, domain importance) and back queues that enforce per-host rate limits. Each domain gets its own back queue with a configurable delay derived from robots.txt crawl-delay or adaptive measurement of server response times. The crawler fleet is organized so each worker owns a partition of domains via consistent hashing, ensuring a single worker handles all requests to a given host — this centralizes rate-limit decisions without distributed coordination. For scale, the frontier is disk-backed (RocksDB) with an in-memory buffer for the next batch of URLs. Workers pull URL batches, fetch pages concurrently across different hosts, and push results to downstream processing queues. The system monitors per-host error rates and automatically backs off from hosts returning 429s or 503s.",
      followUps: [
        "How would you handle the frontier growing faster than the crawler can process it?",
        "What happens if a crawler worker dies mid-crawl?",
        "How do you decide when to re-crawl a page you have already visited?",
      ],
    },
    {
      q: "How do you handle URL deduplication at web scale (tens of billions of URLs)?",
      a: "URL deduplication operates at two levels. First, URL-level dedup uses a bloom filter — for 10 billion URLs with 1% false-positive rate, the filter requires roughly 12 GB of memory using 7 hash functions. This catches exact URL duplicates efficiently. However, the same content often exists at multiple URLs (HTTP vs HTTPS, www vs non-www, different query parameter orderings), so URL normalization is applied before the bloom filter check: lowercase the hostname, remove default ports, sort query parameters, strip fragments, and resolve path components like '.' and '..'. Second, content-level dedup uses SimHash fingerprinting — after fetching a page, compute a 64-bit SimHash of the text content and check if any existing fingerprint is within Hamming distance 3. The fingerprint store is a distributed key-value store (Cassandra) keyed by fingerprint buckets for efficient near-neighbor lookup. Together, these two layers eliminate over 99% of redundant crawl work. The bloom filter can be partitioned across nodes matching the URL frontier partition scheme.",
      followUps: [
        "What is the trade-off between bloom filter size and false positive rate?",
        "How does SimHash differ from MinHash for near-duplicate detection?",
      ],
    },
    {
      q: "How would you handle spider traps and infinite URL spaces?",
      a: "Spider traps are URLs that generate unbounded pages — calendar pages that go forward forever, session IDs creating unique URLs for identical content, or faceted navigation producing combinatorial explosions. The first defense is crawl depth limiting: track the shortest hop count from any seed URL, and stop following links beyond a configurable depth (typically 15-20 hops). The second defense is per-domain page budgets: allocate a maximum number of pages per domain proportional to its importance, and stop crawling once the budget is exhausted. The third defense is URL pattern detection: if the crawler sees URLs matching a regex-like pattern with incrementing numbers or dates (e.g., /calendar/2024/01/01, /calendar/2024/01/02, ...), it flags the pattern and limits crawling to a sample. Session ID detection looks for URL parameters with high-entropy values that change across links to the same content. Finally, content similarity monitoring detects when many pages from the same domain have nearly identical SimHash fingerprints, indicating boilerplate-heavy trap pages.",
      followUps: [
        "How would you detect and handle soft 404 pages?",
        "How does URL normalization help prevent traps?",
      ],
    },
    {
      q: "How do you prioritize which pages to crawl or re-crawl?",
      a: "Crawl priority is a multi-factor scoring function. For new URLs, the primary signal is the importance of the linking page — a link from a high-PageRank page inherits some of that authority. Domain-level reputation also matters: pages on domains with historically high-quality content get higher priority. For re-crawling, the key signal is estimated change frequency. The crawler maintains per-URL statistics: how often the content changed in previous crawls, when it was last modified (from HTTP Last-Modified headers or content diffing), and how important the page is. Pages that change frequently and are high-value (e.g., news front pages) might be re-crawled every few minutes, while static pages (e.g., company about pages) might be re-crawled monthly. The Adaptive re-crawl algorithm adjusts crawl frequency based on observed change rates — if a page has not changed in the last 5 crawls, double the interval; if it changed, halve the interval. This converges on an efficient crawl schedule without wasting resources on static content.",
      followUps: [
        "How do you incorporate real-time signals like social media mentions into crawl priority?",
        "What is the role of sitemaps in crawl scheduling?",
      ],
    },
    {
      q: "How would you design the distributed architecture for a crawler processing 1 billion pages per day?",
      a: "At 1 billion pages per day, that is roughly 11,500 pages per second. Assuming an average fetch time of 500ms per page (including DNS, TCP, TLS, and download), each worker can handle about 100 concurrent fetches, processing 200 pages per second. This means roughly 60 crawler workers. However, the bottleneck shifts depending on the phase. DNS resolution is handled by a dedicated DNS cache cluster — Unbound resolvers with extended TTLs, prefetching hostnames from the frontier. The URL frontier service runs on 3-5 nodes with RocksDB storage and serves URL batches via gRPC. Content storage goes directly to S3/HDFS partitioned by date. Link extraction runs as a separate service consuming from a Kafka topic, extracting URLs and feeding them back to the frontier after dedup. The bloom filter for URL dedup is partitioned across the frontier nodes, each owning a shard. Monitoring tracks pages/second, error rates, frontier depth, and per-domain crawl rates. The system uses Kubernetes for orchestration, with auto-scaling based on frontier depth — if the frontier grows, spin up more crawler workers.",
      followUps: [
        "How do you handle network partitions in the crawler fleet?",
        "What is the failure mode if the frontier service goes down?",
      ],
    },
    {
      q: "Walk me through the capacity estimation for a crawler that must fetch 1 billion pages per month.",
      a: "Start with throughput: 1B pages / (30 × 86,400 ≈ 2.6M seconds) ≈ 385 pages/second sustained, and I would provision for a ~3x peak of about 1,200 pages/second. Bandwidth: at 100 KB average page size, 385 × 100 KB ≈ 38.5 MB/s ≈ 310 Mbps sustained, around 1 Gbps at peak — so network capacity is a first-class constraint. Storage: 100 TB/month of raw HTML, which mandates blob storage (S3/HDFS) rather than a database; metadata at ~1 KB/URL for 10B known URLs is another ~10 TB in a proper database. Concurrency: at 500 ms average fetch latency, Little's Law gives 385 × 0.5 ≈ 200 concurrent requests sustained — trivially handled by a few async-I/O nodes, so fetcher count is driven by bandwidth and fault isolation, not CPU. Dedup: a Bloom filter for 10B URLs at 1% false positives needs about 12 GB (m = -n·ln(p)/(ln 2)², k ≈ 7 hashes). Frontier: billions of pending URLs at ~100 bytes each means hundreds of GB, so it must be disk-backed. Finally I would flag the politeness constraint: at 1 req/host/sec, sustaining 385 pages/s requires ~400 hosts ready to fetch at all times, so frontier host diversity — not hardware — is often the real throughput ceiling.",
      followUps: [
        "How do the numbers change if average page size is 500 KB because you also fetch images and PDFs?",
        "Where would you place crawler datacenters geographically, and why does it matter?",
      ],
    },
    {
      q: "How do you keep the crawled corpus fresh without wasting fetches on pages that never change?",
      a: "Model each page's change behavior and adapt the recrawl interval per URL. The metadata DB stores last crawl time, a content checksum, and the change history; from repeated observations you estimate a change rate (classically a Poisson rate λ). A robust practical policy is multiplicative-adaptive scheduling: unchanged since last crawl → double the interval (capped around 30 days); changed → halve it (floored at minutes for hot pages). This converges to each page's real change frequency automatically. I would cut costs further with conditional GETs using ETag/If-Modified-Since — a 304 response confirms freshness for a few hundred bytes — plus sitemap lastmod hints and RSS feeds as push signals. Priority combines change rate with page importance, and I would cite the Cho & Garcia-Molina result that pathologically fast-changing pages should get LESS budget, since no schedule can keep them fresh and the fetches are better spent on pages where crawling actually improves index freshness. Operationally, I would run two lanes: a fast lane for news and high-traffic home pages with minute-level recrawl, and a batch lane for the long tail, each with an isolated budget so neither starves the other.",
      followUps: [
        "How would you bootstrap change-rate estimates for a URL you have crawled only once?",
        "How do you detect that a page changed meaningfully vs just rotating ads or timestamps?",
      ],
    },
  ],
  mcqs: [
    {
      q: "What is the primary purpose of the URL frontier's back queue in a web crawler?",
      options: [
        "To store URLs that failed to fetch",
        "To enforce per-host politeness and rate limiting",
        "To deduplicate URLs before crawling",
        "To prioritize high-PageRank URLs",
      ],
      answerIndex: 1,
      explanation: "The back queue ensures that crawl requests to the same host are spaced out according to politeness constraints (robots.txt crawl-delay or adaptive rate limiting), preventing the crawler from overwhelming any single server.",
    },
    {
      q: "A bloom filter for 10 billion URLs with a 1% false positive rate requires approximately how much memory?",
      options: [
        "1 GB",
        "4 GB",
        "12 GB",
        "50 GB",
      ],
      answerIndex: 2,
      explanation: "Using the formula m = -n * ln(p) / (ln2)^2, for n=10B and p=0.01: m = -(10^10) * (-4.605) / 0.4805 ≈ 9.58 * 10^10 bits ≈ 12 GB. This is feasible for a single machine or can be partitioned across nodes.",
    },
    {
      q: "What technique detects near-duplicate web pages that exist at different URLs?",
      options: [
        "URL normalization alone",
        "robots.txt parsing",
        "SimHash or MinHash fingerprinting",
        "DNS prefetching",
      ],
      answerIndex: 2,
      explanation: "SimHash produces a 64-bit fingerprint where similar documents have fingerprints with small Hamming distance. MinHash estimates Jaccard similarity between document shingle sets. Both detect near-duplicate content regardless of URL differences.",
    },
    {
      q: "Why is consistent hashing used to assign domains to crawler workers?",
      options: [
        "To maximize the number of concurrent connections to each server",
        "To ensure each domain is handled by one worker, enabling per-host rate limiting",
        "To distribute the bloom filter evenly across workers",
        "To make DNS lookups faster",
      ],
      answerIndex: 1,
      explanation: "Consistent hashing maps each domain to a specific crawler worker, ensuring all requests to that domain go through one node. This centralizes per-host politeness enforcement — the owning worker tracks request timing and enforces crawl delays without distributed coordination.",
    },
  ],
  flashcards: [
    { front: "What is a URL frontier?", back: "A priority queue system that determines which URLs to crawl next. Split into front queues (priority-based selection) and back queues (per-host politeness enforcement). Disk-backed at scale with an in-memory hot layer." },
    { front: "How does a bloom filter help in web crawling?", back: "It provides O(1) probabilistic membership testing for URL deduplication. A 10B-entry filter with 1% FPR uses ~12GB. False positives cause missed URLs (acceptable), while false negatives (impossible) would cause redundant crawls." },
    { front: "What is SimHash and how is it used in crawling?", back: "SimHash produces a 64-bit fingerprint from document content. Similar documents have fingerprints with small Hamming distance (typically <= 3 bits). Used to detect near-duplicate pages at different URLs." },
    { front: "What is crawl politeness?", back: "Respecting robots.txt rules, honoring crawl-delay directives, adaptive backoff on server errors, and limiting concurrent requests per host. Typically 1-5 second delay between requests to the same host." },
    { front: "Why use consistent hashing for domain-to-worker assignment?", back: "Each domain maps to exactly one crawler worker, centralizing per-host rate limiting without distributed coordination. When workers are added/removed, only a small fraction of domains are reassigned." },
    { front: "What is a spider trap?", back: "URLs that generate infinite pages — calendars, session IDs, faceted navigation. Defended by crawl depth limits, per-domain page budgets, URL pattern detection, and content similarity monitoring." },
    { front: "How is crawl priority determined?", back: "Multi-factor scoring: PageRank of linking page, domain reputation, estimated change frequency, content freshness. Re-crawl intervals adapt based on observed change rates — double interval if unchanged, halve if changed." },
    { front: "What is the role of DNS caching in a web crawler?", back: "DNS lookups take 10-200ms per hostname. A dedicated DNS cache (e.g., Unbound) with extended TTLs eliminates this bottleneck. Prefetching DNS for frontier URLs hides latency entirely." },
    { front: "1B pages/month — what sustained and peak crawl rate?", back: "1B / 2.6M seconds ≈ 385 pages/s sustained; provision ~3x for peak ≈ 1,200 pages/s. At 100KB/page that is ~38.5 MB/s ≈ 310 Mbps sustained ingress, ~1 Gbps peak, and 100 TB/month of raw storage." },
    { front: "Describe the Mercator frontier structure.", back: "F front queues by priority feed B back queues (one host each, B ≈ 3x fetcher threads). A heap keyed by each host's next-allowed fetch time drives dispatch — guaranteeing one in-flight request per host by construction. Empty back queues are refilled with a new host from the front queues." },
    { front: "Which URL normalizations are always safe vs heuristic?", back: "Safe (RFC 3986): lowercase scheme/host, remove default ports, resolve dot-segments, decode unreserved percent-encodings, strip fragments. Heuristic: sort query params, strip utm_*/session IDs, merge www/non-www. Never lowercase paths — they are case-sensitive by spec." },
    { front: "What are the key robots.txt semantics (RFC 9309)?", back: "Most specific User-agent group applies; longest matching path rule wins between Allow/Disallow; 4xx for robots.txt = allow all; persistent 5xx = treat as disallow all; Crawl-delay is non-standard — honor as a capped hint." },
  ],
  exercises: [
    "Design a URL normalization function that handles: scheme lowercasing, hostname lowercasing, default port removal, path resolution (. and ..), query parameter sorting, fragment removal, and trailing slash normalization. Test with edge cases like IDN domains and percent-encoded characters.",
    "Implement a distributed bloom filter that partitions across N nodes using consistent hashing on the URL. Handle the case where a node fails — what happens to false positive rates? Design a recovery mechanism.",
    "Build a crawl scheduler that uses exponential backoff for change detection: if a page has not changed in K consecutive crawls, increase the re-crawl interval by 2x (up to a maximum). If it changed, reset to the base interval. Simulate with realistic change distributions.",
    "Design a spider trap detector that identifies URL patterns producing unbounded pages. Handle patterns like incrementing dates (/2024/01/01, /2024/01/02, ...), session IDs (16+ character hex strings in parameters), and faceted navigation (combinatorial query parameters).",
    "Implement a politeness controller that reads robots.txt, respects Crawl-delay, implements adaptive rate limiting based on server response times, and handles 429 (Too Many Requests) and 503 (Service Unavailable) with exponential backoff.",
  ],
  revisionNotes: [
    "URL frontier = front queues (priority) + back queues (per-host politeness). Priority from PageRank, freshness, domain reputation. Politeness from robots.txt crawl-delay and adaptive measurement.",
    "Bloom filter for URL dedup: m = -n*ln(p)/(ln2)^2 bits, k = (m/n)*ln2 hashes. 10B URLs at 1% FPR = ~12GB. False positives skip URLs (acceptable), no false negatives.",
    "SimHash: 64-bit fingerprint, Hamming distance <= 3 = near-duplicate. Content-level dedup catches same content at different URLs.",
    "Consistent hashing assigns domains to crawler workers — centralizes per-host rate limiting. Adding/removing workers reassigns minimal domains.",
    "DNS caching is critical: 10-200ms per lookup. Dedicated resolvers (Unbound) with extended TTLs. Prefetch DNS for URLs approaching the front of the frontier.",
    "Spider traps: defend with depth limits (15-20 hops), per-domain page budgets, URL pattern detection, and content similarity monitoring.",
    "Re-crawl scheduling: adaptive algorithm doubles interval if page unchanged, halves if changed. Converges on efficient crawl frequency.",
    "At 1B pages/day = 11,500 pages/sec. Each worker handles ~200 pages/sec with 100 concurrent fetches. Need ~60 workers plus DNS cache, frontier service, and content store.",
    "Two-tier crawling: fast HTTP fetch for most pages, headless browser (Chromium) for JS-heavy SPAs. Headless is 10-100x slower, 100-500MB RAM per instance.",
    "Link graph compression: Webgraph format achieves 2-4 bits per edge using reference coding and delta encoding. Full web graph fits in memory on a modest cluster.",
    "Capacity anchor: 1B pages/month ≈ 385 pages/s sustained, ~1,200 peak; ~310 Mbps ingress at 100KB/page; 100 TB/month raw storage; ~200 concurrent fetches at 500ms latency (Little's Law).",
    "Mercator frontier: F priority front queues, B one-host back queues (B ≈ 3x threads), heap keyed by per-host next-allowed time. One in-flight request per host guaranteed by construction.",
    "robots.txt semantics: most specific User-agent group; longest path match wins Allow vs Disallow; 4xx = allow all, persistent 5xx = disallow all; Crawl-delay is a non-standard capped hint.",
    "URL normalization: safe = lowercase scheme/host, drop default port, resolve dot-segments, strip fragment; heuristic = sort params, strip utm_*/session IDs. Paths are case-sensitive — do not lowercase them.",
  ],
  cheatSheet: [
    "Bloom filter sizing: m = -n * ln(fpr) / (ln2)^2; k = (m/n) * ln2",
    "URL normalization: lowercase scheme + host, remove default port, sort query params, strip fragment, resolve path",
    "Politeness: 1 request/sec/host default, read robots.txt crawl-delay, adaptive backoff on 429/503",
    "SimHash near-duplicate threshold: Hamming distance <= 3 out of 64 bits",
    "Consistent hashing for domain → worker assignment ensures single-writer per host",
    "Crawl budget: allocate pages/domain proportional to domain importance (PageRank, link count)",
    "DNS cache: Unbound with extended TTLs, prefetch for upcoming frontier URLs",
    "Spider trap defenses: depth limit (15-20), domain page cap, URL pattern detection, content similarity",
    "Scale estimate: 1B pages/day ≈ 12K pages/sec ≈ 60 workers at 200 pages/sec each",
    "Re-crawl: double interval if unchanged (max 30 days), halve if changed (min 1 hour)",
    "Capacity: 1B pages/month ≈ 385 pages/s sustained ≈ 1,200 peak; 100KB avg → ~310 Mbps sustained, ~1 Gbps peak; 100 TB/month raw",
    "Concurrency (Little's Law): 385 pages/s × 0.5s latency ≈ 200 in-flight requests",
    "Mercator frontier: F front queues (priority) → B back queues (one host each, B ≈ 3x threads) → heap by next-allowed fetch time",
    "robots.txt: longest path match wins; 4xx = allow all, 5xx = disallow all; conditional GET (ETag/304) makes recrawl checks nearly free",
    "Host diversity limit: at 1 req/host/sec you need ~400 ready hosts to sustain 385 pages/s — frontier mix caps throughput",
  ],
  glossary: [
    { term: "URL Frontier", definition: "The data structure managing URLs to be crawled, combining priority queues (front) for importance-based selection with per-host queues (back) for politeness enforcement." },
    { term: "Bloom Filter", definition: "A space-efficient probabilistic data structure for set membership testing. Returns 'possibly in set' or 'definitely not in set' — no false negatives, controllable false positive rate." },
    { term: "SimHash", definition: "A locality-sensitive hashing technique that produces fingerprints where similar documents have similar hash values, measured by Hamming distance. Used for near-duplicate content detection." },
    { term: "robots.txt", definition: "A file at the root of a website (e.g., example.com/robots.txt) that specifies crawling rules: which paths are disallowed, crawl-delay between requests, and which user-agents the rules apply to." },
    { term: "Crawl Budget", definition: "The maximum number of pages a crawler will fetch from a single domain within a time period, allocated proportionally to domain importance to balance breadth and depth." },
    { term: "Spider Trap", definition: "A URL structure that generates an infinite or near-infinite number of pages, such as calendar pages with incrementing dates or URLs with session IDs, wasting crawler resources." },
    { term: "Consistent Hashing", definition: "A hashing scheme that maps domains to crawler workers such that adding or removing workers only reassigns a small fraction of domains, minimizing disruption to politeness state." },
  ],
  animations: [
    {
      title: "Crawling politely at scale",
      steps: [
        {
          label: "Seed frontier",
          detail: "A prioritised queue of URLs to fetch.",
        },
        {
          label: "Politeness",
          detail: "Partition the frontier by domain so one worker owns a domain and can respect its rate limit and robots.txt.",
        },
        {
          label: "Fetch and parse",
          detail: "Extract content and outbound links.",
        },
        {
          label: "Deduplicate",
          detail: "URL normalisation plus a content hash — many URLs serve identical pages.",
        },
        {
          label: "Enqueue new links",
          detail: "Bounded by depth and domain limits so one site can't dominate the frontier.",
        },
        {
          label: "Recrawl",
          detail: "Scheduled by observed change frequency — news hourly, static pages monthly.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Breadth-First Crawl", "Best-First (Priority) Crawl", "Focused Crawl", "Incremental Re-crawl"],
    rows: [
      ["Strategy", "Visit all links level by level", "Visit highest-priority URLs first", "Only crawl pages matching a topic", "Re-visit known pages for updates"],
      ["URL Selection", "FIFO queue", "Priority queue (PageRank, freshness)", "Relevance classifier score", "Change frequency estimation"],
      ["Coverage", "High — covers everything reachable", "Medium — biased toward important pages", "Low — only topic-relevant pages", "Existing corpus only"],
      ["Speed to Important Pages", "Slow — must traverse levels", "Fast — important pages crawled first", "Fast for on-topic pages", "N/A — pages already known"],
      ["Resource Usage", "High — fetches many low-value pages", "Moderate — focuses resources on value", "Low — skips irrelevant pages", "Low — only changed pages fetched"],
      ["Use Case", "Initial full web crawl, archival", "Search engine continuous crawling", "Vertical search, research", "Keeping search index fresh"],
    ],
  },
  followUps: [
    "How would you extend the crawler to handle the dark web or authenticated content behind login walls?",
    "How does a search engine decide which crawled pages to include in its index vs discard?",
    "How would you build a real-time crawl alerting system that notifies when specific pages change?",
    "What are the legal and ethical considerations of web crawling at scale?",
    "How would you design the storage layer for a crawler archiving petabytes of web content?",
    "How does a crawler handle internationalized domain names (IDN) and non-Latin URL encoding?",
    "How would you crawl efficiently when a large fraction of the web moves behind CDNs with aggressive bot detection?",
    "How would you adapt the recrawl scheduler if the product needed near-real-time freshness for e-commerce prices?",
    "How would you shard the URL frontier itself when a single host (e.g., wikipedia.org) has hundreds of millions of URLs?",
  ],
  resources: [
    { label: "Web Crawling and Indexing (Stanford IR Book)", kind: "book", note: "Chapter 20 covers crawler architecture, politeness, and frontier management in depth." },
    { label: "Mercator: A Scalable, Extensible Web Crawler (Heydon & Najork)", kind: "article", note: "Foundational paper on scalable crawler architecture with URL frontier design patterns." },
    { label: "IRLbot: Scaling to 6 Billion Pages and Beyond", kind: "article", note: "Describes DRUM (Disk Repository with Update Management) for efficient URL deduplication at scale." },
    { label: "The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page)", kind: "article", note: "Original Google paper describing their crawler architecture and PageRank-based prioritization." },
    { label: "Apache Nutch", kind: "repo", note: "Open-source web crawler framework built on Hadoop, demonstrating distributed crawling patterns." },
  ],
};
