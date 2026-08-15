import type { TopicContent } from "../types";

export const http: TopicContent = {
  quickSummary: [
    "HTTP (Hypertext Transfer Protocol) is a stateless, text-based request/response protocol that powers the web — a client sends a request with a method, path, headers, and optional body, and the server replies with a status code, headers, and optional body.",
    "HTTP/2 introduced binary framing, multiplexed streams over a single TCP connection, header compression (HPACK), and server push — dramatically reducing latency for modern web pages.",
    "HTTP/3 replaces TCP with QUIC (a UDP-based transport) to eliminate TCP-level head-of-line blocking, supports 0-RTT connection resumption, and bakes in TLS 1.3 encryption from the start.",
    "Understanding HTTP deeply is essential: every REST API call, browser navigation, CDN interaction, and microservice RPC (gRPC uses HTTP/2) depends on the semantics of methods, status codes, caching headers, and connection management.",
  ],
  detailed: [
    "HTTP follows a simple request/response model. A client opens a TCP connection (or reuses one via keep-alive) and sends a request line — e.g. 'GET /api/users HTTP/1.1' — followed by headers (Host, Accept, Authorization, etc.) and an optional body (for POST/PUT/PATCH). The server processes the request and returns a status line — e.g. 'HTTP/1.1 200 OK' — followed by response headers (Content-Type, Cache-Control, Set-Cookie) and a body. This textual, line-delimited format is human-readable and easy to debug with tools like curl or telnet.",
    "HTTP methods define the intended action: GET retrieves a resource (safe, idempotent), POST creates or submits data (neither safe nor idempotent), PUT replaces a resource entirely (idempotent), PATCH applies a partial update, DELETE removes a resource (idempotent), HEAD retrieves only headers, and OPTIONS describes the communication options (used in CORS preflight). The distinction between safe, idempotent, and non-idempotent methods is critical for correct API design, caching, and retry logic.",
    "Status codes are grouped by class: 1xx informational (100 Continue, 101 Switching Protocols), 2xx success (200 OK, 201 Created, 204 No Content), 3xx redirection (301 Moved Permanently, 302 Found, 304 Not Modified), 4xx client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests), and 5xx server errors (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout). Choosing the right status code conveys precise semantics to clients, proxies, and caches.",
    "Headers carry metadata that controls nearly every aspect of HTTP: content negotiation (Accept, Content-Type), authentication (Authorization, WWW-Authenticate), caching (Cache-Control, ETag, If-None-Match, If-Modified-Since), connection management (Connection, Keep-Alive), cookies (Cookie, Set-Cookie), security (Strict-Transport-Security, Content-Security-Policy, X-Frame-Options), and CORS (Access-Control-Allow-Origin, Access-Control-Allow-Methods). Custom headers use the X- prefix by convention, though RFC 6648 deprecated this practice.",
    "HTTP/1.1 introduced persistent connections (keep-alive) by default, allowing multiple requests over a single TCP connection and avoiding the latency of a new TCP handshake per request. However, HTTP/1.1 still suffers from head-of-line (HOL) blocking: responses must be sent in request order on a connection, so a slow response blocks all subsequent ones. Browsers work around this by opening 6-8 parallel TCP connections per origin, but this wastes resources. Pipelining was specified but never widely adopted due to buggy intermediaries.",
  ],
  deepDive: [
    "HTTP/2 (RFC 7540/9113) fundamentally changes how data travels over the wire while preserving HTTP semantics. It introduces a binary framing layer: each HTTP message is split into frames (HEADERS, DATA, SETTINGS, etc.) and frames are multiplexed over streams within a single TCP connection. This eliminates HTTP-level HOL blocking — a server can interleave frames from multiple responses, so a large download no longer blocks a small API call. Streams have priorities and dependencies, letting the client hint that CSS is more important than images. However, TCP-level HOL blocking remains: if a single TCP packet is lost, the kernel holds all subsequent packets (even those for different streams) until retransmission succeeds.",
    "HPACK (RFC 7541) is HTTP/2's header compression scheme. Because HTTP headers are highly repetitive across requests (Host, Accept, User-Agent rarely change), HPACK uses a static table of 61 common header name-value pairs, a dynamic table built during the connection, and Huffman coding to compress header values. This can reduce header overhead by 85-90% compared to HTTP/1.1, where headers were sent as uncompressed text on every request. Both endpoints maintain synchronized dynamic tables, so they can refer to previously sent headers by index.",
    "Server push (HTTP/2) allows a server to proactively send resources the client hasn't requested yet — for example, pushing a CSS file alongside the HTML that references it. The server sends a PUSH_PROMISE frame referencing the stream that triggered the push, then sends the pushed resource on a new stream. While promising in theory, server push saw limited adoption: it's hard to know what the client already has cached, it can waste bandwidth, and modern alternatives like 103 Early Hints and preload link headers achieve similar goals more predictably. Chrome removed server push support in 2022.",
    "HTTP/3 (RFC 9114) replaces TCP entirely with QUIC (RFC 9000), a transport protocol built on UDP. QUIC incorporates TLS 1.3 directly into its handshake, achieving 1-RTT connection establishment (vs TCP's 1-RTT + TLS's 1-2 RTT). For previously visited servers, QUIC supports 0-RTT resumption — the client can send application data in its very first packet. Because QUIC implements its own reliable delivery per-stream, a packet loss on one stream does not block other streams, solving TCP's HOL blocking problem. QUIC also supports connection migration: when a client switches from WiFi to cellular, the connection ID (not tied to the IP/port 4-tuple) persists, so the session continues without re-handshaking.",
    "HTTP caching is a layered system governed by headers. Cache-Control directives (max-age, no-cache, no-store, private, public, s-maxage, must-revalidate, stale-while-revalidate) give fine-grained control over who caches what and for how long. ETag (entity tag) and Last-Modified enable conditional requests: the client sends If-None-Match or If-Modified-Since, and the server returns 304 Not Modified with no body if the resource hasn't changed — saving bandwidth. The Vary header tells caches that the response depends on specific request headers (e.g. Accept-Encoding), preventing incorrect cache hits. Proper caching design (immutable assets with hashed filenames + long max-age, API responses with short max-age + revalidation) is one of the highest-leverage performance optimizations available.",
  ],
  code: [
    {
      language: "http",
      caption: "Raw HTTP/1.1 request and response",
      source: `# --- Request ---
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
If-None-Match: "abc123"
Connection: keep-alive

# --- Response (cache hit, resource unchanged) ---
HTTP/1.1 304 Not Modified
ETag: "abc123"
Cache-Control: private, max-age=60
Date: Wed, 30 Jul 2025 12:00:00 GMT

# --- Response (cache miss, full body) ---
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 128
ETag: "def456"
Cache-Control: private, max-age=60
Strict-Transport-Security: max-age=31536000; includeSubDomains

{"id": 42, "name": "Alice", "email": "alice@example.com"}`,
    },
    {
      language: "bash",
      caption: "Inspecting HTTP/2 with curl",
      source: `# Verbose HTTP/2 request showing multiplexing and HPACK
curl -v --http2 https://api.example.com/users \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer token123" 2>&1

# Key output lines:
# * ALPN: server accepted h2        (HTTP/2 negotiated via TLS ALPN)
# * Using HTTP2, server supports multiplexing
# > :method: GET                     (pseudo-headers in HTTP/2)
# > :path: /users
# > :scheme: https
# > :authority: api.example.com
# < :status: 200
# < content-type: application/json

# Force HTTP/3 (QUIC) with curl 7.66+
curl --http3 -v https://api.example.com/users

# Measure connection timing breakdown
curl -o /dev/null -w "\\
  DNS:        %{time_namelookup}s\\n\\
  TCP:        %{time_connect}s\\n\\
  TLS:        %{time_appconnect}s\\n\\
  TTFB:       %{time_starttransfer}s\\n\\
  Total:      %{time_total}s\\n\\
  HTTP ver:   %{http_version}\\n" \\
  https://api.example.com/users`,
    },
    {
      language: "javascript",
      caption: "REST API example with fetch — methods, headers, error handling",
      source: `// GET with conditional caching
async function getUser(id, etag) {
  const headers = { "Accept": "application/json" };
  if (etag) headers["If-None-Match"] = etag;

  const res = await fetch(\`/api/users/\${id}\`, { headers });

  if (res.status === 304) return { changed: false };
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);

  return {
    changed: true,
    data: await res.json(),
    etag: res.headers.get("ETag"),
  };
}

// POST with JSON body
async function createUser(user) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (res.status === 201) {
    const location = res.headers.get("Location"); // /api/users/43
    return { id: location.split("/").pop(), data: await res.json() };
  }
  if (res.status === 422) {
    const errors = await res.json();
    throw new ValidationError(errors);
  }
  throw new Error(\`Unexpected: HTTP \${res.status}\`);
}

// DELETE (idempotent — safe to retry)
async function deleteUser(id) {
  const res = await fetch(\`/api/users/\${id}\`, { method: "DELETE" });
  if (res.status === 204 || res.status === 404) return; // both mean "gone"
  throw new Error(\`HTTP \${res.status}\`);
}`,
    },
  ],
  diagrams: [
    {
      title: "HTTP Request-Response Lifecycle",
      kind: "sequence",
      caption: "How an HTTP request travels from browser to server and back.",
      mermaid: `sequenceDiagram
    participant Browser
    participant DNS
    participant Server
    Browser->>DNS: Resolve domain to IP
    DNS-->>Browser: IP address returned
    Browser->>Server: TCP three-way handshake
    Server-->>Browser: TCP established
    Browser->>Server: HTTP GET /path with headers
    Server->>Server: Process request
    Server-->>Browser: HTTP 200 OK with body
    Browser->>Browser: Render response`,
    },
    {
      title: "HTTP Methods and Semantics",
      kind: "mindmap",
      caption: "HTTP methods and their safety and idempotency properties.",
      mermaid: `mindmap
  root((HTTP Methods))
    Safe and Idempotent
      GET read resource
      HEAD metadata only
      OPTIONS discover
    Idempotent Not Safe
      PUT replace resource
      DELETE remove resource
    Neither Safe Nor Idempotent
      POST create or action
      PATCH partial update
    Caching
      GET cacheable by default
      POST not cached
      PUT not cached`,
    },
    {
      title: "HTTP Status Code Ranges",
      kind: "architecture",
      caption: "HTTP response status code ranges and their semantic meanings.",
      mermaid: `graph TD
    SC[HTTP Status Codes] --> S1xx[1xx Informational]
    SC --> S2xx[2xx Success]
    SC --> S3xx[3xx Redirection]
    SC --> S4xx[4xx Client Error]
    SC --> S5xx[5xx Server Error]
    S2xx --> S200[200 OK]
    S2xx --> S201[201 Created]
    S2xx --> S204[204 No Content]
    S4xx --> S400[400 Bad Request]
    S4xx --> S401[401 Unauthorized]
    S4xx --> S404[404 Not Found]
    S5xx --> S500[500 Internal Server Error]`,
    },
    {
      title: "HTTP Protocol Evolution",
      kind: "flow",
      caption: "Key improvements across HTTP/1.1, HTTP/2, and HTTP/3.",
      mermaid: `flowchart TD
    A[HTTP/1.0] --> B[HTTP/1.1]
    B --> B1[Persistent connections keep-alive]
    B --> B2[Host header required]
    B --> C[HTTP/2]
    C --> C1[Multiplexed streams]
    C --> C2[Header compression HPACK]
    C --> C3[Server push]
    C --> D[HTTP/3]
    D --> D1[QUIC over UDP]
    D --> D2[0-RTT connection resumption]
    D --> D3[No head-of-line blocking]`,
    },
  ],
  animations: [
    {
      title: "HTTP/2 multiplexing vs HTTP/1.1 sequential",
      steps: [
        { label: "HTTP/1.1: Request 1 sent", detail: "Client sends GET /style.css. The connection is now blocked until the response completes." },
        { label: "HTTP/1.1: Response 1 received", detail: "Server returns the CSS file. Only now can the next request be sent on this connection." },
        { label: "HTTP/1.1: Request 2 sent", detail: "Client sends GET /app.js. Again, the connection is blocked — this is head-of-line blocking." },
        { label: "HTTP/2: All requests sent immediately", detail: "Client opens streams 1, 3, 5 for CSS, JS, and an image. All three requests are sent without waiting." },
        { label: "HTTP/2: Frames interleaved", detail: "Server sends DATA frames from all three streams interleaved: CSS frame, JS frame, image frame, CSS frame... No stream blocks another." },
        { label: "HTTP/2: All responses complete", detail: "All three resources arrive in roughly the same wall-clock time. Total page load is bounded by the slowest single resource, not the sum." },
      ],
    },
    {
      title: "QUIC 0-RTT connection resumption",
      steps: [
        { label: "First visit: 1-RTT handshake", detail: "Client sends a QUIC Initial packet with TLS ClientHello. Server responds with its certificate and keys. Connection established in 1 round trip (vs 2-3 for TCP+TLS)." },
        { label: "Session ticket stored", detail: "Server issues a session ticket and transport parameters. Client caches these locally for future use." },
        { label: "Return visit: 0-RTT", detail: "Client sends a QUIC Initial packet with the cached session ticket AND application data (e.g. GET /api/data) in the very first packet." },
        { label: "Server processes immediately", detail: "Server decrypts the 0-RTT data using the cached key, begins processing the request before the handshake is fully complete." },
        { label: "Replay protection caveat", detail: "0-RTT data can be replayed by an attacker — servers must ensure 0-RTT requests are idempotent (safe GETs, not POSTs that transfer money)." },
      ],
    },
  ],
  comparison: {
    columns: ["Feature", "HTTP/1.1", "HTTP/2", "HTTP/3"],
    rows: [
      ["Transport", "TCP", "TCP", "QUIC (over UDP)"],
      ["Encryption", "Optional (TLS)", "Optional but practically required (TLS via ALPN)", "Mandatory (TLS 1.3 built into QUIC)"],
      ["Multiplexing", "No — one request at a time per connection (HOL blocking)", "Yes — multiple streams over one TCP connection", "Yes — independent streams, no TCP-level HOL blocking"],
      ["Header format", "Text, uncompressed, repeated every request", "Binary, HPACK compressed", "Binary, QPACK compressed (HPACK adapted for QUIC)"],
      ["Connection setup", "1 RTT (TCP) + 1-2 RTT (TLS) = 2-3 RTT", "Same as HTTP/1.1 (still TCP+TLS)", "1 RTT (QUIC+TLS combined); 0-RTT on resumption"],
      ["Server push", "Not supported", "Supported (PUSH_PROMISE)", "Supported but rarely used"],
      ["Head-of-line blocking", "HTTP-level and TCP-level", "HTTP-level solved; TCP-level remains", "Fully solved — stream-level independence"],
      ["Connection migration", "Not supported — tied to IP:port", "Not supported — tied to IP:port", "Supported via connection IDs (survives WiFi-to-cellular)"],
      ["Adoption (2025)", "Legacy; still common for internal services", "Dominant — ~60% of web traffic", "Growing — ~30% of web traffic (Chrome, Cloudflare, Google)"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between GET and POST, and when should you use each?",
      a: "GET is a safe, idempotent method for retrieving resources — it should never cause side effects. GET requests can be cached, bookmarked, and replayed freely. POST is for submitting data that causes a state change (creating a resource, submitting a form, triggering a process). POST is neither safe nor idempotent — repeating a POST may create duplicate resources. Use GET for reads and POST for writes. PUT is also available for full-resource replacement (idempotent), and PATCH for partial updates.",
      followUps: [
        "Why is idempotency important for retry logic in distributed systems?",
        "What happens if a reverse proxy caches a POST response?",
        "How does the browser handle GET vs POST differently for the back button?",
      ],
    },
    {
      q: "Explain HTTP/2 multiplexing and why it matters.",
      a: "In HTTP/1.1, each TCP connection handles one request at a time — a slow response blocks everything behind it (head-of-line blocking). Browsers open 6-8 connections per origin as a workaround, wasting memory and TCP slow-start bandwidth. HTTP/2 introduces streams: multiple request/response exchanges are interleaved as binary frames on a single TCP connection. The server can send frames from different streams in any order, so a large image download doesn't block a small CSS file. This reduces connection count, improves TLS amortization, and enables better server-side prioritization.",
      followUps: [
        "Does HTTP/2 fully solve head-of-line blocking?",
        "How does stream prioritization work, and has it been reliable?",
      ],
    },
    {
      q: "How does HTTP/3 solve the remaining head-of-line blocking problem?",
      a: "HTTP/2 multiplexes streams over a single TCP connection, but TCP treats all bytes as one ordered byte stream. If a TCP packet is lost, the kernel buffers all subsequent packets — even those belonging to unaffected streams — until the lost packet is retransmitted. This is TCP-level HOL blocking. HTTP/3 uses QUIC, which implements its own reliable delivery independently per stream. A lost packet on stream 1 only stalls stream 1; streams 2 and 3 continue receiving data. This is especially impactful on lossy networks (mobile, WiFi) where packet loss is frequent.",
      followUps: [
        "What is QUIC and how is it different from TCP?",
        "What is 0-RTT and what are its security implications?",
        "How does connection migration work in QUIC?",
      ],
    },
    {
      q: "Explain HTTP caching — what headers control it and how does conditional validation work?",
      a: "HTTP caching is controlled primarily by Cache-Control, ETag, Last-Modified, and Vary headers. Cache-Control directives include: max-age (seconds until stale), no-cache (must revalidate before use), no-store (never cache), private (only browser can cache, not CDN), public (any cache can store), s-maxage (CDN-specific max-age), and stale-while-revalidate (serve stale while revalidating in background). Conditional validation uses ETag: the server attaches an opaque tag (e.g. a content hash) to a response; on the next request the client sends If-None-Match with the ETag. If the resource hasn't changed, the server returns 304 Not Modified with no body, saving bandwidth. Last-Modified/If-Modified-Since works similarly but with timestamps — ETags are more precise.",
      followUps: [
        "What is the difference between no-cache and no-store?",
        "How does Vary affect CDN caching?",
        "What caching strategy would you use for a single-page application?",
      ],
    },
    {
      q: "What is the CORS mechanism and why does the browser enforce it?",
      a: "Cross-Origin Resource Sharing (CORS) is a security mechanism enforced by browsers to prevent malicious websites from making requests to APIs on other domains using the user's cookies/credentials. When JavaScript on origin A makes a fetch to origin B, the browser checks if origin B explicitly permits this by looking for Access-Control-Allow-Origin in the response. For 'non-simple' requests (custom headers, PUT/DELETE methods, JSON content-type), the browser first sends a preflight OPTIONS request to ask permission. The server responds with allowed origins, methods, and headers. Without CORS, any website could silently call your bank's API using your authenticated session cookies.",
      followUps: [
        "What makes a request 'simple' vs requiring preflight?",
        "How do you handle CORS for an API used by multiple frontends?",
        "What is the difference between Access-Control-Allow-Origin: * and specifying a domain?",
      ],
    },
    {
      q: "What are the trade-offs of HTTP/2 server push, and why was it deprecated in Chrome?",
      a: "Server push lets the server proactively send resources the client will likely need (e.g. CSS and JS alongside the HTML page). The idea is to eliminate the round trip where the client parses HTML, discovers resource URLs, then requests them. However, push has fundamental problems: the server doesn't know what's already in the client's cache (pushing cached resources wastes bandwidth), push races with the client's own requests (creating duplicates), and it's complex for CDNs to implement correctly. Alternatives like 103 Early Hints (server sends Link headers before the full response) and rel=preload achieve similar benefits more reliably, which is why Chrome dropped push support.",
      followUps: [
        "What are 103 Early Hints and how do they compare to server push?",
        "How would you optimize resource loading without server push?",
      ],
    },
  ],
  followUps: [
    "How do WebSockets differ from HTTP, and when should you choose one over the other?",
    "What is HTTP/2 flow control and how does it prevent a fast sender from overwhelming a slow receiver?",
    "How do CDNs like Cloudflare and Fastly handle HTTP/2 and HTTP/3 termination?",
    "What is the HSTS (HTTP Strict Transport Security) header and why is it important?",
    "How does gRPC use HTTP/2 under the hood for its streaming RPCs?",
    "What are the security implications of HTTP/3's 0-RTT and how do servers mitigate replay attacks?",
  ],
  mcqs: [
    {
      q: "Which HTTP method is idempotent but NOT safe?",
      options: ["GET", "POST", "DELETE", "HEAD"],
      answerIndex: 2,
      explanation: "DELETE is idempotent (deleting the same resource twice has the same result) but not safe (it causes a side effect by removing the resource). GET and HEAD are both safe and idempotent. POST is neither.",
    },
    {
      q: "What does HTTP status code 304 mean?",
      options: [
        "The resource was permanently moved to a new URL",
        "The resource has not been modified since the last request — use your cached copy",
        "The server encountered an internal error",
        "The request was malformed and could not be processed",
      ],
      answerIndex: 1,
      explanation: "304 Not Modified is returned when the client sends a conditional request (If-None-Match or If-Modified-Since) and the resource hasn't changed. The server sends no body, saving bandwidth.",
    },
    {
      q: "What transport protocol does HTTP/3 use?",
      options: ["TCP", "SCTP", "UDP (via QUIC)", "TCP with TLS 1.3"],
      answerIndex: 2,
      explanation: "HTTP/3 runs over QUIC, which is built on UDP. QUIC implements its own reliable, ordered delivery per-stream, congestion control, and integrates TLS 1.3 directly into its handshake.",
    },
    {
      q: "In HTTP/2, what mechanism compresses headers?",
      options: ["gzip", "HPACK", "Brotli", "QPACK"],
      answerIndex: 1,
      explanation: "HPACK (RFC 7541) compresses HTTP/2 headers using a static table, a dynamic table, and Huffman coding. QPACK is the adapted version for HTTP/3 (designed for QUIC's out-of-order delivery). gzip and Brotli compress response bodies, not headers.",
    },
    {
      q: "What is the primary problem HTTP/2 multiplexing does NOT solve?",
      options: [
        "HTTP-level head-of-line blocking",
        "Redundant header transmission",
        "TCP-level head-of-line blocking",
        "Multiple TCP connections per origin",
      ],
      answerIndex: 2,
      explanation: "HTTP/2 multiplexes streams over a single TCP connection, solving HTTP-level HOL blocking. However, TCP still treats all data as one byte stream — a lost packet stalls all streams. This TCP-level HOL blocking is only solved by HTTP/3's QUIC transport.",
    },
    {
      q: "Which Cache-Control directive tells caches to store the response but always revalidate with the origin server before serving it?",
      options: ["no-store", "no-cache", "max-age=0", "private"],
      answerIndex: 1,
      explanation: "no-cache means the cache may store the response but must revalidate it with the origin (using ETag/If-None-Match) before each use. no-store means don't store it at all. max-age=0 makes it immediately stale but doesn't mandate revalidation. private restricts caching to the end-user's browser only.",
    },
  ],
  exercises: [
    "Use curl -v to make a request to a public HTTPS API. Identify the TLS version negotiated, the HTTP version used, all request headers sent, and the response status code and caching headers.",
    "Build a simple HTTP server (in Node.js, Python, or Go) that implements conditional GET with ETag. Return 304 when the resource hasn't changed and 200 with the full body otherwise. Verify with curl using If-None-Match.",
    "Use your browser's Network tab to load a complex page (e.g. nytimes.com). Count the number of HTTP/2 connections opened. Identify which resources were served over the same connection (look at the Connection ID column). Note any resources served over HTTP/3.",
    "Implement a REST API for a 'todo' resource with proper use of methods (GET, POST, PUT, DELETE), status codes (200, 201, 204, 404, 422), Location header on creation, and Cache-Control headers.",
    "Compare page load times for a site over HTTP/1.1 vs HTTP/2 by disabling HTTP/2 in your browser or using curl --http1.1 vs --http2. Measure TTFB and total load time. Explain the differences.",
    "Write a small script that demonstrates HTTP/3 0-RTT by connecting to a QUIC-enabled server (e.g. Google) twice in succession and measuring the handshake time difference between the first and second connection.",
  ],
  flashcards: [
    { front: "What are the five classes of HTTP status codes?", back: "1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error." },
    { front: "What is the difference between PUT and PATCH?", back: "PUT replaces the entire resource (idempotent). PATCH applies a partial modification to the resource." },
    { front: "What does HPACK do in HTTP/2?", back: "HPACK compresses HTTP headers using a static table (61 common headers), a per-connection dynamic table, and Huffman coding — reducing header overhead by up to 85-90%." },
    { front: "Why does HTTP/2 still suffer from head-of-line blocking?", back: "HTTP/2 multiplexes streams over a single TCP connection. TCP delivers bytes in order — if one packet is lost, all subsequent packets (across all streams) are held until retransmission. This is TCP-level HOL blocking." },
    { front: "How does QUIC solve TCP-level HOL blocking?", back: "QUIC implements reliable, ordered delivery independently per stream. A lost packet on stream N only stalls stream N; other streams continue receiving data without delay." },
    { front: "What is a CORS preflight request?", back: "An OPTIONS request the browser automatically sends before a cross-origin request that uses custom headers, non-simple methods (PUT, DELETE), or non-simple content types. The server must respond with Access-Control-Allow-* headers to permit the actual request." },
    { front: "What is 0-RTT in QUIC/HTTP/3?", back: "On a return visit, the client can send application data (e.g. a GET request) in the very first QUIC packet using a cached session ticket, achieving zero round trips before data transfer begins. Caveat: 0-RTT data is replayable, so only idempotent requests should use it." },
    { front: "What is the difference between no-cache and no-store?", back: "no-cache: the cache may store the response but must revalidate with the origin server before serving it. no-store: the cache must not store the response at all — it should not be written to disk." },
    { front: "What is connection migration in QUIC?", back: "QUIC connections are identified by a Connection ID, not by the IP:port 4-tuple. When a client switches networks (WiFi to cellular), the Connection ID stays the same, so the session continues without re-handshaking." },
    { front: "What does the Vary header do?", back: "Vary tells caches that the response differs based on specific request headers (e.g. Vary: Accept-Encoding). A cache must store separate versions for each unique combination of the listed headers to avoid serving the wrong variant." },
  ],
  revisionNotes: [
    "HTTP is stateless and text-based (HTTP/1.1) — each request is independent; state is managed via cookies, tokens, or session IDs.",
    "Methods: GET (safe, idempotent, cacheable), POST (unsafe, non-idempotent), PUT (idempotent full replace), PATCH (partial update), DELETE (idempotent), HEAD (headers only), OPTIONS (CORS preflight).",
    "Status codes: 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error. Know 200, 201, 204, 301, 304, 400, 401, 403, 404, 429, 500, 502, 503.",
    "HTTP/1.1 keep-alive reuses TCP connections but still has HOL blocking — responses must come in order.",
    "HTTP/2: binary framing, multiplexed streams (one TCP connection), HPACK header compression, server push (deprecated in practice), stream priorities.",
    "HTTP/2 does NOT solve TCP-level HOL blocking — a single lost packet stalls all multiplexed streams.",
    "HTTP/3 = HTTP over QUIC (UDP). Independent stream delivery, 0-RTT resumption, mandatory TLS 1.3, connection migration.",
    "Caching: Cache-Control (max-age, no-cache, no-store, private, public, s-maxage, stale-while-revalidate), ETag + If-None-Match for conditional requests, 304 Not Modified saves bandwidth.",
    "CORS: browser-enforced same-origin policy; cross-origin requests need server opt-in via Access-Control-Allow-* headers; preflight OPTIONS for non-simple requests.",
  ],
  cheatSheet: [
    "GET    — Read (safe, idempotent, cacheable)",
    "POST   — Create / submit (not idempotent)",
    "PUT    — Replace entire resource (idempotent)",
    "PATCH  — Partial update",
    "DELETE — Remove resource (idempotent)",
    "HEAD   — GET without body (check existence/headers)",
    "OPTIONS — Describe allowed methods (CORS preflight)",
    "200 OK | 201 Created | 204 No Content | 301 Moved Permanently | 304 Not Modified",
    "400 Bad Request | 401 Unauthorized | 403 Forbidden | 404 Not Found | 429 Too Many Requests",
    "500 Internal Server Error | 502 Bad Gateway | 503 Service Unavailable | 504 Gateway Timeout",
    "Cache-Control: max-age=3600, public — cache for 1 hour everywhere",
    "Cache-Control: no-cache — store but revalidate every time",
    "Cache-Control: no-store — never store",
    "ETag: \"abc\" + If-None-Match: \"abc\" → 304 (not modified)",
    "HTTP/1.1: text, one req/conn at a time, 6-8 conns per origin",
    "HTTP/2: binary frames, multiplexed streams, HPACK, one TCP conn",
    "HTTP/3: QUIC over UDP, per-stream reliability, 0-RTT, conn migration",
    "curl -v --http2 URL — inspect HTTP/2 negotiation and headers",
  ],
  resources: [
    { label: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110", kind: "docs", note: "The definitive specification for HTTP methods, status codes, headers, and content negotiation." },
    { label: "RFC 9113 — HTTP/2", url: "https://www.rfc-editor.org/rfc/rfc9113", kind: "docs", note: "HTTP/2 protocol specification including framing, multiplexing, and HPACK." },
    { label: "RFC 9114 — HTTP/3", url: "https://www.rfc-editor.org/rfc/rfc9114", kind: "docs", note: "HTTP/3 specification defining how HTTP maps onto QUIC." },
    { label: "RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport", url: "https://www.rfc-editor.org/rfc/rfc9000", kind: "docs", note: "The QUIC transport protocol that HTTP/3 runs on." },
    { label: "High Performance Browser Networking by Ilya Grigorik", url: "https://hpbn.co/", kind: "book", note: "Excellent coverage of HTTP/1.1, HTTP/2, TLS, and network performance — freely available online at hpbn.co." },
    { label: "HTTP/2 in Action by Barry Pollard", kind: "book", note: "Practical guide to HTTP/2 with real-world deployment advice." },
    { label: "HTTP Crash Course (Traversy Media)", kind: "video", note: "Beginner-friendly introduction to HTTP methods, status codes, and headers." },
    { label: "The QUIC Transport Protocol: Design and Internet-Scale Deployment (Google)", kind: "paper", note: "Google's paper on deploying QUIC at scale — covers design decisions and performance results." },
    { label: "MDN Web Docs — HTTP", url: "https://developer.mozilla.org/", kind: "docs", note: "Comprehensive, accessible reference for all HTTP concepts, headers, and status codes." },
    { label: "curl/curl — GitHub", kind: "repo", note: "The curl source code and documentation — the best CLI tool for HTTP debugging." },
  ],
  glossary: [
    { term: "HTTP", definition: "Hypertext Transfer Protocol — the application-layer protocol for transferring hypermedia documents (HTML, JSON, etc.) between clients and servers." },
    { term: "HTTPS", definition: "HTTP over TLS — encrypts the HTTP connection to provide confidentiality, integrity, and server authentication." },
    { term: "Idempotent", definition: "A method is idempotent if making the same request multiple times has the same effect as making it once. GET, PUT, DELETE, and HEAD are idempotent; POST is not." },
    { term: "Safe method", definition: "A method that does not modify server state. GET, HEAD, and OPTIONS are safe methods." },
    { term: "HPACK", definition: "HTTP/2's header compression algorithm using static/dynamic tables and Huffman coding to reduce repetitive header overhead." },
    { term: "QPACK", definition: "HTTP/3's header compression algorithm — an evolution of HPACK designed for QUIC's out-of-order delivery model." },
    { term: "QUIC", definition: "A UDP-based transport protocol with built-in TLS 1.3, per-stream reliable delivery, and connection migration. The transport layer for HTTP/3." },
    { term: "Multiplexing", definition: "Sending multiple independent request/response streams over a single connection simultaneously, interleaving their frames." },
    { term: "Head-of-line (HOL) blocking", definition: "When a slow or lost item at the front of a queue delays all items behind it. Occurs at HTTP level in HTTP/1.1 and at TCP level in HTTP/2." },
    { term: "ETag", definition: "Entity tag — an opaque identifier (often a content hash) assigned by the server to a specific version of a resource, used for conditional requests and cache validation." },
    { term: "CORS", definition: "Cross-Origin Resource Sharing — a mechanism that uses HTTP headers to let a server indicate which origins are permitted to read its resources from a browser." },
    { term: "ALPN", definition: "Application-Layer Protocol Negotiation — a TLS extension that lets client and server agree on the application protocol (h2, http/1.1) during the TLS handshake." },
    { term: "0-RTT", definition: "Zero Round Trip Time resumption — a QUIC feature allowing a returning client to send application data in its first packet using cached session keys." },
    { term: "Connection migration", definition: "A QUIC feature where connections survive network changes (WiFi to cellular) because they're identified by Connection IDs rather than IP/port tuples." },
  ],
};
