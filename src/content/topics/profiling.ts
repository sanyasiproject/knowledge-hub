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
};
