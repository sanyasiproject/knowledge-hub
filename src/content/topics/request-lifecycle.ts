import type { TopicContent } from "../types";

export const requestLifecycle: TopicContent = {
  quickSummary: [
    "A web request travels through DNS resolution, TCP connection, TLS handshake, HTTP request/response, and multiple server-side layers before a response reaches the client.",
    "Server-side, the request passes through load balancers, reverse proxies, middleware stacks, routing, business logic, data access, and response serialization.",
    "Understanding the full lifecycle is essential for debugging latency, designing scalable architectures, and answering system design interviews.",
  ],
  detailed: [
    "When a user clicks a link or an API client makes a request, the journey begins with DNS resolution. The browser checks its cache, then the OS cache, then queries recursive DNS servers that walk the hierarchy (root → TLD → authoritative) to resolve the domain to an IP address. With the IP in hand, a TCP connection is established via the three-way handshake (SYN → SYN-ACK → ACK).",
    "If the connection uses HTTPS (and it should), a TLS handshake follows: the client sends supported cipher suites, the server responds with its certificate and chosen cipher, the client verifies the certificate chain, and both sides derive session keys. With TLS 1.3 this takes just one round trip; TLS 1.2 takes two.",
    "The HTTP request is then sent over the encrypted connection. It includes the method (GET, POST, etc.), path, headers (Host, Authorization, Content-Type, cookies), and optionally a body. The request arrives at the server's edge — often a CDN or load balancer that terminates TLS, applies rate limiting, and routes to a healthy backend instance.",
    "Inside the backend server, the request passes through a middleware stack: logging, authentication, authorization, request parsing, validation, CORS handling, and compression. The router matches the path and method to a handler function. The handler executes business logic, typically involving database queries, cache lookups, calls to other services, and transformations.",
    "The response is serialized (JSON, HTML, protobuf), compressed (gzip, brotli), given appropriate cache headers (Cache-Control, ETag), and sent back through the same middleware stack in reverse. The TCP connection may be kept alive for subsequent requests (HTTP/1.1 keep-alive, HTTP/2 multiplexing). The browser receives the response, may cache it, and renders the result.",
  ],
  deepDive: [
    "Connection pooling is critical for performance. Establishing a new TCP+TLS connection for every request adds 2-4 round trips of latency. HTTP/1.1 keep-alive reuses connections but suffers from head-of-line blocking. HTTP/2 multiplexes multiple requests over a single connection. HTTP/3 uses QUIC (built on UDP) to eliminate TCP's head-of-line blocking entirely.",
    "On the server side, the choice of concurrency model dramatically affects throughput. Thread-per-request (Java Servlet, Spring MVC) allocates an OS thread per connection — simple but memory-heavy (1MB stack per thread). Event-loop models (Node.js, Nginx, Netty) use a single thread with non-blocking I/O, handling thousands of connections with minimal memory. Hybrid models (Go goroutines, Erlang processes) use lightweight green threads scheduled onto a small OS thread pool.",
    "In microservice architectures, a single client request may fan out to dozens of internal service calls. Distributed tracing (OpenTelemetry, Jaeger) propagates a trace ID through all hops, allowing you to see the full request tree, identify bottlenecks, and calculate the critical path. Without tracing, debugging latency in distributed systems is nearly impossible.",
    "Edge computing and CDNs increasingly execute logic at the edge (Cloudflare Workers, Lambda@Edge), handling requests closer to users. This moves parts of the lifecycle — authentication, A/B testing, personalization — out of the origin server and into globally distributed edge nodes, reducing latency from hundreds of milliseconds to single digits.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Express.js middleware pipeline — the server-side lifecycle",
      source: `const express = require('express');
const app = express();

// Middleware 1: Request logging
app.use((req, res, next) => {
  req.startTime = Date.now();
  console.log(\`\${req.method} \${req.path}\`);
  next();
});

// Middleware 2: Authentication
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  req.user = verifyToken(token);
  next();
});

// Route handler: Business logic
app.get('/api/users/:id', async (req, res) => {
  const cached = await redis.get(\`user:\${req.params.id}\`);
  if (cached) return res.json(JSON.parse(cached));

  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  await redis.setex(\`user:\${req.params.id}\`, 300, JSON.stringify(user));
  res.json(user);
});

// Middleware 3: Response timing (runs after handler)
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(\`Response: \${res.statusCode} in \${Date.now() - req.startTime}ms\`);
  });
  next();
});`,
    },
    {
      language: "cpp",
      caption: "Full request trace using curl verbose output",
      source: `// Trace every step of the lifecycle:
// curl -v --trace-time https://api.example.com/users/1

// 1. DNS resolution:     ~20ms (cached) to ~200ms (cold)
// 2. TCP handshake:      ~30ms (1 RTT)
// 3. TLS handshake:      ~60ms (TLS 1.3, 1 RTT) or ~120ms (TLS 1.2, 2 RTT)
// 4. HTTP request sent:  ~1ms
// 5. Server processing:  ~50-500ms (varies)
// 6. HTTP response:      ~1-100ms (depends on payload size)
// Total first request:   ~160-850ms
// Subsequent (keep-alive): ~50-500ms (skip steps 1-3)

// C++: Measuring each phase programmatically (POSIX + OpenSSL)
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <openssl/ssl.h>
#include <chrono>
#include <iostream>
#include <cstring>

int main() {
    const char* host = "api.example.com";
    const char* port = "443";
    using Clock = std::chrono::steady_clock;

    // DNS resolution
    auto t0 = Clock::now();
    struct addrinfo hints{}, *res;
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    getaddrinfo(host, port, &hints, &res);
    double dns_ms = std::chrono::duration<double, std::milli>(
        Clock::now() - t0).count();

    // TCP connection
    auto t1 = Clock::now();
    int sockfd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    connect(sockfd, res->ai_addr, res->ai_addrlen);
    double tcp_ms = std::chrono::duration<double, std::milli>(
        Clock::now() - t1).count();
    freeaddrinfo(res);

    // TLS handshake
    auto t2 = Clock::now();
    SSL_library_init();
    SSL_CTX* ctx = SSL_CTX_new(TLS_client_method());
    SSL* ssl = SSL_new(ctx);
    SSL_set_fd(ssl, sockfd);
    SSL_set_tlsext_host_name(ssl, host);
    SSL_connect(ssl);
    double tls_ms = std::chrono::duration<double, std::milli>(
        Clock::now() - t2).count();

    std::cout << "DNS: " << dns_ms << "ms, "
              << "TCP: " << tcp_ms << "ms, "
              << "TLS: " << tls_ms << "ms" << std::endl;

    // Cleanup
    SSL_shutdown(ssl);
    SSL_free(ssl);
    SSL_CTX_free(ctx);
    close(sockfd);
    return 0;
}`,
    },
  ],
  diagrams: [
    {
      title: "HTTP Request Lifecycle",
      kind: "sequence",
      caption: "End-to-end lifecycle of an HTTP request from browser to server and back, including DNS resolution, TCP handshake, TLS negotiation, and response.",
      mermaid: `sequenceDiagram
    participant B as Browser
    participant DNS as DNS Resolver
    participant TCP as TCP Layer
    participant TLS as TLS Layer
    participant S as Web Server
    participant App as Application

    B->>DNS: Resolve hostname
    DNS-->>B: IP address
    B->>TCP: SYN
    TCP-->>B: SYN-ACK
    B->>TCP: ACK (connected)
    B->>TLS: Client Hello
    TLS-->>B: Server Hello + Certificate
    B->>TLS: Key exchange
    B->>S: HTTP GET /resource
    S->>App: Route request
    App-->>S: Response data
    S-->>B: HTTP 200 + body`,
    },
    {
      title: "Request Processing Pipeline",
      kind: "flow",
      caption: "How a web framework processes an incoming request through middleware, routing, authentication, business logic, and response serialization.",
      mermaid: `flowchart TD
    A([Incoming request]) --> B[Rate limiter middleware]
    B --> C{Rate limit exceeded?}
    C -->|Yes| D[Return 429 Too Many Requests]
    C -->|No| E[Auth middleware]
    E --> F{Authenticated?}
    F -->|No| G[Return 401 Unauthorized]
    F -->|Yes| H[Router - match route]
    H --> I{Route found?}
    I -->|No| J[Return 404 Not Found]
    I -->|Yes| K[Controller handler]
    K --> L[Business logic]
    L --> M[Serialize response]
    M --> N([Return 200 with data])`,
    },
    {
      title: "Browser to CDN to Origin Request Flow",
      kind: "architecture",
      caption: "Modern request lifecycle with CDN caching layer. Cache hits serve content at the edge. Cache misses propagate to origin servers.",
      mermaid: `graph LR
    Browser[Browser] --> CDN[CDN Edge Node]
    CDN --> CacheCheck{Cache hit?}
    CacheCheck -->|Yes| CachedResp[Serve cached response]
    CachedResp --> Browser
    CacheCheck -->|No| LB[Load Balancer]
    LB --> App1[App Server 1]
    LB --> App2[App Server 2]
    App1 --> DB[(Database)]
    App2 --> DB
    App1 -->|Cache response| CDN
    App2 -->|Cache response| CDN`,
    },
    {
      title: "Connection Pooling and Keep-Alive",
      kind: "state",
      caption: "HTTP connection states showing how keep-alive connections are reused across multiple requests to avoid repeated TCP handshake overhead.",
      mermaid: `stateDiagram-v2
    [*] --> Idle
    Idle --> Connecting: New request
    Connecting --> Handshaking: TCP connected
    Handshaking --> Active: TLS complete
    Active --> SendingRequest: Connection ready
    SendingRequest --> WaitingResponse: Request sent
    WaitingResponse --> ReadingResponse: Response headers received
    ReadingResponse --> Idle: Keep-Alive - response complete
    ReadingResponse --> Closed: Connection close header
    Idle --> Closed: Idle timeout
    Closed --> [*]`,
    },
  ],
  animations: [
    {
      title: "HTTP request lifecycle step by step",
      steps: [
        { label: "DNS Resolution", detail: "Browser resolves domain to IP via recursive DNS lookup (cache → OS → resolver → root → TLD → authoritative)." },
        { label: "TCP Handshake", detail: "Client sends SYN, server responds SYN-ACK, client sends ACK. Connection established (1 round trip)." },
        { label: "TLS Handshake", detail: "Client sends ClientHello with cipher suites. Server responds with certificate. Both derive session keys. (1-2 round trips)." },
        { label: "HTTP Request", detail: "Client sends method, path, headers, and body over the encrypted connection." },
        { label: "Server Processing", detail: "Request passes through middleware (auth, validation, logging), router matches handler, business logic executes." },
        { label: "Data Access", detail: "Handler queries caches and databases, calls other services if needed, assembles the response data." },
        { label: "Response", detail: "Server serializes response, sets headers (Cache-Control, Content-Type), compresses body, sends back over the connection." },
        { label: "Client Rendering", detail: "Browser receives response, may cache it, parses HTML/JSON, renders the page or processes the API response." },
      ],
    },
  ],
  comparison: {
    columns: ["Phase", "Latency (typical)", "Cacheable?", "Can be eliminated?"],
    rows: [
      ["DNS resolution", "0-200ms", "Yes (TTL-based)", "Pre-resolve, DNS prefetch"],
      ["TCP handshake", "~1 RTT (10-100ms)", "Connection pooling", "Keep-alive, HTTP/2"],
      ["TLS handshake", "1-2 RTT (20-200ms)", "Session resumption", "TLS 1.3, 0-RTT"],
      ["HTTP request send", "<1ms", "No", "Compression"],
      ["Server processing", "10-1000ms", "Response caching", "Optimize code/queries"],
      ["Response transfer", "1-500ms", "CDN edge cache", "Compression, CDN"],
    ],
  },
  interviewQA: [
    {
      q: "Walk me through what happens when you type a URL into a browser and press Enter.",
      a: "The browser first checks its cache for the resource. If not cached, DNS resolution begins: the browser checks its DNS cache, then the OS cache, then queries a recursive resolver that walks the DNS hierarchy (root → TLD → authoritative nameserver) to get the IP address. A TCP connection is established via the three-way handshake (SYN, SYN-ACK, ACK). For HTTPS, a TLS handshake follows to negotiate encryption. The browser sends an HTTP request with the method, path, headers, and any cookies. The request typically hits a CDN or load balancer first, then reaches the backend server where it passes through middleware (logging, auth, CORS), gets routed to a handler, which executes business logic and database queries. The response is serialized, compressed, and sent back. The browser receives it, caches if allowed, parses the HTML, discovers additional resources (CSS, JS, images), fetches them in parallel, builds the DOM and CSSOM, executes JavaScript, and renders the page.",
      followUps: [
        "How does HTTP/2 change this flow? (Multiplexing over a single connection, server push, header compression.)",
        "What role does the CDN play? (Edge caching, TLS termination, DDoS protection, reduced latency.)",
        "How would you debug a slow request? (Distributed tracing, waterfall analysis, server timing headers.)",
      ],
    },
    {
      q: "How does keep-alive improve performance?",
      a: "HTTP keep-alive reuses an existing TCP connection for multiple requests instead of opening a new one for each. This eliminates the TCP handshake (1 RTT) and TLS handshake (1-2 RTT) for subsequent requests. For HTTP/1.1, keep-alive is the default but requests are serialized (head-of-line blocking). HTTP/2 goes further with multiplexing — multiple concurrent request/response streams over a single connection.",
    },
    {
      q: "What is the difference between server processing time and time to first byte (TTFB)?",
      a: "TTFB includes the full round trip from client to server and back: network latency (client→server) + server processing time + network latency (server→client) + any intermediary overhead (load balancer, CDN). Server processing time is just the time the server spends handling the request. A high TTFB with low server processing time indicates network latency or intermediary bottlenecks.",
    },
  ],
  followUps: [
    "How does HTTP/3 (QUIC) change the connection establishment process?",
    "What is 0-RTT resumption in TLS 1.3, and what are its security implications?",
    "How do WebSockets differ from the standard HTTP request-response lifecycle?",
    "What is Server-Sent Events and how does it modify the lifecycle?",
    "How does gRPC's persistent HTTP/2 connection change the per-request overhead?",
  ],
  mcqs: [
    {
      q: "How many round trips does a new HTTPS connection require before the first HTTP request can be sent (TCP + TLS 1.3)?",
      options: ["1 round trip", "2 round trips", "3 round trips", "4 round trips"],
      answerIndex: 1,
      explanation: "TCP three-way handshake requires 1 RTT, TLS 1.3 handshake requires 1 RTT. Total: 2 round trips before the HTTP request. TLS 1.2 would add a third.",
    },
    {
      q: "Which HTTP version introduces multiplexing over a single TCP connection?",
      options: ["HTTP/1.0", "HTTP/1.1", "HTTP/2", "HTTP/3"],
      answerIndex: 2,
      explanation: "HTTP/2 introduces multiplexing — multiple concurrent streams over one TCP connection. HTTP/1.1 has keep-alive but requests are serialized. HTTP/3 also multiplexes but over QUIC/UDP.",
    },
    {
      q: "In a typical middleware pipeline, which of these runs FIRST?",
      options: ["Route handler", "Authentication middleware", "Response compression", "Business logic"],
      answerIndex: 1,
      explanation: "Authentication middleware runs early in the pipeline to reject unauthorized requests before they reach the router or business logic. Compression typically happens on the response path.",
    },
  ],
  exercises: [
    "Use browser DevTools Network tab to record loading a web page. Identify DNS, TCP, TLS, waiting (TTFB), and content download times in the waterfall. What dominates latency on first load vs. reload?",
    "Write a Node.js or Python HTTP server that logs the time spent in each middleware layer. Make a request and identify where time is spent.",
    "Use curl with --trace-time to trace a request to a public API. Calculate the percentage of total time spent in connection setup vs. server processing.",
    "Compare latency of HTTP/1.1 vs HTTP/2 when loading a page with 20 resources. Explain the difference.",
  ],
  flashcards: [
    { front: "What are the three messages in a TCP handshake?", back: "SYN → SYN-ACK → ACK (one round trip)" },
    { front: "How many RTTs does TLS 1.3 add?", back: "1 RTT (vs 2 for TLS 1.2). 0-RTT resumption is possible but has replay attack risks." },
    { front: "What is TTFB?", back: "Time to First Byte — the time from the client sending the request to receiving the first byte of the response. Includes network latency + server processing." },
    { front: "What is head-of-line blocking?", back: "In HTTP/1.1, requests on a keep-alive connection must wait for the previous response. One slow response blocks all subsequent ones. HTTP/2 fixes this at the HTTP layer; HTTP/3 fixes it at the transport layer too." },
    { front: "What is connection pooling?", back: "Reusing established TCP/TLS connections across multiple requests to avoid the overhead of repeated handshakes." },
  ],
  revisionNotes: [
    "Request path: DNS → TCP (1 RTT) → TLS (1-2 RTT) → HTTP request → server middleware → handler → response.",
    "HTTP/1.1: keep-alive, serial requests. HTTP/2: multiplexing, header compression. HTTP/3: QUIC/UDP, no TCP HOL blocking.",
    "Server pipeline: Load Balancer → Reverse Proxy → Middleware (auth, logging, CORS) → Router → Handler → Response.",
    "TTFB = network latency + server processing time + network latency.",
    "Connection pooling eliminates repeated handshake overhead for subsequent requests.",
  ],
  cheatSheet: [
    "DNS: browser cache → OS cache → recursive resolver → root → TLD → authoritative",
    "New HTTPS conn: 2 RTT minimum (TCP + TLS 1.3), 3 RTT with TLS 1.2",
    "Keep-alive: skip DNS+TCP+TLS on subsequent requests to same host",
    "HTTP/2: binary framing, multiplexing, server push, HPACK header compression",
    "Debug latency: curl -w '%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer}'",
  ],
  resources: [
    { label: "High Performance Browser Networking (Ilya Grigorik)", url: "https://hpbn.co/", kind: "book", note: "Free online — the definitive resource on the network layers of the web." },
    { label: "MDN: How the Web Works", url: "https://developer.mozilla.org/", kind: "docs", note: "Clear walkthrough of client-server interaction." },
    { label: "HTTP/2 RFC 9113", url: "https://www.rfc-editor.org/rfc/rfc9113", kind: "paper", note: "The specification for HTTP/2." },
    { label: "What happens when you type google.com (GitHub repo)", url: "https://github.com/alex/what-happens-when", kind: "repo", note: "A collaboratively built, extremely detailed answer to the classic question." },
  ],
  glossary: [
    { term: "TTFB", definition: "Time to First Byte — the elapsed time from sending a request to receiving the first byte of the response." },
    { term: "RTT", definition: "Round Trip Time — the time for a signal to travel from client to server and back." },
    { term: "Multiplexing", definition: "Sending multiple requests/responses simultaneously over a single connection (HTTP/2 feature)." },
    { term: "Head-of-line blocking", definition: "A slow or blocked request preventing subsequent requests from proceeding on the same connection." },
    { term: "Keep-alive", definition: "Reusing a TCP connection for multiple HTTP requests instead of opening a new one each time." },
  ],
};
