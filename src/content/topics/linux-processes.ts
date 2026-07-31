import type { TopicContent } from "../types";

export const linuxProcesses: TopicContent = {
  quickSummary: [
    "Every Linux process has a unique PID and is created via fork(), which clones the parent process, followed by exec() to replace the cloned image with a new program.",
    "Signals are asynchronous notifications sent to processes — SIGTERM requests graceful shutdown, SIGKILL forces immediate termination (cannot be caught), and SIGHUP traditionally signals configuration reload.",
    "Process states cycle through Running (R), Sleeping (S/D), Stopped (T), and Zombie (Z); a zombie is a terminated process whose parent has not yet called wait() to collect its exit status.",
    "systemd is the init system (PID 1) on most modern distributions, managing service lifecycles through unit files with dependency ordering, socket activation, and cgroup-based resource control.",
  ],
  detailed: [
    "## Process Creation: fork() and exec()\n\nLinux creates processes with the fork-exec model. `fork()` duplicates the calling process — the child gets a copy of the parent's memory (via copy-on-write), file descriptors, and environment. The child then calls `exec()` to replace its memory image with a new program binary. This two-step model lets the child set up redirections, change directories, or drop privileges between fork and exec. Modern Linux also offers `clone()` for fine-grained control over what is shared (used internally by `pthread_create`), and `posix_spawn()` as a combined fork+exec optimized for simple cases.",
    "## Process Identifiers and Hierarchy\n\nEach process has a PID (process ID), a PPID (parent PID), a UID (user), and belongs to a process group and session. PID 1 is the init process (systemd on modern systems) and adopts orphaned processes. Process groups enable job control — sending a signal to a group affects all members. Sessions group process groups under a controlling terminal. The `/proc/<pid>/` virtual filesystem exposes per-process information: `status`, `cmdline`, `fd/`, `maps`, `cgroup`, and more.",
    "## Signals and Signal Handling\n\nSignals are software interrupts delivered to processes. Key signals: SIGTERM (15) — polite termination request, catchable; SIGKILL (9) — immediate kill, cannot be caught or ignored; SIGINT (2) — interrupt from Ctrl+C; SIGHUP (1) — hangup, often used to reload config; SIGSTOP/SIGCONT — pause and resume; SIGCHLD — sent to parent when child exits. Processes install signal handlers with `sigaction()`. Signals can be blocked (masked) temporarily using `sigprocmask()`. Unhandled signals use default actions: terminate, core dump, ignore, or stop.",
    "## Process States\n\nThe kernel tracks each process in one of several states visible in `/proc/<pid>/status` and `ps` output:\n- **R (Running/Runnable)** — executing on a CPU or in the run queue\n- **S (Interruptible Sleep)** — waiting for an event (I/O, timer), wakes on signals\n- **D (Uninterruptible Sleep)** — waiting for I/O completion, cannot be killed (common in NFS hangs)\n- **T (Stopped)** — paused by SIGSTOP or debugger\n- **Z (Zombie)** — terminated but parent hasn't called wait(); occupies a PID slot\n- **X (Dead)** — transient, being removed from the process table",
    "## Zombie and Orphan Processes\n\nA zombie process has exited but its entry remains in the process table so the parent can retrieve its exit status via `wait()` or `waitpid()`. Zombies consume no CPU or memory but occupy a PID. Too many zombies can exhaust the PID space. If the parent dies without reaping its children, init (PID 1) adopts them and calls wait() automatically. To prevent zombies, parents should handle SIGCHLD or set `SA_NOCLDWAIT`. The `prctl(PR_SET_CHILD_SUBREAPER)` call lets a non-init process adopt orphans in its subtree.",
    "## systemd Service Management\n\nSystemd manages services through unit files (e.g., `/etc/systemd/system/myapp.service`). Key directives: `ExecStart` (command to run), `Restart=on-failure`, `WantedBy=multi-user.target` (enable on boot). `systemctl start|stop|restart|status <unit>` controls services. `journalctl -u <unit>` reads logs. Systemd uses cgroups to track all processes spawned by a service, ensuring none escape cleanup on stop. Socket activation lets systemd listen on a port and start the service on first connection, reducing boot time and resource usage.",
  ],
  interviewQA: [
    {
      q: "What is the difference between fork() and exec(), and why does Linux separate them?",
      a: "fork() creates a child process as a copy of the parent (with copy-on-write memory). exec() replaces the current process image with a new program. They are separate so the child can modify its environment (redirect file descriptors, change uid, set up pipes) between fork and exec before the new program starts. This design enables features like shell pipelines and I/O redirection without the new program needing to know about them.",
      followUps: [
        "What is copy-on-write and why does it make fork() efficient?",
        "How does vfork() differ from fork()?",
        "What happens to open file descriptors across fork and exec?",
      ],
    },
    {
      q: "Why can SIGKILL not be caught, and when would you prefer SIGTERM?",
      a: "SIGKILL (signal 9) is handled directly by the kernel and never delivered to the process's signal handler — this guarantees the process is terminated even if it is hung or misbehaving. SIGTERM (signal 15) is the polite shutdown signal: the process can catch it to flush buffers, close connections, release locks, and clean up resources. Best practice is to send SIGTERM first, wait a timeout (e.g., 10 seconds), then send SIGKILL only if the process has not exited.",
      followUps: [
        "What happens if you SIGKILL a process in uninterruptible sleep (D state)?",
        "How does systemd handle the SIGTERM-then-SIGKILL pattern?",
      ],
    },
    {
      q: "What is a zombie process and how do you fix a zombie accumulation problem?",
      a: "A zombie is a process that has terminated but whose parent has not called wait() to read its exit status. The process entry stays in the kernel's process table. Zombies use no CPU or memory but consume a PID slot. To fix: (1) fix the parent to properly call wait() or handle SIGCHLD, (2) send SIGCHLD to the parent to prompt it, (3) if the parent is buggy, kill the parent — init will adopt and reap the zombies. You cannot kill a zombie directly because it is already dead.",
      followUps: [
        "What is the maximum number of PIDs on Linux and how do you change it?",
        "How does a process subreaper work?",
      ],
    },
    {
      q: "Explain the difference between interruptible and uninterruptible sleep states.",
      a: "In interruptible sleep (S), the process is waiting for an event but will wake up if it receives a signal — it can be killed with SIGTERM or SIGKILL. In uninterruptible sleep (D), the process is waiting for a critical I/O operation (typically disk or NFS) and cannot be interrupted by any signal, including SIGKILL. This ensures data integrity during I/O but means a hung NFS mount can create unkillable processes. The TASK_KILLABLE state (added in Linux 2.6.25) is a middle ground that allows SIGKILL during otherwise uninterruptible waits.",
    },
  ],
  mcqs: [
    {
      q: "Which signal cannot be caught or ignored by a process?",
      options: ["SIGTERM", "SIGINT", "SIGKILL", "SIGHUP"],
      answerIndex: 2,
      explanation:
        "SIGKILL (signal 9) is handled entirely by the kernel and is never delivered to the process's signal handler. This ensures any process can be forcibly terminated.",
    },
    {
      q: "What does a zombie process consume?",
      options: [
        "CPU time and memory",
        "Only a PID slot in the process table",
        "Disk I/O and network bandwidth",
        "Swap space",
      ],
      answerIndex: 1,
      explanation:
        "A zombie has already exited — its memory and resources are freed. It only retains an entry in the process table so the parent can read its exit status.",
    },
    {
      q: "What system call does a parent use to collect a terminated child's exit status?",
      options: ["exec()", "fork()", "wait()/waitpid()", "kill()"],
      answerIndex: 2,
      explanation:
        "wait() and waitpid() allow the parent to retrieve the child's exit status and remove the zombie entry from the process table.",
    },
    {
      q: "Which process state indicates a process waiting for I/O that cannot be interrupted by signals?",
      options: [
        "S (Interruptible Sleep)",
        "D (Uninterruptible Sleep)",
        "T (Stopped)",
        "Z (Zombie)",
      ],
      answerIndex: 1,
      explanation:
        "The D state means the process is in uninterruptible sleep, typically waiting for disk or network I/O to complete. Even SIGKILL cannot wake it.",
    },
    {
      q: "What is the PID of the init/systemd process?",
      options: ["0", "1", "It varies", "-1"],
      answerIndex: 1,
      explanation:
        "The init process always has PID 1. It is the first user-space process started by the kernel and is responsible for adopting orphaned processes.",
    },
  ],
  flashcards: [
    {
      front: "What does fork() return to the child process?",
      back: "0. The parent receives the child's PID, and on error fork() returns -1.",
    },
    {
      front: "What signal does Ctrl+C send?",
      back: "SIGINT (signal 2) — sent to the foreground process group.",
    },
    {
      front: "What is copy-on-write (COW) in the context of fork()?",
      back: "The kernel marks the parent's memory pages as read-only and shares them with the child. A page is physically copied only when either process writes to it, making fork() fast even for large processes.",
    },
    {
      front: "How do you reload a daemon's configuration without restarting it?",
      back: "Send SIGHUP (signal 1) — by convention, daemons catch SIGHUP and re-read their configuration files.",
    },
    {
      front: "What is the difference between a process group and a session?",
      back: "A process group is a set of related processes (e.g., a pipeline). A session groups process groups under a controlling terminal. The session leader is typically the login shell.",
    },
    {
      front: "What command shows the process tree on Linux?",
      back: "pstree — displays processes in a hierarchical tree showing parent-child relationships. Also: ps auxf or ps --forest.",
    },
    {
      front: "What is PID namespace isolation?",
      back: "A Linux namespace feature where processes inside the namespace see their own PID numbering starting from 1, isolated from the host's PID space. Used by containers.",
    },
    {
      front: "What does the nice value control?",
      back: "The scheduling priority of a process. Values range from -20 (highest priority) to 19 (lowest). Only root can set negative nice values. Adjusted with nice/renice commands.",
    },
  ],
  deepDive: [
    "## The fork/exec Model and Copy-on-Write Internals\n\nWhen a process calls `fork()`, the kernel does **not** immediately duplicate the parent's entire address space. Instead, it uses **copy-on-write (COW)**: both parent and child share the same physical memory pages, which are marked *read-only* at the page-table level. Only when either process attempts to *write* to a shared page does the kernel trap the page fault, allocate a new physical page, copy the old contents, and update the faulting process's page table to point to the new page. This makes `fork()` extremely fast -- O(1) for the page table duplication rather than O(n) for the full memory copy. The `clone()` system call generalizes this further: it accepts *flags* that control exactly which resources are shared between parent and child -- `CLONE_VM` shares memory (used by `pthread_create`), `CLONE_FS` shares filesystem info, `CLONE_FILES` shares the file descriptor table, and `CLONE_NEWPID` creates a new PID namespace (used by containers). Understanding this layered sharing model is essential for grasping how **threads**, **processes**, and **containers** differ at the kernel level -- they are all variations of `clone()` with different sharing flags.",

    "## The CFS Scheduler and Process Priority\n\nThe Linux **Completely Fair Scheduler (CFS)**, introduced in kernel 2.6.23, replaced the O(1) scheduler with a design based on *weighted fair queuing*. CFS maintains a **red-black tree** of runnable tasks, ordered by their `vruntime` (virtual runtime) -- the amount of CPU time a task has consumed, weighted by its priority. The task with the *lowest* `vruntime` is always selected next, ensuring fairness. The **nice value** (-20 to +19) adjusts the weight: a process with nice -20 receives roughly *80x* more CPU than one at nice +19. CFS does not use fixed time slices; instead, it calculates a *target latency* (typically 6ms for fewer than 8 tasks) and divides it proportionally among runnable tasks by weight. For real-time workloads, Linux provides the `SCHED_FIFO` and `SCHED_RR` policies (configured via `chrt`), which *always preempt* CFS tasks. The `SCHED_DEADLINE` policy, added in kernel 3.14, implements **Earliest Deadline First (EDF)** scheduling for hard real-time guarantees with explicit *runtime*, *deadline*, and *period* parameters. Understanding these scheduler classes is critical for tuning latency-sensitive services -- a database might use `ionice` and `nice` together, while a real-time audio application needs `SCHED_FIFO`.",

    "## Namespaces, cgroups, and Container Isolation\n\nLinux **namespaces** provide the *isolation* layer for containers. There are eight namespace types: **PID** (isolated process ID numbering), **NET** (separate network stack), **MNT** (independent mount table), **UTS** (hostname), **IPC** (inter-process communication), **USER** (UID/GID mapping), **CGROUP** (cgroup root view), and **TIME** (separate boot and monotonic clocks). Each container operates within its own set of namespaces, seeing PID 1 as its init process, its own `/proc`, its own network interfaces, and its own hostname. **Control groups (cgroups)** complement namespaces by providing *resource control*: `cpu.max` limits CPU bandwidth, `memory.max` caps memory usage (the kernel's **OOM killer** enforces this), `io.max` throttles disk I/O, and `pids.max` limits the number of processes. Together, namespaces and cgroups form the foundation of container runtimes like **Docker** and **containerd** -- the `unshare` and `nsenter` commands let you create and enter namespaces manually, which is invaluable for debugging containerized workloads. The `cgroup v2` unified hierarchy (default since kernel 5.0) simplifies management by presenting a single tree instead of the per-controller trees of cgroup v1."
  ],
  code: [
    {
      language: "bash",
      caption: "Process management and inspection commands",
      source: `# View process tree with PIDs
pstree -p

# Show detailed process info from /proc
cat /proc/self/status | head -20
cat /proc/self/cmdline | tr '\\0' ' '

# List all file descriptors for a process
ls -la /proc/$(pgrep nginx | head -1)/fd/

# Send signals to processes
kill -SIGTERM 1234          # polite shutdown
kill -SIGKILL 1234          # force kill
kill -SIGHUP $(pgrep nginx) # reload config
killall -SIGUSR1 myapp      # custom signal by name

# Find zombie processes
ps aux | awk '$8 == "Z" { print }'

# Show process states and resource usage
ps -eo pid,ppid,stat,ni,pri,%cpu,%mem,comm --sort=-%cpu | head -20

# Process priority management
nice -n 10 ./cpu-heavy-task       # start with lower priority
sudo renice -n -5 -p 1234        # elevate running process
sudo chrt -f 99 ./realtime-task  # SCHED_FIFO real-time

# cgroup resource limits (cgroup v2)
sudo mkdir /sys/fs/cgroup/mygroup
echo "50000 100000" | sudo tee /sys/fs/cgroup/mygroup/cpu.max  # 50% CPU
echo "536870912" | sudo tee /sys/fs/cgroup/mygroup/memory.max  # 512MB
echo $$ | sudo tee /sys/fs/cgroup/mygroup/cgroup.procs         # add self`
    },
    {
      language: "cpp",
      caption: "C++ system calls: fork(), exec(), wait(), and signal handling",
      source: `#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>
#include <iostream>
#include <cstdlib>
#include <cstring>

// Signal handler for SIGCHLD -- reap children to prevent zombies
volatile sig_atomic_t child_exited = 0;

void sigchld_handler(int /*sig*/) {
    // Reap all terminated children (non-blocking)
    while (waitpid(-1, nullptr, WNOHANG) > 0) {}
    child_exited = 1;
}

// Demonstrate fork() + exec() pattern
void spawn_process(const char* program, char* const argv[]) {
    pid_t pid = fork();

    if (pid == -1) {
        perror("fork");
        return;
    }

    if (pid == 0) {
        // --- Child process ---
        // Redirect stdout to a file (between fork and exec)
        // This is WHY fork and exec are separate
        freopen("/tmp/child_output.log", "w", stdout);

        // Replace process image with new program
        execvp(program, argv);
        perror("execvp");  // only reached on error
        _exit(127);
    }

    // --- Parent process ---
    std::cout << "Spawned child PID: " << pid << "\\n";
}

int main() {
    // Install SIGCHLD handler to auto-reap children
    struct sigaction sa;
    std::memset(&sa, 0, sizeof(sa));
    sa.sa_handler = sigchld_handler;
    sa.sa_flags = SA_RESTART | SA_NOCLDSTOP;
    sigaction(SIGCHLD, &sa, nullptr);

    // Spawn 'ls -la /tmp'
    char* const args[] = {
        const_cast<char*>("ls"),
        const_cast<char*>("-la"),
        const_cast<char*>("/tmp"),
        nullptr
    };
    spawn_process("ls", args);

    // Parent continues doing work...
    sleep(1);
    std::cout << "Child exited: "
              << (child_exited ? "yes" : "no") << "\\n";
    return 0;
}`
    },
    {
      language: "bash",
      caption: "Namespace and cgroup exploration for container internals",
      source: `# Create a new PID namespace (process sees its own PID 1)
sudo unshare --pid --fork --mount-proc bash -c '
    echo "My PID inside namespace: $$"
    ps aux
    exit
'

# Enter an existing container's namespaces
CONTAINER_PID=$(docker inspect -f '{{.State.Pid}}' my-container)
sudo nsenter -t $CONTAINER_PID -m -u -i -n -p -- /bin/bash

# List namespaces for a process
ls -la /proc/self/ns/

# Monitor cgroup resource usage
cat /sys/fs/cgroup/mygroup/cpu.stat
cat /sys/fs/cgroup/mygroup/memory.current
cat /sys/fs/cgroup/mygroup/pids.current

# systemd service with resource limits (unit file excerpt)
# [Service]
# ExecStart=/usr/bin/myapp
# MemoryMax=1G
# CPUQuota=200%
# TasksMax=100
# Restart=on-failure`
    }
  ],
  diagrams: [
    {
      title: "Process Lifecycle State Machine",
      kind: "state",
      caption: "Transitions between Linux process states from creation to termination",
      mermaid: `stateDiagram-v2
    [*] --> Created: fork()
    Created --> Runnable_R: Scheduled
    Runnable_R --> Running: CPU dispatched
    Running --> Runnable_R: Preempted / yield
    Running --> Sleeping_S: wait for event
    Running --> Sleeping_D: wait for I/O
    Running --> Stopped_T: SIGSTOP / ptrace
    Running --> Zombie_Z: exit()
    Sleeping_S --> Runnable_R: event / signal
    Sleeping_D --> Runnable_R: I/O complete
    Stopped_T --> Runnable_R: SIGCONT
    Zombie_Z --> [*]: parent wait()`
    },
    {
      title: "fork() + exec() Sequence",
      kind: "sequence",
      caption: "The two-step process creation model showing COW memory sharing and image replacement",
      mermaid: `sequenceDiagram
    participant Parent
    participant Kernel
    participant Child

    Parent->>Kernel: fork()
    Kernel->>Kernel: Clone page tables (COW)
    Kernel->>Child: Create child (PID=new)
    Kernel-->>Parent: Returns child PID
    Kernel-->>Child: Returns 0

    Note over Child: Set up redirections,<br/>drop privileges

    Child->>Kernel: execve("/usr/bin/app", ...)
    Kernel->>Kernel: Load ELF binary,<br/>replace address space
    Kernel-->>Child: Start executing new program

    Child->>Kernel: exit(status)
    Kernel->>Parent: SIGCHLD
    Parent->>Kernel: waitpid(child_pid)
    Kernel-->>Parent: Returns exit status
    Note over Kernel: Zombie entry removed`
    },
    {
      title: "Container Isolation Architecture",
      kind: "architecture",
      caption: "How namespaces and cgroups combine to create container isolation",
      mermaid: `graph TB
    subgraph Host_Kernel
        NS["Namespace Layer"]
        CG["Cgroup Layer"]
        SCHED["CFS Scheduler"]
    end

    subgraph Container_A["Container A"]
        PID_A["PID NS<br/>(PID 1 = app)"]
        NET_A["NET NS<br/>(eth0, veth)"]
        MNT_A["MNT NS<br/>(own root /)"]
        CPU_A["cpu.max: 50%"]
        MEM_A["memory.max: 1G"]
    end

    subgraph Container_B["Container B"]
        PID_B["PID NS<br/>(PID 1 = nginx)"]
        NET_B["NET NS<br/>(eth0, veth)"]
        MNT_B["MNT NS<br/>(own root /)"]
        CPU_B["cpu.max: 100%"]
        MEM_B["memory.max: 2G"]
    end

    PID_A --> NS
    NET_A --> NS
    MNT_A --> NS
    PID_B --> NS
    NET_B --> NS
    MNT_B --> NS
    CPU_A --> CG
    MEM_A --> CG
    CPU_B --> CG
    MEM_B --> CG
    CG --> SCHED`
    }
  ],
  comparison: {
    columns: ["Aspect", "fork()", "vfork()", "clone()", "posix_spawn()"],
    rows: [
      ["**Memory Semantics**", "COW copy of parent", "Shares parent memory (unsafe)", "Configurable via flags", "Implementation-defined"],
      ["**Use Case**", "General process creation", "Legacy, immediate exec()", "Threads, containers", "Simple fork+exec replacement"],
      ["**File Descriptors**", "Copied (COW)", "Shared with parent", "Shared or copied (flag)", "Configurable via attributes"],
      ["**PID Namespace**", "Inherits parent", "Inherits parent", "`CLONE_NEWPID` creates new", "Inherits parent"],
      ["**Signal Handling**", "Copied from parent", "Copied from parent", "`CLONE_SIGHAND` shares", "Reset to defaults on exec"],
      ["**Performance**", "Fast (COW pages)", "Faster (no page table copy)", "Varies by flags", "Optimized by libc"],
      ["**Safety**", "Safe", "*Dangerous* -- must exec immediately", "Complex, needs care", "Safe, limited flexibility"],
      ["**Thread Creation**", "No (full process)", "No", "Yes (`CLONE_VM | CLONE_THREAD`)", "No"]
    ]
  },
  exercises: [
    "**Zombie Factory**: Write a C program that creates 10 child processes that immediately `exit()`, while the parent sleeps for 60 seconds without calling `wait()`. Use `ps aux | grep Z` in another terminal to observe the zombies. Then fix the program by installing a `SIGCHLD` handler that calls `waitpid(-1, NULL, WNOHANG)` in a loop.",
    "**Signal Relay Chain**: Create a chain of 3 processes (grandparent -> parent -> child). Have the grandparent send `SIGUSR1` to the parent, which forwards `SIGUSR2` to the child. Each process should print its PID and the signal received. Use `sigaction()` for handler registration and verify with `strace -e signal`.",
    "**Priority Inversion Demonstration**: Launch two CPU-bound tasks: one at `nice -20` and one at `nice 19`. Use `top` to observe their CPU consumption ratio. Then add a third task at default priority and observe how CFS redistributes CPU time. Document the `vruntime` progression using `/proc/<pid>/sched`.",
    "**Namespace Sandbox**: Use `unshare --pid --net --mount --fork` to create an isolated environment. Inside, verify that `ps` shows only your processes, `ip addr` shows no network interfaces, and mounts are independent. Create a file inside a tmpfs mount, exit the namespace, and confirm the file is gone.",
    "**Systemd Service Lab**: Write a systemd unit file for a simple shell script that logs timestamps. Configure `Restart=on-failure`, `MemoryMax=100M`, and `CPUQuota=25%`. Start the service, verify with `systemctl status` and `journalctl -u`, then deliberately crash it to observe the restart behavior and cgroup enforcement."
  ],
  cheatSheet: [
    "`ps aux` -- all processes with CPU/MEM %; `ps -eo pid,ppid,stat,comm` -- custom columns; `pstree -p` -- tree with PIDs",
    "`kill -SIGTERM <pid>` -- graceful stop; `kill -9 <pid>` -- **force kill**; `kill -SIGHUP <pid>` -- reload config; `killall -u user` -- kill all by user",
    "`top` then press `1` for per-core, `M` for memory sort, `P` for CPU sort; `htop` for interactive tree view with `F5`",
    "`nice -n 10 cmd` -- start with *lower* priority; `sudo renice -5 -p <pid>` -- change running process; `chrt -f 99 cmd` -- **SCHED_FIFO** real-time",
    "`strace -fp <pid>` -- trace syscalls with children; `lsof -p <pid>` -- open files; `cat /proc/<pid>/status` -- detailed process info",
    "`systemctl start|stop|restart|status <unit>` -- service control; `journalctl -u <unit> -f` -- follow logs; `systemd-cgls` -- cgroup tree"
  ],
  revisionNotes: [
    "`fork()` creates a child process using **copy-on-write** -- page tables are cloned but physical pages are shared until a write occurs. The child calls `exec()` to load a new program. They are *separate* system calls so the child can set up redirections, drop privileges, or close file descriptors **between** fork and exec.",
    "**Signals** are asynchronous notifications: `SIGTERM` (15) is catchable for graceful shutdown, `SIGKILL` (9) is *uncatchable* and handled by the kernel directly, `SIGHUP` (1) conventionally triggers config reload. Install handlers with `sigaction()`, block signals with `sigprocmask()`.",
    "A **zombie** (Z state) is a process that has exited but whose parent has not called `wait()`. It consumes only a PID slot. Fix by: making the parent handle `SIGCHLD`, calling `waitpid()`, or killing the parent so **init** (PID 1) adopts and reaps the orphans.",
    "The **CFS scheduler** uses a red-black tree sorted by `vruntime`. The process with the lowest vruntime runs next. Nice values adjust weight: nice -20 gets ~80x more CPU than nice +19. Real-time policies (`SCHED_FIFO`, `SCHED_RR`, `SCHED_DEADLINE`) always preempt CFS tasks.",
    "**Namespaces** provide isolation (PID, NET, MNT, UTS, IPC, USER, CGROUP, TIME) and **cgroups** provide resource limits (CPU, memory, I/O, PIDs). Together they form the foundation of Linux containers. `unshare` creates namespaces; `nsenter` enters them; cgroup v2 uses a unified hierarchy."
  ],
  glossary: [
    {
      term: "PID",
      definition:
        "Process Identifier — a unique integer assigned by the kernel to each running process.",
    },
    {
      term: "fork()",
      definition:
        "System call that creates a new child process by duplicating the calling process with copy-on-write semantics.",
    },
    {
      term: "exec()",
      definition:
        "Family of system calls (execve, execvp, etc.) that replace the current process image with a new program.",
    },
    {
      term: "SIGTERM",
      definition:
        "Signal 15 — a catchable termination request that allows the process to clean up before exiting.",
    },
    {
      term: "SIGKILL",
      definition:
        "Signal 9 — an uncatchable termination signal handled by the kernel that immediately ends the process.",
    },
    {
      term: "Zombie process",
      definition:
        "A terminated process whose entry remains in the process table because its parent has not yet called wait() to collect its exit status.",
    },
    {
      term: "systemd",
      definition:
        "The init system (PID 1) on most modern Linux distributions, managing service lifecycles, logging, and system state through unit files.",
    },
    {
      term: "cgroup",
      definition:
        "Control group — a kernel mechanism for organizing processes into hierarchical groups and applying resource limits (CPU, memory, I/O) to each group.",
    },
  ],
};
