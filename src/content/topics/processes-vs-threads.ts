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
    "Context switching between threads of the same process is cheaper than between processes: the memory map (page tables) doesn't change, so the TLB doesn't need to be flushed. Switching processes invalidates the TLB, adding cost.",
    "In CPython, the Global Interpreter Lock (GIL) means threads don't achieve true CPU parallelism for pure-Python code — for CPU-bound work you use multiprocessing instead. This is a language-runtime constraint, not an OS one.",
    "Modern designs often combine both: a process-per-core model (for isolation and to sidestep shared-state bugs) with an event loop or a small thread pool inside each process.",
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
  ],
  mcqs: [
    {
      q: "Which of these is NOT shared between threads of the same process?",
      options: ["The heap", "Global variables", "The stack", "Open file descriptors"],
      answerIndex: 2,
      explanation: "Each thread has its own stack; the heap, globals, and file descriptors are shared.",
    },
  ],
  flashcards: [
    { front: "Unit of resource ownership", back: "Process" },
    { front: "Unit of scheduling", back: "Thread" },
    { front: "Per-thread private state", back: "Stack, registers, program counter" },
  ],
  revisionNotes: [
    "Process = isolated memory; thread = shared memory within a process.",
    "Threads share heap/globals/fds; own stack/registers/PC.",
    "Threads: cheaper, riskier. Processes: safer, heavier.",
    "Thread switch is cheaper (no TLB flush).",
  ],
  resources: [
    { label: "Operating Systems: Three Easy Pieces", kind: "book", note: "Free online — excellent on processes, threads, and concurrency." },
    { label: "man 7 pthreads", kind: "docs", note: "POSIX threads reference." },
  ],
  glossary: [
    { term: "IPC", definition: "Inter-process communication — mechanisms like pipes, sockets, and shared memory that let isolated processes cooperate." },
    { term: "TLB", definition: "Translation Lookaside Buffer — a cache of virtual-to-physical address mappings, flushed on a process switch." },
  ],
};
