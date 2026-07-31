import type { TopicContent } from "../types";

export const cpuScheduling: TopicContent = {
  quickSummary: [
    "CPU scheduling determines which process in the ready queue gets the CPU next, aiming to maximize throughput, minimize latency, and ensure fairness.",
    "Scheduling algorithms are either preemptive (the OS can forcibly reclaim the CPU) or non-preemptive (a process runs until it voluntarily yields or terminates).",
    "Key metrics include turnaround time, waiting time, response time, throughput, and CPU utilization.",
    "Modern OSes use sophisticated multi-level feedback queues or fair-share schedulers like Linux's Completely Fair Scheduler (CFS).",
  ],
  detailed: [
    "The CPU scheduler (also called the short-term scheduler) selects a process from the ready queue and dispatches it to the CPU. This decision happens when a process switches from running to waiting, from running to ready (preempted), from waiting to ready, or when a process terminates. In non-preemptive scheduling, only the first and last of these trigger scheduling decisions.",
    "First-Come, First-Served (FCFS) is the simplest algorithm: processes are served in arrival order. It is non-preemptive and suffers from the convoy effect, where short processes stuck behind a long one experience inflated waiting times. Shortest Job First (SJF) minimizes average waiting time by selecting the process with the smallest burst time, but requires knowing burst lengths in advance, which is typically estimated using exponential averaging of past bursts.",
    "Round Robin (RR) assigns a fixed time quantum to each process in circular order. It provides good response time for interactive systems but introduces context-switch overhead. Choosing the quantum is critical: too large and it degenerates into FCFS; too small and context-switch overhead dominates. A typical quantum is 10-100 milliseconds.",
    "Priority scheduling assigns each process a priority and runs the highest-priority process first. It can be preemptive or non-preemptive. The main danger is starvation of low-priority processes, which is solved by aging -- gradually increasing the priority of waiting processes over time.",
    "The Multi-Level Feedback Queue (MLFQ) uses multiple ready queues with different priorities and scheduling algorithms. New processes enter the highest-priority queue; if they use their full time quantum, they are demoted to a lower queue. I/O-bound processes naturally stay in high-priority queues, while CPU-bound processes sink. Linux CFS takes a different approach: it models an ideal processor that gives each task an equal share of CPU time, using a red-black tree keyed by virtual runtime (vruntime) to always pick the process that has received the least CPU time so far.",
  ],
  deepDive: [
    "Shortest Remaining Time First (SRTF) is the preemptive version of SJF. When a new process arrives with a burst shorter than the remaining burst of the running process, the running process is preempted. SRTF is provably optimal for minimizing average waiting time among all preemptive algorithms, but it requires continuous knowledge of remaining burst times and can cause starvation of long processes.",
    "Linux's Completely Fair Scheduler (CFS) uses a red-black tree of runnable tasks, keyed by their virtual runtime (vruntime). The task with the smallest vruntime is always selected. The vruntime of a running task advances proportionally to wall-clock time divided by its weight (derived from the nice value). This means high-priority tasks accumulate vruntime more slowly, getting more CPU time. CFS targets a configurable scheduling latency (sysctl_sched_latency, default 6ms on many kernels) divided among all runnable tasks, with a minimum granularity per task (sysctl_sched_min_granularity, default 0.75ms). The scheduler runs in O(log n) time for insertions and O(1) for selecting the leftmost node.",
    "Real-time scheduling in POSIX systems uses two policies: SCHED_FIFO (run until voluntary yield or preemption by higher-priority RT task) and SCHED_RR (like FIFO but with time-slicing among same-priority RT tasks). Real-time tasks always preempt normal tasks. The kernel provides priority inheritance protocols to handle priority inversion, where a high-priority task is blocked by a low-priority task holding a needed resource.",
    "Multiprocessor scheduling introduces additional complexities: load balancing (push and pull migration), processor affinity (keeping a process on the same core for cache warmth), NUMA-awareness (scheduling processes near their memory), and the scalability of the scheduler's data structures themselves. Per-CPU run queues with periodic load balancing (as in CFS) avoid a single global lock bottleneck.",
    "The O(1) scheduler that preceded CFS in Linux (2.6.0-2.6.22) used two arrays of 140 priority queues -- active and expired. It achieved constant-time scheduling by using a bitmap to find the highest-priority non-empty queue. However, its interactivity heuristics were complex and brittle, motivating the switch to CFS's simpler fairness model.",
  ],
  code: [
    {
      language: "cpp",
      caption: "Round Robin scheduling simulation",
      source: `#include <iostream>
#include <vector>
#include <queue>
#include <string>

struct ProcessResult {
    std::string name;
    int completion;
    int turnaround;
    int waiting;
};

// Simulate Round Robin scheduling.
// Returns (completion_time, turnaround_time, waiting_time) for each process.
std::vector<ProcessResult> roundRobin(
    const std::vector<std::string>& processes,
    const std::vector<int>& burstTimes,
    int quantum)
{
    int n = static_cast<int>(processes.size());
    std::vector<int> remaining(burstTimes.begin(), burstTimes.end());
    std::queue<int> q;
    for (int i = 0; i < n; ++i) q.push(i);

    int time = 0;
    std::vector<int> completion(n, 0);

    while (!q.empty()) {
        int i = q.front(); q.pop();
        int run = std::min(remaining[i], quantum);
        time += run;
        remaining[i] -= run;
        if (remaining[i] == 0) {
            completion[i] = time;
        } else {
            q.push(i);
        }
    }

    std::vector<ProcessResult> results;
    for (int i = 0; i < n; ++i) {
        int turnaround = completion[i];  // assuming arrival=0
        int waiting = turnaround - burstTimes[i];
        results.push_back({processes[i], completion[i], turnaround, waiting});
    }
    return results;
}

int main() {
    // Example: P1=10, P2=5, P3=8 with quantum=3
    auto result = roundRobin({"P1", "P2", "P3"}, {10, 5, 8}, 3);
    for (const auto& r : result) {
        std::cout << r.name << ": completion=" << r.completion
                  << ", turnaround=" << r.turnaround
                  << ", waiting=" << r.waiting << "\\n";
    }
    return 0;
}`,
    },
    {
      language: "cpp",
      caption: "Shortest Job First (non-preemptive) scheduling",
      source: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <tuple>

struct Process {
    std::string name;
    int arrival;
    int burst;
};

struct SjfResult {
    std::string name;
    int completion;
    int turnaround;
    int waiting;
};

// SJF non-preemptive scheduling.
std::vector<SjfResult> sjfNonPreemptive(std::vector<Process> procs) {
    // Sort by arrival time, then burst time
    std::sort(procs.begin(), procs.end(), [](const Process& a, const Process& b) {
        return std::tie(a.arrival, a.burst) < std::tie(b.arrival, b.burst);
    });

    std::vector<SjfResult> completed;
    std::vector<Process> remaining = procs;
    int time = 0;

    while (!remaining.empty()) {
        // Find processes that have arrived by current time
        std::vector<Process*> available;
        for (auto& p : remaining) {
            if (p.arrival <= time) available.push_back(&p);
        }
        if (available.empty()) {
            time = remaining.front().arrival;  // jump to next arrival
            continue;
        }
        // Pick the one with shortest burst
        auto chosen = *std::min_element(available.begin(), available.end(),
            [](const Process* a, const Process* b) { return a->burst < b->burst; });

        time += chosen->burst;
        int turnaround = time - chosen->arrival;
        int waiting = turnaround - chosen->burst;
        completed.push_back({chosen->name, time, turnaround, waiting});

        // Remove chosen from remaining
        remaining.erase(
            std::remove_if(remaining.begin(), remaining.end(),
                [&](const Process& p) { return &p == chosen; }),
            remaining.end());
    }
    return completed;
}

int main() {
    std::vector<Process> procs = {
        {"P1", 0, 7}, {"P2", 2, 4}, {"P3", 4, 1}, {"P4", 5, 4}
    };
    for (const auto& r : sjfNonPreemptive(procs)) {
        std::cout << r.name << ": completion=" << r.completion
                  << ", turnaround=" << r.turnaround
                  << ", waiting=" << r.waiting << "\\n";
    }
    return 0;
}`,
    },
    {
      language: "c",
      caption: "Simplified CFS-style scheduler using vruntime (pseudocode in C)",
      source: `#include <stdio.h>
#include <limits.h>

#define MAX_TASKS 10

typedef struct {
    int pid;
    int nice;          // -20 to 19
    long vruntime;     // virtual runtime in nanoseconds
    int remaining_ms;  // remaining burst
} Task;

// Weight derived from nice value (simplified)
int nice_to_weight(int nice) {
    // Linux uses a piecewise table; simplified here
    return 1024 / (1 << (nice + 20) / 5 + 1);  // rough approximation
}

// Pick task with smallest vruntime (CFS core logic)
int pick_next(Task tasks[], int n) {
    int min_idx = -1;
    long min_vr = LONG_MAX;
    for (int i = 0; i < n; i++) {
        if (tasks[i].remaining_ms > 0 && tasks[i].vruntime < min_vr) {
            min_vr = tasks[i].vruntime;
            min_idx = i;
        }
    }
    return min_idx;
}

void cfs_simulate(Task tasks[], int n, int slice_ms) {
    int time = 0;
    while (1) {
        int idx = pick_next(tasks, n);
        if (idx < 0) break;
        int run = (tasks[idx].remaining_ms < slice_ms)
                  ? tasks[idx].remaining_ms : slice_ms;
        tasks[idx].remaining_ms -= run;
        // vruntime advances inversely proportional to weight
        int w = nice_to_weight(tasks[idx].nice);
        tasks[idx].vruntime += (long)run * 1024 / w;
        time += run;
        printf("t=%d: ran PID %d for %dms (vruntime=%ld)\\n",
               time, tasks[idx].pid, run, tasks[idx].vruntime);
    }
}`,
    },
  ],
  diagrams: [
    {
      title: "Process state transitions",
      kind: "state",
      caption: "New -> Ready -> Running -> (Waiting | Terminated). Running can be preempted back to Ready.",
    },
    {
      title: "Multi-Level Feedback Queue structure",
      kind: "architecture",
      caption: "Multiple queues at different priority levels. Processes move between queues based on CPU burst behavior.",
    },
    {
      title: "CFS red-black tree",
      kind: "architecture",
      caption: "Tasks ordered by vruntime in a red-black tree. The leftmost node (smallest vruntime) is always selected next.",
    },
  ],
  animations: [
    {
      title: "Round Robin scheduling with quantum = 4",
      steps: [
        { label: "t=0: P1 starts", detail: "P1 (burst=10) begins execution. Ready queue: [P2(4), P3(6)]." },
        { label: "t=4: P1 preempted", detail: "P1 used its quantum (4ms). Remaining=6. P1 goes to back of queue. P2 runs next." },
        { label: "t=8: P2 completes", detail: "P2 (burst=4) finishes within its quantum. P3 runs next." },
        { label: "t=12: P3 preempted", detail: "P3 used its quantum (4ms). Remaining=2. P3 goes to back. P1 runs." },
        { label: "t=16: P1 preempted", detail: "P1 used quantum (4ms). Remaining=2. P3 runs." },
        { label: "t=18: P3 completes", detail: "P3 finishes (2ms remaining). P1 runs." },
        { label: "t=20: P1 completes", detail: "P1 finishes (2ms remaining). All processes complete. Average turnaround = (20+8+18)/3 = 15.3ms." },
      ],
    },
  ],
  comparison: {
    columns: ["Algorithm", "Preemptive?", "Starvation?", "Convoy Effect?", "Optimal Avg Wait?", "Complexity", "Used In"],
    rows: [
      ["FCFS", "No", "No", "Yes", "No", "O(1)", "Simple batch systems"],
      ["SJF", "No", "Yes (long jobs)", "No", "Yes (non-preemptive)", "O(n)", "Theoretical benchmark"],
      ["SRTF", "Yes", "Yes (long jobs)", "No", "Yes (all preemptive)", "O(n)", "Theoretical benchmark"],
      ["Round Robin", "Yes", "No", "No", "No", "O(1)", "Time-sharing systems"],
      ["Priority", "Both", "Yes (low priority)", "No", "No", "O(n) or O(log n)", "General-purpose OS"],
      ["MLFQ", "Yes", "Mitigated by aging", "No", "No", "O(1)", "Windows, older Unix"],
      ["CFS", "Yes", "No (fair share)", "No", "No", "O(log n)", "Linux 2.6.23+"],
    ],
  },
  interviewQA: [
    {
      q: "What is the convoy effect and which scheduling algorithm suffers from it?",
      a: "The convoy effect occurs when many short processes pile up behind a single long-running process, inflating average waiting times. FCFS scheduling suffers from this because it serves processes strictly in arrival order with no preemption. A single CPU-bound process with a long burst can force all subsequent I/O-bound processes to wait, leading to poor overall throughput and high average turnaround times.",
      followUps: [
        "How does Round Robin avoid the convoy effect?",
        "Can priority scheduling suffer from a similar problem?",
      ],
    },
    {
      q: "How does Linux's CFS scheduler work?",
      a: "CFS maintains a red-black tree of all runnable tasks, keyed by their virtual runtime (vruntime). The task with the smallest vruntime is always selected next, ensuring fairness. Each task's vruntime advances proportionally to wall-clock time but inversely proportional to its weight (derived from its nice value). Higher-priority tasks (lower nice) have higher weight, so their vruntime advances more slowly, granting them more CPU time. CFS aims for a target scheduling latency divided among all runnable tasks, with a minimum granularity to prevent excessive context switching.",
      followUps: [
        "What data structure does CFS use and why?",
        "How does CFS handle newly created processes?",
        "What is the relationship between nice values and CPU shares?",
      ],
    },
    {
      q: "Explain the difference between preemptive and non-preemptive scheduling.",
      a: "In non-preemptive (cooperative) scheduling, once a process is allocated the CPU, it keeps it until it terminates or voluntarily enters a waiting state (e.g., for I/O). In preemptive scheduling, the OS can forcibly remove the CPU from a running process -- typically when a higher-priority process arrives or when the running process's time quantum expires. Preemptive scheduling provides better responsiveness and fairness but introduces overhead from context switches and requires careful synchronization to protect shared data that might be modified mid-operation.",
    },
    {
      q: "What is starvation in CPU scheduling, and how is it addressed?",
      a: "Starvation occurs when a process waits indefinitely because higher-priority or shorter processes keep being selected. SJF can starve long processes, and priority scheduling can starve low-priority ones. The standard solution is aging: gradually increasing the priority of waiting processes over time. In MLFQ, periodic priority boosts move all processes to the highest queue, preventing indefinite starvation. CFS inherently avoids starvation because every task accumulates vruntime while waiting; a starved task would have the smallest vruntime and be selected next.",
      followUps: [
        "How does MLFQ implement aging?",
        "Can Round Robin cause starvation?",
      ],
    },
    {
      q: "How do you choose the right time quantum for Round Robin scheduling?",
      a: "The quantum must balance responsiveness and overhead. If the quantum is too large, RR degenerates into FCFS. If too small, context-switch overhead (saving/restoring registers, flushing TLB, cache pollution) dominates useful work. A rule of thumb is that the quantum should be large enough that 80% of CPU bursts complete within one quantum -- typically 10-100ms. The quantum should also be significantly larger than the context-switch time (usually 1-10 microseconds on modern hardware). Some systems use adaptive quanta that adjust based on system load.",
    },
    {
      q: "What is priority inversion and how is it handled?",
      a: "Priority inversion occurs when a high-priority task is indirectly blocked by a low-priority task that holds a shared resource, while a medium-priority task preempts the low-priority task. The high-priority task is effectively running at the low-priority level. Solutions include priority inheritance (temporarily raising the lock holder's priority to match the highest-priority waiter) and priority ceiling (setting a task's priority to the highest priority of any task that might lock the same resource). The Mars Pathfinder incident in 1997 is a famous real-world example of priority inversion causing system resets.",
    },
  ],
  followUps: [
    "How does context switching interact with scheduling decisions?",
    "What role does CPU scheduling play in real-time operating systems?",
    "How do multicore processors change scheduling strategies?",
    "What is the relationship between I/O scheduling and CPU scheduling?",
    "How do containers and cgroups affect CPU scheduling in Linux?",
  ],
  mcqs: [
    {
      q: "Which scheduling algorithm is provably optimal for minimizing average waiting time?",
      options: ["FCFS", "Round Robin", "Shortest Remaining Time First (SRTF)", "Priority Scheduling"],
      answerIndex: 2,
      explanation: "SRTF (preemptive SJF) is provably optimal among all scheduling algorithms for minimizing average waiting time. It always runs the process with the shortest remaining burst.",
    },
    {
      q: "What data structure does Linux's CFS use to store runnable tasks?",
      options: ["Hash table", "Min-heap", "Red-black tree", "Linked list"],
      answerIndex: 2,
      explanation: "CFS uses a red-black tree keyed by vruntime, providing O(log n) insertion and O(1) access to the leftmost (minimum vruntime) node via a cached pointer.",
    },
    {
      q: "A Round Robin scheduler with a very large time quantum behaves like which algorithm?",
      options: ["SJF", "FCFS", "Priority scheduling", "SRTF"],
      answerIndex: 1,
      explanation: "With a large enough quantum, every process completes within its first turn, making RR equivalent to FCFS (no preemption occurs).",
    },
    {
      q: "Which problem is specific to FCFS scheduling?",
      options: ["Starvation", "Convoy effect", "Priority inversion", "Deadlock"],
      answerIndex: 1,
      explanation: "The convoy effect is unique to FCFS: short processes wait behind long ones. Starvation affects SJF/Priority, priority inversion affects priority scheduling, and deadlock is a synchronization issue.",
    },
    {
      q: "In MLFQ, what happens to a process that uses its entire time quantum?",
      options: [
        "It is terminated",
        "It stays in the same queue",
        "It is moved to a lower-priority queue",
        "It is moved to a higher-priority queue",
      ],
      answerIndex: 2,
      explanation: "MLFQ demotes CPU-intensive processes to lower-priority queues when they exhaust their quantum, while I/O-bound processes that yield before their quantum stays in higher queues.",
    },
    {
      q: "What technique prevents starvation in priority scheduling?",
      options: ["Increasing the time quantum", "Aging", "Using FCFS as a tiebreaker", "Reducing context-switch overhead"],
      answerIndex: 1,
      explanation: "Aging gradually increases the priority of long-waiting processes, ensuring they eventually get CPU time regardless of their initial priority.",
    },
  ],
  exercises: [
    "Given processes P1(arrival=0, burst=8), P2(arrival=1, burst=4), P3(arrival=2, burst=9), P4(arrival=3, burst=5), compute the average turnaround time and waiting time for FCFS, SJF, and Round Robin (quantum=3).",
    "Implement a Multi-Level Feedback Queue simulator with 3 levels: Q0 (RR, quantum=8), Q1 (RR, quantum=16), Q2 (FCFS). Track queue transitions and measure fairness.",
    "Write a program that simulates CFS by maintaining a sorted structure of (vruntime, pid) pairs. Assign different nice values and observe how CPU time is distributed.",
    "Analyze the trade-off between context-switch overhead and responsiveness by plotting average response time vs. quantum size for a given workload.",
    "Design a scheduling algorithm for a system with both real-time and best-effort tasks. How would you prevent starvation of best-effort tasks while meeting real-time deadlines?",
  ],
  flashcards: [
    { front: "What does the CPU scheduler (short-term scheduler) do?", back: "It selects a process from the ready queue and dispatches it to the CPU for execution." },
    { front: "What is the convoy effect?", back: "A phenomenon in FCFS scheduling where many short processes wait behind a single long-running process, increasing average waiting time." },
    { front: "What is the difference between turnaround time and waiting time?", back: "Turnaround time = completion time - arrival time (total time in system). Waiting time = turnaround time - burst time (time spent not running)." },
    { front: "How does CFS determine which process runs next?", back: "It picks the process with the smallest virtual runtime (vruntime) from a red-black tree, ensuring the least-served process always runs next." },
    { front: "What is aging in scheduling?", back: "Gradually increasing the priority of processes that have been waiting a long time, preventing starvation in priority-based scheduling." },
    { front: "What is the optimal time quantum for Round Robin?", back: "Large enough that ~80% of CPU bursts finish within one quantum (typically 10-100ms), and significantly larger than context-switch time." },
    { front: "What is MLFQ's key insight?", back: "It learns process behavior over time: I/O-bound processes stay in high-priority queues (they yield quickly), while CPU-bound processes sink to lower queues." },
    { front: "What is priority inversion?", back: "When a high-priority task is blocked by a low-priority task holding a resource, while medium-priority tasks preempt the low-priority one, effectively inverting priorities." },
    { front: "What scheduling algorithm does Linux use?", back: "Completely Fair Scheduler (CFS), which uses a red-black tree of tasks keyed by virtual runtime to provide proportional fair sharing." },
    { front: "What is the dispatcher?", back: "The module that gives CPU control to the process selected by the scheduler. It handles context switching, mode switching, and jumping to the correct program counter." },
  ],
  revisionNotes: [
    "CPU scheduling happens at four points: process goes to waiting, process is preempted, process moves from waiting to ready, process terminates.",
    "Non-preemptive scheduling only triggers at points 1 and 4; preemptive triggers at all four.",
    "FCFS: simple but convoy effect. SJF: optimal avg wait but needs burst prediction. SRTF: optimal preemptive but causes starvation.",
    "Round Robin: fair time-sharing with tunable quantum. Large quantum = FCFS. Small quantum = excessive overhead.",
    "Priority scheduling needs aging to prevent starvation. Priority inversion solved by priority inheritance.",
    "MLFQ: multiple queues, automatic demotion for CPU-bound, periodic boost to prevent starvation.",
    "CFS: vruntime-based fairness using red-black tree. O(log n) insert, O(1) pick-next. Nice values map to weights.",
    "Real-time scheduling (SCHED_FIFO, SCHED_RR) always preempts normal tasks.",
    "Multiprocessor scheduling: per-CPU queues, load balancing, processor affinity, NUMA awareness.",
  ],
  cheatSheet: [
    "FCFS: Non-preemptive, FIFO order, convoy effect, O(1)",
    "SJF: Non-preemptive, shortest burst first, optimal avg wait, needs burst prediction",
    "SRTF: Preemptive SJF, globally optimal avg wait, starvation risk",
    "RR: Preemptive, fixed quantum, no starvation, quantum 10-100ms typical",
    "Priority: Preemptive or not, use aging to prevent starvation",
    "MLFQ: Multiple queues, auto-demotion, periodic boost, Windows/older Unix",
    "CFS: Red-black tree by vruntime, proportional fair share, Linux 2.6.23+",
    "Turnaround = Completion - Arrival; Waiting = Turnaround - Burst; Response = FirstRun - Arrival",
    "Context switch cost: save/restore registers, flush TLB, cache pollution (~1-10us)",
    "Throughput = processes completed / time unit",
  ],
  resources: [
    { label: "Operating System Concepts (Silberschatz)", kind: "book", note: "Chapter 5 covers CPU scheduling algorithms in depth with worked examples." },
    { label: "Operating Systems: Three Easy Pieces (OSTEP)", kind: "book", note: "Free online textbook. Chapters on scheduling are excellent and accessible." },
    { label: "Linux kernel CFS documentation", kind: "docs", note: "Documentation/scheduler/sched-design-CFS.rst in the kernel source tree." },
    { label: "The Linux Completely Fair Scheduler", kind: "article", note: "IBM DeveloperWorks article explaining CFS internals with diagrams." },
    { label: "CPU Scheduling - Neso Academy", kind: "video", note: "Clear video lectures covering all major scheduling algorithms with Gantt chart examples." },
    { label: "Con Kolivas BFS scheduler", kind: "article", note: "Alternative Linux scheduler design that prioritizes desktop responsiveness." },
  ],
  glossary: [
    { term: "CPU burst", definition: "A continuous period during which a process uses the CPU without performing I/O." },
    { term: "Ready queue", definition: "The set of processes in memory that are ready and waiting to be assigned the CPU." },
    { term: "Dispatcher", definition: "The OS module that transfers CPU control to the process selected by the scheduler, performing context switches." },
    { term: "Turnaround time", definition: "Total time from process submission to completion: completion_time - arrival_time." },
    { term: "Waiting time", definition: "Total time a process spends in the ready queue: turnaround_time - burst_time." },
    { term: "Response time", definition: "Time from submission to the first CPU allocation (important for interactive systems)." },
    { term: "Throughput", definition: "Number of processes completed per unit of time." },
    { term: "Convoy effect", definition: "In FCFS, short processes queued behind a long one experience disproportionately high wait times." },
    { term: "Aging", definition: "Gradually increasing a process's priority over time to prevent starvation." },
    { term: "vruntime", definition: "Virtual runtime in CFS; tracks the weighted CPU time a task has received, used to determine scheduling order." },
    { term: "Time quantum", definition: "The maximum time a process can run before being preempted in Round Robin scheduling." },
    { term: "Starvation", definition: "When a process waits indefinitely because the scheduler perpetually selects other processes." },
  ],
};
