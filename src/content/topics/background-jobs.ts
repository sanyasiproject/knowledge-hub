import type { TopicContent } from "../types";

export const backgroundJobs: TopicContent = {
  quickSummary: [
    "Background jobs offload time-consuming or non-critical work (sending emails, processing images, generating reports) from the request-response cycle to separate worker processes.",
    "Job queues (Redis-backed BullMQ, Sidekiq; broker-backed Celery) provide reliable delivery, retries with exponential backoff, dead letter queues for failed jobs, and priority-based scheduling.",
    "Key design concerns are idempotency (jobs may execute more than once), concurrency control (limiting parallel workers), job scheduling (cron-like recurring jobs), and observability (monitoring queue depth, processing time, failure rates).",
  ],
  detailed: [
    "A background job system has three components: a producer (enqueues jobs), a broker/queue (stores jobs until workers pick them up), and a consumer/worker (executes jobs). The broker is typically Redis (BullMQ, Sidekiq, Resque), RabbitMQ (Celery), or a database table (Postgres-based Oban for Elixir, good_job for Rails). The choice of broker affects durability, throughput, and operational complexity.",
    "Retries with exponential backoff prevent thundering herd problems when a downstream service is temporarily unavailable. A typical strategy: retry after 15s, 30s, 1m, 2m, 4m, 8m, with jitter added to spread retries. After exhausting retry attempts, jobs move to a Dead Letter Queue (DLQ) for manual inspection. BullMQ uses the formula delay = min(backoff * 2^attempt, maxDelay) with optional jitter.",
    "Job priorities allow critical work (password reset emails) to be processed before bulk operations (analytics aggregation). Most frameworks support multiple named queues with configurable worker weights. Sidekiq processes queues in the order listed; BullMQ supports numeric priority levels where lower numbers indicate higher priority.",
    "Concurrency control limits how many jobs run simultaneously to avoid overwhelming databases or external APIs. Worker-level concurrency (Sidekiq's -c flag, BullMQ's concurrency option) controls parallel job execution within a single worker process. Rate limiting at the job level (e.g., max 100 API calls per minute) requires distributed rate limiters, often implemented with Redis.",
    "Scheduled jobs (cron-like) handle recurring tasks: daily report generation, hourly cache warming, periodic data cleanup. Sidekiq Enterprise and BullMQ support cron expressions. A critical concern is ensuring exactly-once scheduling — if multiple app instances run, only one should schedule the cron job. This typically requires a distributed lock (Redis SETNX or database advisory locks).",
    "Job serialization matters for reliability. Jobs should be serialized as small, self-contained payloads — store the user_id, not the entire user object. This ensures jobs survive worker restarts and that stale data is fetched fresh at execution time. Large payloads bloat the queue and increase serialization/deserialization overhead.",
  ],
  deepDive: [
    "Redis-based queues (BullMQ, Sidekiq) use Redis lists and sorted sets for O(1) enqueue/dequeue. BullMQ uses BRPOPLPUSH (now LMOVE) for atomic dequeue-and-process: a job is moved from the wait list to the active list in a single Redis command, preventing double-processing. If a worker crashes, the job remains in the active list and is recovered by a stalled job checker that monitors heartbeats.",
    "Celery's task protocol supports complex workflows: chains (sequential tasks), groups (parallel tasks), chords (group + callback when all complete), and maps (apply a task to each item in a list). Under the hood, Celery uses the AMQP protocol with RabbitMQ or Redis as the broker, and supports result backends (Redis, database, S3) for storing task return values.",
    "At-least-once delivery is the default for most job systems: a job may be delivered more than once if a worker crashes after processing but before acknowledging. This means all jobs must be idempotent. Exactly-once processing is achievable by combining an idempotency key with a transactional outbox: the job result and the 'completed' flag are written in the same database transaction.",
    "Monitoring and alerting are critical for production job systems. Key metrics: queue depth (are jobs backing up?), processing latency (time from enqueue to completion), failure rate, and DLQ size. BullMQ exposes events for job lifecycle; Sidekiq has a built-in web dashboard. Set alerts when queue depth exceeds a threshold or DLQ grows, indicating a systemic issue rather than transient failures.",
  ],
  code: [
    {
      language: "typescript",
      caption: "BullMQ — defining a queue, producer, and worker with retries",
      source: `import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ host: '127.0.0.1', port: 6379 });

// Define the queue
const emailQueue = new Queue('email', { connection });

// Producer: enqueue a job with retry configuration
await emailQueue.add(
  'send-welcome',
  { userId: 'usr_123', template: 'welcome' },
  {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000, // 3s, 6s, 12s, 24s, 48s
    },
    removeOnComplete: { age: 86400 },   // keep completed for 24h
    removeOnFail: { age: 604800 },       // keep failed for 7 days
    priority: 1,                          // lower = higher priority
  }
);

// Worker: process jobs with concurrency limit
const worker = new Worker(
  'email',
  async (job) => {
    const { userId, template } = job.data;
    console.log(\`Processing job \${job.id}: sending \${template} to \${userId}\`);

    const user = await db.users.findById(userId);
    if (!user) throw new Error(\`User \${userId} not found\`);

    await emailService.send(user.email, template);
    return { sent: true, email: user.email };
  },
  {
    connection,
    concurrency: 10,   // process up to 10 jobs simultaneously
    limiter: {
      max: 100,         // max 100 jobs
      duration: 60000,  // per 60 seconds (rate limiting)
    },
  }
);

worker.on('completed', (job, result) => {
  console.log(\`Job \${job.id} completed: \${JSON.stringify(result)}\`);
});

worker.on('failed', (job, err) => {
  console.error(\`Job \${job?.id} failed: \${err.message}\`);
  if (job && job.attemptsMade >= job.opts.attempts!) {
    console.error('Job moved to DLQ after exhausting retries');
  }
});`,
    },
    {
      language: "python",
      caption: "Celery — task definition, retries, and chaining",
      source: `from celery import Celery, chain, group, chord
from celery.utils.log import get_task_logger

app = Celery('tasks', broker='redis://localhost:6379/0',
             backend='redis://localhost:6379/1')

logger = get_task_logger(__name__)

# Configure default retry behavior
app.conf.update(
    task_acks_late=True,           # Ack after processing (at-least-once)
    worker_prefetch_multiplier=1,  # Fetch one task at a time
    task_reject_on_worker_lost=True,
)

@app.task(bind=True, max_retries=5, default_retry_delay=30)
def send_email(self, user_id: int, template: str):
    try:
        user = UserService.get(user_id)
        EmailService.send(user.email, template)
        return {'sent': True, 'email': user.email}
    except EmailServiceUnavailable as exc:
        # Exponential backoff: 30s, 60s, 120s, 240s, 480s
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))

@app.task
def generate_report(user_id: int):
    return ReportService.generate(user_id)

@app.task
def notify_report_ready(results, user_id: int):
    EmailService.send_report(user_id, results)

# Workflow: generate report, then notify
workflow = chain(
    generate_report.s(user_id=42),
    notify_report_ready.s(user_id=42)
)
workflow.apply_async()

# Parallel tasks with callback when all complete
report_chord = chord(
    [generate_report.s(uid) for uid in [1, 2, 3]],
    notify_report_ready.s(user_id=0)  # called with list of results
)`,
    },
    {
      language: "ruby",
      caption: "Sidekiq — worker with retry and queue configuration",
      source: `# app/workers/image_processor_worker.rb
class ImageProcessorWorker
  include Sidekiq::Worker

  sidekiq_options(
    queue: :media,
    retry: 5,                    # Max 5 retries
    dead: true,                  # Move to Dead set after exhaustion
    backtrace: true,             # Store backtrace on failure
    lock: :until_executed        # Unique job (sidekiq-unique-jobs gem)
  )

  sidekiq_retry_in do |count, exception|
    # Exponential backoff with jitter
    (count ** 4) + 15 + (rand(10) * (count + 1))
  end

  def perform(image_id, transformations)
    image = Image.find(image_id)
    raise "Image not found" unless image

    transformations.each do |transform|
      ImageService.apply(image, transform)
    end

    image.update!(processed: true, processed_at: Time.current)
  end
end

# Enqueue the job
ImageProcessorWorker.perform_async(
  image.id,
  [{ resize: [800, 600] }, { watermark: 'logo.png' }]
)

# Schedule for later
ImageProcessorWorker.perform_in(1.hour, image.id, transforms)

# sidekiq.yml configuration
# :concurrency: 25
# :queues:
#   - [critical, 6]   # Weight 6 — processed 6x more often
#   - [media, 3]
#   - [default, 1]`,
    },
    {
      language: "typescript",
      caption: "BullMQ — recurring (cron) jobs and job scheduling",
      source: `import { Queue, Worker } from 'bullmq';

const reportQueue = new Queue('reports', { connection });

// Add a repeatable (cron) job — runs daily at 2 AM UTC
await reportQueue.add(
  'daily-summary',
  { type: 'daily' },
  {
    repeat: {
      pattern: '0 2 * * *', // cron expression
      tz: 'UTC',
    },
  }
);

// Add a job that runs every 5 minutes
await reportQueue.add(
  'health-check',
  { service: 'payment-gateway' },
  {
    repeat: {
      every: 5 * 60 * 1000, // 5 minutes in milliseconds
    },
  }
);

// Delayed job — process after 30 minutes
await reportQueue.add(
  'follow-up-email',
  { userId: 'usr_456', orderId: 'ord_789' },
  {
    delay: 30 * 60 * 1000, // 30 minutes
  }
);

// List all repeatable jobs
const repeatableJobs = await reportQueue.getRepeatableJobs();
console.log(repeatableJobs);

// Remove a repeatable job
await reportQueue.removeRepeatableByKey(repeatableJobs[0].key);`,
    },
  ],
  comparison: {
    columns: ["Feature", "BullMQ (Node.js)", "Sidekiq (Ruby)", "Celery (Python)"],
    rows: [
      ["Broker", "Redis", "Redis", "RabbitMQ, Redis, SQS"],
      ["Language", "TypeScript / JavaScript", "Ruby", "Python"],
      ["Concurrency model", "Async (event loop)", "Threads (per worker)", "Prefork (processes) or gevent"],
      ["Priority support", "Numeric priority levels", "Weighted queue ordering", "Priority queues (RabbitMQ) or queue ordering"],
      ["Retry strategy", "Configurable backoff (fixed, exponential, custom)", "Configurable with sidekiq_retry_in", "Configurable with countdown / retry delays"],
      ["Cron / Repeatable", "Built-in repeat option with cron patterns", "sidekiq-cron or sidekiq-scheduler gem", "celery-beat scheduler"],
      ["Rate limiting", "Built-in limiter option", "sidekiq-rate-limiter gem or Enterprise", "celery.utils.rate_limit decorator"],
      ["Unique jobs", "Via bullmq-pro or custom logic", "sidekiq-unique-jobs gem", "celery-once or custom locking"],
      ["Dashboard", "bull-board, arena", "Built-in Sidekiq Web UI", "Flower web monitoring"],
      ["Result storage", "Optional (in Redis)", "Not built-in (use callbacks)", "Result backend (Redis, DB, S3)"],
    ],
  },
  interviewQA: [
    {
      q: "How do you ensure a background job is processed exactly once?",
      a: "Most queue systems provide at-least-once delivery (a job may be delivered again if the worker crashes before acknowledging). To achieve exactly-once processing, make jobs idempotent: use a unique idempotency key stored in the database within a transaction. Before processing, check if the key exists; if so, skip. Write the result and mark the key as processed in the same database transaction. This way, even if the job runs twice, the side effect happens only once.",
      followUps: [
        "What is the difference between at-least-once and at-most-once delivery?",
        "How would you handle idempotency for a job that calls an external API?",
      ],
    },
    {
      q: "How do you handle a job that consistently fails?",
      a: "First, configure retries with exponential backoff and jitter to handle transient failures. After exhausting retries, move the job to a Dead Letter Queue (DLQ). Set up monitoring and alerts on DLQ size. For investigation: inspect the job payload and error details in the DLQ, fix the underlying issue (bug, dependency outage), then replay the failed jobs. Some frameworks (Sidekiq, BullMQ) allow retrying individual DLQ jobs from a dashboard.",
      followUps: [
        "How would you prevent a poisonous job from clogging the DLQ?",
        "What metrics would you monitor for a production job queue?",
      ],
    },
    {
      q: "How do you scale background job processing?",
      a: "Horizontal scaling: add more worker processes or containers, each pulling from the same queue. Vertical scaling: increase concurrency per worker (threads in Sidekiq, concurrency option in BullMQ). Use separate queues for different job types with dedicated workers — this prevents slow jobs from blocking fast ones. Auto-scale workers based on queue depth (e.g., Kubernetes HPA with custom metrics from Redis queue length). For rate-limited external APIs, use a rate limiter to cap throughput regardless of worker count.",
    },
    {
      q: "When should you use a background job vs. processing inline in the request?",
      a: "Use background jobs when: (1) the work takes more than a few hundred milliseconds (image processing, report generation), (2) the result is not needed immediately by the user (sending emails, webhooks), (3) the work can be retried independently (payment reconciliation), or (4) you need to rate-limit calls to an external service. Process inline when: the user needs an immediate response that depends on the result, or the operation is fast and simple enough that the overhead of enqueueing is not justified.",
    },
  ],
  mcqs: [
    {
      q: "What is the purpose of exponential backoff with jitter in job retries?",
      options: [
        "To retry as fast as possible to minimize latency",
        "To spread retry attempts over time and avoid thundering herd on a recovering service",
        "To ensure retries happen at exact intervals for predictability",
        "To reduce the total number of retry attempts",
      ],
      answerIndex: 1,
      explanation:
        "Exponential backoff increases the delay between retries (e.g., 1s, 2s, 4s, 8s), and jitter adds randomness so that many failing jobs do not all retry at the same moment. This prevents overwhelming a recovering downstream service with a burst of retries.",
    },
    {
      q: "What does 'acks_late' (or acknowledging after processing) provide?",
      options: [
        "Exactly-once delivery",
        "At-most-once delivery",
        "At-least-once delivery",
        "Ordered delivery",
      ],
      answerIndex: 2,
      explanation:
        "When acknowledgment happens after processing (acks_late), a worker crash during processing means the job was never acknowledged. The broker will re-deliver it to another worker, providing at-least-once delivery. The trade-off is that the job may run more than once, so it must be idempotent.",
    },
    {
      q: "What is a Dead Letter Queue (DLQ)?",
      options: [
        "A queue for jobs that are scheduled for future execution",
        "A queue where jobs that have exhausted all retry attempts are stored for manual inspection",
        "A high-priority queue for critical system jobs",
        "A queue that automatically deletes expired jobs",
      ],
      answerIndex: 1,
      explanation:
        "A DLQ holds jobs that have failed all retry attempts. These jobs require manual inspection to determine the cause of failure (bug, invalid data, dependency issue). Operators can fix the issue and replay jobs from the DLQ.",
    },
    {
      q: "Why should job payloads contain IDs rather than full objects?",
      options: [
        "IDs are faster to serialize",
        "Full objects may become stale between enqueue and processing, and bloat the queue",
        "The queue broker cannot store complex objects",
        "IDs provide better security through obscurity",
      ],
      answerIndex: 1,
      explanation:
        "Jobs may sit in the queue for seconds, minutes, or longer. If you serialize the full object, it may be stale (user changed email, order was cancelled) by the time the worker processes it. Storing just the ID ensures the worker fetches the current state. Additionally, large payloads waste memory in the broker.",
    },
  ],
  flashcards: [
    {
      front: "What are the three components of a background job system?",
      back: "Producer (enqueues jobs), Broker/Queue (stores jobs — Redis, RabbitMQ, database), and Consumer/Worker (executes jobs). The broker decouples producers from consumers.",
    },
    {
      front: "What is the difference between at-least-once and at-most-once delivery?",
      back: "At-least-once: ack after processing — if worker crashes, job is redelivered (may run twice). At-most-once: ack before processing — if worker crashes, job is lost (runs zero or one time). Most production systems choose at-least-once and make jobs idempotent.",
    },
    {
      front: "What is a poisonous job (poison pill)?",
      back: "A job that always fails regardless of retries (e.g., due to a bug or invalid data). It repeatedly consumes retry budgets and can clog the processing pipeline. Mitigation: limit retries, move to DLQ, alert on repeated failures of the same job type.",
    },
    {
      front: "How does BullMQ prevent double-processing of a job?",
      back: "BullMQ uses Redis LMOVE (formerly BRPOPLPUSH) to atomically move a job from the wait list to the active list. A stalled job checker monitors worker heartbeats; if a worker stops heartbeating, its active jobs are moved back to wait for reprocessing.",
    },
    {
      front: "What is the formula for exponential backoff?",
      back: "delay = min(base_delay * 2^attempt, max_delay) + random_jitter. Example with base 1s: 1s, 2s, 4s, 8s, 16s... capped at max_delay. Jitter adds randomness to prevent synchronized retries.",
    },
    {
      front: "How do you ensure cron jobs run only once across multiple app instances?",
      back: "Use a distributed lock (Redis SETNX with TTL, or database advisory locks). Only the instance that acquires the lock schedules the cron job. The lock expires after the scheduling interval to handle instance failures.",
    },
  ],
  revisionNotes: [
    "Background jobs decouple slow/non-critical work from the request cycle — improves response time and reliability.",
    "Always make jobs idempotent: they may execute more than once due to at-least-once delivery semantics.",
    "Use exponential backoff with jitter for retries to avoid thundering herd on recovering services.",
    "Dead Letter Queue (DLQ): final destination for jobs that exhaust all retries; requires monitoring and manual intervention.",
    "Job payloads should be small (store IDs, not objects) — fetch fresh data at processing time.",
    "Separate queues for different job types prevent slow jobs from blocking fast ones.",
    "Rate limiting at the worker level prevents overwhelming external APIs regardless of worker count.",
    "Monitor: queue depth, processing latency, failure rate, DLQ size. Alert on anomalies.",
  ],
  cheatSheet: [
    "BullMQ: new Queue('name', {connection}); queue.add('jobName', data, opts); new Worker('name', handler, {concurrency})",
    "Celery: @app.task(bind=True, max_retries=5); task.apply_async(args, countdown=60); chain(t1.s(), t2.s())",
    "Sidekiq: include Sidekiq::Worker; perform_async(args); sidekiq_options queue: :name, retry: 5",
    "Exponential backoff: delay = base * 2^attempt + jitter; cap with max_delay",
    "Retry counts: 3-5 for transient errors, 0 for deterministic failures (bad input)",
    "Unique jobs: use idempotency key in Redis (SETNX) or database unique constraint",
    "Cron: BullMQ repeat.pattern, Sidekiq sidekiq-cron, Celery celery-beat",
    "Graceful shutdown: stop accepting new jobs, finish active jobs, then exit (SIGTERM handling)",
  ],
  resources: [
    { label: "BullMQ Documentation", kind: "docs", note: "Official guide covering queues, workers, flows, rate limiting, and repeatable jobs." },
    { label: "Sidekiq Best Practices", kind: "article", note: "Mike Perham's guide on writing reliable, idempotent Sidekiq workers." },
    { label: "Celery User Guide", kind: "docs", note: "Comprehensive documentation on task workflows (chains, groups, chords) and configuration." },
    { label: "Designing Data-Intensive Applications, Ch. 11", kind: "book", note: "Martin Kleppmann covers message brokers, exactly-once semantics, and stream processing." },
    { label: "Enterprise Integration Patterns", kind: "book", note: "Gregor Hohpe's patterns for messaging, including dead letter channels, retry, and idempotent receivers." },
  ],
  glossary: [
    { term: "Job queue", definition: "A data structure (typically backed by Redis or a message broker) that holds jobs waiting to be processed by workers. Provides ordering, persistence, and delivery guarantees." },
    { term: "Worker", definition: "A process that pulls jobs from a queue and executes them. Workers can run multiple jobs concurrently via threads, processes, or async I/O." },
    { term: "Dead Letter Queue (DLQ)", definition: "A special queue where jobs are moved after exhausting all retry attempts. Serves as a holding area for manual inspection and replay." },
    { term: "Exponential backoff", definition: "A retry strategy where the delay between attempts increases exponentially (e.g., 1s, 2s, 4s, 8s). Prevents overloading a failing service with rapid retries." },
    { term: "Jitter", definition: "Random variation added to retry delays to prevent multiple failed jobs from retrying at the same instant (thundering herd)." },
    { term: "Idempotency", definition: "The property that performing an operation multiple times has the same effect as performing it once. Essential for jobs in at-least-once delivery systems." },
    { term: "Backpressure", definition: "When workers cannot keep up with incoming jobs, the queue grows. Backpressure mechanisms signal producers to slow down or reject new jobs to prevent resource exhaustion." },
  ],
};
