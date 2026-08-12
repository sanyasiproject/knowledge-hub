import type { TopicContent } from "../types";

export const concurrencyVsParallelism: TopicContent = {
  quickSummary: [
    "Concurrency is about dealing with many things at once; parallelism is about doing many things at once. Rob Pike's famous distinction highlights that concurrency is a design concern (structure) while parallelism is an execution concern (simultaneous computation).",
    "Concurrent programs interleave tasks on one or more processors, giving the illusion of simultaneity. Parallel programs literally execute multiple computations at the same instant on separate hardware units (cores, ALUs, machines).",
    "A single-core CPU can run concurrent code by time-slicing but cannot achieve true parallelism. Multiple cores enable both concurrency and parallelism simultaneously.",
    "Modern languages provide different abstractions: Go uses goroutines and channels, Erlang uses lightweight processes and message passing, Python offers asyncio for concurrency but is limited by the GIL for CPU-bound parallelism, and JavaScript/TypeScript uses an event loop for concurrency with Worker threads for parallelism.",
  ],

  detailed: [
    "Rob Pike (co-creator of Go) defines concurrency as the composition of independently executing processes, and parallelism as the simultaneous execution of computations. A concurrent program has multiple logical threads of control; a parallel program runs multiple computations at the same physical instant. You can have concurrency without parallelism (single-core time-slicing), parallelism without concurrency (SIMD instructions on a data array), or both together.",
    "Interleaving vs simultaneous execution: on a single core, the OS scheduler rapidly switches between threads (context switching), giving each a time slice. No two instructions execute at the same wall-clock instant, but progress is made on multiple tasks. With multiple cores, separate threads run on separate cores at the same instant — true parallelism. The key insight is that concurrency is about structure (how you decompose a problem), while parallelism is about execution (how hardware runs it).",
    "Amdahl's Law places an upper bound on the speedup achievable by parallelism. If a fraction P of a program can be parallelized, the maximum speedup with N processors is 1 / ((1 - P) + P/N). As N approaches infinity, the speedup is bounded by 1 / (1 - P). A program that is 95% parallelizable can at best achieve a 20x speedup, no matter how many cores are available. This motivates minimizing serial bottlenecks.",
    "Hardware threads (hyper-threading / SMT) allow a single physical core to present two or more logical cores to the OS. Each logical core has its own architectural state (registers, program counter) but shares execution units and caches. This improves throughput when one logical thread stalls (e.g., on a cache miss), but does not double performance — typical gains are 15-30%. Logical threads (green threads, goroutines, fibers) are scheduled in user space, are far cheaper to create (kilobytes of stack vs megabytes for OS threads), and can number in the millions.",
    "Async I/O and event loops avoid blocking OS threads while waiting for I/O. Instead of one-thread-per-connection, a single thread runs an event loop that dispatches callbacks or coroutines when I/O completes. Node.js, Python asyncio, and Tokio (Rust) all follow this model. The event loop is concurrent but single-threaded — ideal for I/O-bound workloads but unsuitable for CPU-bound work without offloading to a thread or process pool.",
    "The Python GIL (Global Interpreter Lock) prevents multiple native threads from executing Python bytecode simultaneously in CPython. This means threading in Python achieves concurrency (interleaving during I/O waits) but not CPU-bound parallelism. To achieve true parallelism in Python, use the multiprocessing module, subprocess, or C extensions that release the GIL. Python 3.13 introduced an experimental free-threaded build (PEP 703) that removes the GIL entirely.",
  ],

  deepDive: [
    "Go's concurrency model is built on CSP (Communicating Sequential Processes). Goroutines are multiplexed onto a small pool of OS threads by the Go runtime scheduler (M:N scheduling). Channels provide typed, synchronized communication between goroutines. The select statement allows a goroutine to wait on multiple channel operations. This design makes it natural to write highly concurrent servers without manual thread management or shared-memory locking.",
    "Erlang's actor model assigns each process a private heap and mailbox. Processes communicate exclusively through asynchronous message passing — there is no shared mutable state. The BEAM VM can run millions of lightweight processes, each with a few hundred bytes of initial stack. Supervisors restart failed processes automatically, enabling fault-tolerant systems. OTP (Open Telecom Platform) codifies these patterns into behaviours like gen_server and gen_statem.",
    "Lock-free and wait-free data structures use atomic CPU instructions (CAS — Compare-And-Swap) to coordinate access without mutexes. Lock-free guarantees system-wide progress (at least one thread makes progress); wait-free guarantees per-thread progress in bounded steps. These are critical in high-performance systems (trading engines, kernel schedulers) but are notoriously difficult to implement correctly due to the ABA problem, memory ordering, and lack of composability.",
    "Work-stealing schedulers (used by Go, Tokio, Java ForkJoinPool) maintain per-thread task queues. When a thread's queue is empty, it steals tasks from another thread's queue (from the opposite end to minimize contention). This provides automatic load balancing and good cache locality for the common case where a thread processes its own tasks.",
    "Structured concurrency (introduced in languages like Kotlin, Swift, and Java 21's virtual threads) ensures that concurrent tasks form a tree: a parent scope waits for all child tasks, exceptions propagate upward, and cancellation cascades downward. This eliminates fire-and-forget goroutine leaks and makes concurrent code easier to reason about, test, and debug.",
  ],

  code: [
    {
      language: "go",
      caption: "Go: fan-out / fan-in with goroutines and channels",
      source: `package main

import (
\t"fmt"
\t"sync"
)

func producer(id int, ch chan<- int, wg *sync.WaitGroup) {
\tdefer wg.Done()
\tfor i := 0; i < 5; i++ {
\t\tch <- id*100 + i
\t}
}

func consumer(ch <-chan int, done chan<- bool) {
\tfor val := range ch {
\t\tfmt.Println("received:", val)
\t}
\tdone <- true
}

func main() {
\tch := make(chan int, 10)
\tdone := make(chan bool)
\tvar wg sync.WaitGroup

\t// Fan-out: 3 producers write concurrently
\tfor i := 0; i < 3; i++ {
\t\twg.Add(1)
\t\tgo producer(i, ch, &wg)
\t}

\t// Fan-in: 1 consumer reads all values
\tgo consumer(ch, done)

\twg.Wait()
\tclose(ch)
\t<-done
}`,
    },
    {
      language: "cpp",
      caption:
        "C++: std::async concurrency vs std::thread parallelism",
      source: `#include <iostream>
#include <future>
#include <thread>
#include <vector>
#include <string>
#include <chrono>
#include <numeric>

// --- Concurrency with std::async (interleaved I/O-bound tasks) ---

std::string fetch(const std::string& name, int delay_ms) {
    std::cout << "[async] " << name << " starting\\n";
    std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
    std::cout << "[async] " << name << " done\\n";
    return name + "-result";
}

void concurrent_io() {
    // Launch tasks concurrently — runtime may use a thread pool
    auto f1 = std::async(std::launch::async, fetch, "A", 1000);
    auto f2 = std::async(std::launch::async, fetch, "B", 1500);
    auto f3 = std::async(std::launch::async, fetch, "C", 500);

    // Collect results (blocks until each is ready)
    std::cout << "Results: " << f1.get() << ", "
              << f2.get() << ", " << f3.get() << "\\n";
}

// --- Parallelism with std::thread (true multi-core execution) ---

int64_t cpu_work(int n) {
    // CPU-bound: sum of squares
    int64_t sum = 0;
    for (int i = 0; i < n; ++i) sum += static_cast<int64_t>(i) * i;
    return sum;
}

void parallel_cpu() {
    constexpr int num_threads = 4;
    constexpr int chunk_size = 10'000'000;
    std::vector<int64_t> results(num_threads);
    std::vector<std::thread> threads;

    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back([&results, t]() {
            results[t] = cpu_work(chunk_size);
        });
    }
    for (auto& th : threads) th.join();

    std::cout << "Parallel sums:";
    for (auto s : results) std::cout << " " << s;
    std::cout << "\\n";
}

int main() {
    auto start = std::chrono::steady_clock::now();
    concurrent_io();
    auto elapsed = std::chrono::steady_clock::now() - start;
    std::cout << "Async took "
              << std::chrono::duration<double>(elapsed).count() << "s\\n\\n";

    start = std::chrono::steady_clock::now();
    parallel_cpu();
    elapsed = std::chrono::steady_clock::now() - start;
    std::cout << "Parallel took "
              << std::chrono::duration<double>(elapsed).count() << "s\\n";
}`,
    },
    {
      language: "typescript",
      caption:
        "TypeScript: Promise.all concurrency and Worker threads parallelism",
      source: `// --- Concurrency: Promise.all on the event loop ---

async function fetchData(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

async function concurrentFetches(): Promise<void> {
  const urls = [
    "https://api.example.com/a",
    "https://api.example.com/b",
    "https://api.example.com/c",
  ];
  // All requests fly concurrently on one thread
  const results = await Promise.all(urls.map(fetchData));
  console.log(\\\`Fetched \\\${results.length} responses\\\`);
}

// --- Parallelism: Worker threads for CPU-bound work ---
// worker.ts
import { parentPort } from "node:worker_threads";

parentPort?.on("message", (n: number) => {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += i * i;
  parentPort?.postMessage(sum);
});

// main.ts
import { Worker } from "node:worker_threads";

function runWorker(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const w = new Worker("./worker.ts");
    w.postMessage(n);
    w.on("message", resolve);
    w.on("error", reject);
  });
}

async function parallelCompute(): Promise<void> {
  const results = await Promise.all([
    runWorker(10_000_000),
    runWorker(10_000_000),
    runWorker(10_000_000),
    runWorker(10_000_000),
  ]);
  console.log("Worker results:", results);
}`,
    },
  ],

  diagrams: [
    {
      title: "Concurrency vs Parallelism Decision Flow",
      kind: "flow",
      caption: "Decision tree for choosing between concurrency and parallelism based on whether tasks are I/O-bound or CPU-bound and whether multiple cores are available.",
      mermaid: `flowchart TD
    Start["Workload to optimize"] --> Q1{"Multiple CPU cores available?"}
    Q1 -->|"No"| Conc["Concurrency - interleave tasks"]
    Q1 -->|"Yes"| Q2{"Tasks are CPU-bound?"}
    Q2 -->|"Yes"| Par["Parallelism - run tasks simultaneously"]
    Q2 -->|"No - I/O bound"| Both["Concurrency plus Parallelism"]
    Conc --> IOBound["Use async I/O or coroutines"]
    Par --> Threads["Use worker threads or processes"]
    Both --> EventPool["Event loop plus thread pool"]`,
    },
    {
      title: "Concurrency and Parallelism Concept Map",
      kind: "mindmap",
      caption: "Mindmap covering concurrency, parallelism, their mechanisms, use cases, and the distinctions between them.",
      mermaid: `mindmap
  root["Concurrency vs Parallelism"]
    Concurrency
      Interleaved execution
      Single or multi core
      Context switching
      Async I/O
      Coroutines
      Event loops
    Parallelism
      Simultaneous execution
      Requires multiple cores
      Data parallelism
      Task parallelism
      SIMD
      GPU computing
    Both combined
      Async web servers
      Node.js cluster
      Go runtime`,
    },
    {
      title: "Single Core vs Multi Core Execution",
      kind: "architecture",
      caption: "Single-core systems achieve concurrency through time-slicing; multi-core systems achieve true parallelism by running tasks on separate cores simultaneously.",
      mermaid: `graph TB
    subgraph SingleCore["Single Core - Concurrent"]
        CPU1["Core 0"]
        T1A["Task A - slice 1"]
        T1B["Task B - slice 2"]
        T1C["Task A - slice 3"]
        T1D["Task B - slice 4"]
        CPU1 --> T1A --> T1B --> T1C --> T1D
    end
    subgraph MultiCore["Multi Core - Parallel"]
        CPU2["Core 0"] --> T2A["Task A"]
        CPU3["Core 1"] --> T2B["Task B"]
        CPU4["Core 2"] --> T2C["Task C"]
    end`,
    },
    {
      title: "Context Switch Sequence",
      kind: "sequence",
      caption: "The OS scheduler saves and restores CPU context when switching between concurrent tasks, enabling apparent simultaneous progress on a single core.",
      mermaid: `sequenceDiagram
    participant OS as OS Scheduler
    participant CPU as CPU Core 0
    participant A as Task A
    participant B as Task B

    OS->>CPU: Assign Task A
    CPU->>A: Execute instructions
    Note over CPU: Timer interrupt fires
    CPU->>OS: Save A context
    OS->>OS: Select next task B
    OS->>CPU: Restore B context
    CPU->>B: Execute instructions
    B->>B: Blocks on I/O
    CPU->>OS: Voluntary yield
    OS->>CPU: Restore A context
    CPU->>A: Resume from saved PC`,
    },
  ],

  animations: [
    {
      title: "Time-Sliced Concurrency on a Single Core",
      steps: [
        {
          label: "Task A starts",
          detail:
            "The scheduler assigns the CPU to Task A. It begins executing its instructions.",
        },
        {
          label: "Context switch to Task B",
          detail:
            "After a time slice (e.g., 10ms), the scheduler saves Task A's registers and program counter, loads Task B's state, and Task B runs.",
        },
        {
          label: "Task B blocks on I/O",
          detail:
            "Task B issues a network read and blocks. The scheduler immediately switches to Task C instead of wasting the time slice.",
        },
        {
          label: "Task C runs, then Task A resumes",
          detail:
            "Task C uses its slice, then the scheduler returns to Task A. All three tasks make progress despite a single core.",
        },
        {
          label: "I/O completes, Task B resumes",
          detail:
            "The network response arrives. Task B is marked runnable and gets scheduled in the next available slot.",
        },
      ],
    },
    {
      title: "Parallel Execution on Multiple Cores",
      steps: [
        {
          label: "Tasks assigned to cores",
          detail:
            "The OS scheduler assigns Task A to Core 0, Task B to Core 1, and Task C to Core 2. All three begin executing at the same wall-clock instant.",
        },
        {
          label: "Simultaneous progress",
          detail:
            "Each core executes its task independently. There is no time-slicing — all tasks literally run at the same time.",
        },
        {
          label: "Synchronization point",
          detail:
            "Tasks reach a barrier or join point. The fastest cores idle until the slowest completes — this is the serial fraction Amdahl's Law warns about.",
        },
        {
          label: "Results merged",
          detail:
            "A coordinator thread collects partial results from all cores and combines them into the final output.",
        },
      ],
    },
  ],

  comparison: {
    columns: [
      "Aspect",
      "Concurrency",
      "Parallelism",
    ],
    rows: [
      [
        "Definition",
        "Dealing with multiple tasks at once (structure)",
        "Doing multiple tasks at once (execution)",
      ],
      [
        "Requires multiple cores",
        "No — works on a single core via interleaving",
        "Yes — requires multiple physical execution units",
      ],
      [
        "Primary benefit",
        "Responsiveness, throughput for I/O-bound work",
        "Raw speed for CPU-bound computation",
      ],
      [
        "Classic example",
        "Web server handling 10k connections on one thread (event loop)",
        "Matrix multiplication split across 8 cores",
      ],
      [
        "Scheduling",
        "Cooperative (coroutines) or preemptive (OS threads)",
        "OS or hardware scheduler assigns threads to cores",
      ],
      [
        "Key risk",
        "Race conditions, deadlocks, starvation",
        "False sharing, cache coherence overhead, Amdahl's ceiling",
      ],
      [
        "Language examples",
        "JavaScript event loop, Python asyncio, Go goroutines",
        "OpenMP, CUDA, Java parallel streams, Python multiprocessing",
      ],
    ],
  },

  interviewQA: [
    {
      q: "What is the difference between concurrency and parallelism?",
      a: "Concurrency is about structuring a program to handle multiple tasks that can make progress independently — they may or may not execute simultaneously. Parallelism is about executing multiple computations at the exact same instant on separate hardware. A single-core machine can be concurrent (time-slicing) but not parallel. Rob Pike summarizes it as: concurrency is about dealing with lots of things at once, parallelism is about doing lots of things at once.",
      followUps: [
        "Can you have parallelism without concurrency?",
        "How does SIMD relate to parallelism?",
      ],
    },
    {
      q: "What is Amdahl's Law and why does it matter?",
      a: "Amdahl's Law states that the maximum speedup from parallelizing a program is limited by its serial (non-parallelizable) portion. The formula is S = 1 / ((1 - P) + P/N), where P is the parallelizable fraction and N is the number of processors. Even with infinite cores, a program that is 90% parallelizable can only achieve a 10x speedup. This matters because it tells you to focus optimization effort on reducing serial bottlenecks rather than just adding more cores.",
      followUps: [
        "What is Gustafson's Law and how does it differ?",
        "How do you identify the serial fraction in practice?",
      ],
    },
    {
      q: "Why can't Python achieve true CPU-bound parallelism with threads?",
      a: "CPython has a Global Interpreter Lock (GIL) — a mutex that allows only one thread to execute Python bytecode at a time. This means even on a multi-core machine, Python threads cannot run CPU-bound Python code in parallel. The GIL exists to protect CPython's reference-counting memory management from race conditions. For CPU parallelism, use multiprocessing (separate processes with separate GILs), C extensions that release the GIL, or the experimental free-threaded build in Python 3.13+.",
      followUps: [
        "When are Python threads still useful despite the GIL?",
        "How does the free-threaded Python build work?",
      ],
    },
    {
      q: "How do goroutines differ from OS threads?",
      a: "Goroutines are user-space lightweight threads managed by the Go runtime, not the OS. They start with a small stack (~2-8 KB, dynamically grown) versus ~1-8 MB for OS threads. The Go scheduler multiplexes thousands or millions of goroutines onto a small pool of OS threads (M:N scheduling). Context switching between goroutines is cheaper since it does not require a kernel transition. Communication between goroutines uses channels rather than shared memory and locks.",
      followUps: [
        "What is the Go scheduler's GMP model?",
        "How does Go handle blocking system calls with goroutines?",
      ],
    },
    {
      q: "Explain how an event loop achieves concurrency on a single thread.",
      a: "An event loop continuously polls for completed I/O events and dispatches registered callbacks or coroutines. When a task initiates I/O (network read, file write, timer), it registers interest with the OS (via epoll, kqueue, or IOCP) and yields control back to the loop. The loop picks up the next ready event and runs its handler. Since no task ever blocks the thread — they all yield on I/O — many tasks make progress concurrently on a single thread. This is highly efficient for I/O-bound workloads but blocks the entire loop if any handler performs CPU-heavy work.",
    },
  ],

  followUps: [
    "Is Node.js concurrent, parallel, or both — and why?",
    "Can you have parallelism without concurrency?",
    "Why does a GIL prevent parallelism but not concurrency?",
    "How does Amdahl's law limit what parallelism can buy you?",
  ],
  mcqs: [
    {
      q: "A program runs on a single-core CPU and uses async/await to handle multiple network requests simultaneously. This is an example of:",
      options: [
        "Parallelism only",
        "Concurrency only",
        "Both concurrency and parallelism",
        "Neither concurrency nor parallelism",
      ],
      answerIndex: 1,
      explanation:
        "On a single core, only one instruction executes at a time. Async/await interleaves tasks (concurrency) but does not execute them simultaneously (no parallelism).",
    },
    {
      q: "According to Amdahl's Law, if 80% of a program is parallelizable, what is the maximum speedup with infinite processors?",
      options: ["4x", "5x", "8x", "10x"],
      answerIndex: 1,
      explanation:
        "S = 1 / (1 - P) = 1 / (1 - 0.8) = 1 / 0.2 = 5x. The 20% serial portion caps the speedup at 5x regardless of core count.",
    },
    {
      q: "Which statement about the Python GIL is correct?",
      options: [
        "The GIL prevents all forms of concurrency in Python",
        "The GIL only affects CPU-bound parallelism; I/O-bound threads can still run concurrently",
        "The GIL is present in all Python implementations",
        "The GIL makes Python thread-safe for all operations",
      ],
      answerIndex: 1,
      explanation:
        "The GIL is released during I/O operations, so I/O-bound threads can overlap. It blocks CPU-bound thread parallelism. PyPy and Jython have different GIL strategies. The GIL protects interpreter internals, not user data structures.",
    },
    {
      q: "What is the primary advantage of M:N threading (as used by Go goroutines)?",
      options: [
        "It eliminates the need for synchronization primitives",
        "It maps many user-space threads to a few OS threads, reducing overhead",
        "It guarantees deterministic execution order",
        "It allows threads to share stack memory safely",
      ],
      answerIndex: 1,
      explanation:
        "M:N scheduling multiplexes many lightweight user threads onto a smaller number of OS threads, reducing context-switch overhead and memory usage while still leveraging multiple cores.",
    },
    {
      q: "In a work-stealing scheduler, what happens when a thread's local task queue is empty?",
      options: [
        "The thread terminates",
        "The thread blocks until new work arrives",
        "The thread steals tasks from another thread's queue",
        "The thread creates new tasks automatically",
      ],
      answerIndex: 2,
      explanation:
        "Work-stealing schedulers let idle threads take tasks from the tail of another thread's deque, providing automatic load balancing with minimal contention.",
    },
  ],

  flashcards: [
    {
      front: "What is Rob Pike's distinction between concurrency and parallelism?",
      back: "Concurrency is about dealing with lots of things at once (structure/design). Parallelism is about doing lots of things at once (simultaneous execution). Concurrency is a property of the program; parallelism is a property of the execution.",
    },
    {
      front: "State Amdahl's Law formula",
      back: "Speedup S = 1 / ((1 - P) + P/N), where P is the parallelizable fraction and N is the number of processors. Maximum speedup (N -> infinity) = 1 / (1 - P).",
    },
    {
      front: "What is the difference between hardware threads and software threads?",
      back: "Hardware threads (SMT/hyper-threading) are logical cores on a physical core sharing execution units (~15-30% throughput gain). Software threads are OS-managed execution contexts with their own stack (~1-8 MB). Green threads/goroutines are user-space threads with tiny stacks (~2-8 KB) scheduled by a runtime, not the OS.",
    },
    {
      front: "How does an event loop provide concurrency?",
      back: "It polls for I/O completion events in a loop and dispatches registered callbacks. Tasks yield on I/O (never block), so many tasks interleave on one thread. Uses OS mechanisms like epoll (Linux), kqueue (macOS), or IOCP (Windows).",
    },
    {
      front: "Why does the Python GIL exist?",
      back: "To protect CPython's reference-counting garbage collector from race conditions. Without the GIL, every Py_INCREF/Py_DECREF would need atomic operations or fine-grained locks, adding significant overhead to single-threaded code.",
    },
    {
      front: "What is CSP and which language popularized it?",
      back: "Communicating Sequential Processes — a formal model by Tony Hoare where independent processes communicate via typed channels. Go popularized it with goroutines and channels. The select statement multiplexes over channel operations.",
    },
    {
      front: "What is structured concurrency?",
      back: "A paradigm where concurrent tasks form a parent-child tree. The parent scope waits for all children, exceptions propagate upward, and cancellation cascades downward. Prevents orphaned tasks and resource leaks. Used in Kotlin coroutines, Swift async/await, and Java 21 virtual threads.",
    },
    {
      front: "What is false sharing in parallel computing?",
      back: "When threads on different cores modify independent variables that happen to reside on the same cache line, each write invalidates the other core's cache — causing excessive cache coherence traffic and degrading performance despite no logical data sharing.",
    },
  ],

  revisionNotes: [
    "Concurrency = structure (interleaving tasks). Parallelism = execution (simultaneous tasks). You can have one without the other.",
    "Amdahl's Law: max speedup = 1/(1-P). A 5% serial section caps you at 20x speedup with infinite cores.",
    "Hardware threads (SMT) share a core's execution units; logical/green threads are scheduled in user space at much lower cost.",
    "Event loops (Node.js, asyncio, Tokio) enable massive I/O concurrency on one thread. CPU-bound work blocks the loop — offload it.",
    "Python GIL: threads help for I/O concurrency, not CPU parallelism. Use multiprocessing or the free-threaded build for CPU-bound work.",
    "Go: goroutines + channels (CSP model). M:N scheduling. Tiny stacks. Millions of goroutines are practical.",
    "Erlang/BEAM: actor model, process isolation, message passing, let-it-crash supervision trees. Millions of processes.",
    "Work-stealing schedulers provide automatic load balancing: idle threads steal from busy threads' queues.",
  ],

  cheatSheet: [
    "concurrent != parallel — concurrency is about structure, parallelism is about execution",
    "Amdahl: S = 1/((1-P) + P/N) — serial fraction dominates at scale",
    "Gustafson's Law: scale the problem size with cores for better real-world speedup",
    "OS thread: ~1-8 MB stack, kernel-scheduled. Goroutine: ~2-8 KB stack, runtime-scheduled",
    "Event loop pattern: register I/O interest -> yield -> callback on completion -> repeat",
    "Python GIL bypass: multiprocessing, C extensions, or free-threaded build (3.13+)",
    "Go channels: typed, synchronized, directional (chan<-, <-chan). Use select for multiplexing",
    "Erlang: no shared state, immutable data, async message passing, supervisor fault tolerance",
  ],

  resources: [
    {
      label: "Rob Pike — Concurrency Is Not Parallelism (talk)",
      kind: "video",
      note: "The definitive explanation of the distinction, with gopher examples",
    },
    {
      label: "The Go Programming Language — Chapter 8: Goroutines and Channels",
      kind: "book",
      note: "Donovan & Kernighan. Practical CSP patterns in Go",
    },
    {
      label: "Seven Concurrency Models in Seven Weeks — Paul Butcher",
      kind: "book",
      note: "Covers threads/locks, actors, CSP, data parallelism, and more",
    },
    {
      label: "Python asyncio documentation",
      kind: "docs",
      note: "Official guide to coroutines, tasks, event loops, and async patterns",
    },
    {
      label: "Notes on structured concurrency — Nathaniel J. Smith",
      kind: "article",
      note: "Foundational essay on structured concurrency and the Trio library",
    },
  ],

  glossary: [
    {
      term: "Concurrency",
      definition:
        "The ability of a system to handle multiple tasks by interleaving their execution, making progress on more than one task over a period of time.",
    },
    {
      term: "Parallelism",
      definition:
        "The simultaneous execution of multiple computations on separate hardware, such as multiple CPU cores or machines.",
    },
    {
      term: "Amdahl's Law",
      definition:
        "A formula that gives the theoretical maximum speedup of a program from parallelization, limited by the serial (non-parallelizable) fraction of the code.",
    },
    {
      term: "GIL (Global Interpreter Lock)",
      definition:
        "A mutex in CPython that allows only one thread to execute Python bytecode at a time, preventing true CPU-bound parallelism with threads.",
    },
    {
      term: "Goroutine",
      definition:
        "A lightweight, user-space thread in Go, managed by the Go runtime scheduler. Goroutines have small, dynamically-sized stacks and are multiplexed onto OS threads.",
    },
    {
      term: "Event Loop",
      definition:
        "A programming construct that waits for and dispatches I/O events or messages, enabling single-threaded concurrency by running callbacks when operations complete.",
    },
    {
      term: "CSP (Communicating Sequential Processes)",
      definition:
        "A formal concurrency model by Tony Hoare where independent processes communicate through synchronous, typed channels rather than shared memory.",
    },
    {
      term: "Work Stealing",
      definition:
        "A scheduling strategy where idle threads steal tasks from the queues of busy threads, providing dynamic load balancing in parallel runtimes.",
    },
  ],

  exercises: [
    "Write a C++ program that computes the **sum of squares** from 1 to 100,000,000 in three ways: (1) sequentially in a single thread, (2) using `std::async` with 4 parallel tasks each handling a quarter of the range, and (3) using `std::thread` with a shared `std::atomic<long long>` accumulator. Measure and compare the *wall-clock time* for each. Apply **Amdahl's Law**: what is the theoretical maximum speedup if the serial fraction (setup, result merging) takes 5% of the total time?",
    "Implement a **thread pool** in C++ with a fixed number of worker threads and a thread-safe task queue (`std::queue<std::function<void()>>` protected by `std::mutex` + `std::condition_variable`). Submit 1,000 tasks that each simulate an I/O wait (`std::this_thread::sleep_for(1ms)`). Compare throughput with 1, 4, and 16 worker threads. Is this *concurrency*, *parallelism*, or both? Explain your answer.",
    "Explain why Python's **GIL** prevents CPU-bound parallelism with `threading` but allows I/O-bound concurrency. Write a Python script that downloads 10 web pages: first with `threading.Thread` (concurrent I/O), then with `multiprocessing.Pool` (parallel CPU). Measure the time for each. Now write the equivalent in C++ using `std::thread` -- does C++ have a GIL? Why or why not?",
    "Design a **concurrent web scraper** that fetches 100 URLs and extracts their titles. Compare two architectures: (1) an *event-loop* model (single thread, async I/O using callbacks or coroutines) and (2) a *thread-per-request* model (one `std::thread` per URL). For each, analyze: maximum memory usage, context-switch overhead, and behavior when one URL takes 30 seconds to respond. Which model scales better to 10,000 URLs?",
    "A matrix multiplication of two 1000x1000 matrices is embarrassingly parallel. Implement it in C++ using `std::thread`, splitting rows across *N* threads. Measure speedup for N = 1, 2, 4, 8, and 16 on your machine. Plot the results against **Amdahl's Law** and **Gustafson's Law** predictions. At what thread count does adding more threads *hurt* performance due to **false sharing** and cache coherence overhead? How would you use `alignas` to mitigate false sharing?"
  ],
};
