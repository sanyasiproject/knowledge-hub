import type { Domain } from "../schema";

export const foundations: Domain[] = [
  {
    slug: "computer-science-fundamentals",
    title: "Computer Science Fundamentals",
    summary: "The bedrock ideas every engineer builds on — computation, complexity, and how machines actually compute.",
    icon: "🧠",
    group: "Foundations",
    categories: [
      {
        slug: "computation-and-complexity",
        title: "Computation & Complexity",
        summary: "How we reason about what computers can do and how expensive it is.",
        topics: [
          { slug: "big-o-notation", title: "Big-O Notation", summary: "Describing how algorithms scale with input size.", level: "Beginner", tags: ["complexity", "analysis"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "interview-qa", "mcqs"], related: ["time-space-complexity", "amortized-analysis", "recursion", "sorting", "hash-tables"] },
          { slug: "time-space-complexity", title: "Time & Space Complexity", summary: "Trading memory for speed and reasoning about both.", level: "Beginner", tags: ["complexity"], related: ["big-o-notation", "amortized-analysis", "memory-hierarchy", "recursion", "hash-tables"] },
          { slug: "amortized-analysis", title: "Amortized Analysis", summary: "Average cost per operation across a sequence.", level: "Advanced", tags: ["complexity"], related: ["big-o-notation", "time-space-complexity", "advanced-structures", "hash-tables", "balanced-trees"] },
          { slug: "p-vs-np", title: "P, NP & NP-Completeness", summary: "The frontier of what is efficiently solvable.", level: "Advanced Concepts", tags: ["theory"], related: ["automata-theory", "turing-machines", "big-o-notation", "graph-theory", "combinatorics"] },
        ],
      },
      {
        slug: "how-computers-work",
        title: "How Computers Work",
        summary: "From bits to instructions — the machine underneath.",
        topics: [
          { slug: "number-systems", title: "Number Systems & Binary", summary: "Binary, hex, and how data is represented.", level: "Beginner", tags: ["representation"], related: ["boolean-logic", "cpu-architecture", "memory-hierarchy", "set-theory-logic", "type-systems"] },
          { slug: "boolean-logic", title: "Boolean Logic & Gates", summary: "The logic that hardware is built from.", level: "Beginner", tags: ["logic"], related: ["number-systems", "cpu-architecture", "set-theory-logic", "automata-theory", "type-systems"] },
          { slug: "cpu-architecture", title: "CPU Architecture & Instruction Cycle", summary: "Fetch-decode-execute and the memory hierarchy.", level: "Intermediate", tags: ["hardware"], related: ["memory-hierarchy", "processes-vs-threads", "context-switching", "cpu-scheduling", "virtual-memory"] },
          { slug: "memory-hierarchy", title: "Memory Hierarchy & Caches", summary: "Registers, cache, RAM, disk — and why locality matters.", level: "Intermediate", tags: ["hardware", "performance"], related: ["cpu-architecture", "virtual-memory", "caching-basics", "memory-allocation", "latency-throughput"] },
        ],
      },
      {
        slug: "languages-and-computation",
        title: "Theory of Computation",
        summary: "Formal models that define computation itself.",
        topics: [
          { slug: "automata-theory", title: "Automata & Formal Languages", summary: "Finite automata, regular languages, and grammars.", level: "Advanced", tags: ["theory"], related: ["turing-machines", "p-vs-np", "compilers-interpreters", "set-theory-logic", "boolean-logic"] },
          { slug: "turing-machines", title: "Turing Machines & Computability", summary: "The theoretical limits of computation.", level: "Advanced Concepts", tags: ["theory"], related: ["automata-theory", "p-vs-np", "compilers-interpreters", "virtual-machines", "set-theory-logic"] },
          { slug: "compilers-interpreters", title: "Compilers & Interpreters", summary: "How source code becomes running programs.", level: "Advanced", tags: ["languages"], related: ["compilation-vs-interpretation", "virtual-machines", "automata-theory", "type-systems", "garbage-collection"] },
        ],
      },
    ],
  },
  {
    slug: "mathematics",
    title: "Mathematics for Engineers",
    summary: "The applied math that shows up in algorithms, ML, distributed systems, and interviews.",
    icon: "📐",
    group: "Foundations",
    categories: [
      {
        slug: "discrete-mathematics",
        title: "Discrete Mathematics",
        summary: "The math of countable structures — the language of CS.",
        topics: [
          { slug: "set-theory-logic", title: "Sets, Logic & Proofs", summary: "Foundational reasoning tools.", level: "Beginner", tags: ["discrete"], related: ["boolean-logic", "combinatorics", "graph-theory", "automata-theory", "probability-basics"] },
          { slug: "combinatorics", title: "Combinatorics & Counting", summary: "Counting arrangements and possibilities.", level: "Intermediate", tags: ["discrete"], related: ["set-theory-logic", "probability-basics", "graph-theory", "p-vs-np", "recursion"] },
          { slug: "graph-theory", title: "Graph Theory", summary: "Vertices, edges, and the math behind graph algorithms.", level: "Intermediate", tags: ["discrete", "graphs"], related: ["graphs", "combinatorics", "set-theory-logic", "graph-databases", "p-vs-np"] },
        ],
      },
      {
        slug: "probability-statistics",
        title: "Probability & Statistics",
        summary: "Reasoning under uncertainty — essential for ML and systems.",
        topics: [
          { slug: "probability-basics", title: "Probability Fundamentals", summary: "Events, distributions, and expectation.", level: "Beginner", tags: ["probability"], related: ["statistics-basics", "bayes-theorem", "combinatorics", "ml-basics", "set-theory-logic"] },
          { slug: "statistics-basics", title: "Descriptive & Inferential Statistics", summary: "Summarizing and drawing conclusions from data.", level: "Intermediate", tags: ["statistics"], related: ["probability-basics", "bayes-theorem", "ml-evaluation", "ml-basics", "vectors-matrices"] },
          { slug: "bayes-theorem", title: "Bayes' Theorem", summary: "Updating beliefs with evidence.", level: "Intermediate", tags: ["probability"], related: ["probability-basics", "statistics-basics", "ml-basics", "llm-fundamentals", "rag-fundamentals"] },
        ],
      },
      {
        slug: "linear-algebra",
        title: "Linear Algebra",
        summary: "Vectors and matrices — the backbone of ML and graphics.",
        topics: [
          { slug: "vectors-matrices", title: "Vectors & Matrices", summary: "Core objects and operations.", level: "Beginner", tags: ["linalg"], related: ["eigenvalues", "ml-basics", "tokenization-embeddings", "statistics-basics", "chunking-embeddings"] },
          { slug: "eigenvalues", title: "Eigenvalues & Eigenvectors", summary: "The directions a transformation preserves.", level: "Advanced", tags: ["linalg"], related: ["vectors-matrices", "ml-basics", "fine-tuning", "statistics-basics", "inference-optimization"] },
        ],
      },
    ],
  },
  {
    slug: "data-structures",
    title: "Data Structures",
    summary: "The containers and organizations of data that make algorithms possible.",
    icon: "🗂️",
    group: "Foundations",
    categories: [
      {
        slug: "linear-structures",
        title: "Linear Structures",
        summary: "Data laid out in sequence.",
        topics: [
          { slug: "arrays-strings", title: "Arrays & Strings", summary: "Contiguous memory and the operations it enables.", level: "Beginner", tags: ["linear"], contentReady: ["quick-summary", "detailed-explanation", "diagrams", "interview-qa"], related: ["linked-lists", "stacks-queues", "hash-tables", "time-space-complexity", "memory-allocation"] },
          { slug: "linked-lists", title: "Linked Lists", summary: "Nodes and pointers — flexible sequences.", level: "Beginner", tags: ["linear"], related: ["arrays-strings", "stacks-queues", "binary-trees", "memory-allocation", "garbage-collection"] },
          { slug: "stacks-queues", title: "Stacks & Queues", summary: "LIFO and FIFO access patterns.", level: "Beginner", tags: ["linear"], related: ["arrays-strings", "linked-lists", "heaps", "queues-vs-pubsub", "recursion"] },
        ],
      },
      {
        slug: "hierarchical-structures",
        title: "Trees & Heaps",
        summary: "Hierarchical and priority-ordered data.",
        topics: [
          { slug: "binary-trees", title: "Binary Trees & BSTs", summary: "Hierarchies with ordered search.", level: "Intermediate", tags: ["trees"], related: ["balanced-trees", "heaps", "graphs", "recursion", "indexing"] },
          { slug: "balanced-trees", title: "Balanced Trees (AVL, Red-Black)", summary: "Keeping trees shallow for guaranteed performance.", level: "Advanced", tags: ["trees"], related: ["binary-trees", "heaps", "indexing", "amortized-analysis", "advanced-structures"] },
          { slug: "heaps", title: "Heaps & Priority Queues", summary: "Always-fast access to the min or max.", level: "Intermediate", tags: ["heaps"], related: ["binary-trees", "stacks-queues", "balanced-trees", "time-space-complexity", "cpu-scheduling"] },
          { slug: "tries", title: "Tries", summary: "Prefix trees for strings and autocomplete.", level: "Advanced", tags: ["trees", "strings"], related: ["binary-trees", "hash-tables", "arrays-strings", "inverted-index", "advanced-structures"] },
        ],
      },
      {
        slug: "hashing-and-graphs",
        title: "Hash Tables & Graphs",
        summary: "Near-constant lookup and networked data.",
        topics: [
          { slug: "hash-tables", title: "Hash Tables", summary: "O(1) lookup via hashing, and collision handling.", level: "Intermediate", tags: ["hashing"], related: ["arrays-strings", "binary-trees", "time-space-complexity", "key-value-stores", "amortized-analysis"] },
          { slug: "graphs", title: "Graph Representations", summary: "Adjacency lists, matrices, and when to use each.", level: "Intermediate", tags: ["graphs"], related: ["binary-trees", "graph-theory", "hash-tables", "graph-databases", "advanced-structures"] },
          { slug: "advanced-structures", title: "Advanced Structures (Segment Tree, Fenwick, Disjoint Set)", summary: "Specialized structures for range and connectivity queries.", level: "Advanced Concepts", tags: ["advanced"], related: ["balanced-trees", "graphs", "amortized-analysis", "heaps", "tries"] },
        ],
      },
    ],
  },
  {
    slug: "algorithms",
    title: "Algorithms",
    summary: "Reserved for a full algorithms curriculum — structure coming soon.",
    icon: "⚙️",
    group: "Foundations",
    status: "coming-soon",
    categories: [],
  },
  {
    slug: "operating-systems",
    title: "Operating Systems",
    summary: "How the OS manages processes, memory, and hardware so your programs can run.",
    icon: "🖥️",
    group: "Foundations",
    categories: [
      {
        slug: "processes-and-threads",
        title: "Processes & Threads",
        summary: "The units of execution and how they're scheduled.",
        topics: [
          { slug: "processes-vs-threads", title: "Processes vs Threads", summary: "Isolation vs shared memory, and when to use each.", level: "Beginner", tags: ["os"], contentReady: ["quick-summary", "detailed-explanation", "comparison", "diagrams", "interview-qa"], related: ["cpu-scheduling", "context-switching", "concurrency-vs-parallelism", "threads-vs-async", "memory-allocation"] },
          { slug: "cpu-scheduling", title: "CPU Scheduling", summary: "How the OS decides who runs next.", level: "Intermediate", tags: ["os", "scheduling"], related: ["processes-vs-threads", "context-switching", "deadlocks", "concurrency-vs-parallelism", "locks-and-atomics"] },
          { slug: "context-switching", title: "Context Switching", summary: "Saving and restoring execution state, and its cost.", level: "Intermediate", tags: ["os"], related: ["processes-vs-threads", "cpu-scheduling", "virtual-memory", "latency-throughput", "cpu-architecture"] },
        ],
      },
      {
        slug: "memory-management",
        title: "Memory Management",
        summary: "Virtual memory, paging, and allocation.",
        topics: [
          { slug: "virtual-memory", title: "Virtual Memory & Paging", summary: "Giving every process its own address space.", level: "Intermediate", tags: ["os", "memory"], related: ["memory-allocation", "memory-hierarchy", "processes-vs-threads", "file-systems", "cpu-architecture"] },
          { slug: "memory-allocation", title: "Memory Allocation", summary: "Stack, heap, and how allocators work.", level: "Advanced", tags: ["os", "memory"], related: ["virtual-memory", "garbage-collection", "memory-models", "arrays-strings", "memory-hierarchy"] },
        ],
      },
      {
        slug: "os-concurrency",
        title: "OS Concurrency & Files",
        summary: "Synchronization primitives and persistent storage.",
        topics: [
          { slug: "synchronization-primitives", title: "Locks, Semaphores & Mutexes", summary: "Coordinating access to shared resources.", level: "Advanced", tags: ["os", "concurrency"], related: ["deadlocks", "race-conditions", "locks-and-atomics", "concurrency-vs-parallelism", "processes-vs-threads"] },
          { slug: "deadlocks", title: "Deadlocks", summary: "The four conditions and how to break them.", level: "Advanced", tags: ["os", "concurrency"], related: ["synchronization-primitives", "race-conditions", "locks-and-atomics", "isolation-levels", "distributed-tracing"] },
          { slug: "file-systems", title: "File Systems", summary: "How data is organized and persisted on disk.", level: "Intermediate", tags: ["os", "storage"], related: ["virtual-memory", "linux-filesystem", "key-value-stores", "memory-hierarchy", "replication-partitioning"] },
        ],
      },
    ],
  },
  {
    slug: "computer-networks",
    title: "Computer Networks",
    summary: "How data moves across the internet — the protocols behind every request.",
    icon: "🌐",
    group: "Foundations",
    categories: [
      {
        slug: "network-models",
        title: "Network Models & Layers",
        summary: "The mental model for how networking is layered.",
        topics: [
          { slug: "osi-tcpip-model", title: "OSI & TCP/IP Models", summary: "The layered view of networking.", level: "Beginner", tags: ["networks"], related: ["tcp-udp", "http", "ip-addressing", "dns", "tls-ssl"] },
          { slug: "ip-addressing", title: "IP Addressing & Subnetting", summary: "How machines are addressed and grouped.", level: "Intermediate", tags: ["networks"], related: ["osi-tcpip-model", "dns", "tcp-udp", "k8s-networking", "aws-networking"] },
        ],
      },
      {
        slug: "transport-and-app",
        title: "Transport & Application Protocols",
        summary: "TCP, UDP, HTTP, DNS, and TLS.",
        topics: [
          { slug: "tcp-udp", title: "TCP vs UDP", summary: "Reliable streams vs fast datagrams.", level: "Intermediate", tags: ["networks"], contentReady: ["quick-summary", "comparison", "diagrams", "interview-qa"], related: ["tcp-handshake", "http", "osi-tcpip-model", "tls-ssl", "grpc"] },
          { slug: "tcp-handshake", title: "TCP Three-Way Handshake", summary: "How a connection is established and torn down.", level: "Intermediate", tags: ["networks"], contentReady: ["quick-summary", "animations", "diagrams"], related: ["tcp-udp", "tls-ssl", "http", "latency-throughput", "osi-tcpip-model"] },
          { slug: "http", title: "HTTP & HTTP/2/3", summary: "The protocol of the web and how it evolved.", level: "Intermediate", tags: ["networks", "web"], related: ["tcp-udp", "tls-ssl", "rest", "grpc", "request-lifecycle"] },
          { slug: "dns", title: "DNS", summary: "Turning names into addresses.", level: "Intermediate", tags: ["networks"], related: ["ip-addressing", "http", "osi-tcpip-model", "load-balancing", "request-lifecycle"] },
          { slug: "tls-ssl", title: "TLS / SSL", summary: "Encryption and identity on the wire.", level: "Advanced", tags: ["networks", "security"], related: ["tcp-udp", "http", "crypto-basics", "oauth-oidc", "jwt"] },
        ],
      },
    ],
  },
];
