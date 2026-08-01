import type { TopicContent } from "../types";

export const rest: TopicContent = {
  quickSummary: [
    "REST (Representational State Transfer) is an architectural style for building web APIs using HTTP verbs (GET, POST, PUT, DELETE) to perform CRUD operations on resources identified by URLs.",
    "A RESTful API is stateless — each request contains all the information needed to process it. The server holds no client session state between requests.",
    "REST emphasizes uniform interfaces, resource-based URLs (/users/42), proper HTTP status codes, and hypermedia (HATEOAS) for discoverability.",
  ],
  detailed: [
    "REST was defined by Roy Fielding in his 2000 doctoral dissertation as a set of architectural constraints for building scalable web services. It is not a protocol or standard — it is a style that leverages the existing semantics of HTTP. A resource is any concept that can be named (/users, /orders/123, /products?category=electronics) and is represented in formats like JSON or XML.",
    "The key constraints are: (1) Client-Server separation of concerns, (2) Statelessness — no server-side session; every request is self-contained, (3) Cacheability — responses must declare whether they can be cached, (4) Uniform Interface — resources are identified by URIs, manipulated through representations, use self-descriptive messages, and optionally support HATEOAS, (5) Layered System — intermediaries (proxies, load balancers) can be inserted transparently, (6) Code on Demand (optional) — servers can extend client functionality via scripts.",
    "HTTP methods map to operations: GET retrieves a resource (safe, idempotent), POST creates a new resource (not idempotent), PUT replaces a resource entirely (idempotent), PATCH partially updates a resource, DELETE removes a resource (idempotent). Using the correct method is essential — GET requests must never cause side effects, and idempotent methods (GET, PUT, DELETE) must be safe to retry.",
    "HTTP status codes communicate outcomes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error, 503 Service Unavailable. Using the right status code makes APIs predictable and machine-readable.",
    "Resource naming follows conventions: use nouns not verbs (/users not /getUsers), use plural forms (/users/42 not /user/42), nest for relationships (/users/42/orders), use query parameters for filtering and sorting (/products?category=books&sort=price). Keep URLs lowercase, use hyphens not underscores, and avoid file extensions.",
  ],
  deepDive: [
    "Most APIs called 'RESTful' are actually RPC-over-HTTP — they use HTTP as a transport but don't follow REST constraints. True REST includes HATEOAS (Hypermedia as the Engine of Application State), where responses include links to related actions. For example, a GET /orders/42 response would include links like {'cancel': '/orders/42/cancel', 'pay': '/orders/42/pay'}. In practice, very few APIs implement HATEOAS because it adds complexity and most clients are purpose-built anyway. The Richardson Maturity Model grades APIs from Level 0 (RPC, one endpoint) to Level 3 (full HATEOAS).",
    "Content negotiation lets clients specify their preferred format. The Accept header says what the client wants (application/json, application/xml), and the Content-Type header says what the server sent. This is more flexible than hardcoding JSON, though in practice JSON dominates. API versioning can be done via URL path (/v2/users), custom header (Api-Version: 2), Accept header (Accept: application/vnd.myapi.v2+json), or query parameter (?version=2). URL-based versioning is the most common because it's the most visible.",
    "Pagination prevents returning unbounded collections. Offset-based pagination (GET /users?offset=20&limit=10) is simple but slow for deep pages (the DB must scan and skip rows). Cursor-based pagination (GET /users?after=abc123&limit=10) is faster and consistent under concurrent writes. The response should include pagination metadata: total count, next/previous links, or the next cursor.",
    "Caching is REST's superpower. GET responses with proper Cache-Control headers can be cached by browsers, CDNs, and proxies without any application logic. ETags enable conditional requests: the server sends an ETag with the response, and the client sends If-None-Match on subsequent requests — the server returns 304 Not Modified if the resource hasn't changed, saving bandwidth and processing.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Express.js RESTful API with proper status codes and verbs",
      source: `const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// GET /users - List all users (200)
app.get('/users', (req, res) => {
  const { role, sort } = req.query;
  let result = users;
  if (role) result = result.filter(u => u.role === role);
  if (sort) result = result.sort((a, b) => a[sort] > b[sort] ? 1 : -1);
  res.json({ data: result, total: result.length });
});

// GET /users/:id - Get one user (200 or 404)
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /users - Create a user (201)
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const user = { id: users.length + 1, name, email };
  users.push(user);
  res.status(201).location(\`/users/\${user.id}\`).json(user);
});

// PUT /users/:id - Replace a user (200 or 404)
app.put('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx] = { id: +req.params.id, ...req.body };
  res.json(users[idx]);
});

// DELETE /users/:id - Delete a user (204 or 404)
app.delete('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.status(204).end();
});`,
    },
  ],
  diagrams: [
    {
      title: "REST Resource Hierarchy",
      kind: "architecture",
      caption: "REST APIs model resources as a hierarchy with consistent URL patterns. Collections contain items; items can have nested sub-resources.",
      mermaid: `graph TD
    Root["/"] --> Users["/users"]
    Root --> Products["/products"]
    Users --> UserItem["/users/:id"]
    UserItem --> Orders["/users/:id/orders"]
    Orders --> OrderItem["/users/:id/orders/:orderId"]
    Products --> ProductItem["/products/:id"]
    ProductItem --> Reviews["/products/:id/reviews"]`,
    },
    {
      title: "HTTP Methods and CRUD Mapping",
      kind: "architecture",
      caption: "REST maps HTTP verbs to CRUD operations. GET reads, POST creates, PUT replaces, PATCH partially updates, and DELETE removes resources.",
      mermaid: `graph LR
    subgraph Collection["Collection /users"]
      GET_C["GET - list all users"]
      POST_C["POST - create user"]
    end
    subgraph Item["Item /users/123"]
      GET_I["GET - get user 123"]
      PUT_I["PUT - replace user 123"]
      PATCH_I["PATCH - partial update"]
      DELETE_I["DELETE - remove user 123"]
    end`,
    },
    {
      title: "REST Request-Response Flow",
      kind: "sequence",
      caption: "A typical REST API request and response cycle showing headers, content negotiation, status codes, and hypermedia links.",
      mermaid: `sequenceDiagram
    participant Client
    participant API as REST API
    participant Auth as Auth Middleware
    participant DB as Database

    Client->>API: GET /users/123 - Accept: application/json
    API->>Auth: Validate Bearer token
    Auth-->>API: User authenticated - role: admin
    API->>DB: SELECT * FROM users WHERE id=123
    DB-->>API: User record
    API-->>Client: 200 OK - JSON body - ETag header
    Client->>API: PUT /users/123 - If-Match: etag-value
    API->>DB: UPDATE users WHERE id=123
    DB-->>API: Updated
    API-->>Client: 200 OK - updated resource`,
    },
    {
      title: "REST Maturity Model",
      kind: "flow",
      caption: "Richardson Maturity Model levels: Level 0 uses HTTP as tunnel, Level 1 adds resources, Level 2 adds verbs and status codes, Level 3 adds HATEOAS.",
      mermaid: `flowchart TD
    L0[Level 0 - One endpoint - POST for everything] --> L1
    L1[Level 1 - Multiple resource URIs] --> L2
    L2[Level 2 - HTTP verbs + status codes] --> L3
    L3[Level 3 - HATEOAS - hypermedia links in responses]
    L0 -->|Example| E0[POST /api - action: getUser]
    L1 -->|Example| E1[GET /users/123]
    L2 -->|Example| E2[DELETE /users/123 returns 204]
    L3 -->|Example| E3[Response includes links to related resources]`,
    },
  ],
  animations: [
    {
      title: "RESTful CRUD lifecycle",
      steps: [
        { label: "POST /users", detail: "Client sends a JSON body with user data. Server creates the resource, returns 201 Created with a Location header pointing to the new resource." },
        { label: "GET /users/42", detail: "Client retrieves the newly created user. Server returns 200 OK with the JSON representation." },
        { label: "PUT /users/42", detail: "Client sends the full updated user object. Server replaces the resource entirely, returns 200 OK." },
        { label: "PATCH /users/42", detail: "Client sends only the fields to change. Server applies the partial update, returns 200 OK." },
        { label: "DELETE /users/42", detail: "Client requests deletion. Server removes the resource, returns 204 No Content." },
        { label: "GET /users/42", detail: "Client tries to retrieve the deleted user. Server returns 404 Not Found." },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "REST", "GraphQL", "gRPC"],
    rows: [
      ["Protocol", "HTTP/1.1 or HTTP/2", "HTTP (POST only)", "HTTP/2"],
      ["Data format", "JSON (typically)", "JSON", "Protocol Buffers (binary)"],
      ["Contract", "OpenAPI/Swagger", "Schema (SDL)", "Proto files"],
      ["Caching", "HTTP caching built-in", "Complex (POST requests)", "No built-in HTTP caching"],
      ["Over/under-fetching", "Common problem", "Solved — client picks fields", "Fixed per-RPC"],
      ["Best for", "CRUD APIs, public APIs", "Complex UIs, mobile apps", "Internal services, streaming"],
      ["Learning curve", "Low", "Medium", "High"],
    ],
  },
  interviewQA: [
    {
      q: "What makes an API truly RESTful?",
      a: "A truly RESTful API follows the six constraints defined by Fielding: client-server separation, statelessness, cacheability, uniform interface (resource identification via URIs, manipulation through representations, self-descriptive messages, and HATEOAS), layered system, and optional code-on-demand. Most APIs called 'RESTful' actually only follow some constraints — they use HTTP verbs and resource-based URLs but skip HATEOAS. The Richardson Maturity Model classifies APIs from Level 0 (one endpoint, RPC) to Level 3 (full hypermedia).",
      followUps: [
        "What is HATEOAS and why do most APIs skip it? (Responses include links to available actions. Most skip it because clients are purpose-built and the discoverability benefit doesn't justify the complexity.)",
        "Is statelessness always achievable? (Yes for the API layer — session state moves to tokens or external stores, but the server never holds per-client state in memory between requests.)",
      ],
    },
    {
      q: "What is the difference between PUT and PATCH?",
      a: "PUT replaces the entire resource — you must send all fields, and any omitted field is set to null/default. PATCH applies a partial update — you send only the fields that changed. PUT is idempotent by definition (calling it twice with the same body produces the same result). PATCH can be idempotent but isn't required to be (e.g., a PATCH that appends to a list is not idempotent).",
      followUps: [
        "When would you use POST vs PUT for creation? (POST when the server assigns the ID: POST /users. PUT when the client specifies the ID: PUT /users/42. PUT is idempotent so retries are safe.)",
      ],
    },
    {
      q: "How do you handle errors in a REST API?",
      a: "Use the correct HTTP status code (400 for bad input, 401 for missing auth, 403 for insufficient permissions, 404 for not found, 409 for conflicts, 422 for validation failures, 500 for server errors). Return a consistent error body with a machine-readable code, human-readable message, and optionally field-level details for validation errors. Example: { error: 'VALIDATION_FAILED', message: 'Email is required', details: [{ field: 'email', message: 'required' }] }.",
    },
  ],
  followUps: [
    "How do you version a REST API without breaking existing clients?",
    "What is idempotency and which HTTP methods are idempotent?",
    "How do you implement pagination — offset vs cursor-based?",
    "What is content negotiation and how does the Accept header work?",
    "REST vs GraphQL — when would you choose each?",
  ],
  mcqs: [
    {
      q: "Which HTTP method is NOT idempotent?",
      options: ["GET", "PUT", "POST", "DELETE"],
      answerIndex: 2,
      explanation: "POST is not idempotent — calling POST /users twice creates two users. GET, PUT, and DELETE are idempotent: repeating them produces the same result.",
    },
    {
      q: "What is the correct status code for a successful resource creation?",
      options: ["200 OK", "201 Created", "204 No Content", "202 Accepted"],
      answerIndex: 1,
      explanation: "201 Created indicates that the request succeeded and a new resource was created. The response should include a Location header with the URL of the new resource.",
    },
    {
      q: "Which URL pattern follows REST naming conventions?",
      options: ["GET /getUser?id=42", "GET /users/42", "GET /api/user/get/42", "POST /users/fetch"],
      answerIndex: 1,
      explanation: "REST uses nouns (not verbs) as resource identifiers. /users/42 identifies a specific user resource. The HTTP method (GET) defines the action.",
    },
  ],
  exercises: [
    "Design a REST API for a blog platform: define resources, URLs, methods, request/response bodies, and status codes for posts, comments, and tags.",
    "Implement cursor-based pagination for a GET /products endpoint that returns 20 items per page with next/previous cursors.",
    "Add ETag-based conditional GET to an existing endpoint. Return 304 Not Modified when the resource hasn't changed.",
    "Refactor an RPC-style API (/createUser, /deleteUser, /updateUser) into a RESTful API with proper resource URLs and methods.",
  ],
  flashcards: [
    { front: "What does REST stand for?", back: "Representational State Transfer — an architectural style defined by Roy Fielding in 2000." },
    { front: "What makes GET 'safe'?", back: "GET must not cause side effects. It only retrieves data and can be cached, bookmarked, and retried freely." },
    { front: "What is idempotency?", back: "An operation that produces the same result regardless of how many times it's called. GET, PUT, DELETE are idempotent; POST is not." },
    { front: "201 Created vs 200 OK", back: "201 means a new resource was created (include Location header). 200 means the request succeeded for an existing resource operation." },
    { front: "PUT vs PATCH", back: "PUT replaces the entire resource (must send all fields). PATCH partially updates the resource (send only changed fields)." },
  ],
  revisionNotes: [
    "REST = architectural style using HTTP verbs on resource URLs. Not a protocol.",
    "Six constraints: client-server, stateless, cacheable, uniform interface, layered, code-on-demand (optional).",
    "Methods: GET (read, safe, idempotent), POST (create, not idempotent), PUT (replace, idempotent), PATCH (partial update), DELETE (remove, idempotent).",
    "URLs: nouns not verbs, plural, lowercase, nested for relationships. /users/42/orders.",
    "Status codes: 2xx success, 4xx client error, 5xx server error. Be specific: 201, 204, 400, 401, 403, 404, 409, 422.",
  ],
  cheatSheet: [
    "GET /resources → list (200) | GET /resources/:id → read (200/404)",
    "POST /resources → create (201 + Location) | PUT /resources/:id → replace (200/404)",
    "PATCH /resources/:id → partial update (200) | DELETE /resources/:id → remove (204/404)",
    "Pagination: ?limit=20&after=cursor_abc or ?offset=0&limit=20",
    "Filtering: ?status=active&sort=created_at&order=desc",
    "Versioning: /v2/resources (URL) or Accept: application/vnd.api.v2+json (header)",
  ],
  resources: [
    { label: "Roy Fielding's Dissertation, Chapter 5", kind: "paper", note: "The original definition of REST — the primary source." },
    { label: "REST API Design Rulebook (O'Reilly)", kind: "book", note: "Practical naming conventions, versioning, error handling." },
    { label: "Microsoft REST API Guidelines", kind: "docs", note: "Well-structured enterprise REST conventions." },
    { label: "JSONPlaceholder", kind: "repo", note: "Free fake REST API for testing and prototyping." },
  ],
  glossary: [
    { term: "Resource", definition: "Any concept that can be named and identified by a URI — users, orders, products, sessions." },
    { term: "Representation", definition: "A specific rendering of a resource's state (JSON, XML, HTML) sent in the request or response body." },
    { term: "HATEOAS", definition: "Hypermedia as the Engine of Application State — responses include links to available actions, making the API self-documenting." },
    { term: "Idempotent", definition: "An operation that produces the same result regardless of how many times it's applied." },
    { term: "Content negotiation", definition: "Client and server agreeing on the response format via Accept and Content-Type headers." },
  ],
};
