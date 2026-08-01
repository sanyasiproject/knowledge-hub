import type { TopicContent } from "../types";

export const horizontalVertical: TopicContent = {
  quickSummary: [
    "Vertical scaling (scale-up) adds more resources (CPU, RAM, faster disks) to a single machine; horizontal scaling (scale-out) adds more machines to distribute the workload.",
    "Horizontal scaling requires stateless application design so that any instance can handle any request without depending on local state from previous requests.",
    "Session affinity (sticky sessions) pins a user to a specific instance, simplifying stateful interactions but reducing the benefits of horizontal scaling.",
    "Most production architectures combine both: vertically scale individual nodes to a cost-effective point, then scale horizontally for capacity beyond that.",
  ],
  detailed: [
    `## Vertical Scaling (Scale-Up)

Vertical scaling increases the capacity of a single machine:

- Add more CPU cores or upgrade to faster processors.
- Increase RAM.
- Replace HDDs with SSDs or NVMe drives.
- Upgrade network interfaces.

**Advantages**:
- **Simplicity**: no distributed systems complexity. One machine, one process, one database.
- **Strong consistency**: no need for distributed coordination or consensus.
- **Low latency**: no network hops between components.

**Limitations**:
- **Hardware ceiling**: there is a maximum size for a single machine (e.g., AWS u-24tb1.metal: 448 vCPUs, 24 TB RAM). Beyond this, you must scale out.
- **Single point of failure**: one machine means one failure domain unless paired with a standby.
- **Cost curve**: high-end hardware has non-linear pricing — doubling capacity often costs 3-4x.
- **Downtime for upgrades**: scaling up often requires stopping and restarting the instance.`,

    `## Horizontal Scaling (Scale-Out)

Horizontal scaling adds more instances to share the workload:

- Deploy multiple application servers behind a load balancer.
- Shard databases across multiple nodes.
- Distribute queue consumers across workers.

**Advantages**:
- **Near-linear scalability**: adding instances proportionally increases capacity (in theory).
- **Fault tolerance**: losing one instance does not take down the system.
- **Cost efficiency**: commodity hardware is cheaper per unit of compute than high-end single machines.
- **Rolling upgrades**: update instances one at a time with zero downtime.

**Challenges**:
- **State management**: local state (sessions, caches, file uploads) must be externalized.
- **Data consistency**: distributed databases require trade-offs (CAP theorem).
- **Operational complexity**: more instances mean more monitoring, deployment, and networking.
- **Non-trivial bottlenecks**: shared resources (database, message queue) can become the new bottleneck.`,

    `## Stateless Design for Horizontal Scaling

Stateless services treat each request independently, storing no per-client state locally:

- **Sessions**: store in Redis, Memcached, or a database — not in process memory.
- **File uploads**: write to object storage (S3, GCS) — not to local disk.
- **Caches**: use distributed caches (Redis, Memcached) — not in-process caches for shared data.
- **Configuration**: load from a config service or environment variables — not from local files that vary per instance.

The stateless rule is not absolute: in-process caches for immutable or rarely-changing data (e.g., feature flags refreshed every 60 seconds) are fine because inconsistency is bounded and temporary.

**12-Factor App** principles codify stateless design: processes are disposable, share-nothing, and treat backing services as attached resources.`,

    `## Session Affinity (Sticky Sessions)

Session affinity routes all requests from a user to the same backend instance, typically using a cookie or source IP hash:

**When it helps**:
- Legacy applications that store session state in process memory.
- WebSocket connections that must remain on the same server.
- In-memory caches that benefit from request locality (cache warming).

**Why it hurts horizontal scaling**:
- **Uneven load distribution**: popular users or long sessions can overload specific instances.
- **Failure impact**: if the sticky instance dies, the user loses their session (unless externalized anyway).
- **Scaling friction**: new instances receive no traffic from existing sessions, leading to cold-start inefficiency.
- **Deployment complexity**: rolling updates must drain sessions before retiring old instances.

Best practice: externalize state and eliminate the need for session affinity entirely. Use sticky sessions only as a transitional measure while migrating to stateless design.`,

    `## Choosing Between Scale-Up and Scale-Out

| Factor | Favor Scale-Up | Favor Scale-Out |
|--------|---------------|-----------------|
| Workload | CPU-bound, single-threaded | I/O-bound, parallelizable |
| Data model | Strong consistency required | Eventually consistent acceptable |
| Team maturity | Small team, simple ops | Team experienced with distributed systems |
| Budget | Small-medium workloads | Large workloads where commodity hardware is cheaper |
| Availability | Can tolerate brief downtime | Requires high availability |
| Database | Relational with complex joins | Document/key-value, already shardable |

In practice, most systems use a hybrid approach:

1. Scale up each instance to a cost-effective size (e.g., 8-16 vCPUs).
2. Scale out horizontally for capacity beyond a single instance.
3. Keep the database vertically scaled as long as possible (it is the hardest to shard).
4. Use read replicas as a middle ground for read-heavy database workloads.`,
  ],
  interviewQA: [
    {
      q: "What is the main prerequisite for horizontal scaling, and how do you achieve it?",
      a: "The main prerequisite is stateless application design. Each instance must be able to handle any request without depending on local state from previous requests. Achieve this by externalizing all state: store sessions in Redis or a database, write uploads to object storage, use distributed caches for shared data, and load configuration from environment variables or a config service. The 12-Factor App methodology codifies these practices.",
    },
    {
      q: "When would you recommend vertical scaling over horizontal scaling?",
      a: "Vertical scaling is preferable when the workload is CPU-bound and single-threaded (cannot parallelize), when strong consistency is a hard requirement (avoiding distributed coordination), when the team is small and lacks distributed systems expertise, or when current load fits within a single machine's capacity with adequate headroom. It is also often the right first step: scale up until cost becomes non-linear, then scale out. Databases in particular benefit from staying vertically scaled as long as possible since sharding adds significant complexity.",
    },
    {
      q: "What are the problems with sticky sessions and how would you eliminate them?",
      a: "Sticky sessions cause uneven load distribution (popular users overload specific instances), increase failure impact (user loses session when instance dies), create scaling friction (new instances get no existing traffic), and complicate deployments (must drain sessions before retiring instances). Eliminate them by externalizing all session state to a shared store like Redis with TTL-based expiration. This makes instances truly interchangeable, enabling even load distribution and seamless instance replacement.",
    },
    {
      q: "Why is the database often the bottleneck in horizontally scaled architectures?",
      a: "Application servers are stateless and easy to scale horizontally, but the database holds state and must maintain consistency. Adding app servers increases database connection pressure and query load. Sharding the database adds significant complexity (cross-shard queries, resharding, distributed transactions). Read replicas help with read-heavy workloads but do not solve write bottlenecks. This is why teams vertically scale the database as long as possible and invest heavily in caching to reduce database load before resorting to sharding.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary disadvantage of vertical scaling?",
      options: [
        "It requires stateless design",
        "It has a hardware ceiling and non-linear cost",
        "It introduces distributed systems complexity",
        "It requires a load balancer",
      ],
      answerIndex: 1,
      explanation:
        "Vertical scaling is limited by the maximum available hardware and becomes disproportionately expensive at the high end — doubling capacity often costs 3-4x rather than 2x.",
    },
    {
      q: "Which of the following violates stateless design principles?",
      options: [
        "Storing sessions in Redis",
        "Writing uploads to S3",
        "Caching user sessions in process memory",
        "Loading config from environment variables",
      ],
      answerIndex: 2,
      explanation:
        "Storing user sessions in process memory makes the instance stateful: if the user's next request hits a different instance, their session is lost. Sessions should be stored in an external shared store.",
    },
    {
      q: "What is the main problem with sticky sessions in a horizontally scaled system?",
      options: [
        "They increase network latency",
        "They cause uneven load distribution across instances",
        "They prevent SSL termination",
        "They require more CPU per instance",
      ],
      answerIndex: 1,
      explanation:
        "Sticky sessions pin users to specific instances, which can lead to some instances being overloaded while others are underutilized, defeating the purpose of horizontal scaling.",
    },
    {
      q: "Why is the database typically the last component to be horizontally scaled?",
      options: [
        "Databases do not support clustering",
        "Database licenses are too expensive",
        "Sharding adds significant complexity (distributed transactions, cross-shard queries)",
        "Databases cannot run in containers",
      ],
      answerIndex: 2,
      explanation:
        "Database sharding introduces complex challenges like cross-shard queries, distributed transactions, and resharding. Teams prefer vertical scaling and read replicas as long as possible before resorting to sharding.",
    },
  ],
  flashcards: [
    {
      front: "What is vertical scaling?",
      back: "Adding more resources (CPU, RAM, storage) to a single machine. Simple but limited by hardware ceiling and non-linear cost at the high end.",
    },
    {
      front: "What is horizontal scaling?",
      back: "Adding more machines to distribute workload. Enables near-linear scalability and fault tolerance but requires stateless design and adds operational complexity.",
    },
    {
      front: "What does stateless design mean?",
      back: "Each request is handled independently without relying on local state from previous requests. All shared state is externalized to backing services (Redis, S3, databases).",
    },
    {
      front: "What is session affinity (sticky sessions)?",
      back: "Routing all requests from a user to the same backend instance, typically via cookie or IP hash. Simplifies stateful apps but causes uneven load and increases failure impact.",
    },
    {
      front: "What is the 12-Factor App?",
      back: "A methodology for building cloud-native applications. Key principles include stateless processes, config in environment variables, disposable instances, and backing services as attached resources.",
    },
    {
      front: "When should you prefer vertical over horizontal scaling?",
      back: "When the workload is single-threaded, requires strong consistency, or fits within a single machine. Also when the team is small and lacks distributed systems experience.",
    },
    {
      front: "What is the hybrid scaling approach?",
      back: "Scale up each instance to a cost-effective size, then scale out horizontally for additional capacity. Keep databases vertically scaled as long as possible, adding read replicas before sharding.",
    },
  ],
  deepDive: [
    `## The Physics of Scaling: Why Linear Growth Is a Myth

When architects talk about **horizontal scaling**, they often claim it offers *near-linear scalability* — add 10 servers, get 10x throughput. In reality, **Amdahl's Law** governs every distributed system: if even 5% of your workload is inherently serial (e.g., a single-leader database write path, a global lock, or a sequential computation), then no amount of parallelism can yield more than a **20x speedup**. The serial fraction becomes the ceiling. This is why identifying and minimizing serial bottlenecks — shared mutable state, single-writer databases, global counters — is the *first* engineering task before scaling out. Techniques like **sharding** (partitioning data so each shard has its own serial path), **CRDTs** (conflict-free replicated data types that eliminate coordination), and **optimistic concurrency control** reduce the serial fraction, pushing the practical ceiling higher. Understanding this law prevents the common mistake of throwing more instances at a problem that is fundamentally bottlenecked on a single resource.`,

    `## Vertical Scaling Deep Dive: Hardware, Kernels, and the Memory Wall

Vertical scaling is not just "buy a bigger box." Effective scale-up requires understanding the **memory hierarchy**: L1 cache (~1ns), L2 cache (~4ns), L3 cache (~12ns), main RAM (~100ns), NVMe SSD (~20,000ns), network (~500,000ns). A vertically scaled application that fits its *working set* in L3 cache can outperform a horizontally scaled cluster by orders of magnitude, because every network hop is ~50,000x slower than an L3 hit. Modern CPUs like AMD EPYC 9004 series offer up to **128 cores** and **12 channels of DDR5**, making single-machine performance formidable. The kernel matters too: \`NUMA\`-aware memory allocation, \`io_uring\` for async I/O, and **huge pages** (2MB or 1GB pages that reduce TLB misses) can unlock 20-40% more throughput from the same hardware. The practical ceiling for vertical scaling today is approximately **448 vCPUs / 24 TB RAM** in cloud (AWS \`u-24tb1.metal\`) and roughly **256 cores / 12 TB RAM** in bare metal. Beyond these limits, you *must* scale horizontally regardless of preference.`,

    `## Horizontal Scaling Deep Dive: Statelessness, Service Meshes, and Auto-Scaling

Horizontal scaling in production involves far more than placing instances behind a load balancer. A mature scale-out architecture typically includes: (1) a **service mesh** like *Istio* or *Linkerd* handling mTLS, retries, circuit breaking, and observability between services; (2) an **auto-scaler** (Kubernetes HPA, AWS Auto Scaling) that adjusts instance count based on CPU, memory, request latency, or custom metrics like queue depth; (3) a **distributed tracing** system (Jaeger, OpenTelemetry) to debug requests that span dozens of instances. The key design principle is that every instance must be *disposable* — it can be killed at any time without data loss or user impact. This requires **graceful shutdown** (draining in-flight requests, deregistering from the load balancer), **health checks** (liveness and readiness probes in Kubernetes), and **externalized state**. Auto-scaling policies must account for **cold start** latency (JVM warm-up, connection pool initialization, cache warming) by scaling proactively based on *rate of change* of metrics, not just absolute thresholds. A common anti-pattern is scaling on CPU alone — a service waiting on database I/O may have low CPU but high latency, requiring scaling based on \`p99 response time\` or \`request queue depth\` instead.`,
  ],

  code: [
    {
      language: "nginx",
      caption: "Nginx reverse proxy configuration for **horizontal scaling** with upstream load balancing, health checks, and connection limits",
      source: `# Upstream block defines the pool of horizontally scaled backend instances.
# Nginx distributes requests across these instances using the configured
# load-balancing algorithm (default: round-robin).

upstream app_cluster {
    # Load-balancing strategies:
    #   (default)      — round-robin
    #   least_conn     — route to instance with fewest active connections
    #   ip_hash        — sticky sessions based on client IP (use sparingly)
    #   hash $request_uri — consistent hashing by URI (good for caching layers)

    least_conn;

    # Backend instances — typically auto-discovered via DNS or config management
    server 10.0.1.10:8080 max_fails=3 fail_timeout=30s weight=5;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=30s weight=5;
    server 10.0.1.12:8080 max_fails=3 fail_timeout=30s weight=3;

    # Passive health checks: after 3 failures within 30s, mark server as down.
    # Active health checks require Nginx Plus or OpenResty.

    # Keep-alive connections to backends (reduce TCP handshake overhead)
    keepalive 64;
    keepalive_timeout 60s;
}

server {
    listen 80;
    server_name app.example.com;

    # Connection and rate limiting (protect backends from overload)
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    limit_req_zone  $binary_remote_addr zone=req_limit:10m rate=100r/s;

    location / {
        proxy_pass http://app_cluster;

        # Required headers for backend to identify the original client
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Use HTTP/1.1 for upstream keepalive support
        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # Timeouts — tune based on your application's response characteristics
        proxy_connect_timeout 5s;
        proxy_read_timeout    60s;
        proxy_send_timeout    30s;

        # Rate limiting: burst allows short spikes, nodelay serves them immediately
        limit_req zone=req_limit burst=50 nodelay;
        limit_conn conn_limit 20;
    }

    # Health check endpoint (for external monitoring like AWS ALB or Kubernetes)
    location /health {
        proxy_pass http://app_cluster/health;
        access_log off;
    }
}`,
    },
    {
      language: "cpp",
      caption: "C++ thread pool for **vertical scaling** — maximize utilization of all CPU cores on a single machine using `std::jthread` and a lock-free task queue",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <future>
#include <stdexcept>

// ThreadPool: a vertical scaling primitive.
// Instead of adding more machines, we maximize utilization of all CPU cores
// on a single machine by distributing tasks across a pool of worker threads.

class ThreadPool {
public:
    // Construct with hardware_concurrency() to use all available cores.
    // This is vertical scaling in action: exploit the full capacity of one machine.
    explicit ThreadPool(size_t num_threads = std::thread::hardware_concurrency()) {
        if (num_threads == 0) num_threads = 4; // fallback

        for (size_t i = 0; i < num_threads; ++i) {
            workers_.emplace_back([this](std::stop_token stop_token) {
                while (true) {
                    std::function<void()> task;
                    {
                        std::unique_lock lock(mutex_);
                        cv_.wait(lock, [this, &stop_token] {
                            return stop_token.stop_requested() || !tasks_.empty();
                        });

                        if (stop_token.stop_requested() && tasks_.empty())
                            return;

                        task = std::move(tasks_.front());
                        tasks_.pop();
                    }
                    task(); // Execute on this core
                }
            });
        }
    }

    // Submit a task and get a future for its result.
    // Each task runs on one of the machine's cores — no network hops,
    // no serialization, no distributed coordination overhead.
    template <typename F, typename... Args>
    auto submit(F&& f, Args&&... args) -> std::future<std::invoke_result_t<F, Args...>> {
        using ReturnType = std::invoke_result_t<F, Args...>;

        auto task_ptr = std::make_shared<std::packaged_task<ReturnType()>>(
            std::bind(std::forward<F>(f), std::forward<Args>(args)...)
        );

        std::future<ReturnType> result = task_ptr->get_future();
        {
            std::unique_lock lock(mutex_);
            tasks_.emplace([task_ptr]() { (*task_ptr)(); });
        }
        cv_.notify_one();
        return result;
    }

    ~ThreadPool() {
        for (auto& w : workers_)
            w.request_stop();
        cv_.notify_all();
        // jthread auto-joins on destruction
    }

private:
    std::vector<std::jthread>          workers_;
    std::queue<std::function<void()>>  tasks_;
    std::mutex                         mutex_;
    std::condition_variable            cv_;
};

// Usage: vertically scale a CPU-bound workload across all cores.
int main() {
    ThreadPool pool; // uses all available cores (hardware_concurrency)

    std::vector<std::future<uint64_t>> futures;
    for (int i = 0; i < 100; ++i) {
        futures.push_back(pool.submit([](int task_id) -> uint64_t {
            // Simulate CPU-bound work (e.g., hashing, compression, ML inference)
            uint64_t sum = 0;
            for (uint64_t j = 0; j < 10'000'000; ++j)
                sum += j * task_id;
            return sum;
        }, i));
    }

    for (auto& f : futures)
        std::cout << f.get() << "\\n";

    return 0;
}`,
    },
    {
      language: "yaml",
      caption: "Kubernetes **Horizontal Pod Autoscaler** (HPA) manifest — automatically scales application instances based on CPU and custom metrics",
      source: `# HPA: the canonical horizontal scaling primitive in Kubernetes.
# It adjusts the replica count of a Deployment based on observed metrics,
# implementing automatic scale-out and scale-in.

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-server

  # Bounds: never go below 3 (availability) or above 50 (cost control)
  minReplicas: 3
  maxReplicas: 50

  metrics:
    # Scale on CPU utilization (classic horizontal scaling trigger)
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # Scale out when avg CPU > 70%

    # Scale on memory (catch memory-bound workloads)
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

    # Scale on custom metric: p99 response latency from Prometheus
    # This catches I/O-bound bottlenecks that CPU metrics miss.
    - type: Pods
      pods:
        metric:
          name: http_request_duration_p99
        target:
          type: AverageValue
          averageValue: 500m       # Scale out when p99 > 500ms

  behavior:
    # Scale up aggressively (respond to load spikes quickly)
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100               # Double replica count per scale event
          periodSeconds: 60
        - type: Pods
          value: 10                # Or add up to 10 pods per event
          periodSeconds: 60
      selectPolicy: Max

    # Scale down conservatively (avoid flapping)
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
        - type: Percent
          value: 25                # Remove at most 25% per event
          periodSeconds: 120`,
    },
  ],

  diagrams: [
    {
      title: "Horizontal vs Vertical Scaling",
      kind: "architecture",
      caption: "Comparing vertical scale-up with horizontal scale-out architectures.",
      mermaid: `graph TD
    subgraph Vertical Scaling Scale Up
        VS1[Small Server] --> VS2[Bigger Server]
        VS2 --> VS3[Even Bigger Server]
        VS3 --> VS4[Hardware Limit]
    end
    subgraph Horizontal Scaling Scale Out
        HS1[Server 1] --> LB[Load Balancer]
        HS2[Server 2] --> LB
        HS3[Server 3] --> LB
        LB --> Clients
    end`,
    },
    {
      title: "Scaling Strategy Decision",
      kind: "flow",
      caption: "Decision factors when choosing between horizontal and vertical scaling.",
      mermaid: `flowchart TD
    A[Need more capacity] --> B{Stateless workload?}
    B -- Yes --> C[Horizontal scaling preferred]
    C --> D{Session state needed?}
    D -- Yes --> E[Sticky sessions or shared cache]
    D -- No --> F[Simple load balancing]
    B -- No --> G{Can refactor to stateless?}
    G -- Yes --> C
    G -- No --> H[Vertical scaling required]
    H --> I{Hardware limit reached?}
    I -- Yes --> J[Must refactor architecture]
    I -- No --> K[Upgrade server resources]`,
    },
    {
      title: "Database Scaling Strategies",
      kind: "mindmap",
      caption: "Techniques for scaling databases horizontally and vertically.",
      mermaid: `mindmap
  root((DB Scaling))
    Vertical
      Bigger instance
      More RAM
      Faster SSD
    Read Replicas
      Distribute reads
      Async replication
    Sharding
      Horizontal partitioning
      Range sharding
      Hash sharding
    Caching Layer
      Redis Memcached
      Cache-aside pattern
      Write-through
    CQRS
      Separate read write models
      Event sourcing`,
    },
    {
      title: "Load Balancer Routing Algorithms",
      kind: "flow",
      caption: "How different load balancing algorithms distribute requests to servers.",
      mermaid: `flowchart TD
    A[Incoming Request] --> B[Load Balancer]
    B --> C{Algorithm?}
    C -- Round Robin --> D[Next server in rotation]
    C -- Least Connections --> E[Server with fewest active]
    C -- IP Hash --> F[Hash client IP to server]
    C -- Weighted --> G[Proportional to server capacity]
    D --> S1[Server Pool]
    E --> S1
    F --> S1
    G --> S1`,
    },
  ],

  comparison: {
    columns: [
      "Dimension",
      "Vertical Scaling (Scale-Up)",
      "Horizontal Scaling (Scale-Out)",
    ],
    rows: [
      [
        "**Mechanism**",
        "Add CPU, RAM, faster disks to *one* machine",
        "Add *more machines* behind a load balancer",
      ],
      [
        "**Complexity**",
        "*Low* — single process, no distributed coordination",
        "*High* — requires stateless design, service discovery, distributed tracing",
      ],
      [
        "**Scalability Ceiling**",
        "Limited by largest available hardware (~448 vCPUs, 24 TB RAM)",
        "Virtually unlimited — add instances as needed",
      ],
      [
        "**Fault Tolerance**",
        "*Poor* — single point of failure without standby",
        "*Excellent* — losing one instance has minimal impact",
      ],
      [
        "**Cost Curve**",
        "*Non-linear* — 2x capacity often costs 3-4x",
        "*Near-linear* — commodity hardware scales proportionally",
      ],
      [
        "**Downtime for Scaling**",
        "Often requires **restart or migration**",
        "**Zero downtime** — add/remove instances while running",
      ],
      [
        "**Data Consistency**",
        "*Strong* — single database, no replication lag",
        "*Eventual* — requires distributed consensus or conflict resolution",
      ],
      [
        "**Best For**",
        "CPU-bound, single-threaded, strong consistency workloads",
        "I/O-bound, parallelizable, high-availability workloads",
      ],
      [
        "**Database Strategy**",
        "Single instance with read replicas",
        "Sharding, partitioning, or distributed databases (CockroachDB, Vitess)",
      ],
      [
        "**Example**",
        "Upgrade `m5.xlarge` to `m5.16xlarge`",
        "Deploy 20x `m5.xlarge` behind an ALB",
      ],
    ],
  },

  exercises: [
    "**Design a Scaling Strategy**: You have a monolithic e-commerce application on a single `m5.4xlarge` instance (16 vCPUs, 64 GB RAM). Traffic is growing 30% month-over-month. Design a 6-month scaling roadmap that starts with vertical scaling and transitions to horizontal scaling. Identify which components (web server, app logic, database, file storage) you would scale out first and why. Include the criteria that trigger each scaling phase.",
    "**Externalize State**: Take this pseudocode for a stateful web server and refactor it to be stateless: the server stores user sessions in a local `HashMap`, writes uploaded files to `/tmp/uploads/`, and maintains a local in-memory counter for rate limiting. Describe exactly what backing services you would use and how the code changes for each piece of state.",
    "**Load Balancer Configuration**: Write an Nginx configuration that load-balances across 5 backend servers using `least_conn` strategy, implements passive health checks (mark server down after 2 failures in 10 seconds), and configures connection keep-alive to reduce TCP overhead. Explain why you chose `least_conn` over round-robin for this scenario.",
    "**Auto-Scaling Policy**: Design a Kubernetes HPA policy for a REST API service. The service is I/O-bound (low CPU but high latency under load). Define metrics, thresholds, scale-up/scale-down behaviors, and stabilization windows. Explain why CPU-based scaling alone would fail for this workload and what custom metrics you would use instead.",
    "**Failure Analysis**: In a horizontally scaled system with 10 application instances, the shared Redis cluster (used for sessions and caching) goes down. Describe the cascading failure sequence, the impact on users, and the mitigation strategies (circuit breakers, fallback caches, graceful degradation) you would implement to survive this scenario.",
  ],

  cheatSheet: [
    "**Vertical first, horizontal second**: Scale up each node to the cost-effective sweet spot (typically `8-16 vCPUs`), *then* scale out. Premature horizontal scaling adds complexity without proportional benefit.",
    "**Stateless = horizontally scalable**: If your app stores *any* per-request state locally (sessions in memory, files on disk, counters in process), it cannot scale horizontally. Externalize everything to Redis, S3, or a database.",
    "**Database is the last to shard**: Application servers are cheap to scale out; databases are not. Use **read replicas** and **connection pooling** (PgBouncer, ProxySQL) before sharding. Sharding introduces cross-shard joins, distributed transactions, and resharding pain.",
    "**Scale on the right metric**: CPU-based auto-scaling misses I/O-bound bottlenecks. Use `p99 latency`, `request queue depth`, or `active connections` as scaling triggers for I/O-heavy services.",
    "**Amdahl's Law limits parallelism**: If 5% of your workload is serial, maximum speedup is 20x regardless of instance count. Identify and minimize serial bottlenecks (global locks, single-writer databases) before scaling out.",
    "**Graceful shutdown is mandatory**: Horizontally scaled instances must handle `SIGTERM` by draining in-flight requests, deregistering from the load balancer, and closing connections cleanly. Without this, every scale-in or deployment causes errors.",
  ],

  revisionNotes: [
    "**Vertical scaling** adds resources (CPU, RAM, SSD) to a *single machine*. Simple and consistent, but limited by hardware ceiling (~448 vCPUs / 24 TB RAM in cloud), non-linear cost curve (2x capacity = 3-4x price), and single point of failure. Best for CPU-bound, single-threaded, or strong-consistency workloads.",
    "**Horizontal scaling** adds *more machines* behind a load balancer. Enables near-linear scalability and fault tolerance, but requires **stateless design** (externalize sessions to Redis, uploads to S3, config to env vars). Key challenges: distributed consistency (CAP theorem), operational complexity, and shared-resource bottlenecks (database, message queue).",
    "**The hybrid approach** is standard in production: scale up each instance to a cost-effective size (`8-16 vCPUs`), then scale out for capacity. Keep the database vertically scaled as long as possible, using read replicas as a middle ground before sharding. Auto-scalers (Kubernetes HPA, AWS ASG) automate scale-out/scale-in based on CPU, memory, latency, or custom metrics.",
    "**Sticky sessions** (session affinity) pin users to specific instances. They simplify stateful apps but cause **uneven load distribution**, **increased failure impact**, and **scaling friction**. The solution is to externalize state and make instances truly interchangeable.",
    "**Key interview points**: (1) Statelessness is the prerequisite for horizontal scaling. (2) Amdahl's Law limits parallel speedup. (3) The database is the hardest component to scale horizontally. (4) Auto-scaling should use application-level metrics (p99 latency, queue depth), not just CPU. (5) Graceful shutdown and health checks are mandatory for instance disposability.",
  ],

  glossary: [
    {
      term: "Vertical Scaling (Scale-Up)",
      definition:
        "Increasing capacity by adding more resources to a single machine — more CPU, RAM, or faster storage.",
    },
    {
      term: "Horizontal Scaling (Scale-Out)",
      definition:
        "Increasing capacity by adding more machines to distribute the workload, typically behind a load balancer.",
    },
    {
      term: "Stateless Design",
      definition:
        "An architecture where each request is handled independently, with no per-client state stored locally on the server instance.",
    },
    {
      term: "Session Affinity",
      definition:
        "A load balancing strategy that routes all requests from the same client to the same backend instance, also called sticky sessions.",
    },
    {
      term: "12-Factor App",
      definition:
        "A methodology for building scalable, maintainable cloud-native applications, emphasizing stateless processes, externalized config, and disposable instances.",
    },
    {
      term: "Read Replica",
      definition:
        "A read-only copy of a database that serves read queries, reducing load on the primary and serving as a middle ground before full sharding.",
    },
    {
      term: "Share-Nothing Architecture",
      definition:
        "A design where each node is independent and self-sufficient, sharing no memory or disk storage with other nodes, enabling linear horizontal scalability.",
    },
  ],
};
