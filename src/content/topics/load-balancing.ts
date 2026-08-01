import type { TopicContent } from "../types";

export const loadBalancing: TopicContent = {
  quickSummary: [
    "Load balancing distributes incoming traffic across multiple backend servers to improve throughput, reduce latency, and provide fault tolerance.",
    "L4 (transport layer) load balancers route based on IP and port with minimal overhead; L7 (application layer) balancers inspect HTTP headers, paths, and content for smarter routing.",
    "Common algorithms include round-robin, least connections, weighted variants, and consistent hashing, each suited to different workload patterns.",
    "Health checks (active probes and passive monitoring) automatically remove unhealthy backends from the pool and restore them when they recover.",
  ],
  detailed: [
    `## L4 vs L7 Load Balancing

**Layer 4 (Transport)** load balancers operate at the TCP/UDP level:

- Route based on source/destination IP and port.
- Do not inspect packet contents — simply forward TCP connections.
- Very fast and low overhead (hardware or kernel-level implementations).
- Cannot make routing decisions based on HTTP path, headers, or cookies.
- Examples: AWS NLB, HAProxy (TCP mode), Linux IPVS.

**Layer 7 (Application)** load balancers operate at the HTTP/HTTPS level:

- Inspect HTTP method, path, headers, cookies, and even request body.
- Enable content-based routing: send /api/* to API servers, /static/* to CDN origin.
- Support SSL/TLS termination, header manipulation, and request rewriting.
- Higher overhead due to protocol parsing but far more flexible.
- Examples: AWS ALB, NGINX, HAProxy (HTTP mode), Envoy, Traefik.

**When to use which**: L4 for non-HTTP protocols (databases, gRPC without path routing, raw TCP), high-throughput passthrough, and when latency overhead must be absolute minimum. L7 for HTTP-based services where routing, SSL termination, and request inspection are needed.`,

    `## Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| Round-Robin | Rotates through backends sequentially | Homogeneous backends, uniform request cost |
| Weighted Round-Robin | Rotates with weights proportional to capacity | Heterogeneous backends (different instance sizes) |
| Least Connections | Sends to the backend with fewest active connections | Varying request durations |
| Weighted Least Connections | Least connections adjusted by capacity weight | Heterogeneous backends with varying request durations |
| IP Hash | Hashes client IP to select backend | Basic session affinity without cookies |
| Consistent Hash | Maps requests to backends via a hash ring | Caching layers where locality matters |
| Random Two Choices | Picks two random backends, sends to the one with fewer connections | Large pools where least-connections tracking is expensive |

**Round-robin** is the default choice for most stateless services. **Least connections** is better when some requests take much longer than others (e.g., report generation alongside simple API calls). **Consistent hashing** is essential for cache layers where request locality dramatically affects hit rates.`,

    `## Health Checks

Health checks ensure traffic is only sent to backends that can serve requests:

**Active health checks** (the load balancer probes backends):
- HTTP GET to a health endpoint (e.g., \`/health\`).
- Check interval (e.g., every 5 seconds), threshold (e.g., 3 consecutive failures to mark unhealthy).
- Deep checks can verify downstream dependencies (database, cache), but be careful: if the database is down, marking all app servers unhealthy may be worse than serving degraded responses.

**Passive health checks** (the load balancer monitors real traffic):
- Track error rates and response times for real requests.
- Mark a backend unhealthy if error rate exceeds a threshold.
- Faster detection of partial failures that health endpoint checks might miss.

**Graceful shutdown**: backends should stop accepting new connections, finish in-flight requests (drain), then exit. Load balancers support connection draining with configurable timeout.

Best practice: use both active and passive checks. The health endpoint should report readiness (can serve traffic), not just liveness (process is running).`,

    `## Advanced Patterns

**SSL/TLS termination**: the load balancer decrypts HTTPS and forwards plain HTTP to backends, offloading CPU-intensive cryptography. For end-to-end encryption, use SSL re-encryption (LB decrypts, re-encrypts to backend).

**Global server load balancing (GSLB)**: DNS-based routing that directs users to the nearest regional cluster. Uses health checks and latency measurements. Examples: AWS Route 53, Cloudflare Load Balancing.

**Service mesh**: sidecar proxies (Envoy in Istio/Linkerd) perform L7 load balancing between microservices within a cluster, adding mTLS, retries, and observability without application changes.

**Rate limiting**: L7 load balancers can enforce per-client request limits, protecting backends from abuse. Often combined with API gateway functionality.

**Blue-green and canary deployments**: L7 routing enables sending a percentage of traffic to a new version, enabling gradual rollouts with instant rollback by shifting routing rules.`,

    `## Operational Considerations

- **Single point of failure**: the load balancer itself must be highly available. Use active-passive pairs, cloud-managed LBs (already HA), or anycast DNS.
- **Connection limits**: each backend has a maximum connection count. Configure the LB's max connections per backend to prevent overwhelming servers.
- **Timeouts**: configure appropriate idle connection, request, and response timeouts. Too short causes premature termination; too long holds resources.
- **Logging and metrics**: LB access logs capture request latency, backend selection, and error codes. These are critical for debugging and capacity planning.
- **Cross-zone balancing**: in cloud environments, ensure traffic is distributed evenly across availability zones to avoid hotspots. AWS ALB does this by default; NLB requires explicit enablement.`,
  ],
  interviewQA: [
    {
      q: "When would you choose an L4 load balancer over an L7 load balancer?",
      a: "Choose L4 when you need minimal latency overhead (kernel-level packet forwarding), when the protocol is not HTTP (databases, raw TCP, UDP), when you do not need content-based routing, or when throughput is extremely high and you cannot afford per-request inspection. L4 is also appropriate for non-HTTP gRPC where path-based routing is unnecessary. For most HTTP-based microservices, L7 is preferred because it enables path-based routing, SSL termination, header inspection, and features like canary deployments.",
    },
    {
      q: "Why is consistent hashing important for caching layers?",
      a: "Consistent hashing ensures that the same key always maps to the same backend, maximizing cache hit rates. When a backend is added or removed, only keys mapped to the changed node are redistributed — approximately 1/n of total keys (where n is the number of nodes). With simple hash-mod-n, adding or removing a node remaps almost all keys, causing a cache miss storm. Consistent hashing with virtual nodes further improves uniformity by spreading each physical node across multiple points on the hash ring.",
    },
    {
      q: "How should a health check endpoint be designed?",
      a: "The health endpoint should check readiness (can the service actually handle requests), not just liveness (is the process running). It should verify critical dependencies like database connectivity and cache availability, but with timeouts to avoid blocking. However, be careful with deep checks: if a shared dependency like the database goes down, marking all instances unhealthy removes all backends. Consider returning degraded status instead. The endpoint should respond quickly (under 200ms) and not consume significant resources. Use separate liveness and readiness probes in Kubernetes.",
    },
  ],
  mcqs: [
    {
      q: "Which load balancing algorithm is best suited for a caching proxy layer?",
      options: [
        "Round-robin",
        "Least connections",
        "Consistent hashing",
        "Random",
      ],
      answerIndex: 2,
      explanation:
        "Consistent hashing ensures the same key always maps to the same backend, maximizing cache hit rates. Adding or removing nodes only redistributes approximately 1/n of keys.",
    },
    {
      q: "What is the main advantage of L7 over L4 load balancing?",
      options: [
        "Lower latency overhead",
        "Ability to route based on HTTP path, headers, and content",
        "Support for UDP protocols",
        "Simpler configuration",
      ],
      answerIndex: 1,
      explanation:
        "L7 load balancers parse HTTP requests and can make routing decisions based on path, headers, cookies, and content, enabling content-based routing, canary deployments, and SSL termination.",
    },
    {
      q: "What is connection draining?",
      options: [
        "Removing all connections when a backend is overloaded",
        "Allowing in-flight requests to complete before removing a backend from the pool",
        "Limiting the maximum number of connections per backend",
        "Closing idle connections after a timeout",
      ],
      answerIndex: 1,
      explanation:
        "Connection draining allows a backend being removed (for maintenance or deployment) to finish serving its in-flight requests before being taken out of the pool, preventing abrupt disconnections.",
    },
    {
      q: "When should passive health checks be preferred over active health checks?",
      options: [
        "When you want to detect partial failures that health endpoints might miss",
        "When backend servers do not support HTTP",
        "When you want to reduce network traffic",
        "When using L4 load balancing only",
      ],
      answerIndex: 0,
      explanation:
        "Passive health checks monitor real traffic responses and can detect issues like elevated error rates or slow responses for specific request types that a simple health endpoint ping might not reveal.",
    },
  ],
  flashcards: [
    {
      front: "What is L4 vs L7 load balancing?",
      back: "L4 operates at TCP/UDP layer (IP + port routing, minimal overhead). L7 operates at HTTP layer (path/header/cookie routing, SSL termination, higher overhead but more flexible).",
    },
    {
      front: "When is least-connections better than round-robin?",
      back: "When request durations vary significantly. Least-connections avoids overloading backends that are processing slow requests, while round-robin assumes uniform request cost.",
    },
    {
      front: "What is consistent hashing and why use it?",
      back: "A hashing scheme that maps keys to a ring of nodes. When nodes are added/removed, only ~1/n keys are remapped. Essential for caching layers to maintain hit rates during scaling.",
    },
    {
      front: "What is the difference between liveness and readiness health checks?",
      back: "Liveness checks if the process is running (restart if not). Readiness checks if the service can handle traffic (remove from pool if not). In Kubernetes, these are separate probes.",
    },
    {
      front: "What is GSLB?",
      back: "Global Server Load Balancing: DNS-based routing that directs users to the nearest regional cluster using health checks and latency measurements. Examples: Route 53, Cloudflare LB.",
    },
    {
      front: "What is connection draining?",
      back: "Allowing in-flight requests to complete before removing a backend from the pool. The LB stops sending new requests but waits for existing ones to finish, up to a configurable timeout.",
    },
    {
      front: "What is the Power of Two Choices algorithm?",
      back: "Pick two random backends and send the request to the one with fewer connections. Achieves near-optimal distribution with O(1) overhead, useful for very large backend pools.",
    },
  ],
  deepDive: [
    `**Load balancing** is one of the most critical components in any distributed system, acting as the *single entry point* that governs how millions of requests reach their destination servers. At its core, a load balancer maintains a **pool of backend servers** and applies a *selection algorithm* to decide which server handles each incoming request. Modern load balancers like **NGINX**, **HAProxy**, and **Envoy** go far beyond simple traffic distribution — they perform \`SSL/TLS termination\`, inject and inspect **HTTP headers**, enforce \`rate limits\`, and even transform requests before forwarding them. The distinction between *stateless* and *stateful* load balancing is fundamental: stateless balancers treat each request independently (ideal for **REST APIs**), while stateful balancers use \`sticky sessions\` or \`session affinity\` to route a client's requests to the same backend (necessary for applications storing **in-memory session data**). Understanding this distinction is key to designing systems that are both *scalable* and *reliable*.`,

    `The **health checking subsystem** within a load balancer deserves deep attention because it directly determines *availability*. An **active health check** sends periodic probes — typically an \`HTTP GET /health\` request — to each backend and tracks consecutive successes and failures against configurable thresholds (e.g., \`3 failures to mark unhealthy\`, \`2 successes to restore\`). A well-designed health endpoint returns **structured JSON** indicating the status of critical dependencies: \`{"status": "healthy", "db": "ok", "cache": "ok"}\`. **Passive health checks** complement this by monitoring *real traffic*: if a backend starts returning \`502\` or \`503\` errors above a threshold, the balancer removes it from rotation *without waiting* for the next active probe. The combination of both strategies — sometimes called **hybrid health checking** — provides the fastest detection of failures while minimizing false positives. In *Kubernetes* environments, this maps to the distinction between \`livenessProbe\` (is the process running?) and \`readinessProbe\` (can it serve traffic?), which the **kube-proxy** or *service mesh* uses to update endpoint lists.`,

    `**Consistent hashing** deserves special attention as it solves one of the hardest problems in distributed load balancing: maintaining *request locality* while allowing the backend pool to scale dynamically. Traditional \`hash(key) % N\` breaks catastrophically when \`N\` changes — nearly all keys remap, causing a **cache stampede**. Consistent hashing arranges backends on a *virtual ring* (typically using **MD5** or \`xxHash\` of the server identifier) and maps each request key to the *next clockwise node*. When a node is added or removed, only \`~1/N\` of keys are redistributed. To address *non-uniform distribution*, each physical node is assigned multiple **virtual nodes** (typically \`100-200\`) spread across the ring. This technique is used extensively in **CDN routing**, *distributed caches* like **Memcached** and **Redis Cluster**, and *service meshes* like **Envoy**. The \`ketama\` algorithm, originally developed at *Last.fm*, remains one of the most widely deployed consistent hashing implementations and is supported natively by \`NGINX\` and \`HAProxy\`.`,
  ],

  code: [
    {
      language: "cpp",
      caption: "Simple Round-Robin Load Balancer in C++",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <mutex>
#include <atomic>

// A minimal **round-robin** load balancer implementation.
// Each call to \`getNextServer()\` returns the *next* backend in sequence.

class RoundRobinBalancer {
private:
    std::vector<std::string> servers_;
    std::atomic<uint64_t> counter_{0};   // thread-safe rotation index
    mutable std::mutex mu_;              // guards server list mutations
    std::vector<bool> healthy_;          // per-server health status

public:
    // Initialize with a list of backend server addresses
    explicit RoundRobinBalancer(const std::vector<std::string>& servers)
        : servers_(servers), healthy_(servers.size(), true) {}

    // Add a new backend to the pool
    void addServer(const std::string& server) {
        std::lock_guard<std::mutex> lock(mu_);
        servers_.push_back(server);
        healthy_.push_back(true);
    }

    // Mark a server as **unhealthy** (skip during selection)
    void markUnhealthy(size_t index) {
        std::lock_guard<std::mutex> lock(mu_);
        if (index < healthy_.size()) healthy_[index] = false;
    }

    // Mark a server as **healthy** again
    void markHealthy(size_t index) {
        std::lock_guard<std::mutex> lock(mu_);
        if (index < healthy_.size()) healthy_[index] = true;
    }

    // Select the *next healthy server* using round-robin
    std::string getNextServer() {
        std::lock_guard<std::mutex> lock(mu_);
        if (servers_.empty()) return "";

        size_t n = servers_.size();
        // Try up to \`n\` times to find a healthy server
        for (size_t i = 0; i < n; ++i) {
            size_t idx = counter_.fetch_add(1) % n;
            if (healthy_[idx]) {
                return servers_[idx];
            }
        }
        return "";  // all servers unhealthy
    }
};

int main() {
    RoundRobinBalancer lb({
        "backend-1:8080",
        "backend-2:8080",
        "backend-3:8080"
    });

    // Simulate 6 requests — observe the *sequential rotation*
    for (int i = 0; i < 6; ++i) {
        std::cout << "Request " << i << " -> " << lb.getNextServer() << "\\n";
    }

    // Mark backend-2 as unhealthy; it will be **skipped**
    lb.markUnhealthy(1);
    std::cout << "\\n--- backend-2 marked unhealthy ---\\n";
    for (int i = 0; i < 4; ++i) {
        std::cout << "Request -> " << lb.getNextServer() << "\\n";
    }
    return 0;
}`,
    },
    {
      language: "nginx",
      caption: "NGINX L7 Load Balancer Configuration",
      source: `# **NGINX** upstream load balancing configuration
# Demonstrates *weighted round-robin*, health checks, and L7 routing

# Define the backend server pool
upstream api_backends {
    # **Weighted round-robin**: backend-1 gets 3x the traffic
    server backend-1.internal:8080 weight=3;
    server backend-2.internal:8080 weight=1;
    server backend-3.internal:8080 weight=1;

    # \`max_fails\` and \`fail_timeout\` configure **passive health checks**
    # Mark unhealthy after 3 failures within a 30-second window
    server backend-4.internal:8080 max_fails=3 fail_timeout=30s;

    # A **backup** server — only receives traffic when all primaries are down
    server backend-5.internal:8080 backup;

    # Enable \`least_conn\` algorithm instead of default round-robin
    # least_conn;

    # Enable **consistent hashing** based on client IP
    # hash $remote_addr consistent;

    # Connection pool: keep *up to 32* idle upstream connections alive
    keepalive 32;
}

# Separate upstream for static assets
upstream static_backends {
    server cdn-origin-1.internal:8080;
    server cdn-origin-2.internal:8080;
    least_conn;   # Use *least connections* for static content
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # **SSL/TLS termination** at the load balancer
    ssl_certificate     /etc/nginx/certs/api.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/api.example.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # L7 **content-based routing**: /api/* goes to API backends
    location /api/ {
        proxy_pass http://api_backends;

        # Forward *client information* to backends via headers
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # **Timeout** configuration
        proxy_connect_timeout 5s;
        proxy_read_timeout    60s;
        proxy_send_timeout    30s;

        # **Retry** on upstream failure — try next server
        proxy_next_upstream error timeout http_502 http_503;
        proxy_next_upstream_tries 2;
    }

    # Static assets routed to a *separate pool*
    location /static/ {
        proxy_pass http://static_backends;
        proxy_cache_valid 200 1h;    # Cache 200 responses for 1 hour
        add_header X-Cache-Status $upstream_cache_status;
    }

    # **Health check** endpoint (for external monitoring)
    location /health {
        access_log off;
        return 200 '{"status":"ok"}';
        add_header Content-Type application/json;
    }

    # **Rate limiting**: 10 requests/second per client IP
    location /api/expensive/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backends;
    }
}

# Rate limit zone definition
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;`,
    },
    {
      language: "cpp",
      caption: "Consistent Hash Ring Implementation in C++",
      source: `#include <iostream>
#include <map>
#include <string>
#include <functional>

// **Consistent Hash Ring** — maps keys to servers with minimal
// redistribution when the server pool changes.

class ConsistentHashRing {
private:
    // \`ring_\` maps hash values to server names (sorted by hash)
    std::map<size_t, std::string> ring_;
    int virtualNodes_;       // number of *virtual nodes* per server
    std::hash<std::string> hasher_;

public:
    // More **virtual nodes** = better distribution (typically 100-200)
    explicit ConsistentHashRing(int virtualNodes = 150)
        : virtualNodes_(virtualNodes) {}

    // Add a server with \`virtualNodes_\` points on the ring
    void addServer(const std::string& server) {
        for (int i = 0; i < virtualNodes_; ++i) {
            std::string virtualKey = server + "#" + std::to_string(i);
            size_t hash = hasher_(virtualKey);
            ring_[hash] = server;
        }
    }

    // Remove a server and all its *virtual node* entries
    void removeServer(const std::string& server) {
        for (int i = 0; i < virtualNodes_; ++i) {
            std::string virtualKey = server + "#" + std::to_string(i);
            size_t hash = hasher_(virtualKey);
            ring_.erase(hash);
        }
    }

    // Find the server responsible for a given **key**
    // Walks clockwise on the ring to the next node
    std::string getServer(const std::string& key) const {
        if (ring_.empty()) return "";
        size_t hash = hasher_(key);
        // \`upper_bound\` finds the first node *clockwise* from the key's hash
        auto it = ring_.upper_bound(hash);
        if (it == ring_.end()) {
            it = ring_.begin();  // wrap around the ring
        }
        return it->second;
    }
};

int main() {
    ConsistentHashRing ring(150);
    ring.addServer("cache-A");
    ring.addServer("cache-B");
    ring.addServer("cache-C");

    // Map several keys — same key *always* hits the same server
    for (const auto& key : {"user:1001", "user:1002", "session:xyz", "order:500"}) {
        std::cout << key << " -> " << ring.getServer(key) << "\\n";
    }

    // Remove cache-B: only its keys **redistribute**
    std::cout << "\\n--- removing cache-B ---\\n";
    ring.removeServer("cache-B");
    for (const auto& key : {"user:1001", "user:1002", "session:xyz", "order:500"}) {
        std::cout << key << " -> " << ring.getServer(key) << "\\n";
    }
    return 0;
}`,
    },
  ],

  diagrams: [
    {
      title: "L7 Load Balancer Architecture",
      kind: "architecture",
      caption: "Request flow through an L7 load balancer with SSL termination, health checks, and content-based routing to backend pools.",
      mermaid: `graph TD
    Client["Client Browser or App"]
    DNS["DNS GSLB"]
    LB["L7 Load Balancer - SSL Termination and Rate Limiting"]
    HC["Health Checker - Active and Passive"]
    subgraph API_Pool["API Backend Pool"]
        API1["api-server-1:8080"]
        API2["api-server-2:8080"]
        API3["api-server-3:8080"]
    end
    subgraph Static_Pool["Static Backend Pool"]
        S1["cdn-origin-1:8080"]
        S2["cdn-origin-2:8080"]
    end
    Client -->|HTTPS request| DNS
    DNS -->|Nearest region IP| LB
    LB -->|/api routes| API_Pool
    LB -->|/static routes| Static_Pool
    HC -.->|GET /health every 5s| API1
    HC -.->|GET /health every 5s| API2
    HC -.->|GET /health every 5s| API3
    LB --- HC`,
    },
    {
      title: "Load Balancing Algorithm Selection",
      kind: "flow",
      caption: "Decision flow for choosing the right load balancing algorithm based on workload characteristics.",
      mermaid: `flowchart TD
    A["Choose Load Balancing Algorithm"] --> B{"Are backends\nhomogeneous?"}
    B -->|No| C["Use Weighted Round-Robin\nor Weighted Least Connections"]
    B -->|Yes| D{"Do requests have\nvariable duration?"}
    D -->|Yes| E["Use Least Connections\nor Least Response Time"]
    D -->|No| F{"Is session\nstickiness needed?"}
    F -->|Yes| G["Use IP Hash\nor Cookie-Based Affinity"]
    F -->|No| H{"Is it a\ncache layer?"}
    H -->|Yes| I["Use Consistent Hashing\nto minimise cache misses"]
    H -->|No| J["Use Round-Robin\nSimplest and fair"]`,
    },
    {
      title: "Backend Health Check State Machine",
      kind: "state",
      caption: "States and transitions for a backend server based on active probe results and graceful shutdown signals.",
      mermaid: `stateDiagram-v2
    [*] --> Healthy
    Healthy --> Suspect: 1 failed probe
    Suspect --> Healthy: successful probe
    Suspect --> Unhealthy: threshold failures reached
    Unhealthy --> Recovery: 1 successful probe
    Recovery --> Healthy: threshold successes reached
    Recovery --> Unhealthy: probe fails again
    Unhealthy --> Draining: graceful shutdown signal
    Healthy --> Draining: graceful shutdown signal
    Draining --> Removed: all connections closed
    Removed --> [*]`,
    },
    {
      title: "Consistent Hashing Node Distribution",
      kind: "network",
      caption: "How keys are mapped to virtual nodes on a hash ring and resolved to physical servers, with virtual nodes ensuring even distribution.",
      mermaid: `graph LR
    K1["Key user:1001"] -->|hash to ring| VN_A1["Virtual Node A1"]
    K2["Key session:xyz"] -->|hash to ring| VN_C1["Virtual Node C1"]
    K3["Key order:500"] -->|hash to ring| VN_B2["Virtual Node B2"]
    VN_A1 --> SA["Server A"]
    VN_A2["Virtual Node A2"] --> SA
    VN_B1["Virtual Node B1"] --> SB["Server B"]
    VN_B2 --> SB
    VN_C1 --> SC["Server C"]
    VN_C2["Virtual Node C2"] --> SC`,
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "L4 (Transport Layer)",
      "L7 (Application Layer)",
    ],
    rows: [
      [
        "**OSI Layer**",
        "Layer 4 — *TCP/UDP*",
        "Layer 7 — *HTTP/HTTPS*",
      ],
      [
        "**Routing Criteria**",
        "Source/destination `IP` and `port`",
        "URL path, headers, cookies, `query params`",
      ],
      [
        "**SSL Termination**",
        "No — passes encrypted traffic *as-is* (passthrough)",
        "Yes — decrypts at LB, forwards *plain HTTP* to backends",
      ],
      [
        "**Performance**",
        "*Very high* throughput, minimal latency overhead",
        "Higher overhead due to **protocol parsing**",
      ],
      [
        "**Content Routing**",
        "Not possible — cannot inspect *payload*",
        "Full support: path-based, header-based, **canary splits**",
      ],
      [
        "**Health Checks**",
        "TCP connect or `ping` only",
        "HTTP endpoint checks with **status code** validation",
      ],
      [
        "**Session Affinity**",
        "IP hash only (*source IP* based)",
        "Cookie-based, header-based, or `URL parameter` based",
      ],
      [
        "**Protocol Support**",
        "*Any* TCP/UDP protocol (databases, gRPC, DNS)",
        "HTTP, HTTPS, **WebSocket**, gRPC (with HTTP/2)",
      ],
      [
        "**Use Cases**",
        "Database LB, *high-throughput* passthrough, non-HTTP protocols",
        "Web apps, **API gateways**, microservice routing, SSL offload",
      ],
      [
        "**Examples**",
        "AWS *NLB*, HAProxy (TCP), Linux `IPVS`",
        "AWS *ALB*, **NGINX**, HAProxy (HTTP), `Envoy`, Traefik",
      ],
    ],
  },

  exercises: [
    `**Design a Weighted Round-Robin Balancer**: Extend the C++ round-robin implementation to support *weights*. Each server should have a configurable \`weight\` (e.g., server A with weight 3 should receive 3x the requests of server B with weight 1). Implement using either a **pre-computed schedule** (flatten weights into a rotation list) or a **current-weight tracking** approach (as used by NGINX). Test with heterogeneous weights and verify the distribution matches the configured ratios.`,

    `**Implement Passive Health Checking**: Build a wrapper around the load balancer that tracks the *last N responses* from each backend. If a backend's **error rate** (HTTP 5xx responses) exceeds a configurable threshold (e.g., \`50%\` over the last \`10 requests\`), automatically mark it as unhealthy. Implement a *recovery mechanism* that periodically sends a single probe request to unhealthy backends and restores them after \`3 consecutive successes\`. Consider thread safety for concurrent request tracking.`,

    `**NGINX Configuration Lab**: Set up an NGINX load balancer configuration that routes \`/api/v1/*\` to one upstream pool using *least connections*, \`/api/v2/*\` to a different pool using **consistent hashing** on the \`X-User-ID\` header, and \`/static/*\` to a third pool with **caching** enabled. Configure \`proxy_next_upstream\` to retry failed requests on the next backend. Add rate limiting of \`100 req/s\` per client IP on the \`/api/\` paths. Test with \`curl\` and verify correct routing behavior.`,

    `**Simulate a Cache Stampede**: Write a program that demonstrates the difference between \`hash(key) % N\` and **consistent hashing** when a node is added or removed. Create \`10,000\` keys distributed across \`5\` nodes. Remove one node and measure what percentage of keys are *remapped* with each approach. With modular hashing, approximately \`80%\` of keys should remap; with consistent hashing, approximately \`20%\`. Visualize the redistribution by printing a histogram of keys per server before and after the change.`,

    `**Blue-Green Deployment Simulation**: Using the NGINX configuration as a base, implement a **blue-green deployment** strategy. Create two upstream pools (\`blue\` and \`green\`). Write a script that gradually shifts traffic from blue to green in \`10%\` increments using NGINX's \`split_clients\` directive or \`weight\` adjustments. Add a *rollback* mechanism that immediately shifts all traffic back to blue if the green pool's error rate exceeds \`5%\`. Log the traffic split at each step and verify with request counting.`,
  ],

  cheatSheet: [
    `**L4 vs L7 Quick Rule**: Use *L4* for non-HTTP protocols and raw throughput; use **L7** for HTTP routing, \`SSL termination\`, header inspection, and content-based decisions.`,

    `**Algorithm Selection**: \`Round-robin\` for homogeneous stateless services → \`Least connections\` when request durations vary → **Consistent hashing** for cache layers → \`Weighted\` variants when backend capacities differ.`,

    `**Health Check Formula**: Configure \`interval=5s\`, \`unhealthy_threshold=3\`, \`healthy_threshold=2\`. Time to detect failure: **interval x unhealthy_threshold** = 15 seconds. Always combine *active* + *passive* checks.`,

    `**Sticky Sessions Warning**: Avoid \`cookie-based\` session affinity unless absolutely necessary — it *breaks horizontal scaling* and creates **hotspots**. Prefer externalizing session state to *Redis* or a database.`,

    `**Connection Draining Timeout**: Set drain timeout to your **longest expected request duration** plus a buffer (e.g., if max request time is \`60s\`, set drain to \`90s\`). Too short = dropped requests; too long = slow deployments.`,

    `**NGINX Key Directives**: \`upstream { server ... weight=N; }\` for pools, \`proxy_next_upstream error timeout http_502\` for retries, \`keepalive 32\` for connection reuse, \`limit_req_zone\` for rate limiting, \`hash $key consistent\` for consistent hashing.`,
  ],

  revisionNotes: [
    `**Layer distinction is fundamental**: L4 operates on *TCP/UDP tuples* (IP + port) with near-zero overhead; L7 parses **HTTP semantics** (path, headers, cookies) enabling smart routing but at higher CPU cost. Know when each is appropriate — this is the most common interview question on load balancing.`,

    `**Consistent hashing solves the N-change problem**: Standard \`hash % N\` remaps *almost all keys* when N changes. Consistent hashing limits redistribution to \`~1/N\` keys. **Virtual nodes** (100-200 per server) fix the *non-uniform distribution* problem. This concept applies beyond load balancing to distributed caches, sharding, and partition assignment.`,

    `**Health checks have two dimensions**: *Active* checks (LB probes backends) catch total failures; *passive* checks (monitor real traffic) catch partial degradation. A robust system uses **both**. Remember the Kubernetes mapping: \`livenessProbe\` = restart the pod, \`readinessProbe\` = remove from service endpoints.`,

    `**The load balancer itself must be HA**: A single LB is a **single point of failure**. Solutions include *active-passive failover* (VRRP/keepalived), cloud-managed LBs (inherently HA), and **anycast** DNS routing. In production, always plan for LB redundancy.`,

    `**Operational settings matter**: Key tuning parameters are \`connection limits\` per backend (prevent overwhelming), \`timeouts\` (connect, read, idle — too short causes drops, too long wastes resources), \`retry policy\` (which errors trigger retry, max attempts), and \`drain timeout\` (must exceed longest request duration). These settings are where *theory meets production reliability*.`,
  ],

  glossary: [
    {
      term: "L4 Load Balancer",
      definition:
        "A load balancer operating at the transport layer (TCP/UDP), routing based on IP addresses and ports without inspecting application-layer content.",
    },
    {
      term: "L7 Load Balancer",
      definition:
        "A load balancer operating at the application layer (HTTP), capable of routing based on URL paths, headers, cookies, and request content.",
    },
    {
      term: "Consistent Hashing",
      definition:
        "A hashing technique that maps keys to nodes on a ring, ensuring minimal key redistribution when nodes are added or removed.",
    },
    {
      term: "Health Check",
      definition:
        "A mechanism for the load balancer to verify that backend servers are capable of handling requests, using active probes or passive traffic monitoring.",
    },
    {
      term: "Connection Draining",
      definition:
        "The process of allowing in-flight requests to complete on a backend before removing it from the load balancer's active pool.",
    },
    {
      term: "SSL/TLS Termination",
      definition:
        "Decrypting HTTPS traffic at the load balancer and forwarding plain HTTP to backend servers, offloading cryptographic processing.",
    },
    {
      term: "GSLB",
      definition:
        "Global Server Load Balancing — DNS-based traffic routing that directs users to the nearest healthy regional deployment.",
    },
  ],
};
