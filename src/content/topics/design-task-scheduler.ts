import type { TopicContent } from "../types";

export const designTaskScheduler: TopicContent = {
  quickSummary: [
    "A distributed task scheduler is essentially a distributed cron system that manages millions of scheduled tasks across a fleet of workers, ensuring each task runs exactly once, at the right time, with proper failure handling and retries.",
    "The core components are: a task store (database holding task definitions and state), a scheduler service (determines when tasks should fire), a dispatcher (assigns ready tasks to workers), and a worker pool (executes the actual task logic).",
    "Exactly-once execution is the hardest guarantee: you achieve it through a combination of distributed locking (lease-based), idempotent task handlers, and a state machine that tracks each task through PENDING, CLAIMED, RUNNING, SUCCEEDED, or FAILED states.",
    "Scaling to millions of tasks requires partitioning the task space (by hash, time bucket, or tenant), using priority queues with multiple levels, and separating the scheduling hot path (what fires next?) from the cold storage of task definitions.",
    "Failure handling must account for worker crashes (heartbeat-based lease expiry), scheduler crashes (redundant scheduler replicas with leader election), and network partitions (fencing tokens to prevent stale workers from completing tasks)."
  ],

  detailed: [
    "## Task Storage and Data Model\nThe task store is the source of truth for all task definitions and their current state. Each task record includes a unique task ID, the task type or handler name, a serialized payload, a scheduling specification (cron expression, one-shot timestamp, or event trigger), the current state (PENDING, SCHEDULED, CLAIMED, RUNNING, SUCCEEDED, FAILED, CANCELLED), a priority level, retry count, max retries, and metadata like creation time, last execution time, and next fire time. For millions of tasks, you need to partition this store. A common approach is to separate the schedule index (a time-sorted structure mapping next-fire-time to task ID) from the full task record store. The schedule index can live in Redis sorted sets keyed by time bucket (e.g., per-minute or per-second buckets), while the full records live in a sharded relational database or DynamoDB. This separation lets the scheduler scan upcoming tasks in O(log N) without loading full payloads.",

    "## Scheduling Strategies and Time Management\nTime-based scheduling requires a reliable notion of 'now' across a distributed cluster. You cannot trust wall clocks across machines, so the scheduler uses a single time source (database timestamp or a dedicated time oracle). The scheduler partitions the timeline into windows (e.g., 1-second or 10-second buckets) and scans the next few windows ahead to prefetch tasks that will soon be ready. For cron-based recurring tasks, the scheduler computes the next fire time after each execution and writes it back to the schedule index. Event-based scheduling adds a separate trigger path: an event bus (Kafka, SQS) delivers trigger events, and a trigger-matcher service evaluates whether any registered task should fire. The key trade-off is polling vs. push: polling the schedule index every second is simple but adds latency and database load; a push-based approach using delay queues (SQS delay, Redis keyspace notifications) reduces latency but adds complexity. At scale, most systems use a hybrid: poll for the next batch of tasks every 500ms-1s, and use push notifications for high-priority or event-driven tasks.",

    "## Worker Pool and Execution Engine\nThe worker pool is a fleet of stateless processes that pull tasks from a dispatch queue and execute them. Each worker registers itself with a service registry (Consul, etcd, or a custom heartbeat table) and advertises its capacity (how many concurrent tasks it can handle, which task types it supports). The dispatcher assigns tasks to workers using a strategy: round-robin for uniform tasks, least-loaded for heterogeneous workloads, or affinity-based to route tasks of the same type to the same workers (improving cache hit rates). Workers execute tasks within a sandbox with resource limits (CPU time, memory, wall-clock timeout). Each worker sends periodic heartbeats (every 5-10 seconds) to renew its lease on the task. If a heartbeat is missed for 3 consecutive intervals, the task is considered abandoned, its state resets to PENDING, and it re-enters the dispatch queue. This lease-based model is critical for exactly-once semantics: only the worker holding the current lease (identified by a monotonically increasing fencing token) can mark the task as completed.",

    "## Exactly-Once Execution and Failure Handling\nExactly-once execution in a distributed system is achieved through three layers. First, the claim layer: when the dispatcher assigns a task, it performs an atomic compare-and-swap on the task state (SCHEDULED to CLAIMED) with a fencing token. Only one worker wins the CAS operation. Second, the execution layer: the worker executes the task and writes the result back with the same fencing token. The store rejects any write with a stale fencing token, preventing a zombie worker (one whose lease expired but is still running) from overwriting a fresh execution. Third, the idempotency layer: task handlers must be idempotent, meaning running the same task twice produces the same side effects. This is the application-level safety net. For failure handling, tasks define a retry policy (max attempts, backoff strategy: fixed, exponential, or exponential with jitter). After exhausting retries, tasks move to a dead-letter queue for manual inspection. The system also supports circuit-breaking: if a task type fails repeatedly across multiple workers, the scheduler can pause that task type to prevent cascading failures.",

    "## Scaling, Priority, and Task Dependencies\nTo handle millions of tasks, the scheduler itself must be horizontally scalable. Multiple scheduler instances run concurrently, each owning a partition of the task space (assigned via consistent hashing or a lease-based partition manager). Each scheduler instance scans only its partition of the schedule index. Priority is implemented with multiple dispatch queues (e.g., P0-critical, P1-high, P2-normal, P3-low), and workers drain higher-priority queues first using a weighted fair-queuing algorithm. For task dependencies (task B runs only after task A completes), the system maintains a DAG (directed acyclic graph) of dependencies. When task A completes, the scheduler evaluates whether all predecessors of task B are done and, if so, moves task B to SCHEDULED. At 10 million tasks with 100K firing per minute, you need approximately 50-100 scheduler partitions, 500-1000 workers, and a schedule index that supports 100K reads/writes per second. Redis cluster or a time-series-optimized database handles this index load well."
  ],

  deepDive: [
    "The schedule index design is where most distributed schedulers differentiate themselves. A naive approach scans a sorted table of next-fire-times, but this creates a hot partition around the current timestamp. The time-bucket approach shards the timeline: bucket keys are epoch seconds (or 10-second intervals), and each bucket contains a set of task IDs firing in that window. The scheduler advances a cursor through buckets, popping all tasks from the current bucket. Missed buckets (due to scheduler downtime) are detected by comparing the cursor position against wall-clock time, and all overdue buckets are drained immediately on recovery. This design also enables efficient recurring task handling: after executing a cron task, you simply insert its ID into the future bucket corresponding to the next fire time, which is an O(1) operation.",

    "Fencing tokens deserve special attention because they are the mechanism that prevents split-brain execution. When a worker claims a task, the store issues a monotonically increasing token (e.g., backed by a database sequence or an atomic counter in Redis). The worker includes this token in all subsequent operations (heartbeats, status updates, result writes). If the worker's lease expires and the task is re-assigned to a new worker with a higher token, the old worker's writes are rejected because its token is stale. This is a form of optimistic concurrency control. The fencing token must also be propagated to downstream systems: if the task writes to a database, the database row should include a column for the fencing token, and updates should be conditional on the token being current. Without end-to-end fencing, a slow worker can corrupt data even after its lease has expired.",

    "Multi-tenancy adds another dimension of complexity. In a shared scheduler serving multiple teams or customers, you need per-tenant rate limiting (tenant A cannot starve tenant B), per-tenant quotas (max tasks, max execution time), and tenant-aware priority (a tenant's P0 task should not preempt another tenant's already-running task). The typical approach is to give each tenant a virtual scheduler partition with a guaranteed minimum throughput (e.g., 1000 tasks/minute) and burst capacity drawn from a shared pool. Tenant isolation in the worker pool is achieved through container-level sandboxing or separate worker groups per tenant tier.",

    "Observability and operational tooling are critical for a scheduler handling millions of tasks. You need real-time dashboards showing tasks scheduled vs. fired vs. completed per second, p50/p95/p99 scheduling latency (time between intended fire time and actual execution start), worker utilization, queue depths per priority level, and retry/DLQ rates. Alerting should cover: scheduling lag exceeding SLA (e.g., more than 5 seconds), DLQ growth rate spikes, worker pool saturation (all workers at max capacity), and partition imbalance (one scheduler partition has 10x the tasks of others). A task audit log recording every state transition with timestamps enables debugging any execution anomaly."
  ],

  code: [
    {
      language: "cpp",
      caption: "Priority queue-based scheduler using a min-heap keyed by next fire time",
      source: `#include <queue>
#include <string>
#include <chrono>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <unordered_map>
#include <vector>
#include <iostream>

using Clock = std::chrono::steady_clock;
using TimePoint = Clock::time_point;

enum class TaskState {
    PENDING, SCHEDULED, CLAIMED, RUNNING, SUCCEEDED, FAILED, CANCELLED
};

struct ScheduledTask {
    std::string task_id;
    int priority;          // lower number = higher priority
    TimePoint fire_time;
    std::string payload;
    TaskState state;
    int retry_count;
    int max_retries;
    uint64_t fencing_token;

    // Min-heap: earliest fire time first, then highest priority
    bool operator>(const ScheduledTask& other) const {
        if (fire_time != other.fire_time)
            return fire_time > other.fire_time;
        return priority > other.priority;
    }
};

class TaskScheduler {
public:
    void add_task(ScheduledTask task) {
        std::lock_guard<std::mutex> lock(mu_);
        task.state = TaskState::SCHEDULED;
        task.fencing_token = next_token_++;
        task_index_[task.task_id] = task;
        ready_queue_.push(task);
        cv_.notify_one();
    }

    // Blocks until a task is ready to fire, then returns it
    ScheduledTask claim_next_task() {
        std::unique_lock<std::mutex> lock(mu_);
        while (true) {
            if (ready_queue_.empty()) {
                cv_.wait(lock);
                continue;
            }
            auto now = Clock::now();
            auto& top = ready_queue_.top();
            if (top.fire_time > now) {
                // Sleep until earliest task is ready
                cv_.wait_until(lock, top.fire_time);
                continue;
            }
            ScheduledTask task = ready_queue_.top();
            ready_queue_.pop();

            // Skip if task was cancelled or already claimed
            auto it = task_index_.find(task.task_id);
            if (it == task_index_.end() ||
                it->second.state != TaskState::SCHEDULED) {
                continue;
            }

            // Atomic state transition: SCHEDULED -> CLAIMED
            it->second.state = TaskState::CLAIMED;
            it->second.fencing_token = next_token_++;
            return it->second;
        }
    }

    bool complete_task(const std::string& task_id,
                       uint64_t fencing_token, bool success) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = task_index_.find(task_id);
        if (it == task_index_.end()) return false;

        // Reject stale fencing token
        if (it->second.fencing_token != fencing_token) {
            std::cerr << "Stale fencing token for task "
                      << task_id << std::endl;
            return false;
        }

        if (success) {
            it->second.state = TaskState::SUCCEEDED;
        } else {
            it->second.retry_count++;
            if (it->second.retry_count < it->second.max_retries) {
                // Exponential backoff: 2^retry * base_delay
                auto delay = std::chrono::seconds(
                    1 << it->second.retry_count);
                it->second.fire_time = Clock::now() + delay;
                it->second.state = TaskState::SCHEDULED;
                it->second.fencing_token = next_token_++;
                ready_queue_.push(it->second);
                cv_.notify_one();
            } else {
                it->second.state = TaskState::FAILED;
                // Move to dead-letter queue
            }
        }
        return true;
    }

private:
    std::priority_queue<ScheduledTask,
        std::vector<ScheduledTask>,
        std::greater<ScheduledTask>> ready_queue_;
    std::unordered_map<std::string, ScheduledTask> task_index_;
    std::mutex mu_;
    std::condition_variable cv_;
    uint64_t next_token_ = 1;
};`
    },
    {
      language: "cpp",
      caption: "Task state machine with validated transitions and fencing tokens",
      source: `#include <string>
#include <unordered_map>
#include <unordered_set>
#include <stdexcept>
#include <cstdint>
#include <iostream>
#include <sstream>

enum class TaskState {
    PENDING, SCHEDULED, CLAIMED, RUNNING, SUCCEEDED, FAILED, CANCELLED
};

std::string state_name(TaskState s) {
    switch (s) {
        case TaskState::PENDING:   return "PENDING";
        case TaskState::SCHEDULED: return "SCHEDULED";
        case TaskState::CLAIMED:   return "CLAIMED";
        case TaskState::RUNNING:   return "RUNNING";
        case TaskState::SUCCEEDED: return "SUCCEEDED";
        case TaskState::FAILED:    return "FAILED";
        case TaskState::CANCELLED: return "CANCELLED";
    }
    return "UNKNOWN";
}

class TaskStateMachine {
public:
    TaskStateMachine() {
        // Define valid state transitions
        transitions_[TaskState::PENDING]   = {TaskState::SCHEDULED,
                                               TaskState::CANCELLED};
        transitions_[TaskState::SCHEDULED] = {TaskState::CLAIMED,
                                               TaskState::CANCELLED};
        transitions_[TaskState::CLAIMED]   = {TaskState::RUNNING,
                                               TaskState::SCHEDULED};
        transitions_[TaskState::RUNNING]   = {TaskState::SUCCEEDED,
                                               TaskState::FAILED};
        transitions_[TaskState::FAILED]    = {TaskState::SCHEDULED,
                                               TaskState::CANCELLED};
        // Terminal states: SUCCEEDED, CANCELLED have no transitions
    }

    struct TransitionResult {
        bool success;
        uint64_t new_token;
        std::string error;
    };

    TransitionResult transition(const std::string& task_id,
                                TaskState from, TaskState to,
                                uint64_t provided_token) {
        // Validate transition is allowed
        auto it = transitions_.find(from);
        if (it == transitions_.end() ||
            it->second.find(to) == it->second.end()) {
            std::ostringstream oss;
            oss << "Invalid transition: " << state_name(from)
                << " to " << state_name(to);
            return {false, 0, oss.str()};
        }

        // Validate fencing token
        auto tok_it = current_tokens_.find(task_id);
        if (tok_it != current_tokens_.end() &&
            tok_it->second != provided_token) {
            return {false, 0,
                "Fencing token mismatch: stale claim detected"};
        }

        // Issue new fencing token for the new state
        uint64_t new_token = ++global_token_counter_;
        current_tokens_[task_id] = new_token;

        return {true, new_token, ""};
    }

    // Check if a state is terminal (no further transitions)
    bool is_terminal(TaskState s) const {
        return s == TaskState::SUCCEEDED ||
               s == TaskState::CANCELLED;
    }

    // Check if a task can be retried from its current state
    bool is_retriable(TaskState s) const {
        return s == TaskState::FAILED ||
               s == TaskState::CLAIMED;
    }

private:
    std::unordered_map<TaskState,
        std::unordered_set<TaskState>> transitions_;
    std::unordered_map<std::string, uint64_t> current_tokens_;
    uint64_t global_token_counter_ = 0;
};`
    },
    {
      language: "cpp",
      caption: "Worker pool manager with heartbeat-based lease tracking",
      source: `#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <chrono>
#include <thread>
#include <functional>
#include <queue>
#include <atomic>
#include <iostream>

using Clock = std::chrono::steady_clock;
using TimePoint = Clock::time_point;

struct WorkerInfo {
    std::string worker_id;
    int max_concurrent_tasks;
    int active_task_count;
    TimePoint last_heartbeat;
    bool is_alive;
    std::vector<std::string> supported_task_types;
};

struct TaskAssignment {
    std::string task_id;
    std::string worker_id;
    uint64_t fencing_token;
    TimePoint lease_expiry;
};

class WorkerPoolManager {
public:
    explicit WorkerPoolManager(
        std::chrono::seconds heartbeat_interval = std::chrono::seconds(5),
        int missed_heartbeats_threshold = 3)
        : heartbeat_interval_(heartbeat_interval),
          missed_threshold_(missed_heartbeats_threshold),
          running_(true) {
        // Start lease checker background thread
        lease_checker_ = std::thread([this]() {
            while (running_.load()) {
                check_expired_leases();
                std::this_thread::sleep_for(heartbeat_interval_);
            }
        });
    }

    ~WorkerPoolManager() {
        running_.store(false);
        if (lease_checker_.joinable())
            lease_checker_.join();
    }

    void register_worker(const WorkerInfo& info) {
        std::lock_guard<std::mutex> lock(mu_);
        workers_[info.worker_id] = info;
        workers_[info.worker_id].last_heartbeat = Clock::now();
        workers_[info.worker_id].is_alive = true;
        std::cout << "Worker registered: " << info.worker_id
                  << " (capacity: " << info.max_concurrent_tasks
                  << ")" << std::endl;
    }

    bool process_heartbeat(const std::string& worker_id) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = workers_.find(worker_id);
        if (it == workers_.end()) return false;
        it->second.last_heartbeat = Clock::now();
        it->second.is_alive = true;
        return true;
    }

    // Select best worker using least-loaded strategy
    std::string select_worker(const std::string& task_type) {
        std::lock_guard<std::mutex> lock(mu_);
        std::string best_worker;
        int min_load = INT32_MAX;

        for (auto& [id, info] : workers_) {
            if (!info.is_alive) continue;
            if (info.active_task_count >= info.max_concurrent_tasks)
                continue;

            // Check task type support
            bool supports = info.supported_task_types.empty();
            for (auto& t : info.supported_task_types) {
                if (t == task_type) { supports = true; break; }
            }
            if (!supports) continue;

            if (info.active_task_count < min_load) {
                min_load = info.active_task_count;
                best_worker = id;
            }
        }
        if (!best_worker.empty()) {
            workers_[best_worker].active_task_count++;
        }
        return best_worker;
    }

    void release_task(const std::string& worker_id) {
        std::lock_guard<std::mutex> lock(mu_);
        auto it = workers_.find(worker_id);
        if (it != workers_.end() && it->second.active_task_count > 0) {
            it->second.active_task_count--;
        }
    }

    // Called by on_lease_expired callback to re-enqueue tasks
    std::function<void(const std::string&)> on_lease_expired;

private:
    void check_expired_leases() {
        std::lock_guard<std::mutex> lock(mu_);
        auto now = Clock::now();
        auto threshold = heartbeat_interval_ * missed_threshold_;

        for (auto& [id, info] : workers_) {
            if (!info.is_alive) continue;
            auto elapsed = now - info.last_heartbeat;
            if (elapsed > threshold) {
                std::cout << "Worker " << id
                          << " missed heartbeats, marking dead"
                          << std::endl;
                info.is_alive = false;
                // Re-enqueue all tasks assigned to this worker
                if (on_lease_expired) {
                    on_lease_expired(id);
                }
                info.active_task_count = 0;
            }
        }
    }

    std::unordered_map<std::string, WorkerInfo> workers_;
    std::mutex mu_;
    std::chrono::seconds heartbeat_interval_;
    int missed_threshold_;
    std::thread lease_checker_;
    std::atomic<bool> running_;
};`
    }
  ],

  diagrams: [
    {
      title: "Distributed Task Scheduler Architecture",
      kind: "architecture",
      caption: "High-level architecture showing the flow from task submission through scheduling, dispatching, and execution by the worker pool.",
      mermaid: `graph LR
    Client["Client / API"]
    TaskStore["Task Store DB"]
    ScheduleIdx["Schedule Index - Redis"]
    Scheduler1["Scheduler Partition 1"]
    Scheduler2["Scheduler Partition 2"]
    DispatchQ["Dispatch Queues - P0 P1 P2"]
    W1["Worker 1"]
    W2["Worker 2"]
    W3["Worker N"]
    DLQ["Dead Letter Queue"]
    ResultStore["Result Store"]

    Client -->|Submit Task| TaskStore
    TaskStore -->|Index next fire time| ScheduleIdx
    ScheduleIdx -->|Scan ready tasks| Scheduler1
    ScheduleIdx -->|Scan ready tasks| Scheduler2
    Scheduler1 -->|Enqueue| DispatchQ
    Scheduler2 -->|Enqueue| DispatchQ
    DispatchQ -->|Claim| W1
    DispatchQ -->|Claim| W2
    DispatchQ -->|Claim| W3
    W1 -->|Result| ResultStore
    W2 -->|Result| ResultStore
    W3 -->|Failed after retries| DLQ`
    },
    {
      title: "Task State Machine",
      kind: "flow",
      caption: "Valid state transitions for a task, including retry paths and terminal states.",
      mermaid: `flowchart TD
    PENDING["PENDING"]
    SCHEDULED["SCHEDULED"]
    CLAIMED["CLAIMED"]
    RUNNING["RUNNING"]
    SUCCEEDED["SUCCEEDED - Terminal"]
    FAILED["FAILED"]
    CANCELLED["CANCELLED - Terminal"]

    PENDING -->|"Scheduler picks up"| SCHEDULED
    PENDING -->|"User cancels"| CANCELLED
    SCHEDULED -->|"Worker claims with CAS"| CLAIMED
    SCHEDULED -->|"User cancels"| CANCELLED
    CLAIMED -->|"Worker starts execution"| RUNNING
    CLAIMED -->|"Lease expired, re-enqueue"| SCHEDULED
    RUNNING -->|"Execution succeeds"| SUCCEEDED
    RUNNING -->|"Execution fails"| FAILED
    FAILED -->|"Retry with backoff"| SCHEDULED
    FAILED -->|"Max retries exceeded"| CANCELLED`
    },
    {
      title: "Exactly-Once Execution Sequence",
      kind: "sequence",
      caption: "Sequence showing how fencing tokens prevent duplicate execution when a worker lease expires.",
      mermaid: `sequenceDiagram
    participant S as Scheduler
    participant TS as Task Store
    participant W1 as Worker A
    participant W2 as Worker B

    S->>TS: Scan ready tasks at time T
    TS-->>S: Task-123 ready, state SCHEDULED
    S->>TS: CAS state SCHEDULED to CLAIMED, token=42
    TS-->>S: Success
    S->>W1: Assign Task-123, token=42
    W1->>TS: Heartbeat token=42
    Note over W1: Worker A becomes slow
    W1--xTS: Missed 3 heartbeats
    TS->>TS: Lease expired, state CLAIMED to SCHEDULED
    S->>TS: CAS state SCHEDULED to CLAIMED, token=43
    S->>W2: Assign Task-123, token=43
    W2->>TS: Execute and write result, token=43
    TS-->>W2: Success, state SUCCEEDED
    W1->>TS: Late write attempt, token=42
    TS-->>W1: Rejected - stale fencing token`
    },
    {
      title: "Time-Bucket Schedule Index",
      kind: "flow",
      caption: "How the schedule index partitions tasks into time buckets for efficient scanning.",
      mermaid: `flowchart TD
    subgraph TimeBuckets["Time Buckets in Redis"]
        B1["Bucket T+0s: task-1 task-5 task-9"]
        B2["Bucket T+1s: task-2 task-7"]
        B3["Bucket T+2s: task-3 task-4 task-8"]
        B4["Bucket T+3s: task-6"]
    end

    Cursor["Scheduler Cursor at T+0"]
    Cursor -->|"Pop all tasks"| B1
    B1 -->|"Dispatch"| DQ["Dispatch Queue"]
    DQ --> W["Workers execute"]
    W -->|"Cron task done"| Reinsert["Compute next fire time"]
    Reinsert -->|"Insert into future bucket"| B4
    Cursor -->|"Advance cursor"| B2`
    }
  ],

  interviewQA: [
    {
      q: "How would you design a distributed task scheduler that handles millions of scheduled tasks?",
      a: "I would start by identifying the core components: a task store for persistence, a schedule index for efficient time-based lookups, multiple scheduler instances for horizontal scaling, dispatch queues for priority-based routing, and a worker pool for execution. The task store holds full task definitions in a sharded database (PostgreSQL with hash-based sharding or DynamoDB). The schedule index is a separate structure optimized for the query 'what tasks fire in the next N seconds' -- I would use Redis sorted sets with score = next_fire_time, partitioned into time buckets (one key per second or per 10-second window). Multiple scheduler instances each own a partition of the task space via consistent hashing, and each independently scans its partition of the schedule index. When a task is ready, the scheduler performs an atomic CAS to move it from SCHEDULED to CLAIMED and enqueues it to priority-based dispatch queues. Workers pull from these queues, execute the task, and report results. At 10M tasks with 100K firings per minute, I would size this at roughly 50-100 scheduler partitions and 500-1000 worker instances.",
      followUps: [
        "How do you handle clock skew across scheduler instances?",
        "What happens when a scheduler partition fails mid-scan?"
      ]
    },
    {
      q: "How do you guarantee exactly-once execution in a distributed task scheduler?",
      a: "Exactly-once execution requires three complementary mechanisms. First, at the claim layer, I use an atomic compare-and-swap operation: the scheduler sets the task state from SCHEDULED to CLAIMED only if the current state is still SCHEDULED, issuing a new fencing token (a monotonically increasing integer from a database sequence). Only one scheduler or worker wins this CAS. Second, at the execution layer, the worker includes its fencing token in all writes. If its lease expires and the task is re-assigned with a higher token, the old worker's writes are rejected by the task store because the token is stale. This prevents zombie workers from corrupting results. Third, at the application layer, task handlers must be idempotent. Even with fencing tokens, network retries can cause duplicate delivery, so the handler should produce the same result regardless of how many times it runs. For example, 'set balance to X' is idempotent but 'add 10 to balance' is not -- the latter needs an idempotency key. The fencing token must propagate end-to-end: if the task writes to an external database, that write should be conditional on the fencing token being current.",
      followUps: [
        "How do fencing tokens work with external systems that dont support them?",
        "Can you achieve exactly-once without idempotent handlers?"
      ]
    },
    {
      q: "How do you handle task dependencies where task B must run only after task A completes?",
      a: "I would model task dependencies as a directed acyclic graph (DAG) stored alongside the task definitions. Each task record includes a list of predecessor task IDs. When a task completes successfully, the scheduler queries all tasks that list it as a predecessor and checks whether all of their predecessors are now in the SUCCEEDED state. If so, the dependent task transitions from PENDING to SCHEDULED and enters the schedule index. For complex DAGs (like data pipeline workflows with dozens of stages), I would use a dedicated DAG evaluation service that maintains an in-memory adjacency list and computes ready tasks efficiently. The key challenge is handling failures in the DAG: if task A fails, do you fail all downstream tasks immediately, or do you wait for retries? I would implement a configurable policy per DAG -- 'fail-fast' stops the entire DAG on any failure, while 'best-effort' allows independent branches to continue. Circular dependency detection happens at task submission time using a topological sort; submissions that would create a cycle are rejected. For very large DAGs (1000+ nodes), I would partition the DAG evaluation across multiple instances, each responsible for a subset of DAGs.",
      followUps: [
        "How would you visualize and debug a complex task DAG?",
        "How do you handle dynamic DAGs where tasks are added at runtime?"
      ]
    },
    {
      q: "How would you implement priority queues in the task scheduler, and what are the trade-offs?",
      a: "I would implement multiple priority levels (typically 4: P0-critical, P1-high, P2-normal, P3-low) as separate dispatch queues. Workers drain queues in strict priority order by default: check P0 first, then P1, and so on. However, strict priority ordering risks starvation of low-priority tasks, so I would use weighted fair queuing: workers spend 50% of their capacity on P0, 30% on P1, 15% on P2, and 5% on P3. This ensures that even P3 tasks make progress. An alternative is time-based priority aging: a P3 task that has been waiting for more than 30 minutes gets automatically promoted to P2, and after 2 hours to P1. This prevents indefinite starvation while still respecting priority under normal load. The queue implementation itself uses Redis lists (LPUSH/BRPOP) for each priority level, which gives O(1) enqueue and dequeue. For the scheduler's internal priority queue (deciding which tasks to scan next), I use a min-heap keyed by (fire_time, priority), so tasks with the same fire time are ordered by priority. The trade-off between strict and weighted priority is latency vs. fairness: strict priority gives best-case latency for P0 tasks but can starve everything else during a P0 burst.",
      followUps: [
        "How do you prevent a single tenant from flooding the P0 queue?",
        "What metrics would you monitor for priority queue health?"
      ]
    },
    {
      q: "How do you handle recurring (cron) tasks efficiently at scale?",
      a: "For recurring tasks, I store the cron expression in the task definition and compute the next fire time after each successful execution. The key insight is that a recurring task exists as a single record in the task store, but appears in the schedule index at its next fire time. After execution, the scheduler computes the next fire time from the cron expression, updates the task record, and inserts it into the appropriate time bucket in the schedule index. This is an O(1) operation. For millions of recurring tasks, the challenge is the 'thundering herd' at common cron times (midnight, top of the hour, every 5 minutes). I mitigate this with jitter: each recurring task gets a random offset (0 to 30 seconds) added to its fire time, spreading the load across the time window. The cron expression parser handles standard 5-field cron syntax plus extensions like '@every 5m' and '@daily'. For time zone handling, each task stores its timezone alongside the cron expression, and the scheduler converts to UTC for the schedule index. Missed executions (when the scheduler was down during a fire time) are handled by a configurable policy: 'fire-once' runs the task once immediately on recovery, 'fire-all' runs it once for each missed interval, and 'skip' simply computes the next future fire time.",
      followUps: [
        "How do you handle daylight saving time transitions for cron tasks?",
        "What if a recurring task is still running when its next fire time arrives?"
      ]
    }
  ],

  mcqs: [
    {
      q: "A worker claims a task with fencing token 42 but becomes slow. The scheduler reassigns the task to another worker with token 43. What happens when the original worker tries to write its result with token 42?",
      options: [
        "The write succeeds because the task was assigned to it first",
        "The write is rejected because token 42 is stale",
        "The system enters a split-brain state with two results",
        "The second worker's execution is cancelled"
      ],
      answerIndex: 1,
      explanation: "Fencing tokens provide monotonically increasing values. The task store rejects any write with a token lower than the current one (43), so the stale worker's write with token 42 is rejected. This is the core mechanism for preventing duplicate execution by zombie workers."
    },
    {
      q: "Which schedule index design best supports scanning millions of tasks for ones that should fire in the next second?",
      options: [
        "A B-tree index on next_fire_time in a relational database",
        "A hash map from task ID to fire time",
        "Redis sorted sets partitioned into per-second time buckets",
        "A full table scan with an in-memory filter"
      ],
      answerIndex: 2,
      explanation: "Time-bucketed Redis sorted sets allow O(1) access to the current bucket and O(M) retrieval of all M tasks in that bucket. A B-tree index would work but creates a hot-spot around the current time. A hash map requires scanning all entries. Time buckets naturally partition the scanning work and support efficient cursor advancement."
    },
    {
      q: "What is the primary risk of using strict priority ordering (always drain P0 before P1) in dispatch queues?",
      options: [
        "P0 tasks will have higher latency",
        "Lower-priority tasks may be starved indefinitely during sustained P0 load",
        "Workers will become overloaded with P0 tasks",
        "The dispatch queue will run out of memory"
      ],
      answerIndex: 1,
      explanation: "Strict priority ordering means workers always process higher-priority tasks first. During a sustained burst of P0 tasks, P1/P2/P3 tasks accumulate without being processed, leading to starvation. Weighted fair queuing or priority aging mitigates this by guaranteeing minimum throughput for each priority level."
    },
    {
      q: "When a scheduler instance crashes, how should the system handle the tasks assigned to its partition?",
      options: [
        "Those tasks are lost and must be resubmitted by clients",
        "A standby scheduler immediately takes over the partition via leader election or lease acquisition",
        "All other schedulers split the orphaned partition equally and reprocess it",
        "The worker pool detects the scheduler failure and reschedules tasks autonomously"
      ],
      answerIndex: 1,
      explanation: "Scheduler partitions use lease-based ownership. When a scheduler crashes, its lease expires, and a standby (or another active scheduler) acquires the lease for the orphaned partition. The new owner re-scans the partition's schedule index, picks up any overdue tasks, and resumes normal scanning. Task state is in the persistent store, so no tasks are lost."
    }
  ],

  flashcards: [
    {
      front: "What are the five core components of a distributed task scheduler?",
      back: "Task Store (persistent task definitions), Schedule Index (time-sorted lookup for upcoming tasks), Scheduler Service (scans index, dispatches ready tasks), Dispatch Queues (priority-based routing), and Worker Pool (stateless executors with heartbeats)."
    },
    {
      front: "How does a fencing token prevent duplicate task execution?",
      back: "Each task claim issues a monotonically increasing token. The task store rejects writes with tokens lower than the current one, so if a worker's lease expires and the task is re-assigned with a higher token, the old worker's late writes are rejected."
    },
    {
      front: "What is the time-bucket approach for the schedule index?",
      back: "Partition the timeline into per-second (or per-10-second) buckets, each containing the set of task IDs that fire in that window. The scheduler advances a cursor through buckets, popping all tasks from the current bucket -- O(1) access per bucket, O(M) for M tasks in it."
    },
    {
      front: "How do you prevent thundering herd with cron tasks?",
      back: "Add random jitter (0-30 seconds) to each task's computed fire time. This spreads tasks scheduled for common times (midnight, top of hour) across a wider window, preventing all of them from hitting the dispatch queue simultaneously."
    },
    {
      front: "What is the difference between strict priority and weighted fair queuing?",
      back: "Strict priority always drains higher-priority queues first, risking starvation of lower priorities. Weighted fair queuing allocates a percentage of worker capacity to each level (e.g., 50% P0, 30% P1, 15% P2, 5% P3), guaranteeing progress for all priorities."
    },
    {
      front: "How does lease-based failure detection work for workers?",
      back: "Workers send heartbeats every 5-10 seconds to renew their lease on claimed tasks. If 3 consecutive heartbeats are missed (15-30 seconds), the worker is declared dead, its tasks are reset to SCHEDULED, and they re-enter the dispatch queue for reassignment."
    },
    {
      front: "What are the three layers of exactly-once execution?",
      back: "1) Claim layer: atomic CAS on task state with fencing token. 2) Execution layer: fencing token validation on all writes, rejecting stale tokens. 3) Application layer: idempotent task handlers that produce the same result regardless of duplicate execution."
    },
    {
      front: "How do you handle task dependencies in a distributed scheduler?",
      back: "Model dependencies as a DAG. Each task stores its predecessor IDs. When a task completes, evaluate all dependents: if all predecessors are SUCCEEDED, transition the dependent to SCHEDULED. Reject submissions that create cycles via topological sort validation."
    }
  ],

  exercises: [
    "Design the database schema for a task scheduler supporting recurring tasks, dependencies, and multi-tenant isolation. Include tables for tasks, schedules, dependencies, execution history, and tenant quotas. Define indexes for the most critical query patterns.",
    "Implement a cron expression parser in C++ that takes a 5-field cron string and a current timestamp, then returns the next fire time. Handle edge cases like month boundaries, leap years, and the special characters (star, comma, slash, dash).",
    "Write a simulation of the fencing token mechanism: create two worker threads that both attempt to complete the same task, with one having a stale token. Demonstrate that the stale worker's write is rejected while the current worker's write succeeds.",
    "Design the failure handling subsystem: implement exponential backoff with jitter for retries, a dead-letter queue for permanently failed tasks, and a circuit breaker that pauses a task type after N consecutive failures across different workers.",
    "Build a load test harness that creates 1 million scheduled tasks with random fire times spread over 10 minutes, then measures scheduling latency (fire-time to execution-start), throughput (tasks per second), and the impact of different priority distributions on tail latency."
  ],

  revisionNotes: [
    "The schedule index is the performance-critical component: use Redis sorted sets with time buckets, not a database table scan. Separate the index from the full task store.",
    "Fencing tokens must propagate end-to-end: from task store through worker to any downstream system the task writes to. A fencing token that stops at the task store level does not prevent corruption in external systems.",
    "Exactly-once = atomic claim (CAS) + fencing tokens + idempotent handlers. All three layers are needed; any single layer alone is insufficient.",
    "Scheduler horizontal scaling uses partition-based ownership: each scheduler instance owns a range of task IDs or time buckets, assigned via consistent hashing or lease-based acquisition.",
    "For recurring tasks, store the cron expression, compute next fire time after each execution, and add jitter to prevent thundering herd at popular cron times.",
    "Worker failure detection uses heartbeat-based leases. Typical configuration: 5-second heartbeat interval, 3 missed heartbeats (15 seconds) triggers lease expiry and task re-enqueue.",
    "Priority starvation is a real operational problem. Use weighted fair queuing or priority aging (auto-promote tasks waiting too long) rather than strict priority ordering.",
    "Task dependencies form a DAG. Evaluate dependents on completion, validate no cycles at submission time, and decide on a failure policy (fail-fast vs. best-effort for independent branches).",
    "Multi-tenancy requires per-tenant rate limits, quotas, and isolated worker pools or at minimum weighted scheduling to prevent one tenant from starving others.",
    "Key metrics to monitor: scheduling lag (fire-time to execution-start), queue depth per priority, worker utilization, retry rate, DLQ growth, and partition balance across scheduler instances."
  ],

  cheatSheet: [
    "Architecture: Client -> Task Store -> Schedule Index -> Scheduler Partitions -> Dispatch Queues (P0/P1/P2/P3) -> Worker Pool -> Result Store",
    "Task states: PENDING -> SCHEDULED -> CLAIMED -> RUNNING -> SUCCEEDED or FAILED. FAILED can retry back to SCHEDULED. CANCELLED is terminal from PENDING, SCHEDULED, or FAILED.",
    "Schedule Index: Redis ZADD with score=next_fire_time, partitioned into per-second time buckets. Scheduler pops current bucket every 500ms-1s.",
    "Exactly-once recipe: (1) CAS state SCHEDULED->CLAIMED with fencing token, (2) worker includes token in all writes, (3) store rejects stale tokens, (4) handlers are idempotent.",
    "Worker lease: heartbeat every 5s, expire after 3 missed (15s). On expiry: reset task to SCHEDULED, re-enqueue. New claim gets higher fencing token.",
    "Retry policy: exponential backoff with jitter. delay = min(base * 2^attempt + random(0, base), max_delay). Dead-letter after max_retries exhausted.",
    "Priority queues: 4 levels (P0-P3), weighted fair queuing (50/30/15/5%). Aging: auto-promote after configurable wait time.",
    "Recurring tasks: store cron expression, compute next fire time after execution, insert into future time bucket. Add jitter (0-30s) to spread load.",
    "Scaling numbers: 10M tasks, 100K fires/min needs approximately 50-100 scheduler partitions, 500-1000 workers, schedule index supporting 100K ops/sec.",
    "Failure modes: worker crash (lease expiry), scheduler crash (partition takeover via lease), network partition (fencing tokens prevent stale writes), thundering herd (jitter + rate limiting)."
  ],

  glossary: [
    {
      term: "Fencing Token",
      definition: "A monotonically increasing integer issued with each task claim. Used to detect and reject stale writes from workers whose leases have expired, preventing duplicate execution."
    },
    {
      term: "Schedule Index",
      definition: "A time-sorted data structure (typically Redis sorted sets) that maps next-fire-time to task IDs, enabling efficient scanning for tasks that should fire in the current time window."
    },
    {
      term: "Time Bucket",
      definition: "A partition of the timeline (e.g., one per second) used to organize the schedule index. Each bucket contains all task IDs firing in that time window, enabling O(1) access to the current set of ready tasks."
    },
    {
      term: "Dead Letter Queue (DLQ)",
      definition: "A queue for tasks that have exhausted all retry attempts and permanently failed. Tasks in the DLQ require manual inspection or automated remediation before they can be retried."
    },
    {
      term: "Lease",
      definition: "A time-bounded claim on a task or resource, maintained by periodic heartbeats. When heartbeats stop (worker crash), the lease expires and the task can be reassigned to another worker."
    },
    {
      term: "Compare-and-Swap (CAS)",
      definition: "An atomic operation that updates a value only if it matches an expected current value. Used to transition task state (e.g., SCHEDULED to CLAIMED) ensuring only one worker wins the claim."
    },
    {
      term: "Weighted Fair Queuing",
      definition: "A scheduling algorithm that allocates worker capacity across priority levels according to configured weights, preventing starvation of lower-priority tasks during high-priority bursts."
    }
  ],

  comparison: {
    columns: ["Aspect", "Polling-Based Scheduler", "Push-Based (Delay Queue)", "Hybrid Approach", "Time-Bucket Index"],
    rows: [
      ["Scheduling Latency", "500ms-1s (poll interval)", "Near real-time (ms)", "Real-time for P0, polled for others", "Bounded by bucket granularity (1s typical)"],
      ["Database Load", "Continuous queries every poll interval", "Low (event-driven)", "Moderate (reduced polling frequency)", "Low (O(1) per bucket pop)"],
      ["Complexity", "Simple: scan and dispatch loop", "High: requires message broker with delay support", "Moderate: two code paths to maintain", "Moderate: bucket management and cursor tracking"],
      ["Failure Recovery", "Naturally catches up by scanning overdue tasks", "Requires replay of unacked messages", "Poll path catches overdue, push path handles new", "Cursor detects missed buckets, drains all overdue"],
      ["Scaling", "Add more partitions, each polls independently", "Add consumers to the delay queue", "Scale poll and push paths independently", "Partition buckets across scheduler instances"],
      ["Best For", "Simple systems with relaxed latency needs", "Low-latency event-driven tasks", "Mixed workloads with varying latency needs", "High-volume time-based scheduling at scale"]
    ]
  },

  followUps: [
    "How would you extend the scheduler to support task workflows (DAGs with conditional branching and parallel fan-out)?",
    "How do you handle multi-region deployment where tasks should execute in a specific region for data locality?",
    "What changes are needed to support long-running tasks (hours or days) versus short tasks (seconds)?",
    "How would you implement task rate limiting to prevent a burst of tasks from overwhelming a downstream service?",
    "How do you migrate millions of existing tasks when upgrading the scheduler's data model or changing the partitioning scheme?",
    "How would you add observability to trace a task from submission through scheduling, dispatch, execution, and completion?"
  ],

  resources: [
    {
      label: "Designing Distributed Systems by Brendan Burns",
      kind: "book",
      note: "Covers patterns for reliable distributed task execution, including leader election and work queue patterns."
    },
    {
      label: "Uber Cherami: Distributed Task Queue Architecture",
      kind: "article",
      note: "Details Uber's approach to distributed task scheduling with exactly-once delivery and multi-tenancy."
    },
    {
      label: "Celery Project - Distributed Task Queue",
      kind: "repo",
      note: "Open-source distributed task queue in Python. Study its architecture for worker pool management, result backends, and scheduling."
    },
    {
      label: "AWS Step Functions and SQS Delay Queues Documentation",
      kind: "docs",
      note: "Reference for managed task orchestration and delay-based scheduling patterns in cloud environments."
    },
    {
      label: "Martin Kleppmann - Designing Data-Intensive Applications, Chapter 8",
      kind: "book",
      note: "Covers distributed systems fundamentals including fencing tokens, leader election, and exactly-once semantics that underpin task schedulers."
    }
  ]
};
