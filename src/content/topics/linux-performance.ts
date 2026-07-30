import type { TopicContent } from "../types";

export const linuxPerformance: TopicContent = {
  quickSummary: [
    "Load average (shown by uptime and top) represents the average number of processes in the run queue or waiting for I/O over 1, 5, and 15 minutes — compare it to the number of CPU cores to assess saturation.",
    "The USE method (Utilization, Saturation, Errors) provides a systematic checklist for each resource (CPU, memory, disk, network) to quickly identify bottlenecks.",
    "top/htop show real-time process-level CPU and memory usage; vmstat and iostat provide system-level summaries of CPU scheduling, memory paging, and disk I/O throughput.",
    "strace traces system calls made by a process, revealing what a program asks the kernel to do; perf profiles CPU cycles, cache misses, and function-level hotspots using hardware performance counters.",
  ],
  detailed: [
    "## Load Average and CPU Metrics\n\nLoad average (displayed by `uptime`, `top`, `/proc/loadavg`) is the exponentially decayed moving average of the number of processes in the runnable (R) or uninterruptible sleep (D) state. On a 4-core system, a load of 4.0 means CPUs are fully utilized; above 4.0 means processes are queuing. Note: Linux includes D-state processes (waiting for I/O) in load average, unlike other Unixes, so high load may indicate I/O saturation rather than CPU saturation. Use `mpstat -P ALL 1` to see per-core utilization and distinguish CPU-bound from I/O-bound load.",
    "## top and htop\n\n`top` provides a real-time view of system resource usage and per-process statistics. Key metrics: %CPU (percentage of a single core), %MEM (resident memory fraction), VIRT (virtual memory), RES (resident/physical memory), SHR (shared memory). Press `1` to toggle per-core CPU view, `M` to sort by memory, `P` by CPU.\n\n`htop` is an enhanced interactive version with color-coded CPU/memory bars, tree view (F5), process filtering (F4), and mouse support. It reads from /proc like top but presents the data more intuitively. Both tools are essential for quick triage of what is consuming resources.",
    "## vmstat, iostat, and mpstat\n\n`vmstat 1` prints system-wide stats every second:\n- **r** — processes in run queue (CPU demand)\n- **b** — processes in uninterruptible sleep (I/O wait)\n- **si/so** — swap in/out (if nonzero, memory is under pressure)\n- **us/sy/id/wa** — user/system/idle/I/O wait CPU percentages\n\n`iostat -xz 1` shows per-device I/O stats:\n- **r/s, w/s** — reads/writes per second\n- **await** — average I/O latency in ms\n- **%util** — percentage of time device was busy (100% means saturated for single-queue devices)\n\n`mpstat -P ALL 1` shows per-CPU utilization, helping identify imbalanced workloads or single-threaded bottlenecks.",
    "## strace and ltrace\n\n`strace -p <pid>` attaches to a running process and prints every system call with arguments and return values. `strace -c -p <pid>` accumulates a summary of call counts and time spent. Common use cases: diagnosing why a program hangs (stuck in a read/poll), finding which config files a program opens, debugging permission errors (EACCES), and tracing network connections.\n\n`strace -e trace=open,read,write` filters to specific syscalls. `strace -f` follows child processes. Performance impact is significant (10-100x slowdown) because every syscall traps to the tracer, so use it for debugging, not production monitoring.\n\n`ltrace` is similar but traces library calls (malloc, printf) instead of system calls.",
    "## perf: Hardware Performance Counters\n\n`perf` is the standard Linux profiler, leveraging CPU hardware counters:\n- `perf stat <command>` — summary of cycles, instructions, cache misses, branch mispredictions\n- `perf record -g <command>` — sample stack traces for CPU profiling\n- `perf report` — interactive viewer for recorded profiles, showing hotspot functions\n- `perf top` — real-time function-level CPU profiling (like top but for functions)\n\nperf can also trace kernel events, schedule latency, and off-CPU time. Flame graphs (generated from `perf script` output using Brendan Gregg's tools) visualize call stacks hierarchically, making it easy to spot which code paths consume the most CPU cycles.",
    "## The USE Method\n\nDeveloped by Brendan Gregg, the USE method systematically checks each physical resource for:\n- **Utilization** — percentage of time the resource is busy (e.g., CPU %busy, disk %util)\n- **Saturation** — degree of queued work beyond capacity (e.g., run queue length, swap usage)\n- **Errors** — error events (e.g., network interface errors, disk I/O errors)\n\nApply USE to each resource: CPUs, memory, storage devices, network interfaces, and buses. This checklist approach ensures no resource is overlooked. Complement USE with the RED method for services: Rate (requests/sec), Errors (failed requests), Duration (latency). USE finds hardware bottlenecks; RED finds application-level issues.",
  ],
  interviewQA: [
    {
      q: "A server's load average is 8.0 on a 4-core machine. Is there a problem, and how do you investigate?",
      a: "A load of 8.0 on 4 cores means roughly twice as many processes want to run as there are cores — processes are queuing. But Linux includes I/O-waiting (D state) processes in load average, so check: (1) mpstat -P ALL 1 to see if CPUs are actually busy or mostly in iowait, (2) vmstat 1 to check the 'b' column for blocked processes and wa% for I/O wait, (3) iostat -xz 1 to check disk saturation. If CPUs are saturated, find the offending process with top sorted by CPU. If it is I/O wait, investigate disk performance or NFS issues.",
      followUps: [
        "What is the difference between load average on Linux vs other Unixes?",
        "How would you distinguish CPU saturation from disk saturation?",
      ],
    },
    {
      q: "When would you use strace vs perf for debugging a slow application?",
      a: "Use strace when you suspect the slowness is due to system calls — excessive file opens, slow network reads, permission checks, or the process blocking on I/O. strace shows exactly what the program asks the kernel to do. Use perf when the application is CPU-bound and you need to find which functions or code paths consume the most cycles. perf uses hardware counters with low overhead for sampling, while strace intercepts every syscall with significant overhead. In practice, start with perf stat to see if the program is CPU-bound or stalled, then choose the appropriate tool.",
      followUps: [
        "What is the overhead of strace in production?",
        "How do you generate flame graphs from perf output?",
      ],
    },
    {
      q: "Explain the USE method and how you would apply it to diagnose a slow database server.",
      a: "The USE method checks Utilization, Saturation, and Errors for each resource. For a slow database: CPU — check utilization (mpstat) and saturation (run queue via vmstat r column). Memory — check utilization (free -m), saturation (swap activity via vmstat si/so), errors (dmesg for OOM kills). Disk — check utilization (iostat %util), saturation (iostat avgqu-sz for queue depth), errors (dmesg for I/O errors). Network — check utilization (sar -n DEV), saturation (dropped packets via netstat -s), errors (ifconfig error counters). This systematic approach prevents guessing and ensures you find the actual bottleneck.",
    },
    {
      q: "What does high iowait in top/vmstat indicate, and how do you drill down?",
      a: "iowait (%wa) represents CPU time spent idle while waiting for I/O to complete. High iowait means the CPU has work to do but is blocked on disk or network I/O. To drill down: (1) iostat -xz 1 to identify which device has high await (latency) or %util, (2) iotop to find which process generates the most I/O, (3) check if the I/O pattern is random or sequential (random I/O is much slower on spinning disks), (4) look for swap activity (vmstat si/so) which indicates memory pressure causing disk thrashing.",
    },
  ],
  mcqs: [
    {
      q: "What does a load average of 2.0 mean on a single-core system?",
      options: [
        "The CPU is 50% utilized",
        "Two processes are running simultaneously",
        "On average, one process is running and one is waiting for the CPU",
        "The system has 2 GB of memory in use",
      ],
      answerIndex: 2,
      explanation:
        "On a single-core system, a load of 1.0 means the CPU is exactly fully utilized. A load of 2.0 means one process runs while one waits — the system is overloaded by a factor of 2.",
    },
    {
      q: "Which tool would you use to identify which disk is the I/O bottleneck?",
      options: ["top", "strace", "iostat -xz", "perf stat"],
      answerIndex: 2,
      explanation:
        "iostat -xz shows per-device I/O statistics including await (latency), %util (utilization), and r/s, w/s (throughput), directly identifying the bottleneck device.",
    },
    {
      q: "In vmstat output, what does a high value in the 'si' and 'so' columns indicate?",
      options: [
        "High CPU system time",
        "Significant swap-in and swap-out activity indicating memory pressure",
        "High disk sequential I/O",
        "Network socket input/output",
      ],
      answerIndex: 1,
      explanation:
        "si (swap in) and so (swap out) measure pages moved between RAM and swap space. High values indicate the system is running low on physical memory and actively swapping.",
    },
    {
      q: "What does the USE acronym stand for?",
      options: [
        "User, System, Error",
        "Utilization, Saturation, Errors",
        "Uptime, Speed, Efficiency",
        "Unix System Evaluation",
      ],
      answerIndex: 1,
      explanation:
        "The USE method by Brendan Gregg checks Utilization (% busy), Saturation (queue depth), and Errors for each system resource to systematically find bottlenecks.",
    },
    {
      q: "What is the primary advantage of perf over strace for CPU profiling?",
      options: [
        "perf can trace system calls",
        "perf uses hardware counters with low overhead via sampling",
        "perf shows file descriptors",
        "perf works without root access",
      ],
      answerIndex: 1,
      explanation:
        "perf leverages CPU hardware performance counters and uses statistical sampling, resulting in very low overhead (typically <5%) compared to strace which intercepts every syscall (10-100x slowdown).",
    },
  ],
  flashcards: [
    {
      front: "What do the three load average numbers represent?",
      back: "Average number of runnable + uninterruptible processes over the last 1, 5, and 15 minutes. Compare to core count: load/cores > 1 means queuing.",
    },
    {
      front: "What does vmstat's 'r' column show?",
      back: "The number of processes in the run queue waiting for CPU time. A consistently high value relative to core count indicates CPU saturation.",
    },
    {
      front: "How do you see per-core CPU utilization?",
      back: "mpstat -P ALL 1 — shows utilization breakdown (user, system, iowait, idle) for each individual CPU core every second.",
    },
    {
      front: "What is a flame graph?",
      back: "A visualization of profiled stack traces where the x-axis spans all samples and the y-axis shows call depth. Width represents time spent — wide bars are hotspots. Generated from perf script output.",
    },
    {
      front: "What does iotop show?",
      back: "Per-process I/O usage in real time — similar to top but for disk reads and writes. Useful for finding which process is causing high I/O load.",
    },
    {
      front: "What is the RED method?",
      back: "A monitoring methodology for services: Rate (requests/sec), Errors (failed requests/sec), Duration (latency distribution). Complements USE which focuses on infrastructure resources.",
    },
    {
      front: "What does strace -c produce?",
      back: "A summary table of all system calls made by a process: call name, count, total time, errors. Useful for quickly identifying which syscall category dominates.",
    },
    {
      front: "What does dmesg show?",
      back: "The kernel ring buffer — hardware errors, OOM killer events, filesystem errors, device driver messages. Check with dmesg -T for human-readable timestamps.",
    },
  ],
  glossary: [
    {
      term: "Load average",
      definition:
        "The exponentially decayed moving average of the number of runnable and uninterruptible processes, reported over 1, 5, and 15 minute intervals.",
    },
    {
      term: "iowait",
      definition:
        "The percentage of CPU time spent idle while the system has outstanding disk I/O requests. Indicates potential disk bottlenecks.",
    },
    {
      term: "USE method",
      definition:
        "A performance analysis methodology checking Utilization, Saturation, and Errors for each system resource (CPU, memory, disk, network).",
    },
    {
      term: "strace",
      definition:
        "A diagnostic tool that intercepts and records system calls made by a process, showing arguments and return values.",
    },
    {
      term: "perf",
      definition:
        "The Linux profiling tool that uses hardware performance counters to sample CPU activity, cache behavior, and branch predictions with low overhead.",
    },
    {
      term: "flame graph",
      definition:
        "A visualization of sampled stack traces where function call width represents cumulative CPU time, enabling quick identification of performance hotspots.",
    },
    {
      term: "vmstat",
      definition:
        "Virtual memory statistics tool reporting system-wide CPU, memory, swap, and I/O activity at configurable intervals.",
    },
    {
      term: "OOM killer",
      definition:
        "The kernel's out-of-memory killer that selects and terminates processes when physical memory and swap are exhausted, based on an oom_score heuristic.",
    },
  ],
};
