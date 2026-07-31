import type { TopicContent } from "../types";

export const profiling: TopicContent = {
  quickSummary: [
    "Profiling measures where an application spends CPU time and allocates memory, revealing bottlenecks that are invisible in aggregate metrics.",
    "Flame graphs visualize call stacks as nested rectangles where width represents time spent, making it easy to spot expensive functions at a glance.",
    "Sampling profilers periodically capture stack traces with minimal overhead, while instrumentation profilers hook into every function call for exact counts at higher cost.",
    "Continuous profiling in production (using tools like Pyroscope or Google Cloud Profiler) lets teams find regressions without reproducing issues locally.",
  ],
  detailed: [
    `## Why Profile?

Aggregate metrics (CPU %, memory usage, request latency) tell you *that* something is slow, but not *where* the time goes. Profiling answers the where question by attributing CPU cycles or memory allocations to specific functions and call paths.

Common profiling targets:

- **CPU profiling**: which functions consume the most compute time?
- **Memory (heap) profiling**: which allocations dominate, and which objects are not being garbage-collected?
- **Lock/contention profiling**: which mutexes or synchronization primitives cause threads to wait?
- **I/O profiling**: where is the application blocked on disk or network I/O?

The 80/20 rule applies strongly: a small number of code paths typically account for the vast majority of resource consumption.`,

    `## Sampling vs Instrumentation

| Aspect | Sampling Profiler | Instrumentation Profiler |
|--------|-------------------|--------------------------|
| Mechanism | Periodically interrupts to capture stack trace | Hooks every function entry/exit |
| Overhead | Low (1-5%) | High (10-100x slowdown possible) |
| Accuracy | Statistical — may miss short functions | Exact call counts and timing |
| Production use | Safe with appropriate sample rate | Generally too expensive |
| Examples | Linux perf, async-profiler, py-spy | gprof, Valgrind/Callgrind, cProfile |

**Sampling profilers** are the standard choice for production. They work by interrupting the process at a fixed frequency (e.g., 100 Hz) and recording the call stack. Over enough samples, the most-visited functions emerge statistically.

**Instrumentation profilers** inject hooks at function boundaries, recording exact entry/exit times. They are invaluable for detailed local analysis but typically too slow for production.`,

    `## Flame Graphs

Flame graphs, invented by Brendan Gregg, are the dominant visualization for profiling data:

- **X-axis**: not time — functions are sorted alphabetically to merge identical stacks.
- **Y-axis**: stack depth — bottom is the entry point, top is the leaf function.
- **Width**: proportional to the number of samples (time spent). Wider = more expensive.

Reading a flame graph:

1. Look for **wide plateaus** at the top — these are leaf functions consuming significant CPU.
2. Look for **wide towers** — deep call chains that dominate execution.
3. **Narrow spikes** can usually be ignored; they represent infrequently sampled paths.

**Differential flame graphs** compare two profiles (before/after a change), coloring functions red (slower) or blue (faster), making performance regressions immediately visible.

Tools: \`perf\` + FlameGraph scripts, speedscope.app (web-based viewer), async-profiler (Java), py-spy (Python).`,

    `## Memory Profiling and Heap Analysis

Memory profiling identifies:

- **Allocation hotspots**: which code paths allocate the most objects?
- **Memory leaks**: objects that are reachable but no longer needed.
- **GC pressure**: high allocation rates that force frequent garbage collection pauses.

Techniques:

- **Heap snapshots**: capture all live objects at a point in time. Compare two snapshots to find growing object sets. Chrome DevTools and Eclipse MAT support this.
- **Allocation tracking**: record every allocation with its call stack. High overhead but precise.
- **GC log analysis**: parse garbage collector logs to identify long pauses and promotion rates.

Common culprits: unbounded caches, event listener leaks, large string concatenation in loops, and accidental retention of request-scoped objects beyond their lifecycle.`,

    `## Continuous Profiling in Production

Continuous profiling runs always-on, low-overhead sampling in production and stores profiles over time:

- **Pyroscope**: open-source continuous profiler with a Grafana plugin.
- **Google Cloud Profiler**: SaaS offering integrated with GCP.
- **Datadog Continuous Profiler**: tied to APM traces for profile-to-trace correlation.

Benefits:

- **Find regressions**: compare this week's CPU profile against last week's to see what changed.
- **No reproduction needed**: the data is already collected; no need to set up local load tests.
- **Correlate with traces**: link a slow span to the specific code path consuming CPU during that span.

Best practices:

- Keep sample rate low enough for negligible overhead (typically 100 Hz CPU, 512 KB allocation interval).
- Tag profiles with service version, environment, and instance ID.
- Set up alerts on profile diff: notify when a function's CPU share increases by more than a threshold.`,
  ],
  interviewQA: [
    {
      q: "When would you choose a sampling profiler over an instrumentation profiler?",
      a: "Use a sampling profiler whenever overhead matters, especially in production or under realistic load. Sampling profilers interrupt at a fixed frequency (e.g., 100 Hz) and capture stack traces, introducing only 1-5% overhead. Instrumentation profilers hook every function entry/exit and can slow execution by 10-100x, making them unsuitable for production. Use instrumentation profilers in development for exact call counts when diagnosing a specific function or when you need precise timing for short-lived operations that sampling would miss.",
    },
    {
      q: "How do you read a flame graph to find performance bottlenecks?",
      a: "Look for wide plateaus at the top of the graph — these are leaf functions where CPU time is actually spent. The width represents the proportion of samples, so wider means more expensive. Follow wide columns downward to understand the call chain leading to the bottleneck. Ignore narrow spikes as they represent rarely sampled paths. The x-axis is alphabetical (not temporal), so adjacent frames are not necessarily sequential. For comparing before/after, use differential flame graphs where red indicates slower and blue indicates faster.",
    },
    {
      q: "How would you diagnose a memory leak in a production Java service?",
      a: "First, confirm the leak by monitoring heap usage over time — a sawtooth pattern with rising baseline indicates a leak. Take two heap snapshots separated by time using jmap or async-profiler, then compare them in Eclipse MAT or VisualVM to identify object types whose count or retained size is growing. Look at the GC roots retaining those objects to find the code path preventing collection. Common causes include unbounded caches, static collections that grow without eviction, event listeners not being deregistered, and ThreadLocal values not being cleaned up.",
    },
  ],
  mcqs: [
    {
      q: "What does the width of a box in a flame graph represent?",
      options: [
        "Execution time in milliseconds",
        "Memory allocated by the function",
        "Proportion of profiling samples containing that function",
        "Number of times the function was called",
      ],
      answerIndex: 2,
      explanation:
        "Width in a flame graph is proportional to the number of samples that include that function in their stack trace, representing relative CPU time spent.",
    },
    {
      q: "What is the typical overhead of a sampling profiler in production?",
      options: ["0%", "1-5%", "20-50%", "100x slowdown"],
      answerIndex: 1,
      explanation:
        "Sampling profilers periodically capture stack traces (e.g., 100 times per second) with minimal interruption, typically adding only 1-5% overhead, making them safe for production use.",
    },
    {
      q: "Which technique best identifies memory leaks in a long-running application?",
      options: [
        "CPU flame graph comparison",
        "Comparing heap snapshots taken at different times",
        "Increasing the garbage collector frequency",
        "Adding more RAM to the server",
      ],
      answerIndex: 1,
      explanation:
        "Comparing heap snapshots reveals object types whose count or retained size is growing over time, pointing to objects that are being retained but are no longer needed.",
    },
    {
      q: "What is continuous profiling?",
      options: [
        "Running instrumentation profilers 24/7",
        "Always-on low-overhead sampling in production with historical profile storage",
        "Profiling only during CI/CD pipeline runs",
        "Manually profiling each service once per quarter",
      ],
      answerIndex: 1,
      explanation:
        "Continuous profiling runs low-overhead sampling profilers permanently in production, storing profiles over time so teams can compare, detect regressions, and correlate with traces without reproducing issues.",
    },
  ],
  flashcards: [
    {
      front: "What is the key difference between sampling and instrumentation profilers?",
      back: "Sampling profilers periodically capture stack traces (low overhead, statistical). Instrumentation profilers hook every function entry/exit (exact counts, high overhead).",
    },
    {
      front: "Who invented flame graphs?",
      back: "Brendan Gregg. Flame graphs visualize profiling data with the x-axis sorted alphabetically (not by time) and width proportional to sample count.",
    },
    {
      front: "What does a differential flame graph show?",
      back: "It compares two profiles, coloring functions red (more CPU in the second profile) or blue (less CPU), making performance regressions immediately visible.",
    },
    {
      front: "What are the four main profiling targets?",
      back: "CPU (compute time), Memory/Heap (allocations and leaks), Lock/Contention (synchronization waits), and I/O (disk and network blocking).",
    },
    {
      front: "What is continuous profiling?",
      back: "Always-on, low-overhead sampling in production that stores profiles over time, enabling regression detection and correlation with traces without local reproduction.",
    },
    {
      front: "How do you identify a memory leak from heap snapshots?",
      back: "Take two snapshots separated by time and compare them. Growing object counts or retained sizes indicate leaked objects. Trace their GC roots to find the retaining code path.",
    },
    {
      front: "Name three continuous profiling tools.",
      back: "Pyroscope (open-source), Google Cloud Profiler (GCP SaaS), and Datadog Continuous Profiler (APM-integrated SaaS).",
    },
  ],
  glossary: [
    {
      term: "Flame Graph",
      definition:
        "A visualization of profiling data where each box represents a function in the call stack, with width proportional to time spent and y-axis representing stack depth.",
    },
    {
      term: "Sampling Profiler",
      definition:
        "A profiler that periodically interrupts execution to capture stack traces, providing statistical accuracy with low overhead suitable for production.",
    },
    {
      term: "Instrumentation Profiler",
      definition:
        "A profiler that hooks function entry and exit points to record exact call counts and timing, with high overhead unsuitable for production.",
    },
    {
      term: "Heap Snapshot",
      definition:
        "A point-in-time capture of all live objects in memory, including their types, sizes, and reference chains, used to diagnose memory leaks.",
    },
    {
      term: "Continuous Profiling",
      definition:
        "The practice of running always-on, low-overhead profiling in production and storing profiles historically for regression detection and analysis.",
    },
    {
      term: "GC Pressure",
      definition:
        "The load placed on the garbage collector by high object allocation rates, potentially causing frequent or long GC pauses that degrade application latency.",
    },
    {
      term: "Differential Flame Graph",
      definition:
        "A flame graph that compares two profiles, using color (red/blue) to highlight functions that became slower or faster between the two captures.",
    },
  ],
  deepDive: [
    "**C++ profiling with `perf` and `gprof`** gives developers precise control over performance analysis at the systems level. The Linux `perf` tool is a *sampling profiler* that uses **hardware performance counters** (PMCs) to capture stack traces at configurable frequencies with negligible overhead. Running `perf record -g ./my_program` collects call-graph data, and `perf report` renders an interactive TUI showing the hottest functions sorted by sample count. For *instrumentation-based* profiling, compiling with `g++ -pg` enables **gprof**, which injects code at every function entry/exit to record exact call counts and cumulative time. The resulting `gmon.out` file is analyzed with `gprof ./my_program gmon.out`, producing a *flat profile* (sorted by self-time) and a *call graph* (showing caller-callee relationships). While `gprof` adds 10-30% overhead, it provides **exact call counts** that sampling cannot, making it ideal for development-phase optimization of tight loops and template-heavy code.",
    "**Valgrind's Callgrind and Cachegrind** tools provide *simulation-based* profiling that goes beyond simple timing. Callgrind runs the program on a synthetic CPU, recording every instruction executed and every call transition, producing a complete **call graph with instruction counts**. Unlike timing-based profilers, Callgrind results are *deterministic* — identical across runs — making them ideal for regression testing. The companion tool **KCachegrind** (or QCachegrind) visualizes Callgrind output as interactive call graphs and treemaps. **Cachegrind** simulates the L1/L2/L3 cache hierarchy, reporting *cache miss rates* per function — critical for optimizing data-layout-sensitive C++ code where cache misses dominate runtime. Running `valgrind --tool=cachegrind ./my_program` reveals functions with high *D1 miss rates* (L1 data cache misses) or *LL miss rates* (last-level cache misses), guiding developers toward struct packing, array-of-structs to struct-of-arrays transformations, and loop tiling optimizations.",
    "**Modern C++ profiling strategies** combine multiple tools in a layered approach. Start with `perf stat ./my_program` for a *high-level overview* of IPC (instructions per cycle), cache miss rates, and branch mispredictions. If CPU-bound, use `perf record -g` to identify hot functions, then zoom in with **Cachegrind** to check whether the bottleneck is *compute-bound* or *memory-bound*. For multi-threaded programs, **Intel VTune** or **AMD uProf** provide *threading analysis* showing lock contention, thread imbalance, and NUMA effects. **AddressSanitizer** (`-fsanitize=address`) and **LeakSanitizer** (`-fsanitize=leak`) complement memory profilers by detecting *out-of-bounds accesses* and *memory leaks* at runtime with ~2x overhead. The key principle is to **profile before optimizing** — developers' intuition about bottlenecks is wrong roughly 90% of the time, and profiling data prevents wasted effort on code paths that contribute negligibly to total runtime.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Using perf and gprof for CPU profiling in C++",
      source: `// Compile with gprof instrumentation
// g++ -pg -O2 -o matrix_mul matrix_mul.cpp

#include <vector>
#include <chrono>
#include <iostream>

// Hot function: naive matrix multiplication
void multiply(const std::vector<std::vector<double>>& A,
              const std::vector<std::vector<double>>& B,
              std::vector<std::vector<double>>& C, int N) {
    for (int i = 0; i < N; ++i)
        for (int j = 0; j < N; ++j)
            for (int k = 0; k < N; ++k)
                C[i][j] += A[i][k] * B[k][j]; // cache-unfriendly access on B
}

// Optimized: loop tiling for better cache behavior
void multiply_tiled(const std::vector<std::vector<double>>& A,
                    const std::vector<std::vector<double>>& B,
                    std::vector<std::vector<double>>& C, int N) {
    constexpr int TILE = 32;
    for (int ii = 0; ii < N; ii += TILE)
        for (int jj = 0; jj < N; jj += TILE)
            for (int kk = 0; kk < N; kk += TILE)
                for (int i = ii; i < std::min(ii + TILE, N); ++i)
                    for (int j = jj; j < std::min(jj + TILE, N); ++j)
                        for (int k = kk; k < std::min(kk + TILE, N); ++k)
                            C[i][j] += A[i][k] * B[k][j];
}

// After running: gprof ./matrix_mul gmon.out > profile.txt
// Or with perf: perf record -g ./matrix_mul && perf report`,
    },
    {
      language: "bash",
      caption: "Valgrind Callgrind and Cachegrind workflow",
      source: `# Run Callgrind for instruction-level profiling
valgrind --tool=callgrind --callgrind-out-file=callgrind.out ./my_program

# Analyze with annotation showing per-line instruction counts
callgrind_annotate callgrind.out src/hot_module.cpp

# Visualize with KCachegrind (GUI)
kcachegrind callgrind.out

# Run Cachegrind for cache simulation
valgrind --tool=cachegrind ./my_program
# Output shows per-function: Ir (instructions), D1mr (L1 data read misses),
# DLmr (last-level read misses), Bc (conditional branches), Bcm (mispredicted)

# Compare two Cachegrind runs (before/after optimization)
cg_diff cachegrind.out.old cachegrind.out.new
cg_annotate cachegrind.out.diff`,
    },
    {
      language: "cpp",
      caption: "Programmatic profiling with chrono and custom scoped timer",
      source: `#include <chrono>
#include <iostream>
#include <string>
#include <unordered_map>

// Scoped timer that accumulates per-label timing
struct ScopedTimer {
    using Clock = std::chrono::high_resolution_clock;
    static inline std::unordered_map<std::string, double> totals;

    std::string label;
    Clock::time_point start;

    explicit ScopedTimer(std::string lbl)
        : label(std::move(lbl)), start(Clock::now()) {}

    ~ScopedTimer() {
        auto elapsed = std::chrono::duration<double, std::milli>(
            Clock::now() - start).count();
        totals[label] += elapsed;
    }

    static void report() {
        std::cout << "\\n=== Profile Report ===\\n";
        for (const auto& [name, ms] : totals)
            std::cout << name << ": " << ms << " ms\\n";
    }
};

// Usage in performance-critical code
void process_data(const std::vector<int>& data) {
    {
        ScopedTimer t("sort");
        auto sorted = data;
        std::sort(sorted.begin(), sorted.end());
    }
    {
        ScopedTimer t("search");
        // ... binary search operations
    }
}
// Call ScopedTimer::report() at program exit`,
    },
  ],
  diagrams: [
    {
      title: "Profiling Tool Selection Flowchart",
      kind: "flow",
      caption: "Decision tree for choosing the right C++ profiling tool based on the problem type",
      mermaid: `flowchart TD
    Start["**Performance Issue Detected**"] --> Q1{"What type\\nof bottleneck?"}
    Q1 -->|CPU-bound| Q2{"Production or\\nDevelopment?"}
    Q1 -->|Memory leak| Leak["**AddressSanitizer**\\n+ **LeakSanitizer**\\n\`-fsanitize=address,leak\`"]
    Q1 -->|Cache misses| Cache["**Cachegrind**\\n\`valgrind --tool=cachegrind\`"]
    Q1 -->|Thread contention| Thread["**Intel VTune**\\nor **perf lock**"]
    Q2 -->|Production| Sampling["**perf record -g**\\n*sampling, ~2% overhead*"]
    Q2 -->|Development| Q3{"Need exact\\ncall counts?"}
    Q3 -->|Yes| Instr["**gprof** or **Callgrind**\\n*instrumentation-based*"]
    Q3 -->|No| Sampling
    style Start fill:#e3f2fd,stroke:#1565c0
    style Sampling fill:#c8e6c9,stroke:#2e7d32
    style Instr fill:#fff9c4,stroke:#f9a825
    style Leak fill:#ffcdd2,stroke:#c62828
    style Cache fill:#e1bee7,stroke:#7b1fa2
    style Thread fill:#ffe0b2,stroke:#ef6c00`,
    },
    {
      title: "Flame Graph Anatomy",
      kind: "architecture",
      caption: "How to read a flame graph: width equals time, height equals stack depth",
      mermaid: `flowchart TB
    subgraph FlameGraph["**Flame Graph Structure**"]
        direction TB
        Main["main() — 100% width"] --> ProcessReq["process_request() — 80%"]
        Main --> Init["init() — 20%"]
        ProcessReq --> ParseJSON["parse_json() — 45%"]
        ProcessReq --> DBQuery["db_query() — 35%"]
        ParseJSON --> Alloc["allocate() — 30%\\n*WIDE PLATEAU = bottleneck*"]
        DBQuery --> NetIO["network_io() — 25%"]
        DBQuery --> Serialize["serialize() — 10%"]
    end
    style Alloc fill:#ff8a80,stroke:#d32f2f
    style NetIO fill:#ffab91,stroke:#e64a19
    style Main fill:#bbdefb,stroke:#1565c0
    style ProcessReq fill:#c8e6c9,stroke:#388e3c`,
    },
    {
      title: "Profiling Workflow Pipeline",
      kind: "sequence",
      caption: "End-to-end profiling workflow from detection to verification",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant Perf as perf / gprof
    participant Viz as FlameGraph / KCachegrind
    participant Code as Source Code
    Dev->>Perf: perf stat ./program (overview)
    Perf-->>Dev: IPC, cache misses, branch mispredictions
    Dev->>Perf: perf record -g ./program (detailed)
    Perf-->>Viz: Generate flame graph
    Viz-->>Dev: Identify wide plateaus (hot functions)
    Dev->>Code: Optimize hot path
    Dev->>Perf: Re-profile with perf stat
    Perf-->>Dev: Compare metrics (before vs after)
    Note over Dev,Perf: Repeat until target met`,
    },
  ],
  comparison: {
    columns: ["Tool", "**Type**", "**Overhead**", "**Best For**", "**Output**"],
    rows: [
      ["`perf`", "*Sampling*", "~1-5%", "**Production** CPU profiling", "Flame graphs, `perf report`"],
      ["`gprof`", "*Instrumentation*", "~10-30%", "**Development** exact call counts", "Flat profile + call graph"],
      ["`Callgrind`", "*Simulation*", "~20-50x", "**Deterministic** instruction counts", "KCachegrind visualization"],
      ["`Cachegrind`", "*Simulation*", "~20-50x", "**Cache miss** analysis", "Per-function cache stats"],
      ["`AddressSanitizer`", "*Instrumentation*", "~2x", "**Memory errors** and leaks", "Runtime error reports"],
      ["`Intel VTune`", "*Sampling + HW*", "~2-5%", "**Threading** and microarchitecture", "Rich GUI analysis"],
    ],
  },
  exercises: [
    "**gprof basics**: Write a C++ program with two functions — one doing matrix multiplication, one doing vector sorting. Compile with `-pg`, run it, and analyze `gmon.out` with `gprof`. Identify which function takes more *self-time* vs *cumulative time*.",
    "**Flame graph generation**: Use `perf record -g` to profile a C++ program, then generate a flame graph using Brendan Gregg's `FlameGraph` scripts (`stackcollapse-perf.pl` and `flamegraph.pl`). Identify the widest *plateau* and explain why it is the bottleneck.",
    "**Cache optimization**: Write a naive matrix transpose in C++, profile it with `valgrind --tool=cachegrind`, note the L1 miss rate, then rewrite with *loop tiling* and compare the cache miss rates before and after.",
    "**Differential profiling**: Profile the same C++ program with two different algorithm implementations (e.g., `std::sort` vs a hand-written quicksort). Generate a *differential flame graph* and explain the color-coded differences.",
    "**Scoped timer instrumentation**: Implement the `ScopedTimer` class shown in the code section. Add it to a multi-function program, collect timing data, and compare the results with `perf report` output to validate accuracy.",
  ],
  cheatSheet: [
    "`perf stat ./program` — quick **overview**: IPC, cache misses, branch mispredictions, context switches",
    "`perf record -g ./program` + `perf report` — **sampling** profiler with call-graph; use `-F 99` to set sample frequency",
    "`g++ -pg -O2 file.cpp` + `gprof ./a.out gmon.out` — **gprof** instrumentation for exact call counts and timing",
    "`valgrind --tool=callgrind ./program` + `kcachegrind callgrind.out` — **Callgrind** for deterministic instruction-level profiling",
    "`valgrind --tool=cachegrind ./program` — **Cachegrind** for L1/L2/LL cache miss analysis per function",
    "`g++ -fsanitize=address,leak -g file.cpp` — **ASan + LSan** for memory error and leak detection at ~2x overhead",
  ],
  revisionNotes: [
    "**Two profiler families**: *Sampling* (perf, py-spy) captures periodic stack snapshots with low overhead (~1-5%), suitable for production. *Instrumentation* (gprof, Callgrind) hooks every function call for exact counts but adds 10-100x overhead.",
    "**Flame graphs**: width = proportion of samples (*not* wall time), y-axis = stack depth. Look for **wide plateaus** at the top (leaf functions burning CPU). X-axis is *alphabetical*, not temporal.",
    "**Cache profiling** with Cachegrind reveals whether a bottleneck is *compute-bound* or *memory-bound*. High D1 miss rates suggest poor data locality; fix with struct packing, SoA layouts, or loop tiling.",
    "**Always profile before optimizing** — developer intuition about hot paths is wrong ~90% of the time. Use `perf stat` for a 10-second overview before deep-diving with detailed tools.",
    "**Continuous profiling** (Pyroscope, Cloud Profiler) runs always-on sampling in production, enabling *regression detection* by comparing profiles across deployments without reproducing issues locally.",
  ],
};
