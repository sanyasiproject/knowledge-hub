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
  deepDive: [
    `## The Execution Model: How FaaS Platforms Work Under the Hood

When a **FaaS platform** receives an invocation, it follows a multi-stage lifecycle that is invisible to the developer but critical to understand for performance tuning. First, the platform checks its *warm pool* for an existing execution environment matching the function's configuration (runtime, memory, VPC settings). If none is available, a **cold start** is triggered: the platform provisions a lightweight *microVM* (AWS uses **Firecracker**, a purpose-built VMM that boots in ~125ms), downloads the deployment package from an internal cache or S3, starts the language runtime, and executes the module-level initialization code. The function handler then runs, and the execution environment is *frozen* -- its process state, memory, and any open connections are preserved for potential reuse. This frozen environment remains available for minutes (typically 5-15 minutes of inactivity) before being reclaimed. Understanding this lifecycle explains why \`global scope\` initialization (e.g., creating a **MongoDB client** or **AWS SDK instance**) persists across warm invocations and why *connection pooling* at the module level is both possible and recommended.`,

    `## Serverless Data Layer Patterns and MongoDB Integration

Connecting to databases from serverless functions introduces unique challenges that traditional application architectures never face. The **connection exhaustion problem** is the most critical: each concurrent Lambda instance maintains its own database connection, and during traffic spikes, hundreds or thousands of instances can overwhelm a database's connection limit. For **MongoDB**, the solution is *MongoDB Atlas Serverless Instances* or using the \`mongodb\` driver with careful connection management -- caching the \`MongoClient\` in the module scope so warm invocations reuse the existing connection rather than creating a new one. The \`serverSelectionTimeoutMS\` and \`maxPoolSize\` options must be tuned for Lambda's execution model: a small pool size (1-5) per instance, combined with a short server selection timeout, prevents functions from hanging when the database is under pressure. **AWS RDS Proxy** solves this for relational databases by pooling connections at the infrastructure level, but for MongoDB, the *application-level caching pattern* shown in the code examples is the standard approach. Additionally, **DynamoDB** sidesteps the connection problem entirely with its HTTP-based API -- each request is independent, making it inherently serverless-friendly.`,

    `## Security Model and IAM Best Practices in Serverless

The serverless security model shifts responsibility boundaries compared to traditional architectures. Under the **shared responsibility model**, the cloud provider secures the execution environment, runtime patching, and network isolation, while the developer is responsible for *function-level permissions*, *input validation*, *dependency security*, and *secrets management*. The principle of **least privilege IAM** is especially important: each Lambda function should have its own *execution role* with narrowly scoped permissions. A common anti-pattern is sharing a single overly permissive role across all functions -- if one function is compromised (e.g., through a **deserialization vulnerability** or **injection attack**), the blast radius extends to every resource the shared role can access. Use \`AWS::IAM::Role\` per function in your **SAM template**, restrict actions to specific resource ARNs, and avoid wildcard (\`*\`) permissions. For secrets, use **AWS Secrets Manager** or **SSM Parameter Store** with encrypted parameters, accessed via the SDK at initialization time and cached in module scope. Environment variables should carry *non-sensitive configuration* only, despite being encrypted at rest, because they are visible in the Lambda console and CloudWatch logs if accidentally printed.`,
  ],
  code: [
    {
      language: "javascript",
      caption: "Node.js Lambda handler with MongoDB connection caching and idempotent write",
      source: `const { MongoClient } = require("mongodb");

// Module-scope cache -- persists across warm invocations
let cachedClient = null;

async function connectToMongo() {
  if (cachedClient && cachedClient.topology?.isConnected()) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 3,                   // Keep pool small per Lambda instance
    serverSelectionTimeoutMS: 5000,   // Fail fast if Atlas is unreachable
    connectTimeoutMS: 5000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

/**
 * Lambda handler -- processes an order event idempotently.
 * Uses the event's idempotencyKey to prevent duplicate writes.
 */
exports.handler = async (event) => {
  const { orderId, customerId, items, idempotencyKey } = JSON.parse(event.body);

  const client = await connectToMongo();
  const db = client.db(process.env.DB_NAME);
  const orders = db.collection("orders");

  // Idempotent upsert -- safe for at-least-once delivery
  const result = await orders.updateOne(
    { idempotencyKey },
    {
      $setOnInsert: {
        orderId,
        customerId,
        items,
        status: "pending",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  const created = result.upsertedCount === 1;

  return {
    statusCode: created ? 201 : 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: created ? "Order created" : "Duplicate request -- order already exists",
      orderId,
    }),
  };
};`,
    },
    {
      language: "yaml",
      caption: "AWS SAM template -- API Gateway + Lambda + DynamoDB with least-privilege IAM",
      source: `AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: Serverless order processing API

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 256
    Environment:
      Variables:
        MONGODB_URI: !Sub "{{resolve:ssm:/myapp/\${Stage}/mongodb-uri}}"
        DB_NAME: orders-db
        ORDERS_TABLE: !Ref OrdersTable

Parameters:
  Stage:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Resources:
  # --- API Gateway ---
  OrderApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Stage
      TracingEnabled: true          # Enable X-Ray tracing

  # --- Lambda Functions ---
  CreateOrderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/createOrder.handler
      Description: Creates a new order with idempotent write
      Policies:
        - DynamoDBCrudPolicy:       # SAM policy template -- least privilege
            TableName: !Ref OrdersTable
        - SSMParameterReadPolicy:
            ParameterName: !Sub "myapp/\${Stage}/mongodb-uri"
      Events:
        PostOrder:
          Type: Api
          Properties:
            RestApiId: !Ref OrderApi
            Path: /orders
            Method: POST

  ProcessOrderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/processOrder.handler
      Description: Processes orders from SQS queue
      Policies:
        - SQSPollerPolicy:
            QueueName: !GetAtt OrderQueue.QueueName
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable
      Events:
        OrderQueueEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt OrderQueue.Arn
            BatchSize: 10

  # --- DynamoDB Table ---
  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "\${Stage}-orders"
      BillingMode: PAY_PER_REQUEST   # Serverless billing -- scales to zero
      AttributeDefinitions:
        - AttributeName: orderId
          AttributeType: S
        - AttributeName: customerId
          AttributeType: S
      KeySchema:
        - AttributeName: orderId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: customer-index
          KeySchema:
            - AttributeName: customerId
              KeyType: HASH
          Projection:
            ProjectionType: ALL

  # --- SQS Queue ---
  OrderQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub "\${Stage}-order-queue"
      VisibilityTimeout: 180       # 6x function timeout
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt OrderDLQ.Arn
        maxReceiveCount: 3

  OrderDLQ:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub "\${Stage}-order-dlq"
      MessageRetentionPeriod: 1209600  # 14 days

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub "https://\${OrderApi}.execute-api.\${AWS::Region}.amazonaws.com/\${Stage}/"`,
    },
    {
      language: "javascript",
      caption: "Middleware pattern -- structured logging with correlation ID for distributed tracing",
      source: `const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const { v4: uuidv4 } = require("uuid");

/**
 * Custom middleware: injects a correlation ID into every
 * invocation for end-to-end distributed tracing.
 */
const correlationId = () => ({
  before: (request) => {
    const corrId =
      request.event.headers?.["x-correlation-id"] || uuidv4();

    // Attach to context so downstream code can access it
    request.context.correlationId = corrId;

    // Structured log -- queryable in CloudWatch Insights
    console.log(
      JSON.stringify({
        level: "INFO",
        correlationId: corrId,
        functionName: request.context.functionName,
        event: "INVOCATION_START",
        path: request.event.path,
        method: request.event.httpMethod,
      })
    );
  },
  after: (request) => {
    // Propagate correlation ID in the response headers
    request.response = request.response || {};
    request.response.headers = {
      ...request.response.headers,
      "x-correlation-id": request.context.correlationId,
    };
  },
});

const baseHandler = async (event, context) => {
  // Business logic here -- context.correlationId available
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};

// Compose middlewares -- clean separation of concerns
module.exports.handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(correlationId())
  .use(httpErrorHandler());`,
    },
  ],
  diagrams: [
    {
      title: "Serverless Request Flow",
      kind: "sequence",
      caption: "End-to-end flow of an API request through a serverless stack, from client to database and back.",
      mermaid: `sequenceDiagram
    participant Client
    participant APIGW as API Gateway
    participant Lambda
    participant Mongo as MongoDB Atlas
    participant SQS

    Client->>APIGW: POST /orders (JSON body)
    APIGW->>APIGW: Validate request, check API key
    APIGW->>Lambda: Invoke CreateOrder handler
    Lambda->>Lambda: Check warm connection cache
    alt Cold start
        Lambda->>Mongo: Establish new connection
        Mongo-->>Lambda: Connection ready
    end
    Lambda->>Mongo: updateOne (idempotent upsert)
    Mongo-->>Lambda: Write acknowledged
    Lambda->>SQS: SendMessage (order.created event)
    SQS-->>Lambda: Message accepted
    Lambda-->>APIGW: 201 Created (JSON response)
    APIGW-->>Client: 201 Created + headers`,
    },
    {
      title: "Serverless Architecture Overview",
      kind: "architecture",
      caption: "High-level architecture of a serverless order processing system showing event-driven fan-out.",
      mermaid: `flowchart TD
    Client([Client App]) -->|HTTPS| APIGW[API Gateway]
    APIGW -->|Invoke| CreateFn[CreateOrder Lambda]
    CreateFn -->|Write| DDB[(DynamoDB)]
    CreateFn -->|Publish| EB[EventBridge]

    EB -->|order.created| EmailFn[SendEmail Lambda]
    EB -->|order.created| InventoryFn[UpdateInventory Lambda]
    EB -->|order.created| AnalyticsFn[LogAnalytics Lambda]

    EmailFn -->|Send| SES[Amazon SES]
    InventoryFn -->|Update| DDB
    AnalyticsFn -->|Put| Firehose[Kinesis Firehose]
    Firehose -->|Deliver| S3[(S3 Data Lake)]

    Schedule([CloudWatch Cron]) -->|Every 5 min| CleanupFn[Cleanup Lambda]
    CleanupFn -->|Scan & delete| DDB

    style APIGW fill:#f59e0b,color:#000
    style DDB fill:#3b82f6,color:#fff
    style EB fill:#8b5cf6,color:#fff
    style S3 fill:#10b981,color:#fff`,
    },
    {
      title: "Lambda Function Lifecycle",
      kind: "state",
      caption: "State transitions of a Lambda execution environment from cold start through freeze and eventual reclamation.",
      mermaid: `stateDiagram-v2
    [*] --> Provisioning: Invocation received (no warm instance)
    Provisioning --> Initializing: MicroVM ready
    Initializing --> Running: Init code complete
    Running --> Frozen: Handler returns
    Frozen --> Running: New invocation (warm start)
    Frozen --> Shutdown: Idle timeout (~5-15 min)
    Shutdown --> [*]: Environment reclaimed

    note right of Provisioning: Download code, start Firecracker microVM
    note right of Initializing: Execute module-scope code, establish DB connections
    note right of Frozen: Process + memory preserved, connections kept open`,
    },
  ],
  comparison: {
    columns: [
      "Dimension",
      "**AWS Lambda** (Serverless)",
      "**ECS Fargate** (Containers)",
      "**EC2** (Virtual Machines)",
    ],
    rows: [
      [
        "**Scaling**",
        "Automatic, per-request, scales to zero",
        "Auto-scaling on CPU/memory metrics, min 1 task",
        "Manual or ASG-based, min 1 instance",
      ],
      [
        "**Max execution time**",
        "15 minutes",
        "Unlimited",
        "Unlimited",
      ],
      [
        "**Cold start latency**",
        "100ms - 5s (runtime dependent)",
        "30s - 2min (image pull + start)",
        "1-5 min (instance launch)",
      ],
      [
        "**Pricing model**",
        "Per invocation + GB-seconds",
        "Per vCPU-hour + GB-hour (while running)",
        "Per instance-hour (reserved/on-demand/spot)",
      ],
      [
        "**Idle cost**",
        "Zero (unless provisioned concurrency)",
        "Cost of minimum running tasks",
        "Full instance cost even when idle",
      ],
      [
        "**Ops overhead**",
        "Near zero -- no servers, no patching",
        "Low -- manage task definitions, networking",
        "High -- OS patching, AMI updates, capacity planning",
      ],
      [
        "**State management**",
        "Stateless; must externalize all state",
        "Ephemeral storage per task; persistent via EFS/EBS",
        "Full filesystem, local disk, any storage",
      ],
      [
        "**Best for**",
        "Event-driven, spiky, low-to-moderate traffic APIs",
        "Containerized microservices, long-running processes",
        "Legacy apps, GPU workloads, full OS control",
      ],
      [
        "**Vendor lock-in**",
        "Medium-high (triggers, IAM, integrations)",
        "Low-medium (Docker is portable, orchestration differs)",
        "Low (standard VMs, portable across clouds)",
      ],
    ],
  },
  exercises: [
    "**Design a serverless image pipeline:** An S3 bucket receives user-uploaded images. Design a Lambda-based pipeline that (1) validates the image format, (2) generates three thumbnail sizes, (3) stores them back in S3, and (4) updates a DynamoDB record with the thumbnail URLs. Draw the architecture diagram, specify the *IAM permissions* each function needs, and explain how you would handle partial failures (e.g., thumbnail generation succeeds but DynamoDB write fails).",
    "**Implement idempotent payment processing:** Write a Lambda handler (Node.js) that processes payment webhooks from Stripe. The handler must be *idempotent* -- processing the same webhook event multiple times must not charge the customer twice. Use DynamoDB conditional writes with an `idempotencyKey` and explain why `PutItem` with a *condition expression* is preferable to a read-then-write pattern.",
    "**Cold start optimization lab:** You have a Java-based Lambda function with a 4.2-second cold start. It uses Spring Boot, connects to an RDS PostgreSQL database, and loads a 45MB ML model from S3 at initialization. List **at least five** concrete changes you would make to reduce the cold start to under 500ms, ordered by expected impact. For each change, explain the mechanism and any trade-offs.",
    "**Build a serverless WebSocket chat:** Using API Gateway WebSocket APIs and Lambda, design a real-time chat system. Explain how `$connect`, `$disconnect`, and `$default` routes map to Lambda handlers, how you store connection IDs in DynamoDB, and how a `sendMessage` handler broadcasts to all connected clients. What are the *concurrency implications* if 10,000 users are connected simultaneously?",
    "**Cost comparison exercise:** A REST API serves 50 million requests/month with an average execution time of 200ms and 256MB memory. Calculate the *monthly cost* on (a) AWS Lambda, (b) ECS Fargate (2 tasks, 0.5 vCPU, 1GB each), and (c) EC2 (1x t3.medium reserved instance). Show your work and identify the *break-even point* where Lambda becomes more expensive than containers.",
  ],
  cheatSheet: [
    "**Connection caching:** Always create database clients (MongoDB, DynamoDB DocumentClient, SDK instances) in *module scope* outside the handler. Warm invocations reuse the cached connection, avoiding per-request connection overhead. Set `maxPoolSize` to a small value (1-5) per Lambda instance.",
    "**Idempotency pattern:** Use *conditional writes* (`$setOnInsert` in MongoDB, `ConditionExpression` in DynamoDB) keyed on an `idempotencyKey` from the event. Never rely on read-then-write -- it is not atomic and fails under concurrent invocations. The `@aws-lambda-powertools/idempotency` library handles this automatically.",
    "**Environment variable tiers:** Use Lambda *environment variables* for non-sensitive config (`STAGE`, `TABLE_NAME`, `LOG_LEVEL`). Use **SSM Parameter Store** (`SecureString`) or **Secrets Manager** for credentials. Reference them in SAM with `!Sub '{{resolve:ssm:/path}}'` to avoid hardcoding.",
    "**SQS + Lambda best practices:** Set `VisibilityTimeout` to **6x** the function timeout. Enable `ReportBatchItemFailures` so only failed messages return to the queue. Always configure a **dead-letter queue** (DLQ) with `maxReceiveCount: 3` to prevent poison-pill messages from blocking the queue indefinitely.",
    "**Structured logging:** Use `JSON.stringify()` for all log output. Include `correlationId`, `functionName`, `requestId` (\`context.awsRequestId\`), and `level` fields. This enables powerful queries in **CloudWatch Logs Insights** like \`filter level = \"ERROR\" | stats count(*) by functionName\`.",
    "**SAM quick commands:** `sam init` (scaffold), `sam build` (compile), `sam local invoke -e event.json` (test locally), `sam deploy --guided` (first deploy), `sam logs -n FunctionName --tail` (live tail logs). Use `sam local start-api` to emulate API Gateway locally for end-to-end testing.",
  ],
  revisionNotes: [
    "Serverless = **FaaS + BaaS**. FaaS provides *event-driven stateless compute* (Lambda, Cloud Functions) billed per invocation. BaaS provides *managed backend components* (DynamoDB, Cognito, S3) that eliminate infrastructure operations. The combination lets you write only differentiating business logic.",
    "**Cold starts** matter most for *synchronous, user-facing* APIs. Mitigation hierarchy: (1) choose a lightweight runtime (Go/Rust/Node.js), (2) minimize deployment package size, (3) cache connections in module scope, (4) use **provisioned concurrency** for latency-critical paths, (5) enable **SnapStart** for Java. Warm starts add only ~1-5ms overhead.",
    "**Idempotency is non-negotiable** in serverless because FaaS platforms guarantee *at-least-once* delivery, not *exactly-once*. Every handler must produce the same result whether invoked once or multiple times. Use conditional database writes keyed on an idempotency token from the event payload.",
    "**Vendor lock-in** exists on a spectrum: function *compute code* is highly portable, *managed databases* (DynamoDB, Firestore) require schema redesign to migrate, and *orchestration services* (Step Functions, EventBridge rules) create the deepest coupling. Mitigate with hexagonal architecture -- isolate cloud-specific code behind adapter interfaces so the core domain logic remains portable.",
    "**Lambda vs. ECS vs. EC2** decision framework: choose Lambda for *event-driven, spiky, short-lived* workloads; ECS Fargate for *containerized microservices, long-running processes, and steady traffic*; EC2 for *GPU workloads, legacy applications, and full OS control*. Lambda costs less at low-to-moderate traffic but becomes more expensive than containers at sustained high volume (calculate the break-even point for your workload).",
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
