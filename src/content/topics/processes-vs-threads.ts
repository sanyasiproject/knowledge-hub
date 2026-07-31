import type { TopicContent } from "../types";

export const processesVsThreads: TopicContent = {
  quickSummary: [
    "A process is an independent program in execution with its own isolated memory space; a thread is a unit of execution inside a process that shares that memory with sibling threads.",
    "Processes give isolation and safety at the cost of heavier creation and communication; threads are lightweight and share data freely, but a bug in one can corrupt the whole process.",
    "Rule of thumb: use processes for isolation and fault-tolerance, threads for lightweight parallelism within one program.",
  ],
  detailed: [
    "A process is the OS's unit of resource ownership. When you launch a program, the OS creates a process with its own virtual address space, file descriptors, and security context. Processes are isolated from each other by the memory manager, so one process cannot read another's memory without explicit inter-process communication (IPC).",
    "A thread is the OS's unit of scheduling. Every process has at least one thread; a multithreaded process has several threads that share the same address space — the same heap, globals, and file descriptors — but each has its own stack, registers, and program counter.",
    "Because threads share memory, communication between them is fast (just read/write shared variables), but this is also the source of concurrency bugs: race conditions, deadlocks, and torn reads. Processes avoid these by not sharing memory, but then need IPC (pipes, sockets, shared memory segments) to cooperate.",
  ],
  deepDive: [
    "## Context Switching Costs\n\nContext switching between threads of the same process is cheaper than between processes: the memory map (page tables) doesn't change, so the TLB doesn't need to be flushed. Switching processes invalidates the TLB, adding cost. A thread context switch saves and restores only the **register set** and **stack pointer**, while a process switch must also swap page table base registers, flush TLB entries, and potentially invalidate CPU caches. On modern hardware, a thread switch takes roughly **1-10 microseconds**, while a process switch can take **10-100 microseconds** depending on working set size.",
    "## The Python GIL and Language-Level Constraints\n\nIn CPython, the Global Interpreter Lock (GIL) means threads don't achieve true CPU parallelism for pure-Python code — for CPU-bound work you use multiprocessing instead. This is a language-runtime constraint, not an OS one. The GIL exists because CPython's memory management (reference counting) is not thread-safe. Other runtimes handle this differently: **Java** and **Go** have no GIL equivalent, **Ruby** (CRuby) has a similar GVL, and **Python 3.13+** introduced a free-threaded build that removes the GIL experimentally. For I/O-bound work, Python threads are still effective because the GIL is released during I/O operations.",
    "## Hybrid Architectures\n\nModern designs often combine both: a process-per-core model (for isolation and to sidestep shared-state bugs) with an event loop or a small thread pool inside each process. **Nginx** uses a master process with worker processes, each running an event loop. **Chrome** uses process-per-tab for isolation with threads within each process for rendering, networking, and JavaScript. **Erlang/BEAM** takes this further with lightweight \"processes\" (green threads) scheduled by the VM, giving process-like isolation with thread-like efficiency. The key insight is that processes provide **fault boundaries** while threads provide **performance** within those boundaries.",
  ],
  comparison: {
    columns: ["Aspect", "Process", "Thread"],
    rows: [
      ["Memory", "Isolated address space", "Shared within the process"],
      ["Creation cost", "Heavier (new address space)", "Lighter"],
      ["Communication", "IPC (pipes, sockets, shm)", "Shared variables"],
      ["Fault isolation", "Crash stays contained", "Crash can take down process"],
      ["Context switch", "More expensive (TLB flush)", "Cheaper"],
      ["Best for", "Isolation, fault tolerance", "Lightweight parallelism"],
    ],
  },
  diagrams: [
    {
      title: "Process vs thread memory layout",
      kind: "architecture",
      caption: "One process, shared heap and code, per-thread stacks — contrasted with two fully isolated processes.",
    },
  ],
  code: [
    {
      language: "c",
      caption: "Creating a child process with fork() in C",
      source: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    int shared_var = 42;
    pid_t pid = fork();  // Create a child process

    if (pid < 0) {
        perror("fork failed");
        return 1;
    } else if (pid == 0) {
        // Child process — gets a COPY of parent's memory
        shared_var = 100;
        printf("Child: PID=%d, shared_var=%d\\n", getpid(), shared_var);
    } else {
        // Parent process — its copy is unchanged
        wait(NULL);  // Wait for child to finish
        printf("Parent: PID=%d, shared_var=%d\\n", getpid(), shared_var);
        // Output: shared_var is still 42 in parent
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "C++ threading with shared state and a mutex",
      source: `#include <iostream>
#include <thread>
#include <mutex>
#include <vector>

int counter = 0;
std::mutex mtx;

void increment(int n) {
    for (int i = 0; i < n; ++i) {
        std::lock_guard<std::mutex> lock(mtx);  // RAII lock
        ++counter;  // Shared variable -- needs synchronization
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(increment, 100'000);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "Counter: " << counter << std::endl;  // Always 400000
    // Without the mutex, result would be unpredictable due to race conditions
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "C++ multi-process parallelism with fork() for CPU-bound work",
      source: `#include <iostream>
#include <sys/wait.h>
#include <sys/mman.h>
#include <unistd.h>
#include <cstdint>

int main() {
    // Shared memory between processes (like Python's multiprocessing.Value)
    double* result = static_cast<double*>(
        mmap(nullptr, sizeof(double), PROT_READ | PROT_WRITE,
             MAP_SHARED | MAP_ANONYMOUS, -1, 0));
    *result = 0.0;

    const int NUM_PROCS = 4;
    const int64_t CHUNK = 1'000'000;

    for (int i = 0; i < NUM_PROCS; ++i) {
        pid_t pid = fork();
        if (pid == 0) {
            // Child process -- gets its own memory, except the mmap region
            int64_t start = i * CHUNK;
            int64_t end = (i + 1) * CHUNK;
            double total = 0.0;
            for (int64_t j = start; j < end; ++j) {
                total += static_cast<double>(j) * j;
            }
            *result += total;  // Write to shared memory
            std::cout << "Process " << getpid()
                      << " computed range [" << start << ", " << end << ")" << std::endl;
            _exit(0);  // Child exits
        }
    }

    // Parent waits for all children
    for (int i = 0; i < NUM_PROCS; ++i) {
        wait(nullptr);
    }
    std::cout << "Total: " << *result << std::endl;

    munmap(result, sizeof(double));
    return 0;
}`,
    },
  ],
  animations: [
    {
      title: "Process vs thread creation lifecycle",
      steps: [
        { label: "Program requests concurrency", detail: "The application calls fork() for a new process or pthread_create() for a new thread." },
        { label: "Process creation (fork)", detail: "OS allocates a new PCB, duplicates the virtual address space (copy-on-write), assigns a new PID, copies file descriptor table. The child starts as a near-clone of the parent." },
        { label: "Thread creation (pthread_create)", detail: "OS allocates a new stack within the existing address space, creates a TCB (thread control block), assigns a thread ID. Heap, globals, and file descriptors are shared with the parent." },
        { label: "Scheduling", detail: "Both threads and processes are placed on the scheduler's ready queue. The scheduler treats threads as the schedulable unit on most modern OSes." },
        { label: "Execution and communication", detail: "Threads communicate via shared memory (needs locks). Processes communicate via IPC mechanisms (pipes, sockets, shared memory segments) since their address spaces are isolated." },
        { label: "Termination and cleanup", detail: "Thread exit releases its stack and TCB; the process continues. Process exit releases its entire address space, all threads, file descriptors, and PCB." },
      ],
    },
  ],
  interviewQA: [
    {
      q: "What do threads within a process share, and what do they have their own copy of?",
      a: "They share the code, heap, globals, and open file descriptors. Each thread has its own stack, registers, and program counter.",
      followUps: [
        "Why does each thread need its own stack? (So each can have independent function-call state.)",
        "What problems arise from the shared heap? (Race conditions requiring synchronization.)",
      ],
    },
    {
      q: "When would you choose multiple processes over multiple threads?",
      a: "When you need fault isolation (a crash shouldn't take down everything), when the runtime limits threaded parallelism (e.g. Python's GIL for CPU-bound work), or when a security boundary between units of work is required.",
    },
  ],
  followUps: [
    "How does the GIL change the threads-vs-processes decision in Python?",
    "What is a context switch and why is thread switching cheaper?",
    "Frequently confused: concurrency vs parallelism.",
    "How do green threads (goroutines, Erlang processes) differ from OS threads?",
    "What is copy-on-write and how does it make fork() efficient?",
    "How does Chrome's multi-process architecture improve security and stability?",
  ],
  mcqs: [
    {
      q: "Which of these is NOT shared between threads of the same process?",
      options: ["The heap", "Global variables", "The stack", "Open file descriptors"],
      answerIndex: 2,
      explanation: "Each thread has its own stack; the heap, globals, and file descriptors are shared.",
    },
  ],
  exercises: [
    "You're building a web server that handles 10,000 concurrent connections. Most are I/O-bound (waiting on database queries). Would you use processes, threads, or an event loop? Justify your choice considering memory overhead and the thundering herd problem.",
    "A Python data pipeline needs to process 1 million images (CPU-bound resizing). Using \`threading\` gives no speedup. Explain why and redesign using \`multiprocessing\`. How would you handle the results?",
    "Your multi-threaded C++ application intermittently produces incorrect totals. The bug only appears under high load. Identify the likely cause, explain why it's intermittent, and propose two different fixes (one lock-based, one lock-free).",
    "Design a system where a parent process spawns 4 worker processes to handle requests. If a worker crashes (segfault), the parent should detect it and spawn a replacement. Sketch the architecture and the IPC mechanism you'd use.",
    "Compare the memory cost of spawning 1,000 threads vs 1,000 processes on a Linux system. Estimate stack sizes, page table overhead, and total memory. When does the cost difference actually matter?",
  ],
  cheatSheet: [
    "**Process**: own address space, PID, file descriptors. Created with \`fork()\` (Unix) or \`CreateProcess()\` (Windows).",
    "**Thread**: shares process memory, has own stack/registers/PC. Created with \`pthread_create()\` or language-level APIs.",
    "**fork() is copy-on-write**: child gets a logical copy of parent's memory, but physical pages are shared until written.",
    "**Race condition**: two threads read-modify-write a shared variable without synchronization. Fix with mutexes, atomics, or lock-free structures.",
    "**Deadlock recipe**: two threads each hold one lock and wait for the other. Prevent with lock ordering or try-lock patterns.",
    "**Python GIL**: only one thread runs Python bytecode at a time. Use \`multiprocessing\` for CPU parallelism, \`threading\` for I/O parallelism.",
    "**IPC cost ranking** (fast to slow): shared memory > pipes > Unix sockets > TCP sockets > files.",
    "**Thread-safe != fast**: excessive locking serializes threads and can be slower than single-threaded code. Prefer lock-free or partition-by-thread designs.",
  ],
  flashcards: [
    { front: "Unit of resource ownership", back: "Process" },
    { front: "Unit of scheduling", back: "Thread" },
    { front: "Per-thread private state", back: "Stack, registers, program counter" },
    { front: "Why is process context-switching expensive?", back: "Requires TLB flush and page table swap, invalidating cached address translations." },
    { front: "What does copy-on-write mean for fork()?", back: "Parent and child share physical memory pages until one writes, at which point the OS copies only the modified page." },
    { front: "What is a race condition?", back: "A bug where the program's outcome depends on the unpredictable timing of thread execution, typically from unsynchronized access to shared data." },
    { front: "Name three IPC mechanisms", back: "Pipes, sockets, and shared memory segments (also: message queues, signals, memory-mapped files)." },
  ],
  revisionNotes: [
    "Process = isolated memory; thread = shared memory within a process.",
    "Threads share heap/globals/fds; own stack/registers/PC.",
    "Threads: cheaper, riskier. Processes: safer, heavier.",
    "Thread switch is cheaper (no TLB flush).",
    "Python GIL: threads don't parallelize CPU work; use multiprocessing.",
    "fork() uses copy-on-write: cheap until the child writes.",
    "Deadlock = circular wait on locks. Prevent with consistent lock ordering.",
    "Modern pattern: process-per-core + thread pool or event loop within each.",
  ],
  resources: [
    { label: "Operating Systems: Three Easy Pieces", kind: "book", note: "Free online — excellent on processes, threads, and concurrency." },
    { label: "man 7 pthreads", kind: "docs", note: "POSIX threads reference." },
    { label: "The Linux Programming Interface, Ch. 24-33", kind: "book", note: "Comprehensive coverage of processes, threads, and IPC on Linux." },
    { label: "Concurrency is not Parallelism — Rob Pike", kind: "video", note: "Go talk clarifying the distinction with practical examples." },
  ],
  glossary: [
    { term: "IPC", definition: "Inter-process communication — mechanisms like pipes, sockets, and shared memory that let isolated processes cooperate." },
    { term: "TLB", definition: "Translation Lookaside Buffer — a cache of virtual-to-physical address mappings, flushed on a process switch." },
  ],
};
