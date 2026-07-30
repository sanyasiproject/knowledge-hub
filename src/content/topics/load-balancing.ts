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
