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
