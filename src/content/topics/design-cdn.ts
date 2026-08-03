import type { TopicContent } from "../types";

export const designCdn: TopicContent = {
  quickSummary: [
    "A CDN (Content Delivery Network) is a globally distributed network of edge servers that cache and deliver content close to end users, reducing latency from hundreds of milliseconds to single-digit milliseconds by eliminating long-haul round trips to a distant origin.",
    "Core architecture layers: GeoDNS or Anycast routing directs users to the nearest PoP (Point of Presence), edge servers handle TLS termination and serve cached content, mid-tier shield servers absorb cache misses to protect the origin, and the origin server is the single source of truth.",
    "Cache invalidation is the hardest problem: approaches include TTL-based expiration, purge APIs for instant invalidation, versioned URLs (fingerprinting) for immutable assets, and stale-while-revalidate for availability during revalidation windows.",
    "Modern CDNs handle 100+ Tbps aggregate throughput across 200-300+ PoPs worldwide, support video streaming via chunked transfer and adaptive bitrate (HLS/DASH), and provide DDoS mitigation by absorbing attack traffic at the edge before it reaches the origin.",
    "Key design trade-offs: push vs. pull caching (bandwidth cost vs. latency on first request), cache consistency vs. availability (strong purge vs. TTL staleness), and centralized vs. distributed control planes (consistency vs. fault tolerance).",
  ],

  detailed: [
    "## Edge Caching and Cache Hierarchy\nA CDN's primary value proposition is serving content from servers geographically close to end users. The cache hierarchy typically has two or three tiers: edge PoPs (L1), regional shield nodes (L2), and the origin (L3). When a user requests content, the edge server checks its local cache first. On a cache miss, rather than going directly to the origin, the edge forwards the request to a shield node — a designated upstream cache that aggregates misses from multiple edge PoPs in the same region. This dramatically reduces origin load: instead of N edge servers independently fetching the same object, a single shield server fetches it once and fans out. Cache hit ratios at the edge typically range from 85-95% for static assets and 60-80% for dynamic content with careful cache key design. The shield layer adds another 5-10% hit rate improvement.",

    "## Routing: Anycast vs. GeoDNS\nRouting users to the optimal edge server is critical for performance. GeoDNS uses the client's DNS resolver IP to determine geographic location and returns the IP of the nearest PoP. This works well but has limitations: DNS resolvers may not be near the client (e.g., Google Public DNS), and DNS TTLs mean routing changes propagate slowly (30-60 seconds). Anycast takes a different approach — the same IP address is announced from every PoP via BGP, and the internet's routing infrastructure naturally directs packets to the nearest one. Anycast provides instant failover (BGP withdrawal takes 1-3 seconds) and is immune to DNS resolver misplacement, but it complicates TCP connections because route flaps can shift a session to a different PoP mid-connection. Most production CDNs combine both: Anycast for initial connection and DNS for fine-grained load balancing. Latency-based routing (measuring actual RTT rather than relying on geography) provides the best results but requires continuous probing infrastructure.",

    "## Cache Invalidation and Consistency\nCache invalidation is famously one of the two hard problems in computer science. CDNs offer several strategies with different trade-off profiles. TTL-based expiration is the simplest: each object has a max-age, and the edge serves it until expiry, then revalidates with the origin using If-None-Match (ETag) or If-Modified-Since headers. This is efficient but provides only eventual consistency — stale content is served until TTL expires. Purge APIs allow the origin to push invalidation to all edge nodes, achieving near-instant consistency (typically 1-5 seconds globally), but they require infrastructure to fan out purge commands to hundreds of PoPs. Versioned URLs (e.g., /style.abc123.css) sidestep invalidation entirely — the URL changes when content changes, so old cached versions are simply never requested again. Soft purge (stale-while-revalidate) serves stale content while fetching fresh content in the background, preserving availability at the cost of a brief staleness window. A well-designed CDN uses all four strategies for different content types.",

    "## TLS Termination and Security\nEvery CDN must handle TLS termination at the edge. Terminating TLS at the edge rather than the origin reduces latency by eliminating the TLS handshake round trips over long distances — a TLS 1.3 handshake is 1-RTT, and the edge-to-user RTT might be 5ms vs. 200ms to the origin. Edge servers need access to the domain's private key, which raises security concerns at scale. Solutions include distributing encrypted key material to all PoPs with HSMs, using keyless SSL (the edge performs the TLS handshake but delegates the private key operation to a remote key server the customer controls), or using delegated credentials (short-lived credentials derived from the main certificate). For DDoS protection, the CDN's edge network absorbs volumetric attacks by distributing traffic across hundreds of PoPs — a 1 Tbps attack spread across 300 PoPs is only 3.3 Gbps per PoP, well within capacity. Layer 7 attacks are mitigated with WAF rules, rate limiting, and bot detection at the edge.",

    "## Video Streaming and Large Object Delivery\nVideo streaming is the dominant use case for CDN bandwidth, accounting for over 70% of internet traffic. CDNs support adaptive bitrate streaming protocols (HLS and DASH) by caching the manifest files and individual video segments (typically 2-10 seconds each). The key challenge is the long tail: a catalog of millions of videos where most are rarely watched, leading to low cache hit ratios. Solutions include predictive prefetching based on trending content, tiered caching to concentrate the long tail at shield nodes, and origin storage co-located with PoPs for the coldest content. For live streaming, the CDN must balance ultra-low latency (sub-5-second glass-to-glass) with scale. Techniques include chunked transfer encoding to start delivering a segment before it is fully received, WebSocket or HTTP/2 push for low-latency delivery, and edge compute to transcode or repackage streams closer to viewers.",
  ],

  deepDive: [
    "Consistent hashing is the backbone of request routing within a PoP. When a PoP has dozens of cache servers, you need to deterministically route requests for the same URL to the same server to maximize cache hit rates, while minimizing disruption when servers are added or removed. Standard consistent hashing maps both servers and cache keys onto a hash ring, routing each key to the next server clockwise on the ring. However, naive consistent hashing leads to uneven load distribution — adding virtual nodes (100-200 per physical server) smooths the distribution. When a server fails, only its keys are redistributed to the next server on the ring, rather than reshuffling everything. Bounded-load consistent hashing (Google, 2017) adds a load cap to each node: if the target node is overloaded, the request is forwarded to the next node on the ring, preventing hot-spot cascades. In practice, the hash ring is recomputed and distributed to all routing nodes whenever the server pool changes, with version numbers to prevent split-brain routing during transitions.",

    "Origin shielding deserves deeper examination because it fundamentally changes the failure model. Without shielding, an edge cache miss at any of 300 PoPs hits the origin directly — if a popular object's TTL expires simultaneously, the origin receives 300 concurrent requests for the same object (a thundering herd). Shield nodes collapse these into a single origin fetch using request coalescing: the first request to the shield triggers an origin fetch, and subsequent requests for the same object are queued and served from the shield's cache once the fetch completes. The shield also enables efficient purge propagation — instead of the origin pushing purge commands to 300 edge PoPs, it pushes to 10-20 shield nodes, which propagate to their downstream edges. The trade-off is added latency on shield misses (edge-to-shield-to-origin vs. edge-to-origin) and the shield becoming a potential single point of failure for its region. Mitigations include shield redundancy (active-passive pairs) and fallback-to-origin logic when the shield is unreachable.",

    "Cache key design has an outsized impact on CDN performance and is often underestimated in system design discussions. The cache key determines what constitutes the 'same' content. The simplest key is the URL, but this breaks when content varies by device type (mobile vs. desktop), language (Accept-Language header), encoding (Accept-Encoding), or user segment (A/B test bucket). Adding too many vary dimensions explodes the cache key space and destroys hit rates — if you vary on 5 binary dimensions, you have 32 variants of every URL, reducing effective cache size by 32x. The solution is to normalize and minimize vary dimensions: serve responsive content instead of device-specific variants, use client-side language detection, and move A/B test logic to the client or edge compute. Edge compute (Cloudflare Workers, Lambda@Edge) enables dynamic cache key manipulation — stripping query parameters, normalizing headers, or computing custom cache keys — without origin involvement.",

    "Capacity planning for a CDN requires thinking about multiple resource dimensions simultaneously. Bandwidth is the headline number (Tbps of aggregate capacity), but CPU (for TLS termination, compression, WAF rules), memory (for hot cache), and storage (for the full cache working set) are equally important constraints. A typical edge server might have 256GB RAM and 10TB SSD, caching 10TB of content with the hottest 256GB in memory. If the working set exceeds memory, performance degrades sharply as disk I/O becomes the bottleneck — SSDs handle ~500K random reads/sec vs. memory's millions. PoP placement follows traffic density: major metro areas get dedicated PoPs, while less-populated regions are served by the nearest PoP or through IXP (Internet Exchange Point) presence. Traffic is highly diurnal and geographically shifting — peak traffic follows the sun — so aggregate capacity must handle peak-of-peaks (typically 2-3x average), while individual PoP capacity must handle regional peaks plus failover headroom (typically 50% of a neighboring PoP's traffic).",
  ],

  code: [
    {
      language: "cpp",
      caption: "Consistent hashing ring with virtual nodes for edge server routing",
      source: `#include <map>
#include <string>
#include <functional>
#include <vector>
#include <cstdint>
#include <mutex>
#include <stdexcept>

class ConsistentHashRing {
public:
    explicit ConsistentHashRing(int virtual_nodes = 150)
        : virtual_nodes_(virtual_nodes) {}

    // Add a physical server to the ring with virtual nodes
    void addServer(const std::string& server_id) {
        std::lock_guard<std::mutex> lock(mu_);
        for (int i = 0; i < virtual_nodes_; ++i) {
            std::string vnode_key = server_id + "#vn" + std::to_string(i);
            uint64_t hash = computeHash(vnode_key);
            ring_[hash] = server_id;
        }
        servers_.push_back(server_id);
    }

    // Remove a server (only its virtual nodes are removed)
    void removeServer(const std::string& server_id) {
        std::lock_guard<std::mutex> lock(mu_);
        for (int i = 0; i < virtual_nodes_; ++i) {
            std::string vnode_key = server_id + "#vn" + std::to_string(i);
            uint64_t hash = computeHash(vnode_key);
            ring_.erase(hash);
        }
        servers_.erase(
            std::remove(servers_.begin(), servers_.end(), server_id),
            servers_.end());
    }

    // Route a cache key to the appropriate server
    std::string getServer(const std::string& cache_key) const {
        std::lock_guard<std::mutex> lock(mu_);
        if (ring_.empty()) {
            throw std::runtime_error("No servers in ring");
        }
        uint64_t hash = computeHash(cache_key);
        // Find the first node clockwise from the hash position
        auto it = ring_.lower_bound(hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // Wrap around the ring
        }
        return it->second;
    }

    // Get N distinct servers for replication
    std::vector<std::string> getServers(const std::string& cache_key, int n) const {
        std::lock_guard<std::mutex> lock(mu_);
        std::vector<std::string> result;
        if (ring_.empty()) return result;

        uint64_t hash = computeHash(cache_key);
        auto it = ring_.lower_bound(hash);

        while (result.size() < static_cast<size_t>(n) &&
               result.size() < servers_.size()) {
            if (it == ring_.end()) it = ring_.begin();
            // Skip duplicate physical servers (from virtual nodes)
            if (std::find(result.begin(), result.end(), it->second)
                == result.end()) {
                result.push_back(it->second);
            }
            ++it;
        }
        return result;
    }

private:
    uint64_t computeHash(const std::string& key) const {
        // FNV-1a 64-bit hash for good distribution
        uint64_t hash = 14695981039346656037ULL;
        for (char c : key) {
            hash ^= static_cast<uint64_t>(c);
            hash *= 1099511628211ULL;
        }
        return hash;
    }

    int virtual_nodes_;
    std::map<uint64_t, std::string> ring_;       // hash -> server_id
    std::vector<std::string> servers_;            // physical server list
    mutable std::mutex mu_;
};

// Usage: route incoming request to cache server within a PoP
// ConsistentHashRing ring(150);
// ring.addServer("cache-01.sjc.pop");
// ring.addServer("cache-02.sjc.pop");
// ring.addServer("cache-03.sjc.pop");
// std::string target = ring.getServer("/images/logo.png");`,
    },
    {
      language: "cpp",
      caption: "LRU cache with TTL expiration for edge server content caching",
      source: `#include <unordered_map>
#include <list>
#include <string>
#include <chrono>
#include <mutex>
#include <optional>
#include <cstddef>

struct CacheEntry {
    std::string key;
    std::string value;
    std::string etag;
    std::chrono::steady_clock::time_point expires_at;
    size_t size_bytes;
};

class LRUCacheWithTTL {
public:
    // max_bytes: total memory budget for this cache tier
    explicit LRUCacheWithTTL(size_t max_bytes)
        : max_bytes_(max_bytes), current_bytes_(0),
          hits_(0), misses_(0) {}

    struct LookupResult {
        std::string value;
        std::string etag;
        bool is_stale;   // past TTL but still in cache (stale-while-revalidate)
    };

    // Lookup with stale-while-revalidate support
    std::optional<LookupResult> get(const std::string& key) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = index_.find(key);
        if (it == index_.end()) {
            ++misses_;
            return std::nullopt;
        }

        auto list_it = it->second;
        auto now = std::chrono::steady_clock::now();
        bool stale = now > list_it->expires_at;

        // Move to front (most recently used)
        items_.splice(items_.begin(), items_, list_it);
        ++hits_;

        return LookupResult{
            list_it->value,
            list_it->etag,
            stale
        };
    }

    // Insert or update an entry
    void put(const std::string& key, const std::string& value,
             const std::string& etag,
             std::chrono::seconds ttl) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = index_.find(key);

        // Remove old entry if exists
        if (it != index_.end()) {
            current_bytes_ -= it->second->size_bytes;
            items_.erase(it->second);
            index_.erase(it);
        }

        size_t entry_size = key.size() + value.size() + etag.size() + 64;

        // Evict LRU entries until we have space
        while (current_bytes_ + entry_size > max_bytes_ && !items_.empty()) {
            evictLRU();
        }

        // Insert at front
        auto expires = std::chrono::steady_clock::now() + ttl;
        items_.push_front({key, value, etag, expires, entry_size});
        index_[key] = items_.begin();
        current_bytes_ += entry_size;
    }

    // Purge a specific key (for cache invalidation API)
    bool purge(const std::string& key) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = index_.find(key);
        if (it == index_.end()) return false;
        current_bytes_ -= it->second->size_bytes;
        items_.erase(it->second);
        index_.erase(it);
        return true;
    }

    // Purge all keys matching a prefix (e.g., "/api/v2/*")
    int purgePrefix(const std::string& prefix) {
        std::lock_guard<std::mutex> lock(mu_);
        int count = 0;
        for (auto it = index_.begin(); it != index_.end(); ) {
            if (it->first.substr(0, prefix.size()) == prefix) {
                current_bytes_ -= it->second->size_bytes;
                items_.erase(it->second);
                it = index_.erase(it);
                ++count;
            } else {
                ++it;
            }
        }
        return count;
    }

    double hitRate() const {
        uint64_t total = hits_ + misses_;
        return total == 0 ? 0.0 : static_cast<double>(hits_) / total;
    }

private:
    void evictLRU() {
        auto& victim = items_.back();
        current_bytes_ -= victim.size_bytes;
        index_.erase(victim.key);
        items_.pop_back();
    }

    size_t max_bytes_;
    size_t current_bytes_;
    uint64_t hits_;
    uint64_t misses_;
    std::list<CacheEntry> items_;                              // front = MRU
    std::unordered_map<std::string,
        std::list<CacheEntry>::iterator> index_;               // key -> list pos
    std::mutex mu_;
};`,
    },
    {
      language: "cpp",
      caption: "GeoDNS resolution logic with latency-based failover",
      source: `#include <string>
#include <vector>
#include <unordered_map>
#include <cmath>
#include <algorithm>
#include <mutex>
#include <chrono>

struct GeoCoord {
    double latitude;
    double longitude;
};

struct PopInfo {
    std::string pop_id;          // e.g., "sjc-01"
    std::string ip_address;      // Anycast or unicast IP
    GeoCoord location;
    double capacity_gbps;
    double current_load_gbps;
    bool healthy;
    double measured_latency_ms;  // from periodic probes
};

struct DnsResponse {
    std::string resolved_ip;
    std::string pop_id;
    int ttl_seconds;
    std::string routing_reason;  // for observability
};

class GeoDnsResolver {
public:
    GeoDnsResolver(double load_threshold = 0.80,
                   double max_latency_ms = 50.0)
        : load_threshold_(load_threshold),
          max_latency_ms_(max_latency_ms) {}

    void registerPop(const PopInfo& pop) {
        std::lock_guard<std::mutex> lock(mu_);
        pops_[pop.pop_id] = pop;
    }

    void updateHealth(const std::string& pop_id, bool healthy,
                      double current_load, double latency_ms) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = pops_.find(pop_id);
        if (it != pops_.end()) {
            it->second.healthy = healthy;
            it->second.current_load_gbps = current_load;
            it->second.measured_latency_ms = latency_ms;
        }
    }

    // Resolve DNS query: find best PoP for the client
    DnsResponse resolve(const GeoCoord& client_location) const {
        std::lock_guard<std::mutex> lock(mu_);
        std::vector<ScoredPop> candidates;

        for (const auto& [id, pop] : pops_) {
            if (!pop.healthy) continue;

            double load_ratio = pop.current_load_gbps / pop.capacity_gbps;
            if (load_ratio > load_threshold_) continue;  // skip overloaded

            double geo_dist = haversineKm(client_location, pop.location);
            // Score: weighted combination of distance and measured latency
            // Lower is better
            double score = 0.4 * (geo_dist / 20000.0)       // normalize dist
                         + 0.4 * (pop.measured_latency_ms / max_latency_ms_)
                         + 0.2 * load_ratio;                 // prefer less loaded

            candidates.push_back({id, pop.ip_address, score});
        }

        if (candidates.empty()) {
            // Fallback: return any healthy PoP ignoring load
            for (const auto& [id, pop] : pops_) {
                if (pop.healthy) {
                    return {pop.ip_address, id, 30,
                            "fallback-all-overloaded"};
                }
            }
            return {"", "", 5, "no-healthy-pops"};
        }

        std::sort(candidates.begin(), candidates.end(),
                  [](const auto& a, const auto& b) {
                      return a.score < b.score;
                  });

        const auto& best = candidates[0];
        // Short TTL if runner-up is close in score (might flip soon)
        int ttl = 60;
        if (candidates.size() > 1) {
            double gap = candidates[1].score - best.score;
            if (gap < 0.05) ttl = 20;  // tight race, re-evaluate sooner
        }

        return {best.ip, best.pop_id, ttl, "geo-latency-optimal"};
    }

private:
    struct ScoredPop {
        std::string pop_id;
        std::string ip;
        double score;
    };

    static double haversineKm(const GeoCoord& a, const GeoCoord& b) {
        constexpr double R = 6371.0;  // Earth radius in km
        double dLat = toRad(b.latitude - a.latitude);
        double dLon = toRad(b.longitude - a.longitude);
        double lat1 = toRad(a.latitude);
        double lat2 = toRad(b.latitude);

        double h = std::sin(dLat / 2) * std::sin(dLat / 2) +
                   std::cos(lat1) * std::cos(lat2) *
                   std::sin(dLon / 2) * std::sin(dLon / 2);
        return R * 2 * std::atan2(std::sqrt(h), std::sqrt(1 - h));
    }

    static double toRad(double deg) { return deg * M_PI / 180.0; }

    double load_threshold_;
    double max_latency_ms_;
    std::unordered_map<std::string, PopInfo> pops_;
    mutable std::mutex mu_;
};`,
    },
  ],

  diagrams: [
    {
      title: "CDN Architecture Overview",
      kind: "architecture",
      caption: "Multi-tier CDN architecture showing the request flow from client through edge PoPs, shield nodes, to the origin server.",
      mermaid: `graph LR
    Client["Client Browser"] -->|"DNS Lookup"| GeoDNS["GeoDNS / Anycast"]
    GeoDNS -->|"Nearest PoP IP"| Edge["Edge PoP L1"]
    Edge -->|"Cache HIT"| Client
    Edge -->|"Cache MISS"| Shield["Shield Node L2"]
    Shield -->|"Cache HIT"| Edge
    Shield -->|"Cache MISS"| Origin["Origin Server L3"]
    Origin -->|"Response + Headers"| Shield
    Shield -->|"Cache + Forward"| Edge
    Edge -->|"Cache + Serve"| Client
    Origin --- ObjectStore["Object Storage / S3"]
    Origin --- AppServer["Application Server"]
    Edge --- WAF["WAF / DDoS Filter"]
    Edge --- TLS["TLS Termination"]`,
    },
    {
      title: "Cache Invalidation Flow",
      kind: "sequence",
      caption: "Sequence diagram showing how a cache purge propagates from the origin through shield nodes to edge PoPs.",
      mermaid: `sequenceDiagram
    participant Origin as Origin Server
    participant PurgeAPI as Purge API
    participant Shield1 as Shield Node US
    participant Shield2 as Shield Node EU
    participant Edge1 as Edge PoP SJC
    participant Edge2 as Edge PoP NYC
    participant Edge3 as Edge PoP LHR

    Origin->>PurgeAPI: POST /purge key=/api/v2/products
    PurgeAPI->>Shield1: Purge /api/v2/products
    PurgeAPI->>Shield2: Purge /api/v2/products
    Shield1->>Edge1: Propagate purge
    Shield1->>Edge2: Propagate purge
    Shield2->>Edge3: Propagate purge
    Edge1-->>PurgeAPI: ACK purged
    Edge2-->>PurgeAPI: ACK purged
    Edge3-->>PurgeAPI: ACK purged
    PurgeAPI-->>Origin: Purge complete 3/3 edges`,
    },
    {
      title: "Request Routing Decision Flow",
      kind: "flow",
      caption: "Decision flowchart for how incoming requests are routed and served at the edge, including stale-while-revalidate logic.",
      mermaid: `flowchart TD
    REQ["Incoming Request"] --> TLS_TERM["TLS Termination"]
    TLS_TERM --> WAF_CHECK{"WAF Rules Pass?"}
    WAF_CHECK -->|"No"| BLOCK["Block / Rate Limit"]
    WAF_CHECK -->|"Yes"| CACHE_LOOKUP{"Cache Lookup"}
    CACHE_LOOKUP -->|"HIT fresh"| SERVE_CACHED["Serve from Cache"]
    CACHE_LOOKUP -->|"HIT stale"| SWR["Serve Stale + Async Revalidate"]
    CACHE_LOOKUP -->|"MISS"| COALESCE{"Request Coalescing"}
    COALESCE -->|"First request"| SHIELD["Fetch from Shield"]
    COALESCE -->|"Duplicate"| WAIT["Wait for in-flight response"]
    SHIELD -->|"Shield HIT"| CACHE_STORE["Store in Edge Cache"]
    SHIELD -->|"Shield MISS"| ORIGIN_FETCH["Fetch from Origin"]
    ORIGIN_FETCH --> SHIELD_STORE["Store in Shield Cache"]
    SHIELD_STORE --> CACHE_STORE
    CACHE_STORE --> SERVE_CACHED
    WAIT --> SERVE_CACHED
    SWR --> REVALIDATE["Background Revalidate"]
    REVALIDATE --> SHIELD`,
    },
    {
      title: "Global PoP Network Topology",
      kind: "architecture",
      caption: "Logical topology showing how edge PoPs are grouped under regional shield nodes with failover paths.",
      mermaid: `graph TD
    Origin["Origin DC us-east-1"] --> Shield_US["Shield US-West"]
    Origin --> Shield_EU["Shield EU-Central"]
    Origin --> Shield_AP["Shield AP-Southeast"]

    Shield_US --> SJC["Edge: San Jose"]
    Shield_US --> LAX["Edge: Los Angeles"]
    Shield_US --> SEA["Edge: Seattle"]
    Shield_US --> DEN["Edge: Denver"]

    Shield_EU --> FRA["Edge: Frankfurt"]
    Shield_EU --> LHR["Edge: London"]
    Shield_EU --> CDG["Edge: Paris"]
    Shield_EU --> AMS["Edge: Amsterdam"]

    Shield_AP --> SIN["Edge: Singapore"]
    Shield_AP --> NRT["Edge: Tokyo"]
    Shield_AP --> SYD["Edge: Sydney"]
    Shield_AP --> BOM["Edge: Mumbai"]

    Shield_US -.->|"Failover"| Shield_EU
    Shield_EU -.->|"Failover"| Shield_AP
    Shield_AP -.->|"Failover"| Shield_US`,
    },
  ],

  comparison: {
    columns: ["Aspect", "Push-based CDN", "Pull-based CDN", "Hybrid CDN", "P2P-assisted CDN"],
    rows: [
      [
        "Cache Population",
        "Origin pushes content to edges proactively before requests arrive",
        "Edge fetches from origin on first cache miss, then caches locally",
        "Push for popular/predictable content, pull for long-tail",
        "Peers share cached segments, edge serves initial seed",
      ],
      [
        "First-request Latency",
        "Low: content pre-positioned at edge before user requests it",
        "High on first request: full origin round-trip, then fast for subsequent",
        "Low for pushed content, high for first miss on unpushed content",
        "Variable: depends on peer availability and proximity",
      ],
      [
        "Origin Bandwidth Cost",
        "High: all content pushed everywhere regardless of demand",
        "Efficient: only requested content is fetched and cached",
        "Moderate: popular content pushed, rare content pulled on demand",
        "Very low: peers offload 60-80% of delivery bandwidth",
      ],
      [
        "Consistency Model",
        "Strong: origin controls exactly what is at each edge",
        "Eventual: stale content served until TTL expires or purge propagates",
        "Strong for pushed, eventual for pulled content",
        "Weak: no control over peer cache state or eviction",
      ],
      [
        "Best Use Case",
        "Software updates, firmware, pre-scheduled media releases",
        "General web content, APIs, images, user-generated content",
        "Large-scale video platforms with mix of popular and niche content",
        "Live streaming, large-scale event broadcasts, cost-sensitive delivery",
      ],
      [
        "Operational Complexity",
        "High: requires content manifest, scheduling, and pre-warming logic",
        "Low: edges are stateless until first miss, self-managing caches",
        "Medium: needs intelligence to classify content for push vs pull",
        "Very high: peer discovery, NAT traversal, quality enforcement",
      ],
    ],
  },

  interviewQA: [
    {
      q: "How would you design a CDN that serves 10 billion requests per day with sub-50ms P99 latency globally?",
      a: "Start with 200+ PoPs placed at major IXPs and population centers worldwide, using Anycast for L3/L4 routing and GeoDNS for fine-grained L7 load balancing. Each PoP runs 10-50 cache servers behind a load balancer, using consistent hashing to route requests to specific servers by URL, maximizing per-server cache hit rates. At 10B requests/day, that is ~115K requests/sec average and ~350K/sec peak. Spread across 200 PoPs, each PoP handles ~1,750 requests/sec peak, easily within a single server's capacity but distributed for cache efficiency. The cache hierarchy uses L1 edge (hot cache in RAM, ~256GB per server) and L2 shield (warm cache on SSD, ~10TB per server). With a 90% L1 hit rate, only 35K requests/sec reach shields; with 95% shield hit rate, only ~1,750/sec reach the origin. For sub-50ms P99, TLS termination at the edge is essential (saves 100-200ms of cross-continent TLS handshake), and HTTP/2 connection pooling between edge and shield reduces per-request overhead.",
      followUps: [
        "How would you handle a cache stampede when a popular object's TTL expires simultaneously across all edge servers?",
        "What monitoring would you set up to detect and respond to latency regressions?",
      ],
    },
    {
      q: "Explain the trade-offs between different cache invalidation strategies in a CDN.",
      a: "TTL-based expiration is the simplest and most reliable: set Cache-Control max-age and the edge serves stale content for at most that duration. The trade-off is staleness — a 60-second TTL means users may see content up to 60 seconds old. Lowering TTL increases origin load as more revalidation requests flow through. Purge APIs provide near-instant consistency (1-5 seconds globally) but require infrastructure to fan out purge commands to hundreds of PoPs and handle partial failures — what if 298 of 300 PoPs purge successfully but 2 are temporarily unreachable? You need retry logic and monitoring. Versioned URLs (content-hash in the filename like style.a3f2b1.css) are the gold standard for immutable assets: you never need to invalidate because the URL changes when content changes. The trade-off is that you need a build pipeline to generate hashed filenames and update references. Stale-while-revalidate serves stale content immediately while fetching fresh content asynchronously — users always get a fast response, but the first request after TTL expiry sees stale content. In practice, a well-designed CDN uses all four: versioned URLs for static assets, purge for urgent content corrections, stale-while-revalidate for API responses, and TTL as the safety net.",
      followUps: [
        "How would you handle a purge that needs to invalidate millions of URLs matching a pattern?",
        "What happens if a purge command is lost — how do you ensure eventual consistency?",
      ],
    },
    {
      q: "How does a CDN protect against DDoS attacks while maintaining performance for legitimate users?",
      a: "The CDN's distributed architecture is itself the first line of DDoS defense. A 1 Tbps volumetric attack spread across 300 PoPs is only 3.3 Gbps per PoP, well within each PoP's 40-100 Gbps capacity. Anycast routing naturally distributes attack traffic to the nearest PoP, preventing any single location from being overwhelmed. For L3/L4 attacks (SYN floods, UDP reflection), edge routers use BGP Flowspec to drop known attack patterns in hardware, and SYN cookies handle SYN floods without allocating connection state. For L7 attacks (HTTP floods, slowloris), the CDN applies rate limiting per IP/subnet, challenge pages (JavaScript challenges, CAPTCHAs) for suspicious traffic, and WAF rules to block known attack signatures. Bot detection uses browser fingerprinting, TLS fingerprinting (JA3 hashes), and behavioral analysis to distinguish bots from humans. The key design insight is to make detection and mitigation decisions at the edge, before traffic reaches the shield or origin. Traffic scoring assigns each request a risk score based on multiple signals, and the score determines whether to allow, challenge, rate-limit, or block. During an active attack, the CDN can dynamically tighten rules — lowering rate limits, enabling challenges for broader IP ranges — and relax them as the attack subsides.",
      followUps: [
        "How would you handle an L7 DDoS attack that uses thousands of unique IPs with valid-looking browser fingerprints?",
        "What is the trade-off between aggressive DDoS mitigation and blocking legitimate users?",
      ],
    },
    {
      q: "Design the cache warming strategy for a CDN serving a major live event (e.g., a global product launch).",
      a: "Pre-event cache warming is critical because the first seconds of a major event see massive concurrent traffic and cold caches would cause thundering herd on the origin. The strategy has three phases. Phase 1 (hours before): push known static assets (landing page HTML, CSS, JS, images) to all edge PoPs proactively using the CDN's preload API. This is push-based caching for predictable content. Phase 2 (minutes before): generate and cache the initial dynamic content (product page, pricing, availability) at shield nodes, using synthetic requests that populate the cache hierarchy. Set the TTL long enough to survive the initial burst (5-10 minutes) with stale-while-revalidate as a safety net. Phase 3 (during event): use request coalescing aggressively — when thousands of cache misses arrive simultaneously for the same URL, only one request goes to the shield/origin, and all others wait for the result. Configure the origin to handle 10x normal load as a safety margin. Additionally, set up overflow PoPs — PoPs that normally don't serve this content but can be activated via DNS weight changes if primary PoPs become saturated. Monitor cache hit rates in real-time with sub-minute granularity, and have runbooks for common failure modes: origin overload (activate rate limiting), PoP saturation (shift DNS weights), and content errors (instant purge and re-warm).",
      followUps: [
        "How would you handle personalized content during the event without destroying cache hit rates?",
        "What happens if the origin goes down during the event — how long can the CDN serve stale content?",
      ],
    },
    {
      q: "How would you design the control plane for a CDN with 300 PoPs?",
      a: "The control plane manages configuration distribution (routing rules, TLS certificates, WAF policies, cache settings) across all 300 PoPs. The fundamental tension is between consistency and availability: you want all PoPs to have the same configuration, but you cannot afford to block traffic if the control plane is unreachable. A centralized control plane (single source of truth) uses an eventually consistent push model: configuration changes are written to a central store and propagated to all PoPs via a reliable message bus. Each PoP runs a local agent that receives updates and applies them atomically. The agent maintains a local copy of the configuration, so if it loses contact with the central control plane, it continues operating with the last known good configuration. Configuration propagation latency matters — a certificate rotation must reach all 300 PoPs before the old certificate expires. In practice, propagation takes 5-30 seconds for urgent changes (purge, security rules) and 1-5 minutes for routine configuration updates. The control plane must support canary deployments: roll out a configuration change to 5% of PoPs, monitor error rates and latency for 10 minutes, then proceed to 25%, 50%, and 100%. Rollback must be instant — the previous configuration is always retained and can be re-activated in seconds.",
      followUps: [
        "How would you handle a configuration change that causes errors — what signals trigger automatic rollback?",
        "How do you prevent a compromised control plane from pushing malicious configuration to all PoPs?",
      ],
    },
  ],

  mcqs: [
    {
      q: "In a CDN architecture, what is the primary purpose of a shield (mid-tier) node?",
      options: [
        "To provide DDoS protection by filtering malicious traffic before it reaches edge servers",
        "To aggregate cache misses from multiple edge PoPs, reducing the number of requests that reach the origin",
        "To terminate TLS connections and offload encryption work from the origin server",
        "To perform real-time video transcoding for adaptive bitrate streaming",
      ],
      answerIndex: 1,
      explanation: "Shield nodes sit between edge PoPs and the origin server, acting as a second-level cache. When multiple edge PoPs have a cache miss for the same content, the shield node fetches it from the origin once and serves all requesting edges. This dramatically reduces origin load — instead of N edges independently fetching the same content, only one shield request goes to the origin. This also enables efficient request coalescing during thundering herd scenarios.",
    },
    {
      q: "Which routing approach provides the fastest failover when a CDN PoP goes offline?",
      options: [
        "GeoDNS with 30-second TTL",
        "Round-robin DNS with health checks",
        "BGP Anycast routing",
        "HTTP redirect-based routing",
      ],
      answerIndex: 2,
      explanation: "BGP Anycast announces the same IP address from multiple PoPs. When a PoP goes offline, its BGP routes are withdrawn, and the internet's routing infrastructure automatically directs traffic to the next nearest PoP within 1-3 seconds (BGP convergence time). GeoDNS requires clients to wait for DNS TTL expiry (30-60 seconds minimum) before receiving an updated IP. HTTP redirects add a full round-trip per request. Anycast is the gold standard for fast, transparent failover.",
    },
    {
      q: "What is the main drawback of using only TTL-based cache expiration in a CDN?",
      options: [
        "It requires too much memory to store expiration timestamps for each cached object",
        "It cannot handle objects larger than the TTL window allows",
        "Users may see stale content until the TTL expires, with no way to force immediate updates",
        "It only works with HTTP/1.1 and is not compatible with HTTP/2",
      ],
      answerIndex: 2,
      explanation: "TTL-based expiration provides only eventual consistency — cached content is served until the TTL expires, regardless of whether the origin has newer content. If you set a 60-second TTL and update content at second 1, users see stale content for up to 59 seconds. Lowering the TTL reduces staleness but increases origin load from revalidation requests. This is why production CDNs supplement TTL with purge APIs for urgent updates and versioned URLs for immutable assets.",
    },
    {
      q: "During a cache stampede (thundering herd), which technique prevents multiple simultaneous origin fetches for the same object?",
      options: [
        "Increasing the Cache-Control max-age header to a longer duration",
        "Request coalescing: queuing duplicate requests and serving all from a single origin fetch",
        "Adding more edge servers to distribute the load evenly",
        "Switching from pull-based to push-based cache population",
      ],
      answerIndex: 1,
      explanation: "Request coalescing (also called request collapsing) detects that multiple concurrent requests are for the same cache key, sends only one request to the origin, and holds the others in a queue. When the origin responds, all queued requests are served from the single response. This is critical during TTL expiry of popular objects, where hundreds of concurrent cache misses would otherwise overwhelm the origin. Nginx's proxy_cache_lock and Varnish's request coalescing implement this pattern.",
    },
  ],

  flashcards: [
    {
      front: "What is the typical cache hit ratio for static assets at a CDN edge PoP?",
      back: "85-95% for static assets (images, CSS, JS). The shield layer adds another 5-10%, resulting in only 1-5% of requests reaching the origin. Dynamic content with well-designed cache keys achieves 60-80%.",
    },
    {
      front: "How does Anycast routing work for CDN traffic?",
      back: "The same IP address is announced via BGP from every PoP worldwide. The internet's routing infrastructure naturally directs packets to the nearest announcing PoP based on BGP path length. Failover is automatic — when a PoP goes down, its BGP route is withdrawn and traffic shifts to the next nearest PoP within 1-3 seconds.",
    },
    {
      front: "What is stale-while-revalidate and when is it used?",
      back: "A cache strategy where expired (stale) content is served immediately to the user while the edge asynchronously fetches fresh content from the origin in the background. The user gets instant response (no origin round-trip), but the first request after TTL expiry sees slightly stale content. Configured via Cache-Control: stale-while-revalidate=60.",
    },
    {
      front: "What is origin shielding and why is it important?",
      back: "A shield node is a second-level cache between edge PoPs and the origin. Multiple edge PoPs in a region share a shield, so a cache miss at any edge becomes a shield hit if another edge in the region already fetched that content. This reduces origin load by 90%+ and enables efficient request coalescing during thundering herds.",
    },
    {
      front: "How does keyless SSL work in a CDN?",
      back: "The edge server performs TLS termination but delegates the private key operation (signing the TLS handshake) to a remote key server controlled by the customer. The private key never leaves the customer's infrastructure. This adds ~1ms latency to the initial handshake but solves the security concern of distributing private keys to hundreds of PoPs.",
    },
    {
      front: "What is the thundering herd problem in CDNs?",
      back: "When a popular cached object's TTL expires, all edge servers simultaneously experience cache misses and send requests to the origin, causing a spike that can overwhelm it. Solutions: request coalescing (only one fetch per object), stale-while-revalidate (serve stale while fetching), and jittered TTLs (randomize expiry times across edges).",
    },
    {
      front: "How do CDNs handle TLS at scale across hundreds of PoPs?",
      back: "TLS is terminated at the edge to save 100-200ms of cross-continent handshake latency. Private keys are distributed encrypted with HSMs, or via keyless SSL (private key ops delegated to customer's key server), or using delegated credentials (short-lived creds derived from the main certificate). TLS 1.3 reduces handshake to 1-RTT, and 0-RTT resumption eliminates it entirely for returning connections.",
    },
    {
      front: "What is consistent hashing and why is it used within a CDN PoP?",
      back: "Consistent hashing maps both cache keys and servers onto a hash ring, routing each key to the next clockwise server. Within a PoP, it ensures the same URL always goes to the same cache server, maximizing per-server cache hit rates. When a server is added/removed, only 1/N of keys are redistributed instead of reshuffling everything. Virtual nodes (100-200 per server) ensure even load distribution.",
    },
  ],

  exercises: [
    "Design a cache invalidation system that can purge a specific URL from all 300 PoPs within 5 seconds. Consider: message delivery guarantees, partial failure handling, confirmation/audit trail, and how to handle PoPs that are temporarily unreachable. Sketch the purge propagation architecture and estimate the throughput needed for 10,000 purge requests/minute.",
    "Calculate the optimal cache hierarchy for a CDN serving 50TB of unique content with 80% of traffic going to 5% of content. Determine the memory and SSD requirements per edge server and per shield server, assuming 256GB RAM and 10TB SSD per machine. What hit rates would you expect at each tier?",
    "Design the request routing system for a CDN that must handle both Anycast and GeoDNS. Define the health check mechanism, the failover triggers, and how you would handle a regional internet outage that makes an entire continent's PoPs unreachable. Include latency budgets for each routing decision.",
    "Implement a cache warming strategy for a video streaming platform launching a new season of a popular show at a specific time. The catalog has 10 episodes, each with 5 bitrate variants, 6-second segments, and 60-minute runtime. Calculate the total content volume, the pre-warming bandwidth required, and design the pre-warming schedule across the CDN's 200 PoPs.",
    "Design a DDoS mitigation system at the CDN edge that can distinguish between a legitimate traffic surge (viral content) and an L7 DDoS attack. Define the signals you would use for classification, the decision thresholds, and the mitigation actions. Include a false-positive analysis: what percentage of legitimate users would be challenged or blocked under your design?",
  ],

  revisionNotes: [
    "CDN cache hierarchy: L1 edge (RAM, ~256GB, 85-95% hit rate) -> L2 shield (SSD, ~10TB, 95-99% combined hit rate) -> L3 origin. Each tier absorbs 90%+ of misses from the tier above.",
    "Routing approaches: Anycast provides 1-3 second failover via BGP withdrawal but complicates stateful TCP. GeoDNS offers fine-grained control but depends on DNS TTL (30-60 second failover). Best practice: combine both.",
    "Cache invalidation strategies: TTL (simple, eventual consistency), Purge API (near-instant but complex fan-out), Versioned URLs (no invalidation needed for immutable assets), Stale-while-revalidate (availability over freshness).",
    "Thundering herd solutions: request coalescing (one fetch per object, queue duplicates), jittered TTLs (randomize expiry), stale-while-revalidate (serve stale while refreshing), cache locking (Nginx proxy_cache_lock).",
    "TLS at the edge saves 100-200ms per request by avoiding cross-continent handshake. TLS 1.3 = 1-RTT, 0-RTT resumption for returning clients. Key distribution: HSM, keyless SSL, or delegated credentials.",
    "DDoS protection leverages CDN's distributed nature: 1 Tbps attack / 300 PoPs = 3.3 Gbps per PoP. L3/L4: BGP Flowspec, SYN cookies. L7: rate limiting, JS challenges, WAF rules, JA3 fingerprinting.",
    "Video streaming: HLS/DASH segments (2-10 seconds) cached at edge. Long-tail challenge solved by tiered caching (popular at edge, niche at shield). Live streaming adds latency constraints: chunked transfer, HTTP/2 push.",
    "Consistent hashing with 100-200 virtual nodes ensures even distribution within a PoP. Bounded-load variant caps per-node load to prevent hot spots. When a server fails, only 1/N keys redistribute.",
    "Capacity planning: bandwidth (Tbps), CPU (TLS + compression + WAF), memory (hot cache), storage (warm cache). Traffic is diurnal and follows the sun. Design for peak-of-peaks (2-3x average) plus 50% failover headroom.",
    "Control plane: centralized source of truth with eventually consistent push to all PoPs. Local agents cache config for availability during disconnection. Canary deployments (5% -> 25% -> 50% -> 100%) with automatic rollback on error rate spikes.",
  ],

  cheatSheet: [
    "Cache-Control: public, max-age=3600, stale-while-revalidate=60 — cache for 1 hour, serve stale for 60s while revalidating in background",
    "Vary: Accept-Encoding — tells CDN to cache separate versions for gzip, brotli, and uncompressed. Minimize Vary dimensions to preserve hit rate.",
    "ETag + If-None-Match — conditional requests for revalidation. Origin returns 304 Not Modified if content unchanged, saving bandwidth.",
    "Anycast IP: same IP announced from all PoPs via BGP. Automatic failover in 1-3s. Best for UDP (DNS) and initial TCP connection routing.",
    "Consistent hash ring: hash(URL) -> ring position -> next clockwise server. Virtual nodes (150/server) for even distribution. Only 1/N keys move on server add/remove.",
    "Request coalescing: on cache miss, hold duplicate requests in queue, fetch origin once, serve all waiters. Critical for thundering herd prevention.",
    "Shield node: regional mid-tier cache between edge and origin. Collapses N edge misses into 1 origin fetch. Enables efficient purge fan-out (origin -> 20 shields -> 300 edges).",
    "TTL jitter: add random offset to TTL (e.g., TTL * (0.9 + rand * 0.2)) so edges do not all expire the same object simultaneously.",
    "Purge propagation SLA: 1-5 seconds for all PoPs. Use reliable message bus with at-least-once delivery. Track per-PoP acknowledgment for audit trail.",
    "Cache key normalization: strip tracking query params (utm_*), sort remaining params, lowercase the path. Prevents duplicate cache entries for semantically identical URLs.",
  ],

  glossary: [
    {
      term: "Point of Presence (PoP)",
      definition: "A physical location containing CDN edge servers, typically co-located at an IXP or data center close to end users. A large CDN operates 200-300+ PoPs worldwide, each containing 10-50+ servers.",
    },
    {
      term: "Origin Shield",
      definition: "A mid-tier cache layer between edge PoPs and the origin server. Shield nodes aggregate cache misses from multiple edges in a region, reducing origin load by 90%+ and enabling request coalescing during traffic spikes.",
    },
    {
      term: "Anycast",
      definition: "A network routing technique where the same IP address is announced from multiple locations via BGP. Routers direct traffic to the nearest announcing location based on BGP path metrics, providing automatic geographic load balancing and fast failover.",
    },
    {
      term: "Cache Stampede (Thundering Herd)",
      definition: "A failure scenario where a popular cached object expires simultaneously across many edge servers, causing a sudden spike of origin requests. Mitigated by request coalescing, stale-while-revalidate, TTL jitter, and cache locking.",
    },
    {
      term: "Stale-While-Revalidate",
      definition: "A cache strategy (RFC 5861) where an expired cached response is served immediately to the client while the cache asynchronously fetches a fresh copy from the origin. Prioritizes availability and latency over freshness.",
    },
    {
      term: "Edge Compute",
      definition: "The ability to run custom code (JavaScript, Wasm) at CDN edge PoPs, enabling request/response manipulation, A/B testing, authentication, and dynamic cache key computation without origin round-trips. Examples: Cloudflare Workers, Lambda@Edge.",
    },
    {
      term: "Request Coalescing",
      definition: "A technique where multiple concurrent cache misses for the same object are collapsed into a single origin fetch. The first request triggers the fetch; subsequent requests are held in a queue and served from the single response when it arrives.",
    },
  ],

  followUps: [
    "How would you extend this CDN design to support edge computing workloads (running application logic at the edge)?",
    "What changes are needed to optimize the CDN for real-time WebSocket connections instead of HTTP request-response?",
    "How would you design a multi-CDN strategy with automatic failover between providers like Cloudflare, Akamai, and Fastly?",
    "How does HTTP/3 (QUIC) change CDN architecture, particularly around connection migration and 0-RTT?",
    "What are the privacy implications of CDN architecture (user IP visibility, TLS interception) and how do you address them?",
    "How would you design a CDN for IoT workloads with millions of small, frequent requests from resource-constrained devices?",
  ],

  resources: [
    {
      label: "Designing Data-Intensive Applications by Martin Kleppmann",
      kind: "book",
      note: "Chapters on caching, replication, and distributed systems provide foundational knowledge for CDN architecture decisions.",
    },
    {
      label: "How Cloudflare's Architecture Works (Cloudflare Blog)",
      kind: "article",
      note: "Detailed technical blog posts covering Anycast routing, TLS at scale, cache tiering, and DDoS mitigation from a production CDN operator.",
    },
    {
      label: "Netflix Open Connect CDN Architecture",
      kind: "video",
      note: "Netflix's custom CDN serving 15%+ of global internet traffic. Covers appliance-based PoPs, ISP embedding, and content pre-positioning for video streaming.",
    },
    {
      label: "RFC 7234: HTTP Caching and RFC 5861: Stale Extensions",
      kind: "docs",
      note: "The authoritative HTTP caching standards defining Cache-Control semantics, conditional requests, and stale-while-revalidate behavior that CDNs implement.",
    },
    {
      label: "Varnish Cache Architecture (varnish-cache.org)",
      kind: "repo",
      note: "Open-source HTTP accelerator used by many CDNs. Source code demonstrates cache lookup, TTL management, request coalescing, and VCL (Varnish Configuration Language) for edge logic.",
    },
  ],
};
