import type { TopicContent } from "../types";

export const threadsVsAsync: TopicContent = {
  quickSummary: [
    "OS threads are kernel-managed units of execution that share a process's memory. They provide true parallelism on multi-core CPUs but carry significant overhead: each thread typically consumes 1-8 MB of stack memory and context-switching requires a kernel transition (~1-10 microseconds).",
    "Async/event-loop models (Node.js, browser JS) use a single thread to multiplex thousands of concurrent I/O operations. A loop polls for completed I/O and dispatches callbacks, avoiding thread overhead entirely but requiring non-blocking code — one CPU-bound task blocks everything.",
    "Coroutines and green threads (Python asyncio, Kotlin coroutines, Go goroutines, Java virtual threads) sit between the two: they look like threads to the programmer but are scheduled in user space, yielding cooperatively at suspension points with minimal memory overhead (KB, not MB).",
    "The C10K problem — handling 10,000+ concurrent connections — exposed the limits of thread-per-connection models and drove adoption of event loops, epoll/kqueue, and eventually coroutine-based designs.",
  ],
  detailed: [
    "OS/kernel threads are created via system calls (pthread_create, CreateThread). The kernel scheduler preemptively time-slices them across CPU cores. Advantages: true parallelism, simple mental model (sequential code). Disadvantages: high memory per thread, expensive context switches, need for locks/synchronization that invite deadlocks and race conditions. Thread pools mitigate creation cost but not memory cost.",
    "Green threads (user-space threads) are scheduled by a runtime, not the kernel. Go's goroutines start at ~2 KB of stack (grows dynamically) and are multiplexed onto a small pool of OS threads (M:N threading). Java's Project Loom introduces virtual threads — millions of lightweight threads mapped onto a few carrier (platform) threads via the ForkJoinPool. The JVM handles mounting/unmounting virtual threads at blocking points.",
    "The event loop model runs a single-threaded loop: poll for I/O readiness (epoll on Linux, kqueue on macOS, IOCP on Windows), execute ready callbacks, repeat. Node.js wraps libuv around this. Benefits: no locks needed for application state, very low memory per connection. Drawbacks: CPU-intensive work starves the loop, callback/promise complexity (mitigated by async/await syntax), cannot exploit multiple cores without worker threads or clustering.",
    "Coroutines are functions that can suspend and resume at explicit points (await, yield). Python's asyncio, Kotlin's suspend functions, and Rust's async fn are all coroutine-based. Unlike preemptive threads, coroutines yield cooperatively — the programmer controls where context switches happen. This eliminates most race conditions but requires discipline: forgetting to await blocks the entire executor.",
    "Fibers (Project Loom, Ruby fibers, Windows fibers) are a related concept: lightweight, cooperatively scheduled execution contexts. Project Loom's virtual threads are the most significant modern implementation — they let existing blocking Java code (JDBC, HttpURLConnection) run on millions of virtual threads without rewriting to reactive/callback style. The JVM detects blocking calls and unmounts the virtual thread from its carrier.",
    "Choosing between threads and async depends on the workload. I/O-bound with many concurrent connections: async or virtual threads. CPU-bound parallelism: OS threads (or processes). Mixed: a hybrid — async for I/O multiplexing, a thread pool for CPU work. Most modern runtimes (Tokio, .NET async, Project Loom) combine both under the hood.",
  ],
  deepDive: [
    "The C10K problem (Dan Kegel, 1999) asked: how does a single server handle 10,000 simultaneous connections? Thread-per-connection fails because 10K threads consume 10-80 GB of stack memory and overwhelm the scheduler. The solution was non-blocking I/O multiplexing: select (O(n) scan), poll (still O(n)), then epoll/kqueue (O(1) for ready events). This led to Nginx replacing Apache's thread-per-request model and Node.js building entirely on an event loop. Today the question is C10M — 10 million connections — pushing toward kernel-bypass (DPDK, io_uring) and zero-copy networking.",
    "Structured concurrency is an emerging paradigm (Kotlin coroutineScope, Python TaskGroup, Java StructuredTaskScope, Trio in Python) that treats concurrent tasks like structured control flow: child tasks cannot outlive their parent scope. This eliminates fire-and-forget task leaks, ensures exceptions propagate properly, and makes cancellation predictable. It is to concurrency what structured programming (if/while) was to goto.",
    "The GIL (Global Interpreter Lock) in CPython means OS threads cannot execute Python bytecode in parallel — only one thread holds the GIL at a time. This makes threading useless for CPU-bound Python work (use multiprocessing instead). However, I/O-bound threading still works because the GIL is released during I/O system calls. Python 3.13+ introduces a free-threaded build (no-GIL mode) as an experimental option, potentially changing this landscape.",
    "Under the hood, async runtimes manage state machines. When a Rust async fn is compiled, each .await point becomes a state in an enum. The Future is polled by the executor; if not ready, it registers a waker and yields. Python's asyncio does similarly at the bytecode level with generator-based coroutines. Understanding this transformation helps debug async code: each await is a potential suspension, and the state machine's size grows with the number of awaits and local variables across them.",
  ],
  code: [
    {
      language: "python",
      caption: "Threading vs asyncio — fetching multiple URLs concurrently",
      source: `import threading
import asyncio
import aiohttp
import requests
import time

# --- Thread-based approach ---
def fetch_sync(url: str, results: list, index: int):
    """Each thread blocks on network I/O."""
    resp = requests.get(url, timeout=10)
    results[index] = len(resp.content)

def run_threaded(urls: list[str]):
    results = [None] * len(urls)
    threads = [
        threading.Thread(target=fetch_sync, args=(url, results, i))
        for i, url in enumerate(urls)
    ]
    for t in threads:
        t.start()       # OS thread created per URL
    for t in threads:
        t.join()         # Wait for all
    return results

# --- Async approach ---
async def fetch_async(session: aiohttp.ClientSession, url: str) -> int:
    """Coroutine suspends at await, no thread blocked."""
    async with session.get(url) as resp:
        data = await resp.read()
        return len(data)

async def run_async(urls: list[str]):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_async(session, url) for url in urls]
        return await asyncio.gather(*tasks)  # Concurrent, single thread

# --- Comparison ---
urls = ["https://example.com"] * 100

start = time.perf_counter()
run_threaded(urls)               # 100 OS threads
print(f"Threaded: {time.perf_counter() - start:.2f}s")

start = time.perf_counter()
asyncio.run(run_async(urls))     # 1 thread, 100 coroutines
print(f"Async:    {time.perf_counter() - start:.2f}s")`,
    },
    {
      language: "java",
      caption: "Platform threads vs virtual threads (Project Loom, Java 21+)",
      source: `import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.concurrent.*;
import java.util.stream.IntStream;

public class ThreadComparison {

    static final HttpClient client = HttpClient.newHttpClient();

    static String fetch(String url) throws Exception {
        var req = HttpRequest.newBuilder(URI.create(url)).build();
        return client.send(req, HttpResponse.BodyHandlers.ofString()).body();
    }

    public static void main(String[] args) throws Exception {
        String url = "https://example.com";
        int count = 10_000;

        // --- Platform (OS) threads: heavy, limited ---
        // This would likely throw OutOfMemoryError at 10K threads
        // try (var exec = Executors.newFixedThreadPool(200)) {
        //     var futures = IntStream.range(0, count)
        //         .mapToObj(i -> exec.submit(() -> fetch(url)))
        //         .toList();
        //     for (var f : futures) f.get();
        // }

        // --- Virtual threads: lightweight, millions possible ---
        var start = Instant.now();
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = IntStream.range(0, count)
                .mapToObj(i -> exec.submit(() -> fetch(url)))
                .toList();
            for (var f : futures) f.get();
        }
        var elapsed = Duration.between(start, Instant.now());
        System.out.printf("Virtual threads (%d tasks): %s%n", count, elapsed);

        // --- Structured concurrency (preview in Java 21+) ---
        // try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        //     var task1 = scope.fork(() -> fetch("https://api.a.com"));
        //     var task2 = scope.fork(() -> fetch("https://api.b.com"));
        //     scope.join().throwIfFailed();
        //     System.out.println(task1.get() + task2.get());
        // }
    }
}`,
    },
    {
      language: "typescript",
      caption: "Node.js event loop — async I/O with worker threads for CPU work",
      source: `import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { readFile } from "fs/promises";

// --- Event loop: great for I/O ---
async function fetchMultiple(urls: string[]): Promise<string[]> {
  // All fetches run concurrently on the single event loop thread.
  // libuv uses epoll/kqueue underneath; no threads for network I/O.
  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      return res.text();
    })
  );
  return results;
}

// --- Worker thread: offload CPU-bound work ---
function computeInWorker(data: number[]): Promise<number> {
  return new Promise((resolve, reject) => {
    // Spawns a real OS thread so the event loop is not blocked
    const worker = new Worker(new URL(import.meta.url), {
      workerData: data,
    });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}

if (!isMainThread) {
  // This runs inside the worker thread
  const data = workerData as number[];
  const sum = data.reduce((a, b) => a + b, 0); // CPU-intensive
  parentPort!.postMessage(sum);
} else {
  // Main thread: mix I/O and CPU work
  const [pages, total] = await Promise.all([
    fetchMultiple(["https://example.com", "https://example.org"]),
    computeInWorker(Array.from({ length: 1_000_000 }, (_, i) => i)),
  ]);
  console.log(\`Fetched \${pages.length} pages, sum = \${total}\`);
}`,
    },
    {
      language: "python",
      caption: "Python asyncio with structured concurrency (TaskGroup, 3.11+)",
      source: `import asyncio

async def fetch_user(user_id: int) -> dict:
    """Simulates an async I/O call."""
    await asyncio.sleep(0.1)  # Non-blocking sleep
    return {"id": user_id, "name": f"User {user_id}"}

async def fetch_orders(user_id: int) -> list:
    await asyncio.sleep(0.15)
    return [{"order": i, "user": user_id} for i in range(3)]

async def get_user_with_orders(user_id: int):
    """Structured concurrency: child tasks cannot outlive the scope."""
    async with asyncio.TaskGroup() as tg:
        user_task = tg.create_task(fetch_user(user_id))
        orders_task = tg.create_task(fetch_orders(user_id))
    # Both complete (or both cancelled on error) by this point
    return {
        "user": user_task.result(),
        "orders": orders_task.result(),
    }

async def main():
    # Process 50 users concurrently with a semaphore for backpressure
    sem = asyncio.Semaphore(10)  # Max 10 in-flight at once

    async def bounded(uid: int):
        async with sem:
            return await get_user_with_orders(uid)

    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(bounded(uid)) for uid in range(50)]

    results = [t.result() for t in tasks]
    print(f"Fetched {len(results)} users with orders")

asyncio.run(main())`,
    },
  ],
  diagrams: [
    {
      title: "Threading Models Compared",
      kind: "architecture",
      caption:
        "OS threads map 1:1 to kernel threads. Green threads/virtual threads use M:N mapping — many lightweight threads multiplexed onto few OS threads. The event loop uses a single thread with an I/O multiplexer (epoll/kqueue) dispatching callbacks.",
    },
    {
      title: "Event Loop Lifecycle",
      kind: "flow",
      caption:
        "The event loop cycle: check timers -> poll for I/O (epoll/kqueue) -> run ready callbacks -> check immediate queue -> repeat. Node.js adds microtask and nextTick queues between phases. A blocking callback stalls the entire cycle.",
    },
  ],
  animations: [
    {
      title: "Thread Context Switch vs Coroutine Switch",
      steps: [
        {
          label: "Thread A running",
          detail:
            "Thread A executes on CPU core 0. Its registers, program counter, and stack pointer are in CPU registers.",
        },
        {
          label: "Timer interrupt fires",
          detail:
            "The kernel's scheduler interrupt fires. CPU transitions from user mode to kernel mode (expensive ring transition).",
        },
        {
          label: "Save Thread A state",
          detail:
            "Kernel saves Thread A's full register set, FPU state, and TLB context to its Thread Control Block (TCB) in kernel memory.",
        },
        {
          label: "Load Thread B state",
          detail:
            "Kernel loads Thread B's saved state from its TCB into CPU registers. TLB may be flushed if switching processes. Total cost: 1-10 microseconds.",
        },
        {
          label: "Coroutine alternative",
          detail:
            "A coroutine switch: save only the instruction pointer and a few registers in user space. No kernel transition, no TLB flush. Cost: ~100 nanoseconds — 10-100x cheaper.",
        },
      ],
    },
    {
      title: "Event Loop Processing a Request",
      steps: [
        {
          label: "Request arrives",
          detail:
            "A TCP connection becomes readable. epoll_wait returns it as a ready file descriptor.",
        },
        {
          label: "Callback dispatched",
          detail:
            "The event loop invokes the registered callback to read the HTTP request. This is synchronous JS/Python code running on the single thread.",
        },
        {
          label: "Database query initiated",
          detail:
            "The callback issues an async DB query. The I/O is handed to the OS (or a thread pool for file I/O in libuv). The callback returns immediately.",
        },
        {
          label: "Loop continues",
          detail:
            "While the DB query is in flight, the event loop processes other ready connections. Thousands of requests can be in-flight simultaneously.",
        },
        {
          label: "DB response ready",
          detail:
            "epoll signals the DB socket is readable. The loop invokes the response callback, which sends the HTTP response. Total thread count: 1.",
        },
      ],
    },
  ],
  comparison: {
    columns: [
      "Aspect",
      "OS Threads",
      "Green/Virtual Threads",
      "Event Loop (async callbacks)",
      "Coroutines (async/await)",
    ],
    rows: [
      [
        "Scheduling",
        "Preemptive, by kernel",
        "Cooperative or preemptive (Go), by runtime",
        "Cooperative, by the loop",
        "Cooperative, at await points",
      ],
      [
        "Memory per unit",
        "1-8 MB stack",
        "2 KB - 1 MB (growable)",
        "~few KB per connection state",
        "~few KB per coroutine frame",
      ],
      [
        "Parallelism",
        "True (multi-core)",
        "True if M:N mapped (Go, Loom)",
        "Single core (needs workers/cluster)",
        "Depends on runtime (Tokio: yes, asyncio: no)",
      ],
      [
        "Max concurrent units",
        "~1K-10K practical",
        "Millions (Go, Loom)",
        "100K+ connections",
        "100K+ coroutines",
      ],
      [
        "Blocking I/O",
        "Fine (blocks one thread)",
        "Fine (runtime unmounts from carrier)",
        "Fatal (blocks entire loop)",
        "Must not block (use await)",
      ],
      [
        "CPU-bound work",
        "Good (true parallelism)",
        "Good if M:N (Go distributes across cores)",
        "Bad (blocks the loop)",
        "Bad without offloading to thread pool",
      ],
      [
        "Synchronization",
        "Mutexes, semaphores, condition vars",
        "Channels (Go), structured scopes (Loom)",
        "Not needed (single-threaded)",
        "Minimal (cooperative switching)",
      ],
      [
        "Code complexity",
        "Low (sequential), high (sync bugs)",
        "Low (sequential, fewer sync issues)",
        "High (callback hell, resolved by promises)",
        "Medium (sequential-looking async/await)",
      ],
      [
        "Ecosystem examples",
        "Java platform threads, C pthreads, .NET threads",
        "Go goroutines, Java virtual threads, Erlang processes",
        "Node.js, Nginx, Redis",
        "Python asyncio, Kotlin coroutines, Rust async",
      ],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between concurrency and parallelism?",
      a: "Concurrency is about dealing with multiple things at once (structuring a program to handle multiple tasks). Parallelism is about doing multiple things at once (executing simultaneously on multiple cores). An event loop is concurrent but not parallel — it interleaves tasks on one core. Multi-threaded code on a multi-core CPU is both concurrent and parallel. You can have concurrency without parallelism (single-core async) and parallelism without concurrency (SIMD vector instructions).",
      followUps: [
        "Can you have parallelism without concurrency?",
        "Is Python's asyncio concurrent, parallel, or both?",
        "How does Go achieve both concurrency and parallelism?",
      ],
    },
    {
      q: "Why can Node.js handle thousands of connections on a single thread?",
      a: "Node.js uses an event loop backed by libuv, which uses OS-level I/O multiplexing (epoll on Linux, kqueue on macOS). Instead of blocking a thread per connection, it registers interest in I/O events and gets notified when sockets are readable/writable. Each connection costs only a few KB of state (the callback closure and buffers) rather than an entire thread stack. The loop processes ready events one at a time, which works well for I/O-bound workloads where most time is spent waiting for network or disk. CPU-intensive tasks must be offloaded to worker threads to avoid blocking the loop.",
      followUps: [
        "What happens if a callback takes 500ms of CPU time?",
        "How do worker threads differ from the thread pool libuv uses internally?",
      ],
    },
    {
      q: "What problem do virtual threads (Project Loom) solve in Java?",
      a: "Before Loom, Java developers faced a choice: use platform threads (simple blocking code, but limited to thousands of threads) or rewrite to reactive/async style (scales, but complex and viral — the entire call chain must be non-blocking). Virtual threads eliminate this trade-off. They are cheap enough to create millions (one per task), yet existing blocking APIs (JDBC, InputStream, Socket) work unchanged because the JVM automatically unmounts the virtual thread from its carrier OS thread when it blocks. This means you write simple sequential blocking code that scales like async code.",
      followUps: [
        "What happens when a virtual thread calls a synchronized block?",
        "How do virtual threads interact with thread-local variables?",
        "Can virtual threads help with CPU-bound workloads?",
      ],
    },
    {
      q: "What is the C10K problem and how was it solved?",
      a: "The C10K problem, articulated by Dan Kegel in 1999, asked how a single server could handle 10,000 concurrent TCP connections. The thread-per-connection model failed because 10K threads consumed too much memory and overwhelmed the OS scheduler. Solutions evolved in stages: first, non-blocking I/O with select/poll (O(n) scanning of all connections); then epoll (Linux) and kqueue (BSD/macOS) providing O(1) event notification for ready file descriptors; finally, application frameworks built on these (Nginx, Node.js, Go runtime). Modern systems handle C10M (10 million) via kernel bypass (DPDK, io_uring), zero-copy, and SO_REUSEPORT.",
    },
    {
      q: "When should you use threads vs async in a new project?",
      a: "Use OS threads or virtual threads when: the workload is CPU-bound and needs true parallelism, the team prefers sequential code, or the ecosystem uses blocking APIs (Java with JDBC, Python with most libraries). Use async when: the workload is heavily I/O-bound with thousands of concurrent connections (web servers, proxies, chat), memory per connection must be minimal, or the ecosystem is async-native (Node.js, Rust with Tokio). In practice, most production systems use both: an async I/O layer for connection handling with a thread pool for CPU-intensive work or legacy blocking code. Virtual threads (Go, Loom) increasingly blur the line by offering thread-like syntax with async-like efficiency.",
    },
  ],
  mcqs: [
    {
      q: "What is the primary advantage of green threads over OS threads?",
      options: [
        "They provide true parallelism on single-core CPUs",
        "They are scheduled by the kernel for fairness",
        "They have much lower memory overhead and faster context switching",
        "They eliminate all race conditions automatically",
      ],
      answerIndex: 2,
      explanation:
        "Green threads are user-space scheduled with small stacks (KB vs MB), and switching doesn't require a kernel transition, making them 10-100x cheaper to create and switch.",
    },
    {
      q: "What happens when a CPU-intensive function runs in a Node.js event loop callback?",
      options: [
        "Node.js automatically moves it to a worker thread",
        "It blocks the entire event loop, preventing other callbacks from executing",
        "The event loop preemptively pauses it after a time quantum",
        "It runs in parallel on another core via libuv",
      ],
      answerIndex: 1,
      explanation:
        "The event loop is single-threaded and cooperative. A long-running synchronous callback blocks all other I/O processing until it completes. CPU work must be explicitly offloaded to worker threads.",
    },
    {
      q: "In Java's Project Loom, what happens when a virtual thread calls a blocking I/O operation?",
      options: [
        "The entire carrier OS thread blocks",
        "An exception is thrown because virtual threads cannot block",
        "The JVM unmounts the virtual thread and reuses the carrier for other virtual threads",
        "The call is automatically converted to non-blocking I/O",
      ],
      answerIndex: 2,
      explanation:
        "The JVM runtime detects blocking calls and unmounts the virtual thread from its carrier (OS) thread, freeing the carrier to run other virtual threads. When the I/O completes, the virtual thread is remounted on an available carrier.",
    },
    {
      q: "Why can't Python's threading module achieve true CPU parallelism (in standard CPython)?",
      options: [
        "Python threads are green threads, not OS threads",
        "The Global Interpreter Lock (GIL) allows only one thread to execute bytecode at a time",
        "Python does not support multi-core processors",
        "Threading in Python is only for I/O, not computation",
      ],
      answerIndex: 1,
      explanation:
        "CPython's GIL serializes bytecode execution across all threads. While threads can run I/O in parallel (the GIL is released during system calls), CPU-bound work gets no parallel speedup. Use multiprocessing or the experimental free-threaded build (3.13+) for CPU parallelism.",
    },
    {
      q: "Which I/O multiplexing mechanism provides O(1) event notification on Linux?",
      options: [
        "select",
        "poll",
        "epoll",
        "fopen",
      ],
      answerIndex: 2,
      explanation:
        "epoll uses a kernel data structure that tracks registered file descriptors and returns only the ready ones, providing O(1) notification per ready event regardless of total monitored descriptors. select and poll both require O(n) scanning.",
    },
  ],
  flashcards: [
    {
      front: "What is the typical memory cost of an OS thread vs a goroutine?",
      back: "An OS thread: 1-8 MB of pre-allocated stack. A goroutine: ~2 KB initial stack that grows dynamically. This is why Go can run millions of goroutines but only thousands of OS threads.",
    },
    {
      front: "What is M:N threading?",
      back: "M user-space threads (green threads, goroutines, virtual threads) multiplexed onto N OS threads. The runtime scheduler maps M >> N lightweight threads onto a small pool of kernel threads, combining low overhead with true parallelism.",
    },
    {
      front: "What does 'cooperative scheduling' mean?",
      back: "Tasks voluntarily yield control at explicit points (await, channel operations, yield). Unlike preemptive scheduling, the scheduler never forcibly interrupts a running task. This is simpler (fewer race conditions) but risks one task starving others.",
    },
    {
      front: "What is the event loop's biggest weakness?",
      back: "CPU-bound work blocks the entire loop. Since there is only one thread, a long computation prevents all other I/O callbacks from running. The fix is to offload CPU work to worker threads or a separate process.",
    },
    {
      front: "What is structured concurrency?",
      back: "A paradigm where concurrent tasks are scoped like blocks of code: child tasks cannot outlive their parent scope. If any child fails, siblings are cancelled and the error propagates. Examples: Kotlin coroutineScope, Python TaskGroup, Java StructuredTaskScope.",
    },
    {
      front: "What is the GIL and which language has it?",
      back: "The Global Interpreter Lock in CPython. It allows only one thread to execute Python bytecode at a time, preventing true CPU parallelism via threads. I/O-bound threading still works because the GIL is released during system calls.",
    },
    {
      front: "How does epoll differ from select?",
      back: "select: pass the full set of file descriptors every call, kernel scans all O(n). epoll: register FDs once, kernel maintains an interest list, returns only ready FDs in O(1) per event. epoll scales to millions of connections.",
    },
    {
      front: "What is a carrier thread in Project Loom?",
      back: "A platform (OS) thread in the ForkJoinPool that executes virtual threads. When a virtual thread blocks, it is unmounted from the carrier, which then picks up another virtual thread. A small number of carriers can service millions of virtual threads.",
    },
  ],
  revisionNotes: [
    "OS threads: kernel-scheduled, preemptive, 1:1 mapping to kernel threads, 1-8 MB stack, true parallelism, need locks for shared state.",
    "Green threads / virtual threads: user-space scheduled, M:N mapping, KB-sized stacks, millions possible. Go goroutines, Java virtual threads (Loom), Erlang processes.",
    "Event loop: single thread, I/O multiplexing via epoll/kqueue, callbacks/promises, no locks needed, but CPU work blocks everything. Node.js, Nginx, Redis.",
    "Coroutines: suspend/resume at await points, cooperative scheduling, sequential-looking async code. Python asyncio, Kotlin suspend, Rust async fn.",
    "C10K solved by: non-blocking I/O + epoll/kqueue replacing thread-per-connection. C10M needs kernel bypass (DPDK, io_uring).",
    "Thread pools amortize thread creation cost but not memory cost. Virtual threads make pools unnecessary — create one per task.",
    "Structured concurrency: tasks scoped to a block, automatic cancellation on failure, no orphan tasks. The future of concurrent programming.",
    "Decision rule: I/O-bound + many connections = async or virtual threads. CPU-bound = OS threads/processes. Mixed = async I/O layer + thread pool for CPU work.",
  ],
  cheatSheet: [
    "Thread creation: pthread_create (C), new Thread (Java), threading.Thread (Python), std::thread (C++/Rust).",
    "Async keywords: async/await (JS, Python, Rust, C#), suspend (Kotlin), virtual threads need no keywords (Java Loom).",
    "Node.js: single-threaded event loop. Use worker_threads for CPU. Use cluster module for multi-core HTTP.",
    "Python: asyncio.run(main()) to start the loop. Use TaskGroup for structured concurrency. GIL blocks CPU parallelism — use multiprocessing.",
    "Java 21+: Executors.newVirtualThreadPerTaskExecutor() — drop-in replacement for thread pools with virtual threads.",
    "Go: go func() launches a goroutine. Communicate via channels, not shared memory. Runtime multiplexes onto GOMAXPROCS OS threads.",
    "I/O multiplexing: Linux = epoll, macOS = kqueue, Windows = IOCP. Libraries abstract: libuv (Node), mio (Rust), netty (Java).",
    "Deadlock recipe: Lock A then B in thread 1, Lock B then A in thread 2. Prevention: always acquire locks in a consistent global order.",
  ],
  resources: [
    {
      label: "The C10K Problem — Dan Kegel",
      kind: "article",
      note: "The foundational article that defined the challenge of handling 10K concurrent connections and surveyed OS-level solutions.",
    },
    {
      label: "JEP 444: Virtual Threads (Project Loom)",
      kind: "docs",
      note: "The official Java Enhancement Proposal for virtual threads, explaining motivation, design, and API.",
    },
    {
      label: "Node.js Event Loop, Timers, and process.nextTick()",
      kind: "docs",
      note: "Official Node.js guide explaining event loop phases, microtasks, and common pitfalls.",
    },
    {
      label: "Concurrency is not Parallelism — Rob Pike (Go)",
      kind: "video",
      note: "Classic talk distinguishing concurrency (structure) from parallelism (execution) using Go as the example.",
    },
    {
      label: "Notes on Structured Concurrency — Nathaniel J. Smith",
      kind: "article",
      note: "The essay that popularized structured concurrency, comparing it to structured programming's elimination of goto.",
    },
  ],
  glossary: [
    {
      term: "Preemptive scheduling",
      definition:
        "The OS forcibly interrupts a running thread after a time quantum to give other threads CPU time. The thread has no control over when it is paused.",
    },
    {
      term: "Cooperative scheduling",
      definition:
        "Tasks voluntarily yield control at defined points (await, yield, channel ops). The scheduler never forcibly interrupts; a non-yielding task blocks all others.",
    },
    {
      term: "Context switch",
      definition:
        "Saving the state (registers, stack pointer, PC) of the current execution unit and loading the state of another. Kernel context switches cost 1-10 us; user-space switches ~100 ns.",
    },
    {
      term: "epoll",
      definition:
        "Linux kernel mechanism for scalable I/O event notification. Monitors thousands of file descriptors and returns only those ready for I/O, in O(1) per ready event.",
    },
    {
      term: "Coroutine",
      definition:
        "A function that can suspend execution at specific points and be resumed later, retaining its local state. The foundation of async/await in Python, Kotlin, Rust, and JavaScript.",
    },
    {
      term: "Virtual thread",
      definition:
        "A lightweight thread managed by the JVM (Project Loom) rather than the OS. Mapped M:N onto carrier OS threads. Blocks without wasting an OS thread.",
    },
    {
      term: "GIL (Global Interpreter Lock)",
      definition:
        "A mutex in CPython that allows only one thread to execute Python bytecode at a time. Prevents CPU parallelism via threads but simplifies memory management.",
    },
    {
      term: "Structured concurrency",
      definition:
        "A paradigm where concurrent tasks are lexically scoped: child tasks cannot outlive their parent, errors propagate, and cancellation is automatic. Prevents task leaks.",
    },
  ],
};
