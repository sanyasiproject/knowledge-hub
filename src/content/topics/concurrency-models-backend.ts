import type { TopicContent } from "../types";

export const concurrencyModelsBackend: TopicContent = {
  quickSummary: [
    "Concurrency models determine how a backend handles multiple simultaneous requests — the main approaches are thread-per-request, event loops, thread pools, the reactor pattern, the actor model, and coroutines/green threads.",
    "Thread-per-request (traditional Java/PHP) dedicates an OS thread to each request — simple but expensive in memory (~1MB per thread stack) and context-switching overhead.",
    "Event loop (Node.js) uses a single thread with non-blocking I/O and a callback queue — highly efficient for I/O-bound work but blocks on CPU-intensive tasks.",
    "Go uses goroutines (green threads multiplexed onto OS threads by the Go runtime scheduler), Erlang uses lightweight actor processes, and Java 21+ offers virtual threads via Project Loom.",
  ],
  detailed: [
    "Thread-per-request is the simplest concurrency model: each incoming connection spawns or is assigned a dedicated OS thread. The thread handles the entire request lifecycle — reading input, querying databases, computing results, and writing the response. This model is intuitive because code reads sequentially, but it scales poorly. Each OS thread consumes ~1MB of stack memory, and context-switching thousands of threads introduces significant overhead. Traditional Java servlet containers (Tomcat with BIO connector) and PHP-FPM use this approach.",
    "Thread pools improve on thread-per-request by pre-allocating a fixed number of threads and reusing them. A request queue holds incoming work; idle threads pick up tasks. This bounds memory usage and reduces thread creation overhead. Java's ExecutorService, Tomcat's NIO connector, and .NET's ThreadPool use this pattern. The downside is that if all threads are blocked on slow I/O, the queue grows and latency spikes — thread pool sizing becomes critical.",
    "The event loop model uses a single thread to multiplex I/O operations. Instead of blocking on I/O, operations register callbacks that are invoked when data is ready. The event loop continuously polls for completed I/O events (using OS primitives like epoll on Linux or kqueue on macOS) and dispatches callbacks. Node.js, Nginx, and Redis use this model. It excels at I/O-bound workloads with thousands of concurrent connections but struggles with CPU-bound tasks that block the single thread.",
    "The reactor pattern is a formalization of the event loop: a dispatcher (reactor) waits for events on multiple I/O handles, then dispatches them to registered event handlers. Netty, Twisted (Python), and Vert.x implement the reactor pattern. Multi-reactor variants (like Netty's boss/worker event loop groups) use one reactor for accepting connections and multiple reactors for handling I/O, combining the event-driven approach with multi-core utilization.",
    "The actor model treats 'actors' as the fundamental unit of computation. Each actor has a private mailbox (message queue), processes messages sequentially, and can create child actors, send messages to other actors, or change its own state. There is no shared mutable state — all communication is via asynchronous message passing. Erlang/OTP is the canonical implementation; Akka brings the model to the JVM. The actor model naturally supports distribution across machines because message passing works identically over a network.",
    "Coroutines and green threads are lightweight user-space threads scheduled by the language runtime rather than the OS kernel. They have tiny stacks (often 2-8KB, growing as needed) and context-switching is cheap (no kernel transition). Go's goroutines are multiplexed onto OS threads by the Go scheduler (M:N threading). Kotlin coroutines, Python's asyncio, and Java's virtual threads (Project Loom) follow similar principles. This gives you the sequential coding style of threads with the efficiency of event-driven I/O.",
  ],
  deepDive: [
    "Go's scheduler implements M:N threading with three key entities: G (goroutine), M (OS thread / machine), and P (processor / logical CPU). Each P has a local run queue of goroutines. When a goroutine blocks on I/O, the runtime parks it and schedules another goroutine on the same OS thread — no context switch. Work stealing allows idle Ps to steal goroutines from busy Ps' queues. The GOMAXPROCS setting controls how many OS threads run goroutines simultaneously (defaults to number of CPU cores). This design lets Go handle millions of goroutines with minimal overhead.",
    "Erlang's BEAM VM implements preemptive scheduling of lightweight processes. Each process gets a reduction budget (roughly 4000 function calls); when exhausted, the scheduler preempts it. This guarantees fairness — no single process can starve others. Each process has an isolated heap and its own garbage collector, so GC pauses affect only one process, not the entire system. The OTP supervision tree provides fault tolerance: supervisors monitor child processes and restart them on failure, enabling 'let it crash' philosophy.",
    "Java's Project Loom introduces virtual threads that are scheduled by the JVM rather than the OS. A virtual thread that blocks on I/O (e.g., JDBC call, HTTP request) unmounts from its carrier (OS) thread, freeing it to run other virtual threads. When the I/O completes, the virtual thread remounts on any available carrier thread. This means you can create millions of virtual threads without the memory or context-switching cost of OS threads, while keeping the familiar thread-per-request programming model. The key limitation is that synchronized blocks and native methods pin the virtual thread to its carrier thread, so ReentrantLock should be preferred.",
    "Node.js uses libuv for its event loop, which abstracts OS-specific async I/O (epoll on Linux, kqueue on macOS, IOCP on Windows). While JavaScript runs single-threaded, libuv maintains a thread pool (default 4 threads, configurable via UV_THREADPOOL_SIZE) for operations that lack async OS support (DNS lookups, file system operations, crypto). Worker threads (worker_threads module) allow CPU-intensive work to run in parallel without blocking the event loop, but they have their own V8 isolate and communicate via structured clone or SharedArrayBuffer.",
  ],
  code: [
    {
      language: "javascript",
      caption: "Node.js event loop — non-blocking I/O with callbacks and async/await",
      source: `const http = require('http');
const { readFile } = require('fs/promises');

const server = http.createServer(async (req, res) => {
  // This does NOT block the event loop — the thread
  // is free to handle other requests while awaiting I/O
  const data = await readFile('./large-file.json', 'utf-8');
  const parsed = JSON.parse(data);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ count: parsed.length }));
});

server.listen(3000);
// Single thread handles thousands of concurrent connections
// because each await yields control back to the event loop`,
    },
    {
      language: "go",
      caption: "Go goroutines — lightweight concurrency with channels",
      source: `package main

import (
    "fmt"
    "net/http"
    "time"
)

func fetchURL(url string, ch chan<- string) {
    start := time.Now()
    resp, err := http.Get(url)
    if err != nil {
        ch <- fmt.Sprintf("%s: error: %v", url, err)
        return
    }
    defer resp.Body.Close()
    ch <- fmt.Sprintf("%s: %d [%v]", url, resp.StatusCode, time.Since(start))
}

func main() {
    urls := []string{
        "https://api.example.com/users",
        "https://api.example.com/orders",
        "https://api.example.com/products",
    }

    ch := make(chan string, len(urls))

    // Each goroutine costs ~2KB of stack (grows as needed)
    // You can run millions of these concurrently
    for _, url := range urls {
        go fetchURL(url, ch)
    }

    for range urls {
        fmt.Println(<-ch)
    }
}`,
    },
    {
      language: "java",
      caption: "Java 21 virtual threads (Project Loom)",
      source: `import java.net.http.*;
import java.net.URI;
import java.util.concurrent.*;
import java.util.List;
import java.util.stream.IntStream;

public class VirtualThreadExample {
    public static void main(String[] args) throws Exception {
        var client = HttpClient.newHttpClient();

        // Create an executor backed by virtual threads
        // Each virtual thread costs ~1KB (vs ~1MB for platform threads)
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = IntStream.range(0, 10_000)
                .mapToObj(i -> executor.submit(() -> {
                    var request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.example.com/item/" + i))
                        .build();
                    var response = client.send(request,
                        HttpResponse.BodyHandlers.ofString());
                    return "Item " + i + ": " + response.statusCode();
                }))
                .toList();

            // 10,000 concurrent virtual threads — no problem
            for (var future : futures) {
                System.out.println(future.get());
            }
        }
    }
}`,
    },
    {
      language: "erlang",
      caption: "Erlang actor model — lightweight processes and message passing",
      source: `-module(counter).
-export([start/0, increment/1, get/1]).

%% Each Erlang process has its own heap, mailbox, and GC
%% The BEAM VM can run millions of these concurrently

start() ->
    spawn(fun() -> loop(0) end).

loop(Count) ->
    receive
        {increment, Amount} ->
            loop(Count + Amount);
        {get, Caller} ->
            Caller ! {count, Count},
            loop(Count)
    end.

increment(Pid) ->
    Pid ! {increment, 1}.

get(Pid) ->
    Pid ! {get, self()},
    receive
        {count, Value} -> Value
    after 5000 ->
        {error, timeout}
    end.

%% Usage:
%% Pid = counter:start().
%% counter:increment(Pid).
%% counter:get(Pid).  %% => 1`,
    },
  ],
  diagrams: [
    {
      title: "Backend Concurrency Models Mindmap",
      kind: "mindmap",
      caption: "Overview of the major backend concurrency models, their scheduling strategies, representative runtimes, and key trade-offs.",
      mermaid: `mindmap
  root["Backend Concurrency Models"]
    Thread-per-Request
      One OS thread per request
      Blocks on I/O
      Java Servlets
      PHP-FPM
    Thread Pool
      Fixed worker pool
      Queue overflow risk
      Tomcat NIO
      Java ExecutorService
    Event Loop
      Single-threaded reactor
      Non-blocking callbacks
      Node.js
      Nginx
    Actor Model
      Isolated mailboxes
      Message passing only
      Erlang BEAM
      Akka
    Goroutines
      M-to-N scheduling
      Work stealing
      Go runtime
      Tiny 2KB stacks`,
    },
    {
      title: "Go GMP Scheduler Architecture",
      kind: "architecture",
      caption: "Go runtime M-to-N scheduler: Goroutines run on Processors which are bound to OS Threads, with work stealing across idle processors.",
      mermaid: `graph TD
    GRQ["Global Run Queue"]
    NetPoll["Network Poller"]
    subgraph P1["Processor P1"]
        LRQ1["Local Queue G1 G2 G3"]
    end
    subgraph P2["Processor P2"]
        LRQ2["Local Queue G4 G5"]
    end
    subgraph P3["Processor P3 - idle"]
        LRQ3["Local Queue - empty"]
    end
    M1["OS Thread M1"] --> P1
    M2["OS Thread M2"] --> P2
    M3["OS Thread M3 - idle"] --> P3
    P3 -.->|"steal half"| LRQ1
    GRQ -.->|"schedule"| P3
    NetPoll -.->|"I/O ready"| GRQ`,
    },
    {
      title: "Actor Model Message Flow",
      kind: "sequence",
      caption: "Actors communicate exclusively via asynchronous messages; each actor processes one message at a time from its mailbox, maintaining isolated mutable state.",
      mermaid: `sequenceDiagram
    participant C as Client
    participant S as Supervisor
    participant A as Actor A
    participant B as Actor B

    C->>S: spawn child actors
    S->>A: start
    S->>B: start
    C->>A: Send message M1
    A->>A: Process M1, update state
    A->>B: Forward result
    B->>B: Process forwarded msg
    B-->>C: Reply with result
    A->>A: Crash on bad input
    S->>A: Restart actor`,
    },
    {
      title: "Event Loop vs Thread Pool Request Handling",
      kind: "flow",
      caption: "Event loop handles I/O-bound requests non-blockingly in a single thread; CPU-bound work is offloaded to a thread pool to avoid blocking the loop.",
      mermaid: `flowchart TD
    Req["Incoming Request"] --> EL["Event Loop - single thread"]
    EL --> IOCheck{"I/O bound?"}
    IOCheck -->|"Yes"| NB["Non-blocking async I/O"]
    NB --> CB["Callback queued on completion"]
    CB --> EL
    IOCheck -->|"No - CPU heavy"| TP["Thread Pool - worker threads"]
    TP --> Work["CPU work executes"]
    Work --> Post["Post result to event loop"]
    Post --> EL
    EL --> Resp["Send response to client"]`,
    },
  ],
  exercises: [
    "**Benchmark event loop vs thread pool:** Write a Node.js HTTP server that computes Fibonacci(40) on each request. Measure throughput with `autocannon`. Then refactor to offload the computation to a `worker_threads` pool. Compare **requests per second** and *p99 latency* between the single-threaded and worker-threaded versions. Document the event loop blocking behavior observed.",
    "**Build a goroutine fan-out/fan-in pipeline:** In Go, implement a pipeline that reads URLs from a channel, fans out to *N worker goroutines* that fetch each URL concurrently, and fans results back into a single collector channel. Use `sync.WaitGroup` to coordinate shutdown. Measure how throughput scales as you increase N from 1 to 100. Add a `context.WithTimeout` to cancel all workers if the pipeline takes too long.",
    "**Simulate the actor model in Node.js:** Build a simple **actor system** in TypeScript where each actor is an object with a *mailbox* (async queue). Implement `send(actorId, message)` and a message processing loop. Create a `CounterActor` that responds to `increment` and `get` messages. Demonstrate that actors process messages sequentially (no race conditions) even when multiple callers send messages concurrently.",
    "**Compare Java virtual threads vs platform threads:** Write a Java 21 program that creates 100,000 tasks each performing a `Thread.sleep(1000)` (simulating I/O). Run once with `Executors.newFixedThreadPool(200)` (platform threads) and once with `Executors.newVirtualThreadPerTaskExecutor()` (virtual threads). Compare *memory usage*, total completion time, and *thread count* (via `ManagementFactory.getThreadMXBean()`).",
    "**Implement cooperative scheduling visualization:** Build a Node.js program that simulates three tasks running on a single-threaded event loop. Each task logs when it starts, yields (via `setImmediate`), and resumes. Visualize the interleaving in the console output. Then add a CPU-bound task that does NOT yield and observe how it **starves** the other tasks. Document the impact and the fix using `worker_threads`.",
  ],
  animations: [
    {
      title: "One slow request under three models",
      steps: [
        {
          label: "Thread-per-request",
          detail: "Request A blocks on a 2 s database call. Its thread sleeps; other threads keep serving. Cost: ~1 MB of stack per concurrent request.",
        },
        {
          label: "Event loop",
          detail: "Request A awaits the database; the loop immediately serves B, C, D. One thread, thousands of connections — until someone makes a blocking call.",
        },
        {
          label: "Blocking call on the loop",
          detail: "A 2 s synchronous computation stalls every in-flight request on that process. p99 spikes across all endpoints at once.",
        },
        {
          label: "Worker offload",
          detail: "The CPU work moves to a worker thread or a queue. The loop stays responsive; the slow work completes elsewhere.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Node.js", "Java (Loom)", "Go", "Erlang/BEAM"],
    rows: [
      ["Model", "Single-threaded event loop", "Virtual threads (M:N)", "Goroutines (M:N)", "Actor model / preemptive"],
      ["Unit of concurrency", "Callbacks / Promises", "Virtual thread", "Goroutine", "Process (actor)"],
      ["Memory per unit", "~0 (closure)", "~1KB", "~2-8KB", "~2KB"],
      ["Max concurrent units", "Thousands (I/O bound)", "Millions", "Millions", "Millions"],
      ["CPU-bound work", "Blocks event loop (use worker_threads)", "Runs on carrier thread", "Scheduled across OS threads", "Preemptive reduction counting"],
      ["Scheduling", "Cooperative (run-to-completion)", "JVM-managed", "Go runtime (work stealing)", "BEAM VM (preemptive, per-process)"],
      ["Shared state", "Single-threaded (no races)", "Shared memory (needs sync)", "Channels preferred, shared possible", "No shared state (message passing only)"],
      ["Fault isolation", "Uncaught exception crashes process", "Thread exception handling", "Goroutine panics recoverable", "Process crash isolated, supervisor restarts"],
      ["Best for", "I/O-heavy APIs, real-time", "Traditional enterprise apps", "Network services, CLI tools", "Telecom, messaging, distributed systems"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between concurrency and parallelism?",
      a: "Concurrency is about dealing with multiple things at once (structuring a program to handle multiple tasks that can make progress independently). Parallelism is about doing multiple things at once (executing multiple tasks simultaneously on multiple CPU cores). A single-core machine can be concurrent but not parallel. Node.js achieves concurrency without parallelism on its main thread — it interleaves I/O operations but only executes one JavaScript callback at a time.",
      followUps: [
        "Can you have parallelism without concurrency?",
        "How does Node.js achieve parallelism for CPU-bound work?",
      ],
    },
    {
      q: "Why does Node.js use a single-threaded event loop, and what are its limitations?",
      a: "The single-threaded model eliminates the complexity of thread synchronization — no locks, mutexes, or race conditions in user code. For I/O-bound workloads (which most web servers are), this is extremely efficient because the thread is never idle waiting for I/O. The limitation is CPU-bound work: a long computation blocks the entire event loop, preventing all other requests from being processed. Mitigations include worker_threads for CPU-intensive tasks, child processes via the cluster module for multi-core utilization, and offloading heavy computation to separate services.",
      followUps: [
        "How would you handle a CPU-intensive image processing task in Node.js?",
        "What is the cluster module and how does it differ from worker_threads?",
      ],
    },
    {
      q: "Explain Go's goroutine scheduler and why goroutines are cheaper than OS threads.",
      a: "Go uses M:N scheduling with three entities: G (goroutine), M (OS thread), and P (processor context). Goroutines are cheap because their stacks start at ~2KB and grow dynamically (vs ~1MB fixed for OS threads), and context-switching between goroutines happens in user space without a kernel transition (~100ns vs ~1-10us for OS threads). The scheduler uses work stealing: when a P's local run queue is empty, it steals goroutines from other Ps. When a goroutine blocks on I/O, the runtime parks it and schedules another on the same M, maximizing throughput.",
    },
    {
      q: "What is the actor model, and why is Erlang's implementation considered particularly robust?",
      a: "The actor model treats actors as the primitive unit of computation. Each actor has a mailbox, processes messages one at a time, and communicates only via asynchronous message passing — there is no shared mutable state. Erlang's BEAM VM is purpose-built for this: processes are preemptively scheduled (no single process can starve others), each process has its own garbage collector (no stop-the-world GC pauses), and OTP's supervision trees provide automatic fault recovery. The 'let it crash' philosophy means processes are expected to fail, and supervisors handle restart logic, leading to systems with 99.9999999% uptime (nine nines, as in the AXD301 ATM switch).",
    },
  ],
  followUps: [
    "Which model would you choose for 50,000 idle WebSocket connections, and why?",
    "What breaks when you move from one process to four?",
    "How do you pick a thread pool size, and why isn't bigger better?",
  ],
  mcqs: [
    {
      q: "What happens when a CPU-intensive task runs in a Node.js event loop?",
      options: [
        "It runs in a worker thread automatically",
        "It blocks all other requests until completion",
        "It is preemptively interrupted after a time slice",
        "It spawns a new process to handle it",
      ],
      answerIndex: 1,
      explanation:
        "Node.js runs JavaScript in a single thread. A CPU-intensive synchronous operation blocks the event loop, preventing it from processing any other callbacks or I/O events until the computation completes.",
    },
    {
      q: "How much stack memory does a Go goroutine typically start with?",
      options: ["1 MB", "64 KB", "2 KB", "256 bytes"],
      answerIndex: 2,
      explanation:
        "Goroutines start with approximately 2KB of stack space that grows and shrinks dynamically as needed. This is dramatically less than the ~1MB fixed stack of an OS thread, allowing millions of goroutines to exist concurrently.",
    },
    {
      q: "What mechanism does Erlang's BEAM VM use to ensure fair scheduling among processes?",
      options: [
        "Time-slicing based on wall clock",
        "Priority queues with aging",
        "Reduction counting (function call budget)",
        "Cooperative yielding by processes",
      ],
      answerIndex: 2,
      explanation:
        "BEAM uses reduction counting: each process gets a budget of approximately 4000 reductions (roughly function calls). When exhausted, the scheduler preempts the process and schedules another. This prevents any single process from monopolizing CPU time.",
    },
    {
      q: "In Java's Project Loom, what happens when a virtual thread performs a blocking I/O operation?",
      options: [
        "The carrier OS thread is blocked",
        "The virtual thread is unmounted from the carrier thread, freeing it for other virtual threads",
        "An exception is thrown because virtual threads cannot block",
        "The operation is automatically converted to non-blocking I/O",
      ],
      answerIndex: 1,
      explanation:
        "When a virtual thread blocks on I/O, the JVM unmounts it from the carrier (OS) thread. The carrier thread is then free to run other virtual threads. When the I/O completes, the virtual thread is remounted onto any available carrier thread. This gives the programming simplicity of blocking code with the efficiency of non-blocking I/O.",
    },
  ],
  flashcards: [
    {
      front: "What is M:N threading?",
      back: "M user-space threads (goroutines, virtual threads) are multiplexed onto N OS threads by the language runtime. Combines the lightweight creation of user threads with the parallelism of OS threads.",
    },
    {
      front: "What is the reactor pattern?",
      back: "An event-handling pattern where a dispatcher (reactor) waits for I/O events on multiple handles using a demultiplexer (select/epoll/kqueue), then dispatches events to registered handlers. Used by Netty, Twisted, Vert.x.",
    },
    {
      front: "What is work stealing in Go's scheduler?",
      back: "When a processor (P) has no goroutines in its local run queue, it steals half the goroutines from another P's queue. This balances work across OS threads without centralized scheduling.",
    },
    {
      front: "Why does Erlang's GC not cause stop-the-world pauses?",
      back: "Each Erlang process has its own small heap and its own garbage collector. GC runs per-process, affecting only that process's execution. Other processes continue running uninterrupted.",
    },
    {
      front: "What is the C10K problem?",
      back: "The challenge of handling 10,000+ concurrent connections on a single server. Thread-per-connection models fail at this scale due to memory and context-switching overhead. Event-driven and coroutine-based models solve it.",
    },
    {
      front: "What pins a Java virtual thread to its carrier thread?",
      back: "Synchronized blocks/methods and native (JNI) calls pin the virtual thread, preventing unmounting. Use java.util.concurrent.locks.ReentrantLock instead of synchronized to avoid pinning.",
    },
  ],
  revisionNotes: [
    "Thread-per-request: simple, sequential code, but ~1MB per thread limits scalability to thousands of concurrent connections.",
    "Event loop: single thread, non-blocking I/O, handles thousands of connections but CPU-bound work blocks everything.",
    "Thread pool: bounded threads reused across requests; queue absorbs bursts but pool exhaustion causes latency spikes.",
    "Reactor pattern: formalized event loop with event demultiplexer + handlers; Netty uses multi-reactor (boss accepts, workers handle I/O).",
    "Actor model: isolated processes, message passing, no shared state; Erlang's BEAM provides preemptive scheduling and per-process GC.",
    "Coroutines/green threads: user-space scheduling, tiny stacks, sequential code with async efficiency; Go goroutines, Java virtual threads, Kotlin coroutines.",
    "Node.js uses libuv (epoll/kqueue/IOCP) for async I/O and a thread pool (default 4) for file system and DNS operations.",
    "Go's GMP model: G (goroutine), M (OS thread), P (processor context); work stealing balances load across Ps.",
  ],
  cheatSheet: [
    "Node.js: single-threaded event loop + libuv thread pool (UV_THREADPOOL_SIZE); use worker_threads for CPU work",
    "Go: goroutines + channels; GOMAXPROCS controls parallel OS threads; select{} for multiplexing channels",
    "Java 21+: Executors.newVirtualThreadPerTaskExecutor(); avoid synchronized (causes pinning), use ReentrantLock",
    "Erlang: spawn(Fun) creates a process; receive...end for messages; OTP gen_server for stateful actors",
    "Thread pool sizing (CPU-bound): threads = number of CPU cores",
    "Thread pool sizing (I/O-bound): threads = cores * (1 + wait_time / compute_time)",
    "Event loop golden rule: never block the event loop with synchronous CPU work",
    "C10K solution: event-driven (epoll/kqueue) or coroutine-based (goroutines/virtual threads)",
  ],
  resources: [
    { label: "Node.js Event Loop Documentation", kind: "docs", note: "Official guide explaining event loop phases, microtasks, and I/O polling." },
    { label: "The Go Blog: Go Concurrency Patterns", kind: "article", note: "Covers goroutines, channels, select, and common patterns like fan-in/fan-out." },
    { label: "JEP 444: Virtual Threads (Project Loom)", url: "https://openjdk.org/jeps/444", kind: "docs", note: "The specification for Java virtual threads, including design rationale and limitations." },
    { label: "Learn You Some Erlang for Great Good", kind: "book", note: "Comprehensive Erlang tutorial covering the actor model, OTP, and supervision trees." },
    { label: "Netty in Action by Norman Maurer", kind: "book", note: "Deep dive into the reactor pattern and non-blocking I/O with Netty." },
    { label: "Designing Data-Intensive Applications, Ch. 11", url: "https://dataintensive.net/", kind: "book", note: "Martin Kleppmann covers stream processing, event-driven architectures, and concurrency." },
  ],
  glossary: [
    { term: "Context switch", definition: "The process of saving the state of a running thread/process and restoring another. OS-level context switches are expensive (~1-10 microseconds); user-space switches (goroutines, virtual threads) are cheap (~100 nanoseconds)." },
    { term: "Epoll", definition: "Linux kernel API for scalable I/O event notification. Monitors multiple file descriptors efficiently in O(1) time, unlike the older select/poll which are O(n)." },
    { term: "Cooperative scheduling", definition: "A scheduling model where tasks voluntarily yield control (e.g., at await points). If a task does not yield, it blocks all others. Used by Node.js and Python asyncio." },
    { term: "Preemptive scheduling", definition: "The scheduler can forcibly interrupt a running task to give another task CPU time. Used by OS threads and Erlang's BEAM VM." },
    { term: "Backpressure", definition: "A mechanism where a consumer signals to a producer to slow down when it cannot keep up. Essential in streaming and reactive systems to prevent memory exhaustion." },
    { term: "Green thread", definition: "A thread managed by the language runtime rather than the OS kernel. Has a much smaller memory footprint and faster context switching than OS threads." },
    { term: "Work stealing", definition: "A scheduling strategy where idle processors steal tasks from the queues of busy processors, balancing load without centralized coordination." },
  ],
};
