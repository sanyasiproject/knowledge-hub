import type { TopicContent } from "../types";

export const serverlessArch: TopicContent = {
  quickSummary: [
    "Serverless computing abstracts away server management entirely; developers deploy functions or use managed backend services while the cloud provider handles scaling, patching, and availability.",
    "Function-as-a-Service (FaaS) platforms like AWS Lambda, Azure Functions, and Google Cloud Functions execute stateless functions triggered by events, scaling from zero to thousands of instances automatically.",
    "Cold starts -- the latency penalty when a new function instance is initialized -- remain the primary performance concern, mitigable through provisioned concurrency, smaller runtimes, and warm-up strategies.",
    "Vendor lock-in is a real but manageable risk; frameworks like Serverless Framework and SAM provide abstraction, but the deeper integration with proprietary services (Step Functions, DynamoDB Streams), the harder migration becomes.",
  ],
  detailed: [
    `## FaaS: Function-as-a-Service

FaaS is the core compute model of serverless. Each function is a single-purpose unit of code invoked in response to an event.

**Key characteristics:**
- **Stateless execution** -- functions receive input, produce output, and maintain no in-memory state between invocations.
- **Event-driven triggers** -- HTTP requests (API Gateway), message queue events (SQS, EventBridge), storage events (S3 put), database change streams, scheduled timers (cron).
- **Automatic scaling** -- the platform creates new instances as needed, scaling to zero when idle. No capacity planning required.
- **Pay-per-invocation** -- billed by execution time (ms granularity) and memory allocated. No cost when idle.

**Major FaaS platforms:**
- AWS Lambda -- most mature, deepest ecosystem integration, 15-minute max execution time.
- Azure Functions -- strong .NET integration, durable functions for stateful orchestration.
- Google Cloud Functions -- tight integration with Firebase and GCP event sources.
- Cloudflare Workers -- edge-based execution with V8 isolates, sub-millisecond cold starts.`,

    `## BaaS: Backend-as-a-Service

BaaS provides fully managed backend components that eliminate the need to build and operate common infrastructure:

**Common BaaS services:**
- **Authentication** -- Auth0, Firebase Auth, AWS Cognito. Handle user registration, login, MFA, social sign-in.
- **Databases** -- DynamoDB, Firestore, FaunaDB. Fully managed with automatic scaling and built-in replication.
- **Storage** -- S3, Cloud Storage, R2. Object storage with CDN integration.
- **Real-time** -- Firebase Realtime Database, AWS AppSync. WebSocket-based data synchronization.
- **Search** -- Algolia, Amazon OpenSearch Serverless.

**Serverless = FaaS + BaaS:** A serverless application typically combines FaaS for custom business logic with BaaS for commodity infrastructure. The goal is to write only the code that differentiates your product.

**When BaaS works well:**
- Rapid prototyping and MVPs where speed-to-market matters more than architectural purity.
- Mobile and web applications with standard backend requirements.
- Applications with unpredictable or spiky traffic patterns.`,

    `## Cold Starts and Performance

A cold start occurs when a FaaS platform must initialize a new function instance -- downloading the deployment package, starting the runtime, executing initialization code, and establishing connections.

**Cold start latency by runtime:**
- Python, Node.js: 100-500ms typical
- Java, .NET: 500ms-5s+ (JVM/CLR startup)
- Rust, Go: 10-100ms (compiled, minimal runtime)
- Cloudflare Workers (V8 isolates): <5ms

**Mitigation strategies:**
- **Provisioned concurrency** (AWS Lambda) -- keeps N instances warm; eliminates cold starts but adds cost.
- **Minimize package size** -- smaller deployment packages load faster. Use tree-shaking, exclude dev dependencies, consider Lambda Layers for shared libraries.
- **Lazy initialization** -- defer expensive operations (DB connections, SDK clients) to first use rather than module load.
- **Choose lighter runtimes** -- Go and Rust have near-zero cold starts. Node.js is a good middle ground.
- **SnapStart** (AWS Lambda for Java) -- pre-initializes the JVM and snapshots memory, reducing Java cold starts to ~200ms.

**Warm start performance** is typically excellent: 1-5ms overhead beyond the function's own execution time.`,

    `## Event-Driven Architecture in Serverless

Serverless naturally aligns with event-driven architecture. Functions react to events from various sources, forming loosely coupled processing pipelines.

**Common patterns:**
- **API Gateway + Lambda** -- synchronous request-response for REST/GraphQL APIs.
- **Event fan-out** -- an event (e.g., order placed) triggers multiple functions via SNS/EventBridge.
- **Stream processing** -- Lambda consumes Kinesis/Kafka streams for real-time data processing.
- **Choreography** -- services communicate through events without a central coordinator.
- **Step Functions** -- AWS-managed orchestration for complex workflows with branching, retries, and error handling.

**Challenges:**
- **Debugging** -- distributed traces across dozens of functions are hard to follow. Use structured logging and correlation IDs.
- **Testing** -- local emulation (SAM local, Serverless Offline) approximates but does not perfectly replicate cloud behavior.
- **Idempotency** -- functions may be invoked more than once (at-least-once delivery). Design every handler to be idempotent.
- **Concurrency limits** -- account-level limits (e.g., 1000 concurrent Lambda executions by default) can throttle during spikes.`,

    `## Vendor Lock-in and Migration

**Lock-in spectrum:**
- **Low lock-in:** FaaS compute (function code is portable; triggers differ by vendor).
- **Medium lock-in:** Managed databases (DynamoDB data model is proprietary; migration requires schema redesign).
- **High lock-in:** Orchestration services (Step Functions, EventBridge rules) and proprietary integrations deeply embedded in application logic.

**Mitigation strategies:**
- Use hexagonal architecture: isolate cloud-specific code in adapter layers.
- Prefer open standards: OpenAPI for APIs, CloudEvents for event schemas, SQL-compatible databases.
- Use infrastructure-as-code (Terraform, Pulumi) for multi-cloud portability of deployment definitions.
- Evaluate portability cost vs. productivity gain. Full cloud-agnosticism is expensive and rarely needed.

**When serverless is NOT the right choice:**
- Long-running processes (>15 minutes on Lambda).
- Workloads requiring persistent connections (WebSocket servers, game servers).
- Applications with predictable, constant load where reserved instances are cheaper.
- Latency-sensitive applications intolerant of cold start variability.
- Workloads requiring GPU or specialized hardware.`,
  ],
  interviewQA: [
    {
      q: "What is a cold start in serverless, and how do you mitigate it?",
      a: "A cold start is the initialization latency when the FaaS platform creates a new function instance -- loading the deployment package, starting the runtime, and running initialization code. It typically adds 100ms-5s depending on the runtime. Mitigation strategies include provisioned concurrency (pre-warmed instances), minimizing package size, choosing lightweight runtimes (Go, Rust, Node.js over Java), lazy initialization of expensive resources, and SnapStart for Java on AWS Lambda.",
    },
    {
      q: "How do you handle state in a serverless architecture?",
      a: "Functions are stateless by design, so state must be externalized. Use managed databases (DynamoDB, Firestore) for persistent state, caches (ElastiCache, DAX) for frequently accessed data, and Step Functions or Durable Functions for workflow state. For session state in APIs, use tokens (JWT) or external session stores. The key insight is that serverless forces you to design for statelessness, which actually improves scalability and resilience.",
    },
    {
      q: "What are the main concerns around vendor lock-in with serverless?",
      a: "Lock-in exists on a spectrum. Function code is mostly portable, but triggers, IAM integration, and proprietary services (Step Functions, EventBridge, DynamoDB) create deep coupling. Mitigate by using hexagonal architecture to isolate cloud-specific adapters, preferring open standards (OpenAPI, CloudEvents), and using IaC tools like Terraform. However, full cloud-agnosticism is expensive -- evaluate the realistic probability of migration against the productivity gains of native integrations.",
    },
    {
      q: "When would you choose containers over serverless?",
      a: "Choose containers when: your workloads run longer than FaaS limits (15 min on Lambda), you need persistent connections (WebSocket servers), you have predictable steady-state traffic where reserved capacity is cheaper, you require specific runtime environments or OS-level customization, or your team already has strong Kubernetes expertise. Serverless excels for event-driven, spiky, or low-traffic workloads where you want zero operational overhead.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary billing model for FaaS platforms?",
      options: [
        "Fixed monthly fee based on provisioned capacity",
        "Per-invocation plus execution duration and memory allocated",
        "Per-CPU-core-hour with minimum reservation",
        "Flat rate per deployed function regardless of usage",
      ],
      answerIndex: 1,
      explanation:
        "FaaS platforms bill per invocation and per execution time (measured in GB-seconds or ms). There is no cost when functions are idle, which is a key economic advantage for variable workloads.",
    },
    {
      q: "Which runtime typically has the lowest cold start latency on AWS Lambda?",
      options: [
        "Java with Spring Boot",
        "Python with large ML libraries",
        "Rust compiled to provided.al2 runtime",
        ".NET with Entity Framework",
      ],
      answerIndex: 2,
      explanation:
        "Compiled languages with minimal runtimes (Rust, Go) have the fastest cold starts (10-100ms) because they produce small native binaries with no runtime interpreter or framework initialization overhead.",
    },
    {
      q: "What does 'provisioned concurrency' do in AWS Lambda?",
      options: [
        "Limits the maximum number of concurrent executions",
        "Keeps a specified number of function instances pre-initialized to eliminate cold starts",
        "Automatically scales the function beyond the account limit",
        "Reduces the memory allocated to each function instance",
      ],
      answerIndex: 1,
      explanation:
        "Provisioned concurrency maintains a pool of pre-initialized Lambda instances ready to handle requests immediately, eliminating cold start latency at the cost of paying for those instances even when idle.",
    },
    {
      q: "Which pattern is most appropriate for coordinating multi-step serverless workflows with error handling?",
      options: [
        "Direct function-to-function synchronous calls",
        "Storing workflow state in a global variable",
        "Orchestration using AWS Step Functions or Azure Durable Functions",
        "Polling a shared database for state changes",
      ],
      answerIndex: 2,
      explanation:
        "Managed orchestration services like Step Functions provide built-in state management, error handling, retries, timeouts, and visual workflow monitoring -- far more robust than manual coordination approaches.",
    },
  ],
  flashcards: [
    {
      front: "FaaS vs. BaaS",
      back: "FaaS (Function-as-a-Service) provides event-triggered stateless compute. BaaS (Backend-as-a-Service) provides fully managed backend components like auth, databases, and storage. A serverless application typically combines both.",
    },
    {
      front: "What are the typical cold start times by language?",
      back: "Rust/Go: 10-100ms. Python/Node.js: 100-500ms. Java/.NET: 500ms-5s+. Cloudflare Workers (V8 isolates): <5ms. JVM-based languages suffer most due to runtime initialization.",
    },
    {
      front: "What is AWS Lambda SnapStart?",
      back: "A feature that pre-initializes the Java runtime and takes a memory snapshot. On cold start, it restores from the snapshot instead of full initialization, reducing Java cold starts from seconds to ~200ms.",
    },
    {
      front: "Why is idempotency critical in serverless?",
      back: "FaaS platforms use at-least-once delivery semantics, meaning a function may be invoked multiple times for the same event. Every handler must produce the same result whether executed once or multiple times to avoid duplicate processing.",
    },
    {
      front: "What is the maximum execution time for AWS Lambda?",
      back: "15 minutes. Workloads exceeding this limit need containers (ECS/Fargate), Step Functions to chain shorter executions, or a different compute model entirely.",
    },
    {
      front: "Event fan-out pattern",
      back: "A single event (e.g., order created) is published to a topic (SNS) or event bus (EventBridge), triggering multiple independent functions in parallel (send email, update inventory, log analytics). Enables loose coupling between concerns.",
    },
    {
      front: "When is serverless NOT the right choice?",
      back: "Long-running processes, persistent connections (WebSockets), steady high-traffic workloads where reserved capacity is cheaper, latency-sensitive apps intolerant of cold starts, and workloads needing GPU or specialized hardware.",
    },
  ],
  glossary: [
    {
      term: "FaaS (Function-as-a-Service)",
      definition:
        "A cloud computing model where the provider runs stateless functions on demand, triggered by events, with automatic scaling and per-invocation billing.",
    },
    {
      term: "BaaS (Backend-as-a-Service)",
      definition:
        "Fully managed backend components (authentication, databases, storage) that eliminate the need to build and operate common infrastructure.",
    },
    {
      term: "Cold Start",
      definition:
        "The initialization latency incurred when a FaaS platform creates a new function instance, including downloading code, starting the runtime, and running initialization logic.",
    },
    {
      term: "Provisioned Concurrency",
      definition:
        "A FaaS feature that keeps a specified number of function instances pre-initialized to serve requests without cold start latency.",
    },
    {
      term: "Event-Driven Architecture",
      definition:
        "An architectural pattern where application components communicate by producing and consuming events, enabling loose coupling and asynchronous processing.",
    },
    {
      term: "Vendor Lock-in",
      definition:
        "The degree of dependency on a specific cloud provider's proprietary services, making migration to another provider costly or impractical.",
    },
    {
      term: "Step Functions",
      definition:
        "AWS-managed orchestration service that coordinates multi-step workflows with built-in state management, error handling, retries, and visual monitoring.",
    },
  ],
};
