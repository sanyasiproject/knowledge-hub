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
  followUps: [
    "A server is slow — what are the first four commands you run?",
    "What does high load average with low CPU usage tell you?",
    "How do you tell whether you're I/O-bound or CPU-bound?",
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
  deepDive: [
    "## Understanding CPU Scheduling and Latency\n\nPerformance analysis begins with understanding *where* time is spent. A process can consume CPU time in **user mode** (`%us` -- executing application code), **system mode** (`%sy` -- executing kernel code on behalf of the process), or be idle waiting for **I/O** (`%wa` -- CPU is idle but the process is blocked on disk/network). The `mpstat -P ALL 1` command reveals per-core breakdowns, which is critical for diagnosing *single-threaded bottlenecks* that saturate one core while others sit idle. The **CFS scheduler** introduces *scheduling latency* -- the delay between a process becoming runnable and actually getting CPU time. Under heavy load, this latency increases as more tasks compete. `perf sched latency` measures this directly. For latency-sensitive workloads like databases, **CPU pinning** (`taskset -c 0,1 cmd`) and **isolcpus** (kernel parameter to reserve cores) can dramatically reduce jitter by eliminating context-switch overhead. The `turbostat` tool monitors CPU frequency scaling, which affects throughput when **governors** like `ondemand` reduce clock speed during low utilization periods.",

    "## Memory Performance: Page Cache, Swap, and the OOM Killer\n\nLinux aggressively uses free RAM as a **page cache** to buffer file I/O -- this is why `free -m` shows very little \"free\" memory on a healthy system. The `available` column (added in kernel 3.14) shows memory that *can be reclaimed* under pressure, which is the correct metric for capacity planning. When physical memory runs low, the kernel's **kswapd** daemon starts reclaiming pages by evicting clean page cache entries and swapping out *anonymous pages* (heap, stack) to the swap device. The `vmstat 1` columns `si`/`so` (swap in/out) directly indicate this pressure. Excessive swapping causes **thrashing** -- the system spends more time moving pages than doing useful work. The **OOM killer** (`/proc/sys/vm/oom_kill`) is the last resort: it selects a process to terminate based on `oom_score` (influenced by memory usage and `oom_score_adj`). Tuning `vm.swappiness` (0-200, default 60) controls how aggressively the kernel swaps: lower values prefer evicting page cache, higher values prefer swapping anonymous pages. For database servers, setting `vm.swappiness=1` and using **huge pages** (`vm.nr_hugepages`) can reduce TLB misses and improve memory access latency by *orders of magnitude*.",

    "## eBPF and Modern Observability\n\n**eBPF** (extended Berkeley Packet Filter) has revolutionized Linux performance analysis by allowing *safe, sandboxed programs* to run inside the kernel without modifying kernel code or loading kernel modules. Tools built on eBPF -- packaged in **BCC** (BPF Compiler Collection) and **bpftrace** -- can instrument virtually any kernel or user-space function with negligible overhead. Key eBPF-based tools include: `execsnoop` (traces all new process executions), `opensnoop` (traces file opens), `biolatency` (histograms of block I/O latency), `tcplife` (traces TCP connection lifetimes with throughput), `runqlat` (measures CPU scheduler run-queue latency), and `funccount` (counts function calls per second). Unlike `strace`, which intercepts syscalls via `ptrace` with *10-100x overhead*, eBPF hooks directly into kernel tracepoints or kprobes with overhead typically under **1%**. The `bpftrace` one-liner language enables ad-hoc analysis: `bpftrace -e 'tracepoint:syscalls:sys_enter_read { @[comm] = count(); }'` counts read syscalls by process name in real time. For production observability at scale, eBPF powers tools like **Cilium** (networking), **Falco** (security), and **Pixie** (application monitoring) -- making it the *most important* advancement in Linux performance tooling since `perf`."
  ],
  code: [
    {
      language: "bash",
      caption: "Comprehensive system performance triage workflow",
      source: `# === Step 1: Quick system overview ===
uptime                    # load averages (1, 5, 15 min)
free -m                   # memory: total, used, free, available
df -hT                    # disk space by filesystem

# === Step 2: CPU analysis ===
mpstat -P ALL 1 5         # per-core utilization (5 samples)
# Look for: one core at 100% (single-threaded bottleneck)
#           high %sys (kernel overhead)
#           high %iowait (disk bottleneck masquerading as CPU)

# === Step 3: Memory pressure ===
vmstat 1 5                # r=runqueue, si/so=swap activity
# si/so > 0 means active swapping = memory pressure
cat /proc/meminfo | grep -E 'MemAvailable|SwapFree|Dirty|Writeback'

# === Step 4: Disk I/O ===
iostat -xz 1 5            # per-device: await, %util, r/s, w/s
# await > 10ms on SSD = problem; %util near 100% = saturated
iotop -ao                 # accumulated I/O per process

# === Step 5: Network ===
sar -n DEV 1 5            # per-interface throughput
ss -tunapO                # active TCP/UDP connections with PIDs

# === Step 6: Process-level drill-down ===
pidstat -u -d -r 1 5      # per-process CPU, disk, memory stats
# Find the culprit process, then:
strace -cp <pid> -e trace=read,write   # syscall summary
perf top -p <pid>                       # live function profiling`
    },
    {
      language: "cpp",
      caption: "C++ system calls for performance measurement: clock_gettime, getrusage, mmap",
      source: `#include <sys/resource.h>
#include <sys/mman.h>
#include <time.h>
#include <iostream>
#include <cstring>

// High-resolution timing using clock_gettime()
double measure_elapsed() {
    struct timespec start, end;

    clock_gettime(CLOCK_MONOTONIC, &start);

    // --- Work to measure ---
    volatile long sum = 0;
    for (long i = 0; i < 100000000L; ++i) sum += i;

    clock_gettime(CLOCK_MONOTONIC, &end);

    double elapsed = (end.tv_sec - start.tv_sec)
                   + (end.tv_nsec - start.tv_nsec) / 1e9;
    std::cout << "Elapsed: " << elapsed << " seconds\\n";
    return elapsed;
}

// Query process resource usage via getrusage()
void print_resource_usage() {
    struct rusage usage;
    getrusage(RUSAGE_SELF, &usage);

    std::cout << "User CPU time:   " << usage.ru_utime.tv_sec
              << "." << usage.ru_utime.tv_usec << "s\\n"
              << "System CPU time: " << usage.ru_stime.tv_sec
              << "." << usage.ru_stime.tv_usec << "s\\n"
              << "Max RSS:         " << usage.ru_maxrss << " KB\\n"
              << "Page faults (minor): " << usage.ru_minflt << "\\n"
              << "Page faults (major): " << usage.ru_majflt << "\\n"
              << "Context switches (vol):   " << usage.ru_nvcsw << "\\n"
              << "Context switches (invol): " << usage.ru_nivcsw << "\\n";
}

// Memory-mapped file I/O for high-performance reads
void mmap_file_read(const char* path) {
    FILE* f = fopen(path, "r");
    if (!f) { perror("fopen"); return; }
    fseek(f, 0, SEEK_END);
    size_t size = ftell(f);
    fclose(f);

    int fd = open(path, O_RDONLY);
    void* addr = mmap(nullptr, size, PROT_READ,
                      MAP_PRIVATE, fd, 0);
    if (addr == MAP_FAILED) { perror("mmap"); return; }

    // Advise kernel on access pattern
    madvise(addr, size, MADV_SEQUENTIAL);

    // Process the mapped data (zero-copy)
    const char* data = static_cast<const char*>(addr);
    size_t newlines = 0;
    for (size_t i = 0; i < size; ++i)
        if (data[i] == '\\n') ++newlines;

    std::cout << "Lines: " << newlines << "\\n";

    munmap(addr, size);
    close(fd);
}

int main() {
    measure_elapsed();
    print_resource_usage();
    mmap_file_read("/var/log/syslog");
    return 0;
}`
    },
    {
      language: "bash",
      caption: "eBPF and perf profiling for production analysis",
      source: `# === perf CPU profiling workflow ===
# Record CPU profile with call graphs for 30 seconds
sudo perf record -g -p $(pgrep myapp) -- sleep 30
sudo perf report --stdio         # text report of hotspots
sudo perf report                 # interactive TUI

# Generate a flame graph
sudo perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg

# Quick stats: cycles, instructions, cache misses
sudo perf stat -d -p $(pgrep myapp) -- sleep 10

# === eBPF/BCC tools ===
# Trace all new process executions system-wide
sudo execsnoop-bpfcc

# Histogram of block I/O latency
sudo biolatency-bpfcc -D 10      # 10-second summary by disk

# Trace file opens with latency
sudo opensnoop-bpfcc -d 5        # 5-second trace

# CPU run-queue latency histogram
sudo runqlat-bpfcc 10 1          # 10-second summary

# === bpftrace one-liners ===
# Count syscalls by process
sudo bpftrace -e 'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }'

# Trace read() latency by process
sudo bpftrace -e '
  tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
  tracepoint:syscalls:sys_exit_read /@start[tid]/ {
    @us[comm] = hist((nsecs - @start[tid]) / 1000);
    delete(@start[tid]);
  }'`
    }
  ],
  diagrams: [
    {
      title: "USE Method Diagnostic Flowchart",
      kind: "flow",
      caption: "Systematic approach to diagnosing performance bottlenecks using the USE method across all resources",
      mermaid: `flowchart TD
    START["Performance Issue Detected"] --> CPU_CHECK{"CPU"}
    CPU_CHECK --> CPU_U["Utilization<br/>mpstat -P ALL 1"]
    CPU_CHECK --> CPU_S["Saturation<br/>vmstat r column"]
    CPU_CHECK --> CPU_E["Errors<br/>perf stat"]

    START --> MEM_CHECK{"Memory"}
    MEM_CHECK --> MEM_U["Utilization<br/>free -m, available"]
    MEM_CHECK --> MEM_S["Saturation<br/>vmstat si/so, swap"]
    MEM_CHECK --> MEM_E["Errors<br/>dmesg OOM kills"]

    START --> DISK_CHECK{"Disk I/O"}
    DISK_CHECK --> DISK_U["Utilization<br/>iostat %util"]
    DISK_CHECK --> DISK_S["Saturation<br/>iostat avgqu-sz"]
    DISK_CHECK --> DISK_E["Errors<br/>dmesg I/O errors"]

    START --> NET_CHECK{"Network"}
    NET_CHECK --> NET_U["Utilization<br/>sar -n DEV"]
    NET_CHECK --> NET_S["Saturation<br/>netstat -s drops"]
    NET_CHECK --> NET_E["Errors<br/>ifconfig errors"]

    CPU_U --> RESULT["Identify Bottleneck"]
    CPU_S --> RESULT
    MEM_U --> RESULT
    MEM_S --> RESULT
    DISK_U --> RESULT
    DISK_S --> RESULT
    NET_U --> RESULT`
    },
    {
      title: "Linux Performance Tool Landscape",
      kind: "mindmap",
      caption: "Overview of Linux performance tools organized by the resource they observe",
      mermaid: `mindmap
  root["Linux Performance Tools"]
    CPU
      top / htop
      mpstat
      perf stat / record
      turbostat
      pidstat -u
    Memory
      free -m
      vmstat
      slabtop
      pmap
      valgrind
    Disk I/O
      iostat -xz
      iotop
      blktrace
      biolatency
      fio
    Network
      sar -n DEV
      ss / netstat
      tcpdump
      iperf3
      tcplife
    Tracing
      strace
      perf trace
      bpftrace
      ftrace
      execsnoop
    Profiling
      perf record
      flame graphs
      cachegrind
      gprof
      oprofile`
    },
    {
      title: "Performance Triage Sequence",
      kind: "sequence",
      caption: "Step-by-step diagnostic workflow from symptom detection to root cause identification",
      mermaid: `sequenceDiagram
    participant Eng as Engineer
    participant SYS as System Overview
    participant CPU as CPU Analysis
    participant MEM as Memory Analysis
    participant IO as Disk I/O Analysis
    participant PROC as Process Drill-down

    Eng->>SYS: uptime, free -m, df -h
    SYS-->>Eng: Load=12.0 (4 cores), Swap active

    Eng->>CPU: mpstat -P ALL 1
    CPU-->>Eng: Core 0 at 98%, others idle

    Eng->>MEM: vmstat 1 (si/so columns)
    MEM-->>Eng: so=5000 KB/s (swapping out)

    Eng->>IO: iostat -xz 1
    IO-->>Eng: sda await=85ms, %util=99%

    Eng->>PROC: pidstat -u -d -r 1
    PROC-->>Eng: PID 3456 (java) 95% CPU, 4GB RSS

    Note over Eng: Root cause: Java process<br/>with memory leak causing<br/>swap thrashing and disk saturation`
    }
  ],
  animations: [
    {
      title: "A first-60-seconds triage",
      steps: [
        {
          label: "`uptime`",
          detail: "Load average. High load with low CPU means blocking on I/O or locks.",
        },
        {
          label: "`vmstat 1`",
          detail: "Run queue, blocked processes, swap activity. Any swapping is a red flag.",
        },
        {
          label: "`top` / `htop`",
          detail: "Which process, and whether it's user or system CPU.",
        },
        {
          label: "`iostat -xz 1`",
          detail: "Device utilisation and await. High await means the disk is the bottleneck.",
        },
        {
          label: "`ss -s` and `sar -n DEV`",
          detail: "Connection counts and network throughput.",
        },
        {
          label: "Narrowed",
          detail: "You now know whether it's CPU, memory, disk, or network before changing anything.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Tool", "What It Measures", "Overhead", "Best For", "Key Flags"],
    rows: [
      ["`top` / `htop`", "Per-process CPU, memory, state", "**Low** (~1%)", "Quick interactive triage", "`1` per-core, `M` mem sort, `P` CPU sort"],
      ["`vmstat`", "System-wide CPU, memory, swap, I/O", "**Negligible**", "Detecting swap pressure and CPU saturation", "`vmstat 1` for per-second sampling"],
      ["`iostat`", "Per-device disk I/O throughput and latency", "**Negligible**", "Identifying I/O bottleneck device", "`-xz 1` for extended stats, active devices"],
      ["`mpstat`", "Per-CPU core utilization breakdown", "**Negligible**", "Finding single-threaded bottlenecks", "`-P ALL 1` for all cores per second"],
      ["`strace`", "System calls made by a process", "**Very high** (10-100x)", "Debugging hangs, permission errors, file access", "`-c` summary, `-e trace=` filter, `-f` follow forks"],
      ["`perf`", "CPU cycles, cache misses, function hotspots", "**Very low** (<5%)", "CPU profiling, flame graph generation", "`record -g`, `stat -d`, `top -p`"],
      ["`sar`", "Historical CPU, memory, network, disk stats", "**Negligible**", "Trend analysis over hours/days", "`-n DEV` network, `-r` memory, `-u` CPU"],
      ["`bpftrace`", "Kernel/user tracepoints, kprobes, uprobes", "**Very low** (<1%)", "Custom production tracing", "One-liner and script modes"]
    ]
  },
  exercises: [
    "**Full USE Audit**: Run `mpstat`, `vmstat`, `iostat`, `sar -n DEV`, and `dmesg` on a running server. For each resource (CPU, memory, disk, network), document the **utilization**, **saturation**, and **error** metrics. Identify which resource, if any, is the bottleneck. Write a one-paragraph diagnosis.",
    "**Flame Graph Workshop**: Run a CPU-intensive workload (e.g., `stress-ng --cpu 4 --timeout 30s`). Use `perf record -g -a -- sleep 10` to capture a profile. Generate a flame graph with `perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg`. Open the SVG and identify the hottest code path. Explain what the *x-axis width* represents.",
    "**Swap Pressure Simulation**: On a test VM, allocate memory with `stress-ng --vm 2 --vm-bytes 80%` while monitoring with `vmstat 1`. Observe the `si`/`so` columns, `free` changes, and `wa%` increase. Set `vm.swappiness=1` and repeat -- document how behavior changes. Check `dmesg` for OOM killer activity.",
    "**strace vs perf Comparison**: Write a Python script that reads a large file line-by-line. Profile it with both `strace -c` (syscall summary) and `perf stat -d` (hardware counters). Compare the overhead by timing the profiled vs. unprofiled runs. Explain when you would choose each tool.",
    "**eBPF Live Tracing**: Install `bcc-tools` and run `execsnoop` while performing normal system activity (opening terminals, running commands). Then use `biolatency` during a `dd if=/dev/zero of=/tmp/test bs=1M count=1000` write. Interpret the latency histogram and explain the distribution shape for sequential vs. random I/O."
  ],
  cheatSheet: [
    "`uptime` -- load averages; compare to core count (`nproc`). Load/cores > 1.0 = **queuing**. Check `mpstat` to distinguish CPU-bound vs. I/O-bound load.",
    "`vmstat 1` -- `r` = run queue (CPU demand), `b` = blocked on I/O, `si/so` = **swap activity** (memory pressure), `us/sy/wa/id` = CPU breakdown",
    "`iostat -xz 1` -- `await` = I/O latency in ms, `%util` = device busy %, `r/s` + `w/s` = IOPS. **SSD**: await > 5ms is suspect; **HDD**: await > 20ms",
    "`perf record -g -p <pid> -- sleep 30` then `perf report` -- CPU profile with call graphs. Pipe through `stackcollapse-perf.pl | flamegraph.pl` for **flame graphs**",
    "`strace -c -p <pid>` -- syscall summary (count + time). Use `-e trace=network` for net issues, `-e trace=file` for file issues. **Warning**: 10-100x overhead",
    "`free -m` -- check `available` column (not `free`). `available` = reclaimable page cache + truly free. If available is low and `vmstat si/so > 0`, add RAM or reduce workload."
  ],
  revisionNotes: [
    "**Load average** includes both *runnable* (R) and *uninterruptible sleep* (D) processes on Linux. Compare to core count: load/cores > 1.0 means queuing. High load with low CPU utilization usually means **I/O saturation**, not CPU saturation -- check `iostat` and `vmstat wa%`.",
    "The **USE method** (Utilization, Saturation, Errors) is a systematic checklist applied to *each physical resource*: CPU, memory, disk, network. It prevents guessing by ensuring no resource is overlooked. Complement with the **RED method** (Rate, Errors, Duration) for application-level service metrics.",
    "`perf` uses **hardware performance counters** with sampling-based profiling at <5% overhead, making it safe for production. `strace` intercepts *every* syscall via `ptrace` with 10-100x overhead -- use it for debugging, not monitoring. **eBPF** (via bpftrace/BCC) offers <1% overhead tracing of arbitrary kernel and user-space functions.",
    "The **page cache** uses free RAM to buffer file I/O -- this is *normal* and beneficial. The `available` column in `free -m` shows reclaimable memory. Active **swapping** (`vmstat si/so > 0`) indicates real memory pressure. Tune `vm.swappiness` (lower = prefer evicting cache, higher = prefer swapping anonymous pages).",
    "**Flame graphs** visualize profiled stack traces: x-axis width = *cumulative sample count* (time spent), y-axis = call depth. The widest bars are the hottest code paths. Generated from `perf record -g` output via Brendan Gregg's `stackcollapse-perf.pl | flamegraph.pl` pipeline."
  ],
  resources: [
    {
      label: "Systems Performance — Brendan Gregg",
      kind: "book",
    },
    {
      label: "BPF Performance Tools — Brendan Gregg",
      kind: "book",
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
