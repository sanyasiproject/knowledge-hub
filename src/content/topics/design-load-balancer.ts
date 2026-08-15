import type { TopicContent } from "../types";

export const designLoadBalancer: TopicContent = {
  quickSummary: [
    "A load balancer distributes incoming network traffic across multiple backend servers to ensure no single server is overwhelmed. It operates at Layer 4 (transport -- TCP/UDP) or Layer 7 (application -- HTTP/HTTPS), with L7 enabling content-based routing such as URL path, headers, or cookies while L4 is faster but blind to application semantics.",
    "Core algorithms include Round Robin (simple rotation), Weighted Round Robin (capacity-aware), Least Connections (routes to least-loaded server), IP Hash (sticky by client IP), and Consistent Hashing (minimal disruption when servers are added or removed). The choice depends on whether sessions are stateful, whether servers are heterogeneous, and whether cache locality matters.",
    "Health checks are essential: active checks (periodic HTTP/TCP probes) detect failures within seconds, while passive checks (monitoring live traffic for errors) catch degraded performance. A server failing health checks is removed from the pool and re-added only after passing a configurable number of consecutive checks.",
    "SSL/TLS termination at the load balancer offloads expensive cryptographic operations from backend servers, reducing CPU usage by 5-10x on backends. Session persistence (sticky sessions) via cookies or IP affinity is needed for stateful applications but reduces load distribution effectiveness.",
    "Global Server Load Balancing (GSLB) operates at the DNS level, directing users to the nearest healthy data center based on geography, latency measurements, and data center health. It handles disaster recovery by automatically failing over to alternate regions within 30-60 seconds of detecting an outage.",
  ],
  detailed: [
    "## L4 vs L7 Load Balancing\n\nLayer 4 load balancers operate at the transport layer, making routing decisions based on IP addresses and TCP/UDP port numbers without inspecting packet contents. They are extremely fast -- capable of handling millions of connections per second with sub-millisecond latency overhead -- because they simply forward packets using NAT or Direct Server Return (DSR). L7 load balancers operate at the application layer, parsing HTTP headers, URLs, cookies, and even request bodies to make intelligent routing decisions. This enables powerful features like routing /api/* to API servers, /static/* to CDN origins, and /ws/* to WebSocket servers. The trade-off is clear: L4 gives you raw throughput (10M+ concurrent connections on commodity hardware) while L7 gives you content-aware routing at the cost of higher latency (1-5ms overhead) and lower throughput (hundreds of thousands of connections). Modern load balancers like NGINX, HAProxy, and Envoy support both modes, and production architectures often use L4 at the edge for raw speed and L7 internally for smart routing.",
    "## Capacity Estimation: Sizing the L4 and L7 Tiers\n\nSizing starts from two numbers: concurrent connections and new connections per second. Take a target of **10M concurrent connections** and **1M new connections/sec**.\n\n**L4 tier works in packets, not requests.** At roughly 10 packets/sec per active connection (interactive API traffic), 10M connections generate about 100M packets/sec (pps) in aggregate. A kernel-bypass L4 LB (Maglev, Katran with XDP) sustains roughly 10M pps per box, so you need about 100M / 10M = **10 L4 machines**, provisioned as 13-14 for N+2 redundancy and headroom. Memory for connection tracking: 10M connections x ~128-256 bytes = 1.3-2.6 GB per box if fully stateful, or near zero if flow mapping is derived statelessly from a consistent hash of the 5-tuple.\n\n**L7 tier works in requests.** If each connection carries ~2 requests/sec, 10M connections produce 20M requests/sec. A tuned Envoy/Nginx node handles ~50-100K requests/sec with TLS and routing enabled, so you need 20M / 100K = **200 L7 machines** -- roughly 15-20x the L4 count for the same traffic. TLS handshake cost dominates connection setup: at 1M new connections/sec with ECDHE (~0.3ms CPU each), raw handshakes alone cost 1M x 0.3ms = **300 CPU-cores of continuous work**; TLS session resumption (tickets/0-RTT) typically eliminates 80-90% of that, bringing it to 30-60 cores.\n\nKey insight: the L4 tier handles roughly 10x the throughput per box of the L7 tier because L4 touches only packet headers (an O(100ns) hash-and-forward per packet, no allocation, no parsing), while L7 must terminate TLS, parse HTTP, allocate per-request state, and often re-encode -- microseconds per request. That asymmetry is exactly why production designs put a thin, wide L4 layer in front of a horizontally scaled L7 layer rather than scaling L7 to the edge.\n\nCommon mistake: sizing the L7 tier by concurrent connections instead of request rate and TLS handshake rate. An idle keep-alive connection is nearly free at L7; a new TLS connection is thousands of times more expensive than a request on a warm connection.",
    "## Load Balancing Algorithms\n\n**Round Robin** cycles through servers sequentially -- simple but assumes all servers have equal capacity and all requests have equal cost. **Weighted Round Robin** assigns weights proportional to server capacity (e.g., a server with 16 cores gets weight 4 while an 8-core server gets weight 2), distributing traffic accordingly. **Least Connections** routes each new request to the server with the fewest active connections, naturally adapting to heterogeneous request costs. **IP Hash** computes a hash of the client IP to deterministically map clients to servers, providing natural session affinity without cookies. **Consistent Hashing** maps both servers and requests onto a hash ring; each request goes to the next server clockwise on the ring. When a server is removed, only 1/N of requests are redistributed (where N is the number of servers), compared to nearly all requests being redistributed with simple modular hashing. This is critical for cache-heavy architectures where redistribution means cache misses. In practice, consistent hashing uses virtual nodes (100-200 per physical server) to achieve uniform distribution.",
    "## Health Checks and Failure Detection\n\nActive health checks send periodic probes to each backend server -- TCP connect checks verify the server is listening, HTTP checks verify the application returns a 200 OK from a health endpoint, and deep health checks can verify database connectivity or dependency health. Intervals are typically 5-10 seconds with a timeout of 2-3 seconds. A server is marked unhealthy after 2-3 consecutive failures and healthy after 3-5 consecutive successes (hysteresis prevents flapping). Passive health checks monitor real traffic: if a server returns 5xx errors or times out for a configurable percentage of requests (e.g., 50% of requests in a 10-second window), it is temporarily removed. The combination of active and passive checks provides fast detection of both hard failures (server crash) and soft failures (application bugs, resource exhaustion). Health check endpoints should be lightweight but meaningful -- checking that the application can serve requests, not just that the process is running.",
    "## SSL Termination and Session Persistence\n\n**SSL/TLS termination** at the load balancer means the LB handles the TLS handshake and decrypts traffic, forwarding plain HTTP to backends. This offloads CPU-intensive cryptographic operations: a TLS handshake with RSA-2048 costs roughly 1ms of CPU time, while ECDHE is faster at 0.3ms but still significant at scale. With SSL termination, backends save 60-80% CPU on cryptographic operations. The trade-off is that traffic between the LB and backends is unencrypted, which is acceptable within a trusted network but may require re-encryption (SSL bridging) for compliance. **Session persistence** ensures a user's requests consistently reach the same backend server. Methods include cookie-based affinity (the LB injects a cookie identifying the backend), IP-based affinity (hash the client IP), and application-level session IDs. Cookie-based is most reliable since IP-based breaks with NAT and proxies. The downside of session persistence is uneven load distribution -- if one server accumulates many long-lived sessions, it becomes overloaded while others are idle.",
    "## Global Server Load Balancing\n\n**GSLB** extends load balancing across multiple data centers or cloud regions. It typically works at the DNS level: when a client resolves a domain name, the GSLB-aware DNS server returns the IP address of the optimal data center based on geographic proximity, measured latency, data center health, and capacity. DNS-based GSLB has limitations: DNS TTLs mean failover takes 30-60 seconds (or longer if clients cache aggressively), and DNS resolution only happens once per TTL, not per request. For faster failover, Anycast routing announces the same IP from multiple data centers; BGP routing naturally directs clients to the nearest one, and failover happens within seconds when a data center withdraws its announcement. GSLB must handle split-brain scenarios where data centers disagree about each other's health. Active-active setups serve traffic from all regions simultaneously, requiring data replication and eventual consistency, while active-passive keeps a standby region that only activates during failover.",
  ],
  deepDive: [
    "**Connection handling at scale** is where load balancer design gets genuinely difficult. A single L4 load balancer handling 10 million concurrent connections needs careful memory management: each connection tracking entry consumes roughly 128-256 bytes, so 10M connections require 1.3-2.6 GB just for connection state. The data path must avoid per-packet memory allocation -- pre-allocated ring buffers and zero-copy forwarding (using techniques like `splice()` or `sendfile()`) are essential. Modern high-performance load balancers like Maglev (Google) and Katran (Facebook) bypass the kernel entirely using DPDK (Data Plane Development Kit) or XDP (eXpress Data Path) to process packets in user space, achieving line-rate forwarding on 100 Gbps NICs. Connection draining is another critical concern: when removing a server for maintenance, existing connections must be allowed to complete (with a timeout of 30-60 seconds) while new connections are routed elsewhere. Without graceful draining, users experience dropped connections and failed requests.",
    "**Consistent hashing in practice** requires careful tuning to achieve uniform load distribution. With only N physical servers on the hash ring, the load variance is O(log N / N) -- unacceptably high for small clusters. Virtual nodes solve this: mapping each physical server to 100-200 points on the ring reduces variance to under 10%. Google's Maglev uses a custom lookup table algorithm instead of a traditional hash ring, achieving perfectly uniform distribution with O(1) lookup time. The table is built using a permutation-based algorithm that ensures each server fills roughly the same number of table entries. Bounded load consistent hashing (from Vimeo) adds a capacity cap: if the target server's load exceeds the average load by a factor (e.g., 1.25x), the request overflows to the next server on the ring. This prevents hot spots while maintaining the cache-locality benefits of consistent hashing.",
    "**High availability for the load balancer itself** is crucial since it is a single point of failure. The standard approach is an active-passive pair using VRRP (Virtual Router Redundancy Protocol): both LBs share a virtual IP (VIP), with the active one handling all traffic. If the active LB fails, the passive one claims the VIP within 1-3 seconds via a gratuitous ARP announcement. For even higher availability, active-active configurations use ECMP (Equal-Cost Multi-Path routing) to distribute traffic across multiple LBs simultaneously; if one fails, the others absorb its share. State synchronization between LB instances is needed for session persistence: either synchronize connection tables (expensive, complex) or use stateless session affinity (consistent hashing on client IP, no shared state needed). In cloud environments, managed load balancers (AWS ALB/NLB, GCP LB) handle HA transparently, but understanding these patterns matters for on-premise deployments and for making informed cloud architecture decisions.",
    "**Performance tuning and observability** are the difference between a load balancer that works in development and one that survives production traffic spikes. Key metrics to monitor include: connections per second (capacity), active connections (concurrency), request latency percentiles (p50, p95, p99), backend health check results (availability), error rates by backend (quality), and bandwidth (throughput). Connection pooling between the LB and backends reduces TCP handshake overhead for HTTP/1.1 traffic: instead of opening a new connection for each request, the LB maintains a pool of persistent connections to each backend. HTTP/2 multiplexing further reduces connection count by sending multiple requests over a single connection. For WebSocket traffic, the LB must support long-lived connections without timing them out -- configure idle timeouts of 300+ seconds for WebSocket backends versus 60 seconds for HTTP. Rate limiting at the LB layer protects backends from abuse: per-IP rate limits prevent individual clients from monopolizing resources, while global rate limits prevent total overload during traffic spikes.",
    "**Algorithm selection under real traffic** is subtler than the textbook list suggests. Least-connections behaves badly when multiple independent LB instances each track only their own connections: they all see the same server as \"least loaded\" and stampede it (the herd problem). **Power of two choices** fixes this elegantly: pick two backends uniformly at random and send the request to the less loaded of the two. This costs O(1), needs no global state, and reduces maximum load from O(log n / log log n) for random assignment to O(log log n) -- an exponential improvement from just one extra sample. **EWMA latency balancing** (used by Envoy's least-request and Finagle) scores each backend by an exponentially weighted moving average of observed response latency, weighted by outstanding requests; it automatically routes around a backend that is slow but not yet failing (GC pauses, noisy neighbor, cold cache) long before a health check would eject it. In practice: modern L7 proxies default to power-of-two-choices over least-request or EWMA scores, reserving consistent hashing for cache-affinity routes and round robin for genuinely uniform stateless pools.\n\nCommon mistake: using pure least-connections across a fleet of L7 proxies without power-of-two sampling -- the synchronized herding it causes looks exactly like a mysterious rolling hot spot in production.",
    "**Maglev-style stateless consistent hashing** is the reason a modern L4 tier can lose a machine without dropping connections and without any state synchronization. Every Maglev instance independently builds the same lookup table -- a large prime-sized array (e.g., 65,537 entries) filled by having each backend claim slots in a deterministic permutation order until the table is full, giving each backend an almost perfectly equal share. Packet forwarding is then: hash the connection 5-tuple, index the table, forward to that backend. Because the table is a pure function of the backend set, every L4 instance computes an identical mapping.\n\nKey insight: when an L4 LB dies and ECMP reshuffles its flows to surviving peers, the peer computes the same 5-tuple hash against the same table and forwards mid-connection packets to the same backend -- connections survive the LB failure with zero connection-state replication. Contrast this with stateful LBs synchronizing multi-gigabyte connection tables over the network, which is expensive, lossy under load, and itself a failure mode.\n\nThe residual gap: when the *backend set* changes, a small fraction of table entries remap (Maglev tolerates slightly more disruption than a classic ring in exchange for near-perfect balance). A local connection-tracking table papers over this: existing flows found in the table keep their old backend; only genuinely new flows use the updated table. Katran (Meta) and Cloudflare's Unimog follow the same recipe with XDP/eBPF instead of DPDK.",
    "**Direct Server Return (DSR) trade-offs** deserve explicit analysis because DSR is the single biggest lever on L4 capacity. In DSR, the LB forwards only client-to-server packets; the backend writes its response with the VIP as the source address and sends it straight to the client. Since responses are commonly 10-100x larger than requests, the LB's egress bandwidth requirement drops by 90-99% -- a video CDN edge doing 100 Gbps of egress might need only 1-5 Gbps through the LB. The costs: (1) delivery requires either L2 adjacency (rewrite the MAC, same broadcast domain) or IP-in-IP/GUE encapsulation across L3 networks, and encapsulation eats MTU, inviting fragmentation issues; (2) backends must be configured to accept and source traffic for the VIP (VIP on loopback, ARP suppression) -- easy to misconfigure; (3) the LB never sees responses, so it cannot do L7 anything -- no TLS termination, no retries, no response-based passive health signals; you rely on active probes and out-of-band metrics; (4) NAT-based alternatives keep full visibility but pay double bandwidth.\n\nIn practice: DSR is standard for the L4 tier in front of L7 proxies (Maglev, Katran both use encapsulated DSR), while the L7 tier stays full-proxy because it must terminate TLS and inspect responses anyway.",
    "**Connection draining for deploys** turns the LB into the safety mechanism for zero-downtime releases. The sequence for rolling a backend: (1) flip its readiness endpoint to failing (or deregister it from service discovery) so the LB stops sending *new* connections -- crucially, the liveness signal stays green so orchestrators do not kill it; (2) enter a lameduck window (30-120s) where in-flight requests complete; for HTTP/2 and gRPC send GOAWAY so clients gracefully migrate multiplexed streams; for WebSockets either wait out a longer drain or ask clients to reconnect; (3) after the drain deadline, force-close stragglers and stop the process. The LB-side mirror of this is *slow start* on the way back in: a freshly returned backend gets a ramped weight (e.g., linear over 30s) so cold caches, empty connection pools, and JIT warm-up do not make it immediately the slowest node -- which passive health checking would then punish, causing a fresh ejection.\n\nWarning: draining interacts badly with naive autoscaling -- if scale-in terminates instances before the drain window elapses, users see connection resets that look like random network errors. Always wire the terminate hook to wait for the LB to confirm the target is drained.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Consistent Hashing with Virtual Nodes in C++",
      source: `#include <map>
#include <string>
#include <vector>
#include <functional>
#include <cstdint>
#include <mutex>
#include <stdexcept>

class ConsistentHash {
private:
    // Hash ring: hash value -> server name
    std::map<uint64_t, std::string> ring_;
    int virtualNodes_;   // virtual nodes per physical server
    std::mutex mutex_;

    uint64_t hash(const std::string& key) {
        // FNV-1a hash for good distribution
        uint64_t h = 14695981039346656037ULL;
        for (char c : key) {
            h ^= static_cast<uint64_t>(c);
            h *= 1099511628211ULL;
        }
        return h;
    }

public:
    explicit ConsistentHash(int virtualNodes = 150)
        : virtualNodes_(virtualNodes) {}

    void addServer(const std::string& server) {
        std::lock_guard<std::mutex> lock(mutex_);
        for (int i = 0; i < virtualNodes_; ++i) {
            std::string vnode = server + "#VN" + std::to_string(i);
            uint64_t h = hash(vnode);
            ring_[h] = server;
        }
    }

    void removeServer(const std::string& server) {
        std::lock_guard<std::mutex> lock(mutex_);
        for (int i = 0; i < virtualNodes_; ++i) {
            std::string vnode = server + "#VN" + std::to_string(i);
            uint64_t h = hash(vnode);
            ring_.erase(h);
        }
    }

    // Find the server responsible for this key
    std::string getServer(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (ring_.empty()) {
            throw std::runtime_error("No servers in the ring");
        }
        uint64_t h = hash(key);
        // Find the first server clockwise from the hash
        auto it = ring_.lower_bound(h);
        if (it == ring_.end()) {
            it = ring_.begin(); // Wrap around
        }
        return it->second;
    }

    size_t serverCount() {
        std::lock_guard<std::mutex> lock(mutex_);
        // Count unique servers (not virtual nodes)
        std::set<std::string> unique;
        for (auto& [h, s] : ring_) unique.insert(s);
        return unique.size();
    }
};

// Usage:
// ConsistentHash ch(150); // 150 virtual nodes per server
// ch.addServer("backend-1");
// ch.addServer("backend-2");
// ch.addServer("backend-3");
// std::string target = ch.getServer("user-session-12345");
// When backend-2 is removed, only ~1/3 of keys move.`,
    },
    {
      language: "cpp",
      caption: "Weighted Round Robin Load Balancer with Health Checks",
      source: `#include <vector>
#include <string>
#include <mutex>
#include <atomic>
#include <chrono>

struct Backend {
    std::string address;
    int port;
    int weight;          // Relative capacity (e.g., 1-10)
    int currentWeight;   // Used for smooth weighted round robin
    std::atomic<int> activeConnections{0};
    std::atomic<bool> healthy{true};
    std::chrono::steady_clock::time_point lastHealthCheck;
    int consecutiveFailures = 0;
    int consecutiveSuccesses = 0;
};

class WeightedRoundRobin {
private:
    std::vector<Backend> backends_;
    std::mutex mutex_;

    static constexpr int UNHEALTHY_THRESHOLD = 3;
    static constexpr int HEALTHY_THRESHOLD = 5;

public:
    void addBackend(const std::string& addr, int port, int weight) {
        backends_.push_back({addr, port, weight, 0});
    }

    // Smooth Weighted Round Robin (NGINX algorithm)
    // Ensures even distribution matching weight ratios
    Backend* selectBackend() {
        std::lock_guard<std::mutex> lock(mutex_);
        Backend* best = nullptr;
        int totalWeight = 0;

        for (auto& b : backends_) {
            if (!b.healthy.load()) continue;

            b.currentWeight += b.weight;
            totalWeight += b.weight;

            if (!best || b.currentWeight > best->currentWeight) {
                best = &b;
            }
        }

        if (!best) return nullptr; // All backends unhealthy

        best->currentWeight -= totalWeight;
        best->activeConnections.fetch_add(1);
        return best;
    }

    void releaseConnection(Backend* b) {
        b->activeConnections.fetch_sub(1);
    }

    // Least Connections selection (alternative algorithm)
    Backend* selectLeastConnections() {
        std::lock_guard<std::mutex> lock(mutex_);
        Backend* best = nullptr;
        double bestScore = 1e18;

        for (auto& b : backends_) {
            if (!b.healthy.load()) continue;
            // Weighted least connections: connections / weight
            double score = static_cast<double>(
                b.activeConnections.load()) / b.weight;
            if (score < bestScore) {
                bestScore = score;
                best = &b;
            }
        }

        if (best) best->activeConnections.fetch_add(1);
        return best;
    }

    // Called by health check thread
    void reportHealthCheck(size_t index, bool success) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto& b = backends_[index];
        b.lastHealthCheck = std::chrono::steady_clock::now();

        if (success) {
            b.consecutiveFailures = 0;
            b.consecutiveSuccesses++;
            if (!b.healthy.load() &&
                b.consecutiveSuccesses >= HEALTHY_THRESHOLD) {
                b.healthy.store(true);
                b.currentWeight = 0; // Reset for smooth WRR
            }
        } else {
            b.consecutiveSuccesses = 0;
            b.consecutiveFailures++;
            if (b.healthy.load() &&
                b.consecutiveFailures >= UNHEALTHY_THRESHOLD) {
                b.healthy.store(false);
            }
        }
    }
};`,
    },
    {
      language: "cpp",
      caption: "Connection Draining and Graceful Server Removal",
      source: `#include <atomic>
#include <chrono>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <string>
#include <thread>
#include <unordered_map>

enum class ServerState {
    ACTIVE,     // Accepting new connections
    DRAINING,   // No new connections, existing ones finishing
    REMOVED     // Fully removed from pool
};

struct ServerEntry {
    std::string address;
    ServerState state = ServerState::ACTIVE;
    std::atomic<int> activeConnections{0};
    std::chrono::steady_clock::time_point drainStartTime;
};

class ConnectionDrainer {
private:
    std::unordered_map<std::string, ServerEntry> servers_;
    std::mutex mutex_;
    std::condition_variable cv_;
    int drainTimeoutSec_;

public:
    explicit ConnectionDrainer(int drainTimeoutSec = 30)
        : drainTimeoutSec_(drainTimeoutSec) {}

    // Begin graceful removal of a server
    bool startDrain(const std::string& address) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = servers_.find(address);
        if (it == servers_.end()) return false;

        it->second.state = ServerState::DRAINING;
        it->second.drainStartTime =
            std::chrono::steady_clock::now();

        // Launch async drain monitor
        std::thread([this, address]() {
            waitForDrain(address);
        }).detach();

        return true;
    }

    // Check if a server can accept new connections
    bool isAcceptingConnections(const std::string& address) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = servers_.find(address);
        if (it == servers_.end()) return false;
        return it->second.state == ServerState::ACTIVE;
    }

    void onConnectionStart(const std::string& address) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = servers_.find(address);
        if (it != servers_.end()) {
            it->second.activeConnections.fetch_add(1);
        }
    }

    void onConnectionEnd(const std::string& address) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = servers_.find(address);
        if (it != servers_.end()) {
            it->second.activeConnections.fetch_sub(1);
            cv_.notify_all();
        }
    }

private:
    void waitForDrain(const std::string& address) {
        std::unique_lock<std::mutex> lock(mutex_);
        auto deadline = std::chrono::steady_clock::now() +
            std::chrono::seconds(drainTimeoutSec_);

        cv_.wait_until(lock, deadline, [&]() {
            auto it = servers_.find(address);
            return it == servers_.end() ||
                   it->second.activeConnections.load() == 0;
        });

        auto it = servers_.find(address);
        if (it != servers_.end()) {
            int remaining = it->second.activeConnections.load();
            // Force-close remaining connections after timeout
            it->second.state = ServerState::REMOVED;
            // Log: "Server removed. Force-closed N connections."
        }
    }
};`,
    },
  ],
  diagrams: [
    {
      title: "Load Balancer Architecture Overview",
      kind: "architecture",
      caption:
        "Layered production load balancing. Solid arrows show the normal request path: clients resolve via GSLB DNS to a BGP anycast VIP, edge routers ECMP-spray packets across active-active L4 LBs, which consistent-hash flows to L7 proxies that terminate TLS and route to healthy backend pools. Dashed arrows show the failover path (an L4 peer absorbing flows via consistent hashing, health-check ejection of a bad backend) and control-plane flows (config push, backend registration, active probing). The DSR option lets backends reply directly to clients, bypassing the LB on the response path.",
      mermaid: `graph TB
    CLIENTS["Clients"]
    subgraph EDGE["Edge routing"]
        DNS["GSLB DNS<br/>geo and health aware"]
        VIP["BGP Anycast VIP<br/>same IP announced from every region"]
        RTR["Edge routers<br/>ECMP by 5-tuple hash"]
    end
    subgraph L4TIER["L4 tier - packet rate, active-active"]
        L4A["L4 LB A<br/>Maglev/IPVS-style consistent hashing<br/>stateless flow mapping"]
        L4B["L4 LB B<br/>active-active peer<br/>same hash table, no state sync needed"]
    end
    subgraph L7TIER["L7 tier - request rate"]
        L7A["Envoy/Nginx 1<br/>TLS termination, routing rules, retries"]
        L7B["Envoy/Nginx 2<br/>TLS termination, routing rules, retries"]
    end
    subgraph POOLS["Backend pools"]
        API["API pool<br/>healthy"]
        WEB["Web pool<br/>healthy"]
        BAD["api-7<br/>UNHEALTHY - ejected from pool"]
    end
    subgraph CTRL["Control plane"]
        SD["Service discovery<br/>backend registration"]
        CFG["Config service<br/>routing rules, weights"]
        HC["Health checker<br/>active probes with hysteresis"]
    end
    CLIENTS -->|"1: resolve hostname"| DNS
    DNS -->|"2: returns anycast VIP"| VIP
    VIP --> RTR
    CLIENTS -->|"3: TCP/QUIC to VIP"| RTR
    RTR -->|"ECMP"| L4A
    RTR -->|"ECMP"| L4B
    L4A -->|"4: consistent hash on 5-tuple<br/>DSR or encap forward"| L7A
    L4B --> L7B
    L7A -->|"5: route by path/header, retry on failure"| API
    L7A --> WEB
    L7B --> API
    L4B -.->|"FAILOVER: L4A dies, ECMP rehashes to B<br/>same consistent hash keeps flows alive"| L7A
    L7B -.->|"FAILOVER: retry on healthy pool member"| WEB
    SD --> CFG
    CFG -.->|"push config"| L4A
    CFG -.->|"push config"| L7A
    HC -.->|"probe /healthz every 5s"| API
    HC -.->|"3 fails: eject"| BAD
    HC -.-> CFG
    API -.->|"DSR option: response bypasses LB,<br/>straight to client"| CLIENTS`,
    },
    {
      title: "Health Check State Machine",
      kind: "state",
      caption:
        "Server transitions between healthy and unhealthy states with hysteresis to prevent flapping.",
      mermaid: `stateDiagram-v2
    [*] --> Healthy
    Healthy --> Suspect: 1 failed check
    Suspect --> Healthy: Successful check
    Suspect --> Unhealthy: 3 consecutive failures
    Unhealthy --> Recovery: 1 successful check
    Recovery --> Healthy: 5 consecutive successes
    Recovery --> Unhealthy: Any failure
    Unhealthy --> Removed: Manual removal`,
    },
    {
      title: "Request Routing Flow",
      kind: "flow",
      caption:
        "Decision flow for routing an incoming request through the load balancer including health checks, algorithm selection, and session persistence.",
      mermaid: `flowchart TD
    A["Request Arrives"] --> B{"SSL Termination needed?"}
    B -->|Yes| C["Decrypt TLS"]
    B -->|No| D["Parse Request"]
    C --> D
    D --> E{"Session Cookie present?"}
    E -->|Yes| F["Route to pinned server"]
    E -->|No| G["Apply LB Algorithm"]
    F --> H{"Pinned server healthy?"}
    H -->|Yes| I["Forward to pinned server"]
    H -->|No| G
    G --> J["Select best backend"]
    J --> K["Forward request"]
    K --> L["Set session cookie in response"]
    L --> M["Return response to client"]`,
    },
    {
      title: "GSLB Failover Sequence",
      kind: "sequence",
      caption:
        "DNS-based global load balancing detects a data center failure and redirects clients to the nearest healthy region.",
      mermaid: `sequenceDiagram
    participant Client
    participant DNS as GSLB DNS
    participant DC1 as US-East DC
    participant DC2 as EU-West DC
    participant Monitor as Health Monitor
    Client->>DNS: Resolve api.example.com
    DNS->>Client: Return US-East IP TTL=30s
    Client->>DC1: HTTPS Request
    DC1-->>Client: 200 OK
    Monitor->>DC1: Health check
    DC1-->>Monitor: Timeout - DC down
    Monitor->>DNS: Mark US-East unhealthy
    Client->>DNS: Resolve api.example.com after TTL
    DNS->>Client: Return EU-West IP
    Client->>DC2: HTTPS Request
    DC2-->>Client: 200 OK`,
    },
  ],
  interviewQA: [
    {
      q: "When would you choose L4 load balancing over L7, and vice versa?",
      a: "Choose L4 when you need maximum throughput and minimum latency -- for example, at the edge of your network handling millions of TCP connections, or for non-HTTP protocols like database connections, gRPC streams, or game servers. L4 load balancers can handle 10M+ concurrent connections on commodity hardware because they operate on packets without parsing application-layer data. Choose L7 when you need content-aware routing: directing /api requests to API servers, /static to CDN origins, implementing A/B testing via headers, or making routing decisions based on cookies or JWT claims. In practice, most production architectures use both: L4 at the edge for speed and L7 internally for smart routing. The key insight is that L4 operates per-connection while L7 operates per-request, so L7 can multiplex many requests over fewer backend connections using HTTP/2.",
      followUps: [
        "How does HTTP/2 multiplexing change the connection dynamics between L7 LB and backends?",
        "What is Direct Server Return and when would you use it?",
      ],
    },
    {
      q: "How does consistent hashing minimize disruption when adding or removing servers?",
      a: "In consistent hashing, servers and keys are both mapped onto a circular hash ring of size 2^64. A key is assigned to the first server found clockwise from its hash position on the ring. When a server is removed, only the keys that were assigned to it need to be reassigned -- they move to the next server clockwise. This means only K/N keys move on average (where K is total keys and N is total servers), compared to nearly all keys with modular hashing. Adding a server similarly only affects keys between the new server and its predecessor on the ring. Virtual nodes (100-200 per physical server) are essential for uniform distribution -- without them, servers can end up with wildly different portions of the ring. Google's Maglev improves on this with a lookup table approach that guarantees perfectly equal distribution. The practical impact is enormous for caching layers: with consistent hashing, a server addition causes a 1/N cache miss rate spike, versus nearly 100% with naive hashing.",
      followUps: [
        "What is bounded load consistent hashing?",
        "How does Maglev hashing work?",
      ],
    },
    {
      q: "How do you handle the load balancer being a single point of failure?",
      a: "The primary approach is VRRP-based active-passive failover. Two load balancer instances share a Virtual IP (VIP). The active instance handles all traffic while the passive monitors the active's health via heartbeat. If the active fails, the passive claims the VIP within 1-3 seconds using a gratuitous ARP announcement, and all new connections are routed to it. Existing connections on the failed LB are lost -- clients must reconnect. For zero-downtime failover, use active-active with ECMP: the upstream router distributes traffic across multiple LB instances using equal-cost multi-path routing. If one LB fails, the router detects it via BFD (Bidirectional Forwarding Detection) within milliseconds and redistributes traffic to the remaining LBs. In cloud environments, managed load balancers like AWS NLB and GCP LB provide built-in HA with automatic failover, scaling across multiple availability zones transparently.",
      followUps: [
        "How do you synchronize connection state between active and passive LBs?",
        "What are the pros and cons of DNS-based failover vs IP failover?",
      ],
    },
    {
      q: "What are the trade-offs of SSL termination at the load balancer?",
      a: "SSL termination at the LB means the LB handles TLS handshakes and decrypts all incoming traffic, forwarding plain HTTP to backends. The primary benefit is offloading CPU-intensive cryptographic operations: an RSA-2048 handshake costs roughly 1ms of CPU, and a high-traffic server handling 10,000 new TLS connections per second would spend 10 seconds of CPU per second on handshakes alone. With SSL termination, backends save 60-80% CPU on crypto operations. It also simplifies certificate management -- you manage certificates in one place instead of on every backend. The main drawback is that traffic between the LB and backends is unencrypted, which is a security concern. For compliance requirements (PCI-DSS, HIPAA), you may need SSL bridging: the LB decrypts, inspects, and re-encrypts traffic using a separate internal certificate. This adds latency (1-2ms) but maintains encryption end-to-end. Another option is SSL passthrough: the LB forwards encrypted traffic without decryption, but then loses the ability to do L7 routing.",
    },
    {
      q: "How do you design a load balancer that handles 10 million concurrent connections?",
      a: "First, bypass the kernel network stack using DPDK or XDP to process packets in user space. The kernel's TCP stack adds significant overhead at this scale: context switches, socket buffer copies, and lock contention become bottlenecks. With DPDK, you can achieve line-rate packet processing on 100Gbps NICs. Second, optimize memory: each connection tracking entry consumes 128-256 bytes, so 10M connections need 1.3-2.6 GB of memory. Use pre-allocated memory pools to avoid allocation overhead. Third, use multi-core processing with RSS (Receive Side Scaling) to distribute packets across CPU cores by flow hash, and use per-core data structures to avoid lock contention. Fourth, implement connection pooling and multiplexing to the backend: 10M client connections do not require 10M backend connections -- with HTTP/2 and connection pooling, you might use only 10,000-100,000 backend connections. Fifth, use L4 (not L7) for this scale -- parsing HTTP at 10M connections is impractical on a single machine. Scale L7 horizontally behind an L4 tier.",
    },
    {
      q: "Walk me through the capacity math for a system with 10M concurrent connections and 1M new connections per second.",
      a: "Split the problem by tier because they scale on different units. L4 scales on packet rate: 10M connections at ~10 packets/sec each is ~100M pps aggregate; a kernel-bypass L4 box (Maglev/Katran style) does ~10M pps, so ~10 machines, provisioned as 13-14 for N+2. Connection state is 128-256 bytes/entry, so 10M connections is 1.3-2.6 GB per box -- or effectively zero if forwarding is a stateless consistent hash of the 5-tuple. L7 scales on request rate and TLS handshake rate: at ~2 requests/sec per connection that is 20M req/s, and a tuned Envoy/Nginx node does 50-100K req/s, so ~200 machines -- roughly 15-20x the L4 count. The handshake term is the one people miss: 1M new TLS connections/sec at ~0.3ms CPU per ECDHE handshake is 300 CPU-cores of continuous crypto; session resumption cuts that by 80-90%. The structural conclusion: a thin, wide L4 tier (headers only, ~100ns per packet) in front of a horizontally scaled L7 tier (parse, terminate, allocate -- microseconds per request) -- which is why the L4 tier delivers roughly 10x the per-box throughput of L7.",
      followUps: [
        "How does TLS session resumption change the handshake math?",
        "What changes in this estimate if the workload is long-lived WebSockets instead of short HTTP requests?",
      ],
    },
    {
      q: "How does a Maglev-style L4 load balancer survive the failure of one of its instances without dropping client connections?",
      a: "Because forwarding is a deterministic pure function rather than per-instance state. Every Maglev instance independently builds an identical lookup table -- a prime-sized array where each backend claims slots via a deterministic permutation until the table is full, giving near-perfectly equal shares. To forward a packet, the LB hashes the connection 5-tuple, indexes the table, and sends the packet to that backend. When an instance dies, the upstream router's ECMP redistributes its packet flows to the surviving instances -- but those peers hash the same 5-tuple against the same table and reach the same backend, so mid-connection packets keep landing on the server that owns the TCP state. No connection-table replication is needed, which removes both the bandwidth cost and the failure modes of state sync. The remaining edge case is a backend-set change (not an LB failure): a small fraction of table entries remap, so implementations keep a local connection-tracking table as an optimization -- existing flows pin to their old backend, only new flows follow the updated table. This is the core reason modern L4 tiers run active-active behind ECMP instead of VRRP active-passive pairs.",
      followUps: [
        "Why does Maglev accept slightly more remap disruption than a classic hash ring?",
        "What happens if ECMP rehashes flows at the same moment the backend set changes?",
      ],
    },
  ],
  mcqs: [
    {
      q: "In consistent hashing with 150 virtual nodes per server and 6 physical servers, approximately how many keys are redistributed when one server is removed?",
      options: [
        "All keys are redistributed",
        "Approximately 1/6 of the keys",
        "Approximately 1/2 of the keys",
        "No keys are redistributed",
      ],
      answerIndex: 1,
      explanation:
        "In consistent hashing, removing one server from N servers redistributes approximately 1/N of the keys. With 6 servers, about 1/6 (16.7%) of keys move to adjacent servers on the ring. Virtual nodes improve uniformity but do not change this fundamental ratio.",
    },
    {
      q: "Which load balancing algorithm is best suited for backend servers with significantly different hardware capacities?",
      options: [
        "Simple Round Robin",
        "Random selection",
        "Weighted Least Connections",
        "IP Hash",
      ],
      answerIndex: 2,
      explanation:
        "Weighted Least Connections accounts for both server capacity (via weights) and current load (via connection count). A powerful server with weight 10 and 50 connections has the same weighted score as a smaller server with weight 5 and 25 connections, naturally balancing load proportional to capacity.",
    },
    {
      q: "What is the primary advantage of Direct Server Return (DSR) in L4 load balancing?",
      options: [
        "It enables content-based routing",
        "Response traffic bypasses the load balancer, reducing its bandwidth requirement",
        "It provides built-in SSL termination",
        "It eliminates the need for health checks",
      ],
      answerIndex: 1,
      explanation:
        "In DSR, the load balancer only handles inbound traffic. Responses go directly from the backend to the client, bypassing the LB. Since responses are typically 10-100x larger than requests (think downloading files or API responses), this dramatically reduces the LB bandwidth requirement.",
    },
    {
      q: "Why is hysteresis important in health check state transitions?",
      options: [
        "It makes health checks faster",
        "It prevents rapid flapping between healthy and unhealthy states due to transient issues",
        "It reduces the number of health check probes needed",
        "It enables passive health checking",
      ],
      answerIndex: 1,
      explanation:
        "Hysteresis requires multiple consecutive failures before marking unhealthy and multiple consecutive successes before marking healthy again. This prevents a server experiencing a single transient timeout from being removed and immediately re-added, which would cause traffic oscillation and connection drops.",
    },
  ],
  flashcards: [
    {
      front: "What is the difference between L4 and L7 load balancing?",
      back: "L4 operates at the transport layer (TCP/UDP), routing based on IP and port. It is fast (10M+ connections, sub-ms latency) but content-blind. L7 operates at the application layer (HTTP), routing based on URLs, headers, cookies. It is slower (1-5ms overhead) but enables content-aware routing, SSL termination, and request-level decisions.",
    },
    {
      front: "How does the Smooth Weighted Round Robin algorithm work (NGINX)?",
      back: "Each server has a currentWeight starting at 0 and a fixed weight. On each selection: (1) Add weight to each server's currentWeight. (2) Select the server with the highest currentWeight. (3) Subtract totalWeight from the selected server's currentWeight. This produces a smooth interleaving pattern rather than clustered selections.",
    },
    {
      front: "What is Direct Server Return (DSR)?",
      back: "In DSR, the load balancer only handles inbound requests. Responses go directly from the backend to the client, bypassing the LB. This reduces LB bandwidth by 10-100x since responses are typically much larger than requests. Requires backends to accept traffic for the VIP and use it as the source IP.",
    },
    {
      front: "How does ECMP provide high availability for load balancers?",
      back: "Equal-Cost Multi-Path routing distributes traffic across multiple LB instances at the router level. If one LB fails, the router detects it via BFD (milliseconds) and redistributes to remaining LBs. Unlike active-passive (VRRP), all LBs are active simultaneously, providing both HA and horizontal scaling.",
    },
    {
      front: "What is the difference between SSL termination, SSL bridging, and SSL passthrough?",
      back: "Termination: LB decrypts, forwards plain HTTP to backends (fastest, but unencrypted internally). Bridging: LB decrypts, inspects, re-encrypts with internal cert (secure but adds 1-2ms). Passthrough: LB forwards encrypted traffic untouched (fully encrypted, but no L7 routing possible).",
    },
    {
      front: "Why are virtual nodes needed in consistent hashing?",
      back: "With only N physical servers on the ring, load distribution is uneven with O(log N / N) variance. Virtual nodes (100-200 per server) map each server to many ring positions, reducing variance to under 10%. When a server is removed, its virtual nodes spread the redistributed keys across many servers instead of dumping them all on one neighbor.",
    },
    {
      front: "What is connection draining and why is it important?",
      back: "Connection draining allows existing connections to complete when a server is being removed, while routing new connections elsewhere. Without it, active requests are abruptly terminated. Typically implemented with a timeout (30-60s): after the timeout, remaining connections are force-closed. Essential for zero-downtime deployments.",
    },
    {
      front: "How does Anycast-based GSLB work?",
      back: "The same IP address is announced via BGP from multiple data centers. Routers naturally direct clients to the nearest announcement (shortest BGP path). Failover is automatic: when a DC withdraws its BGP announcement, traffic shifts to the next nearest DC within seconds. Faster than DNS-based GSLB which depends on TTL expiry.",
    },
    {
      front: "What is the power of two choices algorithm and why is it used?",
      back: "Sample two backends uniformly at random and route to the less loaded one. O(1) cost, no global state, and maximum load drops from O(log n / log log n) for pure random to O(log log n). It avoids the herd problem where multiple independent LBs all pick the same 'least loaded' server. Default strategy in Envoy's least-request balancer.",
    },
    {
      front: "Why does a Maglev L4 tier need no connection state synchronization?",
      back: "Every instance independently computes an identical lookup table (prime-sized array filled by each backend's deterministic permutation). Forwarding = hash the 5-tuple, index the table. If an LB dies, ECMP shifts its flows to peers that compute the same backend from the same hash, so mid-connection packets still reach the server holding the TCP state.",
    },
    {
      front: "Roughly how many L4 vs L7 machines for 10M concurrent connections at 1M new conn/s?",
      back: "L4: ~100M pps aggregate (10 pkt/s per conn) at ~10M pps per kernel-bypass box = ~10 machines (provision 13-14). L7: ~20M req/s (2 req/s per conn) at 50-100K req/s per node = ~200 machines. Plus ~300 CPU-cores of ECDHE handshake work at 1M new conn/s before session resumption. L4 is ~10x per-box throughput of L7.",
    },
    {
      front: "What is EWMA latency load balancing?",
      back: "Each backend is scored by an exponentially weighted moving average of observed response latency, weighted by outstanding requests. Traffic automatically shifts away from backends that are slow but not yet failing (GC pause, noisy neighbor, cold cache) -- long before active health checks would eject them. Used by Envoy and Finagle.",
    },
  ],
  exercises: [
    "**Design a multi-tier load balancing architecture**: You have 3 data centers, each with 50 backend servers of varying capacity. Design the full stack: GSLB for cross-DC routing, L4 LB at the edge of each DC, L7 LB for content routing, and backend server pools. Specify algorithms at each tier, health check intervals, failover behavior, and how you handle a full DC outage. Calculate the total number of health check probes per second across the system.",
    "**Implement bounded load consistent hashing**: Extend the basic consistent hashing algorithm so that no server handles more than (1 + epsilon) * average_load. When the target server on the ring exceeds its capacity bound, overflow to the next server clockwise. Implement this in C++ and analyze how different epsilon values (0.1, 0.25, 0.5) affect load distribution versus cache hit rates.",
    "**Build a health check system**: Design and implement a health checker that performs TCP, HTTP, and deep (dependency) health checks against a pool of 1000 servers. Support configurable intervals (1-60s), timeouts (1-10s), and thresholds (2-10 failures/successes). Implement hysteresis, connection pooling for HTTP checks, and concurrent execution. Calculate the required bandwidth and connection count for your design.",
    "**Design session persistence without server-side state**: Your application requires session affinity but you want stateless backend servers. Design a system using signed, encrypted session tokens (JWTs) carried in cookies. How does the LB verify and route based on these tokens? What happens when the target server is unhealthy? How do you handle token migration when scaling the server pool?",
    "**Capacity planning for a 10M connection load balancer**: Calculate the memory, CPU, and bandwidth requirements for an L4 load balancer handling 10 million concurrent TCP connections with an average of 100 new connections/second and 50KB average response size. Compare kernel-based (epoll) versus DPDK-based approaches and estimate the hardware needed for each.",
  ],
  revisionNotes: [
    "**L4 vs L7**: L4 = transport layer, routes by IP/port, 10M+ connections, sub-ms overhead, content-blind. L7 = application layer, routes by URL/header/cookie, hundreds of thousands of connections, 1-5ms overhead, content-aware. Use L4 at edge, L7 internally.",
    "**Algorithms**: Round Robin (equal servers), Weighted RR (heterogeneous capacity), Least Connections (adapts to variable request cost), IP Hash (sticky without cookies), Consistent Hashing (cache locality, minimal redistribution on server changes).",
    "**Consistent Hashing**: Maps servers and keys on a ring. Only K/N keys move when a server is added/removed. Use 100-200 virtual nodes for uniform distribution. Bounded load variant caps each server at (1+epsilon) * average load.",
    "**Health Checks**: Active (periodic probes every 5-10s) + Passive (monitor live traffic errors). Hysteresis: 3 failures to mark unhealthy, 5 successes to mark healthy. Prevents flapping on transient issues.",
    "**SSL Termination**: Offloads crypto from backends, saves 60-80% CPU. RSA-2048 handshake costs roughly 1ms CPU. Trade-off: internal traffic unencrypted. SSL bridging re-encrypts for compliance. SSL passthrough preserves end-to-end encryption but disables L7 routing.",
    "**Session Persistence**: Cookie-based (LB injects cookie), IP-based (hash client IP), Application-level (session ID routing). Cookie-based is most reliable. Downside: uneven load distribution with long-lived sessions.",
    "**GSLB**: DNS-based (returns nearest DC IP, failover in 30-60s based on TTL) or Anycast (BGP-based, failover in seconds). Active-active requires data replication. Active-passive simpler but wastes standby capacity.",
    "**High Availability**: Active-passive with VRRP (1-3s failover). Active-active with ECMP (sub-second failover, all LBs active). Cloud managed LBs handle HA transparently.",
    "**Connection Draining**: When removing a server, stop sending new connections but allow existing ones to finish within a timeout (30-60s). Force-close remaining connections after timeout. Essential for zero-downtime deployments.",
    "**Scale numbers**: L4 LB handles 10M+ concurrent connections. L7 LB handles 100K-1M concurrent connections. DPDK-based LBs achieve line-rate on 100Gbps NICs. Connection tracking entry: 128-256 bytes each.",
    "**Capacity math**: 10M conns x ~10 pkt/s = 100M pps; at ~10M pps per kernel-bypass box that is ~10 L4 machines (provision 13-14 for N+2). Same traffic at ~2 req/s per conn = 20M req/s; at 50-100K req/s per Envoy node that is ~200 L7 machines. L4 is ~10x per-box throughput of L7 because it only hashes headers.",
    "**TLS handshake budget**: 1M new conns/s x 0.3ms ECDHE = 300 CPU-cores of continuous crypto. Session resumption (tickets/0-RTT) removes 80-90%. Size L7 by request rate + handshake rate, never by idle concurrent connections.",
    "**Power of two choices**: sample 2 random backends, pick the less loaded. O(1), no global state, max load drops to O(log log n). Fixes the least-connections herd problem across independent LB instances. EWMA latency scoring routes around slow-but-alive backends before health checks fire.",
    "**Maglev statelessness**: identical lookup table computed independently on every L4 instance (prime-sized array, permutation slot filling). LB failure + ECMP rehash lands flows on a peer that computes the same backend -- connections survive with zero state sync. Local conn-tracking table pins existing flows across backend-set changes.",
    "**DSR trade-offs**: response bypasses LB (90-99% egress saved) but needs L2 adjacency or IP-in-IP/GUE encap (MTU risk), VIP-on-loopback backend config, and forfeits TLS termination, retries, and response-based passive health signals. Standard for the L4 tier; L7 stays full-proxy.",
  ],
  cheatSheet: [
    "**L4 LB**: Operates on TCP/UDP packets. Uses NAT or DSR. 10M+ connections. Sub-ms latency. Blind to HTTP content.",
    "**L7 LB**: Parses HTTP. Routes by URL, header, cookie. SSL termination. Content caching. Request-level decisions. 1-5ms overhead.",
    "**Round Robin**: Server[i++ % N]. Equal distribution. Ignores server capacity and current load.",
    "**Weighted RR (NGINX smooth)**: currentWeight += weight; select max; selectedWeight -= totalWeight. Produces smooth interleaving.",
    "**Least Connections**: Select server with min(activeConnections). Weighted variant: min(connections / weight).",
    "**Consistent Hashing**: Ring of 2^64. Key goes to first server clockwise. 150 virtual nodes per server. 1/N keys move on changes.",
    "**Health Check formula**: Unhealthy after C consecutive failures (typically C=3). Healthy after S consecutive successes (typically S=5). Check interval: 5-10s. Timeout: 2-3s.",
    "**SSL offloading savings**: RSA-2048 handshake approximately equals 1ms CPU. 10K new TLS connections/sec equals 10 CPU-seconds/sec of crypto work offloaded from backends.",
    "**DSR benefit**: Response bypasses LB. Since response size is 10-100x request size, LB bandwidth drops by 90-99%.",
    "**GSLB failover time**: DNS-based is TTL-dependent, typically 30-60s. Anycast BGP-based is 1-5 seconds. Choose based on RTO requirements.",
    "**Capacity rule of thumb**: L4 box ~10M pps (kernel bypass); L7 node ~50-100K req/s with TLS. 10M conns + 1M new conn/s => ~10 L4 boxes vs ~200 L7 nodes. Conn state: 128-256 B/entry => 1.3-2.6 GB per 10M conns.",
    "**TLS handshake cost**: ECDHE ~0.3ms CPU; 1M new conn/s = 300 cores. Resumption cuts 80-90%.",
    "**Power of two choices**: pick 2 random backends, route to less loaded. Max load O(log log n). Default in Envoy least-request.",
    "**Maglev table**: prime-sized array, each backend fills slots by deterministic permutation. Forward = hash(5-tuple) mod table. All instances compute identical tables => LB failure needs no state sync.",
    "**Drain sequence for deploys**: fail readiness (not liveness) -> lameduck 30-120s -> GOAWAY for h2/gRPC -> force-close stragglers. Re-entry uses slow-start weight ramp.",
  ],
  glossary: [
    {
      term: "Layer 4 Load Balancing",
      definition:
        "Load balancing at the transport layer (TCP/UDP) based on IP addresses and port numbers without inspecting application-layer content. Extremely fast but unable to make content-aware routing decisions.",
    },
    {
      term: "Layer 7 Load Balancing",
      definition:
        "Load balancing at the application layer (HTTP/HTTPS) that can inspect URLs, headers, cookies, and request bodies to make intelligent routing decisions. Enables content-based routing, SSL termination, and request manipulation.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A hash-based distribution technique that maps both servers and keys onto a circular ring. When servers are added or removed, only K/N keys are redistributed (where K is total keys and N is servers), minimizing cache invalidation.",
    },
    {
      term: "Virtual IP (VIP)",
      definition:
        "An IP address shared between multiple load balancer instances for high availability. The active LB responds to the VIP; on failure, the standby claims it via VRRP or gratuitous ARP.",
    },
    {
      term: "SSL Termination",
      definition:
        "Decrypting TLS traffic at the load balancer and forwarding plain HTTP to backend servers. Offloads CPU-intensive cryptographic operations from backends.",
    },
    {
      term: "Connection Draining",
      definition:
        "A graceful server removal technique that stops sending new connections to a server while allowing existing connections to complete within a configurable timeout period.",
    },
    {
      term: "GSLB (Global Server Load Balancing)",
      definition:
        "Load balancing across multiple data centers, typically via DNS or Anycast BGP routing. Directs users to the nearest healthy data center based on geography, latency, and health.",
    },
  ],
  animations: [
    {
      title: "Health checking and failover",
      steps: [
        {
          label: "Steady state",
          detail: "Requests distributed across four healthy backends.",
        },
        {
          label: "Backend 3 degrades",
          detail: "It starts returning 500s.",
        },
        {
          label: "Health check fails",
          detail: "After N consecutive failures it is marked unhealthy.",
        },
        {
          label: "Removed",
          detail: "Traffic redistributes across the remaining three.",
        },
        {
          label: "Recovery probe",
          detail: "Health checks continue; after M consecutive successes it returns to the pool.",
        },
        {
          label: "Why hysteresis",
          detail: "Removing on one failure and restoring on one success makes a flapping backend oscillate, which is worse than either state.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Feature",
      "L4 Round Robin",
      "L7 Weighted Least Conn",
      "Consistent Hashing",
      "IP Hash",
    ],
    rows: [
      [
        "**Routing granularity**",
        "Per connection",
        "Per request",
        "Per key/request",
        "Per client IP",
      ],
      [
        "**Content awareness**",
        "None",
        "Full HTTP inspection",
        "Key-based only",
        "IP-based only",
      ],
      [
        "**Session affinity**",
        "None",
        "Cookie-based",
        "Natural by key",
        "Natural by IP",
      ],
      [
        "**Server heterogeneity**",
        "Poor - assumes equal",
        "Excellent - weight + load",
        "Good with virtual nodes",
        "Poor - hash-based",
      ],
      [
        "**Cache locality**",
        "None",
        "None",
        "Excellent - stable mapping",
        "Good - stable by IP",
      ],
      [
        "**Disruption on scale**",
        "Full redistribution",
        "Minimal",
        "1/N keys move",
        "Full redistribution",
      ],
      [
        "**Throughput**",
        "10M+ connections/sec",
        "100K-1M requests/sec",
        "Depends on tier (L4/L7)",
        "10M+ connections/sec",
      ],
      [
        "**Best use case**",
        "Stateless, equal servers",
        "Heterogeneous API servers",
        "Cache layers, CDNs",
        "Simple sticky routing",
      ],
    ],
  },
  followUps: [
    "How do service meshes (Istio, Linkerd) implement load balancing differently from traditional LBs?",
    "What is the relationship between load balancing and auto-scaling? How should they interact?",
    "How does HTTP/3 (QUIC) change load balancing since it runs over UDP instead of TCP?",
    "What are the challenges of load balancing gRPC traffic compared to REST?",
    "How do you implement blue-green and canary deployments using load balancer traffic splitting?",
    "What is the difference between a reverse proxy and a load balancer?",
    "Why does the power of two choices algorithm beat both random assignment and global least-connections in multi-LB fleets?",
    "How would you load balance long-lived gRPC streams where a single connection can carry wildly uneven load?",
    "How do eBPF/XDP-based load balancers like Katran differ from DPDK-based designs like Maglev?",
    "How should connection draining interact with autoscaling scale-in events to avoid dropped requests?",
  ],
  resources: [
    {
      label: "The NGINX Smooth Weighted Round-Robin Balancing Algorithm",
      kind: "article",
      note: "Detailed explanation of the algorithm used by NGINX for weighted round-robin with smooth interleaving.",
    },
    {
      label: "Maglev: A Fast and Reliable Software Network Load Balancer (Google)",
      kind: "paper",
      note: "Google's paper on their L4 load balancer handling millions of connections with consistent hashing and DPDK.",
    },
    {
      label: "Designing Data-Intensive Applications - Ch. 6: Partitioning", url: "https://dataintensive.net/",
      kind: "book",
      note: "Martin Kleppmann covers consistent hashing and request routing in the context of distributed data systems.",
    },
    {
      label: "HAProxy Configuration Manual",
      kind: "docs",
      note: "Comprehensive reference for one of the most widely used open-source load balancers, covering L4/L7, health checks, and SSL.",
    },
    {
      label: "Introduction to Modern Network Load Balancing and Proxying (Envoy Blog)",
      kind: "article",
      note: "Matt Klein's definitive overview of load balancing concepts, L4 vs L7, and the evolution of modern proxies.",
    },
  ],
};
