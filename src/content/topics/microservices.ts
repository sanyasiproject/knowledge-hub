import type { TopicContent } from "../types";

export const microservices: TopicContent = {
  quickSummary: [
    "Microservices architecture decomposes applications into small, independently deployable services, each owning its own data and business logic.",
    "Inter-service communication happens via synchronous (REST, gRPC) or asynchronous (message queues, event streams) mechanisms, each with distinct trade-offs.",
    "A service mesh (e.g., Istio, Linkerd) provides infrastructure-level capabilities like traffic management, observability, and mutual TLS without changing application code.",
    "Key challenges include distributed data management, network reliability, operational complexity, and ensuring end-to-end observability across dozens or hundreds of services.",
  ],
  detailed: [
    `## Service Boundaries and Decomposition

Defining the right service boundaries is the most critical design decision in a microservices architecture. A well-bounded service encapsulates a single business capability and owns its data store (Database-per-Service pattern). Boundaries are typically derived from Domain-Driven Design bounded contexts.

**Decomposition strategies:**
- **By business capability** -- align services to organizational functions (e.g., Order Management, Inventory, Payments).
- **By subdomain** -- identify core, supporting, and generic subdomains and carve services accordingly.
- **Strangler Fig pattern** -- incrementally extract services from a monolith by intercepting calls at the edge.

A service should be small enough to be owned by a single team but large enough to represent a meaningful business function. The "two-pizza team" heuristic is a useful but imperfect proxy.`,

    `## Inter-Service Communication

Communication between microservices falls into two broad categories:

**Synchronous (request-response):**
- REST over HTTP -- widely understood, tooling-rich, but chatty for complex workflows.
- gRPC -- binary protocol with strong typing via Protocol Buffers; lower latency, streaming support, but harder to debug.

**Asynchronous (event-driven):**
- Message queues (RabbitMQ, SQS) -- point-to-point delivery with guaranteed ordering within a queue.
- Event streams (Kafka, Kinesis) -- durable, replayable log; enables event sourcing and CQRS patterns.

**Key considerations:**
- Synchronous calls introduce temporal coupling; cascading failures propagate through call chains.
- Asynchronous messaging improves resilience but adds eventual consistency and idempotency requirements.
- The Saga pattern coordinates distributed transactions across services using a sequence of local transactions and compensating actions.`,

    `## Service Mesh

A service mesh is a dedicated infrastructure layer that manages service-to-service communication. It deploys a sidecar proxy (e.g., Envoy) alongside each service instance.

**Core capabilities:**
- **Traffic management** -- canary releases, A/B testing, circuit breaking, retries with jitter, rate limiting.
- **Security** -- mutual TLS (mTLS) encryption, fine-grained authorization policies, certificate rotation.
- **Observability** -- distributed tracing, metrics collection, access logging without code instrumentation.

**Popular implementations:**
- Istio -- feature-rich but operationally heavy; strong policy and security model.
- Linkerd -- lightweight, Rust-based data plane; easier to operate; focuses on simplicity.
- AWS App Mesh -- managed service mesh for AWS workloads.

A service mesh adds latency (typically 1-3 ms per hop) and operational complexity. Evaluate whether your scale justifies the investment.`,

    `## Challenges and Mitigation

**Distributed data management:**
- No cross-service joins; use API composition or CQRS read models.
- Eventual consistency requires careful UX design (e.g., optimistic UI updates).

**Network reliability:**
- Apply the circuit breaker pattern (Hystrix, Resilience4j) to prevent cascading failures.
- Implement retries with exponential backoff and jitter.
- Design for idempotency on all write endpoints.

**Operational complexity:**
- Centralized logging (ELK, Datadog) and distributed tracing (Jaeger, Zipkin) are non-negotiable.
- Container orchestration (Kubernetes) simplifies deployment but has a steep learning curve.
- Feature flags and progressive delivery reduce blast radius of deployments.

**Testing:**
- Contract testing (Pact) validates API compatibility between producer and consumer.
- Integration and end-to-end tests are expensive; invest in strong unit and contract tests.
- Use consumer-driven contracts to decouple release cycles.`,

    `## When to Use Microservices

Microservices are not universally superior to monoliths. Consider microservices when:
- The application has multiple distinct business domains with different scaling requirements.
- Multiple teams need to deploy independently and frequently.
- You need technology heterogeneity (different languages or databases for different services).

Stick with a modular monolith when:
- The team is small (fewer than 10 engineers).
- The domain is not well understood yet and boundaries are likely to shift.
- Operational maturity (CI/CD, monitoring, container orchestration) is low.

Martin Fowler's "Monolith First" advice remains sound: start simple, extract services when the pain of the monolith outweighs the complexity of distribution.`,
  ],
  interviewQA: [
    {
      q: "How do you determine the right boundaries for a microservice?",
      a: "Start with Domain-Driven Design: identify bounded contexts through event storming or domain modeling workshops with domain experts. Each bounded context is a candidate service boundary. Validate by checking that the service owns its data, can be deployed independently, and maps to a single team's ownership. Avoid splitting too finely -- a service should represent a meaningful business capability, not a single CRUD entity.",
    },
    {
      q: "What are the trade-offs between synchronous and asynchronous inter-service communication?",
      a: "Synchronous communication (REST, gRPC) is simpler to reason about and debug but creates temporal coupling -- if the downstream service is unavailable, the caller fails. Asynchronous communication (message queues, event streams) decouples services in time, improving resilience and enabling event-driven architectures, but introduces eventual consistency, requires idempotent consumers, and makes debugging harder due to non-linear execution flows. Most production systems use a mix of both.",
    },
    {
      q: "How do you handle distributed transactions across microservices?",
      a: "Avoid distributed transactions (2PC) in microservices because they create tight coupling and reduce availability. Instead, use the Saga pattern: each service performs a local transaction and publishes an event; subsequent services react to the event and perform their own local transactions. If a step fails, compensating transactions undo the previous steps. Sagas can be orchestrated (a central coordinator directs the flow) or choreographed (services react to events independently). Orchestration is easier to reason about; choreography is more loosely coupled.",
    },
    {
      q: "What is a service mesh and when would you introduce one?",
      a: "A service mesh is an infrastructure layer that handles service-to-service communication concerns -- traffic routing, load balancing, mutual TLS, retries, circuit breaking, and observability -- via sidecar proxies deployed alongside each service. Introduce one when you have a significant number of services (typically 20+), need consistent security policies across services, or require advanced traffic management (canary deployments, traffic mirroring) without modifying application code. For smaller deployments, library-based solutions (Resilience4j, Polly) may suffice with less operational overhead.",
    },
  ],
  mcqs: [
    {
      q: "Which pattern is most appropriate for handling distributed transactions in a microservices architecture?",
      options: [
        "Two-Phase Commit (2PC)",
        "Saga pattern with compensating transactions",
        "Distributed lock manager",
        "Global transaction coordinator",
      ],
      answerIndex: 1,
      explanation:
        "The Saga pattern is preferred in microservices because it avoids the tight coupling and availability issues of 2PC. Each service performs a local transaction and publishes events; compensating transactions handle rollback scenarios.",
    },
    {
      q: "What is the primary benefit of the Database-per-Service pattern?",
      options: [
        "Simplified cross-service queries",
        "Reduced storage costs through shared schemas",
        "Independent data evolution and loose coupling between services",
        "Automatic data consistency across services",
      ],
      answerIndex: 2,
      explanation:
        "Database-per-Service ensures each service can evolve its data schema independently without coordinating with other teams. The trade-off is that cross-service queries require API composition or CQRS read models.",
    },
    {
      q: "What does a service mesh sidecar proxy handle?",
      options: [
        "Business logic execution and data transformation",
        "Database connection pooling and query optimization",
        "Traffic management, mTLS, and observability at the network level",
        "Application-level caching and session management",
      ],
      answerIndex: 2,
      explanation:
        "A sidecar proxy (e.g., Envoy) intercepts all network traffic to and from a service, handling cross-cutting concerns like routing, encryption, retries, and metrics collection transparently to the application.",
    },
    {
      q: "Which communication pattern best supports temporal decoupling between services?",
      options: [
        "Synchronous REST calls with retries",
        "gRPC with bidirectional streaming",
        "Asynchronous messaging via an event broker",
        "Direct database sharing between services",
      ],
      answerIndex: 2,
      explanation:
        "Asynchronous messaging via an event broker (e.g., Kafka, RabbitMQ) decouples services in time -- the producer and consumer do not need to be available simultaneously. This improves resilience and enables event-driven architectures.",
    },
  ],
  flashcards: [
    {
      front: "What is the Strangler Fig pattern?",
      back: "An incremental migration strategy where new functionality is built as microservices while existing monolith functionality is gradually replaced. An edge layer routes requests to either the monolith or the new service based on the migration progress.",
    },
    {
      front: "What is the Circuit Breaker pattern?",
      back: "A resilience pattern that monitors failures to a downstream service. When failures exceed a threshold, the circuit 'opens' and requests fail fast without calling the downstream service, preventing cascading failures. After a timeout, the circuit enters 'half-open' state to test recovery.",
    },
    {
      front: "What is consumer-driven contract testing?",
      back: "A testing approach where the consumer of an API defines a contract specifying the interactions it expects. The provider verifies it satisfies all consumer contracts. This decouples release cycles while ensuring API compatibility. Pact is a popular framework for this.",
    },
    {
      front: "What is the Sidecar pattern?",
      back: "A deployment pattern where a helper container (sidecar) is co-deployed alongside the main application container in the same pod. The sidecar handles cross-cutting concerns like logging, monitoring, or networking (as in a service mesh) without modifying the application.",
    },
    {
      front: "Orchestration vs. Choreography in Sagas",
      back: "Orchestration uses a central coordinator that directs each participant; easier to understand and monitor but creates a single point of coupling. Choreography has each service react to events independently; more decoupled but harder to trace and debug the overall flow.",
    },
    {
      front: "What is API Composition?",
      back: "A query pattern for microservices where an API composer service calls multiple downstream services, collects their responses, and joins the data in memory. It replaces cross-service database joins that are not possible with Database-per-Service.",
    },
    {
      front: "What is the Bulkhead pattern?",
      back: "A resilience pattern that isolates components into pools (like compartments in a ship) so that a failure in one does not cascade to others. For example, using separate thread pools or connection pools for calls to different downstream services.",
    },
  ],
  deepDive: [
    `## The Evolution from Monolith to Microservices

The journey toward **microservices** did not happen overnight -- it represents decades of architectural evolution driven by the need for **scalability**, **team autonomy**, and **deployment velocity**. In the early 2000s, *Service-Oriented Architecture (SOA)* introduced the idea of decomposing applications into services, but SOA was weighed down by heavyweight middleware like **Enterprise Service Buses (ESBs)**, rigid \`WSDL\` contracts, and centralized governance. Microservices emerged as a pragmatic reaction: instead of smart pipes and dumb endpoints, microservices favor *dumb pipes* (HTTP, lightweight messaging) and *smart endpoints* (each service owns its logic end-to-end). The cultural shift is equally important -- microservices align with **Conway's Law**, structuring software around small, cross-functional teams that own the full lifecycle of their services, from development through production operations. Organizations like *Netflix*, *Amazon*, and *Uber* demonstrated that this model could scale to thousands of services, but they also revealed the enormous **operational investment** required: sophisticated CI/CD pipelines, container orchestration (\`Kubernetes\`), centralized observability platforms, and dedicated platform engineering teams. The lesson is clear -- microservices are not a technology choice alone; they are an **organizational and operational commitment**.`,

    `## Data Management in a Distributed World

One of the most underestimated challenges in microservices is **distributed data management**. The *Database-per-Service* pattern ensures loose coupling, but it eliminates the ability to perform cross-service \`JOIN\` queries or rely on **ACID transactions** spanning multiple services. Teams must embrace **eventual consistency** as a first-class design principle, which fundamentally changes how applications behave. The **Saga pattern** replaces distributed transactions: each service executes a local transaction and publishes a domain event; downstream services react and perform their own local transactions, with *compensating actions* defined for rollback scenarios. Two orchestration styles exist -- **orchestration** (a central coordinator like a \`SagaOrchestrator\` service directs the flow) and **choreography** (services independently react to events via a message broker like \`Kafka\` or \`RabbitMQ\`). For read-heavy workloads, the **CQRS** pattern separates the write model from optimized read projections, often materialized asynchronously through event streams. Data consistency boundaries become **explicit API contracts** rather than implicit database schemas. Teams must invest heavily in *idempotency keys*, *deduplication logic*, and *conflict resolution strategies* to handle the realities of unreliable networks and at-least-once message delivery.`,

    `## Observability, Resilience, and the Platform Tax

Operating a microservices architecture at scale demands a **robust observability stack** and deliberate **resilience engineering**. The three pillars of observability -- *structured logs*, *distributed traces*, and *metrics* -- must be implemented consistently across every service. Tools like \`OpenTelemetry\` provide vendor-neutral instrumentation, while platforms like **Datadog**, **Grafana + Loki + Tempo**, or the **ELK stack** aggregate and correlate signals. Without **distributed tracing** (propagating a \`trace-id\` header across all service calls), debugging a failure in a chain of 10+ services becomes nearly impossible. Resilience patterns are equally critical: the **circuit breaker** (\`Resilience4j\`, \`Polly\`) prevents cascading failures by short-circuiting calls to unhealthy dependencies; the **bulkhead pattern** isolates failure domains using separate thread pools or connection pools; **retries with exponential backoff and jitter** handle transient failures without creating thundering herds. The aggregate cost of these cross-cutting concerns is often called the *platform tax* -- the investment in CI/CD pipelines, container orchestration (\`Kubernetes\`), service meshes (\`Istio\`, \`Linkerd\`), secret management (\`Vault\`), and feature flag systems (\`LaunchDarkly\`) that must exist before a single line of business logic can be deployed safely. Organizations must honestly assess whether their **operational maturity** justifies this tax before adopting microservices.`,
  ],

  code: [
    {
      language: "typescript",
      caption: "Express.js microservice with MongoDB connection, health check, and graceful shutdown",
      source: `import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// --- MongoDB Connection with retry logic ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/orders";

async function connectWithRetry(retries = 5, delay = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log(\`[OrderService] Connected to MongoDB on attempt \${attempt}\`);
      return;
    } catch (err) {
      console.error(\`[OrderService] MongoDB connection attempt \${attempt} failed\`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * attempt)); // exponential backoff
    }
  }
}

// --- Domain Model ---
const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  items: [{ productId: String, quantity: Number, price: Number }],
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED"],
    default: "PENDING",
  },
  idempotencyKey: { type: String, unique: true }, // prevent duplicate orders
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

// --- Health Check Endpoint (for Kubernetes liveness/readiness probes) ---
app.get("/health", (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  res.status(dbState === "UP" ? 200 : 503).json({
    service: "order-service",
    status: dbState,
    timestamp: new Date().toISOString(),
  });
});

// --- Create Order (idempotent) ---
app.post("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, idempotencyKey } = req.body;

    // Idempotency check -- return existing order if key matches
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return res.status(200).json(existing);
    }

    const order = await Order.create({ customerId, items, idempotencyKey });
    // In production: publish OrderCreated event to Kafka/RabbitMQ here
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// --- Get Orders by Customer ---
app.get("/orders/:customerId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// --- Centralized Error Handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[OrderService] Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// --- Graceful Shutdown ---
async function shutdown(signal: string) {
  console.log(\`[OrderService] Received \${signal}, shutting down gracefully...\`);
  await mongoose.connection.close();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// --- Start ---
const PORT = process.env.PORT || 3001;
connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(\`[OrderService] Listening on port \${PORT}\`));
});`,
    },
    {
      language: "cpp",
      caption: "High-performance C++ microservice for real-time pricing calculations using gRPC",
      source: `// pricing_service.cpp -- A performance-critical pricing engine
// exposed as a gRPC service for sub-millisecond latency requirements.
// Build: g++ -std=c++20 -O3 -o pricing_service pricing_service.cpp -lgrpc++ -lprotobuf -lpthread

#include <grpcpp/grpcpp.h>
#include <unordered_map>
#include <shared_mutex>
#include <vector>
#include <numeric>
#include <chrono>
#include <iostream>

// Generated from pricing.proto (simplified inline for illustration)
namespace pricing {
  struct PriceRequest {
    std::string product_id;
    int quantity;
    std::string customer_tier; // "standard" | "premium" | "enterprise"
  };

  struct PriceResponse {
    double unit_price;
    double discount_pct;
    double total;
    int64_t computation_us; // microseconds taken
  };
}

// --- Thread-safe in-memory price cache with reader-writer lock ---
class PriceCache {
public:
  void update(const std::string& product_id, double base_price) {
    std::unique_lock lock(mutex_);
    prices_[product_id] = base_price;
  }

  std::optional<double> lookup(const std::string& product_id) const {
    std::shared_lock lock(mutex_);
    auto it = prices_.find(product_id);
    if (it != prices_.end()) return it->second;
    return std::nullopt;
  }

private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<std::string, double> prices_;
};

// --- Discount engine with tiered pricing ---
class DiscountEngine {
public:
  static double compute_discount(const std::string& tier, int quantity) {
    double base_discount = 0.0;

    // Tier-based discounts
    if (tier == "premium")          base_discount = 0.10;
    else if (tier == "enterprise")  base_discount = 0.20;

    // Volume discounts (stacking)
    if (quantity >= 1000)      base_discount += 0.15;
    else if (quantity >= 100)  base_discount += 0.08;
    else if (quantity >= 10)   base_discount += 0.03;

    return std::min(base_discount, 0.35); // cap at 35%
  }
};

// --- gRPC Service Implementation ---
class PricingServiceImpl final {
public:
  explicit PricingServiceImpl(PriceCache& cache) : cache_(cache) {}

  pricing::PriceResponse CalculatePrice(const pricing::PriceRequest& req) {
    auto start = std::chrono::high_resolution_clock::now();

    pricing::PriceResponse resp{};
    auto base_price = cache_.lookup(req.product_id);

    if (!base_price.has_value()) {
      // Fallback: fetch from database (omitted for brevity)
      resp.unit_price = 0.0;
      resp.total = 0.0;
      return resp;
    }

    resp.unit_price = base_price.value();
    resp.discount_pct = DiscountEngine::compute_discount(
        req.customer_tier, req.quantity);
    resp.total = resp.unit_price * req.quantity * (1.0 - resp.discount_pct);

    auto end = std::chrono::high_resolution_clock::now();
    resp.computation_us = std::chrono::duration_cast<
        std::chrono::microseconds>(end - start).count();

    return resp;
  }

private:
  PriceCache& cache_;
};

int main() {
  PriceCache cache;

  // Seed cache (in production, populated from a message queue subscriber)
  cache.update("SKU-001", 29.99);
  cache.update("SKU-002", 149.50);
  cache.update("SKU-003", 5.00);

  PricingServiceImpl service(cache);

  // Example calculation
  pricing::PriceRequest req{"SKU-002", 250, "enterprise"};
  auto resp = service.CalculatePrice(req);

  std::cout << "Unit price:    $" << resp.unit_price << "\\n"
            << "Discount:      " << (resp.discount_pct * 100) << "%\\n"
            << "Total:         $" << resp.total << "\\n"
            << "Computed in:   " << resp.computation_us << " us\\n";

  // In production: start gRPC server on port 50051
  // grpc::ServerBuilder builder;
  // builder.AddListeningPort("0.0.0.0:50051", grpc::InsecureServerCredentials());
  // builder.RegisterService(&service);
  // auto server = builder.BuildAndStart();
  // server->Wait();

  return 0;
}`,
    },
    {
      language: "typescript",
      caption: "API Gateway pattern -- request routing, rate limiting, and circuit breaker middleware",
      source: `import express, { Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";

const app = express();

// --- Service Registry (in production, use Consul or Kubernetes DNS) ---
const SERVICE_REGISTRY: Record<string, string> = {
  orders: "http://order-service:3001",
  pricing: "http://pricing-service:3002",
  inventory: "http://inventory-service:3003",
};

// --- Simple Rate Limiter (per-IP, sliding window) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;       // requests per window
const WINDOW_MS = 60 * 1000;  // 1 minute

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfterMs: entry.resetAt - now,
    });
  }

  entry.count++;
  next();
}

// --- Circuit Breaker ---
interface CircuitState {
  failures: number;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  nextRetryAt: number;
}

const circuits = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 30_000;

function getCircuit(service: string): CircuitState {
  if (!circuits.has(service)) {
    circuits.set(service, { failures: 0, state: "CLOSED", nextRetryAt: 0 });
  }
  return circuits.get(service)!;
}

function recordSuccess(service: string) {
  const circuit = getCircuit(service);
  circuit.failures = 0;
  circuit.state = "CLOSED";
}

function recordFailure(service: string) {
  const circuit = getCircuit(service);
  circuit.failures++;
  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = "OPEN";
    circuit.nextRetryAt = Date.now() + RECOVERY_TIMEOUT_MS;
    console.warn(\`[Gateway] Circuit OPEN for \${service}\`);
  }
}

// --- Proxy Handler ---
app.use(rateLimiter);

app.all("/api/:service/*", async (req: Request, res: Response) => {
  const serviceName = req.params.service;
  const baseUrl = SERVICE_REGISTRY[serviceName];

  if (!baseUrl) {
    return res.status(404).json({ error: \`Unknown service: \${serviceName}\` });
  }

  const circuit = getCircuit(serviceName);
  if (circuit.state === "OPEN") {
    if (Date.now() < circuit.nextRetryAt) {
      return res.status(503).json({
        error: \`Service \${serviceName} is temporarily unavailable (circuit open)\`,
      });
    }
    circuit.state = "HALF_OPEN"; // allow one probe request
  }

  try {
    const targetPath = req.params[0] || "";
    const response = await axios({
      method: req.method as any,
      url: \`\${baseUrl}/\${targetPath}\`,
      data: req.body,
      headers: {
        "x-request-id": req.headers["x-request-id"] || crypto.randomUUID(),
        "x-forwarded-for": req.ip,
      },
      timeout: 5000,
    });

    recordSuccess(serviceName);
    res.status(response.status).json(response.data);
  } catch (err) {
    recordFailure(serviceName);
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status || 502;
    res.status(status).json({
      error: \`Upstream error from \${serviceName}\`,
      status,
    });
  }
});

app.listen(8080, () => console.log("[API Gateway] Listening on port 8080"));`,
    },
  ],

  diagrams: [
    {
      title: "Microservices Architecture Overview",
      kind: "architecture",
      caption: "High-level view of a microservices system with API Gateway, service mesh sidecar proxies, message broker, and per-service databases.",
      mermaid: `graph TB
  Client[Client / Mobile App] -->|HTTPS| Gateway[API Gateway]

  subgraph Service Mesh
    Gateway -->|route| OS[Order Service]
    Gateway -->|route| PS[Pricing Service]
    Gateway -->|route| IS[Inventory Service]
    Gateway -->|route| NS[Notification Service]

    OS -->|gRPC| PS
    OS -->|async event| MB[(Message Broker<br/>Kafka / RabbitMQ)]
    MB -->|consume| IS
    MB -->|consume| NS
  end

  OS --- ODB[(Orders DB<br/>MongoDB)]
  PS --- PDB[(Pricing DB<br/>Redis)]
  IS --- IDB[(Inventory DB<br/>PostgreSQL)]
  NS --- NDB[(Notifications DB<br/>DynamoDB)]

  subgraph Observability
    OS -.->|traces, metrics, logs| OBS[OpenTelemetry Collector]
    PS -.-> OBS
    IS -.-> OBS
    NS -.-> OBS
    OBS --> Grafana[Grafana / Datadog]
  end`,
    },
    {
      title: "Order Saga -- Choreography Sequence",
      kind: "sequence",
      caption: "Sequence diagram showing a choreographed Saga for order processing with compensating transactions on failure.",
      mermaid: `sequenceDiagram
  participant C as Client
  participant OrdS as Order Service
  participant InvS as Inventory Service
  participant PayS as Payment Service
  participant NotS as Notification Service
  participant Broker as Message Broker

  C->>OrdS: POST /orders (create order)
  OrdS->>OrdS: Save order (status=PENDING)
  OrdS->>Broker: Publish OrderCreated

  Broker->>InvS: OrderCreated event
  InvS->>InvS: Reserve inventory
  alt Inventory Available
    InvS->>Broker: Publish InventoryReserved
    Broker->>PayS: InventoryReserved event
    PayS->>PayS: Process payment
    alt Payment Success
      PayS->>Broker: Publish PaymentCompleted
      Broker->>OrdS: PaymentCompleted event
      OrdS->>OrdS: Update order (status=CONFIRMED)
      Broker->>NotS: PaymentCompleted event
      NotS->>C: Send confirmation email
    else Payment Failed
      PayS->>Broker: Publish PaymentFailed
      Broker->>InvS: PaymentFailed event
      InvS->>InvS: Release reserved inventory (compensate)
      Broker->>OrdS: PaymentFailed event
      OrdS->>OrdS: Update order (status=CANCELLED)
    end
  else Inventory Unavailable
    InvS->>Broker: Publish InventoryInsufficient
    Broker->>OrdS: InventoryInsufficient event
    OrdS->>OrdS: Update order (status=CANCELLED)
    Broker->>NotS: InventoryInsufficient event
    NotS->>C: Send out-of-stock notification
  end`,
    },
    {
      title: "Circuit Breaker State Machine",
      kind: "state",
      caption: "State transitions for the circuit breaker resilience pattern showing CLOSED, OPEN, and HALF_OPEN states.",
      mermaid: `stateDiagram-v2
  [*] --> Closed
  Closed --> Open: Failure count >= threshold
  Closed --> Closed: Success / failure < threshold

  Open --> HalfOpen: Recovery timeout elapsed
  Open --> Open: Requests fail fast (no call made)

  HalfOpen --> Closed: Probe request succeeds
  HalfOpen --> Open: Probe request fails

  note right of Closed
    All requests pass through.
    Failures are counted.
  end note

  note right of Open
    Requests immediately rejected.
    Timer runs for recovery period.
  end note

  note right of HalfOpen
    One probe request allowed.
    Result determines next state.
  end note`,
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Microservices",
      "Monolith",
      "SOA (Service-Oriented Architecture)",
    ],
    rows: [
      [
        "**Deployment**",
        "Each service deployed *independently*; enables **continuous delivery** per team",
        "Entire application deployed as a *single unit*; any change requires full redeployment",
        "Services deployed independently but often share an **ESB** (Enterprise Service Bus)",
      ],
      [
        "**Scaling**",
        "*Fine-grained* horizontal scaling -- scale only the services under load",
        "*Coarse-grained* scaling -- must scale the entire application even if only one module is bottlenecked",
        "Services can scale independently, but ESB can become a **scaling bottleneck**",
      ],
      [
        "**Data Management**",
        "**Database-per-Service**; eventual consistency via Sagas and events",
        "**Shared database** with ACID transactions across all modules",
        "Shared or per-service databases; often relies on **distributed transactions (2PC)**",
      ],
      [
        "**Communication**",
        "Lightweight protocols: *REST*, *gRPC*, async *message queues*",
        "In-process **function calls**; zero network overhead",
        "Heavyweight: *SOAP/XML*, *WSDL* contracts, routed through centralized **ESB**",
      ],
      [
        "**Team Structure**",
        "Small, cross-functional teams (*two-pizza rule*); **full ownership** from code to production",
        "Teams organized by *technical layer* (frontend, backend, DBA); shared ownership",
        "Teams aligned to services but governance is **centralized**; heavyweight coordination",
      ],
      [
        "**Complexity**",
        "**Operational complexity** is high: requires service mesh, distributed tracing, container orchestration",
        "**Code complexity** grows over time; tight coupling makes changes risky",
        "**Middleware complexity** -- ESB logic becomes a maintenance burden; *smart pipes, dumb endpoints*",
      ],
      [
        "**Technology Choice**",
        "**Polyglot** -- each service can use the best language, framework, and database for its domain",
        "**Single stack** -- entire application uses one language and framework",
        "Limited polyglot; ESB and contract standards (\`WSDL\`) impose technology constraints",
      ],
      [
        "**Best For**",
        "Large organizations with *multiple teams*, *high deployment frequency*, and *diverse scaling needs*",
        "Small teams, *early-stage products*, or domains where boundaries are *not yet well understood*",
        "Enterprises with *existing middleware investment* and need for *formal governance*",
      ],
    ],
  },

  exercises: [
    "**Design a service decomposition**: Given an e-commerce platform with user management, product catalog, shopping cart, orders, payments, and shipping -- identify the **bounded contexts**, define service boundaries, specify which *database type* each service should use, and describe the **key domain events** each service publishes.",
    "**Implement a Saga**: Build a **choreographed Saga** for a food delivery app using *Node.js* and *RabbitMQ*. The flow: `OrderService` creates an order -> `RestaurantService` accepts/rejects -> `PaymentService` charges the customer -> `DeliveryService` assigns a rider. Implement **compensating transactions** for each failure scenario (restaurant rejects, payment fails, no riders available).",
    "**Add circuit breaker and retry logic**: Take an existing Express.js service that calls a downstream API and add a **circuit breaker** with configurable `failureThreshold`, `recoveryTimeout`, and `halfOpenMaxCalls`. Implement **retries with exponential backoff and jitter**. Write unit tests that simulate downstream failures and verify the circuit transitions through *CLOSED -> OPEN -> HALF_OPEN -> CLOSED* states.",
    "**Build an observability pipeline**: Set up **distributed tracing** across three microservices using `OpenTelemetry` SDK. Ensure a `trace-id` propagates through *HTTP headers* and *message queue metadata*. Export traces to **Jaeger**, set up *Prometheus* metrics for request latency (p50, p95, p99), error rate, and throughput, and create a **Grafana dashboard** with alerting rules for SLA violations.",
    "**Strangler Fig migration**: You have a monolithic *Python Django* application. Design a **migration plan** using the Strangler Fig pattern to extract the `Notifications` module into a standalone *Node.js microservice*. Define the **edge routing rules** (using *nginx* or an API gateway), the **data migration strategy**, the **event contract** between the monolith and the new service, and the **rollback plan** if the migration fails.",
  ],

  cheatSheet: [
    "**Database-per-Service**: Each microservice owns its data store exclusively. No direct cross-service database access. Use *API composition* or *CQRS read models* for cross-service queries.",
    "**Saga Pattern**: Replace distributed transactions with a chain of *local transactions* + *compensating actions*. **Orchestration** = central coordinator (easier to debug); **Choreography** = event-driven (looser coupling).",
    "**Circuit Breaker States**: `CLOSED` (normal, counting failures) -> `OPEN` (requests fail fast, timer running) -> `HALF_OPEN` (one probe request allowed). On probe success -> `CLOSED`; on probe failure -> `OPEN`.",
    "**Idempotency**: Every write endpoint must produce the same result if called multiple times. Use an `idempotency-key` header or a *unique constraint* on a deduplication field in the database.",
    "**Health Checks**: Expose `/health` (liveness) and `/ready` (readiness) endpoints. Kubernetes uses liveness to *restart* crashed containers and readiness to *remove* unready pods from load balancer rotation.",
    "**Observability Pillars**: **Logs** (structured JSON with correlation IDs), **Metrics** (RED: Rate, Errors, Duration), **Traces** (propagate `trace-id` via headers across all service calls using `OpenTelemetry`).",
  ],

  revisionNotes: [
    "Microservices trade **code complexity** (monolith) for **operational complexity** (distributed system). The *platform tax* -- CI/CD, container orchestration, observability, service mesh -- must be paid before gaining benefits.",
    "**Service boundaries** should align with *Domain-Driven Design bounded contexts*, not technical layers. A service that is too fine-grained creates excessive inter-service chatter; too coarse-grained recreates the monolith.",
    "**Eventual consistency** is the default in microservices. Use the *Saga pattern* for distributed workflows, *CQRS* for optimized reads, and design UIs for **optimistic updates** with graceful conflict handling.",
    "**Resilience patterns** are non-negotiable: *circuit breaker* prevents cascading failures, *bulkhead* isolates failure domains, *retry with backoff and jitter* handles transient errors, and *timeout* prevents resource exhaustion from slow dependencies.",
    "Start with a **modular monolith** and extract services only when you have clear *bounded contexts*, sufficient *operational maturity*, and a genuine need for *independent scaling or deployment*. Premature decomposition is the most common microservices anti-pattern.",
  ],

  glossary: [
    {
      term: "Bounded Context",
      definition:
        "A DDD concept defining an explicit boundary within which a domain model applies. In microservices, each bounded context typically maps to one service.",
    },
    {
      term: "Service Mesh",
      definition:
        "A dedicated infrastructure layer for managing service-to-service communication, providing traffic management, security (mTLS), and observability through sidecar proxies.",
    },
    {
      term: "Saga Pattern",
      definition:
        "A pattern for managing distributed transactions as a sequence of local transactions, each publishing events that trigger subsequent steps, with compensating transactions for rollback.",
    },
    {
      term: "CQRS (Command Query Responsibility Segregation)",
      definition:
        "An architectural pattern that separates read and write models, allowing each to be optimized independently. Often used with event sourcing in microservices.",
    },
    {
      term: "Idempotency",
      definition:
        "The property of an operation that produces the same result regardless of how many times it is executed. Essential in distributed systems where messages may be delivered more than once.",
    },
    {
      term: "Circuit Breaker",
      definition:
        "A stability pattern that prevents cascading failures by detecting repeated failures to a downstream service and short-circuiting requests until the service recovers.",
    },
    {
      term: "Event Sourcing",
      definition:
        "A pattern where state changes are stored as an immutable sequence of events rather than as mutable records. The current state is derived by replaying events.",
    },
  ],
};
